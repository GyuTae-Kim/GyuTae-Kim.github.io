import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CASE_STUDIES } from '../../portfolio-data';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HomeComponent],
      // The 3D viewer and achievements are covered elsewhere.
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
  });

  it('lists the main projects without ownership labels', () => {
    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('.case-row');
    expect(rows.length).toBe(CASE_STUDIES.length);
    rows.forEach((row) => expect(row.textContent).not.toMatch(/리딩|팀과 함께|협력 기관/));
  });

  it('uses small thumbnails for the rows', () => {
    const img = (fixture.nativeElement as HTMLElement).querySelector('.case-row img')!;
    expect(img.getAttribute('src')).toMatch(/-336\.webp$/);
    expect(img.getAttribute('srcset')).toContain('672w');
  });
});
