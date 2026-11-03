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
 * ── 2026-10-10 追加: 根拠のない点数・順位／出所のない比率・回数・年数／一人称の体験 ──
 *   `conveni-kodzure-kids-shokuzai-4sha` に「5軸×10点=50点満点」の採点・1〜4位の順位・
 *   「我が家の利用比率 セブン4：ローソン3：…」が、記録なしで載っていた（記事の生成と同時に置かれた値。
 *   同じ型が公開中に12本）。7/28 の掃討は「編集部が◯人に調査」型だけを見ていて、この型を通していた。
 *
 *   追加した検査は2段階:
 *     [GATE] 点数（◯軸×◯点・◯点満点・NN/50・採点／スコア化）、採点の順位（見出し・表の「N位」・
 *            本文の「総合N位です」）、出所のない比率・回数・年数（「セブン4：ローソン3：…」
 *            「延べ100店舗」「我が家では月2〜3回」）、記録のない調査の体裁（「ママ50人にきいた」）
 *            → **既知の一覧（data/unfounded-claims-baseline.json）に無い記事×型だけ exit 1**。
 *            既知の分は警告にとどめる（直すまで赤のままだと、他のPRが全部止まるため）。
 *            一覧の各行には期限（until）がある。期限を過ぎた行は目立つ警告にする
 *            （`--fail-on-expired` を付けたときだけ exit 1）。直した記事は一覧から消す
 *            （消し忘れは「もう当たっていない行」として表示される）。
 *     [WARN] 一人称の体験（我が家・実際に行って・助けられた 等）と、題の「ランキング／TOP」に
 *            根拠の記載が無いもの。機械では真偽を判定できず件数も多いので、**常に警告**（exit 1 にしない）。
 *            実訪問の記録がある記事は除外する（lib/kid-reports.ts のスポット名・lib/chain-reports.ts の
 *            店舗名が本文に出てくる記事と、一覧ファイルの visitBacked に書いた slug）。
 *
 *   「順位や点数は付けていません」「削除しました」のような否定の文と、
 *   「## この記事から外したもの」節の中は、開示なので拾わない。
 *   目で見て誤検知と決めた記事×型は、一覧ファイルの ignore に理由つきで書く（恒久的に外れる）。
 *
 * 使い方:
 *   node scripts/check-fabricated-claims.mjs           # 違反があれば exit 1
 *   node scripts/check-fabricated-claims.mjs --public  # 公開記事のみ検査
 *   node scripts/check-fabricated-claims.mjs --all             # 警告（WARN）も全件表示する
 *   node scripts/check-fabricated-claims.mjs --no-baseline     # 既知の一覧を無視して全 GATE を出す（棚卸し用）
 *   node scripts/check-fabricated-claims.mjs --print-baseline  # 現状の GATE を一覧の形（JSON）で標準出力に出す
 *   node scripts/check-fabricated-claims.mjs --fail-on-expired # 期限切れの既知の行があれば exit 1
 *   node scripts/check-fabricated-claims.mjs --json            # 追加した検査の結果を JSON で出す（集計用）
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


/* ------------------------------------------------------------------ *
 * 従来の検査（自称の一次調査・未検証の「公式が〜」）の報告。終了コードを返す。
 * ------------------------------------------------------------------ */
const AS_JSON = process.argv.includes('--json');
const say = (...a) => { if (!AS_JSON) console.log(...a); };
const warn = (...a) => { if (!AS_JSON) console.error(...a); };

function reportLegacy() {
  const WARN_LABEL = '公式が言っているという未検証の断定';
  // 新ルールは「捏造が確定した」ではなく「一次情報の裏取りが必要」を意味する。
  // 公式サイトに実在する記述を正しく引用しているケースも同じ形になるため、
  // 機械では真偽を判定できない。よってこれは**警告**として出し、exit 1 にはしない。
  const warns = hits.filter((h) => h.label === WARN_LABEL);
  const errs = hits.filter((h) => h.label !== WARN_LABEL);
  if (warns.length) {
    warn(`⚠ 一次情報の裏取りが必要な「公式が〜」の断定 ${warns.length} 件（exit 1 にはしない）`);
    for (const h of warns) warn(`  ${h.noindex ? '[noindex] ' : '[公開]    '}${h.file}  ${h.excerpt}`);
    warn('対処: 公式ページを curl して該当記述を確認し、出典URLと確認日を本文に書く。');
    warn('      確認できなければ「公式に記載はなく店舗判断」と書き直す。\n');
  }
  if (!errs.length) {
    say(`✓ 捏造主張なし（${publicOnly ? '公開記事のみ' : '全記事'}）`);
    return 0;
  }
  const byLabel = {};
  for (const h of errs) (byLabel[h.label] ??= []).push(h);
  warn(`✗ 捏造の疑いがある主張 ${errs.length} 件\n`);
  for (const [label, list] of Object.entries(byLabel)) {
    warn(`【${label}】${list.length}件`);
    for (const h of list.slice(0, 8)) {
      warn(`  ${h.noindex ? '[noindex] ' : '[公開]    '}${h.file}  ${h.excerpt}`);
    }
    if (list.length > 8) warn(`  …他 ${list.length - 8} 件`);
    warn('');
  }
  warn('対処: セクションを削除するか、出典のある記述に差し替える。');
  warn('詳細: reports/fabricated-stats-audit-2026-07-27.md');
  return 1;
}

/* ------------------------------------------------------------------ *
 * 2026-10-10 追加: 根拠のない点数・順位／出所のない比率・回数・年数／一人称の体験
 * ------------------------------------------------------------------ */
const BASELINE_PATH = 'data/unfounded-claims-baseline.json';
const SHOW_ALL = process.argv.includes('--all');
const NO_BASELINE = process.argv.includes('--no-baseline');
const PRINT_BASELINE = process.argv.includes('--print-baseline');
const FAIL_ON_EXPIRED = process.argv.includes('--fail-on-expired');

const NUM = '[0-9０-９]';

/** 一人称（だれの体験・だれの数字か）を示す語。比率・回数・年数の型はこれと同じ文にあるときだけ拾う。 */
const FIRST_PERSON = /(我が家|わが家|ながみー家|ながみー|うちの子|うちでは|編集部|編集長|筆者|私(?:は|が|の|たち))/;

/**
 * 文の単位で当てる型（否定の文は拾わない）。[id, 表示名, 重さ, 判定]
 * 重さ: 'gate' = 既知の一覧に無ければ exit 1 ／ 'warn' = 常に警告
 */
const SENTENCE_RULES = [
  [
    'score',
    '根拠の示されていない点数（◯軸×◯点・◯点満点・NN/50・採点）',
    'gate',
    (s) =>
      new RegExp(`${NUM}+\\s*軸\\s*[×xX✕＊*]\\s*${NUM}+\\s*点`).test(s) ||
      new RegExp(`${NUM}{1,3}\\s*点満点`).test(s) ||
      // 「43/50」「（45点）」のような合計点。日付（10/10・5/30）と紛れない分母だけを見る。
      /(?<![0-9０-９.\/])[1-9][0-9]\s*[\/／]\s*(?:50|100)(?![0-9０-９\/])/.test(s) ||
      new RegExp(`${NUM}\\s*[\\/／]\\s*(?:10|30)\\s*点`).test(s) ||
      /スコア(?:化|で採点|ランキング|順)|総合スコア|で採点|採点(?:しました|した|方法|結果|基準)/.test(s),
  ],
  [
    'ratio',
    '出所のない比率・回数・年数（利用比率 4:3:2:1・延べ◯店舗・月◯回・◯年）',
    'gate',
    (s, ctx) =>
      // 「セブン4：ローソン3：ファミマ2」「丸亀50%・はなまる30%・…」
      new RegExp(`(?:[^\\s：:、。|0-9０-９]{1,14}${NUM}[0-9０-９.]*\\s*[：:]\\s*){2,}[^\\s：:、。|0-9０-９]{1,14}${NUM}`).test(s) ||
      (/比率/.test(s) && new RegExp(`(?:${NUM}+\\s*[%％][^。]{0,14}){2,}`).test(s)) ||
      new RegExp(`延べ\\s*${NUM}[0-9０-９,，]*\\s*(?:店舗|店|軒|回|か所|ヶ所|カ所|箇所|施設|園)`).test(s) ||
      // 「我が家では月2〜3回」「5年やってきた」。実訪問の記録がある記事では拾わない（本物の利用頻度を書けるようにする）
      (!ctx.visitBacked &&
        FIRST_PERSON.test(s) &&
        (new RegExp(`(?:週|月|年)\\s*${NUM}+\\s*(?:[〜~～\\-－]\\s*${NUM}+)?\\s*回`).test(s) ||
          new RegExp(`${NUM}+\\s*年(?:以上|間)?\\s*(?:やってきた|通っ|利用し|使い続け|にわたり)`).test(s))),
  ],
  [
    'survey',
    '記録のない調査の体裁（ママ◯人に聞いた・◯人の声・◯人投票）',
    'gate',
    (s) =>
      new RegExp(
        `(?:ママ|パパ|ママ友|先輩ママ|先輩パパ|保護者|読者|ママネットワーク)\\s*${NUM}[0-9０-９,，]*\\s*(?:人|名|世帯|家庭)(?:に(?:きいた|聞い|聞き|アンケート|調査)|へ(?:の)?(?:任意)?(?:質問|アンケート)|の声|が?投票|の投票|アンケート)`,
      ).test(s),
  ],
  [
    'first-person',
    '一人称の体験（実訪問の記録が見当たらない記事）',
    'warn',
    (s) =>
      /(我が家|わが家|ながみー家|うちの子|うちでは|私ながみー|実利用|実訪問|実体験|一次データ|一次体験|体験ベース|取材ベース|実際に(?:行っ|訪れ|通っ|食べ|使っ|利用し|試し)|行ってきました|助けられ|救われ|救世主|お世話になって)/.test(s),
  ],
];

/** 行の形で当てる型（見出し・表の「N位」）。採点の順位はここで拾う。 */
const RANK_LINE = new RegExp(`^(?:#{2,4}\\s*(?:第\\s*)?(?:No\\.?\\s*)?\\**${NUM}+\\s*位|\\|\\s*\\**\\s*${NUM}+\\s*位\\**\\s*\\||#{2,4}.*総合ランキング)`);

/** 他の記事の採点の順位を本文で引く形（「幸楽苑は総合1位です」「ランキング6社では6位（24/50点）」）。 */
const RANK_PROSE = new RegExp(`総合\\s*${NUM}+\\s*位|ランキング[^。]{0,60}では\\s*${NUM}+\\s*位|は第\\s*${NUM}+\\s*位）`);

/** 「付けていません」「削除しました」のような否定・撤回の文は開示なので拾わない。 */
const WITHDRAWN =
  /(付けていません|付けていない|つけていません|削除しました|削除し、|外しました|載せていません|載せない方針|無くなった|なくなった|残っていません|ありませんでした|廃止しました|していません|避け、)/;

/** 「## この記事から外したもの」のような、撤回を説明する見出しの配下は拾わない。 */
const stripWithdrawnSections = (raw) => {
  const keep = [];
  let skip = 0;
  for (const l of raw.split('\n')) {
    const h = l.match(/^(#{2,6})\s+(.*)$/);
    if (h) {
      const lvl = h[1].length;
      if (skip && lvl <= skip) skip = 0;
      if (!skip && /外したもの|削除したもの|取り下げたもの|訂正の記録/.test(h[2])) { skip = lvl; continue; }
    }
    if (!skip) keep.push(l);
  }
  return keep.join('\n');
};

/** 題の「ランキング／TOP」に、順位の決め方・出典の記載が本文に無いもの（警告）。 */
const RANKING_TITLE = /^title:.*(?:ランキング|TOP\s*[0-9０-９]+|ＴＯＰ|ベスト[0-9０-９]+)/im;
const RANKING_BASIS = /(集計の方法|順位の(?:決め方|根拠|基準)|選定基準|評価基準の開示|ランキングの(?:根拠|基準|出典|決め方)|出典[：:])/;

/** 実訪問の記録（lib/kid-reports.ts のスポット名・lib/chain-reports.ts の店舗名）。 */
function loadVisitEvidence() {
  /** それぞれ「全部の語が本文に出てくれば、その記事には実訪問の記録がある」とみなす語の組 */
  const groups = [];
  try {
    const kr = fs.readFileSync('lib/kid-reports.ts', 'utf8');
    // 短すぎる名前（2文字以下）は別の語に紛れるので使わない
    for (const m of kr.matchAll(/^ {2}(?:'([^']+)'|([^\s':]+)):\s*\{/gm)) {
      const n = m[1] ?? m[2];
      if (n && n.length >= 3) groups.push([n]);
    }
  } catch { /* 無ければ除外なしで続ける */ }
  try {
    const cr = fs.readFileSync('lib/chain-reports.ts', 'utf8');
    // 「草加店」だけだと別のチェーンの記事にも当たるので、チェーン名と店舗名の両方が出てくる記事に限る
    for (const m of cr.matchAll(/chain:\s*'([^']+)',\s*\n\s*store:\s*'([^']+)'/g)) groups.push([m[1], m[2]]);
  } catch { /* 同上 */ }
  return groups;
}

function loadBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) return { entries: [], visitBacked: {}, ignore: [] };
  const j = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
  // --no-baseline は「既知の行」だけを無視する。目で見て誤検知と決めた行（ignore）と、
  // 実訪問の記録がある記事（visitBacked）は、棚卸しのときも効かせる。
  return { entries: NO_BASELINE ? [] : (j.entries ?? []), visitBacked: j.visitBacked ?? {}, ignore: j.ignore ?? [] };
}

function scanUnfounded() {
  const evidence = loadVisitEvidence();
  const baseline = loadBaseline();
  const found = []; // { slug, rule, label, severity, noindex, count, excerpt }
  for (const f of fs.readdirSync(DIR)) {
    if (!f.endsWith('.md')) continue;
    const slug = f.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
    const noindex = /^noindex:\s*true/m.test(raw.slice(0, 1500));
    if (publicOnly && noindex) continue;
    const text = stripWithdrawnSections(stripDisclosedFiction(raw));
    const visitBacked = slug in baseline.visitBacked || evidence.some((g) => g.every((n) => raw.includes(n)));
    const sentences = text
      .split(/(?<=。)|\n/)
      .map((s) => s.trim())
      .filter((s) => s && !WITHDRAWN.test(s));
    for (const [rule, label, severity, test] of SENTENCE_RULES) {
      if (rule === 'first-person' && visitBacked) continue;
      const m = sentences.filter((s) => test(s, { visitBacked }));
      if (m.length) found.push({ slug, rule, label, severity, noindex, count: m.length, excerpt: m[0].slice(0, 90) });
    }
    const rankLines = [
      ...text.split('\n').filter((l) => RANK_LINE.test(l) && !WITHDRAWN.test(l)),
      ...sentences.filter((s) => !RANK_LINE.test(s) && RANK_PROSE.test(s)),
    ];
    if (rankLines.length) {
      found.push({
        slug, rule: 'rank', label: '根拠の示されていない順位（見出し・表の「N位」／総合ランキング）', severity: 'gate',
        noindex, count: rankLines.length, excerpt: rankLines[0].slice(0, 90),
      });
    }
    if (RANKING_TITLE.test(raw.slice(0, 600)) && !RANKING_BASIS.test(text)) {
      found.push({
        slug, rule: 'ranking-title', label: '題が「ランキング／TOP」で、順位の決め方・出典の記載が無い', severity: 'warn',
        noindex, count: 1, excerpt: (raw.match(/^title:\s*(.*)$/m)?.[1] ?? '').slice(0, 90),
      });
    }
  }
  const ignored = new Set(baseline.ignore.map((e) => `${e.slug}\t${e.rule}`));
  return { found: found.filter((h) => !ignored.has(`${h.slug}\t${h.rule}`)), baseline };
}

function reportUnfounded() {
  const { found, baseline } = scanUnfounded();
  const today = new Date().toISOString().slice(0, 10);
  const key = (e) => `${e.slug}\t${e.rule}`;
  const base = new Map(baseline.entries.map((e) => [key(e), e]));
  const gate = found.filter((h) => h.severity === 'gate');
  const warns = found.filter((h) => h.severity === 'warn');
  const fresh = gate.filter((h) => !base.has(key(h)));
  const known = gate.filter((h) => base.has(key(h)));
  const expired = known.filter((h) => (base.get(key(h)).until ?? '9999') < today);
  const hitKeys = new Set(gate.map(key));
  const stale = baseline.entries.filter((e) => !hitKeys.has(key(e)));

  if (PRINT_BASELINE) {
    console.log(JSON.stringify(gate.map((h) => ({ slug: h.slug, rule: h.rule, until: '', note: '' })), null, 2));
    return 0;
  }
  if (AS_JSON) {
    console.log(JSON.stringify({ today, counts: {
      gate: gate.length, fresh: fresh.length, known: known.length, expired: expired.length, stale: stale.length, warn: warns.length,
    }, fresh, known, expired, stale, warns }, null, 2));
    return fresh.length || (FAIL_ON_EXPIRED && expired.length) ? 1 : 0;
  }

  const tag = (h) => `${h.noindex ? '[noindex] ' : '[公開]    '}${h.slug}  （${h.count}か所）${h.excerpt}`;
  const byRule = (list) => {
    const o = {};
    for (const h of list) (o[h.label] ??= []).push(h);
    return Object.entries(o);
  };

  if (warns.length) {
    warn(`\n⚠ 根拠の確認が要る書き方 ${warns.length} 件（警告。exit 1 にはしない）`);
    for (const [label, list] of byRule(warns)) {
      warn(`【${label}】${list.length}本`);
      for (const h of SHOW_ALL ? list : list.slice(0, 5)) warn(`  ${tag(h)}`);
      if (!SHOW_ALL && list.length > 5) warn(`  …他 ${list.length - 5} 本（--all で全件）`);
    }
    warn('対処: 実訪問の記録（lib/kid-reports.ts・lib/chain-reports.ts）が無い体験の記述は削る。');
    warn('      記録がある記事は、一覧ファイルの visitBacked に slug と根拠を書けば警告から外れる。');
  }
  if (known.length) {
    warn(`\n⚠ 既知の「根拠のない点数・順位・比率」 ${known.length} 件（${BASELINE_PATH} に記載。直すまで警告）`);
    for (const [label, list] of byRule(known)) {
      warn(`【${label}】${list.length}本`);
      for (const h of SHOW_ALL ? list : list.slice(0, 5)) warn(`  ${tag(h)}  ［期限 ${base.get(key(h)).until ?? 'なし'}］`);
      if (!SHOW_ALL && list.length > 5) warn(`  …他 ${list.length - 5} 本（--all で全件）`);
    }
  }
  if (expired.length) {
    warn(`\n⚠⚠ 期限を過ぎた既知の行が ${expired.length} 件あります（直すか、理由を書いて期限を延ばす）`);
    for (const h of expired) warn(`  ${h.slug}  ${h.rule}  期限 ${base.get(key(h)).until}`);
  }
  if (stale.length) {
    warn(`\n・もう当たっていない既知の行 ${stale.length} 件（${BASELINE_PATH} から消してよい）`);
    for (const e of stale) warn(`  ${e.slug}  ${e.rule}`);
  }
  if (fresh.length) {
    warn(`\n✗ 根拠のない点数・順位・比率の新しい混入 ${fresh.length} 件`);
    for (const [label, list] of byRule(fresh)) {
      warn(`【${label}】${list.length}本`);
      for (const h of list) warn(`  ${tag(h)}`);
    }
    warn('\n対処: 点数・順位・比率は、いつ・どこで・どう数えたかの記録が無ければ載せない。');
    warn('      公式で確認できる事実の比較表（確認日・出典つき）に置き換える。');
    warn(`      既存記事を直す順番を待っているだけなら、${BASELINE_PATH} に期限つきで追記する（理由を書く）。`);
    return 1;
  }
  say(`✓ 根拠のない点数・順位・比率の新しい混入なし（既知 ${known.length} 件・警告 ${warns.length} 件）`);
  return FAIL_ON_EXPIRED && expired.length ? 1 : 0;
}

const legacyCode = PRINT_BASELINE || AS_JSON ? 0 : reportLegacy();
const unfoundedCode = reportUnfounded();
process.exit(legacyCode || unfoundedCode ? 1 : 0);
