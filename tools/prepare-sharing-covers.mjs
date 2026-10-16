// Prepare native HTML layouts, keeping the source figures intact.
// node tools/prepare-sharing-covers.mjs .runtime/<task>/covers
// Capture each layout in a browser at 1200×630 with JPEG quality 90 to its output path.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const destination = resolve(process.argv[2] || '.runtime/sharing-covers');
const covers = JSON.parse(readFileSync(new URL('./sharing-cover-sources.json', import.meta.url), 'utf8'));
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
mkdirSync(destination, { recursive: true });

for (const cover of covers) {
  const figure = `data:image/webp;base64,${readFileSync(join(root, cover.source)).toString('base64')}`;
  const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><title>${escape(cover.id)}</title>
<style>
* { box-sizing: border-box; }
html, body { width: 1200px; height: 630px; margin: 0; }
body { padding: 28px; color: #1e2522; background: #f4f3ec; font-family: "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; }
main { height: 574px; border: 1px solid #1e2522; display: grid; grid-template-rows: 1fr 66px; background-image: linear-gradient(#1e25220a 1px, transparent 1px), linear-gradient(90deg, #1e25220a 1px, transparent 1px); background-size: 20px 20px; }
.content { min-height: 0; display: grid; grid-template-columns: 440px minmax(0, 1fr); gap: 30px; align-items: center; padding: 30px 46px; }
.kicker { margin: 0 0 24px; color: #2f5f9e; font-size: 16px; font-weight: 700; }
h1 { margin: 0 0 22px; font-size: 46px; font-weight: 800; letter-spacing: -2px; line-height: 1.3; }
h1 span { display: block; white-space: nowrap; }
.summary { margin: 0; color: #5b635f; font-size: 22px; font-weight: 600; line-height: 1.6; word-break: keep-all; }
.role { margin: 22px 0 0; padding-left: 12px; border-left: 3px solid #a75534; font-size: 17px; line-height: 1.6; word-break: keep-all; }
figure { margin: 0; min-width: 0; }
.image { height: 390px; display: grid; place-items: center; background: #fff; border: 1px solid #b4b9ae; }
img { display: block; width: 100%; height: 100%; max-height: 388px; object-fit: contain; }
figcaption { margin-top: 10px; font-size: 14px; color: #5b635f; line-height: 1.4; }
footer { border-top: 1px solid #1e2522; background: #f9f8f3; display: grid; grid-template-columns: 110px 250px 1fr 280px; }
footer div { padding: 8px 16px; border-right: 1px solid #d6d9cf; }
footer div:last-child { border: 0; }
footer small { display: block; font-size: 12px; color: #5b635f; margin-bottom: 3px; }
footer b { font-size: 17px; }
</style>
<main><section class="content"><div>
<p class="kicker">${escape(cover.kicker)}</p>
<h1>${cover.title.map((line) => `<span>${escape(line)}</span>`).join('')}</h1>
<p class="summary">${escape(cover.summary)}</p><p class="role">${escape(cover.role)}</p>
</div><figure><div class="image"><img src="${figure}" alt="${escape(cover.caption)}"></div><figcaption>${escape(cover.caption)}</figcaption></figure></section>
<footer><div><small>도면</small><b>${escape(cover.sheet)}</b></div><div><small>작성</small><b>김규태 Sean Kim</b></div><div><small>분야</small><b>AI · CAD/CAM · 제조 소프트웨어</b></div><div><small>주소</small><b>gyutae-kim.github.io</b></div></footer></main></html>`;
  writeFileSync(join(destination, cover.id + '.html'), html);
}
writeFileSync(join(destination, 'captures.json'), JSON.stringify(covers.map((cover) => ({
  id: cover.id,
  input: join(destination, cover.id + '.html'),
  output: join(root, cover.output),
})), null, 2) + '\n');
console.log(`Prepared ${covers.length} cover layouts in ${destination}`);
