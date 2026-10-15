// "YYYY.MM" of the deployed page: GitHub Pages sends Last-Modified (the deploy time) with
// every HTML file, so the 「갱신」 fields follow each release without a hand-edited date.
export function siteUpdated(): string {
  if (typeof document === 'undefined') return '';
  const date = new Date(document.lastModified);
  if (isNaN(date.getTime())) return '';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
}
