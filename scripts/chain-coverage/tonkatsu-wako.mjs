/**
 * とんかつ和幸: 和幸商事の公式店舗検索（wako-group.co.jp/shop/）。
 * ブランド「とんかつ和幸」×業態「レストラン」の一覧（/shop/result/?brand=0&type=0、1ページ10件）の各店舗カードに
 * アイコン列（<ul class="p-shop_list_icon">）が全店同じ並びで出る。表示は li の class で、
 * 空=表示あり／is-not=グレー表示（なし）／is-hidden=非表示。
 *   惣菜 / 駐車場 / 子供椅子 / ランチメニュー / 喫煙室 / クレジット / 電子マネー / QRコード / スタンプカード
 * 設備キーに対応するのは 子供椅子→kidsChair、駐車場→parking。
 * 海外店は国別の検索（?country=）にあり、この一覧には含まれない。
 */
import { UA, sleep, tally, runAdapter } from './_lib.mjs';

const BASE = 'https://wako-group.co.jp/shop/result/?brand=0&type=0';
const LABELS = {
  kidsChair: '子供椅子',
  parking: '駐車場',
};

// このサイトは正常なページも HTTP 404 で返す（本文は通常どおり）。_lib の fetchText は 404 を失敗扱いにするので、
// 本文に店舗検索の見出しがあるかで正否を判定する専用の取得関数を使う
async function fetchPage(url) {
  for (let i = 0; ; i++) {
    await sleep(400);
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25_000) });
      const body = await r.text();
      if (!/class="p-shop_list"/.test(body)) throw new Error(`店舗検索ページではない応答 HTTP ${r.status} ${url}`);
      return body;
    } catch (e) {
      if (i >= 2) throw e;
      await sleep(1000 * (i + 1));
    }
  }
}

const clean = (s) => s.replace(/<br\s*\/?>/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

export async function crawl() {
  const first = await fetchPage(BASE);
  const lastPage = Math.max(1, ...[...first.matchAll(/paged=(\d+)/g)].map((m) => Number(m[1])));
  const byLabel = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const stores = [];
  const seen = new Set();
  const iconSeen = {};
  for (let p = 1; p <= lastPage; p++) {
    const html = p === 1 ? first : await fetchPage(`${BASE}&paged=${p}`);
    for (const m of html.matchAll(/<div class="p-shop_list_item">\s*<a href="([^"]+)">([\s\S]*?)<\/a>\s*<\/div>/g)) {
      const [, url, body] = m;
      if (seen.has(url)) continue;
      seen.add(url);
      if (!/brand_wako/.test(body)) throw new Error(`とんかつ和幸以外のブランドが混ざっている: ${url}`);
      const name = clean(body.match(/p-shop_list_name">([\s\S]*?)<\/h3>/)?.[1] || '');
      const icons = [...(body.match(/p-shop_list_icon">([\s\S]*?)<\/ul>/)?.[1] || '').matchAll(/<li class="([^"]*)"><span>([\s\S]*?)<\/span><\/li>/g)]
        .map((x) => ({ cls: x[1].trim(), label: clean(x[2]) }));
      for (const i of icons) iconSeen[i.label] = true;
      const facilities = icons.filter((i) => i.cls === '' && byLabel[i.label]).map((i) => byLabel[i.label]);
      stores.push({ name, url, facilities });
    }
  }
  for (const l of Object.values(LABELS)) if (!iconSeen[l]) throw new Error(`アイコン "${l}" が一覧に無い`);
  return {
    chain: 'tonkatsu-wako',
    name: 'とんかつ和幸',
    sourceUrl: BASE,
    method: `公式店舗検索のブランド「とんかつ和幸」×業態「レストラン」の一覧（${lastPage}ページ）の店舗カードにあるアイコン（表示あり／グレー表示）を店舗ごとに集計`,
    total: stores.length,
    note: `公式サイトは正常なページも HTTP 404 で返すため本文の内容で取得成否を判定。アイコン列: ${Object.keys(iconSeen).join('・')}。グレー表示（class=is-not）は「なし」、非表示（is-hidden）は該当なしとして扱った。テイクアウト売店のみの店舗・海外店は含まない`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
