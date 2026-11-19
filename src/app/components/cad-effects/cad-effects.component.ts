import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { countAt, parseCount } from './count-up';

// Rules that are drawn like a dimension line, and figures that count up, once they
// scroll into view. Both are plain page content first: nothing here hides text.
const DRAWN = '.section-title';
const COUNTED = '.home-fact b, .row-stat b, .mini-stats b, .result-stats b, .topic-stat b';
const COUNT_MS = 900;
// Longer than the whole entrance in styles.scss (the last text is inked by 1.45s).
const ENTRANCE_MS = 1700;

function stored(key: string, fallback: boolean): boolean {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === '1';
  } catch {
    return fallback;
  }
}

function store(key: string, value: boolean) {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    // Private windows may refuse storage; the choice then lasts for this visit.
  }
}

// The page as a CAD drawing area: a crosshair that follows the mouse with its sheet
// coordinates, a drawing grid, and rules and figures that draw themselves on scroll.
// The component itself is the status strip in the header; the crosshair is added to
// <body> because the header's backdrop filter would otherwise confine a fixed layer.
@Component({
  selector: 'app-cad-effects',
  templateUrl: './cad-effects.component.html',
  styleUrls: ['./cad-effects.component.scss'],
})
export class CadEffectsComponent implements OnInit, AfterViewInit, OnDestroy {
  // The crosshair and the coordinate readout need a mouse and a header wide enough for
  // the strip; phones and narrow windows go without.
  @HostBinding('class.on') pointer = false;
  crosshair = false;
  grid = false;
  @ViewChild('readX') private readX?: ElementRef<HTMLElement>;
  @ViewChild('readY') private readY?: ElementRef<HTMLElement>;
  private readonly browser = typeof window !== 'undefined' && typeof IntersectionObserver !== 'undefined';
  private calm = true;
  private desk?: MediaQueryList;
  private x = 0;
  private y = 0;
  private frame = 0;
  private inside = false;
  private cross?: HTMLElement;
  private lineX?: HTMLElement;
  private lineY?: HTMLElement;
  private pick?: HTMLElement;
  private reveal?: IntersectionObserver;
  private passes = 0;
  // Routed pages seen so far; the first one may already be on screen from the server.
  private pages = 0;
  private path = '';
  private readonly waiting = new Set<Element>();
  private readonly seen = new WeakSet<Element>();
  private navigation?: Subscription;

  constructor(
    private readonly router: Router,
    private readonly zone: NgZone,
    private readonly changes: ChangeDetectorRef,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {}

  ngOnInit() {
    if (!this.browser) return;
    this.calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.desk = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1000px)');
    this.pointer = this.desk.matches;
    this.grid = stored('cad-grid', true);
    this.crosshair = stored('cad-crosshair', !this.calm);
    this.document.documentElement.classList.toggle('cad-plain', !this.grid);
    this.continueEntrance();
  }

  // The entrance in styles.scss starts with the first paint. On a server-rendered page
  // the app now rebuilds the elements that are playing it; telling the stylesheet how
  // long ago the first paint was lets the rebuilt ones carry on from the same moment
  // instead of starting over. This runs before the routed page is rebuilt.
  private continueEntrance() {
    const page = this.document.documentElement;
    if (!this.document.querySelector('app-root[ng-server-context]')) {
      // Rendered only in the browser: nothing has been shown yet, so play it from here.
      this.pass();
      return;
    }
    const measured = typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes?.includes('paint');
    const paints = measured ? performance.getEntriesByType('paint') : [];
    // No paint yet means the first one is still to come, so the entrance has not begun.
    // Where paints cannot be read, treat it as over rather than risk playing it twice.
    const elapsed = !measured ? ENTRANCE_MS : paints.length ? performance.now() - Math.min(...paints.map((p) => p.startTime)) : 0;
    page.style.setProperty('--cad-elapsed', `${(Math.max(elapsed, 0) / 1000).toFixed(3)}s`);
    // Once the rebuilt elements have finished, later pages play from the start again.
    setTimeout(() => page.style.removeProperty('--cad-elapsed'), ENTRANCE_MS);
  }

  ngAfterViewInit() {
    if (!this.browser) return;
    const piece = (name: string) => {
      const el = this.document.createElement('i');
      el.className = name;
      return el;
    };
    this.cross = this.document.createElement('div');
    this.cross.className = 'cad-cross';
    this.cross.setAttribute('aria-hidden', 'true');
    this.lineX = piece('cad-cross-x');
    this.lineY = piece('cad-cross-y');
    this.pick = piece('cad-pick');
    this.cross.append(this.lineX, this.lineY, this.pick);
    this.document.body.appendChild(this.cross);
    this.desk?.addEventListener('change', this.onDesk);
    this.zone.runOutsideAngular(() => {
      window.addEventListener('pointermove', this.onMove, { passive: true });
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('blur', this.onLeave);
      this.document.documentElement.addEventListener('mouseleave', this.onLeave);
      if (this.calm) return;
      this.reveal = new IntersectionObserver((entries) => this.onReveal(entries), { rootMargin: '0px 0px -8% 0px' });
      // Scan after the routed page has rendered and before it is painted. The first
      // navigation may have finished before this component existed.
      if (this.router.navigated) {
        this.pages = 1;
        this.path = this.router.url.split(/[?#]/)[0];
      }
      this.navigation = this.router.events.subscribe((event) => {
        if (!(event instanceof NavigationEnd)) return;
        // A jump to a section of the same page is not a new sheet.
        const path = event.urlAfterRedirects.split(/[?#]/)[0];
        if (path !== this.path) {
          this.path = path;
          this.pages++;
          if (this.pages > 1) this.pass();
        }
        requestAnimationFrame(() => this.scan());
      });
      requestAnimationFrame(() => this.scan());
    });
  }

  ngOnDestroy() {
    if (!this.browser) return;
    cancelAnimationFrame(this.frame);
    this.desk?.removeEventListener('change', this.onDesk);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('blur', this.onLeave);
    this.document.documentElement.removeEventListener('mouseleave', this.onLeave);
    this.navigation?.unsubscribe();
    this.reveal?.disconnect();
    this.cross?.remove();
    this.document.documentElement.classList.remove('cad-pass-a', 'cad-pass-b');
    this.document.documentElement.style.removeProperty('--cad-elapsed');
  }

  toggleGrid() {
    this.grid = !this.grid;
    store('cad-grid', this.grid);
    this.document.documentElement.classList.toggle('cad-plain', !this.grid);
  }

  toggleCrosshair() {
    this.crosshair = !this.crosshair;
    store('cad-crosshair', this.crosshair);
    this.queue();
  }

  // One more pass of the scan line down the window (styles.scss draws the first one when
  // the page loads). Alternating two identical animations restarts it.
  private pass() {
    if (this.calm) return;
    const page = this.document.documentElement.classList;
    this.passes++;
    page.toggle('cad-pass-a', this.passes % 2 === 1);
    page.toggle('cad-pass-b', this.passes % 2 === 0);
  }

  // ---------- crosshair and coordinates ----------

  private readonly onDesk = () => {
    this.pointer = !!this.desk?.matches;
    this.changes.markForCheck();
    this.queue();
  };

  private readonly onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    this.x = event.clientX;
    this.y = event.clientY;
    this.inside = true;
    this.queue();
  };

  private readonly onScroll = () => {
    if (this.inside) this.queue();
  };

  private readonly onLeave = () => {
    this.inside = false;
    this.queue();
  };

  private queue() {
    if (!this.frame) this.frame = requestAnimationFrame(() => this.place());
  }

  private place() {
    this.frame = 0;
    const live = this.inside && this.pointer;
    this.cross?.classList.toggle('on', live && this.crosshair);
    if (!live) return;
    const { x, y } = this;
    if (this.lineX) this.lineX.style.transform = `translate3d(${x}px, 0, 0)`;
    if (this.lineY) this.lineY.style.transform = `translate3d(0, ${y}px, 0)`;
    if (this.pick) this.pick.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    // Sheet coordinates: from the top-left corner of the page, not of the window.
    if (this.readX) this.readX.nativeElement.textContent = (x + window.scrollX).toFixed(1);
    if (this.readY) this.readY.nativeElement.textContent = (y + window.scrollY).toFixed(1);
  }

  // ---------- rules and figures drawn on scroll ----------

  private scan() {
    if (!this.reveal) return;
    const first = this.pages <= 1;
    for (const el of this.waiting) if (!el.isConnected) this.waiting.delete(el);
    this.reveal.disconnect();
    this.waiting.forEach((el) => this.reveal!.observe(el));
    const fold = window.innerHeight * 0.92;
    this.document.querySelectorAll<HTMLElement>(`${DRAWN}, ${COUNTED}`).forEach((el) => {
      if (this.seen.has(el)) return;
      this.seen.add(el);
      // What the server already painted on the first screen stays as it is, so nothing
      // blinks while the page starts; after that every new page draws itself in.
      if (first && el.getBoundingClientRect().top < fold) return;
      if (el.matches(DRAWN)) el.classList.add('cad-wait');
      this.waiting.add(el);
      this.reveal!.observe(el);
    });
  }

  private onReveal(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target as HTMLElement;
      this.reveal?.unobserve(el);
      this.waiting.delete(el);
      if (el.matches(DRAWN)) el.classList.replace('cad-wait', 'cad-in');
      else this.count(el);
    }
  }

  private count(el: HTMLElement) {
    // Change the text node Angular bound, never replace it, so later updates still land.
    const node = el.childNodes.length === 1 ? el.firstChild : null;
    if (!(node instanceof Text)) return;
    const text = node.data;
    const parts = parseCount(text);
    if (!parts) return;
    // Hold the final width so the label beside the figure does not shake while it counts.
    el.style.minWidth = `${el.getBoundingClientRect().width}px`;
    const start = performance.now();
    let written = countAt(parts, 0);
    node.data = written;
    const step = (now: number) => {
      const t = Math.min((now - start) / COUNT_MS, 1);
      // Stop if Angular wrote a new value meanwhile (a language switch) and keep that.
      const ours = el.isConnected && node.data === written;
      if (ours) {
        written = t < 1 ? countAt(parts, 1 - Math.pow(1 - t, 3)) : text;
        node.data = written;
      }
      if (ours && t < 1) requestAnimationFrame(step);
      else el.style.minWidth = '';
    };
    requestAnimationFrame(step);
  }
}
