import { Component, ElementRef, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SeoService } from './seo.service';
import { siteUpdated } from './site-updated';
import { initAnalytics, showAnalyticsSettings, refreshAnalyticsSettings, trackPage } from './analytics';
import { GA4_MEASUREMENT_ID } from './analytics-config';
import { analyticsPage } from './analytics-pages';
import { I18nService } from './i18n/i18n.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  updated = siteUpdated();
  showAnalyticsSettings = showAnalyticsSettings;
  languageOpen = false;
  navigationOpen = false;
  constructor(router: Router, seo: SeoService, public i18n: I18nService, private element: ElementRef<HTMLElement>) {
    initAnalytics(GA4_MEASUREMENT_ID, 'portfolio', value => i18n.text(value));
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeMenus();
        i18n.setUrl(event.urlAfterRedirects);
        seo.update(event.urlAfterRedirects);
        refreshAnalyticsSettings();
        const page = analyticsPage(event.urlAfterRedirects);
        trackPage(page.path, page.title, page.group);
      }
    });
  }
  closeMenus(): void { this.languageOpen = false; this.navigationOpen = false; }
  chooseLanguage(): void { this.closeMenus(); this.element.nativeElement.querySelector<HTMLButtonElement>('.language-trigger')?.focus(); }
  toggleNavigation(): void { this.navigationOpen = !this.navigationOpen; this.languageOpen = false; }
  toggleLanguage(): void { if (this.languageOpen) this.languageOpen = false; else this.openLanguage(); }
  openLanguage(event?: Event, index?: number): void {
    event?.preventDefault(); event?.stopPropagation();
    this.languageOpen = true; this.navigationOpen = false;
    setTimeout(() => {
      if (!this.languageOpen) return;
      const items = Array.from(this.element.nativeElement.querySelectorAll<HTMLAnchorElement>('.language-menu a'));
      const selected = index === undefined ? items.findIndex(item => item.getAttribute('aria-checked') === 'true') : index < 0 ? items.length - 1 : index;
      items[Math.max(0, selected)]?.focus();
    });
  }
  languageKey(event: KeyboardEvent): void {
    const items = Array.from(this.element.nativeElement.querySelectorAll<HTMLAnchorElement>('.language-menu a'));
    const index = items.indexOf(this.element.nativeElement.ownerDocument.activeElement as HTMLAnchorElement);
    const next = event.key === 'ArrowDown' ? (index + 1) % items.length : event.key === 'ArrowUp' ? (index - 1 + items.length) % items.length : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : -1;
    if (next >= 0) { event.preventDefault(); items[next]?.focus(); }
    if (event.key === 'Tab') { this.languageOpen = false; this.element.nativeElement.querySelector<HTMLButtonElement>('.language-trigger')?.focus(); }
  }
  @HostListener('document:pointerdown', ['$event'])
  outside(event: Event): void {
    if (!this.element.nativeElement.querySelector('.language-control')?.contains(event.target as Node)) this.languageOpen = false;
    if (!this.element.nativeElement.querySelector('.navigation-control')?.contains(event.target as Node)) this.navigationOpen = false;
  }
  @HostListener('document:keydown.escape', ['$event'])
  escape(event: Event): void {
    if (!this.languageOpen && !this.navigationOpen) return;
    event.preventDefault();
    const trigger = this.languageOpen ? '.language-trigger' : '.navigation-trigger';
    this.closeMenus(); this.element.nativeElement.querySelector<HTMLButtonElement>(trigger)?.focus();
  }
  @HostListener('window:resize')
  resize(): void { this.closeMenus(); }

}
