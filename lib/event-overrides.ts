/**
 * イベント情報の上書き層。
 *
 * lib/events.ts はハードコードされた 100 件のイベント配列だが、その上に
 * 「lib/event-overrides.json で個別 slug 単位で任意フィールドを上書き」できる
 * 仕組み。/admin/events/edit から編集すると JSON が GitHub commit され、
 * Vercel が自動デプロイで本番に反映される。
 *
 * 保存形式（slug → 上書きされたフィールドだけが入る部分オブジェクト）:
 *   {
 *     "hogwarts-syoutaijou-tokyo-2026": {
 *       "title": "ホグワーツからの招待状 in 東京",
 *       "hero": "/v2/articles/kk-12.webp",
 *       "venue": "ワーナー ブラザース スタジオツアー東京"
 *     },
 *     ...
 *   }
 *
 * 注意:
 *  - 本ファイルは Server Component / API route から使う。
 *  - クライアントから直接 import すると JSON 全体がバンドルされるので NG。
 *  - 編集は /api/admin/event-overrides の POST 経由でのみ可能。
 */

import { unstable_cache } from 'next/cache';
import overridesJson from './event-overrides.json';
import type { EventEntry } from './events';
import { isKvConfigured, kvGet, kvSet } from './kv-store';

/** 上書き可能なフィールドのサブセット（id 系は不変） */
export type EventOverride = Partial<
  Pick<
    EventEntry,
    | 'title'
    | 'lede'
    | 'category'
    | 'startDate'
    | 'endDate'
    | 'venue'
    | 'area'
    | 'city'
    | 'ageLabel'
    | 'price'
    | 'officialUrl'
    | 'hero'
    | 'tags'
    | 'note'
  >
>;

export type EventOverridesMap = Record<string, EventOverride>;

export const BUNDLED_EVENT_OVERRIDES = overridesJson as EventOverridesMap;
export const EVENT_OVERRIDES_KV_KEY = 'event:overrides';
export const EVENT_OVERRIDES_TAG = 'event-overrides';

/** slug の上書き内容を取得（無ければ null）。同期・バンドル版。 */
export function getEventOverride(slug: string): EventOverride | null {
  return BUNDLED_EVENT_OVERRIDES[slug] ?? null;
}

/** 全 overrides を取得（同期・バンドル版）。 */
export function getAllEventOverrides(): EventOverridesMap {
  return BUNDLED_EVENT_OVERRIDES;
}

/** 元イベント + override をマージ（ovMap 省略時はバンドル）。 */
export function mergeEvent(e: EventEntry, ovMap: EventOverridesMap = BUNDLED_EVENT_OVERRIDES): EventEntry {
  const ov = ovMap[e.slug];
  if (!ov) return e;
  return { ...e, ...ov };
}

/** 実行時の override マップ（KV設定時はKV、無ければバンドル）。 */
export const getRuntimeEventOverrides = unstable_cache(
  async (): Promise<EventOverridesMap> => {
    if (isKvConfigured()) {
      const fromKv = await kvGet<EventOverridesMap>(EVENT_OVERRIDES_KV_KEY);
      if (fromKv) return fromKv;
    }
    return BUNDLED_EVENT_OVERRIDES;
  },
  ['runtime-event-overrides'],
  { tags: [EVENT_OVERRIDES_TAG] },
);

/** 保存用に現在の全 override を直読み（KV空ならバンドルをシード）。 */
export async function readEventOverridesForWrite(): Promise<EventOverridesMap> {
  if (isKvConfigured()) {
    const fromKv = await kvGet<EventOverridesMap>(EVENT_OVERRIDES_KV_KEY);
    return fromKv ?? { ...BUNDLED_EVENT_OVERRIDES };
  }
  return { ...BUNDLED_EVENT_OVERRIDES };
}

/** override マップを KV に保存。 */
export async function writeEventOverridesToKv(map: EventOverridesMap): Promise<boolean> {
  return kvSet(EVENT_OVERRIDES_KV_KEY, map);
}

/** 編集可能なフィールド名（API・UI で参照する） */
export const EDITABLE_FIELDS = [
  'title',
  'lede',
  'category',
  'startDate',
  'endDate',
  'venue',
  'area',
  'city',
  'ageLabel',
  'price',
  'officialUrl',
  'hero',
  'tags',
  'note',
] as const;
export type EditableField = (typeof EDITABLE_FIELDS)[number];
