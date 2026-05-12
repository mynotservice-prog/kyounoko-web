#!/usr/bin/env node
/**
 * 「カテゴリプール」用のAIイラスト一括生成。
 *
 * lib/hero-photos.ts の POOL（28カテゴリ × 3バリエーション = 最大84枚）を
 * Cloudflare Workers AI（flux-1-schnell）で温かみあるイラスト風に再生成する。
 *
 * 出力:
 *   public/hero-ai/cat-<category>-01.jpg
 *   public/hero-ai/cat-<category>-02.jpg
 *   public/hero-ai/cat-<category>-03.jpg
 *
 * 実行:
 *   CLOUDFLARE_ACCOUNT_ID=xxx CLOUDFLARE_API_TOKEN=xxx \
 *     node scripts/generate-category-pool-cloudflare.mjs
 *
 * オプション:
 *   --force            既存も上書き
 *   --concurrency=2    並列度（既定2）
 *   --steps=4          flux-schnell ステップ数（既定4、最大8）
 *   --limit=N          先頭N枚だけ
 *   --category=baby    特定カテゴリだけ
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
if (!accountId || !apiToken) {
  console.error('❌ CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN を環境変数で指定してください。');
  process.exit(1);
}

const args = process.argv.slice(2);
const force = args.includes('--force');
const concArg = args.find((a) => a.startsWith('--concurrency'));
const concurrency = concArg ? Math.max(1, parseInt(concArg.split('=')[1], 10)) : 2;
const stepsArg = args.find((a) => a.startsWith('--steps'));
const steps = stepsArg ? Math.min(8, Math.max(1, parseInt(stepsArg.split('=')[1], 10))) : 4;
const limitArg = args.find((a) => a.startsWith('--limit'));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
const catArg = args.find((a) => a.startsWith('--category'));
const catFilter = catArg ? catArg.split('=')[1] : null;

const STYLE =
  'Soft hand-drawn editorial illustration, warm watercolor and gouache textures, ' +
  'pastel palette: cream beige (#FBF5E8), peach (#F4DDCF), terracotta clay (#C9603E), ' +
  'warm honey (#EBC06A), sage green (#8FA37E). Cozy parenting magazine aesthetic, ' +
  'gentle natural lighting, no text, no Japanese characters, no signage, no logos, ' +
  '16:9 horizontal composition with negative space, safe and family-friendly atmosphere';

/**
 * 28カテゴリ × 3バリエーション分のシーン定義。
 * lib/hero-photos.ts の POOL キーに 1:1 で対応。
 */
const CATEGORY_SUBJECTS = {
  baby: [
    'a soft watercolor illustration of a Japanese baby playing with wooden rings on a tatami floor, soft afternoon light',
    'a cozy illustration of a baby cot with a plush bear, mobile, and gentle morning light through curtains',
    'a warm illustration of baby supplies on a wooden shelf: bottles, soft toys, folded onesies, beige backdrop',
  ],
  'toddler-play': [
    'a warm illustration of a toddler at a wooden table with colorful building blocks and crayons, soft daylight',
    'a cozy living room scene with stuffed animals, picture books, and a small play mat in pastel tones',
    'a gentle illustration of a kids indoor play corner with wooden train tracks and felt toys, peach and beige walls',
  ],
  'kid-study': [
    'a warm illustration of a child desk with picture books, an open notebook, and colored pencils, soft window light',
    'a cozy study corner with hiragana practice paper, an eraser, and a small plant in terracotta colors',
    'a gentle illustration of an open picture book on a wooden table beside a cup of tea, sunlight streaming in',
  ],
  'kid-craft': [
    'a warm illustration of a craft table with origami paper, scissors, washi tape, and colored markers, top-down view',
    'a cozy art corner with watercolor palette, brushes, and a half-finished painting of flowers, soft daylight',
    'a gentle illustration of a child apron and craft supplies on a wooden chair, peach background, family-friendly',
  ],
  'family-dinner': [
    'a soft illustration of a Japanese family dinner table with small bowls of rice, miso soup, and seasonal vegetables, warm light',
    'a cozy dining scene with shared plates, chopsticks, and steam rising from a hot pot in the center, evening glow',
    'a gentle watercolor of a wooden dining table set for a family meal: small dishes, tea cups, and a single flower vase',
  ],
  'home-cozy': [
    'a warm illustration of a sunlit Japanese living room with floor cushions, low table, and a cup of tea, gentle afternoon glow',
    'a cozy reading nook with a folded blanket, picture books, and a small lamp in pastel tones',
    'a gentle illustration of a Japanese home entryway with neatly placed slippers and a coat rack, soft warm light',
  ],
  'food-japan': [
    'a soft watercolor illustration of a Japanese bento box with rice balls, tamagoyaki, and steamed vegetables, top-down view',
    'a warm illustration of a kitchen counter with onigiri being shaped, nori sheets, and rice on a wooden board',
    'a cozy illustration of Japanese breakfast: grilled fish, miso soup, rice, and pickles arranged on a wooden tray',
  ],
  'food-kitchen': [
    'a warm illustration of a kitchen counter with fresh vegetables, a wooden cutting board, and a knife, soft daylight',
    'a cozy illustration of a steaming pot on the stove, herbs and ingredients arranged nearby, terracotta tones',
    'a gentle watercolor of a kitchen scene with a person\'s hands kneading dough on a floured wooden surface',
  ],
  'food-fruit': [
    'a soft watercolor illustration of a wooden bowl filled with apples, oranges, and grapes, soft morning light',
    'a warm illustration of a breakfast plate with toast, sliced strawberries, and a glass of milk, peach tablecloth',
    'a cozy illustration of fresh vegetables and fruits arranged on a kitchen counter: carrots, tomatoes, lemons',
  ],
  'food-sweet': [
    'a warm illustration of a plate of small Japanese sweets and dorayaki on a wooden table with a teapot, soft daylight',
    'a cozy illustration of a slice of homemade fruit cake with a fork and a cup of tea, pastel tones',
    'a gentle watercolor of cookies on a tray with sprinkles and powdered sugar, beige background',
  ],
  park: [
    'a warm illustration of a Japanese neighborhood park with cherry trees, a small slide, and a wooden bench, soft afternoon light',
    'a cozy park scene with a sandbox, a tricycle, and falling leaves, pastel sky',
    'a gentle illustration of a quiet park path with playground equipment in the distance, golden hour glow',
  ],
  nature: [
    'a soft watercolor illustration of a forest path with sunlight filtering through tall trees, autumn colors',
    'a warm illustration of a meadow with wildflowers and a small wooden fence, gentle breeze, pastel sky',
    'a gentle scene of a river bank with small stones and grass, distant mountains, soft daylight',
  ],
  autumn: [
    'a soft watercolor of fallen maple leaves on a stone path with a small lantern, autumn golden light',
    'a warm illustration of a park bench covered in colorful autumn leaves, soft amber tones',
    'a cozy illustration of acorns, pinecones, and dried leaves arranged on a wooden table, autumn palette',
  ],
  'winter-snow': [
    'a soft watercolor of a snow-dusted Japanese garden with a stone lantern and warm window light',
    'a warm illustration of a child mitten and a small snowman on a quiet snowy street, pastel sky',
    'a cozy illustration of a winter window view with frost patterns, a steaming mug on the sill',
  ],
  'summer-water': [
    'a soft watercolor of a backyard kiddie pool with a beach ball and water droplets, sunny summer day',
    'a warm illustration of children\'s sandals and a bucket by a stream, dappled sunlight',
    'a cozy summer scene of cicadas on a green leaf, blue sky, soft watercolor texture',
  ],
  sakura: [
    'a soft watercolor of cherry blossoms in full bloom along a quiet Japanese path, petals drifting in soft breeze',
    'a warm illustration of a picnic blanket under a cherry tree with a small bento and tea, pink petals everywhere',
    'a gentle scene of a single cherry blossom branch against a pastel pink sky, calm and serene',
  ],
  tokyo: [
    'a soft watercolor of a Tokyo residential street with a small bakery, lanterns, and bicycles, warm evening light',
    'a warm illustration of a Tokyo neighborhood viewed from above: rooftops, narrow streets, small parks',
    'a cozy illustration of a Tokyo train station entrance in soft daylight with people walking by',
  ],
  'japan-rural': [
    'a soft watercolor of a rural Japanese village with thatched-roof houses, rice paddies, and distant mountains',
    'a warm illustration of a country road lined with stone walls and persimmon trees, late afternoon light',
    'a gentle scene of a rural farm with a small barn, vegetable garden, and clear blue sky',
  ],
  sleeping: [
    'a soft watercolor of a child bedroom with a futon, picture books on the nightstand, and a soft night-light',
    'a warm illustration of a teddy bear on a folded blanket, soft moonlight through curtains',
    'a cozy bedtime scene with a starry mobile and a small lamp casting warm shadows on the wall',
  ],
  bath: [
    'a soft watercolor of a Japanese bathroom with a small wooden stool, rubber duck, and steam rising gently',
    'a warm illustration of bath toys and a folded towel on a wooden bench, soft daylight through frosted window',
    'a cozy scene of a bath set with body soap, washcloth, and a small bucket, peach tile background',
  ],
  'kid-learn': [
    'a soft watercolor of a stack of picture books, a wooden ruler, and a magnifying glass on a study desk',
    'a warm illustration of a child reading nook with cushions, a small lamp, and an open picture book',
    'a cozy scene of a desk with crayons, a notebook, and a steaming cup of cocoa, soft window light',
  ],
  classroom: [
    'a soft watercolor of an empty classroom with small wooden desks, a chalkboard, and warm afternoon light',
    'a warm illustration of a kindergarten room with toys, picture books on shelves, and a circle rug',
    'a cozy scene of a school hallway with hooks for backpacks and small slippers in cubbies',
  ],
  piano: [
    'a soft watercolor of a small upright piano with sheet music and a vase of flowers on top, soft daylight',
    'a warm illustration of a piano keyboard close-up with hands gently placed on the keys, no text on sheet',
    'a cozy music room with a piano, a wooden chair, and a small bookshelf of music books, golden hour light',
  ],
  stroller: [
    'a soft watercolor of a stroller parked beside a cafe terrace with a small bag and a sunhat hanging on it',
    'a warm illustration of a stroller on a tree-lined path in a park, soft dappled sunlight',
    'a cozy scene of stroller accessories: a sunshade, a soft blanket, and a small toy clipped to the handle',
  ],
  medical: [
    'a soft watercolor of a child first-aid kit, a thermometer, and a folded handkerchief on a wooden table',
    'a warm illustration of a pediatric clinic waiting room with picture books, soft chairs, and gentle daylight',
    'a cozy scene of a humidifier steaming gently on a nightstand beside a small mug of warm tea',
  ],
  'parent-child': [
    'a soft watercolor of a parent and child silhouette holding hands on a quiet path, viewed from behind',
    'a warm illustration of two pairs of slippers placed side by side on a wooden floor, soft daylight',
    'a cozy scene of a parent reading a picture book to a child on a sofa, viewed from a respectful angle',
  ],
  'screen-time': [
    'a soft watercolor of a tablet placed face-down on a wooden table beside a picture book and a cup of tea',
    'a warm illustration of a cozy living room with a small clock and an analog timer on a tabletop, soft daylight',
    'a cozy scene of a child desk with art supplies replacing a tablet, peach tones, family-friendly atmosphere',
  ],
  commerce: [
    'a soft watercolor of neatly arranged shopping items on a wooden table: a small notebook, a tote bag, and a wrapped gift',
    'a warm illustration of a flat-lay of baby products on a beige background: bottles, a folded blanket, a small toy',
    'a cozy scene of a desk with a checklist, a pen, and online shopping mock-ups on paper, soft daylight',
  ],
  'outdoor-generic': [
    'a soft watercolor of a sunny outdoor scene with a picnic blanket, a basket, and a tree casting gentle shade',
    'a warm illustration of a neighborhood walking path with cherry trees, benches, and warm sunlight',
    'a cozy outdoor scene of a small park bench under a tree with a thermos and a folded jacket nearby',
  ],
};

// 全ペア展開
const targets = [];
for (const [cat, scenes] of Object.entries(CATEGORY_SUBJECTS)) {
  if (catFilter && cat !== catFilter) continue;
  scenes.forEach((scene, idx) => {
    const variant = String(idx + 1).padStart(2, '0');
    targets.push({
      slug: `cat-${cat}-${variant}`,
      category: cat,
      prompt: `${scene}. Style: ${STYLE}`,
    });
  });
}

const OUT_DIR = path.join(ROOT, 'public', 'hero-ai');
const MANIFEST_PATH = path.join(OUT_DIR, 'category-pool-manifest.json');
fs.mkdirSync(OUT_DIR, { recursive: true });

let manifest = {};
if (fs.existsSync(MANIFEST_PATH)) {
  try {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch {
    manifest = {};
  }
}

let filtered = targets;
if (!force) {
  filtered = filtered.filter((t) => !fs.existsSync(path.join(OUT_DIR, `${t.slug}.jpg`)));
}
filtered = filtered.slice(0, limit);

if (filtered.length === 0) {
  console.log('✓ 生成対象なし（全件生成済み）。--force で強制再生成可。');
  process.exit(0);
}

console.log(`\n=== カテゴリプール AI生成バッチ ===`);
console.log(`対象: ${filtered.length}/${targets.length}枚`);
console.log(`モデル: @cf/black-forest-labs/flux-1-schnell`);
console.log(`steps: ${steps} / 並列: ${concurrency}`);
console.log(`出力: public/hero-ai/cat-<category>-NN.jpg`);
console.log('\n3秒後に開始...');
await sleep(3000);

const ENDPOINT = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

async function generateOne(item, index) {
  const dest = path.join(OUT_DIR, `${item.slug}.jpg`);
  const log = `[${index + 1}/${filtered.length}] ${item.slug}`;
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        prompt: item.prompt.slice(0, 2048),
        steps,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`  ✗ ${log}  HTTP ${res.status}: ${text.slice(0, 200)}`);
      if (res.status === 429) await sleep(30000);
      return { slug: item.slug, ok: false, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    if (!data.success) {
      console.error(`  ✗ ${log}  success=false`);
      return { slug: item.slug, ok: false, error: 'api error' };
    }
    const b64 = data?.result?.image;
    if (!b64) return { slug: item.slug, ok: false, error: 'no image' };
    const buf = Buffer.from(b64, 'base64');
    fs.writeFileSync(dest, buf);
    console.log(`  ✓ ${log} → ${(buf.length / 1024).toFixed(0)}KB`);
    return { slug: item.slug, ok: true, file: `/hero-ai/${item.slug}.jpg`, generatedAt: new Date().toISOString() };
  } catch (err) {
    console.error(`  ✗ ${log}  ${err.message}`);
    return { slug: item.slug, ok: false, error: err.message };
  }
}

const results = [];
let cursor = 0;
async function worker() {
  while (cursor < filtered.length) {
    const i = cursor++;
    const r = await generateOne(filtered[i], i);
    results.push(r);
    if (r.ok) {
      manifest[filtered[i].slug] = r;
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    }
    await sleep(500);
  }
}

const startedAt = Date.now();
await Promise.all(Array.from({ length: concurrency }, () => worker()));
const elapsedMs = Date.now() - startedAt;

const okCount = results.filter((r) => r.ok).length;
const ngCount = results.filter((r) => !r.ok).length;

console.log(`\n=== 完了 ===`);
console.log(`成功: ${okCount} / 失敗: ${ngCount} / 経過: ${(elapsedMs / 1000 / 60).toFixed(1)}分`);
if (ngCount > 0) {
  results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.slug}: ${r.error}`));
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
