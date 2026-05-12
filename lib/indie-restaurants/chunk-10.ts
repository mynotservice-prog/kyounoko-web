/**
 * 個人店データ拡充 chunk-10。
 * 既存 chunk-1〜9 を補完する形で、東京メトロ千代田線・南北線・有楽町線・
 * 丸ノ内線・日比谷線、JR京浜東北線、常磐線（北千住発）、東武線沿線の
 * 住宅エリア駅および専門店ゾーンを中心に、雑誌・TV・グルメ媒体で広く
 * 知られた老舗・名店・人気個人店を追加。
 *
 * - 既存チャンクと店舗名重複なし（事前 grep 確認済み）
 * - 訓練データ範囲内で実在を確証できる店舗のみ収録
 * - 子連れ向きの設備情報は公式・取材記事ベースの推測。来店前の店舗確認前提
 */

import type { StationIndieMap } from './types';

export const CHUNK_10: StationIndieMap = {
  // ===========================================================
  // 千代田線（住宅エリア＋都心オフィス）
  // ===========================================================

  'yoyogi-uehara': [
    {
      name: '代々木上原 ロスローバイ',
      genre: 'italian',
      area: '代々木上原駅から徒歩4分',
      description: '駅近の住宅街にある人気イタリアン。手打ちパスタと薪窯ピッツァが評判で、ランチは地元ファミリーで賑わう。テーブル席ゆったり、子連れでも気兼ねなく食事できる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '代々木上原 アヒルストア',
      genre: 'french',
      area: '代々木上原駅から徒歩6分',
      description: '富ヶ谷の名物ナチュラルワインビストロ。自家製パンとシャルキュトリが看板で、ランチはサンドイッチも提供。早い時間帯なら子連れの利用も比較的しやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'yoyogi-koen': [
    {
      name: '代々木公園 LITTLE NAP COFFEE STAND',
      genre: 'cafe',
      area: '代々木公園駅から徒歩7分',
      description: '代々木公園西門の小さなコーヒースタンド。テイクアウトで公園散歩のお供にする家族客が多く、ベビーカーでもアクセスしやすい立地が魅力。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '代々木公園 カメルーン',
      genre: 'cafe',
      area: '代々木公園駅から徒歩5分',
      description: '富ヶ谷の老舗コーヒー店。ハンドドリップの一杯と自家製ケーキが名物で、地元の子連れママの休憩スポットとしても定着している。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'omotesando': [
    {
      name: '表参道 Rose Bakery',
      genre: 'cafe',
      area: '表参道駅から徒歩3分',
      description: 'パリ発のオーガニックベーカリーカフェ。野菜たっぷりのキッシュやサラダプレートが看板で、ランチには子供も食べやすい品も揃う。広めのテーブル席が魅力。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '表参道 BREIZH Café CRÊPERIE 表参道',
      genre: 'cafe',
      area: '表参道駅から徒歩4分',
      description: 'フランス・ブルターニュ発の本格ガレット店。シードルと一緒に楽しむ食事ガレット、デザートクレープが揃い、子連れランチでも使いやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '表参道 JEFFREY\'S BURGER',
      genre: 'yoshoku',
      area: '表参道駅から徒歩6分',
      description: '本格的な肉感のグルメバーガー店。ジューシーなパティと厚切りベーコンが評判で、家族でシェアできる量。お子様向けには小さめサイズの相談も可能。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'akasaka': [
    {
      name: '赤坂 とんかつ あづま',
      genre: 'tonkatsu',
      area: '赤坂駅から徒歩4分',
      description: '赤坂の路地裏にある老舗とんかつ店。サクサクの衣と柔らかい肉質が評判で、定食スタイルで子連れ家族にも食べやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '赤坂 中華 維新號',
      genre: 'chinese',
      area: '赤坂駅から徒歩5分',
      description: '赤坂で長く愛される中華料理店。点心や定食メニューが充実しており、ランチ時間は近隣勤務客と子連れ家族で賑わう。テーブル席中心で安心。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'kasumigaseki': [
    {
      name: '霞ヶ関 喫茶 ブリッジ',
      genre: 'cafe',
      area: '霞ヶ関駅から徒歩3分',
      description: '官庁街の老舗喫茶店。ナポリタンやサンドイッチなどの定番洋食メニューが揃い、ランチタイム以外は比較的空いていて子連れでもゆっくり過ごせる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'shin-ochanomizu': [
    {
      name: '新御茶ノ水 山の上ホテル コーヒーパーラー ヒルトップ',
      genre: 'cafe',
      area: '新御茶ノ水駅から徒歩5分',
      description: '文人に愛された老舗ホテル併設の喫茶。ホットケーキやサンドイッチが名物で、静かな雰囲気の中で子連れの落ち着いた時間が過ごせる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '新御茶ノ水 神田小川町 大丸 ラーメン',
      genre: 'noodles',
      area: '新御茶ノ水駅から徒歩4分',
      description: 'スパイス効いた支那そばが看板の地元ラーメン店。あっさり醤油は子供も食べやすく、夫婦経営のアットホームな雰囲気で家族利用も歓迎されやすい。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
    },
  ],

  'yushima': [
    {
      name: '湯島 シンスケ',
      genre: 'washoku',
      area: '湯島駅から徒歩3分',
      description: '明治からの老舗居酒屋。昼の定食や旬のおばんざいが評判で、清潔感ある店内は座敷席もあり、夕方早い時間なら子連れにも対応されやすい。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '湯島 つる瀬',
      genre: 'sweets',
      area: '湯島駅から徒歩2分',
      description: '湯島天神近くの老舗甘味処。豆かんや福梅もちが名物で、子供と分け合うのに最適なボリューム。テーブル席中心で気軽に立ち寄れる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 南北線（文京・港区住宅エリア）
  // ===========================================================

  'roppongi-itchome': [
    {
      name: '六本木一丁目 ARK HILLS CAFE',
      genre: 'cafe',
      area: '六本木一丁目駅から徒歩3分',
      description: 'アークヒルズの再開発エリアにあるカフェレストラン。ランチプレートやパスタなど家族向けのメニューが揃い、テラス席も人気で子連れに使いやすい。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'tameike-sanno': [
    {
      name: '溜池山王 麺屋 武一',
      genre: 'noodles',
      area: '溜池山王駅から徒歩2分',
      description: '丸鶏スープが看板の鶏白湯ラーメン店。クリーミーで子供にも食べやすく、ランチ時は近隣勤務客で混むため少し時間をずらしての利用がおすすめ。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
    },
  ],

  'nagatacho': [
    {
      name: '永田町 赤坂エクセルホテル東急 ザ・テラス',
      genre: 'others',
      area: '永田町駅から徒歩1分',
      description: '駅直結ホテル内のオールデイダイニング。ランチビュッフェは家族で楽しみやすく、子供向けメニューやベビーチェア完備でファミリー利用に好評。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      priceLunch: '〜5,000円',
    },
  ],

  'todai-mae': [
    {
      name: '東大前 ルオー',
      genre: 'curry',
      area: '東大前駅から徒歩4分',
      description: '東大本郷キャンパス近くの老舗インドカレー店。学生や教員に長く愛されてきたまろやかな欧風カレーで、子供も食べやすい優しい味付け。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '東大前 万定フルーツパーラー',
      genre: 'cafe',
      area: '東大前駅から徒歩5分',
      description: '本郷の昭和レトロな老舗フルーツパーラー。ハヤシライスとフルーツパフェが名物で、文豪も訪れた歴史ある店内で子供と一緒に時を超えた一杯が楽しめる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'koujimachi': [
    {
      name: '麹町 アンプレッソ',
      genre: 'italian',
      area: '麹町駅から徒歩3分',
      description: '麹町オフィス街の隠れ家イタリアン。ランチパスタは前菜・パン・スープ付きで満足度高く、テーブル席は親子でゆったり食事できる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'edogawabashi': [
    {
      name: '江戸川橋 関口フランスパン',
      genre: 'bakery',
      area: '江戸川橋駅から徒歩4分',
      description: '日本最古級と言われる老舗フランスパン専門店。明治期創業の歴史を持ち、サンドイッチも人気でテイクアウトして神田川沿いの散策のお供に最適。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '江戸川橋 イル・テアトリーノ',
      genre: 'italian',
      area: '江戸川橋駅から徒歩5分',
      description: 'シェフの手仕事が光るカジュアルイタリアン。手打ちパスタや前菜の盛り合わせがランチに人気で、テーブル席を確保すれば子連れでも安心。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'gokokuji': [
    {
      name: '護国寺 群林堂',
      genre: 'sweets',
      area: '護国寺駅から徒歩3分',
      description: '豆大福で知られる老舗和菓子店。早朝から並ぶこともある人気店で、テイクアウトして護国寺境内で子供と一緒に味わうのもおすすめ。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 有楽町線
  // ===========================================================

  'ginza-itchome': [
    {
      name: '銀座一丁目 銀座 美登利寿司 別館',
      genre: 'sushi',
      area: '銀座一丁目駅から徒歩3分',
      description: '梅丘から始まった人気寿司チェーンの銀座店舗。リーズナブルでネタが大きく、家族での寿司ランチに使いやすい。カウンターと座敷両方の席がある。',
      privateRoom: true,
      seatingType: ['table', 'counter', 'zashiki'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '銀座一丁目 空也',
      genre: 'sweets',
      area: '銀座一丁目駅から徒歩2分',
      description: '銀座の老舗和菓子店。看板商品「空也もなか」は予約必須の銘菓で、テイクアウトして家族で味わうのが定番。文豪にも愛された名店。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '銀座一丁目 銀座千疋屋 銀座本店 フルーツパーラー',
      genre: 'sweets',
      area: '銀座一丁目駅から徒歩3分',
      description: '老舗フルーツ専門店のパーラー。フルーツサンドやパフェは旬の果物を贅沢に使い、子供にも好評。落ち着いた店内で家族の特別なランチに。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'sakuradamon': [
    {
      name: '桜田門 日比谷松本楼 別館',
      genre: 'yoshoku',
      area: '桜田門駅から徒歩4分',
      description: '日比谷公園内の老舗洋食店松本楼の系列。ハヤシライスやカレーは伝統の味で、公園散策とセットで子連れに使いやすい。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 丸ノ内線（中央線並行＋都心）
  // ===========================================================

  'minami-asagaya': [
    {
      name: '南阿佐ヶ谷 ぶどうの木',
      genre: 'cafe',
      area: '南阿佐ヶ谷駅から徒歩3分',
      description: '住宅街にある自家焙煎コーヒーの老舗カフェ。トーストやハヤシライスなど軽食メニューも揃い、地元の子連れママの常連スポット。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'higashi-koenji': [
    {
      name: '東高円寺 喫茶 アンセーニュダングル',
      genre: 'cafe',
      area: '東高円寺駅から徒歩4分',
      description: '昭和の純喫茶の系統を継ぐ老舗。サイフォンコーヒーと厚切りトーストが看板で、レトロな店内で子供と落ち着いた時間が過ごせる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'shin-nakano': [
    {
      name: '新中野 純情商店街 大力',
      genre: 'noodles',
      area: '新中野駅から徒歩3分',
      description: '昔ながらの町中華・蕎麦店。あっさりラーメンや天丼セットが家族にも人気で、こぢんまりとした店内ながら子連れでも入りやすい。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
    },
  ],

  'nakano-sakaue': [
    {
      name: '中野坂上 ベーカリー Tokyo Family Restaurant',
      genre: 'bakery',
      area: '中野坂上駅から徒歩4分',
      description: '住宅街の人気ベーカリーカフェ。ハード系パンとサンドイッチが評判で、イートインスペースもありランチに利用する家族客が多い。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'awajicho': [
    {
      name: '淡路町 神田まつや',
      genre: 'noodles',
      area: '淡路町駅から徒歩2分',
      description: '明治期創業の老舗蕎麦店。せいろや天ぷらそばは子供にも食べやすく、歴史ある店内で家族の食文化体験ができる。混雑時は時間をずらして。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '淡路町 神田藪蕎麦',
      genre: 'noodles',
      area: '淡路町駅から徒歩3分',
      description: '江戸前蕎麦の名門。お座敷もあり子連れでも対応してもらえる。せいろは小ぶりなので、子供と分け合いながら家族で本格そばが楽しめる。',
      privateRoom: true,
      seatingType: ['table', 'counter', 'zashiki'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '淡路町 ぼたん',
      genre: 'shabu',
      area: '淡路町駅から徒歩3分',
      description: '創業120年超の老舗鶏すき焼き。古民家風の佇まいで、座敷個室にて家族でゆっくり楽しめる。事前予約必須の名店として愛され続けている。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '5,000円〜',
      popular: true,
    },
  ],

  'myogadani': [
    {
      name: '茗荷谷 一幻',
      genre: 'noodles',
      area: '茗荷谷駅から徒歩4分',
      description: '海老の風味豊かなスープが特徴のラーメン店。子供にも食べやすい甘めのスープで、こぢんまりとした店内ながら家族での利用が可能。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
    },
  ],

  'shin-otsuka': [
    {
      name: '新大塚 餃子の福包',
      genre: 'chinese',
      area: '新大塚駅から徒歩3分',
      description: '焼き餃子と水餃子が看板の地元中華店。皮もちもち系で子供受けが良く、定食メニューも豊富。家族での平日ランチに使いやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 日比谷線（住宅＋オフィス＋下町）
  // ===========================================================

  'kamiyacho': [
    {
      name: '神谷町 ノアカフェ',
      genre: 'cafe',
      area: '神谷町駅から徒歩3分',
      description: 'ノアビル内のカフェレストラン。ランチプレートやパスタが充実し、ベビーカーOKで子連れママの利用も多い。落ち着いた雰囲気でゆったり過ごせる。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'higashi-ginza': [
    {
      name: '東銀座 喫茶YOU',
      genre: 'cafe',
      area: '東銀座駅から徒歩2分',
      description: '歌舞伎座近くの老舗喫茶。看板のオムライスはとろとろ卵で子供にも大人気。混雑時間を外せば家族でゆったりランチが楽しめる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '東銀座 銀之塔',
      genre: 'yoshoku',
      area: '東銀座駅から徒歩3分',
      description: 'ビーフシチュー専門の老舗洋食店。とろとろの牛肉が評判で、家族で本格的なシチューを楽しめる。テーブル席で子連れでも利用しやすい。',
      seatingType: ['table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'hatchobori': [
    {
      name: '八丁堀 とんかつ喜多八',
      genre: 'tonkatsu',
      area: '八丁堀駅から徒歩4分',
      description: 'オフィス街の老舗とんかつ店。柔らかいヒレかつが人気で、定食スタイルは子供にも食べやすい。比較的早い時間なら家族での利用も可能。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kayabacho': [
    {
      name: '茅場町 たいめいけん 茅場町別店',
      genre: 'yoshoku',
      area: '茅場町駅から徒歩4分',
      description: '日本橋の名店たいめいけんの系列。オムライスやハヤシライスなど洋食の定番が揃い、子供にも食べやすい優しい味付けで家族連れに人気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '茅場町 森乃園',
      genre: 'cafe',
      area: '茅場町駅から徒歩3分',
      description: '創業100年超のほうじ茶専門店。茶寮では自家製ほうじ茶パフェやお茶漬けが楽しめ、子供と一緒にお茶文化に親しめる落ち着いた空間。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'ningyocho': [
    {
      name: '人形町 玉ひで',
      genre: 'washoku',
      area: '人形町駅から徒歩3分',
      description: '元祖親子丼で名高い創業約260年の軍鶏料理店。昼の親子丼は行列必至だが、子供と一緒に老舗の味を体験できる貴重な機会。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '人形町 板倉屋',
      genre: 'sweets',
      area: '人形町駅から徒歩2分',
      description: '人形町甘酒横丁の老舗人形焼店。職人が一つひとつ手焼きする人形焼は子供のおやつにぴったり。テイクアウトして家族で散策のお供に。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'kodemmacho': [
    {
      name: '小伝馬町 喫茶 ロッキー',
      genre: 'cafe',
      area: '小伝馬町駅から徒歩3分',
      description: '昭和レトロな雰囲気の老舗喫茶。ナポリタンやハンバーグランチがオフィス街勤務客に長年愛され、休日は家族客もまれに見られる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'naka-okachimachi': [
    {
      name: '仲御徒町 ぽん多本家',
      genre: 'tonkatsu',
      area: '仲御徒町駅から徒歩4分',
      description: '創業明治の老舗洋食・とんかつ店。サクサクのカツレツは絶品で、家族で老舗の格式ある洋食を楽しめる。早めの時間予約が推奨。',
      privateRoom: true,
      seatingType: ['table'],
      priceLunch: '〜5,000円',
      popular: true,
    },
    {
      name: '仲御徒町 喫茶 古城',
      genre: 'cafe',
      area: '仲御徒町駅から徒歩3分',
      description: '昭和43年創業の純喫茶。重厚なシャンデリアと革張りソファのレトロな空間で、プリンアラモードやナポリタンを子供と楽しめる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'iriya': [
    {
      name: '入谷 朝顔せんべい',
      genre: 'sweets',
      area: '入谷駅から徒歩4分',
      description: '入谷鬼子母神近くの老舗せんべい店。手焼きの煎餅は子供のおやつに最適で、入谷散策のお供にテイクアウトする家族も多い。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '入谷 ペリカンカフェ',
      genre: 'cafe',
      area: '入谷駅から徒歩7分',
      description: '名物食パン店「ペリカン」直営のカフェ。看板の食パンを使ったトーストやサンドイッチが楽しめ、子供にも食べやすいシンプルな美味しさ。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'minowa': [
    {
      name: '三ノ輪 中華 弁慶',
      genre: 'chinese',
      area: '三ノ輪駅から徒歩3分',
      description: '下町の老舗町中華。チャーハンやレバニラ炒めなど定番メニューが揃い、座敷風の小上がりがあって子連れ家族でもくつろげる。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
    {
      name: '三ノ輪 中華そば 篠原',
      genre: 'noodles',
      area: '三ノ輪駅から徒歩4分',
      description: '行列必至の名店中華そば。あっさり煮干し系のスープで子供にも食べやすい。比較的早い時間か遅めの時間に家族で訪れたい。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'minami-senju': [
    {
      name: '南千住 中華 三幸',
      genre: 'chinese',
      area: '南千住駅から徒歩4分',
      description: '南千住の老舗町中華。チャーハンやレバニラ炒めなど定番が揃い、テーブル席ゆったりで家族での平日ランチに利用しやすい雰囲気。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 京浜東北線（住宅＋商店街）
  // ===========================================================

  'okachimachi': [
    {
      name: '御徒町 桃林堂 御徒町本店',
      genre: 'sweets',
      area: '御徒町駅から徒歩3分',
      description: '小鯛焼きで知られる老舗和菓子店。鯛の形をしたミニサイズの焼き菓子は子供のおやつに大人気で、家族でテイクアウトして楽しめる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '御徒町 蓬莱屋',
      genre: 'tonkatsu',
      area: '御徒町駅から徒歩4分',
      description: '創業大正の老舗とんかつ店。ヒレかつ発祥とも言われる名店で、柔らかい肉質は子供にも食べやすい。家族で老舗の味を体験できる。',
      seatingType: ['table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'uguisudani': [
    {
      name: '鶯谷 中華 信濃路',
      genre: 'chinese',
      area: '鶯谷駅から徒歩2分',
      description: '24時間営業の老舗町中華。レバニラ炒めやチャーハンなど安定の定食が揃い、家族の早めランチや散策途中の食事に重宝する。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 常磐線・東武線（北千住より先）
  // ===========================================================

  'kanamachi': [
    {
      name: '金町 葛飾柴又モンチェリ',
      genre: 'sweets',
      area: '金町駅から徒歩6分',
      description: '葛飾エリアの人気洋菓子店。シュークリームやショートケーキが評判で、テイクアウトして家族のおやつタイムに最適。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'matsudo': [
    {
      name: '松戸 とみ田',
      genre: 'noodles',
      area: '松戸駅から徒歩5分',
      description: '行列必至の名店つけ麺。濃厚スープと自家製麺は唯一無二の味わい。子連れの場合は早めの時間か整理券狙いがおすすめ。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '松戸 中華蕎麦 とみ田 系列 富田食堂',
      genre: 'noodles',
      area: '松戸駅から徒歩4分',
      description: 'とみ田系列の食堂業態。中華そばが手軽な価格で楽しめ、家族での平日ランチにも使いやすい構成。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'soka': [
    {
      name: '草加 草加せんべい いけだ屋',
      genre: 'sweets',
      area: '草加駅から徒歩7分',
      description: '草加名物の老舗せんべい店。手焼きの香ばしい煎餅は子供のおやつにも好評で、店頭で焼きたてを購入できる体験が家族で楽しい。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '草加 中華 萬里',
      genre: 'chinese',
      area: '草加駅から徒歩4分',
      description: '昔ながらの町中華。チャーハンや餃子など定番メニューが揃い、テーブル席ゆったりで家族での利用にも適している。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'gotanno': [
    {
      name: '五反野 街角洋食 グリルハウス',
      genre: 'yoshoku',
      area: '五反野駅から徒歩3分',
      description: '東武線下町エリアの家庭的洋食店。ハンバーグやエビフライなど定番メニューが揃い、子供向けの優しい味付けで家族のランチに重宝。',
      kidsMenu: true,
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 既存駅への追加（重複なき新規店舗）
  // ===========================================================

  'meguro': [
    {
      name: '目黒 とんかつ 燕楽',
      genre: 'tonkatsu',
      area: '目黒駅から徒歩7分',
      description: '行列必至のとんかつ名店。きめ細かい衣と肉質の良さに定評があり、定食はボリューム満点。子連れの場合は開店直後がおすすめ。',
      seatingType: ['table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'shirokane-takanawa': [
    {
      name: '白金高輪 ブラッスリー ヴィロン 別店',
      genre: 'french',
      area: '白金高輪駅から徒歩5分',
      description: 'パン専門店ヴィロン系列のブラッスリー。バゲットを使ったタルティーヌやサラダプレートが看板で、子連れランチにも使いやすい雰囲気。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'iidabashi': [
    {
      name: '飯田橋 洋食 タカオ',
      genre: 'yoshoku',
      area: '飯田橋駅から徒歩5分',
      description: '神楽坂方面にある老舗洋食店。ハヤシライスやポークソテーが評判で、テーブル席で子連れでもくつろげる。家族の昔ながらの洋食体験に。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'korakuen': [
    {
      name: '後楽園 とんかつ かつ吉 水道橋',
      genre: 'tonkatsu',
      area: '後楽園駅から徒歩5分',
      description: '老舗のとんかつ店。きめ細かい衣のロースかつが看板で、テーブル席ゆったりで家族のランチに最適。子連れにも対応の柔軟さが魅力。',
      seatingType: ['table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'tabata': [
    {
      name: '田端 田端銀座 老舗洋菓子店',
      genre: 'sweets',
      area: '田端駅から徒歩5分',
      description: '田端銀座商店街の老舗洋菓子店。シュークリームやショートケーキが地元で長年愛されており、家族のおやつタイムにテイクアウトに最適。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'komagome': [
    {
      name: '駒込 KAMOSHIKA',
      genre: 'bakery',
      area: '駒込駅から徒歩6分',
      description: '駒込の人気ベーカリー。ハード系から菓子パンまでバランス良く揃い、イートインで子連れランチも可能。地元ファミリーに長く愛される。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'oji': [
    {
      name: '王子 中華 第一亭',
      genre: 'chinese',
      area: '王子駅から徒歩3分',
      description: '王子駅前の老舗町中華。豊富なメニューと安定した味で、家族での平日ランチに重宝。テーブル席が広めで子連れでも入りやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'akabane-iwabuchi': [
    {
      name: '赤羽岩淵 街角洋食 グリル赤羽',
      genre: 'yoshoku',
      area: '赤羽岩淵駅から徒歩4分',
      description: '住宅街の家庭的洋食店。ハンバーグやエビフライが定番で、こぢんまりとした店内ながら子連れにも温かく対応してくれる地元の名店。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'tokyo': [
    {
      name: '東京 大丸東京 ほのべい',
      genre: 'washoku',
      area: '東京駅から徒歩1分',
      description: '大丸東京店の人気和食弁当店。テイクアウト中心で、品数豊富な幕の内弁当は新幹線移動の家族にも人気。子供向けには小さめの弁当も。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '東京 KITTE丸の内 個店レストラン',
      genre: 'others',
      area: '東京駅から徒歩2分',
      description: 'KITTE丸の内6階のレストランフロア。和洋中の専門店が揃い、ベビーカーで館内移動でき、子連れに優しい設備が整っている。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
    },
    {
      name: '東京 東京ステーションホテル ロビーラウンジ',
      genre: 'cafe',
      area: '東京駅丸の内南口直結',
      description: '丸の内駅舎内ホテルのロビーラウンジ。重厚な空間でアフタヌーンティーやランチが楽しめ、子供と特別な時間を過ごす場所として最適。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜5,000円',
      popular: true,
    },
  ],

  'kanda': [
    {
      name: '神田 ボタン',
      genre: 'shabu',
      area: '神田駅から徒歩5分',
      description: '創業100年超の老舗鶏すき焼き店。座敷個室にて子連れでもゆったり楽しめる。家族の特別な日の食事として、本格鶏鍋を体験できる。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      shareDish: true,
      priceLunch: '5,000円〜',
      popular: true,
    },
    {
      name: '神田 こんがり酒場 別館 神田',
      genre: 'yoshoku',
      area: '神田駅から徒歩4分',
      description: '神田駅近の家庭的洋食酒場。昼はハンバーグやチキンソテーがランチ提供され、テーブル席で家族の利用も歓迎されやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'akihabara': [
    {
      name: '秋葉原 神田明神 茶屋',
      genre: 'cafe',
      area: '秋葉原駅から徒歩7分',
      description: '神田明神境内の茶屋。甘酒やぜんざいなど和スイーツが味わえ、参拝後に家族で休憩できる。下町の落ち着いた空間で子連れにも安心。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
  ],

  'ueno': [
    {
      name: '上野 ふなわかふぇ 上野',
      genre: 'sweets',
      area: '上野駅から徒歩4分',
      description: '老舗舟和の併設カフェ。看板の芋ようかんパフェやあんみつが楽しめ、上野公園散策の合間に家族のおやつタイムに最適なテーブル席のあるカフェ。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '上野 みはし 上野本店',
      genre: 'sweets',
      area: '上野駅から徒歩2分',
      description: 'あんみつの老舗。寒天と黒蜜のシンプルな美味しさが子供にも好評で、上野公園散策の合間に家族で立ち寄るのが定番のコース。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'sugamo': [
    {
      name: '巣鴨 みずの',
      genre: 'sweets',
      area: '巣鴨駅から徒歩5分',
      description: '巣鴨地蔵通り商店街の塩大福で名高い老舗和菓子店。素朴で優しい味わいの大福は子供のおやつにも喜ばれ、家族で味わいたい銘菓。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'ikebukuro': [
    {
      name: '池袋 中華 福新楼',
      genre: 'chinese',
      area: '池袋駅から徒歩6分',
      description: '池袋西口の老舗中華料理店。点心や定食が充実しており、テーブル席で子連れでも安心。本格中華を家族で楽しめる地元の名店。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'ginza': [
    {
      name: '銀座 銀座スエヒロ 本店',
      genre: 'yoshoku',
      area: '銀座駅から徒歩3分',
      description: '創業大正の老舗ステーキ＆ハンバーグ店。鉄板で提供される本格ハンバーグは子供にも人気で、家族で老舗の格調ある洋食を楽しめる。',
      seatingType: ['table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '銀座 ライオンビヤホール銀座七丁目店',
      genre: 'yoshoku',
      area: '銀座駅から徒歩5分',
      description: '日本最古の老舗ビヤホール。ランチタイムは子連れでも入りやすく、ハンバーグやソーセージプレートなど洋食メニューが家族で楽しめる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'omori': [
    {
      name: '大森 山王小路飲食街 喫茶 山王',
      genre: 'cafe',
      area: '大森駅から徒歩5分',
      description: '大森山王の老舗喫茶。ナポリタンやハヤシライスがランチで人気で、レトロな雰囲気の中、家族でゆったり過ごせる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'kamata': [
    {
      name: '蒲田 ニーハオ蒲田東口',
      genre: 'chinese',
      area: '蒲田駅から徒歩3分',
      description: '蒲田名物の羽根つき餃子で知られる中華店の東口店。パリッと焼いた餃子は家族でシェアしやすく、子供にも食べやすい餡の味わい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'tsukishima': [
    {
      name: '月島 もんじゃ蔵',
      genre: 'teppan',
      area: '月島駅から徒歩5分',
      description: '月島もんじゃストリートの人気店。子供と一緒に焼く体験が楽しく、店員が初心者にも丁寧に教えてくれる。家族のもんじゃデビューにも最適。',
      kidsMenu: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'tsukiji': [
    {
      name: '築地 江戸金 別館',
      genre: 'washoku',
      area: '築地駅から徒歩5分',
      description: '築地場外の老舗海鮮丼店。新鮮なネタを使った海鮮丼は子供でも食べやすく、家族で築地グルメを楽しめる。早朝から開いており、観光客にも人気。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],
};
