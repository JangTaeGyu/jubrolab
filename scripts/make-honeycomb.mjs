/**
 * 바탕 벌집의 "채운 칸" 레이어를 만든다.
 *
 * globals.css 의 .space::before 는 육각 테두리만 그린다. 그 뒤에 칸 몇 개를
 * 서로 다른 농도로 채워두면 바탕이 평평하게 죽지 않는다. 채우는 위치가 무작위라
 * 손으로 적을 수 없어 여기서 만든다.
 *
 * 타일은 이음매가 맞아야 하므로
 *   - 가로는 39(=열 간격)의 짝수 배, 세로는 45.03(=행 간격)의 정수 배로 잡고
 *   - 경계를 물고 있는 육각형은 반대쪽에도 같이 찍는다.
 * 난수는 씨앗을 고정해 돌릴 때마다 같은 그림이 나오게 한다.
 *
 *   node scripts/make-honeycomb.mjs   →  base64 를 찍어주면 globals.css 에 붙인다
 */

const SIDE = 26; // 육각형 한 변 = 테두리 타일과 같은 값
const COL = SIDE * 1.5; // 열 간격 39
const ROW = SIDE * Math.sqrt(3); // 행 간격 45.03
const HALF = ROW / 2;

const COLS = 24; // 936px — 이보다 좁으면 넓은 화면에서 반복이 보인다
const ROWS = 16; // 720.53px
const W = COLS * COL;
const H = ROWS * ROW;

/** 채울 확률과 농도. 옅은 쪽이 많고 진한 칸은 드물게 — 그래야 얼룩이 아니라 결로 읽힌다. */
const FILL_RATE = 0.22;
const LEVELS = [
  { a: 0.014, w: 10 },
  { a: 0.026, w: 6 },
  { a: 0.042, w: 3 },
  { a: 0.07, w: 1 },
];
const TOTAL_W = LEVELS.reduce((s, l) => s + l.w, 0);

/** mulberry32 — 씨앗 하나로 같은 결과를 다시 얻는다. */
function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = rng(20260808);

const hex = (cx, cy) =>
  [
    [cx - SIDE / 2, cy - HALF],
    [cx + SIDE / 2, cy - HALF],
    [cx + SIDE, cy],
    [cx + SIDE / 2, cy + HALF],
    [cx - SIDE / 2, cy + HALF],
    [cx - SIDE, cy],
  ]
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ');

/** 타일 밖으로 나간 육각형은 반대쪽 변에도 찍어야 이음매가 이어진다. */
const wraps = (cx, cy) => {
  const out = [];
  for (const dx of [-W, 0, W]) {
    for (const dy of [-H, 0, H]) {
      const x = cx + dx;
      const y = cy + dy;
      if (x + SIDE > 0 && x - SIDE < W && y + HALF > 0 && y - HALF < H) out.push([x, y]);
    }
  }
  return out;
};

const byLevel = new Map(LEVELS.map((l) => [l.a, []]));

for (let c = 0; c < COLS; c++) {
  for (let r = 0; r < ROWS; r++) {
    if (rand() > FILL_RATE) continue;
    const cx = c * COL;
    const cy = r * ROW + (c % 2 ? HALF : 0);

    let pick = rand() * TOTAL_W;
    const level = LEVELS.find((l) => (pick -= l.w) < 0) ?? LEVELS[0];

    for (const [x, y] of wraps(cx, cy)) byLevel.get(level.a).push(hex(x, y));
  }
}

const groups = [...byLevel]
  .filter(([, cells]) => cells.length)
  .map(
    ([a, cells]) =>
      `<g fill='#ffffff' fill-opacity='${a}'>${cells.map((p) => `<polygon points='${p}'/>`).join('')}</g>`,
  )
  .join('');

const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${W.toFixed(2)}' height='${H.toFixed(2)}'>${groups}</svg>`;

const filled = [...byLevel].reduce((s, [, cells]) => s + cells.length, 0);

console.log(`칸 ${COLS}×${ROWS} 중 ${filled}개 채움 · 타일 ${W.toFixed(2)}×${H.toFixed(2)}`);
console.log(`background-size: ${W.toFixed(2)}px ${H.toFixed(2)}px;`);
console.log();
console.log(`url('data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}')`);
