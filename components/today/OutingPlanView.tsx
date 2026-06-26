/**
 * 「今日の流れ（おでかけ1日プラン）」表示。
 * lib/outing-plan.ts の buildOutingPlan() の結果を、移動表示つきの3スロットで描画する。
 * /today で ?station= / ?ward= が指定されたときに通常のAnswerCardの代わりにヒーロー表示する。
 */
import Link from 'next/link';
import type { OutingPlan, OutingSlot } from '@/lib/outing-plan';
import { ReservationCTA } from '@/components/article/ReservationCTA';
import { getSpotReservationOffer } from '@/lib/reservation-cta';

const SLOT_ACCENT: Record<OutingSlot['key'], string> = {
  morning: 'var(--sky, #1493d1)',
  lunch: 'var(--clay-deep, #c9603e)',
  afternoon: 'var(--sage, #6f9c5f)',
};

function MoveRow({ slot }: { slot: OutingSlot }) {
  if (!slot.move) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 0 6px 18px',
        color: 'var(--ink-mute)',
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <span aria-hidden="true">🚶</span>
      <span
        style={{
          background: 'var(--paper-2, #efe7d6)',
          borderRadius: 999,
          padding: '2px 10px',
        }}
      >
        {slot.move.text}
      </span>
    </div>
  );
}

function SlotCard({ slot }: { slot: OutingSlot }) {
  const accent = SLOT_ACCENT[slot.key];
  const title =
    slot.spot?.name ?? slot.plan?.title ?? 'おうちでゆっくり過ごす';
  const meta =
    slot.kind === 'restaurant'
      ? slot.spot?.note ?? '子連れOKのお店'
      : slot.kind === 'homeplan'
        ? slot.plan?.shortAnswer ?? 'お昼寝・休憩タイム。おうちで軽く遊ぶ'
        : slot.spot?.note ?? '';

  const inner = (
    <div
      style={{
        background: 'var(--paper-card, #fffaf6)',
        border: '1px solid var(--line)',
        borderLeft: `4px solid ${accent}`,
        borderRadius: 14,
        padding: '12px 14px',
        display: 'flex',
        gap: 12,
      }}
    >
      <div style={{ flex: '0 0 52px', textAlign: 'center' }}>
        <div style={{ fontSize: 22, lineHeight: 1 }} aria-hidden="true">
          {slot.icon}
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--ink-mute)',
            marginTop: 4,
          }}
        >
          {slot.time}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: accent,
            letterSpacing: '.04em',
          }}
        >
          {slot.label}
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: 'var(--ink)',
            lineHeight: 1.35,
            marginTop: 2,
          }}
        >
          {title}
        </div>
        {meta && (
          <div
            style={{
              fontSize: 12,
              color: 'var(--ink-sub)',
              marginTop: 3,
              lineHeight: 1.5,
            }}
          >
            {meta}
          </div>
        )}
        {slot.facets && slot.facets.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>
            {slot.facets.map((f) => (
              <span
                key={f}
                className="meta-chip clay"
                style={{ fontSize: 10.5, fontWeight: 700 }}
              >
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // spot/restaurant はスポット詳細へリンク（おうちプランはリンクなし）
  if (slot.spotSlug && slot.kind !== 'homeplan') {
    return (
      <Link href={`/spot/${slot.spotSlug}`} style={{ textDecoration: 'none', display: 'block' }}>
        {inner}
      </Link>
    );
  }
  if (slot.kind === 'homeplan' && slot.plan) {
    return (
      <Link href={`/plan/${slot.plan.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        {inner}
      </Link>
    );
  }
  return inner;
}

export function OutingPlanView({
  plan,
  ageLabel,
  weatherLabel,
}: {
  plan: OutingPlan;
  ageLabel?: string;
  weatherLabel?: string;
}) {
  const { anchor, slots, coverage } = plan;
  const anchorLabel = anchor.stationName ? `${anchor.stationName}駅` : anchor.wardName;
  const lunch = slots.find((s) => s.key === 'lunch');
  const reservationOffer = lunch ? getSpotReservationOffer('restaurant') : null;

  const lead =
    coverage === 'ideal'
      ? `${anchorLabel}まわりで、移動少なめに回れる1日にしました。`
      : coverage === 'ward'
        ? `${anchor.wardName}内で回れる1日にしました。`
        : `${anchor.wardName}まわりの1日プランです（一部は少し移動あり）。`;

  return (
    <section className="container" style={{ marginTop: 16 }}>
      {/* ヘッダ：アンカーと条件 */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>今日の流れ</h1>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="meta-chip clay" style={{ fontSize: 12 }}>
            📍 {anchorLabel}
          </span>
          {ageLabel && (
            <span className="meta-chip sage" style={{ fontSize: 12 }}>
              👶 {ageLabel}
            </span>
          )}
          {weatherLabel && (
            <span className="meta-chip sky" style={{ fontSize: 12 }}>
              {weatherLabel}
            </span>
          )}
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-sub)', margin: '8px 0 14px', lineHeight: 1.6 }}>
        {lead}
      </p>

      {/* スロット（間に移動表示） */}
      <div>
        {slots.map((slot, i) => (
          <div key={slot.key}>
            {i > 0 && <MoveRow slot={slot} />}
            <SlotCard slot={slot} />
          </div>
        ))}
      </div>

      {/* お昼の予約CTA（env未設定なら非表示） */}
      {reservationOffer && (
        <div style={{ marginTop: 14 }}>
          <ReservationCTA offer={reservationOffer} />
        </div>
      )}

      <p style={{ fontSize: 11.5, color: 'var(--ink-mute)', marginTop: 16, lineHeight: 1.6 }}>
        ※ 各スポットをタップすると詳細（設備・アクセス）が見られます。条件を変えると流れも変わります。
      </p>

      {/* 別の駅で組み直す導線 */}
      <div style={{ marginTop: 12 }}>
        <Link href="/today" className="meta-chip" style={{ fontSize: 12, textDecoration: 'none' }}>
          ← 別の条件・駅で探す
        </Link>
      </div>
    </section>
  );
}
