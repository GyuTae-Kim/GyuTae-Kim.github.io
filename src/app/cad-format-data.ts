import type { SiteArticle } from './articles-data';

export const CAD_FORMAT_GUIDE: SiteArticle = {
  path: '/opencad/guides/choose-cad-format', category: 'OpenCAD 사용 안내',
  title: 'DWG·DXF·STEP·STP·SKP 차이와 CAD 뷰어 선택',
  description: 'DWG와 DXF, STEP와 STP, 스케치업 SKP의 차이와 받은 CAD 파일에 맞는 무료 뷰어 고르는 법입니다. 윈도우·맥에서 여는 방법과 설계팀·공장에 보내기 전 확인할 항목도 다룹니다.',
  lead: '파일을 열어 치수를 확인하려는지, 3D 형상을 검토하려는지, 공장에 생산 자료를 보내려는지 먼저 정하세요. 확장자와 작업 목적을 함께 보면 필요한 뷰어와 추가로 요청할 자료를 고르기 쉽습니다.',
  image: 'assets/og/opencad.jpg', imageAlt: 'OpenCAD 도면·3D 모델·공구 경로 도구 모음 표지.',
  actions: [{ path: '/opencad', label: '형식에 맞는 무료 뷰어 열기' }],
  figure: { src: 'assets/og/opencad.jpg', alt: 'OpenCAD 도면·3D 모델·공구 경로 도구 모음 표지.', caption: 'OpenCAD 도구 모음. 파일 종류마다 뷰어와 사용 안내가 있습니다.', width: 1200, height: 630 },
  sections: [
    {
      id: 'compare', title: '파일 형식별 확인할 내용',
      paragraphs: ['파일 종류마다 OpenCAD에서 확인할 내용이 다릅니다. 확장자가 같아도 저장한 프로그램과 버전에 따라 담긴 정보가 다를 수 있으니 이 둘도 확인하세요.'],
      table: {
        caption: 'CAD 파일 선택표: 도면·3D 모델·공구 경로',
        columns: ['파일 형식', '확인할 내용', '함께 확인할 자료'],
        rows: [
          ['DWG · DXF', '2D 도면의 치수·도면층·문자·배치', '저장 버전, 도면 단위, 외부 참조와 글꼴'],
          ['STEP · STP', '3D 부품·조립 구성·단면·저장된 PMI', '내보내기 옵션, 단위와 누락된 부품 여부'],
          ['SketchUp SKP', '스케치업 모델·태그·장면·구성요소', '저장 버전, 숨김 상태와 기준 치수'],
          ['NC · G-code · MPR', '공구 이동·코드 줄·해석 경고', '장비·제어기, 단위, 원점과 공구 정보'],
        ],
      },
    },
    { id: 'differences', title: 'DWG와 DXF, STEP와 STP의 차이', paragraphs: ['DWG와 DXF는 서로 다른 도면 파일 형식입니다. 도면을 주고받을 때는 받는 프로그램이 지원하는 형식과 저장 버전을 맞추고, 문자·치수·외부 참조가 유지되는지 다시 열어 확인하세요.', 'STEP와 STP는 같은 STEP 형식에 쓰이는 확장자입니다. 다만 내보내기 설정에 따라 형상, 조립 구조, 색상이나 PMI의 포함 여부가 달라질 수 있습니다. STP를 STEP로 이름만 바꿔도 누락된 정보가 새로 생기지는 않습니다.', 'SKP는 SketchUp 모델 파일입니다. 3D로 보인다고 해서 STEP 형상이나 생산용 부품표, CNC 가공 코드로 쓸 수 있는 것은 아닙니다.'] },
    { id: 'browser', title: '윈도우·맥에서 설치 없이 파일을 여는 순서', paragraphs: ['OpenCAD는 Windows와 macOS에서 JavaScript와 WebGL2를 지원하는 최신 브라우저로 씁니다. 운영체제보다는 브라우저 기능과 기기 메모리, 파일 복잡도의 영향을 더 받습니다. 모바일에서는 보기와 치수 확인을 하고, 편집은 컴퓨터에서 하세요.'], steps: ['받은 파일의 확장자와 저장한 프로그램·버전을 확인합니다.', 'OpenCAD 도구 모음에서 DWG·DXF, STEP·STP, SKP 또는 NC 뷰어를 선택합니다.', '예제 파일로 먼저 화면 조작을 익힌 뒤 내 파일을 엽니다.', '전체 보기, 표시 상태와 알고 있는 기준 치수를 확인합니다. 이상이 있으면 해당 형식의 사용 안내에서 점검합니다.'] },
    { id: 'conversion', title: '뷰어로 열기와 파일 변환의 차이', paragraphs: ['파일 이름 끝의 확장자를 바꾸는 것은 형식 변환이 아닙니다. 다른 형식이 필요하면 원본 프로그램에서 내보내고, 받는 프로그램으로 결과를 다시 열어 확인해야 합니다.', 'OpenCAD의 DWG·DXF 캐드는 지원 범위 안에서 도면을 고쳐 저장하고 PDF로 출력합니다. STEP·SKP·NC 뷰어로 아무 형식으로나 바꾸거나 CAM 공정을 만들 수는 없습니다. 필요한 것이 PDF나 화면 이미지인지, 고칠 수 있는 도면이나 3D 형상인지 먼저 정하세요.'] },
    { id: 'handoff', title: '설계팀·가구 공장·가공 업체에 전달할 체크리스트', paragraphs: ['같은 부품을 여러 파일에서 맞춰 볼 수 있게 기준 정보도 보내세요. 새 파일을 보내면서 기존 도면, 부품표, 가공 파일 중 무엇이 바뀌었는지 표시해 이전 버전과 섞이지 않게 합니다.'], points: ['공통: 부품·판재 번호, 개정 번호, 날짜, 단위와 기준 치수를 적습니다.', '도면: 저장 버전과 외부 참조를 확인하고, 비교용 PDF도 준비합니다.', '3D 모델: 부품 수, 조립 위치와 기준 방향을 원본과 대조합니다.', '가구: BOM·라벨의 번호, 자재 두께, 결·엣지 방향과 앞뒷면 기준을 맞춥니다.', '가공: 장비·제어기, 원점, 공구와 투입 방향을 현장 기준으로 별도 확인합니다.'], },
  ],
  related: [
    { path: '/opencad/guides/open-dwg-dxf', label: 'DWG·DXF 파일 열기와 표시 문제 점검' },
    { path: '/opencad/guides/open-step-stp', label: 'STEP·STP 3D 모델 열기' },
    { path: '/opencad/guides/open-skp', label: 'SKP 파일 열기·지원 버전 확인' },
    { path: '/opencad/guides/check-nc-toolpath', label: 'NC·G-code·MPR 경로 확인' },
  ],
  sources: [
    { url: 'https://github.com/GyuTae-Kim/opencad-dwgdxf#readme', label: 'OpenCAD 공개 사용 안내와 지원 범위' },
    { url: 'https://www.autodesk.com/support/technical/article/caas/sfdcarticles/sfdcarticles/What-are-the-Inventor-Save-As-STEP-Export-Options-stp-ste-step.html', label: 'Autodesk의 STEP 확장자·내보내기 옵션 안내' },
    { url: 'https://github.com/GyuTae-Kim/opencad-skp#readme', label: '공개 SKP 뷰어의 지원 버전과 사용법' },
  ],
};
