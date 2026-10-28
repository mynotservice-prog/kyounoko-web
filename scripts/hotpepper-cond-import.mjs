#!/usr/bin/env node
/**
 * 駅×条件ページの個人店を、条件ごとにホットペッパーグルメ Webサービスから取る（2026-10-28・Phase 1）。
 *
 * なぜ: 駅の個人店（lib/indie-restaurants/hotpepper.json）は1駅8店まで・駅に近い順なので、焼肉や個室の
 * ような条件に合う店が拾えていなかった。条件ごとに引き直すと、実在する店で条件ページを作れる駅が増える
 * （設計書 docs/station-cond-rebuild-2026-10.md §6-1: 焼肉 1面→54面、個室 5面→28面）。
 *
 * すべて「お子様連れ歓迎（child=1）・ランチあり（lunch=1）」で、駅から直線1km以内。
 *   - yakiniku     : ジャンル「焼肉・ホルモン」（G008）と「韓国料理」（G017）
 *   - private-room : 個室「あり」（private_room=1）
 *   - baby         : お子様連れ欄の店のコメントに椅子・ベビーカー・おむつ・離乳食などの記載がある店
 *   - kids-menu    : お子様連れ欄の店のコメントにお子様メニュー・お子様ランチなどの記載がある店
 * 根拠は店の掲載情報（店が書いたもの）。ページでは「店の掲載」と明記して使う（2026-10-28 社長決定）。
 * 居酒屋・バー・カラオケのジャンル、既知チェーン、期間限定の催事は外す（hotpepper-indie-import.mjs と同じ）。
 *
 * 出力: lib/indie-restaurants/hotpepper-cond.json
 *   { generatedAt, stations: { [駅slug]: { [条件]: Shop[] } } }（駅に近い順・条件ごとに最大12店）
 *
 * 使い方:
 *   HOTPEPPER_API_KEY は .env.local に置く
 *   node scripts/hotpepper-cond-import.mjs --list=scripts/station-verify/list-tokyo23.txt,scripts/station-verify/list-suburb.txt
 *   node scripts/hotpepper-cond-import.mjs --stations=ueno,shinagawa --dry
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'lib', 'indie-restaurants', 'hotpepper-cond.json');
const API = 'https://webservice.recruit.co.jp/hotpepper/gourmet/v1/';
const RADIUS_M = 1000;
const PER_COND = 12;

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

const EXCLUDE_GENRES = new Set(['G001', 'G002', 'G011', 'G012']);
const SEASONAL_NAME = /beer\s*(festa|garden)|ビアガーデン|ビアテラス|期間限定/i;
// 子連れの昼ごはんに勧めない店（店名で判定）。lib/outing-plan.ts の INDIE_NOT_FAMILY_LUNCH と同じ考え方で、
// 焼肉の条件なので「ホルモン」は外さない
const KANA = 'ァ-ヶー';
const DRINK_NAME = new RegExp(
  [
    'ビール|ビア(?:ホール|ガーデン|バー|ダイニング|レストラン|カフェ)|サワー|ハイボール|飲み放題',
    '\\b(?:BEER|Beer|beer|BAR|Bar|bar|PUB|Pub|WINE|Wine)\\b',
    `(?<![${KANA}])(?:バル|バー|パブ)(?![${KANA}])`,
    'ダイニングバー|ワインバー|スポーツバー|酒(?!家)|ワイン|立ち飲み|立呑|スナック|シーシャ|ダーツ|カラオケ',
  ].join('|'),
);
const BABY_WORDS = /椅子|イス|チェア|ベビーカー|おむつ|オムツ|離乳食|授乳|ベビーベッド|ベビーシート/;
const KIDS_MENU_WORDS = /お子様メニュー|お子さまメニュー|キッズメニュー|お子様ランチ|お子さまランチ|キッズプレート|お子様セット|キッズセット/;

const nfkc = (v) => (v ?? '').normalize('NFKC').trim();

// 駅の座標（hotpepper-indie-import.mjs と同じ。足りない駅は station-verify の座標）
const coords = JSON.parse(readFileSync(path.join(ROOT, 'lib', 'station-coords.json'), 'utf8'));
for (const s of JSON.parse(readFileSync(path.join(ROOT, 'scripts', 'station-verify', 'stations.json'), 'utf8'))) {
  coords[s.slug] ??= { lat: s.lat, lng: s.lng };
}

// 既知チェーン名（lib/station-restaurants.ts の CHAINS の name）と、個人店の取り込みでチェーンと判定した屋号
const chainSrc = readFileSync(path.join(ROOT, 'lib', 'station-restaurants.ts'), 'utf8');
const KNOWN_CHAINS = [...chainSrc.matchAll(/^\s+name:\s*'([^']+)'/gm)].map((m) => m[1]);
const CHAIN_BRANDS = new Set(JSON.parse(readFileSync(path.join(ROOT, 'lib', 'indie-restaurants', 'hotpepper.json'), 'utf8')).chainBrands ?? []);

function brandOf(name) {
  return name
    .normalize('NFKC')
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/[\s　]+\S*店$/, '')
    .trim();
}
function isChain(name) {
  const n = name.replace(/[\s　]/g, '');
  return CHAIN_BRANDS.has(brandOf(name)) || KNOWN_CHAINS.some((c) => c.length >= 2 && n.includes(c.replace(/[\s　]/g, '')));
}

function distanceM(a, b) {
  const R = 6371000;
  const toR = (d) => (d * Math.PI) / 180;
  const h =
    Math.sin(toR(b.lat - a.lat) / 2) ** 2 +
    Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(toR(b.lng - a.lng) / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(key, c, extra) {
  const u = new URL(API);
  Object.entries({ key, lat: c.lat, lng: c.lng, range: 3, child: 1, lunch: 1, count: 100, format: 'json', ...extra }).forEach(
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

/** 保存する形（店の掲載情報そのまま。根拠になった店のコメントは evidence に残す） */
function toShop(shop, c, evidence) {
  return {
    name: nfkc(shop.name),
    hpId: shop.id,
    url: shop.urls?.pc,
    address: nfkc(shop.address),
    genre: nfkc(shop.genre?.name),
    access: nfkc(shop.mobile_access) || undefined,
    distanceM: distanceM(c, { lat: Number(shop.lat), lng: Number(shop.lng) }),
    evidence: evidence || undefined,
  };
}

function pick(shops, c, pred) {
  const seen = new Set();
  return shops
    .filter((s) => !EXCLUDE_GENRES.has(s.genre?.code) && !SEASONAL_NAME.test(nfkc(s.name)) && !DRINK_NAME.test(nfkc(s.name)) && !isChain(nfkc(s.name)))
    .map((s) => ({ s, ev: pred(s) }))
    .filter(({ ev }) => ev !== false)
    .map(({ s, ev }) => toShop(s, c, typeof ev === 'string' ? ev : ''))
    .filter((x) => x.distanceM <= RADIUS_M && (seen.has(x.hpId) ? false : seen.add(x.hpId)))
    .sort((a, b) => a.distanceM - b.distanceM)
    .slice(0, PER_COND);
}

async function main() {
  const key = loadKey();
  const fromList = arg('list')
    ?.split(',')
    .flatMap((f) => readFileSync(path.join(ROOT, f), 'utf8').split('\n').map((l) => l.trim()).filter(Boolean));
  const slugs = (arg('stations')?.split(',').filter(Boolean) ?? fromList ?? []).filter((s) => coords[s]);
  if (slugs.length === 0) {
    console.error('対象駅がありません（--list= か --stations= を指定）');
    process.exit(1);
  }
  console.error(`対象 ${slugs.length}駅`);
  const stations = {};
  const tally = { yakiniku: 0, 'private-room': 0, baby: 0, 'kids-menu': 0 };
  for (const [i, slug] of slugs.entries()) {
    const c = coords[slug];
    const base = await search(key, c, {});
    await sleep(250);
    const yak = [...(await search(key, c, { genre: 'G008' })), ...(await search(key, c, { genre: 'G017' }))];
    await sleep(250);
    const pr = await search(key, c, { private_room: 1 });
    await sleep(250);
    const childText = (s) => nfkc(s.child);
    const r = {
      yakiniku: pick(yak, c, () => ''),
      'private-room': pick(pr, c, (s) => nfkc(s.private_room) || '個室あり'),
      baby: pick(base, c, (s) => (BABY_WORDS.test(childText(s)) ? childText(s) : false)),
      'kids-menu': pick(base, c, (s) => (KIDS_MENU_WORDS.test(childText(s)) ? childText(s) : false)),
    };
    const kept = Object.fromEntries(Object.entries(r).filter(([, v]) => v.length > 0));
    if (Object.keys(kept).length) stations[slug] = kept;
    for (const [k, v] of Object.entries(r)) tally[k] += v.length;
    if ((i + 1) % 50 === 0) console.error(`  ${i + 1}/${slugs.length}`);
  }
  console.error('条件ごとの店数（延べ）', JSON.stringify(tally));
  if (DRY) {
    console.log(JSON.stringify(stations, null, 1).slice(0, 4000));
    return;
  }
  writeFileSync(
    OUT,
    JSON.stringify(
      { source: 'ホットペッパーグルメ Webサービス（お子様連れ歓迎・ランチあり・駅から直線1km以内）', generatedAt: new Date().toISOString().slice(0, 10), stations },
      null,
      1,
    ) + '\n',
  );
  console.error(`保存: ${path.relative(ROOT, OUT)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
