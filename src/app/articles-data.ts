import { GuideDetails, OPENCAD_GUIDE_DETAILS } from './opencad-guide-details';
import { AUDIENCE_ARTICLES } from './audience-data';
import { CAD_FORMAT_GUIDE } from './cad-format-data';

export interface SiteArticle {
  path: string;
  category: 'OpenCAD 사용 안내' | '제조 소프트웨어 개발 노트' | '가구·제조 업무 안내';
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
    title: 'DWG·DXF 파일을 무료 캐드 뷰어로 여는 방법',
    description: '설치·회원가입 없이 OpenCAD에서 DWG·DXF 도면을 여는 방법입니다. 지원 버전, 파일 열기, 도면층과 글꼴 확인, 열리지 않는 파일을 점검하는 순서를 안내합니다.',
    lead: '도면을 전달받았지만 CAD 프로그램이 없을 때, 브라우저에서 OpenCAD를 열어 내용을 확인할 수 있습니다. 먼저 예제 도면으로 화면 조작을 익힌 뒤 실제 파일을 여세요.',
    image: 'assets/og/opencad.jpg', imageAlt: 'OpenCAD 무료 DWG·DXF 2D 캐드 사용 안내.',
    viewer: { url: 'https://gyutae-kim.github.io/opencad-dwgdxf/', label: '무료 DWG·DXF 캐드 열기', sampleUrl: 'https://gyutae-kim.github.io/opencad-dwgdxf/?sample' },
    figure: { src: 'assets/opencad/viewer-2d-1440.webp', srcset: 'assets/opencad/viewer-2d-720.webp 720w, assets/opencad/viewer-2d-1440.webp 1440w', alt: 'OpenCAD에서 치수가 표시된 브래킷 예제 도면을 연 실제 화면.', caption: '예제 도면을 연 실제 화면. 위쪽 리본과 아래쪽 명령행에서 기능을 실행합니다.', width: 1440, height: 900 },
    sections: [
      { id: 'formats', title: '먼저 파일 형식과 지원 버전을 확인합니다', paragraphs: ['DWG는 CAD 도면을 저장하는 형식이고, DXF는 도면 데이터를 다른 프로그램과 주고받을 때 쓰는 형식입니다. 확장자만 바꿔서는 서로 변환되지 않습니다.', 'OpenCAD는 DWG R13~R2018과 DXF R12~R2018의 ASCII·이진 파일을 읽습니다. 지원 버전이어도 일부 객체, 외부 참조나 글꼴은 원본 프로그램과 다르게 보일 수 있습니다.'] },
      { id: 'open', title: '파일을 열고 화면을 맞추는 순서', paragraphs: ['최신 Chrome, Edge, Firefox, Safari 등 JavaScript와 WebGL2를 지원하는 브라우저를 사용하세요.'], steps: ['아래의 「무료 DWG·DXF 캐드 열기」를 누릅니다. 파일이 없으면 시작 화면의 「예제 도면 열기」로 먼저 둘러봅니다.', '「파일 열기」에서 .dwg 또는 .dxf 파일을 고르거나, 파일을 뷰어 화면에 끌어다 놓습니다.', '도면이 열리면 휠로 확대·축소하고 가운데 버튼을 누른 채 이동합니다. 전체 보기로 도면의 위치를 먼저 확인하세요.', '모형·배치 탭을 바꾸고 도면층의 켜짐·동결 상태를 확인합니다. 객체를 선택하면 특성에서 길이·면적 등 관련 값을 볼 수 있습니다.'] },
      { id: 'missing', title: '빈 화면, 빠진 문자와 외부 참조를 점검합니다', paragraphs: ['도면 일부가 안 보인다면 전체 보기와 도면층 상태부터 확인하세요. 원본 도면이 별도 DWG·DXF, 이미지, PDF를 참조한다면 그 파일도 필요합니다. 외부 참조 창(XR)에서 폴더나 파일을 골라 연결할 수 있습니다.', 'SHX 글꼴 때문에 문자가 다르게 보일 때는 SHXFONTS로 이 컴퓨터의 글꼴 폴더를 선택할 수 있습니다. 한글 대체 글꼴과 원본 SHX 글꼴의 표시가 완전히 같지는 않을 수 있습니다.', '계속 열리지 않으면 파일 확장자와 저장 버전, 오류 문구를 확인해 GitHub 이슈에 알려 주세요. 공개 이슈에 고객 도면이나 기밀 파일을 첨부하지 말고, 공유 가능한 최소 예제로 재현해 주세요.'] },
      { id: 'privacy', title: '파일 처리와 사용 범위', paragraphs: ['선택한 도면의 읽기·표시·저장은 이 컴퓨터의 브라우저에서 처리하며 도면 파일을 서버에 업로드하지 않습니다. 앱과 표시용 글꼴 같은 정적 자료는 웹에서 내려받습니다.', 'OpenCAD는 김규태의 MIT 라이선스 개인 오픈소스 프로젝트입니다. 중요한 납품이나 가공에 사용할 도면은 원본 프로그램 및 작업 기준과 대조해 확인하세요.'] },
    ],
    related: [{ path: '/opencad/guides/measure-export', label: '도면 거리·면적 측정과 PDF 출력 방법' }, { path: '/opencad', label: 'OpenCAD 지원 기능과 개발자 소개' }],
    sources: [{ url: 'https://github.com/GyuTae-Kim/opencad-dwgdxf#readme', label: 'OpenCAD 공개 사용 안내와 지원 범위' }],
  },
  {
    path: '/opencad/guides/measure-export', category: 'OpenCAD 사용 안내',
    title: '캐드 도면 거리·면적 측정과 PDF 출력 방법',
    description: 'OpenCAD에서 DWG·DXF 도면의 거리와 면적을 측정하고 PDF로 출력하는 방법입니다. DIST·AREA 명령, 객체 스냅, 단위 확인과 플롯 축척 점검을 안내합니다.',
    lead: '도면의 치수 문자와 실제 형상 크기는 다를 수 있습니다. 객체의 좌표를 기준으로 재고, 도면 단위를 확인한 뒤 출력 축척을 정하는 순서로 작업합니다.',
    image: 'assets/og/opencad.jpg', imageAlt: 'OpenCAD 캐드 도면 측정과 PDF 출력 사용 안내.',
    viewer: { url: 'https://gyutae-kim.github.io/opencad-dwgdxf/', label: '무료 DWG·DXF 캐드 열기', sampleUrl: 'https://gyutae-kim.github.io/opencad-dwgdxf/?sample' },
    figure: { src: 'assets/opencad/viewer-2d-1440.webp', srcset: 'assets/opencad/viewer-2d-720.webp 720w, assets/opencad/viewer-2d-1440.webp 1440w', alt: '치수와 단면이 있는 브래킷 예제 도면을 OpenCAD에서 확인하는 화면.', caption: 'OpenCAD의 예제 도면으로 측정과 출력을 먼저 연습할 수 있습니다.', width: 1440, height: 900 },
    sections: [
      { id: 'units', title: '측정 전에 도면 단위를 확인합니다', paragraphs: ['DWG·DXF 좌표의 1이 언제나 1mm를 뜻하는 것은 아닙니다. 원본 도면의 단위 설정과 알고 있는 기준 길이를 대조하세요. 단위 정보가 없거나 잘못된 파일은 측정값만으로 실제 크기를 확정할 수 없습니다.', '치수 문자가 수동으로 바뀐 도면도 있습니다. 표시 문자만 읽기보다 실제 형상을 측정하고, 필요하면 치수 목록에서 표시 문자와 실제 측정값을 나란히 확인하세요.'] },
      { id: 'distance', title: '두 점 사이의 거리를 잽니다', paragraphs: ['명령행에 DIST 또는 별칭 DI를 입력하고 Enter를 누르면 두 점의 거리를 잴 수 있습니다. MEASUREGEOM(별칭 MEA)에서도 거리·반지름·각도·면적을 선택할 수 있습니다.'], steps: ['뷰어에서 도면을 열고 측정할 부분을 충분히 확대합니다.', '객체 스냅을 켭니다(F3). 끝점·중간점·중심 등 목적에 맞는 스냅으로 정확한 점을 지정하세요.', 'DIST를 실행하고 첫 번째 점과 두 번째 점을 차례로 선택합니다.', '명령행에 나온 측정값을 읽고 도면 단위와 기준 길이에 맞는지 확인합니다. Esc로 진행 중인 명령을 종료할 수 있습니다.'] },
      { id: 'area', title: '면적과 객체 특성을 확인합니다', paragraphs: ['AREA 또는 AA를 실행해 명령행 안내에 따라 경계점을 지정하거나 지원되는 객체를 선택합니다. 면적은 도면 단위의 제곱으로 해석해야 합니다. 예를 들어 좌표 단위가 mm라면 면적의 단위는 mm²입니다. 여러 경계를 더하거나 빼려면 추가(A)와 빼기(S)를 쓰고, 도심과 관성 모멘트는 MASSPROP으로 확인합니다.', '닫힌 경계를 재는지, 구멍이나 제외할 영역이 있는지 확인하세요. 열린 선이나 잘못 연결된 경계를 눈대중으로 합쳐 계산하면 원하는 면적과 달라질 수 있습니다. 객체 특성에 표시되는 길이·면적도 함께 비교할 수 있습니다.'] },
      { id: 'pdf', title: 'PDF로 출력하고 축척을 확인합니다', paragraphs: ['PLOT(별칭 PRINT·EXPORTPDF)은 플롯 설정을 열어 PDF로 출력합니다. 출력은 도면을 PDF로 표현하는 작업이며, DWG·DXF 원본 편집 데이터의 저장과는 구분됩니다.'], steps: ['모형 또는 출력할 배치 탭을 선택하고 PLOT을 실행합니다.', '용지 크기, 출력 영역과 축척을 정합니다. 흑백·회색조와 선가중치도 필요한 기준에 맞춥니다.', '미리보기에서 잘린 부분, 문자, 선 두께를 확인한 뒤 PDF를 저장합니다.', '실제 크기가 필요한 출력은 알려진 길이와 용지 크기를 다시 확인합니다. 종이 인쇄 시 PDF 인쇄 창의 「페이지에 맞춤」 설정도 점검하세요.'], points: ['모든 배치를 한 PDF로 내보내는 기능도 지원합니다.', '수정한 도면은 다른 이름으로 DWG·DXF 저장해 원본과 비교할 수 있습니다.', '측정과 화면 출력만으로 실제 가공 품질이나 장비 투입 안전성이 확인되는 것은 아닙니다.'] },
    ],
    related: [{ path: '/opencad/guides/open-dwg-dxf', label: 'DWG·DXF 파일 열기와 표시 문제 점검' }, { path: '/opencad', label: 'OpenCAD 지원 기능 전체 보기' }],
    sources: [{ url: 'https://github.com/GyuTae-Kim/opencad-dwgdxf/blob/main/src/app/commands.ts', label: '공개 측정 명령 구현' }, { url: 'https://github.com/GyuTae-Kim/opencad-dwgdxf/blob/main/src/app/plot.ts', label: '공개 플롯·PDF 출력 구현' }],
  },
  {
    path: '/opencad/guides/open-step-stp', category: 'OpenCAD 사용 안내',
    title: 'STEP·STP 파일 열기와 빈 화면·누락 형상 점검 방법',
    description: '무료 OpenCAD STEP 뷰어에서 STP·STEP 파일을 여는 방법입니다. 예제 조립 모델, 압축 파일 지원, 전체 보기·부품 표시와 해석 경고를 확인하는 순서를 안내합니다.',
    lead: 'STEP 파일이 열리지 않거나 화면이 비어 보인다면 파일 형식, 화면 위치, 부품 표시와 해석 결과를 나누어 확인하세요. 먼저 공개 예제를 열어 브라우저에서 3D가 표시되는지 확인할 수 있습니다.',
    image: 'assets/og/opencad.jpg', imageAlt: 'OpenCAD STEP·STP 뷰어의 파일 열기와 표시 문제 점검 안내.',
    viewer: { url: 'https://gyutae-kim.github.io/opencad-step/', label: '무료 STEP·STP 뷰어 열기', sampleUrl: 'https://gyutae-kim.github.io/opencad-step/?sample' },
    figure: { src: 'assets/opencad/viewer-step-1440.webp', srcset: 'assets/opencad/viewer-step-720.webp 720w, assets/opencad/viewer-step-1440.webp 1440w', alt: 'OpenCAD STEP 뷰어에서 받침판·블록·핀·고리로 만든 예제 조립 모델과 제품 나무를 확인하는 화면.', caption: '공개 예제를 연 실제 화면입니다. 고객 모델이나 특정 CAD 파일의 호환성을 보장하는 예시는 아닙니다.', width: 1440, height: 900 },
    sections: [
      { id: 'formats', title: '확장자와 압축 형식을 먼저 확인합니다', paragraphs: ['OpenCAD는 STEP Part 21 형식의 .stp·.step·.p21 파일을 읽습니다. AP203·AP214·AP242의 B-rep 형상, 조립, 색과 단위를 다루지만 모든 개체가 원본과 똑같이 표시되는 것은 아닙니다.', 'gzip(.stp.gz·.stpZ)과 STEP 파일이 들어 있는 ZIP도 지원합니다. STEP-XML(.stpx)은 지원하지 않습니다. 파일 이름의 확장자만 바꿔도 내부 형식이 변환되지는 않습니다.'] },
      { id: 'open', title: '예제 모델과 실제 파일을 차례로 엽니다', paragraphs: ['최신 브라우저에서 JavaScript와 WebGL2가 동작해야 합니다. 「예제로 먼저 보기」는 브라우저에서 만드는 작은 조립 모델을 열며, 개인 파일을 선택할 필요가 없습니다.'], steps: ['예제 모델에서 마우스 회전과 확대가 동작하는지 확인합니다.', '「열기」를 누르거나 STEP 파일을 창 안으로 끌어다 놓습니다. 압축 파일이면 압축 해제와 해석이 끝날 때까지 기다립니다.', '오른쪽 제품 나무와 정보 패널에서 부품 수, 단위와 경고를 확인합니다.', '모델을 바꿔 열면 이전 문서가 교체됩니다. 큰 파일을 읽는 중에는 「취소」 또는 Esc로 중지할 수 있습니다.'] },
      { id: 'blank', title: '파일은 열렸는데 화면이 비어 보일 때', paragraphs: ['먼저 「전체 보기」 또는 F를 눌러 모델이 화면 안에 들어오는지 확인하세요. 제품 나무에서 부품을 골라 「고른 부품 보기」로 확인하고, 숨긴 부품과 레이어가 있는지도 살펴봅니다.', '단면을 켰다면 끄고 비교하세요. 와이어프레임 등 보기 모드를 바꾸어 선만 있는 형상인지, 면이 있는 모델인지도 확인할 수 있습니다.', '정보 패널의 경고와 원본 CAD의 표시를 대조하세요. 예제는 정상인데 특정 파일만 누락된다면 해당 파일의 형상·개체 해석 문제일 수 있습니다. 지원 AP 이름만으로 완전한 호환성을 판단하지 마세요.'] },
      { id: 'report', title: '계속 열리지 않으면 오류와 최소 예제를 남깁니다', paragraphs: ['파일 형식, 브라우저, 표시된 오류·경고, 원본 프로그램에서 같은 모델이 보이는지를 정리하면 재현에 도움이 됩니다. 공개 이슈에는 고객 모델 대신 직접 만든 단순 형상 등 공유 가능한 최소 예제를 사용하세요.', '파일은 이 브라우저에서 읽고 그립니다. 이 도구는 형상 확인과 거리 측정을 위한 뷰어이며 STEP 편집·재저장이나 제조 품질 승인을 대신하지 않습니다.'] },
    ],
    related: [{ path: '/opencad/projects/step-viewer', label: 'STEP 뷰어의 지원 범위와 기능' }, { path: '/opencad/guides/open-skp', label: 'SketchUp SKP 파일 열기와 버전 확인' }, { path: '/opencad', label: '파일 형식별 OpenCAD 도구 선택' }],
    sources: [{ url: 'https://github.com/GyuTae-Kim/opencad-step#readme', label: '공개 STEP 뷰어 사용법과 지원 형식' }, { url: 'https://github.com/GyuTae-Kim/opencad-step/blob/main/src/archive.ts', label: '압축 STEP과 STEP-XML 판별 구현' }],
  },
  {
    path: '/opencad/guides/open-skp', category: 'OpenCAD 사용 안내',
    title: '스케치업 SKP 파일 무료로 열기와 버전·누락 객체 점검',
    description: '무료 OpenCAD SKP 뷰어로 스케치업(SketchUp) 파일을 여는 방법입니다. 지원 저장 버전, 태그·구성·재질 확인과 일부만 읽힌 모델의 경고를 점검합니다.',
    lead: 'SKP 파일은 저장한 SketchUp 버전과 모델 구성에 따라 표시 결과가 달라질 수 있습니다. 예제 집 모형으로 화면 조작을 확인한 뒤 실제 파일의 버전과 태그·구성을 점검하세요.',
    image: 'assets/og/opencad.jpg', imageAlt: 'OpenCAD SketchUp SKP 뷰어의 파일 열기와 지원 버전 안내.',
    viewer: { url: 'https://gyutae-kim.github.io/opencad-skp/', label: '무료 SKP 뷰어 열기', sampleUrl: 'https://gyutae-kim.github.io/opencad-skp/?sample' },
    figure: { src: 'assets/opencad/viewer-skp-1440.webp', srcset: 'assets/opencad/viewer-skp-720.webp 720w, assets/opencad/viewer-skp-1440.webp 1440w', alt: 'OpenCAD SketchUp 뷰어에서 빨간 지붕의 예제 집과 나무, 태그·재질 목록을 확인하는 화면.', caption: '브라우저에서 만든 예제 집 모형의 실제 화면입니다. 사용자 파일을 서버에 올려 만든 이미지가 아닙니다.', width: 1440, height: 900 },
    sections: [
      { id: 'version', title: 'SketchUp 저장 버전을 확인합니다', paragraphs: ['현재 OpenCAD SKP 뷰어는 SketchUp 6, 7, 8과 2013~2026에서 저장한 .skp 파일을 엽니다. SketchUp 3~5에서 저장한 아주 옛 파일은 읽지 못하고, 열면 저장 버전을 알려 줍니다. 확장자만 .skp로 바꾸어도 지원되는 파일로 변환되지 않습니다.', 'OpenCAD는 SketchUp의 공식 제품이 아니며 SKP 편집·재저장 기능을 제공하지 않습니다. 지원하지 않는 버전이라면 SketchUp 6 이상에서 다시 저장해 달라고 파일 제공자에게 요청하세요.'] },
      { id: 'open', title: '예제와 내 모델을 여는 순서', paragraphs: ['「예제로 먼저 보기」에서는 이 브라우저에서 만든 집 모형이 열립니다. 태그·재질·구성 패널과 전체 보기를 먼저 익힐 수 있습니다.'], steps: ['「열기」에서 .skp 파일을 선택하거나 창 안에 끌어다 놓습니다.', '모델이 열리면 「전체 보기」 또는 F로 화면에 맞춥니다.', '태그·재질 패널에서 표시 상태를, 구성 패널에서 그룹·컴포넌트 관계를 확인합니다.', '정보 패널에서 저장 버전, 단위, 해석 경고와 일부만 읽혔다는 안내가 있는지 확인합니다.'] },
      { id: 'objects', title: '일부 객체나 재질이 안 보일 때', paragraphs: ['태그와 구성 항목이 꺼져 있는지 먼저 확인하세요. 「숨긴 형상 보기」 설정과 단면 설정도 살펴보고, 선택한 그룹을 확대해 전체 모델과 비교합니다.', '파일 안 무늬 그림을 읽어 재질을 표시하지만 모든 재질·객체가 원본과 같지는 않을 수 있습니다. 원본 프로그램의 같은 장면과 대조하세요. 장면 탭을 누르면 그 장면에 저장된 카메라, 숨긴 태그, 단면과 스타일로 바뀝니다.'] },
      { id: 'partial', title: '일부만 읽혔다는 경고가 나온다면', paragraphs: ['끝이 잘렸거나 내부 데이터 길이가 깨진 파일은 읽을 수 있는 부분만 표시할 수 있습니다. 큰 모델도 처리 한도에 도달하면 안내가 나옵니다. 화면에 형상이 보인다는 사실만으로 모델 전체를 읽었다고 판단하지 마세요.', '새 파일을 열지 못하면 기존 모델이 남을 수 있으므로 화면의 문서 이름과 경고를 함께 확인하세요. 파일 제공자에게 원본이 정상적으로 열리는지 확인하고, 오류를 제보할 때는 버전·브라우저·경고와 공유 가능한 최소 예제를 정리합니다.', '모델은 이 기기의 브라우저에서 처리합니다. 공개 이슈에 고객 모델이나 기밀 파일을 첨부하지 마세요.'] },
    ],
    related: [{ path: '/opencad/projects/skp-viewer', label: 'SKP 뷰어 지원 범위와 제한' }, { path: '/opencad/guides/open-step-stp', label: 'STEP·STP 교환 파일 열기와 표시 점검' }, { path: '/opencad', label: '다른 OpenCAD 뷰어 보기' }],
    sources: [{ url: 'https://github.com/GyuTae-Kim/opencad-skp#readme', label: '공개 SKP 뷰어 사용법과 버전·복구 제한' }],
  },
  {
    path: '/opencad/guides/check-nc-toolpath', category: 'OpenCAD 사용 안내',
    title: 'NC·G-code 공구 경로 보기와 단위·해석 경고 점검',
    description: '무료 OpenCAD NC 뷰어에서 G-code와 Heidenhain, 판재 가공 파일(MPR, PGI, XML)의 공구 경로를 확인하는 방법입니다. 예제 재생, 코드 줄 연결, 방언·단위와 해석 경고를 점검합니다.',
    lead: 'NC 파일을 열었다면 화면의 경로뿐 아니라 방언, 단위와 해석 경고를 함께 확인하세요. OpenCAD의 합성 예제를 먼저 재생하면 코드 줄과 공구 이동을 연결해 살펴보는 방법을 익힐 수 있습니다.',
    image: 'assets/og/opencad.jpg', imageAlt: 'OpenCAD NC·G-code 뷰어의 공구 경로와 해석 결과 점검 안내.',
    viewer: { url: 'https://gyutae-kim.github.io/opencad-nc/', label: '무료 NC·G-code 뷰어 열기', sampleUrl: 'https://gyutae-kim.github.io/opencad-nc/?sample' },
    figure: { src: 'assets/opencad/viewer-nc-1440.webp', srcset: 'assets/opencad/viewer-nc-720.webp 720w, assets/opencad/viewer-nc-1440.webp 1440w', alt: 'OpenCAD NC 뷰어에서 합성 G-code의 윤곽·포켓·드릴 경로와 코드 줄, 재생 막대를 보는 화면.', caption: '공개 합성 G-code를 연 실제 화면입니다. 실제 장비에서 검증한 가공 프로그램이 아닙니다.', width: 1440, height: 900 },
    sections: [
      { id: 'formats', title: '파일 형식과 방언을 확인합니다', paragraphs: ['G-code, Heidenhain 평문(.h)과 DIN/ISO(.i), woodWOP MPR(.mpr), WangShi PGI(.pgi), KDT XML(.xml)을 읽어 경로를 표시합니다. G-code는 ISO, Fanuc, Haas, Siemens, LinuxCNC, GRBL, Mach3 계열을 대상으로 하지만 장비별 명령·매크로를 모두 같은 의미로 해석하는 것은 아닙니다.', 'PGI와 XML은 KDT 같은 판재 가공 장비의 프로그램입니다. MPR과 같은 방식으로 판 크기와 변수, 모든 면의 구멍, 톱 홈, 포켓, 라우팅 경로를 판 위에 그립니다. .xml 파일은 KDT 판재 가공 형식일 때만 엽니다. 다른 XML은 열지 않고 알려 주며, woodWOP MPRX는 MPR로 저장해 열도록 안내합니다.', '확장자만으로 원본 장비와 방언이 확정되지는 않습니다. 파일을 연 뒤 정보 패널의 방언과 단위, 해석 경고를 원본 프로그램의 설정과 비교하세요. 뷰어가 Haas나 Siemens 같은 방언, 선반 프로그램으로 판단하면 화면 위 띠로 알려 주고, 판단이 틀렸으면 띠나 정보 패널에서 바로 바꿔 다시 읽을 수 있습니다.'] },
      { id: 'open', title: '예제로 재생과 코드 줄 연결을 익힙니다', paragraphs: ['「예제로 먼저 보기」는 이 브라우저에서 만든 합성 G-code를 엽니다. 개인 NC 파일을 고르지 않고 화면 조작을 확인할 수 있습니다.'], steps: ['예제에서 「전체 보기」 또는 F를 눌러 경로를 화면에 맞춥니다.', '코드 줄이나 3D 경로를 선택해 서로 연결되는 이동을 확인합니다.', '재생 막대에서 재생·멈춤과 속도를 바꾸고 공구별 경로를 살펴봅니다.', '내 파일을 열고 정보 패널의 단위·방언·경고와 이송·급속 이동 길이를 확인합니다.'] },
      { id: 'unexpected', title: '경로 크기나 모양이 예상과 다를 때', paragraphs: ['먼저 단위와 방언이 원본 설정과 맞는지 확인합니다. 전체 보기와 공구별 표시 상태를 확인하고, 문제의 코드 줄을 선택해 해당 이동을 짚으세요.', '반경 보정 경로·선반 모드·회전축 감기는 선택 기능입니다. 해당 프로그램의 의도에 맞게 설정했는지 확인하고, 모든 이동에 일괄 적용한 결과로 원본과 같다고 판단하지 마세요.', '판재 가공 파일에서 빠진 작업이 있다면 꺼진 가공인지, 지원하지 않는 매크로나 요소인지 정보·가공 패널에서 확인합니다. 지원하지 않는 매크로나 요소는 위치만 점으로 표시할 수 있습니다. PGI와 XML에서 값을 읽지 못한 작업은 가공 목록에 「해석 실패」로 남습니다.'] },
      { id: 'limits', title: '해석 결과와 실제 장비 검증을 구분합니다', paragraphs: ['공구 경로 화면과 예상 시간은 실제 장비의 충돌 검사, 제어기 동작, 가공 품질이나 운전 승인 결과가 아닙니다. 장비 투입은 원본 CAM·제어기와 현장 조건을 기준으로 별도 검증해야 합니다.', '오류를 제보할 때는 방언·단위·문제 줄과 기대한 이동을 정리하고, 기밀 NC 대신 직접 만든 최소 예제를 사용하세요. 파일은 이 브라우저에서 처리하며 공개 이슈에 자동 업로드되지 않습니다.'] },
    ],
    related: [{ path: '/opencad/projects/nc-viewer', label: 'NC 뷰어 기능과 지원 범위' }, { path: '/opencad/guides/open-step-stp', label: 'STEP 모델을 별도 뷰어에서 확인하기' }, { path: '/notes/cad-cam-feature-recognition', label: 'CAD 형상 인식과 CAM 공정 생성의 개발 경험' }],
    sources: [{ url: 'https://github.com/GyuTae-Kim/opencad-nc#readme', label: '공개 NC 뷰어 사용법·방언·선택 기능' }, { url: 'https://github.com/GyuTae-Kim/opencad-nc/blob/main/src/view/sample.ts', label: '공개 합성 G-code 예제' }],
  },
  {
    path: '/notes/cad-cam-feature-recognition', category: '제조 소프트웨어 개발 노트',
    title: '3D 가공 특징 인식을 Fusion CAM 자동화로 연결할 때 확인한 것',
    description: '3D CAD 형상 인식에서 Fusion CAM 공정 생성까지 이어지는 개발 노트입니다. 면 단위 AI 점수와 부품 단위 오류, 가공 전략 설계, 시뮬레이션 검증의 역할을 정리합니다.',
    lead: '가공 특징 인식 AI의 평균 점수가 좋아져도 CAM 공정이 올바르게 만들어진다는 보장은 없습니다. 기존 연구개발 사례를 바탕으로 형상 인식, 공정 생성, 결과 검증 사이에서 무엇을 확인했는지 정리합니다.',
    image: 'assets/og/cad-feature-recognition.jpg', imageAlt: '3D 가공 특징 인식과 Fusion CAM 자동화 개발 노트.',
    figure: { src: 'assets/cases/feature-cam/step2.webp', alt: '합성 부품 네 개의 면을 포켓·구멍·필렛·챔퍼 등 가공 특징에 따라 색칠한 연구 렌더.', caption: '연구 렌더: 합성 부품의 가공 특징을 면별로 표시한 예입니다. 고객 부품 사진이 아닙니다.', width: 900, height: 675 },
    sections: [
      { id: 'geometry', title: 'CAD의 면과 연결 관계를 AI 입력으로 만듭니다', paragraphs: ['STEP 모델에서 면·엣지와 곡면 종류를 읽고 맞닿은 면의 볼록·오목 관계를 그래프로 표현했습니다. 포켓이나 구멍처럼 여러 면이 함께 만드는 특징을 다루려면 개별 면의 모양뿐 아니라 연결 관계도 필요합니다.', '직접 맡은 범위는 형상 분석, 학습용 라벨링 프로그램, 가공 특징 인식 AI, 가공 전략 설계와 Fusion 적용입니다. 디지털 트윈(MDT)에서는 협력 기관이 수행한 시뮬레이션의 결과 시각화만 담당했습니다.'] },
      { id: 'evaluation', title: '평균 점수와 부품 전체의 오류를 함께 봅니다', paragraphs: ['면 몇 개만 잘못 분류해도 가공 특징의 묶음이 달라집니다. 면 단위 지표와 함께 모든 면을 맞힌 부품 수, 클래스별 오류와 부품 계열별 결과를 확인했습니다. 평균이 좋아졌어도 특정 계열의 오류가 늘어난 후보는 채택하지 않았습니다.', '라벨을 수정해 좋아진 결과와 학습 변경으로 좋아진 결과도 분리했습니다. 입력·증강·라벨을 한꺼번에 바꾸면 어떤 변경이 효과가 있었는지 설명하기 어렵기 때문입니다.'], points: ['형상 계열을 기준으로 데이터 분할과 평가 범위를 확인합니다.', '학습 때 만든 입력과 추론 입력이 같은 기준인지 확인합니다.', 'STEP을 저장했다 다시 읽어도 라벨이 유지되는지 확인합니다.'] },
      { id: 'cam', title: '인식 결과를 실행 가능한 CAM 작업으로 연결합니다', paragraphs: ['인식 결과만으로는 가공 공정이 완성되지 않습니다. 가공 방향, 클램핑, 공정 순서, 공구와 절삭 조건을 정한 뒤 Fusion의 셋업·공구·작업으로 연결했습니다.', '공구만 바꾸면 되는 경우와 작업을 새로 만들어야 하는 경우를 나눴고, 적용·공구 변경·오류 복구를 자동 회귀 테스트로 확인했습니다. 생성 성공뿐 아니라 변경 후에도 결과가 일관되는지 보는 과정입니다.'] },
      { id: 'validation', title: '협력 기관의 시뮬레이션 결과를 시각화합니다', paragraphs: ['AI의 기본 면 분류와 형상 조합 분석으로 스톡·블라인드홀·쓰루홀·오픈포켓·클로즈포켓·챔퍼·필렛·카운터보어·카운터싱크의 9종을 식별합니다. 전체 사례에는 실제 학습용 STEP 모델 6개의 라벨과 피쳐별 Fusion 가공 경로를 소개합니다.', '디지털 트윈 시뮬레이션은 협력 기관이 수행했으며, 본인은 결과 뷰어의 시각화만 담당했습니다. 이 화면에서 절삭력·칩 두께를 공정과 NC 구간별로 살펴보고, 3D에서 설계 모델과 가공 결과를 비교할 수 있습니다. 공개 예시의 설계 대비 공차 기준은 ±0.15mm입니다. 가공면 파상도·형상 오차 맵은 해당 출력을 포함한 분석에서 표시합니다.', '소재 시뮬레이션과 기준 STEP 비교까지 확인했습니다. 새 부품의 독립 평가, 실측 조도, 도면 공차 읽기와 실제 CNC 가공 품질 승인은 검증 범위에 포함하지 않았습니다.'] },
    ],
    related: [{ path: '/portfolio/cad-feature-recognition', label: '담당 역할·연구 화면·검증 범위를 담은 전체 사례' }, { path: '/notes/furniture-manufacturing-data', label: '가구 설계를 제조 데이터로 연결하는 개발 노트' }, { path: '/contact', label: 'AI·CAD/CAM 개발자 채용·기술 협업 연락처' }],
  },
  {
    path: '/notes/furniture-manufacturing-data', category: '제조 소프트웨어 개발 노트',
    title: '가구 설계를 제조 데이터로 연결하는 소프트웨어 개발',
    description: 'SketchUp 가구 설계와 제조 데이터 개발 경험을 정리한 기술 노트입니다. 패널 역할 인식, 파라메트릭 규칙, 도면·발주·생산 투입 단계와 검증 범위를 설명합니다.',
    lead: '가구 모델을 화면에 그리는 일과 실제 제조에 필요한 데이터를 만드는 일은 연결되어 있습니다. 패널 인식 연구와 Wedraw Pro 개발 사례를 바탕으로 설계 변경이 제조 단계까지 이어질 때 고려한 문제를 정리합니다.',
    image: 'assets/og/wedraw-pro.jpg', imageAlt: 'SketchUp 가구 설계와 제조 데이터 소프트웨어 개발 노트.',
    figure: { src: 'assets/og/wedraw-pro.jpg', alt: '가구 설계부터 제조 데이터까지 이어지는 Wedraw Pro 프로젝트 표지.', caption: '관련 프로젝트: SketchUp 기반 가구 설계와 제조 데이터 개발.', width: 1200, height: 630 },
    sections: [
      { id: 'panels', title: '패널의 형상과 역할을 나누어 봅니다', paragraphs: ['가구 패널 인식 연구에서는 패널과 접합면을 분석하고 AI로 패널 역할을 인식해 크기 변경 규칙을 계산했습니다. 비슷한 직육면체여도 어느 방향으로 놓이고 다른 패널과 어떻게 맞닿는지에 따라 역할과 변경 규칙이 달라질 수 있습니다.', '해당 연구는 팀 프로젝트입니다. 직접 맡은 범위는 패널·접합면 분석, AI 연구와 계수식 계산이며, 전체 제품을 혼자 개발했다는 의미는 아닙니다.'] },
      { id: 'rules', title: '파라메트릭 설계는 변경 규칙을 전달하는 일입니다', paragraphs: ['너비나 높이를 바꾸면 어떤 패널을 늘리고 어떤 위치를 옮길지 계산해야 합니다. 형상에서 역할을 찾는 단계와 치수 변경에 따른 규칙을 계산하는 단계를 나누면, 잘못된 결과가 인식 문제인지 규칙 문제인지 살펴볼 수 있습니다.', '이 과정에서 중요한 것은 그럴듯한 화면 한 장보다 입력 형상, 접합 관계, 계산된 규칙과 변경 결과를 연결해 설명할 수 있는가입니다. 상세 연구 화면과 확인한 범위는 패널 인식 사례에 정리했습니다.'] },
      { id: 'production', title: '판재 회전과 실제 투입 방향을 출력 규칙에 담습니다', paragraphs: ['Wedraw Pro에서는 SketchUp 가구 설계에서 도면·발주·제조 데이터와 생산 투입으로 이어지는 흐름을 개발했습니다. 직접 리딩한 범위는 제조 데이터 출력과 생산 투입이며, 도면·발주 초기 개발도 리딩했습니다.', '판재를 회전하거나 뒤집으면 가공 위치뿐 아니라 엣지밴드와 결 방향도 함께 따라가야 합니다. 네스팅기 기준과 스키퍼 기준의 가공 파일을 나누고, 라벨에 뒤집기 표시와 투입 화살표를 넣어 작업자가 어느 방향으로 넣을지 알 수 있게 했습니다.', '도어컵을 뒷면에 가공해야 하는데 공구가 위쪽에 있는 경우에는 도어의 좌우와 가공 면을 함께 뒤집는 규칙이 필요했습니다. 화면의 좌표 변환과 현장의 투입 방향을 따로 설명하면 놓치기 쉬운 문제입니다.'], points: ['BOM·라벨·가공 도면·MPR·PGI를 같은 설계에서 출력합니다.', '공개 사례의 실제 설계 데이터인 가구 5개·판재 66장에 대해 출력과 별도 계산한 회전 결과를 비교했습니다.', '출력 파일과 뒤집기 표시로 가공 위치를 되살리고 설계와 대조했습니다.', '이 검증에 현장 기계 설정·작업자 투입·실제 CNC 가공은 포함하지 않았습니다.'] },
      { id: 'operations', title: '운영에서는 서버 상태와 업무 완료를 함께 확인합니다', paragraphs: ['설계·제조와 연결되는 서비스에서는 서버가 응답하더라도 송장 전송처럼 실제 업무가 실패할 수 있습니다. 운영 감시 사례에서는 서버 상태에 더해 업무 결과, API 오류와 사용자 PC 프로그램의 오류를 모아 원인을 확인했습니다.', '여기서 정리한 연구·제품 개발·서비스 운영은 서로 다른 사례입니다. 각 사례의 역할과 증거를 연결해 두었으며, 화면이나 자동 검사 통과를 현장 제조 품질의 최종 승인으로 표현하지 않았습니다.'] },
    ],
    related: [{ path: '/portfolio/panel-classification', label: '가구 패널 역할 인식과 파라메트릭 설계 연구' }, { path: '/portfolio/wedraw-pro', label: 'Wedraw Pro 개발 역할과 실제 화면' }, { path: '/portfolio/service-monitoring', label: '제조 소프트웨어 서비스 운영 감시 사례' }, { path: '/contact', label: '제조 소프트웨어 개발·채용·협업 연락처' }],
  },
  ...AUDIENCE_ARTICLES,
  CAD_FORMAT_GUIDE,
].map(article => ({
  ...article,
  guide: OPENCAD_GUIDE_DETAILS[article.path.split('/').pop()!],
  related: article.path === CAD_FORMAT_GUIDE.path ? article.related : [
    ...article.related,
    ...(article.category === 'OpenCAD 사용 안내' || article.category === '가구·제조 업무 안내'
      ? [{ path: CAD_FORMAT_GUIDE.path, label: CAD_FORMAT_GUIDE.title }] : []),
    ...(article.viewer ? [{ path: article.path.endsWith('open-skp') ? '/solutions/sketchup-furniture' : article.path.endsWith('open-step-stp') ? '/solutions/cad-cam-automation' : '/solutions/furniture-manufacturing', label: '파일 확인 다음 단계: 설계·제조 업무 안내' }] : []),
  ],
})) as SiteArticle[];
