/**
 * 駅別 個人店マッピング — chunk-25（東京・子連れランチ拡充：城東湾岸〜城南・大田区）
 *
 * - 各駅ごとに Web 調査で実在を確認した実名の個人店のみを掲載
 * - 子連れ向き設備（ベビーカー・座敷・おむつ替え等）は公開情報・取材記事ベースの推定。
 *   最終的には店舗確認前提。
 * - 食べログ点数等の数値スコアは引用していない
 * - chunk-1〜24 と同じ駅 slug は index.ts の mergeIndieMaps で結合される
 */

import type { StationIndieMap } from './types';

export const CHUNK_25: StationIndieMap = {
  // ===========================================================
  // 亀戸（江東区）
  // ===========================================================
  'kameido': [
    {
      name: '亀戸升本 本店',
      genre: 'washoku',
      area: '亀戸駅から徒歩3分',
      description:
        '名物「亀戸大根あさり鍋」など亀戸大根料理が味わえる和食店。ゆったりした店内はベビーカー入店もしやすく、個室や和室があるので赤ちゃん連れでも落ち着いて過ごせる。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      bringBabyFood: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'Vietnam 151A（ベトナム イチゴイチエ）',
      genre: 'asian',
      area: '亀戸駅から徒歩2分',
      description:
        '本格ベトナム料理が楽しめる個人店。ベビーカーのまま入店でき、ランチはフォーや定食が手頃。生春巻きなど取り分けやすいメニューが多く子連れランチにも向く。',
      strollerOk: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'Osteria Hana（オステリア ハナ）',
      genre: 'italian',
      area: '亀戸駅から徒歩4分',
      description:
        '全席ソファダイニングのイタリアン。ベンチソファ席で子どもと並んで食事ができ、安全バー付きの木製チェアも用意。ベビーカーのまま入店でき家族利用しやすい。',
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
  // 森下（江東区）
  // ===========================================================
  'morishita': [
    {
      name: 'カフェレストラン 鍵',
      genre: 'yoshoku',
      area: '森下駅A4出口から徒歩2分',
      description:
        '森下で50年以上続く下町の洋食店。アジフライや生姜焼きなどの定食がご飯・味噌汁付きで手頃。落ち着いた家庭的な雰囲気で、ハンバーグやオムライスは子どもとの取り分けにも向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
    {
      name: '定食カフェ ラハン',
      genre: 'washoku',
      area: '森下駅から徒歩5分',
      description:
        'ご近所の定食屋といった雰囲気の定食カフェ。週替わりのランチセットは900円台とボリューム満点で手頃。下町の気取らない空間で、子連れでも気兼ねなく入りやすい。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 清澄白河（江東区）
  // ===========================================================
  'kiyosumi-shirakawa': [
    {
      name: 'mamma cafe 151A（イチゴイチエ）',
      genre: 'cafe',
      area: '清澄白河駅から徒歩5分',
      description:
        '畳の小上がり席があり、ベビーフードのメニューやおむつ替えスペース、キッズチェアも完備した子連れ歓迎のカフェ。小上がり席は予約でき、赤ちゃん連れのランチに使いやすい。',
      strollerOk: true,
      kidsMenu: true,
      privateRoom: true,
      kidsChair: true,
      seatingType: ['zashiki', 'table'],
      diaperChangingTable: true,
      stepFree: true,
      bringBabyFood: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'iki ESPRESSO TOKYO',
      genre: 'cafe',
      area: '清澄白河駅から徒歩6分',
      description:
        'ニュージーランドスタイルのカフェ。通路が広めでベビーカーの乗り入れも楽。「ベビーチーノ」など子ども向けドリンクもあり、ブランチを家族でゆっくり楽しめる。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 新木場（江東区）
  // ===========================================================
  'shin-kiba': [
    {
      name: 'CASICA（カシカ）',
      genre: 'cafe',
      area: '新木場駅から徒歩6分',
      description:
        '倉庫をリノベーションした古道具店併設のカフェ。広い店内に席のバリエーションが多く、薬膳ベースの体にやさしいランチを提供。キッズチェアや授乳室があり、子連れに慣れたスタッフが安心。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table'],
      nursingRoom: true,
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'soko station 146',
      genre: 'cafe',
      area: '新木場駅から徒歩5分',
      description:
        '天井高4mの倉庫カフェ。カレーやキッシュ、ホットドッグなど家族で食べやすいメニューが揃い、りんごジュースやベビーチーノなど子ども向けドリンクも。開放的でベビーカーも入りやすい。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'tomoru 茶屋',
      genre: 'washoku',
      area: '新木場駅から徒歩圏内',
      description:
        '体にやさしい和食と和スイーツの店。子どもも安心して食べられる料理が中心で、ランチセットはサラダ＆ドリンクビュッフェを付けられる。落ち着いた雰囲気で子連れランチに向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 豊洲（江東区）
  // ===========================================================
  'toyosu': [
    {
      name: '豊洲ダイニング 梟（FUKUROU）',
      genre: 'yoshoku',
      area: '豊洲駅から徒歩3分（豊洲プライムスクエア2F）',
      description:
        'すだれで仕切れる可動式の個室空間が魅力のダイニング。ランチはメイン＋サラダブッフェ＋スープ付きで手頃、ソフトクリームも食べ放題。仕切れる席で子連れママ会にも使いやすい。',
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 有明（江東区）
  // ===========================================================
  'ariake': [
    {
      name: 'ロハスカフェ ARIAKE',
      genre: 'cafe',
      area: '有明駅／国際展示場駅から徒歩圏内（武蔵野大学有明キャンパス内）',
      description:
        '武蔵野大学有明キャンパス内にあり一般客も利用できるカフェ。席の間隔が広くベビーカーでもゆったり、ベビーチェアや子ども用カトラリーも。自然派イタリアンの日替わりは800円と手頃。',
      strollerOk: true,
      kidsChair: true,
      kidsCutlery: true,
      seatingType: ['table', 'terrace'],
      shareDish: true,
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 国際展示場（江東区）
  // ===========================================================
  'kokusai-tenjijo': [
    {
      name: 'ロハスカフェ ARIAKE',
      genre: 'cafe',
      area: '国際展示場駅から徒歩圏内（武蔵野大学有明キャンパス内）',
      description:
        '武蔵野大学有明キャンパス内の自然派カフェ。一般利用OKで、明るく広い店内とテラス席があり子連れ客も多い。席間が広くベビーカーで入りやすく、子ども用カトラリーで取り分けもしやすい。',
      strollerOk: true,
      kidsChair: true,
      kidsCutlery: true,
      seatingType: ['table', 'terrace'],
      shareDish: true,
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 大崎（品川区）
  // ===========================================================
  'osaki': [
    {
      name: 'cafe&hall ours（アワーズ）',
      genre: 'cafe',
      area: '大崎駅から徒歩2分',
      description:
        '自然光が差し込む明るいカフェ。ベビーカーのまま入店でき子連れママの利用も多く、キッズメニューも用意。立地もよく、買い物や散歩のあいまの子連れランチに使いやすい。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '大崎ブックカフェ',
      genre: 'cafe',
      area: '大崎駅から徒歩圏内',
      description:
        'ベビーカーで入店でき、飲食物の持ち込みやキッチン利用もできるブックカフェ。本に囲まれた自由な空間で、自分たちのペースで過ごせるので赤ちゃん連れでも気兼ねなく休憩できる。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      bringBabyFood: true,
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
    {
      name: 'イルキャンティ 大崎',
      genre: 'italian',
      area: '大崎駅から徒歩圏内（ダイワロイネットホテル内）',
      description:
        'ホテル内のイタリアン。ランチは1,000円前後と手頃で、離乳食の持ち込みOK、お子様チェアやミルク用のお湯の用意もあり子育て世帯への配慮が手厚い。',
      kidsChair: true,
      seatingType: ['table'],
      bringBabyFood: true,
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 五反田（品川区）
  // ===========================================================
  'gotanda': [
    {
      name: 'トラットリア ロマーノ 五反田',
      genre: 'italian',
      area: '五反田駅から徒歩1分',
      description:
        '自家製パン食べ放題が人気のトラットリア。パスタやピザの種類が豊富で、個室席やソファ席があり、ベビーカーのまま入店できる。コスパがよく家族での利用にも向く。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 目黒（品川区／目黒駅）
  // ===========================================================
  'meguro': [
    {
      name: 'les joues de BeBe（レ・ジュ・ドゥ・べべ）',
      genre: 'bakery',
      area: '目黒駅から徒歩5分',
      description:
        'カフェを併設したパン屋。焼きたてパンが豊富で、モーニングからランチ・ディナーまでメニューが充実。気軽に立ち寄れる雰囲気で、子連れでのパンランチに使いやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '林屋茶園 目黒店',
      genre: 'cafe',
      area: '目黒駅から徒歩2分',
      description:
        '創業260余年「京はやしや」の伝統を継ぐ和カフェ。上質な茶葉スイーツや甘味が味わえ、駅近で立ち寄りやすい。落ち着いた和の空間で子連れでのひと休みにも向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 大井町（品川区）
  // ===========================================================
  'oimachi': [
    {
      name: 'B&M 151A（ビーアンドエム イチゴイチエ）',
      genre: 'yoshoku',
      area: '大井町駅から徒歩圏内',
      description:
        'ステーキやハンバーグなど肉料理が評判の店。ベビーカー入店OK、キッズチェアや子ども用メニューがあり子連れ歓迎。家族でしっかり食べたいランチに向く。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      stepFree: true,
      bringBabyFood: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '中国料理 和福飯店',
      genre: 'chinese',
      area: '大井町駅から徒歩5分',
      description:
        '200種類以上の料理を一品300円程度から楽しめる中華料理店。ランチは700円前後と手頃で、小皿で色々頼めるので子どもとの取り分けにも便利。気軽に入れる町中華。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 武蔵小山（品川区）
  // ===========================================================
  'musashi-koyama': [
    {
      name: 'イタリアン食堂 MAS（マス）',
      genre: 'italian',
      area: '武蔵小山駅から徒歩圏内',
      description:
        'オーナーシェフのこだわりが詰まったイタリアン。パスタランチやサラダランチが1,200円からと手頃で、お子様メニューも充実。ベビーカー入店OKで子連れランチに使いやすい。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: "Sherry's Burger Cafe 武蔵小山",
      genre: 'yoshoku',
      area: '武蔵小山駅から徒歩圏内',
      description:
        '自家製パティとバンズのグルメバーガー店。小さな子ども連れでも安心のアットホームな雰囲気で、ベビーカー入店OK、お子様メニューもあり。家族でのバーガーランチに向く。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'HEIMAT CAFE（ハイマートカフェ）',
      genre: 'cafe',
      area: '武蔵小山駅から徒歩2分',
      description:
        '約1,000冊の本が並ぶブックカフェ＆ダイニングバー。スープ＆ドリンク付きランチが980円とリーズナブル。子どもから大人まで楽しめる本があり、子連れでゆっくり過ごせる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 学芸大学（目黒区）
  // ===========================================================
  'gakugei-daigaku': [
    {
      name: 'みどりえ',
      genre: 'washoku',
      area: '学芸大学駅から徒歩圏内',
      description:
        '契約農家から届く有機野菜やお米を使う、家族連れ向けのオーガニックレストラン。店内が広くベビーカー入店OK、個室やおむつ替え・授乳スペースもあり赤ちゃん連れに安心。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      nursingRoom: true,
      bringBabyFood: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'L.A.GARAGE3（エルエーガレージ3）',
      genre: 'yoshoku',
      area: '学芸大学駅から徒歩圏内',
      description:
        'ハンバーガー専門店。ベビーカーのまま入店でき、赤ちゃん用のおむつ替え台も完備。アメリカンな雰囲気の中、家族でボリュームあるバーガーランチを楽しめる。',
      strollerOk: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      stepFree: true,
      bringBabyFood: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'エンポリオ 学芸大学',
      genre: 'italian',
      area: '学芸大学駅から徒歩圏内',
      description:
        '乳児から小学生まで子連れOKのイタリアン。ベビーカー入店ができ、お子様メニューも用意。気取らない雰囲気で、家族でのパスタ・ピザランチに使いやすい。',
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
  // 大森（大田区）
  // ===========================================================
  'omori': [
    {
      name: 'おやこcafe verde（ヴェルデ）',
      genre: 'cafe',
      area: '大森駅西口から徒歩約17分',
      description:
        '無農薬を心掛けたランチプレートが評判の親子カフェ。靴を脱いで上がる座敷席に子ども用イス、おむつ交換対応、絵本やおもちゃも。離乳食の持ち込みもでき赤ちゃん連れに手厚い。',
      kidsMenu: true,
      privateRoom: true,
      kidsChair: true,
      seatingType: ['zashiki'],
      diaperChangingTable: true,
      bringBabyFood: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'hatome kitchen（ハトメキッチン）',
      genre: 'cafe',
      area: '大森駅から徒歩圏内',
      description:
        '曜日ごとにシェフが替わる日替わりカフェ。ベビーカー入店OK、土間席や子ども用イス、おむつ交換台、おもちゃと絵本も。訪れるたび違うメニューに出会えるのも楽しい。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'bistro tetete（ビストロ テテテ）',
      genre: 'french',
      area: '大森駅から徒歩約5分',
      description:
        'ホテル出身のシェフが営むビストロ。ベビーカーと一緒に本格的なランチを楽しめる店として知られ、丁寧な料理を子連れでも落ち着いて味わえる。',
      strollerOk: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 蒲田（大田区）
  // ===========================================================
  'kamata': [
    {
      name: '青蓮 蒲田東口店',
      genre: 'chinese',
      area: '蒲田駅東口から徒歩圏内',
      description:
        '「毎日食べても飽きない身体にやさしいヘルシー中華」がコンセプトの中華料理店。子連れでも気兼ねなく楽しめる雰囲気で、料理を取り分けながら家族でのランチに向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '牛吟（ぎゅうぎん）',
      genre: 'yakiniku',
      area: '蒲田駅から徒歩1分',
      description:
        'A5ランクの国産黒毛和牛を扱う焼肉店。完全個室と半個室があり子連れでも周りを気にせずゆっくり食事ができる。ベビーカー入店もOKで、家族での焼肉ランチに向く。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 京急蒲田（大田区）
  // ===========================================================
  'keikyu-kamata': [
    {
      name: 'cafe ig（カフェ アイジー）',
      genre: 'cafe',
      area: '京急蒲田駅から徒歩5分',
      description:
        'ナポリタンが看板メニューのカフェ。ランチタイムはスペシャルティコーヒーを含むドリンク付きで、ベビーカー入店もOK。気軽に立ち寄れる雰囲気で子連れランチに向く。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'Hidamariカフェ',
      genre: 'cafe',
      area: 'JR蒲田駅から徒歩6分（京急蒲田駅からも徒歩圏内）',
      description:
        'こだわりの有機食材を使った身体にやさしい料理を、自分好みに選べる定食スタイルのカフェ。ベビーカー入店OKで、栄養バランスのよい子連れランチに使いやすい。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],
};
