import { readFileSync, writeFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { validateDate } from './content-dates.mjs';
const selected = process.argv.indexOf('--url');
const url = selected >= 0 ? process.argv[selected + 1] : 'https://gyutae-kim.github.io/2dcad-viewer/';
const address = new URL(url);
if (address.origin !== 'https://gyutae-kim.github.io' || !/^\/[a-z0-9-]+\/$/.test(address.pathname) || address.search || address.hash) {
  throw new Error('Provide a canonical application URL on the verified Pages host.');
}
const file = new URL('./linked-content-dates.json', import.meta.url);
const local = process.argv.indexOf('--file');
let xml;
if (local >= 0) xml = readFileSync(process.argv[local + 1], 'utf8');
else {
  const response = await fetch(url + 'sitemap.xml', { signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`Application sitemap HTTP ${response.status}`);
  xml = await response.text();
}
const dom = new JSDOM(xml, { contentType: 'text/xml' });
const entries = [...dom.window.document.querySelectorAll('url')].filter(el => el.querySelector('loc')?.textContent === url);
if (entries.length !== 1) throw new Error('Expected one entry for the application canonical URL.');
const lastmod = validateDate(entries[0].querySelector('lastmod')?.textContent);
dom.window.close();
const history = JSON.parse(readFileSync(file, 'utf8'));
if (history[url] && Date.parse(lastmod) < Date.parse(history[url].lastmod)) throw new Error('Refusing to replace linked content with an older date.');
history[url] = { lastmod };
writeFileSync(file, JSON.stringify(history, null, 2) + '\n');
console.log(`Linked application content date: ${url} ${lastmod}. Rebuild the root sitemap.`);
