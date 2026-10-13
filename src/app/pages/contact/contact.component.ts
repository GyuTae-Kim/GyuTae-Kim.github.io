import { Component } from '@angular/core';
@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  copyStatus = '';
  async copyEmail() {
    try {
      await navigator.clipboard.writeText('GyuTae.K1020@gmail.com');
      this.copyStatus = '이메일 주소를 복사했습니다.';
    } catch {
      this.copyStatus = '주소를 선택해서 복사해 주세요.';
    }
  }
}
