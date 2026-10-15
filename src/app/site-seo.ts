import { CASE_STUDIES } from './portfolio-data';
import { OTHER_PROJECTS } from './other-projects-data';

export const SITE_URL = 'https://gyutae-kim.github.io';
export const SITE_NAME = '김규태 · Sean Kim';
// All sharing covers use the same small, widely supported JPEG format.
export const SHARE_IMAGE = { width: 1200, height: 630, type: 'image/jpeg' };
export interface SearchPage {
  path: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  kind: 'ProfilePage' | 'CollectionPage' | 'ContactPage' | 'WebPage';
  project?: { title: string; headline: string; tags: string[] };
}

export const SEARCH_PAGES: SearchPage[] = [
  {
    path: '/',
    title: '김규태 · Sean Kim — AI · 3D · CAD/CAM 개발자 포트폴리오',
    description: '김규태(Sean Kim)의 AI·3D·CAD/CAM 연구개발 포트폴리오입니다. 가공 특징 인식과 Fusion CAM 자동화, 가구 패널 인식, SketchUp 기반 Wedraw Pro 개발과 강화학습·컴퓨터 비전 연구를 소개합니다.',
    image: 'assets/og/home.jpg',
    imageAlt: '김규태 Sean Kim 포트폴리오. 가구 설계부터 가공 데이터까지 3D 형상을 다룹니다.',
    kind: 'ProfilePage',
  },
  {
    path: '/portfolio',
    title: 'AI · CAD/CAM 개발 프로젝트 — 김규태 · Sean Kim',
    description: '가공 특징 인식과 Fusion CAM 자동화, 가구 패널 인식, SketchUp 기반 Wedraw Pro, 서비스 장애 감시와 주문·송장 연동까지 김규태의 개발 프로젝트와 맡은 역할을 소개합니다.',
    image: 'assets/og/portfolio.jpg',
    imageAlt: '연구에서 제조까지 이어지는 AI·CAD/CAM 개발 프로젝트.',
    kind: 'CollectionPage',
  },
  ...[...CASE_STUDIES, ...OTHER_PROJECTS].map((project): SearchPage => ({
    path: `/portfolio/${project.id}`,
    title: `${project.title} — ${SITE_NAME}`,
    description: `${project.headline}. ${project.role}`,
    image: CASE_STUDIES.some((item) => item.id === project.id)
      ? `assets/og/${project.id}.jpg` : 'assets/og/portfolio.jpg',
    imageAlt: `프로젝트 ${project.number}, ${project.title}.`,
    kind: 'WebPage',
    project,
  })),
  {
    path: '/research',
    title: '강화학습 · 컴퓨터 비전 연구 — 김규태 · Sean Kim',
    description: '김규태의 학부연구생 시절 강화학습과 컴퓨터 비전 연구입니다. TSP 경로 탐색, 의류 사진 분류, 가상 착용 앱의 공개 코드와 실험 결과, 시행착오를 소개합니다.',
    image: 'assets/og/research.jpg',
    imageAlt: '강화학습과 컴퓨터 비전 연구, TSP 경로 그림.',
    kind: 'CollectionPage',
  },
  {
    path: '/opencad',
    title: 'OpenCAD · 브라우저 CAD 뷰어 — 김규태 · Sean Kim',
    description: '설치 없이 브라우저에서 CAD 파일을 여는 개인 프로젝트 OpenCAD입니다. 공개된 DWG·DXF 2D 도면 뷰어와 준비 중인 STEP·SKP·NC 뷰어를 소개합니다.',
    image: 'assets/og/opencad.jpg',
    imageAlt: 'OpenCAD 표지. 브라우저에서 DWG·DXF 도면을 여는 2D 뷰어.',
    kind: 'CollectionPage',
  },
  {
    path: '/contact',
    title: '연락 · 연구개발 협업 — 김규태 · Sean Kim',
    description: 'AI·3D 형상·CAD/CAM·가구 제조 데이터 분야의 연구개발 포지션과 협업 제안을 위한 김규태(Sean Kim)의 이메일과 GitHub 연락처입니다.',
    image: 'assets/og/home.jpg',
    imageAlt: '김규태 Sean Kim의 연구개발 협업 연락처.',
    kind: 'ContactPage',
  },
];

export function searchPage(url: string): SearchPage | undefined {
  const path = url.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return SEARCH_PAGES.find((page) => page.path === path);
}

// The browser and the static build use the same graph and page descriptions.
export function structuredData(page: SearchPage): object {
  const personId = `${SITE_URL}/#person`;
  const websiteId = `${SITE_URL}/#website`;
  const url = SITE_URL + page.path;
  const graph: object[] = [
    {
      '@type': 'Person', '@id': personId, name: '김규태', alternateName: 'Sean Kim',
      url: `${SITE_URL}/`, image: `${SITE_URL}/assets/sean-kim.webp`,
      email: 'mailto:GyuTae.K1020@gmail.com', sameAs: ['https://github.com/GyuTae-Kim'],
      knowsAbout: ['3D 형상 AI', '가공 특징 인식', 'CAD/CAM', 'Autodesk Fusion API', 'SketchUp', '가구 제조 데이터', '강화학습', '컴퓨터 비전'],
    },
    { '@type': 'WebSite', '@id': websiteId, url: `${SITE_URL}/`, name: SITE_NAME, inLanguage: 'ko', publisher: { '@id': personId } },
    {
      '@type': page.kind, '@id': `${url}#webpage`, url, name: page.title,
      description: page.description, inLanguage: 'ko', isPartOf: { '@id': websiteId },
      about: { '@id': personId },
      ...(page.path === '/' ? { mainEntity: { '@id': personId } } : {}),
      ...(page.path !== '/' ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
      ...(page.project ? { mainEntity: { '@id': `${url}#project` } } : {}),
    },
  ];
  if (page.path !== '/') {
    const crumbs = [{ name: '홈', item: `${SITE_URL}/` }];
    if (page.project) crumbs.push({ name: '프로젝트', item: `${SITE_URL}/portfolio` });
    crumbs.push({ name: page.project?.title ?? page.title.split(' — ')[0], item: url });
    graph.push({
      '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`,
      itemListElement: crumbs.map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, ...crumb })),
    });
  }
  if (page.project) graph.push({
    '@type': 'CreativeWork', '@id': `${url}#project`, url, name: page.project.title,
    description: page.project.headline, keywords: page.project.tags,
    author: { '@id': personId }, image: `${SITE_URL}/${page.image}`, inLanguage: 'ko',
  });
  if (page.path === '/portfolio') graph.push({
    '@type': 'ItemList', '@id': `${url}#projects`, name: '개발 프로젝트',
    itemListElement: SEARCH_PAGES.filter((item) => item.project).map((item, i) => ({
      '@type': 'ListItem', position: i + 1, url: SITE_URL + item.path, name: item.project!.title,
    })),
  });
  return { '@context': 'https://schema.org', '@graph': graph };
}
