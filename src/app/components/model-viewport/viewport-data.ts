// Text and legend data for the home 3D viewport. Kept apart from the three.js scene
// so the page can render captions before the 3D chunk loads.

export type ModelId = 'part' | 'furniture';

export interface LegendItem {
  label: string;
  detail?: string;
  // CSS colour of the face tint in the 3D scene; dashed marks a rapid move.
  swatch?: string;
  dashed?: boolean;
}

export interface ViewLayer {
  label: string;
  title: string;
  text: string;
  legend: LegendItem[];
  // Legend rows carry numbered balloons in the scene.
  balloons: boolean;
  // Legend rows are animation steps: numbered, and the running one is highlighted.
  steps?: boolean;
}

export interface ViewModel {
  id: ModelId;
  label: string;
  sheet: string;
  name: string;
  caseId: string;
  layers: ViewLayer[];
}

// Same tints as viewport-scene.ts.
export const TINTS = {
  face: '#e9ece4',
  pocket: '#e2ad92',
  counterbore: '#7f9fce',
  hole: '#b3c6e4',
  step: '#e3cf8f',
  fillet: '#a3c9b3',
  side: '#b3c6e4',
  board: '#a3c9b3',
  shelf: '#e3cf8f',
  back: '#d5d7cd',
  door: '#e2ad92',
  kick: '#9fa69f',
  cut: '#a75534',
  rapid: '#2f5f9e',
};

export const FURNITURE_LIMITS = {
  width: { min: 600, max: 1200, step: 10, initial: 900 },
  kick: { min: 60, max: 150, step: 5, initial: 100 },
  // Above this width the door is split into two leaves.
  twoDoors: 750,
};

export function furnitureCounts(width: number) {
  const doors = width > FURNITURE_LIMITS.twoDoors ? 2 : 1;
  return { panels: 7 + doors, joints: 13 + doors };
}

export const VIEW_MODELS: ViewModel[] = [
  {
    id: 'part',
    label: '가공 부품',
    sheet: 'A-01',
    name: '포켓·단차 블록',
    caseId: 'cad-feature-recognition',
    layers: [
      {
        label: '모델링',
        title: '부품을 모델링하고 면을 읽습니다',
        text: '스케치를 돌출하고 단차, 포켓, 구멍을 파서 부품을 만든 뒤, 면 29개와 맞닿은 53쌍을 그래프로 잇습니다.',
        legend: [
          { label: '스케치', detail: '140 × 100 · R12', swatch: '#2f5f9e' },
          { label: '돌출', detail: '높이 30', swatch: '#fbfaf6' },
          { label: '단차 컷', detail: '깊이 12', swatch: TINTS.cut },
          { label: '포켓 컷', detail: '60 × 48 · 깊이 12', swatch: TINTS.cut },
          { label: '구멍', detail: 'Ø10 4곳 · 카운터보어 2곳', swatch: TINTS.cut },
          { label: '면 분석', detail: '면 29개 · 53쌍', swatch: '#8fa8cf' },
        ],
        balloons: false,
        steps: true,
      },
      {
        label: '피처 인식',
        title: '면마다 가공 특징을 붙입니다',
        text: '면 단위로 예측한 결과를 포켓, 카운터보어, 구멍, 단차, 필렛으로 묶습니다.',
        legend: [
          { label: '포켓', detail: '면 9개', swatch: TINTS.pocket },
          { label: '카운터보어', detail: '2곳', swatch: TINTS.counterbore },
          { label: '관통 구멍', detail: '4곳', swatch: TINTS.hole },
          { label: '단차', detail: '면 2개', swatch: TINTS.step },
          { label: '필렛', detail: 'R12 · 4곳', swatch: TINTS.fillet },
        ],
        balloons: true,
        steps: true,
      },
      {
        label: '가공',
        title: '바이스에 물린 소재를 깎습니다',
        text: '인식한 특징마다 공구를 골라, 바이스에 물린 사각 소재를 윗면부터 바깥 윤곽까지 차례로 깎습니다.',
        legend: [
          { label: '윗면 페이스', detail: 'Ø50 페이스밀', swatch: TINTS.face },
          { label: '단차', detail: 'Ø16 엔드밀 · 2단', swatch: TINTS.step },
          { label: '포켓', detail: 'Ø8 엔드밀 · 2단', swatch: TINTS.pocket },
          { label: '구멍', detail: 'Ø10 드릴 · 4곳', swatch: TINTS.hole },
          { label: '카운터보어', detail: 'Ø8 헬리컬 · 2곳', swatch: TINTS.counterbore },
          { label: '바깥 윤곽', detail: 'Ø16 엔드밀 · 2단', swatch: TINTS.fillet },
        ],
        balloons: true,
        steps: true,
      },
    ],
  },
  {
    id: 'furniture',
    label: '가구',
    sheet: 'A-02',
    name: '하부장',
    caseId: 'panel-classification',
    layers: [
      {
        label: '형상 분석',
        title: '패널과 접합면을 찾습니다',
        text: '가구 모델에서 패널을 하나씩 떼어 보고, 서로 맞닿은 접합면을 찾습니다.',
        legend: [],
        balloons: false,
      },
      {
        label: '패널 인식',
        title: '패널마다 역할을 붙입니다',
        text: '접합 관계와 형상으로 측판, 상·하판, 선반, 뒷판, 문, 걸레받이를 구분합니다.',
        legend: [
          { label: '측판', swatch: TINTS.side },
          { label: '상·하판', swatch: TINTS.board },
          { label: '선반', swatch: TINTS.shelf },
          { label: '뒷판', swatch: TINTS.back },
          { label: '문', swatch: TINTS.door },
          { label: '걸레받이', swatch: TINTS.kick },
        ],
        balloons: true,
      },
      {
        label: '파라미터 조정',
        title: '크기를 바꾸면 패널이 함께 움직입니다',
        text: '폭과 걸레받이 높이를 바꿔 보세요. 패널마다 정해진 규칙대로 길이와 위치가 바뀝니다.',
        legend: [
          { label: '측판', detail: '폭 끝으로 이동', swatch: TINTS.side },
          { label: '상·하판·선반·뒷판', detail: '폭 − 36 mm', swatch: TINTS.board },
          { label: '문', detail: '폭 750 mm 초과 시 2짝', swatch: TINTS.door },
          { label: '걸레받이', detail: '하판·뒷판과 함께', swatch: TINTS.kick },
        ],
        balloons: false,
      },
    ],
  },
];
