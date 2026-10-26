// Both sitemap formats use the same published route identities. This entry point
// can regenerate only crawler files without rebuilding or rerendering the site.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDate } from './content-dates.mjs';

const require = createRequire(import.meta.url);
const { LOCALIZED_SEARCH_PAGES: pages, SITE_URL, OPENCAD_TOOLS, contentModified,
  LANGUAGES, languagePath, localizedHref, originalPath } = require('../dist/server/main.js');
const escape = text => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function writeSitemaps(outDir) {
  mkdirSync(outDir, { recursive: true });
  const ownUrls = [...new Set(pages.map(({ path }) => SITE_URL + path))];
  // XML preserves repository-owned modification dates and language annotations.
  const entries = ownUrls.map(url => {
    const path = new URL(url).pathname;
    const modified = `<lastmod>${validateDate(contentModified(path))}</lastmod>`;
    const page = pages.find(page => SITE_URL + page.path === url);
    const alternates = [...LANGUAGES.map(({ code }) => `<xhtml:link rel="alternate" hreflang="${code}" href="${escape(SITE_URL + languagePath(originalPath(page.path), code))}"/>`),
      `<xhtml:link rel="alternate" hreflang="x-default" href="${escape(SITE_URL + originalPath(page.path))}"/>`].join('');
    return `  <url><loc>${escape(url)}</loc>${modified}${alternates}</url>`;
  }).join('\n');
  writeFileSync(join(outDir, 'sitemap-pages.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries}\n</urlset>\n`);
  const apps = OPENCAD_TOOLS.filter(({ url }) => url && new URL(url).origin === SITE_URL);
  const maps = [...new Set([`${SITE_URL}/sitemap-pages.xml`, ...apps.map(({ url }) => new URL('sitemap.xml', url).href)])];
  writeFileSync(join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${maps.map(url => `  <sitemap><loc>${escape(url)}</loc></sitemap>`).join('\n')}\n</sitemapindex>\n`);
  // A direct text sitemap removes XML/child-map processing from URL discovery.
  // It includes the four published apps without copying their dates or content.
  const textUrls = [...new Set([...ownUrls, ...apps.flatMap(({ url }) => LANGUAGES.map(({ code }) => localizedHref(url, code)))])];
  for (const url of textUrls) {
    const parsed = new URL(url);
    if (parsed.origin !== SITE_URL || parsed.search || parsed.hash || /\s/.test(url)) throw new Error(`Invalid sitemap URL: ${url}`);
  }
  writeFileSync(join(outDir, 'sitemap.txt'), textUrls.join('\n') + '\n');
  console.log(`sitemap-pages.xml → ${ownUrls.length} URLs; sitemap.xml → ${maps.length} sitemaps; sitemap.txt → ${textUrls.length} URLs`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  writeSitemaps(resolve(process.argv[2] || 'docs'));
}
