/**
 * /spot/[slug] の「この会場で毎年ひらかれるイベント」セクション。
 *
 * 終了イベントを過去アーカイブページに溜めるのではなく、永続資産であるスポットページの
 * 中身に畳み込むための表示（lib/annual-events.ts を参照）。
 * 会期が切れたイベントは消えず、「毎年◯月ごろ開催」という未来向きの情報として残る。
 */
import Link from 'next/link';
import { V2SectionHead } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import type { VenueAnnualEvent } from '@/lib/annual-events';

export function VenueAnnualEvents({ events, spotName }: { events: VenueAnnualEvent[]; spotName: string }) {
  if (events.length === 0) return null;
  const hasAnnual = events.some((e) => e.kind === 'annual');
  return (
    <>
      <V2SectionHead title={`${spotName}で毎年ひらかれるイベント`} moreHref="/events" />
      <div className="v2-section">
        <p
          style={{
            fontSize: 12.5,
            color: 'var(--v2-ink-sub)',
            lineHeight: 1.7,
            margin: '0 0 12px',
            padding: '0 2px',
          }}
        >
          {hasAnnual
            ? '来年の計画を立てるときの目安です。翌年の具体的な日程は毎年変わるため、時期が近づいたら公式サイトでご確認ください。'
            : 'この会場で今年ひらかれたイベントです。翌年も開催されるとは限らないため、公式サイトでご確認ください。'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {events.map((e) => (
            <div
              key={e.slug}
              style={{
                background: '#fff',
                border: '1px solid var(--v2-line)',
                borderRadius: 'var(--v2-r-card)',
                padding: '12px 14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 999,
                    color: e.ended ? 'var(--v2-ink-sub)' : 'var(--v2-orange-deep)',
                    background: e.ended ? 'var(--v2-cream)' : 'var(--v2-orange-soft)',
                  }}
                >
                  {e.ended ? '今年は終了' : '開催中'}
                </span>
                <Link
                  href={`/event/${e.slug}`}
                  style={{ fontSize: 14, fontWeight: 800, color: 'var(--v2-ink)' }}
                >
                  {e.title}
                </Link>
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: 'var(--v2-ink-soft)',
                  fontWeight: 700,
                  marginTop: 6,
                }}
              >
                📅 {e.periodLabel}
              </div>
              {e.officialUrl && (
                <a
                  href={e.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    marginTop: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--v2-orange-deep)',
                  }}
                >
                  <V2Icon name="link" size={13} color="var(--v2-orange)" />
                  公式サイトで最新の日程を見る
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
