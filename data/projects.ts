/**
 * live     — 지금 열어볼 수 있다
 * building — 아직 만드는 중이다. 주소만 잡아둔 것(Specast)도, 웹으로 띄울 자리가
 *            애초에 없는 것(Koda CLI)도 여기에 든다. 어느 쪽이든 상세 패널은
 *            여는 버튼 대신 "아직 만드는 중입니다"를 낸다
 * ended    — 만들어 운영했지만 지금은 내렸다
 */
export type ProjectStatus = 'live' | 'building' | 'ended';

/**
 * 관계도가 선을 잇는 태그. 여러 프로젝트가 나눠 쓰는 것만 여기에 둔다.
 *
 * Python 은 '돌아가는 앱이 올라탄 것' 이라는 다른 열 개의 기준에서 한 발 벗어나 있다.
 * AI Stock Analyzer 는 통째로 파이썬이지만(main.py · src/*.py · requirements.txt),
 * Impastile 쪽은 그림에서 데이터를 뽑는 scripts/extract-painting.py 하나라 배포본에는
 * 없다. 그래도 넣기로 했다 — 무엇으로 만들었는지도 "같은 것을 쓴다"에 든다. 태그를 세는
 * 규칙(둘 이상)은 그대로라, 셋째가 나타나지 않는 한 이 선은 둘 사이에만 남는다.
 */
export type TechTag =
  | 'Next.js'
  | 'React'
  | 'TypeScript'
  | 'Tailwind'
  | 'Phaser'
  | 'Vite'
  | 'Supabase'
  | 'PWA'
  | 'Canvas'
  | 'LLM'
  | 'Python';

export type Project = {
  id: string;
  name: string;
  /** 분류. 모노 대문자로 조판된다. */
  kind: string;
  /**
   * 관계도의 색과 분류 필터를 가른다. 게임도 도구도 아닌 것(보기만 하는 것)이 생겨
   * art 를 늘렸다 — 도구로 밀어넣으면 "쓰는 것" 여섯 개 사이에 섞여 읽히지 않는다.
   */
  group: 'game' | 'tool' | 'art';
  /** 한 줄 요약. 짧을수록 좋다. */
  tagline: string;
  /** 무엇인지. 두세 문장. */
  blurb: string;
  /** 왜 그렇게 만들었는지. 결정과 그 이유. */
  story: string;
  /** 짚어둘 만한 것. 한 줄씩. */
  notes: string[];
  /** 관계도가 잇는 공유 태그. */
  tech: TechTag[];
  /** 실제로 쓴 것 전부. 분야별로 묶어 상세에 깔린다. */
  stack: { area: string; items: string[] }[];
  og: string;
  icon: string;
  status: ProjectStatus;
  /** 웹으로 띄운 적이 없는 프로젝트에는 없다. */
  url?: string;
  /** 서비스가 둘인 프로젝트만 채운다 (Vanguard). */
  secondary?: { label: string; url: string };
};

export const PROJECTS: Project[] = [
  {
    id: 'token-generator',
    name: 'Token Generator',
    kind: 'UTILITY',
    group: 'tool',
    tagline: '토큰 15종을 한 화면에서',
    blurb:
      'UUID v1·v4·v7, Hex, Base64, API Key, JWT 스타일 Bearer, OTP까지 15종을 카테고리로 걸러 만들고 한 번에 복사합니다. 열두 개 중 가장 작지만 가장 자주 쓰는 것입니다.',
    story:
      '토큰이 필요할 때마다 검색해서 아무 사이트에나 들어가던 게 싫어서 만들었습니다. 그래서 목표가 하나였습니다 — 열면 이미 만들어져 있고, Enter로 새로 뽑고, Ctrl+C로 복사하고 끝. 비행기에서도 열리도록 PWA로 감쌌습니다.',
    notes: [
      'Enter 로 재생성, Ctrl+C 로 복사 — 마우스를 쓰지 않아도 된다',
      '생성은 전부 브라우저 안에서. 만든 토큰이 서버로 나가지 않는다',
      'CSS Modules 를 쓴 유일한 프로젝트. 이때는 Tailwind 를 안 썼다',
    ],
    tech: ['Next.js', 'React', 'TypeScript', 'PWA'],
    stack: [
      { area: '프레임워크', items: ['Next.js 14 (App Router)', 'React 18', 'TypeScript'] },
      { area: '스타일', items: ['CSS Modules'] },
      { area: '부가', items: ['next-pwa 5', 'qrcode.react 4', 'Vercel Analytics'] },
    ],
    og: '/og/token-generator.png',
    icon: '/icons/token-generator.png',
    status: 'live',
    url: 'https://token-generator.jubrolab.dev/',
  },
  {
    id: 'text2visual',
    name: 'Text2Visual',
    kind: 'GENERATIVE',
    group: 'tool',
    tagline: '같은 문장은 언제나 같은 그림이 된다',
    blurb:
      '텍스트를 결정론적으로 그림으로 바꿉니다. 유체·붓터치·마블링·수채·점묘·모자이크·글리치까지 화풍 8가지를 고를 수 있습니다.',
    story:
      '난수로 그리면 예쁘긴 해도 한 번 지나가면 끝입니다. 입력 문자열을 해시로 돌려 그 값만으로 그림을 만들면, 같은 문장은 언제나 같은 그림이 됩니다. 이 성질이 생기고 나서 쓸 곳이 두 개 더 나왔습니다 — SHA-256으로 진위를 확인하는 인증서, 그리고 자기 패턴을 아홉 개 중에서 골라내는 이미지 2차 인증.',
    notes: [
      '난수를 쓰지 않는다. 입력 해시가 곧 그림의 씨앗이다',
      '같은 문장 → 같은 그림이라는 성질에서 인증서와 2FA 가 파생됐다',
      'Upstash 로 생성 요청에 속도 제한을 걸었다',
    ],
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind', 'Canvas', 'LLM', 'PWA'],
    stack: [
      { area: '프레임워크', items: ['Next.js 14', 'React 18', 'TypeScript'] },
      { area: '스타일', items: ['Tailwind CSS 3'] },
      { area: '그리기', items: ['node-canvas 3', 'gif.js'] },
      {
        area: '부가',
        items: [
          'OpenAI',
          'crypto-js (SHA-256)',
          'Upstash Redis · Ratelimit',
          'PWA (manifest · 서비스 워커)',
        ],
      },
    ],
    og: '/og/text2visual.png',
    icon: '/icons/text2visual.png',
    status: 'live',
    url: 'https://text2visual.jubrolab.dev/',
  },
  {
    id: 'story-hacker',
    name: 'Story Hacker',
    kind: 'PUZZLE',
    group: 'game',
    tagline: '단서를 읽고 비밀번호를 맞힌다',
    blurb:
      '이야기 속 단서로 PIN을 추리하는 스토리 모드 10편과, 이야기 없이 숫자의 위치·크기·관계만으로 푸는 추론 모드 8편.',
    story:
      '퍼즐 게임에서 틀리면 보통 벌을 줍니다. 목숨이 줄거나 처음으로 돌아가거나. 여기서는 틀릴 때마다 단서가 하나 열립니다. 못 푸는 사람은 계속 힌트를 받아 결국 풀고, 잘 푸는 사람은 적은 시도로 별 셋을 받습니다. 실력 차이를 난이도가 아니라 보상으로 가릅니다.',
    notes: [
      '오답이 벌이 아니라 진행이다 — 틀리면 새 단서가 열린다',
      '스토리는 타자 효과로 흘러나온다. 읽는 속도를 강제하려는 게 아니라 긴장을 만들려고',
      '별점은 스토리 모드는 힌트 사용, 추론 모드는 시도 횟수로 갈린다',
    ],
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind'],
    stack: [
      { area: '프레임워크', items: ['Next.js 14 (App Router)', 'React 18', 'TypeScript'] },
      { area: '스타일', items: ['Tailwind CSS 3'] },
      { area: '부가', items: ['sharp (OG 생성)', 'Vercel Analytics', '웹 매니페스트'] },
    ],
    og: '/og/story-hacker.png',
    icon: '/icons/story-hacker.png',
    status: 'live',
    url: 'https://story-hacker.jubrolab.dev/',
  },
  {
    id: 'kiply',
    name: 'Kiply',
    kind: 'KIDS',
    group: 'game',
    tagline: '6~12세를 위한 미니게임 7종',
    blurb:
      '풍선을 터뜨려 덧셈, 카드를 뒤집어 기억력, 흩어진 글자로 어휘력, 두더지를 잡아 암산. 프로필을 나눠 쓰고 난이도를 고르고 학습 리포트를 남깁니다.',
    story:
      '아이가 쓰는 것이라 두 가지를 먼저 정했습니다. 하나, 광고와 결제를 넣지 않는다. 둘, 접근성은 어른용보다 더 엄격하게 — WCAG를 지키고 모션 감소 설정을 따르고 키보드만으로도 전부 됩니다. 한 판이 1분을 넘지 않게 자른 것도 의도입니다. 짧은 집중 시간은 고칠 문제가 아니라 전제니까요.',
    notes: [
      '한 판이 1분을 넘지 않는다. 짧은 집중 시간을 전제로 설계했다',
      '프로필을 나눠 써서 형제가 각자 기록을 갖는다',
      '광고와 결제가 없다. 아이가 실수로 누를 것이 없어야 한다',
      '오프라인에서도 돌아간다 — 차 안이나 대기실을 염두에 뒀다',
    ],
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind', 'PWA'],
    stack: [
      { area: '프레임워크', items: ['Next.js 15 (App Router)', 'React 18', 'TypeScript'] },
      { area: '상태', items: ['Zustand 5'] },
      { area: '스타일', items: ['Tailwind CSS 4', 'Framer Motion 12', 'Pretendard'] },
      { area: '부가', items: ['howler.js (소리)', 'canvas-confetti', 'PWA'] },
    ],
    og: '/og/kiply.png',
    icon: '/icons/kiply.png',
    status: 'live',
    url: 'https://kiply.jubrolab.dev/',
  },
  {
    id: 'stock-analyzer',
    name: 'AI Stock Analyzer',
    kind: 'RESEARCH',
    group: 'tool',
    tagline: '열 종목을 훑어 서넛으로 압축했다',
    blurb:
      '밸류에이션·SWOT·시나리오·매매 전략·백테스트를 한 장의 리포트로 뽑던 스크리닝 도구. 종목 하나에 200원, 열 개를 10분에 훑었습니다.',
    story:
      '최종 투자 판단을 대신하려고 만든 게 아닙니다. 관심 종목 열 개를 빠르게 훑어 심층 분석할 서넛으로 줄이는, 리서치의 앞단만 담당했습니다. 그래서 리포트 첫 줄에 "이것만 보고 결정하지 말 것"을 박아뒀습니다. OpenAI와 Gemini에 같은 데이터를 물려 두 요약을 나란히 놓은 것도 같은 이유입니다 — 한쪽 말을 믿지 않게 하려고.',
    notes: [
      'AI 요약을 둘 띄워 나란히 견준다. 한 모델의 말을 믿지 않으려고',
      '리포트를 만들 때 스냅샷을 남겨 나중에 실제 성과를 되짚었다 (포워드 테스팅)',
      'Playwright 로 HTML 리포트를 PNG 로도 구웠다. 공유가 쉬워야 보니까',
      'APScheduler 로 매일 정해진 시각에 배치를 돌렸다',
    ],
    tech: ['LLM', 'Supabase', 'Python'],
    stack: [
      { area: '언어', items: ['Python 3.9+'] },
      { area: '데이터', items: ['yfinance', 'Finnhub', 'FRED', 'pandas · numpy'] },
      { area: 'AI', items: ['OpenAI', 'Google Gemini', 'Anthropic'] },
      { area: '출력', items: ['Jinja2 (HTML)', 'Playwright (PNG)', 'rich (CLI)'] },
      { area: '운영', items: ['Supabase', 'APScheduler'] },
    ],
    og: '/og/stock-analyzer.png',
    icon: '/icons/stock-analyzer.png',
    status: 'ended',
  },
  {
    id: 'ticker-brief',
    name: 'TickerBrief',
    kind: 'REPORT',
    group: 'tool',
    tagline: '티커를 넣으면 분석 리포트가 왔다',
    blurb:
      '미국 주식 분석 리포트를 신청받던 서비스. 티커를 검색해 최대 3개까지 신청하면 12시간 안에 리포트를 보냈고, 리포트는 AI Stock Analyzer가 만들었습니다.',
    story:
      'AI Stock Analyzer는 제 손에서만 돌던 CLI였습니다. 남이 쓰게 하려면 신청을 받을 창구가 필요해서 만든 게 이쪽입니다. 리포트 생성은 손이 가는 일이라 주간 한도를 사용자당 10개로 묶고, 신청이 들어오면 Slack으로 알림을 받아 사람이 돌렸습니다. 완전 자동화보다 수요 확인을 먼저 두려던 구조였습니다.',
    notes: [
      '엔진(Stock Analyzer)과 창구(TickerBrief)를 나눠 만든 유일한 짝',
      '주간 한도 10개 — 리포트를 사람이 돌렸으므로 처리량이 곧 한도였다',
      '티커 마퀴가 점수·등급·업사이드를 실시간으로 흘렸다',
      '자동화 전에 수요를 먼저 확인하려던 구조. 확인하고 접었다',
    ],
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind', 'Supabase', 'PWA'],
    stack: [
      { area: '프레임워크', items: ['Next.js 16 (App Router)', 'React 19', 'TypeScript'] },
      { area: '스타일', items: ['Tailwind CSS 4'] },
      { area: '데이터', items: ['Supabase', 'Finnhub (티커 검색)'] },
      { area: '부가', items: ['react-virtuoso', 'Slack Webhook', 'Speed Insights', 'PWA'] },
    ],
    og: '/og/ticker-brief.png',
    icon: '/icons/ticker-brief.png',
    status: 'ended',
    url: 'https://ticker-brief.jubrolab.dev/',
  },
  {
    id: 'vanguard',
    name: 'Chronicles of the Vanguard',
    kind: 'STRATEGY',
    group: 'game',
    tagline: '타일 위에서 굴러가는 실시간 전략',
    blurb:
      '경로탐색은 A*, 유닛 AI는 FSM, 시야는 셀 단위 안개, 자원은 채집과 고갈까지 굴러갑니다. 맵과 유닛을 직접 만드는 에디터가 따로 붙습니다.',
    story:
      '게임 로직을 Phaser 밖으로 전부 밀어냈습니다. 경로탐색·충돌·시야·자원·봇은 프레임워크를 모르는 순수 패키지에 있고, Phaser는 그 결과를 그리기만 합니다. 그래서 게임을 띄우지 않고도 로직을 테스트할 수 있고, 에디터와 게임이라는 두 앱이 같은 데이터 파일 하나를 봅니다. 밸런스를 고치려고 게임을 다시 빌드할 필요가 없습니다.',
    notes: [
      '게임 로직이 Phaser 를 모른다 — 순수 패키지로 떼어내 게임 없이 테스트한다',
      '에디터와 게임이 data/ 하나를 공유한다. 밸런스는 JSON 만 고치면 된다',
      '봇에 Humanizer 를 붙여 사람처럼 실수하게 만들었다',
      'Playwright 로 게임 플레이 시나리오 11종을 자동 검증한다',
    ],
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind', 'Phaser', 'Canvas', 'PWA'],
    stack: [
      { area: '엔진', items: ['Phaser 3.90', 'phaser3-rex-plugins'] },
      { area: '셸', items: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS 4'] },
      { area: '핵심 로직', items: ['A* 경로탐색', 'FSM 유닛 AI', 'FogGrid 시야', 'BotBrain'] },
      {
        area: '에디터',
        items: ['Canvas 2D (유닛·맵 미리보기)', '@xyflow/react', 'serwist (PWA)'],
      },
      { area: '구조', items: ['npm workspaces', 'zod 3 (데이터 스키마)', 'Zustand 5'] },
      { area: 'QA', items: ['Playwright 시나리오 11종'] },
    ],
    og: '/og/vanguard.png',
    icon: '/icons/vanguard.png',
    status: 'live',
    url: 'https://vc-rts.jubrolab.dev/',
    secondary: { label: '맵 에디터 열기', url: 'https://vc-editor.jubrolab.dev/' },
  },
  {
    id: 'specast',
    name: 'Specast',
    kind: 'BUILDER',
    group: 'tool',
    tagline: '스펙 하나를 진실로 삼는 화면 빌더',
    blurb:
      '드래그로 화면을 짜고, 자연어로 시키고, Figma에서 가져오고, React 코드나 HTML5 임베드로 내보냅니다. 편집 방식이 넷이지만 결과는 JSON 스펙 하나로 모입니다.',
    story:
      '화면을 만드는 방법이 네 가지인데 결과물도 네 가지면 아무것도 못 합니다. 그래서 캔버스·자연어·코드·Figma 넷이 모두 같은 JSON 스펙을 고치게 했습니다. 무엇으로 시작했든 다른 방식으로 이어서 편집할 수 있고, 렌더 타깃도 갈아 끼울 수 있습니다. 컴포넌트 카탈로그가 어떤 프레임워크에도 의존하지 않는 이유가 이것입니다 — 지금은 React와 HTML5를 뱉지만 다음이 무엇이 될지 모르니까.',
    notes: [
      '편집 경로 넷이 전부 같은 JSON 스펙을 고친다. 무엇으로 시작해도 이어서 편집된다',
      '컴포넌트 카탈로그가 프레임워크를 모른다 — 렌더 타깃을 갈아 끼울 수 있다',
      'LLM 키는 서버 프록시 뒤에 숨긴다. Gemini·DeepSeek·Anthropic·OpenAI·Ollama 를 갈아 쓴다',
      'API Flow — 등록한 API 를 묶거나 파이프라인으로 이어 캔버스에서 시연한다',
      '열두 개 중 가장 오래 붙잡고 있는 것. 모노레포 9패키지',
    ],
    tech: ['Next.js', 'React', 'TypeScript', 'Vite', 'Tailwind', 'Supabase', 'LLM'],
    stack: [
      { area: '편집기', items: ['React 19', 'Vite', 'react-router', 'TypeScript'] },
      { area: '마케팅', items: ['Next.js 15 (SSR)', 'Tailwind CSS 4'] },
      { area: '백엔드', items: ['NestJS 11', 'Prisma 5', 'Supabase (Postgres · Auth)', 'jose'] },
      { area: '편집 도구', items: ['@dnd-kit', 'CodeMirror 6', 'zod 4', 'Zustand 5'] },
      { area: '렌더', items: ['@json-render 0.19 (고정)', 'shadcn 36종', 'Radix'] },
      { area: '구조', items: ['모노레포 9패키지', 'Figma 플러그인'] },
    ],
    og: '/og/specast.png',
    icon: '/icons/specast.png',
    status: 'building',
    url: 'https://specast.jubrolab.dev/',
  },
  {
    id: 'ink-arena',
    name: 'INK ARENA',
    kind: 'ACTION',
    group: 'game',
    tagline: '더 넓게 칠한 팀이 이긴다',
    blurb:
      '바닥을 잉크로 칠해 더 많은 영역을 차지한 팀이 이깁니다. 잠수는 아군 잉크 위에서만 빨라지고 잉크가 찹니다.',
    story:
      '모바일 조작을 짜다가 막혔습니다. 이동·조준·발사·잠수를 버튼 넷으로 나누면 엄지가 둘뿐이라 동시에 두 개까지만 눌립니다. 그래서 발사 버튼을 없앴습니다 — 오른쪽 스틱을 기울이면 그 방향으로 계속 쏩니다. 잠수 버튼을 조준 스틱 위에 둔 것도 같은 계산입니다. 엄지가 스틱을 떠나야 눌리는데, 그게 "잠수 중에는 못 쏜다"는 게임 규칙과 정확히 같은 동작입니다.',
    notes: [
      '발사 버튼이 없다. 엄지가 둘뿐이라 버튼 넷으로는 조작이 성립하지 않는다',
      '잠수 버튼이 조준 스틱 위에 있다 — 손가락이 스틱을 떠나는 동작 = 못 쏘는 규칙',
      '세로로 들면 화면을 돌리라고 안내한다. 1280×720 을 세로에 맞추면 우표만 해진다',
      '아이디어만 스플래툰에서 가져왔고 에셋·이름·캐릭터는 전부 독자적이다',
    ],
    tech: ['TypeScript', 'Phaser', 'Vite', 'PWA'],
    stack: [
      { area: '엔진', items: ['Phaser 4.2'] },
      { area: '빌드', items: ['Vite 6', 'TypeScript'] },
      { area: '조작', items: ['키보드 + 마우스', '트윈스틱 (터치 자동 감지)'] },
      { area: '부가', items: ['PWA (오프라인)', 'Vitest'] },
    ],
    og: '/og/ink-arena.png',
    icon: '/icons/ink-arena.png',
    status: 'live',
    url: 'https://ink-arena.jubrolab.dev/',
  },
  {
    id: 'paperdoll',
    name: 'Paperdoll',
    kind: 'ASSET',
    group: 'tool',
    tagline: '파츠를 겹쳐 만들고 시트로 내보낸다',
    blurb:
      '레이어 파츠를 조립해 캐릭터를 만들고 레이어마다 색을 입힌 뒤, 상태별 스프라이트 시트를 zip 하나로 받습니다. 13레이어 · 파츠 36종 · 파츠당 42프레임.',
    story:
      '아트가 회색조인 건 의도입니다. 베이스 #EFEFEF, 음영 #A7A8A7, 검정 아웃라인. 색은 런타임에 곱연산으로 입혀 아웃라인만 검정으로 남깁니다. 배율에 255/239를 곱하는데, 이래야 베이스가 고른 색에 정확히 떨어집니다. 손·발·일부 눈은 순수 검정이라 틴트가 의미 없어서, 빌드가 파츠별로 이를 감지해 컬러 피커를 숨깁니다.',
    notes: [
      '색을 곱연산으로 입혀 검정 아웃라인을 살린다. 배율에 255/239 를 곱하는 이유',
      '원본 1,512장(135MB)을 아틀라스 36장(3.2MB)으로 굽는다. 요청도 1512 → 36',
      '셀마다 4px 투명 여백 — 없으면 축소된 drawImage 가 옆 프레임을 물어온다',
      '틴트가 무의미한 파츠(순수 검정)를 빌드가 감지해 컬러 피커를 숨긴다',
      '아트워크는 RGS_Dev 의 CC0 팩. 크레딧은 의무가 아니라 예의로 넣었다',
    ],
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind', 'Canvas'],
    stack: [
      { area: '프레임워크', items: ['Next.js 16', 'React 19', 'TypeScript'] },
      { area: '스타일', items: ['Tailwind CSS 4'] },
      { area: '이미지', items: ['sharp 0.35 (아틀라스 굽기)', 'Canvas (런타임 틴트)'] },
      { area: '내보내기', items: ['fflate (zip)'] },
      { area: '에셋', items: ['CC0 · RGS_Dev Modular Characters'] },
    ],
    og: '/og/paperdoll.png',
    icon: '/icons/paperdoll.png',
    status: 'live',
    url: 'https://paperdoll.jubrolab.dev/',
  },
  {
    id: 'impastile',
    name: 'Impastile',
    kind: 'GALLERY',
    group: 'art',
    tagline: '원화가 그어진 방향으로 붓을 놓는다',
    blurb:
      '반 고흐 회화 12점을 셀 격자로 나눠, 셀마다 원화의 붓결 방향으로 회전한 스트로크를 놓아 다시 그립니다. 소용돌이치는 밤하늘은 소용돌이 접선을, 사이프러스는 수직 불꽃결을 따라 흐릅니다. 내 이미지를 끌어다 놓으면 같은 붓이 그 자리에서 붓결을 뽑아 다시 그립니다.',
    story:
      '모자이크는 색만 남기고 붓질을 버립니다. 그래서 색상 맵과 함께 붓결 방향장을 뽑았습니다 — 원화에 구조 텐서를 걸어 등고선 방향을 얻고, 그 각도로 회전한 길쭉한 사각형에 물감이 솟은 릿지를 얹습니다. 색은 지어내지 않고 원화에서만 오므로, 모자이크와 갈리는 것은 방향뿐입니다. 그 방향을 배각(2θ) 벡터로 저장한 것이 핵심입니다. 붓 스트로크는 180° 대칭이라 방향의 부호가 의미 없는데, 각도를 그대로 보간하면 0°와 179°가 90°로 섞여 스트로크가 뒤집힙니다.',
    notes: [
      '방향을 배각(2θ) 벡터로 저장한다. 각도를 그냥 섞으면 0°와 179°가 90°가 된다',
      '올린 이미지는 서버로 나가지 않는다. 파이썬 추출기의 브라우저 판이 탭 안에서 붓결을 뽑는다',
      '작품 한 점이 gzip 75KB 라 12점을 다 안고 시작하지 않는다 — 보는 것부터 받고 나머지가 뒤따른다',
      '시간을 프레임 수가 아니라 dt 로 센다. 탭이 가려져 rAF 가 늦어져도, 120Hz 에서도 속도가 같다',
      '공유 카드는 같은 렌더 규칙을 SVG 로 한 번 구운 것이다. 화면과 다른 그림이 나가지 않는다',
      '원화는 Wikimedia Commons 의 퍼블릭 도메인 스캔. 뽑아낸 것은 저해상도 색상 맵과 방향장이다',
    ],
    /* Python 은 배포본이 아니라 만드는 쪽에 있다 — scripts/extract-painting.py 가
       원화에서 색상 맵과 방향장을 뽑아 번들에 넣는다. 화면에서 도는 것은 아니다. */
    tech: ['Next.js', 'React', 'TypeScript', 'Canvas', 'Python'],
    stack: [
      { area: '프레임워크', items: ['Next.js 16 (App Router)', 'React 19', 'TypeScript'] },
      { area: '스타일', items: ['전역 CSS 한 장', 'CSS Module (엔진 문서)'] },
      { area: '그리기', items: ['Canvas 2D', '구조 텐서 방향장', 'SVG (서버 렌더)'] },
      { area: '데이터 추출', items: ['Python', 'Pillow', 'numpy', 'TS 판 (올린 이미지)'] },
      { area: '부가', items: ['next/og (공유 카드)', 'Noto Sans KR 서브셋'] },
    ],
    og: '/og/impastile.png',
    icon: '/icons/impastile.png',
    status: 'live',
    url: 'https://impastile.jubrolab.dev/',
  },
  {
    id: 'koda-cli',
    name: 'Koda CLI',
    kind: 'AGENT',
    group: 'tool',
    tagline: '내 컴퓨터 안에서만 도는 코딩 에이전트',
    blurb:
      'OpenAI 호환 엔드포인트(Ollama · vLLM · 클라우드) 아무 데나 붙는 터미널 코딩 에이전트. 도구 13종과 5단계 권한, 서브에이전트·MCP·훅·스킬까지 직접 짜 넣었습니다. 화면은 React 로 그리는데 브라우저가 아니라 터미널입니다.',
    story:
      '"토큰 비용이 0이면 시장이 생긴다"를 확인하려고 시작했고, 그 가설은 접었습니다. 비용 함수를 잘못 적었더군요 — 로컬 추론용 GPU 값에 감가상각과 모델 갱신 락인까지 더하면, 사용한 만큼만 내는 클라우드 쪽이 오히려 예측 가능한 비용입니다. 접은 것은 "이걸로 뭘 팔겠다"였지 도구가 아닙니다. 에이전트 루프와 권한 파이프라인을 남의 코드가 아니라 내 코드로 갖게 된 쪽이 원래 목적이었고, 그건 지금도 고치고 있습니다.',
    notes: [
      '모델이 도구를 텍스트로 뱉으면 받아 적는다 — 작은 모델은 tool_calls 채널을 자주 놓친다. XML · 펜스 · 점 접두사 네 형식을 파서가 되받는다',
      '권한 판단은 한 곳에만 둔다. 붙는 곳이 넷(터미널 UI · SDK · 로컬 서버 · 헤드리스)이라 복제하면 곧 어긋난다',
      '되돌리기는 그림자 git 에 쌓는다 — ~/.koda 아래 별도 git dir 을 두고 작업 트리만 빌려, 저장소의 .git 을 건드리지 않는다',
      '토큰은 BPE 휴리스틱으로 세고 실측 중앙값으로 배율을 학습한다. 한글은 라틴보다 두 배 넘게 먹는다',
      '의존성 여덟 개. 마크다운 렌더러도 직접 썼고, 에이전트 루프는 React 를 모른다',
      '기능은 늘리지 않고 조인다 — 권한 우회 차단, 스트리밍 안정성, 미완성 응답 이어쓰기가 최근에 손댄 것들이다',
    ],
    /* React 를 넣은 것은 Ink 가 DOM 대신 터미널로 조정(reconcile)하기 때문이다 —
       react 18 을 진짜 의존성으로 들고 훅과 컴포넌트로 화면을 짠다. 그리는 곳이
       브라우저가 아닐 뿐이라, "무엇으로 UI 를 짰나"라는 관계는 그대로 성립한다.
       TypeScript 는 넣지 않는다. 전부 .js · .mjs 다. */
    tech: ['React', 'LLM'],
    stack: [
      { area: '런타임', items: ['Node.js 18+ (ESM)', 'native fetch SSE'] },
      { area: 'UI', items: ['React 18', 'Ink 5', '자체 마크다운 → ANSI 렌더러'] },
      { area: '에이전트', items: ['function calling + 텍스트 폴백', '내장 도구 13종', '서브에이전트(task · fork)'] },
      { area: '백엔드', items: ['Ollama (qwen3-coder:30b)', 'vLLM', 'OpenAI · Anthropic 호환'] },
      { area: '확장', items: ['MCP (stdio · HTTP)', 'Hooks', 'Skills', '커스텀 슬래시 명령'] },
      { area: '안전', items: ['5단계 권한 파이프라인', 'trusted folders', 'macOS sandbox-exec', '그림자 git 체크포인트'] },
      { area: '테스트', items: ['node:test 26개 파일 (외부 의존성 0)'] },
    ],
    og: '/og/koda-cli.png',
    icon: '/icons/koda-cli.png',
    status: 'building',
  },
];

/** 둘 이상이 나눠 쓴 태그만. 하나만 쓴 것은 관계를 만들지 못한다. */
export const SHARED_TECH: { tag: TechTag; count: number }[] = (() => {
  const count = new Map<TechTag, number>();
  PROJECTS.forEach((p) => p.tech.forEach((t) => count.set(t, (count.get(t) ?? 0) + 1)));
  return [...count.entries()]
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, n]) => ({ tag, count: n }));
})();

export const COUNTS = {
  total: PROJECTS.length,
  live: PROJECTS.filter((p) => p.status === 'live').length,
  building: PROJECTS.filter((p) => p.status === 'building').length,
  ended: PROJECTS.filter((p) => p.status === 'ended').length,
  game: PROJECTS.filter((p) => p.group === 'game').length,
  tool: PROJECTS.filter((p) => p.group === 'tool').length,
  art: PROJECTS.filter((p) => p.group === 'art').length,
  links: PROJECTS.reduce(
    (sum, p) => sum + p.tech.filter((t) => SHARED_TECH.some((s) => s.tag === t)).length,
    0,
  ),
};
