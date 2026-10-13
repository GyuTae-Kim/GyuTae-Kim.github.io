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
  figure: CaseFigure;
  gallery?: { title: string; caption: string; pairs: CaseFigure[][] };
}

// figure.kind: 'research' = rendered from the actual research data, 'concept' = synthetic illustration.
export interface CaseFigure {
  src: string;
  alt: string;
  caption: string;
  kind: 'research' | 'concept';
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'cad-feature-recognition',
    headline: '면마다 가공 의미를 붙여 학습 데이터까지 이었습니다',
    keyDecision:
      '평균 지표가 좋아져도 부품 계열별 오류가 늘어난 후보는 채택하지 않았습니다.',
    scopeLine: '기존 형상 집합의 후속 실험 · 새 부품 독립 평가 아님',
    role: '라벨링 프로그램 전체 연구개발, 가공 특징 인식 후속 연구의 데이터 구성과 모델 실험',
    outputs: [
      '면 분류를 편집하고 형상과 라벨을 전달하는 도구',
      '면과 삼각면으로 만든 계층 그래프 학습 데이터',
      'STEP 증강과 라벨 검토, 학습·추론 검증 기록',
    ],
    outcome:
      '면 분류를 편집해 저장한 형상과 라벨이 학습 데이터까지 이어지게 했습니다. 후속 모델 실험에서는 평균 지표가 좋아져도 부품 계열별 오류가 늘어난 후보는 채택하지 않았습니다.',
    decision:
      '기하 입력, 증강, 라벨 변경이 결과에 주는 영향을 하나씩 나눠 비교했습니다. 검증 라벨을 고쳐서 바뀐 점수와 학습으로 바뀐 점수를 따로 봤고, 면 단위 점수와 부품 전체의 오류도 함께 살폈습니다.',
    relatedResearch: [
      {
        id: 'fashion-classification',
        title: '클래스 불균형과 분류 오류 분석',
        connection: '클래스별 오류와 데이터 편향을 나눠서 평가해 본 경험',
      },
      {
        id: 'graph-tsp',
        title: '강화학습과 그래프 네트워크를 합친 TSP 연구',
        connection: '노드와 엣지, 그 사이의 관계를 학습 입력으로 표현해 본 경험',
      },
    ],
    number: '01',
    category: 'AI · 3D GEOMETRY',
    title: 'CAD 형상에서 가공 특징을 읽는 AI',
    subtitle: '라벨링 도구에서 시작해 계층 그래프 입력, 모델 비교, 가공 특징 그룹까지',
    period: '2025 라벨링 프로그램 · 2026 후속 인식 연구',
    tags: ['Python', 'OpenCascade', 'TensorFlow', '형상 그래프', '데이터 검증'],
    problem:
      '가공 특징을 인식하려면 CAD 면마다 의미를 일관되게 붙인 학습 데이터가 필요합니다. 포켓, 구멍, 필렛을 가르기 애매한 형상에서는 오류가 기하 정보 부족 때문인지 라벨이 모호해서인지 가려내야 합니다. 면 몇 개만 잘못 분류해도 가공 특징 그룹이 달라질 수 있기 때문입니다.',
    approach:
      '라벨링 프로그램에서 면 분류를 편집하고, 형상과 라벨을 저장해 학습 데이터로 넘겼습니다. 후속 인식 연구에서는 기존 계층 그래프 신경망을 바탕으로 면, 삼각면, 인접 관계를 입력으로 만들었습니다. 그 위에서 곡률·경계·주변 면 같은 기하 특징과 증강 조건을 바꿔 가며 비교했습니다.',
    contribution: [
      '라벨링 프로그램 전체 연구개발을 맡아, 면마다 특징을 표시하고 분류를 편집하는 기능, 형상과 라벨을 저장해 전달하는 기능을 만들었습니다.',
      '면·삼각면 계층 그래프와 라벨로 학습 데이터를 만들고, 원본 형상 계열을 기준으로 데이터가 제대로 나뉘었는지, 입력값의 의미가 맞는지 확인했습니다.',
      '후속 연구에서는 포켓, 필렛, 챔퍼를 가르기 애매한 형상을 생성하고, 기하 입력과 증강, 라벨 변경이 결과에 주는 영향을 비교했습니다.',
      '학습과 추론에서 입력 순서, 클래스 의미, 체크포인트가 서로 맞는지 확인하고, 면 단위 예측을 가공 특징 그룹으로 넘기는 부분을 구현했습니다.',
    ],
    validation:
      'STEP으로 저장했다가 다시 읽어도 라벨이 그대로인지, 계열별 분할과 학습·추론 입력이 서로 맞는지 점검했습니다. 입력 특징과 증강 조건을 비교한 후속 실험에서는 평균 지표와 클래스별 오류에 더해, 모든 면이 맞게 분류된 부품 수까지 함께 평가했습니다. 일부 점수만 오른 후보는 채택하지 않았습니다.',
    caution:
      '여기서 확인한 것은 라벨링과 학습 데이터 구성, 그리고 기존 형상 집합으로 한 후속 실험까지입니다. 후속 실험에 쓴 평가 집합은 반복해서 검토한 것이라 탐색 단계의 근거이고, 새 부품으로 한 독립 평가는 아닙니다. 최종 재학습에는 전체 데이터를 썼기 때문에 그 점수는 학습에 쓴 데이터로 잰 점수입니다. 운영 모델 적용 여부는 이 사례에서 다루지 않습니다.',
    diagramLabels: ['STEP 형상', '면·인접 그래프', '학습·추론', '가공 특징'],
    figure: {
      src: 'assets/figures/fig-feature-pair.webp',
      alt: '닫힌 포켓과 열린 포켓을 비교하도록 만든 합성 형상 렌더. 면 색은 라벨로, 파랑은 구멍·포켓, 주황은 필렛, 회색은 소재입니다.',
      caption: '후속 연구에서 만든 합성 비교 형상. 닫힌 포켓과 열린 포켓이며, 면 색은 생성할 때 붙인 라벨입니다.',
      kind: 'research',
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
    id: 'fusion-cam',
    headline: '공구를 바꾸거나 실패해도 기존 CAM 작업이 남게 했습니다',
    keyDecision:
      '공구 설정만 바꾸면 되는 경우와 작업을 새로 만들어야 하는 경우를 나눠 처리했습니다.',
    scopeLine: '시뮬레이션 표본 비교까지 · 실제 CNC 가공 승인 아님',
    role: '가공 계획을 Fusion에 적용하는 기능, 공구 변경과 실패 복구, 형상 선택 검증 개발',
    outputs: [
      'Fusion CAM에 가공 계획을 적용하는 어댑터',
      '공구를 바꿀 때 기존 작업을 보존하고 복구하는 로직',
      '소재 시뮬레이션 결과를 STEP과 비교하는 검증 절차',
    ],
    outcome:
      'Fusion 모델에서 공구를 바꾸거나 실패 후 복구해도 기존 CAM 작업이 그대로 유지됐습니다. 중첩 포켓 경계를 고친 뒤에는 소재 시뮬레이션을 기준 STEP과 표본 비교했을 때 남는 소재가 줄었습니다.',
    decision:
      '공구 설정만 바꾸면 되는 경우와 작업을 새로 구성해야 하는 경우를 나눠 처리했습니다. 서버 계획이 유효한지, Fusion에 제대로 적용되고 복구되는지, 시뮬레이션한 소재 형상이 맞는지를 각각 따로 검증했습니다.',
    relatedResearch: [
      {
        id: 'virtual-try-on',
        title: '비전 모듈과 앱을 잇는 추론 통합',
        connection: '모듈마다 다른 입력과 출력을 맞춰 하나의 실행 흐름으로 묶어 본 경험',
      },
    ],
    number: '02',
    category: 'CAD/CAM · NATIVE INTEGRATION',
    title: '인식 결과를 Fusion의 가공 작업으로',
    subtitle: '서버에서 만든 가공 계획이 Fusion 안에서 실제로 실행되도록 맞추는 작업',
    period: '2026',
    tags: ['Python', 'Autodesk Fusion API', 'CAM', '기하 검증', '시뮬레이션'],
    problem:
      '서버에서 유효한 가공 계획을 만들어도 Fusion에서 형상 선택이나 공구 설정, 작업 사이의 의존 관계가 어긋나면 원하는 가공 결과가 나오지 않습니다. 공구를 바꾸거나 적용에 실패했을 때 기존 작업에 어떤 영향을 주는지도 다뤄야 했습니다.',
    approach:
      '인식한 형상과 가공 계획을 Fusion의 셋업, 공구, 작업으로 옮겼습니다. 공구만 바꾸면 되는 경우와 작업을 다시 만들어야 하는 경우를 나눴고, 중첩 포켓의 경계와 앞 공정에 따라 달라지는 잔삭 상태를 검증했습니다.',
    contribution: [
      '서버의 가공 계획을 Fusion API로 적용하고, 공구 경로 생성 결과와 오류를 전달하는 흐름을 개발했습니다.',
      '공구를 바꿀 때 기존 파라미터와 작업 상태가 유지되게 하고, 실패 후 제대로 복구됐는지를 실제 값으로 확인하도록 고쳤습니다.',
      '중첩 포켓의 접근 영역과 공구 조건을 미리 확인해 적용 전에 오류를 걸러 내고, 선택적 잔삭을 건너뛰는 조건을 분명히 정했습니다.',
    ],
    validation:
      '자동 회귀 테스트와 Fusion에 실제로 연 모델에서 정상 적용, 공구 변경, 오류 복구를 확인했습니다. 소재 시뮬레이션 결과와 기준 STEP을 양쪽 방향으로 표본 비교해 남은 소재와 형상 차이를 점검했습니다. 다만 표본 점으로 본 진단이라, 연속된 표면 전체의 최대 오차를 뜻하지는 않습니다.',
    caution:
      '여기서 본 것은 공구 경로 생성과 시뮬레이션 표본 비교까지입니다. 실제 CNC 가공 결과나 도면 공차, 표면 품질을 승인받은 것은 아닙니다.',
    diagramLabels: ['가공 특징', '공구·셋업 계획', 'Fusion CAM', '소재 검증'],
    figure: {
      src: 'assets/figures/fig-cam.svg',
      alt: 'CAM 개념도: 소재 상자 안에 2단으로 겹친 포켓과 단마다 다른 공구 T1, T2의 공구 경로',
      caption: '합성 형상으로 그린 중첩 포켓의 공구 경로. 단마다 공구를 바꿔 가공합니다.',
      kind: 'concept',
    },
  },
  {
    id: 'sketchup-manufacturing',
    headline: '판재를 돌려도 가공 위치와 결 방향이 함께 따라오게 했습니다',
    keyDecision:
      '치수만 바꾸지 않고 가공 위치, 엣지, 결 방향을 같은 좌표 변환으로 함께 옮겼습니다.',
    scopeLine: '제조 출력 데이터의 일관성까지 · 네스팅기와 CNC는 별도 검증',
    role: 'UI에서 API, 제조 계산까지 이어지는 결맞춤 편집과 출력 좌표 변환 개발',
    outputs: [
      '결맞춤 편집 UI와 API',
      '패널 그룹과 제조 좌표 계산',
      '제조 파일과 라벨 회귀 검증',
    ],
    outcome:
      '출력 파일마다 치수, 결 방향, 가공 좌표, 엣지를 대조하는 회귀 검증을 갖췄습니다. 판재를 회전했을 때의 기대값은 따로 기하 계산으로 구해, 출력 변환이 어긋나지 않는지 점검했습니다.',
    decision:
      '판재를 회전할 때 치수만 바꾸지 않고 가공 위치, 엣지, 결 방향까지 같은 좌표 변환으로 함께 옮겨 설계 의도가 유지되게 했습니다.',
    relatedResearch: [
      {
        id: 'graph-tsp',
        title: '그래프로 상태와 관계 표현하기',
        connection: '요소 사이의 관계와 상태를 코드에서 분명하게 정의해 다뤄 본 경험',
      },
    ],
    number: '03',
    category: '3D PRODUCT · MANUFACTURING',
    title: 'SketchUp 설계를 제조 데이터로',
    subtitle:
      '설계 화면에서 제조 계산, 출력 파일까지 형상의 의미가 바뀌지 않게 하는 시스템',
    period: '2026',
    tags: [
      'SketchUp Ruby API',
      'JavaScript',
      'Python',
      '제조 좌표계',
      '네스팅',
    ],
    problem:
      '도어의 결 방향과 배열은 화면에서 편집할 때도, 서버에서 계산할 때도, 제조 파일로 내보낼 때도 같은 뜻이어야 합니다. 판재를 회전한 뒤 치수만 바꾸거나 가공 위치와 엣지를 다른 좌표계로 처리하면 출력이 설계 의도와 달라집니다.',
    approach:
      'SketchUp 설계 데이터를 기준으로 결맞춤 그룹을 편집하고, 그 결과를 서버의 제조 계산으로 넘겼습니다. 판재의 좌표, 가공 면, 엣지 정보는 한 번에 같이 변환하고, 네스팅 방향과 기계에 넣는 방향은 따로 다뤘습니다.',
    contribution: [
      '도어 결맞춤 그룹 편집과 원장 크기 초과 안내를 화면부터 API, 제조 엔진까지 연결했습니다.',
      '패널의 실제 형상과 좌표 변환으로 도어 배열을 계산하고, 회전한 뒤에도 가공 위치와 엣지의 의미가 그대로 남도록 고쳤습니다.',
      '그룹별로 패널을 식별해 제조 파일과 라벨에 연결하고, 그룹 입력 하나가 잘못되어도 다른 판재의 출력까지 막히지 않도록 진단 흐름을 만들었습니다.',
    ],
    validation:
      '화면, API, 제조 계산에 각각 회귀 테스트를 작성했습니다. 출력 파일의 치수, 좌표, 결 방향, 엣지 정보를 비교했고, 기대값은 기하 회전을 따로 계산해서 구했습니다.',
    caution:
      '여기서 확인한 것은 제조 출력 데이터가 서로 맞는지까지입니다. 결맞춤 그룹과 예상 크기 안내가 있어도 외부 네스팅기가 실제로 그렇게 배치한다는 보장은 없습니다. 실제 설치된 SketchUp 환경, 기계의 CSV 가져오기 설정, 실제 CNC 가공은 따로 검증해야 합니다.',
    diagramLabels: [
      'SketchUp 설계',
      '그룹·좌표 계산',
      '네스팅·가공 출력',
      '라벨·부재 연결',
    ],
    figure: {
      src: 'assets/figures/fig-nesting.svg',
      alt: '제조 데이터 개념도: 원장 한 장 위에 배치한 부재와 결이 이어지는 도어 그룹 A-1~A-3, 엣지·경첩·선반핀 표시',
      caption: '합성 배치로 그린 결맞춤 도어 그룹과 엣지, 경첩, 선반핀 가공 위치',
      kind: 'concept',
    },
  },
  {
    id: 'panel-classification',
    headline: '판재와 접촉 관계를 그래프로 표현해 역할을 분류했습니다',
    keyDecision:
      '형상 계열로 묶어 평가하고, 좌표축을 바꾼 입력은 따로 스트레스 평가했습니다.',
    scopeLine: '내부 분할 평가 · 새 가구 외부 검증 아님',
    number: '04',
    role: '판재와 면의 입력 표현, 분류 모델, 특징 비교 실험 연구개발',
    outputs: [
      '판재, 면, 접촉 관계를 담은 그래프 입력',
      '형상 계열별 교차검증과 특징군 비교 도구',
      '좌표축을 바꾸거나 증강했을 때의 강건성 점검',
    ],
    outcome:
      '연구 노트에 모듈 경계 위치 특징을 후보로 정리했고, 좌표축을 바꾼 입력에 약한 조건은 후속 검증 과제로 남겼습니다.',
    decision:
      '원본 이름을 기준으로 형상 계열을 묶어 평가하면서 공간, 위상, 경계 특징을 비교했습니다. 축을 바꾼 입력은 따로 스트레스 평가를 했고, 증강과 시드가 함께 바뀐 조건에서는 결과 차이를 증강만의 효과로 보지 않았습니다.',
    relatedResearch: [
      {
        id: 'graph-tsp',
        title: '강화학습과 그래프 네트워크를 합친 TSP 연구',
        connection:
          '요소와 관계를 입력으로 표현해 본 과거 구현 경험입니다. TSP 알고리즘을 이 분류 모델에 그대로 가져다 쓴 것은 아닙니다.',
      },
    ],
    category: 'AI · FURNITURE TOPOLOGY',
    title: '형상과 연결 관계로 판재의 역할을 분류하는 AI',
    subtitle:
      '판재의 기하 정보, 접촉 관계, 모듈 안 위치를 입력으로 삼고 특징과 좌표축 변화의 영향을 비교',
    period: '2026 · 후속 연구개발',
    tags: [
      'TensorFlow',
      'Hierarchical CADNet 기반',
      '그래프 입력',
      '특징 비교',
      '교차검증',
    ],
    problem:
      '크기와 모양이 비슷한 판재라도 가구 안에서 맡는 역할은 다릅니다. 그래서 판재 하나의 형상뿐 아니라 주변 판재와 어떻게 붙어 있고 어디에 있는지를 함께 표현해야 했고, 좌표축이 바뀌면 예측이 어떻게 달라지는지도 확인해야 했습니다.',
    approach:
      '판재, 면, 접촉 관계를 계층 그래프 입력으로 만들고, 기존 Hierarchical CADNet을 바탕으로 변형한 모델에 넣었습니다. 별도의 후속 실험에서는 공간, 위상, 모듈 경계 위치 특징을 나눠 트리 모델과 MLP로 비교했습니다.',
    contribution: [
      '판재의 크기·체적·두께 축, 면의 면적과 중심, 판재와 면의 접촉 관계를 학습 입력으로 정리했습니다.',
      '라벨링 데이터에서 형상, 라벨, 기준 그래프를 내보내고, 원본 이름으로 묶은 형상 계열이 교차검증에서 같은 분할에 들어가도록 하는 도구를 만들었습니다.',
      '특징군을 넣고 빼며 비교하는 실험과, 원본 입력과 축을 바꾼 입력의 예측을 대조하는 강건성 점검을 구현했습니다.',
    ],
    validation:
      '형상 계열별 교차검증, 특징군 제거 실험, 좌표축 교환 스트레스 평가, 판재 단위 지표 계산을 구현했습니다. 경계 위치 특징을 후보로 고른 것과 축을 바꿨을 때 약해지는 점은 연구 노트에 남겼습니다.',
    caution:
      '확인할 수 있는 코드와 연구 노트만으로 정리한 사례입니다. 원시 점수와 실행 결과 파일을 지금은 확인할 수 없어 개선율은 적지 않았습니다. 평가는 원본 이름을 기준으로 나눈 내부 분할이라 새 가구로 한 외부 검증이 아니고, 좌표가 바뀌어도 예측이 항상 같다는 뜻도 아닙니다. 또 2026년에 한 후속 연구라서, 2025년 출원 특허의 청구항을 직접 구현한 근거는 아닙니다.',
    diagramLabels: [
      '판재·면',
      '기하·접촉 그래프',
      '분류·특징 비교',
      '축 변화 평가',
    ],
    figure: {
      src: 'assets/figures/fig-panels.svg',
      alt: '판재 분류 개념도: 분해한 가구 몸통의 측판·상하판·뒷판·선반·도어를 역할별 색으로 칠하고, 접촉 관계를 그래프로 연결',
      caption: '합성 형상으로 그린 판재 역할과 접촉 관계 그래프',
      kind: 'concept',
    },
  },
];
