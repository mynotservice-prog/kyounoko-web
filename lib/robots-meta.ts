import type { Metadata } from 'next';

/**
 * index 可能なページに付ける robots ディレクティブ。
 *
 * 【なぜ必要か】
 * Next.js の generateMetadata が `robots` キーを返すと、`app/layout.tsx` の robots 設定は
 * 継承されない。`robots: cond ? { index: false } : undefined` と書くと、index 側で
 * **robots メタタグ自体が出力されなくなる**（2026-08-03 に本番HTMLで実測。
 * /spot/*, /spots/*, /events, /ranking の4系統で `<meta name="googlebot">` が欠落していた）。
 *
 * `max-image-preview:large` が無いと Google は画像プレビューを小サイズ扱いにするため、
 * Discover の大判カード枠に載る資格を実質的に失う。Discover 判定を可能にする前提条件なので、
 * index 可能なページには必ずこの定数を渡す。
 *
 * 使い方: `robots: shouldNoindex ? { index: false, follow: true } : INDEXABLE_ROBOTS`
 * ※ noindex 側の指定は絶対に変えないこと（noindex ページに index を付けない）。
 */
export const INDEXABLE_ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large' as const,
    'max-snippet': -1,
    'max-video-preview': -1,
  },
} satisfies Metadata['robots'];
