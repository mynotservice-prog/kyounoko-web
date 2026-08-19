import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllSpotsWithSlug, SPOT_CATEGORY_LABEL, type Spot } from '@/lib/spots';
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
/** 一度に返す件数。全件ぶんの本文（穴場メモ等）を送るとHTMLが2.2MBになるため窓を切る。 */
const WINDOW = 40;

function matches(e: { slug: string; area: string; spot: Spot }, nq: string): boolean {
  const s = e.spot;
  return (
    e.slug.toLowerCase().includes(nq) ||
    s.name.toLowerCase().includes(nq) ||
    (s.city ?? '').toLowerCase().includes(nq) ||
    (s.ward ?? '').toLowerCase().includes(nq) ||
    e.area.toLowerCase().includes(nq) ||
    SPOT_CATEGORY_LABEL[s.category].includes(nq)
  );
}

export default async function SpotsEditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = ((await searchParams).q ?? '').trim();
  const all = getAllSpotsWithSlug();
  const overrides = getAllSpotOverrides();

  // 絞り込みをサーバ側でやり、クライアントには表示ぶんの実データだけ渡す。
  // 全723件の spot をそのまま渡していた頃はHTMLが2.2MBあり、その大半が
  // 画面に出ない穴場メモ・FAQ本文だった。
  const filtered = q ? all.filter((e) => matches(e, q.toLowerCase())) : all;
  const entries = filtered.slice(0, WINDOW);

  // 近隣スポット選択のプルダウンだけは全件必要なので、軽い索引を別に渡す。
  const spotIndex = all.map((e) => ({
    slug: e.slug,
    name: e.spot.name,
    area: e.spot.ward || e.spot.city || String(e.area),
  }));

  // 表示ぶんの override だけ渡す（全件だと override 側も重い）
  const shownOverrides = Object.fromEntries(
    entries.map((e) => [e.slug, overrides[e.slug]]).filter(([, v]) => v),
  ) as typeof overrides;

  return (
    <>
      <PageHeader title="スポット編集" subtitle={`全 ${all.length} 件のスポットを編集可能`} />

      <p style={{ fontSize: 13, color: 'var(--ink-600)', margin: '0 0 20px', lineHeight: 1.7 }}>
        施設名・料金・予約・穴場・子連れ設備などを修正できます。<br />
        保存すると GitHub に commit → Vercel が自動デプロイで本番反映（数分）。<br />
        施設名や市区町村を変えても URL（slug）は変わらないため、リンク切れは起きません。
      </p>

      <SpotsEditClient
        entries={entries}
        overrides={shownOverrides}
        spotIndex={spotIndex}
        query={q}
        matchedCount={filtered.length}
        totalCount={all.length}
        windowSize={WINDOW}
        editedCount={Object.keys(overrides).length}
      />

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
