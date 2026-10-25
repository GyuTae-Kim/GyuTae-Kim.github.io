import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { OPENCAD_PROJECTS, OpenCadProject } from '../../opencad-data';
import { SITE_ARTICLES, SiteArticle } from '../../articles-data';
import { AUDIENCE_ARTICLES } from '../../audience-data';

@Component({
  selector: 'app-opencad-project',
  templateUrl: './opencad-project.component.html',
  styleUrls: ['./opencad-project.component.scss'],
})
export class OpenCadProjectComponent implements OnDestroy {
  project!: OpenCadProject;
  related: OpenCadProject[] = [];
  // Published viewers drawn with the shared core, shown on the core's own page.
  coreViewers: OpenCadProject[] = [];
  guides: SiteArticle[] = [];
  workflows: SiteArticle[] = [];
  private readonly subscription: Subscription;
  constructor(route: ActivatedRoute) {
    this.subscription = route.data.subscribe((data) => {
      this.project = data['tool'];
      this.related = OPENCAD_PROJECTS.filter((item) => item.id !== this.project.id);
      this.coreViewers = this.project.url ? [] : OPENCAD_PROJECTS.filter((item) => item.sharedCore && item.figure);
      this.guides = SITE_ARTICLES.filter((item) => item.viewer && item.viewer.url === this.project.url);
      const workflowPaths: Record<string, string[]> = {
        '2d-viewer': ['/solutions/furniture-manufacturing', '/solutions/cad-cam-automation'],
        'step-viewer': ['/solutions/cad-cam-automation'],
        'skp-viewer': ['/solutions/sketchup-furniture', '/solutions/furniture-manufacturing'],
        'nc-viewer': ['/solutions/furniture-manufacturing', '/solutions/cad-cam-automation'],
      };
      this.workflows = AUDIENCE_ARTICLES.filter(item => workflowPaths[this.project.id]?.includes(item.path));
    });
  }
  srcset(base: string): string {
    return `${base}-720.webp 720w, ${base}-1440.webp 1440w`;
  }
  ngOnDestroy(): void { this.subscription.unsubscribe(); }
}
