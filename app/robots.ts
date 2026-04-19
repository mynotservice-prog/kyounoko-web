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
      // AdSense 広告クローラは全ページ許可（noindexページ /today /plan/ も広告表示の検査対象）
      {
        userAgent: 'Mediapartners-Google',
        allow: '/',
      },
      {
        userAgent: 'AdsBot-Google',
        allow: '/',
      },
      {
        userAgent: 'AdsBot-Google-Mobile',
        allow: '/',
      },
    ],
    sitemap: 'https://kyounoko.jp/sitemap.xml',
    host: 'https://kyounoko.jp',
  };
}
