/**
 * /spot/[slug] の「近くで開催中・これからのイベント」セクション。
 *
 * イベントは会期が切れたら自動で消える（getUpcomingEventsNear が終了済みを返さない）ので、
 * 永続資産である /spot/ ページを鮮度で強化する「部品」として働く。
 * イベントが1件も無い期間はセクションごと描画されない＝古い情報が残らない。
 */
import Link from 'next/link';
import { V2SectionHead, V2Img } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import { eventHeroImage, formatEventPeriod, type EventEntry } from '@/lib/events';

export function UpcomingEventsNearby({
  events,
  title,
}: {
  events: EventEntry[];
  title: string;
}) {
  if (events.length === 0) return null;
  return (
    <>
      <V2SectionHead title={title} moreHref="/events" />
      <div className="v2-vlist">
        {events.map((e) => (
          <Link key={e.slug} href={`/event/${e.slug}`} className="v2-art-row">
            <div className="v2-imgwrap r" style={{ width: 76, minWidth: 76, height: 60 }}>
              <V2Img src={eventHeroImage(e)} seed={e.slug} alt={e.title} />
            </div>
            <div className="v2-art-body">
              <div className="v2-art-title">{e.title}</div>
              <div className="v2-art-sub">
                📅 {formatEventPeriod(e)} ／ {e.venue}
              </div>
            </div>
            <V2Icon name="chevron-right" size={20} color="#cfcfcf" />
          </Link>
        ))}
      </div>
    </>
  );
}
