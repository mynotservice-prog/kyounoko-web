#!/usr/bin/env node
/**
 * GSC 実クエリを「軸」で分類し、軸の組み合わせ別に需要を集計する。
 *
 * 目的: 「年齢 × 天候 × 地域 × 予算 …の掛け算で条件検索ページを生成する」案に対して、
 *       実際にその掛け算クエリが検索されているのかを実測で決める。
 *
 * 使い方:
 *   node gsc-axis-combos.mjs --days=90
 *   node gsc-axis-combos.mjs --days=90 --json=/tmp/axis.json
 *
 * 設計上の注意（過去の実測にもとづく）:
 *  - dimensions=['query'] のみで引くのでアンカーURL重複計上の影響を受けない。
 *  - rowLimit は 25000 上限。**必ず startRow でページングする**（5000固定・ページング無しで
 *    直近週を打ち切っていたバグが過去にあった）。
 */
import { JWT } from 'google-auth-library';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';

const REPO = '/Users/nagaminehideki/Developer/kyounoko-web';
const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const DAYS = Number(arg('days', '90'));
const LAG = Number(arg('lag', '3'));
const SITE = arg('site', 'sc-domain:kyounoko.jp');
const JSON_OUT = arg('json', '');

// ───────────────── 認証 ─────────────────
function loadCreds() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    return JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  }
  let path = `${REPO}/credentials/google-indexing.json`;
  const envPath = `${REPO}/.env.local`;
  if (existsSync(envPath)) {
    const line = readFileSync(envPath, 'utf8')
      .split('\n')
      .find((l) => l.startsWith('GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON_PATH='));
    if (line) {
      const raw = line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      path = raw.replace(/^~/, process.env.HOME || '');
    }
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

const iso = (d) => d.toISOString().slice(0, 10);
function range() {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - LAG);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (DAYS - 1));
  return { start: iso(start), end: iso(end) };
}

async function makeQuery() {
  const c = loadCreds();
  const jwt = new JWT({
    email: c.client_email,
    key: c.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const tok = (await jwt.getAccessToken()).token;
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
  return async (body) => {
    const r = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      console.error('GSC API error', r.status, (await r.text()).slice(0, 300));
      return [];
    }
    return (await r.json()).rows || [];
  };
}

/** rowLimit 上限 25000 でページングして全行取る。 */
async function fetchAll(q, body, cap = 200000) {
  const out = [];
  const LIMIT = 25000;
  for (let startRow = 0; startRow < cap; startRow += LIMIT) {
    const rows = await q({ ...body, rowLimit: LIMIT, startRow });
    out.push(...rows);
    process.stderr.write(`\r  取得 ${out.length} 行…`);
    if (rows.length < LIMIT) break;
  }
  process.stderr.write('\n');
  return out;
}

// ───────────────── 軸の辞書 ─────────────────
const PREFS = ['北海道','青森','岩手','宮城','秋田','山形','福島','茨城','栃木','群馬','埼玉','千葉','東京','神奈川','新潟','富山','石川','福井','山梨','長野','岐阜','静岡','愛知','三重','滋賀','京都','大阪','兵庫','奈良','和歌山','鳥取','島根','岡山','広島','山口','徳島','香川','愛媛','高知','福岡','佐賀','長崎','熊本','大分','宮崎','鹿児島','沖縄'];
const WARDS23 = ['千代田','中央区','港区','新宿','文京','台東','墨田','江東','品川','目黒','大田','世田谷','渋谷','中野','杉並','豊島','北区','荒川','板橋','練馬','足立','葛飾','江戸川'];
const CITIES = ['横浜','川崎','さいたま','千葉市','船橋','柏市','八王子','立川','町田','吉祥寺','池袋','新宿','渋谷','上野','浅草','品川','錦糸町','大宮','越谷','所沢','川越','藤沢','鎌倉','海老名','武蔵小杉','豊洲','有明','お台場','二子玉川','たまプラーザ','南大沢','聖蹟桜ヶ丘','北千住','蒲田','自由が丘','中目黒','恵比寿','六本木','銀座','日本橋','秋葉原','神田','高円寺','荻窪','三鷹','国分寺','府中','調布','多摩','稲城','川口','草加','三郷','市川','浦安','幕張','津田沼','梅田','難波','天王寺','神戸','三宮','名古屋','札幌','仙台','広島市','博多','天神'];

/**
 * 軸の定義。match は正規表現、label は集計キー。
 * 順序は評価順（先に来たものが優先されるわけではなく、全部評価して該当を全部持つ）。
 */
const AXES = {
  年齢: [
    [/0\s*歳|ゼロ歳|新生児|乳児/, '0歳'],
    [/1\s*歳/, '1歳'], [/2\s*歳/, '2歳'], [/3\s*歳/, '3歳'],
    [/4\s*歳/, '4歳'], [/5\s*歳/, '5歳'], [/6\s*歳/, '6歳'],
    [/赤ちゃん|ベビー(?!カー|チェア|ベッド|ルーム)/, '赤ちゃん'],
    [/幼児|未就学|園児/, '幼児'],
    [/小学生|小1|小学校低学年/, '小学生'],
    [/何歳|いつから|年齢制限|対象年齢/, '年齢条件'],
  ],
  季節: [
    [/夏休み/, '夏休み'], [/冬休み/, '冬休み'], [/春休み/, '春休み'],
    [/ゴールデンウィーク|GW|ＧＷ/, 'GW'], [/お盆/, 'お盆'],
    [/年末年始|正月|お正月/, '年末年始'], [/クリスマス/, 'クリスマス'],
    [/ハロウィン/, 'ハロウィン'], [/七五三/, '七五三'],
    [/(?<!休み)夏(?!休み)|真夏/, '夏'], [/(?<!休み)冬(?!休み)/, '冬'],
    [/(?<!休み)春(?!休み)/, '春'], [/秋/, '秋'],
    [/20\d\d年?|今年|来年/, '年号'],
  ],
  天候: [
    [/雨の日|雨でも|雨天/, '雨'], [/(?<!の)雨(?!の日)/, '雨'],
    [/猛暑|酷暑|暑い|暑さ/, '暑い'], [/寒い|寒さ/, '寒い'],
    [/雪/, '雪'], [/晴れ/, '晴れ'], [/台風/, '台風'],
  ],
  場所: [
    [new RegExp(`(${PREFS.join('|')})(都|府|県)?`), '都道府県'],
    [new RegExp(`(${WARDS23.join('|')})区?`), '23区'],
    [new RegExp(`(${CITIES.join('|')})`), '市区町村・地名'],
    [/.{2,8}駅/, '駅'],
    [/近く|周辺|近所|付近/, '近隣'],
  ],
  目的: [
    [/遊び場|遊べる|遊ぶ|プレイ/, '遊ぶ'],
    [/おでかけ|お出かけ|お出掛け/, 'おでかけ'],
    [/ランチ|ご飯|ごはん|食事|外食|ディナー|モーニング|朝食/, '食べる'],
    [/体験|作れる|工作|イベント/, '体験'],
    [/見る|見学|鑑賞/, '見る'],
    [/学べる|学習|知育/, '学ぶ'],
    [/水遊び|プール|じゃぶじゃぶ|水場/, '水遊び'],
    [/室内|屋内|インドア/, '室内'],
    [/泊まり|宿泊|ホテル|旅館/, '泊まる'],
  ],
  予算: [
    [/無料|タダ|ただで|0円/, '無料'],
    [/\d[,\d]*円(以下|以内|台|未満)/, '価格上限'],
    [/安い|格安|お得|リーズナブル|コスパ/, '安い'],
    [/料金|値段|いくら|価格|費用/, '料金'],
  ],
  設備: [
    [/ベビーチェア|子供[用の]*[椅い]す|子ども[用の]*[椅い]す|キッズチェア|ハイチェア/, 'ベビーチェア'],
    [/授乳室|授乳/, '授乳室'],
    [/おむつ替え|おむつ交換|オムツ替え|おむつ台/, 'おむつ替え'],
    [/ベビーカー/, 'ベビーカー'],
    [/個室/, '個室'],
    [/キッズスペース|キッズルーム|プレイルーム/, 'キッズスペース'],
    [/座敷|お座敷|掘りごたつ|小上がり/, '座敷'],
    [/子連れ|子ども連れ|こども連れ|ファミリー/, '子連れ'],
    [/離乳食|持ち込み/, '離乳食・持込'],
    [/キッズメニュー|お子様メニュー|おこさまメニュー|子供メニュー/, 'キッズメニュー'],
    [/駐車場/, '駐車場'],
    [/予約/, '予約'],
  ],
  施設種別: [
    [/水族館/, '水族館'], [/動物園/, '動物園'], [/公園/, '公園'],
    [/遊園地|テーマパーク/, '遊園地'], [/牧場/, '牧場'],
    [/科学館|博物館|美術館/, 'ミュージアム'],
    [/室内遊び場|屋内遊び場|アスレチック/, '室内遊び場'],
    [/温泉|銭湯/, '温泉'], [/キャンプ|BBQ|バーベキュー/, 'キャンプ'],
    [/カフェ|レストラン|ファミレス|寿司|焼肉|ラーメン|回転寿司/, '飲食店'],
  ],
};

/** 固有名詞（チェーン名・スポット名）辞書をリポジトリから作る。 */
function loadBrands() {
  const chains = ['サイゼリヤ','サイゼ','王将','ガスト','やよい軒','ココス','バーミヤン','ジョナサン','はま寿司','スシロー','くら寿司','かっぱ寿司','丸亀','吉野家','すき家','ジョイフル','デニーズ','ロイヤルホスト','ビッグボーイ','牛角','焼肉キング','しゃぶ葉','大戸屋','日高屋','てんや','幸楽苑','リンガーハット','びっくりドンキー','ココイチ','マクドナルド','マック','ケンタッキー','モスバーガー','なか卯','松屋','星乃珈琲','コメダ','夢庵','安楽亭','木曽路','とんでん','8番らーめん','天丼てんや'];
  const files = [`${REPO}/lib/spots.ts`];
  for (let i = 1; i <= 8; i++) files.push(`${REPO}/lib/spots-extra/batch-${i}.ts`);
  const spotNames = new Set();
  for (const f of files) {
    if (!existsSync(f)) continue;
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(/name: '([^']{2,40})'/g)) spotNames.add(m[1]);
  }
  return { chains, spotNames: [...spotNames] };
}

const BRANDS = loadBrands();
// スポット名は括弧や記号を落として素のキーワードにする
const SPOT_KEYS = BRANDS.spotNames
  .map((n) => n.replace(/[（(].*$/, '').trim())
  .filter((n) => n.length >= 3 && n.length <= 14);

function classify(query) {
  const q = query.replace(/\s+/g, ' ');
  const hits = {};
  for (const [axis, rules] of Object.entries(AXES)) {
    const vals = new Set();
    for (const [re, label] of rules) {
      if (re.test(q)) vals.add(label);
    }
    if (vals.size) hits[axis] = [...vals];
  }
  // 固有名詞
  const brandHit = BRANDS.chains.find((c) => q.includes(c)) || SPOT_KEYS.find((s) => q.includes(s));
  if (brandHit) hits['固有名詞'] = [brandHit];
  return hits;
}

// ───────────────── 集計 ─────────────────
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const h = (t) => console.log(`\n\x1b[1m═══ ${t} ═══\x1b[0m`);

function agg() {
  return { clicks: 0, imp: 0, posSum: 0, n: 0, ex: [] };
}
function add(a, r) {
  a.clicks += r.clicks;
  a.imp += r.impressions;
  a.posSum += r.position * r.impressions;
  a.n += 1;
  if (a.ex.length < 60) a.ex.push(r);
}
function pos(a) { return a.imp ? a.posSum / a.imp : 0; }
function ctr(a) { return a.imp ? (a.clicks / a.imp) * 100 : 0; }

function line(name, a, width = 30) {
  const nm = name.length > width ? name.slice(0, width - 1) + '…' : name.padEnd(width, '　').slice(0, width);
  return `${nm} imp ${String(fmt(a.imp)).padStart(9)}  clk ${String(fmt(a.clicks)).padStart(7)}  CTR ${ctr(a).toFixed(2).padStart(6)}%  pos ${pos(a).toFixed(1).padStart(5)}  クエリ数 ${String(fmt(a.n)).padStart(7)}`;
}

async function main() {
  const q = await makeQuery();
  const { start, end } = range();
  console.log(`\x1b[1mGSC 軸クロス分析\x1b[0m  site=${SITE}`);
  console.log(`期間: ${start} 〜 ${end}（${DAYS}日 / GSC遅延${LAG}日）`);
  console.error('クエリ次元を取得中…');
  const rows = await fetchAll(q, { startDate: start, endDate: end, dimensions: ['query'], type: 'web' });
  console.log(`取得クエリ数: ${fmt(rows.length)}`);

  const total = rows.reduce((a, r) => ({ c: a.c + r.clicks, i: a.i + r.impressions }), { c: 0, i: 0 });
  console.log(`合計 imp ${fmt(total.i)} / clicks ${fmt(total.c)} / CTR ${((total.c / total.i) * 100).toFixed(2)}%`);

  const classified = rows.map((r) => ({
    q: r.keys[0], clicks: r.clicks, impressions: r.impressions, position: r.position,
    hits: classify(r.keys[0]),
  }));

  // ── 1. 単軸ごとの規模 ──
  h('1. 単軸ごとの検索需要（その軸を含むクエリの合計）');
  const perAxis = {};
  for (const c of classified) {
    for (const axis of Object.keys(c.hits)) {
      (perAxis[axis] ||= agg(), add(perAxis[axis], c));
    }
  }
  const noAxis = agg();
  for (const c of classified) if (Object.keys(c.hits).length === 0) add(noAxis, c);
  for (const [axis, a] of Object.entries(perAxis).sort((x, y) => y[1].imp - x[1].imp)) {
    console.log(line(axis, a, 12) + `  全体比 ${((a.imp / total.i) * 100).toFixed(1)}%`);
  }
  console.log(line('(軸なし)', noAxis, 12) + `  全体比 ${((noAxis.imp / total.i) * 100).toFixed(1)}%`);

  // ── 2. 軸の本数分布 ──
  h('2. 「何軸の掛け算か」別の規模 ← 掛け算DB案の当否はここで決まる');
  const perDepth = {};
  for (const c of classified) {
    const d = Object.keys(c.hits).length;
    (perDepth[d] ||= agg(), add(perDepth[d], c));
  }
  for (const d of Object.keys(perDepth).sort((a, b) => a - b)) {
    console.log(line(`${d}軸`, perDepth[d], 10) + `  全体比 ${((perDepth[d].imp / total.i) * 100).toFixed(1)}%`);
  }

  // ── 3. 軸の組み合わせ（signature）別 ──
  h('3. 軸の組み合わせ別 TOP30（imp降順）');
  const perCombo = {};
  for (const c of classified) {
    const sig = Object.keys(c.hits).sort().join(' × ') || '(軸なし)';
    (perCombo[sig] ||= agg(), add(perCombo[sig], c));
  }
  const combos = Object.entries(perCombo).sort((a, b) => b[1].imp - a[1].imp);
  for (const [sig, a] of combos.slice(0, 30)) {
    console.log(line(sig, a, 44));
    const ex = a.ex.slice().sort((x, y) => y.impressions - x.impressions).slice(0, 3)
      .map((e) => `${e.q}(${fmt(e.impressions)})`).join(' / ');
    console.log(`    例: ${ex}`);
  }

  // ── 4. 提案された掛け算パターンの実測 ──
  h('4. 提案された掛け算パターンの実測（そのクエリは実在するか）');
  const patterns = [
    ['年齢 × 天候', (h) => h.年齢 && h.天候],
    ['年齢 × 天候 × 場所', (h) => h.年齢 && h.天候 && h.場所],
    ['年齢 × 場所', (h) => h.年齢 && h.場所],
    ['年齢 × 季節 × 場所', (h) => h.年齢 && h.季節 && h.場所],
    ['予算 × 場所', (h) => h.予算 && h.場所],
    ['予算 × 場所 × 年齢', (h) => h.予算 && h.場所 && h.年齢],
    ['天候 × 場所', (h) => h.天候 && h.場所],
    ['季節 × 場所', (h) => h.季節 && h.場所],
    ['場所 × 目的', (h) => h.場所 && h.目的],
    ['設備 × 固有名詞', (h) => h.設備 && h.固有名詞],
    ['設備 × 場所', (h) => h.設備 && h.場所],
    ['固有名詞 × 年齢', (h) => h.固有名詞 && h.年齢],
    ['固有名詞のみ含む', (h) => !!h.固有名詞],
    ['設備を含む', (h) => !!h.設備],
  ];
  for (const [name, fn] of patterns) {
    const a = agg();
    for (const c of classified) if (fn(c.hits)) add(a, c);
    console.log(line(name, a, 22) + `  全体比 ${((a.imp / total.i) * 100).toFixed(2)}%`);
    if (a.n) {
      const ex = a.ex.slice().sort((x, y) => y.impressions - x.impressions).slice(0, 3)
        .map((e) => `${e.q}(${fmt(e.impressions)}imp/${e.clicks}clk/pos${e.position.toFixed(1)})`).join(' / ');
      console.log(`    例: ${ex}`);
    }
  }

  // ── 5. 軸の値レベル：どの値が需要を持つか ──
  h('5. 軸の「値」別 需要 TOP（面を作るならこの値から）');
  for (const axis of ['年齢', '天候', '予算', '設備', '施設種別', '目的', '季節']) {
    const perVal = {};
    for (const c of classified) {
      for (const v of c.hits[axis] || []) (perVal[v] ||= agg(), add(perVal[v], c));
    }
    const top = Object.entries(perVal).sort((a, b) => b[1].imp - a[1].imp).slice(0, 8);
    if (!top.length) continue;
    console.log(`\n\x1b[1m[${axis}]\x1b[0m`);
    for (const [v, a] of top) console.log('  ' + line(v, a, 16));
  }

  // ── 6. 未回収の掛け算（imp あるが順位が悪い） ──
  h('6. 2軸以上 × imp≥300 × pos>8 の未回収クエリ TOP25（面が無い/弱い候補）');
  const gap = classified
    .filter((c) => Object.keys(c.hits).length >= 2 && c.impressions >= 300 && c.position > 8)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25);
  for (const c of gap) {
    console.log(`  ${String(fmt(c.impressions)).padStart(7)}imp  ${String(c.clicks).padStart(4)}clk  pos${c.position.toFixed(1).padStart(5)}  ${c.q}   [${Object.keys(c.hits).join('×')}]`);
  }
  if (!gap.length) console.log('  該当なし');

  if (JSON_OUT) {
    writeFileSync(JSON_OUT, JSON.stringify({ site: SITE, start, end, total, rows: classified }, null, 0));
    console.log(`\nJSON: ${JSON_OUT}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
