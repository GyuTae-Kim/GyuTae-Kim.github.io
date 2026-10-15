import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IconComponent } from './components/icon/icon.component';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent, IconComponent],
    }).compileComponents();
  });

  it('renders the main menu', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const menu = (fixture.nativeElement as HTMLElement).querySelectorAll('nav[aria-label="주요 메뉴"] a');
    expect(Array.from(menu).map((a) => a.textContent?.trim())).toEqual(['프로젝트', '연구', '오픈캐드', '연락']);
  });
});
