import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { AREAS, type AreaSlug } from '@/lib/area';
import {
  SPOT_CATEGORY_VALUES,
  SPOT_PLACE_VALUES,
  SPOT_AGE_VALUES,
} from '@/lib/spot-overrides';
import { getAllSpotsWithSlug, spotToSlug, type Spot } from '@/lib/spots';

/**
 * /admin/spots/new から呼ばれる「新規スポット作成」API。
 *
 * スポットは lib/spots.ts / lib/spots-extra/*.ts にコード直書きのため、上書き（overrides）
 * 機構では新規追加できない。本APIは lib/spots-extra/admin-created.json
 * （エリア(都道府県slug) → Spot[]）に1件追記し、GitHub commit → Vercel 自動デプロイで
 * 本番反映する。ビルド時に SPOTS へマージされるので、一覧/サイトマップ/スポット詳細/
 * 今日の流れ 等すべての導線に自動で乗る。
 *
 * 保存先:
 *  - ローカル開発: lib/spots-extra/admin-created.json に直接書き込み（git push は手動）
 *  - 本番: GitHub Contents API で commit → 自動デプロイ（数分）
 *
 * セキュリティ: 開発時は無条件許可、本番は ALLOW_ADMIN_EDIT≠'0' + /admin 配下 referer。
 */

const ROOT = process.cwd();
const FILE_REL = 'lib/spots-extra/admin-created.json';
const FILE_ABS = path.join(ROOT, FILE_REL);

const AREA_SLUGS = new Set<string>(AREAS.map((a) => a.slug).filter((s) => s !== 'all'));

function isAllowed(req: NextRequest): { ok: boolean; reason?: string } {
  if (process.env.NODE_ENV === 'development') return { ok: true };
  if (process.env.ALLOW_ADMIN_EDIT === '0') {
    return { ok: false, reason: 'admin edit disabled (ALLOW_ADMIN_EDIT=0)' };
  }
  const ref = req.headers.get('referer') || '';
  if (!/\/admin\//.test(ref)) return { ok: false, reason: 'invalid referer' };
  return { ok: true };
}

type AdminCreatedMap = Partial<Record<AreaSlug, Spot[]>>;

async function ghGetFile(): Promise<{ text: string; sha: string } | null> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repo) return null;
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURI(FILE_REL)}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'kyounoko-admin' },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { content?: string; sha?: string; encoding?: string };
  if (!data.content || !data.sha) return null;
  const text = data.encoding === 'base64' ? Buffer.from(data.content, 'base64').toString('utf8') : data.content;
  return { text, sha: data.sha };
}

async function ghPutFile(text: string, sha: string | undefined, message: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repo) return { ok: false, error: 'GITHUB_TOKEN/REPO not set' };
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURI(FILE_REL)}`;
  const body: Record<string, unknown> = { message, content: Buffer.from(text, 'utf-8').toString('base64'), branch };
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

function str(v: unknown, max = 200): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  if (!t) return undefined;
  return t.slice(0, max);
}

/** 受け取ったペイロードから安全な Spot を組み立てる。不正なら error を返す。 */
function buildSpot(input: unknown): { spot: Spot; area: AreaSlug } | { error: string } {
  if (!input || typeof input !== 'object') return { error: 'body must be object' };
  const p = input as Record<string, unknown>;

  const area = p.area;
  if (typeof area !== 'string' || !AREA_SLUGS.has(area)) {
    return { error: 'エリア（都道府県）を選んでください' };
  }
  const name = str(p.name, 120);
  if (!name) return { error: '施設名は必須です' };
  const category = p.category;
  if (typeof category !== 'string' || !(SPOT_CATEGORY_VALUES as readonly string[]).includes(category)) {
    return { error: 'カテゴリが不正です' };
  }
  const place = p.place;
  if (typeof place !== 'string' || !(SPOT_PLACE_VALUES as readonly string[]).includes(place)) {
    return { error: '屋内/屋外の区分が不正です' };
  }
  const agesRaw = Array.isArray(p.ages) ? p.ages : [];
  const ages = (SPOT_AGE_VALUES as readonly string[]).filter((t) => agesRaw.includes(t)) as Spot['ages'];
  if (ages.length === 0) return { error: '対象年齢を1つ以上選んでください' };

  const spot: Spot = {
    name,
    category: category as Spot['category'],
    place: place as Spot['place'],
    ages,
  };
  const city = str(p.city, 60);
  const ward = str(p.ward, 60);
  const note = str(p.note, 200);
  const hiddenTip = str(p.hiddenTip, 300);
  const nearestStation = str(p.nearestStation, 60);
  const officialUrl = str(p.officialUrl, 300);
  const image = str(p.image, 500);
  if (city) spot.city = city;
  if (ward) spot.ward = ward;
  if (note) spot.note = note;
  if (hiddenTip) spot.hiddenTip = hiddenTip;
  if (nearestStation) spot.nearestStation = nearestStation;
  if (officialUrl && /^https?:\/\//.test(officialUrl)) spot.officialUrl = officialUrl;
  if (image && /^(https?:\/\/|\/)/.test(image)) spot.images = [image];
  const budget = p.budget;
  if (typeof budget === 'string' && ['free', 'low', 'mid', 'high'].includes(budget)) {
    spot.budget = budget as Spot['budget'];
  }
  const reservation = p.reservation;
  if (typeof reservation === 'string' && ['required', 'recommended', 'none'].includes(reservation)) {
    spot.reservation = reservation as Spot['reservation'];
  }
  const walk = Number(p.walkMinutes);
  if (Number.isFinite(walk) && walk > 0 && walk < 120) spot.walkMinutes = Math.round(walk);

  return { spot, area: area as AreaSlug };
}

export async function POST(req: NextRequest) {
  const auth = isAllowed(req);
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const built = buildSpot(body);
  if ('error' in built) return NextResponse.json({ error: built.error }, { status: 400 });
  const { spot, area } = built;

  // slug 衝突チェック（既存の全スポット slug と、同名スポットの有無）。
  const slug = spotToSlug(spot, area);
  const existing = getAllSpotsWithSlug();
  if (existing.some((e) => e.slug === slug)) {
    return NextResponse.json(
      { error: `同じURL(slug=${slug})のスポットが既にあります。施設名か市区町村を変えてください。` },
      { status: 409 },
    );
  }
  if (existing.some((e) => e.spot.name === spot.name)) {
    return NextResponse.json(
      { error: `同名のスポット「${spot.name}」が既に登録されています。` },
      { status: 409 },
    );
  }

  // 既存 JSON を読み込み（本番=GitHub, 開発=FS）
  const useGitHub = process.env.NODE_ENV !== 'development' && !!process.env.GITHUB_TOKEN && !!process.env.GITHUB_REPO;
  let current: AdminCreatedMap = {};
  let sha: string | undefined;
  if (useGitHub) {
    const gh = await ghGetFile();
    if (gh) {
      try { current = JSON.parse(gh.text) as AdminCreatedMap; } catch { current = {}; }
      sha = gh.sha;
    }
  } else {
    try { current = JSON.parse(await fs.readFile(FILE_ABS, 'utf8')) as AdminCreatedMap; } catch { current = {}; }
  }

  current[area] = [...(current[area] ?? []), spot];
  const newText = JSON.stringify(current, null, 2) + '\n';

  if (useGitHub) {
    const r = await ghPutFile(newText, sha, `feat(spot): add "${spot.name}" via admin`);
    if (!r.ok) return NextResponse.json({ error: r.error || 'github write failed' }, { status: 500 });
    return NextResponse.json({ ok: true, mode: 'github', slug, url: `/spot/${slug}` });
  }
  try {
    await fs.writeFile(FILE_ABS, newText, 'utf8');
  } catch (e) {
    return NextResponse.json({ error: 'local write failed: ' + (e instanceof Error ? e.message : String(e)) }, { status: 500 });
  }
  return NextResponse.json({ ok: true, mode: 'local', slug, url: `/spot/${slug}` });
}
