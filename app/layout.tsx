import type { Metadata, Viewport } from 'next';
import { Shippori_Mincho, Noto_Sans_JP, Inter } from 'next/font/google';
import Script from 'next/script';
import { ADSENSE_SCRIPT_SRC, ADSENSE_CLIENT, ADSENSE_PUB_ID_CONFIGURED } from '@/lib/adsense';
import { PWARegister } from '@/components/common/PWARegister';
import { PWAInstallPrompt } from '@/components/common/PWAInstallPrompt';
import { AnalyticsRouteTracker } from '@/components/common/AnalyticsRouteTracker';
import { ScrollDepthTracker } from '@/components/common/ScrollDepthTracker';
import { ScrollResetOnNavigate } from '@/components/common/ScrollResetOnNavigate';
import { Suspense } from 'react';
import './globals.css';
import './v2/v2.css';

// Next.js 15 では theme-color / viewport は viewport export で指定する
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FBF5E8',
};

// フォント定義
// SEO対応: preload は main body font（Noto Sans JP）のみに絞り込み、
// 他のフォントは `preload: false` でHTML頭のバイト量を激減させる。
// これによりGooglebotのクロール効率とLCPが大幅改善。
//
// 構成（3 フォント体制）:
//   - Noto Sans JP: 本文 sans
//   - Shippori Mincho: 見出し・大きな display 数字（旧 DM Serif Display の用途も統合）
//   - Inter: eyebrow / category / 小さな英字
// 旧 Zen Maru Gothic / DM Serif Display は廃止。--font-display は --font-mincho にフォールバック。
//
// CWV メモ（フォントウェイト削減候補・優先度低）:
//   - Shippori_Mincho: 600 は数か所のみ → 500/700 だけにすると CSS バイト減
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
// Shippori_Mincho: H1（ヒーロー）に使われるため、PSIで LCP=7.3s の主因になっていた。
// 700 ウェイトだけ preload:true にして、H1 のフォントスワップを早期解消する。
// 残りウェイト（500/600）は本文中の小箇所のみ → preload なしで OK。
// adjustFontFallback で メトリクスを最適化（CLS抑制）。
const shippori = Shippori_Mincho({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-mincho',
  display: 'swap',
  preload: true, // H1 の LCP 改善のため preload を有効化
  adjustFontFallback: false, // 日本語サブセットは Next 側の自動調整が効きづらい
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
        url: '/img/ogp-default-v2.webp',
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
    images: ['/img/ogp-default-v2.webp'],
  },
  // Pinterest 連携: 子育て層の主要な視覚SNS流入源
  // pinterest:image / pinterest:description で Pin の見栄えを最適化
  other: {
    'pinterest-rich-pin': 'true',
    // サイト所有権の確認（ドメインクレーム）2026-06-26
    'p:domain_verify': '11e0bf79e24673de1681a0a441015e6a',
    'pinterest:image': 'https://kyounoko.jp/img/ogp-default-v2.webp',
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
  // alternates.canonical は各ページの generateMetadata で個別指定する。
  // ここで '/' を指定すると上書きしていないページ全てが canonical=TOP になり、
  // Google が「TOP の重複」と判定してインデックスから外す問題が起きる（2026-06-12 GSC通知の主因）。
  // TOP ページは app/page.tsx で明示。
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
      className={`${shippori.variable} ${notoSans.variable} ${inter.variable}`}
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
              description: '0〜6歳の子を育てる家庭向けに、毎日の「今日どうする？」を3分で決められる意思決定支援サイト。条件に合う1つの答えを返すTodayFinder、首都圏・関西589駅の子連れOK店データベース、750本以上の実用記事、運営者が実際に子連れで訪問した一次情報レポートを提供。',
              // 公式SNS等 — Google のエンティティ認識（指名検索）を強化する sameAs。
              // note は高ドメイン権威 + プロフィール名「きょうのこ」+ 各記事から本サイトへ
              // バックリンクしており、新規ブランドのエンティティ確立に最も効く信号源。
              sameAs: [
                'https://note.com/kyounoko',
                'https://www.instagram.com/kyounoko_family_plan/',
              ],
              logo: {
                '@type': 'ImageObject',
                '@id': 'https://kyounoko.jp/#logo',
                url: 'https://kyounoko.jp/img/ogp-default-v2.webp',
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
                email: 'service@remegift.jp',
                contactType: 'customer support',
                url: 'https://kyounoko.jp/contact',
                availableLanguage: ['Japanese'],
              },
            }),
          }}
        />
        {/* AdSense 所有権確認メタタグ（審査中も含めて常に配信） */}
        <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
        {/* AdSense スクリプト本体は <body> 下部に next/script で移動した。
            head 内の async <script> は本文 HTML パース前から DNS lookup/接続を始め、
            LCP/TBT を 200ms 級で押し下げていた。<meta google-adsense-account> は
            head に残しているので所有権確認・クロール検出は維持される。 */}
      </head>
      <body className="font-sans">
        {/* キーボード操作者向け: メインコンテンツへ直接ジャンプするスキップリンク。
            通常は画面外、フォーカス時のみ表示される。各ページの <main> もしくは
            主要 <article> に id="main" を付けることで効く。 */}
        <a href="#main" className="skip-link">本文へスキップ</a>
        {/* SPA遷移時の page_view 手動送信。useSearchParams を使うので Suspense でラップ。 */}
        <Suspense fallback={null}>
          <AnalyticsRouteTracker />
        </Suspense>
        <ScrollDepthTracker />
        {/* 遷移時に先頭へ戻す。入れ子スクロール廃止(PR #150)で App Router 内蔵の
            スクロールリセットが効かなくなったため明示的に行う。詳細はコンポーネント内のコメント。 */}
        <ScrollResetOnNavigate />
        {children}

        {/* Google Analytics 4
            CWV/計測精度対策:
            1. dataLayer と gtag は **beforeInteractive** で同期初期化する。
               これにより、ユーザーがFCP直後にHero CTAをクリックしても
               trackEvent → window.gtag は確実に呼び出せる（取りこぼし防止）。
            2. 本体スクリプト (googletagmanager) は afterInteractive のままに
               しておきLCP/TBTへの影響を最小化。dataLayer に積まれた event は
               スクリプト読み込み後に自動消化される。
            3. SPA 遷移時の page_view は AnalyticsRouteTracker が手動送信する。 */}
        {gaId && (
          <>
            <Script id="ga-init" strategy="beforeInteractive">
              {`
                // /admin/* は管理画面なのでGA計測を完全停止する。
                // window.__KYO_NO_GA フラグを立てて、trackEvent / AnalyticsRouteTracker
                // 側のガードと連動。これにより指標がクリーンに保たれる。
                window.__KYO_NO_GA = (typeof location !== 'undefined' && location.pathname && location.pathname.indexOf('/admin') === 0);
                if (!window.__KYO_NO_GA) {
                  window.dataLayer = window.dataLayer || [];
                  window.gtag = window.gtag || function(){dataLayer.push(arguments);};
                  gtag('js', new Date());
                  gtag('config', '${gaId}', { send_page_view: true });
                } else {
                  // adminでも gtag シンボル自体は no-op で定義しておく（参照エラー防止）
                  window.gtag = window.gtag || function(){};
                }
              `}
            </Script>
            {/* GA 本体スクリプト。adminページではフラグで読み込みも止める
                （beforeInteractive で立てた window.__KYO_NO_GA を見て、true なら src を空にして
                 ネットワークリクエスト自体を発生させない）。
                Next.js Script は src 必須なので、ダミー data:URI で no-op にしておく。 */}
            <Script
              id="ga-tag-loader"
              strategy="afterInteractive"
            >{`
              (function(){
                if (window.__KYO_NO_GA) return;
                var s = document.createElement('script');
                s.async = true;
                s.src = 'https://www.googletagmanager.com/gtag/js?id=${gaId}';
                document.head.appendChild(s);
              })();
            `}</Script>
          </>
        )}

        {/* Microsoft Clarity
            CWV対策: lazyOnload に変更（idle中にロード、INP/TBT に効く）。
            Clarity はセッション計測なので afterInteractive → lazyOnload にしてもデータ取得への影響は限定的。 */}
        {clarityId && (
          <Script id="clarity-init" strategy="lazyOnload">
            {`
              if (window.__KYO_NO_GA) {} else
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `}
          </Script>
        )}

        {/* AdSense スクリプト（adsbygoogle.js）
            head ではなく afterInteractive(=メイン JS の後) で読み込み、LCP/TBT を改善。
            審査クローラは body 内の adsbygoogle.js でも検出するため「準備中」状態には
            影響しない（meta google-adsense-account も head に残している）。
            <ins>(AdSlot) は ADSENSE_ENABLED で別制御。

            data-overlays="bottom" (2026-08-04):
            自動広告のアンカー広告を「下部のみ」に固定する。実測(2026-08-04・本番/375px)では
            position:fixed top:0 の上部アンカーが 248px ＝ モバイル画面(812px)の 30.5% を常時占有し、
            ヘッダー68pxと合わせて第一画面の39%が広告とクロームで埋まっていた。
            アンカーは28日で収益の44.2%(¥4,767)・可視率93.5%を稼ぐ最優秀枠なので枠自体は残し、
            位置だけ下部へ移す。下部でも常時画面内にいるため可視率はほぼ維持される見込み。
            Google は「上部を無効にすると収益が下がる可能性がある」と注意しているため、
            ここは 8月中旬に AdSense のフォーマット別実測で必ず振り返ること(想定リスク 月-¥0〜1,000)。
            なおこの属性は管理画面の「オーバーレイ形式 → アンカー広告の位置」設定を上書きする。
            戻すときはこの属性を消すだけでよい。 */}
        {ADSENSE_PUB_ID_CONFIGURED && (
          <Script
            id="adsense-loader"
            src={ADSENSE_SCRIPT_SRC}
            strategy="afterInteractive"
            crossOrigin="anonymous"
            data-overlays="bottom"
          />
        )}

        {/* PWA: Service Worker 登録（本番のみ）と、2回目以降の訪問者向けインストール促進 */}
        <PWARegister />
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
