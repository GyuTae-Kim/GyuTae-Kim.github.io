import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CASE_STUDIES, CaseStudy, FIGURE_KIND_LABELS } from '../../portfolio-data';
@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
})
export class PortfolioComponent implements OnDestroy {
  cases = CASE_STUDIES;
  selected: CaseStudy | undefined;
  filter = 'all';
  // Who did each story step: the owner, the team, or a partner institution.
  ownerLabels: Record<string, string> = { me: '직접', team: '팀과 함께', partner: '협력 기관' };
  kindLabels = FIGURE_KIND_LABELS;
  filters = [
    { id: 'all', label: '전체 프로젝트' },
    { id: 'cad-feature-recognition', label: '피처 인식 · CAM' },
    { id: 'panel-classification', label: '패널 인식 AI' },
    { id: 'wedraw-pro', label: 'Wedraw Pro' },
  ];
  // Cases that were merged into a larger story keep their old addresses working.
  private readonly movedCases: Record<string, string> = {
    'fusion-cam': 'cad-feature-recognition',
    'sketchup-manufacturing': 'wedraw-pro',
  };
  // Animated story images the reader has stopped; they show their still image instead.
  stopped = new Set<string>();
  private subscription: Subscription;
  constructor(route: ActivatedRoute, router: Router) {
    this.subscription = route.paramMap.subscribe((params) => {
      const id = params.get('id');
      const moved = id ? this.movedCases[id] : undefined;
      if (moved) {
        router.navigate(['/portfolio', moved], { replaceUrl: true });
        return;
      }
      this.selected = this.cases.find((c) => c.id === id);
    });
  }
  toggleMotion(src: string): void {
    if (this.stopped.has(src)) {
      this.stopped.delete(src);
    } else {
      this.stopped.add(src);
    }
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
