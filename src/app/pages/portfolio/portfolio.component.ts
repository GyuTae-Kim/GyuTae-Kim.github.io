import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CASE_STUDIES, CaseStudy, FIGURE_KIND_LABELS, stepOwnerLabel } from '../../portfolio-data';
import { OTHER_PROJECTS } from '../../other-projects-data';
@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
})
export class PortfolioComponent implements OnDestroy {
  cases = CASE_STUDIES;
  otherProjects = OTHER_PROJECTS;
  selected: CaseStudy | undefined;
  ownerLabel = stepOwnerLabel;
  kindLabels = FIGURE_KIND_LABELS;
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
  get next(): CaseStudy {
    const i = this.cases.indexOf(this.selected!);
    return this.cases[(i + 1) % this.cases.length];
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
