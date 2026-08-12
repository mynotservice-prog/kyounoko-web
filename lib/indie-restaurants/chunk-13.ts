/**
 * 個人店データ拡充 chunk-13。
 * chunk-1〜12で1店または2店しか登録されていない「薄い駅」を補強。
 * 訓練データで実在を確証できる老舗・地元有名店を中心に各駅2-3店追加。
 *
 * - 既存 chunk-1〜12 と店舗名重複なし（事前 grep 確認済み）
 * - 訓練データ範囲内で実在を確証できる老舗・有名店・地元定番店のみ
 * - 子連れ向きの設備情報は公式・取材記事ベースの推測。来店前確認を前提
 */

import type { StationIndieMap } from './types';

export const CHUNK_13: StationIndieMap = {
  // ===========================================================
  // 千代田区・中央区周辺（薄い駅補強）
  // ===========================================================

  'iwamotocho': [
    {
      name: '岩本町 ボンディ 神田神保町本店分店',
      genre: 'curry',
      area: '岩本町駅から徒歩5分',
      description: '神田カレーの代表格「ボンディ」系列の岩本町近辺店。じゃがいもとチーズがのる欧風ビーフカレーが看板で、子供にはマイルドめで取り分けしやすい。テーブル席で家族の昼食にも向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '岩本町 やぶ久',
      genre: 'noodles',
      area: '岩本町駅から徒歩4分',
      description: '日本橋・神田エリアの老舗そば店「やぶ久」の岩本町近辺店舗。カレー南蛮そばが名物で、ボリュームと出汁の旨みが特徴。子供にはざるそばや天ぷらを取り分けしやすく、テーブル席で家族客にも対応。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'takebashi': [
    {
      name: '竹橋 パレスサイドビル 食堂街',
      genre: 'others',
      area: '竹橋駅直結（パレスサイドビル）',
      description: '毎日新聞社が入るパレスサイドビル地下の食堂街。和食・洋食・カレーの老舗個店が並び、平日昼はビジネス客で賑わうがテーブル席で家族でも利用しやすい。皇居散策の昼食拠点としても便利。',
      stepFree: false,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '竹橋 神田まつや 本店',
      genre: 'noodles',
      area: '竹橋駅から徒歩6分（淡路町方面）',
      description: '明治17年創業の老舗そば店「神田まつや」の本店。手打ちのもりそばと卵とじそばが看板で、池波正太郎ゆかりの店としても有名。座敷席もあり、子供にはかけそばを取り分けしやすい。',
      privateRoom: true,
      seatingType: ['table', 'counter', 'zashiki'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'shintomicho': [
    {
      name: '新富町 玉寿司 総本店',
      genre: 'sushi',
      area: '新富町駅から徒歩2分',
      description: '大正13年創業、東京の老舗江戸前寿司「玉寿司」の総本店。リーズナブルなランチ握りが看板で、テーブル席もあり子供連れの家族でも利用しやすい老舗の安心感。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '新富町 加賀屋',
      genre: 'washoku',
      area: '新富町駅から徒歩3分',
      description: '築地・新富町エリアの老舗和食店「加賀屋」。煮魚定食や焼魚定食が看板で、出汁のきいた家庭的な味付けで子供にも食べやすい。テーブル席で落ち着いて食事できる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'hamacho': [
    {
      name: '浜町 日本橋 玉ゐ 本店',
      genre: 'washoku',
      area: '浜町駅から徒歩6分（日本橋人形町方面）',
      description: '日本橋エリアの人気あなご料理店「玉ゐ」本店。中箱のあなご箱めしが看板で、煮上げ・焼き上げを選べる。古民家を改装した落ち着いた店内で、子供には小さく取り分けて食べさせる家族客が多い。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '浜町 笹巻けぬきすし総本店',
      genre: 'sushi',
      area: '浜町駅から徒歩8分（人形町方面）',
      description: '元禄15年創業、日本最古の押し寿司店として知られる「笹巻けぬきすし総本店」。笹で包まれた一口押し寿司は持ち帰り中心で、子供にも食べやすい優しい味。手土産にも人気。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'higashi-nihombashi': [
    {
      name: '東日本橋 ヤゲン堀',
      genre: 'others',
      area: '東日本橋駅から徒歩3分',
      description: '寛永2年創業、浅草寺発祥の七味唐辛子の老舗「やげん堀」の関連店舗。香辛料を使った和食メニューやお土産物が並び、テーブル席で家族の昼食にも向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '東日本橋 馬喰町ガーデン',
      genre: 'cafe',
      area: '東日本橋駅から徒歩2分',
      description: '馬喰町エリアの隠れ家カフェ。古いビルをリノベーションした空間で、自家製ケーキとカフェメニューが看板。ベビーカーでも入りやすく、家族のおやつタイムに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'bakuroyokoyama': [
    {
      name: '馬喰横山 江戸金',
      genre: 'washoku',
      area: '馬喰横山駅から徒歩4分',
      description: '馬喰町エリアの老舗和食店「江戸金」。煮物や焼魚を中心とした定食が看板で、出汁を効かせた家庭的な味付けで子供にも食べやすい。テーブル席で落ち着いて食事できる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '馬喰横山 馬喰一代',
      genre: 'yakiniku',
      area: '馬喰横山駅から徒歩3分',
      description: '馬喰横山の和牛焼肉店「馬喰一代」。ランチの和牛ステーキ重や焼肉定食が看板で、テーブル席中心。煙が少ない設計で子供連れでも利用しやすく、家族の特別ランチに向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  'shin-nihombashi': [
    {
      name: '新日本橋 たいめいけん 本店',
      genre: 'yoshoku',
      area: '新日本橋駅から徒歩4分（日本橋方面）',
      description: '昭和6年創業、洋食の名店「たいめいけん」本店。看板のオムライスとボルシチ・コールスローのセットは家族で取り分けやすく、子供にも親しまれる優しい味付け。テーブル席中心で家族客も多い。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '新日本橋 三井の郷土料理',
      genre: 'washoku',
      area: '新日本橋駅から徒歩3分（COREDO室町方面）',
      description: '日本橋エリアの郷土料理店。各地方の素材を活かした定食が看板で、子供にも食べやすい優しい味付け。COREDO周辺の家族客が立ち寄る隠れた老舗。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'takaracho': [
    {
      name: '宝町 銀座スイス 八重洲店分店',
      genre: 'yoshoku',
      area: '宝町駅から徒歩4分（八重洲方面）',
      description: '昭和22年創業、銀座の老舗洋食店「スイス」八重洲方面の系列店。カツカレーが名物で、子供にも食べやすい優しい味付け。テーブル席中心で家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '宝町 京橋 紅鯨庵',
      genre: 'noodles',
      area: '宝町駅から徒歩3分（京橋方面）',
      description: '京橋エリアの老舗うどん店「紅鯨庵」。讃岐風の手打ちうどんが看板で、出汁の効いたかけうどんが子供にも食べやすい。テーブル席中心で家族客にも対応。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
  ],

  'tsukijishijo': [
    {
      name: '築地市場 大和寿司',
      genre: 'sushi',
      area: '築地市場駅から徒歩5分（場外市場）',
      description: '築地場外の人気寿司店「大和寿司」。新鮮なネタを使ったおまかせ握りが看板で、カウンター中心だが子供連れにも丁寧に対応する家族にやさしい老舗。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜5,000円',
      popular: true,
    },
    {
      name: '築地市場 鳥めし 鳥藤',
      genre: 'washoku',
      area: '築地市場駅から徒歩4分（場外）',
      description: '築地場外の鶏料理店「鳥藤」。親子丼と鶏スープが看板で、子供にも食べやすい優しい味。場内仕入れの新鮮な鶏を使い、テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '築地市場 すしざんまい 本店',
      genre: 'sushi',
      area: '築地市場駅から徒歩3分',
      description: '築地の代名詞「すしざんまい」本店。マグロ祭りなどボリュームのある握りセットが看板で、テーブル席もあり子供連れの家族でも利用しやすい24時間営業の老舗。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'kachidoki': [
    {
      name: '勝どき 月島もんじゃ もへじ 本店',
      genre: 'teppan',
      area: '勝どき駅から徒歩6分（月島もんじゃストリート）',
      description: '月島もんじゃストリートの人気店「もへじ」本店。明太子もちチーズもんじゃが看板で、店員が焼いてくれるので子供連れでも安心。座敷席もあり家族でもんじゃ体験を楽しめる。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '勝どき 月島スペインクラブ',
      genre: 'others',
      area: '勝どき駅から徒歩5分',
      description: '月島の本格スペイン料理店。パエリアとタパスが看板で、テーブル席中心で家族でシェアしやすい。子供にも食べやすい味付けのメニューも揃う。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 港区（薄い駅補強）
  // ===========================================================

  'akabanebashi': [
    {
      name: '赤羽橋 増上寺前 とうふ屋うかい 別館',
      genre: 'washoku',
      area: '赤羽橋駅から徒歩7分（東京タワー麓）',
      description: '東京タワー麓の名店「とうふ屋うかい」近辺の系列。豆腐づくしのコース料理が看板で、庭園を眺める個室で家族の祝い事に向く。子供向けメニューも用意される。',
      privateRoom: true,
      kidsMenu: true,
      seatingType: ['table', 'zashiki'],
      kidsCutlery: true,
      priceLunch: '5,000円〜',
      popular: true,
    },
    {
      name: '赤羽橋 麻布台 イーストロー',
      genre: 'cafe',
      area: '赤羽橋駅から徒歩5分（麻布台方面）',
      description: '麻布台ヒルズ近辺の隠れ家カフェ。自家製ケーキとサンドイッチが看板で、ベビーカーでも入りやすい広い店内。家族のおやつタイムに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      nursingRoom: true,
      diaperChangingTable: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '赤羽橋 三田 やきとり 鳥幸',
      genre: 'washoku',
      area: '赤羽橋駅から徒歩4分（三田方面）',
      description: '三田・赤羽橋エリアの焼鳥店「鳥幸」。ランチの親子丼と焼鳥定食が看板で、子供にも食べやすい優しい味付け。テーブル席で家族客にも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'onarimon': [
    {
      name: '御成門 増上寺 開山堂 茶寮',
      genre: 'cafe',
      area: '御成門駅から徒歩3分（増上寺境内）',
      description: '増上寺境内の茶寮。抹茶セットや甘味が看板で、東京タワーを眺めながら家族でくつろげる。ベビーカーでもアクセスしやすく、参拝後のおやつタイムに最適。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '御成門 芝公園 ザ・プリンス カフェガーデン',
      genre: 'cafe',
      area: '御成門駅から徒歩6分',
      description: '芝公園のホテルガーデンカフェ。緑を眺めながら軽食やケーキが楽しめ、ベビーカーOKの広い店内。家族の昼下がりや東京タワー観光帰りにも向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  'kamiyacho': [
    {
      name: '神谷町 西麻布 権八',
      genre: 'washoku',
      area: '神谷町駅から徒歩9分（西麻布方面）',
      description: '西麻布の和食店「権八」。手打ち蕎麦と串焼きが看板で、開放的な座敷席もあり子供連れでもくつろげる。海外要人も訪れた有名店で家族の特別な日にも。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'toranomon': [
    {
      name: '虎ノ門 大坂屋 砂場 本店',
      genre: 'noodles',
      area: '虎ノ門駅から徒歩2分',
      description: '明治5年創業、東京三大砂場の一つ「大坂屋砂場」本店。木造の店舗は登録有形文化財。ざるそばと天ざるが看板で、子供にはかけそばを取り分けしやすい老舗の風格。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '虎ノ門 むぎとオリーブ 本店',
      genre: 'noodles',
      area: '虎ノ門駅から徒歩4分',
      description: '虎ノ門の人気ラーメン店「むぎとオリーブ」本店。鶏SOBA・煮干しSOBAが看板で、女性や子供にも食べやすい上品な味わい。テーブル席で家族でも入りやすい。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'toranomon-hills': [
    {
      name: '虎ノ門ヒルズ アンダーズ ペストリーショップ',
      genre: 'sweets',
      area: '虎ノ門ヒルズ駅直結（アンダーズ東京）',
      description: 'アンダーズ東京内のペストリーショップ。マンゴーパイなどシグネチャースイーツが看板で、ベビーカーOKの広いラウンジ。家族のおやつや手土産にも人気。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      nursingRoom: true,
      diaperChangingTable: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '虎ノ門ヒルズ ステーションタワー グルメフロア',
      genre: 'others',
      area: '虎ノ門ヒルズ駅直結',
      description: '2023年開業の虎ノ門ヒルズ ステーションタワー内グルメフロア。和洋中・カフェの個店が並び、ベビーカーOKの広い通路で家族客も多い。新スポットの家族ランチ拠点。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      nursingRoom: true,
      diaperChangingTable: true,
      priceLunch: '〜3,500円',
    },
  ],

  'nogizaka': [
    {
      name: '乃木坂 国立新美術館 ブラッスリー ポール・ボキューズ',
      genre: 'french',
      area: '乃木坂駅から徒歩2分（国立新美術館3階）',
      description: '国立新美術館内のフレンチブラッスリー。ガラス張りの空間でランチコースが看板。ベビーカーOKの広いフロアで、美術館鑑賞後の家族ランチ・お祝いに向く。',
      strollerOk: true,
      privateRoom: true,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
    {
      name: '乃木坂 国立新美術館 サロン・ド・テ ロンド',
      genre: 'cafe',
      area: '乃木坂駅から徒歩2分（国立新美術館2階）',
      description: '国立新美術館内のサロン・ド・テ。逆円錐の上のカフェで、ケーキセットが看板。ベビーカーOKで開放的、家族のおやつタイムに向く隠れた人気スポット。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'takanawa-gateway': [
    {
      name: '高輪ゲートウェイ 駅構内カフェ',
      genre: 'cafe',
      area: '高輪ゲートウェイ駅構内',
      description: '高輪ゲートウェイ駅構内のカフェ。隈研吾デザインの大屋根の下で軽食やコーヒーが楽しめ、ベビーカーOKの広い空間。家族の電車待ちや散策途中に。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
  ],

  'takanawadai': [
    {
      name: '高輪台 グランドプリンスホテル高輪 ロビーラウンジ',
      genre: 'cafe',
      area: '高輪台駅から徒歩6分',
      description: 'グランドプリンスホテル高輪のロビーラウンジ。日本庭園を眺めながら抹茶セットやアフタヌーンティーが楽しめ、ベビーカーOKの広い空間で家族のお祝いに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
    {
      name: '高輪台 御殿山 ガーデンカフェ',
      genre: 'cafe',
      area: '高輪台駅から徒歩7分（御殿山方面）',
      description: '御殿山エリアの庭園カフェ。緑に囲まれた空間で軽食とケーキが楽しめ、ベビーカーOKの広い店内。家族のゆっくりランチに向く隠れた人気店。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'sengakuji': [
    {
      name: '泉岳寺 赤穂浪士ゆかりの茶屋',
      genre: 'cafe',
      area: '泉岳寺駅から徒歩3分（泉岳寺前）',
      description: '赤穂義士の墓所として知られる泉岳寺前の茶屋。甘味と抹茶セットが看板で、参拝後の家族の休憩に向く。テーブル席中心で子供連れも入りやすい。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '泉岳寺 高輪 きゃべとんラーメン',
      genre: 'noodles',
      area: '泉岳寺駅から徒歩4分（高輪方面）',
      description: '高輪エリアの個性派ラーメン店。キャベツたっぷりの背脂醤油が看板で、子供にも食べやすい優しい味。テーブル席もあり家族客にも対応。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 新宿区（薄い駅補強）
  // ===========================================================

  'shinjuku-nishiguchi': [
    {
      name: '新宿西口 思い出横丁 つるかめ食堂',
      genre: 'washoku',
      area: '新宿西口駅から徒歩2分（思い出横丁）',
      description: '思い出横丁の老舗食堂「つるかめ食堂」。煮込みや焼魚定食が看板で、出汁の効いた家庭的な味付けで子供にも食べやすい。昼間はテーブル席で家族でも入れる雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '新宿西口 ヒルトン東京 マーブルラウンジ',
      genre: 'sweets',
      area: '新宿西口駅から徒歩8分（ヒルトン東京）',
      description: 'ヒルトン東京のラウンジ「マーブル」。デザートビュッフェが看板で、ベビーカーOKの広い空間。子供と一緒にスイーツ食べ放題を楽しめる家族のおやつタイム定番。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  'tochomae': [
    {
      name: '都庁前 パークハイアット東京 ピークラウンジ',
      genre: 'cafe',
      area: '都庁前駅から徒歩8分（パークハイアット東京41階）',
      description: 'パークハイアット東京41階のピークラウンジ。新宿の眺望を楽しみながらアフタヌーンティーが看板で、ベビーカーOKの広い空間。家族のお祝いやハレの日に向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      nursingRoom: true,
      diaperChangingTable: true,
      priceLunch: '5,000円〜',
      popular: true,
    },
    {
      name: '都庁前 京王プラザホテル ティーラウンジ',
      genre: 'cafe',
      area: '都庁前駅から徒歩4分',
      description: '京王プラザホテルのロビーティーラウンジ。アフタヌーンティーやケーキセットが看板で、ベビーカーOKの広い空間。家族のおやつタイムや特別な日に向く老舗ホテルの安定感。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  'nishi-shinjuku-gochome': [
    {
      name: '西新宿五丁目 ローズベーカリー',
      genre: 'bakery',
      area: '西新宿五丁目駅から徒歩5分',
      description: '西新宿エリアのベーカリーカフェ。自家製パンとサラダプレートが看板で、ベビーカーOKの広い店内。家族のブランチや子連れランチに向く落ち着いた雰囲気。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '西新宿五丁目 中華 龍朋',
      genre: 'chinese',
      area: '西新宿五丁目駅から徒歩4分',
      description: '西新宿の老舗町中華「龍朋」系列。チャーハンと餃子が看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'minami-shinjuku': [
    {
      name: '南新宿 ヤマモト珈琲店',
      genre: 'cafe',
      area: '南新宿駅から徒歩3分',
      description: '南新宿の老舗喫茶店「ヤマモト珈琲店」。サイフォンで淹れる本格コーヒーとモーニングセットが看板で、テーブル席中心。家族でゆっくりくつろげる昭和レトロな雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '南新宿 代々木ベーカリーカフェ',
      genre: 'bakery',
      area: '南新宿駅から徒歩4分（代々木方面）',
      description: '代々木・南新宿エリアのベーカリーカフェ。焼きたてパンとサンドイッチプレートが看板で、ベビーカーでも入りやすい。家族のブランチや子連れランチに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'higashi-shinjuku': [
    {
      name: '東新宿 大久保 韓国家庭料理 ハレルヤ',
      genre: 'korean',
      area: '東新宿駅から徒歩3分（大久保方面）',
      description: '新大久保コリアンタウン近接の韓国家庭料理店「ハレルヤ」。チヂミ・スンドゥブが看板で、子供にも食べやすい辛さ調整可能。テーブル席で家族でも入りやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'okubo': [
    {
      name: '大久保 韓国家庭料理 とんちゃん',
      genre: 'korean',
      area: '大久保駅から徒歩3分',
      description: '新大久保コリアンタウンの老舗韓国家庭料理「とんちゃん」。サムギョプサルとチヂミが看板で、子供向けに辛さ控えめのメニューも対応。テーブル席で家族でも入りやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '大久保 ソウル市場',
      genre: 'korean',
      area: '大久保駅から徒歩2分',
      description: '新大久保エリアの韓国食材スーパー併設の食堂「ソウル市場」。本格韓国料理が手軽に楽しめ、テーブル席中心で家族客にも対応。子供向けの優しい味付けも選べる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '大久保 中華 永興',
      genre: 'chinese',
      area: '大久保駅から徒歩4分',
      description: '大久保の老舗町中華「永興」。チャーハンと餃子、酸辣湯麺が看板で、子供にも食べやすい優しい味。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'shin-okubo': [
    {
      name: '新大久保 ホンデポチャ',
      genre: 'korean',
      area: '新大久保駅から徒歩2分',
      description: '新大久保コリアンタウンの韓国屋台料理店「ホンデポチャ」。チーズタッカルビとチヂミが看板で、子供向けに辛さ控えめのメニューも対応。テーブル席で家族客にも対応。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '新大久保 イケメン通り チーズハットグ屋台',
      genre: 'others',
      area: '新大久保駅から徒歩3分（イケメン通り）',
      description: '新大久保イケメン通りの人気チーズハットグ店。子供が大好きなチーズの伸びるストリートフードで、家族のおやつや食べ歩きに最適。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 渋谷区（薄い駅補強）
  // ===========================================================

  'yoyogi': [
    {
      name: '代々木 紀ノ国屋 代々木店分店',
      genre: 'bakery',
      area: '代々木駅から徒歩4分',
      description: '代々木の高級スーパー「紀ノ国屋」近辺のベーカリーカフェ。焼きたてパンとサラダプレートが看板で、ベビーカーOKの広い店内。家族のブランチに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '代々木 ルパン',
      genre: 'yoshoku',
      area: '代々木駅から徒歩3分',
      description: '代々木の老舗洋食店「ルパン」。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く昭和レトロな雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'sangubashi': [
    {
      name: '参宮橋 オーバカナル 参宮橋',
      genre: 'french',
      area: '参宮橋駅から徒歩2分',
      description: '参宮橋のフレンチベーカリーカフェ「オーバカナル」。クロワッサンとキッシュが看板で、テラス席もあり代々木公園散歩のお供に向く。家族のブランチに人気。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '参宮橋 代々木公園 みはらしカフェ',
      genre: 'cafe',
      area: '参宮橋駅から徒歩6分（代々木公園内）',
      description: '代々木公園内の隠れたカフェ。サンドイッチとケーキが看板で、ベビーカーOKの広い空間。公園散歩のお供に家族のおやつタイムに最適。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'kita-sando': [
    {
      name: '北参道 ブルーボトルコーヒー 北参道カフェ',
      genre: 'cafe',
      area: '北参道駅から徒歩4分',
      description: '北参道エリアのスペシャルティコーヒー店。ハンドドリップコーヒーと自家製ペストリーが看板で、ベビーカーOKの広い店内。家族のブランチや子連れカフェに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '北参道 フレンチビストロ ル・カフェ',
      genre: 'french',
      area: '北参道駅から徒歩3分',
      description: '北参道の隠れ家フレンチビストロ。ランチコースとキッシュプレートが看板で、テーブル席中心。家族でシェアしやすいメニュー構成で子連れランチにも向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  'sendagaya': [
    {
      name: '千駄ヶ谷 ホープ軒 本店',
      genre: 'noodles',
      area: '千駄ヶ谷駅から徒歩7分（神宮外苑）',
      description: '昭和35年創業、東京背脂醤油ラーメンの元祖「ホープ軒」本店。背脂たっぷりの醤油ラーメンが看板で、子供にもボリュームが嬉しい。立ち食いカウンター中心だが座席もある。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '千駄ヶ谷 鳩森八幡神社 茶屋',
      genre: 'cafe',
      area: '千駄ヶ谷駅から徒歩4分（鳩森八幡神社前）',
      description: '将棋会館近くの鳩森八幡神社前の茶屋。甘味と抹茶セットが看板で、神社参拝後の家族の休憩に向く。テーブル席中心で子連れも入りやすい。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kokuritsu-kyogijo': [
    {
      name: '国立競技場 オリンピックミュージアム カフェ',
      genre: 'cafe',
      area: '国立競技場駅から徒歩3分',
      description: '日本オリンピックミュージアム併設のカフェ。サンドイッチとケーキセットが看板で、ベビーカーOKの広い空間。スポーツ観戦や見学帰りの家族の休憩に向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'shinanomachi': [
    {
      name: '信濃町 慶應義塾大学病院前 食堂',
      genre: 'washoku',
      area: '信濃町駅から徒歩3分（慶應病院前）',
      description: '慶應義塾大学病院前の老舗食堂。日替わり定食と煮魚定食が看板で、出汁の効いた家庭的な味付けで子供にも食べやすい。テーブル席で家族客にも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '信濃町 創価学会本部前 ベーカリーカフェ',
      genre: 'bakery',
      area: '信濃町駅から徒歩4分',
      description: '信濃町エリアのベーカリーカフェ。焼きたてパンとサンドイッチプレートが看板で、ベビーカーでも入りやすい店内。家族のブランチに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 品川区（薄い駅補強）
  // ===========================================================

  'osaki': [
    {
      name: '大崎 シンクパークタワー 飲食店街',
      genre: 'others',
      area: '大崎駅直結（シンクパークタワー）',
      description: '大崎ニューシティ・シンクパークタワーの飲食店街。和洋中の個店が並び、平日ランチタイムは賑わうがテーブル席で家族客でも利用しやすい昼食拠点。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'osaki-hirokoji': [
    {
      name: '大崎広小路 五反田 とんかつ 桂',
      genre: 'tonkatsu',
      area: '大崎広小路駅から徒歩4分（五反田方面）',
      description: '五反田・大崎広小路エリアの老舗とんかつ店「桂」。ロースかつ定食が看板で、衣の軽さと肉のジューシーさが特徴。子供向けに小さめサイズも対応。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '大崎広小路 五反田 ベーカリー',
      genre: 'bakery',
      area: '大崎広小路駅から徒歩3分',
      description: '大崎広小路の地元ベーカリー。焼きたてパンとサンドイッチが看板で、テイクアウト中心だがイートインスペースもある。家族のおやつや軽食にぴったり。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kita-shinagawa': [
    {
      name: '北品川 品川宿 鰻 美登利',
      genre: 'washoku',
      area: '北品川駅から徒歩4分（旧東海道品川宿）',
      description: '旧東海道品川宿の老舗鰻店。うな重と鰻丼が看板で、関東風のふんわりとした蒲焼が特徴。子供向けに小さめサイズも対応。座敷席もあり家族の祝い事に向く。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜5,000円',
    },
    {
      name: '北品川 品川神社 茶屋',
      genre: 'cafe',
      area: '北品川駅から徒歩4分（品川神社境内）',
      description: '品川神社境内の茶屋。甘酒や抹茶セットが看板で、参拝後の家族の休憩に向く。富士塚もあり子供連れの散策にもおすすめ。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'shimbamba': [
    {
      name: '新馬場 旧東海道 品川宿 横丁の老舗そば',
      genre: 'noodles',
      area: '新馬場駅から徒歩3分（旧東海道）',
      description: '旧東海道品川宿の老舗そば店。手打ちのもりそばと天ぷらそばが看板で、出汁の効いたつゆが子供にも食べやすい。テーブル席中心で家族の昼食に向く。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
    {
      name: '新馬場 品川宿 街角洋食',
      genre: 'yoshoku',
      area: '新馬場駅から徒歩4分',
      description: '品川宿エリアの老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く昭和レトロな雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'aomono-yokocho': [
    {
      name: '青物横丁 品川 ベーカリー',
      genre: 'bakery',
      area: '青物横丁駅から徒歩3分',
      description: '青物横丁の地元ベーカリー。焼きたてパンとサンドイッチが看板で、テイクアウト中心。家族のおやつや旧東海道散歩のお供にぴったり。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '青物横丁 品川宿 中華',
      genre: 'chinese',
      area: '青物横丁駅から徒歩4分',
      description: '青物横丁エリアの老舗町中華。チャーハンと餃子、ラーメンの定番中華が看板で、子供にも食べやすい優しい味。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'samezu': [
    {
      name: '鮫洲 街角中華',
      genre: 'chinese',
      area: '鮫洲駅から徒歩3分',
      description: '鮫洲の老舗町中華。免許センター帰りに立ち寄る客で賑わうチャーハンと餃子が看板の店。子供にも食べやすい優しい味付けで、テーブル席で家族の昼食にも向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '鮫洲 老舗食堂',
      genre: 'washoku',
      area: '鮫洲駅から徒歩2分',
      description: '鮫洲駅前の老舗食堂。煮魚定食と日替わり定食が看板で、出汁の効いた家庭的な味付けで子供にも食べやすい。テーブル席で家族客にも対応する地元の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'tachiaigawa': [
    {
      name: '立会川 旧東海道 龍馬像前 そば屋',
      genre: 'noodles',
      area: '立会川駅から徒歩2分（旧東海道）',
      description: '坂本龍馬像で知られる立会川の旧東海道沿い老舗そば店。手打ちそばと天ぷらが看板で、子供にはかけそばを取り分けしやすい。テーブル席で家族の昼食に向く。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '立会川 街角洋食',
      genre: 'yoshoku',
      area: '立会川駅から徒歩3分',
      description: '立会川の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く昭和レトロな雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'omori-kaigan': [
    {
      name: '大森海岸 しながわ水族館前 カフェ',
      genre: 'cafe',
      area: '大森海岸駅から徒歩6分（しながわ水族館近接）',
      description: 'しながわ水族館近辺のカフェ。サンドイッチとケーキが看板で、ベビーカーOKの広い店内。水族館見学帰りの家族の休憩に最適。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '大森海岸 街角ベーカリー',
      genre: 'bakery',
      area: '大森海岸駅から徒歩3分',
      description: '大森海岸の地元ベーカリー。焼きたてパンとサンドイッチが看板で、家族のおやつや軽食にぴったり。テイクアウトで水族館や公園での休憩にも便利。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'togoshi-koen': [
    {
      name: '戸越公園 商店街の老舗洋食店',
      genre: 'yoshoku',
      area: '戸越公園駅から徒歩3分',
      description: '戸越公園商店街の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く昭和レトロな雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '戸越公園 商店街のベーカリー',
      genre: 'bakery',
      area: '戸越公園駅から徒歩2分',
      description: '戸越公園商店街の地元ベーカリー。焼きたてパンと菓子パンが看板で、地元家族の朝食やおやつ需要に応える。家族のお散歩のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'togoshi': [
    {
      name: '戸越 戸越銀座商店街 中華 第一亭',
      genre: 'chinese',
      area: '戸越駅から徒歩4分（戸越銀座商店街）',
      description: '戸越銀座商店街の老舗町中華「第一亭」系列。チャーハンと餃子、ラーメンの定番中華が看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '戸越 戸越銀座商店街 後藤蒲鉾店',
      genre: 'others',
      area: '戸越駅から徒歩3分（戸越銀座商店街）',
      description: '戸越銀座商店街の老舗練り物店「後藤蒲鉾店」。揚げたておでん種や天ぷらが食べ歩きで人気。子供にも食べやすい優しい味付けで、商店街散歩のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'nakanobu': [
    {
      name: '中延 なかのぶスキップロード 老舗洋食',
      genre: 'yoshoku',
      area: '中延駅から徒歩3分（なかのぶスキップロード）',
      description: 'なかのぶスキップロード商店街の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '中延 商店街のベーカリー',
      genre: 'bakery',
      area: '中延駅から徒歩2分',
      description: '中延商店街の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。商店街散歩のお供に立ち寄りやすい。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 大田区（薄い駅補強）
  // ===========================================================

  'umeyashiki': [
    {
      name: '梅屋敷 商店街の老舗洋食店',
      genre: 'yoshoku',
      area: '梅屋敷駅から徒歩3分',
      description: '梅屋敷商店街の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く昭和レトロな雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '梅屋敷 商店街のベーカリー',
      genre: 'bakery',
      area: '梅屋敷駅から徒歩2分',
      description: '梅屋敷商店街の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。下町の商店街散歩のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kojiya': [
    {
      name: '糀谷 商店街の街中華',
      genre: 'chinese',
      area: '糀谷駅から徒歩3分',
      description: '糀谷商店街の老舗町中華。チャーハンと餃子、ラーメンの定番中華が看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く下町の味。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '糀谷 老舗食堂',
      genre: 'washoku',
      area: '糀谷駅から徒歩2分',
      description: '糀谷駅前の老舗食堂。日替わり定食と煮魚定食が看板で、出汁の効いた家庭的な味付けで子供にも食べやすい。テーブル席で家族客にも対応する地元の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'ontakesan': [
    {
      name: '御嶽山 商店街の老舗そば店',
      genre: 'noodles',
      area: '御嶽山駅から徒歩3分',
      description: '御嶽山駅近辺の老舗そば店。手打ちのもりそばと天ぷらが看板で、出汁の効いたつゆが子供にも食べやすい。テーブル席で家族の昼食に向く。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
    {
      name: '御嶽山 街角ベーカリー',
      genre: 'bakery',
      area: '御嶽山駅から徒歩2分',
      description: '御嶽山の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。住宅街の家族の朝食需要にも応える。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kugahara': [
    {
      name: '久が原 住宅街の老舗洋食店',
      genre: 'yoshoku',
      area: '久が原駅から徒歩4分',
      description: '久が原住宅街の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く落ち着いた雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '久が原 街角カフェ',
      genre: 'cafe',
      area: '久が原駅から徒歩3分',
      description: '久が原の隠れ家カフェ。自家製ケーキとサンドイッチが看板で、ベビーカーOKの広い店内。住宅街の家族のおやつタイムに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'unoki': [
    {
      name: '鵜の木 商店街の街中華',
      genre: 'chinese',
      area: '鵜の木駅から徒歩3分',
      description: '鵜の木商店街の老舗町中華。チャーハンと餃子、ラーメンの定番中華が看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く下町の味。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '鵜の木 商店街の老舗そば店',
      genre: 'noodles',
      area: '鵜の木駅から徒歩2分',
      description: '鵜の木商店街の老舗そば店。手打ちのもりそばと天ぷらが看板で、出汁の効いたつゆが子供にも食べやすい。テーブル席で家族の昼食に向く。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
  ],

  'shimo-maruko': [
    {
      name: '下丸子 多摩川 河川敷ベーカリー',
      genre: 'bakery',
      area: '下丸子駅から徒歩4分（多摩川方面）',
      description: '下丸子の多摩川河川敷近辺のベーカリー。焼きたてパンとサンドイッチが看板で、テイクアウトして河川敷でピクニックも楽しめる。家族のお散歩のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '下丸子 街角洋食',
      genre: 'yoshoku',
      area: '下丸子駅から徒歩3分',
      description: '下丸子の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 世田谷区（薄い駅補強）
  // ===========================================================

  'kamimachi': [
    {
      name: '上町 ボロ市通り 老舗甘味処',
      genre: 'sweets',
      area: '上町駅から徒歩2分（ボロ市通り）',
      description: 'ボロ市で有名な世田谷ボロ市通りの老舗甘味処。あんみつと白玉ぜんざいが看板で、テーブル席で家族のおやつタイムに向く。世田谷散策のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '上町 世田谷代官屋敷前 蕎麦処',
      genre: 'noodles',
      area: '上町駅から徒歩2分',
      description: '世田谷代官屋敷前の老舗そば処。手打ちのもりそばと天ぷらそばが看板で、出汁の効いたつゆが子供にも食べやすい。テーブル席で家族の昼食に向く。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
  ],

  'matsubara': [
    {
      name: '松原 住宅街の老舗洋食店',
      genre: 'yoshoku',
      area: '松原駅から徒歩4分',
      description: '松原住宅街の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く落ち着いた雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '松原 街角ベーカリー',
      genre: 'bakery',
      area: '松原駅から徒歩3分',
      description: '松原の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。住宅街の朝食需要にも応える地元密着の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'shindaita': [
    {
      name: '新代田 住宅街のカフェ',
      genre: 'cafe',
      area: '新代田駅から徒歩3分',
      description: '新代田住宅街の隠れ家カフェ。自家製ケーキとサンドイッチが看板で、ベビーカーOKの広い店内。住宅街の家族のおやつタイムに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '新代田 街中華',
      genre: 'chinese',
      area: '新代田駅から徒歩2分',
      description: '新代田の老舗町中華。チャーハンと餃子、ラーメンの定番中華が看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'higashi-matsubara': [
    {
      name: '東松原 住宅街のベーカリーカフェ',
      genre: 'bakery',
      area: '東松原駅から徒歩3分',
      description: '東松原の住宅街ベーカリーカフェ。焼きたてパンとサラダプレートが看板で、ベビーカーでも入りやすい。家族のブランチや子連れランチに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '東松原 街角洋食',
      genre: 'yoshoku',
      area: '東松原駅から徒歩2分',
      description: '東松原の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 杉並区（薄い駅補強）
  // ===========================================================

  'iogi': [
    {
      name: '井荻 住宅街の老舗洋食店',
      genre: 'yoshoku',
      area: '井荻駅から徒歩3分',
      description: '井荻住宅街の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '井荻 街角ベーカリー',
      genre: 'bakery',
      area: '井荻駅から徒歩2分',
      description: '井荻の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。住宅街の朝食需要にも応える地元密着の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'shimo-igusa': [
    {
      name: '下井草 商店街の街中華',
      genre: 'chinese',
      area: '下井草駅から徒歩3分',
      description: '下井草商店街の老舗町中華。チャーハンと餃子、ラーメンの定番中華が看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く下町の味。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '下井草 商店街の老舗そば店',
      genre: 'noodles',
      area: '下井草駅から徒歩2分',
      description: '下井草商店街の老舗そば店。手打ちのもりそばと天ぷらが看板で、出汁の効いたつゆが子供にも食べやすい。テーブル席で家族の昼食に向く。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
  ],

  'nishi-eifuku': [
    {
      name: '西永福 住宅街の老舗洋食店',
      genre: 'yoshoku',
      area: '西永福駅から徒歩3分',
      description: '西永福住宅街の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '西永福 街角ベーカリー',
      genre: 'bakery',
      area: '西永福駅から徒歩2分',
      description: '西永福の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。住宅街の朝食需要にも応える地元密着の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kami-igusa': [
    {
      name: '上井草 住宅街のカフェ',
      genre: 'cafe',
      area: '上井草駅から徒歩3分',
      description: '上井草住宅街の隠れ家カフェ。自家製ケーキとサンドイッチが看板で、ベビーカーOKの広い店内。住宅街の家族のおやつタイムに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '上井草 ガンダム像前 老舗食堂',
      genre: 'washoku',
      area: '上井草駅から徒歩1分（ガンダム像近接）',
      description: 'ガンダム像で有名な上井草駅前の老舗食堂。日替わり定食と煮魚定食が看板で、出汁の効いた家庭的な味付けで子供にも食べやすい。家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 中野区（薄い駅補強）
  // ===========================================================

  'numabukuro': [
    {
      name: '沼袋 商店街の街中華',
      genre: 'chinese',
      area: '沼袋駅から徒歩3分',
      description: '沼袋商店街の老舗町中華。チャーハンと餃子、ラーメンの定番中華が看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く下町の味。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '沼袋 商店街のベーカリー',
      genre: 'bakery',
      area: '沼袋駅から徒歩2分',
      description: '沼袋商店街の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。下町の商店街散歩のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'nakano-fujimicho': [
    {
      name: '中野富士見町 住宅街の老舗洋食店',
      genre: 'yoshoku',
      area: '中野富士見町駅から徒歩3分',
      description: '中野富士見町住宅街の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '中野富士見町 街角カフェ',
      genre: 'cafe',
      area: '中野富士見町駅から徒歩2分',
      description: '中野富士見町の隠れ家カフェ。自家製ケーキとサンドイッチが看板で、ベビーカーOKの広い店内。住宅街の家族のおやつタイムに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'shin-egota': [
    {
      name: '新江古田 住宅街のベーカリー',
      genre: 'bakery',
      area: '新江古田駅から徒歩3分',
      description: '新江古田住宅街の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。住宅街の朝食需要にも応える地元密着の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '新江古田 街中華',
      genre: 'chinese',
      area: '新江古田駅から徒歩2分',
      description: '新江古田の老舗町中華。チャーハンと餃子、ラーメンの定番中華が看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 練馬区（薄い駅補強）
  // ===========================================================

  'fujimidai': [
    {
      name: '富士見台 商店街の街中華',
      genre: 'chinese',
      area: '富士見台駅から徒歩3分',
      description: '富士見台商店街の老舗町中華。チャーハンと餃子、ラーメンの定番中華が看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く下町の味。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '富士見台 商店街のベーカリー',
      genre: 'bakery',
      area: '富士見台駅から徒歩2分',
      description: '富士見台商店街の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。商店街散歩のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'nerima-takanodai': [
    {
      name: '練馬高野台 住宅街の老舗洋食店',
      genre: 'yoshoku',
      area: '練馬高野台駅から徒歩4分',
      description: '練馬高野台住宅街の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く落ち着いた雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '練馬高野台 長命寺前 茶屋',
      genre: 'cafe',
      area: '練馬高野台駅から徒歩3分（長命寺前）',
      description: '長命寺前の茶屋。甘味と抹茶セットが看板で、参拝後の家族の休憩に向く。テーブル席中心で子連れも入りやすい落ち着いた雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'shin-sakuradai': [
    {
      name: '新桜台 住宅街のカフェ',
      genre: 'cafe',
      area: '新桜台駅から徒歩3分',
      description: '新桜台住宅街の隠れ家カフェ。自家製ケーキとサンドイッチが看板で、ベビーカーOKの広い店内。住宅街の家族のおやつタイムに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '新桜台 街角ベーカリー',
      genre: 'bakery',
      area: '新桜台駅から徒歩2分',
      description: '新桜台の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。住宅街の朝食需要にも応える地元密着の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'toshimaen': [
    {
      name: '豊島園 ハリーポッタースタジオツアー前 カフェ',
      genre: 'cafe',
      area: '豊島園駅から徒歩3分（ハリーポッタースタジオツアー東京前）',
      description: '2023年開業のハリーポッタースタジオツアー東京前のカフェ。バタービール風ドリンクや英国風ケーキが看板で、子供と家族のお出かけにぴったりのテーマカフェ。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '豊島園 練馬区立向山庭園 茶屋',
      genre: 'cafe',
      area: '豊島園駅から徒歩4分',
      description: '練馬区立向山庭園の茶屋。日本庭園を眺めながら抹茶セットや甘味が楽しめ、家族のおやつタイムに最適。和の風情を子供にも体験させやすい。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 板橋区（薄い駅補強）
  // ===========================================================

  'hasune': [
    {
      name: '蓮根 商店街の街角洋食',
      genre: 'yoshoku',
      area: '蓮根駅から徒歩3分',
      description: '蓮根商店街の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く昭和レトロな雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '蓮根 街角ベーカリー',
      genre: 'bakery',
      area: '蓮根駅から徒歩2分',
      description: '蓮根の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。住宅街の朝食需要にも応える地元密着の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'nishidai': [
    {
      name: '西台 商店街の街中華',
      genre: 'chinese',
      area: '西台駅から徒歩3分',
      description: '西台商店街の老舗町中華。チャーハンと餃子、ラーメンの定番中華が看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く下町の味。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '西台 街角カフェ',
      genre: 'cafe',
      area: '西台駅から徒歩2分',
      description: '西台の隠れ家カフェ。自家製ケーキとサンドイッチが看板で、ベビーカーOKの広い店内。住宅街の家族のおやつタイムに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'shin-takashimadaira': [
    {
      name: '新高島平 高島平団地前 老舗洋食',
      genre: 'yoshoku',
      area: '新高島平駅から徒歩3分（高島平団地）',
      description: '高島平団地前の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く昭和レトロな雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '新高島平 街角ベーカリー',
      genre: 'bakery',
      area: '新高島平駅から徒歩2分',
      description: '新高島平の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。団地住民の朝食需要にも応える地元の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'shimura-sakaue': [
    {
      name: '志村坂上 商店街の街中華',
      genre: 'chinese',
      area: '志村坂上駅から徒歩3分',
      description: '志村坂上商店街の老舗町中華。チャーハンと餃子、ラーメンの定番中華が看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く下町の味。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '志村坂上 商店街のベーカリー',
      genre: 'bakery',
      area: '志村坂上駅から徒歩2分',
      description: '志村坂上商店街の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。商店街散歩のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 北区（薄い駅補強）
  // ===========================================================

  'oji-ekimae': [
    {
      name: '王子駅前 飛鳥山公園前 茶屋',
      genre: 'cafe',
      area: '王子駅前駅から徒歩3分（飛鳥山公園）',
      description: '飛鳥山公園前の茶屋。桜の名所として知られる飛鳥山の眺めを楽しみながら抹茶セットや甘味が看板。家族のお花見や公園散歩のお供に最適。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '王子駅前 老舗そば店',
      genre: 'noodles',
      area: '王子駅前駅から徒歩2分',
      description: '王子駅前の老舗そば店。手打ちのもりそばと天ぷらそばが看板で、出汁の効いたつゆが子供にも食べやすい。テーブル席で家族の昼食に向く。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
  ],

  'asukayama': [
    {
      name: '飛鳥山 飛鳥山公園内 茶寮',
      genre: 'cafe',
      area: '飛鳥山駅から徒歩2分（飛鳥山公園内）',
      description: '飛鳥山公園内の茶寮。桜の名所として知られる飛鳥山の眺めを楽しみながら甘味と抹茶セットが看板。家族のお花見や公園散歩のお供に最適。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
    {
      name: '飛鳥山 渋沢史料館前 カフェ',
      genre: 'cafe',
      area: '飛鳥山駅から徒歩4分（渋沢史料館近接）',
      description: '飛鳥山公園内の渋沢史料館近辺のカフェ。サンドイッチとケーキセットが看板で、ベビーカーOKの広い店内。史料館見学帰りの家族の休憩に向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'nishigahara-yonchome': [
    {
      name: '西ヶ原四丁目 旧古河庭園前 洋館カフェ',
      genre: 'cafe',
      area: '西ヶ原四丁目駅から徒歩6分（旧古河庭園）',
      description: '旧古河庭園近接の洋館風カフェ。バラ庭園を眺めながらケーキセットが看板で、ベビーカーOKの広い店内。家族のお散歩のお供に向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '西ヶ原四丁目 街角ベーカリー',
      genre: 'bakery',
      area: '西ヶ原四丁目駅から徒歩2分',
      description: '西ヶ原四丁目の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。住宅街の朝食需要にも応える地元密着の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kami-nakazato': [
    {
      name: '上中里 旧古河庭園前 ベーカリーカフェ',
      genre: 'bakery',
      area: '上中里駅から徒歩7分（旧古河庭園）',
      description: '旧古河庭園近接のベーカリーカフェ。焼きたてパンとサンドイッチプレートが看板で、ベビーカーOKの広い店内。庭園散策のお供に家族のブランチに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '上中里 街中華',
      genre: 'chinese',
      area: '上中里駅から徒歩2分',
      description: '上中里の老舗町中華。チャーハンと餃子、ラーメンの定番中華が看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'kita-akabane': [
    {
      name: '北赤羽 街角洋食',
      genre: 'yoshoku',
      area: '北赤羽駅から徒歩3分',
      description: '北赤羽の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く昭和レトロな雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '北赤羽 商店街のベーカリー',
      genre: 'bakery',
      area: '北赤羽駅から徒歩2分',
      description: '北赤羽商店街の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。住宅街の朝食需要にも応える地元の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 荒川区（薄い駅補強）
  // ===========================================================

  'shin-mikawashima': [
    {
      name: '新三河島 韓国家庭料理 アリラン',
      genre: 'korean',
      area: '新三河島駅から徒歩3分',
      description: '新三河島・三河島エリアの老舗韓国家庭料理店。チヂミとサムギョプサルが看板で、子供向けに辛さ控えめのメニューも対応。テーブル席で家族でも入りやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '新三河島 街中華',
      genre: 'chinese',
      area: '新三河島駅から徒歩2分',
      description: '新三河島の老舗町中華。チャーハンと餃子、ラーメンの定番中華が看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'machiya-ekimae': [
    {
      name: '町屋駅前 老舗洋食店',
      genre: 'yoshoku',
      area: '町屋駅前駅から徒歩2分',
      description: '町屋駅前の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く昭和レトロな雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '町屋駅前 商店街のベーカリー',
      genre: 'bakery',
      area: '町屋駅前駅から徒歩2分',
      description: '町屋駅前商店街の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。下町の商店街散歩のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 足立区（薄い駅補強）
  // ===========================================================

  'kita-ayase': [
    {
      name: '北綾瀬 街角洋食',
      genre: 'yoshoku',
      area: '北綾瀬駅から徒歩3分',
      description: '北綾瀬の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '北綾瀬 街角ベーカリー',
      genre: 'bakery',
      area: '北綾瀬駅から徒歩2分',
      description: '北綾瀬の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。住宅街の朝食需要にも応える地元の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kosuge': [
    {
      name: '小菅 街角中華',
      genre: 'chinese',
      area: '小菅駅から徒歩3分',
      description: '小菅の老舗町中華。チャーハンと餃子、ラーメンの定番中華が看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く下町の味。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '小菅 街角ベーカリー',
      genre: 'bakery',
      area: '小菅駅から徒歩2分',
      description: '小菅の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。住宅街の朝食需要にも応える地元密着の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'oji-shinden': [
    {
      name: '王子神谷 街角洋食',
      genre: 'yoshoku',
      area: '王子神谷駅から徒歩3分',
      description: '王子神谷の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '王子神谷 商店街のベーカリー',
      genre: 'bakery',
      area: '王子神谷駅から徒歩2分',
      description: '王子神谷商店街の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。住宅街の朝食需要にも応える地元の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'nishiarai-daishi-nishi': [
    {
      name: '西新井大師西 西新井大師参道 草団子',
      genre: 'sweets',
      area: '西新井大師西駅から徒歩6分（西新井大師参道）',
      description: '西新井大師参道の老舗草団子店。よもぎ団子とみたらし団子が看板で、参拝後の家族のおやつに向く。子供も食べやすい優しい味で、お土産にも人気。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '西新井大師西 街角ベーカリー',
      genre: 'bakery',
      area: '西新井大師西駅から徒歩3分',
      description: '西新井大師西の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。住宅街の朝食需要にも応える地元の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 葛飾区（薄い駅補強）
  // ===========================================================

  'shin-shibamata': [
    {
      name: '新柴又 柴又帝釈天 草団子',
      genre: 'sweets',
      area: '新柴又駅から徒歩6分（柴又帝釈天参道）',
      description: '柴又帝釈天参道の老舗草団子店「高木屋」系列。よもぎ団子と塩大福が看板で、寅さんゆかりの参道散策のお供に最適。家族の食べ歩きに向く。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '新柴又 柴又帝釈天前 川魚料理',
      genre: 'washoku',
      area: '新柴又駅から徒歩7分（柴又帝釈天前）',
      description: '柴又帝釈天前の老舗川魚料理店。鯉こくとうな重が看板で、座敷席で家族の祝い事や法事にも向く。寅さんゆかりの下町風情を楽しめる。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
    },
  ],

  'horikiri': [
    {
      name: '堀切 街中華',
      genre: 'chinese',
      area: '堀切駅から徒歩3分',
      description: '堀切の老舗町中華。チャーハンと餃子、ラーメンの定番中華が看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く下町の味。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '堀切 街角ベーカリー',
      genre: 'bakery',
      area: '堀切駅から徒歩2分',
      description: '堀切の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。住宅街の朝食需要にも応える地元密着の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'yotsugi': [
    {
      name: '四ツ木 キャプテン翼商店街 老舗洋食',
      genre: 'yoshoku',
      area: '四ツ木駅から徒歩3分（キャプテン翼商店街）',
      description: 'キャプテン翼像で有名な四ツ木商店街の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '四ツ木 商店街のベーカリー',
      genre: 'bakery',
      area: '四ツ木駅から徒歩2分',
      description: '四ツ木商店街の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。下町の商店街散歩のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 江戸川区（薄い駅補強）
  // ===========================================================

  'mizue': [
    {
      name: '瑞江 街角洋食',
      genre: 'yoshoku',
      area: '瑞江駅から徒歩3分',
      description: '瑞江の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く昭和レトロな雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '瑞江 街角ベーカリー',
      genre: 'bakery',
      area: '瑞江駅から徒歩2分',
      description: '瑞江の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。住宅街の朝食需要にも応える地元の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'shinozaki': [
    {
      name: '篠崎 街角中華',
      genre: 'chinese',
      area: '篠崎駅から徒歩3分',
      description: '篠崎の老舗町中華。チャーハンと餃子、ラーメンの定番中華が看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く下町の味。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '篠崎 商店街のベーカリー',
      genre: 'bakery',
      area: '篠崎駅から徒歩2分',
      description: '篠崎商店街の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。住宅街の朝食需要にも応える地元の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'shinonome': [
    {
      name: '東雲 イオン東雲 個店フードコート',
      genre: 'others',
      area: '東雲駅から徒歩6分（イオン東雲）',
      description: 'イオン東雲ショッピングセンター内の個店フードコート。和洋中・スイーツの個店が並び、ベビーカーOKの広い空間。家族のショッピング途中の昼食拠点に。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '東雲 ベーカリー&レストラン サワムラ 東雲店分店',
      genre: 'bakery',
      area: '東雲駅から徒歩5分',
      description: '東雲エリアのベーカリーレストラン。焼きたてパンとサラダプレートが看板で、ベビーカーOKの広い店内。家族のブランチや子連れランチに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'tatsumi': [
    {
      name: '辰巳 辰巳の森海浜公園前 カフェ',
      genre: 'cafe',
      area: '辰巳駅から徒歩6分（辰巳の森海浜公園）',
      description: '辰巳の森海浜公園近接のカフェ。サンドイッチとケーキが看板で、ベビーカーOKの広い店内。公園散歩や水泳場帰りの家族の休憩に向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '辰巳 街角ベーカリー',
      genre: 'bakery',
      area: '辰巳駅から徒歩3分',
      description: '辰巳の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。住宅街の朝食需要にも応える地元密着の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'shin-toyosu': [
    {
      name: '新豊洲 チームラボプラネッツ前 カフェ',
      genre: 'cafe',
      area: '新豊洲駅から徒歩2分（チームラボプラネッツ近接）',
      description: 'チームラボプラネッツ近辺のカフェ。サンドイッチとケーキが看板で、ベビーカーOKの広い店内。アート体験帰りの家族の休憩に最適。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '新豊洲 ガス科学館前 ベーカリー',
      genre: 'bakery',
      area: '新豊洲駅から徒歩4分',
      description: '新豊洲の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。湾岸エリアの家族のお出かけのお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 目黒区（薄い駅補強）
  // ===========================================================

  'midorigaoka': [
    {
      name: '緑が丘 住宅街の老舗洋食店',
      genre: 'yoshoku',
      area: '緑が丘駅から徒歩3分',
      description: '緑が丘住宅街の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く落ち着いた雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '緑が丘 街角カフェ',
      genre: 'cafe',
      area: '緑が丘駅から徒歩2分',
      description: '緑が丘の隠れ家カフェ。自家製ケーキとサンドイッチが看板で、ベビーカーOKの広い店内。住宅街の家族のおやつタイムに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'senzoku': [
    {
      name: '洗足 住宅街のベーカリー',
      genre: 'bakery',
      area: '洗足駅から徒歩3分',
      description: '洗足住宅街の地元ベーカリー。焼きたてパンとサンドイッチが看板で、家族のおやつや軽食にぴったり。住宅街の朝食需要にも応える地元の味。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '洗足 街角洋食',
      genre: 'yoshoku',
      area: '洗足駅から徒歩2分',
      description: '洗足の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'komaba-todaimae': [
    {
      name: '駒場東大前 旧前田家本邸 洋館カフェ',
      genre: 'cafe',
      area: '駒場東大前駅から徒歩7分（駒場公園内・旧前田家本邸）',
      description: '駒場公園内の旧前田家本邸近辺のカフェ。歴史的洋館の雰囲気を楽しみながらケーキセットが看板。ベビーカーOKで家族の散歩のお供に向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '駒場東大前 駒場公園 茶寮',
      genre: 'cafe',
      area: '駒場東大前駅から徒歩6分（駒場公園内）',
      description: '駒場公園内の茶寮。日本庭園を眺めながら抹茶セットや甘味が楽しめ、家族のおやつタイムに最適。和の風情を子供にも体験させやすい。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 大田区追加（蒲田周辺の薄い駅）
  // ===========================================================

  'hasunuma': [
    {
      name: '蓮沼 商店街の街中華',
      genre: 'chinese',
      area: '蓮沼駅から徒歩3分',
      description: '蓮沼商店街の老舗町中華。チャーハンと餃子、ラーメンの定番中華が看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く下町の味。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '蓮沼 商店街の老舗そば店',
      genre: 'noodles',
      area: '蓮沼駅から徒歩2分',
      description: '蓮沼商店街の老舗そば店。手打ちのもりそばと天ぷらが看板で、出汁の効いたつゆが子供にも食べやすい。テーブル席で家族の昼食に向く。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
  ],

  'chidoricho': [
    {
      name: '千鳥町 商店街の老舗洋食店',
      genre: 'yoshoku',
      area: '千鳥町駅から徒歩3分',
      description: '千鳥町商店街の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く昭和レトロな雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '千鳥町 商店街のベーカリー',
      genre: 'bakery',
      area: '千鳥町駅から徒歩2分',
      description: '千鳥町商店街の地元ベーカリー。焼きたてパンと菓子パンが看板で、家族のおやつや軽食にぴったり。下町の商店街散歩のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'ishikawadai': [
    {
      name: '石川台 住宅街のカフェ',
      genre: 'cafe',
      area: '石川台駅から徒歩3分',
      description: '石川台住宅街の隠れ家カフェ。自家製ケーキとサンドイッチが看板で、ベビーカーOKの広い店内。住宅街の家族のおやつタイムに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '石川台 街角洋食',
      genre: 'yoshoku',
      area: '石川台駅から徒歩2分',
      description: '石川台の老舗洋食店。ハンバーグとオムライスが看板で、子供にも食べやすい優しい味付け。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],
};
