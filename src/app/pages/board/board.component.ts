import { Component } from '@angular/core';
import { RESEARCH_WORKS } from '../../research-data';
@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent {
  works = RESEARCH_WORKS;
  // Animated figures the reader has stopped; they show their still image instead.
  stopped = new Set<string>();

  toggleMotion(src: string): void {
    if (this.stopped.has(src)) {
      this.stopped.delete(src);
    } else {
      this.stopped.add(src);
    }
  }
}
