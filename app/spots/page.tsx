import '@/app/styles/spots-v3.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2SpotRow } from '@/components/v2/V2Cards';
import { KkSectionTitle } from '@/components/kk/KkSectionTitle';
import { KkIcon } from '@/components/kk/KkIcon';
import { KkArt, type KkArtName } from '@/components/kk/KkArt';
import { KkAddToHomeCard } from '@/components/kk/KkAddToHomeCard';
import { KkFooter } from '@/components/kk/KkFooter';
import { SPOT_CATEGORY_LABEL } from '@/lib/spots';
import { spotToV2 } from '@/lib/v2-adapters';
import { AdSlot } from '@/components/ads/AdSlot';
import { SpotListReveal } from '@/components/spots/SpotListReveal';
import { SpotFilterBar } from '@/components/spots/SpotFilterBar';
import { BROWSE_CATEGORIES, spotsByCategory } from '@/lib/spot-browse';
import { getRuntimeSpotOverrides, type SpotOverridesMap } from '@/lib/spot-overrides';
import { parseFilters, hasActiveFilters, matchesFilters, sortSpots, toFilterable } from '@/lib/spot-filter';
import { INDEXABLE_ROBOTS } from '@/lib/robots-meta';

export const revalidate = 3600;

/** 各カテゴリセクションで見せる代表件数（残りは「すべて見る」でカテゴリ全件ページへ）。 */
const PREVIEW = 12;
/** 絞り込みモードの初期表示件数。 */
const INITIAL = 24;

/**
 * カテゴリ → 社長支給のカラーイラスト（KkArt）。
 * lib/spot-browse.ts の `icon` はラベルと意味が食い違う（動物園=葉・水族館=傘…）ので、
 * トップの「スポットの種類」と同じ対応表をここでも明示する（docs §3-0「アイコンはテキストと意味が一致すること」）。
 */
const SPOT_CAT_ART: Record<string, KkArtName> = {
  park: 'park',           // 公園・自然 → 木とベンチ
  zoo: 'zoo',             // 動物園 → キリンとゾウ
  aquarium: 'aquarium',   // 水族館 → 水槽と魚
  museum: 'museum',       // 博物館・科学館 → 神殿風の建物
  indoor: 'kids-space',   // 室内遊び場 → 屋内キッズスペース
  amusement: 'themepark', // 遊園地 → 観覧車
  farm: 'farm',           // 牧場 → 牛と羊
  seasonal: 'shrine',     // 観光スポット → 鳥居
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const filtered = hasActiveFilters(parseFilters(await searchParams));
  return {
    title: '子連れスポット一覧｜公園・水族館・動物園・室内遊び場まで',
    description:
      '0〜6歳の子ども連れで楽しめるスポット400件以上を、カテゴリ別（公園・水族館・動物園・室内遊び場・遊園地・牧場）に検索できる子連れスポットDB。',
    // SEO §2-2: 絞り込み/並び替えのクエリ変種は noindex,follow ＋ canonical→/spots。
    robots: filtered ? { index: false, follow: true } : INDEXABLE_ROBOTS,
    alternates: { canonical: '/spots' },
    openGraph: {
      title: '子連れスポット一覧｜きょうのこスポットDB',
      description: '0〜6歳子連れで使える公園・水族館・動物園・室内遊び場 400件以上',
      url: 'https://kyounoko.jp/spots',
      images: [{ url: '/img/ogp-spot.webp', width: 1200, height: 630 }],
    },
  };
}

export default async function SpotsPage({ searchParams }: Props) {
  const filters = parseFilters(await searchParams);
  const filterMode = hasActiveFilters(filters);

  // 全おでかけ先（restaurant除外・掲載可能）。カテゴリ別取得を合成して再利用。
  // Admin(KV)上書きを渡し、名称変更等が検索/一覧にも即時反映されるようにする（詳細ページと同経路）。
  const ov = await getRuntimeSpotOverrides();
  const allDest = BROWSE_CATEGORIES.flatMap((c) => spotsByCategory(c.id, ov));
  const filterable = allDest.map(toFilterable);
  const totalCount = allDest.length;

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: 'スポットを探す', item: 'https://kyounoko.jp/spots' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
    <V2Frame header="sub" active="spots">
      <div className="spots-v3">
        <div className="sv3-head">
          {/* 見出しは装飾を付けず、文字と余白だけで成立させる（docs §2-1） */}
          <h1 className="sv3-h1">子連れスポットを探す</h1>
          <p className="sv3-lead">
            0〜6歳の子どもと楽しめるスポットを{totalCount}件以上、カテゴリ別・条件別に探せます。
          </p>
        </div>

        {/* 絞り込み・並び替え（P0-3b/c）。どちらのモードでも上部に常設。 */}
        <div className="sv3-controls">
          <SpotFilterBar spots={filterable} initial={filters} basePath="/spots" />
        </div>

        {filterMode ? (
          <FilteredResults filters={filters} allDest={allDest} />
        ) : (
          <BrowseMode ov={ov} />
        )}

        <KkAddToHomeCard placement="spots" />
        <KkFooter />
      </div>
    </V2Frame>
    </>
  );
}

/* ============ 絞り込みモード：カテゴリ枠を外したフラット結果 ============ */
function FilteredResults({
  filters,
  allDest,
}: {
  filters: ReturnType<typeof parseFilters>;
  allDest: ReturnType<typeof spotsByCategory>;
}) {
  const fmap = new Map(allDest.map((x) => [x.slug, x]));
  const matched = sortSpots(
    allDest.map(toFilterable).filter((s) => matchesFilters(s, filters)),
    filters.sort,
  ).map((s) => fmap.get(s.slug)!);

  const head = matched.slice(0, INITIAL);
  const rest = matched.slice(INITIAL);

  if (matched.length === 0) {
    return (
      <div className="sv3-empty">
        <span className="sv3-empty-art">
          <KkArt name="search" size={56} />
        </span>
        <p className="sv3-empty-title">
          条件に合うスポットが見つかりませんでした
        </p>
        <p className="sv3-empty-sub">
          設備や料金の条件を1つ外すか、エリアを地方ブロックや「全国」に広げると見つかりやすくなります。
        </p>
        <Link href="/spots" className="kk-btn outline">
          条件をリセットして全件を見る
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="sv3-count">{matched.length}件</p>
      <div className="v2-vlist">
        {head.map((x, i) => (
          <V2SpotRow key={x.slug} spot={spotToV2(x.spot, i)} href={`/spot/${x.slug}`} />
        ))}
      </div>
      <SpotListReveal remaining={rest.length}>
        {rest.map((x, i) => (
          <V2SpotRow key={x.slug} spot={spotToV2(x.spot, i + INITIAL)} href={`/spot/${x.slug}`} />
        ))}
      </SpotListReveal>
      <div className="v2-section sv3-ad">
        <AdSlot placement="home-below-finder" />
      </div>
    </>
  );
}

/* ============ ブラウズモード：カテゴリ別（代表12件＋すべて見る） ============ */
function BrowseMode({ ov }: { ov?: SpotOverridesMap }) {
  const byCat = BROWSE_CATEGORIES.map((c) => ({ c, list: spotsByCategory(c.id, ov) }));
  return (
    <>
      {/* カテゴリショートカット。見出しタグは元の div のまま（SEO照合のため h2 にしない）。 */}
      <section className="kk-sec">
        <KkSectionTitle as="div" title="カテゴリから探す" />
        <div className="sv3-types">
          {BROWSE_CATEGORIES.map((c) => (
            <Link key={c.id} href={`/spots/${c.id}`} className="sv3-type">
              <span className="sv3-type-ico">
                <KkArt name={SPOT_CAT_ART[c.id] ?? 'park'} size={44} />
              </span>
              <span className="sv3-type-label">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="v2-section sv3-ad">
        <AdSlot placement="home-below-finder" />
      </div>

      {byCat.map(({ c, list }) => {
        if (!list.length) return null;
        return (
          <section key={c.id} id={`cat-${c.id}`} className="kk-sec sv3-catsec">
            <KkSectionTitle
              as="div"
              title={`${SPOT_CATEGORY_LABEL[c.id]}（${c.label}）`}
              more={list.length > PREVIEW ? 'すべて見る' : ''}
              moreHref={list.length > PREVIEW ? `/spots/${c.id}` : undefined}
            />
            <div className="v2-vlist">
              {list.slice(0, PREVIEW).map((x, i) => (
                <V2SpotRow key={x.slug} spot={spotToV2(x.spot, i)} href={`/spot/${x.slug}`} />
              ))}
            </div>
            {list.length > PREVIEW && (
              <div className="sv3-more">
                <Link href={`/spots/${c.id}`} className="kk-btn outline">
                  {c.label}をすべて見る（全{list.length}件）
                  <KkIcon name="arrow-right" size={15} />
                </Link>
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
