/**
 * live     — 지금 열어볼 수 있다
 * building — 주소는 잡아뒀지만 아직 배포 전이다
 * ended    — 만들어 운영했지만 지금은 내렸다
 */
export type ProjectStatus = 'live' | 'building' | 'ended';

/** 관계도가 선을 잇는 태그. 여러 프로젝트가 나눠 쓰는 것만 여기에 둔다. */
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
  | 'LLM';

export type Project = {
  id: string;
  name: string;
  /** 분류. 모노 대문자로 조판된다. */
  kind: string;
  group: 'game' | 'tool';
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
      'UUID v1·v4·v7, Hex, Base64, API Key, JWT 스타일 Bearer, OTP까지 15종을 카테고리로 걸러 만들고 한 번에 복사합니다. 열 개 중 가장 작지만 가장 자주 쓰는 것입니다.',
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
    tech: ['LLM', 'Supabase'],
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
      '열 개 중 가장 오래 붙잡고 있는 것. 모노레포 9패키지',
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
  links: PROJECTS.reduce(
    (sum, p) => sum + p.tech.filter((t) => SHARED_TECH.some((s) => s.tag === t)).length,
    0,
  ),
};
