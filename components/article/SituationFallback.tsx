import Link from 'next/link';

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
    <section
      aria-labelledby="situation-fallback-heading"
      style={{
        margin: '56px 0 0',
        padding: 24,
        background: 'var(--paper-card, #FFF8EB)',
        border: '1px solid var(--line, #e8e2d4)',
        borderRadius: 'var(--radius-lg, 14px)',
      }}
    >
      <h2
        id="situation-fallback-heading"
        style={{
          fontFamily: 'var(--font-mincho)',
          fontWeight: 600,
          fontSize: 20,
          margin: '0 0 6px',
        }}
      >
        困ったときの別解
      </h2>
      <p style={{ fontSize: 13, color: 'var(--ink-sub)', margin: '0 0 16px', lineHeight: 1.7 }}>
        この記事の答えが合わなかった人向けの、別ルート。
      </p>
      <ul
        style={{
          display: 'grid',
          gap: 10,
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              style={{
                display: 'block',
                padding: '12px 14px',
                background: 'var(--paper, #fff)',
                border: '1px solid var(--line, #e8e2d4)',
                borderRadius: 'var(--radius-md, 10px)',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{it.label}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-sub)' }}>{it.hint}</div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
