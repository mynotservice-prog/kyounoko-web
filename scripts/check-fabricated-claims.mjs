#!/usr/bin/env node
/**
 * 出典のない自称一次調査・未実施体験の主張を検出する。
 *
 * 背景（2026-07-27〜28 の掃討）:
 *   公開記事に「編集部が150世帯に調査」「小児科医監修のもと」「100店舗を実地調査」
 *   「読者100世帯への聞き取り」等の裏付けのない主張が 300 セクション以上あった。
 *   実在する出典は 0 件で、スパムポリシー・E-E-A-T・憲章の禁止事項に違反していた。
 *
 * 当時の反省:
 *   最初は `## 編集部の独自視点` だけを見ていたため、`## きょうのこ独自データで見る…`
 *   `## 先輩ママ・パパの声` `## 保育士・専門家から見た…` を取りこぼした。
 *   さらに main 側の「noindex 解除」で、noindex 前提で残していた記事が公開に変わり
 *   捏造が 3 本再発した。だから noindex 記事も検査対象に含める。
 *
 * 一次情報の正:
 *   実訪問にもとづく体験は lib/kid-reports.ts のみが正。
 *   子の年齢は app/authors/nagamy/page.tsx の記載（4歳娘・2歳息子）を超えて書かない。
 *   専門家監修は app/supervisors/page.tsx が「監修者はいません」と明言している。
 *
 * 使い方:
 *   node scripts/check-fabricated-claims.mjs           # 違反があれば exit 1
 *   node scripts/check-fabricated-claims.mjs --public  # 公開記事のみ検査
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'content/articles';
const publicOnly = process.argv.includes('--public');

/** 見出しレベルの検出（セクションまるごと捏造のパターン） */
const HEADING_RULES = [
  ['編集部の独自視点', /^##.*編集部の独自視点/m],
  ['きょうのこ独自データ', /^##.*独自データ/m],
  ['先輩ママ・パパの声', /^##.*先輩ママ・パパの声/m],
  ['専門家から見たポイント', /^##.*専門家から見た/m],
];

/** 本文中の主張の検出 */
const BODY_RULES = [
  ['編集部の専門家監修の主張', /編集部[^。]{0,40}(監修のもと|医\d*名?(と|に)[^。]{0,20}取材)/],
  ['実地調査・実踏の主張', /編集部[^。]{0,40}(実地調査|実踏|現地調査|全店舗調査)/],
  ['パネル調査の主張', /編集部が[^。]{0,30}\d[\d,]*\s*(人|世帯|家庭|組|名)(に|を|から)/],
  ['読者への聞き取りの主張', /読者\d+世帯|読者への聞き取り/],
  ['ストップウォッチ実測の主張', /ストップウォッチで測/],
  ['全店確認の主張', /編集部が確認した店/],
  ['子連れ歴の年数主張', /(外食歴|利用|通い)\s*\d+年以上/],
  ['訪問頻度の主張', /月\d+〜\d+回ペース|週\d+〜\d+回ペース|延べ\d+店舗以上/],
  ['公表年齢を超える一次記述', /(5歳の娘|6歳の娘|長女5歳|長女6歳|長女は5歳|長女は6歳)/],
  // ── 外部の一次情報を「公式が言っている」と誤って引用する型 ────────────────────
  // 2026-07-28 に発覚。自称の一次調査（上の各ルール）とは別クラスで、当時この検査を
  // 通過していた。実害の出方はむしろこちらの方が重い（チェーン本部から指摘され得る）。
  //
  // 実測した反例:
  //   - `hamasushi-rinyushoku-mochikomi` は「はま寿司は公式に『離乳食やアレルギー対応食の
  //     持ち込みOK』と案内」と書いていたが、hamazushi.com / hama-sushi.co.jp の
  //     公式FAQに該当記載は無い（あるのは「お子様用の補助いすは全店舗にご用意」だけ）。
  //   - すかいらーく系記事が引用していた https://www.skylark.co.jp/menu/baby/ は 404。
  //     すかいらーく公式に「離乳食」の文字列は 0 件。
  //
  // 「公式に記載がない」「確認できていない」と**否定形**で書いているものは正しい書き方
  // なので弾かない。断定（案内/明記/OK/可能/認め）だけを拾う。
  [
    '公式が言っているという未検証の断定',
    /公式[^。\n]{0,30}(?!.{0,20}(記載がな|確認できて|明記はな|判断できな|見当たら))[^。\n]{0,20}(案内し|明記し|案内あり|明記あり|と案内|と明記)/,
  ],
];

/**
 * 否定形（公式に記載がない旨）は正しい書き方なので除外する。
 * 「明記されているわけではありません」「明記してはいません」のように、
 * 否定が肯定語の**後ろ**に来る日本語の形を取りこぼさないこと。
 */
const OFFICIAL_NEGATION =
  /(記載がな|記載はな|確認できて|明記はな|明記されていな|判断できな|見当たら|載っていな|わけではあり|ものではあり|してはいませ|されてはいませ|とは限らな|ではありませ)/;

/**
 * 「仮想ケース」「想定例」と明示された見出し配下は、架空であることが
 * 読者に開示されているので違反ではない。そこだけを除いた本文を返す。
 * （2026-07-27 に kosodate-spots-hokkaido-natsu で実際に誤検出したため追加）
 */
const stripDisclosedFiction = (raw) => {
  const lines = raw.split('\n');
  const keep = [];
  let skipUntilLevel = 0;
  for (const l of lines) {
    const h = l.match(/^(#{2,6})\s+(.*)$/);
    if (h) {
      const lvl = h[1].length;
      if (skipUntilLevel && lvl <= skipUntilLevel) skipUntilLevel = 0;
      if (!skipUntilLevel && /仮想|想定例|架空|サンプル例/.test(h[2])) { skipUntilLevel = lvl; continue; }
    }
    if (!skipUntilLevel) keep.push(l);
  }
  return keep.join('\n');
};

let hits = [];
for (const f of fs.readdirSync(DIR)) {
  if (!f.endsWith('.md')) continue;
  const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
  const noindex = /^noindex:\s*true/m.test(raw.slice(0, 1500));
  if (publicOnly && noindex) continue;
  const scoped = stripDisclosedFiction(raw);
  for (const [label, re] of [...HEADING_RULES, ...BODY_RULES]) {
    if (re.test(scoped)) {
      const m = scoped.match(re);
      const excerpt = (m?.[0] ?? '').replace(/\n/g, ' ');
      // 「公式に記載がない／明記されているわけではない」と否定形で書いているのは
      // 正しい書き方なので違反にしない。**否定語は一致部分の直後に来る**ので、
      // マッチした断片だけを見ると取りこぼす。前後に窓を取って判定する。
      if (label === '公式が言っているという未検証の断定') {
        const at = m?.index ?? -1;
        const window = at >= 0 ? scoped.slice(at, at + 160).replace(/\n/g, ' ') : excerpt;
        if (OFFICIAL_NEGATION.test(window)) continue;
      }
      hits.push({ file: f, label, noindex, excerpt: excerpt.slice(0, 70) });
    }
  }
}

if (!hits.length) {
  console.log(`✓ 捏造主張なし（${publicOnly ? '公開記事のみ' : '全記事'}）`);
  process.exit(0);
}

const WARN_LABEL = '公式が言っているという未検証の断定';
// 新ルールは「捏造が確定した」ではなく「一次情報の裏取りが必要」を意味する。
// 公式サイトに実在する記述を正しく引用しているケースも同じ形になるため、
// 機械では真偽を判定できない。よってこれは**警告**として出し、exit 1 にはしない。
const warns = hits.filter((h) => h.label === WARN_LABEL);
hits = hits.filter((h) => h.label !== WARN_LABEL);
if (warns.length) {
  console.error(`⚠ 一次情報の裏取りが必要な「公式が〜」の断定 ${warns.length} 件（exit 1 にはしない）`);
  for (const h of warns) console.error(`  ${h.noindex ? '[noindex] ' : '[公開]    '}${h.file}  ${h.excerpt}`);
  console.error('対処: 公式ページを curl して該当記述を確認し、出典URLと確認日を本文に書く。');
  console.error('      確認できなければ「公式に記載はなく店舗判断」と書き直す。\n');
}
if (!hits.length) {
  console.log(`✓ 捏造主張なし（${publicOnly ? '公開記事のみ' : '全記事'}）`);
  process.exit(0);
}

const byLabel = {};
for (const h of hits) (byLabel[h.label] ??= []).push(h);
console.error(`✗ 捏造の疑いがある主張 ${hits.length} 件\n`);
for (const [label, list] of Object.entries(byLabel)) {
  console.error(`【${label}】${list.length}件`);
  for (const h of list.slice(0, 8)) {
    console.error(`  ${h.noindex ? '[noindex] ' : '[公開]    '}${h.file}  ${h.excerpt}`);
  }
  if (list.length > 8) console.error(`  …他 ${list.length - 8} 件`);
  console.error('');
}
console.error('対処: セクションを削除するか、出典のある記述に差し替える。');
console.error('詳細: reports/fabricated-stats-audit-2026-07-27.md');
process.exit(1);
