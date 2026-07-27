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
];

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

const hits = [];
for (const f of fs.readdirSync(DIR)) {
  if (!f.endsWith('.md')) continue;
  const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
  const noindex = /^noindex:\s*true/m.test(raw.slice(0, 1500));
  if (publicOnly && noindex) continue;
  const scoped = stripDisclosedFiction(raw);
  for (const [label, re] of [...HEADING_RULES, ...BODY_RULES]) {
    if (re.test(scoped)) {
      const m = scoped.match(re);
      hits.push({ file: f, label, noindex, excerpt: (m?.[0] ?? '').replace(/\n/g, ' ').slice(0, 70) });
    }
  }
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
