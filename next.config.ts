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
    // CDN（Cloudflare）に edge キャッシュを効かせるための共通 Cache-Control。
    // - max-age=0, must-revalidate: ブラウザは毎回再検証（ユーザーに常に新鮮なHTMLを返す）
    // - s-maxage / CDN-Cache-Control: CDN（Cloudflare）には 1h キャッシュさせる
    // - stale-while-revalidate=86400: 1h過ぎても 24h は古いキャッシュを返しつつ裏で再取得
    // - Cloudflare は CDN-Cache-Control を最優先、なければ s-maxage を尊重する仕様
    const edgeCache = 'public, max-age=0, must-revalidate, s-maxage=3600, stale-while-revalidate=86400';
    const cdnCache = 'public, max-age=3600, stale-while-revalidate=86400';

    // スポット詳細は /admin/spots/edit から画像・本文を編集するため、CDNキャッシュを
    // 短くして編集が概ね1分以内に本番反映されるようにする（保存時の revalidateTag/Path で
    // Vercelオリジンは即時更新されるが、Cloudflare が長時間キャッシュすると公開ページに出ない）。
    const spotEdgeCache = 'public, max-age=0, must-revalidate, s-maxage=60, stale-while-revalidate=60';
    const spotCdnCache = 'public, max-age=60, stale-while-revalidate=60';

    return [
      // 全パス共通のセキュリティヘッダ
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // 静的HTMLとして扱ってよいページ群を CDN にキャッシュさせる。
      // Next.js の ISR (revalidate=3600) と整合させ、CF edge HIT 率を上げる。
      // article/spot/category/tag/station/plan は全部 HTML 配信＆動的データなしなのでキャッシュOK。
      {
        source: '/article/:slug*',
        headers: [
          { key: 'Cache-Control', value: edgeCache },
          { key: 'CDN-Cache-Control', value: cdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: cdnCache },
        ],
      },
      {
        source: '/spot/:slug*',
        headers: [
          { key: 'Cache-Control', value: spotEdgeCache },
          { key: 'CDN-Cache-Control', value: spotCdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: spotCdnCache },
        ],
      },
      {
        source: '/category/:slug*',
        headers: [
          { key: 'Cache-Control', value: edgeCache },
          { key: 'CDN-Cache-Control', value: cdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: cdnCache },
        ],
      },
      {
        source: '/tag/:slug*',
        headers: [
          { key: 'Cache-Control', value: edgeCache },
          { key: 'CDN-Cache-Control', value: cdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: cdnCache },
        ],
      },
      {
        source: '/station/:slug*',
        headers: [
          { key: 'Cache-Control', value: edgeCache },
          { key: 'CDN-Cache-Control', value: cdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: cdnCache },
        ],
      },
      {
        source: '/plan/:slug*',
        headers: [
          { key: 'Cache-Control', value: edgeCache },
          { key: 'CDN-Cache-Control', value: cdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: cdnCache },
        ],
      },
      {
        source: '/feature/:slug*',
        headers: [
          { key: 'Cache-Control', value: edgeCache },
          { key: 'CDN-Cache-Control', value: cdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: cdnCache },
        ],
      },
      {
        source: '/kid-reports',
        headers: [
          { key: 'Cache-Control', value: edgeCache },
          { key: 'CDN-Cache-Control', value: cdnCache },
          { key: 'Cloudflare-CDN-Cache-Control', value: cdnCache },
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

      // ===== 大文字混じり URL のフォールバック（削除済） =====
      // 削除理由: Vercel/Next.js の redirects() は path-to-regexp で実装されており、
      // パスマッチが case-insensitive に動作するため、`/Article/:slug*` が
      // `/article/foo` 等にもマッチしてしまい、destination = `/article/:slug*` ＝
      // 自分自身への 308 無限ループを発生させていた。
      // 大文字URLは実質クロールされておらず、削除しても SEO 影響は無視できる。
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
