import test from 'node:test';
import assert from 'node:assert/strict';
import { contentFingerprint, updatedHistory, validateDate, assertContentDate } from './content-dates.mjs';
const page = (text, date = '2026-01-01T00:00:00Z', scope = 'a') => `<html><head><title>Page</title><meta name="description" content="Description"><script type="application/ld+json">{"name":"Page","dateModified":"${date}"}</script></head><body><main _nghost-${scope}><h1>${text}</h1><img src="/assets/a.jpg"></main><footer>Build timestamp</footer></body></html>`;
const bytes = () => Buffer.from('image');
test('dates, build-only Angular attributes and footer do not change content identity', () => {
  assert.equal(contentFingerprint(page('Body'), bytes), contentFingerprint(page('Body', '2026-02-01T00:00:00Z', 'b'), bytes));
  assert.notEqual(contentFingerprint(page('Body'), bytes), contentFingerprint(page('New body'), bytes));
  assert.notEqual(contentFingerprint(page('Body'), bytes), contentFingerprint(page('Body'), () => Buffer.from('updated image')));
});
test('only changed pages receive a new date and stale records fail validation', () => {
  const history = { '/': { lastmod: '2026-01-01T00:00:00Z', fingerprint: 'a' }, '/notes': { lastmod: '2026-01-02T00:00:00Z', fingerprint: 'b' } };
  const next = updatedHistory(history, { '/': 'a', '/notes': 'c' }, '2026-02-01T00:00:00Z');
  assert.deepEqual(next['/'], history['/']);
  assert.equal(next['/notes'].lastmod, '2026-02-01T00:00:00Z');
  assert.throws(() => assertContentDate('/notes', history['/notes'], 'c'), /content changed/);
  assert.throws(() => updatedHistory(history, { '/': 'c' }, '2025-12-01T00:00:00Z'), /later modification/);
});
test('responsive image bytes and application-relative images are included', () => {
  const html = page('Body').replace('src="/assets/a.jpg"', 'src="a.jpg" srcset="a.jpg 1x, b.jpg 2x"');
  const assets = { '/2dcad-viewer/a.jpg': Buffer.from('a'), '/2dcad-viewer/b.jpg': Buffer.from('b') };
  const before = contentFingerprint(html, path => assets[path], 'https://gyutae-kim.github.io/2dcad-viewer/');
  assets['/2dcad-viewer/b.jpg'] = Buffer.from('changed retina image');
  assert.notEqual(before, contentFingerprint(html, path => assets[path], 'https://gyutae-kim.github.io/2dcad-viewer/'));
});
test('rejects invalid calendar dates and future timestamps', () => {
  assert.throws(() => validateDate('2026-02-30T00:00:00Z'));
  assert.throws(() => validateDate('2999-01-01T00:00:00Z'));
});
