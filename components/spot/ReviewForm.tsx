'use client';

import * as React from 'react';
import Script from 'next/script';
import { trackEvent } from '@/lib/analytics';

/**
 * 口コミ投稿フォーム（P1-8・画面D/E）。ログイン不要。
 * Turnstile（NEXT_PUBLIC_TURNSTILE_SITE_KEY 設定時のみ表示）＋送信→承認制の案内。
 */
type AgeBand = '0-1' | '2-3' | '4-6';

export function ReviewForm({ spotId, spotName }: { spotId: string; spotName: string }) {
  const [open, setOpen] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [nickname, setNickname] = React.useState('');
  const [anon, setAnon] = React.useState(false);
  const [ageBand, setAgeBand] = React.useState<AgeBand | ''>('');
  const [body, setBody] = React.useState('');
  const [token, setToken] = React.useState('');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [license, setLicense] = React.useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    const next = [...files, ...picked].slice(0, 3);
    setFiles(next);
    e.target.value = '';
  };

  const submit = async () => {
    setError('');
    if (rating < 1) return setError('評価を選んでください');
    if (!anon && (nickname.trim().length < 1 || nickname.trim().length > 20)) return setError('ニックネームは1〜20字で入力してください');
    if (body.trim().length < 10) return setError('本文は10字以上で入力してください');
    if (files.length > 0 && !license) return setError('写真を添付する場合は利用規約への同意が必要です');
    if (siteKey && !token) return setError('「私は人間です」の認証を完了してください');
    setSubmitting(true);
    try {
      // 写真を先にアップロード（サーバでEXIF除去→Blob）
      const photoUrls: string[] = [];
      for (const f of files) {
        const fd = new FormData();
        fd.append('file', f);
        const up = await fetch('/api/reviews/upload', { method: 'POST', body: fd });
        const uj = await up.json();
        if (!up.ok || !uj.ok) {
          setError(uj.error || '写真のアップロードに失敗しました');
          setSubmitting(false);
          return;
        }
        photoUrls.push(uj.url);
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotId,
          rating,
          nickname: anon ? '匿名' : nickname.trim(),
          isAnonymous: anon,
          childAgeBand: ageBand || undefined,
          body: body.trim(),
          photos: photoUrls,
          licenseAgreed: license,
          turnstileToken: token,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || '送信に失敗しました');
        setSubmitting(false);
        return;
      }
      trackEvent('review_submit', { spot_id: spotId });
      setDone(true);
    } catch {
      setError('通信エラーが発生しました');
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} style={writeBtn}>
        ✏ 口コミを書く
      </button>
    );
  }

  if (done) {
    return (
      <div style={panel}>
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: 34 }}>✓</div>
          <p style={{ fontWeight: 800, fontSize: 15, margin: '6px 0' }}>口コミありがとうございます！</p>
          <p style={{ fontSize: 13, color: 'var(--v2-ink-mute)' }}>内容を確認のうえ、1〜2日で公開します。</p>
          <button type="button" onClick={() => setOpen(false)} style={{ ...writeBtn, marginTop: 12 }}>
            スポットに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={panel}>
      {siteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <strong style={{ fontSize: 15 }}>口コミを書く</strong>
        <button type="button" onClick={() => setOpen(false)} aria-label="閉じる" style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--v2-ink-mute)' }}>✕</button>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--v2-ink-mute)', margin: '0 0 12px' }}>{spotName}</p>

      <Field label="評価（必須）">
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n}点`} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, lineHeight: 1, color: n <= rating ? '#f5a623' : '#d8d0c4', padding: 0 }}>★</button>
          ))}
        </div>
      </Field>

      <Field label="ニックネーム（必須・20字まで）">
        <input value={anon ? '' : nickname} disabled={anon} onChange={(e) => setNickname(e.target.value)} maxLength={20} placeholder={anon ? '匿名' : 'ゆうママ'} style={input} />
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, marginTop: 6, color: 'var(--v2-ink-soft)' }}>
          <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} /> 匿名で投稿する
        </label>
      </Field>

      <Field label="お子さんの年齢（任意）">
        <div style={{ display: 'flex', gap: 7 }}>
          {(['0-1', '2-3', '4-6'] as AgeBand[]).map((b) => (
            <button key={b} type="button" onClick={() => setAgeBand(ageBand === b ? '' : b)} style={chip(ageBand === b)}>
              {b === '0-1' ? '0〜1歳' : b === '2-3' ? '2〜3歳' : '4〜6歳'}
            </button>
          ))}
        </div>
      </Field>

      <Field label="本文（必須・10〜500字）">
        <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={500} rows={4} placeholder="ベビーカーで回りやすかった、授乳室がきれいだった など" style={{ ...input, resize: 'vertical' }} />
        <div style={{ fontSize: 11, color: 'var(--v2-ink-mute)', textAlign: 'right' }}>{body.length}/500</div>
      </Field>

      <Field label="写真（任意・最大3枚 / 1枚5MBまで）">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {files.map((f, i) => (
            <div key={i} style={{ position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={URL.createObjectURL(f)} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--v2-line)' }} />
              <button type="button" aria-label="削除" onClick={() => setFiles(files.filter((_, j) => j !== i))}
                style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', border: 'none', background: '#333', color: '#fff', fontSize: 12, cursor: 'pointer', lineHeight: '20px' }}>✕</button>
            </div>
          ))}
          {files.length < 3 && (
            <label style={{ ...chip(false), cursor: 'pointer' }}>
              ＋ 写真を追加
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={onPickFiles} style={{ display: 'none' }} />
            </label>
          )}
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--v2-ink-mute)', margin: '6px 0 0', lineHeight: 1.6 }}>
          ⚠ お子さんや他の方の顔が写らない構図でのご投稿にご協力ください（位置情報は自動で削除されます）。
        </p>
        {files.length > 0 && (
          <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, marginTop: 8, color: 'var(--v2-ink-soft)', lineHeight: 1.6 }}>
            <input type="checkbox" checked={license} onChange={(e) => setLicense(e.target.checked)} style={{ marginTop: 2 }} />
            <span>投稿写真を、本サイトがこのスポットの紹介画像等に利用することに同意します（<a href="/terms" target="_blank" rel="noopener" style={{ color: 'var(--v2-orange-deep)' }}>規約</a>）。</span>
          </label>
        )}
      </Field>

      {siteKey && (
        <div className="cf-turnstile" data-sitekey={siteKey} data-callback="onTurnstile"
          ref={(el) => {
            if (el) (window as unknown as { onTurnstile?: (t: string) => void }).onTurnstile = (t: string) => setToken(t);
          }}
          style={{ margin: '4px 0 12px' }} />
      )}

      {error && <p style={{ color: '#e0574c', fontSize: 13, margin: '0 0 10px' }}>{error}</p>}

      <button type="button" onClick={submit} disabled={submitting} style={{ ...submitBtn, opacity: submitting ? 0.6 : 1 }}>
        {submitting ? '送信中…' : '投稿する'}
      </button>
      <p style={{ fontSize: 11.5, color: 'var(--v2-ink-mute)', textAlign: 'center', marginTop: 8 }}>
        投稿は確認後に公開されます。お子さんや他の方の顔が写らない構図での投稿にご協力ください。
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--v2-ink)', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

const writeBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 999,
  border: '1px solid var(--v2-orange)', background: 'var(--v2-orange-tint, #fff2e8)',
  color: 'var(--v2-orange-deep, #c05a1e)', fontSize: 14, fontWeight: 800, cursor: 'pointer',
};
const panel: React.CSSProperties = {
  marginTop: 12, padding: 16, borderRadius: 14, border: '1px solid var(--v2-line)', background: 'var(--v2-card, #fff)',
};
const input: React.CSSProperties = {
  width: '100%', padding: '9px 11px', borderRadius: 9, border: '1px solid var(--v2-line)', fontSize: 14, boxSizing: 'border-box',
};
const submitBtn: React.CSSProperties = {
  width: '100%', padding: 12, borderRadius: 11, border: 'none', background: 'var(--v2-orange)', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer',
};
function chip(on: boolean): React.CSSProperties {
  return {
    padding: '7px 12px', borderRadius: 999, border: '1px solid ' + (on ? 'var(--v2-orange)' : 'var(--v2-line)'),
    background: on ? 'var(--v2-orange-tint, #fff2e8)' : 'var(--v2-bg, #faf6ef)', color: on ? 'var(--v2-orange-deep)' : 'var(--v2-ink)',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  };
}
