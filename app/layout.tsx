import type { Metadata, Viewport } from 'next';
import { Gothic_A1, IBM_Plex_Mono, Space_Grotesk } from 'next/font/google';
import { PROJECTS } from '@/data/projects';
import { SITE, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from '@/data/site';
import './globals.css';

/* 제목용 라틴. Archivo 는 반듯해서 조용했다. Space Grotesk 는 잘린 획과 각진 곡선이
   같은 크기에서도 더 움직인다. 가변축이 300~700 이라 900 을 줘도 700 에서 멈춘다. */
const spaceGrotesk = Space_Grotesk({
  variable: '--font-space',
  subsets: ['latin'],
  display: 'swap',
});

/* 제목용 한글. 제목이 한글이라 라틴만 바꾸면 화면은 그대로다. 본문은 Pretendard 로 두고
   제목만 Gothic A1 900 으로 각을 세운다. */
const gothicA1 = Gothic_A1({
  variable: '--font-gothic',
  // next/font 의 Gothic A1 메타에는 'korean' 서브셋이 없다. 그래도 구글이 돌려주는 CSS 에는
  // 한글 unicode-range 청크가 함께 들어오고, 브라우저는 필요한 청크만 받는다.
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

/* 검색어로 들어올 말. 구글은 이 태그를 보지 않지만 네이버·다음은 아직 참고한다.
   프로젝트 이름은 손으로 적지 않고 데이터에서 가져온다 — 열넷째가 생기면 같이 따라온다.
   이름 없이 '사이드 프로젝트' 같은 말만으로는 경쟁이 되지 않으니, 실제로 이 사이트에서만
   찾을 수 있는 고유명사(프로젝트 이름)를 앞세운다. */
const KEYWORDS = [
  SITE_NAME,
  '주브로랩',
  ...PROJECTS.map((p) => p.name),
  '사이드 프로젝트',
  '1인 개발',
  '개인 개발자 포트폴리오',
  '웹 게임',
  '개발자 도구',
  'Next.js',
  'React',
  'TypeScript',
];

/* 서치 콘솔 소유 확인. 값이 없으면 필드를 통째로 빼서 빈 메타 태그가 나가지 않게 한다 —
   내용 없는 확인 태그는 확인에 실패한 것으로 읽힌다. */
const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const NAVER_VERIFICATION = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'technology',
  // 한 장짜리 사이트라 정규 주소도 하나다. 쿼리가 붙은 주소가 따로 색인되지 않게 한다.
  alternates: { canonical: '/' },
  /* 기본값도 색인이지만 적어둔다 — 관계도가 캔버스라 '내용 없는 페이지'로 오해받기 쉬운
     쪽이라, 색인해도 된다는 말과 카드 이미지를 크게 쓰라는 말을 함께 명시한다. */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    // 카드 이미지는 app/opengraph-image.png 를 Next 가 자동으로 붙인다.
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE,
    siteName: SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
  },
  // 이미지를 따로 두지 않는다 — twitter:image 가 없으면 X 가 og:image 를 그대로 쓴다.
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  // 전화번호로 읽힐 숫자가 없는 화면인데 사파리가 개수를 전화번호로 만들어 색을 바꾼다.
  formatDetection: { telephone: false },
  ...(GOOGLE_VERIFICATION || NAVER_VERIFICATION
    ? {
        verification: {
          ...(GOOGLE_VERIFICATION ? { google: GOOGLE_VERIFICATION } : {}),
          ...(NAVER_VERIFICATION
            ? { other: { 'naver-site-verification': NAVER_VERIFICATION } }
            : {}),
        },
      }
    : {}),
};

/* 주소창까지 바탕색으로 이어 붙인다. globals.css 의 --color-void 와 같은 값이다. */
export const viewport: Viewport = {
  themeColor: '#080b16',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* 글꼴이 남의 CDN 에서 오는 동안 글이 안 그려진다. 연결(DNS·TLS)만이라도 미리
            터두면 그만큼 첫 글자가 빨리 뜬다 — 속도는 검색 순위에 직접 들어간다. */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        {/* 한글 본문용. next/font/google 은 Pretendard 를 제공하지 않는다. */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <meta name="google-site-verification" content="EohLIsv996hipvC-zZPba5ClWreNM6yKZDXtRCkpWP8" />
      </head>
      <body className={`${spaceGrotesk.variable} ${gothicA1.variable} ${plexMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
