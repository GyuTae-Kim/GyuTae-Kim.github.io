import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { INDEXNOW_KEY, KEY_FILE, buildPayload, parseSitemap, selectUrls } from './indexnow.mjs';

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url><loc>https://gyutae-kim.github.io/</loc><lastmod>2026-11-19T10:08:43Z</lastmod><xhtml:link rel="alternate" hreflang="en" href="https://gyutae-kim.github.io/en/"/></url>
  <url><loc>https://gyutae-kim.github.io/portfolio</loc><lastmod>2026-11-01T00:00:00Z</lastmod></url>
  <url><loc>https://gyutae-kim.github.io/opencad-step/</loc></url>
  <url><loc>https://example.com/elsewhere</loc><lastmod>2026-11-19T10:08:43Z</lastmod></url>
</urlset>`;

test('reads page URLs and last-modified times, not hreflang alternates', () => {
  assert.deepEqual(parseSitemap(sitemap).map((entry) => entry.loc), [
    'https://gyutae-kim.github.io/',
    'https://gyutae-kim.github.io/portfolio',
    'https://gyutae-kim.github.io/opencad-step/',
    'https://example.com/elsewhere',
  ]);
});

test('submits only this host, and only pages changed since the given time', () => {
  const entries = parseSitemap(sitemap);
  assert.deepEqual(selectUrls(entries), [
    'https://gyutae-kim.github.io/',
    'https://gyutae-kim.github.io/portfolio',
    'https://gyutae-kim.github.io/opencad-step/',
  ]);
  assert.deepEqual(selectUrls(entries, { since: '2026-11-19T00:00:00Z' }), ['https://gyutae-kim.github.io/']);
  assert.throws(() => selectUrls(entries, { since: 'yesterday' }), /Invalid --since/);
});

test('payload names the hosted key file that proves ownership', () => {
  const payload = buildPayload(['https://gyutae-kim.github.io/']);
  assert.equal(payload.host, 'gyutae-kim.github.io');
  assert.equal(payload.keyLocation, `https://gyutae-kim.github.io/${KEY_FILE}`);
  assert.equal(readFileSync(new URL(`../src/${KEY_FILE}`, import.meta.url), 'utf8').trim(), INDEXNOW_KEY);
});
