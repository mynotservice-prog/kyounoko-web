'use client';

export function PrintButton({ label = '🖨 印刷する / PDFで保存' }: { label?: string }) {
  return (
    <div className="print-cta">
      <button type="button" onClick={() => window.print()}>
        {label}
      </button>
      <p style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-mute)' }}>
        ブラウザの印刷ダイアログから「PDFとして保存」も選べます
      </p>
    </div>
  );
}
