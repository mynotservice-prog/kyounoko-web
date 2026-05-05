'use client';

import { useState } from 'react';

type Props = {
  filename: string;
  /** CSVヘッダ（日本語可、1行目）。 */
  headers: string[];
  /** 各行のフィールド配列。各セルはエスケープ済みでなくてOK（このコンポーネント内でCSVエスケープ）。 */
  rows: (string | number | boolean | null | undefined)[][];
  /** ボタンのラベル。 */
  label?: string;
};

/**
 * クライアント側でCSVを生成して blob URL でダウンロードさせるボタン。
 * サーバー側のリクエストは不要（force-static対応）。
 *
 * Excelで日本語を文字化けさせないため UTF-8 BOM 付きで出力。
 */
export function CsvDownloadButton({ filename, headers, rows, label = 'CSVダウンロード' }: Props) {
  const [downloading, setDownloading] = useState(false);

  const handleClick = () => {
    setDownloading(true);
    try {
      const escape = (v: string | number | boolean | null | undefined): string => {
        if (v === null || v === undefined) return '';
        const s = String(v);
        // RFC 4180: ダブルクォート/カンマ/改行を含む場合はクォートで囲み、" は "" にエスケープ
        if (/[",\n\r]/.test(s)) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };
      const lines: string[] = [];
      lines.push(headers.map(escape).join(','));
      for (const row of rows) {
        lines.push(row.map(escape).join(','));
      }
      // Excel で UTF-8 として正しく開けるよう BOM を先頭に付与
      const csv = '﻿' + lines.join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // 次フレームで revoke（DLダイアログが出た後に解放）
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={downloading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 18px',
        background: 'var(--clay-deep, #B0432B)',
        color: '#fff',
        border: 'none',
        borderRadius: 999,
        fontSize: 13.5,
        fontWeight: 600,
        cursor: downloading ? 'wait' : 'pointer',
        opacity: downloading ? 0.7 : 1,
      }}
      aria-label={label}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {label}
      <span style={{ fontSize: 11, opacity: 0.8 }}>({rows.length.toLocaleString()}件)</span>
    </button>
  );
}
