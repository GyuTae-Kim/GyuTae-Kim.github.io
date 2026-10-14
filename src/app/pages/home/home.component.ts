import { AfterViewInit, Component, NgZone, OnDestroy } from '@angular/core';
import { CASE_STUDIES, CaseStep, FIGURE_KIND_LABELS, stepOwnerLabel } from '../../portfolio-data';
import { RESEARCH_WORKS } from '../../research-data';

interface OwnerSpan {
  owner: CaseStep['owner'];
  label: string;
  steps: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  cases = CASE_STUDIES;
  kindLabels = FIGURE_KIND_LABELS;
  research = RESEARCH_WORKS.filter((work) => work.result);
  // Shown as its own product card under the concept viewport.
  furniture = CASE_STUDIES.find((c) => c.id === 'wedraw-pro')!;
  // Which story steps each owner did, e.g. "1–3단계 직접 · 4단계 협력 기관".
  ownership: Record<string, OwnerSpan[]> = Object.fromEntries(
    CASE_STUDIES.map((c) => [c.id, ownerSpans(c.story)]),
  );
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

function ownerSpans(story: CaseStep[]): OwnerSpan[] {
  const spans: { owner: CaseStep['owner']; label: string; from: number; to: number }[] = [];
  story.forEach((step, i) => {
    const label = stepOwnerLabel(step);
    const last = spans[spans.length - 1];
    if (last && last.label === label) last.to = i + 1;
    else spans.push({ owner: step.owner, label, from: i + 1, to: i + 1 });
  });
  return spans.map((s) => ({
    owner: s.owner,
    label: s.label,
    steps: s.from === s.to ? `${s.from}단계` : `${s.from}–${s.to}단계`,
  }));
}
