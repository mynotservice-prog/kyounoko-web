import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2SpotRow } from '@/components/v2/V2Cards';
import { V2SectionHead } from '@/components/v2/V2Base';
import { V2Icon, V2_ACCENT, type V2IconName } from '@/components/v2/V2Icon';
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

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const filtered = hasActiveFilters(parseFilters(await searchParams));
  return {
    title: '子連れスポット一覧｜公園・水族館・動物園・室内遊び場まで【きょうのこスポットDB】',
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
      <div className="v2-page-head" style={{ paddingTop: 6 }}>
        <h1 className="v2-page-h1" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <V2Icon name="pin" size={24} color="var(--v2-orange)" />
          子連れスポットを探す
        </h1>
        <p className="v2-page-lead">
          0〜6歳の子どもと楽しめるスポットを{totalCount}件以上、カテゴリ別・条件別に探せます。
        </p>
      </div>

      {/* 絞り込み・並び替え（P0-3b/c）。どちらのモードでも上部に常設。 */}
      <div className="v2-section" style={{ marginTop: 4 }}>
        <SpotFilterBar spots={filterable} initial={filters} basePath="/spots" />
      </div>

      {filterMode ? (
        <FilteredResults filters={filters} allDest={allDest} />
      ) : (
        <BrowseMode ov={ov} />
      )}

      <div style={{ height: 24 }}></div>
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
      <div className="v2-section" style={{ marginTop: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
          条件に合うスポットが見つかりませんでした
        </p>
        <p style={{ fontSize: 13, color: 'var(--v2-ink-mute)', marginBottom: 12, lineHeight: 1.7 }}>
          設備や料金の条件を1つ外すか、エリアを「首都圏」に広げると見つかりやすくなります。
        </p>
        <Link href="/spots" className="v2-more-btn" style={resetBtnStyle}>
          条件をリセットして全件を見る
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="v2-section" style={{ fontSize: 13, fontWeight: 700, marginTop: 12 }}>
        {matched.length}件
      </p>
      <div className="v2-vlist" style={{ marginTop: 4 }}>
        {head.map((x, i) => (
          <V2SpotRow key={x.slug} spot={spotToV2(x.spot, i)} href={`/spot/${x.slug}`} />
        ))}
      </div>
      <SpotListReveal remaining={rest.length}>
        {rest.map((x, i) => (
          <V2SpotRow key={x.slug} spot={spotToV2(x.spot, i + INITIAL)} href={`/spot/${x.slug}`} />
        ))}
      </SpotListReveal>
      <div className="v2-section" style={{ marginTop: 24 }}>
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
      {/* カテゴリショートカット */}
      <V2SectionHead title="カテゴリから探す" more="" />
      <div className="v2-quick-grid">
        {BROWSE_CATEGORIES.map((c) => {
          const a = V2_ACCENT[c.accent as keyof typeof V2_ACCENT] ?? V2_ACCENT.purple;
          return (
            <Link key={c.id} href={`/spots/${c.id}`} className="v2-quick-item">
              <span className="v2-quick-ico" style={{ background: a.bg }}>
                <V2Icon name={c.icon as V2IconName} size={26} color={a.c} />
              </span>
              <span className="v2-quick-label">{c.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="v2-section" style={{ marginTop: 24 }}>
        <AdSlot placement="home-below-finder" />
      </div>

      {byCat.map(({ c, list }) => {
        if (!list.length) return null;
        return (
          <section key={c.id} id={`cat-${c.id}`}>
            <V2SectionHead
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
              <div className="v2-section" style={{ marginTop: 12, textAlign: 'center' }}>
                <Link href={`/spots/${c.id}`} className="v2-more-btn" style={moreBtnStyle}>
                  {c.label}をすべて見る（全{list.length}件）
                  <V2Icon name="arrow-right" size={14} />
                </Link>
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}

const moreBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 20px',
  borderRadius: 999,
  border: '1px solid var(--v2-line)',
  background: 'var(--v2-card)',
  color: 'var(--v2-ink)',
  fontSize: 14,
  fontWeight: 600,
};
const resetBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 20px',
  borderRadius: 999,
  border: '1px solid var(--v2-line)',
  background: 'var(--v2-card, #fff)',
  color: 'var(--v2-ink)',
  fontSize: 14,
  fontWeight: 700,
};
