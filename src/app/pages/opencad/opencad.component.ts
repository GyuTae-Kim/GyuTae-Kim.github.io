import { Component } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';
import { OPENCAD_TOOLS, OPENCAD_PROJECTS } from '../../opencad-data';
import { SITE_ARTICLES } from '../../articles-data';
import { CASE_STUDIES } from '../../portfolio-data';

@Component({
  selector: 'app-opencad',
  templateUrl: './opencad.component.html',
})
export class OpenCadComponent {
  fileChoices = [
    { id: '2d-viewer', label: 'DWG·DXF 무료 웹캐드', purpose: '2D 도면 열기·측정·편집·저장', guidePath: '/opencad/guides/open-dwg-dxf' },
    { id: 'step-viewer', label: 'STEP·STP 무료 3D 뷰어', purpose: '3D 부품·조립·단면·치수 확인', guidePath: '/opencad/guides/open-step-stp' },
    { id: 'skp-viewer', label: '스케치업 SKP 무료 뷰어', purpose: 'SketchUp 모델·태그·장면 확인', guidePath: '/opencad/guides/open-skp' },
    { id: 'nc-viewer', label: 'NC·G-code·MPR 무료 뷰어', purpose: '공구 경로·코드 줄·해석 경고 확인', guidePath: '/opencad/guides/check-nc-toolpath' },
  ].map(choice => ({
    ...choice,
    tool: OPENCAD_TOOLS.find(tool => tool.id === choice.id)!,
    sampleUrl: SITE_ARTICLES.find(article => article.path === choice.guidePath)?.viewer?.sampleUrl,
  }));
  // Application links only appear after the app is publicly available.
  liveTools = OPENCAD_TOOLS.filter((tool) => tool.url);
  plannedTools = OPENCAD_TOOLS.filter((tool) => !tool.url);
  libraries = OPENCAD_PROJECTS.filter((project) => !project.url);
  // Each guide shows the file extensions of the viewer it explains.
  guides = SITE_ARTICLES.filter((article) => article.category === 'OpenCAD 사용 안내').map((article) => ({
    ...article,
    tool: OPENCAD_TOOLS.find((tool) => tool.url === article.viewer?.url),
  }));

  // Most search visits land on this hub, so the developer's project pages are linked from it directly.
  projects = CASE_STUDIES;

  // Embedding the viewers in another site (opencad-site-kit). The demo page is bilingual and not
  // localized, so it skips localLink, which would add a language path to a gyutae-kim.github.io URL.
  readonly embedDemo = 'https://gyutae-kim.github.io/opencad-site-kit/';

  constructor(private readonly i18n: I18nService) {}

  get embedGuide(): string {
    return this.i18n.language === 'ko'
      ? 'https://github.com/GyuTae-Kim/opencad-site-kit/blob/main/docs/EMBED.md'
      : 'https://github.com/GyuTae-Kim/opencad-site-kit/blob/main/docs/EMBED.en.md';
  }

  srcset(base: string): string {
    return `${base}-720.webp 720w, ${base}-1440.webp 1440w`;
  }
}
