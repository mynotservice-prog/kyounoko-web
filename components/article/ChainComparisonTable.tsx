import Link from 'next/link';
import {
  FACILITY_LABELS,
  getAllChainFacilities,
  type ChainFacilities,
  type FacilityKey,
} from '@/lib/chain-facilities';

/**
 * チェーン横断の設備比較表（lib/chain-facilities.ts からの自動生成）。
 *
 * 比較ハブ記事（離乳食持ち込み一覧・ベビーチェアまとめ等）の表を
 * 単一データソース駆動にするためのコンポーネント。frontmatter
 * `chainComparison: <FacilityKey>` を指定した記事に描画される。
 * 各行から攻略記事へ内部リンクし、ハブ→個別のクラスタ導線も兼ねる。
 *
 * 2026-10-24: データの種類で3つに分けた。
 *   1. 公式ページの記載（✓/△/—）… チェーン同士を同じ条件で並べられるもの
 *   2. 公式店舗検索の全店集計（n／total店）… 母数・集計日・表示名がチェーンごとに違うので別表
 *   3. 公式に記載のないチェーン … 表に入れず名前だけ
 */
const cellStyle = { padding: '8px 12px' } as const;
const nameCellStyle = { padding: '8px 12px', whiteSpace: 'nowrap' } as const;
const ymd = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return `${y}年${m}月${day}日`;
};
const thStyle = { padding: '10px 12px', fontWeight: 600 } as const;
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
  lineHeight: 1.6,
  background: 'var(--paper-card)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius-md)',
} as const;

function ChainLink({ c }: { c: ChainFacilities }) {
  return (
    <Link
      href={`/article/${c.koryakuSlug}`}
      style={{ color: 'var(--clay-deep)', textDecoration: 'none', fontWeight: 600 }}
    >
      {c.name}
    </Link>
  );
}

export function ChainComparisonTable({ focus }: { focus: FacilityKey }) {
  const rank = (ok: boolean | 'partial' | 'unknown') => (ok === true ? 0 : ok === 'partial' ? 1 : 2);
  const byName = (a: ChainFacilities, b: ChainFacilities) => a.name.localeCompare(b.name, 'ja');
  const withFocus = getAllChainFacilities().filter((c) => c.items[focus]);
  const isCounted = (c: ChainFacilities) =>
    c.items[focus]!.stores !== undefined && c.items[focus]!.storesTotal !== undefined;

  const official = withFocus
    .filter((c) => c.items[focus]!.ok !== 'unknown' && !isCounted(c))
    .sort((a, b) => {
      const d = rank(a.items[focus]!.ok) - rank(b.items[focus]!.ok);
      return d !== 0 ? d : byName(a, b);
    });
  const counted = withFocus.filter(isCounted).sort(byName);
  const unknownChains = withFocus.filter((c) => c.items[focus]!.ok === 'unknown').sort(byName);
  if (official.length + counted.length === 0) return null;

  const label = FACILITY_LABELS[focus];

  return (
    <section aria-label={`チェーン別 ${label} 比較表`} style={{ margin: '28px 0 32px' }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 800,
          margin: '0 0 4px',
        }}
      >
        チェーン別「{label}」早見表【公式情報のある{official.length + counted.length}チェーン】
      </h2>

      {official.length > 0 && (
        <>
          <p style={{ fontSize: 12, color: 'var(--ink-mute)', margin: '0 0 12px' }}>
            公式サイトの記載：✓=公式にあり / △=公式が店舗・条件によると明記 / —=公式になしと明記。チェーン名から詳細記事へ飛べます。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
                  <th style={thStyle}>チェーン</th>
                  <th style={{ ...thStyle, width: '4.5em' }}>{label}</th>
                  <th style={thStyle}>公式の記載</th>
                </tr>
              </thead>
              <tbody>
                {official.map((c) => {
                  const v = c.items[focus]!;
                  return (
                    <tr key={c.key} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={nameCellStyle}>
                        <ChainLink c={c} />
                      </td>
                      <td
                        style={{
                          ...cellStyle,
                          fontWeight: 700,
                          color:
                            v.ok === true
                              ? 'var(--clay-deep)'
                              : v.ok === 'partial'
                                ? 'var(--ink-sub)'
                                : 'var(--ink-mute)',
                        }}
                      >
                        {v.ok === true ? '✓' : v.ok === 'partial' ? '△' : '—'}
                      </td>
                      <td style={{ ...cellStyle, fontSize: 12, color: 'var(--ink-sub)' }}>
                        {v.note ?? ''}
                        {v.verifiedAt && `（${ymd(v.verifiedAt)}確認）`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {counted.length > 0 && (
        <>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '20px 0 4px' }}>
            公式店舗検索の全店集計があるチェーン
          </h3>
          <p style={{ fontSize: 12, color: 'var(--ink-mute)', margin: '0 0 12px', lineHeight: 1.7 }}>
            各チェーンの公式店舗検索で、{label}にあたる表示がある店を数えた結果です。表示の名前・数えた店舗数・集計日はチェーンごとに違うので、チェーン同士の優劣の比較には使えません。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
                  <th style={thStyle}>チェーン</th>
                  <th style={{ ...thStyle, whiteSpace: 'nowrap' }}>表示のある店</th>
                  <th style={thStyle}>公式店舗検索の表示名・集計日</th>
                </tr>
              </thead>
              <tbody>
                {counted.map((c) => {
                  const v = c.items[focus]!;
                  const shownAs = v.note?.match(/「([^」]+)」/)?.[1];
                  return (
                    <tr key={c.key} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={nameCellStyle}>
                        <ChainLink c={c} />
                      </td>
                      <td style={{ ...cellStyle, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {v.stores!.toLocaleString()}／{v.storesTotal!.toLocaleString()}店
                      </td>
                      <td style={{ ...cellStyle, fontSize: 12, color: 'var(--ink-sub)' }}>
                        {shownAs ? `「${shownAs}」` : ''}
                        {v.verifiedAt && `（${ymd(v.verifiedAt)}集計）`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {unknownChains.length > 0 && (
        <p style={{ fontSize: 12, color: 'var(--ink-sub)', margin: '12px 0 0', lineHeight: 1.7 }}>
          公式情報では{label}を確認できなかったチェーン（公式サイト・公式店舗検索に記載なし。店舗へ確認）：
          {unknownChains.map((c, i) => (
            <span key={c.key}>
              {i > 0 && '・'}
              <Link href={`/article/${c.koryakuSlug}`} style={{ color: 'inherit' }}>
                {c.name}
              </Link>
            </span>
          ))}
        </p>
      )}
      <p style={{ fontSize: 11.5, color: 'var(--ink-mute)', margin: '10px 0 0', lineHeight: 1.7 }}>
        ※ 店舗により異なる場合があります。公式サイト・公式店舗検索の照合の集約（項目ごとの確認日は各チェーンの攻略記事を参照）。誤りに気づいた方は
        <Link href="/contact" style={{ color: 'inherit' }}>
          修正依頼
        </Link>
        へ。
      </p>
    </section>
  );
}
