import Link from 'next/link';
import {
  getAllArticleInsights,
  getInsightsSummary,
  getRestaurantFieldCoverage,
  type RestaurantFieldCoverageRow,
} from '@/lib/article-insights';
import { PageHeader, StatCard, StatGrid, Card, Badge, Bar, Mono } from '@/components/admin/ui';
import type { ArticleInsights } from '@/lib/article-insights';

export const revalidate = 3600;

export default function InsightsPage() {
  const insights = getAllArticleInsights();
  const summary = getInsightsSummary(insights);
  const restaurantCoverage = getRestaurantFieldCoverage();

  // 改善対象抽出（品質スコアでソート、低い順）
  const lowestScoreTop10 = [...insights].sort((a, b) => a.qualityScore - b.qualityScore).slice(0, 10);
  const shortestTop10 = [...insights].sort((a, b) => a.bodyLength - b.bodyLength).slice(0, 10);
  const noHeroArticles = insights.filter((i) => !i.hero).slice(0, 10);
  const duplicateHeros = summary.heroUsage.filter((h) => h.count >= 3).slice(0, 10);

  // ベスト記事
  const topQualityTop10 = [...insights].sort((a, b) => b.qualityScore - a.qualityScore).slice(0, 10);

  const heroRate = summary.totalArticles > 0 ? Math.round((summary.withHero / summary.totalArticles) * 100) : 0;

  return (
    <>
      <PageHeader
        title="記事品質ダッシュボード"
        subtitle={`画像・文字量・情報量・品質スコアを横断的に可視化（${insights.length}記事）`}
      />

      {/* KPI カード */}
      <StatGrid>
        <StatCard label="総記事数" value={`${summary.totalArticles.toLocaleString('en-US')} 本`} />
        <StatCard
          label="画像有率"
          value={`${heroRate}%`}
          sub={`${summary.withHero}/${summary.totalArticles}本`}
        />
        <StatCard label="平均文字数" value={`${summary.avgBodyLength.toLocaleString('en-US')} 字`} sub={`中央値 ${summary.medianBodyLength}字`} />
        <StatCard label="平均品質スコア" value={`${summary.avgQualityScore} /100`} />
        <StatCard label="リスト項目総数" value={`${summary.totalListItems.toLocaleString('en-US')} 個`} />
        <StatCard label="表組行数" value={`${summary.totalTableRows.toLocaleString('en-US')} 行`} />
        <StatCard label="内部リンク総数" value={`${summary.totalInternalLinks.toLocaleString('en-US')} 本`} />
        <StatCard
          label="画像なし記事"
          value={`${summary.withoutHero.toLocaleString('en-US')} 本`}
          deltaNegative={summary.withoutHero > 0}
          delta={summary.withoutHero > 0 ? '要対応' : undefined}
        />
      </StatGrid>

      {/* 文字量分布ヒストグラム */}
      <div style={{ marginBottom: 14 }}>
        <Card title="文字量の分布" bodyPadding={20}>
          <Histogram
            data={summary.bodyLengthBuckets.map((b) => ({ label: b.label + '字', count: b.count }))}
            color="var(--accent)"
          />
        </Card>
      </div>

      {/* 品質スコア分布 */}
      <div style={{ marginBottom: 14 }}>
        <Card
          title="品質スコアの分布"
          description="スコアは「文字数25 + 構造25 + 画像10 + 内部リンク10 + FAQ/HowTo10 + 表/独自セクション20」で算出"
          bodyPadding={20}
        >
          <Histogram data={summary.scoreBuckets} color="var(--ok-dot)" />
        </Card>
      </div>

      {/* カテゴリ別統計 */}
      <div style={{ marginBottom: 14 }}>
        <Card title="カテゴリ別 品質サマリー" bodyPadding={0}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle('left')}>カテゴリ</th>
                <th style={thStyle('right')}>記事数</th>
                <th style={thStyle('right')}>平均文字数</th>
                <th style={thStyle('right')}>平均スコア</th>
              </tr>
            </thead>
            <tbody>
              {summary.categoryStats.map((c) => (
                <tr key={c.category} className="admin-row">
                  <td style={tdStyle()}>{c.category}</td>
                  <td style={tdNum()}>{c.count}</td>
                  <td style={tdNum()}>{c.avgLength.toLocaleString()}</td>
                  <td style={{ ...tdStyle(), textAlign: 'right' }}>
                    <ScoreCell score={c.avgScore} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* 画像使用ランキング（重複検出） */}
      <div style={{ marginBottom: 14 }}>
        <Card
          title="画像の使用回数ランキング（重複検出）"
          description="同じ画像が3記事以上で使われている = 候補画像が枯れている可能性。差し替え検討の参考に。"
          bodyPadding={duplicateHeros.length === 0 ? 18 : 16}
        >
          {duplicateHeros.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--ink-600)' }}>3回以上使用されている画像はありません</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {duplicateHeros.map((h) => (
                <div
                  key={h.hero}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}
                >
                  <div
                    style={{
                      aspectRatio: '16/9',
                      backgroundImage: `url(${h.hero})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: 'var(--bg-subtle)',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'var(--accent)',
                        color: 'var(--bg-surface)',
                        padding: '3px 9px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {h.count}記事で使用
                    </span>
                  </div>
                  <div style={{ padding: 12, fontSize: 11 }}>
                    <div style={{ color: 'var(--ink-400)', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>{h.hero}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {h.slugs.slice(0, 5).map((s) => (
                        <Link
                          key={s}
                          href={`/article/${s}`}
                          target="_blank"
                          style={{ background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: 4, color: 'var(--ink-600)', textDecoration: 'none', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                        >
                          {s}
                        </Link>
                      ))}
                      {h.slugs.length > 5 && <span style={{ color: 'var(--ink-400)' }}>+{h.slugs.length - 5}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 改善アラート: スコア低い記事 */}
      <div style={{ marginBottom: 14 }}>
        <Card title="要改善 — スコア低い記事 TOP10" bodyPadding={0}>
          <ArticleTable rows={lowestScoreTop10} />
        </Card>
      </div>

      {/* 改善アラート: 文字数少ない記事 */}
      <div style={{ marginBottom: 14 }}>
        <Card title="要改善 — 文字数少ない記事 TOP10" bodyPadding={0}>
          <ArticleTable rows={shortestTop10} />
        </Card>
      </div>

      {/* 画像なし記事 */}
      {noHeroArticles.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <Card title={`ヒーロー画像なしの記事（${noHeroArticles.length}本）`} bodyPadding={0}>
            <ArticleTable rows={noHeroArticles} />
          </Card>
        </div>
      )}

      {/* 良い記事ベスト */}
      <div style={{ marginBottom: 14 }}>
        <Card title="品質スコア高い記事 TOP10" bodyPadding={0}>
          <ArticleTable rows={topQualityTop10} />
        </Card>
      </div>

      {/* レストラン情報充実度 */}
      <div style={{ marginBottom: 14 }}>
        <Card
          title="レストラン情報充実度（チェーン+個人店）"
          description="子連れ目線フィールドの記入率。チェーン側で埋まっていてもまだ手付かずの項目を優先的に強化する。"
          bodyPadding={0}
        >
          <RestaurantCoverageTable rows={restaurantCoverage} />
        </Card>
      </div>

      <div
        style={{
          marginTop: 28,
          padding: '16px 18px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
        }}
      >
        <h3 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 10px', color: 'var(--ink-900)' }}>関連</h3>
        <div style={{ display: 'flex', gap: 14, fontSize: 13, flexWrap: 'wrap' }}>
          <Link href="/admin/articles" style={{ color: 'var(--accent)' }}>
            記事一覧（カード表示）
          </Link>
          <Link href="/admin" style={{ color: 'var(--accent)' }}>
            管理ダッシュボード
          </Link>
          <Link href="/admin/articles/new" style={{ color: 'var(--accent)' }}>
            新規記事作成
          </Link>
        </div>
      </div>
    </>
  );
}

// ================== UI Helper Components ==================

function thStyle(align: 'left' | 'right'): React.CSSProperties {
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

function tdStyle(): React.CSSProperties {
  return {
    padding: '11px 18px',
    fontSize: 13,
    color: 'var(--ink-900)',
    borderBottom: '1px solid var(--border-faint)',
  };
}

function tdNum(): React.CSSProperties {
  return {
    ...tdStyle(),
    textAlign: 'right',
    fontFamily: 'var(--font-mono)',
    fontVariantNumeric: 'tabular-nums',
  };
}

function barColorForScore(v: number): string {
  return v >= 80 ? 'var(--ok-dot)' : v >= 60 ? '#c9c3bb' : 'var(--warn-dot)';
}

function ScoreCell({ score }: { score: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'flex-end' }}>
      <div style={{ width: 70, display: 'flex' }}>
        <Bar pct={score} color={barColorForScore(score)} />
      </div>
      <Mono color="var(--ink-700)">{score}</Mono>
    </div>
  );
}

function Histogram({ data, color }: { data: { label: string; count: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {data.map((d) => (
        <div key={d.label} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 50px', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-600)' }}>{d.label}</div>
          <div style={{ display: 'flex' }}>
            <Bar pct={(d.count / max) * 100} color={color} />
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--ink-600)',
              textAlign: 'right',
              fontFamily: 'var(--font-mono)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {d.count}本
          </div>
        </div>
      ))}
    </div>
  );
}

function ArticleTable({ rows }: { rows: ArticleInsights[] }) {
  return (
    <div style={{ overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
        <thead>
          <tr>
            <th style={thStyle('left')}>画像</th>
            <th style={thStyle('left')}>タイトル</th>
            <th style={thStyle('right')}>文字数</th>
            <th style={thStyle('right')}>H2/H3</th>
            <th style={thStyle('right')}>リスト</th>
            <th style={thStyle('right')}>表</th>
            <th style={thStyle('right')}>FAQ/HowTo</th>
            <th style={thStyle('right')}>内部リンク</th>
            <th style={thStyle('right')}>スコア</th>
            <th style={thStyle('left')}>課題</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.slug} className="admin-row">
              <td style={tdStyle()}>
                <div
                  style={{
                    width: 56,
                    height: 32,
                    background: r.hero ? `url(${r.hero}) center/cover` : 'var(--bg-subtle)',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    color: 'var(--warn-fg)',
                    fontWeight: 600,
                  }}
                >
                  {!r.hero && '画像なし'}
                </div>
              </td>
              <td style={tdStyle()}>
                <Link href={`/article/${r.slug}`} target="_blank" style={{ color: 'var(--ink-900)', textDecoration: 'none' }}>
                  <div style={{ fontWeight: 500, lineHeight: 1.4, marginBottom: 2 }}>{r.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)' }}>
                    {r.categoryName} · {r.slug}
                  </div>
                </Link>
              </td>
              <td style={tdNum()}>
                <span style={{ color: r.bodyLength < 800 ? 'var(--warn-fg)' : 'var(--ink-900)' }}>
                  {r.bodyLength.toLocaleString()}
                </span>
              </td>
              <td style={tdNum()}>{r.h2Count}/{r.h3Count}</td>
              <td style={tdNum()}>{r.listItemCount}</td>
              <td style={tdNum()}>{r.tableRowCount}</td>
              <td style={tdNum()}>{r.faqCount}/{r.howToStepCount}</td>
              <td style={tdNum()}>{r.internalLinkCount}</td>
              <td style={{ ...tdStyle(), textAlign: 'right' }}>
                <ScoreCell score={r.qualityScore} />
              </td>
              <td style={tdStyle()}>
                {r.issues.length === 0 ? (
                  <Badge tone="ok">問題なし</Badge>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {r.issues.slice(0, 3).map((iss) => (
                      <Badge key={iss} tone="warn" dot={false}>
                        {iss}
                      </Badge>
                    ))}
                    {r.issues.length > 3 && (
                      <span style={{ color: 'var(--ink-400)', fontSize: 10 }}>+{r.issues.length - 3}</span>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RestaurantCoverageTable({ rows }: { rows: RestaurantFieldCoverageRow[] }) {
  // 記入率の降順で表示（充実してる順）
  const sorted = [...rows].sort((a, b) => b.ratio - a.ratio);
  return (
    <div style={{ overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
        <thead>
          <tr>
            <th style={thStyle('left')}>指標</th>
            <th style={thStyle('left')}>全体（バー）</th>
            <th style={thStyle('right')}>全体</th>
            <th style={thStyle('right')}>チェーン</th>
            <th style={thStyle('right')}>個人店</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const totalPct = r.totalTotal === 0 ? 0 : Math.round((r.totalHave / r.totalTotal) * 100);
            const chainPct = r.chainTotal === 0 ? 0 : Math.round((r.chainHave / r.chainTotal) * 100);
            const indiePct = r.indieTotal === 0 ? 0 : Math.round((r.indieHave / r.indieTotal) * 100);
            const barColor = totalPct >= 70 ? 'var(--ok-dot)' : totalPct >= 30 ? '#c9c3bb' : 'var(--warn-dot)';
            return (
              <tr key={r.field} className="admin-row">
                <td style={tdStyle()}>
                  <span style={{ fontWeight: 500 }}>{r.label}</span>
                </td>
                <td style={tdStyle()}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 44px',
                      alignItems: 'center',
                      gap: 8,
                      minWidth: 160,
                    }}
                  >
                    <div style={{ display: 'flex' }}>
                      <Bar pct={totalPct} color={barColor} />
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--ink-600)',
                        textAlign: 'right',
                        fontFamily: 'var(--font-mono)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {totalPct}%
                    </span>
                  </div>
                </td>
                <td style={tdNum()}>
                  {r.totalHave.toLocaleString()}/{r.totalTotal.toLocaleString()}
                </td>
                <td style={tdNum()}>
                  <span style={{ color: 'var(--ink-600)' }}>
                    {chainPct}%
                    <span style={{ fontSize: 10, color: 'var(--ink-400)', marginLeft: 4 }}>
                      ({r.chainHave}/{r.chainTotal})
                    </span>
                  </span>
                </td>
                <td style={tdNum()}>
                  <span style={{ color: 'var(--ink-600)' }}>
                    {indiePct}%
                    <span style={{ fontSize: 10, color: 'var(--ink-400)', marginLeft: 4 }}>
                      ({r.indieHave}/{r.indieTotal})
                    </span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
