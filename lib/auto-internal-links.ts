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
};

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
  { keyword: '知育', targetSlug: 'chiiku-asobi-ie-de-10', priority: 7 },
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
  { keyword: '雨の日', targetSlug: 'amenohi-ie-asobi-2-3sai', priority: 7 },
  { keyword: '水遊び', targetSlug: 'puuru-mizuasobi-debut', priority: 8 },
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
  { keyword: '紅葉', targetSlug: 'kouyou-spots-kanto-koduzure', priority: 8 },

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
  { keyword: 'モンテッソーリ', targetSlug: 'monte-asobi-nenrei-betsu', priority: 9 },
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
  { keyword: 'きょうだい', targetSlug: 'kyoudai-asobi-nenrei-sa', priority: 6 },
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
export function injectInternalLinks(html: string, currentSlug: string): string {
  let result = html;
  const usedKeywords = new Set<string>();

  for (const rule of SORTED_RULES) {
    if (rule.targetSlug === currentSlug) continue;
    if (usedKeywords.has(rule.keyword)) continue;

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
