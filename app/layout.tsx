import type { Metadata, Viewport } from 'next';
import { Shippori_Mincho, Noto_Sans_JP, Zen_Maru_Gothic, DM_Serif_Display, Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

// Next.js 15 では theme-color / viewport は viewport export で指定する
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FBF5E8',
};

// フォント定義（Next.js が build 時に subset + preload してくれる）
const shippori = Shippori_Mincho({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-mincho',
  display: 'swap',
});
const notoSans = Noto_Sans_JP({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});
const zenMaru = Zen_Maru_Gothic({
  weight: ['500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-maru',
  display: 'swap',
});
const dmSerif = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});
const inter = Inter({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// サイト共通メタデータ
export const metadata: Metadata = {
  metadataBase: new URL('https://kyounoko.jp'),
  title: {
    default: 'きょうのこ｜子育て家庭の「今日どうする？」を3分で決める',
    template: '%s｜きょうのこ',
  },
  description:
    '0〜6歳の子がいる家庭向け。天気・年齢・時間帯・予算から、今日の過ごし方を3分で決める意思決定サイトです。',
  keywords: ['子育て', '子ども', '育児', 'おでかけ', '幼児食', '家遊び', '共働き'],
  authors: [{ name: 'ながみー', url: 'https://kyounoko.jp/about' }],
  creator: 'ながみー',
  publisher: 'きょうのこ',
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'きょうのこ',
    title: 'きょうのこ｜子育て家庭の「今日どうする？」を3分で決める',
    description: '天気・年齢・時間帯・予算から、今日の過ごし方を3分で決める子育て家庭向けサイト。',
    url: 'https://kyounoko.jp',
    images: [
      {
        url: '/img/ogp-default.jpg',
        width: 1200,
        height: 630,
        alt: 'きょうのこ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'きょうのこ',
    description: '子育て家庭の「今日どうする？」を3分で決める。',
    images: ['/img/ogp-default.jpg'],
  },
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
  icons: {
    icon: [
      { url: '/img/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: '/img/apple-touch-icon.svg',
  },
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'NwebBqSUBnmbiHv6kY8lgriTPH3arJQeu4N7_oCxbOY',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
  // AdSense publisher ID。未設定の間はスニペットを出力しない。
  // 形式は "pub-XXXXXXXXXXXXXXXX" でも "ca-pub-XXXXXXXXXXXXXXXX" でも受け付けて、
  // 最終的に ca-pub- 付きの client パラメータに正規化する。
  const rawAdsensePubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID?.trim();
  const adsenseClient = rawAdsensePubId
    ? rawAdsensePubId.startsWith('ca-')
      ? rawAdsensePubId
      : `ca-${rawAdsensePubId}`
    : null;

  return (
    <html
      lang="ja"
      className={`${shippori.variable} ${notoSans.variable} ${zenMaru.variable} ${dmSerif.variable} ${inter.variable}`}
    >
      <head>
        {/* JSON-LD: WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'きょうのこ',
              url: 'https://kyounoko.jp',
              inLanguage: 'ja',
              description:
                '0〜6歳の子がいる家庭向け。天気・年齢・時間帯・予算から、今日の過ごし方を3分で決める意思決定サイトです。',
              publisher: { '@id': 'https://kyounoko.jp/#organization' },
            }),
          }}
        />
        {/* JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': 'https://kyounoko.jp/#organization',
              name: 'きょうのこ',
              url: 'https://kyounoko.jp',
              logo: {
                '@type': 'ImageObject',
                url: 'https://kyounoko.jp/img/ogp-default.jpg',
                width: 1200,
                height: 630,
              },
              founder: { '@type': 'Person', name: 'ながみー' },
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'service@kyounoko.jp',
                contactType: 'customer support',
                availableLanguage: ['Japanese'],
              },
            }),
          }}
        />
      </head>
      <body className="font-sans">
        {children}

        {/* Google Analytics 4 */}
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}

        {/* Microsoft Clarity */}
        {clarityId && (
          <Script id="clarity-init" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `}
          </Script>
        )}

        {/* Google AdSense (Auto Ads) — NEXT_PUBLIC_ADSENSE_PUB_ID 設定時のみ出力 */}
        {adsenseClient && (
          <Script
            id="adsense-init"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  );
}
