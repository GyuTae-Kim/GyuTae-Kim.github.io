import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  DynamicDrawUsage,
  EdgesGeometry,
  Euler,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  OrthographicCamera,
  Quaternion,
  Scene,
  ShapeUtils,
  SphereGeometry,
  TetrahedronGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ModelId, TINTS } from './viewport-data';

// Concept models for the home viewport, drawn like a CAD sheet: white faces, ink edges,
// numbered balloons. Units are millimetres; the part is built Z-up and turned Y-up.

const INK = 0x1e2522;
const BLUE = 0x2f5f9e;
const FACE = 0xfbfaf6;
const ACCENT = 0xa75534;

type P2 = [number, number];
type PartTag = 'stock' | 'pocket' | 'counterbore' | 'hole' | 'step' | 'fillet';
type PanelRole = 'side' | 'board' | 'shelf' | 'back' | 'door' | 'kick';

interface Note {
  anchor: Vector3;
  owner: Object3D;
}

// Text pinned to a point in the scene, such as a live dimension.
interface Label extends Note {
  text: string;
}

interface ModelView {
  root: Group;
  fitRadius: number;
  // Direction the camera starts from.
  view: Vector3;
  setLayer(layer: number): void;
  // A null entry hides that numbered balloon for now.
  notes(layer: number): (Note | null)[];
  update(time: number, dt: number): void;
  // Legend row the animation is on (-1 for none), a one-line caption for the stage,
  // and whether the layer has played through once.
  step?(): number;
  hud?(): string;
  done?(): boolean;
  labels?(): Label[];
}

// ---------- geometry helpers ----------

function arc(cx: number, cy: number, r: number, a0: number, a1: number, steps: number): P2[] {
  const pts: P2[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((a0 + ((a1 - a0) * i) / steps) * Math.PI) / 180;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

function circle(cx: number, cy: number, r: number): P2[] {
  return arc(cx, cy, r, 0, 360, 48).slice(0, -1);
}

// Counter-clockwise rounded rectangle split into faces: edge, corner, edge, ...
function roundedRectRuns(x0: number, y0: number, x1: number, y1: number, r: number): P2[][] {
  const s = 10;
  return [
    [[x0 + r, y0], [x1 - r, y0]],
    arc(x1 - r, y0 + r, r, 270, 360, s),
    [[x1, y0 + r], [x1, y1 - r]],
    arc(x1 - r, y1 - r, r, 0, 90, s),
    [[x1 - r, y1], [x0 + r, y1]],
    arc(x0 + r, y1 - r, r, 90, 180, s),
    [[x0, y1 - r], [x0, y0 + r]],
    arc(x0 + r, y0 + r, r, 180, 270, s),
  ];
}

function joinRuns(runs: P2[][]): P2[] {
  const out: P2[] = [];
  for (const run of runs) {
    for (const p of run) {
      const last = out[out.length - 1];
      if (!last || Math.hypot(last[0] - p[0], last[1] - p[1]) > 1e-6) out.push(p);
    }
  }
  const first = out[0];
  const last = out[out.length - 1];
  if (out.length > 1 && Math.hypot(first[0] - last[0], first[1] - last[1]) < 1e-6) out.pop();
  return out;
}

function makeGeometry(positions: number[], normals: number[]): BufferGeometry {
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(positions, 3));
  g.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  return g;
}

// Flat face in the plane origin + u*x + v*y; the normal is u × v.
function planar(contour: P2[], holes: P2[][], origin: Vector3, u: Vector3, v: Vector3): BufferGeometry {
  // Same winding convention as three's ShapeGeometry, whose triangles face +z.
  let outer = contour.map(([x, y]) => new Vector2(x, y));
  if (!ShapeUtils.isClockWise(outer)) outer = outer.reverse();
  const inner = holes.map((h) => {
    const pts = h.map(([x, y]) => new Vector2(x, y));
    return ShapeUtils.isClockWise(pts) ? pts.reverse() : pts;
  });
  const tris = ShapeUtils.triangulateShape(outer, inner);
  const all = outer.concat(...inner);
  const n = new Vector3().crossVectors(u, v).normalize();
  const positions: number[] = [];
  const normals: number[] = [];
  for (const tri of tris) {
    for (const i of tri) {
      const p = origin.clone().addScaledVector(u, all[i].x).addScaledVector(v, all[i].y);
      positions.push(p.x, p.y, p.z);
      normals.push(n.x, n.y, n.z);
    }
  }
  return makeGeometry(positions, normals);
}

// Vertical wall along a counter-clockwise run. Curved runs get smooth normals.
function wall(run: P2[], z0: number, z1: number, inward: boolean, closed = false): BufferGeometry {
  const pts = closed ? [...run, run[0]] : run;
  const sign = inward ? -1 : 1;
  const normalAt = (i: number): Vector2 => {
    const a = pts[Math.max(i - 1, 0)];
    const b = pts[Math.min(i + 1, pts.length - 1)];
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    if (closed && (i === 0 || i === pts.length - 1)) {
      const prev = pts[pts.length - 2];
      dx = pts[1][0] - prev[0];
      dy = pts[1][1] - prev[1];
    }
    return new Vector2(dy, -dx).normalize().multiplyScalar(sign);
  };
  const positions: number[] = [];
  const normals: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const na = normalAt(i);
    const nb = normalAt(i + 1);
    const a0 = [ax, ay, z0, na.x, na.y];
    const b0 = [bx, by, z0, nb.x, nb.y];
    const b1 = [bx, by, z1, nb.x, nb.y];
    const a1 = [ax, ay, z1, na.x, na.y];
    const quad = inward ? [a0, b1, b0, a0, a1, b1] : [a0, b0, b1, a0, b1, a1];
    for (const q of quad) {
      positions.push(q[0], q[1], q[2]);
      normals.push(q[3], q[4], 0);
    }
  }
  return makeGeometry(positions, normals);
}

function runMidpoint(run: P2[], z: number): Vector3 {
  const p = run[Math.floor(run.length / 2)];
  const q = run[Math.max(Math.floor(run.length / 2) - 1, 0)];
  return run.length === 2
    ? new Vector3((run[0][0] + run[1][0]) / 2, (run[0][1] + run[1][1]) / 2, z)
    : new Vector3((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, z);
}

function edgesOf(geometry: BufferGeometry, material: LineBasicMaterial): LineSegments {
  return new LineSegments(new EdgesGeometry(geometry, 25), material);
}

function faceMaterial(): MeshLambertMaterial {
  return new MeshLambertMaterial({
    color: FACE,
    // Push faces back so edges drawn on the same surface stay visible.
    polygonOffset: true,
    polygonOffsetFactor: 2,
    polygonOffsetUnits: 6,
  });
}

function tint(hex: string, amount: number): number {
  const c = parseInt(hex.slice(1), 16);
  const mix = (v: number) => Math.round(v + (255 - v) * (1 - amount));
  return (mix(c >> 16) << 16) | (mix((c >> 8) & 255) << 8) | mix(c & 255);
}

function graphOverlay(nodes: Vector3[], links: [number, number][], radius: number): Group {
  const g = new Group();
  const nodeMat = new MeshBasicMaterial({ color: BLUE, depthTest: false });
  const sphere = new SphereGeometry(radius, 12, 8);
  for (const n of nodes) {
    const m = new Mesh(sphere, nodeMat);
    m.position.copy(n);
    m.renderOrder = 3;
    g.add(m);
  }
  const pos: number[] = [];
  for (const [a, b] of links) pos.push(nodes[a].x, nodes[a].y, nodes[a].z, nodes[b].x, nodes[b].y, nodes[b].z);
  const lineGeo = new BufferGeometry();
  lineGeo.setAttribute('position', new Float32BufferAttribute(pos, 3));
  const lines = new LineSegments(
    lineGeo,
    new LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.55, depthTest: false }),
  );
  lines.renderOrder = 2;
  g.add(lines);
  return g;
}

// Debris thrown off a spinning cutter: chips in the vise, dust at the router. Speeds and
// gravity scale with `pace`; `zUp` says which axis points up in the owner's frame.
function chipSpray(count: number, size: number, color: number, zUp: boolean, pace = 1) {
  const mesh = new InstancedMesh(
    new TetrahedronGeometry(size),
    new MeshLambertMaterial({ color, flatShading: true }),
    count,
  );
  mesh.frustumCulled = false;
  const chips = Array.from({ length: count }, () => ({
    life: 0, p: new Vector3(), v: new Vector3(), rot: new Euler(), spin: new Vector3(),
  }));
  let next = 0;
  const m4 = new Matrix4();
  const q = new Quaternion();
  const scl = new Vector3();
  return {
    mesh,
    spawn(at: Vector3, r: number, n: number) {
      for (let i = 0; i < n; i++) {
        const c = chips[next++ % count];
        const a = Math.random() * Math.PI * 2;
        const u = Math.cos(a);
        const w = Math.sin(a);
        const speed = (70 + Math.random() * 90) * pace;
        const side = 25 * pace;
        const lift = (50 + Math.random() * 90) * pace;
        if (zUp) {
          c.p.set(at.x + u * r, at.y + w * r, at.z + 1.5 * pace);
          c.v.set(-w * speed + u * side, u * speed + w * side, lift);
        } else {
          c.p.set(at.x + u * r, at.y + 1.5 * pace, at.z + w * r);
          c.v.set(-w * speed + u * side, lift, u * speed + w * side);
        }
        c.spin.set(Math.random() * 20, Math.random() * 20, Math.random() * 20);
        c.life = 0.5 + Math.random() * 0.4;
      }
    },
    move(dt: number) {
      chips.forEach((c, i) => {
        if (c.life > 0) {
          c.life -= dt;
          if (zUp) c.v.z -= 560 * pace * dt;
          else c.v.y -= 560 * pace * dt;
          c.p.addScaledVector(c.v, dt);
          c.rot.set(c.rot.x + c.spin.x * dt, c.rot.y + c.spin.y * dt, c.rot.z + c.spin.z * dt);
        }
        const k = c.life > 0 ? Math.min(1, c.life * 4) : 0.0001;
        m4.compose(c.p, q.setFromEuler(c.rot), scl.set(k, k, k));
        mesh.setMatrixAt(i, m4);
      });
      mesh.instanceMatrix.needsUpdate = true;
    },
    clear() {
      chips.forEach((c) => (c.life = 0));
    },
  };
}

// ---------- machined part ----------

interface PartFace {
  id: string;
  tag: PartTag;
  geometry: BufferGeometry;
  node: Vector3;
}

interface PartFeatures {
  step: boolean;
  pocket: boolean;
  holes: boolean;
}

// One animated stage of the part model (modelling, recognition, machining).
interface Stage {
  fitRadius: number;
  show(on: boolean): void;
  reset(): void;
  update(dt: number): void;
  notes(): (Note | null)[];
  step(): number;
  hud(): string;
  done(): boolean;
}

const AX = new Vector3(1, 0, 0);
const AY = new Vector3(0, 1, 0);
const AZ = new Vector3(0, 0, 1);

// 140 × 100 × 30 with R12 corners; the right end is stepped down to 18, the top has a
// 60 × 48 R8 pocket and two Ø18 counterbores, the step two Ø10 holes.
const CB: P2[] = [[-50, -28], [-50, 28]];
const DRILL: P2[] = [[57, -30], [57, 30]];
const POCKET_RUNS = roundedRectRuns(-30, -24, 30, 24, 8);
const POCKET = joinRuns(POCKET_RUNS);
const FL = arc(-58, -38, 12, 180, 270, 10);
const FR = arc(58, -38, 12, 270, 360, 10);
const BR = arc(58, 38, 12, 0, 90, 10);
const BL = arc(-58, 38, 12, 90, 180, 10);
const OUTLINE = joinRuns(roundedRectRuns(-70, -50, 70, 50, 12));
const STEP_OUTLINE = joinRuns([[[45, -50]], FR, BR, [[45, 50]]]);

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const ease = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};
const span = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const pad2 = (n: number) => String(n).padStart(2, '0');

// Faces of the part with the given features cut; the full set is the finished part.
function partFaces(f: PartFeatures): PartFace[] {
  const faces: PartFace[] = [];
  const add = (id: string, tag: PartTag, geometry: BufferGeometry, node: Vector3) =>
    faces.push({ id, tag, geometry, node });
  const right = f.step ? 18 : 30;
  const topHoles = [...(f.pocket ? [POCKET] : []), ...(f.holes ? CB.map(([x, y]) => circle(x, y, 9)) : [])];
  const top = f.step ? joinRuns([[[-58, -50], [45, -50], [45, 50], [-58, 50]], BL, FL]) : OUTLINE;
  add('top', 'stock', planar(top, topHoles, new Vector3(0, 0, 30), AX, AY), new Vector3(0, -37, 30));
  if (f.step) {
    add('stepFloor', 'step',
      planar(STEP_OUTLINE, f.holes ? DRILL.map(([x, y]) => circle(x, y, 5)) : [], new Vector3(0, 0, 18), AX, AY),
      new Vector3(64, 0, 18));
    add('stepWall', 'step', planar([[-50, 18], [50, 18], [50, 30], [-50, 30]], [], new Vector3(45, 0, 0), AY, AZ),
      new Vector3(45, 0, 24));
  }
  if (f.pocket) {
    add('pocketFloor', 'pocket', planar(POCKET, [], new Vector3(0, 0, 18), AX, AY), new Vector3(0, 0, 18));
    POCKET_RUNS.forEach((run, i) => add(`pocketWall${i}`, 'pocket', wall(run, 18, 30, true), runMidpoint(run, 24)));
  }
  if (f.holes) {
    CB.forEach(([x, y], i) =>
      add(`cbFloor${i}`, 'counterbore',
        planar(circle(x, y, 9), [circle(x, y, 5)], new Vector3(0, 0, 18), AX, AY),
        new Vector3(x + 7, y, 18)));
    CB.forEach(([x, y], i) =>
      add(`cbWall${i}`, 'counterbore', wall(circle(x, y, 9), 18, 30, true, true), new Vector3(x, y - 9, 24)));
    [...CB, ...DRILL].forEach(([x, y], i) =>
      add(`hole${i}`, 'hole', wall(circle(x, y, 5), 0, 18, true, true), new Vector3(x, y - 5, 9)));
  }
  const front: P2[] = f.step
    ? [[-58, 0], [58, 0], [58, 18], [45, 18], [45, 30], [-58, 30]]
    : [[-58, 0], [58, 0], [58, 30], [-58, 30]];
  const back: P2[] = f.step
    ? [[-58, 0], [58, 0], [58, 30], [-45, 30], [-45, 18], [-58, 18]]
    : [[-58, 0], [58, 0], [58, 30], [-58, 30]];
  add('front', 'stock', planar(front, [], new Vector3(0, -50, 0), AX, AZ), new Vector3(0, -50, 13));
  add('back', 'stock', planar(back, [], new Vector3(0, 50, 0), AX.clone().negate(), AZ), new Vector3(0, 50, 13));
  add('left', 'stock', planar([[-38, 0], [38, 0], [38, 30], [-38, 30]], [], new Vector3(-70, 0, 0), AY.clone().negate(), AZ),
    new Vector3(-70, 0, 15));
  add('right', 'stock', planar([[-38, 0], [38, 0], [38, right], [-38, right]], [], new Vector3(70, 0, 0), AY, AZ),
    new Vector3(70, 0, right / 2));
  add('filletFL', 'fillet', wall(FL, 0, 30, false), runMidpoint(FL, 15));
  add('filletFR', 'fillet', wall(FR, 0, right, false), runMidpoint(FR, right / 2));
  add('filletBR', 'fillet', wall(BR, 0, right, false), runMidpoint(BR, right / 2));
  add('filletBL', 'fillet', wall(BL, 0, 30, false), runMidpoint(BL, 15));
  return faces;
}

// Which faces of the finished part touch each other.
function faceLinks(faces: PartFace[]): [number, number][] {
  const index = new Map(faces.map((f, i) => [f.id, i]));
  const links: [number, number][] = [];
  const link = (a: string, ...others: string[]) => others.forEach((b) => links.push([index.get(a)!, index.get(b)!]));
  const pocketWalls = POCKET_RUNS.map((_, i) => `pocketWall${i}`);
  link('top', 'front', 'back', 'left', 'filletFL', 'filletBL', 'stepWall', 'cbWall0', 'cbWall1', ...pocketWalls);
  link('stepFloor', 'stepWall', 'front', 'back', 'right', 'filletFR', 'filletBR', 'hole2', 'hole3');
  link('pocketFloor', ...pocketWalls);
  pocketWalls.forEach((w, i) => link(w, pocketWalls[(i + 1) % pocketWalls.length]));
  link('cbFloor0', 'cbWall0', 'hole0');
  link('cbFloor1', 'cbWall1', 'hole1');
  link('left', 'filletFL', 'filletBL');
  link('right', 'filletFR', 'filletBR');
  link('front', 'filletFL', 'filletFR', 'stepWall');
  link('back', 'filletBL', 'filletBR', 'stepWall');
  return links;
}

function solidOf(faces: PartFace[], material: Material, edgeMat: LineBasicMaterial): Group {
  const g = new Group();
  for (const f of faces) {
    g.add(new Mesh(f.geometry, material));
    g.add(edgesOf(f.geometry, edgeMat));
  }
  return g;
}

function sketchLoop(pts: P2[], z: number, material: LineBasicMaterial): Line {
  const loop = [...pts, pts[0]].map(([x, y]) => new Vector3(x, y, z));
  const line = new Line(new BufferGeometry().setFromPoints(loop), material);
  line.renderOrder = 4;
  return line;
}

function drawLines(lines: Line[], p: number) {
  for (const l of lines) {
    const n = l.geometry.getAttribute('position').count;
    l.geometry.setDrawRange(0, Math.round(n * clamp01(p)));
  }
}

// Translucent cut volume, drawn over the solid like a CAD cut preview. It hangs from z = top
// and grows downwards as its group scales in z.
function cutBody(outline: P2[], depth: number, top: number, fill: Material, line: LineBasicMaterial): Group {
  const g = new Group();
  g.position.z = top;
  const geos = [
    planar(outline, [], new Vector3(0, 0, 0), AX, AY),
    planar(outline, [], new Vector3(0, 0, -depth), AX, AY),
    wall(outline, -depth, 0, false, true),
  ];
  for (const geo of geos) {
    const m = new Mesh(geo, fill);
    m.renderOrder = 5;
    g.add(m);
  }
  for (const z of [0, -depth]) {
    const l = sketchLoop(outline, z, line);
    l.renderOrder = 6;
    g.add(l);
  }
  return g;
}

// Nodes pop in during the first half, links draw during the second.
function revealGraph(g: Group, p: number) {
  for (const c of g.children) {
    if (c instanceof LineSegments) {
      const n = c.geometry.getAttribute('position').count;
      c.geometry.setDrawRange(0, Math.floor((n / 2) * clamp01(p * 2 - 1)) * 2);
    } else {
      c.scale.setScalar(Math.max(ease(p * 2), 0.0001));
    }
  }
}

const MODEL_STEPS = [
  '스케치 · 140 × 100, R12',
  '돌출 · 높이 30',
  '단차 컷 · 깊이 12',
  '포켓 컷 · 60 × 48, 깊이 12',
  '구멍 · Ø10, 카운터보어 2곳',
  '면 분석 · 면 29개, 53쌍',
];

// Layer 0: the part is modelled feature by feature, then its faces are read as a graph.
function buildModeling(body: Group, edgeMat: LineBasicMaterial, reducedMotion: boolean): Stage {
  const group = new Group();
  body.add(group);
  const mat = faceMaterial();
  const finalFaces = partFaces({ step: true, pocket: true, holes: true });
  const states = [
    solidOf(partFaces({ step: false, pocket: false, holes: false }), mat, edgeMat),
    solidOf(partFaces({ step: true, pocket: false, holes: false }), mat, edgeMat),
    solidOf(partFaces({ step: true, pocket: true, holes: false }), mat, edgeMat),
    solidOf(finalFaces, mat, edgeMat),
  ];
  states.forEach((s) => group.add(s));

  const sketchMat = new LineBasicMaterial({ color: BLUE });
  const cutFill = new MeshBasicMaterial({
    color: ACCENT, transparent: true, opacity: 0.3, depthTest: false, depthWrite: false, side: DoubleSide,
  });
  const cutLine = new LineBasicMaterial({ color: ACCENT, transparent: true, depthTest: false });
  const sketches: Line[][] = [
    [sketchLoop(OUTLINE, 0, sketchMat)],
    [sketchLoop(STEP_OUTLINE, 30, sketchMat)],
    [sketchLoop(POCKET, 30, sketchMat)],
    [
      ...CB.flatMap(([x, y]) => [sketchLoop(circle(x, y, 9), 30, sketchMat), sketchLoop(circle(x, y, 5), 30, sketchMat)]),
      ...DRILL.map(([x, y]) => sketchLoop(circle(x, y, 5), 18, sketchMat)),
    ],
  ];
  sketches.flat().forEach((l) => group.add(l));
  const cuts: Group[][] = [
    [cutBody(STEP_OUTLINE, 12, 30, cutFill, cutLine)],
    [cutBody(POCKET, 12, 30, cutFill, cutLine)],
    [
      ...CB.flatMap(([x, y]) => [
        cutBody(circle(x, y, 9), 12, 30, cutFill, cutLine),
        cutBody(circle(x, y, 5), 18, 18, cutFill, cutLine),
      ]),
      ...DRILL.map(([x, y]) => cutBody(circle(x, y, 5), 18, 18, cutFill, cutLine)),
    ],
  ];
  cuts.flat().forEach((c) => group.add(c));
  const graph = graphOverlay(finalFaces.map((f) => f.node), faceLinks(finalFaces), 1.6);
  group.add(graph);

  // Seconds: sketch, extrude, three cuts as [sketch, preview, commit], face graph.
  const sketchAt: [number, number] = [0.2, 1.3];
  const extrudeAt: [number, number] = [1.4, 2.4];
  const cutAt: [number, number, number][] = [[2.7, 3.3, 3.9], [4.2, 4.8, 5.4], [5.7, 6.3, 6.9]];
  const graphAt: [number, number] = [7.3, 8.8];
  const end = 11;

  let t = 0;
  const apply = () => {
    drawLines(sketches[0], ease(span(t, ...sketchAt)));
    sketches[0].forEach((l) => (l.visible = t < extrudeAt[1]));
    states[0].scale.z = Math.max(ease(span(t, ...extrudeAt)), 0.001);
    const shown = t < extrudeAt[0] ? -1 : cutAt.filter(([, , commit]) => t >= commit).length;
    states.forEach((s, i) => (s.visible = i === shown));
    cutAt.forEach(([from, preview, commit], i) => {
      sketches[i + 1].forEach((l) => (l.visible = t >= from && t < commit));
      drawLines(sketches[i + 1], ease(span(t, from, preview)));
      const live = t >= preview && t < commit + 0.4;
      cuts[i].forEach((c) => {
        c.visible = live;
        c.scale.z = Math.max(ease(span(t, preview, commit - 0.1)), 0.001);
      });
      if (live) {
        const fade = 1 - span(t, commit, commit + 0.4);
        cutFill.opacity = 0.3 * fade;
        cutLine.opacity = fade;
      }
    });
    graph.visible = t >= graphAt[0];
    revealGraph(graph, span(t, ...graphAt));
  };
  const step = () =>
    t < extrudeAt[0] ? 0 : t < cutAt[0][0] ? 1 : t < cutAt[1][0] ? 2 : t < cutAt[2][0] ? 3 : t < graphAt[0] ? 4 : 5;

  return {
    fitRadius: 84,
    show(on) {
      group.visible = on;
    },
    reset() {
      t = reducedMotion ? end : 0;
      apply();
    },
    update(dt) {
      if (reducedMotion) return;
      t += dt;
      if (t > end + 0.6) t = 0;
      apply();
    },
    notes: () => [],
    step,
    hud: () => `${pad2(step() + 1)} ${MODEL_STEPS[step()]}`,
    done: () => !reducedMotion && t >= end,
  };
}

const FEATURE_ORDER: Exclude<PartTag, 'stock'>[] = ['pocket', 'counterbore', 'hole', 'step', 'fillet'];
const FEATURE_STEPS = ['포켓 · 면 9개', '카운터보어 · 2곳', '관통 구멍 · 4곳', '단차 · 면 2개', '필렛 · R12, 4곳'];

// Layer 1: the recognised feature classes light up one after another.
function buildRecognition(body: Group, edgeMat: LineBasicMaterial, reducedMotion: boolean): Stage {
  const group = new Group();
  body.add(group);
  const faces = partFaces({ step: true, pocket: true, holes: true });
  const mats = new Map<PartTag, MeshLambertMaterial>();
  for (const f of faces) {
    if (!mats.has(f.tag)) mats.set(f.tag, faceMaterial());
    group.add(new Mesh(f.geometry, mats.get(f.tag)!));
    group.add(edgesOf(f.geometry, edgeMat));
  }
  const notes: Note[] = [
    new Vector3(0, 0, 18),
    new Vector3(-50, 19, 30),
    new Vector3(57, -25, 18),
    new Vector3(64, 8, 18),
    runMidpoint(FL, 15),
  ].map((anchor) => ({ anchor, owner: body }));
  const start = 0.5;
  const slot = 0.8;
  const end = start + FEATURE_ORDER.length * slot + 2.6;
  const white = new Color(FACE);
  let t = 0;
  const apply = () => {
    FEATURE_ORDER.forEach((tag, i) => {
      const p = ease(span(t, start + i * slot, start + i * slot + 0.45));
      mats.get(tag)!.color.lerpColors(white, new Color(tint(TINTS[tag], 1)), p);
    });
  };
  const step = () => (t < start ? -1 : Math.min(Math.floor((t - start) / slot), FEATURE_ORDER.length - 1));
  return {
    fitRadius: 84,
    show(on) {
      group.visible = on;
    },
    reset() {
      t = reducedMotion ? end : 0;
      apply();
    },
    update(dt) {
      if (reducedMotion) return;
      t += dt;
      if (t > end + 0.6) t = 0;
      apply();
    },
    notes: () => notes.map((n, i) => (t >= start + i * slot ? n : null)),
    step,
    hud: () => (step() < 0 ? 'AI 특징 인식' : `AI 인식 ${pad2(step() + 1)} · ${FEATURE_STEPS[step()]}`),
    done: () => !reducedMotion && t >= end,
  };
}

// ---------- machining (layer 2) ----------

// Square stock in a flat-jaw vise; the part is cut out of its top. prisme-engine's default
// stock leaves 1 mm on the sides and 3 mm on top, and the bottom keeps 12 mm for the jaws
// (10 mm grip + 2 mm clearance). The stock is a height field on a 0.5 mm grid that each
// tool position lowers under the cutter.
const STOCK = { x: 71, y: 51, top: 33, bottom: -12 };
const CELL = 0.5;
const NX = Math.round((2 * STOCK.x) / CELL) + 1;
const NY = Math.round((2 * STOCK.y) / CELL) + 1;
// 118° drill point: the cone rises tan(31°) per millimetre of radius.
const DRILL_TIP = Math.tan((31 * Math.PI) / 180);
const RAW = new Color(0xb5bab1);

// Operation groups in the engine's order; legend rows and balloons follow them.
const OPS = ['윗면 페이싱', '외곽', '단차', '포켓', '카운터보어', '드릴링'];
const OP_COLORS = [TINTS.face, TINTS.fillet, TINTS.step, TINTS.pocket, TINTS.counterbore, TINTS.hole].map(
  (hex) => new Color(tint(hex, 0.9)),
);

function buildStock() {
  const group = new Group();
  const count = NX * NY;
  const heights = new Float32Array(count);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const index = new Uint32Array((NX - 1) * (NY - 1) * 6);
  let k = 0;
  for (let iy = 0; iy < NY - 1; iy++) {
    for (let ix = 0; ix < NX - 1; ix++) {
      const a = iy * NX + ix;
      index[k++] = a;
      index[k++] = a + 1;
      index[k++] = a + NX + 1;
      index[k++] = a;
      index[k++] = a + NX + 1;
      index[k++] = a + NX;
    }
  }
  const posAttr = new BufferAttribute(pos, 3).setUsage(DynamicDrawUsage);
  const colAttr = new BufferAttribute(col, 3).setUsage(DynamicDrawUsage);
  const topGeo = new BufferGeometry();
  topGeo.setAttribute('position', posAttr);
  topGeo.setAttribute('color', colAttr);
  topGeo.setIndex(new BufferAttribute(index, 1));
  const top = new Mesh(
    topGeo,
    new MeshLambertMaterial({
      vertexColors: true, flatShading: true, side: DoubleSide,
    }),
  );
  top.frustumCulled = false;

  // Side walls follow the height field along the boundary, counter-clockwise.
  const perim: number[] = [];
  for (let ix = 0; ix < NX; ix++) perim.push(ix);
  for (let iy = 1; iy < NY; iy++) perim.push(iy * NX + NX - 1);
  for (let ix = NX - 2; ix >= 0; ix--) perim.push((NY - 1) * NX + ix);
  for (let iy = NY - 2; iy > 0; iy--) perim.push(iy * NX);
  const wallPos = new Float32Array(perim.length * 6);
  const wallIndex: number[] = [];
  for (let i = 0; i < perim.length; i++) {
    const j = (i + 1) % perim.length;
    wallIndex.push(2 * i, 2 * i + 1, 2 * j + 1, 2 * i, 2 * j + 1, 2 * j);
  }
  const wallAttr = new BufferAttribute(wallPos, 3).setUsage(DynamicDrawUsage);
  const wallGeo = new BufferGeometry();
  wallGeo.setAttribute('position', wallAttr);
  wallGeo.setIndex(wallIndex);
  const walls = new Mesh(wallGeo, new MeshLambertMaterial({ color: RAW, flatShading: true, side: DoubleSide }));
  walls.frustumCulled = false;
  group.add(top, walls);

  let rowMin = Infinity;
  let rowMax = -1;
  let edgeDirty = false;
  const paint = (i: number, c: Color) => {
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  };
  const flush = () => {
    if (rowMax >= rowMin) {
      const start = rowMin * NX * 3;
      const len = (rowMax - rowMin + 1) * NX * 3;
      posAttr.addUpdateRange(start, len);
      colAttr.addUpdateRange(start, len);
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      rowMin = Infinity;
      rowMax = -1;
    }
    if (edgeDirty) {
      perim.forEach((v, i) => (wallPos[i * 6 + 2] = heights[v]));
      wallAttr.needsUpdate = true;
      edgeDirty = false;
    }
  };
  return {
    group,
    reset() {
      heights.fill(STOCK.top);
      for (let iy = 0; iy < NY; iy++) {
        for (let ix = 0; ix < NX; ix++) {
          const i = iy * NX + ix;
          pos[i * 3] = -STOCK.x + ix * CELL;
          pos[i * 3 + 1] = -STOCK.y + iy * CELL;
          pos[i * 3 + 2] = STOCK.top;
          col[i * 3] = RAW.r;
          col[i * 3 + 1] = RAW.g;
          col[i * 3 + 2] = RAW.b;
        }
      }
      perim.forEach((v, i) => {
        wallPos.set([pos[v * 3], pos[v * 3 + 1], STOCK.top, pos[v * 3], pos[v * 3 + 1], STOCK.bottom], i * 6);
      });
      posAttr.clearUpdateRanges();
      colAttr.clearUpdateRanges();
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      wallAttr.needsUpdate = true;
      rowMin = Infinity;
      rowMax = -1;
      edgeDirty = false;
    },
    // Lowers the field under a cutter whose tip moves straight from (x0, y0, z0) to
    // (x1, y1, z1): each cell the cutter passes over drops to the lowest tip height that
    // reaches it, so neighbouring passes meet without ridges. A drill only moves along its
    // axis and its cone rises with the distance from it. Returns the removed volume.
    sweep(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, r: number, drill: boolean, color: Color): number {
      const reach = r + 0.02;
      const ix0 = Math.max(0, Math.ceil((Math.min(x0, x1) - reach + STOCK.x) / CELL));
      const ix1 = Math.min(NX - 1, Math.floor((Math.max(x0, x1) + reach + STOCK.x) / CELL));
      const iy0 = Math.max(0, Math.ceil((Math.min(y0, y1) - reach + STOCK.y) / CELL));
      const iy1 = Math.min(NY - 1, Math.floor((Math.max(y0, y1) + reach + STOCK.y) / CELL));
      if (ix0 > ix1 || iy0 > iy1) return 0;
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len2 = dx * dx + dy * dy;
      const reach2 = reach * reach;
      let removed = 0;
      for (let iy = iy0; iy <= iy1; iy++) {
        const py = -STOCK.y + iy * CELL - y0;
        let touched = false;
        for (let ix = ix0; ix <= ix1; ix++) {
          const px = -STOCK.x + ix * CELL - x0;
          // Where along the move the tool axis passes closest to this cell.
          const along = len2 > 1e-9 ? (px * dx + py * dy) / len2 : 0;
          const ex = px - clamp01(along) * dx;
          const ey = py - clamp01(along) * dy;
          const d2 = ex * ex + ey * ey;
          if (d2 > reach2) continue;
          let z: number;
          if (drill || len2 <= 1e-9) {
            z = Math.min(z0, z1) + (drill ? Math.sqrt(d2) * DRILL_TIP : 0);
          } else {
            // The stretch of the move with the cell under the cutter; on a ramp its lower end counts.
            const fx = px - along * dx;
            const fy = py - along * dy;
            const half = Math.sqrt(Math.max(reach2 - fx * fx - fy * fy, 0) / len2);
            const lo = clamp01(along - half);
            const hi = clamp01(along + half);
            z = Math.min(z0 + (z1 - z0) * lo, z0 + (z1 - z0) * hi);
          }
          const i = iy * NX + ix;
          if (heights[i] <= z + 1e-4) continue;
          removed += heights[i] - z;
          heights[i] = z;
          pos[i * 3 + 2] = z;
          paint(i, color);
          // Wall tops left standing next to the cut take its colour too, so a wall is
          // one colour instead of stripes between the two heights.
          if (ix > 0 && heights[i - 1] > z + 0.3) paint(i - 1, color);
          if (ix < NX - 1 && heights[i + 1] > z + 0.3) paint(i + 1, color);
          if (iy > 0 && heights[i - NX] > z + 0.3) paint(i - NX, color);
          if (iy < NY - 1 && heights[i + NX] > z + 0.3) paint(i + NX, color);
          touched = true;
        }
        if (touched) {
          rowMin = Math.min(rowMin, Math.max(iy - 1, 0));
          rowMax = Math.max(rowMax, Math.min(iy + 1, NY - 1));
          if (iy === 0 || iy === NY - 1 || ix0 === 0 || ix1 === NX - 1) edgeDirty = true;
        }
      }
      return removed * CELL * CELL;
    },
    flush,
  };
}

interface Cutter {
  name: string;
  // Number and diameter for the caption.
  short: string;
  r: number;
  kind: 'face' | 'flat' | 'drill';
  model: Group;
  spin: Object3D;
}

function metal(hex: number): MeshLambertMaterial {
  const m = faceMaterial();
  m.color.setHex(hex);
  return m;
}

// Fluted cutting length along +y: lobed cross-section twisted on a 30° helix, cone tip for
// drills, chip-breaker serrations for roughing end mills.
function fluteGeometry(r: number, length: number, flutes: number, drill: boolean, rough = false): BufferGeometry {
  const seg = 40;
  const rows = Math.max(10, Math.round(length / 1.5));
  const twist = Math.tan(Math.PI / 6) / r;
  const tipLen = drill ? r * DRILL_TIP : 0;
  const positions: number[] = [];
  for (let j = 0; j <= rows; j++) {
    const y = (j / rows) * length;
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      let rad = r * (0.8 + 0.2 * Math.cos(flutes * (a + twist * y)));
      if (rough) rad *= 0.95 + 0.05 * Math.cos((2 * Math.PI * y) / 2.5 + flutes * a);
      if (drill && y < tipLen) rad *= y / tipLen;
      positions.push(rad * Math.cos(a), y, rad * Math.sin(a));
    }
  }
  const index: number[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < seg; i++) {
      const a = j * (seg + 1) + i;
      const b = a + seg + 1;
      index.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  if (!drill) {
    const c = positions.length / 3;
    positions.push(0, 0, 0);
    for (let i = 0; i < seg; i++) index.push(c, i, i + 1);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(positions, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

// Collet nut, holder taper, flange and spindle nose above a tool that sticks out `stick` mm.
function toolHolder(stick: number, nut: number, edge: LineBasicMaterial): Group {
  const g = new Group();
  const piece = (geo: BufferGeometry, y: number, hex: number) => {
    const m = new Mesh(geo, metal(hex));
    m.position.y = y;
    m.add(edgesOf(geo, edge));
    g.add(m);
  };
  piece(new CylinderGeometry(nut, nut, 10, 6), stick + 5, 0xc2c6be);
  piece(new CylinderGeometry(20, nut + 2, 22, 32), stick + 21, 0xd6d9d2);
  piece(new CylinderGeometry(27, 27, 8, 32), stick + 36, 0xc2c6be);
  piece(new CylinderGeometry(34, 34, 70, 32), stick + 75, 0xa8ada5);
  return g;
}

function makeCutters(edge: LineBasicMaterial): Cutter[] {
  const carbide = new MeshLambertMaterial({ color: 0x8c928a, flatShading: true });
  const shankMat = metal(0xd0d3cc);
  const endMill = (
    name: string,
    short: string,
    r: number,
    flute: number,
    stick: number,
    drill: boolean,
    rough = false,
  ): Cutter => {
    const model = new Group();
    const flutes = new Mesh(fluteGeometry(r, flute, drill ? 2 : 4, drill, rough), carbide);
    const shankGeo = new CylinderGeometry(r, r, stick - flute, 24);
    const shank = new Mesh(shankGeo, shankMat);
    shank.position.y = flute + (stick - flute) / 2;
    shank.add(edgesOf(shankGeo, edge));
    model.add(flutes, shank, toolHolder(stick, r + 6, edge));
    return { name, short, r, kind: drill ? 'drill' : 'flat', model, spin: flutes };
  };
  // Ø80 face mill: a body with ten inserts on its rim.
  const face = new Group();
  const headGeo = new CylinderGeometry(37, 40, 14, 48);
  const head = new Mesh(headGeo, metal(0xb3b8b0));
  head.position.y = 7;
  head.add(edgesOf(headGeo, edge));
  face.add(head);
  const insertMat = metal(0xc7a04c);
  const insertGeo = new BoxGeometry(6, 5, 2);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const ins = new Mesh(insertGeo, insertMat);
    ins.position.set(Math.cos(a) * 38.2, 2.6, Math.sin(a) * 38.2);
    ins.rotation.y = -a + Math.PI / 2;
    face.add(ins);
  }
  const faceModel = new Group();
  const arborGeo = new CylinderGeometry(20, 20, 16, 32);
  const arbor = new Mesh(arborGeo, metal(0xc2c6be));
  arbor.position.y = 22;
  arbor.add(edgesOf(arborGeo, edge));
  faceModel.add(face, arbor, toolHolder(30, 22, edge));
  // The packaged aluminium library the engine picks from (Tool(AL).json).
  return [
    { name: 'T1 Ø80 페이스밀', short: 'T1 Ø80', r: 40, kind: 'face', model: faceModel, spin: face },
    endMill('T4 Ø12 황삭 엔드밀', 'T4 Ø12', 6, 34, 44, false, true),
    endMill('T8 Ø5 평엔드밀', 'T8 Ø5', 2.5, 15, 30, false),
    endMill('T22 Ø10 드릴', 'T22 Ø10', 5, 42, 54, true),
  ];
}

// Flat-jaw machine vise: bed, fixed and moving jaws with hardened jaw plates, screw and
// handle, parallels under the stock. Part coordinates (z up); the stock sits between
// y = ±51 and the jaws grip its bottom 10 mm, stopping 2 mm under the part.
function buildVise(edge: LineBasicMaterial): Group {
  const g = new Group();
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, hex: number) => {
    const geo = new BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    const m = new Mesh(geo, metal(hex));
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    m.add(edgesOf(geo, edge));
    g.add(m);
  };
  const body = 0xb9beb6;
  const plate = 0x9fa59d;
  box(-84, 84, -94, 102, -60, -36, body);
  box(-80, 80, -90, -59, -36, -2, body);
  box(-80, 80, -59, -51, -32, -2, plate);
  box(-80, 80, 59, 90, -36, -2, body);
  box(-80, 80, 51, 59, -32, -2, plate);
  box(-68, 68, -46, -38, -36, -12, 0xd2d5ce);
  box(-68, 68, 38, 46, -36, -12, 0xd2d5ce);
  const screwGeo = new CylinderGeometry(9, 9, 34, 24);
  const screw = new Mesh(screwGeo, metal(body));
  screw.position.set(0, 107, -26);
  screw.add(edgesOf(screwGeo, edge));
  const handleGeo = new CylinderGeometry(3.5, 3.5, 76, 16);
  const handle = new Mesh(handleGeo, metal(0x8f958d));
  handle.position.set(0, 122, -26);
  handle.rotation.z = Math.PI / 2;
  handle.add(edgesOf(handleGeo, edge));
  g.add(screw, handle);
  return g;
}

interface Move {
  from: Vector3;
  to: Vector3;
  start: number;
  end: number;
  cut: boolean;
  op: number;
  tool: number;
  // Tool change: the spindle stops while the tool is swapped.
  dwell: boolean;
  // Operation name as the engine writes it into Fusion, e.g. "[황삭] 포켓".
  name: string;
}

function insetRing(d: number): P2[] {
  const ring = joinRuns(roundedRectRuns(-30 + d, -24 + d, 30 - d, 24 - d, Math.max(8 - d, 0.6)));
  const s = ring.findIndex(([, y]) => Math.abs(y - (-24 + d)) < 1e-6);
  return [...ring.slice(s), ...ring.slice(0, s)];
}

// Tool-centre loop around the part outline at `offset`, starting on the left side.
function outsideLoop(offset: number): P2[] {
  const loop = joinRuns(roundedRectRuns(-70 - offset, -50 - offset, 70 + offset, 50 + offset, 12 + offset));
  const s = loop.findIndex(([x, y]) => x <= -70 - offset + 1e-6 && y > 0);
  return [...loop.slice(s), ...loop.slice(0, s)];
}

// Depths from `from` down to `to` in `step` mm.
function levels(from: number, to: number, step: number): number[] {
  const out: number[] = [];
  for (let z = from; z >= to - 1e-6; z -= step) out.push(Math.round(z * 100) / 100);
  return out;
}

// Setup 1 as prisme-engine plans this part for a flat-jaw vise (one hold, the outside cut
// through to the part bottom): facing, exterior stock and outer contour, then the Z18
// features rough → finish (step, pocket, counterbore), drilling last. Stepdowns, stock and
// entries follow the engine's defaults; the feeds are animation pace, slow on the first
// depth of each operation and fast after it.
function planMoves(): Move[] {
  const moves: Move[] = [];
  const retract = STOCK.top + 5;
  const home = 160;
  const rapidSpeed = 900;
  let at = new Vector3(30, -60, home);
  let clock = 0;
  let op = 0;
  let tool = 0;
  let name = '';
  const push = (to: Vector3, speed: number, cut: boolean) => {
    const dur = at.distanceTo(to) / speed;
    if (dur <= 1e-6) return;
    moves.push({ from: at.clone(), to: to.clone(), start: clock, end: clock + dur, cut, op, tool, dwell: false, name });
    clock += dur;
    at = to.clone();
  };
  const feed = (x: number, y: number, z: number, speed: number) => push(new Vector3(x, y, z), speed, true);
  const rapid = (x: number, y: number, z: number) => {
    const high = Math.max(retract, at.z);
    push(new Vector3(at.x, at.y, high), rapidSpeed, false);
    push(new Vector3(x, y, high), rapidSpeed, false);
    push(new Vector3(x, y, z), rapidSpeed, false);
  };
  // Starts an operation; another tool means going home and swapping it first.
  const begin = (nextOp: number, nextTool: number, nextName: string) => {
    if (nextTool !== tool) {
      push(new Vector3(at.x, at.y, home), rapidSpeed, false);
      tool = nextTool;
      moves.push({ from: at.clone(), to: at.clone(), start: clock, end: clock + 0.35, cut: false, op: nextOp, tool, dwell: true, name: nextName });
      clock += 0.35;
    }
    op = nextOp;
    name = nextName;
  };
  const pace = (level: number, first: number, rest: number) => (level === 0 ? first : rest);
  // One full turn around (cx, cy) going from z0 to z1, ending where it started.
  const helix = (cx: number, cy: number, r: number, z0: number, z1: number, speed: number) => {
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      feed(cx + r * Math.cos(a), cy + r * Math.sin(a), z0 + ((z1 - z0) * i) / 24, speed);
    }
  };

  // 1. [황삭] 상면: Ø80 face mill, 1 mm per depth from the stock top (33) to the part top (30).
  begin(0, 0, '[황삭] 상면');
  let fx = -120;
  let fy = -20;
  rapid(fx, fy, 32);
  levels(32, 30, 1).forEach((z, level) => {
    const v = pace(level, 420, 2000);
    feed(fx, fy, z, v);
    fx = -fx;
    feed(fx, fy, z, v);
    fy = -fy;
    feed(fx, fy, z, v);
    fx = -fx;
    feed(fx, fy, z, v);
  });

  // 2. [황삭] 외곽 소재 and [정삭] 외곽 윤곽: Ø12 roughing end mill around the outline in
  // 2 mm steps down to the part bottom; the rough leaves 0.1 mm, the contour takes it.
  const outside = (offset: number, first: number, rest: number) => {
    const path = outsideLoop(offset);
    const [lx, ly] = [path[0][0] - 14, path[0][1]];
    rapid(lx, ly, 30);
    levels(28, 0, 2).forEach((z, level) => {
      const v = pace(level, first, rest);
      feed(lx, ly, z, v);
      for (const [x, y] of [...path, path[0]]) feed(x, y, z, v);
      feed(lx, ly, z, v);
    });
  };
  begin(1, 1, '[황삭] 외곽 소재');
  outside(6.1, 450, 6000);
  begin(1, 1, '[정삭] 외곽 윤곽');
  outside(6, 450, 6000);

  // 3. The step, an open pocket: Ø12 rough with a helix entry, 1 mm per depth, 1 mm left on
  // the wall, lanes 1.2 mm apart from the open side in; then a Ø5 finish on the wall.
  begin(2, 1, '[황삭] 개방 포켓');
  const lanes: number[] = [];
  for (let x = 70; x > 52 + 0.05; x -= 1.2) lanes.push(x);
  lanes.push(52);
  rapid(67, -44, 31);
  levels(29, 18, 1).forEach((z, level) => {
    const v = pace(level, 2400, 16000);
    feed(67, -44, z + 1, v);
    helix(64, -44, 3, z + 1, z, v / 4);
    lanes.forEach((x, i) => {
      const y = i % 2 ? 57 : -57;
      feed(x, y, z, v);
      feed(x, -y, z, v);
    });
  });
  begin(2, 2, '[정삭] 개방 포켓');
  rapid(47.5, -56, 31);
  levels(29, 18, 1).forEach((z, level) => {
    const v = pace(level, 400, 4000);
    const y = level % 2 ? 56 : -56;
    feed(47.5, y, z, v);
    feed(47.5, -y, z, v);
  });

  // 4. The pocket: Ø12 rough plunging at the centre (its opening is too narrow for a
  // helix), rings 1.2 mm apart from the centre out, 1 mm left on the wall; Ø5 finish.
  begin(3, 1, '[황삭] 포켓');
  const rings: P2[][] = [];
  for (let d = 7; d <= 22.6; d += 1.2) rings.push(insetRing(d));
  rings.reverse();
  rapid(0, 0, 31);
  levels(29, 18, 1).forEach((z, level) => {
    const v = pace(level, 1800, 16000);
    feed(0, 0, z, v / 6);
    for (const ring of rings) for (const [x, y] of [...ring, ring[0]]) feed(x, y, z, v);
    feed(0, 0, z, v);
  });
  begin(3, 2, '[정삭] 포켓');
  const wall = insetRing(2.5);
  rapid(0, 0, 31);
  levels(29, 18, 1).forEach((z, level) => {
    const v = pace(level, 400, 5000);
    feed(0, 0, z, v);
    for (const [x, y] of [...wall, wall[0]]) feed(x, y, z, v);
    feed(0, 0, z, v);
  });

  // 5. [황삭] 카운터보어: both heads as one 2D pocket with the Ø12, a helix turn per 1 mm
  // and a finishing turn at the floor.
  begin(4, 1, '[황삭] 카운터보어');
  for (const [x, y] of CB) {
    rapid(x + 3, y, 31);
    levels(29, 18, 1).forEach((z, level) => helix(x, y, 3, z + 1, z, pace(level, 300, 3000)));
    helix(x, y, 3, 18, 18, 400);
  }

  // 6. [정삭] 드릴링: the exact Ø10 drill, nearest hole next, chip-breaking pecks of 1.5 mm,
  // tip through the bottom plus 1 mm.
  begin(5, 3, '[정삭] 드릴링');
  const holes = [...CB, ...DRILL];
  const bottom = -1 - 5 * DRILL_TIP;
  for (let n = 0; holes.length; n++) {
    holes.sort((a, b) => Math.hypot(a[0] - at.x, a[1] - at.y) - Math.hypot(b[0] - at.x, b[1] - at.y));
    const [x, y] = holes.shift()!;
    const v = n === 0 ? 120 : 700;
    rapid(x, y, 20);
    let z = 18;
    feed(x, y, z, v);
    while (z > bottom + 1e-6) {
      z = Math.max(z - 1.5, bottom);
      feed(x, y, z, v);
      if (z > bottom + 1e-6) feed(x, y, z + 0.5, v * 2);
    }
    push(new Vector3(x, y, 20), rapidSpeed, false);
  }
  push(new Vector3(at.x, at.y, home), rapidSpeed, false);
  push(new Vector3(30, -60, home), rapidSpeed, false);
  return moves;
}

function buildMachining(edgeMat: LineBasicMaterial, reducedMotion: boolean): Stage & { group: Group } {
  const group = new Group();
  group.rotation.x = -Math.PI / 2;
  group.position.y = -6;
  const stock = buildStock();
  group.add(buildVise(edgeMat), stock.group);

  const cutters = makeCutters(edgeMat);
  const toolGroup = new Group();
  for (const c of cutters) {
    c.model.rotation.x = Math.PI / 2;
    toolGroup.add(c.model);
  }
  group.add(toolGroup);

  const moves = planMoves();
  const total = moves[moves.length - 1].end;
  const end = total + 3.2;

  // Planned path of the operation in progress, seen through the stock.
  const pathMat = new LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.55, depthTest: false });
  const paths = OPS.map((_, op) => {
    const pts: number[] = [];
    for (const m of moves) {
      if (m.op === op && m.cut) pts.push(m.from.x, m.from.y, m.from.z, m.to.x, m.to.y, m.to.z);
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(pts, 3));
    const lines = new LineSegments(geo, pathMat);
    lines.renderOrder = 7;
    group.add(lines);
    return lines;
  });

  // When the last cut is done the exact part, coloured by the operation that cut each face,
  // takes over from the height field and its 0.5 mm stair steps.
  const opOfTag: Record<PartTag, number> = { stock: 0, fillet: 1, step: 2, pocket: 3, counterbore: 4, hole: 5 };
  const sideFaces = new Set(['front', 'back', 'left', 'right']);
  const opMats = OP_COLORS.map((c) => {
    const m = faceMaterial();
    m.color.copy(c);
    return m;
  });
  const finished = new Group();
  for (const f of partFaces({ step: true, pocket: true, holes: true })) {
    const op = sideFaces.has(f.id) ? 1 : opOfTag[f.tag];
    finished.add(new Mesh(f.geometry, opMats[op]));
    finished.add(edgesOf(f.geometry, edgeMat));
  }
  // Stock left under the part in the jaws; its top is the profile floor.
  const rawMat = faceMaterial();
  rawMat.color.copy(RAW);
  const baseGeo = new BoxGeometry(2 * STOCK.x, 2 * STOCK.y, -STOCK.bottom);
  const base = new Mesh(baseGeo, [rawMat, rawMat, rawMat, rawMat, opMats[1], rawMat]);
  base.position.z = STOCK.bottom / 2;
  base.add(edgesOf(baseGeo, edgeMat));
  finished.add(base);
  group.add(finished);

  // Chips thrown off the cutter while it is removing material.
  const chips = chipSpray(140, 1.1, 0xdfe2db, true);
  group.add(chips.mesh);

  const anchors: Note[] = [
    new Vector3(-12, 38, 30),
    new Vector3(0, -50, 12),
    new Vector3(62, 12, 18),
    new Vector3(0, -6, 18),
    new Vector3(-50, -19, 30),
    new Vector3(57, -30, 12),
  ].map((anchor) => ({ anchor, owner: group }));

  let t = 0;
  let cursor = 0;
  let cutCursor = 0;
  let current = moves[0];
  const tip = new Vector3();
  const p = new Vector3();
  const q = new Vector3();

  const place = (time: number) => {
    while (cursor < moves.length - 1 && moves[cursor].end < time) cursor++;
    current = moves[cursor];
    const k = current.end > current.start ? clamp01((time - current.start) / (current.end - current.start)) : 1;
    tip.copy(current.from).lerp(current.to, k);
    toolGroup.position.copy(tip);
    const running = time < total;
    // Back home the tool tip would still peek in at the top of the finished view.
    cutters.forEach((c, i) => (c.model.visible = running && i === current.tool));
    paths.forEach((l, i) => (l.visible = running && i === current.op && !current.dwell));
  };

  // Lowers the stock along the part of every cutting move between t0 and t1.
  const cutBetween = (t0: number, t1: number) => {
    let removed = 0;
    while (cutCursor < moves.length && moves[cutCursor].end <= t0) cutCursor++;
    for (let i = cutCursor; i < moves.length && moves[i].start < t1; i++) {
      const m = moves[i];
      if (!m.cut) continue;
      const cutter = cutters[m.tool];
      const dur = m.end - m.start;
      p.copy(m.from).lerp(m.to, clamp01((t0 - m.start) / dur));
      q.copy(m.from).lerp(m.to, clamp01((t1 - m.start) / dur));
      removed += stock.sweep(p.x, p.y, p.z, q.x, q.y, q.z, cutter.r, cutter.kind === 'drill', OP_COLORS[m.op]);
    }
    return removed;
  };

  const showFinished = (on: boolean) => {
    finished.visible = on;
    stock.group.visible = !on;
  };

  const reset = () => {
    t = 0;
    cursor = 0;
    cutCursor = 0;
    stock.reset();
    chips.clear();
    showFinished(false);
    place(0);
    if (reducedMotion) {
      t = end;
      place(total);
      showFinished(true);
    }
    stock.flush();
    chips.move(0);
  };

  return {
    group,
    fitRadius: 112,
    show(on) {
      group.visible = on;
    },
    reset,
    update(dt) {
      if (reducedMotion) return;
      const t0 = t;
      t += dt;
      if (t > end + 0.6) {
        reset();
        return;
      }
      const removed = t0 < total ? cutBetween(t0, Math.min(t, total)) : 0;
      stock.flush();
      place(Math.min(t, total));
      const cutter = cutters[current.tool];
      if (!current.dwell && t < total) cutter.spin.rotation.y -= dt * Math.PI * 2 * (cutter.kind === 'face' ? 3 : 6);
      if (removed > 0.4) chips.spawn(tip, cutter.r, Math.min(4, Math.ceil(removed / 25)));
      chips.move(dt);
      showFinished(t >= total);
    },
    notes() {
      const reached = t >= total ? OPS.length : current.op + 1;
      return anchors.map((n, i) => (i < reached ? n : null));
    },
    step: () => (t >= total ? OPS.length : current.op),
    hud() {
      // The jaws held the bottom stock, so the part comes off for a second hold.
      if (t >= total) return '가공 완료 · 바닥은 다시 물려 정리';
      const cutter = cutters[current.tool];
      return current.dwell ? `공구 교환 · ${cutter.name}` : `${pad2(current.op + 1)} ${current.name} · ${cutter.short}`;
    },
    done: () => !reducedMotion && t >= end,
  };
}

function buildPart(reducedMotion: boolean): ModelView {
  const root = new Group();
  const body = new Group();
  body.rotation.x = -Math.PI / 2;
  body.position.y = -15;
  root.add(body);
  const edgeMat = new LineBasicMaterial({ color: INK });
  const machining = buildMachining(edgeMat, reducedMotion);
  root.add(machining.group);
  const stages: Stage[] = [
    buildModeling(body, edgeMat, reducedMotion),
    buildRecognition(body, edgeMat, reducedMotion),
    machining,
  ];
  let layer = 0;
  const view: ModelView = {
    root,
    fitRadius: 84,
    view: new Vector3(1, 0.95, 1.55),
    setLayer(next: number) {
      layer = next;
      stages.forEach((s, i) => s.show(i === next));
      body.visible = next < 2;
      stages[next].reset();
      view.fitRadius = stages[next].fitRadius;
    },
    notes: (l: number) => stages[l].notes(),
    update: (_time: number, dt: number) => stages[layer].update(dt),
    step: () => stages[layer].step(),
    hud: () => stages[layer].hud(),
    done: () => stages[layer].done(),
  };
  return view;
}

// ---------- furniture (one studio wall: wardrobe, fridge cabinet, base and upper cabinets) ----------

// 가구빌더 defaults (wedraw-sketchup): 18 mm body, a 3 mm back set 18 mm in from the rear in
// 4 mm grooves, full-overlay doors 18 mm thick standing 4 mm proud, 100 mm legs behind an
// 18 mm kickboard 50 mm back from the front, a 12 mm worktop. Body sizes include the doors,
// the plinth and the worktop. Millimetres, y up from the floor, z out from the back wall.
const FB = { t: 18, back: 3, backInset: 18, groove: 4, gap: 4, door: 18, plinth: 100, kickBack: 50, worktop: 12 };
const DOOR_ZONE = FB.gap + FB.door;
// Top and bottom boards start at the back's groove and run to the carcass front.
const BOARD_Z = FB.backInset + FB.groove;
const DOOR_OPEN = (100 * Math.PI) / 180;
const FURN_SCALE = 0.125;
const UNIT = new BoxGeometry(1, 1, 1);
const UNIT_EDGES = new EdgesGeometry(UNIT);

const ROLE_TINT: Record<PanelRole, string> = {
  side: TINTS.side,
  board: TINTS.board,
  shelf: TINTS.shelf,
  back: TINTS.back,
  door: TINTS.door,
  kick: TINTS.kick,
};

interface Slab {
  size: Vector3;
  at: Vector3;
}

function box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number): Slab {
  return { size: new Vector3(x1 - x0, y1 - y0, z1 - z0), at: new Vector3((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2) };
}

// A box drawn from the unit cube: scale is its size, position its centre.
function slab(material: Material | Material[], edge: LineBasicMaterial, s?: Slab): Mesh {
  const mesh = new Mesh(UNIT, material);
  mesh.add(new LineSegments(UNIT_EDGES, edge));
  if (s) {
    mesh.scale.copy(s.size);
    mesh.position.copy(s.at);
  }
  return mesh;
}

function tinted(hex: number): MeshLambertMaterial {
  const m = faceMaterial();
  m.color.setHex(hex);
  return m;
}

type ModuleKind = 'tall' | 'base' | 'upper' | 'flap';

interface ModuleSpec {
  name: string;
  kind: ModuleKind;
  x: number;
  y: number;
  w: number;
  h: number;
  d: number;
  doors: number;
  shelves: number;
  // Wardrobe: a board this far above the carcass bottom with a hanging rail under it.
  divider?: number;
  // Door-material end panels inside the body width; `down` stretches them to the floor.
  ends?: { left?: boolean; right?: boolean; down?: number };
}

// One wall of a studio: wardrobe, the fridge slot under a flap cabinet framed by end panels,
// then the kitchen run. Depths follow the builder demo (wardrobe 600, fridge cabinet 680,
// base 580, upper 350); a 60 mm filler meets the left wall.
const ROOM = { h: 2380, left: 0, right: 4400, front: 1500, wall: 100 };
const FILLER = 60;
const MODULES: ModuleSpec[] = [
  { name: '붙박이장 900', kind: 'tall', x: 60, y: 0, w: 900, h: 2300, d: 600, doors: 2, shelves: 0, divider: 1700 },
  { name: '붙박이장 600', kind: 'tall', x: 960, y: 0, w: 600, h: 2300, d: 600, doors: 1, shelves: 4 },
  { name: '냉장고장', kind: 'flap', x: 1560, y: 1950, w: 950, h: 350, d: 680, doors: 1, shelves: 0, ends: { left: true, right: true, down: 1950 } },
  { name: '하부장 600', kind: 'base', x: 2510, y: 0, w: 600, h: 850, d: 580, doors: 1, shelves: 1 },
  { name: '하부장 900', kind: 'base', x: 3110, y: 0, w: 900, h: 850, d: 580, doors: 2, shelves: 1, ends: { right: true } },
  { name: '상부장 600', kind: 'upper', x: 2510, y: 1500, w: 600, h: 800, d: 350, doors: 1, shelves: 2 },
  { name: '상부장 900', kind: 'upper', x: 3110, y: 1500, w: 900, h: 800, d: 350, doors: 2, shelves: 2, ends: { right: true } },
];
// The base cabinet assembled panel by panel in the last layer.
const BUILT = 4;

type PieceRole = PanelRole | 'trim' | 'rod';

interface Piece {
  role: PieceRole;
  part: 'side' | 'bottom' | 'top' | 'rail' | 'back' | 'shelf' | 'divider' | 'rod' | 'door' | 'kick' | 'end';
  s: Slab;
  // Doors: the hinge edge (-1 left, 1 right, 0 top for a lift-up flap).
  hinge?: number;
}

// Panels of one module in its own frame: x across from its left edge, y up from its bottom,
// z out from the wall.
function modulePieces(m: ModuleSpec): Piece[] {
  const { t } = FB;
  const out: Piece[] = [];
  const add = (role: PieceRole, part: Piece['part'], s: Slab, hinge?: number) => out.push({ role, part, s, hinge });
  const floor = m.kind === 'tall' || m.kind === 'base';
  const y0 = floor ? FB.plinth : 0;
  const y1 = m.kind === 'base' ? m.h - FB.worktop : m.h;
  const cd = m.d - DOOR_ZONE;
  const x0 = m.ends?.left ? t : 0;
  const x1 = m.w - (m.ends?.right ? t : 0);
  const endY0 = (m.kind === 'upper' ? -20 : 0) - (m.ends?.down ?? 0);
  if (m.ends?.left) add('trim', 'end', box(0, t, endY0, y1, 0, m.d));
  if (m.ends?.right) add('trim', 'end', box(m.w - t, m.w, endY0, y1, 0, m.d));
  // Sides run the full carcass height; the boards sit between them.
  add('side', 'side', box(x0, x0 + t, y0, y1, 0, cd));
  add('side', 'side', box(x1 - t, x1, y0, y1, 0, cd));
  const ix0 = x0 + t;
  const ix1 = x1 - t;
  add('board', 'bottom', box(ix0, ix1, y0, y0 + t, BOARD_Z, cd));
  if (m.kind === 'base') {
    // Base preset: rails instead of a top board, and a handle channel 40 deep and 60 high.
    add('board', 'rail', box(ix0, ix1, y1 - t, y1, BOARD_Z, BOARD_Z + 80));
    add('board', 'rail', box(ix0, ix1, y1 - t, y1, cd - 120, cd - 40));
    add('board', 'rail', box(ix0, ix1, y1 - 60, y1 - t, cd - 40 - t, cd - 40));
  } else {
    add('board', 'top', box(ix0, ix1, y1 - t, y1, BOARD_Z, cd));
  }
  // The back's tongues sit 6.5 mm into each side's groove.
  add('back', 'back', box(ix0 - 6.5, ix1 + 6.5, y0, y1, FB.backInset, FB.backInset + FB.back));
  let shelfTop = y1 - t;
  if (m.divider) {
    const dy = y0 + m.divider;
    add('board', 'divider', box(ix0, ix1, dy - t, dy, BOARD_Z, cd));
    // Ø25 hanging rail, its centre 50 mm under the compartment top.
    const ry = dy - t - 50;
    const rz = (BOARD_Z + cd) / 2;
    add('rod', 'rod', box(ix0, ix1, ry - 12.5, ry + 12.5, rz - 12.5, rz + 12.5));
    shelfTop = dy - t;
  }
  for (let i = 1; i <= m.shelves; i++) {
    // Shelves stop 80 mm short of the front and run back to the back panel.
    const y = y0 + t + ((shelfTop - y0 - t) * i) / (m.shelves + 1);
    add('shelf', 'shelf', box(ix0 + 0.5, ix1 - 0.5, y - t / 2, y + t / 2, BOARD_Z, cd - 80));
  }
  // Doors cover the carcass with 3 mm between leaves; upper doors hang 20 mm below as a pull.
  const dy0 = m.kind === 'upper' ? -20 : y0;
  const dy1 = m.kind === 'base' ? y1 - 60 : y1;
  const leaf = (x1 - x0 - 3 * m.doors) / m.doors;
  for (let i = 0; i < m.doors; i++) {
    const a = x0 + 1.5 + i * (leaf + 3);
    const hinge = m.kind === 'flap' ? 0 : m.doors === 2 && i === 1 ? 1 : -1;
    add('door', 'door', box(a, a + leaf, dy0, dy1, cd + FB.gap, m.d), hinge);
  }
  if (floor) add('kick', 'kick', box(x0, x1, 0, FB.plinth, cd - FB.kickBack - t, cd - FB.kickBack));
  return out;
}

interface ModuleView {
  spec: ModuleSpec;
  group: Group;
  items: { piece: Piece; obj: Object3D; home: Vector3 }[];
  // Swings every door open by k (0–1).
  open(k: number): void;
}

function buildModule(m: ModuleSpec, mats: Record<PieceRole, Material>, edge: LineBasicMaterial): ModuleView {
  const group = new Group();
  group.position.set(m.x, m.y, 0);
  const doors: { pivot: Group; hinge: number }[] = [];
  const items = modulePieces(m).map((piece) => {
    let obj: Object3D;
    if (piece.part === 'rod') {
      const geo = new CylinderGeometry(12.5, 12.5, piece.s.size.x, 20);
      obj = new Mesh(geo, mats.rod);
      obj.rotation.z = Math.PI / 2;
      obj.position.copy(piece.s.at);
    } else if (piece.part === 'door') {
      // The leaf hangs from a pivot on its hinge edge.
      const { size, at } = piece.s;
      const pivot = new Group();
      const hx = piece.hinge === 1 ? at.x + size.x / 2 : piece.hinge === -1 ? at.x - size.x / 2 : at.x;
      const hy = piece.hinge === 0 ? at.y + size.y / 2 : at.y;
      pivot.position.set(hx, hy, at.z + size.z / 2);
      const leafMesh = slab(mats.door, edge);
      leafMesh.scale.copy(size);
      leafMesh.position.set(at.x - hx, at.y - hy, -size.z / 2);
      pivot.add(leafMesh);
      doors.push({ pivot, hinge: piece.hinge ?? -1 });
      obj = pivot;
    } else {
      obj = slab(mats[piece.role], edge, piece.s);
    }
    group.add(obj);
    return { piece, obj, home: obj.position.clone() };
  });
  return {
    spec: m,
    group,
    items,
    open(k) {
      for (const d of doors) {
        if (d.hinge === 0) d.pivot.rotation.x = -DOOR_OPEN * k;
        else d.pivot.rotation.y = d.hinge * DOOR_OPEN * k;
      }
    },
  };
}

// Panel-role tints for the builder and factory views.
function roleMats(): Record<PieceRole, Material> {
  const out = {} as Record<PieceRole, Material>;
  (Object.keys(ROLE_TINT) as PanelRole[]).forEach((role) => (out[role] = tinted(tint(ROLE_TINT[role], 1))));
  out.trim = tinted(tint(TINTS.door, 0.75));
  out.rod = metal(0xa8ada5);
  return out;
}

// What the finished furniture looks like: white body, oak doors and trim, a stone worktop.
const FINISH = { body: 0xf3f2ec, back: 0xe4e2da, oak: 0xc29a74, stone: 0xf6f5f1, wall: 0xf3f1ea, floor: 0xeadfc8 };

function finishMats(): Record<PieceRole, Material> {
  const body = tinted(FINISH.body);
  const oak = tinted(FINISH.oak);
  return {
    side: body,
    board: body,
    shelf: body,
    back: tinted(FINISH.back),
    door: oak,
    kick: oak,
    trim: oak,
    rod: metal(0xa8ada5),
  };
}

// Pieces of the wall that belong to no single module, in room coordinates.
function wallExtras() {
  const t = FB.t;
  const base = MODULES.filter((m) => m.kind === 'base');
  const bx0 = Math.min(...base.map((m) => m.x));
  const bx1 = Math.max(...base.map((m) => m.x + m.w));
  return {
    worktop: box(bx0, bx1, 850 - FB.worktop, 850, 0, 580),
    // Top surround up to the ceiling over the tall units, the fridge cabinet and the uppers.
    surround: [
      box(FILLER, 1560, 2300, ROOM.h, 600 - t, 600),
      box(1560, 2510, 2300, ROOM.h, 680 - t, 680),
      box(2510, 4010, 2300, ROOM.h, 350 - t, 350),
    ],
    filler: box(0, FILLER, 0, ROOM.h, 600 - t, 600),
    // 19 mm wall batten the upper cabinets hang on through notches in their sides.
    batten: box(2510, 4010, 2300 - t - 100, 2300 - t, 0, 19),
    fridge: box(1560 + t + 12, 2510 - t - 12, 0, 1820, 20, 700),
  };
}

// Back and left walls cut like a section, and the floor.
function buildRoom(edge: LineBasicMaterial) {
  const group = new Group();
  const wallMat = tinted(FINISH.wall);
  const cutMat = tinted(0x737a75);
  const wallMats = [wallMat, wallMat, cutMat, wallMat, wallMat, wallMat];
  const walls = new Group();
  walls.add(slab(wallMats, edge, box(-ROOM.wall, ROOM.right, 0, ROOM.h, -ROOM.wall, 0)));
  walls.add(slab(wallMats, edge, box(-ROOM.wall, 0, 0, ROOM.h, 0, ROOM.front)));
  const floor = slab(tinted(FINISH.floor), edge, box(-ROOM.wall, ROOM.right, -30, 0, -ROOM.wall, ROOM.front));
  const planks: number[] = [];
  for (let z = 150; z < ROOM.front; z += 150) planks.push(0, 0.5, z, ROOM.right, 0.5, z);
  const plankLines = new LineSegments(
    new BufferGeometry().setAttribute('position', new Float32BufferAttribute(planks, 3)),
    new LineBasicMaterial({ color: INK, transparent: true, opacity: 0.22 }),
  );
  group.add(walls, floor, plankLines);
  return { group, walls, floor };
}

// Straight tool moves timed in seconds.
interface Leg {
  from: Vector3;
  to: Vector3;
  start: number;
  end: number;
  cut: boolean;
}

function planLegs(start: Vector3, t0: number, plan: [Vector3, number, boolean][]): Leg[] {
  const legs: Leg[] = [];
  let at = start.clone();
  let clock = t0;
  for (const [to, speed, cut] of plan) {
    const dur = at.distanceTo(to) / speed;
    if (dur <= 1e-6) continue;
    legs.push({ from: at.clone(), to: to.clone(), start: clock, end: clock + dur, cut });
    clock += dur;
    at = to.clone();
  }
  return legs;
}

function legAt(legs: Leg[], t: number, out: Vector3): Leg {
  const leg = legs.find((l) => t < l.end) ?? legs[legs.length - 1];
  const k = leg.end > leg.start ? clamp01((t - leg.start) / (leg.end - leg.start)) : 1;
  out.copy(leg.from).lerp(leg.to, k);
  return leg;
}

// A furniture layer: its own group, camera direction and live labels.
type FurnitureStage = Stage & { group: Group; view: Vector3; labels?(): Label[] };

const DESIGN_STEPS = ['벽 그리기 · 높이 2380', '붙박이장 · 900 + 600', '냉장고 자리 · 950', '하부장 · 600 + 900', '상부장 · 바닥에서 1500', '패널과 문 · 장 7개'];

// Layer 0: the wall is drawn in SketchUp; the furniture builder places runs, splits them
// into cabinets and turns each cabinet into panels and doors.
function buildDesign(edge: LineBasicMaterial, reducedMotion: boolean): FurnitureStage {
  const group = new Group();
  group.scale.setScalar(FURN_SCALE);
  group.position.set(-2150 * FURN_SCALE, -1190 * FURN_SCALE, -300 * FURN_SCALE);
  const room = buildRoom(edge);
  group.add(room.group);

  // SketchUp's red, green and blue axes from the room corner.
  const axes: [Vector3, number, number][] = [
    [AX, 4800, 0xc4473a],
    [AZ, 1900, 0x3f8a4a],
    [AY, 2700, BLUE],
  ];
  for (const [dir, len, hex] of axes) {
    const geo = new BufferGeometry().setFromPoints([new Vector3(0, 1, 1), dir.clone().multiplyScalar(len).add(new Vector3(0, 1, 1))]);
    group.add(new Line(geo, new LineBasicMaterial({ color: hex })));
  }

  // Builder boxes: whole runs first, then the cabinets they split into.
  const boxMat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, depthWrite: false });
  const boxLine = new LineBasicMaterial({ color: BLUE });
  const ghost = (s: Slab) => {
    const m = new Mesh(UNIT, boxMat);
    m.add(new LineSegments(UNIT_EDGES, boxLine));
    m.scale.copy(s.size);
    m.position.copy(s.at);
    group.add(m);
    return m;
  };
  const runs = [
    { run: box(60, 1560, 0, 2300, 0, 600), cut: 960, at: [1.6, 2.2, 2.8] },
    { run: box(2510, 4010, 0, 850, 0, 580), cut: 3110, at: [4.0, 4.5, 5.0] },
    { run: box(2510, 4010, 1500, 2300, 0, 350), cut: 3110, at: [5.2, 5.7, 6.2] },
  ].map((r) => {
    const { size, at } = r.run;
    const x0 = at.x - size.x / 2;
    const x1 = at.x + size.x / 2;
    const y0 = at.y - size.y / 2;
    const y1 = at.y + size.y / 2;
    const z1 = at.z + size.z / 2;
    const whole = ghost(r.run);
    const halves = [box(x0, r.cut, y0, y1, 0, z1), box(r.cut, x1, y0, y1, 0, z1)].map(ghost);
    const splitGeo = new BufferGeometry().setFromPoints([new Vector3(r.cut, y1, z1), new Vector3(r.cut, y0, z1)]);
    const split = new Line(splitGeo, new LineBasicMaterial({ color: ACCENT }));
    group.add(split);
    const widths = [r.cut - x0, x1 - r.cut];
    const marks = [new Vector3((x0 + r.cut) / 2, y1 + 80, z1), new Vector3((r.cut + x1) / 2, y1 + 80, z1)];
    return { whole, halves, split, at: r.at, widths, marks };
  });
  // The fridge slot is an empty place in the run, with the flap cabinet over it.
  const slotGeo = new EdgesGeometry(new BoxGeometry(950, 1950, 680));
  const slot = new LineSegments(slotGeo, new LineDashedMaterial({ color: BLUE, dashSize: 60, gapSize: 40 }));
  slot.computeLineDistances();
  slot.position.set(1560 + 475, 975, 340);
  group.add(slot);
  const flapBox = ghost(box(1560, 2510, 1950, 2300, 0, 680));
  const slotAt: [number, number] = [3.0, 3.8];

  const mats = roleMats();
  const modules = MODULES.map((m) => buildModule(m, mats, edge));
  modules.forEach((m) => group.add(m.group));
  const extras = wallExtras();
  const worktop = slab(tinted(0xe9e7df), edge, extras.worktop);
  const trims = [...extras.surround, extras.filler].map((s) => slab(mats.trim, edge, s));
  group.add(worktop, ...trims);
  const panelAt = 6.5;
  const moduleGap = 0.32;
  const extrasAt = panelAt + MODULES.length * moduleGap + 0.2;
  const end = 11.4;
  // Which builder box stands for each module until its panels appear.
  const boxOf = [runs[0].halves[0], runs[0].halves[1], flapBox, runs[1].halves[0], runs[1].halves[1], runs[2].halves[0], runs[2].halves[1]];

  let t = 0;
  const apply = () => {
    const w = ease(span(t, 0.3, 1.4));
    room.walls.scale.y = Math.max(w, 0.001);
    runs.forEach((r) => {
      const [show, cut, done] = r.at;
      r.whole.visible = t >= show && t < done;
      r.split.visible = t >= cut && t < done + 0.2;
      r.split.scale.y = Math.max(ease(span(t, cut, done)), 0.001);
    });
    modules.forEach((m, i) => {
      const from = panelAt + i * moduleGap;
      const placed = i === 2 ? t >= slotAt[0] : t >= runs[i < 2 ? 0 : i < 5 ? 1 : 2].at[2];
      boxOf[i].visible = placed && t < from + 0.15;
      m.items.forEach((it, k) => (it.obj.visible = t >= from + k * 0.025));
      m.open(0);
    });
    slot.visible = t >= slotAt[0] && t < panelAt + 2 * moduleGap;
    worktop.visible = t >= extrasAt;
    trims.forEach((m) => (m.visible = t >= extrasAt + 0.15));
  };
  const step = () =>
    t < 1.5 ? 0 : t < runs[0].at[2] + 0.1 ? 1 : t < slotAt[1] + 0.1 ? 2 : t < runs[1].at[2] + 0.1 ? 3 : t < runs[2].at[2] + 0.2 ? 4 : 5;

  return {
    group,
    view: new Vector3(0.42, 0.5, 1.6),
    fitRadius: 205,
    show(on) {
      group.visible = on;
    },
    reset() {
      t = reducedMotion ? end : 0;
      apply();
    },
    update(dt) {
      if (reducedMotion) return;
      t += dt;
      if (t > end + 0.6) t = 0;
      apply();
    },
    notes: () => [],
    step,
    hud: () => `${pad2(step() + 1)} ${DESIGN_STEPS[step()]}`,
    done: () => !reducedMotion && t >= end,
    labels() {
      const r = runs.find((x) => t >= x.at[1] && t < x.at[2] + 0.6);
      if (r) return r.marks.map((anchor, i) => ({ anchor, owner: group, text: String(r.widths[i]) }));
      if (t >= slotAt[0] && t < slotAt[1] + 0.6) return [{ anchor: new Vector3(2035, 2380, 680), owner: group, text: '950' }];
      return [];
    },
  };
}

// Sheet 5 of 9 of the demo kitchen's 18T body material as prisme-engine's nesting planner
// lays it out with its defaults (10 mm trim, Ø6 tool + 0.3 spacing, small parts first, then
// columns from the right), in cut order. x runs along the 2440 side, y along the 1220 side.
const NEST_SHEET: { name: string; role: PanelRole; x: number; y: number; w: number; h: number }[] = [
  { name: '밴드목', role: 'board', x: 2229.2, y: 10, w: 80, h: 563 },
  { name: '밴드목', role: 'board', x: 2315.5, y: 10, w: 80, h: 563 },
  { name: '밴드목', role: 'board', x: 10, y: 1088.6, w: 863, h: 80 },
  { name: '밴드목', role: 'board', x: 879.3, y: 1088.6, w: 563, h: 80 },
  { name: '우측판', role: 'side', x: 1622.6, y: 816.3, w: 800, h: 328 },
  { name: '우측판', role: 'side', x: 1894.9, y: 10, w: 328, h: 800 },
  { name: '우측판', role: 'side', x: 1330.6, y: 10, w: 558, h: 738 },
  { name: '우측판', role: 'side', x: 816.3, y: 754.3, w: 800, h: 328 },
  { name: '우측판', role: 'side', x: 766.3, y: 10, w: 558, h: 738 },
  { name: '우측판', role: 'side', x: 10, y: 754.3, w: 800, h: 328 },
  { name: '좌측판', role: 'side', x: 10, y: 10, w: 750, h: 658 },
];
const SHEET = { w: 2440, d: 1220, t: 18 };
// The 900 base cabinet's side, cut seventh on that sheet, goes on to the edge bander.
const NEST_PICK = 6;
const SHEET_RAW = 0xece8dc;
const DRILLED = 0x2c322e;

// That side panel lying flat: its height (738) along x, depth (558) along z with the
// front edge at +z.
const SIDE = { l: 738, d: 558, t: 18 };
// Holes and the groove are drawn 2.5 times their size; at true size a Ø3 hole is under 2 px.
const HOLE_DRAW = 2.5;

// The side's machining from the 900 base cabinet, in its flat frame (u along the height,
// 0 at mid-height; z along the depth): connector through holes for the bottom board (three,
// 80 mm in and at most 300 apart) and the rails; shelf pins Ø3 in two columns 50 mm in from
// the shelf edges; hinge-plate pilots Ø3, 37 mm in, 32 apart; the back groove 4 wide,
// 18–22 mm from the rear edge.
function sideMachining() {
  const m = MODULES[BUILT];
  const y0 = FB.plinth;
  const y1 = m.h - FB.worktop;
  const cd = m.d - DOOR_ZONE;
  const u = (y: number) => y - (y0 + y1) / 2;
  const z = (zc: number) => zc - cd / 2;
  const through = [
    ...[80, 268, 456].map((a) => ({ u: u(y0 + 9), z: z(cd - a) })),
    { u: u(y1 - 9), z: z(BOARD_Z + 40) },
    { u: u(y1 - 9), z: z(cd - 80) },
    { u: u(y1 - 39), z: z(cd - 49) },
  ].map((h) => ({ ...h, r: 3, face: 'top' as const }));
  const shelfY = y0 + FB.t + (y1 - FB.t - y0 - FB.t) / 2;
  const pinY = shelfY - FB.t / 2 - 3.75;
  const pins = [pinY - 32, pinY, pinY + 32].flatMap((y) =>
    [BOARD_Z + 50, cd - 80 - 50].map((zc) => ({ u: u(y), z: z(zc), r: 1.5, face: 'bottom' as const })),
  );
  const pilots = [y0 + 100, y1 - 60 - 100].flatMap((y) =>
    [y - 16, y + 16].map((yy) => ({ u: u(yy), z: z(cd - 37), r: 1.5, face: 'bottom' as const })),
  );
  // Through-feed: the panel runs in +x, so holes nearer the leading end come first.
  const holes = [...through, ...pins, ...pilots].sort((a, b) => b.u - a.u || a.z - b.z);
  return { holes, groove: z(FB.backInset + FB.groove / 2) };
}
const SIDE_MACHINING = sideMachining();

// The side panel with its label, edge bands and machining, hidden until each is made.
function sidePanel(edge: LineBasicMaterial) {
  const group = new Group();
  const bodyMat = tinted(tint(TINTS.side, 1));
  bodyMat.transparent = true;
  const body = slab(bodyMat, edge, box(-SIDE.l / 2, SIDE.l / 2, 0, SIDE.t, -SIDE.d / 2, SIDE.d / 2));
  group.add(body);
  const label = new Group();
  label.add(slab(faceMaterial(), edge, box(-50, 50, SIDE.t, SIDE.t + 1, -25, 25)));
  label.add(slab(tinted(DRILLED), edge, box(-44, -22, SIDE.t + 1, SIDE.t + 1.5, -11, 11)));
  group.add(label);
  const bandMat = tinted(ACCENT);
  // Front, rear and bottom edges get 0.8 mm tape (drawn 4 mm); the worktop covers the top.
  const bands = {
    front: new Mesh(UNIT, bandMat),
    rear: new Mesh(UNIT, bandMat),
    bottom: new Mesh(UNIT, bandMat),
  };
  Object.values(bands).forEach((b) => {
    b.visible = false;
    group.add(b);
  });
  const holeMat = new MeshBasicMaterial({ color: DRILLED, side: DoubleSide });
  const holes = SIDE_MACHINING.holes.map((h) => {
    const g = new Group();
    for (const y of h.face === 'top' ? [SIDE.t + 0.4, -0.4] : [-0.4]) {
      const m = new Mesh(new CircleGeometry(h.r * HOLE_DRAW, 20), holeMat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(h.u, y, h.z);
      g.add(m);
    }
    g.visible = false;
    group.add(g);
    return g;
  });
  const groove = new Mesh(UNIT, tinted(0x59605a));
  groove.visible = false;
  group.add(groove);
  return {
    group,
    bodyMat,
    holes,
    // Tape along one edge from `from` to `to` in that edge's own coordinate.
    setBand(edgeName: 'front' | 'rear' | 'bottom', from: number, to: number) {
      const b = bands[edgeName];
      b.visible = to - from > 0.5;
      if (edgeName === 'bottom') {
        b.scale.set(4, SIDE.t + 1, Math.max(to - from, 0.01));
        b.position.set(-SIDE.l / 2 - 2, SIDE.t / 2, (from + to) / 2);
      } else {
        const zs = edgeName === 'front' ? 1 : -1;
        b.scale.set(Math.max(to - from, 0.01), SIDE.t + 1, 4);
        b.position.set((from + to) / 2, SIDE.t / 2, zs * (SIDE.d / 2 + 2));
      }
    },
    // Back groove on the underside from u = from to the far end.
    setGroove(from: number) {
      const a = Math.max(-SIDE.l / 2, from);
      groove.visible = a < SIDE.l / 2;
      groove.scale.set(Math.max(SIDE.l / 2 - a, 0.01), 1, FB.groove * HOLE_DRAW);
      groove.position.set((a + SIDE.l / 2) / 2, -0.3, SIDE_MACHINING.groove);
    },
  };
}

function metalBox(hex: number, edge: LineBasicMaterial, s: Slab): Mesh {
  return slab(metal(hex), edge, s);
}

function cylinderY(r: number, y0: number, y1: number, hex: number, edge: LineBasicMaterial, segments = 28): Mesh {
  const geo = new CylinderGeometry(r, r, y1 - y0, segments);
  const m = new Mesh(geo, metal(hex));
  m.position.y = (y0 + y1) / 2;
  m.add(edgesOf(geo, edge));
  return m;
}

// Edge-banding passes: which edge faces the machine, how the panel turns for it, and the
// edge's half length.
const BAND_PASSES: { edge: 'bottom' | 'front' | 'rear'; turn: number; half: number; label: string }[] = [
  { edge: 'bottom', turn: Math.PI / 2, half: SIDE.d / 2, label: '아래' },
  { edge: 'front', turn: 0, half: SIDE.l / 2, label: '앞' },
  { edge: 'rear', turn: Math.PI, half: SIDE.l / 2, label: '뒤' },
];

// Layer 1: the CNC router nests a body sheet exactly as the engine planned it, the edge
// bander tapes the 900 base cabinet's side on three edges, and the skipper (a through-feed
// boring machine) machines it lying inner face down.
function buildFactory(edge: LineBasicMaterial, reducedMotion: boolean): FurnitureStage {
  const group = new Group();
  const machine = 0xb9beb6;
  const dark = 0x8f958d;

  // --- nesting router ---
  const nest = new Group();
  nest.scale.setScalar(FURN_SCALE);
  nest.position.y = -12;
  group.add(nest);
  nest.add(metalBox(machine, edge, box(-1320, 1320, -158, -18, -710, 710)));
  nest.add(metalBox(dark, edge, box(-1200, 1200, -560, -158, -600, 600)));
  nest.add(slab(tinted(SHEET_RAW), edge, box(-SHEET.w / 2, SHEET.w / 2, -SHEET.t, 0, -SHEET.d / 2, SHEET.d / 2)));
  const labelMat = faceMaterial();
  const qrMat = tinted(DRILLED);
  const tints = roleMats();
  // Engine y runs away from the operator, so it maps to -z.
  const cutParts = NEST_SHEET.map((n, i) => {
    const cx = n.x + n.w / 2 - SHEET.w / 2;
    const cz = SHEET.d / 2 - (n.y + n.h / 2);
    const mat = tinted(SHEET_RAW);
    const top = new Mesh(UNIT, mat);
    top.scale.set(n.w, 1, n.h);
    top.position.set(cx, 0.1, cz);
    nest.add(top);
    // 100 × 50 label with its QR code, long side across; small parts get none.
    const label = new Group();
    label.position.set(cx, 0.6, cz);
    if (Math.min(n.w, n.h) > 100) {
      label.add(slab(labelMat, edge, box(-50, 50, 0, 1.5, -25, 25)));
      label.add(slab(qrMat, edge, box(-44, -22, 1.5, 2, -11, 11)));
    }
    nest.add(label);
    return { n, i, cx, cz, top, mat, label, tint: (tints[n.role] as MeshLambertMaterial).color.clone(), done: 0 };
  });

  // Ø6 tool around each part outside its outline, plunging through the sheet.
  const toolR = 3;
  const safe = 80;
  const depth = -SHEET.t - 1;
  const plan: [Vector3, number, boolean][] = [];
  for (const { n, cx, cz } of cutParts) {
    const ax = cx - n.w / 2 - toolR;
    const az = cz - n.h / 2 - toolR;
    const bx = cx + n.w / 2 + toolR;
    const bz = cz + n.h / 2 + toolR;
    plan.push([new Vector3(ax, safe, az), 9000, false], [new Vector3(ax, depth, az), 1400, false]);
    for (const [x, z] of [[bx, az], [bx, bz], [ax, bz], [ax, az]]) plan.push([new Vector3(x, depth, z), 4200, true]);
    plan.push([new Vector3(ax, safe, az), 2400, false]);
  }
  const home = new Vector3(-SHEET.w / 2 - 120, safe, -SHEET.d / 2 - 120);
  plan.push([home, 9000, false]);
  const legs = planLegs(home, 0.3, plan);
  // Four cutting moves per part; the fourth closes its outline.
  const cuts = legs.filter((l) => l.cut);
  cutParts.forEach((c, i) => (c.done = cuts[i * 4 + 3].end));
  const cutEnd = legs[legs.length - 1].end;
  const pickAt = cutEnd + 0.7;

  // Kerf drawn behind the tool in short pieces, and the planned path in faint rust.
  const kerfPos: number[] = [];
  const kerfEnd: number[] = [];
  const planPos: number[] = [];
  for (const l of cuts) {
    planPos.push(l.from.x, 1.2, l.from.z, l.to.x, 1.2, l.to.z);
    const pieces = Math.max(1, Math.ceil(l.from.distanceTo(l.to) / 30));
    for (let i = 0; i < pieces; i++) {
      const a = l.from.clone().lerp(l.to, i / pieces);
      const b = l.from.clone().lerp(l.to, (i + 1) / pieces);
      kerfPos.push(a.x, 1.6, a.z, b.x, 1.6, b.z);
      kerfEnd.push(l.start + ((l.end - l.start) * (i + 1)) / pieces);
    }
  }
  const kerfGeo = new BufferGeometry();
  kerfGeo.setAttribute('position', new Float32BufferAttribute(kerfPos, 3));
  nest.add(new LineSegments(kerfGeo, edge));
  const planGeo = new BufferGeometry();
  planGeo.setAttribute('position', new Float32BufferAttribute(planPos, 3));
  const planLine = new LineSegments(
    planGeo,
    new LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.45, depthTest: false }),
  );
  planLine.renderOrder = 7;
  nest.add(planLine);

  // Gantry across the sheet: posts and beam move in z, the carriage in x, the spindle in y.
  const gantry = new Group();
  nest.add(gantry);
  for (const x of [-1400, 1400]) gantry.add(metalBox(0xc2c6be, edge, box(x - 70, x + 70, -158, 560, -70, 70)));
  gantry.add(metalBox(0xc2c6be, edge, box(-1470, 1470, 480, 640, -90, 90)));
  const carriage = new Group();
  gantry.add(carriage);
  carriage.add(metalBox(0xd6d9d2, edge, box(-130, 130, 440, 690, -130, 130)));
  const spindle = new Group();
  carriage.add(spindle);
  spindle.add(cylinderY(58, 70, 380, 0xa8ada5, edge));
  spindle.add(cylinderY(30, 40, 70, 0xc2c6be, edge));
  const routerBit = cylinderY(toolR, 0, 40, 0x8c928a, edge, 12);
  spindle.add(routerBit);
  spindle.add(metalBox(0xc2c6be, edge, box(-60, 60, 380, 800, -15, 15)));
  const dust = chipSpray(120, 7, 0xe2d8c0, false, 5);
  nest.add(dust.mesh);

  // --- edge bander ---
  const band = new Group();
  band.scale.setScalar(FURN_SCALE);
  band.position.y = 14;
  group.add(band);
  const edgeZ = 320;
  band.add(metalBox(machine, edge, box(-1000, 1000, -420, -30, edgeZ + 12, 640)));
  band.add(metalBox(dark, edge, box(-1000, 1000, -40, 0, 90, edgeZ + 12)));
  band.add(metalBox(dark, edge, box(-1000, 1000, -40, 0, -250, -210)));
  const station = -150;
  band.add(metalBox(0xd6d9d2, edge, box(station - 220, station - 60, -30, 70, edgeZ + 30, 470)));
  const roller = cylinderY(36, -10, 50, 0xa8ada5, edge, 20);
  roller.position.set(station, roller.position.y, edgeZ + 3 + 36);
  band.add(roller);
  band.add(metalBox(0xd6d9d2, edge, box(-740, -460, -30, -10, 380, 630)));
  const coil = cylinderY(120, -10, 16, 0xe7c8b9, edge, 40);
  coil.position.set(-600, coil.position.y, 505);
  band.add(coil);
  band.add(
    new Line(
      new BufferGeometry().setFromPoints([new Vector3(-600, 3, 385), new Vector3(station, 9, edgeZ + 2)]),
      new LineBasicMaterial({ color: ACCENT }),
    ),
  );
  band.add(metalBox(0xd6d9d2, edge, box(320, 440, -30, 90, edgeZ + 16, 470)));
  const banded = sidePanel(edge);
  band.add(banded.group);
  const passLen = 1.5;
  const returnLen = 0.6;
  const bandLen = BAND_PASSES.length * (passLen + returnLen);

  // --- skipper (through-feed boring, top and bottom units) ---
  const bore = new Group();
  bore.scale.setScalar(FURN_SCALE);
  bore.position.y = -4;
  group.add(bore);
  // An open frame of rails and rollers, so the bottom unit can reach the panel.
  for (const z of [-400, 400]) bore.add(metalBox(machine, edge, box(-1100, 1100, -360, -20, z - 40, z + 40)));
  for (const x of [-880, -440, 440, 880]) {
    const r = new Mesh(new CylinderGeometry(10, 10, 800, 16), metal(dark));
    r.rotation.x = Math.PI / 2;
    r.position.set(x, -10, 0);
    bore.add(r);
  }
  bore.add(metalBox(0xc2c6be, edge, box(-110, 110, -360, 600, -660, -540)));
  bore.add(metalBox(0xc2c6be, edge, box(-60, 60, 520, 600, -660, 370)));
  const head = new Group();
  bore.add(head);
  head.add(metalBox(0xd6d9d2, edge, box(-120, 120, 150, 300, -100, 100)));
  head.add(metalBox(0xc2c6be, edge, box(-40, 40, 300, 520, -25, 25)));
  const drill = new Group();
  head.add(drill);
  drill.add(cylinderY(24, 60, 150, 0xa8ada5, edge, 20));
  const bit = cylinderY(4, 0, 60, 0x8c928a, edge, 12);
  drill.add(bit);
  // Bottom unit under the rollers, drilling upwards, and its router for the groove.
  const under = new Group();
  bore.add(under);
  under.add(metalBox(0xd6d9d2, edge, box(-120, 120, -300, -150, -100, 100)));
  const upDrill = new Group();
  under.add(upDrill);
  upDrill.add(cylinderY(24, -150, -60, 0xa8ada5, edge, 20));
  const upBit = cylinderY(4, -60, 0, 0x8c928a, edge, 12);
  upDrill.add(upBit);
  const routerX = -260;
  const grooveRouter = new Group();
  grooveRouter.position.set(routerX, 0, SIDE_MACHINING.groove);
  bore.add(grooveRouter);
  grooveRouter.add(metalBox(0xd6d9d2, edge, box(-90, 90, -300, -150, -80, 80)));
  grooveRouter.add(cylinderY((FB.groove * HOLE_DRAW) / 2, -150, 7, 0x8c928a, edge, 12));
  const bored = sidePanel(edge);
  bore.add(bored.group);
  BAND_PASSES.forEach((p) => bored.setBand(p.edge, -p.half, p.half));
  for (const z of [-150, 150]) bored.group.add(metalBox(DRILLED, edge, box(-SIDE.l / 2 - 70, -SIDE.l / 2, 0, 60, z - 50, z + 50)));

  // Through-feed keys: the panel stops for each hole; the router cuts on the way.
  const keys: { t: number; px: number; hz: number; hole: number; target: number }[] = [];
  let clock = 0.3;
  let px = -SIDE.l / 2 - 700;
  let hz = 0;
  const holes = SIDE_MACHINING.holes;
  keys.push({ t: clock, px, hz, hole: -1, target: 0 });
  holes.forEach((h, i) => {
    clock += Math.max(Math.abs(-h.u - px) / 2200, Math.abs(h.z - hz) / 2600, 0.12);
    px = -h.u;
    hz = h.z;
    keys.push({ t: clock, px, hz, hole: -1, target: i });
    clock += 0.14;
    keys.push({ t: clock, px, hz, hole: i, target: i });
  });
  const drilledAt = keys.filter((k) => k.hole >= 0).map((k) => k.t - 0.07);
  const holesEnd = clock;
  clock += (620 - px) / 1500;
  px = 620;
  keys.push({ t: clock, px, hz: 0, hole: -1, target: holes.length - 1 });
  const flipAt = clock + 0.3;
  const boreLen = flipAt + 1.2;

  // Seconds: nesting and the pick, slide, edge banding, slide, boring and the flip.
  const bandAt = pickAt + 1.0;
  const boreAt = bandAt + 0.7 + bandLen;
  const end = boreAt + 0.7 + boreLen + 1.4;
  const slide = 430;
  const radii = [150, 118, 112];

  let t = 0;
  const tip = new Vector3();
  let cutting = false;
  let current = 0;
  let pass = 0;
  const apply = () => {
    const out1 = ease(span(t, bandAt, bandAt + 0.7));
    const out2 = ease(span(t, boreAt, boreAt + 0.7));
    nest.visible = t < bandAt + 0.7;
    band.visible = t >= bandAt && t < boreAt + 0.7;
    bore.visible = t >= boreAt;
    nest.position.x = -slide * out1;
    band.position.x = slide * (1 - out1) - slide * out2;
    bore.position.x = slide * (1 - out2);

    // Nesting, then the side panel lifts off the sheet.
    const l = legAt(legs, Math.min(t, cutEnd), tip);
    cutting = l.cut && t < cutEnd;
    gantry.position.z = tip.z;
    carriage.position.x = tip.x;
    spindle.position.y = tip.y;
    const kerfCount = kerfEnd.findIndex((e) => e > t);
    kerfGeo.setDrawRange(0, (kerfCount < 0 ? kerfEnd.length : kerfCount) * 2);
    planLine.visible = t < cutEnd;
    current = 0;
    cutParts.forEach((c, i) => {
      c.mat.color.setHex(SHEET_RAW).lerp(c.tint, ease(span(t, c.done, c.done + 0.25)));
      if (t >= c.done) current = i + 1;
      const shown = span(t, cutEnd + 0.05 + i * 0.05, cutEnd + 0.2 + i * 0.05);
      c.label.visible = shown > 0;
      c.label.scale.setScalar(Math.max(ease(shown), 0.001));
      const lift = i === NEST_PICK ? 160 * ease(span(t, pickAt, pickAt + 0.6)) : 0;
      c.top.position.y = 0.1 + lift;
      c.label.position.y = 0.6 + lift;
    });

    // Edge banding: one pass per edge, the panel turned so that edge faces the machine.
    const bt = t - bandAt - 0.7;
    pass = Math.min(Math.max(Math.floor(bt / (passLen + returnLen)), 0), BAND_PASSES.length - 1);
    const p = BAND_PASSES[pass];
    const pt = bt - pass * (passLen + returnLen);
    const run = ease(span(pt, 0, passLen));
    const bx = -p.half - 1100 + (2 * p.half + 1600) * run;
    // Back to the infeed and turned for the next edge.
    const back = pass < BAND_PASSES.length - 1 ? ease(span(pt, passLen, passLen + returnLen)) : 0;
    const next = BAND_PASSES[Math.min(pass + 1, BAND_PASSES.length - 1)];
    const startX = -next.half - 1100;
    banded.group.position.x = bx + (startX - bx) * back;
    banded.group.position.y = 80 * Math.sin(Math.PI * back);
    banded.group.rotation.y = p.turn + (next.turn - p.turn) * back;
    const dist = p.edge === 'bottom' ? SIDE.l / 2 : SIDE.d / 2;
    const nextDist = next.edge === 'bottom' ? SIDE.l / 2 : SIDE.d / 2;
    banded.group.position.z = edgeZ - dist + (dist - nextDist) * back;
    BAND_PASSES.forEach((q, k) => {
      // Length of this edge that has passed the press roller, from its leading end.
      const covered = k < pass || (k === pass && back > 0) ? 2 * q.half : k === pass ? Math.min(Math.max(bx + q.half - station, 0), 2 * q.half) : 0;
      if (q.edge === 'front') banded.setBand('front', q.half - covered, q.half);
      if (q.edge === 'rear') banded.setBand('rear', -q.half, -q.half + covered);
      if (q.edge === 'bottom') banded.setBand('bottom', q.half - covered, q.half);
    });
    if (bt < 0) BAND_PASSES.forEach((q) => banded.setBand(q.edge, 0, 0));

    // Boring: top unit for the through holes, bottom unit for the inner face.
    const st = t - boreAt - 0.7;
    const ki = keys.findIndex((k) => k.t > st);
    const a = keys[Math.max(ki - 1, 0)];
    const b = keys[ki < 0 ? keys.length - 1 : ki];
    const kk = b.t > a.t ? ease(clamp01((st - a.t) / (b.t - a.t))) : 1;
    const bpx = a.px + (b.px - a.px) * kk;
    bored.group.position.x = bpx;
    const target = holes[b.target];
    const hz2 = a.hz + (b.hz - a.hz) * kk;
    head.position.z = target.face === 'top' ? hz2 : head.position.z;
    under.position.z = target.face === 'bottom' ? hz2 : under.position.z;
    const dip = b.hole >= 0 ? Math.sin(Math.PI * clamp01((st - a.t) / (b.t - a.t))) : 0;
    // Through holes are drilled from each face to half the thickness plus 3 mm.
    drill.position.y = target.face === 'top' ? 70 - 64 * dip : 70;
    upDrill.position.y = target.face === 'bottom' ? -40 + 50 * dip : -40;
    const r = target.r * HOLE_DRAW;
    bit.scale.set(r / 4, 1, r / 4);
    upBit.scale.set(r / 4, 1, r / 4);
    bored.holes.forEach((m, i) => (m.visible = st >= drilledAt[i]));
    bored.setGroove(routerX - bpx);
    // See-through while the bottom unit works, then the panel turns over to show it.
    const flip = ease(span(st, flipAt, flipAt + 1.0));
    bored.bodyMat.opacity = st > 0 && st < flipAt ? 0.55 : 0.55 + 0.45 * flip;
    bored.bodyMat.depthWrite = bored.bodyMat.opacity > 0.99;
    bored.group.position.y = 260 * Math.sin((Math.PI / 2) * flip);
    bored.group.rotation.x = Math.PI * flip;
    if (st <= 0) {
      bored.bodyMat.opacity = 1;
      bored.bodyMat.depthWrite = true;
    }
  };
  const step = () => {
    if (t < bandAt + 0.35) return 0;
    if (t < boreAt + 0.35) return 1;
    const st = t - boreAt - 0.7;
    if (st < holesEnd) return 2;
    return st < flipAt ? 3 : 4;
  };

  return {
    group,
    view: new Vector3(0.5, 1.2, 1.4),
    get fitRadius() {
      const k1 = ease(span(t, bandAt, bandAt + 0.7));
      const k2 = ease(span(t, boreAt, boreAt + 0.7));
      return radii[0] + (radii[1] - radii[0]) * k1 + (radii[2] - radii[1]) * k2;
    },
    show(on) {
      group.visible = on;
    },
    reset() {
      t = reducedMotion ? end : 0;
      dust.clear();
      apply();
      dust.move(0);
    },
    update(dt) {
      if (reducedMotion) return;
      t += dt;
      if (t > end + 0.6) {
        t = 0;
        dust.clear();
      }
      apply();
      if (cutting) {
        dust.spawn(tip, toolR, 1);
        routerBit.rotation.y += dt * 40;
      }
      dust.move(dt);
      const banding = t > bandAt && t < boreAt;
      coil.rotation.y -= banding ? dt * 2.5 : 0;
      roller.rotation.y += banding ? dt * 9 : 0;
    },
    notes: () => [],
    step,
    hud() {
      const s = step();
      if (s === 0) {
        if (t < cutEnd) return `01 네스팅 · 몸통재 18T, ${current}/${NEST_SHEET.length}`;
        return t < pickAt ? '01 네스팅 · 라벨 100 × 50' : '01 네스팅 · 하부장 측판 꺼내기';
      }
      if (s === 1) return `02 엣지밴딩 · ${BAND_PASSES[pass].label} 모서리 ${pass + 1}/3`;
      if (s === 2) {
        const st = t - boreAt - 0.7;
        const i = drilledAt.findIndex((d) => d > st);
        const h = holes[i < 0 ? holes.length - 1 : i];
        if (h.face === 'top') return '03 스키퍼 윗면 · 연결 피스 Ø6';
        return Math.abs(h.z - (SIDE.d / 2 - 37)) < 30 ? '03 스키퍼 아랫면 · 경첩 자리 Ø3' : '03 스키퍼 아랫면 · 선반핀 Ø3';
      }
      if (s === 3) return '04 아랫면 라우터 · 뒷판 홈 4×7';
      return '가공 완료 · 측판 안쪽 면';
    },
    done: () => !reducedMotion && t >= end,
  };
}

const INSTALL_STEPS = [
  '몸통 조립 · 연결 피스 12곳',
  '선반과 조절발',
  '걸레받이와 문 · 경첩 4개',
  '설치 · 벽에 붙여 수평 맞춤',
  '상판 · 12T 엔지니어드스톤',
  '상부장 · 보조목에 걸기',
];

// Layer 2: the 900 base cabinet is assembled, then the whole wall goes in: tall units, the
// fridge cabinet and the base run, the worktop, and the upper cabinets on their batten.
function buildInstall(edge: LineBasicMaterial, reducedMotion: boolean): FurnitureStage {
  const group = new Group();
  group.scale.setScalar(FURN_SCALE);
  const mats = finishMats();
  const room = buildRoom(edge);
  group.add(room.group);
  const modules = MODULES.map((m) => buildModule(m, mats, edge));
  modules.forEach((m) => group.add(m.group));
  const built = modules[BUILT];
  const spec = built.spec;
  const extras = wallExtras();
  const worktop = slab(tinted(FINISH.stone), edge, extras.worktop);
  const surround = extras.surround.map((s) => slab(mats.trim, edge, s));
  const filler = slab(mats.trim, edge, extras.filler);
  const batten = slab(tinted(0xd8c2a0), edge, extras.batten);
  const fridge = slab(tinted(0xdcded9), edge, extras.fridge);
  const fridgeLines = new LineSegments(
    new BufferGeometry().setAttribute(
      'position',
      new Float32BufferAttribute([0, -0.1, 0.501, 0, 0.5, 0.501, -0.5, -0.1, 0.501, 0.5, -0.1, 0.501], 3),
    ),
    edge,
  );
  fridge.add(fridgeLines);
  group.add(worktop, ...surround, filler, batten, fridge);

  // Connector heads on the outside of each side, and four levelling feet.
  const sideMesh = built.items.filter((it) => it.piece.part === 'side').map((it) => it.obj);
  const headMat = metal(0x8f958d);
  const heads = SIDE_MACHINING.holes
    .filter((h) => h.face === 'top')
    .flatMap((h) =>
      sideMesh.map((side, k) => {
        const m = new Mesh(new CylinderGeometry(5, 5, 2, 16), headMat);
        m.rotation.z = Math.PI / 2;
        const sx = side.position.x + (k === 0 ? -FB.t / 2 - 1 : FB.t / 2 + 1);
        m.position.set(sx, h.u + (FB.plinth + spec.h - FB.worktop) / 2, h.z + (spec.d - DOOR_ZONE) / 2);
        built.group.add(m);
        return m;
      }),
    );
  const cd = spec.d - DOOR_ZONE;
  const feet = [70, spec.w - 70 - (spec.ends?.right ? FB.t : 0)].flatMap((x) =>
    [BOARD_Z + 60, cd - 120].map((z) => {
      const f = cylinderY(15, 0, FB.plinth, 0x6f756f, edge, 16);
      f.position.x = x;
      f.position.z = z;
      built.group.add(f);
      return f;
    }),
  );

  // Seconds for the assembly; parts come in from these directions.
  const partAt: Record<Piece['part'], [number, number]> = {
    bottom: [0.3, 0.9],
    side: [0.8, 1.5],
    back: [1.6, 2.3],
    rail: [2.3, 2.9],
    top: [2.3, 2.9],
    shelf: [3.4, 4.0],
    divider: [3.4, 4.0],
    rod: [3.4, 4.0],
    kick: [4.6, 5.1],
    door: [5.2, 5.8],
    end: [8.8, 9.3],
  };
  const fromDir = (it: { piece: Piece; home: Vector3 }): Vector3 => {
    switch (it.piece.part) {
      case 'side':
        return new Vector3(it.home.x < spec.w / 2 ? -420 : 420, 0, 0);
      case 'back':
        return new Vector3(0, 900, 0);
      case 'rail':
      case 'top':
        return new Vector3(0, 420, 0);
      case 'end':
        return new Vector3(300, 0, 0);
      case 'bottom':
      case 'shelf':
      case 'door':
      case 'kick':
      default:
        return new Vector3(0, 0, 500);
    }
  };
  const builtFrom = built.items.map((it) => fromDir(it));
  const headsAt: [number, number] = [2.9, 3.2];
  const feetAt: [number, number] = [4.1, 4.5];
  const doorClose: [number, number] = [5.9, 6.5];
  const roomAt: [number, number] = [6.8, 7.6];
  // Order the other modules come in, after the room appears.
  const arrive: Record<number, number> = { 0: 7.7, 1: 7.9, 2: 8.1, 3: 8.3, [BUILT]: 8.5, 5: 10.8, 6: 11.0 };
  const counterAt: [number, number] = [9.6, 10.3];
  const battenAt = 10.4;
  const trimAt = 11.8;
  const showOff: [number, number, number, number] = [12.4, 13.1, 13.8, 14.5];
  const end = 16.0;
  const outZ = 900;

  // Centre of view: the cabinet being built in front of its place, then the whole wall.
  const cabCentre = new Vector3(spec.x + spec.w / 2, spec.h / 2, outZ + spec.d / 2);
  const roomCentre = new Vector3(2150, 1190, 400);
  const centre = new Vector3();

  let t = 0;
  const apply = () => {
    const swing = ease(span(t, showOff[0], showOff[1])) - ease(span(t, showOff[2], showOff[3]));
    built.items.forEach((it, i) => {
      const [a, b] = partAt[it.piece.part];
      it.obj.position.copy(it.home).addScaledVector(builtFrom[i], 1 - ease(span(t, a, b)));
      it.obj.visible = t >= a;
    });
    built.open(t < doorClose[0] ? 1 : Math.max(1 - ease(span(t, ...doorClose)), swing));
    heads.forEach((h) => h.scale.setScalar(Math.max(ease(span(t, ...headsAt)), 0.001)));
    feet.forEach((f) => f.scale.set(1, Math.max(ease(span(t, ...feetAt)), 0.001), 1));

    const r = ease(span(t, ...roomAt));
    room.group.visible = t >= roomAt[0];
    room.walls.scale.y = Math.max(r, 0.001);
    modules.forEach((m, i) => {
      const a = arrive[i];
      const k = ease(span(t, a, a + 0.8));
      if (i !== BUILT) {
        m.group.visible = t >= a;
        m.open(i === 0 ? swing : 0);
      }
      // Upper cabinets come down onto the batten; the rest slide back to the wall.
      if (m.spec.kind === 'upper') m.group.position.set(m.spec.x, m.spec.y + 160 * (1 - k), 120 * (1 - k));
      else m.group.position.set(m.spec.x, m.spec.y, outZ * (1 - k));
    });
    fridge.visible = t >= arrive[2];
    fridge.position.z = extras.fridge.at.z + outZ * (1 - ease(span(t, arrive[2], arrive[2] + 0.8)));
    worktop.visible = t >= counterAt[0];
    worktop.position.y = extras.worktop.at.y + 380 * (1 - ease(span(t, ...counterAt)));
    batten.visible = t >= battenAt;
    batten.scale.x = extras.batten.size.x * Math.max(ease(span(t, battenAt, battenAt + 0.3)), 0.001);
    surround.forEach((s) => (s.visible = t >= trimAt));
    filler.visible = t >= trimAt;
    centre.copy(cabCentre).lerp(roomCentre, ease(span(t, roomAt[0], roomAt[1] + 0.4)));
    group.position.copy(centre).multiplyScalar(-FURN_SCALE);
  };
  const step = () => {
    if (t < headsAt[1]) return 0;
    if (t < feetAt[1] + 0.1) return 1;
    if (t < doorClose[1] + 0.2) return 2;
    if (t < counterAt[0]) return 3;
    if (t < battenAt) return 4;
    return t < trimAt + 0.4 ? 5 : 6;
  };

  return {
    group,
    view: new Vector3(0.45, 0.55, 1.6),
    get fitRadius() {
      return 112 + 95 * ease(span(t, roomAt[0], roomAt[1] + 0.4));
    },
    show(on) {
      group.visible = on;
    },
    reset() {
      t = reducedMotion ? end : 0;
      apply();
    },
    update(dt) {
      if (reducedMotion) return;
      t += dt;
      if (t > end + 0.6) t = 0;
      apply();
    },
    notes: () => [],
    step,
    hud: () => (step() < 6 ? `${pad2(step() + 1)} ${INSTALL_STEPS[step()]}` : '설치 완료 · 원룸 벽 한 면'),
    done: () => !reducedMotion && t >= end,
  };
}

function buildFurniture(reducedMotion: boolean): ModelView {
  const root = new Group();
  const edge = new LineBasicMaterial({ color: INK });
  const stages = [
    buildDesign(edge, reducedMotion),
    buildFactory(edge, reducedMotion),
    buildInstall(edge, reducedMotion),
  ];
  stages.forEach((s) => root.add(s.group));
  let layer = 0;
  const view: ModelView = {
    root,
    fitRadius: stages[0].fitRadius,
    view: stages[0].view.clone(),
    setLayer(next: number) {
      layer = next;
      stages.forEach((s, i) => s.show(i === next));
      stages[next].reset();
      view.fitRadius = stages[next].fitRadius;
      view.view.copy(stages[next].view);
    },
    notes: () => [],
    update(_time: number, dt: number) {
      stages[layer].update(dt);
      view.fitRadius = stages[layer].fitRadius;
    },
    step: () => stages[layer].step(),
    hud: () => stages[layer].hud(),
    done: () => stages[layer].done(),
    labels: () => stages[layer].labels?.() ?? [],
  };
  return view;
}

// ---------- viewport ----------

export interface ViewportOptions {
  reducedMotion: boolean;
  // Play the model's three layers one after another until the reader picks one.
  autoplay: boolean;
  onLayer: (layer: number) => void;
  onStep: (step: number) => void;
}

export class ViewportScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 1, 1600);
  private readonly controls: OrbitControls;
  private readonly overlay: HTMLDivElement;
  private readonly svg: SVGSVGElement;
  private readonly balloons: HTMLSpanElement[] = [];
  private readonly leaders: SVGLineElement[] = [];
  private readonly dots: SVGCircleElement[] = [];
  private readonly labelSpans: HTMLSpanElement[] = [];
  private readonly hud: HTMLSpanElement;
  private readonly part: ModelView;
  private readonly furniture: ModelView;
  private model: ModelId = 'part';
  private layer = 1;
  private width = 1;
  private height = 1;
  // Radius the camera was last fitted to; layers may zoom while they play.
  private fitted = 0;
  private frame = 0;
  private last = 0;
  private visible = true;
  private autoplay: boolean;
  private paused = false;
  private lastStep = -2;
  // Until the reader drags, the model sways a little around its starting view.
  private swaying = true;
  private swayClock = 0;
  private readonly resize: ResizeObserver;
  private readonly intersection: IntersectionObserver;

  constructor(private readonly stage: HTMLElement, private readonly options: ViewportOptions) {
    this.autoplay = options.autoplay && !options.reducedMotion;
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    const canvas = this.renderer.domElement;
    canvas.className = 'vp-canvas';
    stage.appendChild(canvas);

    this.overlay = document.createElement('div');
    this.overlay.className = 'vp-notes';
    this.overlay.setAttribute('aria-hidden', 'true');
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.overlay.appendChild(this.svg);
    stage.appendChild(this.overlay);
    for (let i = 0; i < 6; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '2.5');
      this.svg.append(line, dot);
      this.leaders.push(line);
      this.dots.push(dot);
      const b = document.createElement('span');
      b.className = 'vp-balloon';
      b.textContent = String(i + 1);
      this.overlay.appendChild(b);
      this.balloons.push(b);
    }
    this.hud = document.createElement('span');
    this.hud.className = 'vp-hud';
    this.overlay.appendChild(this.hud);
    for (let i = 0; i < 2; i++) {
      const label = document.createElement('span');
      label.className = 'vp-dim';
      this.overlay.appendChild(label);
      this.labelSpans.push(label);
    }

    this.scene.add(new HemisphereLight(0xffffff, 0xd9d6cc, 2.2));
    const key = new DirectionalLight(0xffffff, 1.6);
    key.position.set(-0.6, 1.4, 1);
    this.camera.add(key);
    this.scene.add(this.camera);

    this.part = buildPart(options.reducedMotion);
    this.furniture = buildFurniture(options.reducedMotion);
    this.scene.add(this.part.root, this.furniture.root);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.minPolarAngle = 0.25;
    this.controls.maxPolarAngle = 1.38;
    this.controls.addEventListener('start', () => (this.swaying = false));
    // Let vertical swipes scroll the page on touch screens; sideways drags rotate.
    canvas.style.touchAction = 'pan-y';

    this.setModel('part');

    this.resize = new ResizeObserver(() => this.onResize());
    this.resize.observe(stage);
    this.intersection = new IntersectionObserver((entries) => {
      this.visible = entries.some((e) => e.isIntersecting);
      if (this.visible) this.start();
    });
    this.intersection.observe(stage);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.onResize();
    this.start();
  }

  setModel(model: ModelId) {
    this.model = model;
    this.part.root.visible = model === 'part';
    this.furniture.root.visible = model === 'furniture';
    this.setLayer(this.layer);
    this.fit();
    this.resetView();
  }

  setLayer(layer: number) {
    this.layer = layer;
    this.current.setLayer(layer);
    this.fit();
    // Layers may look from their own direction; follow it unless the reader has turned the model.
    if (this.swaying) this.sway(0);
  }

  startAutoplay() {
    this.autoplay = !this.options.reducedMotion;
  }

  stopAutoplay() {
    this.autoplay = false;
  }

  // Freezes the animations and the sway; dragging still turns the model.
  setPaused(paused: boolean) {
    this.paused = paused;
  }

  resetView() {
    this.swaying = true;
    this.swayClock = 0;
    this.camera.position.copy(this.current.view).normalize().multiplyScalar(600);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  private sway(dt: number) {
    this.swayClock += dt;
    const angle = Math.sin(this.swayClock * 0.4) * 0.42;
    this.camera.position
      .copy(this.current.view)
      .normalize()
      .multiplyScalar(600)
      .applyAxisAngle(new Vector3(0, 1, 0), angle);
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.resize.disconnect();
    this.intersection.disconnect();
    this.controls.dispose();
    this.scene.traverse((o) => {
      const m = o as Mesh;
      m.geometry?.dispose();
      const mat = m.material as Material | Material[] | undefined;
      (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.overlay.remove();
  }

  private readonly onVisibility = () => {
    if (!document.hidden) this.start();
  };

  private get current(): ModelView {
    return this.model === 'part' ? this.part : this.furniture;
  }

  private start() {
    if (this.frame) return;
    this.last = performance.now();
    const tick = (now: number) => {
      this.frame = 0;
      if (!this.visible || document.hidden) return;
      const dt = Math.min((now - this.last) / 1000, 0.1);
      this.last = now;
      if (!this.paused) {
        if (this.swaying && !this.options.reducedMotion) this.sway(dt);
        this.current.update(now / 1000, dt);
      }
      if (this.current.fitRadius !== this.fitted) this.fit();
      this.controls.update();
      if (this.autoplay && this.current.done?.()) {
        const next = (this.layer + 1) % 3;
        this.setLayer(next);
        this.options.onLayer(next);
      }
      const step = this.current.step?.() ?? -1;
      if (step !== this.lastStep) {
        this.lastStep = step;
        this.options.onStep(step);
      }
      this.renderer.render(this.scene, this.camera);
      this.placeNotes();
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  private onResize() {
    const rect = this.stage.getBoundingClientRect();
    this.width = Math.max(1, Math.round(rect.width));
    this.height = Math.max(1, Math.round(rect.height));
    this.renderer.setSize(this.width, this.height, false);
    this.fit();
    if (!this.frame) {
      this.renderer.render(this.scene, this.camera);
      this.placeNotes();
    }
  }

  private fit() {
    const r = this.current.fitRadius;
    this.fitted = r;
    const aspect = this.width / this.height;
    let halfH = r;
    let halfW = r * aspect;
    if (halfW < r) {
      halfW = r;
      halfH = r / aspect;
    }
    this.camera.left = -halfW;
    this.camera.right = halfW;
    this.camera.top = halfH;
    this.camera.bottom = -halfH;
    this.camera.updateProjectionMatrix();
  }

  private project(local: Vector3, owner: Object3D): Vector2 {
    const v = local.clone().applyMatrix4(owner.matrixWorld).project(this.camera);
    return new Vector2(((v.x + 1) / 2) * this.width, ((1 - v.y) / 2) * this.height);
  }

  private placeNotes() {
    const notes = this.current.notes(this.layer);
    const center = this.project(new Vector3(), this.current.root);
    const reach = Math.min(Math.max(this.width * 0.075, 30), 56);
    const pad = 16;
    const anchors = notes.map((n) => (n ? this.project(n.anchor, n.owner) : null));
    const spots = anchors.map((a) => {
      if (!a) return null;
      const dir = a.clone().sub(center);
      if (dir.lengthSq() < 1) dir.set(1, -1);
      dir.normalize();
      const p = a.clone().addScaledVector(dir, reach);
      p.x = Math.min(Math.max(p.x, pad), this.width - pad);
      p.y = Math.min(Math.max(p.y, pad), this.height - pad);
      return p;
    });
    for (let pass = 0; pass < 4; pass++) {
      for (let i = 0; i < spots.length; i++) {
        for (let j = i + 1; j < spots.length; j++) {
          const si = spots[i];
          const sj = spots[j];
          if (!si || !sj) continue;
          const d = sj.clone().sub(si);
          const len = d.length();
          if (len < 28) {
            const push = d.lengthSq() < 0.01 ? new Vector2(0, 1) : d.normalize();
            si.addScaledVector(push, -(28 - len) / 2);
            sj.addScaledVector(push, (28 - len) / 2);
          }
        }
      }
    }
    this.balloons.forEach((b, i) => {
      const a = anchors[i];
      const s = spots[i];
      const on = !!a && !!s;
      b.style.display = on ? '' : 'none';
      this.leaders[i].style.display = on ? '' : 'none';
      this.dots[i].style.display = on ? '' : 'none';
      if (!a || !s) return;
      b.style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px) translate(-50%, -50%)`;
      const dir = s.clone().sub(a);
      const edge = dir.length() > 12 ? s.clone().addScaledVector(dir.normalize(), -11) : s;
      this.leaders[i].setAttribute('x1', a.x.toFixed(1));
      this.leaders[i].setAttribute('y1', a.y.toFixed(1));
      this.leaders[i].setAttribute('x2', edge.x.toFixed(1));
      this.leaders[i].setAttribute('y2', edge.y.toFixed(1));
      this.dots[i].setAttribute('cx', a.x.toFixed(1));
      this.dots[i].setAttribute('cy', a.y.toFixed(1));
    });

    const caption = this.current.hud?.() ?? '';
    this.hud.style.display = caption ? '' : 'none';
    if (this.hud.textContent !== caption) this.hud.textContent = caption;

    const labels = this.current.labels?.() ?? [];
    this.labelSpans.forEach((span, i) => {
      const l = labels[i];
      span.style.display = l ? '' : 'none';
      if (!l) return;
      const p = this.project(l.anchor, l.owner);
      span.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, -50%)`;
      if (span.textContent !== l.text) span.textContent = l.text;
    });
  }
}
