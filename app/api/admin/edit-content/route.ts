import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { isKvConfigured, getLastKvSetError } from '@/lib/kv-store';
import {
  ARTICLE_OVERRIDES_TAG,
  readArticleOverridesMap,
  writeArticleOverride,
  deleteArticleOverride,
} from '@/lib/articles';
import { purgeCfUrls } from '@/lib/cf-purge';
import { newFindings, registeredScopeFor } from '@/lib/claim-rules.mjs';
import { KID_REPORTS } from '@/lib/kid-reports';
import { CHAIN_REPORTS } from '@/lib/chain-reports';
import experienceBaseline from '@/data/experience-claims-baseline.json';

/**
 * /admin/articles/[slug]/edit と /admin/plans/[id]/edit から呼ばれる
 * コンテンツ編集 API。
 *
 * 機能:
 *  - GET  ?kind=article&slug=xxx  → { frontmatter (JSON), body (markdown) }
 *  - POST { kind, slug, frontmatter, body }  → 保存
 *
 * 保存先の自動切り替え:
 *  - **ローカル開発** (NODE_ENV=development): ローカル FS に直接書き込み（git push は手動）
 *  - **本番 Vercel + GitHub設定済み**: GitHub Contents API で content/*.md を直接 commit
 *    → Vercel が自動デプロイ。**スマホからも編集→保存だけで本番反映**。
 *
 * 保存前の検査（2026-10-11 追加・記事のみ）:
 *  - 保存する本文に、**前の版に無かった**「記録の確認が要る書き方」（点数・順位・比率・集計・調査の体裁・
 *    名前を伏せた他人の声・体験の節・書き手の家族を主語にした文）が入っていたら、保存せずに
 *    409 { needsConfirm: true, claims: [...] } を返す。管理画面は一覧を出して確認を取り、
 *    confirmClaims: true を付けて送り直す（記録のある事実だと分かっている人だけが通せる）。
 *  - 規則は lib/claim-rules.mjs の 1 か所（scripts/check-fabricated-claims.mjs と同じ定義）。
 *  - なぜここで見るか: 管理画面の保存は KV に入り、表示は KV が md より優先される。
 *    content/articles/*.md だけを見る CI の検査は、この経路の本文を 1 文字も見ていなかった。
 *  - 前の版からある書き方では止めない（誤字を直すだけの保存を止めないため）。
 *    既にある分は data/experience-claims-baseline.json・data/unfounded-claims-baseline.json の便で直す。
 *  - 検出は「記録の確認が要る」の意味で、事実でないと決めるものではない。
 *
 * セキュリティ:
 *  - 開発時 (NODE_ENV=development) は無条件で許可
 *  - 本番では ALLOW_ADMIN_EDIT=1 ENV を設定したときだけ動作
 *  - referer が /admin/ 由来であることをチェック（CSRF対策）
 *  - slug は [a-z0-9_-]+ のみ許可（パストラバーサル対策）
 *
 * 本番で必要な ENV:
 *  - ALLOW_ADMIN_EDIT=1
 *  - GITHUB_TOKEN  : Fine-grained PAT。kyounoko-web リポジトリの Contents: read & write 権限
 *  - GITHUB_REPO   : "owner/repo" 形式（例: "nagamy/kyounoko-web"）
 *  - GITHUB_BRANCH : デフォルト "main"
 *  - GITHUB_AUTHOR_NAME / GITHUB_AUTHOR_EMAIL : 任意。指定なければ token 所有者を使う
 */

const ROOT = process.cwd();
const KINDS = ['article', 'plan'] as const;
type Kind = (typeof KINDS)[number];

function isAllowed(req: NextRequest): { ok: boolean; reason?: string } {
  if (process.env.NODE_ENV === 'development') return { ok: true };
  // 明示的に '0' で disable できるが、未設定はデフォルト許可。
  // /admin 配下は middleware の Basic Auth で保護されており、ここでは referer のみ確認すれば十分。
  if (process.env.ALLOW_ADMIN_EDIT === '0') {
    return { ok: false, reason: 'admin edit disabled (ALLOW_ADMIN_EDIT=0)' };
  }
  const ref = req.headers.get('referer') || '';
  if (!/\/admin\//.test(ref)) return { ok: false, reason: 'invalid referer' };
  return { ok: true };
}

function pathFor(kind: Kind, slug: string): string | null {
  if (!/^[a-z0-9_-]+$/.test(slug)) return null;
  const dir = kind === 'article' ? 'content/articles' : 'content/plans';
  return path.join(ROOT, dir, `${slug}.md`);
}

function parseKind(v: unknown): Kind | null {
  return KINDS.includes(v as Kind) ? (v as Kind) : null;
}

function repoPath(kind: Kind, slug: string): string {
  const dir = kind === 'article' ? 'content/articles' : 'content/plans';
  return `${dir}/${slug}.md`;
}

/** GitHub Contents API でファイル取得 → text を返す（取得できなければ null） */
async function ghGetFile(repoRel: string): Promise<{ text: string; sha: string } | null> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repo) return null;
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURI(repoRel)}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'kyounoko-admin' },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { content?: string; sha?: string; encoding?: string };
  if (!data.content || !data.sha) return null;
  const text =
    data.encoding === 'base64'
      ? Buffer.from(data.content, 'base64').toString('utf8')
      : data.content;
  return { text, sha: data.sha };
}

/** GitHub Contents API でファイル作成/更新（commit） */
async function ghPutFile(
  repoRel: string,
  newText: string,
  message: string,
  prevSha?: string
): Promise<{ commit?: string; html_url?: string }> {
  const token = process.env.GITHUB_TOKEN!;
  const repo = process.env.GITHUB_REPO!;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURI(repoRel)}`;
  const author =
    process.env.GITHUB_AUTHOR_NAME && process.env.GITHUB_AUTHOR_EMAIL
      ? { name: process.env.GITHUB_AUTHOR_NAME, email: process.env.GITHUB_AUTHOR_EMAIL }
      : undefined;
  const payload: Record<string, unknown> = {
    message,
    content: Buffer.from(newText, 'utf8').toString('base64'),
    branch,
  };
  if (prevSha) payload.sha = prevSha;
  if (author) {
    payload.author = author;
    payload.committer = author;
  }
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'kyounoko-admin',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GitHub PUT failed: ${res.status} ${errText.slice(0, 300)}`);
  }
  const data = (await res.json()) as { commit?: { sha?: string; html_url?: string } };
  return { commit: data.commit?.sha, html_url: data.commit?.html_url };
}

/** 実訪問の記録（scripts/check-fabricated-claims.mjs が lib/*.ts から読むものと同じ中身）。 */
const VISIT_RECORDS = {
  // 短すぎる名前（2文字以下）は別の語に紛れるので使わない（スクリプト側と同じ条件）
  spots: Object.keys(KID_REPORTS).filter((n) => n.length >= 3),
  chainStores: CHAIN_REPORTS.map((r) => [r.chain, r.store]),
};

type ClaimNote = { rule: string; label: string; severity: string; excerpt: string };

/**
 * 保存しようとしている本文に、前の版に無かった「記録の確認が要る書き方」が入っていないかを見る。
 * 検査そのものが失敗したときは、保存を止めない（空を返してログに残す）。
 */
function findNewClaims(slug: string, prevRaw: string, nextRaw: string): ClaimNote[] {
  try {
    // 前の版も同じ書き出し方（gray-matter）に通してから比べる。そのまま比べると、
    // frontmatter の引用符や折り返しの違いだけで「新しい文」と数えてしまう。
    let prev = '';
    if (prevRaw) {
      const p = matter(prevRaw);
      prev = matter.stringify(p.content, p.data);
    }
    // 記録を登録した範囲（records）。その中に足した文も、newFindings は新しい文として返す
    // （登録は「そのときあった文」の確認なので、足した文には改めて確認を求める）。
    const { backedSections } = registeredScopeFor(experienceBaseline.records, slug);
    const added = newFindings(prev, nextRaw, { records: VISIT_RECORDS, backedSections });
    return added.flatMap((f) =>
      f.sentences.map((s) => ({ rule: f.rule, label: f.label, severity: f.severity, excerpt: s.slice(0, 120) })),
    );
  } catch (e) {
    console.error(`[claims] check failed for ${slug}: ${e instanceof Error ? e.message : String(e)}`);
    return [];
  }
}

const useGitHub = (): boolean =>
  process.env.NODE_ENV !== 'development' && !!process.env.GITHUB_TOKEN && !!process.env.GITHUB_REPO;

export async function GET(req: NextRequest) {
  const guard = isAllowed(req);
  if (!guard.ok) return NextResponse.json({ ok: false, error: guard.reason }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const kind = parseKind(searchParams.get('kind'));
  const slug = searchParams.get('slug') || '';
  if (!kind) return NextResponse.json({ ok: false, error: 'invalid kind' }, { status: 400 });

  // 記事 + KV設定時: KV の編集済みを正とする（無ければ下の FS/GitHub にフォールバック）
  if (kind === 'article' && isKvConfigured()) {
    let map: Record<string, string>;
    try {
      map = await readArticleOverridesMap();
    } catch (e) {
      // KV が読めないと md 版を編集画面に出してしまい、保存で KV 上の編集を上書きしうる
      return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 503 });
    }
    const ov = map[slug];
    if (ov) {
      const { data, content } = matter(ov);
      return NextResponse.json({ ok: true, frontmatter: data, body: content, source: 'kv' });
    }
  }

  // 本番 + GitHub設定済み → GitHub から取得（FS は古い可能性があるため）
  // 取得できない場合（トークン失効の 401/404 など）はエラーにせず、
  // デプロイに同梱された FS の md へフォールバックする。保存は KV 経由なので
  // GitHub が死んでいても編集フロー自体は成立する。
  if (useGitHub()) {
    try {
      const got = await ghGetFile(repoPath(kind, slug));
      if (got) {
        const { data, content } = matter(got.text);
        return NextResponse.json({ ok: true, frontmatter: data, body: content, source: 'github', sha: got.sha });
      }
    } catch {
      // fall through to FS
    }
  }

  const fp = pathFor(kind, slug);
  if (!fp) return NextResponse.json({ ok: false, error: 'invalid slug' }, { status: 400 });
  try {
    const raw = await fs.readFile(fp, 'utf8');
    const { data, content } = matter(raw);
    return NextResponse.json({ ok: true, frontmatter: data, body: content, source: 'fs' });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 404 }
    );
  }
}

export async function POST(req: NextRequest) {
  const guard = isAllowed(req);
  if (!guard.ok) return NextResponse.json({ ok: false, error: guard.reason }, { status: 403 });

  let body: { kind?: string; slug?: string; frontmatter?: unknown; body?: string; confirmClaims?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }
  const kind = parseKind(body.kind);
  if (!kind) return NextResponse.json({ ok: false, error: 'invalid kind' }, { status: 400 });
  const fp = pathFor(kind, body.slug || '');
  if (!fp) return NextResponse.json({ ok: false, error: 'invalid slug' }, { status: 400 });
  if (typeof body.body !== 'string' || body.frontmatter == null || typeof body.frontmatter !== 'object') {
    return NextResponse.json({ ok: false, error: 'invalid payload' }, { status: 400 });
  }

  // gray-matter.stringify で YAML フロントマター + 本文を再構成
  const out = matter.stringify(body.body, body.frontmatter as Record<string, unknown>);

  // ----- 記事: 保存前の検査（前の版に無かった「記録の確認が要る書き方」） -----
  // KV 設定時は上書きの一覧をここで 1 回だけ読み、検査と保存の両方に使う（KV の読み取りを増やさない）。
  let overridesMap: Record<string, string> | undefined;
  let claimWarnings: ClaimNote[] = [];
  if (kind === 'article') {
    if (isKvConfigured()) {
      try {
        overridesMap = await readArticleOverridesMap();
      } catch (e) {
        return NextResponse.json({ ok: false, error: `保存を中止しました（${e instanceof Error ? e.message : String(e)}）` }, { status: 503 });
      }
    }
    let prevRaw = overridesMap?.[body.slug!] ?? '';
    if (!prevRaw) {
      try {
        prevRaw = await fs.readFile(fp, 'utf8');
      } catch {
        // 新しい記事（前の版なし）
      }
    }
    const claims = findNewClaims(body.slug!, prevRaw, out);
    const blocking = claims.filter((c) => c.severity !== 'warn');
    claimWarnings = claims.filter((c) => c.severity === 'warn');
    if (blocking.length && body.confirmClaims !== true) {
      return NextResponse.json(
        {
          ok: false,
          needsConfirm: true,
          claims: blocking,
          error:
            `保存を止めました。この保存で、記録の確認が要る書き方が ${blocking.length} か所、新しく入っています。` +
            '記録（いつ・どこで・だれが・どう数えたか）がある事実なら、確認して保存してください。',
        },
        { status: 409 },
      );
    }
    if (blocking.length) {
      // 確認して保存した記録を残す（Vercel のログで `[claims] confirmed` を引ける）
      console.warn(`[claims] confirmed save: ${body.slug} ${blocking.map((c) => c.rule).join(',')} (${blocking.length})`);
      claimWarnings = claims;
    }
  }

  // ----- 記事 + KV設定時: デプロイ不要で KV に保存し、該当ページだけ revalidate -----
  if (kind === 'article' && isKvConfigured()) {
    let ok: boolean;
    try {
      ok = await writeArticleOverride(body.slug!, out, overridesMap);
    } catch (e) {
      return NextResponse.json({ ok: false, error: `保存を中止しました（${e instanceof Error ? e.message : String(e)}）` }, { status: 503 });
    }
    if (!ok) return NextResponse.json({ ok: false, error: `kv write failed: ${getLastKvSetError() ?? 'unknown'}` }, { status: 500 });
    revalidateTag(ARTICLE_OVERRIDES_TAG);
    revalidatePath(`/article/${body.slug}`);
    revalidatePath('/sitemap.xml'); // 新規記事をサイトマップに即反映（SEO発見性）
    // CFエッジキャッシュも該当URLをパージ（ビルド不要・数秒で本番反映）。
    // env未設定なら no-op（TTL 3600s で自然反映）。
    const purge = await purgeCfUrls([`/article/${body.slug}`, '/']);
    return NextResponse.json({
      ok: true,
      source: 'kv',
      claimWarnings,
      deployed: purge.purged
        ? 'KV保存＋CFキャッシュをパージしました（数秒で本番反映）'
        : 'KVに保存しました（デプロイ不要）',
    });
  }

  // ----- 本番 + GitHub設定済み: Contents API 経由で commit -----
  if (useGitHub()) {
    try {
      const repoRel = repoPath(kind, body.slug!);
      const prev = await ghGetFile(repoRel);
      const commitMsg = `edit(${kind}): ${body.slug} via admin (mobile)`;
      const result = await ghPutFile(repoRel, out, commitMsg, prev?.sha);

      // ----- on-demand revalidate: 該当ページ + 一覧系のキャッシュをパージ -----
      // これにより Vercel build を待たず（多くの場合ビルドはスキップされる）即時反映
      const slugForPath = body.slug!;
      const pathsToRevalidate =
        kind === 'article'
          ? [`/article/${slugForPath}`, '/', '/search']
          : [`/plan/${slugForPath}`, '/'];
      let revalidated: string[] = [];
      try {
        const origin = new URL(req.url).origin;
        // env 未設定なら revalidate はスキップ（Vercel 自動デプロイで反映される）
        const secret = process.env.ADMIN_REVALIDATE_SECRET;
        if (!secret) throw new Error('ADMIN_REVALIDATE_SECRET 未設定');
        const r = await fetch(`${origin}/api/admin/revalidate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret, paths: pathsToRevalidate }),
        });
        if (r.ok) {
          const j = (await r.json()) as { revalidated?: string[] };
          revalidated = j.revalidated || [];
        }
      } catch {
        // revalidate 失敗してもエラーにしない（GitHub commit は成功してる）
      }

      return NextResponse.json({
        ok: true,
        source: 'github',
        claimWarnings,
        path: repoRel,
        commit: result.commit,
        commitUrl: result.html_url,
        revalidated,
        deployed: revalidated.length
          ? 'キャッシュをパージしました（即時反映）'
          : 'GitHub commit 完了（Vercel 自動デプロイで反映）',
      });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      );
    }
  }

  // ----- 本番だが GitHub 未設定: 明確なエラーを返す（FS は read-only） -----
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      {
        ok: false,
        error:
          '本番環境で記事編集するには、Vercel 環境変数に GITHUB_TOKEN と GITHUB_REPO を設定してください。' +
          'Vercel Project Settings → Environment Variables から追加できます。' +
          ' GITHUB_TOKEN: GitHub Fine-grained PAT（Contents: read & write 権限） / ' +
          ' GITHUB_REPO: "owner/repo" 形式（例: mynotservice-prog/kyounoko-web）',
      },
      { status: 500 }
    );
  }

  // ----- ローカル開発: FS に書き込み（git push は手動） -----
  try {
    // バックアップ（直前の内容を .bak にコピー）— 失敗時の復旧用
    try {
      const prev = await fs.readFile(fp, 'utf8');
      await fs.writeFile(fp + '.bak', prev, 'utf8');
    } catch {
      // 元ファイルがない（新規作成）ケースもあり得るので無視
    }
    await fs.writeFile(fp, out, 'utf8');
    return NextResponse.json({ ok: true, source: 'fs', claimWarnings, path: fp.replace(ROOT, '') });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

/**
 * DELETE ?kind=article&slug=xxx
 *   記事の KV 上書き（article:overrides）を解除して md を正に統一（flatten）する。
 *   単純削除だと admin で差し替えた hero 画像などが古い md 版に戻ってしまうため、
 *   まず KV 版の生Markdown（画像込みの最新）を md に書き戻してから KV を削除する。
 *   → 以後この記事は md 編集（deploy-md.sh のフルビルド）がそのまま反映されるようになる。
 *
 * DELETE ?kind=article&slug=xxx&writeback=0
 *   書き戻しを行わず、KV 上書きの削除だけを行う。
 *   **呼び出し側が「md 側が既に正しい」ことを確認済みのときだけ使う。**
 *   必要な理由: 書き戻しは GitHub Contents API に依存しており、GITHUB_TOKEN が
 *   失効すると 404 で失敗して削除まで到達しない（2026-07-27 に本番で発生。
 *   ghGetFile も全 slug で 404 = リポジトリ単位で権限が無い状態だった）。
 *   md をリポジトリ側で先に正しくしてからデプロイした場合、書き戻しは不要どころか
 *   「古い KV 版で md を上書きする」有害な操作になるため、明示的に飛ばせるようにする。
 */
export async function DELETE(req: NextRequest) {
  const guard = isAllowed(req);
  if (!guard.ok) return NextResponse.json({ ok: false, error: guard.reason }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const kind = parseKind(searchParams.get('kind'));
  const slug = searchParams.get('slug') || '';
  if (kind !== 'article') {
    return NextResponse.json({ ok: false, error: 'flush は記事のみ対応' }, { status: 400 });
  }
  if (!/^[a-z0-9_-]+$/.test(slug)) {
    return NextResponse.json({ ok: false, error: 'invalid slug' }, { status: 400 });
  }
  if (!isKvConfigured()) {
    return NextResponse.json({ ok: false, error: 'KV 未設定' }, { status: 400 });
  }

  // KV に override が無ければ既に md 正（冪等に成功を返す）
  let map: Record<string, string>;
  try {
    map = await readArticleOverridesMap();
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 503 });
  }
  const raw = map[slug];
  if (!raw) {
    // KV に無くても unstable_cache（Vercel Data Cache・デプロイを跨いで残る）が古い上書きを
    // 握っていることがある（2026-09-19 jiyugaoka-muse-square-kodzure で md 更新が出なかった）。
    // ここでもキャッシュを捨てて、md を確実に正にする。
    revalidateTag(ARTICLE_OVERRIDES_TAG);
    revalidatePath(`/article/${slug}`);
    await purgeCfUrls([`/article/${slug}`]);
    return NextResponse.json({ ok: true, flushed: false, note: 'KV override なし（キャッシュを更新し md 正に揃えました）' });
  }

  // 1) KV 版（画像込みの最新）を md に書き戻す
  //    writeback=0 のときは呼び出し側が md を正にした前提でスキップする。
  const skipWriteback = searchParams.get('writeback') === '0';
  let wrote: 'github' | 'fs' | 'none' | 'skipped' = 'none';
  try {
    if (skipWriteback) {
      wrote = 'skipped';
    } else if (useGitHub()) {
      const repoRel = repoPath('article', slug);
      const prev = await ghGetFile(repoRel);
      await ghPutFile(repoRel, raw, `flatten(article): ${slug} KV override→md（md正に統一）`, prev?.sha);
      wrote = 'github';
    } else if (process.env.NODE_ENV === 'development') {
      const fp = pathFor('article', slug);
      if (!fp) return NextResponse.json({ ok: false, error: 'invalid slug' }, { status: 400 });
      await fs.writeFile(fp, raw, 'utf8');
      wrote = 'fs';
    } else {
      return NextResponse.json(
        { ok: false, error: '本番で GITHUB_TOKEN/GITHUB_REPO 未設定のため flush 不可' },
        { status: 500 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: `md 書き戻し失敗: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }

  // 2) KV override を削除
  const ok = await deleteArticleOverride(slug);
  if (!ok) {
    return NextResponse.json({ ok: false, error: 'KV 削除失敗', wrote }, { status: 500 });
  }

  // 3) キャッシュ再検証 + CF パージ
  revalidateTag(ARTICLE_OVERRIDES_TAG);
  revalidatePath(`/article/${slug}`);
  const purge = await purgeCfUrls([`/article/${slug}`, '/']);

  return NextResponse.json({
    ok: true,
    flushed: true,
    wrote,
    purged: purge.purged,
    message: `KV override を md に統合しました（${wrote}）。以後この記事は md 編集が反映されます。`,
  });
}
