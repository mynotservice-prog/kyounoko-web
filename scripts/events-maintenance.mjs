/**
 * イベント定期メンテナンス・レビュー用スクリプト（週次運用の起点）。
 *
 * 使い方:
 *   npx tsx scripts/events-maintenance.mjs            # 今日基準
 *   npx tsx scripts/events-maintenance.mjs 2026-08-01 # 日付を指定して確認
 *
 * 出力（docs/events-maintenance.md にも書き出し）:
 *   1) 終了した「年次イベント」 → 翌年に繰り上げる候補（要・公式日付確認）
 *   2) 終了した「単発イベント」 → 削除候補
 *   3) これから開催のイベント件数（月別）
 *   4) 開催予定イベントが無い都道府県（=今週の調査ターゲット）
 *   5) 季節カテゴリの穴（その季節に必要なカテゴリの在庫がゼロになっていないか）
 *   6) 発表待ちウォッチ（今月、公式を見に行くべき会場）
 *
 * ※ 日付の繰り上げは「同月同日 +1年」の機械計算。多くの祭りは「第N週末」など
 *   変動するため、必ず公式サイトで実際の翌年日程を確認してから反映すること。
 */
import fs from 'node:fs';
import { EVENTS } from '../lib/events.ts';
import { AREAS } from '../lib/area.ts';
import { ANNOUNCE_WATCH } from '../lib/event-announce-watch.ts';

const today = process.argv[2] || new Date().toISOString().slice(0, 10);

// 年次イベント判定: recurring フラグ、または category=matsuri、または定番キーワード
const ANNUAL_RE = /祭|まつり|花火|おどり|踊り|山笠|天王祭|ペーロン|開山|七夕|夜店|納涼|ナイト|サマー|ラベンダー|さくらんぼ|潮|夜の水族館/;
const isAnnual = (e) =>
  e.recurring === 'annual' || e.category === 'matsuri' || ANNUAL_RE.test(e.title);

const rollOneYear = (d) => {
  const [y, m, day] = d.split('-').map(Number);
  return `${y + 1}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const areaName = {};
for (const a of AREAS) areaName[a.slug] = a.name;

const ended = EVENTS.filter((e) => e.endDate < today);
const upcoming = EVENTS.filter((e) => e.endDate >= today);
const endedAnnual = ended.filter(isAnnual);
const endedOneOff = ended.filter((e) => !isAnnual(e));

let md = `# イベント メンテナンス・レビュー\n\n> 基準日: ${today} ／ 全${EVENTS.length}件（開催予定${upcoming.length} / 終了${ended.length}）\n\n`;

// ---- 0. 存命カーブ（崖を事前に見えるようにする） ----
// イベントは会期が切れると /event/ の1日モデルコースも /spot/ の周辺イベント枠も消える。
// 「いつ在庫が尽きるか」を毎回この表で見て、補填のタイミングを外さないための指標。
const HORIZON_DAYS = [0, 14, 30, 45, 60, 90, 120];
const addDaysTo = (d, n) => {
  const t = new Date(d);
  t.setDate(t.getDate() + n);
  return t.toISOString().slice(0, 10);
};
const aliveOn = (d) => EVENTS.filter((e) => e.startDate <= d && e.endDate >= d);

md += `## 0. 存命カーブ（在庫が尽きる日）\n\n`;
md += `> 開催中の件数がゼロに近づくと、イベントページの1日モデルコースとスポットページの周辺イベント枠が同時に消える。\n`;
md += `> **開催中が20件を切る前に補填する**。冬イベントは9〜10月に公式発表が出そろうので、そこで一気に入れる。\n\n`;
md += `| 基準日 | 開催中 | 東京 | うち11月以降まで持つもの |\n|---|---|---|---|\n`;
for (const n of HORIZON_DAYS) {
  const d = addDaysTo(today, n);
  const alive = aliveOn(d);
  const tokyo = alive.filter((e) => e.area === 'tokyo').length;
  const durable = alive.filter((e) => e.endDate >= '2026-11-01').length;
  md += `| ${d}${n === 0 ? '（今日）' : `（+${n}日）`} | **${alive.length}件** | ${tokyo}件 | ${durable}件 |\n`;
}
const emptyDay = HORIZON_DAYS.find((n) => aliveOn(addDaysTo(today, n)).length < 20);
md += `\n`;
md += emptyDay === undefined
  ? `→ 今後${HORIZON_DAYS[HORIZON_DAYS.length - 1]}日は20件を下回らない。\n\n`
  : `→ **${addDaysTo(today, emptyDay)}（+${emptyDay}日）に開催中が20件を切る。それまでに補填が必要。**\n\n`;

md += `## 1. 終了した年次イベント — 翌年へ繰り上げ候補（${endedAnnual.length}件）\n\n`;
md += `> 下記の新日付は「同月同日+1年」の機械計算。**必ず公式サイトで翌年の実際の日程を確認**してから反映してください。\n\n`;
if (endedAnnual.length) {
  md += `| slug | タイトル | 現日付 | 繰り上げ候補 | 公式 |\n|---|---|---|---|---|\n`;
  for (const e of endedAnnual) {
    md += `| \`${e.slug}\` | ${e.title} | ${e.startDate}〜${e.endDate} | ${rollOneYear(e.startDate)}〜${rollOneYear(e.endDate)} | ${e.officialUrl || '-'} |\n`;
  }
} else {
  md += `なし\n`;
}

md += `\n## 2. 終了した単発イベント — 削除候補（${endedOneOff.length}件）\n\n`;
if (endedOneOff.length) {
  md += `| slug | タイトル | 終了日 |\n|---|---|---|\n`;
  for (const e of endedOneOff) md += `| \`${e.slug}\` | ${e.title} | ${e.endDate} |\n`;
} else {
  md += `なし\n`;
}

// 月別の開催予定件数
const byMonth = {};
for (const e of upcoming) {
  const m = e.startDate.slice(0, 7);
  byMonth[m] = (byMonth[m] || 0) + 1;
}
md += `\n## 3. これから開催のイベント（月別・開始月ベース）\n\n`;
md += `| 月 | 件数 |\n|---|---|\n`;
for (const m of Object.keys(byMonth).sort()) md += `| ${m} | ${byMonth[m]} |\n`;

// カバレッジ: 開催予定イベントが無い都道府県
const haveUpcoming = new Set(upcoming.map((e) => e.area));
const gaps = AREAS.filter(
  (a) => a.slug !== 'all' && a.block !== undefined && !haveUpcoming.has(a.slug),
).map((a) => a.name);
md += `\n## 4. 開催予定イベントが無い都道府県（今週の調査ターゲット・${gaps.length}件）\n\n`;
md += gaps.length ? gaps.join('、') + '\n' : 'なし（全都道府県カバー済み）\n';

// ── 5. 季節カテゴリの穴 ─────────────────────────────────────────────
// 「今は入っていて当たり前」のカテゴリが0件になっていないかを見る。
// 2026-08-27 に illumination が全156件中0件だったのを検出できなかったので追加した。
const SEASON_EXPECT = [
  { months: [3, 4], cat: 'seasonal', label: '花見・春の行事' },
  { months: [6, 7, 8], cat: 'matsuri', label: '夏祭り・花火' },
  { months: [9, 10], cat: 'seasonal', label: 'ハロウィン・秋の行事' },
  { months: [10, 11], cat: 'illumination', label: '紅葉ライトアップ・冬イルミの立ち上がり' },
  { months: [11, 12, 1], cat: 'illumination', label: '冬イルミネーション' },
  { months: [11, 12], cat: 'market', label: 'クリスマスマーケット' },
];
const curMonth = Number(today.slice(5, 7));
// 「今後90日でどれかの月にかかる」期待カテゴリを対象にする
const horizonMonths = [0, 1, 2, 3].map((i) => ((curMonth - 1 + i) % 12) + 1);
const expects = SEASON_EXPECT.filter((s) => s.months.some((m) => horizonMonths.includes(m)));

md += `\n## 5. 季節カテゴリの穴（今後90日で必要なもの）\n\n`;
md += `> その季節に「あって当たり前」のカテゴリの在庫。**0件はページが成立しない**ので最優先で埋める。\n\n`;
md += `| 期待されるカテゴリ | 想定月 | 今後開催の在庫 |\n|---|---|---|\n`;
// 1件では一覧として成立しないので、3件未満を「手薄」として拾う。
const THIN = 3;
let holeCount = 0;
let thinCount = 0;
for (const s of expects) {
  const n = upcoming.filter((e) => e.category === s.cat).length;
  if (n === 0) holeCount++;
  else if (n < THIN) thinCount++;
  const cell = n === 0 ? '**0件 ← 穴**' : n < THIN ? `**${n}件 ← 手薄**` : `${n}件`;
  md += `| ${s.label}（\`${s.cat}\`） | ${s.months.join('・')}月 | ${cell} |\n`;
}
md += holeCount || thinCount
  ? `\n→ **0件が${holeCount}カテゴリ、${THIN}件未満が${thinCount}カテゴリ。** 未発表なら §6 のウォッチで発表月を確認する。\n`
  : `\n→ 穴なし。\n`;

// ── 6. 発表待ちウォッチ ─────────────────────────────────────────────
const waiting = ANNOUNCE_WATCH.filter((w) => w.status === 'waiting');
// 「今月以降にチェック開始」＝ checkFromMonth を過ぎているもの。年をまたぐ会期があるので
// 12月→1月の折り返しを考慮して、今月からの距離が3ヶ月以内なら「もうすぐ」とする。
const monthsUntil = (m) => (m - curMonth + 12) % 12;
const dueNow = waiting.filter((w) => monthsUntil(w.checkFromMonth) === 0 || monthsUntil(w.checkFromMonth) > 9);
const soon = waiting.filter((w) => !dueNow.includes(w) && monthsUntil(w.checkFromMonth) <= 2);

md += `\n## 6. 発表待ちウォッチ（lib/event-announce-watch.ts）\n\n`;
md += `> 秋冬イベントは公式発表そのものが9〜11月まで出ない。探しても無いものは無いので、\n`;
md += `> **発表される月に取りに行く**。公式に載っていない日付は絶対に書かない（去年+1年の推測を入れない）。\n\n`;
md += `### 今すぐ公式を見に行くもの（${dueNow.length}件）\n\n`;
if (dueNow.length) {
  md += `| 会場 | イベント | 例年の会期 | 前回確認（${''}状態） | 公式 |\n|---|---|---|---|---|\n`;
  for (const w of dueNow) md += `| ${w.venue} | ${w.eventName} | ${w.typicalPeriod} | ${w.lastChecked}: ${w.lastCheckedState} | ${w.officialUrl} |\n`;
} else {
  md += `なし\n`;
}
md += `\n### 来月以降（${soon.length}件）\n\n`;
if (soon.length) {
  md += `| 会場 | イベント | チェック開始月 | 例年の会期 |\n|---|---|---|---|\n`;
  for (const w of soon) md += `| ${w.venue} | ${w.eventName} | ${w.checkFromMonth}月 | ${w.typicalPeriod} |\n`;
} else {
  md += `なし\n`;
}
const added = ANNOUNCE_WATCH.filter((w) => w.status === 'added');
md += `\n### 投入済み（${added.length}件）\n\n`;
for (const w of added) md += `- ${w.venue}「${w.eventName}」→ \`${w.addedSlug}\`\n`;

fs.writeFileSync('docs/events-maintenance.md', md);

// コンソール要約
console.log(`基準日: ${today}`);
console.log(`全${EVENTS.length}件（開催予定${upcoming.length} / 終了${ended.length}）`);
console.log(`  └ 終了のうち 年次=${endedAnnual.length}（繰り上げ候補） / 単発=${endedOneOff.length}（削除候補）`);
console.log(`未カバー都道府県: ${gaps.length}件${gaps.length ? ' → ' + gaps.join('、') : ''}`);
if (holeCount || thinCount) console.log(`⚠ 季節カテゴリ: 在庫0が${holeCount}件 / ${THIN}件未満が${thinCount}件（今後90日で必要なもの）`);
if (dueNow.length) console.log(`⚠ 今すぐ公式を確認: ${dueNow.length}件 → ${dueNow.map((w) => w.venue + '「' + w.eventName + '」').join('、')}`);
console.log(`詳細レポート: docs/events-maintenance.md`);
