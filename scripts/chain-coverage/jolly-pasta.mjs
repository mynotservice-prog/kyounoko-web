/**
 * ジョリーパスタ: 公式店舗検索（maps.jolly-pasta.co.jp、ゼンショー系の店舗検索と同じ作り）。
 * 全店舗の列挙は _zensho-search.mjs の searchAll（/jp/api/search、cookie セッション＋morelist）を使い、
 * 設備は各店舗の詳細ページ（/jp/detail/<id>.html）のアイコン（icon_cond<NN>.png）を読む（_zensho.mjs と同じ読み方）。
 *   「サービス・設備」欄: cond05 駐車場あり → parking
 *   「メニュー」欄:       cond10 お子様メニューあり → kidsMenu
 * 検索画面では「お子様メニューあり」のチェックは HTML コメントで無効化されているが、詳細ページには店舗ごとに表示されるので数える。
 * 「ベビーシートあり」「多目的トイレあり」「エレベーターあり」の検索条件は、集計日時点で該当が 0・0・1 件（全323件中）で、
 * 前2つは検索画面でも無効化されている。未入力と判断して数えない（「0店」と出すと誤りになる。丸源ラーメンと同じ扱い）。
 * ブランドがジョリーパスタの店舗だけ数える。ジョリーオックスも mapdata.brand は「ジョリーパスタ」なので、
 * 一覧のブランドアイコン（mapdata.icon が img_jolly.png か img_jolly-ox.png か）で見分けて除外する。
 */
import { fetchText, tally, runAdapter, UA } from './_lib.mjs';
import { searchAll } from './_zensho-search.mjs';

const BASE = 'https://maps.jolly-pasta.co.jp';
const SOURCE = `${BASE}/jp/index.html`;
const BRAND = 'ジョリーパスタ';
const ICONS = { '05': 'parking', 10: 'kidsMenu' };
const LABELS = { parking: '駐車場あり', kidsMenu: 'お子様メニューあり' };
const UNFILLED = { baby_seat: 'ベビーシートあり', multipurpose_restroom: '多目的トイレあり', slope_elevator: 'エレベーターあり' };

/** 詳細ページの「サービス・設備」「メニュー」欄のアイコン番号と表記（_zensho.mjs の parseDetail と同じ読み方） */
function parseDetail(html) {
  const sections = [];
  for (const cls of ['facility', 'menu']) {
    const i = html.search(new RegExp(`<dl class="${cls}[" ]`));
    if (i < 0) continue;
    sections.push(html.slice(i, html.indexOf('</dl>', i)));
  }
  return sections.flatMap((seg) => [...seg.matchAll(/icon_cond(\d+)\.png"[^>]*>\s*<\/span>\s*<span\s+class="name">([\s\S]*?)<\/span>/g)])
    .map((m) => ({ icon: m[1], name: m[2].replace(/<br\s*\/?>/g, '').replace(/\s+/g, '') }));
}

/** 一覧データ（条件なし・全件）の link → ブランドアイコン */
async function iconByLink() {
  const r = await fetch(`${BASE}/api/search`, {
    method: 'POST',
    headers: { 'User-Agent': UA, Referer: SOURCE, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'morelist=5000',
    signal: AbortSignal.timeout(60_000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} /api/search`);
  const d = await r.json();
  return new Map((d.mapdata || []).map((m) => [m.link.replace(/^\/\//, '/'), m.icon || '']));
}

export async function crawl() {
  const all = await searchAll(BASE);
  const icons = await iconByLink();
  const others = {};
  const targets = [];
  for (const s of all) {
    const icon = icons.get(s.link.replace(/^\/\//, '/')) ?? icons.get(`/jp${s.link.replace(/^\/\//, '/')}`);
    if (icon === undefined) throw new Error(`一覧データに無い店舗: ${s.link}`);
    const brand = /img_jolly\.png$/.test(icon) ? BRAND : icon.replace(/^.*\/(img_[^/]+)\.png$/, '$1');
    if (s.brand !== BRAND || brand !== BRAND) { const b = `${s.brand}（${brand}）`; others[b] = (others[b] || 0) + 1; continue; }
    targets.push(s);
  }
  const iconNames = {};
  const stores = [];
  for (const s of targets) {
    const items = parseDetail(await fetchText(s.url));
    for (const it of items) if (ICONS[it.icon]) iconNames[ICONS[it.icon]] = it.name;
    stores.push({ name: `${s.brand} ${s.name}`.replace(/\s+/g, ' ').trim(), url: s.url, facilities: [...new Set(items.map((it) => ICONS[it.icon]).filter(Boolean))] });
  }
  const facilities = tally(stores, LABELS);
  // 駐車場は検索画面の絞り込み（parking_flag）と突き合わせる
  const targetLinks = new Set(targets.map((s) => s.link));
  const searchParking = (await searchAll(BASE, { facility: ['parking_flag'] })).filter((s) => targetLinks.has(s.link)).length;
  if (searchParking !== facilities.parking.count) throw new Error(`駐車場: 詳細ページ ${facilities.parking.count} と公式絞り込み ${searchParking} が不一致`);
  const unfilled = {};
  for (const v of Object.keys(UNFILLED)) unfilled[v] = (await searchAll(BASE, { facility: [v] })).length;
  return {
    chain: 'jolly-pasta',
    name: BRAND,
    sourceUrl: SOURCE,
    method: '公式店舗検索の検索APIで全店舗を列挙し、各店舗詳細ページの「サービス・設備」「メニュー」欄のアイコン（駐車場あり・お子様メニューあり）を集計',
    total: stores.length,
    note: [
      `詳細ページの表記: ${Object.entries(iconNames).map(([k, n]) => `${LABELS[k]}→「${n}」`).join('、')}。駐車場は公式の絞り込み件数（ジョリーパスタ分）と一致を確認`,
      Object.keys(others).length ? `同じ検索に載る別ブランド（${Object.entries(others).map(([b, n]) => `${b}${n}件`).join('・')}。ブランドアイコンで判別）は除外` : null,
      `検索条件「${Object.values(UNFILLED).join('」「')}」は該当 ${Object.values(unfilled).join('・')} 件（全${all.length}件中）で未入力と判断し集計しない`,
    ].filter(Boolean).join('。'),
    facilities,
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
