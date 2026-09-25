import { ImageResponse } from 'next/og';
import { SURVEY_CELL_KEYS, SURVEY_CELL_LABELS, getRinyushokuSurvey } from '@/lib/rinyushoku-survey';

/**
 * 調査ページのOGP画像。本文の図1（4項目の公式明記チェーン数）と同じ内容を1枚にする
 * （戦略§5-1 要件5: OGPと本文に同じ図を置く）。フォント取得は chain-facility-coverage と同じ方式。
 */
export const alt = '外食チェーン 離乳食対応の公式記載 実態調査';
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

export default async function Image() {
  const survey = getRinyushokuSurvey();
  const { summary } = survey;
  const year = survey.generatedAt.slice(0, 4);
  const title = `外食チェーン 離乳食対応の公式記載 実態調査${year}`;
  const sub = `持ち込みを公式に明記しているのは${summary.chainCount}チェーン中${summary.mochikomi.stated}社`;
  const note = '公式に明記しているチェーン数 / 照合できたチェーン数（記載なし＝不可ではない）';
  const foot = '出典: きょうのこ kyounoko.jp/data/rinyushoku-official';
  const labels = SURVEY_CELL_KEYS.map((k) => SURVEY_CELL_LABELS[k]).join('');
  const font = await loadFont(title + sub + note + foot + labels + 'きょうのこ調査 / 年次更新社0123456789');

  const barW = 560;
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
          padding: '44px 56px',
          fontFamily: 'NotoSansJP, sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 20, color: '#C9603E', letterSpacing: 2 }}>きょうのこ調査 / 年次更新</div>
        <div style={{ display: 'flex', fontSize: 42, fontWeight: 700, marginTop: 6 }}>{title}</div>
        <div style={{ display: 'flex', fontSize: 28, color: '#C9603E', marginTop: 8 }}>{sub}</div>
        <div style={{ display: 'flex', fontSize: 18, color: '#6B5E55', marginTop: 26 }}>{note}</div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 10 }}>
          {SURVEY_CELL_KEYS.map((k) => {
            const t = summary[k];
            return (
              <div key={k} style={{ display: 'flex', alignItems: 'center', height: 56 }}>
                <div style={{ display: 'flex', width: 260, justifyContent: 'flex-end', paddingRight: 16, fontSize: 22 }}>{SURVEY_CELL_LABELS[k]}</div>
                <div style={{ display: 'flex', width: barW, height: 26, background: '#F3ECE2', borderRadius: 6 }}>
                  <div style={{ display: 'flex', width: Math.max(6, barW * (t.stated / t.denominator)), height: 26, background: '#C9603E', borderRadius: 6 }} />
                </div>
                <div style={{ display: 'flex', paddingLeft: 14, fontSize: 24 }}>
                  {`${t.stated}社 / ${t.denominator}社`}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', marginTop: 'auto', fontSize: 16, color: '#8A8078' }}>{foot}</div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: 'NotoSansJP', data: font, weight: 700, style: 'normal' }] : [],
    },
  );
}
