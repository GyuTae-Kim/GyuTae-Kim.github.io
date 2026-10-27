// Prepare the OpenCAD sharing cover (sheet D-00): the four app screenshots on a drawing sheet.
// node tools/prepare-opencad-cover.mjs .runtime/<task>/opencad-cover
// Capture opencad.html in a browser at 1200×630 (device scale 1) with JPEG quality 90 to its output path.
// Re-run after replacing src/assets/opencad/viewer-*-1440.webp; captures.json matches prepare-sharing-covers.mjs.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const destination = resolve(process.argv[2] || '.runtime/opencad-cover');
const output = 'src/assets/og/opencad.jpg';
const dataUrl = (path, type) => `data:${type};base64,${readFileSync(join(root, path)).toString('base64')}`;
// The site's own faces: Portfolio Sans subsets by unicode-range, JetBrains Mono for Latin.
const sansFaces = readFileSync(join(root, 'src/assets/fonts/_site-sans.scss'), 'utf8')
  .replace(/url\("\/(assets\/fonts\/[^"]+\.woff2)"\)/g, (_, file) => `url("${dataUrl('src/' + file, 'font/woff2')}")`);
const monoFace = `@font-face{font-family:"JetBrains Mono";font-style:normal;font-weight:400 800;src:url("${dataUrl('src/assets/fonts/jetbrains-mono-latin.woff2', 'font/woff2')}") format("woff2")}`;
const apps = [
  { label: 'DWG, DXF', kind: '2D 도면', shot: 'src/assets/opencad/viewer-2d-1440.webp' },
  { label: 'STEP', kind: '3D 부품 모델', shot: 'src/assets/opencad/viewer-step-1440.webp' },
  { label: 'SKP', kind: 'SketchUp 모델', shot: 'src/assets/opencad/viewer-skp-1440.webp' },
  { label: 'NC', kind: 'CNC 가공 프로그램', shot: 'src/assets/opencad/viewer-nc-1440.webp' },
];

const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><title>opencad</title>
<style>
${sansFaces}
${monoFace}
:root { --paper: #f4f3ec; --sheet: #f9f8f3; --ink: #1e2522; --muted: #5b635f; --line: #d6d9cf; --blue: #2f5f9e; --accent: #a75534;
  --grid-minor: rgba(30, 37, 34, 0.045); --grid-major: rgba(30, 37, 34, 0.085);
  --mono: "JetBrains Mono", "Portfolio Sans", monospace; --sans: "Portfolio Sans", "Apple SD Gothic Neo", sans-serif; }
* { box-sizing: border-box; }
html, body { width: 1200px; height: 630px; margin: 0; }
body { padding: 28px; color: var(--ink); background: var(--paper); font-family: var(--sans); -webkit-font-smoothing: antialiased; }
main { height: 574px; border: 1px solid var(--ink); display: grid; grid-template-rows: 1fr 64px; background-color: var(--sheet);
  background-image: linear-gradient(var(--grid-major) 1px, transparent 1px), linear-gradient(90deg, var(--grid-major) 1px, transparent 1px),
    linear-gradient(var(--grid-minor) 1px, transparent 1px), linear-gradient(90deg, var(--grid-minor) 1px, transparent 1px);
  background-size: 60px 60px, 60px 60px, 12px 12px, 12px 12px; }
.content { min-height: 0; display: grid; grid-template-columns: 1fr 584px; padding: 55px 40px 0 48px; }
.lead { margin-top: -10px; }
.kicker { margin: 0; color: var(--blue); font: 500 19px/24px var(--mono); }
.kicker span { margin-left: 22px; }
h1 { margin: 27px 0 0; font-size: 50px; font-weight: 800; line-height: 64px; letter-spacing: -2px; }
h1 span { display: block; white-space: nowrap; }
h1 i { color: var(--accent); font-style: normal; }
.summary { margin: 23px 0 0; color: var(--muted); font-size: 21px; font-weight: 500; line-height: 31.5px; }
dl { margin: 0; display: grid; grid-template-columns: 118px 1fr; font-size: 21px; line-height: 31.5px; }
dt { font-family: var(--mono); font-size: 19px; font-weight: 700; }
dd { margin: 0; color: var(--muted); font-weight: 500; }
.shots { display: grid; grid-template-columns: 285px 285px; gap: 14px; align-content: start; }
figure { margin: 0; }
img { display: block; width: 285px; height: 178px; border: 1px solid var(--ink); }
figcaption { margin-top: 6px; color: var(--muted); font: 500 14px/18px var(--mono); }
footer { border-top: 1px solid var(--ink); background: var(--sheet); display: grid; grid-template-columns: 121px 292px 409px 1fr; }
footer div { padding: 9px 16px; border-right: 1px solid var(--line); }
footer div:last-child { border: 0; }
footer small { display: block; margin-bottom: 2px; color: var(--muted); font-size: 13px; line-height: 16px; }
footer b { font-size: 19px; line-height: 22px; }
footer .mono { font-family: var(--mono); }
</style>
<main><section class="content"><div class="lead">
<p class="kicker">OpenCAD<span>개인 프로젝트</span></p>
<h1><span>CAD 파일을</span><span>브라우저에서</span><span>엽니다<i>.</i></span></h1>
<p class="summary">설치도 서버도 없이 여는 뷰어 네 가지</p>
<dl>${apps.map((app) => `<dt>${app.label}</dt><dd>${app.kind}</dd>`).join('')}</dl>
</div><div class="shots">${apps.map((app) => `<figure><img src="${dataUrl(app.shot, 'image/webp')}" alt=""><figcaption>${app.label}</figcaption></figure>`).join('')}</div></section>
<footer><div><small>도면</small><b class="mono">D-00</b></div><div><small>작성</small><b>김규태 Sean Kim</b></div><div><small>분야</small><b>CAD 뷰어 · 오픈 소스</b></div><div><small>주소</small><b class="mono">gyutae-kim.github.io</b></div></footer></main></html>`;

mkdirSync(destination, { recursive: true });
writeFileSync(join(destination, 'opencad.html'), html);
writeFileSync(join(destination, 'captures.json'), JSON.stringify([
  { id: 'opencad', input: join(destination, 'opencad.html'), output: join(root, output) },
], null, 2) + '\n');
console.log(`Prepared the OpenCAD cover layout in ${destination}`);
