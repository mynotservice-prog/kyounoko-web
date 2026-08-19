import Link from 'next/link';
import { getAllFileArticles } from '@/lib/articles';
import { getAllPlanMetas } from '@/lib/plans';
import { SPOTS } from '@/lib/spots';
import { getDataHealth, type DataSourceHealth } from '@/lib/data-health';
import { PageHeader, StatCard, StatGrid, Card, Badge, Bar, Mono } from '@/components/admin/ui';
import { articleCategoryLabel } from '@/lib/article-categories';

export const revalidate = 3600;

export default async function AdminDashboard() {
  const dataHealth = await getDataHealth();
  const articles = getAllFileArticles();
  const plans = getAllPlanMetas();
  const spotsCount = Object.values(SPOTS).reduce((sum, arr) => sum + (arr?.length ?? 0), 0);
  const spotsAreas = Object.keys(SPOTS).length;

  // 改善対象候補の抽出
  const articlesMissingHero = articles.filter((a) => !a.hero).length;
  const plansMissingHero = plans.filter((p) => !p.hero).length;
  const articlesMissingLede = articles.filter((a) => !a.lede || a.lede.length < 50).length;
  const plansNoArea = plans.filter((p) => p.area === 'all').length;
  const plansWithArea = plans.length - plansNoArea;
  const areaRate = plans.length > 0 ? Math.round((plansWithArea / plans.length) * 100) : 0;

  // カテゴリ別件数
  const catCount: Record<string, number> = {};
  for (const a of articles) {
    const key = articleCategoryLabel(a.category, a.categoryName);
    catCount[key] = (catCount[key] ?? 0) + 1;
  }
  const topCats = Object.entries(catCount).sort((a, b) => b[1] - a[1]);
  const totalCatArticles = topCats.reduce((s, [, n]) => s + n, 0) || 1;
  const maxCat = Math.max(1, ...topCats.map(([, n]) => n));

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;

  const improvements: { label: string; value: number; unit: string }[] = [
    { label: 'Hero画像が未設定の記事', value: articlesMissingHero, unit: '本' },
    { label: 'Hero画像が未設定のプラン', value: plansMissingHero, unit: '件' },
    { label: '導入文が短い記事（50文字未満）', value: articlesMissingLede, unit: '本' },
    { label: 'エリア非依存のプラン', value: plansNoArea, unit: '件' },
  ];

  const liveCount = dataHealth.filter((d) => d.live === true).length;

  return (
    <>
      <PageHeader
        title="ダッシュボード"
        subtitle="サイト全体の状況サマリ"
        right={
          <span style={{ fontSize: 12, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
            {dateStr} 時点
          </span>
        }
      />

      {/* KPI */}
      <StatGrid columns={4}>
        <StatCard label="記事数" value={articles.length.toLocaleString('en-US')} sub="ファイル記事" />
        <StatCard label="プラン数" value={plans.length.toLocaleString('en-US')} sub="登録プラン" />
        <StatCard
          label="スポット数"
          value={spotsCount.toLocaleString('en-US')}
          sub={`${spotsAreas} 都道府県`}
        />
        <StatCard label="エリア特化率" value={`${areaRate}%`} sub={`${plansWithArea} / ${plans.length} プラン`} />
      </StatGrid>

      {/* データ源の健全性 */}
      <section style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>データ源の健全性</h2>
          <span style={{ fontSize: 12, color: 'var(--ink-400)' }}>
            {liveCount} / {dataHealth.length} 件がライブ
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {dataHealth.map((d) => (
            <DataHealthCard key={d.key} d={d} />
          ))}
        </div>
      </section>

      {/* 記事カテゴリ分布 + 改善候補 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, alignItems: 'start' }}>
        <Card
          title="記事カテゴリ分布"
          right={<Mono color="var(--ink-400)">全 {articles.length} 本</Mono>}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle('left')}>カテゴリ</th>
                <th style={{ ...thStyle('right'), width: 64 }}>記事数</th>
                <th style={{ ...thStyle('left'), width: 160, paddingLeft: 12 }}>構成比</th>
              </tr>
            </thead>
            <tbody>
              {topCats.map(([cat, n]) => {
                const share = ((n / totalCatArticles) * 100).toFixed(1);
                return (
                  <tr key={cat} className="admin-row">
                    <td style={{ padding: '11px 18px', fontSize: 13, color: 'var(--ink-900)', borderBottom: '1px solid var(--border-faint)' }}>
                      {cat}
                    </td>
                    <td
                      style={{
                        padding: '11px 12px',
                        textAlign: 'right',
                        fontSize: 13,
                        color: 'var(--ink-900)',
                        fontFamily: 'var(--font-mono)',
                        fontVariantNumeric: 'tabular-nums',
                        borderBottom: '1px solid var(--border-faint)',
                      }}
                    >
                      {n}
                    </td>
                    <td style={{ padding: '11px 18px 11px 12px', borderBottom: '1px solid var(--border-faint)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <Bar pct={(n / maxCat) * 100} />
                        <span
                          style={{
                            fontSize: 11.5,
                            color: 'var(--ink-500)',
                            fontFamily: 'var(--font-mono)',
                            width: 42,
                            textAlign: 'right',
                          }}
                        >
                          {share}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card title="改善候補" description="対応すると品質スコアが上がる項目">
          <div>
            {improvements.map((im) => (
              <div
                key={im.label}
                className="admin-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 18px',
                  borderBottom: '1px solid var(--border-faint)',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--ink-700)', lineHeight: 1.4 }}>{im.label}</span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 4, flex: '0 0 auto' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 16,
                      fontWeight: 600,
                      color: im.value > 0 ? 'var(--ink-900)' : 'var(--ink-300)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {im.value}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--ink-400)' }}>{im.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* クイックリンク（実ページへの導線） */}
      <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
        <QuickLink href="/admin/articles" label="記事を管理" />
        <QuickLink href="/admin/plans" label="プランを管理" />
        <QuickLink href="/admin/spots" label="スポットを管理" />
        <QuickLink href="/admin/insights" label="記事品質を見る" />
      </div>
    </>
  );
}

function thStyle(align: 'left' | 'right'): React.CSSProperties {
  return {
    textAlign: align,
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--ink-400)',
    padding: '9px 18px',
    borderBottom: '1px solid var(--border-divider)',
    letterSpacing: '.02em',
    background: 'var(--bg-app)',
  };
}

function DataHealthCard({ d }: { d: DataSourceHealth }) {
  // live(緑) / configured だが未応答(橙) / 未設定(灰)
  const status = d.live === true ? 'live' : d.configured ? 'warn' : 'off';
  const tone = status === 'live' ? 'ok' : status === 'warn' ? 'warn' : 'neu';
  const badge = status === 'live' ? 'LIVE' : status === 'warn' ? '要確認' : '未設定';
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: '14px 15px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-900)' }}>{d.label}</div>
        <Badge tone={tone}>{badge}</Badge>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--ink-500)', lineHeight: 1.5 }}>{d.purpose}</div>
      <div style={{ fontSize: 11.5, color: status === 'live' ? 'var(--ink-700)' : 'var(--ink-400)', lineHeight: 1.5 }}>
        {d.detail}
      </div>
      {status !== 'live' && d.envKeys.length > 0 && (
        <div style={{ fontSize: 10.5, color: 'var(--ink-300)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
          env: {d.envKeys.join(', ')}
        </div>
      )}
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="admin-hover-accent"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid var(--border-strong)',
        background: 'var(--bg-surface)',
        color: 'var(--ink-600)',
        borderRadius: 'var(--r-md)',
        padding: '8px 14px',
        fontSize: 13,
        fontWeight: 500,
        textDecoration: 'none',
      }}
    >
      {label}
    </Link>
  );
}
