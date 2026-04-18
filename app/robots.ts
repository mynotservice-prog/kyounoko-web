import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /today は page 側で noindex 指定。クロール自体は許可して noindex を確実に伝える。
        disallow: ['/api/', '/admin/', '/_next/'],
      },
    ],
    sitemap: 'https://kyounoko.jp/sitemap.xml',
    host: 'https://kyounoko.jp',
  };
}
