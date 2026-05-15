#!/usr/bin/env node
/**
 * note記事用のアイキャッチ画像を Cloudflare Workers AI (flux-1-schnell) で生成。
 * サイト「きょうのこ」の世界観（温かみあるイラスト風・ベージュ/クレイ系）に統一。
 *
 * 出力: OUT_DIR/<name>.jpg（note推奨 1280x670 相当の 16:9 を sharp で整形）
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
    name: 'note-01-launch',
    prompt:
      'A warm illustration of a Japanese parent sitting at a sunny kitchen table in the morning, ' +
      'a small child playing nearby on the floor with wooden toys, a cup of coffee and a notebook on the table, ' +
      'soft window light, calm and hopeful mood, the feeling of gently planning the day. ' +
      'Style: ' + STYLE,
  },
  {
    name: 'note-brand-a',
    prompt:
      'A warm cozy illustration of a Japanese family of three (parents and a toddler) walking together ' +
      'on a tree-lined neighborhood path on a clear day, viewed from behind at a gentle distance, ' +
      'soft afternoon light, peaceful everyday family moment. Style: ' + STYLE,
  },
  {
    name: 'note-brand-b',
    prompt:
      'A warm flat-lay illustration of a cozy parenting desk: an open notebook, a cup of tea, ' +
      'a small potted plant, picture books, and a smartphone showing a calm app screen (no readable text), ' +
      'cream and peach tones, soft daylight. Style: ' + STYLE,
  },
];

const ENDPOINT = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

for (const img of IMAGES) {
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
    // note アイキャッチ向け 1280x670 にトリミング
    const dest = path.join(OUT_DIR, `${img.name}.jpg`);
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
