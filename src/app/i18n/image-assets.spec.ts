import { imageOriginal, localizedImage } from './image-assets';

describe('localized image assets', () => {
  const figure = 'assets/cases/feature-cam/step2.webp';
  it('keeps Korean originals and selects the requested figure language', () => {
    expect(localizedImage(figure, 'ko')).toBe(figure);
    expect(localizedImage(figure, 'ja')).toBe('assets/i18n/ja/cases/feature-cam/step2.webp');
    expect(localizedImage('/assets/i18n/en/cases/feature-cam/step2.webp?zoom=1#figure', 'de')).toBe('/assets/i18n/de/cases/feature-cam/step2.webp?zoom=1#figure');
  });
  it('switches responsive candidates without changing their density or width', () => {
    const pair = 'assets/opencad/viewer-step-720.webp 720w, assets/opencad/viewer-step-1440.webp 1440w';
    expect(localizedImage(pair, 'en')).toBe('assets/i18n/en/opencad/viewer-step-720.webp 720w, assets/i18n/en/opencad/viewer-step-1440.webp 1440w');
  });
  it('preserves other providers, input filenames and images without labels', () => {
    expect(localizedImage('https://example.com/assets/cases/feature-cam/step2.webp', 'en')).toBe('https://example.com/assets/cases/feature-cam/step2.webp');
    expect(localizedImage('https://example.com/?file=assets/cases/feature-cam/step2.webp', 'en')).toBe('https://example.com/?file=assets/cases/feature-cam/step2.webp');
    expect(localizedImage('assets/sean-kim.webp', 'de')).toBe('assets/sean-kim.webp');
    expect(localizedImage('assets/model.step', 'ja')).toBe('assets/model.step');
  });
  it('keeps source evidence accessible from translated references', () => {
    expect(imageOriginal('assets/cases/wedraw-pro/step1.webp', 'ko')).toBeUndefined();
    expect(imageOriginal('assets/cases/wedraw-pro/step1.webp', 'en')).toBe('/assets/cases/wedraw-pro/step1.webp');
    expect(imageOriginal(figure, 'en')).toBeUndefined();
  });
});
