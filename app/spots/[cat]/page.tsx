import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2SpotRow } from '@/components/v2/V2Cards';
import { V2Icon, type V2IconName, V2_ACCENT } from '@/components/v2/V2Icon';
import { spotToV2 } from '@/lib/v2-adapters';
import { AdSlot } from '@/components/ads/AdSlot';
import { SpotListReveal } from '@/components/spots/SpotListReveal';
import {
  BROWSE_CATEGORIES,
  getBrowseCategory,
  spotsByCategory,
} from '@/lib/spot-browse';

export const revalidate = 3600;

/** 初期表示件数（残りは「もっと見る」で開く。全件は HTML に含まれる）。 */
const INITIAL = 24;

type Props = { params: Promise<{ cat: string }> };

// 生成対象は BROWSE_CATEGORIES のみ。restaurant 等はここでは 404（P1-1cで別扱い）。
export function generateStaticParams() {
  return BROWSE_CATEGORIES.map((c) => ({ cat: c.id }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cat } = await params;
  const c = getBrowseCategory(cat);
  if (!c) return {};
  const count = spotsByCategory(c.id).length;
  const title = `${c.label}の子連れスポット一覧（全${count}件）｜きょうのこ`;
  const description = `0〜6歳の子連れで楽しめる${c.label}のスポットを全${count}件掲載。最寄り駅・設備・年齢の目安つきで、今日のおでかけ先を探せます。`;
  return {
    title,
    description,
    alternates: { canonical: `/spots/${c.id}` },
    openGraph: {
      title,
      description,
      url: `https://kyounoko.jp/spots/${c.id}`,
      images: [{ url: '/img/ogp-spot.webp', width: 1200, height: 630 }],
    },
  };
}

export default async function SpotCategoryPage({ params }: Props) {
  const { cat } = await params;
  const c = getBrowseCategory(cat);
  if (!c) notFound();

  const list = spotsByCategory(c.id);
  const accent = V2_ACCENT[c.accent as keyof typeof V2_ACCENT] ?? V2_ACCENT.purple;
  const head = list.slice(0, INITIAL);
  const rest = list.slice(INITIAL);

  return (
    <V2Frame header="sub" backHref="/spots" active="area">
      <div className="v2-page-head" style={{ paddingTop: 6 }}>
        <nav aria-label="パンくず" style={{ fontSize: 12, marginBottom: 4 }}>
          <Link href="/spots" className="v2-sec-more" style={{ color: 'var(--v2-ink-mute)' }}>
            子連れスポットを探す
          </Link>
          <span style={{ color: 'var(--v2-ink-mute)' }}> ／ {c.label}</span>
        </nav>
        <h1
          className="v2-page-h1"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span
            className="v2-quick-ico"
            style={{ background: accent.bg, width: 32, height: 32 }}
          >
            <V2Icon name={c.icon as V2IconName} size={20} color={accent.c} />
          </span>
          {c.label}のスポット
        </h1>
        <p className="v2-page-lead">
          子連れで楽しめる{c.label}を全{list.length}件掲載中。タップで詳細・最寄り駅・設備が見られます。
        </p>
      </div>

      {list.length === 0 ? (
        <div className="v2-section" style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--v2-ink-mute)' }}>
            このカテゴリのスポットは準備中です。
          </p>
          <Link href="/spots" className="v2-sec-more" style={{ marginTop: 8, display: 'inline-block' }}>
            ほかのカテゴリを見る <V2Icon name="arrow-right" size={14} />
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
              <V2SpotRow
                key={x.slug}
                spot={spotToV2(x.spot, i + INITIAL)}
                href={`/spot/${x.slug}`}
              />
            ))}
          </SpotListReveal>

          <div className="v2-section" style={{ marginTop: 24 }}>
            <AdSlot placement="home-below-finder" />
          </div>

          {/* 他カテゴリへの回遊 */}
          <div className="v2-section" style={{ marginTop: 8 }}>
            <p style={{ fontSize: 12, color: 'var(--v2-ink-mute)', marginBottom: 8 }}>
              ほかのカテゴリから探す
            </p>
            <div className="v2-tag-row" style={{ flexWrap: 'wrap', gap: 8 }}>
              {BROWSE_CATEGORIES.filter((o) => o.id !== c.id).map((o) => (
                <Link
                  key={o.id}
                  href={`/spots/${o.id}`}
                  className="v2-sec-more"
                  style={{
                    padding: '6px 12px',
                    borderRadius: 999,
                    border: '1px solid var(--v2-line)',
                    fontSize: 13,
                  }}
                >
                  {o.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      <div style={{ height: 24 }}></div>
    </V2Frame>
  );
}
