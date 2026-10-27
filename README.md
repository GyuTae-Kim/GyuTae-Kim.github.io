# 김규태 · Sean Kim — 포트폴리오

AI, 3D 형상, CAD/CAM 연구개발 포트폴리오 사이트의 소스입니다. https://gyutae-kim.github.io

- `/`: 소개, 3D 개념 모델 뷰어, 주요 프로젝트, 학부연구생 때의 연구, 특허와 프로그램
- `/portfolio`, `/portfolio/:id`: 프로젝트 세 개(가공 특징 인식과 CAM 자동화, 가구 패널 인식, Wedraw Pro)와 프로젝트 기록
- `/research`, `/research/:id`: 학부연구생 때 공개한 연구 세 개의 카드 목록과 개별 실험 결과
- `/opencad`: 개인 프로젝트 OpenCAD의 도구 목록. 공개한 DWG·DXF 2D 캐드(보기·그리기·편집·저장, 별도 저장소 [opencad-dwgdxf](https://github.com/GyuTae-Kim/opencad-dwgdxf))와 STEP, SKP, NC 뷰어([opencad-step](https://github.com/GyuTae-Kim/opencad-step), [opencad-skp](https://github.com/GyuTae-Kim/opencad-skp), [opencad-nc](https://github.com/GyuTae-Kim/opencad-nc))로 가는 입구
- `/contact`: 이메일과 GitHub

## 기술

Angular 15, TypeScript, SCSS, three.js(홈 3D 뷰어, 화면에 가까워질 때 불러옴). 서버 없이 GitHub Pages로 배포합니다.

## 구조

- `src/app/portfolio-data.ts`, `other-projects-data.ts`, `research-data.ts`, `achievement-data.ts`, `opencad-data.ts`: 페이지에 나오는 내용. 새 OpenCAD 뷰어를 공개하면 `opencad-data.ts`에서 그 항목에 `url`과 화면 캡처(`src/assets/opencad/`)를 넣습니다.
- `src/app/components/model-viewport/`: 홈 3D 뷰어. 가공 부품(모델링 → 특징 인식 → 바이스 가공)과 원룸 벽면 가구(설계 → 제조 → 설치)를 직접 만든 기하로 그립니다. WebGL이 없거나 움직임 줄이기 설정이면 `src/assets/viewer/`의 정지 이미지를 보여 줍니다.
- `src/assets/cases/`, `src/assets/research/`: 프로젝트와 연구 그림. 목록용 썸네일은 `thumb-336.webp`, `thumb-672.webp`입니다.
- `src/assets/og/`: 링크 미리보기 이미지(1200×630)
- `tools/route-pages.mjs`: 빌드 뒤 주소마다 HTML을 만들어 하위 주소가 200으로 열리고, 주소별 제목, 설명, 미리보기 이미지, 실제 화면의 전체 본문을 갖게 합니다. 사이트맵 인덱스 `sitemap.xml`과 포트폴리오 페이지 목록 `sitemap-pages.xml`도 만듭니다.

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

전역 gitignore에 `*.png`가 있으면 `gh-pages`가 PNG를 빼고 올릴 수 있습니다. `deploy`는 게시 명령의 하위 Git 프로세스에만 `core.excludesFile=/dev/null`을 전달해 이 누락을 방지합니다. 사용자 전역 설정이나 캐시 저장소 설정을 변경할 필요가 없습니다. CI에서 검증한 산출물을 다시 빌드하지 않고 게시할 때도 같은 설정을 사용하세요.

```sh
GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.excludesFile GIT_CONFIG_VALUE_0=/dev/null npx --no-install gh-pages -d docs --dotfiles
```

게시 후 `git fetch origin gh-pages`와 `git diff --exit-code HEAD:docs origin/gh-pages`로 파일 내용·경로·모드의 일치를 확인하고, Pages 빌드 완료와 실제 공개 파일 응답을 별도로 검증합니다.

## 검색 노출 관리 (구글 · 네이버)

`npm run build`는 Angular의 실제 템플릿을 서버 렌더링해 공개 페이지의 전체 본문을 정적 HTML로 만듭니다. JavaScript를 실행하지 않아도 본문과 내부 링크를 읽을 수 있습니다. `dist/server/`는 빌드에만 쓰며, GitHub Pages에는 `docs/`만 배포합니다. 3D 뷰어는 정지 이미지로 먼저 표시하고 브라우저에서 작동합니다.

`angular.json`의 production 빌드는 핵심 CSS 인라인(`optimization.styles.inlineCritical`)을 끄고 전체 스타일시트를 렌더 차단 `<link>`로 불러옵니다. Angular는 핵심 CSS를 본문이 빈 `docs/index.html` 기준으로 계산하므로, 켜 두면 `html`·`body` 규칙만 인라인되고 서버 렌더링한 본문이 스타일 없이 먼저 보입니다.

- `src/app/site-seo.ts`: 제목·설명·대표 주소·공유 이미지와 Person, WebSite, 페이지, 프로젝트, 탐색 경로 구조화 데이터의 공통 원본입니다. 새 프로젝트는 기존 프로젝트 데이터에서 자동으로 가져옵니다.
- `src/app/seo.service.ts`: 초기 HTML과 브라우저 이동에 공통으로 쓰는 메타데이터 생성 코드입니다. 제목·설명·작성자·canonical·Open Graph·Twitter·구조화 데이터를 생성합니다. 필드 구성은 같고 페이지별 값과 구조화 데이터 종류만 달라집니다. `src/index.html`에 이 정보를 중복 작성하지 않습니다. 없는 페이지에는 `noindex`를 적용합니다.
- `tools/route-pages.mjs`: 주소별 HTML, 이전 주소의 이동 페이지, 사이트맵 인덱스 `sitemap.xml`, 포트폴리오 목록 `sitemap-pages.xml`, `.nojekyll`을 만듭니다. 포트폴리오 목록의 `lastmod`와 구조화 데이터의 `dateModified`는 같은 콘텐츠 변경 기록을 사용합니다.
- `tools/moved-apps.json`: 저장소 이름을 바꾼 앱의 예전 Pages 경로를 새 주소로 넘깁니다. 2D 캐드는 2026-10-16에 `2dcad-viewer`에서 `opencad-dwgdxf`로 이름을 바꿨고, GitHub는 저장소 주소와 달리 Pages 경로를 넘겨 주지 않으므로 이 사이트가 `/2dcad-viewer/`를 맡습니다. 빌드가 만드는 이동 페이지는 canonical과 JavaScript 없이도 읽을 수 있는 0초 meta refresh로 영구 이전을 알립니다. `noindex`는 사용하지 않으며, JavaScript를 사용하는 브라우저에서는 쿼리와 해시(`?sample`, `?open=…`)를 두 이동 방식의 목적지에 똑같이 붙입니다. 그 아래 경로는 `src/404.html`이 넘깁니다.
- `tools/search-verification.json`: Search Console과 서치어드바이저가 제공한 HTML 태그의 `content` 값을 넣습니다. 빈 값은 태그를 생성하지 않습니다. 생성된 `docs/index.html`을 직접 수정하면 다음 빌드 때 사라집니다.
- `npm run check:seo`: 빌드 후 전체 본문·메타데이터·구조화 데이터·내부 링크·이미지·사이트맵 인덱스·포트폴리오 목록·robots.txt·구주소 이동·404를 검사합니다. `npm run check:i18n`은 본문과 검색·공유 메타데이터의 번역 누락도 검사합니다.

### 콘텐츠 수정일 관리

`src/app/content-history.json`은 페이지별 실제 수정 시각과 콘텐츠 지문을 저장합니다. 초기 날짜는 Git의 본문·메타데이터·이미지 변경 이력에서 복원했습니다. 이후 본문·검색 정보·사용 이미지가 바뀌면 실제 수정 시각을 UTC로 지정해 갱신합니다. 아래 시각은 예시이므로 실제 작업 시각으로 바꾸세요.

```sh
npm run update:content-dates -- --at 2026-10-16T00:00:00Z
npm run test:content-dates
npm run build
npm run check:seo
```

변경된 페이지만 새 날짜를 기록합니다. 단순 재빌드·CSS·번들 파일명·푸터 배포 표시가 바뀌어도 기존 날짜를 유지합니다. 미래 날짜와 변경 전보다 이른 날짜는 거부합니다. 콘텐츠를 바꾸고 기록을 갱신하지 않으면 빌드가 실패하므로, 기록 파일과 생성된 `docs/`를 함께 커밋하세요. 글의 작성일을 추정해 `datePublished`를 만들지는 않습니다.

PR과 `master`의 SEO 검증 CI에서도 수정일 테스트·빌드·산출물 검사를 실행합니다.

`/sitemap.xml`은 `/sitemap-pages.xml`과 공개된 네 앱의 `/opencad-*/sitemap.xml`을 참조하는 사이트맵 인덱스입니다. 포트폴리오 저장소는 자기 페이지의 날짜만 관리하고, 앱별 URL·언어·수정일은 각 앱 저장소의 사이트맵이 관리합니다. 앱을 갱신할 때 포트폴리오로 날짜를 복사하거나 다시 배포할 필요가 없습니다. 새 앱은 실제 사이트맵을 공개한 뒤 `opencad-data.ts`의 공개 URL과 `robots.txt`에 추가합니다. 빌드는 외부 사이트맵을 내려받지 않으므로 네트워크 없이 재현할 수 있습니다. 배포 후에는 인덱스가 참조하는 모든 사이트맵의 HTTP 상태·XML·대표 URL을 별도로 확인하세요.

### 배포 후 등록

1. [Google Search Console](https://search.google.com/search-console)에 **URL 접두어** 속성 `https://gyutae-kim.github.io/`를 추가합니다. GitHub 소유인 `github.io`의 DNS를 요구하는 도메인 속성 대신 URL 접두어를 사용합니다.
2. [네이버 서치어드바이저](https://searchadvisor.naver.com/console/board)에 `https://gyutae-kim.github.io`를 등록합니다.
3. 두 서비스에서 HTML 태그 소유 확인을 선택합니다. 제공된 `content` 값을 `tools/search-verification.json`에 저장하고 빌드·검사·배포한 뒤 소유 확인을 완료합니다.
4. 두 서비스에 `https://gyutae-kim.github.io/sitemap.xml`을 제출합니다. 구글 URL 검사와 네이버 웹 페이지 수집 요청에서 홈·프로젝트 목록·대표 프로젝트·연구 페이지를 요청합니다.
5. 각 서비스의 수집·색인·노출·클릭 보고서로 결과를 확인합니다. 설정과 제출만으로 색인이나 검색 순위가 보장되지는 않습니다.

검색로봇 접근은 `https://gyutae-kim.github.io/robots.txt`에서 허용합니다. 공개 본문은 일반 방문자와 검색로봇에 동일하게 제공하며, 특정 봇에만 다른 내용을 보여 주지 않습니다.

공식 가이드: [구글 JavaScript 검색 최적화](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [네이버 검색엔진 최적화](https://searchadvisor.naver.com/guide/seo-basic-intro), [사이트맵 제출](https://searchadvisor.naver.com/guide/request-feed).

### 카카오톡 · 슬랙 링크 미리보기

홈·프로젝트·연구·연락 페이지의 초기 HTML `<head>`에 Open Graph와 Twitter Card 메타정보를 넣습니다. `og:image`는 로그인 없이 접근 가능한 절대 HTTPS 주소이며, JPEG 형식·1200×630 크기·이미지 설명을 함께 제공합니다. 홈·연락은 홈 표지, 프로젝트 목록과 프로젝트 기록은 프로젝트 표지, 주요 프로젝트 3개·연구·오픈캐드는 해당 표지를 사용합니다. 별도의 카카오 또는 슬랙 앱 등록 없이 일반 링크 미리보기에 필요한 정보를 제공합니다.

`npm run check:seo`는 전체 공개 페이지와 HTML 별칭에서 공유 태그의 유일성·올바른 이미지 주소를 확인합니다. 슬랙의 부분 요청을 고려해 공유 메타정보가 HTML의 첫 8 KiB 안에 있는지도 검사합니다. 실제 JPEG 파일의 크기(1200×630)와 자체 용량 예산(512 KiB 이하)도 검증합니다.

배포 후에는 다음을 확인합니다.

- 각 페이지와 이미지 URL이 로그인 없이 HTTP 200으로 열리고, 이미지는 `image/jpeg`로 내려오는지 확인합니다.
- 카카오톡은 [URL 메타정보 관리 도구](https://developers.kakao.com/tool/debugger/sharing)로 조회하고, 이전 정보가 남아 있으면 해당 도구에서 캐시를 초기화합니다. 도구 적용 범위는 카카오 공식 문서를 확인합니다.
- 슬랙은 [공식 로봇 안내](https://api.slack.com/robots)에 따르면 링크 메타정보를 약 30분 캐시합니다. 변경 직후에는 캐시 갱신 이후의 새 공유로 확인합니다.
- 실제 카카오톡·슬랙에서 카드가 표시되는지 확인하는 작업은 로컬 HTML 검사와 구분합니다. 대화방에 테스트 메시지를 보내려면 대상 대화방과 발송 승인을 먼저 확인합니다.

검색 문구는 실제 화면과 프로젝트 근거에 맞춥니다. 개인 사이트는 AI·CAD/CAM 개발자 채용과 제조 소프트웨어 협업을 중심으로 담당 역할·검증 범위를 설명하고, OpenCAD 목록은 무료 DWG·DXF 2D 캐드와 STEP, SKP, NC 뷰어의 실제 지원 기능과 공개 주소를 안내하고, 아직 읽지 못하는 버전(예: SketchUp 3~5)은 지원한다고 쓰지 않습니다. 검색어 반복이나 확인되지 않은 경력·수치·호환성·인증을 넣지 않습니다. 페이지별 제목·설명은 `src/app/site-seo.ts`에서 관리하며 Open Graph·Twitter 및 구조화 데이터에도 같은 설명을 적용합니다.


### 사용 안내와 개발 노트

OpenCAD 프로젝트 목록은 `src/app/opencad-data.ts`에서 관리합니다. DWG·DXF 2D 캐드, NC·STEP·SKP 앱과 공통 3D 코어는 `/opencad/projects/…`의 소개 페이지를 가지며, 홈·OpenCAD 목록·관련 프로젝트에서 연결합니다. `SEARCH_PAGES`의 공통 메타데이터·정적 HTML 생성 경로를 사용하므로 제목·설명·OG·canonical·구조화 데이터의 형태를 유지합니다. 새 앱을 `OPENCAD_TOOLS`에 공개 주소와 함께 등록하면 같은 호스트의 통합 사이트맵에도 포함됩니다. 독립 실행 사이트가 없는 라이브러리는 소개 페이지만 포함하며 존재하지 않는 앱 주소를 만들지 않습니다.

별도 앱이 신뢰할 수 있는 콘텐츠 수정일을 제공하지 않으면 해당 앱 URL의 선택 항목인 `lastmod`는 생략합니다. 소개 페이지에는 기존 콘텐츠 변경 기록을 적용하고, 이미 관리 중인 2D 캐드 날짜도 그대로 유지합니다. HTTP `Last-Modified`나 배포 시각을 콘텐츠 수정일로 대체하지 않습니다.

`src/app/articles-data.ts`에서 OpenCAD 사용 안내 2편과 제조 소프트웨어 개발 노트 2편을 관리합니다. 글마다 고유 URL·제목·설명·공유 이미지·TechArticle·목차를 제공하고 정적 HTML과 사이트맵에 포함합니다. 지원 기능은 뷰어의 공개 구현과 대조하고, 개발 노트의 역할·수치·검증 범위는 연결된 포트폴리오 사례에 근거해야 합니다. 배포 날짜로 가짜 수정일을 만들지 않습니다.

빌드가 만드는 `.html`·`/index.html` 별칭은 `SEARCH_ALIASES`로 정상 주소에 연결합니다. 배포 전 실제 브라우저에서 별칭을 열어 주소·화면·canonical·robots가 정상 주소와 일치하는지 확인하세요. 존재하지 않는 주소는 계속 404/검색 제외로 처리합니다.


### 다국어 페이지

한국어의 기존 주소를 유지하며 영어(`/en/`), 일본어(`/ja/`), 중국어 간체(`/zh-CN/`), 독일어(`/de/`)를 지원합니다. 각 언어의 본문을 정적 HTML로 생성하고 self canonical, 상호 `hreflang`, `x-default`, 사이트맵과 구조화 데이터의 언어를 함께 제공합니다. 우측 상단 지구본 메뉴와 항상 표시되는 하단 언어 링크에서 같은 페이지의 다른 언어를 선택합니다. 언어 전환은 현재 페이지·쿼리·구역 위치를 유지합니다. 모바일 탐색 메뉴는 별도 아이콘에서 열며 상단바는 한 줄을 유지합니다.

검색·공유 메타데이터의 작성자와 사이트 이름도 현재 언어로 제공합니다. 구조화 데이터는 사이트 전체의 다섯 언어와 개별 페이지의 언어를 구분하며, OpenCAD 도구 목록은 별도 앱 저장소의 같은 언어 주소(`/opencad-skp/en/` 등)를 가리킵니다. HTML과 사이트맵의 `hreflang`은 함께 검사하므로 사이트맵 처리 대기 중에도 HTML에서 언어 관계를 확인할 수 있습니다.

Google은 검색어·본문·설정 등 여러 신호로 결과 언어를 선택하므로 방문자의 국적이나 브라우저 언어로 강제 이동하지 않습니다. 배포 성공과 해외 검색 노출은 구분합니다. Search Console에서 언어별 핵심 URL의 색인·Google 선택 canonical을 확인하고, 실적의 페이지 필터(`/en/`, `/ja/`, `/zh-CN/`, `/de/` 및 `/opencad-*/언어/`)와 국가·검색어를 함께 비교하세요. 국가는 언어와 같지 않으며, 색인 생성 요청 접수는 실제 색인·순위 상승을 뜻하지 않습니다.

번역은 `src/app/i18n/*.json`에 한국어 원문을 키로 저장합니다. 템플릿의 `t` 파이프는 고정 문구와 데이터 문구를 번역하며, `{0}`처럼 번호가 있는 자리는 원문의 개수와 번호를 보존해야 합니다. 언어 선택은 URL로 명시하고, 방문 중 외부 번역 서비스에 내용을 보내지 않습니다. 새 문구와 번역을 수정한 뒤 실제 수정 시각으로 콘텐츠 지문을 갱신하고 빌드하세요. `npm run check:i18n`은 번역 사전·변수·정적 본문의 번역 누락을, `npm run check:seo`는 모든 언어의 링크와 검색 메타데이터를 검사합니다.

번역은 자동 초안을 바탕으로 주요 제목·제품명·메뉴를 교정했습니다. 긴 기술 설명은 원어민 감수 대상이며, 원본 제품 화면·도면 이미지에 포함된 글자는 원본 자료를 보존합니다.

포트폴리오 홈·개발 사례·연구·연락처는 이름과 전문 분야가 검색 문구와 주요 제목에 드러나도록 관리합니다. 연구 상세의 검색 설명은 `site-seo.ts`의 `RESEARCH_SEARCH_COPY`에서 결과·한계를 요약하고, 본문의 여러 문단을 붙여 만들지 않습니다. 해외 언어의 검색 문구도 각 번역 사전에서 함께 수정하세요. 개인의 담당 범위와 팀·재사용 모델의 역할은 기존 증거를 유지합니다.

구조화 데이터의 인물 이름은 한국어에서는 김규태, 다른 언어에서는 Sean Kim을 사용하고 공개 별칭과 GitHub 식별자는 원문을 유지합니다. 프로젝트·연구의 작성자 링크는 같은 언어의 프로필 홈으로 연결합니다. `check:seo`와 단위 테스트는 이 인물·프로필 연결을 검사합니다.


### 검색 목적과 실제 예제

앱 실행 주소는 바로 파일을 여는 검색 목적을, `/opencad/projects/…`는 기능·지원 범위를, `/opencad/guides/…`는 사용 순서·문제 해결을 담당합니다. 서로 다른 본문은 각각의 canonical을 유지합니다. 소개 첫 화면에서 해당 사용 안내로 연결하며, 기존 파일 열기·측정 안내 다섯 개에는 지원 형식·합성 예제의 확인 값·문제 해결 표와 직접 예제 실행 링크가 있습니다.

`opencad-guide-details.ts`의 STEP 값은 공개 예제 생성기의 20×10×2 mm 받침판과 Ø4 mm 구멍, 실제 PMI 화면을 대조했습니다. 저장된 PMI는 형상 측정값과 구분합니다. SKP 예제 집은 폭 6000 mm·깊이 4000 mm이며, 장면에 따라 지붕 태그가 꺼질 수 있습니다. 추가 화면은 직접 조작해 캡처한 합성 예제로 고객 파일을 포함하지 않습니다. 하단 증거 이미지는 720w·1440w WebP와 고정 크기, 지연 로딩을 사용합니다.

브라우저 production 빌드만 `catalogs.browser.ts`로 교체해 언어 사전을 분리합니다. 한국어에서는 사전을 요청하지 않고 다른 언어에서는 해당 사전만 요청합니다. 최초 Angular 실행과 언어 전환 guard가 로딩을 기다리며, SSR은 전체 사전으로 모든 언어의 HTML을 생성합니다. 언어 전환의 쿼리·fragment·metadata와 초기 페이지 표시를 함께 검증하세요.

### SEO 성과와 실제 사용자 성능 측정

개인 GA4 속성 `559257929`를 사용합니다. 기존 `viewer_open`은 `target_tool`과 `launch_mode`(`empty`, `sample`, `url`)를 기록하고, `guide_open`은 허용한 `guide_key`만 기록합니다. 예제·실제 파일 성공은 기존 `sample_open_success`·`file_open_success`를 구분합니다. `page_language`는 URL의 허용된 언어 코드입니다. 파일명·파일 URL·모델 내용·임의 경로·오류 원문은 보내지 않습니다.

분석 동의를 허용한 경우에만 공식 `web-vitals` 라이브러리를 지연 로딩하고 `web_vital` 이벤트를 전송합니다. 매개변수는 `metric_name`(LCP/INP/CLS), `metric_value`, `metric_delta`, `metric_id`, `metric_rating`입니다. 기본 문서 단위 지표는 최초 공개 페이지에 귀속하고 SPA 이동 뒤의 다른 페이지로 잘못 귀속하지 않습니다. 제한·거부 상태에서는 성능·클릭 이벤트를 보내지 않습니다. 필드 데이터가 쌓이기 전에는 실측 p75 목표 달성이나 검색 성과 상승을 주장하지 않습니다.

Search Console은 브랜드/비브랜드 검색어를 나누고 페이지·언어·국가·기기별 노출과 클릭을 같은 기간으로 비교합니다. GA4는 자연검색 세션 중 뷰어 실행 세션 비율과 앱 세션 중 파일 열기 성공 세션 비율을 별도로 집계합니다. 단순 이벤트 수의 나눗셈은 반복 실행 때문에 전환율이 되지 않습니다. 예제와 실제 파일을 구분하고 분석에 동의한 방문자 범위임을 표시하세요. Web Vitals의 평균을 p75로 해석하지 말고 지표별·모바일/데스크톱별 원시 값의 75백분위를 사용합니다.

### 검색 의도와 진입 경로

| 필요한 작업 | 진입 경로 | 제공하는 내용 |
| --- | --- | --- |
| DWG·DXF 캐드 뷰어 | `/opencad`, `/opencad/guides/open-dwg-dxf` | 형식 선택, 실행, 지원 범위, 측정·편집·저장 안내 |
| STEP·STP 3D 뷰어 | `/opencad/guides/open-step-stp` | 예제, 조립·PMI·단면, 빈 화면 점검 |
| 스케치업 SKP 뷰어 | `/opencad/guides/open-skp` | 저장 버전, 태그·장면, 누락 객체 확인 |
| CAD 형식 차이·Windows/Mac 파일 열기 | `/opencad/guides/choose-cad-format` | 형식 비교표, 변환과 보기의 차이, 설계·공장 전달 체크리스트 |

`cad-format-data.ts`의 형식 비교 안내는 도면·모델·공구 경로를 선택하고 전달하는 검색 의도를 담당합니다. 기존 다섯 사용 안내와 공개 뷰어 소개 페이지의 사용 안내 목록에서 연결합니다. 비교표는 정적 HTML의 열·행 머리글로 제공하고, 뷰어를 범용 파일 변환기로 소개하지 않습니다.

### 사이트맵 가져오기 진단

`tools/sitemaps.mjs`는 기존 XML 인덱스와 언어·수정일 정보를 유지하면서, 모든 공개 페이지와 OpenCAD 앱의 언어별 주소를 직접 나열한 `/sitemap.txt`도 생성합니다. 텍스트 형식에는 URL만 한 줄에 하나씩 쓰며 다른 저장소의 수정일을 복제하지 않습니다. `robots.txt`는 두 형식을 알리고, `check:seo`는 같은 공개 경로가 빠짐없이 포함되는지 확인합니다. 본문이 바뀌지 않는 사이트맵 작업은 `node tools/sitemaps.mjs docs`로 별도 생성할 수 있습니다.

Search Console의 `가져올 수 없음`과 유형 `알 수 없음`만으로 XML 오류나 저장소 충돌을 단정하지 않습니다. 상세 오류, 실제 사이트맵 URL의 실시간 검사에서 크롤링 허용·가져오기 성공, robots.txt·직접 조치·호스트 상태를 확인하세요. 공개 HTTP 200, 재제출 접수, Search Console의 `성공` 상태는 각각 별도 증거입니다. XML이 접근 가능해도 처리되지 않는 경우 텍스트 형식을 직접 제출해 가져오기와 XML/하위 사이트맵 처리 의존성을 구분할 수 있지만, Google 처리·색인·순위 상승을 보장하지는 않습니다.
