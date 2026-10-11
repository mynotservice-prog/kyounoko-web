#!/usr/bin/env node
/**
 * 出典のない自称一次調査・未実施体験の主張を検出する。
 *
 * 背景（2026-07-27〜28 の掃討）:
 *   公開記事に「編集部が150世帯に調査」「小児科医監修のもと」「100店舗を実地調査」
 *   「読者100世帯への聞き取り」等の裏付けのない主張が 300 セクション以上あった。
 *   実在する出典は 0 件で、スパムポリシー・E-E-A-T・憲章の禁止事項に違反していた。
 *
 * 当時の反省:
 *   最初は `## 編集部の独自視点` だけを見ていたため、`## きょうのこ独自データで見る…`
 *   `## 先輩ママ・パパの声` `## 保育士・専門家から見た…` を取りこぼした。
 *   さらに main 側の「noindex 解除」で、noindex 前提で残していた記事が公開に変わり
 *   捏造が 3 本再発した。だから noindex 記事も検査対象に含める。
 *
 * 一次情報の正:
 *   実訪問にもとづく体験は lib/kid-reports.ts のみが正。
 *   子の年齢は app/authors/nagamy/page.tsx の記載（4歳娘・2歳息子）を超えて書かない。
 *   専門家監修は app/supervisors/page.tsx が「監修者はいません」と明言している。
 *
 * ── 2026-10-10 追加: 根拠のない点数・順位／出所のない比率・回数・年数／一人称の体験 ──
 *   `conveni-kodzure-kids-shokuzai-4sha` に「5軸×10点=50点満点」の採点・1〜4位の順位・
 *   「我が家の利用比率 セブン4：ローソン3：…」が、記録なしで載っていた（記事の生成と同時に置かれた値。
 *   同じ型が公開中に12本）。7/28 の掃討は「編集部が◯人に調査」型だけを見ていて、この型を通していた。
 *
 *   追加した検査は2段階:
 *     [GATE] 点数（◯軸×◯点・◯点満点・NN/50・採点／スコア化）、採点の順位（見出し・表の「N位」・
 *            本文の「総合N位です」）、出所のない比率・回数・年数（「セブン4：ローソン3：…」
 *            「延べ100店舗」「我が家では月2〜3回」）、記録のない調査の体裁（「ママ50人にきいた」）
 *            → **既知の一覧（data/unfounded-claims-baseline.json）に無い記事×型だけ exit 1**。
 *            既知の分は警告にとどめる（直すまで赤のままだと、他のPRが全部止まるため）。
 *            一覧の各行には期限（until）がある。期限を過ぎた行は目立つ警告にする
 *            （`--fail-on-expired` を付けたときだけ exit 1）。直した記事は一覧から消す
 *            （消し忘れは「もう当たっていない行」として表示される）。
 *     [WARN] 一人称の体験（我が家・実際に行って・助けられた 等）と、題の「ランキング／TOP」に
 *            根拠の記載が無いもの。機械では真偽を判定できず件数も多いので、**常に警告**（exit 1 にしない）。
 *            実訪問の記録がある記事は除外する（lib/kid-reports.ts のスポット名・lib/chain-reports.ts の
 *            店舗名が本文に出てくる記事と、一覧ファイルの visitBacked に書いた slug）。
 *
 *   「順位や点数は付けていません」「削除しました」のような否定の文と、
 *   「## この記事から外したもの」節の中は、開示なので拾わない。
 *   目で見て誤検知と決めた記事×型は、一覧ファイルの ignore に理由つきで書く（恒久的に外れる）。
 *
 * ── 2026-10-11 追加: 規則の定義を lib/claim-rules.mjs に移し、型を足し、一人称の体験を失敗に上げた ──
 *   - 規則はこのファイルに置かない。**lib/claim-rules.mjs の 1 か所**を、この検査・法人営業の送信前の監査
 *     （scripts/tieup-preflight.mjs）・管理画面の保存（app/api/admin/edit-content）が読む。
 *   - 足した型（どれも [GATE]）: 集計の体裁（「約150件の声を傾向分析」「〜という声が約78%」「編集部に届いた声
 *     （約N件集計）」。題・説明文の行も見る）／名前を伏せた他人の声（「Aさん（30代・1歳児）」）／
 *     「年間100回以上通って」「30店舗以上を実地確認」「複数店舗を利用」（比率・回数の型に追加）／
 *     体験の節の見出し（我が家のリアル・うちの場合・体験談・編集部の失敗談 ほか）／
 *     書き手の家族を主語にした文（我が家・うちの子・友人ファミリーに同行 ほか）。
 *   - [WARN] のまま: 「実際に食べる」「助けられた」など、体験とも一般論とも読める言い回し。
 *   - 体験の型（exp-section・first-person）の既知の一覧は data/experience-claims-baseline.json。
 *     記事ごとに、扱い（verify＝事実確認／revise＝修正／remove＝節の削除）と便（K1〜K6）と件数 n を持つ。
 *     **一覧に無い記事に体験の節・文が入る、または既知の記事で件数が n より増えると exit 1。**
 *     一覧の行は「記録なし・確認待ち」の意味で、事実でないと決めたものではない。
 *     社長の確認が取れた節は records に店舗・年月つきで書くと、検査から外れる。
 *   - 「実訪問の記録がある」扱いを、記事の単位から**節の単位**に狭めた（詳細は lib/claim-rules.mjs の 3）。
 *
 * 使い方:
 *   node scripts/check-fabricated-claims.mjs           # 違反があれば exit 1
 *   node scripts/check-fabricated-claims.mjs --public  # 公開記事のみ検査
 *   node scripts/check-fabricated-claims.mjs --all             # 警告（WARN）も全件表示する
 *   node scripts/check-fabricated-claims.mjs --no-baseline     # 既知の一覧を無視して全 GATE を出す（棚卸し用）
 *   node scripts/check-fabricated-claims.mjs --print-baseline  # 現状の GATE を一覧の形（JSON）で標準出力に出す
 *   node scripts/check-fabricated-claims.mjs --fail-on-expired # 期限切れの既知の行があれば exit 1
 *   node scripts/check-fabricated-claims.mjs --json            # 追加した検査の結果を JSON で出す（集計用）
 *   node scripts/check-fabricated-claims.mjs --dir=<フォルダ>   # content/articles の代わりに、別の場所の md を検査する
 *                                                              #（KV の上書きを scripts/kv-article-overrides.mjs --dump で書き出したもの 等）
 *   node scripts/check-fabricated-claims.mjs --only=a,b        # slug を絞る
 *   node scripts/check-fabricated-claims.mjs --tighten         # 体験の一覧の n を現状まで下げ、もう当たらない行を消す（増やす方向には書かない）
 */
import fs from 'node:fs';
import path from 'node:path';
import { OFFICIAL_CLAIM_LABEL, RULE_META, parseVisitRecords, scanArticle } from '../lib/claim-rules.mjs';

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name) => argv.find((a) => a.startsWith(`${name}=`))?.slice(name.length + 1);

const DIR = opt('--dir') ?? 'content/articles';
const ONLY = opt('--only') ? new Set(opt('--only').split(',').map((s) => s.trim()).filter(Boolean)) : null;
const publicOnly = flag('--public');
const AS_JSON = flag('--json');
const SHOW_ALL = flag('--all');
const NO_BASELINE = flag('--no-baseline');
const PRINT_BASELINE = flag('--print-baseline');
const FAIL_ON_EXPIRED = flag('--fail-on-expired');
const TIGHTEN = flag('--tighten');

/** 点数・順位・比率・調査・集計・他人の声の既知の一覧（記事×型） */
const BASELINE_PATH = 'data/unfounded-claims-baseline.json';
/** 体験の節・一人称の文の既知の一覧（記事ごと。扱い・便・件数つき） */
const EXPERIENCE_PATH = 'data/experience-claims-baseline.json';
const EXPERIENCE_RULES = ['exp-section', 'first-person'];

const say = (...a) => { if (!AS_JSON) console.log(...a); };
const warn = (...a) => { if (!AS_JSON) console.error(...a); };
const readJson = (p, fallback) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : fallback);
const readText = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } };

/* ------------------------------------------------------------------ *
 * 読み込み
 * ------------------------------------------------------------------ */
const records = parseVisitRecords(readText('lib/kid-reports.ts'), readText('lib/chain-reports.ts'));
const baselineFile = readJson(BASELINE_PATH, {});
const experienceFile = readJson(EXPERIENCE_PATH, {});
// --no-baseline は「既知の行」だけを無視する。目で見て誤検知と決めた行（ignore）と、
// 記録のある節（records・visitBacked）は、棚卸しのときも効かせる。
const baselineEntries = NO_BASELINE ? [] : (baselineFile.entries ?? []);
const experienceEntries = NO_BASELINE ? [] : (experienceFile.entries ?? []);
const ignored = new Set([...(baselineFile.ignore ?? []), ...(experienceFile.ignore ?? [])].map((e) => `${e.slug}\t${e.rule}`));
/** slug → [{ heading? }]。visitBacked（2026-10-10 の形）は記事全体として扱う。 */
const backedBySlug = new Map();
for (const slug of Object.keys(baselineFile.visitBacked ?? {})) backedBySlug.set(slug, [{}]);
for (const r of experienceFile.records ?? []) {
  if (!backedBySlug.has(r.slug)) backedBySlug.set(r.slug, []);
  backedBySlug.get(r.slug).push({ heading: r.heading });
}

/* ------------------------------------------------------------------ *
 * 全記事を検査
 * ------------------------------------------------------------------ */
const legacyHits = []; // { file, label, noindex, excerpt }
const found = []; // { slug, rule, label, severity, noindex, count, excerpt }
let scanned = 0;
for (const f of fs.readdirSync(DIR).sort()) {
  if (!f.endsWith('.md')) continue;
  const slug = f.replace(/\.md$/, '');
  if (ONLY && !ONLY.has(slug)) continue;
  const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
  const r = scanArticle(raw, { records, backedSections: backedBySlug.get(slug) ?? [] });
  if (publicOnly && r.noindex) continue;
  scanned++;
  for (const h of r.legacy) legacyHits.push({ file: f, label: h.label, noindex: r.noindex, excerpt: h.excerpt });
  for (const x of r.findings) {
    if (ignored.has(`${slug}\t${x.rule}`)) continue;
    found.push({ slug, rule: x.rule, label: x.label, severity: x.severity, noindex: r.noindex, count: x.count, excerpt: x.excerpt });
  }
}

/* ------------------------------------------------------------------ *
 * 2026-07-28 の型（自称の一次調査・未検証の「公式が〜」）の報告。終了コードを返す。
 * ------------------------------------------------------------------ */
function reportLegacy() {
  // 「公式が〜」は「一次情報の裏取りが必要」を意味する。公式サイトに実在する記述を正しく引用して
  // いるケースも同じ形になるため、機械では真偽を判定できない。よって**警告**として出し、exit 1 にはしない。
  const warns = legacyHits.filter((h) => h.label === OFFICIAL_CLAIM_LABEL);
  const errs = legacyHits.filter((h) => h.label !== OFFICIAL_CLAIM_LABEL);
  if (warns.length) {
    warn(`⚠ 一次情報の裏取りが必要な「公式が〜」の断定 ${warns.length} 件（exit 1 にはしない）`);
    for (const h of warns) warn(`  ${h.noindex ? '[noindex] ' : '[公開]    '}${h.file}  ${h.excerpt}`);
    warn('対処: 公式ページを curl して該当記述を確認し、出典URLと確認日を本文に書く。');
    warn('      確認できなければ「公式に記載はなく店舗判断」と書き直す。\n');
  }
  if (!errs.length) {
    say(`✓ 自称の一次調査の型（2026-07-28 の掃討の型）なし（${publicOnly ? '公開記事のみ' : '全記事'}・${scanned}本）`);
    return 0;
  }
  const byLabel = {};
  for (const h of errs) (byLabel[h.label] ??= []).push(h);
  warn(`✗ 出典・記録の確認が要る主張（2026-07-28 の掃討の型） ${errs.length} 件\n`);
  for (const [label, list] of Object.entries(byLabel)) {
    warn(`【${label}】${list.length}件`);
    for (const h of list.slice(0, 8)) {
      warn(`  ${h.noindex ? '[noindex] ' : '[公開]    '}${h.file}  ${h.excerpt}`);
    }
    if (list.length > 8) warn(`  …他 ${list.length - 8} 件`);
    warn('');
  }
  warn('対処: セクションを削除するか、出典のある記述に差し替える。');
  warn('詳細: reports/fabricated-stats-audit-2026-07-27.md');
  return 1;
}

/* ------------------------------------------------------------------ *
 * 点数・順位・比率・集計・調査の体裁・一人称の体験の報告
 * ------------------------------------------------------------------ */
function reportUnfounded() {
  const today = new Date().toISOString().slice(0, 10);
  const key = (e) => `${e.slug}\t${e.rule}`;
  const base = new Map(baselineEntries.map((e) => [key(e), e]));
  const exp = new Map(experienceEntries.map((e) => [e.slug, e]));
  /** 既知の行（どちらの一覧でも）を { until, n, action, batch } の形で返す。無ければ null。 */
  const knownRow = (h) => {
    if (EXPERIENCE_RULES.includes(h.rule)) {
      const e = exp.get(h.slug);
      return e && e.n && h.rule in e.n ? { until: e.until ?? null, n: e.n[h.rule], action: e.action, batch: e.batch } : null;
    }
    const e = base.get(key(h));
    return e ? { until: e.until ?? null, n: typeof e.n === 'number' ? e.n : null } : null;
  };

  const gate = found.filter((h) => h.severity === 'gate');
  const warns = found.filter((h) => h.severity === 'warn');
  const fresh = gate.filter((h) => !knownRow(h));
  const known = gate.filter((h) => knownRow(h));
  // 既知の記事でも、件数が一覧の n より増えたら新しい混入として扱う（体験の型と、n を書いた行）
  const grown = known.filter((h) => knownRow(h).n != null && h.count > knownRow(h).n);
  const shrunk = known.filter((h) => knownRow(h).n != null && h.count < knownRow(h).n);
  const expired = known.filter((h) => (knownRow(h).until ?? '9999') < today);
  const hitKeys = new Set(gate.map(key));
  const stale = [
    ...baselineEntries.filter((e) => !hitKeys.has(key(e))).map((e) => ({ slug: e.slug, rule: e.rule })),
    ...experienceEntries.flatMap((e) => Object.keys(e.n ?? {}).filter((rule) => !hitKeys.has(`${e.slug}\t${rule}`)).map((rule) => ({ slug: e.slug, rule }))),
  ];
  // --only のときは、絞った外の行を「もう当たっていない」と数えない。--dir は別の場所の一部の記事を
  // 見る使い方（KV の書き出し 等）なので、数えない。
  const staleShown = opt('--dir') ? [] : ONLY ? stale.filter((e) => ONLY.has(e.slug)) : stale;

  if (TIGHTEN) {
    const counts = new Map(gate.map((h) => [key(h), h.count]));
    let lowered = 0;
    let removed = 0;
    const next = [];
    for (const e of experienceFile.entries ?? []) {
      const n = {};
      for (const [rule, was] of Object.entries(e.n ?? {})) {
        const now = counts.get(`${e.slug}\t${rule}`) ?? 0;
        if (now === 0) continue;
        if (now < was) lowered++;
        n[rule] = Math.min(was, now);
      }
      if (Object.keys(n).length) next.push({ ...e, n });
      else removed++;
    }
    experienceFile.entries = next;
    experienceFile.updatedAt = today;
    fs.writeFileSync(EXPERIENCE_PATH, stringifyExperience(experienceFile));
    console.log(`${EXPERIENCE_PATH}: n を下げた ${lowered} か所・消した行 ${removed}・残り ${next.length} 行`);
    return 0;
  }
  if (PRINT_BASELINE) {
    console.log(JSON.stringify(gate.map((h) => ({ slug: h.slug, rule: h.rule, n: h.count, until: '', note: '' })), null, 2));
    return 0;
  }
  const byRuleCount = {};
  for (const h of found) {
    const o = (byRuleCount[h.rule] ??= { severity: h.severity, articles: 0, public: 0, places: 0 });
    o.articles++;
    if (!h.noindex) o.public++;
    o.places += h.count;
  }
  const failing = fresh.length + grown.length;
  if (AS_JSON) {
    console.log(JSON.stringify({ today, scanned, counts: {
      gate: gate.length, fresh: fresh.length, grown: grown.length, known: known.length, expired: expired.length, stale: staleShown.length, warn: warns.length,
    }, byRule: byRuleCount, fresh, grown, known, expired, stale: staleShown, warns }, null, 2));
    return failing || (FAIL_ON_EXPIRED && expired.length) ? 1 : 0;
  }

  const tag = (h) => `${h.noindex ? '[noindex] ' : '[公開]    '}${h.slug}  （${h.count}か所）${h.excerpt}`;
  const byRule = (list) => {
    const o = {};
    for (const h of list) (o[h.label] ??= []).push(h);
    return Object.entries(o);
  };

  if (warns.length) {
    warn(`\n⚠ 根拠の確認が要る書き方 ${warns.length} 件（警告。exit 1 にはしない）`);
    for (const [label, list] of byRule(warns)) {
      warn(`【${label}】${list.length}本`);
      for (const h of SHOW_ALL ? list : list.slice(0, 5)) warn(`  ${tag(h)}`);
      if (!SHOW_ALL && list.length > 5) warn(`  …他 ${list.length - 5} 本（--all で全件）`);
    }
  }
  if (known.length) {
    warn(`\n⚠ 既知の「記録なし・確認待ち」 ${known.length} 件（${BASELINE_PATH}・${EXPERIENCE_PATH} に記載。直すか、記録を登録するまで警告）`);
    for (const [label, list] of byRule(known)) {
      warn(`【${label}】${list.length}本`);
      for (const h of SHOW_ALL ? list : list.slice(0, 5)) {
        const row = knownRow(h);
        warn(`  ${tag(h)}  ［${row.action ? `${ACTION_LABEL[row.action] ?? row.action}・` : ''}期限 ${row.until ?? 'なし'}］`);
      }
      if (!SHOW_ALL && list.length > 5) warn(`  …他 ${list.length - 5} 本（--all で全件）`);
    }
    const byAction = {};
    for (const e of experienceEntries) byAction[e.action] = (byAction[e.action] ?? 0) + 1;
    if (Object.keys(byAction).length) {
      warn(`  体験の一覧の内訳（記事数）: ${Object.entries(byAction).map(([a, n]) => `${ACTION_LABEL[a] ?? a} ${n}`).join('／')}`);
    }
  }
  if (expired.length) {
    warn(`\n⚠⚠ 期限を過ぎた既知の行が ${expired.length} 件あります（直すか、理由を書いて期限を延ばす）`);
    for (const h of expired) warn(`  ${h.slug}  ${h.rule}  期限 ${knownRow(h).until}`);
  }
  if (staleShown.length) {
    warn(`\n・もう当たっていない既知の行 ${staleShown.length} 件（一覧から消してよい。体験の一覧は --tighten で消える）`);
    for (const e of SHOW_ALL ? staleShown : staleShown.slice(0, 20)) warn(`  ${e.slug}  ${e.rule}`);
    if (!SHOW_ALL && staleShown.length > 20) warn(`  …他 ${staleShown.length - 20} 件（--all で全件）`);
  }
  if (shrunk.length) {
    warn(`\n・一覧の件数より減った行 ${shrunk.length} 件（--tighten で n を現状まで下げると、同じ記事への戻りも失敗になる）`);
  }
  if (failing) {
    if (fresh.length) {
      warn(`\n✗ 既知の一覧に無い、記録の確認が要る書き方 ${fresh.length} 件`);
      for (const [label, list] of byRule(fresh)) {
        warn(`【${label}】${list.length}本`);
        for (const h of list) warn(`  ${tag(h)}`);
      }
    }
    if (grown.length) {
      warn(`\n✗ 既知の記事で件数が増えた ${grown.length} 件（一覧の n より多い）`);
      for (const h of grown) warn(`  ${tag(h)}  ［一覧の n=${knownRow(h).n} → いま ${h.count}］`);
    }
    warn('\n対処:');
    warn('  点数・順位・比率・集計 … いつ・どこで・どう数えたかの記録が無ければ載せない。公式で確認できる事実の比較表（確認日・出典つき）に置き換える。');
    warn('  体験の節・一人称の文 … 記録（lib/kid-reports.ts・lib/chain-reports.ts）のある実訪問だけを書く。節の見出しか本文に、記録の店舗名・スポット名と年月を書く。');
    warn(`                         記録の置き場が無い体験（注文・席・待ち時間など）は、${EXPERIENCE_PATH} の records に 店舗・年月・根拠 を書くと外れる。`);
    warn('  読んで誤検知と決めたもの … どちらかの一覧の ignore に、理由つきで書く。');
    warn(`  既存記事を直す順番を待っているだけ … 一覧に期限つきで追記する（理由を書く。体験は扱い verify／revise／remove も）。`);
    warn('  ※ この検査の検出は「記録の確認が要る」の意味で、事実でないと決めたものではありません。');
    return 1;
  }
  say(`✓ 記録の確認が要る書き方の新しい混入なし（既知 ${known.length} 件・警告 ${warns.length} 件・${scanned}本）`);
  return FAIL_ON_EXPIRED && expired.length ? 1 : 0;
}

const ACTION_LABEL = { verify: '事実確認', revise: '修正', remove: '節の削除' };

/** 体験の一覧は 1 行 1 記事で書き出す（差分を読めるように）。 */
function stringifyExperience(j) {
  const { entries = [], records: recs = [], ignore = [], ...rest } = j;
  const head = JSON.stringify(rest, null, 2).replace(/\n\}$/, '');
  const block = (name, list) => `  "${name}": [${list.length ? `\n${list.map((e) => `    ${JSON.stringify(e)}`).join(',\n')}\n  ` : ''}]`;
  return `${head},\n${block('records', recs)},\n${block('ignore', ignore)},\n${block('entries', entries)}\n}\n`;
}

const legacyCode = PRINT_BASELINE || AS_JSON || TIGHTEN ? 0 : reportLegacy();
const unfoundedCode = reportUnfounded();
process.exit(legacyCode || unfoundedCode ? 1 : 0);
