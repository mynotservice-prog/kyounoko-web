import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2SpotRow } from '@/components/v2/V2Cards';
import { V2SectionHead } from '@/components/v2/V2Base';
import { V2Icon, V2_ACCENT, type V2IconName } from '@/components/v2/V2Icon';
import { SPOT_CATEGORY_LABEL } from '@/lib/spots';
import { spotToV2 } from '@/lib/v2-adapters';
import { AdSlot } from '@/components/ads/AdSlot';
import { BROWSE_CATEGORIES, spotsByCategory } from '@/lib/spot-browse';

export const revalidate = 3600;

/** 各カテゴリセクションで見せる代表件数（残りは「すべて見る」でカテゴリ全件ページへ）。 */
const PREVIEW = 12;

export const metadata: Metadata = {
  title: '子連れスポット一覧｜公園・水族館・動物園・室内遊び場まで【きょうのこスポットDB】',
  description:
    '0〜6歳の子ども連れで楽しめるスポット400件以上を、カテゴリ別（公園・水族館・動物園・室内遊び場・遊園地・牧場）に検索できる子連れスポットDB。',
  alternates: { canonical: '/spots' },
  openGraph: {
    title: '子連れスポット一覧｜きょうのこスポットDB',
    description: '0〜6歳子連れで使える公園・水族館・動物園・室内遊び場 400件以上',
    url: 'https://kyounoko.jp/spots',
    images: [{ url: '/img/ogp-spot.webp', width: 1200, height: 630 }],
  },
};

export default function SpotsPage() {
  // カテゴリごとに全件を取得（人気優先ソート済み）。件数表示・全件ページと一致させる。
  const byCat = BROWSE_CATEGORIES.map((c) => ({ c, list: spotsByCategory(c.id) }));
  const totalCount = byCat.reduce((n, x) => n + x.list.length, 0);

  return (
    <V2Frame header="sub" active="area">
      <div className="v2-page-head" style={{ paddingTop: 6 }}>
        <h1
          className="v2-page-h1"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <V2Icon name="pin" size={24} color="var(--v2-orange)" />
          子連れスポットを探す
        </h1>
        <p className="v2-page-lead">
          0〜6歳の子どもと楽しめるスポットを{totalCount}件以上、カテゴリ別にまとめました。
        </p>
      </div>

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

      {/* AdSense */}
      <div className="v2-section" style={{ marginTop: 24 }}>
        <AdSlot placement="home-below-finder" />
      </div>

      {/* カテゴリ別セクション（代表12件 + すべて見る） */}
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
                <Link
                  href={`/spots/${c.id}`}
                  className="v2-more-btn"
                  style={{
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
                  }}
                >
                  {c.label}をすべて見る（全{list.length}件）
                  <V2Icon name="arrow-right" size={14} />
                </Link>
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
