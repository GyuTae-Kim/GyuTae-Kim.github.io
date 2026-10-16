import { PANEL_TYPES, PanelType } from './panel-types-data';
import { ProjectOutcome } from './project-outcome';

export interface CaseStudy {
  id: string;
  number: string;
  // First-screen summary and the scope of the result.
  // Detailed sections may be shown directly or grouped behind 「자세히」.
  headline: string;
  keyDecision?: string;
  outcome?: ProjectOutcome;
  scopeLine: string;
  expandedDetails?: boolean;
  panelTypes?: PanelType[];
  designParameters?: {
    introduction: string;
    groups: { title: string; items: string[] }[];
    note: string;
  };
  // 2–3 summary figures backed by the implementation or source artifacts.
  stats: { value: string; label: string }[];
  // His contribution: one summary line (also on the /portfolio list), what he built, and
  // one note for the parts done by the team or a partner institution.
  role: string;
  roleItems: string[];
  roleNote?: string;
  // 「자세히」 content, kept to short lines: problems met and how they were solved,
  // what was checked, what stays out of scope, and where the case was written from.
  fixes: { problem: string; fix: string }[];
  checked: string[];
  unchecked: string[];
  source: string;
  // Only research that genuinely led into this project.
  relatedResearch?: { id: string; title: string; connection: string }[];
  category: string;
  title: string;
  subtitle: string;
  period: string;
  tags: string[];
  diagramLabels: string[];
  story: CaseStep[];
  figure: CaseFigure;
  // Base path of the list thumbnails <thumb>-336.webp and <thumb>-672.webp (stills of the figure).
  thumb: string;
  // The home viewer's concept model for this project, shown again on its page.
  concept?: 'part' | 'furniture';
  gallery?: { title: string; caption: string; legend: { label: string; color: string }[]; pairs: CaseFigure[][] };
  recognition?: {
    features: { name: string; description: string; color?: string }[];
    note: string;
    examples: (CaseFigure & { title: string; features: string })[];
  };
  evidence?: { id: string; title: string; introduction: string; figures: EvidenceFigure[] }[];
}

// figure.kind: 'research' = rendered from the actual research data, 'product' = a real product
// screen on non-customer data, 'concept' = synthetic illustration.
export interface CaseFigure {
  src: string;
  // still: shown instead of an animated src to readers who prefer reduced motion
  still?: string;
  alt: string;
  caption: string;
  kind: 'research' | 'product' | 'concept';
}

export interface EvidenceFigure extends CaseFigure {
  title: string;
  setupViews?: (CaseFigure & { title: string })[];
}

export const FIGURE_KIND_LABELS: Record<CaseFigure['kind'], string> = {
  research: '연구 렌더',
  product: '제품 화면',
  concept: '개념도',
};

// One step of the project story. Who did what is written once in CaseStudy.role.
export interface CaseStep {
  title: string;
  text: string;
  // What was built in this step, one short line each (「자세히」 step grid).
  did: string[];
  didNote?: string;
  image?: string;
  // still: shown instead of an animated image to readers who prefer reduced motion
  still?: string;
  imageAlt?: string;
  imageCaption?: string;
}

export function thumbSrcset(base: string): string {
  return `${base}-336.webp 336w, ${base}-672.webp 672w`;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'cad-feature-recognition',
    number: '01',
    headline: '3D 모델에서 가공 특징을 찾아 Fusion CAM 공정을 자동으로 만듭니다',
    outcome: {
      result: '3D CAD의 형상을 읽는 AI, 학습용 라벨링 도구, 가공 전략 설계 엔진과 Fusion CAM 연동을 개발했습니다. 디지털 트윈에서는 협력 기관이 수행한 시뮬레이션의 결과 시각화만 담당해, 절삭 부하와 가공 결과를 그래프와 3D로 살펴볼 수 있는 화면을 만들었습니다.',
      impact: [
        { title: '반복 작업을 줄이는 공정 설계', text: '면과 홀을 하나씩 선택하고 공정을 설정하는 반복 작업을 줄여, 숙련자가 공구 선택과 가공 조건 검토에 더 집중할 수 있을 것으로 기대합니다.' },
        { title: '제조 지식에 대한 접근성', text: '숙련자의 형상 해석과 공정 설계 절차를 소프트웨어로 축적해, CAM 경험이 적은 작업자와 소규모 제조 현장의 기술 활용을 도울 수 있습니다.' },
        { title: '가상 검증을 통한 자원 절약', text: '실제 가공 전에 절삭 부하와 설계 대비 편차를 살펴보는 흐름은 시행착오로 소모되는 소재·공구·시간을 줄이는 기반이 될 수 있습니다.' },
      ],
    },
    scopeLine: '검증은 Fusion·MDT 시뮬레이션까지 · 실제 가공 품질 승인 아님',
    stats: [
      { value: '9종', label: '식별하는 가공 피쳐 · 스톡 포함' },
      { value: '±0.15 mm', label: '설계 대비 공차 · MDT 예시의 과삭 판정 기준' },
      { value: '1건', label: '라벨링 프로그램 등록 신청 접수' },
    ],
    role: '형상 분석부터 가공 전략 설계와 Fusion 적용까지 직접 연구개발했으며, 디지털 트윈에서는 시뮬레이션 결과 시각화만 담당했습니다.',
    roleItems: [
      '3D 모델 형상 분석과 그래프 입력',
      '가공 특징 인식 AI와 학습용 라벨링 프로그램',
      '가공 전략 설계와 Fusion CAM 공정 생성',
      '협력 기관의 MDT 분석 결과를 그래프·3D로 시각화',
    ],
    roleNote: '디지털 트윈(MDT) 시뮬레이션은 협력 기관이 담당했습니다. 본인은 제공된 시뮬레이션 결과의 시각화만 맡았습니다.',
    fixes: [
      {
        problem: '면 몇 개만 틀려도 가공 특징 묶음이 달라집니다.',
        fix: '면 단위 점수와 함께 모든 면을 맞힌 부품 수도 셌습니다.',
      },
      {
        problem: '점수가 바뀐 이유가 라벨 수정인지 학습인지 섞여 있었습니다.',
        fix: '라벨을 고쳐서 바뀐 점수와 학습으로 바뀐 점수를 따로 계산했습니다.',
      },
      {
        problem: '인식 결과가 Fusion의 셋업, 공구, 작업과 맞물려야 공정이 됩니다.',
        fix: '공구만 바꾸면 되는 경우와 작업을 새로 만들어야 하는 경우를 나눴습니다.',
      },
    ],
    checked: [
      'STEP으로 저장했다 다시 읽어도 라벨 유지',
      '계열별 분할과 학습, 추론 입력 일치',
      '평균 지표, 클래스별 오류, 전부 맞은 부품 수',
      'Fusion 자동 회귀 테스트 (적용, 공구 변경, 오류 복구)',
      '소재 시뮬레이션과 기준 STEP 비교',
      'MDT 결과 시각화 화면 (절삭력·칩 두께 그래프, 설계 대비 3D 비교)',
    ],
    unchecked: [
      '새 부품으로 한 독립 평가',
      '실측 조도 (목표값으로 경로 공차와 이송만 조정)',
      '도면 공차 읽기',
      '실제 CNC 가공 품질 승인',
    ],
    source: '기술 문서와 코드 변경 이력으로 정리했습니다.',
    category: 'AI · CAD/CAM · BlueChain 애드인',
    title: '3D 모델을 읽고 가공 전략까지 설계하는 AI',
    subtitle: '형상 분석 → AI 가공 특징 인식 → 가공 전략 설계 → 디지털 트윈 결과 시각화로 이어지는 Fusion CAM 자동화',
    period: '2025–2026',
    tags: ['Python', 'OpenCascade', 'TensorFlow', 'Autodesk Fusion API', 'CAM'],
    story: [
      {
        title: '형상 분석',
        text: '3D 모델(STEP)의 면과 엣지를 읽어 곡면 종류와 볼록·오목 연결 같은 관계를 그래프로 만듭니다.',
        did: ['STEP의 면, 엣지, 곡면 종류 추출', '맞닿은 면의 볼록, 오목 관계를 그래프로', '면과 삼각면을 묶은 계층 그래프 입력'],
        image: 'assets/cases/feature-cam/step1.webp',
        imageAlt: '합성 부품의 면 인접 그래프. 면마다 노드를 두고 맞닿은 면끼리 선으로 이었습니다.',
      },
      {
        title: 'AI 가공 특징 인식',
        text: '그래프 신경망의 면 분류와 형상 조합 분석으로 스톡·홀·포켓·챔퍼·필렛 등 9종의 가공 피쳐를 식별합니다.',
        did: [
          '학습 데이터를 만드는 라벨링 프로그램',
          '형상 계열 기준 데이터 분할',
          '포켓, 필렛, 챔퍼가 헷갈리는 합성 형상',
          '입력, 증강, 라벨 변경별 영향 비교',
        ],
        image: 'assets/cases/feature-cam/examples/base-plate.webp',
        imageAlt: '여러 홀과 포켓이 있는 베이스 플레이트 학습 모델. 면의 가공 피쳐 라벨을 색상으로 구분했습니다.',
      },
      {
        title: '가공 전략 설계',
        text: '가공 방향, 클램핑, 공정 순서, 공구, 절삭 조건을 정하고 조도 목표에 맞춰 경로 공차를 조정해 Fusion CAM 공정으로 만듭니다.',
        did: [
          '면 예측을 가공 특징 그룹으로 정리',
          '가공 방향, 셋업, 공정 순서, 공구, 절삭 조건 결정',
          '조도 목표에 맞춘 경로 공차와 이송',
          'Fusion API로 셋업과 공정 생성',
          '공구를 바꾸거나 적용이 실패해도 기존 작업 유지',
        ],
        image: 'assets/cases/feature-cam/strategy-pocket.webp',
        imageAlt: 'Fusion의 내부 다단 포켓 황삭. 가운데 보스를 남기면서 주변 소재를 제거하는 공구 경로입니다.',
      },
      {
        title: '디지털 트윈 결과 시각화',
        text: '협력 기관이 수행한 MDT 시뮬레이션 결과를 받아, 절삭력·칩 두께 그래프와 가공 결과의 설계 대비 차이를 보여주는 3D 화면을 만들었습니다.',
        did: ['공정·NC 구간별 절삭력과 칩 두께 그래프', '최댓값·평균·P95와 해당 시점의 공구·이송·회전수 표시', '가공 결과의 설계 대비 편차·가공면 파상도·형상 오차 시각화'],
        didNote: '시뮬레이션은 협력 기관, 결과 시각화는 본인이 담당했습니다.',
        image: 'assets/cases/feature-cam/step4.webp',
        imageAlt: 'MDT 가공 결과와 설계 모델의 3D 비교. 공차를 기준으로 설계면과 남은 소재를 구분합니다.',
      },
    ],
    diagramLabels: ['형상 분석', 'AI 특징 인식', '가공 전략', 'MDT 결과 시각화'],
    thumb: 'assets/cases/feature-cam/thumb',
    concept: 'part',
    figure: {
      src: 'assets/cases/feature-cam/hero.webp',
      alt: 'Fusion 소재 시뮬레이션. 자동 생성한 공정으로 가공한 302 변형 부품을 공차 기준 색상으로 표시한 화면입니다.',
      caption: '자동 생성한 공정으로 표준시편(302 변형)을 가공한 Fusion 소재 시뮬레이션. 초록은 공차 이내의 영역입니다.',
      kind: 'product',
    },
    gallery: {
      title: '구분할 부분만 바꾼 합성 형상 쌍',
      caption: '구분할 부분만 바꾼 합성 형상 쌍. STEP으로 다시 읽어도 라벨이 그대로인지 확인했습니다.',
      // Face colours sampled from the renders.
      legend: [
        { label: '구멍, 포켓', color: '#3378ab' },
        { label: '챔퍼', color: '#9762ad' },
        { label: '필렛', color: '#f27421' },
        { label: '소재', color: '#b7c1c9' },
      ],
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
    recognition: {
      features: [
        { name: '스톡', description: '소재·기준 형상', color: '#bcc8ce' },
        { name: '블라인드홀', description: '바닥이 막힌 홀', color: '#7c62b5' },
        { name: '쓰루홀', description: '부품을 관통하는 홀', color: '#287abb' },
        { name: '오픈포켓', description: '측면으로 열린 포켓', color: '#168f8b' },
        { name: '클로즈포켓', description: '둘레가 닫힌 포켓', color: '#d49a32' },
        { name: '챔퍼', description: '모서리의 모따기', color: '#da6e58' },
        { name: '필렛', description: '둥글게 연결한 모서리', color: '#c84e86' },
        { name: '카운터보어', description: '단차가 있는 원통형 홀' },
        { name: '카운터싱크', description: '입구가 원뿔형인 홀' },
      ],
      note: 'AI가 면 단위로 기본 7종을 분류하고, 홀·단차·챔퍼의 형상 조합을 분석해 카운터보어와 카운터싱크를 식별합니다. 아래는 실제 학습용 STEP 모델 6개를 정답 라벨로 색칠한 예시입니다.',
      examples: [
        { title: '복합 베이스 플레이트', src: 'assets/cases/feature-cam/examples/base-plate.webp', alt: '다수의 홀과 개방·폐쇄 포켓을 함께 가진 베이스 플레이트의 학습 라벨', caption: '기본 라벨 6종 · 177개 면', features: '쓰루홀 · 블라인드홀 · 오픈포켓 · 클로즈포켓 · 챔퍼 · 스톡', kind: 'research' },
        { title: '삼각 리브 부품', src: 'assets/cases/feature-cam/examples/triangle-rib.webp', alt: '홀·포켓·챔퍼·필렛을 구분한 삼각 리브 부품의 학습 라벨', caption: '기본 라벨 7종 · 139개 면', features: '쓰루홀 · 블라인드홀 · 오픈포켓 · 클로즈포켓 · 챔퍼 · 필렛 · 스톡', kind: 'research' },
        { title: '회전축 하우징', src: 'assets/cases/feature-cam/examples/rotary-housing.webp', alt: '원통형 중심부와 다수의 홀을 가진 회전축 하우징의 학습 라벨', caption: '기본 라벨 6종 · 78개 면', features: '쓰루홀 · 블라인드홀 · 오픈포켓 · 클로즈포켓 · 필렛 · 스톡', kind: 'research' },
        { title: '베드 플레이트', src: 'assets/cases/feature-cam/examples/bed-plate.webp', alt: '홀·포켓과 모서리 필렛이 함께 있는 베드 플레이트의 학습 라벨', caption: '기본 라벨 7종 · 74개 면', features: '쓰루홀 · 블라인드홀 · 오픈포켓 · 클로즈포켓 · 챔퍼 · 필렛 · 스톡', kind: 'research' },
        { title: '테일 고정 블록', src: 'assets/cases/feature-cam/examples/tail-block.webp', alt: '열린 포켓의 바닥 필렛과 홀을 구분한 테일 고정 블록의 학습 라벨', caption: '기본 라벨 7종 · 58개 면', features: '쓰루홀 · 블라인드홀 · 오픈포켓 · 클로즈포켓 · 챔퍼 · 필렛 · 스톡', kind: 'research' },
        { title: 'Z축 홀더', src: 'assets/cases/feature-cam/examples/z-holder.webp', alt: '여러 방향의 홀과 포켓이 결합된 Z축 홀더의 학습 라벨', caption: '기본 라벨 6종 · 87개 면', features: '쓰루홀 · 블라인드홀 · 오픈포켓 · 클로즈포켓 · 챔퍼 · 스톡', kind: 'research' },
      ],
    },
    evidence: [
      {
        id: 'cam-strategy', title: '인식한 피쳐가 실제 공정이 되는 과정',
        introduction: '1–3은 앞면 셋업의 대표적인 Fusion CAM 공정입니다. 4에서는 가공 방향을 바꿔 반대면의 공정을 이어가는 흐름을 보여줍니다. Fusion 화면의 파란 선은 절삭 경로, 노란 선은 경로 사이의 연결·이동입니다.',
        figures: [
          { title: '1 · 외곽 소재 황삭', src: 'assets/cases/feature-cam/strategy-stock.webp', alt: '부품 바깥쪽 소재를 층별로 제거하는 Fusion 외곽 황삭 경로', caption: '부품 외곽에 남은 소재를 여러 깊이로 나누어 제거합니다.', kind: 'product' },
          { title: '2 · 홀 드릴링', src: 'assets/cases/feature-cam/strategy-drill.webp', alt: '네 개 홀 위치에 생성된 Fusion 드릴링 경로', caption: '홀의 위치와 깊이에 맞춰 드릴을 선택하고 축 방향의 가공 경로를 만듭니다.', kind: 'product' },
          { title: '3 · 내부 다단 포켓 황삭', src: 'assets/cases/feature-cam/strategy-pocket.webp', alt: '중앙 보스를 남기고 주변의 여러 높이 포켓을 가공하는 Fusion 경로', caption: '중앙의 원통 보스는 남기고 주변 포켓의 소재를 제거합니다. 촘촘한 파란 선은 깊이별로 반복하는 절삭 경로입니다.', kind: 'product' },
          {
            title: '4 · 가공 방향 전환 후 뒷면 가공',
            src: 'assets/cases/feature-cam/setup-back-contour-cam.webp',
            alt: '두 번째 셋업에서 반대면의 외곽을 정삭하는 Fusion 공구 경로',
            caption: '앞면의 홀·포켓 가공을 마치면 부품을 뒤집어 고정하는 다음 셋업으로 전환합니다. 모델 좌표계 기준 공구 접근 방향을 +Z에서 −Z로 바꾸고, 뒷면 상면 황삭 → 외곽 황삭 → 윤곽 정삭을 이어갑니다.',
            kind: 'product',
            setupViews: [
              { title: '셋업 1 · 앞면 포켓 황삭 (+Z)', src: 'assets/cases/feature-cam/setup-front-cam.webp', alt: '앞면의 +Z 방향에서 내부 다단 포켓 황삭 경로를 표시한 실제 Fusion 캡처', caption: 'Fusion에서 앞면의 내부 포켓 황삭 경로를 표시한 화면입니다. 1–3번 공정은 이 +Z 방향의 셋업에서 진행합니다.', kind: 'product' },
              { title: '셋업 2 · 뒷면 상면 황삭 (−Z)', src: 'assets/cases/feature-cam/setup-back-face-cam.webp', alt: '반대면의 −Z 방향에서 뒷면 상면 황삭 경로를 표시한 실제 Fusion 캡처', caption: '같은 부품을 반대면에서 본 Fusion 화면입니다. 부품을 뒤집는 셋업 전환 후, −Z 방향의 뒷면 상면 황삭부터 이어갑니다.', kind: 'product' },
              { title: '셋업 2 · 뒷면 윤곽 정삭', src: 'assets/cases/feature-cam/setup-back-contour-cam.webp', alt: '같은 뒷면 시점에서 외곽 윤곽 정삭 경로를 표시한 실제 Fusion 캡처', caption: '같은 뒷면 시점에서 외곽 윤곽의 정삭 경로를 표시했습니다. 뒷면의 상면·외곽 황삭 다음에 정삭이 이어집니다.', kind: 'product' },
            ],
          },
        ],
      },
      {
        id: 'mdt-visualization', title: '숫자와 3D로 살펴보는 디지털 트윈 결과',
        introduction: '디지털 트윈(MDT) 시뮬레이션은 협력 기관이 수행했습니다. 본인은 그 결과를 보여주는 그래프와 3D 시각화만 담당했습니다. 아래는 보관된 MDT 분석 결과의 절삭 부하와 가공 형상을 시각화한 화면입니다.',
        figures: [
          { title: '절삭력·칩 두께와 NC 구간', src: 'assets/cases/feature-cam/mdt-force.webp', alt: 'NC 구간별 최대 절삭력과 칩 두께, 평균·P95 통계, 시간별 절삭력 그래프가 있는 MDT 결과 뷰어', caption: '가공 구간을 선택해 절삭력·칩 두께를 비교하고, 최댓값 시점의 NC 블록·공구·이송·회전수를 함께 살펴봅니다.', kind: 'product' },
          { title: '가공 형상과 설계 대비 편차', src: 'assets/cases/feature-cam/mdt-surface.webp', alt: '설계 모델과 MDT 가공 결과를 겹쳐 설계면과 남은 소재를 색상으로 구분하는 3D 화면', caption: '3D 회전·확대와 방향 전환으로 가공 결과를 살펴봅니다. 공차 기준 색상과 영역 비율로 설계면·남은 소재·과삭 표시를 구분합니다.', kind: 'product' },
          { title: '가공면 파상도·형상 오차 맵', src: 'assets/cases/feature-cam/mdt-finish.webp', alt: 'MDT 가공면 파상도 맵과 색상별 면적 비율, 최대 위치 보기 기능', caption: '해당 출력을 포함한 분석에서는 가공면 파상도와 형상 오차를 색상 맵으로 확인합니다. 실제 측정 조도와 구분해 표시합니다.', kind: 'product' },
        ],
      },
    ],
  },
  {
    id: 'panel-classification',
    number: '02',
    headline: '가구 크기를 바꾸면 패널이 규칙대로 함께 움직입니다',
    keyDecision:
      '패널의 위치·크기 변화를 선형회귀로 계수식에 담아, 고객이 웹에서 설계 파라미터를 실시간으로 수정하고 발주할 수 있도록 했습니다.',
    scopeLine: '',
    expandedDetails: true,
    stats: [
      { value: '15종', label: 'AI가 인식하는 패널 종류' },
      { value: '13개', label: '가구별로 구성하는 설계 파라미터' },
      { value: '1건', label: '공동발명 특허 출원' },
    ],
    panelTypes: PANEL_TYPES,
    designParameters: {
      introduction: 'AI가 구분한 패널 종류와 접합 관계를 바탕으로 가구의 설계 파라미터를 구성합니다. 고객이 웹에서 값을 바꾸면 계수식으로 패널의 위치와 크기를 함께 갱신해 원하는 사양의 발주로 이어집니다.',
      groups: [
        { title: '기본 크기', items: ['너비', '깊이', '높이'] },
        { title: '걸레받이', items: ['걸레받이 높이', '걸레받이 들임 · 앞뒤 위치'] },
        { title: '찬넬', items: ['찬넬 깊이', '찬넬 높이'] },
        { title: '코너장 마감', items: ['코너장 멍판 너비 · 전면마감재'] },
        { title: '내부 구성', items: ['선반 수량', '세로 밴드목 사용 여부', '세로 밴드목 너비'] },
        { title: '도어 여유', items: ['도어 상단 여유', '도어 하단 여유'] },
      ],
      note: '가구 유형과 포함된 패널에 따라 조절할 수 있는 항목이 달라집니다.',
    },
    role: '팀 프로젝트에서 AI 연구를 직접 맡았습니다.',
    roleItems: [
      '가구 모델의 패널과 접합면 분석',
      '패널 종류 15종을 인식하는 AI',
      '크기 변경 규칙을 선형회귀로 수식화',
      '브라우저에서 계수식만으로 패널 이동',
    ],
    roleNote: '가구 규칙은 팀과 함께 정리했고, 제조 데이터 생성은 팀이 함께 개발했습니다.',
    fixes: [
      {
        problem: '크기와 모양이 비슷해도 패널마다 가구 안에서 맡는 역할이 다릅니다.',
        fix: '패널의 형상과 접합 관계를 그래프로 분석하고, AI로 측판·지판·천판 등 15종 패널 종류를 구분했습니다.',
      },
      {
        problem: '고객이 웹에서 가구의 치수와 구성을 실시간으로 조절하고, 원하는 사양으로 바로 발주하고 싶어합니다.',
        fix: '머신러닝(선형회귀)으로 패널의 위치·크기를 계산하는 계수식을 구성했습니다. 브라우저에서 가볍게 실시간으로 파라미터를 수정하고 가구를 발주할 수 있도록 했습니다.',
      },
      {
        problem: '바뀌지 않아야 할 값까지 회귀식이 건드릴 수 있습니다.',
        fix: '값이 변하지 않는 출력은 계수를 0으로 고정했습니다.',
      },
    ],
    checked: [
      '형상 계열별 교차검증',
      '특징군을 빼 가며 비교한 실험',
      '좌표축을 바꾼 입력의 스트레스 평가',
      '패널 단위 지표',
      '파라미터를 바꾼 뒤 패널 위치 회귀 테스트 (하부 코너장 등)',
    ],
    unchecked: [],
    source: '',
    relatedResearch: [
      {
        id: 'graph-tsp',
        title: '강화학습으로 TSP 경로를 만드는 그래프 모델',
        connection: '도시와 경로를 그래프로 표현해 본 학부 연구입니다. 알고리즘을 그대로 가져온 것은 아닙니다.',
      },
    ],
    category: 'AI · 가구 · 파라메트릭 설계',
    title: '가구 패널을 인식해 크기 변경을 계산하는 AI',
    subtitle: '모델 분석 → AI 패널 인식 → 파라미터 관계 수식화 → 제조 데이터 생성·확인',
    period: '2025–2026',
    tags: ['TensorFlow', 'Hierarchical CADNet 기반', '그래프 입력', '선형회귀', 'BOM·도면'],
    story: [
      {
        title: '패널·접합면 분석',
        text: '가구 3D 모델에서 패널마다 크기와 부피를 구하고, 패널끼리 맞닿는 접합면을 찾아 그래프로 만듭니다.',
        did: ['패널 크기, 체적, 두께 축 계산', '면의 면적, 중심, 접촉 관계 추출', '패널과 접합면을 잇는 계층 그래프'],
        image: 'assets/cases/panel/step1.webp',
        imageAlt: '패널끼리 맞닿는 접합면을 빨강으로 표시한 가구 와이어프레임',
      },
      {
        title: 'AI 패널 인식',
        text: '그래프 입력으로 측판, 지판, 천판, 뒷판, 찬넬, 걸레받이, 선반, 도어 등 15종 패널을 인식합니다.',
        did: [
          'Hierarchical CADNet 기반 모델과 MLP로 15종 인식',
          '라벨 데이터에서 형상, 라벨, 그래프를 내보내는 도구',
          '형상 계열 단위 교차검증 분할',
          '특징군 제거 실험과 축 교환 점검',
        ],
        image: 'assets/cases/panel/step2.webp',
        imageAlt: '분해한 가구 몸통의 패널을 역할별 색으로 칠하고 접촉 관계를 그래프로 정리한 개념도',
        imageCaption: '개념도 · 패널 종류와 접촉 관계를 설명합니다.',
      },
      {
        title: '파라미터 관계 수식화',
        text: '너비·깊이·높이, 걸레받이·찬넬, 코너장 멍판과 도어 여유 등을 바꾸는 규칙을 팀과 정리하고, 선형회귀로 패널의 위치·크기 변화를 수식화합니다.',
        did: ['규칙으로 기준값을 흔든 샘플 생성', '패널마다 위치와 크기를 선형회귀로 맞춤', '웹에서 계수식으로 실시간 치수 수정과 발주 연결'],
        didNote: '가구 규칙은 팀과 함께 정리했습니다.',
        image: 'assets/cases/panel/hero.webp',
        imageAlt: '가구 폭을 바꾸기 전과 후. 맞닿은 패널들이 함께 늘어나고 옮겨 간 모습',
      },
      {
        title: '제조 데이터 생성·확인',
        text: '연결 피스와 하드웨어를 배치하고 BOM·도면·엣지밴딩을 계산합니다. 생성한 가공 코드는 NC 뷰어에서 가공 면과 홀 위치를 확인합니다.',
        did: ['연결 피스 위치와 하드웨어 배치', 'BOM, 도면, 엣지밴딩 계산', '생성한 가공 코드의 가공 면·홀 위치 확인'],
        image: 'assets/cases/panel/step4.webp',
        imageAlt: 'NC 뷰어에서 판재 아랫면의 드릴 가공 60개를 3D로 확인하는 화면',
        imageCaption: '생성한 가공 코드를 NC 뷰어에서 확인하는 화면입니다. 판재의 가공 면과 홀 위치를 살펴봅니다.',
      },
    ],
    diagramLabels: ['패널·접합면', 'AI 패널 인식', '관계 수식화', '제조 데이터 확인'],
    thumb: 'assets/cases/panel/thumb',
    figure: {
      src: 'assets/cases/panel/step3.webp',
      still: 'assets/cases/panel/step3-still.webp',
      alt: '가구에서 패널 하나의 폭을 바꾸자 맞닿은 패널들이 접합 관계를 따라 차례로 크기와 위치를 맞추는 애니메이션',
      caption: '연구 중 폭을 바꿔 본 가구. 맞닿은 패널들이 접합 관계를 따라 차례로 움직입니다.',
      kind: 'research',
    },
  },
  {
    id: 'wedraw-pro',
    number: '03',
    headline: '디자이너의 설계가 공장의 가공 데이터가 됩니다',
    outcome: {
      result: 'SketchUp 설계에서 BOM·라벨·가공 도면·가공 코드로 이어지는 제조 데이터 출력 흐름을 만들었습니다. 네스팅기와 스키퍼의 투입 방향·공구 위치·가공 순서를 각각 반영하고, 판재를 돌리거나 뒤집어도 가공 위치·엣지밴드·결 방향이 함께 따라가도록 했습니다.',
      impact: [
        { title: '설계 정보의 반복 입력 감소', text: '설계한 패널과 하드웨어 정보를 도면·발주·제조 데이터로 이어 사용해, 부서와 공장이 바뀔 때 치수와 가공 정보를 다시 입력하는 일을 줄일 수 있습니다.' },
        { title: '현장 노하우의 축적', text: '기계별 투입 방향과 도어컵·찬넬 가공 순서를 소프트웨어 규칙에 담아, 숙련 작업자의 판단을 반복해서 활용할 수 있는 기반을 만듭니다.' },
        { title: '생산 전 오류 발견', text: '원장 배치와 가공 경로를 웹에서 미리 살펴보고 라벨의 투입 방향을 함께 확인해, 잘못된 가공으로 인한 재작업과 자재 낭비를 줄이는 데 도움을 줄 수 있습니다.' },
      ],
    },
    scopeLine: '',
    expandedDetails: true,
    stats: [
      { value: '4종', label: 'BOM · 라벨 · 가공 도면 · 가공 코드 출력' },
      { value: '2종', label: '네스팅기 · 스키퍼에 맞춘 가공 파일' },
      { value: '웹 뷰어', label: '원장 배치 · NC 가공 · 2D 도면 확인' },
    ],
    role: '팀과 함께 개발하는 제품입니다. 제조 데이터 출력과 생산 투입을 리딩했고, 도면과 발주는 초기 개발을 리딩했습니다.',
    roleItems: [
      '커넥터 제조 모드와 출력 (BOM, 라벨, 가공 도면, MPR·PGI)',
      '도어 결맞춤 그룹 편집과 판재 회전 시 가공 위치 유지',
      '네스팅 웹 뷰어와 NC 뷰어로 생산 전 확인',
      '플로터 도면과 커넥터 발주 모드 초기 개발',
    ],
    roleNote: '설계 도구인 가구빌더는 팀이 함께 개발했습니다.',
    fixes: [
      {
        problem:
          '도어 결맞춤을 하려면 한 가구의 도어를 한 원장에서 정면 순서대로 잘라야 하는데, 가공 파일만으로는 어떤 도어끼리 한 그룹인지 알 수 없습니다.',
        fix: '도어 결맞춤 그룹과 정면 위치(A-1, A-2…)를 가공 파일에 실었습니다. 원장보다 큰 그룹은 원장에 맞게 나눕니다.',
      },
      {
        problem:
          '네스팅기는 원장에 놓인 방향대로 자르고 스키퍼는 톱, 클램프, 찬넬 위치에 맞는 방향으로 넣어야 해서, 가공 파일 하나로는 두 기계를 모두 맞출 수 없습니다.',
        fix: '네스팅기 기준과 스키퍼 기준 가공 파일을 따로 만들고, 스키퍼에 넣는 방향은 라벨의 뒤집기 표시와 투입 화살표로 알려 줍니다.',
      },
      {
        problem: '경첩 컵 구멍은 도어 뒷면에 내야 하는데, 스키퍼의 도어컵 공구는 위쪽에만 있습니다.',
        fix: '도어 가공 전체를 좌우와 가공 면까지 뒤집어 위쪽 공구로 컵 구멍과 유도 보링을 냅니다. 작업자는 라벨 표시대로 도어를 뒤집어 넣습니다.',
      },
      {
        problem: '측판 찬넬(손잡이 홈)을 한 번에 관통하면 공구가 빠져나가는 쪽 엣지밴드가 깨질 수 있습니다.',
        fix: '엣지밴드 파손이 가장 적은 시험 가공 방식을 가공 전략에 녹여냈습니다.',
      },
    ],
    checked: [
      '도어 결맞춤 그룹 편집 8가지를 설계 데이터부터 가공 파일까지 따라가며 대조',
      '실제 설계 데이터(가구 5개, 판재 66장)의 출력을 따로 계산한 회전 결과와 비교',
      '출력 파일과 뒤집기 표시만으로 원래 가공 위치를 되살려 설계와 대조',
      '생성한 가공 파일을 다시 읽어 도어컵과 찬넬의 가공 면, 깊이, 순서 확인',
    ],
    unchecked: [],
    source: '',
    category: '제품 · SketchUp · 가구 제조',
    title: 'Wedraw Pro, 가구 설계에서 생산까지',
    subtitle: '디자이너는 가구빌더로 설계하고, 제조 담당자는 커넥터로 생산 데이터를 받습니다',
    period: '2026 · 진행 중',
    tags: ['SketchUp Ruby API', 'JavaScript', 'Python', 'MPR·PGI', '네스팅'],
    story: [
      {
        title: '가구빌더로 설계',
        text: '디자이너가 SketchUp 안의 가구빌더로 몸통, 도어, 하드웨어, 마감재와 결 방향을 정해 가구를 설계합니다.',
        did: [],
        didNote: '디자이너가 SketchUp에서 쓰는 설계 도구입니다.',
        image: 'assets/cases/wedraw-pro/step1.webp',
        imageAlt: '가구빌더에서 구조, 내부, 도어, 조립 방식을 고르는 화면',
        imageCaption: '가구빌더의 구조·내부·도어 설정입니다. 가구빌더는 팀이 함께 개발했습니다.',
      },
      {
        title: '도면과 발주',
        text: '플로터가 평면, 입면, 내부 도면을 만들고, 커넥터의 발주 모드에서 견적과 발주 상담으로 넘어갑니다.',
        did: ['플로터로 평면, 입면, 내부 도면 생성', '커넥터 발주 모드 (견적, 발주 상담)'],
        image: 'assets/cases/wedraw-pro/step2.webp',
        imageAlt: '모델에서 바로 뽑은 세트 도면. 평면, 입면, 내부 도면과 자재 사양이 들어 있습니다.',
        imageCaption: '같은 설계에서 평면·입면·내부 도면과 자재 사양을 뽑은 결과입니다.',
      },
      {
        title: '커넥터로 제조 데이터',
        text: '제조 담당자가 커넥터에서 도어 결맞춤 그룹과 네스팅을 확인하고 BOM, 라벨, 가공 도면, MPR·PGI 가공 코드를 한 번에 출력합니다.',
        did: [
          '제조 모드와 출력 (BOM, 라벨, 가공 도면, MPR·PGI)',
          '경첩, 런너, 리프트 가공을 판재에 투영',
          '도어 결맞춤 그룹 편집과 원장 초과 안내',
          '판재를 돌려도 가공 위치와 엣지밴드 유지',
        ],
        image: 'assets/cases/wedraw-pro/step3.webp',
        imageAlt: '커넥터의 도어 결맞춤 그룹 설정. 원장보다 큰 그룹은 나눠서 배치합니다.',
        imageCaption: '함께 잘라야 할 도어를 그룹으로 묶고, 원장보다 큰 그룹을 나누는 화면입니다.',
      },
      {
        title: '생산 투입',
        text: '네스팅과 가공 코드를 현장 CNC로 넘기기 전에 웹 네스팅 뷰어와 NC 뷰어로 확인하고, 라벨을 붙여 생산합니다.',
        did: ['네스팅 웹 뷰어 (원장 배치, 도어 결맞춤 그룹)', 'NC 뷰어로 가공 코드 확인', '2D CAD 웹 뷰어'],
        image: 'assets/cases/wedraw-pro/step4.webp',
        imageAlt: '네스팅 뷰어의 도어 결맞춤 그룹 목록과 원장 위 부품 배치',
        imageCaption: '원장 위 부품 배치와 도어 결맞춤 그룹을 생산 전에 확인하는 웹 뷰어입니다.',
      },
    ],
    diagramLabels: ['가구빌더 설계', '도면·발주', '커넥터 출력', '생산 투입'],
    thumb: 'assets/cases/wedraw-pro/thumb',
    concept: 'furniture',
    figure: {
      src: 'assets/cases/wedraw-pro/hero.webp',
      alt: '가구빌더로 설계한 데모 주방(몸통 18개)을 SketchUp에서 본 화면',
      caption: '고객 데이터 대신 데모 주방으로 보여주는 설계 결과입니다. 이 모델에서 도면·BOM·라벨·가공 코드를 생성합니다.',
      kind: 'product',
    },
  },
];
