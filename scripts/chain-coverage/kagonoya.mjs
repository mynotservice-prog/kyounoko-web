/**
 * かごの屋: 公式サイト（kagonoya.food-kr.com、WordPress マルチサイト）のトップにある「国内店舗一覧」から
 * 店舗サブサイト（/0502/ 等）を列挙し、各店舗ページの「アクセス/店舗情報」にある
 * 「設備」欄・「サービス」欄（<br> 区切りの固定語彙）を店舗ごとに読む。
 * 一覧には同社の他業態（華都飯店・籠乃屋 等）も混在するので、店名に「かごの屋」を含む店だけを対象にする。
 */
import { fetchText, tally, runAdapter, text } from './_lib.mjs';

const SOURCE = 'https://kagonoya.food-kr.com/#shoplist';
const ORIGIN = 'https://kagonoya.food-kr.com';
// 公式「設備」「サービス」欄の表記 → 設備キー。ここに無い表記（Wi-Fi・禁煙・エレベーター・飲み放題等）は無視する
const LABELS = {
  stepFree: 'バリアフリー',
  kidsMenu: 'お子様メニューあり',
  privateRoom: '個室・半個室あり',
  multiToilet: '車椅子でトイレ利用可',
  parking: '駐車場あり',
};

function row(html, dt) {
  const m = html.match(new RegExp(`<dt class="shop_item_dt">${dt}</dt>\\s*<dd class="shop_item_dd">([\\s\\S]*?)</dd>`));
  if (!m) return [];
  return m[1].split(/<br\s*\/?>/).map((s) => text(s)).filter(Boolean);
}

export async function crawl() {
  const top = await fetchText(ORIGIN + '/');
  const i = top.indexOf('class="shop_wrap"');
  const section = top.slice(i, top.indexOf('</section>', i));
  const items = [...section.matchAll(/<li class="shop_info">([\s\S]*?)<\/li>/g)].map((m) => m[1]);
  const byLabel = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const stores = [];
  const excluded = [];
  const vocab = new Set();
  const noPage = [];
  for (const it of items) {
    const name = text((it.match(/<div class="shop_name">([\s\S]*?)<\/div>/) || [])[1] || '').replace(/\s+/g, ' ').trim();
    if (!name) continue; // 一覧には空の <li> が混じる
    if (!/かごの[屋や]/.test(name)) { excluded.push(name); continue; } // 京都リサーチパーク店は「かごのや」表記
    const href = it.match(/href=['"]([^'"]+)['"]/);
    if (!href) { noPage.push(name); continue; } // 一覧に載っているが店舗ページへのリンクが無い（設備欄を読めない）
    const path = href[1];
    const url = ORIGIN + path;
    const html = await fetchText(url);
    const labels = [...row(html, '設備'), ...row(html, 'サービス')];
    for (const l of labels) vocab.add(l);
    const facilities = [...new Set(labels.map((l) => byLabel[l]).filter(Boolean))];
    stores.push({ name, url, facilities });
  }
  console.error('語彙:', [...vocab].join(' / '));
  console.error('除外:', excluded.join('、'));
  console.error('リンク無し:', noPage.join('、'));
  return {
    chain: 'kagonoya',
    name: 'かごの屋',
    sourceUrl: SOURCE,
    method: '公式サイトの「国内店舗一覧」から店舗ページを全件取得し、各ページの「設備」「サービス」欄の記載を集計',
    total: stores.length,
    note: [
      '店名に「かごの屋」を含む国内店のみ（海外店・SA/PA・同社他業態のサブサイトは一覧に無いので対象外）',
      excluded.length ? `一覧に混在する他業態${excluded.length}件（${excluded.join('、')}）は除外` : '',
      noPage.length ? `店舗ページへのリンクが無い${noPage.length}件（${noPage.join('、')}）は除外` : '',
      '設備欄・サービス欄は「あり」の項目だけが列挙される形式で、記載が無い＝設備が無い とは限らない。「バリアフリー」は1店のみに記載',
    ].filter(Boolean).join('。'),
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
