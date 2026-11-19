import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { I18nModule } from '../../i18n/i18n.module';
import { IconComponent } from '../icon/icon.component';
import { CadEffectsComponent } from './cad-effects.component';

describe('CadEffectsComponent', () => {
  let fixture: ComponentFixture<CadEffectsComponent>;

  beforeEach(async () => {
    localStorage.removeItem('cad-grid');
    localStorage.removeItem('cad-crosshair');
    await TestBed.configureTestingModule({
      imports: [I18nModule, RouterTestingModule],
      declarations: [CadEffectsComponent, IconComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CadEffectsComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    document.documentElement.classList.remove('cad-plain');
    localStorage.removeItem('cad-grid');
    localStorage.removeItem('cad-crosshair');
  });

  it('shows the drawing grid until it is turned off, and remembers the choice', () => {
    const page = document.documentElement;
    expect(page.classList.contains('cad-plain')).toBeFalse();
    fixture.componentInstance.toggleGrid();
    expect(page.classList.contains('cad-plain')).toBeTrue();
    expect(localStorage.getItem('cad-grid')).toBe('0');
    fixture.componentInstance.toggleGrid();
    expect(page.classList.contains('cad-plain')).toBeFalse();
    expect(localStorage.getItem('cad-grid')).toBe('1');
  });

  it('keeps the crosshair as a decorative layer on the page and removes it with the component', () => {
    const cross = document.body.querySelector(':scope > .cad-cross')!;
    expect(cross).not.toBeNull();
    expect(cross.getAttribute('aria-hidden')).toBe('true');
    expect(cross.classList.contains('on')).toBeFalse();
    fixture.destroy();
    expect(document.body.querySelector('.cad-cross')).toBeNull();
  });

  it('leaves the pictures of the page alone: no filter and no layer over them', () => {
    expect(document.querySelector('filter')).toBeNull();
    expect(Array.from(document.head.querySelectorAll('style')).some((style) => style.textContent?.includes('filter: url('))).toBeFalse();
    expect(document.body.querySelector('.cad-plot')).toBeNull();
  });

  it('labels the display toggles when the status strip is shown', () => {
    const component = fixture.componentInstance;
    component.pointer = true;
    fixture.detectChanges();
    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual(['그리드 표시', '십자선 표시']);
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    component.toggleCrosshair();
    fixture.detectChanges();
    expect(buttons[1].getAttribute('aria-pressed')).toBe(String(component.crosshair));
    expect(localStorage.getItem('cad-crosshair')).toBe(component.crosshair ? '1' : '0');
  });
});
