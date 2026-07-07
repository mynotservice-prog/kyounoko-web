import Link from 'next/link';
import {
  FACILITY_LABELS,
  type ChainFacilities,
  type FacilityKey,
} from '@/lib/chain-facilities';

/**
 * チェーン×子連れ設備の判定ボックス（lib/chain-facilities.ts からの自動生成）。
 *
 * 従来は各記事md内の手書き表だったが、単一データソース駆動に置き換えることで
 * 記事間の不整合・鮮度切れを構造的に無くす（戦略§7: 外出前のGO/NO-GO判定を
 * 1画面目で完結させる）。最終確認日・確認手段・公式サイトへの一次リンク・
 * 修正依頼導線を必ず添える（E-E-A-T）。
 */
export function ChainFacilitiesBox({
  chain,
  anchorId,
}: {
  chain: ChainFacilities;
  /** 置き換え前のmd見出しのid（目次アンカーを生かすため引き継ぐ） */
  anchorId?: string;
}) {
  const keys = Object.keys(FACILITY_LABELS) as FacilityKey[];
  const verified = formatYm(chain.verifiedAt);

  return (
    <section
      id={anchorId}
      aria-label={`${chain.name}の子連れ判定ボックス`}
      style={{
        background: 'var(--paper-card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 18px 14px',
        margin: '28px 0 32px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <h2
          style={{
            fontFamily: 'var(--font-mincho)',
            fontSize: 17,
            fontWeight: 600,
            margin: 0,
          }}
        >
          🪧 {chain.name}の子連れチェックリスト
        </h2>
        <span style={{ fontSize: 11.5, color: 'var(--ink-mute)' }}>
          最終確認: {verified}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '6px 14px',
        }}
      >
        {keys.map((k) => {
          const v = chain.items[k];
          if (!v) return null;
          const mark = v.ok === true ? '✓' : v.ok === 'partial' ? '△' : '—';
          const markColor =
            v.ok === true
              ? 'var(--clay-deep)'
              : v.ok === 'partial'
                ? 'var(--ink-sub)'
                : 'var(--ink-mute)';
          return (
            <div
              key={k}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 6,
                fontSize: 13,
                lineHeight: 1.6,
                padding: '4px 0',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <span
                aria-hidden="true"
                style={{ color: markColor, fontWeight: 700, flexShrink: 0 }}
              >
                {mark}
              </span>
              <span style={{ color: v.ok === false ? 'var(--ink-mute)' : 'var(--ink)' }}>
                {FACILITY_LABELS[k]}
                {v.note && (
                  <span style={{ fontSize: 11, color: 'var(--ink-mute)' }}>（{v.note}）</span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {chain.extras && chain.extras.length > 0 && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {chain.extras.map((e) => (
            <div key={e.label} style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--ink-sub)' }}>
              <strong style={{ fontWeight: 600, color: 'var(--ink)' }}>{e.label}:</strong>{' '}
              {e.value}
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: 11.5, color: 'var(--ink-mute)', margin: '12px 0 0', lineHeight: 1.7 }}>
        ※ 店舗により異なる場合があります。{chain.verifiedMethod}。
        {chain.officialUrl ? (
          <>
            <a href={chain.officialUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
              公式サイト
            </a>
            で最新情報をご確認ください。
          </>
        ) : (
          '最新情報は公式サイトでご確認ください。'
        )}
        誤りに気づいた方は
        <Link href="/contact" style={{ color: 'inherit' }}>
          修正依頼
        </Link>
        へ。
      </p>
    </section>
  );
}

function formatYm(iso: string): string {
  const [y, m] = iso.split('-');
  return `${y}年${Number(m)}月`;
}
