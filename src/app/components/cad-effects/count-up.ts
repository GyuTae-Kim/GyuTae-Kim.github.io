// Counting a figure up from zero, like a machine's digital readout settling on a value.
// Every number in the text keeps its own decimals and digit grouping; the words around
// the numbers stay as they are.

const NUMBER = /\d[\d,]*(?:\.\d+)?/g;

export interface CountText {
  // Text between the numbers; always one longer than `numbers`.
  words: string[];
  numbers: { value: number; decimals: number; grouped: boolean }[];
}

export function parseCount(text: string): CountText | null {
  const words: string[] = [];
  const numbers: CountText['numbers'] = [];
  let last = 0;
  for (const match of text.matchAll(NUMBER)) {
    const raw = match[0];
    const value = Number(raw.replace(/,/g, ''));
    if (!Number.isFinite(value)) return null;
    words.push(text.slice(last, match.index));
    numbers.push({ value, decimals: raw.split('.')[1]?.length ?? 0, grouped: raw.includes(',') });
    last = match.index! + raw.length;
  }
  if (!numbers.length || numbers.every((n) => n.value === 0)) return null;
  words.push(text.slice(last));
  return { words, numbers };
}

// The text at `progress` (0 to 1) of the way to the final figures.
export function countAt(parts: CountText, progress: number): string {
  const p = Math.min(Math.max(progress, 0), 1);
  return parts.numbers.reduce((text, n, i) => {
    const fixed = (n.value * p).toFixed(n.decimals);
    const [whole, fraction] = fixed.split('.');
    const shown = n.grouped ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : whole;
    return text + shown + (fraction ? '.' + fraction : '') + parts.words[i + 1];
  }, parts.words[0]);
}
