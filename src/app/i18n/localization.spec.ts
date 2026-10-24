import { Language, languageFromUrl, languagePath, localizedHref, originalPath, translate } from './localization';
import { catalogs } from './catalogs';

describe('localized navigation and text', () => {
  it('keeps the same page, attribution and section when changing languages', () => {
    expect(languagePath('/en/research/graph-tsp?utm_source=search#result', 'de')).toBe('/de/research/graph-tsp?utm_source=search#result');
    expect(languagePath('/ja/?sample#main', 'ko')).toBe('/?sample#main');
    expect(originalPath('/en?source=test')).toBe('/?source=test');
    expect(languageFromUrl('/not-a-language/opencad')).toBe('ko');
    expect(localizedHref('https://gyutae-kim.github.io/opencad-skp/?sample#view', 'ja')).toBe('https://gyutae-kim.github.io/opencad-skp/ja/?sample#view');
  });
  it('translates data parameters while allowing sentence order to differ', () => {
    expect(translate('프로젝트','en')).toBe('Projects');
    expect(translate('알 수 없는 문자열','ko')).toBe('알 수 없는 문자열');
    expect(translate('{0} 열기','en',['OpenCAD'])).toBe('Open OpenCAD');
  });
  it('does not cache missing sentence patterns before a locale has loaded', () => {
    const language = 'late-loaded-test' as Language;
    try {
      expect(translate('모델 3개', language)).toBe('모델 3개');
      catalogs[language] = { '모델 {0}개': 'Models: {0}' };
      expect(translate('모델 3개', language)).toBe('Models: 3');
    } finally { delete catalogs[language]; }
  });
});
