import Link from 'next/link';
import { V2LogoMark } from '@/components/v2/V2Base';
import { INSTAGRAM_URL } from '@/lib/site-facts';
import { KkIcon } from './KkIcon';

const LINKS: Array<{ href: string; label: string }> = [
  { href: '/about', label: '運営について' },
  { href: '/business', label: '広告掲載' },
  { href: '/for-facilities', label: '施設のご担当者さまへ' },
  { href: '/contact', label: 'お問い合わせ' },
  { href: '/editorial-policy', label: '編集方針' },
  { href: '/privacy', label: 'プライバシーポリシー' },
  { href: '/terms', label: '利用規約' },
  { href: '/external-transmission', label: '外部送信ポリシー' },
];

/**
 * 共通フッター。V2Frame 内の末尾に置く（記事・スポット・トップ共通）。
 * 既存トップの .v2-foot と同じリンクを含み、加えて広告掲載・施設向け・SNS を出す。
 */
export function KkFooter() {
  return (
    <footer className="kk-footer">
      <div className="kk-footer-top">
        <div className="kk-footer-brand">
          <Link href="/" className="kk-footer-logo" aria-label="きょうのこ トップへ">
            <V2LogoMark size={30} />
            きょうのこ
          </Link>
          <span className="kk-footer-tag">子どもの今日を、もっと楽しく。</span>
        </div>
      </div>
      <nav className="kk-footer-links" aria-label="サイト情報">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="kk-footer-bottom">
        <div className="kk-footer-sns">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <KkIcon name="instagram" size={22} />
          </a>
        </div>
      </div>
      <div className="kk-footer-copy">© 2026 きょうのこ</div>
    </footer>
  );
}
