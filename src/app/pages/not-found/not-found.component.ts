import { Component } from '@angular/core';

// Shown for addresses the site does not have, instead of silently going home.
@Component({
  selector: 'app-not-found',
  template: `
    <div class="page-shell interior-page">
      <div class="page-intro">
        <h1>{{ '없는 페이지입니다' | t }}<span class="accent">.</span></h1>
        <p>{{ '주소가 바뀌었거나 잘못 입력된 것 같습니다. 아래에서 찾아 주세요.' | t }}</p>
      </div>
      <nav class="archive-nav" [attr.aria-label]="'사이트 주요 페이지' | t">
        <a [routerLink]="'/' | localLink">{{ '홈' | t }}</a>
        <a [routerLink]="'/portfolio' | localLink">{{ '프로젝트' | t }}</a>
        <a [routerLink]="'/research' | localLink">{{ '연구' | t }}</a>
        <a [routerLink]="'/contact' | localLink">{{ '연락' | t }}</a>
      </nav>
    </div>
  `,
})
export class NotFoundComponent {}
