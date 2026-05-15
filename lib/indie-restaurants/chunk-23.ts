/**
 * 駅別 個人店マッピング — chunk-23（東京・子連れランチ拡充 港区・新宿区エリア）
 *
 * - 各駅ごとに Web 調査で実在を確認した実名の個人店のみを掲載
 * - 子連れ向き設備（ベビーカー・座敷・おむつ替え等）は公開情報・取材記事ベースの推定。
 *   最終的には店舗確認前提。
 * - 食べログ点数等の数値スコアは引用していない
 * - chunk-1〜22 と同じ駅 slug は index.ts の mergeIndieMaps で結合される
 */

import type { StationIndieMap } from './types';

export const CHUNK_23: StationIndieMap = {
  // ===========================================================
  // 品川（港区）
  // ===========================================================
  'shinagawa': [
    {
      name: '品川駅前すし処 藤寿司',
      genre: 'sushi',
      area: '品川駅から徒歩約1分',
      description:
        '豊洲市場の新鮮な海鮮を落ち着いた和の店内で味わえる寿司店。みそ汁・デザート付きのランチは900円台からと手頃。座敷席や個室があり、折りたためばベビーカーでの入店も可能。',
      privateRoom: true,
      seatingType: ['counter', 'table', 'zashiki'],
      priceLunch: '〜1,000円',
    },
    {
      name: 'ママプラスカフェ',
      genre: 'cafe',
      area: '品川駅から徒歩圏（古民家カフェ）',
      description:
        '2階建ての古民家カフェで、各フロアにおもちゃや絵本が並ぶキッズスペースを完備。手作りのキッズランチや離乳食を提供し、持ち込みもOK。授乳室・ベビーベッドありで赤ちゃん連れも安心。',
      kidsMenu: true,
      kidsSpace: true,
      seatingType: ['zashiki'],
      nursingRoom: true,
      bringBabyFood: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 新橋（港区）
  // ===========================================================
  'shimbashi': [
    {
      name: '青森のお台所 わのみせ 新橋店',
      genre: 'washoku',
      area: '新橋駅汐留口直結（ウィング新橋内）',
      description:
        '青森の郷土料理を味わえる和食店で、駅直結のショッピングセンター内にあり雨でもアクセスが楽。3〜4名で使える個室があり、ベビーカーのまま入店もできるので子連れランチに使いやすい。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '活魚料理 ととや',
      genre: 'washoku',
      area: '新橋駅から徒歩1分',
      description:
        '新鮮な魚介の定食を出す和食店。駅から徒歩1分とアクセスがよく、4名から使える個室がある。ランチタイムは禁煙なので、小さな子ども連れでも落ち着いて食事ができる。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 田町（港区）
  // ===========================================================
  'tamachi': [
    {
      name: '五代目 おかめ鮨',
      genre: 'sushi',
      area: 'JR田町駅から徒歩8分',
      description:
        '安政2年創業の老舗江戸前寿司店。名物のばらちらしが人気で、おまかせちらしは1,000円台とランチは手頃。テーブル個室が2室あり、家族連れも入りやすい雰囲気づくりをしている。',
      privateRoom: true,
      seatingType: ['counter', 'table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'Cafe Lounge COLON',
      genre: 'cafe',
      area: '田町駅から徒歩圏',
      description:
        '店内がベビーカーでも通れるゆったりした造りのカフェ。完全個室があり、ママ友との集まりや子連れランチに向く。落ち着いた空間でゆっくり過ごせる。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 三田（港区）
  // ===========================================================
  'mita': [
    {
      name: '五代目 おかめ鮨',
      genre: 'sushi',
      area: '都営三田線 三田駅から徒歩8分',
      description:
        '安政2年創業の老舗江戸前寿司店。名物のばらちらしが評判で、おまかせちらしは1,000円台とランチは手頃。4〜10名のテーブル個室が2室あり、家族での食事にも使いやすい。',
      privateRoom: true,
      seatingType: ['counter', 'table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 浜松町（港区）
  // ===========================================================
  'hamamatsucho': [
    {
      name: '炉端かば 東京浜松町店',
      genre: 'washoku',
      area: 'JR浜松町駅から徒歩2分',
      description:
        '炉端焼きが楽しめる和食店。8名から使える掘りごたつ式の個室があり、子ども用の食器を貸し出してくれる。離乳食の持ち込みもOKで、赤ちゃん連れでも気兼ねなく利用できる。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      bringBabyFood: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 大門（港区）
  // ===========================================================
  'daimon': [
    {
      name: '炉端かば 東京浜松町店',
      genre: 'washoku',
      area: '大門駅から徒歩圏（浜松町駅すぐ）',
      description:
        '炉端焼きが楽しめる和食店。8名から使える掘りごたつ式の個室があり、子ども用食器の貸し出しや離乳食の持ち込みに対応。子連れのグループランチに向く一軒。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      bringBabyFood: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 六本木（港区）
  // ===========================================================
  'roppongi': [
    {
      name: '512 CAFE & GRILL',
      genre: 'cafe',
      area: '六本木駅から徒歩圏',
      description:
        '木々に囲まれた緑あふれる空間のカフェ＆グリル。ベビーカーでの来店が可能で、開放的なテラス席もあり、スイーツを食べながらのんびり過ごせる。子連れの休憩にも向く。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'マーサーブランチ 六本木',
      genre: 'cafe',
      area: '六本木駅から徒歩圏',
      description:
        '暖炉やソファを配したラグジュアリーな空間のオールデイダイニング。ほとんどの席がソファ席なので、子連れでもゆったりくつろぎながらブランチやランチを楽しめる。',
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 麻布十番（港区）
  // ===========================================================
  'azabu-juban': [
    {
      name: '麻布 川上庵',
      genre: 'noodles',
      area: '麻布十番駅から徒歩圏',
      description:
        '自家製粉のそば粉を使った蕎麦が人気の和モダンな店。地下にあるがエレベーターがありベビーカーのまま入店でき、テラス席や個室も。子連れママでも落ち着いて過ごせる。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['table', 'terrace'],
      priceLunch: '〜2,000円',
    },
    {
      name: '小料理屋 RUKA 麻布十番',
      genre: 'washoku',
      area: '麻布十番駅から徒歩圏',
      description:
        'おばんざいや小皿料理に博多料理を取り入れた小料理屋。唐揚げ定食など子どもも食べやすいメニューがあり、個室ありでベビーカーのまま入店もOK。乳児連れにも対応。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'Munni（ムンニ）',
      genre: 'cafe',
      area: '麻布十番駅から徒歩圏（網代公園隣）',
      description:
        '日本茶・紅茶専門のカフェで、網代公園に隣接。明るく広々とした店内はベビーカーのまま入店でき、授乳室も完備。公園遊びの前後の休憩や子連れランチに使いやすい。',
      strollerOk: true,
      seatingType: ['table'],
      nursingRoom: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '麻布野菜菓子',
      genre: 'sweets',
      area: '麻布十番駅1番出口から徒歩1分',
      description:
        '野菜を使ったお菓子・スイーツがコンセプトの店で、カフェスペースを併設。席の間隔が広くとられていて、ベビーカーや子連れでも入りやすい。野菜のモンブランやかき氷が名物。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'ポワンタージュ（pointage）',
      genre: 'bakery',
      area: '麻布十番駅1番出口から徒歩2分',
      description:
        '食べログパン百名店に選ばれた家族経営のベーカリー。20席ほどのカフェスペースを併設し、パンやサラダ、デリを店内で味わえる。名物のミルクフランスは取り分けにも向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 広尾（渋谷区・港区）
  // ===========================================================
  'hiroo': [
    {
      name: '天現寺カフェ',
      genre: 'cafe',
      area: '広尾駅から徒歩圏',
      description:
        '全国の有名お取り寄せスイーツが揃うカフェ。洋食メニューもありランチ利用ができ、ベビーカーのまま入店できるのが子連れにうれしいポイント。散歩の途中の休憩にも。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'パパスカフェ 広尾店',
      genre: 'cafe',
      area: '広尾駅から徒歩圏',
      description:
        'パリの下町をイメージしたカフェ。11〜15時はカレーライスなどのランチメニューがあり、シナモントーストランチは1,000円以下。テラス席もあり、離乳食を食べさせやすい。',
      seatingType: ['table', 'terrace'],
      bringBabyFood: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'ブレッド＆タパス 沢村 広尾',
      genre: 'bakery',
      area: '広尾駅から徒歩圏',
      description:
        '1階がパン販売、2階がレストランのベーカリーレストラン。お子様ランチやキッズホットドッグなどキッズプレートが揃い、焼きたてパンと一緒に家族で楽しめる。',
      kidsMenu: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'ラ・メンサ ジャスミン（La Mensa jasmin）',
      genre: 'cafe',
      area: '広尾駅から徒歩圏（聖心女子大学敷地内）',
      description:
        '聖心女子大学の敷地内にあるオーガニック志向のカフェ。ミートソースやカレーなどお子様メニューがあり、授乳室やおむつ替えのできる専用ルームを完備。赤ちゃん連れも安心。',
      kidsMenu: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      nursingRoom: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 赤坂（港区）
  // ===========================================================
  'akasaka': [
    {
      name: '赤坂 うまや',
      genre: 'washoku',
      area: '赤坂駅から徒歩圏',
      description:
        '一軒家のレストランで、2名から大人数まで使える個室がある和食店。ランチは1,150円からの定食や名物の楽屋めしなど手頃で、子連れでも気軽に利用できる落ち着いた空間。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 青山一丁目（港区）
  // ===========================================================
  'aoyama-itchome': [
    {
      name: 'THE BELCOMO（ザ ベルコモ）',
      genre: 'italian',
      area: '外苑前駅・青山一丁目駅から徒歩圏（THE AOYAMA GRAND HOTEL内）',
      description:
        'イタリアンを中心とした多国籍料理のオールデイダイニング。横の入り口は段差がなくベビーカーを折りたたまず入店でき、ソファ席に横付けも可能。授乳室・おむつ台を完備。',
      strollerOk: true,
      strollerToSeat: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      nursingRoom: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  // ===========================================================
  // 外苑前（港区）
  // ===========================================================
  'gaiemmae': [
    {
      name: 'THE BELCOMO（ザ ベルコモ）',
      genre: 'italian',
      area: '外苑前駅から徒歩3分（THE AOYAMA GRAND HOTEL内）',
      description:
        'イタリアンを中心とした多国籍料理を楽しめるオールデイダイニング。段差のない横入口からベビーカーのまま入店でき、ソファ席にベビーカーを横付けして食事ができる。授乳室・おむつ台あり。',
      strollerOk: true,
      strollerToSeat: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      nursingRoom: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  // ===========================================================
  // 表参道（港区・渋谷区）
  // ===========================================================
  'omotesando': [
    {
      name: 'Un cafe（アンカフェ）',
      genre: 'cafe',
      area: '表参道駅から徒歩圏',
      description:
        'オープンキッチンのある白を基調とした清潔感のあるレストラン。子連れやベビーカーの場合は屋根付きのテラス席・ガーデン席に通してもらえ、天気を気にせず食事ができる。',
      seatingType: ['table', 'terrace'],
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 虎ノ門（港区）
  // ===========================================================
  'toranomon': [
    {
      name: '日常茶飯時',
      genre: 'washoku',
      area: '虎ノ門ヒルズステーションタワー2階',
      description:
        'おいしいお米とごはんのお供を売りにした和食店。ベビーカーのまま入れる広々とした店内に小上がり席があり、子どもウェルカムの雰囲気。駅直結で雨でもアクセスが楽。',
      strollerOk: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 新宿御苑前（新宿区）
  // ===========================================================
  'shinjuku-gyoemmae': [
    {
      name: 'cocochiyo cafe（ココチヨカフェ）',
      genre: 'cafe',
      area: '新宿御苑前駅から徒歩2分',
      description:
        'カフェオレと手作りプリンが看板のカフェ。ソファ席があり子連れママ会にも使われる。スペシャルランチはハヤシライスやナポリタンなどのメインにサラダ・デザート・ドリンク付き。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],
};
