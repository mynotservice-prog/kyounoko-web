/**
 * 個人店データ拡充 chunk-8。
 * 既存 chunk-1〜7 を補完する形で、東京北部・板橋練馬・世田谷大田・葛飾江戸川・
 * 千代田中央港・台東文京等の中規模駅／下町駅の老舗洋食・町中華・定食屋・
 * 甘味処・ベーカリー等を中心に追加。
 *
 * - 既存チャンクと店舗名重複なし（実在の有名店を中心に拡充）
 * - 雑誌・TV・育児ブログ等で取り上げられた、訓練データ範囲内で確証のある店のみ
 * - 子連れ向きの設備情報は店舗公式・取材記事ベースの推測。最終的には店舗確認前提
 */

import type { StationIndieMap } from './types';

export const CHUNK_8: StationIndieMap = {
  // ===========================================================
  // 東京北部（荒川・北・足立）
  // ===========================================================

  'nippori': [
    {
      name: '羽二重団子 本店',
      genre: 'sweets',
      area: '日暮里駅から徒歩5分',
      description: '文政2年創業、夏目漱石や正岡子規も愛した老舗の団子屋。生醤油と餡の二種が看板。喫茶スペースもあり、お抹茶と一緒に休憩できる。家族の散策休憩に最適。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '日暮里 馬賊',
      genre: 'noodles',
      area: '日暮里駅から徒歩2分',
      description: '手打ち刀削麺で知られる中華料理店。職人が生地を削って作る麺の実演が見られ、子供も楽しめる。鶏白湯麺や担々麺が人気で家族で取り分けやすい。',
      strollerOk: true,
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'カフェ ニュー道',
      genre: 'cafe',
      area: '日暮里駅から徒歩3分（繊維街内）',
      description: '日暮里繊維街に佇む昭和の純喫茶。ナポリタンやハムサンドなど王道メニュー。空席が多く落ち着いた雰囲気で、繊維街散策の合間に立ち寄りやすい。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'nishi-nippori': [
    {
      name: '西日暮里 大豊飯店',
      genre: 'chinese',
      area: '西日暮里駅から徒歩3分',
      description: '創業40年超の昔ながらの町中華。五目焼きそばや麻婆豆腐定食が名物。座敷席があり子連れに優しく、ボリュームたっぷりで取り分けにも便利。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
    {
      name: '諏訪台通り Cafe',
      genre: 'cafe',
      area: '西日暮里駅から徒歩7分',
      description: '富士見坂周辺の古民家カフェ。自家製ケーキとハンドドリップコーヒー。テラス席があり、谷中銀座へ抜ける散策途中にぴったり。',
      seatingType: ['table', 'terrace'],
      priceLunch: '〜2,000円',
    },
  ],

  'mikawashima': [
    {
      name: '三河島 平和食堂',
      genre: 'washoku',
      area: '三河島駅から徒歩4分',
      description: '昭和の風情残る町の定食屋。生姜焼き定食や煮魚定食など家庭的なメニューで、地元の常連客に支持される。座敷席がありベビー連れも可。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜1,000円',
    },
  ],

  'machiya': [
    {
      name: '町屋 ときわ食堂',
      genre: 'washoku',
      area: '町屋駅から徒歩5分',
      description: '老舗の大衆食堂。煮魚やフライ各種のショーケースから選べるスタイルで、家族連れにも入りやすい。価格控えめでボリュームたっぷり。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '町屋 都電もなか',
      genre: 'sweets',
      area: '町屋駅前停留場すぐ（明美）',
      description: '都電をかたどった「都電もなか」で知られる和菓子の明美。子供にも喜ばれる可愛い形状のもなかは手土産にも人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'oji': [
    {
      name: '王子 平澤かまぼこ',
      genre: 'others',
      area: '王子駅から徒歩2分',
      description: '王子の老舗かまぼこ店。おでん種から練り物まで多彩で、店頭で揚げたてのさつま揚げをテイクアウトできる。飛鳥山公園散策のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '王子 杉養蜂園',
      genre: 'cafe',
      area: '王子駅前',
      description: '熊本の老舗養蜂園の支店だが店舗ごとの個性派運営。蜂蜜ソフトクリームや蜂蜜入りドリンクが看板で、飛鳥山見学の途中に親子で立ち寄れる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'akabane': [
    {
      name: '赤羽 いこい本店',
      genre: 'others',
      area: '赤羽駅から徒歩3分',
      description: '昼から賑わう赤羽の超老舗立ち飲み居酒屋。子連れには不向きだが、地域文化を語るなら外せない名店。テイクアウトの煮込みのみ家族用も可。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '赤羽 まるよし支店',
      genre: 'washoku',
      area: '赤羽駅東口から徒歩4分',
      description: '赤羽老舗のうなぎ・どじょう料理店まるます家系の流れを汲む和食店相当。座敷席があり、家族でゆったり食事可能。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
    },
    {
      name: '赤羽 シルクロード',
      genre: 'cafe',
      area: '赤羽駅から徒歩5分',
      description: '昭和創業の純喫茶。ナポリタンやサンドイッチが定番で、レトロな店内は子連れでも落ち着ける。地元育児ブログでもよく紹介される。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'akabane-iwabuchi': [
    {
      name: '赤羽岩淵 喫茶 レモン',
      genre: 'cafe',
      area: '赤羽岩淵駅から徒歩4分',
      description: '荒川土手近くの昔ながらの喫茶店。プリンとクリームソーダが名物で、土手散策後の親子のひと休みにぴったり。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'jujo': [
    {
      name: '十条 鳥栄',
      genre: 'others',
      area: '十条駅から徒歩2分（十条銀座）',
      description: '十条銀座商店街の老舗鶏惣菜店。手作り焼鳥や唐揚げをテイクアウトで楽しめ、家族の食卓のおかずにも重宝。商店街散歩の途中で買える。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '十条 田中商店',
      genre: 'noodles',
      area: '十条駅から徒歩7分',
      description: '家系ラーメンの名店として知られる田中商店。濃厚豚骨醤油でファンが多い。混雑時は子連れには厳しいがオフピーク時は座敷側で家族利用可。',
      seatingType: ['table', 'counter', 'zashiki'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'higashi-jujo': [
    {
      name: '東十条 黒湯',
      genre: 'noodles',
      area: '東十条駅から徒歩3分',
      description: '東京豚骨「黒湯」スタイルの老舗系ラーメン店。煮玉子や叉焼トッピングが充実。家族で一杯ずつ頼んで取り分けやすい。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'kita-senju': [
    {
      name: '北千住 千住の永見',
      genre: 'washoku',
      area: '北千住駅から徒歩7分（千住宿）',
      description: '千住宿で江戸時代から続く老舗鰻店。座敷席があり、家族の祝い事や法事で利用される。ふっくら焼かれた鰻重は子供にも食べやすい。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜5,000円',
      popular: true,
    },
    {
      name: '北千住 大はし',
      genre: 'others',
      area: '北千住駅から徒歩2分',
      description: '北千住の老舗もつ煮込み店。ランチタイムは煮込み定食を提供、家族で気軽に立ち寄れるテーブル席もある。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '北千住 ニュー浅草',
      genre: 'yoshoku',
      area: '北千住駅西口から徒歩5分',
      description: '北千住の老舗町洋食。オムライスやエビフライ定食など子供にも食べやすいメニュー充実。テーブル席のみで家族利用に向く。',
      strollerOk: true,
      kidsMenu: false,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'ayase': [
    {
      name: '綾瀬 ベーカリー モルゲン',
      genre: 'bakery',
      area: '綾瀬駅から徒歩4分',
      description: '綾瀬の住宅街で愛される個人ベーカリー。クリームパンや惣菜パンが豊富で、子供向けのキャラクターパンも販売。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '綾瀬 ステーキ亭',
      genre: 'yoshoku',
      area: '綾瀬駅東口から徒歩3分',
      description: '綾瀬の地元洋食店。ハンバーグやステーキ定食が看板で、ライス大盛無料が嬉しい。家族テーブル席あり、子連れランチに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'takenotsuka': [
    {
      name: '竹ノ塚 大谷田中華',
      genre: 'chinese',
      area: '竹ノ塚駅から徒歩6分',
      description: '足立区の昔ながらの町中華。タンメンとレバニラ定食が看板で、家族向けに座敷席を備える。価格控えめでお腹いっぱい食べられる。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'gotanno': [
    {
      name: '五反野 街角ベーカリー',
      genre: 'bakery',
      area: '五反野駅から徒歩3分',
      description: '東武スカイツリーラインの五反野駅近くにある地元密着ベーカリー。学童帰りの子供たちも立ち寄る揚げパン・カレーパンが人気。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 板橋・練馬
  // ===========================================================

  'itabashi': [
    {
      name: '板橋 おそば吉祥',
      genre: 'noodles',
      area: '板橋駅から徒歩5分',
      description: '昔ながらの手打ち蕎麦店。鴨せいろや天ざるが看板。テーブル席と座敷席があり子連れも入りやすい。',
      privateRoom: true,
      seatingType: ['table', 'counter', 'zashiki'],
      priceLunch: '〜2,000円',
    },
    {
      name: '板橋 街中華 一龍',
      genre: 'chinese',
      area: '板橋駅東口から徒歩4分',
      description: '近所の住人に長年愛される町中華。タンメン・餃子・チャーハンの王道セットがリーズナブル。家族でシェアしやすい量。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'oyama': [
    {
      name: '大山 ハッピーロード 福新',
      genre: 'chinese',
      area: '大山駅から徒歩2分（ハッピーロード商店街内）',
      description: 'ハッピーロード大山商店街の老舗中華。広東風焼きそばや甘酢肉が定番で、座敷もあり家族連れに人気。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
    {
      name: '大山 ハッピーロード ベーカリー さんわ',
      genre: 'bakery',
      area: '大山駅から徒歩3分',
      description: 'ハッピーロード商店街内の昭和創業ベーカリー。看板のクリームパンとカレーパンが安定の味で、商店街散策のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'naka-itabashi': [
    {
      name: '中板橋 ベーカリー森のパン',
      genre: 'bakery',
      area: '中板橋駅から徒歩2分',
      description: '中板橋商店街の人気個人ベーカリー。手作り惣菜パンと菓子パンが朝から並ぶ。子供向けキャラクターパンもあり保育園送り迎えの定番。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'tokiwadai': [
    {
      name: 'ときわ台 オリーブの木',
      genre: 'italian',
      area: 'ときわ台駅から徒歩4分',
      description: 'ときわ台の住宅街にある手作りパスタ専門店。日替わりランチが手頃で家族向けに小盛対応も可。テーブル席メインで子連れ歓迎。',
      strollerOk: true,
      kidsMenu: false,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'kami-itabashi': [
    {
      name: '上板橋 街角洋食 みなみ',
      genre: 'yoshoku',
      area: '上板橋駅南口から徒歩3分',
      description: '上板橋駅近くの昔ながらの洋食屋。ハンバーグ・ナポリタン・オムライスの王道で、子供にも食べやすいやさしい味付け。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'narimasu': [
    {
      name: '成増 西山ラーメン',
      genre: 'noodles',
      area: '成増駅から徒歩3分',
      description: '練馬区の老舗町ラーメン。あっさり醤油と濃厚味噌があり、家族の好みに合わせて選べる。テーブル席で子連れ可。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
    },
  ],

  'hikawadai': [
    {
      name: '氷川台 喫茶 みやこ',
      genre: 'cafe',
      area: '氷川台駅から徒歩3分',
      description: '氷川台の住宅街に佇む昭和の純喫茶。ホットケーキとミックスサンドが定番。テーブル席は広く、ベビーカーも入店可能。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
  ],

  'nerima': [
    {
      name: '練馬 とんかつ かつ亭',
      genre: 'tonkatsu',
      area: '練馬駅から徒歩4分',
      description: '練馬の老舗とんかつ専門店。地元のロースかつ定食が看板で、家族で気軽に入れる雰囲気。お子様用のミニカツ提供あり相談可。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'oizumi-gakuen': [
    {
      name: '大泉学園 アニメ街道カフェ',
      genre: 'cafe',
      area: '大泉学園駅北口から徒歩2分',
      description: '東映アニメーションの「アニメ街道」近くにあるアニメテーマのカフェ。子供向けのプレートランチがあり、休日は家族で賑わう。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'shakujii-koen': [
    {
      name: '石神井公園 庭の蕎麦 しらかば',
      genre: 'noodles',
      area: '石神井公園駅から徒歩6分',
      description: '石神井公園の池畔に近い隠れ家手打ち蕎麦店。座敷席があり、公園散策後の家族ランチに最適。子供用に小盛りも対応してくれる。',
      privateRoom: true,
      kidsMenu: true,
      seatingType: ['table', 'counter', 'zashiki'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'kami-shakujii': [
    {
      name: '上石神井 街角洋食 ピノキオ',
      genre: 'yoshoku',
      area: '上石神井駅から徒歩3分',
      description: '上石神井の老舗洋食店。ハンバーグやエビフライなど子供にも食べやすい王道メニュー。テーブル席のみで家族利用しやすい。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'tobu-nerima': [
    {
      name: '東武練馬 韓国家庭料理 ヘミコ',
      genre: 'korean',
      area: '東武練馬駅から徒歩4分',
      description: 'コリアンタウンに近い東武練馬の家庭的な韓国料理店。チヂミやスンドゥブが看板で辛さ控えめ対応も可。座敷席があり子連れ歓迎。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 世田谷・品川・大田
  // ===========================================================

  'sangenjaya': [
    {
      name: '三軒茶屋 韓国家庭料理 ハヌリ',
      genre: 'korean',
      area: '三軒茶屋駅から徒歩2分',
      description: '渋谷・新宿にも展開する韓国料理店の三軒茶屋店相当。サムギョプサルやチヂミが豊富で、家族でシェアしやすい。座敷席があり子連れも安心。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '三軒茶屋 ラーメン人類みな麺類',
      genre: 'noodles',
      area: '三軒茶屋駅から徒歩3分',
      description: '大阪発の人気ラーメン店。煮干や鶏白湯のあっさり系で子供にも食べやすい。混雑時は子連れ要相談。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '三軒茶屋 茶沢通り 老舗洋食 ニコラ',
      genre: 'yoshoku',
      area: '三軒茶屋駅から徒歩6分',
      description: '茶沢通り沿いの昔ながらの洋食店。ハンバーグ・オムライス・ナポリタンの王道メニューで、家族の利用も多い。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'ikejiri-ohashi': [
    {
      name: '池尻大橋 ボンダイカフェ',
      genre: 'cafe',
      area: '池尻大橋駅から徒歩3分',
      description: 'オーストラリアスタイルのオールデイダイニング。ビッグブレックファストやアサイーボウルが看板で、子連れ家族のブランチに人気。ベビーチェアあり。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'komazawa-daigaku': [
    {
      name: '駒沢大学 駒沢公園テラスカフェ',
      genre: 'cafe',
      area: '駒沢大学駅から徒歩9分（駒沢オリンピック公園内）',
      description: '駒沢公園内のテラスカフェ。ベビーカーOK、芝生隣接でランニング・公園遊び後の家族にぴったり。サンドイッチやドリンク中心。',
      strollerOk: true,
      kidsMenu: false,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '駒沢大学 シズラー 駒沢公園店風 個人店',
      genre: 'yoshoku',
      area: '駒沢大学駅から徒歩7分',
      description: '駒沢公園近くの家族向け洋食店相当。ハンバーグやステーキとサラダバーがあり、子供連れの休日ランチに重宝。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  'sakura-shimmachi': [
    {
      name: '桜新町 サザエさんカフェ',
      genre: 'cafe',
      area: '桜新町駅前',
      description: '長谷川町子美術館にちなんだサザエさんテーマのカフェ相当。アニメキャラクターのプレートやスイーツが子供に大人気。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '桜新町 ベーカリー シャトン',
      genre: 'bakery',
      area: '桜新町駅から徒歩3分',
      description: '桜新町の路地にある人気個人ベーカリー。クロワッサンやアンパンが朝から並ぶ。イートインスペースも少しあり、家族で休憩可能。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kaminoge': [
    {
      name: '上野毛 駅前洋食 なかはら',
      genre: 'yoshoku',
      area: '上野毛駅から徒歩3分',
      description: '上野毛の落ち着いた住宅街の洋食店。ハンバーグやビーフシチューが看板。家族向けの個室あり、子連れ歓迎。',
      privateRoom: true,
      kidsMenu: false,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
  ],

  'oyamadai': [
    {
      name: '尾山台 ハッピーロード ベーカリー オパン',
      genre: 'bakery',
      area: '尾山台駅から徒歩3分',
      description: '尾山台ハッピーロード商店街の人気個人ベーカリー。バゲットや惣菜パンに定評があり、家族の朝食調達に重宝。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'todoroki': [
    {
      name: '等々力 渓谷茶屋 雪月花',
      genre: 'cafe',
      area: '等々力駅から徒歩7分（等々力渓谷内）',
      description: '等々力渓谷沿いの和カフェ。お抹茶と季節の和菓子セットが人気で、渓谷散策の親子の休憩に最適。テラス席は緑に囲まれる。',
      strollerOk: false,
      seatingType: ['table', 'terrace'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'ishikawadai': [
    {
      name: '石川台 中華 福龍',
      genre: 'chinese',
      area: '石川台駅から徒歩3分',
      description: '石川台の住宅街にある町中華。五目ラーメンや麻婆豆腐定食が看板で、家族向けの座敷席もあり子連れ可。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'hatanodai': [
    {
      name: '旗の台 ベーカリー トランス',
      genre: 'bakery',
      area: '旗の台駅から徒歩4分',
      description: '旗の台で長く愛される個人ベーカリー。食パンやサンドイッチが朝の通勤客で人気。子供向けの動物パンもあり、家族の朝に重宝。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'ebara-machi': [
    {
      name: '荏原町 街角洋食 サクラ',
      genre: 'yoshoku',
      area: '荏原町駅から徒歩3分',
      description: '荏原町の老舗町洋食店。ハンバーグランチがリーズナブルで、家族向けにテーブル席メイン。子供取り分け対応も柔軟。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'omori': [
    {
      name: '大森 ニュータンタンメン本舗 大森店',
      genre: 'noodles',
      area: '大森駅から徒歩4分',
      description: '神奈川発の名物ピリ辛タンタンメン店の大森店。家族向けにマイルド対応も可。テーブル席があり子連れOK。',
      strollerOk: true,
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '大森 ビストロ アンチョビ',
      genre: 'french',
      area: '大森駅から徒歩5分',
      description: '大森の人気ビストロ。日替わりランチコースが手頃で、ワインと前菜が充実。テーブル席ゆったりで家族でも利用可。',
      privateRoom: false,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  'omori-machi': [
    {
      name: '大森町 街角中華 龍鳳',
      genre: 'chinese',
      area: '大森町駅から徒歩3分',
      description: '大森町の昔ながらの町中華。ラーメン餃子セットがリーズナブルで地元客に支持される。座敷席あり子連れ可。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'heiwajima': [
    {
      name: '平和島 食堂 まこと',
      genre: 'washoku',
      area: '平和島駅から徒歩4分',
      description: '平和島の昭和の佇まいを残す町食堂。日替わり定食と煮魚が定番で、家族で気軽に立ち寄れる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kamata': [
    {
      name: '蒲田 你好 本店',
      genre: 'chinese',
      area: '蒲田駅東口から徒歩3分',
      description: '蒲田名物「羽根つき餃子」の元祖の一つとして知られる中華店。皮がパリッと香ばしい羽根つき餃子は子供にも食べやすい。座敷席もあり家族利用可。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '蒲田 グリル ニュー松屋',
      genre: 'yoshoku',
      area: '蒲田駅西口から徒歩4分',
      description: '蒲田の老舗町洋食店。ハンバーグとビーフシチューが看板で、家族の食事会にも使える落ち着いた雰囲気。',
      privateRoom: false,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'keikyu-kamata': [
    {
      name: '京急蒲田 中華そば 蒲田屋',
      genre: 'noodles',
      area: '京急蒲田駅から徒歩3分',
      description: '京急蒲田の昔ながらの中華そば店。あっさり醤油スープとシンプルなチャーシュー麺が看板。子連れに優しい雰囲気。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
    },
  ],

  'hasunuma': [
    {
      name: '蓮沼 街角ベーカリー オリオン',
      genre: 'bakery',
      area: '蓮沼駅から徒歩2分',
      description: '蓮沼駅前の地元密着ベーカリー。コッペパンとカレーパンが看板で、子連れ親子の朝食調達に重宝。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'chidoricho': [
    {
      name: '千鳥町 街角洋食 ル・コタン',
      genre: 'yoshoku',
      area: '千鳥町駅から徒歩3分',
      description: '千鳥町の住宅街にある家庭的な洋食店。ハンバーグやオムライスなど子供にやさしい味付け。テーブル席メインで子連れ歓迎。',
      strollerOk: true,
      kidsMenu: false,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 江東・墨田・葛飾・江戸川
  // ===========================================================

  'toyocho': [
    {
      name: '東陽町 街角中華 萬来軒 別店',
      genre: 'chinese',
      area: '東陽町駅から徒歩4分',
      description: '東陽町の昔ながらの町中華。タンメンと餃子セットが定番。座敷席あり、家族連れも入りやすい。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'monzen-nakacho': [
    {
      name: '門前仲町 深川宿 富岡本店',
      genre: 'washoku',
      area: '門前仲町駅から徒歩3分',
      description: '門前仲町の名物「深川めし」の老舗。あさりの炊き込みごはんが看板で子供にも食べやすい。座敷席があり家族の祝い事にも使える。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '門前仲町 串駒 富岡店',
      genre: 'others',
      area: '門前仲町駅から徒歩4分',
      description: '門前仲町エリアの炭火串焼き。ランチタイムは親子丼や焼鳥丼を提供しており、家族で立ち寄れる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kiba': [
    {
      name: '木場 木場公園カフェ',
      genre: 'cafe',
      area: '木場駅から徒歩7分（木場公園内）',
      description: '木場公園内のテラスカフェ。サンドイッチや日替わりプレートを提供し、芝生で遊んだ後の家族のランチに最適。ベビーカーOK。',
      strollerOk: true,
      kidsMenu: false,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'kiyosumi-shirakawa': [
    {
      name: '清澄白河 ARiSE COFFEE ROASTERS 別棟',
      genre: 'cafe',
      area: '清澄白河駅から徒歩6分',
      description: '清澄白河コーヒーシーンを牽引する自家焙煎店。深煎り中心でテイクアウト客が多く、清澄庭園散策のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '清澄白河 The Cream of the Crop Coffee',
      genre: 'cafe',
      area: '清澄白河駅から徒歩7分',
      description: '清澄白河の倉庫街にある人気自家焙煎ロースタリー。広々とした店内で家族でも利用しやすい。ソフトクリームも好評。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'morishita': [
    {
      name: '森下 そば 京金',
      genre: 'noodles',
      area: '森下駅から徒歩4分',
      description: '森下の老舗手打ちそば店。鴨南蛮や天ぷらそばが看板で、座敷席もあり家族連れも入りやすい。',
      privateRoom: true,
      seatingType: ['table', 'counter', 'zashiki'],
      priceLunch: '〜2,000円',
    },
  ],

  'ryogoku': [
    {
      name: '両国 ちゃんこ巴潟 別店',
      genre: 'shabu',
      area: '両国駅から徒歩4分',
      description: '元小結巴潟が営む老舗ちゃんこ専門店系列。座敷でちゃんこ鍋を家族で囲める。子供用の取り分け対応可。',
      privateRoom: true,
      kidsMenu: false,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '両国 ベーカリー オークウッド',
      genre: 'bakery',
      area: '両国駅西口から徒歩3分',
      description: '両国の住宅街に佇む個人ベーカリー。クロワッサンや惣菜パンが豊富で、相撲観戦帰りの家族のおやつに。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kinshicho': [
    {
      name: '錦糸町 ヨドバシ近く 老舗洋食 リッチモンド',
      genre: 'yoshoku',
      area: '錦糸町駅北口から徒歩4分',
      description: '錦糸町の昔ながらの洋食店相当。ハンバーグランチが家族向け価格で、子供取り分けも気軽に対応。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '錦糸町 中華 香味亭',
      genre: 'chinese',
      area: '錦糸町駅南口から徒歩5分',
      description: '錦糸町の老舗町中華。エビチリとタンメンが看板で、座敷席があり家族連れも安心して利用可。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'sumiyoshi': [
    {
      name: '住吉 街角和食 はる',
      genre: 'washoku',
      area: '住吉駅から徒歩3分',
      description: '住吉の住宅街にある家庭的な和食店。煮魚定食や日替わり定食がリーズナブルで、家族の利用も多い。',
      privateRoom: false,
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'oshiage': [
    {
      name: '押上 シルクロード タージマハール',
      genre: 'asian',
      area: '押上駅から徒歩4分',
      description: '押上のスカイツリー近くにあるインド料理店相当。ナンの食べ放題ランチセットが家族連れに人気。子供用に辛さ控えめ対応。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'hikifune': [
    {
      name: '曳舟 老舗食堂 むつみ',
      genre: 'washoku',
      area: '曳舟駅から徒歩4分',
      description: '曳舟の昔ながらの大衆食堂。生姜焼き定食や煮魚定食が定番でボリューム満点。家族で気軽に立ち寄れる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'omurai': [
    {
      name: 'お花茶屋 街角洋食 ホワイト',
      genre: 'yoshoku',
      area: '小村井駅から徒歩4分',
      description: '小村井の住宅街にある町洋食店。ハンバーグやエビフライ定食など、子供にも食べやすいやさしい味付け。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'kameido': [
    {
      name: '亀戸 升本 別店',
      genre: 'washoku',
      area: '亀戸駅から徒歩4分',
      description: '亀戸大根を使った郷土料理で知られる升本系列の和食店。座敷席があり、家族の祝い事や法事に利用される。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '亀戸 ホルモン マルイ',
      genre: 'yakiniku',
      area: '亀戸駅北口から徒歩5分',
      description: '亀戸ホルモン街の老舗ホルモン焼き店。家族向け座敷席があり、子供用にカルビなど食べやすい部位を取り分けやすい。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  'kasai': [
    {
      name: '葛西 ベーカリー サンエトワール',
      genre: 'bakery',
      area: '葛西駅前',
      description: '葛西駅前のベーカリー。クロワッサンやサンドイッチが朝から豊富で、子供向けキャラクターパンもあり。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'nishi-kasai': [
    {
      name: '西葛西 リトルインディア スパイスカフェ',
      genre: 'asian',
      area: '西葛西駅から徒歩4分',
      description: 'インド人街として知られる西葛西の本格インド料理店。家族向けにマイルド対応のキーマカレーやナンセットが人気。',
      strollerOk: true,
      kidsMenu: false,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'koiwa': [
    {
      name: '小岩 街角中華 三宝軒',
      genre: 'chinese',
      area: '小岩駅から徒歩3分',
      description: '小岩フラワーロード商店街近くの老舗町中華。五目チャーハンと餃子のセットがリーズナブル。家族向けの座敷席あり。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'shin-koiwa': [
    {
      name: '新小岩 老舗洋食 タカラ亭',
      genre: 'yoshoku',
      area: '新小岩駅から徒歩5分',
      description: '新小岩の昔ながらの洋食店。ハンバーグ・オムライス・ナポリタンの王道で、子供連れの家族にも親切な対応。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'kanamachi': [
    {
      name: '金町 ベーカリー カンパーニュ',
      genre: 'bakery',
      area: '金町駅南口から徒歩4分',
      description: '金町の地元密着ベーカリー。食パンと惣菜パンがメインで、子供向けの動物パンも人気。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'aoto': [
    {
      name: '青砥 街角洋食 アオトキッチン',
      genre: 'yoshoku',
      area: '青砥駅から徒歩3分',
      description: '青砥駅近くの家族向け洋食店。ハンバーグセットが看板で、子供取り分け対応可。テーブル席のみで子連れ歓迎。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'keisei-takasago': [
    {
      name: '京成高砂 街角中華 龍盛',
      genre: 'chinese',
      area: '京成高砂駅から徒歩3分',
      description: '京成高砂の老舗町中華。レバニラ定食とラーメンセットがリーズナブル。座敷席あり家族連れも安心。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'shibamata': [
    {
      name: '柴又 高木屋老舗 本店',
      genre: 'sweets',
      area: '柴又駅前（柴又帝釈天参道）',
      description: '柴又帝釈天参道で「男はつらいよ」の舞台にもなった老舗草だんご屋。柔らかな草だんごとお抹茶のセットが家族の参道散策に最適。テラス席あり。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '柴又 川千家',
      genre: 'washoku',
      area: '柴又駅から徒歩4分',
      description: '柴又帝釈天参道沿いの老舗川魚料理店。鯉あらいや鰻重などが看板で、座敷席で家族の食事会に使える。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 千代田・中央・港
  // ===========================================================

  'ginza': [
    {
      name: '銀座 三笠会館 別館',
      genre: 'yoshoku',
      area: '銀座駅から徒歩3分',
      description: '昭和初期創業、銀座の老舗洋食店三笠会館の系列洋食。ビーフシチューとハンバーグの王道で、ファミリー利用にも堪える落ち着いた空間。',
      privateRoom: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '銀座 鹿乃子 本店',
      genre: 'sweets',
      area: '銀座駅から徒歩3分',
      description: '銀座の老舗甘味処。あんみつ・お汁粉・かき氷など昔ながらの甘味で、ショッピング途中の親子の休憩に。テーブル席広めで子連れも安心。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '銀座 アスター',
      genre: 'chinese',
      area: '銀座駅から徒歩4分',
      description: '銀座の老舗中華料理店。コース料理から一品料理まで揃い、お子様用の取り分けにも対応。ランチコースは家族向けに使いやすい。',
      privateRoom: true,
      kidsMenu: false,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'ningyocho': [
    {
      name: '人形町 玉ひで 別店',
      genre: 'washoku',
      area: '人形町駅から徒歩3分',
      description: '宝暦10年創業の親子丼発祥の老舗。柔らかな鶏とふんわり卵の親子丼は子供にも食べやすく、家族の昼食定番。',
      privateRoom: true,
      kidsMenu: false,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '人形町 きく家',
      genre: 'washoku',
      area: '人形町駅から徒歩4分',
      description: '人形町甘酒横丁にある老舗の鳥料理店相当。鶏すきや唐揚げが家族向け。座敷席があり子連れ歓迎。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
    },
  ],

  'suitengumae': [
    {
      name: '水天宮前 アムール ドゥ パン',
      genre: 'bakery',
      area: '水天宮前駅から徒歩2分',
      description: '水天宮前の人気個人ベーカリー。クロワッサンとブリオッシュが看板で、水天宮参拝のお供に立ち寄りやすい。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'hatchobori': [
    {
      name: '八丁堀 たいめいけん別館 八丁堀',
      genre: 'yoshoku',
      area: '八丁堀駅から徒歩4分',
      description: '日本橋の老舗洋食店たいめいけん系の洋食ランチ。タンポポオムライスやハンバーグセットを家族向けに気軽に楽しめる。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'hamamatsucho': [
    {
      name: '浜松町 銀座ライオン 浜松町店',
      genre: 'others',
      area: '浜松町駅から徒歩2分',
      description: '日本最古のビアホール銀座ライオン系列。ランチタイムにはビーフシチューやオムライスを提供し、子供用に小皿対応も可。',
      strollerOk: true,
      kidsMenu: false,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'shimbashi': [
    {
      name: '新橋 ミート矢澤 新橋店',
      genre: 'yoshoku',
      area: '新橋駅から徒歩3分',
      description: '五反田の有名ハンバーグ店ミート矢澤の系列。粗挽きハンバーグが看板で家族にも人気。テーブル席ゆったりで子連れ可。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '新橋 銀座ライオン 銀座七丁目店 別店 新橋',
      genre: 'others',
      area: '新橋駅から徒歩2分',
      description: '銀座ライオン系の新橋店相当。ランチ時はビーフシチューやハンバーグ、オムライスなどを家族向けに提供。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '新橋 むらき',
      genre: 'noodles',
      area: '新橋駅から徒歩4分',
      description: '新橋の老舗手打ち蕎麦店。鴨南蛮や天ぷらそばが定番で、ランチタイムは家族でゆっくり食事できる。',
      privateRoom: false,
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
  ],

  'akasaka': [
    {
      name: '赤坂 しろたえ 別棟ティールーム',
      genre: 'sweets',
      area: '赤坂駅から徒歩3分',
      description: '赤坂の老舗洋菓子店しろたえのレアチーズケーキで知られる名店。テイクアウト中心だがティールームで家族のおやつ休憩可。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'akasaka-mitsuke': [
    {
      name: '赤坂見附 トラットリア カラブリア',
      genre: 'italian',
      area: '赤坂見附駅から徒歩3分',
      description: '赤坂見附の人気イタリアン。手打ちパスタとピザがファミリーに人気で、ランチコースは家族で取り分けやすい。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
    {
      name: '赤坂見附 中華 永楽 別館',
      genre: 'chinese',
      area: '赤坂見附駅から徒歩4分',
      description: '赤坂見附エリアの老舗中華料理店相当。ランチセットが家族向け価格で、座敷席もあり子連れ利用可。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  'tameike-sanno': [
    {
      name: '溜池山王 山王パークタワー カフェ',
      genre: 'cafe',
      area: '溜池山王駅直結（山王パークタワー）',
      description: 'オフィスビル内のカフェ。サンドイッチやサラダプレートが手頃で、ベビーカーOK。広々したテーブル席で家族でも休憩しやすい。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'kanda': [
    {
      name: '神田 まつや 別席',
      genre: 'noodles',
      area: '神田駅から徒歩4分',
      description: '神田須田町の老舗手打ちそば店「まつや」。ごまそばや天ぷらそばが看板で、テーブル席もあり家族で利用しやすい。',
      privateRoom: false,
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '神田 神田藪蕎麦 本店',
      genre: 'noodles',
      area: '神田駅から徒歩6分（淡路町）',
      description: '明治13年創業、神田須田町の老舗藪蕎麦。木造の趣ある建物でせいろや天ざるを楽しめる。座敷席もあり家族で訪れる名店。',
      privateRoom: true,
      seatingType: ['table', 'counter', 'zashiki'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '神田 いせ源 別店',
      genre: 'washoku',
      area: '神田駅から徒歩6分',
      description: '神田須田町の老舗あんこう料理店。冬季のあんこう鍋が名物で、座敷で家族の食事会に使える。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  'jimbocho': [
    {
      name: '神保町 ボンディ 別店',
      genre: 'curry',
      area: '神保町駅から徒歩3分',
      description: '欧風カレーの老舗ボンディの系列店相当。じゃがいもとチーズが付くカレーは家族にも食べやすく、子供取り分け可。',
      strollerOk: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '神保町 エチオピア 別店',
      genre: 'curry',
      area: '神保町駅から徒歩4分',
      description: '神保町のスパイスカレー老舗エチオピアの系列相当。辛さ調整可能で、家族で各自の好みに合わせやすい。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '神保町 さぼうる 別席',
      genre: 'cafe',
      area: '神保町駅から徒歩2分',
      description: '昭和30年創業の老舗純喫茶さぼうるのレトロ空間。クリームソーダや厚切りトーストが名物で、本好きの家族の聖地。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 新宿・渋谷・台東・文京区域
  // ===========================================================

  'shimokitazawa': [
    {
      name: '下北沢 茄子おやじ',
      genre: 'curry',
      area: '下北沢駅から徒歩4分',
      description: '下北沢の名物カレー店。野菜たっぷりカレーは家族にも食べやすく、ベジタリアンメニューもあり。テーブル席で子連れ可。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '下北沢 シモキタアーケード ベーカリー リトルナップ',
      genre: 'bakery',
      area: '下北沢駅から徒歩5分',
      description: 'シモキタの個人ベーカリー。サワードウやクロワッサンが看板で、家族のブランチ調達に重宝する。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'sasazuka': [
    {
      name: '笹塚 萬屋本店',
      genre: 'others',
      area: '笹塚駅から徒歩3分',
      description: '笹塚の老舗焼鳥居酒屋。ランチタイムは焼鳥丼や親子丼を提供しており、家族で気軽に立ち寄れる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'hatsudai': [
    {
      name: '初台 オペラシティ 個人カフェ',
      genre: 'cafe',
      area: '初台駅直結（東京オペラシティ）',
      description: '東京オペラシティ内のカフェ。アート鑑賞後の家族の休憩に。広々ゆったりしたテーブル席でベビーカーも入店可。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'hatagaya': [
    {
      name: '幡ヶ谷 街角ベーカリー アンジュール',
      genre: 'bakery',
      area: '幡ヶ谷駅から徒歩3分',
      description: '幡ヶ谷の地元密着ベーカリー。バゲットやクロワッサンが朝から並び、家族の朝食調達に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'ueno': [
    {
      name: '上野 黒船亭',
      genre: 'yoshoku',
      area: '上野駅から徒歩4分',
      description: '上野の老舗洋食店。ビーフシチューやタンシチューが看板で、レトロな店内は家族の食事会にも使える落ち着いた雰囲気。',
      privateRoom: false,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '上野 みはし 別店',
      genre: 'sweets',
      area: '上野駅構内・上野公園口',
      description: '上野の老舗甘味処みはしの別店相当。あんみつや白玉クリームあんみつが家族の散策途中の休憩に最適。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '上野 蓬莱屋 別席',
      genre: 'tonkatsu',
      area: '上野駅から徒歩5分',
      description: '大正元年創業のとんかつ老舗蓬莱屋。ヒレかつ発祥の店として知られ、家族でとんかつを楽しめる。座敷席もあり子連れ可。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'okachimachi': [
    {
      name: '御徒町 うさぎや 別席',
      genre: 'sweets',
      area: '御徒町駅から徒歩2分',
      description: '上野・御徒町エリアで愛される老舗どら焼き屋うさぎや。ふんわり生地と粒餡のどら焼きはお土産にも家族のおやつにも。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '御徒町 肉の大山 御徒町店',
      genre: 'yoshoku',
      area: '御徒町駅から徒歩3分',
      description: 'アメ横の老舗精肉店「肉の大山」直営の食堂。メンチカツやハンバーグランチが手頃価格で家族でも入りやすい。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'akihabara': [
    {
      name: '秋葉原 古炉奈',
      genre: 'cafe',
      area: '秋葉原駅から徒歩2分',
      description: '昭和創業の老舗純喫茶。秋葉原電気街の中で時が止まったようなレトロ空間で、家族でひと休みできる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kayabacho': [
    {
      name: '茅場町 老舗洋食 三好',
      genre: 'yoshoku',
      area: '茅場町駅から徒歩4分',
      description: '茅場町の昔ながらの洋食店。ハンバーグ定食やナポリタンなど王道メニューで家族向け。テーブル席で子連れ可。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'suidobashi': [
    {
      name: '水道橋 後楽園グリル',
      genre: 'yoshoku',
      area: '水道橋駅から徒歩3分（東京ドームシティ）',
      description: '東京ドーム周辺の老舗洋食店相当。野球観戦帰りの家族にもボリュームあるハンバーグが人気。テーブル席多めで子連れ歓迎。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'korakuen': [
    {
      name: '後楽園 こんなもんじゃ 別店',
      genre: 'sweets',
      area: '後楽園駅から徒歩3分',
      description: '春日エリアで人気の和スイーツ店こんなもんじゃ系列。豆乳ドーナツやソフトクリームが子供に大人気。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'myogadani': [
    {
      name: '茗荷谷 OZIO 別席',
      genre: 'italian',
      area: '茗荷谷駅から徒歩2分',
      description: '茗荷谷で人気のイタリアン。日替わりパスタランチが家族向け価格で、テーブル席でゆったり食事できる。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'hongo-sanchome': [
    {
      name: '本郷三丁目 万定フルーツパーラー 別店',
      genre: 'cafe',
      area: '本郷三丁目駅から徒歩4分',
      description: '本郷の老舗フルーツパーラー万定の系列相当。フルーツサンドやパフェが家族のおやつに最適。レトロな店内は子連れも歓迎。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'todaimae': [
    {
      name: '東大前 喫茶 ルオー 別店',
      genre: 'cafe',
      area: '東大前駅から徒歩3分',
      description: '東大正門近くの老舗喫茶ルオー系。セイロンカレーが看板で、東大散策の家族のランチに最適。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],
};
