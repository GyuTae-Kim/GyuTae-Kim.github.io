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
  evidenceScope: string;
  relatedProjectId: string;
  relatedProjectTitle: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'furniture-topology-patent',
    role: 'AI 연구개발 담당 · 공동발명자',
    contribution:
      '판재·면의 형상과 연결 관계를 학습 입력으로 표현하고, 판재 분류 AI를 연구개발했습니다.',
    features: [
      '판재·면의 기하·접촉 관계 표현',
      '계층 그래프 기반 판재 분류 AI 연구',
    ],
    kind: 'PATENT · 특허',
    status: '출원 · 공동발명',
    title:
      '가구 구성 요소의 위상적 연결 관계 분석을 이용한 3D 가구 모델링 장치, 방법 및 기록 매체',
    description:
      '가구 구성 요소의 위상적 연결 관계를 분석하는 3D 모델링 기술의 공동발명 출원입니다. 본인이 담당한 판재 분류 AI 연구와 연결되며, 연결되는 판재 분류 사례는 2026년 후속 연구 기록입니다.',
    metadata: [
      { label: '출원일', value: '2025.11.21' },
      { label: '출원번호', value: '10-2025-0177712' },
      { label: '기여 구분', value: '공동발명자' },
    ],
    evidenceScope:
      '출원번호 통지서와 성과표의 발명 명칭, 공동발명자, 출원일·출원번호를 확인했습니다. AI 담당 범위는 본인 확인과 관련 연구개발 기록을 반영했습니다. 기존 계층 그래프 모델을 활용·변형한 연구이며, 후속 구현 기록을 출원 청구항의 직접 증거로 제시하지 않습니다. 표기 상태는 특허 출원입니다.',
    relatedProjectId: 'panel-classification',
    relatedProjectTitle: '형상과 연결 관계로 판재의 역할을 분류하는 AI',
  },
  {
    id: 'machining-labeling-software',
    role: '프로그램 전체 연구개발 담당',
    contribution:
      '라벨링 프로그램 전체 연구개발을 맡았습니다. 관련 구현 기록에는 면 분류 편집, 형상·라벨의 저장과 전달, 계층 그래프 학습 데이터 구성이 남아 있습니다.',
    features: [
      '면 단위 특징 표시·분류 편집',
      '형상·라벨의 저장과 서버 전달',
      '형상 그래프·학습 데이터 구성',
    ],
    kind: 'SOFTWARE · 프로그램',
    status: '등록 신청·접수 확인',
    title: '가공 형상 및 특징 인식 인공지능 학습용 라벨링 프로그램',
    description:
      'CAD 모델의 면에 의미를 부여하고, 형상·라벨을 저장·전달해 특징 인식 AI의 학습 데이터를 구성하는 연구 도구입니다.',
    metadata: [
      { label: '창작일', value: '2025.05.13' },
      { label: '등록 신청 접수일', value: '2025.12.12' },
      { label: '신청 구분', value: '회사 명의' },
    ],
    evidenceScope:
      '신청서와 접수 화면에서 프로그램 명칭과 접수일을 확인했습니다. 접수 화면에 등록번호 일부와 온라인발급 표시가 있으나, 등록증의 전체 번호와 등록 완료일 확인 전으로 신청·접수 기준 표기합니다. 전체 연구개발 담당은 본인이 확인했습니다. 기능 설명은 유지되는 관련 구현을 포함하며, 이를 신청 당시 프로그램 버전과 동일한 코드라고 단정하지 않습니다.',
    relatedProjectId: 'cad-feature-recognition',
    relatedProjectTitle: 'CAD 형상에서 가공 특징을 읽는 AI',
  },
];
