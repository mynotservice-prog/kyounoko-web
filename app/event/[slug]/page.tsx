import '@/app/styles/events-v3.css';
import type { Metadata } from 'next';
import { KkIcon } from '@/components/kk/KkIcon';
import { KkSectionTitle } from '@/components/kk/KkSectionTitle';
import { KkInfoTable, type KkInfoRow } from '@/components/kk/KkInfoTable';
import { KkLineCard } from '@/components/kk/KkLineCard';
import { KkAddToHomeCard } from '@/components/kk/KkAddToHomeCard';
import { KkFooter } from '@/components/kk/KkFooter';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Img } from '@/components/v2/V2Base';
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
import { buildEventDayPlan, isVenueSelf } from '@/lib/event-day-plan';
import { EventDayPlanSection } from '@/components/event/EventDayPlanSection';
import { getAreaName } from '@/lib/area';
import { isSpotAvailableNow } from '@/lib/spot-temp-closed';
import { INDEXABLE_ROBOTS } from '@/lib/robots-meta';

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
    robots: ended ? { index: false, follow: true } : INDEXABLE_ROBOTS,
    openGraph: {
      title: ev.title,
      description: ev.lede,
      url: `https://kyounoko.jp/event/${slug}`,
      type: 'article',
      images: [{ url: eventHeroImage(ev), width: 1200, height: 630 }],
    },
  };
}

/**
 * 長い説明文を段落に割る（/spot/[slug] と同じ方式）。
 * **文字は1文字も足さない・削らない**。句点の直後だけで区切り、2文ずつ1段落にまとめる。
 */
function toParagraphs(text: string, per = 2): string[] {
  const sentences = text
    .split(/(?<=。)/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length <= 1) return [text];
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += per) out.push(sentences.slice(i, i + per).join(''));
  return out;
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
  // イベント起点の1日モデルコース（一次データのみ・終了イベントでは出さない）
  const dayPlan = ended ? null : buildEventDayPlan(ev);
  const planUsed = new Set(dayPlan?.usedSlugs ?? []);

  const { spots: nearbySpots, cityMatched: nearbyCityMatched } = (() => {
    const inArea = getAllSpotsWithSlug().filter(
      (x) =>
        x.area === ev.area &&
        isSpotIndexable(x.spot) &&
        !planUsed.has(x.slug) &&
        isSpotAvailableNow(x.spot.name) &&
        // 会場そのものを「ついでに寄れるスポット」として出さない
        !isVenueSelf(ev, x.spot),
    );
    const cityMatch = ev.city
      ? inArea.filter((x) => (x.spot.ward ?? x.spot.city ?? '').includes(ev.city as string))
      : [];
    const rest = inArea.filter((x) => !cityMatch.includes(x));
    return {
      spots: [...cityMatch, ...rest].slice(0, 6),
      // 市区町村一致が無いのに「○○区で」と見出しに書かない（実際はエリア内の別の市区町村）
      cityMatched: cityMatch.length > 0,
    };
  })();
  const nearbyAreaLabel = nearbyCityMatched && ev.city ? ev.city : getAreaName(ev.area);

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
    // priceCurrency は当サイトのイベントは常に円建てなので価格が数値化できなくても必ず付与する。
    // （「有料」「公式サイトで確認」等の非数値価格でも Google の priceCurrency 欠落警告を出さない）
    return {
      '@type': 'Offer',
      priceCurrency: 'JPY',
      ...(price !== undefined ? { price } : {}),
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
    image: [
      eventHeroImage(ev).startsWith('http')
        ? eventHeroImage(ev)
        : `https://kyounoko.jp${eventHeroImage(ev)}`,
    ],
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

  // 基本情報（罫線で組んだ表 = KkInfoTable）。既存データにある項目だけを出す。
  const infoRows: KkInfoRow[] = [
    {
      icon: 'pin',
      label: '会場',
      value: ev.city ? (
        <>
          {ev.venue}
          <br />
          {ev.city}
        </>
      ) : (
        ev.venue
      ),
    },
    ...(ev.ageLabel ? [{ icon: 'baby' as const, label: '対象年齢', value: ev.ageLabel }] : []),
    ...(ev.price ? [{ icon: 'yen' as const, label: '料金', value: ev.price }] : []),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdEvent) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

      <V2Frame header="sub" active="events" backHref="/events">
        <div className="events-v3 ev3-detail">

        {/* パンくず（JSON-LD の BreadcrumbList と同じ階層） */}
        <nav className="ev3-crumb" aria-label="パンくず">
          <Link href="/">ホーム</Link>
          <KkIcon name="chevron-right" size={11} />
          <Link href="/events">イベント</Link>
          <KkIcon name="chevron-right" size={11} />
          <span className="cur">{ev.title}</span>
        </nav>

        {/* 見出し＋会期・会場＋メイン写真。写真に文字を重ねない（PCでは横並び） */}
        <div className="ev3-top">
          <div className="ev3-head">
            <span className="ev3-eyebrow">イベント</span>
            <h1 className="ev3-h1">{ev.title}</h1>
            <div className={'ev3-period' + (ended ? ' ended' : '')}>
              <KkIcon name="calendar" size={15} sw={2} />
              <span>{formatEventPeriod(ev)}{ended ? '（終了）' : ''}</span>
            </div>
            <div className="ev3-period ev3-venue">
              <KkIcon name="pin" size={15} sw={2} />
              <span>{ev.venue}</span>
            </div>
          </div>

          <div className="ev3-hero">
            <div className="ev3-hero-img">
              <V2Img
                src={eventHeroImage(ev)}
                seed={ev.slug}
                alt={ev.title}
                priority
              />
            </div>
          </div>

          {/* 終了のお知らせ（小さなステータスなので枠を許す。文言は従来どおり） */}
          {ended && (
            <div className="ev3-banner" role="status">
              <strong>このイベントは終了しました。</strong>
              <br />
              来年も開催される場合があります。最新情報は
              {ev.officialUrl ? (
                <a href={ev.officialUrl} target="_blank" rel="noopener noreferrer">公式サイト</a>
              ) : (
                '公式サイト'
              )}
              でご確認ください。今ひらいている近くのイベントは{' '}
              <Link href="/events">イベント一覧</Link>
              から探せます。
            </div>
          )}

          {/* 導入文（既存の lede をそのまま。文を段落に割って読みやすくする） */}
          <div className="ev3-body">
            {toParagraphs(ev.lede).map((p, i) => (
              <p key={i} className="ev3-lede">{p}</p>
            ))}
          </div>
        </div>

        {/* 基本情報（罫線で組んだデータテーブル）＋公式サイト */}
        <div className="kk-sec ev3-sec">
          <KkSectionTitle as="div" title="基本情報" />
          <div className="ev3-measure">
            <KkInfoTable rows={infoRows} />
            {ev.officialUrl && (
              <a
                href={ev.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="kk-btn block ev3-official"
              >
                <KkIcon name="link" size={16} />
                公式サイトで詳細を見る
                <span className="ev3-official-arrow">
                  <KkIcon name="arrow-right" size={15} />
                </span>
              </a>
            )}
          </div>
        </div>

        {/* 編集部メモ（塗り箱にしない。小さなラベル＋本文） */}
        {ev.note && (
          <div className="kk-sec ev3-sec">
            <div className="ev3-note ev3-measure">
              <span className="ev3-note-lab">
                <KkIcon name="edit" size={14} />
                編集部のひとこと
              </span>
              <p className="ev3-note-body">{ev.note}</p>
            </div>
          </div>
        )}

        {/* タグ */}
        {ev.tags && ev.tags.length > 0 && (
          <div className="kk-sec ev3-sec">
            <div className="kk-chips">
              {ev.tags.map((t) => (
                <span key={t} className="kk-chip plain">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* イベント起点の1日モデルコース（一次データのみ） */}
        {dayPlan && (
          <EventDayPlanSection plan={dayPlan} cityLabel={ev.city ?? getAreaName(ev.area)} />
        )}

        {/* 会場周辺の子連れスポット（一次データ） */}
        {nearbySpots.length > 0 && (
          <div className="kk-sec ev3-sec">
            <KkSectionTitle
              as="div"
              title={`${nearbyAreaLabel}でついでに寄れる子連れスポット`}
              moreHref="/spots"
              more="もっと見る"
            />
            <p className="ev3-lead-note">
              イベントの前後に立ち寄りやすい、編集部が設備・料金を確認した
              {nearbyAreaLabel}エリアの子連れスポットです。授乳室やおむつ替え台の有無もスポットページで確認できます。
            </p>
            <div className="ev3-nearby">
              {nearbySpots.map((x, i) => {
                const v = spotToV2(x.spot, i);
                return (
                  <Link key={x.slug} href={`/spot/${x.slug}`} className="ev3-nb">
                    <span className="ev3-nb-img">
                      <V2Img src={v.img} seed={x.slug} alt={x.spot.name} />
                    </span>
                    <span className="ev3-nb-name">{x.spot.name}</span>
                    <span className="ev3-nb-loc">
                      <KkIcon name="pin" size={12} />
                      {x.spot.ward || x.spot.city}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* AdSense */}
        <div className="v2-section" style={{ marginTop: 24 }}>
          <AdSlot placement="article-mid" />
        </div>

        {/* 同エリアの他イベント */}
        {sameArea.length > 0 && (
          <div className="kk-sec ev3-sec">
            <KkSectionTitle as="div" title="同じエリアの他のイベント" moreHref="/events" more="もっと見る" />
            <div className="kk-rows">
              {sameArea.map((e) => (
                <Link key={e.slug} href={`/event/${e.slug}`} className="kk-row">
                  <span className="kk-row-thumb">
                    <V2Img src={eventHeroImage(e)} seed={e.slug} alt={e.title} />
                  </span>
                  <span className="kk-row-body">
                    <span className="kk-row-title">{e.title}</span>
                    <span className="kk-row-sub">
                      {formatEventPeriod(e)} ／ {e.venue}
                    </span>
                  </span>
                  <span className="kk-row-arrow">
                    <KkIcon name="arrow-right" size={16} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 回遊・再訪モジュール（リニューアル2026-09） */}
        <KkLineCard placement="events" />
        <KkAddToHomeCard placement="events" />
        <KkFooter />
        </div>
      </V2Frame>
    </>
  );
}
