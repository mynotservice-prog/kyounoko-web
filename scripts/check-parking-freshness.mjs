#!/usr/bin/env node
/**
 * 駐車場データ（lib/spot-parking.ts）の鮮度チェック。
 *
 * ── なぜ check-parking-claims.mjs と別なのか ──────────────────────────
 * あちらは **記事本文の文字列**を走査して「営業時間を書かずに駐車場を断定している記事」を
 * 見つけるガード（対象 content/articles/*.md、ベースライン付き）。
 * こちらは **データ層**を見て「そもそも確認できていない／確認が古い駐車場データ」を洗う。
 * 対象データも失敗の定義も違い、片方に混ぜると
 *   - 記事ガードのベースラインにデータ層の穴が混ざって意味が壊れる
 *   - 段階3で記事本文がデータ描画に置き換わると、記事ガード側は役目を終えるがこちらは残る
 * ため、check-season-freshness.mjs（会期のデータ層チェック）と同じ形で別スクリプトにした。
 *
 * ── 何を出すか ────────────────────────────────────────────────
 *   unknown  … exists:'unknown' のまま放置（**最優先**。放置すると誰かが「あり」に倒す）
 *   no-hours … 「あり」なのに利用時間が無い（監査で施設固有の断定の86%がこれ。
 *              多摩の都立公園は 9:00〜17:00 の夜間閉鎖が標準なので実害が出る）
 *   no-fee   … 「あり」なのに料金が無い（確定した事実誤り5件のうち3件が料金）
 *   stale    … confirmedAt が古い（既定365日。都立公園の料金改定は年度単位）
 *
 * 使い方（Node 24 系）:
 *   ~/.nvm/versions/node/v24.14.0/bin/node --import ./scripts/_ts-resolve.mjs \
 *     scripts/check-parking-freshness.mjs
 *
 *   --stale=365  「確認が古い」とみなす日数（既定365）
 *   --all         全件を一覧表示する
 */
import {
  SPOT_PARKING,
  SPOT_PARKING_ALIAS,
  daysSinceConfirmed,
  listParkingNeedingCheck,
} from '../lib/spot-parking.ts';

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const STALE = Number(arg('stale', '365'));
const ALL = process.argv.includes('--all');

const REASON_LABEL = {
  unknown: '⚠️ 有無が未確認（exists: unknown）',
  'no-hours': '利用時間の記載なし',
  'no-fee': '料金の記載なし',
  stale: '確認が古い',
};
const EXISTS_LABEL = { true: 'あり', false: 'なし', unknown: '未確認' };

const now = new Date();
const names = Object.keys(SPOT_PARKING);
console.log(
  `駐車場データ ${names.length}スポット（別名 ${Object.keys(SPOT_PARKING_ALIAS).length}件が親施設に寄せられる）　` +
    `基準日 ${now.toISOString().slice(0, 10)}\n`,
);

const need = listParkingNeedingCheck(now, STALE);
if (need.length) {
  console.log(`── 要対応 ${need.length}件 ──`);
  for (const { spotName, parking: p, reasons, ageDays } of need) {
    console.log(`  ${spotName}  [駐車場: ${EXISTS_LABEL[String(p.exists)]}]  確認から${ageDays}日`);
    for (const r of reasons) console.log(`    - ${REASON_LABEL[r] ?? r}`);
    console.log(`    出典: ${p.sourceUrl}（確認 ${p.confirmedAt}）`);
  }
  console.log('');
} else {
  console.log('要対応なし\n');
}

if (ALL) {
  console.log('── 全件 ──');
  for (const [spotName, p] of Object.entries(SPOT_PARKING)) {
    console.log(
      `  ${EXISTS_LABEL[String(p.exists)].padEnd(4, '　')} ` +
        `${(p.capacity != null ? `${p.capacity}台` : '—').padStart(6)}  ` +
        `${(p.hours ?? '—').padEnd(20, '　')} ${(p.fee ?? '—').padEnd(28, '　')} ` +
        `確認${daysSinceConfirmed(p, now)}日前  ${spotName}`,
    );
  }
  console.log('');
}

// unknown を放置しているものがあれば非ゼロで終了する（週次バッチで気づけるように）。
// no-hours / no-fee / stale は「埋めるべき穴」だが、公式に記載が無いこともあるので落とさない。
const unknown = need.filter((n) => n.reasons.includes('unknown'));
if (unknown.length) {
  console.error(
    `\n❌ 有無が未確認（exists: 'unknown'）の駐車場が ${unknown.length}件あります。\n` +
      '   公式で確認して true / false に確定させてください。放置すると本文側で「あり」に倒されます。',
  );
  process.exit(1);
}
console.log('✅ 未確認の駐車場データなし');
