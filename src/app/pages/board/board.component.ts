import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CASE_STUDIES, thumbSrcset } from '../../portfolio-data';
import { RESEARCH_WORKS, ResearchWork } from '../../research-data';
@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnDestroy {
  works = RESEARCH_WORKS;
  selected: ResearchWork | undefined;
  missing = false;
  srcset = thumbSrcset;
  // Animated figures the reader has stopped; they show their still image instead.
  stopped = new Set<string>();
  private subscription: Subscription;

  constructor(route: ActivatedRoute) {
    this.subscription = route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.selected = this.works.find((work) => work.id === id);
      this.missing = !!id && !this.selected;
      this.stopped.clear();
    });
  }

  get next(): ResearchWork {
    const index = this.works.indexOf(this.selected!);
    return this.works[(index + 1) % this.works.length];
  }

  projectTitle(id: string): string {
    return CASE_STUDIES.find((c) => c.id === id)?.title ?? '';
  }

  toggleMotion(src: string): void {
    if (this.stopped.has(src)) {
      this.stopped.delete(src);
    } else {
      this.stopped.add(src);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
