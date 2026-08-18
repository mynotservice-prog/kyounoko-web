/**
 * 改修・工事などで「一定期間だけ」休館するスポット。
 *
 * SPOT_CLOSED（lib/spot-closed.ts）が「恒久的に無くなった施設」なのに対し、
 * こちらは期間が明けたら自動的に元へ戻る一時休館を扱う。
 *
 * なぜ要るか:
 *   おすすめ枠（1日モデルコース・周辺スポット）は人気順で機械的に選ぶため、
 *   休館中の施設を「午後はここへ」と案内してしまう。過去に閉店店舗を勝ちページで
 *   「有料部門No.1」として掲載した事故があり、同じ構造の再発を防ぐ。
 *
 * ルール:
 *   - 公式サイトで休館期間が確認できたものだけを入れる（推測で書かない）
 *   - キーは lib/spots.ts の name と完全一致
 *   - 期間中はおすすめ枠から除外し、スポットページに休館バナーを出す
 *   - 期間が明けたらデータを触らなくても自動で通常表示に戻る
 */

export type TempClosure = {
  /** 休館開始日（YYYY-MM-DD、この日を含む） */
  from: string;
  /** 休館終了日（YYYY-MM-DD、この日を含む） */
  to: string;
  /** 表示する説明文 */
  note: string;
  /** 出典（公式サイト） */
  source: string;
};

export const SPOT_TEMP_CLOSED: Record<string, TempClosure> = {
  日本科学未来館: {
    from: '2026-10-01',
    to: '2027-04-22',
    note: '施設整備のため全館休館します（2026年10月1日〜2027年4月22日）。再開日は公式サイトでご確認ください。',
    source: 'https://www.miraikan.jst.go.jp/',
  },
};

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 指定日（既定=今日）に休館中なら、その休館情報を返す。 */
export function getTempClosure(spotName: string, on?: string): TempClosure | null {
  const c = SPOT_TEMP_CLOSED[spotName];
  if (!c) return null;
  const d = on ?? todayString();
  return c.from <= d && d <= c.to ? c : null;
}

/** おすすめ枠に出してよいか（休館中なら false）。 */
export function isSpotAvailableNow(spotName: string, on?: string): boolean {
  return getTempClosure(spotName, on) === null;
}
