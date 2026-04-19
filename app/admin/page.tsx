import Link from 'next/link';
import { getAllFileArticles } from '@/lib/articles';
import { getAllPlanMetas } from '@/lib/plans';
import { SPOTS } from '@/lib/spots';

export const revalidate = 3600;

export default function AdminDashboard() {
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

  // カテゴリ別件数
  const catCount: Record<string, number> = {};
  for (const a of articles) {
    const key = a.categoryName ?? a.category ?? 'その他';
    catCount[key] = (catCount[key] ?? 0) + 1;
  }
  const topCats = Object.entries(catCount).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 24, margin: '0 0 24px' }}>
        サイト状況
      </h1>

      {/* KPI グリッド */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <KpiCard title="記事" value={articles.length} href="/admin/articles" />
        <KpiCard title="プラン" value={plans.length} href="/admin/plans" />
        <KpiCard title="スポット" value={spotsCount} href="/admin/spots" sub={`${spotsAreas}都道府県`} />
        <KpiCard title="エリア特化プラン" value={plansWithArea} sub={`全体の${Math.round((plansWithArea / plans.length) * 100)}%`} />
      </div>

      {/* 改善候補 */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 12px' }}>改善候補</h2>
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            fontSize: 13,
          }}
        >
          <StatRow label="Hero画像なし記事" value={articlesMissingHero} warn={articlesMissingHero > 0} />
          <StatRow label="Hero画像なしプラン" value={plansMissingHero} warn={plansMissingHero > 0} />
          <StatRow label="導入文が短い記事 (&lt;50文字)" value={articlesMissingLede} warn={articlesMissingLede > 0} />
          <StatRow label="エリア非依存プラン" value={plansNoArea} warn={false} />
        </div>
      </section>

      {/* カテゴリ分布 */}
      <section>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 12px' }}>記事カテゴリ分布</h2>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '8px 0' }}>
          {topCats.map(([cat, n]) => (
            <div key={cat} style={{ display: 'flex', padding: '8px 20px', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
              <span style={{ flex: 1 }}>{cat}</span>
              <span style={{ color: 'var(--ink-sub)', fontFamily: 'var(--font-inter)' }}>{n}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function KpiCard({ title, value, sub, href }: { title: string; value: number | string; sub?: string; href?: string }) {
  const body = (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
        {title}
      </div>
      <div style={{ fontSize: 32, fontFamily: 'var(--font-mincho)', fontWeight: 600, margin: '6px 0 2px' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{sub}</div>}
    </div>
  );
  return href ? (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      {body}
    </Link>
  ) : body;
}

function StatRow({ label, value, warn }: { label: string; value: number; warn: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ flex: 1, color: 'var(--ink-sub)' }} dangerouslySetInnerHTML={{ __html: label }} />
      <span style={{ fontSize: 18, fontWeight: 600, color: warn ? '#c4704f' : 'var(--ink)' }}>
        {value}
      </span>
    </div>
  );
}
