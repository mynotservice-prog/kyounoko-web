#!/usr/bin/env node
/**
 * 駅ページの「個人店」をホットペッパーグルメ Webサービスの実データで作り直す。
 *
 * なぜ: lib/indie-restaurants/chunk-*.ts の 4,487件は出典ゼロのAI生成で、
 * 「要町 千川通り 老舗洋食」「〜相当」のような実在しない店名が半数以上あった（2026-09-24）。
 * ここでは駅座標から半径500m（少なければ1km）で「お子様連れ歓迎」かつ「ランチあり」の店を引き、
 * 店名・アクセス・店ページURLを店舗側の掲載情報そのままで保存する。
 *
 * 出力: lib/indie-restaurants/hotpepper.json（この駅のデータがあれば chunk-*.ts の旧データを置き換える）
 *
 * 使い方:
 *   HOTPEPPER_API_KEY は .env.local に置く（https://webservice.recruit.co.jp/ で発行）
 *   node scripts/hotpepper-indie-import.mjs                  # 全駅
 *   node scripts/hotpepper-indie-import.mjs --stations=kanamecho,ikebukuro
 *   node scripts/hotpepper-indie-import.mjs --dry            # 保存せず件数だけ
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'lib', 'indie-restaurants', 'hotpepper.json');
const API = 'https://webservice.recruit.co.jp/hotpepper/gourmet/v1/';
const PER_STATION = 8;
const MIN_BEFORE_WIDEN = 3;
/** 同じ屋号の別店舗がこの数以上あればチェーンとみなして外す（チェーンは駅ページの別欄で扱う） */
const CHAIN_STATION_THRESHOLD = 2;

const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=');
const DRY = process.argv.includes('--dry');

function loadKey() {
  if (process.env.HOTPEPPER_API_KEY) return process.env.HOTPEPPER_API_KEY.trim();
  const envPath = path.join(ROOT, '.env.local');
  if (existsSync(envPath)) {
    const line = readFileSync(envPath, 'utf8').split('\n').find((l) => l.startsWith('HOTPEPPER_API_KEY='));
    if (line) return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  }
  console.error('HOTPEPPER_API_KEY がありません（.env.local に追加）');
  process.exit(1);
}

// 子連れランチの文脈に合わないジャンル（居酒屋・ダイニングバー・バー・カラオケ）
const EXCLUDE_GENRES = new Set(['G001', 'G002', 'G011', 'G012']);
// 期間限定の催事（ビアガーデン等）は店ではないので外す
const SEASONAL_NAME = /beer\s*(festa|garden)|ビアガーデン|ビアテラス|期間限定/i;
// ホットペッパーのジャンル → IndieGenre
const GENRE_MAP = {
  G003: 'others', // 創作料理
  G004: 'washoku',
  G005: 'yoshoku',
  G006: 'italian',
  G007: 'chinese',
  G008: 'yakiniku',
  G009: 'asian',
  G010: 'others', // 各国料理
  G013: 'noodles',
  G014: 'cafe',
  G015: 'others',
  G016: 'teppan',
  G017: 'korean',
};

const coords = {
  ...JSON.parse(readFileSync(path.join(ROOT, 'lib', 'station-coords.json'), 'utf8')),
  // station-coords.json に無い駅（HeartRails Express API の駅座標、2026-09-24取得）
  'takanawa-gateway': { lat: 35.635476, lng: 139.740651 },
  'toranomon-hills': { lat: 35.667444, lng: 139.747793 },
  'tokyo-international-cruise': { lat: 35.621462, lng: 139.773157 },
  'tokyo-big-sight': { lat: 35.630158, lng: 139.791228 },
  'haneda-airport-t1': { lat: 35.549163, lng: 139.784653 },
  'haneda-airport-t2': { lat: 35.550734, lng: 139.787979 },
  'haneda-airport-t3': { lat: 35.544676, lng: 139.768968 },
};

// 既知チェーン名（lib/station-restaurants.ts の CHAINS の name）
const chainSrc = readFileSync(path.join(ROOT, 'lib', 'station-restaurants.ts'), 'utf8');
const KNOWN_CHAINS = [...chainSrc.matchAll(/^\s+name:\s*'([^']+)'/gm)].map((m) => m[1]);

// 手で公式確認した駅（station-overrides の indieLabels あり）は置き換えない
const overrideSrc = readFileSync(path.join(ROOT, 'lib', 'station-overrides.ts'), 'utf8');
const PROTECTED = new Set();
for (const m of overrideSrc.matchAll(/'([a-z0-9-]+)':\s*\{[\s\S]*?(?=\n  '[a-z0-9-]+':\s*\{|\n\};)/g)) {
  if (m[0].includes('indieLabels')) PROTECTED.add(m[1]);
}

/** 屋号（支店名を落とす）。「〇〇 要町店」「〇〇（ほにゃ）」→「〇〇」 */
function brandOf(name) {
  return name
    .normalize('NFKC')
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/[\s　]+\S*店$/, '')
    .trim();
}

function isKnownChain(name) {
  const n = name.replace(/[\s　]/g, '');
  return KNOWN_CHAINS.some((c) => c.length >= 2 && n.includes(c.replace(/[\s　]/g, '')));
}

function distanceM(a, b) {
  const R = 6371000;
  const toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(b.lat - a.lat);
  const dLng = toR(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(key, c, range) {
  const u = new URL(API);
  Object.entries({ key, lat: c.lat, lng: c.lng, range, child: 1, lunch: 1, count: 100, format: 'json' }).forEach(
    ([k, v]) => u.searchParams.set(k, String(v)),
  );
  for (let i = 0; i < 3; i++) {
    const res = await fetch(u);
    if (res.ok) {
      const j = await res.json();
      if (j.results?.error) throw new Error(JSON.stringify(j.results.error));
      return j.results?.shop ?? [];
    }
    await sleep(2000 * (i + 1));
  }
  throw new Error(`HTTP error for ${c.lat},${c.lng}`);
}

const CHILD_WORDS = /子|キッズ|ベビー|赤ちゃん|乳|おむつ|オムツ|ファミリー|家族|ママ|パパ|椅子|イス|チェア|座敷|小上がり/;
const nfkc = (v) => (v ?? '').normalize('NFKC').trim();

function toIndie(shop, stationCoord) {
  const d = distanceM(stationCoord, { lat: Number(shop.lat), lng: Number(shop.lng) });
  // child は「お子様連れOK ：お子様用の椅子あります。」のように店のコメントが続くことがある
  const [childNote, ...childRest] = nfkc(shop.child).split(/\s*[:：]\s*/);
  // 「学生大歓迎」のような子連れと無関係なコメントは載せない
  const childCommentRaw = childRest.join('：').trim();
  const childComment = CHILD_WORDS.test(childCommentRaw) ? childCommentRaw : '';
  const genreName = nfkc(shop.genre?.name);
  const catchText = nfkc(shop.catch);
  return {
    name: nfkc(shop.name),
    genre: GENRE_MAP[shop.genre?.code] ?? 'others',
    // mobile_access は店舗側の表記（例「要町駅徒歩3分」）。無ければ直線距離。
    area: nfkc(shop.mobile_access) || `駅から直線約${d}m`,
    description: [genreName && `${genreName}のお店。`, catchText].filter(Boolean).join(''),
    privateRoom: /^あり/.test(shop.private_room ?? '') || undefined,
    source: 'hotpepper',
    hpId: shop.id,
    url: shop.urls?.pc,
    address: nfkc(shop.address),
    childNote: childNote || undefined,
    childComment: childComment || undefined,
    barrierFree: /^あり/.test(shop.barrier_free ?? '') || undefined,
    distanceM: d,
  };
}

async function main() {
  const key = loadKey();
  const only = arg('stations')?.split(',').filter(Boolean);
  const slugs = (only ?? Object.keys(coords)).filter((s) => coords[s] && !PROTECTED.has(s));
  console.error(`対象 ${slugs.length}駅（手動確認済みで除外: ${[...PROTECTED].join(', ') || 'なし'}）`);

  const raw = {};
  for (const [i, slug] of slugs.entries()) {
    const c = coords[slug];
    let shops = await search(key, c, 2);
    if (shops.length < MIN_BEFORE_WIDEN) shops = await search(key, c, 3);
    raw[slug] = shops.filter(
      (s) => !EXCLUDE_GENRES.has(s.genre?.code) && !isKnownChain(s.name) && !SEASONAL_NAME.test(s.name.normalize('NFKC')),
    );
    if ((i + 1) % 50 === 0) console.error(`  ${i + 1}/${slugs.length}`);
    await sleep(250);
  }

  // 複数駅に出る屋号＝チェーン（全駅で取ったときだけ判定できる。--stations 指定時は既知チェーン名のみ）
  // 近い駅どうしでは同じ1店舗が複数駅に出るので、駅数でなく「別店舗（ID）の数」で数える
  const brandStations = new Map();
  for (const shops of Object.values(raw)) {
    for (const s of shops) {
      const b = brandOf(s.name);
      if (!brandStations.has(b)) brandStations.set(b, new Set());
      brandStations.get(b).add(s.id);
    }
  }
  const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { stations: {} };
  const prevBrandStations = prev.chainBrands ?? [];
  const chainBrands = new Set(
    only
      ? prevBrandStations
      : [...brandStations].filter(([, st]) => st.size >= CHAIN_STATION_THRESHOLD).map(([b]) => b),
  );

  const stations = { ...(only ? prev.stations : {}) };
  let total = 0;
  let empty = 0;
  for (const [slug, shops] of Object.entries(raw)) {
    const seen = new Set();
    const list = shops
      .filter((s) => !chainBrands.has(brandOf(s.name)))
      .map((s) => toIndie(s, coords[slug]))
      .sort((a, b) => a.distanceM - b.distanceM)
      .filter((r) => (seen.has(r.hpId) ? false : seen.add(r.hpId)))
      .slice(0, PER_STATION);
    if (list.length) stations[slug] = list;
    else {
      delete stations[slug];
      empty++;
    }
    total += list.length;
  }

  console.error(`店舗 ${total}件 / 0件の駅 ${empty} / チェーン判定の屋号 ${chainBrands.size}`);
  if (DRY) {
    for (const s of only ?? []) console.log(s, JSON.stringify(stations[s] ?? [], null, 1));
    return;
  }
  const out = {
    source: 'ホットペッパーグルメ Webサービス（お子様連れ歓迎・ランチあり）',
    generatedAt: new Date().toISOString().slice(0, 10),
    chainBrands: [...chainBrands].sort(),
    stations,
  };
  writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  console.error(`保存: ${path.relative(ROOT, OUT)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
