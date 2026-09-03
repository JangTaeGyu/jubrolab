import { Graph } from '@/components/graph';
import { COUNTS, PROJECTS, STATUS_LABEL, type Project } from '@/data/projects';
import {
  SITE,
  SITE_DESCRIPTION,
  SITE_EMAIL,
  SITE_GITHUB,
  SITE_NAME,
  SITE_TITLE,
} from '@/data/site';

/* 프로젝트를 schema.org 의 무엇으로 볼지. 분류(group)에서 곧장 뽑는다 — 열세 개마다
   따로 적으면 데이터에 SEO 전용 칸이 하나 늘고, 그 칸은 곧 관계도와 어긋난다.
   게임은 VideoGame 이 정확하고, 나머지는 SoftwareApplication 으로 둔다 —
   WebApplication 까지 좁히면 터미널에서 도는 Koda CLI 에 거짓말이 된다. */
const SCHEMA: Record<Project['group'], { type: string; category: string }> = {
  game: { type: 'VideoGame', category: 'GameApplication' },
  tool: { type: 'SoftwareApplication', category: 'DeveloperApplication' },
  art: { type: 'SoftwareApplication', category: 'MultimediaApplication' },
};

/**
 * 검색 엔진에 "이 사이트가 무엇이고 무엇을 담고 있는지"를 기계가 읽는 말로 한 번 더 준다.
 * 화면에 없는 사실은 넣지 않는다 — 구조화 데이터가 화면과 다른 말을 하면 무시당한다.
 * 그래서 내려간 프로젝트(ended)와 준비 중인 것에는 url 을 달지 않는다. 상세 패널이
 * '열어보기'를 내주지 않는 것과 같은 기준이다.
 */
function structuredData() {
  const publisher = { '@id': `${SITE}/#organization` };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': publisher['@id'],
        name: SITE_NAME,
        url: SITE,
        description: SITE_DESCRIPTION,
        email: SITE_EMAIL,
        // 파비콘(icon.svg)이 아니라 180 정사각 PNG 를 준다 — 구글이 로고로 받는 모양이다.
        logo: { '@type': 'ImageObject', url: `${SITE}/apple-icon.png`, width: 180, height: 180 },
        sameAs: [SITE_GITHUB],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: SITE,
        name: SITE_TITLE,
        description: SITE_DESCRIPTION,
        inLanguage: 'ko-KR',
        publisher,
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE}/#projects`,
        name: `${SITE_NAME} 프로젝트`,
        numberOfItems: COUNTS.total,
        itemListElement: PROJECTS.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': SCHEMA[p.group].type,
            name: p.name,
            alternateName: p.tagline,
            description: p.blurb,
            applicationCategory: SCHEMA[p.group].category,
            image: `${SITE}${p.og}`,
            inLanguage: 'ko-KR',
            author: publisher,
            ...(p.status === 'live' && p.url ? { url: p.url } : {}),
          },
        })),
      },
    ],
  };
}

/**
 * 관계도는 <canvas> 라 이름도 설명도 DOM 에 없다 — 손보기 전 이 페이지의 HTML 에는
 * 프로젝트 열세 개 중 한 글자도 없었고, 크롤러가 본 것은 제목 한 줄과 필터 칩뿐이었다.
 *
 * 숨기려고 적는 글이 아니라 캔버스가 주지 못하는 텍스트 대체물이다. 화면 낭독기도 같은
 * 것을 읽는다. 그래서 캔버스가 그리고 상세 패널이 여는 것과 **같은 데이터**에서 나온다 —
 * 여기에만 있는 말을 적으면 그 순간 화면에 없는 것을 검색 엔진에 파는 셈이 된다.
 */
function ProjectIndex() {
  return (
    <section className="sr-only" aria-label="프로젝트 목록">
      <h2>{SITE_NAME} 프로젝트</h2>
      <p>{SITE_DESCRIPTION}</p>
      <ul>
        {PROJECTS.map((p) => (
          <li key={p.id}>
            <h3>{p.name}</h3>
            <p>{p.tagline}</p>
            <p>{p.blurb}</p>
            <p>{p.story}</p>
            <p>
              분류: {p.kind} · 상태: {STATUS_LABEL[p.status]} · 사용 기술: {p.tech.join(', ')}
            </p>
            {/* 살아 있는 것에만 건다. 내린 서비스로 크롤러를 보내면 404 를 물린다. */}
            {p.status === 'live' && p.url && <a href={p.url}>{p.name} 열어보기</a>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <div className="space" aria-hidden="true">
        {/* 순서가 곧 겹치는 순서다 — 채운 칸(.hive) → 테두리(::before) → 어둠(.veil) */}
        <div className="hive" />
        <div className="veil" />
      </div>
      <main className="h-dvh w-full">
        {/* h1 은 관계도 위 제목(graph.tsx)이 이미 갖고 있다. 여기에 하나 더 두면 h1 이
            둘이 되어 무엇이 이 화면의 제목인지 흐려진다. */}
        <Graph />
        <ProjectIndex />
      </main>
      <script
        type="application/ld+json"
        // JSON.stringify 는 '<' 를 그대로 흘린다. 스크립트 태그를 닫아버릴 수 있어 막는다.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData()).replace(/</g, '\\u003c'),
        }}
      />
    </>
  );
}
