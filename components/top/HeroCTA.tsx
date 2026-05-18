'use client';

import Link from 'next/link';
import { useABVariant } from '@/lib/ab';
import { trackEvent } from '@/lib/analytics';

/**
 * Hero セクションの主要 CTA（A/Bテスト対象）。
 *
 * Experiment: hero-cta-2026-05
 *   - A (control): 「条件を入れる」
 *   - B          : 「今日のヒントを見る」
 *
 * - useABVariant が SSR/初回マウントでは control（A）を返すため、
 *   ハイドレーション不一致は起きない（マウント後に差し替え）。
 * - クリックで `hero_cta_click` を variant 付きで GA4 へ送る。
 *   ab_assignment（割当） × hero_cta_click（CTR）でファネル分析が回せる。
 */
const EXPERIMENT_ID = 'hero-cta-2026-05';
const VARIANTS = ['A', 'B'] as const;
type Variant = (typeof VARIANTS)[number];

const LABEL: Record<Variant, string> = {
  A: '条件を入れる',
  B: '今日のヒントを見る',
};

export function HeroCTA({ href = '#finder' }: { href?: string }) {
  const variant = useABVariant(EXPERIMENT_ID, VARIANTS);
  const label = LABEL[variant];

  return (
    <Link
      href={href}
      className="btn-primary"
      onClick={() => {
        trackEvent('hero_cta_click', { variant, experiment_id: EXPERIMENT_ID });
      }}
    >
      {label}
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </Link>
  );
}
