// Validate the deployment artifacts, including crawlers that do not execute JS.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { SEARCH_PAGES, SITE_URL } = require('../dist/server/main.js');
const outDir = resolve(process.argv[2] || 'docs');
const { JSDOM } = require('jsdom');
const titles = new Set();
const descriptions = new Set();
const paths = new Set(SEARCH_PAGES.map((page) => page.path));
const verification = JSON.parse(readFileSync(new URL('./search-verification.json', import.meta.url), 'utf8'));
const checkedImages = new Set();
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
for (const page of SEARCH_PAGES) {
  const files = page.path === '/' ? ['index.html'] : [`${page.path.slice(1)}.html`, `${page.path.slice(1)}/index.html`];
  for (const file of files) {
    const raw = readFileSync(join(outDir, file));
    const dom = new JSDOM(raw.toString('utf8'), { url: SITE_URL + page.path });
    const document = dom.window.document;
    assert.equal(document.documentElement.lang, 'ko', file);
    for (const [name, value] of Object.entries(verification)) {
      const tags = document.querySelectorAll(`meta[name="${name}"]`);
      assert.equal(tags.length, value ? 1 : 0, `${file}: verification tag count ${name}`);
      if (value) assert.equal(tags[0].content, value, `${file}: verification token ${name}`);
    }
    assert.equal(document.title, page.title, file);
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
      ['meta[property="og:type"]', 'website'],
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
    const prefix = new JSDOM(raw.subarray(0, 8192).toString('utf8'));
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
    const root = document.querySelector('app-root');
    assert.equal(root.querySelectorAll('h1').length, 1, `${file}: one visible page heading`);
    assert.ok(root.querySelector('main').textContent.trim().length > 150, `${file}: real body content`);
    assert.doesNotMatch(root.textContent, /\{\{/, `${file}: unresolved bindings`);
    if (page.project) {
      assert.ok(root.textContent.includes(page.project.headline), `${file}: project content`);
      assert.ok(data['@graph'].some((node) => node['@type'] === 'CreativeWork'), file);
    }
    for (const anchor of root.querySelectorAll('a[href]')) {
      const link = new URL(anchor.href);
      if (link.origin !== SITE_URL) continue;
      assert.ok(paths.has(link.pathname) || (link.pathname.startsWith('/assets/') && existsSync(join(outDir, decodeURIComponent(link.pathname)))), `${file}: unknown internal link ${link.pathname}`);
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
  assert.ok(!titles.has(page.title), 'duplicate title');
  assert.ok(!descriptions.has(page.description), 'duplicate description');
  titles.add(page.title);
  descriptions.add(page.description);
}
const sitemap = new JSDOM(readFileSync(join(outDir, 'sitemap.xml'), 'utf8'), { contentType: 'text/xml' });
const sitemapUrls = [...sitemap.window.document.querySelectorAll('loc')].map((loc) => loc.textContent);
assert.deepEqual(sitemapUrls, SEARCH_PAGES.map((page) => SITE_URL + page.path));
sitemap.window.close();
const robots = readFileSync(join(outDir, 'robots.txt'), 'utf8');
assert.match(robots, /User-agent: \*\s+Allow: \//);
assert.ok(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
const notFound = new JSDOM(readFileSync(join(outDir, '404.html'), 'utf8'));
assert.match(notFound.window.document.querySelector('meta[name="robots"]').content, /noindex/);
assert.ok(!notFound.window.document.querySelector('meta[http-equiv="refresh"]'));
notFound.window.close();
assert.ok(existsSync(join(outDir, '.nojekyll')));
console.log(`SEO check passed: ${SEARCH_PAGES.length} pages, HTML aliases, ${checkedLinks} internal links, ${checkedImages.size} JPEG sharing covers, early Open Graph/Twitter tags, structured data, sitemap, robots, and 404.`);
