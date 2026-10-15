// Work outside the three main projects, listed under 「기타 프로젝트」 on /portfolio and
// opened at /portfolio/<id>. Same pattern as the main projects: numbers and one short line
// per piece of work up front; problems and the remaining screens sit under 「자세히」.
export interface OtherProject {
  id: string;
  // Numbered after the three main projects in the /portfolio list.
  number: string;
  title: string;
  // List row: one flow line, one result line, and the list thumbnail <thumb>-336/672.webp.
  subtitle: string;
  headline: string;
  thumb: string;
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
  // What the monitoring watches, drawn as a board under the work items.
  watch?: WatchBoard;
}

// Services are named by their role, not by product name.
export interface WatchBoard {
  groups: WatchGroup[];
  // Business work checked beside the servers (alerts, queues, integrations).
  operations: string[];
  // Errors gathered as they happen, from the servers and from the users' PC apps.
  collectors: { source: string; sourceNote: string; how: string; view: string; viewNote: string }[];
}

export interface WatchGroup {
  name: string;
  targets: { name: string; check: string; envs: string[] }[];
}

export function watchCount(board: WatchBoard): number {
  return board.groups.reduce((sum, group) => sum + groupCount(group), 0);
}

export function groupCount(group: WatchGroup): number {
  return group.targets.reduce((sum, target) => sum + target.envs.length, 0);
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
    number: '04',
    title: '서버부터 사용자 PC까지 장애를 잡아내는 감시 체계',
    subtitle: '서버 13곳 감시 → 슬랙 경보와 정기 보고 → API 오류와 PC 앱 오류 수집 → 관리자 콘솔에서 원인 확인',
    headline: '서버 장애와 사용자 PC의 오류를 한곳에서 찾습니다',
    thumb: SHOTS + 'thumb-monitoring',
    category: '운영 자동화 · 서비스 안정성',
    period: '2026',
    summary:
      '운영 중인 서비스 3개의 구성요소 13곳을 1분마다 확인하고, 이상이 이어지면 슬랙으로 알리는 감시 체계를 만들었습니다. 서버의 API 오류와, 서버까지 오지 않는 사용자 PC 프로그램의 오류도 관리자 화면에 모아 원인을 찾습니다.',
    stats: [
      { value: '13곳', label: '1분마다 확인하는 서버 구성요소' },
      { value: 'PC 앱 3종', label: '서버까지 오지 않는 가구빌더, 커넥터, 플로터 오류도 수집' },
      { value: '2.3초 → 0.5초', label: '감시가 찾은 느린 조회를 고친 결과' },
    ],
    role: '감시 기준과 알림 흐름을 설계했습니다. 감시 프로그램과 서버 상태 화면, API 오류와 PC 앱 오류 수집, 이를 모아 보는 관리자 콘솔까지 직접 개발했습니다.',
    tags: ['Python', 'FastAPI', 'Ruby', 'React', 'TypeScript', 'PostgreSQL', 'Slack API'],
    work: [
      { title: '서버 감시', text: '13곳을 정상, 성능 저하, 장애, 확인 불가로 판정' },
      { title: '알림과 보고', text: '3번 연속 실패하면 경보, 복구 때 한 번 더, 하루 두 번 정기 보고' },
      { title: 'API 오류 수집', text: '같은 오류끼리 묶고 처리 상태와 이력을 남김' },
      { title: 'PC 앱 오류 수집', text: '가구빌더와 커넥터의 오류를 작업 중단 없이 모음' },
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
      {
        problem: '서버가 늦거나 끊겼을 때 오류 전송을 기다리면 가구빌더 편집과 출력이 함께 멈춥니다.',
        fix: '오류 지점에서는 메모리에 담기만 하고, 전송은 따로 5초 제한으로 보냅니다. 같은 오류는 1분에 한 번만 보냅니다.',
      },
      {
        problem: '오류 메시지에 토큰이나 파일 경로가 섞여 들어올 수 있습니다.',
        fix: 'PC와 서버 양쪽에서 민감한 부분을 지운 첫 줄만 남기고, 도면 내용은 보내지 않습니다.',
      },
      {
        problem: '자동 테스트가 일부러 낸 실패가 운영 오류 목록에 섞였습니다.',
        fix: '테스트 실행 중에 난 오류는 보내지 않게 막았습니다.',
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
    watch: {
      groups: [
        {
          name: '설계·가공 플랫폼',
          targets: [
            { name: 'Nginx', check: '앞단 서버 자체 응답', envs: ['운영', '개발'] },
            { name: 'API 서버', check: '상태 응답과 엔진 로드', envs: ['운영', '개발'] },
            { name: 'GPU 워커', check: '마지막 하트비트', envs: ['운영', '개발'] },
            { name: 'DB', check: '연결과 느린 조회', envs: ['운영', '개발'] },
          ],
        },
        {
          name: '가구 주문 서비스',
          targets: [
            { name: '웹 서비스', check: '첫 화면과 앱 파일 응답', envs: ['운영'] },
            { name: 'DB', check: '연결과 느린 조회', envs: ['운영'] },
            { name: 'DB 함수 호출', check: '함수별 평균 응답 시간', envs: ['운영'] },
          ],
        },
        {
          name: '공장 관리 서비스',
          targets: [
            { name: '웹 서비스', check: '로그인 화면과 앱 파일 응답', envs: ['운영'] },
            { name: 'API 서버', check: '읽기 전용 요청 응답', envs: ['운영'] },
          ],
        },
      ],
      operations: ['정기 작업', '결제 후처리', '작업 대기열', '외부 연동', '알림톡 발송'],
      collectors: [
        {
          source: '서버 API',
          sourceNote: '설계·가공 플랫폼',
          how: '5xx와 처리하지 못한 예외는 모두, 4xx는 표본만',
          view: 'API 오류 화면',
          viewNote: '같은 오류끼리 묶고 처리 상태와 이력을 남김',
        },
        {
          source: '사용자 PC 앱',
          sourceNote: '가구빌더, 커넥터, 플로터',
          how: '작업을 멈추지 않고 오류 위치와 대상만 전송',
          view: '로컬 앱 이슈 화면',
          viewNote: '프로그램별 추이, 오류 코드별 묶음, 처리 완료 표시',
        },
      ],
    },
  },
  {
    id: 'wedraw-order-operations',
    number: '05',
    title: '송장 연동에서 반복되던 전송 오류 개선',
    subtitle: '감시가 보낸 실패 알림 → 원인 분석 → 전송과 엑셀 업로드 처리 수정 → 회귀 테스트 32개',
    headline: '6주 동안 매번 실패하던 송장 전체 전송을 고쳤습니다',
    thumb: SHOTS + 'thumb-invoice',
    category: '웹 서비스 · 운영 문제 해결',
    period: '2026',
    summary:
      '외부 쇼핑몰 연동에서 같은 송장이 두 번 전송되거나, 이미 등록된 주문을 계속 다시 보내 실패하던 문제를 고쳤습니다. 서비스 감시 체계가 보낸 실패 알림을 따라가 원인을 찾았습니다.',
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
