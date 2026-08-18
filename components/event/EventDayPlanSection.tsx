/**
 * /event/[slug] の「イベント起点の1日モデルコース」セクション。
 * lib/event-day-plan.ts の buildEventDayPlan() の結果を縦タイムラインで描画する。
 * V2 デザイン（イベントページ準拠のインラインスタイル）。
 */
import Link from 'next/link';
import { V2Icon } from '@/components/v2/V2Icon';
import type { EventDayPlan } from '@/lib/event-day-plan';

export function EventDayPlanSection({ plan, cityLabel }: { plan: EventDayPlan; cityLabel: string }) {
  return (
    <div className="v2-section" style={{ marginTop: 20 }}>
      <div className="v2-sec-head">
        <h2 className="v2-sec-title">
          <span className="v2-bar-accent"></span>このイベントを軸にした1日モデルコース
        </h2>
      </div>
      <p
        style={{
          fontSize: 12.5,
          color: 'var(--v2-ink-sub)',
          lineHeight: 1.7,
          margin: '0 0 12px',
          padding: '0 2px',
        }}
      >
        編集部が設備・料金を確認した{cityLabel}の実在スポットだけで組んでいます。
        時間はあくまで目安です。イベントの開催時間にあわせて前後を入れ替えてください。
      </p>
      <div
        style={{
          background: '#fff',
          border: '1px solid var(--v2-line)',
          borderRadius: 'var(--v2-r-card)',
          padding: '16px 16px 8px',
        }}
      >
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {plan.steps.map((step, i) => {
            const isLast = i === plan.steps.length - 1;
            const body = (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: 'var(--v2-orange-deep)',
                      background: 'var(--v2-orange-soft)',
                      padding: '3px 10px',
                      borderRadius: 999,
                    }}
                  >
                    {step.slot}
                  </span>
                  <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--v2-ink)' }}>
                    {step.icon} {step.title}
                  </span>
                  {step.href && <V2Icon name="chevron-right" size={16} color="#cfcfcf" />}
                </div>
                {step.move && (
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: 'var(--v2-ink-mute)',
                      marginTop: 4,
                    }}
                  >
                    🚶 {step.move}
                  </div>
                )}
                {step.note && (
                  <p
                    style={{
                      fontSize: 12.5,
                      color: 'var(--v2-ink-sub)',
                      lineHeight: 1.65,
                      margin: '4px 0 0',
                    }}
                  >
                    {step.note}
                  </p>
                )}
                {step.facets && step.facets.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {step.facets.map((f) => (
                      <span
                        key={f}
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: 'var(--v2-ink-soft)',
                          background: 'var(--v2-cream)',
                          padding: '3px 8px',
                          borderRadius: 999,
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </>
            );
            return (
              <li
                key={`${step.slot}-${i}`}
                style={{
                  position: 'relative',
                  paddingLeft: 26,
                  paddingBottom: isLast ? 8 : 18,
                  borderLeft: isLast ? '2px solid transparent' : '2px solid var(--v2-line)',
                  marginLeft: 8,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: -9,
                    top: 2,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: 'var(--v2-orange)',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {i + 1}
                </span>
                {step.href ? (
                  <Link href={step.href} style={{ display: 'block', color: 'inherit' }}>
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
