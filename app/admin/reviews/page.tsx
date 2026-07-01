'use client';

import * as React from 'react';

/**
 * 口コミ承認キュー（P1-8・画面F）。/admin 配下＝middlewareのBasic Authで保護。
 * ブラウザが同一オリジンにBasic認証情報を自動付与するので、fetchはそのまま通る。
 */
type PendingReview = {
  id: string;
  spotId: string;
  rating: number;
  nickname: string;
  childAgeBand?: string;
  body: string;
  photos?: { url: string; promotedToSpotImage?: boolean }[];
  createdAt: number;
};

const AGE_LABEL: Record<string, string> = { '0-1': '0〜1歳', '2-3': '2〜3歳', '4-6': '4〜6歳' };

export default function AdminReviewsPage() {
  const [items, setItems] = React.useState<PendingReview[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews', { cache: 'no-store' });
      const json = await res.json();
      setItems(json.pending ?? []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const moderate = async (r: PendingReview, action: 'approve' | 'reject') => {
    setBusy(r.id);
    try {
      await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotId: r.spotId, id: r.id, action }),
      });
      setItems((prev) => prev.filter((x) => x.id !== r.id));
    } catch {
      /* noop */
    }
    setBusy(null);
  };

  const promote = async (r: PendingReview, url: string) => {
    setBusy(r.id);
    try {
      await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotId: r.spotId, id: r.id, action: 'promote', url }),
      });
      setItems((prev) => prev.filter((x) => x.id !== r.id)); // 昇格=承認も兼ねるので queue から外れる
    } catch {
      /* noop */
    }
    setBusy(null);
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
        口コミ承認キュー{!loading && `（未承認 ${items.length} 件）`}
      </h1>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
        承認した口コミのみ公開され、★平均に反映されます。他人が識別できる写真は本文では扱いません（写真投稿はP1-8b）。
      </p>

      {loading ? (
        <p>読み込み中…</p>
      ) : items.length === 0 ? (
        <p style={{ color: '#888' }}>未承認の口コミはありません。</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((r) => (
            <div key={r.id} style={{ border: '1px solid #e5e5e5', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ color: '#f5a623' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <strong>{r.nickname}</strong>
                {r.childAgeBand && <span style={{ fontSize: 12, color: '#888' }}>・{AGE_LABEL[r.childAgeBand] ?? r.childAgeBand}</span>}
                <span style={{ fontSize: 11, color: '#aaa', marginLeft: 'auto' }}>spot: {r.spotId}</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>{r.body}</p>
              {r.photos && r.photos.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: '#b42318', fontWeight: 700, marginBottom: 6 }}>
                    ⚠ 写真: 他人が識別できる顔が写る場合は「却下」してください（顔検出は未導入・目視確認）
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {r.photos.map((p, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt="" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e5e5', display: 'block' }} />
                        <button type="button" disabled={busy === r.id} onClick={() => promote(r, p.url)} style={{ ...btn('#7a4fd0'), padding: '5px 10px', fontSize: 11, marginTop: 4 }}>
                          代表画像に昇格
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" disabled={busy === r.id} onClick={() => moderate(r, 'approve')} style={btn('#1a7f37')}>承認</button>
                <button type="button" disabled={busy === r.id} onClick={() => moderate(r, 'reject')} style={btn('#b42318')}>却下</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function btn(color: string): React.CSSProperties {
  return { padding: '8px 20px', borderRadius: 8, border: 'none', background: color, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' };
}
