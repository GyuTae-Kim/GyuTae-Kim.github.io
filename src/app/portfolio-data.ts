export interface CaseStudy {
  id: string;
  number: string;
  // First-screen summary: one result line, the key judgement and a one-line scope.
  // The long problem/approach/validation text stays behind 「자세히」 on the case page.
  headline: string;
  keyDecision: string;
  scopeLine: string;
  role: string;
  outputs: string[];
  outcome: string;
  decision: string;
  relatedResearch: { id: string; title: string; connection: string }[];
  category: string;
  title: string;
  subtitle: string;
  period: string;
  tags: string[];
  problem: string;
  approach: string;
  contribution: string[];
  validation: string;
  caution?: string;
  diagramLabels: string[];
  story: CaseStep[];
  figure: CaseFigure;
  gallery?: { title: string; caption: string; pairs: CaseFigure[][] };
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

// One step of the project story; owner says who did it (me / team / partner institution).
export interface CaseStep {
  title: string;
  text: string;
  owner: 'me' | 'team' | 'partner';
  image?: string;
  // still: shown instead of an animated image to readers who prefer reduced motion
  still?: string;
  imageAlt?: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'cad-feature-recognition',
    number: '01',
    headline: '3D 모델에서 가공 특징을 찾아 Fusion CAM 공정까지 이어 줍니다',
    keyDecision:
      '평균 지표가 좋아져도 부품 계열별 오류가 늘어난 인식 후보는 채택하지 않았습니다.',
    scopeLine: '검증은 Fusion·MDT 시뮬레이션까지 · 실제 가공 품질 승인 아님',
    role: '형상 분석부터 가공 전략 설계와 Fusion 적용까지 직접 연구개발했습니다. 디지털 트윈(MDT) 시뮬레이션은 협력 기관이 맡았습니다.',
    outputs: [
      '가공 특징 학습 데이터를 만드는 라벨링 프로그램',
      '면·삼각면 계층 그래프 입력과 가공 특징 인식',
      'Fusion CAM에 가공 전략을 적용하는 어댑터와 MDT 연결',
    ],
    outcome:
      '3D 모델에서 가공 특징을 인식하고, 그 결과로 가공 방향과 셋업, 공정 순서, 공구, 절삭 조건을 정해 Fusion CAM 공정으로 만듭니다.',
    decision:
      '기하 입력, 증강, 라벨 변경이 결과에 주는 영향을 하나씩 나눠 비교했습니다. 검증 라벨을 고쳐서 바뀐 점수와 학습으로 바뀐 점수를 따로 봤고, 면 단위 점수와 부품 전체의 오류도 함께 살폈습니다. Fusion 적용에서는 공구 설정만 바꾸면 되는 경우와 작업을 새로 만들어야 하는 경우를 나눠 처리했습니다.',
    relatedResearch: [
      {
        id: 'fashion-classification',
        title: '클래스 불균형과 분류 오류 분석',
        connection: '클래스별 오류와 데이터 편향을 나눠서 평가해 본 경험',
      },
      {
        id: 'virtual-try-on',
        title: '비전 모듈과 앱을 잇는 추론 통합',
        connection: '모듈마다 다른 입력과 출력을 맞춰 하나의 실행 흐름으로 묶어 본 경험',
      },
    ],
    category: 'AI · CAD/CAM · BLUECHAIN ADD-IN',
    title: '3D 모델을 읽고 가공 전략까지 설계하는 AI',
    subtitle: '형상 분석 → AI 피처 인식 → 가공 전략 설계 → 디지털 트윈 검증으로 이어지는 Fusion CAM 자동화',
    period: '2025–2026',
    tags: ['Python', 'OpenCascade', 'TensorFlow', 'Autodesk Fusion API', 'CAM'],
    story: [
      {
        title: '형상 분석',
        text: '3D 모델(STEP)의 면과 엣지를 읽어 곡면 종류와 볼록·오목 연결 같은 관계를 그래프로 만듭니다.',
        owner: 'me',
        image: 'assets/cases/feature-cam/step1.webp',
        imageAlt: '합성 부품의 면 인접 그래프. 면마다 노드를 두고 맞닿은 면끼리 선으로 이었습니다.',
      },
      {
        title: 'AI 피처 인식',
        text: '면마다 기하 정보를 벡터로 바꿔 그래프 신경망에 넣고, 포켓·구멍·필렛 같은 가공 특징을 찾습니다.',
        owner: 'me',
        image: 'assets/cases/feature-cam/step2.webp',
        imageAlt: '합성 부품 네 개의 면을 가공 특징별로 색칠한 렌더. 포켓·구멍은 파랑, 필렛은 주황, 모따기는 보라입니다.',
      },
      {
        title: '가공 전략 설계',
        text: '가공 방향, 클램핑, 공정 순서, 공구, 절삭 조건을 정하고 조도 목표에 맞춰 경로 공차를 조정해 Fusion CAM 공정으로 만듭니다.',
        owner: 'me',
        image: 'assets/cases/feature-cam/step3.webp',
        imageAlt: '22개 공정 중 외곽 황삭, 드릴, 개방 포켓, 윤곽 정삭 단계의 Fusion 소재 시뮬레이션',
      },
      {
        title: '디지털 트윈 검증',
        text: '설계한 공정을 협력 기관의 디지털 트윈(MDT)에 넘겨 절삭력과 가공 결과를 시뮬레이션으로 검증합니다.',
        owner: 'partner',
        image: 'assets/cases/feature-cam/step4.webp',
        imageAlt: 'MDT 결과로 그린 설계 대비 편차 3D 지도. ±0.15 mm를 넘는 과삭이 없습니다.',
      },
    ],
    problem:
      '가공 특징을 자동으로 찾으려면 CAD 면마다 의미를 일관되게 붙인 학습 데이터가 필요하고, 면 몇 개만 잘못 분류해도 가공 특징 그룹이 달라질 수 있습니다. 인식 결과는 다시 Fusion 안에서 셋업, 공구, 작업 사이의 관계까지 맞아야 실제 가공 공정이 됩니다.',
    approach:
      '라벨링 프로그램으로 면 분류를 편집해 학습 데이터를 만들고, 면·삼각면·인접 관계를 계층 그래프 입력으로 만들어 그래프 신경망으로 인식했습니다. 인식한 특징으로 가공 방향과 셋업, 공정 순서, 공구, 절삭 조건을 정해 Fusion의 셋업과 공정으로 옮겼습니다. 조도 목표에 따라 경로 공차와 이송을 정하고, 설계한 공정은 디지털 트윈(MDT)으로 넘겨 시뮬레이션했습니다.',
    contribution: [
      '라벨링 프로그램 전체 연구개발을 맡아, 면마다 특징을 표시하고 분류를 편집해 형상과 라벨을 학습 데이터로 넘기게 했습니다.',
      '면·삼각면 계층 그래프와 라벨로 학습 데이터를 만들고, 원본 형상 계열을 기준으로 분할과 입력값의 의미를 확인했습니다.',
      '포켓, 필렛, 챔퍼를 가르기 애매한 형상을 생성하고, 기하 입력과 증강, 라벨 변경이 결과에 주는 영향을 비교했습니다.',
      '면 단위 예측을 가공 특징 그룹으로 묶고, 가공 방향, 셋업, 공정 순서, 공구, 절삭 조건을 정하는 가공 전략을 만들었습니다.',
      '가공 전략을 Fusion API로 셋업과 공정으로 만들고, 공구를 바꾸거나 적용에 실패한 뒤에도 기존 작업이 유지되게 했습니다.',
      '설계한 공정을 MDT로 넘기는 데이터와 사전 검사, 결과(절삭력, 설계 대비 편차)를 보는 화면을 연결했습니다.',
    ],
    validation:
      'STEP으로 저장했다가 다시 읽어도 라벨이 그대로인지, 계열별 분할과 학습·추론 입력이 서로 맞는지 점검했습니다. 인식 후속 실험에서는 평균 지표와 클래스별 오류에 더해 모든 면이 맞게 분류된 부품 수까지 함께 평가했습니다. Fusion에서는 자동 회귀 테스트와 실제로 연 모델로 적용, 공구 변경, 오류 복구를 확인하고, 소재 시뮬레이션을 기준 STEP과 비교했습니다.',
    caution:
      '인식 후속 실험의 평가 집합은 반복해서 검토한 탐색 단계의 근거이고, 새 부품으로 한 독립 평가는 아닙니다. 조도는 목표값에 맞춰 경로 공차와 이송을 정하는 방식으로 실측 조도가 아니며, 도면 공차를 직접 읽지는 않습니다. 검증은 Fusion과 MDT 시뮬레이션까지이고 실제 CNC 가공 품질을 승인받은 것은 아닙니다. MDT 시뮬레이션 자체는 협력 기관이 맡았습니다.',
    diagramLabels: ['형상 분석', 'AI 피처 인식', '가공 전략', 'MDT 검증'],
    figure: {
      src: 'assets/cases/feature-cam/hero.webp',
      alt: 'Fusion 소재 시뮬레이션. 자동으로 만든 공정으로 302 변형 부품을 깎은 결과가 모두 허용 오차 안(초록)에 있습니다.',
      caption: '자동으로 만든 공정으로 표준시편(302 변형)을 깎은 Fusion 소재 시뮬레이션. 초록은 허용 오차 안입니다.',
      kind: 'product',
    },
    gallery: {
      title: '구분할 부분만 바꾼 합성 형상 쌍',
      caption:
        '나머지 조건은 그대로 두고 구분할 부분만 바꾼 STEP 쌍을 만든 뒤, 엔진으로 STEP을 다시 읽어 생성할 때 붙인 라벨이 맞는지 확인했습니다. 면 색은 파랑이 구멍·포켓, 보라가 챔퍼, 주황이 필렛, 회색이 소재입니다.',
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
    role: '팀 프로젝트입니다. 가구 설계 지식은 팀과 함께 정리했고, 분석·인식·수식화 연구는 직접 진행했습니다.',
    outputs: [
      '판재·접합면 그래프와 15종 패널 인식 모델',
      '파라미터별 패널 조정 규칙의 선형회귀 수식',
      '연결 피스, 하드웨어, BOM, 도면, 엣지밴딩 계산',
    ],
    outcome:
      '가구 3D 모델에서 패널 역할을 인식하고, 크기와 걸레받이, 찬넬 같은 파라미터를 바꿀 때 패널이 함께 움직이는 수식을 만들어 제조 데이터까지 이었습니다.',
    decision:
      '원본 이름을 기준으로 형상 계열을 묶어 평가하면서 공간, 위상, 경계 특징을 비교했습니다. 축을 바꾼 입력은 따로 스트레스 평가를 했습니다. 파라미터 조정은 규칙대로 기준값을 흔든 샘플을 만들어 패널마다 위치와 크기를 선형회귀로 맞췄고, 값이 변하지 않는 출력은 계수를 0으로 고정했습니다.',
    relatedResearch: [
      {
        id: 'graph-tsp',
        title: '강화학습과 그래프 네트워크를 합친 TSP 연구',
        connection:
          '요소와 관계를 입력으로 표현해 본 과거 구현 경험입니다. TSP 알고리즘을 이 분류 모델에 그대로 가져다 쓴 것은 아닙니다.',
      },
    ],
    category: 'AI · FURNITURE · PARAMETRIC',
    title: '가구 패널을 인식해 설계를 제조 데이터로 바꾸는 AI',
    subtitle: '모델 분석 → AI 패널 인식 → 파라미터 관계 수식화 → 제조 데이터 생성',
    period: '2025–2026',
    tags: ['TensorFlow', 'Hierarchical CADNet 기반', '그래프 입력', '선형회귀', 'BOM·도면'],
    story: [
      {
        title: '패널·접합면 분석',
        text: '가구 3D 모델에서 판재마다 크기와 부피를 구하고, 판재끼리 맞닿는 접합면을 찾아 그래프로 만듭니다.',
        owner: 'me',
        image: 'assets/cases/panel/step1.webp',
        imageAlt: '판재끼리 맞닿는 접합면을 빨강으로 표시한 가구 와이어프레임',
      },
      {
        title: 'AI 패널 인식',
        text: '그래프 입력으로 측판, 지판, 천판, 우라판, 찬넬, 걸레받이, 선반, 도어 등 15종 패널을 인식합니다.',
        owner: 'me',
        image: 'assets/cases/panel/step2.webp',
        imageAlt: '분해한 가구 몸통의 판재를 역할별 색으로 칠하고 접촉 관계를 그래프로 정리한 개념도',
      },
      {
        title: '파라미터 관계 수식화',
        text: '전체 크기, 걸레받이, 코너장 멍판, 찬넬 크기를 바꿀 때 패널이 움직이는 규칙을 팀과 정리하고, 선형회귀로 수식화했습니다.',
        owner: 'team',
        image: 'assets/cases/panel/step3.webp',
        still: 'assets/cases/panel/step3-still.webp',
        imageAlt: '가구 폭을 바꾸자 맞닿은 판재가 차례로 따라 움직이는 과정',
      },
      {
        title: '제조 데이터 생성',
        text: '정해진 가구에 연결 피스와 하드웨어를 배치하고 BOM, 도면, 엣지밴딩을 계산해 제조 가능한 데이터로 만듭니다.',
        owner: 'team',
        image: 'assets/cases/panel/step4.webp',
        imageAlt: 'NC 뷰어에서 판재 아랫면의 드릴 가공 60개를 3D로 확인하는 화면',
      },
    ],
    problem:
      '크기와 모양이 비슷한 판재라도 가구 안에서 맡는 역할은 다릅니다. 역할을 알아야 가구 크기나 걸레받이 높이를 바꿀 때 어느 판재가 늘고 어느 판재가 옮겨 가야 하는지 정할 수 있고, 그 결과가 연결 피스, 하드웨어, 도면 같은 제조 데이터까지 이어져야 합니다.',
    approach:
      '판재와 접합면을 계층 그래프로 만들고, 기존 Hierarchical CADNet을 바탕으로 변형한 모델과 후속 MLP로 패널 역할을 인식했습니다. 인식한 역할과 팀과 정리한 가구 규칙으로 파라미터를 흔든 샘플을 시뮬레이션하고, 패널마다 위치와 크기를 선형회귀로 맞춰 계수식으로 만들었습니다. 정해진 가구에는 연결 피스와 하드웨어를 배치하고 BOM, 도면, 엣지밴딩을 계산했습니다.',
    contribution: [
      '판재의 크기·체적·두께 축, 면의 면적과 중심, 판재와 면의 접촉 관계를 학습 입력으로 정리했습니다.',
      '라벨링 데이터에서 형상, 라벨, 기준 그래프를 내보내고, 원본 이름으로 묶은 형상 계열이 교차검증에서 같은 분할에 들어가도록 하는 도구를 만들었습니다.',
      '특징군을 넣고 빼며 비교하는 실험과, 원본 입력과 축을 바꾼 입력의 예측을 대조하는 강건성 점검을 구현했습니다.',
      '역할별 조정 규칙으로 만든 샘플을 선형회귀로 맞춰, 브라우저가 계수식만으로 패널을 움직이게 했습니다.',
      '연결 피스 위치, 하드웨어 배치, BOM, 도면, 엣지밴딩 계산을 제조 데이터로 묶었습니다.',
    ],
    validation:
      '형상 계열별 교차검증, 특징군 제거 실험, 좌표축 교환 스트레스 평가, 판재 단위 지표 계산을 구현했습니다. 파라미터 수식은 하부 코너장 같은 회귀 테스트로 파라미터를 바꾼 뒤의 패널 위치를 확인했습니다.',
    caution:
      '확인할 수 있는 코드와 연구 노트만으로 정리한 사례입니다. 원시 점수와 실행 결과 파일을 지금은 확인할 수 없어 정확도와 개선율은 적지 않았습니다. 평가는 원본 이름을 기준으로 나눈 내부 분할이라 새 가구로 한 외부 검증이 아니고, 좌표가 바뀌어도 예측이 항상 같다는 뜻도 아닙니다. 관련 특허는 공동발명으로 출원된 상태이며, 이 사례의 구현이 청구항을 그대로 구현했다는 뜻은 아닙니다.',
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
    role: '팀과 함께 개발하고 있습니다. 커넥터, 하드웨어 가공, 가공 코드(MPR·PGI), 도면·플로터, 네스팅·NC 뷰어를 주로 맡았습니다.',
    outputs: [
      '커넥터 제조 모드와 출력(BOM, 라벨, 가공 도면, 가공 코드)',
      '하드웨어 가공과 MPR·PGI 가공 코드 생성',
      '네스팅·NC·2D CAD 웹 뷰어',
    ],
    outcome:
      '디자이너가 가구빌더로 설계한 가구를, 제조 담당자가 커넥터에서 결맞춤과 네스팅을 확인하고 BOM, 라벨, 가공 코드로 출력해 생산합니다.',
    decision:
      '판재를 회전할 때 치수만 바꾸지 않고 가공 위치, 엣지, 결 방향까지 같은 좌표 변환으로 함께 옮겨 설계 의도가 유지되게 했습니다. 네스팅 방향과 기계에 넣는 방향은 따로 다뤘습니다.',
    relatedResearch: [
      {
        id: 'virtual-try-on',
        title: '비전 모듈과 앱을 잇는 추론 통합',
        connection: '모듈마다 다른 입력과 출력을 맞춰 하나의 실행 흐름으로 묶어 본 경험',
      },
    ],
    category: 'PRODUCT · SKETCHUP · MANUFACTURING',
    title: 'Wedraw Pro, 가구 설계에서 생산까지',
    subtitle: '디자이너는 가구빌더로 설계하고, 제조 담당자는 커넥터로 생산 데이터를 받습니다',
    period: '2026 · 진행 중',
    tags: ['SketchUp Ruby API', 'JavaScript', 'Python', 'MPR·PGI', '네스팅'],
    story: [
      {
        title: '가구빌더로 설계',
        text: '디자이너가 SketchUp 안의 가구빌더로 몸통, 도어, 하드웨어, 마감재와 결 방향을 정해 가구를 설계합니다.',
        owner: 'team',
        image: 'assets/cases/wedraw-pro/step1.webp',
        imageAlt: '가구빌더에서 구조, 내부, 도어, 조립 방식을 고르는 화면',
      },
      {
        title: '도면과 발주',
        text: '플로터가 평면·입면·내부 도면을 만들고, 커넥터의 발주 모드에서 견적과 발주 상담으로 넘어갑니다.',
        owner: 'team',
        image: 'assets/cases/wedraw-pro/step2.webp',
        imageAlt: '모델에서 바로 뽑은 세트 도면. 평면, 입면, 내부 도면과 자재 사양이 들어 있습니다.',
      },
      {
        title: '커넥터로 제조 데이터',
        text: '제조 담당자가 커넥터에서 결맞춤 그룹과 네스팅을 확인하고 BOM, 라벨, 가공 도면, MPR·PGI 가공 코드를 한 번에 출력합니다.',
        owner: 'team',
        image: 'assets/cases/wedraw-pro/step3.webp',
        imageAlt: '커넥터의 도어 결맞춤 그룹 설정. 원장보다 큰 그룹은 나눠서 배치합니다.',
      },
      {
        title: '생산 투입',
        text: '네스팅과 가공 코드를 현장 CNC로 넘기기 전에 웹 네스팅·NC 뷰어로 확인하고, 라벨을 붙여 생산합니다.',
        owner: 'team',
        image: 'assets/cases/wedraw-pro/step4.webp',
        imageAlt: '네스팅 뷰어의 결맞춤 그룹 목록과 원장 위 부품 배치',
      },
    ],
    problem:
      '디자이너가 SketchUp에서 그린 가구가 공장에서는 재단 목록, 네스팅, 가공 코드, 라벨로 바뀌어야 합니다. 화면에서 편집한 결 방향과 하드웨어 위치가 서버 계산과 제조 파일에서도 같은 뜻이어야 하고, 판재를 회전해도 가공 위치와 엣지가 어긋나면 안 됩니다.',
    approach:
      '가구빌더가 만든 설계 데이터를 서버와 엔진이 받아 견적, 결맞춤, 네스팅, 연결 피스, 하드웨어 가공을 계산하고, 커넥터가 제조 담당자에게 단계별로 보여 준 뒤 출력합니다. 판재의 좌표, 가공 면, 엣지 정보는 한 번에 같이 변환하고, 네스팅 방향과 기계에 넣는 방향은 따로 다뤘습니다.',
    contribution: [
      '커넥터의 제조 모드와 출력 흐름(BOM, 패널 라벨, 가공 도면, 네스팅, MPR·PGI 가공 코드)을 개발했습니다.',
      '경첩, 런너, 리프트 같은 하드웨어 가공을 판재에 투영하고 가공 코드로 내보내는 부분을 맡았습니다.',
      '도어 결맞춤 그룹 편집과 원장 크기 초과 안내를 화면부터 API, 제조 엔진까지 연결했습니다.',
      '패널의 실제 형상과 좌표 변환으로 도어 배열을 계산하고, 회전한 뒤에도 가공 위치와 엣지의 의미가 그대로 남도록 고쳤습니다.',
      '현장에 넣기 전에 확인하는 네스팅·NC·2D CAD 웹 뷰어를 만들었습니다.',
    ],
    validation:
      '화면, API, 제조 계산에 각각 회귀 테스트를 작성했습니다. 출력 파일의 치수, 좌표, 결 방향, 엣지 정보를 비교했고, 기대값은 기하 회전을 따로 계산해서 구했습니다.',
    caution:
      '여기서 확인한 것은 제조 출력 데이터가 서로 맞는지까지입니다. 결맞춤 그룹과 예상 크기 안내가 있어도 외부 네스팅기가 실제로 그렇게 배치한다는 보장은 없고, 실제 설치 환경과 기계 설정, CNC 가공은 따로 검증해야 합니다. 팀과 함께 개발 중인 제품이라 기능 범위는 계속 바뀌고 있습니다.',
    diagramLabels: ['가구빌더 설계', '도면·발주', '커넥터 출력', '생산 투입'],
    figure: {
      src: 'assets/cases/wedraw-pro/hero.webp',
      alt: '가구빌더로 설계한 데모 주방(몸통 18개)을 SketchUp에서 본 화면',
      caption: '가구빌더로 설계한 데모 주방. 이 모델에서 도면과 제조 데이터가 나옵니다.',
      kind: 'product',
    },
  },
];
