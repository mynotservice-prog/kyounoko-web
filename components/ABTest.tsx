'use client';

import type { ReactNode } from 'react';
import { useABVariant } from '@/lib/ab';

/**
 * 軽量 A/B テストの宣言的ラッパー。
 *
 * 使い方:
 *   <ABTest experimentId="hero-cta-2026-05" variants={['A: 条件を入れる', 'B: 今日のヒントを見る']}>
 *     {(variant) => <button>{variant}</button>}
 *   </ABTest>
 *
 * 内部で useABVariant を使うので、SSR 時は variants[0]（control）が children に渡り、
 * クライアントマウント後に実際の variant に差し替わる。
 */
export function ABTest<T extends string>({
  experimentId,
  variants,
  children,
}: {
  experimentId: string;
  variants: readonly T[];
  children: (variant: T) => ReactNode;
}) {
  const variant = useABVariant(experimentId, variants);
  return <>{children(variant)}</>;
}
