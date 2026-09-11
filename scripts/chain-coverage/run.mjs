#!/usr/bin/env node
/**
 * 設備カバー率センサスの実行と集約。
 *
 *   node scripts/chain-coverage/run.mjs                 # 全アダプタを順に実行 → 集約
 *   node scripts/chain-coverage/run.mjs anrakutei kura  # 指定チェーンだけ実行 → 集約
 *   node scripts/chain-coverage/run.mjs --aggregate     # 実行せず data/chain-coverage/*.json を集約だけ
 *
 * 集約先 data/chain-coverage.json は stores を落とした軽い形（lib/chain-coverage.ts が import する）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { OUT_DIR, save } from './_lib.mjs';

const args = process.argv.slice(2);
const aggregateOnly = args.includes('--aggregate');
const only = args.filter((a) => !a.startsWith('--'));
const dir = path.dirname(new URL(import.meta.url).pathname);

if (!aggregateOnly) {
  const adapters = fs.readdirSync(dir).filter((f) => f.endsWith('.mjs') && !f.startsWith('_') && f !== 'run.mjs').map((f) => f.replace(/\.mjs$/, ''));
  const targets = only.length ? only : adapters;
  const failed = [];
  for (const chain of targets) {
    if (!adapters.includes(chain)) { console.error(`⚠ アダプタがありません: ${chain}`); failed.push(chain); continue; }
    try {
      const mod = await import(pathToFileURL(path.join(dir, `${chain}.mjs`)).href);
      save(await mod.crawl());
    } catch (e) {
      console.error(`❌ ${chain}: ${e.message}`);
      failed.push(chain);
    }
  }
  if (failed.length) console.error(`\n失敗: ${failed.join(' ')}`);
}

// ---- 集約 ----
const files = fs.existsSync(OUT_DIR) ? fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.json')).sort() : [];
const chains = files.map((f) => {
  const j = JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), 'utf8'));
  const { stores, ...rest } = j;
  return rest;
});
const out = {
  generatedAt: new Date().toISOString().slice(0, 10),
  method: '各チェーンの公式店舗検索が店舗ごとに公開する設備属性を全店舗分取得し、設備ごとに「表示のある店舗数 / 数えた店舗数」を集計',
  chains,
};
fs.writeFileSync('data/chain-coverage.json', JSON.stringify(out, null, 2) + '\n');
const cells = chains.reduce((a, c) => a + Object.keys(c.facilities).length, 0);
const storesN = chains.reduce((a, c) => a + c.total, 0);
console.error(`\n📦 data/chain-coverage.json: ${chains.length}チェーン / ${storesN.toLocaleString()}店 / ${cells}属性`);
