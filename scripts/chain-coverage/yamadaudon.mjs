/**
 * 山田うどん食堂: 公式サイトの店舗案内（www.yamada-udon.co.jp/shop/<エリア>）。
 * 埼玉9エリア＋近隣6県の計15ページに、店舗ごとの表（店舗名/住所/営業時間/駐車台数/備考）が並ぶ。
 * 設備らしい属性は「駐車台数（N台）」の行だけなので、その行があり台数が1以上の店舗を「駐車場あり」と数える。
 * 行そのものが無い店舗（＝駐車場なしなのか未記入なのかは公式に書かれていない）は count に入れず note に残す。
 */
import { fetchText, tally, runAdapter, text } from './_lib.mjs';

const SOURCE = 'https://www.yamada-udon.co.jp/shop';
const AREAS = [
  'saitama_saitamashi', 'saitama_nanbu', 'saitama_seibu', 'saitama_nannsei', 'saitama_hiki', 'saitama_kenou',
  'saitama_hokubu', 'saitama_tobu', 'saitama_tone', 'tokyo', 'kanagawa', 'chiba', 'ibaraki', 'tochigi', 'gunma',
];
// 公式の行見出し → 設備キー
const LABELS = {
  parking: '駐車台数',
};

export async function crawl() {
  const stores = [];
  const noRow = [];
  for (const area of AREAS) {
    const url = `${SOURCE}/${area}`;
    const t = text(await fetchText(url));
    // 本文は「店舗名 ○○店 住所 … 営業時間 … 駐車台数 21台 店舗地図 …」の繰り返し
    const blocks = t.split(/ 店舗名 /).slice(1);
    for (const b of blocks) {
      const name = b.split(' ')[0];
      const m = b.match(/ 駐車台数 (\S+)/);
      const facilities = [];
      if (m) {
        const n = parseInt(m[1].replace(/[^\d]/g, ''), 10);
        if (Number.isNaN(n)) throw new Error(`駐車台数が数値でない: ${name} "${m[1]}"`);
        if (n > 0) facilities.push('parking');
      } else {
        noRow.push(name);
      }
      stores.push({ name: `山田うどん食堂 ${name}`, url, facilities });
    }
  }
  return {
    chain: 'yamadaudon',
    name: '山田うどん食堂',
    sourceUrl: SOURCE,
    method: '公式店舗案内のエリア別15ページ（埼玉9エリア＋東京・神奈川・千葉・茨城・栃木・群馬）に載る店舗表の「駐車台数」行を店舗ごとに集計（台数1以上を駐車場ありとする）',
    total: stores.length,
    note: `店舗表の項目は 住所/テイクアウト専用ダイヤル/営業時間/駐車台数/備考 で、駐車場以外の設備属性は無い。「駐車台数」行が無い店舗${noRow.length}件（${noRow.join('、')}）は駐車場なしとは限らないため count に含めていない`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
