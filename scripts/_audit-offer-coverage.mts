/**
 * 面別アフィリオファーのカバレッジ監査（読み取りのみ・一時スクリプト）。
 *
 * content/articles/*.md の frontmatter（slug/category/title/area）と、
 * GSC page次元のクリック数JSONを突合し、実際のオファー解決関数を通して
 * 「どの面に何が出るか」を集計する。
 *
 * 使い方:
 *   npx tsx scripts/_audit-offer-coverage.mts --gsc=/path/to/gsc-pages.json
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { getRelatedItemsForArticle } from '../lib/article-product-hints';
import {
  getCoopOffer,
  getTravelOffer,
  getLeisureBridgeOffer,
  getRestaurantReservationOffer,
} from '../lib/reservation-cta';

const arg = (k: string, d = '') => {
  const m = process.argv.find((a) => a.startsWith(`--${k}=`));
  return m ? m.split('=').slice(1).join('=') : d;
};

const DIR = join(process.cwd(), 'content/articles');
type Art = { slug: string; category: string; title: string; area?: string };
const arts: Art[] = [];
for (const f of readdirSync(DIR)) {
  if (!f.endsWith('.md')) continue;
  const raw = readFileSync(join(DIR, f), 'utf8');
  const fm = raw.split('---')[1] ?? '';
  const get = (k: string) => {
    const m = fm.match(new RegExp(`^${k}:\\s*(.*)$`, 'm'));
    return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : undefined;
  };
  arts.push({
    slug: get('slug') ?? f.replace(/\.md$/, ''),
    category: get('category') ?? '',
    title: get('title') ?? '',
    area: get('area'),
  });
}

const gscPath = arg('gsc');
const clicks = new Map<string, number>();
if (gscPath) {
  const j = JSON.parse(readFileSync(gscPath, 'utf8'));
  for (const r of j.pages as { keys: string[]; clicks: number }[]) {
    const m = r.keys[0].match(/\/article\/([^/?#]+)/);
    if (m) clicks.set(m[1], (clicks.get(m[1]) ?? 0) + r.clicks);
  }
}

let nItems = 0;
const bucket = new Map<string, { n: number; clk: number }>();
const add = (k: string, clk: number) => {
  const b = bucket.get(k) ?? { n: 0, clk: 0 };
  b.n += 1;
  b.clk += clk;
  bucket.set(k, b);
};

const rows: { slug: string; clk: number; items: string; end: string; leisure: string }[] = [];
for (const a of arts) {
  const clk = clicks.get(a.slug) ?? 0;
  const items = getRelatedItemsForArticle(a.slug, a.category, a.title);
  const coop = getCoopOffer(a.slug, a.category, a.title);
  const travel = getTravelOffer(a.slug, a.category, a.title, a.area);
  const end = coop ?? travel ?? null;
  const leisureRaw = getLeisureBridgeOffer(a.slug, a.category, a.title, a.area);
  const leisure = end ? null : leisureRaw;
  const resv = getRestaurantReservationOffer(a.slug, a.category, a.title);
  if (items.length > 0) nItems += 1;
  add(`items:${items[0]?.itemId ?? items[0]?.title ?? '(none)'}`, clk);
  add(`end:${end?.itemId ?? '(none)'}`, clk);
  add(`leisure:${leisure?.itemId ?? '(none)'}`, clk);
  add(`resv:${resv?.itemId ?? '(none)'}`, clk);
  rows.push({
    slug: a.slug,
    clk,
    items: items.map((i) => i.itemId ?? i.title).join(','),
    end: end ? `${end.itemId} ${end.href.slice(-70)}` : '-',
    leisure: leisure ? `${leisure.itemId} ${leisure.href.slice(-80)}` : '-',
  });
}

console.log(`記事 ${arts.length}本 / GSCクリック紐付け ${clicks.size}本 / 商品CTAあり ${nItems}本`);
console.log('');
const keys = [...bucket.entries()].sort((a, b) => b[1].clk - a[1].clk);
for (const [k, v] of keys) {
  if (v.clk === 0 && v.n < 5) continue;
  console.log(`${k.padEnd(46)} ${String(v.n).padStart(5)}本 ${String(v.clk).padStart(7)}clk`);
}
console.log('');
console.log('--- クリック上位25本の解決結果 ---');
rows
  .sort((a, b) => b.clk - a.clk)
  .slice(0, 25)
  .forEach((r) =>
    console.log(
      `${String(r.clk).padStart(5)} ${r.slug}\n      items=${r.items}\n      end=${r.end}\n      leisure=${r.leisure}`,
    ),
  );
