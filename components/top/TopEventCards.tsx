import Link from 'next/link';
import { V2Img } from '@/components/v2/V2Base';
import { KkIcon } from '@/components/kk/KkIcon';
import { deadlineBadge, eventHeroImage, formatEventPeriod, type EventEntry } from '@/lib/events';

const WD = ['日', '月', '火', '水', '木', '金', '土'];

/** 今週末のイベント（日付バッジ付きカード）。href と hero src は従来どおり。 */
export function TopEventCards({ events }: { events: EventEntry[] }) {
  return (
    <div className="tv3-ev-row">
      {events.map((e) => {
        const d = new Date(e.startDate);
        const badge = deadlineBadge(e);
        return (
          <Link key={e.slug} href={`/event/${e.slug}`} className="tv3-ev">
            <span className="tv3-ev-img">
              <V2Img src={eventHeroImage(e)} seed={e.slug} alt={e.title} />
              <span className="tv3-ev-date" aria-hidden="true">
                <b>
                  {d.getMonth() + 1}/{d.getDate()}
                </b>
                <small>{WD[d.getDay()]}</small>
              </span>
              <span className={'tv3-ev-badge ' + badge.level}>{badge.text}</span>
            </span>
            <span className="tv3-ev-body">
              <span className="tv3-ev-title">{e.title}</span>
              <span className="tv3-ev-meta">
                <KkIcon name="calendar" size={12} />
                {formatEventPeriod(e)}
              </span>
              <span className="tv3-ev-meta">
                <KkIcon name="pin" size={12} />
                {e.venue}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
