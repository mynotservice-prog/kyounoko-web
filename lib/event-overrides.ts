/**
 * イベント情報の上書き層。
 *
 * lib/events.ts はハードコードされた 100 件のイベント配列だが、その上に
 * 「lib/event-overrides.json で個別 slug 単位で hero 画像 等を差し替え」できる
 * 仕組み。/admin/event-images から編集すると JSON が更新されてサイトに反映される。
 *
 * 保存形式（slug -> 上書き内容）:
 *   {
 *     "hogwarts-syoutaijou-tokyo-2026": { "hero": "/v2/articles/kk-12.webp" },
 *     ...
 *   }
 *
 * 注意:
 *  - 本ファイルは Server Component / API route のみで使用する。
 *  - クライアントから直接 import すると JSON 全体がバンドルされるので NG。
 *  - 編集は /api/admin/event-overrides の POST 経由でのみ可能。
 */

import overridesJson from './event-overrides.json';

export type EventOverride = {
  /** 差し替え hero 画像 URL（/v2/articles/kk-XX.webp など） */
  hero?: string;
};

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
