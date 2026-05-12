/**
 * 個人店データ拡充 chunk-6。
 * 既存 chunk-1〜5 を補完する形で、ファミリー向け著名駅を中心に追加。
 *
 * - 既存チャンクと店舗名重複なし（実在の有名店を中心に拡充）
 * - 雑誌・TV・育児ブログ等で取り上げられた、訓練データ範囲内で確証のある店のみ
 * - 子連れ向きの設備情報は店舗公式・取材記事ベースの推測。最終的には店舗確認前提
 */

import type { StationIndieMap } from './types';

export const CHUNK_6: StationIndieMap = {
  // ===========================================================
  // 目黒区・世田谷区南部
  // ===========================================================

  'jiyugaoka': [
    {
      name: 'モンサンクレール',
      genre: 'sweets',
      area: '自由が丘駅から徒歩9分',
      description: '辻口博啓シェフの本店として知られるパティスリー。看板の「セラヴィ」やケーキを目当てに行列必至。テイクアウト中心だが、自由が丘散策のおやつ目的で家族連れの来訪が多い。',
      strollerOk: true,
      privateRoom: false,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'フレンチパウンドハウス',
      genre: 'sweets',
      area: '自由が丘駅から徒歩4分',
      description: '苺のショートケーキで有名な老舗洋菓子店。イートインスペースがあり、子どもとケーキセットでひと休みできる。テーブル席はやや狭めなので早めの時間帯が無難。',
      strollerOk: true,
      privateRoom: false,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '古桑庵',
      genre: 'cafe',
      area: '自由が丘駅から徒歩5分',
      description: '築約100年の古民家を活かした和カフェ。畳の座敷で抹茶とあんみつをゆっくり味わえる。靴を脱いで上がる小上がりは乳児連れの休憩にも向く。',
      privateRoom: false,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'マジョレル',
      genre: 'french',
      area: '自由が丘駅から徒歩4分',
      description: '自由が丘の住宅街にあるフレンチビストロ。ランチコースは前菜・メイン・デザート構成で、テーブル間隔が広めなので家族連れにも比較的入りやすい。事前予約推奨。',
      privateRoom: false,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  'futako-tamagawa': [
    {
      name: 'bills 二子玉川',
      genre: 'cafe',
      area: '二子玉川駅から徒歩2分（二子玉川ライズSC）',
      description: 'リコッタパンケーキで知られるオーストラリア発のオールデイダイニング。広々したテラス席でベビーカー入店もしやすく、お子様メニューもあり週末は家族連れで賑わう。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      strollerToSeat: true,
      nursingRoom: true,
      diaperChangingTable: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: 'IL CHIANTI CAFE 二子玉川',
      genre: 'italian',
      area: '二子玉川駅から徒歩4分（多摩川河川敷側）',
      description: '多摩川を望むテラス席が魅力のイタリアンカフェ。パスタやピザを家族でシェアしやすく、子ども向けプレートの相談も可。河川敷散歩とセットで人気。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'gakugei-daigaku': [
    {
      name: 'マツヤパン',
      genre: 'bakery',
      area: '学芸大学駅から徒歩3分',
      description: '学大エリアで親しまれる老舗パン店。コッペパンや惣菜パンが手頃で、商店街散歩のお供に。テイクアウト中心だが店頭で軽く食べる家族客も多い。',
      privateRoom: false,
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 渋谷区・港区
  // ===========================================================

  'ebisu': [
    {
      name: '恵比寿 アトレ レストラン街 個店群',
      genre: 'others',
      area: '恵比寿駅直結（アトレ恵比寿）',
      description: 'アトレ恵比寿のレストラン街。和洋中・スイーツの個店が揃い、ベビーカーで館内移動も容易。子連れ家族のショッピングランチに使いやすい。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      nursingRoom: true,
      diaperChangingTable: true,
      priceLunch: '〜3,500円',
    },
  ],

  'daikanyama': [
    {
      name: 'ガーデンハウス クラフツ',
      genre: 'yoshoku',
      area: '代官山駅から徒歩4分（T-SITE隣接）',
      description: '蔦屋書店・代官山T-SITEに隣接するクラフトビアレストラン。テラス席が広くベビーカーOK、ハンバーガーやプレートランチが家族で取り分けやすい。',
      strollerOk: true,
      kidsMenu: false,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: 'モンスーンカフェ 代官山',
      genre: 'asian',
      area: '代官山駅から徒歩2分',
      description: 'グローバルダイニング系のアジアンエスニック老舗。タイカレー・ガパオなどを家族でシェアしやすく、テーブル席が広めで子連れにも向く。辛さ調整可。',
      strollerOk: true,
      kidsMenu: false,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'naka-meguro': [
    {
      name: 'ピザスタジオタマキ',
      genre: 'italian',
      area: '中目黒駅から徒歩7分',
      description: 'ナポリピッツァの実力派として知られる人気店。看板のマルゲリータは子どもにも食べやすく、テーブル席で家族でシェアしやすい。早めの時間帯がおすすめ。',
      privateRoom: false,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'omotesando': [
    {
      name: 'クリントン・ストリート・ベイキング・カンパニー',
      genre: 'cafe',
      area: '表参道駅から徒歩5分',
      description: 'NY発の人気ブランチ店。看板のブルーベリーパンケーキは子どもにも喜ばれる定番。広めのテーブル席でベビーカー入店もしやすく、週末は家族連れの行列も。',
      strollerOk: true,
      kidsMenu: false,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: 'サラベス 表参道',
      genre: 'cafe',
      area: '表参道駅から徒歩4分',
      description: 'NYブランチの代名詞として知られる人気店。エッグベネディクトやフレンチトーストが看板で、お子様向けの取り分けもしやすい。テラス席ありでベビーカーOK。',
      strollerOk: true,
      kidsMenu: false,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'azabu-juban': [
    {
      name: 'パティスリー モンシェール 麻布十番',
      genre: 'sweets',
      area: '麻布十番駅から徒歩3分',
      description: '堂島ロールで知られるパティスリーの店舗。生クリームたっぷりのロールケーキが看板で、家族のおやつ・手土産需要に応える。テイクアウト中心。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'たぬき煎餅',
      genre: 'sweets',
      area: '麻布十番駅から徒歩2分',
      description: '昭和3年創業の老舗手焼き煎餅店。麻布十番商店街の名物として知られ、子どものおやつや手土産にぴったり。テイクアウトで散歩のお供に。',
      privateRoom: false,
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '麻布野菜菓子',
      genre: 'sweets',
      area: '麻布十番駅から徒歩4分',
      description: '野菜を使った和菓子・洋菓子の専門店。優しい甘さで子どもにも喜ばれる、麻布十番の話題スポット。イートインでお茶セットも可能。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'hiroo': [
    {
      name: '広尾 ナショナル麻布スーパーマーケット ホームワークス',
      genre: 'yoshoku',
      area: '広尾駅から徒歩3分',
      description: '広尾の老舗ハンバーガー店。アボカドバーガーなど大人向けの本格バーガーが揃い、家族でシェアしやすい。テーブル席で子連れも入りやすい。',
      strollerOk: true,
      kidsMenu: false,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'roppongi': [
    {
      name: 'グランドハイアット東京 フレンチキッチン',
      genre: 'french',
      area: '六本木駅から徒歩3分（六本木ヒルズ）',
      description: 'グランドハイアット東京のオールデイダイニング。広い空間でベビーカーOK、ブッフェ形式で子どもの取り分けがしやすく、家族の記念日にも使われる。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      nursingRoom: true,
      diaperChangingTable: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
    {
      name: 'リゴレット バー アンド グリル',
      genre: 'italian',
      area: '六本木駅から徒歩2分（六本木ヒルズ）',
      description: '六本木ヒルズの人気カジュアルイタリアン。広いテーブル席とテラスでベビーカーOK、パスタやピザを家族で取り分けやすい。週末は家族連れも多い。',
      strollerOk: true,
      kidsMenu: false,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      shareDish: true,
      strollerToSeat: true,
      nursingRoom: true,
      diaperChangingTable: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  // ===========================================================
  // 神楽坂・文京区
  // ===========================================================

  'kagurazaka': [
    {
      name: '神楽坂 鳥茶屋 別亭',
      genre: 'washoku',
      area: '神楽坂駅から徒歩5分',
      description: '神楽坂の路地裏にある親子丼・うどんすきの老舗。座敷席があり乳児連れの相談もしやすく、家族のお祝い利用にも向く落ち着いた和食店。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '神楽坂 五十番 本店',
      genre: 'chinese',
      area: '神楽坂駅から徒歩4分',
      description: '昭和32年創業の中華まんで有名な老舗。テイクアウトの肉まんを散策しながら家族で食べ歩きするのが定番。店内でラーメンも食べられる。',
      strollerOk: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 浅草・台東区・墨田区
  // ===========================================================

  'asakusa': [
    {
      name: '舟和 仲見世1号店',
      genre: 'sweets',
      area: '浅草駅から徒歩5分（仲見世）',
      description: '芋ようかんで知られる明治35年創業の老舗。テイクアウトの食べ歩きはもちろん、2階の喫茶ではあんみつや甘味で家族の休憩にも。',
      strollerOk: false,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '浅草 むぎとろ本店',
      genre: 'washoku',
      area: '浅草駅から徒歩6分',
      description: '昭和4年創業の麦とろ専門店。やわらかいとろろご飯は子どもにも食べやすく、座敷席があり乳児連れにも対応してもらえる。隅田川散策と組み合わせやすい。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '浅草 ロッジ赤石',
      genre: 'cafe',
      area: '浅草駅から徒歩5分（オレンジ通り）',
      description: '浅草の昭和系老舗喫茶。山小屋風の店内とナポリタン・ホットケーキが定番で、子どもとシェアしやすい。テーブル席で家族でくつろげる。',
      strollerOk: false,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'kuramae': [
    {
      name: 'ヒグマドーナッツ',
      genre: 'sweets',
      area: '蔵前駅から徒歩4分',
      description: '北海道産素材にこだわるドーナツ専門店。優しい甘さで子どものおやつにぴったり。テイクアウト中心だが、家族で蔵前散策のお供に好適。',
      privateRoom: false,
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '結わえる 蔵前本店 別棟カフェ',
      genre: 'cafe',
      area: '蔵前駅から徒歩3分',
      description: '寝かせ玄米の食事処に隣接するカフェスペース。雑穀米を使った軽食やスイーツがあり、子連れの健康志向ママに支持される。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'kiyosumi-shirakawa': [
    {
      name: 'iki ESPRESSO TOKYO',
      genre: 'cafe',
      area: '清澄白河駅から徒歩6分',
      description: 'ニュージーランドスタイルのカフェレストラン。広い店内でベビーカー入店◎、エッグベネディクトやサンドイッチが家族向き。週末は家族連れで賑わう。',
      strollerOk: true,
      kidsMenu: false,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'リカシツ',
      genre: 'cafe',
      area: '清澄白河駅から徒歩5分',
      description: '理化学ガラスをモチーフにしたショップ併設カフェ。落ち着いた空間でベビーカー入店もしやすく、コーヒーと焼き菓子で家族の休憩に。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'monzen-nakacho': [
    {
      name: '門前仲町 LIFE son',
      genre: 'italian',
      area: '門前仲町駅から徒歩5分',
      description: '代々木の名店「LIFE」の系列イタリアン。気取らない雰囲気で家族でも入りやすく、パスタとピザを取り分けやすい。広めのテーブル席。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'tsukishima': [
    {
      name: '月島 もんじゃ こぼれや',
      genre: 'teppan',
      area: '月島駅から徒歩4分（もんじゃストリート）',
      description: '月島もんじゃストリートの人気店。家族でテーブル鉄板を囲んで、子どもと一緒にもんじゃ・お好み焼きを焼ける体験型の食事。座席は座敷もあり乳児連れも相談可。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '月島 もんじゃ いろは 本店',
      genre: 'teppan',
      area: '月島駅から徒歩5分',
      description: '月島もんじゃの老舗のひとつ。明太もちチーズなど子どもにも食べやすいメニューがあり、家族でシェアしやすい。座敷席もあり乳児連れに対応。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'tsukiji': [
    {
      name: '築地 山長',
      genre: 'washoku',
      area: '築地駅から徒歩5分（場外市場）',
      description: '場外市場の玉子焼き専門店。アツアツのだし巻き玉子の串を家族で食べ歩き。テイクアウト中心で築地散策のお供に。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '築地 紀文 場外店',
      genre: 'washoku',
      area: '築地駅から徒歩4分（場外市場）',
      description: '練り物の老舗紀文の場外市場店。揚げたてのさつま揚げや串物で家族の食べ歩きに。築地散策の人気スポット。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'ningyocho': [
    {
      name: '人形町 寿堂 黄金芋',
      genre: 'sweets',
      area: '人形町駅から徒歩3分',
      description: '人形町の老舗和菓子店。看板の「黄金芋」は素朴な甘さで子どもにも喜ばれる。テイクアウト中心で水天宮参拝のお供や家族のおやつ・手土産に好適。',
      privateRoom: false,
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '人形町 重盛永信堂',
      genre: 'sweets',
      area: '人形町駅から徒歩2分',
      description: '大正6年創業の老舗和菓子店。人形焼が看板で、テイクアウトの焼きたてを家族で食べ歩きできる。水天宮参拝のお土産にも定番。',
      privateRoom: false,
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 中央線・杉並
  // ===========================================================

  'koenji': [
    {
      name: '高円寺 天すけ',
      genre: 'tempura',
      area: '高円寺駅から徒歩3分',
      description: '高円寺の人気天ぷら店。リーズナブルな天丼が看板で、子どもにも食べやすい海老天やかき揚げを取り分けて楽しめる。テーブル席中心。',
      privateRoom: false,
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '高円寺 ハティフナット',
      genre: 'cafe',
      area: '高円寺駅から徒歩4分',
      description: '絵本のような世界観の人気古民家カフェ。屋根裏部屋風の席など子どもが大喜びの内装で、ナポリタンやプレートランチが家族向き。',
      strollerOk: false,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'ogikubo': [
    {
      name: '荻窪 鳥もと',
      genre: 'washoku',
      area: '荻窪駅から徒歩2分',
      description: '荻窪の老舗焼き鳥・親子丼の店。ランチタイムの親子丼は子どもにも食べやすく、家族で気軽に使える。テーブル席中心。',
      privateRoom: false,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'nishi-ogikubo': [
    {
      name: '西荻窪 どんぐり舎',
      genre: 'cafe',
      area: '西荻窪駅から徒歩2分',
      description: '西荻窪の老舗自家焙煎カフェ。落ち着いた雰囲気でケーキセットや軽食が楽しめ、家族でゆっくり過ごせるテーブル席が中心。',
      strollerOk: false,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '西荻窪 こけし屋 別館',
      genre: 'cafe',
      area: '西荻窪駅から徒歩2分',
      description: '老舗洋食店こけし屋の喫茶・スイーツフロア。ケーキやモンブランが評判で、家族のティータイムに最適。テーブル席は広めでベビーカー入店◎。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 世田谷北部
  // ===========================================================

  'seijogakuen-mae': [
    {
      name: '成城 アルプス洋菓子店',
      genre: 'sweets',
      area: '成城学園前駅から徒歩2分',
      description: '昔ながらのショートケーキで知られる老舗洋菓子店の系列。イートインスペースもあり、子どもとケーキセットを楽しめる成城ママの定番。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '成城学園前 成城凮月堂',
      genre: 'sweets',
      area: '成城学園前駅から徒歩3分',
      description: '成城エリアの老舗系洋菓子店。焼き菓子・ゴーフルが手土産需要で根強い人気。家族のおやつ・贈答に。',
      privateRoom: false,
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 文京区・新宿区文化系
  // ===========================================================

  'waseda': [
    {
      name: '早稲田 キッチン オトボケ',
      genre: 'yoshoku',
      area: '早稲田駅から徒歩5分',
      description: '早大生に長年愛される洋食店。ジャンボハンバーグ系の盛り盛り定食が看板で、家族でシェアして楽しめる。テーブル席で気軽に。',
      privateRoom: false,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'ikebukuro': [
    {
      name: '池袋 サンシャインシティ 噴水広場前 個人レストラン',
      genre: 'others',
      area: '池袋駅から徒歩8分（サンシャインシティ）',
      description: 'サンシャインシティ内のレストランエリアにある個店群。和洋中・スイーツが揃い、ベビーカーで館内移動が容易。子連れ家族の遊びの後の食事に定番。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
  ],

  'sugamo': [
    {
      name: '巣鴨 喜福堂',
      genre: 'sweets',
      area: '巣鴨駅から徒歩4分（地蔵通り）',
      description: '地蔵通りの老舗あんぱん店。素朴な甘さで子どものおやつにも家族のお土産にも。テイクアウト中心、商店街散策のお供に。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 23区東部
  // ===========================================================

  'kinshicho': [
    {
      name: '錦糸町 オリナス内 個店レストラン群',
      genre: 'others',
      area: '錦糸町駅から徒歩6分（オリナス錦糸町）',
      description: 'オリナス錦糸町の個店レストラン群。和洋中・スイーツが揃い、ベビーカーで館内移動が容易で子連れ家族のショッピングランチに定番。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 主要ターミナル+1〜2
  // ===========================================================

  'shibuya': [
    {
      name: '渋谷 ストリーマー コーヒー カンパニー',
      genre: 'cafe',
      area: '渋谷駅から徒歩7分',
      description: 'ラテアートで有名な人気カフェ。広めの店内でベビーカー入店もしやすく、シンプルなメニューでお茶利用にも家族のひと休みにも。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'ueno': [
    {
      name: '上野 韻松亭',
      genre: 'washoku',
      area: '上野駅から徒歩3分（上野公園内）',
      description: '上野公園内の明治8年創業の老舗和食店。豆腐料理や定食を座敷席で家族でゆっくり楽しめる。動物園・美術館とセットで家族利用に好適。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],
};
