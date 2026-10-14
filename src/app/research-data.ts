export interface ResearchWork {
  id: string;
  // What the project is: name, one-sentence summary and a 3-step flow come before the results.
  title: string;
  shortTitle: string;
  summary: string;
  flow: { label: string; text: string }[];
  category: string;
  // 「자세히」 lists, one short line each: what he built, what came from others, what the work does not show.
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
// figures and 2–3 numbers up front; run conditions, tables and caveats sit under "자세히".
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
  scope: string;
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
    built: [
      '노드, 엣지, 방문 상태를 담은 그래프 환경과 경로 비용 기록',
      'Structure2Vec 임베딩과 Q값 평가',
      '여러 스텝 보상 누적과 경험 샘플링을 잇는 탐색 루프',
      '도시는 모델이 고르고 넣을 자리는 삽입 휴리스틱이 정하는 구조',
    ],
    borrowed: ['NeurIPS 2017 그래프 조합 최적화 연구의 방법 (논문 저자 아님)'],
    limits: [
      '원논문 그대로의 재현 아님 (target network 없음, n-step 방식 다름)',
      '설정된 에피소드의 1%만 학습',
      '끝까지 학습했을 때의 성능은 알 수 없음',
    ],
    credit: 'NeurIPS 2017 그래프 조합 최적화 연구를 참고한 구현',
    connection:
      '그래프의 요소와 관계를 학습 입력으로 표현해 본 경험이, 가구 패널과 면을 인식하는 지금의 연구로 이어졌습니다.',
    relatedProjectId: 'panel-classification',
    title: '강화학습으로 TSP 경로를 만드는 그래프 모델',
    shortTitle: 'TSP 경로 탐색',
    summary: '도시를 그래프로 표현하고, 다음에 갈 도시를 강화학습으로 고르게 했습니다.',
    flow: [
      { label: '그래프로 표현', text: '도시, 거리, 방문 여부' },
      { label: 'Structure2Vec + Q-learning', text: '도시마다 Q값 계산' },
      { label: '다음 도시 선택', text: '경로가 가장 덜 늘어나는 자리에 삽입' },
    ],
    category: '강화학습 · 그래프 신경망',
    tags: ['Reinforcement learning', 'Structure2Vec', 'Q-learning', 'Graph neural network', 'TensorFlow'],
    source: 'https://github.com/GyuTae-Kim/TSP-GraphCombinatorialProblem_S2V',
    period: '2021 · 학부연구생',
    result: {
      headline: '학습한 정책이 무작위 순서와 다르지 않았습니다',
      thumb: 'assets/research/results/tsp/thumb',
      figures: [
        {
          src: 'assets/research/results/tsp/tour-race.webp',
          width: 960,
          height: 580,
          still: 'assets/research/results/tsp/tour-race-poster.webp',
          alt: '같은 도시 50개에서 학습 정책과 최원 삽입이 경로를 한 도시씩 쌓아 가는 애니메이션. 학습 정책은 번호 순서대로 도시를 골라 OR-Tools 대비 1.12배, 최원 삽입은 1.08배 경로를 만듭니다.',
          caption:
            '같은 도시 50개에서 학습 정책(왼쪽)은 도시를 번호 순서대로 골라 OR-Tools보다 1.12배 긴 경로를 만들었고, 최원 삽입(오른쪽)은 1.08배였습니다.',
        },
      ],
      stats: [
        { value: '+12%', label: 'OR-Tools보다 긴 경로' },
        { value: '차이 없음', label: '무작위 순서 삽입과 비교' },
        { value: '2가지', label: '코드에서 찾은 원인' },
      ],
      homeStat: { value: '2가지', label: '코드에서 찾은 실패 원인' },
      summary:
        '원래 설정으로 학습해 보니, 정책이 모든 도시에 같은 Q값을 내며 번호 순서대로 도시를 골랐습니다.',
      story: [
        { label: '기대', text: '학습한 Q값이 경로를 짧게 만드는 도시를 고른다' },
        { label: '실제', text: '모든 도시의 Q값이 같아져 번호 순서대로 골랐다' },
        { label: '원인', text: '정규화 없는 이웃 합으로 값이 폭증했고, TD 목표가 시작 도시만 봤다' },
      ],
      retry: ['작은 문제에서 정답과 먼저 맞춰 보기', '이웃 합 정규화와 목표값 수정', '무작위 순서 기준선을 처음부터 두기'],
      scope: '설정된 에피소드의 1%(100회)만 돌린 결과',
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
      '여기 올린 결과는 대체 데이터(Fashion-MNIST)로 10 epoch 학습한 것',
      '맨 위 그림은 다른 seed로 학습한 두 모델의 답 (정확도 47.2%, 94.2%)',
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
      'K-Fashion으로 학습한 공개 저장소 그림 · README 수치와 같은 조건인지는 확인 못 함',
    period: '2021 · 학부연구생',
    result: {
      headline: '설정 오류 두 곳 때문에 정확도가 절반에 머물렀습니다',
      thumb: 'assets/research/results/classification/thumb',
      figures: [
        {
          src: 'assets/research/results/classification/prediction-gallery.webp',
          width: 2000,
          height: 857,
          alt: '테스트 이미지 8장에 대한 두 모델의 답. 원래 설정은 드레스 하나, 코트 둘, 바지 하나를 틀렸고, 증강을 끈 모델은 8장을 모두 맞혔습니다.',
          caption: '같은 테스트 이미지에 대한 두 모델의 답입니다. 원래 설정은 코트를 드레스나 티셔츠로 답했고, 증강만 끈 모델은 모두 맞혔습니다.',
        },
      ],
      stats: [
        { value: '48.9% → 94.4%', label: '증강만 껐을 때 정확도' },
        { value: '+29.8%p', label: '숏컷 연결만 고쳤을 때' },
        { value: '0%', label: '원래 설정의 코트 정답률' },
      ],
      summary:
        '공개 데이터 Fashion-MNIST로 같은 코드를 돌려도 예측이 한쪽으로 쏠렸습니다. 원인은 증강 설정과 숏컷 연결 오류였습니다.',
      scope: '대체 공개 데이터 결과 · K-Fashion 성능 아님',
      details: {
        environment: 'RTX A6000 · TensorFlow 2.15 · Fashion-MNIST 4클래스(드레스, 코트, 바지, 티셔츠) · 10 epoch',
        figures: [
          {
            src: 'assets/research/results/classification/accuracy-bars.webp',
            width: 1600,
            height: 982,
            alt: '설정별 독립 테스트 정확도 막대. 원래 설정 48.9%, 숏컷 연결 수정 78.7%, 증강 끔 94.4%, 모두 수정 96.4%.',
            caption: '설정을 하나씩 고쳤을 때의 독립 테스트 정확도입니다(seed 0).',
            compact: true,
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
          {
            title: '대체 데이터',
            text: 'K-Fashion은 AI Hub 이용 신청이 필요해, 여기 올린 결과는 공개 데이터 Fashion-MNIST로 돌린 것입니다.',
          },
        ],
      },
    },
  },
  {
    id: 'virtual-try-on',
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
    summary: '인물 사진과 옷 사진을 올리면 옷을 갈아입힌 이미지를 돌려주는 서버와 Android 앱을 만들었습니다.',
    flow: [
      { label: '인물 사진과 옷 사진', text: 'Android 앱에서 업로드' },
      { label: '인체 파싱, 포즈, 옷 마스크', text: 'ACGPN 입력 형식으로 정리' },
      { label: '착용 이미지 생성', text: 'Flask 서버가 앱으로 반환' },
    ],
    category: '컴퓨터 비전 · 가상 착용',
    tags: ['PyTorch', 'Virtual try-on', 'Human parsing', 'Flask', 'Android'],
    source: 'https://github.com/GyuTae-Kim/Deeplearning_Try_On',
    period: '2021 · 학부연구생',
    result: {
      headline: '옷 마스크가 배경까지 번지는 원인을 찾았습니다',
      thumb: 'assets/research/results/try-on/thumb',
      figures: [
        {
          src: 'assets/research/results/try-on/tryon-before-after.webp',
          width: 1920,
          height: 2480,
          alt: '착용 전후 세 사례. 원래 사진과 입힐 옷을 올리면 상의만 바뀐 착용 결과가 나옵니다. 얼굴은 모자이크했습니다.',
          caption: '원래 사진과 입힐 옷을 올리면 서버가 상의만 바꿔 입힌 이미지를 돌려줍니다.',
          compact: true,
        },
        {
          src: 'assets/research/results/try-on/pose-showcase.webp',
          width: 1920,
          height: 1520,
          alt: '인물 네 명의 사진 위에 겹친 포즈 골격(위)과 신체 부위별 색으로 칠한 인체 파싱(아래). 얼굴은 모자이크했습니다.',
          caption: '같은 서버가 찾은 포즈(위)와 신체 부위 분할(아래)입니다. 이 결과로 옷을 몸에 맞춰 놓습니다.',
        },
      ],
      stats: [
        { value: '13 / 40벌', label: '마스크가 배경까지 번진 옷' },
        { value: '0.93 → 0.96', label: '사각형을 고친 뒤 마스크 IoU' },
        { value: '4.9초', label: '요청 한 번 · CPU 중앙값' },
      ],
      summary:
        '앱과 같은 업로드 요청으로 착용 이미지를 받아 보니, 옷 40벌 중 13벌은 GrabCut 사각형이 이미지 밖으로 나가 마스크가 배경까지 번졌습니다.',
      scope: 'VITON-HD 테스트 이미지(CC BY-NC 4.0) · 얼굴 모자이크',
      details: {
        environment: 'Apple M1 Pro CPU · PyTorch · 공개 가중치 · 공개한 서버 코드 그대로',
        figures: [
          {
            src: 'assets/research/results/try-on/pipeline-compact.webp',
            width: 1920,
            height: 645,
            alt: '한 사람에 대한 사진, 인체 파싱, 포즈, 의류 마스크와 착용 결과. 얼굴은 모자이크했습니다.',
            caption: '사진에서 인체 파싱과 포즈를, 옷 사진에서 의류 마스크를 만들어 ACGPN에 넣으면 착용 결과가 나옵니다.',
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
