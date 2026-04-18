import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/today?*'], // /today の絞り込み結果は noindex 想定
      },
    ],
    sitemap: 'https://kyounoko.jp/sitemap.xml',
    host: 'https://kyounoko.jp',
  };
}
