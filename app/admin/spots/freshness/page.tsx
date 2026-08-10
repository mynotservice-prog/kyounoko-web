import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllSpotsWithSlug, SPOT_CATEGORY_LABEL, type SpotCategory } from '@/lib/spots';
import {
  getSpotFreshness,
  recheckPriority,
  formatVerifiedDate,
  isChainRedirected,
  type FreshnessState,
} from '@/lib/spot-verification';
import { PageHeader, StatCard, StatGrid, Card, Badge, Mono } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'スポット鮮度 · Admin · きょうのこ',
  robots: { index: false, follow: false },
};

/**
 * /admin/spots/freshness
 *
 * 施設DBの「最終確認日」を一覧し、再確認すべき順に並べる作業キュー。
 *
 * なぜ必要か: 2026-07 に室内遊び場13本を全数検証したところ掲載施設の3〜5割が
 * 閉店済み・実在しなかった。確認日を持たないDBは資産ではなく負債になる。
 * ここは「どれだけ腐っているか」を運営者の画面に常に出しておくための面。
 *
 * 確認したら lib/spot-facilities.ts（公式裏取り）か lib/kid-reports.ts（実訪問）の
 * 該当エントリを更新し、`node scripts/seed-spot-verification.mjs` を回すと
 * 確認日が更新される（確認日は git のコミット日から機械的に作る）。
 */

const STATE_LABEL: Record<FreshnessState, string> = {
  fresh: '確認済み',
  aging: 'そろそろ',
  stale: '期限切れ',
  unverified: '未確認',
  closed: '閉店済み',
};

const STATE_TONE: Record<FreshnessState, 'ok' | 'warn' | 'neu'> = {
  fresh: 'ok',
  aging: 'warn',
  stale: 'warn',
  unverified: 'neu',
  closed: 'neu',
};

const FILTERS: Array<{ key: string; label: string }> = [
  { key: 'queue', label: '要対応（期限切れ＋未確認）' },
  { key: 'stale', label: '期限切れ' },
  { key: 'unverified', label: '未確認' },
  { key: 'aging', label: 'そろそろ' },
  { key: 'fresh', label: '確認済み' },
  { key: 'closed', label: '閉店済み' },
  { key: 'all', label: 'すべて' },
];

const LIMIT = 150;

export default async function SpotFreshnessPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state: rawState } = await searchParams;
  const filter = FILTERS.some((f) => f.key === rawState) ? rawState! : 'queue';

  const now = new Date();
  const allRows = getAllSpotsWithSlug();
  // 全国チェーン外食は /spot/[slug] が 301 で記事へ飛ぶ＝公開ページが無いので、
  // 再確認キューに載せない（存在しないページを確認しに行くことになる）。
  // チェーンの設備情報はリダイレクト先の記事側が正本。
  const redirectedCount = allRows.filter((r) => isChainRedirected(r.slug)).length;
  const rows = allRows
    .filter(({ slug }) => !isChainRedirected(slug))
    .map(({ slug, spot }) => {
      const f = getSpotFreshness(spot, now);
      return { slug, spot, f, priority: recheckPriority(spot, f) };
    });

  // ── サマリー ──
  const counts = rows.reduce<Record<FreshnessState, number>>(
    (acc, r) => ((acc[r.f.state] += 1), acc),
    { fresh: 0, aging: 0, stale: 0, unverified: 0, closed: 0 },
  );
  const total = rows.length;
  const verified = counts.fresh + counts.aging;
  const coverage = total ? (verified / total) * 100 : 0;

  // ── カテゴリ別 ──
  const byCat = new Map<SpotCategory, { total: number; verified: number; queue: number }>();
  for (const r of rows) {
    const c = byCat.get(r.spot.category) ?? { total: 0, verified: 0, queue: 0 };
    c.total += 1;
    if (r.f.state === 'fresh' || r.f.state === 'aging') c.verified += 1;
    if (r.f.state === 'stale' || r.f.state === 'unverified') c.queue += 1;
    byCat.set(r.spot.category, c);
  }
  const catRows = [...byCat.entries()].sort((a, b) => b[1].queue - a[1].queue);

  // ── キュー ──
  const matches = (s: FreshnessState) =>
    filter === 'all' ? true : filter === 'queue' ? s === 'stale' || s === 'unverified' : s === filter;
  const queue = rows
    .filter((r) => matches(r.f.state))
    .sort((a, b) => b.priority - a.priority || a.spot.name.localeCompare(b.spot.name, 'ja'));

  return (
    <>
      <PageHeader
        title="スポット鮮度"
        subtitle={`対象${total}件のうち確認記録があるのは${verified}件（${coverage.toFixed(0)}%）。確認日は公式裏取り・実訪問の記録からのみ作る（推測で埋めない）。全国チェーン${redirectedCount}件は /spot が301で記事へ飛ぶため集計外。`}
      />

      <StatGrid>
        <StatCard label="確認済み（期限内）" value={counts.fresh} sub="カテゴリ別の有効期限内" />
        <StatCard label="そろそろ再確認" value={counts.aging} sub="有効期限の75%を経過" />
        <StatCard label="期限切れ" value={counts.stale} sub="有効期限を超過" />
        <StatCard label="未確認" value={counts.unverified} sub="確認記録が無い" />
        <StatCard label="閉店済み" value={counts.closed} sub="SPOT_CLOSED で noindex 済み" />
      </StatGrid>

      <Card
        title="カテゴリ別"
        description="restaurant / indoor は商業施設内テナントが多く入れ替わりが早いため有効期限180日、seasonal / amusement は270日、それ以外は365日で判定している。"
        style={{ marginBottom: 22 }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--ink-500)' }}>
              <th style={th}>カテゴリ</th>
              <th style={thNum}>件数</th>
              <th style={thNum}>確認済み</th>
              <th style={thNum}>要対応</th>
              <th style={thNum}>カバー率</th>
            </tr>
          </thead>
          <tbody>
            {catRows.map(([cat, c]) => (
              <tr key={cat} style={{ borderTop: '1px solid var(--border-divider)' }}>
                <td style={td}>{SPOT_CATEGORY_LABEL[cat] ?? cat}</td>
                <td style={tdNum}><Mono>{c.total}</Mono></td>
                <td style={tdNum}><Mono>{c.verified}</Mono></td>
                <td style={tdNum}>
                  <Mono color={c.queue > 0 ? 'var(--neg)' : undefined}>{c.queue}</Mono>
                </td>
                <td style={tdNum}>
                  <Mono>{c.total ? Math.round((c.verified / c.total) * 100) : 0}%</Mono>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card
        title="再確認キュー"
        description="閉店していたときの実害が大きい順（期限超過の長さ × 閉店リスクの高いカテゴリ × 露出）。上から潰す。"
        right={
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map((f) => (
              <Link
                key={f.key}
                href={`/admin/spots/freshness?state=${f.key}`}
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 20,
                  textDecoration: 'none',
                  border: '1px solid var(--border)',
                  background: filter === f.key ? 'var(--ink-900)' : 'transparent',
                  color: filter === f.key ? '#fff' : 'var(--ink-500)',
                }}
              >
                {f.label}
              </Link>
            ))}
          </div>
        }
      >
        <div style={{ padding: '10px 18px', fontSize: 11.5, color: 'var(--ink-400)' }}>
          {queue.length}件該当{queue.length > LIMIT ? `（上位${LIMIT}件を表示）` : ''}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--ink-500)' }}>
              <th style={th}>状態</th>
              <th style={th}>スポット</th>
              <th style={th}>カテゴリ</th>
              <th style={th}>最終確認</th>
              <th style={thNum}>経過</th>
              <th style={thNum}>期限</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {queue.slice(0, LIMIT).map((r) => (
              <tr key={r.slug} style={{ borderTop: '1px solid var(--border-divider)' }}>
                <td style={td}>
                  <Badge tone={STATE_TONE[r.f.state]}>{STATE_LABEL[r.f.state]}</Badge>
                </td>
                <td style={td}>
                  <Link href={`/spot/${r.slug}`} style={{ color: 'var(--ink-900)', fontWeight: 600 }}>
                    {r.spot.name}
                  </Link>
                  {r.spot.popular && (
                    <span style={{ marginLeft: 6, fontSize: 10.5, color: 'var(--warn-fg)' }}>人気</span>
                  )}
                  {r.spot.kidReport && (
                    <span style={{ marginLeft: 6, fontSize: 10.5, color: 'var(--ink-400)' }}>実訪問</span>
                  )}
                </td>
                <td style={td}>{SPOT_CATEGORY_LABEL[r.spot.category] ?? r.spot.category}</td>
                <td style={td}>
                  {r.f.verifiedAt ? (
                    <>
                      {formatVerifiedDate(r.f.verifiedAt)}
                      <span style={{ marginLeft: 6, fontSize: 10.5, color: 'var(--ink-400)' }}>
                        {r.f.method === 'visited' ? '実訪問' : '公式'}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: 'var(--ink-400)' }}>—</span>
                  )}
                </td>
                <td style={tdNum}>
                  <Mono>{r.f.ageDays != null ? `${r.f.ageDays}日` : '—'}</Mono>
                </td>
                <td style={tdNum}>
                  <Mono color={r.f.overdueDays > 0 ? 'var(--neg)' : undefined}>
                    {r.f.overdueDays > 0 ? `+${r.f.overdueDays}日超過` : `${r.f.ttlDays}日`}
                  </Mono>
                </td>
                <td style={td}>
                  <Link href={`/admin/spots/edit`} style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>
                    編集
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

const th: React.CSSProperties = { padding: '9px 18px', fontSize: 11.5, fontWeight: 600 };
const thNum: React.CSSProperties = { ...th, textAlign: 'right' };
const td: React.CSSProperties = { padding: '9px 18px', color: 'var(--ink-700)', verticalAlign: 'middle' };
const tdNum: React.CSSProperties = { ...td, textAlign: 'right' };
