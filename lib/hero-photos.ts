/**
 * Plan / Article 両方で使うヒーロー画像のユニファイドライブラリ。
 *
 * 方針:
 * - Unsplash 検証済み photo ID のみ使用（404 を完全排除）
 * - 画像URL は `?auto=format&fit=crop&w=1920&h=1080&q=85` 固定でクロップ統一
 * - CSS 側で sepia(0.18) saturate(0.88) brightness(1.02) をかけ
 *   サイトのペール暖色トーンに揃える（globals.css の既存ルール）
 * - slug のキーワードからカテゴリを推定して画像を選ぶ
 */

type PhotoCat =
  | 'baby'         // 0-1歳 / 赤ちゃん
  | 'toddler-play' // 2-3歳 / おもちゃ・ブロック
  | 'kid-study'    // 4-6歳 / 学習・読書
  | 'kid-craft'    // 工作・絵・色塗り
  | 'family-dinner'// 夕食・家族食卓
  | 'home-cozy'    // 家・夜・リラックス
  | 'food-japan'   // 和食・お弁当
  | 'food-kitchen' // キッチン・調理
  | 'food-fruit'   // 果物・野菜・朝食
  | 'park'         // 公園・外遊び
  | 'nature'       // 自然・散歩
  | 'sakura'       // 桜・春
  | 'tokyo'        // 都市景観
  | 'sleeping'     // 寝かしつけ
  | 'bath'         // お風呂
  | 'kid-learn'    // 机 + 子ども学び
  | 'classroom'    // 教室
  | 'piano'        // ピアノ・音楽
  | 'stroller'     // ベビーカー・ベビー用品
  | 'outdoor-generic';

/** カテゴリ別の Unsplash photo ID プール（すべて 200 OK 検証済み） */
const POOL: Record<PhotoCat, string[]> = {
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

function photoUrl(id: string): string {
  return `${UNSPLASH_BASE}${id}${UNSPLASH_QS}`;
}

/** slug 文字列からカテゴリを推定する（優先度順に判定）。 */
function inferCategoryFromSlug(slug: string): PhotoCat {
  const s = slug.toLowerCase();

  // 行事系（季節イベント）
  if (/hanami|sakura|ohanami/.test(s)) return 'sakura';
  if (/halloween|xmas|oshougatsu|natsumatsuri|hanabi|shichigosan|hinamatsuri|tanabata|kodomonohi|setsubun/.test(s)) return 'park';

  // 食事系
  if (/asagohan|breakfast|asa-/.test(s)) return 'food-fruit';
  if (/bento|obento|kyaraben|reitou|obento/.test(s)) return 'food-japan';
  if (/rinyuushoku|離乳食/.test(s)) return 'food-japan';
  if (/yaki|cooking|reitougyoza|tsukurioki|ryouri/.test(s)) return 'food-kitchen';
  if (/gohan|taberu|shokuji|sukikira|youji-shoku|gaishoku|dinner|lunch|ranchi/.test(s)) return 'family-dinner';

  // 家・夜・ルーティン系
  if (/shoutou|nene|sleep|yonaki|oyasumi|ohirune/.test(s)) return 'sleeping';
  if (/ofuro|bath|nyuuyoku/.test(s)) return 'bath';
  if (/routine|yoru|kaeri|wanope|heijitsu|shumatsu|weekday/.test(s)) return 'home-cozy';

  // 年齢別遊び
  if (/0-1sai|akachan|baby-/.test(s)) return 'baby';
  if (/1-2sai|2-3sai/.test(s)) return 'toddler-play';
  if (/4-6sai|kumon|gakken|shichida|monte|naraigoto|chiku|piano/.test(s)) {
    if (/piano/.test(s)) return 'piano';
    if (/kumon|gakken|shichida|tsuushin|eigo/.test(s)) return 'kid-study';
    return 'classroom';
  }

  // 習い事
  if (/swimming|soccer|yakyu|taisou|sports/.test(s)) return 'classroom';
  if (/ehon|yomikikase|reading/.test(s)) return 'kid-learn';

  // 遊び
  if (/kousaku|craft|tegami|origami/.test(s)) return 'kid-craft';
  if (/asobi|chiiku|seal|omocha|youtube/.test(s)) return 'toddler-play';
  if (/iyaiya|kyoudai/.test(s)) return 'toddler-play';

  // 外出・スポット系
  if (/sakura-ohanami|ohanami/.test(s)) return 'sakura';
  if (/tokyo|doko|odekake|park|stroller-spots/.test(s)) {
    if (/tokyo/.test(s)) return 'tokyo';
    return 'park';
  }
  if (/shizen|nature|plant/.test(s)) return 'nature';
  if (/mizuasobi|puuru|pool/.test(s)) return 'park';
  if (/indoor|屋内|amenohi/.test(s)) return 'park';

  // 商品系
  if (/babycar|stroller|dakkohimo|chair|seat/.test(s)) return 'stroller';
  if (/ranking|hikaku|erabi|subsc/.test(s)) return 'home-cozy';

  // 最終フォールバック
  return 'home-cozy';
}

/**
 * slug からヒーロー画像URLを決定する。
 * 同じslugは常に同じ画像を返す（deterministic）。
 *
 * @param slug 記事 or プランのslug
 * @returns Unsplash URL
 */
export function pickHeroForSlug(slug: string): string {
  const category = inferCategoryFromSlug(slug);
  const pool = POOL[category];
  // slug を hash して deterministic にプールから1枚選ぶ
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % pool.length;
  return photoUrl(pool[idx]);
}

/** 手動で指定したカテゴリから画像を取得（agent用） */
export function pickHeroForCategory(category: PhotoCat, seed: string): string {
  const pool = POOL[category];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % pool.length;
  return photoUrl(pool[idx]);
}

export const AVAILABLE_CATEGORIES = Object.keys(POOL) as PhotoCat[];
