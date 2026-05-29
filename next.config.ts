import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.microcms-assets.io',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // ===== Search Console 404 → 301 恒久リダイレクト =====
      // 旧 /issue/* ルート（未実装ながら旧sitemapに入っていた）
      { source: '/issue/rainy-day', destination: '/tag/amenohi', permanent: true },
      { source: '/issue/dinner', destination: '/category/today-taberu', permanent: true },
      { source: '/issue/home-play', destination: '/tag/ie-de', permanent: true },
      { source: '/issue/weekend', destination: '/tag/shumatsu', permanent: true },
      { source: '/issue/heijitsu-yoru', destination: '/tag/heijitsu-yoru', permanent: true },
      { source: '/issue/shippai-shinai', destination: '/', permanent: true },
      { source: '/issue/:slug*', destination: '/', permanent: true }, // それ以外のissue/は全部トップへ

      // 旧 /age/* ルート → 年齢タグへ
      { source: '/age/0-1', destination: '/tag/0-1sai', permanent: true },
      { source: '/age/2-3', destination: '/tag/2-3sai', permanent: true },
      { source: '/age/4-6', destination: '/tag/4-6sai', permanent: true },
      { source: '/age/:slug*', destination: '/', permanent: true },

      // 定義されていない旧タグ → 代替タグ/記事へ
      { source: '/tag/lunch-friendly', destination: '/tag/odekake', permanent: true },
      { source: '/tag/brothers-ok', destination: '/tag/odekake', permanent: true },
      { source: '/tag/elevator', destination: '/tag/odekake', permanent: true },
      { source: '/tag/indoor', destination: '/tag/ie-de', permanent: true },
      { source: '/tag/kids-chair', destination: '/article/baby-chair-ranking', permanent: true },
      { source: '/tag/onep-friendly', destination: '/tag/odekake', permanent: true },
      { source: '/tag/rain-ok', destination: '/tag/amenohi', permanent: true },
      { source: '/tag/babycar', destination: '/article/babycar-ranking-2026', permanent: true },
      { source: '/tag/close', destination: '/tag/odekake', permanent: true },
      { source: '/tag/diaper-table', destination: '/tag/odekake', permanent: true },
      { source: '/tag/heat-ok', destination: '/tag/moushobi', permanent: true },

      // ===== 旧記事URL → 現存する近い記事へ（Search Console 5xx/404対策）=====
      // Search Consoleが「サーバーエラー」として報告していたが実態は404の旧URL群
      { source: '/article/indoor-spot-tokyo', destination: '/article/amenohi-indoor-spots-tokyo-15', permanent: true },
      { source: '/article/kodure-hanami-tokyo', destination: '/article/sakura-ohanami-kodzure-spots', permanent: true },
      { source: '/article/rainy-2yo-home-play', destination: '/article/amenohi-ie-asobi-2-3sai', permanent: true },
      { source: '/article/nyuuen-junbi-list', destination: '/article/youchien-nyuuen-junbi-list', permanent: true },
      { source: '/article/craft-4yo-home', destination: '/article/kousaku-4-6sai-10pattern', permanent: true },
      { source: '/article/tsukareta-hi-saitekikai', destination: '/category/today-mawasu', permanent: true },
      { source: '/article/babycar-lunch-kichijoji', destination: '/article/bebycar-ok-cafe-15', permanent: true },
      { source: '/article/gw-kodure-tokyo', destination: '/article/kosodate-muryou-spots-tokyo', permanent: true },

      // /search はサイト内検索ページ実装に切り替え済（SearchAction 用）。
      // ここでリダイレクトすると WebSite SearchAction が無効化されるので残さない。

      // ===== 2026-05 追加: コンテンツ内 壊れた内部リンク 14個 → 既存記事に301 =====
      // sed で本文内のリンクは置換済みだが、Google が古いURLをキャッシュしている可能性、
      // および外部からの被リンク救済のため 301 リダイレクトを設定する。
      { source: '/article/0sai-ikuji', destination: '/article/0sai-ikuji-kanzen-map', permanent: true },
      { source: '/article/eigo-ie-de-furemase-5kufuu', destination: '/article/eigo-asobi-ie-de-4-6sai', permanent: true },
      { source: '/article/ikukyu-chichi-toru', destination: '/article/ikukyu-fukuki-junbi', permanent: true },
      { source: '/article/kaiten-sushi-chain-kodzure-5sha-hikaku', destination: '/article/kaiten-sushi-4chain-comparison', permanent: true },
      { source: '/article/kodomo-okane-okozukai-itsukara', destination: '/article/kodomo-okozukai-itsukara', permanent: true },
      { source: '/article/kyaraben-kantan-techniques-7', destination: '/article/kodomo-no-hi-kyaraben', permanent: true },
      { source: '/article/naraigoto-ranking', destination: '/article/kodomo-naraigoto-tsuduki-kotsu', permanent: true },
      { source: '/article/satou-kodzure-koryaku', destination: '/article/kodzure-yakiniku-anzen-kanzen-guide', permanent: true },
      { source: '/article/station', destination: '/station', permanent: true },
      { source: '/article/tomobataraki-kaji', destination: '/article/tomobataraki-kaji-bunkatsu', permanent: true },
      { source: '/article/wanope-mawashi-kihon', destination: '/article/wanope-ikuji-toha', permanent: true },
      { source: '/article/yakiniku-chain-kodzure-5sha-hikaku', destination: '/article/kodzure-yakiniku-shabu-7', permanent: true },
      { source: '/article/yojishoku-kanryouki-1week-rota', destination: '/article/yojishoku-reitou-tsukurioki', permanent: true },
      { source: '/article/furusato-nouzei-kosodate-ikuji', destination: '/category/today-mawasu', permanent: true },

      // ===== 旧 /plans, /plan ルート救済 =====
      { source: '/plans', destination: '/', permanent: true },
      { source: '/plan', destination: '/', permanent: true },

      // ===== 大文字混じり URL のフォールバック =====
      // Next.js のデフォルトは大文字小文字を区別する。Google が大文字版を拾った場合に対応
      { source: '/Article/:slug*', destination: '/article/:slug*', permanent: true },
      { source: '/Tag/:slug*', destination: '/tag/:slug*', permanent: true },
      { source: '/Category/:slug*', destination: '/category/:slug*', permanent: true },
      { source: '/Spot/:slug*', destination: '/spot/:slug*', permanent: true },
      { source: '/Station/:slug*', destination: '/station/:slug*', permanent: true },
    ];
  },

  experimental: {
    optimizePackageImports: ['microcms-js-sdk'],
  },

  // Vercel Function バンドルから public/ 配下の静的画像を除外する。
  // lib/articles.ts や lib/plans.ts が hero画像の存在確認のため
  // path.join(process.cwd(), 'public', ...) + fs.existsSync を使うため、
  // Next.js が「実行時に必要な可能性あり」と判断して /api/* のFunctionに
  // 画像ファイルを巻き込み、300MB上限超過でビルド失敗するのを防ぐ。
  outputFileTracingExcludes: {
    '*': [
      'public/hero-ai/**',
      'public/hero/**',
      'public/photos/**',
      'public/icons/**',
      '.next/cache/**',
    ],
  },
};

export default nextConfig;
