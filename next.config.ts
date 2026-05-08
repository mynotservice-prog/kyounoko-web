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
    ];
  },

  experimental: {
    optimizePackageImports: ['microcms-js-sdk'],
  },
};

export default nextConfig;
