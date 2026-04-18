import Link from 'next/link';
import { Logo } from '@/components/common/Logo';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo variant="dark" />
            <p>
              子育て家庭の「今日どうする？」を3分で決める。情報を増やすのではなく、選択肢を絞って決めさせるための意思決定サイトです。
            </p>
          </div>

          <div className="footer-col">
            <h4>Categories</h4>
            <ul>
              <li><Link href="/category/today-doko">今日どこ行く</Link></li>
              <li><Link href="/category/today-nani">今日何する</Link></li>
              <li><Link href="/category/today-taberu">今日何食べる</Link></li>
              <li><Link href="/category/today-mawasu">今日どう回す</Link></li>
              <li><Link href="/category/gyouji">季節と行事</Link></li>
              <li><Link href="/category/narai">習い事と学び</Link></li>
              <li><Link href="/items">役立つもの</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>About</h4>
            <ul>
              <li><Link href="/about">運営者情報</Link></li>
              <li><Link href="/contact">お問い合わせ</Link></li>
              <li><Link href="/privacy">プライバシー</Link></li>
              <li><Link href="/terms">利用規約</Link></li>
            </ul>
          </div>
        </div>

        <div className="copy">
          <span>&copy; 2026 KYOUNOKO</span>
          <span>親の毎日を、ちょっと軽く。</span>
        </div>
      </div>
    </footer>
  );
}
