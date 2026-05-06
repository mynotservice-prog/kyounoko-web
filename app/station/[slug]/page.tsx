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
import {
  getIndieRestaurantsByStation,
  INDIE_GENRE_LABEL,
  type IndieRestaurant,
  type IndieGenre,
} from '@/lib/indie-restaurants';
import {
  STATION_CONDITIONS,
  filterChainsByCondition,
  filterIndiesByCondition,
} from '@/lib/station-conditions';
import { StickySectionNav } from '@/components/station/StickySectionNav';

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
  const description = `${station.name}駅周辺で子連れOK・ベビーカー入店OKのファミレス・カフェ・チェーン店に加え、雑誌やSNSで話題の個人店・人気店も厳選。キッズメニュー・キッズチェア・個室・離乳食持込可など子連れ目線で全項目チェック。${wardName}で子どもとランチ・カフェに困らない実用ガイド。`;
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

  // 個人店（チェーン以外の話題店・人気店）
  const indies = getIndieRestaurantsByStation(slug);

  // 個人店をジャンル別にグルーピング
  const indiesByGenre = new Map<IndieGenre, IndieRestaurant[]>();
  for (const r of indies) {
    if (!indiesByGenre.has(r.genre)) indiesByGenre.set(r.genre, []);
    indiesByGenre.get(r.genre)!.push(r);
  }

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

  // スティッキーセクションナビ用の項目
  const stickyNavItems = [
    { href: '#section-tldr', label: '30秒攻略' },
    { href: '#section-by-age', label: '年齢別' },
    { href: '#section-by-scene', label: 'シーン別' },
    { href: '#section-tips', label: '使い方' },
    { href: '#section-chains', label: 'チェーン', count: chains.length },
    ...(indies.length > 0 ? [{ href: '#section-indies', label: '個人店', count: indies.length }] : []),
  ];

  return (
    <>
      <SiteHeader />
      <StickySectionNav items={stickyNavItems} />
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
              {station.name}駅から徒歩5〜10分圏内にある、子連れOKのファミレス・カフェ・チェーン店に加え、
              雑誌やSNSで話題の<strong>個人店・人気店</strong>も厳選してご紹介。
              ベビーカー入店可否、キッズメニュー、キッズチェア、個室、離乳食持込OKまで全項目チェックしました。
              {wardName}で子連れランチ場所に迷ったらまずココから。
            </p>

            <div className="station-summary" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
              <span className="meta-chip clay">{station.lines.length}路線</span>
              <span className="meta-chip clay">チェーン{chains.length}店</span>
              {indies.length > 0 && <span className="meta-chip clay">個人店{indies.length}店</span>}
              {station.scale === 'terminal' && <span className="meta-chip clay">ターミナル駅</span>}
              {station.scale === 'major' && <span className="meta-chip clay">主要駅</span>}
              {station.familyFriendly && <span className="meta-chip clay">ファミリー多め</span>}
            </div>

            <div style={{ marginTop: 18, fontSize: 13, color: 'var(--ink-sub)' }}>
              <strong>路線:</strong> {station.lines.join(' / ')}
            </div>
          </header>

          {/* TL;DR — 各項目クリックで該当セクションへスムーズスクロール */}
          <section id="section-tldr" className="station-tldr" style={{
            background: 'rgba(201,96,62,0.06)',
            padding: '20px 24px',
            borderRadius: 16,
            margin: '32px 0',
          }}>
            <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, marginBottom: 12 }}>30秒でわかる｜{station.name}駅 子連れ攻略</h2>
            <p style={{ fontSize: 11, color: 'var(--ink-mute)', margin: '0 0 10px' }}>
              ↓ 気になる項目をタップすると該当セクションへ移動します
            </p>
            <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.9 }}>
              <li>
                <a href="#section-chains" style={{ color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px dotted var(--clay-deep)' }}>
                  <strong>チェーン店</strong>: {chains.length}店（ファミレス・カフェ等）
                </a>
              </li>
              {indies.length > 0 && (
                <li>
                  <a href="#section-indies" style={{ color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px dotted var(--clay-deep)' }}>
                    <strong>個人店・話題店</strong>: {indies.length}店（雑誌・SNS掲載・人気店）
                  </a>
                </li>
              )}
              <li>
                <a href="#section-stroller" style={{ color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px dotted var(--clay-deep)' }}>
                  <strong>ベビーカーで余裕入店できる店</strong>: {chains.filter(c => c.stroller === 'good').length + indies.filter(r => r.strollerOk).length}店
                </a>
              </li>
              <li>
                <a href="#section-kidsmenu" style={{ color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px dotted var(--clay-deep)' }}>
                  <strong>キッズメニューあり</strong>: {chains.filter(c => c.kidsMenu).length + indies.filter(r => r.kidsMenu).length}店
                </a>
              </li>
              <li>
                <a href="#section-private" style={{ color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px dotted var(--clay-deep)' }}>
                  <strong>個室・仕切り席あり</strong>: {chains.filter(c => c.privateRoom).length + indies.filter(r => r.privateRoom).length}店
                </a>
              </li>
              <li>
                <a href="#section-babyfood" style={{ color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px dotted var(--clay-deep)' }}>
                  <strong>離乳食持込OK</strong>: {chains.filter(c => c.babyFoodOk).length}店
                </a>
              </li>
              <li>
                <a href="#section-budget" style={{ color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px dotted var(--clay-deep)' }}>
                  <strong>ランチ800円以内</strong>: {chains.filter(c => c.lunchPrice === '〜800').length}店
                </a>
              </li>
            </ul>
          </section>

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
              <section id="section-by-age" style={{ margin: '40px 0' }}>
                <header style={{ marginBottom: 16 }}>
                  <span className="eyebrow" style={{ color: 'var(--clay-deep)' }}>子供の年齢で迷ったら</span>
                  <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 22, marginTop: 4, marginBottom: 6 }}>
                    年齢別おすすめ動線
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--ink-sub)', margin: 0 }}>
                    {station.name}駅周辺の店から、子供の年齢に合うTOP3を自動抽出。「迷ったらここ」をすぐ決められます。
                  </p>
                </header>
                <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                  {[
                    { label: '0〜1歳と入れる店', sub: 'ベビーカー◎+ベビーチェア+離乳食持込', list: babies, color: '#7B1FA2' },
                    { label: '2〜3歳と楽しむ店', sub: 'キッズメニュー+キッズチェア+ファミリー価格', list: toddlers, color: '#1565C0' },
                    { label: '4〜6歳が満足する店', sub: 'キッズメニュー+個室+メニュー多彩', list: kids, color: '#E65100' },
                  ].map((g) => g.list.length > 0 && (
                    <div key={g.label} style={{
                      background: 'var(--paper-card)',
                      border: '1px solid rgba(201,96,62,0.16)',
                      borderRadius: 12,
                      padding: '14px 16px',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: g.color, marginBottom: 2 }}>{g.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginBottom: 10 }}>{g.sub}</div>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {g.list.map((c, i) => (
                          <li key={c.slug} style={{
                            padding: '6px 0',
                            borderTop: i === 0 ? 'none' : '1px solid rgba(201,96,62,0.10)',
                            fontSize: 14,
                          }}>
                            <strong>{i + 1}. {c.name}</strong>
                            <span style={{ fontSize: 11, color: 'var(--ink-mute)', marginLeft: 6 }}>ランチ {c.lunchPrice}円</span>
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
              ...indies.filter(r => r.privateRoom && (r.priceLunch === '〜3,500円' || r.priceLunch === '〜5,000円' || r.priceLunch === '5,000円〜')).map(r => ({ name: r.name, lunchPrice: r.priceLunch.replace(/円$/, '').replace(/〜/, '〜'), _indie: true } as { name: string; lunchPrice: string; _indie?: boolean })),
            ].slice(0, 4);
            const rainy = chains.filter(c => c.category === 'mall-food' || c.category === 'family-restaurant' || c.category === 'cafe').filter(c => c.stroller !== 'limited').slice(0, 4);
            const cheap = chains.filter(c => c.lunchPrice === '〜800').slice(0, 4);
            const scenes = [
              { id: 'first-baby', label: '赤ちゃん初めての外食', emoji: '👶', desc: 'ベビーカー◎+ベビーチェア+離乳食持込OK', list: firstBaby },
              { id: 'treat', label: '誕生日・ご褒美ランチ', emoji: '🎉', desc: '個室/仕切り席+少しグレード上の価格帯', list: treat },
              { id: 'rainy', label: '雨の日でも安心', emoji: '☔', desc: '駅直結or屋内モール内+ベビーカー対応', list: rainy },
              { id: 'cheap', label: 'サクッと800円以内', emoji: '💴', desc: '財布に優しい子連れランチ定番', list: cheap },
            ].filter(s => s.list.length > 0);
            if (scenes.length === 0) return null;
            return (
              <section id="section-by-scene" style={{ margin: '40px 0' }}>
                <header style={{ marginBottom: 16 }}>
                  <span className="eyebrow" style={{ color: 'var(--clay-deep)' }}>こんな日に行くなら</span>
                  <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 22, marginTop: 4, marginBottom: 6 }}>
                    シーン別ピックアップ
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--ink-sub)', margin: 0 }}>
                    {station.name}駅で「初めての外食」「ご褒美」「雨の日」など、シーンごとに最適な店を厳選しました。
                  </p>
                </header>
                <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                  {scenes.map((s) => (
                    <div key={s.id} style={{
                      background: '#fffaf6',
                      border: '1px solid rgba(201,96,62,0.20)',
                      borderRadius: 12,
                      padding: '14px 16px',
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                        <span style={{ marginRight: 6 }}>{s.emoji}</span>{s.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginBottom: 10 }}>{s.desc}</div>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 13 }}>
                        {s.list.map((c, i) => (
                          <li key={i} style={{ padding: '5px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(201,96,62,0.10)' }}>
                            <strong>{c.name}</strong>
                            <span style={{ fontSize: 11, color: 'var(--ink-mute)', marginLeft: 6 }}>{c.lunchPrice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

          {/* ===== サイトならでは: 駅の使い方Tips ===== */}
          <section id="section-tips" style={{
            margin: '40px 0',
            padding: '20px 24px',
            background: 'linear-gradient(135deg, rgba(20,147,209,0.05), rgba(201,96,62,0.04))',
            border: '1px solid rgba(20,147,209,0.18)',
            borderRadius: 12,
          }}>
            <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, marginBottom: 12 }}>
              {station.name}駅 子連れランチの使い方Tips
            </h2>
            <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.85, fontSize: 14, color: 'var(--ink-sub)' }}>
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
                emoji: '🚼',
                desc: 'ベビーカーのまま余裕を持って入れる店。狭い通路で気を遣うストレスなし',
                items: [
                  ...chains.filter(c => c.stroller === 'good').map(c => ({ name: c.name, price: `${c.lunchPrice}円`, type: 'チェーン' })),
                  ...indies.filter(r => r.strollerOk).map(r => ({ name: r.name, price: r.priceLunch, type: '個人店' })),
                ],
              },
              {
                id: 'section-kidsmenu',
                label: 'キッズメニューあり',
                emoji: '🍱',
                desc: 'お子様メニューがある店。取り分け不要で偏食気味の子も安心',
                items: [
                  ...chains.filter(c => c.kidsMenu).map(c => ({ name: c.name, price: `${c.lunchPrice}円`, type: 'チェーン' })),
                  ...indies.filter(r => r.kidsMenu).map(r => ({ name: r.name, price: r.priceLunch, type: '個人店' })),
                ],
              },
              {
                id: 'section-private',
                label: '個室・仕切り席あり',
                emoji: '🚪',
                desc: '個室・座敷・半個室で気兼ねなく食事できる店',
                items: [
                  ...chains.filter(c => c.privateRoom).map(c => ({ name: c.name, price: `${c.lunchPrice}円`, type: 'チェーン' })),
                  ...indies.filter(r => r.privateRoom).map(r => ({ name: r.name, price: r.priceLunch, type: '個人店' })),
                ],
              },
              {
                id: 'section-babyfood',
                label: '離乳食持込OK',
                emoji: '🍼',
                desc: '離乳食を持ち込める店。ベビーフード派にも自宅冷凍派にも',
                items: chains.filter(c => c.babyFoodOk).map(c => ({ name: c.name, price: `${c.lunchPrice}円`, type: 'チェーン' })),
              },
              {
                id: 'section-budget',
                label: 'ランチ800円以内',
                emoji: '💴',
                desc: '財布に優しい子連れランチ定番',
                items: chains.filter(c => c.lunchPrice === '〜800').map(c => ({ name: c.name, price: `${c.lunchPrice}円`, type: 'チェーン' })),
              },
            ].filter(f => f.items.length > 0);

            if (filters.length === 0) return null;
            return (
              <section style={{ margin: '40px 0' }}>
                <header style={{ marginBottom: 16 }}>
                  <span className="eyebrow" style={{ color: 'var(--clay-deep)' }}>条件で絞り込み</span>
                  <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 22, marginTop: 4, marginBottom: 6 }}>
                    こだわり条件別の店一覧
                  </h2>
                </header>
                <div style={{ display: 'grid', gap: 14 }}>
                  {filters.map((f) => (
                    <div key={f.id} id={f.id} style={{
                      background: 'var(--paper-card)',
                      border: '1px solid rgba(201,96,62,0.16)',
                      borderRadius: 12,
                      padding: '14px 18px',
                      scrollMarginTop: 80, // ヘッダ固定時の見え方調整
                    }}>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
                        <span style={{ marginRight: 6 }}>{f.emoji}</span>{f.label}
                        <span style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 400, marginLeft: 8 }}>{f.items.length}店</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginBottom: 10 }}>{f.desc}</div>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 4, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                        {f.items.slice(0, 12).map((item, i) => (
                          <li key={i} style={{ fontSize: 13, padding: '4px 0' }}>
                            <strong>{item.name}</strong>
                            <span style={{ fontSize: 11, color: 'var(--ink-mute)', marginLeft: 6 }}>{item.type} / {item.price}</span>
                          </li>
                        ))}
                        {f.items.length > 12 && (
                          <li style={{ fontSize: 11, color: 'var(--ink-mute)', padding: '4px 0' }}>
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
          <div id="section-chains" style={{ scrollMarginTop: 80 }} />
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

          {/* 個人店・話題店セクション — anchor target */}
          {indies.length > 0 && (
            <section id="section-indies" className="station-indies" style={{
              marginTop: 8,
              marginBottom: 36,
              paddingTop: 32,
              borderTop: '2px dashed rgba(201,96,62,0.18)',
              scrollMarginTop: 80,
            }}>
              <header style={{ marginBottom: 24 }}>
                <span className="eyebrow" style={{ color: 'var(--clay-deep)' }}>チェーンじゃない、ローカルの実力店</span>
                <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 24, marginTop: 6, marginBottom: 8 }}>
                  {station.name}駅の個人店・話題店 <span style={{ fontSize: 14, color: 'var(--ink-mute)', fontWeight: 400 }}>{indies.length}店</span>
                </h2>
                <p style={{ fontSize: 14, color: 'var(--ink-sub)', lineHeight: 1.7, margin: 0 }}>
                  雑誌・TV・SNSで取り上げられた{station.name}エリアの実力店から、子連れで利用しやすい店舗を厳選。
                  チェーン店だけでなく、ご当地ならではの一軒で家族の食事をワンランク豊かに。
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

          {/* 条件で絞り込む */}
          {(() => {
            const conditionLinks = STATION_CONDITIONS.map((c) => {
              const cn = filterChainsByCondition(chains, c.slug).length;
              const inn = filterIndiesByCondition(indies, c.slug).length;
              return { cond: c, count: cn + inn };
            }).filter((x) => x.count > 0);
            if (conditionLinks.length === 0) return null;
            return (
              <section className="station-conditions-cta" style={{
                marginTop: 48,
                paddingTop: 32,
                borderTop: '1px solid rgba(201,96,62,0.14)',
              }}>
                <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, marginBottom: 12 }}>
                  {station.name}駅をもっと条件で絞る
                </h2>
                <p style={{ fontSize: 13, color: 'var(--ink-sub)', marginTop: 0, marginBottom: 16 }}>
                  雨の日・個室・赤ちゃん連れなど、シーン別の絞り込みページもあります。
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  {conditionLinks.map(({ cond: oc, count }) => (
                    <Link
                      key={oc.slug}
                      href={`/station/${slug}/${oc.slug}`}
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
            );
          })()}

          {/* 同じ区の他駅 — scaleバッジ付きカード化で視覚的に強化 */}
          {sameWardStations.length > 0 && (
            <section className="station-related" style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(201,96,62,0.14)' }}>
              <header className="kn-section-head">
                <span className="eyebrow">SAME WARD · 区内の他駅</span>
                <h2>{wardName}の他の駅もチェック</h2>
                <p className="section-lede">同じ{wardName}内の他駅も子連れランチのカバー範囲。お住まいや勤務先に近い駅で見つけてみてください。</p>
              </header>
              <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', marginTop: 16 }}>
                {sameWardStations.map((s) => {
                  const scaleColor = s.scale === 'terminal' ? '#C62828' : s.scale === 'major' ? '#E65100' : '#9E9E9E';
                  const scaleLabel = s.scale === 'terminal' ? 'ターミナル' : s.scale === 'major' ? '主要駅' : '駅';
                  return (
                    <Link
                      key={s.slug}
                      href={`/station/${s.slug}`}
                      style={{
                        display: 'block',
                        background: 'var(--paper-card)',
                        border: '1px solid rgba(201,96,62,0.16)',
                        borderLeft: `4px solid ${scaleColor}`,
                        borderRadius: 10,
                        padding: '10px 12px',
                        textDecoration: 'none',
                        color: 'var(--ink)',
                        transition: 'border-color 0.15s, transform 0.15s',
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{s.name}駅</div>
                      <div style={{ fontSize: 10, color: scaleColor, fontWeight: 600 }}>{scaleLabel}</div>
                    </Link>
                  );
                })}
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
