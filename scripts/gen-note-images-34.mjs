#!/usr/bin/env node
/**
 * note記事 03・04 のアイキャッチ画像を Cloudflare Workers AI (flux-1-schnell) で生成。
 * サイト「きょうのこ」の世界観（温かみあるイラスト風・ベージュ/クレイ系）に統一。
 *
 * 出力: OUT_DIR/<name>.jpg（note推奨 1280x670 の 16:9 を sharp で整形）
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const OUT_DIR = process.env.OUT_DIR || '/tmp/note-images';
fs.mkdirSync(OUT_DIR, { recursive: true });

const STYLE =
  'Soft hand-drawn editorial illustration, warm watercolor and gouache textures, ' +
  'pastel palette: cream beige (#FBF5E8), peach (#F4DDCF), terracotta clay (#C9603E), ' +
  'warm honey (#EBC06A), sage green (#8FA37E). Cozy Japanese parenting magazine aesthetic, ' +
  'gentle natural lighting, ABSOLUTELY no text, no Japanese characters, no logos, no letters, ' +
  '16:9 horizontal composition with generous negative space, safe and warm family atmosphere';

const IMAGES = [
  {
    name: 'note-03-restaurant',
    prompt:
      'A warm cozy illustration of a family-friendly Japanese cafe interior: a parent sitting at a wooden table ' +
      'with a baby stroller parked neatly beside them, a small toddler sitting in a high chair, ' +
      'a cup of coffee and a small kids plate on the table, soft window light, calm and welcoming mood, ' +
      'the feeling of a restaurant where you can relax with a small child. Style: ' + STYLE,
  },
  {
    name: 'note-04-decide',
    prompt:
      'A warm tender illustration of a Japanese parent and a small child sitting close together on a cozy sofa, ' +
      'viewed from a gentle side angle, looking together at a closed picture book resting on the parent lap, ' +
      'soft afternoon light through a window, a calm and content mood, ' +
      'the feeling of a day that has been gently decided, uncluttered and peaceful. ' +
      'The book cover is plain with only a simple tiny sun illustration and absolutely no text or letters. Style: ' + STYLE,
  },
];

const ENDPOINT = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

const ONLY = process.env.ONLY; // optional: generate only the named image
const TARGETS = ONLY ? IMAGES.filter((i) => i.name === ONLY) : IMAGES;

for (const img of TARGETS) {
  const dest = path.join(OUT_DIR, `${img.name}.jpg`);
  if (fs.existsSync(dest)) {
    console.log(`- ${img.name}.jpg は既に存在するためスキップ`);
    continue;
  }
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiToken}` },
      body: JSON.stringify({ prompt: img.prompt.slice(0, 2048), steps: 8 }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error(`✗ ${img.name}: HTTP ${res.status} ${t.slice(0, 150)}`);
      continue;
    }
    const data = await res.json();
    const b64 = data?.result?.image;
    if (!b64) {
      console.error(`✗ ${img.name}: no image`);
      continue;
    }
    const buf = Buffer.from(b64, 'base64');
    await sharp(buf)
      .resize(1280, 670, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 88 })
      .toFile(dest);
    const kb = (fs.statSync(dest).size / 1024).toFixed(0);
    console.log(`✓ ${img.name}.jpg (${kb}KB)`);
  } catch (e) {
    console.error(`✗ ${img.name}: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 600));
}
console.log(`\n出力先: ${OUT_DIR}`);
