import { Component } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  darkMode = true;

  constructor(private overlayContainer: OverlayContainer) { }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    this.applyDarkMode();
  }

  private applyDarkMode(): void {
    const classList = this.overlayContainer.getContainerElement().classList;
    console.log(this.darkMode)
    console.log(classList)
    if (this.darkMode) {
      classList.add('dark-mode');
    } else {
      classList.remove('dark-mode');
    }
  }
}