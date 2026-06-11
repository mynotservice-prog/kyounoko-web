'use client';

import React from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * LINE友だち追加CTA。
 *
 * NEXT_PUBLIC_LINE_ADD_FRIEND_URL（LINE公式アカウントの友だち追加URL
 * https://lin.ee/xxxx）が設定されているときだけ描画される。
 * 未設定のうちは何も出ないので、コードを先にデプロイしておき、
 * アカウント開設後に env を設定するだけで全ページのCTAが有効になる。
 * 開設手順と配信テンプレ: docs/line-launch-kit.md
 */

const LINE_URL = process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL;
const LINE_GREEN = '#06C755';

export function LineCta({ variant }: { variant: 'banner' | 'article' }) {
  if (!LINE_URL) return null;

  const isArticle = variant === 'article';
  return (
    <section
      aria-label="LINEで週末情報を受け取る"
      style={{
        background: '#f2fbf4',
        border: '1px solid #cdeed6',
        borderRadius: 16,
        padding: '14px 16px',
        marginTop: isArticle ? 28 : 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
        <strong style={{ fontSize: 14.5, display: 'block' }}>
          「週末どこ行く？」を金曜の夕方にお届け
        </strong>
        <span style={{ fontSize: 12.5, color: '#5d7263' }}>
          天気に合わせたおでかけ先3つをLINEで。登録は10秒、いつでも解除OK。
        </span>
      </div>
      <a
        href={LINE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('line_add_click', { placement: variant })}
        style={{
          background: LINE_GREEN,
          color: '#fff',
          fontWeight: 700,
          fontSize: 13.5,
          padding: '10px 18px',
          borderRadius: 999,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        LINEで友だち追加
      </a>
    </section>
  );
}
