'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWhatDay, getTodayTip, dayOfYear } from '@/lib/today-calendar';

export type TodayPickItem = {
  title: string;
  href: string;
  hero?: string;
  categoryName?: string;
};

type Props = {
  /** 今日の遊び候補プール（today-nani 等） */
  asobiPool: TodayPickItem[];
  /** 今日のごはん候補プール（today-taberu 等） */
  gohanPool: TodayPickItem[];
};

const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土'];

/**
 * 「今日のきょうのこ」日替わりセクション。
 * クライアントで今日の日付を取得し、日付シードで毎日違う提案を表示する。
 * → 静的サイトでも「毎日変わる＝毎日来たい」動機を作る。
 */
export function TodayHighlight({ asobiPool, gohanPool }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  // SSR時とマウント直後は何も出さない（hydration不一致回避）
  if (!now) {
    return (
      <section className="section" style={{ paddingTop: 8, paddingBottom: 8 }} aria-hidden>
        <div className="container" style={{ minHeight: 180 }} />
      </section>
    );
  }

  const doy = dayOfYear(now);
  const dateLabel = `${now.getMonth() + 1}月${now.getDate()}日（${WEEKDAY_JA[now.getDay()]}）`;
  const whatDay = getWhatDay(now);
  const tip = getTodayTip(now);
  const asobi = asobiPool.length ? asobiPool[doy % asobiPool.length] : null;
  const gohan = gohanPool.length ? gohanPool[(doy + 3) % gohanPool.length] : null;

  return (
    <section className="section cv-auto-section" style={{ paddingTop: 24, paddingBottom: 8 }}>
      <div className="container">
        <div
          style={{
            background: 'linear-gradient(135deg, var(--sage-pale, #eef3ea) 0%, var(--peach-soft, #fbeee6) 100%)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg, 16px)',
            padding: '20px 22px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: 11,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--clay)',
                fontWeight: 700,
              }}
            >
              Today
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-mincho)',
                fontSize: 20,
                fontWeight: 600,
                margin: 0,
              }}
            >
              今日のきょうのこ・{dateLabel}
            </h2>
          </div>

          {whatDay && (
            <p style={{ fontSize: 13.5, color: 'var(--ink-sub)', lineHeight: 1.8, margin: '0 0 16px' }}>
              📅 {whatDay}
            </p>
          )}

          <div
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            }}
          >
            {asobi && (
              <TodayCard eyebrow="今日の遊び" item={asobi} accent="var(--sage-deep)" />
            )}
            {gohan && (
              <TodayCard eyebrow="今日のごはん" item={gohan} accent="var(--clay)" />
            )}
            {/* 今日の育児ヒント */}
            <div
              style={{
                background: '#fffdf9',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md, 12px)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', color: '#9a7b3f' }}>
                💡 今日の育児ヒント
              </span>
              <p style={{ fontSize: 12.5, color: 'var(--ink-sub)', lineHeight: 1.75, margin: 0 }}>
                {tip}
              </p>
            </div>
          </div>

          <p style={{ fontSize: 11, color: 'var(--ink-mute)', margin: '12px 0 0' }}>
            ※ 提案は毎日入れ替わります。明日もまたのぞいてみてください。
          </p>
        </div>
      </div>
    </section>
  );
}

function TodayCard({ eyebrow, item, accent }: { eyebrow: string; item: TodayPickItem; accent: string }) {
  return (
    <Link
      href={item.href}
      style={{
        background: 'var(--paper-card, #fff)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md, 12px)',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {item.hero && (
        <div
          style={{
            aspectRatio: '16 / 9',
            backgroundColor: 'var(--peach-soft)',
            backgroundImage: `url(${item.hero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', color: accent }}>
          {eyebrow}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mincho)',
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          {item.title}
        </span>
      </div>
    </Link>
  );
}
