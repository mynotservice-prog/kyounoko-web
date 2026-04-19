#!/usr/bin/env node
/**
 * hero URL を Unsplash（カテゴリ別プール）に一括再生成する。
 * lib/hero-photos.ts と同期を保つこと。v2: 28カテゴリ対応。
 *
 * 実行: node scripts/revert-to-unsplash.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ==== hero-photos.ts v2 と同期 ====
const POOL = {
  baby: ['1490645935967-10de6ba17061', '1555252333-9f8e92e65df9', '1470115636492-6d2b56f9146d', '1526256262350-7da7584cf5eb'],
  'toddler-play': ['1503919545889-aef636e10ad4', '1515169067868-5387ec356754', '1547425260-76bcadfb4f2c', '1506784983877-45594efa4cbe'],
  'kid-study': ['1517840901100-8179e982acb7', '1502086223501-7ea6ecd79368', '1509062522246-3755977927d7', '1596464716127-f2a82984de30'],
  'kid-craft': ['1566004100631-35d015d6a491', '1504593811423-6dd665756598', '1547425260-76bcadfb4f2c'],
  'family-dinner': ['1516627145497-ae6968895b74', '1484723091739-30a097e8f929', '1542435503-956c469947f6'],
  'home-cozy': ['1542038784456-1ea8e935640e', '1519689680058-324335c77eba', '1500835556837-99ac94a94552', '1559839734-2b71ea197ec2'],
  'food-japan': ['1484723091739-30a097e8f929', '1542435503-956c469947f6', '1495521821757-a1efb6729352'],
  'food-kitchen': ['1547592180-85f173990554', '1497515114629-f71d768fd07c', '1519415943484-9fa1873496d4'],
  'food-fruit': ['1505253468034-514d2507d914', '1545193544-312983719627', '1464746133101-a2c3f88e0dd9', '1498837167922-ddd27525d352', '1512621776951-a57141f2eefd', '1546069901-ba9599a7e63c'],
  'food-sweet': ['1505253468034-514d2507d914', '1497515114629-f71d768fd07c', '1519415943484-9fa1873496d4'],
  park: ['1502657877623-f66bf489d236', '1515169067868-5387ec356754', '1469571486292-0ba58a3f068b'],
  nature: ['1506744038136-46273834b3fb', '1445633883498-7f9922d37a3f', '1473187983305-f615310e7daa', '1476041800959-2f6bb412c8ce', '1526481280693-3bfa7568e0f3'],
  autumn: ['1507371341162-763b5e419408', '1476041800959-2f6bb412c8ce'],
  'winter-snow': ['1418985991508-e47386d96a71', '1491002052546-bf38f186af56'],
  'summer-water': ['1506744038136-46273834b3fb', '1469571486292-0ba58a3f068b', '1502657877623-f66bf489d236'],
  sakura: ['1481487196290-c152efe083f5', '1478145046317-39f10e56b5e9'],
  tokyo: ['1542840410-3092f99611a3', '1558980394-dbb977039a2e', '1540959733332-eab4deabeeaf'],
  'japan-rural': ['1528360983277-13d401cdc186', '1526481280693-3bfa7568e0f3', '1476041800959-2f6bb412c8ce'],
  sleeping: ['1522771739844-6a9f6d5f14af', '1470115636492-6d2b56f9146d'],
  bath: ['1503428593586-e225b39bddfe', '1526256262350-7da7584cf5eb'],
  'kid-learn': ['1517840901100-8179e982acb7', '1502086223501-7ea6ecd79368', '1596464716127-f2a82984de30'],
  classroom: ['1503676260728-1c00da094a0b', '1509062522246-3755977927d7'],
  piano: ['1609220136736-443140cffec6'],
  stroller: ['1544025162-d76694265947', '1555252333-9f8e92e65df9'],
  medical: ['1588776814546-1ffcf47267a5', '1631217868264-e5b90bb7e133'],
  'parent-child': ['1577896851231-70ef18881754', '1519689680058-324335c77eba', '1500835556837-99ac94a94552'],
  'screen-time': ['1555529669-e69e7aa0ba9a', '1556742049-0cfed4f6a45d'],
  commerce: ['1586105251261-72a756497a11', '1555529669-e69e7aa0ba9a', '1556742049-0cfed4f6a45d'],
  'outdoor-generic': ['1469571486292-0ba58a3f068b', '1506744038136-46273834b3fb', '1502657877623-f66bf489d236'],
};

const UNSPLASH_BASE = 'https://images.unsplash.com/photo-';
const UNSPLASH_QS = '?auto=format&fit=crop&w=1920&h=1080&q=85';
const photoUrl = (id) => `${UNSPLASH_BASE}${id}${UNSPLASH_QS}`;

function inferCategoryFromSlug(slug) {
  const s = slug.toLowerCase();

  // 医療
  if (/hatsunetsu|netsu|kaze|gerizam|diarrhea|byouin|ishi-sagashi|arerugi|allergy|aleergi|yobou-sesshu|vaccine|senpuu|influenza|corona|covid/.test(s)) return 'medical';
  if (/shindansho|shinsatsu|aleergi-meal|aleergi-food|mugi-ale|ranshoku/.test(s)) return 'medical';

  // スクリーンタイム
  if (/smartphone|sumaho|tablet|youtube-ruleset|screen-time|digital/.test(s)) return 'screen-time';

  // 親子・しつけ
  if (/shitsuke|shikaru|oshiri|iyaiya|tantrum|kenka|chuusai|mama-tomo|oya-.*kouka|oya-ko|kodomo-suki/.test(s)) return 'parent-child';
  if (/hanashikake|komyunikeshon|kotoba-kake|shitsumon|kosodate-sutoresu/.test(s)) return 'parent-child';

  // 季節イベント
  if (/hanami|sakura|ohanami/.test(s)) return 'sakura';
  if (/kouyou|momiji|autumn|aki-/.test(s)) return 'autumn';
  if (/shichigosan/.test(s)) return 'autumn';
  if (/yuki|snow|fuyu-|xmas|christmas|kurisumasu/.test(s)) return 'winter-snow';
  if (/mizuasobi|puuru|pool|suiei|natsu-|summer|moushobi|atsui|suzushii/.test(s)) return 'summer-water';
  if (/halloween|hanabi|oshougatsu|natsumatsuri|hinamatsuri|tanabata|kodomonohi|setsubun/.test(s)) return 'park';

  // 食事
  if (/asagohan|breakfast|asa-/.test(s)) return 'food-fruit';
  if (/bento|obento|kyaraben|reitou-shokuhin|reitougyoza/.test(s)) return 'food-japan';
  if (/rinyuushoku|youjishoku|ikji|hoshokushoku/.test(s)) return 'food-japan';
  if (/sakana|gyoyu|fish|shake|saba/.test(s)) return 'food-japan';
  if (/dessert|okashi|sweets|suitsu|oyatsu/.test(s)) return 'food-sweet';
  if (/yasai|vegetable|vegi|shokumotsu|health-food|kenko-shoku/.test(s)) return 'food-fruit';
  if (/chicken|toriniku|gyuuniku|butaniku|meat|niku-/.test(s)) return 'food-kitchen';
  if (/yaki|cooking|tsukurioki|ryouri|recipe|reshipi/.test(s)) return 'food-kitchen';
  if (/gohan|taberu|shokuji|sukikira|sukikirai|shoushoku|gaishoku|takushoku|dinner|lunch|ranchi|yuuhan/.test(s)) return 'family-dinner';

  // ルーティン
  if (/shoutou|nene|sleep|yonaki|oyasumi|ohirune|nenai|nemuri|nezuke/.test(s)) return 'sleeping';
  if (/ofuro|bath|nyuuyoku|shampoo|senzai-/.test(s)) return 'bath';
  if (/routine|yoru|kaeri|wanope|heijitsu|shumatsu|weekday|hoikuen-sougei|hoikuen-kaeri/.test(s)) return 'home-cozy';

  // 年齢別
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

  // 習い事
  if (/swimming|soccer|yakyu|taisou|sports|undoukai/.test(s)) return 'classroom';
  if (/ehon|yomikikase|reading/.test(s)) return 'kid-learn';
  if (/programming|coding|eigo-asobi|eigo-narai/.test(s)) return 'kid-study';

  // 遊び
  if (/kousaku|craft|tegami|origami|seisaku/.test(s)) return 'kid-craft';
  if (/asobi|chiiku|seal|omocha|toys|youtube/.test(s)) return 'toddler-play';
  if (/kyoudai/.test(s)) return 'toddler-play';

  // 地方
  if (/tokyo/.test(s)) return 'tokyo';
  if (/osaka|kansai|kyoto|kobe/.test(s)) return 'japan-rural';
  if (/nagoya|aichi|shizuoka/.test(s)) return 'japan-rural';
  if (/hokkaido|sapporo|sendai|tohoku/.test(s)) return 'nature';
  if (/fukuoka|kyushu|okinawa|hiroshima/.test(s)) return 'japan-rural';
  if (/yokohama|kanagawa|saitama|chiba/.test(s)) return 'japan-rural';
  if (/niigata|yamanashi|nagano|gifu/.test(s)) return 'nature';
  if (/kanto|shikoku|chugoku/.test(s)) return 'nature';

  // 自然・公園
  if (/doko|odekake|park|stroller-spots|spot/.test(s)) return 'park';
  if (/shizen|nature|plant|hana-|flower/.test(s)) return 'nature';
  if (/indoor|amenohi/.test(s)) return 'park';

  // 商品
  if (/babycar|stroller|dakkohimo|chair|seat/.test(s)) return 'stroller';
  if (/ranking|hikaku|erabi|subsc|comparison/.test(s)) return 'commerce';

  // 安全
  if (/anzen|safety|jiko|yobou|daibutsu|gomu-chi|kurasi-taisaku/.test(s)) return 'home-cozy';
  if (/kankaku-kabin|hattatsu-shougai/.test(s)) return 'parent-child';

  // 入園
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

    const oldLine = lines[heroLineIdx];
    const newLine = `hero: ${newUrl}`;
    if (oldLine === newLine) {
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
