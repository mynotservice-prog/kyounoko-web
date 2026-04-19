#!/usr/bin/env node
/**
 * Pollinations.ai の hero URL を Unsplash に一括置換する。
 *
 * 背景:
 * - Pollinations.ai は本番（Vercel）からもサンドボックスIPからも
 *   レート制限に引っかかり安定して配信できない
 * - Unsplash は検証済み photo ID プールで運用すれば 200 OK 安定
 *
 * 実行: node scripts/revert-to-unsplash.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ==== hero-photos.ts と同期 ====
const POOL = {
  baby: [
    '1490645935967-10de6ba17061',
    '1555252333-9f8e92e65df9',
    '1470115636492-6d2b56f9146d',
    '1526256262350-7da7584cf5eb',
  ],
  'toddler-play': [
    '1503919545889-aef636e10ad4',
    '1515169067868-5387ec356754',
    '1547425260-76bcadfb4f2c',
    '1506784983877-45594efa4cbe',
  ],
  'kid-study': [
    '1517840901100-8179e982acb7',
    '1502086223501-7ea6ecd79368',
    '1509062522246-3755977927d7',
  ],
  'kid-craft': [
    '1566004100631-35d015d6a491',
    '1504593811423-6dd665756598',
    '1547425260-76bcadfb4f2c',
  ],
  'family-dinner': [
    '1516627145497-ae6968895b74',
    '1484723091739-30a097e8f929',
    '1542435503-956c469947f6',
  ],
  'home-cozy': [
    '1542038784456-1ea8e935640e',
    '1519689680058-324335c77eba',
    '1500835556837-99ac94a94552',
    '1559839734-2b71ea197ec2',
  ],
  'food-japan': [
    '1484723091739-30a097e8f929',
    '1542435503-956c469947f6',
    '1495521821757-a1efb6729352',
  ],
  'food-kitchen': [
    '1547592180-85f173990554',
    '1497515114629-f71d768fd07c',
    '1519415943484-9fa1873496d4',
  ],
  'food-fruit': [
    '1505253468034-514d2507d914',
    '1545193544-312983719627',
    '1464746133101-a2c3f88e0dd9',
  ],
  park: [
    '1502657877623-f66bf489d236',
    '1515169067868-5387ec356754',
    '1469571486292-0ba58a3f068b',
  ],
  nature: [
    '1506744038136-46273834b3fb',
    '1445633883498-7f9922d37a3f',
    '1473187983305-f615310e7daa',
  ],
  sakura: [
    '1481487196290-c152efe083f5',
    '1478145046317-39f10e56b5e9',
  ],
  tokyo: [
    '1542840410-3092f99611a3',
    '1558980394-dbb977039a2e',
  ],
  sleeping: [
    '1522771739844-6a9f6d5f14af',
    '1470115636492-6d2b56f9146d',
  ],
  bath: [
    '1503428593586-e225b39bddfe',
    '1526256262350-7da7584cf5eb',
  ],
  'kid-learn': [
    '1517840901100-8179e982acb7',
    '1502086223501-7ea6ecd79368',
  ],
  classroom: [
    '1503676260728-1c00da094a0b',
    '1509062522246-3755977927d7',
  ],
  piano: [
    '1609220136736-443140cffec6',
  ],
  stroller: [
    '1544025162-d76694265947',
    '1555252333-9f8e92e65df9',
  ],
  'outdoor-generic': [
    '1469571486292-0ba58a3f068b',
    '1506744038136-46273834b3fb',
    '1502657877623-f66bf489d236',
  ],
};

const UNSPLASH_BASE = 'https://images.unsplash.com/photo-';
const UNSPLASH_QS = '?auto=format&fit=crop&w=1920&h=1080&q=85';

function photoUrl(id) {
  return `${UNSPLASH_BASE}${id}${UNSPLASH_QS}`;
}

function inferCategoryFromSlug(slug) {
  const s = slug.toLowerCase();

  if (/hanami|sakura|ohanami/.test(s)) return 'sakura';
  if (/halloween|xmas|oshougatsu|natsumatsuri|hanabi|shichigosan|hinamatsuri|tanabata|kodomonohi|setsubun/.test(s)) return 'park';

  if (/asagohan|breakfast|asa-/.test(s)) return 'food-fruit';
  if (/bento|obento|kyaraben|reitou/.test(s)) return 'food-japan';
  if (/rinyuushoku/.test(s)) return 'food-japan';
  if (/yaki|cooking|reitougyoza|tsukurioki|ryouri/.test(s)) return 'food-kitchen';
  if (/gohan|taberu|shokuji|sukikira|youji-shoku|gaishoku|dinner|lunch|ranchi/.test(s)) return 'family-dinner';

  if (/shoutou|nene|sleep|yonaki|oyasumi|ohirune/.test(s)) return 'sleeping';
  if (/ofuro|bath|nyuuyoku/.test(s)) return 'bath';
  if (/routine|yoru|kaeri|wanope|heijitsu|shumatsu|weekday/.test(s)) return 'home-cozy';

  if (/0-1sai|akachan|baby-/.test(s)) return 'baby';
  if (/1-2sai|2-3sai/.test(s)) return 'toddler-play';
  if (/4-6sai|kumon|gakken|shichida|monte|naraigoto|chiku|piano/.test(s)) {
    if (/piano/.test(s)) return 'piano';
    if (/kumon|gakken|shichida|tsuushin|eigo/.test(s)) return 'kid-study';
    return 'classroom';
  }

  if (/swimming|soccer|yakyu|taisou|sports/.test(s)) return 'classroom';
  if (/ehon|yomikikase|reading/.test(s)) return 'kid-learn';

  if (/kousaku|craft|tegami|origami/.test(s)) return 'kid-craft';
  if (/asobi|chiiku|seal|omocha|youtube/.test(s)) return 'toddler-play';
  if (/iyaiya|kyoudai/.test(s)) return 'toddler-play';

  if (/sakura-ohanami|ohanami/.test(s)) return 'sakura';
  if (/tokyo|doko|odekake|park|stroller-spots/.test(s)) {
    if (/tokyo/.test(s)) return 'tokyo';
    return 'park';
  }
  if (/shizen|nature|plant/.test(s)) return 'nature';
  if (/mizuasobi|puuru|pool/.test(s)) return 'park';
  if (/indoor|amenohi/.test(s)) return 'park';

  if (/babycar|stroller|dakkohimo|chair|seat/.test(s)) return 'stroller';
  if (/ranking|hikaku|erabi|subsc/.test(s)) return 'home-cozy';

  return 'home-cozy';
}

function pickHeroForSlug(slug) {
  const category = inferCategoryFromSlug(slug);
  const pool = POOL[category];
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % pool.length;
  return photoUrl(pool[idx]);
}

// ==== main ====
function processDir(dirRel) {
  const dir = path.join(ROOT, dirRel);
  if (!fs.existsSync(dir)) return { changed: 0, skipped: 0 };
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  let changed = 0;
  let skipped = 0;

  for (const file of files) {
    const full = path.join(dir, file);
    const slug = file.replace(/\.md$/, '');
    const newUrl = pickHeroForSlug(slug);

    const content = fs.readFileSync(full, 'utf8');
    // hero: 行を全部置き換える。多行 pollinations URL（長いプロンプト付）もカバー。
    // frontmatter は --- で囲まれている想定。hero: から次のキー（title, description, etc.） or --- までを1行で置換。
    const lines = content.split('\n');
    let inFrontmatter = false;
    let fmEndCount = 0;
    let heroLineIdx = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        fmEndCount++;
        if (fmEndCount === 1) inFrontmatter = true;
        else if (fmEndCount === 2) break;
        continue;
      }
      if (inFrontmatter && /^hero:\s*/.test(lines[i])) {
        heroLineIdx = i;
        break;
      }
    }

    if (heroLineIdx === -1) {
      skipped++;
      continue;
    }

    // hero 行の旧内容を確認：pollinations なら置換
    const old = lines[heroLineIdx];
    if (!old.includes('pollinations') && !old.includes('pollinations.ajo')) {
      // 既に Unsplash などになっているならスキップ
      skipped++;
      continue;
    }

    lines[heroLineIdx] = `hero: ${newUrl}`;
    fs.writeFileSync(full, lines.join('\n'), 'utf8');
    changed++;
  }

  return { changed, skipped };
}

const articles = processDir('content/articles');
const plans = processDir('content/plans');

console.log(`articles: changed ${articles.changed}, skipped ${articles.skipped}`);
console.log(`plans:    changed ${plans.changed}, skipped ${plans.skipped}`);
console.log(`TOTAL:    ${articles.changed + plans.changed} files updated`);
