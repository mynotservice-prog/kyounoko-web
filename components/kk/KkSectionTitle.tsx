import Link from 'next/link';
import type { ReactNode } from 'react';
import { KkIcon } from './KkIcon';

/**
 * 「＼ 見出し ……… すべて見る →」。
 * `as` で h2 / h3 / div を選ぶ。**既存ページでは元の見出しタグを変えない**（SEO照合のため）。
 */
export function KkSectionTitle({
  title,
  as = 'h2',
  id,
  moreHref,
  more = 'すべて見る',
  plain,
  children,
}: {
  title: ReactNode;
  as?: 'h2' | 'h3' | 'div';
  id?: string;
  moreHref?: string;
  more?: string;
  /** 斜線アクセントを出さない */
  plain?: boolean;
  /** 見出し右側に置く任意ノード（moreHref より優先） */
  children?: ReactNode;
}) {
  const Tag = as;
  return (
    <div className="kk-sec-head">
      <Tag id={id} className={'kk-sec-title' + (plain ? ' plain' : '')}>
        {title}
      </Tag>
      {children ??
        (moreHref ? (
          <Link href={moreHref} className="kk-sec-more">
            {more}
            <KkIcon name="arrow-right" size={13} />
          </Link>
        ) : null)}
    </div>
  );
}
