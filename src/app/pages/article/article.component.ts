import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SITE_ARTICLES, SiteArticle } from '../../articles-data';
import { AUDIENCE_COLLECTION } from '../../audience-data';

@Component({ selector: 'app-article', templateUrl: './article.component.html', styleUrls: ['./article.component.scss'] })
export class ArticleComponent implements OnDestroy {
  article?: SiteArticle;
  notes = SITE_ARTICLES.filter((item) => item.category === '제조 소프트웨어 개발 노트');
  audienceCollection = AUDIENCE_COLLECTION;
  isSolutions = false;
  private subscription: Subscription;
  constructor(route: ActivatedRoute) {
    this.subscription = route.data.subscribe((data) => {
      this.article = data['article'];
      this.isSolutions = data['collection'] === 'solutions';
      this.notes = SITE_ARTICLES.filter((item) => item.category === (this.isSolutions ? '가구·제조 업무 안내' : '제조 소프트웨어 개발 노트'));
    });
  }
  ngOnDestroy(): void { this.subscription.unsubscribe(); }
}
