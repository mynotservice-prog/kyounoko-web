import { ImageResponse } from 'next/og';
import { COVERAGE_LABELS, getCoverageGeneratedAt, getCoverageSummary } from '@/lib/chain-coverage';

/**
 * 調査ページのOGP画像。本文の図1（設備別の設置率）と同じ内容を1枚にする
 * （戦略§5-1 要件5: 引用されやすいのは表ではなく1枚の図。OGPと本文に同じ図を置く）。
 *
 * 日本語フォントは Google Fonts の CSS API に text= で必要文字だけ渡し、
 * 返ってきた TTF を埋め込む（全グリフだと数MBになるため）。ビルド時に1回だけ取得される。
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

const pct = (v: number) => `${Math.round(v * 100)}%`;

export default async function Image() {
  const summary = getCoverageSummary();
  const year = getCoverageGeneratedAt().slice(0, 4);
  const rows = summary.byFacility
    .filter((f) => f.chains >= 2 && f.key !== 'parking')
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 7);

  const title = `外食チェーン 子連れ設備カバー率調査${year}`;
  const sub = `公式店舗検索 ${summary.chainCount}チェーン・${summary.storeCount.toLocaleString()}店を全数集計`;
  const foot = `出典: きょうのこ kyounoko.jp/data/chain-facility-coverage`;
  const labels = rows.map((r) => `${COVERAGE_LABELS[r.key]}${pct(r.rate)}${r.chains}チェーン`).join('');
  const font = await loadFont(title + sub + foot + labels + '設備の表示がある店舗の割合0123456789%,・');

  const barW = 620;
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
        <div style={{ display: 'flex', fontSize: 44, fontWeight: 700, marginTop: 6 }}>{title}</div>
        <div style={{ display: 'flex', fontSize: 24, color: '#6B5E55', marginTop: 4 }}>{sub}</div>
        <div style={{ display: 'flex', fontSize: 18, color: '#6B5E55', marginTop: 22 }}>設備の表示がある店舗の割合（公開しているチェーンのみ集計）</div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
          {rows.map((r) => (
            <div key={r.key} style={{ display: 'flex', alignItems: 'center', height: 44 }}>
              <div style={{ display: 'flex', width: 190, justifyContent: 'flex-end', paddingRight: 14, fontSize: 21 }}>{COVERAGE_LABELS[r.key]}</div>
              <div style={{ display: 'flex', width: barW, height: 24, background: '#F3ECE2', borderRadius: 6 }}>
                <div style={{ display: 'flex', width: Math.max(4, barW * r.rate), height: 24, background: '#C9603E', borderRadius: 6 }} />
              </div>
              <div style={{ display: 'flex', paddingLeft: 12, fontSize: 20 }}>
                {pct(r.rate)}
                <span style={{ color: '#8A8078', fontSize: 16, marginLeft: 8 }}>{r.chains}チェーン</span>
              </div>
            </div>
          ))}
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
