#!/usr/bin/env node
/**
 * スポットDBの鮮度レポート（再確認キュー）。管理画面 /admin/spots/freshness と同じ集計を
 * CLI から出す。Basic 認証なしで見たいとき・週次で機械的に回したいとき用。
 *
 * 使い方（Node 24 系で実行する。type stripping と解決フックが要るため）:
 *   ~/.nvm/versions/node/v24.14.0/bin/node --import ./scripts/_ts-resolve.mjs \
 *     scripts/spot-freshness-report.mjs
 *
 *   --limit=40     キューの表示件数（既定30）
 *   --state=stale  絞り込み（stale / unverified / aging / fresh / closed / queue / all）
 *
 * 確認したら lib/spot-facilities.ts（公式裏取り）か lib/kid-reports.ts（実訪問）の
 * 該当エントリを更新し `node scripts/seed-spot-verification.mjs` を回す。
 */
import { getAllSpotsWithSlug, SPOT_CATEGORY_LABEL } from '../lib/spots.ts';
import { getSpotFreshness, recheckPriority, isChainRedirected } from '../lib/spot-verification.ts';

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const LIMIT = Number(arg('limit', '30'));
const STATE = arg('state', 'queue');

const STATE_LABEL = {
  fresh: '確認済み',
  aging: 'そろそろ',
  stale: '期限切れ',
  unverified: '未確認',
  closed: '閉店済み',
};

const now = new Date();
const allRows = getAllSpotsWithSlug();
// 301 で記事へ飛ぶチェーンスポットは公開ページが無いので集計から外す。
const redirected = allRows.filter((r) => isChainRedirected(r.slug)).length;
const rows = allRows
  .filter(({ slug }) => !isChainRedirected(slug))
  .map(({ slug, spot }) => {
    const f = getSpotFreshness(spot, now);
    return { slug, spot, f, priority: recheckPriority(spot, f) };
  });

const counts = { fresh: 0, aging: 0, stale: 0, unverified: 0, closed: 0 };
for (const r of rows) counts[r.f.state] += 1;
const total = rows.length;
const verified = counts.fresh + counts.aging;

const h = (t) => console.log(`\n\x1b[1m═══ ${t} ═══\x1b[0m`);
const pad = (s, n) => String(s).padStart(n);

console.log(`\x1b[1mスポット鮮度レポート\x1b[0m  ${now.toISOString().slice(0, 10)}`);
console.log(
  `対象 ${total}件 / 確認記録あり ${verified}件（${((verified / total) * 100).toFixed(0)}%）` +
    `　※チェーン ${redirected}件は /spot が301で記事へ飛ぶため集計外`,
);

h('1. 状態別');
for (const [k, v] of Object.entries(counts)) {
  console.log(`  ${STATE_LABEL[k].padEnd(6, '　')} ${pad(v, 5)}件  ${((v / total) * 100).toFixed(1)}%`);
}

h('2. カテゴリ別（要対応 = 期限切れ + 未確認）');
const byCat = new Map();
for (const r of rows) {
  const c = byCat.get(r.spot.category) ?? { total: 0, verified: 0, queue: 0 };
  c.total += 1;
  if (r.f.state === 'fresh' || r.f.state === 'aging') c.verified += 1;
  if (r.f.state === 'stale' || r.f.state === 'unverified') c.queue += 1;
  byCat.set(r.spot.category, c);
}
for (const [cat, c] of [...byCat.entries()].sort((a, b) => b[1].queue - a[1].queue)) {
  const label = SPOT_CATEGORY_LABEL[cat] ?? cat;
  console.log(
    `  ${label.padEnd(8, '　')} 件数${pad(c.total, 5)}  確認済み${pad(c.verified, 5)}  要対応${pad(c.queue, 5)}  カバー率${pad(Math.round((c.verified / c.total) * 100), 4)}%`,
  );
}

h(`3. 再確認キュー（${STATE_LABEL[STATE] ?? STATE}・優先度順 上位${LIMIT}件）`);
const matches = (s) =>
  STATE === 'all' ? true : STATE === 'queue' ? s === 'stale' || s === 'unverified' : s === STATE;
const queue = rows
  .filter((r) => matches(r.f.state))
  .sort((a, b) => b.priority - a.priority || a.spot.name.localeCompare(b.spot.name, 'ja'));

console.log(`  該当 ${queue.length}件`);
for (const r of queue.slice(0, LIMIT)) {
  const age = r.f.ageDays != null ? `${r.f.ageDays}日経過` : '記録なし';
  const over = r.f.overdueDays > 0 ? `+${r.f.overdueDays}日超過` : '';
  const flags = [r.spot.popular && '人気', r.spot.kidReport && '実訪問'].filter(Boolean).join(',');
  console.log(
    `  ${pad(r.priority, 4)}  ${STATE_LABEL[r.f.state].padEnd(6, '　')} ${(SPOT_CATEGORY_LABEL[r.spot.category] ?? r.spot.category).padEnd(6, '　')} ${r.spot.name.padEnd(24, '　').slice(0, 24)} ${age.padStart(9)} ${over.padStart(11)}  ${flags}`,
  );
}
