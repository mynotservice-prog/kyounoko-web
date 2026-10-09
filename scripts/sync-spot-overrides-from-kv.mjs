#!/usr/bin/env node
/**
 * 本番KV → lib/spot-overrides.json の一方向同期。
 *
 * ── なぜ必要か ──────────────────────────────────────────
 * スポットの上書き（note / hiddenTip / faq / images 等）は、本番では **KVが正**。
 * lib/spot-overrides.ts の getRuntimeSpotOverrides() が
 * 「KVがあればバンドルされたJSONを無視する」ため、**JSONを直してコミットしても本番は変わらない**。
 * 2026-08-19 に実際に2件（舎人公園の会期・コレットマーレの授乳室の階）が空振りした。
 *
 * さらに悪いのは、管理画面から作られたスポットがKVにしか無いこと。
 * 2026-08-19時点でKVのみ68件 / 内容差15件 / ファイルのみ1件。
 * この68件は git にバックアップが存在しない。
 *
 * ── このスクリプトの役割 ────────────────────────────────
 * 本番KVの内容をそのまま JSON に写し取る。**本番には一切書き込まない**（GETのみ）。
 *   - git が本番の正確な写しになる（68件のバックアップができる）
 *   - ローカル開発（KV未設定なのでJSONを読む）の表示が本番と一致する
 *   - 「JSONを直したのに反映されない」事故を防ぐ
 *
 * 逆向き（JSON → 本番KV）は scripts/push-spot-overrides-to-kv.mjs。
 *
 * 使い方:
 *   node scripts/sync-spot-overrides-from-kv.mjs --dry    # 差分を見るだけ
 *   node scripts/sync-spot-overrides-from-kv.mjs          # 書き込む
 *   node scripts/sync-spot-overrides-from-kv.mjs --site=https://kyounoko.jp
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};
const DRY = process.argv.includes('--dry');
const SITE = arg('site', 'https://kyounoko.jp');
const FILE = 'lib/spot-overrides.json';

/** .env.local を軽くパース（既存の env を上書きしない）。ADMIN_USER / ADMIN_PASSWORD 用。 */
function loadEnvLocal() {
  if (!existsSync('.env.local')) return;
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnvLocal();

/**
 * /api/admin/* は 2026-10-09 から middleware の Basic 認証の内側（Referer だけでは 401）。
 * .env.local の ADMIN_USER / ADMIN_PASSWORD（本番と同じ値）から Authorization を組み立てる。
 * 値はログに出さない。
 */
function adminBasicAuthHeader() {
  const u = process.env.ADMIN_USER;
  const p = process.env.ADMIN_PASSWORD;
  if (!u || !p) return {};
  return { Authorization: `Basic ${Buffer.from(`${u}:${p}`, 'utf8').toString('base64')}` };
}

const res = await fetch(`${SITE}/api/admin/spot-overrides`, {
  // /api/admin/* は middleware の Basic 認証 ＋ route の Referer 判定（/admin/ を含むこと）
  headers: { Referer: `${SITE}/admin/spots/edit`, ...adminBasicAuthHeader() },
});
if (!res.ok) {
  console.error(`KV取得に失敗: HTTP ${res.status}`, (await res.text()).slice(0, 200));
  process.exit(1);
}
const { overrides: kv } = await res.json();
if (!kv || typeof kv !== 'object') {
  console.error('レスポンスに overrides がありません');
  process.exit(1);
}

const local = JSON.parse(readFileSync(FILE, 'utf8'));
const kvKeys = Object.keys(kv);
const localKeys = Object.keys(local);
const onlyKv = kvKeys.filter((k) => !(k in local));
const onlyLocal = localKeys.filter((k) => !(k in kv));
const changed = kvKeys.filter((k) => k in local && JSON.stringify(kv[k]) !== JSON.stringify(local[k]));

console.log(`本番KV ${kvKeys.length}件 / ローカル ${localKeys.length}件`);
console.log(`  追加: ${onlyKv.length}  変更: ${changed.length}  ローカルのみ: ${onlyLocal.length}`);
for (const k of changed) {
  const fields = [...new Set([...Object.keys(kv[k] ?? {}), ...Object.keys(local[k] ?? {})])]
    .filter((f) => JSON.stringify(kv[k]?.[f]) !== JSON.stringify(local[k]?.[f]));
  console.log(`    ~ ${k}: ${fields.join(', ')}`);
}
if (onlyLocal.length) {
  console.log('\n  ⚠ ローカルにしか無いslug（KVには存在しない = 本番では効いていない）:');
  for (const k of onlyLocal) console.log(`    - ${k}`);
  console.log('    KVが正なので、このスクリプトはこれらを削除します。');
  console.log('    本番に残したいものがあれば、先に push-spot-overrides-to-kv.mjs で送ってください。');
}

if (DRY) {
  console.log('\n--dry のため書き込みません。');
  process.exit(0);
}

// キー順を固定して以後の diff を読めるようにする（順序に機能的な意味はない）
const sorted = Object.fromEntries(kvKeys.sort().map((k) => [k, kv[k]]));
writeFileSync(FILE, JSON.stringify(sorted, null, 2) + '\n');
console.log(`\n${FILE} を本番KVの内容で更新しました（${kvKeys.length}件）。`);
