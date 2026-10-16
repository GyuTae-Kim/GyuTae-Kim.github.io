// Render the real Angular templates at build time. GitHub Pages only serves static files;
// it does not need a Node server, browser binary, or a bot-specific rendering path.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import Beasties from 'beasties';
import { assertContentDate, contentFingerprint, validateDate } from './content-dates.mjs';

const require = createRequire(import.meta.url);
const { SEARCH_PAGES, SITE_URL, OPENCAD_TOOLS, renderPage, contentModified } = require('../dist/server/main.js');
const history = JSON.parse(readFileSync(new URL('../src/app/content-history.json', import.meta.url), 'utf8'));
const linkedDates = JSON.parse(readFileSync(new URL('./linked-content-dates.json', import.meta.url), 'utf8'));
const outDir = resolve(process.argv[2] || 'docs');
let base = readFileSync(join(outDir, 'index.html'), 'utf8');
const stylesheet = base.match(/<link\b[^>]*href="(styles\.[^"]+\.css)"[^>]*>/)?.[1];
if (!stylesheet) throw new Error('Missing shared stylesheet');
// Keep font faces available immediately. Family names use CSS variables, so do
// not rely on the critical-CSS processor to infer which faces are needed.
const faces = readFileSync(join(outDir, stylesheet), 'utf8').match(/@font-face\{[^}]+\}/g)?.join('');
if (!faces) throw new Error('Missing local font faces');
base = base.replace('</head>', `<style data-site-fonts>${faces}</style></head>`);
const critical = new Beasties({ path: outDir, preload: 'swap', noscriptFallback: true,
  pruneSource: false, reduceInlineStyles: false, mergeStylesheets: false,
  fonts: false, logLevel: 'warn' });
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
  const rendered = await renderPage(base, SITE_URL + page.path);
  // Extract matching shared CSS after rendering the real route. Keep the full
  // stylesheet for hover states, client-side navigation and no-JS fallbacks.
  let html = await critical.process(rendered);
  let inlineStyles = '';
  html = html.replace(/<style>([\s\S]*?)<\/style>/, (_, css) => {
    inlineStyles = `<style data-site-styles>${css}</style>`;
    return '';
  });
  if (!inlineStyles) throw new Error(`Missing critical CSS: ${page.path}`);
  // Keep sharing metadata in the first 8 KiB; the optimizer otherwise prepends
  // CSS ahead of the title and Open Graph tags.
  html = html.replace('</head>', `${inlineStyles}</head>`);
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
  '/blog': '/research',
};
for (const [from, to] of Object.entries(redirects)) {
  const url = SITE_URL + to;
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>페이지 이동 — 김규태 · Sean Kim</title><link rel="canonical" href="${url}"><meta http-equiv="refresh" content="0;url=${url}"></head><body><p>주소가 바뀌었습니다. <a href="${url}">새 페이지로 이동</a></p></body></html>`;
  for (const file of [`${from.slice(1)}.html`, `${from.slice(1)}/index.html`]) writePage(file, html);
}

// A project site loses its Pages path when its repository is renamed, and GitHub does
// not forward it. This user site then answers the old path: forward the query and
// fragment (?sample, ?open=…) by script, and refresh without them only when scripts
// are off, so a refresh cannot cancel the scripted move.
const movedApps = JSON.parse(readFileSync(new URL('./moved-apps.json', import.meta.url), 'utf8'));
for (const [from, { name, url }] of Object.entries(movedApps)) {
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, follow"><title>${escape(name)} 주소 이동 — 김규태 · Sean Kim</title><link rel="canonical" href="${escape(url)}"><script>location.replace(${JSON.stringify(url)} + location.search + location.hash)</script><noscript><meta http-equiv="refresh" content="0;url=${escape(url)}"></noscript></head><body><p>${escape(name)}의 주소가 바뀌었습니다. <a href="${escape(url)}">새 주소로 이동</a></p></body></html>`;
  writePage(`${from.slice(1)}index.html`, html);
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
