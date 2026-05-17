/**
 * 駅別 個人店マッピング — chunk-27（東京・子連れランチ拡充：豊島・北・荒川・板橋・練馬の24駅）
 *
 * - 各駅ごとに Web 調査で実名が確認できた実在の個人店のみを掲載
 * - チェーン店・グループ系・店名不明の店は除外
 * - 子連れ向き設備（ベビーカー・座敷・おむつ替え等）は公開情報・取材記事ベースの推定。
 *   最終的には店舗確認前提。
 * - 食べログ点数等の数値スコアは引用していない
 * - 同じ駅 slug は index.ts の mergeIndieMaps で結合される
 */

import type { StationIndieMap } from './types';

export const CHUNK_27: StationIndieMap = {
  // ===========================================================
  // 目白（豊島区）
  // ===========================================================
  'mejiro': [
    {
      name: 'happy 〜みんなのkitchen〜',
      genre: 'yoshoku',
      area: '目白駅から徒歩約8分（目白1丁目）',
      description:
        'ホテル出身シェフ夫婦が営む家庭的な洋食店。ハンバーグとカニクリームコロッケのセットなどボリュームのあるランチが800円台と手頃で、アットホームな雰囲気なので子連れでも入りやすい。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 大塚（豊島区）
  // ===========================================================
  'otsuka': [
    {
      name: 'ネパリダイニング ダルバート',
      genre: 'asian',
      area: '大塚駅から徒歩2分',
      description:
        'カフェのようなおしゃれな店内のネパール料理店。窓際の席からは都電が見えて子どもも喜ぶ。事前に相談すれば子ども向けの食事にも対応してもらえる。',
      kidsMenu: true,
      seatingType: ['table'],
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'ラーケ（LAKHE）',
      genre: 'asian',
      area: '大塚駅南口から徒歩2分',
      description:
        'ビル2階のネパール料理店。ダルバートのスペシャルセットやカナセットがあり、ダルとごはんはおかわり自由。スパイスを控えめにしてもらえば子どもと取り分けやすい。',
      seatingType: ['table'],
      shareDish: true,
      stepFree: false,
      priceLunch: '〜2,000円',
    },
    {
      name: 'カスタマンダップ',
      genre: 'asian',
      area: '大塚駅から徒歩2分',
      description:
        'ネパール民族料理の店。ダルバートはダルとごはんがおかわりOKで、スタッフが気さくに声をかけてくれる。シェアしながら食べられるので家族での利用にも向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 巣鴨（豊島区）
  // ===========================================================
  'sugamo': [
    {
      name: '鮒いち 巣鴨店',
      genre: 'washoku',
      area: '巣鴨駅北口から徒歩1分',
      description:
        '個室が充実した和食店。キッズチェアを完備し、離乳食の持ち込みもOK、ベビーカーは折りたためば入店できる。駅近で雨の日も移動が楽な子連れ向きの一軒。',
      privateRoom: true,
      kidsChair: true,
      bringBabyFood: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'コパン巣鴨',
      genre: 'italian',
      area: '巣鴨駅から徒歩4分',
      description:
        '路地裏にあるイタリアン。掘りごたつ式の個室があり、小さい子どもでも周りを気にせず過ごせる。前菜からドルチェまで付くランチコースで取り分けもしやすい。',
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'タカセ 巣鴨店',
      genre: 'yoshoku',
      area: '巣鴨駅から徒歩3分',
      description:
        '老舗パン店が手がける洋食レストラン。ハンバーグやビーフシチューが看板で、自家製パンがおかわり自由。子ども向けメニューもあり、6名から使える個室も備える。',
      kidsMenu: true,
      privateRoom: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'Pastaio Labo（パスタイオ ラボ）',
      genre: 'italian',
      area: '巣鴨駅A3出口からすぐ（ナカヤビルB1）',
      description:
        '駅出口すぐのイタリアンバル。ベビーカーで入店でき、ベビーチェアも用意。パスタを3種から選べるキッズプレートがあり、子連れランチに使いやすい。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      stepFree: true,
      bringBabyFood: true,
      shareDish: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'cafe Kiichi',
      genre: 'cafe',
      area: '庚申塚駅から徒歩1分',
      description:
        '都電沿いの小さな喫茶カフェ。予算500円ほどと手頃で、ベビーカーのまま入店OK。都電散歩の途中にひと休みできる気取らない雰囲気が魅力。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 駒込（豊島区）
  // ===========================================================
  'komagome': [
    {
      name: '親子カフェ おひさまごはん',
      genre: 'cafe',
      area: '駒込駅から徒歩圏内',
      description:
        '店内にキッズスペースがあり席から様子が見える親子カフェ。子ども用食器・バウンサー・おむつ交換台・授乳室まで揃う。日替わりの優しい味のランチが楽しめる。',
      kidsMenu: true,
      kidsSpace: true,
      kidsCutlery: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      nursingRoom: true,
      shareDish: true,
      kidsChair: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '岩むら',
      genre: 'washoku',
      area: '駒込駅東口から徒歩3分',
      description:
        '2階のお座敷を個室として少人数から利用できる和食店。ベビーカー入店も可能で、子連れでも落ち着いてランチができる。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'エルバ',
      genre: 'italian',
      area: '駒込駅から徒歩7分',
      description:
        '2名から使える個室があるイタリア料理店。子どもと一緒にゆっくりランチができ、コースの取り分けもしやすい。',
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'クッチーナイタリアーナ ズッカ',
      genre: 'italian',
      area: '駒込駅東口から徒歩7分',
      description:
        '子連れOKのイタリアン。子ども用の椅子が用意され、お子様ランチも500円とリーズナブル。家族での普段使いに向く。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      bringBabyFood: true,
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 東池袋（豊島区）
  // ===========================================================
  'higashi-ikebukuro': [
    {
      name: 'ラシーヌ ファーム トゥー パーク',
      genre: 'cafe',
      area: '東池袋駅から徒歩圏内（南池袋公園内）',
      description:
        '南池袋公園内のカフェレストラン。テラス席があり芝生を眺めながら過ごせる。ベビーカーで入店でき、公園で遊んだ前後の休憩にぴったり。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'THE DOME',
      genre: 'italian',
      area: '東池袋駅から徒歩圏内',
      description:
        'キッズスペースを常設したイタリアンレストラン。子どもが遊べる場所があるので、親もゆっくり食事を楽しめる子連れ向きの一軒。',
      kidsSpace: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      shareDish: true,
      kidsChair: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'はちくまカフェ',
      genre: 'cafe',
      area: '東池袋駅から徒歩圏内',
      description:
        'フレンチトーストが人気の北欧風カフェ。落ち着いた雰囲気でランチもでき、家族でのんびり過ごしやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 赤羽（北区）
  // ===========================================================
  'akabane': [
    {
      name: 'ペンナロッソ（PENNA ROSSO）',
      genre: 'italian',
      area: '赤羽駅から徒歩圏内（赤羽南1丁目）',
      description:
        '自家製にこだわった前菜からデザートまで楽しめるイタリアン。店の奥に個室風の席があり、子ども用食器も完備。家族でゆっくりランチができる。',
      privateRoom: true,
      kidsCutlery: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'いろむすびcafe',
      genre: 'cafe',
      area: '赤羽駅から徒歩圏内（中十条4丁目・コトニア赤羽1F）',
      description:
        '小さい子のいるママが集まるコミュニティカフェ。広い店内にベビーサークル・絵本・おもちゃ・バウンサーがあり、無農薬野菜のランチや離乳食の持ち込みもOK。',
      strollerOk: true,
      kidsMenu: true,
      kidsSpace: true,
      bringBabyFood: true,
      seatingType: ['table'],
      stepFree: true,
      diaperChangingTable: true,
      strollerToSeat: true,
      kidsChair: true,
      kidsCutlery: true,
      priceLunch: '〜1,000円',
    },
    {
      name: 'ピースカフェ',
      genre: 'cafe',
      area: '赤羽駅から徒歩圏内（中十条4丁目・コトニア赤羽1F）',
      description:
        'ベビーカーを広げたまま過ごせるカフェ。テラス席もあり、赤ちゃんが寝てしまってもゆっくり食事ができる。パスタやピザなど子ども好みのメニューが揃う。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      stepFree: true,
      bringBabyFood: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 王子（北区）
  // ===========================================================
  'oji': [
    {
      name: 'トラットリア みのり',
      genre: 'italian',
      area: '王子駅から徒歩圏内',
      description:
        'パスタやナポリピザが楽しめるおしゃれなイタリアン。ランチはドリンク付きで980円からと手頃で、お子様メニューもあり。店内のピアノで生演奏が行われる日も。',
      kidsMenu: true,
      seatingType: ['table'],
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'ピアンタ 王子店',
      genre: 'italian',
      area: 'JR王子駅から徒歩4分',
      description:
        '子連れ歓迎のイタリアン。テーブル席のほかソファー席もあり、リーズナブルなランチセットが揃う。気兼ねなく家族で利用しやすい雰囲気。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'TAGEN DINING CAFE',
      genre: 'french',
      area: 'JR王子駅から徒歩すぐ',
      description:
        'おしゃれな店内でカジュアルにフレンチを楽しめるダイニングカフェ。駅近でアクセスがよく、子連れでも入りやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 十条（北区）
  // ===========================================================
  'jujo': [
    {
      name: 'Bonnel Cafe（ボンヌカフェ）',
      genre: 'cafe',
      area: '十条駅から徒歩圏内（十条銀座商店街内）',
      description:
        '商店街の中にあるチョコレートカフェ。イートインスペースは子ども部屋のような優しいつくりで、3階は子どもも遊べるカーペット敷きの空間になっている。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'よろづや',
      genre: 'bakery',
      area: '十条駅から徒歩圏内（十条銀座商店街内）',
      description:
        '商店街にあるベーカリーカフェ。明るく開放的な店内で、自家製パンをこだわりのドリンクと一緒に楽しめる。買い物の合間の子連れ休憩にも。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '明かり富士',
      genre: 'asian',
      area: '十条駅から徒歩圏内',
      description:
        'ネパール・インド料理のアジアンダイニング。ランチの本格インドカレーが人気で、お子様ランチもワンコインながら充実した内容。辛さ控えめにも対応。',
      kidsMenu: true,
      seatingType: ['table'],
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜1,000円',
    },
    {
      name: 'TOM BOY',
      genre: 'italian',
      area: '十条駅から徒歩すぐ',
      description:
        '一軒家のイタリアン＆スペイン料理店。個室があり、落ち着いたランチタイムを過ごせる。子連れでも周りを気にせずゆっくりできる。',
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 田端（北区）
  // ===========================================================
  'tabata': [
    {
      name: 'カプリカフェ アトレヴィ田端店',
      genre: 'cafe',
      area: 'JR田端駅直結（アトレヴィ田端3F）',
      description:
        '窓際から在来線や新幹線を見下ろせる電車好きに人気のカフェ。新幹線プレートのお子様ランチがあり、キッズチェア・子ども用食器・ミルク用のお湯も用意。同フロアにベビーベッドあり。',
      kidsMenu: true,
      kidsChair: true,
      kidsCutlery: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      bringBabyFood: true,
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'やかん',
      genre: 'korean',
      area: '田端駅から徒歩圏内',
      description:
        '韓国料理の居酒屋で、11時半から15時までランチ営業。スンドゥブやキムチチゲなど本格的な韓国料理が楽しめ、辛さを調整すれば家族で取り分けやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 日暮里（荒川区）
  // ===========================================================
  'nippori': [
    {
      name: 'TAYORI（タヨリ）',
      genre: 'cafe',
      area: '日暮里駅北口から徒歩6分（谷中銀座近く）',
      description:
        '古民家を改装した趣のあるカフェ。畳の席があり小さな子連れでも安心。彩り豊かでヘルシーな「TAYORI定食」が人気で、お惣菜やお弁当のテイクアウトもできる。',
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'MANNISH（マニッシュ）',
      genre: 'noodles',
      area: '日暮里駅から徒歩圏内',
      description:
        'こってりした塩ラーメンが看板の専門店。子ども連れも歓迎で、ベビーカーのまま入店できる。麺を取り分けて家族でシェアもしやすい。',
      strollerOk: true,
      seatingType: ['counter', 'table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 西日暮里（荒川区）
  // ===========================================================
  'nishi-nippori': [
    {
      name: 'つむぐカフェ',
      genre: 'cafe',
      area: '西日暮里駅から千駄木方面に徒歩圏内',
      description:
        '小上がりの席があり子どもも落ち着いて食事ができるカフェ。ウェットティッシュや紙エプロンを用意してくれ、トイレにはおむつ交換台や補助便座もある。',
      seatingType: ['zashiki', 'table'],
      diaperChangingTable: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '天外天',
      genre: 'chinese',
      area: '西日暮里駅から徒歩約10分',
      description:
        '110席ある広々とした四川料理店。ベビーカーのままでも余裕がある店内で、大皿料理を家族で取り分けながら楽しめる。',
      strollerOk: true,
      seatingType: ['table'],
      shareDish: true,
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 南千住（荒川区）
  // ===========================================================
  'minami-senju': [
    {
      name: 'あいるとんかふぇ',
      genre: 'cafe',
      area: '南千住駅から徒歩圏内',
      description:
        '北海道産小麦の自家製パンが特徴の喫茶店。店員さんがフレンドリーで子どもにクッキーをくれることも。ランチにドリンクを付けると割引もあり、子連れに優しい。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: 'Tricolore（トリコロール）',
      genre: 'cafe',
      area: '南千住駅から徒歩圏内（泪橋近く）',
      description:
        '入口で靴を脱いで上がる家庭的なおうちカフェ。アットホームな雰囲気で、小さな子ども連れでもくつろぎやすい。',
      seatingType: ['zashiki'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 町屋（荒川区）
  // ===========================================================
  'machiya': [
    {
      name: 'カド珈琲',
      genre: 'cafe',
      area: '町屋駅から徒歩圏内',
      description:
        '小上がり席があり子どもが落ち着けるカフェ。テーブル席・カウンター席もあり、ランチタイムはパスタやサンドイッチが楽しめる。',
      seatingType: ['zashiki', 'table', 'counter'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'TOKYO L.O.C.A.L BASE',
      genre: 'cafe',
      area: '町屋駅から徒歩10分',
      description:
        '入口がスロープになっていてベビーカー入店が楽な広々としたカフェ。平日限定の日替わりランチが手頃で、キッズメニューやおむつ替えシートも完備。',
      strollerOk: true,
      stepFree: true,
      kidsMenu: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜1,000円',
    },
    {
      name: '鈴木製作所',
      genre: 'cafe',
      area: '町屋駅から徒歩5分',
      description:
        'ベビーカー入店ができるカフェ。自家製カレーセットやハンバーグセット、ホワイトシチューセットが800円ほどと手頃で、子連れの普段使いに向く。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
    {
      name: 'ベンガル料理 プージャー',
      genre: 'asian',
      area: '町屋駅から徒歩10分',
      description:
        'ビル地下のベンガル料理店。ベビーカー入店OKで、キーマカレー・ライス・りんごジュースが付くお子様セットがある。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      stepFree: false,
      shareDish: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 板橋（板橋区）
  // ===========================================================
  'itabashi': [
    {
      name: '魚がし寿司',
      genre: 'sushi',
      area: '板橋駅西口から徒歩2分',
      description:
        '1967年創業の老舗寿司店。子連れの来店も可能で、カウンターのほか6人ほど座れるテーブル席もある。ランチなら特上セットも手頃に味わえる。',
      seatingType: ['counter', 'table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '華興',
      genre: 'chinese',
      area: '板橋駅から徒歩10分',
      description:
        '1948年創業の老舗中華料理店。小さな子どもでも入りやすい雰囲気で、子ども用の椅子を出してもらえる。大皿を取り分けて家族で楽しめる。',
      kidsChair: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 高島平（板橋区）
  // ===========================================================
  'takashimadaira': [
    {
      name: 'cafe hanahana',
      genre: 'cafe',
      area: '高島平駅から徒歩圏内',
      description:
        '一人で営む小さなカフェ。季節のパフェや夏のかき氷が名物で、通常ランチも人気。こぢんまりとした落ち着いた空間で過ごせる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'ちゃい菜食堂 KIKOBO',
      genre: 'chinese',
      area: '高島平駅から徒歩圏内',
      description:
        '民家を改築した街の中華屋さん。おうちのような温かい雰囲気で、一番奥には広々使える個室もある。リーズナブルでメニューが豊富、取り分けもしやすい。',
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
    {
      name: '中国四川料理 剣閣 高島平店',
      genre: 'chinese',
      area: '新高島平駅から徒歩3分',
      description:
        '完全個室のある本格四川料理店。入口すぐのU字型ソファー席は小さな子ども連れでも安心。ランチは一品50円のサイドが選べ、家族で取り分けやすい。',
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // ときわ台（板橋区）
  // ===========================================================
  'tokiwadai': [
    {
      name: 'ノタリ',
      genre: 'cafe',
      area: 'ときわ台駅南口から徒歩圏内',
      description:
        'カントリー風の外観が目印の喫茶カフェ。カレードリアやチーズケーキが楽しめ、接客が温かく居心地がよい。子連れでものんびり過ごせる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'デ・ラ・ナチュール',
      genre: 'cafe',
      area: 'ときわ台駅北口から徒歩圏内',
      description:
        '海外風のおしゃれなカフェ。日替わりランチがあり、落ち着いたクラシカルな店内とテラス席で過ごせる。',
      seatingType: ['table', 'terrace'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'ラ パレット',
      genre: 'cafe',
      area: 'ときわ台駅から徒歩圏内',
      description:
        '白を基調とした落ち着いた店内のカフェ。ランチはパスタまたはカレーにサラダとドリンクが付くセット。手作りのシフォンケーキも人気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '1 ROOM COFFEE（ワンルームコーヒー）',
      genre: 'cafe',
      area: 'ときわ台駅から徒歩圏内',
      description:
        'あんバタートーストが人気のカフェ。こぢんまりとした空間で、コーヒーと軽食をのんびり楽しめる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 東武練馬（板橋区）
  // ===========================================================
  'tobu-nerima': [
    {
      name: '米とひなた',
      genre: 'tonkatsu',
      area: '東武練馬駅南口から徒歩圏内',
      description:
        '国産豚にこだわるとんかつ店。ロースカツ定食やヒレカツ丼があり、キャベツとごはんはおかわり自由。ベビーカー入店もOKで家族で利用しやすい。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '日々是君想',
      genre: 'washoku',
      area: '東武練馬駅南口から徒歩圏内',
      description:
        '裏路地にある居酒屋で、ランチタイムは子どもOK。看板の海鮮丼は新鮮なお刺身がのって1,000円ほどと手頃。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
    },
    {
      name: 'はなびし',
      genre: 'curry',
      area: '東武練馬駅北口から徒歩3分',
      description:
        'バターチキンやチキンキーマなど10種類から選べるカレー専門店。ベビーカーでも気軽に利用できる。店舗は2階のため階段に注意。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: false,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 成増（板橋区）
  // ===========================================================
  'narimasu': [
    {
      name: 'トラットリア パッキーノ',
      genre: 'italian',
      area: '成増駅前のビル3F',
      description:
        '駅前の創作イタリアン。ランチタイムが11時から17時と長めで、リーズナブルなメニューは大盛りにも対応。通路が広めでベビーカーでも入りやすく、子どもとの取り分けにも向く。',
      strollerOk: true,
      seatingType: ['table'],
      shareDish: true,
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'タイ料理 セーンタイ',
      genre: 'asian',
      area: '成増駅南口から徒歩3分',
      description:
        'タイ人シェフが作る本格タイ料理をリーズナブルに味わえる店。駅近でアクセスがよく、辛さを調整すれば家族でシェアしやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 練馬（練馬区）
  // ===========================================================
  'nerima': [
    {
      name: 'デンマークベーカリー',
      genre: 'bakery',
      area: '西武池袋線「練馬駅」西口すぐ',
      description:
        '昭和9年創業のカレーパン発祥の店。2階がカフェスペースになっていて、地元の「ねりまだいこん酵母」を使ったパンを軽食として楽しめる。子連れでひと休みしやすい。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: 'カフェ・レストラン樹藝夢',
      genre: 'cafe',
      area: '練馬駅から徒歩約10分（渋谷園芸内）',
      description:
        '園芸店の中にある緑豊かなロケーションのカフェ。ベビーカーでも座れる席があり、植物に囲まれてゆっくりランチができる。予約がおすすめ。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'たびえもん',
      genre: 'cafe',
      area: '練馬駅から桜台方面に徒歩約10分',
      description:
        '旅行会社を兼ねたカフェ。小上がりのスペースがあり、ねんねの赤ちゃん連れでも安心して過ごせる。',
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 光が丘（練馬区）
  // ===========================================================
  'hikarigaoka': [
    {
      name: 'カフェレストラン われもこう',
      genre: 'cafe',
      area: '光が丘駅から徒歩圏内（光が丘公園・区立光が丘体育館1F）',
      description:
        '光が丘公園内の体育館1階にあるバリアフリーのカフェレストラン。オープンテラスがあり子どもを遊ばせながらランチができ、子ども用の椅子も用意。光が丘御膳やカレーが手頃。',
      strollerOk: true,
      stepFree: true,
      kidsChair: true,
      seatingType: ['table', 'terrace'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
    {
      name: 'ラ コリーナディ ルーチェ',
      genre: 'italian',
      area: '光が丘駅から徒歩圏内',
      description:
        'ガラス張りでサンシェードが目印のイタリアン。店内は広々として明るく、ベビーカーや子ども用椅子を置けるスペースがあり、家族でゆっくりランチが楽しめる。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 石神井公園（練馬区）
  // ===========================================================
  'shakujii-koen': [
    {
      name: 'カフェコメコ',
      genre: 'cafe',
      area: '石神井公園駅から徒歩圏内',
      description:
        'ベビーカーで入店できるカフェ。1階におむつ替えスペースがあり、子ども用のメニューも用意。米粉を使った料理が楽しめる。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      stepFree: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'すまいる・VIVIFY',
      genre: 'cafe',
      area: '石神井公園駅から徒歩5分',
      description:
        '社会福祉法人が運営する誰でもくつろげるカフェ。パン屋やケーキ屋で買ったものを持ち込んで食べることもでき、子連れでも気兼ねなく過ごせる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: 'Welders diner',
      genre: 'cafe',
      area: '石神井公園駅から徒歩5分',
      description:
        '完全禁煙で子連れ利用ができるダイナー風カフェ。ランチには子ども向けのトーストセットなども用意されている。',
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],
};
