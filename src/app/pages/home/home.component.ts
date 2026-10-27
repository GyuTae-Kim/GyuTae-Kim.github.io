import { AfterViewInit, Component, NgZone, OnDestroy } from '@angular/core';
import { CASE_STUDIES, FIGURE_KIND_LABELS, thumbSrcset } from '../../portfolio-data';
import { RESEARCH_WORKS } from '../../research-data';
import { OTHER_PROJECTS } from '../../other-projects-data';
import { OPENCAD_PROJECTS, OPENCAD_TOOLS } from '../../opencad-data';

// Short introductions for the home page; detailed evidence stays on each case page.
// title: a shorter card title when the page title is too long for the home card.
const PROJECT_INTROS: Record<string, { title?: string; result: string; role: string }> = {
  'cad-feature-recognition': {
    result: '가공 피쳐를 인식해 Fusion CAM 공정을 만들고 결과까지 확인했습니다.',
    role: '형상 분석, 가공 전략 설계, Fusion 연동을 개발했습니다. 디지털 트윈은 결과 시각화만 맡았습니다.',
  },
  'panel-classification': {
    result: '패널을 인식하고 크기 변경을 계수식으로 계산해, 웹에서 실시간으로 설계를 바꾸고 발주할 수 있게 했습니다.',
    role: '팀에서 패널 인식 AI와 패널의 크기·위치 변화를 계산하는 계수식 구성을 맡았습니다.',
  },
  'wedraw-pro': {
    result: 'SketchUp 설계를 BOM·라벨·도면·가공 코드로 출력하고 웹에서 확인하게 했습니다.',
    role: '팀에서 제조 데이터 출력·생산 투입과 도면·발주 초기 개발을 리딩했습니다.',
  },
  'service-monitoring': {
    title: '서비스 감시와 오류 추적',
    result: '서버 상태와 함께 송장·알림톡의 처리 실패까지 잡아내고, 운영 문제 6건의 원인을 고쳤습니다.',
    role: '감시 기준부터 오류 수집·알림·관리자 콘솔까지 직접 개발했습니다.',
  },
  'voda-architecture': {
    title: 'VODA 아키텍처 재설계',
    result: '이벤트 수집부터 집계, 페이지 캡처까지 새 구조에 맞춰 다시 만들고 분석 화면의 시간 초과를 해결했습니다.',
    role: '좌표 수집, 메시지 처리, 정제기, 크롤러를 개발했습니다.',
  },
  'vory-q-curation': {
    title: 'VORY-Q 개인화 추천',
    result: '방문과 구매 기록으로 고객별 추천 상품을 골라 쇼핑몰 화면에 보여 주는 서비스를 설계했습니다.',
    role: '데이터 흐름, API, DB, 추천 구조를 설계하고 통계 추천을 개발했습니다.',
  },
  'scene-change-player': {
    title: '장면 전환 플레이어',
    result: '장면 전환 지점을 재생 막대에 표시하고 미리보기와 장면 이동, 구간 저장까지 한 화면에서 하게 했습니다.',
    role: '장면 검출을 뺀 플레이어 기능을 모두 개발했습니다.',
  },
};

const RESEARCH_ROLES: Record<string, string> = {
  'graph-tsp': '그래프 환경·학습 루프와 도시 삽입 규칙을 연결했습니다.',
  'fashion-classification': '전이학습·클래스별 샘플링·혼동행렬 평가를 구현했습니다.',
  'virtual-try-on': '공개 모델의 입력 전처리와 Flask API·Android 앱을 연결했습니다.',
};

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  // Published apps are rows with their screenshot; the shared 3D core follows as a slim card.
  openCadApps = OPENCAD_TOOLS.filter((tool) => tool.url && tool.figure);
  openCadCore = OPENCAD_PROJECTS.filter((project) => !project.url);
  cases = CASE_STUDIES.map((project) => ({ ...project, intro: PROJECT_INTROS[project.id] }));
  operations = OTHER_PROJECTS.map((project) => ({ ...project, intro: PROJECT_INTROS[project.id] }));
  kindLabels = FIGURE_KIND_LABELS;
  srcset = thumbSrcset;
  research = RESEARCH_WORKS.filter((work) => work.result).map((work) => ({
    ...work,
    homeRole: RESEARCH_ROLES[work.id],
  }));
  // Shown as its own product card under the concept viewport.
  furniture = CASE_STUDIES.find((c) => c.id === 'wedraw-pro')!;
  // Only tools that appear in the projects and research on this site.
  skills = [
    { area: 'AI', items: ['Python', 'TensorFlow', 'PyTorch', '그래프 신경망', '강화학습', '컴퓨터 비전'] },
    { area: '3D · CAD/CAM', items: ['OpenCascade', 'STEP', 'Autodesk Fusion API', 'CAM'] },
    { area: '제품 개발', items: ['SketchUp Ruby API', 'JavaScript', 'Flask'] },
  ];
  sections = [
    { id: 'work', label: '프로젝트' },
    { id: 'other-projects', label: '프로젝트 기록' },
    { id: 'research', label: '연구' },
    { id: 'achievements', label: '성과' },
    { id: 'about', label: '소개' },
  ];
  active = '';
  private observer?: IntersectionObserver;

  constructor(private readonly zone: NgZone) {}

  ngAfterViewInit() {
    if (typeof IntersectionObserver === 'undefined') return;
    // Highlight the section that crosses the upper middle of the screen.
    this.observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit && hit.target.id !== this.active) this.zone.run(() => (this.active = hit.target.id));
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    for (const s of this.sections) {
      const el = document.getElementById(s.id);
      if (el) this.observer.observe(el);
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
