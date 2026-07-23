/**
 * 本番データ → /v2 デザインのカード型へのアダプタ。
 *
 * 既存の lib/spots.ts, lib/articles.ts, lib/feature-pages.ts などのデータ構造を
 * components/v2/V2Cards.tsx の表示型（V2Spot, V2Article, V2Feature）に変換する。
 *
 * このファイルだけが「既存型 ⇄ V2型」の境界を持つ。本番ページからはこの関数経由で
 * データを引いてくることで、既存 lib の型変更に強い構造にしてある。
 */

import type {
  V2Article,
  V2Feature,
  V2Spot,
} from '@/components/v2/V2Cards';
import type { Spot } from './spots';
import { findStationBySlug } from './all-stations';
import type { FeaturePage } from './feature-pages';
import type { FileArticleMeta } from './articles';

/** 既存 SpotCategory（zoo/aquarium/park等）の日本語ラベル */
const CAT_LABEL: Record<string, string> = {
  zoo: '動物園',
  aquarium: '水族館',
  park: '公園',
  museum: '博物館',
  amusement: 'テーマパーク',
  indoor: '室内あそび場',
  farm: '牧場',
  seasonal: '季節体験',
  restaurant: 'レストラン',
};

/**
 * カテゴリ → public/hero-ai/cat-*.webp の prefix リスト。
 * 各 prefix は 01/02/03 の3枚揃いがあるので、spot.name のハッシュで決定的に1枚選ぶ。
 * これで同じカテゴリでもスポット名ごとに画像が変わる。
 */
const HERO_POOLS_BY_CAT: Record<string, string[]> = {
  zoo:        ['cat-outdoor', 'cat-nature', 'cat-kid'],
  aquarium:   ['cat-family', 'cat-kid', 'cat-parent'],
  park:       ['cat-park', 'cat-outdoor', 'cat-nature'],
  museum:     ['cat-classroom', 'cat-kid', 'cat-screen'],
  amusement:  ['cat-outdoor', 'cat-tokyo', 'cat-kid'],
  indoor:     ['cat-home', 'cat-kid', 'cat-toddler'],
  farm:       ['cat-nature', 'cat-outdoor'],
  seasonal:   ['cat-summer', 'cat-autumn', 'cat-sakura'],
  restaurant: ['cat-food', 'cat-family', 'cat-commerce'],
};

/** spot.name の文字コード合計をハッシュとして簡易計算 */
function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * 主要施設の hero 画像マッピング（部分一致キーワード）。
 * spot.name に左側のキーワードが含まれていれば、対応する固有 hero 画像を返す。
 * 順番が早いほど優先（特定度が高い順）。
 *
 * v7（2026-06-13）方針:
 *   - 公共施設（葛西/美ら海/サンシャイン水族館/池袋）は Wikimedia Commons の
 *     自由ライセンス実写画像（/img/facilities/）に差し替え。
 *     クレジット: public/img/facilities/_credits.json 参照、サイト側 /credits で表示。
 *   - 商標リスク強の施設（ディズニー/アンパンマン/キッザニア/レゴランド/富士急/富士サファリ）は
 *     CC画像でもブランド要素を含むと商用利用にリスクがあるため、施設タイプを表す
 *     汎用シーン写真へマップ（park / aquarium / zoo / indoor-play 等）。
 *   - 遊具・地域系（ふわふわ/ロング滑り台/練馬/上野）は park / outing-general へ。
 */
const KEYWORD_HERO_MAP: Array<[string, string]> = [
  // 公共施設（CC実写写真・/img/facilities/）
  ['美ら海', '/img/facilities/churaumi-aquarium.webp'],
  ['葛西臨海水族園', '/img/facilities/kasai-aquarium.webp'],
  ['葛西臨海公園', '/img/facilities/kasai-park.webp'],
  ['葛西', '/img/facilities/kasai-aquarium.webp'],
  ['サンシャイン水族館', '/img/facilities/sunshine-aquarium.webp'],
  ['サンシャイン', '/img/facilities/sunshine-aquarium.webp'],
  ['イケ・サンパーク', '/img/facilities/ikebukuro-sunpark.webp'],
  ['イケサンパーク', '/img/facilities/ikebukuro-sunpark.webp'],

  // 商標リスク強 → 施設タイプの汎用シーンへ（KK プールへ振り分けないよう明示マップ）
  ['ディズニーシー', '/img/scenes/outing-general-01.webp'],
  ['ディズニーランド', '/img/scenes/outing-general-02.webp'],
  ['ディズニー', '/img/scenes/outing-general-03.webp'],
  ['キッザニア', '/img/scenes/indoor-play-01.webp'],
  ['アンパンマン', '/img/scenes/indoor-play-02.webp'],
  ['富士急', '/img/scenes/outing-general-04.webp'],
  ['富士サファリ', '/img/scenes/zoo-01.webp'],
  ['サファリ', '/img/scenes/zoo-02.webp'],
  ['レゴランド', '/img/scenes/indoor-play-03.webp'],

  // 遊具・地域系 → 該当タイプの汎用シーン
  ['ふわふわ', '/img/scenes/park-01.webp'],
  ['ロング滑り台', '/img/scenes/park-02.webp'],
  ['ロングすべり台', '/img/scenes/park-02.webp'],
  ['ジャンボ滑り台', '/img/scenes/park-03.webp'],
  ['練馬', '/img/scenes/park-04.webp'],
  ['上野', '/img/scenes/outing-general-05.webp'],
  ['池袋', '/img/facilities/ikebukuro-sunpark.webp'],
  ['豊島', '/img/facilities/ikebukuro-sunpark.webp'],
];

/**
 * 支給 KK プール（ユーザー提供画像、~/Desktop/kyounokoimegegazo/ を webp化）。
 * 45枚あり、ハッシュで決定的に選択。記事/スポット/プラン/特集の hero
 * フォールバックとして優先的に使う。重複OK。
 */
export const KK_POOL_SIZE = 45;
export function kkHero(seed: string): string {
  const h = hashName(seed);
  const n = (h % KK_POOL_SIZE) + 1;
  // 2026-06-12: CDN(Cloudflare)の7日キャッシュに旧不良画像が残るため /img/kk/ へ移設
  return `/img/kk/kk-${String(n).padStart(2, '0')}.webp`;
}
/**
 * カテゴリ → 支給E系（スポットカテゴリ別の代表写真）。
 * KEYWORD_HERO_MAP の固有施設にヒットしない/spot.name が無名な汎用スポットで、
 * かつ idx >= 3（カードの後ろ側）の場合に "繰り返し感" を出さないために使う。
 */
const CATEGORY_HERO_E: Record<string, string> = {
  aquarium: '/v2/spot-categories/aquarium-family.webp',
  zoo: '/v2/spot-categories/zoo-family.webp',
  park: '/v2/spot-categories/park-family.webp',
  indoor: '/v2/spot-categories/indoor-playground.webp',
  museum: '/v2/spot-categories/museum-kids.webp',
  amusement: '/v2/spot-categories/indoor-playground.webp',
  farm: '/v2/spot-categories/zoo-family.webp',
  seasonal: '/v2/spot-categories/park-family.webp',
  restaurant: '/v2/spot-categories/indoor-playground.webp',
};

/** /img/scenes/<scene>-NN.webp の連番プールを生成（2026-06 新シーン画像） */
function scenePool(scene: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) => `/img/scenes/${scene}-${String(i + 1).padStart(2, '0')}.webp`,
  );
}

/**
 * スポットカテゴリ → シーン画像プール（2026-06-12 追加）。
 * 188枚の新シーン画像をカテゴリごとに割り当て、ハッシュで決定的に選ぶ。
 * 旧来の「カテゴリ代表1枚（CATEGORY_HERO_E）」より繰り返し感が大幅に減る。
 */
const SCENE_POOLS_BY_CAT: Record<string, string[]> = {
  zoo: scenePool('zoo', 5),
  aquarium: scenePool('aquarium', 4),
  park: scenePool('park', 16),
  museum: scenePool('indoor-play', 6),
  amusement: [...scenePool('indoor-play', 6), ...scenePool('park', 16)],
  indoor: scenePool('indoor-play', 6),
  farm: [...scenePool('zoo', 5), ...scenePool('park', 16)],
  seasonal: [...scenePool('pool-water', 20), ...scenePool('seasonal', 4)],
  restaurant: scenePool('meal', 40),
};

/** SCENE_POOLS_BY_CAT 未カバー時の汎用シーンプール（v6: hero-ai落下を廃止） */
const FALLBACK_SCENE_POOL: string[] = [
  ...scenePool('outing-general', 16),
  ...scenePool('park', 16),
  ...scenePool('indoor-play', 6),
];

/** カテゴリと spot.name から hero 画像パスを決定的に選ぶ */
function pickHero(category: string, name: string): string {
  // 1) キーワード一致で施設固有画像があればそれを優先（ディズニー/葛西水族館 等）
  //    これらは固有性が高いイラストのため実写統一の例外として残す。
  for (const [kw, img] of KEYWORD_HERO_MAP) {
    if (name.includes(kw)) return img;
  }
  // 2) ハッシュ % 3 == 0 なら支給 KK プール（高品質ユーザー画像）
  const h = hashName(name);
  if (h % 3 === 0) {
    return kkHero(name);
  }
  // 3) 新シーン画像プールからハッシュで決定的に選択（2026-06-12〜）
  const sp = SCENE_POOLS_BY_CAT[category];
  if (sp?.length) {
    return sp[h % sp.length];
  }
  // 4) v6（2026-06-13）: 旧 hero-ai イラストフォールバックを廃止し、
  //    汎用シーンプール（outing-general/park/indoor-play）から決定的に選択。
  return FALLBACK_SCENE_POOL[h % FALLBACK_SCENE_POOL.length];
}

/** Spot.facilities/place/ages からタグ配列を組み立てる */
function buildSpotTags(s: Spot): { t: string; k?: '' | 'age' | 'rain' | 'feat' }[] {
  const tags: { t: string; k?: '' | 'age' | 'rain' | 'feat' }[] = [];
  // 年齢
  if (s.ages?.length) {
    const ageLabel = s.ages.includes('0-1') ? '0〜6歳' : s.ages.includes('2-3') ? '2〜6歳' : '4〜6歳';
    tags.push({ t: ageLabel, k: 'age' });
  }
  // 雨/室内
  if (s.place === 'indoor' || s.place === 'mixed') {
    tags.push({ t: '雨OK', k: 'rain' });
  } else if (s.place === 'outdoor') {
    tags.push({ t: '屋外', k: '' });
  }
  // 設備
  if (s.facilities?.strollerRental === 'yes') {
    tags.push({ t: 'ベビーカー貸出', k: '' });
  } else if (s.facilities?.diaperChange === 'yes' || s.facilities?.nursingRoom === 'yes') {
    tags.push({ t: '授乳室あり', k: '' });
  }
  // 公園遊具特典
  if (!tags.length && s.playgroundFeatures?.length) {
    tags.push({ t: 'アスレチック', k: '' });
  }
  return tags.slice(0, 3);
}

/** 駅情報を station 表示文字列に整形 */
function spotStation(s: Spot): string {
  if (s.walkMinutes && s.nearestStation) {
    // nearestStation は駅マスタの slug（例: 'hibiya'）の場合がある。日本語駅名に解決して表示を統一する
    // （詳細ページの nearestStationName と同じ流儀。マスタ未収載ならそのまま表示）。
    const st = findStationBySlug(s.nearestStation)?.name;
    return `${st ? `${st}駅` : s.nearestStation} 徒歩${s.walkMinutes}分`;
  }
  return s.city || s.ward || '';
}

/**
 * Spot を V2Spot へ変換。
 * spotIdMap: 同名スポット重複対策。同じ name のものに連番を振る。
 */
export function spotToV2(s: Spot, idx?: number): V2Spot {
  return {
    id: spotIdFromName(s.name, idx),
    name: s.name,
    cat: CAT_LABEL[s.category] || s.category,
    area: s.ward || s.city || '',
    station: spotStation(s),
    age:
      s.ages?.includes('0-1')
        ? '0〜6歳'
        : s.ages?.includes('2-3')
        ? '2〜6歳'
        : '4〜6歳',
    img: s.images?.[0] || s.image || pickHero(s.category, s.name),
    price:
      s.budget === 'free'
        ? '無料'
        : s.budget === 'low'
        ? '1,000円以下'
        : s.budget === 'mid'
        ? '1,000〜3,000円'
        : s.budget === 'high'
        ? '3,000円〜'
        : undefined,
    tags: buildSpotTags(s),
    desc: s.note,
  };
}

/** スポット名から slug を作る（同名対策に idx を付与） */
export function spotIdFromName(name: string, idx?: number): string {
  const base = name
    .replace(/[（）()【】「」『』]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
  return idx != null ? `${base}-${idx}` : base;
}

/**
 * 特集 → 季節バナー（支給F系）。themeTags や title から季節を推測。
 * 季節指定がない特集は null（既存hero を使う）。
 */
export function featureSeasonBanner(f: FeaturePage): string | null {
  const allText = `${f.title} ${f.lede ?? ''} ${(f.themeTags ?? []).join(' ')} ${f.slug}`;
  if (/春|入園|入学|花見|sakura|spring/i.test(allText)) return '/v2/seasons/spring-banner.webp';
  if (/夏|水遊び|熱中症|プール|summer/i.test(allText)) return '/v2/seasons/summer-banner.webp';
  if (/秋|紅葉|ハロウィン|運動会|autumn/i.test(allText)) return '/v2/seasons/autumn-banner.webp';
  if (/冬|イルミ|クリスマス|雪|winter/i.test(allText)) return '/v2/seasons/winter-banner.webp';
  return null;
}

/** FeaturePage を V2Feature に */
export function featureToV2(f: FeaturePage): V2Feature {
  const accent =
    f.slug.includes('rain') ? 'rain'
    : f.slug.includes('free') ? 'free'
    : f.slug.includes('baby') ? 'event'
    : f.slug.includes('lunch') ? 'lunch'
    : 'rain';
  const icon =
    f.slug.includes('rain') ? 'umbrella'
    : f.slug.includes('free') ? 'free'
    : f.slug.includes('baby') ? 'baby'
    : 'fork';
  // 季節バナーが該当すれば優先、なければ既存hero、それも無ければデフォルト
  const seasonImg = featureSeasonBanner(f);
  return {
    id: f.slug,
    title: f.title,
    short: f.title.length > 18 ? f.title.slice(0, 18) + '…' : f.title,
    sub: f.lede,
    icon,
    accent,
    img: seasonImg || f.hero || kkHero('feat-' + f.slug),
    desc: f.intro,
    lead: f.lede,
    tags: f.themeTags?.slice(0, 3),
  };
}

/** 静的記事を V2Article に */
export function articleToV2(a: FileArticleMeta): V2Article {
  return {
    id: a.slug,
    title: a.title,
    img: a.hero || kkHero('art-' + a.slug),
    sub: a.lede?.slice(0, 60),
    tags: [
      ...(a.quickInfo?.ageRanges?.length
        ? [
            a.quickInfo.ageRanges.includes('0-1')
              ? '0〜1歳'
              : a.quickInfo.ageRanges.includes('2-3')
              ? '2〜3歳'
              : '4〜6歳',
          ]
        : []),
      ...(a.quickInfo?.weather?.includes('rain') ? ['雨の日'] : []),
      ...(a.quickInfo?.place?.includes('home')
        ? ['家遊び']
        : a.quickInfo?.place?.includes('indoor')
        ? ['室内']
        : []),
    ].slice(0, 3),
  };
}
