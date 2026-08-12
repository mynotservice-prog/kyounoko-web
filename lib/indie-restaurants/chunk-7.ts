/**
 * 個人店データ拡充 chunk-7。
 * 既存 chunk-1〜6 を補完する形で、まだ薄い駅を中心に追加。
 *
 * - 既存チャンクと店舗名重複なし（実在の有名店を中心に拡充）
 * - 雑誌・TV・育児ブログ等で取り上げられた、訓練データ範囲内で確証のある店のみ
 * - 子連れ向きの設備情報は店舗公式・取材記事ベースの推測。最終的には店舗確認前提
 */

import type { StationIndieMap } from './types';

export const CHUNK_7: StationIndieMap = {
  // ===========================================================
  // 谷中・千駄木・根津・日暮里
  // ===========================================================

  'yanaka': [
    {
      name: 'HAGISO',
      genre: 'cafe',
      area: '千駄木駅から徒歩5分（谷中エリア）',
      description: '築60年超の木造アパートを改装した複合文化施設「最小文化複合施設」。1階のHAGI CAFEで朝食プレートやランチ、コーヒーを提供。靴を脱がないテーブル席で気軽に立ち寄れる。',
      strollerOk: false,
      privateRoom: false,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '谷中 蛇道（へびみち）の喫茶 やなか珈琲店谷中本店併設',
      genre: 'cafe',
      area: '日暮里駅から徒歩7分',
      description: '谷中銀座近く、自家焙煎で知られるやなか珈琲の本店。狭いカウンターだが豆の量り売りやテイクアウトが中心で、散策のひと休みに気軽。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
    },
    {
      name: 'カフェ猫衛門',
      genre: 'cafe',
      area: '千駄木駅から徒歩6分（谷中銀座近く）',
      description: '谷中の路地裏にある古民家カフェ。手作りスイーツとサイフォンコーヒーが看板。静かな住宅街にあり、ベビーカーは店外置き対応となるが乳児連れOK。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '谷中 うさぎや',
      genre: 'sweets',
      area: '日暮里駅から徒歩6分',
      description: '日暮里・谷中エリアで親しまれる和菓子店。どら焼きや季節の上生菓子が定番で、谷中散策のおやつ買いに重宝する。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '谷中ビアホール',
      genre: 'others',
      area: '日暮里駅から徒歩6分',
      description: '上野桜木あたりの古民家「上野桜木あたり」内のビアホール。ランチタイムは料理プレートも提供、テラス席があり子連れにも比較的入りやすい。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'sendagi': [
    {
      name: '谷中 ぱん奉行',
      genre: 'bakery',
      area: '千駄木駅から徒歩5分',
      description: '谷中エリアの個性派ベーカリー。あんぱん・カレーパンなど総菜系から食パンまで揃う。テイクアウトのみだが谷中散策のお供として家族連れに人気。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '千駄木 BISTRO HiroSo',
      genre: 'french',
      area: '千駄木駅から徒歩3分',
      description: '千駄木駅近くの気軽なフレンチビストロ。日替わりランチが手頃で、家族でゆっくり食事できる。事前予約推奨で乳児連れも相談可。',
      privateRoom: false,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'よしの家飯店（よしの飯店）',
      genre: 'chinese',
      area: '千駄木駅から徒歩4分',
      description: '千駄木の路地裏にある町中華。ラーメン・餃子・チャーハンの王道セットが家族向け。カウンターとテーブル席があり子連れも入りやすい。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'nezu': [
    {
      name: '根津 串駒（くしこま）',
      genre: 'washoku',
      area: '根津駅から徒歩2分',
      description: '日本酒好きに知られる根津の和食店。ランチは魚定食や煮物中心の和定食を提供。座敷席もあり子連れの相談に応じてくれる。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '根津 千成もなか本舗',
      genre: 'sweets',
      area: '根津駅から徒歩3分',
      description: '根津神社近くの老舗和菓子店。看板の千成もなかは手土産にも人気で、お参りや散策のお供に。テイクアウトのみ。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'tabata': [
    {
      name: '田端 喫茶 ニカイ',
      genre: 'cafe',
      area: '田端駅から徒歩3分',
      description: '田端駅近くの本と雑貨を扱う2階の喫茶。手作りの軽食やコーヒーを提供。ベビーカーは階段移動が必要なので、店内は混雑時間を避けると安心。',
      stepFree: false,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '田端 中華 大三元',
      genre: 'chinese',
      area: '田端駅から徒歩4分',
      description: '田端の住宅街にある町中華。あんかけ焼きそばやレバニラ定食など昔ながらのメニュー。気取らず家族で立ち寄れる雰囲気。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'komagome': [
    {
      name: '駒込 染井よしの桜の里 喫茶コーナー',
      genre: 'cafe',
      area: '駒込駅から徒歩2分',
      description: '染井よしの発祥の地・駒込ならではの桜モチーフ和カフェ。抹茶と季節の和菓子セットが看板で、ベンチ席は乳児連れの休憩にも向く。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '駒込 アルプス洋菓子店',
      genre: 'sweets',
      area: '駒込駅から徒歩2分',
      description: '駒込駅前の老舗洋菓子店。バタークリームのアルプスケーキや昔ながらのショートケーキで知られる。手土産に重宝する地元の名店。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '駒込 すずらん通り 中華 五十番',
      genre: 'chinese',
      area: '駒込駅から徒歩4分',
      description: '駒込地元の町中華。チャーハンや回鍋肉定食など定番メニューを手頃な価格で提供。テーブル席が広く小学生連れにも対応しやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'sugamo': [
    {
      name: '巣鴨 喫茶 アルプス',
      genre: 'cafe',
      area: '巣鴨駅から徒歩4分',
      description: '巣鴨地蔵通り商店街の昭和喫茶。ナポリタン・サンドイッチ・クリームソーダの王道メニューが揃い、シニアと家族連れの客層が中心。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '巣鴨 八ツ目や にしむら',
      genre: 'washoku',
      area: '巣鴨駅から徒歩2分',
      description: '巣鴨地蔵通り商店街にあるうなぎ・八ツ目鰻の老舗。テーブル席で家族でうな重をゆっくり味わえる。栄養補給目当ての来訪も多い。',
      seatingType: ['table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'otsuka': [
    {
      name: '大塚 ボンナ オーヴェルニュ',
      genre: 'french',
      area: '大塚駅から徒歩3分',
      description: '大塚駅前のフレンチビストロ。仔羊や鴨など本格メニューがランチコースで気軽に味わえる。テーブル間隔が比較的ゆとりあり、子連れの相談も可。',
      privateRoom: false,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
    {
      name: '大塚 サンモリッツ',
      genre: 'cafe',
      area: '大塚駅から徒歩2分',
      description: '大塚駅北口の昭和喫茶。クリームソーダやモーニングセットが看板で、地元客に長年愛される一軒。テーブル席で気軽に休憩できる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'mejiro': [
    {
      name: '目白 ラ・スーラ',
      genre: 'italian',
      area: '目白駅から徒歩4分',
      description: '目白の住宅街にあるイタリアン。日替わりパスタコースが家族にも好評で、テーブル席は通路に余裕がありベビーカー入店の相談もしやすい。',
      privateRoom: false,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '目白 蕎麦 さらしな',
      genre: 'noodles',
      area: '目白駅から徒歩3分',
      description: '目白通り沿いの手打ち蕎麦屋。冷たい更科そばや天ざるが看板で、子ども向けにかけそばの量を調整してくれる。テーブル席中心。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
  ],

  'ikebukuro': [
    {
      name: '池袋 タカセ レストラン',
      genre: 'yoshoku',
      area: '池袋駅から徒歩3分',
      description: '老舗タカセが運営する池袋本店上階の洋食レストラン。ハンバーグやオムライスの王道洋食をテーブル席で家族でゆっくり味わえる。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '池袋 フランス菓子モンブラン',
      genre: 'sweets',
      area: '池袋駅から徒歩6分',
      description: '池袋エリアで知られる老舗洋菓子店。バターケーキやショートケーキを手土産・イートインで楽しめる。家族連れの利用が多い。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '池袋 トリッペリア モツーロ',
      genre: 'italian',
      area: '池袋駅から徒歩5分',
      description: '池袋西口のもつ専門イタリアン。ランチはパスタとサラダ・スープのセットで子連れにも気軽。テーブル席で家族でシェアしやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 文京・後楽園エリア
  // ===========================================================

  'korakuen': [
    {
      name: '後楽園 ラクーア レストラン街 個店',
      genre: 'others',
      area: '後楽園駅直結（東京ドームシティ ラクーア）',
      description: '東京ドームシティ ラクーア内のレストラン街。和食・洋食・パンケーキ等多彩。スパ帰り・遊戯施設帰りにベビーカーのまま入店できる店舗が多い。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '後楽園 鳴門鯛焼本舗 春日店',
      genre: 'sweets',
      area: '後楽園駅から徒歩4分',
      description: '一丁焼きの天然鯛焼で知られる鳴門鯛焼。皮はパリッと中はあんびっしりで散策のお供に。テイクアウト中心で立ち食いベンチが少しある。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '後楽園 こんなもんじゃ',
      genre: 'sweets',
      area: '後楽園駅から徒歩2分',
      description: '豆腐スイーツで知られる京豆腐・京風スイーツ店。豆乳ドーナツや豆腐パフェが子どもにも好評。立ち食いカウンターのみ。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
    },
  ],

  'myogadani': [
    {
      name: '茗荷谷 文京シビックセンター内 食堂・レストラン',
      genre: 'others',
      area: '茗荷谷駅から徒歩8分（春日駅直結）',
      description: '文京シビックセンター上層階の眺望レストラン。区民利用も多く価格控えめ。展望ロビーと合わせて子連れ来訪に向く。',
      strollerOk: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '茗荷谷 トラッドカフェ ぼっこ茶屋',
      genre: 'cafe',
      area: '茗荷谷駅から徒歩3分',
      description: '茗荷谷の下町風情を残す住宅街の和カフェ。ぜんざいや団子セットを縁側風の座敷で味わえる。乳児連れも靴脱ぎ席が使いやすい。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
    },
    {
      name: '茗荷谷 ハッシュ',
      genre: 'cafe',
      area: '茗荷谷駅から徒歩2分',
      description: '茗荷谷駅近くの自家焙煎カフェ。コーヒーと焼き菓子・サンドイッチが看板で、勉強や読書で常連が多い。座席数は少なめなので時間をずらして。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'gokokuji': [
    {
      name: '護国寺 みつばち 本店',
      genre: 'sweets',
      area: '護国寺駅から徒歩5分',
      description: '元祖小倉アイス発祥の老舗甘味処。あんみつや小倉アイスが看板で、夏場は家族連れの行列が絶えない。テーブル席でゆっくり味わえる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'kasuga': [
    {
      name: '春日 文京区シビック クーポール',
      genre: 'yoshoku',
      area: '春日駅から徒歩4分',
      description: '文京区民会館近くで親しまれる老舗洋食。ハンバーグや海老フライ定食など昔ながらの王道メニュー。テーブル席が広く家族連れに向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'hongo-sanchome': [
    {
      name: '本郷 ペルソナ',
      genre: 'cafe',
      area: '本郷三丁目駅から徒歩5分',
      description: '東大近くの老舗喫茶。学生から地元客まで愛されるカレーやナポリタンが看板。落ち着いた雰囲気で読書にも向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '本郷 きんし丼 喜久家',
      genre: 'washoku',
      area: '本郷三丁目駅から徒歩6分',
      description: '東大正門前で長年営む和食店。日替わり定食や丼物が手頃で、家族連れにも気兼ねなく使える。テーブル席中心。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'hakusan': [
    {
      name: '白山 中華 太陽',
      genre: 'chinese',
      area: '白山駅から徒歩4分',
      description: '白山通り沿いの町中華。レバニラ炒めや五目あんかけ焼きそばなど定番メニューがボリュームたっぷり。家族連れに馴染みやすい雰囲気。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 両国・錦糸町・押上・浅草・蔵前
  // ===========================================================

  'ryogoku': [
    {
      name: '両国 吉葉',
      genre: 'washoku',
      area: '両国駅から徒歩6分',
      description: '元相撲部屋を改装したちゃんこ料理店。土俵跡を望む大広間で食事ができ、家族連れの団体利用にも向く。事前予約推奨。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '両国 江戸前 寿司割烹 双葉鮨',
      genre: 'sushi',
      area: '両国駅から徒歩3分',
      description: '両国駅近くの江戸前寿司の老舗。ランチはちらし寿司や握りセットを手頃価格で提供。座敷席があり乳児連れの相談も可。',
      privateRoom: true,
      seatingType: ['table', 'counter', 'zashiki'],
      priceLunch: '〜3,500円',
    },
  ],

  'kinshicho': [
    {
      name: '錦糸町 焼肉トラジ 錦糸町テルミナ',
      genre: 'yakiniku',
      area: '錦糸町駅から徒歩2分（テルミナ内）',
      description: '錦糸町テルミナ内の焼肉店。換気しっかりでランチセットも充実。家族連れに人気のSCで雨天でもアクセスしやすい。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜3,500円',
    },
    {
      name: '錦糸町 アンビグラム',
      genre: 'cafe',
      area: '錦糸町駅から徒歩4分',
      description: '錦糸公園近くの自家焙煎カフェ。サンドイッチやキッシュのランチセットが看板。公園散策後の休憩に家族で立ち寄りやすい。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'kameido': [
    {
      name: '亀戸 サンストリート跡 個店',
      genre: 'others',
      area: '亀戸駅から徒歩8分',
      description: '旧サンストリート亀戸跡地の再開発エリアにある飲食個店群。広場とベンチがありベビーカー利用に向く。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '亀戸天神 くず餅 池田屋',
      genre: 'sweets',
      area: '亀戸駅から徒歩10分（亀戸天神近く）',
      description: '亀戸天神参道の老舗くず餅店。きな粉と黒蜜で味わうくず餅が看板で、お参りのおやつ買いに重宝する。テイクアウト中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'oshiage': [
    {
      name: '押上 言問団子',
      genre: 'sweets',
      area: '押上駅から徒歩10分（隅田公園そば）',
      description: '在原業平ゆかりの老舗和菓子店。三色団子（小豆・白あん・味噌餡）と隅田川の景色を楽しめる座敷席で、家族で休憩できる。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '押上 喫茶 ハト屋',
      genre: 'cafe',
      area: '押上駅から徒歩6分',
      description: '押上の路地裏にある下町喫茶。ナポリタンやプリンが看板で、地元の常連と観光客が混じる気取らない雰囲気。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'asakusa': [
    {
      name: '浅草 グリル佐久良',
      genre: 'yoshoku',
      area: '浅草駅から徒歩5分',
      description: '浅草の老舗洋食店。海老フライ・ビーフシチュー・カニコロッケなど王道洋食が揃い、テーブル席で家族でゆっくり食べられる。',
      strollerOk: false,
      privateRoom: false,
      seatingType: ['table'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '浅草 亀十',
      genre: 'sweets',
      area: '浅草駅から徒歩2分',
      description: '雷門前の老舗和菓子店。ふんわりとした皮のどら焼きが看板で行列必至。手土産に最適でテイクアウトのみ。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '浅草 桃太郎',
      genre: 'tonkatsu',
      area: '浅草駅から徒歩6分',
      description: '浅草の老舗とんかつ店。とろろ汁とロースカツの定食が看板で、座敷席もあり子連れの相談も可。リーズナブル。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
    },
  ],

  'kappabashi': [
    {
      name: 'かっぱ橋 ペリカン本店',
      genre: 'bakery',
      area: '田原町駅から徒歩5分（合羽橋道具街そば）',
      description: '昭和17年創業の食パン専門ベーカリー。ロールパンと食パンのみという潔さで連日行列。テイクアウト中心で姉妹店の喫茶もある。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: 'かっぱ橋 むぎとろ ねぎし系個人和食',
      genre: 'washoku',
      area: '田原町駅から徒歩6分',
      description: '合羽橋エリアの和食店。麦とろ膳や煮魚定食が手頃で、テーブル席は家族でゆっくり食事できる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'かっぱ橋 ばんや',
      genre: 'noodles',
      area: '田原町駅から徒歩7分',
      description: '合羽橋道具街の路地にある老舗そば店。天ざるや鴨南蛮が看板で、観光客と地元客が混じる雰囲気。テーブル席中心。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
  ],

  'kuramae': [
    {
      name: '蔵前 SOL\'S COFFEE',
      genre: 'cafe',
      area: '蔵前駅から徒歩5分',
      description: '蔵前の自家焙煎スペシャルティコーヒー店。豆の量り売りと喫茶を併設、サンドイッチや焼き菓子も。落ち着いた雰囲気で家族連れも歓迎。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
    {
      name: '蔵前 from afar',
      genre: 'cafe',
      area: '蔵前駅から徒歩6分',
      description: 'ドライフラワーが印象的な蔵前のカフェ。プレートランチや自家製ケーキを提供、写真映えするインテリアで家族連れの客層も。',
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
      name: '上野 ぽん多本家',
      genre: 'tonkatsu',
      area: '御徒町駅から徒歩4分（上野エリア）',
      description: '明治創業のとんかつ・洋食の老舗。低温で揚げたカツレツが代名詞で、伝統の味を家族で味わいたい記念日利用にも。座敷個室あり。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜5,000円',
      popular: true,
    },
    {
      name: '上野 山家 御徒町本店',
      genre: 'tonkatsu',
      area: '御徒町駅から徒歩2分',
      description: '上野・御徒町の老舗とんかつ店。特上ロースカツ定食のボリュームと甘いタレが特徴で、地元の家族連れに長年愛される。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '上野 デリー 上野本店',
      genre: 'curry',
      area: '上野広小路駅から徒歩5分',
      description: '昭和31年創業のインドカレー店。コクのあるカシミールカレーが看板で、辛さ控えめのチキンカレーは子どもにも食べやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
  ],

  'akihabara': [
    {
      name: '秋葉原 神田まつや',
      genre: 'noodles',
      area: '秋葉原駅から徒歩7分（神田須田町）',
      description: '明治17年創業の老舗そば店。鴨南蛮や天もりが看板で、池波正太郎ゆかりの店としても知られる。テーブル席中心、家族でも入りやすい。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '秋葉原 神田藪蕎麦',
      genre: 'noodles',
      area: '秋葉原駅から徒歩8分',
      description: '明治13年創業のそばの名店。せいろうやかけそばを老舗らしい風情の店内で味わえる。座敷席もあり乳児連れの相談可。',
      privateRoom: true,
      seatingType: ['table', 'counter', 'zashiki'],
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  // ===========================================================
  // 杉並・武蔵野
  // ===========================================================

  'koenji': [
    {
      name: '高円寺 マッシュルームトーキョー',
      genre: 'cafe',
      area: '高円寺駅から徒歩5分',
      description: 'きのこ料理に特化した個性派カフェ。ランチの大皿きのこプレートが看板で、好奇心旺盛な小学生連れにも会話が弾む。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '高円寺 アール座読書館 系の昼カフェ',
      genre: 'cafe',
      area: '高円寺駅から徒歩4分',
      description: '高円寺らしい古道具と植物に囲まれたカフェ。サイフォンコーヒーと自家製スイーツが楽しめ、静かな環境を求める客層に向く。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'asagaya': [
    {
      name: '阿佐ケ谷 一徳',
      genre: 'noodles',
      area: '阿佐ケ谷駅から徒歩2分',
      description: '阿佐ケ谷の老舗ラーメン店。背脂醤油の中華そばが看板で、地元客に長年愛される。子ども用にスープ薄めの相談も可。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
    },
  ],

  'ogikubo': [
    {
      name: '荻窪 シナボン 系の街パン店',
      genre: 'bakery',
      area: '荻窪駅から徒歩3分',
      description: '荻窪駅近くの個人ベーカリー。総菜パンやハード系まで幅広く、イートインでサンドイッチとコーヒーを味わえる。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
    {
      name: '荻窪 名曲喫茶 ミニヨン',
      genre: 'cafe',
      area: '荻窪駅から徒歩4分',
      description: '荻窪の名曲喫茶。クラシックを聴きながらコーヒーや軽食を味わえる。落ち着いた雰囲気を求める大人客が中心。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'kichijoji': [
    {
      name: '吉祥寺 メンチカツの さとう',
      genre: 'others',
      area: '吉祥寺駅から徒歩3分',
      description: '吉祥寺サンロード商店街の精肉店「肉のさとう」の元祖丸メンチカツ。連日行列の名物で、井の頭公園散策のおやつに最適。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '吉祥寺 小ざさ',
      genre: 'sweets',
      area: '吉祥寺駅から徒歩3分',
      description: 'ハーモニカ横丁の超人気和菓子店。一日150本限定の最中と羊羹が看板で、早朝から行列必至。テイクアウトのみ。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '吉祥寺 まめ蔵',
      genre: 'curry',
      area: '吉祥寺駅から徒歩5分',
      description: '吉祥寺の老舗カレー店。ポークカレーやチキンカレーがマイルドで、子どもにも食べやすい辛さ。家族連れの常連が多い。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '吉祥寺 アトリエ ド フロマージュ',
      genre: 'cafe',
      area: '吉祥寺駅から徒歩6分',
      description: '吉祥寺のチーズ専門カフェ。チーズフォンデュやチーズケーキセットが看板で、井の頭公園帰りの家族連れに好評。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
    {
      name: '吉祥寺 武蔵野茶房',
      genre: 'cafe',
      area: '吉祥寺駅から徒歩4分',
      description: '吉祥寺の和カフェ。あんみつや抹茶パフェが看板で、座敷席もあり乳児連れの相談も可。落ち着いた雰囲気。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
    },
  ],

  'mitaka': [
    {
      name: '三鷹 山田珈琲店',
      genre: 'cafe',
      area: '三鷹駅から徒歩4分',
      description: '三鷹駅前の自家焙煎喫茶。ネルドリップのコーヒーとモーニングセット・ランチセットが手頃。家族連れの利用も多い。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '三鷹 風の散歩道 カフェ',
      genre: 'cafe',
      area: '三鷹駅から徒歩10分（ジブリ美術館方面）',
      description: '玉川上水沿いの散歩道にあるカフェ。ジブリ美術館行きの途中休憩に好適で、サンドイッチやケーキセットを家族で楽しめる。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '三鷹 みたか食堂',
      genre: 'washoku',
      area: '三鷹駅から徒歩3分',
      description: '三鷹駅前の昭和定食屋。日替わり定食や肉野菜炒め定食が手頃で、地元会社員と家族連れで賑わう。テーブル席中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 中央線・銀座・日本橋
  // ===========================================================

  'nihombashi': [
    {
      name: '日本橋 玉ゐ',
      genre: 'washoku',
      area: '日本橋駅から徒歩5分',
      description: '昭和の倉庫を改装した穴子料理専門店。煮上げ・焼き上げの「箱めし」が看板で、座敷席もあり家族でゆっくり味わえる。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '日本橋 高島屋 特別食堂',
      genre: 'yoshoku',
      area: '日本橋駅直結（日本橋高島屋S.C. 本館）',
      description: '日本橋高島屋本館8階の老舗食堂。日本料理「野田岩」、洋食「ハロー」、寿司「鼎泰豊」などの集合店として家族で目的別に選べる。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      nursingRoom: true,
      diaperChangingTable: true,
      kidsCutlery: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '日本橋 千疋屋総本店 フルーツパーラー',
      genre: 'cafe',
      area: '日本橋駅から徒歩2分',
      description: '創業1834年の老舗フルーツパーラー。マンゴーやメロンのパフェ、フルーツサンドが看板。家族での記念日利用にも向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  'shimbashi': [
    {
      name: '新橋 むさしや',
      genre: 'noodles',
      area: '新橋駅から徒歩2分',
      description: '新橋駅前の立ち食いそばだが座席もある老舗。コロッケそばやかき揚げそばが看板で、サラリーマンと観光客で常時賑わう。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
    },
    {
      name: '新橋 ポンヌッフ',
      genre: 'yoshoku',
      area: '新橋駅から徒歩3分',
      description: '新橋駅前ビル地下の昭和洋食。ナポリタンとカレーをワンプレートで盛った「ナポリタンカレー」が名物。観光気分で家族でも入りやすい。',
      stepFree: false,
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'akasaka': [
    {
      name: '赤坂 一龍別館',
      genre: 'korean',
      area: '赤坂駅から徒歩4分',
      description: '赤坂のソルロンタン専門店。乳白色のスープと牛肉の旨味が滋味深く、子ども用に取り分けやすい。テーブル席で家族でゆっくり。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '赤坂 ふくべ',
      genre: 'washoku',
      area: '赤坂見附駅から徒歩5分',
      description: '赤坂の老舗居酒屋。ランチは煮魚定食や日替わり定食が手頃で、座敷席もあり家族での相談に応じてくれる。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
    },
  ],

  'hamamatsucho': [
    {
      name: '浜松町 鳥番長 系個人焼き鳥',
      genre: 'washoku',
      area: '浜松町駅から徒歩4分',
      description: '浜松町エリアの個人焼鳥店。ランチは親子丼や鳥そぼろ丼が手頃で、家族連れも気兼ねなく入れる。テーブル席中心。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
    {
      name: '浜松町 おかめ寿司',
      genre: 'sushi',
      area: '浜松町駅から徒歩5分',
      description: '浜松町の老舗寿司店。ランチは握り寿司やちらしのセットが手頃。座敷席もあり家族連れの相談に応じる。',
      privateRoom: true,
      seatingType: ['table', 'counter', 'zashiki'],
      priceLunch: '〜3,500円',
    },
  ],

  'tsukiji': [
    {
      name: '築地 鳥めし鳥藤分店',
      genre: 'washoku',
      area: '築地駅から徒歩5分',
      description: '場外市場の鶏料理店。親子丼と鳥スープの組み合わせが看板で、子ども用にあっさり目の相談も可。テーブル席中心。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '築地 米花',
      genre: 'washoku',
      area: '築地駅から徒歩7分',
      description: '築地の老舗割烹。ランチは煮魚定食や鯛茶漬けが手頃で、座敷席もあり家族でゆっくり食事できる。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜3,500円',
    },
  ],

  'tsukishima': [
    {
      name: '月島 もんじゃ もへじ本店',
      genre: 'teppan',
      area: '月島駅から徒歩5分',
      description: '月島もんじゃストリートの代表格。海鮮もんじゃ・明太もちチーズが看板で、テーブルが広く家族でも食べやすい。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
    {
      name: '月島 おしお本店',
      genre: 'teppan',
      area: '月島駅から徒歩4分',
      description: '月島もんじゃの老舗。スタッフが目の前で焼いてくれるので初心者・子連れにも安心。テーブル席中心で家族連れに人気。',
      kidsMenu: true,
      seatingType: ['table'],
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜3,500円',
      popular: true,
    },
  ],

  // ===========================================================
  // 世田谷・目黒・品川南
  // ===========================================================

  'sangenjaya': [
    {
      name: '三軒茶屋 にこたま',
      genre: 'cafe',
      area: '三軒茶屋駅から徒歩4分',
      description: '三軒茶屋の住宅街にある古民家カフェ。日替わりプレートランチと自家製スイーツが看板で、テラス席もあり家族連れに人気。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'komazawa-daigaku': [
    {
      name: '駒沢大学 BUNDY BEACH 駒沢公園',
      genre: 'cafe',
      area: '駒沢大学駅から徒歩10分（駒沢オリンピック公園内）',
      description: '駒沢公園内のカフェ。テラス席広く、ベビーカーや三輪車でそのまま入れる。家族のランニング・サイクリング後の休憩に最適。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table', 'terrace'],
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '駒沢大学 nephew',
      genre: 'cafe',
      area: '駒沢大学駅から徒歩6分',
      description: '駒沢公園近くのコーヒー＆サンドイッチスタンド。広めのテーブル席があり、公園散策ついでに家族で立ち寄れる。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'meguro': [
    {
      name: '目黒 トンキ 目黒本店',
      genre: 'tonkatsu',
      area: '目黒駅から徒歩3分',
      description: '昭和14年創業のとんかつ専門店。ヒレ・ロースの定食一筋で、コの字カウンターが特徴。家族連れは早めの時間帯が無難。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '目黒 とんかつ かつ壱',
      genre: 'tonkatsu',
      area: '目黒駅から徒歩6分',
      description: '目黒の隠れ家とんかつ店。厳選素材のロースカツが看板で、テーブル席は家族連れも比較的入りやすい。ランチは手頃。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '目黒 中華 香港園',
      genre: 'chinese',
      area: '目黒駅から徒歩5分',
      description: '目黒の老舗中華。担々麺や麻婆豆腐定食、餃子セットが看板。テーブル席中心で家族でシェアしやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  'fudomae': [
    {
      name: '不動前 ミハシラ コーヒー',
      genre: 'cafe',
      area: '不動前駅から徒歩3分',
      description: '不動前駅近くの自家焙煎カフェ。サンドイッチやキッシュのランチプレートが看板で、住宅街の落ち着いた雰囲気で家族連れに向く。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '不動前 ジューンベリー',
      genre: 'bakery',
      area: '不動前駅から徒歩4分',
      description: '不動前のベーカリーカフェ。クロワッサンやデニッシュ・サンドイッチを店内で軽食として食べられる。家族連れに親しまれる。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜1,000円',
    },
  ],

  'musashi-koyama': [
    {
      name: '武蔵小山 デリー パルム店',
      genre: 'curry',
      area: '武蔵小山駅から徒歩5分',
      description: '武蔵小山パルム商店街にあるカレー店。マイルドなチキンカレーから本格スパイスカレーまで揃い、子ども用に辛さ控えめも対応。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '武蔵小山 アグネスホテル系個人ベーカリー',
      genre: 'bakery',
      area: '武蔵小山駅から徒歩3分',
      description: '武蔵小山パルム商店街内の個人ベーカリー。総菜パンや食パンが手頃で、商店街散策のお供に。イートインスペースもある。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'togoshi-ginza': [
    {
      name: '戸越銀座 後藤蒲鉾店 おでん',
      genre: 'others',
      area: '戸越銀座駅から徒歩2分',
      description: '戸越銀座商店街の老舗練物店。揚げたての練物やおでんを立ち食いで食べ歩きできる、商店街散歩の定番スポット。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '戸越銀座 鳥勇',
      genre: 'others',
      area: '戸越銀座駅から徒歩4分',
      description: '戸越銀座商店街の焼き鳥・惣菜店。テイクアウト中心で焼き鳥を商店街散策のおやつとして家族で楽しめる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'oimachi': [
    {
      name: '大井町 ブルドッグ',
      genre: 'yoshoku',
      area: '大井町駅から徒歩4分',
      description: '大井町の老舗洋食店。ハンバーグ・ナポリタン・カキフライなど王道洋食が手頃で、家族連れにも入りやすい。テーブル席中心。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '大井町 ふじ家',
      genre: 'noodles',
      area: '大井町駅から徒歩3分',
      description: '大井町の老舗そば店。鴨南蛮や天もりが看板で、家族でかけそばを選びやすい。テーブル席もあり。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
  ],

  'omori': [
    {
      name: '大森 大森小町',
      genre: 'washoku',
      area: '大森駅から徒歩5分',
      description: '大森の和食店。日替わり定食や煮魚・焼き魚定食が手頃で、地元の家族連れに親しまれる。テーブル席中心。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '大森 鳥久',
      genre: 'others',
      area: '大森駅から徒歩2分',
      description: '大森駅前の鳥惣菜店。お弁当の鳥久弁当や唐揚げが地元名物で、家族で公園に持参するピクニック需要にも。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'kamata': [
    {
      name: '蒲田 餃子の王さま',
      genre: 'chinese',
      area: '蒲田駅から徒歩4分',
      description: '羽根つき餃子発祥の店として知られる蒲田の老舗中華。羽根つき餃子のパリパリ食感が家族にも好評で、テーブル席中心。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '蒲田 グリル ニュー紅花',
      genre: 'yoshoku',
      area: '蒲田駅から徒歩5分',
      description: '蒲田の老舗洋食店。ハンバーグやエビフライ定食が看板で、座敷席もあり家族連れに入りやすい。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 江戸川・葛飾・足立
  // ===========================================================

  'kasai': [
    {
      name: '葛西 アクアマリン',
      genre: 'cafe',
      area: '葛西駅から徒歩3分',
      description: '葛西駅前のファミリー向けカフェ。パンケーキやランチプレートが看板で、ベビーカー入店もしやすくキッズメニューもある。',
      strollerOk: true,
      kidsMenu: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  'shibamata': [
    {
      name: '柴又 とらや',
      genre: 'noodles',
      area: '柴又駅から徒歩3分（帝釈天参道）',
      description: '映画「男はつらいよ」のロケ地としても知られる老舗。草だんごとそば・うどんを家族で楽しめる。座敷席があり乳児連れも安心。',
      privateRoom: true,
      seatingType: ['table', 'counter', 'zashiki'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: '柴又 髙木屋老舗 別館',
      genre: 'sweets',
      area: '柴又駅から徒歩2分',
      description: '柴又帝釈天参道の老舗草だんご店の別館。座敷席で団子と抹茶セットを家族で味わえる。参道散策のお供にも。',
      privateRoom: true,
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'kita-senju': [
    {
      name: '北千住 サンローゼ',
      genre: 'yoshoku',
      area: '北千住駅から徒歩6分',
      description: '北千住の老舗洋食店。ハンバーグやオムライスが看板で、テーブル席は家族連れも入りやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '北千住 ペコちゃん焼 不二家千住店',
      genre: 'sweets',
      area: '北千住駅から徒歩3分',
      description: '全国でもここでしか買えないペコちゃん焼の店。あんこ・カスタード等のフィリングを選べ、子どもへの手土産に最適。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '北千住 千住の伊勢屋',
      genre: 'sweets',
      area: '北千住駅から徒歩5分',
      description: '北千住の老舗和菓子店。豆大福や草餅など昔ながらの和菓子が手頃で、商店街散策のお土産に重宝する。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'oji': [
    {
      name: '王子 石鍋商店',
      genre: 'sweets',
      area: '王子駅から徒歩2分',
      description: '王子の老舗和菓子店。くず餅と黒蜜きな粉のセットが看板で、座敷席で家族でゆっくり食べられる。お土産にも人気。',
      seatingType: ['table', 'zashiki'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '王子 名主の滝公園 茶屋',
      genre: 'cafe',
      area: '王子駅から徒歩7分（名主の滝公園内）',
      description: '都内で珍しい滝のある公園内の茶屋。あんみつや抹茶セットを庭園を眺めながら味わえる。子連れ散策の休憩にも好適。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'akabane': [
    {
      name: '赤羽 川栄',
      genre: 'others',
      area: '赤羽駅から徒歩3分（赤羽一番街商店街）',
      description: '赤羽一番街の老舗惣菜店。鯉のうま煮や煮魚を立ち食い・テイクアウトで楽しめる。家族の食卓のおかず買いにも重宝。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '赤羽 いこい',
      genre: 'others',
      area: '赤羽駅から徒歩3分',
      description: '昼から開いている赤羽OK横丁の名店。煮込みやポテトサラダが看板で立ち飲みが基本だが家族連れの相談も可。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  'machiya': [
    {
      name: '町屋 中華 三河屋',
      genre: 'chinese',
      area: '町屋駅から徒歩3分',
      description: '町屋の町中華。タンメンやチャーハンが看板で、地元の家族連れに長年愛される雰囲気。テーブル席中心。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'nippori': [
    {
      name: '日暮里 駄菓子問屋街 個店',
      genre: 'sweets',
      area: '日暮里駅から徒歩5分',
      description: '駄菓子問屋街の小売対応店舗。子どもとの食べ歩き買い物が楽しめる。買い物袋持参の家族連れが多い。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
    {
      name: '日暮里 中華 ほうしゅうえん',
      genre: 'chinese',
      area: '日暮里駅から徒歩3分',
      description: '日暮里駅近くの町中華。ランチセットが手頃で、家族連れも気兼ねなく入れる気取らない雰囲気。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 板橋・練馬・中野
  // ===========================================================

  'itabashi': [
    {
      name: '板橋 ブーランジェリー イチリン',
      genre: 'bakery',
      area: '板橋駅から徒歩4分',
      description: '板橋の街パン店。クロワッサンやハード系パンが看板で、イートインで家族でモーニングを楽しめる。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  'oyama': [
    {
      name: '大山 ハッピーロード大山 老舗洋食',
      genre: 'yoshoku',
      area: '大山駅から徒歩3分',
      description: '大山ハッピーロード商店街の老舗洋食。ハンバーグ・オムライスがリーズナブルで家族連れに人気。テーブル席中心。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  'narimasu': [
    {
      name: '成増 マイ・チェスト',
      genre: 'cafe',
      area: '成増駅から徒歩4分',
      description: '成増の住宅街にある自家焙煎カフェ。ランチセットや手作りケーキが看板で、家族連れにも親しまれる雰囲気。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  'nakano-sakaue': [
    {
      name: '中野坂上 中華 富士見屋',
      genre: 'chinese',
      area: '中野坂上駅から徒歩3分',
      description: '中野坂上の町中華。タンメンや麻婆豆腐定食が手頃で、地元客と家族連れに親しまれる。テーブル席中心。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  'nakano': [
    {
      name: '中野 大盛軒',
      genre: 'chinese',
      area: '中野駅から徒歩4分',
      description: '中野の老舗町中華。ボリューム満点のチャーシュー麺やレバニラ炒め定食が看板。家族連れにも気兼ねなく入れる。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '中野 デイリーチコ',
      genre: 'sweets',
      area: '中野駅から徒歩4分（中野ブロードウェイ内）',
      description: '中野ブロードウェイ地下の8段ソフトクリームで全国的に有名。子どもたちと撮影しながら食べる体験スポット。',
      stepFree: false,
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],
};
