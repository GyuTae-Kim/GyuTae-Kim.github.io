import { Component } from '@angular/core';
import { OPENCAD_TOOLS, OPENCAD_PROJECTS } from '../../opencad-data';
import { SITE_ARTICLES } from '../../articles-data';
import { AUDIENCE_ARTICLES } from '../../audience-data';

@Component({
  selector: 'app-opencad',
  templateUrl: './opencad.component.html',
})
export class OpenCadComponent {
  audienceArticles = AUDIENCE_ARTICLES;
  fileChoices = [
    { id: '2d-viewer', label: 'DWG·DXF 무료 캐드 뷰어', purpose: '2D 도면 열기·측정·편집·저장', guidePath: '/opencad/guides/open-dwg-dxf' },
    { id: 'step-viewer', label: 'STEP·STP 무료 3D 뷰어', purpose: '3D 부품·조립·단면·치수 확인', guidePath: '/opencad/guides/open-step-stp' },
    { id: 'skp-viewer', label: '스케치업 SKP 무료 뷰어', purpose: 'SketchUp 모델·태그·장면 확인', guidePath: '/opencad/guides/open-skp' },
    { id: 'nc-viewer', label: 'NC·G-code·MPR 무료 뷰어', purpose: '공구 경로·코드 줄·해석 경고 확인', guidePath: '/opencad/guides/check-nc-toolpath' },
  ].map(choice => ({ ...choice, tool: OPENCAD_TOOLS.find(tool => tool.id === choice.id)! }));
  // Application links only appear after the app is publicly available.
  liveTools = OPENCAD_TOOLS.filter((tool) => tool.url);
  plannedTools = OPENCAD_TOOLS.filter((tool) => !tool.url);
  libraries = OPENCAD_PROJECTS.filter((project) => !project.url);
  // Each guide shows the file extensions of the viewer it explains.
  guides = SITE_ARTICLES.filter((article) => article.category === 'OpenCAD 사용 안내').map((article) => ({
    ...article,
    tool: OPENCAD_TOOLS.find((tool) => tool.url === article.viewer?.url),
  }));

  srcset(base: string): string {
    return `${base}-720.webp 720w, ${base}-1440.webp 1440w`;
  }
}
