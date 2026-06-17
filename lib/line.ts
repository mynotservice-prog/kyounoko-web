/**
 * LINE 公式アカウント（Messaging API）連携 — 友だち数の自動取得。
 *
 * セットアップ:
 *   1. LINE Developers で対象チャネルの「チャネルアクセストークン（長期）」を発行
 *   2. Vercel env LINE_CHANNEL_ACCESS_TOKEN に設定
 *
 * 仕様:
 *   - GET /v2/bot/insight/followers?date=YYYYMMDD で友だち数を取得
 *   - 集計は前日分までしか確定しないため、既定で「昨日」の日付を使う
 *   - データが無い日付（友だち50人未満や集計前）は status!='ready' になり null を返す
 *   - 未設定時は null（呼び出し側でグレースフルに空表示）
 */

const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
/** 運営者本人の LINE userId（push通知の宛先）。KPIアラート等の内部通知に使う。 */
const OWNER_USER_ID = process.env.LINE_OWNER_USER_ID;

export function isLineConfigured(): boolean {
  return !!TOKEN;
}

/** 運営者へ push 通知できる状態か（トークン＋宛先 userId が揃っている）。 */
export function isLinePushConfigured(): boolean {
  return !!TOKEN && !!OWNER_USER_ID;
}

/**
 * 運営者本人（LINE_OWNER_USER_ID）へテキストを push する。
 * KPI急落アラートなどの内部通知用。友だち全員への broadcast ではない。
 *
 * - 未設定（TOKEN or OWNER_USER_ID 無し）なら何もせず false を返す。
 * - LINE のテキストは1通5,000字まで。長文は丸める。
 */
export async function sendLinePush(text: string): Promise<boolean> {
  if (!TOKEN || !OWNER_USER_ID) return false;
  try {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        to: OWNER_USER_ID,
        messages: [{ type: 'text', text: text.slice(0, 5000) }],
      }),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('[line] push error', res.status, (await res.text()).slice(0, 200));
      return false;
    }
    return true;
  } catch (e) {
    console.error('[line] push exception', e instanceof Error ? e.message : e);
    return false;
  }
}

export type LineFollowers = {
  /** ターゲットにできる友だち総数（ブロック中を除いた到達可能数の母数） */
  followers: number;
  /** ブロック中の人数 */
  blocks: number;
  /** 集計対象日 'YYYY-MM-DD' */
  date: string;
};

function yyyymmdd(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 直近で集計済みの友だち数を取得。
 * 昨日 → 一昨日 と最大数日さかのぼって ready なデータを探す。
 */
export async function getLineFollowers(): Promise<LineFollowers | null> {
  if (!TOKEN) return null;
  for (let back = 1; back <= 4; back++) {
    const d = new Date();
    d.setDate(d.getDate() - back);
    const dateStr = yyyymmdd(d);
    try {
      const res = await fetch(`https://api.line.me/v2/bot/insight/followers?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
        cache: 'no-store',
      });
      if (!res.ok) {
        console.error('[line] insight error', res.status, (await res.text()).slice(0, 200));
        continue;
      }
      const data = (await res.json()) as {
        status?: string;
        followers?: number;
        targetedReaches?: number;
        blocks?: number;
      };
      if (data.status === 'ready') {
        return {
          followers: data.followers ?? 0,
          blocks: data.blocks ?? 0,
          date: `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6)}`,
        };
      }
    } catch (e) {
      console.error('[line] exception', e instanceof Error ? e.message : e);
    }
  }
  return null;
}
