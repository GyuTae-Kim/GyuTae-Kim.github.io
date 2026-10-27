export interface ResearchWork {
  id: string;
  // What the project is: name, one-sentence summary and a 3-step flow come before the results.
  title: string;
  shortTitle: string;
  summary: string;
  flow: { label: string; text: string }[];
  // How the problem was framed for learning (e.g. state, action, reward), shown under the flow.
  design?: { title: string; items: { label: string; text: string }[] };
  category: string;
  previewLabel: string;
  // The research goal, shown before the role.
  goal?: string;
  role: string;
  outcome: string;
  fixes: { problem: string; fix: string; label?: string }[];
  // Original contribution and reused work are visible beside the project outcome.
  built: string[];
  borrowed: string[];
  limits: string[];
  // One visible line naming the prior work or models this research builds on.
  credit: string;
  connection: string;
  // The link text is that project's title (CASE_STUDIES).
  relatedProjectId: string;
  tags: string[];
  source: string;
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
  period?: string;
  result?: ResearchResult;
}

export interface ResearchFigure {
  src: string;
  // Intrinsic size, so the page keeps its layout (and #anchors) before lazy images load.
  width: number;
  height: number;
  alt: string;
  caption: string;
  // compact: keeps a tall or chart-like image near its drawn size instead of the full column
  compact?: boolean;
  // still: shown instead of an animated src to readers who prefer reduced motion
  still?: string;
}

// Results of running the public code, shown as a result card: one headline, the strongest
// figures and 2–3 numbers, with run conditions and comparisons always visible.
// Numbers come only from those runs (commands, seeds and caveats are kept with the figures).
export interface ResearchResult {
  headline: string;
  // Base path of the home row thumbnails <thumb>-336.webp and <thumb>-672.webp.
  thumb: string;
  figures: ResearchFigure[];
  stats: { value: string; label: string }[];
  // The one number on the home row when stats[0] would read wrong out of context.
  homeStat?: { value: string; label: string };
  summary: string;
  scope?: string;
  story?: { label: string; text: string }[];
  retry?: string[];
  details: {
    environment: string;
    figures: ResearchFigure[];
    table?: { caption: string; columns: string[]; rows: string[][] };
    // Causes found in the code or setup.
    findings: { title: string; text: string }[];
  };
}

// Entries describe inspectable public implementations and experimental notes.
// A referenced paper is prior work, not a publication authored by this portfolio owner.
export const RESEARCH_WORKS: ResearchWork[] = [
  {
    id: 'graph-tsp',
    previewLabel: '경로 탐색 예시',
    goal: '도시가 늘수록 경우의 수가 급격히 커지는 TSP에서, 기존 알고리즘보다 빠르게 짧은 경로를 찾는 것이 목표였습니다. 지도교수님과 함께 강화학습으로 접근했습니다.',
    role: '참고 논문의 그래프 표현과 Q-learning 아이디어를 가져와 TSP 환경과 모델, 학습 루프, 삽입 규칙을 하나의 실험 코드로 구현했습니다.',
    outcome: '도시의 위치와 거리, 방문 여부를 그래프로 넣고, 모델이 고른 도시를 삽입 휴리스틱으로 경로에 추가하는 탐색 프로그램을 만들었습니다. 공개 코드로 기준선과 비교하는 실험을 하며 학습이 제대로 되지 않은 원인도 찾았습니다.',
    fixes: [
      { problem: '도시 수마다 행렬 크기가 달라, 크기가 고정된 신경망에 바로 넣을 수 없었습니다.', fix: 'Structure2Vec으로 도시마다 임베딩을 만들고, 평가 네트워크가 방문하지 않은 도시마다 Q값을 매기게 했습니다.' },
      { problem: '다음 도시를 고르는 것만으로는 경로의 어느 위치에 넣을지 정해지지 않습니다.', fix: '도시 선택은 학습 모델이, 삽입 위치는 경로 길이가 가장 덜 늘어나는 자리를 찾는 휴리스틱이 맡도록 결합했습니다.' },
      { problem: '짧은 경로가 나와도 학습 효과인지 삽입 규칙의 효과인지 구분하기 어렵습니다.', fix: '무작위 도시 순서에도 같은 삽입 규칙을 적용해 비교하고 Q값과 TD 목표 계산을 추적했습니다. 단축 학습에서는 학습 정책의 개선을 확인하지 못했습니다.', label: '분석·검증' },
    ],
    built: [
      '노드, 엣지, 방문 상태를 담은 그래프 환경과 경로 비용 기록',
      'Structure2Vec 임베딩과 Q값 평가',
      '여러 스텝 보상 누적과 경험 샘플링을 잇는 탐색 루프',
      '도시는 모델이 고르고 넣을 자리는 삽입 휴리스틱이 정하는 구조',
    ],
    borrowed: ['NeurIPS 2017 그래프 조합 최적화 연구의 Structure2Vec·강화학습 접근'],
    limits: [
      '원논문 그대로의 재현 아님 (target network 없음, n-step 방식 다름)',
      '설정된 에피소드의 1%만 학습',
      '끝까지 학습했을 때의 성능은 알 수 없음',
    ],
    credit: 'NeurIPS 2017 그래프 조합 최적화 연구를 참고한 구현',
    connection:
      '처음으로 신경망을 직접 코드로 구현해 본 연구였습니다. 그래프의 요소와 관계를 학습 입력으로 표현해 본 경험이, 가구 패널과 면을 인식하는 지금의 연구로 이어졌습니다.',
    relatedProjectId: 'panel-classification',
    title: '강화학습으로 TSP 경로를 만드는 그래프 모델',
    shortTitle: 'TSP 경로 탐색',
    summary: '도시를 그래프로 표현하고, 경로에 추가할 도시를 강화학습으로 고르는 탐색 프로그램을 구현했습니다.',
    flow: [
      { label: '그래프로 표현', text: '도시, 거리, 방문 여부' },
      { label: 'Structure2Vec + Q-learning', text: '도시마다 Q값 계산' },
      { label: '도시 선택과 경로 삽입', text: '모델이 고른 도시를 휴리스틱으로 삽입' },
    ],
    design: {
      title: '강화학습 설계',
      items: [
        { label: '상태', text: '도시 연결(인접 행렬)과 거리, 이미 경로에 들어간 도시' },
        { label: '행동', text: '다음에 경로에 넣을 도시 고르기' },
        { label: '보상', text: '도시를 넣어 늘어난 경로 길이를 그대로 감점' },
      ],
    },
    category: '강화학습 · 그래프 신경망',
    tags: ['Reinforcement learning', 'Structure2Vec', 'Deep Q-learning', 'Graph neural network', 'TensorFlow', 'NumPy'],
    source: 'https://github.com/GyuTae-Kim/TSP-GraphCombinatorialProblem_S2V',
    period: '2018.09–2021.06 · 학부연구생',
    result: {
      headline: '단축 학습에서는 무작위 삽입 대비 개선을 확인하지 못했습니다',
      thumb: 'assets/research/results/tsp/thumb',
      figures: [
        {
          src: 'assets/research/results/tsp/tour-race.webp',
          width: 960,
          height: 580,
          still: 'assets/research/results/tsp/tour-race-poster.webp',
          alt: '같은 도시 50개에서 학습 정책과 최원 삽입이 경로를 한 도시씩 쌓아 가는 애니메이션. 학습 정책은 번호 순서대로 도시를 골라 OR-Tools 대비 1.12배, 최원 삽입은 1.08배 경로를 만듭니다.',
          caption:
            '도시 50개인 한 문제의 경로 생성 과정입니다. 학습 정책(왼쪽)은 번호 순서대로 도시를 골라 OR-Tools 해보다 1.12배, 최원 삽입(오른쪽)은 1.08배 긴 경로를 만들었습니다. 아래 표는 여러 문제의 평균입니다.',
        },
      ],
      stats: [
        { value: '+12%', label: '위 50도시 예시 · OR-Tools 해보다 긴 경로' },
        { value: '개선 미확인', label: '무작위 순서 삽입과 비교한 단축 학습' },
        { value: '2가지', label: '코드에서 찾은 원인' },
      ],
      homeStat: { value: '2단계', label: 'AI 도시 선택 + 휴리스틱 경로 삽입' },
      summary:
        '원래 설정으로 학습해 보니, 정책이 모든 도시에 같은 Q값을 내며 번호 순서대로 도시를 골랐습니다.',
      story: [
        { label: '기대', text: '학습한 Q값이 경로를 짧게 만드는 도시를 고른다' },
        { label: '당시 판단', text: '학습할수록 경로 비용은 줄었지만 최적해에는 못 미쳤고, 도시가 많아 충분히 탐색하지 못했다고 봤다' },
        { label: '실제', text: '모든 도시의 Q값이 같아져 번호 순서대로 골랐다' },
        { label: '원인', text: '정규화 없는 이웃 합으로 값이 폭증했고, TD 목표가 시작 도시만 봤다' },
      ],
      retry: ['작은 문제에서 정답과 먼저 맞춰 보기', '이웃 합 정규화와 목표값 수정', '무작위 순서 기준선을 처음부터 두기'],
      details: {
        environment: 'TensorFlow 2.15 · seed 3개 · 에피소드 10,000 → 100',
        figures: [
          {
            src: 'assets/research/results/tsp/tours-compare.webp',
            width: 1800,
            height: 1000,
            alt: '같은 도시 50개에서 학습 정책이 만든 경로와 OR-Tools 경로. 학습 정책 경로는 1.12배 길고 왼쪽에 긴 간선이 엇갈립니다.',
            caption: '완성된 두 경로입니다. 학습 정책의 경로(왼쪽)는 OR-Tools 경로보다 1.12배 길고, 긴 간선이 엇갈립니다.',
          },
          {
            src: 'assets/research/results/tsp/insertion-steps.webp',
            width: 1800,
            height: 1980,
            alt: '도시 20개 문제에서 경로가 쌓이는 네 장면. 고른 도시, 끊긴 간선, 새 간선이 표시되어 있습니다.',
            caption:
              '경로를 만드는 방식입니다. 정책이 다음 도시(주황 점)를 고르면 삽입 함수가 경로가 가장 덜 늘어나는 자리의 간선(점선)을 끊고 새 간선으로 잇습니다.',
            compact: true,
          },
          {
            src: 'assets/research/results/tsp/method-bars.webp',
            width: 1800,
            height: 880,
            alt: '도시 50개와 100개 문제에서 방법별 평균 경로 길이 비율. 학습 정책 1.13과 1.12, 무작위 순서 삽입 1.14와 1.13, 최원 삽입 1.05와 1.06.',
            caption: 'OR-Tools를 1.00으로 둔 평균 경로 길이입니다. 학습 정책은 무작위 순서 삽입과 거의 같았고, 단순한 최원 삽입보다 길었습니다.',
            compact: true,
          },
        ],
        table: {
          caption: 'OR-Tools 해 대비 평균 투어 길이 비율 · 학습 범위는 도시 30–400개 · 학습 정책은 세 seed가 같은 투어를 냈습니다',
          columns: ['도시 수 (문제 수)', '학습 정책', '무작위 순서 + 삽입', '최원 삽입', '최근접 이웃', '학습 정책 vs 무작위 (Wilcoxon p)'],
          rows: [
            ['20 (100) · 학습 범위 밖', '1.11', '1.11', '1.03', '1.18', '0.96'],
            ['50 (50)', '1.13', '1.14', '1.05', '1.21', '0.24'],
            ['100 (30)', '1.12', '1.13', '1.06', '1.22', '0.38'],
          ],
        },
        findings: [
          {
            title: 'Q값 폭증',
            text: '정규화 없이 완전 그래프 전체를 더해 Q값이 수백만 단위로 커졌고, 갱신 손실이 10¹⁵ 단위까지 튀었습니다.',
          },
          {
            title: 'TD 목표값 오류',
            text: '목표값이 남은 도시가 아니라 늘 시작 도시의 Q값으로 계산됐고, n-step 다음 상태도 한 칸 어긋나 있었습니다.',
          },
          {
            title: '에피소드 100회로 줄임',
            text: '큰 그래프는 에피소드당 약 45초라 10,000회면 seed당 5일이 넘습니다. 횟수만 줄이고 나머지 설정은 그대로 뒀습니다.',
          },
        ],
      },
    },
  },
  {
    id: 'fashion-classification',
    previewLabel: 'Fashion-MNIST 예측 예시',
    role: '사전학습된 ResNet50V2로 의류를 분류하는 학습 코드와 클래스별 샘플링, 평가 코드를 구현하고, 혼동행렬로 잘못 분류한 사례를 분석했습니다.',
    outcome: 'K-Fashion 사진을 드레스, 아우터, 바지, 상의로 분류하도록 학습하고 결과를 분석하는 코드를 만들었습니다. 이후 공개 데이터인 Fashion-MNIST에서 설정을 하나씩 바꿔 가며, 데이터 증강과 숏컷 연결이 예측에 각각 어떤 영향을 주는지 확인했습니다.',
    fixes: [
      { problem: '의류 종류별 사진 수가 달라 학습 표본이 일부 클래스에 치우칩니다.', fix: '학습·검증 데이터에서 각각 가장 적은 클래스의 표본 수에 맞춰 다운샘플링했습니다.' },
      { problem: '전체 점수만으로는 어떤 옷을 서로 혼동하는지 알기 어렵습니다.', fix: '클래스별 정밀도·재현율과 혼동행렬을 기록하고, 드레스·아우터 등 혼동 사례를 사진과 함께 분석했습니다.' },
      { problem: '예측이 한쪽으로 쏠리는 현상에 데이터와 코드 설정이 함께 영향을 줄 수 있습니다.', fix: 'Fashion-MNIST에서 증강·숏컷·정규화 설정을 하나씩 바꿔 비교해, 쏠림의 원인을 코드 설정에서 찾았습니다.', label: '원인 분석' },
    ],
    built: [
      'ResNet50V2 분류 학습 코드',
      '학습, 검증 데이터를 클래스별로 다운샘플링',
      '클래스별 지표와 혼동행렬 검토',
      '드레스와 아우터 오류 사례 분석',
    ],
    borrowed: ['ImageNet 사전학습 ResNet50V2 가중치', 'K-Fashion 데이터'],
    limits: [
      'README의 평가는 검증 데이터를 다시 써서 독립 테스트가 아님',
      '오류 원인(불균형, 촬영 구도)까지는 검증하지 않음',
      '아래 수치는 Fashion-MNIST 4클래스로 10 epoch 학습한 결과',
    ],
    credit: 'ImageNet 사전학습 ResNet50V2 활용',
    connection:
      '클래스별 오류를 나눠 보고 평가 분할이 무엇을 뜻하는지 따져 본 경험이, 지금 CAD 가공 특징의 라벨과 모델을 평가하는 방식에도 남아 있습니다.',
    relatedProjectId: 'cad-feature-recognition',
    title: 'ResNet으로 의류 사진을 분류하는 모델',
    shortTitle: '의류 사진 분류',
    summary: 'K-Fashion 의류 사진을 드레스, 아우터, 바지, 상의로 나누도록 학습하고 클래스별 오류를 분석했습니다.',
    flow: [
      { label: '의류 사진 4종', text: '가장 적은 클래스 수에 맞춰 샘플링' },
      { label: 'ResNet50V2', text: 'ImageNet 사전학습 가중치로 시작' },
      { label: '클래스별 오류 분석', text: '정밀도, 재현율, 혼동행렬' },
    ],
    category: '컴퓨터 비전 · 이미지 분류',
    tags: ['TensorFlow', 'ResNet50V2', 'Class imbalance', 'Error analysis'],
    source: 'https://github.com/GyuTae-Kim/Classification_ResNet',
    image: 'assets/research/k-fashion-confusion-matrix.png',
    imageAlt:
      '공개 K-fashion 실험의 4개 클래스 혼동행렬. 여러 실제 클래스의 예측이 클래스 2로 몰려 있다.',
    imageCaption:
      '원래 K-Fashion 실험의 혼동행렬입니다. 행은 실제, 열은 예측 클래스이며 0=드레스, 1=아우터, 2=바지, 3=상의입니다. 여러 실제 클래스가 바지(2)로 예측되는 쏠림을 확인했습니다. 아래 Fashion-MNIST 실험과는 다른 자료입니다.',
    period: '2021 · 학부연구생',
    result: {
      headline: '예측 쏠림의 원인을 증강 설정과 숏컷 오류에서 찾았습니다',
      thumb: 'assets/research/results/classification/thumb',
      figures: [
        {
          src: 'assets/research/results/classification/accuracy-bars.webp',
          width: 1600,
          height: 982,
          alt: 'Fashion-MNIST 독립 테스트에서 원래 설정 48.9%, 숏컷 수정 78.7%, 증강 끔 94.4%, 여러 설정을 함께 수정한 경우 96.4%인 정확도 비교',
          caption: 'Fashion-MNIST 4클래스의 독립 테스트 정확도(seed 0)입니다. 증강을 끄는 실험과 숏컷을 고치는 실험을 각각 비교했고, 마지막 막대는 숏컷·증강·L2 설정을 함께 바꾼 결과입니다.',
          compact: true,
        },
      ],
      stats: [
        { value: '48.9% → 94.4%', label: '증강만 끈 비교 · Fashion-MNIST · seed 0' },
        { value: '+29.8%p', label: '숏컷 연결만 수정 · 같은 seed 0' },
        { value: '0%', label: '원래 설정의 코트 재현율 · 같은 seed 0' },
      ],
      homeStat: { value: '4종', label: '드레스 · 아우터 · 바지 · 상의 분류' },
      summary:
        '공개 데이터 Fashion-MNIST로 같은 코드를 돌려도 예측이 한쪽으로 쏠렸습니다. 원인은 증강 설정과 숏컷 연결 오류였습니다.',
      details: {
        environment: 'RTX A6000 · TensorFlow 2.15 · Fashion-MNIST 4클래스(드레스, 코트, 바지, 티셔츠) · 10 epoch',
        figures: [
          {
            src: 'assets/research/results/classification/prediction-gallery.webp',
            width: 2000,
            height: 857,
            alt: 'Fashion-MNIST 테스트 사진 8장. 원래 설정의 두 코트 예측은 드레스·티셔츠였고, 증강을 끈 모델은 8장을 모두 맞힌 예시',
            caption: 'Fashion-MNIST 사진 8장의 예측 예시입니다. 이 이미지를 만든 두 모델의 전체 정확도는 47.2%·94.2%로, 위 그래프의 seed 0과는 다른 실행입니다. 8장 중 맞힌 개수가 전체 정확도를 뜻하지는 않습니다.',
          },
        ],
        table: {
          caption: '독립 테스트 정확도 · 클래스당 1,000장 · 두 값은 seed 0 / 1',
          columns: ['바꾼 설정 (한 가지씩)', '테스트 정확도', '가장 많이 예측된 클래스 비율'],
          rows: [
            ['원래 설정', '48.9% / 39.1%', '36% / 49%'],
            ['증강 끔', '94.4% / 94.3%', '26% / 26%'],
            ['숏컷 연결 수정', '78.7% / 63.1%', '35% / 53%'],
            ['L2 계수 0.01 → 0.0001', '39.4%', '48%'],
            ['혼합 정밀도 끔', '52.2%', '51%'],
            ['모멘텀 0.1 → 0.9', '24.9%', '99.9%'],
            ['숏컷 수정 + 증강 끔 + L2 0.0001', '96.4%', '25%'],
          ],
        },
        findings: [
          {
            title: '증강이 의도보다 셌음',
            text: '약한 증강을 의도했지만 실제로는 ±72° 회전, 상하 뒤집기, 절반 크기 축소로 동작했고, 캐시 때문에 첫 epoch의 변형이 끝까지 고정됐습니다.',
          },
          {
            title: '숏컷 연결 오류',
            text: 'identity 숏컷이 원래 입력 대신 BN과 ReLU를 거친 값을 넘겼습니다. ImageNet 가중치는 오류 없이 들어가 겉으로는 드러나지 않았습니다.',
          },
          {
            title: '평가 방식',
            text: 'README의 recall은 0.5 임계값 기준이었고 평가에 검증 데이터를 다시 썼습니다. 여기 올린 정확도는 겹치지 않는 테스트 세트로 잰 값입니다.',
          },
        ],
      },
    },
  },
  {
    id: 'virtual-try-on',
    previewLabel: '포즈·인체 파싱 전처리 예시',
    role: '공개 가상 착용 모델에 필요한 입력 전처리와 의류 마스크를 구성하고, Flask 업로드 API와 Kotlin·Retrofit Android 클라이언트를 연결했습니다.',
    outcome: '인물 사진과 고른 옷을 받아 전처리하고, 착용 이미지를 만들어 앱으로 돌려주기까지 한 번에 동작하게 만들었습니다. 생성 모델과 포즈 추정, 인체 파싱 모델은 공개 모델을 그대로 썼고, 직접 구현한 것은 모델 입력 만들기와 마스크 처리, 서버와 앱 연동입니다.',
    fixes: [
      { problem: '가상 착용 모델에는 인물 사진 말고도 포즈와 신체 부위, 옷 영역을 정해진 형식으로 넣어야 합니다.', fix: '공개 인체 파싱·포즈 추정 모델의 출력을 ACGPN 입력 형식에 맞추고, GrabCut으로 의류 마스크를 만드는 전처리를 붙였습니다.' },
      { problem: '여러 모델의 파일 입출력을 사용자가 직접 다루기에는 과정이 복잡합니다.', fix: 'Flask 업로드 API 하나가 전처리와 추론을 차례로 실행해 결과 이미지를 돌려주게 했고, Android 앱은 Retrofit으로 이 API를 호출합니다.' },
      { problem: '의류 마스크에 배경이 섞이면 생성된 옷과 몸통이 함께 번질 수 있습니다.', fix: '공개 코드를 실행하다가 GrabCut 초기 사각형이 이미지 경계를 넘는 문제를 찾았고, 사각형을 이미지 안으로 줄인 비교 실험으로 마스크 IoU가 어떻게 바뀌는지 확인했습니다.', label: '보완 실험' },
    ],
    built: [
      '인체 파싱, 포즈, 의류 마스크를 ACGPN 입력 형식으로 정리',
      'OpenCV GrabCut으로 의류 마스크 생성',
      'Flask 업로드, 결과 반환 API',
      'Kotlin, Retrofit Android 클라이언트 연결',
    ],
    borrowed: ['ACGPN 가상 착용 모델', '인체 파싱, 포즈 추정 공개 모델'],
    limits: [
      '화질이나 속도를 개선한 성과가 아닌 통합 구현',
      '공개 가중치로 테스트 이미지 몇십 장을 돌린 값',
      '제품 수준 성능이나 상용 운영 여부는 보여 주지 않음',
    ],
    credit: 'ACGPN과 인체 파싱, 포즈 추정 공개 모델을 묶은 통합 구현',
    connection:
      '서로 다른 모듈의 입력과 출력을 맞춰 하나로 잇는 일은, 서버에서 만든 가공 계획을 Fusion에서 실행되게 하는 지금의 작업과 닮았습니다.',
    relatedProjectId: 'cad-feature-recognition',
    title: '인물 사진에 옷을 입혀 보는 가상 착용 앱',
    shortTitle: '가상 착용 앱',
    summary: '인물 사진과 입힐 옷을 고르면 서버가 가상 착용 이미지를 돌려주는 Android 앱과 서버를 만들었습니다.',
    flow: [
      { label: '인물 사진·입힐 옷 선택', text: 'Android 앱에서 인물 사진과 의류 ID 전송' },
      { label: '인체 파싱, 포즈, 옷 마스크', text: 'ACGPN 입력 형식으로 정리' },
      { label: '착용 이미지 생성', text: 'Flask 서버가 앱으로 반환' },
    ],
    category: '컴퓨터 비전 · 가상 착용',
    tags: ['PyTorch', 'Virtual try-on', 'Human parsing', 'Flask', 'Android'],
    source: 'https://github.com/GyuTae-Kim/Deeplearning_Try_On',
    period: '2021 · 학부연구생',
    result: {
      headline: '업로드부터 착용 결과 반환까지 확인하고 마스크 오류를 분석했습니다',
      thumb: 'assets/research/results/try-on/thumb',
      figures: [
        {
          src: 'assets/research/results/try-on/tryon-before-after.webp',
          width: 1920,
          height: 2480,
          alt: '착용 전후 세 사례. 원래 사진과 입힐 옷을 올리면 상의만 바뀐 착용 결과가 나옵니다. 얼굴은 모자이크했습니다.',
          caption: '공개 모델과 서버 코드로 만든 착용 예시 3건입니다. 각 행의 왼쪽은 인물 사진, 가운데는 입힐 옷, 오른쪽은 서버가 돌려준 이미지입니다. 얼굴은 모자이크했고, VITON-HD 테스트 이미지를 썼습니다.',
          compact: true,
        },
      ],
      stats: [
        { value: '13 / 40벌', label: '마스크가 배경까지 번진 옷' },
        { value: '0.93 → 0.96', label: '사각형을 고친 뒤 마스크 IoU' },
        { value: '4.9초', label: '요청 한 번 · CPU 중앙값' },
      ],
      homeStat: { value: '3단계', label: '전처리 → 착용 이미지 생성 → 앱 반환' },
      summary:
        '서버 업로드 API로 착용 이미지를 받아 보니, 옷 40벌 중 13벌은 GrabCut 사각형이 이미지 밖으로 나가 마스크가 배경까지 번졌습니다.',
      scope: '공개 코드 실행 · VITON-HD 테스트 이미지(CC BY-NC 4.0) · 얼굴 모자이크 · 아래 시간은 CPU 실험값',
      details: {
        environment: 'Apple M1 Pro CPU · PyTorch · 공개 가중치 · 서버 업로드 API 실행',
        figures: [
          {
            src: 'assets/research/results/try-on/pose-showcase.webp',
            width: 1920,
            height: 1520,
            alt: '인물 네 명의 사진 위에 겹친 포즈 골격(위)과 신체 부위별 색으로 칠한 인체 파싱(아래). 얼굴은 모자이크했습니다.',
            caption: '가져다 사용한 공개 모델의 포즈 추정(위)과 인체 파싱(아래) 결과입니다. 직접 구현한 전처리가 이 출력을 가상 착용 모델에 넣을 형식으로 맞춥니다.',
          },
        ],
        table: {
          caption: 'VITON-HD 테스트 이미지로 잰 값 · 192×256 해상도',
          columns: ['항목', '결과', '조건'],
          rows: [
            ['요청 한 번 처리 시간', '중앙값 4.90초 (사분위 3.57–6.57초)', '요청 40회, CPU'],
            ['그중 ACGPN 생성', '중앙값 2.27초', '같은 40회'],
            ['같은 옷 복원 SSIM', '평균 0.869 · 중앙값 0.884', '인물 20명'],
            ['GrabCut 마스크 IoU', '중앙값 0.929 → 0.957', '옷 40벌 · 코드 그대로 → 사각형을 이미지 안으로'],
          ],
        },
        findings: [
          {
            title: 'GrabCut 사각형 오류',
            text: '사각형 (1, 1, w, h)가 이미지 경계를 넘어 배경 단서가 위와 왼쪽 한 줄뿐이었고, 40벌 중 13벌에서 마스크가 배경까지 번졌습니다.',
          },
          {
            title: '실패 유형 세 가지',
            text: '마스크가 배경으로 새면 몸통이 번지고, 소매 길이가 바뀌면 팔에 잔상이 생기고, 기장이 다르면 원래 옷 무늬가 밑단 아래에 남습니다.',
          },
          {
            title: 'SSIM 읽는 법',
            text: '같은 옷을 다시 입혀 원본과 비교한 값입니다. 옷 밖은 입력을 그대로 쓰므로 점수가 후하고, ACGPN 논문 값과 비교할 수 없습니다.',
          },
          {
            title: '데이터와 가중치',
            text: 'VITON 데이터는 배포가 막혀 VITON-HD 테스트 이미지를 썼고, ACGPN과 OpenPose 가중치는 비상업 연구용으로 공개된 것입니다.',
          },
        ],
      },
    },
  },
];
