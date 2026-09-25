import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { CsvDownloadButton } from '../restaurants/CsvDownloadButton';
import {
  SURVEY_CELL_KEYS,
  SURVEY_CELL_LABELS,
  SURVEY_CELL_SHORT,
  getRinyushokuSurvey,
  isStated,
  type SurveyCell,
  type SurveyChain,
  type SurveyCellKey,
} from '@/lib/rinyushoku-survey';

/**
 * 調査②: 外食チェーン 離乳食対応の公式記載 実態調査（戦略 docs/strategy-2026-09.md §5-1 の11月テーマ）。
 *
 * 「持ち込みOKチェーン」を並べるのではなく、「公式が明記している / 書いていない」の二層で出す。
 * 書いていない＝不可ではない（docs/writing-rules.md §4）ので、「記載なし」を「NG」と読ませない表現にする。
 * 要件6点（方法論・セル単位の出典と確認日・再現可能性・CSVと引用フォーマット・図版・更新方針）をこのページに置く。
 * 数字は data/rinyushoku-official-2026.json（scripts/build-rinyushoku-survey.mjs が生成）から引き、手打ちしない。
 */
export const dynamic = 'force-static';
export const revalidate = 86400;

const URL_PATH = '/data/rinyushoku-official';
const survey = getRinyushokuSurvey();
const { summary } = survey;
const YEAR = survey.generatedAt.slice(0, 4);
const TITLE = `外食チェーン 離乳食対応の公式記載 実態調査${YEAR}`;
const N = summary.chainCount;
const M = summary.mochikomi;

export const metadata: Metadata = {
  title: `${TITLE}｜${N}チェーン中、持ち込みを公式に明記しているのは${M.stated}社`,
  description:
    `外食${N}チェーンの運営元公式サイトを照合し、離乳食の持ち込み・温め・調乳用のお湯・ベビーフード販売を公式が明記しているかを集計。持ち込みの明記は${N}チェーン中${M.stated}社。「記載なし」は不可という意味ではありません。出典URLと確認日をセル単位で掲載、CSV配布・年次更新。`,
  alternates: { canonical: URL_PATH },
  openGraph: {
    title: TITLE,
    description: `${N}チェーンの公式サイトを照合。離乳食の持ち込みを公式に明記しているのは${M.stated}社。`,
    type: 'article',
    url: `https://kyounoko.jp${URL_PATH}`,
  },
};

/** 引用されやすい1枚の図: 4項目それぞれ「公式に明記あり / 照合できた社数」（横棒） */
function StatedChart() {
  const W = 720;
  const rowH = 34;
  const left = 170;
  const H = SURVEY_CELL_KEYS.length * rowH + 48;
  const barMax = W - left - 150;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="離乳食対応を公式サイトに明記しているチェーンの数" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <text x={left} y={18} fontSize={13} fill="#6b6259">公式サイトに明記しているチェーン数 / 照合できたチェーン数</text>
      {SURVEY_CELL_KEYS.map((k, i) => {
        const t = summary[k];
        const y = 32 + i * rowH;
        const w = Math.max(3, barMax * (t.stated / t.denominator));
        return (
          <g key={k}>
            <text x={left - 8} y={y + 20} fontSize={13} textAnchor="end" fill="#2b2622">{SURVEY_CELL_LABELS[k]}</text>
            <rect x={left} y={y + 7} width={barMax} height={18} fill="#f3ece2" rx={4} />
            <rect x={left} y={y + 7} width={w} height={18} fill="#c9603e" rx={4} />
            <text x={left + barMax + 8} y={y + 20} fontSize={13} fill="#2b2622" fontWeight={700}>{t.stated}社 / {t.denominator}社</text>
          </g>
        );
      })}
      <text x={W - 6} y={H - 6} fontSize={11} textAnchor="end" fill="#8a8078">出典: きょうのこ「{TITLE}」kyounoko.jp{URL_PATH}</text>
    </svg>
  );
}

const statedCount = (c: SurveyChain) => SURVEY_CELL_KEYS.filter((k) => isStated(c.cells[k].value)).length;
/** 持ち込み明記 → 明記の項目数が多い順。同点は元の順 */
const sortChains = (rows: SurveyChain[]) =>
  rows
    .map((c, i) => ({ c, i }))
    .sort((a, b) =>
      Number(isStated(b.c.cells.mochikomi.value)) - Number(isStated(a.c.cells.mochikomi.value)) ||
      statedCount(b.c) - statedCount(a.c) ||
      a.i - b.i)
    .map(({ c }) => c);

const nameOf = (key: string) => [...survey.chains, ...survey.supplement].find((c) => c.key === key)?.name ?? key;
const joinNames = (keys: string[]) => keys.map(nameOf).join('、');

export default function RinyushokuOfficialPage() {
  const chains = sortChains(survey.chains);
  const supplement = sortChains(survey.supplement);
  const unconfirmed = survey.chains.filter((c) => c.cells.mochikomi.value === '未確認');
  const corrected = survey.chains.filter((c) => c.correction);
  const excludedNoMention = survey.supplementExcluded.filter((e) => /記載を確認できず/.test(e.reason));
  const excludedOther = survey.supplementExcluded.filter((e) => !/記載を確認できず/.test(e.reason));

  const csvHeaders = ['区分', 'チェーン', '持ち込み', '温め', 'お湯', 'ベビーフード販売', '注記', '公式の文言', '出典URL', '陽性対照', '確認日'];
  const csvRows = [...chains, ...supplement].map((c) => [
    c.group === 'main' ? '本調査' : '参考（別手法）',
    c.name,
    ...SURVEY_CELL_KEYS.map((k) => c.cells[k].value),
    SURVEY_CELL_KEYS.filter((k) => c.cells[k].note).map((k) => `${SURVEY_CELL_SHORT[k]}: ${c.cells[k].note}`).join(' / '),
    c.quote,
    [c.sourceUrl, ...SURVEY_CELL_KEYS.map((k) => c.cells[k].sourceUrl).filter((u): u is string => !!u && u !== c.sourceUrl)]
      .filter((u, i, a) => a.indexOf(u) === i)
      .join(' '),
    c.positiveControl,
    c.checkedAt,
  ]);

  const datasetLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: TITLE,
    description: metadata.description,
    url: `https://kyounoko.jp${URL_PATH}`,
    license: 'https://kyounoko.jp/terms',
    keywords: ['外食チェーン', '離乳食', '持ち込み', 'ベビーフード', '調乳', 'お湯', '子連れ', '公式サイト', '調査'],
    creator: { '@type': 'Organization', name: 'きょうのこ', url: 'https://kyounoko.jp' },
    distribution: [{ '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `https://kyounoko.jp${URL_PATH}` }],
    variableMeasured: SURVEY_CELL_KEYS.map((k) => `${SURVEY_CELL_LABELS[k]}についての公式記載の有無`),
    temporalCoverage: survey.surveyPeriod,
    dateModified: survey.generatedAt,
    spatialCoverage: { '@type': 'Place', name: '日本' },
    isAccessibleForFree: true,
    measurementTechnique: '各チェーンの運営元公式サイト（FAQ・子連れ案内・キッズメニュー・店舗ページ）を照合し、離乳食の持ち込み・温め・調乳用のお湯・ベビーフード販売について公式の文言を記録した。子連れ項目を記録している公式ページ（陽性対照）を併記（scripts/build-rinyushoku-survey.mjs）',
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: 'データ', item: 'https://kyounoko.jp/data' },
      { '@type': 'ListItem', position: 3, name: '離乳食対応の公式記載調査', item: `https://kyounoko.jp${URL_PATH}` },
    ],
  };

  const th: React.CSSProperties = { padding: '8px 10px', fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '1px solid var(--line)' };
  const td: React.CSSProperties = { padding: '7px 10px', borderBottom: '1px solid var(--line)', verticalAlign: 'top' };

  const ChainName = ({ c }: { c: SurveyChain }) => (
    <>
      <span style={{ fontWeight: 600 }}>{c.name}</span>
      {c.articleSlug && (
        <div style={{ fontSize: 11.5, marginTop: 2 }}>
          <Link href={`/article/${c.articleSlug}`} style={{ color: 'var(--clay-deep)', textDecoration: 'none' }}>
            {c.articleKind === 'rinyushoku' ? '離乳食の記事 →' : '子連れの記事 →'}
          </Link>
        </div>
      )}
    </>
  );

  const Cell = ({ cell, fallbackUrl }: { cell: SurveyCell; fallbackUrl: string }) => {
    const stated = isStated(cell.value);
    const muted = cell.value === '未確認' || cell.value === '未照合';
    return (
      <td style={{ ...td, whiteSpace: 'normal', minWidth: 84 }}>
        <span style={{ fontWeight: stated ? 700 : 400, color: stated ? 'var(--clay-deep)' : muted ? 'var(--ink-mute)' : 'var(--ink-sub)' }}>
          {cell.value}
        </span>
        {cell.note && <div style={{ fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.5, marginTop: 2 }}>{cell.note}</div>}
        {cell.sourceUrl && cell.sourceUrl !== fallbackUrl && (
          <div style={{ fontSize: 11, marginTop: 2 }}><a href={cell.sourceUrl} target="_blank" rel="noopener noreferrer">出典</a></div>
        )}
      </td>
    );
  };

  const SurveyTable = ({ rows }: { rows: SurveyChain[] }) => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, background: 'var(--paper-card)', border: '1px solid var(--line)' }}>
        <thead>
          <tr>
            <th style={th}>チェーン</th>
            {SURVEY_CELL_KEYS.map((k) => <th key={k} style={th}>{SURVEY_CELL_SHORT[k]}</th>)}
            <th style={th}>公式の文言</th>
            <th style={th}>出典・確認日</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.key} id={`chain-${c.key}`}>
              <td style={{ ...td, minWidth: 110 }}><ChainName c={c} /></td>
              {SURVEY_CELL_KEYS.map((k: SurveyCellKey) => <Cell key={k} cell={c.cells[k]} fallbackUrl={c.sourceUrl} />)}
              <td style={{ ...td, fontSize: 11.5, color: 'var(--ink-sub)', minWidth: 220, lineHeight: 1.6 }}>{c.quote}</td>
              <td style={{ ...td, fontSize: 12, whiteSpace: 'nowrap' }}>
                <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">公式ページ</a>
                <div style={{ color: 'var(--ink-mute)' }}>{c.checkedAt}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
            <span>離乳食対応の公式記載調査</span>
          </nav>
        </div>

        <section className="section">
          <div className="container-narrow">
            <header className="page-head" style={{ marginBottom: 24 }}>
              <span className="eyebrow">きょうのこ調査 / 年次更新</span>
              <h1>
                {TITLE}
                <small style={{ display: 'block', fontSize: '0.5em', fontWeight: 400, color: 'var(--ink-sub)', marginTop: 8 }}>
                  運営元公式サイト {N}チェーンを照合（{survey.surveyPeriod}）
                </small>
              </h1>
              <p className="lead">
                「このお店、離乳食を持ち込んでいい？」——その答えを、チェーンの公式サイトがどこまで書いているかを数えました。
                外食{N}チェーンの運営元公式サイトで、<strong>離乳食の持ち込み・温め・調乳用のお湯・店内のベビーフード販売</strong>の4項目について
                公式の文言を記録し、「公式が明記している」「公式に記載がない」の二層で集計しています。
                口コミや当サイトの訪問印象は含みません。
              </p>
            </header>

            <div className="kn-card" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--clay-deep)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 6 }}>結論（{survey.generatedAt}確認）</div>
              <p style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.6, margin: '0 0 8px' }}>
                公式サイトで離乳食の持ち込みを明記しているのは、{N}チェーン中<span style={{ color: 'var(--clay-deep)' }}>{M.stated}社</span>
                <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--ink-sub)' }}>（{joinNames(M.chains)}）</span>
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.8 }}>
                <li>
                  公式ページの本文を取得できなかった{unconfirmed.length}社（{unconfirmed.map((c) => c.name).join('、')}）を除くと、{M.denominator}社中{M.stated}社。
                  持ち込みを「不可」と明記しているチェーンは{M.counts['明記NG'] ?? 0}社でした。
                </li>
                {summary.allergyOnlyMochikomi.length > 0 && (
                  <li>
                    {joinNames(summary.allergyOnlyMochikomi)}は、<strong>食物アレルギーのある方向け</strong>の持ち込みを明記（一般の離乳食の持ち込みは記載なし）。
                  </li>
                )}
                <li><strong>離乳食の温め</strong>を明記しているのは{summary.atatame.denominator}社中{summary.atatame.stated}社（{joinNames(summary.atatame.chains)}）。</li>
                <li><strong>調乳用のお湯</strong>を明記しているのは{summary.oyu.denominator}社中{summary.oyu.stated}社（{joinNames(summary.oyu.chains)}）。</li>
                <li><strong>店内でのベビーフード販売</strong>を明記しているのは{summary.hanbai.denominator}社中{summary.hanbai.stated}社（{joinNames(summary.hanbai.chains)}）。</li>
                <li>4項目のどれか1つでも公式に書いているのは{N}チェーン中{summary.anyStated.length}社。残りのチェーンは、公式サイトから離乳食への対応を読み取れません。</li>
              </ul>
            </div>

            <div style={{ marginBottom: 28, padding: '14px 18px', background: 'rgba(201,96,62,0.06)', borderRadius: 12, fontSize: 14, lineHeight: 1.8 }}>
              <strong>「記載なし」は「持ち込み不可」ではありません。</strong>
              公式サイトに書かれていない、という意味です。実際の対応は店舗ごとに異なる可能性があり、この調査からは「できる」とも「できない」とも言えません。
              公式に明記しているチェーンでも「一部の店舗を除く」などの但し書きが付く場合があります。
              お出かけ前に、<strong>行く店舗へ直接確認</strong>してください。
            </div>

            <figure style={{ margin: '0 0 32px' }}>
              <div className="kn-card" style={{ padding: 12 }}>
                <StatedChart />
              </div>
              <figcaption style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 6 }}>
                図1. 離乳食まわりの4項目を公式サイトに明記しているチェーン数（分母は公式ページを照合できたチェーン数）。画像は出典明記で自由に転載できます。
              </figcaption>
            </figure>

            <section id="all-chains" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, margin: '0 0 6px' }}>チェーン別一覧（{N}チェーン）</h2>
              <p style={{ fontSize: 12.5, color: 'var(--ink-sub)', margin: '0 0 10px', lineHeight: 1.7 }}>
                「記載なし」＝照合した公式ページに該当する記述が無い（対応していないという意味ではない）。
                「未確認」＝該当しうる公式ページ（FAQなど）の本文を取得できなかった。「未照合」＝その項目を公式で照合していない。
                未確認・未照合は集計の分母から外している。公式の文言は原文のまま（［］内は当サイトの補足）。
              </p>
              <SurveyTable rows={chains} />
              <div style={{ marginTop: 12 }}>
                <CsvDownloadButton filename={`kyounoko-rinyushoku-official-${YEAR}.csv`} headers={csvHeaders} rows={csvRows} label="CSVをダウンロード（チェーン×4項目、出典URLつき）" />
              </div>
            </section>

            {supplement.length > 0 && (
              <section id="supplement" style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 20, margin: '0 0 6px' }}>参考：追加照合したチェーンのうち、離乳食の記載があったもの（{supplement.length}チェーン）</h2>
                <p style={{ fontSize: 12.5, color: 'var(--ink-sub)', margin: '0 0 10px', lineHeight: 1.7 }}>
                  チェーン情報の新規登録時に、別の手順（メニュー・アレルゲン表・店舗ページ中心、陽性対照なし）で公式サイトを照合したチェーン。
                  照合範囲が本調査と違うため、<strong>上の集計（{N}チェーン）には含めていない</strong>。
                  記載があり、持ち込み・温め・お湯・販売のどれかに分けられるものだけを載せている。
                </p>
                <SurveyTable rows={supplement} />
              </section>
            )}

            <section id="method" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, margin: '0 0 10px' }}>調査方法</h2>
              <dl style={{ fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                <dt style={{ fontWeight: 600 }}>対象</dt>
                <dd style={{ margin: '0 0 10px' }}>
                  当サイトが子連れ記事を持つ外食チェーン{N}社（ファミレス・回転寿司・丼・うどん・ハンバーガー・カフェ・焼肉・しゃぶしゃぶ・ラーメン・ステーキ等）。
                </dd>
                <dt style={{ fontWeight: 600 }}>調査期間</dt>
                <dd style={{ margin: '0 0 10px' }}>{survey.surveyPeriod}（各行の確認日を参照）。</dd>
                <dt style={{ fontWeight: 600 }}>調査方法</dt>
                <dd style={{ margin: '0 0 10px' }}>
                  運営元の公式サイト（よくある質問、子連れ向け案内、キッズメニュー、店舗ページ、サイトマップ・サイト内検索）を照合し、
                  離乳食・ベビーフード・持ち込み・お湯（調乳）に関する記述を原文のまま記録した。電話・店舗への問い合わせ、実訪問、口コミ、第三者サイトは使っていない。
                </dd>
                <dt style={{ fontWeight: 600 }}>陽性対照の取り方</dt>
                <dd style={{ margin: '0 0 10px' }}>
                  「記載なし」が「探し方が悪くて見落とした」ではないことを示すため、チェーンごとに、同じ公式サイトで子連れ項目（キッズチェア・おむつ交換台・お子様メニュー等）を記録しているページを探して併記した（CSVの「陽性対照」列）。
                  子連れ項目を記録する公式ページ自体が無いチェーンは、その旨を公式の文言欄に書いている。
                </dd>
                <dt style={{ fontWeight: 600 }}>判定の区分</dt>
                <dd style={{ margin: '0 0 10px' }}>
                  持ち込みは「明記OK／条件付きOK／明記NG／記載なし／未確認」、温め・お湯・販売は「明記あり／記載なし／未確認／未照合」。
                  公式の文言が特定の条件（例: 食物アレルギーのある方）に限った持ち込みだけを書いている場合は、一般の離乳食については「記載なし」とし、注記に原文を残した。
                  店内販売品を「温めて提供」する旨の記述は、持ち込んだ離乳食の温めとは別なので「温め」に数えていない。
                </dd>
                <dt style={{ fontWeight: 600 }}>除外基準</dt>
                <dd style={{ margin: '0 0 10px' }}>
                  公式ページの本文を取得できなかった項目は「未確認」、照合していない項目は「未照合」とし、どちらも分母から外した（「記載なし」には数えない）。
                  当サイトの記事・口コミ・推測で公式の記載を補っていない。
                </dd>
                <dt style={{ fontWeight: 600 }}>集計方法</dt>
                <dd style={{ margin: '0 0 10px' }}>
                  項目ごとに「明記（条件付き・一部店舗を含む）の社数 ÷（対象社数 − 未確認 − 未照合）」。持ち込みの見出しの数字は{N}チェーンを分母にし、未確認を除いた数も併記した。
                </dd>
                <dt style={{ fontWeight: 600 }}>再現性</dt>
                <dd style={{ margin: '0 0 10px' }}>
                  照合結果の元データ（チェーンごとの判定・原文・出典URL・陽性対照URL）から、集計スクリプト <code>{survey.generator}</code> が
                  このページの数字とCSVを生成している。元データ作成後の再照合で判定を変えた行・既存記事の出典から追加した行は、
                  スクリプト内に理由つきで列挙し、下の「判定を見直した行」にも公開している。
                </dd>
                <dt style={{ fontWeight: 600 }}>更新方針</dt>
                <dd style={{ margin: 0 }}>
                  年1回（毎年9月）に全チェーンを再照合し、このURLのまま更新する。公式の記載が変わったことに気づいた場合は、年次更新を待たずに該当行を直し、確認日を更新する。
                </dd>
              </dl>

              {corrected.length > 0 && (
                <details style={{ marginTop: 12, fontSize: 13 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600 }}>判定を見直した行（{corrected.length}）</summary>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.7 }}>
                    {corrected.map((c) => <li key={c.key}><strong>{c.name}</strong>: {c.correction}</li>)}
                  </ul>
                </details>
              )}
              {survey.supplementExcluded.length > 0 && (
                <details style={{ marginTop: 12, fontSize: 13 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600 }}>追加照合したが載せなかったチェーン（{survey.supplementExcluded.length}）</summary>
                  <p style={{ margin: '8px 0 4px', lineHeight: 1.7 }}>
                    次の{excludedNoMention.length}チェーンは、別手順の照合範囲で離乳食の記載を確認できなかった。本調査と照合範囲が違うため「記載なし」には数えず、集計から外している：
                    {excludedNoMention.map((e) => e.name).join('、')}。
                  </p>
                  {excludedOther.length > 0 && (
                    <ul style={{ margin: '4px 0 0', paddingLeft: 18, lineHeight: 1.7 }}>
                      {excludedOther.map((e) => <li key={e.key}><strong>{e.name}</strong>: {e.reason}</li>)}
                    </ul>
                  )}
                </details>
              )}
            </section>

            <section id="cite" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, margin: '0 0 10px' }}>引用について</h2>
              <p style={{ fontSize: 14, lineHeight: 1.8, margin: '0 0 8px' }}>
                表・図・CSVは、出典を明記すれば報道・ブログ・自治体資料・チェーン公式での利用を含め自由に転載できます。事前連絡やリンクは不要です。
              </p>
              <pre style={{ background: 'var(--paper-card)', border: '1px solid var(--line)', borderRadius: 8, padding: 12, fontSize: 12.5, whiteSpace: 'pre-wrap', margin: 0 }}>
出典: きょうのこ『{TITLE}』https://kyounoko.jp{URL_PATH}
              </pre>
              <p style={{ fontSize: 12.5, color: 'var(--ink-mute)', margin: '8px 0 0' }}>
                公式サイトの記載が変わっている・読み違いがある場合は<Link href="/contact">修正依頼</Link>へ。公式ページを再照合して直します。
              </p>
            </section>
          </div>
        </section>
      </V2Frame>
    </>
  );
}
