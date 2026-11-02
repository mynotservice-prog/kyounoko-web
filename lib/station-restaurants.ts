/**
 * 23区駅×チェーン店マッピングデータベース。
 * 各駅周辺の子連れOK・ベビーカーOK飲食チェーン店を、徒歩5-10分圏内で対応付け。
 *
 * 注: ここでは「駅周辺にチェーン店があるか」のキュレーション情報のみ持ち、
 * 個別店舗の正確な住所は持たない（変更リスク回避）。
 *
 * 方針:
 * - terminal駅: ほぼ全チェーン（14〜25個）
 * - major駅: 主要チェーン（10〜12個、ファミレス/カフェ/ファストフード/和食をバランス良く）
 * - minor駅: 主要4〜8個（カフェ・ファストフード・ファミレス・牛丼を中心に）
 * - ファミリー客が多い区（江戸川・葛飾・足立・練馬・板橋・杉並・世田谷・北・荒川・江東・墨田）には
 *   回転寿司・焼肉などキッズ向きを優先的に配置
 * - 数駅限定のチェーン（IKEAレストラン等）は SPECIFIC_ASSIGN で明示
 */

import { TOKYO_STATIONS, type TokyoStation } from './tokyo-stations';
import { KANSAI_STATIONS } from './kansai-stations';
import { KANAGAWA_STATIONS } from './kanagawa-stations';
import { SAICHI_STATIONS } from './saitama-chiba-stations';
import { REGIONAL_STATIONS } from './regional-stations';
import { STATION_VERIFIED_STORES } from './station-verified-stores';

export type ChainCategory =
  | 'family-restaurant'  // ファミレス
  | 'cafe'              // カフェ
  | 'fast-food'         // ファストフード
  | 'washoku'           // 和食チェーン
  | 'italian'           // イタリアン
  | 'chinese'           // 中華
  | 'sushi'             // 回転寿司
  | 'noodles'           // ラーメン・うどん・そば
  | 'yakiniku'          // 焼肉
  | 'curry'             // カレー
  | 'gyudon'            // 牛丼
  | 'bakery'            // パン
  | 'mall-food';        // モール内フードコート

/** 席のタイプ。複数該当する。 */
export type SeatingType =
  | 'box'     // ボックス席（仕切りあり、子どもが落ちにくい）
  | 'table'   // 通常テーブル席
  | 'counter' // カウンター席
  | 'zashiki' // 座敷・小上がり（赤ちゃん寝かせられる）
  | 'terrace';// テラス・オープン席

export type Chain = {
  /** チェーン店ブランドのslug */
  slug: string;
  /** 表示名 */
  name: string;
  /** カテゴリ */
  category: ChainCategory;
  /** ベビーカー入店可（◎/○/△の3段階） */
  stroller: 'good' | 'ok' | 'limited';
  /** キッズメニュー有無 */
  kidsMenu: boolean;
  /** ベビーチェア（キッズチェア）有無 */
  babyChair: boolean;
  /** 個室・仕切り席有無 */
  privateRoom: boolean;
  /** 離乳食持込OK */
  babyFoodOk: boolean;
  /** 子供用スプーン・フォーク・取り皿の提供あり */
  kidsCutlery?: boolean;
  /** 店内にキッズスペース・遊び場あり */
  kidsSpace?: boolean;
  // ===== 子連れ目線フィールド（v6 追加）=====
  /** 入口・店内に段差なし（ベビーカーそのまま入店可） */
  stepFree?: boolean;
  /** 用意のある席タイプ */
  seatingType?: SeatingType[];
  /** おむつ替え台あり */
  diaperChangingTable?: boolean;
  /** 授乳室・授乳スペースあり */
  nursingRoom?: boolean;
  /** 離乳食持ち込みOK（公式に明記） */
  bringBabyFood?: boolean;
  /** 取り分け前提のメニュー（小皿うどん・小さいご飯など） */
  shareDish?: boolean;
  /** ベビーカーで席まで（たたまずに済む通路幅） */
  strollerToSeat?: boolean;
  /** アレルゲン表示あり（公式メニューに記載） */
  allergenInfo?: boolean;
  // =============================================
  /** 平均ランチ価格帯（円） */
  lunchPrice: '〜800' | '〜1,500' | '〜2,500' | '〜4,000' | '4,000〜';
  /** 駅周辺で見つかりやすさ。'common'=ほぼどの主要駅にも、'major-only'=ターミナル中心、'specific'=特定エリアのみ */
  ubiquity: 'common' | 'major-only' | 'specific';
  /**
   * 店舗の特徴説明（80字以内）。業態・看板メニュー・注文方式など。
   * 設備（椅子・ベビーカー・席・個室・離乳食・おむつ・遊び場）の断定は書かない（店ごとに違い、出典が無い）。
   * キッズメニューは lib/chain-facilities.ts に公式の根拠があるときだけ書き、一部店舗なら「店舗による」と書く（2026-10-28）。
   */
  description: string;
  /** 地域チェーン（2026-11 に足した駅の台帳にだけ載る）。/data の集計には数えない */
  regional?: boolean;
};

/**
 * このファイルのチェーン設備・駅マッピングデータを実質的に更新した日。
 * 駅ページの「この情報について」ブロックに表示される（GEO: AI検索が引用資格として
 * 鮮度・確認方法の明示を要求するため）。CHAINS / STATION_CHAIN_MAPPING を
 * 更新したら必ずこの日付も更新すること。
 */
export const STATION_CHAIN_DATA_UPDATED = '2026-09-01';

const BASE_CHAINS: Chain[] = [
  // ===== ファミレス系 =====
  {
    slug: 'saizeriya',
    name: 'サイゼリヤ',
    category: 'italian',
    stroller: 'good',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['box', 'table'],
    diaperChangingTable: true,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜800',
    ubiquity: 'common',
    description: 'イタリアンのファミレス。公式のメニュー一覧にキッズメニューの記載を確認できなかった。',
  },
  {
    slug: 'gusto',
    name: 'ガスト',
    category: 'family-restaurant',
    stroller: 'good',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['box', 'table'],
    diaperChangingTable: true,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜1,500',
    ubiquity: 'common',
    description: 'すかいらーく系のファミレス。公式のキッズメニューあり。',
  },
  {
    slug: 'jonathan',
    name: 'ジョナサン',
    category: 'family-restaurant',
    stroller: 'good',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['box', 'table'],
    diaperChangingTable: true,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜1,500',
    ubiquity: 'major-only',
    description: 'すかいらーく系のファミリーレストラン。公式のお子様メニューあり。',
  },
  {
    slug: 'denny-s',
    name: 'デニーズ',
    category: 'family-restaurant',
    stroller: 'good',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['box', 'table'],
    diaperChangingTable: true,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜1,500',
    ubiquity: 'major-only',
    description: 'ハンバーグやパスタのファミレス。公式のキッズメニューあり。',
  },
  {
    slug: 'royal-host',
    name: 'ロイヤルホスト',
    category: 'family-restaurant',
    stroller: 'good',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['box', 'table'],
    diaperChangingTable: true,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜2,500',
    ubiquity: 'major-only',
    description: 'ファミリーレストラン。公式のお子様メニューあり。',
  },
  {
    slug: 'cocos',
    name: 'ココス',
    category: 'family-restaurant',
    stroller: 'good',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['box', 'table'],
    diaperChangingTable: true,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜1,500',
    ubiquity: 'major-only',
    description: 'ハンバーグやパスタのファミレス。公式のおこさまメニューあり。',
  },
  {
    slug: 'bamiyan',
    name: 'バーミヤン',
    category: 'chinese',
    stroller: 'good',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['box', 'table'],
    diaperChangingTable: true,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜1,500',
    ubiquity: 'major-only',
    description: 'すかいらーく系の中華料理店。公式のお子様メニューあり。',
  },

  // ===== カフェ系 =====
  {
    slug: 'starbucks',
    name: 'スターバックスコーヒー',
    category: 'cafe',
    stroller: 'ok',
    kidsMenu: false,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['table', 'counter', 'terrace'],
    diaperChangingTable: false,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: false,
    strollerToSeat: true,
    allergenInfo: false,
    lunchPrice: '〜1,500',
    ubiquity: 'common',
    description: 'コーヒーチェーン。サンドイッチやペストリーもある。',
  },
  {
    slug: 'tully-coffee',
    name: 'タリーズコーヒー',
    category: 'cafe',
    stroller: 'ok',
    kidsMenu: false,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['table', 'counter', 'terrace'],
    diaperChangingTable: false,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: false,
    strollerToSeat: true,
    allergenInfo: false,
    lunchPrice: '〜1,500',
    ubiquity: 'common',
    description: 'コーヒーチェーン。公式のキッズメニュー（おやこパスタセット・キッズドリンクなど）あり。',
  },
  {
    slug: 'doutor',
    name: 'ドトールコーヒー',
    category: 'cafe',
    stroller: 'limited',
    kidsMenu: false,
    babyChair: false,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: false,
    seatingType: ['table', 'counter'],
    diaperChangingTable: false,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: false,
    strollerToSeat: false,
    allergenInfo: false,
    lunchPrice: '〜800',
    ubiquity: 'common',
    description: 'コーヒーショップ。ミラノサンドなどの軽食あり。',
  },
  {
    slug: 'komeda',
    name: 'コメダ珈琲店',
    category: 'cafe',
    stroller: 'good',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['box', 'table'],
    diaperChangingTable: true,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜1,500',
    ubiquity: 'major-only',
    description: '喫茶店。モーニングサービスがある。公式のお子様メニューあり。',
  },
  {
    slug: 'excelsior',
    name: 'エクセルシオールカフェ',
    category: 'cafe',
    stroller: 'ok',
    kidsMenu: false,
    babyChair: false,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: false,
    seatingType: ['table', 'counter'],
    diaperChangingTable: false,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: false,
    strollerToSeat: false,
    allergenInfo: false,
    lunchPrice: '〜1,500',
    ubiquity: 'major-only',
    description: 'ドトール系のカフェ。パスタ・パニーニ・ケーキあり。',
  },

  // ===== ファストフード系 =====
  {
    slug: 'mcdonalds',
    name: 'マクドナルド',
    category: 'fast-food',
    stroller: 'good',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['box', 'table', 'counter'],
    diaperChangingTable: true,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜800',
    ubiquity: 'common',
    description: 'ハンバーガーチェーン。子ども向けのハッピーセットあり。',
  },
  {
    slug: 'mos-burger',
    name: 'モスバーガー',
    category: 'fast-food',
    stroller: 'ok',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['table', 'counter', 'box'],
    diaperChangingTable: false,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜1,500',
    ubiquity: 'common',
    description: 'ハンバーガーチェーン。子ども向けのモスワイワイセットあり（一部店舗を除く）。',
  },
  {
    slug: 'kfc',
    name: 'ケンタッキーフライドチキン',
    category: 'fast-food',
    stroller: 'ok',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['table', 'counter'],
    diaperChangingTable: false,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜1,500',
    ubiquity: 'major-only',
    description: 'フライドチキンのチェーン。公式のキッズメニューあり。',
  },
  {
    slug: 'lotteria',
    // 公式の店舗検索はゼッテリアに統合されている（lotteria.jp は zetteria.jp へ転送・2026-10-08確認）
    name: 'ゼッテリア（ロッテリア）',
    category: 'fast-food',
    stroller: 'ok',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['box', 'table'],
    diaperChangingTable: false,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜800',
    ubiquity: 'major-only',
    description: 'ハンバーガーチェーン。子ども向けのわくわくセットあり。',
  },
  {
    slug: 'subway',
    name: 'サブウェイ',
    category: 'fast-food',
    stroller: 'ok',
    kidsMenu: true,
    babyChair: false,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: false,
    seatingType: ['table', 'counter', 'box'],
    diaperChangingTable: false,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: false,
    allergenInfo: true,
    lunchPrice: '〜1,500',
    ubiquity: 'major-only',
    description: 'パンや野菜を選べるサンドイッチのチェーン。キッズセットは店舗による。',
  },

  // ===== 牛丼・カレー・和食 =====
  {
    slug: 'yoshinoya',
    name: '吉野家',
    category: 'gyudon',
    stroller: 'limited',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: false,
    stepFree: false,
    seatingType: ['counter', 'table'],
    diaperChangingTable: false,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: false,
    strollerToSeat: false,
    allergenInfo: true,
    lunchPrice: '〜800',
    ubiquity: 'common',
    description: '牛丼チェーン。小盛あり。お子様メニューは店舗による。',
  },
  {
    slug: 'matsuya',
    name: '松屋',
    category: 'gyudon',
    stroller: 'limited',
    kidsMenu: false,
    babyChair: false,
    privateRoom: false,
    babyFoodOk: false,
    stepFree: false,
    seatingType: ['counter', 'table'],
    diaperChangingTable: false,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: false,
    strollerToSeat: false,
    allergenInfo: true,
    lunchPrice: '〜800',
    ubiquity: 'common',
    description: '牛めしのチェーン。公式のおこさまメニュー（おこさま牛めしなど）あり。',
  },
  {
    slug: 'sukiya',
    name: 'すき家',
    category: 'gyudon',
    stroller: 'ok',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: false,
    stepFree: true,
    seatingType: ['box', 'table', 'counter'],
    diaperChangingTable: false,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜800',
    ubiquity: 'common',
    description: '牛丼チェーン。お子様メニューは店舗による。',
  },
  {
    slug: 'cocoichi',
    name: 'CoCo壱番屋',
    category: 'curry',
    stroller: 'ok',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: false,
    seatingType: ['box', 'table'],
    diaperChangingTable: false,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: false,
    allergenInfo: true,
    lunchPrice: '〜1,500',
    ubiquity: 'major-only',
    description: 'カレーのチェーン。辛さ・ライスの量を選べる。お子さまメニューは店舗による。',
  },
  {
    slug: 'ootoya',
    name: '大戸屋',
    category: 'washoku',
    stroller: 'ok',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['box', 'table'],
    diaperChangingTable: true,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜1,500',
    ubiquity: 'major-only',
    description: '定食のチェーン。公式のお子様メニューあり。',
  },
  {
    slug: 'yayoiken',
    name: 'やよい軒',
    category: 'washoku',
    stroller: 'ok',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: false,
    seatingType: ['counter', 'table', 'box'],
    diaperChangingTable: false,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: false,
    allergenInfo: true,
    lunchPrice: '〜1,500',
    ubiquity: 'major-only',
    description: '定食と朝食のごはんがおかわり自由の定食チェーン（丼・お子様メニューは対象外）。お子様メニューは店舗による。',
  },

  // ===== 中華・寿司・ラーメン =====
  {
    slug: 'ohsho',
    name: '餃子の王将',
    category: 'chinese',
    stroller: 'limited',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: false,
    seatingType: ['table', 'counter'],
    diaperChangingTable: false,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: false,
    allergenInfo: true,
    lunchPrice: '〜1,500',
    ubiquity: 'major-only',
    description: '餃子・ラーメンの中華チェーン。持ち帰りメニューにお子様弁当がある。',
  },
  {
    slug: 'sushiro',
    name: 'スシロー',
    category: 'sushi',
    stroller: 'good',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['box', 'table', 'counter'],
    diaperChangingTable: true,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜1,500',
    ubiquity: 'common',
    description: '回転寿司チェーン。タッチパネルで注文でき、公式のキッズメニューあり。',
  },
  {
    slug: 'kura-sushi',
    name: 'くら寿司',
    category: 'sushi',
    stroller: 'good',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['box', 'table', 'counter'],
    diaperChangingTable: true,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜1,500',
    ubiquity: 'major-only',
    description: '回転寿司チェーン。5皿に1回遊べる「ビッくらポン！」がある。',
  },
  {
    slug: 'hama-sushi',
    name: 'はま寿司',
    category: 'sushi',
    stroller: 'good',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['box', 'table', 'counter'],
    diaperChangingTable: true,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜1,500',
    ubiquity: 'major-only',
    description: '回転寿司チェーン。公式のキッズメニューあり。',
  },
  {
    slug: 'ichiban',
    name: '魚べい',
    category: 'sushi',
    stroller: 'good',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['box', 'table', 'zashiki'],
    diaperChangingTable: true,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜1,500',
    ubiquity: 'major-only',
    description: '元気寿司系の回転寿司。注文品は高速レーンで席まで届く店舗がある。公式のキッズメニューあり。',
  },
  {
    slug: 'marugame',
    name: '丸亀製麺',
    category: 'noodles',
    stroller: 'ok',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['table', 'counter'],
    diaperChangingTable: false,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜800',
    ubiquity: 'common',
    description: 'うどんのチェーン。公式のお子さま向けメニューあり。',
  },

  // ===== 焼肉・しゃぶしゃぶ =====
  {
    slug: 'gyukaku',
    name: '牛角',
    category: 'yakiniku',
    stroller: 'ok',
    kidsMenu: true,
    babyChair: true,
    privateRoom: true,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['box', 'table', 'zashiki'],
    diaperChangingTable: true,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜2,500',
    ubiquity: 'major-only',
    description: '焼肉チェーン。公式のキッズメニューあり。',
  },
  {
    slug: 'shabu-yo',
    name: 'しゃぶ葉',
    category: 'yakiniku',
    stroller: 'good',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['box', 'table'],
    diaperChangingTable: true,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜2,500',
    ubiquity: 'major-only',
    description: 'すかいらーく系のしゃぶしゃぶ食べ放題。子どもの料金は公式の料金案内で確認を。',
  },

  // ===== モール・特殊系 =====
  {
    slug: 'ikea-restaurant',
    name: 'IKEAレストラン',
    category: 'mall-food',
    stroller: 'good',
    kidsMenu: true,
    babyChair: true,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['table'],
    diaperChangingTable: true,
    nursingRoom: true,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜1,500',
    ubiquity: 'specific',
    description: 'IKEA店内のレストラン。スウェーデンのミートボールが定番。',
  },
  {
    slug: 'costco-food',
    name: 'コストコ・フードコート',
    category: 'mall-food',
    stroller: 'good',
    kidsMenu: false,
    babyChair: false,
    privateRoom: false,
    babyFoodOk: true,
    stepFree: true,
    seatingType: ['counter', 'table', 'terrace'],
    diaperChangingTable: true,
    nursingRoom: false,
    bringBabyFood: true,
    shareDish: true,
    strollerToSeat: true,
    allergenInfo: true,
    lunchPrice: '〜800',
    ubiquity: 'specific',
    description: '会員制倉庫店の飲食コーナー。アメリカンサイズピザ・ジャンボホットドッグがある。',
  },
  // ===== 拡充チェーン（v7 追加・全駅の選択肢底上げ）=====
  {
    slug: 'bikkuri-donkey', name: 'びっくりドンキー', category: 'family-restaurant',
    stroller: 'good', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true, kidsCutlery: true,
    stepFree: true, seatingType: ['box', 'table'], shareDish: true, strollerToSeat: true, allergenInfo: true,
    lunchPrice: '〜1,500', ubiquity: 'common',
    description: 'ハンバーグのレストラン。公式のキッズメニューあり。',
  },
  {
    slug: 'nakau', name: 'なか卯', category: 'gyudon',
    stroller: 'ok', kidsMenu: false, babyChair: false, privateRoom: false, babyFoodOk: true,
    seatingType: ['table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜800', ubiquity: 'common',
    description: '親子丼とうどんの店。親子丼は小盛、うどんは小サイズあり。',
  },
  {
    slug: 'matsunoya', name: '松のや', category: 'washoku',
    stroller: 'ok', kidsMenu: false, babyChair: false, privateRoom: false, babyFoodOk: true,
    seatingType: ['table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜800', ubiquity: 'common',
    description: 'とんかつのチェーン。',
  },
  {
    slug: 'katsuya', name: 'かつや', category: 'washoku',
    stroller: 'ok', kidsMenu: false, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['box', 'table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜800', ubiquity: 'common',
    description: 'とんかつ・カツ丼のチェーン。',
  },
  {
    slug: 'tenya', name: '天丼てんや', category: 'washoku',
    stroller: 'ok', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜800', ubiquity: 'common',
    description: '天丼・天ぷらのチェーン。一部店舗に小学生以下のお子様メニューあり。',
  },
  {
    slug: 'hanamaru-udon', name: 'はなまるうどん', category: 'noodles',
    stroller: 'ok', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true, kidsCutlery: true,
    seatingType: ['table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜800', ubiquity: 'common',
    description: 'セルフ形式の讃岐うどんのチェーン。お子様メニューは店舗による。',
  },
  {
    slug: 'ringer-hut', name: 'リンガーハット', category: 'noodles',
    stroller: 'ok', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['box', 'table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜1,500', ubiquity: 'common',
    description: '長崎ちゃんぽん・長崎皿うどんのチェーン。公式のお子様メニューあり。',
  },
  {
    slug: 'hidakaya', name: '日高屋', category: 'chinese',
    stroller: 'limited', kidsMenu: false, babyChair: false, privateRoom: false, babyFoodOk: true,
    seatingType: ['table', 'counter'], shareDish: true,
    lunchPrice: '〜800', ubiquity: 'common',
    description: '中華そばの中華食堂チェーン。お子様メニューは店舗による。',
  },
  {
    slug: 'osaka-ohsho', name: '大阪王将', category: 'chinese',
    stroller: 'ok', kidsMenu: false, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['box', 'table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜1,500', ubiquity: 'common',
    description: '中華チェーン。',
  },
  {
    slug: 'mister-donut', name: 'ミスタードーナツ', category: 'bakery',
    stroller: 'good', kidsMenu: false, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['box', 'table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜800', ubiquity: 'common',
    description: 'ドーナツのチェーン。飲茶の麺類がある店舗も。',
  },
  {
    slug: 'saint-marc-cafe', name: 'サンマルクカフェ', category: 'cafe',
    stroller: 'ok', kidsMenu: false, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['table', 'counter', 'terrace'],
    lunchPrice: '〜800', ubiquity: 'common',
    description: 'チョコクロのあるカフェ。',
  },
  {
    slug: 'veloce', name: 'カフェ・ベローチェ', category: 'cafe',
    stroller: 'limited', kidsMenu: false, babyChair: false, privateRoom: false, babyFoodOk: true,
    seatingType: ['table', 'counter'],
    lunchPrice: '〜800', ubiquity: 'common',
    description: 'カフェチェーン。',
  },
  {
    slug: 'pronto', name: 'プロント', category: 'cafe',
    stroller: 'ok', kidsMenu: false, babyChair: false, privateRoom: false, babyFoodOk: true,
    seatingType: ['table', 'counter'],
    lunchPrice: '〜1,500', ubiquity: 'common',
    description: '昼はカフェで生パスタ、夜はバーメニュー。',
  },
  {
    slug: 'kappa-sushi', name: 'かっぱ寿司', category: 'sushi',
    stroller: 'good', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true, kidsCutlery: true,
    stepFree: true, seatingType: ['box', 'table'], shareDish: true, strollerToSeat: true, allergenInfo: true,
    lunchPrice: '〜1,500', ubiquity: 'common',
    description: '回転寿司チェーン。公式のキッズメニューあり。',
  },
  {
    slug: 'freshness-burger', name: 'フレッシュネスバーガー', category: 'fast-food',
    stroller: 'ok', kidsMenu: false, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['table', 'counter', 'terrace'], allergenInfo: true,
    lunchPrice: '〜1,500', ubiquity: 'common',
    description: 'ハンバーガーチェーン。キッズセットは店舗による。',
  },
  {
    slug: 'kushikatsu-tanaka', name: '串カツ田中', category: 'washoku',
    stroller: 'good', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['box', 'table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜2,500', ubiquity: 'common',
    description: '串カツのチェーン。土日は昼から開く店舗もある。',
  },
  {
    slug: 'yakiniku-king', name: '焼肉きんぐ', category: 'yakiniku',
    stroller: 'good', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true, kidsCutlery: true,
    stepFree: true, seatingType: ['box', 'table'], shareDish: true, strollerToSeat: true, allergenInfo: true,
    lunchPrice: '〜2,500', ubiquity: 'major-only',
    description: '焼肉の食べ放題チェーン。専用のキッズメニューは無い（公式に明記）。',
  },
  {
    slug: 'onyasai', name: 'しゃぶしゃぶ温野菜', category: 'yakiniku',
    stroller: 'ok', kidsMenu: true, babyChair: true, privateRoom: true, babyFoodOk: true,
    seatingType: ['box', 'table', 'zashiki'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜2,500', ubiquity: 'major-only',
    description: 'しゃぶしゃぶ食べ放題のチェーン。',
  },
  {
    slug: 'bronco-billy', name: 'ブロンコビリー', category: 'family-restaurant',
    stroller: 'good', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true, kidsCutlery: true,
    stepFree: true, seatingType: ['box', 'table'], shareDish: true, strollerToSeat: true, allergenInfo: true,
    lunchPrice: '〜2,500', ubiquity: 'major-only',
    description: 'ステーキ・ハンバーグのチェーン。食べ放題のブロンコビュッフェがある。公式のキッズメニューあり。',
  },
  {
    slug: 'musashino-mori-coffee', name: 'むさしの森珈琲', category: 'cafe',
    stroller: 'good', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true,
    stepFree: true, seatingType: ['box', 'table'], shareDish: true, strollerToSeat: true, allergenInfo: true,
    lunchPrice: '〜1,500', ubiquity: 'major-only',
    description: 'すかいらーく系のカフェ。ふわっとろパンケーキがある。',
  },
  {
    slug: 'hoshino-coffee', name: '星乃珈琲店', category: 'cafe',
    stroller: 'ok', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['box', 'table'],
    lunchPrice: '〜1,500', ubiquity: 'major-only',
    description: 'カフェ。窯焼きスフレパンケーキがある。',
  },
  {
    slug: 'kamakura-pasta', name: '鎌倉パスタ', category: 'italian',
    stroller: 'ok', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['box', 'table'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜1,500', ubiquity: 'major-only',
    description: '生パスタのチェーン。コースに焼き立てパン食べ放題が付く。',
  },
  {
    slug: 'goemon', name: '洋麺屋五右衛門', category: 'italian',
    stroller: 'ok', kidsMenu: false, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['table'], shareDish: true,
    lunchPrice: '〜1,500', ubiquity: 'major-only',
    description: 'お箸で食べるスパゲッティーの店。',
  },
  {
    slug: 'fujiya-restaurant', name: '不二家レストラン', category: 'family-restaurant',
    stroller: 'good', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true, kidsCutlery: true,
    seatingType: ['box', 'table'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜1,500', ubiquity: 'major-only',
    description: '不二家のレストラン。ケーキがある。',
  },
  {
    slug: 'tonkatsu-wako', name: 'とんかつ和幸', category: 'washoku',
    stroller: 'ok', kidsMenu: false, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜2,500', ubiquity: 'major-only',
    description: 'とんかつ専門店。御飯・味噌汁・キャベツはお替り自由（実施しない店舗あり）。',
  },
];

/**
 * 地域チェーン。2026-11 に足した駅（実験31）の台帳にだけ載る。既存の駅には載らない。
 * 設備の項目は false のまま。店ごとの設備は台帳の fac、ブランドの設備は lib/chain-facilities.ts が正で、
 * ここの値は画面に出ない。説明文は各社の公式の文面の範囲で書く。
 */
function regionalChain(slug: string, name: string, category: ChainCategory, description: string): Chain {
  return {
    slug, name, category, description,
    stroller: 'limited', kidsMenu: false, babyChair: false, privateRoom: false, babyFoodOk: false,
    lunchPrice: '〜1,500', ubiquity: 'specific', regional: true,
  };
}

export const REGIONAL_CHAINS: Chain[] = [
  regionalChain('rikyu', '牛たん炭焼 利久', 'washoku', '炭火で焼く牛たんの店。'),
  regionalChain('west-udon', 'ウエスト', 'noodles', 'うどんと生そばの店。福岡を中心に展開する。'),
  regionalChain('coffeekan', '珈琲館', 'cafe', '喫茶店。'),
  regionalChain('ichiran', '一蘭', 'noodles', '天然とんこつラーメンの店。'),
  regionalChain('ippudo', '一風堂', 'noodles', 'ラーメン店。'),
  regionalChain('kisuke', '味の牛たん喜助', 'washoku', '1975年創業。炭火焼きの牛たん定食の店。'),
  regionalChain('yabaton', '矢場とん', 'washoku', '名古屋名物みそかつの店。'),
  regionalChain('yamamotoya-honten', '山本屋本店', 'noodles', '名古屋の煮込うどんの店。'),
  regionalChain('wendys-first-kitchen', 'ウェンディーズ・ファーストキッチン', 'fast-food', 'ハンバーガーの店。'),
  regionalChain('konparu', 'コンパル', 'cafe', '名古屋の喫茶店。'),
  regionalChain('ikkousha', '博多一幸舎', 'noodles', '豚骨ラーメンの店。'),
  regionalChain('gindaco', '築地銀だこ', 'fast-food', 'たこ焼の店。'),
  regionalChain('capricciosa', 'カプリチョーザ', 'italian', 'イタリアンのレストラン。「トマトとニンニクのスパゲティ」がある。'),
  regionalChain('ikinari-steak', 'いきなり！ステーキ', 'yakiniku', 'ステーキの店。'),
  regionalChain('kourakuen', '幸楽苑', 'noodles', 'ラーメンと餃子の店。'),
  regionalChain('ueshimacoffee', '上島珈琲店', 'cafe', 'ネルドリップコーヒーと、デザートや食事のあるカフェ。'),
  regionalChain('sugakiya', 'スガキヤ', 'noodles', 'ラーメンとソフトクリームの店。'),
  regionalChain('tenkaippin', '天下一品', 'noodles', 'ラーメン店。'),
  regionalChain('pietro', 'ピエトロ', 'italian', 'パスタの店。'),
  regionalChain('date-gyutan', '伊達の牛たん本舗', 'washoku', '仙台の牛たん専門店。'),
  regionalChain('jolly-pasta', 'ジョリーパスタ', 'italian', 'スパゲッティとピザが自慢のパスタ専門店。'),
  regionalChain('choushimaru', 'すし銚子丸', 'sushi', 'グルメ回転寿司の店。デザートや一品料理、お持ち帰りもある。'),
  regionalChain('gyoza-no-mansyu', 'ぎょうざの満洲', 'chinese', '餃子の店。'),
  regionalChain('maruha-shokudo', 'まるは食堂', 'washoku', 'ジャンボえびフライの南知多発の店。'),
  regionalChain('yamamotoya-sohonke', '山本屋総本家', 'noodles', '名古屋名物の味噌煮込みうどんの店。'),
  regionalChain('katsuan', 'かつ庵', 'washoku', 'とんかつ専門店。とんかつ、かつ丼、季節限定商品がある。'),
  regionalChain('steak-no-don', 'ステーキのどん', 'yakiniku', 'ステーキの店。'),
  regionalChain('steakmiya', 'ステーキ宮', 'yakiniku', '「宮のたれ」のステーキと、和牛入り手作りハンバーグの店。'),
  regionalChain('kisoji', '木曽路', 'washoku', 'しゃぶしゃぶと日本料理の店。'),
  regionalChain('misen', '味仙', 'chinese', '元祖名古屋名物の台湾ラーメンの店。'),
  regionalChain('joyfull', 'ジョイフル', 'family-restaurant', '九州発のファミリーレストラン。'),
  regionalChain('heiroku-sushi', '平禄寿司', 'sushi', '回転寿司の店。'),
  regionalChain('ajinomingei', '味の民芸', 'washoku', '手延べうどんと黄金だしのうどん、蕎麦、お膳の店。'),
  regionalChain('yumean', '夢庵', 'washoku', '和膳、天ぷら、そば・うどんのある和食レストラン。'),
  regionalChain('washokusato', '和食さと', 'washoku', '和食レストラン。'),
  regionalChain('karayama', 'からやま', 'fast-food', 'からあげ専門店。店内飲食とお持ち帰りのメニューがある。'),
  regionalChain('kairikiya', 'ラーメン魁力屋', 'noodles', 'ラーメン店。'),
  regionalChain('steak-gusto', 'ステーキガスト', 'yakiniku', 'ステーキとハンバーグの店。'),
  regionalChain('yuzuan', 'ゆず庵', 'washoku', '寿司・しゃぶしゃぶの食べ放題の店。'),
  regionalChain('popolamama', 'ポポラマーマ', 'italian', 'ゆであげ生パスタの店。'),
  regionalChain('aiya', '藍屋', 'washoku', 'そば・うどん、定食、丼のある和食レストラン。'),
  regionalChain('makino-udon', '牧のうどん', 'noodles', '福岡・佐賀・長崎中心の釜揚げうどんの店。'),
];

export const CHAINS: Chain[] = [...BASE_CHAINS, ...REGIONAL_CHAINS];



/**
 * チェーンslug→Chainオブジェクト の高速検索Map。
 */
export const CHAIN_BY_SLUG: ReadonlyMap<string, Chain> = new Map(
  CHAINS.map((c) => [c.slug, c]),
);

/**
 * 駅slug → その駅に実在を公式で確認できたチェーンのslug。
 *
 * lib/station-verified-stores.ts から作る。手書きの対応表は全484駅で48%が公式の店舗検索と
 * 食い違っていたので廃止した（2026-11-02。/data/restaurants・/data/wards・路線の集計が読んでいた）。
 * 直すときは台帳を直す。
 */
export const STATION_CHAIN_MAPPING: Record<string, string[]> = Object.fromEntries(
  Object.entries(STATION_VERIFIED_STORES).map(([slug, v]) => {
    const present = new Set(v.stores.map((s) => s.chain));
    return [slug, CHAINS.filter((c) => present.has(c.slug)).map((c) => c.slug)];
  }),
);

/**
 * チェーン付与ロジックが必要とする駅情報の最小形。
 * 東京・関西・神奈川・埼玉千葉の駅型はいずれもこの形を満たす。
 */
export type StationForChains = {
  slug: string;
  name: string;
  scale: 'terminal' | 'major' | 'minor';
};

/** 駅slug → 駅。23区外（関西・神奈川・埼玉千葉・地方都市）も含めた全駅を引ける。 */
const STATION_BY_SLUG: ReadonlyMap<string, StationForChains> = new Map(
  [
    ...TOKYO_STATIONS,
    ...KANSAI_STATIONS,
    ...KANAGAWA_STATIONS,
    ...SAICHI_STATIONS,
    ...REGIONAL_STATIONS,
  ].map((s) => [s.slug, s] as const),
);

/** 駅slug → 関西の駅かどうか。関東限定チェーンの除外に使う。 */
const KANSAI_STATION_SLUGS: ReadonlySet<string> = new Set(
  KANSAI_STATIONS.map((s) => s.slug),
);

/**
 * 関西には（ほぼ）出店していないチェーン。ubiquity 自動付与から除外する。
 *
 * 2026-08-12 に公式店舗一覧・店舗数集計で確認した実態：
 * - jonathan（ジョナサン）… 関東圏のみ。関西は0店。
 * - denny-s（デニーズ）… 大阪府7店のみ、京都・兵庫は0店（兵庫は撤退済み）。
 * - hidakaya（日高屋）… 首都圏＋茨城のみ。関西は0店。
 * - tenya（天丼てんや）… 大阪府4店のみ、京都・兵庫はほぼ無し。
 * - ichiban（魚べい）… 大阪府2店（寝屋川・東大阪）のみ。
 * - fujiya-restaurant（不二家レストラン）… 大阪府3店（豊中・茨木・東大阪）のみ。
 * - musashino-mori-coffee（むさしの森珈琲）… 関西は大阪1店・兵庫1店のみ。
 * - excelsior（エクセルシオールカフェ）… 大阪府4店のみで駅前の蓋然性が低い。
 *
 * 「府県内に数店ある」程度では「駅から徒歩5-10分圏内にある蓋然性が高い」とは言えないため、
 * 一律付与の対象からは外す。
 */
const KANTO_ONLY_CHAIN_SLUGS: ReadonlySet<string> = new Set([
  'jonathan',
  'denny-s',
  'hidakaya',
  'tenya',
  'ichiban',
  'fujiya-restaurant',
  'musashino-mori-coffee',
  'excelsior',
]);

/**
 * 明示マッピングを持たないが ubiquity 自動付与の対象にする駅slug。
 *
 * STATION_CHAIN_MAPPING は23区の駅だけを列挙しているため、大宮・新横浜・梅田のような
 * 23区外の駅は「チェーン店0店」のまま公開されていた（見出しでは「ファミレス・カフェ・
 * チェーン店…全項目チェックしました」と約束しているのに中身が空、という状態）。
 *
 * 対象は terminal / major の駅と、下記 URBAN_MINOR_STATION_SLUGS に挙げた市街地の minor 駅。
 * それ以外の minor（こどもの国・八景島・蹴上・万博記念公園・片瀬江ノ島など観光地/公園の駅）は
 * 定番チェーンが徒歩圏にある前提が成り立たないので対象外にする。
 */
const URBAN_MINOR_STATION_SLUGS: readonly string[] = [
  // 埼玉・千葉
  'kita-urawa', // 北浦和
  'nishi-kawaguchi', // 西川口
  // 神奈川（住宅地・市街地の駅。観光地の 片瀬江ノ島/八景島/こどもの国 は含めない）
  'mukogaoka-yuen', // 向ヶ丘遊園
  'yokodai', // 洋光台
  'yokohama-nakayama', // 中山
  'futako-shinchi', // 二子新地
  // 関西（オフィス街・商店街の駅。観光地/公園の 蹴上・万博記念公園・大阪城公園・
  // 枚方公園・トレードセンター前・計算科学センター・園部・宝ケ池・梅小路京都西・
  // 大阪港・須磨海浜公園 は含めない）
  'osaka-fukushima', // 福島
  'osaka-nakazakicho', // 中崎町
  'osaka-ogimachi', // 扇町
  'bentencho', // 弁天町
  'higobashi', // 肥後橋
  'ebisucho', // 恵美須町
  'shin-kanaoka', // 新金岡
  'kyoto-kitaoji', // 北大路
  'kyoto-kitayama', // 北山
  'rokujizo', // 六地蔵
  'kobe-rokko', // 六甲
  'kobe-okamoto', // 岡本
  'suma', // 須磨
];

const UBIQUITY_FALLBACK_STATION_SLUGS: ReadonlySet<string> = new Set([
  ...[...KANSAI_STATIONS, ...KANAGAWA_STATIONS, ...SAICHI_STATIONS]
    .filter((s) => s.scale === 'terminal' || s.scale === 'major')
    .map((s) => s.slug),
  ...URBAN_MINOR_STATION_SLUGS,
]);

/**
 * 指定駅slugの周辺チェーン店をChainオブジェクト配列で取得。
 *
 * @param stationSlug - 駅のslug（例: 'shibuya'）
 * @returns 該当駅周辺のチェーン店配列。マッピングも自動付与対象も無い駅は空配列。
 */
/**
 * 公式店舗検索で「徒歩10分圏に実在しない」ことを確認済みのチェーンを駅単位で除外する。
 * ubiquity の自動付与はキュレーション（実在保証なし）なので、実在を全数確認した駅では
 * 確認結果を優先する。確認日をコメントに残すこと。
 */
const STATION_CHAIN_EXCLUDE: Record<string, readonly string[]> = {
  // 2026-08-31 全24チェーンを公式店舗検索・公式APIで全数照合（大井町駅 徒歩10分圏）
  'oimachi': ['gusto', 'cocos', 'shabu-yo', 'royal-host', 'komeda', 'doutor', 'marugame', 'cocoichi', 'sushiro', 'hama-sushi', 'gyukaku', 'tenya'],
  // 2026-09-01 公式店舗検索で全数照合（北千住駅 徒歩10分圏）。
  // hama-sushi/cocos は1.1〜1.2kmで圏外。denny-s/royal-host は公式検索に到達できず未確認のため除外しない。
  'kita-senju': ['jonathan', 'sushiro', 'kura-sushi', 'cocoichi', 'excelsior', 'bamiyan', 'nakau', 'yayoiken', 'hama-sushi', 'cocos'],
  // 2026-09-01 公式店舗検索で照合（錦糸町駅 半径800m）。jonathan は菊川店が約1.2kmで圏外。
  // royal-host/ringer-hut は公式検索の引き方を確立できず未確認のため除外しない。
  'kinshicho': ['sushiro', 'kura-sushi', 'hama-sushi', 'cocos', 'jonathan'],
  // 2026-09-01 公式店舗検索で全数照合（武蔵小山駅 徒歩10分圏）。すべて陽性対照つきで0件を確認。
  'musashi-koyama': ['gusto', 'sushiro', 'subway', 'hama-sushi', 'denny-s', 'cocoichi', 'nakau', 'marugame', 'ootoya', 'yayoiken', 'gyukaku'],
  // 2026-09-01 公式店舗検索で三越前駅から徒歩10分圏を照合（日本橋）。すべて陽性対照つきで0件。
  'nihombashi': ['saizeriya', 'mos-burger', 'sukiya', 'bamiyan', 'jonathan', 'cocos', 'marugame', 'tenya', 'matsuya'],
};

export function getChainsForStation(stationSlug: string): Chain[] {
  // 公式店舗検索で全チェーンを照合済みの駅は、実在を確認できたチェーンだけを返す
  // （lib/station-verified-stores.ts）。一律付与・明示マッピングより照合結果を優先する。
  const verified = STATION_VERIFIED_STORES[stationSlug];
  if (verified) {
    const verifiedSlugs = new Set(verified.stores.map((s) => s.chain));
    return CHAINS.filter((c) => verifiedSlugs.has(c.slug));
  }
  const explicit = STATION_CHAIN_MAPPING[stationSlug];
  if (!explicit && !UBIQUITY_FALLBACK_STATION_SLUGS.has(stationSlug)) return [];
  // 明示マッピングに加え、ubiquity で全駅／主要駅に自動付与してランチ選択肢を底上げする。
  //  - 'common'     … ほぼどの駅周辺にもある定番チェーン → マッピング済み全駅に付与
  //  - 'major-only' … ターミナル・主要駅中心のチェーン → terminal/major 駅に付与
  // ※駅周辺の店舗有無は変動するため、サイト上は「事前確認推奨」の前提で表示する。
  const scale = STATION_BY_SLUG.get(stationSlug)?.scale;
  const isKansai = KANSAI_STATION_SLUGS.has(stationSlug);
  const slugs = new Set(explicit ?? []);
  for (const c of CHAINS) {
    if (c.ubiquity === 'common') {
      slugs.add(c.slug);
    } else if (
      c.ubiquity === 'major-only' &&
      (scale === 'terminal' || scale === 'major')
    ) {
      slugs.add(c.slug);
    }
  }
  const excluded = new Set(STATION_CHAIN_EXCLUDE[stationSlug] ?? []);
  return [...slugs]
    .filter((s) => !excluded.has(s))
    .filter((s) => !(isKansai && KANTO_ONLY_CHAIN_SLUGS.has(s)))
    .map((s) => CHAIN_BY_SLUG.get(s))
    .filter((c): c is Chain => c !== undefined);
}

/**
 * 指定駅slugの周辺チェーン店から、特定カテゴリのみを抽出。
 *
 * @param stationSlug - 駅のslug
 * @param category - フィルタするChainCategory
 */
export function getChainsForStationByCategory(
  stationSlug: string,
  category: ChainCategory,
): Chain[] {
  return getChainsForStation(stationSlug).filter((c) => c.category === category);
}

/**
 * 指定駅slugの周辺チェーン店から、子連れ条件でフィルタ。
 *
 * @param stationSlug - 駅のslug
 * @param opts - 子連れ条件（kidsMenu, babyChair, stroller等）
 */
export function getChainsForStationFiltered(
  stationSlug: string,
  opts: {
    kidsMenu?: boolean;
    babyChair?: boolean;
    privateRoom?: boolean;
    strollerGood?: boolean;
    babyFoodOk?: boolean;
    maxLunchPrice?: Chain['lunchPrice'];
  } = {},
): Chain[] {
  const priceOrder: Chain['lunchPrice'][] = ['〜800', '〜1,500', '〜2,500', '〜4,000', '4,000〜'];
  const maxIdx = opts.maxLunchPrice
    ? priceOrder.indexOf(opts.maxLunchPrice)
    : priceOrder.length - 1;

  return getChainsForStation(stationSlug).filter((c) => {
    if (opts.kidsMenu && !c.kidsMenu) return false;
    if (opts.babyChair && !c.babyChair) return false;
    if (opts.privateRoom && !c.privateRoom) return false;
    if (opts.strollerGood && c.stroller !== 'good') return false;
    if (opts.babyFoodOk && !c.babyFoodOk) return false;
    if (opts.maxLunchPrice && priceOrder.indexOf(c.lunchPrice) > maxIdx) return false;
    return true;
  });
}

/**
 * 指定駅slugから、ベビーカー入店◎のチェーンのみ取得（ヘルパー）。
 */
export function getStrollerFriendlyChains(stationSlug: string): Chain[] {
  return getChainsForStation(stationSlug).filter((c) => c.stroller === 'good');
}

/**
 * 駅情報を含めて取得するヘルパー。SEO/UIで駅情報と一緒に表示する用。
 *
 * 23区外（関西・神奈川・埼玉千葉）の駅も引ける。以前は TOKYO_STATIONS しか見ておらず、
 * 大宮・新横浜・梅田のような駅は null になって「チェーン店0店」で公開されていた。
 */
export function getStationWithChains(
  stationSlug: string,
): { station: StationForChains; chains: Chain[] } | null {
  const station = STATION_BY_SLUG.get(stationSlug);
  if (!station) return null;
  return {
    station,
    chains: getChainsForStation(stationSlug),
  };
}

/**
 * カテゴリの日本語表示名。
 */
export const CHAIN_CATEGORY_LABEL: Record<ChainCategory, string> = {
  'family-restaurant': 'ファミレス',
  'cafe': 'カフェ',
  'fast-food': 'ファストフード',
  'washoku': '和食',
  'italian': 'イタリアン',
  'chinese': '中華',
  'sushi': '回転寿司',
  'noodles': '麺類',
  'yakiniku': '焼肉・しゃぶしゃぶ',
  'curry': 'カレー',
  'gyudon': '牛丼',
  'bakery': 'パン',
  'mall-food': 'モール内・特殊',
};
