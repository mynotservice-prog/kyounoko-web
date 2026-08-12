/**
 * 駅別 個人店マッピング — chunk-35b（神奈川・川崎/横浜郊外10駅 子連れランチ）
 *
 * - 各駅ごとに Web 調査で実在を確認した実名の個人店のみを掲載
 * - チェーン店は対象外（lib/station-restaurants.ts で全駅自動付与済み）
 * - 子連れ向き設備は公開情報・取材記事ベースの推定。最終的には店舗確認前提
 * - 食べログ点数等の数値スコアは引用していない
 */

import type { StationIndieMap } from './types';

export const CHUNK_35B: StationIndieMap = {
  // ===========================================================
  // 川崎駅（川崎市川崎区）
  // ===========================================================
  'kawasaki': [
    {
      name: 'kawara CAFE&DINING 川崎モアーズ店',
      genre: 'cafe',
      area: '川崎駅東口から徒歩3分（川崎モアーズ 7F）',
      description:
        '和をテーマにしたカフェダイニング。フカフカじゅうたんの小上がり半個室は6〜8名対応で、赤ちゃん連れでも周りを気にせずくつろげる。ベビーカー入店可。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      stepFree: true,
      bringBabyFood: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '北京ダックと個室中華 盤古茶屋 川崎本店',
      genre: 'chinese',
      area: '川崎駅西口から徒歩6分（川崎パークホテル内）',
      description:
        '川崎パークホテル内の本格中華。完全個室を多数備え、北京ダックや小籠包をゆったり楽しめる。法事や顔合わせなど人数の多い子連れ集まりに向く。',
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
    {
      name: 'おぼんdeごはん ラゾーナ川崎プラザ店',
      genre: 'washoku',
      area: '川崎駅直結（ラゾーナ川崎プラザ 1F）',
      description:
        '和定食を中心とした駅直結の食堂。テーブル間隔が広めでベビーカーのまま入りやすく、館内に赤ちゃん休憩室・授乳室が揃う商業施設内で安心。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      nursingRoom: true,
      bringBabyFood: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'しゃぶしゃぶ温野菜 川崎駅前店',
      genre: 'shabu',
      area: '川崎駅東口から徒歩2分',
      description:
        '野菜たっぷりのしゃぶしゃぶ専門店。掘りごたつ席や半個室があり、ベビーカーのまま入店可能。取り分けやすく小さな子と一緒のランチにも使いやすい。',
      strollerOk: true,
      privateRoom: true,
      shareDish: true,
      seatingType: ['zashiki', 'table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 武蔵小杉駅（川崎市中原区）
  // ===========================================================
  'musashi-kosugi': [
    {
      name: 'KOSUGI Cafe nappa69',
      genre: 'cafe',
      area: '武蔵小杉駅東急南口から徒歩2分（Kosugi 3rd Avenue 2F）',
      description:
        '健康と美味しさにこだわるカフェ。広い店内はベビーカーを横付けでき、館内に授乳室・おむつ替え台もある。キッズメニューも用意され子連れランチに使いやすい。',
      strollerOk: true,
      strollerToSeat: true,
      kidsMenu: true,
      diaperChangingTable: true,
      nursingRoom: true,
      seatingType: ['table'],
      stepFree: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'goodspoon 武蔵小杉店',
      genre: 'italian',
      area: '武蔵小杉駅JR北口から徒歩5分',
      description:
        '自家製フレッシュチーズを使ったイタリアン。広々とした店内はベビーカー横付けでき、子ども椅子やキッズメニューも揃う。ピザやチーズ料理が子連れに人気。',
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
      name: 'IL VENTO（イル・ヴェント）',
      genre: 'italian',
      area: '武蔵小杉駅南口から徒歩5分',
      description:
        '木目を基調とした温かみのある店内のイタリア食堂。ピザとパスタを1,000円台で楽しめる手頃さで、ベビーカー入店可。子連れでも気軽に立ち寄れる雰囲気。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'WANG\'S GARDEN 武蔵小杉店',
      genre: 'chinese',
      area: '武蔵小杉駅新南口から徒歩2分',
      description:
        '本格四川料理のお店。6〜8名対応の円卓完全個室があり、ベビーカーで入っても狭さを感じない広さ。広々ソファー席も子連れに使いやすい。',
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'USHIHACHI 武蔵小杉店',
      genre: 'yakiniku',
      area: '武蔵小杉駅から徒歩4分',
      description:
        '黒毛和牛一頭買いの焼肉専門店。ベビーカーでの入店が可能で、半個室の落ち着いた席もある。ランチタイムの焼肉セットは家族でシェアしやすい。',
      strollerOk: true,
      privateRoom: true,
      shareDish: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 登戸駅（川崎市多摩区）
  // ===========================================================
  'noborito': [
    {
      name: 'LEAF&BEAN（リーフアンドビーン）',
      genre: 'cafe',
      area: '登戸駅から徒歩5分',
      description:
        '住宅街にあるハワイアンな雰囲気のカフェ。広めの店内はベビーカーのまま入店でき、ベビーカー置き場もある。グルテンフリーのスイーツやお子様ドリンクも用意。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'RETRONOTE CAFE（レトロノートカフェ）',
      genre: 'cafe',
      area: '登戸駅・向ヶ丘遊園駅から徒歩4〜5分',
      description:
        '登戸と向ヶ丘遊園の中間に位置するレトロカフェ。バリアフリーでベビーカーそのまま入店でき、おむつ交換台も完備。赤ちゃん連れでも安心して過ごせる。',
      strollerOk: true,
      stepFree: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      bringBabyFood: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '藤子・F・不二雄ミュージアム カフェ',
      genre: 'cafe',
      area: '登戸駅からシャトルバス約9分（藤子・F・不二雄ミュージアム 3F）',
      description:
        'ミュージアム内3Fのカフェ。暗記パンのトーストやピーヒョロネーゼなど、キャラクターをモチーフにした食事やドリンクがそろい、子どもの特別な体験になる。',
      kidsMenu: true,
      seatingType: ['table', 'terrace'],
      stepFree: false,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'tabitali cafe（タビタリカフェ）',
      genre: 'cafe',
      area: '登戸駅から徒歩約5分',
      description:
        '全席禁煙の個人店カフェ。ワンプレートランチが1,000円以下とお手頃で、ひとりでもベビーカーがあっても入りやすい雰囲気。穴場ながら地元に愛される人気店。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 新百合ヶ丘駅（川崎市麻生区）
  // ===========================================================
  'shin-yurigaoka': [
    // ▼ 2026-08-12追加: 新百合丘オーパの公式ショップ一覧（opa-club.com/shinyurigaoka/shop/）
    //   から、フロア／カテゴリを転記した。新百合ヶ丘駅直結。飲食はB1Fに集まる。
    //   公式に予算・席数の掲載が無いため priceLunch は入れていない。
    //   丸亀製麺・コメダ珈琲店はチェーン側で出るため除外。
    {
      name: '梅丘寿司の美登利 新百合丘オーパ店',
      genre: 'sushi',
      area: '新百合ヶ丘駅直結（新百合丘オーパ B1F）',
      description:
        '寿司店。玉子やかっぱ巻きなど子どもが食べられるネタを単品で頼める。B1Fの飲食フロアにある。',
      seatingType: ['table', 'counter'],
    },
    {
      name: 'イタリアンダイニング ドナ 新百合丘オーパ店',
      genre: 'italian',
      area: '新百合ヶ丘駅直結（新百合丘オーパ B1F）',
      description:
        'パスタ・ピッツァのイタリアン。ピッツァは家族でシェアしやすい。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'どうとんぼり神座 新百合丘オーパ店',
      genre: 'noodles',
      area: '新百合ヶ丘駅直結（新百合丘オーパ B1F）',
      description:
        '白菜の甘みが出たスープのラーメン店。辛くないので子どもにも取り分けやすい。',
      seatingType: ['table', 'counter'],
      shareDish: true,
    },
    {
      name: 'Soup Stock Tokyo 新百合丘オーパ店',
      genre: 'cafe',
      area: '新百合ヶ丘駅直結（新百合丘オーパ B1F）',
      description:
        'スープ専門店。具を選べてスプーンで食べられるので、離乳食が終わったばかりの子にも合わせやすい。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'Café&Meal MUJI 新百合丘オーパ店',
      genre: 'cafe',
      area: '新百合ヶ丘駅直結（新百合丘オーパ 3F）',
      description:
        'デリとカフェ。並んだ惣菜から選ぶ形式なので、子どもが食べられるものだけ取れる。無印良品と同じ3Fにある。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'ディーン&デルーカ カフェ 新百合丘オーパ店',
      genre: 'cafe',
      area: '新百合ヶ丘駅直結（新百合丘オーパ 1F）',
      description:
        'カフェ・ベーカリー。パンやデリを買って公園へ移動する使い方もできる。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'グランディール 新百合丘オーパ店',
      genre: 'bakery',
      area: '新百合ヶ丘駅直結（新百合丘オーパ B1F）',
      description:
        'ベーカリー。子どもが食べられる分だけ選べて、移動中にも持ち込みやすい。',
      shareDish: true,
    },
    {
      name: '海苔弁いちのや 新百合丘オーパ店',
      genre: 'washoku',
      area: '新百合ヶ丘駅直結（新百合丘オーパ B1F）',
      description:
        '海苔弁のテイクアウト店。白飯中心なので子どもに分けやすく、公園などへ持ち出せる。',
      shareDish: true,
    },
    {
      name: 'クリスピー・クリーム・ドーナツ 新百合丘オーパ店',
      genre: 'sweets',
      area: '新百合ヶ丘駅直結（新百合丘オーパ B1F）',
      description:
        'ドーナツ店。1個から買えて、食事が進まない子との休憩に使える。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '銀座コージーコーナー 新百合丘オーパ店',
      genre: 'sweets',
      area: '新百合ヶ丘駅直結（新百合丘オーパ B1F）',
      description:
        'ケーキ・洋菓子の店。買って持ち帰れるので、外食が難しい日の代替になる。',
      shareDish: true,
    },
    {
      name: '京町家 新百合ヶ丘店',
      genre: 'washoku',
      area: '新百合ヶ丘駅南口から徒歩2分',
      description:
        '京和食の居酒屋。2〜22名対応の個室が全17部屋あり、掘りごたつタイプも選べる。お子様ランチもあり、家族の集まりやママ会で個室利用しやすい。',
      privateRoom: true,
      kidsMenu: true,
      seatingType: ['zashiki', 'table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'cafe peas（カフェピース）',
      genre: 'cafe',
      area: '新百合ヶ丘駅から徒歩11分（川崎市麻生区上麻生）',
      description:
        '一軒家を改装したお豆料理カフェ。大豆や黒豆を使った料理が楽しめ、店内には和室があり子連れでくつろげる。うどんやおにぎりなどキッズメニューも豊富。',
      kidsMenu: true,
      seatingType: ['zashiki', 'table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'AVANCREX in Asao Garden（アバンクレックス）',
      genre: 'yoshoku',
      area: '新百合ヶ丘駅から徒歩約3分（麻生ガーデン内）',
      description:
        'ソファ席やテーブル個室を備えたダイニング。ベビーカーのまま入店でき、ランチセットや人気の焼鳥を1本から注文できる。落ち着いた雰囲気で子連れママ会に向く。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 鷺沼駅（川崎市宮前区）
  // ===========================================================
  'saginuma': [
    {
      name: 'とうふ屋うかい 鷺沼店',
      genre: 'washoku',
      area: '鷺沼駅から徒歩3分',
      description:
        '日本庭園を望むとうふ料理の老舗。お子様彩り膳のほか、おむつ交換台や子ども椅子など設備も整い、個室で落ち着いてランチを楽しめる。家族の記念日にも。',
      privateRoom: true,
      kidsMenu: true,
      kidsChair: true,
      diaperChangingTable: true,
      seatingType: ['zashiki', 'table'],
      bringBabyFood: true,
      kidsCutlery: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
    {
      name: '茶寮 春待坂（さりょう はるまちざか）',
      genre: 'cafe',
      area: '鷺沼駅から徒歩3分（とうふ屋うかい 鷺沼店 2F）',
      description:
        'うかい鷺沼店2Fの和カフェ。日本庭園を眺めながら、豆乳生クリームのパンケーキや昼会席を楽しめる。子ども椅子の用意もあり、ゆったりとした子連れランチに。',
      kidsChair: true,
      seatingType: ['table'],
      stepFree: false,
      priceLunch: '〜3,500円',
    },
    {
      name: 'Bakery Cafe 鷺沼（ベーカリーカフェ）',
      genre: 'bakery',
      area: '鷺沼駅から徒歩3分',
      description:
        '焼きたてパンが並ぶ2階建てのベーカリーカフェ。11:30からスープセット約1,100円でランチを楽しめる。広い店内でベビーカーも入りやすい。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 溝の口駅（川崎市高津区）
  // ===========================================================
  'mizonokuchi': [
    {
      name: '美山（みやま）',
      genre: 'washoku',
      area: '溝の口駅直結（ノクティプラザ1 9F）',
      description:
        'ノクティ9Fの和食店。落ち着いた席で和食御膳をいただけ、駅直結の商業施設内なのでベビーカーでアクセスしやすい。授乳室・おむつ替え台も同フロア圏内。',
      strollerOk: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      nursingRoom: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'A5山形牛一頭買い焼肉くろべこ 溝ノ口店',
      genre: 'yakiniku',
      area: '溝の口駅から徒歩3分',
      description:
        '山形牛一頭買いの焼肉店。個室やボックステーブル席があり、ベビーカー入店可。子ども椅子の用意もあり、家族の特別なランチに使いやすい。',
      strollerOk: true,
      privateRoom: true,
      kidsChair: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
    {
      name: 'おひつごはん四六時中 マルイファミリー溝口店',
      genre: 'washoku',
      area: '溝の口駅から徒歩2分（マルイファミリー溝口内）',
      description:
        'おひつで提供する和定食店。全席禁煙でベビーカーのまま入店でき、マルイ館内に授乳室やおむつ替え台が揃う。子連れでも安心してランチを楽しめる。',
      strollerOk: true,
      diaperChangingTable: true,
      nursingRoom: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 二子新地駅（川崎市高津区）
  // ===========================================================
  'futako-shinchi': [
    {
      name: 'IDOBATA（イドバタ）',
      genre: 'cafe',
      area: '二子新地駅から徒歩1分',
      description:
        '雑貨も並ぶカフェ＆バル。看板メニューはふんわり焼き上げる「ダッチベイビー」。甘いスイーツ系から食事系まで選べ、駅近で子連れでも立ち寄りやすい。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'KOaA（コア）',
      genre: 'bakery',
      area: '二子新地駅から徒歩約3分',
      description:
        '週末限定のパン屋兼カフェ。オーナーが厳選素材で作るパンが並び、イートインでランチも楽しめる。自家製ツナのサンドイッチなどカスタマイズ可能。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
    {
      name: '甍（いらか）',
      genre: 'cafe',
      area: '二子新地駅から徒歩約7分',
      description:
        '宮城・岩沼にあった土蔵を改造した一軒家カフェ。静かな音楽が流れる落ち着いた空間で、コーヒーやケーキ、軽食をゆったり楽しめる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // センター北駅（横浜市都筑区）
  // ===========================================================
  'center-kita': [
    {
      name: '広東料理 天啓（てんかい）',
      genre: 'chinese',
      area: 'センター北駅から徒歩1分（ヨツバコ 7F）',
      description:
        '化学調味料不使用の本格広東料理。広々個室があり、おむつ交換スペースも完備。ベビーカー入店可で、家族でゆったり中華ランチを楽しめる。',
      strollerOk: true,
      privateRoom: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'Muu Muu Diner センター北 ヨツバコ店',
      genre: 'yoshoku',
      area: 'センター北駅から徒歩1分（ヨツバコ最上階）',
      description:
        '南国気分のハワイアンダイニング。ソファー席や個室、テラス席が揃い、キッズメニューも豊富。同フロアに個室授乳室があり赤ちゃん連れに人気。',
      strollerOk: true,
      privateRoom: true,
      kidsMenu: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table', 'terrace'],
      stepFree: true,
      bringBabyFood: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'イルポネンティーノ ピアッツア',
      genre: 'italian',
      area: 'センター北駅から徒歩1分（ヨツバコ内）',
      description:
        'カジュアルイタリアン。平日ランチのデザートをハーゲンダッツ食べ放題に変更でき、8名から貸切可能なソファ席もある。子連れママ会に使いやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'シャム（センター北）',
      genre: 'asian',
      area: 'センター北駅から徒歩3分（港北TOKYU S.C. 内）',
      description:
        '本格タイ料理店。ベビーカーのまま入店でき、ベビーチェアも完備。キッズメニューや離乳食持ち込みもOK。商業施設内に赤ちゃん休憩室あり。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      bringBabyFood: true,
      seatingType: ['table'],
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // センター南駅（横浜市都筑区）
  // ===========================================================
  'center-minami': [
    // ▼ 2026-08-12追加: サウスウッド（センター南駅前）の公式テナント一覧
    //   （two-south.jp/tenant_type/sw-all）から、フロア／ジャンル／営業時間を転記した。
    //   公式に予算・席数の掲載が無いため priceLunch は入れていない。
    //   フレッシュネスバーガー・KFC・サーティワンはチェーン側で出るため除外。
    {
      name: 'つきじ宮川本廛 横浜センター南サウスウッド店',
      genre: 'washoku',
      area: 'センター南駅前（サウスウッド 2F）',
      description:
        'うなぎ専門の和食店。うな重の白飯は子どもに分けやすい。土日祝は11:00〜21:00の通し営業で、平日より時間を選びやすい。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '金沢まいもん寿司 センター南',
      genre: 'sushi',
      area: 'センター南駅前（サウスウッド 2F）',
      description:
        '金沢発の寿司店。玉子やかっぱ巻きなど子どもが食べられるネタを単品で頼める。11:00〜21:00（L.O.20:30）。',
      seatingType: ['table', 'counter'],
    },
    {
      name: 'Italian Kitchen VANSAN センター南店',
      genre: 'italian',
      area: 'センター南駅前（サウスウッド 2F）',
      description:
        'パスタ・ピッツァのイタリアン。ピッツァは家族でシェアしやすい。11:00〜22:00（L.O.21:00）と通しで開いている。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '博多天ぷらたかお センター南サウスウッド店',
      genre: 'tempura',
      area: 'センター南駅前（サウスウッド 2F）',
      description:
        '揚げたてを順に出す天ぷら定食の店。ご飯と味噌汁が付き取り分けやすい。11:00〜21:30（L.O.21:00）。',
      seatingType: ['table', 'counter'],
      shareDish: true,
    },
    {
      name: 'MAYA RESTAURANT センター南サウスウッド店',
      genre: 'curry',
      area: 'センター南駅前（サウスウッド 2F）',
      description:
        'インド料理の店。ナンやカレーは取り分けやすい。辛さの調整可否は来店時に確認を。ランチL.O.16:00と昼の時間帯が長い。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'フラマンドール センター南サウスウッド店',
      genre: 'bakery',
      area: 'センター南駅前（サウスウッド 1F）',
      description:
        'ベーカリー・カフェ。平日8:00・土日祝9:00から開いており、朝食やパンを買って公園へ移動する使い方もできる。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '猿田彦珈琲 センター南サウスウッド店',
      genre: 'cafe',
      area: 'センター南駅前（サウスウッド 1F）',
      description:
        'スペシャルティコーヒーのカフェ。7:00〜22:00と朝から夜まで開いているので、外食の前後の休憩に使いやすい。',
      seatingType: ['table'],
    },
    {
      name: 'Italian Kitchen VANSAN センター南店',
      genre: 'italian',
      area: 'センター南駅前から徒歩1分（サウスウッド 2F）',
      description:
        'カジュアルなイタリアン。店内にキッズスペースが隣接するソファ席を選べ、子連れ家族に人気。パスタやピザを取り分けやすい大皿で楽しめる。',
      kidsSpace: true,
      shareDish: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      kidsChair: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'GRAN SOLEIL（グランソレイユ）',
      genre: 'curry',
      area: 'センター南駅から徒歩2分（サウスウッド 2F）',
      description:
        'リーズナブルな日替わりカレーランチが評判のインドカレー店。ベビーカーのまま入店OKでキッズメニューのカレーも選べる。施設内に授乳室あり。',
      strollerOk: true,
      kidsMenu: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '寿し常 港北センター南店',
      genre: 'sushi',
      area: 'センター南駅から徒歩3分',
      description:
        '海鮮・寿司・天ぷらを楽しめる和食店。ベビーカー入店可で離乳食持ち込みもOK、キッズチェアも完備。座敷個室もあり親族の集まりにも向く。',
      strollerOk: true,
      privateRoom: true,
      kidsChair: true,
      bringBabyFood: true,
      seatingType: ['zashiki', 'table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // あざみ野駅（横浜市青葉区）
  // ===========================================================
  'azamino': [
    {
      name: '100本のスプーン AZAMINO GARDENS',
      genre: 'yoshoku',
      area: 'あざみ野駅から徒歩約6分（あざみ野ガーデンズ内）',
      description:
        '100冊の絵本が並ぶキッズスペースがあるファミリーレストラン。月齢に合わせた離乳食を無料提供、半個室やテラス席もあり3世代の集まりに最適。',
      strollerOk: true,
      privateRoom: true,
      kidsMenu: true,
      kidsChair: true,
      kidsSpace: true,
      bringBabyFood: true,
      shareDish: true,
      seatingType: ['table', 'terrace'],
      stepFree: true,
      diaperChangingTable: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: 'カフェ・グーテ（あざみ野ガーデンズ）',
      genre: 'cafe',
      area: 'あざみ野駅から徒歩約6分（あざみ野ガーデンズ内）',
      description:
        'あざみ野ガーデンズ内のテラスカフェ。緑に囲まれた開放的な空間で、ベビーカーのまま入りやすい。軽食やスイーツがそろい、ママ会にも気軽。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'AZAMINO INDIAN RESTAURANT',
      genre: 'curry',
      area: 'あざみ野駅から徒歩約3分',
      description:
        '地元で愛されるインドカレー店。子ども椅子の用意があり、辛さ調整やナンのシェアで小さな子も食べやすい。日替わりランチセットがお手頃価格。',
      kidsChair: true,
      shareDish: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],
};
