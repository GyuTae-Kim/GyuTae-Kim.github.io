import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const directory = process.argv[2];
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const results = {};
for (const variant of ['baseline', 'candidate']) {
  const runs = readdirSync(directory).filter(file => new RegExp(`^${variant}-\\d+\\.report\\.json$`).test(file))
    .map(file => JSON.parse(readFileSync(join(directory, file), 'utf8')));
  if (runs.length !== 3 || runs.some(run => run.runtimeError)) throw new Error(`${variant}: three complete reports required`);
  const rows = runs.map(({ categories, audits }) => ({
    performance: Math.round(categories.performance.score * 100),
    seo: Math.round(categories.seo.score * 100),
    accessibility: Math.round(categories.accessibility.score * 100),
    fcp: audits['first-contentful-paint'].numericValue,
    lcp: audits['largest-contentful-paint'].numericValue,
    cls: audits['cumulative-layout-shift'].numericValue,
    tbt: audits['total-blocking-time'].numericValue,
    fontBytes: audits['network-requests'].details.items.filter(item => item.resourceType === 'Font')
      .reduce((bytes, item) => bytes + item.transferSize, 0),
    fontRequests: audits['network-requests'].details.items.filter(item => item.resourceType === 'Font').length,
  }));
  results[variant] = { runs: rows, median: Object.fromEntries(Object.keys(rows[0]).map(key => [key, median(rows.map(row => row[key]))])) };
}
const report = { baselineRun: JSON.parse(readFileSync(join(directory, 'baseline-run.json'), 'utf8'))[0], results };
writeFileSync(join(directory, 'comparison.json'), JSON.stringify(report, null, 2) + '\n');
console.log('### Mobile lab comparison (three cold loads per variant)\n');
console.log('Both compiled artifacts are served on the same runner. This isolates asset changes; these are not production PageSpeed scores or real-user measurements.\n');
console.log('| Variant | Performance | FCP (ms) | LCP (ms) | CLS | TBT (ms) | Font KiB | Font requests |');
console.log('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
for (const [variant, { median: r }] of Object.entries(results)) {
  console.log(`| ${variant} | ${r.performance} | ${Math.round(r.fcp)} | ${Math.round(r.lcp)} | ${r.cls.toFixed(3)} | ${Math.round(r.tbt)} | ${(r.fontBytes / 1024).toFixed(1)} | ${r.fontRequests} |`);
}
