import type { Metadata } from 'next';
import Link from 'next/link';
import { EVENTS, eventHeroImage } from '@/lib/events';
import { getAllEventOverrides } from '@/lib/event-overrides';
import { PageHeader, Card, Mono } from '@/components/admin/ui';
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
      <PageHeader
        title="イベント画像編集"
        subtitle={`全 ${EVENTS.length} 件のイベント hero 画像を差し替え可能`}
      />

      <p style={{ fontSize: 13, color: 'var(--ink-600)', margin: '0 0 18px', lineHeight: 1.7 }}>
        画像 URL は{' '}
        <Mono color="var(--ink-700)">/v2/articles/kk-XX.webp</Mono> 等の内部パスを指定してください。
        空欄で保存すると override が削除され、自動選択（KKプール）に戻ります。
      </p>

      <div
        style={{
          marginBottom: 20,
          padding: '12px 16px',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-faint)',
          borderRadius: 'var(--r-lg)',
          fontSize: 12,
          color: 'var(--ink-600)',
          lineHeight: 1.7,
        }}
      >
        ヒント: 使える KKプール画像は{' '}
        <Mono color="var(--ink-700)">/v2/articles/kk-01.webp</Mono> 〜{' '}
        <Mono color="var(--ink-700)">/v2/articles/kk-45.webp</Mono>（45枚）です。
        他に <Mono color="var(--ink-700)">/v2/events/show-museum.webp</Mono> や{' '}
        <Mono color="var(--ink-700)">/v2/events/seasonal-summer.webp</Mono> 等の D系画像、
        <Mono color="var(--ink-700)">/photos/...</Mono> 配下のアップロード画像も指定可能。
      </div>

      <EventImagesClient rows={rows} />

      <div style={{ marginTop: 40 }}>
        <Card title="関連">
          <ul
            style={{
              margin: 0,
              padding: '4px 18px 4px 38px',
              fontSize: 13,
              lineHeight: 2,
              color: 'var(--ink-700)',
            }}
          >
            <li>
              <Link href="/admin/events" style={{ color: 'var(--accent)' }}>
                イベント計測ダッシュボード（GA4）
              </Link>
            </li>
            <li>
              <Link href="/admin" style={{ color: 'var(--accent)' }}>
                管理ダッシュボード
              </Link>
            </li>
          </ul>
        </Card>
      </div>
    </>
  );
}
