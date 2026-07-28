#!/usr/bin/env node
/**
 * トップの「人気の記事」を実績から生成する。
 *
 *   node scripts/build-popular-articles.mjs            直近28日のGSCクリック上位を書き出す
 *   node scripts/build-popular-articles.mjs --days=90
 *   node scripts/build-popular-articles.mjs --dry-run  書き込まずに結果だけ表示
 *
 * ── なぜ必要か（2026-07-28 の実測）────────────────────────────────────────────
 * `lib/popular-articles.ts` は **2026-05-25 時点のGSCデータを手で書き写した固定リスト**
 * だった。2か月放置され、実績と乖離していた。
 *
 *   GA4のセッション実測トップ3: ohsho-kids-menu(3,510) / sushiro-kids-menu(1,551) /
 *   hoshino-morning-kosodate(1,543)  → **この3本は固定リストに1本も入っていなかった**
 *
 * さらに `pageReferrer` で遷移を追ったところ、**トップから記事へ進むのは全遷移の12%**で、
 * 残りはトップ・カテゴリ・/today の間をうろついていた。**いま読まれている記事を出して
 * いないトップ**が、回遊が伸びない一因になっている。
 *
 * ── 設計 ────────────────────────────────────────────────────────────────────
 * ビルド時にAPIを叩かない（憲章: build に含めるのは読み取りのみ・外部依存を増やさない）。
 * このスクリプトを週次で回して JSON を書き出し、アプリはその JSON を読むだけにする。
 * `gifts-catalog.json` と同じ運用。
 *
 * 除外するもの:
 *  - noindex 記事（検索から外している面をトップで推すのは矛盾）
 *  - 記事以外のパス（/category /spot /today など）
 *  - アンカー行（`/article/x#見出し`）は本体に畳む
 */
import { JWT } from 'google-auth-library';
import { readFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const DAYS = Number(arg('days', '28'));
const LAG = Number(arg('lag', '3'));
const LIMIT = Number(arg('limit', '12'));
const DRY = process.argv.includes('--dry-run');
const SITE = 'sc-domain:kyounoko.jp';
const OUT = 'lib/popular-articles.json';
const ARTICLES_DIR = 'content/articles';

function loadCreds() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) return JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  if (existsSync('.env.local')) {
    for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
      const m = line.match(/^\s*GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON_PATH\s*=\s*(.*)\s*$/);
      if (m) {
        const p = m[1].replace(/^["']|["']$/g, '');
        if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8'));
      }
    }
  }
  if (existsSync('./credentials/google-indexing.json')) return JSON.parse(readFileSync('./credentials/google-indexing.json', 'utf8'));
  console.error('✗ GSC の認証情報が見つかりません（credentials/google-indexing.json）。');
  process.exit(2);
}
const creds = loadCreds();
const jwt = new JWT({ email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });
const d = (o) => { const t = new Date(); t.setDate(t.getDate() - o); return t.toISOString().slice(0, 10); };
const startDate = d(LAG + DAYS - 1), endDate = d(LAG);

// noindex の記事はトップで推さない
const noindex = new Set();
for (const f of readdirSync(ARTICLES_DIR)) {
  if (!f.endsWith('.md')) continue;
  const raw = readFileSync(join(ARTICLES_DIR, f), 'utf8');
  if (/^noindex:\s*true/m.test(raw)) {
    const slug = (raw.match(/^slug:\s*(.*)$/m)?.[1] || f.replace(/\.md$/, '')).trim();
    noindex.add(slug);
  }
}

const rows = [];
for (let start = 0; ; start += 25000) {
  const res = await jwt.request({
    url: `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
    method: 'POST',
    data: { startDate, endDate, dimensions: ['page'], rowLimit: 25000, startRow: start, dataState: 'final' },
  });
  const got = res.data.rows || [];
  rows.push(...got);
  if (got.length < 25000) break;
}

const byslug = new Map();
for (const r of rows) {
  const url = r.keys[0];
  if (!url.includes('/article/')) continue;
  const slug = url.split('#')[0].replace(/.*\/article\//, '').replace(/\/$/, '');
  if (!slug || noindex.has(slug)) continue;
  byslug.set(slug, (byslug.get(slug) || 0) + r.clicks);
}

const ranked = [...byslug.entries()]
  .filter(([, c]) => c > 0)
  .sort((a, b) => b[1] - a[1])
  .slice(0, LIMIT);

console.log(`GSC ${startDate} 〜 ${endDate}（${DAYS}日・クリック順・noindex除外）`);
ranked.forEach(([slug, clicks], i) => console.log(`  ${String(i + 1).padStart(2)}. ${String(clicks).padStart(5)}clk  ${slug}`));

if (DRY) { console.log('\n--dry-run のため書き込みません。'); process.exit(0); }

const payload = {
  generatedAt: new Date().toISOString().slice(0, 10),
  source: `Search Console clicks ${startDate}..${endDate}`,
  slugs: ranked.map(([slug]) => slug),
};
writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n');
console.log(`\n→ ${OUT} に ${payload.slugs.length} 件を書き出しました（generatedAt=${payload.generatedAt}）`);
