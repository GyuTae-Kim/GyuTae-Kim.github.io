import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SeoService } from './seo.service';
import { siteUpdated } from './site-updated';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  updated = siteUpdated();
  constructor(router: Router, seo: SeoService) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) seo.update(event.urlAfterRedirects);
    });
  }
}
