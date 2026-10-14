// Writes a copy of the built index.html for each app route, so GitHub Pages answers deep
// links with 200 instead of the 404 redirect, and link previews get the page's own title,
// description and image. Usage: node tools/route-pages.mjs [build-dir]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const outDir = process.argv[2] || 'docs';
const site = 'https://gyutae-kim.github.io';
const suffix = ' — 김규태 · Sean Kim';
const base = readFileSync(join(outDir, 'index.html'), 'utf8');

// Case ids, titles and headlines come from the same data the app renders.
const data = readFileSync('src/app/portfolio-data.ts', 'utf8');
const cases = data
  .split(/\n  \{\n    id: /)
  .slice(1)
  .map((block) => ({
    id: block.match(/^'([^']+)'/)[1],
    title: block.match(/\n    title: '([^']+)'/)[1],
    headline: block.match(/\n    headline: '([^']+)'/)[1],
  }));

const routes = [
  {
    files: ['portfolio.html', 'portfolio/index.html'],
    path: '/portfolio',
    title: '프로젝트',
    description: 'AI 모델이 낸 결과를 설계·가공 도구에서 쓸 수 있게 만든 연구개발 사례 3건입니다. 가공 특징 인식과 CAM 연결, 가구 패널 인식, Wedraw Pro를 다룹니다.',
    image: 'assets/og/portfolio.jpg',
  },
  ...cases.map((c) => ({
    files: [`portfolio/${c.id}.html`],
    path: `/portfolio/${c.id}`,
    title: c.title,
    description: `${c.headline}. 단계마다 직접 한 일과 팀·협력 기관이 한 일을 나눠 적었습니다.`,
    image: `assets/og/${c.id}.jpg`,
  })),
  {
    files: ['research.html'],
    path: '/research',
    title: '연구',
    description: '학부연구생 때 공개한 강화학습, 이미지 분류, 가상 착용 코드를 2026년에 다시 돌려 본 결과입니다.',
    image: 'assets/og/research.jpg',
  },
  {
    files: ['contact.html'],
    path: '/contact',
    title: '연락',
    description: '김규태(Sean Kim)의 이메일과 GitHub 주소입니다.',
    image: 'assets/og/home.jpg',
  },
];

const escape = (text) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function setAttr(html, selector, value) {
  const tag = selector.split(' ').join('\\s+');
  const pattern = new RegExp(`(<${tag}[^>]*?(?:content|href)=")[^"]*(")`);
  if (!pattern.test(html)) throw new Error(`missing ${selector}`);
  return html.replace(pattern, `$1${escape(value)}$2`);
}

for (const route of routes) {
  const title = route.title + suffix;
  let html = base.replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`);
  html = setAttr(html, 'meta name="description"', route.description);
  html = setAttr(html, 'meta property="og:title"', title);
  html = setAttr(html, 'meta property="og:description"', route.description);
  html = setAttr(html, 'meta property="og:url"', site + route.path);
  html = setAttr(html, 'meta property="og:image"', `${site}/${route.image}`);
  html = setAttr(html, 'link rel="canonical"', site + route.path);
  for (const file of route.files) {
    const target = join(outDir, file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, html);
  }
  console.log(route.path, '→', route.files.join(', '));
}
