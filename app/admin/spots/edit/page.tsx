import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllSpotsWithSlug } from '@/lib/spots';
import { getAllSpotOverrides } from '@/lib/spot-overrides';
import { SpotsEditClient } from './SpotsEditClient';

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
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 26, margin: '0 0 6px' }}>
          スポット編集
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-mute)', margin: 0, lineHeight: 1.7 }}>
          全 {entries.length} 件のスポットを編集可能。施設名・料金・予約・穴場・子連れ設備などを修正できます。<br />
          保存すると GitHub に commit → Vercel が自動デプロイで本番反映（数分）。<br />
          施設名や市区町村を変えても URL（slug）は変わらないため、リンク切れは起きません。
        </p>
      </div>

      <SpotsEditClient entries={entries} overrides={overrides} />

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
          <li><Link href="/admin/spots">スポット一覧</Link></li>
          <li><Link href="/admin/events/edit">イベント編集</Link></li>
          <li><Link href="/admin">管理ダッシュボード</Link></li>
        </ul>
      </div>
    </>
  );
}
