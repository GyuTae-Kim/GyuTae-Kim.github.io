export interface Achievement {
  id: string;
  kind: string;
  status: string;
  title: string;
  description: string;
  role: string;
  contribution: string;
  features: string[];
  metadata: { label: string; value: string }[];
  relatedProjectId: string;
  relatedProjectTitle: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'furniture-topology-patent',
    role: 'AI 연구개발 담당 · 공동발명자',
    contribution:
      '판재와 면의 형상, 서로의 연결 관계를 학습 입력으로 표현하고 판재 분류 AI를 연구개발했습니다.',
    features: [
      '판재와 면의 기하 정보, 접촉 관계 표현',
      '계층 그래프 기반 판재 분류 AI 연구',
    ],
    kind: 'PATENT · 특허',
    status: '출원 · 공동발명',
    title:
      '가구 구성 요소의 위상적 연결 관계 분석을 이용한 3D 가구 모델링 장치, 방법 및 기록 매체',
    description:
      '가구 구성 요소의 위상적 연결 관계를 분석하는 3D 모델링 기술로, 공동발명자로 이름을 올린 특허 출원입니다. 맡았던 판재 분류 AI 연구가 이 발명과 관련되며, 연결해 둔 판재 분류 사례는 2026년에 이어서 한 후속 연구입니다.',
    metadata: [
      { label: '출원일', value: '2025.11.21' },
      { label: '출원번호', value: '10-2025-0177712' },
    ],
    relatedProjectId: 'panel-classification',
    relatedProjectTitle: '가구 패널을 인식해 설계를 제조 데이터로 바꾸는 AI',
  },
  {
    id: 'machining-labeling-software',
    role: '프로그램 전체 연구개발 담당',
    contribution:
      '라벨링 프로그램의 연구개발 전체를 맡았습니다. 관련 구현 기록에는 면 분류 편집, 형상과 라벨의 저장·전달, 계층 그래프 학습 데이터 구성이 남아 있습니다.',
    features: [
      '면 단위 특징 표시와 분류 편집',
      '형상과 라벨 저장, 서버 전달',
      '형상 그래프와 학습 데이터 구성',
    ],
    kind: 'SOFTWARE · 프로그램',
    status: '등록 신청·접수 확인',
    title: '가공 형상 및 특징 인식 인공지능 학습용 라벨링 프로그램',
    description:
      'CAD 모델의 면마다 의미를 붙이고, 형상과 라벨을 저장해 넘겨서 특징 인식 AI의 학습 데이터를 만드는 연구용 도구입니다.',
    metadata: [
      { label: '창작일', value: '2025.05.13' },
      { label: '등록 신청 접수일', value: '2025.12.12' },
    ],
    relatedProjectId: 'cad-feature-recognition',
    relatedProjectTitle: '3D 모델을 읽고 가공 전략까지 설계하는 AI',
  },
];
