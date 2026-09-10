/* eslint-disable @next/next/no-img-element */
import React from 'react';

/**
 * きょうのこ アイコンイラスト（社長支給 / `~/Desktop/きょうのこ絵文字フォルダ` の68点）。
 *
 * 元は 1254×1254 の PNG。`public/img/icons/kk/*.webp`（128px・合計 440KB）に変換して使う。
 * カラーの立体イラストなので、**意味を持つ対象**（スポットの種類・設備・天気・年齢・
 * 食べ物のジャンル）に使い、矢印やシェブロンなどの純粋なUI記号は線画の `KkIcon` を使う。
 */
export type KkArtName =
  // スポットの種類
  | 'park' | 'zoo' | 'aquarium' | 'museum' | 'shrine'
  | 'playground' | 'kids-space' | 'themepark' | 'pool' | 'outdoor' | 'farm'
  // 天気
  | 'sunny' | 'cloudy' | 'rain' | 'snow' | 'hot' | 'cold'
  // 探す・検索
  | 'search' | 'today' | 'tomorrow' | 'weekend' | 'pin' | 'map' | 'station' | 'popular'
  // 料金・その他
  | 'free' | 'paid' | 'indoor' | 'nature' | 'nature-trees'
  // 食べる
  | 'lunch' | 'famires' | 'ramen' | 'sushi' | 'yakiniku'
  | 'fastfood' | 'cafe' | 'italian' | 'kids-menu' | 'baby-food'
  // 子どもの好き・ジャンル
  | 'toy' | 'book' | 'art' | 'animal' | 'sealife'
  | 'dinosaur' | 'train' | 'music' | 'vehicle' | 'character'
  // 設備・サービス
  | 'nursing' | 'diaper' | 'accessible-toilet' | 'stroller' | 'parking'
  | 'wifi' | 'locker' | 'utensils' | 'microwave' | 'rest-space'
  // 人物・年齢
  | 'age-0' | 'age-1' | 'age-2' | 'age-3' | 'age-4' | 'age-5' | 'age-6'
  | 'age-school' | 'family';

export function KkArt({
  name,
  size = 32,
  className,
  style,
  priority,
}: {
  name: KkArtName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  /** ファーストビューに出るものだけ true（既定は lazy） */
  priority?: boolean;
}) {
  return (
    <img
      src={`/img/icons/kk/${name}.webp`}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
      style={{ display: 'block', ...style }}
    />
  );
}
