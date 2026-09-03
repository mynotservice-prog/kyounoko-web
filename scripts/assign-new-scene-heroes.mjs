#!/usr/bin/env node
/**
 * 2026-09-03: 新規シーン写真（/img/scenes/ 追加50枚）を、内容が合う記事の frontmatter hero に割り当てる。
 *
 * 背景:
 *   - hero が /hero-ai/* の記事は lib/articles.ts で pickHeroForSlug() に強制置換されるため、
 *     生成済みAIイラストは1枚も表示されていない。実表示は共用シーン写真1,084本 / 実質207枚。
 *   - 外食・室内遊び場・水遊びのクラスタで「内容と無関係な画像」「同一画像の使い回し」が発生していた。
 *
 * 方針:
 *   - 自前画像（Blob URL / /photos/ / /hero/ / /img/articles/）が入っている記事は絶対に触らない。
 *   - グループ内は GSC clicks 降順で並べ、画像をラウンドロビンで配って重複を分散させる。
 *
 * 使い方:
 *   node scripts/assign-new-scene-heroes.mjs --dry-run
 *   node scripts/assign-new-scene-heroes.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry-run');
const DIR = 'content/articles';
const TRAFFIC_JSON = process.env.GSC_JSON || '';

const S = (n) => `/img/scenes/${n}.webp`;
const poolWater = [1, 4, 7, 8, 9, 12, 20].map((i) => S(`pool-water-${String(i).padStart(2, '0')}`));

/** 上から順に評価。最初にマッチしたグループの画像を配る。 */
const GROUPS = [
  // --- 設備・施設 ---
  { name: '授乳室・おむつ替え', test: (s) => /babyroom|junyushitsu|omutsu-gae-spot/.test(s),
    imgs: [S('nursingroom-01'), S('nursingroom-02'), S('strollerok-03')] },
  { name: 'ベビーチェア', test: (s) => /baby-chair/.test(s),
    imgs: [S('babychair-01'), S('babychair-03'), S('babychair-02'), S('famires-02'), S('babychair-04'), S('famires-03'), S('gaishoku-baby-01'), S('famires-01')] },
  { name: '離乳食持ち込み', test: (s) => /rinyushoku-mochikomi/.test(s),
    imgs: [S('gaishoku-baby-02'), S('gaishoku-baby-03'), S('gaishoku-baby-01')] },
  // --- 室内遊び場 ---
  { name: '室内遊び場', test: (s) => /shitsunai-asobi/.test(s),
    imgs: [S('jidoukan-01'), S('kidspark-01'), S('mallkids-01'), S('jidoukan-02'), S('kidspark-02'), S('mallkids-02'), S('mallkids-03'), S('rainymall-01')] },
  // --- 水遊び ---
  { name: '水遊び持ち物', test: (s) => /mizuasobi-mochimono|natsu-mizuasobi-mochimono|mizuasobi-omocha/.test(s),
    imgs: [S('mizuasobi-goods-01')] },
  { name: '水遊び', test: (s) => /mizuasobi|jabujabu|puuru-mizuasobi/.test(s),
    imgs: [S('jabujabu-01'), S('fountain-01'), S('jabujabu-02'), S('mist-01'), S('mizuasobi-iriguchi-01'), S('jabujabu-03'), ...poolWater] },
  // --- 外食：業態別 ---
  { name: 'カフェ/モーニング', test: (s) => /morning|cafe|coffee|starbucks|doutor|tullys|veloce|komeda|hoshino|sanmarc|misdo|baskin/.test(s),
    imgs: [S('cafemorning-01'), S('cafemorning-02'), S('cafemorning-03')] },
  { name: '回転寿司', test: (s) => /sushi|zushi|uobei|choushimaru/.test(s),
    imgs: [S('kaiten-01'), S('kaiten-03'), S('kaiten-02')] },
  { name: 'うどん・そば・丼', test: (s) => /udon|soba|marukame|marugame|hanamaru|sukesan|yamada-udon|tenya|yoshinoya|sukiya|matsuya|nakau|gyudon|yumean|yuzuan/.test(s),
    imgs: [S('selfudon-01'), S('selfudon-02'), S('selfudon-03')] },
  { name: 'ファストフード', test: (s) => /mcdonald|burger|zetteria|lotteria|freshness|kfc|kentucky|mos-/.test(s),
    imgs: [S('fastfood-01'), S('fastfood-03'), S('fastfood-02')] },
  { name: 'ラーメン・中華', test: (s) => /ramen|hidakaya|ohsho|ichiran|ringer|kourakuen|tenkaippin|bamiyan|chuka/.test(s),
    imgs: [S('chuka-02'), S('chuka-01')] },
  { name: 'カレー', test: (s) => /cocoichi|curry/.test(s),
    imgs: [S('curry-01'), S('teishoku-01')] },
  { name: '焼肉・しゃぶしゃぶ', test: (s) => /yakiniku|gyukaku|shabu|onyasai|anrakutei/.test(s),
    imgs: [S('yakiniku-01'), S('shabushabu-01'), S('zashiki-01'), S('zashiki-02')] },
  { name: '座敷・和食・居酒屋', test: (s) => /torikizoku|uotami|kagonoya|washoku-sato|ajino-mingei|bandotaro|hanaya-yohei|kushikatsu|yakitori|izakaya/.test(s),
    imgs: [S('zashiki-01'), S('zashiki-02'), S('famires-03'), S('gaishoku-baby-01')] },
  { name: '定食・弁当', test: (s) => /yayoi|ootoya|teishoku|maido-ookini|origin-bento|hottomotto|katsu|sukesan/.test(s),
    imgs: [S('teishoku-01'), S('zashiki-01'), S('curry-01'), S('zashiki-02')] },
  { name: 'ファミレス・その他外食', test: (s) => /kids-menu|okosama|kodzure-koryaku|famires|kodzure-gaishoku|steak|sawayaka/.test(s),
    imgs: [S('famires-01'), S('famires-02'), S('famires-03'), S('gaishoku-baby-01'), S('kidsspace-shop-01'), S('kidsware-01')] },
];

/**
 * 対象クラスタのゲート。ここを通った記事だけ差し替える。
 * （slug の部分一致だけだと "tsushin"→sushi, "oshaburi"→shabu のような誤爆が出るため）
 */
const GATE = [
  /kids-menu/, /okosama/, /kodzure-koryaku/, /kodomo-ryokin/, /baby-chair/, /rinyushoku-mochikomi/,
  /koshitsu/, /chain-kodzure/, /kodzure-(udon|ramen|yakiniku|shabushabu|cafe|gaishoku|famires|morning|deli)/,
  /kodzure-ranking/, /^famires-/, /^gaishoku-/, /morning-kosodate/, /morning-real/,
  /babyroom/, /junyushitsu/, /shitsunai-asobi/, /mizuasobi/, /jabujabu/,
];
/** 祭り・屋台など、店内カットが合わないものは除外 */
const EXCLUDE = [/matsuri/];
const inScope = (slug) => GATE.some((re) => re.test(slug)) && !EXCLUDE.some((re) => re.test(slug));

const isOwn = (h) => /^https?:|^\/photos\/|^\/hero\/|^\/img\/articles\//.test(h);

// GSC clicks（あれば優先度順の並べ替えに使う）
let traffic = {};
if (TRAFFIC_JSON && fs.existsSync(TRAFFIC_JSON)) {
  const g = JSON.parse(fs.readFileSync(TRAFFIC_JSON, 'utf8'));
  for (const p of g.recP || []) {
    const slug = (p.keys[0].split('/article/')[1] || '').replace(/\/$/, '');
    if (slug) traffic[slug] = p.clicks;
  }
}

/** frontmatter の hero: 行（折りたたみスカラーの継続行含む）を読む */
function readHero(fm) {
  const m = fm.match(/^hero:[ \t]*(.*)$((?:\n[ \t]+\S.*)*)/m);
  if (!m) return null;
  const unquote = (v) => v.replace(/^["']|["']$/g, '').trim();
  const inline = unquote(m[1].trim());
  if (inline && inline !== '>-' && inline !== '>' && inline !== '|' && inline !== '|-') return { raw: m[0], value: inline };
  return { raw: m[0], value: unquote((m[2] || '').trim()) };
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
const targets = [];
for (const f of files) {
  const slug = f.replace(/\.md$/, '');
  const txt = fs.readFileSync(path.join(DIR, f), 'utf8');
  const fmMatch = txt.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) continue;
  const hero = readHero(fmMatch[1]);
  if (hero && isOwn(hero.value)) continue; // 自前画像は触らない
  if (!inScope(slug)) continue;
  const group = GROUPS.find((g) => g.test(slug));
  if (!group) continue;
  targets.push({ slug, file: f, group: group.name, imgs: group.imgs, current: hero?.value || '(なし)', heroRaw: hero?.raw });
}

// グループごとに clicks 降順でラウンドロビン割当
const byGroup = {};
targets.forEach((t) => (byGroup[t.group] = byGroup[t.group] || []).push(t));
const changes = [];
for (const [name, list] of Object.entries(byGroup)) {
  list.sort((a, b) => (traffic[b.slug] || 0) - (traffic[a.slug] || 0) || a.slug.localeCompare(b.slug));
  list.forEach((t, i) => {
    const next = t.imgs[i % t.imgs.length];
    if (next !== t.current) changes.push({ ...t, next, clicks: traffic[t.slug] || 0 });
  });
}

for (const c of changes) {
  if (DRY) continue;
  const p = path.join(DIR, c.file);
  let txt = fs.readFileSync(p, 'utf8');
  if (c.heroRaw) {
    txt = txt.replace(c.heroRaw, `hero: ${c.next}`);
  } else {
    txt = txt.replace(/^---\n/, `---\nhero: ${c.next}\n`);
  }
  fs.writeFileSync(p, txt);
}

const perGroup = {};
changes.forEach((c) => (perGroup[c.group] = (perGroup[c.group] || 0) + 1));
console.log(`${DRY ? '[dry-run] ' : ''}対象 ${targets.length}本 / 変更 ${changes.length}本`);
Object.entries(perGroup).forEach(([k, v]) => console.log(`  ${k}: ${v}本`));
console.log('\nclicks上位30件:');
changes.sort((a, b) => b.clicks - a.clicks).slice(0, process.env.FULL ? 9999 : 30).forEach((c) =>
  console.log(`  ${String(c.clicks).padStart(4)} ${c.slug.padEnd(38)} ${c.current.replace('/img/scenes/', '').padEnd(24)} -> ${c.next.replace('/img/scenes/', '')}`),
);
