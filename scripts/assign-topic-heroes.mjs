#!/usr/bin/env node
/**
 * 2026-09-03: 育児Q&A/発達・商品比較クラスタのヒーロー画像を、テーマ別に既存シーン写真へ配り直す。
 *
 * 目的:
 *   1. 内容と無関係な画像の解消（例: 卵かけご飯=室内遊び場、ピーナッツ=寝室、美容院=寝室）
 *   2. 同一画像の使い回しの分散（同テーマ内で clicks/imp 降順にラウンドロビン）
 *
 * 外食・室内遊び場・水遊びは scripts/assign-new-scene-heroes.mjs の担当なので、ここでは触らない。
 * 自前画像（Blob / /photos/ / /hero/ / /img/articles/）も触らない。
 *
 * 使い方:
 *   GSC_JSON=/path/to/gsc.json node scripts/assign-topic-heroes.mjs --dry-run
 */
import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry-run');
const DIR = 'content/articles';
const S = (name, n) => Array.from({ length: n }, (_, i) => `/img/scenes/${name}-${String(i + 1).padStart(2, '0')}.webp`);
const pick = (name, ...ns) => ns.map((i) => `/img/scenes/${name}-${String(i).padStart(2, '0')}.webp`);

/** 対象クラスタ（商品比較 / 育児Q&A・発達） */
const SCOPE = [
  /ranking|hikaku|osusume|erabikata|-vs-|subsc|comparison/,
  /itsukara|itsumade|nansai/,
  /hattatsu|ikuji|nekashitsuke|toilet|shitsuke|hankou|kanshaku|yonaki|iyaiya|kotoba-okure|oshaberi/,
];
/** 外食・施設クラスタ（assign-new-scene-heroes.mjs の担当）は除外 */
const OTHER_SCRIPT = [
  /kids-menu/, /okosama/, /kodzure-koryaku/, /kodomo-ryokin/, /baby-chair/, /rinyushoku-mochikomi/,
  /koshitsu/, /chain-kodzure/, /kodzure-ranking/, /^famires-/, /^gaishoku-/, /morning-kosodate/,
  /babyroom/, /junyushitsu/, /shitsunai-asobi/, /mizuasobi/, /jabujabu/,
];

/** 上から順に評価。最初にマッチしたテーマの画像を配る。 */
const TOPICS = [
  { name: 'ファミレス比較', test: (s) => /gusto|jonathan|saize|cocos|bikkuri|denny|royal-host|joyfull/.test(s), imgs: [...pick('famires', 1, 2, 3), '/img/scenes/gaishoku-baby-01.webp'] },
  { name: '麺・ラーメン', test: (s) => /ramen|men-rui|pasta|udon|soba|noodle/.test(s), imgs: ['/img/scenes/ramen-kodomo-01.webp', ...pick('chuka', 2, 1), ...pick('meal', 19, 22)] },
  { name: 'アイス・かき氷', test: (s) => /aisu|kakigori|ice-|softcream/.test(s), imgs: ['/img/scenes/aisu-01.webp', '/img/scenes/kakigori-01.webp'] },
  { name: '卵・卵かけご飯', test: (s) => /tkg|tamago|egg/.test(s), imgs: ['/img/scenes/tkg-01.webp', ...pick('baby-food', 1)] },
  { name: 'レモン・柑橘', test: (s) => /lemon|mikan|kankitsu|orange|grapefruit|yuzu-/.test(s), imgs: ['/img/scenes/lemon-01.webp'] },
  { name: '焼肉・肉', test: (s) => /yakiniku|gyuniku|butaniku|niku-|steak/.test(s), imgs: ['/img/scenes/yakiniku-01.webp', '/img/scenes/shabushabu-01.webp', ...pick('meal', 16, 24)] },
  { name: '寿司・魚', test: (s) => /sushi|sashimi|sakana|shake|saba|ebi|kani/.test(s), imgs: [...pick('kaiten', 1, 3), ...pick('meal', 28, 31)] },
  { name: 'おやつ・甘いもの', test: (s) => /chocolate|okashi|oyatsu|sweets|ame|gum|juice|cola|donut|cake|purin/.test(s), imgs: [...pick('meal', 9, 13, 21, 34), ...pick('cooking', 3)] },
  { name: '食材・食事全般', test: (s) => /tabe|shoku|gohan|meal|tamago|tkg|gyunyu|milk|hachimitsu|nuts|peanut|lemon|mikan|budou|ichigo|tomato|yasai|fruit|natto|curry|agemono|houchou|ryouri|recipe|bento|mugicha|water-server|babyfood/.test(s), imgs: [...pick('baby-food', 1, 3, 5), ...pick('meal', 6, 10, 25, 33, 41), ...pick('cooking', 1, 2, 4), ...pick('bento', 2, 4)] },
  { name: '学習・教材・習い事', test: (s) => /kumon|gakken|kyouzai|benesse|zkai|popi|challenge|smile-zemi|dwe|eigo|chiiku|tsuushin|naraigoto|programming|shichida|hiragana|moji|study|gakushuu/.test(s), imgs: ['/img/scenes/print-gakushu-01.webp', '/img/scenes/kyouzai-01.webp', ...S('lesson', 10), ...pick('book', 2, 5)] },
  { name: '絵本・読書', test: (s) => /ehon|yomikikase|reading|book/.test(s), imgs: [...pick('book', 1, 3, 4, 6, 7)] },
  { name: '工作・折り紙・はさみ', test: (s) => /origami|kousaku|craft|hasami|nori|handprint|oekaki|nurie|seisaku|seal/.test(s), imgs: [...S('craft', 4), ...pick('toy', 2)] },
  { name: 'おもちゃ・室内遊び', test: (s) => /omocha|toy|puzzle|block|asobi|gokko/.test(s), imgs: [...S('toy', 3), ...pick('home-play', 1, 6, 9, 12, 18)] },
  { name: '画面・ゲーム・映画', test: (s) => /game|youtube|tablet|sumaho|smartphone|screen|eiga|tv-|anime|douga/.test(s), imgs: [...S('screen-time', 10)] },
  { name: '睡眠・寝かしつけ', test: (s) => /nekashitsuke|yonaki|ohirune|hitorine|hitori-de-neru|sleep|shoutou|nemuri|nenne|bedlight/.test(s), imgs: [...S('sleep', 5), ...pick('home-play', 7)] },
  { name: '生活習慣（風呂・歯みがき・身支度）', test: (s) => /hamigaki|haburashi|bath|ofuro|shampoo|hairdry|biyoin|biyouin|tsume|kigae|toilet|omutsu-hazure|jibun-de/.test(s), imgs: [...S('bath', 4), ...pick('home-play', 4, 22)] },
  { name: 'おむつ', test: (s) => /omutsu|moony|goon|pampers|merries|oshiri-fuki/.test(s), imgs: ['/img/scenes/nursingroom-02.webp', ...pick('nursery', 1, 3)] },
  { name: 'ベビーカー・抱っこ紐', test: (s) => /dakkohimo|babycar|stroller|chairseat|car-seat|baby-goods|rucksack/.test(s), imgs: ['/img/scenes/babycar-hikaku-01.webp', '/img/scenes/dakkohimo-01.webp', ...S('stroller', 7), ...S('strollerok', 3)] },
  { name: '自転車・外遊び・公園', test: (s) => /jitensha|hojorin|kickbike|park|koen|sotoasobi|mushi|dorokei|nawatobi/.test(s), imgs: [...pick('park', 2, 5, 7, 9, 11, 14), ...pick('outing-general', 3, 6)] },
  { name: '旅行・乗り物', test: (s) => /ryokou|kaigai|hikouki|shinkansen|densha|train|car-|drive|airport/.test(s), imgs: [...S('airplane', 4), ...S('train', 3), ...S('car', 3)] },
  { name: '動物園・水族館', test: (s) => /doubutsuen|zoo|suizokukan|aquarium|bokujou/.test(s), imgs: [...S('zoo', 5), ...S('aquarium', 4)] },
  { name: '病気・受診・予防接種', test: (s) => /hatsunetsu|byouki|netsu|kaze|allergy|arerugi|yobou|vaccine|sesshu|byouin|shinsatsu|kega|yakedo/.test(s), imgs: [...S('medical', 7), '/img/scenes/boshi-techou-01.webp'] },
  { name: '発達・できるようになる', test: (s) => /arukanai|ayumi|hattatsu|kotoba|oshaberi|jump|dekinai|hattatsu-shougai/.test(s), imgs: ['/img/scenes/babywalk-01.webp', ...pick('nursery', 1, 2, 3, 4), ...pick('home-play', 2, 10)] },
  { name: 'イヤイヤ・しつけ・きょうだい', test: (s) => /iyaiya|hankou|kanshaku|shitsuke|shikaru|kenka|kyoudai|chuusai|damasu|naku/.test(s), imgs: [...pick('home-play', 3, 5, 11, 14, 17, 19)] },
  { name: '園・入園・進学', test: (s) => /youchien|hoikuen|nyuuen|sotsuen|shougakkou|gakudou|juken|koritsu|shiritsu/.test(s), imgs: [...S('nursery', 4), ...pick('lesson', 2, 7)] },
  { name: 'お金・保険', test: (s) => /hoken|nisa|okane|kakeibo|gakushi|shouhi|setsuyaku/.test(s), imgs: [...S('shopping', 5)] },
  { name: '季節の過ごし方', test: (s) => /sugoshikata|natsu-|fuyu-|haru-|aki-|tsuyu|moushobi|samusa/.test(s), imgs: [...S('seasonal', 10), ...pick('park', 1, 4), ...pick('home-play', 8, 16)] },
];

const isOwn = (h) => /^https?:|^\/photos\/|^\/hero\/|^\/img\/articles\//.test(h);
const inScope = (s) => SCOPE.some((re) => re.test(s)) && !OTHER_SCRIPT.some((re) => re.test(s));

let traffic = {};
const TJ = process.env.GSC_JSON || '';
if (TJ && fs.existsSync(TJ)) {
  const g = JSON.parse(fs.readFileSync(TJ, 'utf8'));
  for (const p of g.recP || []) {
    const slug = (p.keys[0].split('/article/')[1] || '').replace(/\/$/, '');
    if (slug) traffic[slug] = p.impressions;
  }
}

function readHero(fm) {
  const m = fm.match(/^hero:[ \t]*(.*)$((?:\n[ \t]+\S.*)*)/m);
  if (!m) return null;
  const unquote = (v) => v.replace(/^["']|["']$/g, '').trim();
  const inline = unquote(m[1].trim());
  if (inline && !['>-', '>', '|', '|-'].includes(inline)) return { raw: m[0], value: inline };
  return { raw: m[0], value: unquote((m[2] || '').trim()) };
}

const targets = [];
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.md') && !x.startsWith('_'))) {
  const slug = f.replace(/\.md$/, '');
  if (!inScope(slug)) continue;
  const txt = fs.readFileSync(path.join(DIR, f), 'utf8');
  const fm = txt.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) continue;
  const hero = readHero(fm[1]);
  if (hero && isOwn(hero.value)) continue;
  const topic = TOPICS.find((t) => t.test(slug));
  if (!topic) continue;
  targets.push({ slug, file: f, topic: topic.name, imgs: topic.imgs, current: hero?.value || '(なし)', heroRaw: hero?.raw });
}

const byTopic = {};
targets.forEach((t) => (byTopic[t.topic] = byTopic[t.topic] || []).push(t));
const changes = [];
for (const list of Object.values(byTopic)) {
  list.sort((a, b) => (traffic[b.slug] || 0) - (traffic[a.slug] || 0) || a.slug.localeCompare(b.slug));
  list.forEach((t, i) => {
    const next = t.imgs[i % t.imgs.length];
    if (next !== t.current) changes.push({ ...t, next, imp: traffic[t.slug] || 0 });
  });
}

for (const c of changes) {
  if (DRY) continue;
  const p = path.join(DIR, c.file);
  let txt = fs.readFileSync(p, 'utf8');
  txt = c.heroRaw ? txt.replace(c.heroRaw, `hero: ${c.next}`) : txt.replace(/^---\n/, `---\nhero: ${c.next}\n`);
  fs.writeFileSync(p, txt);
}

const per = {};
changes.forEach((c) => (per[c.topic] = (per[c.topic] || 0) + 1));
console.log(`${DRY ? '[dry-run] ' : ''}対象 ${targets.length}本 / 変更 ${changes.length}本`);
Object.entries(per).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}本`));
console.log('\nimp上位:');
changes.sort((a, b) => b.imp - a.imp).slice(0, process.env.FULL ? 9999 : 25).forEach((c) =>
  console.log(`  ${String(c.imp).padStart(6)} ${c.slug.padEnd(38)} ${c.current.replace('/img/scenes/', '').padEnd(22)} -> ${c.next.replace('/img/scenes/', '')}`),
);
