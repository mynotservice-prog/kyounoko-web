/**
 * 軽量 A/B テスト基盤（外部 SDK 不要 / 自前実装）。
 *
 * 設計方針:
 * - localStorage に visitorId と各 experiment の variant を保存（永続割当）。
 * - 確定的ハッシュ（visitorId + experimentId）で variant を決めるので、
 *   localStorage が消えても同一 visitorId なら同じ variant が再現される。
 * - SSR では window/localStorage に触れない。SSR 時は control（variants[0]）を返し、
 *   クライアントマウント後に正しい variant に差し替える（useABVariant）。
 * - GA4 への送信は /lib/analytics.ts の trackEvent を使用。
 *   `ab_assignment` イベント（params: experiment_id, variant）を、
 *   同一 (visitor, experiment) につきセッション中1回だけ発火する。
 *
 * 使い方:
 *   import { useABVariant } from '@/lib/ab';
 *   const variant = useABVariant('hero-cta-2026-05', ['A', 'B']);
 */

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

const VISITOR_KEY = 'kyounoko_visitor_id';
const VARIANT_PREFIX = 'ab_';

// セッション中に既に ab_assignment を送ったか（重複送信防止）。
// 永続化はしない（タブを開き直したら再送する）。
const sentAssignments = new Set<string>();

/**
 * visitorId を取得（無ければ生成して保存）。
 * - SSR では空文字を返す（呼び出し側で握りつぶす想定）。
 * - crypto.randomUUID が無い古い環境はフォールバック実装。
 */
export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing && existing.length > 0) return existing;
    const id = generateId();
    window.localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    // localStorage が使えない（プライベートモード等）場合はセッションごとに新規発番。
    // 永続化はできないが、同一レンダリング内の整合性は保てる。
    return generateId();
  }
}

function generateId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  // フォールバック: 時刻 + ランダム
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * 文字列の確定的ハッシュ（FNV-1a 32bit）。
 * 暗号用途ではなく、variant 振り分け（モジュロ演算）のためだけに使う。
 */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    // Math.imul で32bit乗算をエミュレート（v8最適化対象）
    h = Math.imul(h, 0x01000193);
  }
  // 符号なしに正規化
  return h >>> 0;
}

/**
 * variant を取得。
 * - クライアント側: localStorage に既存があればそれを返し、無ければ確定的ハッシュで決定して保存。
 * - 初回確定時に GA4 へ `ab_assignment` を1回送信（セッション内重複は抑止）。
 * - SSR では variants[0]（control）を返す。
 */
export function getVariant<T extends string>(experimentId: string, variants: readonly T[]): T {
  if (variants.length === 0) {
    throw new Error(`getVariant: variants must not be empty (experimentId=${experimentId})`);
  }
  // SSR フォールバック: control を返す
  if (typeof window === 'undefined') return variants[0] as T;

  const storageKey = `${VARIANT_PREFIX}${experimentId}`;
  let chosen: T | null = null;

  // 1) 既存の割当を尊重
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved && (variants as readonly string[]).includes(saved)) {
      chosen = saved as T;
    }
  } catch {
    // 読めなくても続行（フォールバックで毎回算出する）
  }

  // 2) 無ければ確定的ハッシュで決定
  if (chosen === null) {
    const visitorId = getOrCreateVisitorId();
    // visitorId が空（localStorage 不可）のときは Math.random で代用。
    // この場合 visitorId 無しなので「毎回ランダム」になるが、それが起こるのは極稀。
    const seed = visitorId.length > 0 ? `${visitorId}::${experimentId}` : `${Math.random()}::${experimentId}`;
    const idx = hash(seed) % variants.length;
    chosen = variants[idx] as T;
    try {
      window.localStorage.setItem(storageKey, chosen);
    } catch {
      // 保存できなくても以降のレンダリングでは同じ seed なら同じ結果が出る（visitorId がある限り）
    }
  }

  // 3) GA4 にイベント送信（セッション中1回だけ）
  const dedupeKey = `${experimentId}::${chosen}`;
  if (!sentAssignments.has(dedupeKey)) {
    sentAssignments.add(dedupeKey);
    trackEvent('ab_assignment', { experiment_id: experimentId, variant: chosen });
  }

  return chosen;
}

/**
 * React Hook 版。クライアントマウント後に variant を返す。
 * - SSR / 初回マウント前は variants[0]（control）を返す。
 *   これによりハイドレーション不一致を回避（マウント後に effect で差し替え）。
 */
export function useABVariant<T extends string>(experimentId: string, variants: readonly T[]): T {
  // 初期値は常に control。これで SSR と CSR 初回が一致する。
  const [variant, setVariant] = useState<T>(variants[0] as T);

  useEffect(() => {
    const v = getVariant(experimentId, variants);
    setVariant(v);
    // experimentId と variants が変わるたびに再評価。
    // variants は通常静的なので、文字列キーで比較可能な join に依存して deps を組む。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentId, variants.join('|')]);

  return variant;
}
