import type { Metadata } from 'next';
import Link from 'next/link';
import { NewEventClient } from './NewEventClient';
import { PageHeader } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '新規イベント · Admin · きょうのこ',
  robots: { index: false, follow: false },
};

/**
 * /admin/events/new
 *
 * 新しいイベントを1件作成する。lib/events-extra.json に追記して GitHub commit →
 * Vercel 自動デプロイで本番反映（ビルド時に EVENTS へマージ）。
 */
export default function NewEventPage() {
  return (
    <>
      <PageHeader
        title="新規イベント"
        subtitle="編集部が一次確認したイベントを1件作成します。作成後の修正は「イベント編集」でできます。"
      />
      <NewEventClient />
      <div style={{ marginTop: 20, fontSize: 13, display: 'flex', gap: 16 }}>
        <Link href="/admin/events/edit" style={{ color: 'var(--accent)' }}>← イベント編集へ</Link>
        <Link href="/admin/events" style={{ color: 'var(--accent)' }}>イベント分析へ</Link>
      </div>
    </>
  );
}
