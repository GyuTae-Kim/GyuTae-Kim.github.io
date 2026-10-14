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
        label: '형상 분석',
        title: '면과 맞닿은 관계를 읽습니다',
        text: '부품을 면 29개로 나누고, 서로 맞닿은 53쌍을 그래프로 잇습니다.',
        legend: [
          { label: '면', detail: '29개', swatch: '#2f5f9e' },
          { label: '맞닿은 관계', detail: '53쌍', swatch: '#8fa8cf' },
        ],
        balloons: false,
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
      },
      {
        label: '가공 전략',
        title: '특징마다 공구 경로를 정합니다',
        text: '인식한 특징을 단차 면, 포켓, 구멍, 바깥 윤곽 순서로 깎는 경로로 바꿉니다.',
        legend: [
          { label: '단차 면 가공', detail: 'Ø8 평엔드밀', swatch: TINTS.cut },
          { label: '포켓 가공', detail: '2단 · 등고선', swatch: TINTS.cut },
          { label: '구멍·카운터보어', detail: '드릴 → 원호', swatch: TINTS.cut },
          { label: '윤곽 가공', detail: '바깥 둘레', swatch: TINTS.cut },
          { label: '공구 이동', detail: '급속 이송', swatch: TINTS.rapid, dashed: true },
        ],
        balloons: true,
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
