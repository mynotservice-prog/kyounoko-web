#!/usr/bin/env node
/**
 * 法人営業で相手に見せる記事の、送信前の監査。
 *
 * 2026-10-11 社長指示:「法人営業先へ提示する記事について、未確認の数値・体験・ランキングがないかを
 * 送信前に自動監査してください。」
 *
 * 何をするか:
 *   引数の記事（URL か slug）の本文に、全記事の検査と**同じ規則**（lib/claim-rules.mjs）を当て、
 *   記事ごとに「送ってよい／確認が要る」を 1 行で出す。確認が要る記事が 1 本でもあれば exit 1。
 *     数値       … 集計・割合・比率・回数・店舗数・「◯人に聞いた」
 *     体験       … 体験の節・書き手の家族を主語にした文・名前を伏せた他人の声・「実際に行って」などの言い回し
 *                  （「救世主」「助けられた」「うちの子」のような弱い言い回しは判定に入れず、参考として出す）
 *     ランキング … 点数・順位・題の「ランキング／TOP」
 *   全記事の検査（scripts/check-fabricated-claims.mjs）とちがい、**既知の一覧（直す順番待ち）に載っている
 *   記事でも「確認が要る」になる。** 相手に見せてよいかは、直す予定があるかどうかと関係がないため。
 *   記録を登録した範囲（data/experience-claims-baseline.json の records。社長が実体験と確認した節・文 など）は
 *   「記録あり」として判定から外し、その旨を 1 行出す。ただし登録したときより体験の見出し・文が増えていれば
 *   「確認が要る」になる。読んで誤検知と決めた記事×型（ignore）も外れる。
 *   一覧のファイルは、見る版（既定は origin/main）にあればそれを、無ければ手元の作業ツリーのものを読む
 *   （どちらを読んだかを出力に書く）。
 *
 * 判定の意味:
 *   「確認が要る」は、記録（いつ・どこで・だれが・どう数えたか）を人が確かめる必要がある、という意味。
 *   **事実でないと決めるものではない。** 「送ってよい」は、この規則に当たる書き方が無かった、という意味。
 *
 * この監査が見ないもの（人が見る）:
 *   - 価格・対象年齢・営業時間が公式の最新と合っているか（更新日が 30 日より前の記事には印を付ける）
 *   - 管理画面で保存した本文（KV の上書き）。表示は KV が md より優先される。
 *     相手に見せる記事は `node scripts/kv-article-overrides.mjs --list --only=<slug,…>` で上書きの有無を見る
 *   - 記事以外のページ（/spot/・/station/・/area/ など）。URL を渡すと「検査できない」になり exit 1
 *   - 凍結・実験は、このリポジトリの docs/experiments-active.md（scripts/check-frozen.mjs --list）で
 *     分かる範囲だけ。rgos-ops の台帳は見ていない
 *
 * 使い方:
 *   node scripts/tieup-preflight.mjs <URL か slug> [<URL か slug> …]
 *   node scripts/tieup-preflight.mjs --file=urls.txt          # 1 行に 1 つ（# で始まる行は無視）
 *   node scripts/tieup-preflight.mjs … --json                 # 機械で読む形（JSON を標準出力に）
 *   node scripts/tieup-preflight.mjs … --worktree             # origin/main ではなく、手元の作業ツリーの md を見る
 *   node scripts/tieup-preflight.mjs … --ref=<git の参照>      # 既定は origin/main（先に git fetch origin）
 *   node scripts/tieup-preflight.mjs … --gate-only            # 警告の型（体験とも読める言い回し・題のランキング）を判定に入れない
 *
 * 終了コード: 0 = 全部「送ってよい」／1 = 「確認が要る」か「検査できない」が 1 本以上／2 = 使い方の誤り
 * 書き込みはしない（読むだけ。git fetch もしない）。
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GROUP_LABEL, OFFICIAL_CLAIM_LABEL, RULE_META, parseVisitRecords, registeredScopeFor, scanArticle } from '../lib/claim-rules.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name) => argv.find((a) => a.startsWith(`${name}=`))?.slice(name.length + 1);
const AS_JSON = flag('--json');
const WORKTREE = flag('--worktree');
const GATE_ONLY = flag('--gate-only');
const REF = opt('--ref') ?? 'origin/main';
const SITE_HOSTS = new Set(['kyounoko.jp', 'www.kyounoko.jp']);
const STALE_DAYS = 30;

const inputs = argv.filter((a) => !a.startsWith('--'));
if (opt('--file')) {
  for (const l of fs.readFileSync(opt('--file'), 'utf8').split('\n')) {
    const t = l.trim();
    if (t && !t.startsWith('#')) inputs.push(t);
  }
}
if (!inputs.length || flag('--help') || flag('-h')) {
  console.error('使い方: node scripts/tieup-preflight.mjs <URL か slug> [...] [--json] [--worktree] [--ref=origin/main] [--gate-only] [--file=urls.txt]');
  process.exit(2);
}

const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
/** 見る版のファイルを読む（無ければ null）。 */
const readAt = (rel) => {
  try {
    return WORKTREE ? fs.readFileSync(path.join(ROOT, rel), 'utf8') : git('show', `${REF}:${rel}`);
  } catch {
    return null;
  }
};

let source;
if (WORKTREE) {
  source = { kind: 'worktree', label: `作業ツリー（${ROOT}）` };
} else {
  try {
    const [sha, date] = git('log', '-1', '--format=%h %cs', REF).trim().split(' ');
    source = { kind: 'ref', ref: REF, sha, date, label: `${REF}（${sha}・${date} のコミット）` };
  } catch {
    console.error(`git の参照 ${REF} を読めません。git fetch origin を実行するか、--worktree を付けてください。`);
    process.exit(2);
  }
}

/** URL か slug を、記事の slug に直す。記事でなければ reason を返す。 */
function toSlug(input) {
  let p = input.trim();
  if (/^https?:\/\//i.test(p)) {
    let u;
    try {
      u = new URL(p);
    } catch {
      return { reason: 'URL として読めない' };
    }
    if (!SITE_HOSTS.has(u.hostname)) return { reason: `kyounoko.jp の URL ではない（${u.hostname}）` };
    p = u.pathname;
  }
  p = p.replace(/[?#].*$/, '').replace(/\/+$/, '');
  if (p.startsWith('/')) {
    const m = p.match(/^\/article\/([a-z0-9_-]+)$/);
    if (!m) return { reason: `記事（/article/…）ではないページ（${p || '/'}）。この監査は記事の本文だけを見る` };
    return { slug: m[1] };
  }
  if (!/^[a-z0-9_-]+$/.test(p)) return { reason: 'slug として読めない' };
  return { slug: p };
}

/* ---- 記録・誤検知の一覧・凍結の一覧（見る版から読む） ---- */
const records = parseVisitRecords(readAt('lib/kid-reports.ts') ?? '', readAt('lib/chain-reports.ts') ?? '');
const parseJson = (s) => { try { return s ? JSON.parse(s) : {}; } catch { return {}; } };
/** 一覧のファイルは、見る版にあればそれを、無ければ手元の作業ツリーのものを読む（マージ前でも記録が効くように）。 */
const listSources = {};
const readList = (rel) => {
  const atRef = readAt(rel);
  if (atRef != null) { listSources[rel] = source.kind === 'worktree' ? '作業ツリー' : source.ref; return parseJson(atRef); }
  try {
    const local = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    listSources[rel] = '作業ツリー（見る版には無い）';
    return parseJson(local);
  } catch {
    listSources[rel] = '無し';
    return {};
  }
};
const experienceFile = readList('data/experience-claims-baseline.json');
const baselineFile = readList('data/unfounded-claims-baseline.json');
const ignored = new Set([...(baselineFile.ignore ?? []), ...(experienceFile.ignore ?? [])].map((e) => `${e.slug}\t${e.rule}`));
const experienceRecords = experienceFile.records ?? [];
const scopeFor = (slug) => {
  const scope = registeredScopeFor(experienceRecords, slug);
  if (slug in (baselineFile.visitBacked ?? {})) scope.backedSections.push({});
  return scope;
};
const experienceEntry = new Map((experienceFile.entries ?? []).map((e) => [e.slug, e]));

/** scripts/check-frozen.mjs --list の出力から、凍結 slug と比較基準を読む（読めなければ null）。 */
function loadFrozen() {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/check-frozen.mjs'), '--list'], { cwd: ROOT, encoding: 'utf8' });
  if (r.status !== 0 || !r.stdout) return null;
  const sets = { slugs: new Set(), baselines: new Set() };
  let cur = null;
  for (const l of r.stdout.split('\n')) {
    if (/^凍結slug/.test(l)) cur = sets.slugs;
    else if (/^比較基準/.test(l)) cur = sets.baselines;
    else if (/^\S/.test(l)) cur = null;
    else if (cur && l.trim()) cur.add(l.trim());
  }
  return sets;
}
const frozen = loadFrozen();

/* ---- 1 本ずつ見る ---- */
const today = new Date();
const articles = [];
for (const input of [...new Set(inputs)]) {
  const t = toSlug(input);
  if (!t.slug) {
    articles.push({ input, slug: null, verdict: 'unchecked', verdictLabel: '検査できない', reason: t.reason });
    continue;
  }
  const slug = t.slug;
  const raw = readAt(`content/articles/${slug}.md`);
  if (raw == null) {
    articles.push({
      input, slug, url: `https://kyounoko.jp/article/${slug}`, verdict: 'unchecked', verdictLabel: '検査できない',
      reason: `content/articles/${slug}.md が ${source.label} に無い（slug の誤り・統合済み・管理画面だけで作った記事の可能性）`,
    });
    continue;
  }
  const scope = scopeFor(slug);
  const r = scanArticle(raw, { records, backedSections: scope.backedSections });
  const notes = [];
  // 弱い言い回し（救世主・助けられた・うちの子）は判定に入れず、参考として出す
  for (const f of r.findings.filter((x) => x.rule === 'soft-wording')) {
    notes.push(`参考（判定に入れない）: ${f.label} ${f.count} か所。例「${f.sentences[0].slice(0, 60)}」`);
  }
  const findings = r.findings
    .filter((f) => f.rule !== 'soft-wording')
    .filter((f) => !ignored.has(`${slug}\t${f.rule}`))
    .filter((f) => !(GATE_ONLY && f.severity === 'warn'))
    .map((f) => ({ group: f.group, rule: f.rule, label: f.label, severity: f.severity, count: f.count, excerpts: f.sentences.slice(0, 3).map((s) => (r.sectionLeads[s] ? `${s} → ${r.sectionLeads[s]}` : s).slice(0, 160)) }));
  // 記録を登録した範囲の体験（社長の確認など）は「記録あり」。登録したときより増えていれば「確認が要る」
  const registered = { count: 0, grown: 0, basis: [...new Set(experienceRecords.filter((x) => x.slug === slug).map((x) => x.basis).filter(Boolean))] };
  for (const x of r.registered) {
    registered.count += x.count;
    const was = scope.n ? (scope.n[x.rule] ?? 0) : null;
    if (was != null && x.count > was) {
      registered.grown += x.count - was;
      findings.push({
        group: 'experience', rule: `registered-grown:${x.rule}`, label: `記録を登録した範囲で、登録のあとに増えた（${RULE_META[x.rule].label}）`, severity: 'gate',
        count: x.count - was, excerpts: x.sentences.slice(-3).map((s) => s.slice(0, 160)),
      });
    }
  }
  if (registered.count) {
    notes.push(`記録あり ${registered.count} か所（${registered.basis.join('／') || '体験の一覧の records'}）${registered.grown ? `。ただし登録のあとに ${registered.grown} か所増えている` : ''}`);
  }
  // 2026-07-28 の型（自称の一次調査）は数値の側に入れる。「公式が〜と案内」は判定に入れず、注記にとどめる
  for (const h of r.legacy) {
    if (h.label === OFFICIAL_CLAIM_LABEL) {
      notes.push(`「公式が〜と案内」の書き方あり（出典の URL と確認日が本文にあるか見る）: ${h.excerpt}`);
    } else {
      findings.push({ group: 'number', rule: `legacy:${h.label}`, label: h.label, severity: 'error', count: 1, excerpts: [h.excerpt] });
    }
  }
  const counts = { number: 0, experience: 0, ranking: 0 };
  for (const f of findings) counts[f.group] += f.count;
  // 抜粋は先頭 3 件。数値・体験・ランキングから 1 件ずつ順に取る
  const queues = ['number', 'experience', 'ranking'].map((g) => findings.filter((f) => f.group === g).flatMap((f) => f.excerpts.map((text) => ({ group: g, rule: f.rule, text }))));
  const excerpts = [];
  for (let i = 0; excerpts.length < 3 && queues.some((q) => q.length > i); i++) {
    for (const q of queues) if (q[i] && excerpts.length < 3) excerpts.push(q[i]);
  }
  const updatedAt = String(raw.slice(0, 2000).match(/^updatedAt:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1] ?? '') || null;
  const daysSinceUpdate = updatedAt ? Math.floor((today - new Date(`${updatedAt}T00:00:00+09:00`)) / 86400000) : null;
  if (r.noindex) notes.push('noindex の記事（検索に出していない）');
  if (daysSinceUpdate == null) notes.push('更新日（updatedAt）が無い。価格・営業時間は送る前に公式と照合する');
  else if (daysSinceUpdate > STALE_DAYS) notes.push(`更新日が ${daysSinceUpdate} 日前。価格・対象年齢・営業時間は送る前に公式と照合する`);
  const fz = frozen ? { frozen: frozen.slugs.has(slug), comparisonBaseline: frozen.baselines.has(slug) } : null;
  if (fz?.frozen) notes.push('凍結中の記事（測定中。直す場合は docs/experiments-active.md の手順で）');
  if (fz?.comparisonBaseline) notes.push('実験の比較基準の記事（リンクの増減を避ける）');
  const plan = experienceEntry.get(slug);
  if (plan) notes.push(`体験の一覧に「確認待ち」の記載あり（扱いの案〔社長の確認前〕: ${{ verify: '事実確認', revise: '修正', remove: '節の削除' }[plan.proposed] ?? plan.proposed}・便の案 ${plan.batch}・日付の案 ${plan.until ?? 'なし'}）`);
  const review = findings.length > 0;
  articles.push({
    input, slug, url: `https://kyounoko.jp/article/${slug}`, title: r.title,
    verdict: review ? 'review' : 'ok', verdictLabel: review ? '確認が要る' : '送ってよい',
    counts, excerpts, findings, registered, frozen: fz, noindex: r.noindex, updatedAt, daysSinceUpdate, notes,
  });
}

const summary = {
  total: articles.length,
  ok: articles.filter((a) => a.verdict === 'ok').length,
  review: articles.filter((a) => a.verdict === 'review').length,
  unchecked: articles.filter((a) => a.verdict === 'unchecked').length,
};
const caveats = [
  '「確認が要る」は記録を人が確かめる必要がある、という意味で、事実でないと決めるものではない',
  '価格・対象年齢・営業時間が公式の最新と合っているかは見ていない',
  '管理画面で保存した本文（KV の上書き）は見ていない。node scripts/kv-article-overrides.mjs --list --only=<slug,…> で上書きの有無を見る',
  `凍結・実験は docs/experiments-active.md で分かる範囲だけ${frozen ? '' : '（今回は読めなかった＝不明）'}。rgos-ops の台帳は見ていない`,
];
const exitCode = summary.review + summary.unchecked > 0 ? 1 : 0;

if (AS_JSON) {
  console.log(JSON.stringify({ generatedAt: today.toISOString(), source, listSources, gateOnly: GATE_ONLY, groups: GROUP_LABEL, summary, sendable: exitCode === 0, articles, caveats }, null, 2));
}

// process.exit() は使わない（--json の出力をパイプで読むとき、書き出しの途中で切れるため）
process.exitCode = exitCode;
if (!AS_JSON) printHuman();

function printHuman() {
const GROUP_SHORT = { number: '数値', experience: '体験', ranking: 'ランキング' };
console.log(`法人営業の送信前の監査 — 本文: ${source.label}${GATE_ONLY ? '・警告の型は判定に入れない' : ''}`);
console.log(`記録・誤検知の一覧: ${listSources['data/experience-claims-baseline.json']}`);
console.log('');
for (const a of articles) {
  if (a.verdict === 'unchecked') {
    console.log(`[検査できない] ${a.slug ?? a.input}  ${a.reason}`);
    continue;
  }
  const c = a.counts;
  const fz = a.frozen == null ? '不明' : a.frozen.frozen ? 'はい' : a.frozen.comparisonBaseline ? '比較基準' : 'いいえ';
  console.log(`[${a.verdictLabel}] ${a.slug}  数値 ${c.number}・体験 ${c.experience}・ランキング ${c.ranking}  凍結 ${fz}  更新 ${a.updatedAt ?? '不明'}${a.noindex ? '  noindex' : ''}`);
  for (const e of a.excerpts) console.log(`    ${GROUP_SHORT[e.group]}: ${e.text}`);
  for (const n of a.notes) console.log(`    ・${n}`);
}
console.log('');
console.log(`結果: ${summary.total} 本中 送ってよい ${summary.ok}・確認が要る ${summary.review}・検査できない ${summary.unchecked} → ${exitCode === 0 ? '送ってよい（exit 0）' : '送る前に確認が要る（exit 1）'}`);
console.log('注意:');
for (const c of caveats) console.log(`  - ${c}`);
}
