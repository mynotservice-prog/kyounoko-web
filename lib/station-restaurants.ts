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
  /** 店舗の特徴説明（80字以内） */
  description: string;
};

/**
 * このファイルのチェーン設備・駅マッピングデータを実質的に更新した日。
 * 駅ページの「この情報について」ブロックに表示される（GEO: AI検索が引用資格として
 * 鮮度・確認方法の明示を要求するため）。CHAINS / STATION_CHAIN_MAPPING を
 * 更新したら必ずこの日付も更新すること。
 */
export const STATION_CHAIN_DATA_UPDATED = '2026-08-31';

export const CHAINS: Chain[] = [
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
    description: 'ミラノ風ドリア300円台、お子様プレート・キッズチェア完備。広めの座席でベビーカーOK。',
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
    description: 'キッズメニュー充実、おもちゃ付きセット・ぬりえあり。ボックス席多くベビーカー横付け可。',
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
    description: 'すかいらーく系の落ち着いた雰囲気のファミレス。お子様メニュー・キッズチェアあり。',
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
    description: 'パンケーキ・キッズプレートが人気。ボックス席広めでベビーカー入店しやすい。',
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
    description: 'やや高めの落ち着いた家族向け。お子様セット・離乳食メニューあり。ターミナル駅中心。',
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
    description: '誕生日無料デザートサービスあり。キッズプレート・ぬりえも用意される子連れ向きファミレス。',
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
    description: 'すかいらーく系中華ファミレス。お子様ラーメン・餃子セットあり。ボックス席広め。',
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
    description: 'キッズドリンク（ミルク・ジュース）あり。多くの店舗にベビーチェア常備。',
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
    description: 'キッズメニューはないがミルクや軽食充実。ソファ席ありベビーカー横付けしやすい。',
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
    description: '価格安く便利だが店舗狭めの所多い。ベビーカーは店舗による。サンドイッチ・ミラノサンドあり。',
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
    description: 'ボックス席広く滞在しやすい。お子様プレート・モーニング・かき氷あり。郊外型多い。',
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
    description: 'ドトール系のやや上品なカフェ。パスタ・サンドイッチ・スイーツあり。主要ターミナル駅中心。',
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
    description: 'ハッピーセット定番、ベビーチェア・おむつ替え台ある店舗多数。プレイランド併設店も。',
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
    description: 'モスワイワイセット（おもちゃ付）あり。注文後着席方式で席確保しやすい。',
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
    description: 'お子様セット（KIDSパック）あり。ベビーチェア配備の店舗多い。',
  },
  {
    slug: 'lotteria',
    name: 'ロッテリア',
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
    description: 'お子様セット・絶品チーズバーガー人気。店舗数は減少傾向だが大型駅に残る。',
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
    description: '野菜たっぷりサンドが選べる、健康志向の家族に人気。キッズセットあり。',
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
    description: '小盛り・お子様セットあり。カウンター中心の店も多くベビーカーは店舗による。',
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
    description: '味噌汁無料の牛めし屋。キッズメニューはないがミニ牛めしあり。回転早い。',
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
    description: '牛丼チェーンで唯一お子様セット（おもちゃ付）が充実。ベビーチェア配備の店舗多い。',
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
    description: '辛さ・ご飯量カスタム可、お子様カレーあり。ベビーチェア配備の店舗多い。',
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
    description: '和定食中心、お子様膳あり。野菜豊富で離乳食卒業後の子にも好適。',
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
    description: 'ご飯おかわり自由の和定食チェーン。お子様メニューあり、ボックス席あり。',
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
    description: '餃子・チャーハン・ラーメンが人気。お子様セット用意の店舗も。混雑時は注意。',
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
    description: '回転寿司最大手、タッチパネル注文。ベビーカー席・キッズメニュー完備で家族層No.1人気。',
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
    description: 'ビッくらポン！景品システムが子供に人気。ボックス席広く家族向き。',
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
    description: '平日90円・休日100円の低価格寿司。郊外型多くファミリー席広い。',
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
    description: '元気寿司系、注文レーン直送方式で子供が楽しめる。子連れ家族に人気。',
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
    description: '釜揚げうどん・天ぷらが人気。キッズうどんあり。セルフ式だが席広めで家族OK。',
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
    description: 'ボックス席・個室あり、キッズプレート用意。ランチセットも子連れに人気。',
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
    description: 'すかいらーく系しゃぶしゃぶ食べ放題。小学生以下半額、未就学児無料の店舗多数。',
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
    description: 'スウェーデンミートボール・キッズメニュー充実。離乳食無料、キッズスペースあり。',
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
    description: '巨大ピザ・ホットドッグが安い。会員制倉庫店併設。23区内店舗は少ない。',
  },
  // ===== 拡充チェーン（v7 追加・全駅の選択肢底上げ）=====
  {
    slug: 'bikkuri-donkey', name: 'びっくりドンキー', category: 'family-restaurant',
    stroller: 'good', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true, kidsCutlery: true,
    stepFree: true, seatingType: ['box', 'table'], shareDish: true, strollerToSeat: true, allergenInfo: true,
    lunchPrice: '〜1,500', ubiquity: 'common',
    description: 'ハンバーグ専門ファミレス。木製ベビーチェア完備、ボックス席中心で子連れ定番。',
  },
  {
    slug: 'nakau', name: 'なか卯', category: 'gyudon',
    stroller: 'ok', kidsMenu: false, babyChair: false, privateRoom: false, babyFoodOk: true,
    seatingType: ['table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜800', ubiquity: 'common',
    description: '親子丼・うどんが看板。和風で取り分けしやすくミニサイズも。回転が速い。',
  },
  {
    slug: 'matsunoya', name: '松のや', category: 'washoku',
    stroller: 'ok', kidsMenu: false, babyChair: false, privateRoom: false, babyFoodOk: true,
    seatingType: ['table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜800', ubiquity: 'common',
    description: '松屋系のとんかつ専門。定食はご飯・味噌汁付きで取り分けやすい。券売機式。',
  },
  {
    slug: 'katsuya', name: 'かつや', category: 'washoku',
    stroller: 'ok', kidsMenu: false, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['box', 'table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜800', ubiquity: 'common',
    description: '手頃なとんかつ・カツ丼。ボックス席のある店舗が多く、ご飯ものを取り分けやすい。',
  },
  {
    slug: 'tenya', name: '天丼てんや', category: 'washoku',
    stroller: 'ok', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜800', ubiquity: 'common',
    description: 'リーズナブルな天丼・天ぷら。お子様天丼あり、駅ビル内店舗も多い。',
  },
  {
    slug: 'hanamaru-udon', name: 'はなまるうどん', category: 'noodles',
    stroller: 'ok', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true, kidsCutlery: true,
    seatingType: ['table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜800', ubiquity: 'common',
    description: 'セルフ式うどん。やわらかいうどんは取り分けに最適、こどもセットあり。',
  },
  {
    slug: 'ringer-hut', name: 'リンガーハット', category: 'noodles',
    stroller: 'ok', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['box', 'table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜1,500', ubiquity: 'common',
    description: '長崎ちゃんぽん・皿うどん。野菜たっぷりで取り分けやすく、お子様メニューも。',
  },
  {
    slug: 'hidakaya', name: '日高屋', category: 'chinese',
    stroller: 'limited', kidsMenu: false, babyChair: false, privateRoom: false, babyFoodOk: true,
    seatingType: ['table', 'counter'], shareDish: true,
    lunchPrice: '〜800', ubiquity: 'common',
    description: '駅前立地の中華そばチェーン。手頃で取り分けやすいが、小型店が多くベビーカーは要確認。',
  },
  {
    slug: 'osaka-ohsho', name: '大阪王将', category: 'chinese',
    stroller: 'ok', kidsMenu: false, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['box', 'table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜1,500', ubiquity: 'common',
    description: '餃子・炒飯の中華チェーン。ボックス席のある店舗が多く、取り分け前提のメニューが豊富。',
  },
  {
    slug: 'mister-donut', name: 'ミスタードーナツ', category: 'bakery',
    stroller: 'good', kidsMenu: false, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['box', 'table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜800', ubiquity: 'common',
    description: 'ドーナツに加え点心・麺類も。ベビーチェアありの店舗が多く、休憩利用にも。',
  },
  {
    slug: 'saint-marc-cafe', name: 'サンマルクカフェ', category: 'cafe',
    stroller: 'ok', kidsMenu: false, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['table', 'counter', 'terrace'],
    lunchPrice: '〜800', ubiquity: 'common',
    description: 'チョコクロが看板のカフェ。ベビーチェアありの店舗が多く、軽食・休憩に。',
  },
  {
    slug: 'veloce', name: 'カフェ・ベローチェ', category: 'cafe',
    stroller: 'limited', kidsMenu: false, babyChair: false, privateRoom: false, babyFoodOk: true,
    seatingType: ['table', 'counter'],
    lunchPrice: '〜800', ubiquity: 'common',
    description: '低価格のセルフカフェ。駅前小型店が多くベビーカーは要確認だが、短時間の休憩に便利。',
  },
  {
    slug: 'pronto', name: 'プロント', category: 'cafe',
    stroller: 'ok', kidsMenu: false, babyChair: false, privateRoom: false, babyFoodOk: true,
    seatingType: ['table', 'counter'],
    lunchPrice: '〜1,500', ubiquity: 'common',
    description: '昼はカフェ・パスタ。駅近に多く、軽いランチや休憩に使いやすい。',
  },
  {
    slug: 'kappa-sushi', name: 'かっぱ寿司', category: 'sushi',
    stroller: 'good', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true, kidsCutlery: true,
    stepFree: true, seatingType: ['box', 'table'], shareDish: true, strollerToSeat: true, allergenInfo: true,
    lunchPrice: '〜1,500', ubiquity: 'common',
    description: '回転寿司チェーン。ボックス席・ベビーチェア完備、サイドメニューも豊富で取り分けやすい。',
  },
  {
    slug: 'freshness-burger', name: 'フレッシュネスバーガー', category: 'fast-food',
    stroller: 'ok', kidsMenu: false, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['table', 'counter', 'terrace'], allergenInfo: true,
    lunchPrice: '〜1,500', ubiquity: 'common',
    description: '野菜多めのこだわりバーガー。落ち着いた雰囲気でベビーチェアありの店舗も。',
  },
  {
    slug: 'kushikatsu-tanaka', name: '串カツ田中', category: 'washoku',
    stroller: 'good', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['box', 'table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜2,500', ubiquity: 'common',
    description: '串カツ店だが家族客向け施策が手厚い。お子様メニュー・ベビーチェアあり、昼営業の店舗も。',
  },
  {
    slug: 'yakiniku-king', name: '焼肉きんぐ', category: 'yakiniku',
    stroller: 'good', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true, kidsCutlery: true,
    stepFree: true, seatingType: ['box', 'table'], shareDish: true, strollerToSeat: true, allergenInfo: true,
    lunchPrice: '〜2,500', ubiquity: 'major-only',
    description: '食べ放題焼肉。ボックス席・ベビーチェア完備、お子様メニューやデザートも充実。',
  },
  {
    slug: 'onyasai', name: 'しゃぶしゃぶ温野菜', category: 'yakiniku',
    stroller: 'ok', kidsMenu: true, babyChair: true, privateRoom: true, babyFoodOk: true,
    seatingType: ['box', 'table', 'zashiki'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜2,500', ubiquity: 'major-only',
    description: 'しゃぶしゃぶ食べ放題。個室・座敷のある店舗が多く、鍋を取り分けて食べやすい。',
  },
  {
    slug: 'bronco-billy', name: 'ブロンコビリー', category: 'family-restaurant',
    stroller: 'good', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true, kidsCutlery: true,
    stepFree: true, seatingType: ['box', 'table'], shareDish: true, strollerToSeat: true, allergenInfo: true,
    lunchPrice: '〜2,500', ubiquity: 'major-only',
    description: 'ステーキ・ハンバーグのファミレス。サラダバーが人気、ボックス席・ベビーチェア完備。',
  },
  {
    slug: 'musashino-mori-coffee', name: 'むさしの森珈琲', category: 'cafe',
    stroller: 'good', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true,
    stepFree: true, seatingType: ['box', 'table'], shareDish: true, strollerToSeat: true, allergenInfo: true,
    lunchPrice: '〜1,500', ubiquity: 'major-only',
    description: 'すかいらーく系の落ち着いたカフェ。ふんわりパンケーキが看板、ボックス席で子連れもくつろぎやすい。',
  },
  {
    slug: 'hoshino-coffee', name: '星乃珈琲店', category: 'cafe',
    stroller: 'ok', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['box', 'table'],
    lunchPrice: '〜1,500', ubiquity: 'major-only',
    description: '昭和喫茶風の落ち着いたカフェ。スフレパンケーキが名物、ソファ席のある店舗も多い。',
  },
  {
    slug: 'kamakura-pasta', name: '鎌倉パスタ', category: 'italian',
    stroller: 'ok', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['box', 'table'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜1,500', ubiquity: 'major-only',
    description: '生パスタと焼きたてパン食べ放題。お子様メニュー・ベビーチェアあり、ゆったり座席。',
  },
  {
    slug: 'goemon', name: '洋麺屋五右衛門', category: 'italian',
    stroller: 'ok', kidsMenu: false, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['table'], shareDish: true,
    lunchPrice: '〜1,500', ubiquity: 'major-only',
    description: '和風スパゲティの専門店。落ち着いた雰囲気でパスタは取り分けしやすい。駅ビル内店舗が多い。',
  },
  {
    slug: 'fujiya-restaurant', name: '不二家レストラン', category: 'family-restaurant',
    stroller: 'good', kidsMenu: true, babyChair: true, privateRoom: false, babyFoodOk: true, kidsCutlery: true,
    seatingType: ['box', 'table'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜1,500', ubiquity: 'major-only',
    description: 'ペコちゃんでおなじみのファミリーレストラン。お子様メニュー・ケーキが充実、ボックス席中心。',
  },
  {
    slug: 'tonkatsu-wako', name: 'とんかつ和幸', category: 'washoku',
    stroller: 'ok', kidsMenu: false, babyChair: true, privateRoom: false, babyFoodOk: true,
    seatingType: ['table', 'counter'], shareDish: true, allergenInfo: true,
    lunchPrice: '〜2,500', ubiquity: 'major-only',
    description: '駅ビル・デパートに多いとんかつ専門店。ご飯・キャベツ・味噌汁おかわり可で取り分けやすい。',
  },
];

/**
 * チェーンslug→Chainオブジェクト の高速検索Map。
 */
export const CHAIN_BY_SLUG: ReadonlyMap<string, Chain> = new Map(
  CHAINS.map((c) => [c.slug, c]),
);

/**
 * 駅slug→その駅周辺にあるチェーン店slug配列のマッピング。
 *
 * 各駅3〜25店舗程度（駅の規模により）。
 * - terminal駅: 約20-25チェーン
 * - major駅: 約10-12チェーン
 * - minor駅: 約4-8チェーン
 *
 * 注: あくまで「徒歩5-10分圏内に該当チェーンの店舗が存在する蓋然性が高い」キュレーション。
 * 個別店舗の正確な所在を保証するものではない。
 */
export const STATION_CHAIN_MAPPING: Record<string, string[]> = {
  'tokyo': ['saizeriya', 'gusto', 'starbucks', 'tully-coffee', 'doutor', 'mcdonalds', 'mos-burger', 'kfc', 'sukiya', 'matsuya', 'yoshinoya', 'sushiro', 'kura-sushi', 'cocoichi', 'marugame', 'gyukaku', 'ootoya', 'komeda', 'jonathan', 'denny-s', 'royal-host', 'excelsior', 'subway', 'ohsho'],
  'akihabara': ['saizeriya', 'gusto', 'starbucks', 'tully-coffee', 'doutor', 'mcdonalds', 'mos-burger', 'kfc', 'sukiya', 'matsuya', 'yoshinoya', 'sushiro', 'kura-sushi', 'cocoichi', 'marugame', 'gyukaku', 'ootoya', 'komeda', 'jonathan', 'excelsior'],
  'kanda': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'ootoya'],
  'yurakucho': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'yayoiken'],
  'iidabashi': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'ootoya'],
  'ichigaya': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'ootoya'],
  'yotsuya': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'ohsho'],
  'ochanomizu': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'cocoichi'],
  'shin-ochanomizu': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'awajicho': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger'],
  'ogawamachi': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'cocoichi'],
  'iwamotocho': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'otemachi': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'yayoiken'],
  'nijubashimae': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'hibiya': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'cocoichi'],
  'kasumigaseki': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'ohsho'],
  'kokkai-gijidomae': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'nagatacho': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'subway'],
  'akasaka-mitsuke': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'yayoiken'],
  'hanzomon': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger'],
  'kojimachi': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan'],
  'kudanshita': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'ohsho'],
  'jimbocho': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'ohsho'],
  'takebashi': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'suidobashi': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'yayoiken'],
  'ginza': ['saizeriya', 'gusto', 'starbucks', 'tully-coffee', 'doutor', 'mcdonalds', 'mos-burger', 'kfc', 'sukiya', 'matsuya', 'yoshinoya', 'sushiro', 'kura-sushi', 'cocoichi', 'marugame', 'gyukaku', 'ootoya', 'komeda', 'excelsior', 'royal-host'],
  'ginza-itchome': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan'],
  'higashi-ginza': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'cocoichi'],
  'nihombashi': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'ohsho'],
  'mitsukoshimae': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'ootoya'],
  'shintomicho': ['doutor', 'mcdonalds', 'matsuya', 'gusto'],
  'tsukiji': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'ootoya'],
  'tsukijishijo': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'tsukishima': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'cocoichi'],
  'kachidoki': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'cocoichi'],
  'kayabacho': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'ootoya'],
  'hatchobori': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'subway'],
  'suitengumae': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'cocoichi'],
  'ningyocho': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'subway'],
  'kodemmacho': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'bakuroyokoyama': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'cocoichi'],
  'bakurocho': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger'],
  'higashi-nihombashi': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'cocoichi', 'marugame'],
  'hamacho': ['doutor', 'mcdonalds', 'matsuya', 'gusto'],
  'shinagawa': ['saizeriya', 'gusto', 'starbucks', 'tully-coffee', 'doutor', 'mcdonalds', 'mos-burger', 'kfc', 'sukiya', 'matsuya', 'yoshinoya', 'sushiro', 'kura-sushi', 'cocoichi', 'marugame', 'gyukaku', 'ootoya', 'komeda', 'jonathan', 'excelsior', 'subway'],
  'shimbashi': ['saizeriya', 'gusto', 'starbucks', 'tully-coffee', 'doutor', 'mcdonalds', 'mos-burger', 'kfc', 'sukiya', 'matsuya', 'yoshinoya', 'sushiro', 'kura-sushi', 'cocoichi', 'marugame', 'gyukaku', 'ootoya', 'komeda', 'jonathan', 'excelsior', 'subway'],
  'tamachi': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'yayoiken'],
  'mita': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'yayoiken'],
  'hamamatsucho': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'cocoichi'],
  'daimon': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'yayoiken'],
  'shibakoen': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'cocoichi', 'marugame'],
  'onarimon': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'cocoichi'],
  'akabanebashi': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'roppongi': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'ohsho'],
  'roppongi-itchome': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'cocoichi', 'marugame'],
  'azabu-juban': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'subway'],
  'hiroo': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'cocoichi'],
  'akasaka': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'yayoiken'],
  'aoyama-itchome': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'yayoiken'],
  'gaiemmae': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'yayoiken'],
  'omotesando': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'ootoya'],
  'nogizaka': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'cocoichi', 'marugame'],
  'shirokanedai': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'cocoichi'],
  'shirokane-takanawa': ['doutor', 'mcdonalds', 'matsuya', 'gusto'],
  'takanawadai': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'takanawa-gateway': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan'],
  'sengakuji': ['doutor', 'mcdonalds', 'matsuya', 'gusto'],
  'shibaura-futo': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'cocoichi'],
  'odaiba-kaihinkoen': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'cocoichi'],
  'daiba': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto'],
  'tameike-sanno': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'subway'],
  'toranomon': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'subway'],
  'toranomon-hills': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'kamiyacho': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'hinode': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan'],
  'takeshiba': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  // IKEA新宿は2026年に営業終了（イケア・ジャパン公式、原宿と同時発表・渋谷に統合）
  'shinjuku': ['saizeriya', 'gusto', 'starbucks', 'tully-coffee', 'doutor', 'mcdonalds', 'mos-burger', 'kfc', 'sukiya', 'matsuya', 'yoshinoya', 'sushiro', 'kura-sushi', 'cocoichi', 'marugame', 'gyukaku', 'ootoya', 'komeda', 'jonathan', 'denny-s', 'royal-host', 'excelsior', 'subway', 'ohsho'],
  'shinjuku-sanchome': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'yayoiken'],
  'shinjuku-nishiguchi': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'ohsho'],
  'nishi-shinjuku': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'cocoichi'],
  'nishi-shinjuku-gochome': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'tochomae': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'ohsho'],
  'minami-shinjuku': ['doutor', 'mcdonalds', 'matsuya', 'gusto'],
  'shinjuku-gyoemmae': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'ohsho'],
  'yotsuya-sanchome': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'cocoichi'],
  'akebonobashi': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'cocoichi'],
  'wakamatsu-kawada': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'ushigome-yanagicho': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'cocoichi'],
  'ushigome-kagurazaka': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'cocoichi', 'marugame'],
  'kagurazaka': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'higashi-shinjuku': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'subway'],
  'shin-okubo': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'ohsho'],
  'okubo': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'subway'],
  'takadanobaba': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'cocoichi'],
  'shimo-ochiai': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger'],
  'nakai': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'cocoichi', 'marugame'],
  'ochiai': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'cocoichi'],
  'ochiai-minami-nagasaki': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto'],
  'waseda': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'subway'],
  'nishi-waseda': ['doutor', 'mcdonalds', 'matsuya', 'gusto'],
  'shinanomachi': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'cocoichi'],
  'sendagaya': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto'],
  'kokuritsu-kyogijo': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'cocoichi'],
  'seibi-shinjuku': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'cocoichi'],
  'kasuga': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'cocoichi', 'marugame'],
  'korakuen': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'hama-sushi', 'yayoiken'],
  'hongo-sanchome': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'shabu-yo', 'ootoya'],
  'yushima': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'cocoichi', 'marugame'],
  'nezu': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'cocoichi'],
  'sendagi': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan'],
  'hakusan': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'cocoichi'],
  'sengoku': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'myogadani': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'cocoichi', 'ichiban'],
  'edogawabashi': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan'],
  'gokokuji': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'cocoichi'],
  'shin-otsuka': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'todaimae': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'hon-komagome': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'cocoichi'],
  'ueno': ['saizeriya', 'gusto', 'starbucks', 'tully-coffee', 'doutor', 'mcdonalds', 'mos-burger', 'kfc', 'sukiya', 'matsuya', 'yoshinoya', 'sushiro', 'kura-sushi', 'cocoichi', 'marugame', 'gyukaku', 'ootoya', 'komeda', 'jonathan', 'excelsior', 'subway'],
  'okachimachi': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'yayoiken'],
  'ueno-hirokoji': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'yayoiken'],
  'naka-okachimachi': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'cocoichi'],
  'ueno-okachimachi': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'ootoya'],
  'shin-okachimachi': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'inaricho': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto'],
  'tawaramachi': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'asakusa': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'cocoichi'],
  'kuramae': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger'],
  'asakusabashi': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'subway'],
  'iriya': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'minowa': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'cocoichi'],
  'uguisudani': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'cocoichi'],
  'keisei-ueno': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'ohsho'],
  'kinshicho': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'cocoichi', 'ichiban'],
  'ryogoku': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'gyukaku', 'hama-sushi'],
  'oshiage': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'cocoichi', 'ichiban'],
  'tokyo-skytree': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'gyukaku', 'hama-sushi'],
  'honjo-azumabashi': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'kikukawa': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'higashi-azuma': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'sushiro', 'marugame'],
  'hikifune': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan', 'ichiban'],
  'keisei-hikifune': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'hama-sushi', 'marugame'],
  'yahiro': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'higashi-mukojima': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan', 'ichiban'],
  'kanegafuchi': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger', 'hama-sushi'],
  'omurai': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto', 'kura-sushi'],
  'monzen-nakacho': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'ootoya', 'cocoichi'],
  'kiba': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'cocoichi', 'ichiban'],
  'toyocho': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'hama-sushi', 'yayoiken'],
  'minami-sunamachi': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'shabu-yo', 'ootoya'],
  'kameido': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'shabu-yo', 'ootoya'],
  'kameido-suijin': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto', 'kura-sushi'],
  'morishita': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'hama-sushi', 'yayoiken'],
  'kiyosumi-shirakawa': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'gyukaku', 'hama-sushi'],
  'shinonome': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'sumiyoshi': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'cocoichi', 'ichiban'],
  'nishi-ojima': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'ojima': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'sushiro'],
  'higashi-ojima': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger', 'hama-sushi'],
  'shiomi': ['doutor', 'mcdonalds', 'matsuya', 'gusto', 'kura-sushi'],
  'shin-kiba': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'ichiban', 'gyukaku'],
  'toyosu': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'ootoya', 'cocoichi'],
  'tatsumi': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan', 'ichiban', 'marugame'],
  'shijomae': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'shin-toyosu': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'hama-sushi', 'marugame'],
  'ariake': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'ootoya', 'cocoichi'],
  'ariake-tennis-no-mori': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'kura-sushi'],
  'kokusai-tenjijo': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'ootoya', 'cocoichi'],
  'tokyo-big-sight': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto', 'kura-sushi', 'marugame', 'gyukaku'],
  'aomi': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger', 'hama-sushi'],
  'telecom-center': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'ichiban'],
  'tokyo-teleport': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'yayoiken', 'shabu-yo'],
  'fune-no-kagakukan': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'cocoichi'],
  'tokyo-international-cruise': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan'],
  'etchujima': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'hama-sushi'],
  'osaki': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'cocoichi'],
  'gotanda': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'subway'],
  'meguro': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'cocoichi'],
  'shinagawa-seaside': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger'],
  'tennozu-isle': ['doutor', 'mcdonalds', 'matsuya', 'gusto'],
  // 2026-08-31 各チェーン公式店舗検索で全数確認済み（かつての doutor/komeda/marugame/cocoichi は
  // 徒歩10分圏に実在せず削除。jonathan は鮫洲店・徒歩10分強の境界）。
  'oimachi': ['saizeriya', 'starbucks', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'sukiya', 'jonathan', 'denny-s', 'bamiyan', 'kura-sushi', 'kfc', 'onyasai', 'ootoya', 'hidakaya', 'ringer-hut', 'kamakura-pasta', 'goemon', 'saint-marc-cafe', 'tully-coffee', 'mister-donut'],
  'shimo-shimmei': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto'],
  'togoshi-koen': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'cocoichi'],
  'togoshi': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'cocoichi'],
  'togoshi-ginza': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'cocoichi'],
  'nakanobu': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan'],
  'ebara-machi': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger'],
  'hatanodai': ['doutor', 'mcdonalds', 'matsuya', 'gusto'],
  'kita-shinagawa': ['doutor', 'mcdonalds', 'matsuya', 'gusto'],
  'shimbamba': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'aomono-yokocho': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'cocoichi'],
  'samezu': ['doutor', 'mcdonalds', 'matsuya', 'gusto'],
  'tachiaigawa': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan'],
  'omori-kaigan': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'ebara-nakanobu': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan'],
  'fudomae': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto'],
  'musashi-koyama': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'subway'],
  'oi-keibajo-mae': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'cocoichi'],
  'naka-meguro': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'ootoya'],
  'yutenji': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'gakugei-daigaku': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'subway'],
  'toritsu-daigaku': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto'],
  'jiyugaoka': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'subway'],
  'midorigaoka': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan'],
  'ookayama': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger'],
  'senzoku': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'cocoichi'],
  'nishi-koyama': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'komaba-todaimae': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'cocoichi', 'marugame'],
  'omori': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'cocoichi'],
  'kamata': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'ohsho'],
  'keikyu-kamata': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'ootoya'],
  'umeyashiki': ['doutor', 'mcdonalds', 'matsuya', 'gusto'],
  'omori-machi': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto'],
  'heiwajima': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan'],
  'rokugo-dote': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'zoshiki': ['doutor', 'mcdonalds', 'matsuya', 'gusto'],
  'kojiya': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan'],
  'otorii': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'anamori-inari': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan'],
  'tenkubashi': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'haneda-airport-t1': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'ohsho'],
  'haneda-airport-t2': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'subway'],
  'haneda-airport-t3': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'cocoichi'],
  'shin-seibijo': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'seibijo': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'cocoichi'],
  'showajima': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'cocoichi'],
  'ryutsu-center': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'cocoichi'],
  'ikegami': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan'],
  'hasunuma': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'chidoricho': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'ontakesan': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'kugahara': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'ishikawadai': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan'],
  'yukigaya-otsuka': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'denenchofu': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'cocoichi'],
  'tamagawa': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'cocoichi'],
  'numabe': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'unoki': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger'],
  'shimo-maruko': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'musashi-nitta': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan'],
  'yaguchi-no-watashi': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger'],
  'nishi-magome': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'magome': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'cocoichi'],
  'oimachi-line-okusawa': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'ichiban'],
  'shimokitazawa': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'ichiban', 'gyukaku'],
  'higashi-kitazawa': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'hama-sushi', 'gyukaku'],
  'setagaya-daita': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'ichiban', 'gyukaku'],
  'umegaoka': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger', 'hama-sushi'],
  'gotokuji': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'sushiro'],
  'kyodo': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'ichiban', 'gyukaku'],
  'chitose-funabashi': ['doutor', 'mcdonalds', 'matsuya', 'gusto', 'kura-sushi'],
  'soshigaya-okura': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan', 'ichiban'],
  'seijogakuen-mae': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'yayoiken', 'shabu-yo'],
  'kitami': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'ichiban'],
  'sangenjaya': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'gyukaku', 'hama-sushi'],
  'komazawa-daigaku': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'yayoiken', 'shabu-yo'],
  'sakura-shimmachi': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan', 'ichiban'],
  'yoga': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'ootoya', 'cocoichi'],
  'futako-tamagawa': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'ichiban', 'gyukaku'],
  'kaminoge': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'ichiban'],
  'todoroki': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan', 'ichiban', 'marugame', 'gyukaku'],
  'oyamadai': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'kura-sushi'],
  'kuhonbutsu': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'nishi-taishido': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'kura-sushi'],
  'wakabayashi': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto', 'kura-sushi'],
  'shoin-jinjamae': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto', 'kura-sushi', 'gyukaku'],
  'setagaya': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan', 'ichiban', 'gyukaku'],
  'kamimachi': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'miyanosaka': ['doutor', 'mcdonalds', 'matsuya', 'gusto', 'kura-sushi'],
  'yamashita': ['doutor', 'mcdonalds', 'matsuya', 'gusto', 'kura-sushi'],
  'matsubara': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'sushiro', 'marugame'],
  'shimo-takaido': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger', 'hama-sushi'],
  'sakurajosui': ['doutor', 'mcdonalds', 'matsuya', 'gusto', 'kura-sushi'],
  'kami-kitazawa': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'ichiban', 'gyukaku'],
  'hachimanyama': ['doutor', 'mcdonalds', 'matsuya', 'gusto', 'kura-sushi'],
  'roka-koen': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'ichiban', 'gyukaku'],
  'chitose-karasuyama': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'ootoya', 'cocoichi'],
  'shindaita': ['doutor', 'mcdonalds', 'matsuya', 'gusto', 'kura-sushi'],
  'higashi-matsubara': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger', 'hama-sushi'],
  'meidaimae': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'gyukaku', 'hama-sushi'],
  'ikenoue': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'shibuya': ['saizeriya', 'gusto', 'starbucks', 'tully-coffee', 'doutor', 'mcdonalds', 'mos-burger', 'kfc', 'sukiya', 'matsuya', 'yoshinoya', 'sushiro', 'kura-sushi', 'cocoichi', 'marugame', 'gyukaku', 'ootoya', 'komeda', 'jonathan', 'denny-s', 'royal-host', 'excelsior', 'subway', 'ohsho', 'ikea-restaurant'],
  // IKEA原宿は2026-02-08営業終了（イケア・ジャパン公式、渋谷に統合）。ジョナサン原宿店は公式店舗ページ404（2026-08-28確認）
  'harajuku': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'marugame', 'subway'],
  'meiji-jingumae': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'subway'],
  'yoyogi': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'yayoiken'],
  'yoyogi-koen': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'ootoya'],
  'yoyogi-uehara': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'yayoiken'],
  'yoyogi-hachiman': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'cocoichi'],
  'sangubashi': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto'],
  'hatsudai': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan'],
  'hatagaya': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'sasazuka': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'yayoiken'],
  'shinsen': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'ebisu': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'ootoya'],
  'daikanyama': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'cocoichi'],
  'kita-sando': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan'],
  'nakano': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'yayoiken'],
  'higashi-nakano': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'cocoichi'],
  'nakano-fujimicho': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'cocoichi'],
  'nakano-shimbashi': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'cocoichi'],
  'nakano-sakaue': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'ootoya'],
  'shin-nakano': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan'],
  'honancho': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'hama-sushi'],
  'numabukuro': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto'],
  'arai-yakushimae': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan'],
  'saginomiya': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto'],
  'nogata': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger'],
  'toritsu-kasei': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'shin-egota': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan'],
  'koenji': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'hama-sushi', 'yayoiken'],
  'asagaya': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'yayoiken', 'shabu-yo'],
  'ogikubo': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'hama-sushi', 'yayoiken'],
  'nishi-ogikubo': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'yayoiken', 'shabu-yo'],
  'minami-asagaya': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'ichiban', 'gyukaku'],
  'shin-koenji': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'ichiban'],
  'higashi-koenji': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger', 'hama-sushi'],
  'iogi': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'kami-igusa': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro', 'marugame'],
  'shimo-igusa': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger', 'hama-sushi'],
  'eifukucho': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'ichiban'],
  'nishi-eifuku': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'kura-sushi'],
  'hamadayama': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'takaido': ['doutor', 'mcdonalds', 'matsuya', 'gusto', 'kura-sushi'],
  'fujimigaoka': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan', 'ichiban'],
  'kugayama': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'ikebukuro': ['saizeriya', 'gusto', 'starbucks', 'tully-coffee', 'doutor', 'mcdonalds', 'mos-burger', 'kfc', 'sukiya', 'matsuya', 'yoshinoya', 'sushiro', 'kura-sushi', 'cocoichi', 'marugame', 'gyukaku', 'ootoya', 'komeda', 'jonathan', 'denny-s', 'royal-host', 'excelsior', 'subway', 'ohsho'],
  'mejiro': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'ootoya'],
  'otsuka': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'ohsho'],
  'sugamo': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'yayoiken'],
  'komagome': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'ohsho'],
  'higashi-ikebukuro': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'cocoichi'],
  'kanamecho': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan'],
  'senkawa': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'kita-ikebukuro': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan'],
  'shimo-itabashi': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger'],
  'shiinamachi': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger'],
  'higashi-nagasaki': ['doutor', 'mcdonalds', 'matsuya', 'gusto'],
  'zoshigaya': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'cocoichi'],
  'mukohara': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'kishibojinmae': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto'],
  'gakushuin-shita': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'cocoichi'],
  'omokagebashi': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger'],
  'waseda-toden': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'cocoichi', 'marugame'],
  'higashi-ikebukuro-yonchome': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'koshinzuka': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'cocoichi'],
  'shin-koshinzuka': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'sakaecho': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'ichiban'],
  'akabane': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'gyukaku', 'hama-sushi'],
  'higashi-jujo': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'hama-sushi', 'gyukaku'],
  'oji': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'gyukaku', 'hama-sushi'],
  'kami-nakazato': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'sushiro', 'marugame'],
  'jujo': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'yayoiken', 'shabu-yo'],
  'kita-akabane': ['doutor', 'mcdonalds', 'matsuya', 'gusto', 'kura-sushi'],
  'akabane-iwabuchi': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'gyukaku', 'hama-sushi'],
  'shimo': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'oji-kamiya': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan', 'ichiban'],
  'nishigahara': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan', 'ichiban'],
  'tabata': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'ootoya', 'cocoichi'],
  'kajiwara': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger', 'hama-sushi'],
  'nippori': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'yayoiken', 'shabu-yo'],
  'nishi-nippori': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'shabu-yo', 'ootoya'],
  'mikawashima': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'sushiro'],
  'minami-senju': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'ichiban', 'gyukaku'],
  'minowabashi': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'hama-sushi', 'marugame'],
  'machiya': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'ichiban', 'gyukaku'],
  'machiya-ekimae': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto', 'kura-sushi'],
  'arakawa-kuyakushomae': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'sushiro'],
  'arakawa-nichome': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'sushiro', 'gyukaku'],
  'arakawa-shakomae': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'hama-sushi'],
  'arakawa-yuenchi-mae': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger', 'hama-sushi'],
  'arakawa-itchumae': ['doutor', 'mcdonalds', 'matsuya', 'gusto', 'kura-sushi'],
  'higashi-ogu-sanchome': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro', 'marugame'],
  'kumano-mae': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan', 'ichiban'],
  'akado-shogakko-mae': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'sushiro', 'gyukaku'],
  'odai': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto', 'kura-sushi', 'gyukaku'],
  'itabashi': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'ichiban', 'gyukaku'],
  'itabashi-kuyakushomae': ['doutor', 'mcdonalds', 'matsuya', 'gusto', 'kura-sushi', 'marugame'],
  'itabashi-honcho': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'kura-sushi'],
  'motohasunuma': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto', 'kura-sushi'],
  'shimura-sakaue': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'sushiro', 'marugame'],
  'shimura-sanchome': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro', 'gyukaku'],
  'hasune': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro', 'gyukaku'],
  'nishidai': ['doutor', 'mcdonalds', 'matsuya', 'gusto', 'kura-sushi'],
  'takashimadaira': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'ichiban', 'gyukaku'],
  'shin-takashimadaira': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan', 'ichiban', 'gyukaku'],
  'nishi-takashimadaira': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro', 'gyukaku'],
  'naka-itabashi': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'kura-sushi'],
  'tokiwadai': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'ootoya', 'cocoichi'],
  'kami-itabashi': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'ootoya', 'cocoichi'],
  'tobu-nerima': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'hama-sushi', 'yayoiken'],
  'shimo-akatsuka': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger', 'hama-sushi', 'gyukaku'],
  'narimasu': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'hama-sushi', 'yayoiken'],
  'chikatetsu-narimasu': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'ootoya', 'cocoichi'],
  'chikatetsu-akatsuka': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan', 'ichiban', 'marugame'],
  'shin-itabashi': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro', 'gyukaku'],
  'nerima': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'yayoiken', 'shabu-yo'],
  'toshimaen': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'nerima-kasugacho': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan', 'ichiban', 'gyukaku'],
  'hikarigaoka': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'yayoiken', 'shabu-yo'],
  'shakujii-koen': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'gyukaku', 'hama-sushi'],
  'oizumi-gakuen': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'ootoya', 'cocoichi'],
  'sakuradai': ['doutor', 'mcdonalds', 'matsuya', 'gusto', 'kura-sushi'],
  'ekoda': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'ootoya', 'cocoichi'],
  'fujimidai': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger', 'hama-sushi'],
  'nerima-takanodai': ['doutor', 'mcdonalds', 'matsuya', 'gusto', 'kura-sushi'],
  'kami-shakujii': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'hama-sushi', 'yayoiken'],
  'musashi-seki': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan', 'ichiban', 'marugame'],
  'nakamurabashi': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan', 'ichiban'],
  'kita-senju': ['saizeriya', 'gusto', 'starbucks', 'tully-coffee', 'doutor', 'mcdonalds', 'mos-burger', 'kfc', 'sukiya', 'matsuya', 'yoshinoya', 'sushiro', 'kura-sushi', 'cocoichi', 'marugame', 'gyukaku', 'ootoya', 'komeda', 'jonathan', 'excelsior', 'subway'],
  'ayase': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'yayoiken', 'shabu-yo'],
  'kita-ayase': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto', 'kura-sushi', 'gyukaku'],
  'gotanno': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger', 'hama-sushi'],
  'umejima': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'sushiro'],
  'nishiarai': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'gyukaku', 'hama-sushi'],
  'daishimae': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'kura-sushi'],
  'takenotsuka': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'ichiban', 'gyukaku'],
  'kosuge': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'hama-sushi'],
  'horikiri': ['doutor', 'mcdonalds', 'matsuya', 'gusto', 'kura-sushi', 'marugame'],
  'toneri': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'kura-sushi'],
  'toneri-koen': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'ichiban'],
  'minumadai-shinsuikoen': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger', 'hama-sushi'],
  'yazaike': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'hama-sushi', 'marugame'],
  'kohoku': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'kura-sushi'],
  'nishiarai-daishi-nishi': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan', 'ichiban'],
  'adachi-odai': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro', 'marugame'],
  'oji-shinden': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'ushida': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger', 'hama-sushi'],
  'keisei-sekiya': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto', 'kura-sushi', 'marugame'],
  'horikiri-keisei': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'kameari': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'shabu-yo', 'ootoya'],
  'kanamachi': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'cocoichi', 'ichiban'],
  'keisei-kanamachi': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'shibamata': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger', 'hama-sushi', 'gyukaku'],
  'keisei-takasago': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'hama-sushi', 'yayoiken'],
  'aoto': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'cocoichi', 'ichiban'],
  'keisei-tateishi': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger', 'hama-sushi'],
  'yotsugi': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'ohanajaya': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro', 'marugame'],
  'shin-koiwa': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'hama-sushi', 'yayoiken'],
  'koiwa': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'gyukaku', 'hama-sushi'],
  'keisei-koiwa': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'hama-sushi', 'gyukaku'],
  'edogawa': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro', 'gyukaku'],
  'shinozaki': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'mizue': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger', 'hama-sushi'],
  'ichinoe': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'tully-coffee', 'gusto', 'sushiro', 'gyukaku', 'hama-sushi'],
  'funabori': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'gyukaku', 'hama-sushi'],
  'kasai': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'hama-sushi', 'yayoiken'],
  'nishi-kasai': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'yayoiken', 'shabu-yo'],
  'kasai-rinkai-koen': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'ootoya', 'cocoichi'],
  'oji-ekimae': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'ichiban', 'gyukaku'],
  'asukayama': ['doutor', 'mcdonalds', 'sukiya', 'gusto', 'tully-coffee', 'kura-sushi'],
  'takinogawa-itchome': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'nishigahara-yonchome': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger', 'hama-sushi'],
  'sugamo-shinden': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger'],
  'otsuka-ekimae': ['starbucks', 'mcdonalds', 'yoshinoya', 'saizeriya', 'mos-burger', 'komeda', 'marugame'],
  'nishi-sugamo': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'cocoichi', 'marugame'],
  'kotake-mukaihara': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'excelsior', 'bamiyan', 'kura-sushi', 'gyukaku', 'hama-sushi'],
  'shin-sakuradai': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'sushiro', 'gyukaku'],
  'osaki-hirokoji': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'cocoichi'],
  'aoi': ['doutor', 'mcdonalds', 'matsuya', 'gusto', 'kura-sushi'],
  'rokucho': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan', 'ichiban', 'gyukaku'],
  'senju-ohashi': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'hama-sushi', 'marugame'],
  'shin-mikawashima': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan', 'ichiban'],
  'daitabashi': ['starbucks', 'mcdonalds', 'yoshinoya', 'jonathan', 'mos-burger', 'hama-sushi'],
  'shinsen-shinjuku': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'sukiya', 'matsuya', 'tully-coffee', 'gusto', 'sushiro', 'ootoya'],
  'oyama': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'komeda', 'jonathan', 'marugame', 'hama-sushi', 'yayoiken'],
  'hikawadai': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan', 'ichiban', 'gyukaku'],
  'heiwadai': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'sushiro'],
  'sakuradamon': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger'],
  'kita-senzoku': ['doutor', 'mcdonalds', 'yoshinoya', 'gusto'],
  'ikejiri-ohashi': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'yoshinoya', 'sukiya', 'excelsior', 'bamiyan', 'kura-sushi', 'hama-sushi', 'yayoiken'],
  'nagahara': ['doutor', 'mcdonalds', 'sukiya', 'bamiyan', 'tully-coffee', 'cocoichi'],
  'senzoku-ike': ['doutor', 'mcdonalds', 'matsuya', 'gusto'],
  'takaracho': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'cocoichi'],
  'uchi-saiwaicho': ['starbucks', 'mcdonalds', 'sukiya', 'jonathan', 'mos-burger', 'tully-coffee', 'cocoichi'],
  'shiodome': ['saizeriya', 'starbucks', 'doutor', 'mcdonalds', 'mos-burger', 'matsuya', 'yoshinoya', 'komeda', 'jonathan', 'marugame', 'ootoya'],
  'takanosuke': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger', 'hama-sushi', 'gyukaku'],
  'arakawa-nanachome': ['doutor', 'mcdonalds', 'matsuya', 'bamiyan', 'ichiban'],
  'machiya-nichome': ['starbucks', 'mcdonalds', 'matsuya', 'saizeriya', 'mos-burger', 'komeda', 'sushiro'],
  'miyanomae': ['starbucks', 'mcdonalds', 'sukiya', 'saizeriya', 'mos-burger', 'tully-coffee', 'sushiro', 'marugame'],
  'toden-zoshigaya': ['starbucks', 'mcdonalds', 'matsuya', 'jonathan', 'mos-burger'],
  'shin-nihombashi': ['doutor', 'mcdonalds', 'matsuya', 'gusto'],
  'oku': ['doutor', 'mcdonalds', 'yoshinoya', 'bamiyan', 'ichiban', 'marugame'],
  'shin-shibamata': ['doutor', 'mcdonalds', 'matsuya', 'gusto', 'kura-sushi'],
};

/**
 * チェーン付与ロジックが必要とする駅情報の最小形。
 * 東京・関西・神奈川・埼玉千葉の駅型はいずれもこの形を満たす。
 */
export type StationForChains = {
  slug: string;
  name: string;
  scale: 'terminal' | 'major' | 'minor';
};

/** 駅slug → 駅。23区外（関西・神奈川・埼玉千葉）も含めた全駅を引ける。 */
const STATION_BY_SLUG: ReadonlyMap<string, StationForChains> = new Map(
  [
    ...TOKYO_STATIONS,
    ...KANSAI_STATIONS,
    ...KANAGAWA_STATIONS,
    ...SAICHI_STATIONS,
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
};

export function getChainsForStation(stationSlug: string): Chain[] {
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
 * 全駅×チェーンの総レコード数（参考値）。
 */
export const TOTAL_STATION_CHAIN_RECORDS: number = Object.values(STATION_CHAIN_MAPPING).reduce(
  (sum, arr) => sum + arr.length,
  0,
);

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
