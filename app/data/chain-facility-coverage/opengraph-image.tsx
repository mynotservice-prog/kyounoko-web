import { ImageResponse } from 'next/og';
import {
  COVERAGE_LABELS,
  formatRate,
  getCoverageFigureRows,
  getCoverageGeneratedAt,
  getCoverageHeadline,
  getCoverageSummary,
} from '@/lib/chain-coverage';

/**
 * 調査ページのOGP画像 = 結論の1文 + 本文の図1（設備別の設置率）と同じ行（getCoverageFigureRows）。
 * （戦略§5-1 要件5: 引用されやすいのは表ではなく1枚の図。OGPと本文に同じ図を置く）。
 * 率の表記も本文と同じ formatRate を使う。
 *
 * 日本語フォントは Google Fonts の CSS API に text= で必要文字だけ渡し、
 * 返ってきた TTF を埋め込む（全グリフだと数MBになるため）。ビルド時に1回だけ取得される。
 * 画像に出す文字列はすべて TEXTS に集めてから text= に渡す（漏れた字は豆腐になる）。
 */
export const alt = '外食チェーン 子連れ設備カバー率調査';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function loadFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; rv:2.0) Gecko/20100101 Firefox/4.0' } },
    ).then((r) => r.text());
    const m = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype|woff)'\)/);
    if (!m) return null;
    return await fetch(m[1]).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

const pct = formatRate;

export default async function Image() {
  const summary = getCoverageSummary();
  const headline = getCoverageHeadline();
  const year = getCoverageGeneratedAt().slice(0, 4);
  const rows = getCoverageFigureRows();

  const eyebrow = 'きょうのこ調査 / 年次更新';
  const title = `外食チェーン 子連れ設備カバー率調査${year}`;
  const sub = `公式店舗検索 ${summary.chainCount}チェーン・${summary.storeCount.toLocaleString()}店を全数集計`;
  const lead = headline
    ? `${COVERAGE_LABELS[headline.key]}：公開は${summary.chainCount}チェーン中${headline.chains}社、その${headline.stores.toLocaleString()}店のうち表示ありは${pct(headline.rate)}`
    : '';
  const chartTitle = '設備の表示がある店舗の割合（その設備を公開しているチェーンのみ集計）';
  const foot = '出典: きょうのこ kyounoko.jp/data/chain-facility-coverage';
  const rowTexts = rows.map((r) => [COVERAGE_LABELS[r.key], pct(r.rate), `${r.chains}チェーン`]);
  const TEXTS = [eyebrow, title, sub, lead, chartTitle, foot, ...rowTexts.flat()];
  const font = await loadFont([...new Set(TEXTS.join(''))].join(''));

  const barW = 600;
  const rowH = rows.length > 8 ? 34 : 40;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFBF3',
          color: '#2E2620',
          padding: '36px 56px',
          fontFamily: 'NotoSansJP, sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 18, color: '#C9603E', letterSpacing: 2 }}>{eyebrow}</div>
        <div style={{ display: 'flex', fontSize: 38, fontWeight: 700, marginTop: 4 }}>{title}</div>
        <div style={{ display: 'flex', fontSize: 20, color: '#6B5E55', marginTop: 2 }}>{sub}</div>
        {lead && (
          <div style={{ display: 'flex', fontSize: 25, fontWeight: 700, color: '#C9603E', marginTop: 14, lineHeight: 1.35 }}>{lead}</div>
        )}
        <div style={{ display: 'flex', fontSize: 16, color: '#6B5E55', marginTop: 14 }}>{chartTitle}</div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
          {rows.map((r, i) => (
            <div key={r.key} style={{ display: 'flex', alignItems: 'center', height: rowH }}>
              <div style={{ display: 'flex', width: 200, justifyContent: 'flex-end', paddingRight: 14, fontSize: 19 }}>{rowTexts[i][0]}</div>
              <div style={{ display: 'flex', width: barW, height: 20, background: '#F3ECE2', borderRadius: 6 }}>
                <div style={{ display: 'flex', width: Math.max(4, barW * r.rate), height: 20, background: r.key === headline?.key ? '#C9603E' : '#DD9A80', borderRadius: 6 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', paddingLeft: 12, fontSize: 19 }}>
                {rowTexts[i][1]}
                <span style={{ color: '#8A8078', fontSize: 15, marginLeft: 8 }}>{rowTexts[i][2]}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 'auto', fontSize: 15, color: '#8A8078' }}>{foot}</div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: 'NotoSansJP', data: font, weight: 700, style: 'normal' }] : [],
    },
  );
}
