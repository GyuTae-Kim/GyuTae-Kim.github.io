import { translate } from '../../i18n/localization';
import { translateViewportCaption } from './viewport-data';

describe('animated viewport captions', () => {
  const captions = [
    '01 스케치 · 140 × 100, R12',
    '05 구멍 · Ø10, 카운터보어 2곳',
    '07 면 분석 · 면 35개, 78쌍',
    '03 [황삭] 카운터보어 · T4 Ø12',
    '01 네스팅 · 라벨 100 × 50',
    'AI 인식 03 · 관통 구멍 · 4곳',
  ];
  it('translates the late animated steps as well as the initial SSR labels', () => {
    expect(translateViewportCaption(captions[1], text => translate(text, 'en')))
      .toBe('05 Hole · Ø10, counterbore at 2 locations');
    for (const language of ['en', 'ja', 'zh-CN', 'de'] as const)
      for (const caption of captions)
        expect(translateViewportCaption(caption, text => translate(text, language))).withContext(`${language}: ${caption}`).not.toMatch(/[가-힣]/);
  });
  it('preserves complete translations and technical step numbers and dimensions', () => {
    const raw = '01 네스팅 · 라벨 100 × 50';
    expect(translateViewportCaption(raw, text => translate(text, 'en'))).toBe(translate(raw, 'en'));
    const operation = translateViewportCaption(captions[3], text => translate(text, 'de'));
    expect(operation.startsWith('03 ')).toBeTrue();
    expect(operation).toContain('T4 Ø12');
  });
  it('preserves the Korean source captions exactly', () => {
    for (const caption of captions) expect(translateViewportCaption(caption, text => text)).toBe(caption);
  });
});
