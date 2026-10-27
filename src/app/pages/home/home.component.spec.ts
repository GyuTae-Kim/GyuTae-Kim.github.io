import { I18nModule } from '../../i18n/i18n.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CASE_STUDIES } from '../../portfolio-data';
import { OTHER_PROJECTS } from '../../other-projects-data';
import { RESEARCH_WORKS } from '../../research-data';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [I18nModule, RouterTestingModule],
      declarations: [HomeComponent],
      // The 3D viewer and achievements are covered elsewhere.
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
  });

  it('links every project to its case and shows its result and contribution', () => {
    const root = fixture.nativeElement as HTMLElement;
    const rows = root.querySelectorAll('.case-row');
    expect(rows.length).toBe(CASE_STUDIES.length);
    [...CASE_STUDIES, ...OTHER_PROJECTS].forEach((project) => {
      const row = root.querySelector(`.case-row[href="/portfolio/${project.id}"], .operation-card[href="/portfolio/${project.id}"]`)!;
      expect(row).withContext(project.id).not.toBeNull();
      expect(row.querySelector('.row-result')!.textContent!.trim().length).toBeGreaterThan(15);
      expect(row.querySelector('.row-note')!.textContent!.trim().length).toBeGreaterThan(15);
    });
    expect(rows[0].querySelector('.row-note')!.textContent).toContain('디지털 트윈은 결과 시각화만');
  });

  it('lists the smaller projects in their own numbered section', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('#work .operation-card')).toBeNull();
    expect(root.querySelector('#other-projects .section-no')!.textContent).toBe('02');
    const cards = root.querySelectorAll('#other-projects .operation-card');
    expect(cards.length).toBe(OTHER_PROJECTS.length);
    expect(cards[0].querySelector('strong')!.textContent).toBe('서비스 감시와 오류 추적');
  });

  it('keeps research image context and individual case links', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('#research .section-lead')!.textContent).toContain('공개 코드를 실행해');
    RESEARCH_WORKS.filter((work) => work.result).forEach((work) => {
      const row = root.querySelector(`.research-row[href="/research/${work.id}"]`)!;
      expect(row).withContext(work.id).not.toBeNull();
      expect(row.textContent).toContain(work.previewLabel);
      expect(row.querySelector('.row-note')!.textContent!.trim().length).toBeGreaterThan(15);
    });
  });

  it('uses small thumbnails for the rows', () => {
    const img = (fixture.nativeElement as HTMLElement).querySelector('.case-row img')!;
    expect(img.getAttribute('src')).toMatch(/-336\.webp$/);
    expect(img.getAttribute('srcset')).toContain('672w');
  });
});
