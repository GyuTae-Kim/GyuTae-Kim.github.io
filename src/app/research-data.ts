export interface ResearchWork {
  id: string;
  title: string;
  category: string;
  contribution: string[];
  reused: string;
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
  rerun?: ResearchRerun;
}

// Results from re-running the public code in 2026 (commands, seeds and caveats are kept
// alongside the generated figures). Numbers come only from those runs.
export interface ResearchRerun {
  label: string;
  environment: string;
  summary: string;
  // wide: spans the whole row; compact: keeps a chart near its drawn size instead of stretching it
  figures: { src: string; alt: string; caption: string; wide?: boolean; compact?: boolean }[];
  table?: { caption: string; columns: string[]; rows: string[][] };
  notes: string[];
}

// Entries describe inspectable public implementations and experimental notes.
// A referenced paper is prior work, not a publication authored by this portfolio owner.
export const RESEARCH_WORKS: ResearchWork[] = [
  {
    id: 'fashion-classification',
    contribution: [
      'ResNet50V2 분류 코드를 작성하고, 학습 데이터와 검증 데이터를 각각 클래스별로 다운샘플링했습니다.',
      '클래스별 지표와 혼동행렬을 검토하고, 드레스와 아우터에서 나온 오류 사례를 분석했습니다.',
    ],
    reused:
      'ImageNet으로 사전학습한 ResNet50V2 가중치와 K-fashion 데이터를 가져다 썼습니다. 직접 한 부분은 데이터 구성, 분류 학습 코드, 오류 분석입니다.',
    connection:
      '클래스별 오류를 나눠 보고 평가 분할이 무엇을 뜻하는지 따져 본 경험이, 지금 CAD 가공 특징의 라벨과 모델을 평가하는 방식에도 남아 있습니다.',
    relatedProjectId: 'cad-feature-recognition',
    relatedProjectTitle: 'CAD 형상 인식의 데이터와 모델 평가',
    title: '의류 분류의 데이터 불균형과 클래스 혼동 분석',
    category: 'Computer Vision · 실험 기록',
    question:
      '의류 데이터의 클래스 분포와 혼동행렬을 보면 어떤 분류 오류가 드러날까?',
    method:
      '의류 클래스 네 개를 대상으로, 학습 데이터와 검증 데이터를 각각 가장 적은 클래스의 개수에 맞춰 다운샘플링했습니다. 사전학습된 ResNet50V2로 분류 코드를 만들고 클래스별 precision과 recall, 혼동행렬을 살펴봤습니다.',
    observation:
      '공개된 실험 그림을 보면 실제 클래스가 달라도 예측이 한 클래스로 몰리는 오류가 보입니다. README에는 드레스와 아우터가 비슷하게 보이는 사례를 정리했습니다. 다만 불균형이나 촬영 구도 때문에 이런 오류가 생겼는지까지 검증하지는 않았습니다.',
    limitation:
      '평가 함수가 검증 데이터를 다시 쓰기 때문에 여기서 나온 결과는 독립된 테스트 성능이 아닙니다. 클래스 이름 설명도 일부 맞지 않고, 공개된 그림이 현재 코드와 같은 조건에서 나온 것인지도 확인하지 못했습니다. 그래서 샘플링 효과 비교나 대표 성능 수치는 싣지 않았습니다.',
    tags: ['TensorFlow', 'ResNet50V2', 'Class imbalance', 'Error analysis'],
    source: 'https://github.com/GyuTae-Kim/Classification_ResNet',
    image: 'assets/research/k-fashion-confusion-matrix.png',
    imageAlt:
      '공개 K-fashion 실험의 4개 클래스 혼동행렬. 여러 실제 클래스의 예측이 클래스 2로 몰려 있다.',
    imageCaption:
      '공개 저장소에 남아 있는 당시 실험 그림입니다. 현재 코드로 같은 조건에서 돌린 결과인지는 확인하지 못했습니다.',
    period: '2021 · 학부연구생',
    rerun: {
      label: '2026 재실행 · 대체 공개 데이터',
      environment: 'RTX A6000 · TensorFlow 2.15 · Fashion-MNIST 4클래스 · K-Fashion 성능 아님',
      summary:
        'K-Fashion은 AI Hub 이용 신청이 필요한 데이터라 이번에는 다시 받지 못했습니다. 대신 같은 코드에 공개 데이터 Fashion-MNIST의 네 클래스(드레스, 코트, 바지, 티셔츠)를 넣고, 2021년에 본 「예측이 한 클래스로 몰리는」 현상이 데이터 때문인지 코드 때문인지 확인했습니다. 쉬운 데이터에서도 같은 현상이 나왔고, 가장 큰 원인은 증강 설정이었습니다.',
      figures: [
        {
          src: 'assets/research/rerun/classification/augmentation_as_configured.webp',
          alt: '설정값 그대로 적용한 증강 결과. 드레스와 바지 원본 옆에 크게 회전하고 뒤집히고 절반 크기로 줄어 반사로 채워진 학습 이미지 네 장씩이 놓여 있습니다.',
          caption:
            '설정 파일은 약한 증강을 의도했지만, 값을 받는 Keras 전처리 레이어에서는 ±72° 회전, 상하 뒤집기, 절반 크기 축소와 반사 채움으로 동작했습니다. 증강 뒤에 캐시를 둬서 첫 epoch의 변형이 끝까지 고정되기도 했습니다.',
          wide: true,
        },
        {
          src: 'assets/research/rerun/classification/confusion_original_vs_no_aug.webp',
          alt: '독립 테스트 혼동행렬 두 개. 원래 설정은 정확도 48.9%이고 코트를 하나도 맞히지 못했으며, 증강을 끄면 정확도 94.4%입니다.',
          caption:
            '독립 테스트 4,000장의 혼동행렬입니다. 원래 설정은 정확도 48.9%에 코트를 한 장도 맞히지 못했고, 증강 하나만 끄면 94.4%가 됩니다.',
          wide: true,
        },
        {
          src: 'assets/research/rerun/classification/prediction_collapse_summary.webp',
          alt: '설정을 하나씩 바꾼 열 번의 실행에 대한 클래스별 예측 비율과 독립 테스트 정확도. 증강을 끈 실행만 예측이 고르게 나뉘고 정확도가 94% 이상입니다.',
          caption:
            '설정을 하나씩 바꿔 본 결과입니다. 칸이 진할수록 그 클래스로 예측이 몰렸다는 뜻이고, 고르게 나뉘면 25%입니다. 모멘텀을 0.9로 올리면 예측이 거의 한 클래스로 무너집니다.',
          wide: true,
          compact: true,
        },
      ],
      table: {
        caption: '독립 테스트 정확도 · Fashion-MNIST 4클래스, 클래스당 1,000장 · 10 epoch · 두 값은 seed 0 / 1',
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
        '코드를 다시 읽으며 숏컷 연결이 Keras의 ResNet50V2와 다르다는 것도 찾았습니다. identity 숏컷이 원래 입력 대신 BN과 ReLU를 거친 값을 넘깁니다. ImageNet 가중치는 오류 없이 들어가지만, 숏컷만 고쳐도 정확도가 48.9%에서 78.7%로 올랐습니다(seed 0 기준).',
        'L2 정규화 계수 0.01이 모든 합성곱 커널에 걸려 있어 학습 초기에는 정규화 항이 교차엔트로피의 약 40배였습니다. 다만 이 값만 줄여서는 나아지지 않았습니다.',
        'README의 클래스별 recall은 argmax가 아니라 0.5 임계값으로 계산한 값이었고, 평가 함수는 검증 데이터를 다시 썼습니다. 이번에는 학습·검증과 겹치지 않는 테스트 세트를 따로 두었습니다.',
        '쉬운 데이터로 10 epoch만 돌렸고, 시드를 두 개 쓴 설정은 일부입니다. TensorFlow 2.3 대신 2.15에서 실행했습니다. K-Fashion에서 같은 결과가 나오는지는 확인하지 않았습니다.',
      ],
    },
  },
  {
    id: 'graph-tsp',
    contribution: [
      '노드, 엣지, 도시 선택 상태를 담은 그래프 환경을 만들고 경로 비용을 기록하게 했습니다.',
      'Structure2Vec 임베딩, Q값 평가, 여러 스텝의 보상 누적, 경험 샘플링으로 이어지는 탐색 루프를 구현했습니다.',
    ],
    reused:
      'NeurIPS 2017에 발표된 그래프 조합 최적화 연구를 참고해 구현했습니다. 이 논문의 저자가 아니며, 독자적인 알고리즘을 개발한 것도 아닙니다.',
    connection:
      '그래프의 요소와 관계를 학습 입력으로 표현해 본 경험이, 판재와 면을 인식하는 지금의 연구로 이어졌습니다.',
    relatedProjectId: 'panel-classification',
    relatedProjectTitle: '판재와 면, 접촉 관계를 그래프로 표현한 분류 AI',
    title: 'Structure2Vec과 Q값 학습으로 TSP를 풀어 보려 한 시도',
    category: 'Graph Learning · 참조 논문 기반 구현',
    question: '그래프 표현 학습으로 조합 최적화 문제인 TSP의 경로를 만들 수 있을까?',
    method:
      'Structure2Vec 임베딩으로 Q값을 계산하고, 여기에 도시 삽입 휴리스틱과 여러 스텝의 보상 누적, 경험 샘플링을 붙였습니다. 기본 설정에서는 고른 도시를 경로 비용이 가장 작아지는 위치에 끼워 넣어 학습·평가 경로를 만듭니다.',
    observation:
      '어떤 도시를 넣을지는 학습한 모델이 고르고, 경로의 어디에 넣을지는 삽입 휴리스틱이 정하도록 역할을 나눴습니다. 도시 선택부터 보상, 학습, 경로 비용 기록까지 한 흐름으로 이어지게 만들었습니다.',
    limitation:
      '별도의 target network가 없고 보상 누적과 bootstrap 할인 방식도 표준 n-step DQN과 달라서, 원논문을 그대로 재현한 구현은 아닙니다. 2026년에 다시 돌려 보니 학습한 정책이 무작위 순서로 삽입한 것보다 낫지 않았고, 그 이유는 아래 재실행 결과에 정리했습니다.',
    tags: ['Graph neural network', 'Structure2Vec', 'Q-learning', 'TensorFlow'],
    source: 'https://github.com/GyuTae-Kim/TSP-GraphCombinatorialProblem_S2V',
    period: '2021 · 학부연구생',
    rerun: {
      label: '2026 재실행',
      environment: 'TensorFlow 2.15 · seed 3개 · 에피소드 10,000 → 100',
      summary:
        '원래 설정 그대로 학습을 다시 돌렸습니다. 큰 그래프가 나오기 시작하면 에피소드 하나에 약 45초가 걸려 설정된 10,000회는 seed당 5일이 넘습니다. 그래서 에피소드 수만 100회로 줄이고 seed 세 개로 돌렸습니다. 결과는 기대와 달랐습니다. 세 seed 모두 학습 초반에 임베딩이 꺼져 모든 도시에 같은 Q값을 냈고, 「학습한 정책」은 결국 도시를 번호 순서대로 고르는 것과 같아졌습니다. 성능은 무작위 순서로 삽입한 것과 통계적으로 차이가 없었습니다. 풀지는 못했지만, 왜 안 됐는지를 코드와 학습 기록으로 짚어 볼 수 있었습니다.',
      figures: [
        {
          src: 'assets/research/rerun/tsp/insertion-steps.webp',
          alt: '도시 20개짜리 문제에서 경로가 만들어지는 여섯 단계. 매 단계 고른 도시와, 그 도시를 끼워 넣느라 끊긴 간선과 새 간선이 표시되어 있습니다.',
          caption:
            '경로를 만드는 방식입니다. Q값이 다음 도시를 고르면, 삽입 함수가 경로가 가장 덜 늘어나는 자리에 그 도시를 끼워 넣습니다. 이번 재실행에서는 Q가 모든 도시에 같은 값을 내서 번호 순서대로 골랐습니다.',
          wide: true,
        },
        {
          src: 'assets/research/rerun/tsp/ratio.webp',
          alt: '도시 20, 50, 100개 문제에서 네 방법의 투어 길이를 OR-Tools 해와 비교한 점 그래프. 학습 정책과 무작위 순서 삽입은 1.11에서 1.14배로 비슷하고, 최원 삽입이 가장 짧습니다.',
          caption:
            'OR-Tools 해를 1로 둔 투어 길이입니다. 학습 정책(1.11–1.13배)은 무작위 순서 삽입과 차이가 없었고, 간단한 최원 삽입(1.03–1.06배)보다 길었습니다. OR-Tools 해는 도시 20개 문제 10개에서 정확한 최적해와 같았습니다.',
          wide: true,
        },
        {
          src: 'assets/research/rerun/tsp/training.webp',
          alt: '학습 손실과 검증 투어 길이 그래프. 손실은 처음에 1억 이상에서 시작해 크게 흔들리다 낮은 값에 머물고, 검증 투어 길이는 체크포인트 20부터 세 seed 모두 한 값에 고정됩니다.',
          caption:
            '왼쪽은 에피소드별 손실, 오른쪽은 체크포인트별 검증 투어 길이입니다. 마지막 손실이 낮은 것은 수렴이 아니라 모든 도시에 같은 값을 맞춘 결과이고, 체크포인트 20부터 세 seed의 검증 성능이 한 값에 멈춰 있습니다.',
          wide: true,
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
        '임베딩이 꺼진 직접적인 원인은 값의 크기였습니다. 정규화 없이 완전 그래프 전체를 더하는 구조라 도시 수가 늘면 Q값이 수백만 단위로 커졌고, 큰 그래프가 처음 나온 에피소드에서는 한 번의 갱신 손실이 10¹⁵ 단위까지 튀었습니다.',
        'TD 목표값에도 문제가 있었습니다. 남은 도시를 고르는 함수가 방문 표시가 아닌 시작 도시 표시를 보고 있어서, 목표값이 「남은 도시 중 최댓값」이 아니라 늘 시작 도시의 Q값으로 계산됐습니다. n-step 기록의 다음 상태도 한 칸 어긋나 있었습니다.',
        '다시 한다면 먼저 목표값과 n-step 기록을 고치고 작은 문제에서 정답과 맞춰 보는 테스트를 두겠습니다. 이웃 합을 정규화하고, 꺼진 유닛 비율과 도시별 Q값 차이를 학습 중에 기록하겠습니다. 「같은 삽입 함수 + 무작위 순서」와 「학습하지 않은 네트워크」도 처음부터 기준선으로 함께 보겠습니다.',
        '설정된 에피소드의 1%만 돌린 결과입니다. 이 정도 규모에서도 정책이 무너졌다는 점만 말해 주며, 끝까지 학습했을 때의 성능을 대신하지는 않습니다.',
      ],
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
    connection:
      '서로 다른 모듈의 입력과 출력을 맞춰 하나로 잇는 일은, 서버에서 만든 가공 계획을 Fusion에서 실행되게 하는 지금의 작업과 닮았습니다.',
    relatedProjectId: 'fusion-cam',
    relatedProjectTitle: '가공 계획을 Fusion 작업으로 옮기기',
    title: '가상 착용을 위한 이미지 전처리와 추론 통합',
    category: 'Computer Vision · 응용 구현',
    question:
      '인물 사진과 옷 이미지를 모델 입력으로 바꾸고, 결과를 앱에서 받아 볼 수 있을까?',
    method:
      '인체 파싱과 포즈 추정 결과, GrabCut으로 만든 의류 마스크를 ACGPN 입력 형식에 맞춰 묶었습니다. Kotlin과 Retrofit으로 만든 Android 클라이언트가 Flask API로 사진을 올리고 결과를 받아 오도록 연결했습니다.',
    observation:
      '이미지를 받아 전처리하고 추론하는 코드, 업로드와 결과 반환 API, Android에서 결과를 보여 주는 흐름까지 코드로 남겼습니다. 화질이나 추론 속도를 수치로 개선한 성과가 아니라 여러 모듈을 잇는 통합 구현 사례입니다.',
    limitation:
      '기존 가상 착용 모델을 응용해 통합한 사례입니다. 아래 재실행 수치는 2026년에 공개 가중치로 테스트 이미지 몇십 장을 돌려 본 결과라서, 제품 수준의 성능이나 상용 운영 여부까지 말해 주지는 않습니다.',
    tags: ['PyTorch', 'Virtual try-on', 'Human parsing', 'Flask', 'Android'],
    source: 'https://github.com/GyuTae-Kim/Deeplearning_Try_On',
    period: '2021 · 학부연구생',
    rerun: {
      label: '2026 재실행',
      environment: 'Apple M1 Pro CPU · 공개 가중치 · VITON-HD 테스트 이미지',
      summary:
        '2021년에 만든 Flask 서버를 공개된 가중치로 다시 띄웠습니다. Android 앱과 같은 업로드 요청을 보내 인체 파싱, 포즈 추정, GrabCut 의류 마스크, ACGPN 생성까지 차례로 돌렸고, 서버 코드는 고치지 않았습니다. 다시 돌려 보니 GrabCut에 넘기는 사각형이 이미지 경계를 넘어 일부 옷에서 마스크가 배경까지 번지는 문제가 보였습니다.',
      figures: [
        {
          src: 'assets/research/rerun/try-on/tryon-pipeline-grid-mosaic.webp',
          alt: '가상 착용 단계별 결과 세 쌍. 왼쪽부터 인물 사진, 인체 파싱, 포즈, 옷, GrabCut 의류 마스크, 모양을 맞춘 옷, 착용 결과입니다. 얼굴은 모자이크했습니다.',
          caption:
            '단계별 중간 결과입니다. 세 번째 줄은 마스크가 배경까지 번져 착용 결과가 흐려진 실패 사례입니다. VITON-HD 테스트 이미지(CC BY-NC 4.0)를 썼고 얼굴은 모자이크했습니다.',
          wide: true,
        },
        {
          src: 'assets/research/rerun/try-on/grabcut-vitonhd-iou.webp',
          alt: 'GrabCut 마스크와 VITON-HD 공식 의류 마스크의 IoU 분포. 저장소 코드 그대로는 중앙값 0.93, 사각형을 이미지 안으로 넣으면 0.96입니다.',
          caption:
            'GrabCut 마스크가 공식 의류 마스크와 얼마나 겹치는지(IoU, 옷 40벌). 코드의 사각형 (1, 1, w, h)가 오른쪽과 아래 경계를 넘어 배경 단서가 한쪽에만 남습니다. 사각형을 이미지 안으로 넣으면 중앙값이 0.93에서 0.96으로 오릅니다.',
          wide: true,
        },
        {
          src: 'assets/research/rerun/try-on/tryon-latency.webp',
          alt: '요청 한 번의 단계별 처리 시간 막대그래프. ACGPN 생성 2.27초, 포즈 추정 1.15초, 인체 파싱 0.77초, GrabCut 0.28초.',
          caption:
            '요청 한 번의 단계별 처리 시간(중앙값, 요청 40회). 다른 작업과 CPU를 나눠 쓰던 상태에서 잰 값입니다.',
          wide: true,
          compact: true,
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
          ['마스크 종류별 SSIM', '중앙값 0.884 → 0.896 → 0.902', '코드 그대로 → 사각형 수정 → 공식 마스크'],
        ],
      },
      notes: [
        'SSIM은 같은 옷을 다시 입혀 원본 사진과 비교한 값입니다. 옷 밖의 영역은 입력에서 그대로 가져오므로 점수가 후하게 나오고, 데이터셋과 전처리가 달라 ACGPN 논문의 값과는 비교할 수 없습니다.',
        '눈으로 본 실패 유형은 세 가지였습니다. 마스크가 배경으로 새면 몸통이 번지고, 소매 길이가 바뀌면 팔에 잔상이나 빈 곳이 생기고, 기장이 다르면 원래 옷 무늬가 밑단 아래에 남습니다.',
        '원래 쓰던 VITON 데이터는 원 저장소가 저작권 문제로 배포를 막아 두어 쓰지 않았습니다. ACGPN과 OpenPose 가중치는 비상업 연구용 조건으로 공개된 것입니다.',
      ],
    },
  },
];
