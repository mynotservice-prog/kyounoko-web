/**
 * ウェンディーズ・ファーストキッチン: 公式店舗一覧（wendys-firstkitchen.co.jp/shop/、EUC-JP）。
 * エリア別の結果ページ（result.php?areaid=<エリア>）の表で、各店舗の「サービス」欄にアイコンが並ぶ。
 * 「条件から探す」の menu[kids]＝キッズセット に当たるアイコン（img/icon_kids.png）がある店舗を kidsMenu に数える。
 * 店名に【WFK】とある店舗だけ数える。右欄「新店舗情報」でオープン日が確認日より後の店舗は開業前として除外する。
 */
import { UA, sleep, tally, runAdapter, today } from './_lib.mjs';

const SOURCE = 'https://wendys-firstkitchen.co.jp/shop/';
const LABELS = { kidsMenu: 'キッズセット' };

async function fetchEucJp(url) {
  for (let i = 0; ; i++) {
    await sleep(400);
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25_000) });
      if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
      return new TextDecoder('euc-jp').decode(await r.arrayBuffer());
    } catch (e) {
      if (i >= 2) throw e;
      await sleep(1000 * (i + 1));
    }
  }
}

export async function crawl() {
  const top = await fetchEucJp(SOURCE);
  if (!/name="menu\[kids\]"[\s\S]{0,120}?キッズセット/.test(top)) throw new Error('「条件から探す」にキッズセットが無い');
  const areas = [...new Set([...top.matchAll(/<option value="([a-z]+)"\s*>/g)].map((m) => m[1]))];
  if (areas.length < 5) throw new Error(`エリアが少なすぎる: ${areas.join(',')}`);
  // 新店舗情報: <h4>店名【WFK】</h4> … <li>2026年10月8日（木）…</li> … map.php?shopid=217
  const notYet = new Set();
  const notYetNames = [];
  for (const m of top.matchAll(/<dl>\s*<dt><h4>([\s\S]*?)<\/h4><\/dt>([\s\S]*?)shopid=(\d+)/g)) {
    const d = m[2].match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (!d) continue;
    const ymd = `${d[1]}-${d[2].padStart(2, '0')}-${d[3].padStart(2, '0')}`;
    if (ymd > today()) { notYet.add(m[3]); notYetNames.push(`${m[1].trim()}（${ymd}オープン）`); }
  }
  const stores = [];
  const seen = new Set();
  const otherBrand = [];
  for (const a of areas) {
    const url = `${SOURCE}result.php?areaid=${a}`;
    const html = await fetchEucJp(url);
    let t = html.slice(html.indexOf('class="result-pc"'));
    t = t.slice(0, t.indexOf('</table>'));
    for (const row of t.match(/<tr>[\s\S]*?<\/tr>/g) || []) {
      const name = row.match(/class="shop-name"[^>]*>([\s\S]*?)<\/h4>/)?.[1]?.trim();
      if (!name) continue;
      const id = row.match(/shopid=(\d+)/)?.[1] || name;
      if (seen.has(id)) continue;
      seen.add(id);
      if (!/【WFK】/.test(name)) { otherBrand.push(name); continue; }
      if (notYet.has(id)) continue;
      stores.push({ name, url: `${SOURCE}map.php?shopid=${id}`, facilities: /icon_kids\.png/.test(row) ? ['kidsMenu'] : [] });
    }
  }
  return {
    chain: 'wendys-first-kitchen',
    name: 'ウェンディーズ・ファーストキッチン',
    sourceUrl: SOURCE,
    method: '公式店舗一覧のエリア別結果ページの表で、「サービス」欄にキッズセットのアイコン（「条件から探す」のキッズセットと同じ）がある店舗を集計',
    total: stores.length,
    note: [
      '店名に【WFK】とある店舗だけを数えた',
      otherBrand.length ? `【WFK】以外 ${otherBrand.length} 件を除外` : null,
      notYetNames.length ? `開業前のため除外: ${notYetNames.join('、')}` : null,
    ].filter(Boolean).join('。'),
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
