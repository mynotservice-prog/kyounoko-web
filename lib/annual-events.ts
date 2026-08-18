/**
 * 「この会場で毎年ひらかれるイベント」の導出。
 *
 * 狙い（2026-08-18 社長判断）:
 *   終了したイベントを過去アーカイブとして一覧ページに溜めるのは、実測で否定されている
 *   （`/events` の条件フィルタ一覧は 9,530表示・クリック3件。「去年」「昨年」の検索需要は0）。
 *   代わりに、終了イベントを**永続資産である /spot/ ページの中身に畳み込む**。
 *   会期が切れたイベントは消えるのではなく「毎年◯月ごろ開催」という未来向きの情報に変換される。
 *
 * 正直さの担保:
 *   「毎年」と言い切れるのは、recurring:'annual' が明示されているか、category:'matsuri'（祭りは
 *   本質的に年次）のものだけ。タイトルの語（ナイト/サマー等）から推定しただけのものは
 *   「毎年」とは書かず「2026年は◯月に開催」と観測事実だけを書く。
 *   翌年の具体的な日付は絶対に書かない（公式発表前の日付を作らない）。
 */

import { getAllEvents, isEventEnded, type EventEntry } from './events';

/**
 * タイトルから年次と言い切れる語。祭り・花火大会・七夕などは本質的に毎年ひらかれる行事で、
 * 単発で行われることがまず無いので「毎年◯月ごろ」と書いてよい。
 */
const ANNUAL_STRONG_RE = /祭|まつり|花火|おどり|踊り|山笠|天王祭|ペーロン|七夕|夜店|納涼/;

/**
 * 年次らしさを示すが確度が低い語。館の企画（ナイトズー／サマーフェスタ等）は
 * その年だけの可能性があるので「毎年」とは書かず、開催した事実だけを書く。
 */
const ANNUAL_WEAK_RE = /ナイト|サマー|ラベンダー|さくらんぼ|潮|開山|夜の水族館/;

export type VenueAnnualEvent = {
  slug: string;
  title: string;
  /** 'annual' = 毎年と言い切れる / 'observed' = 今年やっていたという観測のみ */
  kind: 'annual' | 'observed';
  /** 表示用の期間ラベル */
  periodLabel: string;
  /** 会期が終了しているか */
  ended: boolean;
  officialUrl?: string;
  venue: string;
};

function junShun(day: number): string {
  if (day <= 10) return '上旬';
  if (day <= 20) return '中旬';
  return '下旬';
}

/** '2026-08-08' → { m: 8, d: 8 } */
function parse(d: string) {
  const [y, m, day] = d.split('-').map(Number);
  return { y, m, d: day };
}

/** 「8月上旬〜中旬」「6月中旬〜7月上旬」のような、年に依存しない期間表現。 */
function seasonRange(e: EventEntry): string {
  const s = parse(e.startDate);
  const t = parse(e.endDate);
  if (s.m === t.m) {
    const a = junShun(s.d);
    const b = junShun(t.d);
    return a === b ? `${s.m}月${a}` : `${s.m}月${a}〜${b}`;
  }
  return `${s.m}月${junShun(s.d)}〜${t.m}月${junShun(t.d)}`;
}

/** 「2026年は8/8〜8/16」のような、実際に開催された事実の表現。 */
function actualRange(e: EventEntry): string {
  const s = parse(e.startDate);
  const t = parse(e.endDate);
  if (e.startDate === e.endDate) return `${s.y}年は${s.m}/${s.d}に開催`;
  return `${s.y}年は${s.m}/${s.d}〜${t.m}/${t.d}に開催`;
}

function classify(e: EventEntry): 'annual' | 'observed' | null {
  if (e.recurring === 'annual') return 'annual';
  if (e.category === 'matsuri') return 'annual';
  if (ANNUAL_STRONG_RE.test(e.title)) return 'annual';
  if (ANNUAL_WEAK_RE.test(e.title)) return 'observed';
  return null;
}

/** 会場名とスポット名の照合用に、揺れやすい記号・空白を落とす。 */
function norm(s: string): string {
  return s.replace(/[\s　（）()・,、.。]/g, '');
}

/**
 * 会場名がこのスポットを指しているか。
 * 誤マッチ（「上野公園」と「上野動物園」など）を避けるため、
 * 短すぎる一致は採らず、正規化後の包含関係だけを見る。
 */
function venueMatches(venue: string, spotName: string): boolean {
  const v = norm(venue);
  const n = norm(spotName);
  if (n.length < 4 || v.length < 4) return false;
  return v.includes(n) || n.includes(v);
}

/**
 * このスポットを会場とする「毎年ひらかれる（と言える）イベント」を返す。
 * 開催中のものと終了したものの両方を含む。終了しても消えないのがこの機能の要点。
 */
export function getVenueAnnualEvents(spotName: string, limit = 4): VenueAnnualEvent[] {
  const out: VenueAnnualEvent[] = [];
  for (const e of getAllEvents()) {
    if (!venueMatches(e.venue, spotName)) continue;
    const kind = classify(e);
    if (!kind) continue;
    const ended = isEventEnded(e);
    out.push({
      slug: e.slug,
      title: e.title,
      kind,
      ended,
      officialUrl: e.officialUrl,
      venue: e.venue,
      periodLabel:
        kind === 'annual'
          ? `毎年${seasonRange(e)}ごろ${ended ? `（${actualRange(e)}）` : '（今年は開催中）'}`
          : actualRange(e),
    });
  }
  // 開催中を先に、次に「毎年」と言い切れるものを優先
  out.sort((a, b) => {
    if (a.ended !== b.ended) return a.ended ? 1 : -1;
    if (a.kind !== b.kind) return a.kind === 'annual' ? -1 : 1;
    return a.title.localeCompare(b.title, 'ja');
  });
  return out.slice(0, limit);
}
