import '@/app/styles/top-v3.css';
import type { Metadata } from 'next';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2FeatureCardV } from '@/components/v2/V2Cards';
import { V2PurposeRanking } from '@/components/v2/V2PurposeRanking';
import { V2RecentSpots } from '@/components/v2/V2RecentSpots';
import { V2TodayHero } from '@/components/v2/V2TodayHero';
import { LineCta } from '@/components/common/LineCta';
import { AdSlot } from '@/components/ads/AdSlot';
import { KkSectionTitle } from '@/components/kk/KkSectionTitle';
import { KkRowList, type KkRowItem } from '@/components/kk/KkRowList';
import { KkAddToHomeCard } from '@/components/kk/KkAddToHomeCard';
import { KkFooter } from '@/components/kk/KkFooter';
import { TopHero, type QuickSearchItem } from '@/components/top/TopHero';
import { TopPlanCard } from '@/components/top/TopPlanCard';
import { TopAreaTiles, type AreaChip } from '@/components/top/TopAreaTiles';
import { TopSpotTypeTiles } from '@/components/top/TopSpotTypeTiles';
import { TopSeasonBanner } from '@/components/top/TopSeasonBanner';
import { TopEventCards } from '@/components/top/TopEventCards';
import { TopGourmet, type GourmetTile } from '@/components/top/TopGourmet';
import { TopLikeTiles } from '@/components/top/TopLikeTiles';
import { TopCategoryGrid, type TopCategory } from '@/components/top/TopCategoryGrid';
import { getFileArticlesByCategory, getAllFileArticlesWithOverrides } from '@/lib/articles';
import { getThisWeekEvents } from '@/lib/events';
import { getSpotRanking } from '@/lib/spot-ranking';
import { FEATURE_PAGES } from '@/lib/feature-pages';
import { POPULAR_ARTICLE_SLUGS } from '@/lib/popular-articles';
import { pickTopPlan } from '@/lib/plans';
import { spotToV2, featureToV2, articleToV2 } from '@/lib/v2-adapters';

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

// 各チップは「今日の流れ(/today)」が実際に解釈するパラメータへ直接リンクする。
// 旧実装は全て /search?... に向いていたが /search は {q,p} しか読まず、
// weather/place/budget/category を無視 → 絞り込みゼロの全記事一覧に着地していた（壊れリンク）。
// アイコンはラベルと意味を一致させる（KkIcon の名前・絵文字は使わない / docs §3-0）。
const QUICK_SEARCH: QuickSearchItem[] = [
  { t: '雨の日', icon: 'umbrella', href: '/today?weather=rain' },
  { t: '晴れの日', icon: 'sunny', href: '/today?weather=sunny' },
  { t: '室内施設', icon: 'indoor', href: '/today?place=indoor' },
  { t: '子連れランチ', icon: 'lunch', href: '/today?mode=eat&mealTime=lunch' },
  { t: 'イベント', icon: 'event', href: '/events' },
  { t: '無料スポット', icon: 'free', href: '/today?budget=free' },
];

/**
 * エリアから探すのチップ。
 * 2026-09-08: 旧チップ（池袋・豊島／大塚・巣鴨／駒込・田端）は掲載スポットが薄く、
 * かつリンク先が全て /station の総覧だったため、**掲載スポットが多い駅・人気の駅**に差し替えた。
 * 件数は lib/spots.ts の nearestStation 実測（みなとみらい6・上野5・横浜5・豊洲/お台場/錦糸町/大宮各3）。
 */
const POPULAR_AREAS: AreaChip[] = [
  { t: 'みなとみらい', href: '/station/minato-mirai' },
  { t: '横浜', href: '/station/yokohama' },
  { t: '豊洲', href: '/station/toyosu' },
  { t: 'お台場', href: '/station/odaiba-kaihinkoen' },
  { t: '錦糸町', href: '/station/kinshicho' },
  { t: '大宮', href: '/station/omiya' },
  { t: '東京23区の駅から', href: '/station' },
  { t: '関東のスポット', href: '/spots' },
];
/**
 * 既存サイトの全カテゴリ。SEO 主要導線として TOP に固定表示。
 * 順序は『きょうのこ』編集方針の重要度順。
 */
const CATEGORIES: TopCategory[] = [
  { slug: 'today-doko', name: '今日どこ行く' },
  { slug: 'today-nani', name: '今日何する' },
  { slug: 'today-taberu', name: '今日何食べる' },
  { slug: 'today-mawasu', name: '今日どう回す' },
  { slug: 'gyouji', name: '季節と行事' },
  { slug: 'narai', name: '習い事と学び' },
  { slug: 'yakudatsu', name: '役立つもの' },
  { slug: 'tenki', name: '天気で決める' },
];

/**
 * 子連れで行きたい飲食店: ハブ記事タイル（slug は content/articles に実在するもの）。
 * 2026-09-08: 画像は記事の hero だとジャンルと合わない（焼肉の hero が座敷の写真）ため、
 * ジャンルが一目で分かる既存のシーン写真を明示する。新規画像は追加していない。
 */
const GOURMET_TILES: Array<{ t: string; slug: string; img: string }> = [
  { t: 'ファミレス', slug: 'kodzure-famires-15sen', img: '/img/scenes/famires-01.webp' },
  { t: '回転寿司', slug: 'kaiten-sushi-4chain-comparison', img: '/img/top/kaiten-sushi.webp' },
  { t: '焼肉', slug: 'kodzure-yakiniku-shabu-7', img: '/img/top/yakiniku.webp' },
  // 一蘭から提供を受けた写真（編集方針5-5により提供元をタイル下に明記する）
  { t: 'ラーメン', slug: 'kodzure-ramen-anzen-kanzen-guide', img: '/photos/ichiran-okosama-ramen-main.webp' },
];
/** 'YYYY-MM-DD' → 'YYYY.MM.DD'（表示用） */
function fmtDate(d?: string): string | undefined {
  if (!d) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : d;
}

export default async function HomePage() {
  // KV 上書き（admin で差し替えた hero 等）をマージしたメタを使う。
  // これでトップの「人気の記事」「新着記事」カードも編集後の画像を反映する。
  const allArticles = await getAllFileArticlesWithOverrides();
  const popularArticles = POPULAR_ARTICLE_SLUGS.map((slug) =>
    allArticles.find((a) => a.slug === slug),
  ).filter((a): a is NonNullable<typeof a> => Boolean(a));
  const latestArticles = allArticles.slice(0, 6);

  // 人気スポット: /ranking と同じ getSpotRanking() を使い、トップの上位5件と
  // /ranking の順位がズレないようにする。
  const spotRanking = await getSpotRanking({ limit: 5 });
  const spotRows: KkRowItem[] = spotRanking.map((x, i) => {
    const v = spotToV2(x.spot, i);
    return {
      href: `/spot/${x.slug}`,
      title: v.name,
      // 旧トップのカードに出ていた設備タグ（授乳室あり・雨OK 等）を行にも残す。
      // 語彙が消えると「どんな条件で使える場所か」が一覧から読み取れなくなるため。
      sub: [v.cat, v.station, ...v.tags.slice(0, 2).map((t) => t.t)].filter(Boolean).join('・'),
      img: v.img,
      seed: v.id,
    };
  });

  // 月齢ヒント用: 年齢帯ごとの記事候補（タイトル＋slugだけクライアントに渡す）。
  // V2TodayHero が登録済みの生まれ月に応じて月替わりで3本ローテ表示する。
  const agePicks = Object.fromEntries(
    (['0-1', '2-3', '4-6'] as const).map((range) => [
      range,
      allArticles
        .filter((a) => !a.noindex && (a.quickInfo?.ageRanges ?? []).includes(range))
        .slice(0, 24)
        .map((a) => ({ slug: a.slug, title: a.title })),
    ]),
  );

  const featureCards = FEATURE_PAGES.slice(0, 4).map(featureToV2);

  // 実績上位5件（社長指示 2026-09-08: 6件目以降は出さない）。
  const popularRows: KkRowItem[] = popularArticles.slice(0, 5).map((a) => {
    const v = articleToV2(a);
    return { href: `/article/${a.slug}`, title: a.title, sub: v.tags?.join('・') || undefined, img: v.img, seed: a.slug };
  });
  const latestRows: KkRowItem[] = latestArticles.map((a) => {
    const v = articleToV2(a);
    return { href: `/article/${a.slug}`, title: a.title, sub: v.tags?.slice(0, 2).join('・') || undefined, date: fmtDate(a.publishedAt), img: v.img, seed: a.slug };
  });

  // 今週のイベント（編集部キュレーション）。0件なら表示しない
  const weekEvents = getThisWeekEvents().slice(0, 6);
  // 季節と行事カテゴリの新着記事は別セクション
  const seasonalRows: KkRowItem[] = getFileArticlesByCategory('gyouji')
    .filter((a) => !a.noindex)
    .slice(0, 6)
    .map((a) => {
      const v = articleToV2(a);
      return { href: `/article/${a.slug}`, title: a.title, sub: v.tags?.slice(0, 2).join('・') || undefined, date: fmtDate(a.publishedAt), img: v.img, seed: a.slug };
    });

  // 飲食店ハブ記事タイル（記事自身の hero を使う）
  const gourmetTiles: GourmetTile[] = GOURMET_TILES.map((g) => ({
    t: g.t,
    href: `/article/${g.slug}`,
    img: g.img,
    seed: g.slug,
  }));
  // 今日のおすすめプラン: 既定条件（2〜3歳・晴れ・外出）の上位プランをテキストで添える。
  // mode:'play' を指定しないと kind:'meal'（夕食の献立）が選ばれてしまい、
  // 「おでかけプラン」の例として夕飯の献立が出る不整合になる。
  const topPlan =
    pickTopPlan({ age: '2-3', weather: 'sunny', place: 'outside', mode: 'go' })?.plan ??
    pickTopPlan({ age: '2-3', weather: 'any', mode: 'go' })?.plan ??
    null;

  return (
    <V2Frame header="home" active="home">
      <div className="top-v3">
        {/* ファーストビュー: 写真＋H1＋操作UIのパネル1枚。
            パネル先頭のステータス帯は V2TodayHero（登録済ユーザーのみ描画／未登録・クローラは null）。
            /today のクエリ形（date/age/station/weather）は従来どおり。 */}
        <TopHero quick={QUICK_SEARCH} agePicks={agePicks} />

        {/* 未登録ユーザー向け：設定ブロック（登録済ユーザーには出ない＝上のステータス帯が担う） */}
        <V2TodayHero agePicks={agePicks} variant="setup-only" />

        {/* 1. 今日のおすすめプラン */}
        <section className="kk-sec">
          <KkSectionTitle as="h2" title="今日のおすすめプラン" moreHref="/today" more="つくる" />
          <TopPlanCard plan={topPlan} />
        </section>

        {/* 2. LINE友だち追加CTA（env未設定時は非表示・スマホのみ）＋ ホーム画面に追加 */}
        <LineCta variant="banner" />
        <KkAddToHomeCard placement="home" />

        {/* 3. エリアから探す（小さめの写真タイル4＋静かなチップ） */}
        <section className="kk-sec">
          <KkSectionTitle as="h2" title="エリアから探す" moreHref="/station" />
          <TopAreaTiles chips={POPULAR_AREAS} />
        </section>

        {/* 4. スポットの種類から探す（線画アイコン） */}
        <section className="kk-sec">
          <KkSectionTitle as="h2" title="スポットの種類から探す" moreHref="/spots" />
          <TopSpotTypeTiles />
        </section>

        {/* 5. いま人気のスポット（罫線の行リスト） */}
        <section className="kk-sec">
          <KkSectionTitle as="h2" title="いま人気のスポット" moreHref="/ranking" />
          <KkRowList items={spotRows} variant="rank" className="grid2" label="人気スポットランキング" />
        </section>

        {/* 目的別 実用ランキング（首都圏 × 目的）。5件行リスト＋6〜10位は折りたたみ */}
        <V2PurposeRanking />

        {/* 広告（枠数・placement は従来どおり1枠。位置も旧トップと同じ「人気スポットの直後」に置く。
            最下部へ動かすとファーストビューから遠くなり RPM が落ちるため） */}
        <div className="kk-sec">
          <AdSlot placement="home-below-finder" />
        </div>

        {/* 6. 季節（全幅の写真帯） */}
        <section className="kk-sec">
          <KkSectionTitle as="h2" title="今月の季節と行事" moreHref="/category/gyouji" />
          <TopSeasonBanner />
        </section>

        {/* 7. 今週末のイベント（実データ） */}
        {weekEvents.length > 0 && (
          <section className="kk-sec">
            <KkSectionTitle as="h2" title="今週末のイベント" moreHref="/events" />
            <TopEventCards events={weekEvents} />
          </section>
        )}

        {/* 8. 子連れで行きたい飲食店（大きな写真） */}
        <section className="kk-sec">
          <KkSectionTitle as="h2" title="子連れで行きたい飲食店" moreHref="/category/today-taberu" />
          <TopGourmet tiles={gourmetTiles} />
        </section>

        {/* 9. 子どもの「好き」から見つける（大きな2枚組） */}
        <section className="kk-sec">
          <KkSectionTitle as="h2" title="子どもの「好き」から見つける" />
          <TopLikeTiles />
        </section>

        {/* 10. よく読まれています */}
        <section className="kk-sec">
          <KkSectionTitle as="h2" title="よく読まれています" moreHref="/articles" />
          {popularRows.length ? (
            <>
              <KkRowList items={popularRows.slice(0, 5)} variant="rank" className="grid2" label="人気の記事" />
              {/* 6件目以降はサムネ付きの通常行（記事 hero を落とさない） */}
            </>
          ) : (
            <p className="kk-lead">人気記事を集計中です。</p>
          )}
        </section>

        {/* 11. 新着記事 */}
        <section className="kk-sec">
          <KkSectionTitle as="h2" title="新着記事" moreHref="/articles" />
          <KkRowList items={latestRows} variant="date" className="grid2" label="新着記事" />
        </section>

        {/* 12. カテゴリから探す（SEO 主要導線・静かなチップ列） */}
        <section className="kk-sec">
          <KkSectionTitle as="h2" title="カテゴリから探す" />
          <TopCategoryGrid categories={CATEGORIES} />
        </section>

        {/* 特集 */}
        <section className="kk-sec">
          <KkSectionTitle as="h2" title="特集" moreHref="/feature" />
          <div className="v2-hscroll">
            {featureCards.map((f) => (
              <V2FeatureCardV key={f.id} f={f} href={`/feature/${f.id}`} />
            ))}
          </div>
        </section>

        {/* 季節と行事カテゴリの新着記事 */}
        {seasonalRows.length > 0 && (
          <section className="kk-sec">
            <KkSectionTitle as="h2" title="季節と行事の新着記事" moreHref="/category/gyouji" />
            <KkRowList items={seasonalRows} variant="date" className="grid2" label="季節と行事の新着記事" />
          </section>
        )}

        {/* 最近見たスポット（localStorage ベース） */}
        <V2RecentSpots />

        {/* Footer */}
        <KkFooter />
      </div>
    </V2Frame>
  );
}
