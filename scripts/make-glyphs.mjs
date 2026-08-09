/**
 * 기술 글리프 굽기 — data/tech-icons.ts 를 만든다.
 *
 * 글리프는 화면 두 곳이 같은 문자열을 쓴다. 칩은 <svg>, 관계도 노드는 캔버스의 Path2D 다.
 * Path2D 는 path 의 d 문자열만 먹으므로, 아이콘을 React 컴포넌트로 주는 라이브러리
 * (react-icons · lucide)는 절반(캔버스)에서 못 쓴다. simple-icons 는 24 상자의 path
 * 문자열 하나를 그대로 주기 때문에 이 구조에 그대로 꽂힌다.
 *
 * 런타임 의존성으로 두지 않고 여기서 구워 넣는다. 화면이 켜질 때 아이콘 꾸러미를 들고 올
 * 이유가 없고, 이 저장소는 생성물을 커밋해 두는 쪽이다.
 *
 * 로고가 없는 태그는 DRAWN 에서 직접 그린다 — 뜻으로 그리는 자리다.
 * simple-icons 패키지는 CC0 지만 로고 자체는 각 사의 상표다. 여기서는 "이 기술을 쓴다"는
 * 표기로만 쓴다.
 *
 *   npm run glyphs
 */
import * as si from 'simple-icons';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PROJECTS } from '../data/projects.ts';

const OUT = path.join(process.cwd(), 'data/tech-icons.ts');
// package.json 은 simple-icons 의 exports 에 없어 import 로는 못 읽는다. 판만 알면 된다.
const VERSION = JSON.parse(
  await readFile(path.join(process.cwd(), 'node_modules/simple-icons/package.json'), 'utf8'),
).version;

/** TechTag → simple-icons 슬러그. 이름이 곧 슬러그가 아닌 것들이 있어 손으로 적는다. */
const SLUG = {
  'Next.js': 'nextdotjs',
  React: 'react',
  TypeScript: 'typescript',
  Tailwind: 'tailwindcss',
  Vite: 'vite',
  Supabase: 'supabase',
  PWA: 'pwa',
  Python: 'python',
};

/**
 * 진짜 로고를 쓰지 않는 태그. 24 상자에 면으로 그린다 — simple-icons 가 전부 실루엣이라
 * 선으로 그리면 이 몇 개만 다른 벌로 보인다.
 * 구멍(액자 안·게임패드 십자·전화기 테)은 바깥과 반대 방향으로 감아야 nonzero 에서 뚫린다.
 *
 * SLUG 보다 먼저 본다. 로고가 아예 없는 것(Phaser · LLM)과 슬러그가 딴것을 가리키는 것
 * (Canvas)뿐 아니라, 로고가 있어도 이 화면에서 제 일을 못 하는 것도 여기서 덮는다.
 */
const DRAWN = {
  /* 액자와 그 안의 그림. 브라우저에 직접 그린다는 뜻이다.
     simple-icons 의 canvas 슬러그는 교육 플랫폼(Instructure Canvas)이라 쓸 수 없다. */
  Canvas: [
    'M2.6 4.2h18.8v15.6H2.6z', // 액자 바깥 — 오른쪽·아래로 도는 시계 방향
    'M4.8 6.4v11.2h14.4V6.4z', // 액자 안 — 아래·오른쪽으로 돌아 반대 방향이라 뚫린다
    'M6.6 16.4l3.5-4.5 2.5 2.9 3-4 3 5.6z', // 산 (뚫린 자리 안이라 방향은 상관없다)
    'M9 7.9a1.5 1.5 0 100 3 1.5 1.5 0 000-3z', // 해
  ],
  /* 게임패드 — 게임 엔진이라는 뜻이 로고보다 빨리 읽힌다(Phaser 는 simple-icons 에 없다).
     노드가 작아(공유 2개) 14px 에서도 살아야 하므로 십자와 버튼 하나만 남겼다. */
  Phaser: [
    'M4 7.4h16a2.4 2.4 0 012.4 2.4v4.4a2.4 2.4 0 01-2.4 2.4H4a2.4 2.4 0 01-2.4-2.4V9.8A2.4 2.4 0 014 7.4z',
    'M6.4 11.2H4.8v1.6h1.6v1.6H8v-1.6h1.6v-1.6H8V9.6H6.4z', // 십자(구멍 — 점을 거꾸로 돈다)
    'M17 10.4a1.6 1.6 0 000 3.2 1.6 1.6 0 000-3.2z', // 버튼(구멍)
  ],
  /* 전화기에 내려받는 화살표 — 설치해서 오프라인으로 쓴다는 뜻.
     PWA 의 진짜 로고는 'PWA' 글자다. 칩에 이미 PWA 라고 적혀 있어 글자 옆에 글자가 선다. */
  PWA: [
    'M6.4 2.4h11.2v19.2H6.4z', // 전화기 바깥
    'M7.9 3.9v16.2h8.2V3.9z', // 화면(구멍 — 거꾸로 돈다)
    'M11.1 7.2h1.8v4.3h2.3L12 15.2l-3.2-3.7h2.3z', // 내려받기 화살표
  ],
  /* 원기둥 — Postgres 를 얹은 백엔드라는 뜻.
     Supabase 의 진짜 로고는 번개인데, 바로 옆 칩인 Vite 도 번개라 둘이 갈리지 않는다.
     기술 필터는 한눈에 골라야 하는 자리라 여기서는 뜻 쪽을 택했다. */
  Supabase: [
    'M12 2.4c4.3 0 7.8 1.3 7.8 2.9s-3.5 2.9-7.8 2.9-7.8-1.3-7.8-2.9S7.7 2.4 12 2.4z',
    'M4.2 8.2c1.7 1.2 4.6 1.9 7.8 1.9s6.1-.7 7.8-1.9v3.3c-1.7 1.2-4.6 1.9-7.8 1.9s-6.1-.7-7.8-1.9z',
    'M4.2 13.6c1.7 1.2 4.6 1.9 7.8 1.9s6.1-.7 7.8-1.9v5c0 1.6-3.5 2.9-7.8 2.9s-7.8-1.3-7.8-2.9z',
  ],
  /* 반짝임 둘. 생성 모델의 관용 표현이고, 로고가 아예 없는 태그다. */
  LLM: [
    'M11 2.8l1.8 4.6 4.6 1.8-4.6 1.8L11 15.6 9.2 11 4.6 9.2 9.2 7.4z',
    'M17.6 14.4l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z',
  ],
};

const tags = [...new Set(PROJECTS.flatMap((p) => p.tech))].sort();

const glyph = (tag) => {
  if (DRAWN[tag]) return { d: DRAWN[tag].join(''), from: '직접 그림' };
  const slug = SLUG[tag];
  const icon = slug && si[`si${slug[0].toUpperCase()}${slug.slice(1)}`];
  if (!icon) {
    throw new Error(
      `'${tag}' 의 글리프가 없다. simple-icons 에 있으면 SLUG 에, 없으면 DRAWN 에 그려 넣는다.`,
    );
  }
  return { d: icon.path, from: `simple-icons · ${icon.title}` };
};

const body = tags
  .map((tag) => {
    const { d, from } = glyph(tag);
    // 점이 든 태그(Next.js)만 따옴표가 필요하다. 나머지까지 씌우면 저장소의 손글씨와 달라진다.
    const key = /^[A-Za-z_$][\w$]*$/.test(tag) ? tag : `'${tag}'`;
    return `  // ${from}\n  ${key}: '${d}',`;
  })
  .join('\n');

const file = `// 이 파일은 scripts/make-glyphs.mjs 가 만든다. 손으로 고치지 않는다 — npm run glyphs.
// 로고는 simple-icons ${VERSION}(패키지 CC0, 로고는 각 사의 상표)에서 뽑고,
// 로고가 없는 태그는 같은 스크립트의 DRAWN 에서 직접 그린다.
import type { TechTag } from './projects';

/** 글리프 상자 한 변. 캔버스에서 크기를 맞출 때 나눈다. */
export const GLYPH_BOX = 24;

/**
 * 기술 태그 글리프. 24×24 상자에 그린 단색 실루엣이고, 화면 두 곳이 같은 문자열을 쓴다.
 *   - 왼쪽 아래 필터 칩 : <svg> 의 path 로 그린다
 *   - 관계도의 기술 노드 : Path2D 로 캔버스에 그린다
 * 여러 조각은 한 d 안의 서브패스로 붙어 있다 — 전부 같은 색으로 채우므로 나눌 이유가 없다.
 * 새 TechTag 를 만들면 Record 가 여기서 빠짐을 잡는다. 이건 실수가 아니라 장치다.
 */
export const TECH_ICONS: Record<TechTag, string> = {
${body}
};
`;

await writeFile(OUT, file);
console.log(`✓ data/tech-icons.ts  ←  simple-icons ${VERSION} + DRAWN ${Object.keys(DRAWN).length}개`);
console.log(`  ${tags.length}개 태그: ${tags.join(' · ')}`);
