import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';

export const metadata: Metadata = {
  title: '運営者情報',
  description: 'きょうのこの運営方針・運営者・お問い合わせ窓口について。信頼性を大切にしたコンテンツ作成方針をお伝えします。',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <div className="container-article">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link><span className="sep">/</span><span>運営者情報</span>
        </nav>
      </div>
      <div className="container-article">
        <header className="page-head">
          <span className="eyebrow">About</span>
          <h1>運営者情報</h1>
          <p className="lead">きょうのこの運営方針、運営者、連絡先についてお伝えします。読者の毎日を軽くするメディアとして、信頼できる情報を届けることを第一に考えています。</p>
        </header>

        <article className="prose">
          <h2>このサイトについて</h2>
          <p><strong>きょうのこ</strong>は、0〜6歳の子がいる家庭の毎日の意思決定を軽くするための情報サイトです。天気・年齢・時間帯・予算などの条件から、今日の過ごし方の答えを3分で届けることを目的としています。</p>
          <p>情報を並べて読者を疲れさせるのではなく、「今日これで十分」という選択肢を絞って返すことを大切にしています。</p>

          <h2>運営者</h2>
          <div style={{ background: 'var(--paper-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: 24, margin: '24px 0' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
              <tbody>
                <tr><td style={{ padding: '10px 0', fontWeight: 600, width: 100 }}>サイト名</td><td>きょうのこ</td></tr>
                <tr><td style={{ padding: '10px 0', fontWeight: 600 }}>URL</td><td>https://kyounoko.jp</td></tr>
                <tr><td style={{ padding: '10px 0', fontWeight: 600 }}>運営者</td><td>ながみー</td></tr>
                <tr><td style={{ padding: '10px 0', fontWeight: 600 }}>設立</td><td>2026年</td></tr>
                <tr><td style={{ padding: '10px 0', fontWeight: 600 }}>所在地</td><td>お問い合わせフォームよりご確認ください</td></tr>
                <tr><td style={{ padding: '10px 0', fontWeight: 600 }}>連絡先</td><td>service@kyounoko.jp</td></tr>
              </tbody>
            </table>
          </div>

          <h2>運営方針</h2>
          <h3>記事の作成方針</h3>
          <p>きょうのこの記事は、次の原則のもとに作成しています。</p>
          <ul>
            <li><strong>執筆者名を明示します</strong>。誰が書いた記事かわかるようにしています。</li>
            <li><strong>体験と一次情報を重視</strong>します。実際に試したもの、公式資料（厚生労働省・消費者庁・メーカー公式等）に基づいて書いています。</li>
            <li><strong>虚偽の肩書きは書きません</strong>。実在しない「監修者」「専門家」を装うことはしません。</li>
            <li><strong>医療・健康・発達に関わる内容</strong>は、個別の判断が必要な場合、必ず専門家（小児科医・保健師・管理栄養士等）へのご相談をおすすめしています。</li>
          </ul>

          <h3>情報の鮮度</h3>
          <p>記事の冒頭に<strong>公開日</strong>と<strong>最終更新日</strong>を明記しています。情報が古くなった場合は、お問い合わせフォームからご指摘いただければ速やかに確認・更新します。</p>

          <h3>広告・アフィリエイトについて</h3>
          <p>本サイトは、Google広告およびアフィリエイトプログラムを利用しています。紹介する商品・サービスは、編集部が<strong>実際に使ったもの</strong>、または<strong>信頼できる情報源に基づくもの</strong>のみを掲載します。</p>

          <h2>読者の方へのお願い</h2>
          <p>きょうのこの記事は、子育てに関する情報の<strong>参考</strong>としてご活用ください。お子さんの発達・体調・食事・教育などに関する個別の判断は、必ず専門家または公的機関の最新情報をご確認ください。</p>

          <h2>お問い合わせ</h2>
          <ul>
            <li>メール：<a href="mailto:service@kyounoko.jp">service@kyounoko.jp</a></li>
            <li><Link href="/contact">お問い合わせフォーム</Link></li>
          </ul>

          <p style={{ marginTop: 48, fontSize: 12, color: 'var(--ink-mute)' }}>最終更新：2026年4月17日</p>
        </article>
      </div>
      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
