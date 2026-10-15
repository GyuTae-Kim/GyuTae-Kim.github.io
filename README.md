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
- `tools/route-pages.mjs`: 빌드 뒤 주소마다 HTML을 만들어 하위 주소가 200으로 열리고, 주소별 제목, 설명, 미리보기 이미지, `<noscript>` 요약을 갖게 합니다. `sitemap.xml`도 만듭니다.

## 실행

```sh
npm ci
npm run preview   # http://127.0.0.1:4317
npm test -- --watch=false --browsers=ChromeHeadless
npm run build     # docs/ 에 빌드
```

## 배포

`npm run deploy`는 `docs/`에 빌드한 뒤 `gh-pages` 브랜치로 올립니다. 배포한 `docs/`는 `master`에도 커밋해 두 브랜치의 내용을 같게 유지합니다.

전역 gitignore에 `*.png`가 있는 환경에서는 `gh-pages`가 PNG를 빼고 올립니다. 배포 캐시 저장소에서만 전역 무시를 끄고 배포하세요.

```sh
git -C "node_modules/.cache/gh-pages/https!github.com!GyuTae-Kim!GyuTae-Kim.github.io.git" config core.excludesFile /dev/null
```
