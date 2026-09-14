import Link from 'next/link';
import { V2Img } from '@/components/v2/V2Base';
import { KkIcon } from './KkIcon';

export type KkRowItem = {
  href: string;
  title: string;
  sub?: string;
  /** date 型で表示する日付ラベル（例: 2026.09.06） */
  date?: string;
  img?: string;
  /** 画像フォールバック用シード */
  seed?: string;
};

/**
 * 行リスト。
 * - arrow: 「タイトル →」（あわせて読みたい）
 * - rank : 「1 タイトル [サムネ]」（人気ランキング）
 * - date : 「[サムネ] 日付 / タイトル」（新着記事）
 * 既存の内部リンクを減らさないため、href はそのまま渡す。
 */
export function KkRowList({
  items,
  variant = 'arrow',
  divided,
  className,
  label,
}: {
  items: KkRowItem[];
  variant?: 'arrow' | 'rank' | 'date';
  /** 枠線なしの区切り線スタイル */
  divided?: boolean;
  className?: string;
  /** aria-label */
  label?: string;
}) {
  if (!items.length) return null;
  return (
    <div className={'kk-rows' + (divided ? ' divided' : '') + (className ? ' ' + className : '')} aria-label={label}>
      {items.map((it, i) => (
        <Link key={it.href + i} href={it.href} className="kk-row">
          {variant === 'rank' && <span className="kk-row-num">{i + 1}</span>}
          {variant === 'date' && (
            <span className="kk-row-thumb">
              <V2Img src={it.img} seed={it.seed ?? it.href} alt="" />
            </span>
          )}
          <span className="kk-row-body">
            {variant === 'date' && it.date && <span className="kk-row-date">{it.date}</span>}
            <span className="kk-row-title">{it.title}</span>
            {it.sub && <span className="kk-row-sub">{it.sub}</span>}
          </span>
          {variant === 'rank' && it.img && (
            <span className="kk-row-thumb">
              <V2Img src={it.img} seed={it.seed ?? it.href} alt="" />
            </span>
          )}
          {variant === 'arrow' && (
            <span className="kk-row-arrow">
              <KkIcon name="arrow-right" size={16} />
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
