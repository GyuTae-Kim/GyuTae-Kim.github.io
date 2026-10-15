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
  // Real problems the monitoring caught and what was fixed, with one monitoring screen above.
  caught?: CaughtProblem[];
  caughtShot?: OperationShot;
}

export interface CaughtProblem {
  // ISO date (YYYY-MM-DD); the page shows the month and day.
  date: string;
  found: string;
  fixed: string;
  // Id of the project page that tells the fix in full.
  link?: string;
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

// Problems the monitoring caught in production, oldest first. Every fix is GyuTae's commit;
// link = the project page that tells the fix in full.
const MONITORING_CAUGHT: CaughtProblem[] = [
  {
    date: '2026-09-30',
    found: '감시를 켠 첫날, 주문 서비스 DB의 평균 응답이 0.5초 안팎으로 느렸고 관리 화면의 기간별 추이 조회가 평균 4~5초씩 걸리는 것이 잡혔습니다.',
    fixed: '조회를 고친 직후 DB 평균 응답이 0.1초 안팎으로 떨어졌습니다. 같은 원인이던 조회 17개도 같은 방식으로 고쳤습니다.',
  },
  {
    date: '2026-10-01',
    found: '배포 점검 작업이 DB 트랜잭션을 연 채 파일 저장소를 읽어, 연결을 10초 넘게 붙잡았습니다.',
    fixed: 'DB 조회만 연결 안에서 하고, 파일 확인은 연결을 닫은 뒤 하게 했습니다.',
  },
  {
    date: '2026-10-06',
    found: '같은 순간 시작한 송장 전송 두 건이 함께 실패로 기록됐습니다.',
    fixed: '전송 충돌과 같은 송장의 중복 전송을 없앴습니다.',
    link: 'order-invoice-sync',
  },
  {
    date: '2026-10-06',
    found: '배송 알림톡 4건의 발송 결과가 끝내 오지 않았습니다. 최근 120일을 점검하니 결과를 못 받은 메시지가 65건이었습니다.',
    fixed: '발송 뒤 결과가 없는 메시지를 1분마다 다시 조회해 맞추게 했습니다.',
  },
  {
    date: '2026-10-13',
    found: '주문 하나가 9월 초부터 6주 동안 송장 전체 전송 때마다 실패하고 있었습니다.',
    fixed: '이미 등록된 번호와 비교해 완료로 기록하게 고쳤습니다.',
    link: 'order-invoice-sync',
  },
  {
    date: '2026-10-13',
    found: '가상계좌 입금 때 주문 완료 알림톡을 다시 보내다 거절됐습니다.',
    fixed: '주문할 때 이미 보낸 알림톡을 입금 때 다시 보내지 않게 했습니다.',
  },
];

export const OTHER_PROJECTS: OtherProject[] = [
  {
    id: 'service-monitoring',
    number: '04',
    title: '서버부터 사용자 PC까지 장애를 잡아내는 감시 체계',
    subtitle: '서버 13곳과 업무 결과 감시 → 슬랙 경보와 정기 보고 → API 오류와 PC 앱 오류 수집 → 관리자 콘솔에서 원인 확인',
    headline: '서버가 멀쩡해도 몇 주씩 모르고 지나던 업무 실패까지 찾아냅니다',
    thumb: SHOTS + 'thumb-monitoring',
    category: '운영 자동화 · 서비스 안정성',
    period: '2026',
    summary:
      '서버가 멈추거나 느려지는 것을 알리는 데서 시작해, 서버는 정상인데 송장 전송이나 알림톡 같은 업무가 실패하는 것까지 알아채도록 넓힌 감시 체계입니다. 서비스 3개의 구성요소 13곳을 1분마다 확인해 이상이 이어지면 슬랙으로 알리고, 서버 API 오류와 서버까지 오지 않는 사용자 PC 프로그램의 오류도 관리자 화면에 모읍니다.',
    stats: [
      { value: '0.5초 → 0.1초', label: '감시를 켠 첫날 찾아 고친 주문 서비스 DB 평균 응답' },
      { value: `${MONITORING_CAUGHT.length}건`, label: '감시 알림으로 찾아 원인을 고친 운영 문제' },
      { value: '13곳', label: '1분마다 확인하는 서버 구성요소' },
    ],
    role: '감시 기준과 알림 흐름을 설계했습니다. 감시 프로그램과 서버 상태 화면, 업무 결과 확인, API 오류와 PC 앱 오류 수집, 이를 모아 보는 관리자 콘솔까지 직접 개발했습니다.',
    tags: ['Python', 'FastAPI', 'Ruby', 'React', 'TypeScript', 'PostgreSQL', 'Slack API'],
    work: [
      { title: '서버 감시', text: '13곳을 정상, 성능 저하, 장애, 확인 불가로 판정' },
      { title: '업무 결과 확인', text: '요청이 접수됐는지가 아니라 실제로 처리됐는지로 판정' },
      { title: '알림과 보고', text: '3번 연속 실패하면 경보, 복구 때 한 번 더, 하루 두 번 정기 보고' },
      { title: '오류 수집', text: '서버 API 오류와 PC 앱 오류를 모아 같은 오류끼리 묶음' },
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
      '구현 코드, 커밋 기록, 운영 문서, 실제 슬랙 메시지와 관리자 화면으로 정리 · 화면의 제품 이름과 내부 정보는 가림 · 0.5초 → 0.1초는 실제 감시 화면의 응답 시간 그래프에서 읽은 값',
    caught: MONITORING_CAUGHT,
    caughtShot: {
      src: SHOTS + 'response-drop-public-1100.webp',
      full: SHOTS + 'response-drop-public.webp',
      title: '감시를 켠 첫날의 응답 시간',
      alt: '실제 감시 화면의 평균 응답 시간 그래프. 주황 선인 주문 서비스 DB가 500ms대에서 100ms 안팎으로 떨어집니다. 제품 이름은 가려져 있습니다.',
      caption: '주황 선이 주문 서비스 DB입니다. 기록을 시작한 저녁, 느린 조회를 고친 직후 평균 응답이 0.5초대에서 0.1초 안팎으로 떨어졌습니다.',
      width: 1100,
      height: 296,
    },
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
    id: 'order-invoice-sync',
    number: '05',
    title: '송장 연동에서 반복되던 전송 오류 개선',
    subtitle: '송장 연동을 감시에 연결 → 실패 알림으로 원인 추적 → 전송과 엑셀 업로드 처리 수정 → 회귀 테스트 32개',
    headline: '6주 동안 전체 전송 때마다 반복되던 실패를 없앴습니다',
    thumb: SHOTS + 'thumb-invoice',
    category: '웹 서비스 · 운영 문제 해결',
    period: '2026',
    summary:
      '배송이 시작된 주문의 운송장 번호를 연동 서비스를 거쳐 외부 쇼핑몰에 등록합니다. 한 번 등록된 번호는 연동으로 바꿀 수 없어, 잘못 처리되면 담당자가 쇼핑몰 관리자에서 직접 고쳐야 합니다. 이 연동을 서비스 감시에 연결하고, 실패 알림을 따라가 같은 송장이 두 번 전송되거나 이미 등록된 주문이 계속 실패하던 원인을 찾아 고쳤습니다.',
    stats: [
      { value: '6주', label: '전체 전송 때마다 반복되던 같은 실패 해결' },
      { value: '2회 → 1회', label: '표기만 바뀐 송장의 전송 횟수' },
      { value: '2회 → 0회', label: '같은 엑셀을 다시 올릴 때 대표 운송장 변경' },
    ],
    role: '송장 연동의 실패 기록을 서비스 감시에 연결하고, 알림으로 드러난 전송 오류의 원인을 찾아 전송과 엑셀 업로드 처리를 고쳤습니다. 연동 기능과 송장 등록 화면은 팀원이 만들었고, 화면에서는 전체 전송 건수와 안내만 맞췄습니다.',
    tags: ['TypeScript', 'PostgreSQL', 'Supabase Edge Functions', '외부 API 연동'],
    work: [
      { title: '감시 연결', text: '연동 실패와 끝나지 않은 실행을 기록해 알림으로 받음' },
      { title: '중복 전송', text: '동시 전송 충돌과 하이픈 표기 차이로 생긴 재전송 제거' },
      { title: '엑셀 재업로드', text: '바뀐 것이 없으면 운송장을 다시 쓰지 않음' },
      { title: '이미 등록된 송장', text: '등록 번호와 비교해 완료로 기록하거나 고칠 곳을 안내' },
    ],
    fixes: [
      {
        problem: '일괄로 배송을 시작하면 같은 순간 시작한 두 전송이 임시 파일 하나를 함께 썼습니다. 둘 다 실패로 기록됐고, 그중 하나는 실제로 등록됐는데도 미전송으로 남았습니다.',
        fix: '파일 이름을 요청마다 고유하게 짓고, 실패해도 임시 파일을 지웁니다. 연동 서비스가 돌려준 거절 사유도 함께 기록합니다.',
      },
      {
        problem: '하이픈만 다른 같은 운송장 번호를 바뀐 것으로 보고 다시 보냈습니다. 두 번째 전송은 실패했고, 완료 표시가 지워진 주문은 미전송 목록에 남았습니다.',
        fix: '택배사가 다르거나 숫자가 다를 때만 변경으로 봅니다.',
      },
      {
        problem: '하루치가 쌓이는 택배사 엑셀을 올릴 때마다 대표 운송장이 옛 번호로 갔다가 돌아왔고, 배송 중인 주문은 그때마다 다시 전송돼 실패가 두 번씩 기록됐습니다.',
        fix: '주문마다 마지막 번호만 한 번에 반영하고, 바뀐 것이 없으면 쓰지 않습니다.',
      },
      {
        problem: '번호가 바뀌었다 돌아온 주문 하나가 완료 표시를 잃어, 9월 초부터 6주 동안 전체 전송 때마다 같은 실패가 났습니다.',
        fix: '이미 등록됐다는 응답이 오면 마지막 등록 번호와 비교합니다. 같으면 완료로 기록하고, 다르면 등록된 번호와 함께 쇼핑몰 관리자에서 고치라고 안내합니다.',
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
