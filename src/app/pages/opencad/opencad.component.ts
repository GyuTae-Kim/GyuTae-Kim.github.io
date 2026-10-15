import { Component } from '@angular/core';
import { OPENCAD_TOOLS } from '../../opencad-data';
import { SITE_ARTICLES } from '../../articles-data';

@Component({
  selector: 'app-opencad',
  templateUrl: './opencad.component.html',
})
export class OpenCadComponent {
  // Published viewers get a large card with a screenshot; the rest wait in the planned list.
  liveTools = OPENCAD_TOOLS.filter((tool) => tool.url);
  plannedTools = OPENCAD_TOOLS.filter((tool) => !tool.url);
  guides = SITE_ARTICLES.filter((article) => article.category === 'OpenCAD 사용 안내');

  srcset(base: string): string {
    return `${base}-720.webp 720w, ${base}-1440.webp 1440w`;
  }
}
