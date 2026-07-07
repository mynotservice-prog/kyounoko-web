import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { revalidatePath, revalidateTag } from 'next/cache';
import {
  SPOT_TEXT_FIELDS,
  SPOT_PRICING_FIELDS,
  SPOT_FACILITY_ENUM_FIELDS,
  SPOT_AGE_GUIDE_FIELDS,
  SPOT_CATEGORY_VALUES,
  SPOT_PLACE_VALUES,
  SPOT_AGE_VALUES,
  SPOT_OVERRIDES_TAG,
  readSpotOverridesForWrite,
  writeSpotOverridesToKv,
  type SpotOverride,
} from '@/lib/spot-overrides';
import { isKvConfigured } from '@/lib/kv-store';
import { purgeCfUrls } from '@/lib/cf-purge';

/**
 * /admin/spots/edit から呼ばれるスポット上書き保存 API。
 *
 * 機能:
 *  - GET  → { overrides: { [slug]: SpotOverride } }
 *  - POST { slug, patch: SpotOverride } → 該当slugを更新
 *      フィールドが空文字なら override 削除（元の値に戻る）
 *
 * 保存先:
 *  - ローカル開発: lib/spot-overrides.json に直接書き込み
 *  - 本番: GitHub Contents API で commit → 自動デプロイ
 *
 * セキュリティ:
 *  - 開発時 (NODE_ENV=development) は無条件で許可
 *  - 本番では ALLOW_ADMIN_EDIT≠'0' + referer check（/admin 配下は Basic Auth 済み）
 *  - slug は [a-z0-9_-]+ のみ
 *  - patch はホワイトリストのキーだけ受け付ける
 */

const ROOT = process.cwd();
const FILE_REL = 'lib/spot-overrides.json';
const FILE_ABS = path.join(ROOT, FILE_REL);

const BUDGETS = ['free', 'low', 'mid', 'high'];
const RESERVATIONS = ['required', 'recommended', 'none'];
const YESNO = ['yes', 'no'];

function isAllowed(req: NextRequest): { ok: boolean; reason?: string } {
  if (process.env.NODE_ENV === 'development') return { ok: true };
  if (process.env.ALLOW_ADMIN_EDIT === '0') {
    return { ok: false, reason: 'admin edit disabled (ALLOW_ADMIN_EDIT=0)' };
  }
  const ref = req.headers.get('referer') || '';
  if (!/\/admin\//.test(ref)) return { ok: false, reason: 'invalid referer' };
  return { ok: true };
}

function isValidSlug(s: unknown): s is string {
  // slug は spotToSlug() が name の ASCII をそのまま残すため大文字を含みうる
  // （例: Cocos-xxxx, IKEA-xxxx, The-Kids-xxxx）。大文字も許可する。
  return typeof s === 'string' && /^[A-Za-z0-9_-]+$/.test(s);
}

/** patch をホワイトリストで検証＆クリーニングして返す。空文字フィールドは「削除指示」。 */
function sanitizePatch(input: unknown): { patch: SpotOverride; clear: Set<string> } | { error: string } {
  if (!input || typeof input !== 'object') return { error: 'patch must be object' };
  const p = input as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  const clear = new Set<string>();

  for (const k of Object.keys(p)) {
    const v = p[k];

    if ((SPOT_TEXT_FIELDS as readonly string[]).includes(k)) {
      if (v == null || v === '') { clear.add(k); continue; }
      if (typeof v !== 'string') return { error: `field ${k} must be string` };
      if (k === 'budget' && !BUDGETS.includes(v)) return { error: `invalid budget: ${v}` };
      if (k === 'reservation' && !RESERVATIONS.includes(v)) return { error: `invalid reservation: ${v}` };
      if (k === 'image' && !/^(https?:\/\/|\/)/.test(v)) {
        return { error: 'image は https:// で始まるURLか / で始まるパスを指定してください' };
      }
      // 混雑/アクセスのコツは編集部の解説文（複数文）のため長めに許容。
      const maxLen = k === 'crowdTips' || k === 'accessTips' ? 1000 : 500;
      if (v.length > maxLen) return { error: `field ${k} too long` };
      result[k] = v;
    } else if (k === 'images') {
      if (v == null) { clear.add(k); continue; }
      if (!Array.isArray(v)) return { error: 'images must be array' };
      // スロット位置（[0]=hero / [1]=中段 / [2]=下段）を保持する。
      // 中間の空欄は '' のまま残し、末尾の空欄だけ落とす。詰めると中段画像が hero に化ける。
      const out: string[] = [];
      for (const item of v) {
        if (item == null || item === '') { out.push(''); continue; }
        if (typeof item !== 'string') return { error: 'images items must be string' };
        if (!/^(https?:\/\/|\/)/.test(item)) {
          return { error: 'images は https:// で始まるURLか / で始まるパスを指定してください' };
        }
        if (item.length > 500) return { error: 'image path too long' };
        out.push(item);
      }
      while (out.length > 0 && out[out.length - 1] === '') out.pop();
      if (out.length > 0) result[k] = out.slice(0, 3);
      else clear.add(k);
    } else if (k === 'pricing') {
      if (!v || typeof v !== 'object') return { error: 'pricing must be object' };
      const pr = v as Record<string, unknown>;
      const out: Record<string, string> = {};
      for (const pk of Object.keys(pr)) {
        if (!(SPOT_PRICING_FIELDS as readonly string[]).includes(pk)) return { error: `unknown pricing field: ${pk}` };
        const pv = pr[pk];
        if (pv == null || pv === '') continue;
        if (typeof pv !== 'string' || pv.length > 100) return { error: `invalid pricing.${pk}` };
        out[pk] = pv;
      }
      if (Object.keys(out).length > 0) result[k] = out;
      else clear.add(k);
    } else if (k === 'facilities') {
      if (!v || typeof v !== 'object') return { error: 'facilities must be object' };
      const fa = v as Record<string, unknown>;
      const out: Record<string, string> = {};
      for (const fk of Object.keys(fa)) {
        const fv = fa[fk];
        if (fk === 'note') {
          if (fv == null || fv === '') continue;
          // 設備の補足（授乳室◯か所・給湯器/電子レンジ/母乳ブース…等）は300字を超えることが
          // 多いため上限を緩和。悪用防止に十分な範囲(1000字)に。
          if (typeof fv !== 'string' || fv.length > 1000) return { error: 'invalid facilities.note（1000字以内）' };
          out[fk] = fv;
        } else if ((SPOT_FACILITY_ENUM_FIELDS as readonly string[]).includes(fk)) {
          if (fv == null || fv === '') continue;
          if (typeof fv !== 'string' || !YESNO.includes(fv)) return { error: `invalid facilities.${fk}` };
          out[fk] = fv;
        } else {
          return { error: `unknown facilities field: ${fk}` };
        }
      }
      if (Object.keys(out).length > 0) result[k] = out;
      else clear.add(k);
    } else if (k === 'ageGuide') {
      if (!v || typeof v !== 'object') return { error: 'ageGuide must be object' };
      const ag = v as Record<string, unknown>;
      const out: Record<string, string> = {};
      for (const ak of Object.keys(ag)) {
        if (!(SPOT_AGE_GUIDE_FIELDS as readonly string[]).includes(ak)) return { error: `unknown ageGuide field: ${ak}` };
        const av = ag[ak];
        if (av == null || av === '') continue;
        if (typeof av !== 'string' || av.length > 400) return { error: `invalid ageGuide.${ak}` };
        out[ak] = av;
      }
      if (Object.keys(out).length > 0) result[k] = out;
      else clear.add(k);
    } else if (k === 'category') {
      if (v == null || v === '') { clear.add(k); continue; }
      if (typeof v !== 'string' || !(SPOT_CATEGORY_VALUES as readonly string[]).includes(v)) {
        return { error: `invalid category: ${String(v)}` };
      }
      result[k] = v;
    } else if (k === 'place') {
      if (v == null || v === '') { clear.add(k); continue; }
      if (typeof v !== 'string' || !(SPOT_PLACE_VALUES as readonly string[]).includes(v)) {
        return { error: `invalid place: ${String(v)}` };
      }
      result[k] = v;
    } else if (k === 'ages') {
      if (v == null) { clear.add(k); continue; }
      if (!Array.isArray(v)) return { error: 'ages must be array' };
      // 重複を除き、定義順（0-1 → 2-3 → 4-6）に正規化。
      const out = (SPOT_AGE_VALUES as readonly string[]).filter((tag) => v.includes(tag));
      for (const item of v) {
        if (!(SPOT_AGE_VALUES as readonly string[]).includes(item)) {
          return { error: `invalid age: ${String(item)}` };
        }
      }
      if (out.length > 0) result[k] = out;
      else clear.add(k);
    } else if (k === 'faq') {
      if (v == null) { clear.add(k); continue; }
      if (!Array.isArray(v)) return { error: 'faq must be array' };
      const out: Array<{ q: string; a: string }> = [];
      for (const item of v) {
        if (!item || typeof item !== 'object') return { error: 'faq items must be {q,a}' };
        const q = (item as Record<string, unknown>).q;
        const a = (item as Record<string, unknown>).a;
        // 質問・回答どちらかが空の行はスキップ（部分入力中の削除扱い）。
        if (q == null || q === '' || a == null || a === '') continue;
        if (typeof q !== 'string' || typeof a !== 'string') return { error: 'faq q/a must be string' };
        if (q.length > 200) return { error: 'faq.q too long' };
        if (a.length > 1000) return { error: 'faq.a too long' };
        out.push({ q, a });
      }
      if (out.length > 0) result[k] = out.slice(0, 20);
      else clear.add(k);
    } else if (k === 'faqComplete') {
      // true のときだけ保存（faq を完成版として扱い自動FAQを抑制）。それ以外は削除。
      if (v === true) result[k] = true;
      else clear.add(k);
    } else if (k === 'nearbySlugs') {
      if (v == null) { clear.add(k); continue; }
      if (!Array.isArray(v)) return { error: 'nearbySlugs must be array' };
      const out: string[] = [];
      const seen = new Set<string>();
      for (const item of v) {
        if (item == null || item === '') continue;
        if (typeof item !== 'string' || !/^[A-Za-z0-9_-]+$/.test(item)) {
          return { error: `invalid nearby slug: ${String(item)}` };
        }
        if (item.length > 80 || seen.has(item)) continue;
        seen.add(item);
        out.push(item);
      }
      if (out.length > 0) result[k] = out.slice(0, 12);
      else clear.add(k);
    } else {
      return { error: `unknown field: ${k}` };
    }
  }
  return { patch: result as SpotOverride, clear };
}

type Overrides = Record<string, SpotOverride>;

async function readOverrides(): Promise<Overrides> {
  try {
    const text = await fs.readFile(FILE_ABS, 'utf-8');
    return JSON.parse(text) as Overrides;
  } catch {
    return {};
  }
}

async function writeOverridesLocal(data: Overrides): Promise<void> {
  const text = JSON.stringify(data, null, 2) + '\n';
  await fs.writeFile(FILE_ABS, text, 'utf-8');
}

async function ghGetFile(): Promise<{ text: string; sha: string } | null> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repo) return null;
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURI(FILE_REL)}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'kyounoko-admin',
    },
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

async function ghPutFile(text: string, sha: string | undefined, message: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repo) return { ok: false, error: 'GITHUB_TOKEN/REPO not set' };
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURI(FILE_REL)}`;
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(text, 'utf-8').toString('base64'),
    branch,
  };
  if (sha) body.sha = sha;
  const author = process.env.GITHUB_AUTHOR_NAME;
  const email = process.env.GITHUB_AUTHOR_EMAIL;
  if (author && email) body.committer = { name: author, email };
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'kyounoko-admin',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    return { ok: false, error: `github ${res.status}: ${errText.slice(0, 200)}` };
  }
  return { ok: true };
}

// ===== GET =====

export async function GET(req: NextRequest) {
  const auth = isAllowed(req);
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: 403 });

  // KV 設定時は KV を正とする（無ければバンドルにフォールバック）。
  if (isKvConfigured()) {
    return NextResponse.json({ overrides: await readSpotOverridesForWrite() });
  }

  if (process.env.NODE_ENV !== 'development' && process.env.GITHUB_TOKEN) {
    const gh = await ghGetFile();
    if (gh) {
      try {
        const data = JSON.parse(gh.text) as Overrides;
        return NextResponse.json({ overrides: data });
      } catch {
        // fall through
      }
    }
  }
  const overrides = await readOverrides();
  return NextResponse.json({ overrides });
}

// ===== POST =====

export async function POST(req: NextRequest) {
  const auth = isAllowed(req);
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: 403 });

  let body: { slug?: unknown; patch?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!isValidSlug(body.slug)) {
    return NextResponse.json({ error: 'invalid slug' }, { status: 400 });
  }
  const slug = body.slug;
  const sanitized = sanitizePatch(body.patch);
  if ('error' in sanitized) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }
  const { patch, clear } = sanitized;

  // 既存読み込み（KV優先 → GitHub → ローカル）
  const useKv = isKvConfigured();
  let current: Overrides = {};
  let sha: string | undefined;
  if (useKv) {
    current = (await readSpotOverridesForWrite()) as Overrides;
  } else if (process.env.NODE_ENV !== 'development' && process.env.GITHUB_TOKEN) {
    const gh = await ghGetFile();
    if (gh) {
      try {
        current = JSON.parse(gh.text) as Overrides;
      } catch {
        current = {};
      }
      sha = gh.sha;
    }
  } else {
    current = await readOverrides();
  }

  // patch を current[slug] にマージ。clear に入ったキーは削除。
  const merged: Record<string, unknown> = { ...(current[slug] || {}) };
  for (const k of Object.keys(patch as Record<string, unknown>)) {
    merged[k] = (patch as Record<string, unknown>)[k];
  }
  for (const k of clear) {
    delete merged[k];
  }

  if (Object.keys(merged).length === 0) {
    delete current[slug];
  } else {
    current[slug] = merged as SpotOverride;
  }

  // KV: デプロイ不要で保存し、該当ページだけ revalidate
  if (useKv) {
    const ok = await writeSpotOverridesToKv(current);
    if (!ok) return NextResponse.json({ error: 'kv write failed' }, { status: 500 });
    revalidateTag(SPOT_OVERRIDES_TAG);
    revalidatePath(`/spot/${slug}`);
    // CFエッジキャッシュも該当URL群をパージ（画像差替はトップ/一覧/ランキングにも出るため）。
    // ビルド不要・数秒で反映。env未設定なら no-op。
    const purge = await purgeCfUrls([`/spot/${slug}`, '/', '/spots', '/ranking']);
    return NextResponse.json({
      ok: true,
      mode: 'kv',
      slug,
      cfPurged: purge.purged,
    });
  }

  const newText = JSON.stringify(current, null, 2) + '\n';

  // ローカル
  if (process.env.NODE_ENV === 'development') {
    try {
      await writeOverridesLocal(current);
    } catch (e) {
      return NextResponse.json(
        { error: 'local write failed: ' + (e instanceof Error ? e.message : String(e)) },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, mode: 'local', slug });
  }

  // 本番: GitHub commit
  const msg = `chore(spot): update overrides for ${slug}`;
  const r = await ghPutFile(newText, sha, msg);
  if (!r.ok) {
    return NextResponse.json({ error: r.error || 'github write failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, mode: 'github', slug });
}
