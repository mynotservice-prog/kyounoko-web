import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import {
  getStationBySlug,
  TOKYO_STATIONS,
  WARD_NAMES,
} from '@/lib/tokyo-stations';
import {
  getStationWithChains,
  CHAIN_CATEGORY_LABEL,
  type Chain,
  type ChainCategory,
} from '@/lib/station-restaurants';
import {
  getIndieRestaurantsByStation,
  INDIE_GENRE_LABEL,
  type IndieRestaurant,
  type IndieGenre,
} from '@/lib/indie-restaurants';
import {
  STATION_CONDITIONS,
  getConditionBySlug,
  filterChainsByCondition,
  filterIndiesByCondition,
  hasMatchingItems,
  type StationConditionSlug,
} from '@/lib/station-conditions';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24h

type Props = {
  params: Promise<{ slug: string; condition: string }>;
};

/**
 * 484駅 × 4条件 のうち、該当店舗が1件以上ある組み合わせのみを事前生成。
 */
export async function generateStaticParams() {
  const params: Array<{ slug: string; condition: string }> = [];
  for (const station of TOKYO_STATIONS) {
    const data = getStationWithChains(station.slug);
    const chains = data?.chains ?? [];
    const indies = getIndieRestaurantsByStation(station.slug);
    for (const cond of STATION_CONDITIONS) {
      if (hasMatchingItems(chains, indies, cond.slug)) {
        params.push({ slug: station.slug, condition: cond.slug });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, condition } = await params;
  const station = getStationBySlug(slug);
  const cond = getConditionBySlug(condition);
  if (!station || !cond) {
    return {
      title: 'ページが見つかりません',
      robots: { index: false, follow: false },
    };
  }
  const wardName = WARD_NAMES[station.ward] ?? '';
  const title = `${station.name}駅 ${cond.titlePart}子連れOKランチ・カフェ｜ベビーカーOK店ガイド`;
  const description = `${station.name}駅周辺で${cond.metaPart}の子連れランチ・カフェを厳選。${cond.description}${wardName}で${cond.label}の選び方に迷ったらまずここから。`;

  // 該当店舗数で薄いコンテンツを判定 → noindex（テンプレ重複扱い回避）
  const data = getStationWithChains(slug);
  const chainsBase = data?.chains ?? [];
  const indiesBase = getIndieRestaurantsByStation(slug);
  const matchedChains = filterChainsByCondition(chainsBase, condition as StationConditionSlug);
  const matchedIndies = filterIndiesByCondition(indiesBase, condition as StationConditionSlug);
  const matchedCount = matchedChains.length + matchedIndies.length;
  // 3件未満は質が薄いので noindex（クロール済み未登録回避）
  const shouldNoindex = matchedCount < 3;

  return {
    title,
    description,
    alternates: { canonical: `/station/${slug}/${condition}` },
    robots: shouldNoindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://kyounoko.jp/station/${slug}/${condition}`,
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

export default async function StationConditionPage({ params }: Props) {
  const { slug, condition } = await params;
  const station = getStationBySlug(slug);
  if (!station) notFound();
  const cond = getConditionBySlug(condition);
  if (!cond) notFound();

  const data = getStationWithChains(slug);
  if (!data) notFound();

  const allIndies = getIndieRestaurantsByStation(slug);
  const conditionSlug: StationConditionSlug = cond.slug;
  const chains = filterChainsByCondition(data.chains, conditionSlug);
  const indies = filterIndiesByCondition(allIndies, conditionSlug);

  // 0件の組み合わせは generateStaticParams で除外しているが、念のため
  if (chains.length + indies.length === 0) notFound();

  const wardName = WARD_NAMES[station.ward] ?? '';

  // チェーンをカテゴリ別にグルーピング
  const byCategory = new Map<ChainCategory, Chain[]>();
  for (const c of chains) {
    if (!byCategory.has(c.category)) byCategory.set(c.category, []);
    byCategory.get(c.category)!.push(c);
  }

  // 個人店をジャンル別にグルーピング
  const indiesByGenre = new Map<IndieGenre, IndieRestaurant[]>();
  for (const r of indies) {
    if (!indiesByGenre.has(r.genre)) indiesByGenre.set(r.genre, []);
    indiesByGenre.get(r.genre)!.push(r);
  }

  // 同じ駅の他条件（残り3条件）— 該当0件のものは除外
  const otherConditions = STATION_CONDITIONS.filter((c) => c.slug !== conditionSlug)
    .map((c) => {
      const cn = filterChainsByCondition(data.chains, c.slug).length;
      const inn = filterIndiesByCondition(allIndies, c.slug).length;
      return { cond: c, count: cn + inn };
    })
    .filter((x) => x.count > 0);

  // 同区の他駅（同じ条件で該当ありの駅）
  const sameWardSameCondition = TOKYO_STATIONS
    .filter((s) => s.ward === station.ward && s.slug !== station.slug)
    .map((s) => {
      const sd = getStationWithChains(s.slug);
      const sc = sd?.chains ?? [];
      const si = getIndieRestaurantsByStation(s.slug);
      const has = hasMatchingItems(sc, si, conditionSlug);
      return { station: s, has };
    })
    .filter((x) => x.has)
    .slice(0, 12)
    .map((x) => x.station);

  // JSON-LD ItemList
  const allItemsForLd = [
    ...chains.map((c) => ({
      name: c.name,
      description: c.description,
      cuisine: CHAIN_CATEGORY_LABEL[c.category],
      priceRange: c.lunchPrice,
    })),
    ...indies.map((r) => ({
      name: r.name,
      description: r.description,
      cuisine: INDIE_GENRE_LABEL[r.genre],
      priceRange: r.priceLunch,
    })),
  ];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${station.name}駅 ${cond.titlePart}子連れランチ`,
    description: `${station.name}駅周辺で${cond.metaPart}の店舗リスト`,
    numberOfItems: allItemsForLd.length,
    itemListElement: allItemsForLd.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Restaurant',
        name: c.name,
        description: c.description,
        servesCuisine: c.cuisine,
        priceRange: c.priceRange,
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
      { '@type': 'ListItem', position: 4, name: cond.label, item: `https://kyounoko.jp/station/${slug}/${condition}` },
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
          <Link href={`/station/${slug}`}>{station.name}駅</Link>
          <span className="sep">/</span>
          <span>{cond.label}</span>
        </nav>
      </div>

      <section className="section">
        <div className="container-narrow">
          <header className="page-head">
            <span className="eyebrow">{wardName} · {station.name}駅 / 条件で絞る</span>
            <h1>
              {station.name}駅 {cond.titlePart}子連れOKランチ・カフェ
              <small style={{ display: 'block', fontSize: '0.5em', fontWeight: 400, color: 'var(--ink-sub)', marginTop: 8 }}>
                {cond.tagline}
              </small>
            </h1>
            <p className="lead">
              {station.name}駅周辺で<strong>{cond.metaPart}</strong>の店舗だけを抽出してご紹介。
              {cond.description}
              {wardName}で{cond.label}のお店選びに迷ったらまずここから。
            </p>

            <div className="station-summary" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
              <span className="meta-chip clay">該当 {chains.length + indies.length}店</span>
              {chains.length > 0 && <span className="meta-chip clay">チェーン{chains.length}店</span>}
              {indies.length > 0 && <span className="meta-chip clay">個人店{indies.length}店</span>}
              {station.scale === 'terminal' && <span className="meta-chip clay">ターミナル駅</span>}
              {station.scale === 'major' && <span className="meta-chip clay">主要駅</span>}
            </div>
          </header>

          {/* チェーン店リスト（条件 'indie' 以外） */}
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

          {/* 個人店リスト */}
          {indies.length > 0 && (
            <section className="station-indies" style={{
              marginTop: 8,
              marginBottom: 36,
              paddingTop: 32,
              borderTop: '2px dashed rgba(201,96,62,0.18)',
            }}>
              <header style={{ marginBottom: 24 }}>
                <span className="eyebrow" style={{ color: 'var(--clay-deep)' }}>チェーンじゃない、ローカルの実力店</span>
                <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 24, marginTop: 6, marginBottom: 8 }}>
                  {station.name}駅の個人店・話題店 <span style={{ fontSize: 14, color: 'var(--ink-mute)', fontWeight: 400 }}>{indies.length}店</span>
                </h2>
                <p style={{ fontSize: 14, color: 'var(--ink-sub)', lineHeight: 1.7, margin: 0 }}>
                  雑誌・TV・SNSで取り上げられた{station.name}エリアの実力店から、{cond.label}条件に合う店舗を厳選。
                  <small style={{ display: 'block', marginTop: 6, fontSize: 12, color: 'var(--ink-mute)' }}>
                    ※ 設備情報は公式・取材情報ベース。お子様連れ利用は店舗への事前確認をおすすめします。
                  </small>
                </p>
              </header>

              {Array.from(indiesByGenre.entries()).map(([genre, list]) => (
                <section key={genre} style={{ marginBottom: 28 }}>
                  <h3 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, marginBottom: 12, color: 'var(--clay-deep)' }}>
                    {INDIE_GENRE_LABEL[genre]} <span style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 400 }}>{list.length}店</span>
                  </h3>
                  <div style={{ display: 'grid', gap: 14 }}>
                    {list.map((r, idx) => (
                      <article key={`${genre}-${idx}-${r.name}`} style={{
                        background: '#fffaf6',
                        border: '1px solid rgba(201,96,62,0.20)',
                        borderRadius: 12,
                        padding: '16px 18px',
                      }}>
                        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                          <h4 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
                            {r.name}
                            {r.popular && <span style={{
                              marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 999,
                              background: '#FFEBEE', color: '#C62828', fontWeight: 500,
                            }}>話題店</span>}
                          </h4>
                          <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>ランチ {r.priceLunch}</span>
                        </header>
                        <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 8 }}>{r.area}</div>
                        <p style={{ fontSize: 13.5, color: 'var(--ink-sub)', lineHeight: 1.75, margin: '0 0 10px' }}>
                          {r.description}
                        </p>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 11.5 }}>
                          {r.strollerOk && <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '3px 9px', borderRadius: 999 }}>ベビーカー◎</span>}
                          {r.kidsMenu && <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '3px 9px', borderRadius: 999 }}>キッズメニュー</span>}
                          {r.privateRoom && <span style={{ background: '#FFF3E0', color: '#E65100', padding: '3px 9px', borderRadius: 999 }}>個室・座敷</span>}
                          {!r.strollerOk && !r.kidsMenu && !r.privateRoom && (
                            <span style={{ color: 'var(--ink-mute)', fontSize: 11 }}>※ 子連れ利用は要事前確認</span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </section>
          )}

          {/* 他の条件で同駅を見る */}
          {otherConditions.length > 0 && (
            <section className="station-other-conditions" style={{
              marginTop: 36,
              padding: '24px 0',
              borderTop: '1px solid rgba(201,96,62,0.14)',
            }}>
              <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, marginBottom: 12 }}>
                他の条件で{station.name}駅を見る
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {otherConditions.map(({ cond: oc, count }) => (
                  <Link
                    key={oc.slug}
                    href={`/station/${slug}/${oc.slug}`}
                    className="condition-card"
                    style={{
                      display: 'block',
                      background: 'var(--paper-card)',
                      border: '1px solid rgba(201,96,62,0.20)',
                      borderRadius: 12,
                      padding: '14px 16px',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                      <strong style={{ fontSize: 15 }}>{oc.label}</strong>
                      <span style={{
                        fontSize: 11,
                        background: 'rgba(201,96,62,0.10)',
                        color: 'var(--clay-deep)',
                        padding: '2px 8px',
                        borderRadius: 999,
                      }}>{count}店</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-sub)', lineHeight: 1.5 }}>{oc.tagline}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 同じ条件の他駅 */}
          {sameWardSameCondition.length > 0 && (
            <section className="station-related" style={{ marginTop: 36, paddingTop: 32, borderTop: '1px solid rgba(201,96,62,0.14)' }}>
              <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, marginBottom: 12 }}>
                {wardName}の他の駅で「{cond.label}」を見る
              </h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {sameWardSameCondition.map((s) => (
                  <Link key={s.slug} href={`/station/${s.slug}/${conditionSlug}`} className="chip">
                    {s.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 戻る */}
          <section style={{ marginTop: 36, padding: '24px 0', textAlign: 'center', color: 'var(--ink-sub)' }}>
            <p style={{ fontSize: 14 }}>
              <Link href={`/station/${slug}`} style={{ color: 'var(--clay-deep)' }}>← {station.name}駅トップに戻る</Link>
              {' / '}
              <Link href="/station" style={{ color: 'var(--clay-deep)' }}>駅別ガイド一覧</Link>
            </p>
          </section>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
