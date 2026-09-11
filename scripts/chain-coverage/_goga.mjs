/**
 * goga 製 storelocator（KFC・CoCo壱番屋などが採用）の共通部品。
 * 店舗は geohash セル単位の JSON（v3: /api/points/<hash>、旧版: /api/point/<hash>/）で返る。
 * 日本全域を覆う geohash 2 桁のセルを列挙して全店舗を集め、id で重複除去する。
 * 各店舗の extra_fields に絞り込み条件のキー（"駐車場": "1" 等）が入っている。
 */
import { fetchJson } from './_lib.mjs';

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

export function geohash(lat, lon, precision) {
  let minLat = -90, maxLat = 90, minLon = -180, maxLon = 180;
  let bit = 0, ch = 0, even = true, hash = '';
  while (hash.length < precision) {
    if (even) {
      const mid = (minLon + maxLon) / 2;
      if (lon >= mid) { ch = ch * 2 + 1; minLon = mid; } else { ch *= 2; maxLon = mid; }
    } else {
      const mid = (minLat + maxLat) / 2;
      if (lat >= mid) { ch = ch * 2 + 1; minLat = mid; } else { ch *= 2; maxLat = mid; }
    }
    even = !even;
    if (++bit === 5) { hash += BASE32[ch]; bit = 0; ch = 0; }
  }
  return hash;
}

/** 日本全域（北緯 24〜46 度・東経 122〜154 度）を覆う geohash セル */
export function japanCells(precision = 2) {
  const cells = new Set();
  for (let lat = 24; lat <= 46; lat += 1) for (let lon = 122; lon <= 154; lon += 1) cells.add(geohash(lat, lon, precision));
  return [...cells].sort();
}

/**
 * 全セルを取得して店舗を id で重複除去する。
 * urlFor(hash) がセル URL を返す。該当なしのセルは {items: []} が返る。
 */
export async function fetchAllPoints(urlFor, { precision = 2, headers = {} } = {}) {
  const byId = new Map();
  const cells = japanCells(precision);
  for (const h of cells) {
    const d = await fetchJson(urlFor(h), { headers });
    for (const it of d.items || []) byId.set(it.id ?? it.key, it);
  }
  return { points: [...byId.values()], cells: cells.length };
}
