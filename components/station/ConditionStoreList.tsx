import Link from 'next/link';
import { COND_SOURCE_LABEL, type ConditionStores, type CondStore, type OtherStore } from '@/lib/station-cond-stores';
import { hotpepperShopHref } from '@/lib/reservation-cta';

/**
 * 駅×条件ページの店の一覧（店単位・根拠つき。2026-10-28・Phase 2）。
 * 駅に近い順に「駅前／徒歩圏／少し歩く」の3段で出し、店ごとに根拠の段を書く。
 * 設計: docs/station-cond-rebuild-2026-10.md §4〜§5
 */
const BANDS: { key: CondStore['band']; title: string; note: string }[] = [
  { key: '駅前', title: '駅前', note: '駅から直線300m以内' },
  { key: '徒歩圏', title: '徒歩圏', note: '直線800m以内・大人の足で徒歩10分前後' },
  { key: '少し歩く', title: '少し歩く', note: '直線800m〜1km・子連れだと15〜20分ほど' },
];

function StoreCard({ s }: { s: CondStore }) {
  const link = (() => {
    if (!s.url) return null;
    if (s.kind === 'indie') {
      const { href, affiliate } = hotpepperShopHref(s.url);
      return { href, rel: affiliate ? 'sponsored noopener' : 'nofollow noopener', label: 'ホットペッパーで店舗情報を見る' };
    }
    return { href: s.url, rel: 'noopener noreferrer', label: '公式の店舗ページ' };
  })();
  return (
    <article
      style={{
        background: 'var(--paper-card)',
        border: '1px solid rgba(201,96,62,0.16)',
        borderRadius: 12,
        padding: '14px 16px',
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>{s.name}</h3>
      <p style={{ fontSize: 12.5, color: 'var(--ink-mute)', margin: '4px 0 0', lineHeight: 1.6 }}>
        {[s.genre, s.m !== undefined ? `駅から直線約${s.m}m` : null, s.address].filter(Boolean).join('・')}
      </p>
      <p style={{ fontSize: 12.5, color: 'var(--ink-sub)', margin: '6px 0 0', lineHeight: 1.6 }}>
        <span
          style={{
            display: 'inline-block',
            background: s.source === 'listing' ? '#FFF3E0' : '#E3F2FD',
            color: s.source === 'listing' ? '#8A4B00' : '#1565C0',
            padding: '2px 8px',
            borderRadius: 999,
            fontSize: 11.5,
            marginRight: 6,
          }}
        >
          {COND_SOURCE_LABEL[s.source]}
        </span>
        {s.evidence}
      </p>
      {link && (
        <p style={{ margin: '8px 0 0', fontSize: 13, fontWeight: 700 }}>
          <a href={link.href} target="_blank" rel={link.rel} style={{ color: 'var(--clay-deep)' }}>
            {link.label} →
          </a>
        </p>
      )}
    </article>
  );
}

export function ConditionStoreList({
  cs,
  conditionLabel,
  stationName,
  stationSlug,
  others,
}: {
  cs: ConditionStores;
  conditionLabel: string;
  stationName: string;
  stationSlug: string;
  /** 条件に合う店が少ない面で出す、この駅の近くのほかの実在店（getOtherVerifiedStores） */
  others?: { stores: OtherStore[]; total: number };
}) {
  const listed = cs.stores.length;
  const unlisted = cs.within1000 - listed;
  return (
    <section style={{ marginBottom: 36 }}>
      {listed > 0 && (
      <p style={{ fontSize: 12.5, color: 'var(--ink-mute)', lineHeight: 1.7, margin: '0 0 16px' }}>
        {stationName}駅から直線1km以内で、{conditionLabel}に当てはまると確かめられた店です。チェーン店は各チェーンの公式店舗検索で実在を確認した店、
        個人店はホットペッパーグルメで「お子様連れ歓迎・ランチあり」と掲載されている店です。店ごとに、何で確かめたか（根拠）を書いています。
        書かれていない設備は「無い」という意味ではありません。営業状況や設備は、行く前に各店のページでご確認ください。
      </p>
      )}
      {BANDS.map((b) => {
        const list = cs.stores.filter((s) => s.band === b.key);
        if (list.length === 0) return null;
        return (
          <div key={b.key} style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 20, margin: '0 0 4px' }}>
              {b.title} <span style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 400 }}>{list.length}店</span>
            </h2>
            <p style={{ fontSize: 12, color: 'var(--ink-mute)', margin: '0 0 12px' }}>{b.note}</p>
            <div style={{ display: 'grid', gap: 12 }}>
              {list.map((s) => (
                <StoreCard key={s.key} s={s} />
              ))}
            </div>
          </div>
        );
      })}
      {unlisted > 0 && (
        <p style={{ fontSize: 12.5, color: 'var(--ink-mute)', margin: '0 0 8px' }}>
          ほかに、同じチェーンの店が{unlisted}店あります（1チェーン5店まで載せています。各チェーンの公式店舗検索でご確認ください）。
        </p>
      )}
      {others && others.stores.length > 0 && (
        <div style={{ margin: '8px 0 28px', paddingTop: 20, borderTop: '2px dashed rgba(201,96,62,0.18)' }}>
          <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 20, margin: '0 0 4px' }}>
            {conditionLabel}以外なら、{stationName}駅の近くにこんなお店があります
          </h2>
          <p style={{ fontSize: 12.5, color: 'var(--ink-mute)', margin: '0 0 12px', lineHeight: 1.7 }}>
            各チェーンの公式店舗検索で、駅から直線800m以内に実在を確認した店です（{others.total}店のうち、席で食べるお店を先に{others.stores.length}店）。
            設備は店によって違うので、行く前に各店の公式ページでご確認ください。
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            {others.stores.map((o) => (
              <li
                key={o.key}
                style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 14, padding: '8px 0', borderBottom: '1px solid rgba(201,96,62,0.10)' }}
              >
                <span>
                  {o.url ? (
                    <a href={o.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', fontWeight: 600 }}>
                      {o.name}
                    </a>
                  ) : (
                    <strong>{o.name}</strong>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--ink-mute)', marginLeft: 6 }}>{o.category}</span>
                </span>
                <span style={{ fontSize: 12, color: 'var(--ink-mute)', whiteSpace: 'nowrap' }}>
                  {o.m !== undefined ? `直線約${o.m}m` : o.band}
                </span>
              </li>
            ))}
          </ul>
          <p style={{ margin: '10px 0 0', fontSize: 13, fontWeight: 700 }}>
            <Link href={`/station/${stationSlug}`} style={{ color: 'var(--clay-deep)' }}>
              {stationName}駅の子連れOKのお店をすべて見る →
            </Link>
          </p>
        </div>
      )}
      {cs.stores.some((s) => s.kind === 'indie') && (
        <p style={{ margin: '12px 0 0', fontSize: 11, color: 'var(--ink-mute)', textAlign: 'right' }}>
          <a href="http://webservice.recruit.co.jp/" target="_blank" rel="nofollow noopener" style={{ color: 'inherit' }}>
            Powered by ホットペッパーグルメ Webサービス
          </a>
        </p>
      )}
    </section>
  );
}
