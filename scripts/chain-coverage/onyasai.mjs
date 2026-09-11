/**
 * しゃぶしゃぶ温野菜: 公式店舗検索（map.reins.co.jp/onyasai、レインズ公式）の全国一覧で全店舗を列挙し、
 * 各店舗詳細ページの「備考」欄（<span class="pre-line-base">）に定型で書かれる
 * 「駐車場：あり／なし」「キッズルーム：あり／なし」を店舗ごとに読む。
 * 備考はチェックボックスではなく定型テキストだが、ほぼ全店舗（205/208）に同じ書式で入っている。
 * 「個室」「喫煙室」は一部店舗（11店）にしか書かれていないため属性として扱わない。
 */
import { fetchText, text, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://map.reins.co.jp/onyasai/all';
// 公式「備考」の項目名 → 設備キー。「座席数」「個室」（一部店舗のみ）「喫煙室」は無視する
const LABELS = {
  parking: '駐車場',
  kidsSpace: 'キッズルーム',
};

export async function crawl() {
  const all = await fetchText(SOURCE);
  const ids = [...new Set([...all.matchAll(/href="\/onyasai\/detail\/(\d+)"/g)].map((m) => m[1]))];
  const stores = [];
  const noRemark = [];
  for (const id of ids) {
    const url = `https://map.reins.co.jp/onyasai/detail/${id}`;
    const html = await fetchText(url);
    const name = text((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').split(/[|｜]/)[0].trim();
    const m = html.match(/<span class="pre-line-base">([\s\S]*?)<\/span>/);
    if (!m) { noRemark.push(name); continue; }
    const rows = Object.fromEntries(text(m[1]).split(/\s+/).map((l) => [l.replace(/[：:].*$/, ''), l.replace(/^[^：:]*[：:]/, '')]));
    const facilities = [];
    // 「あり」「あり（第二駐車場あり）」「90台」を有り、「なし」「ご用意しておりません。」を無しとみなす
    const yes = (v) => v !== undefined && !/^(なし|ご用意しておりません|無)/.test(v) && (/あり|台|有/.test(v));
    if (yes(rows['駐車場'])) facilities.push('parking');
    if (yes(rows['キッズルーム'])) facilities.push('kidsSpace');
    stores.push({ name, url, facilities });
  }
  return {
    chain: 'onyasai',
    name: 'しゃぶしゃぶ温野菜',
    sourceUrl: SOURCE,
    method: '公式店舗検索（レインズ）の全国一覧で全店舗を列挙し、各店舗詳細ページの「備考」欄に定型で書かれる「駐車場：」「キッズルーム：」を集計',
    total: stores.length,
    note: `備考はチェック属性ではなく定型テキスト（駐車場／座席数／キッズルーム）。備考欄の無い${noRemark.length}店（${noRemark.join('、')}）は total から除外。「個室」は11店にしか書かれていないため集計していない`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
