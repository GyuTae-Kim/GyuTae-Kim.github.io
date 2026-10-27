import { I18nService } from './i18n/i18n.service';
import { I18nModule } from './i18n/i18n.module';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IconComponent } from './components/icon/icon.component';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [I18nModule, RouterTestingModule],
      declarations: [AppComponent, IconComponent],
    }).compileComponents();
  });

  it('renders the main menu', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const menu = (fixture.nativeElement as HTMLElement).querySelectorAll('nav[aria-label="주요 메뉴"] a');
    expect(Array.from(menu).map((a) => a.textContent?.trim())).toEqual(['프로젝트', '연구', '오픈캐드', '연락']);
  });
  it('exposes canonical developer homes from a foreign tool page without repeating the author name', () => {
    const fixture = TestBed.createComponent(AppComponent);
    TestBed.inject(I18nService).setUrl('/en/opencad');
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.brand-name')!.textContent!.trim()).toBe('Sean Kim');
    expect(Array.from(root.querySelectorAll<HTMLAnchorElement>('.profile-language-homes a')).map(link => link.getAttribute('href')))
      .toEqual(['/', '/en/', '/ja/', '/zh-CN/', '/de/']);
  });
  it('discloses languages from an icon and closes with Escape or an outside pointer', () => {
    const fixture = TestBed.createComponent(AppComponent); fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const trigger = root.querySelector<HTMLButtonElement>('.language-trigger')!;
    const menu = root.querySelector<HTMLElement>('.language-menu')!;
    expect(menu.hidden).toBeTrue();
    trigger.click(); fixture.detectChanges();
    expect(menu.hidden).toBeFalse(); expect(menu.querySelectorAll('[role=menuitemradio]').length).toBe(5);
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true})); fixture.detectChanges();
    expect(menu.hidden).toBeTrue(); expect(document.activeElement).toBe(trigger);
    trigger.click(); fixture.detectChanges();
    document.body.dispatchEvent(new Event('pointerdown', {bubbles: true})); fixture.detectChanges();
    expect(menu.hidden).toBeTrue();
  });

  it('updates the language control name and tooltip with the selected language', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const i18n = TestBed.inject(I18nService);
    const labels = {ko: '언어 선택', en: 'Choose language', ja: '言語を選択', 'zh-CN': '选择语言', de: 'Sprache wählen'} as const;
    for (const language of i18n.languages) {
      i18n.language = language.code; fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      expect(root.querySelector('.language-trigger')?.getAttribute('aria-label')).toBe(labels[language.code]);
      expect(root.querySelector('.language-trigger')?.getAttribute('title')).toBe(labels[language.code]);
      expect(root.querySelector('.language-menu')?.getAttribute('aria-label')).toBe(labels[language.code]);
    }
  });

});
