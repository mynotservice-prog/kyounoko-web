import type { MetadataRoute } from 'next';

/**
 * robots.txt 設定。
 *
 * 【重要】/_next/ は元々Disallowしていたが、Googleが「robots.txtでブロック」を473件
 * 報告していたため修正。/_next/static/ には CSS/JS が含まれるため、
 * Googlebotがページをフルレンダリングするには Allow が必要。
 * /api/ と /admin/ のみブロック。
 */
export default function robots(): MetadataRoute.Robots {
  // /api/ と /admin/ はサイトの内部・管理画面なので非公開
  const baseDisallow = ['/api/', '/admin/'];

  return {
    rules: [
      // ===== 一般クローラー（Google等）=====
      // /_next/ は Allow に変更（GoogleがCSS/JSを取得してSPA的にレンダリングできるよう）
      {
        userAgent: '*',
        allow: '/',
        disallow: baseDisallow,
      },

      // ===== Googleサービス =====
      { userAgent: 'Mediapartners-Google', allow: '/' },     // AdSense
      { userAgent: 'AdsBot-Google', allow: '/' },
      { userAgent: 'AdsBot-Google-Mobile', allow: '/' },
      { userAgent: 'Googlebot-Image', allow: '/' },          // Google画像検索
      { userAgent: 'Google-Extended', allow: '/' },          // Gemini/Bard学習

      // ===== AI検索クローラー（AIO対策の中核）=====
      // ChatGPT / ChatGPT Search からの引用を受け入れる
      { userAgent: 'GPTBot', allow: '/', disallow: baseDisallow },
      { userAgent: 'OAI-SearchBot', allow: '/', disallow: baseDisallow },
      { userAgent: 'ChatGPT-User', allow: '/', disallow: baseDisallow },

      // Anthropic Claude（ClaudeBot / claude-web）
      { userAgent: 'ClaudeBot', allow: '/', disallow: baseDisallow },
      { userAgent: 'anthropic-ai', allow: '/', disallow: baseDisallow },
      { userAgent: 'claude-web', allow: '/', disallow: baseDisallow },

      // Perplexity（AI検索で成長中）
      { userAgent: 'PerplexityBot', allow: '/', disallow: baseDisallow },
      { userAgent: 'Perplexity-User', allow: '/', disallow: baseDisallow },

      // CommonCrawl（多くのLLM学習データソース）
      { userAgent: 'CCBot', allow: '/', disallow: baseDisallow },

      // Meta AI（Llama）
      { userAgent: 'Meta-ExternalAgent', allow: '/', disallow: baseDisallow },
      { userAgent: 'FacebookBot', allow: '/' },

      // Bing / Copilot
      { userAgent: 'bingbot', allow: '/' },
      { userAgent: 'BingPreview', allow: '/' },

      // Applebot（Siri・Spotlight・Apple Intelligence）
      { userAgent: 'Applebot', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
    ],
    sitemap: [
      'https://kyounoko.jp/sitemap.xml',
    ],
    host: 'https://kyounoko.jp',
  };
}
