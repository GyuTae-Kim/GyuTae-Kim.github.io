import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from './seo.service';
import { SEARCH_PAGES, SHARE_IMAGE, SITE_URL } from './site-seo';

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
    }
  });

  it('excludes unknown project ids and restores metadata when returning to a real page', () => {
    seo.update('/portfolio/wedraw-pro');
    seo.update('/portfolio/does-not-exist');
    expect(document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content).toBe('noindex, follow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.getElementById('site-structured-data')).toBeNull();
    expect(document.querySelector('meta[property="og:image"]')).toBeNull();
    seo.update('/research');
    expect(document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content).toContain('index, follow');
    expect(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(SITE_URL + '/research');
  });

  it('normalizes trailing slashes without treating deeper unknown paths as sections', () => {
    seo.update('/portfolio/');
    expect(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(SITE_URL + '/portfolio');
    seo.update('/research/unknown');
    expect(document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content).toBe('noindex, follow');
  });
});
