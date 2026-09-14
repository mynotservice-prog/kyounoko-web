/**
 * ミスタードーナツ: 公式「ショップを探す」（md.mapion.co.jp/b/misterdonut/、Mapion製）。
 * 一覧ページ（/b/misterdonut/attr/?t=attr_con&start=<ページ>）に全ショップが20件ずつ載り、
 * 各ショップにサービスアイコン（ネットオーダー/出前館/Uber Eats/専用駐車場/共用駐車場/ドライブスルー/ドーナツビュッフェ/ドーナツポップつめ放題）が付く。
 * 設備に当たるのは駐車場（専用・共用）だけで、「駐車場あり」で絞り込んだ件数と突き合わせる。
 * 子ども向け設備（ベビーチェア・おむつ替え等）の属性は無い。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://md.mapion.co.jp/b/misterdonut/';
const LIST = `${SOURCE}attr/?t=attr_con`;
const PER_PAGE = 20;
const LABELS = {
  parking: '専用駐車場／共用駐車場',
};

function parsePage(html) {
  const stores = [];
  // 店舗ブロック（<li class="list-item"><div class="list-content">…）ごとに分割する。
  // 「アイコン説明」モーダルも同じ class="list-item" を使うので、list-content を持つブロックだけを店舗とみなす
  // （取りこぼしは crawl() 側の総件数照合で検知する）
  const blocks = html.split('<li class="list-item">').slice(1).filter((b) => /^\s*<div class="list-content">/.test(b));
  for (const b of blocks) {
    // 店名の h2 には「改装休店中」等の <span> が付くことがあるので、タグを落として使う
    const m = b.match(/href="(\/b\/misterdonut\/info\/\d+\/)">\s*<h2 class="list-content-name">([\s\S]*?)<\/h2>/);
    if (!m) throw new Error(`店舗名が取れないブロックがあります: ${b.slice(0, 300).replace(/\s+/g, ' ')}`);
    const facilities = [];
    if (/list-content-icon_parking(_common)?"/.test(b)) facilities.push('parking');
    const name = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    stores.push({ name: `ミスタードーナツ ${name}`, url: `https://md.mapion.co.jp${m[1]}`, facilities });
  }
  return stores;
}

export async function crawl() {
  const first = await fetchText(`${LIST}&start=1`);
  const total = Number(first.match(/(\d+)件のショップがあります/)?.[1]);
  const pages = Number(first.match(/\d+\/(\d+)<\/li>/)?.[1]);
  if (!total || !pages) throw new Error('総件数/ページ数が取れない');
  const stores = parsePage(first);
  for (let p = 2; p <= pages; p++) stores.push(...parsePage(await fetchText(`${LIST}&start=${p}`)));
  if (stores.length !== total) throw new Error(`件数不一致 total=${total} got=${stores.length}`);
  const facilities = tally(stores, LABELS);
  // 公式の「駐車場あり」絞り込み件数と照合
  const parkHtml = await fetchText(`${LIST}&start=1&park_flg=1`);
  const parkCount = Number(parkHtml.match(/(\d+)件のショップがあります/)?.[1]);
  if (parkCount !== facilities.parking.count) throw new Error(`駐車場: 集計 ${facilities.parking.count} と公式絞り込み件数 ${parkCount} が不一致`);
  return {
    chain: 'misdo',
    name: 'ミスタードーナツ',
    sourceUrl: SOURCE,
    method: `公式「ショップを探す」（Mapion製）の全件一覧（${PER_PAGE}件×${pages}ページ）の店舗ごとのサービスアイコンを集計し、「駐車場あり」の絞り込み件数と一致を確認`,
    total: stores.length,
    note: `アイコン項目は ネットオーダー・出前館・Uber Eats・専用駐車場・共用駐車場・ドライブスルー・ドーナツビュッフェ・ドーナツポップつめ放題 で、設備に当たるのは駐車場のみ（専用・共用のいずれかがあれば駐車場ありとした。公式絞り込み「駐車場あり」=${parkCount}件と一致）。子ども向け設備の属性は公開されていない`,
    facilities,
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
