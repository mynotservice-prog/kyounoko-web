/**
 * ゼンショー系（すき家・はま寿司・なか卯）共通の公式店舗検索 maps.<brand>/jp/ の読み方（絞り込みAPI方式）。
 * ※ _zensho.mjs（ココス・ビッグボーイ担当の詳細ページ方式）とは別実装。
 *
 * 検索API: POST /jp/api/search（JSON: { list: 結果HTML, mapdata: [{brand,name,link,options,...}] }）
 *  - 条件なしで全店舗が返る。morelist=N で 50+N 件まで拡張できるが上限あり（1,750件で通り 1,800件で System Error）。
 *  - 検索条件はサーバ側セッション（cookie zensho-maps-cid）に保存され、morelist はそのセッションの条件で件数を伸ばす。
 *    cookie 無しで morelist を付けると条件が無視され全件になるので、(1) 条件 POST で cookie 取得 → (2) 同 cookie で morelist、の2段で取る。
 *  - 全店舗数が上限を超えるチェーン（すき家 2,010店）は name=（店名の部分一致）で分割し、
 *    ヘッダの「検索結果：N件」と集めた店舗数が一致するまで足す（一致しなければ throw）。
 *  - facility[]=<value> は店舗検索の「サービス・設備」チェックボックスと同じ絞り込み。
 *    絞り込んだ結果に出る店舗＝その属性を持つ店舗、として店舗ごとの設備を確定する
 *    （店舗詳細ページの「サービス・設備」アイコンと同じ属性。詳細ページを全件叩くより軽い）。
 *
 * 使うのは各ブランドの検索画面で**コメントアウトされていない**チェックボックスだけ
 * （HTML 上に <!-- --> で無効化された項目があり、それは公開属性とみなさない）。
 */
import { UA, sleep } from './_lib.mjs';

const MORELIST = 1700; // 50 + 1700 = 1,750 件/リクエスト（実測上限付近）

/** _lib.fetchText は GET 専用なので、同じ礼儀（400ms 間隔・25s タイムアウト・2回再試行）で POST する */
let lastAt = 0;
async function postForm(url, body, headers, { delayMs = 400, retries = 2 } = {}) {
  const wait = lastAt + delayMs - Date.now();
  if (wait > 0) await sleep(wait);
  lastAt = Date.now();
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(url, { method: 'POST', body, headers: { 'User-Agent': UA, ...headers }, signal: AbortSignal.timeout(25_000) });
      if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
      return { text: await r.text(), setCookie: r.headers.get('set-cookie') || '' };
    } catch (e) {
      if (i >= retries) throw e;
      await sleep(1000 * (i + 1));
    }
  }
}

// 店名の部分一致で全店舗を分割列挙するときに試す文字列（全店舗数が上限を超えるとき用）。
// 1文字ずつ試し、ヘッダ件数に達した時点で打ち切る。
const NAME_PARTS = [
  '号', '駅', '町', '通', '橋', '東', '南', '西', '北', 'ー', 'IC', '市', '区', '田', '山', '川', '本', '中', '大', '小', '新',
  '前', '上', '下', '原', '木', '野', '崎', '島', '井', '谷', '丘', '台', '央', '幸', '光', '名', '港', '浜', '松', '岡', '沢',
  '城', '宮', '店', '江', '里', '津', '道', '和', '高', '長', '平', '石', '池', '泉', '林', '森', '尾', '坂', '内', '外', '口',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
  ...'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽっゃゅょ',
  ...'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポッャュョヶ',
  ...'古神戸阪京玉葉奈良岐阜熊鹿宇都見塚越浦府千万八三二一四五六七九十水沼根岸倉福広愛知静岩秋青富群栃茨滋徳香媛佐分沖横相模厚村郷庄条丁',
  ...'目番入出車梅桜竹藤橘柳栗梨柏杉菊花草海湖国立学院寺社堂門関渡辺瀬崎鳥羽鶴亀熊猿馬牛鹿犬豊富貴賀志美芳吉春夏秋冬旭日月星雲風雨雪',
  ...'金銀銅鉄土砂岩石玉黒白赤青緑黄紫赤朱茶灰久永元末初終真正直曲角丸円方形東西南北央辺際境界間隣近遠深浅広狭厚薄重軽強弱早遅',
  ...'SAPAJRAB', '空港', 'モール', 'イオン', 'ららぽーと', 'アリオ', 'ビル', 'パーク', 'タウン', 'シティ', 'プラザ', 'ヶ丘',
];

export async function search(base, params) {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-Requested-With': 'XMLHttpRequest',
    Referer: `${base}/jp/index.html`,
  };
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) for (const x of v) body.append(`${k}[]`, x);
    else body.append(k, v);
  }
  const first = await postForm(`${base}/jp/api/search`, body.toString(), headers);
  const cookie = first.setCookie.split(';')[0];
  if (!cookie) throw new Error('検索セッション cookie が取れない');
  const more = await postForm(`${base}/jp/api/search`, `morelist=${MORELIST}`, { ...headers, Cookie: cookie });
  const d = JSON.parse(more.text);
  const m = d.list.match(/検索結果：<strong>(\d+)<\/strong>/);
  const count = m ? Number(m[1]) : 0;
  const stores = (d.mapdata || []).map((s) => ({
    brand: s.brand,
    name: s.name,
    link: s.link, // '//detail/615.html'
    url: `${base}/jp` + s.link.replace(/^\/\//, '/'),
    options: s.options || [],
  }));
  return { count, stores };
}

/** 条件 params に合う店舗を全件（ヘッダの件数ぶん）集める。上限超えは店名の部分一致で分割 */
export async function searchAll(base, params = {}) {
  const first = await search(base, params);
  const byLink = new Map(first.stores.map((s) => [s.link, s]));
  if (byLink.size < first.count) {
    for (const part of NAME_PARTS) {
      if (byLink.size >= first.count) break;
      const r = await search(base, { ...params, name: part });
      if (r.count > MORELIST + 50) continue; // この分割でも上限超え → 次の文字へ
      for (const s of r.stores) byLink.set(s.link, s);
    }
    console.error(`  分割列挙: ${byLink.size}/${first.count} 件（${JSON.stringify(params)}）`);
  }
  if (byLink.size !== first.count) {
    throw new Error(`件数不一致: ヘッダ ${first.count} 件に対し ${byLink.size} 件しか集められなかった（${JSON.stringify(params)}）`);
  }
  return [...byLink.values()];
}

/**
 * @param {object} o
 * @param {string} o.base   例 'https://maps.sukiya.jp'
 * @param {Record<string,{value:string,label:string}>} o.filters  設備キー → {facility[] の value, 公式ラベル}
 */
export async function crawlZenshoSearch({ base, filters }) {
  const all = await searchAll(base);
  const has = {};
  const filterCounts = {};
  for (const [key, f] of Object.entries(filters)) {
    const hit = await searchAll(base, { facility: [f.value] });
    filterCounts[key] = hit.length;
    has[key] = new Set(hit.map((s) => s.link));
  }
  const stores = all.map((s) => ({
    name: `${s.brand} ${s.name}`.trim(),
    url: s.url,
    facilities: Object.keys(filters).filter((k) => has[k].has(s.link)),
  }));
  const brands = {};
  for (const s of all) brands[s.brand] = (brands[s.brand] || 0) + 1;
  return { stores, filterCounts, brands };
}
