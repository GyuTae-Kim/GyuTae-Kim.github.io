// OpenCAD: a personal project of free viewers that open CAD files in the browser,
// without the program that made them, an install or a server.
// Each viewer is its own repository and Pages site: 2dcad-viewer for 2D drawings, and
// opencad-step, opencad-skp and opencad-nc on the shared 3D core opencad-viewer3d.
// List only what the deployed viewer reads; formats it cannot open yet stay out of the features.
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
    kind: '2D 도면',
    extensions: ['.dwg', '.dxf'],
    summary:
      'DWG·DXF 도면을 열고 거리·각도·면적을 측정하는 무료 캐드 뷰어입니다. 도면 편집·저장과 PDF·PNG·SVG 출력도 지원합니다.',
    url: 'https://gyutae-kim.github.io/2dcad-viewer/',
    source: 'https://github.com/GyuTae-Kim/2dcad-viewer',
    features: [
      { label: '열기', text: 'DWG R13~R2018, DXF R12~R2018' },
      { label: '확인', text: '거리, 각도, 면적 측정과 도면층, 치수 목록, 문자 찾기' },
      { label: '편집', text: '그리기와 수정 명령, 치수, 해치, 블록' },
      { label: '저장', text: 'DWG, DXF로 저장하고 PDF, PNG, SVG로 출력' },
    ],
    figure: {
      base: 'assets/opencad/viewer-2d',
      alt: 'OpenCAD 2D 뷰어로 예제 도면을 연 화면. 위쪽에 리본 메뉴가 있고, 가운데에 치수가 붙은 브래킷 판의 정면도와 단면도, 주기, 체결 부품이 보입니다.',
      caption: '예제 도면을 연 화면',
    },
  },
  {
    id: 'step-viewer',
    name: 'STEP 뷰어',
    kind: '3D 부품 모델',
    extensions: ['.step', '.stp', '.p21'],
    summary:
      'CAD 프로그램끼리 3D 모델을 주고받을 때 가장 많이 쓰는 STEP 파일을 여는 무료 뷰어입니다. 조립 제품 나무에서 부품을 고르고 숨기며, 고른 부품으로 확대해 볼 수 있습니다.',
    url: 'https://gyutae-kim.github.io/opencad-step/',
    source: 'https://github.com/GyuTae-Kim/opencad-step',
    features: [
      { label: '열기', text: 'STEP AP203, AP214, AP242의 곡면 모델과 조립' },
      { label: '확인', text: '조립 제품 나무, 부품 색과 단위, 파일 머리 정보, 두 점 거리 측정' },
      { label: '보기', text: '부품 고르기와 숨기기, 고른 부품으로 확대, 와이어프레임 보기' },
      { label: '저장', text: '보고 있는 화면을 PNG로 저장' },
    ],
    figure: {
      base: 'assets/opencad/viewer-step',
      alt: 'OpenCAD STEP 뷰어로 예제 조립 모형을 연 화면. 가운데에 받침판 위의 블록 두 개와 핀, 고리가 3D로 보이고, 오른쪽 패널에 제품 나무와 부품별 보이기 목록이 있습니다.',
      caption: '예제 조립 모형을 연 화면',
    },
  },
  {
    id: 'skp-viewer',
    name: 'SKP 뷰어',
    kind: 'SketchUp 모델',
    extensions: ['.skp'],
    summary:
      '가구와 인테리어 설계에서 많이 쓰는 SketchUp 모델을 여는 무료 뷰어입니다. 태그를 켜고 끄며 재질과 그룹, 컴포넌트를 확인할 수 있습니다.',
    url: 'https://gyutae-kim.github.io/opencad-skp/',
    source: 'https://github.com/GyuTae-Kim/opencad-skp',
    features: [
      { label: '열기', text: 'SketchUp 2021~2026으로 저장한 파일. 2020 이하 버전 파일은 아직 열지 못합니다.' },
      { label: '확인', text: '태그 켜고 끄기, 재질 색과 쓰인 면 수, 그룹과 컴포넌트 목록, 두 점 거리 측정' },
      { label: '보기', text: '그룹과 컴포넌트를 골라 강조, 확대, 숨기기' },
      { label: '저장', text: '보고 있는 화면을 PNG로 저장' },
    ],
    figure: {
      base: 'assets/opencad/viewer-skp',
      alt: 'OpenCAD SketchUp 뷰어로 예제 집 모형을 연 화면. 가운데에 빨간 지붕의 집과 나무, 잔디 바닥이 3D로 보이고, 오른쪽 패널에 태그 5개와 재질 11개 목록이 있습니다.',
      caption: '예제 집 모형을 연 화면',
    },
  },
  {
    id: 'nc-viewer',
    name: 'NC 뷰어',
    kind: 'CNC 가공 프로그램',
    extensions: ['.nc', '.gcode', '.tap', '.h', '.mpr'],
    summary:
      'CNC 장비가 공구를 어떻게 움직일지 적은 가공 프로그램을 3D 공구 경로로 보여 주는 무료 뷰어입니다. 코드 줄과 경로를 서로 짚어 보고, 가공 순서를 재생할 수 있습니다.',
    url: 'https://gyutae-kim.github.io/opencad-nc/',
    source: 'https://github.com/GyuTae-Kim/opencad-nc',
    features: [
      { label: '열기', text: 'G-code(Fanuc, LinuxCNC, GRBL, Mach3), Heidenhain 평문, woodWOP MPR' },
      { label: '확인', text: '코드 줄과 3D 경로 연결, 공구 목록과 지름, 이송과 급속 길이, 예상 시간' },
      { label: '재생', text: '가공 순서를 1배, 10배, 100배로 재생하고 공구 위치 표시' },
      { label: '저장', text: '보고 있는 화면을 PNG로 저장' },
    ],
    figure: {
      base: 'assets/opencad/viewer-nc',
      alt: 'OpenCAD NC 뷰어로 예제 G-code를 연 화면. 가운데에 바깥 윤곽, 원형 포켓, 드릴 구멍의 공구 경로가 공구마다 다른 색으로 보이고, 오른쪽 패널에 재생 막대와 G-code 줄 목록이 있습니다.',
      caption: '예제 G-code를 연 화면',
    },
  },
];
