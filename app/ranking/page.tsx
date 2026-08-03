import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Breadcrumb } from '@/components/v2/V2Breadcrumb';
import { V2SpotRow } from '@/components/v2/V2Cards';
import { V2Icon } from '@/components/v2/V2Icon';
import { spotToV2 } from '@/lib/v2-adapters';
import { getAreaName, isValidArea, type AreaSlug } from '@/lib/area';
import type { AgeTag } from '@/lib/spots';
import { getRankingAreas, getSpotRanking } from '@/lib/spot-ranking';
import { AdSlot } from '@/components/ads/AdSlot';
import { INDEXABLE_ROBOTS } from '@/lib/robots-meta';

// GA4 の直近7日PVをもとに日次で更新する
export const revalidate = 86400;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  // SEO §2-2: エリア/年齢の絞り込みクエリ変種は /ranking の重複。
  // canonical→/ranking に加えて noindex,follow を付ける（/events・/spots と同一方針）。
  const hasVariant = Boolean((sp.area && sp.area !== 'all') || sp.age);
  return {
    title: '子連れ人気スポットランキング｜今みんなが見ている遊び場【きょうのこ】',
    description:
      '0〜6歳の子連れでいま人気のおでかけスポットを、実際の閲覧数をもとにランキング。年齢別・エリア別でも絞り込めます。公園・水族館・動物園・室内遊び場まで。',
    robots: hasVariant ? { index: false, follow: true } : INDEXABLE_ROBOTS,
    alternates: { canonical: '/ranking' },
    openGraph: {
      title: '子連れ人気スポットランキング｜きょうのこ',
      description: '0〜6歳の子連れでいま人気のおでかけスポットを実データでランキング',
      url: 'https://kyounoko.jp/ranking',
    },
  };
}

const AGE_TABS: { value?: AgeTag; label: string }[] = [
  { value: undefined, label: '総合' },
  { value: '0-1', label: '0〜1歳' },
  { value: '2-3', label: '2〜3歳' },
  { value: '4-6', label: '4〜6歳' },
];

function isAgeTag(v: unknown): v is AgeTag {
  return v === '0-1' || v === '2-3' || v === '4-6';
}

type Props = {
  searchParams: Promise<{ area?: string; age?: string }>;
};

export default async function RankingPage({ searchParams }: Props) {
  const sp = await searchParams;
  const area: AreaSlug | undefined =
    isValidArea(sp.area) && sp.area !== 'all' ? (sp.area as AreaSlug) : undefined;
  const age: AgeTag | undefined = isAgeTag(sp.age) ? sp.age : undefined;

  const ranking = await getSpotRanking({ area, age, limit: 30 });
  const areaOpts = getRankingAreas();
  // GA4 の実PVで並んでいるか（フォールバック時は編集部キュレーション）
  const isLive = ranking.some((it) => it.views !== undefined);

  // 現在の条件を保ったままチップのリンク先を作る
  const buildHref = (patch: { area?: string | null; age?: string | null }): string => {
    const params = new URLSearchParams();
    const nextArea = patch.area === undefined ? area : patch.area || undefined;
    const nextAge = patch.age === undefined ? age : patch.age || undefined;
    if (nextArea) params.set('area', nextArea);
    if (nextAge) params.set('age', nextAge);
    const qs = params.toString();
    return qs ? `/ranking?${qs}` : '/ranking';
  };

  const scopeLabel = [area ? getAreaName(area) : '全国', age ? AGE_TABS.find((t) => t.value === age)?.label : null]
    .filter(Boolean)
    .join('・');

  // ItemList 構造化データ（上位10件）
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `子連れ人気スポットランキング（${scopeLabel}）`,
    itemListElement: ranking.slice(0, 10).map((it) => ({
      '@type': 'ListItem',
      position: it.rank,
      name: it.spot.name,
      url: `https://kyounoko.jp/spot/${it.slug}`,
    })),
  };

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: '人気ランキング', item: 'https://kyounoko.jp/ranking' },
    ],
  };

  return (
    <V2Frame header="sub" active="area">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

      <V2Breadcrumb items={[{ label: 'ホーム', href: '/' }, { label: '人気ランキング' }]} />
      <div className="v2-page-head" style={{ paddingTop: 6 }}>
        <h1 className="v2-page-h1" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <V2Icon name="crown" size={24} color="var(--v2-orange)" />
          人気スポットランキング
        </h1>
        <p className="v2-page-lead">
          {isLive
            ? 'いま子連れ家族に見られているおでかけスポットを、直近1週間の閲覧数をもとに集計しました。'
            : '0〜6歳の子連れで定番の人気おでかけスポットを編集部が厳選しました。'}
        </p>
      </div>

      {/* 年齢タブ */}
      <div className="v2-ev-tabs" style={{ flexWrap: 'wrap' }}>
        {AGE_TABS.map((t) => {
          const on = age === t.value;
          return (
            <Link
              key={t.label}
              href={buildHref({ age: t.value ?? null })}
              className={'v2-ev-tab' + (on ? ' on' : '')}
              scroll={false}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* エリアフィルタ */}
      <div className="v2-ev-filters">
        <div className="v2-filter-group">
          <div className="v2-filter-label">エリア</div>
          <div className="v2-filter-opts">
            <Link
              href={buildHref({ area: null })}
              className={'v2-filter-opt' + (!area ? ' on' : '')}
              scroll={false}
            >
              全国
            </Link>
            {areaOpts.map((a) => (
              <Link
                key={a}
                href={buildHref({ area: area === a ? null : a })}
                className={'v2-filter-opt' + (area === a ? ' on' : '')}
                scroll={false}
              >
                {getAreaName(a)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="v2-sec-head">
        <div className="v2-sec-title">
          {scopeLabel}のランキング
          <span className="v2-ev-count">{ranking.length}</span>
        </div>
      </div>

      {ranking.length > 0 ? (
        <div className="v2-vlist">
          {ranking.map((it, i) => (
            <Fragment key={it.slug}>
              <V2SpotRow spot={spotToV2(it.spot, i)} rank={it.rank} href={`/spot/${it.slug}`} />
              {i === 4 && (
                <div className="v2-section" style={{ margin: '8px 0' }}>
                  <AdSlot placement="article-mid" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      ) : (
        <div className="v2-empty-state">
          <div className="v2-empty-ill">
            <V2Icon name="star" size={40} color="#e9c9ac" />
          </div>
          <div className="v2-empty-title">
            条件に合うスポットが
            <br />
            見つかりませんでした
          </div>
          <div className="v2-empty-sub">エリアや年齢の条件をへらしてお試しください。</div>
        </div>
      )}

      <div style={{ height: 24 }}></div>
    </V2Frame>
  );
}
