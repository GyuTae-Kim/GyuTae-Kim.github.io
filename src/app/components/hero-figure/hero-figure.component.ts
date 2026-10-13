import { Component, Input } from '@angular/core';

// Isometric CAD part for the home hero. The template is generated from 3D geometry
// (plate with a pocket, a blind hole and a vertical fillet); stage switches layers:
// 0 = B-rep faces + face graph, 1 = recognized feature groups, 2 = setup and toolpaths.
@Component({
  selector: 'app-hero-figure',
  templateUrl: './hero-figure.component.html',
  styleUrls: ['./hero-figure.component.scss'],
})
export class HeroFigureComponent {
  @Input() stage = 1;
  @Input() label = '';

  private readonly notes = [
    'B-REP · FACE ADJACENCY GRAPH',
    'FACE LABELS → FEATURE GROUPS',
    'SETUP · TOOLPATH',
  ];

  get note() {
    return this.notes[this.stage] ?? '';
  }
}
