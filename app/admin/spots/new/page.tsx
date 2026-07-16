import type { Metadata } from 'next';
import Link from 'next/link';
import { NewSpotClient } from './NewSpotClient';
import { PageHeader } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '新規スポット · Admin · きょうのこ',
  robots: { index: false, follow: false },
};

/**
 * /admin/spots/new
 *
 * 新しいスポットを1件作成する。lib/spots-extra/admin-created.json に追記して
 * GitHub commit → Vercel 自動デプロイで本番反映（ビルド時に SPOTS へマージ）。
 * 細かい設備・料金・FAQ・画像分散などは作成後に /admin/spots/edit で追記できる。
 */
export default function NewSpotPage() {
  return (
    <>
      <PageHeader
        title="新規スポット"
        subtitle="施設名・エリア・カテゴリ等を入力して新しいスポットを作成します。作成後の詳細は「スポット編集」で追記できます。"
      />
      <NewSpotClient />
      <div style={{ marginTop: 20, fontSize: 13 }}>
        <Link href="/admin/spots" style={{ color: 'var(--accent)' }}>← スポット一覧へ戻る</Link>
      </div>
    </>
  );
}
