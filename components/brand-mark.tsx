/**
 * 브랜드 마크 — 파비콘(app/icon.svg)과 같은 도형이다. 이어진 노드 셋.
 * 파비콘은 16px 까지 줄어야 해서 판(rect) 위에 그렸지만, 머리말에서는 판을 빼고
 * 도형만 남긴다. 색은 글자색을 따라가 머리말 텍스트와 한 덩어리로 읽힌다.
 * 좌표를 파비콘에서 그대로 가져왔으니 한쪽을 고치면 다른 쪽도 같이 고친다.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth={2} strokeLinecap="round" opacity={0.45}>
        <path d="M15 14 L8 23" />
        <path d="M17 14 L25 21.5" />
      </g>
      <g fill="currentColor">
        <circle cx="16" cy="12.5" r="6" />
        <circle cx="7" cy="24" r="3.6" />
        <circle cx="25" cy="22" r="3.6" />
      </g>
    </svg>
  );
}
