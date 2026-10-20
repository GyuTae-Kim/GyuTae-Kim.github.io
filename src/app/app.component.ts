import { Component } from '@angular/core';
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
  constructor(router: Router, seo: SeoService, public i18n: I18nService) {
    initAnalytics(GA4_MEASUREMENT_ID, 'portfolio', value => i18n.text(value));
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        i18n.setUrl(event.urlAfterRedirects);
        seo.update(event.urlAfterRedirects);
        refreshAnalyticsSettings();
        const page = analyticsPage(event.urlAfterRedirects);
        trackPage(page.path, page.title, page.group);
      }
    });
  }
}
