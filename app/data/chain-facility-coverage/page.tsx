import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { CsvDownloadButton } from '../restaurants/CsvDownloadButton';
import { mayLinkToFrozen } from '@/lib/auto-internal-links';
import {
  COVERAGE_HISTORY,
  COVERAGE_LABELS,
  KIDS_COVERAGE_KEYS,
  buildCoverageCsvRows,
  coverageDisplay,
  formatRate,
  getAllChainCoverage,
  getChainsWithoutKidsAttributes,
  getCoverageExcluded,
  getCoverageFigureRows,
  getCoverageGeneratedAt,
  getCoverageHeadline,
  getCoveragePeriod,
  getCoverageSummary,
  getFacilityStats,
  rankByFacility,
  type CoverageKey,
  type FacilityStat,
} from '@/lib/chain-coverage';

/**
 * 調査①第1弾: 外食チェーン「子連れ設備カバー率」センサス。
 *
 * 戦略(docs/strategy-2026-09.md §5-1): 公式FAQの「有無」ではなく、公式店舗検索が店舗ごとに
 * 公開する設備属性を全店舗ぶん数え、「店舗による」を率で答える一次データを毎年更新で出す。
 * 要件6点（方法論・セル単位の出典と確認日・再現可能性・CSVと引用フォーマット・図版・更新方針）を
 * すべてこのページに置く。数字は data/chain-coverage.json から自動生成し、本文で手打ちしない。
 *
 * 設備を合算した「総合スコア」は作らない（公開している設備がチェーンごとに違い、重みの根拠も無いため。
 * 理由は方法論にも書いている）。比較は設備ごとに、その設備を公開しているチェーンだけを母数にする。
 */
export const dynamic = 'force-static';
export const revalidate = 86400;

const URL_PATH = '/data/chain-facility-coverage';
/** このページの初回公開日。凍結面へのリンク可否（mayLinkToFrozen）の判定に使う */
const PAGE_PUBLISHED_AT = '2026-09-11';
const YEAR = getCoverageGeneratedAt().slice(0, 4);
const TITLE = `外食チェーン 子連れ設備カバー率調査${YEAR}`;
const summary = getCoverageSummary();
const headline = getCoverageHeadline();
const pct = formatRate;

/** 結論の1文（見出し・description・引用例で同じ文を使う） */
function headlineSentence(h: FacilityStat): string {
  return `公式店舗検索で${COVERAGE_LABELS[h.key]}の有無を公開している外食チェーンは${summary.chainCount}チェーン中${h.chains}社。その${h.chains}社の計${h.stores.toLocaleString()}店のうち、表示がある店舗は${h.count.toLocaleString()}店（${pct(h.rate)}）`;
}

export const metadata: Metadata = {
  title: `${TITLE}｜公式店舗検索${summary.chainCount}チェーン・${summary.storeCount.toLocaleString()}店を全数集計`,
  description:
    (headline ? `${headlineSentence(headline)}。` : '') +
    `${summary.chainCount}チェーンの公式店舗検索が公開する設備属性を全店舗分集計し、キッズチェア・おむつ替え台・座敷などの設置率を設備ごとに比較。出典はセル単位で公式URL、CSV配布・年次更新。`,
  alternates: { canonical: URL_PATH },
  openGraph: {
    title: TITLE,
    description: headline
      ? `${headlineSentence(headline)}。${summary.chainCount}チェーン・${summary.storeCount.toLocaleString()}店の公式店舗検索を全数集計。`
      : `${summary.chainCount}チェーン・${summary.storeCount.toLocaleString()}店の公式店舗検索を全数集計。設備の設置率をチェーン横断で比較。`,
    type: 'article',
    url: `https://kyounoko.jp${URL_PATH}`,
  },
};

/** 引用されやすい1枚の図: 設備別の全体設置率（横棒）。OGP画像と同じ行（getCoverageFigureRows） */
function CoverageChart({ rows }: { rows: ReturnType<typeof getCoverageFigureRows> }) {
  const W = 720;
  const rowH = 30;
  const left = 150;
  const H = rows.length * rowH + 44;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="設備別の設置率" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <text x={left} y={18} fontSize={13} fill="#6b6259">設備の表示がある店舗の割合（その設備を公式店舗検索で公開しているチェーンのみ集計）</text>
      {rows.map((r, i) => {
        const y = 32 + i * rowH;
        const w = Math.max(2, (W - left - 90) * r.rate);
        return (
          <g key={r.key}>
            <text x={left - 8} y={y + 19} fontSize={13} textAnchor="end" fill="#2b2622">{COVERAGE_LABELS[r.key]}</text>
            <rect x={left} y={y + 6} width={W - left - 90} height={18} fill="#f3ece2" rx={4} />
            <rect x={left} y={y + 6} width={w} height={18} fill={r.key === headline?.key ? '#c9603e' : '#dd9a80'} rx={4} />
            <text x={left + w + 8} y={y + 19} fontSize={12} fill="#2b2622">{pct(r.rate)}（{r.chains}チェーン・{r.stores.toLocaleString()}店）</text>
          </g>
        );
      })}
      <text x={W - 6} y={H - 6} fontSize={11} textAnchor="end" fill="#8a8078">出典: きょうのこ「{TITLE}」kyounoko.jp{URL_PATH}</text>
    </svg>
  );
}

export default function ChainFacilityCoveragePage() {
  const chains = getAllChainCoverage();
  const excluded = getCoverageExcluded();
  const generatedAt = getCoverageGeneratedAt();
  const period = getCoveragePeriod();
  const stats = getFacilityStats();
  const statByKey = new Map(stats.map((s) => [s.key, s]));
  const rankings = stats.map((s) => ({ key: s.key, rows: rankByFacility(s.key) }));
  const chartRows = getCoverageFigureRows();
  const noKids = getChainsWithoutKidsAttributes();
  const noKidsStores = noKids.reduce((a, c) => a + c.total, 0);
  const periodText = period.from === period.to ? period.from : `${period.from}〜${period.to}`;
  const chainsByDate = [...new Set(chains.map((c) => c.countedAt))].sort().map((d) => ({ date: d, n: chains.filter((c) => c.countedAt === d).length }));

  // 結論の補足: 子ども向け項目のうち、公開チェーンが多い順に3つ（見出しの設備は除く）
  const kidsBullets = stats
    .filter((s) => KIDS_COVERAGE_KEYS.includes(s.key) && s.key !== headline?.key && s.chains >= 2)
    .sort((a, b) => b.chains - a.chains || (b.top.rate - b.bottom.rate) - (a.top.rate - a.bottom.rate))
    .slice(0, 3);
  const publishCounts = stats.map((s) => s.chains);

  // CSV①: 縦持ち（公開しているセルだけ。公式表記・出典・集計日つき）
  const csvHeaders = ['チェーン', '設備', '公式表記', '表示あり店舗数', '数えた店舗数', '設置率', '出典URL', '集計日'];
  const csvRows = buildCoverageCsvRows().map((r) => [r.name, COVERAGE_LABELS[r.key], r.label, r.count, r.total, pct(r.rate), r.sourceUrl, r.countedAt]);
  // CSV②: 全チェーン×全設備のマトリクス（公開していないセルは「未公開」。0 と区別する）
  const matrixHeaders = ['チェーン', '数えた店舗数', ...summary.byFacility.map((f) => `${COVERAGE_LABELS[f.key]}_表示あり店舗数`), '出典URL', '集計日', '取得方法'];
  const matrixRows = chains.map((c) => [
    coverageDisplay(c).name,
    c.total,
    ...summary.byFacility.map((f) => (c.facilities[f.key] ? c.facilities[f.key]!.count : '未公開')),
    c.sourceUrl,
    c.countedAt,
    c.method,
  ]);

  const datasetLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: TITLE,
    description: metadata.description,
    url: `https://kyounoko.jp${URL_PATH}`,
    license: 'https://kyounoko.jp/terms',
    keywords: ['外食チェーン', '子連れ', 'キッズチェア', '座敷', 'おむつ替え台', '授乳室', '設備', '設置率', '調査', '店舗検索'],
    creator: { '@type': 'Organization', name: 'きょうのこ', url: 'https://kyounoko.jp' },
    distribution: [{ '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `https://kyounoko.jp${URL_PATH}` }],
    variableMeasured: summary.byFacility.map((f) => `${COVERAGE_LABELS[f.key]}の表示がある店舗数`),
    temporalCoverage: period.from === period.to ? period.from : `${period.from}/${period.to}`,
    datePublished: PAGE_PUBLISHED_AT,
    dateModified: generatedAt,
    spatialCoverage: { '@type': 'Place', name: '日本' },
    isAccessibleForFree: true,
    measurementTechnique: '各チェーンの公式店舗検索が店舗ごとに公開する設備属性を全店舗分取得し、設備ごとに表示のある店舗数を数えた（scripts/chain-coverage/run.mjs）',
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
  const h2: React.CSSProperties = { fontSize: 20, margin: '0 0 6px' };
  const note: React.CSSProperties = { fontSize: 12.5, color: 'var(--ink-sub)', margin: '0 0 10px', lineHeight: 1.7 };

  // 攻略記事へのリンク。凍結面（docs/experiments-active.md）へは、サイト共通の規則
  // mayLinkToFrozen（カットオフ 2026-09-25 以降に公開した面からは張らない）に従う。
  // このページの初回公開は 2026-09-11 で、既存の行リンクは変えない（増やしも減らしもしない）。
  const ChainName = ({ name, slug }: { name: string; slug: string | null }) =>
    slug && mayLinkToFrozen(slug, PAGE_PUBLISHED_AT) ? (
      <Link href={`/article/${slug}`} style={{ color: 'var(--clay-deep)', fontWeight: 600, textDecoration: 'none' }}>{name}</Link>
    ) : (
      <span>{name}</span>
    );

  const Range = ({ s }: { s: FacilityStat }) => (
    <>
      {s.bottom.name} {pct(s.bottom.rate)} 〜 {s.top.name} {pct(s.top.rate)}
      {s.fullChains > 1 && <>（全店に表示があるのは{s.fullChains}社）</>}
      {s.zeroChains > 1 && <>（表示0店は{s.zeroChains}社）</>}
    </>
  );

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
                {TITLE}
                <small style={{ display: 'block', fontSize: '0.5em', fontWeight: 400, color: 'var(--ink-sub)', marginTop: 8 }}>
                  公式店舗検索 {summary.chainCount}チェーン・{summary.storeCount.toLocaleString()}店を全数集計（{periodText}）
                </small>
              </h1>
              <p className="lead">
                「座敷は店舗による」「おむつ替え台は一部店舗」——公式サイトのこの一言を、率に直しました。
                各チェーンの<strong>公式店舗検索が店舗ごとに公開している設備表示</strong>を全店舗ぶん数え、
                「表示のある店舗数 ÷ 数えた店舗数」を設備ごとに並べています。
                数字はすべて公式店舗検索から機械集計したもので、当サイトの推測や訪問印象は含みません。
              </p>
            </header>

            <div className="kn-card" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--clay-deep)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 6 }}>結論（{generatedAt}集計）</div>
              {headline && (
                <>
                  {/* 見出し・description・引用例と同じ1文（headlineSentence）をそのまま出す */}
                  <p style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.6, margin: '0 0 4px' }}>{headlineSentence(headline)}。</p>
                  <p style={{ fontSize: 12.5, color: 'var(--ink-sub)', margin: '0 0 10px', lineHeight: 1.7 }}>
                    チェーン別では <Range s={headline} />、チェーン別の率の中央値は{pct(headline.medianRate)}。
                    数えた公式表記: 「{headline.labels.join('」「')}」（表記はチェーンごとに違う。詳細は<a href={`#facility-${headline.key}`}>{COVERAGE_LABELS[headline.key]}の表</a>）。
                  </p>
                </>
              )}
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.8 }}>
                {kidsBullets.map((s) => (
                  <li key={s.key}>
                    <strong>{COVERAGE_LABELS[s.key]}</strong>を公式店舗検索で公開しているのは{s.chains}社・{s.stores.toLocaleString()}店。
                    表示がある店舗は全体で<strong>{pct(s.rate)}</strong>。チェーン別では <Range s={s} />。
                  </li>
                ))}
                <li>
                  {summary.chainCount}チェーン中{noKids.length}社（{noKidsStores.toLocaleString()}店）は、公式店舗検索に<strong>子ども向けの項目を1つも公開していない</strong>（公開しているのは駐車場・入口の段差なし等の一般設備だけ）。
                  設備が無いのではなく「公開していない」なので、これらのチェーンの子ども向け設備の率は出していない。
                </li>
                {excluded.length > 0 && (
                  <li>このほか{excluded.length}チェーンは、店舗検索に設備の属性自体が無い等の理由で集計対象外（<a href="#method">理由の一覧</a>）。</li>
                )}
              </ul>
            </div>

            <div style={{ marginBottom: 28, padding: '14px 18px', background: 'rgba(201,96,62,0.06)', borderRadius: 12, fontSize: 14, lineHeight: 1.8 }}>
              <strong>表に載っていない＝設備が無い、ではありません。</strong>
              この調査は「公式店舗検索に表示があるか」を数えたもので、公開していない設備は「—（未公開）」として率を出していません。
              「0%」は、項目を公開しているうえで表示のある店舗が0店だったという意味です。
              店舗検索の表示と店内の実際が食い違うこともあるので、お出かけ前は行く店舗の公式ページか店舗へ直接確認してください。
            </div>

            <figure style={{ margin: '0 0 32px' }}>
              <div className="kn-card" style={{ padding: 12 }}>
                <CoverageChart rows={chartRows} />
              </div>
              <figcaption style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 6 }}>
                図1. 設備別の設置率（2チェーン以上が公開している子連れ関連の設備。駐車場は一般設備のため図から外し、下の表に掲載）。
                画像は出典明記で自由に転載できます。このページのSNS共有画像も同じ図です。
              </figcaption>
            </figure>

            <section id="compare" style={{ marginBottom: 32 }}>
              <h2 style={h2}>設備ごとの比較</h2>
              <p style={note}>
                母数は「その設備を公式店舗検索で公開しているチェーン」だけ。「全店合算」は表示あり店舗数の合計 ÷ 数えた店舗数の合計（店舗数の多いチェーンの影響が大きい）、
                「チェーン別中央値」は各チェーンの率を並べた真ん中の値（チェーンの規模に左右されない）。
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, background: 'var(--paper-card)', border: '1px solid var(--line)' }}>
                  <thead>
                    <tr>
                      <th style={th}>設備</th>
                      <th style={{ ...th, textAlign: 'right' }}>公開チェーン</th>
                      <th style={{ ...th, textAlign: 'right' }}>数えた店舗</th>
                      <th style={{ ...th, textAlign: 'right' }}>全店合算</th>
                      <th style={{ ...th, textAlign: 'right' }}>チェーン別中央値</th>
                      <th style={th}>最低 〜 最高</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((s) => (
                      <tr key={s.key}>
                        <td style={td}><a href={`#facility-${s.key}`} style={{ color: 'var(--clay-deep)', fontWeight: 600, textDecoration: 'none' }}>{COVERAGE_LABELS[s.key]}</a></td>
                        <td style={num}>{s.chains} / {summary.chainCount}</td>
                        <td style={num}>{s.stores.toLocaleString()}</td>
                        <td style={{ ...num, fontWeight: 700, color: 'var(--clay-deep)' }}>{pct(s.rate)}</td>
                        <td style={num}>{s.chains >= 2 ? pct(s.medianRate) : '—'}</td>
                        <td style={{ ...td, fontSize: 12 }}>{s.chains >= 2 ? <Range s={s} /> : <>{s.top.name}のみ公開</>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ ...note, marginTop: 8 }}>
                設備を合算した「総合スコア」や総合ランキングは作っていません。公開している設備がチェーンごとに違い（1設備あたり{Math.min(...publishCounts)}〜{Math.max(...publishCounts)}社）、
                公開していない設備を0点とも平均点とも置けないためです。設備同士の重みを決める根拠データも持っていません。
              </p>
            </section>

            {rankings.map(({ key, rows }) => {
              const s = statByKey.get(key)!;
              return (
                <section key={key} id={`facility-${key}`} style={{ marginBottom: 32 }}>
                  <h2 style={h2}>{COVERAGE_LABELS[key]}：表示がある店舗の割合（{rows.length}チェーン）</h2>
                  <p style={note}>
                    公式店舗検索の「{s.labels.join('」「')}」表示を数えた。{COVERAGE_LABELS[key]}を公開していない{summary.chainCount - rows.length}チェーンは載せていない（0%ではない）。
                    {s.zeroChains > 0 && <>0%の{s.zeroChains}社は、項目を公開しているが表示のある店舗が無かったチェーン。</>}
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
              );
            })}

            <section id="all-chains" style={{ marginBottom: 32 }}>
              <h2 style={h2}>チェーン別一覧（{summary.chainCount}チェーン × {summary.byFacility.length}設備）</h2>
              <p style={note}>
                「—」は公式店舗検索がその設備を属性として公開していないことを表す（設備が無いという意味ではない）。「0%」は公開していて表示が0店。
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
                        <tr key={c.chain} id={`chain-${c.chain}`}>
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
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <CsvDownloadButton
                  filename={`kyounoko-chain-facility-coverage-${YEAR}-matrix.csv`}
                  headers={matrixHeaders}
                  rows={matrixRows}
                  label="CSV：全チェーン×全設備（表示あり店舗数／未公開）"
                />
                <CsvDownloadButton
                  filename={`kyounoko-chain-facility-coverage-${YEAR}.csv`}
                  headers={csvHeaders}
                  rows={csvRows}
                  label="CSV：公開セルの明細（公式表記・出典URL・集計日つき）"
                />
              </div>
              <p style={{ ...note, marginTop: 8 }}>
                全チェーン×全設備のCSVは、公開していないセルを「未公開」、表示が0店のセルを「0」として区別している。率は「表示あり店舗数 ÷ 数えた店舗数」で再計算できる。
              </p>
            </section>

            <section id="method" style={{ marginBottom: 32 }}>
              <h2 style={{ ...h2, margin: '0 0 10px' }}>調査方法</h2>
              <dl style={{ fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                <dt style={{ fontWeight: 600 }}>対象</dt>
                <dd style={{ margin: '0 0 10px' }}>
                  当サイトが攻略記事を持つ外食チェーンのうち、公式店舗検索が店舗ごとの設備属性（アイコン・設備欄・絞り込み条件）を公開している{summary.chainCount}チェーン、計{summary.storeCount.toLocaleString()}店。
                  確認したが設備属性が無い等で対象にしなかったチェーン（{excluded.length}社）は、下に理由つきで公開している。
                </dd>
                <dt style={{ fontWeight: 600 }}>集計期間</dt>
                <dd style={{ margin: '0 0 10px' }}>
                  {periodText}（{chainsByDate.map((x) => `${x.date}に${x.n}チェーン`).join('、')}。各行の確認日を参照）。
                </dd>
                <dt style={{ fontWeight: 600 }}>取得方法</dt>
                <dd style={{ margin: '0 0 10px' }}>
                  各チェーンの公式店舗検索（店舗一覧・店舗詳細ページ、または店舗検索が使う公開API）から全店舗の店舗情報を取得し、設備ごとに「表示のある店舗数」を数えた。
                  チェーンごとの取得手順は下の「チェーンごとの取得方法と注記」とCSVの「取得方法」列にある。電話・店舗への問い合わせ、実訪問、口コミ、第三者サイトは使っていない。
                </dd>
                <dt style={{ fontWeight: 600 }}>設備の対応づけ</dt>
                <dd style={{ margin: '0 0 10px' }}>
                  設備の名称はチェーンごとに違う（例: おむつ替え台＝「ベビーシート」「オムツ替えシート」）ため、公式表記を当サイトの設備項目に対応づけ、表とCSVに公式表記を併記した。
                  対応づけは当サイトの判断で、判断が要ったもの（椅子と食器を分けていない表記、「車いす可」を入口の段差なしとして扱う等）はチェーンごとの注記に書いている。
                </dd>
                <dt style={{ fontWeight: 600 }}>除外基準</dt>
                <dd style={{ margin: '0 0 10px' }}>
                  公式店舗検索がその設備を属性として持たないチェーン・設備は集計しない（写真・本文・当サイト記事からの推測で補わない）。公式FAQに「全店で用意」とあっても、店舗検索に属性が無ければこの調査には載らない。
                  項目自体は存在するのに全店舗が未入力のチェーン（共通システムを使う運営会社で起こる）は、「0%」ではなく「未入力」として集計から外す。
                  店舗検索に別業態・海外店舗が同居する場合は、そのチェーンの国内店舗だけを数える（内訳は各チェーンの注記）。
                </dd>
                <dt style={{ fontWeight: 600 }}>分母（数えた店舗数）と公表店舗数の違い</dt>
                <dd style={{ margin: '0 0 10px' }}>
                  分母は、集計日に公式店舗検索へ掲載され取得できた店舗数。運営会社がIR資料等で公表する店舗数とは照合しておらず、差があっても補正・按分はしない
                  （店舗検索に載っていない店舗の設備は分からないため）。詳細ページが開けない店舗・閉店扱いの店舗を除いた場合や、定型の設備欄が無い店舗を「表示なし」として数えた場合は、件数を注記に書いている。
                </dd>
                <dt style={{ fontWeight: 600 }}>率の定義</dt>
                <dd style={{ margin: '0 0 10px' }}>
                  チェーンの率＝表示あり店舗数 ÷ 数えた店舗数。設備全体の率（図1・比較表の「全店合算」）＝公開チェーンの表示あり店舗数の合計 ÷ 公開チェーンの店舗数の合計。
                  1%未満で0店でないものは小数1桁で表示。設備を合算した総合スコアは作っていない（理由は<a href="#compare">比較表の下</a>）。
                </dd>
                <dt style={{ fontWeight: 600 }}>再現方法</dt>
                <dd style={{ margin: '0 0 10px' }}>
                  集計はチェーンごとの取得スクリプト（<code>scripts/chain-coverage/&lt;チェーン&gt;.mjs</code>）と集約スクリプト（<code>scripts/chain-coverage/run.mjs</code>）で機械的に行い、
                  店舗単位の中間データ（店舗名と表示のあった設備）を保持している。手作業の判断が入るのは上の「設備の対応づけ」と「未入力」の判定だけで、どちらも注記に書いている。
                  可能なチェーンでは、集計値が公式店舗検索の絞り込み件数と一致することを確認した（注記に記載）。
                  <pre style={{ background: 'var(--paper-card)', border: '1px solid var(--line)', borderRadius: 8, padding: 10, fontSize: 12, whiteSpace: 'pre-wrap', margin: '6px 0 0' }}>
{`node scripts/chain-coverage/run.mjs              # 全チェーンを取得して集約
node scripts/chain-coverage/run.mjs gusto        # 1チェーンだけ取り直して集約
node scripts/chain-coverage/run.mjs --aggregate  # 取得せず集約だけ`}
                  </pre>
                </dd>
                <dt style={{ fontWeight: 600 }}>更新方針</dt>
                <dd style={{ margin: '0 0 10px' }}>
                  年1回（毎年9月）に全チェーンを再集計し、このURLのまま更新する。チェーンが店舗検索の仕様を変えて項目が無くなった場合は、その項目を「公開停止」として扱い、0%にはしない。
                  集計の誤りに気づいた場合は、年次更新を待たずに該当チェーンを取り直し、確認日を更新する。
                </dd>
                <dt style={{ fontWeight: 600 }}>更新履歴</dt>
                <dd style={{ margin: 0 }}>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {COVERAGE_HISTORY.map((x) => (
                      <li key={x.date}>{x.date}: {x.text}</li>
                    ))}
                  </ul>
                </dd>
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
              {noKids.length > 0 && (
                <details style={{ marginTop: 12, fontSize: 13 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600 }}>子ども向けの項目を公開していないチェーン（{noKids.length}）</summary>
                  <p style={{ margin: '8px 0 0', lineHeight: 1.7 }}>
                    子ども向けの項目＝{KIDS_COVERAGE_KEYS.filter((k) => summary.byFacility.some((f) => f.key === k)).map((k) => COVERAGE_LABELS[k]).join('・')}。
                    次のチェーンは一般設備（駐車場・入口の段差なし・個室・多目的トイレ）だけを公開している：
                    {noKids.map((c) => coverageDisplay(c).name).join('、')}。
                  </p>
                </details>
              )}
              <details style={{ marginTop: 12, fontSize: 13 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>チェーンごとの取得方法と注記（{chains.length}）</summary>
                <ul style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.7 }}>
                  {chains.map((c) => (
                    <li key={c.chain}>
                      <strong>{coverageDisplay(c).name}</strong>（{c.countedAt}・<a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">公式店舗検索</a>）: {c.method}
                      {c.note && <div style={{ color: 'var(--ink-sub)' }}>注記: {c.note}</div>}
                    </li>
                  ))}
                </ul>
              </details>
            </section>

            <section id="cite" style={{ marginBottom: 32 }}>
              <h2 style={{ ...h2, margin: '0 0 10px' }}>引用について</h2>
              <p style={{ fontSize: 14, lineHeight: 1.8, margin: '0 0 8px' }}>
                表・図・CSVは、出典を明記すれば報道・ブログ・自治体資料・チェーン公式での利用を含め自由に転載できます。事前連絡やリンクは不要です。
              </p>
              <pre style={{ background: 'var(--paper-card)', border: '1px solid var(--line)', borderRadius: 8, padding: 12, fontSize: 12.5, whiteSpace: 'pre-wrap', margin: 0 }}>
出典: きょうのこ『{TITLE}』https://kyounoko.jp{URL_PATH}（{generatedAt}集計）
              </pre>
              {headline && (
                <>
                  <p style={{ fontSize: 13, color: 'var(--ink-sub)', margin: '12px 0 4px' }}>引用例:</p>
                  <pre style={{ background: 'var(--paper-card)', border: '1px solid var(--line)', borderRadius: 8, padding: 12, fontSize: 12.5, whiteSpace: 'pre-wrap', margin: 0 }}>
{`${headlineSentence(headline)}だった（出典: きょうのこ『${TITLE}』、${generatedAt}集計）。`}
                  </pre>
                </>
              )}
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
