import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CASE_STUDIES } from '../../portfolio-data';
import { RESEARCH_WORKS } from '../../research-data';
import { IconComponent } from '../../components/icon/icon.component';
import { BoardComponent } from './board.component';

describe('BoardComponent', () => {
  let fixture: ComponentFixture<BoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [BoardComponent, IconComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(BoardComponent);
    fixture.detectChanges();
  });

  it('shows every research project', () => {
    const entries = (fixture.nativeElement as HTMLElement).querySelectorAll('article.research-entry');
    expect(entries.length).toBe(RESEARCH_WORKS.length);
  });

  it('links each project to a current project title', () => {
    const titles = CASE_STUDIES.map((c) => c.title);
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('.research-connection a');
    links.forEach((a) => expect(titles).toContain(a.textContent!.replace('→', '').trim()));
  });

  it('gives every result figure its size so anchors do not move', () => {
    const imgs = (fixture.nativeElement as HTMLElement).querySelectorAll('.result-figure img, .detail-figures img');
    imgs.forEach((img) => {
      expect(img.getAttribute('width')).toBeTruthy();
      expect(img.getAttribute('height')).toBeTruthy();
    });
  });
});
