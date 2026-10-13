import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CASE_STUDIES, CaseStudy } from '../../portfolio-data';
@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
})
export class PortfolioComponent implements OnDestroy {
  cases = CASE_STUDIES;
  selected: CaseStudy | undefined;
  filter = 'all';
  filters = [
    { id: 'all', label: '전체 프로젝트' },
    { id: 'panel-classification', label: '판재 분류 AI' },
    { id: 'cad-feature-recognition', label: 'AI · 형상 인식' },
    { id: 'fusion-cam', label: 'CAD · CAM' },
    { id: 'sketchup-manufacturing', label: '제조 데이터' },
  ];
  private subscription: Subscription;
  constructor(route: ActivatedRoute) {
    this.subscription = route.paramMap.subscribe((params) => {
      this.selected = this.cases.find((c) => c.id === params.get('id'));
    });
  }
  get visibleCases() {
    return this.filter === 'all'
      ? this.cases
      : this.cases.filter((c) => c.id === this.filter);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
