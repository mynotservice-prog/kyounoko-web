import type { ReactNode } from 'react';

/**
 * クリーム地のチェックリスト（tone=check）／番号リスト（tone=num）。
 * title は見出しタグにしない（既存の見出し構造を汚さない）。見出しが必要なら呼び出し側で置く。
 */
export function KkCheckList({
  items,
  title,
  tone = 'check',
  color,
  white,
  className,
}: {
  items: ReactNode[];
  title?: ReactNode;
  tone?: 'check' | 'num';
  color?: 'orange' | 'blue';
  white?: boolean;
  className?: string;
}) {
  if (!items.length) return null;
  const cls = ['kk-check', tone === 'num' ? 'num' : '', color === 'blue' ? 'blue' : '', white ? 'white' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  const List = tone === 'num' ? 'ol' : 'ul';
  return (
    <div className={cls}>
      {title && <div className="kk-check-title">{title}</div>}
      <List>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </List>
    </div>
  );
}
