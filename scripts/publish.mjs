#!/usr/bin/env node
/**
 * kyounoko.jp 記事の本番反映を「検証まで含めて1コマンド」にする唯一の公開手段。
 *
 *   npm run publish -- --dry-run      何が起きるかだけ表示（読み取りのみ）
 *   npm run publish                   反映して素のURLで検証（出ていなければ非ゼロ終了）
 *   npm run publish -- --flatten      KV上書きを解除してから反映する
 *
 * ── なぜ作ったか（2026-07-27に同じ種類の見落としを1日で2回踏んだ）─────────────
 *  ① PR をマージしたのに `scripts/vercel-ignore-build.sh` でビルドが Canceled になり、
 *     「マージ成功＝本番反映」と誤認した。
 *  ② KV上書きの DELETE が purged:2 で成功応答を返したのに、素のURLは旧タイトルのままだった
 *     （CF が Vercel の ISR STALE を焼き付けていた）。
 *  どちらも「コマンドの成功応答」を信じたのが原因で、**素のURLを実測して初めて分かった**。
 *  → 成功応答を信じない。素のURLで期待文字列が出るまでを1コマンドの責務にする。
 *
 * ── このコマンドが保証すること ────────────────────────────────────────────────
 *  1. 対象slugに **KV上書き（article:overrides）が無い**（あれば既定で中断）。
 *     KV上書きがあると md を編集しても永久に本番へ出ない（lib/articles.ts getFileArticle）。
 *  2. **ビルドが実際に走った**（`vercel --prod --force` で ignoreCommand を回避）。
 *  3. **Production が Ready になった**（Canceled / Error はその場で失敗）。
 *  4. **origin(Vercel) が新しい内容を返す状態にしてから** CF をパージした
 *     （逆順にすると CF が STALE を焼き付ける ＝ 事故②の再現）。
 *  5. **キャッシュバスター無しの素のURL**に期待文字列（md の title）が出ている。
 *     1件でも不一致なら非ゼロ終了する。
 *
 * ── 保証しないこと ──────────────────────────────────────────────────────────
 *  - commit / push はしない（このスクリプトは git を書き換えない）。
 *  - KV認証情報が無い環境では、KV検査は「劣化モード」になる（後述）。黙って素通りはしない。
 *
 * 必要な env（すべて .env.local から自動読込。トークンは絶対に直書きしない）:
 *   KV_REST_API_URL / KV_REST_API_TOKEN     … KV上書きの厳密検査（無い場合は劣化モード）
 *   CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID … CFパージ（無い場合は警告して継続）
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// ───────────────────────────── 定数 ─────────────────────────────
const SITE = 'https://kyounoko.jp';
const ARTICLE_BASE = '/article/';
const KV_KEY = 'article:overrides';

/**
 * worktree から `vercel --prod` を叩くと `.vercel` が .gitignore 済みで存在せず、
 * **別プロジェクトが新規作成される**（既知の罠）。リンク先が下記と一致することを必ず確認する。
 */
const EXPECT_PROJECT_ID = 'prj_W9ghY1zDyMsY66dESilM4fpdpadK';
const EXPECT_ORG_ID = 'team_U0sZzweUqDP8AZHqHiVr03JI';

const OK = '✅';
const NG = '❌';
const WARN = '⚠️';

// ───────────────────────────── 引数 ─────────────────────────────
const rawArgs = process.argv.slice(2);
const flags = new Set();
const positional = [];
const opts = {};
for (const a of rawArgs) {
  if (a.startsWith('--')) {
    const eq = a.indexOf('=');
    if (eq === -1) flags.add(a);
    else opts[a.slice(2, eq)] = a.slice(eq + 1);
  } else positional.push(a);
}
const DRY_RUN = flags.has('--dry-run') || flags.has('-n');
const FLATTEN = flags.has('--flatten');
const VERIFY_ONLY = flags.has('--verify-only');
const SKIP_CF = flags.has('--no-cf');
const NO_BUILD = flags.has('--no-build');
const HELP = flags.has('--help') || flags.has('-h');
const EXPECT_OVERRIDE = opts.expect ?? null;
const RANGE_OPT = opts.range ?? null;
const SLUG_OPT = (opts.slug ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const BUILD_TIMEOUT_SEC = Number(opts['build-timeout'] ?? 2400); // 実測ビルド14分。既定40分。
const WARM_TRIES = Number(opts['warm-tries'] ?? 12);
const VERIFY_TRIES = Number(opts['verify-tries'] ?? 8);

if (HELP) {
  console.log(`
使い方: npm run publish -- [options] [slug...]

  --dry-run             何が起きるかだけ表示（KV検査・本番プローブは実行／書き込みはしない）
  --flatten             KV上書きを DELETE ?writeback=0 で解除してから進む（既定は中断）
  --range=<git range>   変更slugの算出レンジ（既定: origin/main..HEAD、無ければ HEAD^..HEAD）
  --slug=a,b            対象slugを明示（git diff を使わない）
  --expect="文字列"     期待文字列を上書き（既定は各slugの md frontmatter title）
  --verify-only         ビルド/パージをせず、素のURLの検証だけ実行
  --no-build            ビルドはせず、Ready待ち→ISR再生成→CFパージ→検証だけ行う
                        （git push / PRマージで既にビルドが走っている場合。重複ビルドを避ける）
  --no-cf               CFパージをスキップ
  --build-timeout=秒    Ready 待ちのタイムアウト（既定 2400）
`);
  process.exit(0);
}

// ───────────────────────────── ユーティリティ ─────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function git(args, { cwd, allowFail = false } = {}) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) {
    if (allowFail) return null;
    throw new Error(`git ${args.join(' ')} 失敗: ${(r.stderr || '').trim()}`);
  }
  return r.stdout;
}

/** リポジトリルート（worktree でも正しく解決される） */
function repoRoot() {
  const out = git(['rev-parse', '--show-toplevel'], { allowFail: true });
  if (!out) {
    console.error(`${NG} git リポジトリの中で実行してください。`);
    process.exit(2);
  }
  return out.trim();
}

const ROOT = repoRoot();
const ARTICLES_DIR = join(ROOT, 'content/articles');

/** .env.local を軽くパース（既存の env を上書きしない） */
function loadEnvLocal() {
  const p = join(ROOT, '.env.local');
  if (!existsSync(p)) return false;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return true;
}
const HAS_ENV_LOCAL = loadEnvLocal();

/**
 * frontmatter から1フィールドを取り出す。
 *
 * ⚠ ブロックスカラー（`title: >-` / `|-` など）に必ず対応すること。
 * 素朴に `^title:\s*(.*)$` で取ると **期待値が文字列 ">-" になり**、本番HTMLに
 * そんな文字列は無いので「反映されていない」と誤判定する（2026-07-28に実際に踏んだ）。
 * 記事の title は長いため `>-` で折り返されているものが多数ある。
 *
 * 折り返し行の連結は空文字で行う。日本語タイトルは行末に空白を入れずに
 * 折り返されており、実測（release fc8cc17 の98本）でも空文字連結が本番HTMLと一致した。
 */
function fmField(raw, key) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const block = m[1].match(new RegExp(`^${key}:[ \\t]*[>|][-+]?[ \\t]*\\n((?:[ \\t]+.*(?:\\n|$))+)`, 'm'));
  if (block) {
    return block[1]
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .join('');
  }
  const t = m[1].match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  return t ? t[1].trim().replace(/^["']|["']$/g, '') : null;
}

/** HTML実体参照を最小限デコードして比較のノイズを消す */
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'");
}

function titleTagOf(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decodeEntities(m[1]).trim() : null;
}

const urlFor = (slug) => `${SITE}${ARTICLE_BASE}${slug}`;

async function getPage(url) {
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'kyounoko-publish-verifier/1.0' },
      redirect: 'follow',
    });
    const html = await res.text();
    return {
      ok: true,
      status: res.status,
      cf: res.headers.get('cf-cache-status') ?? '-',
      vercel: res.headers.get('x-vercel-cache') ?? '-',
      age: res.headers.get('age') ?? '-',
      html,
    };
  } catch (e) {
    return { ok: false, status: 0, cf: '-', vercel: '-', age: '-', html: '', error: String(e.message || e) };
  }
}

/** 期待文字列が本文中に「実際に」出ているか。title タグと全文の両方を見る。 */
function matches(html, expect) {
  if (!html) return false;
  const decoded = decodeEntities(html);
  return decoded.includes(expect);
}

// ───────────────────── 1. Vercel リンク先ガード ─────────────────────
function vercelLinkGuard() {
  const projectJson = join(ROOT, '.vercel/project.json');
  const repoJson = join(ROOT, '.vercel/repo.json');
  let projectId = null;
  let orgId = null;
  let src = null;

  if (existsSync(projectJson)) {
    const j = JSON.parse(readFileSync(projectJson, 'utf8'));
    projectId = j.projectId ?? null;
    orgId = j.orgId ?? null;
    src = '.vercel/project.json';
  } else if (existsSync(repoJson)) {
    const j = JSON.parse(readFileSync(repoJson, 'utf8'));
    const p = (j.projects || []).find((x) => x.id === EXPECT_PROJECT_ID) || (j.projects || [])[0];
    projectId = p?.id ?? null;
    orgId = p?.orgId ?? null;
    src = '.vercel/repo.json';
  }

  if (!projectId || !orgId) {
    console.error(`${NG} Vercel のリンク情報が見つかりません（${ROOT}/.vercel）。`);
    console.error('   .vercel は .gitignore 済みなので、**worktree にはコピーされません**。');
    console.error('   この状態で `vercel --prod` を叩くと **別プロジェクトが新規作成される**（既知の罠）。');
    console.error('   対処: 本チェックアウト ~/Developer/kyounoko-web から実行するか、');
    console.error('         そこの .vercel/ をこのディレクトリへコピーしてください。');
    return { ok: false };
  }
  if (projectId !== EXPECT_PROJECT_ID || orgId !== EXPECT_ORG_ID) {
    console.error(`${NG} Vercel のリンク先が想定と違います（${src}）。別プロジェクトへデプロイする事故を防ぐため中断します。`);
    console.error(`   期待: project=${EXPECT_PROJECT_ID} org=${EXPECT_ORG_ID}`);
    console.error(`   実際: project=${projectId} org=${orgId}`);
    return { ok: false };
  }
  console.log(`${OK} Vercel リンク確認: ${src} → kyounoko-web (${projectId})`);
  return { ok: true, projectId, orgId };
}

// ───────────────────── 2. 対象slugの抽出 ─────────────────────
function resolveRange() {
  if (RANGE_OPT) return RANGE_OPT;
  const hasOriginMain = git(['rev-parse', '--verify', '--quiet', 'origin/main'], { allowFail: true });
  if (hasOriginMain) {
    const ahead = git(['rev-list', '--count', 'origin/main..HEAD'], { allowFail: true });
    if (ahead && Number(ahead.trim()) > 0) return 'origin/main..HEAD';
  }
  return 'HEAD^..HEAD';
}

function slugFromPath(p) {
  const base = p.split('/').pop().replace(/\.md$/, '');
  const fp = join(ROOT, p);
  if (existsSync(fp)) {
    const s = fmField(readFileSync(fp, 'utf8'), 'slug');
    if (s) return s;
  }
  return base;
}

function collectTargets() {
  if (SLUG_OPT.length || positional.length) {
    const slugs = [...new Set([...SLUG_OPT, ...positional.map((p) => slugFromPath(p))])];
    return { slugs, source: '引数で明示', range: null };
  }
  const range = resolveRange();
  const [a, b] = range.includes('..') ? range.split('..') : [range, 'HEAD'];
  const committed = git(['diff', '--name-only', `${a}`, `${b || 'HEAD'}`, '--', 'content/articles/'], {
    allowFail: true,
  }) || '';
  // 未コミットの変更も拾う（コミット漏れで「対象0件」になるのを防ぐ）
  const working = git(['status', '--porcelain', '--', 'content/articles/'], { allowFail: true }) || '';
  const workingPaths = working
    .split('\n')
    .map((l) => l.slice(3).trim())
    .filter((l) => l.endsWith('.md'));

  const paths = [
    ...committed.split('\n').map((l) => l.trim()).filter((l) => l.endsWith('.md')),
    ...workingPaths,
  ];
  const slugs = [...new Set(paths.map(slugFromPath))];
  return { slugs, source: `git diff ${range}${workingPaths.length ? ' + 未コミット変更' : ''}`, range, base: a };
}

/** slug に対応する md を探す（<slug>.md が大半だが frontmatter の slug が正） */
let slugIndex = null;
function findFile(slug) {
  const direct = join(ARTICLES_DIR, `${slug}.md`);
  if (existsSync(direct)) return direct;
  if (!slugIndex) {
    slugIndex = new Map();
    for (const f of readdirSync(ARTICLES_DIR)) {
      if (!f.endsWith('.md')) continue;
      const fp = join(ARTICLES_DIR, f);
      const sm = readFileSync(fp, 'utf8').match(/^slug:\s*(.*)$/m);
      if (sm) slugIndex.set(sm[1].trim().replace(/^["']|["']$/g, ''), fp);
    }
  }
  return slugIndex.get(slug) ?? null;
}

// ───────────────────── 3. KV上書きのプリフライト ─────────────────────
/**
 * KV(Upstash REST)を直接叩く。@vercel/kv に依存しないのは worktree で node_modules が
 * 無い場合にも動かすため。**疎通を実証してから読む**（読めていないのに「0件＝健全」と
 * 誤読しないため。lib/kv-store.ts は未設定時に静かにフォールバックするので、その挙動に
 * 引きずられてはいけない）。
 */
async function kvCommand(url, token, cmd) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`KV HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j = await res.json();
  return j.result;
}

async function kvPreflight(targets) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    let exists;
    try {
      exists = await kvCommand(url, token, ['EXISTS', KV_KEY]);
    } catch (e) {
      console.error(`${NG} KV への接続に失敗しました: ${e.message}`);
      console.error('   ※ 接続できない＝上書きの有無は「不明」です。0件ではありません。中断します。');
      return { mode: 'error', overridden: [], fatal: true };
    }
    let map = {};
    if (exists) {
      try {
        const raw = await kvCommand(url, token, ['GET', KV_KEY]);
        map = typeof raw === 'string' ? JSON.parse(raw) : raw || {};
      } catch (e) {
        console.error(`${NG} KV の読み取りに失敗しました: ${e.message}`);
        return { mode: 'error', overridden: [], fatal: true };
      }
    }
    const overridden = targets.filter((t) => Object.prototype.hasOwnProperty.call(map, t.slug)).map((t) => t.slug);
    console.log(`${OK} KV検査【厳密モード】疎通確認済み。KV上書き総数 ${Object.keys(map).length} 件 / 対象内 ${overridden.length} 件`);
    return { mode: 'strict', overridden, fatal: false };
  }

  // ── 劣化モード: KV env が無い。素通りさせず、本番title と「変更前の md title」で照合する。
  console.log(`${WARN} KV検査【劣化モード】: KV_REST_API_URL / KV_REST_API_TOKEN が無いため KV を直接読めません。`);
  console.log('   代替として「本番の<title>」と「変更前(base)の md title」を照合します。');
  console.log('   限界: KVの中身が md と同一の上書きは検出できません（＝この検査の 0件 は「上書き無し」の証明にはならない）。');
  console.log('   厳密にやるには Vercel → Storage → KV の値を .env.local に置いてください。');

  const overridden = [];
  const unknown = [];
  for (const t of targets) {
    const probe = await getPage(urlFor(t.slug));
    if (!probe.ok || probe.status !== 200) {
      unknown.push(t.slug);
      console.log(`   ${WARN} ${t.slug}: HTTP ${probe.status}${probe.error ? ` (${probe.error})` : ''} → 判定不能`);
      continue;
    }
    const prodTitle = titleTagOf(probe.html);
    if (t.baseTitle == null) {
      unknown.push(t.slug);
      console.log(`   ${WARN} ${t.slug}: 変更前の md title を取得できず判定不能（本番: ${prodTitle}）`);
      continue;
    }
    if (prodTitle && !prodTitle.includes(t.baseTitle) && t.baseTitle !== t.title) {
      overridden.push(t.slug);
      console.log(`   ${NG} ${t.slug}: 本番title が変更前mdと不一致 → KV上書きの疑い`);
      console.log(`        本番 : ${prodTitle}`);
      console.log(`        変更前md: ${t.baseTitle}`);
    }
  }
  return { mode: 'degraded', overridden, unknown, fatal: false };
}

/** KV上書きを解除する（writeback=0 必須：付けないと古いKV版が新しいmdを上書きする） */
async function flattenOverrides(slugs) {
  const results = [];
  for (const slug of slugs) {
    const u = `${SITE}/api/admin/edit-content?kind=article&slug=${encodeURIComponent(slug)}&writeback=0`;
    let body = '';
    let status = 0;
    try {
      const res = await fetch(u, {
        method: 'DELETE',
        // isAllowed() が referer に /admin/ を要求する（CSRF対策）
        headers: { Referer: `${SITE}/admin/articles/${slug}/edit` },
        cache: 'no-store',
      });
      status = res.status;
      body = await res.text();
    } catch (e) {
      results.push({ slug, ok: false, detail: String(e.message || e) });
      continue;
    }
    let json = null;
    try {
      json = JSON.parse(body);
    } catch {
      /* noop */
    }
    const ok = status === 200 && json?.ok === true;
    results.push({ slug, ok, detail: json ? JSON.stringify(json) : `HTTP ${status} ${body.slice(0, 200)}` });
    console.log(`   ${ok ? OK : NG} flatten ${slug}: ${results.at(-1).detail}`);
  }
  return results;
}

// ───────────────────── 4. ビルド ─────────────────────
function runVercelBuild() {
  console.log('');
  console.log('▶ ビルド強制: vercel --prod --force --yes');
  console.log('  （--force で ignoreCommand=scripts/vercel-ignore-build.sh を回避する。');
  console.log('    これをしないと md 単独変更は SKIP BUILD され「マージ成功＝反映」と誤認する）');
  const r = spawnSync('vercel', ['--prod', '--force', '--yes'], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: BUILD_TIMEOUT_SEC * 1000,
  });
  const out = `${r.stdout || ''}\n${r.stderr || ''}`;
  process.stdout.write(out);
  const m = out.match(/https:\/\/[a-z0-9-]+\.vercel\.app/gi);
  const url = m ? m[m.length - 1] : null;
  return { exit: r.status, url, out };
}

/** Production が Ready になるまでポーリング。Canceled / Error はその場で失敗にする。 */
async function pollDeployment(deployUrl) {
  const deadline = Date.now() + BUILD_TIMEOUT_SEC * 1000;
  let last = null;
  while (Date.now() < deadline) {
    let status = null;
    if (deployUrl) {
      const r = spawnSync('vercel', ['inspect', deployUrl], { cwd: ROOT, encoding: 'utf8' });
      const out = `${r.stdout || ''}\n${r.stderr || ''}`;
      const m = out.match(/status\s+[●•]?\s*([A-Za-z]+)/);
      status = m ? m[1] : null;
    } else {
      // デプロイURLが取れなかった場合（git push 経由など）は最新 Production を見る
      const r = spawnSync('vercel', ['ls', 'kyounoko-web', '--prod'], { cwd: ROOT, encoding: 'utf8' });
      const out = `${r.stdout || ''}\n${r.stderr || ''}`;
      const line = out.split('\n').find((l) => l.includes('vercel.app'));
      const m = line?.match(/(Ready|Building|Queued|Error|Canceled|Initializing)/i);
      status = m ? m[1] : null;
    }
    if (status && status !== last) {
      console.log(`   … Production status: ${status}`);
      last = status;
    }
    if (/^ready$/i.test(status || '')) return { ok: true, status };
    if (/^(error|canceled|cancelled)$/i.test(status || '')) {
      return { ok: false, status };
    }
    await sleep(15000);
  }
  return { ok: false, status: `timeout(${last ?? 'unknown'})` };
}

// ───────────────────── 5. ISR再生成 → CFパージ（順序厳守） ─────────────────────
/**
 * キャッシュバスター付きURLで origin(Vercel) を叩き、**新しい内容を返す状態にする**。
 * ここを飛ばして先に CF をパージすると、CF が STALE な ISR 応答を取りに行って
 * それを焼き付ける（2026-07-27の事故②そのもの）。
 */
async function warmIsr(targets) {
  const rows = [];
  for (const t of targets) {
    let r = null;
    let hit = false;
    for (let i = 0; i < WARM_TRIES; i++) {
      r = await getPage(`${urlFor(t.slug)}?_pub=${Date.now()}`);
      const fresh = r.ok && r.status === 200 && matches(r.html, t.expect);
      const cacheOk = /^(HIT|PRERENDER|REVALIDATED)$/i.test(r.vercel);
      if (fresh && cacheOk) {
        hit = true;
        break;
      }
      if (i < WARM_TRIES - 1) await sleep(5000);
    }
    rows.push({ slug: t.slug, ok: hit, status: r?.status ?? 0, vercel: r?.vercel ?? '-' });
    console.log(`   ${hit ? OK : NG} ISR ${t.slug}: HTTP ${r?.status} x-vercel-cache=${r?.vercel} 内容一致=${r && matches(r.html, t.expect)}`);
  }
  return rows;
}

/**
 * 本番の /api/admin/purge-cf を叩く（本番 env の CLOUDFLARE_API_TOKEN を使う）。
 * ローカルの .env.local に置かれた CF トークンは失効しがちで（2026-07-28 に
 * "Authentication error" を実測）、そのたびに publish が完走できなくなる。
 * 本番エンドポイントなら手元にトークンを置かずに済むので、これを既定の経路にする。
 */
async function cfPurgeViaApi(paths) {
  const secret = process.env.ADMIN_REVALIDATE_SECRET || 'kyounoko-revalidate-default';
  const purged = [];
  for (let i = 0; i < paths.length; i += 150) {
    const chunk = paths.slice(i, i + 150);
    const res = await fetch(`${SITE}/api/admin/purge-cf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, paths: chunk }),
      cache: 'no-store',
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) {
      console.log(`   ${NG} purge-cf API 失敗: HTTP ${res.status} ${JSON.stringify(json)}`);
      return { ok: false, purged: purged.length };
    }
    purged.push(...chunk);
    console.log(`   ${OK} purge-cf API: ${json.purged} URL をパージ`);
  }
  return { ok: true, purged: purged.length };
}

async function cfPurge(targets) {
  if (SKIP_CF) {
    console.log(`${WARN} --no-cf 指定のため CF パージをスキップします。`);
    return { ran: false, ok: false };
  }
  const paths = targets.map((t) => `${ARTICLE_BASE}${t.slug}`);

  // 1) 本番APIを既定経路にする（手元にトークンを置かない）
  const viaApi = await cfPurgeViaApi(paths);
  if (viaApi.ok) return { ran: true, ok: true, via: 'api' };

  // 2) API が使えない場合のみ、ローカルトークンでの直パージにフォールバック
  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ZONE_ID) {
    console.log(`${WARN} purge-cf API が使えず、ローカルの CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID も未設定です。`);
    console.log('   → CF の HTML キャッシュ(TTL 24h)が残っている場合、この後の素URL検証は失敗します。');
    return { ran: false, ok: false, skipped: 'CF パージ手段なし' };
  }
  const urls = targets.map((t) => urlFor(t.slug));
  const r = spawnSync('node', [join(ROOT, 'scripts/cf-purge.mjs'), ...urls], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  process.stdout.write(`${r.stdout || ''}${r.stderr || ''}`);
  return { ran: true, ok: r.status === 0, via: 'local-token' };
}

// ───────────────────── 6. 素のURLで最終検証（本体） ─────────────────────
async function finalVerify(targets) {
  const rows = [];
  for (const t of targets) {
    let r = null;
    let ok = false;
    for (let i = 0; i < VERIFY_TRIES; i++) {
      r = await getPage(urlFor(t.slug)); // ← キャッシュバスター無しの素のURL
      ok = r.ok && r.status === 200 && matches(r.html, t.expect);
      if (ok) break;
      if (i < VERIFY_TRIES - 1) await sleep(6000);
    }
    rows.push({
      slug: t.slug,
      status: r?.status ?? 0,
      cf: r?.cf ?? '-',
      vercel: r?.vercel ?? '-',
      age: r?.age ?? '-',
      expect: t.expect,
      actualTitle: r ? titleTagOf(r.html) : null,
      ok,
    });
  }
  return rows;
}

function printTable(rows) {
  const w = (s, n) => {
    const str = String(s ?? '-');
    // 全角を2幅として概算し、表の桁ズレを抑える
    const width = [...str].reduce((a, c) => a + (c.codePointAt(0) > 0x7f ? 2 : 1), 0);
    return str + ' '.repeat(Math.max(1, n - width));
  };
  console.log('');
  console.log('━'.repeat(96));
  console.log(`${w('slug', 34)}${w('HTTP', 6)}${w('cf-cache', 12)}${w('x-vercel-cache', 16)}${w('期待値一致', 12)}`);
  console.log('─'.repeat(96));
  for (const r of rows) {
    console.log(`${w(r.slug, 34)}${w(r.status, 6)}${w(r.cf, 12)}${w(r.vercel, 16)}${w(r.ok ? `${OK} 一致` : `${NG} 不一致`, 12)}`);
  }
  console.log('━'.repeat(96));
  const bad = rows.filter((r) => !r.ok);
  if (bad.length) {
    console.log('');
    console.log(`${NG} 本番に出ていない記事 ${bad.length}件（下記は「反映済み」と報告してはいけない）:`);
    for (const r of bad) {
      console.log(`  ● ${r.slug}  → ${urlFor(r.slug)}`);
      console.log(`     HTTP=${r.status} / cf-cache-status=${r.cf} / x-vercel-cache=${r.vercel} / age=${r.age}`);
      console.log(`     期待: ${r.expect}`);
      console.log(`     実際の<title>: ${r.actualTitle ?? '(取得できず)'}`);
    }
    console.log('');
    console.log('  切り分け:');
    console.log('   - x-vercel-cache が STALE のまま → origin(Vercel) がまだ古い。ビルドが対象slugを含んでいない可能性。');
    console.log('   - cf-cache-status が HIT で age が大きい → CF パージが効いていない（トークン/ゾーンIDを確認）。');
    console.log('   - キャッシュバスター付きでも古い → **KV上書き**。`--flatten` で解除してからやり直す。');
  }
  return bad.length === 0;
}

// ───────────────────────────── main ─────────────────────────────
async function main() {
  console.log('');
  console.log('══════ npm run publish — 本番に出たことを検証するまでが1コマンド ══════');
  console.log(`  repo : ${ROOT}`);
  console.log(`  env  : .env.local ${HAS_ENV_LOCAL ? '読込済み' : 'なし'}`);
  if (DRY_RUN) console.log(`  ${WARN} DRY-RUN: 読み取りのみ。ビルド・KV解除・CFパージは実行しません。`);
  console.log('');

  // 1) Vercel リンク先
  const link = vercelLinkGuard();
  if (!link.ok && !DRY_RUN) process.exit(2);
  if (!link.ok) console.log(`   （dry-run のため続行しますが、実行時はここで中断します）`);

  // 2) 対象slug
  const found = collectTargets();
  if (found.slugs.length === 0) {
    console.log(`${WARN} 対象の記事slugがありません（${found.source}）。何もしません。`);
    console.log('   記事以外の変更を反映したい場合は `vercel --prod --force` を直接使ってください。');
    process.exit(0);
  }
  console.log(`▶ 対象 ${found.slugs.length} slug（抽出元: ${found.source}）`);

  const targets = [];
  const missing = [];
  for (const slug of found.slugs) {
    const fp = findFile(slug);
    if (!fp) {
      missing.push(slug);
      continue;
    }
    const raw = readFileSync(fp, 'utf8');
    const title = fmField(raw, 'title');
    let baseTitle = null;
    if (found.base) {
      const rel = fp.replace(`${ROOT}/`, '');
      const baseRaw = git(['show', `${found.base}:${rel}`], { allowFail: true });
      if (baseRaw) baseTitle = fmField(baseRaw, 'title');
    }
    const expect = EXPECT_OVERRIDE ?? title;
    if (!expect) {
      console.error(`${NG} ${slug}: md に title が無く期待値を決められません。--expect= で指定してください。`);
      process.exit(2);
    }
    targets.push({ slug, file: fp.replace(`${ROOT}/`, ''), title, baseTitle, expect, noindex: fmField(raw, 'noindex') === 'true' });
    console.log(`   - ${slug}`);
    console.log(`     期待値: ${expect}`);
    if (fmField(raw, 'noindex') === 'true') console.log(`     ${WARN} この記事は noindex: true です（公開面ではありません）`);
  }
  if (missing.length) {
    console.error(`${NG} md が見つからない slug: ${missing.join(', ')} → 中断します。`);
    process.exit(2);
  }

  // 3) KVプリフライト
  console.log('');
  console.log('▶ プリフライト: KV上書き（article:overrides）の検査');
  const kv = await kvPreflight(targets);
  if (kv.fatal && !DRY_RUN) process.exit(2);

  if (kv.overridden.length > 0) {
    console.log('');
    console.log(`${NG} KV上書きのある記事が ${kv.overridden.length}件 あります: ${kv.overridden.join(', ')}`);
    console.log('   この状態で md を編集してデプロイしても **本番には永久に出ません**');
    console.log('   （lib/articles.ts getFileArticle() が KV版を丸ごと採用するため）。');
    if (!FLATTEN) {
      console.log('');
      console.log('   対処: `npm run publish -- --flatten` で KV上書きを解除してから反映してください。');
      console.log('        （解除は DELETE ?writeback=0 ＝ md を正とする。writeback を付けると');
      console.log('          古いKV版が新しいmdを上書きしてしまうので必ず 0 を付ける）');
      if (!DRY_RUN) process.exit(2);
    } else if (DRY_RUN) {
      console.log('   → --flatten 指定あり。実行時はここで DELETE ?writeback=0 を叩きます（dry-run のためスキップ）。');
    } else {
      console.log('');
      console.log('▶ --flatten: KV上書きを解除（DELETE ?writeback=0）');
      const res = await flattenOverrides(kv.overridden);
      const failed = res.filter((r) => !r.ok);
      if (failed.length) {
        console.error(`${NG} 解除に失敗しました: ${failed.map((f) => f.slug).join(', ')} → 中断します。`);
        process.exit(2);
      }
    }
  } else if (kv.mode === 'strict') {
    console.log(`   → 対象slugに KV上書きはありません。md 編集がそのまま反映されます。`);
  }

  if (DRY_RUN) {
    console.log('');
    console.log('▶ dry-run: 実行時にはこの後こうなります');
    console.log(`   1. vercel --prod --force --yes （ignoreBuild を回避してフルビルド）`);
    console.log(`   2. Production が Ready になるまでポーリング（Canceled/Error は即失敗・最大${BUILD_TIMEOUT_SEC}秒）`);
    console.log(`   3. 各slugを ?_pub=<ts> で叩き x-vercel-cache が HIT かつ内容一致になるまで再試行`);
    console.log(`   4. その **後** に CF パージ（node scripts/cf-purge.mjs <URL...>）`);
    console.log(`   5. 素のURLを取得して期待文字列を照合 → 1件でも不一致なら非ゼロ終了`);
    console.log('');
    console.log('▶ 参考: 現時点の素URLの状態（読み取りのみ）');
    const rows = await finalVerifyOnce(targets);
    printTable(rows);
    console.log('（dry-run では判定結果を終了コードに反映しません）');
    process.exit(0);
  }

  // 4) ビルド
  if (!VERIFY_ONLY) {
    let buildUrl = null;
    if (NO_BUILD) {
      // git push / PRマージで Vercel 側のビルドが既に走っている場合。
      // ここで vercel --prod --force を重ねると **同じ内容で2回ビルドする**（Vercelの
      // ビルド課金は2026-06に$82の前科があるので重複ビルドは避ける）。
      // ビルドは省くが「Ready になったか」の確認は省かない。
      console.log('');
      console.log(`${WARN} --no-build: ビルドはしません（git push 側のビルドを使う前提）。`);
      console.log('▶ 最新 Production が Ready になるまで待機');
    } else {
      const build = runVercelBuild();
      if (build.exit !== 0) {
        console.error(`${NG} vercel --prod --force が非ゼロ終了しました（exit=${build.exit}）。中断します。`);
        process.exit(1);
      }
      buildUrl = build.url;
      console.log('');
      console.log('▶ Production が Ready になるまで待機');
    }
    const poll = await pollDeployment(buildUrl);
    if (!poll.ok) {
      console.error(`${NG} デプロイが Ready になりませんでした（status=${poll.status}）。`);
      console.error('   Canceled の場合、ignoreCommand にスキップされています。--force が効いているか確認してください。');
      process.exit(1);
    }
    console.log(`${OK} Production Ready${buildUrl ? `: ${buildUrl}` : ''}`);

    // 5) ISR再生成 → CFパージ（この順序を絶対に逆にしない）
    console.log('');
    console.log('▶ ISR再生成（キャッシュバスターで origin を温める）');
    const warm = await warmIsr(targets);
    const cold = warm.filter((w) => !w.ok);
    if (cold.length) {
      console.error('');
      console.error(`${NG} origin(Vercel) がまだ新しい内容を返しません: ${cold.map((c) => c.slug).join(', ')}`);
      console.error('   ここで CF をパージすると STALE を焼き付けます（2026-07-27の事故②）。パージせず中断します。');
      process.exit(1);
    }
    console.log('');
    console.log('▶ Cloudflare エッジキャッシュをパージ（ISR再生成の "後" に実行）');
    await cfPurge(targets);
  } else {
    console.log(`${WARN} --verify-only: ビルド・パージをスキップして検証だけ行います。`);
  }

  // 6) 素のURLで最終検証
  console.log('');
  console.log('▶ 最終検証: キャッシュバスター無しの素のURL');
  const rows = await finalVerify(targets);
  const allOk = printTable(rows);

  if (!allOk) {
    console.log('');
    console.log(`${NG} 反映は完了していません。「デプロイした」と報告しないこと。`);
    process.exit(1);
  }
  console.log('');
  console.log(`${OK} ${rows.length}件すべて本番の素URLで期待文字列を確認しました。反映済みと報告してよい状態です。`);
}

/** dry-run 用: 再試行なしで1回だけ素URLを見る */
async function finalVerifyOnce(targets) {
  const rows = [];
  for (const t of targets) {
    const r = await getPage(urlFor(t.slug));
    rows.push({
      slug: t.slug,
      status: r.status,
      cf: r.cf,
      vercel: r.vercel,
      age: r.age,
      expect: t.expect,
      actualTitle: titleTagOf(r.html),
      ok: r.ok && r.status === 200 && matches(r.html, t.expect),
    });
  }
  return rows;
}

main().catch((e) => {
  console.error(`${NG} 予期せぬエラー: ${e.stack || e.message}`);
  process.exit(1);
});
