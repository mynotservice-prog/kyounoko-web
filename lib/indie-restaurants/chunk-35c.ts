/**
 * 駅別 個人店マッピング — chunk-35c（神奈川・湘南/県西/県央10駅 子連れランチ）
 *
 * - 各駅ごとに Web 調査で実在を確認した実名の個人店のみを掲載
 * - チェーン店は対象外（lib/station-restaurants.ts で全駅自動付与済み）
 * - 子連れ向き設備は公開情報・取材記事ベースの推定。最終的には店舗確認前提
 * - 食べログ点数等の数値スコアは引用していない
 */

import type { StationIndieMap } from './types';

export const CHUNK_35C: StationIndieMap = {
  // ===========================================================
  // たまプラーザ（横浜市青葉区）
  // ===========================================================
  'tama-plaza': [
    {
      name: 'フレンチバル レ・サンス',
      genre: 'french',
      area: 'たまプラーザ駅北口から徒歩5分',
      description:
        '地元横浜の野菜やヨーロッパ産の肉、各地の鮮魚を使ったフランス地方料理が楽しめるビストロ。個室とテラス席があり、子連れOKの案内あり。',
      privateRoom: true,
      seatingType: ['table', 'terrace'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
    {
      name: "nana's green tea たまプラーザテラス店",
      genre: 'cafe',
      area: 'たまプラーザ駅直結（たまプラーザテラス 3F）',
      description:
        '現代の茶室をテーマにした日本茶カフェ。だし茶漬けや丼物のランチが揃い、ベビーカーのまま入店でき、キッズチェアの貸出にも対応。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 藤沢駅（藤沢市）
  // ===========================================================
  'fujisawa': [
    {
      name: '3+3CAFE（サンタスサンカフェ）',
      genre: 'cafe',
      area: '藤沢駅北口から徒歩12分（Fプレイス 6F）',
      description:
        'Fプレイス6階の眺望カフェ。テラス席からは江の島と富士山が望め、子どもがのびのびできる開放感が魅力。ハンバーグや湘南食材のランチが人気。',
      kidsMenu: true,
      seatingType: ['table', 'terrace'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '甘味とごはんや 八一（やいち）',
      genre: 'washoku',
      area: '藤沢駅から徒歩5分',
      description:
        '築100年の古民家をリノベーションした和カフェ。座敷席があり、ごはんものから甘味まで揃うため、子連れランチからおやつタイムまで使いやすい。',
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'コマチーナ',
      genre: 'italian',
      area: '本鵠沼駅から徒歩すぐ（藤沢駅から1駅）',
      description:
        '地元食材を使った優しい味わいのイタリアン。子ども向けのパスタセットやドリンクなどキッズメニューが充実し、ベビーチェアの用意もある。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      bringBabyFood: true,
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'キッズカフェブライト（bright）',
      genre: 'cafe',
      area: '藤沢駅から徒歩圏内',
      description:
        '「子どもが賑やかでも泣いてもこぼしても大丈夫」をコンセプトにした子連れ専用カフェ。キッズスペースがあり、未就学児連れのママ会で人気。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 鎌倉駅（鎌倉市）
  // ===========================================================
  'kamakura': [
    {
      name: 'GARDEN HOUSE KAMAKURA',
      genre: 'yoshoku',
      area: '鎌倉駅西口から徒歩5分',
      description:
        '緑に囲まれた英国風ガーデンと築50年のアトリエが印象的なカフェレストラン。ベビーカー入店OK、キッズチェア・キッズメニュー・おむつ替えシート完備。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      diaperChangingTable: true,
      seatingType: ['table', 'terrace'],
      stepFree: true,
      bringBabyFood: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '鎌倉 美水（みすい）',
      genre: 'noodles',
      area: '鎌倉駅東口から徒歩3分（小町通り）',
      description:
        '小町通りのうどん店。どの席もベビーカーのまま入れ、カーテンで仕切れる子連れ優先席ではオムツ替え・授乳もOK。ベビーフードの持ち込みも歓迎。',
      strollerOk: true,
      kidsChair: true,
      bringBabyFood: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '手ぬぐいカフェ 一花屋（いちげや）',
      genre: 'cafe',
      area: '長谷駅から徒歩4分（江ノ電・鎌倉駅から3駅）',
      description:
        '古民家をそのまま活かしたカフェ。畳の上にちゃぶ台が並び、ねんねの赤ちゃんも寝かせやすい。鎌倉散策の合間にゆったり過ごせる。',
      seatingType: ['zashiki'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'cafe & foods albicocca（アルビコッカ）',
      genre: 'italian',
      area: '鎌倉駅東口から徒歩15分（鶴岡八幡宮近く）',
      description:
        '隠れ家的な古民家カフェ。落ち着いた雰囲気でテラス席と個室があり、肉料理・魚料理・パスタなどランチメニューが豊富。',
      privateRoom: true,
      seatingType: ['table', 'terrace'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 茅ヶ崎駅（茅ヶ崎市）
  // ===========================================================
  'chigasaki': [
    {
      name: 'MOKICHI TRATTORIA（モキチ トラットリア）',
      genre: 'italian',
      area: '茅ヶ崎駅から車約10分（香川エリア、熊澤酒造内）',
      description:
        '築450年の古民家を移築した熊澤酒造のイタリアン。庭やテラス席があり、2階にキッズスペースもあるため赤ちゃん連れでも安心。',
      kidsSpace: true,
      diaperChangingTable: true,
      seatingType: ['table', 'terrace'],
      stepFree: false,
      shareDish: true,
      kidsChair: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: 'GARAentra（ガラエントラ）茅ヶ崎駅前店',
      genre: 'curry',
      area: '茅ヶ崎駅南口から徒歩1分（ジョイ茅ヶ崎パート1 2F）',
      description:
        '茅ヶ崎で長年愛された「GARA」の流れを汲む北インド料理店。マイルドなさくらひめチキンバターチキンが看板で、小学生以下向けキッズプレートあり。',
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'OJC（オジェイシー）',
      genre: 'cafe',
      area: '茅ヶ崎駅から徒歩圏（湘南茅ヶ崎）',
      description:
        'カウンター・テーブル・ソファー・座敷を備えるバリアフリー設計のダイニング。ベビーカーのまま入店でき、お子様用の椅子や食器が用意されている。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table', 'zashiki'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 平塚駅（平塚市）
  // ===========================================================
  'hiratsuka': [
    {
      name: '釜揚げうどん専門店 もと',
      genre: 'noodles',
      area: '平塚駅から徒歩約10分',
      description:
        'うどん百名店に選ばれた釜揚げうどん専門店。掘りごたつや半個室があり、未就学児には大盛サービス。おむつ替え台も完備で赤ちゃん連れも安心。',
      privateRoom: true,
      diaperChangingTable: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'ブリーズオブチャイナ バーチランド',
      genre: 'chinese',
      area: '平塚駅から徒歩約17分（ホテルサンライフガーデン別館）',
      description:
        'ホテル直営の中華レストラン。少人数で使えるテーブル個室があり、ベビーカーのまま入店できる。シュウマイや中華風コーンスープなど子どもが喜ぶメニューも豊富。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '土風炉（とふろ）ラスカ平塚店',
      genre: 'washoku',
      area: '平塚駅直結（ラスカ平塚）',
      description:
        '駅ビル直結の和食店。少人数から使える半個室があり、お子様ランチ（おにぎり・唐揚げ・卵焼き・アイス・ドリンク付き）が用意されている。',
      privateRoom: true,
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 湘南台駅（藤沢市）
  // ===========================================================
  'shonan-daira': [
    {
      name: 'CAFÉ DINING 4STYLE（フォースタイル）',
      genre: 'italian',
      area: '湘南台駅西口から徒歩1分',
      description:
        'おしゃれなカジュアルイタリアン。ゆったりしたテーブル席でベビーカーのまま入店でき、子ども用食器の貸し出しもある。パスタ・ピザ・リゾットが揃う。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'サルパラダイス',
      genre: 'italian',
      area: '湘南台駅直結（小田急マルシェ2）',
      description:
        '湘南食材を中心としたビストロ。ベビーカーを置くスペースを用意してくれるなど子連れ対応がスムーズで、パスタやピザのランチが手頃。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'アロームフランス料理（Arôme）',
      genre: 'french',
      area: '湘南台駅西口から徒歩2分',
      description:
        '駅近で本格フレンチが手頃に楽しめる店。1階席はベビーカー入店可能で、お子様メニュー・キッズチェア・子ども用食器が揃う。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      bringBabyFood: true,
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 小田原駅（小田原市）
  // ===========================================================
  'odawara': [
    // ▼ 2026-08-12追加: ラスカ小田原の公式フロアガイド
    //   （jryscc.co.jp/lusca/odawara/floorguide/category.php?category=4）から
    //   フロア／ジャンルを転記した。小田原駅直結。
    //   公式に予算・席数の掲載が無いため priceLunch は入れていない。
    //   丸亀製麺・ドトールはチェーン側で出るため除外。
    {
      name: '魚力食堂 ラスカ小田原店',
      genre: 'sushi',
      area: '小田原駅直結（ラスカ小田原 1F）',
      description:
        '寿司・海鮮丼の食堂。丼ものなので子どもに取り分けやすく、駅直結で新幹線や小田急の乗り換え前後に寄れる。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '海鮮茶屋 魚國 ラスカ小田原店',
      genre: 'washoku',
      area: '小田原駅直結（ラスカ小田原 2F）',
      description:
        '和食の海鮮料理店。定食形式で白飯を子どもに分けやすい。小田原の地魚を出す駅直結の店。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'ワイン食堂ヴィンセント ラスカ小田原店',
      genre: 'yoshoku',
      area: '小田原駅直結（ラスカ小田原 2F）',
      description:
        '洋食のレストラン。パスタや肉料理など子どもと分けやすい構成。駅直結なので雨の日でも移動が楽。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'カフェラミル ラスカ小田原店',
      genre: 'cafe',
      area: '小田原駅直結（ラスカ小田原 4F）',
      description:
        'ケーキと軽食のカフェ。観光の前後の休憩に使いやすく、駅直結で移動距離が短い。',
      seatingType: ['table'],
    },
    {
      name: '築地銀だこ ラスカ小田原店',
      genre: 'teppan',
      area: '小田原駅直結（ラスカ小田原 2F）',
      description:
        'たこ焼きの店。1舟を家族で分けやすく、子どもが少しだけ食べたいときにも使える。中身が熱いので冷ましてから渡したい。',
      shareDish: true,
    },
    {
      name: 'だるま料理店',
      genre: 'washoku',
      area: '小田原駅東口から徒歩5分',
      description:
        '明治26年創業の老舗和食店。1926年再建の近代和風建築で1階は約100席の大広間、2階は座敷。相模湾の天ぷらや寿司が名物で、おむつ替えシートも備える。',
      privateRoom: true,
      diaperChangingTable: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: 'SAKANA CUISINE RYO（サカナキュイジーヌ・リョウ）',
      genre: 'sushi',
      area: '小田原駅東口から徒歩3分',
      description:
        'ミシュランビブグルマン掲載の海鮮料理店。1階は開放的なシーフード居酒屋、2階「木隠れ」は4〜10名の個室があり、子連れの記念日ランチにも対応。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: 'マカロニ市場 小田原本店',
      genre: 'italian',
      area: '鴨宮駅から徒歩圏（小田原駅から1駅）',
      description:
        'ベーカリー併設のイタリアンレストラン。135席と広く、ベビーカーでの入店も余裕で、トイレにはおむつ交換台、子ども用椅子も用意。テラスルームの個室もある。',
      strollerOk: true,
      privateRoom: true,
      kidsChair: true,
      diaperChangingTable: true,
      seatingType: ['table', 'terrace'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'えれんなごっそ',
      genre: 'others',
      area: '風祭駅から徒歩1分（鈴廣かまぼこの里）',
      description:
        '鈴廣かまぼこ運営の和洋ビュッフェ。四季の食材を使った約50品が並び、敷地内のかまぼこ博物館で親子手作り体験もできる。家族での休日ランチに人気。',
      kidsChair: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 海老名駅（海老名市）
  // ===========================================================
  'ebina': [
    {
      name: '44APARTMENT（ダブルフォーアパートメント）海老名店',
      genre: 'yoshoku',
      area: '海老名駅から徒歩圏（ビナガーデンズテラス 3F）',
      description:
        'オセアニアの自然をテーマにしたオーガニックダイニング。44キッズプレート、離乳食持ち込みOK、ベビーカー入店・お子様用椅子と食器も用意。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      bringBabyFood: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '弁柄カフェ（bengara cafe）',
      genre: 'cafe',
      area: '海老名駅から徒歩約3分',
      description:
        '小上がり座敷にキッズスペースを兼ねたぬいぐるみコーナーがある子育てママに人気のカフェ。キッズプレートやオムライス・カレー・パスタの選択肢が嬉しい。',
      kidsMenu: true,
      kidsSpace: true,
      diaperChangingTable: true,
      seatingType: ['zashiki', 'table'],
      kidsChair: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'AROUND TABLE ららぽーと海老名店',
      genre: 'cafe',
      area: '海老名駅から徒歩約4分（ららぽーと海老名）',
      description:
        '子連れパパ・ママ向けの親子セットが人気のカフェレストラン。店内はベビーカーのまま入店可能で、ららぽーと内なのでおむつ替えや授乳室にもアクセスしやすい。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      stepFree: true,
      diaperChangingTable: true,
      nursingRoom: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 本厚木駅（厚木市）
  // ===========================================================
  'hon-atsugi': [
    {
      name: 'イタリアン&ワイン アドマーニ',
      genre: 'italian',
      area: '本厚木駅から徒歩約5分（アミューあつぎ B1F）',
      description:
        '前菜・サラダ・メイン・ドリンク付きのランチコースが手頃なカジュアルイタリアン。キッズメニューがあり、ベビーカー入店も可。',
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
      name: 'トラットリア ロッソ ピアット',
      genre: 'italian',
      area: '本厚木駅南口から徒歩2分',
      description:
        'パスタにサラダ・スープバー・ドリンクバー・デザートバーが付くイタリアン＆肉バル。子ども向けはアンパンマンプレートで提供。ベビーカー入店・ハイチェア完備。',
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
      name: 'シエナ（SIENA）',
      genre: 'cafe',
      area: '本厚木駅東口から徒歩1分',
      description:
        '自家製パンが人気の地元密着カフェ。お子様カレーやお子様パスタなどキッズメニューが充実し、テラス席もあるので天気の良い日の子連れランチに。',
      kidsMenu: true,
      seatingType: ['table', 'terrace'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '晴れ屋',
      genre: 'cafe',
      area: '本厚木駅から徒歩3分',
      description:
        '季節の定食やカレーが揃うオーガニックカフェ。アレルギー対応やヴィーガンメニューもあり、ベビーカーでの入店も可能。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      allergenInfo: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 相模大野駅（相模原市南区）
  // ===========================================================
  'sagami-ono': [
    // ▼ 2026-08-12追加: ボーノ相模大野の公式レストラン＆カフェページ
    //   （bono-sagamiono.jp/restaurant）から、館・フロア／ジャンル／営業時間を転記した。
    //   公式に予算・席数の掲載が無いため priceLunch は入れていない（推測で埋めない）。
    //   天丼てんや・松屋・はなまるうどん・松のや・リンガーハット・サンマルクカフェ・
    //   すき家・タリーズ・KFC はチェーン側で出るため除外。居酒屋・スナックは昼営業が
    //   無いか子連れ向きでないため除外。
    {
      name: 'チャイニーズガーデンレストラン 新福記 ボーノ相模大野店',
      genre: 'chinese',
      area: '相模大野駅から徒歩3分（ボーノ相模大野 ショッピングセンター6F）',
      description:
        '食べ放題・定食・コースをそろえる中華レストラン。取り分け前提の料理が多く、定食なら子どもの分を分けやすい。11:00〜22:00（L.O.21:00）。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'つきじ宮川本廛 ボーノ相模大野店',
      genre: 'washoku',
      area: '相模大野駅から徒歩3分（ボーノ相模大野 サウスモール1F）',
      description:
        'うなぎの専門店。うな重の白飯は子どもに分けやすい。昼の部は11:30〜15:00。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'GRILL FUKUYOSHI ボーノ相模大野店',
      genre: 'yoshoku',
      area: '相模大野駅から徒歩3分（ボーノ相模大野 サウスモール2F）',
      description:
        'ハンバーグ・ステーキの洋食店。ハンバーグは子どもと分けやすい定番。ランチ11:00〜15:00（L.O.14:30）。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'クアットロ クオーリ ボーノ相模大野店',
      genre: 'italian',
      area: '相模大野駅から徒歩3分（ボーノ相模大野 サウスモール2F）',
      description:
        'パスタ・ピッツァのファストイタリアン。11:00〜17:00まで通しでランチメニューが頼めるので、子どもの昼寝の前後に時間をずらしやすい。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '元記 ボーノ相模大野店',
      genre: 'chinese',
      area: '相模大野駅から徒歩3分（ボーノ相模大野 サウスモール2F）',
      description:
        '香港料理の店。麺・飯ものがあり取り分けやすい。ランチ11:00〜15:00（L.O.14:30）。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'ダルバール ボーノ相模大野店',
      genre: 'curry',
      area: '相模大野駅から徒歩3分（ボーノ相模大野 サウスモール2F）',
      description:
        'インド料理・各種カレーの店。辛さの調整可否は来店時に確認を。ナンは家族で分けやすい。ランチ11:00〜15:00。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '東京ぶたくらぶ ボーノ相模大野店',
      genre: 'noodles',
      area: '相模大野駅から徒歩3分（ボーノ相模大野 サウスモール1F）',
      description:
        'ぶたらーめん・ぶた肉しょうゆらーめんの店。昼は11:00〜15:00の営業。',
      seatingType: ['table', 'counter'],
    },
    {
      name: '魚さだ ボーノ相模大野店',
      genre: 'sushi',
      area: '相模大野駅から徒歩3分（ボーノ相模大野 サウスモール2F）',
      description:
        '海鮮居酒屋だが昼はランチ営業あり。ひる11:30〜14:30（L.O.14:00）。夜は酒中心になるので子連れは昼向き。',
      seatingType: ['table'],
    },
    {
      name: 'ぎんざ若松 ボーノ相模大野店',
      genre: 'sweets',
      area: '相模大野駅から徒歩3分（ボーノ相模大野 サウスモール1F）',
      description:
        'あんみつなどの甘味処。11:00〜19:00で、買い物の合間の休憩に使える。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '清勝丸 ボーノ相模大野店',
      genre: 'noodles',
      area: '相模大野駅から徒歩3分（ボーノ相模大野 サウスモール2F）',
      description:
        '濃厚つけ麺・濃厚中華そばの店。11:30〜24:00と通し営業なので時間をずらしやすい。',
      seatingType: ['table', 'counter'],
    },
    {
      name: '舎鈴 ボーノ相模大野店',
      genre: 'noodles',
      area: '相模大野駅から徒歩3分（ボーノ相模大野 ノースモール1F）',
      description:
        'つけめん・らーめんの店。10:00〜23:00（L.O.22:30）と朝から通しで開いている。',
      seatingType: ['table', 'counter'],
    },
    {
      name: '和洋厨房 おたべ菜',
      genre: 'washoku',
      area: '相模大野駅から徒歩3分（ボーノ相模大野）',
      description:
        '奥の座敷が小上がりの半個室になっており、掘りごたつではないため小さな子どもも安心。キッズチェア完備で、770円のキッズプレートも用意。',
      privateRoom: true,
      kidsChair: true,
      kidsMenu: true,
      seatingType: ['zashiki', 'table', 'counter'],
      bringBabyFood: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'Japanese Dining 黄柚子（きゆず）',
      genre: 'washoku',
      area: '相模大野駅南口から徒歩圏',
      description:
        'お子様用の椅子・食器に加え、ベビーカーを置くスペースや広めの駐輪場までママ目線で配慮された和食ダイニング。テイクアウト弁当も人気。',
      kidsChair: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'Thai Food Kalavinka（カラヴィンカ）',
      genre: 'asian',
      area: '相模大野駅から徒歩圏',
      description:
        'タイ料理人直伝の本格タイ料理がカジュアルに楽しめる居酒屋ダイニング。キッズメニューがあり、ベビーカー入店も可能。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'cafetsumuri（カフェツムリ）',
      genre: 'cafe',
      area: '相模大野駅から徒歩約10分（大野銀座商店街）',
      description:
        '商店街の中にある子連れに優しい個人カフェ。落ち着いた店内でランチがゆっくり食べられ、ママ友ランチでの利用も多い。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],
};
