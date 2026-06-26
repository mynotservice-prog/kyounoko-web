/**
 * 人気スポットランキングの自動算出（/ranking ページのデータ源）。
 *
 * GA4 の「/spot/ 配下のページ別 PV」を実データとしてランキング化する。
 * 直近7日間の閲覧数が多い順にスポットを並べる。
 *
 * - GA4 が連携済み（GA4_PROPERTY_ID + Service Account）ならその実数で並べる。
 * - 未連携 or データ無しなら、編集部の popular フラグ付きスポットにフォールバック。
 *
 * エリア（都道府県）・年齢（0-1 / 2-3 / 4-6）でも絞り込める。
 */

import { getOutingSpotsWithSlug, type Spot, type AgeTag } from './spots';
import { getRuntimeSpotOverrides } from './spot-overrides';
import { getGa4TopPagesByPrefix } from './ga4';

/** 施設から提供された公式写真を持つか（override の image/images が入っている）。 */
function hasOfficialPhoto(s: Spot): boolean {
  return Boolean((s.images && s.images.length > 0) || s.image);
}
import { AREAS, type AreaSlug } from './area';

export type SpotRankItem = {
  rank: number;
  slug: string;
  area: string;
  spot: Spot;
  /** 直近7日のPV。フォールバック時は undefined */
  views?: number;
};

export type SpotRankOptions = {
  /** 都道府県 slug（未指定なら全国） */
  area?: string;
  /** 年齢タグで絞る（その年齢が ages に含まれるスポットのみ） */
  age?: AgeTag;
  limit?: number;
};

function matchesFilter(spot: Spot, opts: SpotRankOptions, area: string): boolean {
  if (opts.area && area !== opts.area) return false;
  if (opts.age && !spot.ages?.includes(opts.age)) return false;
  return true;
}

/**
 * 人気スポットランキングを返す。GA4 実数優先、未連携時は編集部キュレーションで補完。
 */
export async function getSpotRanking(opts: SpotRankOptions = {}): Promise<SpotRankItem[]> {
  const limit = opts.limit ?? 30;
  // 公式写真は override(KV/バンドル)に入るため、override をマージした spot で判定する。
  const ovMap = await getRuntimeSpotOverrides();
  const all = getOutingSpotsWithSlug(ovMap);
  const bySlug = new Map(all.map((x) => [x.slug, x]));

  const items: Array<{ slug: string; area: string; spot: Spot; views?: number }> = [];
  const used = new Set<string>();

  // 0) 施設から提供された公式写真があるスポットを最優先（画像が綺麗なので先頭に並べる）。
  //    写真が無い環境(KV未設定/未提供)では0件→従来のランキングにそのままフォールバック。
  const photoSpots = all
    .filter((x) => hasOfficialPhoto(x.spot) && !used.has(x.slug))
    .filter((x) => matchesFilter(x.spot, opts, x.area))
    .sort((a, b) => {
      if (a.spot.popular && !b.spot.popular) return -1;
      if (!a.spot.popular && b.spot.popular) return 1;
      return a.spot.name.localeCompare(b.spot.name, 'ja');
    });
  for (const p of photoSpots) {
    items.push({ slug: p.slug, area: p.area, spot: p.spot });
    used.add(p.slug);
    if (items.length >= limit) break;
  }

  // 1) GA4 実データ（/spot/ 配下のPVランキング）
  const ga4 = await getGa4TopPagesByPrefix('/spot/', 7, 200).catch(() => null);
  if (ga4) {
    for (const row of ga4) {
      // '/spot/<slug>' から slug を取り出す（クエリ・末尾スラッシュを除去）
      const m = row.pagePath.match(/^\/spot\/([^/?#]+)/);
      if (!m) continue;
      const slug = m[1];
      const entry = bySlug.get(slug);
      if (!entry || used.has(slug)) continue;
      if (!matchesFilter(entry.spot, opts, entry.area)) continue;
      items.push({ slug, area: entry.area, spot: entry.spot, views: row.pageViews });
      used.add(slug);
      if (items.length >= limit) break;
    }
  }

  // 2) 不足分は popular フラグのスポットで補完（GA4未連携でもここで埋まる）
  if (items.length < limit) {
    const curated = all
      .filter((x) => x.spot.popular && !used.has(x.slug))
      .filter((x) => matchesFilter(x.spot, opts, x.area))
      .sort((a, b) => a.spot.name.localeCompare(b.spot.name, 'ja'));
    for (const c of curated) {
      items.push({ slug: c.slug, area: c.area, spot: c.spot });
      used.add(c.slug);
      if (items.length >= limit) break;
    }
  }

  return items.map((it, i) => ({ rank: i + 1, ...it }));
}

/**
 * ランキングのエリアフィルタに出す都道府県 slug 一覧。
 * 一覧表示に値するスポット（popular か、十分な情報を持つもの）が存在する都道府県のみ、
 * AREAS の地理順で返す。
 */
export function getRankingAreas(): AreaSlug[] {
  const set = new Set<string>();
  for (const x of getOutingSpotsWithSlug()) {
    if (x.spot.popular) set.add(x.area);
  }
  return AREAS.map((a) => a.slug).filter(
    (slug): slug is AreaSlug => slug !== 'all' && set.has(slug),
  );
}
