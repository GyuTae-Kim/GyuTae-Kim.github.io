import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from './seo.service';
import { LOCALIZED_SEARCH_PAGES, SEARCH_PAGES, SHARE_IMAGE, SITE_URL, contentModified } from './site-seo';

describe('SeoService', () => {
  let document: Document;
  let seo: SeoService;
  beforeEach(() => {
    document = window.document.implementation.createHTMLDocument();
    seo = new SeoService(document, new Meta(document), new Title(document));
  });

  it('updates metadata and structured data when navigating between projects and sections', () => {
    for (const page of SEARCH_PAGES) {
      seo.update(page.path + '?source=test#main');
      expect(document.title).toBe(page.title);
      expect(document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content).toBe(page.description);
      expect(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(SITE_URL + page.path);
      expect(document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.content).toBe(SITE_URL + page.path);
      const image = `${SITE_URL}/${page.image}`;
      for (const [selector, expected] of [
        ['meta[property="og:image"]', image],
        ['meta[property="og:image:secure_url"]', image],
        ['meta[property="og:image:type"]', SHARE_IMAGE.type],
        ['meta[property="og:image:width"]', String(SHARE_IMAGE.width)],
        ['meta[property="og:image:height"]', String(SHARE_IMAGE.height)],
        ['meta[property="og:image:alt"]', page.imageAlt],
        ['meta[name="twitter:card"]', 'summary_large_image'],
        ['meta[name="twitter:image"]', image],
        ['meta[name="twitter:image:alt"]', page.imageAlt],
      ]) {
        expect(document.querySelector<HTMLMetaElement>(selector)?.content).toBe(expected);
        expect(document.querySelectorAll(selector).length).toBe(1);
      }
      expect(document.querySelectorAll('link[rel="canonical"]').length).toBe(1);
      expect(document.querySelectorAll('script[type="application/ld+json"]').length).toBe(1);
      const data = JSON.parse(document.getElementById('site-structured-data')!.textContent!);
      expect(data['@graph'].some((node: { url?: string }) => node.url === SITE_URL + page.path)).toBeTrue();
      expect(data['@graph'].find((node: { '@type'?: string; url?: string }) => node['@type'] === page.kind && node.url === SITE_URL + page.path).dateModified).toBe(contentModified(page.path));
      expect(document.querySelector<HTMLMetaElement>('meta[name="author"]')?.content).toBe('김규태 · Sean Kim');
    }
  });

  it('excludes unknown project ids and restores metadata when returning to a real page', () => {
    seo.update('/portfolio/wedraw-pro');
    seo.update('/portfolio/does-not-exist');
    expect(document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content).toBe('noindex, follow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.getElementById('site-structured-data')).toBeNull();
    expect(document.querySelector('meta[property="og:image"]')).toBeNull();
    expect(document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content).toContain('요청한 페이지를 찾을 수 없습니다');
    seo.update('/research');
    expect(document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content).toContain('index, follow');
    expect(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(SITE_URL + '/research');
  });

  it('keeps search and sharing descriptions translated across localized navigation', () => {
    for (const page of LOCALIZED_SEARCH_PAGES.filter(page => page.language !== 'ko')) {
      seo.update(page.path);
      expect(document.title).withContext(page.path).not.toMatch(/[가-힣]/);
      for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
        const description = document.querySelector<HTMLMetaElement>(selector)?.content;
        expect(description).withContext(`${page.path}: ${selector}`).toBeTruthy();
        expect(description!).withContext(`${page.path}: ${selector}`).not.toMatch(/[가-힣]/);
      }
    }
  });

  it('normalizes trailing slashes without treating deeper unknown paths as sections', () => {
    seo.update('/portfolio/');
    expect(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(SITE_URL + '/portfolio');
    seo.update('/research/unknown');
    expect(document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content).toBe('noindex, follow');
  });
  it('uses self canonicals and reciprocal language alternatives, then clears them on 404', () => {
    for (const language of ['en','ja','zh-CN','de']) {
      seo.update(`/${language}/opencad?utm_source=test#main`);
      expect(document.documentElement.lang).toBe(language);
      expect(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(`${SITE_URL}/${language}/opencad`);
      expect(document.querySelectorAll('link[rel="alternate"][hreflang]').length).toBe(6);
      expect(document.querySelector<HTMLLinkElement>('link[hreflang="ko"]')?.href).toBe(`${SITE_URL}/opencad`);
      const graph = JSON.parse(document.getElementById('site-structured-data')!.textContent!)['@graph'];
      expect(graph.find((node: Record<string,string>) => node['@type'] === 'CollectionPage').inLanguage).toBe(language);
    }
    seo.update('/de/does-not-exist');
    expect(document.querySelectorAll('link[rel="alternate"][hreflang]').length).toBe(0);
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });

});
