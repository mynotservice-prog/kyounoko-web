'use client';

import React from 'react';
import Link from 'next/link';
import { V2Icon } from './V2Icon';
import { V2Img } from './V2Base';

/**
 * イベントカレンダー表示（月単位）。
 * 各日付セルにその日のイベント数（ドット＋件数）を表示、
 * 日付タップで下にその日のイベント一覧を展開。
 *
 * 受け取るのは "プレーンなイベントデータ"。EventEntry をそのまま受けてもOKだが
 * 依存を疎にするため必要なプロパティだけの型を定義。
 */

export type CalEvent = {
  slug: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  venue: string;
  category: string;
  hero?: string;
  ageLabel?: string;
};

type Props = {
  events: CalEvent[];
};

const DOW = ['日', '月', '火', '水', '木', '金', '土'] as const;

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function V2EventCalendar({ events }: Props) {
  // 表示中の年月（デフォルト：今月）
  const today = React.useMemo(() => new Date(), []);
  const [view, setView] = React.useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(), // 0-11
  }));
  const [selectedDay, setSelectedDay] = React.useState<string | null>(toYMD(today));
  /** ユーザー操作起因（初回マウント時はスクロールしない用フラグ） */
  const userInteractedRef = React.useRef(false);
  const selectedPanelRef = React.useRef<HTMLDivElement | null>(null);

  /** 日付タップ。同じ日を再タップした時はトグル感を出さず常にスクロール。 */
  const handleSelectDay = (ymd: string) => {
    userInteractedRef.current = true;
    setSelectedDay(ymd);
  };

  /** selectedDay 変更時、当日イベントパネルへスムーズスクロール（初回マウントは除く） */
  React.useEffect(() => {
    if (!userInteractedRef.current) return;
    if (!selectedPanelRef.current) return;
    // 次フレームでスクロール（DOM反映後）
    const t = requestAnimationFrame(() => {
      selectedPanelRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
    return () => cancelAnimationFrame(t);
  }, [selectedDay]);

  // 月の1日と末日
  const firstDay = new Date(view.year, view.month, 1);
  const lastDay = new Date(view.year, view.month + 1, 0);
  const startWeekday = firstDay.getDay(); // 0=日
  const daysInMonth = lastDay.getDate();
  const todayYMD = toYMD(today);

  // セル配列（前月の空セル + 当月日数）
  const cells: ({ day: number; ymd: string; events: CalEvent[] } | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(view.year, view.month, d);
    const ymd = toYMD(dt);
    // その日に開催されているイベント（startDate <= ymd <= endDate）
    const dayEvents = events.filter((e) => e.startDate <= ymd && ymd <= e.endDate);
    cells.push({ day: d, ymd, events: dayEvents });
  }

  const goPrev = () => {
    setView((v) => {
      const m = v.month - 1;
      if (m < 0) return { year: v.year - 1, month: 11 };
      return { year: v.year, month: m };
    });
  };
  const goNext = () => {
    setView((v) => {
      const m = v.month + 1;
      if (m > 11) return { year: v.year + 1, month: 0 };
      return { year: v.year, month: m };
    });
  };

  const selectedEvents = selectedDay
    ? events.filter((e) => e.startDate <= selectedDay && selectedDay <= e.endDate)
    : [];

  return (
    <div className="v2-cal">
      <div className="v2-cal-head">
        <div className="v2-cal-title">
          {view.year}年 {view.month + 1}月
        </div>
        <div className="v2-cal-nav">
          <button
            type="button"
            className="v2-cal-nav-btn"
            onClick={goPrev}
            aria-label="前の月"
          >
            <V2Icon name="chevron-left" size={16} color="var(--v2-ink)" />
          </button>
          <button
            type="button"
            className="v2-cal-nav-btn"
            onClick={goNext}
            aria-label="次の月"
          >
            <V2Icon name="chevron-right" size={16} color="var(--v2-ink)" />
          </button>
        </div>
      </div>

      <div className="v2-cal-grid">
        {DOW.map((d, i) => (
          <div
            key={d}
            className={
              'v2-cal-dow' + (i === 0 ? ' sun' : i === 6 ? ' sat' : '')
            }
          >
            {d}
          </div>
        ))}
        {cells.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="v2-cal-cell empty" />;
          }
          const dow = (startWeekday + cell.day - 1) % 7;
          const isToday = cell.ymd === todayYMD;
          const isSelected = cell.ymd === selectedDay;
          const hasEvents = cell.events.length > 0;
          return (
            <button
              key={cell.ymd}
              type="button"
              className={
                'v2-cal-cell' +
                (isToday ? ' today' : '') +
                (hasEvents ? ' has' : '') +
                (isSelected ? ' selected' : '')
              }
              onClick={() => handleSelectDay(cell.ymd)}
              style={
                isSelected
                  ? { borderColor: 'var(--v2-orange)', borderWidth: 2 }
                  : undefined
              }
            >
              <span
                className={
                  'v2-cal-day' +
                  (dow === 0 ? ' sun' : dow === 6 ? ' sat' : '')
                }
              >
                {cell.day}
              </span>
              {hasEvents && (
                <>
                  <div className="v2-cal-dots">
                    {cell.events.slice(0, 3).map((e) => (
                      <span key={e.slug} className="v2-cal-dot"></span>
                    ))}
                  </div>
                  <span className="v2-cal-count">{cell.events.length}件</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div className="v2-cal-selected" ref={selectedPanelRef} style={{ scrollMarginTop: 12 }}>
          <div className="v2-cal-selected-title">
            {selectedDay.split('-')[1]}月{selectedDay.split('-')[2]}日のイベント
            {selectedEvents.length > 0 ? ` (${selectedEvents.length}件)` : ''}
          </div>
          {selectedEvents.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--v2-ink-mute)' }}>
              この日のイベントはありません。
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedEvents.map((e) => (
                <Link
                  key={e.slug}
                  href={`/event/${e.slug}`}
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: 10,
                    background: '#fff',
                    borderRadius: 12,
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      minWidth: 56,
                      aspectRatio: '1/1',
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}
                  >
                    <V2Img
                      src={e.hero || '/v2/events/show-museum.webp'}
                      seed={e.slug}
                      alt={e.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 800,
                        color: 'var(--v2-ink)',
                        lineHeight: 1.35,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {e.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--v2-ink-mute)',
                        marginTop: 4,
                      }}
                    >
                      {e.venue}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
