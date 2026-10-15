// OpenCAD: a personal project of free viewers that open CAD files in the browser,
// without the program that made them, an install or a server.
// The published application opens 2D and 3D documents in the same file-tab UI.
export interface OpenCadTool {
  id: string;
  name: string;
  // What kind of file it opens, shown above the name.
  kind: string;
  extensions: string[];
  summary: string;
  // A planned viewer has no url yet; give it one (and a figure) when it is published.
  url?: string;
  source?: string;
  features?: { label: string; text: string }[];
  figure?: {
    // Base path of <base>-720.webp and <base>-1440.webp (16:10 screenshots).
    base: string;
    alt: string;
    caption: string;
  };
}

export const OPENCAD_TOOLS: OpenCadTool[] = [
  {
    id: '2d-viewer',
    name: 'OpenCAD 무료 캐드 뷰어',
    kind: '2D 도면 · 3D 모델 · NC 공구 경로',
    extensions: ['.dwg', '.dxf', '.step', '.stp', '.skp', '.nc', '.mpr'],
    summary:
      'DWG·DXF 도면을 열고 거리·각도·면적을 측정하는 무료 캐드 뷰어입니다. 도면 편집·저장과 PDF·PNG·SVG 출력, NC·STEP·SKP 파일의 3D 보기도 같은 앱에서 지원합니다.',
    url: 'https://gyutae-kim.github.io/2dcad-viewer/',
    source: 'https://github.com/GyuTae-Kim/2dcad-viewer',
    features: [
      { label: '열기', text: 'DWG R13~R2018, DXF R12~R2018' },
      { label: '확인', text: '거리, 각도, 면적 측정과 도면층, 치수 목록, 문자 찾기' },
      { label: '편집', text: '그리기와 수정 명령, 치수, 해치, 블록' },
      { label: '저장', text: 'DWG, DXF로 저장하고 PDF, PNG, SVG로 출력' },
      { label: '3D 모델', text: 'STEP AP203·AP214·AP242, SketchUp 2021 이후 SKP 보기와 두 점 측정' },
      { label: 'NC', text: 'G-code, Heidenhain 평문, woodWOP MPR의 공구 경로 확인과 재생' },
    ],
    figure: {
      base: 'assets/opencad/viewer-2d',
      alt: 'OpenCAD 2D 뷰어로 예제 도면을 연 화면. 위쪽에 리본 메뉴가 있고, 가운데에 치수가 붙은 브래킷 판의 정면도와 단면도, 주기, 체결 부품이 보입니다.',
      caption: '예제 도면을 연 화면',
    },
  },
];
