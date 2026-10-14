# Sean Kim — Research & Engineering Portfolio

기존 GitHub Pages Angular 저장소를 AI·3D·CAD/CAM 연구개발 포트폴리오로 수정한 검토용 소스입니다.

## 로컬 미리보기

```sh
npm ci
npm run preview
```

브라우저에서 http://127.0.0.1:4317 을 여세요. 현재 체크아웃의 `src/`를 직접 읽고 변경을 다시 빌드합니다.

## 구성

- `/`: 왼쪽에 이름·한 줄 소개·섹션 목차를 고정하고, 오른쪽에 3D 뷰포트, Wedraw Pro 제품 카드, 사례·연구·성과·소개 목록을 둔 인덱스. 디자인은 도면 시트(종이색 바탕, 잉크 선, 도면 파랑, 치수용 갈색, 표제란)를 따릅니다.
- `src/app/components/model-viewport/`: 홈 3D 뷰포트(three.js, 지연 로딩). 가공 부품(형상 분석 → 피처 인식 → 가공 전략)과 가구 하부장(형상 분석 → 패널 인식 → 파라미터 조정) 개념 모델을 직접 만든 기하로 그립니다. WebGL이 없거나 불러오는 동안에는 `src/assets/viewer/`의 정지 이미지를 보여 주고, 움직임 줄이기 설정에서는 시점 흔들림과 애니메이션을 멈춥니다.
- `/portfolio`: 프로젝트 목록, `/portfolio/:id`: 결과 한 줄과 대표 그림, 만든 것을 먼저 보이고 문제·접근·기여·검증은 「자세히」에 둔 사례. 피처 인식·CAM 자동화, 가구 패널 인식, Wedraw Pro의 세 사례를 4단계 흐름(직접·팀·협력 기관 표시)으로 보여 주고, 끝에 다음 사례로 넘어가는 링크를 둡니다.
- `/research`: 학부연구생 때의 공개 연구 3개를 2026년에 다시 돌린 결과 카드(결과 한 줄, 대표 그림, 숫자)와 「자세히」. 기존 `/blog` 주소도 이곳으로 연결합니다.
- `/contact`: 공개 이메일·GitHub, 이메일 복사.
- `src/app/achievement-data.ts`: 특허 출원·공동발명 및 프로그램 등록 신청 자료의 개인정보 없는 성과 요약.
- `src/app/portfolio-data.ts`: 최근 개발 사례 내용. `src/assets/cases/`: 사례별 대표 그림과 단계 그림(제품 화면은 데모·테스트 데이터, 개인 정보는 잘라냄).
- `src/app/research-data.ts`: 공개 연구 자료 내용과 출처.
- `src/assets/research/`: 본인 공개 저장소에서 가져온 원본 그림.
- `src/assets/research/rerun/`: 2026년에 세 공개 연구 코드를 다시 돌린 결과 그림(WebP). 사람이 나오는 그림은 얼굴을 모자이크했고, 의류 분류는 K-Fashion 대신 Fashion-MNIST로 돌린 결과입니다.
- `src/assets/og/`: 링크 미리보기 이미지(1200×630). `tools/route-pages.mjs`가 빌드 결과에 주소별 HTML(`portfolio.html`, `portfolio/<id>.html`, `research.html`, `contact.html`)을 만들어 GitHub Pages가 하위 주소에 200으로 응답하고, 주소마다 제목·설명·미리보기 이미지를 갖게 합니다. `npm run build`가 함께 실행합니다.

## 배포 없는 빌드 검증

```sh
npx ng build --configuration production --output-path dist/preview
```

GitHub Pages는 `gh-pages` 브랜치 루트를 사용합니다. `npm run deploy`는 `docs/`에 빌드한 뒤 그 내용을 `gh-pages`에 올리며 실제 Pages를 갱신하므로 사용자 승인 뒤에만 실행하세요. 배포한 `docs/`는 `master`에도 커밋해 `gh-pages`와 같게 유지합니다.

전역 git 무시 설정에 `*.png`가 있으면 `gh-pages`가 PNG를 빼고 올립니다. 그때는 배포 캐시 저장소에서만 전역 무시를 끄고 다시 배포하세요.

```sh
git -C "node_modules/.cache/gh-pages/https!github.com!GyuTae-Kim!GyuTae-Kim.github.io.git" config core.excludesFile /dev/null
npx gh-pages -d docs
```

2026년 10월 13일 배포.

## 콘텐츠 확인

원본 사이트에는 경력·학위·논문 목록이 없었습니다. 검증할 수 없는 회사명·직함·재직기간·논문 저자·성과수치는 추가하지 않았습니다. 공개 연구 자료는 실험 기록, 참고 논문 기반 구현, 응용 통합 구현으로 구분합니다. 최신 개발 사례는 기술 작업을 요약한 내용으로, 외부 공개 전에 프로젝트 공개 범위와 본인 기여 표현을 확인해야 합니다.

2026년 10월 13일 기준 초안.
