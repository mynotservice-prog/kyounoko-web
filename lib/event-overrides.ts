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

import overridesJson from './event-overrides.json';
import type { EventEntry } from './events';

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

const OVERRIDES = overridesJson as EventOverridesMap;

/** slug の上書き内容を取得（無ければ null） */
export function getEventOverride(slug: string): EventOverride | null {
  return OVERRIDES[slug] ?? null;
}

/** 全 overrides を取得（admin 一覧用） */
export function getAllEventOverrides(): EventOverridesMap {
  return OVERRIDES;
}

/** 元イベント + override をマージして 1 件返す */
export function mergeEvent(e: EventEntry): EventEntry {
  const ov = OVERRIDES[e.slug];
  if (!ov) return e;
  return { ...e, ...ov };
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
