# JubroLab

사이드 프로젝트 열세 개를 **관계도 한 장**으로 보여주는 소개 사이트.
[jubrolab.dev](https://jubrolab.dev)

목록으로 늘어놓으면 열세 개가 서로 무관한 열세 개로 읽힌다. 같은 기술을 쓴 프로젝트끼리
선으로 이어두면 "이 사람이 무엇을 반복해서 쓰는지"가 한눈에 보인다. 그래서 첫 화면이
목록이 아니라 그래프다.

## 화면

| 자리 | 무엇 |
| --- | --- |
| 가운데 | 관계도. 프로젝트 13 + 공유 기술 11, 선 63개. 노드를 끌어 흩을 수 있다 |
| 프로젝트 노드 | 누르면 오른쪽에 상세(왜 만들었는지 · 짚어둘 것 · 스택)가 열린다 |
| 왼쪽 아래 | 기술 필터 11개. 고르면 그 기술을 쓴 프로젝트만 남는다 |
| 오른쪽 위 | 분류 필터(게임 · 도구 · 작품). 기술 필터와 함께 걸린다 |
| 오른쪽 아래 | 연락처 |

## 데이터가 한 곳이다

`data/projects.ts` 하나가 진실이다. 노드·선·개수·필터·상세 패널이 전부 여기서 나온다.

- `tech` — 관계도가 선을 잇는 공유 태그. **실제 저장소를 확인해서만 넣는다.**
  없는 관계를 지어내면 그래프가 거짓말을 한다.
- `stack` — 상세 패널에 깔리는 실제 사용 목록. `tech` 보다 자세하다.
- `SHARED_TECH` — 둘 이상이 나눠 쓴 태그만 남긴다. 하나만 쓴 기술은 관계를 만들지 못한다.
- `COUNTS` — 머리말·필터의 숫자. 손으로 세지 않는다.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npx tsc --noEmit
```

## 생성물

이미지와 배경 패턴, 기술 글리프는 손으로 고치지 않고 스크립트로 다시 굽는다.

```bash
npm run glyphs   # 기술 글리프 → data/tech-icons.ts (simple-icons + 없는 것은 직접 그림)
npm run icons    # 각 프로젝트 저장소의 앱 아이콘 → public/icons/*.png (512 정규화)
npm run og       # 저장소에 OG 이미지가 없는 넷을 만든다 → public/og/
npm run brand    # 파비콘(app/icon.svg)과 사이트 OG 카드
node scripts/make-honeycomb.mjs   # 바탕 벌집의 '채운 칸' 레이어 → globals.css 에 붙이는 base64
```

`icons` · `og` · `brand` 는 `../` 의 원본 저장소를 읽는다(경로는 `reference/DATA.md`).
그 저장소들이 없는 환경에서는 돌지 않으니, 결과물을 커밋해 둔다.

## 구조

```
app/
  page.tsx        바탕 세 겹(.hive 채운 칸 → 벌집 테두리 → .veil 어둠) + 관계도
  globals.css     색·글꼴 토큰과 바탕 패턴(SVG 를 base64 로 박아둔다)
  layout.tsx      글꼴(Space Grotesk · Gothic A1 · IBM Plex Mono)과 메타데이터
  sitemap.ts      한 장짜리라 항목도 하나
  robots.ts       전부 허용 + sitemap 주소
components/
  graph.tsx       힘 시뮬레이션 + 캔버스 렌더 + 필터 + 상세 패널
  tech-icon.tsx   기술 글리프를 <svg> 로 (필터 칩)
  brand-mark.tsx  파비콘과 같은 도형의 브랜드 마크
data/
  site.ts         배포 도메인(https://jubrolab.dev). 절대 주소는 전부 여기서 나온다
  projects.ts     프로젝트 13개와 공유 태그
  tech-icons.ts   기술 글리프의 path(생성물) — 칩(SVG)과 캔버스(Path2D)가 같은 문자열을 쓴다
design/           초기 시안 5종(정적 HTML). 05-graph 가 지금 사이트가 됐다
scripts/          생성물을 굽는 스크립트
reference/DATA.md 각 프로젝트의 주소와 로컬 저장소 경로
```

## 만들면서 정한 것

- **바탕은 무채색.** 아이콘 열세 개가 이미 모든 색을 갖고 있어서, 바탕에 컬러 빛무리를
  깔면 노드의 발광과 세기가 겹쳐 서로를 깎았다.
- **벌집은 화면 전체에.** 가운데를 마스크로 지워 관계도 자리를 비워봤더니 그 타원이
  오히려 인위적으로 보였다. 지금은 패턴을 고르게 깔고 부드러운 어둠(`.veil`) 한 겹으로
  대비만 내린다.
- **선의 밝기는 노드의 `hot` 하나로.** 호버·드래그·선택이 모두 그 값에 들어오므로,
  상세를 열어두면 그 프로젝트의 선이 계속 살아 있다.
- **선은 노드 반지름에서 끊는다.** 중심까지 그으면 유리질 기술 노드 안으로 선이 비쳐
  노드 위를 지나가는 것처럼 보인다. 그리는 순서만으로는 반투명을 가리지 못한다.
- **흔들림은 힘이 아니라 그릴 때만.** 힘으로 밀면 스프링이 물고 늘어져 배치 전체가
  천천히 떠내려간다. 물리는 그대로 수렴시키고 렌더 좌표만 ±3.6px 어긋낸다.
  `prefers-reduced-motion` 이면 넣지 않는다.
- **기술 글리프는 진짜 로고를 구워 넣는다.** 직접 그리다가 simple-icons 로 옮겼다 —
  칩과 캔버스가 같은 path 문자열을 쓰는데, 이 라이브러리가 24 상자의 `d` 하나를 그대로
  주기 때문이다(컴포넌트를 주는 react-icons · lucide 는 캔버스에서 못 쓴다). 다섯은
  여전히 직접 그린다: 로고가 없는 Phaser · LLM, 슬러그가 딴것(교육 LMS)인 Canvas,
  그리고 로고가 있어도 제 일을 못 하는 둘 — PWA 는 로고가 'PWA' 글자라 라벨 옆에서
  겹치고, Supabase 는 번개라 바로 옆 Vite 와 갈리지 않는다.

## 배포

Vercel. Next.js 는 설정 없이도 붙으므로 `vercel.json` 에는 프레임워크가 정하지 않는
것만 적는다 — `www` → 정식 도메인 리다이렉트, 보안 헤더, 그리고 이름이 고정된
`public/icons` · `public/og` 의 캐시. `/_next/static` 은 Vercel 이 알아서 영구 캐시한다.

도메인은 `data/site.ts` 한 줄이다. OG 카드 · canonical · `sitemap.xml` · `robots.txt`
가 모두 그 값을 쓴다.

## 스택

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Canvas 2D · sharp(생성물)
