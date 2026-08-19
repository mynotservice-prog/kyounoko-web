#!/usr/bin/env node
/**
 * 季節営業スポットの「会期」の鮮度チェック（lib/spot-season.ts）。
 *
 * ── なぜ既存の spot-freshness-report.mjs では足りないか ────────────────
 * あちらは「最終確認からの経過日数 vs カテゴリ別TTL」だけを見る。だが季節施設には
 * それとは独立の軸がある:
 *   1. **会期の年が古い（stale-year）** … 去年の会期のまま。記事に去年の日付が出る。
 *      2026-08-19 の舎人公園の事故（2025年の告知 7/19〜8/31 を引用したまま、実際は
 *      2026年は 7/3〜9/29）はこれ。確認日ベースのTTLでは絶対に検出できない
 *      （8/19に確認済み＝fresh のまま、9/29に会期が閉じる）。
 *   2. **会期の終了が近い** … 来季に向けて再確認が要る。断崖の規模もここから積める。
 *
 * 使い方（Node 24 系）:
 *   ~/.nvm/versions/node/v24.14.0/bin/node --import ./scripts/_ts-resolve.mjs \
 *     scripts/check-season-freshness.mjs
 *
 *   --soon=30   「終了が近い」とみなす日数（既定30）
 *   --all       会期中・開催前のものも全部出す
 */
import { SPOT_SEASON, getSeasonState, daysUntilClose, formatSeasonPeriod, listSeasonsNeedingCheck } from '../lib/spot-season.ts';

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const SOON = Number(arg('soon', '30'));
const ALL = process.argv.includes('--all');

const ACTIVITY_LABEL = {
  mizuasobi: '水遊び',
  pool: '屋外プール',
  'onsui-pool': '温水プール',
  imohori: '芋掘り・収穫体験',
  playpark: 'プレーパーク',
  sori: 'ソリ・雪遊び',
  mushitori: '昆虫採集',
};
const STATE_LABEL = {
  open: '会期中',
  upcoming: '開催前',
  ended: '終了',
  'stale-year': '⚠️年が古い',
};

const now = new Date();
const total = Object.values(SPOT_SEASON).reduce((a, w) => a + w.length, 0);
console.log(`会期データ ${Object.keys(SPOT_SEASON).length}スポット / ${total}件  基準日 ${now.toISOString().slice(0, 10)}\n`);

const need = listSeasonsNeedingCheck(now, SOON);
if (need.length) {
  console.log(`── 要対応 ${need.length}件 ──`);
  for (const { spotName, window: w, state, daysLeft } of need) {
    const tag = state === 'stale-year' ? '⚠️ 年が古い（去年の会期のまま）' : `あと${daysLeft}日で終了`;
    console.log(`  ${tag}`);
    console.log(`    ${spotName}  [${ACTIVITY_LABEL[w.activity] ?? w.activity}]`);
    console.log(`    ${formatSeasonPeriod(w)} ${w.hours ?? ''}`);
    console.log(`    出典: ${w.source}（確認 ${w.checkedAt}）`);
  }
  console.log('');
} else {
  console.log('要対応なし\n');
}

if (ALL) {
  console.log('── 全件 ──');
  for (const [spotName, windows] of Object.entries(SPOT_SEASON)) {
    for (const w of windows) {
      const state = getSeasonState(w, now);
      console.log(
        `  ${STATE_LABEL[state].padEnd(10, '　')} ${formatSeasonPeriod(w).padEnd(24)} ` +
        `残${String(daysUntilClose(w, now)).padStart(4)}日  ${spotName} [${ACTIVITY_LABEL[w.activity] ?? w.activity}]`,
      );
    }
  }
}

// stale-year があれば非ゼロで終了する（CI/週次バッチで気づけるように）
const stale = need.filter((n) => n.state === 'stale-year');
if (stale.length) {
  console.error(`\n❌ 会期の年が古いデータが ${stale.length}件あります。記事に去年の日付が出ている可能性があります。`);
  process.exit(1);
}
