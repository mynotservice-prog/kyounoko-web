import { ImageResponse } from 'next/og';

/**
 * 動的 OGP 画像生成 API
 *
 * 使い方:
 *   /api/og?title=記事タイトル&cat=today-taberu
 *
 * サイズ: 1200x630（OGP 標準）
 * カテゴリ別カラー:
 *   - today-doko / gyouji          → sage 系 (#DFE7D4 + #8FA37E)
 *   - today-taberu                 → peach 系 (#FBE8D8 + #F4B787)
 *   - その他（today-mawasu / today-nani / yakudatsu / narai 等）
 *                                  → clay 系 (#FFFBF3 + #C9603E)
 *
 * フォントについて:
 *   next/og は ImageResponse 内のフォントが指定されない場合、システムの
 *   sans-serif でフォールバックする。Vercel/Edge 環境では日本語グリフが
 *   含まれないため、現状は明示的にフォントを埋め込まず「タイトル文字を
 *   省略しても破綻しない」レイアウトで動かしている。
 *
 *   本格運用で日本語の見た目を整えたい場合は、下の `fonts` オプションに
 *   Noto Sans JP / Shippori Mincho を fetch して ArrayBuffer で渡せばよい。
 *   ただし日本語フォント全グリフは数MB級になるため、subset (Cyrillic等を
 *   削った静的版) を /public/fonts に置く運用が安全。
 *   例:
 *     const mincho = await fetch(new URL('https://kyounoko.jp/fonts/ShipporiMincho-Bold-subset.otf')).then(r => r.arrayBuffer());
 *     return new ImageResponse(<...>, {
 *       width: 1200, height: 630,
 *       fonts: [{ name: 'Mincho', data: mincho, weight: 700, style: 'normal' }],
 *     });
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
  accentSoft: 'rgba(143, 163, 126, 0.18)',
  text: '#2E3A26',
  subText: '#56624A',
  eyebrow: '#5C6E4D',
};

const PEACH: Palette = {
  background: '#FBE8D8',
  accent: '#F4B787',
  accentSoft: 'rgba(244, 183, 135, 0.28)',
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

const CATEGORY_LABEL: Record<string, string> = {
  'today-doko': '今日どこ行く？',
  'today-nani': '今日何する？',
  'today-taberu': '今日何食べる？',
  'today-mawasu': '今日どう回す？',
  'shippai-shinai': '失敗しない外出',
  tenki: '天気で決める',
  'heijitsu-yoru': '平日夜を回す',
  gyouji: '季節と行事',
  narai: '習い事と学び',
  yakudatsu: '役立つもの',
};

/** タイトル長に応じてフォントサイズを決める（48〜56px） */
function pickTitleSize(title: string): number {
  const len = [...title].length; // サロゲートペアを 1 文字として数える
  if (len <= 18) return 56;
  if (len <= 28) return 50;
  return 44;
}

/** 60 文字を超えるタイトルは末尾を省略してレイアウト破綻を防ぐ */
function truncate(title: string, max = 60): string {
  const chars = [...title];
  if (chars.length <= max) return title;
  return chars.slice(0, max - 1).join('') + '…';
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const rawTitle = url.searchParams.get('title') ?? 'きょうのこ';
  const cat = url.searchParams.get('cat') ?? '';

  const title = truncate(rawTitle);
  const palette = paletteFor(cat);
  const categoryLabel = CATEGORY_LABEL[cat] ?? 'きょうのこ';
  const titleSize = pickTitleSize(title);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: palette.background,
          position: 'relative',
          padding: '64px 80px',
          fontFamily:
            'system-ui, -apple-system, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif',
          color: palette.text,
        }}
      >
        {/* 装飾: 右上の大きな円 */}
        <div
          style={{
            position: 'absolute',
            top: -180,
            right: -160,
            width: 520,
            height: 520,
            borderRadius: '50%',
            backgroundColor: palette.accentSoft,
            display: 'flex',
          }}
        />
        {/* 装飾: 左下の小さな円 */}
        <div
          style={{
            position: 'absolute',
            bottom: -120,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            backgroundColor: palette.accentSoft,
            display: 'flex',
          }}
        />
        {/* 装飾: 細い縦線アクセント */}
        <div
          style={{
            position: 'absolute',
            top: 64,
            bottom: 64,
            left: 48,
            width: 3,
            backgroundColor: palette.accent,
            display: 'flex',
          }}
        />

        {/* ヘッダ: ロゴ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: palette.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            こ
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              lineHeight: 1.1,
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700, color: palette.text }}>
              きょうのこ
            </span>
            <span
              style={{
                fontSize: 12,
                letterSpacing: '0.24em',
                color: palette.subText,
                marginTop: 2,
              }}
            >
              KYOUNOKO
            </span>
          </div>
        </div>

        {/* 中央寄り左: カテゴリ + タイトル */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 'auto',
            marginBottom: 'auto',
            maxWidth: 980,
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: 14,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: palette.eyebrow,
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            {`Category · ${categoryLabel}`}
          </span>
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 700,
              lineHeight: 1.35,
              color: palette.text,
              letterSpacing: '0.01em',
              // 最大3行で打ち切る (ImageResponse は -webkit-line-clamp をサポート)
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </div>
        </div>

        {/* フッタ: 著者 + URL */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: 'auto',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 18,
              color: palette.subText,
            }}
          >
            <span>著者: ながみー</span>
            <span style={{ margin: '0 8px' }}>·</span>
            <span style={{ color: palette.eyebrow, fontWeight: 600 }}>kyounoko.jp</span>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 6,
            }}
          >
            <div
              style={{
                width: 28,
                height: 4,
                backgroundColor: palette.accent,
                borderRadius: 2,
                display: 'flex',
              }}
            />
            <div
              style={{
                width: 14,
                height: 4,
                backgroundColor: palette.accent,
                opacity: 0.6,
                borderRadius: 2,
                display: 'flex',
              }}
            />
            <div
              style={{
                width: 6,
                height: 4,
                backgroundColor: palette.accent,
                opacity: 0.35,
                borderRadius: 2,
                display: 'flex',
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        // CDN にも 1 日キャッシュさせる。タイトル変更時は URL が変わるので問題なし。
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
        // OGP画像は「ページ」ではないのでインデックス対象外にする。
        // robots.txt で遮断すると og:image 自体を取得できず Discover のカード画像が
        // 出なくなるため、取得は許可（robots.ts の Allow: /api/og）した上で
        // noindex はこのヘッダで宣言する。
        // 2026-08-17: GSC「robots.txtでブロックされましたがインデックスに登録しました」
        // 3,845件のうち約18%が /api/og?title=… だったため追加。
        'X-Robots-Tag': 'noindex',
      },
    },
  );
}
