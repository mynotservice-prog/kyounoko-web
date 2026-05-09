import Link from 'next/link';
import {
  getTopQueries,
  getTopPages,
  getKeywordReport,
  findCtrOpportunities,
  findPushUpCandidates,
  isSearchConsoleConfigured,
  type ScRow,
} from '@/lib/search-console';
import { ImportedDataView } from './ImportedDataView';

export const revalidate = 1800; // 30分
export const metadata = {
  title: 'SEO · Search Console · Admin',
  robots: { index: false, follow: false },
};

const DAYS = 28;

export default async function SeoPage() {
  const configured = isSearchConsoleConfigured();

  if (!configured) {
    return (
      <>
        <ImportedDataView />
        <Setup />
      </>
    );
  }

  const [allQueries, allPages, kidsMenuQueries] = await Promise.all([
    getTopQueries(DAYS, 500),
    getTopPages(DAYS, 200),
    getKeywordReport('キッズメニュー', DAYS, 100),
  ]);

  // 集計
  const totalClicks = allQueries.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = allQueries.reduce((s, r) => s + r.impressions, 0);
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgPosition =
    allQueries.length > 0
      ? allQueries.reduce((s, r) => s + r.position * r.impressions, 0) / Math.max(1, totalImpressions)
      : 0;

  // 改善候補抽出
  const ctrOpportunities = findCtrOpportunities(allQueries, {
    minImpressions: 100,
    maxCtr: 0.03,
    maxPosition: 20,
  }).slice(0, 20);
  const pushUpCandidates = findPushUpCandidates(allQueries).slice(0, 20);

  // クエリ分類
  const top10Queries = allQueries.filter((q) => q.position <= 10).slice(0, 30);
  const ranges = [
    { label: '1-3位', min: 0, max: 3 },
    { label: '4-10位', min: 3.01, max: 10 },
    { label: '11-20位', min: 10.01, max: 20 },
    { label: '21-50位', min: 20.01, max: 50 },
    { label: '51位〜', min: 50.01, max: Infinity },
  ];
  const positionDistribution = ranges.map((r) => ({
    label: r.label,
    count: allQueries.filter((q) => q.position > r.min && q.position <= r.max).length,
    impressions: allQueries
      .filter((q) => q.position > r.min && q.position <= r.max)
      .reduce((s, q) => s + q.impressions, 0),
  }));

  const kidsTotalClicks = kidsMenuQueries.reduce((s, r) => s + r.clicks, 0);
  const kidsTotalImpressions = kidsMenuQueries.reduce((s, r) => s + r.impressions, 0);
  const kidsAvgPosition =
    kidsMenuQueries.length > 0
      ? kidsMenuQueries.reduce((s, r) => s + r.position * r.impressions, 0) /
        Math.max(1, kidsTotalImpressions)
      : 0;

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 26, margin: '0 0 6px' }}>
          📈 SEO — Search Console
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-mute)', margin: 0 }}>
          過去{DAYS}日間のパフォーマンス（クエリ {allQueries.length}件 / ページ {allPages.length}件）
        </p>
      </div>

      <ImportedDataView />

      {/* KPI */}
      <section style={{ marginBottom: 32 }}>
        <KpiGrid>
          <Kpi label="総クリック数" value={totalClicks} />
          <Kpi label="総表示回数" value={totalImpressions} />
          <Kpi label="平均CTR" value={(avgCtr * 100).toFixed(2)} unit="%" />
          <Kpi label="平均順位" value={avgPosition.toFixed(1)} unit="位" />
          <Kpi label="TOP10クエリ" value={top10Queries.length} sub="impr加重" />
          <Kpi label="改善候補" value={ctrOpportunities.length + pushUpCandidates.length} unit="件" />
        </KpiGrid>
      </section>

      {/* キッズメニュー特化分析 */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={SectionH2}>🍽 「キッズメニュー」関連クエリの現状</h2>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(20,147,209,0.05), rgba(201,96,62,0.04))',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            padding: 20,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
            <Mini label="関連クエリ数" value={kidsMenuQueries.length} />
            <Mini label="クリック" value={kidsTotalClicks} />
            <Mini label="表示" value={kidsTotalImpressions} />
            <Mini label="平均順位" value={kidsAvgPosition.toFixed(1)} />
          </div>
          {kidsMenuQueries.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--ink-sub)', margin: 0 }}>
              データなし。「キッズメニュー」関連の流入はまだ発生していない可能性あり。
              → 専用記事＋データセットで攻める価値あり。
            </p>
          ) : (
            <QueryTable rows={kidsMenuQueries.slice(0, 10)} />
          )}
        </div>
      </section>

      {/* 順位分布 */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={SectionH2}>順位帯の分布</h2>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: 20 }}>
          <Histogram
            data={positionDistribution.map((d) => ({
              label: `${d.label}（${d.count}クエリ）`,
              count: d.impressions,
            }))}
            color="var(--clay)"
          />
          <p style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 12 }}>
            棒は表示回数。11-20位帯が大きいほど「あと一押しでTOP10」の余地大。
          </p>
        </div>
      </section>

      {/* TOP10獲得クエリ */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={SectionH2}>🏆 TOP10 獲得クエリ（クリック上位30）</h2>
        <QueryTable rows={top10Queries} />
      </section>

      {/* CTR改善候補 */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={SectionH2}>⚠️ CTR改善ターゲット（順位TOP20×表示100+×CTR3%以下）</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginBottom: 12 }}>
          順位はそれなりに取れているのにクリックされていないクエリ。タイトル/メタディスクリプション最適化で大幅にPV増の余地。
        </p>
        <QueryTable rows={ctrOpportunities} highlightCtr />
      </section>

      {/* 順位押上げ候補 */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={SectionH2}>🚀 順位押上げ候補（8-20位×表示50+）</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginBottom: 12 }}>
          記事の充実・内部リンク強化でTOP10入りを狙えるクエリ。
        </p>
        <QueryTable rows={pushUpCandidates} highlightPosition />
      </section>

      {/* TOPページ */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={SectionH2}>📄 ページ別 流入TOP30</h2>
        <PageTable rows={allPages.slice(0, 30)} />
      </section>
    </>
  );
}

function Setup() {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: 24 }}>
      <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 22, margin: '0 0 12px' }}>
        📈 SEO Dashboard — セットアップが必要
      </h1>
      <p style={{ fontSize: 13, color: 'var(--ink-sub)', lineHeight: 1.85 }}>
        Search Console APIと連携するには以下の環境変数が必要です。
      </p>
      <pre
        style={{
          background: '#1f1a14',
          color: '#f4ddcf',
          padding: 16,
          borderRadius: 8,
          fontSize: 12,
          overflow: 'auto',
          lineHeight: 1.7,
        }}
      >
{`# Vercel ダッシュボード → Settings → Environment Variables

# 既存の GA4 用 Service Account をそのまま流用OK
GOOGLE_APPLICATION_CREDENTIALS_JSON  # JSON全体を貼り付け

# 新規追加
SEARCH_CONSOLE_SITE_URL=sc-domain:kyounoko.jp
# またはURL prefix形式の場合:
# SEARCH_CONSOLE_SITE_URL=https://kyounoko.jp/`}
      </pre>
      <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 16, marginTop: 20 }}>
        手順
      </h2>
      <ol style={{ fontSize: 13, lineHeight: 1.85, color: 'var(--ink-sub)' }}>
        <li>
          GA4で使ってるService Accountの<strong>メールアドレス</strong>をコピー
          （JSON内の <code>client_email</code>）
        </li>
        <li>
          <a
            href="https://search.google.com/search-console/users"
            target="_blank"
            rel="noopener"
            style={{ color: 'var(--clay-deep)' }}
          >
            Search Console → 設定 → ユーザーと権限
          </a>{' '}
          で「ユーザーを追加」→ そのメールを「制限付き」以上で追加
        </li>
        <li>
          Vercel Settings → Environment Variables で <code>SEARCH_CONSOLE_SITE_URL</code> を追加
        </li>
        <li>再デプロイ（または30分待ってrevalidate）</li>
        <li>このページをリロード</li>
      </ol>
      <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 16 }}>
        ※ 既存 <code>GOOGLE_APPLICATION_CREDENTIALS_JSON</code> はそのまま流用可能（権限スコープが Read-only として追加されるだけ）。
      </p>
    </div>
  );
}

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

function Kpi({ label, value, unit, sub }: { label: string; value: number | string; unit?: string; sub?: string }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && <span style={{ fontSize: 12, color: 'var(--ink-sub)' }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

function Histogram({ data, color }: { data: { label: string; count: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {data.map((d) => (
        <div key={d.label} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 80px', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-sub)' }}>{d.label}</div>
          <div style={{ background: 'var(--paper-deep)', height: 22, borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                width: `${(d.count / max) * 100}%`,
                background: color,
                height: '100%',
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-sub)', textAlign: 'right' }}>
            {d.count.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

function QueryTable({
  rows,
  highlightCtr,
  highlightPosition,
}: {
  rows: ScRow[];
  highlightCtr?: boolean;
  highlightPosition?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <div style={{ padding: 20, background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', color: 'var(--ink-mute)', fontSize: 13 }}>
        データなし
      </div>
    );
  }
  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 700 }}>
        <thead>
          <tr style={{ background: 'var(--paper-deep)' }}>
            <Th>クエリ</Th>
            <Th align="right">クリック</Th>
            <Th align="right">表示</Th>
            <Th align="right">CTR</Th>
            <Th align="right">順位</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
              <Td>{r.keys.join(' / ')}</Td>
              <Td align="right">{r.clicks.toLocaleString()}</Td>
              <Td align="right">{r.impressions.toLocaleString()}</Td>
              <Td align="right" tone={highlightCtr && r.ctr <= 0.03 ? 'warn' : undefined}>
                {(r.ctr * 100).toFixed(2)}%
              </Td>
              <Td align="right" tone={highlightPosition && r.position >= 8 && r.position <= 20 ? 'warn' : undefined}>
                {r.position.toFixed(1)}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PageTable({ rows }: { rows: ScRow[] }) {
  if (rows.length === 0) {
    return (
      <div style={{ padding: 20, background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', color: 'var(--ink-mute)', fontSize: 13 }}>
        データなし
      </div>
    );
  }
  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 700 }}>
        <thead>
          <tr style={{ background: 'var(--paper-deep)' }}>
            <Th>ページ</Th>
            <Th align="right">クリック</Th>
            <Th align="right">表示</Th>
            <Th align="right">CTR</Th>
            <Th align="right">順位</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const url = r.keys[0] ?? '';
            const path = url.replace(/^https?:\/\/[^/]+/, '') || '/';
            return (
              <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                <Td>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener"
                    style={{ color: 'var(--ink)', textDecoration: 'none', fontSize: 12 }}
                  >
                    {path.length > 60 ? path.slice(0, 60) + '…' : path}
                  </a>
                </Td>
                <Td align="right">{r.clicks.toLocaleString()}</Td>
                <Td align="right">{r.impressions.toLocaleString()}</Td>
                <Td align="right">{(r.ctr * 100).toFixed(2)}%</Td>
                <Td align="right">{r.position.toFixed(1)}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      style={{
        textAlign: align,
        padding: '10px 14px',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--ink-sub)',
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, align = 'left', tone }: { children: React.ReactNode; align?: 'left' | 'right'; tone?: 'warn' }) {
  const color = tone === 'warn' ? 'var(--clay-deep)' : 'var(--ink)';
  return (
    <td
      style={{
        textAlign: align,
        padding: '10px 14px',
        fontSize: 12,
        color,
        fontWeight: tone === 'warn' ? 600 : 400,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {children}
    </td>
  );
}
