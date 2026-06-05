'use client';

import React from 'react';
import { rememberRecentSpot, type V2RecentSpot } from './V2RecentSpots';

/**
 * スポット詳細ページの先頭に置く client component。
 * マウント時に localStorage の「最近見たスポット」に追記する。
 */
export function V2RememberSpot(props: V2RecentSpot) {
  React.useEffect(() => {
    rememberRecentSpot(props);
  }, [props.slug, props.name, props.img, props.area]);

  return null;
}
