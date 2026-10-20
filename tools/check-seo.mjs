// Validate the deployment artifacts, including crawlers that do not execute JS.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';
import { validateDate } from './content-dates.mjs';
const require = createRequire(import.meta.url);
const { LOCALIZED_SEARCH_PAGES: SEARCH_PAGES, SITE_URL, OPENCAD_TOOLS, contentModified, LANGUAGES, languagePath, localizedHref, originalPath } = require('../dist/server/main.js');
const linkedDates = JSON.parse(readFileSync(new URL('./linked-content-dates.json', import.meta.url), 'utf8'));
const outDir = resolve(process.argv[2] || 'docs');
const fontCoverage = JSON.parse(readFileSync(join(outDir, 'assets/fonts/coverage.json'), 'utf8'));
const fontCharacters = new Set([...fontCoverage.covered, ...fontCoverage.fallback]);
for (const font of [...fontCoverage.files, { name: 'jetbrains-mono-latin.woff2' }]) {
  assert.equal(readFileSync(join(outDir, 'assets/fonts', font.name)).toString('ascii', 0, 4), 'wOF2', font.name);
}
const { JSDOM } = require('jsdom');
const titles = new Set();
const descriptions = new Set();
const paths = new Set(SEARCH_PAGES.flatMap((page) => [page.path, page.path.replace(/\/+$/, '') || '/']));
// These linked applications belong to separate repositories on the same Pages host.
const hostedApps = new Set(OPENCAD_TOOLS.filter((tool) => tool.url).flatMap((tool) => LANGUAGES.map(({code}) => localizedHref(tool.url,code))));
const verification = JSON.parse(readFileSync(new URL('./search-verification.json', import.meta.url), 'utf8'));
const checkedImages = new Set();
// Detail covers must stay tied to their subject instead of falling back to a collection cover.
const detailCovers = JSON.parse(readFileSync(new URL('./sharing-cover-sources.json', import.meta.url), 'utf8'));
// Read JPEG frame dimensions from the actual deployed bytes, not the filename or tags.
function jpegDimensions(bytes) {
  assert.equal(bytes.readUInt16BE(0), 0xffd8, 'sharing image must be a JPEG');
  let offset = 2;
  while (offset + 9 < bytes.length) {
    assert.equal(bytes[offset++], 0xff, 'invalid JPEG marker');
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    const length = bytes.readUInt16BE(offset);
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      return { width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3) };
    }
    assert.ok(length >= 2, 'invalid JPEG segment');
    offset += length;
  }
  throw new Error('Missing JPEG image dimensions');
}
let checkedLinks = 0;
let commonHeadShape;
for (const page of SEARCH_PAGES) {
  const detailCover = detailCovers.find((cover) => cover.route === page.path);
  if (detailCover) assert.equal(page.image, detailCover.output.replace(/^src\//, ''), `${page.path}: subject-specific sharing image`);
  const stem = page.path.replace(/^\/|\/$/g, '');
  const files = !stem ? ['index.html'] : [`${stem}.html`, `${stem}/index.html`];
  for (const file of files) {
    const raw = readFileSync(join(outDir, file));
    const dom = new JSDOM(raw.toString('utf8'), { url: SITE_URL + page.path });
    const document = dom.window.document;
    assert.ok(document.querySelector('style[data-site-styles]'), `${file}: shared CSS available before scripts`);
    assert.ok(!document.querySelector('head > link[rel="stylesheet"][href^="styles."]'), `${file}: no blocking shared CSS request`);
    assert.ok(!document.querySelector('link[href*="fonts.googleapis.com"], link[href*="cdn.jsdelivr.net"]'), `${file}: no external font CSS`);
    const fontRoot = document.querySelector('app-root').cloneNode(true);
    fontRoot.querySelectorAll('.language-menu').forEach(el => el.remove());
    const unstyledText = fontRoot.textContent;
    const missingGlyphs = [...new Set([...unstyledText].filter(c => !/\s/u.test(c) && !fontCharacters.has(c.codePointAt(0))))];
    if (page.language === 'ko') assert.deepEqual(missingGlyphs, [], `${file}: run tools/prepare-site-fonts.py for new characters`);
    assert.equal(document.documentElement.lang, page.language, file);
    for (const { code } of LANGUAGES) assert.equal(document.querySelector(`link[rel="alternate"][hreflang="${code}"]`)?.href, SITE_URL + languagePath(originalPath(page.path), code), `${file}: reciprocal ${code} alternate`);
    assert.equal(document.querySelectorAll('link[rel="alternate"][hreflang]').length, 6, file);
    for (const [name, value] of Object.entries(verification)) {
      const tags = document.querySelectorAll(`meta[name="${name}"]`);
      assert.equal(tags.length, value ? 1 : 0, `${file}: verification tag count ${name}`);
      if (value) assert.equal(tags[0].content, value, `${file}: verification token ${name}`);
    }
    assert.equal(document.title, page.title, file);
    assert.equal(document.querySelectorAll('title').length, 1, file);
    for (const name of ['description', 'robots', 'author', 'viewport']) assert.equal(document.querySelectorAll(`meta[name="${name}"]`).length, 1, `${file}: unique ${name}`);
    assert.equal(document.querySelector('meta[name="author"]').content, '김규태 · Sean Kim');
    const shape = [...document.querySelectorAll('meta[name="description"], meta[name="robots"], meta[name="author"], meta[property^="og:"], meta[name^="twitter:"]')]
      .map(tag => tag.getAttribute('name') ?? tag.getAttribute('property')).sort();
    commonHeadShape ??= shape;
    assert.deepEqual(shape, commonHeadShape, `${file}: shared metadata field contract`);
    assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1, file);
    assert.equal(document.querySelector('link[rel="canonical"]').href, SITE_URL + page.path, file);
    assert.equal(document.querySelector('meta[name="description"]').content, page.description, file);
    assert.match(document.querySelector('meta[name="robots"]').content, /^index, follow/, file);
    for (const [selector, expected] of [
      ['meta[property="og:url"]', SITE_URL + page.path],
      ['meta[property="og:title"]', page.title],
      ['meta[property="og:description"]', page.description],
      ['meta[name="twitter:title"]', page.title],
      ['meta[name="twitter:description"]', page.description],
    ]) assert.equal(document.querySelector(selector).content, expected, file);
    const imageUrl = `${SITE_URL}/${page.image}`;
    const sharingTags = [
      ['meta[property="og:type"]', page.article ? 'article' : 'website'],
      ['meta[property="og:site_name"]', '김규태 · Sean Kim'],
      ['meta[property="og:title"]', page.title],
      ['meta[property="og:description"]', page.description],
      ['meta[property="og:url"]', SITE_URL + page.path],
      ['meta[property="og:image"]', imageUrl],
      ['meta[property="og:image:secure_url"]', imageUrl],
      ['meta[property="og:image:type"]', 'image/jpeg'],
      ['meta[property="og:image:width"]', '1200'],
      ['meta[property="og:image:height"]', '630'],
      ['meta[property="og:image:alt"]', page.imageAlt],
      ['meta[name="twitter:card"]', 'summary_large_image'],
      ['meta[name="twitter:title"]', page.title],
      ['meta[name="twitter:description"]', page.description],
      ['meta[name="twitter:image"]', imageUrl],
      ['meta[name="twitter:image:alt"]', page.imageAlt],
    ];
    // Slack can fetch only an initial byte range. Keep all sharing tags ahead of CSS
    // and large JSON-LD blocks, where a bot can find them without running JavaScript.
    // The byte window can end halfway through an inline stylesheet. CSS is not
    // part of this metadata assertion; remove style text to avoid parser noise.
    const prefixHtml = raw.subarray(0, 8192).toString('utf8')
      .replace(/<style\b[^>]*>[\s\S]*?(?:<\/style\s*>|$)/gi, '');
    const prefix = new JSDOM(prefixHtml);
    for (const [selector, expected] of sharingTags) {
      assert.equal(document.querySelectorAll(selector).length, 1, `${file}: duplicate ${selector}`);
      assert.equal(document.querySelector(selector)?.content, expected, `${file}: ${selector}`);
      assert.equal(prefix.window.document.querySelector(selector)?.content, expected, `${file}: sharing tag outside first 8 KiB`);
    }
    prefix.window.close();
    if (!checkedImages.has(page.image)) {
      const bytes = readFileSync(join(outDir, page.image));
      assert.deepEqual(jpegDimensions(bytes), { width: 1200, height: 630 }, `${file}: image dimensions`);
      assert.ok(bytes.length <= 512 * 1024, `${file}: keep sharing covers below our 512 KiB budget`);
      checkedImages.add(page.image);
    }
    assert.equal(document.querySelectorAll('script[type="application/ld+json"]').length, 1, file);
    const data = JSON.parse(document.querySelector('#site-structured-data').textContent);
    assert.ok(data['@graph'].some((node) => node['@type'] === page.kind && node.url === SITE_URL + page.path), file);
    const pageNode = data['@graph'].find(node => node['@type'] === page.kind && node.url === SITE_URL + page.path);
    assert.equal(pageNode.dateModified, validateDate(contentModified(page.path)), `${file}: structured modification date`);
    if (page.tool) {
      const software = data['@graph'].find(node => node['@id'] === `${SITE_URL + page.path}#software`);
      assert.equal(software['@type'], page.tool.url ? 'SoftwareApplication' : 'SoftwareSourceCode');
      assert.equal(software.url, page.tool.url ?? SITE_URL + page.path);
      assert.ok(document.querySelector(`a[href="${page.tool.source}"]`), `${file}: project source entry`);
      if (page.tool.url) assert.ok(document.querySelector(`a[href="${page.tool.url}"]`), `${file}: app entry`);
      else assert.ok(!document.querySelector('a[href="https://gyutae-kim.github.io/opencad-viewer3d/"]'), `${file}: no unpublished app URL`);
    }
    const root = document.querySelector('app-root');
    assert.equal(root.querySelectorAll('h1').length, 1, `${file}: one visible page heading`);
    assert.ok(root.querySelector('main').textContent.trim().length > 150, `${file}: real body content`);
    assert.doesNotMatch(root.textContent, /\{\{/, `${file}: unresolved bindings`);
    if (page.project) {
      assert.ok(root.textContent.includes(page.project.headline), `${file}: project content`);
      assert.ok(data['@graph'].some((node) => node['@type'] === 'CreativeWork'), file);
    }
    if (page.research) {
      assert.equal(root.querySelector('.research-entry')?.id, page.research.id, `${file}: research detail`);
      assert.ok(root.textContent.includes(page.research.role), `${file}: research contribution`);
      assert.ok(root.textContent.includes(page.research.outcome), `${file}: research outcome`);
      assert.ok(!root.querySelector('details:not([open])'), `${file}: research content remains visible`);
      assert.ok(data['@graph'].some((node) => node['@type'] === 'CreativeWork' && node['@id'] === `${SITE_URL + page.path}#research`), `${file}: research structured data`);
    }
    if (page.article) {
      assert.ok(root.textContent.includes(page.article.lead), `${file}: article body`);
      assert.ok(data['@graph'].some((node) => node['@type'] === 'TechArticle' && node.headline === page.article.title && node.dateModified === contentModified(page.path)), `${file}: article structured data`);
      for (const section of page.article.sections) assert.ok(document.getElementById(section.id), `${file}: article section ${section.id}`);
      if (page.article.viewer) {
        const actions = [...root.querySelectorAll('.article-actions a')].map(link => link.href);
        assert.deepEqual(actions, [page.article.viewer.url, ...(page.article.viewer.sampleUrl ? [page.article.viewer.sampleUrl] : [])], `${file}: guide opens its own viewer and sample`);
      }
    }
    for (const anchor of root.querySelectorAll('a[href]')) {
      const link = new URL(anchor.href);
      if (link.origin !== SITE_URL) continue;
      assert.ok(paths.has(link.pathname) || paths.has(link.pathname.replace(/\/$/, '')) || hostedApps.has(link.origin + link.pathname) || (link.pathname.startsWith('/assets/') && existsSync(join(outDir, decodeURIComponent(link.pathname)))), `${file}: unknown internal link ${link.pathname}`);
      if (link.pathname === page.path && link.hash) {
        assert.ok(document.getElementById(decodeURIComponent(link.hash.slice(1))), `${file}: broken fragment ${link.hash}`);
      }
      checkedLinks++;
    }
    // Every prerendered content image must be part of this release.
    for (const img of root.querySelectorAll('img[src]')) {
      const url = new URL(img.src);
      if (url.origin === SITE_URL) assert.ok(existsSync(join(outDir, decodeURIComponent(url.pathname))), `${file}: missing image ${url.pathname}`);
    }
    dom.window.close();
  }
  assert.ok(!titles.has(`${page.language}:${page.title}`), 'duplicate title in language');
  assert.ok(!descriptions.has(`${page.language}:${page.description}`), 'duplicate description in language');
  titles.add(`${page.language}:${page.title}`);
  descriptions.add(`${page.language}:${page.description}`);
}
const sitemap = new JSDOM(readFileSync(join(outDir, 'sitemap.xml'), 'utf8'), { contentType: 'text/xml' });
const sitemapUrls = [...sitemap.window.document.querySelectorAll('loc')].map((loc) => loc.textContent);
assert.deepEqual(sitemapUrls, [...new Set([...SEARCH_PAGES.map((page) => SITE_URL + page.path), ...[...hostedApps].filter((url) => new URL(url).origin === SITE_URL)])]);
for (const entry of sitemap.window.document.querySelectorAll('url')) {
  const url = entry.querySelector('loc').textContent;
  const expected = contentModified(new URL(url).pathname) || linkedDates[url]?.lastmod;
  const localPage = paths.has(new URL(url).pathname);
  assert.equal(entry.querySelectorAll('lastmod').length, expected || localPage ? 1 : 0, url);
  if (expected || localPage) assert.equal(entry.querySelector('lastmod')?.textContent, validateDate(expected), url);
}
sitemap.window.close();
const robots = readFileSync(join(outDir, 'robots.txt'), 'utf8');
assert.match(robots, /User-agent: \*\s+Allow: \//);
assert.ok(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
for (const app of OPENCAD_TOOLS.filter(tool => tool.url).map(tool => tool.url)) {
  if (new URL(app).origin === SITE_URL) assert.ok(robots.includes(`Sitemap: ${app}sitemap.xml`), `Missing application sitemap discovery: ${app}`);
}
const notFound = new JSDOM(readFileSync(join(outDir, '404.html'), 'utf8'));
assert.match(notFound.window.document.querySelector('meta[name="robots"]').content, /noindex/);
assert.ok(!notFound.window.document.querySelector('meta[http-equiv="refresh"]'));
notFound.window.close();
assert.ok(existsSync(join(outDir, '.nojekyll')));
console.log(`SEO check passed: ${SEARCH_PAGES.length} pages, HTML aliases, ${checkedLinks} internal links, ${checkedImages.size} JPEG sharing covers, early Open Graph/Twitter tags, structured data, sitemap, robots, and 404.`);
