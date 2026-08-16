/**
 * 저장소에 OG 이미지가 없는 프로젝트의 카드를 만든다.
 *
 * 나머지는 원본 프로젝트의 파일을 그대로 복사해 `public/og/` 에 두었다.
 * 여기서 만드는 넷은 각 프로젝트의 실제 재료를 쓴다 — 없는 그림을 지어내지 않는다.
 *   - Specast        : 저장소의 브랜드 마크(네 소스가 하나의 SPEC 으로 수렴)를 확대
 *   - Vanguard       : 게임이 실제로 쓰는 Tiny Swords 타일셋 + 유닛 스프라이트 합성
 *   - Stock Analyzer : CLI 라 화면이 없어, 이 도구가 뱉는 리포트의 생김새를 축약
 *   - Koda CLI       : 화면이 터미널이라, 그 터미널을 그린다 (역할 접두사·보더 색 그대로)
 *
 * 원본 프로젝트에 opengraph-image 가 생기면 이 스크립트 대신 그 파일을 복사하면 된다.
 *
 *   npm run og
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const TOY = '/Users/jangtaegyu/Desktop/ToyProject';
const OUT = path.join(process.cwd(), 'public/og');
const W = 1200;
const H = 630;

await mkdir(OUT, { recursive: true });

/* ────────────────────────────────────────────────────────────
   Specast — 브랜드 마크 + 편집 소스 네 갈래
   ──────────────────────────────────────────────────────────── */
const VIOLET = '#8b5cf6';
const BLUE = '#3b82f6';
const GREEN = '#10b981';
const PINK = '#ec4899';

const specast = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1c1c20"/><stop offset="1" stop-color="#141417"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- 스펙 격자 -->
  <g stroke="#ffffff" stroke-opacity="0.045">
    ${Array.from({ length: 24 }, (_, i) => `<path d="M${i * 50} 0V${H}"/>`).join('')}
    ${Array.from({ length: 13 }, (_, i) => `<path d="M0 ${i * 50}H${W}"/>`).join('')}
  </g>

  <!-- 네 소스가 하나로 수렴하는 브랜드 마크 -->
  <g transform="translate(880 315)">
    <circle r="230" fill="url(#glow)"/>
    <g transform="rotate(-12)">
      <polygon points="0,0 -150,-150 150,-150" fill="${VIOLET}" opacity="0.92"/>
      <polygon points="0,0 150,-150 150,150"  fill="${BLUE}"   opacity="0.92"/>
      <polygon points="0,0 150,150 -150,150"  fill="${GREEN}"  opacity="0.92"/>
      <polygon points="0,0 -150,150 -150,-150" fill="${PINK}"  opacity="0.92"/>
      <circle r="42" fill="#ffffff"/>
      <text x="0" y="9" text-anchor="middle" font-family="ui-monospace, Menlo, monospace"
            font-size="26" font-weight="700" fill="#18181b">{ }</text>
    </g>
    <!-- 소스 라벨 -->
    <g font-family="ui-monospace, Menlo, monospace" font-size="17" letter-spacing="2.4" fill="#ffffff" opacity="0.62">
      <text x="0"   y="-192" text-anchor="middle">CANVAS</text>
      <text x="212" y="6"    text-anchor="middle">CODE</text>
      <text x="0"   y="212"  text-anchor="middle">FIGMA</text>
      <text x="-212" y="6"   text-anchor="middle">GEN UI</text>
    </g>
  </g>

  <!-- 워드마크 -->
  <g transform="translate(88 236)">
    <text font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="94"
          font-weight="700" letter-spacing="-3" fill="#fafafa">Specast</text>
    <text y="58" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="27"
          fill="#a1a1aa">spec(JSON) 단일 진실 기반 UI 빌더</text>
  </g>

  <!-- 하단 스펙 -->
  <g transform="translate(88 542)" font-family="ui-monospace, Menlo, monospace" font-size="18"
     letter-spacing="1.6" fill="#71717a">
    <text>COMPONENTS 51</text>
    <text x="196">REACT · HTML5 EXPORT</text>
    <text x="472">MONOREPO 9</text>
  </g>
  <rect x="88" y="500" width="616" height="1" fill="#ffffff" opacity="0.12"/>
</svg>`;

await sharp(Buffer.from(specast)).png().toFile(path.join(OUT, 'specast.png'));
console.log('✓ specast.png');

/* ────────────────────────────────────────────────────────────
   Chronicles of the Vanguard — 실제 타일셋 + 유닛 스프라이트 합성
   ──────────────────────────────────────────────────────────── */
const VC = path.join(TOY, 'vc-studio/assets');

// 잔디 타일: Tilemap_Flat.png 의 초록 블록 내부만 잘라 반복한다.
const TILE = 84;
const grass = await sharp(path.join(VC, 'tilesets/Tilemap_Flat.png'))
  .extract({ left: 46, top: 46, width: 96, height: 96 })
  .resize(TILE, TILE)
  .toBuffer();

// sharp 는 composite() 를 두 번 부르면 앞의 것을 덮어쓴다. 잔디는 먼저 구워둔다.
const field = await sharp({
  create: { width: W, height: H, channels: 4, background: '#7fa845' },
})
  .composite(
    Array.from({ length: Math.ceil(H / TILE) }, (_, row) =>
      Array.from({ length: Math.ceil(W / TILE) }, (_, col) => ({
        input: grass,
        left: col * TILE,
        top: row * TILE,
      })),
    ).flat(),
  )
  .png()
  .toBuffer();

// 유닛: 아이들 시트의 첫 프레임(192×192)만 뽑는다.
const frame = (file, index = 0, size = 300) =>
  sharp(path.join(VC, file))
    .extract({ left: index * 192, top: 0, width: 192, height: 192 })
    .resize(size, size, { kernel: 'nearest' })
    .toBuffer();

const [warrior, archer] = await Promise.all([
  frame('entities/units/warrior/Blue_Warrior_Idle.png', 0, 310),
  frame('entities/units/archer/Red_Archer_Idle.png', 0, 260),
]);

// 시야 안개 · 경로 · 타이틀
const overlay = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="fog" cx="0.5" cy="0.46" r="0.62">
      <stop offset="0.45" stop-color="#0b1408" stop-opacity="0"/>
      <stop offset="1"    stop-color="#0b1408" stop-opacity="0.86"/>
    </radialGradient>
    <linearGradient id="plate" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b1408" stop-opacity="0"/>
      <stop offset="0.42" stop-color="#0b1408" stop-opacity="0.82"/>
      <stop offset="1" stop-color="#0b1408" stop-opacity="0.94"/>
    </linearGradient>
  </defs>

  <!-- 타일 격자 -->
  <g stroke="#1c2b12" stroke-opacity="0.30">
    ${Array.from({ length: 15 }, (_, i) => `<path d="M${i * 84} 0V${H}"/>`).join('')}
    ${Array.from({ length: 8 }, (_, i) => `<path d="M0 ${i * 84}H${W}"/>`).join('')}
  </g>

  <!-- A* 경로: 웨이포인트를 꺾어 가는 격자 경로 -->
  <path d="M360 340 L462 340 L462 232 L714 232 L714 316 L826 316"
        fill="none" stroke="#f7e06a" stroke-width="7" stroke-linecap="round"
        stroke-dasharray="3 17" opacity="0.95"/>
  <g fill="none" stroke="#f7e06a" stroke-width="4" opacity="0.9">
    <rect x="452" y="222" width="20" height="20"/>
    <rect x="704" y="306" width="20" height="20"/>
  </g>
  <circle cx="846" cy="316" r="14" fill="none" stroke="#f7e06a" stroke-width="5" opacity="0.95"/>

  <!-- 선택 타원 -->
  <ellipse cx="301" cy="358" rx="72" ry="23" fill="none" stroke="#63c8ff" stroke-width="5" opacity="0.92"/>
  <ellipse cx="906" cy="368" rx="60" ry="19" fill="none" stroke="#ff6f5e" stroke-width="5" opacity="0.92"/>

  <!-- 시야 안개 -->
  <rect width="${W}" height="${H}" fill="url(#fog)"/>
  <rect y="330" width="${W}" height="300" fill="url(#plate)"/>

  <!-- 타이틀 -->
  <g transform="translate(600 484)" text-anchor="middle">
    <text font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="70"
          font-weight="700" letter-spacing="-1.5" fill="#f6f2e4">Chronicles of the Vanguard</text>
    <text y="48" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="26"
          fill="#c8cbb4">타일 위에서 굴러가는 2D 실시간 전략 · 맵 에디터 포함</text>
    <text y="98" font-family="ui-monospace, Menlo, monospace" font-size="18" letter-spacing="3.4"
          fill="#9aa383">A* PATHFINDING · FSM AI · FOG OF WAR · 24 UNITS</text>
  </g>
</svg>`;

const vanguard = await sharp(field)
  .composite([
    { input: warrior, left: 146, top: 128 },
    { input: archer, left: 776, top: 176 },
    { input: Buffer.from(overlay), left: 0, top: 0 },
  ])
  .png()
  .toBuffer();

await writeFile(path.join(OUT, 'vanguard.png'), vanguard);
console.log('✓ vanguard.png');

/* ────────────────────────────────────────────────────────────
   AI Stock Analyzer — 리포트 화면을 그대로 축약
   CLI 도구라 배포된 화면이 없다. 대신 이 도구가 뱉는 리포트의
   생김새(짙은 남색 카드 · 청록 강조 · 세리프 종목명)를 그대로 쓴다.
   색은 templates/report_template.html 에서 가져왔다.
   ──────────────────────────────────────────────────────────── */
const NAVY = '#0d1524';
const TEAL = '#26a69a';
const MINT = '#34d399';
const AMBER = '#fbbf24';
const RED = '#ef5350';
const DIM = '#94a3b8';

/** 점수 막대 하나. 등급 리포트의 지표 행을 흉내낸다. */
const bar = (x, y, w, label, ratio, color) => `
  <text x="${x}" y="${y}" font-family="ui-monospace, Menlo, monospace" font-size="15"
        letter-spacing="1.6" fill="${DIM}">${label}</text>
  <rect x="${x}" y="${y + 12}" width="${w}" height="9" rx="4.5" fill="#22304f"/>
  <rect x="${x}" y="${y + 12}" width="${Math.round(w * ratio)}" height="9" rx="4.5" fill="${color}"/>`;

const analyzer = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#16203a"/><stop offset="1" stop-color="#101a30"/>
    </linearGradient>
    <linearGradient id="spark" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="${TEAL}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${MINT}" stop-opacity="0.5"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  <g stroke="#ffffff" stroke-opacity="0.035">
    ${Array.from({ length: 24 }, (_, i) => `<path d="M${i * 50} 0V${H}"/>`).join('')}
    ${Array.from({ length: 13 }, (_, i) => `<path d="M0 ${i * 50}H${W}"/>`).join('')}
  </g>

  <!-- 머리말 -->
  <g font-family="ui-monospace, Menlo, monospace" font-size="17" letter-spacing="3.4" fill="${DIM}">
    <text x="72" y="82">AI STOCK ANALYZER</text>
    <text x="${W - 72}" y="82" text-anchor="end" fill="${TEAL}">PREMIUM v2.0</text>
  </g>
  <rect x="72" y="104" width="${W - 144}" height="1" fill="#22304f"/>

  <!-- 제목. 세리프는 한글 글꼴이 없어 얇게 떨어지므로 산세리프로 간다. -->
  <text x="72" y="198" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="66"
        font-weight="800" letter-spacing="-2.4" fill="#e8eaed">종목을 5분에 훑는다</text>
  <text x="72" y="252" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="25"
        fill="${DIM}">밸류에이션 · SWOT · 시나리오 · 백테스트까지 한 장으로 뽑는 리포트 생성기</text>

  <!-- 점수 카드 -->
  <rect x="72" y="316" width="640" height="212" rx="18" fill="url(#sheen)" stroke="#22304f"/>
  ${bar(108, 366, 560, 'VALUATION', 0.72, TEAL)}
  ${bar(108, 424, 560, 'TECHNICAL', 0.54, AMBER)}
  ${bar(108, 482, 560, 'FUNDAMENTAL', 0.86, MINT)}

  <!-- 등급 카드 -->
  <rect x="744" y="316" width="384" height="212" rx="18" fill="url(#sheen)" stroke="#22304f"/>
  <text x="936" y="392" text-anchor="middle" font-family="ui-monospace, Menlo, monospace"
        font-size="15" letter-spacing="3.2" fill="${DIM}">GRADE</text>
  <text x="936" y="466" text-anchor="middle" font-family="Georgia, serif" font-size="86"
        fill="${MINT}">A−</text>
  <text x="936" y="504" text-anchor="middle" font-family="ui-monospace, Menlo, monospace"
        font-size="14" letter-spacing="2.4" fill="${DIM}">BULL&#160;/&#160;BASE&#160;/&#160;BEAR</text>

  <!-- 우상단 추세선. 제목이 끝나는 x=790 부터 시작해 글자와 겹치지 않는다. -->
  <path d="M790 232 L846 200 L888 218 L938 166 L1000 186 L1060 142 L1128 118"
        fill="none" stroke="url(#spark)" stroke-width="4" stroke-linecap="round"/>
  <circle cx="1128" cy="118" r="7" fill="${MINT}"/>
  <circle cx="846" cy="200" r="5" fill="${RED}" opacity="0.8"/>
</svg>`;

await sharp(Buffer.from(analyzer)).png().toFile(path.join(OUT, 'stock-analyzer.png'));
console.log('✓ stock-analyzer.png');

/* ────────────────────────────────────────────────────────────
   Koda CLI — 터미널 화면을 그대로 축약
   이쪽도 배포된 웹 화면이 없지만, 화면 자체가 터미널이라 지어낼 것이 없다.
   역할 접두사("> " 사용자 · "● " 어시스턴트 · "⎿" 도구)와 cyan 라운드 보더,
   하단 상태줄(cwd · model · agent:mode · ~tokens)은 README §3 의 구성 그대로다.
   한글은 Menlo 에 글리프가 없어 sans 로 떨어진다. 그래서 한 줄 안에서 글꼴이
   갈리지 않도록 말은 한글로만, 도구 줄은 ASCII 로만 적었다. 접두사도 '⎿' 대신
   상자 그리기 문자를 쓴다 — 앞의 것은 Menlo 에 없어 세로 막대 하나로 떨어진다.
   ──────────────────────────────────────────────────────────── */
const MONO = 'ui-monospace, Menlo, Helvetica Neue, Helvetica, Arial, sans-serif';
const SANS = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const INK = '#0a0e16';
const CYAN = '#22d3ee';
const PAPER = '#e6edf3';
const GRAY = '#7b8698';
const LIME = '#4ade80';

/**
 * 대화 한 줄. 접두사와 본문의 색이 다르다 — 실제 화면이 그렇게 읽힌다.
 * 접두사 폭은 글자 수로 재지 않고 자리를 고정한다. '&gt;' 같은 엔티티는 글자 수가
 * 실제 폭과 다르고, 도구 줄은 한 칸 더 들어가야 대화에 딸린 것으로 읽힌다.
 */
const line = (y, prefix, prefixColor, body, bodyColor, indent = 0) => `
  <text x="${112 + indent}" y="${y}" font-family="${MONO}" font-size="23" fill="${prefixColor}">${prefix}</text>
  <text x="${150 + indent}" y="${y}" font-family="${MONO}" font-size="23"
        fill="${bodyColor}">${body}</text>`;

const koda = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#111725"/><stop offset="1" stop-color="#0b101a"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${INK}"/>
  <!-- 스캔선 대신 옅은 격자. 스캔선은 축소된 카드에서 모아레가 진다 -->
  <g stroke="#ffffff" stroke-opacity="0.032">
    ${Array.from({ length: 24 }, (_, i) => `<path d="M${i * 50} 0V${H}"/>`).join('')}
    ${Array.from({ length: 13 }, (_, i) => `<path d="M0 ${i * 50}H${W}"/>`).join('')}
  </g>

  <!-- 머리말 -->
  <g font-family="${MONO}" font-size="17" letter-spacing="3.4" fill="${GRAY}">
    <text x="72" y="80">KODA CLI</text>
    <text x="${W - 72}" y="80" text-anchor="end" fill="${CYAN}">v0.1.0 · MIT</text>
  </g>
  <rect x="72" y="102" width="${W - 144}" height="1" fill="#1e2838"/>

  <text x="72" y="184" font-family="${SANS}" font-size="62" font-weight="800"
        letter-spacing="-2.2" fill="${PAPER}">내 컴퓨터 안에서만 도는 코딩 에이전트</text>
  <text x="72" y="232" font-family="${SANS}" font-size="24" fill="${GRAY}">OpenAI 호환 백엔드 · 도구 13종 · 5단계 권한 · MCP · 서브에이전트</text>

  <!-- 터미널 — 입력창과 같은 cyan 라운드 보더 -->
  <rect x="72" y="278" width="${W - 144}" height="284" rx="18"
        fill="url(#screen)" stroke="${CYAN}" stroke-opacity="0.55" stroke-width="2"/>

  ${line(330, '&gt;', PAPER, '이 저장소 구조를 요약해줘', GRAY)}
  ${line(376, '●', CYAN, '진입점부터 봅니다.', PAPER)}
  ${line(418, '└─', GRAY, 'ls("src") → 14 dirs, 74 files', GRAY, 22)}
  ${line(456, '└─', GRAY, 'read_file("src/core/agent-loop.mjs") → 612 lines', GRAY, 22)}
  ${line(500, '●', CYAN, '에이전트 루프가 화면을 모릅니다. 떼어 써도 됩니다.', PAPER)}

  <!-- 상태줄 -->
  <rect x="72" y="524" width="${W - 144}" height="1" fill="#1e2838"/>
  <g font-family="${MONO}" font-size="18" letter-spacing="1.2" fill="${GRAY}">
    <text x="112" y="552">~/koda-cli</text>
    <text x="286" y="552">qwen3-coder:30b</text>
    <text x="530" y="552">agent:auto-edit</text>
    <text x="${W - 112}" y="552" text-anchor="end" fill="${LIME}">~18.2k (56%)</text>
  </g>
</svg>`;

await sharp(Buffer.from(koda)).png().toFile(path.join(OUT, 'koda-cli.png'));
console.log('✓ koda-cli.png');
