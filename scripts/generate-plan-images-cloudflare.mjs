#!/usr/bin/env node
/**
 * プラン530本のhero画像を Cloudflare Workers AI (flux-1-schnell) で
 * 「温かみあるイラスト風」に1本ずつ生成する。
 *
 * 出力:
 *   public/hero-ai/<planId>.jpg   ← lib/plans.ts が最優先で参照
 *
 * 1日の無料枠は約10,000 neurons（steps=6で約80-90枚）なので、
 * 日次バッチで --limit=90 を回し続ければ約1週間で530本完了する想定。
 *
 * Usage:
 *   CLOUDFLARE_ACCOUNT_ID=xxx CLOUDFLARE_API_TOKEN=xxx \
 *     node scripts/generate-plan-images-cloudflare.mjs [--limit=90] [--concurrency=4] [--steps=6] [--force]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

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
const limitArg = args.find((a) => a.startsWith('--limit'));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 90;
const concArg = args.find((a) => a.startsWith('--concurrency'));
const concurrency = concArg ? Math.max(1, parseInt(concArg.split('=')[1], 10)) : 4;
const stepsArg = args.find((a) => a.startsWith('--steps'));
const steps = stepsArg ? Math.min(8, Math.max(1, parseInt(stepsArg.split('=')[1], 10))) : 6;
const planIdArg = args.find((a) => a.startsWith('--plan'));
const planIdFilter = planIdArg ? planIdArg.split('=')[1] : null;

const STYLE =
  'Soft hand-drawn editorial illustration, warm watercolor and gouache textures, ' +
  'pastel palette: cream beige (#FBF5E8), peach (#F4DDCF), terracotta clay (#C9603E), ' +
  'warm honey (#EBC06A), sage green (#8FA37E). Cozy parenting magazine aesthetic, ' +
  'gentle natural lighting, ABSOLUTELY no text anywhere, no Japanese characters, ' +
  'no signs, no menu boards, no logos, no writing of any kind. ' +
  '16:9 horizontal composition with negative space, safe and family-friendly atmosphere';

/** タイトル/短答から場面ヒントを抽出する。 */
function inferScene(title, shortAnswer) {
  const t = `${title} ${shortAnswer}`;

  // 食事系
  if (/離乳食|赤ちゃん.*食|10倍がゆ|しらす|ヨーグルト/.test(t))
    return 'a baby weaning meal with soft porridge in a small bowl, mashed vegetables, and a wooden spoon on a wooden tray';
  if (/朝食|朝ごはん|breakfast/.test(t))
    return 'a warm breakfast scene with toast, sliced fruit, a glass of milk, and a small bowl of yogurt';
  if (/お弁当|キャラ弁|弁当|bento/.test(t))
    return 'a top-down view of a Japanese bento box with rice balls, tamagoyaki, and steamed vegetables';
  if (/夕食|夕ごはん|dinner|晩ごはん/.test(t))
    return 'a cozy family dinner table with small bowls of rice, miso soup, and seasonal side dishes, warm evening light';
  if (/おやつ|スイーツ|デザート|お菓子/.test(t))
    return 'a plate of small homemade snacks: cookies, sliced fruit, and a cup of tea on a wooden table';
  if (/ランチ|昼食|外食|lunch/.test(t))
    return 'a family-friendly cafe scene with a small lunch plate, soft daylight through large windows';
  if (/野菜|フルーツ|果物/.test(t))
    return 'a wooden bowl of fresh fruits and vegetables: carrots, tomatoes, apples, oranges, soft morning light';

  // 外遊び・場所
  if (/公園|外遊び|遊具|滑り台|砂場/.test(t))
    return 'a peaceful neighborhood park with a small slide, sandbox, and cherry trees, soft afternoon light';
  if (/散歩|お散歩/.test(t))
    return 'a tree-lined walking path with a stroller, dappled sunlight, calm and serene';
  if (/水遊び|プール|川/.test(t))
    return 'a backyard kiddie pool scene with a beach ball and gentle splashes, sunny summer day';
  if (/動物園|水族館|博物館/.test(t))
    return 'a quiet animal sanctuary path with greenery and small wooden signs (no readable text), soft daylight';

  // 季節
  if (/桜|お花見|春/.test(t)) return 'cherry blossom petals falling on a quiet path with a picnic blanket below';
  if (/秋|紅葉|どんぐり/.test(t)) return 'fallen maple leaves on a stone path with a small lantern, autumn golden light';
  if (/雪|冬|スキー/.test(t)) return 'a snow-dusted Japanese garden with a stone lantern, soft winter daylight';
  if (/夏祭り|花火|お祭り/.test(t)) return 'a quiet summer evening with paper lanterns hanging above a small wooden stand';

  // 室内活動
  if (/工作|折り紙|お絵かき|塗り絵|シール|粘土/.test(t))
    return 'a craft table with origami paper, crayons, scissors, and a child apron, soft daylight from a window';
  if (/絵本|読み聞かせ|読書/.test(t))
    return 'a cozy reading nook with picture books, a soft pillow, and a small lamp, peach and beige tones';
  if (/音楽|ピアノ|リトミック|歌/.test(t))
    return 'a small upright piano with sheet music, a wooden chair, and a vase of flowers, soft daylight';
  if (/体操|ジャンプ|サーキット|室内運動/.test(t))
    return 'a play mat with soft cushions, a small balance beam, and a yoga ball in a sunny living room';
  if (/積み木|ブロック|おもちゃ|つみき/.test(t))
    return 'a child playing with wooden blocks and stuffed animals on a tatami floor, soft afternoon light';

  // ルーティン
  if (/朝の支度|起床/.test(t)) return 'a small breakfast table by a sunny window with a steaming bowl of porridge';
  if (/お風呂|入浴/.test(t)) return 'a Japanese bathroom with a wooden stool, rubber ducks, and gentle steam rising';
  if (/寝かしつけ|夜泣き|就寝|お昼寝/.test(t))
    return 'a child bedroom with a futon, picture books on a nightstand, and a soft night-light';

  // 親子コミュニケーション
  if (/しつけ|声かけ|親子|ふれあい/.test(t))
    return 'a parent and child silhouette holding hands viewed from behind in a softly lit hallway';

  // 学習
  if (/ひらがな|文字|数字|学習|ドリル|英語/.test(t))
    return 'a child desk with picture books, an open notebook with simple geometric shapes (no text), and colored pencils';

  // 場所別
  if (/カフェ|コーヒー/.test(t))
    return 'a cozy cafe terrace with a stroller parked next to a wooden table, soft daylight';
  if (/家|お家|ie-asobi|ouchi/.test(t))
    return 'a warm sunlit living room with floor cushions, a low table, and a cup of tea';

  // フォールバック
  return 'a peaceful family moment with soft natural light, cozy interior or natural setting';
}

// 全プラン読み込み
const PLANS_DIR = path.join(ROOT, 'content', 'plans');
const planFiles = fs
  .readdirSync(PLANS_DIR)
  .filter((f) => f.endsWith('.md') && !f.startsWith('_'));

const targets = [];
for (const file of planFiles) {
  const raw = fs.readFileSync(path.join(PLANS_DIR, file), 'utf8');
  const { data } = matter(raw);
  if (!data?.id || !data?.title) continue;
  if (planIdFilter && data.id !== planIdFilter) continue;
  const scene = inferScene(data.title, data.shortAnswer ?? '');
  targets.push({
    slug: data.id,
    title: data.title,
    prompt: `${scene}. Style: ${STYLE}`,
  });
}

const OUT_DIR = path.join(ROOT, 'public', 'hero-ai');
const MANIFEST_PATH = path.join(OUT_DIR, 'plan-images-manifest.json');
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
  console.log('✓ 生成対象なし（全件生成済み or フィルタで0件）。');
  process.exit(0);
}

console.log(`\n=== プラン画像 AI生成バッチ ===`);
console.log(`対象: ${filtered.length}/${targets.length}枚（全プラン: ${planFiles.length}）`);
console.log(`モデル: @cf/black-forest-labs/flux-1-schnell / steps=${steps} / 並列=${concurrency}`);
console.log(`出力: public/hero-ai/<planId>.jpg`);
console.log('\n3秒後に開始...');
await sleep(3000);

const ENDPOINT = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
let quotaExceeded = false;

async function generateOne(item, index) {
  if (quotaExceeded) return { slug: item.slug, ok: false, error: 'quota exceeded — skipping' };
  const dest = path.join(OUT_DIR, `${item.slug}.jpg`);
  const log = `[${index + 1}/${filtered.length}] ${item.slug}`;
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
      body: JSON.stringify({ prompt: item.prompt.slice(0, 2048), steps }),
    });
    if (!res.ok) {
      const text = await res.text();
      if (text.includes('used up your daily free allocation') || text.includes('code":4006')) {
        console.error(`  ⚠ ${log}  日次無料枠到達 → 残りを中断します`);
        quotaExceeded = true;
        return { slug: item.slug, ok: false, error: 'daily quota' };
      }
      console.error(`  ✗ ${log}  HTTP ${res.status}: ${text.slice(0, 200)}`);
      if (res.status === 429) await sleep(30000);
      return { slug: item.slug, ok: false, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    if (!data.success) {
      const errMsg = JSON.stringify(data.errors ?? data).slice(0, 200);
      if (errMsg.includes('daily free allocation') || errMsg.includes('4006')) {
        quotaExceeded = true;
        return { slug: item.slug, ok: false, error: 'daily quota' };
      }
      console.error(`  ✗ ${log}  ${errMsg}`);
      return { slug: item.slug, ok: false, error: 'api error' };
    }
    const b64 = data?.result?.image;
    if (!b64) return { slug: item.slug, ok: false, error: 'no image' };
    const buf = Buffer.from(b64, 'base64');
    fs.writeFileSync(dest, buf);
    console.log(`  ✓ ${log} → ${(buf.length / 1024).toFixed(0)}KB`);
    return {
      slug: item.slug,
      ok: true,
      file: `/hero-ai/${item.slug}.jpg`,
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`  ✗ ${log}  ${err.message}`);
    return { slug: item.slug, ok: false, error: err.message };
  }
}

const results = [];
let cursor = 0;
async function worker() {
  while (cursor < filtered.length && !quotaExceeded) {
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
const remaining = targets.length - filtered.length + ngCount;

console.log(`\n=== 完了 ===`);
console.log(`成功: ${okCount} / 失敗: ${ngCount} / 経過: ${(elapsedMs / 1000 / 60).toFixed(1)}分`);
console.log(`残り未生成プラン: ${remaining}本（明日以降のバッチで継続）`);
if (quotaExceeded) console.log('※ 日次無料枠到達のため途中停止しました');

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
