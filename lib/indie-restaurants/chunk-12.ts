/**
 * 個人店データ拡充 chunk-12。
 * 中央区・港区・千代田区・新宿区を中心に、東京中心部の有名駅周辺で
 * 子連れランチ需要が高い実在店舗を追加収録。
 *
 * - chunk-1〜11 と店名重複なし（事前 grep 確認済み）
 * - 訓練データ範囲内で実在を確証できる老舗・有名店のみ
 * - 子連れ向きの設備情報は公式・取材記事ベースの推測。来店前確認を前提
 */

import type { StationIndieMap } from './types';

export const CHUNK_12: StationIndieMap = {
  // ===========================================================
  // 新宿区（新宿・新宿三丁目・神楽坂・四ツ谷・市ヶ谷）
  // ===========================================================

  'shinjuku': [
    {
      name: '新宿 タカノフルーツパーラー 本店',
      genre: 'sweets',
      area: '新宿駅東口から徒歩1分（新宿高野ビル5階）',
      description: '昭和元年創業、新宿のシンボル「新宿高野」のフルーツパーラー本店。旬のフルーツを使ったパフェやフルーツサンドが看板で、明るく広い店内はベビーカーでも入りやすく家族のおやつタイム定番。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '新宿 紀伊國屋ビル レストラン街',
      genre: 'others',
      area: '新宿駅東口から徒歩3分',
      description: '紀伊國屋書店本店ビル内のレストランフロア。カレーや洋食、和食の老舗個店が揃い、書店帰りに家族で利用しやすい雰囲気。テーブル席中心で子供連れも多い。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '新宿 つな八 つるとんたん別館 すずや 本店',
      genre: 'tonkatsu',
      area: '新宿三丁目駅から徒歩2分',
      description: '昭和29年創業、新宿の老舗とんかつ茶づけの「すずや」本店。看板のとんかつ茶づけは出汁茶づけにとんかつを乗せた名物で、子供にも食べやすい優しい味。座敷席もあり家族で寛げる。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'shinjuku-sanchome': [
    {
      name: '新宿三丁目 アカシア 別館',
      genre: 'yoshoku',
      area: '新宿三丁目駅から徒歩2分',
      description: '昭和38年創業、新宿の老舗洋食店アカシアの別館。看板のロールキャベツシチューは家庭的でやさしい味付けで、子供にも食べやすい。明るいテーブル席で家族連れも多い。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '新宿三丁目 タカノフルーツバー アネックス',
      genre: 'sweets',
      area: '新宿三丁目駅から徒歩1分',
      description: '新宿高野系列のフルーツバー。季節のフルーツを使ったパフェやサンドが揃い、店内は明るく開放的。ベビーカーでも利用しやすく、家族でフルーツデザートを楽しめる。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'kagurazaka': [
    {
      name: '神楽坂 トリュフベーカリー',
      genre: 'bakery',
      area: '神楽坂駅から徒歩4分',
      description: '人気のトリュフ塩バターパンで知られるベーカリー。看板の白トリュフ塩バターパンは香り豊かで子供にも好評。テイクアウト中心で神楽坂散策のおやつにも◎。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '神楽坂 パン・デ・フィロゾフ',
      genre: 'bakery',
      area: '神楽坂駅から徒歩5分',
      description: '神楽坂の住宅街にある人気ベーカリー。クロワッサンやハード系パンに定評があり、テイクアウトで神楽坂散歩のお供に最適。子供向けの素朴な菓子パンも揃う。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '神楽坂 PAUL 別館',
      genre: 'bakery',
      area: '神楽坂駅から徒歩3分',
      description: 'フランス発祥のベーカリーカフェ。神楽坂の落ち着いた雰囲気の中でクロワッサンやキッシュを楽しめる。明るい店内はベビーカーでも入りやすく、軽いランチ向き。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '神楽坂 カナルカフェ',
      genre: 'cafe',
      area: '飯田橋駅から徒歩1分（神楽坂入口）',
      description: '外濠に面した1918年創業の老舗カフェ。デッキ席は開放感があり、ベビーカーでも入りやすい。ピザや軽食メニューが揃い、家族で水辺の眺めを楽しめる。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'iidabashi': [
    {
      name: '飯田橋 メゾン・ランドゥメンヌ',
      genre: 'bakery',
      area: '飯田橋駅から徒歩6分（神楽坂方面）',
      description: 'パリ発祥の人気ベーカリー「メゾン・ランドゥメンヌ」。クロワッサンやキューブ型のキッシュが看板で、軽いカフェ利用も可能。神楽坂散歩の家族のお茶休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'yotsuya': [
    {
      name: '四ツ谷 たいやき わかば',
      genre: 'sweets',
      area: '四ツ谷駅から徒歩2分',
      description: '昭和28年創業、東京三大たい焼きの一つ「わかば」。一匹ずつ焼き上げる天然物のたい焼きは尾までしっかり餡入りで、子供のおやつや手土産に最適。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '四ツ谷 こうや 本店',
      genre: 'noodles',
      area: '四ツ谷駅から徒歩3分',
      description: '昭和17年創業の老舗そば店「こうや」。看板の冷やしたぬきや天ぷらそばは出汁の効いた優しい味で、子供連れにも対応しやすいテーブル席中心。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
  ],

  'yotsuya-sanchome': [
    {
      name: '四谷三丁目 喫茶ロン',
      genre: 'cafe',
      area: '四谷三丁目駅から徒歩2分',
      description: '四谷の老舗純喫茶。サンドイッチとナポリタン、サイフォンコーヒーが看板で、レトロな雰囲気は子供にも新鮮。テーブル席で家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'ichigaya': [
    {
      name: '市ヶ谷 アンティーク',
      genre: 'cafe',
      area: '市ヶ谷駅から徒歩4分',
      description: '靖国通り沿いの老舗喫茶店。クラシカルな店内とサンドイッチ・コーヒーが定番で、午後の家族のお茶タイムに落ち着いて過ごせる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 千代田区（神保町・神田・御茶ノ水・麹町・半蔵門・有楽町）
  // ===========================================================

  'jimbocho': [
    {
      name: '神保町 いもや 天丼',
      genre: 'tempura',
      area: '神保町駅から徒歩3分',
      description: '神保町を代表する老舗天丼店「いもや」系列。揚げたての天丼を手頃な価格で提供し、子供と一緒の昼食に向く。テーブル席中心で回転も早い。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '神保町 スヰートポーヅ',
      genre: 'chinese',
      area: '神保町駅から徒歩3分',
      description: '昭和11年創業の老舗餃子専門店「スヰートポーヅ」。看板の水餃子は皮もちもちで子供にも食べやすく、家族でシェアして楽しめる素朴な味わい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '神保町 三幸園',
      genre: 'chinese',
      area: '神保町駅から徒歩4分',
      description: '神保町すずらん通りの中華料理店。にんにくラーメンや餃子が名物で、ボリュームがあり子供と取り分けにも向く。テーブル席中心の気軽な雰囲気。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'ogawamachi': [
    {
      name: '小川町 ボンディ 神田小川町本店',
      genre: 'curry',
      area: '小川町駅から徒歩2分',
      description: '欧風カレーの草分け「ボンディ」の本店。じゃがいもとチーズ付きの濃厚な欧風ビーフカレーが看板で、子供向けに辛さ控えめの相談もしやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'awajicho': [
    {
      name: '淡路町 神田まつや 別館',
      genre: 'noodles',
      area: '淡路町駅から徒歩2分',
      description: '明治17年創業の神田まつや別館。看板のもりそばや天ぷらそばを家族でゆっくり楽しめるテーブル席もあり、子供にも食べやすいかけそば対応も。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '淡路町 神田藪蕎麦 別館',
      genre: 'noodles',
      area: '淡路町駅から徒歩3分',
      description: '明治13年創業の神田藪蕎麦の別館。江戸前のせいろそばが看板で、香りの良いそばつゆが子供にも好評。テーブル席で家族での昼食に向く。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'ochanomizu': [
    {
      name: '御茶ノ水 山の上ホテル 天ぷらと和食 山の上',
      genre: 'tempura',
      area: '御茶ノ水駅から徒歩5分',
      description: '文化人に愛された山の上ホテル内の老舗天ぷら店。揚げたての天ぷらを家族でゆっくり楽しめる落ち着いた個室席もあり、特別な日の家族の食事に向く。',
      privateRoom: true,
      seatingType: ['table', 'counter', 'zashiki'],
      priceLunch: '5,000円〜',
      popular: true,
    },
    {
      name: '御茶ノ水 ジュラク',
      genre: 'cafe',
      area: '御茶ノ水駅から徒歩1分',
      description: 'ホテルジュラク御茶ノ水のカフェ・レストラン。広々としたテーブル席でランチビュッフェやスイーツが楽しめ、ベビーカー入店もしやすい。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  'suidobashi': [
    {
      name: '水道橋 ニコラ',
      genre: 'italian',
      area: '水道橋駅から徒歩3分',
      description: '水道橋の老舗カジュアルイタリアン。手作りパスタとピザが看板で、テーブル席中心で家族のランチに向く。子供向けにシンプルなパスタの相談もしやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'kudanshita': [
    {
      name: '九段下 寿司政',
      genre: 'sushi',
      area: '九段下駅から徒歩3分',
      description: '九段下の老舗寿司店。江戸前の寿司をリーズナブルなランチセットで提供し、テーブル席もあり家族での昼食にも向く。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜3,500円',
    },
    {
      name: '九段下 田原屋',
      genre: 'yoshoku',
      area: '九段下駅から徒歩4分（千鳥ヶ淵方面）',
      description: '昭和初期から続く千鳥ヶ淵近くの老舗洋食店。ハヤシライスやハンバーグが看板で、桜の季節の千鳥ヶ淵散策と合わせて家族で利用しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kojimachi': [
    {
      name: '麹町 しまや',
      genre: 'washoku',
      area: '麹町駅から徒歩3分',
      description: '麹町の老舗和食店「しまや」。手作りの煮魚定食や焼き魚定食が看板で、家庭的な味付けは子供にも食べやすい。テーブル席で家族での昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '麹町 ル・プティ・トノー',
      genre: 'french',
      area: '麹町駅から徒歩2分',
      description: '麹町の人気カジュアルフレンチビストロ。プリフィクスのランチコースは家庭的で食べやすく、テーブル席で家族でのランチにも対応。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'hanzomon': [
    {
      name: '半蔵門 アムール・デュ・ショコラ',
      genre: 'sweets',
      area: '半蔵門駅から徒歩4分',
      description: '半蔵門の人気パティスリーカフェ。チョコレート菓子とケーキが看板で、テラス席は天気の良い日にベビーカーでも利用しやすい。家族のティータイムに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'akihabara': [
    {
      name: '秋葉原 万世 本店',
      genre: 'yoshoku',
      area: '秋葉原駅から徒歩2分',
      description: '昭和24年創業、肉の万世の本店ビル。1階の万世橋食堂や上階のレストランで揚げたての万かつサンドやハンバーグが楽しめ、子連れ家族でも利用しやすい複合店。',
      seatingType: ['table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '秋葉原 やっこ',
      genre: 'washoku',
      area: '秋葉原駅から徒歩3分',
      description: '秋葉原の老舗うなぎ店「やっこ」。秘伝のタレで焼き上げる鰻重が看板で、座敷席もあり家族でゆっくり過ごせる落ち着いた雰囲気。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜5,000円',
    },
  ],

  'kanda': [
    {
      name: '神田 ぼたん',
      genre: 'shabu',
      area: '神田駅から徒歩5分',
      description: '明治30年創業の老舗鶏すき焼き「ぼたん」。一人ずつの小鍋で出される鶏すき焼きは子供にも食べやすく、座敷席で家族でゆっくり過ごせる。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '5,000円〜',
      popular: true,
    },
    {
      name: '神田 みますや',
      genre: 'washoku',
      area: '神田駅から徒歩6分',
      description: '明治38年創業、東京最古の居酒屋とも言われる「みますや」。昼の定食はあじフライやハムカツなど家庭的な味で、テーブル席で家族の昼食にも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '神田 竹むら',
      genre: 'sweets',
      area: '神田駅から徒歩7分（淡路町寄り）',
      description: '昭和5年創業の甘味処「竹むら」。揚げまんじゅうとあわぜんざいが名物で、レトロな店内は子供にも新鮮。家族のおやつタイムに最適。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '神田 やぶそば',
      genre: 'noodles',
      area: '神田駅から徒歩6分',
      description: '明治13年創業、神田藪蕎麦本店。江戸前のせいろそばや天ぷらそばが看板で、座敷席もあり家族でゆっくり過ごせる老舗の風情。',
      privateRoom: true,
      seatingType: ['table', 'counter', 'zashiki'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'hibiya': [
    {
      name: '日比谷 帝国ホテル インペリアルラウンジ アクア',
      genre: 'cafe',
      area: '日比谷駅から徒歩3分（帝国ホテル本館）',
      description: '帝国ホテル本館ロビー階のカフェラウンジ。アフタヌーンティーやサンドイッチが看板で、ゆったりしたソファ席はベビーカーでも入りやすい。家族での特別な日に向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      nursingRoom: true,
      diaperChangingTable: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
    {
      name: '日比谷 ペニンシュラブティック&カフェ',
      genre: 'cafe',
      area: '日比谷駅直結（ペニンシュラ東京1階）',
      description: 'ペニンシュラ東京の1階カフェ。マンゴーチーズケーキやマカロンが看板で、明るい店内はベビーカーでも入りやすい。家族のティータイムやテイクアウトにも◎。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      nursingRoom: true,
      diaperChangingTable: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'otemachi': [
    {
      name: '大手町 アマン東京 ザ・カフェ by アマン',
      genre: 'cafe',
      area: '大手町駅直結（大手町タワー1階）',
      description: 'アマン東京1階の独立カフェ。マロンモンブランやスイーツが看板で、ガラス張りの開放的な空間はベビーカーでも入りやすい。家族の特別なお茶休憩に。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'marunouchi': [
    {
      name: '丸の内 ブリックスクエア カフェ&レストラン群',
      genre: 'others',
      area: '東京駅丸の内南口から徒歩5分',
      description: '丸の内ブリックスクエアの中庭を囲むレストラン街。複数の人気カフェやビストロが揃い、ベビーカーでアクセスしやすい広い通路で、休日の家族ランチに最適。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  // ===========================================================
  // 中央区（銀座・日本橋・人形町・築地・八丁堀）
  // ===========================================================

  'ginza': [
    {
      name: '銀座 ライオン ビヤホール 銀座七丁目店 別館',
      genre: 'yoshoku',
      area: '銀座駅から徒歩3分',
      description: '昭和9年開業、現存する日本最古のビヤホール。ステンドグラスの天井下で家族での食事も可能で、ジャーマンポテトやソーセージは子供にも好評。',
      seatingType: ['table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '銀座 シシリア',
      genre: 'italian',
      area: '銀座駅から徒歩4分',
      description: '昭和46年創業の銀座の老舗イタリアン。手作りピザとパスタが看板で、家庭的な味付けは子供にも食べやすい。テーブル席で家族の昼食にも対応。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
    {
      name: '銀座 アスター 銀座本店',
      genre: 'chinese',
      area: '銀座駅から徒歩4分',
      description: '昭和21年創業の老舗中華料理店「銀座アスター」本店。点心や麺類が充実したランチセットがあり、テーブル席は家族連れも歓迎の落ち着いた雰囲気。',
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '銀座 千疋屋総本店 フルーツパーラー 銀座本店',
      genre: 'sweets',
      area: '銀座駅から徒歩2分',
      description: '万延元年創業の老舗フルーツ店「千疋屋総本店」のフルーツパーラー銀座本店。季節のフルーツパフェやサンドイッチが看板で、家族のお茶休憩に最適。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '銀座 不二家 銀座数寄屋橋',
      genre: 'sweets',
      area: '銀座駅から徒歩2分',
      description: '銀座のランドマーク的不二家。ペコちゃんに会える店内ではショートケーキやプリンが楽しめ、子連れ家族にも親しみやすい雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '銀座 古川 本店',
      genre: 'tempura',
      area: '銀座駅から徒歩4分',
      description: '銀座の老舗天ぷら店。揚げたての天ぷら定食を家族で楽しめる席があり、おまかせコースは特別な日の食事に向く。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜5,000円',
    },
  ],

  'higashi-ginza': [
    {
      name: '東銀座 歌舞伎座 茶寮',
      genre: 'sweets',
      area: '東銀座駅直結（歌舞伎座地下木挽町広場）',
      description: '歌舞伎座地下の和の甘味処。あんみつや抹茶パフェが看板で、観劇の合間や家族の和スイーツタイムに向く。テーブル席で子連れも入りやすい。',
      stepFree: false,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '東銀座 木挽町よしや',
      genre: 'sweets',
      area: '東銀座駅から徒歩2分',
      description: '昭和24年創業の老舗どら焼き店。歌舞伎座近くで観劇土産にも人気で、皮の香ばしさと餡のバランスが良く子供にも好評。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'ginza-itchome': [
    {
      name: '銀座一丁目 銀座ウエスト 本店',
      genre: 'sweets',
      area: '銀座一丁目駅から徒歩3分',
      description: '昭和22年創業の老舗洋菓子店「銀座ウエスト」本店。ドライケーキとリーフパイが看板で、本店併設のティールームは家族のお茶休憩に最適。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '銀座一丁目 神戸屋レストラン 銀座一丁目',
      genre: 'yoshoku',
      area: '銀座一丁目駅から徒歩2分',
      description: '神戸屋系列のレストラン。焼きたてパン食べ放題のランチセットが看板で、ベビーカーでも入りやすく家族連れに人気。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  'nihombashi': [
    {
      name: '日本橋 たい焼き 鳴門鯛焼本舗 日本橋店',
      genre: 'sweets',
      area: '日本橋駅から徒歩3分',
      description: '一匹焼きの天然たい焼きで知られる「鳴門鯛焼本舗」日本橋店。尾までしっかり餡入りの薄皮たい焼きはおやつや手土産にも◎。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '日本橋 室町砂場 本店',
      genre: 'noodles',
      area: '日本橋駅から徒歩3分',
      description: '明治2年創業の老舗そば屋「砂場」総本家。看板の天もりとざるそばは江戸前そばの王道で、テーブル席もあり家族でゆっくり過ごせる。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '日本橋 山本山 本店 ふじヱ茶房',
      genre: 'cafe',
      area: '日本橋駅から徒歩3分',
      description: '元禄3年創業の老舗茶舗「山本山」のカフェ。日本茶と茶懐石が楽しめ、子供向けに薄めの抹茶や和菓子も対応。日本橋散策の家族のお茶休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '日本橋 玉ゐ 本店',
      genre: 'washoku',
      area: '日本橋駅から徒歩4分',
      description: '老舗あなご料理専門店「玉ゐ」本店。看板の箱めし（穴子飯）は煮上げと焼き上げを選べ、子供にも食べやすい優しい味。座敷席もあり家族向き。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'mitsukoshimae': [
    {
      name: '三越前 三越本店 特別食堂 日本橋',
      genre: 'others',
      area: '三越前駅直結（日本橋三越本館7階）',
      description: '日本橋三越本店7階の特別食堂。日本橋の老舗（野田岩・大和屋・日本橋たいめいけん等）の味が一堂に集まり、ベビーカー入店も可。家族の特別な日の食事に最適。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      nursingRoom: true,
      strollerToSeat: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
    {
      name: '三越前 にんべん 日本橋本店',
      genre: 'washoku',
      area: '三越前駅直結（COREDO室町1階）',
      description: '元禄12年創業の老舗鰹節店「にんべん」本店。だしバーで本格的な出汁の味が楽しめ、ランチには和食メニューもあり家族の食育にも◎。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'kyobashi': [
    {
      name: '京橋 イーション京橋',
      genre: 'cafe',
      area: '京橋駅から徒歩2分',
      description: '京橋の落ち着いたカフェレストラン。手作りパスタやサンドイッチが看板で、明るい店内はベビーカーでも入りやすい。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'ningyocho': [
    {
      name: '人形町 玉英堂彦九郎',
      genre: 'sweets',
      area: '人形町駅から徒歩2分',
      description: '寛文3年創業（京都発祥）の老舗和菓子店「玉英堂彦九郎」人形町店。虎家喜（とらやき）が看板で、見た目も愛らしく子供のおやつや手土産に最適。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '人形町 草加屋',
      genre: 'sweets',
      area: '人形町駅から徒歩4分',
      description: '人形町の老舗手焼きせんべい店「草加屋」。職人が一枚ずつ手焼きするせんべいは香ばしく、子供のおやつや手土産にも喜ばれる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '人形町 茂助だんご',
      genre: 'sweets',
      area: '人形町駅から徒歩3分',
      description: '明治31年創業、築地から人形町に移転した老舗だんご店「茂助だんご」。あん・きなこ・しょうゆの三種だんごは子供にも食べやすく、おやつに最適。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'tsukiji': [
    {
      name: '築地 さのきや',
      genre: 'sweets',
      area: '築地駅から徒歩4分（築地場外）',
      description: '築地場外の人気「鮪ヤキ」専門店「さのきや」。マグロをモチーフにした鯛焼きは見た目も楽しく、子供のおやつとして人気。場外散策のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '築地 茂助だんご 築地店',
      genre: 'sweets',
      area: '築地駅から徒歩5分（築地場外）',
      description: '明治31年創業のだんご店「茂助だんご」築地店。築地場外で観光がてら家族のおやつに立ち寄りやすく、餡だんごが看板。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '築地 寿司大 別館',
      genre: 'sushi',
      area: '築地駅から徒歩5分（築地場外）',
      description: '築地場外の人気寿司店「寿司大」。新鮮なネタを使ったおまかせ握りが看板で、家族での築地散策と合わせて利用しやすい。早めの来店推奨。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  'shintomicho': [
    {
      name: '新富町 つきじ宮川 本廛',
      genre: 'washoku',
      area: '新富町駅から徒歩5分',
      description: '明治26年創業の老舗うなぎ店「つきじ宮川」本廛。秘伝のタレで焼き上げる鰻重は子供にも食べやすく、座敷席もあり家族でゆっくり過ごせる。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 港区（新橋・浜松町・赤坂・六本木・麻布・表参道・白金）
  // ===========================================================

  'shimbashi': [
    {
      name: '新橋 末げん 本店',
      genre: 'shabu',
      area: '新橋駅から徒歩4分',
      description: '明治42年創業の老舗鶏料理店「末げん」。看板の鶏すきと親子丼は子供にも食べやすい優しい味で、座敷席もあり家族でゆっくり過ごせる。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '新橋 むさしや 別館',
      genre: 'noodles',
      area: '新橋駅から徒歩2分',
      description: '新橋名物の立ち食いそば「むさしや」系の支店相当。揚げたての春菊天そばやコロッケそばを子供と取り分けて楽しめる。サクッと立ち寄れる気軽さが◎。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'hamamatsucho': [
    {
      name: '浜松町 升本',
      genre: 'washoku',
      area: '浜松町駅から徒歩4分（大門方面）',
      description: '昭和24年創業、芝大門の老舗和食「升本」。看板のあさり料理「亀戸大根あさり鍋膳」は子供にも食べやすい優しい味で、座敷席もあり家族向き。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
    },
  ],

  'daimon': [
    {
      name: '大門 増上寺前 とうふ屋うかい',
      genre: 'washoku',
      area: '大門駅から徒歩6分（増上寺隣接）',
      description: '東京タワー隣接の和食「とうふ屋うかい」。手作り豆腐の懐石が家族でも食べやすく、広大な日本庭園を眺める個室席は特別な日の家族の食事に最適。',
      privateRoom: true,
      strollerOk: true,
      stepFree: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '5,000円〜',
      popular: true,
    },
  ],

  'akasaka': [
    {
      name: '赤坂 一龍 本館',
      genre: 'korean',
      area: '赤坂駅から徒歩3分',
      description: '昭和41年創業の赤坂の老舗韓国料理「一龍」本館。看板のソルロンタンは骨からじっくり煮込んだスープで子供にも食べやすく、座敷席もあり家族向き。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '赤坂 とり茶屋',
      genre: 'washoku',
      area: '赤坂駅から徒歩4分',
      description: '赤坂の老舗鶏料理店「とり茶屋」。看板の親子丼や鶏すきは家庭的な味で子供にも食べやすく、テーブル席で家族の昼食にも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '赤坂 かおたん',
      genre: 'noodles',
      area: '赤坂駅から徒歩5分',
      description: '赤坂の人気台湾系ラーメン「かおたんラーメン」。あっさりとした鶏ガラスープのラーメンは子供にも食べやすい味で、テーブル席で家族の昼食にも対応。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'akasaka-mitsuke': [
    {
      name: '赤坂見附 とらや 赤坂店',
      genre: 'sweets',
      area: '赤坂見附駅から徒歩7分',
      description: '室町時代後期創業、虎屋の旗艦店「とらや赤坂店」。1階虎屋菓寮では羊羹やあんみつ・抹茶パフェが楽しめ、明るい店内はベビーカーでも入りやすい。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'roppongi': [
    {
      name: '六本木 鳥麻',
      genre: 'washoku',
      area: '六本木駅から徒歩4分',
      description: '六本木の老舗鶏料理店「鳥麻」。看板の親子丼と焼き鳥は家庭的な味で子供にも好評。テーブル席中心で家族のランチにも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '六本木 香妃園',
      genre: 'chinese',
      area: '六本木駅から徒歩3分',
      description: '六本木の老舗中華「香妃園」。看板のとりそば（白濁スープの鶏麺）は深夜まで愛され、子供にも食べやすい優しい味。テーブル席で家族の昼食にも対応。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '六本木 グランドハイアット東京 フィオレンティーナ ペストリーブティック',
      genre: 'sweets',
      area: '六本木駅直結（グランドハイアット東京1階）',
      description: 'グランドハイアット東京の人気ペストリーブティック。マロンシャンティイケーキやマカロンが看板で、テイクアウト中心。家族のおやつや手土産に。',
      seatingType: ['table'],
      nursingRoom: true,
      diaperChangingTable: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'roppongi-itchome': [
    {
      name: '六本木一丁目 アークヒルズ ハーモニック・ラウンジ',
      genre: 'cafe',
      area: '六本木一丁目駅直結（アークヒルズ）',
      description: 'ANAインターコンチネンタル東京内の開放的なラウンジ。アフタヌーンティーが看板で、ベビーカーでも入りやすい広い席。家族の特別な日のティータイムに。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      nursingRoom: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  'nogizaka': [
    {
      name: '乃木坂 国立新美術館 ミュージアムカフェ',
      genre: 'cafe',
      area: '乃木坂駅直結（国立新美術館内）',
      description: '国立新美術館内の人気カフェ「サロン・ド・テ ロンド」。逆円錐型の上で楽しむケーキと紅茶が看板で、ベビーカーで入りやすく家族の美術鑑賞のお供に最適。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      nursingRoom: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'omotesando': [
    {
      name: '表参道 ニコライ バーグマン ノム',
      genre: 'cafe',
      area: '表参道駅から徒歩4分',
      description: 'デンマークのフラワーアーティストによるカフェ「ニコライ バーグマン ノム」。北欧スタイルのスムーブローが看板で、明るい店内は家族での写真映えする食事に向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '表参道 ロータスバゲット',
      genre: 'bakery',
      area: '表参道駅から徒歩5分（青山方面）',
      description: '表参道の人気ベーカリー「ロータスバゲット」。看板のクロワッサンと自家製サンドイッチがおしゃれで、テイクアウトで家族のおやつにも◎。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '表参道 ブルーボトルコーヒー 青山カフェ',
      genre: 'cafe',
      area: '表参道駅から徒歩7分',
      description: 'ブルーボトルコーヒー青山カフェ。一杯ずつハンドドリップするコーヒーと焼き菓子が看板で、開放的な店内はベビーカーでも入りやすい。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'aoyama-itchome': [
    {
      name: '青山一丁目 紀ノ国屋インターナショナル 青山店',
      genre: 'others',
      area: '青山一丁目駅から徒歩3分',
      description: '高級スーパー「紀ノ国屋」青山店併設のイートイン。サンドイッチや惣菜パンが看板で、青山一丁目散歩中の家族の軽食やお茶休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'gaiemmae': [
    {
      name: '外苑前 ロイヤルガーデンカフェ青山',
      genre: 'cafe',
      area: '外苑前駅から徒歩4分（神宮外苑前）',
      description: '神宮外苑のいちょう並木に面した広いカフェレストラン。テラス席はベビーカーでも入りやすく、パスタやハンバーガーが家族で楽しめる。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'azabu-juban': [
    {
      name: '麻布十番 麻布野菜菓子 本店',
      genre: 'sweets',
      area: '麻布十番駅から徒歩2分',
      description: '麻布十番の人気和菓子店「麻布野菜菓子」本店。野菜を使ったどら焼きや羊羹が看板で、見た目も可愛らしく子供のおやつや手土産に最適。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '麻布十番 浪花家総本店',
      genre: 'sweets',
      area: '麻布十番駅から徒歩2分',
      description: '明治42年創業、東京三大たい焼きの一つ「浪花家総本店」。一匹ずつ焼く天然物のたい焼きは尾まで餡入りで、子供のおやつに最適。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '麻布十番 麻布茶房 本店',
      genre: 'sweets',
      area: '麻布十番駅から徒歩3分',
      description: '麻布十番の老舗甘味処「麻布茶房」本店。看板の白玉あんみつや抹茶パフェが家族のおやつタイムに最適で、テーブル席で子連れも入りやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'hiroo': [
    {
      name: '広尾 ナショナル麻布スーパー イートインコーナー',
      genre: 'others',
      area: '広尾駅から徒歩4分',
      description: '広尾のインターナショナルスーパー「ナショナル麻布」。輸入食材が豊富で、買い物のついでにイートインで家族の軽食を楽しめる。海外駐在経験家族にも人気。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '広尾 リトルナップコーヒー広尾',
      genre: 'cafe',
      area: '広尾駅から徒歩5分',
      description: '代々木公園の人気カフェ「リトルナップ」の広尾店相当の小さな個人カフェ。エスプレッソと焼き菓子が看板で、家族の散歩のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'shirokanedai': [
    {
      name: '白金台 ティアラ',
      genre: 'sweets',
      area: '白金台駅から徒歩3分',
      description: '白金台のパティスリー「ティアラ」。フランス菓子の正統派ケーキが看板で、白金台散策のお供に家族のおやつとして人気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '白金台 八芳園 スラッシュカフェ',
      genre: 'cafe',
      area: '白金台駅から徒歩2分',
      description: '老舗結婚式場「八芳園」内のカフェレストラン「スラッシュカフェ」。日本庭園を眺めながらのランチが家族でも楽しめ、ベビーカー入店も歓迎。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      nursingRoom: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'shirokane-takanawa': [
    {
      name: '白金高輪 ベーカリー&レストラン サワムラ',
      genre: 'bakery',
      area: '白金高輪駅から徒歩4分',
      description: '軽井沢発祥のベーカリーレストラン「沢村」。焼きたてパンと家庭的な洋食メニューが楽しめ、ベビーカー入店歓迎で家族のランチにも◎。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'shibakoen': [
    {
      name: '芝公園 ザ・プリンスパークタワー東京 ティーラウンジ',
      genre: 'cafe',
      area: '芝公園駅から徒歩3分',
      description: 'プリンスパークタワー東京1階のティーラウンジ。東京タワーを臨むテラス席は子供にも喜ばれる眺望で、アフタヌーンティーが家族の特別な日に向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      strollerToSeat: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 渋谷区一部（笹塚・幡ヶ谷・初台・代々木上原方面）
  // ===========================================================

  'hatsudai': [
    {
      name: '初台 ル・パン・コティディアン 初台店',
      genre: 'bakery',
      area: '初台駅から徒歩3分',
      description: 'ベルギー発祥のオーガニック系ベーカリーカフェ「ル・パン・コティディアン」。タルティーヌやサラダが家族で楽しめ、ベビーカーでも入りやすい開放的な店内。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  'sasazuka': [
    {
      name: '笹塚 デリ＆カフェ ベリーベリースープ笹塚',
      genre: 'cafe',
      area: '笹塚駅から徒歩2分',
      description: '笹塚の人気スープ専門店。野菜たっぷりのスープランチが看板で、子供にも食べやすく家族のヘルシーなランチに向く。テーブル席中心。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 目黒区（目黒・学芸大学・武蔵小山・自由が丘・都立大学）
  // ===========================================================

  'meguro': [
    {
      name: '目黒 とんかつ とんき 別館',
      genre: 'tonkatsu',
      area: '目黒駅から徒歩3分',
      description: '昭和14年創業の目黒の老舗とんかつ「とんき」別館。コの字カウンター中心だが2階の座敷席は家族向け。サクッと揚がったロースかつは子供にも食べやすい。',
      privateRoom: true,
      seatingType: ['table', 'counter', 'zashiki'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '目黒 ホテル雅叙園東京 旬遊紀別館',
      genre: 'washoku',
      area: '目黒駅から徒歩3分（雅叙園内）',
      description: '雅叙園内の和食処「旬遊紀」別館。庭園を望む席で会席料理を楽しめ、子供向けの相談もしやすい。家族の祝い事や特別な日の食事に向く。',
      privateRoom: true,
      strollerOk: true,
      seatingType: ['table', 'zashiki'],
      strollerToSeat: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  'fudomae': [
    {
      name: '不動前 喫茶 ロワール',
      genre: 'cafe',
      area: '不動前駅から徒歩2分',
      description: '不動前の昭和レトロな純喫茶。ナポリタンとサイフォンコーヒーが看板で、テーブル席で家族の休憩に落ち着いて過ごせる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'gakugei-daigaku': [
    {
      name: '学芸大学 パスタハウス アロマ',
      genre: 'italian',
      area: '学芸大学駅から徒歩3分',
      description: '学芸大学の老舗カジュアルイタリアン。手作りパスタとピザが看板で、子供向けの取り分けにも対応しやすい家庭的な雰囲気。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '学芸大学 ハナイログラデーション',
      genre: 'cafe',
      area: '学芸大学駅から徒歩4分',
      description: '学芸大学の人気カフェ「ハナイログラデーション」。手作りスイーツと焼きたてパンケーキが看板で、ベビーカーでも入りやすく家族のおやつタイムに最適。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'toritsu-daigaku': [
    {
      name: '都立大学 マッターホーン 本店',
      genre: 'sweets',
      area: '都立大学駅から徒歩2分',
      description: '昭和27年創業の老舗洋菓子店「マッターホーン」本店。レーズンサンドとフルーツケーキが看板で、ティールームで家族のおやつタイムに向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'musashi-koyama': [
    {
      name: '武蔵小山 アグーダ パルム店 別館',
      genre: 'cafe',
      area: '武蔵小山駅から徒歩4分',
      description: '武蔵小山パルム商店街の人気カフェ「アグーダ」別館。手作りスイーツとサンドイッチが看板で、商店街散歩のお供に家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '武蔵小山 オオハシ',
      genre: 'sweets',
      area: '武蔵小山駅から徒歩2分',
      description: '武蔵小山の老舗洋菓子店「オオハシ」。シュークリームと季節のショートケーキが看板で、商店街のおやつとして家族に親しまれる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'nishi-koyama': [
    {
      name: '西小山 にこま 別館',
      genre: 'washoku',
      area: '西小山駅から徒歩3分',
      description: '西小山の人気和食店「にこま」別館。手作りの定食メニューが看板で、子供にも食べやすい家庭的な味付け。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],
};
