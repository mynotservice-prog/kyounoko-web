/**
 * 駅別 個人店マッピング — chunk-24（東京・子連れランチ拡充：新宿東部・文京・台東・墨田・江東）
 *
 * - 各駅ごとに Web 調査で実在を確認した実名の個人店のみを掲載
 * - チェーン店は対象外（station-restaurants.ts 側で別途登録）
 * - 子連れ向き設備（ベビーカー・座敷・おむつ替え等）は公開情報・取材記事ベースの推定。
 *   最終的には店舗確認前提。
 * - 食べログ点数等の数値スコアは引用していない
 * - chunk-1〜23 と同じ駅 slug は index.ts の mergeIndieMaps で結合される
 */

import type { StationIndieMap } from './types';

export const CHUNK_24: StationIndieMap = {
  // ===========================================================
  // 新大久保（新宿区）
  // ===========================================================
  'shin-okubo': [
    {
      name: 'プングム 新大久保本店',
      genre: 'korean',
      area: '新大久保駅から徒歩2分',
      description:
        '新大久保で10年以上続く韓国家庭料理店。ゆったりしたテーブル席に加え個室・半個室があり、ベビーカー入店や離乳食持ち込みOK、子ども用食器も用意。家族でゆっくり過ごせる。',
      strollerOk: true,
      privateRoom: true,
      bringBabyFood: true,
      kidsCutlery: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '金達莱（キンタツライ）',
      genre: 'korean',
      area: '新大久保駅から徒歩2分',
      description:
        '掘りごたつのお座敷がある韓国料理店。靴を脱いで座れるので子どもが動いても安心で、離乳食の持ち込みや子ども用食器の用意もある。席のみの予約にも対応してくれる。',
      privateRoom: true,
      bringBabyFood: true,
      kidsCutlery: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'ゆめいろCafe',
      genre: 'cafe',
      area: '新大久保駅から徒歩2分',
      description:
        'ベビーカーのまま席につける子連れ歓迎のカフェ。3畳ほどのキッズスペースにはおもちゃがあり、キッズミールやキッズジュース、子ども用食器も完備。親子でくつろぎやすい。',
      strollerOk: true,
      strollerToSeat: true,
      kidsMenu: true,
      kidsSpace: true,
      kidsCutlery: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '味ちゃん',
      genre: 'korean',
      area: '新大久保駅から徒歩2分',
      description:
        '新大久保の老舗的な韓国料理店。座敷スペースがあり子連れでも利用しやすく、ビビンババイキング付きのサムギョプサルセットなど取り分けやすいメニューが手頃な値段で楽しめる。',
      seatingType: ['zashiki', 'table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 大久保（新宿区）
  // ===========================================================
  'okubo': [
    {
      name: 'ゆめいろCafe',
      genre: 'cafe',
      area: '大久保駅から徒歩4分（JR新大久保駅からは徒歩2分）',
      description:
        'ベビーカーのまま着席できる子連れ向けカフェ。キッズスペースにおもちゃがあり、キッズミール・キッズジュース・子ども用食器も用意。11時から18時の通し営業で使い勝手がよい。',
      strollerOk: true,
      strollerToSeat: true,
      kidsMenu: true,
      kidsSpace: true,
      kidsCutlery: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'RED（レッド）',
      genre: 'korean',
      area: '大久保駅から徒歩3分',
      description:
        '広いホールのテーブル席や座敷に加え7つの個室がある韓国料理店。個室なら子どもがぐずっても周りに気兼ねなくランチでき、グループでのママ会にも使いやすい。',
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 高田馬場（新宿区）
  // ===========================================================
  'takadanobaba': [
    {
      name: 'カフェ コットンクラブ',
      genre: 'italian',
      area: '高田馬場駅から徒歩5分',
      description:
        'ピザやパスタが楽しめる広々としたイタリアン。ベビーカーのまま入店でき、ランチセットはサラダ・スープ・デザート・ドリンク付き。ライスやパスタの大盛りが無料で家族での食事に向く。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'ウラニワ',
      genre: 'washoku',
      area: '高田馬場駅から徒歩5分',
      description:
        '大分名物のとり天が看板の和食店。平日はランチ営業もしており、ソファ席や掘りごたつの個室があってベビーカー入店もOK。子連れでもゆったり定食を味わえる。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '石庫門 高田馬場店',
      genre: 'chinese',
      area: '高田馬場駅から徒歩1分',
      description:
        '駅近の中華料理店。4名から使える半個室・個室があり、ベビーカー入店や離乳食の持ち込みもOK。お子様メニューや子ども用食器も用意され、家族での点心ランチに使いやすい。',
      strollerOk: true,
      privateRoom: true,
      kidsMenu: true,
      bringBabyFood: true,
      kidsCutlery: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 早稲田（新宿区）
  // ===========================================================
  'waseda': [
    {
      name: 'Uni.Shop & Cafe 125',
      genre: 'cafe',
      area: '早稲田駅から徒歩7分（早稲田大学早稲田キャンパス内）',
      description:
        '早稲田大学のショップ併設カフェで一般客も利用できる。開放的な店内でベーグルサンドや丼ものなどメニューが豊富。車の通らないキャンパス内にあり、散策の合間の子連れランチに向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 後楽園（文京区）
  // ===========================================================
  'korakuen': [
    {
      name: 'クリマ ディ トスカーナ',
      genre: 'italian',
      area: '後楽園駅A1出口から徒歩7分（本郷弓町）',
      description:
        '本郷弓町のクスの大木が目印の創作イタリアン。トスカーナ料理と日本の四季を大切にした落ち着いた一軒家で、ランチコースをゆっくり味わえる。記念日や少人数のママ会向き。',
      seatingType: ['table'],
      priceLunch: '〜5,000円',
    },
  ],

  // ===========================================================
  // 茗荷谷（文京区）
  // ===========================================================
  'myogadani': [
    {
      name: 'ALL DAY HOME（オールデイホーム）茗荷谷店',
      genre: 'cafe',
      area: '茗荷谷駅から徒歩2分',
      description:
        '和カフェご飯が楽しめる広々とした店。テーブル・ソファ・カウンター・座敷席があり、座敷にはおもちゃも完備。仕切って個室にもでき、子連れランチやママ会に使いやすい。',
      privateRoom: true,
      seatingType: ['zashiki', 'table', 'counter'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 御徒町（台東区）
  // ===========================================================
  'okachimachi': [
    {
      name: 'とんかつ 井泉 本店',
      genre: 'tonkatsu',
      area: '御徒町駅から徒歩6分（上野広小路駅からは徒歩1分）',
      description:
        '「箸で切れるやわらかとんかつ」で知られる老舗とんかつ店。お座敷席があり子連れでも利用しやすく、ベビーカーは入口で預かってもらえる。子どもと取り分けてもよい王道の味。',
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 上野広小路（台東区）
  // ===========================================================
  'ueno-hirokoji': [
    {
      name: 'とんかつ 井泉 本店',
      genre: 'tonkatsu',
      area: '上野広小路駅から徒歩1分',
      description:
        '「箸で切れるやわらかとんかつ」で有名な老舗。お座敷席があり子連れでも落ち着いて食事でき、ベビーカーは入口で預かってもらえる。やわらかいので子どもとの取り分けにも向く。',
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 上野御徒町（台東区）
  // ===========================================================
  'ueno-okachimachi': [
    {
      name: 'とんかつ 井泉 本店',
      genre: 'tonkatsu',
      area: '上野御徒町駅A4出口から徒歩2分',
      description:
        'やわらかいとんかつで知られる老舗。お座敷席があるので子連れでもくつろぎやすく、ベビーカーは入口で預かってもらえる。子どもと取り分けやすい定番の洋食的とんかつ。',
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 浅草（台東区）
  // ===========================================================
  'asakusa': [
    {
      name: '浅草むぎとろ 本店',
      genre: 'washoku',
      area: '浅草駅から徒歩2分',
      description:
        '1929年創業の麦とろ専門店。1〜3階で約160席と広く、ベビーカーでも入りやすい。座敷席や2名から使える個室があり、消化のよいとろろご飯は子どもとの取り分けにも向く。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
    {
      name: 'グリル グランド',
      genre: 'yoshoku',
      area: '浅草駅から徒歩10分（浅草観音裏）',
      description:
        '1941年創業の老舗洋食店。1階はテーブル席、2階はお座敷で個室もあり、子連れでも落ち着いて過ごせる。ハンバーグやオムライスなど子どもも食べやすい王道メニューが揃う。',
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'ヨシカミ',
      genre: 'yoshoku',
      area: '浅草駅から徒歩5分',
      description:
        '浅草の下町洋食の名店。ナポリタンやグラタン、ハンバーグなど子どもにも人気の王道メニューが揃い取り分けに最適。ベビーカーは入口で預ける形だが子ども用椅子を貸してもらえる。',
      seatingType: ['counter', 'table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'つるや',
      genre: 'washoku',
      area: '浅草駅から徒歩1分',
      description:
        '創業約80年の老舗うなぎ店。1階はテーブル席、2階にはお座敷個室があり、靴を脱いでくつろげるので子連れの食事に向く。駅近で観光の合間にも立ち寄りやすい。',
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 浅草橋（台東区）
  // ===========================================================
  'asakusabashi': [
    {
      name: '葉もれ日',
      genre: 'curry',
      area: '浅草橋駅から徒歩5分',
      description:
        '築約80年の古民家をリノベーションしたカフェ。看板のスパイシーチキンカレーやインド産豆のコーヒーが楽しめる。穏やかな雰囲気でゆっくり過ごせ、子連れの落ち着いたランチに。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 両国（墨田区）
  // ===========================================================
  'ryogoku': [
    {
      name: 'ちゃんこ道場 両国駅前店',
      genre: 'washoku',
      area: '両国駅から徒歩1分',
      description:
        'ランチでちゃんこ鍋が味わえる駅前の店。ベビーカー入店OKで、完全個室があるため子どもがぐずっても周りを気にせず過ごせる。鍋は取り分けやすく家族での食事に向く。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '両国吉良亭',
      genre: 'washoku',
      area: '両国駅東口から徒歩1分',
      description:
        '両国駅すぐの和食店。子ども用の椅子や食器を借りることができ、ベビーカー入店もOK。下町価格で気軽に使え、子連れでのランチに利用しやすい。',
      strollerOk: true,
      kidsChair: true,
      kidsCutlery: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'ちゃんこ江戸沢 両国総本店',
      genre: 'washoku',
      area: '両国駅から徒歩1分',
      description:
        '相撲の街・両国のちゃんこ鍋店。広いお座敷や個室があり、靴を脱いで座れるので子連れでも安心。海鮮丼や日替わりランチにミニちゃんこが付き、ご飯大盛り無料。',
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 押上（墨田区）
  // ===========================================================
  'oshiage': [
    {
      name: 'ikkA（いっか）',
      genre: 'cafe',
      area: '押上駅から徒歩8分',
      description:
        '一軒家をセルフリノベーションした隠れ家カフェ。ソファ席と座敷の個室があり、野菜ソムリエの店主が作る野菜中心のランチが楽しめる。子連れでもゆっくり過ごせる落ち着いた空間。',
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 門前仲町（江東区）
  // ===========================================================
  'monzen-nakacho': [
    {
      name: 'みらいのテーブル 門前仲町',
      genre: 'cafe',
      area: '門前仲町駅から徒歩5分',
      description:
        '「子連れでもゆっくり食事を楽しめる店」がコンセプトの子育て支援カフェ。ベビーカー入店OK、ベビーチェアや授乳ケープの無料貸出、おむつ替え台も完備。テラス席の隣は深川公園。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table', 'terrace'],
      diaperChangingTable: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'SORAYA（ソラヤ）',
      genre: 'cafe',
      area: '門前仲町駅から徒歩6分（富岡八幡宮裏手）',
      description:
        '緑あふれる複合施設YANEの中心にあるカフェ&レストラン。広々とした店内はベビーカー入店OKで、キッズメニューも用意。富岡八幡宮の参拝後のランチに立ち寄りやすい。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table', 'terrace'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'MONZ CAFE 門前仲町店',
      genre: 'cafe',
      area: '門前仲町駅から徒歩5分（深川不動尊参道）',
      description:
        '元甘酒屋を木材や石を使ってリノベーションした参道沿いのカフェ。コーヒーとケーキ・焼き菓子・プリンに加え軽食も充実。下町散策の合間に子連れで休憩しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '深川宿 富岡八幡店',
      genre: 'washoku',
      area: '門前仲町駅から徒歩3分',
      description:
        '名物・深川めしを味わえる郷土料理店。味噌仕立てと醤油仕立ての二種の深川めしを楽しめるセットがあり、やわらかく子どもと取り分けやすい。下町情緒のある落ち着いた店内。',
      seatingType: ['zashiki', 'table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 木場（江東区）
  // ===========================================================
  'kiba': [
    {
      name: 'mammacafe151A（マンマカフェ151A）',
      genre: 'cafe',
      area: '木場駅から徒歩10分（木場公園そば）',
      description:
        '有機・無農薬食材の家庭料理が味わえる木のぬくもりのカフェ。予約限定の小上がり席にはおもちゃがあり、チャイルドチェアやおむつ替えシート完備、ベビーカー入店OK。子連れに手厚い。',
      strollerOk: true,
      privateRoom: true,
      kidsChair: true,
      seatingType: ['zashiki', 'table'],
      diaperChangingTable: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'KIBACO（キバコ）',
      genre: 'cafe',
      area: '木場駅から徒歩10分（木場公園内）',
      description:
        '木場公園の中にあるマルシェ併設カフェ。緑を眺める開放的な店内にはおもちゃ・絵本・キッズチェアのあるキッズスペースを完備。全メニューがテイクアウト可能で公園あそびと相性◎。',
      kidsChair: true,
      kidsSpace: true,
      seatingType: ['table', 'terrace'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'Field（フィールド）',
      genre: 'yoshoku',
      area: '木場駅から徒歩10分（木場公園北側）',
      description:
        '木場公園のすぐ近くにある手作りハンバーガーの店。座敷席が2つあり、靴を脱いで座れるので子連れでもくつろぎやすい。ボリュームのあるバーガーは取り分けにも向く。',
      seatingType: ['zashiki', 'table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 東陽町（江東区）
  // ===========================================================
  'toyocho': [
    {
      name: 'cafe COUR（カフェ クール）',
      genre: 'cafe',
      area: '東陽町駅から徒歩圏内',
      description:
        '自家製パンとエスプレッソが楽しめるカフェ。サンルームと緑あふれるおしゃれな空間でゆったり過ごせる。落ち着いた雰囲気で、子連れでのんびりランチやティータイムを取りたいときに。',
      seatingType: ['table', 'terrace'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 南砂町（江東区）
  // ===========================================================
  'minami-sunamachi': [
    {
      name: 'ラ・オハナ',
      genre: 'yoshoku',
      area: '南砂町駅から徒歩圏内',
      description:
        '甘めの味付けで子どもも食べやすいハワイアンレストラン。キッズチェアと子ども用食器を用意し、おむつ交換台も完備。ふりふりチキンなど親子で楽しめるメニューが揃う。',
      kidsChair: true,
      kidsCutlery: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      priceLunch: '〜2,000円',
    },
  ],
};
