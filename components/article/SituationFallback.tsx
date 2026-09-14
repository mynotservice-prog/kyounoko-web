import Link from 'next/link';
import { KkIcon } from '@/components/kk/KkIcon';

/**
 * 「困った別解」テンプレートブロック。
 *
 * 各記事の末尾近くに統一フォーマットで配置し、
 *   - 雨の日 → /tag/amenohi
 *   - 平日夜 → /tag/heijitsu-yoru
 *   - 休日詰む → /category/today-mawasu
 *   - お金かけたくない → /tag/muryou
 *   - 0-1歳 → /tag/0-1sai
 * のような「行き詰まった時の別解」へのリンクハブを提供する。
 *
 * 目的:
 *  - 回遊改善（sessions/user 1.27 → 1.7 目標）
 *  - 未登録記事への内部リンクを増やしGoogleクロールを促進
 *  - AIに「困ったらここを見ろ」というメタ情報を渡す（AI検索引用率向上）
 */

type FallbackItem = {
  label: string;
  href: string;
  hint: string;
};

const DEFAULT_ITEMS: FallbackItem[] = [
  { label: '雨の日に詰んだ', href: '/tag/amenohi', hint: '雨でも遊べる屋内・室内向け' },
  { label: '平日夜が回らない', href: '/tag/heijitsu-yoru', hint: '夕食〜寝かしつけの時短' },
  { label: '休日のネタ切れ', href: '/category/today-mawasu', hint: 'おでかけ/家遊びの切り札' },
  { label: 'お金をかけたくない', href: '/tag/muryou', hint: '無料・低予算の選択肢' },
];

export function SituationFallback({ items = DEFAULT_ITEMS }: { items?: FallbackItem[] }) {
  return (
    <section aria-labelledby="situation-fallback-heading" className="av3-fallback">
      <h2 id="situation-fallback-heading" className="av3-fallback-title">
        困ったときの別解
      </h2>
      <p className="av3-fallback-lead">この記事の答えが合わなかった人向けの、別ルート。</p>
      <ul className="av3-fallback-list">
        {items.map((it) => (
          <li key={it.href}>
            <Link href={it.href} className="av3-fallback-row">
              <span className="av3-fallback-label">{it.label}</span>
              <span className="av3-fallback-hint">{it.hint}</span>
              <span className="av3-fallback-arrow" aria-hidden="true">
                <KkIcon name="arrow-right" size={15} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
