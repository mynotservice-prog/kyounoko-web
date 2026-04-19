'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * 「やってみた」匿名カウンター（localStorage ベース）。
 *
 * 各ユーザーがプラン/記事ごとに「やってみた」を押した回数を記録し、
 * 全ユーザー集計は（現時点ではサーバなしなので）擬似的に:
 *  - 自分のカウントは localStorage 保存
 *  - サイト全体カウントは id ベースの決定論的 seedで疑似値を表示
 *    （将来的にサーバAPIで正確な集計に置換可能）
 *
 * 保存キー: "kyounoko.tried.v1" — { [kind:id]: number }
 */

const STORAGE_KEY = 'kyounoko.tried.v1';

export type TriedKind = 'plan' | 'article';

type TriedMap = Record<string, number>;

function readTried(): TriedMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeTried(map: TriedMap) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* quota 無視 */
  }
}

/** id から擬似的な「全体カウント」を返す（50-500の間、安定値）。 */
function pseudoTotalCount(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash) + key.charCodeAt(i);
    hash |= 0;
  }
  const base = Math.abs(hash) % 450 + 50;
  // 1週間単位で微変動（Math.floor(now/week) を seed に混ぜる）
  const weekSeed = Math.floor(Date.now() / (7 * 24 * 3600 * 1000));
  const bump = (hash * weekSeed) & 0xff;
  return base + (bump % 20);
}

export function useTriedCounter(kind: TriedKind, id: string) {
  const key = `${kind}:${id}`;
  const [myCount, setMyCount] = useState(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    const map = readTried();
    setMyCount(map[key] ?? 0);
    setTotalCount(pseudoTotalCount(key));
  }, [key]);

  const increment = useCallback(() => {
    const map = readTried();
    const next = (map[key] ?? 0) + 1;
    map[key] = next;
    writeTried(map);
    setMyCount(next);
  }, [key]);

  return { myCount, totalCount, increment };
}
