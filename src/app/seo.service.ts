import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { searchPage, SHARE_IMAGE, SITE_NAME, SITE_URL, structuredData } from './site-seo';
import { DEFAULT_LANGUAGE, LANGUAGES, languageFromUrl, languagePath, originalPath, translate } from './i18n/localization';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(@Inject(DOCUMENT) private document: Document, private meta: Meta, private title: Title) {}

  update(url: string): void {
    const language = languageFromUrl(url);
    this.document.documentElement.lang = language;
    const page = searchPage(url);
    this.document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(tag => tag.remove());
    this.meta.updateTag({ name: 'robots', content: page ? 'index, follow, max-image-preview:large' : 'noindex, follow' });
    if (!page) {
      this.title.setTitle(translate('없는 페이지 — 김규태 · Sean Kim', language));
      this.meta.updateTag({ name: 'description', content: translate('요청한 페이지를 찾을 수 없습니다. 김규태의 프로젝트·연구·OpenCAD 안내에서 다시 찾아 주세요.', language) });
      this.document.querySelector('link[rel="canonical"]')?.remove();
      this.document.getElementById('site-structured-data')?.remove();
      this.document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]').forEach((tag) => tag.remove());
      return;
    }
    this.title.setTitle(page.title);
    const siteName = translate(SITE_NAME, language);
    this.meta.updateTag({ name: 'author', content: siteName });
    this.meta.updateTag({ name: 'description', content: page.description });
    const image = `${SITE_URL}/${page.image}`;
    for (const [key, value] of Object.entries({
      type: page.article ? 'article' : 'website', site_name: siteName, locale: LANGUAGES.find(item => item.code === language)!.locale,
      title: page.title, description: page.description, url: SITE_URL + page.path,
      image, 'image:secure_url': image, 'image:type': SHARE_IMAGE.type,
      'image:width': String(SHARE_IMAGE.width), 'image:height': String(SHARE_IMAGE.height),
      'image:alt': page.imageAlt,
    })) this.meta.updateTag({ property: `og:${key}`, content: value });
    for (const [key, value] of Object.entries({
      card: 'summary_large_image', title: page.title, description: page.description, image, 'image:alt': page.imageAlt,
    })) this.meta.updateTag({ name: `twitter:${key}`, content: value });
    let canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = SITE_URL + page.path;
    for (const item of [...LANGUAGES, { code: DEFAULT_LANGUAGE, label: 'x-default', locale: '' }]) {
      const link = this.document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = item.label === 'x-default' ? 'x-default' : item.code;
      link.href = SITE_URL + languagePath(originalPath(page.path), item.code);
      this.document.head.appendChild(link);
    }
    let data = this.document.getElementById('site-structured-data');
    if (!data) {
      data = this.document.createElement('script');
      data.id = 'site-structured-data';
      data.setAttribute('type', 'application/ld+json');
      this.document.head.appendChild(data);
    }
    data.textContent = JSON.stringify(structuredData(page)).replace(/</g, '\\u003c');
    // One writer for SSR and browser navigation. Keep sharing tags ahead of
    // styles and large body data for clients that fetch only the first 8 KiB.
    const anchor = this.document.head.querySelector('base');
    const searchTags = [
      ...Array.from(this.document.head.querySelectorAll('meta[name="description"], meta[name="robots"], meta[name="author"], meta[property^="og:"], meta[name^="twitter:"]')),
      ...Array.from(this.document.head.querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]')),
      data,
    ];
    for (const tag of searchTags) {
      this.document.head.insertBefore(tag, anchor);
    }
  }
}
