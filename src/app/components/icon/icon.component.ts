import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

interface IconShape {
  // Side of the square viewBox; line icons use a 24 grid.
  box?: number;
  solid?: boolean;
  paths: string[];
}

// Line icons drawn with square ends to match the drawing-sheet strokes.
// The GitHub mark is GitHub's own Octicon (MIT) so the logo stays exact.
const ICONS = {
  'arrow-right': { paths: ['M4 12h15', 'M13 6l6 6-6 6'] },
  'arrow-left': { paths: ['M20 12H5', 'M11 6l-6 6 6 6'] },
  'arrow-down': { paths: ['M12 4v15', 'M6 13l6 6 6-6'] },
  chevron: { paths: ['M9 5.5l6.5 6.5L9 18.5'] },
  external: { paths: ['M7 17L17 7', 'M9 7h8v8'] },
  mail: { paths: ['M3 5h18v14H3z', 'M3.5 6l8.5 6.5L20.5 6'] },
  copy: { paths: ['M9 9h11v11H9z', 'M15 9V4H4v11h5'] },
  check: { paths: ['M4.5 12.5l5 5L19.5 7'] },
  alert: { paths: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 7.5v5.5', 'M12 16.25v.5'] },
  close: { paths: ['M6 6l12 12', 'M18 6L6 18'] },
  play: { solid: true, paths: ['M7 4.5v15L19 12z'] },
  pause: { solid: true, paths: ['M6 4.5h4v15H6z', 'M14 4.5h4v15h-4z'] },
  reset: { paths: ['M4 12a8 8 0 1 0 2.34-5.66L4 8.66', 'M4 3.5v5.16h5.16'] },
  orbit: { paths: ['M3 12c0-2.2 4-4 9-4s9 1.8 9 4-4 4-9 4', 'M14.5 13.5L12 16l2.5 2.5', 'M12 3.5v2'] },
  zoom: { paths: ['M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z', 'M15.5 15.5L20 20', 'M10.5 8v5', 'M8 10.5h5'] },
  code: { paths: ['M8.5 7l-5 5 5 5', 'M15.5 7l5 5-5 5'] },
  document: { paths: ['M6 3h8.5L19 7.5V21H6z', 'M14.5 3v4.5H19', 'M9 12.5h7', 'M9 16.5h5'] },
  github: {
    box: 16,
    solid: true,
    paths: [
      'M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z',
    ],
  },
} satisfies Record<string, IconShape>;

export type IconName = keyof typeof ICONS;

// Decorative only: the link or button around it carries the words.
@Component({
  selector: 'app-icon',
  template: `<svg
    [attr.viewBox]="'0 0 ' + (shape.box ?? 24) + ' ' + (shape.box ?? 24)"
    [class.solid]="shape.solid"
    focusable="false"
  >
    <path *ngFor="let d of shape.paths" [attr.d]="d" />
  </svg>`,
  styles: [
    `
      :host {
        display: inline-flex;
        flex: none;
        width: 1.15em;
        height: 1.15em;
        vertical-align: -0.2em;
      }
      svg {
        width: 100%;
        height: 100%;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.8;
        stroke-linecap: square;
        stroke-linejoin: miter;
      }
      svg.solid {
        fill: currentColor;
        stroke: none;
      }
    `,
  ],
  host: { 'aria-hidden': 'true' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  @Input() name!: IconName;

  get shape(): IconShape {
    return ICONS[this.name];
  }
}
