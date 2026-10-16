import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IconComponent } from '../../components/icon/icon.component';
import { OpenCadComponent } from './opencad.component';

describe('OpenCadComponent', () => {
  let fixture: ComponentFixture<OpenCadComponent>;
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [OpenCadComponent, IconComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(OpenCadComponent);
    fixture.detectChanges();
    page = fixture.nativeElement as HTMLElement;
  });

  it('opens the published 2D viewer and its source in a new tab', () => {
    const links = Array.from(page.querySelectorAll<HTMLAnchorElement>('.tool-card .tool-actions a'));
    expect(links.map((link) => link.href)).toEqual([
      'https://gyutae-kim.github.io/2dcad-viewer/',
      'https://github.com/GyuTae-Kim/2dcad-viewer',
    ]);
    expect(links.every((link) => link.target === '_blank' && link.rel.includes('noopener'))).toBeTrue();
  });

  it('keeps the published viewer to 2D and lists the 3D viewers as planned, without links', () => {
    expect(page.querySelector('.tool-card .tool-meta')?.textContent).toContain('2D 도면');
    expect(page.querySelector('.tool-card')?.textContent).not.toMatch(/STEP|SKP|NC|3D/);
    const plans = Array.from(page.querySelectorAll('.plan-card'));
    expect(plans.map((card) => card.querySelector('h3')?.textContent?.trim())).toEqual([
      'STEP 뷰어',
      'SKP 뷰어',
      'NC 뷰어',
    ]);
    expect(page.querySelectorAll('.plan-card a').length).toBe(0);
  });

  it('links the task guides', () => {
    const guides = Array.from(page.querySelectorAll<HTMLAnchorElement>('.guide-list a'));
    expect(guides.map((link) => link.getAttribute('href'))).toEqual([
      '/opencad/guides/open-dwg-dxf', '/opencad/guides/measure-export',
    ]);
  });
});
