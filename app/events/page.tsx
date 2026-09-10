import '@/app/styles/events-v3.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Img } from '@/components/v2/V2Base';
import { V2EventCalendar } from '@/components/v2/V2EventCalendar';
import { KkIcon } from '@/components/kk/KkIcon';
import { KkSectionTitle } from '@/components/kk/KkSectionTitle';
import { KkLineCard } from '@/components/kk/KkLineCard';
import { KkAddToHomeCard } from '@/components/kk/KkAddToHomeCard';
import { KkFooter } from '@/components/kk/KkFooter';
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
    title: '子連れで行ける今週のイベント一覧',
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
      <div className="events-v3">

      {/* パンくず（写真の外に出す。リンク・文言は従来どおり） */}
      <nav className="ev3-crumb" aria-label="パンくず">
        <Link href="/">ホーム</Link>
        <KkIcon name="chevron-right" size={11} />
        <span className="cur">イベント</span>
      </nav>

      {/* 見出し＋メイン写真。PC（≥920px）では横並びにする。文字は写真に重ねない。 */}
      <div className="ev3-top">
        <div className="ev3-head">
          <span className="ev3-eyebrow">
            <KkIcon name="calendar" size={14} />
            編集部が毎週チェック
          </span>
          <h1 className="ev3-h1">今週のイベント</h1>
          <p className="ev3-sub">
            親子で楽しめるイベントを、子連れOK度つきでご紹介。
          </p>
        </div>
        <div className="ev3-hero">
          <div className="ev3-hero-img">
            <V2Img
              src="/v2/events/seasonal-summer.webp"
              seed="ev-hero"
              alt="今週のイベント"
              priority
            />
          </div>
        </div>
      </div>

      {/* リスト/カレンダー切替（操作UI＝角丸） */}
      <div className="ev3-seg">
        <Link
          href="/events"
          className={'ev3-seg-btn' + (!isCalendar ? ' on' : '')}
          scroll={false}
        >
          <KkIcon name="menu" size={15} />
          リスト
        </Link>
        <Link
          href="/events?view=calendar"
          className={'ev3-seg-btn' + (isCalendar ? ' on' : '')}
          scroll={false}
        >
          <KkIcon name="calendar" size={15} />
          カレンダー
        </Link>
      </div>

      {isCalendar && <V2EventCalendar events={calEvents} />}

      {!isCalendar && (<>

      {/* 絞り込みフィルタ */}
      <div className="ev3-filters">
        <div>
          <div className="ev3-filter-label">エリア</div>
          <div className="kk-chips">
            <Link
              href={buildHref({ area: undefined })}
              className={'kk-chip' + (!filter.area ? ' on' : '')}
              scroll={false}
            >
              すべて
            </Link>
            {areaOpts.map((a) => (
              <Link
                key={a}
                href={buildHref({ area: filter.area === a ? undefined : a })}
                className={'kk-chip' + (filter.area === a ? ' on' : '')}
                scroll={false}
              >
                {getAreaName(a)}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="ev3-filter-label">ジャンル</div>
          <div className="kk-chips">
            <Link
              href={buildHref({ cat: undefined })}
              className={'kk-chip' + (!filter.category ? ' on' : '')}
              scroll={false}
            >
              すべて
            </Link>
            {catOpts.map((c) => (
              <Link
                key={c}
                href={buildHref({ cat: filter.category === c ? undefined : c })}
                className={'kk-chip' + (filter.category === c ? ' on' : '')}
                scroll={false}
              >
                {EVENT_CATEGORY_LABELS[c]}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="ev3-filter-label">こだわり</div>
          <div className="kk-chips">
            <Link
              href={buildHref({ free: filter.free ? undefined : '1' })}
              className={'kk-chip' + (filter.free ? ' on' : '')}
              scroll={false}
            >
              無料
            </Link>
            <Link
              href={buildHref({ soon: filter.soon ? undefined : '1' })}
              className={'kk-chip' + (filter.soon ? ' on' : '')}
              scroll={false}
            >
              今週末・まもなく
            </Link>
            <Link
              href={buildHref({ baby: filter.baby ? undefined : '1' })}
              className={'kk-chip' + (filter.baby ? ' on' : '')}
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
          <div className="kk-sec ev3-sec">
            <KkSectionTitle
              as="div"
              title={<>絞り込み結果<span className="ev3-count">{filtered.length}</span></>}
            >
              <Link href="/events" className="kk-sec-more" scroll={false}>
                条件をクリア
              </Link>
            </KkSectionTitle>
          </div>
          {filtered.length > 0 ? (
            <div className="ev3-rows">
              {filtered.map((e) => (
                <EventRow key={e.slug} e={e} />
              ))}
            </div>
          ) : (
            <div className="ev3-empty">
              <div className="ev3-empty-ico">
                <KkIcon name="calendar" size={40} sw={1.4} />
              </div>
              <div className="ev3-empty-title">
                条件に合うイベントが
                <br />
                見つかりませんでした
              </div>
              <div className="ev3-empty-sub">
                条件をへらすと見つかりやすくなります。
              </div>
            </div>
          )}
        </>
      )}

      {!hasFilter && (<>

      {/* 開催中 */}
      {ongoing.length > 0 && (
        <>
          <div className="kk-sec ev3-sec">
            <KkSectionTitle
              as="div"
              title={<>開催中<span className="ev3-count">{ongoing.length}</span></>}
            />
          </div>
          <div className="ev3-rows">
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
          <div className="kk-sec ev3-sec">
            <KkSectionTitle
              as="div"
              title={
                <>
                  今週末・まもなく
                  <span className="ev3-count">
                    {week.filter((e) => !ongoing.includes(e)).length}
                  </span>
                </>
              }
            />
          </div>
          <div className="ev3-rows">
            {week.filter((e) => !ongoing.includes(e)).map((e) => (
              <EventRow key={e.slug} e={e} />
            ))}
          </div>
        </>
      )}

      {/* 今月 */}
      {month.length > week.length && (
        <>
          <div className="kk-sec ev3-sec">
            <KkSectionTitle as="div" title="今月のイベント" />
          </div>
          <div className="ev3-rows">
            {month.filter((e) => !week.includes(e)).map((e) => (
              <EventRow key={e.slug} e={e} />
            ))}
          </div>
        </>
      )}

      {EVENTS.length === 0 && (
        <div className="ev3-empty">
          <div className="ev3-empty-ico">
            <KkIcon name="calendar" size={40} sw={1.4} />
          </div>
          <div className="ev3-empty-title">
            イベント情報を
            <br />
            準備中です
          </div>
          <div className="ev3-empty-sub">
            掲載までしばらくお待ちください。
          </div>
        </div>
      )}
      </>)}

      </>)}

      {/* 回遊・再訪モジュール（リニューアル2026-09） */}
      <KkLineCard placement="events" />
      <KkAddToHomeCard placement="events" />
      <KkFooter />
      </div>
    </V2Frame>
  );
}

function isEventCategory(v: unknown): v is EventCategory {
  return typeof v === 'string' && v in EVENT_CATEGORY_LABELS;
}

function EventRow({ e }: { e: import('@/lib/events').EventEntry }) {
  const dl = deadlineBadge(e);
  const kid = kidFriendliness(e);
  // 子連れOK度は「データから出る可視テキスト」なので記号（◎○△）はそのまま残す。
  // 色を持たせるのは状態だけ（向いている＝オレンジ／それ以外＝墨の枠線）。
  const kidGood = kid.mark === '◎' || kid.mark === '○';
  return (
    <Link href={`/event/${e.slug}`} className="ev3-row">
      <span className="ev3-row-img">
        <V2Img
          src={eventHeroImage(e)}
          seed={e.slug}
          alt={e.title}
        />
        <span className={`ev3-dl ${dl.level}`}>{dl.text}</span>
        {e.startDate !== e.endDate && (
          <span className="ev3-span">期間中</span>
        )}
      </span>
      <span className="ev3-row-body">
        <span className="ev3-row-cat">{EVENT_CATEGORY_LABELS[e.category]}</span>
        <span className="ev3-row-name">{e.title}</span>
        <span className="ev3-row-meta">
          <KkIcon name="calendar" size={13} />
          {formatEventPeriod(e)}
        </span>
        <span className="ev3-row-meta">
          <KkIcon name="pin" size={13} />
          {e.venue}
        </span>
        <span className="ev3-row-tags">
          {e.ageLabel && <span className="kk-chip plain">{e.ageLabel}</span>}
          <span
            className={'ev3-kid' + (kidGood ? ' good' : '')}
            title={kid.label}
          >
            子連れ{kid.mark}
          </span>
        </span>
      </span>
    </Link>
  );
}
