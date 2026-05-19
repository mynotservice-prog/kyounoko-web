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
            <h4>東京23区 駅別ガイド</h4>
            <ul>
              <li><Link href="/station">駅別ランチ（484駅）</Link></li>
              <li><Link href="/station/line">路線別（40路線）</Link></li>
              <li><Link href="/data/restaurants">全店舗比較表</Link></li>
              <li><Link href="/data">データセット一覧</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>無料ツール・資料</h4>
            <ul>
              <li><Link href="/tools">診断ツール</Link></li>
              <li><Link href="/tools/babycar-shindan">ベビーカー診断</Link></li>
              <li><Link href="/tools/naraigoto-match">習い事マッチング</Link></li>
              <li><Link href="/downloads">ダウンロード資料</Link></li>
              <li><Link href="/downloads/nyuuen-checklist">入園準備リスト</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>About</h4>
            <ul>
              <li><Link href="/about">運営者情報</Link></li>
              <li><Link href="/authors/nagamy">著者: ながみー</Link></li>
              <li><Link href="/editorial-policy">編集方針</Link></li>
              <li><Link href="/supervisors">監修者募集</Link></li>
              <li><Link href="/contact">お問い合わせ</Link></li>
              <li><Link href="/privacy">プライバシー</Link></li>
              <li><Link href="/terms">利用規約</Link></li>
            </ul>
            <h4 style={{ marginTop: 18 }}>Follow</h4>
            <ul>
              <li>
                <a
                  href="https://www.instagram.com/kyounoko_family_plan/"
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label="きょうのこ 公式Instagram（@kyounoko_family_plan）を別タブで開く"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  Instagram @kyounoko_family_plan
                </a>
              </li>
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
