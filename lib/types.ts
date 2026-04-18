import type { MicroCMSListContent, MicroCMSImage, MicroCMSObjectContent } from 'microcms-js-sdk';

// ==========================================================================
// 基本型
// ==========================================================================

export type AgeRange = '0-1' | '2-3' | '4-6';
export type Weather = 'rain' | 'heat' | 'cold' | 'sunny' | 'any';
export type PlaceType = 'home' | 'indoor' | 'outdoor';
export type DayType = 'weekday' | 'holiday';
export type TimeOfDay = 'morning' | 'noon' | 'evening' | 'night';
export type Budget = 'free' | 'low' | 'mid' | 'high';
export type OpsType = 'onep' | 'brothers';

// ==========================================================================
// 記事
// ==========================================================================

export type Article = MicroCMSListContent & {
  slug: string;
  title: string;
  lede: string;
  conclusion: string;
  body: string;
  hero: MicroCMSImage;
  category: Category;
  tags?: Tag[];
  author: Author;
  supervisor?: Author;
  quickInfo_ageRanges?: AgeRange[];
  quickInfo_place?: PlaceType[];
  quickInfo_weather?: Weather[];
  quickInfo_durationMin?: number;
  quickInfo_budget?: Budget;
  quickInfo_ops?: OpsType[];
  relatedArticles?: Article[];
  faq?: FaqItem[];
  affiliateItems?: AffiliateItem[];
  spots?: Spot[];
  publishedAt: string;
  updatedAtManual?: string;
  metaDescription: string;
  noindex?: boolean;
};

export type FaqItem = {
  fieldId: 'faq';
  question: string;
  answer: string;
};

export type AffiliateItem = {
  fieldId: 'affiliateItem';
  title: string;
  description: string;
  imageUrl?: string;
  url: string;
  pr?: boolean;
};

// ==========================================================================
// カテゴリ
// ==========================================================================

export type CategorySlug =
  | 'today-doko'
  | 'today-nani'
  | 'today-taberu'
  | 'today-mawasu'
  | 'shippai-shinai'
  | 'tenki'
  | 'heijitsu-yoru'
  | 'gyouji'
  | 'narai'
  | 'yakudatsu';

export type Category = MicroCMSListContent & {
  name: string;
  slug: CategorySlug;
  description?: string;
  order?: number;
  parent?: Category;
  ogImage?: MicroCMSImage;
};

// ==========================================================================
// タグ
// ==========================================================================

export type TagType =
  | 'age'
  | 'weather'
  | 'place'
  | 'day'
  | 'time'
  | 'ops'
  | 'budget'
  | 'amenity'
  | 'area';

export type Tag = MicroCMSListContent & {
  name: string;
  slug: string;
  type: TagType;
  value?: string;
};

// ==========================================================================
// 執筆者
// ==========================================================================

export type Author = MicroCMSListContent & {
  name: string;
  slug: string;
  bio: string;
  credentials?: string;
  avatar?: MicroCMSImage;
  isSupervisor?: boolean;
};

// ==========================================================================
// スポット（地域記事用）
// ==========================================================================

export type Amenity =
  | 'baby-car'
  | 'kids-chair'
  | 'diaper-table'
  | 'indoor'
  | 'lunch'
  | 'elevator'
  | 'parking';

export type Spot = MicroCMSListContent & {
  name: string;
  slug: string;
  description: string;
  image?: MicroCMSImage;
  address?: string;
  pref: string;
  city: string;
  latitude?: number;
  longitude?: number;
  amenities?: Amenity[];
  priceRange?: Budget;
  officialUrl?: string;
  isSponsored?: boolean;
  note?: string;
};

// ==========================================================================
// サイト共通設定
// ==========================================================================

export type SiteConfig = MicroCMSObjectContent & {
  title: string;
  tagline: string;
  description: string;
  ogImage?: MicroCMSImage;
  heroSubCopy: string;
};
