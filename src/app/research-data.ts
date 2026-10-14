export interface ResearchWork {
  id: string;
  title: string;
  category: string;
  contribution: string[];
  reused: string;
  // One visible line naming the prior work or models this research builds on.
  credit: string;
  connection: string;
  relatedProjectId: string;
  relatedProjectTitle: string;
  question: string;
  method: string;
  observation: string;
  limitation: string;
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
  alt: string;
  caption: string;
  // compact: keeps a tall or chart-like image near its drawn size instead of the full column
  compact?: boolean;
  // still: shown instead of an animated src to readers who prefer reduced motion
  still?: string;
}

// The 2026 rerun of the public code, shown as a result card: one headline, the strongest
// figures and 2–3 numbers up front; run conditions, tables and caveats sit under "자세히".
// Numbers come only from those runs (commands, seeds and caveats are kept with the figures).
export interface ResearchResult {
  headline: string;
  // still image for the home page result card
  thumb: string;
  figures: ResearchFigure[];
  stats: { value: string; label: string }[];
  summary: string;
  scope: string;
  story?: { label: string; text: string }[];
  retry?: string[];
  details: {
    environment: string;
    figures: ResearchFigure[];
    table?: { caption: string; columns: string[]; rows: string[][] };
    notes: string[];
  };
}

// Entries describe inspectable public implementations and experimental notes.
// A referenced paper is prior work, not a publication authored by this portfolio owner.
export const RESEARCH_WORKS: ResearchWork[] = [
  {
    id: 'graph-tsp',
    contribution: [
      '노드, 엣지, 도시 선택 상태를 담은 그래프 환경을 만들고 경로 비용을 기록하게 했습니다.',
      'Structure2Vec 임베딩, Q값 평가, 여러 스텝의 보상 누적, 경험 샘플링으로 이어지는 탐색 루프를 구현했습니다.',
    ],
    reused:
      'NeurIPS 2017에 발표된 그래프 조합 최적화 연구를 참고해 구현했습니다. 이 논문의 저자가 아니며, 독자적인 알고리즘을 개발한 것도 아닙니다.',
    credit: 'NeurIPS 2017 그래프 조합 최적화 연구를 참고한 구현',
    connection:
      '그래프의 요소와 관계를 학습 입력으로 표현해 본 경험이, 판재와 면을 인식하는 지금의 연구로 이어졌습니다.',
    relatedProjectId: 'panel-classification',
    relatedProjectTitle: '가구 패널을 인식해 제조 데이터로 바꾸는 AI',
    title: '강화학습과 그래프 네트워크로 TSP를 풀어 보려 한 시도',
    category: 'Reinforcement Learning × Graph Network · 참조 논문 기반 구현',
    question: '강화학습과 그래프 네트워크를 합쳐 조합 최적화 문제인 TSP의 경로를 만들 수 있을까?',
    method:
      'Structure2Vec 임베딩으로 Q값을 계산하고, 여기에 도시 삽입 휴리스틱과 여러 스텝의 보상 누적, 경험 샘플링을 붙였습니다. 기본 설정에서는 고른 도시를 경로 비용이 가장 작아지는 위치에 끼워 넣어 학습·평가 경로를 만듭니다.',
    observation:
      '어떤 도시를 넣을지는 학습한 모델이 고르고, 경로의 어디에 넣을지는 삽입 휴리스틱이 정하도록 역할을 나눴습니다. 도시 선택부터 보상, 학습, 경로 비용 기록까지 한 흐름으로 이어지게 만들었습니다.',
    limitation:
      '별도의 target network가 없고 보상 누적과 bootstrap 할인 방식도 표준 n-step DQN과 달라서, 원논문을 그대로 재현한 구현은 아닙니다. 2026년에 다시 돌려 보니 학습한 정책이 무작위 순서로 삽입한 것보다 낫지 않았습니다.',
    tags: ['Reinforcement learning', 'Structure2Vec', 'Q-learning', 'Graph neural network', 'TensorFlow'],
    source: 'https://github.com/GyuTae-Kim/TSP-GraphCombinatorialProblem_S2V',
    period: '2021 · 학부연구생',
    result: {
      headline: '학습한 정책은 무작위 순서와 다르지 않았습니다',
      thumb: 'assets/research/rerun/tsp/tours-compare.webp',
      figures: [
        {
          src: 'assets/research/rerun/tsp/tour-race.webp',
          still: 'assets/research/rerun/tsp/tour-race-poster.webp',
          alt: '같은 도시 50개에서 학습 정책과 최원 삽입이 경로를 한 도시씩 쌓아 가는 애니메이션. 학습 정책은 번호 순서대로 도시를 골라 OR-Tools 대비 1.12배, 최원 삽입은 1.08배 경로를 만듭니다.',
          caption:
            '같은 도시 50개에서 학습 정책(왼쪽)은 도시를 번호 순서대로 골라 OR-Tools보다 1.12배 긴 경로를 만들었고, 최원 삽입(오른쪽)은 1.08배였습니다.',
        },
      ],
      stats: [
        { value: '1.12배', label: 'OR-Tools 대비 경로 길이' },
        { value: '차이 없음', label: '무작위 순서 삽입과 비교' },
        { value: '2가지', label: '코드에서 찾은 원인' },
      ],
      summary:
        '2021년 코드를 원래 설정으로 다시 학습해 보니, 정책이 모든 도시에 같은 Q값을 내며 번호 순서대로 도시를 골랐습니다.',
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
            src: 'assets/research/rerun/tsp/tours-compare.webp',
            alt: '같은 도시 50개에서 학습 정책이 만든 경로와 OR-Tools 경로. 학습 정책 경로는 1.12배 길고 왼쪽에 긴 간선이 엇갈립니다.',
            caption: '완성된 두 경로입니다. 학습 정책의 경로(왼쪽)는 OR-Tools 경로보다 1.12배 길고, 긴 간선이 엇갈립니다.',
          },
          {
            src: 'assets/research/rerun/tsp/insertion-steps.webp',
            alt: '도시 20개 문제에서 경로가 쌓이는 네 장면. 고른 도시, 끊긴 간선, 새 간선이 표시되어 있습니다.',
            caption:
              '경로를 만드는 방식입니다. 정책이 다음 도시(주황 점)를 고르면 삽입 함수가 경로가 가장 덜 늘어나는 자리의 간선(점선)을 끊고 새 간선으로 잇습니다.',
            compact: true,
          },
          {
            src: 'assets/research/rerun/tsp/method-bars.webp',
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
        notes: [
          '큰 그래프가 나오면 에피소드 하나에 약 45초가 걸려, 설정된 10,000회는 seed당 5일이 넘습니다. 그래서 에피소드 수만 100회로 줄였고 나머지 설정은 그대로 두었습니다.',
          '임베딩이 꺼진 직접적인 원인은 값의 크기였습니다. 정규화 없이 완전 그래프 전체를 더하는 구조라 도시 수가 늘면 Q값이 수백만 단위로 커졌고, 큰 그래프가 처음 나온 에피소드에서는 한 번의 갱신 손실이 10¹⁵ 단위까지 튀었습니다.',
          'TD 목표값에도 문제가 있었습니다. 남은 도시를 고르는 함수가 방문 표시가 아닌 시작 도시 표시를 보고 있어서, 목표값이 「남은 도시 중 최댓값」이 아니라 늘 시작 도시의 Q값으로 계산됐습니다. n-step 기록의 다음 상태도 한 칸 어긋나 있었습니다.',
          '이 결과는 이 정도 규모에서도 정책이 무너졌다는 점만 말해 주며, 끝까지 학습했을 때의 성능을 대신하지는 않습니다.',
        ],
      },
    },
  },
  {
    id: 'fashion-classification',
    contribution: [
      'ResNet50V2 분류 코드를 작성하고, 학습 데이터와 검증 데이터를 각각 클래스별로 다운샘플링했습니다.',
      '클래스별 지표와 혼동행렬을 검토하고, 드레스와 아우터에서 나온 오류 사례를 분석했습니다.',
    ],
    reused:
      'ImageNet으로 사전학습한 ResNet50V2 가중치와 K-fashion 데이터를 가져다 썼습니다. 직접 한 부분은 데이터 구성, 분류 학습 코드, 오류 분석입니다.',
    credit: 'ImageNet 사전학습 ResNet50V2 활용',
    connection:
      '클래스별 오류를 나눠 보고 평가 분할이 무엇을 뜻하는지 따져 본 경험이, 지금 CAD 가공 특징의 라벨과 모델을 평가하는 방식에도 남아 있습니다.',
    relatedProjectId: 'cad-feature-recognition',
    relatedProjectTitle: '3D 모델의 가공 특징 인식과 모델 평가',
    title: '의류 분류의 데이터 불균형과 클래스 혼동 분석',
    category: 'Computer Vision · 실험 기록',
    question:
      '의류 데이터의 클래스 분포와 혼동행렬을 보면 어떤 분류 오류가 드러날까?',
    method:
      '의류 클래스 네 개를 대상으로, 학습 데이터와 검증 데이터를 각각 가장 적은 클래스의 개수에 맞춰 다운샘플링했습니다. 사전학습된 ResNet50V2로 분류 코드를 만들고 클래스별 precision과 recall, 혼동행렬을 살펴봤습니다.',
    observation:
      '공개된 실험 그림을 보면 실제 클래스가 달라도 예측이 한 클래스로 몰리는 오류가 보입니다. README에는 드레스와 아우터가 비슷하게 보이는 사례를 정리했습니다. 다만 불균형이나 촬영 구도 때문에 이런 오류가 생겼는지까지 검증하지는 않았습니다.',
    limitation:
      '평가 함수가 검증 데이터를 다시 쓰기 때문에 2021년 결과는 독립된 테스트 성능이 아닙니다. 클래스 이름 설명도 일부 맞지 않고, 공개된 그림이 현재 코드와 같은 조건에서 나온 것인지도 확인하지 못했습니다.',
    tags: ['TensorFlow', 'ResNet50V2', 'Class imbalance', 'Error analysis'],
    source: 'https://github.com/GyuTae-Kim/Classification_ResNet',
    image: 'assets/research/k-fashion-confusion-matrix.png',
    imageAlt:
      '공개 K-fashion 실험의 4개 클래스 혼동행렬. 여러 실제 클래스의 예측이 클래스 2로 몰려 있다.',
    imageCaption:
      '2021년 공개 저장소에 남아 있는 당시 실험 그림입니다. 현재 코드로 같은 조건에서 돌린 결과인지는 확인하지 못했습니다.',
    period: '2021 · 학부연구생',
    result: {
      headline: '증강 설정 하나가 정확도를 절반으로 떨어뜨렸습니다',
      thumb: 'assets/research/rerun/classification/prediction-gallery.webp',
      figures: [
        {
          src: 'assets/research/rerun/classification/prediction-gallery.webp',
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
        'K-Fashion 대신 공개 데이터 Fashion-MNIST로 2021년 코드를 다시 돌렸습니다. 쉬운 데이터에서도 예측이 한쪽으로 쏠렸고, 원인은 증강 설정과 숏컷 연결 오류였습니다.',
      scope: '대체 공개 데이터 결과 · K-Fashion 성능 아님',
      details: {
        environment: 'RTX A6000 · TensorFlow 2.15 · Fashion-MNIST 4클래스(드레스, 코트, 바지, 티셔츠) · 10 epoch',
        figures: [
          {
            src: 'assets/research/rerun/classification/accuracy-bars.webp',
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
        notes: [
          'K-Fashion은 AI Hub 이용 신청이 필요한 데이터라 이번에는 다시 받지 못했습니다.',
          '설정 파일은 약한 증강을 의도했지만, 값을 받는 Keras 전처리 레이어에서는 ±72° 회전, 상하 뒤집기, 절반 크기 축소로 동작했습니다. 증강 뒤에 캐시를 둬서 첫 epoch의 변형이 끝까지 고정되기도 했습니다.',
          'identity 숏컷이 원래 입력 대신 BN과 ReLU를 거친 값을 넘기고 있었습니다(Keras의 ResNet50V2와 다른 연결). ImageNet 가중치는 오류 없이 들어가서 겉으로는 드러나지 않았습니다.',
          'README의 클래스별 recall은 argmax가 아니라 0.5 임계값으로 계산한 값이었고, 평가 함수는 검증 데이터를 다시 썼습니다. 이번에는 학습·검증과 겹치지 않는 테스트 세트를 따로 두었습니다.',
          '맨 위 그림은 이미지별 예측을 남기려고 같은 설정을 한 번 더 돌린 결과입니다(정확도 47.2%와 94.2%). 쉬운 데이터로 10 epoch만 돌렸고, TensorFlow 2.3 대신 2.15에서 실행했습니다.',
        ],
      },
    },
  },
  {
    id: 'virtual-try-on',
    contribution: [
      '인체 파싱과 포즈 추정 결과, GrabCut으로 만든 의류 마스크를 가상 착용 모델의 입력으로 묶었습니다.',
      'Flask로 만든 이미지 업로드·결과 반환 API를 Android 클라이언트와 연결했습니다.',
    ],
    reused:
      'ACGPN, 인체 파싱, 포즈 추정은 기존 모델을 그대로 썼고 의류 마스크는 OpenCV GrabCut으로 만들었습니다. 직접 한 부분은 전처리, 입출력 처리, 서버와 앱 연결입니다.',
    credit: 'ACGPN·인체 파싱·포즈 추정 공개 모델을 묶은 통합 구현',
    connection:
      '서로 다른 모듈의 입력과 출력을 맞춰 하나로 잇는 일은, 서버에서 만든 가공 계획을 Fusion에서 실행되게 하는 지금의 작업과 닮았습니다.',
    relatedProjectId: 'cad-feature-recognition',
    relatedProjectTitle: '가공 전략을 Fusion CAM 공정으로 옮기기',
    title: '가상 착용을 위한 이미지 전처리와 추론 통합',
    category: 'Computer Vision · 응용 구현',
    question:
      '인물 사진과 옷 이미지를 모델 입력으로 바꾸고, 결과를 앱에서 받아 볼 수 있을까?',
    method:
      '인체 파싱과 포즈 추정 결과, GrabCut으로 만든 의류 마스크를 ACGPN 입력 형식에 맞춰 묶었습니다. Kotlin과 Retrofit으로 만든 Android 클라이언트가 Flask API로 사진을 올리고 결과를 받아 오도록 연결했습니다.',
    observation:
      '이미지를 받아 전처리하고 추론하는 코드, 업로드와 결과 반환 API, Android에서 결과를 보여 주는 흐름까지 코드로 남겼습니다. 화질이나 추론 속도를 수치로 개선한 성과가 아니라 여러 모듈을 잇는 통합 구현 사례입니다.',
    limitation:
      '기존 가상 착용 모델을 응용해 통합한 사례입니다. 재실행 수치는 2026년에 공개 가중치로 테스트 이미지 몇십 장을 돌려 본 결과라서, 제품 수준의 성능이나 상용 운영 여부까지 말해 주지는 않습니다.',
    tags: ['PyTorch', 'Virtual try-on', 'Human parsing', 'Flask', 'Android'],
    source: 'https://github.com/GyuTae-Kim/Deeplearning_Try_On',
    period: '2021 · 학부연구생',
    result: {
      headline: '사진 두 장으로 옷을 갈아입히는 서버를 다시 띄웠습니다',
      thumb: 'assets/research/rerun/try-on/pose-showcase.webp',
      figures: [
        {
          src: 'assets/research/rerun/try-on/tryon-before-after.webp',
          alt: '착용 전후 세 사례. 원래 사진과 입힐 옷을 올리면 상의만 바뀐 착용 결과가 나옵니다. 얼굴은 모자이크했습니다.',
          caption: '원래 사진과 입힐 옷을 올리면 서버가 상의만 바꿔 입힌 이미지를 돌려줍니다.',
          compact: true,
        },
        {
          src: 'assets/research/rerun/try-on/pose-showcase.webp',
          alt: '인물 네 명의 사진 위에 겹친 포즈 골격(위)과 신체 부위별 색으로 칠한 인체 파싱(아래). 얼굴은 모자이크했습니다.',
          caption: '같은 서버가 찾은 포즈(위)와 신체 부위 분할(아래)입니다. 이 결과로 옷을 몸에 맞춰 놓습니다.',
        },
      ],
      stats: [
        { value: '4.9초', label: '요청 한 번 · CPU 중앙값' },
        { value: '0.93 → 0.96', label: '마스크 사각형을 고친 IoU' },
        { value: '0.88', label: '같은 옷 복원 SSIM' },
      ],
      summary:
        '2021년에 만든 Flask 서버를 공개 가중치로 다시 띄워, 앱과 같은 업로드 요청으로 인체 파싱, 포즈 추정, 의류 마스크, 착용 이미지 생성까지 돌렸습니다.',
      scope: 'VITON-HD 테스트 이미지(CC BY-NC 4.0) · 얼굴 모자이크',
      details: {
        environment: 'Apple M1 Pro CPU · PyTorch · 공개 가중치 · 서버 코드 수정 없음',
        figures: [
          {
            src: 'assets/research/rerun/try-on/pipeline-compact.webp',
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
        notes: [
          'GrabCut에 넘기는 사각형 (1, 1, w, h)가 이미지 오른쪽과 아래 경계를 넘어, 배경 단서가 위·왼쪽 한 줄뿐이었습니다. 그래서 40벌 중 13벌에서 마스크가 배경까지 번졌습니다.',
          'SSIM은 같은 옷을 다시 입혀 원본 사진과 비교한 값입니다. 옷 밖의 영역은 입력에서 그대로 가져오므로 점수가 후하게 나오고, ACGPN 논문의 값과는 비교할 수 없습니다.',
          '눈으로 본 실패 유형은 세 가지였습니다. 마스크가 배경으로 새면 몸통이 번지고, 소매 길이가 바뀌면 팔에 잔상이 생기고, 기장이 다르면 원래 옷 무늬가 밑단 아래에 남습니다.',
          '원래 쓰던 VITON 데이터는 원 저장소가 저작권 문제로 배포를 막아 두어 쓰지 않았습니다. ACGPN과 OpenPose 가중치는 비상업 연구용 조건으로 공개된 것입니다.',
        ],
      },
    },
  },
];
