import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SeoService } from './seo.service';
import { siteUpdated } from './site-updated';
import { initAnalytics, trackPage } from './analytics';
import { GA4_MEASUREMENT_ID } from './analytics-config';
import { searchPage } from './site-seo';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  updated = siteUpdated();
  constructor(router: Router, seo: SeoService) {
    initAnalytics(GA4_MEASUREMENT_ID, 'portfolio');
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        seo.update(event.urlAfterRedirects);
        const page = searchPage(event.urlAfterRedirects);
        trackPage(page?.path ?? '/404', page?.title ?? '없는 페이지 — 김규태 · Sean Kim');
      }
    });
  }
}
