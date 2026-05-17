/**
 * 駅別 個人店マッピング — chunk-26（東京・子連れランチ拡充：世田谷・渋谷・中野・杉並 第7弾）
 *
 * - 各駅ごとに Web 調査で実名が明記された実在の個人店のみを掲載（チェーン店は除外）
 * - 子連れ向き設備（ベビーカー・座敷・おむつ替え等）は公開情報・取材記事で言及のあったもののみ true。
 *   最終的には店舗確認前提。
 * - 食べログ点数等の数値スコアは引用していない
 * - chunk-1〜25 と同じ駅 slug は index.ts の mergeIndieMaps で結合される
 */

import type { StationIndieMap } from './types';

export const CHUNK_26: StationIndieMap = {
  // ===========================================================
  // 田園調布（大田区）
  // ===========================================================
  'denenchofu': [
    {
      name: 'PASTA RI（パスタ リ）',
      genre: 'italian',
      area: '田園調布駅から徒歩3分',
      description:
        '白い建物が街並みになじむ、田園調布で長く続くイタリアン。ランチは3種のパスタコースから選べ、キッズメニューはボロネーゼやカルボナーラを用意。落ち着いた雰囲気で家族の食事に。',
      kidsMenu: true,
      seatingType: ['table'],
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'VIAN（ビアン）',
      genre: 'cafe',
      area: '田園調布駅から徒歩4分',
      description:
        'イートインのあるデリカテッセン。玄米ごはんと野菜たっぷりのプレートが中心で体にやさしい。全7席と小さめだが、ベビーカーで入れる席もあり子連れに配慮した造り。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: "Deco's Dog Cafe 田園茶房",
      genre: 'cafe',
      area: '田園調布駅から徒歩5分',
      description:
        'テレビでも紹介された一軒家のドッグカフェ。席と席の間隔が広めにとられているため、犬連れだけでなく子ども連れでも窮屈感なくゆったり過ごせる。',
      seatingType: ['table', 'terrace'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 多摩川（大田区）
  // ===========================================================
  'tamagawa': [
    {
      name: 'レストラン ふはく（fu-haku TOKYO）',
      genre: 'yoshoku',
      area: '多摩川駅から徒歩1分（田園調布せせらぎ公園内）',
      description:
        'せせらぎ公園の緑に囲まれたレストラン。無農薬野菜中心のランチプレートで、子ども用椅子と座敷の両方を完備。フロアは子どもが歩き回れる造りで、キッズメニューや離乳食持ち込みもOK。',
      strollerOk: true,
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['zashiki', 'table'],
      bringBabyFood: true,
      stepFree: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '田園調布倶楽部',
      genre: 'italian',
      area: '多摩川駅から徒歩3分',
      description:
        '閑静な住宅街に佇む一軒家レストラン。1階は木漏れ日の差すカフェで、オリジナルケーキやカフェ仕立てのイタリアンを提供。テラス席もあり、子連れでものびのび過ごせる開放的な空間。',
      seatingType: ['table', 'terrace'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 下北沢（世田谷区）
  // ===========================================================
  'shimokitazawa': [
    {
      name: '畳cafe＆BAR くまさん家',
      genre: 'cafe',
      area: '下北沢駅南口から徒歩5分',
      description:
        '全面畳張りの時間制親子カフェ。無添加・無着色の料理を出し、小さなジャングルジムやおもちゃ、授乳室、おむつ替え台、赤ちゃん用椅子まで揃う。子どもと気兼ねなく過ごせる造り。',
      kidsChair: true,
      kidsSpace: true,
      seatingType: ['zashiki'],
      diaperChangingTable: true,
      nursingRoom: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'KITADE TACOS 下北沢',
      genre: 'yoshoku',
      area: '下北沢駅から徒歩4分',
      description:
        'ポップでおしゃれなダイナー風のタコス店。ソファ席が多くベビーカーのまま入店でき、無添加・グルテンフリーやヴィーガン対応のメニューもあって子連れでも選びやすい。',
      strollerOk: true,
      seatingType: ['box', 'table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'カフェ grass（tefu lounge内）',
      genre: 'cafe',
      area: '下北沢駅から徒歩3分（tefu lounge 2階）',
      description:
        '複合施設テフラウンジ2階の広々したカフェ。席にゆとりがありベビーカーで入りやすく、1階にはおむつ替えのできるトイレも。映画館併設で子連れの休憩に使いやすい。',
      strollerOk: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 経堂（世田谷区）
  // ===========================================================
  'kyodo': [
    {
      name: 'カフェ&ダイニング素々（もともと）',
      genre: 'cafe',
      area: '経堂駅北口から徒歩3分',
      description:
        '西福寺通り沿いのビル地下にあるカフェダイニング。エレベーターがあるためベビーカーでも来店しやすい。3日ごとに替わる日替わりランチは、メインを肉か魚から選べて副菜も充実。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: false,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'マホラ食堂',
      genre: 'cafe',
      area: '経堂駅から徒歩5分',
      description:
        '古民家カフェのような落ち着いた店内で、旬の野菜を使ったスキレットランチが人気の食堂。ゆったりした空間で子連れでものんびり過ごせる、地元で愛される一軒。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 成城学園前（世田谷区）
  // ===========================================================
  'seijogakuen-mae': [
    {
      name: 'TRATTORIA 成城',
      genre: 'italian',
      area: '成城学園前駅から徒歩1分',
      description:
        '駅前の戸建てイタリアン。子連れ親子専用スペースや個室があり、ベビーカー持ち込みOK。アレルギー対応やおもちゃの用意もあり、ママ会や家族の食事に使いやすい。',
      strollerOk: true,
      privateRoom: true,
      kidsSpace: true,
      seatingType: ['table'],
      allergenInfo: true,
      stepFree: true,
      diaperChangingTable: true,
      bringBabyFood: true,
      shareDish: true,
      strollerToSeat: true,
      kidsChair: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'Set Lip 成城店',
      genre: 'italian',
      area: '成城学園前駅から徒歩2分',
      description:
        '温かみのあるレトロな内装のスパニッシュ＆イタリアンバル。パスタ・リゾット・パエリアから選べるランチセットがあり、アットホームな雰囲気で子連れでも入りやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'ことぶきや',
      genre: 'washoku',
      area: '成城学園前駅から徒歩3分',
      description:
        '刺身や焼き魚など新鮮な魚料理が味わえる和食店。うどんや焼きおにぎりなど子どもが食べやすいメニューもあり、個室・お座敷を備え、ベビーカー入店もOK。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'H.Q CAFE（エイチキューカフェ）',
      genre: 'cafe',
      area: '成城学園前駅直結',
      description:
        '「セカンドリビング」がコンセプトの駅直結カフェ。ランチセットやキッズプレートがあり、ベビーカーでそのまま入店できる。買い物のついでに立ち寄りやすい立地。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'F*GICCO（フジッコ）',
      genre: 'sweets',
      area: '成城学園前駅から徒歩6分',
      description:
        'パイとケーキが自慢の洋菓子カフェ。ランチタイムは子ども連れの来店もOKで、ベビーカーのまま入店できる。食後に名物のパイやケーキを家族で楽しめる。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 駒沢大学（世田谷区）
  // ===========================================================
  'komazawa-daigaku': [
    {
      name: 'Osteria C3（オステリア チートレ）',
      genre: 'italian',
      area: '駒沢大学駅から徒歩5分',
      description:
        '気軽に通えるイタリアン。ベビーカー入店OKで、キッズプレートやお子さま用の補助椅子も用意。子連れでも入りやすく、家族での週末ランチに向く一軒。',
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
      name: 'ニト（nito）',
      genre: 'cafe',
      area: '駒沢大学駅から徒歩7分',
      description:
        '住宅街にある隠れ家的な紅茶専門カフェ。靴を脱いで上がる小上がり席があり、子どもとのんびりくつろげる。落ち着いた空間でゆっくりお茶を楽しみたい時に。',
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 用賀（世田谷区）
  // ===========================================================
  'yoga': [
    {
      name: 'ブルズガーデン',
      genre: 'cafe',
      area: '用賀駅から徒歩3分',
      description:
        '駅近のカフェダイニング。ベビーカー入店OKで、テラス席やソファ席があり子連れでもゆったり過ごせる。食事からスイーツまで揃い、ランチにもカフェ利用にも使いやすい。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'セタビカフェ',
      genre: 'cafe',
      area: '用賀駅から徒歩17分（世田谷美術館 地下1階・砧公園内）',
      description:
        '砧公園内の世田谷美術館にあるカフェ。50席以上の広い店内はベビーカー入店OKで、緑を望むテラス席も。公園あそびの前後の休憩や、子連れランチに向く。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 千歳烏山（世田谷区）
  // ===========================================================
  'chitose-karasuyama': [
    {
      name: 'cafe sun deco（カフェ サンデコ）',
      genre: 'cafe',
      area: '千歳烏山駅から徒歩2分',
      description:
        '旧甲州街道沿いのカフェ。店員もママさんで子連れがリラックスしやすい雰囲気。トイレにおむつ替えシート、フロアに子ども用おもちゃや絵本があり、赤ちゃん連れに配慮されている。',
      diaperChangingTable: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'コミュニティカフェ ななつのこ',
      genre: 'cafe',
      area: '千歳烏山駅から徒歩4分',
      description:
        'バリアフリーで車いす・ベビーカーでも余裕の広さのコミュニティカフェ。ソファ席があり妊婦や赤ちゃん連れもゆったり。ランチメニューのほかパウチの離乳食も購入できる。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      bringBabyFood: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 明大前（世田谷区）
  // ===========================================================
  'meidaimae': [
    {
      name: 'IL CIELO（イル チェロ）',
      genre: 'italian',
      area: '明大前駅から徒歩3分',
      description:
        'こだわりのランチが評判のイタリアン。乳児からの来店OKで、離乳食の持ち込みやベビーカーのまま入店ができる。子連れデビューにも使いやすい一軒。',
      strollerOk: true,
      bringBabyFood: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '8PLACE The Kitchen＆Bar 明大前',
      genre: 'yoshoku',
      area: '明大前駅から徒歩1分',
      description:
        '駅すぐのキッチン＆バー。個室があり、お子様用食器の用意やベビーカー入店OKと子連れ向けの配慮あり。赤ちゃん連れでも周りを気にせず食事を楽しめる。',
      strollerOk: true,
      privateRoom: true,
      kidsCutlery: true,
      seatingType: ['table'],
      stepFree: true,
      bringBabyFood: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '米・肴・旬菜 八HACHI',
      genre: 'washoku',
      area: '明大前駅から徒歩3分',
      description:
        '厳選食材にこだわる和食店。座敷や個室があり、離乳食の持ち込みやベビーカー入店もOK。落ち着いた空間で、子連れのママ会や家族の食事に向く。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      bringBabyFood: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 原宿（渋谷区）
  // ===========================================================
  'harajuku': [
    {
      name: 'ECO FARM CAFE 632',
      genre: 'cafe',
      area: '原宿駅から徒歩5分',
      description:
        '天井が高く席数の多いガラス張りのカフェ。バリアフリー対応でベビーカー入店も楽々。ランチは選べるメインとスープ・ドリンクのセットがリーズナブルで子連れにうれしい。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'うどん 伊呂波（いろは）',
      genre: 'noodles',
      area: '原宿駅から徒歩6分',
      description:
        '竹下通り沿いにある創作うどんの店。おしゃれなカフェのような雰囲気で、うどんは子どもにも食べやすい。ベビーカーのまま入店でき、買い物の合間のランチに使いやすい。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 代々木（渋谷区）
  // ===========================================================
  'yoyogi': [
    {
      name: '代々木parabola（パラボラ）',
      genre: 'italian',
      area: '代々木駅から徒歩5分',
      description:
        'おしゃれなカジュアルイタリアン。ランチは1,000円前後とリーズナブルで気軽に立ち寄れる。肩肘張らない雰囲気で、子連れでもさっとランチを済ませたい時に向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 代々木公園（渋谷区）
  // ===========================================================
  'yoyogi-koen': [
    {
      name: 'LIFE son（ライフ サン）',
      genre: 'bakery',
      area: '代々木公園駅から徒歩6分',
      description:
        'パン屋を併設した人気のカフェ。広いテラス席があり子連れママでもゆったり。平日ランチは焼きたてパンが食べ放題で、子ども用の椅子や食器も用意されている。',
      kidsChair: true,
      kidsCutlery: true,
      seatingType: ['table', 'terrace'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'シェルター クコ',
      genre: 'cafe',
      area: '代々木公園駅から徒歩7分',
      description:
        '元看護師と助産師が営むオーガニックカフェ。旬の野菜をたっぷり使ったワンプレートランチが人気で、ジュースも自家製。心も体も温まる料理で子連れにやさしい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'ボンダイカフェ ヨヨギビーチパーク',
      genre: 'cafe',
      area: '代々木公園駅から徒歩7分',
      description:
        'ソファ席が多くゆったりした雰囲気のカフェ。屋外席もあり、子連れでも気負わずランチを楽しめる。代々木公園あそびの前後の休憩スポットとしても使いやすい。',
      seatingType: ['table', 'terrace'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 代々木上原（渋谷区）
  // ===========================================================
  'yoyogi-uehara': [
    {
      name: 'ライフサン（LIFE son）',
      genre: 'italian',
      area: '代々木上原駅から徒歩6分',
      description:
        '10年以上続くイタリアンビストロ。ベビーカーで入れる席があり、おすわり前の赤ちゃんから使えるキッズチェアも用意。広いテラス席もあり子連れでものびのび過ごせる。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table', 'terrace'],
      stepFree: true,
      bringBabyFood: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '押競満寿（おしくらまんじゅ）',
      genre: 'asian',
      area: '代々木上原駅から徒歩5分',
      description:
        '閑静な住宅街にある台湾料理店。子連れやベビーカーにとてもやさしく、ソファ席があってくつろぎやすい。本格的な台湾の家庭の味を家族で楽しめる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'PUBLIC HOUSE 代々木上原',
      genre: 'cafe',
      area: '代々木上原駅から徒歩4分（GOOD EAT VILLAGE 1階）',
      description:
        '複合施設グッドイートヴィレッジ1階のカフェ。ベビーカー入店OKでソファ席もあり、オートミールのパンケーキや国産食材の手作りハンバーガーなど体にやさしいメニューが揃う。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'ファイヤーキングカフェ',
      genre: 'asian',
      area: '代々木上原駅西口から徒歩1分',
      description:
        '駅すぐの多国籍カフェ。インドネシア料理を中心に幅広いメニューが揃い、スタッフの対応もやさしい。駅近で立ち寄りやすく、子連れのランチにも使いやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 笹塚（渋谷区）
  // ===========================================================
  'sasazuka': [
    {
      name: 'Menotti\'s Coffee Stop Tokyo',
      genre: 'cafe',
      area: '笹塚駅から徒歩5分',
      description:
        '裏道にある小さなコーヒーショップ。入口にスロープがあり、テーブル席にベビーカーを横付けできる。静かな店内なので、子どもが寝ている間にゆっくりコーヒーを楽しめる。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
    {
      name: 'ガレットデコ',
      genre: 'french',
      area: '笹塚駅から徒歩5分（笹塚十号坂商店街）',
      description:
        '十号坂商店街のガレット専門店。木・金はサラダとポタージュ付きのランチセット、土・日は前菜も付くブランチセットを用意。子どもでも食べやすいメニューがある。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 代官山（渋谷区）
  // ===========================================================
  'daikanyama': [
    {
      name: 'IVY PLACE（アイヴィー プレイス）',
      genre: 'cafe',
      area: '代官山駅から徒歩6分（代官山 蔦屋書店隣）',
      description:
        '蔦屋書店に隣接する緑豊かなレストラン。カフェエリアと個室は未就学児の同伴OKで、広めのソファ席やハイチェア、おむつ替えベッドも完備。子連れでもゆったり過ごせる。',
      privateRoom: true,
      kidsChair: true,
      seatingType: ['table', 'terrace'],
      diaperChangingTable: true,
      priceLunch: '〜3,500円',
    },
    {
      name: 'rinato house kitchen（リナト ハウス キッチン）',
      genre: 'italian',
      area: '代官山駅から徒歩5分',
      description:
        '明るくほっと和む雰囲気のイタリアン。おむつ替えの部屋を完備し、ベビーカーは2階まで運んでくれるなど、きめ細やかな配慮がうれしい。子連れランチに使いやすい。',
      seatingType: ['table'],
      diaperChangingTable: true,
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 東中野（中野区）
  // ===========================================================
  'higashi-nakano': [
    {
      name: 'Cafe West53rd（カフェ ウエストフィフティサード）',
      genre: 'cafe',
      area: '東中野駅から徒歩1分',
      description:
        '駅近のガラス張りが美しいカフェ。ウエディング会館併設で多機能トイレがあり、おむつ替えに困らない。ケーキのクオリティに定評があり、子連れの休憩やランチに向く。',
      seatingType: ['table'],
      diaperChangingTable: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'カフェ イワブチ',
      genre: 'cafe',
      area: '東中野駅から徒歩5分',
      description:
        'ケーキもごはんメニューも評判の、完全禁煙の個人カフェ。落ち着いた雰囲気で、子連れでもゆっくり過ごせる地元の隠れ家的な一軒。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '大盛軒',
      genre: 'noodles',
      area: '東中野駅から徒歩4分',
      description:
        '東中野の人気ラーメン店。離乳食の持ち込みOKで、ベビーカーのまま入店もできるので、麺好きの子連れ家族でも気軽に立ち寄れる。',
      strollerOk: true,
      bringBabyFood: true,
      seatingType: ['counter', 'table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 中野坂上（中野区）
  // ===========================================================
  'nakano-sakaue': [
    {
      name: 'マイソールカフェ',
      genre: 'asian',
      area: '中野坂上駅から徒歩4分',
      description:
        '南インドの本格的な家庭料理が味わえるカフェ。子連れの家族にやさしい雰囲気でベビーカーもOK。平日は数量限定のランチプレートが楽しめる。',
      strollerOk: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'モモ ガルテン',
      genre: 'cafe',
      area: '中野坂上駅から徒歩6分（桃園川緑道沿い）',
      description:
        '桃園川緑道沿いにある古民家カフェ。のんびりとした心地よい空間で、親子でゆったり過ごせる。緑道の散歩とあわせて立ち寄りやすい立地。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'リンゴォズ サルーン',
      genre: 'cafe',
      area: '中野坂上駅から徒歩5分',
      description:
        '西部開拓時代の酒場をテーマにしたカフェバー。ベビーカー入店OKで、日替わりで3種類ほどのランチメニューを用意。個性的な内装で気分を変えてランチを楽しめる。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'エスエムビーカフェ',
      genre: 'cafe',
      area: '中野坂上駅から徒歩5分',
      description:
        '昭和34年創業のコーヒー豆卸問屋が手がけるカフェ。本格的なコーヒーが味わえ、ベビーカー入店もOK。落ち着いた雰囲気で子連れの休憩に向く。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 阿佐ケ谷（杉並区）
  // ===========================================================
  'asagaya': [
    {
      name: 'spile（スパイル）',
      genre: 'cafe',
      area: '阿佐ケ谷駅から徒歩6分',
      description:
        'スパイスとハーブが自慢の自然派カフェ。アンティーク家具の並ぶおしゃれな店内で、ランチタイムは奥のソファ席ならベビーカー入店も可能。子連れにも人気の一軒。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'SONKA（ソンカ）',
      genre: 'bakery',
      area: '阿佐ケ谷駅から徒歩7分',
      description:
        'フランスパンとサンドイッチの専門店。店の奥に小上がりのキッズスペースがあり、おもちゃや絵本を用意。トイレにおむつ替え台もあり、赤ちゃん連れでも安心。',
      kidsSpace: true,
      seatingType: ['zashiki', 'table'],
      diaperChangingTable: true,
      kidsChair: true,
      priceLunch: '〜1,000円',
    },
    {
      name: 'chawan（チャワン）阿佐ヶ谷',
      genre: 'washoku',
      area: '阿佐ケ谷駅から徒歩2分',
      description:
        '和ごはんとカフェの店。開放的で広々した店内はベビーカー入店OKで、子連れでも気兼ねなく過ごせる。お子様メニューや常時10種類以上の和スイーツも揃う。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 西荻窪（杉並区）
  // ===========================================================
  'nishi-ogikubo': [
    {
      name: '海南鶏飯 夢飯（ハイナンチーファン ムーハン）',
      genre: 'asian',
      area: '西荻窪駅から徒歩4分',
      description:
        '海南チキンライスの専門店。おしゃれで開放感のあるテラス席もありベビーカーで入りやすい。子ども椅子に加え「ベビー粥」がメニューにあるなど、赤ちゃん連れにやさしい。',
      strollerOk: true,
      kidsChair: true,
      seatingType: ['table', 'terrace'],
      bringBabyFood: true,
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'ラ・プルミエ・プゥッス',
      genre: 'french',
      area: '西荻窪駅から徒歩5分',
      description:
        'カジュアルフレンチのレストラン。幼児・赤ちゃん・ベビーカーいずれもOKで子連れに寛容。自家製天然酵母パンの販売もあり、ランチ後のお土産選びも楽しめる。',
      strollerOk: true,
      seatingType: ['table'],
      bringBabyFood: true,
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '西荻のことカフェ',
      genre: 'cafe',
      area: '西荻窪駅から徒歩4分',
      description:
        '日替わりでお菓子販売や展示が入るシェアスペース型のカフェ。約80平米と広く天井も高い気持ちのよい空間で、ベビーカー大歓迎。授乳・おむつ替えスペースもある。',
      strollerOk: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      nursingRoom: true,
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '一軒家カフェ&サロン hana',
      genre: 'cafe',
      area: '西荻窪駅南口から徒歩3分',
      description:
        '築80年以上の古民家を改築した一軒家カフェ。こだわりの農家から届く食材を使ったお米御膳をランチで提供。落ち着いた和の空間で子連れでものんびり過ごせる。',
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '棗（なつめ）',
      genre: 'cafe',
      area: '西荻窪駅から徒歩6分',
      description:
        '古民家をおしゃれに改装した2階建てのカフェ。1階がカフェ、2階は器のショップ。ランチは酵素玄米のおにぎりプレートが人気で、子連れでも落ち着いて過ごせる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],
};
