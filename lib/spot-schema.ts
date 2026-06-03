/**
 * スポット詳細ページ用の JSON-LD 生成ヘルパー。
 *
 * 既存の最小限の Place/Restaurant スキーマを、kyounoko の Spot データに
 * 合わせて「LocalBusiness 系のリッチな構造化データ」に拡張する。
 *
 * 目的:
 *   - 検索結果でのリッチリザルト出現率を上げる（価格レンジ、施設情報、
 *     営業可否、無料/有料、口コミ可能性などをGoogleに明示）
 *   - AIO（ChatGPT/Perplexity 等）の回答精度を高める。
 *   - ローカルSEO（「東京 子供 遊び場」「神奈川 雨の日 子連れ」等）の
 *     文脈で kyounoko を強くする。
 *
 * リッチリザルト要件の主な参照:
 *   - https://developers.google.com/search/docs/appearance/structured-data/local-business
 *   - https://schema.org/LocalBusiness
 *
 * 注: kyounoko は住所/電話/営業時間の鮮度を担保しないポリシーのため、
 *   address は addressLocality レベル（区市町村）に留める。それ以上の
 *   詳細（PostalCode, streetAddress）は意図的に書かない。
 */

import type { Spot } from './spots';

/** Spot カテゴリ → schema.org type */
const TYPE_BY_CATEGORY: Record<Spot['category'], string[]> = {
  // 飲食店は Restaurant が最も強い
  restaurant: ['Restaurant', 'LocalBusiness'],
  // 動物園
  zoo: ['Zoo', 'TouristAttraction'],
  // 水族館
  aquarium: ['Aquarium', 'TouristAttraction'],
  // 公園
  park: ['Park', 'TouristAttraction'],
  // 博物館
  museum: ['Museum', 'TouristAttraction'],
  // テーマパーク
  amusement: ['AmusementPark', 'TouristAttraction'],
  // 屋内遊戯施設（schema.orgに該当タイプなし → ChildCare ではなく
  // TouristAttraction + Place で扱う）
  indoor: ['TouristAttraction', 'Place'],
  // 牧場
  farm: ['TouristAttraction', 'Place'],
  // 季節体験（いちご狩り等）
  seasonal: ['TouristAttraction', 'Place'],
};

/** 価格レンジを LocalBusiness の priceRange (¥〜¥¥¥¥) に変換 */
const PRICE_RANGE_BY_BUDGET: Record<NonNullable<Spot['budget']>, string> = {
  free: '無料',
  low: '¥',
  mid: '¥¥',
  high: '¥¥¥',
};

/** 施設情報を amenityFeature に変換するためのラベル */
const AMENITY_LABEL = {
  bathroom: '多目的トイレ',
  diaperChange: 'おむつ替え台',
  nursingRoom: '授乳室',
  kidsSpace: 'キッズスペース',
  strollerRental: 'ベビーカー貸出',
} as const;

/** 公園の遊具タグ → 自然言語ラベル */
const PLAYGROUND_LABEL = {
  'large-slide': '大型滑り台',
  'long-slide': 'ロングすべり台',
  fuwafuwa: 'ふわふわドーム',
  athletic: 'アスレチック',
  tarzan: 'ターザンロープ',
  climbing: 'クライミングウォール',
  'spider-net': 'クモの巣ネット',
  swing: '大型ブランコ',
  sandbox: '砂場',
  bbq: 'BBQエリア',
  cycling: 'サイクリングコース',
  'mini-train': '子供向けミニ電車',
} as const;

type AmenityFeature = {
  '@type': 'LocationFeatureSpecification';
  name: string;
  value: boolean | string;
};

type Offer = {
  '@type': 'Offer';
  name: string;
  price?: string;
  priceCurrency?: 'JPY';
  description?: string;
};

/**
 * 構造化スキーマ用に Spot を変換する。
 * 単一の LocalBusiness 系オブジェクトを返す。
 */
export function buildSpotJsonLd(spot: Spot, slug: string) {
  const url = `https://kyounoko.jp/spot/${slug}`;
  const location = spot.ward ?? spot.city ?? '';

  const types = TYPE_BY_CATEGORY[spot.category] ?? ['TouristAttraction', 'Place'];

  // amenityFeature: facilities + 公園遊具 + 補助フラグ
  const amenityFeature: AmenityFeature[] = [];
  if (spot.facilities) {
    for (const [k, v] of Object.entries(spot.facilities)) {
      if (k === 'note') continue;
      if (v !== 'yes' && v !== 'no') continue;
      const name = AMENITY_LABEL[k as keyof typeof AMENITY_LABEL];
      if (!name) continue;
      amenityFeature.push({
        '@type': 'LocationFeatureSpecification',
        name,
        value: v === 'yes',
      });
    }
  }
  if (spot.playgroundFeatures) {
    for (const f of spot.playgroundFeatures) {
      const name = PLAYGROUND_LABEL[f];
      if (!name) continue;
      amenityFeature.push({
        '@type': 'LocationFeatureSpecification',
        name,
        value: true,
      });
    }
  }
  if (spot.strollerAccess) {
    amenityFeature.push({
      '@type': 'LocationFeatureSpecification',
      name: 'ベビーカー入店可',
      value: true,
    });
  }
  if (spot.babyChair) {
    amenityFeature.push({
      '@type': 'LocationFeatureSpecification',
      name: 'ベビーチェア',
      value: true,
    });
  }
  if (spot.kidsMenu) {
    amenityFeature.push({
      '@type': 'LocationFeatureSpecification',
      name: 'キッズメニュー',
      value: true,
    });
  }
  if (spot.privateRoom) {
    amenityFeature.push({
      '@type': 'LocationFeatureSpecification',
      name: '個室',
      value: true,
    });
  }
  if (spot.babyFood) {
    amenityFeature.push({
      '@type': 'LocationFeatureSpecification',
      name: '離乳食OK',
      value: true,
    });
  }
  if (spot.waterPlay) {
    amenityFeature.push({
      '@type': 'LocationFeatureSpecification',
      name: '水遊び',
      value: true,
    });
  }
  if (spot.summerCool) {
    amenityFeature.push({
      '@type': 'LocationFeatureSpecification',
      name: '冷房完備',
      value: true,
    });
  }

  // offers: pricing 情報を Offer 配列に
  const offers: Offer[] = [];
  if (spot.pricing) {
    const labels: Record<string, string> = {
      adult: '大人',
      elementary: '小学生',
      preschool: '未就学児',
      infant: '乳幼児',
    };
    for (const [k, raw] of Object.entries(spot.pricing)) {
      if (!raw) continue;
      const numeric = raw.match(/([\d,]+)\s*円/);
      const price = numeric ? numeric[1].replace(/,/g, '') : undefined;
      offers.push({
        '@type': 'Offer',
        name: `${labels[k] ?? k}入場料`,
        ...(price ? { price, priceCurrency: 'JPY' } : {}),
        description: raw,
      });
    }
  }

  // additionalProperty: 数値・混雑などの補助情報
  const additionalProperty: Array<{
    '@type': 'PropertyValue';
    name: string;
    value: string;
  }> = [];
  if (spot.walkMinutes && spot.nearestStation) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: '最寄り駅徒歩',
      value: `${spot.walkMinutes}分`,
    });
  }
  if (spot.crowdLevel) {
    if (spot.crowdLevel.weekday) {
      additionalProperty.push({
        '@type': 'PropertyValue',
        name: '平日の混雑',
        value: spot.crowdLevel.weekday,
      });
    }
    if (spot.crowdLevel.holiday) {
      additionalProperty.push({
        '@type': 'PropertyValue',
        name: '土日祝の混雑',
        value: spot.crowdLevel.holiday,
      });
    }
  }
  if (spot.reservation) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: '予約',
      value:
        spot.reservation === 'required'
          ? '必須'
          : spot.reservation === 'recommended'
            ? '推奨'
            : '不要',
    });
  }
  if (spot.ages && spot.ages.length) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: '推奨年齢',
      value: spot.ages.join(', ') + '歳',
    });
  }

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': types,
    name: spot.name,
    url,
    description:
      spot.note ??
      `${spot.name}は${location ? location + 'の' : ''}子連れに使いやすいスポット。設備・料金・アクセス情報をきょうのこ編集部が整理。`,
    inLanguage: 'ja',
    isAccessibleForFree: spot.budget === 'free',
  };

  if (location) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      addressLocality: location,
      addressCountry: 'JP',
    };
    jsonLd.areaServed = location;
  }
  if (spot.budget) {
    jsonLd.priceRange = PRICE_RANGE_BY_BUDGET[spot.budget];
  }
  if (amenityFeature.length) jsonLd.amenityFeature = amenityFeature;
  if (offers.length) jsonLd.makesOffer = offers;
  if (additionalProperty.length) jsonLd.additionalProperty = additionalProperty;
  if (spot.hiddenTip) {
    jsonLd.knowsAbout = spot.hiddenTip;
  }

  return jsonLd;
}
