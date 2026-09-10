import Link from 'next/link';

export type TopCategory = {
  slug: string;
  name: string;
};

/**
 * カテゴリから探す（全8カテゴリ・SEO主要導線）。
 * 2026-09 第2版: 多色のアイコンタイルをやめ、罫線だけの静かなチップ列にした。
 * リンク先・文言は従来どおり。
 */
export function TopCategoryGrid({ categories }: { categories: TopCategory[] }) {
  return (
    <div className="tv3-cat-chips kk-chips">
      {categories.map((c) => (
        <Link key={c.slug} href={`/category/${c.slug}`} className="kk-chip">
          {c.name}
        </Link>
      ))}
    </div>
  );
}
