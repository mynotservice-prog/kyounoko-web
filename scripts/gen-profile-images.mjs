#!/usr/bin/env node
/**
 * note / SNS プロフィール画像（正方形アバター）を生成。
 * 「きょうのこ」ブランドの世界観 — 温かみあるイラスト、ベージュ/クレイ系。
 * 小さく表示されても識別できる、シンプルでアイコン的な構図。
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const OUT_DIR = process.env.OUT_DIR || '/tmp/profile-images';
fs.mkdirSync(OUT_DIR, { recursive: true });

const STYLE =
  'Soft hand-drawn illustration, warm watercolor and gouache texture, ' +
  'pastel palette: cream beige (#FBF5E8), peach (#F4DDCF), terracotta clay (#C9603E), ' +
  'warm honey (#EBC06A), sage green (#8FA37E). Simple, iconic, centered composition that ' +
  'reads well at small avatar size. ABSOLUTELY no text, no letters, no Japanese characters, ' +
  'no logos. Cozy, friendly, warm parenting-brand mood. Square 1:1 composition.';

const IMAGES = [
  {
    name: 'profile-a-house-sun',
    prompt:
      'A simple cozy icon-like illustration: a small warm house with a gentle sun rising behind it, ' +
      'a tiny tree beside it, soft rounded shapes, centered, lots of cream background. Style: ' + STYLE,
  },
  {
    name: 'profile-b-parent-child',
    prompt:
      'A simple warm icon-like illustration of a parent and a small child holding hands, ' +
      'seen as soft rounded silhouettes from the front, friendly and minimal, centered, ' +
      'cream background with a soft peach circle behind them. Style: ' + STYLE,
  },
  {
    name: 'profile-c-coffee-morning',
    prompt:
      'A simple cozy icon-like illustration of a warm cup of coffee and a tiny potted plant ' +
      'on a round table, morning light, soft and minimal, centered, cream background. Style: ' + STYLE,
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
      console.error(`✗ ${img.name}: HTTP ${res.status} ${(await res.text()).slice(0, 120)}`);
      continue;
    }
    const data = await res.json();
    const b64 = data?.result?.image;
    if (!b64) {
      console.error(`✗ ${img.name}: no image`);
      continue;
    }
    const buf = Buffer.from(b64, 'base64');
    const dest = path.join(OUT_DIR, `${img.name}.jpg`);
    await sharp(buf)
      .resize(640, 640, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 90 })
      .toFile(dest);
    console.log(`✓ ${img.name}.jpg (${(fs.statSync(dest).size / 1024).toFixed(0)}KB)`);
  } catch (e) {
    console.error(`✗ ${img.name}: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 600));
}
console.log(`\n出力先: ${OUT_DIR}`);
