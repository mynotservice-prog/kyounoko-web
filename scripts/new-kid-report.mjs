/**
 * 訪問レポート（KID_REPORTS）のひな形を生成する。
 *
 *   npx tsx scripts/new-kid-report.mjs "葛西臨海水族園"
 *
 * スポット名が SPOTS に存在するか確認したうえで、lib/kid-reports.ts に
 * 貼り付けるだけの雛形を出力する。各項目は「実際に行った記憶」を埋める前提。
 *
 * ルール（厳守）:
 *   - 書けるのは運営者が実際に子連れで訪問した体験のみ。口コミ・公式情報は混ぜない。
 *   - 行っていないスポットは書かない（空欄で出すくらいなら作らない）。
 */
import { getAllSpotsWithSlug } from '../lib/spots.ts';

const name = process.argv.slice(2).join(' ').trim();
if (!name) {
  console.error('使い方: npx tsx scripts/new-kid-report.mjs "スポット名"');
  process.exit(1);
}

const all = getAllSpotsWithSlug();
const match = all.find((x) => x.spot.name === name);

if (!match) {
  console.error(`✗ "${name}" は SPOTS に見つかりません。lib/spots.ts の name と完全一致が必要です。`);
  const near = all
    .filter((x) => x.spot.name.includes(name) || name.includes(x.spot.name.slice(0, 3)))
    .slice(0, 5)
    .map((x) => `  - ${x.spot.name}`);
  if (near.length) console.error('もしかして:\n' + near.join('\n'));
  process.exit(1);
}

if (match.spot.kidReport) {
  console.error(`! "${name}" には既にレポートがあります。上書きする場合は lib/kid-reports.ts を直接編集してください。`);
}

const tmpl = `  ${name}: {
    source: 'visited',
    visitAge: '', // 例: '0歳のベビーカー散歩〜2歳ごろ'。どの年齢で行ったか
    strollerNote: '', // ベビーカーの押しやすさ・置き場・館内可否・押しにくい場所
    crowdNote: '', // 土日の混み具合と、空いている狙い目の時間帯
    diaperNote: '', // おむつ替え・授乳ができた場所（実際に使った所）
    stayNote: '', // 実際に過ごせた滞在時間の目安
    cautionNote: '', // ヒヤッとした点・年齢的に注意したい場所
  },`;

console.log(`✓ "${name}" は存在します（${match.area} / ${match.slug}）`);
console.log('\n以下を lib/kid-reports.ts の KID_REPORTS に貼り付け、実体験で各項目を埋めてください:\n');
console.log(tmpl);
console.log('\n貼り付け後の確認: npx tsx scripts/check-kid-reports.mjs');
