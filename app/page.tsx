import { Desktop } from '@/components/desktop';

export default function Home() {
  return (
    <>
      <div className="wallpaper" aria-hidden="true" />
      <main>
        <h1 className="sr-only">JubroLab — 아이디어를 현실로 만드는 1인 개발 연구실</h1>
        <Desktop />
      </main>
    </>
  );
}
