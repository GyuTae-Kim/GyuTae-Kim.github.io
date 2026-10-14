export interface Achievement {
  id: string;
  kind: string;
  status: string;
  title: string;
  description: string;
  role: string;
  features: string[];
  metadata: { label: string; value: string }[];
  relatedProjectId: string;
  relatedProjectTitle: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'furniture-topology-patent',
    role: 'AI 연구개발 담당 · 공동발명자',
    features: ['패널과 면의 기하 정보, 접촉 관계 표현', '계층 그래프 기반 패널 인식 AI 연구'],
    kind: '특허',
    status: '출원 · 공동발명',
    title:
      '가구 구성 요소의 위상적 연결 관계 분석을 이용한 3D 가구 모델링 장치, 방법 및 기록 매체',
    description:
      '가구 구성 요소의 연결 관계를 분석해 3D 가구를 모델링하는 기술입니다. 이 발명과 관련된 패널 인식 AI 연구를 맡았습니다.',
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
    features: [
      '면 단위 특징 표시와 분류 편집',
      '형상과 라벨 저장, 서버 전달',
      '형상 그래프와 학습 데이터 구성',
    ],
    kind: '프로그램',
    status: '등록 신청·접수 확인',
    title: '가공 형상 및 특징 인식 인공지능 학습용 라벨링 프로그램',
    description: 'CAD 모델의 면마다 가공 특징을 표시해 특징 인식 AI의 학습 데이터를 만드는 도구입니다.',
    metadata: [
      { label: '창작일', value: '2025.05.13' },
      { label: '등록 신청 접수일', value: '2025.12.12' },
    ],
    relatedProjectId: 'cad-feature-recognition',
    relatedProjectTitle: '3D 모델을 읽고 가공 전략까지 설계하는 AI',
  },
];
