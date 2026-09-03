#!/usr/bin/env node
/**
 * サイトマップの健全性を検査する。
 *
 * 【なぜ必要か】2026-09-03 に、GSC の sitemaps API で `lastDownloaded` が
 * **2026-07-13 のまま52日間動いていない**ことが判明した。表示0だったURL 663本を
 * URL検査APIで全数検査すると、**65%(431本) が「URL が Google に認識されていません」**
 * ＝サイトマップ経由の発見が完全に止まっていた。
 *
 * 真因は lastmod の嘘だった。全3,791URLのうち 2,940本(78%) が `new Date()` =
 * ビルド時刻で、デプロイごとに「駅もスポットも全部きょう更新した」と申告していた。
 * lastmod がシグナルとして無価値になると Google は再取得頻度を落とす。
 *
 * 同じ事故は 2026-06-14 にも起きている（memory: kyounoko-index-discovery-stall）。
 * 2度あったので機械で検知する。
 *
 * 使い方:
 *   node --import ./scripts/_ts-resolve.mjs scripts/check-sitemap-health.mjs
 *   node --import ./scripts/_ts-resolve.mjs scripts/check-sitemap-health.mjs --remote  # 本番XMLを検査
 *   node --import ./scripts/_ts-resolve.mjs scripts/check-sitemap-health.mjs --gsc     # GSCの再取得日も確認
 *
 * 終了コード 1 = 要修正。
 */
import { readFileSync, existsSync } from 'node:fs';

const args = new Set(process.argv.slice(2));
const REMOTE = args.has('--remote');
const GSC = args.has('--gsc');

/** lastmod=ビルド日 が許される上限（真に毎日変わるハブ＋当日更新した記事の分）。 */
const MAX_TODAY_RATIO = 0.05;
const MAX_TODAY_COUNT = 60;

const today = new Date().toISOString().slice(0, 10);
const iso = (d) => new Date(d).toISOString().slice(0, 10);

async function loadRows() {
  if (REMOTE) {
    const xml = await fetch('https://kyounoko.jp/sitemap.xml').then((r) => r.text());
    const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
    return blocks.map((b) => ({
      url: (b.match(/<loc>([^<]*)<\/loc>/) ?? [])[1] ?? '',
      lastModified: (b.match(/<lastmod>([^<]*)<\/lastmod>/) ?? [])[1] ?? '',
    }));
  }
  const mod = await import('../app/sitemap.ts');
  return await mod.default();
}

let failed = false;
const fail = (msg) => { failed = true; console.error(`❌ ${msg}`); };
const ok = (msg) => console.log(`✅ ${msg}`);

const rows = await loadRows();
console.log(`サイトマップ URL数: ${rows.length}\n`);

// ① lastmod がビルド時刻で埋まっていないか（今回の事故の本体）
const todayRows = rows.filter((r) => r.lastModified && iso(r.lastModified) === today);
const ratio = todayRows.length / rows.length;
if (todayRows.length > MAX_TODAY_COUNT || ratio > MAX_TODAY_RATIO) {
  fail(
    `lastmod=本日 が ${todayRows.length}本 (${(ratio * 100).toFixed(1)}%)。` +
      `上限 ${MAX_TODAY_COUNT}本 / ${MAX_TODAY_RATIO * 100}%。` +
      `\n   app/sitemap.ts に new Date() が復活していないか確認する。` +
      `\n   毎ビルドで lastmod が動くと Google はサイトマップを再取得しなくなる。`,
  );
  const t = {};
  todayRows.forEach((r) => {
    const k = r.url.replace('https://kyounoko.jp', '').split('/')[1] || '(top)';
    t[k] = (t[k] || 0) + 1;
  });
  console.error('   内訳:', Object.entries(t).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' '));
} else {
  ok(`lastmod=本日 は ${todayRows.length}本 (${(ratio * 100).toFixed(1)}%) — 健全`);
}

// ② lastmod 欠落・不正日付
const badDate = rows.filter((r) => !r.lastModified || Number.isNaN(new Date(r.lastModified).getTime()));
if (badDate.length) fail(`lastmod が欠落/不正: ${badDate.length}本 例) ${badDate.slice(0, 3).map((r) => r.url).join(', ')}`);
else ok('lastmod の欠落・不正なし');

// ③ 未来日付（lastmod が未来だと無視される）
const future = rows.filter((r) => r.lastModified && iso(r.lastModified) > today);
if (future.length) fail(`lastmod が未来日付: ${future.length}本 例) ${future.slice(0, 3).map((r) => `${r.url}(${iso(r.lastModified)})`).join(', ')}`);
else ok('未来日付なし');

// ④ 重複URL
const seen = new Set();
const dup = [];
for (const r of rows) {
  const u = String(r.url).replace(/\/$/, '');
  if (seen.has(u)) dup.push(u);
  seen.add(u);
}
if (dup.length) fail(`重複URL: ${dup.length}本 例) ${dup.slice(0, 3).join(', ')}`);
else ok('重複URLなし');

// ⑤ クエリ付き・www・非https の混入
const dirty = rows.filter((r) => /\?|#|^https?:\/\/www\.|^http:\/\//.test(String(r.url)));
if (dirty.length) fail(`不正なURL形式: ${dirty.length}本 例) ${dirty.slice(0, 3).map((r) => r.url).join(', ')}`);
else ok('URL形式は正常（クエリ/www/http混入なし）');

// ⑥ GSC が実際に再取得しているか
if (GSC) {
  const credPath = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON_PATH || './credentials/google-indexing.json';
  if (!existsSync(credPath)) {
    console.log('\n（--gsc: 認証情報が無いのでスキップ）');
  } else {
    const { JWT } = await import('google-auth-library');
    const creds = JSON.parse(readFileSync(credPath, 'utf8'));
    const jwt = new JWT({ email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });
    const res = await jwt.request({
      url: `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent('sc-domain:kyounoko.jp')}/sitemaps`,
    });
    console.log('\n=== GSC のサイトマップ取得状況 ===');
    for (const s of res.data.sitemap ?? []) {
      const dl = s.lastDownloaded ? new Date(s.lastDownloaded) : null;
      const days = dl ? Math.floor((Date.now() - dl.getTime()) / 86400000) : null;
      console.log(`${s.path}\n  最終取得: ${dl ? iso(dl) : '未取得'}（${days ?? '-'}日前） errors:${s.errors} warnings:${s.warnings}`);
      if (days === null || days > 14) {
        fail(`サイトマップが ${days ?? '一度も'}日 再取得されていない。lastmod の信頼性か送信状態を疑う。`);
      }
    }
  }
}

console.log('');
if (failed) {
  console.error('要修正あり');
  process.exit(1);
}
console.log('サイトマップは健全');
