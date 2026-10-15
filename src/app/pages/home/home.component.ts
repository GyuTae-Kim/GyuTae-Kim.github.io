import { AfterViewInit, Component, NgZone, OnDestroy } from '@angular/core';
import { CASE_STUDIES, FIGURE_KIND_LABELS, thumbSrcset } from '../../portfolio-data';
import { RESEARCH_WORKS } from '../../research-data';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  cases = CASE_STUDIES;
  kindLabels = FIGURE_KIND_LABELS;
  srcset = thumbSrcset;
  research = RESEARCH_WORKS.filter((work) => work.result);
  // Shown as its own product card under the concept viewport.
  furniture = CASE_STUDIES.find((c) => c.id === 'wedraw-pro')!;
  // Only tools that appear in the projects and research on this site.
  skills = [
    { area: 'AI', items: ['Python', 'TensorFlow', 'PyTorch', '그래프 신경망', '강화학습', '컴퓨터 비전'] },
    { area: '3D · CAD/CAM', items: ['OpenCascade', 'STEP', 'Autodesk Fusion API', 'CAM'] },
    { area: '제품 개발', items: ['SketchUp Ruby API', 'JavaScript', 'Flask'] },
  ];
  sections = [
    { id: 'work', label: '프로젝트' },
    { id: 'research', label: '연구' },
    { id: 'achievements', label: '성과' },
    { id: 'about', label: '소개' },
  ];
  active = '';
  private observer?: IntersectionObserver;

  constructor(private readonly zone: NgZone) {}

  ngAfterViewInit() {
    if (typeof IntersectionObserver === 'undefined') return;
    // Highlight the section that crosses the upper middle of the screen.
    this.observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit && hit.target.id !== this.active) this.zone.run(() => (this.active = hit.target.id));
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    for (const s of this.sections) {
      const el = document.getElementById(s.id);
      if (el) this.observer.observe(el);
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
