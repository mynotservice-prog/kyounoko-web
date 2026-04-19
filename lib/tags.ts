/**
 * タグ/トピッククラスター システム。
 *
 * 目的: サイト内のトピックを横断的に繋ぐ。
 * Articles と Plans の両方を同一タグで束ねる。
 *
 * 3種類のタグ:
 *  - age     : 0-1, 2-3, 4-6
 *  - scene   : rain, home, weekday, holiday, 15min, quick, outdoor, indoor, tokyo ...
 *  - theme   : bento, breakfast, asobi, kousaku, sleep, stroller, dakkohimo ...
 *
 * /tag/[slug] に動的ページを生成。
 */

import { getAllFileArticles, type FileArticleMeta } from './articles';
import { getAllPlanMetas, type PlanMeta } from './plans';

export type TagKind = 'age' | 'scene' | 'theme';

export type TagDef = {
  slug: string;
  name: string;
  description: string;
  kind: TagKind;
  /** 判定関数: Article or Plan にこのタグがマッチするか */
  matchArticle?: (a: FileArticleMeta) => boolean;
  matchPlan?: (p: PlanMeta) => boolean;
};

// ==========================================================================
// タグ定義
// ==========================================================================

export const TAGS: TagDef[] = [
  // --- 年齢 ---
  {
    slug: '0-1sai',
    name: '0〜1歳',
    kind: 'age',
    description: '0〜1歳の赤ちゃんと過ごす毎日のヒント。家遊び・外出・お昼寝・離乳食までまとめて。',
    matchArticle: (a) => a.quickInfo?.ageRanges?.includes('0-1' as never) ?? false,
    matchPlan: (p) => p.ageRanges.includes('0-1' as never),
  },
  {
    slug: '2-3sai',
    name: '2〜3歳',
    kind: 'age',
    description: '2〜3歳のイヤイヤ期と好奇心。家遊び・食事・外出・寝かしつけの現実解。',
    matchArticle: (a) => a.quickInfo?.ageRanges?.includes('2-3' as never) ?? false,
    matchPlan: (p) => p.ageRanges.includes('2-3' as never),
  },
  {
    slug: '4-6sai',
    name: '4〜6歳',
    kind: 'age',
    description: '4〜6歳の体力と学びの時期。工作・自然体験・習い事・休日の1日プラン。',
    matchArticle: (a) => a.quickInfo?.ageRanges?.includes('4-6' as never) ?? false,
    matchPlan: (p) => p.ageRanges.includes('4-6' as never),
  },

  // --- シーン ---
  {
    slug: 'amenohi',
    name: '雨の日',
    kind: 'scene',
    description: '雨の日に家遊び・屋内スポットで1日を回すためのプラン集。',
    matchArticle: (a) => a.quickInfo?.weather?.includes('rain' as never) ?? false,
    matchPlan: (p) => p.weather.includes('rain' as never),
  },
  {
    slug: 'moushobi',
    name: '猛暑日',
    kind: 'scene',
    description: '猛暑日に涼しく過ごすための屋内スポットや家遊びプラン。',
    matchArticle: (a) => a.quickInfo?.weather?.includes('heat' as never) ?? false,
    matchPlan: (p) => p.weather.includes('heat' as never),
  },
  {
    slug: 'samuibi',
    name: '寒い日',
    kind: 'scene',
    description: '寒い日に無理なく過ごすための屋内/外出プラン。',
    matchArticle: (a) => a.quickInfo?.weather?.includes('cold' as never) ?? false,
    matchPlan: (p) => p.weather.includes('cold' as never),
  },
  {
    slug: 'heijitsu-yoru',
    name: '平日夜',
    kind: 'scene',
    description: '共働き家庭の帰宅後〜就寝までを回すための時短プランと段取り術。',
    matchArticle: (a) => a.category === 'heijitsu-yoru' || a.category === 'today-mawasu',
    matchPlan: (p) => p.day.includes('weekday' as never),
  },
  {
    slug: 'shumatsu',
    name: '休日・週末',
    kind: 'scene',
    description: '家族で休日1日を過ごす組み立てプラン。年齢別・天気別に。',
    matchPlan: (p) => p.day.includes('holiday' as never),
  },
  {
    slug: 'jitan-15pun',
    name: '15分で',
    kind: 'scene',
    description: '15分で回せる子どもとの遊び・ごはん・段取り集。',
    matchArticle: (a) => (a.quickInfo?.durationMin ?? 999) <= 15,
    matchPlan: (p) => p.durationMin <= 15,
  },
  {
    slug: 'ie-de',
    name: '家で過ごす',
    kind: 'scene',
    description: '家で過ごす日の家遊び・ごはん・段取りをまとめた集約ページ。',
    matchArticle: (a) => a.quickInfo?.place?.includes('home' as never) ?? false,
    matchPlan: (p) => p.place.includes('home' as never),
  },
  {
    slug: 'odekake',
    name: 'おでかけ',
    kind: 'scene',
    description: '外出・スポット・外遊び系のプランと記事を集約。',
    matchArticle: (a) => a.quickInfo?.place?.includes('outdoor' as never) ?? false,
    matchPlan: (p) => p.place.includes('outdoor' as never),
  },
  {
    slug: 'muryou',
    name: '無料で',
    kind: 'scene',
    description: '無料で楽しめるお出かけ先や家遊びプランのコレクション。',
    matchArticle: (a) => a.quickInfo?.budget === 'free',
    matchPlan: (p) => p.budget === 'free',
  },

  // --- テーマ ---
  {
    slug: 'bento-jitan',
    name: 'お弁当・時短',
    kind: 'theme',
    description: 'お弁当レシピ、キャラ弁、時短朝ごはんをまとめて。',
    matchArticle: (a) => /bento|obento|kyaraben|asagohan/i.test(a.slug) || /弁当|朝ごはん/.test(a.title),
    matchPlan: (p) => /弁当|朝ごはん|bento/i.test(p.title),
  },
  {
    slug: 'asobi-kousaku',
    name: '遊び・工作',
    kind: 'theme',
    description: '家遊び・工作・知育のアイデア集。',
    matchArticle: (a) => /asobi|kousaku|craft|chiiku|seal|omocha/i.test(a.slug),
    matchPlan: (p) => /遊び|工作|ブロック|折り紙|craft/i.test(p.title),
  },
  {
    slug: 'nene-sleep',
    name: '寝かしつけ・お昼寝',
    kind: 'theme',
    description: '寝かしつけ・夜泣き・お昼寝卒業のヒント集。',
    matchArticle: (a) => /nene|sleep|yonaki|oyasumi|ohirune|shoutou/i.test(a.slug),
    matchPlan: (p) => /寝|ねんね|昼寝|就寝|sleep/i.test(p.title),
  },
  {
    slug: 'stroller-dakkohimo',
    name: 'ベビーカー・抱っこ紐',
    kind: 'theme',
    description: 'ベビーカー・抱っこ紐の選び方と比較記事、具体プラン。',
    matchArticle: (a) => /babycar|stroller|dakkohimo/i.test(a.slug),
  },
  {
    slug: 'naraigoto',
    name: '習い事',
    kind: 'theme',
    description: 'スイミング・ピアノ・英語・知育系の習い事と比較。',
    matchArticle: (a) => a.category === 'narai' || /naraigoto|kumon|shichida|piano|swimming|soccer|taisou|eigo|monte/i.test(a.slug),
    matchPlan: (p) => /ピアノ|習い事|教室|スイミング/i.test(p.title),
  },
  {
    slug: 'gyouji-event',
    name: '季節の行事',
    kind: 'theme',
    description: 'お花見・七夕・ハロウィン・クリスマスなど年中行事の過ごし方。',
    matchArticle: (a) => a.category === 'gyouji' || /halloween|xmas|sakura|hanami|tanabata|shichigosan|oshougatsu|hatsuzekku|natsumatsuri/i.test(a.slug),
    matchPlan: (p) => p.id.startsWith('p-event-') || /ハロウィン|クリスマス|お正月|七夕|お花見|節分/i.test(p.title),
  },

  // --- エリア系（主要都市）---
  {
    slug: 'tokyo',
    name: '東京',
    kind: 'scene',
    description: '東京都内の子連れスポット・プラン集約。',
    matchArticle: (a) => a.area === 'tokyo' || /tokyo/i.test(a.slug),
    matchPlan: (p) => p.area === 'tokyo',
  },
  {
    slug: 'osaka',
    name: '大阪',
    kind: 'scene',
    description: '大阪の子連れスポット・プラン集約。',
    matchPlan: (p) => p.area === 'osaka',
  },
];

// ==========================================================================
// 公開 API
// ==========================================================================

export function getAllTags(): TagDef[] {
  return TAGS;
}

export function getTag(slug: string): TagDef | null {
  return TAGS.find((t) => t.slug === slug) ?? null;
}

export function getTagsByKind(kind: TagKind): TagDef[] {
  return TAGS.filter((t) => t.kind === kind);
}

/** タグに紐づく記事とプランを取得（最新優先） */
export function getContentForTag(
  slug: string,
  limit = 50,
): { articles: FileArticleMeta[]; plans: PlanMeta[] } {
  const tag = getTag(slug);
  if (!tag) return { articles: [], plans: [] };

  const articles = tag.matchArticle
    ? getAllFileArticles().filter(tag.matchArticle).slice(0, limit)
    : [];
  const plans = tag.matchPlan
    ? getAllPlanMetas().filter(tag.matchPlan).slice(0, limit)
    : [];

  return { articles, plans };
}

/** 記事 or プランに対して、マッチする全タグを返す */
export function getTagsForArticle(article: FileArticleMeta): TagDef[] {
  return TAGS.filter((t) => t.matchArticle?.(article));
}

export function getTagsForPlan(plan: PlanMeta): TagDef[] {
  return TAGS.filter((t) => t.matchPlan?.(plan));
}
