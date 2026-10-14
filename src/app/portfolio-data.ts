export interface CaseStudy {
  id: string;
  number: string;
  // First-screen summary: one result line, the key judgement and a one-line scope.
  // The long problem/approach/validation text stays behind 「자세히」 on the case page.
  headline: string;
  keyDecision: string;
  scopeLine: string;
  // 2–3 numbers taken from the product screens and renders shown on the page.
  stats: { value: string; label: string }[];
  role: string;
  // 「자세히」 content, kept to short lines: problems met and how they were solved,
  // what was checked, what stays out of scope, and where the case was written from.
  fixes: { problem: string; fix: string }[];
  checked: string[];
  unchecked: string[];
  source: string;
  // Only research that genuinely led into this project.
  relatedResearch?: { id: string; title: string; connection: string }[];
  category: string;
  title: string;
  subtitle: string;
  period: string;
  tags: string[];
  diagramLabels: string[];
  story: CaseStep[];
  figure: CaseFigure;
  gallery?: { title: string; caption: string; legend: { label: string; color: string }[]; pairs: CaseFigure[][] };
}

// figure.kind: 'research' = rendered from the actual research data, 'product' = a real product
// screen on non-customer data, 'concept' = synthetic illustration.
export interface CaseFigure {
  src: string;
  alt: string;
  caption: string;
  kind: 'research' | 'product' | 'concept';
}

export const FIGURE_KIND_LABELS: Record<CaseFigure['kind'], string> = {
  research: '연구 렌더',
  product: '제품 화면',
  concept: '개념도',
};

// One step of the project story; owner says who did it (me / led by me / team / partner institution).
export interface CaseStep {
  title: string;
  text: string;
  owner: 'me' | 'lead' | 'team' | 'partner';
  // Replaces the default owner label, e.g. 「초기 개발 리딩」.
  ownerLabel?: string;
  // What he built in this step, one short line each (「자세히」 step grid).
  did: string[];
  didNote?: string;
  image?: string;
  // still: shown instead of an animated image to readers who prefer reduced motion
  still?: string;
  imageAlt?: string;
}

export const OWNER_LABELS: Record<CaseStep['owner'], string> = {
  me: '직접',
  lead: '리딩',
  team: '팀과 함께',
  partner: '협력 기관',
};

export function stepOwnerLabel(step: CaseStep): string {
  return step.ownerLabel ?? OWNER_LABELS[step.owner];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'cad-feature-recognition',
    number: '01',
    headline: '3D 모델에서 가공 특징을 찾아 Fusion CAM 공정까지 이어 줍니다',
    keyDecision:
      '평균 지표가 좋아져도 부품 계열별 오류가 늘어난 인식 후보는 채택하지 않았습니다.',
    scopeLine: '검증은 Fusion·MDT 시뮬레이션까지 · 실제 가공 품질 승인 아님',
    stats: [
      { value: '22개', label: '부품 하나에 자동 생성한 공정' },
      { value: '±0.15 mm', label: 'MDT 시뮬레이션에서 이를 넘는 과삭 없음' },
      { value: '1건', label: '라벨링 프로그램 등록 신청 접수' },
    ],
    role: '형상 분석부터 가공 전략 설계와 Fusion 적용까지 직접 연구개발했습니다. 디지털 트윈(MDT) 시뮬레이션은 협력 기관이 맡았습니다.',
    fixes: [
      {
        problem: '면 몇 개만 틀려도 가공 특징 묶음이 달라집니다.',
        fix: '면 단위 점수와 함께 모든 면을 맞힌 부품 수도 셌습니다.',
      },
      {
        problem: '점수가 바뀐 이유가 라벨 수정인지 학습인지 섞여 있었습니다.',
        fix: '라벨을 고쳐서 바뀐 점수와 학습으로 바뀐 점수를 따로 계산했습니다.',
      },
      {
        problem: '인식 결과가 Fusion의 셋업, 공구, 작업과 맞물려야 공정이 됩니다.',
        fix: '공구만 바꾸면 되는 경우와 작업을 새로 만들어야 하는 경우를 나눴습니다.',
      },
    ],
    checked: [
      'STEP으로 저장했다 다시 읽어도 라벨 유지',
      '계열별 분할과 학습, 추론 입력 일치',
      '평균 지표, 클래스별 오류, 전부 맞은 부품 수',
      'Fusion 자동 회귀 테스트 (적용, 공구 변경, 오류 복구)',
      '소재 시뮬레이션과 기준 STEP 비교',
    ],
    unchecked: [
      '새 부품으로 한 독립 평가',
      '실측 조도 (목표값으로 경로 공차와 이송만 조정)',
      '도면 공차 읽기',
      '실제 CNC 가공 품질 승인',
    ],
    source: '기술 문서와 코드 변경 이력으로 정리했습니다.',
    category: 'AI · CAD/CAM · BlueChain 애드인',
    title: '3D 모델을 읽고 가공 전략까지 설계하는 AI',
    subtitle: '형상 분석 → AI 피처 인식 → 가공 전략 설계 → 디지털 트윈 검증으로 이어지는 Fusion CAM 자동화',
    period: '2025–2026',
    tags: ['Python', 'OpenCascade', 'TensorFlow', 'Autodesk Fusion API', 'CAM'],
    story: [
      {
        title: '형상 분석',
        text: '3D 모델(STEP)의 면과 엣지를 읽어 곡면 종류와 볼록·오목 연결 같은 관계를 그래프로 만듭니다.',
        owner: 'me',
        did: ['STEP의 면, 엣지, 곡면 종류 추출', '맞닿은 면의 볼록, 오목 관계를 그래프로', '면과 삼각면을 묶은 계층 그래프 입력'],
        image: 'assets/cases/feature-cam/step1.webp',
        imageAlt: '합성 부품의 면 인접 그래프. 면마다 노드를 두고 맞닿은 면끼리 선으로 이었습니다.',
      },
      {
        title: 'AI 피처 인식',
        text: '면마다 기하 정보를 벡터로 바꿔 그래프 신경망에 넣고, 포켓·구멍·필렛 같은 가공 특징을 찾습니다.',
        owner: 'me',
        did: [
          '학습 데이터를 만드는 라벨링 프로그램',
          '형상 계열 기준 데이터 분할',
          '포켓, 필렛, 챔퍼가 헷갈리는 합성 형상',
          '입력, 증강, 라벨 변경별 영향 비교',
        ],
        image: 'assets/cases/feature-cam/step2.webp',
        imageAlt: '합성 부품 네 개의 면을 가공 특징별로 색칠한 렌더. 포켓·구멍은 파랑, 필렛은 주황, 모따기는 보라입니다.',
      },
      {
        title: '가공 전략 설계',
        text: '가공 방향, 클램핑, 공정 순서, 공구, 절삭 조건을 정하고 조도 목표에 맞춰 경로 공차를 조정해 Fusion CAM 공정으로 만듭니다.',
        owner: 'me',
        did: [
          '면 예측을 가공 특징 그룹으로 정리',
          '가공 방향, 셋업, 공정 순서, 공구, 절삭 조건 결정',
          '조도 목표에 맞춘 경로 공차와 이송',
          'Fusion API로 셋업과 공정 생성',
          '공구를 바꾸거나 적용이 실패해도 기존 작업 유지',
        ],
        image: 'assets/cases/feature-cam/step3.webp',
        imageAlt: '22개 공정 중 외곽 황삭, 드릴, 개방 포켓, 윤곽 정삭 단계의 Fusion 소재 시뮬레이션',
      },
      {
        title: '디지털 트윈 검증',
        text: '설계한 공정을 협력 기관의 디지털 트윈(MDT)에 넘겨 절삭력과 가공 결과를 시뮬레이션으로 검증합니다.',
        owner: 'partner',
        did: ['MDT로 넘기는 데이터와 사전 검사', '절삭력, 설계 대비 편차를 보는 화면'],
        didNote: '시뮬레이션은 협력 기관이 맡았습니다.',
        image: 'assets/cases/feature-cam/step4.webp',
        imageAlt: 'MDT 결과로 그린 설계 대비 편차 3D 지도. ±0.15 mm를 넘는 과삭이 없습니다.',
      },
    ],
    diagramLabels: ['형상 분석', 'AI 피처 인식', '가공 전략', 'MDT 검증'],
    figure: {
      src: 'assets/cases/feature-cam/hero.webp',
      alt: 'Fusion 소재 시뮬레이션. 자동으로 만든 공정으로 302 변형 부품을 깎은 결과가 모두 허용 오차 안(초록)에 있습니다.',
      caption: '자동으로 만든 공정으로 표준시편(302 변형)을 깎은 Fusion 소재 시뮬레이션. 초록은 허용 오차 안입니다.',
      kind: 'product',
    },
    gallery: {
      title: '구분할 부분만 바꾼 합성 형상 쌍',
      caption: '구분할 부분만 바꾼 합성 형상 쌍. STEP으로 다시 읽어도 라벨이 그대로인지 확인했습니다.',
      // Face colours sampled from the renders.
      legend: [
        { label: '구멍, 포켓', color: '#3378ab' },
        { label: '챔퍼', color: '#9762ad' },
        { label: '필렛', color: '#f27421' },
        { label: '소재', color: '#b7c1c9' },
      ],
      pairs: [
        [
          { src: 'assets/research/feature-pairs/pocket-closed.webp', alt: '닫힌 포켓 합성 형상', caption: '닫힌 포켓', kind: 'research' },
          { src: 'assets/research/feature-pairs/pocket-open.webp', alt: '열린 포켓 합성 형상', caption: '열린 포켓', kind: 'research' },
        ],
        [
          { src: 'assets/research/feature-pairs/hole-blind.webp', alt: '막힌 구멍 합성 형상', caption: '막힌 구멍', kind: 'research' },
          { src: 'assets/research/feature-pairs/hole-stock-boss.webp', alt: '같은 위치에 소재로 남긴 돌출 보스 합성 형상', caption: '돌출 보스 · 소재', kind: 'research' },
        ],
        [
          { src: 'assets/research/feature-pairs/chamfer-chamfer.webp', alt: '모서리 챔퍼 합성 형상', caption: '챔퍼', kind: 'research' },
          { src: 'assets/research/feature-pairs/chamfer-stock-ledge.webp', alt: '같은 위치에 소재 턱을 둔 합성 형상', caption: '소재 턱', kind: 'research' },
        ],
      ],
    },
  },
  {
    id: 'panel-classification',
    number: '02',
    headline: '가구 크기를 바꾸면 패널이 함께 움직이고 제조 데이터가 나옵니다',
    keyDecision:
      '규칙 시뮬레이션을 매번 돌리지 않고, 규칙으로 만든 샘플을 선형회귀로 맞춰 계수식만으로 패널을 움직이게 했습니다.',
    scopeLine: '사내 가구 데이터로 한 연구 · 정확도 수치는 원본 결과 파일이 없어 생략',
    stats: [
      { value: '15종', label: '인식하는 패널 역할' },
      { value: '계수식', label: '크기를 바꿀 때 시뮬레이션 없이 패널 이동' },
      { value: '1건', label: '공동발명 특허 출원' },
    ],
    role: '팀 프로젝트입니다. 가구 설계 지식은 팀과 함께 정리했고, 판재 분석과 패널 인식, 수식화 연구는 직접 진행했습니다.',
    fixes: [
      {
        problem: '크기와 모양이 비슷해도 판재마다 가구 안에서 맡는 역할이 다릅니다.',
        fix: '판재가 어디에 어떻게 맞닿는지를 그래프로 넣어 역할을 인식했습니다.',
      },
      {
        problem: '비슷한 변형 가구가 학습과 평가에 섞이면 점수를 믿기 어렵습니다.',
        fix: '원본 이름으로 형상 계열을 묶어 같은 분할에 넣었습니다.',
      },
      {
        problem: '바뀌지 않아야 할 값까지 회귀식이 건드릴 수 있습니다.',
        fix: '값이 변하지 않는 출력은 계수를 0으로 고정했습니다.',
      },
    ],
    checked: [
      '형상 계열별 교차검증',
      '특징군을 빼 가며 비교한 실험',
      '좌표축을 바꾼 입력의 스트레스 평가',
      '판재 단위 지표',
      '파라미터를 바꾼 뒤 패널 위치 회귀 테스트 (하부 코너장 등)',
    ],
    unchecked: [
      '정확도와 개선율 수치 (원본 결과 파일 없음)',
      '새 가구로 한 외부 검증',
      '좌표가 바뀌어도 늘 같은 예측',
    ],
    source:
      '남아 있는 코드와 연구 노트로 정리했습니다. 관련 특허는 공동발명으로 출원된 상태이고, 이 구현이 청구항을 그대로 옮긴 것은 아닙니다.',
    relatedResearch: [
      {
        id: 'graph-tsp',
        title: '강화학습으로 TSP 경로를 만드는 그래프 모델',
        connection: '도시와 경로를 그래프로 표현해 본 학부 연구입니다. 알고리즘을 그대로 가져온 것은 아닙니다.',
      },
    ],
    category: 'AI · 가구 · 파라메트릭 설계',
    title: '가구 패널을 인식해 설계를 제조 데이터로 바꾸는 AI',
    subtitle: '모델 분석 → AI 패널 인식 → 파라미터 관계 수식화 → 제조 데이터 생성',
    period: '2025–2026',
    tags: ['TensorFlow', 'Hierarchical CADNet 기반', '그래프 입력', '선형회귀', 'BOM·도면'],
    story: [
      {
        title: '패널·접합면 분석',
        text: '가구 3D 모델에서 판재마다 크기와 부피를 구하고, 판재끼리 맞닿는 접합면을 찾아 그래프로 만듭니다.',
        owner: 'me',
        did: ['판재 크기, 체적, 두께 축 계산', '면의 면적, 중심, 접촉 관계 추출', '판재와 접합면을 잇는 계층 그래프'],
        image: 'assets/cases/panel/step1.webp',
        imageAlt: '판재끼리 맞닿는 접합면을 빨강으로 표시한 가구 와이어프레임',
      },
      {
        title: 'AI 패널 인식',
        text: '그래프 입력으로 측판, 지판, 천판, 우라판, 찬넬, 걸레받이, 선반, 도어 등 15종 패널을 인식합니다.',
        owner: 'me',
        did: [
          'Hierarchical CADNet 기반 모델과 MLP로 15종 인식',
          '라벨 데이터에서 형상, 라벨, 그래프를 내보내는 도구',
          '형상 계열 단위 교차검증 분할',
          '특징군 제거 실험과 축 교환 점검',
        ],
        image: 'assets/cases/panel/step2.webp',
        imageAlt: '분해한 가구 몸통의 판재를 역할별 색으로 칠하고 접촉 관계를 그래프로 정리한 개념도',
      },
      {
        title: '파라미터 관계 수식화',
        text: '전체 크기, 걸레받이, 코너장 멍판, 찬넬 크기를 바꿀 때 패널이 움직이는 규칙을 팀과 정리하고, 선형회귀로 수식화했습니다.',
        owner: 'team',
        did: ['규칙으로 기준값을 흔든 샘플 생성', '패널마다 위치와 크기를 선형회귀로 맞춤', '브라우저에서 계수식만으로 패널 이동'],
        didNote: '가구 규칙은 팀과 함께 정리했습니다.',
        image: 'assets/cases/panel/step3.webp',
        still: 'assets/cases/panel/step3-still.webp',
        imageAlt: '가구 폭을 바꾸자 맞닿은 판재가 차례로 따라 움직이는 과정',
      },
      {
        title: '제조 데이터 생성',
        text: '정해진 가구에 연결 피스와 하드웨어를 배치하고 BOM, 도면, 엣지밴딩을 계산해 제조 가능한 데이터로 만듭니다.',
        owner: 'team',
        did: ['연결 피스 위치와 하드웨어 배치', 'BOM, 도면, 엣지밴딩 계산'],
        image: 'assets/cases/panel/step4.webp',
        imageAlt: 'NC 뷰어에서 판재 아랫면의 드릴 가공 60개를 3D로 확인하는 화면',
      },
    ],
    diagramLabels: ['패널·접합면', 'AI 패널 인식', '관계 수식화', '제조 데이터'],
    figure: {
      src: 'assets/cases/panel/hero.webp',
      alt: '가구 폭을 바꾸기 전과 후. 맞닿은 판재들이 함께 늘어나고 옮겨 간 모습',
      caption: '연구 중 폭을 바꿔 본 가구. 맞닿은 판재들이 규칙대로 함께 움직입니다.',
      kind: 'research',
    },
  },
  {
    id: 'wedraw-pro',
    number: '03',
    headline: '디자이너의 설계가 그대로 공장의 가공 데이터가 됩니다',
    keyDecision:
      '판재를 회전해도 치수만 바꾸지 않고 가공 위치, 엣지, 결 방향을 같은 좌표 변환으로 함께 옮겨 설계 의도가 유지되게 했습니다.',
    scopeLine: '제품 화면은 데모·테스트 데이터 · 실제 고객 프로젝트 제외',
    stats: [
      { value: '166개', label: '데모 주방 한 채의 부품' },
      { value: '22장', label: '네스팅한 원장 · 수율 76.5%' },
      { value: '4종', label: 'BOM, 라벨, 가공 도면, 가공 코드를 한 번에' },
    ],
    role: '팀과 함께 개발하는 제품입니다. 커넥터로 제조 데이터를 내는 단계와 생산 투입 단계를 리딩했고, 도면과 발주 단계는 초기 개발을 리딩했습니다.',
    fixes: [
      {
        problem: '화면에서 고친 결 방향이 서버와 제조 파일에서 다른 뜻이 될 수 있습니다.',
        fix: '결맞춤 그룹 편집을 화면, API, 제조 엔진까지 한 흐름으로 이었습니다.',
      },
      {
        problem: '결맞춤 그룹이 원장보다 크면 한 장에 배치할 수 없습니다.',
        fix: '원장보다 큰 그룹은 나눠서 배치하고, 화면에서 미리 알려 줍니다.',
      },
      {
        problem: '네스팅에서 놓는 방향과 기계에 넣는 방향이 다를 수 있습니다.',
        fix: '두 방향을 따로 관리했습니다.',
      },
    ],
    checked: [
      '화면, API, 제조 계산 각각의 회귀 테스트',
      '출력 파일의 치수, 좌표, 결 방향, 엣지 비교',
      '기대값은 기하 회전을 따로 계산해 대조',
    ],
    unchecked: ['외부 네스팅기의 실제 배치', '현장 설치 환경과 기계 설정', '실제 CNC 가공'],
    source: '기술 문서와 코드 변경 이력으로 정리했습니다. 개발 중인 제품이라 기능 범위는 계속 바뀝니다.',
    category: '제품 · SketchUp · 가구 제조',
    title: 'Wedraw Pro, 가구 설계에서 생산까지',
    subtitle: '디자이너는 가구빌더로 설계하고, 제조 담당자는 커넥터로 생산 데이터를 받습니다',
    period: '2026 · 진행 중',
    tags: ['SketchUp Ruby API', 'JavaScript', 'Python', 'MPR·PGI', '네스팅'],
    story: [
      {
        title: '가구빌더로 설계',
        text: '디자이너가 SketchUp 안의 가구빌더로 몸통, 도어, 하드웨어, 마감재와 결 방향을 정해 가구를 설계합니다.',
        owner: 'team',
        did: [],
        didNote: '디자이너가 SketchUp에서 쓰는 설계 도구입니다.',
        image: 'assets/cases/wedraw-pro/step1.webp',
        imageAlt: '가구빌더에서 구조, 내부, 도어, 조립 방식을 고르는 화면',
      },
      {
        title: '도면과 발주',
        text: '플로터가 평면·입면·내부 도면을 만들고, 커넥터의 발주 모드에서 견적과 발주 상담으로 넘어갑니다.',
        owner: 'lead',
        ownerLabel: '초기 개발 리딩',
        did: ['플로터로 평면, 입면, 내부 도면 생성', '커넥터 발주 모드 (견적, 발주 상담)'],
        image: 'assets/cases/wedraw-pro/step2.webp',
        imageAlt: '모델에서 바로 뽑은 세트 도면. 평면, 입면, 내부 도면과 자재 사양이 들어 있습니다.',
      },
      {
        title: '커넥터로 제조 데이터',
        text: '제조 담당자가 커넥터에서 결맞춤 그룹과 네스팅을 확인하고 BOM, 라벨, 가공 도면, MPR·PGI 가공 코드를 한 번에 출력합니다.',
        owner: 'lead',
        did: [
          '제조 모드와 출력 (BOM, 라벨, 가공 도면, MPR·PGI)',
          '경첩, 런너, 리프트 가공을 판재에 투영',
          '도어 결맞춤 그룹 편집과 원장 초과 안내',
          '판재를 돌려도 가공 위치와 엣지 유지',
        ],
        image: 'assets/cases/wedraw-pro/step3.webp',
        imageAlt: '커넥터의 도어 결맞춤 그룹 설정. 원장보다 큰 그룹은 나눠서 배치합니다.',
      },
      {
        title: '생산 투입',
        text: '네스팅과 가공 코드를 현장 CNC로 넘기기 전에 웹 네스팅·NC 뷰어로 확인하고, 라벨을 붙여 생산합니다.',
        owner: 'lead',
        did: ['네스팅 웹 뷰어 (원장 배치, 결맞춤 그룹)', 'NC 뷰어로 가공 코드 확인', '2D CAD 웹 뷰어'],
        image: 'assets/cases/wedraw-pro/step4.webp',
        imageAlt: '네스팅 뷰어의 결맞춤 그룹 목록과 원장 위 부품 배치',
      },
    ],
    diagramLabels: ['가구빌더 설계', '도면·발주', '커넥터 출력', '생산 투입'],
    figure: {
      src: 'assets/cases/wedraw-pro/hero.webp',
      alt: '가구빌더로 설계한 데모 주방(몸통 18개)을 SketchUp에서 본 화면',
      caption: '가구빌더로 설계한 데모 주방. 이 모델에서 도면과 제조 데이터가 나옵니다.',
      kind: 'product',
    },
  },
];
