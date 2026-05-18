'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

type Props = {
  url: string;
};

export function CopyLinkButton({ url }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    trackEvent('share_click', { platform: 'copy' });
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        // フォールバック：古いブラウザ向け
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
        } catch {
          // 何もしない
        }
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // 失敗しても UI を壊さない
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="share-btn share-btn-copy"
      aria-label="記事のURLをコピーする"
    >
      <svg
        viewBox="0 0 24 24"
        width="15"
        height="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
      </svg>
      <span>{copied ? 'コピーしました' : 'リンクをコピー'}</span>
    </button>
  );
}
