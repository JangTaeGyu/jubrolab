import type { Metadata } from 'next';
import { Gothic_A1, IBM_Plex_Mono, Space_Grotesk } from 'next/font/google';
import { SITE } from '@/data/site';
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

const TITLE = 'JubroLab — 아이디어를 현실로 만드는 1인 개발 연구실';
const DESCRIPTION =
  'JubroLab은 AI, 교육, 게임, 개발자 도구 등 다양한 분야의 사이드 프로젝트를 실험하고 운영하는 공간입니다. 작은 아이디어에서 시작해 실제 사용자가 있는 서비스로 성장시키는 과정을 기록하고 공유합니다.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  // 한 장짜리 사이트라 정규 주소도 하나다. 쿼리가 붙은 주소가 따로 색인되지 않게 한다.
  alternates: { canonical: '/' },
  openGraph: {
    // 카드 이미지는 app/opengraph-image.png 를 Next 가 자동으로 붙인다.
    title: TITLE,
    description: DESCRIPTION,
    url: SITE,
    siteName: 'JubroLab',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* 한글 본문용. next/font/google 은 Pretendard 를 제공하지 않는다. */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${gothicA1.variable} ${plexMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
