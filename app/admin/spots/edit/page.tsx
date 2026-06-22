import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllSpotsWithSlug } from '@/lib/spots';
import { getAllSpotOverrides } from '@/lib/spot-overrides';
import { SpotsEditClient } from './SpotsEditClient';
import { PageHeader } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'スポット編集 · Admin · きょうのこ',
  robots: { index: false, follow: false },
};

/**
 * /admin/spots/edit
 *
 * 全スポットの主要フィールド（施設名/市区町村/メモ/料金/予約/穴場/料金詳細/
 * 子連れ設備）を編集可能。施設からの返信に合わせて即修正できる。
 *
 * 保存:
 *   - lib/spot-overrides.json に slug → 差分 patch を保存
 *   - ローカル開発: ファイル直接書き込み
 *   - 本番: GitHub Contents API で commit → Vercel 自動デプロイ
 *
 * 表示時のマージ:
 *   - getAllSpotsWithSlug() が spot-overrides.json を slug 算出後に自動マージ。
 *     施設名・市区町村を変えても slug（URL）は不変なのでリンク切れしない。
 */
export default function SpotsEditPage() {
  const entries = getAllSpotsWithSlug();
  const overrides = getAllSpotOverrides();

  return (
    <>
      <PageHeader title="スポット編集" subtitle={`全 ${entries.length} 件のスポットを編集可能`} />

      <p style={{ fontSize: 13, color: 'var(--ink-600)', margin: '0 0 20px', lineHeight: 1.7 }}>
        施設名・料金・予約・穴場・子連れ設備などを修正できます。<br />
        保存すると GitHub に commit → Vercel が自動デプロイで本番反映（数分）。<br />
        施設名や市区町村を変えても URL（slug）は変わらないため、リンク切れは起きません。
      </p>

      <SpotsEditClient entries={entries} overrides={overrides} />

      <div
        style={{
          marginTop: 40,
          padding: 18,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)', margin: '0 0 8px' }}>関連</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.95, color: 'var(--ink-700)' }}>
          <li><Link href="/admin/spots">スポット一覧</Link></li>
          <li><Link href="/admin/events/edit">イベント編集</Link></li>
          <li><Link href="/admin">管理ダッシュボード</Link></li>
        </ul>
      </div>
    </>
  );
}
