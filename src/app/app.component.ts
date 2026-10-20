import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SeoService } from './seo.service';
import { siteUpdated } from './site-updated';
import { I18nService } from './i18n/i18n.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  updated = siteUpdated();
  constructor(router: Router, seo: SeoService, public i18n: I18nService) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        i18n.setUrl(event.urlAfterRedirects);
        seo.update(event.urlAfterRedirects);
      }
    });
  }
}
