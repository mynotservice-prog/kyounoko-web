import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2SpotRow } from '@/components/v2/V2Cards';
import { V2SectionHead } from '@/components/v2/V2Base';
import { V2Icon, V2_ACCENT } from '@/components/v2/V2Icon';
import { getAllSpotsWithSlug, SPOT_CATEGORY_LABEL } from '@/lib/spots';
import type { Spot, SpotCategory } from '@/lib/spots';
import { spotToV2 } from '@/lib/v2-adapters';
import { AdSlot } from '@/components/ads/AdSlot';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: '子連れスポット一覧｜公園・水族館・動物園・室内遊び場まで【きょうのこスポットDB】',
  description:
    '0〜6歳の子ども連れで楽しめるスポット400件以上を、カテゴリ別（公園・水族館・動物園・室内遊び場・遊園地）に検索できる子連れスポットDB。',
  alternates: { canonical: '/spots' },
  openGraph: {
    title: '子連れスポット一覧｜きょうのこスポットDB',
    description: '0〜6歳子連れで使える公園・水族館・動物園・室内遊び場 400件以上',
    url: 'https://kyounoko.jp/spots',
    images: [{ url: '/img/ogp-spot.webp', width: 1200, height: 630 }],
  },
};

/**
 * 一覧表示対象の判定。最低限の情報（名前 + 説明 or 場所）があれば表示する。
 * 以前は score >= 3 と厳しすぎて多くのスポットが落ちていたため緩和。
 */
function isIndexable(s: Spot): boolean {
  if (!s.name) return false;
  // ノートか、市区町村のいずれかがあれば一覧表示に値する
  return !!(s.note || s.ward || s.city || s.nearestStation);
}

const FEATURED_CATEGORIES: { id: SpotCategory; accent: keyof typeof V2_ACCENT; label: string }[] = [
  { id: 'park', accent: 'indoor', label: '公園・自然' },
  { id: 'zoo', accent: 'purple', label: '動物園' },
  { id: 'aquarium', accent: 'rain', label: '水族館' },
  { id: 'museum', accent: 'purple', label: '博物館・科学館' },
  { id: 'indoor', accent: 'lunch', label: '室内遊び場' },
  { id: 'amusement', accent: 'event', label: '遊園地' },
];

export default function SpotsPage() {
  const allSpots = getAllSpotsWithSlug().filter((x) => isIndexable(x.spot));
  // 人気スポット優先で並び替え
  const sorted = [...allSpots].sort((a, b) => {
    if (a.spot.popular && !b.spot.popular) return -1;
    if (!a.spot.popular && b.spot.popular) return 1;
    return 0;
  });
  // カテゴリ別表示なので全件を渡して各カテゴリで12件ずつ表示する
  const displayed = sorted;
  const totalCount = allSpots.length;

  return (
    <V2Frame header="sub" active="search">
      <div className="v2-page-head" style={{ paddingTop: 6 }}>
        <h1
          className="v2-page-h1"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <V2Icon name="pin" size={24} color="var(--v2-orange)" />
          子連れスポット一覧
        </h1>
        <p className="v2-page-lead">
          0〜6歳の子どもと楽しめるスポットを{totalCount}件以上、カテゴリ別にまとめました。
        </p>
      </div>

      {/* カテゴリショートカット */}
      <V2SectionHead title="カテゴリから探す" more="" />
      <div className="v2-quick-grid">
        {FEATURED_CATEGORIES.map((c) => {
          const a = V2_ACCENT[c.accent];
          return (
            <Link key={c.id} href={`#cat-${c.id}`} className="v2-quick-item">
              <span className="v2-quick-ico" style={{ background: a.bg }}>
                <V2Icon
                  name={
                    c.id === 'park' ? 'tree'
                    : c.id === 'zoo' ? 'leaf'
                    : c.id === 'aquarium' ? 'umbrella'
                    : c.id === 'museum' ? 'book'
                    : c.id === 'indoor' ? 'house'
                    : 'party'
                  }
                  size={26}
                  color={a.c}
                />
              </span>
              <span className="v2-quick-label">{c.label}</span>
            </Link>
          );
        })}
      </div>

      {/* AdSense */}
      <div className="v2-section" style={{ marginTop: 24 }}>
        <AdSlot placement="home-below-finder" />
      </div>

      {/* カテゴリ別セクション */}
      {FEATURED_CATEGORIES.map((c) => {
        const list = displayed.filter((x) => x.spot.category === c.id);
        if (!list.length) return null;
        return (
          <section key={c.id} id={`cat-${c.id}`}>
            <V2SectionHead title={`${SPOT_CATEGORY_LABEL[c.id]}（${c.label}）`} more="" />
            <div className="v2-vlist">
              {list.slice(0, 12).map((x, i) => {
                const v = spotToV2(x.spot, i);
                return (
                  <V2SpotRow
                    key={x.slug}
                    spot={v}
                    href={`/spot/${x.slug}`}
                  />
                );
              })}
            </div>
            {list.length > 12 && (
              <div className="v2-section" style={{ marginTop: 12, textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: 'var(--v2-ink-mute)' }}>
                  {SPOT_CATEGORY_LABEL[c.id]} は他に {list.length - 12} 件あります
                </p>
              </div>
            )}
          </section>
        );
      })}

      <div className="v2-section" style={{ marginTop: 24, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--v2-ink-mute)' }}>
          全{totalCount}件のスポットを掲載中
        </p>
      </div>

      <div style={{ height: 24 }}></div>
    </V2Frame>
  );
}
