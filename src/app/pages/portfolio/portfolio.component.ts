import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CASE_STUDIES, CaseStudy, FIGURE_KIND_LABELS, thumbSrcset } from '../../portfolio-data';
import { OTHER_PROJECTS, groupCount, watchCount } from '../../other-projects-data';
@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
})
export class PortfolioComponent implements OnDestroy {
  cases = CASE_STUDIES;
  otherProjects = OTHER_PROJECTS;
  watchCount = watchCount;
  groupCount = groupCount;
  selected: CaseStudy | undefined;
  // An id in the address that matches no project.
  missing = false;
  kindLabels = FIGURE_KIND_LABELS;
  srcset = thumbSrcset;
  conceptNotes = {
    part: '실제 엔진이 이 부품에 짜는 공정 순서와 공구로 그린 개념 모델입니다. 모델링, 특징 인식, 바이스 가공을 차례로 보여 줍니다.',
    furniture: '가구빌더 기본값과 엔진의 네스팅 결과로 그린 원룸 벽면 가구입니다. 설계, 제조, 조립과 설치를 차례로 보여 줍니다.',
  };
  // Cases that were merged into a larger story keep their old addresses working.
  private readonly movedCases: Record<string, string> = {
    'fusion-cam': 'cad-feature-recognition',
    'sketchup-manufacturing': 'wedraw-pro',
  };
  // Animated story images the reader has stopped; they show their still image instead.
  stopped = new Set<string>();
  // Image shown large in the zoom dialog.
  zoom: { src: string; alt: string } | undefined;
  @ViewChild('zoomDialog') private zoomDialog?: ElementRef<HTMLDialogElement>;
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
      this.missing = !!id && !this.selected;
    });
  }
  toggleMotion(src: string): void {
    if (this.stopped.has(src)) {
      this.stopped.delete(src);
    } else {
      this.stopped.add(src);
    }
  }
  openZoom(src: string, alt: string, still?: string): void {
    const calm = !!still && (this.stopped.has(src) || matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.zoom = { src: calm ? still! : src, alt };
    this.zoomDialog?.nativeElement.showModal();
  }
  closeZoom(): void {
    this.zoomDialog?.nativeElement.close();
  }
  // A click on the backdrop lands on the dialog element itself.
  onZoomClick(event: MouseEvent): void {
    if (event.target === this.zoomDialog?.nativeElement) this.closeZoom();
  }
  get next(): CaseStudy {
    const i = this.cases.indexOf(this.selected!);
    return this.cases[(i + 1) % this.cases.length];
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
