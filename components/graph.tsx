'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { COUNTS, PROJECTS, SHARED_TECH, type Project, type TechTag } from '@/data/projects';
import { GLYPH_BOX, TECH_ICONS } from '@/data/tech-icons';
import { TechIcon } from '@/components/tech-icon';
import { BrandMark } from '@/components/brand-mark';

/* ── 색 ───────────────────────────────────────────────
   globals.css 와 같은 값. 캔버스는 CSS 변수를 못 읽어 여기서 다시 적는다. */
const C = {
  game: '#ff7a52',
  tool: '#5b9bff',
  /* 셋 다 중간 채널이 0x7a 대라 나란히 놓아도 한 벌로 읽힌다. 색상환에서 파랑 반대편에
     둔 이유는 도구가 여섯 개로 가장 큰 무리라서다 — 가장 큰 무리와 헷갈리는 쪽이
     제일 손해다. 주황(게임 넷)과는 60° 밖에 안 떨어지지만 밝기와 채도가 갈라준다. */
  art: '#e07ac9',
  tech: '#8f9ac4',
  bright: '#eef1f8',
  muted: '#9aa2bb',
  faint: '#626b85',
  glass: 'rgba(255,255,255,0.05)',
};

type NodeBase = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 넓은 화면에서의 반지름. 좁은 화면에서는 여기에 배율을 곱해 r 을 다시 잡는다. */
  baseR: number;
  r: number;
  /** 강조 정도(0~1). 호버·선택에 따라 부드럽게 따라간다. */
  hot: number;
  /** 흐림 정도(0~1). 필터에 걸리지 않은 것. */
  dim: number;
  want: number;
  /** 제자리 흔들림의 위상과 속도. 노드마다 달라야 숨쉬듯 보이고, 같으면 화면이 통째로 밀린다. */
  phase: number;
  sway: number;
  /** 흔들림으로 생긴 그릴 때의 어긋남. 물리 좌표(x·y)는 건드리지 않는다. */
  ox: number;
  oy: number;
};
type ProjectNode = NodeBase & { kind: 'p'; project: Project; img: HTMLImageElement };
type TechNode = NodeBase & { kind: 't'; tag: TechTag; count: number };
type Node = ProjectNode | TechNode;

const STATUS: Record<Project['status'], { label: string; color: string }> = {
  live: { label: '운영 중', color: '#5be49b' },
  building: { label: '준비 중', color: '#ffc14d' },
  ended: { label: '서비스 종료', color: '#ff7a7a' },
};

/** 분류별 색·표기. 둘일 때는 삼항으로 갈랐는데, 셋이 되니 늘 하나가 조용히 빠졌다. */
const GROUP: Record<Project['group'], { label: string; badge: string; color: string }> = {
  game: { label: '게임', badge: 'GAME', color: C.game },
  tool: { label: '도구', badge: 'TOOL', color: C.tool },
  art: { label: '작품', badge: 'ART', color: C.art },
};

export function Graph() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TechTag | null>(null);
  /** 분류 필터(게임·도구). 기술 필터와 함께 걸린다 — 둘 다 만족하는 것만 남는다. */
  const [group, setGroup] = useState<Project['group'] | null>(null);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);

  /* 시뮬레이션 상태는 렌더와 무관하게 굴러가므로 전부 ref 에 둔다. */
  const nodes = useRef<Node[]>([]);
  const links = useRef<{ a: Node; b: Node }[]>([]);
  const held = useRef<Node | null>(null);
  const hover = useRef<Node | null>(null);
  const picked = useRef<string | null>(null);
  const grab = useRef({ x: 0, y: 0 });
  const moved = useRef(0);
  const size = useRef({ w: 0, h: 0 });
  /* 노드가 놓일 수 있는 자리. 좁은 화면에서는 머리말·필터가 화면 폭을 가로지르므로
     그만큼을 재서 빼둔다 — 넓은 화면에서는 둘 다 구석에만 있어 여백만 주면 된다. */
  const frame = useRef({ top: 56, bottom: 76, side: 10, compact: false });
  const intro = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  const open = useCallback((id: string | null) => {
    picked.current = id;
    setOpenId(id);
  }, []);

  /* ── 그래프 만들기 (한 번) ───────────────────────── */
  useEffect(() => {
    const built: Node[] = [];
    /** 흔들림은 노드마다 위상과 속도가 달라야 한다. 60fps 에서 한 바퀴가 대략 7~12초. */
    const idle = () => ({
      phase: Math.random() * Math.PI * 2,
      sway: 0.0085 + Math.random() * 0.006,
      ox: 0,
      oy: 0,
    });

    PROJECTS.forEach((project) => {
      const img = new Image();
      img.src = project.icon;
      built.push({
        kind: 'p',
        project,
        img,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        baseR: 29,
        r: 29,
        hot: 0,
        dim: 0,
        want: 0,
        ...idle(),
      });
    });
    SHARED_TECH.forEach(({ tag, count }) =>
      built.push({
        kind: 't',
        tag,
        count,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        baseR: 10 + Math.min(11, count * 1.9),
        r: 10 + Math.min(11, count * 1.9),
        hot: 0,
        dim: 0,
        want: 0,
        ...idle(),
      }),
    );

    const byId = (id: string) =>
      built.find((n) => (n.kind === 'p' ? n.project.id === id : false))!;
    const byTag = (tag: TechTag) => built.find((n) => n.kind === 't' && n.tag === tag)!;

    const edges: { a: Node; b: Node }[] = [];
    PROJECTS.forEach((p) =>
      p.tech.forEach((t) => {
        if (!SHARED_TECH.some((s) => s.tag === t)) return;
        edges.push({ a: byId(p.id), b: byTag(t) });
      }),
    );

    nodes.current = built;
    links.current = edges;

    // 원둘레에 뿌려 시작한다. 무작위로 두면 첫 몇 초가 지저분하다.
    const w = window.innerWidth, h = window.innerHeight;
    built.forEach((n, i) => {
      const a = (i / built.length) * Math.PI * 2;
      n.x = w / 2 + Math.cos(a) * Math.min(w, h) * 0.3;
      n.y = h / 2 + Math.sin(a) * Math.min(w, h) * 0.3;
    });
  }, []);

  /* ── 필터 ──────────────────────────────────────────
     기술(왼쪽 아래)과 분류(오른쪽 아래) 두 축이 동시에 걸린다. 기술 노드는 자기 이름이
     걸렸거나 남은 프로젝트와 이어져 있으면 남는다 — 아니면 매달린 선이 허공을 가리킨다. */
  useEffect(() => {
    const near = (n: Node, test: (other: Node) => boolean) =>
      links.current.some((l) => (l.a === n && test(l.b)) || (l.b === n && test(l.a)));

    nodes.current.forEach((n) => {
      const byTech =
        !filter ||
        (n.kind === 't'
          ? n.tag === filter
          : near(n, (o) => o.kind === 't' && o.tag === filter));
      const byGroup =
        !group ||
        (n.kind === 'p'
          ? n.project.group === group
          : near(n, (o) => o.kind === 'p' && o.project.group === group));

      n.want = byTech && byGroup ? 0 : 1;
    });
  }, [filter, group]);

  /* ── 루프 ────────────────────────────────────────── */
  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let dpr = 1;
    /* 흔들림의 시계. 프레임을 센다 — 흔들림 폭이 프레임 시간에 걸리지 않아도 되는 정도로 느리다. */
    let tick = 0;
    // 모션을 줄이라는 설정이면 제자리 흔들림을 아예 넣지 않는다. CSS 쪽 규칙은 캔버스에 닿지 않는다.
    const stillness = matchMedia('(prefers-reduced-motion: reduce)');
    // globals.css 의 compact 와 같은 조건. 배치가 갈리는 지점에서 물리도 같이 갈려야 한다.
    const tight = matchMedia('(max-width: 639.98px), (max-height: 559.98px)');

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      size.current = { w: innerWidth, h: innerHeight };
      cv.width = innerWidth * dpr;
      cv.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* 좁은 배치에서는 머리말과 필터가 화면 폭을 가로지른다. 그 높이를 상수로 적어두면
         문구 한 줄만 늘어도 노드가 글 밑으로 들어가므로, 실제로 그려진 두 덩이를 재서 뺀다. */
      const compact = tight.matches;
      const introBottom = intro.current?.getBoundingClientRect().bottom;
      const barTop = bar.current?.getBoundingClientRect().top;
      const box = compact
        ? {
            top: (introBottom ?? 150) + 14,
            bottom: innerHeight - (barTop ?? innerHeight - 84) + 12,
            side: 12,
            compact,
          }
        : { top: 56, bottom: 76, side: 10, compact };
      frame.current = box;

      /* 자리가 좁으면 프로젝트 노드를 줄인다. 스물한 개가 겹치지 않으려면 저마다 (지름+여백)²
         만큼의 자리가 있어야 하는데, 모자라면 스프링이 밀치기를 이겨 노드가 서로 파고든다.
         65만은 노드를 줄이지 않아도 되는 자리의 넓이 — 노트북 화면이 그 한 배 반쯤 된다.
         폭이 아니라 넓이로 가른다. 가로로 누운 전화기는 폭만 보면 넉넉해 보이지만 높이가 없다.
         기술 노드는 이미 작아 그대로 둔다 — 더 줄이면 글리프가 원 밖으로 넘친다. */
      const room = (innerWidth - box.side * 2) * (innerHeight - box.top - box.bottom);
      const k = Math.max(0.5, Math.min(1, Math.sqrt(room / 650_000)));
      nodes.current.forEach((n) => {
        n.r = n.kind === 'p' ? n.baseR * k : n.baseR;
      });
    };
    resize();
    addEventListener('resize', resize);
    // 글꼴이 늦게 오면 제목 덩이의 높이가 달라진다. 그 뒤에 한 번 더 재야 자리가 맞다.
    document.fonts?.ready.then(resize);

    const step = () => {
      const { w, h } = size.current;
      const { top, bottom, side, compact } = frame.current;
      const list = nodes.current;
      const boxW = w - side * 2;
      const boxH = h - top - bottom;
      /* 상세가 열리면 패널이 오른쪽을 덮으므로 무게중심을 왼쪽으로 옮긴다.
         좁은 화면에서는 패널이 화면을 통째로 덮어 옮길 자리가 없다. */
      const cx = w / 2 - (picked.current && !compact ? Math.min(200, w * 0.16) : 0);
      // 넓은 화면의 +26 은 왼쪽 위 제목과 균형을 맞추려고 준 손보정이다.
      const cy = top + boxH / 2 + (compact ? 0 : 36);
      /* 힘의 거리를 '남은 자리'의 넓이에 맞춘다. min(w,h) 로 재면 세로로 긴 화면에서 폭만
         보고 좁다고 판단해, 세로로 남는 자리를 못 쓴 채 뭉친다.
         0.72 아래로는 내리지 않는다. 이 값이 선의 길이(205×spread)까지 같이 줄이는데, 기술
         노드 하나에 매달린 아홉 개가 앉을 둘레가 모자라면 스프링이 밀치기를 이겨 노드가
         서로 파고든다. 자리가 그보다 좁으면 선 대신 노드를 줄인다(resize 의 k). */
      const spread = Math.max(0.72, Math.min(1.5, Math.sqrt(boxW * boxH) / 1100));
      /* 세로로 긴 자리에서는 한 점이 아니라 세로 선분으로 당긴다. 점으로 당기면 뭉치는 모양이
         늘 원이라, 폭에 눌려 노드끼리 겹치는데 위아래로는 자리가 남는다. 선분의 길이는
         자리의 세로가 가로보다 남는 만큼 — 가로로 긴 화면에서는 0 이 되어 예전 그대로다. */
      const span = Math.max(0, (boxH - boxW) / 2);

      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i], b = list[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 0.01;
          const min = a.r + b.r + 62 * spread;
          if (d < min) {
            const f = ((min - d) / d) * 0.14;
            if (a !== held.current) { a.x -= dx * f; a.y -= dy * f; }
            if (b !== held.current) { b.x += dx * f; b.y += dy * f; }
          } else if (d < 720 * spread) {
            const f = (1100 * spread) / (d * d);
            if (a !== held.current) { a.vx -= (dx / d) * f; a.vy -= (dy / d) * f; }
            if (b !== held.current) { b.vx += (dx / d) * f; b.vy += (dy / d) * f; }
          }
        }
      }

      links.current.forEach((l) => {
        const dx = l.b.x - l.a.x, dy = l.b.y - l.a.y;
        const d = Math.hypot(dx, dy) || 0.01;
        const f = (d - 205 * spread) * 0.0038;
        if (l.a !== held.current) { l.a.vx += (dx / d) * f; l.a.vy += (dy / d) * f; }
        if (l.b !== held.current) { l.b.vx -= (dx / d) * f; l.b.vy -= (dy / d) * f; }
      });

      tick++;

      list.forEach((n) => {
        /* 제자리 흔들림. 힘으로 밀면 스프링이 그걸 물고 늘어져 배치 전체가 천천히 떠내려간다 —
           그래서 물리는 그대로 수렴시키고, 그릴 때만 어긋나게 한다. 폭이 정확히 ±3px 로 묶인다.
           x·y 의 주기를 어긋나게 두면 원이 아니라 8자로 떠돈다. */
        if (!stillness.matches) {
          n.ox = Math.cos(tick * n.sway + n.phase) * 3.6;
          n.oy = Math.sin(tick * n.sway * 0.83 + n.phase * 1.7) * 3.6;
        }

        if (n !== held.current) {
          n.vx += (cx - n.x) * 0.0006;
          n.vy += (Math.max(cy - span, Math.min(cy + span, n.y)) - n.y) * 0.0006;
          n.vx *= 0.86;
          n.vy *= 0.86;
          n.x += n.vx;
          n.y += n.vy;
          n.x = Math.max(n.r + side, Math.min(w - n.r - side, n.x));
          n.y = Math.max(n.r + top, Math.min(h - n.r - bottom, n.y));
        }
        const isPicked = n.kind === 'p' && n.project.id === picked.current;
        n.dim += (n.want - n.dim) * 0.12;
        n.hot += ((n === hover.current || n === held.current || isPicked ? 1 : 0) - n.hot) * 0.2;
      });

      draw(ctx, size.current, nodes.current, links.current);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', resize);
    };
  }, []);

  /* ── 입력 ────────────────────────────────────────── */
  const at = (x: number, y: number) =>
    nodes.current.find((n) => Math.hypot(n.x - x, n.y - y) < n.r + 7) ?? null;

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const n = at(e.clientX, e.clientY);
    if (!n) return open(null);
    held.current = n;
    moved.current = 0;
    grab.current = { x: e.clientX - n.x, y: e.clientY - n.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const n = held.current ?? at(e.clientX, e.clientY);
    hover.current = n;
    setHoverLabel(n ? (n.kind === 'p' ? n.project.name : `${n.tag} · ${n.count}개가 함께 씀`) : null);
    e.currentTarget.style.cursor = n ? (held.current ? 'grabbing' : 'grab') : 'default';
    if (!held.current) return;
    moved.current += Math.abs(e.movementX) + Math.abs(e.movementY);
    held.current.x = e.clientX - grab.current.x;
    held.current.y = e.clientY - grab.current.y;
    held.current.vx = held.current.vy = 0;
  };

  const onPointerUp = () => {
    const n = held.current;
    held.current = null;
    if (!n || moved.current > 5) return;
    // 끌지 않고 눌렀을 때만 반응한다
    if (n.kind === 'p') open(n.project.id);
    else setFilter((f) => (f === n.tag ? null : n.tag));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && open(null);
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open]);

  const project = PROJECTS.find((p) => p.id === openId) ?? null;

  return (
    <>
      <canvas
        ref={canvas}
        className="block h-full w-full touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />

      {/* 머리말 */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-10 flex items-center justify-between gap-4 px-5 py-3.5 roomy:px-7">
        <p className="flex items-center gap-2 font-display text-[15px] font-bold tracking-[-0.03em]">
          <BrandMark className="size-[19px] shrink-0" />
          {/* 자국 하나로 묶는다 — flex 자식으로 흩어지면 gap 이 글자 사이에도 들어간다.
              400 아래에서는 이름을 접는다. 분류 칩 셋과 나란히 서면 줄이 넘쳐 칩이 잘린다. */}
          <span className="max-[400px]:hidden">JubroLab</span>
        </p>

        {/* 분류 필터. 왼쪽 아래 기술 칩과 같은 모양이라 둘이 같은 종류의 조작으로 읽힌다.
            범례였던 자리라 색 점을 그대로 남겨 노드 색과 이어준다. 기술은 프로젝트 분류가
            아니므로 세는 칸으로만 두고 누르지 않는다 — 걸 것이 왼쪽에 이미 열 개 있다.
            머리말이 pointer-events-none 이라 여기만 다시 켠다.
            좁은 화면에서는 줄바꿈을 막는다 — 두 줄이 되면 바로 아래 제목을 덮는다. */}
        <div className="pointer-events-auto flex shrink-0 flex-nowrap justify-end gap-1.5 roomy:flex-wrap">
          {(Object.keys(GROUP) as Project['group'][]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={group === key}
              onClick={() => setGroup((g) => (g === key ? null : key))}
              className={`flex items-center gap-1.5 rounded-full border py-1.5 pr-2.5 pl-2 font-mono text-[10.5px] tracking-[0.06em] backdrop-blur-md transition roomy:pr-3 roomy:pl-2.5 ${
                group === key
                  ? 'border-bright bg-bright text-void'
                  : 'border-edge bg-glass text-muted hover:border-white/35 hover:text-bright'
              }`}
            >
              <i
                className="size-2 shrink-0 rounded-full"
                style={{ background: GROUP[key].color }}
              />
              {GROUP[key].label} <span className="opacity-55">{COUNTS[key]}</span>
            </button>
          ))}
          {/* 세기만 하는 칸이라 자리가 모자란 좁은 화면에서 가장 먼저 접는다. */}
          <p className="hidden items-center gap-1.5 rounded-full border border-transparent py-1.5 pr-3 pl-2.5 font-mono text-[10.5px] tracking-[0.06em] text-faint roomy:flex">
            <i className="size-2 shrink-0 rounded-full" style={{ background: C.tech }} />
            기술 <span className="opacity-55">{SHARED_TECH.length}</span>
          </p>
        </div>
      </header>

      {/* 제목이 커지면서 한 줄이 36ch 를 넘겼다. 제목은 넓게 두고 설명만 36ch 로 묶는다.
          52vw 는 오른쪽 관계도에 자리를 내주려는 값인데, 좁은 화면에는 내줄 오른쪽이 없다 —
          거기서 폭을 반으로 묶으면 제목이 '만/드는' 으로 끊긴다. */}
      <div
        ref={intro}
        className="pointer-events-none fixed top-14 left-5 z-10 max-w-[min(60ch,92vw)] roomy:top-16 roomy:left-8 roomy:max-w-[min(60ch,52vw)]"
      >
        <h1 className="font-display text-[clamp(24px,3.1vw,42px)] leading-[1.06] font-black tracking-[-0.04em]">
          아이디어를 현실로 만드는
          <br />1인 개발 연구실
        </h1>
        {/* ch 는 이 요소의 글자 크기(13px)를 따르므로 제목 쪽 값보다 넉넉히 준다.
            좁은 화면에서는 이 문단이 네 줄이 되어 관계도의 자리를 그만큼 먹는다. 같은 말을
            줄여 두 줄로 앉힌다 — '끌어 흩어보기' 는 손가락으로 하면 설명 없이도 알게 된다. */}
        <p className="mt-3 max-w-[46ch] text-[12.5px] leading-[1.8] text-muted short:hidden roomy:hidden">
          같은 기술을 쓴 프로젝트끼리 이어져 있습니다. 아래에서 기술을 골라 걸러보세요.
        </p>
        <p className="mt-3.5 hidden max-w-[46ch] text-[13px] leading-[1.85] text-muted roomy:block">
          같은 기술을 쓴 프로젝트끼리 이어져 있습니다. 노드를 끌어 흩어보고, 아래에서 기술을 골라
          걸러보세요. 프로젝트를 누르면 자세히 나옵니다.
        </p>
      </div>

      {/* 커서 옆 이름표 */}
      {hoverLabel && (
        <p className="pointer-events-none fixed bottom-[92px] left-1/2 z-10 -translate-x-1/2 rounded-full border border-edge bg-panel/90 px-3.5 py-1.5 font-mono text-[11px] tracking-[0.04em] text-bright backdrop-blur-md">
          {hoverLabel}
        </p>
      )}

      {/* 아래 띠 — 기술 필터와 연락처. 넓은 화면에서는 양 끝으로 갈라져 가운데를 관계도에
          내주고, 좁은 화면에서는 세로로 쌓인다. 둘을 한 덩이로 묶어야 물리가 뺄 높이를
          한 번에 잴 수 있다(frame.bottom). */}
      <div
        ref={bar}
        className="pointer-events-none fixed inset-x-0 bottom-5 z-10 flex flex-col-reverse gap-2.5 px-5 roomy:bottom-6 roomy:flex-row roomy:items-end roomy:justify-between roomy:gap-8 roomy:px-8"
      >
        {/* 좁은 화면에서는 열 개가 네 줄로 쌓여 화면의 삼분의 일을 먹었다. 한 줄로 눕히고
            옆으로 밀어 보게 한다 — 양옆 여백까지 넘겨(-mx-5) 잘린 칩이 더 있다고 알려준다. */}
        <div className="pointer-events-auto -mx-5 flex gap-1.5 overflow-x-auto px-5 [scrollbar-width:none] roomy:mx-0 roomy:max-w-[min(620px,58vw)] roomy:flex-wrap roomy:overflow-visible roomy:px-0">
          {SHARED_TECH.map(({ tag, count }) => (
            <button
              key={tag}
              type="button"
              onClick={() => setFilter((f) => (f === tag ? null : tag))}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border py-1.5 pr-3 pl-2.5 font-mono text-[10.5px] tracking-[0.06em] backdrop-blur-md transition ${
                filter === tag
                  ? 'border-bright bg-bright text-void'
                  : 'border-edge bg-glass text-muted hover:border-white/35 hover:text-bright'
              }`}
            >
              <TechIcon tag={tag} className="size-3.5 shrink-0" />
              {tag} <span className="opacity-55">{count}</span>
            </button>
          ))}
        </div>

        {/* 연락처. 주소만 덩그러니 두면 무엇을 하라는 말인지 없어서 한 줄 붙였다.
            한글은 본문 글꼴로 읽고 주소는 모노로 — 읽는 것과 누르는 것을 구분한다.
            좁은 화면에서는 그 한 줄을 접는다. 주소 하나면 무엇인지는 보인다. */}
        <div className="pointer-events-auto shrink-0 text-right">
          <p className="hidden text-[12px] leading-[1.6] text-faint roomy:block">
            궁금한 사항은 여기로 문의 주세요
          </p>
          <a
            href="mailto:ttggbbgg2@gmail.com"
            className="mt-0.5 inline-block font-mono text-[11px] tracking-[0.06em] text-muted transition hover:text-bright"
          >
            ttggbbgg2@gmail.com
          </a>
        </div>
      </div>

      {project && <Detail project={project} onClose={() => open(null)} onTech={setFilter} />}
    </>
  );
}

/* ── 상세 패널 ──────────────────────────────────────── */

function Detail({
  project,
  onClose,
  onTech,
}: {
  project: Project;
  onClose: () => void;
  onTech: (t: TechTag) => void;
}) {
  const status = STATUS[project.status];

  /* 좁은 화면에서는 94vw 가 관계도를 손가락 하나 폭만 남기고 덮는다 — 어중간하게
     남기느니 화면을 다 쓰고 ×로 닫게 한다. */
  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label={`${project.name} 상세`}
      className="fixed inset-y-0 right-0 z-20 w-full max-w-none overflow-y-auto border-l border-edge bg-panel/92 px-5 pt-6 pb-12 backdrop-blur-2xl [animation:slide-in_.34s_cubic-bezier(.22,.8,.28,1)_both] roomy:w-[456px] roomy:max-w-[94vw] roomy:px-7"
    >
      {/* 카드 이미지 위에 놓이는 자리라 글자 하나만 두면 밝은 그림에서 사라진다. 좁은 화면에서는
          패널이 화면을 다 덮어 바깥을 눌러 닫을 수도 없으니, 어둠 한 겹을 깔아 늘 보이게 한다. */}
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute top-5 right-6 z-10 flex size-8 items-center justify-center rounded-full bg-void/60 text-[20px] leading-none text-bright/75 backdrop-blur-sm transition hover:bg-void/85 hover:text-bright"
      >
        ×
      </button>

      <div className="relative aspect-1200/630 w-full overflow-hidden rounded-xl bg-white/5">
        {/* 이 이미지는 장식이라 next/image 의 최적화가 필요 없다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={project.og} alt="" className="h-full w-full object-cover" />
      </div>

      <p className="mt-5 flex items-center gap-2.5 font-mono text-[10px] tracking-[0.2em] text-faint">
        {project.kind}
        <span className="text-white/15">/</span>
        {GROUP[project.group].badge}
        <span className="ml-auto flex items-center gap-1.5" style={{ color: status.color }}>
          <i className="inline-block size-1.5 rounded-full" style={{ background: status.color }} />
          {status.label}
        </span>
      </p>

      <h2 className="mt-2.5 font-display text-[27px] leading-[1.1] font-bold tracking-[-0.035em]">
        {project.name}
      </h2>
      <p className="mt-1.5 text-[13.5px] text-muted">{project.tagline}</p>

      <p className="mt-5 text-[13.5px] leading-[1.9] text-bright/85">{project.blurb}</p>

      <Section title="이렇게 만든 이유">
        <p className="text-[13px] leading-[1.95] text-muted">{project.story}</p>
      </Section>

      <Section title="짚어둘 것">
        <ul className="space-y-2.5">
          {project.notes.map((note) => (
            <li key={note} className="flex gap-2.5 text-[12.5px] leading-[1.8] text-muted">
              <span className="mt-[9px] size-1 shrink-0 rounded-full bg-white/30" />
              {note}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="기술 스택">
        <dl className="space-y-3">
          {project.stack.map(({ area, items }) => (
            <div key={area} className="grid grid-cols-[76px_1fr] gap-3">
              <dt className="pt-1 font-mono text-[10px] tracking-[0.1em] text-faint">{area}</dt>
              <dd className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-edge-soft bg-white/[0.04] px-2 py-1 font-mono text-[10.5px] text-bright/80"
                  >
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="다른 프로젝트와 겹치는 것">
        <div className="flex flex-wrap gap-1.5">
          {project.tech.map((tag) => {
            const shared = SHARED_TECH.find((s) => s.tag === tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onTech(tag)}
                className="rounded-full border border-edge bg-glass px-2.5 py-1 font-mono text-[10.5px] text-muted transition hover:border-white/35 hover:text-bright"
              >
                {tag}
                {shared && <span className="ml-1.5 opacity-55">{shared.count}</span>}
              </button>
            );
          })}
        </div>
        <p className="mt-3 font-mono text-[10px] tracking-[0.06em] text-faint">
          누르면 그 기술을 쓴 프로젝트만 관계도에 남습니다
        </p>
      </Section>

      <div className="mt-8 space-y-2">
        {project.status === 'live' && project.url ? (
          <>
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-bright py-3.5 font-display text-[13px] font-semibold tracking-[0.03em] text-void transition hover:opacity-90"
            >
              열어보기 <span aria-hidden="true">↗</span>
            </a>
            {project.secondary && (
              <a
                href={project.secondary.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center rounded-full border border-edge py-3 font-mono text-[11.5px] tracking-[0.08em] text-muted transition hover:border-white/35 hover:text-bright"
              >
                {project.secondary.label}
              </a>
            )}
          </>
        ) : (
          <p className="flex items-center justify-center rounded-full border border-edge py-3.5 font-display text-[13px] font-semibold tracking-[0.03em] text-faint">
            {project.status === 'ended' ? '서비스를 종료했습니다' : '아직 만드는 중입니다'}
          </p>
        )}
        {project.url && (
          <p className="pt-1 text-center font-mono text-[10.5px] text-faint">
            {project.url.replace('https://', '').replace(/\/$/, '')}
          </p>
        )}
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7 border-t border-edge-soft pt-5">
      <h3 className="mb-3.5 font-mono text-[10px] tracking-[0.2em] text-faint">{title}</h3>
      {children}
    </section>
  );
}

/* ── 캔버스 ─────────────────────────────────────────── */

function draw(
  ctx: CanvasRenderingContext2D,
  size: { w: number; h: number },
  nodes: Node[],
  links: { a: Node; b: Node }[],
) {
  ctx.clearRect(0, 0, size.w, size.h);

  // 선. 프로젝트 쪽 색을 따라간다. 밝아지는 기준은 노드의 hot 하나로 모았다 —
  // hot 은 호버·드래그·선택을 모두 담으므로, 상세를 열어두면 그 프로젝트의 선이 계속 살아 있다.
  links.forEach((l) => {
    const live = Math.max(l.a.hot, l.b.hot);
    const dim = Math.max(l.a.dim, l.b.dim);
    const base = l.a.kind === 'p' ? GROUP[l.a.project.group].color : C.tool;
    ctx.globalAlpha = (0.3 + live * 0.62) * (1 - dim * 0.88);
    ctx.strokeStyle = live > 0.5 ? C.bright : base;
    ctx.lineWidth = 1 + live * 0.9;
    /* 노드 반지름에서 끊는다. 중심까지 그으면 기술 노드의 유리질 안으로 선이 비쳐
       노드 위를 지나가는 것처럼 보인다 — 그릴 순서만으로는 반투명을 못 가린다.
       테두리 링(프로젝트는 r+4)까지 물러서야 선이 노드 뒤로 들어가는 것으로 읽힌다. */
    const edge = (n: Node) => n.r * (1 + n.hot * 0.1) + (n.kind === 'p' ? 5 : 1);
    const ax = l.a.x + l.a.ox;
    const ay = l.a.y + l.a.oy;
    const bx = l.b.x + l.b.ox;
    const by = l.b.y + l.b.oy;
    const dx = bx - ax;
    const dy = by - ay;
    const d = Math.hypot(dx, dy) || 1;
    const ra = edge(l.a);
    const rb = edge(l.b);
    if (d <= ra + rb) return; // 두 노드가 붙어 있으면 그릴 선이 남지 않는다

    ctx.beginPath();
    ctx.moveTo(ax + (dx / d) * ra, ay + (dy / d) * ra);
    ctx.lineTo(bx - (dx / d) * rb, by - (dy / d) * rb);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  nodes.forEach((n) => {
    const fade = 1 - n.dim * 0.86;
    const r = n.r * (1 + n.hot * 0.1);
    // 흔들림을 여기서만 더한다. 집는 판정(at)은 물리 좌표를 보므로 3px 은 티가 안 난다.
    const x = n.x + n.ox;
    const y = n.y + n.oy;
    ctx.globalAlpha = fade;

    if (n.kind === 't') {
      // 기술 — 유리질 원
      ctx.fillStyle = n.hot > 0.4 ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.06)';
      ctx.strokeStyle = n.hot > 0.4 ? C.bright : 'rgba(255,255,255,.28)';
      ctx.lineWidth = 1.4 + n.hot;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 7);
      ctx.fill();
      ctx.stroke();

      // 공유 2개짜리 노드(r≈14)에서도 글리프가 읽히게 아래를 받쳐둔다. 상자 대각선이
      // 원을 넘지 않는 한계가 r×1.41 이라 그 안에서 크게 잡는다.
      drawGlyph(ctx, n.tag, x, y, Math.max(16, r * 1.15), n.hot);

    } else {
      // 발광 — 어두운 바탕에서 노드를 띄운다
      const glow = ctx.createRadialGradient(x, y, r * 0.7, x, y, r * 2.2);
      const tint = GROUP[n.project.group].color;
      glow.addColorStop(0, hexA(tint, 0.34 * (0.4 + n.hot * 0.6)));
      glow.addColorStop(1, hexA(tint, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, r * 2.2, 0, 7);
      ctx.fill();

      ctx.strokeStyle = tint;
      ctx.lineWidth = 2 + n.hot * 2;
      ctx.beginPath();
      ctx.arc(x, y, r + 4, 0, 7);
      ctx.stroke();

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 7);
      ctx.clip();
      ctx.fillStyle = '#0b1020';
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      if (n.img.complete && n.img.naturalWidth) {
        ctx.drawImage(n.img, x - r, y - r, r * 2, r * 2);
      }
      ctx.restore();

      // 종료·준비 중은 점으로 표시한다
      if (n.project.status !== 'live') {
        ctx.fillStyle = STATUS[n.project.status].color;
        ctx.beginPath();
        ctx.arc(x + r * 0.72, y - r * 0.72, 4.5, 0, 7);
        ctx.fill();
      }

    }
  });

  /* 이름표는 몸통을 다 그린 뒤에 한 번 더 돈다. 노드마다 바로 붙여 그리면 뒤에 오는 노드의
     원이 앞 노드의 이름을 덮어, 좁은 화면에서 이름 하나가 통째로 사라졌다. */
  ctx.textAlign = 'center';
  nodes.forEach((n) => {
    const r = n.r * (1 + n.hot * 0.1);
    const x = n.x + n.ox;
    const y = n.y + n.oy;
    ctx.globalAlpha = 1 - n.dim * 0.86;
    ctx.fillStyle = n.hot > 0.4 ? C.bright : C.muted;

    if (n.kind === 't') {
      ctx.font = '500 11px "IBM Plex Mono", ui-monospace, monospace';
      label(ctx, n.tag, x, y + r + 16, size.w);
    } else {
      ctx.font = `${n.hot > 0.4 ? 700 : 500} 12px "Space Grotesk", Pretendard, sans-serif`;
      const name =
        n.project.name.length > 20 ? n.project.name.slice(0, 19) + '…' : n.project.name;
      label(ctx, name, x, y + r + 20, size.w);
    }
  });
  ctx.globalAlpha = 1;
}

/** 이름표는 노드보다 넓다. 노드가 가장자리에 붙으면 글자가 화면 밖으로 잘리므로, 글자 폭을
    재서 화면 안으로 밀어넣는다 — 노드 중심과 조금 어긋나도 읽히는 쪽이 낫다. */
function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, w: number) {
  const half = ctx.measureText(text).width / 2;
  ctx.fillText(text, Math.max(6 + half, Math.min(w - 6 - half, x)), y);
}

/* Path2D 는 필터 칩과 같은 path 문자열을 그대로 먹는다. 태그마다 한 번만 만들어 들고 있는다 —
   매 프레임 새로 만들면 노드 열 개 × 60fps 만큼 버려진다.
   Path2D 는 브라우저에만 있으므로 만드는 시점이 draw 안이어야 한다(이 파일도 서버에서 한 번 렌더된다). */
const GLYPHS = new Map<TechTag, { path: Path2D; rotate?: number; fill?: boolean }[]>();

function glyphOf(tag: TechTag) {
  let made = GLYPHS.get(tag);
  if (!made) {
    made = TECH_ICONS[tag].map((g) => ({ path: new Path2D(g.d), rotate: g.rotate, fill: g.fill }));
    GLYPHS.set(tag, made);
  }
  return made;
}

/** 24 상자에 그린 글리프를 (x, y) 중심에 size 크기로 얹는다. */
function drawGlyph(
  ctx: CanvasRenderingContext2D,
  tag: TechTag,
  x: number,
  y: number,
  size: number,
  hot: number,
) {
  const s = size / GLYPH_BOX;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.translate(-GLYPH_BOX / 2, -GLYPH_BOX / 2);
  ctx.strokeStyle = hot > 0.4 ? C.bright : 'rgba(255,255,255,.6)';
  ctx.fillStyle = ctx.strokeStyle;
  // 글리프 좌표계 안의 굵기다. 작은 노드에서 1.9 × 0.66 ≈ 1.3px 로 얇아진다.
  ctx.lineWidth = 1.9;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  glyphOf(tag).forEach((g) => {
    if (g.rotate) {
      ctx.save();
      ctx.translate(12, 12);
      ctx.rotate((g.rotate * Math.PI) / 180);
      ctx.translate(-12, -12);
    }
    if (g.fill) ctx.fill(g.path);
    else ctx.stroke(g.path);
    if (g.rotate) ctx.restore();
  });
  ctx.restore();
}

/** #rrggbb + 알파 → rgba(). 캔버스 그라디언트는 투명도를 따로 못 준다. */
function hexA(hex: string, a: number) {
  const v = parseInt(hex.slice(1), 16);
  return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${a})`;
}
