import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import type { ViewportScene } from './viewport-scene';
import { ModelId, VIEW_MODELS } from './viewport-data';
import { siteUpdated } from '../../site-updated';

// Home viewport: a drawing sheet with a live three.js model. The 3D code is a lazy
// chunk; until it loads (or without WebGL) the sheet shows a rendered still.
@Component({
  selector: 'app-model-viewport',
  templateUrl: './model-viewport.component.html',
  styleUrls: ['./model-viewport.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModelViewportComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stage') private stage!: ElementRef<HTMLDivElement>;
  // On a project page the viewer shows that project's model only, without the model
  // tabs or the link back to the same project.
  @Input() fixedModel?: ModelId;

  models = VIEW_MODELS;
  readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  model: ModelId = 'part';
  // With motion each model plays its three layers on its own, e.g. modelling →
  // recognition → machining.
  layer = this.reducedMotion ? 1 : 0;
  autoplay = !this.reducedMotion;
  paused = false;
  // Legend row the animation is on.
  step = -1;
  state: 'loading' | 'live' | 'still' = 'loading';
  private scene?: ViewportScene;
  private destroyed = false;
  private nearby?: IntersectionObserver;
  readonly updated = siteUpdated();

  constructor(
    private readonly zone: NgZone,
    private readonly changes: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    if (this.fixedModel) this.model = this.fixedModel;
  }

  get info() {
    return this.models.find((m) => m.id === this.model)!;
  }

  get view() {
    return this.info.layers[this.layer];
  }

  get still() {
    return `assets/viewer/${this.model}-${this.layer}.webp`;
  }

  get stageLabel() {
    return `${this.info.label} 개념 모델, ${this.view.label} 단계: ${this.view.text}`;
  }

  ngAfterViewInit() {
    if (!this.webglAvailable()) {
      Promise.resolve().then(() => this.setState('still'));
      return;
    }
    // The three.js chunk loads once the viewer comes near the screen (on phones it sits
    // below the projects); the still image stands in until then.
    this.zone.runOutsideAngular(() => {
      this.nearby = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          this.nearby?.disconnect();
          this.loadScene();
        },
        { rootMargin: '600px 0px' },
      );
      this.nearby.observe(this.stage.nativeElement);
    });
  }

  private loadScene() {
    this.zone.runOutsideAngular(() => {
      import('./viewport-scene')
        .then(({ ViewportScene }) => {
          if (this.destroyed) return;
          this.scene = new ViewportScene(this.stage.nativeElement, {
            reducedMotion: this.reducedMotion,
            autoplay: this.autoplay,
            onLayer: (layer) => this.refresh(() => (this.layer = layer)),
            onStep: (step) => this.refresh(() => (this.step = step)),
          });
          if (this.model !== 'part') this.scene.setModel(this.model);
          this.scene.setLayer(this.layer);
          this.zone.run(() => this.setState('live'));
        })
        .catch(() => this.zone.run(() => this.setState('still')));
    });
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.nearby?.disconnect();
    this.scene?.dispose();
  }

  // Picking a model plays its layers from the start; picking a layer stops there.
  selectModel(id: ModelId) {
    this.model = id;
    if (!this.reducedMotion) {
      this.layer = 0;
      this.autoplay = true;
      this.scene?.startAutoplay();
    }
    this.scene?.setModel(id);
    this.scene?.setLayer(this.layer);
  }

  selectLayer(i: number) {
    this.stopAutoplay();
    this.layer = i;
    this.scene?.setLayer(i);
  }

  resetView() {
    this.scene?.resetView();
  }

  togglePause() {
    this.paused = !this.paused;
    this.scene?.setPaused(this.paused);
  }

  private stopAutoplay() {
    this.autoplay = false;
    this.scene?.stopAutoplay();
  }

  // Scene callbacks arrive from the render loop outside Angular.
  private refresh(change: () => void) {
    change();
    this.changes.detectChanges();
  }

  private setState(state: 'loading' | 'live' | 'still') {
    this.state = state;
    this.changes.markForCheck();
  }

  private webglAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
    } catch {
      return false;
    }
  }
}
