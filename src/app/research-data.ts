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
      'ResNet50V2 분류 코드와 학습·검증 데이터 각각의 클래스별 다운샘플링 구성',
      '클래스별 지표·혼동행렬 검토와 드레스·아우터의 오류 사례 분석',
    ],
    reused:
      'ImageNet 사전학습 가중치의 ResNet50V2와 K-fashion 데이터를 활용했습니다. 기여 범위는 데이터 구성·분류 학습 코드와 오류 분석입니다.',
    connection:
      '클래스별 오류와 평가 분할의 의미를 구분한 경험을 CAD 가공 특징의 라벨·모델 평가 역량으로 연결합니다.',
    relatedProjectId: 'cad-feature-recognition',
    relatedProjectTitle: 'CAD 형상 인식의 데이터·모델 평가',
    title: '의류 분류에서 데이터 불균형과 클래스 혼동 분석',
    category: 'Computer Vision · 실험 기록',
    question:
      '의류 데이터의 클래스 분포와 혼동행렬에서 어떤 분류 오류를 찾을 수 있는가?',
    method:
      '네 의류 클래스를 대상으로 학습·검증 데이터를 각각 최소 클래스 수에 맞춰 다운샘플링했습니다. 사전학습 ResNet50V2를 이용한 분류 코드와 클래스별 precision·recall, 혼동행렬을 검토했습니다.',
    observation:
      '공개 실험 그림에서 여러 실제 클래스의 예측이 특정 클래스에 집중되는 오류 양상을 읽었습니다. README에는 드레스·아우터가 유사하게 보이는 사례를 정리했습니다. 불균형·촬영 구도가 오류의 원인이라는 인과 효과까지 검증한 결과로 제시하지 않습니다.',
    limitation:
      '평가 함수는 검증 데이터를 재사용하므로 독립 테스트 성능으로 해석하지 않습니다. 클래스명 설명 일부가 일관되지 않고, 공개 그림과 현재 코드의 실행 조건 연결도 확인되지 않았습니다. 샘플링 효과의 비교나 대표 성능 수치는 제시하지 않습니다.',
    tags: ['TensorFlow', 'ResNet50V2', 'Class imbalance', 'Error analysis'],
    source: 'https://github.com/GyuTae-Kim/Classification_ResNet',
    image: 'assets/research/k-fashion-confusion-matrix.png',
    imageAlt:
      '공개 K-fashion 실험의 4개 클래스 혼동행렬. 여러 실제 클래스의 예측이 클래스 2에 집중된다.',
    imageCaption:
      '공개 저장소에 남은 과거 실험 그림 · 현재 코드와 동일 실행인지 미확인',
    period: '2021 · 공개 실험 코드',
  },
  {
    id: 'graph-tsp',
    contribution: [
      '노드·엣지·도시 선택 상태를 갖는 그래프 환경과 경로 비용 기록 구성',
      'Structure2Vec·Q값 평가·복수 스텝 보상 누적·경험 샘플링의 탐색 루프 구현',
    ],
    reused:
      'NeurIPS 2017 그래프 조합 최적화 연구를 참고한 구현입니다. 논문의 저자 또는 독자 알고리즘 개발 성과로 표기하지 않습니다.',
    connection:
      '그래프의 요소·관계를 학습 입력으로 표현한 과거 경험을 판재·면 인식 연구의 기초 역량으로 연결합니다.',
    relatedProjectId: 'panel-classification',
    relatedProjectTitle: '판재·면·접촉 관계로 표현하는 분류 AI',
    title: 'Structure2Vec와 Q값 학습으로 TSP 경로 구성',
    category: 'Graph Learning · 참조 논문 기반 구현',
    question: '그래프 표현과 Q값으로 경로에 추가할 도시를 선택할 수 있는가?',
    method:
      'Structure2Vec 임베딩과 Q값 평가에 도시 삽입 휴리스틱, 복수 스텝 보상 누적과 경험 샘플링을 연결했습니다. 기본 설정은 선택한 도시를 경로 비용이 가장 작은 위치에 삽입해 학습·평가 경로를 구성합니다.',
    observation:
      '학습 모델이 경로에 추가할 도시를 선택하고, 삽입 휴리스틱이 해당 도시의 위치를 정하는 구조를 구성했습니다. 도시 선택·보상·학습·경로 비용 기록을 연결하며 모델과 휴리스틱의 역할을 구분했습니다.',
    limitation:
      '별도 target network가 없고 보상 누적·bootstrap 할인 처리도 표준 n-step DQN과 다르므로 원논문을 완전히 재현한 구현으로 제시하지 않습니다. 공개된 기준 알고리즘 비교와 실행 결과가 없어 최적성·속도·재현 성능을 주장하지 않습니다.',
    tags: ['Graph neural network', 'Structure2Vec', 'Q-learning', 'TensorFlow'],
    source: 'https://github.com/GyuTae-Kim/TSP-GraphCombinatorialProblem_S2V',
    period: '2021 · 공개 구현 코드',
  },
  {
    id: 'virtual-try-on',
    contribution: [
      '인체 파싱·포즈 추정·GrabCut 의류 마스크를 가상 착용 추론 입력으로 통합',
      'Flask 이미지 업로드·결과 반환 API와 Android 클라이언트 연결',
    ],
    reused:
      'ACGPN·인체 파싱·포즈 추정 모델을 재사용하고 의류 마스크는 OpenCV GrabCut으로 처리했습니다. 응용 구현의 기여는 전처리·입출력·서버와 앱의 연결입니다.',
    connection:
      '서로 다른 모듈의 입력·출력을 맞춘 경험을 서버 계획과 네이티브 CAD 실행을 연결하는 역량으로 설명합니다.',
    relatedProjectId: 'fusion-cam',
    relatedProjectTitle: '가공 계획과 Fusion의 실행 연결',
    title: '인물·의류 전처리와 가상 착용 추론 통합',
    category: 'Computer Vision · 응용 구현',
    question:
      '인물 사진과 의류 이미지를 가상 착용 모델의 입력으로 변환하고 앱에서 결과를 받을 수 있는가?',
    method:
      '인체 파싱·포즈 추정 결과와 GrabCut으로 만든 의류 마스크를 ACGPN 추론 입력으로 묶었습니다. Flask 이미지 업로드·결과 반환 API와 Kotlin·Retrofit Android 클라이언트를 연결했습니다.',
    observation:
      '이미지 입력을 처리하는 전처리·추론 코드, 업로드와 결과 반환 API, Android 결과 표시 경로를 산출물로 남겼습니다. 정량 화질이나 추론 속도 성과와는 구분한 통합 구현 사례입니다.',
    limitation:
      '기존 가상 착용 모델의 응용·통합 사례입니다. 공개 저장소에는 정량 화질 평가, 추론 지연 측정 또는 현재 실행 가능한 배포 결과가 없어 제품 성능과 상용 운영 여부는 판단하지 않습니다.',
    tags: ['PyTorch', 'Virtual try-on', 'Human parsing', 'Flask', 'Android'],
    source: 'https://github.com/GyuTae-Kim/Deeplearning_Try_On',
    period: '2021 · 공개 응용 코드',
  },
];
