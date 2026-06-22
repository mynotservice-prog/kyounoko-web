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
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 26, margin: '0 0 6px' }}>
          📈 経営KPI ダッシュボード
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-mute)', margin: 0, lineHeight: 1.7 }}>
          収益・PV・LINE登録を月次で蓄積し、データ・ドリブンに意思決定するためのダッシュボード。<br />
          自動取得（GA4・AdSense・LINE・GSC）＋アフィリエイト確定収益の手入力。
        </p>
      </div>

      {/* 今月のKPI */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={SectionH2}>今月（{monthLabel(thisMonth)}）</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          <Kpi label="収益合計" value={yen(thisRev.total)} accent />
          <Kpi label="アフィリ（AdSense除く）" value={yen(thisRev.exAdsense)} />
          <Kpi label="AdSense" value={adsenseThisMonth != null ? yen(adsenseThisMonth) : yen(thisRev.adsense)} sub={isAdsenseReportConfigured() ? '自動' : '手入力'} />
          <Kpi label="LINE友だち" value={line ? line.followers.toLocaleString() : '—'} sub={line ? `${line.date}時点` : '未連携'} />
          <Kpi label="今月PV" value={ga4Totals ? ga4Totals.pageViews.toLocaleString() : '—'} sub={ga4Totals ? `UU ${ga4Totals.activeUsers.toLocaleString()}` : '未連携'} />
          <Kpi
            label="目標まで（月100万）"
            value={yen(Math.max(0, 1_000_000 - thisRev.total))}
            sub={`達成率 ${Math.round((thisRev.total / 1_000_000) * 100)}%`}
          />
        </div>
      </section>

      {/* 月次トレンド */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={SectionH2}>月次トレンド（直近12か月）</h2>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'auto' }}>
          {trend.length === 0 ? (
            <div style={{ padding: 20, fontSize: 13, color: 'var(--ink-sub)' }}>
              まだデータがありません。下のフォームから今月の数字を入力するか、連携を設定してください。
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 }}>
              <thead>
                <tr style={{ background: 'var(--paper-deep)' }}>
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
                  <tr key={t.month} style={{ borderTop: '1px solid var(--line)' }}>
                    <Td>{monthLabel(t.month)}</Td>
                    <Td>
                      <div style={{ background: 'var(--paper-deep)', height: 14, borderRadius: 3, overflow: 'hidden', minWidth: 120 }}>
                        <div style={{ width: `${(t.revenue / maxRevenue) * 100}%`, background: 'var(--clay)', height: '100%' }} />
                      </div>
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
          )}
        </div>
      </section>

      {/* 稼ぎ頭記事（GA4 affiliate_click） */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={SectionH2}>🏆 稼ぎ頭記事 — アフィリンク クリック数（直近28日 / GA4）</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-mute)', margin: '4px 0 12px' }}>
          確定収益ではなくクリック数の近似。どの記事が収益に効いているかの当たりをつける指標。
        </p>
        {topClicked.length === 0 ? (
          <div style={{ padding: 16, background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--ink-sub)' }}>
            {isGa4Configured() ? 'クリックデータがまだありません（計測の蓄積待ち）。' : 'GA4 未連携です。下の「連携状況」を参照してください。'}
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            {topClicked.map((r, i) => (
              <div key={r.path} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderTop: i === 0 ? 'none' : '1px solid var(--line)', fontSize: 13 }}>
                <span style={{ width: 22, fontWeight: 700, color: 'var(--ink-mute)' }}>{i + 1}</span>
                <Link href={r.path} target="_blank" style={{ flex: 1, color: 'var(--ink)', textDecoration: 'none', minWidth: 0 }}>
                  <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.title ?? r.path}
                  </span>
                </Link>
                <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{r.count.toLocaleString()}<span style={{ fontSize: 11, color: 'var(--ink-mute)', marginLeft: 2 }}>クリック</span></span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ASP別クリック内訳（GA4 affiliate_click / provider） */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={SectionH2}>💳 ASP別クリック内訳 — 予約・成果報酬の当たり（直近28日 / GA4）</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-mute)', margin: '4px 0 12px' }}>
          どのASP（ホットペッパー予約 / アソビュー / 楽天…）がクリックを集めているか。換金構造が機能しているかの一次指標。
        </p>
        {clicksByProvider === null ? (
          <div style={{ padding: 16, background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--ink-sub)', lineHeight: 1.7 }}>
            {isGa4Configured()
              ? 'provider別に集計できません。GA4管理画面「カスタム定義 → カスタムディメンションを作成」で、イベントスコープ・パラメータ名 '
              : 'GA4 未連携です。下の「連携状況」を参照してください。'}
            {isGa4Configured() && (
              <>
                <code style={{ fontFamily: 'monospace', background: 'var(--paper-2,#f3efe7)', padding: '1px 6px', borderRadius: 4 }}>provider</code>
                {' を登録してください。※GA4の仕様で遡及はせず、登録日以降のクリックのみ集計対象（登録前は (未設定) 扱い）。'}
              </>
            )}
          </div>
        ) : clicksByProvider.length === 0 ? (
          <div style={{ padding: 16, background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--ink-sub)' }}>
            クリックデータがまだありません（計測の蓄積待ち）。
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            {(() => {
              const labels: Record<string, string> = {
                valuecommerce: 'バリューコマース（ホットペッパー/アソビュー）',
                rakuten: '楽天', amazon: 'Amazon', yahoo: 'Yahoo!', a8: 'A8.net', moshimo: 'もしも', other: 'その他',
              };
              const total = clicksByProvider.reduce((s, r) => s + r.count, 0) || 1;
              return clicksByProvider.map((r, i) => (
                <div key={r.provider} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderTop: i === 0 ? 'none' : '1px solid var(--line)', fontSize: 13 }}>
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{labels[r.provider] ?? r.provider}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink-mute)', fontVariantNumeric: 'tabular-nums' }}>{Math.round((r.count / total) * 100)}%</span>
                  <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{r.count.toLocaleString()}<span style={{ fontSize: 11, color: 'var(--ink-mute)', marginLeft: 2 }}>クリック</span></span>
                </div>
              ));
            })()}
          </div>
        )}
      </section>

      {/* 検索流入TOP（GSC） */}
      {topGsc.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2 style={SectionH2}>🔍 検索流入TOP（直近28日 / Search Console）</h2>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            {topGsc.map((p, i) => (
              <div key={p.keys[0]} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderTop: i === 0 ? 'none' : '1px solid var(--line)', fontSize: 13 }}>
                <span style={{ width: 22, fontWeight: 700, color: 'var(--ink-mute)' }}>{i + 1}</span>
                <a href={p.keys[0]} target="_blank" rel="noreferrer" style={{ flex: 1, color: 'var(--ink)', textDecoration: 'none', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.keys[0].replace('https://kyounoko.jp', '')}
                </a>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{p.clicks.toLocaleString()}<span style={{ fontSize: 11, color: 'var(--ink-mute)', marginLeft: 2 }}>クリック</span></span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 月次入力フォーム（手入力: アフィリ確定収益・LINEなど） */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={SectionH2}>✍️ 月次データ入力（手入力）</h2>
        <KpiClient
          initialStore={store}
          defaultMonth={thisMonth}
          liveLineFollowers={line?.followers ?? null}
          livePv={ga4Totals?.pageViews ?? null}
        />
      </section>

      {/* 連携状況 */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={SectionH2}>🔌 連携状況</h2>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {integrations.map((it, i) => (
            <div key={it.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: i === 0 ? 'none' : '1px solid var(--line)', fontSize: 13 }}>
              <span style={{ fontSize: 16 }}>{it.ok ? '✅' : '⚪️'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{it.name}</div>
                {!it.ok && <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2, fontFamily: 'monospace' }}>{it.env}</div>}
              </div>
              <span style={{ fontSize: 12, color: it.ok ? 'var(--sage-deep)' : 'var(--ink-mute)' }}>{it.ok ? '連携済み' : '未連携'}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 8, lineHeight: 1.7 }}>
          未連携の指標は手入力で蓄積できます。env を Vercel に追加すると自動取得に切り替わります。
        </p>
      </section>

      <div style={{ marginTop: 32, padding: 20, background: 'var(--paper-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ fontFamily: 'var(--font-mincho)', fontSize: 16, margin: '0 0 8px' }}>関連</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.95 }}>
          <li><Link href="/admin/insights">記事品質インサイト</Link></li>
          <li><Link href="/admin/seo">SEO（Search Console）</Link></li>
          <li><Link href="/admin">管理ダッシュボード</Link></li>
        </ul>
      </div>
    </>
  );
}

// ================== UI helpers ==================
const SectionH2: React.CSSProperties = { fontFamily: 'var(--font-mincho)', fontSize: 18, margin: '0 0 12px', fontWeight: 600 };

function Kpi({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ background: accent ? 'var(--clay-soft, #f7ede6)' : '#fff', border: `1px solid ${accent ? 'var(--clay)' : 'var(--line)'}`, borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
      <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mincho), serif', fontSize: 24, fontWeight: 700, color: accent ? 'var(--clay-deep)' : 'var(--ink)', lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return <th style={{ textAlign: align, padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--ink-sub)' }}>{children}</th>;
}
function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return <td style={{ textAlign: align, padding: '9px 12px', fontSize: 13, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{children}</td>;
}
