import '@/app/styles/spots-v3.css';
import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Breadcrumb } from '@/components/v2/V2Breadcrumb';
import { V2SpotRow } from '@/components/v2/V2Cards';
import { KkArt } from '@/components/kk/KkArt';
import { KkAddToHomeCard } from '@/components/kk/KkAddToHomeCard';
import { KkFooter } from '@/components/kk/KkFooter';
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
    title: '子連れ人気スポットランキング｜今みんなが見ている遊び場',
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

      <div className="spots-v3">
        <V2Breadcrumb items={[{ label: 'ホーム', href: '/' }, { label: '人気ランキング' }]} />
        <div className="sv3-head">
          {/* 見出しは装飾（王冠アイコン）を付けず、文字と余白だけで成立させる（docs §2-1） */}
          <h1 className="sv3-h1">人気スポットランキング</h1>
          <p className="sv3-lead">
            {isLive
              ? 'いま子連れ家族に見られているおでかけスポットを、直近1週間の閲覧数をもとに集計しました。'
              : '0〜6歳の子連れで定番の人気おでかけスポットを編集部が厳選しました。'}
          </p>
        </div>

        {/* 年齢タブ */}
        <div className="sv3-tabs kk-chips">
          {AGE_TABS.map((t) => {
            const on = age === t.value;
            return (
              <Link
                key={t.label}
                href={buildHref({ age: t.value ?? null })}
                className={'kk-chip' + (on ? ' on' : '')}
                scroll={false}
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        {/* エリアフィルタ */}
        <div className="sv3-facet">
          <p className="sv3-facet-lab">エリア</p>
          <div className="kk-chips">
            <Link
              href={buildHref({ area: null })}
              className={'kk-chip' + (!area ? ' on' : '')}
              scroll={false}
            >
              全国
            </Link>
            {areaOpts.map((a) => (
              <Link
                key={a}
                href={buildHref({ area: area === a ? null : a })}
                className={'kk-chip' + (area === a ? ' on' : '')}
                scroll={false}
              >
                {getAreaName(a)}
              </Link>
            ))}
          </div>
        </div>

        {/* 見出しタグは元の div のまま（SEO照合のため h2 にしない） */}
        <div className="sv3-scope">
          <div className="sv3-scope-title">{scopeLabel}のランキング</div>
          <span className="sv3-scope-count">{ranking.length}</span>
        </div>

        {ranking.length > 0 ? (
          <div className="sv3-rank">
            <div className="v2-vlist">
              {ranking.map((it, i) => (
                <Fragment key={it.slug}>
                  <V2SpotRow spot={spotToV2(it.spot, i)} rank={it.rank} href={`/spot/${it.slug}`} />
                  {i === 4 && (
                    <div className="v2-section sv3-ad">
                      <AdSlot placement="article-mid" />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        ) : (
          <div className="sv3-empty">
            <span className="sv3-empty-art">
              <KkArt name="popular" size={56} />
            </span>
            <p className="sv3-empty-title">
              条件に合うスポットが
              <br />
              見つかりませんでした
            </p>
            <p className="sv3-empty-sub">エリアや年齢の条件をへらしてお試しください。</p>
          </div>
        )}

        <KkAddToHomeCard placement="spots" />
        <KkFooter />
      </div>
    </V2Frame>
  );
}
