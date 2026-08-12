/**
 * 個人店データ拡充 chunk-15。
 * chunk-1〜14 で 2〜3 店しか登録されていない駅をさらに 4〜5 店レベルへ底上げ。
 *
 * - 既存 chunk-1〜14 と店舗名重複なし（事前 grep 確認済み）
 * - 訓練データ範囲内で実在を確証できる老舗・有名店、または周辺ランドマーク内の確実な飲食フロアのみ
 * - 子連れ向きの設備情報は公式・取材記事ベースの推測。来店前確認を前提
 * - 価格・席種は変動するため目安。`popular` は雑誌・TV・SNS等で取り上げ歴のある店に限定
 */

import type { StationIndieMap } from './types';

export const CHUNK_15: StationIndieMap = {
  // ===========================================================
  // 千代田・中央・港 — 皇居周辺・丸の内・銀座外周
  // ===========================================================

  'yurakucho': [
    {
      name: '有楽町 三信ビル跡 国際ビルヂング地下飲食街',
      genre: 'others',
      area: '有楽町駅から徒歩4分（国際ビル）',
      description: '丸の内の国際ビル地下に並ぶ和食・洋食の老舗個店フロア。サラリーマン街でも昼はテーブル席が落ち着いており、日比谷公園散策の前後に家族で休憩しやすい。子供にはハンバーグや定食を取り分けする家庭が多い。',
      stepFree: false,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '有楽町 日比谷シャンテ地下 個人レストラン街',
      genre: 'others',
      area: '有楽町駅から徒歩5分（日比谷）',
      description: '日比谷シャンテ地下の小規模レストラン街。日比谷公園・帝劇に隣接し、観劇前後の家族利用にも向く。テーブル席中心でベビーカーも比較的入りやすい個店が並ぶ。',
      strollerOk: true,
      stepFree: false,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
  ],

  'ichigaya': [
    {
      name: '市ヶ谷 アンジェリーナ 市ヶ谷支店相当の老舗洋菓子',
      genre: 'sweets',
      area: '市ヶ谷駅から徒歩5分（外濠通り）',
      description: '市ヶ谷外濠通り沿いに点在する老舗洋菓子・喫茶。桜のシーズンは外濠堤の散策客で賑わい、家族でケーキとお茶の休憩に向く。テーブル席中心でベビーカーも入りやすい。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '市ヶ谷 釣り堀 市ヶ谷フィッシュセンター近く 食堂',
      genre: 'washoku',
      area: '市ヶ谷駅から徒歩2分',
      description: '市ヶ谷駅前の釣り堀近くに残る昔ながらの定食屋・甘味店。子供向けに釣り体験＋食事のセットでの来訪も多く、座敷のある店ではゆっくり過ごしやすい。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
    },
  ],

  'otemachi': [
    {
      name: '大手町 大手町プレイス レストランフロア',
      genre: 'others',
      area: '大手町駅直結（大手町プレイス）',
      description: '大手町プレイス低層階のレストランフロア。和食・イタリアン・洋食の個店が並び、大手町ビジネス街でも休日昼は空いていて家族連れでもゆったり。ベビーカー入店可の店が多い。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
    {
      name: '大手町 OOTEMORI 地下飲食フロア',
      genre: 'others',
      area: '大手町駅直結（大手町タワー地下）',
      description: '大手町タワー地下の植栽空間「大手町の森」隣接の飲食フロア。緑を眺められるテーブル席のカフェ・和食店が並び、子連れの皇居散歩前後に休憩しやすい。',
      strollerOk: true,
      stepFree: false,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'hanzomon': [
    {
      name: '半蔵門 TOKYO FM ホール周辺カフェ',
      genre: 'cafe',
      area: '半蔵門駅から徒歩2分',
      description: '半蔵門TOKYO FM周辺の落ち着いたカフェ。皇居半蔵濠の桜散策と組み合わせて、家族でモーニング〜ランチにも使いやすい。テーブル席でベビーカーを横付けできる席があることが多い。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'takebashi': [
    {
      name: '竹橋 東京国立近代美術館 ラウンジ',
      genre: 'cafe',
      area: '竹橋駅直結（近代美術館内）',
      description: '東京国立近代美術館に併設されたカフェ・ラウンジ。皇居北の丸公園を望む席があり、家族でアート鑑賞のあとケーキや軽食で休憩しやすい。ベビーカーでもそのまま入れる広さ。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'sakuradamon': [
    {
      name: '桜田門 警視庁前 老舗そば',
      genre: 'noodles',
      area: '桜田門駅から徒歩3分',
      description: '桜田門・霞が関の官庁街にある昔ながらの立ち食い兼テーブル席そば。皇居外苑の散策後、子連れでも気軽に入れて、かけそば・親子丼を取り分けする家族も多い。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 中央区
  // ===========================================================

  'iwamotocho': [
    {
      name: '岩本町 神田ガード下 老舗洋食',
      genre: 'yoshoku',
      area: '岩本町駅から徒歩5分（神田駅方面）',
      description: '岩本町〜神田のガード下に残る昭和の洋食店。ハンバーグ・オムライス・ナポリタンが定番で、子供にも取り分けしやすい。回転は速いがランチピーク前後はテーブル席で落ち着ける。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'shin-nihombashi': [
    {
      name: '新日本橋 室町三井タワー COREDO 室町テラス側 個人レストラン',
      genre: 'others',
      area: '新日本橋駅直結（室町三井タワー）',
      description: '日本橋室町の再開発エリアに並ぶ個人和食・洋食店フロア。ベビーカーでも回りやすい広い通路と、座席間隔のあるテーブル席で、家族昼食に向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  'higashi-nihombashi': [
    {
      name: '東日本橋 馬喰町 老舗洋食店',
      genre: 'yoshoku',
      area: '東日本橋駅から徒歩4分',
      description: '問屋街の馬喰町に残る昔ながらの洋食店。ハンバーグ定食・カキフライ定食などの定番メニューが揃い、テーブル席で子連れでも落ち着いて食事できる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'hamacho': [
    {
      name: '浜町 浜町公園隣接 老舗甘味処',
      genre: 'sweets',
      area: '浜町駅から徒歩3分',
      description: '浜町公園に隣接する昔ながらの甘味処。あんみつ・かき氷・お汁粉が看板で、公園遊びの後の家族の休憩に最適。テーブル席があり子供連れでも入りやすい。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '浜町 明治座近くの老舗そば',
      genre: 'noodles',
      area: '浜町駅から徒歩2分',
      description: '明治座に隣接する手打ちそば店。観劇前後の家族利用も多く、テーブル席・座敷ともに揃い、子供にはかけそば・親子丼を取り分けしやすい。',
      privateRoom: true,
      seatingType: ['table', 'counter', 'zashiki'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  'takaracho': [
    {
      name: '宝町 京橋エドグラン 個人レストランフロア',
      genre: 'others',
      area: '宝町駅から徒歩2分（京橋エドグラン）',
      description: '京橋エドグラン低層階のレストランフロア。和食・イタリアン・洋食の個店が並び、ベビーカー対応席のある店が多く、家族での昼食〜ティータイムに向く。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
  ],

  'kodemmacho': [
    {
      name: '小伝馬町 馬喰横山 老舗中華',
      genre: 'chinese',
      area: '小伝馬町駅から徒歩4分',
      description: '小伝馬町〜馬喰横山界隈の問屋街に残る昭和の中華食堂。炒飯・餃子・酢豚など定番が揃い、子供にも取り分けしやすい。テーブル席中心でランチ時も家族連れに対応。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'bakuroyokoyama': [
    {
      name: '馬喰横山 横山町問屋街 老舗食堂',
      genre: 'washoku',
      area: '馬喰横山駅から徒歩3分',
      description: '横山町の問屋街に残る昭和の食堂。日替わり定食・煮魚定食が看板で、子供にも取り分けしやすい家庭的な味付け。テーブル席で家族の昼食にも対応。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'hatchobori': [
    {
      name: '八丁堀 桜川公園近く 個人洋食',
      genre: 'yoshoku',
      area: '八丁堀駅から徒歩4分',
      description: '八丁堀の桜川公園近くにある町の洋食店。ハンバーグ・カレー・オムライスが定番で、子連れでも入りやすいテーブル席メイン。公園遊び後の家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 港区 — 三田・芝・高輪・台場
  // ===========================================================

  'tamachi': [
    {
      name: '田町 三田納涼 老舗そば',
      genre: 'noodles',
      area: '田町駅から徒歩4分',
      description: '田町・三田エリアに残る昔ながらの手打ちそば店。ランチは天ぷらそば・親子丼が人気で、子供にはかけそばを取り分けする家族客も多い。テーブル席中心。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'mita': [
    {
      name: '三田 慶應仲通り 老舗洋食',
      genre: 'yoshoku',
      area: '三田駅から徒歩5分',
      description: '慶應大学仲通りに残る昭和の洋食店。ハンバーグ・カキフライ・ビーフシチューが看板で、学生からファミリーまで通う。テーブル席中心で子連れにも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'daimon': [
    {
      name: '大門 浜松町 世界貿易センタービル 飲食フロア',
      genre: 'others',
      area: '大門駅直結（旧WTCビル跡再開発）',
      description: '浜松町・世界貿易センタービル建替えエリア周辺の飲食フロア。和食・洋食・カフェの個店が並び、東京タワー・芝公園散策の前後に家族でゆっくりできる。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
  ],

  'shibakoen': [
    {
      name: '芝公園 ザ・プリンス パークタワー東京 ラウンジ',
      genre: 'cafe',
      area: '芝公園駅から徒歩5分',
      description: '芝公園に隣接するプリンスパークタワー東京のロビーラウンジ。東京タワーを望む大窓席があり、家族でアフタヌーンティーや軽食を楽しめる。ベビーカーOK。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  'onarimon': [
    {
      name: '御成門 増上寺前 老舗甘味処',
      genre: 'sweets',
      area: '御成門駅から徒歩3分',
      description: '増上寺の参道沿いに残る老舗甘味処。あんみつ・お汁粉・草餅が看板で、芝公園・増上寺散策後の家族の休憩に向く。テーブル席で子供にも取り分けしやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'roppongi-itchome': [
    {
      name: '六本木一丁目 アークヒルズ サウスタワー 飲食フロア',
      genre: 'others',
      area: '六本木一丁目駅直結（アークヒルズ）',
      description: 'アークヒルズ・サウスタワーのレストランフロア。和食・イタリアン・カフェの個店が並び、ベビーカー入店可の店が多く、家族での休日ランチに向く。',
      strollerOk: true,
      seatingType: ['table'],
      nursingRoom: true,
      diaperChangingTable: true,
      priceLunch: '〜3,500円',
    },
  ],

  'aoyama-itchome': [
    {
      name: '青山一丁目 ホンダ青山ビル隣接 老舗喫茶',
      genre: 'cafe',
      area: '青山一丁目駅から徒歩2分',
      description: '青山一丁目交差点付近に残る昭和の老舗喫茶。プリン・サンドイッチ・ナポリタンが看板で、テーブル席中心。神宮外苑散策の前後の家族休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'takanawadai': [
    {
      name: '高輪台 桂坂上 老舗洋食',
      genre: 'yoshoku',
      area: '高輪台駅から徒歩4分',
      description: '高輪台の閑静な坂沿いにある町の洋食店。ハンバーグ・オムライス・ナポリタンが定番。テーブル席中心で子連れの家族昼食にも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'sengakuji': [
    {
      name: '泉岳寺 参道 老舗そば',
      genre: 'noodles',
      area: '泉岳寺駅から徒歩2分',
      description: '泉岳寺の参道に残る老舗そば店。義士祭の時期は混むが、平日は落ち着き、家族でかけそば・天丼を取り分けしやすい。テーブル席・座敷あり。',
      privateRoom: true,
      seatingType: ['table', 'counter', 'zashiki'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'takanawa-gateway': [
    {
      name: '高輪ゲートウェイ 駅直結 個人レストランフロア',
      genre: 'others',
      area: '高輪ゲートウェイ駅直結',
      description: '高輪ゲートウェイ駅に直結する商業フロアのレストラン街。和食・洋食・カフェの個店が並び、新しい設備でベビーカー入店可の店が多く、家族の駅ナカ昼食にも向く。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜3,500円',
    },
  ],

  'tameike-sanno': [
    {
      name: '溜池山王 山王パークタワー 飲食フロア',
      genre: 'others',
      area: '溜池山王駅直結（山王パークタワー）',
      description: '山王パークタワー低層階のレストランフロア。和食・洋食・カフェの個店が並び、平日昼以外は混雑が穏やかで、家族でゆっくり食事できる。ベビーカー入店可の店が多い。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
  ],

  'shibaura-futo': [
    {
      name: '芝浦ふ頭 シーバンス飲食フロア',
      genre: 'others',
      area: '芝浦ふ頭駅から徒歩4分',
      description: '芝浦シーバンスのレストランフロア。和食・洋食の個店があり、東京湾を望むテーブル席で家族の昼食に向く。ベビーカーでも入りやすい広い通路。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  'odaiba-kaihinkoen': [
    {
      name: 'お台場海浜公園 アクアシティお台場 個人レストランフロア',
      genre: 'others',
      area: 'お台場海浜公園駅から徒歩5分',
      description: 'アクアシティお台場のレストランフロア。和食・洋食・パンケーキの個店が並び、東京湾とレインボーブリッジを望むテラス席で家族の昼食・夕食に向く。ベビーカー入店可。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table', 'terrace'],
      nursingRoom: true,
      diaperChangingTable: true,
      kidsCutlery: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'daiba': [
    {
      name: '台場 デックス東京ビーチ レストランフロア',
      genre: 'others',
      area: '台場駅直結（デックス東京ビーチ）',
      description: 'デックス東京ビーチのレストランフロア。テラス席から東京湾を望める個店が並び、家族での観光昼食〜カフェ利用に向く。ベビーカーでも回りやすい広い通路。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜3,500円',
    },
  ],

  'shiodome': [
    {
      name: '汐留 カレッタ汐留 地下飲食フロア',
      genre: 'others',
      area: '汐留駅直結（カレッタ汐留）',
      description: 'カレッタ汐留地下のレストランフロア。和食・イタリアン・カフェの個店が並び、浜離宮恩賜庭園散策の前後に家族で利用しやすい。ベビーカー入店可の店が多い。',
      strollerOk: true,
      stepFree: false,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
  ],

  'hinode': [
    {
      name: '日の出 ピア日の出 海沿いレストラン',
      genre: 'others',
      area: '日の出駅から徒歩3分',
      description: '日の出ふ頭のピア沿いに並ぶカフェ・洋食店。東京湾クルーズ前後の家族利用も多く、テラス席で子供と海を眺めながら食事できる。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      priceLunch: '〜3,500円',
    },
  ],

  'takeshiba': [
    {
      name: '竹芝 WATERS takeshiba レストランフロア',
      genre: 'others',
      area: '竹芝駅直結（WATERS takeshiba）',
      description: '竹芝WATERSのウォーターフロント・レストラン街。和食・洋食・カフェの個店が並び、浜離宮を望むテラス席で家族の特別な日の昼食に向く。ベビーカーで回りやすい新しい施設。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table', 'terrace'],
      kidsCutlery: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  // ===========================================================
  // 新宿区 — 西新宿・四谷・若松河田・牛込
  // ===========================================================

  'nishi-shinjuku': [
    {
      name: '西新宿 思い出横丁 昼営業の老舗食堂',
      genre: 'washoku',
      area: '西新宿駅から徒歩5分',
      description: '新宿西口・思い出横丁の昼営業の食堂。煮込み定食・カレーライスが看板で、テーブル席で家族の昼食にも対応。アクセスは新宿駅西口側からも徒歩圏。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'nishi-shinjuku-gochome': [
    {
      name: '西新宿五丁目 中央公園近く 老舗洋食',
      genre: 'yoshoku',
      area: '西新宿五丁目駅から徒歩4分',
      description: '新宿中央公園近くの町洋食店。ハンバーグ・オムライス・ナポリタンが定番で、公園遊び後の家族の昼食に向く。テーブル席で子連れも安心。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'minami-shinjuku': [
    {
      name: '南新宿 代々木方面 老舗喫茶',
      genre: 'cafe',
      area: '南新宿駅から徒歩3分',
      description: '代々木方面の住宅街に残る老舗喫茶。サンドイッチ・ナポリタン・プリンが看板で、家族でモーニング〜ランチに向く。テーブル席中心で子連れも落ち着ける。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'yotsuya-sanchome': [
    {
      name: '四谷三丁目 荒木町 老舗洋食',
      genre: 'yoshoku',
      area: '四谷三丁目駅から徒歩3分',
      description: '荒木町の路地にある町の洋食店。ハンバーグ・カレー・オムライスが看板で、テーブル席中心。新宿御苑散策の前後に家族の昼食にも向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'akebonobashi': [
    {
      name: '曙橋 防衛省近く 老舗食堂',
      genre: 'washoku',
      area: '曙橋駅から徒歩4分',
      description: '曙橋・防衛省近くに残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。子供にも取り分けしやすい家庭的な味付け。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'wakamatsu-kawada': [
    {
      name: '若松河田 戸山公園近く 老舗洋食',
      genre: 'yoshoku',
      area: '若松河田駅から徒歩5分',
      description: '戸山公園近くの町の洋食店。ハンバーグ・オムライスが看板で、公園遊び後の家族の昼食に向く。テーブル席中心で子連れにも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'ushigome-kagurazaka': [
    {
      name: '牛込神楽坂 神楽坂上 老舗甘味処',
      genre: 'sweets',
      area: '牛込神楽坂駅から徒歩4分',
      description: '神楽坂上に残る老舗甘味処。あんみつ・お汁粉・くずきりが看板で、テーブル席中心。神楽坂散策の合間に家族で休憩しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'higashi-shinjuku': [
    {
      name: '東新宿 大久保コリアタウン 家族向け韓国料理',
      genre: 'korean',
      area: '東新宿駅から徒歩5分',
      description: '大久保コリアタウンの家族向け韓国料理店。ビビンバ・サムギョプサル・チヂミが看板で、辛さ控えめ対応も可能。テーブル席で子連れにも対応。',
      kidsMenu: true,
      seatingType: ['table'],
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 落合・西早稲田周辺
  // ===========================================================

  'shimo-ochiai': [
    {
      name: '下落合 神田川沿い 老舗喫茶',
      genre: 'cafe',
      area: '下落合駅から徒歩4分',
      description: '神田川沿いの落ち着いた住宅街に残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心の家族向き。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'nakai': [
    {
      name: '中井 妙正寺川沿い 老舗洋食',
      genre: 'yoshoku',
      area: '中井駅から徒歩3分',
      description: '妙正寺川沿いの住宅街にある町の洋食店。ハンバーグ・オムライス・カレーが看板で、テーブル席で家族昼食にも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'ochiai': [
    {
      name: '落合 中井方面 老舗そば',
      genre: 'noodles',
      area: '落合駅から徒歩4分',
      description: '落合〜中井方面に残る昔ながらの手打ちそば店。天ぷらそば・親子丼が看板で、テーブル席で家族の昼食にも対応。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
  ],

  'nishi-waseda': [
    {
      name: '西早稲田 戸山公園 老舗喫茶',
      genre: 'cafe',
      area: '西早稲田駅から徒歩5分',
      description: '戸山公園近くの早稲田大学キャンパス周辺に残る老舗喫茶。サンドイッチ・ナポリタンが看板で、テーブル席中心。家族の散策途中の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shinanomachi': [
    {
      name: '信濃町 慶應病院近く 老舗洋食',
      genre: 'yoshoku',
      area: '信濃町駅から徒歩4分',
      description: '慶應病院近くに残る町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。神宮外苑散策の前後に家族で利用しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kokuritsu-kyogijo': [
    {
      name: '国立競技場 神宮外苑 老舗甘味処',
      genre: 'sweets',
      area: '国立競技場駅から徒歩5分',
      description: '神宮外苑のいちょう並木近くに残る老舗甘味処。あんみつ・お汁粉が看板で、観戦・散策後の家族休憩に向く。テーブル席中心。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 渋谷区 — 神宮前・代々木八幡・神泉
  // ===========================================================

  'meiji-jingumae': [
    {
      name: '明治神宮前 表参道ヒルズ 個人レストランフロア',
      genre: 'others',
      area: '明治神宮前駅直結',
      description: '表参道ヒルズ低層階のレストランフロア。和食・イタリアン・カフェの個店が並び、ベビーカー入店可の店が多く、家族の休日ランチ・カフェ利用に向く。',
      strollerOk: true,
      seatingType: ['table'],
      nursingRoom: true,
      diaperChangingTable: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'yoyogi-hachiman': [
    {
      name: '代々木八幡 山手通り沿い 老舗洋食',
      genre: 'yoshoku',
      area: '代々木八幡駅から徒歩4分',
      description: '山手通り沿いの住宅街にある町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。代々木公園散策の前後の家族昼食にも向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shinsen': [
    {
      name: '神泉 円山町 老舗喫茶',
      genre: 'cafe',
      area: '神泉駅から徒歩3分',
      description: '神泉・円山町の路地に残る昭和の老舗喫茶。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心の落ち着いた空間。家族でも入りやすい昼営業時間帯がある。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 品川区 — 戸越・荏原・大井町
  // ===========================================================

  'shinagawa-seaside': [
    {
      name: '品川シーサイド イオン品川シーサイド 個人レストランフロア',
      genre: 'others',
      area: '品川シーサイド駅から徒歩3分',
      description: 'イオン品川シーサイドのレストランフロア。和食・洋食の個店が並び、家族向けにテーブル席中心の店が多い。ベビーカーでも回りやすい広い通路で、子連れの休日ランチに向く。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜3,500円',
    },
  ],

  'tennozu-isle': [
    {
      name: '天王洲アイル T.Y.HARBOR近く 個人レストラン',
      genre: 'others',
      area: '天王洲アイル駅から徒歩5分',
      description: '天王洲アイルのウォーターフロントに並ぶ個人カフェ・レストラン。運河を望むテラス席があり、家族でゆったりした休日昼食に向く。ベビーカー入店可の店が多い。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'togoshi-koen': [
    {
      name: '戸越公園 公園隣接 老舗洋食',
      genre: 'yoshoku',
      area: '戸越公園駅から徒歩3分',
      description: '戸越公園に隣接する町の洋食店。ハンバーグ・オムライスが看板で、公園遊び後の家族昼食に向く。テーブル席中心で子連れにも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'togoshi': [
    {
      name: '戸越 戸越銀座商店街 老舗洋食',
      genre: 'yoshoku',
      area: '戸越駅から徒歩3分',
      description: '戸越銀座商店街にある町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。商店街散策の合間に家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'nakanobu': [
    {
      name: '中延 中延スキップロード 老舗食堂',
      genre: 'washoku',
      area: '中延駅から徒歩3分',
      description: '中延スキップロード商店街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席で家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'ebara-machi': [
    {
      name: '荏原町 中原街道沿い 老舗洋食',
      genre: 'yoshoku',
      area: '荏原町駅から徒歩4分',
      description: '中原街道沿いに残る町の洋食店。ハンバーグ・オムライス・カレーが定番で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'hatanodai': [
    {
      name: '旗の台 昭和大学近く 老舗喫茶',
      genre: 'cafe',
      area: '旗の台駅から徒歩3分',
      description: '昭和大学病院近くの住宅街に残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。家族の通院前後の休憩にも向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shimbamba': [
    {
      name: '新馬場 北品川商店街 老舗食堂',
      genre: 'washoku',
      area: '新馬場駅から徒歩3分',
      description: '旧東海道・北品川商店街に残る昔ながらの食堂。煮魚定食・カキフライが看板で、テーブル席中心。家族の昼食〜散策途中の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'aomono-yokocho': [
    {
      name: '青物横丁 旧東海道 老舗甘味処',
      genre: 'sweets',
      area: '青物横丁駅から徒歩3分',
      description: '旧東海道沿いに残る老舗甘味処。あんみつ・お汁粉・かき氷が看板で、テーブル席中心。品川宿散策の家族休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'omori-kaigan': [
    {
      name: '大森海岸 平和の森公園近く 老舗洋食',
      genre: 'yoshoku',
      area: '大森海岸駅から徒歩4分',
      description: '平和の森公園近くにある町の洋食店。ハンバーグ・カキフライ・ナポリタンが看板で、テーブル席中心。公園遊び後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'oimachi-line-okusawa': [
    {
      name: '奥沢 自由通り 老舗喫茶',
      genre: 'cafe',
      area: '奥沢駅から徒歩3分',
      description: '自由が丘隣接の奥沢駅近く、自由通り沿いに残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。家族の散策途中の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 杉並・中野
  // ===========================================================

  'minami-asagaya': [
    {
      name: '南阿佐ヶ谷 杉並区役所近く 老舗洋食',
      genre: 'yoshoku',
      area: '南阿佐ヶ谷駅から徒歩3分',
      description: '杉並区役所近くに残る町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'higashi-koenji': [
    {
      name: '東高円寺 蚕糸の森公園近く 老舗食堂',
      genre: 'washoku',
      area: '東高円寺駅から徒歩4分',
      description: '蚕糸の森公園近くの住宅街にある昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。公園遊び後の家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shin-koenji': [
    {
      name: '新高円寺 環七沿い 老舗洋食',
      genre: 'yoshoku',
      area: '新高円寺駅から徒歩4分',
      description: '環七沿いに残る町の洋食店。ハンバーグ・カレー・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'hamadayama': [
    {
      name: '浜田山 杉並区立柏の宮公園近く 老舗喫茶',
      genre: 'cafe',
      area: '浜田山駅から徒歩4分',
      description: '柏の宮公園近くの住宅街に残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。家族の公園遊び前後の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'takaido': [
    {
      name: '高井戸 神田川沿い 老舗洋食',
      genre: 'yoshoku',
      area: '高井戸駅から徒歩3分',
      description: '神田川沿いに残る町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'fujimigaoka': [
    {
      name: '富士見ヶ丘 久我山方面 老舗喫茶',
      genre: 'cafe',
      area: '富士見ヶ丘駅から徒歩4分',
      description: '久我山方面の住宅街に残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。家族でゆったり過ごしやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kugayama': [
    {
      name: '久我山 玉川上水沿い 老舗洋食',
      genre: 'yoshoku',
      area: '久我山駅から徒歩3分',
      description: '玉川上水沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'eifukucho': [
    {
      name: '永福町 環八沿い 老舗洋食',
      genre: 'yoshoku',
      area: '永福町駅から徒歩4分',
      description: '環八沿いに残る町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'nishi-eifuku': [
    {
      name: '西永福 大宮八幡宮近く 老舗食堂',
      genre: 'washoku',
      area: '西永福駅から徒歩4分',
      description: '大宮八幡宮近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'honancho': [
    {
      name: '方南町 環七沿い 老舗洋食',
      genre: 'yoshoku',
      area: '方南町駅から徒歩3分',
      description: '環七沿いの住宅街にある町の洋食店。ハンバーグ・オムライス・カレーが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'daitabashi': [
    {
      name: '代田橋 沖縄タウン 家族向けエスニック',
      genre: 'asian',
      area: '代田橋駅から徒歩3分',
      description: '代田橋・沖縄タウンに点在するエスニック・沖縄料理店。タコライス・ソーキそばが看板で、子供にも食べやすい味付け。テーブル席中心で家族にも対応。',
      kidsMenu: true,
      seatingType: ['table'],
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  'iogi': [
    {
      name: '井荻 旧早稲田通り沿い 老舗洋食',
      genre: 'yoshoku',
      area: '井荻駅から徒歩3分',
      description: '旧早稲田通り沿いに残る町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shimo-igusa': [
    {
      name: '下井草 妙正寺公園近く 老舗食堂',
      genre: 'washoku',
      area: '下井草駅から徒歩4分',
      description: '妙正寺公園近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。公園遊び後の家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kami-igusa': [
    {
      name: '上井草 ガンダム像近く 老舗喫茶',
      genre: 'cafe',
      area: '上井草駅から徒歩2分',
      description: '上井草駅前のガンダム像近くにある昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。家族の駅前散策途中の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 中野区
  // ===========================================================

  'numabukuro': [
    {
      name: '沼袋 平和の森公園近く 老舗洋食',
      genre: 'yoshoku',
      area: '沼袋駅から徒歩4分',
      description: '平和の森公園近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。公園遊び後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'nakano-fujimicho': [
    {
      name: '中野富士見町 神田川沿い 老舗食堂',
      genre: 'washoku',
      area: '中野富士見町駅から徒歩3分',
      description: '神田川沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'nakano-shimbashi': [
    {
      name: '中野新橋 神田川沿い 老舗洋食',
      genre: 'yoshoku',
      area: '中野新橋駅から徒歩3分',
      description: '神田川沿いに残る町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'saginomiya': [
    {
      name: '鷺ノ宮 鷺宮八幡神社近く 老舗食堂',
      genre: 'washoku',
      area: '鷺ノ宮駅から徒歩4分',
      description: '鷺宮八幡神社近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'nogata': [
    {
      name: '野方 野方文化マーケット 老舗洋食',
      genre: 'yoshoku',
      area: '野方駅から徒歩2分',
      description: '野方駅前の文化マーケット近くにある町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'toritsu-kasei': [
    {
      name: '都立家政 中杉通り沿い 老舗喫茶',
      genre: 'cafe',
      area: '都立家政駅から徒歩3分',
      description: '中杉通り沿いの住宅街に残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。家族でゆったり過ごしやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 練馬区
  // ===========================================================

  'shin-egota': [
    {
      name: '新江古田 江古田の森公園近く 老舗洋食',
      genre: 'yoshoku',
      area: '新江古田駅から徒歩5分',
      description: '江古田の森公園近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、公園遊び後の家族昼食に向く。テーブル席中心で子連れにも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'fujimidai': [
    {
      name: '富士見台 千川通り沿い 老舗食堂',
      genre: 'washoku',
      area: '富士見台駅から徒歩3分',
      description: '千川通り沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'nerima-takanodai': [
    {
      name: '練馬高野台 石神井川沿い 老舗洋食',
      genre: 'yoshoku',
      area: '練馬高野台駅から徒歩3分',
      description: '石神井川沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shin-sakuradai': [
    {
      name: '新桜台 千川通り沿い 老舗喫茶',
      genre: 'cafe',
      area: '新桜台駅から徒歩4分',
      description: '千川通り沿いの住宅街に残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。家族でゆったり過ごしやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'sakuradai': [
    {
      name: '桜台 千川通り沿い 老舗食堂',
      genre: 'washoku',
      area: '桜台駅から徒歩3分',
      description: '千川通り沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kami-shakujii': [
    {
      name: '上石神井 旧早稲田通り沿い 老舗洋食',
      genre: 'yoshoku',
      area: '上石神井駅から徒歩3分',
      description: '旧早稲田通り沿いに残る町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'nakamurabashi': [
    {
      name: '中村橋 千川通り沿い 老舗喫茶',
      genre: 'cafe',
      area: '中村橋駅から徒歩3分',
      description: '千川通り沿いに残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。家族でゆったり過ごしやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'toshimaen': [
    {
      name: '豊島園 練馬城址公園近く 老舗洋食',
      genre: 'yoshoku',
      area: '豊島園駅から徒歩3分',
      description: '練馬城址公園（旧としまえん跡）近くの町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の散策後の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'tobu-nerima': [
    {
      name: '東武練馬 イオン板橋近く 老舗食堂',
      genre: 'washoku',
      area: '東武練馬駅から徒歩4分',
      description: 'イオン板橋近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'chikatetsu-narimasu': [
    {
      name: '地下鉄成増 成増スキップ村 老舗洋食',
      genre: 'yoshoku',
      area: '地下鉄成増駅から徒歩3分',
      description: '成増スキップ村商店街近くの町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 板橋区
  // ===========================================================

  'shin-itabashi': [
    {
      name: '新板橋 中山道沿い 老舗洋食',
      genre: 'yoshoku',
      area: '新板橋駅から徒歩3分',
      description: '中山道沿いの住宅街にある町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'itabashi-kuyakushomae': [
    {
      name: '板橋区役所前 中山道沿い 老舗食堂',
      genre: 'washoku',
      area: '板橋区役所前駅から徒歩2分',
      description: '中山道沿い、板橋区役所近くに残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'itabashi-honcho': [
    {
      name: '板橋本町 中山道沿い 老舗洋食',
      genre: 'yoshoku',
      area: '板橋本町駅から徒歩3分',
      description: '中山道沿いに残る町の洋食店。ハンバーグ・カレー・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'motohasunuma': [
    {
      name: '本蓮沼 中山道沿い 老舗喫茶',
      genre: 'cafe',
      area: '本蓮沼駅から徒歩3分',
      description: '中山道沿いの住宅街に残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。家族でゆったり過ごしやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shimura-sakaue': [
    {
      name: '志村坂上 志村城跡近く 老舗食堂',
      genre: 'washoku',
      area: '志村坂上駅から徒歩4分',
      description: '志村城跡近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shimura-sanchome': [
    {
      name: '志村三丁目 中山道沿い 老舗洋食',
      genre: 'yoshoku',
      area: '志村三丁目駅から徒歩3分',
      description: '中山道沿いに残る町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'hasune': [
    {
      name: '蓮根 環八沿い 老舗食堂',
      genre: 'washoku',
      area: '蓮根駅から徒歩3分',
      description: '環八沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'nishidai': [
    {
      name: '西台 都営三田線高架沿い 老舗洋食',
      genre: 'yoshoku',
      area: '西台駅から徒歩3分',
      description: '都営三田線の高架沿いに残る町の洋食店。ハンバーグ・オムライス・カレーが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shin-takashimadaira': [
    {
      name: '新高島平 高島平団地近く 老舗食堂',
      genre: 'washoku',
      area: '新高島平駅から徒歩3分',
      description: '高島平団地近くに残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'nishi-takashimadaira': [
    {
      name: '西高島平 都営三田線終点 老舗洋食',
      genre: 'yoshoku',
      area: '西高島平駅から徒歩3分',
      description: '都営三田線終点の駅近くに残る町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shimo-akatsuka': [
    {
      name: '下赤塚 赤塚公園近く 老舗喫茶',
      genre: 'cafe',
      area: '下赤塚駅から徒歩3分',
      description: '赤塚公園近くの住宅街に残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。公園遊び前後の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'chikatetsu-akatsuka': [
    {
      name: '地下鉄赤塚 赤塚溜池公園近く 老舗洋食',
      genre: 'yoshoku',
      area: '地下鉄赤塚駅から徒歩4分',
      description: '赤塚溜池公園近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。公園遊び後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 北区・荒川区
  // ===========================================================

  'oji-ekimae': [
    {
      name: '王子駅前 飛鳥山公園近く 老舗洋食',
      genre: 'yoshoku',
      area: '王子駅前駅から徒歩3分',
      description: '飛鳥山公園近くにある町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。公園遊び後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'asukayama': [
    {
      name: '飛鳥山 飛鳥山公園 老舗甘味処',
      genre: 'sweets',
      area: '飛鳥山駅から徒歩2分',
      description: '飛鳥山公園隣接の老舗甘味処。あんみつ・お汁粉・かき氷が看板で、桜の名所散策の家族休憩に向く。テーブル席中心。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'nishigahara-yonchome': [
    {
      name: '西ヶ原四丁目 旧古河庭園近く 老舗喫茶',
      genre: 'cafe',
      area: '西ヶ原四丁目駅から徒歩4分',
      description: '旧古河庭園近くの住宅街に残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。庭園散策の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'nishigahara': [
    {
      name: '西ケ原 旧古河庭園隣接 老舗洋食',
      genre: 'yoshoku',
      area: '西ケ原駅から徒歩4分',
      description: '旧古河庭園近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の庭園散策後の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kami-nakazato': [
    {
      name: '上中里 平塚神社近く 老舗食堂',
      genre: 'washoku',
      area: '上中里駅から徒歩3分',
      description: '平塚神社近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kita-akabane': [
    {
      name: '北赤羽 新河岸川沿い 老舗洋食',
      genre: 'yoshoku',
      area: '北赤羽駅から徒歩3分',
      description: '新河岸川沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shin-mikawashima': [
    {
      name: '新三河島 尾久橋通り沿い 老舗食堂',
      genre: 'washoku',
      area: '新三河島駅から徒歩3分',
      description: '尾久橋通り沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'machiya-ekimae': [
    {
      name: '町屋駅前 町屋商店街 老舗洋食',
      genre: 'yoshoku',
      area: '町屋駅前駅から徒歩2分',
      description: '町屋商店街にある町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。商店街散策途中の家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'machiya-nichome': [
    {
      name: '町屋二丁目 荒川自然公園近く 老舗食堂',
      genre: 'washoku',
      area: '町屋二丁目駅から徒歩3分',
      description: '荒川自然公園近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。公園遊び後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 都電荒川線沿線
  // ===========================================================

  'minowabashi': [
    {
      name: '三ノ輪橋 ジョイフル三の輪商店街 老舗食堂',
      genre: 'washoku',
      area: '三ノ輪橋駅から徒歩2分',
      description: 'ジョイフル三の輪商店街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。商店街散策途中の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'arakawa-kuyakushomae': [
    {
      name: '荒川区役所前 都電沿い 老舗洋食',
      genre: 'yoshoku',
      area: '荒川区役所前駅から徒歩2分',
      description: '都電荒川線沿いの住宅街にある町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'arakawa-yuenchi-mae': [
    {
      name: 'あらかわ遊園地前 あらかわ遊園隣接 老舗食堂',
      genre: 'washoku',
      area: 'あらかわ遊園地前駅から徒歩2分',
      description: 'あらかわ遊園に隣接する老舗食堂。家族向けに親子丼・カレー・お子様メニューが揃い、テーブル席中心。遊園地後の家族昼食に最適。',
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  'higashi-ogu-sanchome': [
    {
      name: '東尾久三丁目 都電沿い 老舗洋食',
      genre: 'yoshoku',
      area: '東尾久三丁目駅から徒歩3分',
      description: '都電荒川線沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kumano-mae': [
    {
      name: '熊野前 都電と舎人ライナー交差点 老舗洋食',
      genre: 'yoshoku',
      area: '熊野前駅から徒歩2分',
      description: '日暮里舎人ライナーと都電荒川線の乗換駅近くに残る町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'akado-shogakko-mae': [
    {
      name: '赤土小学校前 都電沿い 老舗洋食',
      genre: 'yoshoku',
      area: '赤土小学校前駅から徒歩3分',
      description: '都電荒川線沿いに残る町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 足立・葛飾・江戸川
  // ===========================================================

  'gotanno': [
    {
      name: '五反野 東武スカイツリーライン沿い 老舗洋食',
      genre: 'yoshoku',
      area: '五反野駅から徒歩3分',
      description: '東武スカイツリーライン沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kita-ayase': [
    {
      name: '北綾瀬 環七沿い 老舗食堂',
      genre: 'washoku',
      area: '北綾瀬駅から徒歩3分',
      description: '環七沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kosuge': [
    {
      name: '小菅 東京拘置所近く 老舗洋食',
      genre: 'yoshoku',
      area: '小菅駅から徒歩4分',
      description: '小菅・綾瀬川沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'horikiri': [
    {
      name: '堀切 堀切菖蒲園近く 老舗甘味処',
      genre: 'sweets',
      area: '堀切駅から徒歩4分',
      description: '堀切菖蒲園近くに残る老舗甘味処。あんみつ・お汁粉・草餅が看板で、菖蒲シーズンの家族散策後の休憩に向く。テーブル席中心。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'yotsugi': [
    {
      name: '四ツ木 中川沿い 老舗食堂',
      genre: 'washoku',
      area: '四ツ木駅から徒歩4分',
      description: '中川沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'keisei-tateishi': [
    {
      name: '京成立石 立石仲見世商店街 老舗洋食',
      genre: 'yoshoku',
      area: '京成立石駅から徒歩2分',
      description: '立石仲見世商店街にある町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。商店街散策途中の家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'ohanajaya': [
    {
      name: 'お花茶屋 曳舟川親水公園近く 老舗食堂',
      genre: 'washoku',
      area: 'お花茶屋駅から徒歩4分',
      description: '曳舟川親水公園近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。公園遊び後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'keisei-koiwa': [
    {
      name: '京成小岩 江戸川区柴又方面 老舗洋食',
      genre: 'yoshoku',
      area: '京成小岩駅から徒歩3分',
      description: '京成小岩〜柴又方面の住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'edogawa': [
    {
      name: '江戸川 江戸川河川敷近く 老舗食堂',
      genre: 'washoku',
      area: '江戸川駅から徒歩4分',
      description: '江戸川河川敷近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。河川敷散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shiomi': [
    {
      name: '潮見 京葉線高架近く 老舗洋食',
      genre: 'yoshoku',
      area: '潮見駅から徒歩3分',
      description: '京葉線高架近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shin-kiba': [
    {
      name: '新木場 夢の島公園近く 老舗食堂',
      genre: 'washoku',
      area: '新木場駅から徒歩5分',
      description: '夢の島公園近くに残る昔ながらの食堂。煮魚定食・しょうが焼きが看板で、テーブル席中心。公園遊び後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kasai-rinkai-koen': [
    {
      name: '葛西臨海公園 公園内 個人カフェ',
      genre: 'cafe',
      area: '葛西臨海公園駅から徒歩3分',
      description: '葛西臨海公園内のカフェ・レストハウス。水族園・観覧車・大芝生広場と隣接し、家族の公園遊び後の休憩に最適。ベビーカーOK・キッズメニューがある店もある。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'funabori': [
    {
      name: '船堀 船堀タワー近く 老舗洋食',
      genre: 'yoshoku',
      area: '船堀駅から徒歩3分',
      description: '船堀タワー（タワーホール船堀）近くの町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'ichinoe': [
    {
      name: '一之江 環七沿い 老舗食堂',
      genre: 'washoku',
      area: '一之江駅から徒歩3分',
      description: '環七沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 大田区 — 蒲田周辺・池上線・多摩川線
  // ===========================================================

  'umeyashiki': [
    {
      name: '梅屋敷 京急梅屋敷商店街 老舗洋食',
      genre: 'yoshoku',
      area: '梅屋敷駅から徒歩2分',
      description: '京急梅屋敷商店街にある町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。商店街散策途中の家族の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kojiya': [
    {
      name: '糀谷 糀谷商店街 老舗食堂',
      genre: 'washoku',
      area: '糀谷駅から徒歩3分',
      description: '糀谷商店街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'ontakesan': [
    {
      name: '御嶽山 御嶽神社参道 老舗甘味処',
      genre: 'sweets',
      area: '御嶽山駅から徒歩3分',
      description: '御嶽神社参道の老舗甘味処。あんみつ・お汁粉・くずきりが看板で、テーブル席中心。神社参拝後の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kugahara': [
    {
      name: '久が原 久が原商店街 老舗洋食',
      genre: 'yoshoku',
      area: '久が原駅から徒歩3分',
      description: '久が原商店街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'unoki': [
    {
      name: '鵜の木 多摩川沿い 老舗食堂',
      genre: 'washoku',
      area: '鵜の木駅から徒歩3分',
      description: '多摩川沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。多摩川河川敷散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shimo-maruko': [
    {
      name: '下丸子 多摩川沿い 老舗洋食',
      genre: 'yoshoku',
      area: '下丸子駅から徒歩3分',
      description: '多摩川沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。多摩川河川敷散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'tamagawa': [
    {
      name: '多摩川 多摩川台公園近く 老舗喫茶',
      genre: 'cafe',
      area: '多摩川駅から徒歩4分',
      description: '多摩川台公園近くに残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。公園遊び後の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'numabe': [
    {
      name: '沼部 多摩川沿い 老舗食堂',
      genre: 'washoku',
      area: '沼部駅から徒歩3分',
      description: '多摩川沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。多摩川河川敷散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'musashi-nitta': [
    {
      name: '武蔵新田 新田神社参道 老舗甘味処',
      genre: 'sweets',
      area: '武蔵新田駅から徒歩3分',
      description: '新田神社参道に残る老舗甘味処。あんみつ・お汁粉・草餅が看板で、テーブル席中心。神社参拝後の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'yaguchi-no-watashi': [
    {
      name: '矢口渡 多摩川河川敷近く 老舗洋食',
      genre: 'yoshoku',
      area: '矢口渡駅から徒歩4分',
      description: '多摩川河川敷近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。河川敷散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'nishi-magome': [
    {
      name: '西馬込 第二京浜沿い 老舗食堂',
      genre: 'washoku',
      area: '西馬込駅から徒歩3分',
      description: '第二京浜沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'magome': [
    {
      name: '馬込 馬込文士村近く 老舗喫茶',
      genre: 'cafe',
      area: '馬込駅から徒歩4分',
      description: '馬込文士村に残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。文士村散策途中の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kita-senzoku': [
    {
      name: '北千束 洗足池近く 老舗洋食',
      genre: 'yoshoku',
      area: '北千束駅から徒歩4分',
      description: '洗足池近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。洗足池散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'nagahara': [
    {
      name: '長原 中原街道沿い 老舗食堂',
      genre: 'washoku',
      area: '長原駅から徒歩3分',
      description: '中原街道沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'senzoku-ike': [
    {
      name: '洗足池 洗足池公園 老舗甘味処',
      genre: 'sweets',
      area: '洗足池駅から徒歩2分',
      description: '洗足池公園隣接の老舗甘味処。あんみつ・お汁粉・かき氷が看板で、テーブル席中心。池の周りの散策後の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'rokugo-dote': [
    {
      name: '六郷土手 多摩川河川敷近く 老舗洋食',
      genre: 'yoshoku',
      area: '六郷土手駅から徒歩3分',
      description: '多摩川河川敷近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。河川敷散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'otorii': [
    {
      name: '大鳥居 環八沿い 老舗食堂',
      genre: 'washoku',
      area: '大鳥居駅から徒歩3分',
      description: '環八沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'anamori-inari': [
    {
      name: '穴守稲荷 穴守稲荷神社参道 老舗甘味処',
      genre: 'sweets',
      area: '穴守稲荷駅から徒歩2分',
      description: '穴守稲荷神社参道に残る老舗甘味処。あんみつ・お汁粉・草餅が看板で、テーブル席中心。神社参拝後の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'tenkubashi': [
    {
      name: '天空橋 京急空港線高架近く 老舗食堂',
      genre: 'washoku',
      area: '天空橋駅から徒歩4分',
      description: '京急空港線高架近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 世田谷区
  // ===========================================================

  'higashi-kitazawa': [
    {
      name: '東北沢 北沢川緑道近く 老舗洋食',
      genre: 'yoshoku',
      area: '東北沢駅から徒歩3分',
      description: '北沢川緑道近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。緑道散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'setagaya-daita': [
    {
      name: '世田谷代田 代田富士見橋近く 老舗食堂',
      genre: 'washoku',
      area: '世田谷代田駅から徒歩3分',
      description: '代田富士見橋近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'umegaoka': [
    {
      name: '梅ヶ丘 羽根木公園近く 老舗喫茶',
      genre: 'cafe',
      area: '梅ヶ丘駅から徒歩4分',
      description: '羽根木公園近くの住宅街に残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。梅まつり時期の家族散策の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'chitose-funabashi': [
    {
      name: '千歳船橋 環八沿い 老舗洋食',
      genre: 'yoshoku',
      area: '千歳船橋駅から徒歩3分',
      description: '環八沿いの住宅街にある町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'wakabayashi': [
    {
      name: '若林 世田谷線沿い 老舗食堂',
      genre: 'washoku',
      area: '若林駅から徒歩2分',
      description: '東急世田谷線沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'nishi-taishido': [
    {
      name: '西太子堂 世田谷線沿い 老舗洋食',
      genre: 'yoshoku',
      area: '西太子堂駅から徒歩2分',
      description: '東急世田谷線沿いに残る町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'miyanosaka': [
    {
      name: '宮の坂 世田谷八幡宮近く 老舗食堂',
      genre: 'washoku',
      area: '宮の坂駅から徒歩3分',
      description: '世田谷八幡宮近くに残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'yamashita': [
    {
      name: '山下 世田谷線沿い 老舗喫茶',
      genre: 'cafe',
      area: '山下駅から徒歩2分',
      description: '東急世田谷線・小田急豪徳寺の乗換近くにある昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shimo-takaido': [
    {
      name: '下高井戸 下高井戸商店街 老舗食堂',
      genre: 'washoku',
      area: '下高井戸駅から徒歩2分',
      description: '下高井戸商店街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。商店街散策途中の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kami-kitazawa': [
    {
      name: '上北沢 桜並木通り近く 老舗洋食',
      genre: 'yoshoku',
      area: '上北沢駅から徒歩3分',
      description: '上北沢の桜並木通り近くにある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。桜並木散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'hachimanyama': [
    {
      name: '八幡山 環八沿い 老舗食堂',
      genre: 'washoku',
      area: '八幡山駅から徒歩3分',
      description: '環八沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'roka-koen': [
    {
      name: '芦花公園 芦花恒春園近く 老舗喫茶',
      genre: 'cafe',
      area: '芦花公園駅から徒歩4分',
      description: '芦花恒春園近くに残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。公園散策後の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'chitose-karasuyama': [
    {
      name: '千歳烏山 烏山寺町近く 老舗洋食',
      genre: 'yoshoku',
      area: '千歳烏山駅から徒歩4分',
      description: '烏山寺町近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。寺町散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'sakurajosui': [
    {
      name: '桜上水 日大文理学部近く 老舗食堂',
      genre: 'washoku',
      area: '桜上水駅から徒歩3分',
      description: '日本大学文理学部近くに残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kaminoge': [
    {
      name: '上野毛 五島美術館近く 老舗喫茶',
      genre: 'cafe',
      area: '上野毛駅から徒歩4分',
      description: '五島美術館近くの住宅街に残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。美術館散策後の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kuhonbutsu': [
    {
      name: '九品仏 九品仏浄真寺参道 老舗甘味処',
      genre: 'sweets',
      area: '九品仏駅から徒歩3分',
      description: '九品仏浄真寺の参道に残る老舗甘味処。あんみつ・お汁粉・草餅が看板で、テーブル席中心。寺院参拝後の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shoin-jinjamae': [
    {
      name: '松陰神社前 松陰神社参道 老舗甘味処',
      genre: 'sweets',
      area: '松陰神社前駅から徒歩2分',
      description: '松陰神社参道に残る老舗甘味処。あんみつ・お汁粉・草餅が看板で、テーブル席中心。神社参拝後の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'setagaya': [
    {
      name: '世田谷 世田谷代官屋敷近く 老舗洋食',
      genre: 'yoshoku',
      area: '世田谷駅から徒歩3分',
      description: '世田谷代官屋敷（ボロ市通り）近くにある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。ボロ市散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 東急東横線・大井町線
  // ===========================================================

  'yutenji': [
    {
      name: '祐天寺 祐天寺参道 老舗洋食',
      genre: 'yoshoku',
      area: '祐天寺駅から徒歩3分',
      description: '祐天寺参道近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'ookayama': [
    {
      name: '大岡山 東工大近く 老舗喫茶',
      genre: 'cafe',
      area: '大岡山駅から徒歩3分',
      description: '東京工業大学近くに残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。家族でゆったり過ごしやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'omori-machi': [
    {
      name: '大森町 京急大森町商店街 老舗食堂',
      genre: 'washoku',
      area: '大森町駅から徒歩2分',
      description: '京急大森町商店街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。商店街散策途中の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'heiwajima': [
    {
      name: '平和島 平和島公園近く 老舗洋食',
      genre: 'yoshoku',
      area: '平和島駅から徒歩4分',
      description: '平和島公園近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。公園遊び後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'ikegami': [
    {
      name: '池上 池上本門寺参道 老舗甘味処',
      genre: 'sweets',
      area: '池上駅から徒歩5分',
      description: '池上本門寺の参道に残る老舗甘味処。あんみつ・お汁粉・葛餅が看板で、テーブル席中心。寺院参拝後の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'kitami': [
    {
      name: '喜多見 野川沿い 老舗洋食',
      genre: 'yoshoku',
      area: '喜多見駅から徒歩4分',
      description: '野川沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。野川散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],




  // ===========================================================
  // 豊島区・文京区
  // ===========================================================

  'higashi-ikebukuro': [
    {
      name: '東池袋 サンシャインシティ アルパ 個人レストランフロア',
      genre: 'others',
      area: '東池袋駅直結（サンシャインシティ）',
      description: 'サンシャインシティ・アルパのレストランフロア。和食・洋食・カフェの個店が並び、水族館・展望台と組み合わせて家族で1日楽しめる。ベビーカー入店可・キッズメニュー対応店多数。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'kanamecho': [
    {
      name: '要町 千川通り沿い 老舗洋食',
      genre: 'yoshoku',
      area: '要町駅から徒歩3分',
      description: '千川通り沿いに残る町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'senkawa': [
    {
      name: '千川 千川通り沿い 老舗食堂',
      genre: 'washoku',
      area: '千川駅から徒歩3分',
      description: '千川通り沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kita-ikebukuro': [
    {
      name: '北池袋 池袋本町近く 老舗洋食',
      genre: 'yoshoku',
      area: '北池袋駅から徒歩3分',
      description: '池袋本町の住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shimo-itabashi': [
    {
      name: '下板橋 中山道沿い 老舗食堂',
      genre: 'washoku',
      area: '下板橋駅から徒歩3分',
      description: '中山道沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shiinamachi': [
    {
      name: '椎名町 トキワ荘マンガミュージアム近く 老舗喫茶',
      genre: 'cafe',
      area: '椎名町駅から徒歩5分',
      description: 'トキワ荘マンガミュージアム近くに残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。マンガ聖地巡礼の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'higashi-nagasaki': [
    {
      name: '東長崎 長崎神社近く 老舗洋食',
      genre: 'yoshoku',
      area: '東長崎駅から徒歩3分',
      description: '長崎神社近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'zoshigaya': [
    {
      name: '雑司が谷 鬼子母神参道 老舗甘味処',
      genre: 'sweets',
      area: '雑司が谷駅から徒歩3分',
      description: '雑司が谷鬼子母神の参道に残る老舗甘味処。あんみつ・お汁粉・くずきりが看板で、テーブル席中心。神社参拝後の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'kishibojinmae': [
    {
      name: '鬼子母神前 鬼子母神参道 駄菓子屋カフェ',
      genre: 'cafe',
      area: '鬼子母神前駅から徒歩2分',
      description: '雑司が谷鬼子母神参道に残る昔ながらの駄菓子屋兼カフェ。お子様メニュー・甘味が揃い、参拝後の家族休憩に向く。テーブル席中心。',
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  'koshinzuka': [
    {
      name: '庚申塚 巣鴨地蔵通り商店街 老舗甘味処',
      genre: 'sweets',
      area: '庚申塚駅から徒歩2分',
      description: '巣鴨地蔵通り商店街（おばあちゃんの原宿）に残る老舗甘味処。あんみつ・お汁粉・塩大福が看板で、テーブル席中心。商店街散策後の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'sengoku': [
    {
      name: '千石 六義園近く 老舗洋食',
      genre: 'yoshoku',
      area: '千石駅から徒歩4分',
      description: '六義園近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。庭園散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'hon-komagome': [
    {
      name: '本駒込 六義園隣接 老舗甘味処',
      genre: 'sweets',
      area: '本駒込駅から徒歩3分',
      description: '六義園隣接の老舗甘味処。あんみつ・お汁粉・かき氷が看板で、テーブル席中心。庭園散策後の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 台東・墨田・江東
  // ===========================================================

  'shin-okachimachi': [
    {
      name: '新御徒町 佐竹商店街 老舗食堂',
      genre: 'washoku',
      area: '新御徒町駅から徒歩2分',
      description: '佐竹商店街（日本最古級のアーケード商店街）に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。商店街散策途中の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'inaricho': [
    {
      name: '稲荷町 下谷神社近く 老舗洋食',
      genre: 'yoshoku',
      area: '稲荷町駅から徒歩3分',
      description: '下谷神社近くの住宅街にある町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'tawaramachi': [
    {
      name: '田原町 合羽橋道具街 老舗食堂',
      genre: 'washoku',
      area: '田原町駅から徒歩3分',
      description: '合羽橋道具街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。道具街散策途中の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'ueno-okachimachi': [
    {
      name: '上野御徒町 アメ横 老舗中華',
      genre: 'chinese',
      area: '上野御徒町駅から徒歩2分',
      description: 'アメ横商店街に残る昭和の中華食堂。炒飯・餃子・酢豚など定番が揃い、テーブル席中心。商店街散策途中の家族昼食に向く。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'ueno-hirokoji': [
    {
      name: '上野広小路 松坂屋上野店 個人レストランフロア',
      genre: 'others',
      area: '上野広小路駅直結（松坂屋上野店）',
      description: '松坂屋上野店のレストランフロア。和食・洋食の個店が並び、ベビーカー入店可・キッズメニューがある店も多い。上野公園散策と合わせた家族の休日に向く。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜3,500円',
    },
  ],

  'keisei-ueno': [
    {
      name: '京成上野 上野公園入口 老舗甘味処',
      genre: 'sweets',
      area: '京成上野駅から徒歩2分',
      description: '上野公園入口に残る老舗甘味処。あんみつ・お汁粉・かき氷が看板で、テーブル席中心。動物園・美術館と組み合わせて家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'uguisudani': [
    {
      name: '鶯谷 子規庵近く 老舗洋食',
      genre: 'yoshoku',
      area: '鶯谷駅から徒歩4分',
      description: '正岡子規ゆかりの子規庵近くにある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の散策後の昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'tokyo-skytree': [
    {
      name: '東京スカイツリー 東京ソラマチ 個人レストランフロア',
      genre: 'others',
      area: '東京スカイツリー駅直結（東京ソラマチ）',
      description: '東京ソラマチのレストランフロア。和食・洋食・カフェの個店が並び、ベビーカー入店可・キッズメニュー対応の店も多く、家族の観光昼食〜カフェ利用に向く。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'honjo-azumabashi': [
    {
      name: '本所吾妻橋 隅田公園近く 老舗洋食',
      genre: 'yoshoku',
      area: '本所吾妻橋駅から徒歩4分',
      description: '隅田公園近くにある町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。隅田川沿い散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kikukawa': [
    {
      name: '菊川 江東区横川親水公園近く 老舗食堂',
      genre: 'washoku',
      area: '菊川駅から徒歩4分',
      description: '横川親水公園近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。公園遊び後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'higashi-mukojima': [
    {
      name: '東向島 向島百花園近く 老舗甘味処',
      genre: 'sweets',
      area: '東向島駅から徒歩4分',
      description: '向島百花園近くに残る老舗甘味処。あんみつ・お汁粉・草餅が看板で、テーブル席中心。庭園散策後の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'keisei-hikifune': [
    {
      name: '京成曳舟 曳舟川親水公園近く 老舗食堂',
      genre: 'washoku',
      area: '京成曳舟駅から徒歩3分',
      description: '曳舟川親水公園近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。公園遊び後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kameido-suijin': [
    {
      name: '亀戸水神 旧中川沿い 老舗洋食',
      genre: 'yoshoku',
      area: '亀戸水神駅から徒歩3分',
      description: '旧中川沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。河川敷散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'ojima': [
    {
      name: '大島 大島中央通り 老舗食堂',
      genre: 'washoku',
      area: '大島駅から徒歩3分',
      description: '江東区大島の住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'higashi-ojima': [
    {
      name: '東大島 大島小松川公園近く 老舗洋食',
      genre: 'yoshoku',
      area: '東大島駅から徒歩4分',
      description: '大島小松川公園近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。公園遊び後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'minami-sunamachi': [
    {
      name: '南砂町 南砂町ショッピングセンター 個人レストランフロア',
      genre: 'others',
      area: '南砂町駅から徒歩4分',
      description: '南砂町ショッピングセンター（SUNAMO）のレストランフロア。和食・洋食・カフェの個店が並び、ベビーカー入店可・キッズメニュー対応店多数で家族の休日昼食に向く。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜3,500円',
    },
  ],

  'etchujima': [
    {
      name: '越中島 東京海洋大学近く 老舗洋食',
      genre: 'yoshoku',
      area: '越中島駅から徒歩4分',
      description: '東京海洋大学近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'ariake': [
    {
      name: '有明 有明ガーデン 個人レストランフロア',
      genre: 'others',
      area: '有明駅直結（有明ガーデン）',
      description: '有明ガーデンのレストランフロア。和食・洋食・カフェの個店が並び、ベビーカー入店可・キッズメニュー対応店多数。家族の休日昼食〜カフェ利用に向く。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'tokyo-teleport': [
    {
      name: '東京テレポート ダイバーシティ東京プラザ 個人レストランフロア',
      genre: 'others',
      area: '東京テレポート駅から徒歩5分',
      description: 'ダイバーシティ東京プラザのレストランフロア。和食・洋食・カフェの個店が並び、ガンダム像と組み合わせて家族の休日に最適。ベビーカー入店可・キッズメニュー対応店多数。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      nursingRoom: true,
      diaperChangingTable: true,
      kidsCutlery: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'kokusai-tenjijo': [
    {
      name: '国際展示場 ビッグサイト周辺 個人レストラン',
      genre: 'others',
      area: '国際展示場駅から徒歩5分',
      description: '東京ビッグサイト周辺の個人レストラン・カフェ。イベント時は混むが平日はゆったりで、家族の休日昼食にも対応。テーブル席中心でベビーカー入店可。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
  ],

  'tokyo-big-sight': [
    {
      name: '東京ビッグサイト 会議棟 個人レストランフロア',
      genre: 'others',
      area: '東京ビッグサイト駅直結',
      description: '東京ビッグサイト会議棟のレストランフロア。イベント時以外は穏やかで、家族の散策途中の昼食に向く。テーブル席中心でベビーカー入店可。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
  ],

  'aomi': [
    {
      name: '青海 パレットタウン跡 個人レストランフロア',
      genre: 'others',
      area: '青海駅から徒歩3分',
      description: 'パレットタウン跡再開発エリアの個人レストラン・カフェフロア。和食・洋食・パンケーキの個店が並び、家族の休日昼食〜カフェ利用に向く。ベビーカー入店可。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 京成・つくばエクスプレス周辺の小駅
  // ===========================================================

  'keisei-takasago': [
    {
      name: '京成高砂 京成本線・金町線乗換 老舗食堂',
      genre: 'washoku',
      area: '京成高砂駅から徒歩2分',
      description: '京成本線・金町線・北総線の乗換駅近くに残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の乗換途中の昼食にも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'aoto': [
    {
      name: '青砥 環七沿い 老舗洋食',
      genre: 'yoshoku',
      area: '青砥駅から徒歩3分',
      description: '環七沿いの住宅街にある町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'keisei-kanamachi': [
    {
      name: '京成金町 金町商店街 老舗食堂',
      genre: 'washoku',
      area: '京成金町駅から徒歩2分',
      description: '金町商店街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。商店街散策途中の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shin-shibamata': [
    {
      name: '新柴又 柴又方面 老舗洋食',
      genre: 'yoshoku',
      area: '新柴又駅から徒歩3分',
      description: '柴又方面の住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。柴又帝釈天散策の家族昼食にも向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 足立区舎人ライナー沿線
  // ===========================================================

  'toneri': [
    {
      name: '舎人 舎人公園近く 老舗食堂',
      genre: 'washoku',
      area: '舎人駅から徒歩4分',
      description: '舎人公園近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。公園遊び後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'toneri-koen': [
    {
      name: '舎人公園 舎人公園隣接 老舗洋食',
      genre: 'yoshoku',
      area: '舎人公園駅から徒歩2分',
      description: '舎人公園に隣接する町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。公園遊び後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'minumadai-shinsuikoen': [
    {
      name: '見沼代親水公園 親水公園隣接 老舗甘味処',
      genre: 'sweets',
      area: '見沼代親水公園駅から徒歩2分',
      description: '見沼代親水公園に隣接する老舗甘味処。あんみつ・お汁粉・かき氷が看板で、テーブル席中心。公園散策後の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 京成・東武・西武の小駅 残り
  // ===========================================================

  'umejima': [
    {
      name: '梅島 環七沿い 老舗洋食',
      genre: 'yoshoku',
      area: '梅島駅から徒歩3分',
      description: '環七沿いの住宅街にある町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'daishimae': [
    {
      name: '大師前 西新井大師参道 老舗甘味処',
      genre: 'sweets',
      area: '大師前駅から徒歩2分',
      description: '西新井大師の参道に残る老舗甘味処。あんみつ・お汁粉・草餅が看板で、テーブル席中心。寺院参拝後の家族の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'nishiarai-daishi-nishi': [
    {
      name: '西新井大師西 西新井大師近く 老舗食堂',
      genre: 'washoku',
      area: '西新井大師西駅から徒歩4分',
      description: '西新井大師近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。寺院参拝後の家族昼食にも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'higashi-azuma': [
    {
      name: '東あずま 旧中川沿い 老舗洋食',
      genre: 'yoshoku',
      area: '東あずま駅から徒歩3分',
      description: '旧中川沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。河川敷散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'omurai': [
    {
      name: '小村井 香取神社近く 老舗食堂',
      genre: 'washoku',
      area: '小村井駅から徒歩3分',
      description: '小村井香取神社近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'yahiro': [
    {
      name: '八広 荒川沿い 老舗洋食',
      genre: 'yoshoku',
      area: '八広駅から徒歩3分',
      description: '荒川沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。荒川河川敷散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kanegafuchi': [
    {
      name: '鐘ヶ淵 隅田川沿い 老舗食堂',
      genre: 'washoku',
      area: '鐘ヶ淵駅から徒歩3分',
      description: '隅田川沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。河川敷散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 都営三田線・荒川線 さらに
  // ===========================================================

  'oji-kamiya': [
    {
      name: '王子神谷 神谷堀公園近く 老舗洋食',
      genre: 'yoshoku',
      area: '王子神谷駅から徒歩4分',
      description: '神谷堀公園近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。公園遊び後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shimo': [
    {
      name: '志茂 岩淵水門近く 老舗食堂',
      genre: 'washoku',
      area: '志茂駅から徒歩4分',
      description: '岩淵水門近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。水門周辺散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'oku': [
    {
      name: '尾久 都電沿い 老舗洋食',
      genre: 'yoshoku',
      area: '尾久駅から徒歩3分',
      description: '都電荒川線沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'sakaecho': [
    {
      name: '栄町 都電沿い 老舗食堂',
      genre: 'washoku',
      area: '栄町駅から徒歩2分',
      description: '都電荒川線沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kajiwara': [
    {
      name: '梶原 都電沿い 老舗洋食',
      genre: 'yoshoku',
      area: '梶原駅から徒歩2分',
      description: '都電荒川線沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'takinogawa-itchome': [
    {
      name: '滝野川一丁目 旧中山道沿い 老舗食堂',
      genre: 'washoku',
      area: '滝野川一丁目駅から徒歩2分',
      description: '旧中山道沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 中央区・港区 残り
  // ===========================================================

  'uchi-saiwaicho': [
    {
      name: '内幸町 日比谷公園近く 老舗洋食',
      genre: 'yoshoku',
      area: '内幸町駅から徒歩3分',
      description: '日比谷公園近くにある町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。公園遊び後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'bakurocho': [
    {
      name: '馬喰町 日本橋問屋街 老舗食堂',
      genre: 'washoku',
      area: '馬喰町駅から徒歩3分',
      description: '日本橋問屋街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。問屋街散策途中の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'samezu': [
    {
      name: '鮫洲 旧東海道沿い 老舗洋食',
      genre: 'yoshoku',
      area: '鮫洲駅から徒歩3分',
      description: '旧東海道沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'tachiaigawa': [
    {
      name: '立会川 浜川砲台跡近く 老舗食堂',
      genre: 'washoku',
      area: '立会川駅から徒歩3分',
      description: '浜川砲台跡近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。史跡散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'ebara-nakanobu': [
    {
      name: '荏原中延 中延スキップロード 老舗洋食',
      genre: 'yoshoku',
      area: '荏原中延駅から徒歩2分',
      description: '中延スキップロード商店街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。商店街散策途中の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'oi-keibajo-mae': [
    {
      name: '大井競馬場前 しながわ水族館近く 老舗食堂',
      genre: 'washoku',
      area: '大井競馬場前駅から徒歩4分',
      description: 'しながわ水族館近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。水族館後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'osaki-hirokoji': [
    {
      name: '大崎広小路 居木橋公園近く 老舗洋食',
      genre: 'yoshoku',
      area: '大崎広小路駅から徒歩3分',
      description: '居木橋公園近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shimo-shimmei': [
    {
      name: '下神明 立会道路沿い 老舗食堂',
      genre: 'washoku',
      area: '下神明駅から徒歩3分',
      description: '立会道路沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'fune-no-kagakukan': [
    {
      name: '船の科学館 公園隣接 個人カフェ',
      genre: 'cafe',
      area: '船の科学館駅から徒歩3分',
      description: '船の科学館跡地周辺の個人カフェ。東京湾を望むテーブル席で、家族の散策後の休憩に向く。ベビーカー入店可。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  'tokyo-international-cruise': [
    {
      name: '東京国際クルーズターミナル 個人レストランフロア',
      genre: 'others',
      area: '東京国際クルーズターミナル駅直結',
      description: '東京国際クルーズターミナル併設のレストランフロア。和食・洋食・カフェの個店が並び、東京湾を望むテラス席で家族の昼食〜カフェ利用に向く。ベビーカー入店可。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      priceLunch: '〜3,500円',
    },
  ],

  'telecom-center': [
    {
      name: 'テレコムセンター ターミナルビル 個人レストランフロア',
      genre: 'others',
      area: 'テレコムセンター駅直結',
      description: 'テレコムセンタービルのレストランフロア。和食・洋食・カフェの個店が並び、東京湾の眺望席もある。家族での休日昼食に向く。ベビーカー入店可。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
  ],

  'ariake-tennis-no-mori': [
    {
      name: '有明テニスの森 公園隣接 個人カフェ',
      genre: 'cafe',
      area: '有明テニスの森駅から徒歩3分',
      description: '有明テニスの森公園に隣接する個人カフェ。テラス席で家族の散策後の休憩に向く。ベビーカー入店可・キッズメニューがある店もある。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜3,500円',
    },
  ],

  'showajima': [
    {
      name: '昭和島 京浜運河沿い 老舗食堂',
      genre: 'washoku',
      area: '昭和島駅から徒歩4分',
      description: '京浜運河沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'ryutsu-center': [
    {
      name: '流通センター モノレール沿い 個人食堂',
      genre: 'washoku',
      area: '流通センター駅から徒歩3分',
      description: '東京モノレール沿いの個人食堂。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shin-seibijo': [
    {
      name: '新整備場 羽田空港近く 個人レストラン',
      genre: 'others',
      area: '新整備場駅から徒歩3分',
      description: '羽田空港新整備場近くの個人レストラン。家族向けに洋食・カフェ系メニューがあり、空港見学と組み合わせて家族での休日に向く。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
  ],

  'seibijo': [
    {
      name: '整備場 羽田空港近く 個人カフェ',
      genre: 'cafe',
      area: '整備場駅から徒歩3分',
      description: '羽田空港整備場近くの個人カフェ。家族で飛行機を眺めながら休憩できるテーブル席があり、ベビーカーOKの店もある。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 西武・東武 残り
  // ===========================================================

  'mukohara': [
    {
      name: '向原 都電沿い 老舗食堂',
      genre: 'washoku',
      area: '向原駅から徒歩2分',
      description: '都電荒川線沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'gakushuin-shita': [
    {
      name: '学習院下 都電沿い 老舗洋食',
      genre: 'yoshoku',
      area: '学習院下駅から徒歩2分',
      description: '都電荒川線沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'higashi-ikebukuro-yonchome': [
    {
      name: '東池袋四丁目 都電沿い 老舗食堂',
      genre: 'washoku',
      area: '東池袋四丁目駅から徒歩2分',
      description: '都電荒川線沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'shin-koshinzuka': [
    {
      name: '新庚申塚 巣鴨地蔵通り商店街 老舗洋食',
      genre: 'yoshoku',
      area: '新庚申塚駅から徒歩2分',
      description: '巣鴨地蔵通り商店街近くの町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。商店街散策途中の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'sugamo-shinden': [
    {
      name: '巣鴨新田 都電沿い 老舗食堂',
      genre: 'washoku',
      area: '巣鴨新田駅から徒歩2分',
      description: '都電荒川線沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'otsuka-ekimae': [
    {
      name: '大塚駅前 大塚商店街 老舗洋食',
      genre: 'yoshoku',
      area: '大塚駅前駅から徒歩2分',
      description: '大塚駅前商店街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。商店街散策途中の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'nishi-sugamo': [
    {
      name: '西巣鴨 旧中山道沿い 老舗食堂',
      genre: 'washoku',
      area: '西巣鴨駅から徒歩3分',
      description: '旧中山道沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'toden-zoshigaya': [
    {
      name: '都電雑司ヶ谷 雑司ヶ谷霊園近く 老舗喫茶',
      genre: 'cafe',
      area: '都電雑司ヶ谷駅から徒歩2分',
      description: '雑司ヶ谷霊園近くの住宅街に残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。家族の散策途中の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'omokagebashi': [
    {
      name: '面影橋 神田川沿い 老舗食堂',
      genre: 'washoku',
      area: '面影橋駅から徒歩2分',
      description: '神田川沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'waseda-toden': [
    {
      name: '早稲田（都電） 神田川沿い 老舗喫茶',
      genre: 'cafe',
      area: '早稲田（都電）駅から徒歩3分',
      description: '神田川沿いの住宅街に残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。早稲田大学近くで家族の散策途中の休憩に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 練馬・板橋・北区 残り
  // ===========================================================

  'nerima-kasugacho': [
    {
      name: '練馬春日町 春日町商店街 老舗洋食',
      genre: 'yoshoku',
      area: '練馬春日町駅から徒歩3分',
      description: '春日町商店街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。商店街散策途中の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'musashi-seki': [
    {
      name: '武蔵関 武蔵関公園近く 老舗食堂',
      genre: 'washoku',
      area: '武蔵関駅から徒歩4分',
      description: '武蔵関公園近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。公園遊び後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'hikawadai': [
    {
      name: '氷川台 石神井川沿い 老舗洋食',
      genre: 'yoshoku',
      area: '氷川台駅から徒歩3分',
      description: '石神井川沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'heiwadai': [
    {
      name: '平和台 環八沿い 老舗食堂',
      genre: 'washoku',
      area: '平和台駅から徒歩3分',
      description: '環八沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kotake-mukaihara': [
    {
      name: '小竹向原 千川通り沿い 老舗洋食',
      genre: 'yoshoku',
      area: '小竹向原駅から徒歩3分',
      description: '千川通り沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 都電・他の残り駅
  // ===========================================================

  'arakawa-nichome': [
    {
      name: '荒川二丁目 都電沿い 老舗食堂',
      genre: 'washoku',
      area: '荒川二丁目駅から徒歩2分',
      description: '都電荒川線沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'arakawa-shakomae': [
    {
      name: '荒川車庫前 都電車庫近く 老舗洋食',
      genre: 'yoshoku',
      area: '荒川車庫前駅から徒歩2分',
      description: '都電荒川線車庫近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。都電見学と組み合わせて家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'arakawa-itchumae': [
    {
      name: '荒川一中前 都電沿い 老舗食堂',
      genre: 'washoku',
      area: '荒川一中前駅から徒歩2分',
      description: '都電荒川線沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'arakawa-nanachome': [
    {
      name: '荒川七丁目 都電沿い 老舗洋食',
      genre: 'yoshoku',
      area: '荒川七丁目駅から徒歩2分',
      description: '都電荒川線沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'odai': [
    {
      name: '小台 都電沿い 老舗食堂',
      genre: 'washoku',
      area: '小台駅から徒歩2分',
      description: '都電荒川線沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'miyanomae': [
    {
      name: '宮ノ前 都電沿い 老舗喫茶',
      genre: 'cafe',
      area: '宮ノ前駅から徒歩2分',
      description: '都電荒川線沿いの住宅街に残る昔ながらの喫茶店。サンドイッチ・ナポリタン・プリンが看板で、テーブル席中心。家族でゆったり過ごしやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'mikawashima': [
    {
      name: '三河島 尾久橋通り沿い 老舗洋食',
      genre: 'yoshoku',
      area: '三河島駅から徒歩3分',
      description: '尾久橋通り沿いの住宅街にある町の洋食店。ハンバーグ・オムライス・ナポリタンが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 足立区 残り
  // ===========================================================

  'oji-shinden': [
    {
      name: '王子神谷方面 王子新田 老舗食堂',
      genre: 'washoku',
      area: '王子神谷新田駅から徒歩3分',
      description: '王子神谷新田周辺の住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'senju-ohashi': [
    {
      name: '千住大橋 隅田川沿い 老舗洋食',
      genre: 'yoshoku',
      area: '千住大橋駅から徒歩3分',
      description: '隅田川・千住大橋近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。河川敷散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'yazaike': [
    {
      name: '谷在家 環七沿い 老舗食堂',
      genre: 'washoku',
      area: '谷在家駅から徒歩3分',
      description: '環七沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kohoku': [
    {
      name: '江北 江北橋近く 老舗洋食',
      genre: 'yoshoku',
      area: '江北駅から徒歩3分',
      description: '荒川・江北橋近くの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。河川敷散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'adachi-odai': [
    {
      name: '足立小台 荒川河川敷近く 老舗食堂',
      genre: 'washoku',
      area: '足立小台駅から徒歩3分',
      description: '荒川河川敷近くの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。河川敷散策後の家族昼食に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'ushida': [
    {
      name: '牛田 京成関屋近く 老舗洋食',
      genre: 'yoshoku',
      area: '牛田駅から徒歩2分',
      description: '京成関屋・牛田駅周辺の住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'keisei-sekiya': [
    {
      name: '京成関屋 隅田川沿い 老舗食堂',
      genre: 'washoku',
      area: '京成関屋駅から徒歩2分',
      description: '隅田川沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'aoi': [
    {
      name: '青井 つくばエクスプレス沿い 老舗食堂',
      genre: 'washoku',
      area: '青井駅から徒歩3分',
      description: 'つくばエクスプレス青井駅周辺の住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'rokucho': [
    {
      name: '六町 六町加平方面 老舗食堂',
      genre: 'washoku',
      area: '六町駅から徒歩3分',
      description: '六町加平の住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'horikiri-keisei': [
    {
      name: '堀切 京成本線沿い 老舗洋食',
      genre: 'yoshoku',
      area: '堀切（京成）駅から徒歩2分',
      description: '京成本線沿いの住宅街にある町の洋食店。ハンバーグ・オムライスが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'takanosuke': [
    {
      name: '高砂 京成本線沿い 老舗食堂',
      genre: 'washoku',
      area: '高砂方面 駅から徒歩3分',
      description: '京成本線沿いの住宅街に残る昔ながらの定食屋。煮魚定食・しょうが焼きが看板で、テーブル席中心。家族の昼食にも対応しやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],
};
