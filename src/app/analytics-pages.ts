import { originalPath } from './i18n/localization';
import type { ContentGroup } from './analytics';
import { SEARCH_ALIASES, SEARCH_PAGES, searchPage } from './site-seo';

export interface AnalyticsPage { path: string; title: string; group: ContentGroup }

// Public route identities are stable even when search copy or browser titles change.
const NAMES: Record<string, [ContentGroup, string]> = {
  '/': ['포트폴리오', '포트폴리오 | 홈'],
  '/portfolio': ['프로젝트', '포트폴리오 | 프로젝트'],
  '/portfolio/cad-feature-recognition': ['프로젝트', '프로젝트 | 3D 가공 특징 인식'],
  '/portfolio/panel-classification': ['프로젝트', '프로젝트 | 가구 패널 인식'],
  '/portfolio/wedraw-pro': ['프로젝트', '프로젝트 | Wedraw Pro'],
  '/portfolio/service-monitoring': ['프로젝트', '프로젝트 | 서비스 모니터링'],
  '/portfolio/voda-architecture': ['프로젝트', '프로젝트 | VODA 아키텍처'],
  '/portfolio/vory-q-curation': ['프로젝트', '프로젝트 | VORY-Q 추천'],
  '/research': ['연구', '연구 | 목록'],
  '/research/graph-tsp': ['연구', '연구 | TSP 강화학습'],
  '/research/fashion-classification': ['연구', '연구 | 의류 분류'],
  '/research/virtual-try-on': ['연구', '연구 | 가상 착용'],
  '/opencad': ['OpenCAD 소개', 'OpenCAD | 도구 모음'],
  '/opencad/projects/dwg-dxf': ['OpenCAD 소개', 'OpenCAD 소개 | DWG/DXF 캐드'],
  '/opencad/projects/step-viewer': ['OpenCAD 소개', 'OpenCAD 소개 | STEP 뷰어'],
  '/opencad/projects/skp-viewer': ['OpenCAD 소개', 'OpenCAD 소개 | SKP 뷰어'],
  '/opencad/projects/nc-viewer': ['OpenCAD 소개', 'OpenCAD 소개 | NC 뷰어'],
  '/opencad/projects/viewer3d': ['OpenCAD 소개', 'OpenCAD 소개 | 3D 뷰어 코어'],
  '/opencad/guides/open-dwg-dxf': ['OpenCAD 가이드', 'OpenCAD 가이드 | DWG/DXF 열기'],
  '/opencad/guides/measure-export': ['OpenCAD 가이드', 'OpenCAD 가이드 | 측정과 내보내기'],
  '/opencad/guides/open-step-stp': ['OpenCAD 가이드', 'OpenCAD 가이드 | STEP 열기'],
  '/opencad/guides/open-skp': ['OpenCAD 가이드', 'OpenCAD 가이드 | SKP 열기'],
  '/opencad/guides/check-nc-toolpath': ['OpenCAD 가이드', 'OpenCAD 가이드 | NC 공구 경로'],
  '/notes': ['개발 노트', '개발 노트 | 목록'],
  '/notes/cad-cam-feature-recognition': ['개발 노트', '개발 노트 | CAD/CAM 특징 인식'],
  '/notes/furniture-manufacturing-data': ['개발 노트', '개발 노트 | 가구 제조 데이터'],
  '/contact': ['연락', '포트폴리오 | 연락'],
};

export const ANALYTICS_PAGES: readonly AnalyticsPage[] = SEARCH_PAGES.map(page => {
  const name = NAMES[page.path];
  // A newly authored public page stays identifiable until a concise label is added.
  return { path: page.path, group: name?.[0] ?? '포트폴리오', title: name?.[1] ?? `포트폴리오 | ${page.title}` };
});

export function analyticsPage(url: string): AnalyticsPage {
  const path = originalPath(url).split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  const page = searchPage(SEARCH_ALIASES.find(alias => alias.from === path)?.to ?? path);
  return ANALYTICS_PAGES.find(item => item.path === page?.path)
    ?? { path: '/404', title: '포트폴리오 | 없는 페이지', group: '오류' };
}
