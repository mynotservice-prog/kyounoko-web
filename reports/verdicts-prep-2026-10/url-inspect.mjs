#!/usr/bin/env node
/**
 * 判定用: 対象URL群を URL検査API で検査し、索引状態を群別・型別に集計する（読み取り専用）。
 *
 * 本体チェックアウトのルートから実行する:
 *   node reports/verdicts-prep-2026-10/url-inspect.mjs --set=cohort137 --out=reports/verdicts-prep-2026-10/inspect-cohort137-2026-10-03.json
 *
 *   --set=<name>   targets.json のセット名
 *   --out=<path>   検査結果のキャッシュ兼保存先（再実行は未検査分だけ検査する）
 *   --max=N        今回検査する上限（試走用）
 *
 * クォータ: 1プロパティ 2,000件/日・600件/分。137本は1回で足りる。
 */
import { JWT } from 'google-auth-library';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const SITE = arg('site', 'sc-domain:kyounoko.jp');
const SET = arg('set', '');
const OUT = arg('out', '');
const MAX = Number(arg('max', '100000'));

const targets = JSON.parse(readFileSync(join(HERE, 'targets.json'), 'utf8'));
if (!SET || !targets[SET] || !OUT) {
  console.error('使い方: --set=<name> --out=<保存先.json> [--max=N]');
  process.exit(1);
}
const groups = targets[SET].groups;
const slugGroup = new Map();
for (const [g, slugs] of Object.entries(groups)) for (const s of slugs) slugGroup.set(s, g);
const typeOf = (s) => (s.match(/-(kodzure-koryaku|kodomo-ryokin|rinyushoku-mochikomi|kosodate)$/) || [, 'その他'])[1];

const p = './credentials/google-indexing.json';
if (!existsSync(p)) {
  console.error('認証情報が見つかりません（本体チェックアウトのルートから実行してください）: ' + p);
  process.exit(1);
}
const c = JSON.parse(readFileSync(p, 'utf8'));
const jwt = new JWT({ email: c.client_email, key: c.private_key, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });

const cache = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
const pending = [...slugGroup.keys()].filter((s) => !cache[s] || cache[s].err);
const todo = pending.slice(0, MAX);
console.log(`set=${SET}  対象 ${slugGroup.size}本 ／ 保存済み ${slugGroup.size - pending.length}本 ／ 今回検査 ${todo.length}本`);

let done = 0;
const queue = [...todo];
const worker = async () => {
  for (;;) {
    const s = queue.shift();
    if (!s) return;
    const u = `https://kyounoko.jp/article/${s}`;
    for (let a = 0; a < 4; a++) {
      try {
        const r = await jwt.request({
          url: 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
          method: 'POST',
          data: { inspectionUrl: u, siteUrl: SITE, languageCode: 'ja' },
        });
        const x = r.data.inspectionResult.indexStatusResult || {};
        cache[s] = {
          verdict: x.verdict, cov: x.coverageState, robots: x.robotsTxtState, indexing: x.indexingState, fetch: x.pageFetchState,
          crawl: x.lastCrawlTime || '', googleCanonical: x.googleCanonical || '', userCanonical: x.userCanonical || '',
          inspectedAt: new Date().toISOString(),
        };
        break;
      } catch (e) {
        const code = e.response?.status;
        if (code === 429 || code === 503) { await new Promise((r2) => setTimeout(r2, 3000 * (a + 1))); continue; }
        cache[s] = { err: e.response?.data?.error?.message || e.message };
        break;
      }
    }
    if (++done % 25 === 0) { writeFileSync(OUT, JSON.stringify(cache, null, 1)); console.log(`  ${done}件`); }
  }
};
await Promise.all(Array.from({ length: 4 }, worker));
writeFileSync(OUT, JSON.stringify(cache, null, 1));

// ---- 集計 ----
const inspected = [...slugGroup.keys()].filter((s) => cache[s] && !cache[s].err);
const errs = [...slugGroup.keys()].filter((s) => cache[s]?.err);
const isIndexed = (x) => x.verdict === 'PASS'; // 登録済み（coverageState の文言は言語設定で変わるので verdict で判定）
console.log(`\n検査済み ${inspected.length}/${slugGroup.size}本 ／ エラー ${errs.length}本${errs.length ? '（' + errs.map((s) => `${s}: ${cache[s].err}`).join(' / ').slice(0, 300) + '）' : ''}`);
if (inspected.length < slugGroup.size) console.log('⚠️ 全件を検査し終えていない。この集計は判定に使わない。');

console.log('\n=== 群別 coverageState ===');
for (const g of Object.keys(groups)) {
  const t = {};
  for (const s of groups[g]) if (cache[s] && !cache[s].err) t[cache[s].cov || '(空)'] = (t[cache[s].cov || '(空)'] || 0) + 1;
  console.log(`[${g}] ${groups[g].length}本: ` + Object.entries(t).map(([k, v]) => `${k}=${v}`).join(' / '));
}

const non = inspected.filter((s) => !isIndexed(cache[s]));
console.log(`\n=== 未登録（verdict が PASS 以外。クロール済み・未登録を含む）: ${non.length}本 / 検査済み ${inspected.length}本（${inspected.length ? ((non.length / inspected.length) * 100).toFixed(1) : '—'}%）===`);
const byType = {};
for (const s of inspected) {
  const k = `${slugGroup.get(s)}/${typeOf(s)}`;
  byType[k] = byType[k] || { n: 0, non: 0 };
  byType[k].n++;
  if (!isIndexed(cache[s])) byType[k].non++;
}
console.log('型別（未登録/検査済み）: ' + Object.entries(byType).map(([k, v]) => `${k}=${v.non}/${v.n}`).join(' ｜ '));
for (const s of non) console.log(`  ${s} [${slugGroup.get(s)}] ${cache[s].cov} ／ 最終クロール ${cache[s].crawl.slice(0, 10) || 'なし'} ／ canonical一致 ${cache[s].googleCanonical === cache[s].userCanonical}`);
const canonMismatch = inspected.filter((s) => cache[s].googleCanonical && cache[s].userCanonical && cache[s].googleCanonical !== cache[s].userCanonical);
console.log(`canonical 不一致: ${canonMismatch.length}本 ${canonMismatch.join(', ')}`);
