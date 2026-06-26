import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { V2Frame } from '@/components/v2/V2Frame';
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
  getConditionKind,
  type StationConditionSlug,
} from '@/lib/station-conditions';
import {
  getSpotsForStation,
  filterSpotsByCondition,
  hasMatchingSpots,
  getSpotConditionCanonicalSlug,
} from '@/lib/station-spots';
import { findStationBySlug } from '@/lib/all-stations';
import { StationSpotConditionView } from '@/components/station/StationSpotConditionView';
import { AffiliateLinkGroup } from '@/components/affiliate/AffiliateLinkGroup';
import { AffiliateLink } from '@/components/affiliate/AffiliateLink';
import { getCatalogItems } from '@/lib/items-catalog';
import { getRestaurantBridgeOffer } from '@/lib/article-product-hints';
import { buildStationIntro, buildRestaurantInsight, insightToSentence } from '@/lib/station-insight';
import { buildRestaurantFaq, faqToJsonLd } from '@/lib/station-faq';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24h

type Props = {
  params: Promise<{ slug: string; condition: string }>;
};

/**
 * 全駅 × N条件 のうち、該当アイテム（店舗 or スポット）が1件以上ある組み合わせを事前生成。
 * - restaurant 系: チェーン店・個人店をフィルタ（東京駅のみ）
 * - spot 系: SPOTS（駅周辺 + 地域フォールバック）をフィルタ（全駅対象）
 */
export async function generateStaticParams() {
  const params: Array<{ slug: string; condition: string }> = [];
  // 1) Tokyo: restaurant + spot
  for (const station of TOKYO_STATIONS) {
    const data = getStationWithChains(station.slug);
    const chains = data?.chains ?? [];
    const indies = getIndieRestaurantsByStation(station.slug);
    const { all: spotsAll } = getSpotsForStation(station.slug);
    for (const cond of STATION_CONDITIONS) {
      const kind = getConditionKind(cond.slug);
      const ok =
        kind === 'restaurant'
          ? hasMatchingItems(chains, indies, cond.slug)
          : hasMatchingSpots(spotsAll, cond.slug);
      if (ok) {
        params.push({ slug: station.slug, condition: cond.slug });
      }
    }
  }
  // 2) 非Tokyo（Kanagawa/Kansai/Saichi）: spot 系のみ
  const { getAllStations } = await import('@/lib/all-stations');
  for (const station of getAllStations()) {
    if (station.region === 'tokyo') continue;
    const { all: spotsAll } = getSpotsForStation(station.slug);
    for (const cond of STATION_CONDITIONS) {
      if (getConditionKind(cond.slug) !== 'spot') continue;
      if (hasMatchingSpots(spotsAll, cond.slug)) {
        params.push({ slug: station.slug, condition: cond.slug });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, condition } = await params;
  const kind = getConditionKind(condition as StationConditionSlug);
  // restaurant 系はTokyo駅のみ。spot 系は全駅対応のため findStationBySlug を使う
  const station = kind === 'restaurant' ? getStationBySlug(slug) : null;
  const anyStation = kind === 'spot' ? findStationBySlug(slug) : null;
  const cond = getConditionBySlug(condition);
  if ((!station && !anyStation) || !cond) {
    return {
      title: 'ページが見つかりません',
      robots: { index: false, follow: false },
    };
  }
  const wardName = station ? (WARD_NAMES[station.ward] ?? '') : (anyStation?.regionLabel ?? '');
  const stationName = (station ?? anyStation)!.name;
  const title =
    kind === 'spot'
      ? `${stationName}駅 ${cond.titlePart}｜${wardName}の子連れスポットガイド`
      : `${stationName}駅 ${cond.titlePart}子連れOKランチ・カフェ｜ベビーカーOK店ガイド`;
  const description =
    kind === 'spot'
      ? `${stationName}駅周辺で${cond.metaPart}を厳選。${cond.description}${wardName}の${cond.label}を探すならまずここから。`
      : `${stationName}駅周辺で${cond.metaPart}の子連れランチ・カフェを厳選。${cond.description}${wardName}で${cond.label}の選び方に迷ったらまずここから。`;

  // 2026-05 再開: AdSense承認済みのため、駅×条件ページを段階的にindex化。
  // 「matchedCount >= 3 件」の充実ページのみ index、薄ページは noindex を維持。
  // これでプログラマティックSEOの全面再開（〜1万ページ目標）を実現する。
  let matchedCount = 0;
  if (kind === 'restaurant' && station) {
    const stationData = getStationWithChains(station.slug);
    const chains = stationData
      ? filterChainsByCondition(stationData.chains, condition as StationConditionSlug)
      : [];
    const indies = filterIndiesByCondition(
      getIndieRestaurantsByStation(station.slug),
      condition as StationConditionSlug,
    );
    matchedCount = chains.length + indies.length;
  } else if (kind === 'spot' && anyStation) {
    const { all: spotsAll } = getSpotsForStation(slug);
    const spotsMatched = filterSpotsByCondition(spotsAll, condition as StationConditionSlug);
    matchedCount = spotsMatched.length;
  }
  // 剪定(2026-06): スポット系条件(asobiba/kouen/ame-asobiba)は90日間ほぼ表示ゼロ・
  // 外食でもないため、matched数によらず noindex。外食(restaurant)系のみindex対象に残す。
  const shouldNoindex = matchedCount < 3 || kind === 'spot';

  // スポット系条件は区市町村単位のデータで同区の駅が重複しがちなため、
  // 同区×同条件の重複グループは代表駅へ canonical を集約する（重複コンテンツ対策）。
  const canonicalSlug =
    kind === 'spot'
      ? getSpotConditionCanonicalSlug(slug, condition as StationConditionSlug)
      : slug;

  return {
    title,
    description,
    alternates: { canonical: `/station/${canonicalSlug}/${condition}` },
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

  const conditionSlug: StationConditionSlug = cond.slug;
  const kind = getConditionKind(conditionSlug);

  // ---- spot 系条件は別ビューで描画して早期 return ----
  if (kind === 'spot') {
    const anyStation = findStationBySlug(slug);
    if (!anyStation) notFound();
    const { all: spotsAll } = getSpotsForStation(slug);
    const spotsMatched = filterSpotsByCondition(spotsAll, conditionSlug);
    if (spotsMatched.length === 0) notFound();
    const isThin = spotsMatched.length < 3;
    return (
      <StationSpotConditionView
        station={anyStation}
        cond={cond}
        spotsAll={spotsAll}
        spotsMatched={spotsMatched}
        isThin={isThin}
      />
    );
  }

  const data = getStationWithChains(slug);
  if (!data) notFound();

  const allIndies = getIndieRestaurantsByStation(slug);
  const chains = filterChainsByCondition(data.chains, conditionSlug);
  const indies = filterIndiesByCondition(allIndies, conditionSlug);

  // 0件の組み合わせは generateStaticParams で除外しているが、念のため
  if (chains.length + indies.length === 0) notFound();

  // 該当店舗数（noindex 判定と同じロジック）。3件未満なら薄いコンテンツの旨を案内バナーで表示。
  const matchedCount = chains.length + indies.length;
  const isThinResult = matchedCount < 3;

  const wardName = WARD_NAMES[station.ward] ?? '';

  // 駅・エリア導入文（駅の実データから生成）と、該当店セットの集計インサイト。
  // 後者は駅×条件ごとに必ず異なるデータ由来サマリーで、filtered view の重複感を解消する。
  const stationIntro = buildStationIntro({
    stationName: station.name,
    wardName,
    lines: station.lines,
    scale: station.scale,
    familyFriendly: station.familyFriendly,
  });
  const insight = buildRestaurantInsight(chains, indies);
  const insightText = insightToSentence(insight, cond.label, '店');

  // 該当店の実データのみから組むページ固有FAQ（捏造ゼロ・該当0件の設問は出さない）。
  // 境界ページ（該当3件前後）に固有の実質コンテンツと AEO 用の明示的 Q&A を与える。
  const faqItems = buildRestaurantFaq(station.name, cond.label, chains, indies);
  const faqLd = faqToJsonLd(faqItems);

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

  // 同じ駅の他条件 — 該当3件以上のものに絞り、回遊価値の高い順（件数降順）で上位3件
  const otherConditions = STATION_CONDITIONS.filter((c) => c.slug !== conditionSlug)
    .map((c) => {
      const cn = filterChainsByCondition(data.chains, c.slug).length;
      const inn = filterIndiesByCondition(allIndies, c.slug).length;
      return { cond: c, count: cn + inn };
    })
    .filter((x) => x.count >= 3)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // 同じ条件で探せる近隣駅: 同区内優先、不足分は同region(=東京23区)から補完。
  // matchedCount>=3 のみを対象とし、回遊しても薄ページに送らない（404体験防止）。
  type NeighborCandidate = { station: typeof TOKYO_STATIONS[number]; count: number };
  const neighborSameCondition: NeighborCandidate[] = [];
  const seenSlugs = new Set<string>([station.slug]);

  const collectNeighbors = (filter: (s: typeof TOKYO_STATIONS[number]) => boolean) => {
    for (const s of TOKYO_STATIONS) {
      if (seenSlugs.has(s.slug)) continue;
      if (!filter(s)) continue;
      const sd = getStationWithChains(s.slug);
      const sc = sd?.chains ?? [];
      const si = getIndieRestaurantsByStation(s.slug);
      const cn = filterChainsByCondition(sc, conditionSlug).length;
      const inn = filterIndiesByCondition(si, conditionSlug).length;
      const cnt = cn + inn;
      if (cnt >= 3) {
        neighborSameCondition.push({ station: s, count: cnt });
        seenSlugs.add(s.slug);
      }
    }
  };
  // 1st: 同区
  collectNeighbors((s) => s.ward === station.ward);
  // 2nd fallback: 同region(東京23区) — 5件に満たない場合のみ
  if (neighborSameCondition.length < 5) {
    collectNeighbors((s) => s.ward !== station.ward);
  }
  // 件数の多い順で上位5
  neighborSameCondition.sort((a, b) => b.count - a.count);
  const topNeighbors = neighborSameCondition.slice(0, 5);

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
      <V2Frame header="sub" active="home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

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

            {/* 駅・エリア導入文（駅の実データ由来） */}
            <p
              className="station-intro"
              style={{
                fontSize: 14,
                color: 'var(--ink-sub)',
                lineHeight: 1.85,
                marginTop: 14,
                paddingLeft: 12,
                borderLeft: '3px solid rgba(201,96,62,0.30)',
              }}
            >
              {stationIntro}
            </p>

            {/* 集計インサイト（駅×条件ごとに固有のデータ由来サマリー） */}
            {insightText && (
              <div
                className="station-insight"
                style={{
                  marginTop: 16,
                  padding: '14px 16px',
                  background: 'var(--paper-card)',
                  border: '1px solid rgba(201,96,62,0.16)',
                  borderRadius: 10,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clay-deep)', marginBottom: 6 }}>
                  この条件のデータ
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--ink-sub)', lineHeight: 1.8, margin: 0 }}>
                  {insightText}
                </p>
                {insight.stats.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                    {insight.stats.map((s) => (
                      <span
                        key={s.label}
                        style={{
                          fontSize: 11.5,
                          background: 'rgba(201,96,62,0.08)',
                          color: 'var(--clay-deep)',
                          padding: '3px 9px',
                          borderRadius: 999,
                        }}
                      >
                        {s.label} {s.count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isThinResult && (
              <div
                role="status"
                style={{
                  marginTop: 16,
                  padding: '14px 16px',
                  background: 'var(--peach-soft)',
                  color: 'var(--clay)',
                  border: '1px solid rgba(201,96,62,0.20)',
                  borderRadius: 10,
                  fontSize: 13.5,
                  lineHeight: 1.7,
                }}
              >
                現在この条件で実訪問済み店舗は <strong>{matchedCount}件</strong>です。
                より多くの選択肢は
                <Link href={`/station/${slug}`} style={{ color: 'var(--clay-deep)', fontWeight: 600, margin: '0 2px' }}>
                  駅トップに戻る
                </Link>
                や
                <Link href={`/station/${slug}`} style={{ color: 'var(--clay-deep)', fontWeight: 600, margin: '0 2px' }}>
                  同じエリアの近隣駅一覧
                </Link>
                をご覧ください。
              </div>
            )}

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

          {/* 同じ条件で探せる近隣駅（カード形式・5件） */}
          {topNeighbors.length > 0 && (
            <section className="station-related" style={{
              marginTop: 36,
              paddingTop: 32,
              borderTop: '1px solid rgba(201,96,62,0.14)',
            }}>
              <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, marginBottom: 6 }}>
                同じ条件で探せる近隣駅
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 0, marginBottom: 14 }}>
                {wardName ? `${wardName}を中心に、` : ''}「{cond.label}」で店舗が3件以上ある駅をピックアップ。
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
              }}>
                {topNeighbors.map(({ station: s, count }) => {
                  const sameWard = s.ward === station.ward;
                  const sWardName = WARD_NAMES[s.ward] ?? '';
                  return (
                    <Link
                      key={s.slug}
                      href={`/station/${s.slug}/${conditionSlug}`}
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
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        gap: 8,
                        marginBottom: 6,
                      }}>
                        <strong style={{ fontSize: 15 }}>{s.name}駅</strong>
                        <span style={{
                          fontSize: 11,
                          background: 'rgba(201,96,62,0.10)',
                          color: 'var(--clay-deep)',
                          padding: '2px 8px',
                          borderRadius: 999,
                          whiteSpace: 'nowrap',
                        }}>{count}店</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-sub)', lineHeight: 1.5 }}>
                        {sWardName}{sameWard ? '（同区内）' : ''} · {cond.label}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* 子連れ外食お助けグッズ（restaurant 系条件は全て外食文脈なので常時表示） */}
          <section style={{
            marginTop: 36,
            paddingTop: 32,
            borderTop: '1px solid rgba(201,96,62,0.14)',
          }}>
            <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, marginBottom: 6 }}>
              子連れ外食を乗り切るお助けグッズ
            </h2>
            <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 0, marginBottom: 14 }}>
              ベビーチェアが無い店でも安心。持っていくと外食がぐっとラクになる定番。
            </p>
            <AffiliateLinkGroup
              items={getCatalogItems('gaishoku').slice(0, 3).map((it) => ({
                href: it.href,
                title: it.name,
                subtitle: it.subtitle,
                price: it.price,
                provider: it.provider,
                pr: false,
              }))}
            />
            {(() => {
              const bridge = getRestaurantBridgeOffer(conditionSlug, 'gaishoku', cond.label);
              return bridge ? (
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: 13, color: 'var(--ink-mute)', margin: '0 0 10px' }}>
                    外食が増える時期は、家の食事を宅配でラクにするご家庭も。
                  </p>
                  <AffiliateLink {...bridge} />
                </div>
              ) : null;
            })()}
          </section>

          {/* ページ固有FAQ（該当店の実データ由来。AEO＋FAQPage構造化用の可視コンテンツ） */}
          {faqItems.length > 0 && (
            <section className="station-faq" style={{
              marginTop: 36,
              paddingTop: 32,
              borderTop: '1px solid rgba(201,96,62,0.14)',
            }}>
              <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, marginBottom: 6 }}>
                {station.name}駅 {cond.label}のよくある質問
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 0, marginBottom: 14 }}>
                このページに掲載中の店舗データから回答しています。設備・メニューは変更される場合があるため、来店前に各店の最新情報もご確認ください。
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {faqItems.map((q, i) => (
                  <details
                    key={i}
                    className="faq-item"
                    style={{
                      background: 'var(--paper-card)',
                      border: '1px solid rgba(201,96,62,0.16)',
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}
                  >
                    <summary style={{
                      padding: '14px 16px',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}>
                      {q.question}
                    </summary>
                    <div style={{
                      padding: '0 16px 16px',
                      fontSize: 13.5,
                      color: 'var(--ink-sub)',
                      lineHeight: 1.85,
                    }}>
                      {q.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* 同じ駅で別の条件を試す（チップ形式・3件） */}
          {otherConditions.length > 0 && (
            <section className="station-other-conditions" style={{
              marginTop: 36,
              paddingTop: 32,
              borderTop: '1px solid rgba(201,96,62,0.14)',
            }}>
              <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, marginBottom: 6 }}>
                同じ駅で別の条件を試す
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 0, marginBottom: 14 }}>
                {station.name}駅周辺で店舗が3件以上ある条件から、回遊価値の高いものを抜粋。
              </p>
              <div className="chip-group" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {otherConditions.map(({ cond: oc, count }) => (
                  <Link
                    key={oc.slug}
                    href={`/station/${slug}/${oc.slug}`}
                    className="chip"
                    aria-label={`${station.name}駅 ${oc.label} ${count}店`}
                  >
                    {oc.label}
                    <span style={{
                      marginLeft: 6,
                      fontSize: 11,
                      color: 'var(--clay-deep)',
                      fontWeight: 600,
                    }}>{count}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 戻る（駅一覧/駅トップ/路線一覧へのリンク） */}
          <section style={{
            marginTop: 36,
            padding: '24px 0',
            textAlign: 'center',
            color: 'var(--ink-sub)',
            borderTop: '1px solid rgba(201,96,62,0.14)',
          }}>
            <p style={{ fontSize: 14, lineHeight: 2 }}>
              <Link href={`/station/${slug}`} style={{ color: 'var(--clay-deep)' }}>← {station.name}駅トップに戻る</Link>
              {' / '}
              <Link href="/station" style={{ color: 'var(--clay-deep)' }}>駅別ガイド一覧</Link>
              {' / '}
              <Link href="/station/line" style={{ color: 'var(--clay-deep)' }}>路線一覧</Link>
            </p>
          </section>
        </div>
      </section>

      </V2Frame>
    </>
  );
}
