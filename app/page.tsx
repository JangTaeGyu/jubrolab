import { Graph } from '@/components/graph';

export default function Home() {
  return (
    <>
      <div className="space" aria-hidden="true">
        {/* 순서가 곧 겹치는 순서다 — 채운 칸(.hive) → 테두리(::before) → 어둠(.veil) */}
        <div className="hive" />
        <div className="veil" />
      </div>
      <main className="h-dvh w-full">
        <h1 className="sr-only">JubroLab — 아이디어를 현실로 만드는 1인 개발 연구실</h1>
        <Graph />
      </main>
    </>
  );
}
