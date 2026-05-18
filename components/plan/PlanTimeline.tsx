import * as React from 'react';

export type PlanTimelineStep = {
  /** 時間範囲ラベル。例: "16:00-16:30" / "出発前" */
  name: string;
  /** ステップの本文（説明） */
  text: string;
};

type Props = {
  steps: PlanTimelineStep[];
  /** タイムライン見出し（省略時は "タイムライン"） */
  heading?: string;
};

/**
 * プラン詳細ページ用のタイムライン可視化。
 *
 * - 縦の罫線（border-left）で時間軸を表現
 * - 各ステップに番号バッジを表示（1, 2, 3 ...）
 * - 時間範囲（例: 16:00-16:30）は太字＋色付き
 * - 本文は段落で読みやすく
 *
 * モバイル幅の崩れ防止のため、padding/罫線位置は CSS 側で調整している。
 * （app/globals.css の .plan-timeline-* を参照）
 */
export function PlanTimeline({ steps, heading = 'タイムライン' }: Props) {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="plan-timeline" aria-label="このプランのタイムライン">
      <span className="plan-timeline-eyebrow">Timeline · 流れをひと目で</span>
      <h2 className="plan-timeline-heading">{heading}</h2>
      <ol className="plan-timeline-list">
        {steps.map((step, i) => (
          <li key={`${step.name}-${i}`} className="plan-timeline-item">
            <span className="plan-timeline-badge" aria-hidden="true">
              {i + 1}
            </span>
            <div className="plan-timeline-body">
              <span className="plan-timeline-time">{step.name}</span>
              <p className="plan-timeline-text">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
