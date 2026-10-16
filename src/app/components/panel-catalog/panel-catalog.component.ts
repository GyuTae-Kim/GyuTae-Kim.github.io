import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, OnDestroy } from '@angular/core';
import { PanelType } from '../../panel-types-data';

@Component({
  selector: 'app-panel-catalog',
  templateUrl: './panel-catalog.component.html',
  styleUrls: ['./panel-catalog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelCatalogComponent implements OnDestroy {
  @Input() types: PanelType[] = [];
  active: string | null = null;
  left = 0;
  top = 0;
  private anchor?: HTMLElement;
  private hovering = false;
  private closeTimer?: ReturnType<typeof setTimeout>;

  constructor(private readonly changeDetector: ChangeDetectorRef) {}

  enter(type: PanelType, event: Event): void {
    this.hovering = true;
    this.show(type, event);
  }

  show(type: PanelType, event: Event): void {
    this.cancelClose();
    this.anchor = (event.currentTarget as HTMLElement).closest<HTMLElement>('.panel-type-item')!;
    this.active = type.id;
    this.position();
  }

  leave(): void {
    this.hovering = false;
    this.scheduleClose();
  }

  scheduleClose(): void {
    this.cancelClose();
    this.closeTimer = setTimeout(() => {
      if (!this.hovering && !this.anchor?.contains(document.activeElement)) this.hide();
    }, 140);
  }

  private position(): void {
    if (!this.anchor) return;
    const tip = this.anchor.querySelector<HTMLElement>('[role="tooltip"]')!;
    const bounds = this.anchor.getBoundingClientRect();
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    this.left = Math.max(12, Math.min(bounds.left + bounds.width / 2 - width / 2, document.documentElement.clientWidth - width - 12));
    const preferred = bounds.bottom + height <= window.innerHeight - 12 ? bounds.bottom : bounds.top - height;
    this.top = Math.max(12, Math.min(preferred, window.innerHeight - height - 12));
  }

  @HostListener('window:scroll')
  followAnchor(): void {
    if (!this.anchor) return;
    const bounds = this.anchor.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) this.hide();
    else this.position();
  }

  @HostListener('window:resize')
  @HostListener('document:keydown.escape')
  hide(): void {
    this.cancelClose();
    this.active = null;
    this.anchor = undefined;
    this.hovering = false;
    this.changeDetector.markForCheck();
  }

  @HostListener('document:pointerdown', ['$event'])
  closeOutside(event: PointerEvent): void {
    if (this.anchor && !this.anchor.contains(event.target as Node)) this.hide();
  }

  private cancelClose(): void {
    if (this.closeTimer !== undefined) clearTimeout(this.closeTimer);
    this.closeTimer = undefined;
  }

  ngOnDestroy(): void {
    this.cancelClose();
  }
}
