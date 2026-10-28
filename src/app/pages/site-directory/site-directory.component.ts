import { Component } from '@angular/core';
import { SEARCH_PAGES } from '../../site-seo';
import { OPENCAD_TOOLS } from '../../opencad-data';

@Component({
  selector: 'app-site-directory',
  templateUrl: './site-directory.component.html',
  styleUrls: ['./site-directory.component.scss'],
})
export class SiteDirectoryComponent {
  readonly groups = [
    { title: '포트폴리오와 연구', pages: SEARCH_PAGES.filter(page => page.path === '/' || /^\/(portfolio|research|contact)(\/|$)/.test(page.path)) },
    { title: 'OpenCAD와 파일 사용 안내', pages: SEARCH_PAGES.filter(page => page.path.startsWith('/opencad')) },
    { title: '개발 노트', pages: SEARCH_PAGES.filter(page => page.path.startsWith('/notes')) },
  ];
  readonly apps = OPENCAD_TOOLS.filter(tool => tool.url);
}
