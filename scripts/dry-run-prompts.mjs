#!/usr/bin/env node
/**
 * 全記事のDALL-E 3向けプロンプトをドライラン表示する。
 * APIは呼ばないので無料。本番実行前に必ずこれで確認すること。
 *
 * Usage:
 *   node scripts/dry-run-prompts.mjs              # 全記事のプロンプト一覧
 *   node scripts/dry-run-prompts.mjs --limit 5    # 最初の5本だけ
 *   node scripts/dry-run-prompts.mjs --slug=babycar-ranking-2026  # 特定記事だけ
 *   node scripts/dry-run-prompts.mjs --quality=hd # HD想定でコスト計算
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ------------ args ------------
const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith('--limit'));
const limit = limitArg ? parseInt(limitArg.split('=')[1] ?? args[args.indexOf(limitArg) + 1], 10) : Infinity;
const slugArg = args.find((a) => a.startsWith('--slug'));
const slugFilter = slugArg ? slugArg.split('=')[1] : null;
const quality = args.includes('--quality=hd') ? 'hd' : 'standard';

// ------------ load lib/image-prompts.ts equivalent inline ------------
// Note: importing TS from mjs requires extra tooling. Inlining the prompt builder logic.
const STYLE_ANCHOR = [
  'Soft hand-drawn illustration style',
  'warm watercolor and gouache textures',
  'pastel color palette: cream beige (#FBF5E8), peach (#F4DDCF), terracotta clay (#C9603E), warm honey (#EBC06A), sage green (#8FA37E)',
  'cozy parenting magazine aesthetic',
  'gentle natural lighting',
  'no text, no Japanese characters, no signage, no logos',
  '16:9 horizontal composition with negative space',
  'editorial illustration suitable as article hero image',
  'safe, family-friendly atmosphere',
].join(', ');

const CATEGORY_SUBJECTS = {
  'today-doko': [
    'a peaceful Japanese neighborhood park with cherry trees and a small playground in soft afternoon light',
    'a sunlit Japanese cafe terrace with a stroller parked near a wooden table',
    'a quiet Tokyo residential street with a small family walking, viewed from a respectful distance',
    'a warm illustration of a Japanese train station entrance with families heading out',
    'a cozy children\'s indoor play space with wooden toys and soft cushions',
  ],
  'today-nani': [
    'a warm illustration of a child\'s creative play setup at home with crayons, paper, and building blocks on a wooden table',
    'a cozy living room scene with art supplies, picture books, and natural light streaming through windows',
    'an inviting craft table with origami paper, scissors, and gentle decorations',
    'a soft illustration of indoor activity supplies arranged on a tatami floor',
    'a sunny windowsill with plants and a child\'s easel set up for painting',
  ],
  'today-taberu': [
    'a soft illustration of a Japanese family meal with small bowls of rice, miso soup, and seasonal vegetables on a wooden table',
    'a cozy kitchen counter with bento boxes being prepared, surrounded by ingredients in soft morning light',
    'a warm illustration of small children\'s plates with cute food arrangements: rice balls, omelet, and steamed vegetables',
    'a kitchen scene with a steaming bowl of porridge or soup and gentle natural light',
    'a soft watercolor of a child-sized table set with breakfast: toast, fruit, and a small cup',
  ],
  'today-mawasu': [
    'a cozy bedroom scene with soft evening light, picture books on a nightstand, and a futon prepared',
    'a warm illustration of a parent and child silhouette at bedtime, viewed from behind in soft lamp light',
    'a calm bath time setup with rubber ducks, a wooden stool, and steam rising gently',
    'a peaceful morning routine scene: a small breakfast table with steam rising from a bowl',
    'a softly lit hallway of a Japanese home in the evening, slippers neatly placed',
  ],
  'gyouji': [
    'a soft watercolor of cherry blossom petals falling on a quiet Japanese path with a small lantern',
    'a warm illustration of summer festival lanterns and a small wooden booth with takoyaki and shaved ice',
    'a cozy autumn leaves scene with a small park bench and falling maple leaves',
    'a winter illustration of a snow-dusted Japanese garden with a small lantern and warm window light',
    'a warm illustration of a seasonal Japanese display: kagami mochi, ehomaki, or hina dolls in soft daylight',
  ],
  'narai': [
    'a warm illustration of a children\'s music classroom with small piano keys and music sheets in soft light',
    'a cozy swimming pool scene from a respectful distance, with calm water and a small float',
    'a gentle illustration of a children\'s art class table with watercolor sets and brushes',
    'a sunny dance studio with a wooden floor and soft natural light through large windows',
    'a warm illustration of a kids\' soccer practice on green grass at golden hour',
  ],
  'yakudatsu': [
    'a soft illustration of a wooden shelf with neatly arranged baby products: bottles, soft toys, and folded clothes',
    'a cozy flat-lay of essential parenting items on a beige background: stroller, diaper bag, picture books',
    'a warm illustration of a gift box with a soft ribbon, baby items peeking out',
    'a gentle scene of a parent\'s desk with a notebook, planner, and a cup of tea',
    'a kitchen counter flat-lay of meal prep containers, fresh ingredients, and a wooden cutting board',
  ],
};

const FALLBACK_SUBJECT = 'a warm illustration of a peaceful family moment with soft natural light, cozy interior or natural setting';

function extractTopic(title) {
  if (/ベビーカー|stroller/i.test(title)) return 'a stroller in a softly lit Japanese setting';
  if (/抱っこ紐|だっこ/i.test(title)) return 'a soft illustration of a parent gently carrying a child wrapped in a baby carrier, seen from behind in warm light';
  if (/絵本|ehon/i.test(title)) return 'a cozy reading scene: open picture books, soft cushions, and a small reading nook';
  if (/料理|レシピ|recipe|食|ご飯|お弁当|bento/i.test(title)) return 'a soft illustration of a Japanese kitchen scene with food being prepared, warm tones';
  if (/公園|park/i.test(title)) return 'a peaceful Japanese park scene with trees, a small bench, and gentle sunlight';
  if (/水族館|動物園|aquarium|zoo/i.test(title)) return 'a warm illustration of an aquarium or zoo entrance area in soft light, family-friendly atmosphere';
  if (/雨|amenohi/i.test(title)) return 'a cozy indoor scene during rainy weather: a window with raindrops, warm interior lighting';
  if (/夏|natsu|プール|pool/i.test(title)) return 'a soft summer scene with a small pool or beach, soft pastel sky, and shaded areas';
  if (/桜|sakura|ohanami/i.test(title)) return 'a soft watercolor of cherry blossoms over a quiet Japanese walking path';
  if (/七五三|shichigosan/i.test(title)) return 'a warm illustration of a traditional Japanese shrine entrance with soft autumn light';
  if (/ハロウィン|halloween/i.test(title)) return 'a cozy autumn-themed illustration with pumpkins, soft orange tones, no scary elements';
  if (/クリスマス|xmas/i.test(title)) return 'a warm cozy Christmas scene with soft candle light and a small tree';
  if (/防災|bousai/i.test(title)) return 'a soft illustration of an emergency preparedness kit on a wooden floor: water bottles, supplies, and a flashlight';
  if (/睡眠|nene|寝/i.test(title)) return 'a peaceful bedroom scene with soft moonlight, a futon, and a stuffed animal';
  if (/離乳食|rinyu/i.test(title)) return 'a soft illustration of small baby food bowls and a wooden spoon on a kitchen counter';
  if (/保育園|hoiku|youchien|幼稚園/i.test(title)) return 'a warm illustration of a kindergarten entrance with small backpacks and shoe lockers in soft light';
  if (/イヤイヤ|iyaiya/i.test(title)) return 'a gentle illustration of a parent calmly sitting near a small child, viewed from a soft distance';
  if (/おでかけ|odekake/i.test(title)) return 'a warm illustration of a family setting out for a day trip, viewed from behind walking towards a sunny path';
  if (/レストラン|cafe|カフェ/i.test(title)) return 'a soft illustration of a family-friendly cafe interior with high chairs and warm wood tones';
  if (/駅|station/i.test(title)) return 'a warm illustration of a Japanese train station exterior in soft daylight, no station name signage visible';
  return '';
}

function simpleHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function buildHeroPrompt(article) {
  const cat = article.category ?? '';
  const subjects = CATEGORY_SUBJECTS[cat] ?? [FALLBACK_SUBJECT];
  const topic = extractTopic(article.title);
  let subject;
  if (topic) {
    subject = topic;
  } else {
    const idx = simpleHash(article.slug) % subjects.length;
    subject = subjects[idx];
  }
  return `${subject}, ${STYLE_ANCHOR}`;
}

// ------------ scan articles ------------
const ARTICLES_DIR = path.join(ROOT, 'content', 'articles');
const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'));
const articles = files
  .map((f) => {
    const slug = f.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8');
    const { data } = matter(raw);
    return {
      slug,
      title: String(data.title ?? ''),
      category: String(data.category ?? ''),
      categoryName: String(data.categoryName ?? ''),
      hero: typeof data.hero === 'string' ? data.hero : '',
    };
  })
  .filter((a) => (slugFilter ? a.slug === slugFilter : true))
  .slice(0, limit);

// ------------ output ------------
const PER_IMAGE = quality === 'hd' ? 0.08 : 0.04;
console.log(`\n=== Hero Image Prompt Dry Run ===`);
console.log(`記事数: ${articles.length} 本`);
console.log(`想定モデル: dall-e-3 (1792x1024 ${quality})`);
console.log(`想定コスト: $${(articles.length * PER_IMAGE).toFixed(2)} (US$)`);
console.log(`            ¥${Math.round(articles.length * PER_IMAGE * 158).toLocaleString()} 程度（150-160円/USDで換算）\n`);

const sampleSize = Math.min(10, articles.length);
console.log(`--- プロンプト例（先頭${sampleSize}件）---\n`);
articles.slice(0, sampleSize).forEach((a, i) => {
  const prompt = buildHeroPrompt(a);
  console.log(`[${i + 1}] ${a.slug}`);
  console.log(`    title: ${a.title}`);
  console.log(`    category: ${a.category}`);
  console.log(`    現hero: ${a.hero || '(なし)'}`);
  console.log(`    prompt: ${prompt.slice(0, 200)}...`);
  console.log();
});

if (articles.length > sampleSize) {
  console.log(`... 残り ${articles.length - sampleSize}本のプロンプト省略\n`);
}

// 全プロンプトをJSONで吐く（後段スクリプトで使う）
const out = articles.map((a) => ({
  slug: a.slug,
  title: a.title,
  category: a.category,
  currentHero: a.hero,
  prompt: buildHeroPrompt(a),
}));
const outPath = path.join(ROOT, 'tmp', 'image-prompts.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`✓ 全${articles.length}件のプロンプトを ${path.relative(ROOT, outPath)} に保存`);
console.log(`  → 次は OPENAI_API_KEY を設定後 scripts/generate-hero-images.mjs を実行\n`);
