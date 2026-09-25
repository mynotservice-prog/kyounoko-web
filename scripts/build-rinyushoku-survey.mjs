#!/usr/bin/env node
/**
 * 調査②「外食チェーン 離乳食対応の公式記載 実態調査」のデータを生成する。
 *
 *   node scripts/build-rinyushoku-survey.mjs            # data/rinyushoku-official-2026.json を書き出す
 *   node scripts/build-rinyushoku-survey.mjs --check    # 書き出さずに集計だけ表示
 *
 * 入力（すべてリポジトリ内。数字の出し方を隠さないため、手作業の判断はこのファイルの
 * CORRECTIONS / ADDITIONS / SUPPLEMENT に理由つきで書く）:
 *   1. reports/rinyushoku-official-2026-09-25/{A..H}.tsv
 *        本調査。運営元公式サイトを照合し、各チェーンで「子連れ項目を記録している公式ページ」
 *        （陽性対照）も併記している。判定・温め・お湯・ベビーフード販売の4列。
 *   2. CORRECTIONS: TSV作成後の再照合で判定を変えたもの。
 *   3. ADDITIONS: TSVに無いが、既存の *-rinyushoku-mochikomi 記事が公式の文言を引用しているチェーン。
 *        判定は記事の主張ではなく、記事が引用している公式ページの文言で行い、2026-09-25 に再取得した。
 *   4. reports/chain-onboarding-2026-09-25/{G,H}{1..7}.tsv の babyFood 列（別手法の参考値）。
 *        列の意味が「離乳食まわりの記載の有無」で持ち込み/温め/お湯/販売に分かれていないため、
 *        4区分に分解できる明記のあるチェーンだけを SUPPLEMENT として参考表に載せる。
 *        「記載なし」のチェーンは照合範囲（メニュー・アレルゲン・店舗ページ中心）が本調査と違うので
 *        4列とも「記載なし」とは扱わず、集計から外して名前だけ除外リストに出す。
 *
 * 値の約束（docs/writing-rules.md §4: 公式に書いていないものを「ある」とも「ない」とも書かない）:
 *   持ち込み: 明記OK / 条件付きOK / 明記NG / 記載なし / 未確認
 *   温め・お湯・販売: 明記あり / 一部店舗で明記 / 記載なし / 未確認 / 未照合
 *     記載なし = 照合した公式ページに該当する記述が無い（「対応していない」ではない）
 *     未確認   = 該当しうる公式ページ（FAQ等）があるのに本文を取得できなかった
 *     未照合   = その項目を公式で照合していない（集計の分母から外す）
 *
 * 記事リンク: 各チェーンの *-rinyushoku-mochikomi（公開中）→ 無ければ攻略記事。
 *   凍結slug（scripts/check-frozen.mjs --list）・301統合元（lib/article-redirects.ts）・
 *   ファイルの無いslugにはリンクしない。
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'data/rinyushoku-official-2026.json');
const MAIN_DIR = path.join(ROOT, 'reports/rinyushoku-official-2026-09-25');
const ONBOARD_DIR = path.join(ROOT, 'reports/chain-onboarding-2026-09-25');
const SURVEY_DATE = '2026-09-25';
const CHECK_ONLY = process.argv.includes('--check');

// ---------------------------------------------------------------- TSV
function readTsv(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim());
  const header = lines[0].split('\t');
  return lines.slice(1).map((l) => {
    const cols = l.split('\t');
    return Object.fromEntries(header.map((h, i) => [h, (cols[i] ?? '').trim()]));
  });
}

/** 本調査TSVの「判定」列 → 持ち込み区分。括弧内は注記に回す */
function normMochikomi(raw) {
  const base = raw.replace(/（.*$/, '').trim();
  if (['明記OK', '条件付きOK', '明記NG', '記載なし'].includes(base)) return base;
  throw new Error(`未知の判定: ${raw}`);
}
function normSub(raw) {
  if (raw === '明記あり' || raw === '記載なし') return raw;
  throw new Error(`未知の値: ${raw}`);
}

// ---------------------------------------------------------------- 訂正（TSV作成後の再照合）
/**
 * key → 上書き。cells の各値は { value, note?, sourceUrl? }。
 * reason は JSON にも残す（どこを人が判断したかを公開するため）。
 */
const UNCONFIRMED = { value: '未確認' };
const CORRECTIONS = {
  yuzuan: {
    reason: '公式ページの持ち込みの一文は「食物アレルギーをお持ちのお子様用」が対象。一般の離乳食の持ち込み可否は書かれていないため、持ち込みは「記載なし」とする（温め・お湯は明記あり）。',
    cells: {
      mochikomi: { value: '記載なし', note: '食物アレルギーのお子様向けの持ち込みのみ明記（「食物アレルギーをお持ちのお子様用には、遠慮なさらずにお食事をお持ち込みください。」）' },
    },
  },
  marugenramen: {
    reason: '持ち込みの一文は「食物アレルギーをお持ちのお客様」が対象。一般の離乳食の持ち込みは記載なし。お湯（「ミルクのお湯をご用意しております。」）と店内の離乳食（税込429円）は同ページに明記。',
    quote: 'ミルクのお湯をご用意しております。／離乳食【7ヶ月〜】（別項：食物アレルギーをお持ちのお客様は遠慮なさらずにお食事をお持ち込みください。）',
    cells: {
      mochikomi: { value: '記載なし', note: '食物アレルギーの方向けの持ち込みのみ明記' },
    },
  },
  starbucks: {
    reason: '公式FAQ（Salesforce製）がJavaScript描画で本文を取得できず、該当しうる記事「店外で購入した商品を持ち込みできますか？」を読めていない。「記載なし」とは言えないため未確認とする。',
    cells: { mochikomi: UNCONFIRMED, atatame: UNCONFIRMED, oyu: UNCONFIRMED, hanbai: UNCONFIRMED },
  },
  choushimaru: {
    reason: '公式FAQ（/question/）が当調査環境から403で本文を取得できなかった。店舗ページに離乳食の項目は無いが、FAQを読めていないため未確認とする。',
    cells: { mochikomi: UNCONFIRMED, atatame: UNCONFIRMED, oyu: UNCONFIRMED, hanbai: UNCONFIRMED },
  },
  sushiro: {
    reason: '公式の記述は「お茶用のお湯での調乳」の掲載を取り下げた旨のお知らせで、調乳用のお湯を用意しているという記載ではない。お湯は「記載なし」とし、お知らせを注記に残す。',
    cells: {
      oyu: { value: '記載なし', note: '「テーブルに備え付けのお茶用のお湯での調乳」の掲載を取り下げた旨のお知らせあり（調乳用のお湯の用意を案内する記載ではない）' },
    },
  },
  'royal-host': {
    reason: '「温めてお持ちします」は店内で販売するベビーフードの提供方法の説明。持ち込んだ離乳食の温めの記載ではないため、温めは「記載なし」のまま。',
    cells: {
      atatame: { value: '記載なし', note: '店内販売のベビーフードを「食器に入れ、温めてお持ちします」の記載はある（持ち込み品の温めの記載ではない）' },
    },
  },
  cocos: {
    reason: '「温めて提供いたします」は店内販売品（しらすの雑炊）の提供方法。持ち込み品の温めではない。',
    cells: {
      atatame: { value: '記載なし', note: '店内販売品を「温めて提供いたします」の記載はある（持ち込み品の温めの記載ではない）' },
    },
  },
  'kappa-sushi': {
    reason: '「離乳食あります! 温めも承ります」は店の離乳食の案内に続く文言。温めを引き受ける旨は明記されているため「明記あり」とするが、持ち込み品が対象かは文言から判別できないことを注記する。',
    cells: {
      atatame: { value: '明記あり', note: '店の離乳食の案内に続く「温めも承ります」。持ち込んだ離乳食が対象かは文言から判別できない' },
    },
  },
};

// ---------------------------------------------------------------- 追加（既存記事が引用する公式ページ・2026-09-25 再取得）
const ADDITIONS = [
  {
    key: 'gusto', name: 'ガスト',
    quote: '離乳食の持ち込みOK（※一部の店舗を除く）',
    sourceUrl: 'https://www.skylark.co.jp/gusto/family/index.html',
    positiveControl: 'https://www.skylark.co.jp/gusto/family/index.html （同じ一覧に「キッズチェアがある」「オムツ交換台がある」）',
    checkedAt: SURVEY_DATE,
    cells: {
      mochikomi: { value: '明記OK', note: '「※一部の店舗を除く」の注記つき（キッズチェア・オムツ交換台と共通の注記）' },
      atatame: { value: '記載なし', note: '同ページ・すかいらーくグループFAQに温めの記載なし' },
      oyu: { value: '記載なし', note: '同ページ・すかいらーくグループFAQに調乳用のお湯の記載なし' },
      hanbai: { value: '未照合' },
    },
  },
  {
    key: 'saizeriya', name: 'サイゼリヤ',
    quote: '（該当記載なし）公式サイトにFAQページ無し。トップ・企業情報・お問い合わせに離乳食・ベビーフードの記載なし',
    sourceUrl: 'https://www.saizeriya.co.jp/',
    positiveControl: '（FAQ無し）',
    checkedAt: SURVEY_DATE,
    cells: {
      mochikomi: { value: '記載なし' },
      atatame: { value: '記載なし' },
      oyu: { value: '未照合' },
      hanbai: { value: '未照合' },
    },
  },
  {
    key: 'dennys', name: 'デニーズ',
    quote: '乳児向けベビーフード しらすの雑炊（生後7～8ヶ月頃）300円（税込330円）［おこさまメニュー。持ち込みの記載なし］',
    sourceUrl: 'https://www.dennys.jp/service/',
    positiveControl: 'https://www.dennys.jp/menu/kids/ （おこさまメニューに乳児向けベビーフードを掲載）',
    checkedAt: SURVEY_DATE,
    cells: {
      mochikomi: { value: '記載なし', sourceUrl: 'https://www.dennys.jp/service/' },
      atatame: { value: '記載なし', sourceUrl: 'https://www.dennys.jp/service/' },
      oyu: { value: '記載なし', sourceUrl: 'https://www.dennys.jp/service/' },
      hanbai: { value: '明記あり', sourceUrl: 'https://www.dennys.jp/menu/kids/', note: '乳児向けベビーフード しらすの雑炊（生後7～8ヶ月頃）' },
    },
  },
  {
    key: 'bikkuri-donkey', name: 'びっくりドンキー',
    quote: '（未確認）お子様連れ向けページ /lp/kids/ に離乳食の記載なし。公式FAQは当調査環境から403で本文を取得できず',
    sourceUrl: 'https://www.bikkuri-donkey.com/lp/kids/',
    positiveControl: 'https://www.bikkuri-donkey.com/lp/kids/ （お子様メニュー・アレルギー対応メニューを記載）',
    checkedAt: SURVEY_DATE,
    reason: 'お子様連れ向けページには記載が無いが、FAQを読めていないため未確認とする。',
    cells: { mochikomi: UNCONFIRMED, atatame: UNCONFIRMED, oyu: UNCONFIRMED, hanbai: UNCONFIRMED },
  },
  {
    key: 'hamasushi', name: 'はま寿司',
    quote: '（該当記載なし）FAQの子連れ項目は「子供用補助いすはありますか？」のみ',
    sourceUrl: 'https://www.hamazushi.com/contact/faq/',
    positiveControl: 'https://www.hamazushi.com/contact/faq/ （Q「子供用補助いすはありますか？」）',
    checkedAt: SURVEY_DATE,
    cells: {
      mochikomi: { value: '記載なし' },
      atatame: { value: '記載なし' },
      oyu: { value: '記載なし' },
      hanbai: { value: '未照合' },
    },
  },
  {
    key: 'marukame', name: '丸亀製麺',
    quote: '（該当記載なし）FAQ全項目（アレルギー・カロリー・持ち帰り・アプリ等）に離乳食・持ち込み・お湯の項目なし',
    sourceUrl: 'https://jp.marugame.com/faq/',
    positiveControl: 'https://jp.marugame.com/faq/ （アレルギー情報の項目を記録）',
    checkedAt: SURVEY_DATE,
    cells: {
      mochikomi: { value: '記載なし' },
      atatame: { value: '記載なし' },
      oyu: { value: '記載なし' },
      hanbai: { value: '未照合' },
    },
  },
];

// ---------------------------------------------------------------- 参考（新設チェーン照合・別手法）
/**
 * babyFood 列の明記を4区分に分解できたものだけ。分解の根拠は TSV の文言（下の quote は TSV の原文）。
 * 明記の無い区分は、TSVの文言が「持ち込み・温めは記載なし」と明示している場合だけ「記載なし」にし、
 * それ以外は「未照合」にする。
 */
const SUPPLEMENT = {
  capricciosa: {
    sourceUrl: 'https://capricciosa.com/location/',
    cells: {
      mochikomi: { value: '条件付きOK', note: '店舗ページに「離乳食はお持ち込みいただけます」の表示がある店舗のみ（95店中62店）' },
      atatame: { value: '未照合' },
      oyu: { value: '一部店舗で明記', note: '店舗ページに「ミルク用のお湯をご用意しております」の表示（95店中69店）' },
      hanbai: { value: '未照合' },
    },
  },
  jujukarubi: {
    sourceUrl: 'https://www.tomato-a.co.jp/jyujyukarubi/faq/',
    cells: {
      mochikomi: { value: '明記OK', note: 'FAQ「市販の離乳食を持ち込みいただくことも可能です」' },
      atatame: { value: '記載なし' },
      oyu: { value: '未照合' },
      hanbai: { value: '記載なし' },
    },
  },
  'sekai-no-yamachan': {
    sourceUrl: 'https://www.yamachan.co.jp/info/kidsroom.php',
    cells: {
      mochikomi: { value: '条件付きOK', note: 'キッズルーム利用時のベビーフード持ち込みOK' },
      atatame: { value: '未照合' },
      oyu: { value: '未照合' },
      hanbai: { value: '未照合' },
    },
  },
  'steak-no-don': {
    sourceUrl: 'https://www.steak-don.jp/children.html',
    cells: {
      mochikomi: { value: '記載なし' },
      atatame: { value: '記載なし' },
      oyu: { value: '未照合' },
      hanbai: { value: '明記あり', note: 'ベビーフード 290円（税込319円）' },
    },
  },
  volks: {
    sourceUrl: 'https://www.volks-steak.jp/fmenu_list.html?fmenu_categ_id=31',
    cells: {
      mochikomi: { value: '記載なし' },
      atatame: { value: '記載なし' },
      oyu: { value: '未照合' },
      hanbai: { value: '明記あり', note: 'ベビーフード3点セット 330円（税込363円）' },
    },
  },
};
/** 明記はあるが4区分に分解できないため参考表にも載せないもの */
const SUPPLEMENT_EXCLUDED_REASON = {
  'fujiya-restaurant': '公式に「離乳食無料サービス」は一時休止と記載。無料提供の休止で、持ち込み/温め/お湯/販売のどれにも当てはめられない',
  'mo-mo-paradise': '店舗タグ「離乳食可」のみで、持ち込みか店内提供かを公式が区別していない',
  ippudo: '公式noteに「離乳食を食べさせてから提供タイミングを相談できる」旨の記述のみ。持ち込みの可否としては書かれていない',
};

// ---------------------------------------------------------------- 記事リンク
function frozenSlugs() {
  const out = execFileSync('node', ['scripts/check-frozen.mjs', '--list'], { cwd: ROOT, encoding: 'utf8' });
  // 読むのは「凍結slug」「比較基準」の節だけ（「△ 凍結として扱っていないslug」節は読まない）
  const slugs = new Set();
  let section = null;
  for (const line of out.split('\n')) {
    if (/^\S/.test(line)) {
      section = /^凍結slug/.test(line) ? 'frozen' : /^比較基準/.test(line) ? 'baseline' : null;
      continue;
    }
    const m = line.match(/^\s+([a-z0-9][a-z0-9-]*)\s*$/);
    if (m && section) slugs.add(m[1]);
  }
  if (slugs.size === 0) throw new Error('凍結slugを読めませんでした（check-frozen.mjs --list の出力形式を確認）');
  return slugs;
}
function redirectSources() {
  const src = fs.readFileSync(path.join(ROOT, 'lib/article-redirects.ts'), 'utf8');
  return new Set([...src.matchAll(/from:\s*'([^']+)'/g)].map((m) => m[1]));
}
function koryakuSlugsFromDb() {
  const src = fs.readFileSync(path.join(ROOT, 'lib/chain-facilities.ts'), 'utf8');
  const map = new Map();
  for (const m of src.matchAll(/\n\s{4}key:\s*'([^']+)'[\s\S]*?koryakuSlug:\s*'([^']+)'/g)) map.set(m[1], m[2]);
  return map;
}
const FROZEN = frozenSlugs();
const REDIRECTED = redirectSources();
const DB_KORYAKU = koryakuSlugsFromDb();
/** TSVのkeyとチェーンDBのkeyが違うもの */
const KEY_ALIAS = { hamasushi: 'hama-sushi', saizeriya: 'saizeriya' };

const linkable = (slug) =>
  !!slug && !FROZEN.has(slug) && !REDIRECTED.has(slug) && fs.existsSync(path.join(ROOT, 'content/articles', `${slug}.md`));

const skippedLinks = [];
function resolveArticle(key, hint) {
  const candidates = [
    [`${key}-rinyushoku-mochikomi`, 'rinyushoku'],
    [hint, 'koryaku'],
    [DB_KORYAKU.get(KEY_ALIAS[key] ?? key), 'koryaku'],
    [`${key}-kodzure-koryaku`, 'koryaku'],
  ];
  for (const [slug, kind] of candidates) {
    if (linkable(slug)) return { articleSlug: slug, articleKind: kind };
  }
  const frozenHit = candidates.map(([s]) => s).find((s) => s && FROZEN.has(s));
  if (frozenHit) skippedLinks.push(`${key}: ${frozenHit}（凍結）`);
  return { articleSlug: null, articleKind: null };
}

// ---------------------------------------------------------------- 本調査
const CELL_KEYS = ['mochikomi', 'atatame', 'oyu', 'hanbai'];
const mainFiles = fs.readdirSync(MAIN_DIR).filter((f) => /^[A-H]\.tsv$/.test(f)).sort();
const chains = [];
for (const f of mainFiles) {
  for (const r of readTsv(path.join(MAIN_DIR, f))) {
    const corr = CORRECTIONS[r.key];
    const judge = r['判定'];
    const paren = judge.match(/（(.*)）/);
    const cells = {
      mochikomi: { value: normMochikomi(judge), ...(paren ? { note: paren[1] } : {}) },
      atatame: { value: normSub(r['温め']) },
      oyu: { value: normSub(r['お湯']) },
      hanbai: { value: normSub(r['ベビーフード販売']) },
    };
    if (corr) for (const k of CELL_KEYS) if (corr.cells[k]) cells[k] = { ...corr.cells[k] };
    const row = {
      key: r.key,
      name: r.name,
      group: 'main',
      sourceFile: `reports/rinyushoku-official-2026-09-25/${f}`,
      quote: corr?.quote ?? r['公式の文言（原文そのまま・80字以内）'],
      sourceUrl: r.sourceUrl,
      positiveControl: r['陽性対照URL'],
      checkedAt: SURVEY_DATE,
      cells,
      ...(corr ? { correction: corr.reason } : {}),
      ...resolveArticle(r.key, r['作成slug'] || null),
    };
    chains.push(row);
  }
}
for (const a of ADDITIONS) {
  if (chains.some((c) => c.key === a.key)) throw new Error(`ADDITIONS がTSVと重複: ${a.key}`);
  chains.push({
    key: a.key,
    name: a.name,
    group: 'main',
    sourceFile: 'scripts/build-rinyushoku-survey.mjs#ADDITIONS',
    quote: a.quote,
    sourceUrl: a.sourceUrl,
    positiveControl: a.positiveControl,
    checkedAt: a.checkedAt,
    cells: a.cells,
    ...(a.reason ? { correction: a.reason } : {}),
    ...resolveArticle(a.key, null),
  });
}
for (const [key, c] of Object.entries(CORRECTIONS)) {
  if (!chains.some((x) => x.key === key)) throw new Error(`CORRECTIONS のkeyがTSVに無い: ${key}`);
}

// ---------------------------------------------------------------- 参考（新設チェーン照合）
const onboardFiles = fs.readdirSync(ONBOARD_DIR).filter((f) => /^[GH]\d+\.tsv$/.test(f)).sort();
const supplement = [];
const supplementExcluded = [];
for (const f of onboardFiles) {
  for (const r of readTsv(path.join(ONBOARD_DIR, f))) {
    if (chains.some((c) => c.key === r.key)) continue; // 本調査と重複するものは本調査を優先
    const bf = r.babyFood;
    const s = SUPPLEMENT[r.key];
    if (s) {
      supplement.push({
        key: r.key,
        name: r.name,
        group: 'supplement',
        sourceFile: `reports/chain-onboarding-2026-09-25/${f}`,
        quote: bf.replace(/^明記あり:/, ''),
        sourceUrl: s.sourceUrl,
        positiveControl: '',
        checkedAt: SURVEY_DATE,
        cells: s.cells,
        ...resolveArticle(r.key, /-kodzure-koryaku$/.test(r['作成slug']) ? r['作成slug'] : null),
      });
    } else if (SUPPLEMENT_EXCLUDED_REASON[r.key]) {
      supplementExcluded.push({ key: r.key, name: r.name, reason: SUPPLEMENT_EXCLUDED_REASON[r.key] });
    } else if (bf.startsWith('明記あり')) {
      throw new Error(`babyFood に明記があるのに SUPPLEMENT の分解が無い: ${r.key} ${bf}`);
    } else if (bf.startsWith('未調査')) {
      supplementExcluded.push({ key: r.key, name: r.name, reason: '離乳食の項目が未調査' });
    } else {
      supplementExcluded.push({ key: r.key, name: r.name, reason: '照合範囲（メニュー・アレルゲン・店舗ページ中心）で記載を確認できず。本調査と範囲が違うため「記載なし」に数えない' });
    }
  }
}

// ---------------------------------------------------------------- 集計
function tally(rows, key) {
  const counts = {};
  for (const r of rows) counts[r.cells[key].value] = (counts[r.cells[key].value] ?? 0) + 1;
  const stated = key === 'mochikomi'
    ? (counts['明記OK'] ?? 0) + (counts['条件付きOK'] ?? 0)
    : (counts['明記あり'] ?? 0) + (counts['一部店舗で明記'] ?? 0);
  const denominator = rows.length - (counts['未確認'] ?? 0) - (counts['未照合'] ?? 0);
  return {
    stated,
    denominator,
    total: rows.length,
    counts,
    chains: rows.filter((r) => /^明記|^条件付き|^一部店舗/.test(r.cells[key].value)).map((r) => r.key),
  };
}
const summary = Object.fromEntries(CELL_KEYS.map((k) => [k, tally(chains, k)]));
const allergyOnly = chains.filter((c) => /食物アレルギー/.test(c.cells.mochikomi.note ?? '')).map((c) => c.key);
const anyStated = chains.filter((c) => CELL_KEYS.some((k) => /^明記|^条件付き|^一部店舗/.test(c.cells[k].value))).map((c) => c.key);

const out = {
  title: '外食チェーン 離乳食対応の公式記載 実態調査2026',
  generatedAt: SURVEY_DATE,
  surveyPeriod: SURVEY_DATE,
  generator: 'scripts/build-rinyushoku-survey.mjs',
  inputs: [
    'reports/rinyushoku-official-2026-09-25/{A..H}.tsv',
    'reports/chain-onboarding-2026-09-25/{G1..G7,H1..H7}.tsv（babyFood列・参考）',
    'scripts/build-rinyushoku-survey.mjs の CORRECTIONS / ADDITIONS / SUPPLEMENT',
  ],
  summary: {
    chainCount: chains.length,
    ...summary,
    allergyOnlyMochikomi: allergyOnly,
    anyStated,
  },
  chains,
  supplement,
  supplementSummary: Object.fromEntries(CELL_KEYS.map((k) => [k, tally(supplement, k)])),
  supplementExcluded,
};

const line = (k, label) => `${label}: ${summary[k].stated}/${summary[k].denominator}（全${summary[k].total}中、未確認・未照合 ${summary[k].total - summary[k].denominator}）${summary[k].chains.join(', ')}`;
console.log(`本調査 ${chains.length}チェーン`);
console.log(line('mochikomi', '持ち込み明記'));
console.log(line('atatame', '温め明記'));
console.log(line('oyu', 'お湯明記'));
console.log(line('hanbai', '販売明記'));
console.log(`食物アレルギー向けの持ち込みのみ明記: ${allergyOnly.join(', ')}`);
console.log(`いずれか1項目でも明記: ${anyStated.length}社`);
console.log(`参考（新設照合・分解できた明記）: ${supplement.map((s) => s.key).join(', ')} ／ 参考表から除外 ${supplementExcluded.length}件`);
console.log(`記事リンクなし: ${[...chains, ...supplement].filter((c) => !c.articleSlug).map((c) => c.key).join(', ')}`);
if (skippedLinks.length) console.log(`凍結のためリンクしない: ${skippedLinks.join(' / ')}`);

if (!CHECK_ONLY) {
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(`→ ${path.relative(ROOT, OUT)}`);
}
