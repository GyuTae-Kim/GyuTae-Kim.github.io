import { ProjectOutcome } from './project-outcome';

// Operations projects use the same result, contribution, problem and evidence flow.
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
  outcome: ProjectOutcome;
  checked: string[];
  tags: string[];
  work: { title: string; text: string }[];
  comparison?: { situation: string; before: string; after: string }[];
  fixes: { problem: string; fix: string }[];
  // src: 1100 px display copy, full: the full-size capture opened by the zoom dialog.
  evidence: OperationShot[];
  moreEvidence: OperationShot[];
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
    subtitle: '서버·업무 결과 감시 → API·PC 앱 오류 수집 → 슬랙 경보 → 관리자 콘솔에서 원인 추적',
    headline: '서버가 멀쩡해도 몇 주씩 모르고 지나던 업무 실패까지 찾아냅니다',
    thumb: SHOTS + 'thumb-monitoring',
    category: '운영 자동화 · 서비스 안정성',
    period: '2026',
    summary:
      '서비스 3개의 서버 구성요소 13곳과 송장 전송·알림톡 같은 실제 업무 결과를 함께 감시합니다. 서버 API와 사용자 PC 앱의 오류를 모아, 슬랙 알림에서 관리자 화면의 원인 확인으로 이어지는 운영 도구를 개발했습니다.',
    stats: [
      { value: '0.5초 → 0.1초', label: '느린 조회 개선 직후 관측한 주문 서비스 DB 평균 응답' },
      { value: `${MONITORING_CAUGHT.length}건`, label: '감시 알림으로 찾아 원인을 고친 운영 문제' },
      { value: '13곳', label: '1분마다 확인하는 서버 구성요소' },
    ],
    role: '감시 기준과 알림 흐름을 설계했습니다. 감시 프로그램과 서버 상태 화면, 업무 결과 확인, API 오류와 PC 앱 오류 수집, 이를 모아 보는 관리자 콘솔까지 직접 개발했습니다.',
    outcome: {
      result: '서버 상태, 실제 업무 처리 결과, API·PC 앱 오류를 함께 살펴보는 감시 체계를 만들었습니다. 경보·복구 알림·정기 보고와 관리자 콘솔을 연결했고, 감시가 찾아낸 느린 조회와 송장·알림톡 연동 문제 6건의 원인을 고쳤습니다.',
      impact: [
        { title: '작은 팀의 운영 대응', text: '담당자가 여러 관리 화면을 계속 지켜보는 대신 이상과 복구를 알림으로 확인해, 반복 점검 부담을 줄이고 원인 파악에 집중할 수 있습니다.' },
        { title: '고객에게 닿기 전 문제 발견', text: '서버가 정상이어도 배송 정보나 업무 알림이 누락되는 실패를 감지해, 고객 문의가 들어오기 전에 조치하는 데 도움을 줄 수 있습니다.' },
        { title: '개선으로 이어지는 오류 기록', text: '서버와 사용자 PC에서 발생한 오류를 묶어 반복되는 문제를 찾고, 수정 뒤의 상태를 비교할 수 있는 운영 근거를 남깁니다.' },
      ],
    },
    checked: [
      '관리자 상태 화면·슬랙 보고·장애와 복구 이력을 대조했습니다.',
      '느린 조회 수정 직후 DB 평균 응답이 0.5초대에서 0.1초 안팎으로 변한 운영 그래프를 확인했습니다.',
      '송장·알림톡·DB 연결 등 감시 알림에서 원인을 추적해 조치한 6건을 기록했습니다.',
    ],
    tags: ['Python', 'FastAPI', 'Ruby', 'React', 'TypeScript', 'PostgreSQL', 'Slack API'],
    work: [
      { title: '서버 감시', text: '13곳을 정상, 성능 저하, 장애, 확인 불가로 판정' },
      { title: '업무 결과 확인', text: '요청이 접수됐는지가 아니라 실제로 처리됐는지로 판정' },
      { title: '알림과 보고', text: '3번 연속 실패하면 경보, 복구 때 한 번 더, 하루 두 번 정기 보고' },
      { title: '오류 수집', text: '서버 API 오류와 PC 앱 오류를 모아 같은 오류끼리 묶음' },
    ],
    fixes: [
      {
        problem: '서버가 정상이어도 송장 전송이나 알림톡 발송은 실패한 채 남을 수 있습니다.',
        fix: '요청 접수와 실제 처리 결과를 구분해, 업무 실패와 끝나지 않은 실행도 감시에 연결했습니다.',
      },
      {
        problem: '관리자 분석 작업이나 첫 결과를 기다리는 상태가 실제 장애처럼 보였습니다.',
        fix: '작업 출처를 구분하고 수집 대기·결과 미확인·확정 실패를 나눠, 대응이 필요한 이상을 알아볼 수 있게 했습니다.',
      },
      {
        problem: '장애 중에 수집 연결이 끊기면 그동안의 상태 이력이 비었습니다.',
        fix: '관측을 임시 보관했다가 연결이 돌아오면 중복 없이 보내, 장애와 복구 흐름을 이어 볼 수 있게 했습니다.',
      },
      {
        problem: '서버가 늦거나 끊겼을 때 오류 전송을 기다리면 가구빌더 편집과 출력이 함께 멈춥니다.',
        fix: '편집과 출력을 기다리게 하지 않고 오류를 따로 전송하며, 같은 오류의 반복 전송을 제한했습니다.',
      },
      {
        problem: '오류 메시지에 토큰이나 파일 경로가 섞여 들어올 수 있습니다.',
        fix: 'PC와 서버 양쪽에서 민감한 부분을 지운 첫 줄만 남기고, 도면 내용은 보내지 않습니다.',
      },
    ],
    evidence: [
      {
        src: SHOTS + 'dashboard-live-public-1100.webp',
        full: SHOTS + 'dashboard-live-public.jpg',
        title: '관리자 서버 상태 화면',
        alt: '실제 관리자 화면의 서비스별 상태 표시와 가동 기록. 운영 수치와 내부 세부정보는 가려져 있습니다.',
        caption: '직접 개발한 관리자 상태 화면입니다. 서비스별 현재 상태와 가동 기록을 함께 보여 줍니다. 내부 식별정보는 가렸습니다.',
        width: 1100,
        height: 691,
      },
    ],
    moreEvidence: [
      {
        src: SHOTS + 'slack-daily-report-public-1100.webp',
        full: SHOTS + 'slack-daily-report-public.jpg',
        title: '슬랙 정기 보고',
        alt: '실제로 받은 슬랙 감시 보고. 봇 이름과 상세 구성, 확인 시각은 가려져 있습니다.',
        caption: '하루 두 번 모든 구성요소의 상태를 보고합니다. 장애와 복구 경보도 같은 알림 흐름으로 전달합니다.',
        width: 1100,
        height: 501,
      },
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
    subtitle: '실패 감지 → 전송 상태와 등록 번호 대조 → 중복 전송·엑셀 재업로드 개선',
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
    outcome: {
      result: '이미 등록된 송장은 완료 상태로 맞추고, 번호가 실제로 달라진 경우에만 다시 처리하도록 전송·업로드 로직을 개선했습니다. 동시에 실행한 전송의 충돌과 같은 엑셀을 다시 올릴 때의 불필요한 변경을 없애고, 운영자가 직접 고쳐야 하는 경우에는 등록된 번호와 조치 방법을 안내합니다.',
      impact: [
        { title: '반복 확인과 수작업 감소', text: '이미 처리된 주문이 계속 미전송으로 남지 않게 해, 담당자가 같은 실패를 다시 확인하고 외부 관리자 화면에서 대조하는 부담을 줄일 수 있습니다.' },
        { title: '배송 정보의 일관성', text: '표기 차이와 실제 번호 변경을 구분하고 주문별 최종값을 반영해, 반복 업로드 후에도 주문 서비스와 쇼핑몰의 배송 정보를 일관되게 유지하도록 돕습니다.' },
        { title: '명확한 후속 조치', text: '자동으로 완료 처리할 수 있는 경우와 운영자가 등록 번호를 수정해야 하는 경우를 구분해, 실패 메시지를 보고 다음 행동을 판단할 수 있게 합니다.' },
      ],
    },
    checked: [
      '동시 전송, 번호 표기 차이, 누적 엑셀 재업로드, 이미 등록된 송장을 포함한 회귀 테스트 32개로 점검했습니다.',
      '표기만 바뀐 송장은 한 번만 전송하고, 같은 엑셀 재업로드 시 대표 운송장을 다시 쓰지 않는지 확인했습니다.',
      '외부에 등록된 번호가 같으면 완료 처리하고, 다르면 관리자에게 수정 안내를 보여주는 흐름을 확인했습니다.',
    ],
    tags: ['TypeScript', 'PostgreSQL', 'Supabase Edge Functions', '외부 API 연동'],
    work: [
      { title: '감시 연결', text: '연동 실패와 끝나지 않은 실행을 기록해 알림으로 받음' },
      { title: '중복 전송', text: '동시 전송 충돌과 하이픈 표기 차이로 생긴 재전송 제거' },
      { title: '엑셀 재업로드', text: '바뀐 것이 없으면 운송장을 다시 쓰지 않음' },
      { title: '이미 등록된 송장', text: '등록 번호와 비교해 완료로 기록하거나 고칠 곳을 안내' },
    ],
    comparison: [
      { situation: '번호의 하이픈만 다를 때', before: '다른 번호로 판단해 다시 전송하고 실패', after: '같은 번호로 판단해 재전송 생략' },
      { situation: '같은 누적 엑셀을 다시 올릴 때', before: '대표 번호가 바뀌었다 돌아오며 두 번 재전송', after: '주문별 마지막 번호만 반영하고, 같으면 저장 생략' },
      { situation: '외부에 이미 등록된 송장일 때', before: '미전송으로 남아 일괄 전송마다 반복 실패', after: '등록 번호가 같으면 완료, 다르면 수정할 번호와 조치 안내' },
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
    evidence: [
      {
        src: SHOTS + 'invoice-registration-public-1100.webp',
        full: SHOTS + 'invoice-registration-public.jpg',
        title: '관리자 송장 등록 탭',
        alt: '실제 송장 관리 화면의 송장 등록 탭. 내부 업무 규칙과 세부정보는 가려져 있습니다.',
        caption: '개선한 전송 로직이 연결되는 송장 등록 화면입니다. 화면과 연동 기능은 팀원이 개발했으며, 본인은 오류 처리·전체 전송 건수·안내를 보완했습니다. 내부 정보는 가렸습니다.',
        width: 1100,
        height: 407,
      },
    ],
    moreEvidence: [],
  },
];
