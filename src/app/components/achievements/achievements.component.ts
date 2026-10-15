import { Component, Input } from '@angular/core';
import { ACHIEVEMENTS } from '../../achievement-data';
import { CASE_STUDIES } from '../../portfolio-data';
import { IconName } from '../icon/icon.component';

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
  kindIcons: Record<string, IconName> = { 특허: 'document', 프로그램: 'code' };
  projectTitle(id: string): string {
    return CASE_STUDIES.find((c) => c.id === id)?.title ?? '';
  }
  get achievements() {
    return this.projectId
      ? ACHIEVEMENTS.filter((item) => item.relatedProjectId === this.projectId)
      : ACHIEVEMENTS;
  }
}
