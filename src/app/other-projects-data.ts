// Work outside the three main projects, shown under 「기타 프로젝트」 on /portfolio.
// Same pattern as the main projects: numbers and one short line per piece of work up
// front; problems and the remaining screens sit under 「자세히」.
export interface OtherProject {
  id: string;
  title: string;
  category: string;
  period: string;
  summary: string;
  stats: { value: string; label: string }[];
  role: string;
  tags: string[];
  work: { title: string; text: string }[];
  fixes: { problem: string; fix: string }[];
  // src: 1100 px display copy, full: the full-size capture opened by the zoom dialog.
  evidence: OperationShot[];
  moreEvidence: OperationShot[];
  scope: string;
}

export interface OperationShot {
  src: string;
  full: string;
  title: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

const SHOTS = 'assets/cases/operations/';

export const OTHER_PROJECTS: OtherProject[] = [
  {
    id: 'service-monitoring',
    title: '서비스 장애를 감지하고 원인까지 찾는 감시 체계',
    category: '운영 자동화 · 서비스 안정성',
    period: '2026',
    summary:
      '운영 중인 서비스 3개의 구성요소 13곳을 1분마다 확인하고, 이상이 이어지면 슬랙으로 알리는 감시 체계를 만들었습니다. 관리자 화면에서 상태, 응답 추이, 장애 이력을 함께 봅니다.',
    stats: [
      { value: '13곳', label: '1분마다 확인하는 구성요소' },
      { value: '3회 연속', label: '실패해야 장애 경보 · 복구 때 한 번 더 알림' },
      { value: '2.3초 → 0.5초', label: '감시가 찾은 느린 조회를 고친 결과' },
    ],
    role: '감시 기준과 알림 흐름을 설계하고, 감시 프로그램, 상태 조회 API, 관리자 서버 상태 화면을 직접 개발했습니다.',
    tags: ['Python', 'React', 'TypeScript', 'PostgreSQL', 'Slack API'],
    work: [
      { title: '판정 기준', text: '정상, 성능 저하, 장애, 확인 불가 4가지로 판정' },
      { title: '알림과 보고', text: '장애와 복구는 한 번씩 알리고, 하루 두 번 정기 보고' },
      { title: '원인 확인 화면', text: '상태, 응답 추이, 장애 이력을 한 화면에서 확인' },
      { title: '처리 결과 추적', text: '요청 접수와 실제 업무 완료를 나눠서 확인' },
    ],
    fixes: [
      {
        problem: '관리자가 직접 돌린 분석 작업이 오래 걸리자 서비스 지연 경보가 울렸습니다.',
        fix: '작업 출처를 구분해 진단 작업은 경보 판정에서 뺐습니다.',
      },
      {
        problem: '새 감시 항목이 첫 결과를 기다리는 동안 실패처럼 보였습니다.',
        fix: '수집 대기, 결과 미확인, 확정 실패를 나눠 표시했습니다.',
      },
      {
        problem: '장애 중에 수집 연결이 끊기면 그동안의 상태 이력이 비었습니다.',
        fix: '최대 3일치 관측을 보관했다가 연결이 돌아오면 중복 없이 보냅니다.',
      },
      {
        problem: '감시가 운영 DB에서 평균 4~5초 걸리는 조회를 잡아냈습니다.',
        fix: '조회를 고쳐 운영 규모 테스트 데이터에서 2.3초를 0.5초로 줄였습니다.',
      },
    ],
    evidence: [
      {
        src: SHOTS + 'dashboard-live-public-1100.webp',
        full: SHOTS + 'dashboard-live-public.jpg',
        title: '관리자 서버 상태 화면',
        alt: '실제 관리자 화면의 서비스별 상태 표시와 가동 기록. 운영 수치와 내부 세부정보는 가려져 있습니다.',
        caption: '서비스마다 현재 상태와 가동 기록을 보여 줍니다.',
        width: 1100,
        height: 691,
      },
      {
        src: SHOTS + 'slack-daily-report-public-1100.webp',
        full: SHOTS + 'slack-daily-report-public.jpg',
        title: '슬랙 정기 보고',
        alt: '실제로 받은 슬랙 감시 보고. 봇 이름과 상세 구성, 확인 시각은 가려져 있습니다.',
        caption: '하루 두 번, 모든 구성요소의 상태를 보고합니다.',
        width: 1100,
        height: 501,
      },
    ],
    moreEvidence: [
      {
        src: SHOTS + 'dashboard-timeline-public-1100.webp',
        full: SHOTS + 'dashboard-timeline-public.jpg',
        title: '응답 시간 추이',
        alt: '실제 응답 시간 추이 그래프. 상세 수치와 시각, 백업 일정은 가려져 있습니다.',
        caption: '잠깐 튄 값과 계속되는 이상을 비교해 봅니다.',
        width: 1100,
        height: 367,
      },
      {
        src: SHOTS + 'dashboard-incidents-public-1100.webp',
        full: SHOTS + 'dashboard-incidents-public.jpg',
        title: '장애와 복구 이력',
        alt: '실제 관리자 화면의 장애 이력과 복구 표시. 대상 식별정보와 상세 시각, 수치는 가려져 있습니다.',
        caption: '장애가 시작된 때부터 복구까지 기록합니다.',
        width: 1100,
        height: 367,
      },
    ],
    scope:
      '구현 코드, 운영 문서, 실제 슬랙 메시지와 관리자 화면으로 정리 · 화면의 내부 정보는 가림 · 2.3초 → 0.5초는 운영 DB가 아닌 운영 규모 테스트 데이터로 잰 값',
  },
  {
    id: 'wedraw-order-operations',
    title: '송장 연동에서 반복되던 전송 오류 개선',
    category: '웹 서비스 · 운영 문제 해결',
    period: '2026',
    summary:
      '외부 쇼핑몰 연동에서 같은 송장이 두 번 전송되거나, 이미 등록된 주문을 계속 다시 보내 실패하던 문제를 고쳤습니다. 위의 감시 체계가 보낸 실패 알림을 따라가 원인을 찾았습니다.',
    stats: [
      { value: '2회 → 1회', label: '표기만 바뀐 송장의 전송 횟수' },
      { value: '2회 → 0회', label: '엑셀을 다시 올릴 때 대표 운송장 변경' },
      { value: '6주', label: '매번 같은 실패를 내던 전체 전송 해결' },
    ],
    role: '팀 플랫폼에서 송장 연동 오류를 분석하고 전송과 업로드 처리를 고쳤습니다. 관리자 송장 등록 탭의 전체 전송 건수와 안내도 같은 기준으로 맞췄습니다.',
    tags: ['TypeScript', 'PostgreSQL', 'Supabase Edge Functions', '외부 API 연동'],
    work: [
      { title: '동시 전송', text: '요청마다 임시 파일을 따로 써서 충돌 없앰' },
      { title: '표기 차이', text: '하이픈만 다른 같은 번호는 다시 보내지 않음' },
      { title: '엑셀 재업로드', text: '바뀐 것이 없으면 운송장을 다시 쓰지 않음' },
      { title: '이미 등록된 송장', text: '마지막 등록 번호와 비교해 완료로 기록' },
    ],
    fixes: [
      {
        problem: '같은 순간 시작한 두 전송이 임시 파일 하나를 함께 써서 둘 다 실패로 기록됐습니다.',
        fix: '파일 이름을 요청마다 고유하게 짓고, 실패해도 임시 파일을 지웁니다.',
      },
      {
        problem: '하이픈만 다른 같은 운송장 번호를 바뀐 것으로 보고 다시 전송했습니다.',
        fix: '택배사가 다르거나 숫자가 다를 때만 변경으로 봅니다.',
      },
      {
        problem: '누적 엑셀을 올릴 때마다 대표 운송장이 옛 번호로 갔다가 돌아왔습니다.',
        fix: '주문 단위로 계산해 마지막 번호만 반영하고, 바뀐 것이 없으면 쓰지 않습니다.',
      },
      {
        problem: '전송 완료 표시가 지워진 주문 하나 때문에 전체 전송이 6주 동안 매번 실패했습니다.',
        fix: '이미 등록됐다는 응답이 오면 마지막 등록 번호와 비교해 완료로 기록합니다.',
      },
    ],
    evidence: [],
    moreEvidence: [
      {
        src: SHOTS + 'invoice-registration-public-1100.webp',
        full: SHOTS + 'invoice-registration-public.jpg',
        title: '관리자 송장 등록 탭',
        alt: '실제 송장 관리 화면의 송장 등록 탭. 내부 업무 규칙과 세부정보는 가려져 있습니다.',
        caption: '전체 전송 건수와 안내를 전송 기준에 맞췄습니다. 화면 자체는 팀원이 만들었습니다.',
        width: 1100,
        height: 407,
      },
    ],
    scope: '코드 변경 이력과 회귀 테스트 32개로 정리 · 화면의 내부 정보는 가림',
  },
];
