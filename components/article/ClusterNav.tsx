import Link from 'next/link';
import type { ClusterNav as ClusterNavData } from '@/lib/article-cluster-links';

/**
 * 結論ボックス直下の回遊チップ。「同じお店／同じ区の別テーマ記事」へ 1 タップで移れる。
 * 本文末尾の関連記事は平均滞在 70〜90 秒の読者に届かないため、答えを読み終えた直後に置く。
 */
export function ClusterNav({ nav }: { nav: ClusterNavData }) {
  return (
    <nav className="cluster-nav" aria-label={nav.heading}>
      <span className="cluster-nav-heading">{nav.heading}</span>
      <ul className="cluster-nav-list">
        {nav.items.map((it) => (
          <li key={it.href}>
            <Link href={it.href} className="cluster-nav-chip">
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
