'use client';

import { useState, useMemo } from 'react';

const CATEGORY_OPTIONS = [
  { value: 'today-doko', name: '今日どこ行く？' },
  { value: 'today-nani', name: '今日何する？' },
  { value: 'today-taberu', name: '今日何食べる？' },
  { value: 'today-mawasu', name: '今日どう回す？' },
  { value: 'gyouji', name: '季節と行事' },
  { value: 'narai', name: '習い事と学び' },
  { value: 'yakudatsu', name: '役立つもの' },
];

const AREA_OPTIONS = [
  { value: 'all', name: 'すべて（エリア非依存）' },
  { value: 'tokyo', name: '東京都' },
  { value: 'kanagawa', name: '神奈川県' },
  { value: 'saitama', name: '埼玉県' },
  { value: 'chiba', name: '千葉県' },
  { value: 'osaka', name: '大阪府' },
  { value: 'aichi', name: '愛知県' },
  { value: 'fukuoka', name: '福岡県' },
  { value: 'hokkaido', name: '北海道' },
  { value: 'okinawa', name: '沖縄県' },
];

export function NewArticleClient() {
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [lede, setLede] = useState('');
  const [category, setCategory] = useState('today-doko');
  const [area, setArea] = useState('all');
  const [age, setAge] = useState('2-3');
  const [place, setPlace] = useState('home');
  const [durationMin, setDurationMin] = useState(30);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState('');

  const today = new Date().toISOString().slice(0, 10);
  const categoryName = CATEGORY_OPTIONS.find((c) => c.value === category)?.name ?? '';

  const markdown = useMemo(() => {
    return `---
slug: ${slug || 'your-article-slug'}
title: ${title || '記事タイトル'}
metaDescription: ${metaDescription || '（120-140字のSEO説明文）'}
category: ${category}
categoryName: ${categoryName}
publishedAt: "${today}"
updatedAt: "${today}"
hero:
lede: ${lede || '（140-200字の導入文）'}
quickInfo:
  ageRanges: ["${age}"]
  place: ["${place}"]
  weather: ["any"]
  durationMin: ${durationMin}
  budget: "low"
area: ${area}
---

## このページでわかること

- ポイント1
- ポイント2
- ポイント3

## 本文の見出し1

本文を書きます。**具体的な商品名・金額・時間**を明示すると読者が行動しやすくなります。

例:
- 「絵本を読む」→「『はらぺこあおむし』（エリック・カール/偕成社、1,300円）を5分」
- 「公園で遊ぶ」→「徒歩10分の大型公園で滑り台3回＋砂場15分」

### 小見出し

内容を書く。

## 本文の見出し2

...

## まとめ

- まとめポイント1
- まとめポイント2

## よくある質問（FAQ）

### Q. 質問1？

A. 回答1。

### Q. 質問2？

A. 回答2。

### Q. 質問3？

A. 回答3。
`;
  }, [slug, title, metaDescription, lede, category, categoryName, today, age, place, durationMin, area]);

  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // KVに作成（デプロイ不要）。KV未設定なら edit-content 側で従来の commit にフォールバック。
  const createInKv = async () => {
    if (!slug) { setCreateMsg('slug を入力してください'); return; }
    setCreating(true);
    setCreateMsg('');
    const frontmatter = {
      slug, title, metaDescription, category, categoryName,
      publishedAt: today, updatedAt: today, hero: '', lede,
      quickInfo: { ageRanges: [age], place: [place], weather: ['any'], durationMin, budget: 'low' },
      area,
    };
    const close = markdown.indexOf('---', 3);
    const body = close >= 0 ? markdown.slice(close + 3).replace(/^\s+/, '') : '';
    try {
      const res = await fetch('/api/admin/edit-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'article', slug, frontmatter, body }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; source?: string; deployed?: string };
      if (!res.ok || !data.ok) {
        setCreateMsg('❌ ' + (data.error || 'failed'));
      } else if (data.source === 'kv') {
        setCreateMsg('✅ KVに作成（デプロイ不要）。編集画面へ移動します…');
        setTimeout(() => { window.location.href = `/admin/articles/${slug}/edit`; }, 1000);
      } else {
        setCreateMsg('✅ 作成しました（' + (data.deployed || data.source) + '）');
      }
    } catch (e) {
      setCreateMsg('❌ ' + (e instanceof Error ? e.message : 'error'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
      {/* 左: フォーム */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="slug (URLに使う英数ハイフン, 例: kids-park-tokyo)">
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="kids-park-tokyo" style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
          </Field>
          <Field label="タイトル (30-40字推奨)">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="東京で子連れにおすすめの公園5選" style={titleInputStyle} />
          </Field>
          <Field label="meta description (120-140字、SEO用)">
            <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2} style={textareaStyle} />
          </Field>
          <Field label="lede (140-200字の導入文)">
            <textarea value={lede} onChange={(e) => setLede(e.target.value)} rows={3} style={textareaStyle} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="カテゴリ">
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="エリア">
              <select value={area} onChange={(e) => setArea(e.target.value)} style={inputStyle}>
                {AREA_OPTIONS.map((a) => <option key={a.value} value={a.value}>{a.name}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Field label="対象年齢">
              <select value={age} onChange={(e) => setAge(e.target.value)} style={inputStyle}>
                <option value="0-1">0-1歳</option>
                <option value="2-3">2-3歳</option>
                <option value="4-6">4-6歳</option>
              </select>
            </Field>
            <Field label="場所">
              <select value={place} onChange={(e) => setPlace(e.target.value)} style={inputStyle}>
                <option value="home">家</option>
                <option value="indoor">屋内</option>
                <option value="outdoor">外</option>
              </select>
            </Field>
            <Field label="所要時間(分)">
              <input type="number" value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} style={inputStyle} />
            </Field>
          </div>
          <button
            type="button"
            onClick={createInKv}
            disabled={creating || !slug}
            style={{
              marginTop: 6, padding: '9px 16px', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600,
              cursor: creating || !slug ? 'not-allowed' : 'pointer', opacity: creating || !slug ? 0.5 : 1,
            }}
          >
            {creating ? '作成中…' : 'KVに作成して公開（デプロイ不要）'}
          </button>
          {createMsg && <div style={{ fontSize: 12.5, color: 'var(--ink-600)', marginTop: 2 }}>{createMsg}</div>}
          <div style={{ marginTop: 4, fontSize: 11.5, color: 'var(--ink-400)', lineHeight: 1.6 }}>
            このボタンは枠（frontmatter＋ひな形本文）をKVに作成し、編集画面へ移動します。本文はそこで書いて保存（同じくデプロイ不要）。<br />
            ※KV未設定の環境では従来どおり右のMarkdownをコピーして <code style={{ fontFamily: 'var(--font-mono)' }}>content/articles/{slug || 'your-article-slug'}.md</code> を作成→commitしてください。
          </div>
        </div>
      </div>

      {/* 右: プレビュー */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>Markdown プレビュー</span>
          <button
            type="button"
            onClick={copy}
            style={{
              marginLeft: 'auto',
              padding: '9px 15px',
              border: '1px solid var(--border-strong)',
              background: copied ? 'var(--ok-bg)' : 'var(--bg-surface)',
              color: copied ? 'var(--ok-fg)' : 'var(--ink-600)',
              borderRadius: 'var(--r-md)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {copied ? 'コピーしました' : 'コピー'}
          </button>
        </div>
        <pre
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            padding: 14,
            fontSize: 11,
            lineHeight: 1.55,
            color: 'var(--ink-700)',
            fontFamily: 'var(--font-mono)',
            overflow: 'auto',
            maxHeight: '70vh',
            whiteSpace: 'pre-wrap',
          }}
        >
          {markdown}
        </pre>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-500)', fontWeight: 600, marginBottom: 7 }}>{label}</span>
      {children}
    </label>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-lg)',
  padding: 18,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  height: 38,
  padding: '0 12px',
  border: '1px solid var(--border-strong)',
  borderRadius: 'var(--r-md)',
  fontSize: 13,
  color: 'var(--ink-700)',
  fontFamily: 'inherit',
  background: 'var(--bg-surface)',
};

const titleInputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  height: 42,
  padding: '0 13px',
  border: '1px solid var(--border-strong)',
  borderRadius: 'var(--r-md)',
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--ink-900)',
  fontFamily: 'inherit',
  background: 'var(--bg-surface)',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 12px',
  border: '1px solid var(--border-strong)',
  borderRadius: 'var(--r-md)',
  fontSize: 13.5,
  lineHeight: 1.6,
  color: 'var(--ink-700)',
  fontFamily: 'inherit',
  background: 'var(--bg-surface)',
  resize: 'vertical',
};
