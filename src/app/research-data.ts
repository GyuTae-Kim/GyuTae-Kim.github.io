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
    title: 'Structure2Vec과 Q값 학습으로 TSP 경로 만들기',
    category: 'Graph Learning · 참조 논문 기반 구현',
    question: '그래프 표현과 Q값으로 경로에 넣을 도시를 고를 수 있을까?',
    method:
      'Structure2Vec 임베딩으로 Q값을 계산하고, 여기에 도시 삽입 휴리스틱과 여러 스텝의 보상 누적, 경험 샘플링을 붙였습니다. 기본 설정에서는 고른 도시를 경로 비용이 가장 작아지는 위치에 끼워 넣어 학습·평가 경로를 만듭니다.',
    observation:
      '어떤 도시를 넣을지는 학습한 모델이 고르고, 경로의 어디에 넣을지는 삽입 휴리스틱이 정하도록 역할을 나눴습니다. 도시 선택부터 보상, 학습, 경로 비용 기록까지 한 흐름으로 이어지게 만들었습니다.',
    limitation:
      '별도의 target network가 없고 보상 누적과 bootstrap 할인 방식도 표준 n-step DQN과 달라서, 원논문을 그대로 재현한 구현은 아닙니다. 공개 자료에는 기준 알고리즘과의 비교도, 실행 결과도 없어서 최적성이나 속도, 재현 성능은 판단할 수 없습니다.',
    tags: ['Graph neural network', 'Structure2Vec', 'Q-learning', 'TensorFlow'],
    source: 'https://github.com/GyuTae-Kim/TSP-GraphCombinatorialProblem_S2V',
    period: '2021 · 학부연구생',
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
      '기존 가상 착용 모델을 응용해 통합한 사례입니다. 공개 저장소에 화질을 수치로 평가한 자료나 추론 지연 측정, 지금 실행해 볼 수 있는 배포 결과가 없어서 제품 수준의 성능이나 상용 운영 여부는 판단할 수 없습니다.',
    tags: ['PyTorch', 'Virtual try-on', 'Human parsing', 'Flask', 'Android'],
    source: 'https://github.com/GyuTae-Kim/Deeplearning_Try_On',
    period: '2021 · 학부연구생',
  },
];
