// Both sitemap formats use the same published route identities. This entry point
// can regenerate only crawler files without rebuilding or rerendering the site.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDate } from './content-dates.mjs';

const require = createRequire(import.meta.url);
const { LOCALIZED_SEARCH_PAGES: pages, SITE_URL, OPENCAD_TOOLS, contentModified,
  DEFAULT_LANGUAGE, LANGUAGES, languagePath, localizedHref, originalPath } = require('../dist/server/main.js');
const escape = text => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function writeSitemaps(outDir) {
  mkdirSync(outDir, { recursive: true });
  const own = pages.map(page => ({
    url: SITE_URL + page.path, language: page.language,
    modified: validateDate(contentModified(page.path)),
    versions: LANGUAGES.map(({ code }) => ({ code, url: SITE_URL + languagePath(originalPath(page.path), code) })),
  }));
  const apps = OPENCAD_TOOLS.filter(({ url }) => url && new URL(url).origin === SITE_URL);
  // The root property owns these URLs on the same host. List the app URLs
  // directly; processing this map never needs another repository's XML.
  // Their dates remain omitted because their source is owned elsewhere.
  const publishedApps = apps.flatMap(({ url }) => LANGUAGES.map(({ code }) => ({
    url: localizedHref(url, code), language: code,
    // App HTML and app-owned maps remain authoritative for their annotations.
    versions: [],
  })));
  const all = [...own, ...publishedApps];
  const textUrls = all.map(({ url }) => url);
  if (new Set(textUrls).size !== textUrls.length) throw new Error('Duplicate canonical sitemap URL');
  for (const url of textUrls) {
    const parsed = new URL(url);
    if (parsed.origin !== SITE_URL || parsed.search || parsed.hash || /\s/.test(url)) throw new Error(`Invalid sitemap URL: ${url}`);
  }
  const write = (name, records) => {
    const entries = records.map(record => {
      const modified = record.modified ? `<lastmod>${record.modified}</lastmod>` : '';
      const fallback = record.versions.find(({ code }) => code === DEFAULT_LANGUAGE)?.url;
      const alternates = [...record.versions, ...(fallback ? [{ code: 'x-default', url: fallback }] : [])]
        .map(({ code, url }) => `<xhtml:link rel="alternate" hreflang="${code}" href="${escape(url)}"/>`).join('');
      return `  <url><loc>${escape(record.url)}</loc>${modified}${alternates}</url>`;
    }).join('\n');
    writeFileSync(join(outDir, name), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries}\n</urlset>\n`);
  };
  write('sitemap.xml', all);
  // Stable locale maps allow language-specific Search Console diagnosis.
  for (const { code } of LANGUAGES) write(`sitemap-${code}.xml`, all.filter(record => record.language === code));
  write('sitemap-pages.xml', own); // Preserve the previously submitted URL.
  writeFileSync(join(outDir, 'sitemap.txt'), textUrls.join('\n') + '\n');
  console.log(`sitemap.xml → ${all.length} direct URLs; ${LANGUAGES.length} locale maps; sitemap-pages.xml → ${own.length} URLs; sitemap.txt → ${textUrls.length} URLs`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  writeSitemaps(resolve(process.argv[2] || 'docs'));
}
