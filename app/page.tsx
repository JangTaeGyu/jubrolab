import { Graph } from '@/components/graph';

export default function Home() {
  return (
    <>
      <div className="space" aria-hidden="true" />
      <main className="h-dvh w-full">
        <h1 className="sr-only">JubroLab — 아이디어를 현실로 만드는 1인 개발 연구실</h1>
        <Graph />
      </main>
    </>
  );
}
