/**
 * live     — 지금 열어볼 수 있다
 * building — 주소는 잡아뒀지만 아직 배포 전이다
 * ended    — 만들어 운영했지만 지금은 내렸다
 */
export type ProjectStatus = 'live' | 'building' | 'ended';

export type Project = {
  id: string;
  name: string;
  /** 타일·패널 상단에 붙는 분류. 모노 대문자로 조판된다. */
  kind: string;
  group: 'game' | 'tool';
  /** 타일 호버 시 이름 아래 한 줄. 짧을수록 좋다. */
  tagline: string;
  /** 패널 본문. 두세 문장. */
  blurb: string;
  /** 패널 하단 2×2 표. 순서 그대로 조판된다. */
  specs: [label: string, value: string][];
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
        'UUID v1·v4·v7, Hex, Base64, API Key, JWT 스타일 Bearer, OTP까지 15종을 카테고리로 걸러 만들고 한 번에 복사합니다. 오프라인에서도 열리도록 PWA로 감쌌습니다.',
    specs: [
      ['토큰', '15종'],
      ['단축키', 'Enter · Ctrl+C'],
      ['스타일', 'CSS Modules'],
      ['오프라인', 'PWA'],
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
        '입력한 텍스트를 결정론적으로 그림으로 바꿉니다. 같은 문장이 항상 같은 패턴을 만드니 SHA-256으로 진위를 검증할 수 있고, 그 성질을 그대로 써서 그림으로 하는 2차 인증도 붙였습니다.',
    specs: [
      ['화풍', '8종'],
      ['검증', 'SHA-256 인증서'],
      ['부가', '이미지 2FA'],
      ['스택', 'Next.js · canvas'],
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
        '스토리 모드는 이야기 속 단서를 읽고 PIN을 추리하고, 추론 모드는 이야기 없이 숫자의 위치·크기·관계만으로 풉니다. 틀리면 벌 대신 새 단서가 열립니다.',
    specs: [
      ['모드', '스토리 · 추론'],
      ['에피소드', '18편'],
      ['평가', '별점 3단계'],
      ['스택', 'Next.js · React'],
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
        '풍선을 터뜨려 덧셈, 카드를 뒤집어 기억력, 흩어진 글자로 어휘력, 두더지를 잡아 암산. 프로필을 나눠 쓰고 난이도를 고르고 학습 리포트를 남깁니다. 아이들이 쓰는 것이라 접근성은 WCAG를 지켰습니다.',
    specs: [
      ['게임', '7종'],
      ['난이도', '3단계'],
      ['스택', 'Next.js 14 · Zustand'],
      ['접근성', 'WCAG 준수'],
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
        '관심 종목을 빠르게 훑어 심층 분석할 후보를 골라내던 스크리닝 도구입니다. 밸류에이션·SWOT·시나리오·매매 전략을 한 장의 리포트로 뽑고, OpenAI와 Gemini를 동시에 물려 두 요약을 견줬습니다. 리포트를 만들 때 스냅샷을 남겨 나중에 실제 성과를 되짚었습니다.',
    specs: [
      ['언어', 'Python 3.9+'],
      ['데이터', 'yfinance · Finnhub · FRED'],
      ['AI', 'OpenAI · Gemini · Claude'],
      ['출력', 'HTML + PNG'],
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
        '미국 주식 분석 리포트를 신청받던 서비스입니다. 티커를 검색해 한 번에 최대 3개까지 신청하면 12시간 안에 리포트를 보냈습니다. 신청이 들어오면 Slack으로 알림이 왔고, 리포트 자체는 AI Stock Analyzer가 만들었습니다.',
    specs: [
      ['프런트', 'Next.js 15 · Tailwind 4'],
      ['저장', 'Supabase'],
      ['검색', 'Finnhub API'],
      ['오프라인', 'PWA'],
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
      '경로탐색은 A*, 유닛 AI는 FSM, 시야는 셀 단위 안개, 자원은 채집과 고갈까지 굴러갑니다. 맵과 유닛을 직접 만드는 에디터가 따로 붙어 두 앱이 같은 데이터를 봅니다.',
    specs: [
      ['엔진', 'Phaser 3 · Next.js'],
      ['유닛', '24종'],
      ['앱', '게임 + 에디터'],
      ['QA', 'Playwright 11종'],
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
      '드래그로 화면을 짜고, 자연어로 시키고, Figma에서 가져오고, React 코드나 HTML5 임베드로 내보냅니다. 카탈로그는 어떤 프레임워크에도 기대지 않아서 렌더 타깃을 갈아 끼울 수 있습니다.',
    specs: [
      ['컴포넌트', '51종'],
      ['프런트', 'React 19 · Vite'],
      ['백엔드', 'NestJS · Supabase'],
      ['구조', '모노레포 9패키지'],
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
        '바닥을 잉크로 칠해 더 많은 영역을 차지한 팀이 이깁니다. 폰에서 열면 트윈스틱이 자동으로 붙고 발사 버튼은 없습니다 — 엄지가 둘뿐이라 이동·조준·발사·잠수를 버튼 넷으로 나누면 조작이 성립하지 않기 때문입니다.',
    specs: [
      ['엔진', 'Phaser 4'],
      ['빌드', 'Vite · TypeScript'],
      ['조작', '키보드 · 트윈스틱'],
      ['오프라인', 'PWA'],
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
      '레이어 파츠를 조립해 캐릭터를 만들고, 레이어마다 색을 곱연산으로 입히고, 애니메이션을 확인한 뒤 상태별 스프라이트 시트를 zip 하나로 내려받습니다. 원본 1,512장(135MB)을 아틀라스 36장(3.2MB)으로 굽습니다.',
    specs: [
      ['레이어', '13개 · 파츠 36종'],
      ['프레임', '파츠당 42장'],
      ['스택', 'Next.js · sharp'],
      ['아트워크', 'CC0'],
    ],
    og: '/og/paperdoll.png',
    icon: '/icons/paperdoll.png',
    status: 'live',
    url: 'https://paperdoll.jubrolab.dev/',
  },
];

export const COUNTS = {
  total: PROJECTS.length,
  live: PROJECTS.filter((p) => p.status === 'live').length,
  building: PROJECTS.filter((p) => p.status === 'building').length,
  ended: PROJECTS.filter((p) => p.status === 'ended').length,
  game: PROJECTS.filter((p) => p.group === 'game').length,
  tool: PROJECTS.filter((p) => p.group === 'tool').length,
};
