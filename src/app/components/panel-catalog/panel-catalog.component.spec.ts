import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PANEL_TYPES } from '../../panel-types-data';
import { PanelCatalogComponent } from './panel-catalog.component';

describe('PanelCatalogComponent', () => {
  let fixture: ComponentFixture<PanelCatalogComponent>;
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ declarations: [PanelCatalogComponent] }).compileComponents();
    fixture = TestBed.createComponent(PanelCatalogComponent);
    fixture.componentRef.setInput('types', PANEL_TYPES);
    fixture.detectChanges();
    page = fixture.nativeElement;
  });

  it('opens the focused panel and lets Escape dismiss it without moving focus', () => {
    const button = page.querySelector('button')!;
    button.focus();
    fixture.detectChanges();
    const tip = page.querySelector('[role="tooltip"]')!;
    expect(tip.getAttribute('aria-hidden')).toBe('false');
    expect(button.getAttribute('aria-describedby')).toBe(tip.id);
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(tip.getAttribute('aria-hidden')).toBe('true');
    expect(document.activeElement).toBe(button);
  });

  it('shows one panel at a time on tap and dismisses when pressing outside', () => {
    const buttons = page.querySelectorAll<HTMLButtonElement>('button');
    buttons[0].click();
    fixture.detectChanges();
    buttons[1].click();
    fixture.detectChanges();
    expect(page.querySelectorAll('.panel-tooltip.open').length).toBe(1);
    expect(page.querySelector('.panel-tooltip.open strong')!.textContent).toBe(PANEL_TYPES[1].name);
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    fixture.detectChanges();
    expect(page.querySelector('.panel-tooltip.open')).toBeNull();
  });

  it('allows crossing into the tooltip before the hover delay expires', fakeAsync(() => {
    const item = page.querySelector('.panel-type-item')!;
    item.dispatchEvent(new MouseEvent('mouseenter'));
    item.dispatchEvent(new MouseEvent('mouseleave'));
    tick(80);
    item.dispatchEvent(new MouseEvent('mouseenter'));
    tick(100);
    fixture.detectChanges();
    expect(page.querySelector('.panel-tooltip.open')).not.toBeNull();
    item.dispatchEvent(new MouseEvent('mouseleave'));
    tick(150);
    fixture.detectChanges();
    expect(page.querySelector('.panel-tooltip.open')).toBeNull();
  }));

  it('keeps the card open while its trigger has keyboard focus', fakeAsync(() => {
    const item = page.querySelector('.panel-type-item')!;
    const button = item.querySelector('button')!;
    button.focus();
    item.dispatchEvent(new MouseEvent('mouseleave'));
    tick(150);
    fixture.detectChanges();
    expect(page.querySelector('.panel-tooltip.open')).not.toBeNull();
    button.blur();
    tick(150);
    fixture.detectChanges();
    expect(page.querySelector('.panel-tooltip.open')).toBeNull();
  }));
});
