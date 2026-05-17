/**
 * 駅別 個人店マッピング — chunk-22（東京・千代田区／中央区 子連れランチ拡充）
 *
 * - 各駅ごとに Web 調査で実在を確認した実名の個人店・小規模店のみを掲載
 * - チェーン店・複数店舗展開のグループ系は対象外（station-restaurants.ts 側で別途登録）
 * - 子連れ向き設備（ベビーカー・座敷・おむつ替え等）は公開情報・取材記事ベースの推定。
 *   最終的には店舗確認前提。
 * - 食べログ点数等の数値スコアは引用していない
 * - chunk-1〜21 と同じ駅 slug は index.ts の mergeIndieMaps で結合される
 */

import type { StationIndieMap } from './types';

export const CHUNK_22: StationIndieMap = {
  // ===========================================================
  // 秋葉原（千代田区）
  // ===========================================================
  'akihabara': [
    {
      name: '須田町食堂 秋葉原UDX店',
      genre: 'yoshoku',
      area: '秋葉原駅電気街口から徒歩1分（秋葉原UDX 3F）',
      description:
        '1924年創業の老舗洋食店の流れをくむ店。キッズメニューとキッズチェアを用意し、同じUDX4Fには授乳室・おむつ替え台・調乳給湯器がそろうベビールームがある。ベビーカーでもゆったり入れる。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      nursingRoom: true,
      stepFree: true,
      bringBabyFood: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'PORTAL CAFE AKIBA（ポータルカフェ アキバ）',
      genre: 'cafe',
      area: '秋葉原駅から徒歩1分（AKIBA TOLIM 2F）',
      description:
        'カリフォルニアをテーマにした明るいカフェ。ゆったりしたソファ席はベビーカーのまま入れ、屋根付きのオープンテラスもあるので雨の日でも使いやすい。フレンチ出身シェフの料理が楽しめる。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 飯田橋（千代田区・新宿区）
  // ===========================================================
  'iidabashi': [
    {
      name: 'CANAL CAFE（カナルカフェ）',
      genre: 'italian',
      area: '飯田橋駅西口から徒歩1分',
      description:
        'お堀に浮かぶ水上のイタリアン。入口の階段はスタッフがベビーカーを運んでくれ、奥の席に赤ちゃん連れがまとめて案内される。キッズチェアとおむつ替えできるトイレあり。ガラス張りテラスから電車も見える。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table', 'terrace'],
      diaperChangingTable: true,
      stepFree: false,
      bringBabyFood: true,
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '1F Osteria LASTRICATO（オステリア ラストリカート）',
      genre: 'italian',
      area: '飯田橋駅から徒歩7分（神楽坂）',
      description:
        '神楽坂の石畳沿いにあるイタリアン。子育て支援レストランで、日曜は子連れ専用のキッズランチデー。子ども用椅子・授乳スペース・おむつ替え台を備え、ベビーカーや子ども用イスの持ち込みもできる。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      nursingRoom: true,
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      kidsMenu: true,
      kidsCutlery: true,
      priceLunch: '〜3,500円',
    },
    {
      name: '鳥茶屋 別亭',
      genre: 'washoku',
      area: '飯田橋駅から徒歩5分（神楽坂）',
      description:
        '神楽坂の熱海湯階段途中にある数寄屋造りの和食店。ふわとろ卵の特上地鶏親子丼が名物で、2階には掘りごたつの小部屋と座敷の大広間があり、子連れでも落ち着いて過ごせる。ランチは予約推奨。',
      privateRoom: true,
      seatingType: ['zashiki', 'table', 'counter'],
      stepFree: false,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 御茶ノ水（千代田区）
  // ===========================================================
  'ochanomizu': [
    {
      name: '淡路坂珈琲 お茶の水店',
      genre: 'cafe',
      area: '御茶ノ水駅から徒歩3分',
      description:
        '神田川を見下ろす高架下のカフェ。1階と地下1階に席があり奥行きがあるので、ベビーカーでも入りやすい。春は川沿いの桜が見えるテラス席が人気で、モーニングからランチまで使える。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      stepFree: false,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 神保町（千代田区）
  // ===========================================================
  'jimbocho': [
    {
      name: 'ブックハウスカフェ',
      genre: 'cafe',
      area: '神保町駅から徒歩2分',
      description:
        '1万冊超の絵本に囲まれた、こどもの本専門店併設のカフェ。小さな子が遊べるキッズスペースや個室があり、おむつ替え・授乳スペースも用意。お子さまカレーなどキッズメニューもあり、ベビーカー入店可。',
      strollerOk: true,
      kidsMenu: true,
      kidsSpace: true,
      privateRoom: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      nursingRoom: true,
      stepFree: true,
      strollerToSeat: true,
      kidsChair: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'GOOD MORNING CAFE 神田錦町',
      genre: 'italian',
      area: '神保町駅から徒歩3分（錦町トラッドスクエア1F）',
      description:
        '緑に面したテラスのある開放的なカフェ。広くて天井が高くベビーカーでも入りやすい。イタリアンで修業したシェフが作る日替わりやパスタ、バーガーなどヘルシーなランチが楽しめる。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 日本橋（中央区）
  // ===========================================================
  'nihombashi': [
    {
      name: '薮伊豆総本店',
      genre: 'noodles',
      area: '日本橋駅から徒歩5分',
      description:
        '日本橋の老舗そば店。1階はテーブル席、2階は掘りごたつの部屋、3階には畳の個室が4部屋あり、子連れなら個室や掘りごたつが落ち着く。そばは取り分けもしやすい。',
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      shareDish: true,
      stepFree: false,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 三越前（中央区）
  // ===========================================================
  'mitsukoshimae': [
    {
      name: '文明堂カフェ 日本橋本店',
      genre: 'yoshoku',
      area: '三越前駅A6出口から徒歩1分',
      description:
        'カステラで知られる文明堂が手がけるカフェ。ベビーカー置きスペースを確保し子連れ歓迎を掲げる。キッズチェアやテラス席あり。ハンバーグやカレーなどの洋食ランチで、焼きたて三笠山パンケーキも人気。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table', 'terrace'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 築地（中央区）
  // ===========================================================
  'tsukiji': [
    {
      name: '日本料理 魚月（なづき）',
      genre: 'washoku',
      area: '築地駅から徒歩3分',
      description:
        '海底映像のモニターに囲まれた潜水艦のような店内で、子どもも喜ぶ和食店。最寄り駅すべてにエレベーターがありベビーカーで来店しやすい。来店時に希望を聞いてハイチェアを席に用意してくれ、個室もある。',
      strollerOk: true,
      kidsChair: true,
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '築地テラス',
      genre: 'cafe',
      area: '築地駅から徒歩1分',
      description:
        '築地本願寺の正面にあるカフェダイニング。ビルの1〜2階にあり大きな窓から光が入る明るい空間で、全席禁煙。ベビーカーでの入店ができ、片側ソファのテーブル席など席タイプも豊富。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      stepFree: false,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 月島（中央区）
  // ===========================================================
  'tsukishima': [
    {
      name: 'もんじゃ ひろ 西仲通り店',
      genre: 'teppan',
      area: '月島駅から徒歩4分（もんじゃストリート）',
      description:
        '地元で20年以上愛されるもんじゃ店。離乳食の持ち込みOKで、子ども用食器や補助便座も用意。ベビーカーを横付けできるテーブル席やボックス席があり、日曜昼は完全禁煙の「子連れ歓迎タイム」になる。',
      strollerOk: true,
      kidsCutlery: true,
      seatingType: ['box', 'table', 'zashiki'],
      bringBabyFood: true,
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 勝どき（中央区）
  // ===========================================================
  'kachidoki': [
    {
      name: 'CAFE&BAR YOLO（カフェアンドバー ヨロ）',
      genre: 'italian',
      area: '勝どき駅から徒歩2分',
      description:
        '石窯で焼くピッツァとセモリナ粉の生パスタが看板のイタリアン。明るく広い店内はベビーカーのまま入りやすく、子連れ歓迎。ランチはサラダ・スープ・ドリンクバー付きのお得なセットがある。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 八丁堀（中央区）
  // ===========================================================
  'hatchobori': [
    {
      name: 'River&Green Cafe（リバーアンドグリーンカフェ）',
      genre: 'cafe',
      area: '八丁堀駅から徒歩5分（亀島川沿い）',
      description:
        '亀島川沿いの小さなカフェ。木のカウンターとテーブル席があり、ベビーカーでの入店ができる。自家製ソースと新鮮野菜のボリュームあるサンドイッチが看板で、テイクアウトして川沿いで食べるのもおすすめ。',
      strollerOk: true,
      seatingType: ['counter', 'table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 人形町（中央区）
  // ===========================================================
  'ningyocho': [
    {
      name: '萬福楼',
      genre: 'chinese',
      area: '人形町駅から徒歩3分',
      description:
        '人形町の本格中華。90席の店内に掘りごたつ席・ソファ席・円卓があり、ベビーカー入店OK、子ども用の椅子・食器も用意。6名程度から使える個室もあり、子連れのママ会や家族の食事会に向く。',
      strollerOk: true,
      kidsChair: true,
      kidsCutlery: true,
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],
};
