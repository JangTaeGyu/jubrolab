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
  'story-hacker': 'story-hacker/public/icons/icon-512.png',
  kiply: 'kiply/public/icon-512.png',
  specast: 'specast/marketing/app/icon.svg',
  paperdoll: 'paperdoll/src/app/icon.png',
  text2visual: 'text-to-visual/public/icon.svg',
  'token-generator': 'token-generator/public/icons/icon-384.png',
  'ticker-brief': 'ticker-brief-report/public/favicon-512.png',
  impastile: 'impastile/app/icon.svg',
  'rim-rats': 'rim-rats/assets/icon-512.png',
  // 소개 페이지가 생기면서 파비콘이 저장소 안에 들어왔다. 여기서 그리던 터미널 그림은
  // 지웠다 — 저장소가 스스로 고른 마크가 있으면 그쪽이 진짜다.
  'koda-cli': 'koda-cli/site/favicon.svg',
};

/**
 * 아이콘을 파일로 가져올 수 없는 프로젝트는 여기서 그린다.
 * stock-analyzer 는 CLI 라 앱 아이콘이 없다. 이 도구의 성격("초기 종목 발굴 및
 * 스크리닝")대로 돋보기로 그리고, 색은 리포트 템플릿의 남색·청록을 따른다.
 * 같은 주식 분야인 TickerBrief 아이콘이 막대 차트라 모티프를 일부러 다르게 뒀다.
 *
 * koda-cli 도 여기서 터미널을 그렸었다(시안 라운드 보더 = 그 도구의 입력창 색).
 * 소개 페이지가 생기며 저장소가 제 파비콘을 갖게 되어 SOURCES 로 옮겼다.
 *
 * bannerholm 은 마크가 있는데도 여기 있다 — 그 마크가 파일이 아니라
 * apps/studio/src/lib/brandMark.ts 의 문자열이고, 저장소는 app/icon.tsx 에서 구워 쓴다.
 * 그래서 도형과 색을 그 파일에서 그대로 옮겨 적었다. 진짜는 저쪽이니 마크가 바뀌면 여기도 고친다.
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
  bannerholm: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
    <rect width="32" height="32" rx="7" fill="#1b1b22"/>
    <g fill="#a5a2b6">
      <circle cx="9.4" cy="4.3" r="1.7"/>
      <rect x="8.4" y="5.6" width="2" height="21.8" rx="1"/>
    </g>
    <path d="M10.4 8H25.2L21.2 13.4L25.2 18.8H10.4Z" fill="#ecebf3"/>
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
