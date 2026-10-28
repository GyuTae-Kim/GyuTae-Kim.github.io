// Validate the deployment artifacts, including crawlers that do not execute JS.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';
import { validateDate } from './content-dates.mjs';
const require = createRequire(import.meta.url);
const { LOCALIZED_SEARCH_PAGES: SEARCH_PAGES, SITE_URL, OPENCAD_TOOLS, contentModified, DEFAULT_LANGUAGE, LANGUAGES, languagePath, localizedHref, originalPath, translate } = require('../dist/server/main.js');
const outDir = resolve(process.argv[2] || 'docs');
const fontCoverage = JSON.parse(readFileSync(join(outDir, 'assets/fonts/coverage.json'), 'utf8'));
const fontCharacters = new Set([...fontCoverage.covered, ...fontCoverage.fallback]);
const cjkCoverage = JSON.parse(readFileSync(join(outDir, 'assets/fonts/cjk-coverage.json'), 'utf8'));
for (const font of cjkCoverage.files) {
  const bytes = readFileSync(join(outDir, 'assets/fonts', font.name));
  assert.equal(bytes.toString('ascii', 0, 4), 'wOF2', font.name);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), font.sha256, `${font.name}: generated glyph coverage matches deployed font`);
}
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
    fontRoot.querySelectorAll('.language-menu,.language-versions').forEach(el => el.remove());
    const unstyledText = fontRoot.textContent;
    const missingGlyphs = [...new Set([...unstyledText].filter(c => !/\s/u.test(c) && !fontCharacters.has(c.codePointAt(0))))];
    if (page.language === 'ko') assert.deepEqual(missingGlyphs, [], `${file}: run tools/prepare-site-fonts.py for new characters`);
    if (page.language === 'ja' || page.language === 'zh-CN') {
      const nativeCharacters = new Set([...fontCoverage.covered, ...cjkCoverage.files.filter(font => font.locale === page.language || font.locale === 'common').flatMap(font => font.covered)]);
      const missingNative = [...new Set([...unstyledText].filter(c => !/\s/u.test(c) && !nativeCharacters.has(c.codePointAt(0))))];
      assert.deepEqual(missingNative, [], `${file}: native text must render without OS Japanese/Chinese fonts`);
    }
    assert.equal(document.documentElement.lang, page.language, file);
    for (const { code } of LANGUAGES) assert.equal(document.querySelector(`link[rel="alternate"][hreflang="${code}"]`)?.href, SITE_URL + languagePath(originalPath(page.path), code), `${file}: reciprocal ${code} alternate`);
    assert.equal(document.querySelectorAll('link[rel="alternate"][hreflang]').length, 6, file);
    assert.equal(document.querySelector('link[hreflang="x-default"]')?.href, SITE_URL + languagePath(originalPath(page.path), DEFAULT_LANGUAGE), `${file}: English fallback, explicit Korean alternate preserved`);
    assert.ok(document.querySelector(`.footer-notes a[href="${languagePath('/sitemap', page.language)}"]`), `${file}: crawlable native page directory`);
    for (const [name, value] of Object.entries(verification)) {
      const tags = document.querySelectorAll(`meta[name="${name}"]`);
      assert.equal(tags.length, value ? 1 : 0, `${file}: verification tag count ${name}`);
      if (value) assert.equal(tags[0].content, value, `${file}: verification token ${name}`);
    }
    assert.equal(document.title, page.title, file);
    if (page.article?.guide) {
      assert.ok(document.querySelector('#example-check'), `${file}: static sample walkthrough`);
      assert.equal(document.querySelectorAll('.guide-evidence table').length, 3, `${file}: support, sample and troubleshooting tables`);
      assert.ok(document.querySelector('.article-actions a[href*="sample"]'), `${file}: directly runnable public example`);
      for (const img of document.querySelectorAll('.guide-evidence img')) {
        assert.equal(img.getAttribute('loading'), 'lazy', `${file}: below-fold evidence image`);
        assert.ok(img.getAttribute('srcset')?.includes('720w'), `${file}: mobile evidence image`);
        assert.ok(img.getAttribute('width') && img.getAttribute('height'), `${file}: reserve evidence image layout`);
      }
    }
    assert.equal(document.querySelectorAll('title').length, 1, file);
    for (const name of ['description', 'robots', 'author', 'viewport']) assert.equal(document.querySelectorAll(`meta[name="${name}"]`).length, 1, `${file}: unique ${name}`);
    assert.equal(document.querySelector('meta[name="author"]').content, translate('김규태 · Sean Kim', page.language));
    const shape = [...document.querySelectorAll('meta[name="description"], meta[name="robots"], meta[name="author"], meta[property^="og:"], meta[name^="twitter:"]')]
      .map(tag => tag.getAttribute('name') ?? tag.getAttribute('property')).sort();
    commonHeadShape ??= shape;
    assert.deepEqual(shape, commonHeadShape, `${file}: shared metadata field contract`);
    assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1, file);
    assert.equal(document.querySelector('link[rel="canonical"]').href, SITE_URL + page.path, file);
    if (originalPath(page.path) === '/sitemap') {
      const links = new Set(Array.from(document.querySelectorAll('.directory-groups a')).map(link => link.href));
      for (const target of SEARCH_PAGES.filter(target => target.language === page.language && target.path !== page.path)) assert.ok(links.has(SITE_URL + target.path), `${file}: directory missing ${target.path}`);
      for (const app of OPENCAD_TOOLS.filter(tool => tool.url)) assert.ok(links.has(localizedHref(app.url, page.language)), `${file}: directory missing app ${app.id}`);
    }
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
      ['meta[property="og:site_name"]', translate('김규태 · Sean Kim', page.language)],
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
    const person = data['@graph'].find(node => node['@type'] === 'Person');
    const profileUrl = SITE_URL + languagePath('/', page.language);
    assert.equal(person.url, profileUrl, `${file}: author profile in this language`);
    assert.equal(person.name, page.language === 'ko' ? '김규태' : 'Sean Kim', `${file}: public name`);
    assert.ok(person.alternateName.includes('GyuTae-Kim'), `${file}: stable public identifier`);
    assert.equal(person.mainEntityOfPage['@id'], profileUrl + '#webpage', `${file}: author profile identity`);
    assert.equal(pageNode.inLanguage, page.language, `${file}: page language`);
    assert.deepEqual(data['@graph'].find(node => node['@type'] === 'WebSite').inLanguage, LANGUAGES.map(({ code }) => code), `${file}: multilingual website`);
    if (originalPath(page.path) === '/opencad') {
      const tools = data['@graph'].find(node => node['@id'] === `${SITE_URL + page.path}#tools`);
      assert.deepEqual(tools.itemListElement.map(item => item.url), OPENCAD_TOOLS.filter(tool => tool.url).map(tool => localizedHref(tool.url, page.language)), `${file}: structured viewer links stay in this language`);
    }
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
    const languageLinks = [...root.querySelectorAll('.language-versions:not(.profile-language-homes) a')];
    assert.equal(languageLinks.length, LANGUAGES.length, `${file}: visible language alternatives`);
    for (const { code, label } of LANGUAGES) {
      const link = languageLinks.find(link => link.hreflang === code);
      assert.ok(link && !link.closest('[hidden]'), `${file}: discoverable ${code} version`);
      assert.equal(link.lang, code, `${file}: native language label`);
      assert.equal(link.textContent, label, `${file}: language name`);
      assert.equal(link.href, SITE_URL + languagePath(originalPath(page.path), code), `${file}: matching page in ${code}`);
      assert.equal(link.getAttribute('aria-current'), code === page.language ? 'page' : null, `${file}: current language`);
    }
    // An indexed tool/article must also expose each developer home, rather than
    // relying on sitemap processing or only linking translated tool pages.
    const profiles = [...root.querySelectorAll('.profile-language-homes a')];
    assert.equal(profiles.length, LANGUAGES.length, `${file}: discoverable author homes`);
    for (const { code } of LANGUAGES) {
      const profile = profiles.find(link => link.hreflang === code);
      assert.ok(profile && !profile.closest('[hidden]'), `${file}: visible ${code} author profile`);
      assert.equal(profile.href, SITE_URL + languagePath('/', code), `${file}: canonical ${code} author home`);
    }
    for (const link of root.querySelectorAll('a[href]')) {
      const target = new URL(link.href);
      if (target.origin === SITE_URL) assert.ok(!/^\/(en|ja|zh-CN|de)$/.test(target.pathname), `${file}: home alias ${link.getAttribute('href')}`);
    }
    for (const alternate of document.querySelectorAll('link[rel="alternate"][hreflang]')) {
      assert.ok(alternate.compareDocumentPosition(document.querySelector('#site-structured-data')) & 4, `${file}: language links precede structured data`);
    }
    if (originalPath(page.path) === '/opencad') {
      const developer = root.querySelector('.page-intro a[href="' + languagePath('/', page.language) + '"]');
      assert.ok(developer, `${file}: contextual developer portfolio entry`);
      assert.ok(root.querySelector('#browser-cad-title'), `${file}: browser CAD scope and free-use guide`);
    }
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
      for (const section of page.article.sections) {
        const heading = document.getElementById(section.id);
        assert.ok(heading, `${file}: article section ${section.id}`);
        if (section.table) {
          const table = heading.parentElement.querySelector('table');
          assert.equal(table?.querySelector('caption')?.textContent.trim(), section.table.caption, `${file}: comparison caption`);
          assert.deepEqual([...table.querySelectorAll('thead th')].map(cell => cell.textContent.trim()), section.table.columns, `${file}: comparison column headers`);
          assert.deepEqual([...table.querySelectorAll('tbody tr')].map(row => [...row.children].map(cell => cell.textContent.trim())), section.table.rows, `${file}: complete comparison is present without JavaScript`);
        }
      }
      if (page.article.viewer) {
        const actions = [...root.querySelectorAll('.article-actions a')].map(link => link.href);
        assert.deepEqual(actions, [page.article.viewer.url, ...(page.article.viewer.sampleUrl ? [page.article.viewer.sampleUrl] : [])], `${file}: guide opens its own viewer and sample`);
      }
      if (page.article.actions) {
        const actions = [...root.querySelectorAll('nav.article-actions a')].map(link => link.href);
        assert.deepEqual(actions, page.article.actions.map(action => SITE_URL + languagePath(action.path, page.language)), `${file}: workflow actions keep their locale`);
        const crumbs = data['@graph'].find(node => node['@type'] === 'BreadcrumbList');
        assert.equal(crumbs.itemListElement[1].item, SITE_URL + languagePath('/opencad', page.language), `${file}: article breadcrumb points to its collection`);
      }
    }
    if (originalPath(page.path) === '/opencad') {
      const choices = [...root.querySelectorAll('.file-choice-table tbody tr')];
      assert.equal(choices.length, 4, `${file}: choose a viewer without loading JavaScript`);
      for (const row of choices) {
        assert.ok(hostedApps.has(row.querySelector('th a').href), `${file}: selector opens a published localized app`);
        assert.ok(row.querySelector('td a').href.startsWith(SITE_URL + languagePath('/opencad/guides/', page.language)), `${file}: selector links to a localized guide`);
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
const rootMap = new JSDOM(readFileSync(join(outDir, 'sitemap.xml'), 'utf8'), { contentType: 'text/xml' });
assert.equal(rootMap.window.document.documentElement.localName, 'urlset', 'root lists URLs without a child-map fetch');
assert.equal(rootMap.window.document.documentElement.namespaceURI, 'http://www.sitemaps.org/schemas/sitemap/0.9');
const allCanonical = [...new Set([...SEARCH_PAGES.map(page => SITE_URL + page.path), ...hostedApps])];
assert.deepEqual(Array.from(rootMap.window.document.querySelectorAll('url > loc')).map(el => el.textContent), allCanonical);
const localeUnion = [];
for (const { code } of LANGUAGES) {
  const map = new JSDOM(readFileSync(join(outDir, `sitemap-${code}.xml`), 'utf8'), { contentType: 'text/xml' });
  const expected = [...SEARCH_PAGES.filter(page => page.language === code).map(page => SITE_URL + page.path), ...OPENCAD_TOOLS.filter(tool => tool.url).map(tool => localizedHref(tool.url, code))];
  const found = Array.from(map.window.document.querySelectorAll('url > loc')).map(el => el.textContent);
  assert.deepEqual(found, expected, `${code}: exact language coverage`);
  localeUnion.push(...found);
  map.window.close();
}
assert.equal(new Set(localeUnion).size, localeUnion.length, 'locale maps partition URLs without duplicates');
assert.deepEqual(new Set(localeUnion), new Set(allCanonical));
for (const entry of rootMap.window.document.querySelectorAll('url')) {
  const url = entry.querySelector('loc').textContent;
  const versions = Array.from(entry.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'link'));
  if (hostedApps.has(url)) {
    assert.equal(versions.length, 0, `${url}: app-owned language annotations are not overridden`);
    assert.equal(entry.querySelectorAll('lastmod').length, 0, `${url}: no invented app modification date`);
  } else {
    assert.equal(versions.length, 6, `${url}: native alternatives and fallback`);
    assert.equal(versions.find(link => link.getAttribute('hreflang') === 'x-default')?.getAttribute('href'), versions.find(link => link.getAttribute('hreflang') === 'en')?.getAttribute('href'), `${url}: English XML fallback`);
  }
}
rootMap.window.close();
const sitemap = new JSDOM(readFileSync(join(outDir, 'sitemap-pages.xml'), 'utf8'), { contentType: 'text/xml' });
assert.equal(sitemap.window.document.documentElement.localName, 'urlset');
const sitemapUrls = [...sitemap.window.document.querySelectorAll('loc')].map((loc) => loc.textContent);
assert.deepEqual(sitemapUrls, [...new Set(SEARCH_PAGES.map((page) => SITE_URL + page.path))]);
const textSitemap = readFileSync(join(outDir, 'sitemap.txt'), 'utf8');
assert.ok(textSitemap.endsWith('\n'), 'text sitemap ends with a newline');
const directUrls = textSitemap.trimEnd().split('\n');
assert.deepEqual(directUrls, [...new Set([...sitemapUrls, ...hostedApps])], 'direct text sitemap lists every canonical page and published app once');
for (const url of directUrls) {
  assert.ok(!/\s/.test(url), `text sitemap contains only URLs: ${url}`);
  const parsed = new URL(url);
  assert.equal(parsed.origin, SITE_URL, url);
  assert.equal(parsed.search + parsed.hash, '', url);
}
for (const entry of sitemap.window.document.querySelectorAll('url')) {
  const url = entry.querySelector('loc').textContent;
  const expected = contentModified(new URL(url).pathname);
  assert.equal(entry.querySelectorAll('lastmod').length, 1, url);
  assert.equal(entry.querySelector('lastmod')?.textContent, validateDate(expected), url);
}
sitemap.window.close();
const robots = readFileSync(join(outDir, 'robots.txt'), 'utf8');
assert.match(robots, /User-agent: \*\s+Allow: \//);
assert.ok(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
assert.deepEqual(robots.match(/^Sitemap: .+$/gm), [`Sitemap: ${SITE_URL}/sitemap.xml`], 'one canonical discovery file covers the portfolio and all apps');
// Old paths signal a permanent move without requiring JavaScript rendering.
const movedApps = JSON.parse(readFileSync(new URL('./moved-apps.json', import.meta.url), 'utf8'));
for (const [from, { url }] of Object.entries(movedApps)) {
  assert.ok(hostedApps.has(url), `${from}: forwards to a published app`);
  assert.ok(!sitemapUrls.includes(SITE_URL + from), `${from}: old app path stays out of the sitemap`);
  const raw = readFileSync(join(outDir, from.slice(1), 'index.html'), 'utf8');
  const moved = new JSDOM(raw).window.document;
  assert.match(moved.querySelector('meta[name="robots"]').content, /^index, follow$/, `${from}: do not block redirect processing`);
  assert.equal(moved.querySelector('link[rel="canonical"]').href, url, `${from}: canonical`);
  assert.equal(moved.querySelector('head > meta[http-equiv="refresh"]')?.content, `0;url=${url}`, `${from}: crawler-visible permanent refresh`);
  assert.ok(!moved.querySelector('noscript'), `${from}: refresh is unconditional`);
  assert.ok(raw.includes(`${JSON.stringify(url)} + location.search + location.hash`), `${from}: keeps query and fragment`);
  assert.ok(raw.includes(".content = '0;url=' + target; location.replace(target)"), `${from}: refresh and script share the complete destination`);
}
const notFound = new JSDOM(readFileSync(join(outDir, '404.html'), 'utf8'));
assert.match(notFound.window.document.querySelector('meta[name="robots"]').content, /noindex/);
assert.ok(!notFound.window.document.querySelector('meta[http-equiv="refresh"]'));
notFound.window.close();
assert.ok(existsSync(join(outDir, '.nojekyll')));
console.log(`SEO check passed: ${SEARCH_PAGES.length} pages, HTML aliases, ${checkedLinks} internal links, ${checkedImages.size} JPEG sharing covers, early Open Graph/Twitter tags, structured data, sitemap, robots, and 404.`);
