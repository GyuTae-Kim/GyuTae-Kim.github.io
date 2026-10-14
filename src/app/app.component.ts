import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { CASE_STUDIES } from './portfolio-data';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(router: Router, title: Title) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const section = event.urlAfterRedirects.startsWith('/research')
          ? '연구'
          : event.urlAfterRedirects.startsWith('/portfolio')
            ? '프로젝트'
            : event.urlAfterRedirects.startsWith('/contact')
              ? '연락'
              : 'AI · 3D · CAD/CAM';
        const caseStudy = CASE_STUDIES.find(
          (item) =>
            event.urlAfterRedirects.split('#')[0] === `/portfolio/${item.id}`,
        );
        title.setTitle(`${caseStudy?.title ?? section} — 김규태 · Sean Kim`);
      }
    });
  }
}
