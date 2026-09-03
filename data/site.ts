/**
 * 사이트를 가리키는 값들. 절대 주소가 필요한 곳(OG 카드 · canonical · sitemap · robots)과
 * 검색 엔진에 넘기는 이름·소개(layout 의 메타데이터 · page 의 JSON-LD)가 모두 여기를
 * 본다 — 도메인이나 소개 문구가 바뀌면 이 파일만 고친다.
 *
 * layout.tsx 에 두지 않는 이유는 sitemap·robots 가 그 파일을 부르면 글꼴과 globals.css
 * 까지 함께 끌고 오기 때문이다. 그래서 여기는 아무것도 import 하지 않는 값만 둔다 —
 * 개수처럼 세어야 하는 것(COUNTS)을 쓰고 싶어도 projects.ts 를 끌어오지 않는다.
 */
export const SITE = 'https://jubrolab.dev';

export const SITE_NAME = 'JubroLab';

/** 검색 결과의 제목. 이름만으로는 무엇인지 모르니 한 줄 소개를 붙여 둔다. */
export const SITE_TITLE = 'JubroLab — 아이디어를 현실로 만드는 1인 개발 연구실';

/**
 * 검색 결과의 설명. 한글은 여든 자쯤에서 잘리므로 첫 문장 안에 이름과 무엇인지를 모두
 * 넣고, 잘려도 되는 말을 뒤로 보낸다.
 */
export const SITE_DESCRIPTION =
  'JubroLab은 사이드 프로젝트를 관계도 한 장으로 보여주는 1인 개발 연구실입니다. 웹 게임 · 개발자 도구 · 생성 도구를 직접 만들어 운영하고, 같은 기술을 쓴 프로젝트끼리 선으로 이어 무엇을 반복해서 쓰는지 한눈에 보여줍니다.';

/** 화면 오른쪽 아래 연락처이자 JSON-LD 가 내놓는 주소. 두 곳이 어긋나지 않게 한 곳에 둔다. */
export const SITE_EMAIL = 'ttggbbgg2@gmail.com';

/** 같은 사람이라고 검색 엔진에 알려줄 바깥 프로필(JSON-LD 의 sameAs). */
export const SITE_GITHUB = 'https://github.com/JangTaeGyu';
