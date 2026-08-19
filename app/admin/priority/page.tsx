import type { Metadata } from 'next';
import Link from 'next/link';
import { getDemandBoard, DEMAND_DAYS, ACTION_SIDE } from '@/lib/content-demand';
import { PageHeader, StatCard, StatGrid, Card, Mono } from '@/components/admin/ui';
import { PriorityClient } from './PriorityClient';

export const revalidate = 1800; // 30分

export const metadata: Metadata = {
  title: '需要 × 優先度 · Admin · きょうのこ',
  robots: { index: false, follow: false },
};

/**
 * /admin/priority
 *
 * 「どの記事・スポットが見られているか」と「その中身が今どういう状態か」を
 * 1行に並べ、次に手を入れるべき順に並べ替える面。
 *
 * これまで需要（/admin/seo）と状態（/admin/insights・/admin/spots/freshness）が
 * 別画面だったため、突き合わせが目視作業になっていた。判断に必要な2つの数字が
 * 同じ行にないと優先順位は決まらない、というのがこの面を作った理由。
 *
 * 判定ロジックとしきい値は lib/content-demand.ts に集約。
 */
export default async function PriorityPage() {
  const board = await getDemandBoard(1000);

  if (!board.configured) {
    return (
      <>
        <PageHeader title="需要 × 優先度" subtitle="Search Console 未連携" />
        <Card title="セットアップが必要">
          <p style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--ink-600)', margin: 0 }}>
            この画面は Search Console のページ別データを起点にしています。
            <br />
            Vercel の環境変数に <Mono>SEARCH_CONSOLE_SITE_URL</Mono>（例{' '}
            <Mono>sc-domain:kyounoko.jp</Mono>）と <Mono>GOOGLE_APPLICATION_CREDENTIALS_JSON</Mono>{' '}
            を設定し、そのサービスアカウントを Search Console のユーザーに追加してください。
          </p>
        </Card>
      </>
    );
  }

  const { rows, totals, bands } = board;
  const attack = rows.filter((r) => ACTION_SIDE[r.action] === 'attack').sort((a, b) => b.score - a.score);
  const defend = rows.filter((r) => ACTION_SIDE[r.action] === 'defend');
  // 全211件を足した合計は「全部やったら」の理論値で現実味がないので、まず着手する10件で示す
  const top10Upside = attack.slice(0, 10).reduce((s, r) => s + r.score, 0);
  const defendClicks = defend.reduce((s, r) => s + r.clicks, 0);
  const clickDelta = totals.prevClicks > 0 ? (totals.clicks - totals.prevClicks) / totals.prevClicks : 0;

  // クライアントに渡すのは需要のある行だけ（全991行を送ると描画コストだけ増えて読めない）
  const visible = rows.filter((r) => r.clicks > 0 || r.impressions >= 100);
  const omitted = rows.length - visible.length;

  return (
    <>
      <PageHeader
        title="需要 × 優先度"
        subtitle={`過去${DEMAND_DAYS}日の検索実績と、記事品質・スポット鮮度を突き合わせた作業キュー（${rows.length}ページ）`}
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/admin/seo" className="admin-hover-accent" style={linkBtn}>
              SEO詳細
            </Link>
            <Link href="/admin/insights" className="admin-hover-accent" style={linkBtn}>
              記事品質
            </Link>
          </div>
        }
      />

      <StatGrid>
        <StatCard
          label={`クリック（${DEMAND_DAYS}日）`}
          value={totals.clicks.toLocaleString('en-US')}
          delta={totals.prevClicks > 0 ? `${clickDelta >= 0 ? '+' : ''}${Math.round(clickDelta * 100)}%` : undefined}
          deltaNegative={clickDelta < 0}
          sub={`前${DEMAND_DAYS}日 ${totals.prevClicks.toLocaleString('en-US')}`}
        />
        <StatCard label="表示回数" value={totals.impressions.toLocaleString('en-US')} />
        <StatCard label="平均CTR" value={`${(totals.ctr * 100).toFixed(2)}%`} sub={`平均${totals.position.toFixed(1)}位`} />
        <StatCard
          label="増やす候補"
          value={`${attack.length} 件`}
          sub={`上位10件で +${Math.round(top10Upside).toLocaleString('en-US')} クリック/${DEMAND_DAYS}日`}
        />
        <StatCard
          label="守る候補"
          value={`${defend.length} 件`}
          deltaNegative={defend.length > 0}
          delta={defend.length > 0 ? '要確認' : undefined}
          sub={`${defendClicks.toLocaleString('en-US')} クリック分の情報が未確認/古い`}
        />
        <StatCard
          label={`PV（GA4・${DEMAND_DAYS}日）`}
          value={board.ga4 ? board.ga4.totalPv.toLocaleString('en-US') : '未連携'}
          sub={
            board.ga4
              ? `下表のページで ${board.ga4.matchedPv.toLocaleString('en-US')} / 一覧・トップ等 ${board.ga4.unmatchedPv.toLocaleString('en-US')}`
              : 'GA4_PROPERTY_ID 未設定'
          }
        />
      </StatGrid>

      <PriorityClient
        rows={visible}
        omitted={omitted}
        days={DEMAND_DAYS}
        hasGa4={board.ga4 != null}
        unmatchedPv={board.ga4?.unmatchedPv ?? 0}
        unmatchedPages={board.ga4?.unmatchedPages ?? 0}
      />

      <div style={{ marginTop: 14 }}>
        <Card
          title="判定に使っている期待CTR"
          description="外部のベンチマーク表ではなく、このサイト自身の順位帯別CTR（表示300回以上のページの中央値）を基準にしている。ページ数が足りない帯だけ固定値で代替する。"
          bodyPadding={0}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th('left')}>順位帯</th>
                <th style={th('right')}>期待CTR</th>
                <th style={th('right')}>基準ページ数</th>
                <th style={th('right')}>この帯の表示回数</th>
                <th style={th('left')}>出所</th>
              </tr>
            </thead>
            <tbody>
              {bands.map((b) => (
                <tr key={b.band} className="admin-row">
                  <td style={td()}>{b.band}</td>
                  <td style={tdNum()}>{(b.ctr * 100).toFixed(2)}%</td>
                  <td style={tdNum()}>{b.pages}</td>
                  <td style={tdNum()}>{b.impressions.toLocaleString('en-US')}</td>
                  <td style={{ ...td(), color: b.measured ? 'var(--ink-600)' : 'var(--warn-fg)' }}>
                    {b.measured ? '実測' : 'ページ数不足のため固定値'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}

const linkBtn: React.CSSProperties = {
  fontSize: 12.5,
  padding: '6px 12px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-sm)',
  color: 'var(--ink-600)',
  textDecoration: 'none',
  background: 'var(--bg-card)',
};

function th(align: 'left' | 'right'): React.CSSProperties {
  return {
    textAlign: align,
    padding: '9px 18px',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--ink-400)',
    letterSpacing: '.02em',
    borderBottom: '1px solid var(--border-divider)',
    background: 'var(--bg-app)',
  };
}
function td(): React.CSSProperties {
  return { padding: '10px 18px', fontSize: 13, color: 'var(--ink-900)', borderBottom: '1px solid var(--border-faint)' };
}
function tdNum(): React.CSSProperties {
  return { ...td(), textAlign: 'right', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' };
}
