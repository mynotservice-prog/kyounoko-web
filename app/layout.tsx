import type { Metadata, Viewport } from 'next';
import { Shippori_Mincho, Noto_Sans_JP, Zen_Maru_Gothic, DM_Serif_Display, Inter } from 'next/font/google';
import Script from 'next/script';
import { ADSENSE_SCRIPT_SRC, ADSENSE_CLIENT, ADSENSE_ENABLED } from '@/lib/adsense';
import { PWARegister } from '@/components/common/PWARegister';
import './globals.css';

// Next.js 15 では theme-color / viewport は viewport export で指定する
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FBF5E8',
};

// フォント定義
// SEO対応: preload は main body font（Noto Sans JP）のみに絞り込み、
// 他のフォントは `preload: false` でHTML頭のバイト量を激減させる（485 preload → ~80程度）。
// これによりGooglebotのクロール効率とLCPが大幅改善。
//
// CWV メモ（フォントウェイト削減候補・優先度低）:
//   - Shippori_Mincho: 600 は数か所のみ → 500/700 だけにすると CSS バイト減
//   - Zen_Maru_Gothic: 900 はほぼ未使用 → 500/700 だけで十分
//   - Inter: 500 は数か所のみ → 400/600 だけにできる
// ただし font-display: swap + preload: false なので LCP への悪影響は小さく、
// 削減は次フェーズ（実測 + Lighthouse 指摘ベース）で対応する方針。
const notoSans = Noto_Sans_JP({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  // 本文で最も使うのでpreloadあり
});
const shippori = Shippori_Mincho({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-mincho',
  display: 'swap',
  preload: false,
});
const zenMaru = Zen_Maru_Gothic({
  weight: ['500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-maru',
  display: 'swap',
  preload: false,
});
const dmSerif = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  preload: false,
});
const inter = Inter({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
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
  // Pinterest 連携: 子育て層の主要な視覚SNS流入源
  // pinterest:image / pinterest:description で Pin の見栄えを最適化
  other: {
    'pinterest-rich-pin': 'true',
    'pinterest:image': 'https://kyounoko.jp/img/ogp-default.jpg',
    'pinterest:description': '子育て家庭の「今日どうする？」を3分で決めるサイト。0-6歳の天気・年齢・予算別に決定をサポート',
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
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon-180.png', sizes: '180x180' },
      { url: '/icons/apple-touch-icon-167.png', sizes: '167x167' },
      { url: '/icons/apple-touch-icon-152.png', sizes: '152x152' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'きょうのこ',
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

  return (
    <html
      lang="ja"
      className={`${shippori.variable} ${notoSans.variable} ${zenMaru.variable} ${dmSerif.variable} ${inter.variable}`}
    >
      <head>
        {/* Core Web Vitals: 主要サードパーティドメインへの早期接続。
            dns-prefetch + preconnect を併記しておく（preconnect 非対応ブラウザ向けに dns-prefetch がフォールバック）。
            AdSense / GA / Clarity は async でロードされるが、TLS handshake を並行化することで TBT/INP を軽減。 */}
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
        {/* RSS / Atom フィード discovery（検索エンジンとフィードリーダー両対応） */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="きょうのこ - 最新記事 (RSS)"
          href="https://kyounoko.jp/feed.xml"
        />
        <link
          rel="alternate"
          type="application/atom+xml"
          title="きょうのこ - 最新記事 (Atom)"
          href="https://kyounoko.jp/atom.xml"
        />
        {/* JSON-LD: WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': 'https://kyounoko.jp/#website',
              name: 'きょうのこ',
              alternateName: 'kyounoko',
              url: 'https://kyounoko.jp',
              inLanguage: 'ja',
              description:
                '0〜6歳の子がいる家庭向け。天気・年齢・時間帯・予算から、今日の過ごし方を3分で決める意思決定サイトです。',
              publisher: { '@id': 'https://kyounoko.jp/#organization' },
              // SERP の Sitelinks Search Box 表示要件
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://kyounoko.jp/search?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
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
              alternateName: ['kyounoko', 'きょうのこ｜子育ての「今日どうする」'],
              url: 'https://kyounoko.jp',
              slogan: '子育て家庭の「今日どうする？」を3分で決める',
              description: '0〜6歳の子を育てる家庭向けに、毎日の「今日どうする？」を3分で決められる意思決定支援サイト。条件に合う1つの答えを返すTodayFinder、東京23区484駅の子連れOK店データベース、290+本の実用記事を提供。',
              // 公式SNS等 — Google のエンティティ認識（指名検索）を強化する sameAs
              sameAs: [
                'https://www.instagram.com/kyounoko_family_plan/',
              ],
              logo: {
                '@type': 'ImageObject',
                '@id': 'https://kyounoko.jp/#logo',
                url: 'https://kyounoko.jp/img/ogp-default.jpg',
                width: 1200,
                height: 630,
                caption: 'きょうのこ',
              },
              image: { '@id': 'https://kyounoko.jp/#logo' },
              founder: {
                '@type': 'Person',
                '@id': 'https://kyounoko.jp/about#author',
                name: 'ながみー',
                url: 'https://kyounoko.jp/about',
              },
              foundingDate: '2026-01',
              areaServed: { '@type': 'Country', name: 'Japan' },
              knowsAbout: [
                '子育て', '幼児食', '共働き育児', 'おでかけ',
                '東京23区子連れスポット', 'ベビー用品', '保育園',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'service@kyounoko.jp',
                contactType: 'customer support',
                url: 'https://kyounoko.jp/contact',
                availableLanguage: ['Japanese'],
              },
            }),
          }}
        />
        {/* AdSense 所有権確認メタタグ（審査中も含めて常に配信） */}
        <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
        {/* AdSense スクリプト: 審査通過後に env NEXT_PUBLIC_ADSENSE_ENABLED=true で有効化 */}
        {ADSENSE_ENABLED && (
          <script async src={ADSENSE_SCRIPT_SRC} crossOrigin="anonymous" />
        )}
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

        {/* Microsoft Clarity
            CWV対策: lazyOnload に変更（idle中にロード、INP/TBT に効く）。
            Clarity はセッション計測なので afterInteractive → lazyOnload にしてもデータ取得への影響は限定的。 */}
        {clarityId && (
          <Script id="clarity-init" strategy="lazyOnload">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `}
          </Script>
        )}

        {/* AdSense スクリプトは head で直接読み込み済み（Google推奨配置） */}

        {/* PWA: Service Worker 登録（本番のみ） */}
        <PWARegister />
      </body>
    </html>
  );
}
