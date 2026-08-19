/**
 * 季節営業スポットの「会期」を年つきで構造化して持つ。
 *
 * ── なぜ必要か ────────────────────────────────────────────
 * このリポジトリのデータモデルは長らく二択だった:
 *   - spots.ts  = 永続スポット・会期なし（「会期ものではないのでイベントのように失効しない」）
 *   - events.ts = 単発イベント・会期あり（endDate < 今日 で失効）
 * ところが じゃぶじゃぶ池・区民プール・ふれあい農園のような施設は
 * **「毎年ある」かつ「会期がある」** の両方の性質を持つため、どちらにも収まらず、
 * 会期が自然文の note に押し込まれてきた（spot-overrides.json だけで日付表現93箇所）。
 *
 * その結果、2026-08-19 に実害が出た: 舎人公園じゃぶじゃぶ池の記事が
 * **2025年の告知（7月19日〜8月31日）を引用したまま**で、2026年の実態
 * （7月3日〜9月29日・毎週水曜休み・12:30〜13:30閉鎖・500人超で整理券）と食い違っていた。
 * 同じ会期が spot-facilities の note / spot-overrides の note / crowdTips / FAQ 2箇所と
 * **5箇所に重複**していたため、1箇所直しても他が古いまま残る状態だった。
 *
 * ── 設計 ──────────────────────────────────────────────
 *  - 会期は **年つきの ISO 日付**で持つ。「7月上旬」のような曖昧表現は入れない。
 *  - 年つきで持つことで **年度ロールオーバーの未更新を機械検出できる**（isStaleYear）。
 *    これが今回の2025年問題を再発させないための中核。
 *  - 会期は**ここだけ**に書く。記事本文・note・FAQ に日付を直書きしない
 *    （表示はこのデータから生成する）。5箇所重複を1箇所にするのが目的。
 *  - キーは lib/spots.ts の name と**完全一致**させること。spot-overrides で表示名を
 *    変えているスポットは表示名で引くと一致しない（lib/spots.ts:248 の警告と同じ罠。
 *    2026-08-19 に実際に踏まれている）。
 *  - **確認していない会期を推測で書かない。** 翌年の日付を先回りして書くのは禁止
 *    （lib/annual-events.ts と同じ規律: 公式発表前の日付を作らない）。
 *
 * ── 出典の扱い ─────────────────────────────────────────
 * source には一次情報の出どころを、checkedAt には**実際に確認した日**を書く。
 * 他者の確認記録から移送した場合は note にその旨を明記し、自分が見ていないものを
 * 自分が見たことにしない。
 */

/** 季節アクティビティの種別。ブール値フラグ（waterPlay 等）を増やす代わりにここを増やす。 */
export type SeasonActivity =
  | 'mizuasobi'    // じゃぶじゃぶ池・噴水・水遊び場（夏）
  | 'pool'         // 屋外プール（夏）
  | 'onsui-pool'   // 屋内・温水プール（通年だが休館期間がある）
  | 'imohori'      // 芋掘り・収穫体験（秋）
  | 'playpark'     // プレーパーク・冒険遊び場（通年・開催曜日が限られる）
  | 'sori'         // ソリゲレンデ・雪遊び（冬）
  | 'mushitori';   // 昆虫採集が公式に認められている場所（夏）

export type SpotSeasonWindow = {
  activity: SeasonActivity;
  /** 会期の開始日（YYYY-MM-DD・年つき）。 */
  opensAt: string;
  /** 会期の終了日（YYYY-MM-DD・年つき）。 */
  closesAt: string;
  /** 利用時間の説明（例: '10:00〜16:00'）。 */
  hours?: string;
  /** 休みの日。'毎週水曜' のような規則と 'YYYY-MM-DD' の個別指定を混ぜてよい。 */
  closedDays?: string[];
  /** 対象年齢の制限（公式に記載がある場合のみ）。 */
  ageLimit?: string;
  /** 一次情報の出どころ（URL または 公式媒体名）。 */
  source: string;
  /** この会期を確認した日（YYYY-MM-DD）。 */
  checkedAt: string;
  /** 補足。整理券・入場制限・点検休止など、行ってから気づくと困る情報を書く。 */
  note?: string;
};

/**
 * スポット名 → その施設が持つ会期の一覧。
 * 1施設が複数の季節アクティビティを持つことがあるので配列。
 */
export const SPOT_SEASON: Record<string, SpotSeasonWindow[]> = {
  // ───────── 2026年夏・都立公園の水遊び場 ─────────
  // 出典と内容は 2026-08-19 に lib/spot-facilities.ts へ記録された公式確認結果からの移送。
  // 移送元のコミットは 7e06880（東京都公園協会「公園へ行こう！」各公園のお知らせ／舎人公園公式X）。
  // GM自身は 2026-08-19 に公式サイトへの再アクセスを試みたがタイムアウトしたため、
  // ここでの checkedAt は移送元の確認日をそのまま引き継いでいる（自分で見た日ではない）。
  '舎人公園 じゃぶじゃぶ池（浮球の池）': [
    {
      activity: 'mizuasobi',
      opensAt: '2026-07-03',
      closesAt: '2026-09-29',
      hours: '10:00〜16:00',
      closedDays: ['毎週水曜', '2026-08-13', '2026-09-17'],
      ageLimit: '小学3年生以下（水着着用・裸足・おむつが取れていない子は水泳用おむつを含め利用不可）',
      source: '舎人公園公式サイトのお知らせ／舎人公園公式X',
      checkedAt: '2026-08-19',
      note: '2026年7月18日から12:30〜13:30はメンテナンスのため閉鎖。午前・午後それぞれ入場者500人超で入場制限があり、出入口で整理券が配布される。確認記録は lib/spot-facilities.ts からの移送。',
    },
  ],
  '水元公園 水遊び場': [
    {
      activity: 'mizuasobi',
      opensAt: '2026-07-01',
      closesAt: '2026-09-30',
      hours: '9:00〜16:00（12:00〜13:00は噴水休止）',
      closedDays: ['2026-08-12', '2026-08-18', '2026-09-04', '2026-09-15'],
      source: '水元公園公式「噴水広場開放のお知らせ」',
      checkedAt: '2026-08-19',
      note: '公式には「じゃぶじゃぶ池」という名称の施設はなく、水遊びの場所は噴水広場。休みは噴水点検日・清掃日。確認記録は lib/spot-facilities.ts からの移送。',
    },
  ],
  '駒沢オリンピック公園 ジャブジャブ池': [
    {
      activity: 'mizuasobi',
      opensAt: '2026-07-01',
      closesAt: '2026-09-30',
      hours: '10:00〜16:00',
      ageLimit: '小学3年生以下',
      source: '駒沢オリンピック公園公式「ジャブジャブ池 ご利用のご案内」',
      checkedAt: '2026-08-19',
      note: '場所は西口近く。おむつ規定と水深は公式サイトにテキスト記載がない。確認記録は lib/spot-facilities.ts からの移送。',
    },
  ],
};

/** 'YYYY-MM-DD' → Date（UTC正午基準。タイムゾーンで日付がずれないように）。 */
function parseDate(iso: string): number {
  return Date.parse(`${iso}T12:00:00Z`);
}

export type SeasonState =
  /** 会期中 */
  | 'open'
  /** 今年の会期はまだ先 */
  | 'upcoming'
  /** 今年の会期は終了した */
  | 'ended'
  /** 会期の年が過去のまま＝データが更新されていない（要再確認） */
  | 'stale-year';

/**
 * 会期の状態を判定する。
 *
 * **stale-year がこの関数の主目的**。closesAt の年が現在年より古いということは、
 * 「今年の会期をまだ確認していない」状態であり、記事に去年の日付が出ている可能性がある。
 * 2026-08-19 の舎人公園の事故（2025年の告知を引用したまま）はこれで検出できる。
 */
export function getSeasonState(w: SpotSeasonWindow, now: Date = new Date()): SeasonState {
  const closesYear = Number(w.closesAt.slice(0, 4));
  const nowYear = now.getUTCFullYear();
  if (closesYear < nowYear) return 'stale-year';

  const t = now.getTime();
  if (t < parseDate(w.opensAt)) return 'upcoming';
  if (t > parseDate(w.closesAt)) return 'ended';
  return 'open';
}

/** 会期が今から何日後に終わるか（終了済みなら負の値）。守りキューの優先度に使う。 */
export function daysUntilClose(w: SpotSeasonWindow, now: Date = new Date()): number {
  return Math.floor((parseDate(w.closesAt) - now.getTime()) / 86400000);
}

/**
 * 表示用の会期ラベル。**年つきで出す**（「今年は」と書いて年を省くと、
 * ページがキャッシュされたときに何年の話か分からなくなる）。
 */
export function formatSeasonPeriod(w: SpotSeasonWindow): string {
  const f = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return { y, m, d };
  };
  const s = f(w.opensAt);
  const e = f(w.closesAt);
  const head = `${s.y}年${s.m}月${s.d}日〜`;
  const tail = s.y === e.y ? `${e.m}月${e.d}日` : `${e.y}年${e.m}月${e.d}日`;
  return head + tail;
}

/** そのスポットの、指定アクティビティの会期を引く。 */
export function getSpotSeason(
  spotName: string,
  activity?: SeasonActivity,
): SpotSeasonWindow[] {
  const list = SPOT_SEASON[spotName];
  if (!list) return [];
  return activity ? list.filter((w) => w.activity === activity) : list;
}

/**
 * 再確認が必要な会期を全部返す。`scripts/check-season-freshness.mjs` と
 * /admin/priority の守りキューから使う想定。
 *  - stale-year: 年が古い（最優先）
 *  - 会期終了まで `soonDays` 日以内: 来季に向けて再確認が要る
 */
export function listSeasonsNeedingCheck(
  now: Date = new Date(),
  soonDays = 30,
): { spotName: string; window: SpotSeasonWindow; state: SeasonState; daysLeft: number }[] {
  const out: { spotName: string; window: SpotSeasonWindow; state: SeasonState; daysLeft: number }[] = [];
  for (const [spotName, windows] of Object.entries(SPOT_SEASON)) {
    for (const w of windows) {
      const state = getSeasonState(w, now);
      const daysLeft = daysUntilClose(w, now);
      if (state === 'stale-year' || (state === 'open' && daysLeft <= soonDays)) {
        out.push({ spotName, window: w, state, daysLeft });
      }
    }
  }
  // stale-year を先頭に、次に終了が近い順
  return out.sort((a, b) => {
    if (a.state === 'stale-year' && b.state !== 'stale-year') return -1;
    if (b.state === 'stale-year' && a.state !== 'stale-year') return 1;
    return a.daysLeft - b.daysLeft;
  });
}
