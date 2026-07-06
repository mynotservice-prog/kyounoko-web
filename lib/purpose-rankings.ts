/**
 * 首都圏 × 目的別の「実用ランキング」（P1-2）。
 *
 * トップの「人気スポットランキング（全国ごちゃ混ぜ）」を、
 * 首都圏に絞った目的別ランキング（雨の日に強い屋内 / 無料で1日 / 0歳から）に置き換える。
 * 画像依存を下げ、実需（週末どうする？）に沿った導線にする狙い。
 */
import { getAllSpotsWithSlug, type Spot } from './spots';
import { isListableSpot } from './spot-browse';
import { SHUTOKEN } from './spot-filter';
import { getRuntimeSpotOverrides, type SpotOverridesMap } from './spot-overrides';

export type RankedSpot = { slug: string; spot: Spot };

export type PurposeRanking = {
  key: string;
  title: string;
  emoji: string;
  /** カテゴリ全件ページ等への「もっと見る」先 */
  moreHref: string;
  items: RankedSpot[];
};

/** 情報充実度スコア（同点は人気→充実度で安定ソート）。 */
function quality(s: Spot): number {
  let n = 0;
  if (s.note && s.note.length >= 25) n++;
  if (s.facilities && Object.keys(s.facilities).length >= 2) n++;
  if (s.pricing && Object.keys(s.pricing).length >= 1) n++;
  if (s.hiddenTip) n++;
  if (s.nearestStation) n++;
  return n;
}

function rank(
  pred: (s: Spot) => boolean,
  limit: number,
  ovMap?: SpotOverridesMap,
): RankedSpot[] {
  return getAllSpotsWithSlug(ovMap)
    .filter(
      (x) =>
        SHUTOKEN.includes(x.area as string) &&
        x.spot.category !== 'restaurant' &&
        isListableSpot(x.spot) &&
        pred(x.spot),
    )
    .sort((a, b) => {
      const p = (a.spot.popular ? 1 : 0) - (b.spot.popular ? 1 : 0);
      if (p !== 0) return -p;
      return quality(b.spot) - quality(a.spot);
    })
    .slice(0, limit)
    .map((x) => ({ slug: x.slug, spot: x.spot }));
}

export async function getPurposeRankings(limit = 10): Promise<PurposeRanking[]> {
  // admin アップロード画像(spot-overrides の images[0])を反映するため override を読み込む。
  // これを渡さないと、人気ランキング(getSpotRanking)では差し替わっている画像が
  // この目的別ランキングでは pickHero のシーン写真にフォールバックしてしまう。
  const ovMap = await getRuntimeSpotOverrides();
  return [
    {
      key: 'rainy-indoor',
      title: '雨の日に強い屋内スポット',
      emoji: '☔',
      moreHref: '/spots?area=shutoken&place=indoor',
      items: rank((s) => s.place === 'indoor', limit, ovMap),
    },
    {
      key: 'free',
      title: '無料で1日あそべる',
      emoji: '🎟',
      moreHref: '/spots?area=shutoken&price=free',
      items: rank((s) => s.budget === 'free', limit, ovMap),
    },
    {
      key: 'baby-ok',
      title: '0歳から楽しめる',
      emoji: '👶',
      moreHref: '/spots?area=shutoken&age=0-1',
      items: rank((s) => s.ages.includes('0-1'), limit, ovMap),
    },
  ].filter((r) => r.items.length > 0);
}
