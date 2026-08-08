'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PROJECTS, type Project } from '@/data/projects';

const N = PROJECTS.length;

/* 롤링 배너 */
const CARD_W = 300;
const CARD_H = Math.round((CARD_W * 630) / 1200);
const CARD_GAP = 20;
/** 초당 몇 px 흐르는지. 한 바퀴 시간은 줄 길이에서 역산한다. */
const SPEED = 46;
const LOOP_SEC = ((CARD_W + CARD_GAP) * N) / SPEED;

/* 독 */
const ICON = 56;
const DOCK_GAP = 8;
/** 커서 아래 아이콘이 커지는 배율. 이웃은 거리만큼 덜 커진다. */
const MAGNIFY = 0.52;
const FALLOFF = 1.2;

/** 열어볼 수 없는 프로젝트에만 배지를 단다. live 는 배지 없음이 곧 표시다. */
const BADGE: Partial<Record<Project['status'], string>> = {
  building: '준비 중',
  ended: '서비스 종료',
};

const host = (url: string) => url.replace('https://', '').replace(/\/$/, '');

export function Desktop() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const opener = useRef<HTMLElement | null>(null);

  const open = useCallback((id: string) => {
    opener.current = document.activeElement as HTMLElement;
    setOpenId(id);
  }, []);

  const close = useCallback(() => {
    setOpenId(null);
    opener.current?.focus();
  }, []);

  const project = PROJECTS.find((p) => p.id === openId) ?? null;

  /* 모달이 열려 있는 동안은 배경을 고정하고 배너도 세운다. */
  useEffect(() => {
    if (!openId) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [openId]);

  return (
    <div className="flex min-h-dvh flex-col">
      <MenuBar />

      <section className="flex flex-1 flex-col justify-center gap-12 py-10">
        <header className="px-6 text-center">
          <p className="font-mono text-[10.5px] tracking-[0.28em] text-faint">
            SIDE PROJECTS · 2024 — 2026
          </p>
          <h2 className="mt-3.5 font-display text-[clamp(28px,4.8vw,52px)] leading-[1.14] font-extrabold tracking-[-0.04em]">
            아이디어를 현실로 만드는
            <br />1인 개발 연구실
          </h2>
          <p className="mx-auto mt-5 max-w-[64ch] text-[14.5px] leading-[1.85] text-muted">
            JubroLab은 AI, 교육, 게임, 개발자 도구 등 다양한 분야의 사이드 프로젝트를 실험하고
            운영하는 공간입니다. 작은 아이디어에서 시작해 실제 사용자가 있는 서비스로 성장시키는
            과정을 기록하고 공유합니다.
          </p>
        </header>

        <div>
          <Marquee paused={paused || openId !== null} onHover={setPaused} onPick={open} />
          <p className="mt-4 text-center font-mono text-[10.5px] tracking-[0.14em] text-faint">
            카드나 아래 아이콘을 누르면 자세히 볼 수 있습니다
          </p>
        </div>
      </section>

      <Dock openId={openId} onPick={open} />

      {project && <Modal project={project} onClose={close} />}
    </div>
  );
}

/* ── 롤링 배너 ──────────────────────────────────────── */

function Marquee({
  paused,
  onHover,
  onPick,
}: {
  paused: boolean;
  onHover: (v: boolean) => void;
  onPick: (id: string) => void;
}) {
  return (
    <div
      className="marquee-mask relative w-full overflow-hidden py-2"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div
        className="marquee-track flex w-max"
        data-paused={paused}
        style={{ animationDuration: `${LOOP_SEC}s`, gap: CARD_GAP }}
      >
        {/* 같은 줄 두 벌. 두 번째 벌은 이음매를 메우는 역할만 하므로 보조기기와 탭에서 뺀다. */}
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0" style={{ gap: CARD_GAP }} aria-hidden={copy === 1}>
            {PROJECTS.map((project, i) => (
              <MarqueeCard
                key={`${copy}-${project.id}`}
                project={project}
                tabbable={copy === 0}
                // 첫 벌은 처음부터 화면에 있다. 지연 로딩하면 LCP 가 늦어진다.
                eager={copy === 0 && i < 5}
                onPick={onPick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MarqueeCard({
  project,
  tabbable,
  eager,
  onPick,
}: {
  project: Project;
  tabbable: boolean;
  eager: boolean;
  onPick: (id: string) => void;
}) {
  return (
    <button
      type="button"
      tabIndex={tabbable ? 0 : -1}
      onClick={() => onPick(project.id)}
      style={{ width: CARD_W }}
      className="group shrink-0 overflow-hidden rounded-xl bg-card text-left shadow-[0_0_0_1px_var(--color-line),0_10px_24px_-18px_rgba(21,21,15,0.4)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_0_0_1px_var(--color-ink),0_22px_40px_-22px_rgba(21,21,15,0.5)]"
    >
      <span className="relative block overflow-hidden bg-grid" style={{ height: CARD_H }}>
        <Image
          src={project.og}
          alt=""
          fill
          sizes={`${CARD_W}px`}
          priority={eager}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          draggable={false}
        />
        {BADGE[project.status] && (
          <span className="absolute top-2 right-2 rounded-full bg-ink/80 px-2 py-0.5 font-mono text-[9px] tracking-[0.14em] text-paper">
            {BADGE[project.status]}
          </span>
        )}
      </span>

      <span className="flex items-baseline justify-between gap-3 border-t border-line-soft px-3.5 py-2.5">
        <span className="min-w-0">
          <span className="block truncate font-display text-[13.5px] font-bold tracking-[-0.01em]">
            {project.name}
          </span>
          <span className="mt-0.5 block truncate text-[11.5px] text-muted">{project.tagline}</span>
        </span>
        <span className="shrink-0 font-mono text-[9.5px] tracking-[0.14em] text-faint">
          {project.kind}
        </span>
      </span>
    </button>
  );
}

/* ── 상세 모달 ──────────────────────────────────────── */

function Modal({ project, onClose }: { project: Project; onClose: () => void }) {
  const sheet = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !sheet.current) return;

      // 모달 밖으로 포커스가 새지 않도록 앞뒤를 이어붙인다.
      const stops = sheet.current.querySelectorAll<HTMLElement>('a[href], button');
      if (!stops.length) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="닫기"
        tabIndex={-1}
        onClick={onClose}
        className="backdrop-in absolute inset-0 cursor-default bg-ink/35 backdrop-blur-[3px]"
      />

      <div
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="sheet-in relative flex max-h-[calc(100dvh-3rem)] w-full max-w-[860px] flex-col overflow-hidden rounded-2xl bg-card shadow-[0_0_0_1px_var(--color-line),0_50px_90px_-40px_rgba(21,21,15,0.55)]"
      >
        <div className="relative aspect-[1200/630] w-full shrink-0 bg-grid">
          <Image
            src={project.og}
            alt={`${project.name} 대표 이미지`}
            fill
            sizes="(max-width: 900px) 100vw, 860px"
            priority
            className="object-cover"
          />
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink/55 text-[17px] leading-none text-paper backdrop-blur-md transition hover:bg-ink/80"
          >
            ×
          </button>
          {BADGE[project.status] && (
            <span className="absolute top-3 left-3 rounded-full bg-ink/80 px-3 py-1 font-mono text-[10px] tracking-[0.16em] text-paper">
              {BADGE[project.status]}
            </span>
          )}
        </div>

        <div className="min-h-0 overflow-y-auto p-6 sm:p-8">
          <p className="font-mono text-[10.5px] tracking-[0.24em] text-faint">
            {project.kind}
            <span className="mx-2.5 text-line">/</span>
            {project.group === 'game' ? 'GAME' : 'TOOL'}
          </p>

          <h2
            id="modal-title"
            className="mt-2.5 font-display text-[clamp(24px,3.4vw,36px)] leading-[1.1] font-extrabold tracking-[-0.03em]"
          >
            {project.name}
          </h2>
          <p className="mt-1.5 text-[14.5px] text-muted">{project.tagline}</p>

          <p className="mt-5 max-w-[62ch] text-[14px] leading-[1.85] text-muted">{project.blurb}</p>

          <dl className="mt-6 grid grid-cols-2 gap-x-8 border-t border-line-soft sm:grid-cols-4">
            {project.specs.map(([label, value]) => (
              <div key={label} className="border-b border-line-soft py-3">
                <dt className="font-mono text-[10px] tracking-[0.14em] text-faint">{label}</dt>
                <dd className="mt-1.5 text-[13px] leading-snug">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            {project.status === 'live' && project.url ? (
              <>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-display text-[13px] font-semibold tracking-[0.03em] text-paper transition hover:opacity-85"
                >
                  열어보기
                  <span aria-hidden="true">↗</span>
                </a>
                {project.secondary && (
                  <a
                    href={project.secondary.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-full px-5 py-3 font-mono text-[11.5px] tracking-[0.08em] text-muted shadow-[inset_0_0_0_1px_var(--color-line)] transition hover:text-ink hover:shadow-[inset_0_0_0_1px_var(--color-ink)]"
                  >
                    {project.secondary.label}
                  </a>
                )}
                <span className="ml-auto font-mono text-[11px] text-faint">{host(project.url)}</span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center rounded-full px-6 py-3 font-display text-[13px] font-semibold tracking-[0.03em] text-faint shadow-[inset_0_0_0_1px_var(--color-line)]">
                  {project.status === 'ended' ? '서비스를 종료했습니다' : '아직 만드는 중입니다'}
                </span>
                {project.url && (
                  <span className="ml-auto font-mono text-[11px] text-faint">
                    {host(project.url)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 독 ─────────────────────────────────────────────── */

function Dock({ openId, onPick }: { openId: string | null; onPick: (id: string) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [fit, setFit] = useState(1);

  /* 확대까지 감안한 최대 폭. 좁은 화면에서는 독 전체를 줄인다. */
  useEffect(() => {
    const widest = N * ICON * (1 + MAGNIFY * 0.6) + (N - 1) * DOCK_GAP + 40;
    const measure = () => setFit(Math.min(1, (window.innerWidth - 28) / widest));
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  /**
   * 확대 배율은 커서의 픽셀 위치가 아니라 아이콘 사이의 거리로 계산한다.
   * 픽셀로 재면 아이콘이 커지며 위치가 밀리고, 밀린 위치가 다시 배율을 바꿔 떨린다.
   */
  const scaleFor = (i: number) => {
    if (hovered === null) return 1;
    const d = (i - hovered) / FALLOFF;
    return 1 + MAGNIFY * Math.exp(-d * d);
  };

  return (
    <div className="flex justify-center px-4 pb-6 sm:pb-8" style={{ height: 108 * fit }}>
      <div
        onMouseLeave={() => setHovered(null)}
        style={{ transform: `scale(${fit})`, transformOrigin: 'bottom center' }}
        className="flex items-end self-end rounded-[20px] border border-line bg-card/75 px-2.5 py-2.5 shadow-[0_18px_40px_-22px_rgba(21,21,15,0.45)] backdrop-blur-xl"
      >
        {PROJECTS.map((project, i) => {
          const scale = scaleFor(i);
          const isOpen = project.id === openId;
          return (
            /* 슬롯 자체가 배율만큼 넓어져서 이웃을 밀어낸다. 겹치지 않는 이유. */
            <div key={project.id} className="flex items-end">
              <div
                className="flex justify-center transition-[width] duration-150 ease-out"
                style={{ width: ICON * scale + DOCK_GAP }}
              >
                <button
                  type="button"
                  onMouseEnter={() => setHovered(i)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  onClick={() => onPick(project.id)}
                  aria-label={`${project.name} 자세히 보기`}
                  className="relative flex flex-col items-center"
                >
                  {hovered === i && (
                    <span
                      className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 font-mono text-[10.5px] tracking-[0.04em] text-paper"
                      style={{ bottom: ICON * scale + 22 }}
                    >
                      {project.name}
                    </span>
                  )}

                  <span
                    className="block overflow-hidden rounded-[24%] shadow-[0_8px_18px_-8px_rgba(21,21,15,0.55)] transition-[width,height] duration-150 ease-out"
                    style={{ width: ICON * scale, height: ICON * scale }}
                  >
                    <Image
                      src={project.icon}
                      alt=""
                      width={ICON * 2}
                      height={ICON * 2}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </span>

                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-1 w-1 rounded-full transition-colors ${
                      isOpen ? 'bg-ink' : 'bg-transparent'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── 메뉴 바 ────────────────────────────────────────── */

function MenuBar() {
  const [clock, setClock] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setClock(
        new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
      );
    tick();
    const timer = setInterval(tick, 20000);
    return () => clearInterval(timer);
  }, []);

  const live = PROJECTS.filter((p) => p.status === 'live').length;

  return (
    <header className="flex items-center justify-between gap-4 border-b border-line bg-card/70 px-4 py-2 backdrop-blur-md sm:px-6">
      <p className="font-display text-[13.5px] font-extrabold tracking-[-0.01em]">
        jubro<span className="text-faint">·</span>lab
      </p>
      <p className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.14em] text-faint sm:gap-4">
        <span className="hidden sm:inline">
          PROJECTS {String(N).padStart(2, '0')}
          <span className="mx-2 text-line">·</span>
          LIVE {String(live).padStart(2, '0')}
        </span>
        <span className="text-muted tabular-nums">{clock ?? '--:--'}</span>
      </p>
    </header>
  );
}
