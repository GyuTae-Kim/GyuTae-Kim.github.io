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

  it('opens every published viewer and its source in a new tab', () => {
    const links = Array.from(page.querySelectorAll<HTMLAnchorElement>('.tool-card .tool-actions a'));
    expect(links.map((link) => link.href)).toEqual([
      'https://gyutae-kim.github.io/2dcad-viewer/',
      'https://github.com/GyuTae-Kim/2dcad-viewer',
      'https://gyutae-kim.github.io/opencad-step/',
      'https://github.com/GyuTae-Kim/opencad-step',
      'https://gyutae-kim.github.io/opencad-skp/',
      'https://github.com/GyuTae-Kim/opencad-skp',
      'https://gyutae-kim.github.io/opencad-nc/',
      'https://github.com/GyuTae-Kim/opencad-nc',
    ]);
    expect(links.every((link) => link.target === '_blank' && link.rel.includes('noopener'))).toBeTrue();
  });

  it('shows the 2D and 3D viewers as published cards, with no planned list left', () => {
    const cards = Array.from(page.querySelectorAll('.tool-card'));
    expect(cards.map((card) => card.querySelector('h3')?.textContent?.trim())).toEqual([
      'OpenCAD 무료 캐드 뷰어',
      'STEP 뷰어',
      'SKP 뷰어',
      'NC 뷰어',
    ]);
    expect(cards.every((card) => card.querySelector('.tool-shot img') && card.querySelector('.tool-status.live'))).toBeTrue();
    expect(page.querySelectorAll('.plan-card').length).toBe(0);
    // Only the first screenshot competes for the initial load.
    const shots = Array.from(page.querySelectorAll('.tool-shot img'));
    expect(shots.map((img) => img.getAttribute('fetchpriority'))).toEqual(['high', null, null, null]);
  });

  it('says which SketchUp files the SKP viewer cannot open yet', () => {
    const skp = Array.from(page.querySelectorAll('.tool-card')).find((card) => card.querySelector('h3')?.textContent?.includes('SKP'));
    expect(skp?.textContent).toContain('2020 이하 버전 파일은 아직 열지 못합니다');
  });

  it('links the task guides', () => {
    const guides = Array.from(page.querySelectorAll<HTMLAnchorElement>('.guide-list a'));
    expect(guides.map((link) => link.getAttribute('href'))).toEqual([
      '/opencad/guides/open-dwg-dxf', '/opencad/guides/measure-export',
    ]);
  });
});
