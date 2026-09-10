#!/usr/bin/env node
/**
 * chain-facilities.ts 未登録の「外食チェーン」だけを絞り込み、公式照合用の記入シート(TSV)を作る。
 *
 * 戦略(docs/strategy-2026-09.md §5-0): 調達型セルの供給で律速になるのは執筆ではなく公式照合。
 * DBに入れば照合コストがゼロになるので、未登録チェーンのDB化が①②③すべての前提。
 *
 * このスクリプトは**値を埋めない**。埋めるのは公式ページを見た人間（またはローカルの照合ジョブ）。
 * 記事の記述はヒント列に出すだけで、DBには写さない（docs/writing-rules.md の
 * 「公式に記載がないものを『ある』とも『ない』とも書かない」を構造で守るため）。
 *
 *   node scripts/chain-db-scaffold.mjs                                  # サマリを標準出力
 *   node scripts/chain-db-scaffold.mjs --tsv=reports/chain-db-worklist-2026-09-11.tsv --md=reports/chain-db-scaffold-2026-09-11.md
 *
 * 記入したTSVは scripts/chain-db-from-tsv.mjs で TypeScript のエントリに変換する。
 */
import fs from 'node:fs';
import path from 'node:path';

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const TSV_OUT = arg('tsv', '');
const MD_OUT = arg('md', '');

const ART_DIR = 'content/articles';
const src = fs.readFileSync('lib/chain-facilities.ts', 'utf8');
const norm = (s) => s.replace(/-/g, '');
const registered = new Set([...src.matchAll(/key: '([^']+)'/g)].map((m) => norm(m[1])));

/**
 * 除外1: 単一施設・レジャー。チェーンDBは「多店舗の店舗差」を扱う構造なので混ぜない。
 * 施設側は lib/spots.ts / spot-facilities.ts 系が正。
 */
const FACILITY_ENTITIES = {
  disney: '単一施設（TDL）', tds: '単一施設（TDS）', haneda: '単一施設（空港）',
  karuizawa: '単一エリア', karuizawaoutlet: '単一施設', laketown: '単一施設（モール）',
  ikea: '単一施設（店舗ごとに別施設）', ikearestaurant: '施設内レストラン',
  costco: '単一施設（倉庫店）', fujiq: '単一施設（遊園地）', hakone: '単一エリア',
  legoland: '単一施設', puroland: '単一施設', uenozoo: '単一施設（動物園）',
  kamogawaseaworld: '単一施設（水族館）', kasaiaquarium: '単一施設（水族館）',
  shinagawaaquarium: '単一施設（水族館）', showakinenkoen: '単一施設（公園）',
  takaosan: '単一エリア（山）',
};

/** 除外2: そもそも固有エンティティでない（カテゴリ語・季節語） */
const NON_ENTITIES = {
  natsumatsuri: 'カテゴリ語（夏祭り）', akimatsuri: 'カテゴリ語（秋祭り）',
  kaitenzushi: 'カテゴリ語（回転寿司）',
};

/** 除外3: 登録済みチェーンのslug綴り違い。DB化ではなく綴りの正規化で解決する */
const SPELLING_VARIANTS = {
  shabuyo: 'しゃぶ葉（DB key: shabuyou）',
  hanamarudon: 'はなまるうどん（DB key: hanamaru-udon）',
  marukame: '丸亀製麺（DB key: marugame）',
};

/** chain-facilities.ts の FacilityKey と表示名（lib と同じ順・同じ語） */
const FACILITY_LABELS = {
  stepFree: '入口の段差なし', zashiki: '座敷席', boxSeat: 'ボックス席',
  kidsChair: 'キッズチェア', kidsMenu: 'キッズメニュー', kidsCutlery: '子供用カトラリー',
  diaperTable: 'おむつ替え台', nursingRoom: '授乳室', babyFoodBringIn: '離乳食持ち込み',
  toriwake: '取り分けOK', strollerToSeat: 'ベビーカーで席まで', allergenInfo: 'アレルゲン表示',
};

/** 記事本文での言及検出（DBに写す値ではなく「照合すべき項目」の目印） */
const HINTS = {
  stepFree: /段差|スロープ|バリアフリー/,
  zashiki: /座敷|小上がり/,
  boxSeat: /ボックス席|ソファ席/,
  kidsChair: /キッズチェア|子供[用の]?椅子|子ども用[の]?椅子|ベビーチェア|補助[いイ]す|補助椅子/,
  kidsMenu: /キッズメニュー|お子様メニュー|お子さまメニュー|お子様ランチ|お子様セット/,
  kidsCutlery: /子供用フォーク|子ども用スプーン|カトラリー|取り皿/,
  diaperTable: /おむつ替え|オムツ替え|おむつ交換/,
  nursingRoom: /授乳室|授乳スペース|授乳できる/,
  babyFoodBringIn: /離乳食/,
  toriwake: /取り分け/,
  strollerToSeat: /ベビーカー/,
  allergenInfo: /アレルゲン|アレルギー/,
};

const NOT_OFFICIAL = /(wikipedia|twitter|x\.com|instagram|facebook|youtube|tabelog|gurunavi|hotpepper|retty|google|kyounoko\.jp|amazon|rakuten|note\.com|prtimes|itmedia|impress|nikkei|yahoo|mhlw|caa\.go\.jp|go\.jp)/i;
const SUFFIX = /-(kids-menu|kodzure-koryaku|baby-chair|rinyushoku-mochikomi|koshitsu|kodomo-ryokin|kids-chair|stroller|omutsu)$/;

const files = fs.readdirSync(ART_DIR).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));

// --- エンティティ抽出 ---
const keys = new Set();
for (const f of files.filter((f) => SUFFIX.test(f))) {
  const k = norm(f.replace(SUFFIX, ''));
  if (k && !registered.has(k)) keys.add(k);
}

const excluded = [];
const chains = [];
for (const key of [...keys].sort()) {
  const why = FACILITY_ENTITIES[key] || NON_ENTITIES[key] || SPELLING_VARIANTS[key];
  if (why) {
    const kind = FACILITY_ENTITIES[key] ? '施設' : NON_ENTITIES[key] ? '非エンティティ' : '綴り違い';
    excluded.push({ key, kind, why });
    continue;
  }
  chains.push({ key });
}

// --- 各チェーンの材料を集める ---
for (const c of chains) {
  c.slugs = files.filter((f) => norm(f).startsWith(c.key));
  c.koryaku = c.slugs.find((s) => /-kodzure-koryaku$/.test(s)) || c.slugs[0];
  c.hints = new Set();
  c.urls = new Map();
  c.noindex = 0;
  let title = '';
  for (const slug of c.slugs) {
    const raw = fs.readFileSync(path.join(ART_DIR, slug + '.md'), 'utf8');
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    const front = fm ? fm[1] : '';
    const body = fm ? raw.slice(fm[0].length) : raw;
    if (/^noindex:\s*true/m.test(front)) c.noindex++;
    if (slug === c.koryaku) title = ((front.match(/^title:\s*(.*)$/m) || [])[1] || '').replace(/^["']|["']$/g, '');
    for (const [k, re] of Object.entries(HINTS)) if (re.test(body)) c.hints.add(k);
    for (const m of body.matchAll(/https?:\/\/[^\s)"'<>]+/g)) {
      const u = m[0].replace(/[.,、。]+$/, '');
      if (NOT_OFFICIAL.test(u)) continue;
      let host;
      try { host = new URL(u).host; } catch { continue; }
      c.urls.set(host, (c.urls.get(host) || 0) + 1);
    }
  }
  // 表示名は攻略記事タイトルの先頭語から推定（要確認）
  const m = title.match(/^([^\s、。「」｜|【（(]+?)(?:は|の|で|に|って|、|｜|\||【|（|\()/);
  c.name = (m ? m[1] : title.slice(0, 12)) || c.key;
  c.official = [...c.urls.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
}

// --- 出力 ---
const FK = Object.keys(FACILITY_LABELS);
const rows = [];
for (const c of chains) {
  for (const fk of FK) {
    rows.push([
      c.key, c.name, c.koryaku, c.official ? `https://${c.official}/` : '',
      fk, FACILITY_LABELS[fk], c.hints.has(fk) ? '記事に記述あり' : '',
      '', '', '',
    ]);
  }
}
const HEADER = [
  'chain_key', 'chain_name', 'koryaku_slug', 'official_url',
  'facility_key', 'facility_label', 'article_hint',
  'value', 'note', 'source_url',
];

const out = [];
const say = (s = '') => { console.log(s); out.push(s); };

say('# 未登録チェーンのDB化 記入シート');
say('');
say(`生成: ${new Date().toISOString().slice(0, 10)} / \`node scripts/chain-db-scaffold.mjs\``);
say('');
say(`- 登録済み: **${registered.size}** チェーン`);
say(`- 記事のある未登録エンティティ: **${keys.size}** 件`);
say(`- うち除外: **${excluded.length}** 件（施設 ${excluded.filter((e) => e.kind === '施設').length} / 非エンティティ ${excluded.filter((e) => e.kind === '非エンティティ').length} / 綴り違い ${excluded.filter((e) => e.kind === '綴り違い').length}）`);
say(`- **DB化の対象チェーン: ${chains.length} 件 × 12設備キー = ${chains.length * 12} セル**`);
say('');
say('## 記入ルール');
say('');
say('| 列 | 入れるもの |');
say('|---|---|');
say('| `value` | `yes` = 公式に「ある」と書いてある / `partial` = 店舗による・条件付き / `no` = 公式に「ない」と書いてある / **空欄 = 公式に記載がない（これが正しい既定値）** |');
say('| `note` | 補足（例: モール内店舗は施設の授乳室を利用）。`partial` のときは必須 |');
say('| `source_url` | 値の根拠になった公式ページのURL。`value` を入れたら必須 |');
say('');
say('**空欄のまま残すことを恐れないこと。** `items` は Partial なので、書かなければ表示されない。');
say('「公式に記載がない」を「ない(`no`)」と書くのが、過去に1,109本へ同じ型の誤りを入れた原因。');
say('');
say('## 対象チェーン');
say('');
say('| # | key | 推定表示名 | 記事 | noindex | 攻略記事slug | 公式ドメイン候補 | 記述のある設備キー |');
say('|---:|---|---|---:|---:|---|---|---:|');
chains.forEach((c, i) => {
  say(`| ${i + 1} | \`${c.key}\` | ${c.name} | ${c.slugs.length} | ${c.noindex} | \`${c.koryaku}\` | ${c.official || '**要調査**'} | ${c.hints.size}/12 |`);
});
say('');
say('※ 推定表示名は攻略記事タイトルからの機械抽出。**そのままDBに入れず必ず確認する**。');
say('');
say('## 除外したもの（理由つき）');
say('');
say('| key | 種別 | 理由 |');
say('|---|---|---|');
for (const e of excluded) say(`| \`${e.key}\` | ${e.kind} | ${e.why} |`);
say('');
say('綴り違いの3件はDB化ではなく**キーの正規化**で解決する（しゃぶ葉・はなまるうどん・丸亀製麺）。');
say('施設19件は別DB（`lib/spots.ts` 系）の管轄。チェーンDBに単一施設を混ぜると「店舗差」の意味が壊れる。');

if (TSV_OUT) {
  fs.mkdirSync(path.dirname(path.resolve(TSV_OUT)), { recursive: true });
  fs.writeFileSync(TSV_OUT, [HEADER, ...rows].map((r) => r.join('\t')).join('\n') + '\n');
  console.error(`\ntsv: ${TSV_OUT}（${rows.length}行）`);
}
if (MD_OUT) {
  fs.mkdirSync(path.dirname(path.resolve(MD_OUT)), { recursive: true });
  fs.writeFileSync(MD_OUT, out.join('\n') + '\n');
  console.error(`md:  ${MD_OUT}`);
}
