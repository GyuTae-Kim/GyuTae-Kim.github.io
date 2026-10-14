import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  DirectionalLight,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  OrthographicCamera,
  Scene,
  ShapeUtils,
  SphereGeometry,
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
  notes(layer: number): Note[];
  update(time: number, dt: number): void;
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

// ---------- machined part ----------

interface PartFace {
  id: string;
  tag: PartTag;
  geometry: BufferGeometry;
  node: Vector3;
}

function buildPart(reducedMotion: boolean): ModelView {
  const root = new Group();
  const body = new Group();
  body.rotation.x = -Math.PI / 2;
  body.position.y = -15;
  root.add(body);

  const faces: PartFace[] = [];
  const add = (id: string, tag: PartTag, geometry: BufferGeometry, node: Vector3) =>
    faces.push({ id, tag, geometry, node });
  const X = new Vector3(1, 0, 0);
  const Y = new Vector3(0, 1, 0);
  const Z = new Vector3(0, 0, 1);

  // Stock 140 × 100 × 30 with R12 corners; the right end is stepped down to 18.
  const cb: P2[] = [[-50, -28], [-50, 28]];
  const drill: P2[] = [[57, -30], [57, 30]];
  const pocketRuns = roundedRectRuns(-30, -24, 30, 24, 8);
  const pocket = joinRuns(pocketRuns);
  const fl = arc(-58, -38, 12, 180, 270, 10);
  const fr = arc(58, -38, 12, 270, 360, 10);
  const br = arc(58, 38, 12, 0, 90, 10);
  const bl = arc(-58, 38, 12, 90, 180, 10);
  const topOutline = joinRuns([[[-58, -50], [45, -50], [45, 50], [-58, 50]], bl, fl]);
  const stepOutline = joinRuns([[[45, -50]], fr, br, [[45, 50]]]);

  add('top', 'stock',
    planar(topOutline, [pocket, circle(cb[0][0], cb[0][1], 9), circle(cb[1][0], cb[1][1], 9)], new Vector3(0, 0, 30), X, Y),
    new Vector3(0, -37, 30));
  add('stepFloor', 'step',
    planar(stepOutline, drill.map(([x, y]) => circle(x, y, 5)), new Vector3(0, 0, 18), X, Y),
    new Vector3(64, 0, 18));
  add('pocketFloor', 'pocket', planar(pocket, [], new Vector3(0, 0, 18), X, Y), new Vector3(0, 0, 18));
  cb.forEach(([x, y], i) =>
    add(`cbFloor${i}`, 'counterbore',
      planar(circle(x, y, 9), [circle(x, y, 5)], new Vector3(0, 0, 18), X, Y),
      new Vector3(x + 7, y, 18)));
  add('front', 'stock',
    planar([[-58, 0], [58, 0], [58, 18], [45, 18], [45, 30], [-58, 30]], [], new Vector3(0, -50, 0), X, Z),
    new Vector3(0, -50, 13));
  add('back', 'stock',
    planar([[-58, 0], [58, 0], [58, 30], [-45, 30], [-45, 18], [-58, 18]], [], new Vector3(0, 50, 0), X.clone().negate(), Z),
    new Vector3(0, 50, 13));
  add('left', 'stock', planar([[-38, 0], [38, 0], [38, 30], [-38, 30]], [], new Vector3(-70, 0, 0), Y.clone().negate(), Z),
    new Vector3(-70, 0, 15));
  add('right', 'stock', planar([[-38, 0], [38, 0], [38, 18], [-38, 18]], [], new Vector3(70, 0, 0), Y, Z),
    new Vector3(70, 0, 9));
  add('stepWall', 'step', planar([[-50, 18], [50, 18], [50, 30], [-50, 30]], [], new Vector3(45, 0, 0), Y, Z),
    new Vector3(45, 0, 24));
  add('filletFL', 'fillet', wall(fl, 0, 30, false), runMidpoint(fl, 15));
  add('filletFR', 'fillet', wall(fr, 0, 18, false), runMidpoint(fr, 9));
  add('filletBR', 'fillet', wall(br, 0, 18, false), runMidpoint(br, 9));
  add('filletBL', 'fillet', wall(bl, 0, 30, false), runMidpoint(bl, 15));
  [...cb, ...drill].forEach(([x, y], i) =>
    add(`hole${i}`, 'hole', wall(circle(x, y, 5), 0, 18, true, true), new Vector3(x, y - 5, 9)));
  cb.forEach(([x, y], i) =>
    add(`cbWall${i}`, 'counterbore', wall(circle(x, y, 9), 18, 30, true, true), new Vector3(x, y - 9, 24)));
  pocketRuns.forEach((run, i) => add(`pocketWall${i}`, 'pocket', wall(run, 18, 30, true), runMidpoint(run, 24)));

  const index = new Map(faces.map((f, i) => [f.id, i]));
  const links: [number, number][] = [];
  const link = (a: string, ...others: string[]) => others.forEach((b) => links.push([index.get(a)!, index.get(b)!]));
  const pocketWalls = pocketRuns.map((_, i) => `pocketWall${i}`);
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

  const tagMaterials = new Map<PartTag, MeshLambertMaterial>();
  const edgeMat = new LineBasicMaterial({ color: INK });
  for (const f of faces) {
    if (!tagMaterials.has(f.tag)) tagMaterials.set(f.tag, faceMaterial());
    body.add(new Mesh(f.geometry, tagMaterials.get(f.tag)!));
    body.add(edgesOf(f.geometry, edgeMat));
  }
  const graph = graphOverlay(faces.map((f) => f.node), links, 1.6);
  body.add(graph);

  const featureTint: Record<PartTag, string | null> = {
    stock: null,
    pocket: TINTS.pocket,
    counterbore: TINTS.counterbore,
    hole: TINTS.hole,
    step: TINTS.step,
    fillet: TINTS.fillet,
  };

  // Toolpaths: step facing, two-level pocket contours, drilling + counterbore circles, outer profile.
  const tool = buildToolpaths(pocketRuns, cb, drill);
  body.add(tool.group);

  const featureNotes: Note[] = [
    new Vector3(0, 0, 18),
    new Vector3(-50, 19, 30),
    new Vector3(57, -25, 18),
    new Vector3(64, 8, 18),
    runMidpoint(fl, 15),
  ].map((anchor) => ({ anchor, owner: body }));
  const pathNotes: Note[] = [
    new Vector3(61, 12, 18.4),
    new Vector3(0, -14, 24),
    new Vector3(-50, -28, 30),
    new Vector3(-74, -10, 1),
  ].map((anchor) => ({ anchor, owner: body }));

  let layer = 1;
  return {
    root,
    fitRadius: 84,
    view: new Vector3(1, 0.95, 1.55),
    setLayer(next: number) {
      layer = next;
      for (const [tag, mat] of tagMaterials) {
        const hex = featureTint[tag];
        mat.color.setHex(hex && next === 1 ? tint(hex, 1) : hex && next === 2 ? tint(hex, 0.35) : FACE);
      }
      graph.visible = next === 0;
      tool.group.visible = next === 2;
      tool.reset();
    },
    notes(l: number) {
      return l === 1 ? featureNotes : l === 2 ? pathNotes : [];
    },
    update(_time: number, dt: number) {
      if (layer === 2) tool.advance(reducedMotion ? Infinity : dt);
    },
  };
}

interface PathSegment {
  rapid: boolean;
  pts: Vector3[];
}

function buildToolpaths(pocketRuns: P2[][], cb: P2[], drill: P2[]) {
  const group = new Group();
  const segments: PathSegment[] = [];
  const safe = 40;
  let at = new Vector3(0, -80, safe);
  const cut = (pts: Vector3[]) => {
    segments.push({ rapid: false, pts: [at.clone(), ...pts] });
    at = pts[pts.length - 1].clone();
  };
  const rapidTo = (p: Vector3) => {
    const up = new Vector3(at.x, at.y, safe);
    const over = new Vector3(p.x, p.y, safe);
    segments.push({ rapid: true, pts: [at.clone(), up, over, p.clone()] });
    at = p.clone();
  };
  const loop = (pts: P2[], z: number) => pts.map(([x, y]) => new Vector3(x, y, z)).concat(new Vector3(pts[0][0], pts[0][1], z));

  // 1. Step face: zigzag over x 49…66.
  const zs = 18.4;
  const xs = [49, 54.5, 60, 65.5];
  rapidTo(new Vector3(xs[0], -46, zs));
  const zig: Vector3[] = [];
  xs.forEach((x, i) => {
    const ys = i % 2 === 0 ? [-46, 46] : [46, -46];
    zig.push(new Vector3(x, ys[0], zs), new Vector3(x, ys[1], zs));
  });
  cut(zig);

  // 2. Pocket: contours from the centre outwards at two depths.
  for (const z of [24, 18.4]) {
    const insets = [21, 16, 10, 4];
    const first = insetRect(insets[0]);
    rapidTo(new Vector3(first[0][0], first[0][1], z));
    for (const d of insets) {
      const ring = insetRect(d);
      cut(loop(ring, z));
    }
  }

  // 3. Drill four holes, then circle the two counterbores.
  for (const [x, y] of [...cb, ...drill]) {
    const top = cb.some(([cx, cy]) => cx === x && cy === y) ? 30 : 18;
    rapidTo(new Vector3(x, y, top + 2));
    cut([new Vector3(x, y, -3), new Vector3(x, y, top + 2)]);
  }
  for (const [x, y] of cb) {
    const ring = arc(x, y, 5, -90, 270, 36);
    rapidTo(new Vector3(ring[0][0], ring[0][1], 24));
    cut(loop(ring, 24).concat(loop(ring, 18.4)));
  }

  // 4. Outer profile with the tool radius offset.
  const profile = joinRuns(roundedRectRuns(-74, -54, 74, 54, 16));
  const start = profile.findIndex(([x]) => x <= -74 + 1e-6);
  const ordered = [...profile.slice(start), ...profile.slice(0, start)];
  rapidTo(new Vector3(ordered[0][0], ordered[0][1], 1));
  cut(loop(ordered, 1));
  rapidTo(new Vector3(0, -80, safe));

  function insetRect(d: number): P2[] {
    const runs = roundedRectRuns(-30 + d, -24 + d, 30 - d, 24 - d, Math.max(8 - d, 0.6));
    const ring = joinRuns(runs);
    const s = ring.findIndex(([, y]) => Math.abs(y - (-24 + d)) < 1e-6);
    return [...ring.slice(s), ...ring.slice(0, s)];
  }

  // Ghost of the full path, progress drawn on top while the tool moves.
  const cutMat = new LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.22 });
  const liveMat = new LineBasicMaterial({ color: ACCENT });
  const rapidMat = new LineDashedMaterial({ color: BLUE, dashSize: 3, gapSize: 2.5, transparent: true, opacity: 0.7 });
  const lives: { line: Line; pts: Vector3[]; start: number; end: number }[] = [];
  const timeline: { seg: PathSegment; start: number; end: number; lengths: number[] }[] = [];
  let clock = 0;
  for (const seg of segments) {
    const pts = seg.rapid ? seg.pts : subdivide(seg.pts, 1.5);
    const geo = new BufferGeometry().setFromPoints(pts);
    if (seg.rapid) {
      const line = new Line(geo, rapidMat);
      line.computeLineDistances();
      group.add(line);
    }
    const lengths = [0];
    for (let i = 1; i < pts.length; i++) lengths.push(lengths[i - 1] + pts[i].distanceTo(pts[i - 1]));
    const speed = seg.rapid ? 260 : 85;
    const duration = lengths[lengths.length - 1] / speed;
    timeline.push({ seg: { rapid: seg.rapid, pts }, start: clock, end: clock + duration, lengths });
    if (!seg.rapid) {
      group.add(new Line(geo, cutMat));
      const live = new Line(new BufferGeometry().setFromPoints(pts), liveMat);
      live.geometry.setDrawRange(0, 0);
      group.add(live);
      lives.push({ line: live, pts, start: clock, end: clock + duration });
    }
    clock += duration;
  }
  const total = clock;
  const hold = 1.6;

  const toolGroup = new Group();
  const fluteMat = faceMaterial();
  fluteMat.color.setHex(tint(TINTS.cut, 0.85));
  const shankMat = faceMaterial();
  shankMat.color.setHex(0xd8dad3);
  const flute = new Mesh(new CylinderGeometry(4, 4, 22, 24), fluteMat);
  flute.position.y = 11;
  const shank = new Mesh(new CylinderGeometry(4, 4, 30, 24), shankMat);
  shank.position.y = 37;
  const toolEdges = new LineBasicMaterial({ color: INK });
  flute.add(edgesOf(flute.geometry, toolEdges));
  shank.add(edgesOf(shank.geometry, toolEdges));
  toolGroup.add(flute, shank);
  toolGroup.rotation.x = Math.PI / 2;
  group.add(toolGroup);

  let t = 0;
  const place = (time: number) => {
    const clamped = Math.min(time, total);
    for (const l of lives) {
      const k = clamped >= l.end ? l.pts.length : clamped <= l.start ? 0 : null;
      if (k !== null) {
        l.line.geometry.setDrawRange(0, k);
        continue;
      }
      const entry = timeline.find((e) => e.start === l.start)!;
      const dist = ((clamped - l.start) / (l.end - l.start)) * entry.lengths[entry.lengths.length - 1];
      let i = entry.lengths.findIndex((d) => d > dist);
      if (i < 0) i = l.pts.length;
      l.line.geometry.setDrawRange(0, i);
    }
    const cur = timeline.find((e) => clamped >= e.start && clamped <= e.end) ?? timeline[timeline.length - 1];
    const dist = ((clamped - cur.start) / Math.max(cur.end - cur.start, 1e-6)) * cur.lengths[cur.lengths.length - 1];
    let i = cur.lengths.findIndex((d) => d >= dist);
    if (i <= 0) i = 1;
    const a = cur.seg.pts[i - 1];
    const b = cur.seg.pts[Math.min(i, cur.seg.pts.length - 1)];
    const span = cur.lengths[i] - cur.lengths[i - 1] || 1;
    toolGroup.position.copy(a).lerp(b, Math.min(Math.max((dist - cur.lengths[i - 1]) / span, 0), 1));
  };

  return {
    group,
    reset() {
      t = 0;
      place(0);
    },
    advance(dt: number) {
      if (dt === Infinity) {
        place(total);
        toolGroup.position.set(0, -80, safe);
        return;
      }
      t = (t + dt) % (total + hold);
      place(t);
    },
  };
}

function subdivide(pts: Vector3[], step: number): Vector3[] {
  const out = [pts[0].clone()];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const n = Math.max(1, Math.ceil(a.distanceTo(b) / step));
    for (let k = 1; k <= n; k++) out.push(a.clone().lerp(b, k / n));
  }
  return out;
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
  onParams: (p: FurnitureParams) => void;
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
  private readonly part: ModelView;
  private readonly furniture: ReturnType<typeof buildFurniture>;
  private model: ModelId = 'part';
  private layer = 1;
  private width = 1;
  private height = 1;
  private frame = 0;
  private last = 0;
  private visible = true;
  // Until the reader drags, the model sways a little around its starting view.
  private swaying = true;
  private swayClock = 0;
  private readonly resize: ResizeObserver;
  private readonly intersection: IntersectionObserver;

  constructor(private readonly stage: HTMLElement, private readonly options: ViewportOptions) {
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
      if (this.swaying && !this.options.reducedMotion) this.sway(dt);
      this.controls.update();
      this.current.update(now / 1000, dt);
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
    const anchors = notes.map((n) => this.project(n.anchor, n.owner));
    const spots = anchors.map((a) => {
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
          const d = spots[j].clone().sub(spots[i]);
          const len = d.length();
          if (len < 28) {
            const push = d.lengthSq() < 0.01 ? new Vector2(0, 1) : d.normalize();
            spots[i].addScaledVector(push, -(28 - len) / 2);
            spots[j].addScaledVector(push, (28 - len) / 2);
          }
        }
      }
    }
    this.balloons.forEach((b, i) => {
      const on = i < spots.length;
      b.style.display = on ? '' : 'none';
      this.leaders[i].style.display = on ? '' : 'none';
      this.dots[i].style.display = on ? '' : 'none';
      if (!on) return;
      const a = anchors[i];
      const s = spots[i];
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
