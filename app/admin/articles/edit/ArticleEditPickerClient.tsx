'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminIcon } from '@/components/admin/icons';

export type ArticlePickRow = {
  slug: string;
  title: string;
  categoryName: string;
  updatedAt: string;
};

/** 記事を検索して編集画面へ飛ぶだけの軽量ピッカー（更新日降順）。 */
export function ArticleEditPickerClient({ rows }: { rows: ArticlePickRow[] }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(needle) ||
        r.slug.toLowerCase().includes(needle) ||
        r.categoryName.toLowerCase().includes(needle),
    );
  }, [rows, q]);

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: 14, borderBottom: '1px solid var(--border-divider)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'var(--ink-400)', display: 'flex' }}>
          <AdminIcon name="search" size={16} />
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="タイトル・slug・カテゴリで検索"
          autoFocus
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: 16, // iOSの自動ズーム回避
            background: 'transparent',
            color: 'var(--ink-900)',
            fontFamily: 'inherit',
          }}
        />
        <span style={{ fontSize: 12, color: 'var(--ink-400)', whiteSpace: 'nowrap' }}>{filtered.length} 件</span>
      </div>

      <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
        {filtered.length === 0 && (
          <div style={{ padding: 24, fontSize: 13, color: 'var(--ink-400)' }}>該当する記事がありません</div>
        )}
        {filtered.map((r) => (
          <Link
            key={r.slug}
            href={`/admin/articles/${r.slug}/edit`}
            className="admin-hover-bg"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 14px',
              borderBottom: '1px solid var(--border-divider)',
              textDecoration: 'none',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: 'var(--ink-900)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {r.title || r.slug}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                /{r.slug}
              </div>
            </div>
            <span
              style={{
                flex: '0 0 auto',
                fontSize: 11.5,
                color: 'var(--ink-500)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 999,
                padding: '3px 9px',
                whiteSpace: 'nowrap',
              }}
            >
              {r.categoryName}
            </span>
            <span style={{ flex: '0 0 auto', fontSize: 11.5, color: 'var(--ink-400)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {r.updatedAt}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
