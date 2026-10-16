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
    const links = Array.from(page.querySelectorAll<HTMLAnchorElement>('.tool-card:first-of-type .tool-actions a'));
    expect(links.map((link) => link.href)).toEqual([
      'https://gyutae-kim.github.io/2dcad-viewer/',
      'https://github.com/GyuTae-Kim/2dcad-viewer',
    ]);
    expect(links.every((link) => link.target === '_blank' && link.rel.includes('noopener'))).toBeTrue();
  });

  it('keeps 2D capabilities separate and exposes the three published 3D apps with introductions', () => {
    expect(page.querySelector('.tool-card .tool-meta')?.textContent).toContain('2D 도면');
    expect(page.querySelector('.tool-card')?.textContent).not.toMatch(/STEP|SKP|NC|3D/);
    expect(page.querySelectorAll('.plan-card').length).toBe(0);
    for (const id of ['step', 'skp', 'nc']) {
      const card = page.querySelector(`#${id}-viewer`)!.closest('.tool-card')!;
      expect(card.querySelector(`a[href="https://gyutae-kim.github.io/opencad-${id}/"]`)).not.toBeNull();
      expect(card.querySelector(`a[href="/opencad/projects/${id}-viewer"]`)).not.toBeNull();
    }
    expect(page.querySelector('a[href="/opencad/projects/viewer3d"]')).not.toBeNull();
    expect(page.querySelector('a[href="https://gyutae-kim.github.io/opencad-viewer3d/"]')).toBeNull();
  });

  it('preserves every published screenshot and prioritizes only the first image', () => {
    const shots = Array.from(page.querySelectorAll('.tool-shot img'));
    expect(shots.length).toBe(4);
    expect(shots.map((img) => img.getAttribute('fetchpriority'))).toEqual(['high', null, null, null]);
    expect(shots.slice(1).every((img) => img.getAttribute('loading') === 'lazy')).toBeTrue();
    const skp = page.querySelector('#skp-viewer')!.closest('.tool-card')!;
    expect(skp.textContent).toContain('SketchUp 2021~2026');
  });

  it('links the task guides', () => {
    const guides = Array.from(page.querySelectorAll<HTMLAnchorElement>('[aria-labelledby="opencad-guides-title"] .guide-list a'));
    expect(guides.map((link) => link.getAttribute('href'))).toEqual([
      '/opencad/guides/open-dwg-dxf', '/opencad/guides/measure-export',
    ]);
  });
});
