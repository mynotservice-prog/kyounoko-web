/**
 * Plan / Article 両方で使うヒーロー画像のユニファイドライブラリ。
 *
 * v4: Cloudflare Workers AI (flux-1-schnell) でカテゴリ別の温かみあるイラストに移行（2026年5月）。
 *     - 全28カテゴリ×3枚 = 84枚を /public/hero-ai/cat-<category>-NN.jpg に配置
 *     - 記事側hero-ai統一(/hero-ai/<slug>.jpg)と世界観を完全に揃える
 *     - 旧 /hero/<category>-NN.webp は legacy として残すが本ライブラリからは不参照
 *
 * v3（旧）: ChatGPT (DALL-E 3) 生成 → /public/hero/*.png/webp
 */

type PhotoCat =
  | 'baby'            // 0-1歳 / 赤ちゃん
  | 'toddler-play'    // 2-3歳 / おもちゃ・ブロック
  | 'kid-study'       // 4-6歳 / 学習・読書
  | 'kid-craft'       // 工作・絵・色塗り
  | 'family-dinner'   // 夕食・家族食卓
  | 'home-cozy'       // 家・夜・リラックス
  | 'food-japan'      // 和食・お弁当・魚
  | 'food-kitchen'    // キッチン・調理
  | 'food-fruit'      // 果物・野菜・朝食・健康食
  | 'food-sweet'      // デザート・おやつ
  | 'park'            // 公園・外遊び
  | 'nature'          // 自然・散歩
  | 'autumn'          // 秋・紅葉
  | 'winter-snow'     // 冬・雪遊び
  | 'summer-water'    // 夏・水遊び・プール
  | 'sakura'          // 桜・春
  | 'tokyo'           // 都市景観・ネオン
  | 'japan-rural'     // 地方都市・田園風景
  | 'sleeping'        // 寝かしつけ
  | 'bath'            // お風呂
  | 'kid-learn'       // 読書・机・学び
  | 'classroom'       // 教室・運動
  | 'piano'           // ピアノ・音楽
  | 'stroller'        // ベビーカー・ベビー用品
  | 'medical'         // 病院・薬・発熱
  | 'parent-child'    // 親子の対話・しつけ
  | 'screen-time'     // スマホ・タブレット・デジタル
  | 'commerce'        // 買い物・ランキング・比較
  | 'outdoor-generic';

/** カテゴリ別のローカル画像プール（/public/hero-ai/ 配下、AI生成イラスト統一） */
/** /img/scenes/<scene>-NN.webp の連番リスト（2026-06 新シーン画像。プール増量用） */
function scenes(scene: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) => `/img/scenes/${scene}-${String(i + 1).padStart(2, '0')}.webp`,
  );
}

/**
 * v6（2026-06-13）: 完全実写化。/hero-ai/cat-* イラストを全カテゴリから除去し、
 * 利用可能シーン写真のみで構成。シーン直接マッチが薄い bath/medical/piano/screen-time 等は
 * 近接シーン（home-play 等）で代用。重複は許容方針。
 *
 * 追加生成すべき不足シーン（撮影/生成依頼用）:
 *   - bath: 0枚 → home-play 流用中
 *   - medical: 0枚 → home-play 流用中（病院/発熱の親子）
 *   - piano/classroom: 0枚 → home-play 流用中（音楽教室・習い事）
 *   - screen-time: 0枚 → home-play 流用中（タブレット視聴）
 *   - seasonal: 4枚のみ → クリスマス/節分/ハロウィン/七五三 追加希望
 *   - shopping: 2枚のみ → スーパー/モール 追加希望
 *   - sleep: 3枚のみ → 寝かしつけ 追加希望
 */
/**
 * 2026-06-13: 追加51枚で新シーン 5種（lesson / craft / screen-time / bath / medical）が増え、
 * 既存シーンも増量（seasonal 4→10, bento 2→5, shopping 2→5, sleep 3→5, book 6→7, meal 40→41）。
 * これに合わせて POOL を最適化、流用元を本物に置き換え。
 */
const POOL: Record<PhotoCat, string[]> = {
  baby: [...scenes('baby-food', 5), ...scenes('nursery', 4), ...scenes('home-play', 5), ...scenes('bath', 4)],
  'toddler-play': [...scenes('toy', 3), ...scenes('home-play', 25), ...scenes('craft', 4)],
  'kid-study': [...scenes('book', 7), ...scenes('home-play', 8), ...scenes('lesson', 5)],
  'kid-craft': [...scenes('craft', 4), ...scenes('home-play', 12), ...scenes('toy', 3)],
  'family-dinner': [...scenes('meal', 41)],
  'home-cozy': [...scenes('home-play', 25), ...scenes('indoor-play', 6), ...scenes('meal', 12), ...scenes('sleep', 5)],
  'food-japan': [...scenes('bento', 5), ...scenes('meal', 30), ...scenes('cooking', 4)],
  'food-kitchen': [...scenes('cooking', 4), ...scenes('meal', 20)],
  'food-fruit': [...scenes('meal', 25), ...scenes('baby-food', 5)],
  'food-sweet': [...scenes('meal', 15), ...scenes('cooking', 4)],
  park: [...scenes('park', 16), ...scenes('outing-general', 8)],
  nature: [...scenes('park', 14), ...scenes('outing-general', 14), ...scenes('camp', 3)],
  autumn: [...scenes('seasonal', 10), ...scenes('park', 12), ...scenes('outing-general', 10)],
  'winter-snow': [...scenes('seasonal', 10), ...scenes('outing-general', 8), ...scenes('home-play', 6)],
  'summer-water': [...scenes('pool-water', 20)],
  sakura: [...scenes('seasonal', 10), ...scenes('park', 14)],
  tokyo: [...scenes('outing-general', 12), ...scenes('shopping', 5), ...scenes('park', 6)],
  'japan-rural': [...scenes('outing-general', 14), ...scenes('park', 10), ...scenes('camp', 3)],
  sleeping: [...scenes('sleep', 5), ...scenes('home-play', 6)],
  bath: [...scenes('bath', 4), ...scenes('home-play', 6)],
  'kid-learn': [...scenes('book', 7), ...scenes('home-play', 8), ...scenes('lesson', 4)],
  classroom: [...scenes('lesson', 10), ...scenes('nursery', 4), ...scenes('indoor-play', 6)],
  piano: [...scenes('lesson', 10), ...scenes('home-play', 6)],
  stroller: [...scenes('stroller', 7), ...scenes('outing-general', 8)],
  medical: [...scenes('medical', 7), ...scenes('home-play', 8)],
  'parent-child': [...scenes('home-play', 18), ...scenes('meal', 8), ...scenes('craft', 4)],
  'screen-time': [...scenes('screen-time', 10), ...scenes('home-play', 4)],
  commerce: [...scenes('shopping', 5), ...scenes('stroller', 4), ...scenes('home-play', 6)],
  'outdoor-generic': [...scenes('outing-general', 16), ...scenes('park', 12)],
};

/**
 * 画像URLを返す。
 * - /hero-ai/*.jpg はそのまま返す（AI生成イラスト、v4以降）
 * - /hero/*.png は .webp に自動置換（v3以前のlegacyフォールバック用）
 */
function photoUrl(path: string): string {
  if (path.startsWith('/hero-ai/')) return path;
  return path.replace(/\.png$/, '.webp');
}

/** slug 文字列からカテゴリを推定する（優先度順に判定）。 */
function inferCategoryFromSlug(slug: string): PhotoCat {
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

/**
 * 日本語タイトル / 本文込みでカテゴリ推定する強化版。
 * inferCategoryFromSlug は slug（英字スラグ）前提なので、日本語の plan title /
 * shortAnswer を渡してもマッチが弱い。これを補うため、日本語キーワードを直接見る
 * 別レイヤーを追加。slug 推定で 'home-cozy'（汎用フォールバック）になった場合のみ
 * 日本語キーワードで上書きする。
 */
function inferCategoryFromText(text: string): PhotoCat {
  const fromSlug = inferCategoryFromSlug(text);
  if (fromSlug !== 'home-cozy') return fromSlug;

  const t = text;
  // 食事系（既存hero設定を優先するためplan側でガード予定だが、念のため）
  if (/朝ごはん|朝食/.test(t)) return 'food-fruit';
  if (/お弁当|キャラ弁|弁当/.test(t)) return 'food-japan';
  if (/おやつ|デザート|お菓子|スイーツ/.test(t)) return 'food-sweet';
  if (/夕食|夕ごはん|晩ごはん|ディナー/.test(t)) return 'family-dinner';
  if (/離乳食|幼児食|赤ちゃん.*食/.test(t)) return 'food-japan';
  if (/野菜|果物|フルーツ/.test(t)) return 'food-fruit';
  if (/魚|肉|料理|レシピ|調理|キッチン/.test(t)) return 'food-kitchen';

  // 工作・お絵かき
  if (/工作|折り紙|お絵かき|絵を描|塗り絵|ぬりえ|シール|シール遊び|粘土|貼り絵/.test(t)) return 'kid-craft';

  // 絵本・読書
  if (/絵本|読み聞かせ|読書/.test(t)) return 'kid-learn';

  // 音楽
  if (/音楽|ピアノ|リトミック|歌|楽器|ダンス/.test(t)) return 'piano';

  // 学習・知育
  if (/知育|文字|ひらがな|数字|英語|学習|ドリル/.test(t)) return 'kid-study';

  // 室内運動
  if (/体操|ジャンプ|跳ぶ|走る|サーキット|室内運動|身体|運動遊び/.test(t)) return 'classroom';

  // お風呂
  if (/お風呂|シャワー|入浴/.test(t)) return 'bath';

  // 水遊び・夏
  if (/水遊び|プール|プール開き|ホース|びしょ濡れ/.test(t)) return 'summer-water';

  // 自然・公園
  if (/公園|外遊び|遊具|滑り台|砂場/.test(t)) return 'park';
  if (/散歩|お散歩|自然|花|植物|虫取り/.test(t)) return 'nature';

  // 季節
  if (/秋|紅葉|どんぐり|落ち葉|松ぼっくり/.test(t)) return 'autumn';
  if (/雪|冬|スキー|そり/.test(t)) return 'winter-snow';
  if (/桜|お花見|春/.test(t)) return 'sakura';

  // 寝かしつけ
  if (/夜泣き|寝かしつけ|お昼寝|睡眠|寝ない/.test(t)) return 'sleeping';

  // 医療
  if (/熱|発熱|風邪|病気|薬|アレルギー/.test(t)) return 'medical';

  // しつけ
  if (/イヤイヤ|しつけ|声かけ|叱る|きょうだい|ケンカ|喧嘩|友達/.test(t)) return 'parent-child';

  // 商品
  if (/ベビーカー|抱っこ紐|チャイルドシート|ベビー用品/.test(t)) return 'stroller';
  if (/ランキング|比較|選び方|おすすめ.*選/.test(t)) return 'commerce';

  // 室内遊び（汎用）
  if (/紙コップ|風船|積み木|ブロック|お絵かき|手遊び|室内|秘密基地|テント|お店屋さん|ごっこ遊び/.test(t)) return 'toddler-play';

  // 0-1歳系
  if (/赤ちゃん|0歳|1歳/.test(t)) return 'baby';

  // 2-6歳系
  if (/2歳|3歳|4歳|5歳|6歳/.test(t)) return 'toddler-play';

  // 親子コミュニケーション
  if (/家族|親子|ふれあい|スキンシップ/.test(t)) return 'parent-child';

  return fromSlug; // home-cozy のまま
}

/**
 * テキスト（タイトル+本文）からヒーロー画像URLを決定する。
 * plan/article のタイトル+短答を渡せば、内容に合った画像を deterministic に返す。
 */
export function pickHeroForText(text: string, seed?: string): string {
  const category = inferCategoryFromText(text);
  const pool = POOL[category];
  const seedStr = seed ?? text;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % pool.length;
  return photoUrl(pool[idx]);
}

/**
 * slug からヒーロー画像URLを決定する。
 * 同じslugは常に同じ画像を返す（deterministic）。
 */
export function pickHeroForSlug(slug: string): string {
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
