import type { Metadata } from 'next';
import { V2Frame } from '@/components/v2/V2Frame';
import { SettingsClient } from './SettingsClient';

export const metadata: Metadata = {
  title: '設定',
  description: 'お子さんの年齢・エリア・性格などを登録すると、きょうのこはより合ったプランを返します。',
  robots: { index: false, follow: true },
  alternates: { canonical: '/settings' },
};

export default function SettingsPage() {
  return (
    <>
      <V2Frame header="sub" active="home">
      <div className="container">
        <nav className="breadcrumb" aria-label="パンくず">
          <a href="/">HOME</a>
          <span className="sep">/</span>
          <span>設定</span>
        </nav>
      </div>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container-narrow">
          <header className="page-head" style={{ paddingTop: 16 }}>
            <span className="eyebrow">Settings</span>
            <h1>お子さんとあなたの設定</h1>
            <p className="lead">
              ここで保存した情報から、きょうのこは毎日のおすすめをより正確に返します。
              ブラウザに保存されるだけで、サーバーには送信されません。
            </p>
          </header>

          <SettingsClient />
        </div>
      </section>

      </V2Frame>
      
    </>
  );
}
