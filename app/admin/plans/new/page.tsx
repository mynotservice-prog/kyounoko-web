import type { Metadata } from 'next';
import Link from 'next/link';
import { NewPlanClient } from './NewPlanClient';
import { PageHeader } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '新規プラン · Admin · きょうのこ',
  robots: { index: false, follow: false },
};

/**
 * /admin/plans/new
 *
 * 新しいプラン（content/plans/*.md）を作成する。/api/admin/edit-content（kind=plan）
 * が GitHub commit → Vercel 自動デプロイで本番反映。作成後は /admin/plans/[id]/edit で
 * 本文を編集できる。
 */
export default function NewPlanPage() {
  return (
    <>
      <PageHeader
        title="新規プラン"
        subtitle="今日の答え（Finder が返す行動プラン）を1件作成します。条件（年齢・天気・場所・時間・予算）が Finder のマッチングに使われます。"
      />
      <NewPlanClient />
      <div style={{ marginTop: 20, fontSize: 13 }}>
        <Link href="/admin/plans" style={{ color: 'var(--accent)' }}>← プラン一覧へ戻る</Link>
      </div>
    </>
  );
}
