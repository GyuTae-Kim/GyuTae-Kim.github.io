import type { SiteArticle } from './articles-data';

export const AUDIENCE_COLLECTION = {
  path: '/solutions',
  title: '스케치업·가구 공장·제조업 업무 안내',
  description: '스케치업 가구 설계, 가구 공장의 도면·BOM·CNC 데이터, 제조업 CAD/CAM 자동화를 검토하는 분을 위한 안내입니다. 무료 파일 뷰어와 실제 개발 사례를 업무에 맞게 연결합니다.',
  lead: '파일을 바로 확인하려면 OpenCAD를, 설계와 생산 데이터를 연결하려면 아래 업무 안내를 선택하세요. 각 글에서 필요한 입력 자료, 확인 순서와 공개된 개발 사례를 볼 수 있습니다.',
};

// Each article answers a different workflow question and links to its evidence.
// Free viewers, the team's product and research cases have different scopes.
export const AUDIENCE_ARTICLES: SiteArticle[] = [
  {
    path: '/solutions/sketchup-furniture', category: '가구·제조 업무 안내',
    title: '스케치업 가구 설계와 SKP 뷰어 활용 안내',
    description: '스케치업(SketchUp)으로 가구를 설계하거나 SKP 파일을 확인할 때 필요한 도구를 안내합니다. 무료 SKP 뷰어의 저장 버전·태그·장면 확인과 도면·BOM·제조 데이터 연동 사례를 살펴보세요.',
    lead: '스케치업 파일을 보는 일, 가구 모델을 수정하는 일, 공장에 넘길 데이터를 만드는 일은 필요한 도구가 다릅니다. 현재 하려는 작업부터 고르면 모델 확인과 설계·제조 연동을 구분할 수 있습니다.',
    image: 'assets/og/wedraw-pro.jpg', imageAlt: 'SketchUp 가구 설계·제조 데이터 소프트웨어 개발 노트.',
    actions: [{ path: '/opencad/guides/open-skp', label: 'SKP 파일 열기·지원 버전 확인' }, { path: '/portfolio/wedraw-pro', label: '스케치업 가구 설계·제조 연동 사례' }],
    figure: { src: 'assets/cases/wedraw-pro/hero.webp', alt: '가구빌더로 설계한 데모 주방(몸통 18개)을 SketchUp에서 본 화면', caption: '고객 데이터 대신 데모 주방으로 보여주는 설계 결과입니다. 이 모델에서 도면·BOM·라벨·가공 코드를 생성합니다.', width: 1600, height: 1000 },
    sections: [
      { id: 'choose', title: '파일 보기, 모델링, 제조 연동 중 필요한 작업을 고릅니다', paragraphs: ['받은 SKP 파일의 모양과 구성만 확인하려면 파일 뷰어부터 살펴보세요. 가구의 형상을 새로 만들거나 수정하려면 SketchUp 같은 모델링 도구가 필요합니다. OpenCAD SKP 뷰어는 모델 편집기가 아닙니다.', '도면·BOM·가공 코드를 함께 만들려면 패널, 자재, 하드웨어와 가공 규칙이 설계에 연결돼야 합니다. 이 사이트의 Wedraw Pro 사례는 팀이 개발한 설계·제조 연동 흐름이며, 무료 SKP 뷰어의 기능과는 구분됩니다.'] },
      { id: 'version', title: '무료 SKP 뷰어는 저장 버전부터 확인합니다', paragraphs: ['OpenCAD SKP 뷰어는 SketchUp 6·7·8과 2013~2026에서 저장한 파일을 읽습니다. SketchUp 3~5에서 저장한 아주 옛 파일은 지원하지 않습니다. 지원 버전이어도 일부 객체는 다르게 표시될 수 있으므로, 공개 예제와 내 파일을 차례로 열어 원본 화면과 비교하세요.'], steps: ['SKP 사용 안내에서 지원 버전과 제한을 확인합니다.', '예제 모델을 열어 회전·확대와 태그·장면 전환을 확인합니다.', '내 파일에서 모델 구성과 경고를 보고, 원본 SketchUp 화면과 비교합니다.'] },
      { id: 'design', title: '가구 치수 변경과 제조 출력에 필요한 정보를 연결합니다', paragraphs: ['가구의 너비를 바꾸면 몸통과 도어 등 관련 패널도 의도한 규칙대로 바뀌어야 합니다. 패널 인식 연구 사례에는 패널 역할과 접합 관계를 분석하고 크기·위치 변화를 계산한 과정을 정리했습니다.', '제조 연동 사례에서는 같은 설계에서 도면, BOM, 라벨과 MPR·PGI를 출력합니다. 실제 도입을 검토할 때는 사용하는 SketchUp 버전, 가구 유형, 자재·하드웨어 규칙과 공장의 출력 형식을 함께 확인해야 합니다.'] },
      { id: 'handoff', title: '설계팀과 공장이 같은 예제로 결과를 대조합니다', paragraphs: ['공유 가능한 가구 한 개를 기준으로 모델, 도면, 부품 목록과 기대하는 출력물을 모으세요. 판재 번호·크기·결 방향·가공 면이 서로 연결되는지 확인하면 화면상의 모델과 생산 자료 사이의 차이를 찾기 쉽습니다.', '프로그램 설치·계정·공식 제품 정보는 SketchUp 공식 사이트에서 확인할 수 있습니다. 이 페이지는 김규태의 독립적인 사용·개발 안내입니다.'] },
    ],
    related: [{ path: '/opencad/guides/open-skp', label: 'SKP 파일 열기·지원 버전 확인' }, { path: '/portfolio/panel-classification', label: '가구 패널 인식·치수 변경 연구' }, { path: '/solutions/furniture-manufacturing', label: '가구 공장 도면·BOM·CNC 데이터 안내' }, { path: '/contact', label: '설계·제조 데이터 개발 협업 연락처' }],
    sources: [{ url: 'https://github.com/GyuTae-Kim/opencad-skp#readme', label: '공개 SKP 뷰어의 지원 버전과 사용법' }, { url: 'https://sketchup.trimble.com/en', label: 'SketchUp 공식 제품 안내' }],
  },
  {
    path: '/solutions/furniture-manufacturing', category: '가구·제조 업무 안내',
    title: '가구 공장 도면·BOM·CNC 가공 데이터 연결',
    description: '가구 공장 운영자와 설계·생산 담당자를 위한 도면·부품표(BOM)·라벨·CNC 가공 데이터 안내입니다. 스케치업 설계부터 네스팅, MPR·PGI 출력과 생산 전 검토까지 개발 사례로 확인하세요.',
    lead: '설계 변경을 도면과 부품표에 다시 옮기거나, 판재를 뒤집을 때 가공 면이 달라지는 문제를 다룹니다. 공장의 현재 작업 순서와 자료를 기준으로 자동화할 구간을 정리할 수 있습니다.',
    image: 'assets/og/wedraw-pro.jpg', imageAlt: 'SketchUp 가구 설계·제조 데이터 소프트웨어 개발 노트.',
    actions: [{ path: '/portfolio/wedraw-pro', label: '도면·BOM·가공 코드 출력 사례' }, { path: '/opencad', label: '도면·모델·NC 파일 확인 도구' }],
    figure: { src: 'assets/cases/wedraw-pro/step4.webp', alt: '네스팅 뷰어의 도어 결맞춤 그룹 목록과 원장 위 부품 배치', caption: '원장 위 부품 배치와 도어 결맞춤 그룹을 생산 전에 확인하는 웹 뷰어입니다.', width: 900, height: 675 },
    sections: [
      { id: 'bottleneck', title: '어느 자료를 다시 입력하는지부터 확인합니다', paragraphs: ['견적·발주에서 받은 정보가 설계, 도면, 부품표와 가공 파일에 어떻게 전달되는지 적어 보세요. 같은 크기나 자재를 여러 번 입력하는 구간, 설계가 바뀐 뒤 사람이 다시 고치는 구간이 우선 검토 대상입니다.'], points: ['설계 변경 후 도면과 BOM의 판재 번호·수량이 함께 바뀌는지 확인합니다.', '라벨의 부품 번호가 원장 배치와 가공 파일까지 이어지는지 확인합니다.', '가공 면·회전·뒤집기와 엣지밴드·결 방향을 어떤 기준으로 전달하는지 확인합니다.'] },
      { id: 'workflow', title: '스케치업 설계에서 공장 자료로 이어지는 흐름', paragraphs: ['Wedraw Pro 개발 사례는 가구빌더 설계, 도면·발주, 커넥터 제조 출력과 생산 투입을 연결합니다. 김규태는 팀에서 제조 데이터 출력·생산 투입과 도면·발주 초기 개발을 리딩했습니다.'], steps: ['가구 모델에 자재, 하드웨어와 결 방향을 정합니다.', '같은 설계에서 도면·BOM·라벨·가공 도면·MPR·PGI를 출력합니다.', '네스팅 뷰어와 NC 뷰어에서 배치와 가공 경로를 검토합니다.', '장비 설정, 공구와 작업자 투입 방향을 현장 기준으로 별도 검증합니다.'] },
      { id: 'review', title: 'DWG·DXF 도면과 MPR·NC 가공 파일을 나누어 봅니다', paragraphs: ['OpenCAD DWG·DXF 캐드에서는 도면을 열어 치수와 표시 상태를 확인하고 편집·저장할 수 있습니다. NC 뷰어는 G-code·MPR 등 지원되는 파일의 가공 경로와 해석 경고를 확인하는 도구입니다. 파일 종류에 따라 필요한 뷰어가 다릅니다.', '뷰어에서 경로가 보이는 것만으로 CNC 충돌이나 가공 품질이 검증되지는 않습니다. 공개 제조 데이터 사례에서 확인한 출력·회전 검증 범위와 실제 장비 검증을 구분해 살펴보세요.'] },
      { id: 'prepare', title: '자동화 검토에 필요한 자료를 준비합니다', paragraphs: ['공유 가능한 가구 예제, 현재 쓰는 도면·BOM·라벨, 기대하는 가공 파일을 준비하세요. 자재 두께, 부품 번호, 결·엣지 방향과 앞뒷면 기준을 함께 적으면 자료 간 차이를 비교하기 쉽습니다.', '사용하는 설계 프로그램, 장비·제어기, 파일 형식과 반복되는 수작업을 정리해 개발 협업을 논의할 수 있습니다. 고객 도면이나 기밀 가공 파일은 공개 이슈에 올리지 마세요.'] },
    ],
    related: [{ path: '/portfolio/wedraw-pro', label: '도면·BOM·가공 코드 출력 사례' }, { path: '/notes/furniture-manufacturing-data', label: '판재 회전·뒤집기와 제조 데이터 검증 기록' }, { path: '/opencad/guides/open-dwg-dxf', label: 'DWG·DXF 도면 열기' }, { path: '/opencad/guides/check-nc-toolpath', label: 'NC·G-code·MPR 경로 확인' }, { path: '/contact', label: '설계·제조 데이터 개발 협업 연락처' }],
  },
  {
    path: '/solutions/cad-cam-automation', category: '가구·제조 업무 안내',
    title: '제조업 CAD/CAM 자동화와 도면·3D·NC 검토',
    description: '제조업 운영자와 설계·가공 담당자를 위한 CAD/CAM 자동화 안내입니다. DWG·DXF 도면, STEP·STP 모델, NC 경로의 차이와 3D 가공 특징 인식·Fusion CAM 공정 생성 개발 사례를 확인하세요.',
    lead: '받은 파일을 확인하려는지, 반복 설계나 CAM 공정 생성을 줄이려는지에 따라 출발점이 다릅니다. 파일 검토에는 형식별 무료 뷰어를, 자동화 검토에는 입력·출력과 검증 범위를 보여 주는 개발 사례를 연결했습니다.',
    image: 'assets/og/cad-feature-recognition.jpg', imageAlt: '3D 가공 특징 인식과 Fusion CAM 자동화 개발 노트.',
    actions: [{ path: '/opencad', label: 'DWG·DXF·STEP·STP·NC 뷰어 선택' }, { path: '/portfolio/cad-feature-recognition', label: '3D 형상 인식·Fusion CAM 자동화 사례' }],
    figure: { src: 'assets/cases/feature-cam/step2.webp', alt: '합성 부품 네 개의 면을 포켓·구멍·필렛·챔퍼 등 가공 특징에 따라 색칠한 연구 렌더.', caption: '연구 렌더: 합성 부품의 가공 특징을 면별로 표시한 예입니다. 고객 부품 사진이 아닙니다.', width: 900, height: 675 },
    sections: [
      { id: 'files', title: '도면, 3D 모델, 공구 경로는 서로 다른 자료입니다', paragraphs: ['DWG·DXF는 2D 도면을, STEP·STP는 3D 모델을, NC·G-code는 가공 이동을 확인할 때 살펴봅니다. 파일 확장자만 바꿔서 다른 형식으로 변환할 수는 없습니다. 먼저 파일 종류와 검토 목적을 확인하세요.'], points: ['도면 검토: 단위, 치수, 도면층, 문자와 외부 참조를 확인합니다.', 'STEP·STP 검토: 조립 구성, 표시 상태, 단면과 해석 경고를 확인합니다.', 'NC 검토: 단위, 방언, 공구별 이동과 문제 코드 줄을 확인합니다.'] },
      { id: 'automation', title: '반복되는 입력과 기대하는 출력을 먼저 정합니다', paragraphs: ['가공 특징 인식·Fusion CAM 자동화 사례에서는 STEP 형상과 면의 연결 관계를 분석하고, 인식 결과를 가공 전략과 공정 생성으로 연결했습니다. 연구개발 사례이므로 임의의 부품이나 모든 공장에 바로 적용되는 완제품으로 해석하지 마세요.', '자동화할 구간을 정할 때는 반복 입력, 판단 규칙과 검토해야 할 결과를 분리하세요. 현재 부품과 도면, 사용하는 CAM·제어기, 기대하는 공정과 예외 조건이 있어야 기존 작업과 결과를 비교할 수 있습니다.'] },
      { id: 'validation', title: '형상 확인과 제조 승인에 필요한 검증을 구분합니다', paragraphs: ['모델 표시, 저장된 PMI 치수, 측정값과 공구 경로는 각각 확인하는 대상이 다릅니다. 제조 데이터의 정확성이나 실제 장비의 충돌·가공 품질까지 승인하려면 원본 CAD/CAM, 제어기와 현장 조건에 맞는 검증이 필요합니다.', '공개 사례에는 직접 맡은 개발 역할, 시뮬레이션과 출력 검증 범위를 표시했습니다. 개선률이나 시간 절감 수치는 해당 공정에서 측정한 근거가 있을 때만 판단 기준으로 삼으세요.'] },
      { id: 'start', title: '작은 예제와 기존 결과로 도입 가능성을 비교합니다', paragraphs: ['기밀이 없는 대표 부품 하나와 현재 작업 결과를 준비하세요. 어떤 입력을 바꾸었을 때 도면·공정·NC가 어떻게 달라져야 하는지, 사람이 확인해야 하는 조건은 무엇인지 함께 정리합니다.', '파일을 먼저 열어 보려면 아래 형식별 사용 안내를 선택하세요. 개발 협업을 논의하려면 대상 파일, 반복 작업과 기대 결과를 연락처 페이지의 안내에 맞게 정리해 주세요.'] },
    ],
    related: [{ path: '/opencad/guides/open-dwg-dxf', label: 'DWG·DXF 도면 열기' }, { path: '/opencad/guides/open-step-stp', label: 'STEP·STP 3D 모델 열기' }, { path: '/opencad/guides/check-nc-toolpath', label: 'NC·G-code·MPR 경로 확인' }, { path: '/notes/cad-cam-feature-recognition', label: '형상 인식에서 Fusion CAM으로 연결한 개발 기록' }, { path: '/contact', label: '설계·제조 데이터 개발 협업 연락처' }],
  },
];
