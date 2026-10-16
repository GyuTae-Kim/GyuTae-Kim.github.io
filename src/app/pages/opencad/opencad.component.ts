import { Component } from '@angular/core';
import { OPENCAD_TOOLS, OPENCAD_PROJECTS } from '../../opencad-data';
import { SITE_ARTICLES } from '../../articles-data';

@Component({
  selector: 'app-opencad',
  templateUrl: './opencad.component.html',
})
export class OpenCadComponent {
  // Application links only appear after the app is publicly available.
  liveTools = OPENCAD_TOOLS.filter((tool) => tool.url);
  plannedTools = OPENCAD_TOOLS.filter((tool) => !tool.url);
  libraries = OPENCAD_PROJECTS.filter((project) => !project.url);
  guides = SITE_ARTICLES.filter((article) => article.category === 'OpenCAD 사용 안내');

  srcset(base: string): string {
    return `${base}-720.webp 720w, ${base}-1440.webp 1440w`;
  }
}
