/**
 * 裏づけの確認が要る書き方（点数・順位・比率・集計・調査の体裁・一人称の体験）を拾う規則。
 *
 * **規則の定義はこの 1 ファイルだけに置く。** 読むのは次の 3 か所:
 *   - scripts/check-fabricated-claims.mjs      … 全記事の検査（CI・手元）
 *   - scripts/tieup-preflight.mjs              … 法人営業で相手に見せる記事の送信前の監査
 *   - app/api/admin/edit-content/route.ts      … 管理画面の保存（KV に入る本文。表示は KV が md より優先）
 * ファイルも KV も読まない純粋な関数だけを置く（サーバーの API からもそのまま import できるように）。
 *
 * この検査が言えること・言えないこと:
 *   言えるのは「この書き方には、記録（いつ・どこで・だれが・どう数えたか）の確認が要る」まで。
 *   **機械の検出は「事実でない」ことを意味しない。** 表示や一覧では「記録なし・確認待ち」と書き、
 *   「架空」「捏造」と断定しない（社長の実体験が、記録の置き場が無いためにコミットの文にしか
 *   残っていない記事が 31 本あった。2026-10-11 の監査）。
 *
 * 重さ（severity）:
 *   'error' … 既知の一覧に関係なく失敗（2026-07-28 の掃討で 0 件にした、自称の一次調査の型）
 *   'gate'  … 既知の一覧（data/unfounded-claims-baseline.json・data/experience-claims-baseline.json）
 *             に無い「記事×型」、または一覧の件数より増えた記事だけ失敗
 *   'warn'  … 常に警告（言い回しだけでは体験かどうかが決まらない型）
 *
 * 失敗にする型と警告にとどめる型の分け方:
 *   失敗（gate）= 書き方そのものが「記録がある」ことを前提にする型。数（点数・順位・比率・回数・
 *     店舗数・件数・割合）、調査・集計の体裁、名前を伏せた他人の発言の引用、体験の節の見出し、
 *     書き手の家族を主語にした文。全記事に流して目で見た誤検知が少なく、誤検知は ignore に
 *     理由つきで書けば外せる。
 *   警告（warn）= 「実際に食べる」「助けられた」のように、体験の報告にも一般論にも使う言い回し。
 *     2026-10-11 の監査で、節の無い記事の一人称を 2 本読んだうち 1 本が誤検知（「子が実際に食べる
 *     冷凍食品」）だったので、失敗には上げない。題の「ランキング／TOP」と「公式が〜と案内」も
 *     従来どおり警告。
 */

const NUM = '[0-9０-９]';

/* ------------------------------------------------------------------ *
 * 1. 2026-07-28 の掃討の型（自称の一次調査・未検証の「公式が〜」）。本文全体に当てる。
 * ------------------------------------------------------------------ */

/** 見出しレベルの検出（セクションまるごと捏造のパターン） */
export const LEGACY_HEADING_RULES = [
  ['編集部の独自視点', /^##.*編集部の独自視点/m],
  ['きょうのこ独自データ', /^##.*独自データ/m],
  ['先輩ママ・パパの声', /^##.*先輩ママ・パパの声/m],
  ['専門家から見たポイント', /^##.*専門家から見た/m],
];

export const OFFICIAL_CLAIM_LABEL = '公式が言っているという未検証の断定';

/** 本文中の主張の検出 */
export const LEGACY_BODY_RULES = [
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
    OFFICIAL_CLAIM_LABEL,
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
export const stripDisclosedFiction = (raw) => {
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

/** 2026-07-28 の型を本文に当てる。返り値: [{ label, excerpt }] */
export function scanLegacy(raw) {
  const scoped = stripDisclosedFiction(raw);
  const hits = [];
  for (const [label, re] of [...LEGACY_HEADING_RULES, ...LEGACY_BODY_RULES]) {
    const m = scoped.match(re);
    if (!m) continue;
    const excerpt = (m[0] ?? '').replace(/\n/g, ' ');
    // 「公式に記載がない／明記されているわけではない」と否定形で書いているのは
    // 正しい書き方なので違反にしない。**否定語は一致部分の直後に来る**ので、
    // マッチした断片だけを見ると取りこぼす。前後に窓を取って判定する。
    if (label === OFFICIAL_CLAIM_LABEL) {
      const at = m.index ?? -1;
      const window = at >= 0 ? scoped.slice(at, at + 160).replace(/\n/g, ' ') : excerpt;
      if (OFFICIAL_NEGATION.test(window)) continue;
    }
    hits.push({ label, excerpt: excerpt.slice(0, 70) });
  }
  return hits;
}

/* ------------------------------------------------------------------ *
 * 2. 点数・順位・比率・集計・調査の体裁・一人称の体験（文・見出しの単位で当てる）
 * ------------------------------------------------------------------ */

/** 型の一覧。group は法人営業の監査（scripts/tieup-preflight.mjs）での分け方。 */
export const RULE_META = {
  score: { label: '根拠の示されていない点数（◯軸×◯点・◯点満点・NN/50・採点）', severity: 'gate', group: 'ranking' },
  rank: { label: '根拠の示されていない順位（見出し・表の「N位」／総合ランキング）', severity: 'gate', group: 'ranking' },
  ratio: { label: '出所のない比率・回数・年数・店舗数（利用比率 4:3:2:1・延べ◯店舗・月◯回・年間◯回・◯店舗を実地確認）', severity: 'gate', group: 'number' },
  survey: { label: '記録のない調査の体裁（ママ◯人に聞いた・◯人の声・◯人投票）', severity: 'gate', group: 'number' },
  aggregate: { label: '集計の記録が見当たらない「約N件の声を分析」「〜という声が約N%」', severity: 'gate', group: 'number' },
  'anon-voice': { label: '名前を伏せた他人の声の引用（Aさん（30代・1歳児）…）', severity: 'gate', group: 'experience' },
  'exp-section': { label: '体験の節（記録なし・確認待ち）', severity: 'gate', group: 'experience' },
  'first-person': { label: '書き手の家族を主語にした体験の文（記録なし・確認待ち）', severity: 'gate', group: 'experience' },
  'experience-wording': { label: '体験とも一般論とも読める言い回し（実際に◯◯・助けられた 等）', severity: 'warn', group: 'experience' },
  'ranking-title': { label: '題が「ランキング／TOP」で、順位の決め方・出典の記載が無い', severity: 'warn', group: 'ranking' },
};

export const GROUP_LABEL = {
  number: '未確認の数値（集計・割合・比率・回数）',
  experience: '未確認の体験（一人称・体験の節・他人の声）',
  ranking: '未確認のランキング（点数・順位）',
};

/** 一人称（だれの体験・だれの数字か）を示す語。比率・回数・年数の型はこれと同じ文にあるときだけ拾う。 */
const FIRST_PERSON = /(我が家|わが家|ながみー家|ながみー|うちの子|うちでは|編集部|編集長|筆者|私(?:は|が|の|たち))/;

/**
 * 書き手の家族を主語にした語（失敗にする側）。
 * 「我が家に合う選び方」「ご家庭」のような、読み手に向けた一般論は GENERIC_FAMILY で外す。
 */
const FAMILY_SUBJECT =
  /(我が家|わが家|ながみー家|うちでは|うちの場合|私ながみー|行ってきました|実訪問|実体験|実利用|一次体験|体験ベース|取材ベース|友人(?:の)?(?:ファミリー|家族|一家|親子)[^。\n]{0,40}同行|に同行した日)/;
const GENERIC_FAMILY =
  /(?:我が家|わが家)(?:に(?:合う|合った|合わせ|合い|ぴったり|取り入れ)|流に|なりの|のルールを(?:決め|作)|ルールを(?:決め|作)|は(?:どれ|どっち|どちら|どの))/;

/**
 * 体験とも一般論とも読める言い回し（警告にとどめる側）。
 * 「うちの子」は、読み手の気持ちを代弁する形（「うちの子言葉が遅い…」と心配しすぎず）が多く、
 * 無作為 70 文のうち 5 文がこれだったので、失敗の側には入れない。
 */
const EXPERIENCE_WORDING =
  /(うちの子|一次データ|実際に(?:行っ|訪れ|通っ|食べ|使っ|利用し|試し)|助けられ|救われ|救世主|お世話になって)/;

/**
 * 内部リンクの文字（ほかの記事の題）は、その文の主張ではないので外してから見る。
 * （「…は[ガストの…配膳ロボ実体験](/article/gusto-kodzure-koryaku)にまとめています」）
 */
const dropInternalAnchors = (s) => s.replace(/\[[^\]\n]*\]\(\/[^)\s]*\)/g, '');

/** 「この記事の確認方法｜著者と更新メモ」のように、確かめ方を開示する節は体験の節として拾わない。 */
const VERIFICATION_HEADING = /確認方法|確認した方法|出典と確認日/;

/** 体験の節の見出し。「編集部に届いた声」は集計の型（aggregate）で拾う。 */
const EXPERIENCE_HEADING =
  /^#{2,4}\s+.*(?:我が家|わが家|ながみー家|うちの場合|体験談|体験メモ|実体験|体験ベース|著者と(?:更新|取材)メモ|編集部の失敗談|先輩ママのリアル)/;

/** 「体験していないので、この欄は空けています」と明記した節は、体験の節として拾わない（開示）。 */
const NOT_EXPERIENCED = /体験談を創作しない|この欄は空けて|実際に(?:使って|行って|利用して|訪れて|食べて)いません/;

/** 集計・調査に出どころが書いてある行は拾わない（公式の店舗検索の全件集計、名前のある調査）。 */
const SOURCED =
  /出典[：:]|きょうのこ調べ|公式[^。\n]{0,24}(?:全店|全件)?(?:を)?集計|による[^。\n]{0,12}調査|調べ[）)]|（[^）\n]{0,30}(?:調査|統計|白書)[^）\n]{0,20}）|公式(?:の)?店舗検索/;

/**
 * 文の単位で当てる型（否定の文は拾わない）。[id, 判定]
 * ctx.recordTied = その文のある節が、実訪問の記録と結びついている（→ 記録のある本物の利用頻度を書けるようにする）
 */
const SENTENCE_RULES = [
  [
    'score',
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
    (s, ctx) =>
      // 「セブン4：ローソン3：ファミマ2」「丸亀50%・はなまる30%・…」
      new RegExp(`(?:[^\\s：:、。|0-9０-９]{1,14}${NUM}[0-9０-９.]*\\s*[：:]\\s*){2,}[^\\s：:、。|0-9０-９]{1,14}${NUM}`).test(s) ||
      (/比率/.test(s) && new RegExp(`(?:${NUM}+\\s*[%％][^。]{0,14}){2,}`).test(s)) ||
      new RegExp(`延べ\\s*${NUM}[0-9０-９,，]*\\s*(?:店舗|店|軒|回|か所|ヶ所|カ所|箇所|施設|園)`).test(s) ||
      (!ctx.recordTied &&
        // 「年間100回以上通って」「年間50回以上の取材」（2026-10-11 の監査で 5 本。だれの数字かの語が無くても拾う）
        (new RegExp(`年間\\s*(?:約)?${NUM}[0-9０-９,，]*\\s*回(?:以上|超|近く|ほど)?[^。]{0,16}(?:通っ|通い|通う|取材|訪れ|訪問|利用|足を運)`).test(s) ||
          // 「首都圏30店舗以上を実地確認」「複数店舗を利用」。公式の店舗検索の集計（SOURCED）は拾わない
          (!SOURCED.test(s) &&
            (new RegExp(`${NUM}[0-9０-９,，]*\\s*店舗?(?:以上|超)?(?:を|で|に)[^。]{0,10}(?:実地(?:で)?(?:確認|調査)|実際に(?:確認|利用|訪問)|食べ比べ)`).test(s) ||
              /複数(?:の)?店舗(?:を|で)[^。]{0,12}(?:利用|訪問|訪れ|実地)/.test(s))) ||
          // 「我が家では月2〜3回」「5年やってきた」
          (FIRST_PERSON.test(s) &&
            (new RegExp(`(?:週|月|年)\\s*${NUM}+\\s*(?:[〜~～\\-－]\\s*${NUM}+)?\\s*回`).test(s) ||
              new RegExp(`${NUM}+\\s*年(?:以上|間)?\\s*(?:やってきた|通っ|利用し|使い続け|にわたり)`).test(s))))),
  ],
  [
    'survey',
    (s) =>
      new RegExp(
        `(?:ママ|パパ|ママ友|先輩ママ|先輩パパ|保護者|読者|ママネットワーク)\\s*${NUM}[0-9０-９,，]*\\s*(?:人|名|世帯|家庭)(?:に(?:きいた|聞い|聞き|アンケート|調査)|へ(?:の)?(?:任意)?(?:質問|アンケート)|の声|が?投票|の投票|アンケート)`,
      ).test(s),
  ],
  [
    // 2026-10-11 追加（下書きPR #317 の規則 A・B・C）。frontmatter の題・説明文の行にも当たる。
    'aggregate',
    (s) =>
      !SOURCED.test(s) &&
      !WITHDRAWN_STRICT.test(s) &&
      // A: 見出し「編集部に届いた声｜…」「…（約150件集計）」
      (/^#{2,4} .*(?:編集部に(?:届いた|寄せられた)声|（約?\s*[0-9０-９][0-9０-９,，]*\s*件(?:を)?集計）)/.test(s) ||
        // B: 「約150件の声を傾向分析」「公開の口コミ…約130件の声」「家庭約120件の声を横断分析」
        new RegExp(`約?\\s*${NUM}[0-9０-９,，]*\\s*件(?:規模)?の(?:家庭の)?声[をから]?[^。\\n]{0,24}(?:傾向分析|横断分析|分析|集計|整理)`).test(s) ||
        new RegExp(`(?:口コミ|レビュー|SNS|公開情報|ブログ)[^。\\n]{0,60}約?\\s*${NUM}[0-9０-９,，]*\\s*件(?:規模)?の(?:家庭の)?声`).test(s) ||
        // C: 「〜という声が約78%」「〜と答えた家庭：約78%」
        new RegExp(`「[^」\\n]{2,40}」[^。\\n「]{0,14}(?:声|家庭|報告|評価)[^。\\n「]{0,8}\\**約?\\s*(?:${NUM}{1,3}(?:[.．]${NUM})?\\s*[%％]|${NUM}\\s*割|半数)`).test(s)),
  ],
  [
    // 「Aさん（30代・1歳児）：『…』」。だれの発言かを確かめられない引用（2026-10-11 の監査で 18 本）。
    'anon-voice',
    (s) =>
      /(?:^|[\s>*\-・「『（(｜|:：、。])[A-ZＡ-Ｚ]さん\**\s*[（(][^）)\n]{0,40}(?:代|歳|才|児|ママ|パパ|か月|ヶ月|カ月|年生)[^）)\n]{0,24}[）)]/.test(s),
  ],
  ['first-person', (s) => { const t = dropInternalAnchors(s); return FAMILY_SUBJECT.test(t) && !GENERIC_FAMILY.test(t) && !EXPERIENCE_HEADING.test(t); }],
  ['experience-wording', (s) => { const t = dropInternalAnchors(s); return EXPERIENCE_WORDING.test(t) && !(FAMILY_SUBJECT.test(t) && !GENERIC_FAMILY.test(t)); }],
];

/** 行の形で当てる型（見出し・表の「N位」）。採点の順位はここで拾う。 */
const RANK_LINE = new RegExp(`^(?:#{2,4}\\s*(?:第\\s*)?(?:No\\.?\\s*)?\\**${NUM}+\\s*位|\\|\\s*\\**\\s*${NUM}+\\s*位\\**\\s*\\||#{2,4}.*総合ランキング)`);

/** 他の記事の採点の順位を本文で引く形（「幸楽苑は総合1位です」「ランキング6社では6位（24/50点）」）。 */
const RANK_PROSE = new RegExp(`総合\\s*${NUM}+\\s*位|ランキング[^。]{0,60}では\\s*${NUM}+\\s*位|は第\\s*${NUM}+\\s*位）`);

/** 「付けていません」「削除しました」のような否定・撤回の文は開示なので拾わない。 */
const WITHDRAWN =
  /(付けていません|付けていない|つけていません|削除しました|削除し、|外しました|載せていません|載せない方針|無くなった|なくなった|残っていません|ありませんでした|廃止しました|していません|避け、)/;

/** 集計の型は「（個別引用は避け、傾向のみ）」と続くことが多いので、「避け、」を撤回の語に数えない。 */
const WITHDRAWN_STRICT = new RegExp(WITHDRAWN.source.replace('|避け、', ''));
/** 文の単位の撤回の判定を自分で持つ型（共通の WITHDRAWN では落とさない）。 */
const OWN_WITHDRAWN_CHECK = new Set(['aggregate']);

/** HTML のコメント（<!-- … -->）は読者に見えないので、行の数を変えずに中身だけ消す。 */
const blankHtmlComments = (raw) => raw.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ''));

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

/* ------------------------------------------------------------------ *
 * 3. 実訪問の記録との結びつき
 *
 * 2026-10-10 の版は「記録のあるスポット名・店舗名が記事のどこかに 1 回出れば、その記事の一人称を
 * すべて検査から外す」だった。2026-10-11 の監査で、体験の節を持つ 50 本がこれで外れ、記録と結びつく
 * のは 10 本だけだった（京都の記事が、さいたまの「鉄道博物館」の記録で外れていた。室内遊び場×エリア
 * の記事は「有明ガーデン」の名前が出るだけで、節は別の家族に同行した話だった）。
 *
 * いまの版は **節の単位**で見る。文のある節が次のどれかのときだけ外す:
 *   - チェーンの店舗確認（lib/chain-reports.ts）: 節の中に店舗名があり、チェーン名が節か題にある
 *   - スポットの訪問（lib/kid-reports.ts）: 節の見出しにスポット名がある、または題と節の両方に
 *     スポット名がある（題がその施設の記事で、節がその施設の話）
 *   - 上の階層の見出しに、店舗名かスポット名がある
 *   - 既知の一覧の records に、記事（と見出し）が根拠つきで書いてある
 * スポット名は、前に漢字・カタカナが続く場合は別の施設として扱う（「京都鉄道博物館」は「鉄道博物館」に当てない）。
 * ------------------------------------------------------------------ */

/** lib/kid-reports.ts・lib/chain-reports.ts の中身（文字列）から、記録の名前を取り出す。 */
export function parseVisitRecords(kidReportsSource = '', chainReportsSource = '') {
  const spots = [];
  // 短すぎる名前（2文字以下）は別の語に紛れるので使わない
  for (const m of kidReportsSource.matchAll(/^ {2}(?:'([^']+)'|([^\s':]+)):\s*\{/gm)) {
    const n = m[1] ?? m[2];
    if (n && n.length >= 3) spots.push(n);
  }
  const chainStores = [];
  for (const m of chainReportsSource.matchAll(/chain:\s*'([^']+)',\s*\n\s*store:\s*'([^']+)'/g)) chainStores.push([m[1], m[2]]);
  return { spots, chainStores };
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const spotRegexCache = new Map();
/** スポット名が「別の施設名の一部」でなく出ているか（前が漢字・カタカナなら別の施設とみなす）。 */
function hasSpotName(text, name) {
  let re = spotRegexCache.get(name);
  if (!re) {
    re = new RegExp(`(?<![\\u4E00-\\u9FFF\\u30A0-\\u30FA\\u30FC々])${esc(name)}`);
    spotRegexCache.set(name, re);
  }
  return re.test(text);
}

function splitSections(text) {
  const lines = text.split('\n');
  /** @type {{ level: number, heading: string, start: number, end: number, parent: number }[]} */
  const sections = [{ level: 0, heading: '', start: 0, end: lines.length, parent: -1 }];
  const stack = [0];
  const owner = new Array(lines.length).fill(0);
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^(#{2,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      while (stack.length > 1 && sections[stack[stack.length - 1]].level >= level) {
        sections[stack.pop()].end = i;
      }
      sections.push({ level, heading: h[2], start: i, end: lines.length, parent: stack[stack.length - 1] });
      stack.push(sections.length - 1);
    }
    owner[i] = stack[stack.length - 1];
  }
  return { lines, sections, owner };
}

/**
 * 1 本の記事（frontmatter つきの md 全文）を検査する。
 *
 * @param {string} raw
 * @param {{ records?: { spots: string[], chainStores: string[][] }, backedSections?: { heading?: string }[] }} [opts]
 *   records        … parseVisitRecords() の返り値（無ければ記録との結びつきは見ない＝全部拾う）
 *   backedSections … 既知の一覧の records のうち、この記事のもの。heading が無ければ記事全体。
 * @returns {{ noindex: boolean, title: string, legacy: { label: string, excerpt: string }[], sectionLeads: Record<string, string>,
 *   findings: { rule: string, label: string, severity: string, group: string, count: number, excerpt: string, sentences: string[] }[] }}
 */
export function scanArticle(raw, opts = {}) {
  const records = opts.records ?? { spots: [], chainStores: [] };
  const backedSections = opts.backedSections ?? [];
  const noindex = /^noindex:\s*true/m.test(raw.slice(0, 1500));
  const title = (raw.slice(0, 1500).match(/^title:\s*(.*)$/m)?.[1] ?? '').replace(/^["']|["']$/g, '');
  const text = blankHtmlComments(stripWithdrawnSections(stripDisclosedFiction(raw)));
  const { lines, sections, owner } = splitSections(text);

  const wholeBacked = backedSections.some((b) => !b.heading);
  const tiedCache = new Map();
  const sectionText = (sec) => lines.slice(sec.start, sec.end).join('\n');
  const headingNamesRecord = (heading) =>
    records.chainStores.some(([, store]) => heading.includes(store)) || records.spots.some((n) => hasSpotName(heading, n));
  const isTied = (idx) => {
    if (wholeBacked) return true;
    if (tiedCache.has(idx)) return tiedCache.get(idx);
    const sec = sections[idx];
    const body = sectionText(sec);
    let tied =
      backedSections.some((b) => b.heading && sec.heading.includes(b.heading)) ||
      records.chainStores.some(([chain, store]) => body.includes(store) && (body.includes(chain) || title.includes(chain))) ||
      records.spots.some((n) => hasSpotName(sec.heading, n) || (hasSpotName(title, n) && hasSpotName(body, n)));
    // 上の階層は見出しだけを見る（兄弟の節に店舗名があるだけでは外さない）
    for (let p = sec.parent; !tied && p > 0; p = sections[p].parent) {
      tied = headingNamesRecord(sections[p].heading) || backedSections.some((b) => b.heading && sections[p].heading.includes(b.heading));
    }
    tiedCache.set(idx, tied);
    return tied;
  };

  /** 体験の節の見出し → 節の書き出し */
  const sectionLeads = {};
  /** @type {Map<string, string[]>} */
  const byRule = new Map();
  const add = (rule, s) => { if (!byRule.has(rule)) byRule.set(rule, []); byRule.get(rule).push(s); };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const recordTied = isTied(owner[i]);
    const isHeading = /^#{2,6}\s/.test(line);
    if (!WITHDRAWN.test(line)) {
      if (RANK_LINE.test(line)) add('rank', line.trim());
      if (isHeading && !recordTied && EXPERIENCE_HEADING.test(line) && !GENERIC_FAMILY.test(line) && !VERIFICATION_HEADING.test(line) && !NOT_EXPERIENCED.test(sectionText(sections[owner[i]]))) {
        add('exp-section', line.trim());
        // 見出しだけでは中身が分からないので、節の書き出しを別に持つ（件数や差分の判定には使わない）
        const lead = lines.slice(i + 1, sections[owner[i]].end).map((l) => l.trim()).find((l) => l && !/^#{2,6}\s/.test(l));
        if (lead) sectionLeads[line.trim()] = lead.slice(0, 110);
      }
    }
    for (const s0 of line.split(/(?<=。)/)) {
      const s = s0.trim();
      if (!s) continue;
      const withdrawn = WITHDRAWN.test(s);
      for (const [rule, test] of SENTENCE_RULES) {
        if (withdrawn && !OWN_WITHDRAWN_CHECK.has(rule)) continue;
        if ((rule === 'first-person' || rule === 'experience-wording') && recordTied) continue;
        if (test(s, { recordTied })) add(rule, s);
      }
      if (!withdrawn && !RANK_LINE.test(s) && RANK_PROSE.test(s)) add('rank', s);
    }
  }
  if (RANKING_TITLE.test(raw.slice(0, 600)) && !RANKING_BASIS.test(text)) add('ranking-title', title);

  const findings = [];
  for (const [rule, meta] of Object.entries(RULE_META)) {
    const list = byRule.get(rule);
    if (!list?.length) continue;
    findings.push({ rule, ...meta, count: list.length, excerpt: list[0].slice(0, 90), sentences: list });
  }
  return { noindex, title, legacy: scanLegacy(raw), findings, sectionLeads };
}

/**
 * 前の版に無かった文だけを返す（管理画面の保存で「この保存で新しく入った書き方」を出すため）。
 * @param {string} prevRaw 前の版（無ければ空文字）
 * @param {string} nextRaw 保存しようとしている版
 * @param {{ records?: { spots: string[], chainStores: string[][] }, backedSections?: { heading?: string }[] }} [opts]
 * @returns {{ rule: string, label: string, severity: string, group: string, sentences: string[] }[]}
 */
export function newFindings(prevRaw, nextRaw, opts = {}) {
  const prev = prevRaw ? scanArticle(prevRaw, opts) : { findings: [], legacy: [] };
  const next = scanArticle(nextRaw, opts);
  const out = [];
  for (const f of next.findings) {
    const before = new Set(prev.findings.find((p) => p.rule === f.rule)?.sentences ?? []);
    const added = f.sentences.filter((s) => !before.has(s));
    if (added.length) out.push({ rule: f.rule, label: f.label, severity: f.severity, group: f.group, sentences: added });
  }
  const beforeLegacy = new Set(prev.legacy.map((h) => h.label));
  for (const h of next.legacy) {
    if (beforeLegacy.has(h.label)) continue;
    out.push({
      rule: `legacy:${h.label}`, label: h.label,
      severity: h.label === OFFICIAL_CLAIM_LABEL ? 'warn' : 'error', group: 'number', sentences: [h.excerpt],
    });
  }
  return out;
}
