import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { CASE_STUDIES } from './portfolio-data';
import { OTHER_PROJECTS } from './other-projects-data';
import { siteUpdated } from './site-updated';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  updated = siteUpdated();
  constructor(router: Router, title: Title) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const path = event.urlAfterRedirects.split(/[?#]/)[0];
        const known = path === '/' || /^\/(research|portfolio|contact)(\/|$)/.test(path);
        const section = !known
          ? '없는 페이지'
          : event.urlAfterRedirects.startsWith('/research')
          ? '연구'
          : event.urlAfterRedirects.startsWith('/portfolio')
            ? '프로젝트'
            : event.urlAfterRedirects.startsWith('/contact')
              ? '연락'
              : 'AI · 3D · CAD/CAM';
        const caseStudy = [...CASE_STUDIES, ...OTHER_PROJECTS].find(
          (item) =>
            event.urlAfterRedirects.split('#')[0] === `/portfolio/${item.id}`,
        );
        title.setTitle(
          section === 'AI · 3D · CAD/CAM' && !caseStudy
            ? '김규태 · Sean Kim — AI · 3D · CAD/CAM'
            : `${caseStudy?.title ?? section} — 김규태 · Sean Kim`,
        );
      }
    });
  }
}
