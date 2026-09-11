#!/usr/bin/env node
/**
 * chain-facilities.ts 未登録エンティティの DB化ワークリストを作る。
 *
 * 戦略(docs/strategy-2026-09.md §5-0): 調達型セルの供給で律速になるのは執筆ではなく
 * 「公式一次情報の照合」。DBに入っていれば照合コストがゼロになるので、
 * 未登録エンティティのDB化が①調査・②内部リンク・③量産すべての前提になる。
 *
 * このスクリプトは**事実を確定しない**。既存記事が何を主張していて、
 * その根拠URLが何かを並べるだけ。値を入れるのは公式照合をした人間（or ローカルの照合ジョブ）。
 * docs/writing-rules.md の「公式に記載がないものを『ある』とも『ない』とも書かない」を守るため、
 * ここで自動的にDBへ書き込むことは意図的にしていない。
 *
 *   node scripts/db-onboarding-worklist.mjs                       # 標準出力
 *   node scripts/db-onboarding-worklist.mjs --md=reports/db-onboarding-2026-09-11.md
 */
import fs from 'node:fs';
import path from 'node:path';

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const MD_OUT = arg('md', '');

const ART_DIR = 'content/articles';
const src = fs.readFileSync('lib/chain-facilities.ts', 'utf8');
const registered = new Set(
  [...src.matchAll(/key: '([^']+)'/g)].map((m) => m[1].replace(/-/g, '')),
);

const files = fs.readdirSync(ART_DIR).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
const norm = (s) => s.replace(/-/g, '');

/** チェーン系サフィックス（エンティティの存在を示す） */
const SUFFIX = /-(kids-menu|kodzure-koryaku|baby-chair|rinyushoku-mochikomi|koshitsu|kodomo-ryokin|kids-chair|stroller|omutsu)$/;

/** 12設備キーごとの、記事本文での言及を検出するキーワード */
const FACILITY_HINTS = {
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

/** 公式URL候補から除外するドメイン（一次情報でない or 公式でない） */
const NOT_OFFICIAL = /(wikipedia|twitter|x\.com|instagram|facebook|youtube|tabelog|gurunavi|hotpepper|retty|google|kyounoko\.jp|amazon|rakuten|note\.com|prtimes|itmedia|impress|nikkei|yahoo)/i;

// エンティティ抽出
const entities = new Map();
for (const f of files.filter((f) => SUFFIX.test(f))) {
  const key = norm(f.replace(SUFFIX, ''));
  if (!key || registered.has(key)) continue;
  if (!entities.has(key)) entities.set(key, { key, slugs: [] });
}
for (const [key, e] of entities) {
  e.slugs = files.filter((f) => norm(f).startsWith(key));
}

// 記事の中身を読む
for (const [, e] of entities) {
  e.urls = new Map();
  e.facilities = new Set();
  e.hasSource = 0;
  e.hasVerifiedDate = 0;
  e.titles = [];
  e.noindex = 0;
  for (const slug of e.slugs) {
    const raw = fs.readFileSync(path.join(ART_DIR, slug + '.md'), 'utf8');
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    const front = fm ? fm[1] : '';
    const body = fm ? raw.slice(fm[0].length) : raw;
    if (/^noindex:\s*true/m.test(front)) e.noindex++;
    const title = (front.match(/^title:\s*(.*)$/m) || [])[1] || slug;
    e.titles.push(title.replace(/^["']|["']$/g, '').slice(0, 40));
    if (/## 出典/.test(body)) e.hasSource++;
    if (/確認|時点/.test(body)) e.hasVerifiedDate++;
    for (const [k, re] of Object.entries(FACILITY_HINTS)) if (re.test(body)) e.facilities.add(k);
    for (const m of body.matchAll(/https?:\/\/[^\s)"'<>]+/g)) {
      const u = m[0].replace(/[.,、。]+$/, '');
      if (NOT_OFFICIAL.test(u)) continue;
      let host;
      try { host = new URL(u).host; } catch { continue; }
      e.urls.set(host, (e.urls.get(host) || 0) + 1);
    }
  }
}

const ALL_KEYS = Object.keys(FACILITY_HINTS);
const list = [...entities.values()].sort((a, b) => b.slugs.length - a.slugs.length);

const out = [];
const say = (s = '') => { console.log(s); out.push(s); };

say(`# chain-facilities 未登録エンティティの DB化ワークリスト`);
say('');
say(`生成: ${new Date().toISOString().slice(0, 10)} / \`node scripts/db-onboarding-worklist.mjs\``);
say('');
say(`- 登録済み: **${registered.size}** チェーン`);
say(`- 未登録だが記事のあるエンティティ: **${list.length}** 件（記事 ${list.reduce((a, e) => a + e.slugs.length, 0)} 本）`);
say('');
say('## 使い方');
say('');
say('1. 「公式ドメイン候補」を開いて、そのエンティティの公式サイトか確認する（記事の出典から機械抽出しただけなので誤りを含む）');
say('2. 12設備キーのうち「記事に記述あり」の列を、公式ページで**照合し直す**。記事の記述をそのままDBへ写さないこと');
say('3. 確認できた項目だけ `lib/chain-facilities.ts` に追加し、`verifiedAt` と `verifiedMethod` を入れる');
say('4. 公式に記載がない項目は**省略する**（`items` は Partial なので、書かなければ表示されない）。');
say('   「ある」とも「ない」とも書かないのが `docs/writing-rules.md` の原則');
say('');
say('## 優先順（記事数＝既に検索で当たっている面の多さ）');
say('');
say('| # | エンティティ | 記事 | noindex | 出典節 | 公式ドメイン候補 | 記事に記述のある設備キー |');
say('|---:|---|---:|---:|---:|---|---|');
list.forEach((e, i) => {
  const urls = [...e.urls.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([h]) => h).join(' / ') || '**なし（要調査）**';
  const fac = ALL_KEYS.filter((k) => e.facilities.has(k));
  say(`| ${i + 1} | \`${e.key}\` | ${e.slugs.length} | ${e.noindex} | ${e.hasSource} | ${urls} | ${fac.length}/12: ${fac.join(' ') || '—'} |`);
});
say('');
say('## エンティティ別の詳細');
say('');
for (const e of list) {
  say(`### \`${e.key}\`（記事 ${e.slugs.length} 本 / 出典節 ${e.hasSource} 本）`);
  say('');
  const urls = [...e.urls.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  say(urls.length ? `公式ドメイン候補: ${urls.map(([h, n]) => `\`${h}\`(${n})`).join(', ')}` : '公式ドメイン候補: **記事に外部出典なし。公式サイトの特定から始める**');
  say('');
  say('| slug | title |');
  say('|---|---|');
  e.slugs.forEach((s, i) => say(`| \`${s}\` | ${e.titles[i]} |`));
  say('');
  const miss = ALL_KEYS.filter((k) => !e.facilities.has(k));
  say(`記述のない設備キー（記事から埋められない＝公式で新規に確認が要る）: ${miss.length ? miss.join(' ') : 'なし'}`);
  say('');
}

if (MD_OUT) {
  fs.mkdirSync(path.dirname(path.resolve(MD_OUT)), { recursive: true });
  fs.writeFileSync(MD_OUT, out.join('\n') + '\n');
  console.error(`\nmd: ${MD_OUT}`);
}
