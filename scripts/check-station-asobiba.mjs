#!/usr/bin/env node
/**
 * 駅×子供の遊び場の施設台帳（data/station-asobiba/*.json・実験47）の検査。
 *   node scripts/check-station-asobiba.mjs
 * 落とすもの: 必須項目の欠け・型の誤り・出典が公式でない（口コミ・まとめ・地図サービス）・
 * 駅から1.2km超・同じ駅で名前の重複・体験や評価の言い回し・確認日の書式。
 * 公式に記載の無い項目は null で書く（「無い」と推測で埋めない）。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'data/station-asobiba');
const coords = JSON.parse(readFileSync(join(root, 'lib/station-coords.json'), 'utf8'));
const MIN = 12;
const MAX_M = 1200;
const KINDS = new Set(['jidoukan', 'kosodate-hiroba', 'indoor-play', 'park', 'museum', 'library', 'mall-kids', 'pool', 'other']);
const PLACES = new Set(['indoor', 'outdoor', 'mixed']);
const NOT_OFFICIAL = /iko-yo\.net|asoview\.com|jalan\.net|rtrp\.jp|nap-camp\.com|kosodate\.kufu\.jp|playtrail\.jp|ameblo\.jp|instagram\.com|tripadvisor|google\.(com|co\.jp)\/maps|goo\.gl|tabelog\.com|hotpepper\.jp|retty\.me|enjoytokyo\.jp|tokyo-eventplus\.com|mamari|kidsna|hokanko/;
const EXPERIENCE = /おすすめ|オススメ|人気|行ってみ|我が家|うちの子|娘|息子|最高|大満足|穴場/;
const TRISTATE = ['nursingRoom', 'diaperChange', 'strollerOk', 'directFromStation'];
const NULLABLE_STR = ['ages', 'hours', 'closed', 'accessOfficial', 'notes'];

const dist = (a, b) => {
  const R = 6371000;
  const r = (d) => (d * Math.PI) / 180;
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

let errors = 0;
const err = (slug, name, msg) => {
  errors++;
  console.log(`ERROR ${slug} | ${name ?? '-'} | ${msg}`);
};

for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
  const slug = file.replace(/\.json$/, '');
  const at = coords[slug];
  if (!at) err(slug, null, '駅の座標が lib/station-coords.json に無い');
  let list;
  try {
    list = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  } catch (e) {
    err(slug, null, `JSON が読めない: ${e.message}`);
    continue;
  }
  if (!Array.isArray(list)) {
    err(slug, null, '配列でない');
    continue;
  }
  const seen = new Set();
  let within = 0;
  for (const f of list) {
    const n = f?.name;
    if (typeof n !== 'string' || !n) err(slug, n, 'name が無い');
    if (seen.has(n)) err(slug, n, '同じ名前が2件');
    seen.add(n);
    if (!KINDS.has(f.kind)) err(slug, n, `kind が不正: ${f.kind}`);
    if (!PLACES.has(f.place)) err(slug, n, `place が不正: ${f.place}`);
    if (typeof f.address !== 'string' || f.address.length < 6) err(slug, n, 'address が短い・無い');
    if (typeof f.lat !== 'number' || typeof f.lng !== 'number' || f.lat < 20 || f.lat > 46 || f.lng < 122 || f.lng > 154) err(slug, n, '座標が不正');
    if (!['gsi', 'official'].includes(f.geoSource)) err(slug, n, 'geoSource が不正');
    if (typeof f.officialUrl !== 'string' || !/^https:\/\//.test(f.officialUrl)) err(slug, n, 'officialUrl が https で無い');
    if (!Array.isArray(f.sourceUrls) || f.sourceUrls.length === 0) err(slug, n, 'sourceUrls が空');
    for (const u of [f.officialUrl, ...(f.sourceUrls ?? [])]) if (NOT_OFFICIAL.test(String(u))) err(slug, n, `公式でない出典: ${u}`);
    if (!f.fee || !(f.fee.free === true || f.fee.free === false || f.fee.free === null)) err(slug, n, 'fee.free が true/false/null でない');
    // 有料と書くなら公式の金額があること／無料と書くなら text が「記載なし」でないこと（推測で埋めない・2026-11-27 に錦糸町で19件あった）
    if (f.fee?.free === false && !/\d/.test(f.fee.text ?? '')) err(slug, n, 'fee.free=false なのに金額が無い（公式に金額が無ければ null）');
    if (f.fee?.free === true && /記載なし|記載がない/.test(f.fee.text ?? '')) err(slug, n, 'fee.free=true なのに「記載なし」と書いている（null にする）');
    for (const k of TRISTATE) if (!(f[k] === true || f[k] === false || f[k] === null)) err(slug, n, `${k} が true/false/null でない`);
    for (const k of NULLABLE_STR) if (!(f[k] === null || typeof f[k] === 'string')) err(slug, n, `${k} が文字列/null でない`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.verifiedAt ?? '')) err(slug, n, 'verifiedAt の書式');
    const text = [f.fee?.text, ...NULLABLE_STR.map((k) => f[k])].filter(Boolean).join(' ');
    const hit = text.match(EXPERIENCE);
    if (hit) err(slug, n, `体験・評価の言い回し「${hit[0]}」`);
    if (at && typeof f.lat === 'number') {
      const m = dist(at, f);
      if (m > MAX_M) err(slug, n, `駅から直線${Math.round(m)}m（${MAX_M}m超）`);
      else within++;
    }
  }
  console.log(`${slug}: ${list.length}件（1.2km以内 ${within}）${within >= MIN ? '・配信' : `・${MIN}件未満なので配信しない`}`);
}
if (errors) {
  console.log(`\n${errors}件のエラー`);
  process.exit(1);
}
console.log('\nOK');
