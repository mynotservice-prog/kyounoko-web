import Link from 'next/link';
import { KkIcon } from '@/components/kk/KkIcon';

export type ArticleRowItem = {
  href: string;
  title: string;
  /** タイトル下の薄い補足（カテゴリ名など） */
  sub?: string;
  /** サムネイル（既存の hero を渡す。画像 src を落とさないため <img src> をそのまま出す） */
  img?: string;
  /** img の alt（既存カードと同じ文言を渡す） */
  imgAlt?: string;
};

/**
 * 記事末尾の「関連する記事」行リスト（KkRowList の arrow 型にサムネイルを足したもの）。
 * 既存のカードが出していた <img src> を維持しつつ、行リストにして回遊しやすくする。
 */
export function ArticleRowList({ items, label }: { items: ArticleRowItem[]; label?: string }) {
  if (!items.length) return null;
  return (
    <div className="kk-rows" aria-label={label}>
      {items.map((it, i) => (
        <Link key={it.href + i} href={it.href} className="kk-row av3-row">
          {it.img && (
            <span className="kk-row-thumb">
              <img src={it.img} alt={it.imgAlt ?? it.title} loading="lazy" decoding="async" />
            </span>
          )}
          <span className="kk-row-body">
            <span className="kk-row-title">{it.title}</span>
            {it.sub && <span className="kk-row-sub">{it.sub}</span>}
          </span>
          <span className="kk-row-arrow">
            <KkIcon name="arrow-right" size={16} />
          </span>
        </Link>
      ))}
    </div>
  );
}
