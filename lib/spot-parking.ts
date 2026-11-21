/**
 * スポットの駐車場を構造化して持つ。
 *
 * ── なぜ必要か ────────────────────────────────────────────
 * 2026-08-20 の横断監査で、駐車場の事実が**記事本文に複製されている**実害が出た:
 *  - 区別の水遊び記事19本が、同じ施設の駐車場について一字一句同じ記述を共有していた。
 *  - 舎人公園の駐車場は2本の記事に**別々の文言**で書かれていた（＝片方を直すともう片方が残る）。
 *  - 誤りが見つかっても直すたびに全複製を grep する必要があり、必ず取りこぼす
 *    （「昭和記念公園 ¥840/日」の古い料金が複数本に残っていたのが実例）。
 * さらに、腐るのは「あり/なし」よりも**時間と料金**だった:
 *  - 施設固有の断定154箇所のうち **132箇所（86%）に営業時間の記載がなかった**。
 *  - 確定した事実誤り5件のうち**3件が料金**。
 * 多摩の都立公園は 9:00〜17:00 で夜間閉鎖が標準なので、ライトアップ・花火・早朝を
 * 勧める記事と重なると、読者が車で行って現地で停められない。
 *
 * ── 設計（lib/spot-season.ts と同型）────────────────────────
 *  - 駐車場の事実は**ここだけ**に書く。記事本文・note・FAQ に台数や料金を直書きしない
 *    （表示はこのデータから生成する。段階3で記事側を差し替える）。
 *  - キーは lib/spots.ts の name と**完全一致**させること。spot-overrides で表示名を
 *    変えているスポットは表示名で引くと一致しない（lib/spots.ts の警告と同じ罠。
 *    2026-08-19 に実際に踏まれている）。マージは**読込時**に spots.ts 側で行い、
 *    描画時に name で引かない。
 *  - `exists: 'unknown'` を型として持つ。**これが無いと書き手は必ず「あり」に倒す。**
 *    実際 2026-08-20 に王子公園（神戸）で「神戸市・公園緑化協会・王子動物園のいずれの
 *    公式でも記載を確認できなかった」状態が発生している。「確認できていない」は
 *    「ある」でも「ない」でもない、独立した状態として持つ。
 *  - hours / fee は**確認できたものだけ**書く。曖昧なら空にして confirmedAt を据え置き、
 *    scripts/check-parking-freshness.mjs に拾わせる（推測で埋めない）。
 *
 * ── 出典の扱い ─────────────────────────────────────────
 * sourceUrl には一次情報（施設公式・自治体公式）のURLを、confirmedAt には
 * **実際にその生HTMLを確認した日**を書く。自分が見ていないものを見たことにしない。
 */

export type SpotParking = {
  /**
   * 駐車場の有無。
   * - true      … 公式に駐車場の存在を確認できた
   * - false     … 公式が「ありません」と明記している
   * - 'unknown' … 公式で記載を確認できなかった（＝**「ある」に倒さない**ための値）
   */
  exists: boolean | 'unknown';
  /** 収容台数（複数の駐車場がある施設は合計。内訳は note に書く）。 */
  capacity?: number;
  /**
   * 利用できる時間。'24時間' / '9:00〜17:00' / '開園時間内のみ' など。
   * **ここが空のまま「あり」だけ書かれるのが監査で見つかった最頻の欠陥（86%）**。
   */
  hours?: string;
  /** 料金。時間単価・最大料金・平日/土日の別まで、公式に書かれている粒度で書く。 */
  fee?: string;
  /** 公式の注意（工事中・公共交通推奨・留め置き不可など）。行ってから気づくと困る情報。 */
  note?: string;
  /** 一次情報のURL。 */
  sourceUrl: string;
  /** その生HTMLを確認した日（YYYY-MM-DD）。 */
  confirmedAt: string;
};

/**
 * スポット名 → 駐車場。キーは lib/spots.ts の**上書き前の** name と完全一致。
 *
 * 収録は 2026-08-20 に公式の生HTMLで確認したもの。
 */
export const SPOT_PARKING: Record<string, SpotParking> = {
  // ───────── 都立公園（東京都公園協会「公園へ行こう！」）─────────
  舎人公園: {
    exists: true,
    capacity: 157,
    hours: '24時間',
    fee: '1時間300円、以後20分ごと100円（24時間最大1,200円）',
    note: '第一駐車場78台・第二駐車場46台・第三駐車場33台の合計157台。',
    sourceUrl: 'https://www.tokyo-park.or.jp/park/toneri/',
    confirmedAt: '2026-08-20',
  },
  駒沢オリンピック公園: {
    exists: true,
    capacity: 222,
    hours: '24時間',
    fee: '1時間400円、以後30分ごと200円（12時間最大1,600円）',
    note: '第一駐車場181台・第二駐車場41台の合計222台。',
    sourceUrl: 'https://www.tokyo-park.or.jp/park/komazawa-olympic/',
    confirmedAt: '2026-08-20',
  },
  光が丘公園: {
    exists: true,
    capacity: 251,
    hours: '24時間',
    fee: '1時間400円（12時間最大1,600円）',
    sourceUrl: 'https://www.tokyo-park.or.jp/park/hikarigaoka/',
    confirmedAt: '2026-08-20',
  },
  葛西臨海公園: {
    exists: true,
    capacity: 182,
    hours: '24時間（夜間は第1駐車場のみ）',
    // 最大料金が平日限定なのはこの公園特有。土日祝に「12時間1,600円」と案内すると
    // 実際の支払額と食い違うので、平日/土日祝の別を必ず書く。
    fee: '1時間400円。最大料金は平日のみ12時間1,600円',
    note: '182台に加えて繁忙期は臨時駐車場が開く。',
    sourceUrl: 'https://www.tokyo-park.or.jp/park/kasairinkai/',
    confirmedAt: '2026-08-20',
  },
  木場公園: {
    exists: true,
    capacity: 134,
    hours: '24時間',
    fee: '1時間400円（12時間最大1,600円）',
    note: '第一駐車場104台・第二駐車場30台の合計134台。',
    sourceUrl: 'https://www.tokyo-park.or.jp/park/kiba/',
    confirmedAt: '2026-08-20',
  },
  砧公園: {
    exists: true,
    capacity: 235,
    hours: '24時間',
    fee: '1時間400円（12時間最大1,600円）',
    sourceUrl: 'https://www.tokyo-park.or.jp/park/kinuta/',
    confirmedAt: '2026-08-20',
  },
  代々木公園: {
    exists: true,
    capacity: 65,
    hours: '24時間',
    fee: '1時間800円（12時間最大3,200円）',
    sourceUrl: 'https://www.tokyo-park.or.jp/park/yoyogi/',
    confirmedAt: '2026-08-20',
  },

  // ───────── 国営公園 ─────────
  // 24時間の都立公園と違い、**開園時間外は出庫できない**。
  // 2026-08-20 に夜の花火記事が「駐車場あり」前提で案内していた事故の当事者。
  国営昭和記念公園: {
    exists: true,
    hours: '開園時間内のみ（閉園30分前に閉門）',
    fee: '普通車900円／日（年間パスポート提示で800円）',
    note: '開園時間外の留め置きは不可。夜間・早朝の行動には使えない。',
    sourceUrl: 'https://www.showakinen-koen.jp/access/',
    confirmedAt: '2026-08-20',
  },

  // ───────── 「駐車場なし」を明記している施設 ─────────
  // false を持つこと自体が価値。持たないと「書いていない＝未確認」と区別できず、
  // 誰かが「たぶんあるだろう」で書き足す。
  等々力渓谷: {
    exists: false,
    note: '世田谷区公式に「駐車場および駐輪場はありません」と明記。公共交通で行く前提。',
    sourceUrl: 'https://www.city.setagaya.lg.jp/02075/9082.html',
    confirmedAt: '2026-08-20',
  },

  // ───────── 茨城 ─────────
  // 土日祝は路線バスが全便運休（公式明記）で、実質この無料駐車場が主要動線になる。
  地図と測量の科学館: {
    exists: true,
    fee: '無料',
    note: '国土地理院公式の利用案内に「無料駐車場あり、大型バス４台可」と記載。台数（普通車）の記載はない。',
    sourceUrl: 'https://www.gsi.go.jp/MUSEUM/p02.html',
    confirmedAt: '2026-08-28',
  },
  // ───────── 福井 ─────────
  'かにファクトリー 甲羅組': {
    exists: true,
    capacity: 250,
    fee: '無料',
    note: '公式FAQに「普通自動車250台、大型バス最大20台駐車可能」と記載。かにファクトリーの利用者以外は駐車できない。自転車・バイクの駐輪スペースもある。',
    sourceUrl: 'https://www.kanifactory.com/faq',
    confirmedAt: '2026-11-17',
  },
  // ───────── 新宿区（2026-11-19 公式確認・batch-9） ─────────
  "薬王寺児童館": {
    "exists": false,
    "note": "区公式に「駐輪場・駐車場はありませんので、徒歩又は、公共交通機関等をご利用ください」と明記。",
    "sourceUrl": "https://www.city.shinjuku.lg.jp/kodomo/file03_03_00011.html",
    "confirmedAt": "2026-11-19"
  },
  "落合三世代交流サロン": {
    "exists": false,
    "note": "運営団体の公式Q&Aに「駐車場はございません」と明記。建物入口に駐輪スペースあり。",
    "sourceUrl": "https://www.3sedai.com/%e8%90%bd%e5%90%88%e4%b8%89%e4%b8%96%e4%bb%a3%e4%ba%a4%e6%b5%81%e3%82%b5%e3%83%ad%e3%83%b3%e3%81%ab%e3%81%a4%e3%81%84%e3%81%a6/",
    "confirmedAt": "2026-11-19"
  },
  "新宿中央公園": {
    "exists": false,
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/file15_02_00001.html",
    "confirmedAt": "2026-11-19",
    "note": "公式「公園内に駐車場はありません。近隣の駐車場をご利用ください。」。公園のFAQは「公園に近い駐車場が都庁にございます」と案内。"
  },
  "おとめ山公園": {
    "exists": false,
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/midori02_001013.html",
    "confirmedAt": "2026-11-19",
    "note": "公式「公園内に一般の駐車場はありません。近隣の駐車場をご利用ください。」。バリアフリーの駐車場が必要な方はみどり公園課へ事前連絡。"
  },
  "落合中央公園": {
    "exists": false,
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/midori02_001016.html",
    "confirmedAt": "2026-11-19",
    "note": "公式の備考「駐車場：×」。"
  },
  "みなみもと町公園": {
    "exists": false,
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/midori05_001015.html",
    "confirmedAt": "2026-11-19",
    "note": "公式の備考「駐車場：☓」。"
  },
  "北新宿公園": {
    "exists": false,
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/midori01_001031.html",
    "confirmedAt": "2026-11-19",
    "note": "公式「園内に駐車場はありません。車での来園はご遠慮ください。」"
  },
  "鶴巻南公園": {
    "exists": false,
    "sourceUrl": "https://www.city.shinjuku.lg.jp/seikatsu/midori01_001016.html",
    "confirmedAt": "2026-11-19",
    "note": "公式の備考「駐車場：×」。"
  },
  "白銀（しろがね）公園": {
    "exists": false,
    "sourceUrl": "https://www.city.shinjuku.lg.jp/kanko/midori01_001006.html",
    "confirmedAt": "2026-11-19",
    "note": "公式の備考「駐車場：×」。"
  },
  "戸山公園": {
    "exists": false,
    "sourceUrl": "https://www.tokyo-park.or.jp/park/toyama/",
    "confirmedAt": "2026-11-19",
    "note": "公式「当公園には駐車場はございません。」"
  },
  "新宿区立漱石山房記念館": {
    "exists": false,
    "note": "公式「身障者用以外の駐車場はございません。公共交通機関をご利用ください。」（身障者用駐車場は1台）",
    "sourceUrl": "https://soseki-museum.jp/user-guide/usage/",
    "confirmedAt": "2026-11-19"
  },
  "新宿コズミックスポーツセンター": {
    "exists": true,
    "fee": "30分まで無料、以降30分ごとに100円（現金のみ）",
    "note": "地下2階。車両制限は重量1.5t・高さ2.2m・幅1.8m・全長4.9m以下。当館利用者以外の駐車は不可。22:15以降は出庫できない。",
    "sourceUrl": "https://www.regasu-shinjuku.or.jp/?p=667",
    "confirmedAt": "2026-11-19"
  },
  "新宿区立新宿スポーツセンター": {
    "exists": true,
    "capacity": 17,
    "fee": "60分300円（以降30分ごとに150円）",
    "note": "車両制限は車高2.4m・車長4.7m・車幅1.7m・重量1.5t以下。公式は台数に限りがあるため公共交通機関の利用を案内。",
    "sourceUrl": "https://www.shinjuku-sportscenter.jp/",
    "confirmedAt": "2026-11-19"
  },
  "東京都庁 展望室": {
    "exists": true,
    "hours": "第一本庁舎駐車場 入口8:00（公園通り）/8:30（都庁通り）〜21:30、出口〜22:00",
    "fee": "最初の1時間は30分ごと150円、1時間以降は30分ごと250円（当日上限2,000円）",
    "note": "第一本庁舎駐車場（高さ制限2.2m）。年末年始（12/29〜31、1/2・1/3）と庁舎点検日は休業。第二本庁舎駐車場は土日祝休業。",
    "sourceUrl": "https://www.zaimu.metro.tokyo.lg.jp/tochousha/goannai/shisetsu",
    "confirmedAt": "2026-11-19"
  },
  "日本オリンピックミュージアム": {
    "exists": false,
    "note": "公式「日本オリンピックミュージアムには駐車場及び乗降スペースはございません。お越しの際は、公共交通機関のご利用をお願いします。」",
    "sourceUrl": "https://japan-olympicmuseum.jp/jp/access/",
    "confirmedAt": "2026-11-19"
  },
  "平和祈念展示資料館": {
    "exists": false,
    "note": "公式「駐車場はありません。近隣の駐車場をご利用ください。」",
    "sourceUrl": "https://www.heiwakinen.go.jp/goriyou/faq/",
    "confirmedAt": "2026-11-19"
  },
  "SOMPO美術館（ソンポびじゅつかん）": {
    "exists": false,
    "note": "公式「美術館専用の駐車場はございません」。隣接する損保ジャパン本社ビルの地下5階に有料駐車場（30分400円・高さ2.1m・幅2.5m・長さ6mまで、台数に限り）。",
    "sourceUrl": "https://www.sompo-museum.org/faq/",
    "confirmedAt": "2026-11-19"
  },
  "東京オペラシティ アートギャラリー": {
    "exists": true,
    "fee": "30分300円（東京オペラシティB2F時間貸駐車場）",
    "note": "アートギャラリーの公式には記載なし。同じ東京オペラシティタワーのNTTインターコミュニケーション・センター［ICC］の来館案内の記載による。",
    "sourceUrl": "https://www.ntticc.or.jp/ja/about/visit/",
    "confirmedAt": "2026-11-19"
  },
  "新宿区立こども図書館": {
    "exists": false,
    "note": "公式（中央図書館の案内）に「駐車場 なし」。駐輪場は正門から直進し校庭右手側（同じ建物の中央図書館の案内）。",
    "sourceUrl": "https://www.library.shinjuku.tokyo.jp/facility/chuo/index.html",
    "confirmedAt": "2026-11-19"
  },
  "新宿区立四谷図書館": {
    "exists": false,
    "note": "公式に「駐車場 なし」。駐輪場は区民センター正面入り口付近。",
    "sourceUrl": "https://www.library.shinjuku.tokyo.jp/facility/yotsuya/index.html",
    "confirmedAt": "2026-11-19"
  },
  "新宿区立鶴巻図書館": {
    "exists": false,
    "note": "公式に「駐車場 なし」「駐輪場 なし」。",
    "sourceUrl": "https://www.library.shinjuku.tokyo.jp/facility/tsurumaki/index.html",
    "confirmedAt": "2026-11-19"
  },
  "新宿区立西落合図書館": {
    "exists": false,
    "note": "公式に「駐車場 なし」。駐輪場は図書館敷地内の入り口付近。",
    "sourceUrl": "https://www.library.shinjuku.tokyo.jp/facility/nishiochiai/index.html",
    "confirmedAt": "2026-11-19"
  },
  "新宿区立戸山図書館": {
    "exists": false,
    "note": "公式に「駐車場 なし」。駐輪場は正面入り口左手のブックポスト横。",
    "sourceUrl": "https://www.library.shinjuku.tokyo.jp/facility/toyama/index.html",
    "confirmedAt": "2026-11-19"
  },
  "新宿区立北新宿図書館": {
    "exists": false,
    "note": "公式に「駐車場 なし」。駐輪場は正門を入ったピロティ。",
    "sourceUrl": "https://www.library.shinjuku.tokyo.jp/facility/kitashinjuku/index.html",
    "confirmedAt": "2026-11-19"
  },
  "新宿区立中町図書館": {
    "exists": false,
    "note": "公式に「駐車場 なし」「駐輪場 なし」。",
    "sourceUrl": "https://www.library.shinjuku.tokyo.jp/facility/nakamachi/index.html",
    "confirmedAt": "2026-11-19"
  },
  "新宿区立角筈図書館": {
    "exists": false,
    "note": "公式に「駐車場 なし」「駐輪場 なし」。",
    "sourceUrl": "https://www.library.shinjuku.tokyo.jp/facility/tsunohazu/index.html",
    "confirmedAt": "2026-11-19"
  },
  "新宿区立大久保図書館": {
    "exists": false,
    "note": "公式に「駐車場 なし」。駐輪場は正面入り口左手のブックポスト横。",
    "sourceUrl": "https://www.library.shinjuku.tokyo.jp/facility/okubo/index.html",
    "confirmedAt": "2026-11-19"
  },
  "新宿区立下落合図書館": {
    "exists": false,
    "note": "公式に「駐車場 なし」。駐輪場は正面入り口左奥。",
    "sourceUrl": "https://www.library.shinjuku.tokyo.jp/facility/shimoochiai/index.html",
    "confirmedAt": "2026-11-19"
  },
  "しゅみの森 東新宿店": {
    "exists": false,
    "note": "公式に「駐車場 なし（近隣コインパーキングをご利用ください）／駐輪場あり」。",
    "sourceUrl": "https://www.shuminomori.jp/",
    "confirmedAt": "2026-11-19"
  },
  "べるべるパーク新宿本店": {
    "exists": false,
    "note": "公式FAQに「専用駐車場および提携駐車場のご用意はございません。お近くのコインパーキングをご利用ください。」",
    "sourceUrl": "https://www.pasela.co.jp/mamakai/beruberu-park/faq/",
    "confirmedAt": "2026-11-19"
  },
  "明治神宮外苑アイススケート場": {
    "exists": true,
    "capacity": 9,
    "hours": "24時間",
    "fee": "5:00〜21:00は1時間600円・以後30分ごとに300円／21:00〜5:00は2時間400円・以後1時間ごとに100円",
    "note": "障がい者専用1台を含む9台。公式FAQに「駐車可能台数が9台と少ないので出来るだけ公共の交通機関をご利用ください」、割引・提携駐車場なし。周辺の絵画館駐車場は5:30〜21:00・普通車1日1回2,000円（日曜・祝日は交通規制の場合あり）。",
    "sourceUrl": "https://meijijingugaien-iceskating.com/access/",
    "confirmedAt": "2026-11-19"
  },
};

/**
 * 同じ駐車場を共有する「施設内の一部エリア」→ 親施設 の対応。
 *
 * じゃぶじゃぶ池などは lib/spots.ts に親公園とは別スポットとして載っているが、
 * 駐車場は親公園のものと同一。ここで親に寄せることで、**同じ事実を2箇所に持たない**
 * （本文複製を無くすのが目的なのに、データ層で複製したら意味がない）。
 * キー・値とも lib/spots.ts の上書き前の name と完全一致させること。
 */
export const SPOT_PARKING_ALIAS: Record<string, string> = {
  '舎人公園 じゃぶじゃぶ池（浮球の池）': '舎人公園',
  '駒沢オリンピック公園 ジャブジャブ池': '駒沢オリンピック公園',
  '光が丘公園 水景施設': '光が丘公園',
  '昭和記念公園 こどもの森レインボーハンモック': '国営昭和記念公園',
};

/**
 * 2026-08-20 に公式で確認したが、**lib/spots.ts に該当スポットが無いため未収録**のもの。
 * name 一致でマージする設計上、spots.ts に無い施設はキーを置いても誰にも届かない。
 * 将来そのスポットを spots.ts に足したら、ここから SPOT_PARKING へ移すこと。
 * （確認済みの事実を捨てないためのメモ。ここはデータではないので描画には使われない。）
 *
 *  - 城北中央公園    66台 / 24時間 / 1h300円・12h最大1,200円   tokyo-park.or.jp/park/johoku-chuo/
 *  - 大泉中央公園    66台 / 24時間 / 1h200円・12h最大800円     tokyo-park.or.jp/park/oizumi-chuo/
 *  - 小山田緑地      65台 / 9:00〜17:00（夜間閉鎖）/ 無料        tokyo-park.or.jp/park/oyamadaryokuchi/
 *  - 長沼公園        10台 / 9:00〜16:30 / 無料・バス利用不可     tokyo-park.or.jp/park/naganuma/
 *  - 滝山公園        exists: false（公式「駐車場がありませんのでご注意ください」）
 *                                                              tamaparks.com/kouen/takiyama/
 *  - 猿江恩賜公園    exists: 'unknown'（公式が18KBのシェルのみで「駐車」0件・取得できず）
 *                                                              tokyo-park.or.jp/park/sarue/
 *  - しあわせの村（神戸） 約1,600台 / 1日500円だが18歳未満同乗＋窓口手続きで無料・1時間以内も無料
 *                                                              shiawasenomura.org/parking/
 *  - 王子公園（神戸） exists: 'unknown'（神戸市・公園緑化協会・王子動物園のいずれの公式でも記載を確認できず）
 */

/** そのスポットの駐車場を引く（エリア別スポットは親施設に寄せる）。 */
export function getSpotParking(spotName: string): SpotParking | undefined {
  return SPOT_PARKING[spotName] ?? SPOT_PARKING[SPOT_PARKING_ALIAS[spotName] ?? ''];
}

/**
 * 確認日から何日経ったか。
 * 両端とも「その日の正午」に揃えて引く（now の時刻でその日が -1 日に化けないように）。
 */
export function daysSinceConfirmed(p: SpotParking, now: Date = new Date()): number {
  const today = Date.parse(`${now.toISOString().slice(0, 10)}T12:00:00Z`);
  return Math.round((today - Date.parse(`${p.confirmedAt}T12:00:00Z`)) / 86400000);
}

/** 再確認が必要な理由。 */
export type ParkingCheckReason =
  /** 有無すら確認できていない（放置すると誰かが「あり」に倒す） */
  | 'unknown'
  /** 「あり」なのに利用時間が無い（監査で86%を占めた欠陥。夜間閉鎖が読者に伝わらない） */
  | 'no-hours'
  /** 「あり」なのに料金が無い（確定した事実誤り5件のうち3件が料金） */
  | 'no-fee'
  /** 確認日が古い */
  | 'stale';

/**
 * 再確認が必要な駐車場データを全部返す。
 * `scripts/check-parking-freshness.mjs` から使う。
 *
 * `staleDays` の既定365日は、都立公園の料金改定が年度単位で入るため。
 */
export function listParkingNeedingCheck(
  now: Date = new Date(),
  staleDays = 365,
  data: Record<string, SpotParking> = SPOT_PARKING,
): { spotName: string; parking: SpotParking; reasons: ParkingCheckReason[]; ageDays: number }[] {
  const out: { spotName: string; parking: SpotParking; reasons: ParkingCheckReason[]; ageDays: number }[] = [];
  for (const [spotName, p] of Object.entries(data)) {
    const reasons: ParkingCheckReason[] = [];
    if (p.exists === 'unknown') reasons.push('unknown');
    if (p.exists === true && !p.hours) reasons.push('no-hours');
    if (p.exists === true && !p.fee) reasons.push('no-fee');
    const ageDays = daysSinceConfirmed(p, now);
    if (ageDays > staleDays) reasons.push('stale');
    if (reasons.length) out.push({ spotName, parking: p, reasons, ageDays });
  }
  // unknown を最優先、次に古い順
  return out.sort((a, b) => {
    const au = a.reasons.includes('unknown') ? 0 : 1;
    const bu = b.reasons.includes('unknown') ? 0 : 1;
    if (au !== bu) return au - bu;
    return b.ageDays - a.ageDays;
  });
}
