import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
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
import { FURNITURE_LIMITS, ModelId, TINTS } from './viewport-data';

// Concept models for the home viewport, drawn like a CAD sheet: white faces, ink edges,
// numbered balloons. Units are millimetres; the part is built Z-up and turned Y-up.

const INK = 0x1e2522;
const BLUE = 0x2f5f9e;
const FACE = 0xfbfaf6;
const ACCENT = 0xa75534;

type P2 = [number, number];
type PartTag = 'stock' | 'pocket' | 'counterbore' | 'hole' | 'step' | 'fillet';
type PanelRole = 'side' | 'board' | 'shelf' | 'back' | 'door' | 'kick';

export interface FurnitureParams {
  width: number;
  kick: number;
}

interface Note {
  anchor: Vector3;
  owner: Object3D;
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
    hud: () => (step() < 0 ? 'AI 피처 인식' : `AI 인식 ${pad2(step() + 1)} · ${FEATURE_STEPS[step()]}`),
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

// ---------- furniture (base cabinet) ----------

interface Panel {
  role: PanelRole;
  mesh: Mesh;
  pivot?: Group;
}

const ROLE_TINT: Record<PanelRole, string> = {
  side: TINTS.side,
  board: TINTS.board,
  shelf: TINTS.shelf,
  back: TINTS.back,
  door: TINTS.door,
  kick: TINTS.kick,
};

function buildFurniture(reducedMotion: boolean, onParams: (p: FurnitureParams) => void) {
  const H = 870;
  const D = 580;
  const T = 18;
  const TB = 9;
  const scale = 0.125;
  const root = new Group();
  const body = new Group();
  body.scale.setScalar(scale);
  body.position.y = (-H / 2) * scale;
  root.add(body);

  const unit = new BoxGeometry(1, 1, 1);
  const unitEdges = new EdgesGeometry(unit);
  const edgeMat = new LineBasicMaterial({ color: INK });
  const roleMaterials = new Map<PanelRole, MeshLambertMaterial>();
  const makePanel = (role: PanelRole, parent: Object3D = body): Panel => {
    if (!roleMaterials.has(role)) roleMaterials.set(role, faceMaterial());
    const mesh = new Mesh(unit, roleMaterials.get(role)!);
    mesh.add(new LineSegments(unitEdges, edgeMat));
    parent.add(mesh);
    return { role, mesh };
  };
  const sideL = makePanel('side');
  const sideR = makePanel('side');
  const top = makePanel('board');
  const bottom = makePanel('board');
  const back = makePanel('back');
  const shelf = makePanel('shelf');
  const kick = makePanel('kick');
  const doorPivots = [new Group(), new Group()];
  doorPivots.forEach((p) => body.add(p));
  const doors = doorPivots.map((p) => ({ ...makePanel('door', p), pivot: p }));

  // Dimension lines for the parameter layer.
  const dimMat = new LineBasicMaterial({ color: ACCENT });
  const dims = new LineSegments(new BufferGeometry(), dimMat);
  body.add(dims);

  const graphRoot = new Group();
  body.add(graphRoot);

  let params: FurnitureParams = { width: FURNITURE_LIMITS.width.initial, kick: FURNITURE_LIMITS.kick.initial };
  let layer = 1;
  let auto = !reducedMotion;
  let autoClock = 0;
  const dimAnchors = { width: new Vector3(), kick: new Vector3() };

  const setBox = (p: Panel, sx: number, sy: number, sz: number, x: number, y: number, z: number) => {
    p.mesh.scale.set(sx, sy, sz);
    p.mesh.position.set(x, y, z);
  };

  const apply = () => {
    const W = params.width;
    const K = params.kick;
    const inner = W - 2 * T;
    setBox(sideL, T, H, D, -W / 2 + T / 2, H / 2, 0);
    setBox(sideR, T, H, D, W / 2 - T / 2, H / 2, 0);
    setBox(top, inner, T, D, 0, H - T / 2, 0);
    setBox(bottom, inner, T, D - TB, 0, K + T / 2, TB / 2);
    const backH = H - T - K;
    setBox(back, inner, backH, TB, 0, K + backH / 2, -D / 2 + TB / 2);
    const shelfD = D - TB - 42;
    setBox(shelf, inner - 2, T, shelfD, 0, K + T + (H - 2 * T - K) / 2, -D / 2 + TB + 2 + shelfD / 2);
    setBox(kick, inner, K, T, 0, K / 2, D / 2 - 50 - T / 2);

    const two = W > FURNITURE_LIMITS.twoDoors;
    const doorH = H - K - 4;
    const doorW = two ? W / 2 - 2 : W - 3;
    const open = (100 * Math.PI) / 180;
    doors.forEach((d, i) => {
      const visible = i === 0 || two;
      d.pivot.visible = visible;
      const left = i === 0;
      d.pivot.position.set(left ? -W / 2 : W / 2, K + 2, D / 2);
      d.pivot.rotation.y = left ? -open : open;
      setBox(d, doorW, doorH, T, left ? doorW / 2 : -doorW / 2, doorH / 2, T / 2);
    });

    // W dimension above the front top edge, K dimension at the right of the plinth.
    const yW = H + 90;
    const zF = D / 2;
    const xK = W / 2 + 90;
    const zK = D / 2 - 50;
    const tick = 18;
    const pos = [
      -W / 2, yW, zF, W / 2, yW, zF,
      -W / 2, H + 15, zF, -W / 2, yW + 30, zF,
      W / 2, H + 15, zF, W / 2, yW + 30, zF,
      -W / 2 - tick, yW - tick, zF, -W / 2 + tick, yW + tick, zF,
      W / 2 - tick, yW - tick, zF, W / 2 + tick, yW + tick, zF,
      xK, 0, zK, xK, K, zK,
      W / 2 + 15, 0, zK, xK + 30, 0, zK,
      W / 2 + 15, K, zK, xK + 30, K, zK,
      xK - tick, -tick, zK, xK + tick, tick, zK,
      xK - tick, K - tick, zK, xK + tick, K + tick, zK,
    ];
    dims.geometry.dispose();
    dims.geometry = new BufferGeometry();
    dims.geometry.setAttribute('position', new Float32BufferAttribute(pos, 3));
    dimAnchors.width.set(0, yW, zF);
    dimAnchors.kick.set(xK, K / 2, zK);

    // Panel contact graph: nodes at panel centres.
    graphRoot.clear();
    const parts = [sideL, sideR, top, bottom, back, shelf, kick, ...(two ? doors : [doors[0]])];
    body.updateMatrixWorld(true);
    const nodes = parts.map((p) => {
      const c = new Vector3();
      p.mesh.getWorldPosition(c);
      return body.worldToLocal(c);
    });
    const links: [number, number][] = [
      [0, 2], [1, 2], [0, 3], [1, 3], [0, 4], [1, 4], [2, 4], [3, 4],
      [5, 0], [5, 1], [6, 0], [6, 1], [6, 3], [7, 0],
    ];
    if (two) links.push([8, 1]);
    graphRoot.add(graphOverlay(nodes, links, 14));
  };

  const notes: Note[] = [
    { anchor: new Vector3(0.5, 0.2, 0.1), owner: sideR.mesh },
    { anchor: new Vector3(0.2, 0.5, 0.3), owner: top.mesh },
    { anchor: new Vector3(0.3, 0.5, 0.4), owner: shelf.mesh },
    { anchor: new Vector3(-0.15, -0.42, 0.5), owner: back.mesh },
    { anchor: new Vector3(0, 0.2, -0.5), owner: doors[0].mesh },
    { anchor: new Vector3(0.3, 0, 0.5), owner: kick.mesh },
  ];

  apply();
  const view: ModelView & {
    setParams(p: FurnitureParams): void;
    stopAuto(): void;
    dimNotes(): { width: Vector3; kick: Vector3; owner: Object3D; params: FurnitureParams } | null;
  } = {
    root,
    fitRadius: 112,
    view: new Vector3(0.62, 0.62, 1.6),
    setLayer(next: number) {
      layer = next;
      for (const [role, mat] of roleMaterials) mat.color.setHex(next === 0 ? FACE : tint(ROLE_TINT[role], 1));
      graphRoot.visible = next === 0;
      dims.visible = next === 2;
      autoClock = 0;
    },
    notes(l: number) {
      if (l !== 1) return [];
      return notes;
    },
    update(_time: number, dt: number) {
      if (layer !== 2 || !auto) return;
      autoClock += dt;
      const span = FURNITURE_LIMITS.width;
      const w = span.initial + 240 * Math.sin(autoClock * 0.55);
      const width = Math.round(w / span.step) * span.step;
      if (width !== params.width) {
        params = { ...params, width };
        apply();
        onParams(params);
      }
    },
    setParams(p: FurnitureParams) {
      params = { ...p };
      apply();
    },
    stopAuto() {
      auto = false;
    },
    dimNotes() {
      return layer === 2 ? { width: dimAnchors.width, kick: dimAnchors.kick, owner: body, params } : null;
    },
  };
  return view;
}

// ---------- viewport ----------

export interface ViewportOptions {
  reducedMotion: boolean;
  // Play the part's three layers one after another until the reader picks one.
  autoplay: boolean;
  onParams: (p: FurnitureParams) => void;
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
  private readonly dimLabels: HTMLSpanElement[] = [];
  private readonly hud: HTMLSpanElement;
  private readonly part: ModelView;
  private readonly furniture: ReturnType<typeof buildFurniture>;
  private model: ModelId = 'part';
  private layer = 1;
  private width = 1;
  private height = 1;
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
    for (const name of ['W', 'K']) {
      const label = document.createElement('span');
      label.className = 'vp-dim';
      label.dataset['name'] = name;
      this.overlay.appendChild(label);
      this.dimLabels.push(label);
    }

    this.scene.add(new HemisphereLight(0xffffff, 0xd9d6cc, 2.2));
    const key = new DirectionalLight(0xffffff, 1.6);
    key.position.set(-0.6, 1.4, 1);
    this.camera.add(key);
    this.scene.add(this.camera);

    this.part = buildPart(options.reducedMotion);
    this.furniture = buildFurniture(options.reducedMotion, options.onParams);
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
  }

  stopAutoplay() {
    this.autoplay = false;
  }

  // Freezes the animations and the sway; dragging still turns the model.
  setPaused(paused: boolean) {
    this.paused = paused;
  }

  setParams(p: FurnitureParams) {
    this.furniture.stopAuto();
    this.furniture.setParams(p);
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
      this.controls.update();
      if (this.autoplay && this.model === 'part' && this.current.done?.()) {
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

    const dims = this.model === 'furniture' ? this.furniture.dimNotes() : null;
    this.dimLabels.forEach((label, i) => {
      label.style.display = dims ? '' : 'none';
      if (!dims) return;
      const p = this.project(i === 0 ? dims.width : dims.kick, dims.owner);
      label.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, -50%)`;
      label.textContent = i === 0 ? `W ${dims.params.width}` : `K ${dims.params.kick}`;
    });
  }
}
