import Link from 'next/link';
import {
  getAllArticleInsights,
  getInsightsSummary,
  getRestaurantFieldCoverage,
  type RestaurantFieldCoverageRow,
} from '@/lib/article-insights';

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

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 26, margin: '0 0 6px' }}>
          📊 Insights — 記事品質ダッシュボード
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-mute)', margin: 0 }}>
          画像・文字量・情報量・品質スコアを横断的に可視化（{insights.length}記事）
        </p>
      </div>

      {/* KPI カード */}
      <section style={{ marginBottom: 32 }}>
        <KpiGrid>
          <Kpi label="総記事数" value={summary.totalArticles} unit="本" />
          <Kpi
            label="画像有率"
            value={summary.totalArticles > 0 ? Math.round((summary.withHero / summary.totalArticles) * 100) : 0}
            unit="%"
            sub={`${summary.withHero}/${summary.totalArticles}本`}
          />
          <Kpi label="平均文字数" value={summary.avgBodyLength} unit="字" sub={`中央値 ${summary.medianBodyLength}字`} />
          <Kpi label="平均品質スコア" value={summary.avgQualityScore} unit="/100" />
          <Kpi label="リスト項目総数" value={summary.totalListItems} unit="個" />
          <Kpi label="表組行数" value={summary.totalTableRows} unit="行" />
          <Kpi label="内部リンク総数" value={summary.totalInternalLinks} unit="本" />
          <Kpi label="画像なし記事" value={summary.withoutHero} unit="本" warn={summary.withoutHero > 0} />
        </KpiGrid>
      </section>

      {/* 文字量分布ヒストグラム */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={SectionH2}>文字量の分布</h2>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: 20 }}>
          <Histogram
            data={summary.bodyLengthBuckets.map((b) => ({ label: b.label + '字', count: b.count }))}
            color="var(--clay)"
          />
        </div>
      </section>

      {/* 品質スコア分布 */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={SectionH2}>品質スコアの分布</h2>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: 20 }}>
          <Histogram
            data={summary.scoreBuckets}
            color="var(--sage)"
          />
          <p style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 12 }}>
            スコアは「文字数25 + 構造25 + 画像10 + 内部リンク10 + FAQ/HowTo10 + 表/独自セクション20」で算出
          </p>
        </div>
      </section>

      {/* カテゴリ別統計 */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={SectionH2}>カテゴリ別 品質サマリー</h2>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--paper-deep)' }}>
                <Th>カテゴリ</Th>
                <Th align="right">記事数</Th>
                <Th align="right">平均文字数</Th>
                <Th align="right">平均スコア</Th>
              </tr>
            </thead>
            <tbody>
              {summary.categoryStats.map((c) => (
                <tr key={c.category} style={{ borderTop: '1px solid var(--line)' }}>
                  <Td>{c.category}</Td>
                  <Td align="right">{c.count}</Td>
                  <Td align="right">{c.avgLength.toLocaleString()}</Td>
                  <Td align="right">
                    <ScoreBadge score={c.avgScore} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 画像使用ランキング（重複検出） */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={SectionH2}>画像の使用回数ランキング（重複検出）</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-mute)', margin: '4px 0 12px' }}>
          同じ画像が3記事以上で使われている = 候補画像が枯れている可能性。差し替え検討の参考に。
        </p>
        {duplicateHeros.length === 0 ? (
          <div style={{ padding: 20, background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--ink-sub)' }}>
            3回以上使用されている画像はありません ✨
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {duplicateHeros.map((h) => (
              <div
                key={h.hero}
                style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}
              >
                <div
                  style={{
                    aspectRatio: '16/9',
                    backgroundImage: `url(${h.hero})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: 'var(--peach-soft)',
                    position: 'relative',
                  }}
                >
                  <span style={{ position: 'absolute', top: 8, right: 8, background: 'var(--clay)', color: '#fff', padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                    {h.count}記事で使用
                  </span>
                </div>
                <div style={{ padding: 12, fontSize: 11 }}>
                  <div style={{ color: 'var(--ink-mute)', marginBottom: 4, fontFamily: 'monospace' }}>{h.hero}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {h.slugs.slice(0, 5).map((s) => (
                      <Link key={s} href={`/article/${s}`} target="_blank" style={{ background: 'var(--paper-deep)', padding: '2px 6px', borderRadius: 4, color: 'var(--ink-sub)', textDecoration: 'none', fontSize: 10 }}>
                        {s}
                      </Link>
                    ))}
                    {h.slugs.length > 5 && <span style={{ color: 'var(--ink-mute)' }}>+{h.slugs.length - 5}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 改善アラート: スコア低い記事 */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={SectionH2}>⚠️ 要改善 — スコア低い記事 TOP10</h2>
        <ArticleTable rows={lowestScoreTop10} highlight="qualityScore" />
      </section>

      {/* 改善アラート: 文字数少ない記事 */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={SectionH2}>⚠️ 要改善 — 文字数少ない記事 TOP10</h2>
        <ArticleTable rows={shortestTop10} highlight="bodyLength" />
      </section>

      {/* 画像なし記事 */}
      {noHeroArticles.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={SectionH2}>⚠️ ヒーロー画像なしの記事 ({noHeroArticles.length}本)</h2>
          <ArticleTable rows={noHeroArticles} highlight="hero" />
        </section>
      )}

      {/* 良い記事ベスト */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={SectionH2}>🏆 品質スコア高い記事 TOP10</h2>
        <ArticleTable rows={topQualityTop10} highlight="qualityScore" />
      </section>

      {/* レストラン情報充実度 */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={SectionH2}>🍽 レストラン情報充実度（チェーン+個人店）</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-mute)', margin: '4px 0 12px' }}>
          子連れ目線フィールドの記入率。チェーン側で埋まっていてもまだ手付かずの項目を優先的に強化する。
        </p>
        <RestaurantCoverageTable rows={restaurantCoverage} />
      </section>

      <div style={{ marginTop: 40, padding: 20, background: 'var(--paper-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ fontFamily: 'var(--font-mincho)', fontSize: 16, margin: '0 0 8px' }}>関連</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.95 }}>
          <li><Link href="/admin/articles">記事一覧（カード表示）</Link></li>
          <li><Link href="/admin">管理ダッシュボード</Link></li>
          <li><Link href="/admin/articles/new">新規記事作成</Link></li>
        </ul>
      </div>
    </>
  );
}

// ================== UI Helper Components ==================

const SectionH2: React.CSSProperties = {
  fontFamily: 'var(--font-mincho)',
  fontSize: 18,
  margin: '0 0 12px',
  fontWeight: 600,
};

function KpiGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

function Kpi({ label, value, unit, sub, warn }: { label: string; value: number; unit?: string; sub?: string; warn?: boolean }) {
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${warn ? '#e2b39a' : 'var(--line)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontFamily: 'var(--font-display), serif', fontSize: 28, fontWeight: 700, color: warn ? 'var(--clay-deep)' : 'var(--ink)' }}>
          {value.toLocaleString()}
        </span>
        {unit && <span style={{ fontSize: 12, color: 'var(--ink-sub)' }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Histogram({ data, color }: { data: { label: string; count: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {data.map((d) => (
        <div key={d.label} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 50px', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-sub)' }}>{d.label}</div>
          <div style={{ background: 'var(--paper-deep)', height: 22, borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                width: `${(d.count / max) * 100}%`,
                background: color,
                height: '100%',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-sub)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {d.count}本
          </div>
        </div>
      ))}
    </div>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <th
      style={{
        textAlign: align,
        padding: '10px 14px',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--ink-sub)',
        letterSpacing: '.03em',
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <td
      style={{
        textAlign: align,
        padding: '10px 14px',
        fontSize: 13,
        color: 'var(--ink)',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {children}
    </td>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'var(--sage-deep)' : score >= 60 ? 'var(--ochre)' : score >= 40 ? '#c4704f' : '#a73b1f';
  const bg = score >= 80 ? 'var(--sage-soft)' : score >= 60 ? 'var(--ochre-soft)' : score >= 40 ? '#f5e0d4' : '#f3d2c5';
  return (
    <span style={{ background: bg, color, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
      {score}
    </span>
  );
}

import type { ArticleInsights } from '@/lib/article-insights';

function ArticleTable({ rows, highlight }: { rows: ArticleInsights[]; highlight?: 'qualityScore' | 'bodyLength' | 'hero' }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 800 }}>
        <thead>
          <tr style={{ background: 'var(--paper-deep)' }}>
            <Th>画像</Th>
            <Th>タイトル</Th>
            <Th align="right">文字数</Th>
            <Th align="right">H2/H3</Th>
            <Th align="right">リスト</Th>
            <Th align="right">表</Th>
            <Th align="right">FAQ/HowTo</Th>
            <Th align="right">内部リンク</Th>
            <Th align="right">スコア</Th>
            <Th>課題</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.slug} style={{ borderTop: '1px solid var(--line)' }}>
              <Td>
                <div
                  style={{
                    width: 56,
                    height: 32,
                    background: r.hero ? `url(${r.hero}) center/cover` : 'var(--peach-soft)',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    color: '#c4704f',
                    fontWeight: 600,
                  }}
                >
                  {!r.hero && '画像なし'}
                </div>
              </Td>
              <Td>
                <Link href={`/article/${r.slug}`} target="_blank" style={{ color: 'var(--ink)', textDecoration: 'none' }}>
                  <div style={{ fontWeight: 500, lineHeight: 1.4, marginBottom: 2 }}>{r.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-mute)' }}>{r.categoryName} · {r.slug}</div>
                </Link>
              </Td>
              <Td align="right">
                <span style={{ color: r.bodyLength < 800 ? '#c4704f' : 'var(--ink)' }}>
                  {r.bodyLength.toLocaleString()}
                </span>
              </Td>
              <Td align="right">{r.h2Count}/{r.h3Count}</Td>
              <Td align="right">{r.listItemCount}</Td>
              <Td align="right">{r.tableRowCount}</Td>
              <Td align="right">{r.faqCount}/{r.howToStepCount}</Td>
              <Td align="right">{r.internalLinkCount}</Td>
              <Td align="right">
                <ScoreBadge score={r.qualityScore} />
              </Td>
              <Td>
                {r.issues.length === 0 ? (
                  <span style={{ color: 'var(--sage-deep)', fontSize: 11 }}>✓ 問題なし</span>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {r.issues.slice(0, 3).map((iss) => (
                      <span key={iss} style={{ background: '#f5e0d4', color: '#c4704f', padding: '1px 6px', borderRadius: 4, fontSize: 10 }}>
                        {iss}
                      </span>
                    ))}
                    {r.issues.length > 3 && (
                      <span style={{ color: 'var(--ink-mute)', fontSize: 10 }}>+{r.issues.length - 3}</span>
                    )}
                  </div>
                )}
              </Td>
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
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        overflow: 'auto',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 }}>
        <thead>
          <tr style={{ background: 'var(--paper-deep)' }}>
            <Th>指標</Th>
            <Th>全体（バー）</Th>
            <Th align="right">全体</Th>
            <Th align="right">チェーン</Th>
            <Th align="right">個人店</Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const totalPct = r.totalTotal === 0 ? 0 : Math.round((r.totalHave / r.totalTotal) * 100);
            const chainPct = r.chainTotal === 0 ? 0 : Math.round((r.chainHave / r.chainTotal) * 100);
            const indiePct = r.indieTotal === 0 ? 0 : Math.round((r.indieHave / r.indieTotal) * 100);
            const barColor =
              totalPct >= 70 ? 'var(--sage)' : totalPct >= 30 ? 'var(--ochre)' : 'var(--clay)';
            return (
              <tr key={r.field} style={{ borderTop: '1px solid var(--line)' }}>
                <Td>
                  <span style={{ fontWeight: 500 }}>{r.label}</span>
                </Td>
                <Td>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 44px',
                      alignItems: 'center',
                      gap: 8,
                      minWidth: 160,
                    }}
                  >
                    <div
                      style={{
                        background: 'var(--paper-deep)',
                        height: 14,
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${totalPct}%`,
                          background: barColor,
                          height: '100%',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--ink-sub)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {totalPct}%
                    </span>
                  </div>
                </Td>
                <Td align="right">
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {r.totalHave.toLocaleString()}/{r.totalTotal.toLocaleString()}
                  </span>
                </Td>
                <Td align="right">
                  <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--ink-sub)' }}>
                    {chainPct}%
                    <span style={{ fontSize: 10, color: 'var(--ink-mute)', marginLeft: 4 }}>
                      ({r.chainHave}/{r.chainTotal})
                    </span>
                  </span>
                </Td>
                <Td align="right">
                  <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--ink-sub)' }}>
                    {indiePct}%
                    <span style={{ fontSize: 10, color: 'var(--ink-mute)', marginLeft: 4 }}>
                      ({r.indieHave}/{r.indieTotal})
                    </span>
                  </span>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
