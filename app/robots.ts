import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ===== 一般クローラー（Google等）=====
      {
        userAgent: '*',
        allow: '/',
        // /today, /plan/* は page 側で noindex、admin/api/_next は非公開
        disallow: ['/api/', '/admin/', '/_next/'],
      },

      // ===== Googleサービス =====
      { userAgent: 'Mediapartners-Google', allow: '/' },     // AdSense
      { userAgent: 'AdsBot-Google', allow: '/' },
      { userAgent: 'AdsBot-Google-Mobile', allow: '/' },
      { userAgent: 'Googlebot-Image', allow: '/' },          // Google画像検索
      { userAgent: 'Google-Extended', allow: '/' },          // Gemini/Bard学習

      // ===== AI検索クローラー（AIO対策の中核）=====
      // ChatGPT / ChatGPT Search からの引用を受け入れる
      { userAgent: 'GPTBot', allow: '/', disallow: ['/api/', '/admin/', '/_next/'] },
      { userAgent: 'OAI-SearchBot', allow: '/', disallow: ['/api/', '/admin/', '/_next/'] },
      { userAgent: 'ChatGPT-User', allow: '/', disallow: ['/api/', '/admin/', '/_next/'] },

      // Anthropic Claude（ClaudeBot / claude-web）
      { userAgent: 'ClaudeBot', allow: '/', disallow: ['/api/', '/admin/', '/_next/'] },
      { userAgent: 'anthropic-ai', allow: '/', disallow: ['/api/', '/admin/', '/_next/'] },
      { userAgent: 'claude-web', allow: '/', disallow: ['/api/', '/admin/', '/_next/'] },

      // Perplexity（AI検索で成長中）
      { userAgent: 'PerplexityBot', allow: '/', disallow: ['/api/', '/admin/', '/_next/'] },
      { userAgent: 'Perplexity-User', allow: '/', disallow: ['/api/', '/admin/', '/_next/'] },

      // CommonCrawl（多くのLLM学習データソース）
      { userAgent: 'CCBot', allow: '/', disallow: ['/api/', '/admin/', '/_next/'] },

      // Meta AI（Llama）
      { userAgent: 'Meta-ExternalAgent', allow: '/', disallow: ['/api/', '/admin/', '/_next/'] },
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
