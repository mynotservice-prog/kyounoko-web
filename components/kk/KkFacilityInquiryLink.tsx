'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

/**
 * 施設・店舗の運営者向けの控えめな1行リンク（→ /for-facilities）。
 *
 * 背景（2026-11-02 D-1=A・インバウンド型へ組み替え）:
 *   /for-facilities は28日で13PVしか見られておらず、導線はフッターと運営ページだけだった。
 *   有料成約の唯一の実例（Kids Base）は自分から掲載を求めてきた施設だったので、
 *   施設の担当者が自施設名・エリア名で着地する面（スポットページ・室内遊び場の記事）から見える位置に置く。
 *
 * 守ること: 料金は出さない（2026-10-03 社長決定）。実例（Kids Base）は 11/28 以降に判断（11/02 COO裁定）。
 * AdSense 枠の直前直後・アフィリ枠の近くには置かない。リンク先はクエリなし（Vercel費ガード）。
 * 計測は GA4 イベント `facility_inquiry_click`（placement 別）。
 */
export function KkFacilityInquiryLink({ placement }: { placement: 'spot' | 'article' }) {
  return (
    <p className="kk-facility-inquiry">
      {placement === 'spot' ? 'この施設の運営者の方へ：' : '掲載施設の運営者の方へ：'}
      <Link
        href="/for-facilities"
        onClick={() => trackEvent('facility_inquiry_click', { placement })}
      >
        掲載内容の修正・無料掲載のご相談はこちら
      </Link>
    </p>
  );
}
