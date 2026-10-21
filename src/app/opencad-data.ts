// OpenCAD: a personal project of free viewers that open CAD files in the browser,
// without the program that made them, an install or a server.
// Published apps and their introduction pages share this catalog. The 3D core is
// a library, so its introduction links to source rather than an unpublished app.
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
  path?: string;
  features?: { label: string; text: string }[];
  figure?: {
    // Base path of <base>-720.webp and <base>-1440.webp (16:10 screenshots).
    base: string;
    alt: string;
    caption: string;
  };
}

export interface OpenCadProject extends OpenCadTool {
  path: string;
  searchTitle: string;
  introduction: string;
  steps: string[];
  limitations: string[];
}

// Support ranges follow the public apps and repository documentation, checked
// 2026-10-16. A demo is not a claim that every file or machine is supported.
export const OPENCAD_PROJECTS: OpenCadProject[] = [
  {
    id: 'step-viewer', path: '/opencad/projects/step-viewer',
    name: 'OpenCAD STEP 뷰어', kind: '3D CAD 부품·조립 모델',
    searchTitle: '무료 STEP 뷰어 | STP·STEP 3D 파일 열기 · OpenCAD',
    extensions: ['.step', '.stp', '.p21'],
    summary: 'STEP·STP 3D CAD 파일을 설치 없이 브라우저에서 여는 무료 뷰어입니다. 조립 구조와 부품 색을 확인하고, 두 점 사이 거리를 재거나 PNG로 저장할 수 있습니다.',
    introduction: '협력사에서 받은 STEP 모델을 확인할 때 CAD 프로그램을 설치하지 않고 부품과 조립 구조를 살펴볼 수 있습니다. STEP 해석은 웹 워커에서, 3D 표시는 공통 OpenCAD 뷰어 코어에서 처리합니다.',
    url: 'https://gyutae-kim.github.io/opencad-step/', source: 'https://github.com/GyuTae-Kim/opencad-step',
    figure: {
      base: 'assets/opencad/viewer-step',
      alt: 'OpenCAD STEP 뷰어로 예제 조립 모형을 연 화면. 가운데에 받침판 위의 블록 두 개와 핀, 고리가 3D로 보이고, 오른쪽 패널에 제품 나무와 부품별 보이기 목록이 있습니다.',
      caption: '예제 조립 모형을 연 화면',
    },
    features: [
      { label: '형식', text: 'STEP AP203·AP214·AP242의 B-rep, 조립, 색과 단위' },
      { label: '탐색', text: '제품 나무에서 부품 선택·숨기기, 선택한 부품으로 화면 맞추기' },
      { label: '보기', text: '표준 뷰, 원근·평행 투영, 음영·와이어프레임·X-ray' },
      { label: '측정', text: '두 점 사이 거리 측정과 현재 화면 PNG 저장' },
      { label: '모바일', text: '보기·측정 단추만 한 줄에 두고, 측정 막대와 길게 눌러 정밀 조준으로 거리와 면 치수를 확인' },
    ],
    steps: ['STEP 뷰어를 열고 「예제 열기」로 작은 조립 모형을 확인합니다.', '「열기」를 누르거나 .step·.stp 파일을 창에 끌어다 놓습니다.', '제품 나무에서 부품을 고르거나 숨기고, 마우스나 손가락으로 회전·이동·확대합니다.', '필요한 부분을 확대해 두 점 사이 거리를 확인하거나 PNG로 저장합니다.'],
    limitations: ['3D 모델을 확인하는 뷰어이며 CAD 형상 편집·STEP 재저장을 제공하는 도구는 아닙니다.', '지원 AP 형식이어도 일부 형상은 해석되지 않을 수 있습니다. 정보 패널의 경고와 원본 CAD의 표시를 대조하세요.'],
  },
  {
    id: 'skp-viewer', path: '/opencad/projects/skp-viewer',
    name: 'OpenCAD SketchUp 뷰어', kind: 'SketchUp 3D 모델',
    searchTitle: '무료 SKP 뷰어 | SketchUp 파일 설치 없이 열기 · OpenCAD',
    extensions: ['.skp'],
    summary: 'SketchUp 2021~2026에서 저장한 SKP 파일을 브라우저에서 여는 무료 뷰어입니다. 태그·재질과 그룹·컴포넌트를 살펴보고 거리를 측정할 수 있습니다.',
    introduction: '가구·인테리어 설계의 SketchUp 모델을 전달받았을 때 브라우저에서 형태와 구성을 확인하는 도구입니다. 로컬 파일을 웹 워커에서 읽고 OpenCAD 3D 코어로 표시합니다.',
    url: 'https://gyutae-kim.github.io/opencad-skp/', source: 'https://github.com/GyuTae-Kim/opencad-skp',
    figure: {
      base: 'assets/opencad/viewer-skp',
      alt: 'OpenCAD SketchUp 뷰어로 예제 집 모형을 연 화면. 가운데에 빨간 지붕의 집과 나무, 잔디 바닥이 3D로 보이고, 오른쪽 패널에 태그 5개와 재질 11개 목록이 있습니다.',
      caption: '예제 집 모형을 연 화면',
    },
    features: [
      { label: '형식', text: 'SketchUp 2021~2026에서 저장한 .skp 파일. 2020 이하 버전 파일은 아직 열지 못합니다.' },
      { label: '탐색', text: '태그 켜고 끄기, 재질 확인, 그룹·컴포넌트 선택과 숨기기' },
      { label: '보기', text: '표준 뷰, 원근·평행 투영, 음영·모서리·와이어프레임·X-ray' },
      { label: '측정', text: '두 점 사이 거리·축별 차이 확인과 PNG 저장' },
      { label: '모바일', text: '보기·측정 단추만 한 줄에 두고, 측정 막대와 줄자·각도기 길게 눌러 정밀 조준' },
    ],
    steps: ['SKP 뷰어를 열고 「예제 열기」로 브라우저에서 만든 집 모형을 확인합니다.', '「열기」로 .skp 파일을 선택하거나 창 안으로 끌어다 놓습니다.', '태그·재질·구성 패널과 3D 화면에서 모델을 확인합니다.', '측정 도구로 두 점의 거리를 재거나 현재 화면을 PNG로 저장합니다.'],
    limitations: ['SketchUp 2020 이하에서 저장한 파일은 읽지 못합니다. 원본 프로그램의 저장 버전을 확인하세요.', 'SketchUp의 공식 제품이 아니며 모델 편집·SKP 재저장 기능을 제공하지 않습니다. 모든 재질·객체가 원본과 동일하게 보이는 것은 아닙니다.'],
  },
  {
    id: 'nc-viewer', path: '/opencad/projects/nc-viewer',
    name: 'OpenCAD NC 뷰어', kind: 'G-code·Heidenhain·woodWOP MPR',
    searchTitle: '무료 NC·G-code 뷰어 | MPR 공구 경로 확인 · OpenCAD',
    extensions: ['.nc', '.gcode', '.ngc', '.h', '.mpr'],
    summary: 'G-code·Heidenhain 평문·woodWOP MPR 파일의 3D 공구 경로를 확인하는 무료 NC 뷰어입니다. 코드 줄과 이동을 함께 짚고 가공 순서를 재생할 수 있습니다.',
    introduction: 'CNC 프로그램의 이동 순서와 공구 경로를 살펴보는 도구입니다. G-code의 직선·원호·나선 이동과 Heidenhain·MPR 데이터를 해석하고, 코드·공구·정보 패널을 3D 경로와 연결합니다.',
    url: 'https://gyutae-kim.github.io/opencad-nc/', source: 'https://github.com/GyuTae-Kim/opencad-nc',
    figure: {
      base: 'assets/opencad/viewer-nc',
      alt: 'OpenCAD NC 뷰어로 예제 G-code를 연 화면. 가운데에 바깥 윤곽, 원형 포켓, 드릴 구멍의 공구 경로가 공구마다 다른 색으로 보이고, 오른쪽 패널에 재생 막대와 G-code 줄 목록이 있습니다.',
      caption: '예제 G-code를 연 화면',
    },
    features: [
      { label: '형식', text: 'ISO·Fanuc·LinuxCNC·GRBL·Mach3 계열 G-code, Heidenhain 평문, woodWOP MPR' },
      { label: '경로', text: '3D 공구 경로와 코드 줄 연결, 공구별 표시, 가공 순서 재생' },
      { label: '정보', text: '이송·급속 이동 길이, 예상 시간, 해석 경고와 MPR 작업·변수' },
      { label: '보기', text: '회전·확대, 표준 뷰, 두 점 측정과 PNG 저장' },
      { label: '모바일', text: '보기·측정·재생 단추만 한 줄에 두고, 측정 막대와 길게 눌러 정밀 조준으로 공구 경로 위 두 점 거리를 확인' },
    ],
    steps: ['NC 뷰어를 열고 「예제 열기」로 합성 G-code를 확인합니다.', 'G-code·Heidenhain 평문·MPR 파일을 열거나 창 안으로 끌어다 놓습니다.', '코드 줄이나 3D 경로를 선택해 해당 이동을 함께 확인합니다.', '공구별 표시와 재생 막대로 가공 순서를 살펴보고 정보 패널의 경고를 확인합니다.'],
    limitations: ['장비별 매크로·사이클·좌표계는 다르게 해석될 수 있습니다. 지원 방언이어도 모든 명령을 동일하게 재현하는 것은 아닙니다.', '공구 경로 시각화와 예상 시간은 실제 장비의 충돌 검사·가공 품질·운전 승인 결과가 아닙니다. 장비 투입 전 원본 CAM과 장비 조건을 별도로 검증하세요.'],
  },
  {
    id: 'viewer3d', path: '/opencad/projects/viewer3d',
    name: 'OpenCAD 3D 뷰어 코어', kind: '개발자를 위한 WebGL2 라이브러리',
    searchTitle: 'WebGL2 3D 뷰어 코어 | OpenCAD 오픈소스 라이브러리',
    extensions: [], source: 'https://github.com/GyuTae-Kim/opencad-viewer3d',
    summary: 'NC·STEP·SKP 뷰어가 함께 사용하는 WebGL2 기반 3D 뷰어 라이브러리입니다. 해석기가 만든 장면을 받아 표시·선택·측정하는 공통 기능을 제공합니다.',
    introduction: '파일을 해석하는 코드와 화면을 그리는 코드를 나눈 OpenCAD의 공통 라이브러리입니다. 삼각형 그물·선분·점으로 구성된 Scene3d 장면을 받아, 각 형식의 뷰어에서 같은 조작과 측정 기능을 쓰게 합니다.',
    features: [
      { label: '표시', text: 'WebGL2, 음영·모서리·와이어프레임·X-ray, 선분·점 그리기' },
      { label: '조작', text: '회전·이동·확대, 터치 조작, 뷰 큐브와 표준 뷰' },
      { label: '선택', text: 'BVH 기반 선택, 그룹별 표시, 두 점 측정과 그림 저장' },
      { label: '연결', text: 'NC·STEP·SKP 해석기와 공유하는 Scene3d 장면 형식' },
    ],
    steps: ['GitHub에서 설치·사용 예제와 Scene3d 타입을 확인합니다.', 'Viewer3d를 화면 요소에 연결하고 해석한 장면을 setScene으로 전달합니다.', '완성된 사용 예시는 NC·STEP·SKP 뷰어의 예제 열기에서 확인할 수 있습니다.'],
    limitations: ['개발용 라이브러리이며 별도 파일 열기 사이트는 없습니다. 실제 파일 확인은 각 형식의 뷰어를 이용하세요.', '파일 해석 기능은 이 코어에 포함되지 않으며 NC·STEP·SKP 저장소가 각각 담당합니다.'],
  },
];

export const OPENCAD_TOOLS: OpenCadTool[] = [
  {
    id: '2d-viewer',
    name: 'OpenCAD DWG·DXF',
    kind: '2D 도면',
    extensions: ['.dwg', '.dxf'],
    summary:
      'DWG·DXF 도면을 열어 보고, 새로 그리거나 고친 뒤 다시 저장하는 무료 2D 캐드입니다. 거리·각도·면적을 재고 PDF·PNG·SVG로 출력할 수도 있습니다.',
    url: 'https://gyutae-kim.github.io/opencad-dwgdxf/',
    source: 'https://github.com/GyuTae-Kim/opencad-dwgdxf',
    features: [
      { label: '열기', text: 'DWG R13~R2018, DXF R12~R2018 파일과 빈 새 도면' },
      { label: '확인', text: '거리, 각도, 면적 측정과 도면층, 치수 목록, 문자 찾기' },
      { label: '편집', text: '그리기와 수정 명령, 치수, 해치, 블록' },
      { label: '저장', text: 'DWG, DXF로 저장하고 PDF, PNG, SVG로 출력' },
      { label: '모바일', text: '편집 리본 대신 보기 모드: 거리·반지름·각도·면적 재기와 누른 객체의 치수 정보' },
    ],
    figure: {
      base: 'assets/opencad/viewer-2d',
      alt: 'OpenCAD DWG·DXF로 예제 도면을 연 화면. 위쪽에 리본 메뉴가 있고, 가운데에 치수가 붙은 브래킷 판의 정면도와 단면도, 주기, 체결 부품이 보입니다.',
      caption: '예제 도면을 연 화면',
    },
  },
  ...OPENCAD_PROJECTS.filter((project) => project.url),
];
