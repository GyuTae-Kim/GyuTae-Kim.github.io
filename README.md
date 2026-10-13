# Sean Kim — Research & Engineering Portfolio

기존 GitHub Pages Angular 저장소를 AI·3D·CAD/CAM 연구개발 포트폴리오로 수정한 검토용 소스입니다.

## 로컬 미리보기

```sh
npm ci
npm run preview
```

브라우저에서 http://127.0.0.1:4317 을 여세요. 현재 체크아웃의 `src/`를 직접 읽고 변경을 다시 빌드합니다.

## 구성

- `/`: 소개, CAD→특징 인식→CAM 개념도, 대표 프로젝트.
- `/portfolio`: 분야별 프로젝트 목록, `/portfolio/:id`: 문제·접근·기여·검증 사례. 가공 특징 인식, 판재 분류 AI, Fusion CAM, 제조 출력의 네 사례를 포함합니다.
- `/research`: 공개 연구 코드 3개와 실제 실험 그림. 기존 `/blog` 주소도 이곳으로 연결합니다.
- `/contact`: 공개 이메일·GitHub, 이메일 복사.
- `src/app/achievement-data.ts`: 특허 출원·공동발명 및 프로그램 등록 신청 자료의 개인정보 없는 성과 요약.
- `src/app/portfolio-data.ts`: 최근 개발 사례 내용.
- `src/app/research-data.ts`: 공개 연구 자료 내용과 출처.
- `src/assets/research/`: 본인 공개 저장소에서 가져온 원본 그림.

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
