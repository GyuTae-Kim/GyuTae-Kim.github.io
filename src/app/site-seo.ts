import { CASE_STUDIES } from './portfolio-data';
import { OTHER_PROJECTS } from './other-projects-data';
import { OPENCAD_TOOLS } from './opencad-data';
import { SITE_ARTICLES, SiteArticle } from './articles-data';
import contentHistory from './content-history.json';
import { RESEARCH_WORKS, ResearchWork } from './research-data';

export const SITE_URL = 'https://gyutae-kim.github.io';
export const SITE_NAME = '김규태 · Sean Kim';
// All sharing covers use the same small, widely supported JPEG format.
export const SHARE_IMAGE = { width: 1200, height: 630, type: 'image/jpeg' };
export function contentModified(path: string): string {
  return (contentHistory as Record<string, { lastmod: string }>)[path]?.lastmod ?? '';
}
export interface SearchPage {
  path: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  kind: 'ProfilePage' | 'CollectionPage' | 'ContactPage' | 'WebPage';
  project?: { title: string; headline: string; tags: string[] };
  research?: ResearchWork;
  article?: SiteArticle;
}

// Search copy describes the work and responsibility documented on each case page.
const PROJECT_SEARCH_COPY: Record<string, { title: string; description: string }> = {
  'cad-feature-recognition': { title: '3D 가공 특징 인식·Fusion CAM 자동화 | 김규태', description: '3D CAD 모델의 가공 특징을 AI로 인식하고 Autodesk Fusion CAM 공정으로 연결한 연구개발 사례입니다. 김규태가 맡은 형상 분석·AI 학습·가공 전략 설계와 시뮬레이션 검증 범위를 소개합니다.' },
  'panel-classification': { title: '가구 패널 인식 AI·파라메트릭 설계 | 김규태', description: '가구의 패널 역할을 AI로 인식하고 크기 변경 규칙을 계산하는 파라메트릭 설계 연구입니다. 팀 프로젝트에서 김규태가 맡은 패널·접합면 분석, AI 연구와 계수식 계산을 소개합니다.' },
  'wedraw-pro': { title: 'SketchUp 가구 설계·제조 데이터 개발 | 김규태', description: 'SketchUp 기반 가구 설계에서 도면·발주·제조 데이터와 생산 투입으로 이어지는 Wedraw Pro 개발 사례입니다. 팀에서 김규태가 리딩한 제조 데이터 출력·생산 투입과 도면·발주 초기 개발을 소개합니다.' },
  'service-monitoring': { title: '제조 소프트웨어 운영·서비스 장애 감시 | 김규태', description: '제조 소프트웨어의 서버와 PC 앱 오류를 모아 서비스 장애를 감시한 개발 사례입니다. 감시가 찾아낸 DB 응답 지연과 외부 연동 오류, 실제 수정 과정과 김규태의 역할을 소개합니다.' },
  'order-invoice-sync': { title: '가구 주문·송장 연동 자동화 개선 | 김규태', description: '가구 주문 서비스의 송장 연동에서 전송 충돌과 중복 전송을 해결한 개발 사례입니다. 김규태가 맡은 원인 분석과 전송 순서·중복 방지 개선, 운영 검증 범위를 소개합니다.' },
};

export const SEARCH_PAGES: SearchPage[] = [
  {
    path: '/',
    title: '김규태 Sean Kim | AI·CAD/CAM 개발자 포트폴리오',
    description: '김규태(Sean Kim)의 AI·CAD/CAM 개발자 포트폴리오입니다. 3D 가공 피쳐·가구 패널 인식부터 Fusion CAM 자동화, 제조 데이터 출력과 서비스 운영 개선까지 직접 맡은 역할과 결과를 소개합니다. 강화학습·컴퓨터 비전 연구의 구현과 실험 결과도 확인하세요.',
    image: 'assets/og/home.jpg',
    imageAlt: '김규태 Sean Kim 포트폴리오. 가구 설계부터 가공 데이터까지 3D 형상을 다룹니다.',
    kind: 'ProfilePage',
  },
  {
    path: '/portfolio',
    title: 'AI·CAD/CAM·제조 소프트웨어 개발 사례 | 김규태',
    description: '3D 형상 AI, CAD 자동화, CAM 공정 생성과 가구 제조 소프트웨어 개발 사례입니다. 김규태가 프로젝트별로 맡은 연구개발·제조 데이터·서비스 운영 역할과 결과, 검증 범위를 소개합니다.',
    image: 'assets/og/portfolio.jpg',
    imageAlt: '연구에서 제조까지 이어지는 AI·CAD/CAM 개발 프로젝트.',
    kind: 'CollectionPage',
  },
  ...[...CASE_STUDIES, ...OTHER_PROJECTS].map((project): SearchPage => ({
    path: `/portfolio/${project.id}`,
    title: PROJECT_SEARCH_COPY[project.id]?.title ?? `${project.title} — ${SITE_NAME}`,
    description: PROJECT_SEARCH_COPY[project.id]?.description ?? `${project.headline}. ${project.role}`,
    image: CASE_STUDIES.some((item) => item.id === project.id)
      ? `assets/og/${project.id}.jpg` : 'assets/og/portfolio.jpg',
    imageAlt: `프로젝트 ${project.number}, ${project.title}.`,
    kind: 'WebPage',
    project,
  })),
  {
    path: '/research',
    title: '강화학습·컴퓨터 비전 연구 기록 | 김규태',
    description: '김규태의 학부연구생 시절 강화학습과 컴퓨터 비전 연구입니다. TSP 경로 탐색, 의류 사진 분류, 가상 착용 앱의 공개 코드와 실험 결과, 시행착오를 소개합니다.',
    image: 'assets/og/research.jpg',
    imageAlt: '강화학습과 컴퓨터 비전 연구, TSP 경로 그림.',
    kind: 'CollectionPage',
  },
  ...RESEARCH_WORKS.map((research): SearchPage => ({
    path: `/research/${research.id}`,
    title: `${research.title} — ${SITE_NAME}`,
    description: `${research.summary} ${research.outcome}`,
    image: 'assets/og/research.jpg',
    imageAlt: '강화학습과 컴퓨터 비전 연구, TSP 경로 그림.',
    kind: 'WebPage',
    research,
  })),
  {
    path: '/opencad',
    title: 'OpenCAD 무료 캐드 뷰어·DWG·DXF 도구 | 김규태',
    description: '김규태가 만드는 무료 오픈소스 캐드 뷰어 OpenCAD입니다. 설치·회원가입 없이 DWG·DXF 도면 열기·측정·편집·저장과 PDF 출력을 지원합니다. 사용 안내와 지원 범위를 확인하세요.',
    image: 'assets/og/opencad.jpg',
    imageAlt: 'OpenCAD 표지. 브라우저에서 DWG·DXF 도면을 여는 2D 뷰어.',
    kind: 'CollectionPage',
  },
  {
    path: '/notes', title: 'AI·CAD/CAM·가구 제조 소프트웨어 개발 노트 | 김규태',
    description: 'AI·CAD/CAM 개발자 김규태의 기술 글입니다. 3D 가공 특징 인식과 Fusion CAM 자동화, 가구 설계·제조 데이터 개발에서 내린 판단과 검증 범위를 정리합니다.',
    image: 'assets/og/portfolio.jpg', imageAlt: '김규태의 AI·CAD/CAM·제조 소프트웨어 개발 노트.', kind: 'CollectionPage',
  },
  ...SITE_ARTICLES.map((article): SearchPage => ({
    path: article.path, title: `${article.title} | 김규태`, description: article.description,
    image: article.image, imageAlt: article.imageAlt, kind: 'WebPage', article,
  })),
  {
    path: '/contact',
    title: 'AI·CAD/CAM 개발자 채용·제조 기술 협업 | 김규태',
    description: 'AI·CAD/CAM 개발자 채용, 3D 형상 인식과 설계·제조 자동화 협업을 위한 김규태(Sean Kim)의 연락처입니다. Python AI 연구, Fusion CAM 연동, SketchUp·가구 제조 데이터 개발 경험과 프로젝트를 확인하세요.',
    image: 'assets/og/home.jpg',
    imageAlt: '김규태 Sean Kim의 연구개발 협업 연락처.',
    kind: 'ContactPage',
  },
];

// Only aliases we actually publish are redirected. Unknown paths remain 404/noindex.
export const SEARCH_ALIASES = SEARCH_PAGES.flatMap(({ path }) => path === '/'
  ? [{ from: '/index.html', to: '/' }]
  : [{ from: `${path}.html`, to: path }, { from: `${path}/index.html`, to: path }]);

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
      jobTitle: 'AI·CAD/CAM 소프트웨어 개발자',
      description: '3D 형상 AI, CAD/CAM 자동화와 가구 제조 소프트웨어를 연구개발하는 김규태(Sean Kim)입니다.',
      url: `${SITE_URL}/`, image: `${SITE_URL}/assets/sean-kim.webp`,
      email: 'mailto:GyuTae.K1020@gmail.com', sameAs: ['https://github.com/GyuTae-Kim'],
      knowsAbout: ['AI 개발', 'Python', '3D 형상 AI', '가공 특징 인식', 'CAD/CAM', 'CAD 자동화', '제조 소프트웨어', 'Autodesk Fusion API', 'SketchUp', '가구 제조 데이터', '강화학습', '컴퓨터 비전'],
    },
    { '@type': 'WebSite', '@id': websiteId, url: `${SITE_URL}/`, name: SITE_NAME, alternateName: ['김규태 개발자 포트폴리오', 'Sean Kim Portfolio'],
      description: 'AI·CAD/CAM 개발자 김규태의 연구개발·제조 소프트웨어 프로젝트와 연구 기록',
      inLanguage: 'ko', publisher: { '@id': personId } },
    {
      '@type': page.kind, '@id': `${url}#webpage`, url, name: page.title,
      description: page.description, inLanguage: 'ko', isPartOf: { '@id': websiteId },
      dateModified: contentModified(page.path),
      about: { '@id': personId },
      ...(page.path === '/' ? { mainEntity: { '@id': personId } } : {}),
      ...(page.path !== '/' ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
      ...(page.project ? { mainEntity: { '@id': `${url}#project` } } : {}),
      ...(page.research ? { mainEntity: { '@id': `${url}#research` } } : {}),
      ...(page.article ? { mainEntity: { '@id': `${url}#article` } } : {}),
    },
  ];
  if (page.path !== '/') {
    const crumbs = [{ name: '홈', item: `${SITE_URL}/` }];
    if (page.project) crumbs.push({ name: '프로젝트', item: `${SITE_URL}/portfolio` });
    if (page.research) crumbs.push({ name: '연구', item: `${SITE_URL}/research` });
    if (page.article) crumbs.push(page.article.category === 'OpenCAD 사용 안내'
      ? { name: 'OpenCAD', item: `${SITE_URL}/opencad` } : { name: '개발 노트', item: `${SITE_URL}/notes` });
    crumbs.push({ name: page.project?.title ?? page.research?.title ?? page.article?.title ?? page.title.split(' — ')[0], item: url });
    graph.push({
      '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`,
      itemListElement: crumbs.map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, ...crumb })),
    });
  }
  if (page.project) graph.push({
    '@type': 'CreativeWork', '@id': `${url}#project`, url, name: page.project.title,
    description: page.description, keywords: page.project.tags,
    author: { '@id': personId }, image: `${SITE_URL}/${page.image}`, inLanguage: 'ko',
  });
  if (page.research) graph.push({
    '@type': 'CreativeWork', '@id': `${url}#research`, url, name: page.research.title,
    description: page.description, keywords: page.research.tags,
    author: { '@id': personId }, image: `${SITE_URL}/${page.image}`, inLanguage: 'ko',
  });
  if (page.article) graph.push({
    '@type': 'TechArticle', '@id': `${url}#article`, headline: page.article.title,
    description: page.description, url, inLanguage: 'ko', image: `${SITE_URL}/${page.image}`,
    author: { '@id': personId }, mainEntityOfPage: { '@id': `${url}#webpage` },
    articleSection: page.article.category,
    dateModified: contentModified(page.path),
  });
  if (page.path === '/notes') graph.push({
    '@type': 'ItemList', '@id': `${url}#notes`, name: '제조 소프트웨어 개발 노트',
    itemListElement: SITE_ARTICLES.filter((article) => article.category === '제조 소프트웨어 개발 노트')
      .map((article, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE_URL + article.path, name: article.title })),
  });
  if (page.path === '/portfolio') graph.push({
    '@type': 'ItemList', '@id': `${url}#projects`, name: '개발 프로젝트',
    itemListElement: SEARCH_PAGES.filter((item) => item.project).map((item, i) => ({
      '@type': 'ListItem', position: i + 1, url: SITE_URL + item.path, name: item.project!.title,
    })),
  });
  if (page.path === '/research') graph.push({
    '@type': 'ItemList', '@id': `${url}#research`, name: '학부연구생 때의 연구',
    itemListElement: RESEARCH_WORKS.map((work, i) => ({
      '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/research/${work.id}`, name: work.title,
    })),
  });
  if (page.path === '/opencad') graph.push({
    '@type': 'ItemList', '@id': `${url}#tools`, name: '공개된 무료 캐드 뷰어',
    itemListElement: OPENCAD_TOOLS.filter((tool) => tool.url).map((tool, i) => ({
      '@type': 'ListItem', position: i + 1, name: tool.name, url: tool.url,
    })),
  });
  return { '@context': 'https://schema.org', '@graph': graph };
}
