import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Img, V2SectionHead, V2Tag } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import {
  EVENTS,
  eventHeroImage,
  formatEventPeriod,
  getEventBySlug,
  getEventsByArea,
  isEventEnded,
} from '@/lib/events';
import { getRuntimeEventOverrides } from '@/lib/event-overrides';
import { getAllSpotsWithSlug, isSpotIndexable } from '@/lib/spots';
import { spotToV2 } from '@/lib/v2-adapters';
import { AdSlot } from '@/components/ads/AdSlot';

export const revalidate = 86400;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ev = getEventBySlug(slug, await getRuntimeEventOverrides());
  if (!ev) return { title: 'イベントが見つかりません' };
  const ended = isEventEnded(ev);
  return {
    title: `${ended ? '【終了】' : ''}${ev.title}｜${formatEventPeriod(ev)} ${ev.venue}`,
    description: ev.lede,
    alternates: { canonical: `/event/${slug}` },
    // 会期終了後は検索対象から外す（古い情報の流入を防ぐ）。リンク切れ回避のためページ自体は残す。
    robots: ended ? { index: false, follow: true } : undefined,
    openGraph: {
      title: ev.title,
      description: ev.lede,
      url: `https://kyounoko.jp/event/${slug}`,
      type: 'article',
      images: [{ url: eventHeroImage(ev), width: 1200, height: 630 }],
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const ev = getEventBySlug(slug, await getRuntimeEventOverrides());
  if (!ev) notFound();

  const ended = isEventEnded(ev);

  // 同エリアの他イベント（終了済みは除外し、開催中・これからのものを優先）
  const sameArea = getEventsByArea(ev.area)
    .filter((e) => e.slug !== slug && !isEventEnded(e))
    .slice(0, 4);

  // 会場周辺の子連れスポット（一次データ）。
  // 同一エリア内のスポットのうち、会場の市区町村と一致するものを優先して提示する。
  // 「イベントのついでに寄れる実在スポット」を編集部の確認済みデータから案内する。
  const nearbySpots = (() => {
    const inArea = getAllSpotsWithSlug().filter(
      (x) => x.area === ev.area && isSpotIndexable(x.spot),
    );
    const cityMatch = ev.city
      ? inArea.filter((x) => (x.spot.ward ?? x.spot.city ?? '').includes(ev.city as string))
      : [];
    const rest = inArea.filter((x) => !cityMatch.includes(x));
    return [...cityMatch, ...rest].slice(0, 6);
  })();

  // offers は Google Event の推奨項目。欠落すると Search Console が「offers がありません」を警告する。
  // 価格が自由文（「大人 2,000円 子供 1,000円」等）でも offers 自体は必ず提示する。
  const eventOffer = (() => {
    const url = ev.officialUrl || `https://kyounoko.jp/event/${slug}`;
    const priceText = ev.price ?? '';
    const isFree = /無料|入場無料/.test(priceText) && !/\d/.test(priceText);
    const nums = (priceText.match(/\d[\d,]*/g) ?? [])
      .map((n) => Number(n.replace(/,/g, '')))
      .filter((n) => Number.isFinite(n) && n > 0);
    // 複数金額（大人/子供など）→ AggregateOffer で範囲を提示
    if (nums.length >= 2) {
      return {
        '@type': 'AggregateOffer',
        priceCurrency: 'JPY',
        lowPrice: String(Math.min(...nums)),
        highPrice: String(Math.max(...nums)),
        availability: 'https://schema.org/InStock',
        validFrom: ev.startDate,
        url,
      };
    }
    const price = isFree ? '0' : nums.length === 1 ? String(nums[0]) : undefined;
    return {
      '@type': 'Offer',
      ...(price !== undefined ? { price, priceCurrency: 'JPY' } : {}),
      availability: 'https://schema.org/InStock',
      validFrom: ev.startDate,
      url,
    };
  })();

  // JSON-LD: Event
  const jsonLdEvent = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: ev.title,
    description: ev.lede,
    startDate: ev.startDate,
    endDate: ev.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: ev.venue,
      address: ev.city ? { '@type': 'PostalAddress', addressLocality: ev.city, addressCountry: 'JP' } : undefined,
    },
    offers: eventOffer,
    image: [`https://kyounoko.jp${eventHeroImage(ev)}`],
    url: `https://kyounoko.jp/event/${slug}`,
    isFamilyFriendly: true,
  };
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: 'イベント', item: 'https://kyounoko.jp/events' },
      { '@type': 'ListItem', position: 3, name: ev.title },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdEvent) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

      <V2Frame header="sub" active="events" backHref="/events">
        {/* Hero */}
        <div className="v2-article-hero" style={{ height: 220 }}>
          <V2Img
            src={eventHeroImage(ev)}
            seed={ev.slug}
            alt={ev.title}
          />
          <div className="v2-article-hero-grad"></div>
          <span className="v2-article-hero-cat">イベント</span>
          <h1 className="v2-fa-hero-title" style={{ margin: 0, fontSize: 'inherit', fontWeight: 'inherit' }}>{ev.title}</h1>
        </div>

        <div className="v2-page-head" style={{ paddingTop: 16 }}>
          {ended && (
            <div
              style={{
                background: 'var(--v2-ink-mute, #f3f3f3)',
                border: '1px solid var(--v2-line)',
                borderRadius: 'var(--v2-r-card)',
                padding: '12px 14px',
                marginBottom: 12,
                fontSize: 13,
                color: 'var(--v2-ink-sub)',
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: 'var(--v2-ink)' }}>このイベントは終了しました。</strong>
              <br />
              来年も開催される場合があります。最新情報は
              {ev.officialUrl ? (
                <a href={ev.officialUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--v2-orange-deep)', fontWeight: 700 }}>公式サイト</a>
              ) : (
                '公式サイト'
              )}
              でご確認ください。今ひらいている近くのイベントは{' '}
              <Link href="/events" style={{ color: 'var(--v2-orange-deep)', fontWeight: 700 }}>イベント一覧</Link>
              から探せます。
            </div>
          )}
          <div
            style={{
              display: 'inline-block',
              fontSize: 13,
              fontWeight: 800,
              color: ended ? 'var(--v2-ink-mute)' : 'var(--v2-orange-deep)',
              background: ended ? 'transparent' : 'var(--v2-orange-soft)',
              padding: '6px 12px',
              borderRadius: 999,
              marginBottom: 10,
            }}
          >
            📅 {formatEventPeriod(ev)}{ended ? '（終了）' : ''}
          </div>
          <p className="v2-page-lead" style={{ marginTop: 8 }}>
            {ev.lede}
          </p>
        </div>

        {/* 基本情報 */}
        <div className="v2-section">
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--v2-line)',
              borderRadius: 'var(--v2-r-card)',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <V2Icon name="pin" size={18} color="var(--v2-orange)" />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--v2-ink-mute)' }}>
                  会場
                </div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{ev.venue}</div>
                {ev.city && (
                  <div style={{ fontSize: 12, color: 'var(--v2-ink-sub)' }}>
                    {ev.city}
                  </div>
                )}
              </div>
            </div>
            {ev.ageLabel && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <V2Icon name="baby" size={18} color="var(--v2-c-event)" />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--v2-ink-mute)' }}>
                    対象年齢
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{ev.ageLabel}</div>
                </div>
              </div>
            )}
            {ev.price && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <V2Icon name="yen" size={18} color="var(--v2-c-free)" />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--v2-ink-mute)' }}>
                    料金
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{ev.price}</div>
                </div>
              </div>
            )}
            {ev.officialUrl && (
              <a
                href={ev.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 4,
                  padding: 12,
                  border: '1.5px solid var(--v2-orange)',
                  borderRadius: 12,
                  fontSize: 13.5,
                  fontWeight: 800,
                  color: 'var(--v2-orange-deep)',
                }}
              >
                <V2Icon name="link" size={15} color="var(--v2-orange)" />
                公式サイトで詳細を見る
              </a>
            )}
          </div>
        </div>

        {/* 編集部メモ */}
        {ev.note && (
          <div className="v2-section" style={{ marginTop: 16 }}>
            <div
              style={{
                background: 'var(--v2-cream)',
                borderRadius: 'var(--v2-r-card)',
                padding: '14px 16px',
                display: 'flex',
                gap: 10,
              }}
            >
              <V2Icon name="sparkle" size={20} color="var(--v2-orange)" />
              <div style={{ fontSize: 13, color: 'var(--v2-ink-soft)', lineHeight: 1.65 }}>
                <strong style={{ color: 'var(--v2-ink)' }}>編集部のひとこと</strong>
                <br />
                {ev.note}
              </div>
            </div>
          </div>
        )}

        {/* タグ */}
        {ev.tags && ev.tags.length > 0 && (
          <div className="v2-section" style={{ marginTop: 12 }}>
            <div className="v2-tag-row">
              {ev.tags.map((t) => (
                <V2Tag key={t} label={t} tone="feat" />
              ))}
            </div>
          </div>
        )}

        {/* 会場周辺の子連れスポット（一次データ） */}
        {nearbySpots.length > 0 && (
          <>
            <V2SectionHead
              title={`${ev.city ?? '会場周辺'}でついでに寄れる子連れスポット`}
              moreHref="/spots"
            />
            <p
              style={{
                fontSize: 12.5,
                color: 'var(--v2-ink-sub)',
                lineHeight: 1.7,
                margin: '0 0 12px',
                padding: '0 2px',
              }}
            >
              イベントの前後に立ち寄りやすい、編集部が設備・料金を確認した
              {ev.city ?? 'この'}エリアの子連れスポットです。授乳室やおむつ替え台の有無もスポットページで確認できます。
            </p>
            <div className="v2-hscroll">
              {nearbySpots.map((x, i) => {
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
                    <div className="v2-card-v-loc" style={{ margin: 0 }}>
                      <V2Icon name="pin" size={12} color="var(--v2-orange)" />
                      {x.spot.ward || x.spot.city}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* AdSense */}
        <div className="v2-section" style={{ marginTop: 24 }}>
          <AdSlot placement="article-mid" />
        </div>

        {/* 同エリアの他イベント */}
        {sameArea.length > 0 && (
          <>
            <V2SectionHead title="同じエリアの他のイベント" moreHref="/events" />
            <div className="v2-vlist">
              {sameArea.map((e) => (
                <Link key={e.slug} href={`/event/${e.slug}`} className="v2-art-row">
                  <div
                    className="v2-imgwrap r"
                    style={{ width: 76, minWidth: 76, height: 60 }}
                  >
                    <V2Img src={eventHeroImage(e)} seed={e.slug} alt={e.title} />
                  </div>
                  <div className="v2-art-body">
                    <div className="v2-art-title">{e.title}</div>
                    <div className="v2-art-sub">
                      {formatEventPeriod(e)} ／ {e.venue}
                    </div>
                  </div>
                  <V2Icon name="chevron-right" size={20} color="#cfcfcf" />
                </Link>
              ))}
            </div>
          </>
        )}

        <div style={{ height: 24 }}></div>
      </V2Frame>
    </>
  );
}
