import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Img, V2SectionHead, V2Tag } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import { V2EventCalendar } from '@/components/v2/V2EventCalendar';
import {
  EVENTS,
  EVENT_CATEGORY_LABELS,
  deadlineBadge,
  eventHeroImage,
  filterEvents,
  formatEventPeriod,
  getActiveEventAreas,
  getActiveEventCategories,
  getOngoingEvents,
  getThisMonthEvents,
  getThisWeekEvents,
  kidFriendliness,
  type EventCategory,
  type EventFilter,
} from '@/lib/events';
import { getAreaName, isValidArea, type AreaSlug } from '@/lib/area';
import { AdSlot } from '@/components/ads/AdSlot';
import { INDEXABLE_ROBOTS } from '@/lib/robots-meta';

export const revalidate = 3600;

type Props = {
  searchParams: Promise<{
    view?: string;
    area?: string;
    cat?: string;
    free?: string;
    soon?: string;
    baby?: string;
  }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  // SEO §2-2: 絞り込み/表示切替のクエリ変種（area/cat/free/soon/baby/view）は
  // /events の重複。canonical→/events に加えて noindex,follow を付け、Google が
  // 各パラメータ変種を個別インデックスしないようにする（/spots と同一方針）。
  const hasVariant = Boolean(
    (sp.area && sp.area !== 'all') || sp.cat || sp.free === '1' || sp.soon === '1' || sp.baby === '1' || sp.view,
  );
  return {
    title: '子連れで行ける今週のイベント一覧｜きょうのこ',
    description:
      '0〜6歳の子どもと一緒に楽しめる、今週・今月開催の子育てイベント情報。マルシェ・リトミック・ワークショップ・イルミネーションなど編集部が確認したイベントを掲載。',
    robots: hasVariant ? { index: false, follow: true } : INDEXABLE_ROBOTS,
    alternates: { canonical: '/events' },
  };
}

export default async function EventsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const isCalendar = sp.view === 'calendar';

  // フィルタ条件を searchParams から組み立てる
  const filter: EventFilter = {
    area: isValidArea(sp.area) && sp.area !== 'all' ? (sp.area as AreaSlug) : undefined,
    category: isEventCategory(sp.cat) ? sp.cat : undefined,
    free: sp.free === '1',
    soon: sp.soon === '1',
    baby: sp.baby === '1',
  };
  const hasFilter = Boolean(
    filter.area || filter.category || filter.free || filter.soon || filter.baby,
  );
  const filtered = hasFilter ? filterEvents(filter) : [];

  // フィルタUI用の選択肢（実在するエリア・カテゴリのみ）
  const areaOpts = getActiveEventAreas();
  const catOpts = getActiveEventCategories();

  // 現在の検索条件を保ったままチップのリンク先を組み立てる（同じ値なら解除＝トグル）
  const buildHref = (patch: Record<string, string | undefined>): string => {
    const params = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      area: filter.area,
      cat: filter.category,
      free: filter.free ? '1' : undefined,
      soon: filter.soon ? '1' : undefined,
      baby: filter.baby ? '1' : undefined,
      ...patch,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `/events?${qs}` : '/events';
  };

  const ongoing = getOngoingEvents();
  const week = getThisWeekEvents();
  const month = getThisMonthEvents();

  // カレンダー用：今月＋翌月分（最大2ヶ月先まで先送り表示できるよう、全イベントを渡す）
  const calEvents = EVENTS.map((e) => ({
    slug: e.slug,
    title: e.title,
    startDate: e.startDate,
    endDate: e.endDate,
    venue: e.venue,
    category: e.category,
    hero: eventHeroImage(e),
    ageLabel: e.ageLabel,
  }));

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: 'イベント', item: 'https://kyounoko.jp/events' },
    ],
  };

  return (
    <V2Frame header="sub" active="events" backHref="/">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      {/* イベント用ヒーロー — 支給D系 */}
      <div className="v2-ev-hero">
        <V2Img
          src="/v2/events/seasonal-summer.webp"
          seed="ev-hero"
          alt="今週のイベント"
        />
        <div className="v2-ev-hero-grad"></div>
        {/* breadcrumb（写真の上に重ねる。spot詳細と同じ .v2-sd-hero-crumb パターン） */}
        <div className="v2-sd-hero-crumb">
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>ホーム</Link>
          <V2Icon name="chevron-right" size={11} />
          <span className="cur">イベント</span>
        </div>
        <div className="v2-ev-hero-copy">
          <span className="v2-ev-hero-badge">
            <V2Icon name="calendar" size={14} color="#fff" />
            編集部が毎週チェック
          </span>
          <h1 className="v2-ev-hero-h1">今週のイベント</h1>
          <p className="v2-ev-hero-sub">
            親子で楽しめるイベントを、子連れOK度つきでご紹介。
          </p>
        </div>
      </div>

      {/* リスト/カレンダー切替タブ */}
      <div className="v2-ev-tabs">
        <Link
          href="/events"
          className={'v2-ev-tab' + (!isCalendar ? ' on' : '')}
          scroll={false}
        >
          <V2Icon
            name="menu"
            size={15}
            color={!isCalendar ? '#fff' : 'var(--v2-ink-mute)'}
          />
          リスト
        </Link>
        <Link
          href="/events?view=calendar"
          className={'v2-ev-tab' + (isCalendar ? ' on' : '')}
          scroll={false}
        >
          <V2Icon
            name="calendar"
            size={15}
            color={isCalendar ? '#fff' : 'var(--v2-ink-mute)'}
          />
          カレンダー
        </Link>
      </div>

      {isCalendar && <V2EventCalendar events={calEvents} />}

      {!isCalendar && (<>

      {/* 絞り込みフィルタ */}
      <div className="v2-ev-filters">
        <div className="v2-filter-group">
          <div className="v2-filter-label">エリア</div>
          <div className="v2-filter-opts">
            <Link
              href={buildHref({ area: undefined })}
              className={'v2-filter-opt' + (!filter.area ? ' on' : '')}
              scroll={false}
            >
              すべて
            </Link>
            {areaOpts.map((a) => (
              <Link
                key={a}
                href={buildHref({ area: filter.area === a ? undefined : a })}
                className={'v2-filter-opt' + (filter.area === a ? ' on' : '')}
                scroll={false}
              >
                {getAreaName(a)}
              </Link>
            ))}
          </div>
        </div>

        <div className="v2-filter-group">
          <div className="v2-filter-label">ジャンル</div>
          <div className="v2-filter-opts">
            <Link
              href={buildHref({ cat: undefined })}
              className={'v2-filter-opt' + (!filter.category ? ' on' : '')}
              scroll={false}
            >
              すべて
            </Link>
            {catOpts.map((c) => (
              <Link
                key={c}
                href={buildHref({ cat: filter.category === c ? undefined : c })}
                className={'v2-filter-opt' + (filter.category === c ? ' on' : '')}
                scroll={false}
              >
                {EVENT_CATEGORY_LABELS[c]}
              </Link>
            ))}
          </div>
        </div>

        <div className="v2-filter-group">
          <div className="v2-filter-label">こだわり</div>
          <div className="v2-filter-opts">
            <Link
              href={buildHref({ free: filter.free ? undefined : '1' })}
              className={'v2-filter-opt' + (filter.free ? ' on' : '')}
              scroll={false}
            >
              無料
            </Link>
            <Link
              href={buildHref({ soon: filter.soon ? undefined : '1' })}
              className={'v2-filter-opt' + (filter.soon ? ' on' : '')}
              scroll={false}
            >
              今週末・まもなく
            </Link>
            <Link
              href={buildHref({ baby: filter.baby ? undefined : '1' })}
              className={'v2-filter-opt' + (filter.baby ? ' on' : '')}
              scroll={false}
            >
              0歳OK
            </Link>
          </div>
        </div>
      </div>

      {/* 絞り込み結果 */}
      {hasFilter && (
        <>
          <div className="v2-sec-head">
            <div className="v2-sec-title">
              絞り込み結果<span className="v2-ev-count">{filtered.length}</span>
            </div>
            <Link href="/events" className="v2-sec-more" scroll={false}>
              条件をクリア
            </Link>
          </div>
          {filtered.length > 0 ? (
            <div className="v2-vlist">
              {filtered.map((e) => (
                <EventRow key={e.slug} e={e} />
              ))}
            </div>
          ) : (
            <div className="v2-empty-state">
              <div className="v2-empty-ill">
                <V2Icon name="calendar" size={40} color="#e9c9ac" />
              </div>
              <div className="v2-empty-title">
                条件に合うイベントが
                <br />
                見つかりませんでした
              </div>
              <div className="v2-empty-sub">
                条件をへらすと見つかりやすくなります。
              </div>
            </div>
          )}
          <div style={{ height: 24 }}></div>
        </>
      )}

      {!hasFilter && (<>

      {/* 開催中 */}
      {ongoing.length > 0 && (
        <>
          <div className="v2-sec-head">
            <div className="v2-sec-title">
              <span className="v2-ev-dot live"></span>
              開催中<span className="v2-ev-count">{ongoing.length}</span>
            </div>
          </div>
          <div className="v2-vlist">
            {ongoing.map((e) => (
              <EventRow key={e.slug} e={e} />
            ))}
          </div>
        </>
      )}

      <div className="v2-section" style={{ marginTop: 24 }}>
        <AdSlot placement="article-mid" />
      </div>

      {/* 今週・まもなく */}
      {week.length > ongoing.length && (
        <>
          <div className="v2-sec-head">
            <div className="v2-sec-title">
              <span className="v2-ev-dot soon"></span>
              今週末・まもなく
              <span className="v2-ev-count">
                {week.filter((e) => !ongoing.includes(e)).length}
              </span>
            </div>
          </div>
          <div className="v2-vlist">
            {week.filter((e) => !ongoing.includes(e)).map((e) => (
              <EventRow key={e.slug} e={e} />
            ))}
          </div>
        </>
      )}

      {/* 今月 */}
      {month.length > week.length && (
        <>
          <V2SectionHead title="今月のイベント" more="" />
          <div className="v2-vlist">
            {month.filter((e) => !week.includes(e)).map((e) => (
              <EventRow key={e.slug} e={e} />
            ))}
          </div>
        </>
      )}

      {EVENTS.length === 0 && (
        <div className="v2-empty-state">
          <div className="v2-empty-ill">
            <V2Icon name="calendar" size={40} color="#e9c9ac" />
          </div>
          <div className="v2-empty-title">
            イベント情報を
            <br />
            準備中です
          </div>
          <div className="v2-empty-sub">
            掲載までしばらくお待ちください。
          </div>
        </div>
      )}
      </>)}

      </>)}

      <div style={{ height: 24 }}></div>
    </V2Frame>
  );
}

function isEventCategory(v: unknown): v is EventCategory {
  return typeof v === 'string' && v in EVENT_CATEGORY_LABELS;
}

function EventRow({ e }: { e: import('@/lib/events').EventEntry }) {
  const dl = deadlineBadge(e);
  const kid = kidFriendliness(e);
  const kidColor =
    kid.mark === '◎'
      ? { bg: 'var(--v2-c-indoor-bg)', c: 'var(--v2-c-indoor)' }
      : kid.mark === '○'
      ? { bg: 'var(--v2-c-sun-bg)', c: 'var(--v2-c-sun)' }
      : { bg: '#EEEAE4', c: 'var(--v2-ink-mute)' };
  return (
    <Link href={`/event/${e.slug}`} className="v2-ev2-card">
      <div className="v2-ev2-img">
        <V2Img
          src={eventHeroImage(e)}
          seed={e.slug}
          alt={e.title}
        />
        <span className={`v2-ev2-dl ${dl.level}`}>{dl.text}</span>
        {e.startDate !== e.endDate && (
          <span className="v2-ev2-span">期間中</span>
        )}
      </div>
      <div className="v2-ev2-body">
        <div className="v2-ev2-cat">{EVENT_CATEGORY_LABELS[e.category]}</div>
        <div className="v2-ev2-name">{e.title}</div>
        <div className="v2-ev2-meta">
          <V2Icon name="calendar" size={13} color="var(--v2-orange)" />
          {formatEventPeriod(e)}
        </div>
        <div className="v2-ev2-meta">
          <V2Icon name="pin" size={13} color="var(--v2-orange)" />
          {e.venue}
        </div>
        <div className="v2-ev2-tags">
          {e.ageLabel && <V2Tag label={e.ageLabel} tone="age" />}
          <span
            className="v2-ev2-kid"
            style={{ background: kidColor.bg, color: kidColor.c }}
            title={kid.label}
          >
            子連れ{kid.mark}
          </span>
        </div>
      </div>
    </Link>
  );
}
