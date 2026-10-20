import { RouterTestingModule } from '@angular/router/testing';
import { I18nModule } from '../../i18n/i18n.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartnerTextComponent } from './partner-text.component';

describe('PartnerTextComponent', () => {
  let fixture: ComponentFixture<PartnerTextComponent>;
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [I18nModule, RouterTestingModule], declarations: [PartnerTextComponent] }).compileComponents();
    fixture = TestBed.createComponent(PartnerTextComponent);
    fixture.componentRef.setInput('text', '시뮬레이션은 협력 기관이, 시각화는 본인이 담당했습니다.');
    fixture.detectChanges();
    page = fixture.nativeElement;
  });

  it('keeps the original wording and names the institution in an initially hidden tooltip', () => {
    expect(page.querySelector('button')!.textContent).toBe('협력 기관');
    const tip = page.querySelector('[role="tooltip"]')!;
    expect(tip.textContent).toContain('한국기계연구원');
    expect(tip.getAttribute('aria-hidden')).toBe('true');
    expect(page.querySelector('button')!.getAttribute('aria-describedby')).toBe(tip.id);
    expect(page.querySelector('img')!.getAttribute('alt')).toContain('한국기계연구원');
  });

  it('opens on hover and remains open while the pointer is inside the mention', () => {
    const mention = page.querySelector('.partner-mention')!;
    mention.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(page.querySelector('[role="tooltip"]')!.getAttribute('aria-hidden')).toBe('false');
    mention.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(page.querySelector('[role="tooltip"]')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('opens for keyboard focus and closes on Escape without moving focus', () => {
    const button = page.querySelector('button')!;
    button.focus();
    fixture.detectChanges();
    expect(page.querySelector('[role="tooltip"]')!.getAttribute('aria-hidden')).toBe('false');
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(page.querySelector('[role="tooltip"]')!.getAttribute('aria-hidden')).toBe('true');
    expect(document.activeElement).toBe(button);
  });

  it('opens on tap and dismisses when a pointer presses outside', () => {
    page.querySelector('button')!.click();
    fixture.detectChanges();
    expect(page.querySelector('[role="tooltip"]')!.getAttribute('aria-hidden')).toBe('false');
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    fixture.detectChanges();
    expect(page.querySelector('[role="tooltip"]')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps translated sentence order and spaces around institution mentions', () => {
    for (const text of ['Simulation by a partner organization. I visualized the results.', '協力機関が実施したシミュレーションです。', '仿真由合作机构负责。', 'Eine Partnerorganisation führte die Simulation durch.']) {
      fixture.componentRef.setInput('text', text);
      fixture.detectChanges();
      expect(fixture.componentInstance.parts.map(part => part.text).join('')).toBe(text);
      expect(page.querySelector('button')).not.toBeNull();
    }
  });

  it('leaves text without a partner mention as plain text', () => {
    fixture.componentRef.setInput('text', '가공 전략 설계와 Fusion 적용');
    fixture.detectChanges();
    expect(page.textContent).toBe('가공 전략 설계와 Fusion 적용');
    expect(page.querySelector('button')).toBeNull();
  });
});
