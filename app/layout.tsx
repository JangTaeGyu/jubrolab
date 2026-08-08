import type { Metadata } from 'next';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
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
  metadataBase: new URL('https://jubrolab.dev'),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    // 카드 이미지는 app/opengraph-image.png 를 Next 가 자동으로 붙인다.
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://jubrolab.dev',
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
      <body className={`${archivo.variable} ${plexMono.variable}`}>{children}</body>
    </html>
  );
}
