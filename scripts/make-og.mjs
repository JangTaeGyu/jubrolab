/**
 * 저장소에 OG 이미지가 없는 프로젝트의 카드를 만든다.
 *
 * 나머지는 원본 프로젝트의 파일을 그대로 복사해 `public/og/` 에 두었다.
 * 여기서 만드는 둘은 각 프로젝트의 실제 재료를 쓴다 — 없는 그림을 지어내지 않는다.
 *   - Specast        : 저장소의 브랜드 마크(네 소스가 하나의 SPEC 으로 수렴)를 확대
 *   - Stock Analyzer : CLI 라 화면이 없어, 이 도구가 뱉는 리포트의 생김새를 축약
 *
 * 원본 프로젝트에 opengraph-image 가 생기면 이 스크립트 대신 그 파일을 복사하면 된다.
 * Koda CLI 가 그렇게 빠졌다 — 여기서 터미널 화면을 그렸었는데, 소개 페이지가 생기며
 * 저장소가 제 카드(`site/og.png`)를 갖게 되어 그쪽을 복사한다.
 *
 *   npm run og
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

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
