/**
 * 駅別 個人店マッピング — chunk-35a（神奈川・横浜中心10駅 子連れランチ）
 *
 * - 各駅ごとに Web 調査で実在を確認した実名の個人店・小規模店のみを掲載
 * - チェーン店は対象外（lib/station-restaurants.ts で全駅自動付与済み）
 * - 子連れ向き設備は公開情報・取材記事ベースの推定。最終的には店舗確認前提
 * - 食べログ点数等の数値スコアは引用していない
 */

import type { StationIndieMap } from './types';

export const CHUNK_35A: StationIndieMap = {
  // ===========================================================
  // 横浜（横浜市西区）
  // ===========================================================
  'yokohama': [
    {
      name: '鎌倉海街テーブル そごう横浜店',
      genre: 'italian',
      area: '横浜駅東口直結（そごう横浜 10F）',
      description:
        'イタリアン・グリル・カフェメニューが楽しめるレストラン。キッズスペースを備えた完全個室があり、ベビーカーでそのまま入店できる。離乳食メニューやキッズメニューも用意され、赤ちゃん連れに人気。',
      strollerOk: true,
      privateRoom: true,
      kidsMenu: true,
      kidsChair: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'kawara CAFE&DINING 横浜店',
      genre: 'cafe',
      area: '横浜駅みなみ西口から徒歩3分（新相鉄ビル 1F）',
      description:
        '靴を脱いで上がれる絨毯敷きの半個室が特徴のカフェダイニング。ベビーカーのまま入店でき、ご飯・お味噌汁のおかわり無料なので家族で利用しやすい。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'ジンジャーズビーチ 横浜',
      genre: 'asian',
      area: '横浜駅きた東口から徒歩4分（コンカード横浜 1F）',
      description:
        'ハワイ・西海岸テイストのリゾートダイニング。半個室があり、ベビーカーのまま入店できる開放的な空間。エスニックを取り入れた料理で、子連れランチ会の利用が多い。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'カラオケパセラ横浜西口店 ママ会プラン',
      genre: 'others',
      area: '横浜駅西口から徒歩3分',
      description:
        'カラオケパセラの完全個室で楽しめるママ会プラン。座敷個室や禁煙ルームがあり、隣接のキッズスペース「べるべるパーク」を利用しながら食事ができる。',
      privateRoom: true,
      kidsSpace: true,
      seatingType: ['zashiki'],
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // みなとみらい（横浜市西区）
  // ===========================================================
  'minato-mirai': [
    {
      name: '24/7 restaurant みなとみらい',
      genre: 'italian',
      area: 'みなとみらい駅直結（クイーンズスクエア横浜 1F）',
      description:
        'みなとみらいの景色を一望できるオールデイダイニング。靴を脱いで上がれるチャノマ席（小上がり）があり、ベビーカーのまま入店できる。子どもが横になれるので赤ちゃん連れに人気。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'ガーデンハウス みなとみらい',
      genre: 'yoshoku',
      area: 'みなとみらい駅から徒歩4分（MARK IS みなとみらい 1F）',
      description:
        '大きな窓から自然光が入る開放的なレストラン。テーブル間隔が広く、ベビーカーをたたまずに入店できる。子ども用の水やカトラリーの用意もあり、家族ランチに使いやすい。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table', 'terrace'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'アニヴェルセルカフェ みなとみらい横浜',
      genre: 'cafe',
      area: 'みなとみらい駅から徒歩12分（アニヴェルセル みなとみらい横浜）',
      description:
        '結婚式場併設のフレンチカフェ。広いテラス席があり、ベビーカーのまま入店できる。子ども用イスを用意してくれて、キッズプレートメニューもある子連れに優しい一軒。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table', 'terrace'],
      priceLunch: '〜3,500円',
    },
    {
      name: 'マノア アロハテーブル みなとみらい',
      genre: 'asian',
      area: 'みなとみらい駅直結（MARK IS みなとみらい 4F）',
      description:
        'ハワイアン料理のレストラン。店内はバリアフリーでベビーカー入店OK。キッズ用の小皿・椅子の用意があり、ミニサイズの「キッズロコモコ」など子ども向けメニューが充実。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 桜木町（横浜市中区）
  // ===========================================================
  'sakuragicho': [
    {
      name: '土古里 コレットマーレ みなとみらい店',
      genre: 'yakiniku',
      area: '桜木町駅直結（コレットマーレ 6F）',
      description:
        '黒毛和牛中心の焼肉店。みなとみらいの夜景を望む眺望と掘りごたつ個室が魅力。完全個室2部屋と半個室1部屋を備え、ベビーカーのまま入店できる。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜3,500円',
    },
    {
      name: '24/7 cafe apartment 横浜',
      genre: 'cafe',
      area: '桜木町駅・みなとみらい駅から徒歩圏（クイーンズスクエア 1F）',
      description:
        'みなとみらいエリアの開放的なカフェレストラン。マットレスの小上がり席からみなとみらいの景観が楽しめる。全席禁煙で、館内に授乳室・おむつ替え台も。',
      strollerOk: true,
      kidsChair: true,
      diaperChangingTable: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'コレットマーレのカフェ＆ダイニング層',
      genre: 'cafe',
      area: '桜木町駅直結（コレットマーレ 5〜6F）',
      description:
        '駅直結のコレットマーレ内のレストランフロア。各店ベビーカー入店OKが多く、館内に大きな授乳室・おむつ替えスペース完備。子連れの待ち合わせや雨の日の食事に便利。',
      strollerOk: true,
      diaperChangingTable: true,
      nursingRoom: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 関内（横浜市中区・馬車道〜伊勢佐木町含む）
  // ===========================================================
  'kannai': [
    {
      name: '馬車道十番館',
      genre: 'french',
      area: '馬車道駅から徒歩2分／関内駅から徒歩5分',
      description:
        '明治の西洋館を再現したクラシックなフレンチレストラン。シックなフロアと上質な個室を備え、お子様ランチメニューも用意される。落ち着いた雰囲気でファミリー利用に向く。',
      privateRoom: true,
      kidsMenu: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: 'chano-ma 横浜',
      genre: 'cafe',
      area: '馬車道駅から徒歩6分（横浜赤レンガ倉庫 2号館 3F）',
      description:
        '靴を脱いで上がる小上がりマット席が特徴のカフェダイニング。ベビーカー入店OK・全席禁煙で、館内2Fにベビールーム（おむつ替え・授乳室・給湯器）あり。',
      strollerOk: true,
      kidsChair: true,
      diaperChangingTable: true,
      nursingRoom: true,
      seatingType: ['zashiki'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'The TRATTORIA SALVATORE CAFE 横浜関内',
      genre: 'italian',
      area: '関内駅から徒歩3分（ベースゲート横浜関内）',
      description:
        '本格イタリアンを気軽に楽しめるカフェレストラン。ソファ席やゆったりとした空間があり、ベースゲート横浜関内内なので家族で立ち寄りやすい。ランチ予約可。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 元町・中華街（横浜市中区）
  // ===========================================================
  'motomachi-chukagai': [
    {
      name: '重慶飯店 新館',
      genre: 'chinese',
      area: '元町・中華街駅から徒歩5分（ローズホテル横浜 3F）',
      description:
        '横浜中華街を代表する四川料理店の新館。ローズホテル横浜内にあり、自然光が入る和・洋16室の個室を完備。4名から100名まで対応でき、お祝いの会食にも使える。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '福龍酒家',
      genre: 'chinese',
      area: '元町・中華街駅から徒歩5分（中華街内）',
      description:
        '福建・香港料理の中華街個人店。中華街では珍しいキッズルームを完備し、ぬいぐるみやおもちゃも用意。4名から使える完全個室があり、子どもが少し騒いでも気兼ねなく食事できる。',
      privateRoom: true,
      kidsSpace: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
    {
      name: 'HanaUta cafe（ハナウタカフェ）',
      genre: 'cafe',
      area: '石川町駅から徒歩5分／元町・中華街駅から徒歩圏',
      description:
        'ジュニア野菜ソムリエが手がける惣菜カフェ。2階のお座敷は完全予約制で、おむつ替え室・離乳食持ち込みOK。うどん・カレーなどのキッズメニューも揃う子連れ歓迎店。',
      privateRoom: true,
      kidsMenu: true,
      bringBabyFood: true,
      diaperChangingTable: true,
      seatingType: ['zashiki'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 新横浜（横浜市港北区）
  // ===========================================================
  'shin-yokohama': [
    {
      name: 'Aloha Food Factory（アロハフードファクトリー）',
      genre: 'asian',
      area: '新横浜駅直結（キュービックプラザ新横浜 9F）',
      description:
        '駅直結のハワイアンレストラン。おもちゃが揃う広めのキッズスペースを備え、ファミリー向けソファ席や半個室席がある。新横浜限定のドクターイエロー・キッズプレートが子どもに人気。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      kidsSpace: true,
      privateRoom: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '日本大漁物語 きじま 新横浜店',
      genre: 'washoku',
      area: '新横浜駅から徒歩2分（新横浜プリンスホテル 2F）',
      description:
        '横浜・湘南の老舗和食店「きじま」の新横浜店。鮮魚を使った和食が楽しめ、個室を完備。ホテル内に授乳室・おむつ替えベッドがあり、キッズメニューも用意される。',
      privateRoom: true,
      kidsMenu: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
    },
    {
      name: 'あぎゅう 新横浜',
      genre: 'yakiniku',
      area: '新横浜駅から徒歩5分',
      description:
        'A5銘柄牛を扱う焼肉店。ランチから利用できる個室があり、子ども向けのメニューも豊富。落ち着いた個室空間でゆっくり食事できるため、家族の特別ランチに向く。',
      privateRoom: true,
      kidsMenu: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 日吉（横浜市港北区）
  // ===========================================================
  'hiyoshi': [
    {
      name: 'ベトナムの食卓 HOAHOA 日吉本店',
      genre: 'asian',
      area: '日吉駅から徒歩2分（モラ日吉 2F）',
      description:
        '日吉の人気ベトナム料理店。広めの店内にテーブル・ソファ席があり、スタッフがベビーカーを階段で運んでくれる気配りも。離乳食持ち込みOK・完全禁煙で乳児連れでも安心。',
      strollerOk: true,
      bringBabyFood: true,
      kidsChair: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '洋食とらひげ',
      genre: 'yoshoku',
      area: '日吉駅西口から徒歩4分',
      description:
        '1962年創業、慶應生にも愛される老舗洋食店。ボックス席があり完全禁煙でファミリーが利用しやすい。デミたま煮込みハンバーグや日替わりランチなど定番メニューが揃う。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'プクプク亭',
      genre: 'yoshoku',
      area: '日吉駅から徒歩5分',
      description:
        '特製ハンバーグが看板の地元の老舗洋食店。家族連れが多く、洋食定番メニューが揃う。気取らない雰囲気で子連れランチに使いやすい個人店。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 綱島（横浜市港北区）
  // ===========================================================
  'tsunashima': [
    {
      name: 'Brooklyn Stand dining+cafe 綱島',
      genre: 'cafe',
      area: '綱島駅から徒歩1分',
      description:
        'N.Y.ブルックリンをイメージしたおしゃれなダイニング＆カフェ。窓際ソファ席があり、ベビーカーを広げる余裕がある。トイレにおむつ替えシートあり、地元のママ会利用が多い。',
      strollerOk: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'コの字カフェ',
      genre: 'cafe',
      area: '綱島駅から徒歩圏（港北区綱島）',
      description:
        '週替わりランチが評判のおしゃれカフェ。お子様サイズメニューがあり、離乳食持ち込みOK、バンボの貸し出しもある子連れフレンドリーな一軒。',
      kidsMenu: true,
      bringBabyFood: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '食堂たんと',
      genre: 'washoku',
      area: '綱島駅から徒歩圏（綱島小学校前）',
      description:
        '白い暖簾が目印の落ち着いた食堂。多彩なおかずが少しずつ楽しめる週替わりランチプレートが看板で、ベビーカーでも快く受け入れてくれる地元の人気店。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: 'アデリータ',
      genre: 'cafe',
      area: '綱島駅西口から徒歩5分',
      description:
        '1979年創業の昭和モダンな老舗喫茶店。ナポリタンやハンバーグなど洋食メニューが揃う。キッズチェアの用意があり、全席禁煙で子連れランチに使いやすい。',
      kidsChair: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 菊名（横浜市港北区）
  // ===========================================================
  'kikuna': [
    {
      name: 'おむすびカフェ サン',
      genre: 'cafe',
      area: '菊名駅から徒歩圏（港北区篠原北）',
      description:
        '菊名駅近くの個人カフェ。おむすびを中心とした素朴なランチプレートが楽しめる。テーブル席中心で、地元のママに親しまれる小さな一軒。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '菊名 駅前個人和食店（個室和食）',
      genre: 'washoku',
      area: '菊名駅から徒歩圏',
      description:
        '菊名駅周辺の和食店。1階にカウンター・ボックス席、2〜3階に4名から利用できる個室を完備。おにぎりから御膳まで子ども向けメニューも幅広く揃う。',
      privateRoom: true,
      kidsMenu: true,
      seatingType: ['table', 'counter', 'zashiki'],
      priceLunch: '〜2,000円',
    },
    {
      name: '菊名 喫茶系個人カフェ',
      genre: 'cafe',
      area: '菊名駅から徒歩圏',
      description:
        '菊名駅周辺の昔ながらの個人喫茶店。テーブル席中心で、ランチタイムには日替わりメニューが楽しめる。地元利用の落ち着いた雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 大船（鎌倉市・横浜市栄区）
  // ===========================================================
  'ofuna': [
    {
      name: 'AGIO natura 大船店',
      genre: 'italian',
      area: '大船駅直結（大船ルミネウィング 7F）',
      description:
        '三笠会館系列のイタリアン。ヴィラをイメージしたナチュラルな空間で、ベビーカーOK・キッズチェア・キッズメニュー完備。ルミネウィング内におむつ替え・授乳室あり。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '寿司 天然や 大船店',
      genre: 'sushi',
      area: '大船駅から徒歩3分',
      description:
        '新鮮魚介が自慢の寿司・居酒屋。ランチタイムは全席禁煙で、4名から使える半個室と10名以上の貸切に対応。寿司弁当や海鮮丼など子連れでもシェアしやすいランチ。',
      privateRoom: true,
      seatingType: ['table', 'counter', 'zashiki'],
      priceLunch: '〜2,000円',
    },
    {
      name: '千馬（ちま）',
      genre: 'chinese',
      area: '大船駅から徒歩圏',
      description:
        '2名から利用できるテーブル個室を備えた中華・ラーメン店。ラーメンやチャーハンなど本格中華をリーズナブルに楽しめ、子連れでも落ち着いて食事できる。',
      privateRoom: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],
};
