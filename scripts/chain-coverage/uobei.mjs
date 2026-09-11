/**
 * 魚べい: 公式店舗検索（www.uobei.info/store/、元気寿司グループ共通の Kuroco API）。
 * 店舗検索ページが呼ぶ公開API（api.genki-gdc.co.jp/rcms-api/8/stores、フロントJSに埋め込まれた公開トークンを使用）で
 * 全店舗を列挙し、店舗ごとの「service」属性（回転しない寿司/駐車場/クレジット可/車いす対応/アプリ予約…、
 * 店舗検索の一覧カードにアイコンで表示される）を集計する。
 * 同API にはグループ他業態（元気寿司・千両・うま勝）が混在するので brand ラベルで「魚べい」だけに絞る。
 * 店舗個別ページは無く、一覧ページの ?id=<store_id> で1店舗表示になる。
 */
import { fetchText, fetchJson, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://www.uobei.info/store/';
const API = 'https://api.genki-gdc.co.jp/rcms-api/8/stores?cnt=1000';
// 公式 service ラベル → 設備キー。ここに無いラベル（回転しない寿司・クレジット可・アプリ予約）は無視する
const LABELS = {
  parking: '駐車場',
  stepFree: '車いす対応', // 公式表記のまま。入口の段差なし/スロープを意味するかは明記されていない
};

/** 店舗検索ページのJSチャンクから API 公開トークンを拾う（ハードコードしない） */
async function accessToken() {
  const html = await fetchText(SOURCE);
  const chunks = [...new Set([...html.matchAll(/\/_next\/static\/chunks\/[^"]+\.js/g)].map((m) => m[0]))];
  for (const c of chunks) {
    const js = await fetchText(`https://www.uobei.info${c}`);
    const m = js.match(/rcms-api\/8\/stores\?"\)\.concat\([a-z]\),\{[^}]*"x-rcms-api-access-token":"([0-9a-f]{64})"/);
    if (m) return m[1];
  }
  throw new Error('店舗APIのアクセストークンがJSから見つからない');
}

export async function crawl() {
  const token = await accessToken();
  const data = await fetchJson(API, { headers: { 'x-rcms-api-access-token': token, Origin: 'https://www.uobei.info', Referer: SOURCE } });
  if (data.pageInfo.totalCnt !== data.list.length) throw new Error(`件数不一致 total=${data.pageInfo.totalCnt} got=${data.list.length}`);
  const byLabel = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const others = {};
  const hidden = [];
  const serviceLabels = new Set();
  const stores = [];
  for (const s of data.list) {
    const brand = s.brand?.label;
    if (brand !== '魚べい') { others[brand] = (others[brand] || 0) + 1; continue; }
    if (s.is_display?.label !== '表示') { hidden.push(s.subject); continue; }
    for (const it of s.service || []) serviceLabels.add(it.label);
    const facilities = (s.service || []).map((it) => byLabel[it.label]).filter(Boolean);
    stores.push({ name: `魚べい ${s.subject}`.replace(/\s+/g, ' ').trim(), url: `${SOURCE}?id=${s.store_id}`, facilities });
  }
  const otherNote = Object.entries(others).map(([b, n]) => `${b}${n}件`).join('・');
  return {
    chain: 'uobei',
    name: '魚べい',
    sourceUrl: SOURCE,
    method: '公式店舗検索が呼ぶ店舗API（Kuroco）の全件からブランド「魚べい」を抽出し、店舗ごとの service 属性（一覧カードのアイコン）を集計',
    total: stores.length,
    note: `同APIに混在するグループ他業態（${otherNote}）は除外${hidden.length ? `。非表示${hidden.length}件（${hidden.join('、')}）も除外` : ''}。service の選択肢は ${[...serviceLabels].join('/')} で、子ども向け設備の属性は無い。「車いす対応」は入口の段差なし等を明示した表記ではない`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
