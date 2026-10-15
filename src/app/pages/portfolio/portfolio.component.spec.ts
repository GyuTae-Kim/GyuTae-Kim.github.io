import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { CASE_STUDIES } from '../../portfolio-data';
import { OTHER_PROJECTS } from '../../other-projects-data';
import { PortfolioComponent } from './portfolio.component';

describe('PortfolioComponent', () => {
  let fixture: ComponentFixture<PortfolioComponent>;
  const params = new BehaviorSubject(convertToParamMap({}));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [PortfolioComponent],
      providers: [{ provide: ActivatedRoute, useValue: { paramMap: params } }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function open(id?: string): HTMLElement {
    params.next(convertToParamMap(id ? { id } : {}));
    fixture = TestBed.createComponent(PortfolioComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('lists the three projects and the other projects as rows that open their pages', () => {
    const page = open();
    expect(page.querySelectorAll('.project-row').length).toBe(CASE_STUDIES.length + OTHER_PROJECTS.length);
    const others = page.querySelectorAll('.other-projects .project-row');
    expect(others.length).toBe(OTHER_PROJECTS.length);
    expect(others[0].querySelector('h2 a')!.getAttribute('href')).toBe('/portfolio/' + OTHER_PROJECTS[0].id);
    expect(page.querySelector('.watch-board')).toBeNull();
  });

  it('opens an other project on its own page', () => {
    const page = open(OTHER_PROJECTS[0].id);
    expect(page.querySelector('.missing-note')).toBeNull();
    expect(page.querySelector('h1')!.textContent).toContain(OTHER_PROJECTS[0].title);
    expect(page.querySelector('.case-next strong')!.textContent).toContain(OTHER_PROJECTS[1].title);
  });

  it('draws one cell per monitored component and both error collectors', () => {
    const board = open('service-monitoring').querySelector('.watch-board')!;
    expect(board.querySelectorAll('.watch-cells i').length).toBe(13);
    expect(board.querySelector('.watch-head b')!.textContent).toContain('13곳');
    expect(board.querySelectorAll('.watch-collect li').length).toBe(2);
  });

  it('writes the contribution once instead of labelling each step', () => {
    const page = open('wedraw-pro');
    expect(page.querySelectorAll('.case-story .story-meta span').length).toBe(0);
    expect(page.querySelectorAll('.role-list li').length).toBe(CASE_STUDIES[2].roleItems.length);
    expect(page.querySelector('.case-facts')!.textContent).toContain('리딩');
  });

  it('keeps the partner institution in the first project', () => {
    const page = open('cad-feature-recognition');
    expect(page.querySelector('.role-note')!.textContent).toContain('협력 기관');
  });

  it('shows the concept model only on projects that have one', () => {
    expect(open('cad-feature-recognition').querySelector('.case-concept app-model-viewport')).not.toBeNull();
    expect(open('wedraw-pro').querySelector('.case-concept app-model-viewport')).not.toBeNull();
    expect(open('panel-classification').querySelector('.case-concept')).toBeNull();
  });

  it('says so when the project id does not exist', () => {
    const page = open('no-such-project');
    expect(page.querySelector('.missing-note')).not.toBeNull();
    expect(page.querySelectorAll('.project-row').length).toBe(CASE_STUDIES.length + OTHER_PROJECTS.length);
  });
});
