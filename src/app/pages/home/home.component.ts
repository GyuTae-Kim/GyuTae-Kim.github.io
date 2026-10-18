import { AfterViewInit, Component, NgZone, OnDestroy } from '@angular/core';
import { CASE_STUDIES, FIGURE_KIND_LABELS, thumbSrcset } from '../../portfolio-data';
import { RESEARCH_WORKS } from '../../research-data';
import { OTHER_PROJECTS } from '../../other-projects-data';
import { OPENCAD_PROJECTS, OPENCAD_TOOLS } from '../../opencad-data';

// Short introductions for the home page; detailed evidence stays on each case page.
const PROJECT_INTROS: Record<string, { result: string; role: string }> = {
  'cad-feature-recognition': {
    result: '가공 피쳐 인식부터 Fusion CAM 공정 생성과 결과 확인까지 연결했습니다.',
    role: '형상 분석·가공 전략·Fusion 연동을 개발했습니다. 디지털 트윈은 결과 시각화만 맡았습니다.',
  },
  'panel-classification': {
    result: '패널을 구분하고 크기 변경을 계수식으로 계산해, 웹에서 실시간 설계와 발주로 이어지게 했습니다.',
    role: '팀에서 패널 인식 AI와 패널의 크기·위치 변화를 계산하는 계수식 구성을 맡았습니다.',
  },
  'wedraw-pro': {
    result: 'SketchUp 설계를 BOM·라벨·도면·가공 코드로 출력하고 웹에서 확인하게 했습니다.',
    role: '팀에서 제조 데이터 출력·생산 투입과 도면·발주 초기 개발을 리딩했습니다.',
  },
  'service-monitoring': {
    result: '서버 상태뿐 아니라 송장·알림톡의 처리 실패까지 감지하고, 운영 문제 6건의 원인을 고쳤습니다.',
    role: '감시 기준부터 오류 수집·알림·관리자 콘솔까지 직접 개발했습니다.',
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
  openCadProjects = [
    ...OPENCAD_TOOLS.filter((tool) => tool.url),
    ...OPENCAD_PROJECTS.filter((project) => !project.url),
  ];
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
