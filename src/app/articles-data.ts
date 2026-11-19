import { GuideDetails, OPENCAD_GUIDE_DETAILS } from './opencad-guide-details';
import { CAD_FORMAT_GUIDE } from './cad-format-data';
import { CASE_STUDIES } from './portfolio-data';

export interface SiteArticle {
  path: string;
  category: 'OpenCAD 사용 안내' | '제조 소프트웨어 개발 노트';
  title: string;
  description: string;
  lead: string;
  image: string;
  imageAlt: string;
  viewer?: { url: string; label: string; sampleUrl?: string };
  actions?: { path: string; label: string }[];
  figure: { src: string; srcset?: string; alt: string; caption: string; width: number; height: number };
  sections: { id: string; title: string; paragraphs: string[]; steps?: string[]; points?: string[]; table?: { caption: string; columns: string[]; rows: string[][] } }[];
  related: { path: string; label: string }[];
  sources?: { url: string; label: string }[];
  guide?: GuideDetails;
}

// Instructions follow the published OpenCAD commands. Development notes interpret
// the existing public cases; they do not introduce new experiments or customer data.
export const SITE_ARTICLES: SiteArticle[] = [
  {
    path: '/opencad/guides/open-dwg-dxf', category: 'OpenCAD 사용 안내',
    title: '무료 웹캐드로 DWG·DXF 도면 열기·편집·저장',
    description: '설치 없는 무료 웹캐드 OpenCAD로 Mac·Windows에서 DWG·DXF 도면을 열고, 새 도면을 그려 편집·저장하는 방법입니다. 지원 버전, 도면층·글꼴 확인과 PDF 출력도 안내합니다.',
    lead: '도면을 확인하거나 새로 그려야 한다면 브라우저에서 OpenCAD를 엽니다. 설치·회원가입 없이 DWG·DXF 파일을 열고 편집·저장할 수 있습니다. 예제 도면으로 조작을 익힌 뒤 내 파일을 여세요.',
    image: 'assets/og/opencad.jpg', imageAlt: 'OpenCAD 무료 DWG·DXF 2D 캐드 사용 안내.',
    viewer: { url: 'https://gyutae-kim.github.io/opencad-dwgdxf/', label: '무료 DWG·DXF 캐드 열기', sampleUrl: 'https://gyutae-kim.github.io/opencad-dwgdxf/?sample' },
    figure: { src: 'assets/opencad/viewer-2d-1440.webp', srcset: 'assets/opencad/viewer-2d-720.webp 720w, assets/opencad/viewer-2d-1440.webp 1440w', alt: 'OpenCAD에서 치수가 표시된 브래킷 예제 도면을 연 실제 화면.', caption: '예제 도면을 연 화면. 위쪽 리본과 아래쪽 명령행에서 기능을 실행합니다.', width: 1440, height: 900 },
    sections: [
      {
        id: 'free-web-cad', title: '도면이 없을 때 무료 웹캐드로 새 도면 만들기',
        paragraphs: ['도면을 보기만 하는 뷰어가 아니라 새 도면을 그리고 2D 편집도 하는 무료캐드입니다. Windows와 macOS의 브라우저에서 쓰고, 편집한 파일은 이 기기에 저장합니다.'],
        steps: ['OpenCAD 시작 화면에서 「새 도면」을 누릅니다. 받은 도면을 고치려면 「파일 열기」에서 DWG·DXF를 선택합니다.', 'LINE으로 선을, CIRCLE로 원을 그립니다. 길이와 좌표의 기준이 되는 도면 단위를 먼저 확인하고, 명령은 Esc로 종료합니다.', '도면층과 치수를 정리하고 필요한 부분을 수정합니다. 원본 파일을 고칠 때는 다른 이름으로 저장해 원본을 보존하세요.', 'DWG 또는 DXF로 저장해 편집 가능한 도면 파일을 내려받습니다. 확인용 문서는 PLOT에서 PDF로 출력합니다.'],
      },
      {
        id: 'mac-windows', title: 'Mac에서 DWG를 열거나 AutoCAD 없이 도면을 보려면',
        paragraphs: [
          'OpenCAD는 별도 CAD 설치나 회원가입 없이 최신 브라우저에서 DWG·DXF 도면을 엽니다. Windows와 macOS에서 JavaScript와 WebGL2를 지원하는 브라우저로 예제를 먼저 확인하세요. 파일 크기와 복잡도에 따라 기기의 메모리와 처리 시간이 달라집니다.',
          'Autodesk DWG TrueView는 Windows용입니다. Mac에서 브라우저 뷰어를 쓸 때는 보기만 하면 되는지, 편집이나 변환까지 필요한지, 파일이 서버에 올라가는지부터 확인하세요.',
        ],
      },
      { id: 'formats', title: '파일 형식과 지원 버전', paragraphs: ['DWG는 CAD 도면을 저장하는 형식이고, DXF는 도면 데이터를 다른 프로그램과 주고받을 때 쓰는 형식입니다. 확장자만 바꿔서는 서로 변환되지 않습니다.', 'OpenCAD는 DWG R13~R2018과 DXF R12~R2018의 ASCII·이진 파일을 읽습니다. 지원 버전이어도 일부 객체, 외부 참조나 글꼴은 원본 프로그램과 다르게 보일 수 있습니다.'] },
      { id: 'open', title: '파일을 열고 화면을 맞추는 순서', paragraphs: ['최신 Chrome, Edge, Firefox, Safari 등 JavaScript와 WebGL2를 지원하는 브라우저를 사용하세요.'], steps: ['아래의 「무료 DWG·DXF 캐드 열기」를 누릅니다. 파일이 없으면 시작 화면의 「예제 도면 열기」로 먼저 둘러봅니다.', '「파일 열기」에서 .dwg 또는 .dxf 파일을 고르거나, 파일을 뷰어 화면에 끌어다 놓습니다.', '도면이 열리면 휠로 확대·축소하고 가운데 버튼을 누른 채 이동합니다. 전체 보기로 도면의 위치를 먼저 확인하세요.', '모형·배치 탭을 바꾸고 도면층의 켜짐·동결 상태를 확인합니다. 객체를 선택하면 특성에 길이·면적 같은 값이 나옵니다.'] },
      { id: 'missing', title: '화면이 비거나 문자와 외부 참조가 빠졌을 때', paragraphs: ['도면 일부가 안 보인다면 전체 보기와 도면층 상태부터 확인하세요. 원본 도면이 별도 DWG·DXF, 이미지, PDF를 참조한다면 그 파일도 필요합니다. 외부 참조 창(XR)에서 폴더나 파일을 골라 연결합니다.', 'SHX 글꼴 때문에 문자가 다르게 보이면 SHXFONTS로 이 컴퓨터의 글꼴 폴더를 고릅니다. 한글 대체 글꼴은 원본 SHX 글꼴과 모양이 조금 다를 수 있습니다.', '계속 열리지 않으면 파일 확장자와 저장 버전, 오류 문구를 확인해 GitHub 이슈에 알려 주세요. 공개 이슈에는 고객 도면이나 기밀 파일 대신 같은 문제가 생기는 작은 예제를 올립니다.'] },
      { id: 'privacy', title: '파일 처리와 사용 범위', paragraphs: ['고른 도면은 이 컴퓨터의 브라우저에서 열고 저장하며, 서버로 올리지 않습니다. 앱과 표시용 글꼴 같은 정적 파일은 웹에서 내려받습니다.', 'OpenCAD는 MIT 라이선스로 공개한 개인 오픈소스 프로젝트입니다. 납품이나 가공에 쓸 도면은 원본 프로그램에서 작업 기준대로 다시 확인하세요.'] },
    ],
    related: [{ path: '/opencad/guides/measure-export', label: '도면 거리·면적 측정과 PDF 출력 방법' }, { path: '/opencad', label: 'OpenCAD 지원 기능과 개발자 소개' }],
    sources: [{ url: 'https://github.com/GyuTae-Kim/opencad-dwgdxf#readme', label: 'OpenCAD 공개 사용 안내와 지원 범위' }, { url: 'https://www.autodesk.com/viewers', label: 'Autodesk 공식 뷰어·운영체제 안내' }],
  },
  {
    path: '/opencad/guides/measure-export', category: 'OpenCAD 사용 안내',
    title: 'DWG·DXF를 PDF로 출력하고 도면 치수 재기',
    description: 'OpenCAD에서 DWG·DXF 도면의 거리와 면적을 측정하고 PDF로 출력하는 방법입니다. DIST·AREA 명령과 객체 스냅으로 재는 법, 단위와 플롯 축척을 확인하는 순서를 설명합니다.',
    lead: '도면의 치수 문자와 실제 형상 크기는 다를 수 있습니다. 객체의 좌표를 기준으로 재고, 도면 단위를 확인한 뒤 출력 축척을 정하는 순서로 작업합니다.',
    image: 'assets/og/opencad.jpg', imageAlt: 'OpenCAD 캐드 도면 측정과 PDF 출력 사용 안내.',
    viewer: { url: 'https://gyutae-kim.github.io/opencad-dwgdxf/', label: '무료 DWG·DXF 캐드 열기', sampleUrl: 'https://gyutae-kim.github.io/opencad-dwgdxf/?sample' },
    figure: { src: 'assets/opencad/viewer-2d-1440.webp', srcset: 'assets/opencad/viewer-2d-720.webp 720w, assets/opencad/viewer-2d-1440.webp 1440w', alt: '치수와 단면이 있는 브래킷 예제 도면을 OpenCAD에서 확인하는 화면.', caption: 'OpenCAD 예제 도면으로 측정과 출력을 먼저 연습합니다.', width: 1440, height: 900 },
    sections: [
      { id: 'units', title: '측정 전에 도면 단위 확인하기', paragraphs: ['DWG·DXF 좌표의 1이 언제나 1mm를 뜻하지는 않습니다. 길이를 알고 있는 부분을 재어 원본 도면의 단위 설정과 맞는지 보세요. 단위 정보가 없거나 잘못된 파일은 측정값만으로 실제 크기를 확정할 수 없습니다.', '치수 문자를 직접 고쳐 적은 도면도 있습니다. 표시 문자만 읽지 말고 실제 형상을 재고, 필요하면 치수 목록에서 표시 문자와 측정값을 나란히 확인하세요.'] },
      { id: 'distance', title: '두 점 사이 거리 재기', paragraphs: ['명령행에 DIST 또는 별칭 DI를 입력하고 Enter를 누르면 두 점의 거리를 잽니다. MEASUREGEOM(별칭 MEA)에서는 거리·반지름·각도·면적 중 하나를 골라 잽니다.'], steps: ['뷰어에서 도면을 열고 측정할 부분을 충분히 확대합니다.', '객체 스냅을 켭니다(F3). 끝점·중간점·중심 등 목적에 맞는 스냅으로 정확한 점을 지정하세요.', 'DIST를 실행하고 첫 번째 점과 두 번째 점을 차례로 선택합니다.', '명령행에 나온 측정값을 읽고 도면 단위와 기준 길이에 맞는지 확인합니다. 진행 중인 명령은 Esc로 끝냅니다.'] },
      { id: 'area', title: '면적과 객체 특성 확인하기', paragraphs: ['AREA 또는 AA를 실행해 명령행 안내에 따라 경계점을 지정하거나 지원되는 객체를 선택합니다. 면적 단위는 도면 단위의 제곱입니다. 좌표 단위가 mm라면 면적은 mm²입니다. 여러 경계를 더하거나 빼려면 추가(A)와 빼기(S)를 쓰고, 도심과 관성 모멘트는 MASSPROP으로 확인합니다.', '닫힌 경계를 재는지, 구멍이나 제외할 영역이 있는지 확인하세요. 열린 선이나 잘못 연결된 경계를 눈대중으로 합쳐 계산하면 원하는 면적과 달라질 수 있습니다. 객체 특성에 표시되는 길이·면적과도 비교합니다.'] },
      { id: 'pdf', title: 'PDF로 출력하고 축척 확인하기', paragraphs: ['PLOT(별칭 PRINT·EXPORTPDF)은 플롯 설정을 열어 PDF로 출력합니다. PDF로 출력해도 편집용 DWG·DXF 파일이 저장되는 것은 아닙니다.'], steps: ['모형 또는 출력할 배치 탭을 선택하고 PLOT을 실행합니다.', '용지 크기, 출력 영역과 축척을 정합니다. 흑백·회색조와 선가중치도 필요한 기준에 맞춥니다.', '미리보기에서 잘린 부분, 문자, 선 두께를 확인한 뒤 PDF를 저장합니다.', '실제 크기로 출력해야 하면 길이를 아는 부분과 용지 크기를 다시 확인합니다. 종이에 인쇄할 때는 PDF 인쇄 창의 「페이지에 맞춤」 설정도 확인하세요.'], points: ['모든 배치를 한 PDF로 묶어 출력할 수도 있습니다.', '수정한 도면을 다른 이름의 DWG·DXF로 저장하면 원본과 비교할 수 있습니다.', '측정값과 PDF만으로 가공 품질이나 장비 투입 안전성을 확인할 수는 없습니다.'] },
    ],
    related: [{ path: '/opencad/guides/open-dwg-dxf', label: 'DWG·DXF 파일 열기와 표시 문제 점검' }, { path: '/opencad', label: 'OpenCAD 지원 기능 전체 보기' }],
    sources: [{ url: 'https://github.com/GyuTae-Kim/opencad-dwgdxf/blob/main/src/app/commands.ts', label: '공개 측정 명령 구현' }, { url: 'https://github.com/GyuTae-Kim/opencad-dwgdxf/blob/main/src/app/plot.ts', label: '공개 플롯·PDF 출력 구현' }],
  },
  {
    path: '/opencad/guides/open-step-stp', category: 'OpenCAD 사용 안내',
    title: '무료 온라인 뷰어로 STEP·STP 파일 열고 치수 재기',
    description: '설치 없이 STEP·STP 3D 파일을 열어 치수와 단면을 보는 방법입니다. 무료 OpenCAD로 조립 구조와 저장된 PMI를 보고 거리를 재며, 화면이 비거나 형상이 빠졌을 때 확인할 것을 설명합니다.',
    lead: 'STEP 파일이 열리지 않거나 화면이 비어 보인다면 파일 형식이 맞는지, 모델이 화면 밖에 있는지, 부품이 숨겨졌는지, 해석에 실패했는지를 하나씩 확인하세요. 먼저 공개 예제를 열어 브라우저에서 3D가 표시되는지 봅니다.',
    image: 'assets/og/opencad.jpg', imageAlt: 'OpenCAD STEP·STP 뷰어의 파일 열기와 표시 문제 점검 안내.',
    viewer: { url: 'https://gyutae-kim.github.io/opencad-step/', label: '무료 STEP·STP 뷰어 열기', sampleUrl: 'https://gyutae-kim.github.io/opencad-step/?sample' },
    figure: { src: 'assets/opencad/viewer-step-1440.webp', srcset: 'assets/opencad/viewer-step-720.webp 720w, assets/opencad/viewer-step-1440.webp 1440w', alt: 'OpenCAD STEP 뷰어에서 받침판·블록·핀·고리로 만든 예제 조립 모델과 제품 나무를 확인하는 화면.', caption: '공개 예제 조립 모델을 연 화면입니다.', width: 1440, height: 900 },
    sections: [
      {
        id: 'measure', title: 'STP와 STEP 차이, 치수 측정과 단면 확인',
        paragraphs: [
          'STP와 STEP은 같은 STEP 형식에 쓰는 확장자입니다. 이름을 바꾸는 대신 원본 CAD의 내보내기 설정과 단위를 확인하세요. 부품을 고른 뒤 거리와 지름을 재고, 단면을 켜서 확인할 곳을 살펴봅니다.',
          '파일에 저장된 PMI 치수와 뷰어에서 형상을 잰 값은 서로 다릅니다. 부피와 질량은 B-rep 곡면을 적분해 구하지만, B-스플라인 면과의 거리와 간섭 검사는 화면용 삼각형으로 계산한 근삿값입니다.',
        ],
      },
      { id: 'formats', title: '확장자와 압축 형식', paragraphs: ['OpenCAD는 STEP Part 21 형식의 .stp·.step·.p21 파일을 읽습니다. AP203·AP214·AP242의 B-rep 형상, 조립, 색과 단위를 다루지만 일부 개체는 원본과 다르게 보일 수 있습니다.', 'gzip(.stp.gz·.stpZ)과 STEP 파일이 들어 있는 ZIP도 지원합니다. STEP-XML(.stpx)은 지원하지 않습니다. 파일 이름의 확장자만 바꿔도 내부 형식이 변환되지는 않습니다.'] },
      { id: 'open', title: '예제 모델과 내 파일 열기', paragraphs: ['최신 브라우저에서 JavaScript와 WebGL2가 동작해야 합니다. 「예제로 먼저 보기」를 누르면 브라우저에서 만든 작은 조립 모델이 열리므로, 내 파일을 고르지 않아도 됩니다.'], steps: ['예제 모델에서 마우스 회전과 확대가 동작하는지 확인합니다.', '「열기」를 누르거나 STEP 파일을 창 안으로 끌어다 놓습니다. 압축 파일이면 압축 해제와 해석이 끝날 때까지 기다립니다.', '오른쪽 제품 나무와 정보 패널에서 부품 수, 단위와 경고를 확인합니다.', '다른 모델을 열면 앞서 연 모델은 닫힙니다. 큰 파일을 읽다가 멈추려면 「취소」나 Esc를 누릅니다.'] },
      { id: 'blank', title: '파일은 열렸는데 화면이 비어 보일 때', paragraphs: ['먼저 「전체 보기」 또는 F를 눌러 모델이 화면 안에 들어오는지 확인하세요. 제품 나무에서 부품을 골라 「고른 부품 보기」로 확인하고, 숨긴 부품과 레이어가 있는지도 살펴봅니다.', '단면을 켰다면 끄고 비교하세요. 와이어프레임 등으로 보기 모드를 바꾸어 선만 있는 형상인지, 면이 있는 모델인지도 확인합니다.', '정보 패널의 경고를 원본 CAD 화면과 비교해 보세요. 예제는 잘 보이는데 특정 파일에서만 형상이 빠진다면 그 파일의 형상이나 개체를 읽지 못했을 수 있습니다.'] },
      { id: 'report', title: '계속 열리지 않을 때 알릴 내용', paragraphs: ['제보할 때 파일 형식, 브라우저, 오류·경고 문구와 원본 프로그램에서는 같은 모델이 잘 보이는지를 적어 주세요. 공개 이슈에는 고객 모델 대신 직접 만든 단순 형상처럼 공유해도 되는 작은 예제를 올립니다.', '파일은 이 브라우저에서 읽고 그립니다. 형상을 보고 거리를 재는 뷰어라서 STEP 파일을 고치거나 다시 저장할 수는 없습니다.'] },
    ],
    related: [{ path: '/opencad/projects/step-viewer', label: 'STEP 뷰어의 지원 범위와 기능' }, { path: '/opencad/guides/open-skp', label: 'SketchUp SKP 파일 열기와 버전 확인' }, { path: '/opencad', label: '파일 형식별 OpenCAD 도구 선택' }],
    sources: [{ url: 'https://github.com/GyuTae-Kim/opencad-step#readme', label: '공개 STEP 뷰어 사용법과 지원 형식' }, { url: 'https://github.com/GyuTae-Kim/opencad-step/blob/main/src/archive.ts', label: '압축 STEP과 STEP-XML 판별 구현' }],
  },
  {
    path: '/opencad/guides/open-skp', category: 'OpenCAD 사용 안내',
    title: '무료 온라인 스케치업 뷰어로 SKP 파일 열기',
    description: 'SketchUp 설치 없이 SKP 파일을 여는 무료 온라인 뷰어입니다. 데스크톱 뷰어 다운로드가 중단된 뒤 쓸 수 있는 방법, 지원 버전, 태그와 장면을 보고 치수를 재는 법을 설명합니다.',
    lead: 'SKP 파일은 저장한 SketchUp 버전과 모델 구성에 따라 표시 결과가 달라질 수 있습니다. 예제 집 모형으로 조작을 익힌 뒤, 내 파일의 저장 버전과 태그, 구성을 확인하세요.',
    image: 'assets/og/opencad.jpg', imageAlt: 'OpenCAD SketchUp SKP 뷰어의 파일 열기와 지원 버전 안내.',
    viewer: { url: 'https://gyutae-kim.github.io/opencad-skp/', label: '무료 SKP 뷰어 열기', sampleUrl: 'https://gyutae-kim.github.io/opencad-skp/?sample' },
    figure: { src: 'assets/opencad/viewer-skp-1440.webp', srcset: 'assets/opencad/viewer-skp-720.webp 720w, assets/opencad/viewer-skp-1440.webp 1440w', alt: 'OpenCAD SketchUp 뷰어에서 빨간 지붕의 예제 집과 나무, 태그·재질 목록을 확인하는 화면.', caption: '브라우저에서 만든 예제 집 모형을 연 화면입니다.', width: 1440, height: 900 },
    sections: [
      {
        id: 'viewer-options', title: 'SketchUp Viewer 다운로드가 중단된 뒤 쓸 방법',
        paragraphs: [
          'SketchUp 공식 안내에 따르면 2025년 4월 22일부터 데스크톱 뷰어의 신규 다운로드가 중단됐습니다. SketchUp이 안내하는 공유 방법과 로컬 파일 뷰어 중 작업에 맞는 쪽을 고르세요.',
        ],
        points: [
          '로컬 SKP 파일 보기: OpenCAD에서 파일을 선택해 태그·장면·치수를 확인합니다. 모델 파일을 서버에 업로드하지 않습니다.',
          '링크로 모델 공유: SketchUp 공식 Trimble Connect·Link Sharing 안내를 확인합니다.',
          '가구 모델 편집: SketchUp 같은 모델링 도구가 필요합니다. OpenCAD SKP 뷰어는 보기 전용입니다.',
        ],
      },
      { id: 'version', title: 'SketchUp 저장 버전 확인', paragraphs: ['현재 OpenCAD SKP 뷰어는 SketchUp 6, 7, 8과 2013~2026에서 저장한 .skp 파일을 엽니다. SketchUp 3~5에서 저장한 아주 오래된 파일은 읽지 못하고, 열면 저장 버전을 알려 줍니다. 확장자만 .skp로 바꾼다고 지원되는 파일이 되지는 않습니다.', 'OpenCAD는 SketchUp 공식 제품이 아닙니다. 지원하지 않는 버전이라면 파일을 보낸 사람에게 SketchUp 6 이상에서 다시 저장해 달라고 요청하세요.'] },
      { id: 'open', title: '예제와 내 모델을 여는 순서', paragraphs: ['「예제로 먼저 보기」에서는 이 브라우저에서 만든 집 모형이 열립니다. 여기서 태그·재질·구성 패널과 전체 보기를 먼저 익힙니다.'], steps: ['「열기」에서 .skp 파일을 선택하거나 창 안에 끌어다 놓습니다.', '모델이 열리면 「전체 보기」 또는 F로 화면에 맞춥니다.', '태그·재질 패널에서 표시 상태를, 구성 패널에서 그룹·컴포넌트 관계를 확인합니다.', '정보 패널에서 저장 버전, 단위, 해석 경고와 일부만 읽혔다는 안내가 있는지 확인합니다.'] },
      { id: 'objects', title: '일부 객체나 재질이 안 보일 때', paragraphs: ['태그와 구성 항목이 꺼져 있는지 먼저 확인하세요. 「숨긴 형상 보기」 설정과 단면 설정도 살펴보고, 선택한 그룹을 확대해 전체 모델과 비교합니다.', '재질은 파일에 든 텍스처 이미지를 읽어 표시하지만, 일부 재질과 객체는 원본과 다르게 보일 수 있으니 원본 프로그램의 같은 장면과 비교해 보세요. 장면 탭을 누르면 그 장면에 저장된 카메라, 숨긴 태그, 단면과 스타일로 바뀝니다.'] },
      { id: 'partial', title: '일부만 읽혔다는 경고가 나온다면', paragraphs: ['끝이 잘렸거나 내부 데이터 길이가 깨진 파일은 읽을 수 있는 부분만 표시합니다. 큰 모델도 처리 한도에 도달하면 안내가 나옵니다. 형상이 보여도 모델 전체를 읽었다는 뜻은 아닙니다.', '새 파일을 열지 못하면 이전 모델이 남아 있을 수 있으니 화면의 문서 이름과 경고를 확인합니다. 원본이 SketchUp에서 제대로 열리는지 파일을 보낸 사람에게 확인하고, 오류를 알릴 때는 저장 버전과 브라우저, 경고 문구, 공유할 수 있는 작은 예제를 보내 주세요.', '모델은 이 기기의 브라우저에서 처리합니다. 공개 이슈에 고객 모델이나 기밀 파일을 첨부하지 마세요.'] },
    ],
    related: [{ path: '/opencad/projects/skp-viewer', label: 'SKP 뷰어 지원 범위와 제한' }, { path: '/opencad/guides/open-step-stp', label: 'STEP·STP 교환 파일 열기와 표시 점검' }, { path: '/opencad', label: '다른 OpenCAD 뷰어 보기' }],
    sources: [{ url: 'https://github.com/GyuTae-Kim/opencad-skp#readme', label: '공개 SKP 뷰어 사용법과 버전·복구 제한' }, { url: 'https://help.sketchup.com/en/accounts-and-administration/end-support-viewer-desktop', label: 'SketchUp 공식 데스크톱 뷰어 지원 종료·공유 대안 안내' }],
  },
  {
    path: '/opencad/guides/check-nc-toolpath', category: 'OpenCAD 사용 안내',
    title: '무료 NC·G-code 뷰어로 공구 경로와 단위 확인하기',
    description: '무료 OpenCAD NC 뷰어에서 G-code와 Heidenhain, 판재 가공 파일(MPR, PGI, XML)의 공구 경로를 확인하는 방법입니다. 예제를 재생하는 법, 코드 줄과 경로를 맞춰 보는 법, 방언과 단위, 해석 경고를 확인하는 순서를 설명합니다.',
    lead: 'NC 파일을 열면 경로 모양과 방언(제어기별 문법), 단위, 해석 경고를 확인하세요. OpenCAD 예제를 먼저 재생해 보면 코드 줄을 골랐을 때 어떤 이동이 표시되는지 알 수 있습니다.',
    image: 'assets/og/opencad.jpg', imageAlt: 'OpenCAD NC·G-code 뷰어의 공구 경로와 해석 결과 점검 안내.',
    viewer: { url: 'https://gyutae-kim.github.io/opencad-nc/', label: '무료 NC·G-code 뷰어 열기', sampleUrl: 'https://gyutae-kim.github.io/opencad-nc/?sample' },
    figure: { src: 'assets/opencad/viewer-nc-1440.webp', srcset: 'assets/opencad/viewer-nc-720.webp 720w, assets/opencad/viewer-nc-1440.webp 1440w', alt: 'OpenCAD NC 뷰어에서 예제 G-code의 윤곽·포켓·드릴 경로와 코드 줄, 재생 막대를 보는 화면.', caption: '공개 예제 G-code를 연 화면입니다.', width: 1440, height: 900 },
    sections: [
      { id: 'formats', title: '파일 형식과 방언', paragraphs: ['G-code, Heidenhain 대화식(.h)과 DIN/ISO(.i), woodWOP MPR(.mpr), WangShi PGI(.pgi), KDT XML(.xml)을 읽어 경로를 표시합니다. G-code는 ISO, Fanuc, Haas, Siemens, LinuxCNC, GRBL, Mach3 계열을 읽지만, 장비마다 다른 명령과 매크로까지 똑같이 해석하지는 못합니다.', 'PGI와 XML은 KDT 같은 판재 가공 장비의 프로그램입니다. MPR과 같은 방식으로 판 크기와 변수, 모든 면의 구멍, 톱 홈, 포켓, 라우팅 경로를 판 위에 그립니다. .xml 파일은 KDT 판재 가공 형식일 때만 엽니다. 다른 XML은 열지 않고 알려 주며, woodWOP MPRX는 MPR로 저장해 열도록 안내합니다.', '확장자만으로는 원본 장비와 방언을 알 수 없습니다. 파일을 연 뒤 정보 패널의 방언과 단위, 해석 경고를 원본 프로그램의 설정과 비교하세요. 뷰어가 Haas나 Siemens 같은 방언, 선반 프로그램으로 판단하면 화면 위쪽 배너로 알려 줍니다. 판단이 틀렸으면 배너나 정보 패널에서 다른 방언을 고르면 그 방언으로 다시 읽습니다.'] },
      { id: 'open', title: '예제로 재생과 코드 줄 연결 익히기', paragraphs: ['「예제로 먼저 보기」를 누르면 이 브라우저에서 만든 예제 G-code가 열립니다. 내 NC 파일을 고르지 않고도 화면 조작을 익힐 수 있습니다.'], steps: ['예제에서 「전체 보기」 또는 F를 눌러 경로를 화면에 맞춥니다.', '코드 줄을 고르면 3D 경로에서 그 이동이, 경로를 고르면 해당 코드 줄이 표시됩니다.', '재생 막대에서 재생·멈춤과 속도를 바꾸고 공구별 경로를 살펴봅니다.', '내 파일을 열고 정보 패널의 단위·방언·경고와 이송·급속 이동 길이를 확인합니다.'] },
      { id: 'unexpected', title: '경로 크기나 모양이 예상과 다를 때', paragraphs: ['먼저 단위와 방언이 원본 설정과 맞는지 봅니다. 전체 보기와 공구별 표시 상태를 확인하고, 이상한 코드 줄을 골라 그 이동이 어디인지 찾아보세요.', '반경 보정 경로, 선반 모드, 회전축 감기는 선택 기능입니다. 프로그램 의도에 맞게 켰는지 확인하세요. 모든 이동에 한꺼번에 적용하므로 원본 동작과 다를 수 있습니다.', '판재 가공 파일에서 빠진 작업이 있다면 꺼진 가공인지, 지원하지 않는 매크로나 요소인지 정보·가공 패널에서 확인합니다. 지원하지 않는 매크로나 요소는 위치만 점으로 표시할 수 있습니다. PGI와 XML에서 값을 읽지 못한 작업은 가공 목록에 「해석 실패」로 남습니다.'] },
      { id: 'limits', title: '경로 화면과 장비 검증의 차이', paragraphs: ['공구 경로 화면과 예상 시간만으로는 충돌, 제어기 동작, 가공 품질을 알 수 없습니다. 장비에 넣기 전에는 원본 CAM과 제어기, 현장 조건으로 따로 검증해야 합니다.', '오류를 알릴 때는 방언, 단위, 문제가 된 줄과 기대한 이동을 적고, 기밀 NC 대신 직접 만든 작은 예제를 보내 주세요. 파일은 이 브라우저에서만 처리하며 이슈에 자동으로 올라가지 않습니다.'] },
    ],
    related: [{ path: '/opencad/projects/nc-viewer', label: 'NC 뷰어 기능과 지원 범위' }, { path: '/opencad/guides/open-step-stp', label: 'STEP 모델을 별도 뷰어에서 확인하기' }, { path: '/notes/cad-cam-feature-recognition', label: 'CAD 형상 인식과 CAM 공정 생성의 개발 경험' }],
    sources: [{ url: 'https://github.com/GyuTae-Kim/opencad-nc#readme', label: '공개 NC 뷰어 사용법·방언·선택 기능' }, { url: 'https://github.com/GyuTae-Kim/opencad-nc/blob/main/src/view/sample.ts', label: '공개 G-code 예제' }],
  },
  {
    path: '/notes/cad-cam-feature-recognition', category: '제조 소프트웨어 개발 노트',
    title: '3D 가공 특징 인식으로 Fusion CAM 공정을 만들며 확인한 것',
    description: '3D CAD 형상 인식에서 Fusion CAM 공정 생성까지 개발하며 확인한 것을 적은 노트입니다. 면 단위 AI 점수와 부품 단위 오류를 함께 본 이유, 가공 전략 설계와 시뮬레이션 결과 확인을 다룹니다.',
    lead: '가공 특징 인식 AI의 평균 점수가 올라도 CAM 공정이 제대로 만들어진다는 보장은 없습니다. 형상을 인식하고, 공정을 만들고, 결과를 검증하는 단계마다 무엇을 확인했는지 적었습니다.',
    image: 'assets/og/cad-feature-recognition.jpg', imageAlt: '3D 가공 특징 인식과 Fusion CAM 자동화 개발 노트.',
    figure: { src: 'assets/cases/feature-cam/step2.webp', alt: '합성 부품 네 개의 면을 포켓·구멍·필렛·챔퍼 등 가공 특징에 따라 색칠한 연구 렌더.', caption: '연구 렌더: 합성 부품의 면을 가공 특징별 색으로 칠했습니다.', width: 900, height: 675 },
    sections: [
      { id: 'geometry', title: 'CAD의 면과 연결 관계를 AI 입력으로 만들기', paragraphs: ['STEP 모델에서 면·엣지와 곡면 종류를 읽고 맞닿은 면의 볼록·오목 관계를 그래프로 표현했습니다. 포켓이나 구멍처럼 여러 면이 모여 만드는 특징은 면 하나의 모양만으로는 알 수 없고, 면끼리 어떻게 붙어 있는지도 알아야 합니다.', '면 하나만 보고는 닫힌 포켓과 열린 포켓을 가르기 어려워, 닫힌 포켓 10개 중 4개를 놓쳤습니다. 면 입력을 5열에서 43열로 늘려 주변 경계와 단면이 열렸는지까지 보게 했고, 닫힌 포켓을 모두 찾았습니다.', 'AI의 기본 면 분류와 형상 조합 분석으로 스톡·블라인드홀·쓰루홀·오픈포켓·클로즈포켓·챔퍼·필렛·카운터보어·카운터싱크의 9종을 식별합니다. 프로젝트 페이지에는 학습에 사용한 실제 STEP 모델 6개의 라벨과 가공 특징별 Fusion 가공 경로가 있습니다.', '직접 맡은 범위는 형상 분석, 학습용 라벨링 프로그램, 가공 특징 인식 AI, 가공 전략 설계와 Fusion 적용입니다. 디지털 트윈(MDT)에서는 협력 기관이 수행한 시뮬레이션의 결과 시각화만 담당했습니다.'] },
      { id: 'evaluation', title: '평균 점수와 부품 단위 오류 함께 보기', paragraphs: ['면 몇 개만 잘못 분류해도 가공 특징의 묶음이 달라집니다. 면 단위 지표와 함께 모든 면을 맞힌 부품 수, 클래스별 오류와 부품 계열별 결과를 확인했습니다. 평균이 좋아졌어도 특정 계열의 오류가 늘어난 후보는 채택하지 않았습니다.', '라벨을 수정해 좋아진 결과와 학습 변경으로 좋아진 결과도 분리했습니다. 입력·증강·라벨을 한꺼번에 바꾸면 어떤 변경이 효과가 있었는지 설명하기 어렵기 때문입니다.', '독립 테스트셋 25부품·1,346면에서 면 정확도 99.33%, Macro F1 99.58%를 확인했습니다.'], points: ['형상 계열을 기준으로 데이터 분할과 평가 범위를 확인합니다.', '학습 때 만든 입력과 추론 입력이 같은 기준인지 확인합니다.', 'STEP을 저장했다 다시 읽어도 라벨이 유지되는지 확인합니다.'] },
      { id: 'cam', title: '인식 결과로 Fusion CAM 작업 만들기', paragraphs: ['인식 결과만으로는 가공 공정이 완성되지 않습니다. 가공 방향, 클램핑, 공정 순서, 공구와 절삭 조건을 정한 뒤 이를 Fusion의 셋업과 공구, 작업으로 만들었습니다.', '앞면 셋업(+Z)에서 외곽 소재 황삭, 홀 드릴링, 내부 다단 포켓 황삭 같은 작업을 만들고, 부품을 뒤집는 두 번째 셋업(−Z)에서 뒷면 상면 황삭, 외곽 황삭, 윤곽 정삭을 이어 갑니다. 조도 목표는 경로 공차와 이송으로 맞춥니다.', '공구만 바꾸면 되는 경우와 작업을 새로 만들어야 하는 경우를 나눴고, 적용과 공구 변경, 오류 복구를 자동 회귀 테스트로 확인했습니다. 한 번 만들어지는지만 보지 않고, 바꾼 뒤에도 같은 결과가 나오는지 봤습니다.'] },
      { id: 'validation', title: '협력 기관의 시뮬레이션 결과로 공정 고치기', paragraphs: ['결과 뷰어에서는 절삭력과 칩 두께를 공정·NC 구간별로 보고, 3D로 설계 모델과 가공 결과를 비교합니다. 공개 예시의 공차 기준은 설계 대비 ±0.15 mm입니다. 가공면 파상도와 형상 오차 맵은 해당 출력이 있는 분석에서만 표시합니다.', 'MDT 결과에서 공구가 올라가는 순간 공구부하가 튀었습니다(칩 두께 1.67 mm). 공구를 안전 높이까지 이송으로 올린 뒤 급속 이동하게 바꿔, 단차 황삭의 공구부하를 8,191 N에서 251 N으로 줄였습니다.', '소재 시뮬레이션과 기준 STEP 비교까지 확인했습니다. 실제 주문 부품으로 한 현장 평가, 조도 실측, 도면 공차 읽기, 실제 CNC 가공 품질 승인은 하지 않았습니다.'] },
    ],
    related: [{ path: '/portfolio/cad-feature-recognition', label: '맡은 역할과 연구 화면, 검증한 내용을 담은 프로젝트 페이지' }, { path: '/notes/furniture-manufacturing-data', label: '가구 설계를 제조 데이터로 바꾸는 개발 노트' }, { path: '/contact', label: 'AI·CAD/CAM 개발자 채용·기술 협업 연락처' }],
  },
  {
    path: '/notes/furniture-manufacturing-data', category: '제조 소프트웨어 개발 노트',
    title: '가구 설계를 공장의 제조 데이터로 바꾸며 부딪힌 문제',
    description: 'SketchUp으로 설계한 가구에서 제조 데이터를 만드는 소프트웨어를 개발하며 부딪힌 문제를 적었습니다. 패널 인식과 크기 변경 규칙, BOM과 가공 데이터의 차이, 판재 회전·뒤집기와 현장 가공 노하우를 다룹니다.',
    lead: 'SketchUp 화면에서는 맞아 보이는 가구도, 판재를 기계에 넣는 방향에 따라 가공 위치가 달라집니다. 가구 패널 인식 연구와 Wedraw Pro 개발에서 설계를 바꿔도 제조 데이터가 맞게 따라오도록 하며 부딪힌 문제를 적었습니다.',
    image: 'assets/og/wedraw-pro.jpg', imageAlt: 'SketchUp 가구 설계와 제조 데이터 소프트웨어 개발 노트.',
    figure: { src: 'assets/cases/wedraw-pro/step4.webp', alt: '네스팅 뷰어의 도어 결맞춤 그룹 목록과 원장 위 부품 배치', caption: '원장 위 부품 배치와 도어 결맞춤 그룹을 생산 전에 확인하는 웹 뷰어입니다.', width: 900, height: 675 },
    sections: [
      { id: 'panels', title: '패널의 형상과 역할 나눠 보기', paragraphs: ['가구 패널 인식 연구에서는 패널과 접합면을 분석하고, AI로 측판·지판·천판 등 15종 패널을 인식해 크기 변경 규칙을 계산했습니다. 비슷한 직육면체여도 어느 방향으로 놓이고 다른 패널과 어떻게 맞닿는지에 따라 역할과 변경 규칙이 달라집니다.', '이 연구는 팀 프로젝트였습니다. 패널과 접합면 분석, AI 연구, 계수식 계산을 맡았고, 가구 규칙은 팀과 함께 정리했습니다.'] },
      { id: 'rules', title: '역할 인식과 치수 변경 규칙 따로 확인하기', paragraphs: ['너비나 높이를 바꾸면 어떤 패널을 늘리고 어떤 위치를 옮길지 계산해야 합니다. 형상에서 역할을 찾는 단계와 치수 변경에 따른 규칙을 계산하는 단계를 나누면, 잘못된 결과가 인식 문제인지 규칙 문제인지 구분됩니다.', '설계 파라미터는 너비·깊이·높이, 걸레받이, 찬넬, 코너장 멍판, 선반, 도어 여유 등 13개입니다. 패널마다 위치와 크기를 선형회귀 계수식으로 맞추고, 바뀌지 않아야 할 값은 계수를 0으로 고정했습니다. 브라우저에서는 이 계수식만 계산하므로 고객이 웹에서 치수를 바꾸고 그 사양으로 발주할 수 있습니다. 파라미터를 바꾼 뒤 하부 코너장 등에서 패널 위치가 맞는지는 회귀 테스트로 확인했습니다.'] },
      { id: 'bill-of-materials', title: 'BOM(부품표)과 CNC 가공 데이터의 차이', paragraphs: ['BOM(부품표)은 어떤 부품이 몇 개 필요한지 정리하는 목록입니다. 판재의 크기·수량·재료를 확인하는 일과 CNC 장비에 넣을 가공 위치·방향·코드를 만드는 일은 다릅니다.', 'Wedraw Pro에서는 같은 SketchUp 설계에서 BOM·라벨·가공 도면·가공 코드(MPR·PGI)를 함께 출력합니다. BOM만으로는 가공 위치와 판재 투입 방향을 알 수 없어, 판재의 회전·뒤집기·엣지밴드를 가공 파일과 라벨에도 반영했습니다.'] },
      { id: 'production', title: '현장 가공 노하우를 출력 규칙에 담기', paragraphs: ['Wedraw Pro는 SketchUp으로 설계한 가구를 도면과 발주, 제조 데이터, 생산 투입까지 이어 주는 제품으로, 팀과 함께 개발했습니다. 그중 제조 데이터 출력과 생산 투입을 리딩했고, 도면·발주는 초기 개발을 리딩했습니다.', '판재를 회전하거나 뒤집으면 가공 위치뿐 아니라 엣지밴드와 결 방향도 따라가야 합니다. 네스팅기 기준과 스키퍼 기준의 가공 파일을 나누고, 라벨에 뒤집기 표시와 투입 화살표를 넣어 작업자가 어느 방향으로 넣을지 알 수 있게 했습니다.', '도어 결맞춤을 하려면 한 가구의 도어를 한 원장에서 정면 순서대로 잘라야 하는데, 가공 파일만으로는 어떤 도어끼리 한 그룹인지 알 수 없습니다. 도어 결맞춤 그룹과 정면 위치(A-1, A-2…)를 가공 파일에 실었습니다. 원장보다 큰 그룹은 원장에 맞게 나눕니다.', '경첩 컵 구멍은 도어 뒷면에 내야 하는데 스키퍼의 도어컵 공구는 위쪽에만 있습니다. 그래서 도어 가공 전체를 좌우와 가공 면까지 뒤집고, 작업자는 라벨 표시대로 도어를 뒤집어 넣게 했습니다. 화면 안의 좌표 변환만 보면 놓치기 쉽고, 현장에서 판을 넣는 방향까지 따져야 보이는 문제입니다.', '측판 찬넬(손잡이 홈)을 한 번에 관통하면 공구가 빠져나가는 쪽 엣지밴드가 깨질 수 있습니다. 엣지밴드 파손이 가장 적은 시험 가공 방식을 가공 전략에 녹여냈습니다.'], points: ['BOM·라벨·가공 도면·MPR·PGI를 같은 설계에서 출력합니다.', '실제 설계 데이터(가구 5개, 판재 66장)로 출력 결과와 따로 계산한 회전 결과를 비교했습니다.', '출력 파일과 뒤집기 표시로 가공 위치를 되살리고 설계와 대조했습니다.', '도어 결맞춤 그룹 편집 8가지를 설계 데이터부터 가공 파일까지 따라가며 대조했습니다.', '생성한 가공 파일을 다시 읽어 도어컵과 찬넬의 가공 면, 깊이, 순서를 확인했습니다.'] },
      { id: 'operations', title: '운영 중 서버 상태와 업무 완료 함께 확인하기', paragraphs: ['설계·제조 서비스에서는 서버가 정상으로 응답해도 송장 전송 같은 업무가 실패할 수 있습니다. 감시를 켠 뒤, 주문 하나가 6주 동안 송장 전체 전송 때마다 실패하던 것을 찾아 고쳤습니다. 운영 감시 프로젝트에서는 서버 상태와 함께 업무 결과, API 오류, 사용자 PC 프로그램 오류를 모아 원인을 찾았습니다.', '이 글의 패널 인식 연구, Wedraw Pro 개발, 서비스 운영 감시는 서로 다른 프로젝트입니다.'] },
    ],
    related: [{ path: '/portfolio/panel-classification', label: '가구 패널 역할 인식과 파라메트릭 설계 연구' }, { path: '/portfolio/wedraw-pro', label: 'Wedraw Pro 개발 역할과 실제 화면' }, { path: '/portfolio/service-monitoring', label: '제조 소프트웨어 서비스 운영 감시 프로젝트' }, { path: '/contact', label: '제조 소프트웨어 개발·채용·협업 연락처' }],
  },
  CAD_FORMAT_GUIDE,
].map(article => ({
  ...article,
  guide: OPENCAD_GUIDE_DETAILS[article.path.split('/').pop()!],
  related: [
    ...article.related,
    ...(article.category === 'OpenCAD 사용 안내' && article.path !== CAD_FORMAT_GUIDE.path ? [{ path: CAD_FORMAT_GUIDE.path, label: CAD_FORMAT_GUIDE.title }] : []),
    ...(article.category === 'OpenCAD 사용 안내' ? [guideProject(article.path)] : []),
  ],
})) as SiteArticle[];

// Search visits mostly arrive on the OpenCAD guides, so each guide also links the developer's closest project page.
function guideProject(path: string): { path: string; label: string } {
  const project = CASE_STUDIES.find((item) => item.id === (path === '/opencad/guides/open-skp' ? 'wedraw-pro' : 'cad-feature-recognition'))!;
  return { path: `/portfolio/${project.id}`, label: project.title };
}
