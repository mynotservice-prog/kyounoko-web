/**
 * スポット情報の上書き層。
 *
 * lib/spots.ts はハードコードされた大量のスポット配列だが、その上に
 * 「個別 slug 単位で任意フィールドを上書き」できる仕組み。
 *
 * ⚠️ **本番の正は KV であって lib/spot-overrides.json ではない。**
 * getRuntimeSpotOverrides() が「KVがあれば JSON を無視する」ため、
 * **JSON を直してコミットしても本番の表示は変わらない**。
 * 2026-08-19 に実際に2件（舎人公園の会期・コレットマーレの授乳室の階）が空振りした。
 * KV が未設定の環境（ローカル開発）だけ JSON が使われる。
 *
 * そのため運用は2手順に分かれる:
 *   1. JSON を本番KVの写しに保つ … node scripts/sync-spot-overrides-from-kv.mjs
 *   2. JSON の編集を本番へ送る   … node scripts/push-spot-overrides-to-kv.mjs <slug>
 *      （images は既定で送らない。管理画面からアップした写真を消さないため）
 *
 * /admin/spots/edit からの編集は KV に直接書かれる（即時反映）。
 *
 * slug は元スポット（spots.ts の定義）から spotToSlug() で決定的に算出される。
 * override は slug をキーに「算出後」にマージされるため、施設名・市区町村を
 * 編集しても slug（= URL）は変わらない。リンク切れが起きない設計。
 *
 * 保存形式（slug → 上書きされたフィールドだけが入る部分オブジェクト）:
 *   {
 *     "rindo-eb58": {
 *       "note": "公式提供の最新情報に差し替え",
 *       "pricing": { "adult": "1,600円" },
 *       "facilities": { "nursingRoom": "yes" }
 *     }
 *   }
 *
 * 注意:
 *  - 本ファイルは Server Component / API route から使う。
 *  - 編集は /api/admin/spot-overrides の POST 経由でのみ可能。
 */

import { unstable_cache } from 'next/cache';
import overridesJson from './spot-overrides.json';
import type { Spot } from './spots';
import {
  isKvConfigured,
  kvDel,
  kvGetForCache,
  kvGetStrict,
  kvHDel,
  kvHGetAllForCache,
  kvHGetAllStrict,
  kvHGetStrict,
  kvHSet,
  kvSet,
  logOverridesCacheMiss,
} from './kv-store';

/** 上書き可能なトップレベルのフィールド（文字列/enum）。 */
export const SPOT_TEXT_FIELDS = [
  'name',
  'city',
  'ward',
  'note',
  'budget',
  'reservation',
  'hiddenTip',
  'crowdTips',
  'accessTips',
  'nearby',
  'waterDepth',
  'image',
] as const;
export type SpotTextField = (typeof SPOT_TEXT_FIELDS)[number];

/** pricing サブオブジェクトの編集可能キー。 */
export const SPOT_PRICING_FIELDS = ['adult', 'elementary', 'preschool', 'infant'] as const;
export type SpotPricingField = (typeof SPOT_PRICING_FIELDS)[number];

/** facilities サブオブジェクトの編集可能キー（note 以外は yes/no enum）。 */
export const SPOT_FACILITY_ENUM_FIELDS = [
  'bathroom',
  'diaperChange',
  'nursingRoom',
  'kidsSpace',
  'strollerRental',
] as const;
export type SpotFacilityEnumField = (typeof SPOT_FACILITY_ENUM_FIELDS)[number];

/** ageGuide サブオブジェクトの編集可能キー（AgeTag）。 */
export const SPOT_AGE_GUIDE_FIELDS = ['0-1', '2-3', '4-6'] as const;
export type SpotAgeGuideField = (typeof SPOT_AGE_GUIDE_FIELDS)[number];

/** 上書き可能なカテゴリ（lib/spots.ts の SpotCategory と一致させる）。 */
export const SPOT_CATEGORY_VALUES = [
  'zoo', 'aquarium', 'park', 'museum', 'amusement', 'indoor', 'farm', 'harvest', 'seasonal', 'restaurant',
] as const;

/** 上書き可能な屋内/屋外区分（SpotPlace と一致）。 */
export const SPOT_PLACE_VALUES = ['indoor', 'outdoor', 'mixed'] as const;

/** 上書き可能な対象年齢タグ（AgeTag と一致）。 */
export const SPOT_AGE_VALUES = ['0-1', '2-3', '4-6'] as const;

/** 上書きとして保存できる Spot の部分形。 */
export type SpotOverride = Partial<
  Pick<Spot, 'name' | 'city' | 'ward' | 'note' | 'budget' | 'reservation' | 'hiddenTip' | 'crowdTips' | 'accessTips' | 'nearby' | 'waterDepth' | 'image' | 'images' | 'pricing' | 'facilities' | 'ageGuide' | 'category' | 'place' | 'ages' | 'faq' | 'faqComplete' | 'nearbySlugs'>
>;

export type SpotOverridesMap = Record<string, SpotOverride>;

/** ビルド時にバンドルされる上書き（KV未設定時のフォールバック兼・初期シード）。 */
export const BUNDLED_SPOT_OVERRIDES = overridesJson as SpotOverridesMap;

/** KV のキー。 */
export const SPOT_OVERRIDES_KV_KEY = 'spot:overrides';
/** revalidateTag 用。保存時にこのタグを revalidate するとページが最新を読む。 */
export const SPOT_OVERRIDES_TAG = 'spot-overrides';

/** slug の上書き内容を取得（無ければ null）。同期・バンドル版（後方互換）。 */
export function getSpotOverride(slug: string): SpotOverride | null {
  return BUNDLED_SPOT_OVERRIDES[slug] ?? null;
}

/** 全 overrides を取得（同期・バンドル版）。 */
export function getAllSpotOverrides(): SpotOverridesMap {
  return BUNDLED_SPOT_OVERRIDES;
}

/**
 * 元スポット + override をマージして 1 件返す。
 * pricing / facilities はネストしたサブオブジェクトを浅くマージする
 * （adult だけ上書き、他は元の値を維持できるように）。
 *
 * ovMap を渡すと実行時 override（KV由来）でマージできる。省略時はバンドル版。
 */
export function mergeSpot(spot: Spot, slug: string, ovMap: SpotOverridesMap = BUNDLED_SPOT_OVERRIDES): Spot {
  const ov = ovMap[slug];
  if (!ov) return spot;
  const merged: Spot = { ...spot, ...ov };
  if (ov.pricing) merged.pricing = { ...spot.pricing, ...ov.pricing };
  if (ov.facilities) merged.facilities = { ...spot.facilities, ...ov.facilities };
  if (ov.ageGuide) merged.ageGuide = { ...spot.ageGuide, ...ov.ageGuide };
  return merged;
}

// ── KV 上の持ち方 ────────────────────────────────────────────────
// 旧: `spot:overrides` に全スポット分を1つの JSON で保存（2026-10 時点で 2.8MB）。
//     データキャッシュは1件 2MB までなので unstable_cache に保存できず、実行時に毎回 KV から
//     丸ごと読んでいた（1日 10〜15GB の転送）。
// 新: slug のハッシュで SPOT_OV_SHARDS 個の Redis Hash（`spot:ov:<n>`、field = slug）に分ける。
//     読み込みは Hash 単位でキャッシュ（1件あたり全体の 1/8）、保存は該当 slug の field だけ。
// `spot:ov:meta` があれば新、無ければ旧を読む。移行は POST /api/admin/spot-overrides/migrate。
// 旧キーは移行後も消さない（戻すときは meta を消して revalidate）。

/** Hash の数。変えるときは全件の移し替えが要る（meta.shards と照合している）。 */
export const SPOT_OV_SHARDS = 8;
const SPOT_OV_META_KEY = 'spot:ov:meta';
type SpotOvMeta = { shards: number; migratedAt: string; count: number };

export function spotOvShardKey(n: number): string {
  return `spot:ov:${n}`;
}
function shardTag(n: number): string {
  return `${SPOT_OVERRIDES_TAG}:${n}`;
}

/** slug → Hash 番号（FNV-1a。実行環境によらず同じ値になること）。 */
export function spotOvShardOf(slug: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % SPOT_OV_SHARDS;
}

function isSplitMeta(meta: SpotOvMeta | null): boolean {
  return !!meta && meta.shards === SPOT_OV_SHARDS;
}

const getCachedSplitReady = unstable_cache(
  async (): Promise<boolean> => isSplitMeta(await kvGetForCache<SpotOvMeta>(SPOT_OV_META_KEY)),
  ['runtime-spot-overrides-meta'],
  { tags: [SPOT_OVERRIDES_TAG] },
);

const getCachedShard = Array.from({ length: SPOT_OV_SHARDS }, (_, n) =>
  unstable_cache(
    async (): Promise<SpotOverridesMap> => {
      const map = (await kvHGetAllForCache<SpotOverride>(spotOvShardKey(n))) ?? {};
      logOverridesCacheMiss(spotOvShardKey(n), map);
      return map;
    },
    ['runtime-spot-overrides-shard', String(n)],
    { tags: [SPOT_OVERRIDES_TAG, shardTag(n)] },
  ),
);

/** 旧キー（1つの JSON）を読む。移行前だけ使う。 */
const getCachedLegacySpotOverrides = unstable_cache(
  async (): Promise<SpotOverridesMap> => {
    const fromKv = await kvGetForCache<SpotOverridesMap>(SPOT_OVERRIDES_KV_KEY);
    if (fromKv) {
      logOverridesCacheMiss(SPOT_OVERRIDES_KV_KEY, fromKv);
      return fromKv;
    }
    return BUNDLED_SPOT_OVERRIDES;
  },
  ['runtime-spot-overrides'],
  { tags: [SPOT_OVERRIDES_TAG] },
);

/**
 * 実行時の override マップを取得。
 * - KV 設定済み: KV から読む（移行済みなら Hash、まだなら旧キー。どちらも無ければバンドル）
 * - 未設定: バンドルJSON
 * unstable_cache でタグ付きキャッシュし、保存時に revalidateTag で更新する。
 * KV の読み込み失敗はキャッシュの外でバンドルに落とす（失敗時の値をキャッシュに残さない）。
 */
export async function getRuntimeSpotOverrides(): Promise<SpotOverridesMap> {
  if (!isKvConfigured()) return BUNDLED_SPOT_OVERRIDES;
  try {
    if (!(await getCachedSplitReady())) return await getCachedLegacySpotOverrides();
    const parts = await Promise.all(getCachedShard.map((get) => get()));
    return Object.assign({}, ...parts) as SpotOverridesMap;
  } catch (e) {
    console.error('[spot-overrides] fallback to bundle:', e instanceof Error ? e.message : e);
    return BUNDLED_SPOT_OVERRIDES;
  }
}

/** いま KV が Hash 持ちか（保存・移行用。キャッシュを通さない）。読めなければ例外。 */
async function readSplitReadyStrict(): Promise<boolean> {
  const r = await kvGetStrict<SpotOvMeta>(SPOT_OV_META_KEY);
  if (!r.ok) throw new Error(`KV read failed: ${r.error}`);
  return isSplitMeta(r.value);
}

async function readAllShardsStrict(): Promise<SpotOverridesMap> {
  const parts = await Promise.all(
    Array.from({ length: SPOT_OV_SHARDS }, async (_, n) => {
      const r = await kvHGetAllStrict<SpotOverride>(spotOvShardKey(n));
      if (!r.ok) throw new Error(`KV read failed: ${r.error}`);
      return r.value ?? {};
    }),
  );
  return Object.assign({}, ...parts) as SpotOverridesMap;
}

/**
 * 保存用に「現在の全 override」を取得（キャッシュを通さない直読み）。
 * KV が空ならバンドルをシードとして使う（初回保存で他の上書きが消えないように）。
 */
export async function readSpotOverridesForWrite(): Promise<SpotOverridesMap> {
  if (isKvConfigured()) {
    // 読み込み失敗時にバンドルで代用すると、保存でKV上の編集内容が古いバンドルに置き換わる。
    // 失敗は例外にして保存を止める（キーが無いときだけバンドルをシードにする）。
    if (await readSplitReadyStrict()) return readAllShardsStrict();
    const r = await kvGetStrict<SpotOverridesMap>(SPOT_OVERRIDES_KV_KEY);
    if (!r.ok) throw new Error(`KV read failed: ${r.error}`);
    return r.value ?? { ...BUNDLED_SPOT_OVERRIDES };
  }
  return { ...BUNDLED_SPOT_OVERRIDES };
}

/**
 * 1スポット分の上書きを保存する（KV 設定時のみ）。`update` は現在の値（無ければ null）を受けて
 * 保存する値を返す。null を返すとその slug の上書きを消す。
 * Hash 持ちなら該当 slug の field だけを読み書きし、旧キーなら従来どおり全体を書き戻す。
 * 読めないときは例外（読めないまま保存すると他の上書きを消すため）。
 * 戻り値は書き込みの成否と、保存後に revalidate するタグ（Hash 持ちなら該当 slug の入った Hash だけ）。
 */
export async function saveSpotOverrideToKv(
  slug: string,
  update: (current: SpotOverride | null) => SpotOverride | null,
): Promise<{ ok: boolean; tag: string }> {
  if (await readSplitReadyStrict()) {
    const n = spotOvShardOf(slug);
    const key = spotOvShardKey(n);
    const r = await kvHGetStrict<SpotOverride>(key, slug);
    if (!r.ok) throw new Error(`KV read failed: ${r.error}`);
    const next = update(r.value);
    return { ok: await (next ? kvHSet(key, { [slug]: next }) : kvHDel(key, slug)), tag: shardTag(n) };
  }
  const all = await readSpotOverridesForWrite();
  const next = update(all[slug] ?? null);
  if (next) all[slug] = next;
  else delete all[slug];
  return { ok: await kvSet(SPOT_OVERRIDES_KV_KEY, all), tag: SPOT_OVERRIDES_TAG };
}

/**
 * 旧キー → Hash への移し替え。旧キーは読むだけで変更しない。
 * 書いたあと全 Hash を読み直し、旧キーと1件ずつ一致したときだけ meta を書いて切り替える。
 * すでに Hash 持ちのときは何もしない（移行後の編集を旧キーの内容で潰さないため）。
 */
export async function migrateSpotOverridesToHash(): Promise<
  { ok: true; already: boolean; count: number; perShard: number[] } | { ok: false; error: string }
> {
  if (await readSplitReadyStrict()) {
    const now = await readAllShardsStrict();
    return { ok: true, already: true, count: Object.keys(now).length, perShard: [] };
  }
  const legacy = await kvGetStrict<SpotOverridesMap>(SPOT_OVERRIDES_KV_KEY);
  if (!legacy.ok) return { ok: false, error: `KV read failed: ${legacy.error}` };
  if (!legacy.value) return { ok: false, error: '旧キー spot:overrides がありません' };

  const shards: SpotOverridesMap[] = Array.from({ length: SPOT_OV_SHARDS }, () => ({}));
  for (const [slug, ov] of Object.entries(legacy.value)) shards[spotOvShardOf(slug)][slug] = ov;

  for (let n = 0; n < SPOT_OV_SHARDS; n++) {
    // 途中で失敗した前回の残りを消してから書く
    if (!(await kvDel(spotOvShardKey(n)))) return { ok: false, error: `del failed: shard ${n}` };
    if (Object.keys(shards[n]).length === 0) continue;
    if (!(await kvHSet(spotOvShardKey(n), shards[n]))) return { ok: false, error: `hset failed: shard ${n}` };
  }

  const written = await readAllShardsStrict();
  const slugs = Object.keys(legacy.value);
  if (Object.keys(written).length !== slugs.length) {
    return { ok: false, error: `件数が一致しません（旧 ${slugs.length} / 新 ${Object.keys(written).length}）` };
  }
  const diff = slugs.filter((s) => JSON.stringify(written[s]) !== JSON.stringify(legacy.value![s]));
  if (diff.length > 0) return { ok: false, error: `内容が一致しません: ${diff.slice(0, 5).join(', ')}` };

  const meta: SpotOvMeta = { shards: SPOT_OV_SHARDS, migratedAt: new Date().toISOString(), count: slugs.length };
  if (!(await kvSet(SPOT_OV_META_KEY, meta))) return { ok: false, error: 'meta の書き込みに失敗' };
  return { ok: true, already: false, count: slugs.length, perShard: shards.map((m) => Object.keys(m).length) };
}
