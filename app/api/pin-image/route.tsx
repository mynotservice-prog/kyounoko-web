import { ImageResponse } from 'next/og';
import { ARTICLE_CATEGORY_NAME } from '@/lib/article-categories';

/**
 * Pinterest 用の縦長（2:3 = 1000x1500）ピン画像。
 *
 * 使い方: /api/pin-image?title=<記事タイトル>&cat=<categoryスラッグ>
 *
 * cron（/api/cron/pinterest-pin）が media_source.url としてこの公開URLを
 * Pinterest API に渡し、Pinterest 側がサーバーサイドで取得する。既存の
 * /api/og（1200x630・横長）と配色を揃えつつ、Pinterest のフィードで映える
 * 縦構図に再設計する。
 *
 * 日本語フォント: next/og の自動 CJK フォント取得は稀に失敗し、その豆腐(□)
 * レンダリングが CDN にキャッシュされて Pinterest に配信される事故がある。
 * これを防ぐため Noto Sans JP を使用文字サブセットで明示ロードし、失敗時は
 * 500 を返して豆腐画像をキャッシュさせない（次回フェッチで再生成される）。
 */

export const runtime = 'edge';

type Palette = {
  background: string;
  accent: string;
  accentSoft: string;
  text: string;
  subText: string;
  eyebrow: string;
};

const SAGE: Palette = {
  background: '#DFE7D4',
  accent: '#8FA37E',
  accentSoft: 'rgba(143, 163, 126, 0.20)',
  text: '#2E3A26',
  subText: '#56624A',
  eyebrow: '#5C6E4D',
};

const PEACH: Palette = {
  background: '#FBE8D8',
  accent: '#F4B787',
  accentSoft: 'rgba(244, 183, 135, 0.30)',
  text: '#3D2A1C',
  subText: '#7A5A45',
  eyebrow: '#A86A3D',
};

const CLAY: Palette = {
  background: '#FFFBF3',
  accent: '#C9603E',
  accentSoft: 'rgba(201, 96, 62, 0.16)',
  text: '#2E2620',
  subText: '#6B5E55',
  eyebrow: '#C9603E',
};

function paletteFor(cat: string): Palette {
  switch (cat) {
    case 'today-doko':
    case 'gyouji':
      return SAGE;
    case 'today-taberu':
      return PEACH;
    case 'today-mawasu':
    case 'today-nani':
    case 'yakudatsu':
    case 'narai':
    default:
      return CLAY;
  }
}


/**
 * Noto Sans JP を Google Fonts から「使用文字サブセット」で取得する。
 * UA を付けずに css2 を叩くと Google は truetype を返す（Satori は ttf/otf を解釈）。
 */
async function loadNotoSansJP(weight: 400 | 700, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@${weight}&text=${encodeURIComponent(text)}`;
  const cssRes = await fetch(url);
  if (!cssRes.ok) throw new Error(`font css ${cssRes.status}`);
  const css = await cssRes.text();
  const m = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:opentype|truetype)'\)/);
  if (!m) throw new Error('font css parse failed');
  const fontRes = await fetch(m[1]);
  if (!fontRes.ok) throw new Error(`font ${fontRes.status}`);
  return fontRes.arrayBuffer();
}

/** 全ひらがな・カタカナ（どの記事でも欠けないよう常時含める安全網）。 */
function kanaRange(): string {
  let s = '';
  for (let c = 0x3040; c <= 0x30ff; c++) s += String.fromCharCode(c);
  return s;
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const rawTitle = url.searchParams.get('title') ?? 'きょうのこ';
  const cat = url.searchParams.get('cat') ?? '';

  // 装飾を外して縦長で読みやすく（角括弧プレフィックス・全角パイプ）
  const title = rawTitle
    .replace(/^【[^】]*】/, '')
    .replace(/[｜|]/g, ' ')
    .trim();

  const palette = paletteFor(cat);
  const categoryLabel = ARTICLE_CATEGORY_NAME[cat] ?? 'きょうのこ';

  const chars = [...title].length;
  const titleSize = chars > 42 ? 58 : chars > 30 ? 68 : 78;

  // 画像に出る全日本語文字（動的＋固定）＋全かなをサブセット取得対象にする。
  const staticJp =
    Object.values(ARTICLE_CATEGORY_NAME).join('') +
    'きょうのこ続きを読む子育てを、もっと身軽に。';
  const fontText = Array.from(
    new Set((title + staticJp + kanaRange()).split('')),
  ).join('');

  let fonts;
  try {
    const [regular, bold] = await Promise.all([
      loadNotoSansJP(400, fontText),
      loadNotoSansJP(700, fontText),
    ]);
    fonts = [
      { name: 'Noto Sans JP', data: regular, weight: 400 as const, style: 'normal' as const },
      { name: 'Noto Sans JP', data: bold, weight: 700 as const, style: 'normal' as const },
    ];
  } catch {
    // 豆腐画像をキャッシュさせないため 500（次回フェッチで再生成される）。
    return new Response('font load failed', { status: 500 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1000',
          height: '1500',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Noto Sans JP', sans-serif",
          backgroundColor: palette.background,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 装飾: 右上の大きな円 */}
        <div
          style={{
            position: 'absolute',
            top: '-200',
            right: '-160',
            width: '580',
            height: '580',
            borderRadius: '9999px',
            backgroundColor: palette.accentSoft,
            display: 'flex',
          }}
        />
        {/* 装飾: 左下の小さな円 */}
        <div
          style={{
            position: 'absolute',
            bottom: '260',
            left: '-140',
            width: '380',
            height: '380',
            borderRadius: '9999px',
            backgroundColor: palette.accentSoft,
            display: 'flex',
          }}
        />

        {/* トップのアクセントバー */}
        <div
          style={{
            width: '100%',
            height: '14',
            background: `linear-gradient(90deg, ${palette.accent}, ${palette.eyebrow})`,
            display: 'flex',
          }}
        />

        {/* メインコンテンツ */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '90px 80px',
            position: 'relative',
          }}
        >
          {/* カテゴリバッジ */}
          <div
            style={{
              display: 'flex',
              marginBottom: '40',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                color: palette.eyebrow,
                fontSize: '30',
                fontWeight: 700,
                padding: '12px 32px',
                borderRadius: '999px',
                display: 'flex',
                letterSpacing: '0.04em',
                border: `2px solid ${palette.accent}`,
              }}
            >
              {categoryLabel}
            </div>
          </div>

          {/* タイトル */}
          <div
            style={{
              fontSize: `${titleSize}`,
              fontWeight: 700,
              color: palette.text,
              lineHeight: 1.4,
              display: 'flex',
              letterSpacing: '0.01em',
            }}
          >
            {title}
          </div>

          {/* 区切り線 */}
          <div
            style={{
              width: '120',
              height: '6',
              background: palette.accent,
              borderRadius: '3',
              margin: '46px 0 34px',
              display: 'flex',
            }}
          />

          {/* CTA */}
          <div
            style={{
              display: 'flex',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: palette.accent,
                borderRadius: '999px',
                padding: '20px 46px',
                fontSize: '32',
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              続きを読む →
            </div>
          </div>
        </div>

        {/* ボトムのブランドバー */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 70px',
            height: '128',
            backgroundColor: palette.text,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20' }}>
            <div
              style={{
                width: '58',
                height: '58',
                borderRadius: '9999px',
                background: palette.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '32',
                fontWeight: 700,
              }}
            >
              こ
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ color: '#ffffff', fontSize: '34', fontWeight: 700, display: 'flex' }}>
                きょうのこ
              </span>
              <span
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '20',
                  letterSpacing: '0.22em',
                  display: 'flex',
                  marginTop: '2',
                }}
              >
                KYOUNOKO
              </span>
            </div>
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '24',
              display: 'flex',
              letterSpacing: '0.04em',
            }}
          >
            kyounoko.jp
          </div>
        </div>
      </div>
    ),
    {
      width: 1000,
      height: 1500,
      fonts,
      headers: {
        // CDN にも 1 日キャッシュさせる。タイトル変更時は URL が変わるので問題なし。
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
      },
    },
  );
}
