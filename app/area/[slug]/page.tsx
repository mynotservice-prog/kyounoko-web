import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2SectionHead, V2Img } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import { getAllSpotsWithSlug } from '@/lib/spots';
import type { Spot } from '@/lib/spots';
import { getAllFileArticles } from '@/lib/articles';
import { WARD_NAMES } from '@/lib/tokyo-stations';
import { AREAS } from '@/lib/area';
import { spotToV2, articleToV2 } from '@/lib/v2-adapters';
import { AdSlot } from '@/components/ads/AdSlot';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

const WARD_SLUGS = new Set(Object.keys(WARD_NAMES));
const PREF_BY_SLUG = new Map(AREAS.map((a) => [a.slug, a]));

type AreaMatch = {
  /** 表示名（'豊島区' / '東京都' / '横浜市' 等） */
  name: string;
  /** スポット絞り込みフィルタ */
  spotFilter: (entry: { area: string; spot: Spot }) => boolean;
  /** 記事の area メタとの突合用キー */
  articleAreaKey?: string;
  /** ブレッドクラム種別（23区 / 都道府県 / 市町村） */
  kind: 'ward' | 'pref' | 'city';
  /** 都道府県 slug（ブロックリンク用） */
  prefSlug?: string;
};

/** slug を解決して、表示名・スポット絞り込み関数・記事キーを返す。 */
function resolveArea(slug: string): AreaMatch {
  const decoded = decodeURIComponent(slug);

  // 1) 23区
  if (WARD_SLUGS.has(decoded)) {
    const wardName = WARD_NAMES[decoded as keyof typeof WARD_NAMES];
    return {
      name: wardName,
      kind: 'ward',
      prefSlug: 'tokyo',
      articleAreaKey: 'tokyo',
      spotFilter: (x) => x.area === 'tokyo' && x.spot.ward === wardName,
    };
  }

  // 2) 都道府県スラグ（tokyo / kanagawa / saitama 等）
  const pref = PREF_BY_SLUG.get(decoded as Parameters<typeof PREF_BY_SLUG.get>[0]);
  if (pref) {
    return {
      name: pref.name,
      kind: 'pref',
      prefSlug: pref.slug,
      articleAreaKey: pref.slug,
      spotFilter: (x) => x.area === pref.slug,
    };
  }

  // 3) 日本語の市町村名（'横浜市' '八王子市' 等）
  return {
    name: decoded,
    kind: 'city',
    spotFilter: (x) => x.spot.city === decoded || x.spot.ward === decoded,
  };
}

/** 支給C系画像（都道府県別）。23区は東京、地名直指定は prefSlug を見て解決。 */
const AREA_HERO_PREF = new Set(['tokyo', 'kanagawa', 'saitama', 'chiba', 'ibaraki', 'tochigi', 'gunma']);
function areaHeroImage(
  m: AreaMatch,
  fallbackSpot?: { spot: Spot },
): string {
  const pref = m.prefSlug;
  if (pref && AREA_HERO_PREF.has(pref)) return `/v2/areas/${pref}.webp`;
  // 市町村のみ指定の場合：スポット先頭の画像を使う
  if (fallbackSpot) return spotToV2(fallbackSpot.spot).img;
  return '/v2/areas/tokyo.webp';
}

export async function generateStaticParams() {
  // 23区 + 7都県を静的生成
  return [
    ...Object.keys(WARD_NAMES).map((slug) => ({ slug })),
    ...['tokyo', 'saitama', 'kanagawa', 'chiba', 'ibaraki', 'tochigi', 'gunma'].map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const m = resolveArea(slug);
  return {
    title: `${m.name}のおでかけ｜子連れスポット一覧`,
    description: `${m.name}で子連れで楽しめるスポット・ランチ・イベントを集めました。`,
    alternates: { canonical: `/area/${slug}` },
  };
}

export default async function AreaDetailPage({ params }: Props) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const m = resolveArea(slug);
  const name = m.name;

  // 該当エリアのスポットを抽出
  const allSpotsEntries = getAllSpotsWithSlug();
  const areaSpots = allSpotsEntries.filter(m.spotFilter);

  // 関連記事（エリア絞り込み）
  const allArticles = getAllFileArticles().filter((a) => !a.noindex);
  const relatedArticles = allArticles
    .filter((a) => m.articleAreaKey && a.area === m.articleAreaKey)
    .slice(0, 6);

  // 同じ都道府県内の他のエリア（近隣エリアセクション用）
  const samePrefOthers =
    m.prefSlug && m.kind === 'ward'
      ? Object.entries(WARD_NAMES)
          .filter(([s]) => s !== decoded)
          .slice(0, 8)
          .map(([s, n]) => ({ slug: s, name: n }))
      : [];

  const showSpots = areaSpots.length > 0;

  const isWard = m.kind === 'ward';
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: 'エリア', item: 'https://kyounoko.jp/area' },
      ...(isWard
        ? [{ '@type': 'ListItem', position: 3, name: '東京都', item: 'https://kyounoko.jp/area/tokyo' } as const]
        : []),
      { '@type': 'ListItem', position: isWard ? 4 : 3, name: `${name}のおでかけ` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <V2Frame
        header="sub"
        active="search"
        backHref={isWard ? '/area/tokyo' : '/area'}
      >
        {/* Hero — 支給C系画像（都道府県別）が最優先 */}
        <div className="v2-area-hero">
          <V2Img
            src={areaHeroImage(m, areaSpots[0])}
            seed={'ah' + slug}
            alt={name}
          />
          <div className="v2-area-hero-grad"></div>
          <div className="v2-area-hero-copy">
            <h1 className="v2-area-hero-title" style={{ margin: 0, fontSize: 'inherit', fontWeight: 'inherit' }}>{name}のおでかけ</h1>
            <div className="v2-area-hero-sub">
              子どもと楽しめるスポットが{areaSpots.length}件
            </div>
          </div>
        </div>
        <div className="v2-page-head" style={{ paddingTop: 14 }}>
          <p className="v2-page-lead" style={{ marginTop: 0 }}>
            {name}で子どもと楽しめるスポット・ランチ・イベントをまとめました。雨の日も晴れの日も、近くのおでかけ先がきっと見つかります。
          </p>
        </div>

        {/* よく検索される条件 chips（横スクロール） */}
        <div className="v2-sec-head" style={{ marginTop: 18 }}>
          <div className="v2-sec-title">
            <span className="v2-bar-accent"></span>よく検索される条件
          </div>
        </div>
        <div className="v2-hscroll" style={{ gap: 8 }}>
          {[
            { t: '雨の日OK', q: 'weather=rain', icon: 'umbrella' as const, bg: 'var(--v2-c-rain-bg)', c: 'var(--v2-c-rain)' },
            { t: '室内施設', q: 'place=indoor', icon: 'house' as const, bg: 'var(--v2-c-indoor-bg)', c: 'var(--v2-c-indoor)' },
            { t: '0〜1歳OK', q: 'age=0-1', icon: 'baby' as const, bg: 'var(--v2-c-event-bg)', c: 'var(--v2-c-event)' },
            { t: '無料', q: 'budget=free', icon: 'free' as const, bg: 'var(--v2-c-free-bg)', c: 'var(--v2-c-free)' },
            { t: 'ランチ', q: 'category=today-taberu', icon: 'fork' as const, bg: 'var(--v2-c-lunch-bg)', c: 'var(--v2-c-lunch)' },
            { t: 'イベント', q: 'category=gyouji', icon: 'party' as const, bg: 'var(--v2-c-sun-bg)', c: 'var(--v2-c-sun)' },
          ].map((c) => (
            <Link
              key={c.t}
              href={`/today?${c.q}${m.prefSlug ? `&area=${m.prefSlug}` : ''}`}
              className="v2-cond-short"
            >
              <span className="v2-cond-short-ico" style={{ background: c.bg, color: c.c }}>
                <V2Icon name={c.icon} size={16} />
              </span>
              {c.t}
            </Link>
          ))}
        </div>

        {/* 駅から探す CTA（東京のみ） */}
        {m.prefSlug === 'tokyo' && (
          <div className="v2-section" style={{ marginTop: 8 }}>
            <Link href="/station" className="v2-station-cta">
              <span className="v2-station-cta-ico">
                <V2Icon name="train" size={22} color="#fff" />
              </span>
              <span style={{ flex: 1 }}>
                <span className="v2-station-cta-t">駅から探す</span>
                <span className="v2-station-cta-s">最寄り駅 / 路線 / 徒歩分から子連れスポットを検索</span>
              </span>
              <V2Icon name="chevron-right" size={18} color="var(--v2-orange)" />
            </Link>
          </div>
        )}

        {/* 人気スポット */}
        {showSpots ? (
          <>
            <V2SectionHead title="人気スポット" moreHref="/spots" />
            <div className="v2-hscroll">
              {areaSpots.slice(0, 6).map((x, i) => {
                const v = spotToV2(x.spot, i);
                return (
                  <Link
                    key={x.slug}
                    href={`/spot/${x.slug}`}
                    className="v2-card-mini"
                    style={{ width: 168 }}
                  >
                    <div className="v2-imgwrap r" style={{ aspectRatio: '16/9' }}>
                      <V2Img src={v.img} seed={x.slug} alt={x.spot.name} />
                    </div>
                    <div className="v2-card-mini-title">{x.spot.name}</div>
                    {x.spot.note && (
                      <div className="v2-art-sub" style={{ paddingLeft: 0 }}>
                        {x.spot.note.slice(0, 40)}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <div className="v2-section" style={{ marginTop: 24 }}>
            <p style={{ fontSize: 13, color: 'var(--v2-ink-mute)', lineHeight: 1.7 }}>
              {name}のスポット情報は準備中です。近隣エリアや関連記事をご覧ください。
            </p>
          </div>
        )}

        {/* AdSense */}
        <div className="v2-section" style={{ marginTop: 24 }}>
          <AdSlot placement="article-mid" />
        </div>

        {/* 関連記事 */}
        {relatedArticles.length > 0 && (
          <>
            <V2SectionHead title="関連記事" moreHref="/category/today-doko" />
            <div className="v2-section">
              {relatedArticles.map((a) => {
                const v = articleToV2(a);
                return (
                  <Link key={a.slug} href={`/article/${a.slug}`} className="v2-art-row">
                    <div className="v2-imgwrap r" style={{ width: 76, minWidth: 76, height: 60 }}>
                      <V2Img src={v.img} seed={a.slug} alt={a.title} />
                    </div>
                    <div className="v2-art-body">
                      <div className="v2-art-title">{a.title}</div>
                      {a.lede && <div className="v2-art-sub">{a.lede.slice(0, 60)}</div>}
                    </div>
                    <V2Icon name="chevron-right" size={20} color="#cfcfcf" />
                  </Link>
                );
              })}
            </div>
          </>
        )}

        <div style={{ height: 24 }}></div>
      </V2Frame>
    </>
  );
}
