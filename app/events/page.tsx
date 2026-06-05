import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Img, V2SectionHead, V2Tag } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import { V2EventCalendar } from '@/components/v2/V2EventCalendar';
import {
  EVENTS,
  deadlineBadge,
  eventHeroImage,
  formatEventPeriod,
  getOngoingEvents,
  getThisMonthEvents,
  getThisWeekEvents,
  kidFriendliness,
} from '@/lib/events';
import { AdSlot } from '@/components/ads/AdSlot';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: '子連れで行ける今週のイベント一覧｜きょうのこ',
  description:
    '0〜6歳の子どもと一緒に楽しめる、今週・今月開催の子育てイベント情報。マルシェ・リトミック・ワークショップ・イルミネーションなど編集部が確認したイベントを掲載。',
  alternates: { canonical: '/events' },
};

type Props = { searchParams: Promise<{ view?: string }> };

export default async function EventsPage({ searchParams }: Props) {
  const { view } = await searchParams;
  const isCalendar = view === 'calendar';
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

  return (
    <V2Frame header="sub" active="events" backHref="/">
      {/* イベント用ヒーロー — 支給D系 */}
      <div className="v2-ev-hero">
        <V2Img
          src="/v2/events/seasonal-summer.webp"
          seed="ev-hero"
          alt="今週のイベント"
        />
        <div className="v2-ev-hero-grad"></div>
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

      <div style={{ height: 24 }}></div>
    </V2Frame>
  );
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
        <div className="v2-ev2-cat">{e.category}</div>
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
