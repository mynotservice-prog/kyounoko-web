import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllEvents } from '@/lib/events';
import { getAllEventOverrides } from '@/lib/event-overrides';
import { EventsEditClient } from './EventsEditClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'イベント編集 · Admin · きょうのこ',
  robots: { index: false, follow: false },
};

/**
 * /admin/events/edit
 *
 * 100 件のイベント全フィールド（タイトル/lede/カテゴリ/日付/会場/エリア/料金/
 * 公式URL/対象年齢/タグ/編集部メモ/hero画像）を編集可能。
 *
 * 保存:
 *   - lib/event-overrides.json に slug → 差分 patch を保存
 *   - ローカル開発: ファイル直接書き込み
 *   - 本番: GitHub Contents API で commit → Vercel 自動デプロイ
 *
 * 表示時のマージ:
 *   - 各イベント取得関数（getAllEvents/getEventBySlug/getOngoingEvents 等）が
 *     event-overrides.json を自動マージするので、ここで保存すると即サイト全体に反映
 */
export default function EventsEditPage() {
  const merged = getAllEvents();
  const overrides = getAllEventOverrides();

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 26, margin: '0 0 6px' }}>
          イベント編集
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-mute)', margin: 0, lineHeight: 1.7 }}>
          全 {merged.length} 件のイベントを編集可能。タイトル・日付・会場・画像など全フィールドを修正できます。<br />
          保存すると GitHub に commit → Vercel が自動デプロイで本番反映（数分）。
        </p>
      </div>

      <div
        style={{
          marginBottom: 20,
          padding: '12px 16px',
          background: 'var(--paper-card)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-md)',
          fontSize: 12,
          color: 'var(--ink-sub)',
          lineHeight: 1.7,
        }}
      >
        💡 画像URLは <code>/v2/articles/kk-01.webp</code> 〜 <code>kk-45.webp</code>（KKプール45枚）または
        <code>/v2/events/show-museum.webp</code> 等の D系画像が使えます。<br />
        各フィールドを空にして保存すると、元の値（lib/events.ts の定義）に戻ります。
      </div>

      <EventsEditClient events={merged} overrides={overrides} />

      <div
        style={{
          marginTop: 40,
          padding: 20,
          background: 'var(--paper-card)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-mincho)', fontSize: 16, margin: '0 0 8px' }}>関連</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.95 }}>
          <li><Link href="/admin/events">イベント計測ダッシュボード（GA4）</Link></li>
          <li><Link href="/admin">管理ダッシュボード</Link></li>
        </ul>
      </div>
    </>
  );
}
