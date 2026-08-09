import { GLYPH_BOX, TECH_ICONS } from '@/data/tech-icons';
import type { TechTag } from '@/data/projects';

/** 필터 칩 안의 기술 글리프. 색은 글자색을 따라간다 — 칩이 반전되면 같이 반전된다. */
export function TechIcon({ tag, className }: { tag: TechTag; className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${GLYPH_BOX} ${GLYPH_BOX}`}
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={TECH_ICONS[tag]} />
    </svg>
  );
}
