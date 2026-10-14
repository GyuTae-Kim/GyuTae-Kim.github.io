import { Component } from '@angular/core';

// Shown for addresses the site does not have, instead of silently going home.
@Component({
  selector: 'app-not-found',
  template: `
    <div class="page-shell interior-page">
      <div class="page-intro">
        <h1>없는 페이지입니다<span class="accent">.</span></h1>
        <p>주소가 바뀌었거나 잘못 입력된 것 같습니다. 아래에서 찾아 주세요.</p>
      </div>
      <nav class="archive-nav" aria-label="사이트 주요 페이지">
        <a routerLink="/">홈</a>
        <a routerLink="/portfolio">프로젝트</a>
        <a routerLink="/research">연구</a>
        <a routerLink="/contact">연락</a>
      </nav>
    </div>
  `,
})
export class NotFoundComponent {}
