/**
 * 駅別 個人店マッピング — chunk-29（東京・子連れランチ拡充）
 *
 * - 各駅ごとに Web 調査で実在を確認した実名の個人店のみを掲載
 * - 子連れ向き設備（ベビーカー・座敷・おむつ替え等）は公開情報・取材記事ベースの推定。
 *   最終的には店舗確認前提。
 * - 食べログ点数等の数値スコアは引用していない
 * - 他 chunk と同じ駅 slug は index.ts の mergeIndieMaps で結合される
 */

import type { StationIndieMap } from './types';

export const CHUNK_29: StationIndieMap = {
  // ===========================================================
  // 新御茶ノ水（千代田区）
  // ===========================================================
  'shin-ochanomizu': [
    {
      name: 'レストラン1899 御茶ノ水',
      genre: 'washoku',
      area: '新御茶ノ水駅から徒歩4分（ホテル龍名館お茶の水本店1階）',
      description:
        'ホテル龍名館1階の和食ダイニング。ベビーカーのまま入店でき、ホテル内に授乳室がある。お茶を使った料理が名物で、赤ちゃん連れでも落ち着いてランチが楽しめる。',
      strollerOk: true,
      seatingType: ['table'],
      nursingRoom: true,
      bringBabyFood: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 淡路町（千代田区）
  // ===========================================================
  'awajicho': [
    {
      name: 'trattoria Little Marco（トラットリア リトルマルコ）',
      genre: 'italian',
      area: '淡路町駅A3出口から徒歩1分（小川町駅A3出口からも徒歩1分）',
      description:
        '友泉淡路町ビル1階のイタリアン。窯焼きピッツァが名物で、天井が高くガラス面の広い開放的な店内。通路にゆとりがあり、ランチセットは1,000円台からとリーズナブル。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 小川町（千代田区）
  // ===========================================================
  'ogawamachi': [
    {
      name: 'trattoria Little Marco（トラットリア リトルマルコ）',
      genre: 'italian',
      area: '小川町駅A3出口から徒歩1分',
      description:
        '小川町駅・淡路町駅から各徒歩1分のイタリアン。窯焼きピッツァや旬の食材のパスタが楽しめる。天井が高く開放感があり、4品セットのランチが手頃で子連れでも入りやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 二重橋前（千代田区・丸の内）
  // ===========================================================
  'nijubashimae': [
    {
      name: 'A16 TOKYO',
      genre: 'italian',
      area: '二重橋前駅から徒歩3分（丸の内ブリックスクエア1階）',
      description:
        '米サンフランシスコ発祥の南イタリアン。店内が広めでベビーカーが入りやすく、テラス席もあり、子連れ客がちらほら見られる。中庭を眺めながらゆったりランチができる。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      shareDish: true,
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
    {
      name: '青ゆず 寅',
      genre: 'washoku',
      area: '二重橋前駅から徒歩3分（丸ビル6階）',
      description:
        '丸ビル6階の魚介料理店。東京駅を見下ろす掘りごたつの個室があり、ベビーカーでの入店も可能。落ち着いた和の空間でママ会にも使いやすい。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 半蔵門（千代田区）
  // ===========================================================
  'hanzomon': [
    {
      name: '栄翔 麹町店',
      genre: 'chinese',
      area: '半蔵門駅直結（麹町2-7-1）',
      description:
        '半蔵門駅直結の中華料理店。広いテーブル席でベビーカーのまま入店でき、お子様メニューや離乳食の持ち込みもOK。円卓の個室があり、子連れママ会にも使いやすい。',
      strollerOk: true,
      kidsMenu: true,
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      bringBabyFood: true,
      stepFree: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 竹橋（千代田区）
  // ===========================================================
  'takebashi': [
    {
      name: 'グランドキッチン（パレスホテル東京）',
      genre: 'yoshoku',
      area: '竹橋駅から徒歩5分（大手町駅C13b直結）',
      description:
        'パレスホテル東京1階のオールデイダイニング。段差がなくベビーカー入店OK、ベルト付きハイチェアの貸出や離乳食持ち込みもOK。和洋折衷のメニューで子連れランチにも使える。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table', 'terrace'],
      diaperChangingTable: true,
      bringBabyFood: true,
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜5,000円',
    },
  ],

  // ===========================================================
  // 銀座一丁目（中央区）
  // ===========================================================
  'ginza-itchome': [
    {
      name: 'OSTERIA BARABABAO 銀座（オステリア バラバーバオ）',
      genre: 'italian',
      area: '銀座一丁目駅から徒歩1分',
      description:
        '銀座一丁目駅すぐのヴェネツィア料理店。店内はゆったり広めでベビーカー入店OK、キッズチェアの用意もあり、子連れランチに使いやすいイタリアン。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
    {
      name: 'メリプリンチペッサ 銀座店',
      genre: 'italian',
      area: '銀座一丁目駅6番出口から徒歩1分',
      description:
        '銀座一丁目駅6番出口すぐのイタリアン。店内にはベビーカーのまま入店でき、お子様用メニューもあり、子連れのランチ・ママ会に使いやすい。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 新富町（中央区）
  // ===========================================================
  'shintomicho': [
    {
      name: 'エルプラス（L+）',
      genre: 'italian',
      area: '新富町駅から徒歩2分',
      description:
        '新富町駅徒歩2分のイタリアン。ベビーカー入店OK、離乳食の持ち込み・電子レンジでの温めにも対応してくれ、キッズメニューも用意。赤ちゃん連れの外食デビューに向く。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      bringBabyFood: true,
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 築地市場（中央区）
  // ===========================================================
  'tsukijishijo': [
    {
      name: '日本料理 魚月',
      genre: 'washoku',
      area: '築地市場駅から徒歩約3分',
      description:
        '潜水艦のような個性的な内装で子どもも喜ぶ和食店。個室があり予約可能で、ランチは1,100円からとお手頃。築地市場駅からエレベーターでアクセスでき、ベビーカーでも安心。',
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '築地テラス',
      genre: 'cafe',
      area: '築地市場駅から徒歩約5分（築地本願寺前）',
      description:
        '築地本願寺を眺める1〜2階のカフェダイニング。大きな窓から日差しが入り、全席禁煙でテラス席もあり、ベビーカーでの入店もOK。子連れランチやお参り後の休憩に。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 水天宮前（中央区）
  // ===========================================================
  'suitengumae': [
    {
      name: '龍盛菜館 水天宮店',
      genre: 'chinese',
      area: '水天宮前駅5番出口から徒歩2分',
      description:
        '円卓のテーブル席や半個室席を備えた中華料理店。席数が多く賑やかな雰囲気で、ベビーカーのまま入店でき、子連れランチでも気兼ねなく利用できる。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '中国料理 桂花苑（ロイヤルパークホテル内）',
      genre: 'chinese',
      area: '水天宮前駅直結（ロイヤルパークホテル）',
      description:
        '水天宮前駅直結のホテル内中華。ランチタイムは乳児からOK、離乳食の持ち込み可、ホテル内に授乳室・おむつ替え台あり。個室も利用でき、赤ちゃん連れに優しい。',
      privateRoom: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      nursingRoom: true,
      bringBabyFood: true,
      shareDish: true,
      priceLunch: '〜3,500円',
    },
    {
      name: '萬福楼',
      genre: 'chinese',
      area: '水天宮前駅から徒歩約3分',
      description:
        '中華の老舗的なお店。子ども用の椅子や食器が用意され、ベビーカーでの入店も可能。10名対応のテーブル個室や掘りごたつの個室もあり、ファミリーランチにも。',
      privateRoom: true,
      kidsChair: true,
      seatingType: ['zashiki', 'table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 浜町（中央区）
  // ===========================================================
  'hamacho': [
    {
      name: '炭火焼鳥 日本橋 逢鳥',
      genre: 'washoku',
      area: '浜町駅から徒歩1分',
      description:
        '浜町駅すぐの炭火焼鳥店。2階が全室お座敷の個室で、畳と障子のくつろぎ空間。掘りごたつではないのでハイハイ期の赤ちゃんでも安心。ランチは子ども向けメニューも。',
      privateRoom: true,
      kidsMenu: true,
      seatingType: ['zashiki'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 芝公園（港区）
  // ===========================================================
  'shibakoen': [
    {
      name: '東京グランドホテル 6階レストラン',
      genre: 'yoshoku',
      area: '芝公園駅から徒歩約3分（東京グランドホテル6階）',
      description:
        '和洋問わず季節食材を活かしたランチを提供するホテルレストラン。ベビーカー入店可で、キッズメニューもあり、離乳食の持ち込みもOK。庭園を望むテラス席も気持ちよい。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table', 'terrace'],
      bringBabyFood: true,
      stepFree: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 赤羽橋（港区）
  // ===========================================================
  'akabanebashi': [
    {
      name: 'ファーマーズチキン東麻布店',
      genre: 'yoshoku',
      area: '赤羽橋駅から徒歩1分（東麻布1-27-10）',
      description:
        '赤羽橋駅徒歩1分のロティサリーチキン専門店。専用マシンで焼き上げる肉汁あふれるチキンが看板。テイクアウトもOKで、家族でシェアして食べやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 白金台（港区）
  // ===========================================================
  'shirokanedai': [
    {
      name: 'ベジタブルライフ',
      genre: 'cafe',
      area: '白金台駅徒歩すぐ（ゆかしの杜1階）',
      description:
        '白金台駅横のゆかしの杜1階にある野菜中心のカフェ。施設内にオムツ交換台があり、店内も明るく広め。子連れランチで重宝されている穴場。',
      seatingType: ['table'],
      diaperChangingTable: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 白金高輪（港区）
  // ===========================================================
  'shirokane-takanawa': [
    {
      name: 'Têtue 〜classique et nature〜（テチュ）',
      genre: 'french',
      area: '白金高輪駅から徒歩約5分',
      description:
        'ソムリエシェフが営むフレンチ。カジュアルなテイストでかしこまった雰囲気はなく、小さい子連れでも気軽に利用できる。ベビーカー入店時は事前連絡が必要。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
    {
      name: 'ISOLA（イソラ）',
      genre: 'italian',
      area: '白金高輪駅から徒歩約7分（白金の裏路地）',
      description:
        '白金の裏路地にあるピッツェリア。窯で焼き上げる外はパリッ、中はもちっとした本格ピッツァが看板で、ベビーカー入店もOK。家族でシェアしやすい。',
      strollerOk: true,
      seatingType: ['table'],
      shareDish: true,
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 高輪ゲートウェイ（港区）
  // ===========================================================
  'takanawa-gateway': [
    {
      name: 'DIYA Modern Indian Dining（ニュウマン高輪）',
      genre: 'asian',
      area: '高輪ゲートウェイ駅直結（ニュウマン高輪）',
      description:
        'ニュウマン高輪内のモダンインド料理店。子連れ利用OKで、駅直結・屋根付きでベビーカー移動が楽。施設内に複数のベビー休憩室・授乳室が整い、雨の日も安心。',
      strollerOk: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      nursingRoom: true,
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 虎ノ門ヒルズ（港区）
  // ===========================================================
  'toranomon-hills': [
    {
      name: '日常茶飯時（にちじょうさはんじ）',
      genre: 'washoku',
      area: '虎ノ門ヒルズ駅直結（ステーションタワー2階）',
      description:
        '虎ノ門ヒルズ駅直結の和食店。ベビーカーのまま入店でき、小上がりもあり子どもをウェルカム。こだわりのお米と家庭料理風メニューで、無料の離乳食提供もあり子連れに人気。',
      strollerOk: true,
      seatingType: ['zashiki', 'table'],
      shareDish: true,
      bringBabyFood: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],
};
