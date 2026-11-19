import { countAt, parseCount } from './count-up';

describe('count-up', () => {
  it('ends on exactly the text it started from', () => {
    for (const text of ['9종', '±0.15 mm', '48.9% → 94.4%', '13 / 40벌', '+29.8%p', '1,234개', '4.9초', '15 types']) {
      expect(countAt(parseCount(text)!, 1)).toBe(text);
    }
  });

  it('keeps decimals, grouping and the words around the numbers on the way', () => {
    expect(countAt(parseCount('±0.15 mm')!, 0)).toBe('±0.00 mm');
    expect(countAt(parseCount('48.9% → 94.4%')!, 0.5)).toBe('24.4% → 47.2%');
    expect(countAt(parseCount('12,000개')!, 0.5)).toBe('6,000개');
  });

  it('leaves text without a figure to count alone', () => {
    expect(parseCount('웹 뷰어')).toBeNull();
    expect(parseCount('0%')).toBeNull();
  });
});
