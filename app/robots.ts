import type { MetadataRoute } from 'next';

/**
 * robots.txt 設定。
 *
 * 【重要】/_next/ は元々Disallowしていたが、Googleが「robots.txtでブロック」を473件
 * （全て /_next/static/media/*.woff2 フォントファイル）報告していたため修正。
 * /_next/static/ には CSS/JS/フォントが含まれ、Googlebotがページを
 * フルレンダリングするには Allow が必須。
 *
 * 念のため `/_next/` を明示的に Allow して曖昧さを完全排除する。
 * （`Allow: /` だけでも /_next/ は許可されるが、明示することで
 *  Search Console の robots.txt パーサが確実に「許可」と判定する）
 *
 * Disallow するのは /api/ と /admin/ のみ。
 */
export default function robots(): MetadataRoute.Robots {
  // /api/ と /admin/ はサイトの内部・管理画面なので非公開。
  //
  // 【コスト最適化 2026-07-19】クエリ文字列付きURLと /search を全クローラーで遮断する。
  //   /today?... ・/spots?... ・/spots/[cat]?... ・/events?... ・/search?q=... は searchParams を
  //   読むため Next.js 15 で「動的レンダリング」扱いとなり、CDN でキャッシュされず1リクエスト＝
  //   1 Function 起動になる（Fast Origin Transfer / Fluid CPU / Observability の主要因）。
  //   これらの絞り込み変種は元々 noindex + canonical で検索価値ゼロ（インデックス対象は
  //   すべてクエリ無しのクリーンURL）。noindex はクロール自体は止められないため、robots で
  //   クロールを遮断してクローラー由来の動的 Function 起動を根絶する。クエリ依存の
  //   ページネーション等は存在しないため indexable コンテンツへの影響はない。
  const baseDisallow = ['/api/', '/admin/', '/search', '/*?'];
  // Next.js の静的アセット（CSS/JS/フォント/画像）を明示的に許可
  const baseAllow = ['/', '/_next/'];

  return {
    rules: [
      // ===== 一般クローラー（Google等）=====
      // /_next/ を明示 Allow（CSS/JS/フォントを取得してフルレンダリング可能に）
      {
        userAgent: '*',
        allow: baseAllow,
        disallow: baseDisallow,
      },

      // ===== Googleサービス =====
      { userAgent: 'Mediapartners-Google', allow: baseAllow },     // AdSense
      { userAgent: 'AdsBot-Google', allow: baseAllow },
      { userAgent: 'AdsBot-Google-Mobile', allow: baseAllow },
      { userAgent: 'Googlebot-Image', allow: baseAllow, disallow: baseDisallow },  // Google画像検索
      { userAgent: 'Google-Extended', allow: baseAllow, disallow: baseDisallow },  // Gemini/Bard学習

      // ===== AI検索クローラー（AIO対策の中核）=====
      // ChatGPT / ChatGPT Search からの引用を受け入れる
      { userAgent: 'GPTBot', allow: baseAllow, disallow: baseDisallow },
      { userAgent: 'OAI-SearchBot', allow: baseAllow, disallow: baseDisallow },
      { userAgent: 'ChatGPT-User', allow: baseAllow, disallow: baseDisallow },

      // Anthropic Claude（ClaudeBot / claude-web）
      { userAgent: 'ClaudeBot', allow: baseAllow, disallow: baseDisallow },
      { userAgent: 'anthropic-ai', allow: baseAllow, disallow: baseDisallow },
      { userAgent: 'claude-web', allow: baseAllow, disallow: baseDisallow },

      // Perplexity（AI検索で成長中）
      { userAgent: 'PerplexityBot', allow: baseAllow, disallow: baseDisallow },
      { userAgent: 'Perplexity-User', allow: baseAllow, disallow: baseDisallow },

      // CommonCrawl（多くのLLM学習データソース）
      { userAgent: 'CCBot', allow: baseAllow, disallow: baseDisallow },

      // Meta AI（Llama）
      { userAgent: 'Meta-ExternalAgent', allow: baseAllow, disallow: baseDisallow },
      { userAgent: 'FacebookBot', allow: baseAllow, disallow: baseDisallow },

      // Bing / Copilot
      { userAgent: 'bingbot', allow: baseAllow, disallow: baseDisallow },
      { userAgent: 'BingPreview', allow: baseAllow, disallow: baseDisallow },

      // Applebot（Siri・Spotlight・Apple Intelligence）
      { userAgent: 'Applebot', allow: baseAllow, disallow: baseDisallow },
      { userAgent: 'Applebot-Extended', allow: baseAllow, disallow: baseDisallow },
    ],
    sitemap: [
      'https://kyounoko.jp/sitemap.xml',
    ],
    host: 'https://kyounoko.jp',
  };
}
