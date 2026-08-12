/**
 * 駅別 個人店マッピング — chunk-40a（埼玉15駅 子連れランチ）
 *
 * - 各駅ごとに Web 調査で実在を確認した実名の個人店・小規模店のみを掲載
 * - 全国チェーン（梅の花・木曽路・ざうお・ナポリの食卓 等）は対象外
 *   （lib/station-restaurants.ts で全駅自動付与済み）
 * - 子連れ向き設備は公式サイト・取材記事ベースの推定。最終的には店舗確認前提
 * - 食べログ点数等の数値スコアは引用していない
 */

import type { StationIndieMap } from './types';

export const CHUNK_40A: StationIndieMap = {
  // ===========================================================
  // 大宮駅（さいたま市大宮区）
  // ===========================================================
  'omiya': [
    // 'IRIS（アイリス）' は削除（2026-08-12）。公式サイト iris-omiya.com に
    // 「2024年6月22日をもって移転のため閉店」と記載があり、現存しない店舗だった。
    //
    // ▼ ここから2026-08-12追加: ルミネ大宮の公式フロアガイド（lumine.ne.jp/omiya/floorguide）
    //   から、フロア・ジャンル・席数・ランチ予算を一次情報として転記した15店。
    //   - priceLunch は公式の「ランチ：◯円〜」の開始価格が入るバンド。ただし開始価格が
    //     1,000円前後でも実際の一食は超えるため 〜1,000円 バンドは使わない。
    //   - seatingType は公式の席数表記（「テーブル30席 カウンター5席」等）から起こす。
    //     内訳が無く総席数だけの店は table のみとする。
    //   - kidsMenu / strollerOk 等は公式に記載が無いので立てない（推測で埋めない）。
    //     例: 卵と私は公式メニューを確認したがキッズ区分が無かった。
    //   - くら寿司・洋麺屋五右衛門は lib/station-restaurants.ts のチェーン側で出るため除外。
    {
      name: 'Aloha Table ルミネ大宮店',
      genre: 'cafe',
      area: '大宮駅直結（ルミネ大宮2 4F）',
      description:
        'ハワイ・ワイキキに本店を持つハワイアンカフェ＆ダイニング。164席と広く、開放感のあるテラス席もあるオールデイダイニングで、時間帯を選ばず使える。公式のランチ予算は1,500円〜。',
      seatingType: ['table', 'terrace'],
      priceLunch: '〜2,000円',
    },
    {
      name: '一汁一菜ごはん 御御御 ルミネ大宮店',
      genre: 'washoku',
      area: '大宮駅直結（ルミネ大宮2 4F）',
      description:
        '具だくさんの豚汁とおかずを組み合わせる一汁一菜の定食店。おかずを好みで選べるので、子どもに取り分けやすい構成にできる。テーブル席43席。公式の予算は1,200〜2,500円。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '一風堂 ルミネ大宮店',
      genre: 'noodles',
      area: '大宮駅直結（ルミネ大宮2 4F）',
      description:
        '福岡発のとんこつラーメン店。カウンター4席・テーブル20席と小ぶりなので、ベビーカーでの入店可否は事前確認が安心。サイドメニューがあり取り分けもしやすい。公式のランチ予算は1,000円〜。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'う匠 山家 膳兵衛',
      genre: 'washoku',
      area: '大宮駅直結（ルミネ大宮2 4F）',
      description:
        '創業明治5年の地元大宮のうなぎ老舗「山家」の姉妹店。たれ焼きに加え、たれを使わない塩焼きも選べるので子どもと分けやすい。46席。テイクアウトあり。公式のランチ予算は1,700円〜。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '大かまど飯 寅福 ルミネ大宮店',
      genre: 'washoku',
      area: '大宮駅直結（ルミネ大宮2 4F）',
      description:
        '店頭の大かまどで炊くご飯が看板の和定食店。昼は3種類のごはんがお替り自由の定食・どんぶりが中心で、白飯を子どもに分けやすい。66席。公式のランチ予算は1,300円〜。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'オムライスの店 卵と私 ルミネ大宮店',
      genre: 'yoshoku',
      area: '大宮駅直結（ルミネ大宮2 4F）',
      description:
        '王道オムライスとふわとろのスフレオムライスを出す専門店。卵料理中心で子どもが食べやすい献立だが、公式メニューにお子様メニューの区分は無く取り分け前提。テーブル40席。ランチ950円〜。',
      seatingType: ['table'],
      kidsMenu: false,
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '黒ぶたや ルミネ大宮店',
      genre: 'shabu',
      area: '大宮駅直結（ルミネ大宮2 4F）',
      description:
        '六白黒豚のしゃぶしゃぶと各種定食の店。昼は定食中心で、鍋よりも取り分けやすい。テーブル30席・カウンター5席。公式のランチ予算は1,250円〜。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
    {
      name: '上海小籠包 石庫門 ルミネ大宮店',
      genre: 'chinese',
      area: '大宮駅直結（ルミネ大宮2 4F）',
      description:
        '店内仕込みの小籠包が看板の本格中華。点心や一品を数種頼んでシェアする使い方ができる。テーブル21席・カウンター2席と小ぶり。公式のランチ予算は1,180円〜。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '築地玉寿司 ルミネ大宮店',
      genre: 'sushi',
      area: '大宮駅直結（ルミネ大宮2 4F）',
      description:
        '創業100年超の寿司店。カウンター11席・テーブル38席でテーブル席が多く、家族でも座りやすい。ランチは1,012円〜と入りやすい価格帯（ディナーは5,000円前後）。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
    {
      name: '牛たん とろろ 麦めし ねぎし ルミネ大宮店',
      genre: 'washoku',
      area: '大宮駅直結（ルミネ大宮2 4F）',
      description:
        '牛たん・とろろ・麦めしをそろえた定食店。ご飯とスープが定食に付くので子どもへの取り分けがしやすい。64席。公式の予算は1,300〜3,550円。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '函館 五島軒 ルミネ大宮店',
      genre: 'yoshoku',
      area: '大宮駅直結（ルミネ大宮2 4F）',
      description:
        '創業明治12年、北海道で最も歴史のある西洋料理店。カレーやハヤシなど子どもと分けやすい洋食が中心。21席と小規模なので混雑時間は避けたい。公式のランチ予算は1,300円〜。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '韓美膳 ルミネ大宮店',
      genre: 'korean',
      area: '大宮駅直結（ルミネ大宮2 4F）',
      description:
        'カジュアルな韓国料理店。石焼ビビンバやスンドゥブなど、辛さを抜いた取り分けがしやすい定番メニューがそろう。公式のランチ予算は1,000円〜。',
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'mangotree cafe ルミネ大宮店',
      genre: 'asian',
      area: '大宮駅直結（ルミネ大宮2 4F）',
      description:
        'タイ料理「マンゴツリー」のカフェ業態。ガパオやカオマンガイなど一皿もの中心で、辛くない料理も選べる。76席と広め。公式のランチ予算は1,200円〜。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'ラ・ヴォーリアマッタ ルミネ大宮店',
      genre: 'italian',
      area: '大宮駅直結（ルミネ大宮2 4F）',
      description:
        '石窯で焼く直径40センチのミラノピッツァが看板のイタリアン。114席とフロアで最も広く、大きなピッツァを家族でシェアしやすい。公式のランチ予算は1,320円〜。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'SLB THE DINING',
      genre: 'yoshoku',
      area: '大宮駅直結（ムスブルミネ 2F）',
      description:
        '大宮市場の魚や埼玉県産食材を使い、一汁三菜を和洋折衷のコースに再構成したレストラン。ランチは11:00〜15:30（L.O.15:00）。予算は公式に記載が無いため要確認。',
      shareDish: true,
    },
    {
      name: 'ビストロ ボナペティ',
      genre: 'yoshoku',
      area: '大宮駅東口から徒歩3分',
      description:
        '100%ビーフの手ごねハンバーグと「大宮ナポリタン」が看板の街洋食店。デミグラスやガーリッククリームなどソースの種類が豊富で、子どもにも食べやすい味付け。昼はカジュアルに利用できる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'WIRED CAFE ルミネ大宮店',
      genre: 'cafe',
      area: '大宮駅西口直結（ルミネ大宮2 1F）',
      description:
        '駅直結のルミネ大宮内のカフェダイニング。テーブル席にベビーカーを横付けでき、キッズチェアやベビー食器の用意もある。ルミネ館内に授乳室・おむつ替え台があり、雨の日のママ会にも便利。',
      strollerOk: true,
      kidsChair: true,
      diaperChangingTable: true,
      nursingRoom: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'シナグロ オーガニックサラダ＆カフェ ルミネ大宮店',
      genre: 'cafe',
      area: '大宮駅西口直結（ルミネ大宮）',
      description:
        '有機野菜を使ったサラダボウルと日替わりデリの専門カフェ。ベビーカー入店OKで、駅直結なのでアクセスしやすい。野菜中心のメニューで子どもにも取り分けやすい。',
      strollerOk: true,
      shareDish: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 浦和駅（さいたま市浦和区）
  // ===========================================================
  'urawa': [
    // ▼ 2026-08-12追加: 浦和PARCOの公式フロアガイド（urawa.parco.jp/floor/detail/?f=5f）から、
    //   フロア／ジャンルを転記した。レストランは5Fに18店が集まっている。浦和駅東口直結。
    //   公式に予算・席数の掲載が無いため priceLunch は入れていない。
    //   生麺専門 鎌倉パスタはチェーン側で出るため除外。
    {
      name: '佐渡廻転寿司 弁慶 浦和PARCO店',
      genre: 'sushi',
      area: '浦和駅直結（浦和PARCO 5F）',
      description:
        '廻転寿司。レーンから子どもが自分で選べるうえ、玉子や納豆巻きなど食べられるネタが必ずある。子連れには5Fで最も使いやすい形式。',
      seatingType: ['table', 'counter'],
      shareDish: true,
    },
    {
      name: '五穀 浦和PARCO店',
      genre: 'washoku',
      area: '浦和駅直結（浦和PARCO 5F）',
      description:
        '和定食の店。ご飯と味噌汁が付く定食形式なので、白飯とおかずを子どもに分けやすい。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '新宿中村屋オリーブハウス 浦和PARCO店',
      genre: 'yoshoku',
      area: '浦和駅直結（浦和PARCO 5F）',
      description:
        '洋食のレストラン。カレーやハヤシなど子どもと分けやすいメニューが中心。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '山下本気うどん 浦和PARCO店',
      genre: 'noodles',
      area: '浦和駅直結（浦和PARCO 5F）',
      description:
        'うどんと天ぷらの店。うどんは短く切って子どもに分けやすい定番。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'いなば和幸 浦和PARCO店',
      genre: 'tonkatsu',
      area: '浦和駅直結（浦和PARCO 5F）',
      description:
        'とんかつの店。ご飯・キャベツ・味噌汁が付く定食形式で取り分けやすい。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '北国とミルク 浦和PARCO店',
      genre: 'italian',
      area: '浦和駅直結（浦和PARCO 5F）',
      description:
        '北海道イタリアン＆カフェ。パスタやピッツァのほかスイーツもあり、食事にも休憩にも使える。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'こてがえし 浦和PARCO店',
      genre: 'teppan',
      area: '浦和駅直結（浦和PARCO 5F）',
      description:
        '築地もんじゃ・お好み焼きの店。1枚を家族で分けやすい。鉄板があるので低年齢の子は席の位置に注意。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '京都二条茶寮 浦和PARCO店',
      genre: 'washoku',
      area: '浦和駅直結（浦和PARCO 5F）',
      description:
        '和食と和スイーツの店。食事のあとにそのまま甘味へ移れるので、子どもの機嫌が持ちやすい。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '仙台牛たん 青葉 浦和PARCO店',
      genre: 'washoku',
      area: '浦和駅直結（浦和PARCO 5F）',
      description:
        '牛たん定食の店。麦めしとテールスープが付き、ご飯を子どもに分けやすい。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'ロプノール 浦和PARCO店',
      genre: 'chinese',
      area: '浦和駅直結（浦和PARCO 5F）',
      description:
        '中国料理の店。取り分け前提の料理が多く、家族でシェアしやすい。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '鯛塩そば 灯花 浦和PARCO店',
      genre: 'noodles',
      area: '浦和駅直結（浦和PARCO 5F）',
      description:
        '鯛出汁の塩ラーメン。あっさりした味で子どもにも取り分けやすい。',
      seatingType: ['table', 'counter'],
      shareDish: true,
    },
    {
      name: 'しゃぶしゃぶ但馬屋 浦和PARCO店',
      genre: 'shabu',
      area: '浦和駅直結（浦和PARCO 5F）',
      description:
        'しゃぶしゃぶ・すき焼きの店。鍋なので取り分けやすい一方、熱いものを扱うので低年齢の子は席の位置に注意。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '江戸前うなぎ かわ祥 浦和PARCO店',
      genre: 'washoku',
      area: '浦和駅直結（浦和PARCO 5F）',
      description:
        'うなぎの店。うな重の白飯は子どもに分けやすい。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '韓美膳 浦和PARCO店',
      genre: 'korean',
      area: '浦和駅直結（浦和PARCO 5F）',
      description:
        '韓国料理の店。石焼ビビンバなど辛さを抜いた取り分けがしやすい定番メニューがそろう。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'ワイアードキッチン 浦和PARCO店',
      genre: 'cafe',
      area: '浦和駅直結（浦和PARCO 6F）',
      description:
        'カフェ・レストラン。ユナイテッド・シネマ浦和と同じ6Fにあり、映画の前後の食事に使える。',
      seatingType: ['table'],
    },
    {
      name: 'SOMETHING サムシング 浦和本店',
      genre: 'italian',
      area: '浦和駅から徒歩4分',
      description:
        '住宅街にある30年以上愛されるイタリアン。陽気なイタリア家庭のような雰囲気で、6〜9名対応の扉付き掘りごたつ個室を備える。全席禁煙でベビーカー入店も可能、家族でゆっくり過ごせる。',
      strollerOk: true,
      privateRoom: true,
      seatingType: ['zashiki', 'table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'LA COCORICO 浦和（ラ ココリコ）',
      genre: 'french',
      area: '浦和駅から徒歩圏（浦和パルコ）',
      description:
        'ロティサリーチキンが名物のカジュアルフレンチ。個室やソファ席があり、子ども連れでも落ち着いて食事ができる構成。骨付きチキンは取り分けやすく、家族のランチに向く。',
      privateRoom: true,
      shareDish: true,
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'RENO cafe（レノカフェ）',
      genre: 'cafe',
      area: '浦和駅から徒歩圏',
      description:
        '国産小麦・直納野菜にこだわる手作りカフェ。ハンバーグやソーセージのキッズプレートが人気で、木の温もりがある隠れ家のような空間。子連れでものんびりランチを楽しめる。',
      kidsMenu: true,
      seatingType: ['table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'オクラカレーストア',
      genre: 'curry',
      area: '浦和駅から徒歩圏',
      description:
        '夫婦2人で営むカレー店。なるべくオーガニック・無添加でカレー全種グルテンフリー対応。2階に座敷席があり、おもちゃも置かれているので子どもも一緒に楽しめる。',
      kidsSpace: true,
      seatingType: ['zashiki', 'counter'],
      stepFree: false,
      diaperChangingTable: true,
      kidsChair: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 川口駅（川口市）
  // ===========================================================
  'kawaguchi': [
    {
      name: 'SHO-AN（ショウアン）',
      genre: 'curry',
      area: '川口駅東口から徒歩3分',
      description:
        '図書館のような落ち着いた雰囲気の小さなスープカレー店。辛さの調節が可能で辛いのが苦手な子どもにも対応してもらえる。テーブル18席のみだが、子連れでもゆっくり過ごしやすい。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'CLAP×CLAP（クラップクラップ）',
      genre: 'cafe',
      area: '川口駅から徒歩圏',
      description:
        'たこ焼き店「めちゃうまたこ源」内のキッズカフェ。無料のキッズスペースが併設され、子どもが遊ぶ近くでゆっくりランチが食べられる。授乳室も完備で乳児連れにありがたい。',
      kidsSpace: true,
      nursingRoom: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      kidsChair: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'リリア カフェ',
      genre: 'cafe',
      area: '川口駅西口直結（川口総合文化センター リリア 1F）',
      description:
        '駅西口直結の文化センター内カフェ。天井が高く明るい店内でテーブル間隔がゆったり。ベビーカーのまま入店でき、館内に授乳室・おむつ替え台あり、雨の日の待ち合わせにも便利。',
      strollerOk: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 西川口駅（川口市）
  // ===========================================================
  'nishi-kawaguchi': [
    {
      name: "BLOOMY'S（ブルーミーズ）",
      genre: 'cafe',
      area: '西川口駅から徒歩5分',
      description:
        'ドライフラワーに囲まれた癒し系のフラワーカフェ。日替わりプレートが楽しめ、写真映えする店内は子連れママ会の利用も多い。テーブル席中心で落ち着いて食事できる。',
      seatingType: ['table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '福招門 西川口店',
      genre: 'chinese',
      area: '西川口駅から徒歩1分',
      description:
        '本格中華の定食が1,000円前後で楽しめる町中華。円卓席や個室・座敷もあり、取り分けやすい中華料理は家族の昼食に重宝。駅直近でアクセスもよくファミリー利用が多い。',
      privateRoom: true,
      shareDish: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜2,000円',
    },
    {
      name: '焼肉 済州苑 西川口店',
      genre: 'yakiniku',
      area: '西川口駅から徒歩2分',
      description:
        '西川口の老舗焼肉店。テーブル席・ボックス席に加えて最大10名対応の座敷席があり、子連れファミリーの利用も多い。ランチタイムから利用できる落ち着いた空間。',
      seatingType: ['zashiki', 'box', 'table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 草加駅（草加市）
  // ===========================================================
  'soka': [
    {
      name: 'いけだ屋 草加せんべい本店',
      genre: 'sweets',
      area: '草加駅から徒歩7分',
      description:
        '草加名物の老舗手焼きせんべい店。店頭で焼きたての煎餅を購入でき、香ばしい匂いと焼き体験は子どもにも楽しい。家族のおやつ調達やお土産に便利。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
      popular: true,
    },
  ],

  // ===========================================================
  // 川越駅（川越市）
  // ===========================================================
  'kawagoe': [
    {
      name: 'MOANA cafe & diner（モアナ カフェ＆ダイナー）',
      genre: 'asian',
      area: '川越駅から徒歩6分',
      description:
        'ハワイアン創作料理のカフェダイナー。ステンドグラス調のおしゃれな店内でゆったりソファ席があり、子連れでもくつろげる。パンケーキ食べ放題のメニューが人気。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'café+kitchen 北風と太陽',
      genre: 'cafe',
      area: '本川越駅から徒歩7分',
      description:
        '川越育ちの店主が実家のクリーニング店をリノベした隠れ家カフェ。看板のタコライスやランチプレートが楽しめる。カウンター3席と4名席3卓のみで席間隔も保たれ、子連れも気軽に利用できる。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
    {
      name: 'カフェ マチルダ',
      genre: 'cafe',
      area: '本川越駅から徒歩3分',
      description:
        '朝から夜まで楽しめるパンケーキ専門店。ドリンク付きのお子さん向けパンケーキセットがあり、ベビーカー入店もOK。観光途中の家族の休憩に使いやすい川越の人気カフェ。',
      strollerOk: true,
      kidsMenu: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
      popular: true,
    },
    {
      name: 'Brighton cafe 本店（ブライトンカフェ）',
      genre: 'italian',
      area: '川越駅から徒歩圏',
      description:
        '生パスタと自然派ワインのイタリアンカフェ。テーブル席が広々していて子連れでもゆったりカフェタイムが過ごせる。ベビーカー入店OKで観光ファミリーの利用も多い。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 所沢駅（所沢市）
  // ===========================================================
  'tokorozawa': [
    {
      name: '和亭 武',
      genre: 'washoku',
      area: '狭山ヶ丘駅近く（所沢エリア）',
      description:
        '懐石料理を子連れでも楽しめる和食店。2名から利用できる個室があり、座敷個室にはキッズスペースとおもちゃを完備。お祝い・記念日の家族ランチに向く落ち着いた空間。',
      privateRoom: true,
      kidsSpace: true,
      seatingType: ['zashiki'],
      diaperChangingTable: true,
      kidsChair: true,
      priceLunch: '〜3,500円',
    },
    {
      name: 'エミテラス所沢 ファミリーダイニング',
      genre: 'others',
      area: '所沢駅東口直結（エミテラス所沢）',
      description:
        '2024年開業の駅直結商業施設内のレストランフロア。広い通路でベビーカーで回遊でき、館内に授乳室・キッズトイレを完備。家族の休日ランチや雨の日の食事に便利。',
      strollerOk: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 春日部駅（春日部市）
  // ===========================================================
  'kasukabe': [
    // ▼ 2026-08-12追加: ララガーデン春日部の公式ショップガイド
    //   （mitsui-shopping-park.com/lalag-kasukabe/shopguide/?category=g00）から、
    //   フロア／カテゴリを転記した。春日部駅から徒歩4分、飲食は3Fに集まる。
    //   公式に予算・席数の掲載が無いため priceLunch は入れていない。
    //   スターバックス・マクドナルド・ミスタードーナツはチェーン側で出るため除外。
    //   物販（おかしのまちおか・カルディ・ヤオコー等）はイートインではないので除外。
    {
      name: 'Italian Kitchen VANSAN ララガーデン春日部店',
      genre: 'italian',
      area: '春日部駅から徒歩4分（ララガーデン春日部 3F）',
      description:
        'パスタ・ピッツァのイタリアン。ピッツァは家族でシェアしやすい。飲食フロアの3Fにあり、館内の営業は11:00〜22:00。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '万豚記（ワンツーチィ）ララガーデン春日部店',
      genre: 'chinese',
      area: '春日部駅から徒歩4分（ララガーデン春日部 3F）',
      description:
        '中華料理店。麺・飯ものがあり取り分けやすい。担担麺は辛さの調整可否を来店時に確認したい。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '本格インド料理 マンディル ララガーデン春日部店',
      genre: 'curry',
      area: '春日部駅から徒歩4分（ララガーデン春日部 3F）',
      description:
        'インド料理の店。ナンやカレーは取り分けやすい。辛さの調整可否は来店時に確認を。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '韓美膳 ララガーデン春日部店',
      genre: 'korean',
      area: '春日部駅から徒歩4分（ララガーデン春日部 3F）',
      description:
        '韓国料理の店。石焼ビビンバなど辛さを抜いた取り分けがしやすい定番メニューがそろう。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '富金豚（とみきんとん）ララガーデン春日部店',
      genre: 'tonkatsu',
      area: '春日部駅から徒歩4分（ララガーデン春日部 3F）',
      description:
        '豚肉料理の店。定食形式ならご飯と汁物を子どもに分けやすい。3Fの飲食フロアにある。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '焼肉 おもに亭 ララガーデン春日部店',
      genre: 'yakiniku',
      area: '春日部駅から徒歩4分（ララガーデン春日部 3F）',
      description:
        '焼肉店。焼く席なので低年齢の子は席の位置に注意。ランチの定食なら取り分けやすい。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'ポムズファーム ララガーデン春日部店',
      genre: 'yoshoku',
      area: '春日部駅から徒歩4分（ララガーデン春日部 3F）',
      description:
        'オムライスの洋食店。卵料理中心で小さい子でも食べやすい。3Fの飲食フロアにある。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'イル・カンパネッロ',
      genre: 'italian',
      area: '春日部駅から徒歩10分',
      description:
        '住宅街の中にある明るくおしゃれなイタリアン。前菜・パン・パスタ・ドリンク・デザート付きのランチが1,680円〜。ベビーカー入店可で、駐車場10台分完備で車での家族利用にも便利。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'イタリア食堂 テラマーテル',
      genre: 'italian',
      area: '春日部駅から徒歩8分',
      description:
        'パスタ・ピッツァが10種類以上から選べるイタリア食堂。ベビーカー入店OK、おむつ替えシート完備で乳児連れでも安心。地元のファミリーに親しまれる一軒。',
      strollerOk: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 越谷駅（越谷市）
  // ===========================================================
  'koshigaya': [
    // ▼ 2026-08-12追加: エキア越谷の公式サイト（tobu-equia.com/koshigaya/）から、
    //   フロア／販売品目を転記した。越谷駅直結。
    //   マクドナルド・スターバックス・吉野家・はなまるうどんはチェーン側で出るため除外。
    //   公式に席数・予算の掲載が無いため priceLunch は入れていない。
    {
      name: 'しんぱち食堂 エキア越谷店',
      genre: 'washoku',
      area: '越谷駅直結（エキア越谷 1F）',
      description:
        '焼き魚の定食店。ご飯と汁物が付く形式で、白飯と焼き魚を子どもに分けやすい。',
      seatingType: ['table', 'counter'],
      shareDish: true,
    },
    {
      name: '元祖油堂 エキア越谷店',
      genre: 'noodles',
      area: '越谷駅直結（エキア越谷 1F）',
      description:
        '油そばの店。スープが無いぶん熱さの心配が少なく、麺は短く切って分けやすい。',
      seatingType: ['counter', 'table'],
      shareDish: true,
    },
    {
      name: '梅林堂 エキア越谷店',
      genre: 'sweets',
      area: '越谷駅直結（エキア越谷 1F）',
      description:
        '和菓子の店。大福・団子・プリンなど、食事が進まない子でも食べられるものを買って移動できる。',
      shareDish: true,
    },
    {
      name: 'Cafe & Dining ARISTAR（アリスター）',
      genre: 'cafe',
      area: '越谷駅から徒歩1分',
      description:
        '駅近のキッズスペース付きカフェダイニング。遊び道具が揃ったキッズスペースで子どもを遊ばせながら、ワンプレートランチを楽しめる。日替わりスープ付きでママ会利用が多い。',
      kidsSpace: true,
      kidsChair: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'CAFE803（カフェ ハチマルサン）',
      genre: 'cafe',
      area: '越谷市旧日光街道沿い（越谷駅エリア）',
      description:
        '落ち着いた一軒家カフェ。ボードゲームや絵本が用意され、子どもも楽しめる。おむつ替え台付きトイレと全席終日禁煙で乳幼児連れに安心。駐車場あり。',
      diaperChangingTable: true,
      kidsSpace: true,
      seatingType: ['table'],
      kidsChair: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 越谷レイクタウン駅（越谷市・イオンレイクタウン最寄り）
  //
  // 【一次情報の取得日と出典 — 2026-08-10】
  //  - イオンレイクタウンkaze 公式ショップリスト（全214件）および各店舗詳細ページ
  //      https://laketownkaze-aeonmall.com/shop/lists/ （page:1〜5）
  //      https://laketownkaze-aeonmall.com/shop/detail/<id>
  //    → 「キッズメニューあり」「ベビーシートあり」「席数」「営業時間」は
  //      この公式ページに明記されている表記をそのまま採用している。
  //  - イオンレイクタウンmori 公式ショップリスト（全305件）／各店舗詳細ページ／子育て応援ぺーじ
  //      https://www.aeon-laketown.jp/mori/shop/
  //      https://www.aeon-laketown.jp/mori/shop/store/food-foo_<id>.html
  //      https://www.aeon-laketown.jp/mori/special/child-care-support/
  //  - カフェバナーノ（運営＝ポラス）公式 https://www.polus.co.jp/caffe-banano/
  //
  // 【方針】
  //  - 掲載は上記公式テナント一覧に**現に載っている店のみ**。
  //    2026-08-10 の確認で kaze 公式一覧に存在しなかった「さんるーむ レイクタウン店」は削除した
  //    （3F DINING TERRACE は [350]〜[367] まで全区画を確認し、該当なし）。
  //  - kidsMenu / kidsChair は公式表記がある店だけ true。推測で埋めない。
  //  - ベビーカー入店可否・授乳室・おむつ替え・離乳食持込は、mori・kaze 両公式の
  //    店舗ページに記載がないため **どの店にも設定しない**（館の設備を店の設備として
  //    書かない）。館単位の確認済み事実は lib/station-overrides.ts に分離した。
  //  - priceLunch は公式に金額の記載がある店だけ設定する。
  //  - 筆者は現地を訪問していない。体験としての記述は一切書かない。
  // ===========================================================
  'koshigaya-laketown': [
    // ---- イオンレイクタウン kaze / 3F DINING TERRACE ----
    {
      name: 'クア・アイナ イオンレイクタウンkaze店',
      genre: 'yoshoku',
      area: '越谷レイクタウン駅直結（kaze 3F [351] DINING TERRACE）',
      description:
        'ハワイ発のグルメハンバーガー店。kaze公式の店舗情報に「キッズメニューあり」「ベビーシートあり」と明記。席数103席。平日11:00〜22:00、土日祝は10:30開店。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
    },
    {
      name: '洋麺屋五右衛門 イオンレイクタウンkaze店',
      genre: 'italian',
      area: '越谷レイクタウン駅直結（kaze 3F [362] DINING TERRACE）',
      description:
        '箸で食べるスパゲッティーの専門店。kaze公式の店舗情報に「キッズメニューあり」「ベビーシートあり」と明記。席数45席、11:00〜22:00（L.O.21:00）。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
    },
    {
      name: 'エッグエッグキッチン イオンレイクタウンkaze店',
      genre: 'yoshoku',
      area: '越谷レイクタウン駅直結（kaze 3F [356] DINING TERRACE）',
      description:
        'オムライスとパスタの洋食店。kaze公式の店舗情報に「キッズメニューあり」「ベビーシートあり」と明記。88席と広く、土日祝は10:30から開いている。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
    },
    {
      name: '和食飛賀屋 イオンレイクタウンkaze店',
      genre: 'washoku',
      area: '越谷レイクタウン駅直結（kaze 3F [367] DINING TERRACE）',
      description:
        '定食・御膳が中心の和食店。kaze公式の店舗情報に「キッズメニューあり」「ベビーシートあり」、全席禁煙と明記。席数86席。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
    },
    {
      name: 'ビューティーチャイニーズ 中国料理 謝朋殿 イオンレイクタウンkaze店',
      genre: 'chinese',
      area: '越谷レイクタウン駅直結（kaze 3F [363] DINING TERRACE）',
      description:
        '点心と一品料理をそろえる中国料理店。kaze公式の店舗情報に「キッズメニューあり」「ベビーシートあり」、全席禁煙と明記。席数70席。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
    },
    {
      name: '炭焼ステーキくに イオンレイクタウンkaze店',
      genre: 'yoshoku',
      area: '越谷レイクタウン駅直結（kaze 3F [350] DINING TERRACE）',
      description:
        '炭焼きステーキの専門店。kaze公式の店舗情報に「キッズメニューあり」「ベビーシートあり」「ランチメニューあり」と明記。席数115席とフロア最大級。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
    },
    {
      name: 'ザ・ブッフェ ニューマーケット イオンレイクタウンkaze店',
      genre: 'others',
      area: '越谷レイクタウン駅直結（kaze 3F [353] DINING TERRACE）',
      description:
        '好きな料理を取り分けて食べられるブッフェレストラン。kaze公式の店舗情報に「キッズメニューあり」「予約可能」と明記。席数130席。',
      kidsMenu: true,
      shareDish: true,
      seatingType: ['table'],
    },
    {
      name: '利久食堂 イオンレイクタウンkaze店',
      genre: 'washoku',
      area: '越谷レイクタウン駅直結（kaze 3F [352] DINING TERRACE）',
      description:
        '牛たんを中心にした定食の店。kaze公式の店舗情報に「キッズメニューあり」「テイクアウト可能」、全席禁煙と明記。席数90席。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: '鶏五味 イオンレイクタウンkaze店',
      genre: 'washoku',
      area: '越谷レイクタウン駅直結（kaze 3F [357] DINING TERRACE）',
      description:
        '鶏料理の専門店。kaze公式の店舗情報に「キッズメニューあり」、全席禁煙と明記。席数36席とフロア内では小ぶりなので、混む時間帯を外すと入りやすい。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: '日暮里食肉問屋 焼肉おもに亭 イオンレイクタウンkaze店',
      genre: 'yakiniku',
      area: '越谷レイクタウン駅直結（kaze 3F [366] DINING TERRACE）',
      description:
        '問屋直営の焼肉店。kaze公式の店舗情報に「キッズメニューあり」、全席禁煙と明記。席数98席。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: 'しゃぶしゃぶ宮崎霧峰 イオンレイクタウンkaze店',
      genre: 'shabu',
      area: '越谷レイクタウン駅直結（kaze 3F [365] DINING TERRACE）',
      description:
        'しゃぶしゃぶ・すき焼き・鍋の店。kaze公式の店舗情報に「ベビーシートあり」「予約可能」「ランチメニューあり」と明記。席数64席。',
      kidsChair: true,
      shareDish: true,
      seatingType: ['table'],
    },
    {
      name: 'パントリエ イオンレイクタウンkaze店',
      genre: 'yoshoku',
      area: '越谷レイクタウン駅直結（kaze 3F [354] DINING TERRACE）',
      description:
        '焼き立てパン食べ放題が付く洋食レストラン。席数94席。埼玉県パパ・ママ応援ショップ優待カードの提示で、料理を注文するとお土産パン1袋のサービスがある。',
      seatingType: ['table'],
    },
    // ---- イオンレイクタウン kaze / 2F CAFE PLAZA ほか ----
    {
      name: 'アフタヌーンティー・ティールーム イオンレイクタウンkaze店',
      genre: 'cafe',
      area: '越谷レイクタウン駅直結（kaze 2F [277] CAFE PLAZA）',
      description:
        '紅茶と軽食のティールーム。kaze公式の店舗情報に「キッズメニューあり」、全席禁煙と明記。席数66席、10:00〜21:00と開店が早い。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: 'ハンドベイクス イオンレイクタウンkaze店',
      genre: 'cafe',
      area: '越谷レイクタウン駅直結（kaze 2F [201]）',
      description:
        '焼き菓子とドリンクのカフェ。kaze公式の店舗情報に「キッズメニューあり」、全席禁煙と明記。席数72席。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: 'メゾン・イチ プリュス イオンレイクタウンkaze店',
      genre: 'bakery',
      area: '越谷レイクタウン駅直結（kaze 2F [290]）',
      description:
        'ベーカリー併設のカフェ。kaze公式の店舗情報に「キッズメニューあり」、全席禁煙と明記。席数65席。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    // ---- イオンレイクタウン kaze / 1F GOURMET SQUARE（フードコート） ----
    {
      name: 'つじ田 イオンレイクタウンkaze店',
      genre: 'noodles',
      area: '越谷レイクタウン駅直結（kaze 1F [157] GOURMET SQUARE）',
      description:
        'つけ麺・ラーメンの店。kaze公式の店舗情報に「キッズメニューあり」と明記。フードコート内なので席の移動がしやすい。',
      kidsMenu: true,
    },
    {
      name: '羽釜ごはん 穂のか イオンレイクタウンkaze店',
      genre: 'washoku',
      area: '越谷レイクタウン駅直結（kaze 1F [164] GOURMET SQUARE）',
      description:
        '羽釜で炊いたごはんが売りの和食店。kaze公式の店舗情報に「キッズメニューあり」、禁煙と明記。10:00〜21:00（L.O.20:30）。',
      kidsMenu: true,
    },
    {
      name: 'どうとんぼり神座 イオンレイクタウンkaze店',
      genre: 'noodles',
      area: '越谷レイクタウン駅直結（kaze 1F [163] GOURMET SQUARE）',
      description:
        '2026年7月30日オープン。kaze公式は看板の「おいしいラーメン」を、子どもから年配の人まで食べられるやさしいスープと説明している。10:00〜21:00（L.O.20:30）。',
    },
    // ---- イオンレイクタウン mori ----
    // mori は公式に「キッズメニュー取り扱いショップ」の一覧ページを持っており、
    // 店名・フロア・商品名・税込価格まで載っている（57店61品／税込250円〜1,200円）。
    //   https://www.aeon-laketown.jp/mori/special/child-care-support/kids-menu.html
    // 以下の「税込◯円」はすべてこの公式一覧の表記そのまま（2026-08-10取得）。
    // 公式ページ自身が「メニュー内容・金額等が変更になる場合がございます」と注記している。
    {
      name: '横濱元町ドリア イオンレイクタウンmori店',
      genre: 'yoshoku',
      area: '越谷レイクタウン駅直結（mori 1F [1061]）',
      description:
        '30種類以上のドリア・グラタンの専門店。2026年5月18日オープン。mori公式の子育て応援ぺーじに「お子さまメニューやドリンクバーもある」と記載（開店が新しく、公式のキッズメニュー価格一覧にはまだ載っていない）。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: 'ピアサピド イオンレイクタウンmori店',
      genre: 'italian',
      area: '越谷レイクタウン駅直結（mori 1F [1102]）',
      description:
        '30種類以上のパンが食べ放題のベーカリーレストラン。公式のキッズメニュー一覧に「Kidsグラタン 税込858円」。店舗ページにも「お子さまメニューもございますので、お子さま連れでもどうぞご利用下さい」とある。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: 'ロテルドビュッフェ イオンレイクタウンmori店',
      genre: 'others',
      area: '越谷レイクタウン駅直結（mori 1F [1069]）',
      description:
        '洋食・和食・中華・デザートを取り分けて食べるビュッフェレストラン。公式のキッズメニュー一覧では、お子さま料金がドリンクバー付き税込548円と最安の部類。',
      kidsMenu: true,
      shareDish: true,
      seatingType: ['table'],
    },
    {
      name: '花粥 HANAKAYU イオンレイクタウンmori店',
      genre: 'chinese',
      area: '越谷レイクタウン駅直結（mori 1F [1076]）',
      description:
        '台湾粥と点心の店。公式のキッズメニュー一覧に「おこさまワンタン麺セット 税込858円」。営業時間は平日10:00〜22:00、土日祝11:00〜22:00（L.O.21:00）。',
      kidsMenu: true,
      shareDish: true,
      seatingType: ['table'],
    },
    {
      name: 'びっくりドンキーポケットキッチン イオンレイクタウンmori店',
      genre: 'yoshoku',
      area: '越谷レイクタウン駅直結（mori 3F [3079] フードコート）',
      description:
        'びっくりドンキーのフードコート業態。公式のキッズメニュー一覧に「ミニマムレギュラーバーグディッシュ 税込670円」。店舗ページの平均予算はランチ850円。',
      kidsMenu: true,
      priceLunch: '〜1,000円',
    },
    {
      name: 'いしがまやハンバーグ イオンレイクタウンmori店',
      genre: 'yoshoku',
      area: '越谷レイクタウン駅直結（mori 1F [1079]）',
      description:
        '専用の石窯で焼くハンバーグステーキの専門店。公式のキッズメニュー一覧に「キッズセット 税込869円」（ミニハンバーグ・ごはん・サラダ・ジュース・ゼリー・おもちゃ付）。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: '一汁五穀 イオンレイクタウンmori店',
      genre: 'washoku',
      area: '越谷レイクタウン駅直結（mori 1F [1074]）',
      description:
        'かまど炊きの五穀米と味噌汁の定食店。公式のキッズメニュー一覧に「お子さま和風ランチ 税込869円」。魚と肉が両方入る構成と説明されている。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: 'オムライスの店 卵と私 イオンレイクタウンmori店',
      genre: 'yoshoku',
      area: '越谷レイクタウン駅直結（mori 1F [1073]）',
      description:
        'オムライス専門の洋食店。公式のキッズメニュー一覧では「お子さまオムライス 税込300円」で、mori のレストラン街では最安クラス。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: 'とんかつまい泉 イオンレイクタウンmori店',
      genre: 'tonkatsu',
      area: '越谷レイクタウン駅直結（mori 1F [1066]）',
      description:
        '東京・青山発のとんかつ専門店。公式のキッズメニュー一覧に「お子さまランチ 税込1,000円」。お膳と丼の両方から選べる。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: '牛たん炭焼 利久 イオンレイクタウンmori店',
      genre: 'washoku',
      area: '越谷レイクタウン駅直結（mori 1F [1068]）',
      description:
        '牛たん炭焼きの専門店。公式のキッズメニュー一覧には「お子さまカレーセット」「お子さまらーめんセット」の2種が載り、いずれも税込1,012円。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: '北海道キッチン ヨシミ イオンレイクタウンmori店',
      genre: 'yoshoku',
      area: '越谷レイクタウン駅直結（mori 1F [1070]）',
      description:
        '北海道の食材を使う洋食レストラン。公式のキッズメニュー一覧に「お子さまオムライスプレート」「お子さまカレープレート」がいずれも税込980円で載っている。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: '鎌倉パスタ イオンレイクタウンmori店',
      genre: 'italian',
      area: '越谷レイクタウン駅直結（mori 1F [1101]）',
      description:
        '生パスタの専門店。公式のキッズメニュー一覧に「ベーコンのカルボナーラ 税込429円」。焼きたてのバジルロールも名物。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: 'パステル イオンレイクタウンmori店',
      genre: 'italian',
      area: '越谷レイクタウン駅直結（mori 1F [1082]）',
      description:
        'パスタと手作りプリンの店。公式のキッズメニュー一覧に「お子さまスパゲティとフライドチキン 税込583円」。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: '蕎麦 いまゐ イオンレイクタウンmori店',
      genre: 'noodles',
      area: '越谷レイクタウン駅直結（mori 1F [1063]）',
      description:
        'うどんとそばの店。公式のキッズメニュー一覧では「キッズセット 税込350円」と、mori のレストラン街でもっとも安い部類。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: '山下本気うどん イオンレイクタウンmori店',
      genre: 'noodles',
      area: '越谷レイクタウン駅直結（mori 1F [1104]）',
      description:
        '店内製麺の讃岐うどん店。公式のキッズメニュー一覧に「お子さまセット 税込590円」。土日祝は10:30から開いている。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: '焼肉平城苑 イオンレイクタウンmori店',
      genre: 'yakiniku',
      area: '越谷レイクタウン駅直結（mori 1F [1100]）',
      description:
        '焼肉店。公式のキッズメニュー一覧に「お子さまクッパ」「お子さまうどん」がいずれも税込385円で載っており、焼肉が食べられない年齢の子でも一品頼める。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: '一蘭 イオンレイクタウンmori店',
      genre: 'noodles',
      area: '越谷レイクタウン駅直結（mori 1F [1106]）',
      description:
        'とんこつラーメン専門店。公式のキッズメニュー一覧では「お子さまラーメン 税込0円」で、一蘭アプリの会員なら大人1名につき小学生以下5名まで対応と明記（引換券画面の提示が必要）。',
      kidsMenu: true,
      seatingType: ['counter'],
    },
    {
      name: '一風堂 イオンレイクタウンmori店',
      genre: 'noodles',
      area: '越谷レイクタウン駅直結（mori 3F [3069]）',
      description:
        'とんこつラーメン店。公式のキッズメニュー一覧に「お子さまラーメンセット 税込690円」（お子さまラーメン＋ドリンクS＋お菓子セット）。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: '小木曽製粉所 イオンレイクタウンmori店',
      genre: 'noodles',
      area: '越谷レイクタウン駅直結（mori 3F [3067]）',
      description:
        '自社製粉のそば店。公式のキッズメニュー一覧に「お子さまカレー 税込490円」。目の前でそばを茹でて出す形式。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: '丸亀製麺 イオンレイクタウンmori店',
      genre: 'noodles',
      area: '越谷レイクタウン駅直結（mori 3F [3080]）',
      description:
        'セルフ形式の讃岐うどん店。公式のキッズメニュー一覧では「お子さまもちもちセット 税込290円」で、61品の中でも最安クラス。',
      kidsMenu: true,
    },
    {
      name: 'リンガーハット イオンレイクタウンmori店',
      genre: 'noodles',
      area: '越谷レイクタウン駅直結（mori 3F [3063C]）',
      description:
        '長崎ちゃんぽんの専門店。公式のキッズメニュー一覧に「ちびっこちゃんぽん」「ちびっこ皿うどん」「ちびっこチャーハン」の3セットが載り、いずれも税込590円。',
      kidsMenu: true,
    },
    {
      name: 'モスバーガー イオンレイクタウンmori店',
      genre: 'yoshoku',
      area: '越谷レイクタウン駅直結（mori 3F [3073]）',
      description:
        'ハンバーガー店。公式のキッズメニュー一覧に「ワイワイバーガーセット 税込540円」。',
      kidsMenu: true,
    },
    {
      name: 'サンマルクカフェ イオンレイクタウンmori店',
      genre: 'cafe',
      area: '越谷レイクタウン駅直結（mori 2F [2047B]）',
      description:
        '焼きたてパンと1杯だてコーヒーのカフェ。公式のキッズメニュー一覧に「キッズセット 税込470円」。買い物の途中で休憩を挟みたいときに使える。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    // ---- レイクタウンアウトレット（3館目・別ドメインの公式サイト） ----
    // laketown-outlet.jp「キッズお取り扱いショップ」でキッズ対応が明記されている飲食2店。
    // kaze/mori の公式テナント一覧を辿っても到達しないため、前回の調査から漏れていた。
    {
      name: 'シルバニア 森のキッチン レイクタウンアウトレット店',
      genre: 'cafe',
      area: '越谷レイクタウン駅前（レイクタウンアウトレット 1st Ave. 2F [1217]）',
      description:
        'アウトレット公式の「キッズお取り扱いショップ」に、メニューとして「ショコラウサギの女の子 フレアのぱくぱくカレー」ほかを掲載し、デザート・離乳食を含むと明記。アレルギー対応メニューありとも公式に記載されている。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    {
      name: 'バーガーキング レイクタウンアウトレット店',
      genre: 'yoshoku',
      area: '越谷レイクタウン駅前（レイクタウンアウトレット 3rd Ave. 2F [3229]）',
      description:
        'アウトレット公式の「キッズお取り扱いショップ」に「キッズメニュー3種類」と掲載されている。アウトレットは屋外通り型で、mori・kazeのカートは持ち込めないため自前のベビーカーで回ることになる。',
      kidsMenu: true,
      seatingType: ['table'],
    },
    // ---- 駅前（モール外） ----
    {
      name: 'カフェバナーノ 越谷レイクタウン駅前店',
      genre: 'cafe',
      area: '越谷レイクタウン駅ロータリー内',
      description:
        '運営元のポラス公式サイトが「ママがゆっくり過ごせるカフェ」として案内する駅前のカフェ。モールに入る前後に立ち寄れる位置にある。',
      seatingType: ['table'],
    },
  ],

  // ===========================================================
  // 武蔵浦和駅（さいたま市南区）
  // ===========================================================
  'musashi-urawa': [
    {
      name: '58カフェとレストラン ティカル',
      genre: 'cafe',
      area: '武蔵浦和駅から徒歩圏',
      description:
        'キッズスペース付きのカフェ＆レストラン。子どもが遊ぶ様子を眺めながらゆっくりランチが楽しめる構成で、武蔵浦和エリアのママ会の定番店。',
      kidsSpace: true,
      kidsChair: true,
      seatingType: ['table'],
      diaperChangingTable: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'マーレ ベジファーストカフェ 武蔵浦和店',
      genre: 'cafe',
      area: '武蔵浦和駅直結（マーレ武蔵浦和）',
      description:
        '駅直結のショッピング施設マーレ内の野菜が摂れるカフェ。ベビーカーのまま入店でき、館内に授乳室・おむつ替え台があり、乳児連れランチに使いやすい。',
      strollerOk: true,
      nursingRoom: true,
      diaperChangingTable: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '武蔵浦和ロッテシティホテル 1Fカフェレストラン',
      genre: 'yoshoku',
      area: '武蔵浦和駅西口直結',
      description:
        '駅直結のシティホテル内レストラン。ゆとりあるテーブル間隔でベビーカー横付けOK、ホテル内に授乳室・おむつ替え台あり。家族のお祝いランチにも向く。',
      strollerOk: true,
      nursingRoom: true,
      diaperChangingTable: true,
      kidsChair: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 北浦和駅（さいたま市浦和区）
  // ===========================================================
  'kita-urawa': [
    {
      name: 'ペペロネ（埼玉県立近代美術館内）',
      genre: 'italian',
      area: '北浦和駅から徒歩3分（埼玉県立近代美術館 1F）',
      description:
        '美術館併設のイタリアン＆フレンチのカフェレストラン。新鮮野菜を使ったランチを提供し、ソファ席あり・ベビーカー入店OK。北浦和公園を散歩したあとの家族ランチに最適。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '韓美食 オンギージョンギー',
      genre: 'korean',
      area: '北浦和駅東口から徒歩4分',
      description:
        'おしゃれなカフェ風の店内でコリアンランチが楽しめる店。椅子の下に荷物入れがあり、パーテーション付きカウンターなど細やかな配慮があるので子連れでも落ち着ける。',
      seatingType: ['table', 'counter'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'カフェ・ド・シュクレ',
      genre: 'cafe',
      area: '北浦和駅すぐ（ビル2F）',
      description:
        '駅すぐのビル2階にある小さな個人カフェ。落ち着いた雰囲気で、ランチタイムにはキッシュ・ドリア・焼きカレー・パスタなど家庭的な洋食メニューが楽しめる。',
      seatingType: ['table'],
      stepFree: false,
      priceLunch: '〜2,000円',
    },
    {
      name: '越コーヒー店（こしコーヒーてん）',
      genre: 'cafe',
      area: '北浦和駅から徒歩圏',
      description:
        '1973年創業の自家焙煎コーヒー老舗。厚切りトーストなど豊富なランチ・モーニングメニューが揃い、朝7時から営業。子連れの早めの朝食〜ブランチに便利。',
      seatingType: ['table'],
      priceLunch: '〜1,000円',
    },
  ],

  // ===========================================================
  // 朝霞駅（朝霞市）
  // ===========================================================
  'asaka': [
    // ▼ 2026-08-12追加: エキア朝霞の公式サイト（tobu-equia.com/asaka/）から、
    //   フロア／販売品目／席数を転記した。朝霞駅直結。
    //   中華食堂日高屋・星乃珈琲店はチェーン側で出るため除外。
    //   公式に予算の掲載が無いため priceLunch は入れていない。
    {
      name: 'バーガーキング エキア朝霞店',
      genre: 'yoshoku',
      area: '朝霞駅直結（エキア朝霞 1F）',
      description:
        'ハンバーガーの店。64席とエキア朝霞で最も広く、手で食べられるので子どもと分けやすい。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'らあめん花月嵐 エキア朝霞店',
      genre: 'noodles',
      area: '朝霞駅直結（エキア朝霞 1F）',
      description:
        'ラーメンの店。30席。麺は短く切って子どもに分けやすい。',
      seatingType: ['table', 'counter'],
      shareDish: true,
    },
    {
      name: 'TWO HEART エキア朝霞店',
      genre: 'bakery',
      area: '朝霞駅直結（エキア朝霞 2F）',
      description:
        'ベーカリー。23席のイートインがあり、パンを買って移動する使い方もできる。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '麺処 ガリレオ八兵衛 エキア朝霞店',
      genre: 'noodles',
      area: '朝霞駅直結（エキア朝霞 1F）',
      description:
        'そば・うどんの店。10席と非常に小さいので、ベビーカーでの入店可否は事前確認が安心。',
      seatingType: ['counter'],
    },
    {
      name: 'サーティワンアイスクリーム エキア朝霞店',
      genre: 'sweets',
      area: '朝霞駅直結（エキア朝霞 1F）',
      description:
        'アイスクリーム店。14席。食事が進まない子との休憩や、外食のあとのごほうびに使える。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'イタリアン＆カフェ すわん',
      genre: 'italian',
      area: '朝霞駅南口から徒歩5分',
      description:
        'ベビーカーをそのまま席まで運べる子連れ歓迎のイタリアン＆カフェ。ランチメニューが充実し、地元ママの定番ランチ会場。落ち着いた雰囲気で乳児連れも安心。',
      strollerOk: true,
      strollerToSeat: true,
      seatingType: ['table'],
      stepFree: true,
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'ボン・パストス',
      genre: 'italian',
      area: '朝霞駅すぐ',
      description:
        '自家製生パスタが楽しめるイタリアン。片側ソファタイプのテーブル席があり、子ども連れでも安心。お子様パスタ付きランチセットもあり、家族でシェアしながら食事できる。',
      kidsMenu: true,
      kidsChair: true,
      seatingType: ['table'],
      bringBabyFood: true,
      shareDish: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '朝霞 小上がり座敷カフェ（市公式紹介）',
      genre: 'cafe',
      area: '朝霞駅から徒歩4分',
      description:
        '小上がり座敷席を備えた朝霞市公認のキッズフレンドリーカフェ。おむつ替え・授乳スペースがあり、焼きたてキッシュ・ミニデザート・KIDSプレートを提供。',
      kidsMenu: true,
      diaperChangingTable: true,
      nursingRoom: true,
      seatingType: ['zashiki', 'table'],
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
  ],

  // ===========================================================
  // 和光市駅（和光市）
  // ===========================================================
  'wako-shi': [
    // ▼ 2026-08-12追加: エキア プレミエ 和光の公式サイト（tobu-equia.com/wako/）から、
    //   フロア・区画／販売品目／席数／予算を転記した。和光市駅直結。
    //   飲食は3F「PREMIE DINING」に集まり、全店 11:00〜23:00 営業。
    //   スターバックスはチェーン側で出るため除外。
    //   ※以前この駅は2020年の開業プレスリリースしか見つからず保留にしていたが、
    //     公式サイトのドメインが tobu-equia.com だと判明して現行のテナントを取得できた。
    {
      name: '築地食堂源ちゃん エキア プレミエ 和光店',
      genre: 'washoku',
      area: '和光市駅直結（エキア プレミエ 和光 3F PREMIE DINING）',
      description:
        '海鮮と和食の定食店。ご飯と汁物が付く定食形式で子どもへの取り分けがしやすい。76席と3Fでは広い部類。公式のランチ予算は900〜1,200円とフロア最安。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'すし松 エキア プレミエ 和光店',
      genre: 'sushi',
      area: '和光市駅直結（エキア プレミエ 和光 3F PREMIE DINING）',
      description:
        '寿司の店。玉子やかっぱ巻きなど子どもが食べられるネタを単品で頼める。49席。公式のランチ予算は600〜1,200円。',
      seatingType: ['table', 'counter'],
      priceLunch: '〜2,000円',
    },
    {
      name: '北海道イタリアン MiaBocca エキア プレミエ 和光店',
      genre: 'italian',
      area: '和光市駅直結（エキア プレミエ 和光 3F PREMIE DINING）',
      description:
        'パスタ・ピッツァのイタリアン。84席と3Fで最も広く、ピッツァは家族でシェアしやすい。公式のランチ予算は1,000〜1,500円。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '紅虎餃子房 エキア プレミエ 和光店',
      genre: 'chinese',
      area: '和光市駅直結（エキア プレミエ 和光 3F PREMIE DINING）',
      description:
        '点心・麺・飯ものの中国料理店。餃子やチャーハンは取り分けやすい。46席。公式のランチ予算は1,000〜1,500円。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'さち福やCAFÉ エキア プレミエ 和光店',
      genre: 'washoku',
      area: '和光市駅直結（エキア プレミエ 和光 3F PREMIE DINING）',
      description:
        '和定食の店。ご飯と汁物が付く形式で白飯を子どもに分けやすい。70席。公式に予算の掲載が無いため要確認。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '駅ビル バルーチョ エキア プレミエ 和光店',
      genre: 'italian',
      area: '和光市駅直結（エキア プレミエ 和光 3F PREMIE DINING）',
      description:
        '創作料理とパスタの店。34席と3Fでは小ぶりなので混雑時間は避けたい。公式のランチ予算は1,000〜1,500円。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '焼肉・韓国料理KollaBo エキア プレミエ 和光店',
      genre: 'korean',
      area: '和光市駅直結（エキア プレミエ 和光 3F PREMIE DINING）',
      description:
        '焼肉と韓国料理の店。石焼ビビンバなど辛さを抜いた取り分けがしやすいメニューもある。60席。焼く席は低年齢の子の位置に注意。公式のランチ予算は1,000〜1,500円。',
      seatingType: ['table'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'R Baker エキア プレミエ 和光店',
      genre: 'bakery',
      area: '和光市駅直結（エキア プレミエ 和光 1F）',
      description:
        'ベーカリーカフェ。1Fにあり、パンを買って移動する使い方もできる。子どもが食べられる分だけ選べる。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'とんかつ新宿さぼてん エキア プレミエ 和光店',
      genre: 'tonkatsu',
      area: '和光市駅直結（エキア プレミエ 和光 B1F）',
      description:
        'とんかつの惣菜・弁当店。かつサンドなど子どもが手で食べられるものがあり、持ち帰って公園で食べる使い方もできる。10:00〜22:00。',
      shareDish: true,
    },
    {
      name: 'Wine食堂 honu cafe（ホヌ カフェ）',
      genre: 'cafe',
      area: '和光市駅から徒歩1分',
      description:
        '駅徒歩1分の好立地カフェダイニング。落ち着いた雰囲気でランチセットを楽しめ、ベビーカーアクセスもしやすい。家族の昼食やママ会に向く。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'T-PARK CAFE（ティーパークカフェ）',
      genre: 'cafe',
      area: '和光市駅から徒歩圏',
      description:
        '公園コンセプトの明るくポップなカフェ。キッズスペースとテラス席を備え、和コモコ・ナポリタン・釜揚げうどんなどメニューが豊富。キッズメニューもあり子連れに最適。',
      kidsMenu: true,
      kidsSpace: true,
      seatingType: ['table', 'terrace'],
      diaperChangingTable: true,
      kidsChair: true,
      kidsCutlery: true,
      priceLunch: '〜2,000円',
    },
    {
      name: "Cafe's Kitchen ファーナウ",
      genre: 'yoshoku',
      area: '和光市駅から徒歩圏（和光市総合福祉会館近く）',
      description:
        '伊豆牛メンチや伊豆牛ハンバーグが看板の洋食カフェ。野菜たっぷりのキーマカレーやロコモコ丼もあり、ベビーカー入店・離乳食持ち込みOKで乳児連れに親切。',
      strollerOk: true,
      bringBabyFood: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: '千の庭 和光市南口店',
      genre: 'washoku',
      area: '和光市駅南口すぐ',
      description:
        '料亭のような落ち着いた個室で純和食が楽しめる和食店。松花堂弁当・天ぷら・そばの御膳など子どもにも取り分けやすいメニューが揃う。お祝いの家族ランチに向く。',
      privateRoom: true,
      shareDish: true,
      seatingType: ['zashiki', 'table'],
      priceLunch: '〜3,500円',
    },
  ],

  // ===========================================================
  // 志木駅（新座市）
  // ===========================================================
  'shiki': [
    // ▼ 2026-08-12追加: エキア志木の公式サイト（tobu-equia.com/shiki/）から、
    //   フロア／販売品目／席数を転記した。志木駅直結。
    //   吉野家・ケンタッキー・スターバックス・洋麺屋五右衛門はチェーン側で出るため除外。
    //   公式に「喫煙席あり」と表記のある店はその旨を本文に明記した。
    {
      name: '回転寿司 みさき エキア志木店',
      genre: 'sushi',
      area: '志木駅直結（エキア志木 1F）',
      description:
        '回転寿司。レーンから子どもが自分で選べるうえ、玉子やかっぱ巻きが必ずある。26席と小ぶりなので混雑時間は避けたい。',
      seatingType: ['table', 'counter'],
      shareDish: true,
    },
    {
      name: 'おぼんdeごはん エキア志木店',
      genre: 'washoku',
      area: '志木駅直結（エキア志木 2F）',
      description:
        'おぼんにのせる定食スタイルの店。おかずを選べるので子どもが食べられる組み合わせを作りやすい。46席。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'サロン 卵と私 エキア志木店',
      genre: 'yoshoku',
      area: '志木駅直結（エキア志木 2F）',
      description:
        'オムライスの専門店。卵料理中心で小さい子でも食べやすい。40席。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'ESPRESSO D WORKS エキア志木店',
      genre: 'cafe',
      area: '志木駅直結（エキア志木 2F）',
      description:
        'パンケーキとピザのカフェ。どちらも家族でシェアしやすい。52席と2Fでは広い部類。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '天ぷらとそば ツクシ エキア志木店',
      genre: 'noodles',
      area: '志木駅直結（エキア志木 2F）',
      description:
        'そばと天ぷらの店。そばは短く切って子どもに分けやすい。29席。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: 'しあわせのビーフカレー もう〜とりこ エキア志木店',
      genre: 'curry',
      area: '志木駅直結（エキア志木 2F）',
      description:
        'ビーフカレーの店。辛さの調整可否は来店時に確認を。18席と小ぶり。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '中華そば青葉 エキア志木店',
      genre: 'noodles',
      area: '志木駅直結（エキア志木 2F）',
      description:
        '中華そばの店。15席とエキア志木で最も小さいので、ベビーカーでの入店可否は事前確認が安心。',
      seatingType: ['counter', 'table'],
    },
    {
      name: 'サンジェルマン エキア志木店',
      genre: 'bakery',
      area: '志木駅直結（エキア志木 1F）',
      description:
        'ベーカリー。32席のイートインがあるが、公式に「喫煙席あり」と表記されているため、子連れなら席の位置を確認したい。',
      seatingType: ['table'],
      shareDish: true,
    },
    {
      name: '森の中のおひるねくまさん',
      genre: 'cafe',
      area: '志木駅南口から徒歩3分（ベルセゾン内）',
      description:
        '可愛らしい世界観で人気のカフェ。ぬいぐるみや絵本のあるくつろぎ空間で、ベビーカーでも入りやすい。スイーツ目当てのママ会・子連れカフェタイムに最適。',
      strollerOk: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'デスティーノ・ドゥエ（DESTINO DUE）',
      genre: 'italian',
      area: '志木駅南口から徒歩9分',
      description:
        'テラス席のあるイタリアン。他のお客さんに気を遣わずに食事ができ、子ども連れでも気軽に利用できる。カフェタイムは11〜18時で散歩途中の立ち寄りにも便利。',
      seatingType: ['table', 'terrace'],
      shareDish: true,
      priceLunch: '〜2,000円',
    },
    {
      name: 'FOOD HALL SHIKISM（フードホール シキズム）',
      genre: 'others',
      area: '志木駅東口から徒歩1分',
      description:
        '4店舗の専門店が集まるフードホール。共通の広いテーブル席でジャンルの違う料理をシェアでき、子どもの好み別に取り分けやすい。ベビーカー入店も対応。',
      strollerOk: true,
      shareDish: true,
      seatingType: ['table'],
      stepFree: true,
      strollerToSeat: true,
      priceLunch: '〜2,000円',
    },
  ],
};
