import { filterSpots, type Spot, type AgeTag, type KidReport, SPOT_CATEGORY_LABEL } from '@/lib/spots';
import { getAreaName } from '@/lib/area';
import { KkIcon } from '@/components/kk/KkIcon';
import { KkArt, type KkArtName } from '@/components/kk/KkArt';

// 子連れ向け施設情報の表示ラベル。すべての施設で統一表示する。
// アイコンは絵文字を使わず、社長支給のイラスト（KkArt）で描く（2026-09-11）。
const FACILITY_LABELS: { key: keyof NonNullable<Spot['facilities']>; label: string; icon: KkArtName }[] = [
  { key: 'bathroom', label: '多目的トイレ', icon: 'accessible-toilet' },
  { key: 'diaperChange', label: 'おむつ替え', icon: 'diaper' },
  { key: 'nursingRoom', label: '授乳室', icon: 'nursing' },
  { key: 'kidsSpace', label: 'キッズスペース', icon: 'kids-space' },
  { key: 'strollerRental', label: 'ベビーカー貸出', icon: 'stroller' },
];

type Props = {
  area?: string;
  age?: AgeTag;
  place?: 'indoor' | 'outdoor';
  budget?: 'free' | 'low' | 'mid' | 'high';
  limit?: number;
  heading?: string;
};

/**
 * エリアに紐づく具体スポットを表示するカード一覧。
 * Plan/記事ページで「area が絞られているとき」に描画する。
 */
export function SpotList({
  area,
  age,
  place,
  budget,
  limit = 5,
  heading,
}: Props) {
  if (!area || area === 'all') return null;
  const spots = filterSpots(area, { age, place, budget, limit });
  if (spots.length === 0) return null;

  const areaName = getAreaName(area);
  const title = heading ?? `${areaName}のおすすめスポット`;

  return (
    <section style={{ marginTop: 40 }}>
      <h2
        style={{
          fontFamily: 'var(--font-mincho)',
          fontWeight: 600,
          fontSize: 22,
          margin: '0 0 8px',
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: 12, color: 'var(--ink-mute)', margin: '0 0 20px' }}>
        0〜6歳の子連れで人気の定番スポット。最新情報は各公式サイトでご確認ください。
      </p>
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        }}
      >
        {spots.map((s) => (
          <SpotCard key={s.name} spot={s} />
        ))}
      </div>
    </section>
  );
}

function SpotCard({ spot }: { spot: Spot }) {
  const budgetLabel =
    spot.budget === 'free' ? '入園無料' :
    spot.budget === 'low' ? '〜1,500円目安' :
    spot.budget === 'mid' ? '〜3,000円目安' :
    spot.budget === 'high' ? '3,000円以上' : '';

  const placeLabel =
    spot.place === 'indoor' ? '屋内' :
    spot.place === 'outdoor' ? '屋外' :
    '屋内外';

  const reservationLabel =
    spot.reservation === 'required' ? '要予約' :
    spot.reservation === 'recommended' ? '予約推奨' :
    '';

  const weekdayCrowd = spot.crowdLevel?.weekday;
  const holidayCrowd = spot.crowdLevel?.holiday;

  // スポット名と都市で Google Maps を検索する外部リンクにする。
  // 公式サイトURLが Spot 型に未実装のため、Google Maps への遷移で実用性を担保。
  const mapsQuery = encodeURIComponent(
    [spot.name, spot.city, spot.ward].filter(Boolean).join(' '),
  );
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  return (
    <article
      style={{
        // 2026-09-11: 丸角カードをやめ、罫線で区切る（サイト全体のデザイン方針）
        background: 'transparent',
        border: 0,
        borderTop: '1px solid var(--kk-rule-soft, #E7E2DA)',
        borderRadius: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
    <a
      href={mapsHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${spot.name} を Google Maps で開く`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '14px 16px',
        color: 'inherit',
        textDecoration: 'none',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 10, letterSpacing: '.08em' }}>
        <span
          style={{
            padding: '2px 8px',
            background: 'transparent', border: '1px solid var(--kk-rule, #D8D2C7)',
            color: 'var(--sage-deep)',
            borderRadius: 999,
            fontWeight: 600,
          }}
        >
          {SPOT_CATEGORY_LABEL[spot.category]}
        </span>
        <span style={{ padding: '2px 8px', background: 'transparent', border: '1px solid var(--kk-orange, #EE7A2E)', color: 'var(--kk-orange-deep, #C95F18)', borderRadius: 999 }}>
          {placeLabel}
        </span>
        {budgetLabel && !spot.pricing && (
          <span style={{ padding: '2px 8px', background: 'transparent', border: '1px solid var(--kk-rule, #D8D2C7)', color: 'var(--ink-sub)', borderRadius: 999 }}>
            {budgetLabel}
          </span>
        )}
        {reservationLabel && (
          <span
            style={{
              padding: '2px 8px',
              background: 'transparent', border: '1px solid var(--kk-rule, #D8D2C7)',
              color: spot.reservation === 'required' ? '#c4704f' : 'var(--ink-sub)',
              borderRadius: 999,
              fontWeight: 600,
            }}
          >
            {reservationLabel}
          </span>
        )}
      </div>

      <h3
        style={{
          fontFamily: 'var(--font-mincho)',
          fontSize: 16,
          fontWeight: 600,
          margin: 0,
          lineHeight: 1.45,
        }}
      >
        {spot.name}
      </h3>

      {spot.city && (
        <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
          {spot.city}・対象 {spot.ages.join('/')}歳
        </div>
      )}

      {spot.note && (
        <p style={{ fontSize: 13, color: 'var(--ink-sub)', margin: 0, lineHeight: 1.6 }}>
          {spot.note}
        </p>
      )}

      {/* 料金（年齢別）詳細 */}
      {spot.pricing && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '2px 10px',
            fontSize: 11,
            background: 'transparent',
            padding: '8px 0',
            borderTop: '1px solid var(--kk-rule-soft, #E7E2DA)',
            borderBottom: '1px solid var(--kk-rule-soft, #E7E2DA)',
            borderRadius: 0,
          }}
        >
          {spot.pricing.adult && (
            <><span style={{ color: 'var(--ink-mute)' }}>大人</span><span>{spot.pricing.adult}</span></>
          )}
          {spot.pricing.elementary && (
            <><span style={{ color: 'var(--ink-mute)' }}>小中</span><span>{spot.pricing.elementary}</span></>
          )}
          {spot.pricing.preschool && (
            <><span style={{ color: 'var(--ink-mute)' }}>幼児</span><span>{spot.pricing.preschool}</span></>
          )}
          {spot.pricing.infant && (
            <><span style={{ color: 'var(--ink-mute)' }}>未満</span><span>{spot.pricing.infant}</span></>
          )}
        </div>
      )}

      {/* 混雑傾向 */}
      {(weekdayCrowd || holidayCrowd) && (
        <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--ink-sub)' }}>
          {weekdayCrowd && <span>平日 {crowdIcon(weekdayCrowd)}</span>}
          {holidayCrowd && <span>休日 {crowdIcon(holidayCrowd)}</span>}
        </div>
      )}

      {/* 穴場ポイント（Instagramで一番ウケる情報） */}
      {spot.hiddenTip && (
        <div
          style={{
            background: 'transparent',
            borderLeft: 0,
            padding: '2px 0',
            fontSize: 11,
            color: 'var(--ink)',
            lineHeight: 1.6,
            borderRadius: 0,
          }}
        >
          <strong style={{ color: '#c4704f', fontSize: 10, letterSpacing: '.08em' }}>穴場ポイント</strong>
          <br />
          {spot.hiddenTip}
        </div>
      )}

      {/* 近隣セット提案 */}
      {spot.nearby && (
        <div style={{ fontSize: 11, color: 'var(--sage-deep)', lineHeight: 1.5, display: 'flex', gap: 4, alignItems: 'flex-start' }}>
          <KkIcon name="arrow-right" size={12} style={{ marginTop: 3, flex: 'none' }} />
          <span>{spot.nearby}</span>
        </div>
      )}

      {/* 子連れ向け施設情報（全施設に統一表示）。未確認項目は公式サイト確認を促す */}
      <FacilitiesBlock facilities={spot.facilities} />

      {/* 運営者の一次情報レポート（実際に子連れで訪問して記録した実体験） */}
      {spot.kidReport && <KidReportBlock report={spot.kidReport} />}
      <span style={{ marginTop: 4, fontSize: 11, color: 'var(--sage-deep)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <KkIcon name="pin" size={13} />
        Google Mapsで開く
      </span>
    </a>
    </article>
  );
}

/**
 * 子連れで訪問する前に必ず確認したい設備情報を統一表示するブロック。
 * - すべての施設カードに表示する（情報の有無に関わらず）
 * - 確認済み: あり / なし（状態ピル。絵文字は使わない）
 * - 未確認: △ 公式で確認 とする（嘘の情報を載せない）
 */
function FacilitiesBlock({ facilities }: { facilities?: Spot['facilities'] }) {
  const note = facilities?.note;
  return (
    <div
      style={{
        marginTop: 4,
        background: 'transparent',
        border: 0,
        borderTop: '1px solid var(--kk-rule-soft, #E7E2DA)',
        borderRadius: 0,
        padding: '10px 0 0',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '.05em',
          color: 'var(--sage-deep)',
          marginBottom: 6,
        }}
      >
        子連れ向け設備
      </div>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3px 8px',
          fontSize: 11,
          lineHeight: 1.4,
        }}
      >
        {FACILITY_LABELS.map(({ key, label, icon }) => {
          const v = facilities?.[key];
          const mark =
            v === 'yes' ? { sym: 'あり', cls: 'kk-pill yes' } :
            v === 'no'  ? { sym: 'なし', cls: 'kk-pill no' } :
            { sym: '△', cls: '' };
          return (
            <li key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ink-sub)' }}>
              <KkArt name={icon} size={18} style={{ flex: 'none' }} />
              <span style={{ flex: 1 }}>{label}</span>
              <span
                className={mark.cls || undefined}
                style={mark.cls ? { fontSize: 10.5, padding: '1px 7px' } : { color: 'var(--ink-mute)', fontWeight: 600 }}
                title={v ? '' : '未確認 - 公式サイトでご確認ください'}
              >
                {mark.sym}
              </span>
            </li>
          );
        })}
      </ul>
      {note && (
        <p style={{ margin: '6px 0 0', fontSize: 10.5, color: 'var(--ink-mute)', lineHeight: 1.5 }}>
          ※ {note}
        </p>
      )}
      <p style={{ margin: '6px 0 0', fontSize: 10, color: 'var(--ink-mute)', lineHeight: 1.4 }}>
        △ は未確認。最新は公式サイトでご確認ください。
      </p>
    </div>
  );
}

/**
 * 運営者が実際に子連れで訪問して記録した一次情報レポート。
 * 「運営者が訪問して確認」バッジで、公開情報の寄せ集めではない実体験であることを明示する。
 */
function KidReportBlock({ report }: { report: KidReport }) {
  // 覚えていない項目は見出しごと出さない（KidReport の各項目は任意）
  const rows: { label: string; value: string }[] = (
    [
      { label: '行った年齢', value: report.visitAge },
      { label: 'ベビーカー動線', value: report.strollerNote },
      { label: '土日の混雑・狙い目', value: report.crowdNote },
      { label: 'おむつ替え・授乳', value: report.diaperNote },
      { label: '滞在時間の目安', value: report.stayNote },
      { label: 'ヒヤッとした点・注意', value: report.cautionNote },
    ] as { label: string; value?: string }[]
  ).filter((r): r is { label: string; value: string } => Boolean(r.value));
  return (
    <div
      style={{
        marginTop: 4,
        background: 'transparent',
        border: 0,
        borderTop: '1px solid var(--kk-rule-soft, #E7E2DA)',
        borderRadius: 0,
        padding: '10px 0 0',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '.03em',
          color: 'var(--kk-orange-deep, #C95F18)',
          background: 'transparent',
          border: '1px solid var(--kk-orange, #EE7A2E)',
          padding: '2px 8px',
          borderRadius: 999,
          marginBottom: 8,
        }}
      >
        <KkIcon name="check" size={12} sw={2.2} />
        運営者が実際に子連れで訪問して確認
      </div>
      <dl style={{ margin: 0, display: 'grid', gap: 6 }}>
        {rows.map((r) => (
          <div key={r.label}>
            <dt
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#c4704f',
                letterSpacing: '.03em',
                marginBottom: 1,
              }}
            >
              {r.label}
            </dt>
            <dd style={{ margin: 0, fontSize: 11.5, color: 'var(--ink-sub)', lineHeight: 1.65 }}>
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function crowdIcon(level: 'low' | 'mid' | 'high'): string {
  // 以前は緑・黄・赤の丸の絵文字を前置していた。絵文字は使わない方針なので文言だけにする。
  return level === 'low' ? '空いてる' : level === 'mid' ? '普通' : '混雑';
}
