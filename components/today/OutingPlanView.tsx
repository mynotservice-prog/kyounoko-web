/**
 * 「今日の流れ（おでかけ1日プラン）」表示。
 * lib/outing-plan.ts の buildOutingPlan() の結果を、移動表示つきの3スロットで描画する。
 * /today で ?station= / ?ward= が指定されたときに通常のAnswerCardの代わりにヒーロー表示する。
 */
import Link from 'next/link';
import type { OutingPlan, OutingSlot } from '@/lib/outing-plan';
import { spotToSlug, type Spot } from '@/lib/spots';
import { ReservationCTA } from '@/components/article/ReservationCTA';
import { getSpotReservationOffer } from '@/lib/reservation-cta';
import { SavePlanButton } from './SavePlanButton';

function spotFacets(s: Spot): string[] {
  const f: string[] = [];
  if (s.babyChair) f.push('ベビーチェア');
  if (s.kidsMenu) f.push('キッズメニュー');
  if (s.strollerAccess) f.push('ベビーカーOK');
  if (s.babyFood) f.push('離乳食OK');
  return f;
}

const SLOT_ACCENT: Record<OutingSlot['key'], string> = {
  morning: 'var(--sky, #1493d1)',
  lunch: 'var(--clay-deep, #c9603e)',
  afternoon: 'var(--sage, #6f9c5f)',
};

/** スロットkey → variantを表すクエリparam名 */
const VARIANT_PARAM: Record<OutingSlot['key'], string> = {
  morning: 'vm',
  lunch: 'vl',
  afternoon: 'va',
};

/** 現在のクエリ(params)を元に、上書き付きの /today URLを作る */
function buildHref(params: Record<string, string>, overrides: Record<string, string>): string {
  const sp = new URLSearchParams(params);
  for (const [k, v] of Object.entries(overrides)) sp.set(k, v);
  return `/today?${sp.toString()}`;
}

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

  // spot/restaurant はスポット詳細へリンク（個人店は href=駅ページの個人店セクション優先。おうちプランはリンクなし）
  if ((slot.href || slot.spotSlug) && slot.kind !== 'homeplan') {
    return (
      <Link
        href={slot.href ?? `/spot/${slot.spotSlug}`}
        style={{ textDecoration: 'none', display: 'block' }}
      >
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

/** 個人店の1行（/spot ページが無いので駅ページの個人店セクションへ）。 */
function IndieRow({ s, href }: { s: Spot; href?: string }) {
  const facets = spotFacets(s);
  const inner = (
    <div
      style={{
        background: 'var(--paper-card, #fffaf6)',
        border: '1px solid var(--line)',
        borderRadius: 12,
        padding: '11px 13px',
      }}
    >
      <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--ink)' }}>{s.name}</div>
      {s.city && (
        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-mute)', marginTop: 2 }}>
          🚶 {s.city}
        </div>
      )}
      {s.note && (
        <div style={{ fontSize: 12, color: 'var(--ink-sub)', marginTop: 3, lineHeight: 1.5 }}>
          {s.note}
        </div>
      )}
      {facets.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>
          {facets.map((f) => (
            <span key={f} className="meta-chip clay" style={{ fontSize: 10.5, fontWeight: 700 }}>
              {f}
            </span>
          ))}
        </div>
      )}
    </div>
  );
  if (!href) return <div style={{ marginBottom: 8 }}>{inner}</div>;
  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block', marginBottom: 8 }}>
      {inner}
    </Link>
  );
}

/** お昼スロット単体ビュー（?slot=lunch）: 子連れで入れる店一覧。 */
function RestaurantRow({ s }: { s: Spot }) {
  const facets = spotFacets(s);
  return (
    <Link
      href={`/spot/${spotToSlug(s, 'tokyo')}`}
      style={{ textDecoration: 'none', display: 'block', marginBottom: 8 }}
    >
      <div
        style={{
          background: 'var(--paper-card, #fffaf6)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          padding: '11px 13px',
        }}
      >
        <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--ink)' }}>{s.name}</div>
        {s.note && (
          <div style={{ fontSize: 12, color: 'var(--ink-sub)', marginTop: 3, lineHeight: 1.5 }}>
            {s.note}
          </div>
        )}
        {facets.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>
            {facets.map((f) => (
              <span key={f} className="meta-chip clay" style={{ fontSize: 10.5, fontWeight: 700 }}>
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export function LunchListView({
  anchorLabel,
  wardName,
  wardRest,
  chain,
  ageLabel,
  indies = [],
  indieHref,
}: {
  anchorLabel: string;
  wardName: string;
  wardRest: Spot[];
  chain: Spot[];
  ageLabel?: string;
  /** 駅近の個人店（擬似Spot化済み・チェーンより先に出す） */
  indies?: Spot[];
  /** 個人店の詳細一覧（/station/[slug]#section-indies）へのリンク */
  indieHref?: string;
}) {
  const offer = getSpotReservationOffer('restaurant');
  return (
    <section className="container" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, margin: 0 }}>子連れで入れるお店</h1>
        <span className="meta-chip clay" style={{ fontSize: 12 }}>📍 {anchorLabel}</span>
        {ageLabel && <span className="meta-chip sage" style={{ fontSize: 12 }}>👶 {ageLabel}</span>}
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-sub)', margin: '8px 0 14px', lineHeight: 1.6 }}>
        ベビーチェア・キッズメニュー・座敷など、子連れで入りやすいお店です。
      </p>

      {indies.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-mute)', margin: '4px 0 8px' }}>
            駅近の個人店・人気店
          </div>
          {indies.slice(0, 8).map((s) => (
            <IndieRow key={s.name} s={s} href={indieHref} />
          ))}
          {indieHref && (
            <p style={{ fontSize: 12.5, margin: '2px 0 10px' }}>
              <Link href={indieHref} style={{ color: 'var(--clay, #c9603e)', fontWeight: 700 }}>
                → この駅の個人店をぜんぶ見る
              </Link>
            </p>
          )}
        </>
      )}

      {wardRest.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-mute)', margin: '4px 0 8px' }}>
            {wardName}のお店
          </div>
          {wardRest.slice(0, 12).map((s) => (
            <RestaurantRow key={s.name} s={s} />
          ))}
        </>
      )}

      {chain.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-mute)', margin: '14px 0 8px' }}>
            どの駅でも入りやすいファミリー向けチェーン
          </div>
          {chain.slice(0, 8).map((s) => (
            <RestaurantRow key={s.name} s={s} />
          ))}
        </>
      )}

      {offer && (
        <div style={{ marginTop: 14 }}>
          <ReservationCTA offer={offer} />
        </div>
      )}
    </section>
  );
}

export function OutingPlanView({
  plan,
  params,
  ageLabel,
  weatherLabel,
  rainPlan,
}: {
  plan: OutingPlan;
  /** 現在の /today クエリ（station/age/weather/vm/vl/va 等）。スワップ/別案リンク生成に使う */
  params: Record<string, string>;
  ageLabel?: string;
  weatherLabel?: string;
  /** P0-2: 雨プランB（同条件を weather=rain で再生成した屋内中心の代替）。null なら非表示。 */
  rainPlan?: OutingPlan | null;
}) {
  const { anchor, slots, coverage } = plan;
  const anchorLabel = anchor.stationName ? `${anchor.stationName}駅` : anchor.regionLabel;
  const lunch = slots.find((s) => s.key === 'lunch');
  const reservationOffer = lunch ? getSpotReservationOffer('restaurant') : null;
  const saveLabel = `${anchorLabel}の1日プラン${ageLabel ? `（${ageLabel}）` : ''}`;

  // 「別の流れを見る」= 全スロットの variant を +1
  const bump = (k: string) => String(Number(params[k] ?? '0') + 1);
  const rerollHref = buildHref(params, {
    vm: bump('vm'),
    vl: bump('vl'),
    va: bump('va'),
  });

  const lead =
    coverage === 'ideal'
      ? `${anchorLabel}まわりで、移動少なめに回れる1日にしました。`
      : coverage === 'ward'
        ? `${anchor.regionLabel}内で回れる1日にしました。`
        : `${anchor.regionLabel}まわりの1日プランです（一部は少し移動あり）。`;

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

      {/* スロット（間に移動表示／各スロットに「別の候補に変える」） */}
      <div>
        {slots.map((slot, i) => {
          const vp = VARIANT_PARAM[slot.key];
          const swapHref = buildHref(params, { [vp]: bump(vp) });
          const canSwap = slot.kind !== 'homeplan';
          return (
            <div key={slot.key}>
              {i > 0 && <MoveRow slot={slot} />}
              <SlotCard slot={slot} />
              <div style={{ display: 'flex', gap: 12, padding: '6px 0 4px 4px' }}>
                {canSwap && (
                  <Link
                    href={swapHref}
                    scroll={false}
                    style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-sub)', textDecoration: 'none' }}
                  >
                    ⇄ 別の候補に変える
                  </Link>
                )}
                {slot.key === 'lunch' && (
                  <Link
                    href={buildHref(params, { slot: 'lunch' })}
                    style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-sub)', textDecoration: 'none' }}
                  >
                    お昼だけ一覧で見る →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 1日の動線マップ（P1-6）。3地点＋起点駅を結ぶGoogleマップ経路（APIキー不要）。 */}
      {(() => {
        const points = [
          anchor.stationName ? `${anchor.stationName}駅` : anchor.regionLabel,
          ...slots.map((s) => s.spot?.name).filter((n): n is string => !!n),
        ];
        if (points.length < 2) return null;
        const origin = encodeURIComponent(points[0]);
        const destination = encodeURIComponent(points[points.length - 1]);
        const waypoints = points.slice(1, -1).map(encodeURIComponent).join('|');
        const url =
          `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}` +
          (waypoints ? `&waypoints=${waypoints}` : '') +
          `&travelmode=walking`;
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 16,
              padding: '14px 16px',
              borderRadius: 14,
              border: '1px solid var(--v2-line, #ead9c2)',
              background: 'var(--v2-c-rain-bg, #eef4fb)',
              textDecoration: 'none',
              color: 'var(--ink, #2a2018)',
            }}
          >
            <span style={{ fontSize: 20 }}>🗺</span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 14, fontWeight: 800 }}>1日の動線を地図で見る</span>
              <span style={{ display: 'block', fontSize: 11.5, color: 'var(--ink-sub)' }}>
                {points.join(' → ')}
              </span>
            </span>
            <span style={{ fontSize: 18, color: 'var(--clay-deep)' }}>→</span>
          </a>
        );
      })()}

      {/* お昼の予約CTA（env未設定なら非表示） */}
      {reservationOffer && (
        <div style={{ marginTop: 14 }}>
          <ReservationCTA offer={reservationOffer} />
        </div>
      )}

      {/* 保存 / 別の流れ */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <SavePlanButton label={saveLabel} />
        <Link
          href={rerollHref}
          scroll={false}
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 800,
            padding: '11px',
            borderRadius: 11,
            background: 'var(--ink, #2a2018)',
            color: 'var(--paper, #fbf5e8)',
            textDecoration: 'none',
          }}
        >
          ↻ 別の流れを見る
        </Link>
      </div>

      <p style={{ fontSize: 11.5, color: 'var(--ink-mute)', marginTop: 14, lineHeight: 1.6 }}>
        ※ 各スポットをタップすると詳細（設備・アクセス）が見られます。移動が長い組み合わせは出しません。
      </p>

      {/* P0-2: 雨プランB（折りたたみ。native details なので JS 不要・CLSなし） */}
      {rainPlan && rainPlan.slots.length > 0 && (
        <details className="rain-plan-b" style={{ marginTop: 18 }}>
          <summary
            style={{
              cursor: 'pointer',
              listStyle: 'none',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid var(--v2-line, #ead9c2)',
              background: 'var(--v2-c-rain-bg, #eef4fb)',
              fontSize: 14,
              fontWeight: 800,
              color: 'var(--ink, #2a2018)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            ☔ 雨ならこっち
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-sub)' }}>
              （屋内中心の代替プラン）
            </span>
          </summary>
          <div style={{ padding: '12px 4px 0' }}>
            {rainPlan.slots.map((slot, i) => {
              const label =
                slot.spot?.name ?? slot.plan?.title ?? 'おうちでゆっくり過ごす';
              return (
                <div
                  key={`rain-${slot.key}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 0',
                    borderTop: i > 0 ? '1px solid var(--v2-line, #ead9c2)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-sub)', minWidth: 78 }}>
                    {slot.time} {slot.label}
                  </span>
                  {(slot.href || slot.spotSlug) && slot.kind !== 'homeplan' ? (
                    <Link
                      href={slot.href ?? `/spot/${slot.spotSlug}`}
                      style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', textDecoration: 'none' }}
                    >
                      {slot.icon} {label}
                    </Link>
                  ) : (
                    <span style={{ fontSize: 14, fontWeight: 700 }}>
                      {slot.icon} {label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </details>
      )}

      {/* 別の駅で組み直す導線 */}
      <div style={{ marginTop: 10 }}>
        <Link href="/today" className="meta-chip" style={{ fontSize: 12, textDecoration: 'none' }}>
          ← 別の条件・駅で探す
        </Link>
      </div>
    </section>
  );
}
