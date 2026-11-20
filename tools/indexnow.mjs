// Tells IndexNow search engines (Bing, Naver, Yandex, Seznam, Yep) which published pages changed.
// Google does not take part; it keeps discovering pages through links and the sitemap.
//
// Usage, after the gh-pages deploy has gone live:
//   node tools/indexnow.mjs docs --since 2026-11-19T10:00:00Z   # pages whose sitemap lastmod is at or after the time
//   node tools/indexnow.mjs docs --all                            # every page in the sitemap (first submission)
//   add --dry-run to print the URLs without sending them.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const SITE_URL = 'https://gyutae-kim.github.io';
const config = JSON.parse(readFileSync(new URL('./indexnow.json', import.meta.url), 'utf8'));
export const INDEXNOW_KEY = config.key;
export const INDEXNOW_ENDPOINT = config.endpoint;
export const KEY_FILE = `${INDEXNOW_KEY}.txt`;
// The protocol accepts up to 10,000 URLs per request.
const MAX_URLS = 10000;

export function parseSitemap(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, body]) => ({
    loc: body.match(/<loc>([^<]+)<\/loc>/)?.[1].trim(),
    lastmod: body.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1].trim(),
  })).filter((entry) => entry.loc);
}

export function selectUrls(entries, { since } = {}) {
  const from = since ? Date.parse(since) : undefined;
  if (since && Number.isNaN(from)) throw new Error(`Invalid --since time: ${since}`);
  const urls = entries
    .filter((entry) => entry.loc.startsWith(`${SITE_URL}/`))
    .filter((entry) => from === undefined || (entry.lastmod && Date.parse(entry.lastmod) >= from))
    .map((entry) => entry.loc);
  return [...new Set(urls)];
}

export function buildPayload(urls) {
  if (!/^[a-f0-9]{32}$/.test(INDEXNOW_KEY)) throw new Error('IndexNow key must be 32 lowercase hex characters');
  if (urls.length > MAX_URLS) throw new Error(`IndexNow accepts at most ${MAX_URLS} URLs per request`);
  return { host: new URL(SITE_URL).host, key: INDEXNOW_KEY, keyLocation: `${SITE_URL}/${KEY_FILE}`, urlList: urls };
}

async function main(argv) {
  const outDir = argv.find((arg) => !arg.startsWith('--')) ?? 'docs';
  const sinceIndex = argv.indexOf('--since');
  const since = sinceIndex >= 0 ? argv[sinceIndex + 1] : undefined;
  if (!since && !argv.includes('--all')) throw new Error('Pass --since <ISO time> or --all');
  const dryRun = argv.includes('--dry-run');

  const localKey = readFileSync(join(outDir, KEY_FILE), 'utf8').trim();
  if (localKey !== INDEXNOW_KEY) throw new Error(`${outDir}/${KEY_FILE} does not hold the IndexNow key`);
  const urls = selectUrls(parseSitemap(readFileSync(join(outDir, 'sitemap.xml'), 'utf8')), { since });
  console.log(`IndexNow: ${urls.length} URL(s)${since ? ` changed since ${since}` : ''}`);
  if (dryRun || !urls.length) {
    urls.forEach((url) => console.log(`  ${url}`));
    return;
  }

  // Engines reject the whole request when the key file is not live yet, so check the deploy first.
  const live = await fetch(`${SITE_URL}/${KEY_FILE}`, { cache: 'no-store' });
  const liveKey = live.ok ? (await live.text()).trim() : '';
  if (liveKey !== INDEXNOW_KEY) throw new Error(`${SITE_URL}/${KEY_FILE} is not live yet (HTTP ${live.status}); deploy first`);

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(buildPayload(urls)),
  });
  // 200 = accepted, 202 = accepted and the key is still being validated.
  console.log(`IndexNow response: HTTP ${response.status}`);
  if (![200, 202].includes(response.status)) {
    throw new Error(`IndexNow rejected the submission: HTTP ${response.status} ${(await response.text()).slice(0, 300)}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
