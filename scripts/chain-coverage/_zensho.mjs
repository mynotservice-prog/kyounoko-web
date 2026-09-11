/**
 * ゼンショー系「maps.<brand>.jp」店舗検索（ココス・ビッグボーイが同じ作り）の共通部品。
 *
 * 検索は POST /api/search（jQuery.post）。パラメータ無しで全店舗（検索結果 N 件、既定50件表示、
 * morelist=k で 50+k 件まで表示）。応答 JSON の mapdata に店舗名・ブランド・詳細ページリンクが並ぶ。
 * 一覧には駐車場・クレジットのアイコンしか出ないので、各店舗の詳細ページ（/jp/detail/<id>.html）の
 * 「サービス・設備」欄のアイコン（icon_cond<NN>.png）を読む。NN は検索フォームの絞り込み
 * チェックボックス id（cond05=駐車場 等）と同じ番号。
 * 集計後、/api/search に facility[]=<値> を付けたときの「検索結果 N 件」（サーバ側件数）と突き合わせる。
 */
import { fetchText, tally, UA, sleep } from './_lib.mjs';

// 絞り込みチェックボックスの表記 → 設備キー。ここに無い条件（決済・喫煙・ドライブスルー等）は無視する
export const LABELS = {
  stepFree: 'スロープ／エレベーター',
  diaperTable: 'ベビーシート',
  kidsMenu: 'お子様メニュー',
  multiToilet: '多目的トイレ',
  parking: '駐車場',
};
// 設備キー → 検索フォームの value と アイコン番号
const CONDS = {
  stepFree: { value: 'slope_elevator', icon: '16' },
  diaperTable: { value: 'baby_seat', icon: '14' },
  kidsMenu: { value: 'childrens_menu', icon: '10' },
  multiToilet: { value: 'multipurpose_restroom', icon: '15' },
  parking: { value: 'parking_flag', icon: '05' },
};

let lastAt = 0;
async function postSearch(base, params) {
  const wait = lastAt + 400 - Date.now();
  if (wait > 0) await sleep(wait);
  lastAt = Date.now();
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) for (const x of v) body.append(`${k}[]`, x);
    else body.append(k, v);
  }
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(`${base}/api/search`, {
        method: 'POST',
        headers: { 'User-Agent': UA, 'X-Requested-With': 'XMLHttpRequest', Referer: `${base}/jp/index.html`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: AbortSignal.timeout(60_000),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status} ${base}/api/search`);
      const d = await r.json();
      const m = d.list.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').match(/検索結果： ?(\d+) 件 ?（(\d+)〜(\d+)件）/);
      return { total: m ? Number(m[1]) : 0, shown: m ? Number(m[3]) : 0, mapdata: d.mapdata || [] };
    } catch (e) {
      if (i >= 2) throw e;
      await sleep(1000 * (i + 1));
    }
  }
}

/**
 * 詳細ページのアイコンを読む。「サービス・設備」（<dl class="facility">）だけでなく、お子様メニュー（cond10）は
 * 別欄「メニュー」（<dl class="menu">）に出るので両方を見る。決済欄（<dl class="payment">）は facility より前にあるので含まれない。
 * ビッグボーイは <span\n class="name"> と改行が入るので \s+ で受ける。
 */
function parseDetail(html) {
  const sections = [];
  for (const cls of ['facility', 'menu']) {
    // class は "menu" のほか "menu last" のこともある
    const i = html.search(new RegExp(`<dl class="${cls}[" ]`));
    if (i < 0) continue;
    sections.push(html.slice(i, html.indexOf('</dl>', i)));
  }
  const items = sections.flatMap((seg) => [...seg.matchAll(/icon_cond(\d+)\.png"[^>]*>\s*<\/span>\s*<span\s+class="name">([\s\S]*?)<\/span>/g)]);
  return { icons: items.map((m) => m[1]), names: items.map((m) => m[2].replace(/<br\s*\/?>/g, '').replace(/\s+/g, '')) };
}

/**
 * @param {{chain:string, name:string, base:string, brandName:string, brandParam?:string|null}} o
 *   brandName = mapdata.brand の表記で対象ブランドを絞る。brandParam = 検索フォームの brand 値（照合用、無ければ null）
 */
export async function crawlZensho({ chain, name, base, brandName, brandParam = null }) {
  const first = await postSearch(base, {});
  const all = first.shown >= first.total ? first : await postSearch(base, { morelist: first.total - 50 });
  if (all.mapdata.length !== all.total) throw new Error(`全件取得できていない: ${all.mapdata.length}/${all.total}`);
  const others = {};
  const targets = [];
  const seen = new Set();
  for (const m of all.mapdata) {
    if (m.brand !== brandName) { others[m.brand] = (others[m.brand] || 0) + 1; continue; }
    if (seen.has(m.link)) continue;
    seen.add(m.link);
    targets.push(m);
  }
  const byIcon = Object.fromEntries(Object.entries(CONDS).map(([k, v]) => [v.icon, k]));
  const stores = [];
  const seenNames = {};
  for (const m of targets) {
    const url = `${base}${m.link}`;
    const { icons, names } = parseDetail(await fetchText(url));
    icons.forEach((icon, idx) => { if (byIcon[icon]) seenNames[byIcon[icon]] = names[idx]; });
    stores.push({ name: `${m.brand} ${m.name}`.replace(/\s+/g, ' ').trim(), url, facilities: [...new Set(icons.map((i) => byIcon[i]).filter(Boolean))] });
  }
  const facilities = tally(stores, LABELS);

  const checks = [];
  for (const [k, { value }] of Object.entries(CONDS)) {
    const r = await postSearch(base, { facility: [value], ...(brandParam ? { brand: [brandParam] } : {}) });
    const n = brandParam ? r.total : r.total - 0;
    if (n !== facilities[k].count) throw new Error(`${name} ${k}: 集計 ${facilities[k].count} と公式絞り込み件数 ${n} が不一致`);
    checks.push(`${LABELS[k]}=${n}`);
  }

  const otherNote = Object.entries(others).map(([b, n]) => `${b}${n}件`).join('・');
  return {
    chain,
    name,
    sourceUrl: `${base}/jp/index.html`,
    method: '公式店舗検索の検索API（/api/search）で全店舗を列挙し、各店舗詳細ページの「サービス・設備」アイコンを集計',
    total: stores.length,
    note: [
      `各項目は公式の絞り込み件数と一致を確認済み（${checks.join('、')}）`,
      `詳細ページの表記は ${Object.entries(seenNames).map(([k, n]) => `${LABELS[k]}→「${n}」`).join('、')}`,
      otherNote ? `同じ検索に載る別ブランド（${otherNote}）は除外` : null,
    ].filter(Boolean).join('。'),
    facilities,
    stores,
  };
}
