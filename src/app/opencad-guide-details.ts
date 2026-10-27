export interface GuideDetails {
  projectPath: string;
  support: { label: string; text: string }[];
  example: { label: string; text: string }[];
  checks: { label: string; text: string }[];
  figures?: { src: string; alt: string; caption: string; width: number; height: number }[];
}

// Values come from the public sample generators and the published application.
// A synthetic example demonstrates the workflow, not compatibility with every file.
export const OPENCAD_GUIDE_DETAILS: Record<string, GuideDetails> = {
  'open-dwg-dxf': {
    projectPath: '/opencad/projects/dwg-dxf',
    support: [{ label: 'DWG', text: 'R13–R2018' }, { label: 'DXF', text: 'R12–R2018 · ASCII / Binary' }],
    example: [{ label: '예제 열기', text: '시작 화면에서 예제 도면을 열고 도면층·모형·배치를 차례로 확인합니다.' }],
    checks: [{ label: '빈 화면', text: '전체 보기 → 도면층 표시 → 모형·배치 순서로 확인합니다.' }, { label: '문자·참조 누락', text: '외부 참조와 원본 글꼴을 확인합니다. 확장자 변경으로 파일을 변환할 수는 없습니다.' }],
  },
  'measure-export': {
    projectPath: '/opencad/projects/dwg-dxf',
    support: [{ label: '측정', text: 'DIST / MEASUREGEOM / AREA / MASSPROP' }, { label: 'PDF', text: 'PLOT / PRINT / EXPORTPDF' }],
    example: [{ label: '예제 열기', text: '같은 두 끝점을 스냅으로 지정해 재고, 도면 단위와 출력 축척을 함께 확인합니다.' }],
    checks: [{ label: '측정값 불일치', text: '도면 단위 → 객체 스냅 → 실제 형상 → 수동 치수 문자 순서로 대조합니다.' }, { label: '출력 크기 불일치', text: '플롯 축척과 PDF 인쇄의 페이지 맞춤 설정을 확인합니다.' }],
  },
  'open-step-stp': {
    projectPath: '/opencad/projects/step-viewer',
    support: [{ label: 'STEP', text: 'AP203 / AP214 / AP242 · .stp / .step / .p21' }, { label: '압축', text: '.stp.gz / .stpZ / .zip' }, { label: '지원하지 않는 형식', text: 'STEP-XML (.stpx)' }],
    example: [{ label: '단위', text: 'mm' }, { label: '받침판', text: '20 × 10 × 2 mm · Ø4 mm' }, { label: 'PMI', text: 'width: 20 mm ±0.1 · diameter: 4 mm +0.05/0' }],
    checks: [{ label: '예제 확인 순서', text: '예제로 먼저 보기 → PMI 탭 → 폭·지름 확인 → X 단면 → 단면 끄기 순서로 재현합니다.' }, { label: '빈 화면', text: '전체 보기 → 부품·레이어 표시 → 단면 끄기 순서로 확인합니다.' }, { label: 'PMI와 측정', text: 'PMI는 파일에 저장된 치수로, 뷰어에서 형상을 잰 값과는 다릅니다.' }],
    figures: [
      { src: 'assets/opencad/guide-step-pmi-1440.webp', alt: 'STEP 예제의 PMI 탭에 표시된 폭 20mm와 구멍 지름 4mm.', caption: '공개 합성 예제에 저장된 PMI입니다.', width: 1440, height: 865 },
      { src: 'assets/opencad/guide-step-section-1440.webp', alt: '같은 STEP 예제에서 X 단면을 켜고 내부 형상을 확인한 화면.', caption: 'X 단면을 켠 상태입니다. 빈 화면을 점검할 때는 단면 끄기로 원래 표시를 복원합니다.', width: 1440, height: 865 },
      { src: 'assets/opencad/guide-step-hidden-1440.webp', alt: '부품을 모두 숨겨 빈 화면이 된 STEP 예제.', caption: '제품 나무에서 조립 전체를 숨긴 상태입니다. 파일을 못 읽은 것이 아니라 표시 설정 때문에 비어 보입니다.', width: 1440, height: 865 },
      { src: 'assets/opencad/guide-step-restored-1440.webp', alt: '모두 보이기로 같은 STEP 예제의 표시를 복원한 화면.', caption: '모두 보이기를 눌러 같은 모델을 다시 표시했습니다. 레이어를 껐다면 레이어 탭에서도 복원하세요.', width: 1440, height: 865 },
    ],
  },
  'open-skp': {
    projectPath: '/opencad/projects/skp-viewer',
    support: [{ label: 'SKP', text: 'SketchUp 6 / 7 / 8 / 2013–2026' }, { label: '지원하지 않는 형식', text: 'SketchUp 3–5' }],
    example: [{ label: '단위', text: 'mm' }, { label: '예제 집', text: '6000 × 4000 mm' }, { label: '장면', text: '앞마당 · 식탁 · 단면 · 위에서' }],
    checks: [{ label: '예제 확인 순서', text: '예제로 먼저 보기 → 장면 선택 → 태그 표시 → 전체 보기 순서로 재현합니다.' }, { label: '누락 객체', text: '태그·숨김 객체·장면의 표시 상태와 단면을 확인합니다. 다시 해석하기 전에 표시 설정을 복원해 보세요.' }],
    figures: [
      { src: 'assets/opencad/guide-skp-scenes-1440.webp', alt: '공개 SKP 예제 집의 저장된 장면과 표시 설정을 확인하는 화면.', caption: '브라우저에서 만든 합성 예제 집입니다. 장면을 바꾸고 태그를 켜고 끄면서 표시가 어떻게 달라지는지 볼 수 있습니다.', width: 1440, height: 812 },
    ],
  },
  'check-nc-toolpath': {
    projectPath: '/opencad/projects/nc-viewer',
    support: [{ label: 'G-code', text: '.nc / .gcode / .ngc' }, { label: 'Heidenhain', text: 'Plain text / DIN–ISO' }, { label: '판재 가공', text: 'woodWOP MPR / WangShi PGI / KDT XML' }],
    example: [{ label: '단위', text: 'G21 · mm' }, { label: '좌표', text: 'G90 · XYZ' }],
    checks: [{ label: '예제 확인 순서', text: '예제 경로를 열고 코드 줄과 이동을 함께 확인한 뒤 재생과 단위·해석 경고를 점검합니다.' }, { label: '가공 전 확인', text: '충돌, 공구 보정, 기계 동작은 경로 화면으로 알 수 없으니 실제 장비에서 따로 확인합니다.' }],
  },
};
