import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SeoService } from './seo.service';
import { siteUpdated } from './site-updated';
import { initAnalytics, showAnalyticsSettings, trackPage } from './analytics';
import { GA4_MEASUREMENT_ID } from './analytics-config';
import { analyticsPage } from './analytics-pages';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  updated = siteUpdated();
  showAnalyticsSettings = showAnalyticsSettings;
  constructor(router: Router, seo: SeoService) {
    initAnalytics(GA4_MEASUREMENT_ID, 'portfolio');
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        seo.update(event.urlAfterRedirects);
        const page = analyticsPage(event.urlAfterRedirects);
        trackPage(page.path, page.title, page.group);
      }
    });
  }
}
