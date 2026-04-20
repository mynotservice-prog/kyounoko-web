#!/usr/bin/env node
/**
 * hero URL を hero-photos.ts と同期した値に一括再生成する。
 * v3: ChatGPT生成のローカル画像（/hero/*.png）を使用。
 *
 * 実行: node scripts/revert-to-unsplash.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ==== hero-photos.ts v3 と同期 ====
const POOL = {
  baby: ['/hero/baby-01.png', '/hero/baby-02.png', '/hero/baby-03.png'],
  'toddler-play': ['/hero/toddler-play-01.png', '/hero/toddler-play-02.png', '/hero/toddler-play-03.png'],
  'kid-study': ['/hero/kid-study-01.png', '/hero/kid-study-02.png', '/hero/kid-study-03.png'],
  'kid-craft': ['/hero/kid-craft-01.png', '/hero/kid-craft-02.png', '/hero/kid-craft-03.png'],
  'family-dinner': ['/hero/family-dinner-01.png', '/hero/family-dinner-02.png', '/hero/family-dinner-03.png'],
  'home-cozy': ['/hero/home-cozy-01.png', '/hero/home-cozy-02.png', '/hero/home-cozy-03.png'],
  'food-japan': ['/hero/food-japan-01.png', '/hero/food-japan-02.png', '/hero/food-japan-03.png'],
  'food-kitchen': ['/hero/food-kitchen-01.png', '/hero/food-kitchen-02.png', '/hero/food-kitchen-03.png'],
  'food-fruit': ['/hero/food-fruit-01.png', '/hero/food-fruit-02.png', '/hero/food-fruit-03.png'],
  'food-sweet': ['/hero/food-sweet-01.png', '/hero/food-sweet-02.png', '/hero/food-sweet-03.png'],
  park: ['/hero/park-01.png', '/hero/park-02.png', '/hero/park-03.png'],
  nature: ['/hero/nature-01.png', '/hero/nature-02.png', '/hero/nature-03.png'],
  autumn: ['/hero/autumn-01.png', '/hero/autumn-02.png', '/hero/autumn-03.png'],
  'winter-snow': ['/hero/winter-snow-01.png', '/hero/winter-snow-02.png', '/hero/winter-snow-03.png'],
  'summer-water': ['/hero/summer-water-01.png', '/hero/summer-water-02.png', '/hero/summer-water-03.png'],
  sakura: ['/hero/sakura-01.png', '/hero/sakura-02.png', '/hero/sakura-03.png'],
  tokyo: ['/hero/tokyo-01.png', '/hero/tokyo-02.png', '/hero/tokyo-03.png'],
  'japan-rural': ['/hero/japan-rural-01.png', '/hero/japan-rural-02.png', '/hero/japan-rural-03.png'],
  sleeping: ['/hero/sleeping-01.png', '/hero/sleeping-02.png', '/hero/sleeping-03.png'],
  bath: ['/hero/bath-01.png', '/hero/bath-02.png', '/hero/bath-03.png'],
  'kid-learn': ['/hero/kid-learn-01.png', '/hero/kid-learn-02.png', '/hero/kid-learn-03.png'],
  classroom: ['/hero/classroom-01.png', '/hero/classroom-02.png', '/hero/classroom-03.png'],
  piano: ['/hero/piano-01.png', '/hero/piano-02.png', '/hero/piano-03.png'],
  stroller: ['/hero/stroller-01.png', '/hero/stroller-03.png'],
  medical: ['/hero/medical-01.png', '/hero/medical-02.png', '/hero/medical-03.png'],
  'parent-child': ['/hero/parent-child-01.png', '/hero/parent-child-02.png', '/hero/parent-child-03.png'],
  'screen-time': ['/hero/screen-time-01.png', '/hero/screen-time-02.png', '/hero/screen-time-03.png'],
  commerce: ['/hero/commerce-01.png', '/hero/commerce-02.png', '/hero/commerce-03.png'],
  'outdoor-generic': ['/hero/park-01.png', '/hero/nature-01.png', '/hero/park-02.png'],
};

function inferCategoryFromSlug(slug) {
  const s = slug.toLowerCase();
  if (/hatsunetsu|netsu|kaze|gerizam|diarrhea|byouin|ishi-sagashi|arerugi|allergy|aleergi|yobou-sesshu|vaccine|senpuu|influenza|corona|covid/.test(s)) return 'medical';
  if (/shindansho|shinsatsu|aleergi-meal|aleergi-food|mugi-ale|ranshoku/.test(s)) return 'medical';
  if (/smartphone|sumaho|tablet|youtube-ruleset|screen-time|digital/.test(s)) return 'screen-time';
  if (/shitsuke|shikaru|oshiri|iyaiya|tantrum|kenka|chuusai|mama-tomo|oya-.*kouka|oya-ko|kodomo-suki/.test(s)) return 'parent-child';
  if (/hanashikake|komyunikeshon|kotoba-kake|shitsumon|kosodate-sutoresu/.test(s)) return 'parent-child';
  if (/hanami|sakura|ohanami/.test(s)) return 'sakura';
  if (/kouyou|momiji|autumn|aki-/.test(s)) return 'autumn';
  if (/shichigosan/.test(s)) return 'autumn';
  if (/yuki|snow|fuyu-|xmas|christmas|kurisumasu/.test(s)) return 'winter-snow';
  if (/mizuasobi|puuru|pool|suiei|natsu-|summer|moushobi|atsui|suzushii/.test(s)) return 'summer-water';
  if (/halloween|hanabi|oshougatsu|natsumatsuri|hinamatsuri|tanabata|kodomonohi|setsubun/.test(s)) return 'park';
  if (/asagohan|breakfast|asa-/.test(s)) return 'food-fruit';
  if (/bento|obento|kyaraben|reitou-shokuhin|reitougyoza/.test(s)) return 'food-japan';
  if (/rinyuushoku|youjishoku|ikji|hoshokushoku/.test(s)) return 'food-japan';
  if (/sakana|gyoyu|fish|shake|saba/.test(s)) return 'food-japan';
  if (/dessert|okashi|sweets|suitsu|oyatsu/.test(s)) return 'food-sweet';
  if (/yasai|vegetable|vegi|shokumotsu|health-food|kenko-shoku/.test(s)) return 'food-fruit';
  if (/chicken|toriniku|gyuuniku|butaniku|meat|niku-/.test(s)) return 'food-kitchen';
  if (/yaki|cooking|tsukurioki|ryouri|recipe|reshipi/.test(s)) return 'food-kitchen';
  if (/gohan|taberu|shokuji|sukikira|sukikirai|shoushoku|gaishoku|takushoku|dinner|lunch|ranchi|yuuhan/.test(s)) return 'family-dinner';
  if (/shoutou|nene|sleep|yonaki|oyasumi|ohirune|nenai|nemuri|nezuke/.test(s)) return 'sleeping';
  if (/ofuro|bath|nyuuyoku|shampoo|senzai-/.test(s)) return 'bath';
  if (/routine|yoru|kaeri|wanope|heijitsu|shumatsu|weekday|hoikuen-sougei|hoikuen-kaeri/.test(s)) return 'home-cozy';
  if (/0-1sai|akachan|baby-|yubi-syabu|hatsuzekku/.test(s)) return 'baby';
  if (/aitei-ashi|ayumi|hattatsu|hattaku|gotsugo|hatattsu|mileage.*0-6/.test(s)) return 'baby';
  if (/vegetarian|vege-meal|veji-meal/.test(s)) return 'food-fruit';
  if (/kodomo-hitori.*tabe|hitoride-tabe|hitori-shokuji/.test(s)) return 'family-dinner';
  if (/1-2sai|2-3sai/.test(s)) return 'toddler-play';
  if (/kotoba-okureru|gengo-hattatsu|speech/.test(s)) return 'kid-learn';
  if (/4-6sai|kumon|gakken|shichida|monte|naraigoto|chiku|piano/.test(s)) {
    if (/piano/.test(s)) return 'piano';
    if (/kumon|gakken|shichida|tsuushin|eigo|kyouzai|programming/.test(s)) return 'kid-study';
    return 'classroom';
  }
  if (/swimming|soccer|yakyu|taisou|sports|undoukai/.test(s)) return 'classroom';
  if (/ehon|yomikikase|reading/.test(s)) return 'kid-learn';
  if (/programming|coding|eigo-asobi|eigo-narai/.test(s)) return 'kid-study';
  if (/kousaku|craft|tegami|origami|seisaku/.test(s)) return 'kid-craft';
  if (/asobi|chiiku|seal|omocha|toys|youtube/.test(s)) return 'toddler-play';
  if (/kyoudai/.test(s)) return 'toddler-play';
  if (/tokyo/.test(s)) return 'tokyo';
  if (/osaka|kansai|kyoto|kobe/.test(s)) return 'japan-rural';
  if (/nagoya|aichi|shizuoka/.test(s)) return 'japan-rural';
  if (/hokkaido|sapporo|sendai|tohoku/.test(s)) return 'nature';
  if (/fukuoka|kyushu|okinawa|hiroshima/.test(s)) return 'japan-rural';
  if (/yokohama|kanagawa|saitama|chiba/.test(s)) return 'japan-rural';
  if (/niigata|yamanashi|nagano|gifu/.test(s)) return 'nature';
  if (/kanto|shikoku|chugoku/.test(s)) return 'nature';
  if (/doko|odekake|park|stroller-spots|spot/.test(s)) return 'park';
  if (/shizen|nature|plant|hana-|flower/.test(s)) return 'nature';
  if (/indoor|amenohi/.test(s)) return 'park';
  if (/babycar|stroller|dakkohimo|chair|seat/.test(s)) return 'stroller';
  if (/ranking|hikaku|erabi|subsc|comparison/.test(s)) return 'commerce';
  if (/anzen|safety|jiko|yobou|daibutsu|gomu-chi|kurasi-taisaku/.test(s)) return 'home-cozy';
  if (/kankaku-kabin|hattatsu-shougai/.test(s)) return 'parent-child';
  if (/youchien|hoikuen|nyuuen|sotsuen/.test(s)) return 'classroom';
  if (/motimono|junbi-list/.test(s)) return 'home-cozy';
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
  return pool[idx];
}

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

    const newLine = `hero: ${newUrl}`;
    if (lines[heroLineIdx] === newLine) {
      skipped++;
      continue;
    }

    lines[heroLineIdx] = newLine;
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
