// Render the real Angular templates at build time. GitHub Pages only serves static files;
// it does not need a Node server, browser binary, or a bot-specific rendering path.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { assertContentDate, contentFingerprint, validateDate } from './content-dates.mjs';

const require = createRequire(import.meta.url);
const { SEARCH_PAGES, SITE_URL, OPENCAD_TOOLS, renderPage, contentModified } = require('../dist/server/main.js');
const history = JSON.parse(readFileSync(new URL('../src/app/content-history.json', import.meta.url), 'utf8'));
const linkedDates = JSON.parse(readFileSync(new URL('./linked-content-dates.json', import.meta.url), 'utf8'));
const outDir = resolve(process.argv[2] || 'docs');
let base = readFileSync(join(outDir, 'index.html'), 'utf8');
const escape = (text) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Verification tokens are public. Keep real tokens here across future builds, rather
// than editing generated docs/index.html, which the next build replaces.
const verification = JSON.parse(readFileSync(new URL('./search-verification.json', import.meta.url), 'utf8'));
for (const name of ['google-site-verification', 'naver-site-verification']) {
  const value = verification[name];
  if (typeof value !== 'string') throw new Error(`Invalid verification value: ${name}`);
  if (value) base = base.replace('</head>', `<meta name="${name}" content="${escape(value)}"></head>`);
}

function writePage(file, html) {
  const target = join(outDir, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
}

for (const page of SEARCH_PAGES) {
  const html = await renderPage(base, SITE_URL + page.path);
  assertContentDate(page.path, history[page.path], contentFingerprint(html, path => readFileSync(resolve('src' + path))));
  if (contentModified(page.path) !== history[page.path].lastmod) throw new Error('Rebuild browser/server after updating content dates.');
  if (!html.includes('<h1') || !html.includes('id="site-structured-data"')) {
    throw new Error(`Incomplete render: ${page.path}`);
  }
  const files = page.path === '/' ? ['index.html']
    : [`${page.path.slice(1)}.html`, `${page.path.slice(1)}/index.html`];
  for (const file of files) writePage(file, html);
  console.log(`${page.path} → ${files.join(', ')}`);
}

// Preserve links to the old public pages without routing every 404 through the home
// page. A canonical and immediate refresh point to the existing destination.
const redirects = {
  '/portfolio/fusion-cam': '/portfolio/cad-feature-recognition',
  '/portfolio/sketchup-manufacturing': '/portfolio/wedraw-pro',
  '/portfolio/wedraw-order-operations': '/portfolio/order-invoice-sync',
  '/blog': '/research',
};
for (const [from, to] of Object.entries(redirects)) {
  const url = SITE_URL + to;
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>페이지 이동 — 김규태 · Sean Kim</title><link rel="canonical" href="${url}"><meta http-equiv="refresh" content="0;url=${url}"></head><body><p>주소가 바뀌었습니다. <a href="${url}">새 페이지로 이동</a></p></body></html>`;
  for (const file of [`${from.slice(1)}.html`, `${from.slice(1)}/index.html`]) writePage(file, html);
}

// Include published applications under this verified host; planned tools have no URL.
const sitemapUrls = [...new Set([...SEARCH_PAGES.map(({ path }) => SITE_URL + path),
  ...OPENCAD_TOOLS.flatMap(({ url }) => url && new URL(url).origin === SITE_URL ? [url] : [])])];
const urls = sitemapUrls.map((url) => {
  const path = new URL(url).pathname;
  const lastmod = contentModified(path) || linkedDates[url]?.lastmod;
  // Separate apps may not publish a trustworthy content date yet. The optional
  // lastmod is omitted until they do; deployment time is not a content date.
  const modified = lastmod ? `<lastmod>${validateDate(lastmod)}</lastmod>` : '';
  return `  <url><loc>${escape(url)}</loc>${modified}</url>`;
}).join('\n');
writePage('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
writePage('.nojekyll', '');
console.log(`sitemap.xml → ${sitemapUrls.length} URLs`);
