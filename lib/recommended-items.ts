/**
 * シーン × 年齢 × 場所別「あったら便利な持ち物」マスタ
 *
 * 目的:
 *   /spot/[slug] の詳細ページに「持っていくと便利」セクションを動的挿入し、
 *   既存445件のスポット記事に一気にA8/もしも導線を確立する。
 *
 * 使い方:
 *   import { getRecommendedItems } from '@/lib/recommended-items';
 *   const items = getRecommendedItems(spot.category, spot.place, spot.ages);
 *
 * 設計:
 *   - 場所(category) × 環境(place: indoor/outdoor) × 年齢(0-1/2-3/4-6) でマッチング
 *   - 各アイテムは「楽天検索URL」を持ち、本文HTML変換時に自動でもしも経由wrapされる
 *   - 5〜7点に絞って情報過多を防ぐ
 */

import type { SpotCategory, SpotPlace, AgeTag } from './spots';

export type RecommendedItem = {
  /** アイテム名（CTAテキスト） */
  label: string;
  /** 簡潔な理由（1〜2行） */
  why: string;
  /** 楽天検索URL（自動でもしも経由wrap） */
  url: string;
  /** どの場所カテゴリで出すか */
  categories: SpotCategory[];
  /** indoor/outdoor の絞り込み（省略時は全て） */
  places?: SpotPlace[];
  /** 対象年齢（省略時は全年齢） */
  ages?: AgeTag[];
  /** 優先順位（数字大きいほど上位表示） */
  priority: number;
};

const RAKUTEN = (q: string) => `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(q)}/`;

/** 全てのアイテム候補。getRecommendedItems で絞り込み */
export const ALL_ITEMS: RecommendedItem[] = [
  // ===== 屋外定番 =====
  {
    label: '子供用ベビーカー（軽量・コンパクト）',
    why: '長時間歩く動物園・公園・テーマパークで歩き疲れを防ぐ。電車移動なら軽量モデル必須。',
    url: RAKUTEN('ベビーカー 軽量 コンパクト'),
    categories: ['zoo', 'park', 'amusement', 'farm', 'aquarium'],
    places: ['outdoor', 'mixed'],
    ages: ['0-1', '2-3'],
    priority: 10,
  },
  {
    label: '子供用水筒（保冷 350-500ml）',
    why: '夏場の脱水対策・冬場の温かい飲み物。子連れ外出のマスト。',
    url: RAKUTEN('子供 水筒 ストロー 保冷'),
    categories: ['zoo', 'park', 'amusement', 'farm', 'aquarium', 'museum', 'seasonal', 'indoor'],
    priority: 9,
  },
  {
    label: 'ヒップシート・抱っこ紐',
    why: '0-2歳の長時間歩行は無理。途中で「抱っこ〜」になるので肩腰の負担軽減に。',
    url: RAKUTEN('ヒップシート 抱っこ紐'),
    categories: ['zoo', 'park', 'amusement', 'farm', 'aquarium', 'museum'],
    ages: ['0-1', '2-3'],
    priority: 9,
  },
  {
    label: '子供用日除け帽子（UVカット）',
    why: '春〜秋の屋外は紫外線が強い。あごヒモ付きで風で飛ばない設計が◎',
    url: RAKUTEN('子供 帽子 UVカット あごひも'),
    categories: ['zoo', 'park', 'amusement', 'farm', 'seasonal'],
    places: ['outdoor', 'mixed'],
    priority: 8,
  },
  {
    label: '虫除けスプレー（子供用）',
    why: '初夏〜秋の屋外で蚊・ブヨ対策。ディート不使用の子供向け処方を。',
    url: RAKUTEN('虫除け 子供 ディートフリー'),
    categories: ['park', 'farm', 'zoo', 'seasonal'],
    places: ['outdoor', 'mixed'],
    priority: 7,
  },
  {
    label: 'レジャーシート（防水）',
    why: 'お弁当休憩・芝生でちょっと座る時に必須。防水加工で芝の朝露も気にならない。',
    url: RAKUTEN('レジャーシート 防水 子供'),
    categories: ['park', 'zoo', 'farm', 'amusement'],
    places: ['outdoor', 'mixed'],
    priority: 6,
  },

  // ===== 屋内系 =====
  {
    label: '子供用室内シューズ（軽量）',
    why: '屋内遊戯施設・キッズスペースは靴を脱ぐところと履くところがある。軽量で持ち運びやすいもの。',
    url: RAKUTEN('子供 室内シューズ 軽量'),
    categories: ['indoor', 'museum', 'amusement'],
    priority: 7,
  },

  // ===== 水族館・水辺 =====
  {
    label: '子供用レインコート（コンパクト）',
    why: '水族館のイルカショーで水しぶき。野外動物園での急な雨にも対応。',
    url: RAKUTEN('子供 レインコート コンパクト'),
    categories: ['aquarium', 'zoo', 'amusement'],
    priority: 7,
  },

  // ===== 水遊び =====
  {
    label: '水遊び用サンダル（滑らない）',
    why: 'じゃぶじゃぶ池・プール・水族館タッチプール対応。脱げず滑らないもの。',
    url: RAKUTEN('子供 サンダル 水遊び 滑らない'),
    categories: ['park', 'seasonal', 'aquarium'],
    places: ['outdoor', 'mixed'],
    ages: ['2-3', '4-6'],
    priority: 8,
  },

  // ===== お弁当系 =====
  {
    label: '子供用お弁当箱・カトラリー',
    why: '園内レストランは混雑＋高価格。お弁当持参が時短＆節約。',
    url: RAKUTEN('子供 お弁当箱 食洗機'),
    categories: ['park', 'zoo', 'farm', 'amusement', 'aquarium'],
    priority: 6,
  },

  // ===== 全シーン共通 =====
  {
    label: 'おしりふき・除菌シート',
    why: '手口拭き・遊具拭き・食事前。1日5〜10枚は確実に消費。',
    url: RAKUTEN('おしりふき 純水 厚手'),
    categories: ['zoo', 'park', 'amusement', 'farm', 'aquarium', 'museum', 'seasonal', 'indoor', 'restaurant'],
    priority: 5,
  },
  {
    label: 'ジップロック（汚れもの・濡れもの用）',
    why: '汚れた服・濡れたタオル・食べ残しを密封して持ち帰り。M・Lサイズ各5枚は常備。',
    url: RAKUTEN('ジップロック M L'),
    categories: ['zoo', 'park', 'amusement', 'farm', 'aquarium', 'museum', 'seasonal', 'indoor'],
    priority: 4,
  },
  {
    label: '着替え一式（上下＋下着＋靴下）',
    why: '泥・水・食べこぼし・お漏らし対応。年齢が低いほど確率上がる。',
    url: RAKUTEN('子供 着替え 巾着'),
    categories: ['zoo', 'park', 'amusement', 'farm', 'aquarium', 'seasonal'],
    ages: ['0-1', '2-3'],
    priority: 5,
  },

  // ===== レストラン特化 =====
  {
    label: '子供用カトラリーセット（携帯）',
    why: 'ベビー対応のないお店向け。シリコンエプロンとセットで持参が安心。',
    url: RAKUTEN('子供 カトラリー ケース付き'),
    categories: ['restaurant'],
    priority: 8,
  },
  {
    label: 'シリコンエプロン（食べこぼしキャッチ）',
    why: '床に落ちる前にキャッチ＝お店への配慮＋洗濯削減。',
    url: RAKUTEN('シリコンエプロン 子供 食事'),
    categories: ['restaurant'],
    ages: ['0-1', '2-3'],
    priority: 7,
  },
  {
    label: '静かに遊べるシール・お絵かき帳',
    why: '料理待ちの間の最終兵器。スマホ動画ナシで30分持つ装備を。',
    url: RAKUTEN('シールブック 静かに遊べる'),
    categories: ['restaurant'],
    priority: 6,
  },

  // ===== 季節体験 =====
  {
    label: 'おしぼり・ウェットティッシュ（大判）',
    why: 'いちご狩り・果物狩りで手と口が汚れる。大判タイプが便利。',
    url: RAKUTEN('ウェットティッシュ 大判 厚手'),
    categories: ['seasonal'],
    priority: 7,
  },

  // ===== 牧場 =====
  {
    label: 'ウェットボディシート（汗・においケア）',
    why: '動物の匂いと汗で結構くたびれる。帰り際にひと拭きで車内が快適。',
    url: RAKUTEN('ボディシート 子供'),
    categories: ['farm', 'zoo'],
    places: ['outdoor', 'mixed'],
    priority: 5,
  },
];

/**
 * スポットの属性に応じて、おすすめアイテム上位を返す
 * @param category スポットカテゴリ
 * @param place 屋内/屋外
 * @param ages 対象年齢
 * @param limit 返す件数（デフォルト6）
 */
export function getRecommendedItems(
  category: SpotCategory,
  place: SpotPlace,
  ages: AgeTag[],
  limit = 6,
): RecommendedItem[] {
  return ALL_ITEMS.filter((item) => {
    if (!item.categories.includes(category)) return false;
    if (item.places && !item.places.includes(place)) return false;
    if (item.ages && !item.ages.some((a) => ages.includes(a))) return false;
    return true;
  })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}
