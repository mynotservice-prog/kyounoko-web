'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

/**
 * 汎用診断エンジン。タグベースのスコアリングで上位N候補を提示する。
 *
 * - Question: 1問あたり複数選択肢、各選択肢にタグ配列
 * - Recommendation: スコア対象タグと表示内容
 * - 集計: 全質問の選択タグを合算 → 各候補の scoreTags との一致数でスコア
 */

export type ShindanQuestion<T extends string> = {
  id: string;
  question: string;
  options: { label: string; tags: T[] }[];
};

export type ShindanRecommendation<T extends string> = {
  id: string;
  category?: string;
  name: string;
  reason: string;
  pros?: string[];
  cons?: string[];
  href?: string;
  hrefLabel?: string;
  meta?: { label: string; value: string }[];
  scoreTags: T[];
};

export type ShindanEngineProps<T extends string> = {
  questions: ShindanQuestion<T>[];
  recommendations: ShindanRecommendation<T>[];
  topN?: number;
  resultTitle?: string;
  ctaBackHref?: string;
  ctaBackLabel?: string;
  /** 診断後に追加で表示する任意のコンテンツ（補足解説など） */
  resultExtra?: ReactNode;
  /** GA4 イベントに送る診断ツール識別子（例: babycar-shindan, odekake-type） */
  toolId?: string;
};

export function ShindanEngine<T extends string>({
  questions,
  recommendations,
  topN = 3,
  resultTitle = 'あなたへのおすすめ TOP3',
  ctaBackHref = '/tools',
  ctaBackLabel = '他の診断ツールを見る',
  resultExtra,
  toolId,
}: ShindanEngineProps<T>) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, T[]>>({});

  const isLast = step >= questions.length;
  const currentQ = questions[step];

  // 初回マウント時に shindan_start を一度だけ送信。リセットでは再発火しない
  // （ユーザー視点で「同じツールを再診断」は1セッション扱いにしたいため）。
  const startedRef = useRef(false);
  // 完了イベント用のフラグ。isLast 遷移時に1度だけ shindan_complete を送る。
  // handleReset から触りたいので handleReset より上で宣言する。
  const completedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent('shindan_start', { tool_id: toolId });
  }, [toolId]);

  const handleSelect = (tags: T[]) => {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: tags }));
    setStep((s) => s + 1);
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    // 再診断時にもう一度 shindan_complete を送るため、完了フラグはクリアする
    completedRef.current = false;
  };

  const allTags: T[] = Object.values(answers).flat();
  const tagCounts = new Map<T, number>();
  allTags.forEach((t) => tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1));

  const scored = recommendations
    .map((rec) => {
      const score = rec.scoreTags.reduce((s, t) => s + (tagCounts.get(t) ?? 0), 0);
      return { rec, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  // isLast に遷移した瞬間に1度だけ shindan_complete を送る。
  useEffect(() => {
    if (!isLast || completedRef.current) return;
    completedRef.current = true;
    trackEvent('shindan_complete', {
      tool_id: toolId,
      result: scored[0]?.rec.id,
    });
  }, [isLast, scored, toolId]);

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-mute)', marginBottom: 6 }}>
          <span>{isLast ? '完了' : `Q${step + 1} / ${questions.length}`}</span>
          <span>{isLast ? '結果表示中' : `あと${questions.length - step}問`}</span>
        </div>
        <div style={{ height: 6, background: 'var(--paper-card)', borderRadius: 999, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${(Math.min(step, questions.length) / questions.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--clay), var(--clay-deep))',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {!isLast && currentQ && (
        <div
          style={{
            padding: '24px',
            background: 'var(--paper-card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-mincho), serif', fontSize: 19, margin: '0 0 18px', lineHeight: 1.5 }}>
            {currentQ.question}
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(opt.tags)}
                style={{
                  textAlign: 'left',
                  padding: '14px 18px',
                  background: 'var(--paper)',
                  border: '1.5px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: 15,
                  color: 'var(--ink)',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--clay)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--line)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              style={{
                marginTop: 16,
                padding: '6px 12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--ink-mute)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              ← 前の質問に戻る
            </button>
          )}
        </div>
      )}

      {isLast && (
        <div>
          <div
            style={{
              padding: '20px 24px',
              background: 'linear-gradient(135deg, rgba(20,147,209,0.08), rgba(201,96,62,0.05))',
              border: '1.5px solid rgba(201,96,62,0.25)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--clay-deep)', marginBottom: 4 }}>
              診断結果
            </div>
            <h2 style={{ fontFamily: 'var(--font-mincho), serif', fontSize: 22, fontWeight: 600, margin: 0 }}>
              {resultTitle}
            </h2>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {scored.map(({ rec }, i) => (
              <article
                key={rec.id}
                style={{
                  padding: 24,
                  background: i === 0 ? 'linear-gradient(135deg, rgba(201,96,62,0.05), rgba(20,147,209,0.03))' : 'var(--paper-card)',
                  border: i === 0 ? '2px solid var(--clay)' : '1px solid var(--line)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: i === 0 ? 'var(--clay)' : 'var(--ink-mute)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    {rec.category && (
                      <div style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.08em' }}>{rec.category}</div>
                    )}
                    <h3 style={{ fontFamily: 'var(--font-mincho), serif', fontSize: 19, fontWeight: 600, margin: 0 }}>
                      {rec.name}
                    </h3>
                  </div>
                </div>
                {rec.meta && rec.meta.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    {rec.meta.map((m, j) => (
                      <span key={j} style={{ padding: '3px 10px', borderRadius: 999, background: 'var(--paper)', border: '1px solid var(--line)', fontSize: 12 }}>
                        {m.label}: {m.value}
                      </span>
                    ))}
                  </div>
                )}
                <p style={{ margin: '0 0 14px', color: 'var(--ink-sub)', fontSize: 14, lineHeight: 1.85 }}>
                  {rec.reason}
                </p>
                {(rec.pros || rec.cons) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    {rec.pros && rec.pros.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--clay-deep)', marginBottom: 6 }}>○ 強み</div>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--ink-sub)', lineHeight: 1.8 }}>
                          {rec.pros.map((p, j) => <li key={j}>{p}</li>)}
                        </ul>
                      </div>
                    )}
                    {rec.cons && rec.cons.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-mute)', marginBottom: 6 }}>△ 注意</div>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--ink-sub)', lineHeight: 1.8 }}>
                          {rec.cons.map((c, j) => <li key={j}>{c}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {rec.href && (
                  <Link
                    href={rec.href}
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      background: i === 0 ? 'var(--clay)' : 'transparent',
                      color: i === 0 ? '#fff' : 'var(--clay-deep)',
                      border: i === 0 ? 'none' : '1.5px solid var(--clay)',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {rec.hrefLabel ?? '詳しく見る →'}
                  </Link>
                )}
              </article>
            ))}
          </div>

          {resultExtra && <div style={{ marginTop: 24 }}>{resultExtra}</div>}

          <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1.5px solid var(--clay)',
                color: 'var(--clay-deep)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ↺ もう一度診断する
            </button>
            <Link
              href={ctaBackHref}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1.5px solid var(--line)',
                color: 'var(--ink-sub)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {ctaBackLabel}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
