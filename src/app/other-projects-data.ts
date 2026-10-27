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
  // Heading over moreEvidence; operations screens by default.
  moreEvidenceTitle?: string;
  // The system before and after a redesign, drawn under the work items.
  architecture?: ArchitectureBoard;
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

// The old system as one chain, the new one as stages; mine = what GyuTae built in that part.
export interface ArchitectureBoard {
  before: ArchitectureNode[];
  stages: { name: string; nodes: ArchitectureNode[] }[];
}

export interface ArchitectureNode {
  name: string;
  note: string;
  mine?: string;
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
const VODA = 'assets/cases/voda/';
const VORY_Q = 'assets/cases/vory-q/';
const SCENE_PLAYER = 'assets/cases/scene-player/';

// From the user's 2024 portfolio PDF; every fix here is GyuTae's own part of the TFT.
const VODA_FIXES: { problem: string; fix: string }[] = [
  {
    problem: '페이지 절대 좌표로 기록해, 같은 버튼을 눌러도 화면 크기에 따라 다른 위치로 남았습니다.',
    fix: '마우스 아래 맨 앞에 있는 웹 요소를 찾아, 그 요소 안의 좌표로 기록했습니다.',
  },
  {
    problem: '분석 화면을 열 때마다 Elasticsearch Aggregation으로 집계하니 응답이 늦어 시간 초과가 났습니다.',
    fix: '주기적으로 집계해 RDS 테이블에 저장하는 정제기를 새로 만들어, 화면은 집계 결과만 읽게 했습니다.',
  },
  {
    problem: '관공서 사이트에 많던 섹션 단위 풀 페이지 스크롤에서는 일반 캡처로 첫 섹션만 찍혔습니다.',
    fix: 'Selenium API 대신 Chrome에 직접 요청을 보내, 캡처 높이를 전체 스크롤 길이로 늘리고 모바일 방식으로 캡처했습니다.',
  },
  {
    problem: 'SQS 메시지를 1분 동안 가져가지 않으면 큐 한도를 넘어 데이터가 빠졌습니다.',
    fix: '비동기 작업 큐로 여러 Docker 컨테이너에 수집 명령을 나눠, 메시지를 병렬로 가져오게 했습니다.',
  },
  {
    problem: '병렬로 가져오자 같은 메시지를 두 번 가져와 로그가 중복됐습니다.',
    fix: '메시지 시간과 사용자 ID로 문서 ID를 만들어, 같은 메시지는 덮어쓰게 했습니다.',
  },
];

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
      '서비스 3개의 서버 구성요소 13곳과 송장 전송·알림톡 같은 업무 결과를 감시합니다. 서버 API와 사용자 PC 앱의 오류도 모아, 슬랙 알림을 받으면 관리자 화면에서 원인을 찾아보게 했습니다.',
    stats: [
      { value: '0.5초 → 0.1초', label: '느린 조회 개선 직후 관측한 주문 서비스 DB 평균 응답' },
      { value: `${MONITORING_CAUGHT.length}건`, label: '감시 알림으로 찾아 원인을 고친 운영 문제' },
      { value: '13곳', label: '1분마다 확인하는 서버 구성요소' },
    ],
    role: '감시 기준과 알림 흐름을 설계했습니다. 감시 프로그램과 서버 상태 화면, 업무 결과 확인, API 오류와 PC 앱 오류 수집, 이를 모아 보는 관리자 콘솔까지 직접 개발했습니다.',
    outcome: {
      result: '서버 상태와 업무 처리 결과, API와 PC 앱 오류를 지켜보는 감시 체계를 만들었습니다. 경보, 복구 알림, 정기 보고를 보내고 관리자 콘솔도 만들었으며, 감시가 찾아낸 느린 조회와 송장·알림톡 연동 문제 6건의 원인을 고쳤습니다.',
      impact: [
        { title: '작은 팀의 운영 대응', text: '담당자가 관리 화면을 계속 지켜보지 않아도 이상과 복구를 알림으로 받습니다. 반복 점검에 들던 시간을 원인을 찾는 데 쓸 수 있습니다.' },
        { title: '고객보다 먼저 문제 찾기', text: '서버가 정상이어도 배송 정보나 업무 알림이 빠지는 실패를 잡아내, 고객 문의가 오기 전에 조치할 수 있습니다.' },
        { title: '반복되는 오류 찾기', text: '서버와 사용자 PC에서 난 오류를 같은 것끼리 묶어 반복되는 문제를 찾고, 고친 뒤 나아졌는지 비교할 수 있게 기록을 남깁니다.' },
      ],
    },
    checked: [
      '관리자 상태 화면과 슬랙 보고, 장애·복구 이력을 서로 대조했습니다.',
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
        fix: '요청이 접수됐는지와 실제로 처리됐는지를 따로 보고, 실패한 업무와 끝나지 않은 실행도 감시 대상에 넣었습니다.',
      },
      {
        problem: '관리자 분석 작업이나 첫 결과를 기다리는 상태가 실제 장애처럼 보였습니다.',
        fix: '작업 출처를 구분하고 수집 대기·결과 미확인·확정 실패를 나눠, 대응이 필요한 이상을 가려내게 했습니다.',
      },
      {
        problem: '장애 중에 수집 연결이 끊기면 그동안의 상태 이력이 비었습니다.',
        fix: '관측을 임시 보관했다가 연결이 돌아오면 중복 없이 보내, 장애부터 복구까지 이력이 끊기지 않게 했습니다.',
      },
      {
        problem: '서버가 늦거나 끊겼을 때 오류 전송을 기다리면 가구빌더 편집과 출력이 멈춥니다.',
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
        caption: '직접 개발한 관리자 상태 화면입니다. 서비스별 현재 상태와 가동 기록을 보여 줍니다. 내부 식별정보는 가렸습니다.',
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
        caption: '하루 두 번 모든 구성요소의 상태를 보고합니다. 장애와 복구 경보도 같은 채널로 보냅니다.',
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
    id: 'voda-architecture',
    number: '05',
    title: 'VODA 웹 행동 분석 서비스 아키텍처 재설계',
    subtitle: '클릭과 스크롤 수집 → SQS 메시지 처리 → Elasticsearch 저장 → 주기 집계 → 히트맵과 그래프',
    headline: '집계를 미리 해 두어 분석 화면의 시간 초과를 해결했습니다',
    thumb: VODA + 'thumb-voda',
    category: '데이터 엔지니어링 · 웹 행동 분석',
    period: '2021.06–2022.01',
    summary:
      'VODA는 웹사이트 방문자의 페이지뷰, 클릭, 스크롤을 모아 트래픽 그래프와 히트맵으로 보여 주는 분석 서비스입니다. 이용 사이트가 늘어 기존 구조로는 버티기 어려워지자 4명이 TFT를 꾸려 아키텍처를 새로 설계했고, 저는 이벤트 수집, 메시지 처리, 집계, 페이지 캡처를 맡았습니다.',
    stats: [
      { value: `${VODA_FIXES.length}건`, label: '직접 해결한 수집과 집계 문제' },
      { value: '4가지', label: '맡아서 개발한 구성 요소' },
      { value: '4명', label: '아키텍처 재설계 TFT 인원' },
    ],
    role: '클릭 좌표 수집을 고치고, SQS 메시지를 Elasticsearch 문서로 바꾸는 처리, 집계 결과를 미리 만들어 두는 정제기, 전체 페이지를 캡처하는 크롤러를 개발했습니다.',
    outcome: {
      result: '기기마다 어긋나던 클릭 좌표를 바로잡고, 메시지 누락과 중복을 막았습니다. 분석 화면은 Elasticsearch에서 매번 집계하는 대신 정제기가 미리 만든 결과를 읽게 바꿔 시간 초과를 해결했습니다.',
      impact: [
        { title: '이벤트를 놓치지 않는 수집', text: '수집기를 여러 컨테이너로 나눠 큐에 쌓인 메시지를 제때 가져가고, 같은 메시지가 두 번 와도 기록은 하나만 남습니다.' },
        { title: '기기와 상관없이 맞는 히트맵', text: '좌표를 웹 요소 기준으로 기록해, 화면 크기가 달라도 같은 버튼의 클릭이 같은 자리에 모입니다.' },
        { title: '기다리지 않는 분석 화면', text: '무거운 집계를 미리 해 두어, 관리자가 화면을 열면 시간 초과 없이 그래프와 히트맵이 나옵니다.' },
      ],
    },
    checked: [],
    tags: ['Python', 'Selenium', 'Docker', 'Elasticsearch', 'MySQL', 'AWS SQS'],
    work: [
      { title: '좌표 수집', text: '마우스 아래 맨 앞 요소를 기준으로 좌표 기록' },
      { title: '메시지 처리', text: 'SQS 메시지를 Elasticsearch 문서 양식으로 가공' },
      { title: '데이터 정제기', text: '주기적으로 집계해 RDS 테이블에 저장' },
      { title: '페이지 크롤러', text: '풀 페이지 스크롤 사이트도 전체 화면 캡처' },
    ],
    fixes: VODA_FIXES,
    evidence: [
      {
        src: VODA + 'heatmap-1100.webp',
        full: VODA + 'heatmap.webp',
        title: '무브 히트맵 화면',
        alt: 'VODA 페이지 UX 분석 화면. 웹 페이지 위에 마우스가 머문 곳이 히트맵으로 겹쳐 있고, 오른쪽에 유효 클릭 비율과 체류 시간이 보입니다.',
        caption: '방문자의 마우스가 오래 머문 곳을 페이지 위에 겹쳐 보여 줍니다. 좌표 수집과 집계가 이 화면의 데이터를 만듭니다. 서비스 소개 자료에 실린 화면이며, 회사 이름은 가렸습니다.',
        width: 1100,
        height: 632,
      },
    ],
    moreEvidenceTitle: '분석 서비스 화면',
    moreEvidence: [
      {
        src: VODA + 'charts-1100.webp',
        full: VODA + 'charts.webp',
        title: '사용자 수 분석 화면',
        alt: 'VODA 사용자 수 분석 화면. 날짜별 전체, 신규, 재방문 사용자 그래프와 요일별 그래프, 요일과 시간대별 히트맵이 있습니다.',
        caption: '시간대별, 요일별 방문 추이와 예측값을 보여 줍니다. 서비스 소개 자료에 실린 화면이며, 회사 이름은 가렸습니다.',
        width: 1100,
        height: 740,
      },
    ],
    // Redrawn from the TFT's before/after diagrams in the PDF.
    architecture: {
      before: [
        { name: 'Web Agent', note: '방문자의 페이지뷰, 클릭, 스크롤 수집' },
        { name: 'voda-server', note: '수집 데이터를 MySQL에 저장하고 정제와 화면 응답까지 한 서버가 처리' },
        { name: '분석 화면', note: '트래픽 그래프와 히트맵' },
      ],
      stages: [
        {
          name: '수집',
          nodes: [
            { name: 'Web Agent', note: '방문자의 페이지뷰, 클릭, 스크롤 수집', mine: '좌표 기록 방식 개선' },
            { name: 'API Gateway, SQS', note: '마우스와 스크롤 이벤트를 큐에 보관' },
            { name: 'pv-recorder, mouse-recorder', note: '메시지를 Elasticsearch 문서로 저장', mine: '메시지 가공, 병렬 수집, 중복 제거' },
            { name: 'page-crawler', note: '페이지 화면과 요소 위치 수집', mine: '전체 페이지 캡처' },
          ],
        },
        {
          name: '저장소',
          nodes: [
            { name: 'Elasticsearch', note: '이벤트 로그와 집계 결과' },
            { name: 'MySQL', note: '고객사, 페이지 정보, 리포트' },
          ],
        },
        {
          name: '정제',
          nodes: [
            { name: '집계 정제기', note: '마우스와 스크롤 데이터를 주기적으로 집계', mine: '정제기 구축' },
            { name: 'forecast', note: '방문 추이 예측' },
          ],
        },
        {
          name: '시각화',
          nodes: [
            { name: 'presenter', note: '분석 화면에 데이터를 보내는 API', mine: '집계 결과 응답' },
            { name: 'voda-analytics', note: '관리자용 분석 화면' },
          ],
        },
      ],
    },
  },
  {
    id: 'vory-q-curation',
    number: '06',
    title: 'VORY-Q 쇼핑몰 개인화 큐레이션 서비스',
    subtitle: 'VODA 페이지뷰와 구매 이력 → 고객 세그먼트 → 통계 기반 추천 → 헤더 스크립트로 쇼핑몰에 노출',
    headline: '헤더에 스크립트만 넣으면 추천 상품이 뜨는 구조를 설계했습니다',
    thumb: VORY_Q + 'thumb-vory-q',
    category: '데이터 엔지니어링 · 추천 서비스 설계',
    period: '2021.03–2021.06',
    summary:
      '쇼핑몰 방문자의 페이지뷰와 구매 이력으로 상품을 추천하는 SaaS입니다. 같은 회사의 웹 분석 서비스 VODA가 모은 데이터를 쓰고, 쇼핑몰은 헤더에 스크립트만 넣으면 추천 상품을 받아 보여 줍니다. 8명이 참여했고, 저는 소프트웨어 아키텍트로 데이터 흐름과 API, DB, 추천 알고리즘 구조를 설계했습니다.',
    stats: [
      { value: '6개 영역', label: '데이터 흐름부터 추천 알고리즘 구조까지 직접 설계' },
      { value: '3가지', label: '직접 개발한 통계 기반 추천 알고리즘' },
      { value: '8명', label: '아키텍트, AI, 백엔드, 프런트엔드, PD, PM이 함께한 팀' },
    ],
    role: '소프트웨어 아키텍트로 데이터 수집과 분석, 추천 노출 방식, REST API, RDB, 고객 세그먼트, 추천 알고리즘 구조를 설계했고, 통계 기반 추천 알고리즘을 개발했습니다.',
    outcome: {
      result: 'VODA가 모은 데이터로 고객별 추천 목록을 만들어 쇼핑몰 화면에 보여 주는 구조를 만들었습니다. 실제 쇼핑몰 메인 페이지에서 많이 본 상품 추천이 동작했습니다.',
      impact: [
        { title: '쇼핑몰 쪽 개발 부담이 적은 연동', text: '쇼핑몰은 헤더에 스크립트만 넣으면 추천 영역이 생겨, 쇼핑몰마다 따로 개발하지 않아도 됩니다.' },
        { title: '고객마다 다른 추천', text: '구매한 상품과 자주 본 상품을 중심으로 보고 비슷한 고객끼리 묶어, 고객에 따라 다른 상품을 보여 줄 수 있습니다.' },
        { title: '알고리즘을 더하고 빼기 쉬운 구조', text: '추천 알고리즘을 Django 안에서 모듈처럼 관리해, 새 알고리즘을 붙이거나 뺄 때 손댈 곳이 적습니다.' },
      ],
    },
    // The PDF records no trial and error or checks for this project, so those sections stay hidden.
    checked: [],
    tags: ['Python', 'Django', 'MySQL', 'Celery', 'RabbitMQ', 'AWS SQS', 'Pandas'],
    work: [
      { title: '데이터 흐름', text: '구매한 상품과 자주 본 상품 중심으로 분석하도록 설계' },
      { title: '추천 노출', text: '헤더 스크립트가 추천 목록을 받아 정해진 자리에 표시' },
      { title: 'API와 DB', text: '스크립트용 API, VODA 연동 API, 행동 패턴 테이블 설계' },
      { title: '추천 알고리즘', text: '고객 세그먼트와 모듈 구조 설계, 통계 추천 3가지 개발' },
    ],
    fixes: [],
    evidence: [
      {
        src: VORY_Q + 'recommendation-1100.webp',
        full: VORY_Q + 'recommendation.webp',
        title: '쇼핑몰 메인 페이지의 추천 영역',
        alt: '실제 쇼핑몰 메인 페이지에 뜬 많이 본 상품 추천 영역. 상품 사진과 이름이 가로로 이어집니다.',
        caption: '회원 전체에게 많이 본 상품을 추천하는 영역입니다. 쇼핑몰 상단 메뉴는 잘라냈습니다.',
        width: 1100,
        height: 336,
      },
    ],
    moreEvidence: [],
  },
  {
    id: 'scene-change-player',
    number: '07',
    title: '장면 전환 지점을 표시하는 동영상 플레이어',
    subtitle: '영상 열기 → 장면 분할 실행 → 재생 막대에 분할 지점 표시 → 미리보기와 장면 이동 → 구간 저장',
    headline: '장면 전환 지점을 재생 막대에서 보고 바로 이동하게 했습니다',
    thumb: SCENE_PLAYER + 'thumb-scene-player',
    category: '데스크톱 앱 · 영상 처리',
    period: '2020.11–2020.12',
    summary:
      '영상에서 장면이 바뀌는 지점을 찾아 재생 막대에 표시하는 Windows 동영상 플레이어입니다. 장면 전환은 OpenCV 프레임 차이와 VGG16 특징 거리 두 방식으로 찾고, 저는 장면 검출을 뺀 플레이어 기능을 모두 개발했습니다.',
    stats: [
      { value: '8가지', label: '상세 패널에서 다루는 기능' },
      { value: '2가지', label: '플레이어에 연결한 장면 검출 방식' },
      { value: '10%', label: 'Ctrl+휠 한 번에 좁히는 타임라인 범위' },
    ],
    role: '장면 전환 검출 알고리즘을 뺀 플레이어 기능을 모두 개발했습니다. 재생 막대의 분할 지점 표시와 미리보기, 타임라인 확대, 장면 이동, 분할 지점 편집과 저장, ffmpeg 구간 저장, 미디어 정보 창을 만들었습니다.',
    outcome: {
      result: '파이썬 검출 결과를 플레이어로 받아, 장면 전환 지점을 재생 막대에 표시하고 미리보기와 이동, 수정, 구간 저장까지 한 화면에서 하게 했습니다.',
      impact: [
        { title: '긴 영상도 장면 단위로 탐색', text: '이전 장면, 다음 장면 버튼과 막대 위 표식으로 원하는 장면을 찾아갑니다.' },
        { title: '촘촘한 지점도 확대해서 고르기', text: 'Ctrl+휠로 마우스 위치를 중심으로 타임라인을 넓혀, 가까이 붙은 분할 지점도 구분해 고릅니다.' },
        { title: '자동 검출 결과를 사람이 다듬기', text: '잘못 잡힌 지점은 지우고 빠진 지점은 더해 저장하므로, 자동 검출 뒤 손으로 고치는 작업이 한 화면에서 이어집니다.' },
      ],
    },
    // The repository records no tests or checks for the player.
    checked: [],
    tags: ['C#', 'WPF', 'OpenCvSharp', 'FFME', 'ffmpeg'],
    work: [
      { title: '분할 지점 표시', text: '검출된 프레임을 재생 막대 위 표식으로 표시' },
      { title: '미리보기와 이동', text: '표식에 마우스를 올리면 그 프레임을 미리 보여 주고, 누르면 이동' },
      { title: '타임라인 확대', text: 'Ctrl+휠로 마우스 위치를 중심으로 확대와 축소' },
      { title: '편집과 저장', text: '분할 지점 추가와 삭제, 메타정보 저장, ffmpeg 구간 저장' },
    ],
    // From the player code and its comments; the detection scripts were a teammate's part.
    fixes: [
      {
        problem: '타임라인을 확대한 채 다음 장면으로 넘어가면 지점이 보이는 범위 밖으로 나갔습니다.',
        fix: '이동할 지점이 범위를 벗어나면 그보다 5초 넓게 범위를 늘려 보여 주게 했습니다.',
      },
      {
        problem: 'OpenCV로 구간을 저장하면 소리가 빠졌습니다.',
        fix: 'ffmpeg로 구간을 잘라 소리까지 저장했습니다.',
      },
      {
        problem: '플레이어는 파이썬 검출이 언제 끝나는지 알 수 없었습니다.',
        fix: '결과 파일이 생기면 지점을 그리고 버튼을 켜며, 검출이 도는 동안에는 새 검출을 막았습니다.',
      },
    ],
    // Placeholders until the user captures the Windows app; replace the files and keep the captions.
    evidence: [
      {
        src: SCENE_PLAYER + 'player-1100.webp',
        full: SCENE_PLAYER + 'player.webp',
        title: '재생 화면',
        alt: '장면 전환 플레이어의 재생 화면. 재생 막대 위에 분할 지점 표식이 있고, 표식 하나에 프레임 미리보기가 떠 있습니다.',
        caption: '재생 막대의 노란 표식이 장면이 바뀌는 지점입니다. 표식에 마우스를 올리면 그 프레임을 미리 보여 줍니다.',
        width: 1100,
        height: 688,
      },
    ],
    moreEvidenceTitle: '플레이어 화면',
    moreEvidence: [
      {
        src: SCENE_PLAYER + 'detail-1100.webp',
        full: SCENE_PLAYER + 'detail.webp',
        title: '상세 패널',
        alt: '플레이어 옆에 붙는 상세 패널. 프레임 이동, 두 가지 장면 분할, 이전과 다음 장면, 분할 지점 추가, 저장 버튼과 미디어 정보가 있습니다.',
        caption: '장면 분할 실행과 장면 이동, 분할 지점 편집, 구간 저장을 이 패널에서 합니다. 영상의 코덱과 해상도 같은 정보도 보여 줍니다.',
        width: 1100,
        height: 688,
      },
    ],
  },
];
