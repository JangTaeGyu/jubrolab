/**
 * jubrolab 자체 브랜드 이미지 — 파비콘과 사이트 OG 카드.
 *
 * 사이트가 관계도라서 두 이미지도 관계도의 언어를 쓴다.
 *   - 파비콘  : 이어진 노드 셋. 16px 로 줄어도 덩어리가 붙지 않게 간격을 벌렸다.
 *   - OG 카드 : 짙은 남색 위에 프로젝트 10개를 원둘레에 놓고 실제 공유 기술로 선을 잇는다.
 *
 * 선은 data/projects.ts 의 tech 를 그대로 읽어 긋는다. 없는 관계를 지어내지 않는다.
 * public/icons/*.png 를 읽으므로 collect-icons.mjs 뒤에 돌린다.
 *
 *   npm run brand
 */
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PROJECTS, SHARED_TECH } from '../data/projects.ts';

const APP = path.join(process.cwd(), 'app');
const ICONS = path.join(process.cwd(), 'public/icons');

const VOID = '#080b16';
const DEEP = '#0b1020';
const BRIGHT = '#eef1f8';
const MUTED = '#9aa2bb';
const FAINT = '#626b85';
/* graph.tsx 의 C · globals.css 의 --color-* 와 같은 값이다. 셋이 어긋나면 카드와
   화면의 같은 프로젝트가 다른 색으로 나온다. */
const GROUP_COLOR = { game: '#ff7a52', tool: '#5b9bff', art: '#e07ac9' };

/* ── 파비콘 ─────────────────────────────────────────────
   가운데 큰 노드에 작은 노드 둘이 이어진 모양. 32 단위 격자에 그린다.
   16px 로 줄면 절반이 되므로 노드 사이 간격을 3 단위(=1.5px) 이상 두어야
   세 덩어리가 한 덩어리로 뭉치지 않는다. */
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="7" fill="${DEEP}"/>
  <g stroke="${BRIGHT}" stroke-width="2" stroke-linecap="round" opacity="0.5">
    <path d="M15 14 L8 23"/>
    <path d="M17 14 L25 21.5"/>
  </g>
  <g fill="${BRIGHT}">
    <circle cx="16" cy="12.5" r="6"/>
    <circle cx="7"  cy="24" r="3.6"/>
    <circle cx="25" cy="22" r="3.6"/>
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

const CX = 872;
const CY = 316;
const R_OUT = 214; // 프로젝트가 놓이는 원
const R_IN = 88; // 기술이 놓이는 원
const ICON_SIZE = 66;

const pad = (n) => String(n).padStart(2, '0');
const shared = SHARED_TECH.map((s) => s.tag);

/** 프로젝트 i 의 자리. 12시에서 시계방향. */
const projectAt = (i) => {
  const a = (i / PROJECTS.length) * Math.PI * 2 - Math.PI / 2;
  return { x: CX + Math.cos(a) * R_OUT, y: CY + Math.sin(a) * R_OUT };
};
/** 기술 태그의 자리. 안쪽 원에 고르게. 살짝 돌려 선이 겹치지 않게 한다. */
const techAt = (tag) => {
  const i = shared.indexOf(tag);
  const a = (i / shared.length) * Math.PI * 2 - Math.PI / 2 + 0.31;
  return { x: CX + Math.cos(a) * R_IN, y: CY + Math.sin(a) * R_IN };
};

const edges = PROJECTS.flatMap((p, i) =>
  p.tech
    .filter((t) => shared.includes(t))
    .map((t) => ({ from: projectAt(i), to: techAt(t), group: p.group })),
);

const total = pad(PROJECTS.length);
const live = pad(PROJECTS.filter((p) => p.status === 'live').length);
const byGroup = (g) => pad(PROJECTS.filter((p) => p.group === g).length);


/** 육각 벌집 타일. 사이트 배경(globals.css)과 같은 기하다.
    육각형은 평면을 빈틈없이 채우므로 타일 하나로 이음매가 맞는다. */
const BALL_R = 26;
const SQ3 = Math.sqrt(3);
const BALL_W = 6 * BALL_R;
const BALL_H = 2 * SQ3 * BALL_R;

const ring = (cx, cy, n, rad, rot) =>
  [...Array(n)]
    .map((_, i) => {
      const a = rot + (i * Math.PI * 2) / n;
      return `${(cx + Math.cos(a) * rad).toFixed(2)},${(cy + Math.sin(a) * rad).toFixed(2)}`;
    })
    .join(' ');

const ballCells = [];
for (let col = -1; col <= 5; col++)
  for (let row = -1; row <= 3; row++)
    ballCells.push({
      col,
      row,
      x: col * 1.5 * BALL_R,
      y: row * SQ3 * BALL_R + (((col % 2) + 2) % 2) * (SQ3 * BALL_R) / 2,
    });


const ballHexes = ballCells
  .map((c) => `<polygon points="${ring(c.x, c.y, 6, BALL_R, 0)}"/>`)
  .join('');

const board = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <!-- 색기 없는 네이비 한 겹. 사이트 배경(globals.css .space)과 같다.
         컬러 빛무리를 넣어보니 아이콘의 발광과 세기가 겹쳐 서로를 깎았다. -->
    <linearGradient id="sky" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0" stop-color="#131828"/><stop offset="0.54" stop-color="${DEEP}"/><stop offset="1" stop-color="${VOID}"/>
    </linearGradient>
    <pattern id="ball" width="${BALL_W}" height="${BALL_H.toFixed(2)}" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="#ffffff" stroke-width="1">${ballHexes}</g>
    </pattern>
    <!-- 관계도가 앉는 오른쪽만 비운다. 카드가 좌우로 갈려 있어
         가운데를 비우면 패턴이 구석에만 남아 안 보인다. -->
    <!-- SVG 마스크는 CSS 의 mask-image 와 달리 알파가 아니라 휘도로 판단한다.
         흰 곳이 보이고 검은 곳이 가려진다. 검정 스톱만 쓰면 전부 사라진다. -->
    <radialGradient id="ballfade" cx="${(CX / W).toFixed(3)}" cy="${(CY / H).toFixed(3)}" r="0.5">
      <stop offset="0.34" stop-color="#000000"/>
      <stop offset="1" stop-color="#ffffff"/>
    </radialGradient>
    <mask id="ballmask">
      <rect width="${W}" height="${H}" fill="url(#ballfade)"/>
    </mask>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>

  <!-- 육각 벌집. 가운데는 비워 관계도와 제목이 묻히지 않게 한다. -->
  <!-- 0.13 — 왼쪽 작은 모노 글자와 밝기가 겹치지 않는 선. -->
  <g mask="url(#ballmask)" opacity="0.13">
    <rect width="${W}" height="${H}" fill="url(#ball)"/>
  </g>

  <!-- 실제 공유 기술로 이은 선 -->
  <g stroke-width="1.2">
    ${edges
      .map(
        (e) =>
          `<path d="M${e.from.x.toFixed(1)} ${e.from.y.toFixed(1)} L${e.to.x.toFixed(1)} ${e.to.y.toFixed(
            1,
          )}" stroke="${GROUP_COLOR[e.group]}" stroke-opacity="0.32"/>`,
      )
      .join('')}
  </g>

  <!-- 기술 노드 -->
  ${shared
    .map((tag) => {
      const { x, y } = techAt(tag);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(
        1,
      )}" r="7" fill="#ffffff" fill-opacity="0.1" stroke="#ffffff" stroke-opacity="0.34" stroke-width="1.2"/>`;
    })
    .join('')}

  <!-- 머리말 -->
  <text x="64" y="70" font-family="ui-monospace, Menlo, monospace" font-size="16"
        letter-spacing="4.2" fill="${FAINT}">JUBROLAB.DEV</text>
  <rect x="64" y="92" width="470" height="1" fill="#ffffff" fill-opacity="0.12"/>

  <!-- 제목 -->
  <g font-family="Helvetica Neue, Helvetica, Arial, sans-serif" fill="${BRIGHT}">
    <text x="64" y="212" font-size="58" font-weight="800" letter-spacing="-2.2">아이디어를 현실로</text>
    <text x="64" y="280" font-size="58" font-weight="800" letter-spacing="-2.2">만드는 1인 개발 연구실</text>
  </g>
  <text x="64" y="336" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="21"
        fill="${MUTED}">AI · 교육 · 게임 · 개발자 도구 — 사이드 프로젝트 ${PROJECTS.length}개</text>

  <!-- 수치. 구분자를 본문보다 옅게 두면 이 크기에서는 사라져 단어가 붙어 보인다. -->
  <!-- 오른쪽 관계도에 물리지 않게 글자 폭을 좁게 잡는다. 분류가 셋이 된 뒤로 여기에
       GAMES·TOOLS·ART 를 다 적으면 관계도를 파고들어, 분류별 수는 아래 범례로 내렸다.
       색 점이 붙는 자리라 그쪽이 노드 색과 이어져 읽히기도 한다. -->
  <text x="64" y="398" font-family="ui-monospace, Menlo, monospace" font-size="14"
        letter-spacing="1.7" fill="${FAINT}"
        >PROJECTS&#160;${total}&#160;&#160;·&#160;&#160;LIVE&#160;${live}&#160;&#160;·&#160;&#160;LINKS&#160;${pad(edges.length)}</text>

  <!-- 범례 -->
  <g font-family="ui-monospace, Menlo, monospace" font-size="14" letter-spacing="1.6" fill="${FAINT}">
    <circle cx="70" cy="474" r="5" fill="${GROUP_COLOR.game}"/><text x="86" y="479">게임 ${byGroup('game')}</text>
    <circle cx="166" cy="474" r="5" fill="${GROUP_COLOR.tool}"/><text x="182" y="479">도구 ${byGroup('tool')}</text>
    <circle cx="262" cy="474" r="5" fill="${GROUP_COLOR.art}"/><text x="278" y="479">작품 ${byGroup('art')}</text>
    <circle cx="358" cy="474" r="5" fill="#ffffff" fill-opacity="0.24"/><text x="374" y="479">공유 기술 ${shared.length}</text>
  </g>
</svg>`;

const icons = await Promise.all(
  PROJECTS.map(async (project, i) => {
    const { x, y } = projectAt(i);
    const r = Math.round(ICON_SIZE / 2);
    // 원형으로 잘라 노드처럼 보이게 한다
    const round = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}">
         <circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/>
       </svg>`,
    );
    const input = await sharp(path.join(ICONS, `${project.id}.png`))
      .resize(ICON_SIZE, ICON_SIZE)
      .composite([{ input: round, blend: 'dest-in' }])
      .png()
      .toBuffer();
    return { input, left: Math.round(x - r), top: Math.round(y - r) };
  }),
);

/** 아이콘 둘레의 테. 게임은 주황, 도구는 파랑 — 사이트와 같은 규칙. */
const rings = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${PROJECTS.map((p, i) => {
    const { x, y } = projectAt(i);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${ICON_SIZE / 2 + 3}"
      fill="none" stroke="${GROUP_COLOR[p.group]}" stroke-width="2.4"/>`;
  }).join('')}
</svg>`;

await sharp(Buffer.from(board))
  .composite([...icons, { input: Buffer.from(rings), left: 0, top: 0 }])
  .png()
  .toFile(path.join(APP, 'opengraph-image.png'));
console.log('✓ app/opengraph-image.png');
