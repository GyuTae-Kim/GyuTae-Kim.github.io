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
  // Drawn with the shared OpenCAD 3D core (opencad-viewer3d).
  sharedCore?: boolean;
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
// 2026-10-16 (the 2D CAD on 2026-10-21, opencad-dwgdxf 7131c1b; the NC viewer's
// PGI and XML on 2026-10-22, opencad-nc f2ae99f). Every app was checked again on
// 2026-10-22 after the round-4 releases (opencad-dwgdxf 800f61f, opencad-step d46bbbf,
// opencad-skp 133e05e, opencad-nc 34fd886), and again on 2026-10-27 for the round-5
// pull requests (offline NC and 2D CAD, SketchUp edge colours and walking, STEP
// snapping, multi-select and inertia, core v0.8.0). A demo is not a claim that every
// file or machine is supported.
export const OPENCAD_PROJECTS: OpenCadProject[] = [
  {
    // The id stays the /opencad card anchor (#2d-viewer) that older links point to.
    id: '2d-viewer', path: '/opencad/projects/dwg-dxf',
    name: 'OpenCAD DWG·DXF', kind: '2D 도면',
    searchTitle: '무료 DWG·DXF 웹캐드 | 오픈캐드 2D 편집·저장',
    extensions: ['.dwg', '.dxf'],
    summary:
      '설치나 회원가입 없이 DWG·DXF 도면을 열고, 새로 그리거나 편집한 뒤 저장하는 무료 웹캐드입니다. 거리·각도·면적 측정과 PDF·PNG·SVG 출력도 지원합니다.',
    introduction: '전달받은 DWG·DXF 도면을 CAD 프로그램 없이 브라우저에서 열고, 필요하면 고쳐서 다시 저장하는 2D 캐드입니다. 화면 배치와 명령 이름, 단축키는 AutoCAD와 같게 만들었습니다. 파일 해석과 장면 준비는 웹 워커에서, 화면 표시는 WebGL2로 처리합니다.',
    url: 'https://gyutae-kim.github.io/opencad-dwgdxf/',
    source: 'https://github.com/GyuTae-Kim/opencad-dwgdxf',
    features: [
      { label: '열기', text: 'DWG R13~R2018, DXF R12~R2018 파일과 빈 새 도면' },
      { label: '확인', text: '거리, 각도, 면적과 질량 특성(MASSPROP) 측정, 도면층, 치수 목록, 문자 찾기' },
      { label: '편집', text: '그리기와 수정 명령, 치수, 해치, 블록, 쓰지 않는 항목 정리(PURGE)' },
      { label: '저장', text: 'DWG, DXF로 저장하고, 저장 형식에서 빠지는 객체는 저장 전에 알림' },
      { label: '출력', text: 'PDF, PNG, SVG 출력, 여러 배치를 한 PDF로 묶기(PUBLISH), PDF 안 도면층 켜고 끄기와 문자 검색' },
      { label: '모바일', text: '편집 리본 대신 보기 모드: 거리·반지름·각도·면적 재기, 객체 스냅 고르기, 점 좌표와 문자 찾기, 누른 객체의 치수 정보. 홈 화면에 추가하면 인터넷 없이도 열림' },
    ],
    figure: {
      base: 'assets/opencad/viewer-2d',
      alt: 'OpenCAD DWG·DXF로 예제 도면을 연 화면. 위쪽에 리본 메뉴가 있고, 가운데에 치수가 붙은 브래킷 판의 정면도와 단면도, 주기, 체결 부품이 보입니다.',
      caption: '예제 도면을 연 화면',
    },
    steps: [
      'DWG·DXF 캐드를 열고 시작 화면의 「예제 도면 열기」로 화면 조작을 먼저 익힙니다.',
      '「파일 열기」(Ctrl+O)로 .dwg·.dxf 파일을 고르거나 창에 끌어다 놓습니다. 빈 도면에서 시작하려면 「새 도면」(Ctrl+N)을 누릅니다.',
      '휠로 확대·축소하고 가운데 버튼으로 이동합니다. DI(거리), MEA(측정), LA(도면층)처럼 AutoCAD와 같은 명령을 명령행에 입력할 수 있습니다.',
      '고친 도면은 DWG나 DXF로 저장합니다. 저장 형식에서 빠지는 객체가 있으면 저장하기 전에 알려 줍니다. 필요하면 PDF·PNG·SVG로 출력합니다.',
    ],
    limitations: [
      'DWG는 R13~R2018을 열고 R2000~R2018로 저장합니다. R2007 도면은 R2004 형식으로 저장됩니다.',
      '외부 참조, 이미지, PDF 언더레이와 SHX 글꼴은 해당 파일을 따로 골라야 원래대로 보입니다. SHX 큰 글꼴 자리의 한글은 Noto Sans KR로 대신 그려 원본과 다르게 보일 수 있습니다.',
      '영역과 3D 솔리드는 모서리 선으로만 그립니다. 영역을 새로 만들거나 합치고 빼는 명령, 동적 블록의 매개변수를 새로 만드는 명령은 대신 쓸 방법만 안내합니다.',
      '모바일 기기에서는 보기와 치수 확인 화면으로 엽니다. 그리기와 저장은 연필 단추로 편집 화면에 들어가거나 컴퓨터에서 하세요.',
      'Autodesk와 관계없는 개인 오픈소스 프로젝트입니다. 납품이나 가공에 쓸 도면은 원본 프로그램과 작업 기준으로 다시 확인하세요.',
    ],
  },
  {
    id: 'step-viewer', path: '/opencad/projects/step-viewer',
    name: 'OpenCAD STEP 뷰어', kind: '3D CAD 부품·조립 모델',
    searchTitle: 'OpenCAD STEP 뷰어 기능 | 측정·단면·조립',
    extensions: ['.step', '.stp', '.p21'],
    summary: 'STEP·STP 3D CAD 파일을 설치 없이 브라우저에서 여는 무료 뷰어입니다. 조립 구조와 부품 속성을 확인하고, 구멍 지름과 면 사이 거리를 재며, 단면과 분해 보기로 안쪽까지 살펴볼 수 있습니다.',
    introduction: '협력사에서 받은 STEP 모델을 확인할 때 CAD 프로그램을 설치하지 않고 부품과 조립 구조를 살펴볼 수 있습니다. 부품끼리 겹치는 곳을 찾고 부피와 질량도 계산합니다. STEP 해석은 웹 워커에서, 3D 표시는 공통 OpenCAD 뷰어 코어에서 처리합니다.',
    url: 'https://gyutae-kim.github.io/opencad-step/', source: 'https://github.com/GyuTae-Kim/opencad-step', sharedCore: true,
    figure: {
      base: 'assets/opencad/viewer-step',
      alt: 'OpenCAD STEP 뷰어로 예제 조립 모형을 연 화면. 가운데에 받침판 위의 블록 두 개와 핀, 고리가 3D로 보이고, 오른쪽 패널에 제품 나무와 부품별 보이기 목록이 있습니다.',
      caption: '예제 조립 모형을 연 화면',
    },
    features: [
      { label: '형식', text: 'STEP AP203, AP214, AP242의 B-rep 형상, 조립, 색, 단위와 PMI 주석' },
      { label: '탐색', text: '여러 부품을 함께 골라 제품 나무와 오른쪽 클릭 메뉴에서 숨기기, 이것만 보기, 나머지 흐리게, 부품 속성 보기' },
      { label: '보기', text: '표준 뷰, 음영과 와이어프레임, 숨은선 제거, X-ray, 단면, 분해 보기' },
      { label: '측정', text: '원 중심과 모서리 가운데 점에 붙는 두 점 거리, 모서리 길이와 구멍 지름, 면 사이 거리와 각도, 부피와 질량, 관성 모멘트, 부품 간섭 검사' },
      { label: '내보내기', text: '큰 PNG와 투명 배경 그림, STL·OBJ 파일, 측정 기록 CSV, 지금 화면을 담은 보기 링크' },
      { label: '모바일', text: '보기·측정 단추만 한 줄에 두고, 측정 막대와 길게 눌러 정밀 조준으로 거리와 면 치수를 확인. 홈 화면에 추가하면 인터넷 없이도 열림' },
    ],
    steps: ['STEP 뷰어를 열고 「예제 열기」로 작은 조립 모형을 확인합니다.', '「열기」를 누르거나 .step·.stp 파일을 창에 끌어다 놓습니다.', '제품 나무에서 부품을 고르거나 숨기고, 마우스나 손가락으로 회전·이동·확대합니다.', '「측정」에서 두 점이나 면, 모서리를 눌러 거리와 지름을 재고, 「내보내기」로 그림이나 STL 파일을 저장하거나 보기 링크를 복사합니다.'],
    limitations: ['3D 모델을 확인하는 뷰어라 형상을 고치거나 STEP으로 다시 저장하지는 않습니다. STL·OBJ 내보내기는 화면에 그린 삼각형 그물을 그대로 씁니다.', '부피와 질량, 관성 모멘트, 간섭 검사, 곡면끼리의 최소 거리는 화면용 삼각형으로 계산한 근삿값입니다. 평면, 원기둥, 원, 직선처럼 수식으로 바로 구할 수 있는 측정만 정확한 값입니다.', '지원 AP 형식이어도 일부 형상은 해석되지 않을 수 있습니다. 정보 패널의 경고와 원본 CAD의 표시를 대조하세요.'],
  },
  {
    id: 'skp-viewer', path: '/opencad/projects/skp-viewer',
    name: 'OpenCAD SketchUp 뷰어', kind: 'SketchUp 3D 모델',
    searchTitle: 'OpenCAD SKP 뷰어 기능 | 버전·태그·장면',
    extensions: ['.skp'],
    summary: 'SketchUp 6~2026에서 저장한 SKP 파일을 브라우저에서 여는 무료 뷰어입니다. 태그·재질과 그룹·컴포넌트를 살펴보고, 장면 재생과 걷기로 공간을 둘러보며 거리와 각도를 잴 수 있습니다.',
    introduction: '가구·인테리어 설계의 SketchUp 모델을 전달받았을 때 브라우저에서 형태와 구성을 확인하는 도구입니다. 파일에 저장된 스타일과 장면, 그림자 설정을 따라 SketchUp에서 보던 모습에 가깝게 엽니다. 로컬 파일을 웹 워커에서 읽고 OpenCAD 3D 코어로 표시합니다.',
    url: 'https://gyutae-kim.github.io/opencad-skp/', source: 'https://github.com/GyuTae-Kim/opencad-skp', sharedCore: true,
    figure: {
      base: 'assets/opencad/viewer-skp',
      alt: 'OpenCAD SketchUp 뷰어로 예제 집 모형을 연 화면. 가운데에 빨간 지붕의 집과 나무, 잔디 바닥이 3D로 보이고, 오른쪽 패널에 태그 5개와 재질 11개 목록이 있습니다.',
      caption: '예제 집 모형을 연 화면',
    },
    features: [
      { label: '형식', text: 'SketchUp 6, 7, 8과 2013~2026에서 저장한 .skp 파일. SketchUp 5 이하 파일은 아직 열지 못합니다.' },
      { label: '탐색', text: '태그 켜고 끄기, 재질 확인, 이름으로 그룹과 컴포넌트 찾기, 면이나 모서리 하나만 골라 넓이와 길이 보기' },
      { label: '보기', text: '배경과 모서리 색까지 파일 스타일대로 열기, 일곱 가지 그리기 방식, 그림자와 안개, 여러 단면과 단면 채우기' },
      { label: '장면', text: '장면 탭과 장면 재생, 벽에 막히고 바닥을 따라가는 걷기, 시야각 조절, 2점 투시' },
      { label: '측정', text: '줄자와 각도기(끝점, 중간점, 원 중심, 수직 발에 붙음), 최근 측정 10개 복사, 그림 저장과 인쇄' },
      { label: '모바일', text: '보기·측정 단추만 한 줄에 두고 줄자·각도기는 길게 눌러 정밀 조준, 걷기는 조이스틱으로. 홈 화면에 추가하면 인터넷 없이도 열림' },
    ],
    steps: ['SKP 뷰어를 열고 「예제 열기」로 브라우저에서 만든 집 모형을 확인합니다.', '「열기」로 .skp 파일을 선택하거나 창 안으로 끌어다 놓습니다.', '태그·재질·구성 패널과 3D 화면에서 모델을 확인합니다. 장면이 있으면 장면 탭을 누르거나 ▶로 차례로 재생합니다.', '줄자(T)와 각도기로 거리와 각도를 재고, 「그림 저장」에서 PNG로 저장하거나 인쇄합니다.'],
    limitations: ['SketchUp 3~5에서 저장한 아주 옛 파일은 읽지 못합니다. 이런 파일을 열면 저장 버전을 알려 주니, SketchUp 6 이상에서 다시 저장해 여세요.', 'SketchUp의 공식 제품이 아니며 모델 편집·SKP 재저장 기능을 제공하지 않습니다. 모든 재질·객체가 원본과 동일하게 보이는 것은 아닙니다.'],
  },
  {
    id: 'nc-viewer', path: '/opencad/projects/nc-viewer',
    name: 'OpenCAD NC 뷰어', kind: 'G-code·Heidenhain·MPR·PGI·XML',
    searchTitle: 'OpenCAD NC 뷰어 기능 | G-code·MPR 지원',
    extensions: ['.nc', '.gcode', '.ngc', '.h', '.mpr', '.pgi', '.xml'],
    summary: 'G-code와 Heidenhain(평문, DIN/ISO), 판재 가공 파일(woodWOP MPR, WangShi PGI, KDT XML)의 3D 공구 경로를 확인하는 무료 NC 뷰어입니다. 코드 줄과 이동을 함께 짚고 가공 순서를 재생하며, 장비에 넣기 전에 확인할 줄을 경고로 알려 줍니다.',
    introduction: 'CNC 프로그램의 이동 순서와 공구 경로를 살펴보는 도구입니다. G-code의 직선·원호·나선 이동과 Heidenhain 프로그램을 해석하고, 코드·공구·정보 패널을 3D 경로와 연결합니다. Haas, Siemens 같은 방언과 선반 프로그램은 파일 내용으로 알아보고 화면 위 띠로 알려 줍니다. 주 프로그램과 부프로그램 파일을 함께 열면 한 작업으로 이어 읽습니다. 판재 가공 파일(MPR, PGI, XML)은 구멍과 홈, 포켓, 윤곽 가공을 판 위에 그리고, 가공 목록과 변수를 함께 보여 줍니다.',
    url: 'https://gyutae-kim.github.io/opencad-nc/', source: 'https://github.com/GyuTae-Kim/opencad-nc', sharedCore: true,
    figure: {
      base: 'assets/opencad/viewer-nc',
      alt: 'OpenCAD NC 뷰어로 예제 G-code를 연 화면. 가운데에 바깥 윤곽, 원형 포켓, 드릴 구멍의 공구 경로가 공구마다 다른 색으로 보이고, 오른쪽 패널에 재생 막대와 G-code 줄 목록이 있습니다.',
      caption: '예제 G-code를 연 화면',
    },
    features: [
      { label: '형식', text: 'ISO, Fanuc, Haas, Siemens, LinuxCNC, GRBL, Mach3 계열 G-code, Heidenhain 평문과 DIN/ISO, woodWOP MPR, WangShi PGI, KDT XML' },
      { label: '경로', text: '3D 공구 경로와 코드 줄 연결, 공구별 표시, 가공 순서 재생, 한 이동씩 넘기기, 코드 찾기' },
      { label: '정보', text: '이송·급속 이동 길이, 예상 시간, 절삭 범위와 가장 깊은 Z, 고른 줄의 이송·주축·보정 상태, 판재 가공 파일의 작업과 변수' },
      { label: '경고', text: '공구 번호와 다른 H·D 번호, 주축이 멈춘 채 절삭, 가장 깊은 절삭보다 낮은 급속 같은 줄을 경고하고, 누르면 그 줄로 이동' },
      { label: '보기', text: '회전·확대, 표준 뷰, 단면, 두 점 측정과 PNG 저장' },
      { label: '모바일', text: '보기·측정·재생 단추만 한 줄에 두고, 측정 막대와 길게 눌러 정밀 조준으로 공구 경로 위 두 점 거리를 확인. 홈 화면에 추가하면 인터넷 없이도 열림' },
    ],
    steps: ['NC 뷰어를 열고 「예제 열기」로 합성 G-code를 확인합니다.', 'NC 파일(G-code, Heidenhain, MPR, PGI, XML)을 열거나 창 안으로 끌어다 놓습니다. 부프로그램이 다른 파일에 있으면 함께 고릅니다.', '코드 줄이나 3D 경로를 선택해 해당 이동을 함께 확인합니다.', '공구별 표시와 재생 막대로 가공 순서를 살펴봅니다. 정보 패널의 경고를 누르면 해당 코드 줄로 갑니다.'],
    limitations: ['장비별 매크로·사이클·좌표계는 다르게 해석될 수 있습니다. 지원 방언이어도 모든 명령을 동일하게 재현하는 것은 아닙니다.', 'Okuma OSP 프로그램은 알아보고 좌표계(G15 H)만 읽습니다. CALL, VC 변수 같은 Okuma 고유 문법은 그리지 않고 경고로 알립니다.', 'G53, G28처럼 기계 좌표로 가는 이동은 작업 원점의 기계 위치를 설정에 넣기 전까지 안전 높이로 추정해 점선으로 그립니다.', '공구 경로 시각화와 예상 시간은 실제 장비의 충돌 검사·가공 품질·운전 승인 결과가 아닙니다. 장비 투입 전 원본 CAM과 장비 조건을 별도로 검증하세요.'],
  },
  {
    id: 'viewer3d', path: '/opencad/projects/viewer3d',
    name: 'OpenCAD 3D 뷰어 코어', kind: '개발자를 위한 WebGL2 라이브러리',
    searchTitle: 'WebGL2 3D 뷰어 코어 | OpenCAD 오픈소스 라이브러리',
    extensions: [], source: 'https://github.com/GyuTae-Kim/opencad-viewer3d',
    summary: 'NC·STEP·SKP 뷰어가 함께 사용하는 WebGL2 기반 3D 뷰어 라이브러리입니다. 해석기가 만든 장면을 받아 표시·선택·측정하는 공통 기능을 제공합니다.',
    introduction: '파일을 해석하는 코드와 화면을 그리는 코드를 나눈 OpenCAD의 공통 라이브러리입니다. 삼각형 그물·선분·점으로 구성된 Scene3d 장면을 받아, 각 형식의 뷰어에서 같은 조작과 측정 기능을 쓰게 합니다.',
    features: [
      { label: '표시', text: 'WebGL2, 음영·모서리·와이어프레임·X-ray, 그림자와 안개, 선분·점 그리기' },
      { label: '조작', text: '회전·이동·확대, 터치 조작, 뷰 큐브와 표준 뷰, 바닥을 따라가는 걷기' },
      { label: '선택', text: 'BVH 기반 선택, 그룹별 표시와 강조, 큰 그림 저장' },
      { label: '측정', text: '끝점, 가운데 점, 원 중심에 붙는 두 점 측정과 면 사이 최소 거리' },
      { label: '단면', text: '여러 단면 평면과 잘린 면 채우기, 큰 좌표에서도 떨리지 않는 묶음 원점' },
      { label: '연결', text: 'NC·STEP·SKP 해석기와 공유하는 Scene3d 장면 형식' },
    ],
    steps: ['GitHub에서 설치·사용 예제와 Scene3d 타입을 확인합니다.', 'Viewer3d를 화면 요소에 연결하고 해석한 장면을 setScene으로 전달합니다.', '완성된 사용 예시는 NC·STEP·SKP 뷰어의 예제 열기에서 확인할 수 있습니다.'],
    limitations: ['개발용 라이브러리이며 별도 파일 열기 사이트는 없습니다. 실제 파일 확인은 각 형식의 뷰어를 이용하세요.', '파일 해석 기능은 이 코어에 포함되지 않으며 NC·STEP·SKP 저장소가 각각 담당합니다.'],
  },
];

// Every published app; the 2D CAD comes first, as the first OpenCAD tool.
export const OPENCAD_TOOLS: OpenCadTool[] = OPENCAD_PROJECTS.filter((project) => project.url);
