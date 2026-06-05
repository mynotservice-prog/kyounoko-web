'use client';

import React from 'react';
import Link from 'next/link';
import { V2Img } from './V2Base';
import { V2Icon } from './V2Icon';

const LS_KEY = 'kk_v2_recent_spots';
const MAX = 8;

export type V2RecentSpot = {
  slug: string;
  name: string;
  img: string;
  area?: string;
};

/**
 * 「最近見たスポット」表示。
 * localStorage の `kk_v2_recent_spots` を読み出し、横スクロールで表示する。
 *
 * スポット詳細ページ（/spot/[slug]）で呼ばれる `rememberRecentSpot` で
 * 追記される想定。
 */
export function V2RecentSpots() {
  const [items, setItems] = React.useState<V2RecentSpot[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const list: V2RecentSpot[] = raw ? JSON.parse(raw) : [];
      setItems(list.slice(0, MAX));
    } catch {
      /* ignore */
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <>
      <div className="v2-sec-head">
        <div className="v2-sec-title">最近見たスポット</div>
      </div>
      <div className="v2-hscroll">
        {items.map((s) => (
          <Link
            key={s.slug}
            href={`/spot/${s.slug}`}
            className="v2-card-mini"
            style={{ width: 148 }}
          >
            <div className="v2-imgwrap r" style={{ aspectRatio: '16/9' }}>
              <V2Img src={s.img} seed={s.slug} alt={s.name} />
            </div>
            <div className="v2-card-mini-title">{s.name}</div>
            {s.area && (
              <div className="v2-card-v-loc" style={{ margin: 0 }}>
                <V2Icon name="pin" size={12} color="var(--v2-orange)" />
                {s.area}
              </div>
            )}
          </Link>
        ))}
      </div>
    </>
  );
}

/**
 * スポット詳細ページから呼ぶ。最近見たスポットを localStorage に追記。
 * 直近 MAX 件を保持。
 */
export function rememberRecentSpot(s: V2RecentSpot) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const list: V2RecentSpot[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((x) => x.slug !== s.slug);
    const next = [s, ...filtered].slice(0, MAX);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
