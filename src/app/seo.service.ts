import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { searchPage, SHARE_IMAGE, SITE_NAME, SITE_URL, structuredData } from './site-seo';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(@Inject(DOCUMENT) private document: Document, private meta: Meta, private title: Title) {}

  update(url: string): void {
    const page = searchPage(url);
    this.meta.updateTag({ name: 'robots', content: page ? 'index, follow, max-image-preview:large' : 'noindex, follow' });
    if (!page) {
      this.title.setTitle('없는 페이지 — 김규태 · Sean Kim');
      this.document.querySelector('link[rel="canonical"]')?.remove();
      this.document.getElementById('site-structured-data')?.remove();
      this.document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]').forEach((tag) => tag.remove());
      return;
    }
    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: page.description });
    const image = `${SITE_URL}/${page.image}`;
    for (const [key, value] of Object.entries({
      type: page.article ? 'article' : 'website', site_name: SITE_NAME, locale: 'ko_KR',
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
    let data = this.document.getElementById('site-structured-data');
    if (!data) {
      data = this.document.createElement('script');
      data.id = 'site-structured-data';
      data.setAttribute('type', 'application/ld+json');
      this.document.head.appendChild(data);
    }
    data.textContent = JSON.stringify(structuredData(page)).replace(/</g, '\\u003c');
  }
}
