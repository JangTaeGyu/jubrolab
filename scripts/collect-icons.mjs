/**
 * 독 아이콘 수집 — 각 프로젝트의 앱 아이콘을 512×512 PNG 로 통일해 public/icons/ 에 굽는다.
 *
 * 원본이 저장소마다 다른 자리(app/icon.png · public/icons/icon-512.png · icon.svg)에 있고
 * 크기도 제각각이라, 여기서 한 번 정규화해두고 사이트는 결과물만 본다.
 * 원본 아이콘이 바뀌면 다시 돌리면 된다.
 *
 *   node scripts/collect-icons.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const TOY = '/Users/jangtaegyu/Desktop/ToyProject';
const OUT = path.join(process.cwd(), 'public/icons');
const SIZE = 512;

const SOURCES = {
  'ink-arena': 'splatoon/public/icons/icon-512.png',
  vanguard: 'vc-studio/apps/editor/public/icons/icon-512x512.png',
  'story-hacker': 'story-hacker/public/icons/icon-512.png',
  kiply: 'kiply/public/icon-512.png',
  specast: 'specast/marketing/app/icon.svg',
  paperdoll: 'paperdoll/src/app/icon.png',
  text2visual: 'text-to-visual/public/icon.svg',
  'token-generator': 'token-generator/public/icons/icon-384.png',
  'ticker-brief': 'ticker-brief-report/public/favicon-512.png',
  impastile: 'impastile/app/icon.svg',
};

/**
 * 저장소에 아이콘이 없는 프로젝트는 여기서 그린다.
 * stock-analyzer 는 CLI 라 앱 아이콘이 없다. 이 도구의 성격("초기 종목 발굴 및
 * 스크리닝")대로 돋보기로 그리고, 색은 리포트 템플릿의 남색·청록을 따른다.
 * 같은 주식 분야인 TickerBrief 아이콘이 막대 차트라 모티프를 일부러 다르게 뒀다.
 *
 * koda-cli 도 CLI 다. 이쪽은 화면이 있긴 한데 터미널이라, 그 터미널을 그린다 —
 * 시안 라운드 보더는 이 도구의 입력창이 실제로 쓰는 색이다(components/InputBox.js).
 * 프롬프트 기호는 저장소가 어시스턴트 표시로 쓰는 '●' 를 따랐다. 같은 남색 계열인
 * stock-analyzer 와는 테두리 유무와 시안으로 갈린다.
 */
const DRAWN = {
  'stock-analyzer': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#16203a"/><stop offset="1" stop-color="#0b1220"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" fill="url(#bg)"/>
    <path d="M18 34 L24 27 L29 30 L36 20" fill="none" stroke="#7dd3fc" stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="27" cy="27" r="14.5" fill="none" stroke="#34d399" stroke-width="4.5"/>
    <path d="M37.6 37.6 L49 49" stroke="#26a69a" stroke-width="6.5" stroke-linecap="round"/>
  </svg>`,

  'koda-cli': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
    <defs>
      <linearGradient id="term" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#141a24"/><stop offset="1" stop-color="#0a0e16"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="14" fill="url(#term)"/>
    <!-- 입력창 — 실제 UI 의 cyan round 보더. 아이콘이 29px 로 줄어도 이 테두리가 형태를 잡는다 -->
    <rect x="9.5" y="13.5" width="45" height="37" rx="9" fill="none" stroke="#22d3ee" stroke-width="3"/>
    <!-- 프롬프트 기호와 커서. 둘 사이를 비워야 '입력을 기다린다'로 읽힌다 -->
    <path d="M19 25.5 L26.5 32 L19 38.5" fill="none" stroke="#22d3ee" stroke-width="4"
          stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="32" y="28.5" width="13" height="7" rx="2" fill="#e8f6fb"/>
  </svg>`,
};

await mkdir(OUT, { recursive: true });

for (const [id, source] of Object.entries(SOURCES)) {
  // density 는 SVG 를 512 로 래스터화할 때만 의미가 있다. PNG 입력에서는 무시된다.
  await sharp(path.join(TOY, source), { density: 900 })
    .resize(SIZE, SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(OUT, `${id}.png`));
  console.log(`✓ ${id}.png  ←  ${source}`);
}

for (const [id, svg] of Object.entries(DRAWN)) {
  await sharp(Buffer.from(svg), { density: 900 }).resize(SIZE, SIZE).png().toFile(path.join(OUT, `${id}.png`));
  console.log(`✓ ${id}.png  ←  (직접 그림)`);
}
