/**
 * lib/today-query.ts（/today・/search のクエリ正規化）の検査。
 *
 *   node --import ./scripts/_ts-resolve.mjs scripts/check-today-query.mjs
 *
 * 見ること:
 *   1. 許可外の項目・値・並び順のゆれが正規形に寄る
 *   2. 正規化を2回かけても変わらない（middleware の 308 が往復しない）
 *   3. 人の導線が今出している URL（駅チップ・おまかせ・別の候補・LINE の UTM 等）は正規形のまま＝308 を挟まない
 *   4. 駅マスタの全 slug が許可される（形の検査で落ちる駅が無い）
 */
import { canonicalTodayQuery, canonicalSearchQuery, todayHref, nextTodayVariant } from '../lib/today-query.ts';
import { TOKYO_STATIONS } from '../lib/tokyo-stations.ts';
import { KANSAI_STATIONS } from '../lib/kansai-stations.ts';
import { KANAGAWA_STATIONS } from '../lib/kanagawa-stations.ts';
import { SAICHI_STATIONS } from '../lib/saitama-chiba-stations.ts';
import { REGIONAL_STATIONS } from '../lib/regional-stations.ts';

const slugs = new Set(
  [...TOKYO_STATIONS, ...KANSAI_STATIONS, ...KANAGAWA_STATIONS, ...SAICHI_STATIONS, ...REGIONAL_STATIONS].map((s) => s.slug),
);
const opts = { isKnownStation: (s) => slugs.has(s) };
const canon = (qs) => canonicalTodayQuery(new URLSearchParams(qs), opts);

let fail = 0;
function eq(label, got, want) {
  if (got !== want) {
    fail++;
    console.log(`NG ${label}\n   got:  ${JSON.stringify(got)}\n   want: ${JSON.stringify(want)}`);
  }
}

// 1. 正規化
const cases = [
  ['空', '', ''],
  ['許可外の項目を削る', 'age=2-3&fbclid=abc&gclid=x&_rsc=1a2b', 'age=2-3'],
  ['並び順を固定', 'weather=rain&age=2-3', 'age=2-3&weather=rain'],
  ['許可外の値を削る', 'age=7-9&weather=snow&place=home', 'place=home'],
  ['date・mealTime・category はページが読まないので削る', 'date=weekend&age=2-3&station=shibuya&weather=sunny&mealTime=lunch&category=x', 'station=shibuya&age=2-3&weather=sunny'],
  ['実在しない駅は削り、駅起点の項目も落とす', 'station=nowhere-zzz&age=2-3&vm=2', 'age=2-3'],
  ['駅起点では place・duration・area・mode を削る', 'station=shibuya&place=home&duration=60&area=tokyo&mode=go&budget=low', 'station=shibuya&budget=low'],
  ['駅なしでは vm・slot を削る', 'age=2-3&vm=3&slot=lunch', 'age=2-3'],
  ['vm は周期5・0 は省く', 'station=shibuya&vm=0&vl=7&va=10', 'station=shibuya&vl=2'],
  ['vm の数字以外は削る', 'station=shibuya&vm=-1&vl=1e3&va=abc', 'station=shibuya'],
  ['区起点', 'ward=setagaya&age=0-1&slot=lunch', 'ward=setagaya&age=0-1&slot=lunch'],
  ['区の誤り', 'ward=yokohama&age=0-1', 'age=0-1'],
  ['area=all は省く', 'area=all&age=2-3', 'age=2-3'],
  ['地方ブロック', 'area=kansai', 'area=kansai'],
  ['重複は最初の値（ページと同じ）', 'age=2-3&age=0-1', 'age=2-3'],
  ['エンコードのゆれ', 'age=2%2D3', 'age=2-3'],
  ['UTM は残す', 'weather=rain&utm_source=line&utm_medium=weekend', 'weather=rain&utm_source=line&utm_medium=weekend'],
  ['UTM の異常値は削る', 'utm_source=' + 'x'.repeat(41) + '&utm_medium=a%20b', ''],
  ['長い駅 slug は削る', 'station=' + 'a'.repeat(41), ''],
];
for (const [label, input, want] of cases) eq(label, canon(input), want);

// 2. 冪等（ランダムな組み合わせ）
const keys = ['station', 'ward', 'age', 'weather', 'place', 'day', 'duration', 'budget', 'area', 'mode', 'mealTime', 'vm', 'vl', 'va', 'slot', 'date', 'utm_source', 'fbclid', '_rsc'];
const vals = ['shibuya', 'setagaya', '2-3', 'rain', 'home', 'any', '60', 'low', 'tokyo', 'go', '3', '12', 'lunch', 'today', 'line', 'x y', '%E3%81%82', ''];
let seed = 1;
const rnd = (n) => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) % n);
for (let i = 0; i < 5000; i++) {
  const sp = new URLSearchParams();
  const k = 1 + rnd(8);
  for (let j = 0; j < k; j++) sp.append(keys[rnd(keys.length)], vals[rnd(vals.length)]);
  const once = canon(sp.toString());
  const twice = canon(once);
  if (once !== twice) {
    eq(`冪等 ${sp.toString()}`, twice, once);
    break;
  }
  // URL パーサを通しても文字列が変わらない（308 先で同じ文字列として届く）
  const viaUrl = new URL(`https://kyounoko.jp/today${once ? `?${once}` : ''}`).search.replace(/^\?/, '');
  if (viaUrl !== once) {
    eq(`URL パーサで変わる ${once}`, viaUrl, once);
    break;
  }
}

// 3. 人の導線が出す URL は正規形のまま
const human = [
  // 駅チップ（app/today/page.tsx stationHref）・駅ページ・スポットページの CTA
  '/today?station=shibuya',
  '/today?station=shibuya&age=2-3&weather=rain',
  // おまかせ（OmakasePlanButton）
  todayHref({ station: 'ikebukuro', age: '0-1', weather: 'sunny', vm: '2', vl: '0', va: '1' }),
  // 別の候補（OutingPlanView buildHref）: vl だけ進めたあと vm を進めても並び順は固定
  todayHref({ station: 'shibuya', age: '2-3', vl: '1', vm: nextTodayVariant(undefined) }),
  todayHref({ station: 'shibuya', vm: nextTodayVariant('4'), vl: nextTodayVariant('4'), va: nextTodayVariant('4'), slot: 'lunch' }),
  // 条件を変える（changeHref）・記事末尾の CTA（NextPlanCTA・NextOutingCTA）
  todayHref({ age: '2-3', weather: 'rain' }),
  todayHref({ age: '4-6', area: 'kanagawa' }),
  todayHref({ age: '4-6', place: 'outside', area: 'saitama' }),
  // トップの即答パネル（V2TodayHero: age, weather, place, area の順）
  '/today?age=2-3&weather=sunny&place=outside&area=tokyo',
  // エリアページのチップ（app/area/[slug]）・人気スポット
  '/today?weather=rain&area=osaka',
  '/today?place=indoor&area=osaka',
  '/today?budget=free&area=chiba',
  '/today?area=tokyo',
  // LINE の週末配信（lib/weekend-suggest.ts）
  '/today?weather=rain&utm_source=line&utm_medium=weekend',
  '/today?utm_source=line&utm_medium=weekend',
];
for (const href of human) {
  const qs = href.split('?')[1] ?? '';
  eq(`人の導線 ${href}`, canon(qs), qs);
}
eq('nextTodayVariant 周期', [undefined, '0', '1', '4', '9', 'x'].map(nextTodayVariant).join(','), '1,1,2,0,0,1');

// 4. 駅マスタの全 slug
for (const s of slugs) {
  const got = canon(`station=${s}`);
  if (got !== `station=${s}`) eq(`駅 ${s}`, got, `station=${s}`);
}

// 5. /search
const sc = (qs) => {
  const r = canonicalSearchQuery(new URLSearchParams(qs));
  return r.kind === 'ok' ? r.query : r.kind;
};
eq('search 空', sc(''), '');
eq('search q=', sc('q='), '');
eq('search 空白だけ', sc('q=%20%20'), '');
eq('search 許可外', sc('q=%E5%85%AC%E5%9C%92&utm_source=x&foo=1'), 'q=%E5%85%AC%E5%9C%92');
eq('search p=1 は省く', sc('p=1'), '');
eq('search p=2', sc('p=2'), 'p=2');
eq('search p 異常', sc('p=-3'), '');
eq('search 並び', sc('p=2&q=a'), 'q=a&p=2');
eq('search 空白の符号化', sc('q=a%20b'), 'q=a+b');
eq('search フォーム送信の形はそのまま', sc('q=a+b'), 'q=a+b');
eq('search 64文字', sc('q=' + 'あ'.repeat(64)).startsWith('q='), true);
eq('search 65文字', sc('q=' + 'あ'.repeat(65)), 'too-long');

console.log(`${slugs.size} stations checked`);
if (fail) {
  console.log(`\n${fail} 件 NG`);
  process.exit(1);
}
console.log('OK: today-query');
