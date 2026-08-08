/**
 * 배포 도메인. 절대 주소가 필요한 곳(OG 카드 · canonical · sitemap · robots)이 모두
 * 여기를 본다 — 도메인이 바뀌면 이 한 줄만 고친다.
 *
 * layout.tsx 에 두지 않는 이유는 sitemap·robots 가 그 파일을 부르면 글꼴과 globals.css
 * 까지 함께 끌고 오기 때문이다. 값 하나짜리 모듈이면 아무도 끌고 오지 않는다.
 */
export const SITE = 'https://jubrolab.dev';
