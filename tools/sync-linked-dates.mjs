import { readFileSync, writeFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { validateDate } from './content-dates.mjs';
const url = 'https://gyutae-kim.github.io/2dcad-viewer/';
const file = new URL('./linked-content-dates.json', import.meta.url);
const local = process.argv.indexOf('--file');
let xml;
if (local >= 0) xml = readFileSync(process.argv[local + 1], 'utf8');
else {
  const response = await fetch(url + 'sitemap.xml', { signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`Viewer sitemap HTTP ${response.status}`);
  xml = await response.text();
}
const dom = new JSDOM(xml, { contentType: 'text/xml' });
const entry = [...dom.window.document.querySelectorAll('url')].find(el => el.querySelector('loc')?.textContent === url);
const lastmod = validateDate(entry?.querySelector('lastmod')?.textContent);
dom.window.close();
const history = JSON.parse(readFileSync(file, 'utf8'));
if (history[url] && Date.parse(lastmod) < Date.parse(history[url].lastmod)) throw new Error('Refusing to replace linked content with an older date.');
history[url] = { lastmod };
writeFileSync(file, JSON.stringify(history, null, 2) + '\n');
console.log(`Linked viewer content date: ${lastmod}. Rebuild the root sitemap.`);
