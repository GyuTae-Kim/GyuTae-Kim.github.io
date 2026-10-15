import { Component } from '@angular/core';
import { CASE_STUDIES, thumbSrcset } from '../../portfolio-data';
import { RESEARCH_WORKS } from '../../research-data';
@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent {
  works = RESEARCH_WORKS;
  srcset = thumbSrcset;
  // Animated figures the reader has stopped; they show their still image instead.
  stopped = new Set<string>();

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
}
