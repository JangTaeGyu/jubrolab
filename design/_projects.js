/* 시안 다섯 개가 함께 쓰는 프로젝트 데이터.
   내용은 data/projects.ts 와 같고, 시안은 브라우저에서 바로 열어보므로 순수 JS 로 둔다. */
window.PROJECTS = [
  {
    id: 'token-generator',
    name: 'Token Generator',
    kind: 'UTILITY',
    group: 'tool',
    status: 'live',
    tagline: '토큰 15종을 한 화면에서',
    blurb:
      'UUID v1·v4·v7, Hex, Base64, API Key, JWT 스타일 Bearer, OTP까지 15종을 카테고리로 걸러 만들고 한 번에 복사합니다.',
    tech: ['Next.js', 'React', 'PWA'],
    specs: [['토큰', '15종'], ['스택', 'Next.js 14'], ['오프라인', 'PWA']],
    url: 'https://token-generator.jubrolab.dev/',
  },
  {
    id: 'text2visual',
    name: 'Text2Visual',
    kind: 'GENERATIVE',
    group: 'tool',
    status: 'live',
    tagline: '같은 문장은 언제나 같은 그림이 된다',
    blurb:
      '텍스트를 결정론적으로 그림으로 바꿉니다. 같은 문장이 늘 같은 패턴을 만들어 SHA-256으로 진위를 검증할 수 있고, 그 성질로 이미지 2차 인증까지 붙였습니다.',
    tech: ['Next.js', 'React', 'canvas', 'OpenAI', 'PWA'],
    specs: [['화풍', '8종'], ['검증', 'SHA-256'], ['스택', 'canvas']],
    url: 'https://text2visual.jubrolab.dev/',
  },
  {
    id: 'story-hacker',
    name: 'Story Hacker',
    kind: 'PUZZLE',
    group: 'game',
    status: 'live',
    tagline: '단서를 읽고 비밀번호를 맞힌다',
    blurb:
      '이야기 속 단서로 PIN을 추리하는 스토리 모드와, 이야기 없이 숫자의 위치·크기·관계만으로 푸는 추론 모드. 틀리면 벌 대신 새 단서가 열립니다.',
    tech: ['Next.js', 'React'],
    specs: [['에피소드', '18편'], ['모드', '스토리 · 추론'], ['스택', 'Next.js']],
    url: 'https://story-hacker.jubrolab.dev/',
  },
  {
    id: 'kiply',
    name: 'Kiply',
    kind: 'KIDS',
    group: 'game',
    status: 'live',
    tagline: '6~12세를 위한 미니게임 7종',
    blurb:
      '풍선을 터뜨려 덧셈, 카드를 뒤집어 기억력, 두더지를 잡아 암산. 프로필을 나눠 쓰고 학습 리포트를 남깁니다. 아이들 것이라 접근성은 WCAG를 지켰습니다.',
    tech: ['Next.js', 'React', 'Zustand', 'PWA'],
    specs: [['게임', '7종'], ['상태', 'Zustand'], ['접근성', 'WCAG']],
    url: 'https://kiply.jubrolab.dev/',
  },
  {
    id: 'stock-analyzer',
    name: 'AI Stock Analyzer',
    kind: 'RESEARCH',
    group: 'tool',
    status: 'ended',
    tagline: '열 종목을 훑어 서넛으로 압축했다',
    blurb:
      '밸류에이션·SWOT·시나리오·매매 전략을 한 장의 리포트로 뽑던 스크리닝 도구. OpenAI와 Gemini를 동시에 물려 두 요약을 견줬습니다.',
    tech: ['Python', 'OpenAI', 'Supabase'],
    specs: [['언어', 'Python'], ['데이터', 'yfinance · FRED'], ['출력', 'HTML + PNG']],
    url: null,
  },
  {
    id: 'ticker-brief',
    name: 'TickerBrief',
    kind: 'REPORT',
    group: 'tool',
    status: 'ended',
    tagline: '티커를 넣으면 분석 리포트가 왔다',
    blurb:
      '미국 주식 분석 리포트를 신청받던 서비스. 티커를 검색해 최대 3개까지 신청하면 12시간 안에 리포트를 보냈고, 리포트는 AI Stock Analyzer가 만들었습니다.',
    tech: ['Next.js', 'React', 'Tailwind', 'Supabase', 'PWA'],
    specs: [['프런트', 'Next.js 15'], ['저장', 'Supabase'], ['검색', 'Finnhub']],
    url: 'https://ticker-brief.jubrolab.dev/',
  },
  {
    id: 'vanguard',
    name: 'Chronicles of the Vanguard',
    kind: 'STRATEGY',
    group: 'game',
    status: 'live',
    tagline: '타일 위에서 굴러가는 실시간 전략',
    blurb:
      '경로탐색은 A*, 유닛 AI는 FSM, 시야는 셀 단위 안개. 맵과 유닛을 직접 만드는 에디터가 따로 붙어 두 앱이 같은 데이터를 봅니다.',
    tech: ['Phaser', 'Next.js', 'React', 'TypeScript'],
    specs: [['엔진', 'Phaser 3'], ['유닛', '24종'], ['앱', '게임 + 에디터']],
    url: 'https://vc-rts.jubrolab.dev/',
  },
  {
    id: 'specast',
    name: 'Specast',
    kind: 'BUILDER',
    group: 'tool',
    status: 'building',
    tagline: '스펙 하나를 진실로 삼는 화면 빌더',
    blurb:
      '드래그로 화면을 짜고, 자연어로 시키고, Figma에서 가져오고, React 코드나 HTML5 임베드로 내보냅니다. 카탈로그는 어떤 프레임워크에도 기대지 않습니다.',
    tech: ['React', 'TypeScript', 'Vite', 'NestJS', 'Supabase', 'Tailwind'],
    specs: [['컴포넌트', '51종'], ['백엔드', 'NestJS'], ['구조', '모노레포 9']],
    url: 'https://specast.jubrolab.dev/',
  },
  {
    id: 'ink-arena',
    name: 'INK ARENA',
    kind: 'ACTION',
    group: 'game',
    status: 'live',
    tagline: '더 넓게 칠한 팀이 이긴다',
    blurb:
      '바닥을 잉크로 칠해 더 많은 영역을 차지한 팀이 이깁니다. 폰에서는 트윈스틱이 붙고 발사 버튼은 없앴습니다 — 엄지가 둘뿐이라.',
    tech: ['Phaser', 'TypeScript', 'Vite', 'PWA'],
    specs: [['엔진', 'Phaser 4'], ['빌드', 'Vite'], ['조작', '트윈스틱']],
    url: 'https://ink-arena.jubrolab.dev/',
  },
  {
    id: 'paperdoll',
    name: 'Paperdoll',
    kind: 'ASSET',
    group: 'tool',
    status: 'live',
    tagline: '파츠를 겹쳐 만들고 시트로 내보낸다',
    blurb:
      '레이어 파츠를 조립해 캐릭터를 만들고 색을 입힌 뒤 상태별 스프라이트 시트를 zip으로 받습니다. 원본 1,512장을 아틀라스 36장으로 굽습니다.',
    tech: ['Next.js', 'React', 'sharp'],
    specs: [['레이어', '13개'], ['프레임', '42장'], ['스택', 'sharp']],
    url: 'https://paperdoll.jubrolab.dev/',
  },
];

/* tech 는 관계도 시안이 선을 잇는 데 쓴다. 각 저장소의 실제 의존성에서 뽑았다. */
window.OG = (id) => `../public/og/${id}.png`;
window.ICON = (id) => `../public/icons/${id}.png`;
window.BADGE = { building: '준비 중', ended: '서비스 종료' };
