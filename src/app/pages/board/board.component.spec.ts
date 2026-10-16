import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { CASE_STUDIES } from '../../portfolio-data';
import { RESEARCH_WORKS } from '../../research-data';
import { IconComponent } from '../../components/icon/icon.component';
import { BoardComponent } from './board.component';

describe('BoardComponent', () => {
  let fixture: ComponentFixture<BoardComponent>;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  beforeEach(async () => {
    params = new BehaviorSubject(convertToParamMap({}));
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [BoardComponent, IconComponent],
      providers: [{ provide: ActivatedRoute, useValue: { paramMap: params } }],
    }).compileComponents();
    fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
  });

  function open(id?: string): HTMLElement {
    params.next(convertToParamMap(id ? { id } : {}));
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('lists research cards linking to their own pages', () => {
    const page = open();
    const cards = page.querySelectorAll('.project-row');
    expect(cards.length).toBe(RESEARCH_WORKS.length);
    cards.forEach((card, i) => {
      expect(card.id).toBe(RESEARCH_WORKS[i].id);
      expect(card.querySelector('h2 a')!.getAttribute('href')).toBe('/research/' + RESEARCH_WORKS[i].id);
      expect(card.querySelector('img')!.getAttribute('srcset')).toContain('672w');
    });
    expect(page.querySelector('.research-entry')).toBeNull();
  });

  it('links each project to a current project title', () => {
    const titles = CASE_STUDIES.map((c) => c.title);
    for (const work of RESEARCH_WORKS) {
      const page = open(work.id);
      const link = page.querySelector('.research-connection a')!;
      expect(titles).toContain(link.textContent!.replace('→', '').trim());
      expect(link.getAttribute('href')).toBe('/portfolio/' + work.relatedProjectId);
    }
  });

  it('gives every result figure its size so anchors do not move', () => {
    for (const work of RESEARCH_WORKS) {
      const imgs = open(work.id).querySelectorAll('.result-figure img, .detail-figures img');
      expect(imgs.length).toBeGreaterThan(0);
      imgs.forEach((img) => {
        expect(img.getAttribute('width')).toBeTruthy();
        expect(img.getAttribute('height')).toBeTruthy();
      });
    }
  });

  it('updates the detail when moving between research pages and back to the list', () => {
    RESEARCH_WORKS.forEach((work, i) => {
      const page = open(work.id);
      expect(page.querySelectorAll('h1').length).toBe(1);
      expect(page.querySelector('h1')!.textContent).toBe(work.title);
      expect(page.querySelectorAll('.research-entry').length).toBe(1);
      expect(page.querySelector('.source-link')!.getAttribute('href')).toBe(work.source);
      expect(page.querySelector('.case-next a')!.getAttribute('href')).toBe('/research/' + RESEARCH_WORKS[(i + 1) % RESEARCH_WORKS.length].id);
      expect(page.querySelector('.back-link')!.getAttribute('href')).toBe('/research');
    });
    expect(open().querySelectorAll('.project-row').length).toBe(RESEARCH_WORKS.length);
  });

  it('shows the research list for an unknown id', () => {
    const page = open('unknown');
    expect(page.querySelector('[role="status"]')!.textContent).toContain('찾는 연구가 없습니다');
    expect(page.querySelectorAll('.project-row').length).toBe(RESEARCH_WORKS.length);
  });

  it('keeps the motion control working on the detail page', () => {
    const work = RESEARCH_WORKS.find((item) => item.result?.figures.some((figure) => figure.still))!;
    const page = open(work.id);
    const figure = work.result!.figures.find((item) => item.still)!;
    const toggle = page.querySelector<HTMLButtonElement>('.motion-toggle')!;
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(page.querySelector('.result-figure img')!.getAttribute('src')).toBe(figure.still!);
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(page.querySelector('.result-figure img')!.getAttribute('src')).toBe(figure.src);
  });
});
