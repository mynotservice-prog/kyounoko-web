import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2SpotRow } from '@/components/v2/V2Cards';
import { V2Icon, type V2IconName, V2_ACCENT } from '@/components/v2/V2Icon';
import { spotToV2 } from '@/lib/v2-adapters';
import { AdSlot } from '@/components/ads/AdSlot';
import { SpotListReveal } from '@/components/spots/SpotListReveal';
import { SpotFilterBar } from '@/components/spots/SpotFilterBar';
import { BROWSE_CATEGORIES, getBrowseCategory, spotsByCategory } from '@/lib/spot-browse';
import { getRuntimeSpotOverrides } from '@/lib/spot-overrides';
import { parseFilters, hasActiveFilters, matchesFilters, sortSpots, toFilterable } from '@/lib/spot-filter';

export const revalidate = 3600;

/** 初期表示件数（残りは「もっと見る」で開く。全件は HTML に含まれる）。 */
const INITIAL = 24;

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
  const title = `${c.label}の子連れスポット一覧（全${count}件）｜きょうのこ`;
  const description = `0〜6歳の子連れで楽しめる${c.label}のスポットを全${count}件掲載。最寄り駅・設備・年齢の目安つきで、今日のおでかけ先を探せます。`;
  return {
    title,
    description,
    // SEO §2-2: フィルタ/並び替えのクエリ変種は noindex,follow ＋ canonical→クリーンURL。
    robots: filtered ? { index: false, follow: true } : undefined,
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
  const accent = V2_ACCENT[c.accent as keyof typeof V2_ACCENT] ?? V2_ACCENT.purple;

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
      <div className="v2-page-head" style={{ paddingTop: 6 }}>
        <nav aria-label="パンくず" style={{ fontSize: 12, marginBottom: 4 }}>
          <Link href="/spots" className="v2-sec-more" style={{ color: 'var(--v2-ink-mute)' }}>
            子連れスポットを探す
          </Link>
          <span style={{ color: 'var(--v2-ink-mute)' }}> ／ {c.label}</span>
        </nav>
        <h1 className="v2-page-h1" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="v2-quick-ico" style={{ background: accent.bg, width: 32, height: 32 }}>
            <V2Icon name={c.icon as V2IconName} size={20} color={accent.c} />
          </span>
          {c.label}のスポット
        </h1>
        <p className="v2-page-lead">
          {catSpots.length}件中 <strong>{list.length}件</strong> を表示中。タップで詳細・最寄り駅・設備が見られます。
        </p>
      </div>

      {/* 絞り込み・並び替え（P0-3b/c） */}
      <div className="v2-section" style={{ marginTop: 4 }}>
        <SpotFilterBar spots={filterable} initial={filters} basePath={`/spots/${c.id}`} />
      </div>

      {list.length === 0 ? (
        // 0件回避：空リストを出さず、条件緩和導線を出す（画面仕様 §3-6）
        <div className="v2-section" style={{ marginTop: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
            条件に合うスポットが見つかりませんでした
          </p>
          <p style={{ fontSize: 13, color: 'var(--v2-ink-mute)', marginBottom: 12, lineHeight: 1.7 }}>
            設備や料金の条件を1つ外すと見つかりやすくなります。
          </p>
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
              background: 'var(--v2-card, #fff)',
              color: 'var(--v2-ink)',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            条件をリセットして全{catSpots.length}件を見る
          </Link>
        </div>
      ) : (
        <>
          <div className="v2-vlist" style={{ marginTop: 8 }}>
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
                  style={{ padding: '6px 12px', borderRadius: 999, border: '1px solid var(--v2-line)', fontSize: 13 }}
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
    </>
  );
}
