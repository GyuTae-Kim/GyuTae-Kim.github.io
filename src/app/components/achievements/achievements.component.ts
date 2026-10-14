import { Component, Input } from '@angular/core';
import { ACHIEVEMENTS } from '../../achievement-data';

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss'],
})
export class AchievementsComponent {
  @Input() projectId?: string;
  @Input() anchorId = 'achievements';
  @Input() showProjectLinks = true;
  // One line per item for the home index.
  @Input() compact = false;
  get achievements() {
    return this.projectId
      ? ACHIEVEMENTS.filter((item) => item.relatedProjectId === this.projectId)
      : ACHIEVEMENTS;
  }
}
