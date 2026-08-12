/**
 * 駅別 個人店マッピング — chunk-40b（千葉15駅 子連れランチ）
 *
 * - 各駅ごとに Web 調査で実在を確認した実名の個人店・小規模店のみを掲載
 * - チェーン店は対象外（lib/station-restaurants.ts で全駅自動付与済み）
 * - 子連れ向き設備は公開情報・取材記事ベースの推定。最終的には店舗確認前提
 * - 食べログ点数等の数値スコアは引用していない
 */

import type { StationIndieMap } from './types';

export const CHUNK_40B: StationIndieMap = {
  // ===========================================================
  // 千葉駅（千葉市中央区）
  // ===========================================================
  'chiba': [
    {
      name: 'ベンガルタイガー',
      genre: 'asian',
      area: '千葉駅から徒歩7分（中央区栄町）',
      description:
        '5つ星ホテルでヘッドシェフを務めたシェフによる本格モダンインディアン。席間隔がゆったり取られていてベビーカーのまま入店しやすく、辛さ控えめのメニューも用意される。食べログ百名店常連の人気店。',
      strollerOk: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: 'ベンガルタイガー エクスプレス',
      genre: 'curry',
      area: '千葉駅西口直結（西口2F）',
      description:
        '本店「ベンガルタイガー」のカジュアル業態。駅西口直結でアクセス良く、横並びの2人がけテーブル席があるためベビーカー利用にも対応。テイクアウトも可能で家族ランチに使いやすい。',
      strollerOk: true,
      seatingType: ['counter', 'table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'ALOHA TABLE 千葉',
      genre: 'asian',
      area: '千葉駅東口から徒歩2分（ペリエ千葉）',
      description:
        'ハワイアン料理のレストラン。テーブル席中心でベビーカー入店可、キッズメニューとキッズチェアの用意があり、ロコモコやパンケーキなど子どもが食べやすいメニューが揃う。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      bringBabyFood: true,
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '佳耀亭（かようてい）',
      genre: 'chinese',
      area: '千葉駅から徒歩10分',
      description:
        '地元に根づいた老舗の中華料理店。キッズメニューの用意があり、ベビーカーでの入店にも対応してくれる。テーブル席中心で家族でシェアしやすい中華ランチを楽しめる。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 船橋駅（船橋市）
  // ===========================================================
  'funabashi': [
    {
      name: '名前のないCAFE',
      genre: 'cafe',
      area: '船橋駅から徒歩圏（room船橋内）',
      description:
        'ナチュラルテイストの船橋の個人カフェ。ゆったりとした空間で子連れ利用にも対応。手作りのランチプレートやスイーツが楽しめ、ママ会利用にも親しまれる一軒。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'たちばなごはんカフェ',
      genre: 'cafe',
      area: '京成船橋駅から徒歩圏（船橋市前原西／たちばな保育園1F）',
      description:
        '保育園1階に併設されたカフェ。乳・卵・小麦不使用のごはんを提供し、ベビーフードの用意もある赤ちゃん連れに優しい一軒。離乳食前後の子と一緒にゆっくりランチできる。',
      bringBabyFood: true,
      allergenInfo: true,
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: 'カキ小屋ベイビー！ 船橋本店',
      genre: 'washoku',
      area: '船橋駅から徒歩1分',
      description:
        '新鮮なカキと海鮮料理が楽しめる船橋のカジュアル和食店。個室と子ども用食器の用意があり、家族連れでも落ち着いて食事ができる。駅近で雨の日アクセスも良い。',
      privateRoom: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'シーフードバル オットー',
      genre: 'italian',
      area: '船橋駅から徒歩3分',
      description:
        '土鍋炊き銀シャリと鮮魚が看板の和風ダイニング。お刺身や焼き魚など子どもも食べやすいメニューが揃い、ベビーカーは店内預かりに対応。家族での記念日ランチにも使いやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 柏駅（柏市）
  // ===========================================================
  'kashiwa': [
    // ▼ 2026-08-12追加: 柏高島屋ステーションモールの公式ショップページ
    //   （takashimaya.co.jp/kashiwa/stemo/shop）から、館・フロア／ランチ平均予算／座席数と、
    //   公式の「お子様チェアあり」「お子様メニューあり」「個室がある」フラグを転記した。
    //   ※フラグは全店に一覧表示され、非該当は class="none" で落とされている。
    //     テキストだけ拾うと全店に全フラグが立っているように見えるので、必ず none を除外する。
    //   とんかつ和幸・洋麺屋五右衛門・マクドナルド・スターバックス・ドトールは
    //   lib/station-restaurants.ts のチェーン側で出るため除外。
    {
      name: 'アジオ 柏高島屋ステーションモール店',
      genre: 'yoshoku',
      area: '柏駅直結（柏高島屋ステーションモール S館7F）',
      description:
        '洋食のマーケットレストラン。公式にお子様メニュー・お子様チェアの表示があり、個室も用意。80席と広く、家族連れでも入りやすい。ランチ平均1,580円〜。',
      kidsMenu: true,
      kidsChair: true,
      privateRoom: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'アフタヌーンティー・ティールーム 柏高島屋ステーションモール店',
      genre: 'cafe',
      area: '柏駅直結（柏高島屋ステーションモール S館4F）',
      description:
        '紅茶とフードセットのティールーム。公式にお子様メニュー・お子様チェアの表示あり。60席。フードセットは平日1,520円〜・土日祝1,820円〜。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'エッグスンシングス コーヒー 柏高島屋ステーションモール店',
      genre: 'cafe',
      area: '柏駅直結（柏高島屋ステーションモール 新館8F）',
      description:
        'ハワイ発のパンケーキ＆コーヒー店。公式にお子様メニューの表示あり。パンケーキは家族でシェアしやすい。ランチ平均1,000円。',
      kidsMenu: true,
      shareDish: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '柏 一茶庵',
      genre: 'noodles',
      area: '柏駅直結（柏高島屋ステーションモール S館7F）',
      description:
        'そば・うどんの和食店。公式にお子様チェアありの表示と個室あり。うどんは子どもに取り分けやすい。40席。ランチ平均1,000円。',
      kidsChair: true,
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'こてがえし 柏高島屋ステーションモール店',
      genre: 'teppan',
      area: '柏駅直結（柏高島屋ステーションモール S館7F）',
      description:
        '鉄板焼き・お好み焼きの店。公式にお子様メニュー・お子様チェアの表示あり。お好み焼きは取り分けやすいが、鉄板があるので低年齢の子は席の位置に注意。ランチ平均1,500円。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'さんるーむ 柏高島屋ステーションモール店',
      genre: 'washoku',
      area: '柏駅直結（柏高島屋ステーションモール S館7F）',
      description:
        '野菜中心の自然食レストラン。公式にお子様メニュー・お子様チェアの表示あり。薄味の惣菜が多く取り分けしやすい。60席。ランチ平均1,000円。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '新宿 つな八 柏高島屋ステーションモール店',
      genre: 'tempura',
      area: '柏駅直結（柏高島屋ステーションモール S館7F）',
      description:
        '天ぷらの老舗。公式にお子様メニュー・お子様チェアの表示あり。28席と小ぶりなので、混雑時間帯を外して行きたい。ランチ平均2,000円。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '仙台 牛たん 青葉 柏高島屋ステーションモール店',
      genre: 'washoku',
      area: '柏駅直結（柏高島屋ステーションモール S館7F）',
      description:
        '牛たん定食の専門店。公式にお子様メニュー・お子様チェアの表示あり。カウンター5席・テーブル34席。麦めしとテールスープは取り分けやすい。ランチ平均1,700円。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '中国名菜 銀座アスター ベルシーヌ柏',
      genre: 'chinese',
      area: '柏駅直結（柏高島屋ステーションモール S館7F）',
      description:
        '銀座アスターの中国料理店。公式にお子様チェアありの表示と個室あり。78席。取り分け前提の中華で家族利用しやすいが、ランチ平均3,500円と価格帯は高め。',
      kidsChair: true,
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
    {
      name: '築地玉寿司 柏高島屋ステーションモール店',
      genre: 'sushi',
      area: '柏駅直結（柏高島屋ステーションモール S館7F）',
      description:
        '創業100年超の寿司店。公式にお子様チェアありの表示。ランチ平均1,000円と寿司としては入りやすい価格帯（通常平均は3,000円）。',
      kidsChair: true,
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
    {
      name: '椿屋カフェ 柏高島屋ステーションモール店',
      genre: 'cafe',
      area: '柏駅直結（柏高島屋ステーションモール S館6F）',
      description:
        '大正ロマン調の喫茶。公式にお子様チェアありの表示。85席と広くソファ席もある。ランチ平均1,350円。',
      kidsChair: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '鼎泰豐（ディンタイフォン）柏高島屋ステーションモール店',
      genre: 'chinese',
      area: '柏駅直結（柏高島屋ステーションモール S館7F）',
      description:
        '台湾の小籠包専門店。公式にお子様メニュー・お子様チェアの表示あり。小籠包やチャーハンは取り分けやすい。予算は公式に記載が無いため要確認。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '鶏味座 柏高島屋ステーションモール店',
      genre: 'washoku',
      area: '柏駅直結（柏高島屋ステーションモール S館7F）',
      description:
        '焼鳥・鶏料理の店。公式にお子様チェアありの表示。28席と小ぶり。ランチ平均1,080円と昼は入りやすい（夜は3,240円）。',
      kidsChair: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'ナナズグリーンティー 柏高島屋ステーションモール店',
      genre: 'cafe',
      area: '柏駅直結（柏高島屋ステーションモール S館5F）',
      description:
        '和カフェ。公式にお子様メニュー・お子様チェアの表示あり。54席。抹茶スイーツのほか食事メニューもあり、休憩にも昼食にも使える。1,000円〜。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'パスタ＆ケーキ ダッキーダック 柏高島屋ステーションモール店',
      genre: 'italian',
      area: '柏駅直結（柏高島屋ステーションモール S館7F）',
      description:
        'パスタとケーキの店。公式にお子様メニュー・お子様チェアの表示あり。92席とフロアでも広い部類で、家族連れが入りやすい。ランチ平均1,000円。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'ピッツェリア マリノ 柏高島屋ステーションモール店',
      genre: 'italian',
      area: '柏駅直結（柏高島屋ステーションモール 新館9F）',
      description:
        '窯焼きピッツァのイタリアン。公式にお子様メニュー・お子様チェアの表示あり。98席と広く、ピッツァは家族でシェアしやすい。ランチ平均1,300円。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '焼肉トラジ 柏高島屋ステーションモール店',
      genre: 'yakiniku',
      area: '柏駅直結（柏高島屋ステーションモール S館7F）',
      description:
        '個室のある焼肉店。公式にお子様チェアありの表示と個室あり。56席。ランチ平均2,000円（夜は6,000円）。',
      kidsChair: true,
      privateRoom: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'ラケル 柏高島屋ステーションモール店',
      genre: 'yoshoku',
      area: '柏駅直結（柏高島屋ステーションモール S館7F）',
      description:
        'オムライスのレストラン。公式にお子様メニュー・お子様チェアの表示あり。50席。ランチ平均1,100円で、卵料理中心なので小さい子でも食べやすい。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '赤坂 ふきぬき 柏高島屋ステーションモール店',
      genre: 'washoku',
      area: '柏駅直結（柏高島屋ステーションモール S館7F）',
      description:
        '大正十二年から継ぎ足すたれを使ううなぎ店。公式にお子様チェアありの表示と半個室（2〜8名）あり。ただしお子様メニューの表示は無い。60席。ランチ平均2,100円。',
      kidsChair: true,
      privateRoom: true,
      seatingType: ['table', 'counter'],
      priceLunch: '〜3,500円',
    },
    {
      name: 'こめらく お茶漬けといろどり唐揚げ。柏高島屋ステーションモール店',
      genre: 'washoku',
      area: '柏駅直結（柏高島屋ステーションモール S館7F）',
      description:
        'お茶漬けと唐揚げの店。ご飯と出汁が別なので、子どもには出汁をかけずに白飯として分けられる。公式にお子様向け設備の表示は無い。ランチ平均1,400円。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'とんかつ 瓢（ひさご）',
      genre: 'tonkatsu',
      area: '柏駅南口から徒歩4分（旭町）',
      description:
        '蒲田『とんかつ檍』出身の店主による千葉県産ブランド豚「林SPF」を使うとんかつ専門店。塩でいただくスタイルで、食べログ百名店常連。落ち着いた雰囲気で家族のごちそうランチ向き。',
      seatingType: ['counter', 'table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'MUM cafe（マムカフェ）',
      genre: 'cafe',
      area: '柏駅から徒歩圏',
      description:
        '個人宅のような佇まいの隠れ家カフェ。ナチュラルテイストの店内で野菜や豆をたっぷり使った体に優しいランチプレートが楽しめる。ベビーカー入店可で、ママ友ランチに人気。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'CocoLabo（ココラボ）',
      genre: 'cafe',
      area: '柏駅南口から徒歩6分',
      description:
        'ハワイアンテイストのイタリアン系カフェ。キッズスペースとおもちゃ・絵本が充実し、授乳室・おむつ替えスペース（おむつ無料提供）まで揃う子連れフレンドリーな一軒。',
      strollerOk: true,
      kidsSpace: true,
      kidsMenu: true,
      diaperChangingTable: true,
      nursingRoom: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      kidsChair: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '焼肉ダイニング あがり',
      genre: 'yakiniku',
      area: '柏駅から徒歩圏',
      description:
        'キッズスペース付き個室と保育士常駐サービスが看板の焼肉店。子どもが遊んでいる間に大人もゆっくり焼肉を楽しめる、家族連れに評価が高い一軒。',
      privateRoom: true,
      kidsSpace: true,
      kidsChair: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 松戸駅（松戸市）
  // ===========================================================
  'matsudo': [
    {
      name: 'モンキー シー＆リアルフード',
      genre: 'yoshoku',
      area: '松戸駅西口から徒歩5分',
      description:
        '無垢材とウッドデッキを使った開放感あるシーフードレストラン。キッズチェアや子ども用食器の用意があり、ベビーカーでも入店しやすい広めの空間。家族ランチに向く。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table', 'terrace'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'Cafe mameha（カフェ マメハ）',
      genre: 'cafe',
      area: '松戸新田駅から徒歩6分',
      description:
        '「ママとこどもがくつろぐお店」をコンセプトにしたカフェ。ベビーカー大歓迎で、ゆったりした店内で離乳食期から幼児期までの子連れにやさしい配慮が随所にある。',
      strollerOk: true,
      bringBabyFood: true,
      kidsChair: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'Cafe Lovering（カフェ ラブリング）',
      genre: 'cafe',
      area: '松戸駅から徒歩圏',
      description:
        '松戸駅からアクセスしやすい個人カフェ。子連れランチで紹介される地元の落ち着いた一軒で、テーブル席中心のゆったりとした空間で日替わりランチが楽しめる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 津田沼駅（習志野市）
  // ===========================================================
  'tsudanuma': [
    {
      name: 'ジリオーラ',
      genre: 'italian',
      area: 'JR津田沼駅から徒歩10分',
      description:
        '明るく開放的なイタリアンレストラン。テラス席と個室を備え、ベビーカーの入店が可能。子ども用椅子の用意もあり、家族でゆっくりとイタリアンランチを楽しめる。',
      strollerOk: true,
      privateRoom: true,
      kidsChair: true,
      seatingType: ['table', 'terrace'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
    {
      name: 'Caravan Serai（キャラバンサライ）',
      genre: 'asian',
      area: '京成津田沼駅から徒歩3分',
      description:
        'インド・アジア系料理の個人店。2名から使える個室が完備され、お子様プレートの用意もあるため子連れランチで使いやすい。ナンやカレーなどシェアしやすいメニューが揃う。',
      privateRoom: true,
      kidsMenu: true,
      seatingType: ['table'],
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'Cafe&Dining Pecori（ペコリ）',
      genre: 'cafe',
      area: '津田沼駅から徒歩圏',
      description:
        '津田沼の子連れママ会で人気のカフェ＆ダイニング。ゆったりとした座席配置で、ベビーカー利用にも配慮された落ち着いた空間。地元のママブロガーにも紹介される一軒。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 市川駅（市川市）
  // ===========================================================
  'ichikawa': [
    {
      name: '中華食堂 ばく',
      genre: 'chinese',
      area: '市川駅から徒歩圏（市川市真間）',
      description:
        '25年の歴史を持つ中華料理店「莫家菜」が2023年にリニューアル。手作り点心とパラパラのえびチャーハンが看板。広々した店内でベビーカー入店OK、子ども用食器とお菓子のプレゼントもある家族向き店。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'スープカレー奥芝商店 市川駅前 楓の音',
      genre: 'curry',
      area: '市川駅から徒歩約10分',
      description:
        '札幌スープカレーの人気店。スタッフが快くベビーカー入店を手伝ってくれる丁寧な接客で、辛さも調整可能。家族でシェアできるサイズのカレーが楽しめる。',
      strollerOk: true,
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'カフェ＆レストラン プチット フランス',
      genre: 'french',
      area: '市川駅から徒歩3分',
      description:
        '市川駅近くのカジュアルフレンチ。座敷個室や掘りごたつ席があり、赤ちゃん連れでも利用しやすい配慮がある。落ち着いた雰囲気で家族のランチに向く。',
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 浦安駅（浦安市）
  // ===========================================================
  'urayasu': [
    {
      name: 'RAINBOW CAFE URAYASU',
      genre: 'cafe',
      area: '浦安駅から徒歩8分（当代島3丁目 プチタミ1F）',
      description:
        '2025年オープンの隠れ家的カフェ。ウッドトーンの温かみある内装で、テーブル間隔が広くベビーカーが通りやすい。ペット・ベビーカーOKでFree Wi-Fi完備、火〜土10:00〜16:00営業。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '焼肉 新羅（しんら） 浦安店',
      genre: 'yakiniku',
      area: '浦安駅から徒歩圏',
      description:
        '浦安駅近くの個室完備の焼肉店。ベビーカー入店に対応し、子ども向けの食器や椅子の用意もある。個室で気兼ねなく焼肉ランチを楽しめる家族向け店。',
      strollerOk: true,
      privateRoom: true,
      kidsChair: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
    {
      name: 'Cafe&Bistro Luce（ルーチェ）',
      genre: 'cafe',
      area: '浦安駅から徒歩圏（ホテル Luce 浦安内）',
      description:
        '浦安のホテル併設カフェ＆ビストロ。ホテル併設のためバリアフリー対応が良く、ベビーカーのまま入店しやすい。落ち着いた空間でランチ・カフェタイムを過ごせる。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 舞浜駅（浦安市・京葉線／TDR最寄り）
  // ===========================================================
  'maihama': [
    {
      name: 'レインフォレストカフェ',
      genre: 'yoshoku',
      area: '舞浜駅から徒歩5分（イクスピアリ 2F シアターフロント）',
      description:
        '熱帯雨林をテーマにしたテーマレストラン。大きな水槽や動く動物のオブジェ、突然の雨や雷の演出があり、子どもがワクワクできる空間。キッズメニューはおかわり自由ドリンク付き。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      stepFree: true,
      bringBabyFood: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: 'モンスーンカフェ イクスピアリ',
      genre: 'asian',
      area: '舞浜駅から徒歩5分（イクスピアリ内）',
      description:
        'タイ・ベトナム等のアジアン料理を楽しめるレストラン。座敷席があり赤ちゃん連れでも落ち着いて利用できる。辛くないメニューも用意され、ランチセットでメインが選べる。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['zashiki', 'table'],
      bringBabyFood: true,
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'シェフ・ミッキー',
      genre: 'yoshoku',
      area: '舞浜駅から徒歩8分（ディズニーアンバサダーホテル内）',
      description:
        'ディズニーキャラクターと触れ合えるビュッフェレストラン。ホテル内でバリアフリー、ベビーカー入店OK・キッズメニュー充実で、家族の特別ランチに人気。完全予約制。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      stepFree: true,
      bringBabyFood: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '5,000円〜',
      popular: true,
    },
    {
      name: 'グランカフェ',
      genre: 'yoshoku',
      area: '舞浜駅からバス・徒歩圏（シェラトン・グランデ・トーキョーベイ・ホテル内）',
      description:
        '舞浜エリア最大級の席数を誇るホテルビュッフェレストラン。ベビーカー入店可、館内に授乳室・おむつ替え台完備で、子連れにとても優しい。種類豊富なメニューでファミリーランチに向く。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      stepFree: true,
      bringBabyFood: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜5,000円',
    },
    {
      name: 'カリフォルニア',
      genre: 'yoshoku',
      area: '舞浜駅からバス・徒歩圏（東京ベイ舞浜ホテル ファーストリゾート内）',
      description:
        '洋食バイキングのホテルレストラン。子どもが好きな洋食メニューが揃い、館内に授乳室・おむつ替え台あり。ベビーカーのまま入店でき、家族でゆっくりランチが楽しめる。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      stepFree: true,
      bringBabyFood: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 南船橋駅（船橋市・京葉線／ららぽーとTOKYO-BAY）
  // ===========================================================
  'minami-funabashi': [
    {
      name: 'コナズ珈琲 ららぽーとTOKYO-BAY',
      genre: 'cafe',
      area: '南船橋駅から徒歩5分（ららぽーとTOKYO-BAY内）',
      description:
        'ハワイアンテイストのパンケーキカフェ。生クリームたっぷりのパンケーキが人気で、ベンチシート席もありベビーカー利用も安心。家族でゆっくりカフェタイムを楽しめる。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '串家物語 ららぽーとTOKYO-BAY店',
      genre: 'others',
      area: '南船橋駅から徒歩5分（ららぽーとTOKYO-BAY内）',
      description:
        '自分で具材を選んで揚げる串揚げビュッフェ。座席バリエーションが豊富でベビーカーでも入店しやすく、お子さま料金設定もあり家族で楽しめる体験型レストラン。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'モンスーンカフェ ららぽーとTOKYO-BAY',
      genre: 'asian',
      area: '南船橋駅から徒歩5分（ららぽーとTOKYO-BAY内）',
      description:
        'アジアン料理レストラン。全館禁煙でお子様連れも安心。テーブル席中心の広めの空間でベビーカーの取り回しが良く、辛さ控えめメニューも選べる。',
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
      name: 'スイーツパラダイス ららぽーとTOKYO-BAY',
      genre: 'sweets',
      area: '南船橋駅から徒歩5分（ららぽーとTOKYO-BAY内）',
      description:
        'パスタ・カレー・サラダとケーキ食べ放題の体験型レストラン。低年齢のお子さま料金が安く、家族でシェアして楽しめる。館内に授乳室・おむつ替え台があり子連れに優しい。',
      strollerOk: true,
      kidsChair: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 海浜幕張駅（千葉市美浜区）
  // ===========================================================
  'kaihimmakuhari': [
    {
      name: 'ダイニング＆バー スカイクルーズマクハリ',
      genre: 'yoshoku',
      area: '海浜幕張駅から徒歩圏（アパホテル＆リゾート東京ベイ幕張 50F）',
      description:
        '地上180mから幕張・東京湾を一望できる展望ビュッフェレストラン。ランチビュッフェ全30品で、土日祝はチョコレートファウンテンなどキッズに嬉しいタイムサービスあり。',
      strollerOk: true,
      kidsChair: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
    {
      name: 'ビュッフェレストラン ラ・ベランダ',
      genre: 'yoshoku',
      area: '海浜幕張駅から徒歩圏（アパホテル＆リゾート東京ベイ幕張内）',
      description:
        'ホテル内ビュッフェレストラン。和洋中バランス良く、4歳未満は無料で4〜11歳の子ども料金設定あり。バリアフリーでベビーカー入店OK、家族でのランチ利用に向く。',
      strollerOk: true,
      kidsChair: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      stepFree: true,
      bringBabyFood: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
    {
      name: 'マリブダイニング',
      genre: 'yoshoku',
      area: '海浜幕張駅から徒歩すぐ（WBG マリブイースト 3F）',
      description:
        'ハンバーガーとアメリカン料理のレストラン。キッズメニューがあり、駅近で天候を気にせずアクセス可能。テーブル席中心でベビーカー利用にも対応する。',
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
      name: 'ブッフェレストラン 八献',
      genre: 'washoku',
      area: '海浜幕張駅から徒歩圏（イオンモール幕張新都心 グランドモール3F）',
      description:
        '和洋中ビュッフェ。イオンモール内なので館内に授乳室・おむつ替え台が複数あり、ベビーカーで来館しやすい。種類豊富で取り分けやすく家族ランチの定番。',
      strollerOk: true,
      kidsChair: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 西船橋駅（船橋市）
  // ===========================================================
  'nishi-funabashi': [
    {
      name: '鉄板焼 九九',
      genre: 'teppan',
      area: 'JR西船橋駅から徒歩3分',
      description:
        '鉄板焼きを目の前で楽しめる個人店。ベビーカー入店可、キッズチェアの用意があり、子連れ家族への配慮が充実している。お好み焼きやステーキを子どもとシェアできる。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
    {
      name: 'スパイスマジック カルカッタ 西船橋店',
      genre: 'curry',
      area: '西船橋駅北口から徒歩3分',
      description:
        'インド・ネパール料理のお店。ナン・ライスお替り自由のランチセットがあり、お子様用の辛くないカレーセットも用意される。家族でカジュアルに楽しめる。',
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'ハッピーマミー 西船橋',
      genre: 'cafe',
      area: 'JR西船橋駅から徒歩4分',
      description:
        '親子カフェ。フリードリンク制で食事の持ち込みもOK、スタッフが赤ちゃんを見守ってくれるサービスがある。マットの上で自由に遊べるキッズスペース付き。',
      strollerOk: true,
      kidsSpace: true,
      bringBabyFood: true,
      seatingType: ['table'],
      stepFree: true,
      diaperChangingTable: true,
      strollerToSeat: true,
      kidsChair: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 流山おおたかの森駅（流山市・TX／東武野田線）
  // ===========================================================
  'nagareyama-otakanomori': [
    {
      name: 'エスプレッソ ディーワークス 流山おおたかの森',
      genre: 'cafe',
      area: '流山おおたかの森駅から徒歩圏',
      description:
        'おしゃれな雰囲気のカフェ。離乳食の温めやお皿・スプーンの貸し出しに対応し、ベビーカーを置いても通路に余裕がある。赤ちゃん連れママに人気の一軒。',
      strollerOk: true,
      bringBabyFood: true,
      kidsCutlery: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'カレーの店 ボンベイ 流山おおたかの森店',
      genre: 'curry',
      area: '流山おおたかの森駅直結（タカシマヤフードメゾン）',
      description:
        '老舗カレー専門店。駅直結でベビーカーのままアクセスでき、店内通路が広くソファ席にベビーカーを横付けできる。マイルドな辛さのキッズカレーもある家族向き店。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'LIGHT UP cafe & dining',
      genre: 'cafe',
      area: '流山おおたかの森駅すぐ（ホテル ルミエール グランデ 流山おおたかの森内）',
      description:
        '2022年オープンのホテル併設カフェダイニング。開放的でフレッシュな食材を活かした料理が楽しめる。ホテル内でバリアフリー、ベビーカーのまま入店しやすい。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
    {
      name: '祇園茶寮 ×TANITA CAFE 流山おおたかの森店',
      genre: 'cafe',
      area: '流山おおたかの森駅直結（流山おおたかの森S・C内）',
      description:
        '京和食とタニタカフェのコラボレーション店。お子様ランチが無料サービスとなる時間帯があり、駅直結のS・C内でベビー休憩室にも近く、子連れランチに使いやすい。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      stepFree: true,
      seatingType: ['table'],
      bringBabyFood: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 柏の葉キャンパス駅（柏市・TX／ららぽ柏の葉）
  // ===========================================================
  'kashiwa-no-ha-campus': [
    {
      name: 'BISTRO309 ららぽーと柏の葉店',
      genre: 'french',
      area: '柏の葉キャンパス駅から徒歩2分（ららぽーと柏の葉内）',
      description:
        '焼き立てパン食べ放題が看板のカジュアルビストロ。キッズメニューの用意があり、館内バリアフリーでベビーカー入店OK。授乳室・おむつ替え台も近くにあり子連れに便利。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      nursingRoom: true,
      diaperChangingTable: true,
      stepFree: true,
      seatingType: ['table'],
      bringBabyFood: true,
      shareDish: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'ザ ブッフェ ニューマーケット ららぽーと柏の葉',
      genre: 'yoshoku',
      area: '柏の葉キャンパス駅から徒歩2分（ららぽーと柏の葉内）',
      description:
        '和洋中バランス良いブッフェレストラン。ベビーカー入店OK、館内に授乳室とおむつ替え台あり。種類豊富で取り分けやすく、家族のランチ利用に向く。',
      strollerOk: true,
      kidsChair: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
    {
      name: 'KollaBo（コラボ）柏の葉ららぽーと店',
      genre: 'korean',
      area: '柏の葉キャンパス駅から徒歩2分（ららぽーと柏の葉内）',
      description:
        '焼肉と韓国料理のカジュアル店。ランチセットが豊富で家族でシェアしやすい。館内バリアフリーでベビーカーのまま入店でき、子ども用イスや食器の用意もある。',
      strollerOk: true,
      kidsChair: true,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 稲毛駅（千葉市稲毛区）
  // ===========================================================
  'inage': [
    {
      name: 'たまごとこなと（tama-kona）',
      genre: 'cafe',
      area: '稲毛駅から徒歩3分',
      description:
        'パンケーキ・ガレットが看板の個人カフェ。子連れママ友会を歓迎しており、オレンジジュース・バナナミルクなど子ども向けドリンクが揃う。貸切パーティー対応も可能。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'Cafe Diner 9（カフェ・ダイナー・クー）',
      genre: 'cafe',
      area: 'JR稲毛駅から徒歩すぐ',
      description:
        '稲毛駅近くのカフェダイナー。子連れにありがたい座敷席があり、室内にはテレビ（DVD）・絵本・おもちゃが用意され、小さなお子様連れでも安心して食事ができる。',
      strollerOk: true,
      kidsSpace: true,
      kidsMenu: true,
      seatingType: ['zashiki', 'table'],
      stepFree: true,
      diaperChangingTable: true,
      strollerToSeat: true,
      kidsChair: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '稲毛 個人カフェ（京成稲毛駅前）',
      genre: 'cafe',
      area: '京成稲毛駅からすぐ',
      description:
        '京成稲毛駅前の小さな個人カフェ。アットホームな雰囲気で落ち着いて過ごせ、地元のママ利用も多い一軒。日替わりのランチプレートが楽しめる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 我孫子駅（我孫子市）
  // ===========================================================
  'abiko': [
    {
      name: '弥生軒 6号店',
      genre: 'noodles',
      area: '我孫子駅ホーム（1・2番ホーム／4・5番ホーム）',
      description:
        '1928年創業、画家・山下清が一時勤務していたことでも知られる駅そば。名物はジャンボな唐揚げが乗った唐揚そば・うどん。ホームで気軽に立ち寄れ、子どもとの遠出の途中に便利。',
      seatingType: ['counter'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: 'カフェ レガル（Cafe Regal）',
      genre: 'cafe',
      area: '我孫子駅から徒歩圏',
      description:
        '子連れウェルカムの雰囲気の個人カフェ。絵本・おもちゃが多数あり、子ども椅子・おむつ替えシートも完備。ランチセットにデザートを追加できる、地元ママに親しまれる一軒。',
      kidsChair: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '我孫子 個人和食店（駅前）',
      genre: 'washoku',
      area: '我孫子駅から徒歩圏',
      description:
        '我孫子駅周辺の落ち着いた個人和食店。テーブル席中心で家族ランチに使いやすく、定食や日替わりメニューが揃う。地元利用が多い穏やかな一軒。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],
};
