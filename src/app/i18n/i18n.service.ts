import { imageOriginal, localizedImage } from './image-assets';
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Pipe, PipeTransform } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LANGUAGES, Language, languageFromUrl, languagePath, localizedHref, translate } from './localization';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly languages = LANGUAGES;
  language: Language = 'ko';
  constructor(private router: Router, @Inject(DOCUMENT) private document: Document) {
    this.setUrl(router.getCurrentNavigation()?.extractedUrl.toString() ?? router.url);
    router.events.subscribe(event => { if (event instanceof NavigationEnd) this.setUrl(event.urlAfterRedirects); });
  }
  setUrl(url: string): void {
    this.language = languageFromUrl(url);
    this.document.documentElement.lang = this.language;
  }
  switchLanguage(language: Language): string { return languagePath(this.router.url.split(/[?#]/)[0], language); }
  languageHref(language: Language): string { return languagePath(this.router.url, language); }
  homeHref(language: Language): string { return languagePath('/', language); }
  text(value: string, parameters: unknown[] = []): string { return translate(value, this.language, parameters); }
  link<T>(value: T): T {
    if (Array.isArray(value)) return (value.length ? [this.link(value[0]), ...value.slice(1)] : value) as T;
    if (typeof value !== 'string') return value;
    if (value.startsWith('/assets/')) return value;
    if (value.startsWith('/') && !value.startsWith('//')) return languagePath(value, this.language) as T;
    if (value.startsWith('https://gyutae-kim.github.io')) return localizedHref(value, this.language) as T;
    return value;
  }
}

@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  constructor(private i18n: I18nService) {}
  transform<T>(value: T, parameters: unknown[] = []): T {
    return (typeof value === 'string' ? this.i18n.text(value, parameters) : value) as T;
  }
}
@Pipe({ name: 'localLink', pure: false })
export class LocalLinkPipe implements PipeTransform {
  constructor(private i18n: I18nService) {}
  transform<T>(value: T): T { return this.i18n.link(value); }
}

@Pipe({ name: 'localImage', pure: false })
export class LocalImagePipe implements PipeTransform {
  constructor(private i18n: I18nService) {}
  transform<T>(value: T): T {
    return (typeof value === 'string' ? localizedImage(value, this.i18n.language) : value) as T;
  }
}

@Pipe({ name: 'imageOriginal', pure: false })
export class ImageOriginalPipe implements PipeTransform {
  constructor(private i18n: I18nService) {}
  transform(value: string | undefined): string | undefined {
    return value ? imageOriginal(value, this.i18n.language) : undefined;
  }
}
