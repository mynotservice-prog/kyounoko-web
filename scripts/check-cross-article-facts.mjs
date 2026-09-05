#!/usr/bin/env node
/**
 * 同じ施設について、記事どうしが食い違っていないかを横断チェックする。
 *
 * ── なぜ作ったか ──────────────────────────────────────────────
 * 2026-08-22、`tokyo-station-kodzure-lunch` の大丸東京のベビールームを
 * 「10階・11階」→**9階**に直したあとで、**2026-07-27 に一次情報監査を通した
 * `tokyo-station-babyroom` が、同じ施設について既に9階・75℃と正しく書いていた**
 * ことが分かった。つまり **監査済みの記事と未監査の記事が、同じサイトの中で
 * 同じ施設について食い違ったまま並んでいた**。
 * 直近1週間で実際に出た不良も、型はほぼ同じだった:
 *   - 階が違う（大丸東京9階、アトレ品川3F/4F）
 *   - 料金が違う（熱海の3施設すべて）
 *   - 施設名が古い（アカオハーブ&ローズガーデン→ACAO FOREST ほか）
 * 1本ずつクリックして直していると、監査済みの記事が持っている「正解」を
 * 未監査の記事に伝播させられない。**監査済み記事を正として機械的に突き合わせる**方が
 * 桁違いに速く不良を刈れる、というのがこのスクリプトの賭け。
 *
 * ── 何を保証するか ────────────────────────────────────────────
 * 「**同じ施設**の**同じ観点**について、**一次情報の確認日が入っている記事（＝監査済み）**と
 * 別の記事とで、**数値が食い違っている**」箇所を新たに増やさないこと。
 * 対象にする属性は、実際に誤りが多かった型だけに絞ってある:
 *   floor（階）／ fee（料金）／ hours（営業時間）／ walk（徒歩分）／ oldname（旧施設名の残存）
 *
 * 保証しないもの（＝わざと落とさないもの。誤検知を減らす側に倒す）:
 *   - **観点（aspect）が特定できない数値**。「大丸東京9階」がベビールームの話か
 *     レストラン街の話かを判定できない箇所は最初から見ない。大丸東京は
 *     ベビー休憩室9F・レストラン街12〜13F・食品B1Fが全部正しいので、
 *     観点で分けずに階を突き合わせると全部が「食い違い」になってガードが無視される。
 *   - **範囲が重なる階**（12〜13F と 13階）。集合が交わるなら一致とみなす。
 *   - **徒歩の1分差**。出口の取り方で普通にずれる。2分以上離れたときだけ見る。
 *   - **季節・曜日・時期で変わる営業時間**（「夏季」「土日」「最終入場」等が同じ文にある）。
 *   - **未監査どうしの食い違い**。どちらが正か機械には決められないので WARN 止まり
 *     （`--all` で見える）。exit は落とさない。
 *   - チェーンの一般論（「フードコートは2階が多い」等）。施設名が固有名詞として
 *     語彙に入らないので自然に落ちる。
 *
 * ── 「監査済み」の判定 ────────────────────────────────────────
 * 本文に **一次情報の確認日**（「確認日 2026年7月27日」「…2026年8月22日確認」等）が
 * 書かれていて、その日付が AUDIT_SINCE(2026-07-01) 以降なら監査済みとする。
 * 「この記事から外した施設」節がある記事も監査済み扱い（あれは監査の削除ログ）。
 * front matter の `updatedAt` は採らない。**本文の一括加工でも updatedAt は動く**ので、
 * 一次情報を当たった証拠にならないから。確認日は人が公式を見ないと書けない。
 *
 * ── 既存分の扱い ──────────────────────────────────────────────
 * check-parking-claims.mjs と同じベースライン方式に対応している
 * （`data/cross-article-facts-baseline.json`。`--update-baseline` で焼く）。
 * ただし 2026-08-22 の初回実行では ERROR が3件しかなく、全部その場で直せる量だったので
 * **ベースラインは作っていない**。件数が増えて赤が常態化したときだけ焼くこと。
 * ベースラインは「見逃しの追認」なので、増える方向の更新には理由を書く。
 *
 * ── 出る件数が少ないことについて ──────────────────────────────
 * 記事1109本に対して照合できた主張は155件しかない。これは設計どおりで、
 * **観点が特定できない数値・施設が特定できない数値を全部捨てている**ため。
 * 「同じ施設を2記事以上が数値付きで語っている」場所そのものが少ない、というのが実測。
 * 拾える件数を増やしたいときは FLOOR_ASPECTS / FEE_ASPECTS に観点を足す。
 * 施設語彙を緩める方向（looksLikeFacility）は、一般名詞が混ざって一気に破綻するので避ける。
 *
 * 使い方（TypeScript を読まないので素の node で動く。Node 18+）:
 *   node scripts/check-cross-article-facts.mjs
 *
 *   --all              WARN・ベースライン済みも含めて全件表示
 *   --no-baseline      ベースラインを無視して全 ERROR を出す（棚卸し用）
 *   --update-baseline  現状の ERROR をベースラインに焼き直す（data/ に書き込む）
 *   --slug=xxx         特定記事が絡む食い違いだけ見る（部分一致）
 *   --facility=xxx     特定施設だけ見る（部分一致）
 *   --vocab            抽出した施設語彙を出して終わる（語彙のチューニング用）
 *   --claims           抽出した主張を全部出して終わる（--facility / --slug と併用）
 *   --dir=path         記事ディレクトリを差し替える（検証用。既定 content/articles）
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE_PATH = join(ROOT, 'data/cross-article-facts-baseline.json');

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const ALL = process.argv.includes('--all');
const NO_BASELINE = process.argv.includes('--no-baseline');
const UPDATE_BASELINE = process.argv.includes('--update-baseline');
const SHOW_VOCAB = process.argv.includes('--vocab');
const SHOW_CLAIMS = process.argv.includes('--claims');
const SLUG_FILTER = arg('slug', '');
const FACILITY_FILTER = arg('facility', '');
const DIR_ARG = arg('dir', 'content/articles');
const ARTICLES_DIR = isAbsolute(DIR_ARG) ? DIR_ARG : join(ROOT, DIR_ARG);

/** 一次情報監査を始めた時期。これ以降の確認日だけ「監査済み」とみなす */
const AUDIT_SINCE = '2026-07-01';

// ── 文字の正規化 ──────────────────────────────────────────────

const toHalf = (s) =>
  s.replace(/[０-９Ａ-Ｚａ-ｚ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));

/** 装飾・リンク・全角英数を落として素の文にする */
const plain = (s) =>
  toHalf(
    s
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // [text](url)
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/\*\*|__|`|~~/g, ''),
  );

/** 施設名の表記ゆれを吸収したキー */
const facilityKey = (name) =>
  toHalf(name)
    .replace(/[・･\s'’"”]/g, '')
    .replace(/^(都立|区立|市立|県立|町立|村立|国営|区民|市民)/, '')
    .replace(/(店|本店|支店|本館|新館)$/, '')
    .toLowerCase();

// ── 施設語彙 ────────────────────────────────────────────────
// 固有名詞だけを拾う。ひらがなを含まない連なりを名前の単位とする
// （日本語は助詞がひらがななので、これだけで名前の切り出しがかなり効く）。

const NAME_CHARS = '[一-龥ヶヵ々ァ-ヴーA-Za-z0-9&\'’・]';
const NAME_RE = new RegExp(`${NAME_CHARS}{2,24}`, 'g');

/** 施設らしい語尾。これで終わる固有名詞は語彙に入れる */
const FACILITY_SUFFIX =
  /(公園|動物園|水族館|水族園|美術館|博物館|科学館|図書館|児童館|体育館|会館|ホール|センター|パーク|ランド|ガーデン|タワー|ヒルズ|プラザ|モール|アウトレット|ドーム|スタジアム|牧場|農園|ファーム|遊園地|植物園|温泉|ホテル|リゾート|旅館|城|神社|水遊び場|キャンプ場|ミュージアム|ストリート|マルシェ|テラス|スクエア|シティ|ビル|百貨店|本店)$/;

/** 施設名に化けやすい一般名詞・数量詞。語彙から外す */
const NAME_STOPWORDS = new Set(
  [
    '地下', '各', '同', '本', '当', '上記', '下記', '別', '全', '約', '計', '最上', '最下',
    '屋上', '大人', '小人', '子ども', '子供', '中学生', '小学生', '未就学児', '幼児', '乳児',
    '徒歩', '往復', '片道', '駅前', '駅', '改札', '改札内', '改札外', '館内', '店内', '車',
    '合計', '平日', '土日', '祝日', '週末', '午前', '午後', '以上', '以下', '前後', '目安',
    '税込', '税抜', '1人', '一人', '1回', '1日', '半日', '無料', '有料', '有',
    'B1', 'B2', 'F', '階', '号', '番', '位', '例', '他', '内', '外', '中', '上', '下',
    '入口', '出口', '受付', '売場', '売り場', '売店', '食堂', '客室', '個室', '座席',
    'X', 'Twitter', 'Instagram', 'LINE', 'Google', 'PR',
    // 「◯◯パーク」「◯◯センター」の形だが特定施設を指さない語（実測で語彙に混ざった分）
    'メリーゴーランド', 'ガーランド', 'ブランド', 'サテライト', 'テーマパーク', 'プレイランド',
    'ミニランド', 'キッズパーク', 'キッズプラザ', 'ベビーセンター', 'ベビーガーデン',
    'プレーパーク', 'ホームセンター', 'ショッピングセンター', 'ショッピングモール',
    'ショッピングパーク', 'アウトレット', 'ビジターセンター', 'サービスセンター',
    'インフォメーションセンター', '支援センター', '保健センター', '児童センター',
    '文化センター', '区民センター', '救急安心センター', 'バンケットホール',
    // 2026-09-05: 設備の一般名詞が施設として拾われ、別施設同士の階を「食い違い」と誤検知した分
    'ベビーカー貸出', 'フロアガイド',
    'マーケットホール', 'エントランスプラザ', '到着ロビー', 'キャンプ場', 'デイキャンプ場',
    '交通公園', '児童公園', '大公園', '丘陵公園', '海浜公園', '親水公園', '自然公園',
    '天然温泉', '単純温泉', '客室温泉', 'ロイヤルホテル', '商業ビル', '体験型ミュージアム',
    'テーマランド', 'ウォーターパーク', 'キッズスペース', 'イーストヤード', 'ウエストヤード',
    '都市公園', '隣接公園', '芝生公園', '穴場公園', '無料公園', '観光農園', '子供動物園',
    '都営水族館', '科学博物館', '発達支援センター', '児童発達支援センター',
    '世代包括支援センター', '相談センター', '植物センター', '空港サービスセンター',
    'ファミリーサポートセンター', '米国疾病予防管理センター', 'センターモール', 'ターミナル',
    'メインストリート', '駅前ビル', '駅直結ビル', '駅直結モール', '駅直結ホテル',
    '歓迎ホテル', '沖縄リゾート', 'チェックイン後温泉', '高規格キャンプ場', '恋人パーク',
    'ピンクタワー', '紙コップタワー', '頭恩賜公園', 'レゴシティ',
    // 2026-08-22 追記: 設備の「種類名」は施設名ではない。これを語彙に入れると、
    // 松屋銀座6F・ルミネ大宮5F・ルミネ2の4F のように **別々の建物の階を突き合わせて**
    // 全部が食い違いに見える（実測でERROR 5件が丸ごとこれだった）。
    'ベビー休憩室', 'ベビールーム', '授乳室', '授乳スペース', '休憩室', 'ベビーコーナー',
    'おむつ替えコーナー', 'キッズトイレ', '多目的トイレ', 'だれでもトイレ', 'ベビーチェア',
    'フードコート', 'レストラン街', 'レストランフロア', '飲食フロア', '屋上庭園',
    // 2026-09-01 追記: 施設の「種類名」として素の「レストラン」「カフェ」も拾ってしまい、
    // 別々の建物のレストラン階（ラケタウン1F・アルカキット10F・オリナス4F…）が
    // 全部ひとつの施設の食い違いに見えていた。フードコートと同じ扱いにする。
    'レストラン', 'カフェ', 'フードホール', 'フードコート内',

  ].map(facilityKey),
);

/**
 * 修正記録・削除ログの行。旧い（誤った）値を説明のために引用しているだけなので、
 * 主張として読んではいけない。2026-08-22に実際の誤検知として観測した。
 */
const META_LINE =
  /(直しました|修正しました|訂正しました|削除しました|外しました|置き換えました|書き換えました|に変更しました|でしたが現在|は誤り|は存在しません|確認できませんでした)/;

/** この語尾で終わるものは施設名ではない（「人気ブランド」「東京ターミナル」の類） */
const DENY_SUFFIX = /(ブランド|ターミナル|ヤード|コーナー|エリア|ゾーン|フロア|スペース|ルーム|シリーズ|タイプ|プラン|コース)$/;

/** 「◯◯公園」の◯◯が固有名詞かどうかを見るための一般語 */
const GENERIC_MODIFIER =
  /^(中央|中心|東|西|南|北|新|旧|大|小|各|同|本|当|別|他|児童|区民|市民|区立|市立|都立|県立|町立|国営|国民|地域|地区|文化|支援|保健|家庭|総合|複合|商業|屋内|屋外|屋内型|屋外型|大型|小型|中型|超大型|巨大|大規模|中規模|小規模|有料|無料|人気|定番|主要|有名|老舗|大手|中堅|既存|国内|両|複数|全国|都内|首都圏|関東|近隣|周辺|地元|近所|専用|臨時|常設|通常|多数|各種|体験型|天然|人工|単純|客室|半日|終日|午前|午後|夕方|朝|夜|キッズ|ベビー|ファミリー|プレー|プレイ|ミニ|テーマ|ショッピング|ホーム|ビジター|サービス|インフォメーション|ウォーター|レジャー|アミューズメント)+$/;

/** 正規化のときに落とす冠称（「都立木場公園」と「木場公園」を同じものとして扱う） */
const TITLE_PREFIX = /^(都立|区立|市立|県立|町立|村立|国営|区民|市民)/;

/** 語彙に入れるための最低条件 */
function looksLikeFacility(name) {
  const n = toHalf(name).replace(TITLE_PREFIX, '');
  if (n.length < 3 || n.length > 24) return false;
  if (NAME_STOPWORDS.has(facilityKey(n))) return false;
  if (/[・\s]/.test(n)) return false; // 列挙（「動物園・水族館」）は施設名ではない
  if (/^[0-9ンーｰ]/.test(n)) return false; // 数字始まり・カタカナ途中で切れた断片
  if (/[0-9]$/.test(n)) return false;
  if (/[階円分％%]/.test(n)) return false;
  if (/^[A-Za-z]{1,3}$/.test(n)) return false;
  if (DENY_SUFFIX.test(n)) return false;
  // 「札幌駅直結ホテル」「ファミリー特化大型リゾート」のような説明句
  if (/(直結|特化|併設|対応|向け|限定|専用|付き|以外|以上|近く|周辺)/.test(n)) return false;
  const m = n.match(FACILITY_SUFFIX);
  if (m) {
    // 語尾を外した「固有名詞の部分」が2文字以上あり、かつ一般語だけで出来ていないこと。
    // これで「大型公園」「屋内キッズパーク」「支援センター」が落ち、「上野公園」が残る。
    const stem = n.slice(0, n.length - m[0].length);
    return stem.length >= 2 && !GENERIC_MODIFIER.test(stem);
  }
  // 語尾が無い名前は、カタカナのブランド名か、百貨店・駅ビル系の頭ブランドだけ採る
  if (/^[ァ-ヴー]{3,}[一-龥ヶA-Za-z]*$/.test(n)) return true;
  if (/^(大丸|高島屋|松屋|伊勢丹|三越|そごう|西武|東急|京王|小田急|阪急|近鉄|丸井|丸ビル|新丸ビル)/.test(n))
    return true;
  return false;
}

// ── 観点（aspect）── 数値が「何の」数値かを決める。決められないものは見ない ──

const FLOOR_ASPECTS = [
  ['授乳・おむつ替え', /授乳|ベビー休憩|ベビールーム|ベビー室|おむつ|オムツ|調乳|ナーシング/],
  ['レストラン・飲食', /レストラン|飲食|ダイニング|グルメ|フードコート|食堂街|カフェ/],
  ['キッズ・玩具', /おもちゃ|玩具|キッズ|子供服|子ども服|ベビー用品|遊び場|プレイ/],
  ['食品・デパ地下', /食品|デパ地下|スイーツ|惣菜|お土産|土産/],
  ['駐車場', /駐車場|パーキング/],
];

const FEE_ASPECTS = [
  ['入園・入場・入館料', /入園料|入場料|入館料|入城料|入園|入場|入館|チケット|観覧料/],
  ['利用料', /利用料|使用料|体験料|入浴料|遊具/],
];

const HOURS_ASPECTS = [
  ['営業・開園時間', /営業時間|開園|開館|開店|閉園|閉館|オープン|利用時間/],
];

/** 時間の食い違いは季節・曜日でいくらでも変わる。これらが同じ文にあれば見ない */
const HOURS_EXCLUDE =
  /夏|冬|春|秋|季節|時期|期間|平日|土日|土曜|日曜|祝|年末|年始|GW|ゴールデンウィーク|お盆|変更|短縮|延長|最終|ラストオーダー|L\.?O|受付|プール|ナイト|時短|臨時|の場合|によって|によっては/;

const aspectOf = (table, text) => {
  for (const [label, re] of table) if (re.test(text)) return label;
  return null;
};

// ── 記事の読み込み ────────────────────────────────────────────

function parseArticle(raw) {
  const lines = raw.split('\n');
  let front = '';
  let bodyStart = 0;
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1);
    if (end > 0) {
      front = lines.slice(1, end).join('\n');
      bodyStart = end + 1;
    }
  }
  return { front, body: lines.slice(bodyStart), bodyOffset: bodyStart };
}

const CONFIRM_RE = [
  /確認日[ 　:：]*(20\d{2})年(\d{1,2})月(\d{1,2})日/g,
  /(20\d{2})年(\d{1,2})月(\d{1,2})日(?:時点)?(?:に|で|時点で)?確認/g,
];

/** 本文の一次情報確認日のうち最新のもの。無ければ null */
function auditDateOf(text) {
  let best = null;
  for (const re of CONFIRM_RE) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      const d = `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`;
      if (!best || d > best) best = d;
    }
  }
  return best;
}

const files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'));

const articles = files.map((f) => {
  const raw = readFileSync(join(ARTICLES_DIR, f), 'utf8');
  const { front, body, bodyOffset } = parseArticle(raw);
  const text = plain(raw);
  const audit = auditDateOf(text);
  const hasRemovalLog = /この記事から外した|削除しました|公式に該当する記載/.test(text);
  const updatedAt = (front.match(/updatedAt:\s*'?([\d-]{10})/) || [])[1] || '';
  return {
    slug: f.replace(/\.md$/, ''),
    front,
    body,
    bodyOffset,
    text,
    updatedAt,
    auditDate: audit,
    audited: Boolean(audit && audit >= AUDIT_SINCE) || (hasRemovalLog && updatedAt >= AUDIT_SINCE),
  };
});

// ── 1st pass: 施設語彙をコーパスから作る ──────────────────────
// 「階」「円」の直前に来た固有名詞と、施設語尾を持つ固有名詞を候補にし、
// **2記事以上に出てくるものだけ**を語彙に採る。1記事にしか無い名前は
// 突き合わせようがないうえ、抽出ミスが混ざりやすい。

const vocabCount = new Map(); // key -> {name, slugs:Set, forms:Set}
const addVocab = (name, slug) => {
  if (!looksLikeFacility(name)) return;
  const k = facilityKey(name);
  const disp = toHalf(name).replace(TITLE_PREFIX, '');
  if (!vocabCount.has(k)) vocabCount.set(k, { name: disp, slugs: new Set(), forms: new Set() });
  const v = vocabCount.get(k);
  v.slugs.add(slug);
  // 表記ゆれ（「大丸東京店」と「大丸東京」）は両方とも本文照合の対象にする。
  // 代表名だけで探すと、店を付けない書き方の記事を丸ごと取りこぼす。
  v.forms.add(disp);
  if (disp.length > v.name.length) v.name = disp; // 代表名は長い方（曖昧さが少ない）
};

// 名前側は数字を含めない。「サンシャインシティ60階」で「…6」まで飲み込むのを防ぐ
const FLOOR_ANCHOR = /([一-龥ヶヵ々ァ-ヴーA-Za-z&'’]{2,24})(?:の)?\s*(?:B)?[0-9]{1,2}\s*(?:階|F)/g;

for (const a of articles) {
  for (const line of a.text.split('\n')) {
    let m;
    FLOOR_ANCHOR.lastIndex = 0;
    while ((m = FLOOR_ANCHOR.exec(line))) addVocab(m[1], a.slug);
    NAME_RE.lastIndex = 0;
    while ((m = NAME_RE.exec(line))) if (FACILITY_SUFFIX.test(m[0])) addVocab(m[0], a.slug);
  }
}

const VOCAB = new Map(); // key -> 代表名
const VOCAB_FORMS = []; // 本文照合に使う表記ゆれ全部
for (const [k, v] of vocabCount) {
  if (v.slugs.size < 2) continue;
  VOCAB.set(k, v.name);
  for (const f of v.forms) VOCAB_FORMS.push(f);
}

// 長い名前から先にマッチさせる（「大丸東京店」を「大丸東京」より先に取る）
const VOCAB_NAMES = [...new Set(VOCAB_FORMS)].sort((a, b) => b.length - a.length);
const VOCAB_RE = VOCAB_NAMES.length
  ? new RegExp(VOCAB_NAMES.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g')
  : /$^/;

if (SHOW_VOCAB) {
  console.log(`施設語彙 ${VOCAB.size}件（2記事以上に出現）／表記ゆれ込み ${VOCAB_NAMES.length}形\n`);
  for (const n of [...VOCAB.values()].sort()) console.log('  ' + n);
  process.exit(0);
}

// ── 2nd pass: 主張の抽出 ──────────────────────────────────────

/** 「B1」「12〜13F」を階の集合にする。判定できないものは null */
function floorSet(raw) {
  const s = toHalf(raw);
  const m = s.match(/^(B?)(\d{1,2})(?:\s*[〜~ー\-–—]\s*(B?)(\d{1,2}))?$/);
  if (!m) return null;
  const a = (m[1] ? -1 : 1) * Number(m[2]);
  const b = m[4] ? (m[3] ? -1 : 1) * Number(m[4]) : a;
  if (Math.abs(a) > 60 || Math.abs(b) > 60) return null;
  const set = new Set();
  for (let i = Math.min(a, b); i <= Math.max(a, b); i++) if (i !== 0) set.add(i);
  return set.size ? set : null;
}

const fmtFloor = (set) =>
  [...set]
    .sort((x, y) => x - y)
    .map((n) => (n < 0 ? `B${-n}` : `${n}F`))
    .join('/');

/** 行を「1つの主張」の単位に割る。表のセルと句点で切る */
const segmentsOf = (line) =>
  line
    .split(/[。｜|]/)
    .map((s) => s.trim())
    .filter(Boolean);

/** セグメント内の施設名。行に1施設しか出てこない場合は行全体をスコープにする */
function facilitiesIn(text) {
  VOCAB_RE.lastIndex = 0;
  const found = new Map();
  let m;
  while ((m = VOCAB_RE.exec(text))) {
    // 「葛西臨海公園駅」は駅の名前であって施設への言及ではない。
    // これを施設として拾うと、水族園の記事のアクセス表記が公園の主張に化ける。
    const after = text.slice(m.index + m[0].length);
    if (/^(駅|通り|街道|線|区|市|町|方面)/.test(after)) continue;
    // 「滝野川公園」の中の「野川公園」のような部分一致を切る。
    // 冠称（都立・区立…）だけは名前の一部として許す。
    const before = text.slice(Math.max(0, m.index - 2), m.index);
    if (
      /[一-龥ヶヵ々ァ-ヴーA-Za-z0-9]$/.test(before) &&
      !/(都立|区立|市立|県立|町立|村立|国営|区民|市民)$/.test(before)
    )
      continue;
    const k = facilityKey(m[0]);
    if (!found.has(k)) found.set(k, VOCAB.get(k) || m[0]);
  }
  return found;
}

const claims = []; // {facility, key, type, aspect, value, display, slug, line, audited, auditDate}

function pushClaim(a, lineNo, facilityK, type, aspect, value, display, raw) {
  claims.push({
    key: `${facilityK}${type}${aspect}`,
    facility: VOCAB.get(facilityK) || facilityK,
    type,
    aspect,
    value,
    display,
    raw: raw.slice(0, 110),
    slug: a.slug,
    line: lineNo,
    audited: a.audited,
    auditDate: a.auditDate,
  });
}

const FLOOR_RE = /((?:B\s*)?\d{1,2}(?:\s*[〜~ー\-–—]\s*(?:B\s*)?\d{1,2})?)\s*(?:階|F(?![a-z]))/g;
const FEE_PAIR_RE =
  /(大人|一般|中学生以上|高校生|中学生|小学生|子ども|子供|小人|幼児|未就学児|[0-9]歳以上)[^。、]{0,10}?(\d{1,3}(?:,\d{3})*|\d+)\s*円/g;
const HOURS_RE = /(\d{1,2}):(\d{2})\s*[〜~ー\-–—]\s*(\d{1,2}):(\d{2})/g;
// 「最寄駅：JR立川駅 徒歩15分」で「最寄」を拾わないよう、駅と徒歩の間に別の駅を挟ませない
const WALK_RE = /([一-龥ヶァ-ヴーA-Za-z0-9]{2,12})駅[^。駅]{0,8}?徒歩\s*(?:約)?\s*(\d{1,2})\s*分/g;

/**
 * 「- 入園料：大人1,200円／小中学生650円」のようなスペック行は、
 * 施設名が同じ行になく直前の見出しにある。見出しに施設がちょうど1つだけ
 * 書かれている場合に限り、その施設の主張として扱う（複数なら諦める）。
 */
const SPEC_BULLET =
  /^[-*・]?\s*\**\s*(入園料|入場料|入館料|入城料|入浴料|利用料|料金|営業時間|開園時間|開館時間|開園|開館|アクセス|最寄|所在地)/;

for (const a of articles) {
  let headingFk = null;
  a.body.forEach((rawLine, i) => {
    const lineNo = a.bodyOffset + i + 1;
    const line = plain(rawLine);
    if (/^#{2,6}\s/.test(rawLine)) {
      const hf = facilitiesIn(line);
      headingFk = hf.size === 1 ? [...hf.keys()][0] : null;
    }
    if (/^\s*>/.test(rawLine)) return; // 出典の引用行は主張ではない
    // 2026-08-22 追記: 修正記録の行は「直す前の誤った値」を引用しているので主張ではない。
    // これを読むと、直した本人の記録が原因で同じ記事が自分と食い違うことになる（実測で発生）。
    if (META_LINE.test(line)) return;
    const lineFacilities = facilitiesIn(line);
    const specFk = SPEC_BULLET.test(line) ? headingFk : null;
    if (!lineFacilities.size && !specFk) return;

    for (const seg of segmentsOf(line)) {
      const segFacilities = facilitiesIn(seg);
      // 施設の決め方: セグメント内に1施設 → それ。0施設でも行に1施設だけなら行の施設。
      // それ以外（複数施設が混在）は誰の数値か決められないので見ない。
      let fk = null;
      if (segFacilities.size === 1) fk = [...segFacilities.keys()][0];
      else if (segFacilities.size === 0 && lineFacilities.size === 1) fk = [...lineFacilities.keys()][0];
      else if (segFacilities.size === 0 && lineFacilities.size === 0) fk = specFk;
      if (!fk) continue;
      // 料金・営業時間は1行に複数施設を並べる書き方（比較表・まとめ行）が多く、
      // 行フォールバックで拾うと別施設の数値が混ざる。同じ文にある施設だけを見る。
      //
      // 2026-08-22 追記: **階も同じだった**。「A＝13階、B＝4階、C＝5階」と施設ごとに階を
      // 並べる書き方や、見出しがAの節でB・Cの階に触れる書き方で、B・Cの階がAの主張として
      // 記録されていた（実測でERROR 3件が全部これ）。階も strictFk を使う。
      // さらに、1行に2施設以上あるときは見出しフォールバック（specFk）も使わない。
      const multiFacilityLine = lineFacilities.size >= 2;
      const strictFk = segFacilities.size === 1 ? fk : multiFacilityLine ? null : specFk;

      let m;
      // floor
      const fAspect = aspectOf(FLOOR_ASPECTS, seg);
      if (fAspect && strictFk) {
        FLOOR_RE.lastIndex = 0;
        const sets = [];
        while ((m = FLOOR_RE.exec(seg))) {
          const set = floorSet(m[1]);
          if (set) sets.push(set);
        }
        // 1つの文に複数の階が並ぶのは列挙（「1Fレストラン街、3Fフードコート」）。
        // どれがどの観点の階かは決められないので、まるごと見ない。
        if (sets.length === 1) pushClaim(a, lineNo, strictFk, 'floor', fAspect, sets[0], fmtFloor(sets[0]), seg);
      }
      // fee
      const feeAspect = aspectOf(FEE_ASPECTS, seg);
      if (strictFk && feeAspect && !/目安|程度|くらい|ぐらい|前後|予算|平均|以上|以下|割引|クーポン|寄付|募金|セット|ランチ|食べ|ドリンク/.test(seg)) {
        // 「大人600円・小学生200円」のように列挙されていても、対象語とセットなら分けられる。
        // 対象語が付いていない裸の金額は、誰の何の料金か決められないので見ない。
        FEE_PAIR_RE.lastIndex = 0;
        const pairs = new Map();
        while ((m = FEE_PAIR_RE.exec(seg))) {
          const target = /大人|一般|中学生以上|高校生/.test(m[1]) ? '大人' : '子ども';
          const yen = Number(m[2].replace(/,/g, ''));
          if (yen > 0 && !pairs.has(target)) pairs.set(target, yen);
        }
        for (const [target, yen] of pairs)
          pushClaim(a, lineNo, strictFk, 'fee', `${feeAspect}／${target}`, yen, `${yen.toLocaleString()}円`, seg);
      }
      // hours
      const hAspect = aspectOf(HOURS_ASPECTS, seg);
      if (strictFk && hAspect && !HOURS_EXCLUDE.test(seg)) {
        HOURS_RE.lastIndex = 0;
        const hs = [];
        while ((m = HOURS_RE.exec(seg)))
          hs.push(`${String(+m[1]).padStart(2, '0')}:${m[2]}-${String(+m[3]).padStart(2, '0')}:${m[4]}`);
        if (hs.length === 1) pushClaim(a, lineNo, strictFk, 'hours', hAspect, hs[0], hs[0], seg);
      }
      // walk
      WALK_RE.lastIndex = 0;
      while ((m = WALK_RE.exec(seg))) {
        // 「JR京葉線◯◯駅」「東西線◯◯駅」の路線名だけを落として駅名にする。
        // 私鉄の社名（京成上野・東武浅草）は**落とさない**。JR上野駅と京成上野駅は
        // 別の駅で徒歩分数も違うのに、落とすと同じ駅に潰れて偽の食い違いになる。
        const station = toHalf(m[1])
          .replace(/^.*線/, '')
          .replace(/^(JR東日本|JR西日本|JR東海|JR|東京メトロ|メトロ|都営地下鉄|都営|地下鉄|各線)/, '');
        if (station.length < 2 || NAME_STOPWORDS.has(facilityKey(station))) continue;
        pushClaim(a, lineNo, fk, 'walk', `${station}駅から徒歩`, Number(m[2]), `徒歩${m[2]}分`, seg);
      }
    }
  });
}

if (SHOW_CLAIMS) {
  const list = claims
    .filter((c) => !SLUG_FILTER || c.slug.includes(SLUG_FILTER))
    .filter((c) => !FACILITY_FILTER || c.facility.includes(FACILITY_FILTER))
    .sort((a, b) => (a.key + a.slug).localeCompare(b.key + b.slug));
  console.log(`抽出した主張 ${list.length}件（全 ${claims.length}件中）\n`);
  for (const c of list)
    console.log(
      `  ${c.facility} / ${c.type} / ${c.aspect} = ${c.display}` +
        `  ← ${c.slug}:${c.line}${c.audited ? `（確認日 ${c.auditDate}）` : '（未監査）'}`,
    );
  process.exit(0);
}

// ── 3rd pass: 突き合わせ ──────────────────────────────────────

/** 値が両立しうるか。両立するなら食い違いではない */
function compatible(type, a, b) {
  if (type === 'floor') return [...a].some((x) => b.has(x));
  if (type === 'walk') return Math.abs(a - b) <= 1; // 出口の取り方で1分はずれる
  return a === b;
}

const groups = new Map();
for (const c of claims) {
  if (!groups.has(c.key)) groups.set(c.key, []);
  groups.get(c.key).push(c);
}

/**
 * 食い違いは「値の組」ではなく「施設×観点」単位で1件にまとめて出す。
 * ペアで出すと3値あるだけで3件に膨らみ、直す側が同じ場所を何度も見ることになる。
 * どれが正かは **多数決 → 監査済みの支持数 → 確認日の新しさ** で決める。
 * 「新しい確認日が正」だけにすると、監査済み記事の中に1箇所だけ残った古い記述
 * （体験談ブロックなど）が正に化ける。実際 tokyo-station-kodzure-lunch の
 * 「10階のベビールーム」がそれで、多数決を入れないと 9階 が誤りに見える。
 */
/**
 * 「階」の食い違いを見ない施設×観点。
 *
 * 2026-09-01 追加。百貨店・専門店街は**同じ観点の設備が複数階に正当に散らばる**。
 * 例: サンシャインシティの専門店街アルパは飲食がB1・1F・2F・3Fの4フロアにあり、
 * 「アルパ3階が中心（30店）」と「アルパ1F のタリーズ」を書くと食い違いに見えてしまう。
 * 三越・高島屋は本館/新館という館名が鍵に入るので衝突しないが、館名を持たない
 * 専門店街ではこれが起きる。
 *
 * ⚠️ ここに足してよいのは「1つの建物の中で、その観点が複数階にあるのが事実」の場合だけ。
 * 別々の建物が同じ鍵に名寄せされているなら、**記事側で施設名を区別するのが正しい対処**
 * （アトレ本館・イトーヨーカドー・マルイで実際にそうした）。安易に足さないこと。
 */
const MULTI_FLOOR_OK = new Set(
  [
    ['アルパ', 'レストラン・飲食'],
    ['サンシャインシティ', 'レストラン・飲食'],
  ].map(([f, a]) => `${facilityKey(f)}\t${a}`),
);

const findings = [];
for (const [, list] of groups) {
  const buckets = [];
  for (const c of list) {
    let b = buckets.find((x) => compatible(c.type, x.value, c.value));
    if (!b) {
      b = { value: c.value, display: c.display, claims: [] };
      buckets.push(b);
    }
    b.claims.push(c);
  }
  if (buckets.length < 2) continue;
  // 複数階に正当に散らばる施設×観点は「階」の食い違いを見ない（MULTI_FLOOR_OK 参照）
  if (
    list[0].type === 'floor' &&
    MULTI_FLOOR_OK.has(`${facilityKey(list[0].facility)}\t${list[0].aspect}`)
  ) {
    continue;
  }

  for (const b of buckets) {
    b.auditedCount = b.claims.filter((c) => c.audited).length;
    b.newestAudit = b.claims.reduce((d, c) => (c.auditDate && c.auditDate > d ? c.auditDate : d), '');
  }
  buckets.sort(
    (a, b) =>
      b.auditedCount - a.auditedCount ||
      b.claims.length - a.claims.length ||
      (b.newestAudit || '').localeCompare(a.newestAudit || ''),
  );
  const head = list[0];
  findings.push({
    type: head.type,
    facility: head.facility,
    aspect: head.aspect,
    buckets,
    severity: buckets[0].auditedCount > 0 ? 'error' : 'warn',
    slugs: [...new Set(list.map((c) => c.slug))],
  });
}

// ── 旧施設名の残存チェック ────────────────────────────────────
// 「新名称（旧 旧名称）」と書いている記事があるなら、旧名称だけで書いている記事は古い。

const RENAME_RE = /([一-龥ヶァ-ヴーA-Za-z0-9&\s'’]{3,24})[（(]旧[・\s]*[「『]?([^）)」』]{4,24})[」』]?[）)]/g;
const renames = new Map(); // oldName -> {newName, slug, audited}
for (const a of articles) {
  RENAME_RE.lastIndex = 0;
  let m;
  while ((m = RENAME_RE.exec(a.text))) {
    const newName = m[1].trim().replace(/^[^一-龥ヶァ-ヴーA-Za-z0-9]+/, '');
    const oldName = m[2].trim();
    if (oldName.length < 4 || newName.length < 3) continue;
    if (/Twitter|WALLET|カード|ベース|別売/.test(oldName)) continue; // 「X（旧Twitter）」の類
    if (!renames.has(oldName)) renames.set(oldName, { newName, slug: a.slug, audited: a.audited });
  }
}

for (const [oldName, info] of renames) {
  const stale = articles.filter(
    (a) => a.slug !== info.slug && a.text.includes(oldName) && !a.text.includes(info.newName),
  );
  if (!stale.length) continue;
  findings.push({
    type: 'oldname',
    facility: info.newName,
    aspect: '施設名',
    severity: info.audited ? 'error' : 'warn',
    slugs: [info.slug, ...stale.map((a) => a.slug)],
    buckets: [
      {
        display: `${info.newName}（現名称）`,
        auditedCount: info.audited ? 1 : 0,
        claims: [{ slug: info.slug, line: 0, audited: info.audited, auditDate: null, raw: '' }],
      },
      {
        display: `${oldName}（旧名称のまま）`,
        auditedCount: 0,
        claims: stale.map((a) => ({
          slug: a.slug,
          line: a.body.findIndex((l) => plain(l).includes(oldName)) + 1 + a.bodyOffset,
          audited: a.audited,
          auditDate: a.auditDate,
          raw: '',
        })),
      },
    ],
  });
}

// ── 出力 ────────────────────────────────────────────────────

const idOf = (f) =>
  `${f.type}\t${f.facility}\t${f.aspect}\t${f.buckets.map((b) => b.display).sort().join(' vs ')}`;

let filtered = findings;
if (SLUG_FILTER) filtered = filtered.filter((f) => f.slugs.some((s) => s.includes(SLUG_FILTER)));
if (FACILITY_FILTER) filtered = filtered.filter((f) => f.facility.includes(FACILITY_FILTER));

const errors = filtered.filter((f) => f.severity === 'error');
const warns = filtered.filter((f) => f.severity === 'warn');

let baseline = [];
if (!NO_BASELINE && existsSync(BASELINE_PATH)) baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')).entries ?? [];
const baseSet = new Set(baseline);
const fresh = errors.filter((f) => !baseSet.has(idOf(f)));
const known = errors.filter((f) => baseSet.has(idOf(f)));

if (UPDATE_BASELINE) {
  const entries = [...new Set(errors.map(idOf))].sort();
  writeFileSync(
    BASELINE_PATH,
    JSON.stringify(
      {
        note:
          '監査済み記事と食い違っている既知の未処置分。scripts/check-cross-article-facts.mjs が' +
          'これを除いた新規混入だけを落とす。記事を直したら --update-baseline で減らす。',
        updatedAt: new Date().toISOString().slice(0, 10),
        entries,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`ベースラインを更新: ${entries.length}件 → ${BASELINE_PATH.replace(ROOT + '/', '')}`);
  process.exit(0);
}

const auditedCount = articles.filter((a) => a.audited).length;
console.log(
  `記事 ${articles.length}本（うち監査済み ${auditedCount}本）／施設語彙 ${VOCAB.size}件／照合した主張 ${claims.length}件\n` +
    `ERROR ${errors.length}件（新規 ${fresh.length} / 既知 ${known.length}）　WARN ${warns.length}件（監査済みの裏付けなし）\n`,
);

const TYPE_LABEL = { floor: '階', fee: '料金', hours: '営業時間', walk: '徒歩', oldname: '旧施設名' };

const where = (c) =>
  `${c.slug}${c.line ? ':' + c.line : ''}${c.auditDate ? `（確認日 ${c.auditDate}）` : '（未監査）'}`;

const show = (list, label) => {
  if (!list.length) return;
  console.log(`── ${label} ${list.length}件 ──`);
  for (const f of list) {
    const oneArticle = new Set(f.slugs).size === 1 ? '（同一記事内）' : '';
    console.log(`  [${TYPE_LABEL[f.type]}] ${f.facility} / ${f.aspect}${oneArticle}`);
    f.buckets.forEach((b, i) => {
      const mark = i === 0 ? '正?' : '要確認';
      console.log(`    ${mark} ${b.display}  支持${b.claims.length}件`);
      for (const c of b.claims.slice(0, 6)) {
        console.log(`      ${where(c)}`);
        if (i > 0 && c.raw) console.log(`        ${c.raw}`);
      }
      if (b.claims.length > 6) console.log(`      …ほか${b.claims.length - 6}件`);
    });
  }
  console.log('');
};

show(fresh, '❌ 新規（監査済み記事と食い違い）');
if (ALL) {
  show(known, '既知（ベースライン済み・要処置）');
  show(warns, '⚠️ 監査済みの裏付けがない食い違い（どちらが正か不明・exitは落とさない）');
}

if (fresh.length) {
  console.error(
    `❌ 監査済み記事と食い違う記述が ${fresh.length}件、新規に入りました。\n` +
      '   「正?」は多数決と監査済みの支持で選んだ候補にすぎません。公式で確認してから揃えてください。',
  );
  process.exit(1);
}
console.log('✅ 新規混入なし');
