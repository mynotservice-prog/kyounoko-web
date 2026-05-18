'use client';

import { trackEvent } from '@/lib/analytics';

/**
 * /downloads 配下の各資料ページで「印刷 / PDF保存」ボタンを担う。
 * docId が指定されていれば download_click を GA4 に送信する（任意）。
 */
export function PrintButton({ label = '🖨 印刷する / PDFで保存', docId }: { label?: string; docId?: string }) {
  return (
    <div className="print-cta">
      <button
        type="button"
        onClick={() => {
          trackEvent('download_click', { doc_id: docId });
          window.print();
        }}
      >
        {label}
      </button>
      <p style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-mute)' }}>
        ブラウザの印刷ダイアログから「PDFとして保存」も選べます
      </p>
    </div>
  );
}
