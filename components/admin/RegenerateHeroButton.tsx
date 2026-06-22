'use client';

import { useState } from 'react';

/**
 * 単発の hero画像再生成ボタン（admin/image-gen用）。
 *
 * - /api/admin/regenerate-hero へ POST する
 * - 実行中は disabled & スピナー表示
 * - 完了したら beforeURL / afterURL を表示
 * - 失敗時はエラーメッセージ
 *
 * 動作する環境:
 *  - dev (npm run dev)：常に動作
 *  - 本番：Vercel ENV `ALLOW_REMOTE_GEN=1` を設定したときのみ動作
 *
 * 本番で動かしても /public/hero-ai/ に永続化はされない（Vercelの読み取り専用FS）。
 * したがって、画像再生成は **ローカル開発時に Mac で**行うのが基本運用。
 */
export function RegenerateHeroButton({ slug, currentHero }: { slug: string; currentHero?: string }) {
  const [state, setState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [cacheBust, setCacheBust] = useState(0);

  const onClick = async () => {
    setState('running');
    setError(null);
    try {
      const res = await fetch('/api/admin/regenerate-hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, steps: 8 }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || 'generation failed');
        setState('error');
        return;
      }
      setCacheBust(Date.now());
      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setState('error');
    }
  };

  const afterSrc = state === 'done' ? `/hero-ai/${slug}.jpg?v=${cacheBust}` : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        type="button"
        onClick={onClick}
        disabled={state === 'running'}
        style={{
          padding: '6px 13px',
          fontSize: 12.5,
          fontWeight: 600,
          background: state === 'running' ? 'var(--neu-bg)' : 'var(--accent)',
          color: state === 'running' ? 'var(--ink-500)' : '#fff',
          border: 'none',
          borderRadius: 'var(--r-sm)',
          cursor: state === 'running' ? 'wait' : 'pointer',
        }}
      >
        {state === 'running' ? '生成中...' : state === 'done' ? '再生成' : '再生成'}
      </button>

      {state === 'error' && (
        <div style={{ fontSize: 11, color: 'var(--neg, #C9603E)', lineHeight: 1.5 }}>
          {error}
        </div>
      )}

      {state === 'done' && afterSrc && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--ink-400)' }}>BEFORE</div>
            <div
              style={{
                aspectRatio: '16/9',
                background: currentHero ? `url(${currentHero}) center/cover` : 'var(--bg-app)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--ink-400)' }}>NEW（再生成）</div>
            <div
              style={{
                aspectRatio: '16/9',
                background: `url(${afterSrc}) center/cover`,
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
              }}
            />
          </div>
        </div>
      )}

      {state === 'done' && (
        <p style={{ fontSize: 10, color: 'var(--ink-400)', margin: 0, lineHeight: 1.5 }}>
          ※ 本番反映には `git add public/hero-ai/{slug}.jpg && git commit && git push` が必要
        </p>
      )}
    </div>
  );
}
