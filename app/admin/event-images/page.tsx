import type { Metadata } from 'next';
import Link from 'next/link';
import { EVENTS, eventHeroImage } from '@/lib/events';
import { getAllEventOverrides } from '@/lib/event-overrides';
import { EventImagesClient } from './EventImagesClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'イベント画像編集 · Admin · きょうのこ',
  robots: { index: false, follow: false },
};

/**
 * /admin/event-images
 *
 * 100件のイベントを一覧表示し、各イベントの hero 画像を任意の URL に差し替え。
 * 保存先: lib/event-overrides.json
 *   - ローカル開発: ファイル直接書き込み
 *   - 本番: GitHub Contents API で commit → 自動デプロイ
 *
 * 認証: middleware で Basic Auth、編集は ALLOW_ADMIN_EDIT=1 + referer check
 */
export default function EventImagesAdminPage() {
  const overrides = getAllEventOverrides();
  const rows = EVENTS.map((e) => ({
    slug: e.slug,
    title: e.title,
    category: e.category,
    venue: e.venue,
    startDate: e.startDate,
    endDate: e.endDate,
    /** 現在配信されている hero（overrides → trusted → KK pool 経由） */
    currentImg: eventHeroImage(e),
    /** override 値（編集中のソース）— 無ければ空文字 */
    override: overrides[e.slug]?.hero ?? '',
    /** 元の hero フィールド値 */
    originalHero: e.hero ?? '',
  }));

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 26, margin: '0 0 6px' }}>
          イベント画像編集
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-mute)', margin: 0, lineHeight: 1.7 }}>
          全 {EVENTS.length} 件のイベント hero 画像を差し替え可能。<br />
          画像 URL は <code>/v2/articles/kk-XX.webp</code> 等の内部パスを指定してください。
          空欄で保存すると override が削除され、自動選択（KKプール）に戻ります。
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
        💡 ヒント: 使える KKプール画像は <code>/v2/articles/kk-01.webp</code> 〜{' '}
        <code>/v2/articles/kk-45.webp</code>（45枚）です。
        他に <code>/v2/events/show-museum.webp</code> や{' '}
        <code>/v2/events/seasonal-summer.webp</code> 等の D系画像、
        <code>/photos/...</code> 配下のアップロード画像も指定可能。
      </div>

      <EventImagesClient rows={rows} />

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
