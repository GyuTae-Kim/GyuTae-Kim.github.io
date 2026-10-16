import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { OPENCAD_PROJECTS, OpenCadProject } from '../../opencad-data';

@Component({
  selector: 'app-opencad-project',
  templateUrl: './opencad-project.component.html',
  styleUrls: ['./opencad-project.component.scss'],
})
export class OpenCadProjectComponent implements OnDestroy {
  project!: OpenCadProject;
  related: OpenCadProject[] = [];
  private readonly subscription: Subscription;
  constructor(route: ActivatedRoute) {
    this.subscription = route.data.subscribe((data) => {
      this.project = data['tool'];
      this.related = OPENCAD_PROJECTS.filter((item) => item.id !== this.project.id);
    });
  }
  ngOnDestroy(): void { this.subscription.unsubscribe(); }
}
