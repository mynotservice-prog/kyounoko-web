/**
 * 駅別 個人店マッピング — chunk-40a（埼玉15駅 子連れランチ）
 *
 * - 各駅ごとに Web 調査で実在を確認した実名の個人店・小規模店のみを掲載
 * - 全国チェーン（梅の花・木曽路・ざうお・ナポリの食卓 等）は対象外
 *   （lib/station-restaurants.ts で全駅自動付与済み）
 * - 子連れ向き設備は公式サイト・取材記事ベースの推定。最終的には店舗確認前提
 * - 食べログ点数等の数値スコアは引用していない
 */

import type { StationIndieMap } from './types';

export const CHUNK_40A: StationIndieMap = {
  // ===========================================================
  // 大宮駅（さいたま市大宮区）
  // ===========================================================
  'omiya': [
    {
      name: 'IRIS（アイリス）',
      genre: 'yoshoku',
      area: '大宮駅東口から徒歩6分',
      description:
        '創業以来手作りハンバーグを焼き続ける町の洋食店。店でお肉を挽くふんわり食感のハンバーグと、看板のチーズタルタル仕立てが28年愛される。テラス席もあり、家族の平日ランチで使いやすい。',
      seatingType: ['table', 'terrace'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'ビストロ ボナペティ',
      genre: 'yoshoku',
      area: '大宮駅東口から徒歩3分',
      description:
        '100%ビーフの手ごねハンバーグと「大宮ナポリタン」が看板の街洋食店。デミグラスやガーリッククリームなどソースの種類が豊富で、子どもにも食べやすい味付け。昼はカジュアルに利用できる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'WIRED CAFE ルミネ大宮店',
      genre: 'cafe',
      area: '大宮駅西口直結（ルミネ大宮2 1F）',
      description:
        '駅直結のルミネ大宮内のカフェダイニング。テーブル席にベビーカーを横付けでき、キッズチェアやベビー食器の用意もある。ルミネ館内に授乳室・おむつ替え台があり、雨の日のママ会にも便利。',
      strollerOk: true,
      kidsChair: true,
      diaperChangingTable: true,
      nursingRoom: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'シナグロ オーガニックサラダ＆カフェ ルミネ大宮店',
      genre: 'cafe',
      area: '大宮駅西口直結（ルミネ大宮）',
      description:
        '有機野菜を使ったサラダボウルと日替わりデリの専門カフェ。ベビーカー入店OKで、駅直結なのでアクセスしやすい。野菜中心のメニューで子どもにも取り分けやすい。',
      strollerOk: true,
      shareDish: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 浦和駅（さいたま市浦和区）
  // ===========================================================
  'urawa': [
    {
      name: 'SOMETHING サムシング 浦和本店',
      genre: 'italian',
      area: '浦和駅から徒歩4分',
      description:
        '住宅街にある30年以上愛されるイタリアン。陽気なイタリア家庭のような雰囲気で、6〜9名対応の扉付き掘りごたつ個室を備える。全席禁煙でベビーカー入店も可能、家族でゆっくり過ごせる。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'LA COCORICO 浦和（ラ ココリコ）',
      genre: 'french',
      area: '浦和駅から徒歩圏（浦和パルコ）',
      description:
        'ロティサリーチキンが名物のカジュアルフレンチ。個室やソファ席があり、子ども連れでも落ち着いて食事ができる構成。骨付きチキンは取り分けやすく、家族のランチに向く。',
      privateRoom: true,
      shareDish: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'RENO cafe（レノカフェ）',
      genre: 'cafe',
      area: '浦和駅から徒歩圏',
      description:
        '国産小麦・直納野菜にこだわる手作りカフェ。ハンバーグやソーセージのキッズプレートが人気で、木の温もりがある隠れ家のような空間。子連れでものんびりランチを楽しめる。',
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'オクラカレーストア',
      genre: 'curry',
      area: '浦和駅から徒歩圏',
      description:
        '夫婦2人で営むカレー店。なるべくオーガニック・無添加でカレー全種グルテンフリー対応。2階に座敷席があり、おもちゃも置かれているので子どもも一緒に楽しめる。',
      kidsSpace: true,
      seatingType: ['zashiki', 'counter'],
      stepFree: false,
      diaperChangingTable: true,
      kidsChair: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 川口駅（川口市）
  // ===========================================================
  'kawaguchi': [
    {
      name: 'SHO-AN（ショウアン）',
      genre: 'curry',
      area: '川口駅東口から徒歩3分',
      description:
        '図書館のような落ち着いた雰囲気の小さなスープカレー店。辛さの調節が可能で辛いのが苦手な子どもにも対応してもらえる。テーブル18席のみだが、子連れでもゆっくり過ごしやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'CLAP×CLAP（クラップクラップ）',
      genre: 'cafe',
      area: '川口駅から徒歩圏',
      description:
        'たこ焼き店「めちゃうまたこ源」内のキッズカフェ。無料のキッズスペースが併設され、子どもが遊ぶ近くでゆっくりランチが食べられる。授乳室も完備で乳児連れにありがたい。',
      kidsSpace: true,
      nursingRoom: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      kidsChair: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'リリア カフェ',
      genre: 'cafe',
      area: '川口駅西口直結（川口総合文化センター リリア 1F）',
      description:
        '駅西口直結の文化センター内カフェ。天井が高く明るい店内でテーブル間隔がゆったり。ベビーカーのまま入店でき、館内に授乳室・おむつ替え台あり、雨の日の待ち合わせにも便利。',
      strollerOk: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 西川口駅（川口市）
  // ===========================================================
  'nishi-kawaguchi': [
    {
      name: "BLOOMY'S（ブルーミーズ）",
      genre: 'cafe',
      area: '西川口駅から徒歩5分',
      description:
        'ドライフラワーに囲まれた癒し系のフラワーカフェ。日替わりプレートが楽しめ、写真映えする店内は子連れママ会の利用も多い。テーブル席中心で落ち着いて食事できる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '福招門 西川口店',
      genre: 'chinese',
      area: '西川口駅から徒歩1分',
      description:
        '本格中華の定食が1,000円前後で楽しめる町中華。円卓席や個室・座敷もあり、取り分けやすい中華料理は家族の昼食に重宝。駅直近でアクセスもよくファミリー利用が多い。',
      privateRoom: true,
      shareDish: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '焼肉 済州苑 西川口店',
      genre: 'yakiniku',
      area: '西川口駅から徒歩2分',
      description:
        '西川口の老舗焼肉店。テーブル席・ボックス席に加えて最大10名対応の座敷席があり、子連れファミリーの利用も多い。ランチタイムから利用できる落ち着いた空間。',
      seatingType: ['zashiki', 'box', 'table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 草加駅（草加市）
  // ===========================================================
  'soka': [
    {
      name: 'いけだ屋 草加せんべい本店',
      genre: 'sweets',
      area: '草加駅から徒歩7分',
      description:
        '草加名物の老舗手焼きせんべい店。店頭で焼きたての煎餅を購入でき、香ばしい匂いと焼き体験は子どもにも楽しい。家族のおやつ調達やお土産に便利。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 川越駅（川越市）
  // ===========================================================
  'kawagoe': [
    {
      name: 'MOANA cafe & diner（モアナ カフェ＆ダイナー）',
      genre: 'asian',
      area: '川越駅から徒歩6分',
      description:
        'ハワイアン創作料理のカフェダイナー。ステンドグラス調のおしゃれな店内でゆったりソファ席があり、子連れでもくつろげる。パンケーキ食べ放題のメニューが人気。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'café+kitchen 北風と太陽',
      genre: 'cafe',
      area: '本川越駅から徒歩7分',
      description:
        '川越育ちの店主が実家のクリーニング店をリノベした隠れ家カフェ。看板のタコライスやランチプレートが楽しめる。カウンター3席と4名席3卓のみで席間隔も保たれ、子連れも気軽に利用できる。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'カフェ マチルダ',
      genre: 'cafe',
      area: '本川越駅から徒歩3分',
      description:
        '朝から夜まで楽しめるパンケーキ専門店。ドリンク付きのお子さん向けパンケーキセットがあり、ベビーカー入店もOK。観光途中の家族の休憩に使いやすい川越の人気カフェ。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'Brighton cafe 本店（ブライトンカフェ）',
      genre: 'italian',
      area: '川越駅から徒歩圏',
      description:
        '生パスタと自然派ワインのイタリアンカフェ。テーブル席が広々していて子連れでもゆったりカフェタイムが過ごせる。ベビーカー入店OKで観光ファミリーの利用も多い。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 所沢駅（所沢市）
  // ===========================================================
  'tokorozawa': [
    {
      name: '和亭 武',
      genre: 'washoku',
      area: '狭山ヶ丘駅近く（所沢エリア）',
      description:
        '懐石料理を子連れでも楽しめる和食店。2名から利用できる個室があり、座敷個室にはキッズスペースとおもちゃを完備。お祝い・記念日の家族ランチに向く落ち着いた空間。',
      privateRoom: true,
      kidsSpace: true,
      seatingType: ['zashiki'],
      diaperChangingTable: true,
      kidsChair: true,
      priceLunch: '〜3,500円',
    },
    {
      name: 'グランエミオ所沢 カフェ＆レストラン街',
      genre: 'cafe',
      area: '所沢駅東口直結（グランエミオ所沢）',
      description:
        '駅直結のショッピング施設内にあるカフェ・レストランフロア。各店ベビーカー入店OKが多く、館内に授乳室・おむつ替え台を完備。雨の日でも安心の子連れランチ拠点。',
      strollerOk: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'エミテラス所沢 ファミリーダイニング',
      genre: 'others',
      area: '所沢駅東口直結（エミテラス所沢）',
      description:
        '2024年開業の駅直結商業施設内のレストランフロア。広い通路でベビーカーで回遊でき、館内に授乳室・キッズトイレを完備。家族の休日ランチや雨の日の食事に便利。',
      strollerOk: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 春日部駅（春日部市）
  // ===========================================================
  'kasukabe': [
    {
      name: 'イル・カンパネッロ',
      genre: 'italian',
      area: '春日部駅から徒歩10分',
      description:
        '住宅街の中にある明るくおしゃれなイタリアン。前菜・パン・パスタ・ドリンク・デザート付きのランチが1,680円〜。ベビーカー入店可で、駐車場10台分完備で車での家族利用にも便利。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'イタリア食堂 テラマーテル',
      genre: 'italian',
      area: '春日部駅から徒歩8分',
      description:
        'パスタ・ピッツァが10種類以上から選べるイタリア食堂。ベビーカー入店OK、おむつ替えシート完備で乳児連れでも安心。地元のファミリーに親しまれる一軒。',
      strollerOk: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 越谷駅（越谷市）
  // ===========================================================
  'koshigaya': [
    {
      name: 'Cafe & Dining ARISTAR（アリスター）',
      genre: 'cafe',
      area: '越谷駅から徒歩1分',
      description:
        '駅近のキッズスペース付きカフェダイニング。遊び道具が揃ったキッズスペースで子どもを遊ばせながら、ワンプレートランチを楽しめる。日替わりスープ付きでママ会利用が多い。',
      kidsSpace: true,
      kidsChair: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'CAFE803（カフェ ハチマルサン）',
      genre: 'cafe',
      area: '越谷市旧日光街道沿い（越谷駅エリア）',
      description:
        '落ち着いた一軒家カフェ。ボードゲームや絵本が用意され、子どもも楽しめる。おむつ替え台付きトイレと全席終日禁煙で乳幼児連れに安心。駐車場あり。',
      diaperChangingTable: true,
      kidsSpace: true,
      seatingType: ['table'],
      kidsChair: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 越谷レイクタウン駅（越谷市・イオンレイクタウン最寄り）
  // ===========================================================
  'koshigaya-laketown': [
    {
      name: 'Caffe Banano 越谷レイクタウン駅前店',
      genre: 'cafe',
      area: '越谷レイクタウン駅ロータリー内',
      description:
        '駅前ロータリー内のカフェ。くま型デザインのパンケーキが看板で、見た目が可愛く子どもにも人気。駅近でベビーカーアクセスもしやすく、家族の休憩スポットに便利。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '花粥（ホアジョウ）イオンレイクタウンmori店',
      genre: 'chinese',
      area: '越谷レイクタウン駅直結（イオンレイクタウンmori 1F）',
      description:
        '点心と台湾粥の専門店。お粥は毎日生米から炊き上げ、お子様ワンタン麺セットなど子ども向けメニューも用意。優しい味で離乳食後期から取り分けしやすい。',
      kidsMenu: true,
      shareDish: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'さんるーむ レイクタウン店',
      genre: 'washoku',
      area: '越谷レイクタウン駅直結（レイクタウンKAZE 3F）',
      description:
        '旬の食材を使った身体に優しい自然食レストラン。和定食中心で、薄味の家庭的な味付けは子どもにも安心。館内に授乳室・おむつ替え台完備で乳児連れも快適。',
      strollerOk: true,
      nursingRoom: true,
      diaperChangingTable: true,
      shareDish: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 武蔵浦和駅（さいたま市南区）
  // ===========================================================
  'musashi-urawa': [
    {
      name: '58カフェとレストラン ティカル',
      genre: 'cafe',
      area: '武蔵浦和駅から徒歩圏',
      description:
        'キッズスペース付きのカフェ＆レストラン。子どもが遊ぶ様子を眺めながらゆっくりランチが楽しめる構成で、武蔵浦和エリアのママ会の定番店。',
      kidsSpace: true,
      kidsChair: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'マーレ ベジファーストカフェ 武蔵浦和店',
      genre: 'cafe',
      area: '武蔵浦和駅直結（マーレ武蔵浦和）',
      description:
        '駅直結のショッピング施設マーレ内の野菜が摂れるカフェ。ベビーカーのまま入店でき、館内に授乳室・おむつ替え台があり、乳児連れランチに使いやすい。',
      strollerOk: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '武蔵浦和ロッテシティホテル 1Fカフェレストラン',
      genre: 'yoshoku',
      area: '武蔵浦和駅西口直結',
      description:
        '駅直結のシティホテル内レストラン。ゆとりあるテーブル間隔でベビーカー横付けOK、ホテル内に授乳室・おむつ替え台あり。家族のお祝いランチにも向く。',
      strollerOk: true,
      nursingRoom: true,
      diaperChangingTable: true,
      kidsChair: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 北浦和駅（さいたま市浦和区）
  // ===========================================================
  'kita-urawa': [
    {
      name: 'ペペロネ（埼玉県立近代美術館内）',
      genre: 'italian',
      area: '北浦和駅から徒歩3分（埼玉県立近代美術館 1F）',
      description:
        '美術館併設のイタリアン＆フレンチのカフェレストラン。新鮮野菜を使ったランチを提供し、ソファ席あり・ベビーカー入店OK。北浦和公園を散歩したあとの家族ランチに最適。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '韓美食 オンギージョンギー',
      genre: 'korean',
      area: '北浦和駅東口から徒歩4分',
      description:
        'おしゃれなカフェ風の店内でコリアンランチが楽しめる店。椅子の下に荷物入れがあり、パーテーション付きカウンターなど細やかな配慮があるので子連れでも落ち着ける。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'カフェ・ド・シュクレ',
      genre: 'cafe',
      area: '北浦和駅すぐ（ビル2F）',
      description:
        '駅すぐのビル2階にある小さな個人カフェ。落ち着いた雰囲気で、ランチタイムにはキッシュ・ドリア・焼きカレー・パスタなど家庭的な洋食メニューが楽しめる。',
      seatingType: ['table'],
      stepFree: false,
      priceLunch: '〜2,000円',
    },
    {
      name: '越コーヒー店（こしコーヒーてん）',
      genre: 'cafe',
      area: '北浦和駅から徒歩圏',
      description:
        '1973年創業の自家焙煎コーヒー老舗。厚切りトーストなど豊富なランチ・モーニングメニューが揃い、朝7時から営業。子連れの早めの朝食〜ブランチに便利。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 朝霞駅（朝霞市）
  // ===========================================================
  'asaka': [
    {
      name: 'イタリアン＆カフェ すわん',
      genre: 'italian',
      area: '朝霞駅南口から徒歩5分',
      description:
        'ベビーカーをそのまま席まで運べる子連れ歓迎のイタリアン＆カフェ。ランチメニューが充実し、地元ママの定番ランチ会場。落ち着いた雰囲気で乳児連れも安心。',
      strollerOk: true,
      strollerToSeat: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'ボン・パストス',
      genre: 'italian',
      area: '朝霞駅すぐ',
      description:
        '自家製生パスタが楽しめるイタリアン。片側ソファタイプのテーブル席があり、子ども連れでも安心。お子様パスタ付きランチセットもあり、家族でシェアしながら食事できる。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      bringBabyFood: true,
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '朝霞 小上がり座敷カフェ（市公式紹介）',
      genre: 'cafe',
      area: '朝霞駅から徒歩4分',
      description:
        '小上がり座敷席を備えた朝霞市公認のキッズフレンドリーカフェ。おむつ替え・授乳スペースがあり、焼きたてキッシュ・ミニデザート・KIDSプレートを提供。',
      kidsMenu: true,
      diaperChangingTable: true,
      nursingRoom: true,
      seatingType: ['zashiki', 'table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 和光市駅（和光市）
  // ===========================================================
  'wako-shi': [
    {
      name: 'Wine食堂 honu cafe（ホヌ カフェ）',
      genre: 'cafe',
      area: '和光市駅から徒歩1分',
      description:
        '駅徒歩1分の好立地カフェダイニング。落ち着いた雰囲気でランチセットを楽しめ、ベビーカーアクセスもしやすい。家族の昼食やママ会に向く。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'T-PARK CAFE（ティーパークカフェ）',
      genre: 'cafe',
      area: '和光市駅から徒歩圏',
      description:
        '公園コンセプトの明るくポップなカフェ。キッズスペースとテラス席を備え、和コモコ・ナポリタン・釜揚げうどんなどメニューが豊富。キッズメニューもあり子連れに最適。',
      kidsMenu: true,
      kidsSpace: true,
      seatingType: ['table', 'terrace'],
      diaperChangingTable: true,
      kidsChair: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: "Cafe's Kitchen ファーナウ",
      genre: 'yoshoku',
      area: '和光市駅から徒歩圏（和光市総合福祉会館近く）',
      description:
        '伊豆牛メンチや伊豆牛ハンバーグが看板の洋食カフェ。野菜たっぷりのキーマカレーやロコモコ丼もあり、ベビーカー入店・離乳食持ち込みOKで乳児連れに親切。',
      strollerOk: true,
      bringBabyFood: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '千の庭 和光市南口店',
      genre: 'washoku',
      area: '和光市駅南口すぐ',
      description:
        '料亭のような落ち着いた個室で純和食が楽しめる和食店。松花堂弁当・天ぷら・そばの御膳など子どもにも取り分けやすいメニューが揃う。お祝いの家族ランチに向く。',
      privateRoom: true,
      shareDish: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 志木駅（新座市）
  // ===========================================================
  'shiki': [
    {
      name: '森の中のおひるねくまさん',
      genre: 'cafe',
      area: '志木駅南口から徒歩3分（ベルセゾン内）',
      description:
        '可愛らしい世界観で人気のカフェ。ぬいぐるみや絵本のあるくつろぎ空間で、ベビーカーでも入りやすい。スイーツ目当てのママ会・子連れカフェタイムに最適。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'デスティーノ・ドゥエ（DESTINO DUE）',
      genre: 'italian',
      area: '志木駅南口から徒歩9分',
      description:
        'テラス席のあるイタリアン。他のお客さんに気を遣わずに食事ができ、子ども連れでも気軽に利用できる。カフェタイムは11〜18時で散歩途中の立ち寄りにも便利。',
      seatingType: ['table', 'terrace'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'FOOD HALL SHIKISM（フードホール シキズム）',
      genre: 'others',
      area: '志木駅東口から徒歩1分',
      description:
        '4店舗の専門店が集まるフードホール。共通の広いテーブル席でジャンルの違う料理をシェアでき、子どもの好み別に取り分けやすい。ベビーカー入店も対応。',
      strollerOk: true,
      shareDish: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],
};
