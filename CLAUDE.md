@AGENTS.md

# JubroLab

사이드 프로젝트 열세 개를 관계도 한 장으로 보여주는 소개 사이트. 한 화면이 전부고
스크롤이 없다(`body { overflow: hidden }`). 사람이 읽을 설명은 `README.md`.

## 명령

```bash
npm run dev          # 기본 3000. 이미 떠 있으면 "Another next dev server is already running"
                     # 과 함께 그 포트를 알려주니, 새로 띄우지 말고 그 서버로 확인한다
npm run lint
npx tsc --noEmit     # 변경 후 이 둘은 항상 통과시켜 둔다
```

## 데이터가 진실이다

`data/projects.ts` 하나에서 노드·선·개수·필터·상세가 모두 나온다. 화면의 숫자를
손으로 적지 않는다 — `COUNTS` · `SHARED_TECH` 가 세어준다.

**`tech`(관계 태그)에 없는 사실을 넣지 않는다.** 태그를 더하거나 뺄 때는 `../` 의 실제
저장소(`reference/DATA.md` 에 경로)에서 `package.json` 과 소스를 확인한다. 예를 들어
"PWA" 는 웹 매니페스트만으로는 부족하고 서비스 워커까지 있어야 넣는다. `stack` 은 상세
패널용 상세 목록이라 `tech` 보다 자세하다 — 둘이 어긋나면 관계도가 거짓말을 한다.

`TechTag` 를 새로 만들면 `data/tech-icons.ts` 의 `TECH_ICONS` 가 `Record<TechTag, …>`
라서 글리프가 함께 있어야 타입이 통과한다. 이건 실수가 아니라 잊지 않게 하려는 장치다.
글리프는 손으로 그리지 않고 `npm run glyphs` 로 굽는다 — simple-icons 에 있으면
`scripts/make-glyphs.mjs` 의 `SLUG` 에 슬러그만 적고, 없으면 `DRAWN` 에 직접 그린다.

## 파일의 책임

| 파일 | 책임 |
| --- | --- |
| `components/graph.tsx` | 힘 시뮬레이션(step) · 캔버스 렌더(draw) · 입력 · 필터 · 상세 패널 |
| `data/tech-icons.ts` | **생성물.** 기술 글리프 path — 칩(`<svg>`)과 캔버스(`Path2D`)가 같은 문자열 |
| `scripts/make-glyphs.mjs` | 그 글리프를 굽는다. 로고는 simple-icons, 없는 것은 `DRAWN` |
| `app/globals.css` | 색·글꼴 토큰과 바탕 세 겹. 패턴 SVG 는 base64 로 박아둔다 |
| `app/page.tsx` | 바탕 겹치는 순서 = DOM 순서(`.hive` → `::before` 테두리 → `.veil`). 캔버스가 못 주는 글(`sr-only` 목록)과 JSON-LD |
| `data/site.ts` | 도메인·이름·소개 한 곳. OG · canonical · sitemap · robots · 메타데이터 · JSON-LD 가 전부 여기를 본다 |
| `scripts/*.mjs` | 생성물(아이콘 · OG · 파비콘 · 벌집 채운 칸)을 굽는다 |

## 이 저장소의 규칙

- **주석은 '왜'를 적는다.** 무엇을 하는지는 코드가 말한다. 한국어로, 시도해보고 버린
  선택까지 남긴다("빛무리를 넣어보니 노드 발광과 겹쳐 서로를 깎았다"). 커밋 메시지도 같다.
- **생성물은 손으로 고치지 않는다.** `public/icons` · `public/og` · `app/icon.svg` ·
  `data/tech-icons.ts` · `globals.css` 의 base64 패턴은 스크립트를 고쳐 다시 굽는다.
- **아이콘 라이브러리는 path 문자열을 주는 것만 쓴다.** 글리프는 칩(`<svg>`)과 캔버스
  (`Path2D`)가 함께 쓰는데 `Path2D` 는 `d` 문자열만 먹는다. react-icons · lucide 처럼
  컴포넌트를 주는 라이브러리는 캔버스 쪽에서 못 쓴다. 그리고 런타임 의존성으로 두지 않고
  구워 넣는다 — 화면이 켜질 때 아이콘 꾸러미를 들고 올 이유가 없다.
- **캔버스는 CSS 변수를 못 읽는다.** 그래서 `graph.tsx` 상단 `C` 에 색이 한 번 더 있다.
  `globals.css` 의 값을 바꾸면 여기도 같이 바꾼다.
- 커밋은 요청받았을 때만 하고, 서명·`Co-Authored-By` 트레일러를 넣지 않는다.

## 자주 걸리는 것

- **흔들림을 힘으로 주지 않는다.** `n.vx += sin(...)` 식으로 밀면 스프링이 물고 늘어져
  배치 전체가 천천히 떠내려간다. 물리는 수렴시키고 렌더 좌표(`ox`/`oy`)만 어긋낸다.
- **선은 노드 반지름에서 끊는다.** 기술 노드가 반투명이라, 중심까지 그으면 그리는 순서와
  무관하게 선이 노드 안으로 비친다.
- **`prefers-reduced-motion` 은 CSS 규칙이 캔버스에 닿지 않는다.** 캔버스 애니메이션은
  `matchMedia` 로 직접 확인한다.
- **`Path2D` 는 브라우저에만 있다.** `'use client'` 파일도 서버에서 한 번 렌더되므로
  `draw` 안에서 만들어 캐시한다(`glyphOf`).
- **next/font 의 한글.** Gothic A1 메타에는 `korean` 서브셋이 없어 `subsets: ['latin']`
  로 요청하지만, 구글 CSS 에 한글 unicode-range 청크가 함께 와서 필요한 것만 내려온다.
  한글 제목은 여기서 나온다 — 라틴 글꼴만 바꾸면 화면은 그대로다.
- **`compact`/`roomy` 는 두 곳에 있다.** 좁은 배치(전화기 세로·가로)는 `globals.css` 의
  `@custom-variant` 와 `graph.tsx` 의 `matchMedia` 가 같은 조건을 각각 적는다. 한쪽만 고치면
  글은 좁은 배치인데 물리는 넓은 배치로 굴러 노드가 글 밑으로 들어간다. 물리가 비워둘 위아래는
  머리말·필터 덩이를 `getBoundingClientRect` 로 재서 정한다 — 높이를 상수로 적지 않는다.
- **검색 엔진은 캔버스를 못 읽는다.** 관계도가 `<canvas>` 라 손보기 전 HTML 에는 프로젝트
  이름이 한 글자도 없었다. `page.tsx` 의 `ProjectIndex` 가 같은 `PROJECTS` 로 목록을 한 번
  더 내놓는다(`sr-only` — 화면 낭독기도 이걸 읽는다). 여기에만 있는 말을 적지 않는다 —
  화면에 없는 것을 검색 엔진에 파는 셈이 되고, 구조화 데이터도 화면과 어긋나면 무시당한다.
- **바탕 타일은 배수를 맞춘다.** 채운 칸 타일(936×720.56)은 테두리 타일(156×90.07)의
  정수배다. 어긋나면 격자가 서로 밀린다.

## 확인

화면을 바꿨으면 브라우저로 실제 확인한다. 캔버스는 픽셀을 읽어 검증하기 어렵고
(확장 프로그램의 격리된 컨텍스트에서 `getImageData` 가 비어 온다) 창 크기가 바뀌면
배치가 다시 잡히므로, 스크린샷 비교로 판단할 때는 창 크기가 같은지 함께 본다.
