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
