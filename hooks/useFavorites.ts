'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * お気に入り管理フック（localStorage ベース、ログイン不要）。
 *
 * Plan と Article を横断的に管理。保存キー: "kyounoko.favorites.v1"
 * 形式: { plans: string[]; articles: string[] }  （id / slug）
 *
 * 使い方:
 *   const { isFav, toggleFav, favPlans, favArticles } = useFavorites();
 *   const fav = isFav('plan', 'p-home-rain-2-3-15m-free-01');
 *   toggleFav('plan', 'p-home-rain-2-3-15m-free-01');
 */

const STORAGE_KEY = 'kyounoko.favorites.v1';

export type FavKind = 'plan' | 'article';

export type FavoritesState = {
  plans: string[];
  articles: string[];
};

const DEFAULT_STATE: FavoritesState = { plans: [], articles: [] };

function readFavs(): FavoritesState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      plans: Array.isArray(parsed?.plans) ? parsed.plans.filter((x: unknown): x is string => typeof x === 'string') : [],
      articles: Array.isArray(parsed?.articles) ? parsed.articles.filter((x: unknown): x is string => typeof x === 'string') : [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeFavs(state: FavoritesState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota 等無視
  }
}

export function useFavorites() {
  const [state, setState] = useState<FavoritesState>(DEFAULT_STATE);

  useEffect(() => {
    setState(readFavs());
  }, []);

  const isFav = useCallback(
    (kind: FavKind, id: string): boolean => {
      const list = kind === 'plan' ? state.plans : state.articles;
      return list.includes(id);
    },
    [state],
  );

  const toggleFav = useCallback((kind: FavKind, id: string) => {
    setState((prev) => {
      const listKey = kind === 'plan' ? 'plans' : 'articles';
      const list = prev[listKey];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      const nextState = { ...prev, [listKey]: next };
      writeFavs(nextState);
      return nextState;
    });
  }, []);

  return {
    favPlans: state.plans,
    favArticles: state.articles,
    isFav,
    toggleFav,
  };
}
