import type { Metadata } from 'next';
import Link from 'next/link';
import { getEventStats, isGA4Configured, type EventStat } from '@/lib/ga4-events';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Events · Admin · きょうのこ',
  robots: { index: false, follow: false },
};

/**
 * /admin/events — GA4 で計測しているサイト内カスタムイベント12種の
 * 過去7日間の発火数 + 主要パラメータ上位値を可視化する管理者向けダッシュボード。
 *
 * - GA4 Data API が未設定 / エラー時はカードの枠だけ表示してプレースホルダを出す。
 *   build を落とさないため try/catch でラップ済 (getEventStats 内部)。
 * - SSR (force-dynamic): リクエスト時に毎回 GA4 を叩く。キャッシュしないことで
 *   管理者が最新数字を確認できる。
 */
type EventDef = {
  name: string;
  /** 日本語表示名 */
  jaName: string;
  /** TOP3 集計対象の主要パラメータ名 (null なら集計しない) */
  primaryParam: string | null;
  /** どこで発火しているかの簡易メモ */
  note?: string;
};

const EVENT_DEFS: EventDef[] = [
  { name: 'today_finder_search', jaName: 'きょうのこ探索 検索実行', primaryParam: 'mode', note: 'TOP の TodayFinder で検索' },
  { name: 'today_finder_random', jaName: 'きょうのこ探索 おまかせ', primaryParam: null, note: '「迷ったらお任せで」ボタン' },
  { name: 'station_search_select', jaName: '駅検索 選択', primaryParam: 'station_slug', note: 'TOP の駅サーチ候補クリック' },
  { name: 'favorite_add', jaName: 'お気に入り追加', primaryParam: 'type', note: '★ハートボタン' },
  { name: 'favorite_remove', jaName: 'お気に入り解除', primaryParam: 'type' },
  { name: 'tried_click', jaName: '行ったよ クリック', primaryParam: 'slug', note: 'スポットの「行った」マーク' },
  { name: 'affiliate_click', jaName: 'アフィリエイト クリック', primaryParam: 'provider', note: '外部リンク誘導' },
  { name: 'shindan_start', jaName: '診断 開始', primaryParam: 'tool_id', note: 'ベビーカー診断など' },
  { name: 'shindan_complete', jaName: '診断 完了', primaryParam: 'result' },
  { name: 'download_click', jaName: 'PDF/印刷 クリック', primaryParam: 'doc_id' },
  { name: 'share_click', jaName: 'シェア クリック', primaryParam: 'platform', note: 'X / LINE / Facebook / コピー' },
  { name: 'toc_click', jaName: '目次クリック', primaryParam: 'heading_id', note: '記事の目次から見出し移動' },
  { name: 'ab_assignment', jaName: 'A/B 割当', primaryParam: 'experiment_id', note: '実験割当ログ' },
  { name: 'hero_cta_click', jaName: 'ヒーロー CTA クリック', primaryParam: 'variant', note: 'TOP の主要ボタン' },
];

export default async function AdminEventsPage() {
  const result = await getEventStats({
    eventNames: EVENT_DEFS.map((e) => e.name),
    primaryParamByEvent: Object.fromEntries(EVENT_DEFS.map((e) => [e.name, e.primaryParam])),
    days: 7,
  });

  const configured = result.configured;
  const days = configured ? result.days : 7;
  const totalCount = configured
    ? Object.values(result.stats).reduce((s, v) => s + v.count, 0)
    : 0;
  const activeEventCount = configured
    ? Object.values(result.stats).filter((s) => s.count > 0).length
    : 0;

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 26, margin: '0 0 6px' }}>
          イベント計測ダッシュボード
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-mute)', margin: 0 }}>
          過去{days}日間 · サイト内カスタムイベント {EVENT_DEFS.length}種
          {configured && (
            <>
              {' '}· 合計 <strong style={{ color: 'var(--ink)' }}>{totalCount.toLocaleString()}</strong> 件 ·
              発火イベント <strong style={{ color: 'var(--ink)' }}>{activeEventCount}</strong>/{EVENT_DEFS.length}
            </>
          )}
        </p>
      </div>

      {!configured && (
        <div
          style={{
            marginBottom: 24,
            padding: '14px 18px',
            background: 'var(--paper-card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            fontSize: 13,
            color: 'var(--ink-sub)',
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: 'var(--clay-deep)' }}>データ取得未連携</strong> —
          GA4 Data API の認証情報が未設定のため、件数は表示できません。
          <code style={{ background: 'var(--paper-deep)', padding: '1px 6px', borderRadius: 3, margin: '0 4px', fontSize: 12 }}>
            GA4_PROPERTY_ID
          </code>
          と
          <code style={{ background: 'var(--paper-deep)', padding: '1px 6px', borderRadius: 3, margin: '0 4px', fontSize: 12 }}>
            GOOGLE_APPLICATION_CREDENTIALS_JSON
          </code>
          を環境変数に設定してください。
          {'reason' in result && result.reason && (
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--ink-mute)' }}>
              理由: {result.reason}
            </div>
          )}
        </div>
      )}

      <section>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 14,
          }}
        >
          {EVENT_DEFS.map((def) => {
            const stat: EventStat | undefined = configured ? result.stats[def.name] : undefined;
            return <EventCard key={def.name} def={def} stat={stat} days={days} configured={configured} />;
          })}
        </div>
      </section>

      <div
        style={{
          marginTop: 40,
          padding: 20,
          background: 'var(--paper-card)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-mincho)', fontSize: 16, margin: '0 0 8px' }}>関連</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.95 }}>
          <li><Link href="/admin/insights">記事品質ダッシュボード</Link></li>
          <li><Link href="/admin">管理ダッシュボード</Link></li>
        </ul>
        <p style={{ marginTop: 12, fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.7 }}>
          GA4 のカスタムイベント params (例: <code>type</code>, <code>slug</code>) を
          dimension として参照するには、GA4 管理画面の「カスタム定義」で対応する
          カスタムディメンションを作成しておく必要があります。未作成の param は
          上位値が空欄になります。
        </p>
      </div>
    </>
  );
}

// ====================== UI ======================

function EventCard({
  def,
  stat,
  days,
  configured,
}: {
  def: EventDef;
  stat: EventStat | undefined;
  days: number;
  configured: boolean;
}) {
  const count = stat?.count ?? 0;
  const dim = configured && count === 0;
  return (
    <div
      style={{
        background: 'var(--paper-card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        opacity: dim ? 0.7 : 1,
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4 }}>
          {def.jaName}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-inter), monospace',
            fontSize: 11,
            color: 'var(--ink-mute)',
            marginTop: 2,
          }}
        >
          {def.name}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span
          style={{
            fontFamily: 'var(--font-mincho), serif',
            fontSize: 28,
            fontWeight: 700,
            color: configured ? 'var(--ink)' : 'var(--ink-mute)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {configured ? count.toLocaleString() : '—'}
        </span>
        <span style={{ fontSize: 12, color: 'var(--ink-sub)' }}>件 / {days}日</span>
      </div>

      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 8 }}>
        {def.primaryParam ? (
          stat && stat.topParams.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {stat.topParams.map((p) => (
                <div
                  key={p.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: 'var(--ink-sub)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '70%',
                    }}
                    title={p.label}
                  >
                    {p.label}
                  </span>
                  <span>{p.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
              {configured
                ? count > 0
                  ? `param=${def.primaryParam} のデータなし (カスタム定義未作成?)`
                  : `param=${def.primaryParam}`
                : `param=${def.primaryParam}`}
            </div>
          )
        ) : (
          <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
            (param 集計なし)
          </div>
        )}
      </div>

      {def.note && (
        <div style={{ fontSize: 10, color: 'var(--ink-mute)', lineHeight: 1.5 }}>
          {def.note}
        </div>
      )}
    </div>
  );
}
