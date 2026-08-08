'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { COUNTS, PROJECTS, SHARED_TECH, type Project, type TechTag } from '@/data/projects';

/* ── 색 ───────────────────────────────────────────────
   globals.css 와 같은 값. 캔버스는 CSS 변수를 못 읽어 여기서 다시 적는다. */
const C = {
  game: '#ff7a52',
  tool: '#5b9bff',
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
  r: number;
  /** 강조 정도(0~1). 호버·선택에 따라 부드럽게 따라간다. */
  hot: number;
  /** 흐림 정도(0~1). 필터에 걸리지 않은 것. */
  dim: number;
  want: number;
};
type ProjectNode = NodeBase & { kind: 'p'; project: Project; img: HTMLImageElement };
type TechNode = NodeBase & { kind: 't'; tag: TechTag; count: number };
type Node = ProjectNode | TechNode;

const STATUS: Record<Project['status'], { label: string; color: string }> = {
  live: { label: '운영 중', color: '#5be49b' },
  building: { label: '준비 중', color: '#ffc14d' },
  ended: { label: '서비스 종료', color: '#ff7a7a' },
};

export function Graph() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TechTag | null>(null);
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

  const open = useCallback((id: string | null) => {
    picked.current = id;
    setOpenId(id);
  }, []);

  /* ── 그래프 만들기 (한 번) ───────────────────────── */
  useEffect(() => {
    const built: Node[] = [];
    PROJECTS.forEach((project) => {
      const img = new Image();
      img.src = project.icon;
      built.push({ kind: 'p', project, img, x: 0, y: 0, vx: 0, vy: 0, r: 29, hot: 0, dim: 0, want: 0 });
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
        r: 10 + Math.min(11, count * 1.9),
        hot: 0,
        dim: 0,
        want: 0,
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

  /* ── 필터 ────────────────────────────────────────── */
  useEffect(() => {
    nodes.current.forEach((n) => {
      if (!filter) return (n.want = 0);
      const linked = links.current.some(
        (l) =>
          (l.a === n && l.b.kind === 't' && l.b.tag === filter) ||
          (l.b === n && l.a.kind === 't' && l.a.tag === filter),
      );
      const self = n.kind === 't' && n.tag === filter;
      n.want = self || linked ? 0 : 1;
    });
  }, [filter]);

  /* ── 루프 ────────────────────────────────────────── */
  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      size.current = { w: innerWidth, h: innerHeight };
      cv.width = innerWidth * dpr;
      cv.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener('resize', resize);

    const step = () => {
      const { w, h } = size.current;
      const list = nodes.current;
      // 상세가 열리면 패널이 오른쪽을 덮으므로 무게중심을 왼쪽으로 옮긴다.
      const cx = w / 2 - (picked.current ? Math.min(200, w * 0.16) : 0);
      const cy = h / 2 + 26;
      /* 힘의 거리를 화면 크기에 비례시킨다. 고정값으로 두면 큰 화면에서 가운데만 뭉친다. */
      const spread = Math.max(0.9, Math.min(1.5, Math.min(w, h) / 900));

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

      list.forEach((n) => {
        if (n !== held.current) {
          n.vx += (cx - n.x) * 0.0006;
          n.vy += (cy - n.y) * 0.0006;
          n.vx *= 0.86;
          n.vy *= 0.86;
          n.x += n.vx;
          n.y += n.vy;
          n.x = Math.max(n.r + 10, Math.min(w - n.r - 10, n.x));
          n.y = Math.max(n.r + 56, Math.min(h - n.r - 76, n.y));
        }
        const isPicked = n.kind === 'p' && n.project.id === picked.current;
        n.dim += (n.want - n.dim) * 0.12;
        n.hot += ((n === hover.current || n === held.current || isPicked ? 1 : 0) - n.hot) * 0.2;
      });

      draw(ctx, size.current, nodes.current, links.current, hover.current);
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
      <header className="pointer-events-none fixed inset-x-0 top-0 z-10 flex items-baseline justify-between gap-4 px-5 py-3.5 sm:px-7">
        <p className="font-display text-[14px] font-extrabold tracking-[-0.01em]">
          jubro<span className="text-faint">·</span>lab
        </p>
        <p className="font-mono text-[10.5px] tracking-[0.14em] text-faint tabular-nums">
          NODES {COUNTS.total}
          <span className="mx-2 text-white/15">+</span>
          {SHARED_TECH.length}
          <span className="mx-2 text-white/15">·</span>
          LINKS {COUNTS.links}
        </p>
      </header>

      <div className="pointer-events-none fixed top-14 left-5 z-10 max-w-[36ch] sm:top-16 sm:left-8">
        <h1 className="font-display text-[clamp(22px,2.7vw,36px)] leading-[1.14] font-extrabold tracking-[-0.045em]">
          아이디어를 현실로 만드는
          <br />1인 개발 연구실
        </h1>
        <p className="mt-3.5 text-[13px] leading-[1.85] text-muted">
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

      {/* 기술 필터 */}
      <div className="fixed bottom-5 left-5 z-10 flex max-w-[min(620px,58vw)] flex-wrap gap-1.5 sm:bottom-6 sm:left-8">
        {SHARED_TECH.map(({ tag, count }) => (
          <button
            key={tag}
            type="button"
            onClick={() => setFilter((f) => (f === tag ? null : tag))}
            className={`rounded-full border px-3 py-1.5 font-mono text-[10.5px] tracking-[0.06em] backdrop-blur-md transition ${
              filter === tag
                ? 'border-bright bg-bright text-void'
                : 'border-edge bg-glass text-muted hover:border-white/35 hover:text-bright'
            }`}
          >
            {tag} <span className="opacity-55">{count}</span>
          </button>
        ))}
      </div>

      <div className="pointer-events-none fixed right-6 bottom-6 z-10 text-right font-mono text-[10.5px] leading-[1.9] tracking-[0.08em] text-faint">
        <p>
          <i className="mr-1.5 inline-block size-2 rounded-full align-[-1px]" style={{ background: C.game }} />
          게임 {COUNTS.game}
        </p>
        <p>
          <i className="mr-1.5 inline-block size-2 rounded-full align-[-1px]" style={{ background: C.tool }} />
          도구 {COUNTS.tool}
        </p>
        <p>
          <i className="mr-1.5 inline-block size-2 rounded-full align-[-1px]" style={{ background: C.tech }} />
          기술 {SHARED_TECH.length}
        </p>
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

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label={`${project.name} 상세`}
      className="fixed inset-y-0 right-0 z-20 w-[456px] max-w-[94vw] overflow-y-auto border-l border-edge bg-panel/92 px-7 pt-6 pb-12 backdrop-blur-2xl [animation:slide-in_.34s_cubic-bezier(.22,.8,.28,1)_both]"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute top-5 right-6 text-[22px] leading-none text-faint transition hover:text-bright"
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
        {project.group === 'game' ? 'GAME' : 'TOOL'}
        <span className="ml-auto flex items-center gap-1.5" style={{ color: status.color }}>
          <i className="inline-block size-1.5 rounded-full" style={{ background: status.color }} />
          {status.label}
        </span>
      </p>

      <h2 className="mt-2.5 font-display text-[26px] leading-[1.14] font-extrabold tracking-[-0.03em]">
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
  hover: Node | null,
) {
  ctx.clearRect(0, 0, size.w, size.h);

  // 선. 프로젝트 쪽 색을 따라가고, 호버한 노드에 붙은 것만 밝아진다.
  links.forEach((l) => {
    const near = hover && (l.a === hover || l.b === hover);
    const dim = Math.max(l.a.dim, l.b.dim);
    const base = l.a.kind === 'p' && l.a.project.group === 'game' ? C.game : C.tool;
    ctx.globalAlpha = (near ? 0.9 : 0.26) * (1 - dim * 0.88);
    ctx.strokeStyle = near ? C.bright : base;
    ctx.lineWidth = near ? 1.8 : 1;
    ctx.beginPath();
    ctx.moveTo(l.a.x, l.a.y);
    ctx.lineTo(l.b.x, l.b.y);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  nodes.forEach((n) => {
    const fade = 1 - n.dim * 0.86;
    const r = n.r * (1 + n.hot * 0.1);
    ctx.globalAlpha = fade;

    if (n.kind === 't') {
      // 기술 — 유리질 원
      ctx.fillStyle = n.hot > 0.4 ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.06)';
      ctx.strokeStyle = n.hot > 0.4 ? C.bright : 'rgba(255,255,255,.28)';
      ctx.lineWidth = 1.4 + n.hot;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, 7);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = n.hot > 0.4 ? C.bright : C.muted;
      ctx.font = '500 11px "IBM Plex Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(n.tag, n.x, n.y + r + 16);
    } else {
      // 발광 — 어두운 바탕에서 노드를 띄운다
      const glow = ctx.createRadialGradient(n.x, n.y, r * 0.7, n.x, n.y, r * 2.2);
      const tint = n.project.group === 'game' ? C.game : C.tool;
      glow.addColorStop(0, hexA(tint, 0.34 * (0.4 + n.hot * 0.6)));
      glow.addColorStop(1, hexA(tint, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 2.2, 0, 7);
      ctx.fill();

      ctx.strokeStyle = tint;
      ctx.lineWidth = 2 + n.hot * 2;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r + 4, 0, 7);
      ctx.stroke();

      ctx.save();
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, 7);
      ctx.clip();
      ctx.fillStyle = '#0b1020';
      ctx.fillRect(n.x - r, n.y - r, r * 2, r * 2);
      if (n.img.complete && n.img.naturalWidth) {
        ctx.drawImage(n.img, n.x - r, n.y - r, r * 2, r * 2);
      }
      ctx.restore();

      // 종료·준비 중은 점으로 표시한다
      if (n.project.status !== 'live') {
        ctx.fillStyle = STATUS[n.project.status].color;
        ctx.beginPath();
        ctx.arc(n.x + r * 0.72, n.y - r * 0.72, 4.5, 0, 7);
        ctx.fill();
      }

      ctx.fillStyle = n.hot > 0.4 ? C.bright : C.muted;
      ctx.font = `${n.hot > 0.4 ? 700 : 600} 12px Archivo, Pretendard, sans-serif`;
      ctx.textAlign = 'center';
      const label =
        n.project.name.length > 20 ? n.project.name.slice(0, 19) + '…' : n.project.name;
      ctx.fillText(label, n.x, n.y + r + 20);
    }
  });
  ctx.globalAlpha = 1;
}

/** #rrggbb + 알파 → rgba(). 캔버스 그라디언트는 투명도를 따로 못 준다. */
function hexA(hex: string, a: number) {
  const v = parseInt(hex.slice(1), 16);
  return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${a})`;
}
