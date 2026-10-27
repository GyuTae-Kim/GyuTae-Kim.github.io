import { I18nModule } from '../../i18n/i18n.module';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { IconComponent } from '../../components/icon/icon.component';
import { OPENCAD_PROJECTS } from '../../opencad-data';
import { OpenCadProjectComponent } from './opencad-project.component';

describe('OpenCadProjectComponent', () => {
  async function render(id: string): Promise<HTMLElement> {
    const tool = OPENCAD_PROJECTS.find((project) => project.id === id)!;
    await TestBed.configureTestingModule({
      imports: [I18nModule, RouterTestingModule],
      declarations: [OpenCadProjectComponent, IconComponent],
      providers: [{ provide: ActivatedRoute, useValue: { data: of({ tool }) } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(OpenCadProjectComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the real screen of a published viewer beside its title and actions', async () => {
    const page = await render('step-viewer');
    const shot = page.querySelector('.project-hero .tool-shot img')!;
    expect(shot.getAttribute('src')).toBe('assets/opencad/viewer-step-1440.webp');
    expect(page.querySelector('a[href="https://gyutae-kim.github.io/opencad-step/"]')).not.toBeNull();
    expect(page.querySelectorAll('.step-strip li').length).toBe(4);
    expect(page.querySelectorAll('.feature-grid > div').length).toBe(6);
  });

  it('introduces the 2D CAD with its own guides and no 3D core picture', async () => {
    const page = await render('2d-viewer');
    expect(page.querySelector('.project-hero .tool-shot img')!.getAttribute('src')).toBe('assets/opencad/viewer-2d-1440.webp');
    expect(page.querySelector('a[href="https://gyutae-kim.github.io/opencad-dwgdxf/"]')).not.toBeNull();
    expect(page.querySelectorAll('.check-list li').length).toBe(5);
    expect(Array.from(page.querySelectorAll('[aria-labelledby="project-guides"] .guide-list a')).map((link) => link.getAttribute('href'))).toEqual([
      '/opencad/guides/open-dwg-dxf', '/opencad/guides/measure-export',
    ]);
    expect(page.querySelector('[aria-labelledby="project-guides"] .related-links a')!.getAttribute('href')).toBe('/opencad/guides/choose-cad-format');
  });

  it('pictures the core with the viewers drawn by it and links no unpublished app', async () => {
    const page = await render('viewer3d');
    expect(page.querySelector('.project-hero .tool-shot')).toBeNull();
    const shots = Array.from(page.querySelectorAll('.core-shot-grid img')).map((img) => img.getAttribute('src'));
    expect(shots).toEqual([
      'assets/opencad/viewer-step-720.webp', 'assets/opencad/viewer-skp-720.webp', 'assets/opencad/viewer-nc-720.webp',
    ]);
    expect(page.querySelector('a[href="https://gyutae-kim.github.io/opencad-viewer3d/"]')).toBeNull();
    expect(page.querySelector('.related-tools a[href="/opencad/projects/dwg-dxf"]')).not.toBeNull();
    expect(page.querySelectorAll('.related-tools a').length).toBe(4);
  });
});
