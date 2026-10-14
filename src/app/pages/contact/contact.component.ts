import { Component, OnDestroy } from '@angular/core';
import { CASE_STUDIES } from '../../portfolio-data';
import { RESEARCH_WORKS } from '../../research-data';

const EMAIL = 'GyuTae.K1020@gmail.com';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnDestroy {
  email = EMAIL;
  // Opens a new mail with the subject line already filled in.
  mailto = `mailto:${EMAIL}?subject=${encodeURIComponent('포트폴리오를 보고 연락드립니다')}`;
  cases = CASE_STUDIES;
  repos = RESEARCH_WORKS.map((work) => ({
    name: work.source.split('/').pop(),
    title: work.title,
    url: work.source,
  }));
  copied = false;
  copyStatus = '';
  private resetTimer?: ReturnType<typeof setTimeout>;

  async copyEmail() {
    this.copied = await writeClipboard(EMAIL);
    this.copyStatus = this.copied ? '이메일 주소를 복사했습니다.' : '주소를 선택해서 복사해 주세요.';
    clearTimeout(this.resetTimer);
    if (this.copied) this.resetTimer = setTimeout(() => (this.copied = false), 2000);
  }

  ngOnDestroy() {
    clearTimeout(this.resetTimer);
  }
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // In-app browsers often block the Clipboard API; fall back to a selected textarea.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand('copy');
    area.remove();
    return copied;
  }
}
