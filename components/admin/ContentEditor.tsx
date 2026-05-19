'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * 記事・プランの本文＋フロントマター編集UI（スマホ最適化済み）。
 *
 * - GET /api/admin/edit-content?kind=...&slug=... で初期データ取得
 * - POST /api/admin/edit-content で保存
 * - 主要フィールド（title / metaDescription / lede / hero / updatedAt）はフォームで編集
 * - それ以外のフロントマター項目は JSON モードで編集（折りたたみ）
 * - 本文は textarea で markdown 編集
 *
 * モバイル最適化:
 *  - すべての input/textarea を font-size 16px 以上（iOSの自動ズーム回避）
 *  - 保存ボタンを画面下部に sticky で固定
 *  - 1カラムレイアウト
 *
 * 保存先:
 *  - ローカル開発: ファイル直接書き込み（git push は手動）
 *  - 本番 GitHub設定済: Contents API で即commit → Vercel自動デプロイ（スマホからもOK）
 */
type Props = {
  kind: 'article' | 'plan';
  slug: string;
  backHref?: string;
  publicHref?: string;
};

type LoadState =
  | { phase: 'loading' }
  | { phase: 'ready' }
  | { phase: 'error'; message: string };

// 主要フィールドの構成。これら以外は「その他」JSON で編集する。
const PRIMARY_FIELDS = ['title', 'metaDescription', 'lede', 'hero', 'category', 'categoryName', 'publishedAt', 'updatedAt'] as const;
type PrimaryKey = (typeof PRIMARY_FIELDS)[number];

export function ContentEditor({ kind, slug, backHref, publicHref }: Props) {
  const [state, setState] = useState<LoadState>({ phase: 'loading' });
  const [primary, setPrimary] = useState<Record<PrimaryKey, string>>({
    title: '', metaDescription: '', lede: '', hero: '', category: '', categoryName: '', publishedAt: '', updatedAt: '',
  });
  const [otherFmText, setOtherFmText] = useState('{}');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err' | 'info'; text: string; url?: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [source, setSource] = useState<'fs' | 'github' | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/edit-content?kind=${kind}&slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || 'load failed');
        if (cancelled) return;
        const fm = (data.frontmatter || {}) as Record<string, unknown>;
        const p: Record<PrimaryKey, string> = { ...primary };
        for (const k of PRIMARY_FIELDS) {
          const v = fm[k];
          p[k] = v == null ? '' : typeof v === 'string' ? v : String(v);
        }
        const others: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(fm)) {
          if (!PRIMARY_FIELDS.includes(k as PrimaryKey)) others[k] = v;
        }
        setPrimary(p);
        setOtherFmText(JSON.stringify(others, null, 2));
        setBody(data.body || '');
        setSource(data.source ?? null);
        setState({ phase: 'ready' });
      } catch (err) {
        if (cancelled) return;
        setState({ phase: 'error', message: err instanceof Error ? err.message : String(err) });
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, slug]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const updatePrimary = (k: PrimaryKey, v: string) => {
    setPrimary((prev) => ({ ...prev, [k]: v }));
    setDirty(true);
  };

  const onSave = async () => {
    setSaving(true);
    setMessage(null);
    let parsedOther: Record<string, unknown>;
    try {
      parsedOther = JSON.parse(otherFmText || '{}');
    } catch (err) {
      setMessage({ type: 'err', text: `「その他」のJSONが不正: ${err instanceof Error ? err.message : err}` });
      setSaving(false);
      return;
    }
    const frontmatter: Record<string, unknown> = { ...parsedOther };
    for (const k of PRIMARY_FIELDS) {
      const v = primary[k].trim();
      if (v !== '') frontmatter[k] = v;
    }
    // 保存時に updatedAt を自動更新するオプション（ユーザーが手動でいじっていなければ）
    if (!primary.updatedAt) {
      const today = new Date().toISOString().slice(0, 10);
      frontmatter.updatedAt = today;
    }
    try {
      const res = await fetch('/api/admin/edit-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, slug, frontmatter, body }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'save failed');
      if (data.source === 'github') {
        setMessage({
          type: 'ok',
          text: `保存しました（commit: ${(data.commit || '').slice(0, 7)}）。${data.deployed || 'Vercel が自動デプロイします'}`,
          url: data.commitUrl,
        });
      } else {
        setMessage({ type: 'ok', text: `ローカル保存（${data.path}）。git push で本番反映` });
      }
      setDirty(false);
    } catch (err) {
      setMessage({ type: 'err', text: err instanceof Error ? err.message : String(err) });
    } finally {
      setSaving(false);
    }
  };

  if (state.phase === 'loading') return <div style={{ padding: 20, fontSize: 16 }}>読み込み中…</div>;
  if (state.phase === 'error')
    return <div style={{ padding: 20, color: 'crimson', fontSize: 16 }}>❌ {state.message}</div>;

  return (
    <div style={{ display: 'grid', gap: 14, paddingBottom: 100 }}>
      <div>
        <div style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '.05em' }}>
          {kind === 'article' ? '記事' : 'プラン'}を編集
          {source === 'github' && <span style={{ marginLeft: 8, color: 'var(--sage-deep)' }}>GitHub直接編集モード</span>}
          {source === 'fs' && <span style={{ marginLeft: 8, color: 'var(--ink-mute)' }}>ローカル編集モード</span>}
        </div>
        <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, margin: '4px 0 6px', fontWeight: 600 }}>
          ✏️ <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{slug}</span>
        </h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
          {publicHref && (
            <Link href={publicHref} target="_blank" style={tagLink}>🔗 公開ページ</Link>
          )}
          {backHref && (
            <Link href={backHref} style={tagLink}>← 一覧</Link>
          )}
        </div>
      </div>

      {/* 主要フィールド（スマホで入力しやすいフォーム） */}
      <div style={cardStyle}>
        <Field label="タイトル">
          <input
            type="text"
            value={primary.title}
            onChange={(e) => updatePrimary('title', e.target.value)}
            style={inputStyle}
          />
        </Field>
        <Field label="メタディスクリプション（120〜160字推奨）">
          <textarea
            value={primary.metaDescription}
            onChange={(e) => updatePrimary('metaDescription', e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', height: 80 }}
          />
          <span style={countStyle}>{primary.metaDescription.length}字</span>
        </Field>
        <Field label="リード文（記事冒頭の要約）">
          <textarea
            value={primary.lede}
            onChange={(e) => updatePrimary('lede', e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', height: 90 }}
          />
        </Field>
        <Field label="hero画像パス">
          <input
            type="text"
            value={primary.hero}
            onChange={(e) => updatePrimary('hero', e.target.value)}
            placeholder="/hero-ai/<slug>.jpg"
            style={inputStyle}
          />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="カテゴリ slug">
            <input
              type="text"
              value={primary.category}
              onChange={(e) => updatePrimary('category', e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="カテゴリ表示名">
            <input
              type="text"
              value={primary.categoryName}
              onChange={(e) => updatePrimary('categoryName', e.target.value)}
              style={inputStyle}
            />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="公開日">
            <input
              type="text"
              value={primary.publishedAt}
              onChange={(e) => updatePrimary('publishedAt', e.target.value)}
              placeholder="2026-05-19"
              style={inputStyle}
            />
          </Field>
          <Field label="最終更新日（空欄なら今日）">
            <input
              type="text"
              value={primary.updatedAt}
              onChange={(e) => updatePrimary('updatedAt', e.target.value)}
              placeholder="2026-05-19"
              style={inputStyle}
            />
          </Field>
        </div>
      </div>

      {/* 詳細フロントマター（折りたたみ） */}
      <details style={cardStyle}>
        <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 14, padding: 4 }}>
          ⚙️ その他のフロントマター（quickInfo / tags / faq など）
        </summary>
        <textarea
          value={otherFmText}
          onChange={(e) => { setOtherFmText(e.target.value); setDirty(true); }}
          spellCheck={false}
          rows={10}
          style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 13, height: 240, resize: 'vertical' }}
          aria-label="その他フロントマターJSON"
        />
        <p style={hintStyle}>JSON形式。形式が崩れていると保存失敗。</p>
      </details>

      {/* 本文 */}
      <div style={cardStyle}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>📝 本文（Markdown）</div>
        <textarea
          value={body}
          onChange={(e) => { setBody(e.target.value); setDirty(true); }}
          spellCheck={false}
          rows={20}
          style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 15, height: 500, resize: 'vertical', lineHeight: 1.7 }}
          aria-label="本文Markdown"
        />
        <p style={hintStyle}>{body.length}文字 / 目安は2,500字</p>
      </div>

      {/* sticky 保存バー */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '12px 16px max(12px, env(safe-area-inset-bottom))',
          background: 'rgba(255,255,255,0.96)',
          borderTop: '1px solid var(--line, #e8e2d4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 50,
        }}
      >
        {message && (
          <div
            style={{
              marginBottom: 10,
              padding: 10,
              background: message.type === 'ok' ? '#E6F5E1' : '#FCE4E4',
              border: '1px solid ' + (message.type === 'ok' ? '#7AB562' : '#D77B7B'),
              borderRadius: 8,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {message.type === 'ok' ? '✅ ' : '❌ '}{message.text}
            {message.url && (
              <>
                {' '}
                <a href={message.url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  commitを見る↗
                </a>
              </>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '14px 16px',
            fontSize: 17,
            fontWeight: 700,
            background: saving ? '#a8a397' : 'var(--ink, #221a10)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            cursor: saving ? 'wait' : 'pointer',
            touchAction: 'manipulation',
          }}
        >
          {saving ? '保存中…' : dirty ? '💾 保存して反映' : '✓ 変更なし'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 10 }}>
      <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-sub)', marginBottom: 4, fontWeight: 600 }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid var(--line, #e8e2d4)',
  borderRadius: 10,
  padding: 14,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 12px',
  fontSize: 16, // ← iOSの自動ズーム回避（16px以上）
  border: '1px solid var(--line, #e8e2d4)',
  borderRadius: 8,
  background: '#fafaf6',
  lineHeight: 1.5,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const countStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--ink-mute)',
  display: 'block',
  marginTop: 4,
};

const hintStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--ink-mute)',
  margin: '6px 0 0',
};

const tagLink: React.CSSProperties = {
  fontSize: 12,
  padding: '6px 10px',
  background: '#fff',
  border: '1px solid var(--line, #e8e2d4)',
  borderRadius: 6,
  textDecoration: 'none',
  color: 'var(--ink, #221a10)',
};
