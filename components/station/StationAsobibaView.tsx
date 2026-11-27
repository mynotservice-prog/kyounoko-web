import Link from 'next/link';
import {
  ASOBIBA_KIND_LABEL,
  type AsobibaBand,
  type AsobibaFacility,
  type StationAsobiba,
} from '@/lib/station-asobiba';
import type { FaqItem } from '@/lib/station-faq';
import type { CondStore } from '@/lib/station-cond-stores';

/**
 * 駅×子供の遊び場（台帳型・実験47）。駅に近い順に、公式で確かめた施設だけを出す。
 * 設計: ~/.claude/company/reports/2026-11-27/kyounoko-station-asobiba.md（社内）
 */
const BANDS: { key: AsobibaBand; title: string; note: string }[] = [
  { key: '駅前', title: '駅前', note: '駅から直線300m以内' },
  { key: '徒歩圏', title: '徒歩圏', note: '直線800m以内・大人の足で徒歩10分前後' },
  { key: '少し歩く', title: '少し歩く', note: '直線800m〜1.2km・子連れだと15〜25分ほど' },
];

const chip = (bg: string, fg: string) => ({
  display: 'inline-block',
  background: bg,
  color: fg,
  padding: '2px 8px',
  borderRadius: 999,
  fontSize: 11.5,
  lineHeight: 1.6,
});
const OFFICIAL = chip('#E3F2FD', '#1565C0');
const NEUTRAL = chip('rgba(201,96,62,0.08)', 'var(--clay-deep)');

const placeLabel = (p: AsobibaFacility['place']) => (p === 'indoor' ? '屋内' : p === 'outdoor' ? '屋外' : '屋内と屋外');
// 料金: 公式に無料とあれば「無料」、有料なら公式の料金の要約、記載が無ければそう書く（無料と推測しない）
const feeLabel = (f: AsobibaFacility) =>
  f.fee.free === true ? '無料' : f.fee.free === false ? f.fee.text ?? '有料' : '料金は公式に記載なし';
const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return y && m && d ? `${y}年${m}月${d}日` : iso;
};

function FacilityCard({ f }: { f: AsobibaFacility }) {
  const facts: string[] = [];
  if (f.nursingRoom === true) facts.push('授乳室');
  if (f.diaperChange === true) facts.push('おむつ替え');
  if (f.strollerOk === true) facts.push('ベビーカー可');
  if (f.directFromStation === true) facts.push('駅直結');
  return (
    <article
      style={{
        background: 'var(--paper-card)',
        border: '1px solid rgba(201,96,62,0.16)',
        borderRadius: 12,
        padding: '14px 16px',
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>{f.name}</h3>
      <p style={{ fontSize: 12.5, color: 'var(--ink-mute)', margin: '4px 0 0', lineHeight: 1.6 }}>
        {ASOBIBA_KIND_LABEL[f.kind]}・{placeLabel(f.place)}・{f.address}
      </p>
      <p style={{ fontSize: 13.5, color: 'var(--ink)', margin: '8px 0 0', lineHeight: 1.6 }}>
        駅から直線約{f.m}m・<strong>子連れで約{f.walkKids}分</strong>
        <span style={{ color: 'var(--ink-mute)', fontSize: 12.5 }}>（大人の足で約{f.walkAdult}分）</span>
      </p>
      {f.accessOfficial && (
        <p style={{ fontSize: 12.5, color: 'var(--ink-sub)', margin: '2px 0 0', lineHeight: 1.6 }}>公式のアクセス: {f.accessOfficial}</p>
      )}
      <p style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '8px 0 0' }}>
        <span style={NEUTRAL}>{feeLabel(f)}</span>
        {f.ages && <span style={NEUTRAL}>対象: {f.ages}</span>}
        {facts.map((x) => (
          <span key={x} style={OFFICIAL} title="施設の公式に記載がある項目">
            {x}（公式）
          </span>
        ))}
      </p>
      {(f.hours || f.closed) && (
        <p style={{ fontSize: 12.5, color: 'var(--ink-sub)', margin: '8px 0 0', lineHeight: 1.6 }}>
          {[f.hours && `時間: ${f.hours}`, f.closed && `休み: ${f.closed}`].filter(Boolean).join('／')}
        </p>
      )}
      {f.notes && <p style={{ fontSize: 12.5, color: 'var(--clay)', margin: '6px 0 0', lineHeight: 1.6 }}>注意: {f.notes}</p>}
      <p style={{ margin: '8px 0 0', fontSize: 13, fontWeight: 700, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
        <a href={f.officialUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--clay-deep)' }}>
          公式ページ →
        </a>
        {f.spotSlug && (
          <Link href={`/spot/${f.spotSlug}`} style={{ color: 'var(--clay-deep)' }}>
            きょうのこの施設ページ →
          </Link>
        )}
      </p>
      <p style={{ fontSize: 11, color: 'var(--ink-mute)', margin: '6px 0 0' }}>公式で確認: {fmtDate(f.verifiedAt)}</p>
    </article>
  );
}

export function StationAsobibaView({
  stationName,
  stationSlug,
  wardName,
  a,
  faq,
  lunch,
  lunchHref,
  otherStations,
}: {
  stationName: string;
  stationSlug: string;
  wardName: string;
  a: StationAsobiba;
  faq: FaqItem[];
  /** 同じ駅で、公式などで確かめた子連れ向けの店（キッズメニューの面から・駅に近い順） */
  lunch: CondStore[];
  /** 子連れランチの条件ページ（配信しているときだけ） */
  lunchHref: string | null;
  otherStations: { slug: string; name: string; total: number }[];
}) {
  const c = a.counts;
  return (
    <>
      <header className="page-head">
        <span className="eyebrow">{wardName} · {stationName}駅 / 子供の遊び場</span>
        <h1>
          {stationName}駅周辺の子供の遊び場 {c.total}か所
          <small style={{ display: 'block', fontSize: '0.5em', fontWeight: 400, color: 'var(--ink-sub)', marginTop: 8 }}>
            駅から近い順・区や施設の公式で確かめた施設だけ（{fmtDate(a.verifiedAt)}確認）
          </small>
        </h1>
        <p className="lead">
          {stationName}駅から直線1.2km以内で、区・都・施設の公式で1件ずつ確かめた子供の遊び場は{c.total}か所です。
          うち公式に無料とあるのが{c.free}か所、屋内が{c.indoor}か所、授乳室の記載があるのが{c.nursingRoom}か所。
          施設ごとに、駅から子連れで歩いたときの目安の時間を出しています。
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          <span className="meta-chip clay">1.2km以内 {c.total}か所</span>
          {c.within800 > 0 && <span className="meta-chip clay">800m以内 {c.within800}か所</span>}
          {c.free > 0 && <span className="meta-chip clay">無料 {c.free}</span>}
          {c.indoor > 0 && <span className="meta-chip clay">屋内 {c.indoor}</span>}
          {c.nursingRoom > 0 && <span className="meta-chip clay">授乳室の記載 {c.nursingRoom}</span>}
        </div>
      </header>

      <section style={{ margin: '28px 0 36px' }}>
        <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 20, margin: '0 0 10px' }}>一覧（駅から近い順）</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid rgba(201,96,62,0.25)' }}>
                <th scope="col" style={{ padding: '6px 8px' }}>施設</th>
                <th scope="col" style={{ padding: '6px 8px' }}>種類</th>
                <th scope="col" style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>子連れで</th>
                <th scope="col" style={{ padding: '6px 8px' }}>料金</th>
                <th scope="col" style={{ padding: '6px 8px' }}>授乳室</th>
              </tr>
            </thead>
            <tbody>
              {a.facilities.map((f) => (
                <tr key={f.name} style={{ borderBottom: '1px solid rgba(201,96,62,0.10)' }}>
                  <th scope="row" style={{ padding: '6px 8px', fontWeight: 600, textAlign: 'left' }}>{f.name}</th>
                  <td style={{ padding: '6px 8px' }}>{ASOBIBA_KIND_LABEL[f.kind]}（{placeLabel(f.place)}）</td>
                  <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>約{f.walkKids}分（{f.m}m）</td>
                  <td style={{ padding: '6px 8px' }}>{f.fee.free === true ? '無料' : f.fee.free === false ? '有料' : '—'}</td>
                  <td style={{ padding: '6px 8px' }}>{f.nursingRoom === true ? 'あり（公式）' : f.nursingRoom === false ? 'なし（公式）' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink-mute)', lineHeight: 1.7, margin: '8px 0 0' }}>
          「—」は公式に記載が見つからなかった項目で、無いという意味ではありません。
        </p>
      </section>

      {BANDS.map((b) => {
        const list = a.facilities.filter((f) => f.band === b.key);
        if (list.length === 0) return null;
        return (
          <section key={b.key} style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 20, margin: '0 0 4px' }}>
              {b.title} <span style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 400 }}>{list.length}か所</span>
            </h2>
            <p style={{ fontSize: 12, color: 'var(--ink-mute)', margin: '0 0 12px' }}>{b.note}</p>
            <div style={{ display: 'grid', gap: 12 }}>
              {list.map((f) => (
                <FacilityCard key={f.name} f={f} />
              ))}
            </div>
          </section>
        );
      })}

      {lunch.length > 0 && (
        <section style={{ margin: '8px 0 32px', paddingTop: 20, borderTop: '2px dashed rgba(201,96,62,0.18)' }}>
          <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 20, margin: '0 0 4px' }}>遊んだあとに、{stationName}駅の近くで食べる</h2>
          <p style={{ fontSize: 12.5, color: 'var(--ink-mute)', margin: '0 0 12px', lineHeight: 1.7 }}>
            駅から直線1km以内で、お子様メニューがあると確かめられた店です（チェーンは公式店舗検索、個人店はホットペッパーの店の掲載）。
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            {lunch.map((s) => (
              <li
                key={s.key}
                style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 14, padding: '8px 0', borderBottom: '1px solid rgba(201,96,62,0.10)' }}
              >
                <span>
                  <strong>{s.name}</strong>
                  {s.genre && <span style={{ fontSize: 12, color: 'var(--ink-mute)', marginLeft: 6 }}>{s.genre}</span>}
                </span>
                <span style={{ fontSize: 12, color: 'var(--ink-mute)', whiteSpace: 'nowrap' }}>{s.m !== undefined ? `直線約${s.m}m` : s.band}</span>
              </li>
            ))}
          </ul>
          <p style={{ margin: '10px 0 0', fontSize: 13, fontWeight: 700, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {lunchHref && (
              <Link href={lunchHref} style={{ color: 'var(--clay-deep)' }}>
                お子様メニューのある店をすべて見る →
              </Link>
            )}
            <Link href={`/station/${stationSlug}`} style={{ color: 'var(--clay-deep)' }}>
              {stationName}駅の子連れOKの店 →
            </Link>
          </p>
        </section>
      )}

      {faq.length > 0 && (
        <section style={{ margin: '8px 0 32px' }}>
          <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 20, margin: '0 0 12px' }}>よくある質問</h2>
          {faq.map((q) => (
            <div key={q.question} style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>{q.question}</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-sub)', lineHeight: 1.8, margin: 0 }}>{q.answer}</p>
            </div>
          ))}
        </section>
      )}

      <section style={{ margin: '8px 0 32px', padding: '14px 16px', background: 'var(--paper-card)', borderRadius: 10, border: '1px solid rgba(201,96,62,0.16)' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px' }}>このページの調べ方</h2>
        <p style={{ fontSize: 12.5, color: 'var(--ink-sub)', lineHeight: 1.8, margin: 0 }}>
          区・都の公式の施設一覧（児童館・公園・図書館など）と、施設・商業施設の公式ページで、1件ずつ所在地・料金・対象・設備を確かめました。
          口コミサイトやまとめ記事の情報は使っていません。閉館・長期休館中の施設は載せていません。
          距離は駅の中心からの直線距離です。子連れの時間は、道のりを直線の1.3倍として分速60m（大人は分速80m）で割った目安で、
          改札や出口、信号、エレベーターの位置で変わります。休館日や時間は変わることがあるので、行く前に各施設の公式ページでご確認ください。
        </p>
      </section>

      {otherStations.length > 0 && (
        <section style={{ margin: '8px 0 32px' }}>
          <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, margin: '0 0 10px' }}>ほかの駅の子供の遊び場</h2>
          <div className="stv3-rows two">
            {otherStations.map((o) => (
              <Link key={o.slug} href={`/station/${o.slug}/asobiba`} className="stv3-row">
                <span className="stv3-row-body">
                  <span className="stv3-row-title">{o.name}駅</span>
                </span>
                <span className="stv3-row-meta">{o.total}か所</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
