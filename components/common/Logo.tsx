import Link from 'next/link';
import Image from 'next/image';

type Props = {
  variant?: 'light' | 'dark'; // light = for light bg (header), dark = for dark bg (footer)
};

/**
 * きょうのこ サイトロゴ
 * 2026-05 更新: テキスト「こ」のSVGロゴ → 親子3人の親しみやすい円形アイコンに変更
 * アイコン: public/img/kyounoko-logo-mark.webp (96x96)
 * note/Instagram のアバターと統一されたブランド体験を提供
 */
export function Logo({ variant = 'light' }: Props) {
  const isDark = variant === 'dark';
  return (
    <Link href="/" className="logo" aria-label="きょうのこ トップへ">
      <span className="logo-mark">
        <Image
          src="/img/kyounoko-logo-mark.webp"
          alt=""
          width={34}
          height={34}
          priority
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            // ダークフッター上では明るいパディング背景で浮かせる
            background: isDark ? 'rgba(252,248,239,0.95)' : 'transparent',
            padding: isDark ? 1 : 0,
            objectFit: 'cover',
          }}
        />
      </span>
      <span>きょうのこ</span>
    </Link>
  );
}
