import Link from 'next/link';
import {
  getRuntimeMonthlyMetrics,
  currentMonth,
  monthLabel,
  type MonthlyMetric,
} from '@/lib/metrics';
import { getGa4Totals, getGa4MonthlyTrend, getGa4EventByPage, getGa4EventByProvider, isGa4Configured } from '@/lib/ga4';
import { getAdsenseEarnings, getAdsenseMonthly, isAdsenseReportConfigured } from '@/lib/adsense-report';
import { getLineFollowers, isLineConfigured } from '@/lib/line';
import { getTopPages, isSearchConsoleConfigured } from '@/lib/search-console';
import { getAllFileArticles } from '@/lib/articles';
import { PageHeader, StatCard, StatGrid, Card, Bar } from '@/components/admin/ui';
import { KpiClient } from './KpiClient';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: '経営KPI · Admin · きょうのこ',
  robots: { index: false, follow: false },
};

const yen = (n: number) => '¥' + Math.round(n).toLocaleString();
const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

// AdSense は自動取得を優先し、手入力 adsense との二重計上を避ける
const NON_ADSENSE_SOURCES = ['moshimo', 'a8', 'rakuten', 'amazon', 'other'] as const;
function splitRevenue(m: MonthlyMetric | undefined, adsenseAuto: number | undefined) {
  const aff = m?.affiliate;
  const exAdsense = NON_ADSENSE_SOURCES.reduce((s, k) => s + (aff?.[k] ?? 0), 0);
  const adsense = aff?.adsense != null ? aff.adsense : adsenseAuto ?? 0;
  return { exAdsense, adsense, total: exAdsense + adsense };
}

export default async function KpiPage() {
  const now = new Date();
  const thisMonth = currentMonth(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const store = await getRuntimeMonthlyMetrics();
  const articles = getAllFileArticles();

  // ライブ取得（各 lib が未設定/失敗時は null を返すので Promise.all で安全）
  const [ga4Totals, ga4Monthly, adsenseThisMonth, adsenseMonthly, line, clicksByPage, clicksByProvider, gscPages] =
    await Promise.all([
      getGa4Totals(fmtDate(monthStart), fmtDate(now)),
      getGa4MonthlyTrend(12),
      getAdsenseEarnings(monthStart, now),
      getAdsenseMonthly(12),
      getLineFollowers(),
      getGa4EventByPage('affiliate_click', 28, 50),
      getGa4EventByProvider('affiliate_click', 28, 20),
      isSearchConsoleConfigured() ? getTopPages(28, 100) : Promise.resolve([]),
    ]);

  // ---- 月次トレンドの統合（store ∪ GA4 ∪ AdSense の月）----
  const storeByMonth = new Map(store.map((m) => [m.month, m]));
  const ga4ByMonth = new Map((ga4Monthly ?? []).map((r) => [r.month, r]));
  const adsenseByMonth = new Map((adsenseMonthly ?? []).map((r) => [r.month, r.earnings]));
  const monthsSet = new Set<string>([
    ...store.map((m) => m.month),
    ...(ga4Monthly ?? []).map((r) => r.month),
    ...(adsenseMonthly ?? []).map((r) => r.month),
  ]);
  const months = [...monthsSet].sort().slice(-12); // 昇順・直近12か月

  const trend = months.map((month) => {
    const m = storeByMonth.get(month);
    const adsenseAuto = adsenseByMonth.get(month);
    const rev = splitRevenue(m, adsenseAuto);
    const pv = ga4ByMonth.get(month)?.pageViews ?? m?.pv ?? null;
    return {
      month,
      revenue: rev.total,
      exAdsense: rev.exAdsense,
      adsense: rev.adsense,
      pv,
      line: m?.lineFollowers ?? null,
    };
  });

  // ---- 今月のKPI ----
  const thisRev = splitRevenue(storeByMonth.get(thisMonth), adsenseThisMonth ?? undefined);
  const maxRevenue = Math.max(...trend.map((t) => t.revenue), 1);

  // ---- 稼ぎ頭記事（GA4 affiliate_click をページ別に集計 → 記事タイトル解決）----
  const articleByPath = new Map<string, string>();
  for (const a of articles) articleByPath.set(`/article/${a.slug}`, a.title);
  const topClicked = (clicksByPage ?? [])
    .map((r) => {
      const cleanPath = r.pagePath.split('?')[0].replace(/\/$/, '') || '/';
      return { path: cleanPath, title: articleByPath.get(cleanPath) ?? null, count: r.count };
    })
    .filter((r) => r.count > 0)
    .slice(0, 15);

  // ---- 検索流入TOP（GSC）----
  const topGsc = (gscPages ?? []).slice(0, 10);

  const integrations = [
    { name: 'GA4（PV・クリック）', ok: isGa4Configured(), env: 'GA4_PROPERTY_ID + サービスアカウントを「閲覧者」に追加' },
    { name: 'AdSense（収益）', ok: isAdsenseReportConfigured(), env: 'ADSENSE_OAUTH_CLIENT_ID / SECRET / REFRESH_TOKEN' },
    { name: 'LINE（友だち数）', ok: isLineConfigured(), env: 'LINE_CHANNEL_ACCESS_TOKEN' },
    { name: 'Search Console（流入）', ok: isSearchConsoleConfigured(), env: 'SEARCH_CONSOLE_SITE_URL' },
  ];

  return (
    <>
      <PageHeader
        title="経営KPI ダッシュボード"
        subtitle="収益・PV・LINE登録を月次で蓄積。自動取得（GA4・AdSense・LINE・GSC）＋アフィリエイト確定収益の手入力。"
      />

      {/* 今月のKPI */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={SectionH2}>今月（{monthLabel(thisMonth)}）</h2>
        <StatGrid>
          <StatCard label="収益合計" value={yen(thisRev.total)} />
          <StatCard label="アフィリ（AdSense除く）" value={yen(thisRev.exAdsense)} />
          <StatCard label="AdSense" value={adsenseThisMonth != null ? yen(adsenseThisMonth) : yen(thisRev.adsense)} sub={isAdsenseReportConfigured() ? '自動' : '手入力'} />
          <StatCard label="LINE友だち" value={line ? line.followers.toLocaleString() : '—'} sub={line ? `${line.date}時点` : '未連携'} />
          <StatCard label="今月PV" value={ga4Totals ? ga4Totals.pageViews.toLocaleString() : '—'} sub={ga4Totals ? `UU ${ga4Totals.activeUsers.toLocaleString()}` : '未連携'} />
          <StatCard
            label="目標まで（月100万）"
            value={yen(Math.max(0, 1_000_000 - thisRev.total))}
            sub={`達成率 ${Math.round((thisRev.total / 1_000_000) * 100)}%`}
          />
        </StatGrid>
      </section>

      {/* 月次トレンド */}
      <section style={{ marginBottom: 28 }}>
        <Card title="月次トレンド（直近12か月）" bodyPadding={0}>
          {trend.length === 0 ? (
            <div style={{ padding: 20, fontSize: 13, color: 'var(--ink-600)' }}>
              まだデータがありません。下のフォームから今月の数字を入力するか、連携を設定してください。
            </div>
          ) : (
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                <thead>
                  <tr>
                    <Th>月</Th>
                    <Th>収益（バー）</Th>
                    <Th align="right">収益合計</Th>
                    <Th align="right">アフィリ</Th>
                    <Th align="right">AdSense</Th>
                    <Th align="right">PV</Th>
                    <Th align="right">LINE</Th>
                  </tr>
                </thead>
                <tbody>
                  {[...trend].reverse().map((t) => (
                    <tr key={t.month} className="admin-row">
                      <Td>{monthLabel(t.month)}</Td>
                      <Td>
                        <Bar pct={(t.revenue / maxRevenue) * 100} color="var(--accent)" />
                      </Td>
                      <Td align="right"><strong>{yen(t.revenue)}</strong></Td>
                      <Td align="right">{yen(t.exAdsense)}</Td>
                      <Td align="right">{yen(t.adsense)}</Td>
                      <Td align="right">{t.pv != null ? t.pv.toLocaleString() : '—'}</Td>
                      <Td align="right">{t.line != null ? t.line.toLocaleString() : '—'}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

      {/* 稼ぎ頭記事（GA4 affiliate_click） */}
      <section style={{ marginBottom: 28 }}>
        <Card
          title="稼ぎ頭記事 — アフィリンク クリック数（直近28日 / GA4）"
          description="確定収益ではなくクリック数の近似。どの記事が収益に効いているかの当たりをつける指標。"
          bodyPadding={0}
        >
          {topClicked.length === 0 ? (
            <div style={{ padding: 16, fontSize: 13, color: 'var(--ink-600)' }}>
              {isGa4Configured() ? 'クリックデータがまだありません（計測の蓄積待ち）。' : 'GA4 未連携です。下の「連携状況」を参照してください。'}
            </div>
          ) : (
            <div>
              {topClicked.map((r, i) => (
                <div key={r.path} className="admin-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderBottom: '1px solid var(--border-faint)', fontSize: 13 }}>
                  <span style={{ width: 22, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ink-400)' }}>{i + 1}</span>
                  <Link href={r.path} target="_blank" style={{ flex: 1, color: 'var(--ink-900)', textDecoration: 'none', minWidth: 0 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.title ?? r.path}
                    </span>
                  </Link>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'var(--ink-900)' }}>{r.count.toLocaleString()}<span style={{ fontSize: 11, color: 'var(--ink-400)', marginLeft: 3 }}>クリック</span></span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      {/* ASP別クリック内訳（GA4 affiliate_click / provider） */}
      <section style={{ marginBottom: 28 }}>
        <Card
          title="ASP別クリック内訳 — 予約・成果報酬の当たり（直近28日 / GA4）"
          description="どのASP（ホットペッパー予約 / アソビュー / 楽天…）がクリックを集めているか。換金構造が機能しているかの一次指標。"
          bodyPadding={0}
        >
          {clicksByProvider === null ? (
            <div style={{ padding: 16, fontSize: 13, color: 'var(--ink-600)', lineHeight: 1.7 }}>
              {isGa4Configured()
                ? 'provider別に集計できません。GA4管理画面「カスタム定義 → カスタムディメンションを作成」で、イベントスコープ・パラメータ名 '
                : 'GA4 未連携です。下の「連携状況」を参照してください。'}
              {isGa4Configured() && (
                <>
                  <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-subtle)', padding: '1px 6px', borderRadius: 4 }}>provider</code>
                  {' を登録してください。※GA4の仕様で遡及はせず、登録日以降のクリックのみ集計対象（登録前は (未設定) 扱い）。'}
                </>
              )}
            </div>
          ) : clicksByProvider.length === 0 ? (
            <div style={{ padding: 16, fontSize: 13, color: 'var(--ink-600)' }}>
              クリックデータがまだありません（計測の蓄積待ち）。
            </div>
          ) : (
            <div>
              {(() => {
                const labels: Record<string, string> = {
                  valuecommerce: 'バリューコマース（ホットペッパー/アソビュー）',
                  rakuten: '楽天', amazon: 'Amazon', yahoo: 'Yahoo!', a8: 'A8.net', moshimo: 'もしも', other: 'その他',
                };
                const total = clicksByProvider.reduce((s, r) => s + r.count, 0) || 1;
                return clicksByProvider.map((r) => (
                  <div key={r.provider} className="admin-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderBottom: '1px solid var(--border-faint)', fontSize: 13 }}>
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ink-900)' }}>{labels[r.provider] ?? r.provider}</span>
                    <span style={{ fontSize: 11, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{Math.round((r.count / total) * 100)}%</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'var(--ink-900)' }}>{r.count.toLocaleString()}<span style={{ fontSize: 11, color: 'var(--ink-400)', marginLeft: 3 }}>クリック</span></span>
                  </div>
                ));
              })()}
            </div>
          )}
        </Card>
      </section>

      {/* 検索流入TOP（GSC） */}
      {topGsc.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <Card title="検索流入TOP（直近28日 / Search Console）" bodyPadding={0}>
            <div>
              {topGsc.map((p, i) => (
                <div key={p.keys[0]} className="admin-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderBottom: '1px solid var(--border-faint)', fontSize: 13 }}>
                  <span style={{ width: 22, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ink-400)' }}>{i + 1}</span>
                  <a href={p.keys[0]} target="_blank" rel="noreferrer" style={{ flex: 1, color: 'var(--ink-900)', textDecoration: 'none', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.keys[0].replace('https://kyounoko.jp', '')}
                  </a>
                  <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--ink-900)' }}>{p.clicks.toLocaleString()}<span style={{ fontSize: 11, color: 'var(--ink-400)', marginLeft: 3 }}>クリック</span></span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* 月次入力フォーム（手入力: アフィリ確定収益・LINEなど） */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={SectionH2}>月次データ入力（手入力）</h2>
        <KpiClient
          initialStore={store}
          defaultMonth={thisMonth}
          liveLineFollowers={line?.followers ?? null}
          livePv={ga4Totals?.pageViews ?? null}
        />
      </section>

      {/* 連携状況 */}
      <section style={{ marginBottom: 28 }}>
        <Card title="連携状況" bodyPadding={0}>
          <div>
            {integrations.map((it) => (
              <div key={it.name} className="admin-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--border-faint)', fontSize: 13 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: it.ok ? 'var(--ok-dot)' : 'var(--neu-dot)', flex: '0 0 auto' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{it.name}</div>
                  {!it.ok && <div style={{ fontSize: 11, color: 'var(--ink-400)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{it.env}</div>}
                </div>
                <span style={{ fontSize: 12, color: it.ok ? 'var(--ok-fg)' : 'var(--ink-400)' }}>{it.ok ? '連携済み' : '未連携'}</span>
              </div>
            ))}
          </div>
        </Card>
        <p style={{ fontSize: 11, color: 'var(--ink-400)', marginTop: 8, lineHeight: 1.7 }}>
          未連携の指標は手入力で蓄積できます。env を Vercel に追加すると自動取得に切り替わります。
        </p>
      </section>

      <div style={{ marginTop: 32, padding: 20, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px', color: 'var(--ink-900)' }}>関連</h3>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13 }}>
          <Link href="/admin/insights" style={{ color: 'var(--accent)' }}>記事品質インサイト</Link>
          <Link href="/admin/seo" style={{ color: 'var(--accent)' }}>SEO（Search Console）</Link>
          <Link href="/admin" style={{ color: 'var(--accent)' }}>管理ダッシュボード</Link>
        </div>
      </div>
    </>
  );
}

// ================== UI helpers ==================
const SectionH2: React.CSSProperties = { fontSize: 14, margin: '0 0 12px', fontWeight: 700, color: 'var(--ink-900)' };

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <th style={{ textAlign: align, padding: '9px 14px', fontSize: 11, fontWeight: 600, color: 'var(--ink-400)', borderBottom: '1px solid var(--border-divider)', background: 'var(--bg-app)' }}>
      {children}
    </th>
  );
}
function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <td style={{ textAlign: align, padding: '11px 14px', fontSize: 13, color: 'var(--ink-900)', borderBottom: '1px solid var(--border-faint)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
      {children}
    </td>
  );
}
