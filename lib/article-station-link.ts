/**
 * 記事タイトル・本文から関連する駅・路線を推定して、駅ページへのリンクを生成する。
 *
 * 例:
 *  - 「池袋 雨の日の屋内遊び場」→ /station/ikebukuro/rainy
 *  - 「渋谷 子連れランチ」→ /station/shibuya
 *  - 「目黒区 ランチ」→ /station の区別ナビ
 *
 * 完全な店舗マッピングは別途駅ページが担うので、ここは軽量な「駅検出」のみ。
 */

import { TOKYO_STATIONS, type TokyoStation } from './tokyo-stations';
import { getStationWithChains } from './station-restaurants';
import { getIndieRestaurantsByStation } from './indie-restaurants';
import { filterChainsByCondition, filterIndiesByCondition } from './station-conditions';
import { isStationConditionIndexable } from './station-cond-index';

/** 駅検出結果。 */
export type DetectedStationLink = {
  station: TokyoStation;
  /** 条件付きリンクが取れる場合は指定（雨の日記事なら rainy など）。 */
  condition?: 'rainy' | 'private-room' | 'baby' | 'indie';
  /** 最終的な遷移先URL。 */
  href: string;
  /** UI表示用のラベル。 */
  label: string;
};

/**
 * タイトル・本文・metaDescriptionから23区内の駅名を検索し、最初にマッチした駅を返す。
 * - 漢字一致を優先し、ヒットしなければカナ
 * - 同じ駅が複数あればscaleがterminal>major>minorの順で優先
 */
export function detectStationFromText(text: string): TokyoStation | undefined {
  if (!text) return undefined;

  // ターミナル→主要→一般 の順でスキャン
  const ordered = [...TOKYO_STATIONS].sort((a, b) => {
    const rank = { terminal: 3, major: 2, minor: 1 };
    return (rank[b.scale] ?? 0) - (rank[a.scale] ?? 0);
  });

  for (const s of ordered) {
    // 「XX駅」「XX周辺」「XXエリア」 + 単独の駅名 で検出
    if (text.includes(`${s.name}駅`) || text.includes(`${s.name}周辺`) || text.includes(`${s.name}エリア`)) {
      return s;
    }
  }
  // 弱い一致（駅名だけ含まれる）
  for (const s of ordered) {
    if (s.name.length >= 2 && text.includes(s.name)) {
      return s;
    }
  }
  return undefined;
}

/**
 * 記事フロントマターから条件タイプ（雨の日・個室など）を推定。
 * weather/place 等の quickInfo を見て決める。
 */
type QuickInfoLike = {
  place?: string[];
  weather?: string[];
  ageRanges?: string[];
};
export function detectConditionFromQuickInfo(qi?: QuickInfoLike): DetectedStationLink['condition'] | undefined {
  if (!qi) return undefined;
  if (qi.weather?.includes('rain')) return 'rainy';
  if (qi.ageRanges?.some((a) => a === '0-1')) return 'baby';
  // place=indoor は雨の日扱いで rainy を優先
  if (qi.place?.includes('indoor')) return 'rainy';
  return undefined;
}

/**
 * 記事タイトル＋本文＋quickInfoから、駅CTAリンクを生成する。
 * 駅が検出できなければ undefined（その場合は汎用的に /station へ誘導）。
 */
export function buildStationLinkForArticle(args: {
  title?: string;
  metaDescription?: string;
  body?: string;
  quickInfo?: QuickInfoLike;
}): DetectedStationLink | undefined {
  const text = [args.title ?? '', args.metaDescription ?? '', args.body ?? ''].join('\n');
  const station = detectStationFromText(text);
  if (!station) return undefined;

  let condition = detectConditionFromQuickInfo(args.quickInfo);
  // 薄ページ剪定(2026-07)で noindex combo は 404 になったため、
  // 配信対象（indexable）でない条件ページへは飛ばさず駅トップへフォールバック。
  if (condition) {
    const chains = getStationWithChains(station.slug)?.chains ?? [];
    const indies = getIndieRestaurantsByStation(station.slug);
    const matched =
      filterChainsByCondition(chains, condition).length +
      filterIndiesByCondition(indies, condition).length;
    if (!isStationConditionIndexable(station.slug, condition, matched, 'restaurant', station.scale)) {
      condition = undefined;
    }
  }
  const href = condition
    ? `/station/${station.slug}/${condition}`
    : `/station/${station.slug}`;

  const condLabel: Record<NonNullable<DetectedStationLink['condition']>, string> = {
    rainy: '雨の日',
    'private-room': '個室・座敷',
    baby: '0-1歳向け',
    indie: '個人店',
  };
  const label = condition
    ? `${station.name}駅の${condLabel[condition]}子連れOK店をもっと見る`
    : `${station.name}駅の子連れOK店をもっと見る`;

  return { station, condition, href, label };
}
