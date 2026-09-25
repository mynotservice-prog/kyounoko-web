/**
 * 記事本文（HTML）内の重要キーワードを関連記事への内部リンクに自動置換する。
 *
 * ## 目的
 * - 内部リンク密度UP → SEO/PageRank循環UP
 * - 読者の関連記事への回遊UP → 滞在時間UP
 * - Googleのサイト構造理解の促進
 *
 * ## 運用ルール
 * - 各キーワードは記事内で **最初の1回だけ** リンク化（spammy防止）
 * - 自分自身の記事にはリンクしない
 * - 既に `<a>` タグ内にあるキーワードはスキップ
 * - `<h1>`〜`<h3>` 見出し内はスキップ（UX配慮）
 * - コードブロック・blockquote内はスキップ
 *
 * ## キーワード → 記事のマッピング
 * 手動で厳選（自動マッチは誤リンクを招くので避ける）。
 */

type LinkRule = {
  keyword: string;       // 本文内で検出する語
  targetSlug: string;    // リンク先の記事 slug
  priority: number;      // 複数マッチ時の優先度（高いほど優先）
  /**
   * 進行中のSEO実験より後に追加したルール。
   * 凍結中の記事（docs/experiments-active.md）では発火させない——
   * 処置群だけに新しいリンクが増えると群間比較が歪むため。
   * 実験の判定が終わったらフラグを外す。
   */
  addedAfterFreeze?: true;
  /**
   * ルールを足した日（YYYY-MM-DD）。FROZEN_INBOUND_CUTOFF 以降に足したルールは、
   * FROZEN_TARGET_SLUGS（凍結slug全件）の記事では発火させない。
   * addedAfterFreeze は EXPERIMENT_FROZEN_SLUGS（一部の実験だけ）しか見ていないため。
   */
  addedAt?: string;
};

/**
 * docs/experiments-active.md の凍結記事。ここに載っている記事では
 * addedAfterFreeze のルールを注入しない（既存ルールは実験開始前から
 * 効いているのでそのまま）。判定完了後にこの集合を空にする。
 */
const EXPERIMENT_FROZEN_SLUGS = new Set([
  // 実験1（年齢修飾クエリの直答昇格）は 2026-09-02 に判定完了（不発）→凍結解除済み
  // 実験2: キッズメニュー面の修飾クエリ寄せ（判定 2026-09-16 / 2026-10-21）
  'bamiyan-kids-menu',
  'bamiyan-kodzure-koryaku',
  'bikkuri-donkey-kodzure-koryaku',
  'cocos-kids-menu',
  'saizeriya-kids-menu',
  'bikkuri-donkey-kids-menu', // 対照群
  'yayoiken-kodzure-koryaku', // 対照群
  // 実験3: 施設単位ページの閾値未満検証（判定 2026-10-05 / 2027-08-31）
  'komazawa-koen-jabujabuike',
  'mizumoto-koen-jabujabuike',
  // 実験4: 秋の収穫体験面（判定 2026-10-05 / 2026-12-01）
  'mikangari-musashimurayama-kodzure',
  'mogitori-nerima-aki-kodzure',
  'fureai-nouen-setagaya-aki-kodzure',
]);

/**
 * 凍結面へ「新しい記事から」リンクを増やさないためのガード（2026-09-25 追加・7回目の汚染の再発防止）。
 *
 * EXPERIMENT_FROZEN_SLUGS は「凍結記事の中に新ルールを注入しない」側のガードで、
 * 逆向き（新しく公開した記事の本文キーワードから凍結面へリンクが張られる＝凍結面の被リンクが増える）
 * は止めていなかった。2026-09-25 公開の料金記事等が「しゃぶ葉」「焼肉きんぐ」から
 * 実験6の処置群へ自動リンクを張り、描画層なので check-frozen.mjs にも検出されなかった。
 *
 * ここには docs/experiments-active.md の凍結slug全件（`node scripts/check-frozen.mjs --list`）を置く。
 * publishedAt が FROZEN_INBOUND_CUTOFF 以降の記事は、これらの面へ自動リンク・回遊チップを張らない。
 * 既存記事（カットオフ前の公開）の既存リンクは測定開始前から効いているので変えない。
 * 実験の判定が終わったら該当slugを外す。
 */
export const FROZEN_INBOUND_CUTOFF = '2026-09-25';
export const FROZEN_TARGET_SLUGS = new Set([
  'bamiyan-kids-menu', 'bamiyan-kodzure-koryaku', 'bamiyan-morning-kosodate', 'bigboy-morning-kosodate',
  'bikkuri-donkey-kids-menu', 'bikkuri-donkey-kodzure-koryaku', 'bikkuri-donkey-morning-kosodate',
  'cocoichi-kids-menu', 'cocos-kids-menu', 'dennys-morning-kosodate', 'fureai-nouen-setagaya-aki-kodzure',
  'gusto-kids-menu', 'gusto-morning-kosodate', 'hanamaru-udon-kodzure-koryaku', 'hoshino-morning-kosodate',
  'ichiran-kodzure-koryaku', 'komazawa-koen-jabujabuike', 'komeda-morning-kosodate',
  'mikangari-musashimurayama-kodzure', 'mizumoto-koen-jabujabuike', 'mogitori-nerima-aki-kodzure',
  'mos-burger-kids-menu', 'mos-burger-morning-kosodate', 'ootoya-morning-kosodate',
  'royalhost-morning-kosodate', 'saizeriya-kids-menu', 'shabuyou-kodzure-koryaku',
  'sukiya-morning-kosodate', 'yakiniku-king-kodzure-koryaku', 'yayoiken-kodzure-koryaku',
  'yayoiken-morning-kosodate',
]);

/** 公開日がカットオフ以降の記事から凍結面へリンクしてよいか。 */
export function mayLinkToFrozen(targetSlug: string, sourcePublishedAt?: string): boolean {
  if (!FROZEN_TARGET_SLUGS.has(targetSlug)) return true;
  if (!sourcePublishedAt) return true;
  return sourcePublishedAt.slice(0, 10) < FROZEN_INBOUND_CUTOFF;
}

const LINK_RULES: LinkRule[] = [
  // ===== 商品・アイテム系 =====
  { keyword: 'ベビーカー', targetSlug: 'babycar-ranking-2026', priority: 10 },
  { keyword: '抱っこ紐', targetSlug: 'dakkohimo-ranking-2026', priority: 10 },
  { keyword: 'ベビーチェア', targetSlug: 'baby-chair-ranking', priority: 10 },
  { keyword: 'ベビー洗剤', targetSlug: 'baby-senzai-ranking', priority: 10 },
  { keyword: '時短家電', targetSlug: 'jitanhaden-ranking-7sen', priority: 9 },
  { keyword: 'ドラム式洗濯機', targetSlug: 'jitanhaden-ranking-7sen', priority: 8 },
  { keyword: '食洗機', targetSlug: 'jitanhaden-ranking-7sen', priority: 8 },
  { keyword: '冷凍食品', targetSlug: 'reitou-shokuhin-ranking', priority: 9 },
  { keyword: '冷凍餃子', targetSlug: 'reitougyoza-plus-alpha-3pattern', priority: 8 },
  { keyword: '宅食', targetSlug: 'takushoku-service-hikaku-3sha', priority: 9 },
  { keyword: 'ミールキット', targetSlug: 'takushoku-service-hikaku-3sha', priority: 7 },

  // ===== 絵本・知育 =====
  { keyword: '絵本', targetSlug: 'ehon-yomikikase-kotsu', priority: 8 },
  { keyword: '読み聞かせ', targetSlug: 'ehon-yomikikase-kotsu', priority: 9 },
  { keyword: 'シールブック', targetSlug: 'seal-book-ranking', priority: 9 },
  { keyword: '知育玩具', targetSlug: 'chiiku-toys-2-3sai-5sen', priority: 8 },
  { keyword: '知育サブスク', targetSlug: 'chiiku-subsc-hikaku-4sha', priority: 10 },
  { keyword: 'おもちゃのサブスク', targetSlug: 'chiiku-subsc-hikaku-4sha', priority: 10 },

  // ===== 習い事 =====
  { keyword: 'スイミング', targetSlug: 'swimming-nansai-kara', priority: 10 },
  { keyword: '体操教室', targetSlug: 'taisou-kyoushitsu-2-5sai', priority: 10 },
  { keyword: 'サッカー教室', targetSlug: 'soccer-yakyu-3-6sai', priority: 10 },
  { keyword: 'ピアノ', targetSlug: 'piano-narai-before-5things', priority: 9 },
  { keyword: 'くもん', targetSlug: 'kumon-vs-gakken-hikaku', priority: 9 },
  { keyword: '公文', targetSlug: 'kumon-vs-gakken-hikaku', priority: 9 },
  { keyword: '学研', targetSlug: 'kumon-vs-gakken-hikaku', priority: 9 },
  { keyword: '英語', targetSlug: 'eigo-naraigoto-nansai-kara', priority: 8 },
  { keyword: '通信教育', targetSlug: 'tsuushin-kyouzai-hikaku', priority: 9 },
  { keyword: '習い事', targetSlug: 'youji-naraigoto-nansai-kara', priority: 7 },

  // ===== 食事・料理 =====
  { keyword: '離乳食', targetSlug: 'rinyuushoku-frozen-gekkabetsu', priority: 9 },
  { keyword: '幼児食', targetSlug: 'youjishoku-kanryouki-1week-rota', priority: 9 },
  { keyword: 'お弁当', targetSlug: 'obentou-jitan-8patterns', priority: 8 },
  { keyword: 'キャラ弁', targetSlug: 'kodomo-no-hi-kyaraben', priority: 8 },
  { keyword: '朝食', targetSlug: 'asagohan-5pun-reshipi-20', priority: 8 },
  { keyword: '作り置き', targetSlug: 'tsukurioki-5pun-recipes-10', priority: 8 },
  { keyword: '偏食', targetSlug: 'sukikirai-yasai-taisaku', priority: 9 },
  { keyword: '好き嫌い', targetSlug: 'sukikirai-yasai-taisaku', priority: 9 },
  { keyword: '野菜嫌い', targetSlug: 'yasai-tabenai-3sai-taisaku', priority: 10 },

  // ===== 生活・しつけ =====
  { keyword: 'イヤイヤ期', targetSlug: 'iyaiya-ki-taisho-2sai-7kufuu', priority: 10 },
  { keyword: '寝かしつけ', targetSlug: 'ko-ga-nenai-5kufuu', priority: 9 },
  { keyword: '夜泣き', targetSlug: 'yonaki-taisaku-0-1sai', priority: 10 },
  { keyword: 'お昼寝', targetSlug: 'ohirune-nansai-made', priority: 9 },
  { keyword: 'トイレトレーニング', targetSlug: 'toire-training-2-3sai', priority: 10 },
  { keyword: '指しゃぶり', targetSlug: 'yubi-syabu-yameru-timing-houhou', priority: 9 },

  // ===== 行事 =====
  { keyword: 'お花見', targetSlug: 'ohanami-keikaku-junbi', priority: 9 },
  { keyword: 'ハロウィン', targetSlug: 'halloween-kodzure-events-2026', priority: 9 },
  { keyword: 'クリスマス', targetSlug: 'xmas-present-nenrei-0-6', priority: 9 },
  { keyword: '七五三', targetSlug: 'shichigosan-nenrei-junbi', priority: 10 },
  { keyword: '運動会', targetSlug: 'undoukai-motimono-list', priority: 9 },

  // ===== おでかけ =====
  { keyword: '雨の日', targetSlug: 'ame-tsuzuki-2sai-ichinichi', priority: 7 },
  { keyword: '水遊び', targetSlug: 'puuru-mizuasobi-debut', priority: 8 },
  { keyword: 'じゃぶじゃぶ池', targetSlug: 'jabujabuike-mizuasobi-tokyo-30', priority: 10 },
  { keyword: '舎人公園', targetSlug: 'toneri-koen-jabujabuike', priority: 10 },
  { keyword: 'お花見スポット', targetSlug: 'sakura-ohanami-kodzure-spots', priority: 10 },

  // ===== 追加分（V2 拡張 / 主要トピック逆引き） =====================================
  // ▼ 子連れ・ランチ・外食・公園・ピクニック
  { keyword: '子連れランチ', targetSlug: 'shumatsu-ranchi-kodzure', priority: 9 },
  { keyword: '子連れ外食', targetSlug: 'gaisyoku-ko-ga-taberu', priority: 8 },
  { keyword: '外食', targetSlug: 'gaisyoku-ko-ga-taberu', priority: 6 },
  { keyword: 'ベビーカーで行ける', targetSlug: 'amenohi-stroller-spots-tokyo', priority: 9 },
  { keyword: '無料スポット', targetSlug: 'kosodate-muryou-spots-tokyo', priority: 7 },
  { keyword: '公園', targetSlug: 'tokyo-nerima-free-park-muryou', priority: 5 },
  { keyword: 'ピクニック', targetSlug: 'parkku-pikku-nikku-hitsuyou-mono-list', priority: 9 },
  { keyword: '紅葉', targetSlug: 'koyou-kanto-kodzure-20', priority: 8 },

  // ▼ 食事系（朝・夕・お弁当・幼児食）
  { keyword: '朝ごはん', targetSlug: 'asagohan-5pun-pattern-10', priority: 8 },
  { keyword: '朝食パターン', targetSlug: 'asagohan-5pun-pattern-10', priority: 9 },
  { keyword: '夕飯', targetSlug: 'yuuhan-dinner-15pun-10recipes', priority: 8 },
  { keyword: '夕食', targetSlug: 'yuuhan-dinner-15pun-10recipes', priority: 7 },
  { keyword: 'おやつ', targetSlug: 'okashi-tezukuri-oyatsu-kodomo', priority: 7 },
  { keyword: '魚料理', targetSlug: 'sakana-kodomo-tabete-kureru', priority: 8 },
  { keyword: 'チキン料理', targetSlug: 'chicken-kodomo-10pattern', priority: 7 },
  { keyword: '少食', targetSlug: '3sai-shoushoku-taisaku', priority: 8 },

  // ▼ 習い事の追加
  { keyword: 'モンテッソーリ', targetSlug: 'chiku-naraigoto-kumon-shichida-monte', priority: 9 },
  { keyword: 'プログラミング', targetSlug: 'programming-kodomo-5-7sai', priority: 9 },
  { keyword: '七田', targetSlug: 'chiku-naraigoto-kumon-shichida-monte', priority: 8 },
  { keyword: '習い事をやめたい', targetSlug: 'naraigoto-yametai-taiou', priority: 10 },

  // ▼ 絵本・知育・サブスク
  { keyword: 'おもちゃ', targetSlug: 'omocha-year-by-age', priority: 6 },
  { keyword: 'おもちゃサブスク', targetSlug: 'chiiku-subsc-hikaku-4sha', priority: 10 },
  { keyword: '子育てサブスク', targetSlug: 'kosodate-subsc-3sha-hikaku', priority: 9 },
  { keyword: '工作', targetSlug: 'kousaku-4-6sai-10pattern', priority: 7 },

  // ▼ 行事の追加
  { keyword: '夏祭り', targetSlug: 'natsumatsuri-kodzure-koryaku', priority: 9 },
  { keyword: '七夕', targetSlug: 'tanabata-kazari-sakusei', priority: 9 },
  { keyword: 'お正月', targetSlug: 'oshougatsu-kodomo-sugoshikata', priority: 9 },
  { keyword: 'クリスマスマーケット', targetSlug: 'xmas-market-kodzure', priority: 9 },
  { keyword: 'ハロウィン仮装', targetSlug: 'halloween-kasou-junbi', priority: 10 },
  { keyword: 'お宮参り', targetSlug: 'hatsuzekku-sugoshikata', priority: 8 },

  // ▼ 保育園・幼稚園・入園
  { keyword: '保育園', targetSlug: 'hoikuen-sougei-jitan', priority: 7 },
  { keyword: '保育園送迎', targetSlug: 'hoikuen-sougei-jitan', priority: 9 },
  { keyword: '幼稚園', targetSlug: 'youchien-nyuuen-junbi-list', priority: 7 },
  { keyword: '入園準備', targetSlug: 'youchien-nyuuen-junbi-list', priority: 10 },

  // ▼ 育児疲れ・ワンオペ・寝かしつけ系の補強
  { keyword: 'ワンオペ', targetSlug: 'wanope-yoru-kirinukekata', priority: 9 },
  { keyword: 'ワンオペ育児', targetSlug: 'wanope-yoru-kirinukekata', priority: 10 },
  { keyword: '夜のルーティン', targetSlug: '19ji-shoutou-routine', priority: 8 },
  { keyword: '平日夜', targetSlug: 'heijitsu-yoru-30pun-routine', priority: 8 },
  { keyword: '朝のルーティン', targetSlug: 'asa-30pun-routine', priority: 8 },

  // ▼ しつけ・対応の補強
  { keyword: '兄弟げんか', targetSlug: 'kenka-kyoudai-chuusai-houhou', priority: 9 },
  { keyword: 'きょうだい', targetSlug: 'shitanoko-junyu-uenoko-asobi', priority: 6 },
  { keyword: '言葉の遅れ', targetSlug: 'kotoba-okureru-taiou-2sai', priority: 9 },
  { keyword: 'スマホルール', targetSlug: 'kodomo-smartphone-ruleset-age-betsu', priority: 9 },

  // ▼ 通信教育・教材
  { keyword: '通信教材', targetSlug: 'tsuushin-kyouzai-hikaku', priority: 9 },

  // ▼ 健康・体調
  { keyword: '発熱', targetSlug: 'kodomo-no-kaze-hatsunetsu-taiou', priority: 8 },
  { keyword: '予防接種', targetSlug: 'yobou-sesshu-schedule-0-6sai', priority: 9 },
  { keyword: 'アレルギー', targetSlug: 'mugi-aleergi-meal-kodomo', priority: 8 },

  // ▼ 収益重点記事への導線強化（2026-06-14: 内部リンク孤立だった高単価記事へ権威を集約）
  //    長語優先のソートにより、汎用語（絵本/英語/クリスマス等）より具体語が勝つよう設計
  { keyword: '絵本サブスク', targetSlug: 'ehon-subsc-hikaku-2026', priority: 10 },
  { keyword: '絵本の定期便', targetSlug: 'ehon-subsc-hikaku-2026', priority: 10 },
  { keyword: '寝かしつけ絵本', targetSlug: 'nekashitsuke-ehon-10sen-2026', priority: 10 },
  { keyword: 'お名前シール', targetSlug: 'onamae-seal-7sha-hikaku-2026', priority: 10 },
  { keyword: '名前シール', targetSlug: 'onamae-seal-7sha-hikaku-2026', priority: 9 },
  { keyword: 'トイサブ', targetSlug: 'toysub-tettei-kaisetsu-2026', priority: 10 },
  { keyword: '英語教材', targetSlug: 'eigo-kyouzai-3brand-2-6sai', priority: 9 },
  { keyword: 'クリスマスプレゼント', targetSlug: 'christmas-present-kodomo-nenrei-betsu', priority: 10 },
  { keyword: '敬老の日', targetSlug: 'keirou-no-hi-4sai-photo-message-card', priority: 9 },
  { keyword: '出産祝い', targetSlug: 'shussan-iwai-futarime-2026', priority: 7 },

  // ▼ くら寿司クラスタ（2026-06-26: 回転レーン/衛生の差別化記事へ権威を集約）
  { keyword: '鮮度くん', targetSlug: 'kura-sushi-mawaru-eisei-kodomo', priority: 10 },
  { keyword: '抗菌寿司カバー', targetSlug: 'kura-sushi-mawaru-eisei-kodomo', priority: 10 },
  { keyword: '回転レーン', targetSlug: 'kura-sushi-mawaru-eisei-kodomo', priority: 7 },

  // ▼ 順位押上げスプリント（2026-08-27）
  //    GSC 90日で「高需要 × pos6.5以下 × 被リンク僅少」だった面に権威を回す。
  //    対象の実測は reports/rank-pushup-2026-08-27.md を参照。
  //    ※凍結記事では発火しない（addedAfterFreeze）
  { keyword: 'モーニング', targetSlug: 'kodzure-morning-cafe-10', priority: 6, addedAfterFreeze: true },
  { keyword: 'コメダ珈琲', targetSlug: 'komeda-kodzure-koryaku', priority: 8, addedAfterFreeze: true },
  { keyword: 'モスバーガー', targetSlug: 'mos-burger-kodzure-koryaku', priority: 8, addedAfterFreeze: true },
  { keyword: '一蘭', targetSlug: 'ichiran-kodzure-koryaku', priority: 9, addedAfterFreeze: true },
  { keyword: '鳥貴族', targetSlug: 'torikizoku-kids-menu', priority: 9, addedAfterFreeze: true },
  { keyword: '温泉卵', targetSlug: 'kodomo-onsen-tamago-itsukara', priority: 9, addedAfterFreeze: true },
  { keyword: '半熟卵', targetSlug: 'kodomo-onsen-tamago-itsukara', priority: 9, addedAfterFreeze: true },
  { keyword: 'しゃぶ葉', targetSlug: 'shabuyou-kodzure-koryaku', priority: 8, addedAfterFreeze: true },
  { keyword: '焼肉きんぐ', targetSlug: 'yakiniku-king-kodzure-koryaku', priority: 8, addedAfterFreeze: true },
  // ▼ エンティティ拡張（2026-09-25 新設の中堅チェーン攻略へ、本文中のチェーン名から被リンクを集める）
  //    曖昧になりうる短い語（かつや・ねぎし・からやま・五右衛門・和幸 等）は正式名だけを登録する。
  { keyword: 'ジョイフル', targetSlug: 'joyfull-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'ジョリーパスタ', targetSlug: 'jolly-pasta-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '洋麺屋五右衛門', targetSlug: 'yomenya-goemon-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'カプリチョーザ', targetSlug: 'capricciosa-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '不二家レストラン', targetSlug: 'fujiya-restaurant-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '大阪王将', targetSlug: 'osaka-ohsho-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'ぎょうざの満洲', targetSlug: 'gyoza-no-mansyu-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'スガキヤ', targetSlug: 'sugakiya-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '8番らーめん', targetSlug: 'hachiban-ramen-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '来来亭', targetSlug: 'rairaitei-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '魁力屋', targetSlug: 'kairikiya-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '一風堂', targetSlug: 'ippudo-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '焼肉ライク', targetSlug: 'yakiniku-like-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'ピエトロ', targetSlug: 'pietro-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '藍屋', targetSlug: 'aiya-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'とんかつ和幸', targetSlug: 'tonkatsu-wako-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '新宿さぼてん', targetSlug: 'shinjuku-saboten-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '伝説のすた丼屋', targetSlug: 'sutadonya-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'いきなり!ステーキ', targetSlug: 'ikinari-steak-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'いきなり！ステーキ', targetSlug: 'ikinari-steak-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'いきなりステーキ', targetSlug: 'ikinari-steak-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'やっぱりステーキ', targetSlug: 'yappari-steak-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'ステーキのどん', targetSlug: 'steak-no-don-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'フォルクス', targetSlug: 'volks-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '高倉町珈琲', targetSlug: 'takakuramachi-coffee-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '珈琲館', targetSlug: 'coffeekan-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'サブウェイ', targetSlug: 'subway-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '築地銀だこ', targetSlug: 'gindaco-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '回転寿司みさき', targetSlug: 'kaitenzushi-misaki-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '大起水産', targetSlug: 'daiki-suisan-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '平禄寿司', targetSlug: 'heiroku-sushi-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'すたみな太郎', targetSlug: 'sutamina-taro-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'ワンカルビ', targetSlug: 'one-karubi-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'かみむら牧場', targetSlug: 'kamimura-bokujo-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '熟成焼肉いちばん', targetSlug: 'jukusei-yakiniku-ichiban-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'じゅうじゅうカルビ', targetSlug: 'jujukarubi-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '串家物語', targetSlug: 'kushiya-monogatari-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'スイーツパラダイス', targetSlug: 'sweets-paradise-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'しゃぶ菜', targetSlug: 'shabusai-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'シェーキーズ', targetSlug: 'shakeys-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '牛繁', targetSlug: 'gyushige-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '道とん堀', targetSlug: 'dohtonbori-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '千房', targetSlug: 'chibo-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'ぼてぢゅう', targetSlug: 'botejyu-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '矢場とん', targetSlug: 'yabaton-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '世界の山ちゃん', targetSlug: 'sekai-no-yamachan-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '鎌倉パスタ', targetSlug: 'kamakura-pasta-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'ポポラマーマ', targetSlug: 'popolamama-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'ゴーゴーカレー', targetSlug: 'gogo-curry-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '七輪房', targetSlug: 'shichirinbo-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '焼肉の和民', targetSlug: 'yakiniku-watami-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '平城苑', targetSlug: 'heijoen-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '叙々苑', targetSlug: 'jojoen-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '濵かつ', targetSlug: 'hamakatsu-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '551蓬莱', targetSlug: '551-horai-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '紅虎餃子房', targetSlug: 'benitora-gyozabo-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '魚魚丸', targetSlug: 'totomaru-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '磯丸水産', targetSlug: 'isomaru-suisan-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '風来坊', targetSlug: 'furaibou-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'エクセルシオール', targetSlug: 'excelsior-caffe-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'プロント', targetSlug: 'pronto-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: '倉式珈琲', targetSlug: 'kurashiki-coffee-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
  { keyword: 'クリスピー・クリーム', targetSlug: 'krispy-kreme-kodzure-koryaku', priority: 8, addedAfterFreeze: true, addedAt: '2026-09-25' },
];

// 長いキーワード優先（「知育玩具」>「知育」）、priority 高い順
const SORTED_RULES = [...LINK_RULES].sort((a, b) => {
  if (a.keyword.length !== b.keyword.length) return b.keyword.length - a.keyword.length;
  return b.priority - a.priority;
});

/**
 * HTMLに内部リンクを自動注入する。
 *
 * @param html 記事本文HTML
 * @param currentSlug 現在の記事slug（自己リンク防止用）
 * @returns リンク注入後のHTML
 */
export function injectInternalLinks(
  html: string,
  currentSlug: string,
  opts: { publishedAt?: string } = {},
): string {
  let result = html;
  const usedKeywords = new Set<string>();

  const isFrozen = EXPERIMENT_FROZEN_SLUGS.has(currentSlug);

  for (const rule of SORTED_RULES) {
    if (rule.targetSlug === currentSlug) continue;
    if (usedKeywords.has(rule.keyword)) continue;
    // 実験の判定が終わるまで、凍結記事には新しいルールを足さない
    if (isFrozen && rule.addedAfterFreeze) continue;
    // 新しく公開した記事から凍結面への被リンクを増やさない
    if (!mayLinkToFrozen(rule.targetSlug, opts.publishedAt)) continue;
    // カットオフ以降に足したルールは、凍結面（全件）では発火させない
    if (FROZEN_TARGET_SLUGS.has(currentSlug) && rule.addedAt && rule.addedAt >= FROZEN_INBOUND_CUTOFF) continue;

    const escapedKeyword = escapeRegExp(rule.keyword);
    // マッチ: そのキーワードが既に<a>タグ内でない、見出し内でない、コードブロック内でない場所
    // セグメント単位の分解アプローチで実装（正規表現だけでHTMLをパースしない）
    const segmentRegex = /(<(?:a\b[^>]*?>[\s\S]*?<\/a>|h[1-6]\b[^>]*?>[\s\S]*?<\/h[1-6]>|pre\b[^>]*?>[\s\S]*?<\/pre>|code\b[^>]*?>[\s\S]*?<\/code>|blockquote\b[^>]*?>[\s\S]*?<\/blockquote>))/gi;
    const parts = result.split(segmentRegex);

    let replaced = false;
    const kwRegex = new RegExp(escapedKeyword, '');
    const processedParts = parts.map((part, idx) => {
      // 奇数index = skip zones (a/h1-6/pre/code/blockquote tags)
      if (idx % 2 === 1 || replaced) return part;
      const m = part.match(kwRegex);
      if (!m) return part;
      // 1回だけ置換
      const index = m.index ?? -1;
      if (index === -1) return part;
      const before = part.slice(0, index);
      const after = part.slice(index + rule.keyword.length);
      replaced = true;
      const link = `<a href="/article/${rule.targetSlug}" class="auto-internal-link" data-auto="1">${rule.keyword}</a>`;
      return before + link + after;
    });

    if (replaced) {
      result = processedParts.join('');
      usedKeywords.add(rule.keyword);
    }
  }

  return result;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
