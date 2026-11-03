import { chainEvidenceAt, EVIDENCE_LABEL, EVIDENCE_ORDER } from '@/lib/station-evidence';

/**
 * チェーンのカードに出す設備タグ（2026-10-28・Phase 0）。
 * この駅の店で公式の店舗検索に表示がある項目は「（店）」、チェーン公式が全店向けに記載している項目は
 * 「（全店）」。以前は Chain 型の手入力の値（出典なし）でタグを出していた。lib/station-evidence.ts
 */
export function EvidenceChips({
  stationSlug,
  chainSlug,
  className = 'kk-chip',
  style,
}: {
  stationSlug: string;
  chainSlug: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ev = chainEvidenceAt(stationSlug, chainSlug);
  const needs = EVIDENCE_ORDER.filter((n) => ev.has(n));
  if (needs.length === 0) return null;
  return (
    <>
      {needs.map((n) => (
        <span
          key={n}
          className={className}
          style={style}
          title={ev.get(n) === 'store' ? 'この駅の店の公式店舗検索に表示がある項目' : 'チェーン公式が全店向けに記載している項目'}
        >
          {EVIDENCE_LABEL[n]}（{ev.get(n) === 'store' ? '店' : '全店'}）
        </span>
      ))}
    </>
  );
}

/** タグの読み方（チェーンのカード一覧の上に1回だけ出す） */
export const EVIDENCE_CHIPS_NOTE =
  '設備のタグは、この駅の店で公式の店舗検索に表示がある項目（店）と、チェーン公式が全店向けに記載している項目（全店）だけです。タグが無い設備は「無い」という意味ではありません（公式に記載が無いだけのことがあります）。';
