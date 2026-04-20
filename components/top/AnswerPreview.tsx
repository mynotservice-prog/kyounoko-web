/**
 * 「1つだけ答えが返る」体験のプレビュー。
 *
 * トップページのファインダー直下/直上に配置し、
 * 押す前に「こう出ます」のサンプル画面を見せることで
 * LP訴求力を上げる（クリック前の期待値形成）。
 */

import Link from 'next/link';

export function AnswerPreview() {
  return (
    <div
      style={{
        marginTop: 28,
        padding: '20px 20px 24px',
        background: 'linear-gradient(135deg, #fff 0%, #faf7f1 100%)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        position: 'relative',
      }}
    >
      {/* ラベル */}
      <div
        style={{
          position: 'absolute',
          top: -12,
          left: 20,
          background: 'var(--clay)',
          color: '#fff',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '.1em',
          padding: '4px 12px',
          borderRadius: 999,
        }}
      >
        こんな答えが出ます
      </div>

      {/* サンプル表示 */}
      <div style={{ marginTop: 8 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            fontSize: 10,
            marginBottom: 12,
          }}
        >
          <Tag>2-3歳</Tag>
          <Tag>雨・家で</Tag>
          <Tag>60分</Tag>
          <Tag>無料</Tag>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            gap: 20,
            alignItems: 'start',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: '.15em',
                textTransform: 'uppercase',
                color: 'var(--clay)',
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Today's answer · 今日の答え
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-mincho)',
                fontSize: 20,
                fontWeight: 600,
                margin: '0 0 10px',
                lineHeight: 1.4,
                color: 'var(--ink)',
              }}
            >
              紙コップ10個で作る「おばけタワー崩し」
            </h3>
            <p
              style={{
                fontSize: 13,
                color: 'var(--ink-sub)',
                lineHeight: 1.7,
                margin: '0 0 14px',
              }}
            >
              100均ダイソーの紙コップ10個と、顔を描いた付箋があればOK。子どもは積むより「崩す」のが好き。
              3回繰り返すと集中力15分もちます。
            </p>
            <div
              style={{
                display: 'flex',
                gap: 14,
                fontSize: 11,
                color: 'var(--ink-mute)',
                marginBottom: 14,
              }}
            >
              <span>⏱ 所要 45分</span>
              <span>💰 300円</span>
              <span>⭐ 編集部おすすめ</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled
                style={{
                  padding: '8px 16px',
                  background: 'var(--clay)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  opacity: 0.5,
                  cursor: 'not-allowed',
                  fontFamily: 'inherit',
                }}
              >
                やってみる
              </button>
              <button
                type="button"
                disabled
                style={{
                  padding: '8px 16px',
                  background: '#fff',
                  color: 'var(--ink-sub)',
                  border: '1px solid var(--line)',
                  borderRadius: 999,
                  fontSize: 12,
                  opacity: 0.5,
                  cursor: 'not-allowed',
                  fontFamily: 'inherit',
                }}
              >
                別の候補を見る
              </button>
            </div>
          </div>

          {/* 右端の小さなサムネ（任意） */}
          <div
            style={{
              width: 120,
              height: 120,
              background: 'url(/hero/toddler-play-01.png) center/cover no-repeat',
              borderRadius: 8,
              flexShrink: 0,
              display: 'none',
            }}
            className="preview-thumb"
          />
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: '1px dashed var(--line)',
          fontSize: 11,
          color: 'var(--ink-mute)',
          lineHeight: 1.6,
          textAlign: 'center',
        }}
      >
        ↑これはサンプル。下の条件を入れると、
        <strong style={{ color: 'var(--clay)' }}>あなたの今日に合う1つ</strong>
        を即表示します。
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        padding: '2px 8px',
        background: 'var(--sage-pale)',
        color: 'var(--sage-deep)',
        borderRadius: 999,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}
