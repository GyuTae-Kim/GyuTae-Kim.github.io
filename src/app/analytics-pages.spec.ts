import { ANALYTICS_PAGES, analyticsPage } from './analytics-pages';
import { SEARCH_PAGES } from './site-seo';

describe('GA public page identities', () => {
  it('gives every public route a unique concise category and name', () => {
    expect(ANALYTICS_PAGES.length).toBe(SEARCH_PAGES.length);
    expect(new Set(ANALYTICS_PAGES.map(page => page.title)).size).toBe(SEARCH_PAGES.length);
    for (const page of ANALYTICS_PAGES) {
      expect(page.title.split(' | ').length).toBe(2);
      expect(page.title.length).toBeLessThan(45);
      expect(page.title).not.toContain('김규태');
      expect(page.group.length).toBeGreaterThan(0);
    }
  });

  it('keeps real apps, project descriptions and guides distinguishable', () => {
    expect(analyticsPage('/opencad')).toEqual({ path: '/opencad', title: 'OpenCAD | 도구 모음', group: 'OpenCAD 소개' });
    expect(analyticsPage('/opencad/projects/skp-viewer').title).toBe('OpenCAD 소개 | SKP 뷰어');
    expect(analyticsPage('/opencad/guides/open-skp').title).toBe('OpenCAD 가이드 | SKP 열기');
    expect(analyticsPage('/notes/furniture-manufacturing-data')).toEqual({ path: '/notes/furniture-manufacturing-data', title: '개발 노트 | 가구 제조 데이터', group: '개발 노트' });
  });

  it('preserves language URLs while keeping stable public names and categories', () => {
    for (const lang of ['en', 'ja', 'zh-CN', 'de']) {
      expect(analyticsPage(`/${lang}/opencad?open=private.dwg#secret`)).toEqual({ ...analyticsPage('/opencad'), path: `/${lang}/opencad` });
      expect(analyticsPage(`/${lang}/notes/furniture-manufacturing-data?name=private#secret`)).toEqual({ ...analyticsPage('/notes/furniture-manufacturing-data'), path: `/${lang}/notes/furniture-manufacturing-data` });
      expect(analyticsPage(`/${lang}/index.html?open=private#secret`).path).toBe(`/${lang}/`);
      expect(analyticsPage(`/${lang}/opencad/index.html?file=private#secret`).path).toBe(`/${lang}/opencad`);
      expect(analyticsPage(`/${lang}/private-file.skp`).path).toBe('/404');
    }
  });

  it('normalizes published aliases and never labels unknown URLs with user input', () => {
    for (const url of ['/opencad/', '/opencad.html', '/opencad/index.html?open=private.skp#secret']) {
      expect(analyticsPage(url)).toEqual(analyticsPage('/opencad'));
    }
    expect(analyticsPage('/customer-private.skp?name=secret')).toEqual({ path: '/404', title: '포트폴리오 | 없는 페이지', group: '오류' });
  });
});
