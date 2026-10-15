import { ChangeDetectionStrategy, Component, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-partner-text',
  templateUrl: './partner-text.component.html',
  styleUrls: ['./partner-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartnerTextComponent {
  private static nextId = 0;
  readonly tooltipId = `kimm-partner-${++PartnerTextComponent.nextId}`;
  parts: { text: string; partner: boolean }[] = [];
  active: number | null = null;
  left = 0;
  top = 0;
  private anchor?: HTMLElement;

  @Input() set text(value: string | undefined) {
    this.hide();
    this.parts = (value ?? '').split(/(협력\s?기관)/g).filter(Boolean).map(text => ({
      text, partner: /^협력\s?기관$/.test(text),
    }));
  }

  show(index: number, event: Event): void {
    const anchor = event.currentTarget as HTMLElement;
    this.position(anchor);
    this.anchor = anchor;
    this.active = index;
  }

  private position(anchor: HTMLElement): void {
    const tooltip = anchor.querySelector<HTMLElement>('[role="tooltip"]')!;
    const bounds = anchor.getBoundingClientRect();
    const width = tooltip.offsetWidth;
    const height = tooltip.offsetHeight;
    this.left = Math.max(12, Math.min(bounds.left + bounds.width / 2 - width / 2, document.documentElement.clientWidth - width - 12));
    this.top = bounds.bottom + height <= window.innerHeight - 12 ? bounds.bottom : Math.max(12, bounds.top - height);
  }

  @HostListener('window:scroll')
  followAnchor(): void {
    if (!this.anchor) return;
    const bounds = this.anchor.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) this.hide();
    else this.position(this.anchor);
  }

  @HostListener('window:resize')
  @HostListener('document:keydown.escape')
  hide(): void {
    this.active = null;
    this.anchor = undefined;
  }

  @HostListener('document:pointerdown', ['$event'])
  closeOutside(event: PointerEvent): void {
    if (this.anchor && !this.anchor.contains(event.target as Node)) this.hide();
  }
}
