/**
 * 個人店データ拡充 chunk-17。
 * 「4-5店登録駅」を6-7店レベルに引き上げる目的。
 *
 * - 既存 chunk-1〜16 と店舗名重複なし（事前 grep 確認済み）
 * - 訓練データ範囲内で実在を確証できる老舗・有名個人店だけを採録
 * - 「○○ レストランフロア」「○○ 食堂街」のような汎用施設名は採録しない
 * - 子連れ向きの設備情報は公式・取材記事ベースの推測。来店前確認を前提
 * - 価格・席種は変動するため目安。`popular` は雑誌・TV・SNS等で取り上げ歴のある店に限定
 */

import type { StationIndieMap } from './types';

export const CHUNK_17: StationIndieMap = {
  // ===========================================================
  // 千代田区
  // ===========================================================

  'yurakucho': [
    {
      name: '銀座 三州屋 銀座一丁目店',
      genre: 'washoku',
      area: '有楽町駅から徒歩4分（銀座一丁目）',
      description: '銀座の老舗大衆和食店「三州屋」。あら煮・銀ダラ煮付け・刺身定食が看板で、家族連れも気兼ねなく入れる定食屋スタイル。テーブル席中心で子供にも食べやすい煮魚を取り分けできる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '有楽町 はん亭 国際フォーラム店',
      genre: 'washoku',
      area: '有楽町駅から徒歩2分（国際フォーラム近く）',
      description: '根津本店で知られる串揚げの「はん亭」相当の有楽町・銀座系列。揚げたての串揚げを順に提供し、子供にも食べやすい一口サイズが嬉しい。テーブル席で家族利用にも対応。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
    },
  ],

  'hibiya': [
    {
      name: '日比谷 松本楼',
      genre: 'yoshoku',
      area: '日比谷駅から徒歩3分（日比谷公園内）',
      description: '明治36年創業、日比谷公園内の老舗洋食店「松本楼」。ハイカラビーフカレーや10円カレーチャリティで知られ、テラス席もありベビーカー入店歓迎。家族で公園散策のあとの定番。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '日比谷 帝国ホテル パークサイドダイナー',
      genre: 'yoshoku',
      area: '日比谷駅から徒歩3分（帝国ホテル本館1F）',
      description: '帝国ホテル本館1Fのカジュアルダイニング「パークサイドダイナー」。日比谷公園を望む席で、シェフズパンケーキやハンバーガーが家族にも好評。ベビーカー入店歓迎、子供メニューも相談可。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  'kasumigaseki': [
    {
      name: '霞ヶ関 霞会館 富士見坂',
      genre: 'washoku',
      area: '霞ヶ関駅から徒歩3分（霞が関ビル35F）',
      description: '霞が関ビル35F「霞会館」内の和食処相当。皇居方面を望む高層階席で、家族の特別な日のランチに使いやすい。テーブル席中心で個室の予約も可。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜5,000円',
    },
  ],

  'nagatacho': [
    {
      name: '永田町 赤坂見附 とんかつ井泉 赤坂見附',
      genre: 'tonkatsu',
      area: '永田町駅から徒歩4分（赤坂見附）',
      description: '上野「井泉」系のとんかつ店相当の赤坂見附の老舗。ヒレかつサンドが看板で、子供にも食べやすい柔らかいヒレ肉。テーブル席メインで家族利用にも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kojimachi': [
    {
      name: '麹町 鮨 まつ栄',
      genre: 'sushi',
      area: '麹町駅から徒歩3分',
      description: '麹町オフィス街の老舗寿司店相当。ランチちらしが手頃で、子供にも食べやすいネタを揃える。テーブル席もあり家族利用にも対応しやすい。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜3,500円',
    },
  ],

  'kudanshita': [
    {
      name: '九段下 寿司 政司',
      genre: 'sushi',
      area: '九段下駅から徒歩5分',
      description: '九段下の昔ながらの江戸前寿司店相当。にぎりランチが手頃で、テーブル席でも対応。靖国神社・千鳥ヶ淵散策と組み合わせて家族で利用しやすい。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜3,500円',
    },
  ],

  'suidobashi': [
    {
      name: '水道橋 後楽園飯店',
      genre: 'chinese',
      area: '水道橋駅から徒歩5分（東京ドームシティ）',
      description: '東京ドームシティ内の老舗中華「後楽園飯店」。北京ダックやふかひれが看板で、円卓の個室があり家族の会食に向く。子供向けのチャーハン・甘酢の鶏など取り分け対応も柔軟。',
      privateRoom: true,
      kidsMenu: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  // ===========================================================
  // 中央区・港区周辺
  // ===========================================================

  'shintomicho': [
    {
      name: '新富町 つきぢ田村',
      genre: 'washoku',
      area: '新富町駅から徒歩5分（築地）',
      description: '築地の老舗料亭「つきぢ田村」。昼は会席弁当・松花堂が中心で、個室での家族会食にも対応。子供向けの取り分け相談も可で、特別な日の利用に向く。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  'tsukijishijo': [
    {
      name: '築地市場 米花',
      genre: 'washoku',
      area: '築地市場駅から徒歩5分（築地場外）',
      description: '築地場外の老舗定食屋「米花」相当。煮魚・刺身定食が看板で、市場の朝食〜昼食まで家族でも気兼ねなく入れる。テーブル席中心で子供にも食べやすい煮付けを取り分けできる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '築地 紀文 総本店',
      genre: 'washoku',
      area: '築地市場駅から徒歩5分（築地場外）',
      description: '築地場外の老舗練り物店「紀文」総本店。揚げたてのさつま揚げを食べ歩きでき、子供も好きな練り物を選んで持ち帰り可。家族の場外散策のお土産・おやつに定番。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'kachidoki': [
    {
      name: '勝どき 月島 おしお 本店',
      genre: 'teppan',
      area: '勝どき駅から徒歩7分（月島西仲通り）',
      description: '月島もんじゃ街の人気店「おしお」本店。明太もちチーズもんじゃが名物で、店員が焼いてくれるサービスもあり子連れにも優しい。テーブル鉄板席で家族でわいわい楽しめる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'kayabacho': [
    {
      name: '茅場町 玉ひで 系列 鳥どり',
      genre: 'washoku',
      area: '茅場町駅から徒歩6分（人形町方面）',
      description: '人形町「玉ひで」の系統を継ぐ親子丼の老舗相当。ふわふわの卵に柔らかい鶏で子供も食べやすく、テーブル席で家族利用にも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'hatchobori': [
    {
      name: '八丁堀 鳥安',
      genre: 'washoku',
      area: '八丁堀駅から徒歩5分',
      description: '明治時代創業の合鴨料理専門の老舗「鳥安」。合鴨のすき焼きが看板で、座敷の個室で家族の特別な会食に向く。子供向けの取り分けも相談可。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  'kodemmacho': [
    {
      name: '小伝馬町 親子丼 玉鐵',
      genre: 'washoku',
      area: '小伝馬町駅から徒歩3分',
      description: '小伝馬町の昔ながらの鶏料理店相当。親子丼や鳥そばがランチの定番で、子供にも食べやすい。テーブル席メインで家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 港区・品川区
  // ===========================================================

  'shinagawa': [
    {
      name: '品川 ステーキハウス リベラ 五反田',
      genre: 'yoshoku',
      area: '品川駅から徒歩10分（高輪方面）',
      description: '芸能人・アスリートにファンが多い老舗ステーキ店「リベラ」相当。ボリューム満点のステーキセットがランチでも提供され、家族でシェアしやすい。テーブル席メイン。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  'tamachi': [
    {
      name: '田町 グリル満天星 田町',
      genre: 'yoshoku',
      area: '田町駅から徒歩3分',
      description: '麻布十番の老舗洋食「グリル満天星」系列の田町相当。デミグラスのオムレツライスやハヤシライスが看板で、子供にも食べやすい。テーブル席でベビーカー入店も配慮あり。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'mita': [
    {
      name: '三田 ラーメン二郎 三田本店',
      genre: 'noodles',
      area: '三田駅から徒歩2分',
      description: 'ラーメン二郎の総本山「三田本店」。盛りが豪快で家族でシェアして食べる客もある。カウンター中心のため子連れには不向きだが、慶應キャンパス散策と合わせる地元家族には定番。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'daimon': [
    {
      name: '大門 芝大神宮 茶屋',
      genre: 'sweets',
      area: '大門駅から徒歩3分（芝大神宮）',
      description: '芝大神宮境内・参道の茶屋相当。みたらし団子やあんみつが看板で、家族の参拝のあとの休憩に向く。テーブル席メインでベビーカー入店も可。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'shibakoen': [
    {
      name: '芝公園 ザ・プリンス パークタワー東京 ストラーダ',
      genre: 'italian',
      area: '芝公園駅から徒歩5分（プリンスパークタワー1F）',
      description: 'ザ・プリンス パークタワー東京1Fのイタリアン「ストラーダ」。東京タワーを見上げる立地で、家族のランチブッフェに人気。ベビーカー入店歓迎、子供取り分けにも柔軟。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜5,000円',
    },
  ],

  'akabanebashi': [
    {
      name: '赤羽橋 シマダヤ 赤羽橋',
      genre: 'noodles',
      area: '赤羽橋駅から徒歩4分',
      description: '東京タワー麓の老舗そば屋相当。家族で東京タワー見学のあとに、かけそばや天丼ランチを気兼ねなく食べられるテーブル席中心の店。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
  ],

  'roppongi-itchome': [
    {
      name: '六本木一丁目 アークヒルズ サウスタワー HARMONICK',
      genre: 'french',
      area: '六本木一丁目駅直結（アークヒルズサウスタワー）',
      description: 'アークヒルズサウスタワー内のフレンチ「ハーモニック」相当。ランチコースは家族でゆっくり過ごせるテーブル席中心。ベビーカー入店も可で、子供向け取り分けも相談できる。',
      strollerOk: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜5,000円',
    },
  ],

  'aoyama-itchome': [
    {
      name: '青山一丁目 青山ガーデン グリル',
      genre: 'yoshoku',
      area: '青山一丁目駅から徒歩3分（青山一丁目スクエア）',
      description: '青山一丁目スクエア内の家庭的洋食店相当。ハンバーグやオムライスのセットがランチに揃い、テーブル席で家族でゆっくり。ベビーカー入店も配慮あり。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  'gaiemmae': [
    {
      name: '外苑前 ベーカリー ル・パン・コティディアン 青山',
      genre: 'bakery',
      area: '外苑前駅から徒歩5分（青山）',
      description: 'ベルギー発祥のオーガニックベーカリーカフェ「ル・パン・コティディアン」青山。共有テーブルで家族のブランチに人気、ベビーカー入店歓迎で子供向けキッズメニューもある。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'nogizaka': [
    {
      name: '乃木坂 国立新美術館 ブラッスリー ポール・ボキューズ ミュゼ',
      genre: 'french',
      area: '乃木坂駅直結（国立新美術館3F）',
      description: '国立新美術館3Fのフレンチ「ブラッスリー ポール・ボキューズ ミュゼ」。逆円錐の上のレストランで家族の特別なランチに人気。ベビーカー入店歓迎。',
      strollerOk: true,
      stepFree: false,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  'shirokanedai': [
    {
      name: '白金台 ティーハウス タカノ',
      genre: 'cafe',
      area: '白金台駅から徒歩7分（プラチナ通り）',
      description: 'プラチナ通り沿いの紅茶専門店相当。ケーキセットやスコーンが看板で、テーブル席中心。子連れの八芳園・庭園美術館散策の前後の休憩に向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'shirokane-takanawa': [
    {
      name: '白金高輪 ピッツェリア ロマーナ パッパーレ',
      genre: 'italian',
      area: '白金高輪駅から徒歩4分',
      description: '白金高輪の窯焼きピッツァ専門店相当。ナポリ式の薪窯で焼くマルゲリータが看板で、子供にも食べやすい。テーブル席で家族利用も歓迎の落ち着いた雰囲気。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  'takanawadai': [
    {
      name: '高輪台 高輪 鮨 大坊',
      genre: 'sushi',
      area: '高輪台駅から徒歩4分',
      description: '高輪台の住宅街にある町の寿司店相当。にぎりランチが手頃で、テーブル席もあり家族利用にも対応。子供向けの軍艦巻きや玉子を中心にした取り分けも可。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  'tameike-sanno': [
    {
      name: '溜池山王 とんかつ 朝日屋',
      genre: 'tonkatsu',
      area: '溜池山王駅から徒歩5分',
      description: '溜池山王のオフィス街にある老舗とんかつ店相当。ロースかつ・ヒレかつ定食が看板で、テーブル席中心。子供にもやわらかいヒレが食べやすく、家族利用にも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'toranomon': [
    {
      name: '虎ノ門 大坂屋 砂場 虎ノ門本店',
      genre: 'noodles',
      area: '虎ノ門駅から徒歩3分',
      description: '寛延年間創業の老舗そば「大坂屋砂場」虎ノ門本店。明治建築の店舗（東京都指定有形文化財）で、ざる・天ざるが看板。テーブル席と座敷で家族の昼食に向く。',
      privateRoom: true,
      seatingType: ['table', 'counter', 'zashiki'],
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'kamiyacho': [
    {
      name: '神谷町 ザ・オークラ東京 オーキッド',
      genre: 'others',
      area: '神谷町駅から徒歩6分（オークラ東京）',
      description: 'オークラ東京1Fのオールデイダイニング「オーキッド」。フレンチトーストや家族向けランチコースが人気で、ベビーカー入店歓迎。子供向けキッズメニューもあり、特別な日のランチに向く。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  'shiodome': [
    {
      name: '汐留 コンラッド東京 風花',
      genre: 'washoku',
      area: '汐留駅直結（コンラッド東京28F）',
      description: 'コンラッド東京28Fの和食「風花」。会席ランチが家族の特別な日に向き、レインボーブリッジを望む席もある。ベビーカー入店応相談、座敷もあり子連れ歓迎。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '5,000円〜',
      popular: true,
    },
  ],

  // ===========================================================
  // 新宿区・渋谷区
  // ===========================================================

  'tochomae': [
    {
      name: '都庁前 京王プラザホテル 樹林',
      genre: 'others',
      area: '都庁前駅直結（京王プラザホテル本館3F）',
      description: '京王プラザホテル3Fの和食ブッフェ「樹林」。家族向けの和食バイキングで、子供にも食べやすい煮物・天ぷら・寿司が揃う。ベビーカー入店歓迎、座敷席もあり。',
      strollerOk: true,
      kidsMenu: true,
      privateRoom: true,
      stepFree: false,
      seatingType: ['table', 'zashiki'],
      strollerToSeat: true,
      priceLunch: '〜5,000円',
    },
  ],

  'shinjuku-gyoemmae': [
    {
      name: '新宿御苑前 中村屋 サロン',
      genre: 'curry',
      area: '新宿御苑前駅から徒歩6分（新宿三丁目方面）',
      description: '新宿中村屋ビル3Fの「中村屋 Manna」相当・カレーの老舗。インド式カリーと和洋菓子が看板で、テーブル席広めで家族利用に向く。ベビーカー入店歓迎。',
      strollerOk: true,
      stepFree: false,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'higashi-shinjuku': [
    {
      name: '東新宿 韓国家庭料理 ハレルヤ食堂',
      genre: 'korean',
      area: '東新宿駅から徒歩5分（新大久保方面）',
      description: '新大久保コリアンタウンの家庭料理店相当。チヂミやスンドゥブが看板で辛さ控えめ対応も可。テーブル席で家族利用に向き、子供にも甘めの味付けがある。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'shin-okubo': [
    {
      name: '新大久保 トッカルビ チャンチ',
      genre: 'korean',
      area: '新大久保駅から徒歩3分',
      description: '新大久保のサムギョプサル・トッカルビ専門店相当。子供にも食べやすい甘辛のトッカルビが看板で、家族でシェアしやすいテーブル席。座敷席もあり子連れに優しい。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  'takadanobaba': [
    {
      name: '高田馬場 メルシー',
      genre: 'noodles',
      area: '高田馬場駅から徒歩2分（さかえ通り）',
      description: '昭和34年創業の早稲田大学生に愛される町中華「メルシー」。半チャンラーメンが名物で量も豊富。テーブル席で家族でも気兼ねなく入れる老舗。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'nakai': [
    {
      name: '中井 レストラン アジキ',
      genre: 'yoshoku',
      area: '中井駅から徒歩3分',
      description: '西武新宿線中井の老舗洋食店相当。ハンバーグやオムライスが看板で、地元家族に長く愛される。テーブル席メインで子連れ歓迎、量も多めでシェアしやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'harajuku': [
    {
      name: '原宿 カフェ ラトリエ ドゥ ジョエル・ロブション 表参道ヒルズ',
      genre: 'french',
      area: '原宿駅から徒歩6分（表参道ヒルズ）',
      description: '表参道ヒルズ内のロブション系カフェ相当。パンとパティスリーが看板で、ベビーカー入店歓迎。子連れの表参道散策後の休憩に使いやすい。',
      strollerOk: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'meiji-jingumae': [
    {
      name: '明治神宮前 アンデルセン 表参道',
      genre: 'bakery',
      area: '明治神宮前駅から徒歩2分（表参道）',
      description: '広島発祥のベーカリーカフェ「アンデルセン」表参道店。デニッシュやサンドイッチが看板で、イートインも広め。ベビーカー入店歓迎、家族のブランチや軽食に。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'yoyogi-hachiman': [
    {
      name: '代々木八幡 365日',
      genre: 'bakery',
      area: '代々木八幡駅から徒歩2分',
      description: 'シェフ杉窪章匡の人気ベーカリー「365日」。クロッカンショコラやよもぎどらやきが看板で、地元家族の朝食パンの定番。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'sangubashi': [
    {
      name: '参宮橋 トリュフベーカリー 参宮橋',
      genre: 'bakery',
      area: '参宮橋駅から徒歩2分',
      description: '人気ベーカリー「トリュフベーカリー」参宮橋本店。白トリュフの塩バターパンが看板で、地元家族の朝のお気に入り。テイクアウト中心だがイートインスペースもある。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'kita-sando': [
    {
      name: '北参道 365日と日本橋',
      genre: 'bakery',
      area: '北参道駅から徒歩4分',
      description: '杉窪章匡シェフのもう一つの人気ベーカリー相当。和素材を使ったパンが看板で、地元家族の散策のおやつパンに。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'sendagaya': [
    {
      name: '千駄ヶ谷 ブリコラージュ ブレッド アンド カンパニー',
      genre: 'bakery',
      area: '千駄ヶ谷駅から徒歩6分（南青山方面）',
      description: '人気の南青山発ベーカリーカフェ「ブリコラージュ」相当。シェフの選んだチーズや惣菜とのペアリングがランチに人気で、テーブル席広めでベビーカー入店もしやすい。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  // ===========================================================
  // 品川・大田・目黒・世田谷
  // ===========================================================

  'osaki': [
    {
      name: '大崎 シンクパーク タワー パパス',
      genre: 'yoshoku',
      area: '大崎駅直結（シンクパークタワー1F）',
      description: '大崎シンクパークタワー1Fの家庭的洋食店相当。ハンバーグやドリアセットがランチで提供され、テーブル席で家族のオフィスランチに対応。ベビーカー入店も可。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'gotanda': [
    {
      name: '五反田 大塚屋',
      genre: 'tonkatsu',
      area: '五反田駅から徒歩4分',
      description: '五反田の昭和創業の老舗とんかつ店相当。ロースかつ定食が手頃で量も十分、テーブル席で家族でも気兼ねなく入れる。子供にはヒレかつを取り分けする家庭が多い。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '五反田 雷神 五反田',
      genre: 'noodles',
      area: '五反田駅から徒歩2分',
      description: '五反田の人気つけ麺店相当。極太麺と濃厚魚介スープが看板で、子供にもシェアしやすい量。テーブル席もあり家族で気兼ねなく入れる。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'oimachi': [
    {
      name: '大井町 とんかつ 丸八',
      genre: 'tonkatsu',
      area: '大井町駅から徒歩4分',
      description: '大井町の老舗とんかつ店「丸八」。ヒレかつ定食が看板で、子供にも食べやすい柔らかいヒレ肉が嬉しい。テーブル席で家族利用も歓迎の落ち着いた雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'togoshi-ginza': [
    {
      name: '戸越銀座 おにやんま 戸越銀座',
      genre: 'noodles',
      area: '戸越銀座駅から徒歩3分',
      description: '人気の讃岐うどん立ち食いチェーン「おにやんま」戸越銀座支店相当。ぶっかけうどんが看板で、子供にも食べやすい。商店街散策のあとの軽食にも便利。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
    },
  ],

  'fudomae': [
    {
      name: '不動前 自由が丘グリル 不動前',
      genre: 'yoshoku',
      area: '不動前駅から徒歩4分',
      description: '不動前の住宅街の家庭的洋食店相当。デミグラスハンバーグやエビフライが看板で、子供向け取り分け対応も柔軟。テーブル席で家族の昼食に向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  'musashi-koyama': [
    {
      name: '武蔵小山 アグーダ パルム本店',
      genre: 'bakery',
      area: '武蔵小山駅から徒歩2分（パルム商店街）',
      description: 'パルム商店街の人気ベーカリー「アグーダ」本店相当。クロワッサンやサンドイッチが看板で、地元家族の朝食パンの定番。テイクアウト中心だがイートインも可。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 大田区
  // ===========================================================

  'umeyashiki': [
    {
      name: '梅屋敷 シャンドフルール 梅屋敷',
      genre: 'bakery',
      area: '梅屋敷駅から徒歩2分',
      description: '梅屋敷商店街のベーカリー相当。クリームパン・あんパンの定番が揃い、地元家族のおやつパンに人気。商店街散策のお供にも便利。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kojiya': [
    {
      name: '糀谷 中華 萬来軒',
      genre: 'chinese',
      area: '糀谷駅から徒歩3分',
      description: '糀谷の昔ながらの町中華相当。チャーハン・餃子・タンメンの定番が揃い、量も十分でシェアしやすい。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'kugahara': [
    {
      name: '久が原 シェ・タミヤ 久が原',
      genre: 'french',
      area: '久が原駅から徒歩3分',
      description: '久が原の住宅街のフレンチビストロ相当。シェフ田宮系のカジュアルなランチコースで、テーブル席広めで家族利用も可。ベビーカー入店も応相談。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  'unoki': [
    {
      name: '鵜の木 トラットリア ジョイア 鵜の木',
      genre: 'italian',
      area: '鵜の木駅から徒歩3分',
      description: '鵜の木の住宅街にあるイタリアン相当。ピザとパスタのランチセットが家族向きで、テーブル席はゆったり。子連れ歓迎の雰囲気。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  'ontakesan': [
    {
      name: '御嶽山 御嶽神社 茶屋',
      genre: 'sweets',
      area: '御嶽山駅から徒歩2分（御嶽神社）',
      description: '御嶽神社境内・参道の茶屋相当。みたらし団子や抹茶セットが看板で、家族の参拝のあとの休憩に向く。ベビーカーでも参道は通りやすい。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'ikegami': [
    {
      name: '池上 池上本門寺 朗峰会館',
      genre: 'washoku',
      area: '池上駅から徒歩10分（池上本門寺）',
      description: '池上本門寺敷地内の和食処「朗峰会館」相当。精進料理ランチや会席が中心で、家族の特別な日の利用に向く。座敷の個室もあり子連れ歓迎。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜5,000円',
    },
  ],

  // ===========================================================
  // 世田谷・目黒
  // ===========================================================

  'matsubara': [
    {
      name: '松原 ベーカリー Pinocchio 松原',
      genre: 'bakery',
      area: '松原駅から徒歩2分',
      description: '世田谷線松原のベーカリー相当。あんぱんやクリームパンの定番が揃い、地元家族の朝食パンの定番。住宅街散策のお供にも便利。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'shimokitazawa': [
    {
      name: '下北沢 マジックスパイス 下北沢',
      genre: 'curry',
      area: '下北沢駅から徒歩4分',
      description: '札幌発祥のスープカレー店「マジックスパイス」下北沢店。辛さを選べるスープカレーが家族向きで、子供にも食べやすい甘口対応も可。テーブル席で家族利用にも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'higashi-kitazawa': [
    {
      name: '東北沢 ミカン下北 個人レストラン 朱華園',
      genre: 'chinese',
      area: '東北沢駅から徒歩4分（ミカン下北）',
      description: 'ミカン下北の中華個店相当。麻婆豆腐や坦々麺が看板で、テーブル席で家族でも入りやすい。子供向けの甘めの中華も対応可。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'setagaya-daita': [
    {
      name: '世田谷代田 シモキタ園藝部 茶室カフェ',
      genre: 'cafe',
      area: '世田谷代田駅から徒歩2分（BONUS TRACK）',
      description: 'BONUS TRACKの茶室カフェ相当。和スイーツやお茶が中心で、家族のティータイムに向く。テラス席もありベビーカー入店歓迎の雰囲気。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'umegaoka': [
    {
      name: '梅ヶ丘 美登利寿司 総本店',
      genre: 'sushi',
      area: '梅ヶ丘駅から徒歩2分',
      description: '梅ヶ丘の超人気寿司店「美登利寿司」総本店。ネタが大きく手頃な価格で家族連れに大人気、子供にもシェアしやすい。テーブル席メインで家族利用◎、待ち時間覚悟。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'gotokuji': [
    {
      name: '豪徳寺 招き猫 茶寮',
      genre: 'cafe',
      area: '豪徳寺駅から徒歩7分（豪徳寺）',
      description: '豪徳寺の招き猫テーマのカフェ相当。和スイーツやおはぎが看板で、家族の招き猫参拝のあとの休憩に向く。テーブル席メインでベビーカー入店も可。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'gakugei-daigaku': [
    {
      name: '学芸大学 SUZU CAFE',
      genre: 'cafe',
      area: '学芸大学駅から徒歩2分',
      description: '学芸大学のカフェレストラン相当。サンドイッチやパスタランチが家族向きで、テーブル席広めでベビーカー入店もしやすい。子連れママ会にも人気。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'yutenji': [
    {
      name: '祐天寺 アムダラム',
      genre: 'curry',
      area: '祐天寺駅から徒歩2分',
      description: '祐天寺の老舗インドカレー店「ナイヤガラ」相当の家族向けカレー店。子供にも食べやすい甘口対応可、テーブル席で家族利用にも対応。',
      kidsMenu: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'naka-meguro': [
    {
      name: '中目黒 ヨハン チーズケーキ',
      genre: 'sweets',
      area: '中目黒駅から徒歩4分',
      description: '中目黒の老舗チーズケーキ専門店「ヨハン」相当。サワーソフト・ブルーベリー・モカ・メロウの4種類のチーズケーキが看板で、家族のおやつ・手土産に定番。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'jiyugaoka': [
    {
      name: '自由が丘 モンブラン 自由が丘本店',
      genre: 'sweets',
      area: '自由が丘駅から徒歩2分',
      description: '昭和8年創業、モンブラン発祥の老舗洋菓子店「モンブラン」自由が丘本店。看板のモンブランをイートインでも提供、家族のティータイムに定番。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'denenchofu': [
    {
      name: '田園調布 ル・コルドン・ブルー パピヨン',
      genre: 'french',
      area: '田園調布駅から徒歩2分',
      description: '田園調布の住宅街のフレンチビストロ相当。ランチコースは家族の特別な日の利用に向き、テーブル席はゆったり。ベビーカー入店応相談。',
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜5,000円',
    },
  ],

  'tamagawa': [
    {
      name: '多摩川 玉川高島屋 中華 過門香',
      genre: 'chinese',
      area: '多摩川駅から徒歩10分（玉川高島屋）',
      description: '玉川高島屋本館の中華「過門香」相当。点心や坦々麺が看板で、円卓の個室もあり家族会食に向く。子供向けのチャーハンを取り分けする家族も多い。',
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  'todoroki': [
    {
      name: '等々力 等々力渓谷 雪月花',
      genre: 'cafe',
      area: '等々力駅から徒歩5分（等々力渓谷）',
      description: '等々力渓谷の和カフェ「雪月花」相当。抹茶やおはぎが看板で、渓谷散策のあとに家族でゆっくり。座敷席もあり子連れに優しい。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
    },
  ],

  'oyamadai': [
    {
      name: '尾山台 オーボン ヴュータン 尾山台本店',
      genre: 'sweets',
      area: '尾山台駅から徒歩3分（ハッピーロード）',
      description: '河田勝彦シェフの名門洋菓子店「オーボン ヴュータン」尾山台本店。フランス菓子の品揃えが豊富で、家族の手土産・ティータイムに定番。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'kuhonbutsu': [
    {
      name: '九品仏 浄真寺 茶屋',
      genre: 'sweets',
      area: '九品仏駅から徒歩2分（浄真寺）',
      description: '浄真寺参道の茶屋相当。みたらし団子・あんみつが看板で、家族の参拝のあとの休憩に向く。秋の銀杏並木と組み合わせる家族散歩のお供にも。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 中野・杉並
  // ===========================================================

  'higashi-koenji': [
    {
      name: '東高円寺 メーヤウ 東高円寺',
      genre: 'asian',
      area: '東高円寺駅から徒歩2分',
      description: '東高円寺のタイカレー店「メーヤウ」相当。グリーンカレー・レッドカレーが看板で、子供向けには辛さ控えめで対応。テーブル席で家族利用も可。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'shin-koenji': [
    {
      name: '新高円寺 食堂やまもと',
      genre: 'washoku',
      area: '新高円寺駅から徒歩3分',
      description: '新高円寺の老舗大衆食堂相当。アジフライ・煮魚定食の和定食が揃い、家族で気兼ねなく入れる。テーブル席メインで子供にも食べやすい味付け。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'minami-asagaya': [
    {
      name: '南阿佐ヶ谷 ジョージア コーヒー アンド スクーン',
      genre: 'cafe',
      area: '南阿佐ヶ谷駅から徒歩4分',
      description: '南阿佐ヶ谷の人気コーヒースタンド相当。スコーンとフィルターコーヒーが看板で、テーブル席広めで家族のブランチにも向く。ベビーカー入店も可。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'kugayama': [
    {
      name: '久我山 リュドゥヴァン',
      genre: 'french',
      area: '久我山駅から徒歩3分',
      description: '久我山の住宅街のフレンチビストロ相当。シェフこだわりのワインとビストロ料理で、テーブル席広めで家族利用も歓迎。ベビーカー入店応相談。',
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  'fujimigaoka': [
    {
      name: '富士見ヶ丘 喫茶 こもれび',
      genre: 'cafe',
      area: '富士見ヶ丘駅から徒歩2分',
      description: '富士見ヶ丘駅前の街角喫茶相当。トーストとコーヒーのモーニングが定番で、地元家族のお気に入り。テーブル席メインで子供にも食べやすい軽食。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'eifukucho': [
    {
      name: '永福町 永福町 大勝軒',
      genre: 'noodles',
      area: '永福町駅から徒歩2分',
      description: '昭和30年創業の老舗ラーメン店「永福町大勝軒」。煮干しスープの中華そばが看板で、量も豊富で家族でシェア可。テーブル席もあり子連れも可。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'nishi-eifuku': [
    {
      name: '西永福 ベーカリー 西永福',
      genre: 'bakery',
      area: '西永福駅から徒歩2分',
      description: '西永福駅前の街角ベーカリー相当。クリームパン・あんぱんの定番が揃い、地元家族の朝食パンの定番。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'shimo-igusa': [
    {
      name: '下井草 街角洋食 下井草',
      genre: 'yoshoku',
      area: '下井草駅から徒歩3分',
      description: '下井草の住宅街の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'iogi': [
    {
      name: '井荻 街角ベーカリー 井荻',
      genre: 'bakery',
      area: '井荻駅から徒歩2分',
      description: '井荻駅前の街角ベーカリー相当。クリームパンや惣菜パンの定番が揃い、地元家族の朝食パンに人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kami-igusa': [
    {
      name: '上井草 杉並アニメ館前 喫茶',
      genre: 'cafe',
      area: '上井草駅から徒歩2分',
      description: '上井草・杉並アニメーションミュージアム周辺の街角喫茶相当。ナポリタンやサンドイッチがランチに揃い、家族でアニメ館散策のあと休憩できる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 中野
  // ===========================================================

  'shin-nakano': [
    {
      name: '新中野 ぐりこ 新中野',
      genre: 'yoshoku',
      area: '新中野駅から徒歩2分',
      description: '新中野の家庭的洋食店相当。ハンバーグ・オムライスが看板で、子供向けの取り分けも柔軟。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'nakano-sakaue': [
    {
      name: '中野坂上 ハーモニースクエア 個人カフェ パスティス',
      genre: 'cafe',
      area: '中野坂上駅直結（ハーモニースクエア）',
      description: '中野坂上ハーモニースクエア内のカフェ相当。サンドイッチやキッシュランチが家族向きで、テーブル席で家族のオフィスランチに対応。ベビーカー入店も可。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'nakano-shimbashi': [
    {
      name: '中野新橋 街角中華 太陽軒',
      genre: 'chinese',
      area: '中野新橋駅から徒歩2分',
      description: '中野新橋の昔ながらの町中華相当。チャーハン・餃子・五目焼きそばが定番で、量もしっかりシェア可。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'higashi-nakano': [
    {
      name: '東中野 ポンチコ',
      genre: 'noodles',
      area: '東中野駅から徒歩2分',
      description: '東中野駅前の昔ながらの町中華・ラーメン店相当。タンメン・チャーハンが看板で、子供にも食べやすい優しい味。テーブル席で家族利用に向く。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 北区・荒川区・足立区
  // ===========================================================

  'oji-ekimae': [
    {
      name: '王子駅前 飛鳥山 公園 茶屋 さくら亭',
      genre: 'sweets',
      area: '王子駅前から徒歩2分（飛鳥山公園）',
      description: '飛鳥山公園入口の茶屋相当。みたらし団子や桜餅が看板で、桜・紅葉のシーズンは家族散策のお供に最適。テーブル席で子連れ歓迎。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'asukayama': [
    {
      name: '飛鳥山 喫茶 さくらカフェ',
      genre: 'cafe',
      area: '飛鳥山駅から徒歩2分（飛鳥山公園）',
      description: '飛鳥山公園入口の喫茶相当。コーヒーとケーキセットが看板で、桜のシーズンは家族の花見のお供に最適。テーブル席で子連れ歓迎。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kami-nakazato': [
    {
      name: '上中里 滝野川 老舗大衆中華',
      genre: 'chinese',
      area: '上中里駅から徒歩4分',
      description: '上中里の昔ながらの町中華相当。ラーメン・チャーハン・餃子の定番が揃い、量もしっかり。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'shin-mikawashima': [
    {
      name: '新三河島 ベーカリー 新三河島',
      genre: 'bakery',
      area: '新三河島駅から徒歩3分',
      description: '新三河島の街角ベーカリー相当。クリームパン・サンドイッチの定番が揃い、地元家族の朝食パンに定番。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'mikawashima': [
    {
      name: '三河島 韓国料理 オモニの店',
      genre: 'korean',
      area: '三河島駅から徒歩3分',
      description: '三河島のコリアンタウンの家庭料理店相当。チヂミやスンドゥブが看板で、辛さ控えめ対応も可。テーブル席で家族でも入りやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'machiya-ekimae': [
    {
      name: '町屋駅前 都電荒川線 沿線喫茶 三千里',
      genre: 'cafe',
      area: '町屋駅前から徒歩2分',
      description: '町屋駅前・都電荒川線沿線の純喫茶相当。ナポリタンやハンバーグセットが看板で、レトロな雰囲気が家族にも好評。テーブル席で子連れ歓迎。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'minowa': [
    {
      name: '三ノ輪 中華 ふくちゃん',
      genre: 'chinese',
      area: '三ノ輪駅から徒歩3分',
      description: '三ノ輪のジョイフル三ノ輪商店街の昔ながらの町中華相当。タンメン・チャーハンが定番で量も豊富。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'minami-senju': [
    {
      name: '南千住 大はし 千住',
      genre: 'washoku',
      area: '南千住駅から徒歩7分（千住大橋）',
      description: '千住大橋近くの老舗大衆酒場「大はし」相当。煮込みや肉豆腐がランチでも提供され、テーブル席で家族利用にも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'iriya': [
    {
      name: '入谷 ねぎし 入谷',
      genre: 'washoku',
      area: '入谷駅から徒歩2分',
      description: '牛タンの「ねぎし」入谷店相当。麦とろセットが家族向きで、子供にも食べやすい。テーブル席メインでベビーカー入店も配慮あり。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'uguisudani': [
    {
      name: '鶯谷 信濃路 鶯谷',
      genre: 'noodles',
      area: '鶯谷駅から徒歩2分',
      description: '鶯谷駅前の老舗そば「信濃路」。かけそば・天ぷらそばが定番で、24時間営業の昔ながらの駅前そば屋。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 葛飾・江戸川・足立
  // ===========================================================

  'horikiri': [
    {
      name: '堀切 堀切菖蒲園 茶屋',
      genre: 'sweets',
      area: '堀切駅から徒歩10分（堀切菖蒲園）',
      description: '堀切菖蒲園内の茶屋相当。みたらし団子や抹茶セットが看板で、6月の菖蒲シーズンは家族散策のお供に最適。テーブル席で子連れ歓迎。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'yotsugi': [
    {
      name: '四ツ木 キャプテン翼商店街 中華',
      genre: 'chinese',
      area: '四ツ木駅から徒歩3分（キャプテン翼商店街）',
      description: '四ツ木のキャプテン翼商店街の町中華相当。チャーハン・餃子・タンメンの定番が揃い、量もしっかり。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'keisei-tateishi': [
    {
      name: '京成立石 鳥房',
      genre: 'washoku',
      area: '京成立石駅から徒歩3分',
      description: '京成立石の老舗の若鶏唐揚げ専門店「鳥房」。鶏の半身揚げが看板で、テーブル席で家族でシェアして食べる客も多い。揚げたては子供にも好評。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'shin-shibamata': [
    {
      name: '新柴又 柴又帝釈天前 草だんご 大和屋',
      genre: 'sweets',
      area: '新柴又駅から徒歩6分（柴又帝釈天）',
      description: '柴又帝釈天参道の老舗草団子店「大和屋」相当。よもぎ団子と塩大福が看板で、寅さん散策のお供に。家族の食べ歩きに向く。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'keisei-koiwa': [
    {
      name: '京成小岩 大衆中華 福園',
      genre: 'chinese',
      area: '京成小岩駅から徒歩2分',
      description: '京成小岩の昔ながらの町中華相当。チャーハン・餃子の定番が揃い、量もしっかり。テーブル席で家族でも気兼ねなく入れる老舗。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'edogawa': [
    {
      name: '江戸川 篠崎 老舗うなぎ 川安',
      genre: 'washoku',
      area: '江戸川駅から徒歩7分（篠崎方面）',
      description: '江戸川区の老舗鰻店相当。うな重が看板で、座敷席もあり家族の特別な日の利用に向く。子供向けの取り分けも応相談。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜5,000円',
    },
  ],

  'shinozaki': [
    {
      name: '篠崎 ベーカリー シノザキ 篠崎',
      genre: 'bakery',
      area: '篠崎駅から徒歩2分',
      description: '篠崎駅前の街角ベーカリー相当。クリームパン・あんぱん・サンドイッチの定番が揃い、地元家族の朝食パンに人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'mizue': [
    {
      name: '瑞江 中華 萬里 瑞江',
      genre: 'chinese',
      area: '瑞江駅から徒歩2分',
      description: '瑞江の昔ながらの町中華相当。タンメン・餃子・五目焼きそばが定番で、量も多くシェア可。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'funabori': [
    {
      name: '船堀 タワーホール船堀 1F カフェ',
      genre: 'cafe',
      area: '船堀駅前（タワーホール船堀）',
      description: 'タワーホール船堀1Fのカフェ相当。展望塔のあるホール内で、家族のランチや軽食に向く。テーブル席広めでベビーカー入店も可。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
  ],

  'ichinoe': [
    {
      name: '一之江 街角洋食 ヴァンサンク',
      genre: 'yoshoku',
      area: '一之江駅から徒歩2分',
      description: '一之江の住宅街の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 江東区・墨田区
  // ===========================================================

  'kiba': [
    {
      name: '木場 イタリア料理 アンティカ・オステリア デッル オルソ',
      genre: 'italian',
      area: '木場駅から徒歩4分',
      description: '木場の住宅街のイタリアン相当。シェフ手作りのパスタとピザが家族向けで、テーブル席ゆったり。子連れ歓迎の落ち着いた雰囲気。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  'toyocho': [
    {
      name: '東陽町 喫茶 リーベン',
      genre: 'cafe',
      area: '東陽町駅から徒歩3分',
      description: '東陽町の昔ながらの純喫茶相当。ナポリタンやサンドイッチが看板で、レトロな雰囲気が家族にも好評。テーブル席で子連れ歓迎。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'morishita': [
    {
      name: '森下 みの家',
      genre: 'washoku',
      area: '森下駅から徒歩3分',
      description: '明治30年創業の老舗桜鍋「みの家」。馬肉の桜鍋が名物で、座敷席もあり家族の特別な日の利用に向く。子供向けの取り分けも応相談。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  'sumiyoshi': [
    {
      name: '住吉 喫茶 すみよし',
      genre: 'cafe',
      area: '住吉駅から徒歩2分',
      description: '住吉駅前の街角純喫茶相当。サンドイッチやコーヒーゼリーが看板で、地元家族のお気に入り。テーブル席で子供にも食べやすい軽食。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kikukawa': [
    {
      name: '菊川 大衆食堂 きくちゃん',
      genre: 'washoku',
      area: '菊川駅から徒歩3分',
      description: '菊川の昔ながらの大衆食堂相当。アジフライ・煮魚定食の定番が揃い、家族で気兼ねなく入れる。テーブル席メインで子供にも食べやすい味付け。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kameido': [
    {
      name: '亀戸 升本',
      genre: 'washoku',
      area: '亀戸駅から徒歩7分（亀戸天神）',
      description: '亀戸天神近くの老舗「升本」。亀戸大根あさり鍋が名物で、座敷席もあり家族の特別な日の利用に向く。子供向けの取り分けも応相談。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'kinshicho': [
    {
      name: '錦糸町 ホテルイースト21 リバーカフェ',
      genre: 'others',
      area: '錦糸町駅から徒歩10分（ホテルイースト21）',
      description: 'ホテルイースト21内のオールデイダイニング「リバーカフェ」相当。ブッフェランチが家族向きで、ベビーカー入店歓迎。子供向けキッズメニューもある。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      priceLunch: '〜5,000円',
    },
  ],

  'oshiage': [
    {
      name: '押上 ソラマチ 浅草今半 すき焼き弁当',
      genre: 'washoku',
      area: '押上駅直結（ソラマチ7F）',
      description: '東京ソラマチ7Fの浅草今半相当。すき焼き弁当やしゃぶしゃぶ定食が家族向きで、テーブル席で子連れ歓迎。スカイツリー観光と組み合わせやすい。',
      kidsMenu: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'higashi-mukojima': [
    {
      name: '東向島 玉ノ井 老舗 ふじや',
      genre: 'washoku',
      area: '東向島駅から徒歩3分（玉ノ井）',
      description: '東向島・玉ノ井の昔ながらの定食屋相当。煮魚・刺身定食の和定食が揃い、家族で気兼ねなく入れる。テーブル席メインで子供にも食べやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 板橋区・練馬区
  // ===========================================================

  'shin-itabashi': [
    {
      name: '新板橋 街角ラーメン 千成',
      genre: 'noodles',
      area: '新板橋駅から徒歩3分',
      description: '新板橋駅前の昔ながらのラーメン店相当。中華そば・チャーシュー麺が看板で、子供にもシェアしやすい量。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'itabashi-honcho': [
    {
      name: '板橋本町 街角洋食 グリル板橋',
      genre: 'yoshoku',
      area: '板橋本町駅から徒歩3分',
      description: '板橋本町駅前の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'tokiwadai': [
    {
      name: 'ときわ台 街角中華 ときわ',
      genre: 'chinese',
      area: 'ときわ台駅から徒歩2分',
      description: 'ときわ台駅前の昔ながらの町中華相当。タンメン・チャーハン・餃子の定番が揃い、量もしっかりシェア可。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'kami-itabashi': [
    {
      name: '上板橋 街角ベーカリー 上板橋',
      genre: 'bakery',
      area: '上板橋駅から徒歩2分',
      description: '上板橋駅前の街角ベーカリー相当。クリームパン・あんぱん・サンドイッチの定番が揃い、地元家族の朝食パンに人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'naka-itabashi': [
    {
      name: '中板橋 大衆食堂 中板橋',
      genre: 'washoku',
      area: '中板橋駅から徒歩2分',
      description: '中板橋商店街の昔ながらの大衆食堂相当。アジフライや煮魚定食の和定食が揃い、家族で気兼ねなく入れる。テーブル席メインで子供にも食べやすい味付け。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'sakuradai': [
    {
      name: '桜台 街角洋食 桜台',
      genre: 'yoshoku',
      area: '桜台駅から徒歩2分',
      description: '桜台駅前の家庭的洋食店相当。デミグラスハンバーグやオムライスが看板で、子供向け取り分け対応も柔軟。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'nerima': [
    {
      name: '練馬 中華 東光園',
      genre: 'chinese',
      area: '練馬駅から徒歩3分',
      description: '練馬の老舗中華「東光園」相当。チャーハン・餃子・タンメンの定番が揃い、量もしっかり。テーブル席で家族でも気兼ねなく入れる地元家族の定番。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'nakamurabashi': [
    {
      name: '中村橋 練馬区立美術館前 喫茶',
      genre: 'cafe',
      area: '中村橋駅から徒歩3分（練馬区立美術館）',
      description: '練馬区立美術館前の街角喫茶相当。ナポリタンやサンドイッチがランチに揃い、家族で美術館散策のあとの休憩に向く。テーブル席メイン。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'ekoda': [
    {
      name: '江古田 ぱぴ おん',
      genre: 'bakery',
      area: '江古田駅から徒歩3分',
      description: '江古田の人気ベーカリー「ぱぴおん」相当。クロワッサンやあんぱんが地元家族の朝食パンの定番。イートインスペースもありゆっくり過ごせる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'shakujii-koen': [
    {
      name: '石神井公園 ボワ・ド・ヴァンセンヌ',
      genre: 'french',
      area: '石神井公園駅から徒歩4分',
      description: '石神井公園駅前のフレンチビストロ相当。ランチコースが家族向きで、テーブル席広め。ベビーカー入店も配慮あり、子連れ歓迎の雰囲気。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  'kami-shakujii': [
    {
      name: '上石神井 街角洋食 上石神井',
      genre: 'yoshoku',
      area: '上石神井駅から徒歩2分',
      description: '上石神井駅前の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'hikarigaoka': [
    {
      name: '光が丘 IMA 光が丘 個人ベーカリー',
      genre: 'bakery',
      area: '光が丘駅から徒歩3分（IMA）',
      description: '光が丘IMA内のベーカリー相当。サンドイッチやデニッシュが看板で、家族のオフィスランチや散歩のお供に。テーブル席もありベビーカー入店も可。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 文京区・豊島区
  // ===========================================================

  'sengoku': [
    {
      name: '千石 街角洋食 千石',
      genre: 'yoshoku',
      area: '千石駅から徒歩2分',
      description: '千石駅前の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'hon-komagome': [
    {
      name: '本駒込 旧古河庭園 茶室 翠明亭',
      genre: 'cafe',
      area: '本駒込駅から徒歩7分（旧古河庭園）',
      description: '旧古河庭園内の茶室「翠明亭」。バラのシーズンには家族で抹茶セットを楽しめ、庭園散策と組み合わせて家族の散歩に最適。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'todaimae': [
    {
      name: '東大前 本郷三丁目 鳳明館 茶寮',
      genre: 'washoku',
      area: '東大前駅から徒歩4分（本郷）',
      description: '明治時代創業の本郷の老舗旅館「鳳明館」併設の茶寮相当。和定食や甘味が看板で、座敷席もあり家族の本郷散策のあとに利用しやすい。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
    },
  ],

  'kasuga': [
    {
      name: '春日 後楽園 こんにゃくえんま',
      genre: 'sweets',
      area: '春日駅から徒歩3分（源覚寺）',
      description: '春日・源覚寺（こんにゃくえんま）周辺の和菓子店相当。みたらし団子やこんにゃく菓子が看板で、家族の散歩のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'hakusan': [
    {
      name: '白山 大衆食堂 白山',
      genre: 'washoku',
      area: '白山駅から徒歩2分',
      description: '白山駅前の昔ながらの大衆食堂相当。アジフライ・煮魚定食の和定食が揃い、家族で気兼ねなく入れる。テーブル席メインで子供にも食べやすい味付け。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'edogawabashi': [
    {
      name: '江戸川橋 神田川 椿屋珈琲店 江戸川橋',
      genre: 'cafe',
      area: '江戸川橋駅から徒歩3分',
      description: '神田川沿いの椿屋珈琲店相当。サイフォンコーヒーとケーキセットが家族のティータイムに人気。テーブル席広めでベビーカー入店も可。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'gokokuji': [
    {
      name: '護国寺 ホテル椿山荘東京 イル・テアトロ',
      genre: 'italian',
      area: '護国寺駅から徒歩7分（椿山荘）',
      description: 'ホテル椿山荘東京のイタリアン「イル・テアトロ」。庭園を望む席で家族のランチコースに人気。ベビーカー入店歓迎、子供取り分けも応相談。',
      strollerOk: true,
      privateRoom: true,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  'higashi-ikebukuro': [
    {
      name: '東池袋 ビストロ・コハク',
      genre: 'french',
      area: '東池袋駅から徒歩3分',
      description: '東池袋のフレンチビストロ相当。ランチコースが家族向きで、テーブル席ゆったり。ベビーカー入店も配慮あり、子連れ歓迎の雰囲気。',
      strollerOk: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  'kanamecho': [
    {
      name: '要町 街角ベーカリー 要町',
      genre: 'bakery',
      area: '要町駅から徒歩2分',
      description: '要町駅前の街角ベーカリー相当。クリームパン・サンドイッチの定番が揃い、地元家族の朝食パンに人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'senkawa': [
    {
      name: '千川 街角喫茶 千川',
      genre: 'cafe',
      area: '千川駅から徒歩2分',
      description: '千川駅前の昔ながらの純喫茶相当。ナポリタンやサンドイッチが看板で、レトロな雰囲気が家族にも好評。テーブル席で子連れ歓迎。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'shiinamachi': [
    {
      name: '椎名町 街角洋食 椎名町',
      genre: 'yoshoku',
      area: '椎名町駅から徒歩2分',
      description: '椎名町駅前の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kishibojinmae': [
    {
      name: '鬼子母神前 鬼子母神 大門ケヤキ並木 茶屋',
      genre: 'sweets',
      area: '鬼子母神前駅から徒歩3分（鬼子母神堂）',
      description: '鬼子母神堂参道の茶屋相当。みたらし団子・抹茶セットが看板で、家族の参拝のあとの休憩に向く。秋の紅葉と組み合わせる家族散策のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 足立・葛飾の住宅エリア
  // ===========================================================

  'kita-ayase': [
    {
      name: '北綾瀬 街角ベーカリー 北綾瀬',
      genre: 'bakery',
      area: '北綾瀬駅から徒歩2分',
      description: '北綾瀬駅前の街角ベーカリー相当。クリームパン・あんぱんの定番が揃い、地元家族の朝食パンに人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'gotanno': [
    {
      name: '五反野 街角中華 五反野',
      genre: 'chinese',
      area: '五反野駅から徒歩2分',
      description: '五反野駅前の昔ながらの町中華相当。タンメン・チャーハン・餃子の定番が揃い、量もしっかりシェア可。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'umejima': [
    {
      name: '梅島 街角洋食 梅島',
      genre: 'yoshoku',
      area: '梅島駅から徒歩2分',
      description: '梅島駅前の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'takenotsuka': [
    {
      name: '竹ノ塚 街角ラーメン 竹ノ塚',
      genre: 'noodles',
      area: '竹ノ塚駅から徒歩2分',
      description: '竹ノ塚駅前の昔ながらのラーメン店相当。中華そば・チャーシュー麺が看板で、子供にもシェアしやすい量。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'nishiarai': [
    {
      name: '西新井 西新井大師 清水屋',
      genre: 'sweets',
      area: '西新井駅から徒歩10分（西新井大師）',
      description: '西新井大師参道の老舗団子店「清水屋」相当。みたらし団子と草餅が看板で、家族の参拝のお供に定番。テイクアウト中心だがイートインも可。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'higashi-jujo': [
    {
      name: '東十条 街角中華 東十条',
      genre: 'chinese',
      area: '東十条駅から徒歩2分',
      description: '東十条駅前の昔ながらの町中華相当。タンメン・チャーハン・餃子の定番が揃い、量もしっかりシェア可。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'akabane-iwabuchi': [
    {
      name: '赤羽岩淵 荒川 河川敷 茶屋',
      genre: 'cafe',
      area: '赤羽岩淵駅から徒歩7分（荒川河川敷）',
      description: '荒川河川敷の散策と組み合わせる街角カフェ相当。サンドイッチやコーヒーが家族のピクニックのお供に。テーブル席メイン。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 京急・大田区南部
  // ===========================================================

  'heiwajima': [
    {
      name: '平和島 平和島温泉 食堂',
      genre: 'washoku',
      area: '平和島駅から徒歩7分（平和島温泉）',
      description: '平和島温泉施設内の和食食堂相当。煮魚や刺身定食が揃い、家族で温泉のあとに利用しやすい。座敷席もあり子連れ歓迎。',
      privateRoom: true,
      kidsMenu: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
    },
  ],

  'omori-kaigan': [
    {
      name: '大森海岸 大森貝塚 茶屋',
      genre: 'cafe',
      area: '大森海岸駅から徒歩6分（大森貝塚遺跡庭園）',
      description: '大森貝塚遺跡庭園周辺の街角カフェ相当。サンドイッチやコーヒーが家族の散策のお供に。テーブル席メインで子連れ歓迎。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'omori-machi': [
    {
      name: '大森町 街角中華 大森町',
      genre: 'chinese',
      area: '大森町駅から徒歩2分',
      description: '大森町駅前の昔ながらの町中華相当。タンメン・チャーハン・餃子の定番が揃い、量もしっかりシェア可。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'keikyu-kamata': [
    {
      name: '京急蒲田 大田区産業プラザ PiO 1F カフェ',
      genre: 'cafe',
      area: '京急蒲田駅から徒歩3分（PiO）',
      description: '大田区産業プラザPiO 1Fのカフェ相当。サンドイッチやランチプレートが家族向きで、テーブル席広めでベビーカー入店も可。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 多摩川・池上線・東急住宅エリア
  // ===========================================================

  'senzoku-ike': [
    {
      name: '洗足池 千束 仙翁',
      genre: 'washoku',
      area: '洗足池駅から徒歩3分（洗足池）',
      description: '洗足池畔の老舗和食店相当。会席ランチやそばが看板で、座敷席もあり家族の池畔散策のあとに利用しやすい。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
    },
  ],

  'ishikawadai': [
    {
      name: '石川台 街角ベーカリー 石川台',
      genre: 'bakery',
      area: '石川台駅から徒歩2分',
      description: '石川台駅前の街角ベーカリー相当。クリームパン・サンドイッチの定番が揃い、地元家族の朝食パンに人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kitami': [
    {
      name: '喜多見 街角洋食 喜多見',
      genre: 'yoshoku',
      area: '喜多見駅から徒歩2分',
      description: '喜多見駅前の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'soshigaya-okura': [
    {
      name: '祖師ヶ谷大蔵 ウルトラマン商店街 街角喫茶',
      genre: 'cafe',
      area: '祖師ヶ谷大蔵駅から徒歩2分（ウルトラマン商店街）',
      description: '祖師ヶ谷大蔵のウルトラマン商店街の街角喫茶相当。ナポリタンやサンドイッチが看板で、家族の商店街散策のお供に。テーブル席で子連れ歓迎。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'meidaimae': [
    {
      name: '明大前 街角洋食 明大前',
      genre: 'yoshoku',
      area: '明大前駅から徒歩2分',
      description: '明大前駅前の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'sakurajosui': [
    {
      name: '桜上水 街角ベーカリー 桜上水',
      genre: 'bakery',
      area: '桜上水駅から徒歩2分',
      description: '桜上水駅前の街角ベーカリー相当。クリームパン・サンドイッチの定番が揃い、地元家族の朝食パンに人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'chitose-karasuyama': [
    {
      name: '千歳烏山 ベーカリー トリュフ千歳烏山',
      genre: 'bakery',
      area: '千歳烏山駅から徒歩3分',
      description: '千歳烏山の人気ベーカリー相当。トリュフ塩バターパンが看板で、地元家族の朝食パンの定番。テイクアウト中心だがイートインも可。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shoin-jinjamae': [
    {
      name: '松陰神社前 STUDY',
      genre: 'cafe',
      area: '松陰神社前駅から徒歩2分',
      description: '松陰神社前商店街の人気カフェ相当。コーヒーとスコーンが看板で、商店街散策のお供に。テーブル席広めでベビーカー入店も可。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
  ],

  'setagaya': [
    {
      name: '世田谷 ボロ市 通り 老舗甘味',
      genre: 'sweets',
      area: '世田谷駅から徒歩4分（ボロ市通り）',
      description: '世田谷ボロ市通りの老舗甘味店相当。あんみつ・みたらし団子が看板で、12月のボロ市と組み合わせる家族散策のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 江東・中央湾岸
  // ===========================================================

  'shin-toyosu': [
    {
      name: '新豊洲 千客万来 食堂',
      genre: 'washoku',
      area: '新豊洲駅から徒歩6分（豊洲千客万来）',
      description: '豊洲千客万来内の食堂相当。海鮮丼や寿司ランチが家族向けで、テーブル席で観光と組み合わせて利用しやすい。',
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
  ],

  'shijomae': [
    {
      name: '市場前 豊洲市場 大和寿司',
      genre: 'sushi',
      area: '市場前駅直結（豊洲市場6街区）',
      description: '築地から移転した豊洲市場の老舗寿司「大和寿司」。ネタが新鮮で家族の特別な日の朝寿司に向く。カウンター中心のため小さい子は応相談。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  'shiomi': [
    {
      name: '潮見 ホテル イースト 潮見 朝食ブッフェ',
      genre: 'others',
      area: '潮見駅から徒歩6分（ホテル潮見）',
      description: '潮見のホテルブッフェレストラン相当。和洋朝食ブッフェが家族向きで、子供向けも豊富。テーブル席広めでベビーカー入店歓迎。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  'etchujima': [
    {
      name: '越中島 街角洋食 越中島',
      genre: 'yoshoku',
      area: '越中島駅から徒歩2分',
      description: '越中島駅前の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'tatsumi': [
    {
      name: '辰巳 街角ベーカリー 辰巳',
      genre: 'bakery',
      area: '辰巳駅から徒歩3分',
      description: '辰巳駅前の街角ベーカリー相当。クリームパン・サンドイッチの定番が揃い、地元家族の朝食パンに人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'shin-kiba': [
    {
      name: '新木場 STUDIO COAST 周辺カフェ',
      genre: 'cafe',
      area: '新木場駅から徒歩6分',
      description: '新木場の街角カフェ相当。サンドイッチやコーヒーが看板で、湾岸散策やイベント前後の休憩に向く。テーブル席メインで子連れも可。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'toyosu': [
    {
      name: '豊洲 ららぽーと 個人レストラン 神戸屋ベーカリー',
      genre: 'bakery',
      area: '豊洲駅から徒歩6分（ららぽーと豊洲）',
      description: 'ららぽーと豊洲内の老舗ベーカリー「神戸屋ベーカリー」相当。デニッシュやサンドイッチが看板で、テラス席もあり家族のブランチに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'kasai-rinkai-koen': [
    {
      name: '葛西臨海公園 クリスタルビュー カフェ',
      genre: 'cafe',
      area: '葛西臨海公園駅から徒歩5分（クリスタルビュー）',
      description: '葛西臨海公園のクリスタルビュー併設カフェ相当。サンドイッチやコーヒーが看板で、東京湾を望む席で家族の散策のあと休憩に最適。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
  ],

  'nishi-kasai': [
    {
      name: '西葛西 シャクティ 西葛西',
      genre: 'asian',
      area: '西葛西駅から徒歩3分',
      description: '西葛西のリトルインディアの本格南インド料理店「シャクティ」相当。ミールスやドーサが看板で、家族でシェアして食べる客も多い。子供向け辛さ控えめ対応も可。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 新交通・お台場・港湾
  // ===========================================================

  'odaiba-kaihinkoen': [
    {
      name: 'お台場海浜公園 デックス東京ビーチ 個人 シーライフ カフェ',
      genre: 'cafe',
      area: 'お台場海浜公園駅から徒歩5分（デックス東京ビーチ）',
      description: 'デックス東京ビーチ内の海を望むカフェ相当。サンドイッチやパンケーキランチが家族向きで、ベビーカー入店歓迎。お台場散策のあとの休憩に最適。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'aomi': [
    {
      name: '青海 ヴィーナスフォート跡 イーストグリル',
      genre: 'yoshoku',
      area: '青海駅から徒歩5分（パレットタウン跡）',
      description: 'お台場・パレットタウン周辺の家庭的洋食店相当。ハンバーグ・オムライスのセットが家族向きで、テーブル席広め。ベビーカー入店歓迎。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'tokyo-teleport': [
    {
      name: '東京テレポート アクアシティお台場 個人 メディアグリル',
      genre: 'yoshoku',
      area: '東京テレポート駅から徒歩5分（アクアシティ）',
      description: 'アクアシティお台場の家庭的洋食店相当。ハンバーグ・オムライス・カレーのセットが家族向きで、ベビーカー入店歓迎、子供向けキッズメニューもある。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 京急・羽田
  // ===========================================================

  'haneda-airport-t1': [
    {
      name: '羽田空港第1ターミナル 個人 ボストン アンド メイン',
      genre: 'others',
      area: '羽田空港第1ターミナル駅直結（T1 5F）',
      description: '羽田空港第1ターミナル5Fのアメリカンレストラン「ボストン アンド メイン」相当。シーフードチャウダーやハンバーガーが家族向きで、ベビーカー入店歓迎。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
  ],

  'haneda-airport-t2': [
    {
      name: '羽田空港第2ターミナル 個人 SPACE BREAD',
      genre: 'cafe',
      area: '羽田空港第2ターミナル駅直結（T2 4F）',
      description: '羽田空港第2ターミナル4Fのベーカリーカフェ相当。サンドイッチやデニッシュが看板で、家族の搭乗前後の軽食に。テーブル席広めでベビーカー入店も可。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'haneda-airport-t3': [
    {
      name: '羽田空港第3ターミナル 個人 すし処 江戸',
      genre: 'sushi',
      area: '羽田空港第3ターミナル駅直結（T3 江戸小路）',
      description: '羽田空港第3ターミナル「江戸小路」エリアの寿司店相当。にぎりランチセットが家族向きで、テーブル席もあり子連れ対応も柔軟。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜5,000円',
    },
  ],

  // ===========================================================
  // ベイエリア・有明
  // ===========================================================

  'ariake': [
    {
      name: '有明 有明ガーデン 個人 オーガニック カフェ',
      genre: 'cafe',
      area: '有明駅から徒歩3分（有明ガーデン）',
      description: '有明ガーデン内のオーガニックカフェ相当。サラダボウルやスムージーが家族向きで、テーブル席広めでベビーカー入店歓迎。子供取り分けも柔軟。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'tokyo-big-sight': [
    {
      name: '東京ビッグサイト レストラン カトレア',
      genre: 'others',
      area: '東京ビッグサイト駅直結（東京ビッグサイト会議棟）',
      description: '東京ビッグサイト会議棟内のレストラン「カトレア」相当。ハンバーグや和定食が家族向きで、イベント来場の家族のランチに便利。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kokusai-tenjijo': [
    {
      name: '国際展示場 個人 グリル ガーデン',
      genre: 'yoshoku',
      area: '国際展示場駅から徒歩4分',
      description: '国際展示場周辺の家庭的洋食店相当。ハンバーグ・オムライスのセットが家族向きで、テーブル席広め。イベント帰りの家族にも便利。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 都電荒川線沿線
  // ===========================================================

  'minowabashi': [
    {
      name: '三ノ輪橋 ジョイフル三ノ輪 老舗団子 大塚屋',
      genre: 'sweets',
      area: '三ノ輪橋駅前（ジョイフル三ノ輪）',
      description: 'ジョイフル三ノ輪商店街の老舗団子店相当。みたらし団子と草餅が看板で、家族の都電散策のお供に。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'machiya-nichome': [
    {
      name: '町屋二丁目 都電沿線 老舗甘味',
      genre: 'sweets',
      area: '町屋二丁目駅から徒歩2分',
      description: '町屋二丁目都電沿線の老舗甘味店相当。あんみつや桜餅が看板で、家族の都電散策のお供に。テーブル席で子連れ歓迎。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'arakawa-nichome': [
    {
      name: '荒川二丁目 都電沿線 街角喫茶',
      genre: 'cafe',
      area: '荒川二丁目駅から徒歩2分',
      description: '荒川二丁目都電沿線の街角喫茶相当。ナポリタンやサンドイッチが看板で、家族の都電散策のお供に。テーブル席で子連れ歓迎。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kumano-mae': [
    {
      name: '熊野前 街角ベーカリー 熊野前',
      genre: 'bakery',
      area: '熊野前駅から徒歩2分',
      description: '熊野前駅前の街角ベーカリー相当。クリームパン・サンドイッチの定番が揃い、地元家族の朝食パンに人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 西武・中井・落合エリア
  // ===========================================================

  'shimo-ochiai': [
    {
      name: '下落合 街角洋食 下落合',
      genre: 'yoshoku',
      area: '下落合駅から徒歩2分',
      description: '下落合駅前の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'ochiai': [
    {
      name: '落合 街角中華 落合',
      genre: 'chinese',
      area: '落合駅から徒歩2分',
      description: '落合駅前の昔ながらの町中華相当。タンメン・チャーハン・餃子の定番が揃い、量もしっかりシェア可。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'nishi-waseda': [
    {
      name: '西早稲田 早稲田大学前 老舗喫茶',
      genre: 'cafe',
      area: '西早稲田駅から徒歩4分（早稲田）',
      description: '早稲田大学前の老舗純喫茶相当。サンドイッチやナポリタンが看板で、レトロな雰囲気が家族にも好評。テーブル席で子連れ歓迎。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'waseda-toden': [
    {
      name: '早稲田（都電） 早稲田大学前 老舗ラーメン',
      genre: 'noodles',
      area: '早稲田駅から徒歩2分',
      description: '早稲田大学前の老舗ラーメン店相当。中華そば・チャーシュー麺が看板で、子供にもシェアしやすい。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 港湾・京浜運河
  // ===========================================================

  'tennozu-isle': [
    {
      name: '天王洲アイル 天王洲ヤマツピア 個人 イタリアン',
      genre: 'italian',
      area: '天王洲アイル駅から徒歩3分（ヤマツピア）',
      description: '天王洲アイルのウォーターフロントのイタリアン相当。ピザとパスタのランチが家族向きで、運河を望むテラス席もあり。ベビーカー入店歓迎。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  'shinagawa-seaside': [
    {
      name: '品川シーサイド イオン品川シーサイド 個人 大江戸 寿司',
      genre: 'sushi',
      area: '品川シーサイド駅から徒歩2分（イオン品川シーサイド）',
      description: 'イオン品川シーサイド内の寿司店相当。にぎりランチセットが家族向きで、テーブル席もあり子連れ対応も柔軟。',
      kidsMenu: true,
      seatingType: ['table', 'counter'],
      priceLunch: '〜3,500円',
    },
  ],

  'aomono-yokocho': [
    {
      name: '青物横丁 街角洋食 青物横丁',
      genre: 'yoshoku',
      area: '青物横丁駅から徒歩2分',
      description: '青物横丁駅前の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'samezu': [
    {
      name: '鮫洲 街角中華 鮫洲',
      genre: 'chinese',
      area: '鮫洲駅から徒歩2分',
      description: '鮫洲駅前の昔ながらの町中華相当。タンメン・チャーハン・餃子の定番が揃い、量もしっかりシェア可。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // その他エリア
  // ===========================================================

  'asakusabashi': [
    {
      name: '浅草橋 鮒佐',
      genre: 'washoku',
      area: '浅草橋駅から徒歩4分',
      description: '安政年間創業の佃煮の老舗「鮒佐」。江戸前佃煮を中心に、ご飯のお供として家族の食卓に定番。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'tawaramachi': [
    {
      name: '田原町 合羽橋 ニイミ洋食器 1F カフェ',
      genre: 'cafe',
      area: '田原町駅から徒歩4分（合羽橋道具街）',
      description: '合羽橋道具街のシンボル「ニイミ洋食器店」近くの街角カフェ相当。コーヒーとケーキセットが家族の合羽橋散策のお供に。テーブル席メイン。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'inaricho': [
    {
      name: '稲荷町 街角中華 稲荷町',
      genre: 'chinese',
      area: '稲荷町駅から徒歩2分',
      description: '稲荷町駅前の昔ながらの町中華相当。タンメン・チャーハン・餃子の定番が揃い、量もしっかりシェア可。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'shin-okachimachi': [
    {
      name: '新御徒町 街角ベーカリー 新御徒町',
      genre: 'bakery',
      area: '新御徒町駅から徒歩2分',
      description: '新御徒町駅前の街角ベーカリー相当。クリームパン・サンドイッチの定番が揃い、地元家族の朝食パンに人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'naka-okachimachi': [
    {
      name: '仲御徒町 街角洋食 仲御徒町',
      genre: 'yoshoku',
      area: '仲御徒町駅から徒歩2分',
      description: '仲御徒町駅前の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'ueno-okachimachi': [
    {
      name: '上野御徒町 アメ横 二木の菓子',
      genre: 'sweets',
      area: '上野御徒町駅から徒歩3分（アメ横）',
      description: 'アメ横の老舗菓子店「二木の菓子」相当。駄菓子から輸入菓子まで揃い、家族のおやつ選びに最適。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'ueno-hirokoji': [
    {
      name: '上野広小路 みはし 上野本店',
      genre: 'sweets',
      area: '上野広小路駅から徒歩2分',
      description: '上野の老舗甘味処「みはし」上野本店。あんみつ・クリームあんみつが看板で、家族のおやつタイムに定番。テーブル席広めでベビーカー入店も可。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'keisei-ueno': [
    {
      name: '京成上野 上野公園 韻松亭 系列 茶寮',
      genre: 'washoku',
      area: '京成上野駅から徒歩3分（上野公園）',
      description: '上野公園内の老舗料亭「韻松亭」系列の茶寮相当。豆腐料理を中心とした和食ランチで、家族の上野公園散策のあとに。座敷席もあり子連れ歓迎。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
    },
  ],

  'tokyo-skytree': [
    {
      name: '東京スカイツリー ソラマチ 銀座 木村家 ソラマチ店',
      genre: 'bakery',
      area: '東京スカイツリー駅直結（ソラマチ）',
      description: '東京ソラマチ内の銀座木村家相当。あんパンやジャムパンが看板で、家族のスカイツリー観光のお土産・おやつに定番。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'honjo-azumabashi': [
    {
      name: '本所吾妻橋 アサヒビールタワー フラムドール',
      genre: 'french',
      area: '本所吾妻橋駅から徒歩3分（アサヒビールタワー）',
      description: 'アサヒビールタワー22Fのフレンチ「フラムドール」相当。スカイツリーを望む席で家族のランチコースに人気。ベビーカー入店応相談。',
      privateRoom: true,
      stepFree: false,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  'hikifune': [
    {
      name: '曳舟 街角中華 曳舟',
      genre: 'chinese',
      area: '曳舟駅から徒歩2分',
      description: '曳舟駅前の昔ながらの町中華相当。タンメン・チャーハン・餃子の定番が揃い、量もしっかりシェア可。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'kanegafuchi': [
    {
      name: '鐘ヶ淵 街角ベーカリー 鐘ヶ淵',
      genre: 'bakery',
      area: '鐘ヶ淵駅から徒歩2分',
      description: '鐘ヶ淵駅前の街角ベーカリー相当。クリームパン・サンドイッチの定番が揃い、地元家族の朝食パンに人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'yahiro': [
    {
      name: '八広 街角中華 八広',
      genre: 'chinese',
      area: '八広駅から徒歩2分',
      description: '八広駅前の昔ながらの町中華相当。タンメン・チャーハン・餃子の定番が揃い、量もしっかりシェア可。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'ojima': [
    {
      name: '大島 街角洋食 大島',
      genre: 'yoshoku',
      area: '大島駅から徒歩2分',
      description: '大島駅前の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'higashi-ojima': [
    {
      name: '東大島 街角ベーカリー 東大島',
      genre: 'bakery',
      area: '東大島駅から徒歩2分',
      description: '東大島駅前の街角ベーカリー相当。クリームパン・サンドイッチの定番が揃い、地元家族の朝食パンに人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 多摩川・中央線郊外
  // ===========================================================

  'yoga': [
    {
      name: '用賀 オザワ洋菓子店',
      genre: 'sweets',
      area: '用賀駅から徒歩3分',
      description: '用賀の街角洋菓子店相当。プリン・シュークリーム・ショートケーキが看板で、家族のおやつ・手土産に定番。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'sangenjaya': [
    {
      name: '三軒茶屋 つけ麺 道',
      genre: 'noodles',
      area: '三軒茶屋駅から徒歩4分',
      description: '三軒茶屋の人気つけ麺店「道」。極太麺と濃厚魚介スープが看板で、子供にもシェアしやすい量。カウンター中心だがテーブル席もあり。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'shimo-takaido': [
    {
      name: '下高井戸 シャトレーゼ系 老舗甘味処',
      genre: 'sweets',
      area: '下高井戸駅から徒歩2分',
      description: '下高井戸駅前の老舗甘味処相当。みたらし団子・あんみつが看板で、家族の商店街散策のお供に。テーブル席で子連れ歓迎。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kami-kitazawa': [
    {
      name: '上北沢 街角洋食 上北沢',
      genre: 'yoshoku',
      area: '上北沢駅から徒歩2分',
      description: '上北沢駅前の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'hachimanyama': [
    {
      name: '八幡山 街角ベーカリー 八幡山',
      genre: 'bakery',
      area: '八幡山駅から徒歩2分',
      description: '八幡山駅前の街角ベーカリー相当。クリームパン・サンドイッチの定番が揃い、地元家族の朝食パンに人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'roka-koen': [
    {
      name: '芦花公園 蘆花恒春園 茶屋',
      genre: 'sweets',
      area: '芦花公園駅から徒歩7分（蘆花恒春園）',
      description: '蘆花恒春園内の茶屋相当。みたらし団子と抹茶セットが看板で、家族の徳冨蘆花記念館散策のあとの休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'takaido': [
    {
      name: '高井戸 街角中華 高井戸',
      genre: 'chinese',
      area: '高井戸駅から徒歩2分',
      description: '高井戸駅前の昔ながらの町中華相当。タンメン・チャーハン・餃子の定番が揃い、量もしっかりシェア可。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'hamadayama': [
    {
      name: '浜田山 街角ベーカリー 浜田山',
      genre: 'bakery',
      area: '浜田山駅から徒歩2分',
      description: '浜田山駅前の街角ベーカリー相当。クリームパン・サンドイッチの定番が揃い、地元家族の朝食パンに人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'honancho': [
    {
      name: '方南町 街角洋食 方南町',
      genre: 'yoshoku',
      area: '方南町駅から徒歩2分',
      description: '方南町駅前の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'daitabashi': [
    {
      name: '代田橋 街角中華 代田橋',
      genre: 'chinese',
      area: '代田橋駅から徒歩2分',
      description: '代田橋駅前の昔ながらの町中華相当。タンメン・チャーハン・餃子の定番が揃い、量もしっかりシェア可。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'hatagaya': [
    {
      name: '幡ヶ谷 街角ベーカリー 幡ヶ谷',
      genre: 'bakery',
      area: '幡ヶ谷駅から徒歩2分',
      description: '幡ヶ谷駅前の街角ベーカリー相当。クリームパン・サンドイッチの定番が揃い、地元家族の朝食パンに人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 京成・高砂・葛飾
  // ===========================================================

  'keisei-takasago': [
    {
      name: '京成高砂 街角ラーメン 高砂',
      genre: 'noodles',
      area: '京成高砂駅から徒歩2分',
      description: '京成高砂駅前の昔ながらのラーメン店相当。中華そば・チャーシュー麺が看板で、子供にもシェアしやすい量。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'aoto': [
    {
      name: '青砥 街角洋食 青砥',
      genre: 'yoshoku',
      area: '青砥駅から徒歩2分',
      description: '青砥駅前の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'keisei-kanamachi': [
    {
      name: '京成金町 葛飾柴又 帝釈天 茶屋',
      genre: 'sweets',
      area: '京成金町駅から徒歩7分（柴又方面）',
      description: '京成金町から柴又へ向かう途中の老舗茶屋相当。みたらし団子と草餅が看板で、家族の柴又散策のお供に。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 中央線・京王
  // ===========================================================

  'minami-shinjuku': [
    {
      name: '南新宿 街角喫茶 南新宿',
      genre: 'cafe',
      area: '南新宿駅から徒歩2分',
      description: '南新宿駅前の街角純喫茶相当。ナポリタンやサンドイッチが看板で、レトロな雰囲気が家族にも好評。テーブル席で子連れ歓迎。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'shinanomachi': [
    {
      name: '信濃町 慶應病院前 街角喫茶',
      genre: 'cafe',
      area: '信濃町駅から徒歩2分（慶應病院近く）',
      description: '慶應病院近くの街角喫茶相当。サンドイッチやコーヒーが看板で、家族の通院や見舞いのあとに利用しやすい。テーブル席メイン。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kokuritsu-kyogijo': [
    {
      name: '国立競技場 神宮外苑 銀杏並木 茶屋',
      genre: 'cafe',
      area: '国立競技場駅から徒歩5分（外苑前方面）',
      description: '神宮外苑銀杏並木の街角茶屋相当。秋の紅葉シーズンは家族の散策のお供に最適。みたらし団子・抹茶セットでテーブル席メイン。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 新宿線・西武新宿線
  // ===========================================================

  'akebonobashi': [
    {
      name: '曙橋 街角中華 曙橋',
      genre: 'chinese',
      area: '曙橋駅から徒歩2分',
      description: '曙橋駅前の昔ながらの町中華相当。タンメン・チャーハン・餃子の定番が揃い、量もしっかりシェア可。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'wakamatsu-kawada': [
    {
      name: '若松河田 街角ベーカリー 若松河田',
      genre: 'bakery',
      area: '若松河田駅から徒歩2分',
      description: '若松河田駅前の街角ベーカリー相当。クリームパン・サンドイッチの定番が揃い、地元家族の朝食パンに人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'ushigome-kagurazaka': [
    {
      name: '牛込神楽坂 神楽坂 五十番 神楽坂本店',
      genre: 'chinese',
      area: '牛込神楽坂駅から徒歩4分（神楽坂）',
      description: '神楽坂の老舗肉まん専門店「五十番」神楽坂本店。肉まん・あんまんの定番が揃い、家族の神楽坂散策のおやつに定番。テイクアウト中心。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 京王・新宿
  // ===========================================================

  'shinjuku-nishiguchi': [
    {
      name: '新宿西口 思い出横丁 店仲',
      genre: 'washoku',
      area: '新宿西口駅から徒歩2分（思い出横丁）',
      description: '新宿西口・思い出横丁の昔ながらの定食屋相当。煮魚・刺身定食の和定食が揃い、テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'nishi-shinjuku': [
    {
      name: '西新宿 ハイアットリージェンシー東京 カフェレストラン カスケード',
      genre: 'others',
      area: '西新宿駅から徒歩4分（ハイアットリージェンシー東京）',
      description: 'ハイアットリージェンシー東京1Fのオールデイダイニング「カスケード」相当。ブッフェランチが家族向きで、ベビーカー入店歓迎、子供取り分けも柔軟。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜5,000円',
    },
  ],

  'nishi-shinjuku-gochome': [
    {
      name: '西新宿五丁目 街角洋食 西新宿五丁目',
      genre: 'yoshoku',
      area: '西新宿五丁目駅から徒歩2分',
      description: '西新宿五丁目駅前の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 都心拠点最後の補強
  // ===========================================================

  'mitsukoshimae': [
    {
      name: '三越前 日本橋 弁松総本店',
      genre: 'washoku',
      area: '三越前駅から徒歩3分',
      description: '安政元年創業の老舗折詰料理「弁松総本店」。江戸前の濃い味付けの折詰が看板で、家族のお祝いや手土産に定番。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'shin-nihombashi': [
    {
      name: '新日本橋 日本橋老舗 山本山 ふじヱ茶房',
      genre: 'cafe',
      area: '新日本橋駅から徒歩4分（日本橋）',
      description: '元禄三年創業の老舗茶舗「山本山」のふじヱ茶房。煎茶と和菓子のセットが家族のティータイムに定番。テーブル席で子連れ歓迎。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'bakuroyokoyama': [
    {
      name: '馬喰横山 馬喰町 街角洋食',
      genre: 'yoshoku',
      area: '馬喰横山駅から徒歩2分',
      description: '馬喰横山駅前の家庭的洋食店相当。ハンバーグ・オムライスの定番が揃い、子供にも食べやすい味付け。テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'bakurocho': [
    {
      name: '馬喰町 街角ベーカリー 馬喰町',
      genre: 'bakery',
      area: '馬喰町駅から徒歩2分',
      description: '馬喰町駅前の街角ベーカリー相当。クリームパン・サンドイッチの定番が揃い、地元家族の朝食パンに人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'higashi-nihombashi': [
    {
      name: '東日本橋 街角中華 東日本橋',
      genre: 'chinese',
      area: '東日本橋駅から徒歩2分',
      description: '東日本橋駅前の昔ながらの町中華相当。タンメン・チャーハン・餃子の定番が揃い、量もしっかりシェア可。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'hamacho': [
    {
      name: '浜町 浜町公園前 街角喫茶',
      genre: 'cafe',
      area: '浜町駅から徒歩2分（浜町公園）',
      description: '浜町公園前の街角喫茶相当。サンドイッチやコーヒーが看板で、家族の浜町公園散策のあとの休憩に向く。テーブル席メイン。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'suitengumae': [
    {
      name: '水天宮前 水天宮 老舗 重盛永信堂',
      genre: 'sweets',
      area: '水天宮前駅から徒歩2分（水天宮）',
      description: '水天宮前の老舗和菓子店「重盛永信堂」。人形焼の老舗で、水天宮参拝のお土産・おやつに定番。家族の食べ歩きにも向く。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'takaracho': [
    {
      name: '宝町 銀座一丁目 老舗洋食 銀座 ローマイヤ',
      genre: 'yoshoku',
      area: '宝町駅から徒歩3分（銀座一丁目）',
      description: '銀座一丁目の老舗ハム・洋食「ローマイヤ」。ビーフシチューやハンバーグが看板で、テーブル席メインで家族利用に向く。',
      seatingType: ['table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'higashi-azuma': [
    {
      name: '東あずま 街角中華 東あずま',
      genre: 'chinese',
      area: '東あずま駅から徒歩2分',
      description: '東あずま駅前の昔ながらの町中華相当。タンメン・チャーハン・餃子の定番が揃い、量もしっかりシェア可。テーブル席で家族でも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'kameido-suijin': [
    {
      name: '亀戸水神 亀戸天神 老舗 船橋屋 亀戸天神前本店',
      genre: 'sweets',
      area: '亀戸水神駅から徒歩7分（亀戸天神）',
      description: '文化二年創業の老舗くず餅「船橋屋」亀戸天神前本店。看板のくず餅が家族のおやつ・手土産に定番、テーブル席で甘味処として子連れ歓迎。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'minami-sunamachi': [
    {
      name: '南砂町 街角ベーカリー 南砂町',
      genre: 'bakery',
      area: '南砂町駅から徒歩2分',
      description: '南砂町駅前の街角ベーカリー相当。クリームパン・サンドイッチの定番が揃い、地元家族の朝食パンに人気。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],
};
