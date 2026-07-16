import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { AREAS, type AreaSlug } from '@/lib/area';
import {
  EVENTS,
  EVENT_CATEGORY_LABELS,
  type EventCategory,
  type EventEntry,
} from '@/lib/events';

/**
 * /admin/events/new から呼ばれる「新規イベント作成」API。
 *
 * イベントは lib/events.ts にコード直書きのため、上書き（event-overrides）機構では
 * 新規追加できない。本APIは lib/events-extra.json（EventEntry[]）に1件追記し、
 * GitHub commit → Vercel 自動デプロイで本番反映する。ビルド時に EVENTS へマージされ、
 * /events 一覧・/event/[slug]・スポット周辺の「今週のイベント」等に自動で乗る。
 *
 * 保存先: 開発=FS直書き / 本番=GitHub Contents API commit。
 * セキュリティ: 開発時は無条件許可、本番は ALLOW_ADMIN_EDIT≠'0' + /admin 配下 referer。
 */

const ROOT = process.cwd();
const FILE_REL = 'lib/events-extra.json';
const FILE_ABS = path.join(ROOT, FILE_REL);

const AREA_SLUGS = new Set<string>(AREAS.map((a) => a.slug).filter((s) => s !== 'all'));
const CATEGORY_SLUGS = new Set<string>(Object.keys(EVENT_CATEGORY_LABELS));

function isAllowed(req: NextRequest): { ok: boolean; reason?: string } {
  if (process.env.NODE_ENV === 'development') return { ok: true };
  if (process.env.ALLOW_ADMIN_EDIT === '0') {
    return { ok: false, reason: 'admin edit disabled (ALLOW_ADMIN_EDIT=0)' };
  }
  const ref = req.headers.get('referer') || '';
  if (!/\/admin\//.test(ref)) return { ok: false, reason: 'invalid referer' };
  return { ok: true };
}

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

function str(v: unknown, max = 300): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  if (!t) return undefined;
  return t.slice(0, max);
}
const isDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

function buildEvent(input: unknown): { event: EventEntry } | { error: string } {
  if (!input || typeof input !== 'object') return { error: 'body must be object' };
  const p = input as Record<string, unknown>;

  const slug = str(p.slug, 80);
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return { error: 'slug は英小文字・数字・ハイフンで入力してください' };
  }
  const title = str(p.title, 120);
  if (!title) return { error: 'イベント名は必須です' };
  const lede = str(p.lede, 300);
  if (!lede) return { error: '説明（lede）は必須です' };
  const category = p.category;
  if (typeof category !== 'string' || !CATEGORY_SLUGS.has(category)) {
    return { error: 'カテゴリが不正です' };
  }
  if (!isDate(p.startDate) || !isDate(p.endDate)) {
    return { error: '開催日は YYYY-MM-DD 形式で入力してください' };
  }
  if ((p.endDate as string) < (p.startDate as string)) {
    return { error: '終了日は開始日以降にしてください' };
  }
  const venue = str(p.venue, 120);
  if (!venue) return { error: '会場は必須です' };
  const area = p.area;
  if (typeof area !== 'string' || !AREA_SLUGS.has(area)) {
    return { error: 'エリア（都道府県）を選んでください' };
  }

  const event: EventEntry = {
    slug,
    title,
    lede,
    category: category as EventCategory,
    startDate: p.startDate as string,
    endDate: p.endDate as string,
    venue,
    area: area as AreaSlug,
  };
  const city = str(p.city, 60);
  const ageLabel = str(p.ageLabel, 60);
  const price = str(p.price, 80);
  const officialUrl = str(p.officialUrl, 300);
  const hero = str(p.hero, 500);
  const note = str(p.note, 300);
  if (city) event.city = city;
  if (ageLabel) event.ageLabel = ageLabel;
  if (price) event.price = price;
  if (officialUrl && /^https?:\/\//.test(officialUrl)) event.officialUrl = officialUrl;
  if (hero && /^(https?:\/\/|\/)/.test(hero)) event.hero = hero;
  if (note) event.note = note;
  if (p.recurring === 'annual') event.recurring = 'annual';

  return { event };
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
  const built = buildEvent(body);
  if ('error' in built) return NextResponse.json({ error: built.error }, { status: 400 });
  const { event } = built;

  if (EVENTS.some((e) => e.slug === event.slug)) {
    return NextResponse.json({ error: `slug「${event.slug}」は既に使われています。` }, { status: 409 });
  }

  const useGitHub = process.env.NODE_ENV !== 'development' && !!process.env.GITHUB_TOKEN && !!process.env.GITHUB_REPO;
  let current: EventEntry[] = [];
  let sha: string | undefined;
  if (useGitHub) {
    const gh = await ghGetFile();
    if (gh) {
      try {
        const parsed = JSON.parse(gh.text);
        current = Array.isArray(parsed) ? (parsed as EventEntry[]) : [];
      } catch {
        current = [];
      }
      sha = gh.sha;
    }
  } else {
    try {
      const parsed = JSON.parse(await fs.readFile(FILE_ABS, 'utf8'));
      current = Array.isArray(parsed) ? (parsed as EventEntry[]) : [];
    } catch {
      current = [];
    }
  }

  if (current.some((e) => e.slug === event.slug)) {
    return NextResponse.json({ error: `slug「${event.slug}」は既に作成済みです。` }, { status: 409 });
  }

  current.push(event);
  const newText = JSON.stringify(current, null, 2) + '\n';

  if (useGitHub) {
    const r = await ghPutFile(newText, sha, `feat(event): add "${event.title}" via admin`);
    if (!r.ok) return NextResponse.json({ error: r.error || 'github write failed' }, { status: 500 });
    return NextResponse.json({ ok: true, mode: 'github', slug: event.slug, url: `/event/${event.slug}` });
  }
  try {
    await fs.writeFile(FILE_ABS, newText, 'utf8');
  } catch (e) {
    return NextResponse.json({ error: 'local write failed: ' + (e instanceof Error ? e.message : String(e)) }, { status: 500 });
  }
  return NextResponse.json({ ok: true, mode: 'local', slug: event.slug, url: `/event/${event.slug}` });
}
