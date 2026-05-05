import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import {
  getStationBySlug,
  TOKYO_STATIONS,
  WARD_NAMES,
  type TokyoStation,
} from '@/lib/tokyo-stations';
import {
  getStationWithChains,
  CHAIN_CATEGORY_LABEL,
  type Chain,
  type ChainCategory,
} from '@/lib/station-restaurants';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24h

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * 全484駅分の静的パスを事前生成。
 */
export async function generateStaticParams() {
  return TOKYO_STATIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const station = getStationBySlug(slug);
  if (!station) {
    return {
      title: '駅が見つかりません',
      robots: { index: false, follow: false },
    };
  }
  const wardName = WARD_NAMES[station.ward] ?? '';
  const title = `${station.name}駅 子連れランチおすすめ｜ベビーカーOK・キッズメニュー店ガイド【${wardName}】`;
  const description = `${station.name}駅周辺で子連れOK・ベビーカー入店OKのファミレス・カフェ・チェーン店を厳選。キッズメニュー・キッズチェア・個室・離乳食持込可など子連れ目線で全項目チェック。${wardName}で子どもとランチ・カフェに困らない実用ガイド。`;
  return {
    title,
    description,
    alternates: { canonical: `/station/${slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://kyounoko.jp/station/${slug}`,
    },
  };
}

const STROLLER_LABEL: Record<Chain['stroller'], string> = {
  good: '◎',
  ok: '○',
  limited: '△',
};
const STROLLER_DESC: Record<Chain['stroller'], string> = {
  good: 'ベビーカーで余裕入店',
  ok: '通路でやや配慮',
  limited: '混雑時は折り畳み推奨',
};

export default async function StationPage({ params }: Props) {
  const { slug } = await params;
  const station = getStationBySlug(slug);
  if (!station) notFound();

  const data = getStationWithChains(slug);
  if (!data) notFound();
  const { chains } = data;

  const wardName = WARD_NAMES[station.ward] ?? '';

  // カテゴリ別グルーピング
  const byCategory = new Map<ChainCategory, Chain[]>();
  for (const c of chains) {
    if (!byCategory.has(c.category)) byCategory.set(c.category, []);
    byCategory.get(c.category)!.push(c);
  }

  // 同じ区の他駅（ナビゲーション用）
  const sameWardStations = TOKYO_STATIONS
    .filter((s) => s.ward === station.ward && s.slug !== station.slug)
    .slice(0, 12);

  // JSON-LD: ItemList で各チェーンを列挙
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${station.name}駅 子連れランチ・ベビーカーOK店`,
    description: `${station.name}駅周辺の子連れ歓迎チェーン店リスト`,
    numberOfItems: chains.length,
    itemListElement: chains.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Restaurant',
        name: c.name,
        description: c.description,
        servesCuisine: CHAIN_CATEGORY_LABEL[c.category],
        priceRange: c.lunchPrice,
      },
    })),
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: '駅別子連れランチ', item: 'https://kyounoko.jp/station' },
      { '@type': 'ListItem', position: 3, name: `${station.name}駅`, item: `https://kyounoko.jp/station/${slug}` },
    ],
  };

  return (
    <>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="container">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <Link href="/station">駅別ランチ</Link>
          <span className="sep">/</span>
          <span>{station.name}駅</span>
        </nav>
      </div>

      <section className="section">
        <div className="container-narrow">
          <header className="page-head">
            <span className="eyebrow">{wardName} · {station.lines[0]}沿線</span>
            <h1>
              {station.name}駅 子連れランチおすすめ
              <small style={{ display: 'block', fontSize: '0.5em', fontWeight: 400, color: 'var(--ink-sub)', marginTop: 8 }}>
                ベビーカーOK・キッズメニュー・個室あり店ガイド
              </small>
            </h1>
            <p className="lead">
              {station.name}駅から徒歩5〜10分圏内にある、子連れOKのファミレス・カフェ・チェーン店を厳選。
              ベビーカー入店可否、キッズメニュー、キッズチェア、個室、離乳食持込OKまで全項目チェックしました。
              {wardName}で子連れランチ場所に迷ったらまずココから。
            </p>

            <div className="station-summary" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
              <span className="meta-chip clay">{station.lines.length}路線</span>
              <span className="meta-chip clay">{chains.length}店舗</span>
              {station.scale === 'terminal' && <span className="meta-chip clay">ターミナル駅</span>}
              {station.scale === 'major' && <span className="meta-chip clay">主要駅</span>}
              {station.familyFriendly && <span className="meta-chip clay">ファミリー多め</span>}
            </div>

            <div style={{ marginTop: 18, fontSize: 13, color: 'var(--ink-sub)' }}>
              <strong>路線:</strong> {station.lines.join(' / ')}
            </div>
          </header>

          {/* TL;DR */}
          <section className="station-tldr" style={{
            background: 'rgba(201,96,62,0.06)',
            padding: '20px 24px',
            borderRadius: 16,
            margin: '32px 0',
          }}>
            <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, marginBottom: 12 }}>30秒でわかる｜{station.name}駅 子連れ攻略</h2>
            <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.9 }}>
              <li><strong>ベビーカーで余裕入店できる店</strong>: {chains.filter(c => c.stroller === 'good').length}店</li>
              <li><strong>キッズメニューあり</strong>: {chains.filter(c => c.kidsMenu).length}店</li>
              <li><strong>キッズチェア（ベビーチェア）あり</strong>: {chains.filter(c => c.babyChair).length}店</li>
              <li><strong>個室・仕切り席あり</strong>: {chains.filter(c => c.privateRoom).length}店</li>
              <li><strong>離乳食持込OK</strong>: {chains.filter(c => c.babyFoodOk).length}店</li>
              <li><strong>ランチ800円以内</strong>: {chains.filter(c => c.lunchPrice === '〜800').length}店</li>
            </ul>
          </section>

          {/* カテゴリ別店舗リスト */}
          {Array.from(byCategory.entries()).map(([cat, list]) => (
            <section key={cat} className="station-category" style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 22, marginBottom: 16 }}>
                {CHAIN_CATEGORY_LABEL[cat]} <span style={{ fontSize: 14, color: 'var(--ink-mute)', fontWeight: 400 }}>{list.length}店</span>
              </h2>
              <div className="station-chains" style={{ display: 'grid', gap: 14 }}>
                {list.map((c) => (
                  <article key={c.slug} className="station-chain-card" style={{
                    background: 'var(--paper-card)',
                    border: '1px solid rgba(201,96,62,0.16)',
                    borderRadius: 12,
                    padding: '16px 18px',
                  }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{c.name}</h3>
                      <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>ランチ {c.lunchPrice}円</span>
                    </header>
                    <p style={{ fontSize: 14, color: 'var(--ink-sub)', lineHeight: 1.7, marginTop: 0, marginBottom: 12 }}>
                      {c.description}
                    </p>
                    <div className="station-chain-meta" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
                      <span title={STROLLER_DESC[c.stroller]} style={{
                        background: c.stroller === 'good' ? '#E8F5E9' : c.stroller === 'ok' ? '#FFF8E1' : '#FFEBEE',
                        color: c.stroller === 'good' ? '#2E7D32' : c.stroller === 'ok' ? '#F57C00' : '#C62828',
                        padding: '4px 10px', borderRadius: 999,
                      }}>
                        ベビーカー {STROLLER_LABEL[c.stroller]}
                      </span>
                      {c.kidsMenu && <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '4px 10px', borderRadius: 999 }}>キッズメニュー</span>}
                      {c.babyChair && <span style={{ background: '#F3E5F5', color: '#7B1FA2', padding: '4px 10px', borderRadius: 999 }}>キッズチェア</span>}
                      {c.privateRoom && <span style={{ background: '#FFF3E0', color: '#E65100', padding: '4px 10px', borderRadius: 999 }}>個室あり</span>}
                      {c.babyFoodOk && <span style={{ background: '#E0F7FA', color: '#00838F', padding: '4px 10px', borderRadius: 999 }}>離乳食持込OK</span>}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}

          {/* 同じ区の他駅 */}
          {sameWardStations.length > 0 && (
            <section className="station-related" style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(201,96,62,0.14)' }}>
              <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, marginBottom: 12 }}>
                {wardName}の他の駅もチェック
              </h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {sameWardStations.map((s) => (
                  <Link key={s.slug} href={`/station/${s.slug}`} className="chip">
                    {s.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 戻る・他のエリア */}
          <section style={{ marginTop: 36, padding: '24px 0', textAlign: 'center', color: 'var(--ink-sub)' }}>
            <p style={{ fontSize: 14 }}>
              他の駅・エリアを見る → <Link href="/station" style={{ color: 'var(--clay-deep)' }}>駅別ガイド一覧</Link>
            </p>
          </section>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
