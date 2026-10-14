import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import type { FurnitureParams, ViewportScene } from './viewport-scene';
import { FURNITURE_LIMITS, ModelId, VIEW_MODELS, furnitureCounts } from './viewport-data';

// Home viewport: a drawing sheet with a live three.js model. The 3D code is a lazy
// chunk; until it loads (or without WebGL) the sheet shows a rendered still.
@Component({
  selector: 'app-model-viewport',
  templateUrl: './model-viewport.component.html',
  styleUrls: ['./model-viewport.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModelViewportComponent implements AfterViewInit, OnDestroy {
  @ViewChild('stage') private stage!: ElementRef<HTMLDivElement>;

  models = VIEW_MODELS;
  limits = FURNITURE_LIMITS;
  readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  model: ModelId = 'part';
  // With motion the part plays modelling → recognition → machining on its own.
  layer = this.reducedMotion ? 1 : 0;
  autoplay = !this.reducedMotion;
  paused = false;
  // Legend row the animation is on.
  step = -1;
  params: FurnitureParams = {
    width: FURNITURE_LIMITS.width.initial,
    kick: FURNITURE_LIMITS.kick.initial,
  };
  state: 'loading' | 'live' | 'still' = 'loading';
  private scene?: ViewportScene;
  private destroyed = false;

  constructor(
    private readonly zone: NgZone,
    private readonly changes: ChangeDetectorRef,
  ) {}

  get info() {
    return this.models.find((m) => m.id === this.model)!;
  }

  get view() {
    return this.info.layers[this.layer];
  }

  get counts() {
    return furnitureCounts(this.params.width);
  }

  get still() {
    return `assets/viewer/${this.model}-${this.layer}.webp`;
  }

  get text() {
    if (this.model === 'furniture' && this.layer === 0) {
      const c = this.counts;
      return `패널 ${c.panels}장을 떼어 보고, 서로 맞닿은 접합면 ${c.joints}곳을 찾습니다.`;
    }
    return this.view.text;
  }

  get legend() {
    if (this.model === 'furniture' && this.layer === 0) {
      const c = this.counts;
      return [
        { label: '패널', detail: `${c.panels}장`, swatch: '#2f5f9e' },
        { label: '접합면', detail: `${c.joints}곳`, swatch: '#8fa8cf' },
      ];
    }
    return this.view.legend;
  }

  get stageLabel() {
    return `${this.info.label} 개념 모델, ${this.view.label} 단계: ${this.text}`;
  }

  ngAfterViewInit() {
    if (!this.webglAvailable()) {
      Promise.resolve().then(() => this.setState('still'));
      return;
    }
    this.zone.runOutsideAngular(() => {
      import('./viewport-scene')
        .then(({ ViewportScene }) => {
          if (this.destroyed) return;
          this.scene = new ViewportScene(this.stage.nativeElement, {
            reducedMotion: this.reducedMotion,
            autoplay: this.autoplay,
            onParams: (p) => this.showAutoParams(p),
            onLayer: (layer) => this.refresh(() => (this.layer = layer)),
            onStep: (step) => this.refresh(() => (this.step = step)),
          });
          this.scene.setLayer(this.layer);
          this.zone.run(() => this.setState('live'));
        })
        .catch(() => this.zone.run(() => this.setState('still')));
    });
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.scene?.dispose();
  }

  selectModel(id: ModelId) {
    this.stopAutoplay();
    this.model = id;
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

  setWidth(value: string) {
    this.params = { ...this.params, width: Number(value) };
    this.scene?.setParams(this.params);
  }

  setKick(value: string) {
    this.params = { ...this.params, kick: Number(value) };
    this.scene?.setParams(this.params);
  }

  // The automatic width sweep runs outside Angular; refresh only this component's view.
  private showAutoParams(p: FurnitureParams) {
    this.refresh(() => (this.params = p));
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
