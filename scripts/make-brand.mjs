/**
 * jubrolab 자체 브랜드 이미지 — 파비콘과 사이트 OG 카드.
 *
 * 사이트의 두 가지 표식을 그대로 쓴다. 바탕의 격자, 그리고 하단 독.
 *   - 파비콘  : 독에서 가운데 아이콘이 커진 순간을 세 덩어리로 줄인 것
 *   - OG 카드 : 격자 위에 제목 + 프로젝트 아이콘 8개를 실제 독 모양으로 깐 것
 *
 * OG 카드는 public/icons/*.png 를 읽으므로 collect-icons.mjs 뒤에 돌린다.
 * 프로젝트 목록은 사이트와 같은 파일을 보므로 따로 맞춰줄 것이 없다.
 *
 *   npm run brand
 */
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PROJECTS } from '../data/projects.ts';

const APP = path.join(process.cwd(), 'app');
const ICONS = path.join(process.cwd(), 'public/icons');

const PAPER = '#fbfaf7';
const INK = '#15150f';
const GRID = '#e6e3d8';
const GRID_STRONG = '#d3cebc';
const MUTED = '#67655c';
const FAINT = '#9a978c';

/* ── 파비콘 ─────────────────────────────────────────────
   독에서 가운데 아이콘이 커진 순간. 32 단위 격자에 그린다.
   간격은 3 단위 — 16px 로 줄면 1.5px 가 되고, 이보다 좁으면 세 덩어리가 한 덩어리로 뭉친다.
   같은 이유로 표시등 점은 넣지 않았다. 16px 에서는 얼룩으로만 보인다. */
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="7" fill="${INK}"/>
  <g fill="${PAPER}">
    <rect x="2.5"  y="17.5" width="6"   height="7"    rx="1.6"/>
    <rect x="11.5" y="12"   width="9"   height="12.5" rx="2.4"/>
    <rect x="23.5" y="17.5" width="6"   height="7"    rx="1.6"/>
  </g>
</svg>`;

await writeFile(path.join(APP, 'icon.svg'), mark + '\n');
console.log('✓ app/icon.svg');

// iOS 홈 화면용. SVG 파비콘을 못 읽는 곳의 대비책도 겸한다.
await sharp(Buffer.from(mark), { density: 1600 })
  .resize(180, 180)
  .png()
  .toFile(path.join(APP, 'apple-icon.png'));
console.log('✓ app/apple-icon.png');

/* ── OG 카드 ───────────────────────────────────────────── */
const W = 1200;
const H = 630;

const ICON_SIZE = 84;
const ICON_GAP = 16;
const DOCK_PAD = 22;
const DOCK_W = PROJECTS.length * ICON_SIZE + (PROJECTS.length - 1) * ICON_GAP + DOCK_PAD * 2;
const DOCK_H = ICON_SIZE + DOCK_PAD * 2;
const DOCK_X = Math.round((W - DOCK_W) / 2);
const DOCK_Y = 630 - 40 - DOCK_H;

/** 아이콘이 놓일 x 좌표. 순서는 data/projects.ts 를 그대로 따른다. */
const iconX = (i) => DOCK_X + DOCK_PAD + i * (ICON_SIZE + ICON_GAP);

/** 두 자리로 맞춘다. 프로젝트가 10개를 넘어가면 '010' 이 되던 자리다. */
const pad = (n) => String(n).padStart(2, '0');

const total = pad(PROJECTS.length);
const live = pad(PROJECTS.filter((p) => p.status === 'live').length);
const games = pad(PROJECTS.filter((p) => p.group === 'game').length);
const tools = pad(PROJECTS.filter((p) => p.group === 'tool').length);

const board = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="fine" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M32 0H0V32" fill="none" stroke="${GRID}" stroke-width="1"/>
    </pattern>
    <pattern id="major" width="160" height="160" patternUnits="userSpaceOnUse">
      <path d="M160 0H0V160" fill="none" stroke="${GRID_STRONG}" stroke-width="1"/>
    </pattern>
    <radialGradient id="vignette" cx="0.5" cy="0.4" r="0.72">
      <stop offset="0.3" stop-color="${PAPER}" stop-opacity="0"/>
      <stop offset="1" stop-color="${PAPER}" stop-opacity="0.78"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  <rect width="${W}" height="${H}" fill="url(#fine)"/>
  <rect width="${W}" height="${H}" fill="url(#major)"/>
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>

  <!-- 머리말 -->
  <g font-family="ui-monospace, Menlo, monospace" font-size="17" letter-spacing="4.6" fill="${FAINT}">
    <text x="64" y="72">JUBROLAB.DEV</text>
    <text x="${W - 64}" y="72" text-anchor="end">SIDE PROJECTS · 2024 — 2026</text>
  </g>
  <rect x="64" y="94" width="${W - 128}" height="1" fill="${GRID_STRONG}"/>

  <!-- 제목 -->
  <g text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" fill="${INK}">
    <text x="${W / 2}" y="200" font-size="72" font-weight="800" letter-spacing="-2.8">아이디어를 현실로 만드는</text>
    <text x="${W / 2}" y="282" font-size="72" font-weight="800" letter-spacing="-2.8">1인 개발 연구실</text>
  </g>
  <text x="${W / 2}" y="336" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="24" fill="${MUTED}">AI · 교육 · 게임 · 개발자 도구 — 실험하고 운영하는 사이드 프로젝트 ${PROJECTS.length}개</text>

  <!-- 수치. 구분자를 본문보다 옅게 두면 이 크기에서는 사라져 단어가 붙어 보인다. 한 색으로 간다. -->
  <text x="${W / 2}" y="390" text-anchor="middle"
        font-family="ui-monospace, Menlo, monospace" font-size="16" letter-spacing="3.2" fill="${FAINT}"
        >PROJECTS&#160;${total}&#160;&#160;·&#160;&#160;LIVE&#160;${live}&#160;&#160;·&#160;&#160;GAMES&#160;${games}&#160;&#160;·&#160;&#160;TOOLS&#160;${tools}</text>

  <!-- 독 판 -->
  <rect x="${DOCK_X}" y="${DOCK_Y}" width="${DOCK_W}" height="${DOCK_H}" rx="26"
        fill="#ffffff" fill-opacity="0.86" stroke="#e2dfd5" stroke-width="1"/>
</svg>`;

const icons = await Promise.all(
  PROJECTS.map(async (project, i) => {
    // 독 아이콘과 같은 모서리 둥글기(24%)로 잘라낸다.
    const r = Math.round(ICON_SIZE * 0.24);
    const rounded = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}">
         <rect width="${ICON_SIZE}" height="${ICON_SIZE}" rx="${r}" ry="${r}" fill="#fff"/>
       </svg>`,
    );
    const input = await sharp(path.join(ICONS, `${project.id}.png`))
      .resize(ICON_SIZE, ICON_SIZE)
      .composite([{ input: rounded, blend: 'dest-in' }])
      .png()
      .toBuffer();
    return { input, left: iconX(i), top: DOCK_Y + DOCK_PAD };
  }),
);

await sharp(Buffer.from(board))
  .composite(icons)
  .png()
  .toFile(path.join(APP, 'opengraph-image.png'));
console.log('✓ app/opengraph-image.png');
