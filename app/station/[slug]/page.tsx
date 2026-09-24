import '@/app/styles/station-v3.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { V2Frame } from '@/components/v2/V2Frame';
import { KkIcon } from '@/components/kk/KkIcon';
import { KkArt, type KkArtName } from '@/components/kk/KkArt';
import { KkInfoTable } from '@/components/kk/KkInfoTable';
import { KkLineCard } from '@/components/kk/KkLineCard';
import { KkAddToHomeCard } from '@/components/kk/KkAddToHomeCard';
import { KkFooter } from '@/components/kk/KkFooter';
import {
  findStationBySlug,
  getAllStations,
  getSameAreaStations,
  type AnyStation,
} from '@/lib/all-stations';
import {
  getStationWithChains,
  CHAIN_CATEGORY_LABEL,
  STATION_CHAIN_DATA_UPDATED,
  type Chain,
  type ChainCategory,
} from '@/lib/station-restaurants';
import {
  getIndieRestaurantsByStation,
  isHotpepperStation,
  HOTPEPPER_GENERATED_AT,
  INDIE_GENRE_LABEL,
  type IndieRestaurant,
  type IndieGenre,
} from '@/lib/indie-restaurants';
import { getStationOverride } from '@/lib/station-overrides';
import { getSpotsByNearestStation, SPOT_CATEGORY_LABEL } from '@/lib/spots';
import {
  STATION_CONDITIONS,
  filterChainsByCondition,
  filterIndiesByCondition,
  getConditionKind,
} from '@/lib/station-conditions';
import { getSpotsForStation, filterSpotsByCondition } from '@/lib/station-spots';
import { isStationConditionIndexable } from '@/lib/station-cond-index';
import { getAreaArticleLinks } from '@/lib/area-articles';
import { buildRestaurantFaq, faqToJsonLd } from '@/lib/station-faq';
import { StickySectionNav } from '@/components/station/StickySectionNav';
import { AdSlot } from '@/components/ads/AdSlot';
import { RelatedItemsCTA } from '@/components/article/RelatedItemsCTA';
import { getCatalogItems } from '@/lib/items-catalog';
import { PersonalizedHint } from '@/components/common/PersonalizedHint';
import { hotpepperShopHref } from '@/lib/reservation-cta';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24h

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * 全駅（東京23区 + 関西主要駅）分の静的パスを事前生成。
 */
export async function generateStaticParams() {
  return getAllStations().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const station = findStationBySlug(slug);
  if (!station) {
    return {
      title: '駅が見つかりません',
      robots: { index: false, follow: false },
    };
  }
  const wardName = station.regionLabel;
  // 検索語と面名のズレをGSCで個別に立証できた駅だけ、title/description を上書きする。
  // 詳細と運用ルールは lib/station-overrides.ts のコメントを参照。
  const seoOverride = getStationOverride(slug)?.seo;
  const title =
    seoOverride?.title ??
    `${station.name}駅 子連れランチおすすめ｜ベビーカーOK・キッズメニュー店ガイド【${wardName}】`;
  const description =
    seoOverride?.description ??
    `${station.name}駅周辺で子連れOK・ベビーカー入店OKのファミレス・カフェ・チェーン店に加え、${isHotpepperStation(slug) ? 'ホットペッパーで「お子様連れOK」と掲載された駅近のお店も掲載' : '雑誌やSNSで話題の個人店・人気店も厳選'}。キッズメニュー・キッズチェア・個室・離乳食持込可など子連れ目線で全項目チェック。${wardName}で子どもとランチ・カフェに困らない実用ガイド。`;
  // 2026-08-31: 全ページ監査で og:image 欠落 2,061本のうち 2,049本が /station/ だと判明した。
  // /station/ は3週で唯一プラス成長している面（+6.8%／週1,945クリック）なのに、
  // SNS・LINE共有とDiscoverで画像が出ない状態だった。spot/[slug] と同じ /api/og を配線する。
  const ogImage = `/api/og?title=${encodeURIComponent(`${station.name}駅 子連れランチ｜${wardName}`)}`;
  const ogImages = [{ url: ogImage, width: 1200, height: 630 }];

  return {
    title,
    description,
    alternates: { canonical: `/station/${slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://kyounoko.jp/station/${slug}`,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages.map((i) => i.url),
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
  const station = findStationBySlug(slug);
  if (!station) notFound();

  // 東京駅は STATION_CHAIN_MAPPING にチェーンが登録されている。
  // 関西駅は現状チェーン未登録のため、見つからない場合は空配列でフォールバック。
  const data = getStationWithChains(slug);
  const chains: Chain[] = data?.chains ?? [];

  // 個人店（チェーン以外の話題店・人気店）
  const indies = getIndieRestaurantsByStation(slug);
  // 駅ごとの例外的な上書き（見出し文言・一次情報メモ）。未登録の駅は undefined。
  const override = getStationOverride(slug);
  // 駅から徒歩15分以内のおでかけスポット（公園・水族館・屋内遊び場等）
  const nearbySpots = getSpotsByNearestStation(slug, { maxWalkMinutes: 15, limit: 8 });

  // 駅情報も個人店もない場合のみ 404（不正 slug 防止）。
  if (!data && indies.length === 0) notFound();

  // 個人店をジャンル別にグルーピング
  const indiesByGenre = new Map<IndieGenre, IndieRestaurant[]>();
  for (const r of indies) {
    if (!indiesByGenre.has(r.genre)) indiesByGenre.set(r.genre, []);
    indiesByGenre.get(r.genre)!.push(r);
  }

  const wardName = station.regionLabel;

  // カテゴリ別グルーピング
  const byCategory = new Map<ChainCategory, Chain[]>();
  for (const c of chains) {
    if (!byCategory.has(c.category)) byCategory.set(c.category, []);
    byCategory.get(c.category)!.push(c);
  }

  // 同じエリアの他駅（東京なら同区、関西なら同府/県）
  const sameWardStations = getSameAreaStations(station, 12);
  // 区・市ごとのエリア記事（室内遊び場・水遊び）。駅ページから内部リンクを集める（lib/area-articles.ts）
  const areaArticles = getAreaArticleLinks(wardName);

  // JSON-LD: ItemList で各チェーン+個人店を列挙
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
    name: `${station.name}駅 子連れランチ・ベビーカーOK店`,
    description: `${station.name}駅周辺の子連れ歓迎チェーン店・個人店リスト`,
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
    ],
  };

  // ページ固有FAQ（2026-08-31 追加）
  // 子ページ /station/[駅]/[条件] は100%がFAQPageと可視FAQを持っているのに、
  // 親の駅ページ587本だけが両方ゼロだった（28日で3,121クリック / 44,762表示の面）。
  // 既存の lib/station-faq.ts をそのまま使う。実データ由来で捏造ゼロという
  // 同ファイルの設計思想を引き継ぐため、生成ロジックは子と共通のまま変えていない。
  const faqItems = buildRestaurantFaq(station.name, '子連れランチ', chains, indies);
  const faqLd = faqToJsonLd(faqItems);

  // スティッキーセクションナビ用の項目
  const stickyNavItems = [
    { href: '#section-tldr', label: '30秒攻略' },
    { href: '#section-by-age', label: '年齢別' },
    { href: '#section-by-scene', label: 'シーン別' },
    ...(override?.hallFacilities ? [{ href: '#section-hall-facilities', label: '館の設備' }] : []),
    { href: '#section-tips', label: '使い方' },
    { href: '#section-chains', label: 'チェーン', count: chains.length },
    ...(indies.length > 0 ? [{ href: '#section-indies', label: isHotpepperStation(slug) ? '子連れOK店' : '個人店', count: indies.length }] : []),
    ...(nearbySpots.length > 0 ? [{ href: '#section-nearby-spots', label: '近隣スポット', count: nearbySpots.length }] : []),
  ];

  return (
    <>
      <V2Frame header="sub" active="home">
      <div className="station-v3">
      <StickySectionNav items={stickyNavItems} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      <nav className="stv3-crumb" aria-label="パンくず">
        <Link href="/">HOME</Link>
        <span className="sep">/</span>
        <Link href="/station">駅別ランチ</Link>
        <span className="sep">/</span>
        <span>{station.name}駅</span>
      </nav>

      <div className="stv3-main">
          <header className="stv3-head">
            <span className="stv3-eyebrow">{wardName} · {station.lines[0]}沿線</span>
            <h1 className="stv3-h1">
              {override?.hero?.h1 ?? `${station.name}駅 子連れランチおすすめ`}
              <small className="stv3-h1-sub">
                {override?.hero?.sub ?? 'ベビーカーOK・キッズメニュー・個室あり店ガイド'}
              </small>
            </h1>
            <p className="stv3-lead">
              {override?.hero?.lead ?? (
                <>
                  {station.name}駅から徒歩5〜10分圏内にある、子連れOKのファミレス・カフェ・チェーン店に加え、
                  {isHotpepperStation(slug) ? (
                    <>ホットペッパーグルメで「お子様連れOK」と掲載されている<strong>駅近のお店</strong>もご紹介。</>
                  ) : (
                    <>雑誌やSNSで話題の<strong>個人店・人気店</strong>も厳選してご紹介。</>
                  )}
                  ベビーカー入店可否、キッズメニュー、キッズチェア、個室、離乳食持込OKまで全項目チェックしました。
                  {wardName}で子連れランチ場所に迷ったらまずココから。
                </>
              )}
            </p>

            <div className="station-summary stv3-summary kk-chips">
              <span className="kk-chip">{station.lines.length}路線</span>
              <span className="kk-chip">チェーン{chains.length}店</span>
              {indies.length > 0 && <span className="kk-chip">{isHotpepperStation(slug) ? '駅近の子連れOK店' : '個人店'}{indies.length}店</span>}
              {station.scale === 'terminal' && <span className="kk-chip">ターミナル駅</span>}
              {station.scale === 'major' && <span className="kk-chip">主要駅</span>}
              {station.familyFriendly && <span className="kk-chip">ファミリー多め</span>}
            </div>

            <div className="stv3-lines">
              <strong>路線:</strong> {station.lines.join(' / ')}
            </div>

            {/* 地域ブラウズ → メイン機能「今日の流れ」への接続（おでかけ1日プラン） */}
            <Link href={`/today?station=${station.slug}`} className="kk-btn stv3-cta">
              <KkIcon name="today" size={17} color="#fff" />
              この駅で「今日の流れ」を作る（午前あそぶ→お昼→午後）
              <KkIcon name="arrow-right" size={16} color="#fff" />
            </Link>
          </header>

          {/* TL;DR — 各項目クリックで該当セクションへスムーズスクロール */}
          <section id="section-tldr" className="station-tldr stv3-sec ruled">
            <h2 className="stv3-h2">30秒でわかる｜{station.name}駅 子連れ攻略</h2>
            <p className="stv3-note">
              <KkIcon name="chevron-down" size={13} />
              気になる項目をタップすると該当セクションへ移動します
            </p>
            <ul className="stv3-jump">
              <li>
                <a href="#section-chains">
                  <span><strong>チェーン店</strong>: {chains.length}店（ファミレス・カフェ等）</span>
                  <KkIcon name="chevron-right" size={15} />
                </a>
              </li>
              {indies.length > 0 && (
                <li>
                  <a href="#section-indies">
                    <span><strong>{override?.indieLabels?.tldrLabel ?? (isHotpepperStation(slug) ? '駅近の子連れOK店' : '個人店・話題店')}</strong>: {indies.length}店（{override?.indieLabels?.tldrNote ?? (isHotpepperStation(slug) ? 'ホットペッパーでお子様連れOKと掲載' : '雑誌・SNS掲載・人気店')}）</span>
                    <KkIcon name="chevron-right" size={15} />
                  </a>
                </li>
              )}
              <li>
                <a href="#section-stroller">
                  <span><strong>ベビーカーで余裕入店できる店</strong>: {chains.filter(c => c.stroller === 'good').length + indies.filter(r => r.strollerOk).length}店</span>
                  <KkIcon name="chevron-right" size={15} />
                </a>
              </li>
              <li>
                <a href="#section-kidsmenu">
                  <span><strong>キッズメニューあり</strong>: {chains.filter(c => c.kidsMenu).length + indies.filter(r => r.kidsMenu).length}店</span>
                  <KkIcon name="chevron-right" size={15} />
                </a>
              </li>
              <li>
                <a href="#section-private">
                  <span><strong>個室・仕切り席あり</strong>: {chains.filter(c => c.privateRoom).length + indies.filter(r => r.privateRoom).length}店</span>
                  <KkIcon name="chevron-right" size={15} />
                </a>
              </li>
              <li>
                <a href="#section-babyfood">
                  <span><strong>離乳食持込OK</strong>: {chains.filter(c => c.babyFoodOk).length}店</span>
                  <KkIcon name="chevron-right" size={15} />
                </a>
              </li>
              <li>
                <a href="#section-budget">
                  <span><strong>ランチ800円以内</strong>: {chains.filter(c => c.lunchPrice === '〜800').length}店</span>
                  <KkIcon name="chevron-right" size={15} />
                </a>
              </li>
              {override?.tldrExtraItems?.map((extra) => (
                <li key={extra.href}>
                  <a href={extra.href}>
                    <span><strong>{extra.label}</strong>: {extra.value}</span>
                    <KkIcon name="chevron-right" size={15} />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* ===== 館別の設備（登録のある駅のみ）=====
              駅＝ひとつの商業施設ではない駅がある。ベビーカーの貸出や授乳室は
              「店」ではなく「館」の設備なので、館の名前で、館ごとに分けて出す。
              店の設備（IndieRestaurant の nursingRoom 等）と混ぜてはいけない。 */}
          {override?.hallFacilities && (
            <section id="section-hall-facilities" className="stv3-sec ruled">
              <header className="stv3-sechead">
                <span className="stv3-eyebrow">館の設備（店の設備ではありません）</span>
                <h2 className="stv3-h2">
                  {override.hallFacilities.heading}
                </h2>
                <p className="stv3-sublead">
                  {override.hallFacilities.lead}
                </p>
              </header>

              {override.hallFacilities.halls.map((hall) => (
                <div key={hall.hall} className="stv3-hall">
                  <h3 className="stv3-h3">{hall.hall}</h3>
                  {hall.note && <p className="stv3-note">{hall.note}</p>}
                  <KkInfoTable rows={hall.rows.map((row) => ({ label: row.label, value: row.value }))} />
                </div>
              ))}

              {override.hallFacilities.crossHallRules.length > 0 && (
                <div className="stv3-hall-rules">
                  <h3 className="stv3-h3 sm">館をまたぐときの注意</h3>
                  <ul className="stv3-bullets">
                    {override.hallFacilities.crossHallRules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="stv3-src">
                出典: {override.hallFacilities.source}
              </p>
            </section>
          )}

          {/* ===== パーソナライズ: 設定済みの子の年齢に応じたチェックポイント =====
              SSR 非依存（クライアントのみ）。未設定なら設定への軽い CTA のみ。 */}
          <PersonalizedHint context="station" contextLabel={`${station.name}駅`} fallback="cta" />

          {/* ===== サイトならでは: 年齢別おすすめ動線 =====
              0-1歳 / 2-3歳 / 4-6歳 で「この駅で迷ったらこれ」を3つずつデータから自動抽出 */}
          {(() => {
            // 0-1歳向け: ベビーカー◎ + キッズチェア + 離乳食持込OK の重み付け
            const babies = chains
              .map(c => ({ c, score: (c.stroller === 'good' ? 3 : c.stroller === 'ok' ? 1 : 0) + (c.babyChair ? 2 : 0) + (c.babyFoodOk ? 2 : 0) }))
              .filter(x => x.score >= 4)
              .sort((a, b) => b.score - a.score)
              .slice(0, 3)
              .map(x => x.c);
            // 2-3歳向け: キッズメニュー + キッズチェア + ファミリー価格帯
            const toddlers = chains
              .map(c => ({ c, score: (c.kidsMenu ? 3 : 0) + (c.babyChair ? 2 : 0) + (c.lunchPrice === '〜800' || c.lunchPrice === '〜1,500' ? 1 : 0) }))
              .filter(x => x.score >= 3)
              .sort((a, b) => b.score - a.score)
              .slice(0, 3)
              .map(x => x.c);
            // 4-6歳向け: キッズメニュー + 個室/座敷 + メニューバラエティ
            const kids = chains
              .map(c => ({ c, score: (c.kidsMenu ? 3 : 0) + (c.privateRoom ? 2 : 0) + (c.category === 'family-restaurant' || c.category === 'sushi' || c.category === 'yakiniku' ? 2 : 0) }))
              .filter(x => x.score >= 3)
              .sort((a, b) => b.score - a.score)
              .slice(0, 3)
              .map(x => x.c);
            if (babies.length === 0 && toddlers.length === 0 && kids.length === 0) return null;
            return (
              <section id="section-by-age" className="stv3-sec ruled">
                <header className="stv3-sechead">
                  <span className="stv3-eyebrow">子供の年齢で迷ったら</span>
                  <h2 className="stv3-h2">
                    年齢別おすすめ動線
                  </h2>
                  <p className="stv3-sublead">
                    {station.name}駅周辺の店から、子供の年齢に合うTOP3を自動抽出。「迷ったらここ」をすぐ決められます。
                  </p>
                </header>
                <div className="stv3-ages">
                  {([
                    { label: '0〜1歳と入れる店', sub: 'ベビーカー◎+ベビーチェア+離乳食持込', list: babies, art: 'age-0' as KkArtName },
                    { label: '2〜3歳と楽しむ店', sub: 'キッズメニュー+キッズチェア+ファミリー価格', list: toddlers, art: 'age-2' as KkArtName },
                    { label: '4〜6歳が満足する店', sub: 'キッズメニュー+個室+メニュー多彩', list: kids, art: 'age-4' as KkArtName },
                  ]).map((g) => g.list.length > 0 && (
                    <div key={g.label} className="stv3-age">
                      <div className="stv3-age-head">
                        <KkArt name={g.art} size={32} />
                        <div>
                          <div className="stv3-age-lab">{g.label}</div>
                          <div className="stv3-age-sub">{g.sub}</div>
                        </div>
                      </div>
                      <ul className="stv3-picks">
                        {g.list.map((c, i) => (
                          <li key={c.slug}>
                            <strong>{i + 1}. {c.name}</strong>
                            <span className="stv3-picks-price">ランチ {c.lunchPrice}円</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

          {/* ===== サイトならでは: シーン別おすすめピックアップ =====
              「赤ちゃん初めて」「ご褒美・お祝い」「雨の日」「サクッと800円」を実データから抽出 */}
          {(() => {
            const firstBaby = chains.filter(c => c.stroller === 'good' && c.babyChair && c.babyFoodOk).slice(0, 4);
            const treat = [
              ...chains.filter(c => c.privateRoom && (c.lunchPrice === '〜2,500' || c.lunchPrice === '〜4,000' || c.lunchPrice === '4,000〜')),
              ...indies.filter(r => r.privateRoom && (r.priceLunch === '〜3,500円' || r.priceLunch === '〜5,000円' || r.priceLunch === '5,000円〜')).map(r => ({ name: r.name, lunchPrice: (r.priceLunch ?? '').replace(/円$/, '').replace(/〜/, '〜'), _indie: true } as { name: string; lunchPrice: string; _indie?: boolean })),
            ].slice(0, 4);
            const rainy = chains.filter(c => c.category === 'mall-food' || c.category === 'family-restaurant' || c.category === 'cafe').filter(c => c.stroller !== 'limited').slice(0, 4);
            const cheap = chains.filter(c => c.lunchPrice === '〜800').slice(0, 4);
            const scenes = [
              { id: 'first-baby', label: '赤ちゃん初めての外食', icon: 'baby' as const, desc: 'ベビーカー◎+ベビーチェア+離乳食持込OK', list: firstBaby },
              { id: 'treat', label: '誕生日・ご褒美ランチ', icon: 'popular' as const, desc: '個室/仕切り席+少しグレード上の価格帯', list: treat },
              { id: 'rainy', label: '雨の日でも安心', icon: 'umbrella' as const, desc: '駅直結or屋内モール内+ベビーカー対応', list: rainy },
              { id: 'cheap', label: 'サクッと800円以内', icon: 'yen' as const, desc: '財布に優しい子連れランチ定番', list: cheap },
            ].filter(s => s.list.length > 0);
            if (scenes.length === 0) return null;
            return (
              <section id="section-by-scene" className="stv3-sec ruled">
                <header className="stv3-sechead">
                  <span className="stv3-eyebrow">こんな日に行くなら</span>
                  <h2 className="stv3-h2">
                    シーン別ピックアップ
                  </h2>
                  <p className="stv3-sublead">
                    {station.name}駅で「初めての外食」「ご褒美」「雨の日」など、シーンごとに最適な店を厳選しました。
                  </p>
                </header>
                <div className="stv3-groups">
                  {scenes.map((s) => (
                    <div key={s.id} className="stv3-group">
                      <div className="stv3-group-head">
                        <KkIcon name={s.icon} size={22} />
                        <span className="stv3-group-lab">{s.label}</span>
                      </div>
                      <p className="stv3-group-desc">{s.desc}</p>
                      <ul className="stv3-group-list">
                        {s.list.map((c, i) => (
                          <li key={i}>
                            <strong>{c.name}</strong>
                            <span className="meta">{c.lunchPrice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

          {/* ===== 駅ごとの一次情報メモ =====
              公式サイトの生HTMLで確認できた事実だけを載せる。登録のある駅のみ表示。 */}
          {override?.facilityNote && (
            <section id="section-facility-note" className="stv3-sec ruled">
              <h2 className="stv3-h2">
                {override.facilityNote.heading}
              </h2>
              <ul className="stv3-bullets">
                {override.facilityNote.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="stv3-src">
                出典: {override.facilityNote.source}
              </p>
            </section>
          )}

          {/* ===== サイトならでは: 駅の使い方Tips ===== */}
          <section id="section-tips" className="stv3-sec ruled">
            <h2 className="stv3-h2">
              {station.name}駅 子連れランチの使い方Tips
            </h2>
            <ul className="stv3-bullets">
              <li><strong>{station.scale === 'terminal' ? 'ターミナル駅は' : station.scale === 'major' ? '主要駅は' : 'この駅は'}</strong>
                {station.scale === 'terminal' ? '休日12時前後・平日18時以降が混雑のピーク。子連れなら開店直後（11時台）or 14時台が狙い目。' : station.scale === 'major' ? '平日昼下がり（14-16時）が空いていてベビーカーで動きやすい時間帯。' : '比較的空いていて、平日も週末もベビーカーで余裕を持って入れる店が多め。'}
              </li>
              {station.lines.length >= 4 && (
                <li><strong>路線が{station.lines.length}本</strong>通っているので、別エリアからの合流に便利。途中下車ランチのハブにも◎。</li>
              )}
              <li><strong>事前予約</strong>: 個室・座敷ありの店は週末は2-3日前までに電話予約が無難。「子連れ」「ベビーカー」「ベビーチェア」を伝えると席を配慮してもらえます。</li>
              <li><strong>離乳食持込</strong>: 上記でOKの店は事前一声かけがマナー。「持込OK」表記でも、混雑時間は遠慮するのが角が立たない使い方。</li>
              {station.familyFriendly && <li><strong>{wardName}は</strong>もともとファミリー比率が高いエリア。日曜午前は特に子連れが多く、お互いさま感があって過ごしやすい。</li>}
              <li><strong>ベビーカー動線</strong>: 駅から徒歩5分以内のチェーン店なら、駅構内のエレベーター→改札→歩道のエレベーター動線が確保されているケースが多い。事前にGoogle Mapsストリートビューで確認すると安心。</li>
            </ul>
          </section>

          {/* ===== 条件別フィルタービュー（TL;DRからのジャンプ先） =====
              ベビーカー◎ / キッズメニュー / 個室 / 離乳食持込 / 800円以内 のフィルタ */}
          {(() => {
            const filters = [
              {
                id: 'section-stroller',
                label: 'ベビーカーで余裕入店できる店',
                icon: 'stroller' as const,
                desc: 'ベビーカーのまま余裕を持って入れる店。狭い通路で気を遣うストレスなし',
                items: [
                  ...chains.filter(c => c.stroller === 'good').map(c => ({ name: c.name, price: `${c.lunchPrice}円`, type: 'チェーン' })),
                  ...indies.filter(r => r.strollerOk).map(r => ({ name: r.name, price: r.priceLunch ?? '', type: '個人店' })),
                ],
              },
              {
                id: 'section-kidsmenu',
                label: 'キッズメニューあり',
                icon: 'kids-menu' as const,
                desc: 'お子様メニューがある店。取り分け不要で偏食気味の子も安心',
                items: [
                  ...chains.filter(c => c.kidsMenu).map(c => ({ name: c.name, price: `${c.lunchPrice}円`, type: 'チェーン' })),
                  ...indies.filter(r => r.kidsMenu).map(r => ({ name: r.name, price: r.priceLunch ?? '', type: '個人店' })),
                ],
              },
              {
                id: 'section-private',
                label: '個室・仕切り席あり',
                icon: 'rest-space' as const,
                desc: '個室・座敷・半個室で気兼ねなく食事できる店',
                items: [
                  ...chains.filter(c => c.privateRoom).map(c => ({ name: c.name, price: `${c.lunchPrice}円`, type: 'チェーン' })),
                  ...indies.filter(r => r.privateRoom).map(r => ({ name: r.name, price: r.priceLunch ?? '', type: '個人店' })),
                ],
              },
              {
                id: 'section-babyfood',
                label: '離乳食持込OK',
                icon: 'babyfood' as const,
                desc: '離乳食を持ち込める店。ベビーフード派にも自宅冷凍派にも',
                items: chains.filter(c => c.babyFoodOk).map(c => ({ name: c.name, price: `${c.lunchPrice}円`, type: 'チェーン' })),
              },
              {
                id: 'section-budget',
                label: 'ランチ800円以内',
                icon: 'yen' as const,
                desc: '財布に優しい子連れランチ定番',
                items: chains.filter(c => c.lunchPrice === '〜800').map(c => ({ name: c.name, price: `${c.lunchPrice}円`, type: 'チェーン' })),
              },
            ].filter(f => f.items.length > 0);

            if (filters.length === 0) return null;
            return (
              <section className="stv3-sec ruled">
                <header className="stv3-sechead">
                  <span className="stv3-eyebrow">条件で絞り込み</span>
                  <h2 className="stv3-h2">
                    こだわり条件別の店一覧
                  </h2>
                </header>
                <div className="stv3-groups">
                  {filters.map((f) => (
                    <div key={f.id} id={f.id} className="stv3-group">
                      <div className="stv3-group-head">
                        <KkIcon name={f.icon} size={22} />
                        <span className="stv3-group-lab">{f.label}</span>
                        <span className="stv3-count">{f.items.length}店</span>
                      </div>
                      <p className="stv3-group-desc">{f.desc}</p>
                      <ul className="stv3-group-list">
                        {f.items.slice(0, 12).map((item, i) => (
                          <li key={i}>
                            <strong>{item.name}</strong>
                            <span className="meta">{item.type} / {item.price}</span>
                          </li>
                        ))}
                        {f.items.length > 12 && (
                          <li className="more">
                            …ほか {f.items.length - 12}店
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

          {/* チェーン店リスト（カテゴリ別） — anchor target */}
          <div id="section-chains" className="stv3-anchor" />
          {Array.from(byCategory.entries()).map(([cat, list]) => (
            <section key={cat} className="station-category stv3-sec ruled">
              <h2 className="stv3-h2">
                {CHAIN_CATEGORY_LABEL[cat]} <span className="stv3-count">{list.length}店</span>
              </h2>
              <div className="station-chains stv3-shops">
                {list.map((c) => (
                  <article key={c.slug} className="station-chain-card stv3-shop">
                    <header className="stv3-shop-head">
                      <h3 className="stv3-h3">{c.name}</h3>
                      <span className="stv3-shop-price">ランチ {c.lunchPrice}円</span>
                    </header>
                    <p className="stv3-shop-desc">
                      {c.description}
                    </p>
                    <div className="station-chain-meta kk-chips">
                      <span title={STROLLER_DESC[c.stroller]} className={'kk-pill ' + (c.stroller === 'good' ? 'yes' : 'text')}>
                        ベビーカー {STROLLER_LABEL[c.stroller]}
                      </span>
                      {c.kidsMenu && <span className="kk-chip">キッズメニュー</span>}
                      {c.babyChair && <span className="kk-chip">キッズチェア</span>}
                      {c.privateRoom && <span className="kk-chip">個室あり</span>}
                      {c.babyFoodOk && <span className="kk-chip">離乳食持込OK</span>}
                      {c.stepFree && <span className="kk-chip">段差なし</span>}
                      {c.seatingType?.includes('zashiki') && <span className="kk-chip">座敷あり</span>}
                      {c.diaperChangingTable && <span className="kk-chip">おむつ替え台</span>}
                      {c.nursingRoom && <span className="kk-chip">授乳室</span>}
                      {c.shareDish && <span className="kk-chip">取り分けOK</span>}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}

          {/* 個人店・話題店セクション — anchor target */}
          {indies.length > 0 && (
            <section id="section-indies" className="station-indies stv3-sec ruled">
              <header className="stv3-sechead">
                <span className="stv3-eyebrow">
                  {override?.indieLabels?.eyebrow ?? (isHotpepperStation(slug) ? 'ホットペッパー掲載・お子様連れOK' : 'チェーンじゃない、ローカルの実力店')}
                </span>
                <h2 className="stv3-h2">
                  {override?.indieLabels?.heading ?? (isHotpepperStation(slug) ? `${station.name}駅近くの子連れOKのお店` : `${station.name}駅の個人店・話題店`)} <span className="stv3-count">{indies.length}店</span>
                </h2>
                <p className="stv3-sublead">
                  {override?.indieLabels?.lead ?? (isHotpepperStation(slug) ? (
                    <>
                      ホットペッパーグルメの店舗情報で「お子様連れOK・歓迎」かつランチ営業ありと掲載されている、{station.name}駅から近いお店です（上の一覧にあるファミレス等のチェーンと、周辺に複数店舗ある店は除いています）。
                      店名・アクセス・個室の有無は各店の掲載情報をそのまま載せています。
                    </>
                  ) : (
                    <>
                      雑誌・TV・SNSで取り上げられた{station.name}エリアの実力店から、子連れで利用しやすい店舗を厳選。
                      チェーン店だけでなく、ご当地ならではの一軒で家族の食事をワンランク豊かに。
                    </>
                  ))}
                  <small className="stv3-lead-note">
                    {isHotpepperStation(slug)
                      ? `※ ホットペッパーグルメの店舗掲載情報（${HOTPEPPER_GENERATED_AT}取得）。ベビーカーでの入店可否やキッズメニューは掲載がないため、店舗へ事前確認をおすすめします。`
                      : '※ 設備情報は公式・取材情報ベース。お子様連れ利用は店舗への事前確認をおすすめします。'}
                  </small>
                </p>
              </header>

              {Array.from(indiesByGenre.entries()).map(([genre, list]) => (
                <section key={genre} className="stv3-sec">
                  <h3 className="stv3-h3">
                    {INDIE_GENRE_LABEL[genre]} <span className="stv3-count">{list.length}店</span>
                  </h3>
                  <div className="stv3-shops">
                    {list.map((r, idx) => (
                      <article key={`${genre}-${idx}-${r.name}`} className="stv3-shop">
                        <header className="stv3-shop-head">
                          <h4 className="stv3-h4">
                            {r.name}
                            {r.popular && <span className="kk-pill text stv3-badge">話題店</span>}
                          </h4>
                          {r.priceLunch && <span className="stv3-shop-price">ランチ {r.priceLunch}</span>}
                        </header>
                        <div className="stv3-shop-area">{r.area}</div>
                        <p className="stv3-shop-desc">
                          {r.description}
                        </p>
                        <div className="kk-chips">
                          {r.childNote && <span className="kk-chip">{r.childNote}</span>}
                          {r.strollerOk && <span className="kk-chip">ベビーカー◎</span>}
                          {r.kidsMenu && <span className="kk-chip">キッズメニュー</span>}
                          {r.privateRoom && <span className="kk-chip">{r.source === 'hotpepper' ? '個室あり' : '個室・座敷'}</span>}
                          {r.barrierFree && <span className="kk-chip">バリアフリー</span>}
                          {!r.childNote && !r.strollerOk && !r.kidsMenu && !r.privateRoom && (
                            <span className="stv3-shop-note">※ 子連れ利用は要事前確認</span>
                          )}
                        </div>
                        {r.childComment && <p className="stv3-shop-note">お店より（子連れについて）: {r.childComment}</p>}
                        {r.source === 'hotpepper' && r.url && (() => {
                          const { href, affiliate } = hotpepperShopHref(r.url);
                          return (
                            <p className="stv3-shop-link">
                              <a
                                href={href}
                                target="_blank"
                                rel={affiliate ? 'sponsored noopener' : 'nofollow noopener'}
                              >
                                ホットペッパーで店舗情報・予約を見る →
                              </a>
                            </p>
                          );
                        })()}
                      </article>
                    ))}
                  </div>
                </section>
              ))}
              {isHotpepperStation(slug) && (
                <p className="stv3-credit">
                  <a href="http://webservice.recruit.co.jp/" target="_blank" rel="nofollow noopener">
                    Powered by ホットペッパーグルメ Webサービス
                  </a>
                </p>
              )}
            </section>
          )}

          {/* 条件で絞り込む */}
          {(() => {
            // 条件別ページ（/station/[slug]/[condition]）は現状チェーン中心で
            // 東京駅のみに対応。関西駅の場合はリンク先が 404 になるためセクションごと非表示。
            if (station.region !== 'tokyo') return null;
            const { all: spotsAll } = getSpotsForStation(slug);
            const conditionLinks = STATION_CONDITIONS.map((c) => {
              const k = getConditionKind(c.slug);
              const count =
                k === 'restaurant'
                  ? filterChainsByCondition(chains, c.slug).length +
                    filterIndiesByCondition(indies, c.slug).length
                  : filterSpotsByCondition(spotsAll, c.slug).length;
              return { cond: c, count, kind: k };
              // 404化した noindex combo（spot系全部＋需要なしminor駅）へリンクしない
            }).filter((x) => isStationConditionIndexable(slug, x.cond.slug, x.count, x.kind, station.scale));
            if (conditionLinks.length === 0) return null;
            return (
              <section className="station-conditions-cta stv3-sec ruled">
                <h2 className="stv3-h2">
                  {station.name}駅をもっと条件で絞る
                </h2>
                <p className="stv3-sublead">
                  雨の日・個室・赤ちゃん連れなど、シーン別の絞り込みページもあります。
                </p>
                <div className="stv3-rows two">
                  {conditionLinks.map(({ cond: oc, count, kind }) => (
                    <Link key={oc.slug} href={`/station/${slug}/${oc.slug}`} className="stv3-row">
                      <span className="stv3-row-body">
                        <span className="stv3-row-title">{oc.label}</span>
                        <span className="stv3-row-sub">{oc.tagline}</span>
                      </span>
                      <span className="stv3-row-meta">
                        {count}{kind === 'spot' ? '件' : '店'}
                        <KkIcon name="chevron-right" size={15} />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })()}

          {/* 近隣のおでかけスポット（公園・水族館・屋内遊び場等）
              駅 × おでかけ施設の橋渡し。徒歩15分以内に絞って表示。 */}
          {nearbySpots.length > 0 && (
            <section id="section-nearby-spots" className="stv3-sec ruled">
              <h2 className="stv3-h2">
                {station.name}駅から徒歩で行けるおでかけスポット
              </h2>
              <p className="stv3-sublead">
                公園・水族館・屋内遊び場など、{station.name}駅から徒歩15分以内の子連れ向けスポット {nearbySpots.length} 件。
                ランチ後の遊び場探しに。
              </p>
              <div className="stv3-rows two">
                {nearbySpots.map((s) => (
                  <div key={s.name} className="stv3-row">
                    <div className="stv3-row-body">
                      <strong className="stv3-row-title" dangerouslySetInnerHTML={{ __html: s.name }} />
                      <div className="stv3-row-sub">
                        {SPOT_CATEGORY_LABEL[s.category]}
                        {s.budget && ` · ${s.budget === 'free' ? '無料' : s.budget === 'low' ? '〜500円' : s.budget === 'mid' ? '〜2,000円' : '2,000円〜'}`}
                        {s.waterPlay && ' · 水遊びOK'}
                        {s.summerCool && ' · 涼しい屋内'}
                      </div>
                      {s.note && <p className="stv3-row-text">{s.note}</p>}
                      {s.hiddenTip && (
                        <p className="stv3-row-tip">
                          <KkIcon name="info" size={15} />
                          <span>{s.hiddenTip}</span>
                        </p>
                      )}
                    </div>
                    {typeof s.walkMinutes === 'number' && (
                      <span className="kk-pill text stv3-row-walk">
                        徒歩{s.walkMinutes}分
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 区・市のエリア記事（室内遊び場・水遊び）。ランチ以外の「今日どこ行く」を同じ区で完結させる */}
          {areaArticles.length > 0 && (
            <section className="station-related stv3-sec ruled">
              <header className="stv3-sechead">
                <span className="stv3-eyebrow">AREA GUIDE · {wardName}のおでかけ</span>
                <h2 className="stv3-h2">{wardName}で子どもと遊ぶなら</h2>
                <p className="stv3-sublead">ランチの前後に使える、{wardName}の遊び場を公式情報で確認してまとめた記事です。</p>
              </header>
              <div className="stv3-stations">
                {areaArticles.map((a) => (
                  <Link key={a.href} href={a.href} className="stv3-station" title={a.title}>
                    <span className="stv3-station-name">{wardName}の{a.label}</span>
                    <span className="stv3-station-scale">記事</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 同じ区の他駅 — scaleバッジ付きカード化で視覚的に強化 */}
          {sameWardStations.length > 0 && (
            <section className="station-related stv3-sec ruled">
              <header className="stv3-sechead">
                <span className="stv3-eyebrow">{station.region === 'tokyo' ? 'SAME WARD · 区内の他駅' : 'SAME AREA · エリア内の他駅'}</span>
                <h2 className="stv3-h2">{wardName}の他の駅もチェック</h2>
                <p className="stv3-sublead">同じ{wardName}内の他駅も子連れランチのカバー範囲。お住まいや勤務先に近い駅で見つけてみてください。</p>
              </header>
              <div className="stv3-stations">
                {sameWardStations.map((s) => {
                  const scaleLabel = s.scale === 'terminal' ? 'ターミナル' : s.scale === 'major' ? '主要駅' : '駅';
                  return (
                    <Link key={s.slug} href={`/station/${s.slug}`} className="stv3-station">
                      <span className="stv3-station-name">{s.name}駅</span>
                      <span className="stv3-station-scale">{scaleLabel}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* ページ固有FAQ（該当店の実データ由来。AEO＋FAQPage構造化用の可視コンテンツ） */}
          {faqItems.length > 0 && (
            <section className="station-faq stv3-sec ruled">
              <h2 className="stv3-h2">
                {station.name}駅の子連れランチ よくある質問
              </h2>
              <p className="stv3-sublead stv3-faq-lead">
                このページに掲載中の店舗データから回答しています。設備・メニューは変更される場合があるため、来店前に各店の最新情報もご確認ください。
              </p>
              <div className="stv3-faqs">
                {faqItems.map((q, i) => (
                  <details key={i} className="faq-item stv3-faq">
                    <summary className="stv3-faq-q">
                      <span>{q.question}</span>
                      <span className="stv3-faq-chev">
                        <KkIcon name="chevron-down" size={16} />
                      </span>
                    </summary>
                    <div className="stv3-faq-a">
                      {q.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* この情報について（GEO: AI検索の引用資格に必要な鮮度・確認方法の明示。
              ⚠️ 正直表記が原則 — チェーンの設備は公式ベースの編集部DBだが、
              駅周辺の店舗の有無は編集部キュレーションで個店の実在保証はしていない。
              「全店舗を確認済み」と読める表現にしないこと。 */}
          <section className="stv3-about">
            <p className="stv3-about-lab">この情報について</p>
            <p>
              掲載しているチェーン店の子連れ設備（ベビーカー・キッズメニュー・離乳食持ち込みなど）は、各チェーンの公式サイト・公式発表をもとに編集部がまとめたデータベースに基づいています（データ最終更新: {STATION_CHAIN_DATA_UPDATED}）。設備・メニューは店舗により異なる場合があります。駅周辺の店舗の有無・営業時間は変わることがあるため、来店前に各チェーンの公式店舗検索でご確認ください。
            </p>
          </section>

          {/* 駅ページ＝「この駅で子連れで入れる店」を探している文脈。
              ⚠️ 2026-08-31 修正: ここは以前 getItemsForTodayQuery({ place: 'outside' }) を使い、
              全駅で同じベビーカー3機種（ラクーナ／スゴカル／リベル）の楽天検索に着地していた。
              駅ページの検索意図は店探しであってベビーカーの機種比較ではないため、
              親256ページ・28日で44,763表示・3,121クリックに対して**成果0クリック**だった。
              一方、子ページ /station/[駅]/[条件] は getCatalogItems('gaishoku') の食事グッズに
              着地しており、8月に成果が出たのは /station/nakano/baby（こちら側）。
              よって子ページと同じ商材に揃える。AdSense枠には一切触れていない
              （枠の増減・移動をすると Anchor の視認可能率が落ちて収益の40%が痛む）。 */}
          {(() => {
            const outingItems = getCatalogItems('gaishoku').slice(0, 3);
            return outingItems.length > 0 ? (
              <RelatedItemsCTA
                label="外食のときに持っていくとラクなもの"
                items={outingItems.map((it) => ({
                  href: it.href,
                  title: it.name,
                  subtitle: it.subtitle,
                  price: it.price,
                  provider: it.provider,
                  pr: false,
                }))}
              />
            ) : null;
          })()}

          {/* AdSense: 駅ページ末尾の関連コンテンツ風広告 */}
          <AdSlot placement="article-related" style={{ marginTop: 32 }} />

          {/* 戻る・他のエリア */}
          <section className="stv3-back">
            <p>
              他の駅・エリアを見る → <Link href="/station">駅別ガイド一覧</Link>
            </p>
          </section>
      </div>

      {/* 回遊・再訪モジュール（リニューアル2026-09） */}
      <KkLineCard placement="station" />
      <KkAddToHomeCard placement="station" />
      <KkFooter />
      </div>

      </V2Frame>
    </>
  );
}
