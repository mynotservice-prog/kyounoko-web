/**
 * レストラン（category: 'restaurant'）の子連れ設備を「出典があるものだけ」表示するための台帳と判定（2026-10-27 社長指示）。
 *
 * 方針:
 * - 個別店・チェーンは、**公式情報で確認できた設備だけ**を表示する。設備ごとに出典（AmenityEvidence）を持たせ、
 *   出典の無い設備は表示しない。**データの値（spot.kidsMenu 等）は消さない**。表示だけを絞る。
 * - 商業施設（駅ビル・百貨店・SC・地下街・飲食店の集まり）は、**一部テナントの設備を施設全体の設備として出さない**。
 *   出すのは館の共用設備（授乳室・おむつ替え・多目的トイレ・キッズスペース・ベビーカー貸出）で、出典があるものだけ。
 *   テナント単位の設備（キッズメニュー・ベビーチェア・離乳食・ベビーカー入店・個室・座敷）は、出典があっても出さない。
 * - restaurant 以外のカテゴリには一切作用しない（gateRestaurantAmenities は同じオブジェクトを返す）。
 *
 * 出典として認めるもの（AmenityEvidence.kind）:
 * - 'official-site' : 店・運営会社の公式サイト（url 必須）
 * - 'official-sns'  : 店・運営会社の公式SNS（url 必須）
 * - 'owner-reply'   : 店（運営者本人）からの直接の回答、または店が掲載文を確認して修正なしと答えた記録（ref 必須）。
 *                     公開URLは無いが、公式サイトと同じく「その店自身が出した情報」なので公式情報に含める。
 * - 'official-registry' : lib/spot-facilities.ts（公式サイト・自治体公式で裏取りした設備の台帳）から入った館の設備。
 *                     spots.ts のマージ時に自動で付く。URLは台帳に無い（確認日は SPOT_VERIFICATION）。
 * 認めないもの: 口コミサイト、予約サイトの一般ページ・特集・検索結果、まとめ記事。
 * 予約サービス上の店舗【公式】ページ（ホットペッパーの店舗ページ等）は、店が入力していても予約サービスの書式で
 * 「あり／なし」が粗く、更新もれが多いので、設備の出典には使わない（予約導線としては使える）。
 */
import type { Spot } from './spots';

export type RestaurantVenueType = 'shop' | 'chain' | 'complex';

/** Spot 直下のレストラン向けフラグ（テナント単位の設備） */
export const RESTAURANT_FLAG_KEYS = ['kidsMenu', 'babyChair', 'babyFood', 'strollerAccess', 'privateRoom', 'zashiki'] as const;
export type RestaurantFlagKey = (typeof RESTAURANT_FLAG_KEYS)[number];

/** facilities の設備（館・店の設備） */
export const FACILITY_KEYS = ['bathroom', 'diaperChange', 'nursingRoom', 'kidsSpace', 'strollerRental'] as const;
export type FacilityKey = (typeof FACILITY_KEYS)[number];

export type AmenityKey = RestaurantFlagKey | FacilityKey;

export type AmenityEvidence = {
  kind: 'official-site' | 'official-sns' | 'owner-reply' | 'official-registry';
  /** 公式サイト・公式SNSのURL（official-site / official-sns で必須） */
  url?: string;
  /** 記録の場所（owner-reply / official-registry で必須。例: 'tieup-ledger.md 2026-10-06 eatoco 12:25 の返信'） */
  ref?: string;
  /** 確認した日（YYYY-MM-DD） */
  checkedAt?: string;
  /** 出典の該当箇所（短く） */
  quote?: string;
  /** 設備グリッドの表示文言を「あり」「OK」から差し替える（条件つきのとき。例: '席に余裕があれば可'） */
  displayText?: string;
};

export type AmenityEvidenceMap = Partial<Record<AmenityKey, AmenityEvidence>>;

/** 出典として有効か（kind ごとの必須項目がそろっているか） */
export function isValidEvidence(e: AmenityEvidence | undefined): e is AmenityEvidence {
  if (!e) return false;
  if (e.kind === 'official-site' || e.kind === 'official-sns') return !!e.url && /^https?:\/\//.test(e.url);
  if (e.kind === 'owner-reply' || e.kind === 'official-registry') return !!e.ref;
  return false;
}

/**
 * restaurant 116件の分類（spot.name 完全一致）。判別の根拠つき。
 * - shop: その店（1店舗・1施設）のページ
 * - chain: 複数店舗をまとめた1ページ（チェーン総称）
 * - complex: 商業施設・駅ビル・百貨店・地下街・エリアの飲食店の集まり（テナントの集合）
 * 既存の型には判別できる項目が無かった（ward='複数' はチェーンの一部しか拾えず、商業施設は name でしか分からない）ため明示する。
 * ここに無い restaurant は 'shop' 扱い（＝出典があるものだけ出る。商業施設の除外は効かないので、新規追加時はここに足す）。
 */
export const RESTAURANT_VENUE: Record<string, { type: RestaurantVenueType; basis: string }> = {
  // ---- 個別店（14） ----
  '子育てカフェeatoco（イイトコ）': { type: 'shop', basis: '足立区関原の1店舗（無料掲載・公式 eatoco.com）' },
  'ひよこのカフェハウス': { type: 'shop', basis: '足立区東和の1店舗（無料掲載）' },
  '絵本カフェぷあぷ': { type: 'shop', basis: '向河原（COYAMA併設）の1店舗（無料掲載）' },
  '東京ステーションホテル ロビーラウンジ': { type: 'shop', basis: 'ホテル内の1店舗' },
  'コストコ 多摩境倉庫 フードコート': { type: 'shop', basis: 'コストコ直営の1倉庫店のフードコート' },
  'ロイズチョコレートワールド': { type: 'shop', basis: '新千歳空港内の1施設（ロイズ直営）' },
  '元祖長浜屋': { type: 'shop', basis: '福岡市長浜の1店舗' },
  'ひょうたん寿司': { type: 'shop', basis: '福岡市天神の1店舗（ホットペッパー店舗ページ strJ000805352 と住所一致）' },
  'JRタワー T38 展望レストラン': { type: 'shop', basis: 'JRタワー38階の展望室（1施設）' },
  'IKEA 立川 レストラン': { type: 'shop', basis: 'IKEA直営・立川店のレストラン' },
  'IKEA 港北 レストラン': { type: 'shop', basis: 'IKEA直営・港北店のレストラン' },
  'IKEA 鶴浜 レストラン': { type: 'shop', basis: 'IKEA直営・鶴浜店のレストラン' },
  'IKEA 長久手 レストラン': { type: 'shop', basis: 'IKEA直営・長久手店のレストラン' },
  'IKEA 神戸 レストラン': { type: 'shop', basis: 'IKEA直営・神戸店のレストラン' },
  // ---- チェーン総称（48。うち ward='複数' の36件は記事へ301＝lib/chain-spot-redirects.ts） ----
  'IKEA レストラン（新三郷・立川・原宿等）': { type: 'chain', basis: '複数店舗をまとめた総称（ward=複数）' },
  'ココス': { type: 'chain', basis: 'ファミレスチェーン（ward=複数）' },
  'ガスト': { type: 'chain', basis: 'ファミレスチェーン（ward=複数）' },
  'サイゼリヤ': { type: 'chain', basis: 'ファミレスチェーン（ward=複数）' },
  'くら寿司': { type: 'chain', basis: '回転寿司チェーン（ward=複数）' },
  'スシロー': { type: 'chain', basis: '回転寿司チェーン（ward=複数）' },
  'ジョナサン': { type: 'chain', basis: 'ファミレスチェーン（ward=複数）' },
  '上島珈琲店・キッズ向けカフェ': { type: 'chain', basis: 'カフェチェーン（ward=複数）' },
  'ビバパエリア／スペインバル（中野・吉祥寺）': { type: 'chain', basis: '複数の地名を並べた総称で、1店を特定できない（ホットペッパー0件・実在の確認が必要）' },
  'デニーズ': { type: 'chain', basis: 'ファミレスチェーン（ward=複数）' },
  'バーミヤン': { type: 'chain', basis: 'ファミレスチェーン（ward=複数）' },
  'ビッグボーイ': { type: 'chain', basis: 'ファミレスチェーン（ward=複数）' },
  'フォルクス': { type: 'chain', basis: 'ステーキチェーン（ward=複数）' },
  'ロイヤルホスト': { type: 'chain', basis: 'ファミレスチェーン（ward=複数）' },
  '和食さと': { type: 'chain', basis: '和食チェーン（ward=複数）' },
  '華屋与兵衛': { type: 'chain', basis: '和食チェーン（ward=複数）' },
  'ステーキガスト': { type: 'chain', basis: 'ファミレスチェーン（ward=複数）' },
  'びっくりドンキー': { type: 'chain', basis: 'ハンバーグチェーン（ward=複数）' },
  'カプリチョーザ': { type: 'chain', basis: 'イタリアンチェーン（ward=複数）' },
  'マクドナルド': { type: 'chain', basis: 'ファストフードチェーン（ward=複数）' },
  'モスバーガー': { type: 'chain', basis: 'ファストフードチェーン（ward=複数）' },
  'ケンタッキーフライドチキン': { type: 'chain', basis: 'ファストフードチェーン（ward=複数）' },
  'フレッシュネスバーガー': { type: 'chain', basis: 'ファストフードチェーン（ward=複数）' },
  'リンガーハット': { type: 'chain', basis: '麺チェーン（ward=複数）' },
  '丸亀製麺': { type: 'chain', basis: 'うどんチェーン（ward=複数）' },
  'なか卯': { type: 'chain', basis: '丼チェーン（ward=複数）' },
  '松屋': { type: 'chain', basis: '牛丼チェーン（ward=複数）' },
  'すき家': { type: 'chain', basis: '牛丼チェーン（ward=複数）' },
  '吉野家': { type: 'chain', basis: '牛丼チェーン（ward=複数）' },
  '築地銀だこ': { type: 'chain', basis: 'たこ焼きチェーン（ward=複数）' },
  'ミスタードーナツ': { type: 'chain', basis: 'ドーナツチェーン（ward=複数）' },
  '焼肉きんぐ': { type: 'chain', basis: '焼肉チェーン（ward=複数）' },
  'しゃぶ葉': { type: 'chain', basis: 'しゃぶしゃぶチェーン（ward=複数）' },
  'かっぱ寿司': { type: 'chain', basis: '回転寿司チェーン（ward=複数）' },
  'はま寿司': { type: 'chain', basis: '回転寿司チェーン（ward=複数）' },
  'コメダ珈琲店': { type: 'chain', basis: 'カフェチェーン（ward=複数）' },
  'タリーズコーヒー（Tully\'s）キッズメニュー対応店': { type: 'chain', basis: 'カフェチェーン（ward=複数）' },
  '551蓬莱': { type: 'chain', basis: '関西の多店舗チェーン（「大阪市ほか関西」）' },
  'お好み焼き 鶴橋風月': { type: 'chain', basis: '多店舗チェーン（「鶴橋ほか関西」）' },
  '祇園辻利／都路里': { type: 'chain', basis: 'ブランド名の総称（京都・東京ほかに複数店舗）' },
  '志津香': { type: 'chain', basis: '奈良市内に複数店舗（公園店・大宮店）のブランド名' },
  'すみれ（札幌ラーメン）': { type: 'chain', basis: '札幌ほかに複数店舗のブランド名' },
  '松尾ジンギスカン': { type: 'chain', basis: '多店舗チェーン（「札幌市・滝川市ほか」）' },
  '牛たん炭焼 利久': { type: 'chain', basis: '多店舗チェーン（「仙台市ほか」）' },
  '矢場とん': { type: 'chain', basis: '多店舗チェーン（「名古屋市ほか」）' },
  '世界の山ちゃん': { type: 'chain', basis: '多店舗チェーン（「名古屋市ほか」）' },
  'スガキヤ（中京圏チェーン）': { type: 'chain', basis: '中京圏の多店舗チェーン' },
  'レストランフロイデ（としまえん跡周辺ほか）': { type: 'chain', basis: '「ほか」で複数を指し1店を特定できない（公式URLなし・ホットペッパー0件・実在の確認が必要）' },
  // ---- 商業施設・飲食店の集まり（54） ----
  'ルミネ大宮': { type: 'complex', basis: '駅ビル' },
  '大宮タカシマヤ': { type: 'complex', basis: '百貨店' },
  'そごう大宮': { type: 'complex', basis: '百貨店' },
  'そごう千葉（千葉そごう）': { type: 'complex', basis: '百貨店' },
  'ペリエ千葉': { type: 'complex', basis: '駅ビル' },
  '三井ショッピングパーク ららぽーとTOKYO-BAY': { type: 'complex', basis: 'ショッピングセンター' },
  '横浜タカシマヤ レストラン（横浜駅西口）': { type: 'complex', basis: '百貨店のレストラン街' },
  'そごう横浜 レストラン街（横浜駅東口）': { type: 'complex', basis: '百貨店のレストラン街' },
  'ランドマークプラザ（みなとみらい）': { type: 'complex', basis: 'ショッピングモール' },
  'クイーンズスクエア横浜（みなとみらい）': { type: 'complex', basis: '複合商業施設' },
  'ジョイナス（横浜駅西口）': { type: 'complex', basis: 'ショッピングセンター' },
  'グランフロント大阪（梅田）': { type: 'complex', basis: '複合商業施設' },
  'ルクア大阪（梅田）': { type: 'complex', basis: '駅ビル' },
  'なんばパークス（難波）': { type: 'complex', basis: '複合商業施設' },
  'あべのキューズモール（天王寺・阿倍野）': { type: 'complex', basis: 'ショッピングモール' },
  'あべのハルカス近鉄本店（天王寺・阿倍野）': { type: 'complex', basis: '百貨店' },
  '東京ドームシティ ラクーア内 キッズOK店舗群': { type: 'complex', basis: '商業施設内の店舗群' },
  '渋谷ヒカリエ ShinQs ダイニング': { type: 'complex', basis: '商業施設のレストランフロア' },
  'お台場ヴィーナスフォート跡地～アクアシティお台場 レストラン': { type: 'complex', basis: '商業施設のレストラン群' },
  '六本木ヒルズ ヒルサイド・レストラン群': { type: 'complex', basis: '複合施設のレストラン群' },
  '新宿高島屋 14Fダイニング': { type: 'complex', basis: '百貨店のレストランフロア' },
  'グランスタ東京 駅構内ダイニング': { type: 'complex', basis: '駅構内の商業施設' },
  '上野松坂屋 上野フロンティアタワー レストラン': { type: 'complex', basis: '百貨店・複合ビルのレストラン' },
  'アトレ吉祥寺 レストランフロア': { type: 'complex', basis: '駅ビルのレストランフロア' },
  '蒲田グランデュオ レストランフロア': { type: 'complex', basis: '駅ビルのレストランフロア' },
  'アトレ大森 レストラン': { type: 'complex', basis: '駅ビルのレストラン' },
  '中野サンモール～中野ブロードウェイ周辺 ファミレス・カフェ': { type: 'complex', basis: '商店街・周辺エリアの店の集まり' },
  '横浜ランドマークタワー ドックヤードガーデン レストラン': { type: 'complex', basis: '商業施設のレストラン群' },
  '横浜赤レンガ倉庫 レストランフロア': { type: 'complex', basis: '商業施設のレストランフロア' },
  '川崎アゼリア・チネチッタ周辺 レストラン': { type: 'complex', basis: '地下街・周辺エリアの店の集まり' },
  '湘南T-SITE（藤沢） カフェ＆レストラン': { type: 'complex', basis: '商業施設のカフェ・レストラン群' },
  'ルクア大阪 バルチカ': { type: 'complex', basis: '駅ビルの飲食フロア' },
  'あべのハルカス ダイニングフロア': { type: 'complex', basis: '複合ビルのレストランフロア' },
  '天神地下街・ソラリアプラザ レストラン': { type: 'complex', basis: '地下街・商業施設のレストラン' },
  '大丸札幌店 レストランフロア': { type: 'complex', basis: '百貨店のレストランフロア' },
  'サッポロファクトリー レストラン': { type: 'complex', basis: '複合商業施設のレストラン' },
  '新千歳空港 ターミナルビル ファミリーレストラン': { type: 'complex', basis: '空港ターミナルの飲食店群' },
  '京都駅ビル ザ・キューブ・ジェイアール京都伊勢丹 レストラン': { type: 'complex', basis: '駅ビル・百貨店のレストラン' },
  '京都四条河原町 OPA・高島屋 レストランフロア': { type: 'complex', basis: '商業施設・百貨店のレストランフロア' },
  '京都ポルタ 地下街レストラン': { type: 'complex', basis: '地下街' },
  '神戸三宮センタープラザ レストラン': { type: 'complex', basis: '商業ビルのレストラン' },
  '姫路駅前 ピオレ姫路 レストランフロア': { type: 'complex', basis: '駅ビルのレストランフロア' },
  'A-FACTORY（青森駅前）カフェ＆レストラン': { type: 'complex', basis: '複数店舗が入る商業施設' },
  '仙台パルコ・エスパル仙台 レストランフロア': { type: 'complex', basis: '駅ビルのレストランフロア' },
  'アルヴェ・トピコ秋田 レストラン': { type: 'complex', basis: '駅ビル・複合施設のレストラン' },
  '富山駅 マルート レストラン': { type: 'complex', basis: '駅ビルのレストラン' },
  '金沢百番街 あんと レストラン': { type: 'complex', basis: '駅ビルのレストラン' },
  'アスティ岐阜 レストラン': { type: 'complex', basis: '駅ビルのレストラン' },
  'パルシェ静岡 レストラン': { type: 'complex', basis: '駅ビルのレストラン' },
  '近鉄百貨店奈良店 レストランフロア': { type: 'complex', basis: '百貨店のレストランフロア' },
  'シーモール下関 レストラン': { type: 'complex', basis: 'ショッピングセンターのレストラン' },
  'クレメントプラザ徳島 レストラン': { type: 'complex', basis: '駅ビルのレストラン' },
  '高松オルネ・コトデンそごう周辺 レストラン': { type: 'complex', basis: '駅ビル・百貨店周辺の店の集まり' },
  '松山三越 レストランフロア': { type: 'complex', basis: '百貨店のフードホール' },
};

/**
 * 設備ごとの出典（spot.name 完全一致）。spots.ts のマージで spot.amenityEvidence に焼き付く。
 * **記録に無い値に出典を付けない**。推測で埋めない。
 * 2026-10-27 時点は、無料掲載で公開済みの3店（公式サイト＋店からの回答・掲載文の確認）だけ。
 */
const LEDGER = '~/.claude/company/tieup-ledger.md';

export const RESTAURANT_AMENITY_EVIDENCE: Record<string, AmenityEvidenceMap> = {
  '子育てカフェeatoco（イイトコ）': {
    kidsSpace: {
      kind: 'official-site',
      url: 'https://www.eatoco.com/cafe',
      checkedAt: '2026-10-27',
      quote: '階段下には、くぼみを利用したキッズスペースがあります',
    },
    babyFood: {
      kind: 'official-site',
      url: 'https://www.eatoco.com/faq',
      checkedAt: '2026-10-27',
      quote: '離乳食の持ち込みはできますか？→持ち込み可能です',
      displayText: '持ち込みOK',
    },
    strollerAccess: {
      kind: 'official-site',
      url: 'https://www.eatoco.com/faq',
      checkedAt: '2026-10-27',
      quote: 'ベビーカーで入店できますか？→お席に余裕がある場合は可能です',
      displayText: '席に余裕があれば可',
    },
    babyChair: {
      kind: 'owner-reply',
      ref: `${LEDGER} 2026-10-06 午後2「eatoco 12:25 写真4枚と設備の回答（…1階ベビーチェア・2階子ども椅子…）」／10-07 掲載内容に先方の最終OK`,
      checkedAt: '2026-10-06',
      quote: '1階ベビーチェア・2階子ども椅子',
    },
  },
  'ひよこのカフェハウス': {
    nursingRoom: {
      kind: 'official-site',
      url: 'https://www.hiyokono-cafe-house.com/ご利用案内/サービス/',
      checkedAt: '2026-10-27',
      quote: '店内設備 授乳室',
    },
    diaperChange: {
      kind: 'official-site',
      url: 'https://www.hiyokono-cafe-house.com/ご利用案内/サービス/',
      checkedAt: '2026-10-27',
      quote: '店内設備 おむつ替えスペース',
    },
    kidsSpace: {
      kind: 'official-site',
      url: 'https://www.hiyokono-cafe-house.com/ご利用案内/',
      checkedAt: '2026-10-27',
      quote: '子どもの遊び場のあるカフェですが、',
    },
    babyFood: {
      kind: 'official-site',
      url: 'https://www.hiyokono-cafe-house.com/ご利用案内/',
      checkedAt: '2026-10-27',
      quote: 'お持ち込みはお菓子を含め、離乳食またはアレルギーをお持ちの方のみ…離乳食のメニューもご用意しております',
    },
    babyChair: {
      kind: 'owner-reply',
      ref: `${LEDGER} 2026-10-09「小泉様 13:06 最終OK（特に間違いや修正したいところは見当たりませんでした）」。確認した掲載文に「子ども用の食事椅子…を借りられます」`,
      checkedAt: '2026-10-09',
      quote: '子ども用の食事椅子、食事用エプロン…を借りられます（掲載文を先方が確認）',
    },
  },
  '絵本カフェぷあぷ': {
    kidsSpace: {
      kind: 'official-site',
      url: 'https://cafe-puapu.com/about/',
      checkedAt: '2026-10-27',
      quote: 'キッズスペースでは靴を脱いで足を伸ばして読書を楽しめます',
    },
    diaperChange: {
      kind: 'official-site',
      url: 'https://cafe-puapu.com/about/',
      checkedAt: '2026-10-27',
      quote: '「簡易おむつ交換台」「流し場」もございます',
    },
    babyFood: {
      kind: 'official-site',
      url: 'https://cafe-puapu.com/about/',
      checkedAt: '2026-10-27',
      quote: '当店メニューには現在離乳食がないので、お持ち込みいただいて大丈夫です',
      displayText: '持ち込みOK',
    },
    strollerAccess: {
      kind: 'owner-reply',
      ref: `${LEDGER} 2026-10-08「古瀬村様 13:10 設備の回答」→ 17:21 最終OK（内容を確認しました。大丈夫です）。確認した掲載文に「入口に段差がありますが入店でき、入店時にお店の方が手伝ってくれます」`,
      checkedAt: '2026-10-08',
      quote: '入口に段差がありますが入店できます（掲載文を先方が確認）',
    },
    babyChair: {
      kind: 'owner-reply',
      ref: `${LEDGER} 2026-10-08「古瀬村様 13:10 設備の回答」→ 17:21 最終OK。確認した掲載文に「子ども用の椅子が用意されています」`,
      checkedAt: '2026-10-08',
      quote: '子ども用の椅子が用意されています（掲載文を先方が確認）',
    },
  },
};

/**
 * 表示用に、出典の無い設備を落とした Spot を返す（元の spot は変更しない＝データは消さない）。
 * restaurant 以外はそのまま同じオブジェクトを返す。
 */
export function gateRestaurantAmenities(spot: Spot): Spot {
  if (spot.category !== 'restaurant') return spot;
  const ev = spot.amenityEvidence ?? {};
  const venue: RestaurantVenueType = spot.venueType ?? 'shop';
  const out: Spot = { ...spot };
  for (const k of RESTAURANT_FLAG_KEYS) {
    if (out[k] === undefined) continue;
    // 商業施設はテナント単位の設備を出さない。個別店・チェーンは出典があるときだけ。
    if (venue === 'complex' || out[k] !== true || !isValidEvidence(ev[k])) delete out[k];
  }
  if (spot.facilities) {
    const f = { ...spot.facilities };
    for (const k of FACILITY_KEYS) {
      if (f[k] === undefined) continue;
      if (!isValidEvidence(ev[k])) delete f[k];
    }
    out.facilities = f;
  }
  return out;
}
