import '@/app/styles/spots-v3.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2SpotRow } from '@/components/v2/V2Cards';
import { KkArt, type KkArtName } from '@/components/kk/KkArt';
import { KkAddToHomeCard } from '@/components/kk/KkAddToHomeCard';
import { KkFooter } from '@/components/kk/KkFooter';
import { spotToV2 } from '@/lib/v2-adapters';
import { AdSlot } from '@/components/ads/AdSlot';
import { SpotListReveal } from '@/components/spots/SpotListReveal';
import { SpotFilterBar } from '@/components/spots/SpotFilterBar';
import { BROWSE_CATEGORIES, getBrowseCategory, spotsByCategory } from '@/lib/spot-browse';
import { getRuntimeSpotOverrides } from '@/lib/spot-overrides';
import { parseFilters, hasActiveFilters, matchesFilters, sortSpots, toFilterable } from '@/lib/spot-filter';
import { INDEXABLE_ROBOTS } from '@/lib/robots-meta';

export const revalidate = 3600;

/** 初期表示件数（残りは「もっと見る」で開く。全件は HTML に含まれる）。 */
const INITIAL = 24;

/**
 * カテゴリ → 社長支給のカラーイラスト（KkArt）。
 * lib/spot-browse.ts の `icon` はラベルと意味が食い違う（動物園=葉・水族館=傘…）ため、
 * トップの「スポットの種類」（components/top/TopSpotTypeTiles.tsx）と同じ対応表を使う。
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
  params: Promise<{ cat: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// 生成対象は BROWSE_CATEGORIES のみ。restaurant 等はここでは 404（P1-1cで別扱い）。
export function generateStaticParams() {
  return BROWSE_CATEGORIES.map((c) => ({ cat: c.id }));
}
export const dynamicParams = false;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { cat } = await params;
  const c = getBrowseCategory(cat);
  if (!c) return {};
  const filters = parseFilters(await searchParams);
  const filtered = hasActiveFilters(filters);
  const count = spotsByCategory(c.id).length;
  const title = `${c.label}の子連れスポット一覧（全${count}件）`;
  const description = `0〜6歳の子連れで楽しめる${c.label}のスポットを全${count}件掲載。最寄り駅・設備・年齢の目安つきで、今日のおでかけ先を探せます。`;
  return {
    title,
    description,
    // SEO §2-2: フィルタ/並び替えのクエリ変種は noindex,follow ＋ canonical→クリーンURL。
    robots: filtered ? { index: false, follow: true } : INDEXABLE_ROBOTS,
    alternates: { canonical: `/spots/${c.id}` },
    openGraph: {
      title,
      description,
      url: `https://kyounoko.jp/spots/${c.id}`,
      images: [{ url: '/img/ogp-spot.webp', width: 1200, height: 630 }],
    },
  };
}

export default async function SpotCategoryPage({ params, searchParams }: Props) {
  const { cat } = await params;
  const c = getBrowseCategory(cat);
  if (!c) notFound();

  const filters = parseFilters(await searchParams);

  // カテゴリ全件（人気順）→ 絞り込み＆並び替え。件数ライブ更新用に filterable も作る。
  // Admin(KV)上書きを適用（名称変更等を一覧にも即時反映）。
  const catSpots = spotsByCategory(c.id, await getRuntimeSpotOverrides());
  const fmap = new Map(catSpots.map((x) => [x.slug, x]));
  const filterable = catSpots.map(toFilterable);
  const matchedF = sortSpots(filterable.filter((s) => matchesFilters(s, filters)), filters.sort);
  const list = matchedF.map((s) => fmap.get(s.slug)!);

  const head = list.slice(0, INITIAL);
  const rest = list.slice(INITIAL);

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: 'スポットを探す', item: 'https://kyounoko.jp/spots' },
      { '@type': 'ListItem', position: 3, name: c.label, item: `https://kyounoko.jp/spots/${c.id}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
    <V2Frame header="sub" backHref="/spots" active="spots">
      <div className="spots-v3">
        <div className="sv3-head">
          <nav aria-label="パンくず" className="sv3-crumb">
            <Link href="/spots" className="sv3-crumb-link">
              子連れスポットを探す
            </Link>
            <span className="sv3-crumb-sep">／</span>
            <span>{c.label}</span>
          </nav>
          <h1 className="sv3-h1">
            {/* イラストはカテゴリと意味が一致するものを使う（docs §3-0） */}
            <span className="sv3-h1-art">
              <KkArt name={SPOT_CAT_ART[c.id] ?? 'park'} size={40} priority />
            </span>
            {c.label}のスポット
          </h1>
          <p className="sv3-lead">
            {catSpots.length}件中 <strong>{list.length}件</strong> を表示中。タップで詳細・最寄り駅・設備が見られます。
          </p>
        </div>

        {/* 絞り込み・並び替え（P0-3b/c） */}
        <div className="sv3-controls">
          <SpotFilterBar spots={filterable} initial={filters} basePath={`/spots/${c.id}`} />
        </div>

        {list.length === 0 ? (
          // 0件回避：空リストを出さず、条件緩和導線を出す（画面仕様 §3-6）
          <div className="sv3-empty">
            <span className="sv3-empty-art">
              <KkArt name="search" size={56} />
            </span>
            <p className="sv3-empty-title">
              条件に合うスポットが見つかりませんでした
            </p>
            <p className="sv3-empty-sub">
              設備や料金の条件を1つ外すと見つかりやすくなります。
            </p>
            <Link href={`/spots/${c.id}`} className="kk-btn outline">
              条件をリセットして全{catSpots.length}件を見る
            </Link>
          </div>
        ) : (
          <>
            <div className="v2-vlist">
              {head.map((x, i) => (
                <V2SpotRow key={x.slug} spot={spotToV2(x.spot, i)} href={`/spot/${x.slug}`} />
              ))}
            </div>

            {/* 残りは常に HTML に含めつつ、UIは「もっと見る」で開く（クロール到達を担保） */}
            <SpotListReveal remaining={rest.length}>
              {rest.map((x, i) => (
                <V2SpotRow key={x.slug} spot={spotToV2(x.spot, i + INITIAL)} href={`/spot/${x.slug}`} />
              ))}
            </SpotListReveal>

            <div className="v2-section sv3-ad">
              <AdSlot placement="home-below-finder" />
            </div>

            {/* 他カテゴリへの回遊 */}
            <div className="sv3-facet">
              <p className="sv3-facet-lab">ほかのカテゴリから探す</p>
              <div className="kk-chips">
                {BROWSE_CATEGORIES.filter((o) => o.id !== c.id).map((o) => (
                  <Link key={o.id} href={`/spots/${o.id}`} className="kk-chip">
                    {o.label}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        <KkAddToHomeCard placement="spots" />
        <KkFooter />
      </div>
    </V2Frame>
    </>
  );
}
