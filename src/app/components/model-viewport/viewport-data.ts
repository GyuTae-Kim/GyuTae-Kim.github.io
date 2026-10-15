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
  sheet: '#e7dfcb',
  drilled: '#2c322e',
  wall: '#f3f1ea',
  counter: '#f6f5f1',
  oak: '#c29a74',
};

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
        label: '특징 인식',
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
        text: '윗면을 고르고 바깥 윤곽을 먼저 낸 뒤, 단차와 포켓, 카운터보어를 황삭과 정삭으로 나눠 깎고 마지막에 구멍을 뚫습니다.',
        legend: [
          { label: '윗면 페이싱', detail: 'Ø80 · 1 mm씩 3단', swatch: TINTS.face },
          { label: '외곽', detail: 'Ø12 황삭 → 정삭 · 2 mm씩', swatch: TINTS.fillet },
          { label: '단차', detail: '개방 포켓 · Ø12 → Ø5', swatch: TINTS.step },
          { label: '포켓', detail: 'Ø12 플런지 → Ø5', swatch: TINTS.pocket },
          { label: '카운터보어', detail: 'Ø12 포켓 · 2곳', swatch: TINTS.counterbore },
          { label: '드릴링', detail: 'Ø10 · 관통 + 1 mm', swatch: TINTS.hole },
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
    name: '원룸 벽면 가구',
    caseId: 'wedraw-pro',
    layers: [
      {
        label: '설계',
        title: '가구빌더로 벽 한 면을 채웁니다',
        text: '벽을 그리고 붙박이장, 냉장고 자리, 하부장, 상부장을 놓아 폭을 나누면 가구빌더가 장마다 패널과 문을 만듭니다.',
        legend: [
          { label: '벽 그리기', detail: '높이 2380', swatch: '#2f5f9e' },
          { label: '붙박이장', detail: '900 + 600', swatch: TINTS.side },
          { label: '냉장고 자리', detail: '950', swatch: '#8fa8cf' },
          { label: '하부장', detail: '600 + 900', swatch: TINTS.board },
          { label: '상부장', detail: '바닥에서 1500', swatch: TINTS.shelf },
          { label: '패널과 문', detail: '장 7개', swatch: TINTS.door },
        ],
        balloons: false,
        steps: true,
      },
      {
        label: '제조',
        title: '공장에서 패널을 가공합니다',
        text: '엔진이 배치한 대로 몸통재 판재에서 패널을 오려 내고, 하부장 측판에 엣지를 붙인 뒤 스키퍼로 목찬넬 자리를 따내고 구멍과 뒷판 홈을 냅니다.',
        legend: [
          { label: '네스팅', detail: '몸통재 18T · 11장', swatch: TINTS.sheet },
          { label: '엣지밴딩', detail: '측판 3면 · 0.8 mm', swatch: TINTS.cut },
          { label: '목찬넬 따내기', detail: '스키퍼 라우터 · 60 × 40', swatch: TINTS.side },
          { label: '스키퍼 보링', detail: '연결 피스 Ø6 · 선반핀 Ø3', swatch: TINTS.drilled },
          { label: '뒷판 홈', detail: '아랫면 라우터 · 4 × 7', swatch: '#59605a' },
        ],
        balloons: false,
        steps: true,
      },
      {
        label: '조립·설치',
        title: '조립해서 집에 설치합니다',
        text: '하부장을 연결 피스로 조립하고, 붙박이장과 냉장고장, 하부장을 벽에 붙여 수평을 맞춘 뒤 상판을 올리고 상부장을 겁니다.',
        legend: [
          { label: '몸통 조립', detail: '연결 피스 12곳', swatch: TINTS.wall },
          { label: '선반과 조절발', detail: '발 4개', swatch: TINTS.wall },
          { label: '걸레받이와 문', detail: '경첩 4개', swatch: TINTS.oak },
          { label: '설치', detail: '벽에 붙여 수평 맞춤', swatch: TINTS.oak },
          { label: '상판', detail: '12T 엔지니어드스톤', swatch: TINTS.counter },
          { label: '상부장', detail: '보조목에 걸기', swatch: TINTS.oak },
        ],
        balloons: false,
        steps: true,
      },
    ],
  },
];
