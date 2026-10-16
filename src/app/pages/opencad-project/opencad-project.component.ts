import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { OPENCAD_PROJECTS, OpenCadProject } from '../../opencad-data';
import { SITE_ARTICLES, SiteArticle } from '../../articles-data';

@Component({
  selector: 'app-opencad-project',
  templateUrl: './opencad-project.component.html',
  styleUrls: ['./opencad-project.component.scss'],
})
export class OpenCadProjectComponent implements OnDestroy {
  project!: OpenCadProject;
  related: OpenCadProject[] = [];
  guides: SiteArticle[] = [];
  private readonly subscription: Subscription;
  constructor(route: ActivatedRoute) {
    this.subscription = route.data.subscribe((data) => {
      this.project = data['tool'];
      this.related = OPENCAD_PROJECTS.filter((item) => item.id !== this.project.id);
      this.guides = SITE_ARTICLES.filter((item) => item.viewer && item.viewer.url === this.project.url);
    });
  }
  ngOnDestroy(): void { this.subscription.unsubscribe(); }
}
