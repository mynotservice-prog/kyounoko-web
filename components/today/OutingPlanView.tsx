/**
 * 「今日の流れ（おでかけ1日プラン）」表示（リニューアル 2026-09 第3版 / docs §3-4）。
 * lib/outing-plan.ts の buildOutingPlan() の結果を「一本の縦タイムライン」で描画する。
 * /today で ?station= / ?ward= が指定されたときに通常のAnswerCardの代わりにヒーロー表示する。
 *
 * 構成（社長指示の順序）:
 *   見出し＋条件 → タイムライン（左にオレンジの細い縦線と時刻／右にスポット）
 *   → 1日の動線を地図で見る（独立した横長導線）→ ネット予約PR（十分な余白＋PR表記）
 *   → 保存(主)/別の流れ(副) → 雨ならこっち（軽く）→ 別の条件・駅で探す
 *
 * 表示の規律:
 * - 絵文字は使わない。記号はすべて KkIcon（線画・墨1色）。
 * - スポットを丸角カードにしない。移動情報はカードにせず、スポットとスポットの間に置く。
 * - 設備バッジは実データ（Spot.facilities の yes/no と お昼の facets）だけから作る。捏造しない。
 * - 写真は spot データに既にあるときだけ出す（新規に作らない）。
 * CSS は app/styles/today-v3.css（.today-v3 配下）。
 */
import Link from 'next/link';
import type { OutingPlan, OutingSlot } from '@/lib/outing-plan';
import { spotToSlug, type Spot } from '@/lib/spots';
import { ReservationCTA } from '@/components/article/ReservationCTA';
import { getSpotReservationOffer } from '@/lib/reservation-cta';
import { KkIcon, type KkIconName } from '@/components/kk/KkIcon';
import { SavePlanButton } from './SavePlanButton';
import { optimizedImgAttrs } from '@/lib/img-optimize';

function spotFacets(s: Spot): string[] {
  const f: string[] = [];
  if (s.babyChair) f.push('ベビーチェア');
  if (s.kidsMenu) f.push('キッズメニュー');
  if (s.strollerAccess) f.push('ベビーカーOK');
  if (s.babyFood) f.push('離乳食OK');
  return f;
}

/** お昼 facets 文言 → アイコン */
const FACET_ICON: Record<string, KkIconName> = {
  ベビーチェア: 'baby-chair',
  キッズメニュー: 'kids-menu',
  ベビーカーOK: 'stroller',
  離乳食OK: 'baby',
};

/** 天気ラベル → アイコン（labelForValue の文言に対応） */
const WEATHER_ICON: Record<string, KkIconName> = {
  晴れ: 'sunny',
  くもり: 'cloudy',
  雨: 'rain',
  猛暑: 'hot',
  寒い: 'cold',
};

/** Spot.facilities → 表示バッジ（yes/no のみ。undefined は出さない） */
const FACILITY_DEFS: { key: keyof NonNullable<Spot['facilities']>; label: string; icon: KkIconName }[] = [
  { key: 'nursingRoom', label: '授乳室', icon: 'nursing' },
  { key: 'diaperChange', label: 'おむつ替え台', icon: 'diaper' },
  { key: 'bathroom', label: '多目的トイレ', icon: 'accessible-toilet' },
  { key: 'strollerRental', label: 'ベビーカー貸出', icon: 'stroller' },
  { key: 'kidsSpace', label: 'キッズスペース', icon: 'kids-space' },
];

function facilityBadges(s?: Spot): { label: string; icon: KkIconName; status: 'yes' | 'no' }[] {
  const f = s?.facilities;
  if (!f) return [];
  const out: { label: string; icon: KkIconName; status: 'yes' | 'no' }[] = [];
  for (const d of FACILITY_DEFS) {
    const v = f[d.key];
    if (v === 'yes' || v === 'no') out.push({ label: d.label, icon: d.icon, status: v });
  }
  return out;
}

/** spot データに既にある写真（images[0] → 後方互換の image）。無ければ null。 */
function spotPhoto(s?: Spot): string | null {
  return s?.images?.[0] ?? s?.image ?? null;
}

function FacetChips({ facets }: { facets: string[] }) {
  if (!facets.length) return null;
  return (
    <div className="td3-facs">
      {facets.map((f) => (
        <span key={f} className="td3-fac kk-pill text">
          <KkIcon name={FACET_ICON[f] ?? 'check'} size={14} />
          {f}
        </span>
      ))}
    </div>
  );
}

/** 設備（Spot.facilities の yes/no のみ）。行程表の中では箱にせず、共通の kk-pill 1行で。 */
function FacilityTiles({ spot }: { spot?: Spot }) {
  const badges = facilityBadges(spot);
  if (!badges.length) return null;
  return (
    <div className="td3-facs td3-facs-fac">
      {badges.map((b) => (
        <span key={b.label} className={'td3-fac kk-pill ' + b.status}>
          <KkIcon name={b.icon} size={14} />
          {b.label}
          <span className="td3-fac-st">{b.status === 'yes' ? 'あり' : 'なし'}</span>
        </span>
      ))}
    </div>
  );
}

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

function slotHref(slot: OutingSlot): string | undefined {
  if ((slot.href || slot.spotSlug) && slot.kind !== 'homeplan') return slot.href ?? `/spot/${slot.spotSlug}`;
  if (slot.kind === 'homeplan' && slot.plan) return `/plan/${slot.plan.id}`;
  return undefined;
}

/** 移動（スポットとスポットの間）。カードにしない＝歩行アイコン＋距離・所要時間の1行。 */
function MoveRow({ slot }: { slot: OutingSlot }) {
  if (!slot.move) return null;
  const icon: KkIconName = slot.move.tier === 'home' ? 'home' : 'walk';
  return (
    <div className="td3-move">
      <span className="td3-move-ico">
        <KkIcon name={icon} size={16} />
      </span>
      <span className="td3-move-text">{slot.move.text}</span>
    </div>
  );
}

function SlotCard({ slot }: { slot: OutingSlot }) {
  const title = slot.spot?.name ?? slot.plan?.title ?? 'おうちでゆっくり過ごす';
  const meta =
    slot.kind === 'restaurant'
      ? slot.spot?.note ?? '子連れOKのお店'
      : slot.kind === 'homeplan'
        ? slot.plan?.shortAnswer ?? 'お昼寝・休憩タイム。おうちで軽く遊ぶ'
        : slot.spot?.note ?? '';
  const href = slotHref(slot);
  const photo = spotPhoto(slot.spot);

  return (
    <div className={'td3-slot ' + slot.key}>
      <span className="td3-slotlab">
        <KkIcon name={slot.icon as KkIconName} size={14} />
        {slot.label}
      </span>
      {href ? (
        <Link href={href} className="td3-slot-name">
          {title}
          <KkIcon name="chevron-right" size={16} className="td3-slot-chev" />
        </Link>
      ) : (
        <span className="td3-slot-name">{title}</span>
      )}
      {photo && (
        <span className="td3-slot-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img {...optimizedImgAttrs(photo)} alt="" loading="lazy" decoding="async" />
        </span>
      )}
      {meta && <p className="td3-slot-desc">{meta}</p>}
      {slot.facets && slot.facets.length > 0 && <FacetChips facets={slot.facets} />}
      {slot.kind !== 'homeplan' && <FacilityTiles spot={slot.spot} />}
    </div>
  );
}

/** 個人店の1行（/spot ページが無いので駅ページの個人店セクションへ）。 */
function IndieRow({ s, href }: { s: Spot; href?: string }) {
  const facets = spotFacets(s);
  const body = (
    <>
      <span className="kk-row-body">
        <span className="kk-row-title">{s.name}</span>
        {s.city && (
          <span className="kk-row-sub td3-row-walk">
            <KkIcon name="walk" size={13} />
            {s.city}
          </span>
        )}
        {s.note && <span className="kk-row-sub">{s.note}</span>}
        <FacetChips facets={facets} />
      </span>
      {href && (
        <span className="kk-row-arrow">
          <KkIcon name="arrow-right" size={16} />
        </span>
      )}
    </>
  );
  if (!href) return <div className="kk-row">{body}</div>;
  return (
    <Link href={href} className="kk-row">
      {body}
    </Link>
  );
}

/** お昼スロット単体ビュー（?slot=lunch）: 子連れで入れる店一覧。 */
function RestaurantRow({ s }: { s: Spot }) {
  const facets = spotFacets(s);
  return (
    <Link href={`/spot/${spotToSlug(s, 'tokyo')}`} className="kk-row">
      <span className="kk-row-body">
        <span className="kk-row-title">{s.name}</span>
        {s.note && <span className="kk-row-sub">{s.note}</span>}
        <FacetChips facets={facets} />
      </span>
      <span className="kk-row-arrow">
        <KkIcon name="arrow-right" size={16} />
      </span>
    </Link>
  );
}

/** 見出し下の条件表示（駅・年齢・天気）。 */
function CondRow({
  anchorLabel,
  ageLabel,
  weatherLabel,
}: {
  anchorLabel: string;
  ageLabel?: string;
  weatherLabel?: string;
}) {
  return (
    <div className="kk-chips td3-cond">
      <span className="kk-chip">
        <KkIcon name="station" size={14} />
        {anchorLabel}
      </span>
      {ageLabel && (
        <span className="kk-chip">
          <KkIcon name="child" size={14} />
          {ageLabel}
        </span>
      )}
      {weatherLabel && (
        <span className="kk-chip">
          <KkIcon name={WEATHER_ICON[weatherLabel] ?? 'cloudy'} size={14} />
          {weatherLabel}
        </span>
      )}
    </div>
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
    <section className="td3-wrap td3-lunch">
      <div className="td3-head">
        <h1 className="td3-h1">子連れで入れるお店</h1>
        <CondRow anchorLabel={anchorLabel} ageLabel={ageLabel} />
      </div>
      <p className="td3-lead">ベビーチェア・キッズメニュー・座敷など、子連れで入りやすいお店です。</p>

      {indies.length > 0 && (
        <>
          <div className="td3-sublab">駅近の個人店・人気店</div>
          <div className="kk-rows">
            {indies.slice(0, 8).map((s) => (
              <IndieRow key={s.name} s={s} href={indieHref} />
            ))}
          </div>
          {indieHref && (
            <p className="td3-morelink">
              <Link href={indieHref}>
                この駅の個人店をぜんぶ見る
                <KkIcon name="arrow-right" size={15} sw={2} />
              </Link>
            </p>
          )}
        </>
      )}

      {wardRest.length > 0 && (
        <>
          <div className="td3-sublab">{wardName}のお店</div>
          <div className="kk-rows">
            {wardRest.slice(0, 12).map((s) => (
              <RestaurantRow key={s.name} s={s} />
            ))}
          </div>
        </>
      )}

      {chain.length > 0 && (
        <>
          <div className="td3-sublab">どの駅でも入りやすいファミリー向けチェーン</div>
          <div className="kk-rows">
            {chain.slice(0, 8).map((s) => (
              <RestaurantRow key={s.name} s={s} />
            ))}
          </div>
        </>
      )}

      {offer && (
        <div className="td3-pr">
          <div className="td3-pr-lab">
            <span className="pr-label">PR</span>
            <span>広告を含みます</span>
          </div>
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

  // 1日の動線マップ（P1-6）。3地点＋起点駅を結ぶGoogleマップ経路（APIキー不要）。
  const points = [
    anchor.stationName ? `${anchor.stationName}駅` : anchor.regionLabel,
    ...slots.map((s) => s.spot?.name).filter((n): n is string => !!n),
  ];
  let mapUrl: string | null = null;
  if (points.length >= 2) {
    const origin = encodeURIComponent(points[0]);
    const destination = encodeURIComponent(points[points.length - 1]);
    const waypoints = points.slice(1, -1).map(encodeURIComponent).join('|');
    mapUrl =
      `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}` +
      (waypoints ? `&waypoints=${waypoints}` : '') +
      `&travelmode=walking`;
  }

  return (
    <section className="td3-wrap td3-plan">
      {/* ヘッダ：アンカーと条件 */}
      <div className="td3-head">
        <h1 className="td3-h1">今日の流れ</h1>
        <CondRow anchorLabel={anchorLabel} ageLabel={ageLabel} weatherLabel={weatherLabel} />
      </div>
      <p className="td3-lead">{lead}</p>

      {/* 一本の縦タイムライン（左にオレンジの細い縦線と時刻、間に移動、各スロットに小さな別候補） */}
      <ol className="td3-tl">
        {slots.map((slot, i) => {
          const vp = VARIANT_PARAM[slot.key];
          const swapHref = buildHref(params, { [vp]: bump(vp) });
          const canSwap = slot.kind !== 'homeplan';
          return (
            <li key={slot.key} className={'td3-tl-item ' + slot.key}>
              {i > 0 && <MoveRow slot={slot} />}
              <div className="td3-tl-row">
                <div className="td3-tl-time">
                  <span className="td3-tl-clock">{slot.time}</span>
                  <span className="td3-tl-dot" aria-hidden="true" />
                </div>
                <div className="td3-tl-body">
                  <SlotCard slot={slot} />
                  {(canSwap || slot.key === 'lunch') && (
                    <div className="td3-acts">
                      {canSwap && (
                        <Link href={swapHref} scroll={false} className="td3-act">
                          <KkIcon name="swap" size={14} />
                          別の候補に変える
                        </Link>
                      )}
                      {slot.key === 'lunch' && (
                        <Link href={buildHref(params, { slot: 'lunch' })} className="td3-act">
                          お昼だけ一覧で見る
                          <KkIcon name="arrow-right" size={14} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* タイムライン直後の独立導線（機能CTAなので薄い背景を使う） */}
      {mapUrl && (
        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="td3-map">
          <span className="td3-map-ico">
            <KkIcon name="map" size={24} sw={1.6} />
          </span>
          <span className="td3-map-body">
            <span className="td3-map-title">1日の動線を地図で見る</span>
            <span className="td3-map-route">
              {points.map((p, i) => (
                <span key={`${p}-${i}`} className="td3-map-pt">
                  {i > 0 && <KkIcon name="chevron-right" size={12} sw={2} />}
                  {p}
                </span>
              ))}
            </span>
          </span>
          <span className="td3-map-arrow">
            <KkIcon name="arrow-right" size={18} sw={2} />
          </span>
        </a>
      )}

      {/* お昼の予約PR（プラン本体と十分な余白を空け、PR表記を明確に。env未設定なら非表示） */}
      {reservationOffer && (
        <div className="td3-pr">
          <div className="td3-pr-lab">
            <span className="pr-label">PR</span>
            <span>広告を含みます</span>
          </div>
          <ReservationCTA offer={reservationOffer} />
        </div>
      )}

      {/* 保存（主）/ 別の流れ（副）。同格にしない。 */}
      <div className="td3-btns">
        <SavePlanButton
          label={saveLabel}
          sub={slots
            .map((s) => s.spot?.name ?? s.plan?.title)
            .filter(Boolean)
            .join(' → ')}
        />
        <Link href={rerollHref} scroll={false} className="kk-btn outline td3-reroll">
          <KkIcon name="refresh" size={16} />
          別の流れを見る
        </Link>
      </div>

      {/* 雨ならこっち（残すが強くしない：雨アイコン＋短い説明＋矢印） */}
      {rainPlan && rainPlan.slots.length > 0 && (
        <details className="rain-plan-b td3-rain">
          <summary className="td3-rain-sum">
            <span className="td3-rain-ico">
              <KkIcon name="umbrella" size={18} />
            </span>
            <span className="td3-rain-title">雨ならこっち</span>
            <span className="td3-rain-sub">（屋内中心の代替プラン）</span>
            <span className="td3-rain-arrow" aria-hidden="true">
              <KkIcon name="chevron-down" size={16} />
            </span>
          </summary>
          <div className="td3-rain-list">
            {rainPlan.slots.map((slot) => {
              const label = slot.spot?.name ?? slot.plan?.title ?? 'おうちでゆっくり過ごす';
              const href = (slot.href || slot.spotSlug) && slot.kind !== 'homeplan' ? slot.href ?? `/spot/${slot.spotSlug}` : undefined;
              return (
                <div key={`rain-${slot.key}`} className="td3-rain-row">
                  <span className="td3-rain-time">
                    {slot.time} {slot.label}
                  </span>
                  {href ? (
                    <Link href={href} className="td3-rain-name">
                      <KkIcon name={slot.icon as KkIconName} size={14} />
                      {label}
                    </Link>
                  ) : (
                    <span className="td3-rain-name">
                      <KkIcon name={slot.icon as KkIconName} size={14} />
                      {label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </details>
      )}

      <p className="td3-note">
        ※ 各スポットをタップすると詳細（設備・アクセス）が見られます。移動が長い組み合わせは出しません。
      </p>

      {/* 別の駅で組み直す導線 */}
      <div className="td3-backrow">
        <Link href="/today" className="td3-back">
          <KkIcon name="search" size={16} />
          別の条件・駅で探す
        </Link>
      </div>
    </section>
  );
}
