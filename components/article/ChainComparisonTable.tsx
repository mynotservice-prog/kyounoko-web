import Link from 'next/link';
import {
  FACILITY_LABELS,
  getAllChainFacilities,
  type FacilityKey,
} from '@/lib/chain-facilities';

/**
 * チェーン横断の設備比較表（lib/chain-facilities.ts からの自動生成）。
 *
 * 比較ハブ記事（離乳食持ち込み一覧・ベビーチェアまとめ等）の表を
 * 単一データソース駆動にするためのコンポーネント。frontmatter
 * `chainComparison: <FacilityKey>` を指定した記事に描画される。
 * 各行から攻略記事へ内部リンクし、ハブ→個別のクラスタ導線も兼ねる。
 */
export function ChainComparisonTable({ focus }: { focus: FacilityKey }) {
  const rank = (ok: boolean | 'partial') => (ok === true ? 0 : ok === 'partial' ? 1 : 2);
  const chains = getAllChainFacilities()
    .filter((c) => c.items[focus])
    .sort((a, b) => {
      const d = rank(a.items[focus]!.ok) - rank(b.items[focus]!.ok);
      return d !== 0 ? d : a.name.localeCompare(b.name, 'ja');
    });
  if (chains.length === 0) return null;

  const label = FACILITY_LABELS[focus];

  return (
    <section aria-label={`チェーン別 ${label} 比較表`} style={{ margin: '28px 0 32px' }}>
      <h2
        style={{
          fontFamily: 'var(--font-mincho)',
          fontSize: 18,
          fontWeight: 600,
          margin: '0 0 4px',
        }}
      >
        チェーン別「{label}」早見表【全{chains.length}チェーン】
      </h2>
      <p style={{ fontSize: 12, color: 'var(--ink-mute)', margin: '0 0 12px' }}>
        ✓=あり / △=店舗・条件による / —=基本なし。チェーン名から詳細記事へ飛べます。
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 13,
            lineHeight: 1.6,
            background: 'var(--paper-card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>チェーン</th>
              <th style={{ padding: '10px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>補足</th>
            </tr>
          </thead>
          <tbody>
            {chains.map((c) => {
              const v = c.items[focus]!;
              const mark = v.ok === true ? '✓' : v.ok === 'partial' ? '△' : '—';
              return (
                <tr key={c.key} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '8px 12px' }}>
                    <Link
                      href={`/article/${c.koryakuSlug}`}
                      style={{ color: 'var(--clay-deep)', textDecoration: 'none', fontWeight: 600 }}
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td
                    style={{
                      padding: '8px 12px',
                      fontWeight: 700,
                      color:
                        v.ok === true
                          ? 'var(--clay-deep)'
                          : v.ok === 'partial'
                            ? 'var(--ink-sub)'
                            : 'var(--ink-mute)',
                    }}
                  >
                    {mark}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 12, color: 'var(--ink-sub)' }}>
                    {v.note ?? ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11.5, color: 'var(--ink-mute)', margin: '10px 0 0', lineHeight: 1.7 }}>
        ※ 店舗により異なる場合があります。編集部調査(実訪問・公式サイト照合)の集約。誤りに気づいた方は
        <Link href="/contact" style={{ color: 'inherit' }}>
          修正依頼
        </Link>
        へ。
      </p>
    </section>
  );
}
