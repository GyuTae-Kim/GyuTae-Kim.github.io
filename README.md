# 김규태 · Sean Kim — 포트폴리오

AI, 3D 형상, CAD/CAM 연구개발 포트폴리오 사이트의 소스입니다. https://gyutae-kim.github.io

- `/`: 소개, 3D 개념 모델 뷰어, 주요 프로젝트, 학부연구생 때의 연구, 특허와 프로그램
- `/portfolio`, `/portfolio/:id`: 프로젝트 세 개(가공 특징 인식과 CAM 자동화, 가구 패널 인식, Wedraw Pro)와 기타 프로젝트
- `/research`: 학부연구생 때 공개한 연구 세 개와 실험 결과
- `/opencad`: 개인 프로젝트 OpenCAD의 뷰어 목록. 공개한 2D 도면 뷰어(별도 저장소 [2dcad-viewer](https://github.com/GyuTae-Kim/2dcad-viewer))로 가는 입구와 준비 중인 STEP, SKP, NC 뷰어
- `/contact`: 이메일과 GitHub

## 기술

Angular 15, TypeScript, SCSS, three.js(홈 3D 뷰어, 화면에 가까워질 때 불러옴). 서버 없이 GitHub Pages로 배포합니다.

## 구조

- `src/app/portfolio-data.ts`, `other-projects-data.ts`, `research-data.ts`, `achievement-data.ts`, `opencad-data.ts`: 페이지에 나오는 내용. 새 OpenCAD 뷰어를 공개하면 `opencad-data.ts`에서 그 항목에 `url`과 화면 캡처(`src/assets/opencad/`)를 넣습니다.
- `src/app/components/model-viewport/`: 홈 3D 뷰어. 가공 부품(모델링 → 특징 인식 → 바이스 가공)과 원룸 벽면 가구(설계 → 제조 → 설치)를 직접 만든 기하로 그립니다. WebGL이 없거나 움직임 줄이기 설정이면 `src/assets/viewer/`의 정지 이미지를 보여 줍니다.
- `src/assets/cases/`, `src/assets/research/`: 프로젝트와 연구 그림. 목록용 썸네일은 `thumb-336.webp`, `thumb-672.webp`입니다.
- `src/assets/og/`: 링크 미리보기 이미지(1200×630)
- `tools/route-pages.mjs`: 빌드 뒤 주소마다 HTML을 만들어 하위 주소가 200으로 열리고, 주소별 제목, 설명, 미리보기 이미지, 실제 화면의 전체 본문을 갖게 합니다. `sitemap.xml`도 만듭니다.

## 실행

```sh
npm ci
npm run preview   # http://127.0.0.1:4317
npm test -- --watch=false --browsers=ChromeHeadless
npm run build     # docs/ 에 전체 본문을 포함한 정적 HTML 빌드
npm run check:seo # 배포 산출물 검색 최적화 검사
```

## 배포

`npm run deploy`는 `docs/`에 빌드한 뒤 `gh-pages` 브랜치로 올립니다. 배포한 `docs/`는 `master`에도 커밋해 두 브랜치의 내용을 같게 유지합니다.

전역 gitignore에 `*.png`가 있는 환경에서는 `gh-pages`가 PNG를 빼고 올립니다. 배포 캐시 저장소에서만 전역 무시를 끄고 배포하세요.

```sh
git -C "node_modules/.cache/gh-pages/https!github.com!GyuTae-Kim!GyuTae-Kim.github.io.git" config core.excludesFile /dev/null
```

## 검색 노출 관리 (구글 · 네이버)

`npm run build`는 Angular의 실제 템플릿을 서버 렌더링해 공개 페이지 10개의 전체 본문을 정적 HTML로 만듭니다. JavaScript를 실행하지 않아도 본문과 내부 링크를 읽을 수 있습니다. `dist/server/`는 빌드에만 쓰며, GitHub Pages에는 `docs/`만 배포합니다. 3D 뷰어는 정지 이미지로 먼저 표시하고 브라우저에서 작동합니다.

- `src/app/site-seo.ts`: 제목·설명·대표 주소·공유 이미지와 Person, WebSite, 페이지, 프로젝트, 탐색 경로 구조화 데이터의 공통 원본입니다. 새 프로젝트는 기존 프로젝트 데이터에서 자동으로 가져옵니다.
- `src/app/seo.service.ts`: 직접 방문과 사이트 안에서 이동할 때 같은 검색 정보를 유지합니다. 없는 페이지에는 `noindex`를 적용합니다.
- `tools/route-pages.mjs`: 주소별 HTML, 이전 주소의 이동 페이지, `sitemap.xml`, `.nojekyll`을 만듭니다. 사이트맵에는 실제 콘텐츠 변경일을 추적하기 전까지 `lastmod`를 쓰지 않습니다.
- `tools/search-verification.json`: Search Console과 서치어드바이저가 제공한 HTML 태그의 `content` 값을 넣습니다. 빈 값은 태그를 생성하지 않습니다. 생성된 `docs/index.html`을 직접 수정하면 다음 빌드 때 사라집니다.
- `npm run check:seo`: 빌드 후 전체 본문·메타데이터·구조화 데이터·내부 링크·이미지·사이트맵·robots.txt·404를 검사합니다.

### 배포 후 등록

1. [Google Search Console](https://search.google.com/search-console)에 **URL 접두어** 속성 `https://gyutae-kim.github.io/`를 추가합니다. GitHub 소유인 `github.io`의 DNS를 요구하는 도메인 속성 대신 URL 접두어를 사용합니다.
2. [네이버 서치어드바이저](https://searchadvisor.naver.com/console/board)에 `https://gyutae-kim.github.io`를 등록합니다.
3. 두 서비스에서 HTML 태그 소유 확인을 선택합니다. 제공된 `content` 값을 `tools/search-verification.json`에 저장하고 빌드·검사·배포한 뒤 소유 확인을 완료합니다.
4. 두 서비스에 `https://gyutae-kim.github.io/sitemap.xml`을 제출합니다. 구글 URL 검사와 네이버 웹 페이지 수집 요청에서 홈·프로젝트 목록·대표 프로젝트·연구 페이지를 요청합니다.
5. 각 서비스의 수집·색인·노출·클릭 보고서로 결과를 확인합니다. 설정과 제출만으로 색인이나 검색 순위가 보장되지는 않습니다.

검색로봇 접근은 `https://gyutae-kim.github.io/robots.txt`에서 허용합니다. 공개 본문은 일반 방문자와 검색로봇에 동일하게 제공하며, 특정 봇에만 다른 내용을 보여 주지 않습니다.

공식 가이드: [구글 JavaScript 검색 최적화](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [네이버 검색엔진 최적화](https://searchadvisor.naver.com/guide/seo-basic-intro), [사이트맵 제출](https://searchadvisor.naver.com/guide/request-feed).

### 카카오톡 · 슬랙 링크 미리보기

홈·프로젝트·연구·연락 페이지의 초기 HTML `<head>`에 Open Graph와 Twitter Card 메타정보를 넣습니다. `og:image`는 로그인 없이 접근 가능한 절대 HTTPS 주소이며, JPEG 형식·1200×630 크기·이미지 설명을 함께 제공합니다. 홈·연락은 홈 표지, 프로젝트 목록과 기타 프로젝트는 프로젝트 표지, 주요 프로젝트 3개·연구·오픈캐드는 해당 표지를 사용합니다. 별도의 카카오 또는 슬랙 앱 등록 없이 일반 링크 미리보기에 필요한 정보를 제공합니다.

`npm run check:seo`는 전체 공개 페이지와 HTML 별칭에서 공유 태그의 유일성·올바른 이미지 주소를 확인합니다. 슬랙의 부분 요청을 고려해 공유 메타정보가 HTML의 첫 8 KiB 안에 있는지도 검사합니다. 실제 JPEG 파일의 크기(1200×630)와 자체 용량 예산(512 KiB 이하)도 검증합니다.

배포 후에는 다음을 확인합니다.

- 각 페이지와 이미지 URL이 로그인 없이 HTTP 200으로 열리고, 이미지는 `image/jpeg`로 내려오는지 확인합니다.
- 카카오톡은 [URL 메타정보 관리 도구](https://developers.kakao.com/tool/debugger/sharing)로 조회하고, 이전 정보가 남아 있으면 해당 도구에서 캐시를 초기화합니다. 도구 적용 범위는 카카오 공식 문서를 확인합니다.
- 슬랙은 [공식 로봇 안내](https://api.slack.com/robots)에 따르면 링크 메타정보를 약 30분 캐시합니다. 변경 직후에는 캐시 갱신 이후의 새 공유로 확인합니다.
- 실제 카카오톡·슬랙에서 카드가 표시되는지 확인하는 작업은 로컬 HTML 검사와 구분합니다. 대화방에 테스트 메시지를 보내려면 대상 대화방과 발송 승인을 먼저 확인합니다.

검색 문구는 실제 화면과 프로젝트 근거에 맞춥니다. 개인 사이트는 AI·CAD/CAM 개발자 채용과 제조 소프트웨어 협업을 중심으로 담당 역할·검증 범위를 설명하고, OpenCAD 목록은 무료 DWG·DXF 뷰어의 실제 지원 기능과 공개 주소를 안내합니다. 검색어 반복이나 확인되지 않은 경력·수치·호환성·인증을 넣지 않습니다. 페이지별 제목·설명은 `src/app/site-seo.ts`에서 관리하며 Open Graph·Twitter 및 구조화 데이터에도 같은 설명을 적용합니다.


### 사용 안내와 개발 노트

`src/app/articles-data.ts`에서 OpenCAD 사용 안내 2편과 제조 소프트웨어 개발 노트 2편을 관리합니다. 글마다 고유 URL·제목·설명·공유 이미지·TechArticle·목차를 제공하고 정적 HTML과 사이트맵에 포함합니다. 지원 기능은 뷰어의 공개 구현과 대조하고, 개발 노트의 역할·수치·검증 범위는 연결된 포트폴리오 사례에 근거해야 합니다. 배포 날짜로 가짜 수정일을 만들지 않습니다.

빌드가 만드는 `.html`·`/index.html` 별칭은 `SEARCH_ALIASES`로 정상 주소에 연결합니다. 배포 전 실제 브라우저에서 별칭을 열어 주소·화면·canonical·robots가 정상 주소와 일치하는지 확인하세요. 존재하지 않는 주소는 계속 404/검색 제외로 처리합니다.
