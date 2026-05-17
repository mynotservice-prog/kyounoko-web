/**
 * 駅別 個人店マッピング — chunk-28（東京・子連れランチ拡充：練馬・足立・葛飾・江戸川・板橋・世田谷）
 *
 * - 各駅ごとに Web 調査で実在を確認した実名の個人店のみを掲載
 * - チェーン店・複数店舗展開のグループ系は除外（別途登録済み）
 * - 子連れ向き設備（ベビーカー・座敷・おむつ替え等）は公開情報・取材記事ベースの推定。
 *   最終的には店舗確認前提。
 * - 食べログ点数等の数値スコアは引用していない
 * - 同じ駅 slug は index.ts の mergeIndieMaps で結合される
 */

import type { StationIndieMap } from './types';

export const CHUNK_28: StationIndieMap = {
  // ===========================================================
  // 大泉学園（練馬区）
  // ===========================================================
  'oizumi-gakuen': [
    {
      name: 'リストランテ カルド',
      genre: 'italian',
      area: '大泉学園駅から徒歩3分',
      description:
        '練馬の地元食材を使う本格イタリアン。子連れにやさしい店として知られ、2階には貸切もできる広めの個室スペースがあり、ママ会やグループでの子連れランチに使いやすい。',
      privateRoom: true,
      seatingType: ['table', 'counter'],
      stepFree: false,
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'Obbligazioni（オブリガツィオーニ）',
      genre: 'italian',
      area: '大泉学園駅から徒歩13分',
      description:
        '住宅街に建つログハウス風の一軒家イタリアン。木のテーブルと白壁の落ち着いた空間で、個室があるので赤ちゃん連れでも周りを気にせずゆっくり食事できる。全席禁煙。',
      privateRoom: true,
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 江古田（練馬区）
  // ===========================================================
  'ekoda': [
    {
      name: 'キッチンABC 江古田店',
      genre: 'yoshoku',
      area: '江古田駅から徒歩2分',
      description:
        '昭和44年創業の地元密着の洋食店。ハンバーグやオムライスなど子どもも好きな定番メニューが揃い、リーズナブルでボリュームたっぷり。子ども用の椅子や食器の用意もある。',
      kidsChair: true,
      kidsCutlery: true,
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
    {
      name: 'girasole（ジラソーレ）',
      genre: 'italian',
      area: '江古田駅南口から徒歩1分',
      description:
        '野菜をたっぷり食べられるアットホームなイタリアン。ソファ席や子ども用の椅子があり、テーブル席・ボックス席で小さな子も一緒にテーブルを囲める。ランチは700円台からと手頃。',
      kidsChair: true,
      seatingType: ['table', 'box'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'CAFFE BLU（カフェ ブル）',
      genre: 'cafe',
      area: '江古田駅から徒歩3分',
      description:
        '昼はイタリアンが味わえるカフェ。大きなソファ席でくつろげてお子様セットもあり、ランチタイムは全席禁煙なので子連れでも安心して過ごせる。',
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 上石神井（練馬区）
  // ===========================================================
  'kami-shakujii': [
    {
      name: 'カフェ コメコ',
      genre: 'cafe',
      area: '上石神井駅から徒歩2分',
      description:
        '米粉を使ったヘルシーな定食やパンケーキが人気の隠れ家カフェ。お座敷席があり、その奥にはおむつ替え用のベビーベッドも。子ども用の取り皿やスプーンも頼めば出してもらえる。',
      strollerOk: true,
      kidsMenu: true,
      privateRoom: true,
      kidsCutlery: true,
      seatingType: ['zashiki', 'table'],
      diaperChangingTable: true,
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      kidsChair: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 北千住（足立区）
  // ===========================================================
  'kita-senju': [
    {
      name: 'JUICE BAR ROCKET（ジュースバー ロケット）',
      genre: 'cafe',
      area: '北千住駅から徒歩7分',
      description:
        '2階のランチフロアは靴を脱いで上がる仕様で、ボールプールやすべり台のキッズスペース付き。トイレにおむつ替えシートとおまるがあり、離乳食の持ち込みもできる赤ちゃん連れ歓迎の店。',
      kidsSpace: true,
      seatingType: ['zashiki', 'table'],
      diaperChangingTable: true,
      bringBabyFood: true,
      kidsChair: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'café わかば堂',
      genre: 'cafe',
      area: '北千住駅から徒歩5分',
      description:
        '路地裏の民家を改装した一軒家の隠れ家カフェ。ランチにはスープやサラダが付き、温かみのある落ち着いた空間でゆっくり子連れランチを楽しめる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'まじ満',
      genre: 'washoku',
      area: '北千住駅から徒歩6分',
      description:
        '昭和31年創業のうなぎの老舗。カウンター・テーブルに加え座敷席があり、畳張りの2階は大人数も対応。ベビーカーでの入店もでき、和の落ち着いた空間で子連れランチに使える。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['zashiki', 'table', 'counter'],
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 綾瀬（足立区）
  // ===========================================================
  'ayase': [
    {
      name: 'ファディッシュ',
      genre: 'cafe',
      area: '綾瀬駅から徒歩3分',
      description:
        '雑貨屋のような可愛い外観のカフェ。子連れ家族に嬉しいゆったりしたソファ席があり、テーブル席・カウンター席も。ロコモコなどのランチが手頃な価格で楽しめる。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜1,000円',
    },
    {
      name: 'ビストロ Le Ballon（ル バロン）',
      genre: 'french',
      area: '綾瀬駅から徒歩2分',
      description:
        '気軽でアットホームなビストロバル。駅近でリーズナブルなフレンチランチが楽しめ、カジュアルな雰囲気なので子連れでも入りやすい。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 西新井（足立区）
  // ===========================================================
  'nishiarai': [
    {
      name: 'ギャラクカフェ',
      genre: 'cafe',
      area: '西新井駅から徒歩3分（ギャラクシティ内）',
      description:
        '体験型施設ギャラクシティに併設されたオープンカフェ。子ども向け施設の中なので店内も子連れが多く、パスタやキッズメニューが選べる親子セットがあり、気兼ねなく過ごせる。',
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'エンブレムホステル西新井 CAFE&BAR',
      genre: 'cafe',
      area: '西新井駅から徒歩圏（梅島・ホステル2階）',
      description:
        'ホステル2階のおしゃれなカフェバー。オリジナルハンバーガーやパスタに加えキッズプレートやくまさんピザもあり、座面の広いソファ席とベビーチェアで子連れランチに使いやすい。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      bringBabyFood: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 亀有（葛飾区）
  // ===========================================================
  'kameari': [
    {
      name: '欧風食堂 ペパン',
      genre: 'yoshoku',
      area: '亀有駅北口から徒歩5分',
      description:
        '下町情緒の中でフレンチ・イタリアンなど欧風料理をカジュアルに楽しめる食堂。日替わりのお子様メニューがあり、白身魚やステーキ、ハンバーグから選べるランチセットが人気。',
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'ひよこのカフェハウス',
      genre: 'cafe',
      area: '亀有駅から徒歩12分',
      description:
        '元保育所を改装したオーガニック親子カフェ。小上がり席メインで小さな子も安心、キッズスペースやオーガニック離乳食、授乳室を完備。離乳食の持ち込みもできる。',
      privateRoom: true,
      kidsMenu: true,
      kidsSpace: true,
      seatingType: ['zashiki'],
      nursingRoom: true,
      bringBabyFood: true,
      diaperChangingTable: true,
      kidsChair: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'ラ・ローズ・ジャポネ',
      genre: 'sweets',
      area: '亀有駅から徒歩7分（亀有香取神社境内）',
      description:
        '香取神社の境内にあるオーナーシェフのケーキ店。境内でベビーカーを動かしやすく、お参りや散歩の前後にスイーツでひと休みできる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 金町（葛飾区）
  // ===========================================================
  'kanamachi': [
    {
      name: 'Deli Cafe&肉Bar カナデリカ',
      genre: 'cafe',
      area: '金町駅から徒歩3分',
      description:
        '昼はデリカフェ、夜は肉バーになる店。おもちゃのあるキッズスペースとお子様セットがあり、ソファ席でくつろげるので親子でゆっくりランチを楽しめる。',
      kidsMenu: true,
      kidsSpace: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      kidsChair: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'dacco*caffe（ダッコカフェ）',
      genre: 'cafe',
      area: '金町駅から徒歩圏',
      description:
        'おいしいエスプレッソが飲めるカフェ。ソファ席があり子連れでも落ち着けて、午後のおしゃべりセットはドリンクおかわり自由でケーキ・ピザ付きとゆっくり過ごしやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'Cafe hakuta（カフェ ハクタ）',
      genre: 'cafe',
      area: '金町駅から徒歩圏',
      description:
        'シンプルで落ち着いた雰囲気のカフェ。ガトーショコラやチーズケーキなどの自家製スイーツが楽しめ、オープンテラス席もあるので天気のよい日の子連れ休憩に向く。',
      seatingType: ['table', 'terrace'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 京成高砂（葛飾区）
  // ===========================================================
  'keisei-takasago': [
    {
      name: 'トラットリア た喜ち 高砂店',
      genre: 'italian',
      area: '京成高砂駅から徒歩2分',
      description:
        '高砂では希少な本格イタリアンをリーズナブルに楽しめる店。店内はフラットでベビーカー入店も快く受け入れてくれ、駅近で子連れランチに使いやすい。ピッツァ・パスタのセットあり。',
      strollerOk: true,
      seatingType: ['table', 'counter'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 青砥（葛飾区）
  // ===========================================================
  'aoto': [
    {
      name: 'PASTA BAR NONNA（ノンナ）青戸店',
      genre: 'italian',
      area: '青砥駅から徒歩2分',
      description:
        '生パスタが自慢のパスタバル。店内はフラットで通路も広くベビーカーで安心、子ども用椅子・キッズメニューもあり、ドリンクバーのそばに絵本も置いてある子連れ歓迎の店。',
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
  ],

  // ===========================================================
  // 新小岩（葛飾区）
  // ===========================================================
  'shin-koiwa': [
    {
      name: 'ダイニングバー リーフ',
      genre: 'yoshoku',
      area: '新小岩駅南口から徒歩3分',
      description:
        'ベビーサークルがあり、子どもを遊ばせながらゆっくりランチできる隠れ家ダイニングバー。子ども用の椅子があり離乳食の持ち込みもOK、トイレにおむつ替えシートもある。',
      kidsChair: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      bringBabyFood: true,
      priceLunch: '〜1,000円',
    },
    {
      name: 'クアトロ',
      genre: 'italian',
      area: '新小岩駅北口から徒歩2分',
      description:
        'カジュアルながら本格的なイタリアンが味わえる店。ベビーカーでの入店ができ離乳食の持ち込みもOK、天気のよい日はテラス席でも食事ができる。',
      strollerOk: true,
      seatingType: ['table', 'terrace'],
      bringBabyFood: true,
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '一陽堂オレンジカフェ',
      genre: 'cafe',
      area: '新小岩駅から徒歩8分',
      description:
        '栄養士や調理師の資格を持つスタッフが、野菜にこだわったヘルシーなランチを提供するカフェ。ベビーベッドやベビーチェアの用意があり、可愛いキッズメニューもある。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      bringBabyFood: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'エールアトリエ（Air Atelier Café）',
      genre: 'cafe',
      area: '新小岩駅から徒歩9分',
      description:
        '野菜ソムリエが考える一汁三菜の定食が人気の隠れ家一軒家カフェ。テラス席があり子どもが少し騒いでも気兼ねなく過ごせる。営業日が限られるので事前確認を。',
      seatingType: ['table', 'terrace'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 小岩（江戸川区）
  // ===========================================================
  'koiwa': [
    {
      name: 'アヤスカフェ小岩',
      genre: 'cafe',
      area: '小岩駅から徒歩4分',
      description:
        '0歳児連れのママ向けに作られたカフェ。バンボやバウンサー、おむつ替えスペース、授乳室まで揃い、ベビーカーの置き場もある。赤ちゃんの外食デビューにも使いやすい。',
      seatingType: ['table'],
      diaperChangingTable: true,
      nursingRoom: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '喫茶 ムムリク',
      genre: 'cafe',
      area: '小岩駅から徒歩8分',
      description:
        'ママがホッと一息つける場所をという思いで生まれた喫茶店。おもちゃが並ぶキッズスペースがあり、キッズプレートや子ども向けのトマトスープおじやも用意されている。',
      kidsMenu: true,
      kidsSpace: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      kidsChair: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'カフェライク',
      genre: 'cafe',
      area: '小岩駅から徒歩圏',
      description:
        '隠れ家のような居心地のいい一軒家カフェ。テラス席があるので、子連れでも気兼ねなくカフェタイムやランチを楽しめる。',
      seatingType: ['table', 'terrace'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 一之江（江戸川区）
  // ===========================================================
  'ichinoe': [
    {
      name: 'イタチャイナ',
      genre: 'italian',
      area: '一之江駅北口から徒歩6分',
      description:
        'フレンチ出身の店主が営む、2001年創業の地元密着イタリアン。テーブル席に加えてお座敷席があるので、小さな子ども連れでもくつろぎやすい。パスタのランチが手頃な価格。',
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      shareDish: true,
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 葛西（江戸川区）
  // ===========================================================
  'kasai': [
    {
      name: 'パティスリーカフェ ひばり',
      genre: 'sweets',
      area: '葛西駅から徒歩8分',
      description:
        '手作りケーキとパスタやキッシュのランチが楽しめる子ども大歓迎のカフェ。絵本やおもちゃ、低めのテーブル席があり、キッズプレートも用意。テラス席で子どもの声を気にせず過ごせる。',
      kidsMenu: true,
      seatingType: ['table', 'terrace'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 西葛西（江戸川区）
  // ===========================================================
  'nishi-kasai': [
    {
      name: '鉄板個室ダイニング きとら庵 西葛西',
      genre: 'yoshoku',
      area: '西葛西駅から徒歩2分',
      description:
        'ハンバーグやステーキのランチセットが人気の鉄板ダイニング。掘りごたつの座敷を含む3種類の個室があり、子連れのママ会やグループでの食事に使いやすい。モーニングも営業。',
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 小竹向原（練馬区・板橋区）
  // ===========================================================
  'kotake-mukaihara': [
    {
      name: 'まちのパーラー',
      genre: 'bakery',
      area: '小竹向原駅から徒歩5分',
      description:
        '保育園と同じ建物にある開放的なベーカリーカフェ。入口がスロープでベビーカーでも入りやすく、多目的トイレでおむつ替えも可能。昼はサンドイッチなどのランチが楽しめる。',
      strollerOk: true,
      stepFree: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 大山（板橋区）
  // ===========================================================
  'oyama': [
    {
      name: '人と地球に優しいカフェ はぐくみ',
      genre: 'cafe',
      area: '大山駅東口から徒歩圏',
      description:
        'サステナブルをコンセプトにしたカフェ。栄養バランスを考えたヘルシーなランチが特徴で、ベビーカーのまま入店する子連れグループの姿も。カウンター・テーブル席があり静かに過ごせる。',
      strollerOk: true,
      seatingType: ['table', 'counter'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 池尻大橋（世田谷区）
  // ===========================================================
  'ikejiri-ohashi': [
    {
      name: 'うちごはん',
      genre: 'washoku',
      area: '池尻大橋駅から徒歩10分（三宿交差点近く）',
      description:
        '白を基調にしたおしゃれなカフェレストラン。大分産の米やココナッツオイルなど食材にこだわった定食が評判で、カウンター・テーブル席がありベビーカーでの入店もできる。',
      strollerOk: true,
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'アラスカ ツヴァイ（Alaska zwei）',
      genre: 'cafe',
      area: '池尻大橋駅から徒歩9分',
      description:
        '中目黒との間の閑静な住宅街にあるビーガンカフェ。玄米ごはんプレートや豆腐カツ丼など自然栽培の野菜を使ったヘルシーメニューが揃い、ノスタルジックな空間でゆっくり過ごせる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
  ],
};
