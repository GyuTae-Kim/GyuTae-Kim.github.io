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

  it('describes the published 3D capabilities and links the task guides', () => {
    expect(page.querySelectorAll('.plan-card').length).toBe(0);
    expect(page.querySelector('.tool-features')?.textContent).toContain('SketchUp 2021');
    expect(page.querySelector('.tool-features')?.textContent).toContain('woodWOP MPR');
    const guides = Array.from(page.querySelectorAll<HTMLAnchorElement>('.guide-list a'));
    expect(guides.map((link) => link.getAttribute('href'))).toEqual([
      '/opencad/guides/open-dwg-dxf', '/opencad/guides/measure-export',
    ]);
  });
});
