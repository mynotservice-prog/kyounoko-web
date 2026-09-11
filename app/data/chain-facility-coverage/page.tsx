import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { CsvDownloadButton } from '../restaurants/CsvDownloadButton';
import {
  COVERAGE_KEY_ORDER,
  COVERAGE_LABELS,
  buildCoverageCsvRows,
  coverageDisplay,
  getAllChainCoverage,
  getCoverageExcluded,
  getCoverageGeneratedAt,
  getCoverageSummary,
  rankByFacility,
  type CoverageKey,
} from '@/lib/chain-coverage';

/**
 * 調査①第1弾: 外食チェーン「子連れ設備カバー率」センサス。
 *
 * 戦略(docs/strategy-2026-09.md §5-1): 公式FAQの「有無」ではなく、公式店舗検索が店舗ごとに
 * 公開する設備属性を全店舗ぶん数え、「店舗による」を率で答える一次データを毎年更新で出す。
 * 要件6点（方法論・セル単位の出典と確認日・再現可能性・CSVと引用フォーマット・図版・更新方針）を
 * すべてこのページに置く。数字は data/chain-coverage.json から自動生成し、本文で手打ちしない。
 */
export const dynamic = 'force-static';
export const revalidate = 86400;

const URL_PATH = '/data/chain-facility-coverage';
const YEAR = getCoverageGeneratedAt().slice(0, 4);
const summary = getCoverageSummary();

export const metadata: Metadata = {
  title: `外食チェーン 子連れ設備カバー率調査${YEAR}｜公式店舗検索${summary.chainCount}チェーン・${summary.storeCount.toLocaleString()}店を全数集計`,
  description:
    `「座敷は店舗による」を率で答える調査。${summary.chainCount}チェーンの公式店舗検索が公開する設備属性を全店舗分集計し、キッズチェア・座敷・おむつ替え台などの設置率をチェーン横断で比較。出典はセル単位で公式URL、CSV配布・年次更新。`,
  alternates: { canonical: URL_PATH },
  openGraph: {
    title: `外食チェーン 子連れ設備カバー率調査${YEAR}`,
    description: `${summary.chainCount}チェーン・${summary.storeCount.toLocaleString()}店の公式店舗検索を全数集計。設備の設置率をチェーン横断で比較。`,
    type: 'article',
    url: `https://kyounoko.jp${URL_PATH}`,
  },
};

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** 引用されやすい1枚の図: 設備別の全体設置率（横棒）。外部CSS不要のインラインSVG */
function CoverageChart({ rows }: { rows: typeof summary.byFacility }) {
  const W = 720;
  const rowH = 30;
  const left = 150;
  const H = rows.length * rowH + 44;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="設備別の設置率" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <text x={left} y={18} fontSize={13} fill="#6b6259">設備の表示がある店舗の割合（公式店舗検索が公開しているチェーンのみ集計）</text>
      {rows.map((r, i) => {
        const y = 32 + i * rowH;
        const w = Math.max(2, (W - left - 90) * r.rate);
        return (
          <g key={r.key}>
            <text x={left - 8} y={y + 19} fontSize={13} textAnchor="end" fill="#2b2622">{COVERAGE_LABELS[r.key]}</text>
            <rect x={left} y={y + 6} width={W - left - 90} height={18} fill="#f3ece2" rx={4} />
            <rect x={left} y={y + 6} width={w} height={18} fill="#c9603e" rx={4} />
            <text x={left + w + 8} y={y + 19} fontSize={12} fill="#2b2622">{pct(r.rate)}（{r.chains}チェーン・{r.stores.toLocaleString()}店）</text>
          </g>
        );
      })}
      <text x={W - 6} y={H - 6} fontSize={11} textAnchor="end" fill="#8a8078">出典: きょうのこ「外食チェーン 子連れ設備カバー率調査{YEAR}」kyounoko.jp{URL_PATH}</text>
    </svg>
  );
}

export default function ChainFacilityCoveragePage() {
  const chains = getAllChainCoverage();
  const excluded = getCoverageExcluded();
  const generatedAt = getCoverageGeneratedAt();
  const rankings = COVERAGE_KEY_ORDER.map((key) => ({ key, rows: rankByFacility(key) })).filter((r) => r.rows.length > 0);
  const chartRows = summary.byFacility.filter((f) => f.chains >= 2).sort((a, b) => b.rate - a.rate);

  const csvHeaders = ['チェーン', '設備', '公式表記', '表示あり店舗数', '数えた店舗数', '設置率', '出典URL', '集計日'];
  const csvRows = buildCoverageCsvRows().map((r) => [r.name, r.label.split('（')[0], r.label.replace(/^.*公式表記: /, '').replace(/）$/, ''), r.count, r.total, pct(r.rate), r.sourceUrl, r.countedAt]);

  const datasetLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `外食チェーン 子連れ設備カバー率調査${YEAR}`,
    description: metadata.description,
    url: `https://kyounoko.jp${URL_PATH}`,
    license: 'https://kyounoko.jp/terms',
    keywords: ['外食チェーン', '子連れ', 'キッズチェア', '座敷', 'おむつ替え台', '授乳室', '設備', '設置率', '調査', '店舗検索'],
    creator: { '@type': 'Organization', name: 'きょうのこ', url: 'https://kyounoko.jp' },
    distribution: [{ '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `https://kyounoko.jp${URL_PATH}` }],
    variableMeasured: summary.byFacility.map((f) => `${COVERAGE_LABELS[f.key]}の表示がある店舗数`),
    temporalCoverage: generatedAt,
    dateModified: generatedAt,
    spatialCoverage: { '@type': 'Place', name: '日本' },
    isAccessibleForFree: true,
    measurementTechnique: '各チェーンの公式店舗検索が店舗ごとに公開する設備属性を全店舗分取得し、設備ごとに表示のある店舗数を数えた（scripts/chain-coverage）',
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: 'データ', item: 'https://kyounoko.jp/data' },
      { '@type': 'ListItem', position: 3, name: '設備カバー率調査', item: `https://kyounoko.jp${URL_PATH}` },
    ],
  };

  const th: React.CSSProperties = { padding: '8px 10px', fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '1px solid var(--line)' };
  const td: React.CSSProperties = { padding: '7px 10px', borderBottom: '1px solid var(--line)', verticalAlign: 'top' };
  const num: React.CSSProperties = { ...td, textAlign: 'right', whiteSpace: 'nowrap' };

  const ChainName = ({ name, slug }: { name: string; slug: string | null }) =>
    slug ? <Link href={`/article/${slug}`} style={{ color: 'var(--clay-deep)', fontWeight: 600, textDecoration: 'none' }}>{name}</Link> : <span>{name}</span>;

  return (
    <>
      <V2Frame header="sub" active="home">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

        <div className="container">
          <nav className="breadcrumb" aria-label="パンくず">
            <Link href="/">HOME</Link>
            <span className="sep">/</span>
            <Link href="/data">データ</Link>
            <span className="sep">/</span>
            <span>設備カバー率調査</span>
          </nav>
        </div>

        <section className="section">
          <div className="container-narrow">
            <header className="page-head" style={{ marginBottom: 24 }}>
              <span className="eyebrow">きょうのこ調査 / 年次更新</span>
              <h1>
                外食チェーン 子連れ設備カバー率調査{YEAR}
                <small style={{ display: 'block', fontSize: '0.5em', fontWeight: 400, color: 'var(--ink-sub)', marginTop: 8 }}>
                  公式店舗検索 {summary.chainCount}チェーン・{summary.storeCount.toLocaleString()}店を全数集計
                </small>
              </h1>
              <p className="lead">
                「座敷は店舗による」「おむつ替え台は一部店舗」——公式サイトのこの一言を、率に直しました。
                各チェーンの<strong>公式店舗検索が店舗ごとに公開している設備表示</strong>を全店舗ぶん数え、
                「表示のある店舗数 ÷ 数えた店舗数」をチェーン横断で並べています。
                数字はすべて公式店舗検索から機械集計したもので、当サイトの推測や訪問印象は含みません。
              </p>
            </header>

            <div className="kn-card" style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: 'var(--clay-deep)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 6 }}>結論（{generatedAt}集計）</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.8 }}>
                {/* 結論は「公開チェーンが多く、チェーン差が大きい」設備から3つ（率100%が並ぶだけの項目は後ろへ） */}
                {[...chartRows]
                  .filter((f) => f.key !== 'parking') // 駐車場は公開チェーンが最多だが、子連れ設備の結論としては後ろに回す
                  .map((f) => {
                    const rows = rankByFacility(f.key);
                    return { f, top: rows[0], bottom: rows[rows.length - 1], spread: rows[0].rate - rows[rows.length - 1].rate };
                  })
                  .sort((a, b) => b.f.chains - a.f.chains || b.spread - a.spread)
                  .slice(0, 3)
                  .map(({ f, top, bottom }) => (
                    <li key={f.key}>
                      <strong>{COVERAGE_LABELS[f.key]}</strong>を公式店舗検索で公開しているのは{f.chains}チェーン・{f.stores.toLocaleString()}店。
                      表示がある店舗は全体で<strong>{pct(f.rate)}</strong>。
                      チェーン差は {top.name} {pct(top.rate)} 〜 {bottom.name} {pct(bottom.rate)}。
                    </li>
                  ))}
                <li>
                  公式店舗検索に子連れ設備の属性を<strong>1つも公開していない</strong>チェーンも多い。設備が無いのではなく「公開していない」なので、このページでは率を出さず、出さなかったチェーンを方法論に明記している。
                </li>
              </ul>
            </div>

            <figure style={{ margin: '0 0 32px' }}>
              <div className="kn-card" style={{ padding: 12 }}>
                <CoverageChart rows={chartRows} />
              </div>
              <figcaption style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 6 }}>
                図1. 設備別の設置率（{summary.chainCount}チェーン・{summary.storeCount.toLocaleString()}店）。画像は出典明記で自由に転載できます。
              </figcaption>
            </figure>

            {rankings.map(({ key, rows }) => (
              <section key={key} id={`facility-${key}`} style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 20, margin: '0 0 6px' }}>{COVERAGE_LABELS[key]}：表示がある店舗の割合（{rows.length}チェーン）</h2>
                <p style={{ fontSize: 12.5, color: 'var(--ink-sub)', margin: '0 0 10px' }}>
                  公式店舗検索の「{[...new Set(rows.map((r) => r.label))].join('」「')}」表示を数えた。公開していないチェーンは載せていない。
                </p>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: 'var(--paper-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)' }}>
                    <thead>
                      <tr>
                        <th style={th}>順位</th>
                        <th style={th}>チェーン</th>
                        <th style={{ ...th, textAlign: 'right' }}>設置率</th>
                        <th style={{ ...th, textAlign: 'right' }}>表示あり / 店舗数</th>
                        <th style={th}>公式表記</th>
                        <th style={th}>出典・確認日</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={r.chain}>
                          <td style={num}>{i + 1}</td>
                          <td style={td}><ChainName name={r.name} slug={r.koryakuSlug} /></td>
                          <td style={{ ...num, fontWeight: 700, color: 'var(--clay-deep)' }}>{pct(r.rate)}</td>
                          <td style={num}>{r.count.toLocaleString()} / {r.total.toLocaleString()}</td>
                          <td style={td}>{r.label}</td>
                          <td style={{ ...td, fontSize: 12 }}>
                            <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer">公式店舗検索</a>
                            <span style={{ color: 'var(--ink-mute)' }}>（{r.countedAt}）</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}

            <section id="all-chains" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, margin: '0 0 6px' }}>チェーン別一覧（公開している設備だけ）</h2>
              <p style={{ fontSize: 12.5, color: 'var(--ink-sub)', margin: '0 0 10px' }}>
                「—」は公式店舗検索がその設備を属性として公開していないことを表す（設備が無いという意味ではない）。
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, background: 'var(--paper-card)', border: '1px solid var(--line)' }}>
                  <thead>
                    <tr>
                      <th style={th}>チェーン</th>
                      <th style={{ ...th, textAlign: 'right' }}>店舗数</th>
                      {summary.byFacility.map((f) => <th key={f.key} style={{ ...th, textAlign: 'right' }}>{COVERAGE_LABELS[f.key]}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {chains.map((c) => {
                      const d = coverageDisplay(c);
                      return (
                        <tr key={c.chain}>
                          <td style={td}><ChainName name={d.name} slug={d.koryakuSlug} /></td>
                          <td style={num}>{c.total.toLocaleString()}</td>
                          {summary.byFacility.map((f) => {
                            const v = c.facilities[f.key as CoverageKey];
                            return <td key={f.key} style={num}>{v ? pct(v.count / c.total) : <span style={{ color: 'var(--ink-mute)' }}>—</span>}</td>;
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 12 }}>
                <CsvDownloadButton filename={`kyounoko-chain-facility-coverage-${YEAR}.csv`} headers={csvHeaders} rows={csvRows} label="CSVをダウンロード（チェーン×設備、出典URLつき）" />
              </div>
            </section>

            <section id="method" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, margin: '0 0 10px' }}>調査方法</h2>
              <dl style={{ fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                <dt style={{ fontWeight: 600 }}>対象</dt>
                <dd style={{ margin: '0 0 10px' }}>当サイトが攻略記事を持つ外食チェーンのうち、公式店舗検索が店舗ごとの設備属性（アイコン・設備欄・絞り込み条件）を公開している{summary.chainCount}チェーン、計{summary.storeCount.toLocaleString()}店。</dd>
                <dt style={{ fontWeight: 600 }}>集計方法</dt>
                <dd style={{ margin: '0 0 10px' }}>各チェーンの公式店舗検索から全店舗の店舗情報を取得し、設備ごとに「表示のある店舗数」を数えた。分母はその時点で取得できた店舗数で、公式が公表する店舗数と差がある場合は各チェーンの注記に記載。設備の名称はチェーンごとに異なるため、公式表記を各表に併記している。</dd>
                <dt style={{ fontWeight: 600 }}>除外基準</dt>
                <dd style={{ margin: '0 0 10px' }}>
                  公式店舗検索がその設備を属性として持たないチェーン・設備は集計しない（写真・本文・当サイト記事からの推測で補わない）。公式FAQに「全店で用意」とあっても、店舗検索に属性が無ければこの調査には載らない。
                  また、項目自体は存在するのに全店舗が未入力のチェーン（共通システムを使う運営会社で起こる）は、「0%」ではなく「未入力」として集計から外す。店舗検索に別業態が同居する場合は、そのチェーンの店舗だけを数える（内訳は各チェーンの注記）。
                </dd>
                <dt style={{ fontWeight: 600 }}>再現性</dt>
                <dd style={{ margin: '0 0 10px' }}>集計はチェーンごとの取得スクリプトで機械的に行い、店舗単位の生データ（店舗名と表示のあった設備）を保持している。数字の出し方に手作業の判断は入っていない。</dd>
                <dt style={{ fontWeight: 600 }}>集計日・更新方針</dt>
                <dd style={{ margin: 0 }}>{generatedAt}集計。年1回（毎年9月）に全チェーンを再集計し、このURLのまま更新する。チェーンが店舗検索の仕様を変えた場合は、その項目を「公開停止」として扱う。</dd>
              </dl>
              {excluded.length > 0 && (
                <details style={{ marginTop: 12, fontSize: 13 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600 }}>確認したが集計に載せなかったチェーン（{excluded.length}）</summary>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.7 }}>
                    {excluded.map((e) => (
                      <li key={e.chain}><strong>{e.name}</strong>（<a href={e.locator} target="_blank" rel="noopener noreferrer">公式店舗検索</a>）: {e.reason}</li>
                    ))}
                  </ul>
                </details>
              )}
              {chains.some((c) => c.note) && (
                <details style={{ marginTop: 12, fontSize: 13 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600 }}>チェーンごとの注記</summary>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.7 }}>
                    {chains.filter((c) => c.note).map((c) => <li key={c.chain}><strong>{coverageDisplay(c).name}</strong>: {c.note}</li>)}
                  </ul>
                </details>
              )}
            </section>

            <section id="cite" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, margin: '0 0 10px' }}>引用について</h2>
              <p style={{ fontSize: 14, lineHeight: 1.8, margin: '0 0 8px' }}>
                表・図・CSVは、出典を明記すれば報道・ブログ・自治体資料・チェーン公式での利用を含め自由に転載できます。事前連絡やリンクは不要です。
              </p>
              <pre style={{ background: 'var(--paper-card)', border: '1px solid var(--line)', borderRadius: 8, padding: 12, fontSize: 12.5, whiteSpace: 'pre-wrap', margin: 0 }}>
出典: きょうのこ「外食チェーン 子連れ設備カバー率調査{YEAR}」https://kyounoko.jp{URL_PATH}（{generatedAt}集計）
              </pre>
              <p style={{ fontSize: 12.5, color: 'var(--ink-mute)', margin: '8px 0 0' }}>
                数字の誤りに気づいた方は<Link href="/contact">修正依頼</Link>へ。公式店舗検索の表示が変わっていれば再集計します。
              </p>
            </section>
          </div>
        </section>
      </V2Frame>
    </>
  );
}
