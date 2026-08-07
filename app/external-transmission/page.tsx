import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';

export const metadata: Metadata = {
  title: '外部送信ポリシー（情報外部送信について）',
  description:
    '電気通信事業法に基づく外部送信規律への対応として、きょうのこの閲覧に際して利用者の端末から外部事業者へ送信される情報の内容・送信先・利用目的を公表します。',
  alternates: { canonical: '/external-transmission' },
};

type TransmissionEntry = {
  name: string;
  company: string;
  timing: string;
  data: string[];
  purposeSite: string;
  purposeThirdParty: string;
  links: { label: string; href: string }[];
};

const ENTRIES: TransmissionEntry[] = [
  {
    name: 'Google アナリティクス 4（アクセス解析）',
    company: 'Google LLC',
    timing: '当サイトの各ページを閲覧したとき',
    data: [
      '閲覧したページのURL・タイトル・閲覧日時',
      '参照元（どのサイトから来たか）',
      'ブラウザ・OS・端末の種類、画面サイズ、言語設定',
      'IPアドレス（Googleにより匿名化処理されます）',
      'Cookie等に保存される識別子（クライアントID）',
      'スクロール・クリック等のサイト内の操作情報',
    ],
    purposeSite: 'サイトの利用状況の把握、コンテンツの改善、不具合の検知のため',
    purposeThirdParty: 'アクセス解析サービスの提供・改善のため',
    links: [
      { label: 'Google プライバシーポリシー', href: 'https://policies.google.com/privacy' },
      { label: 'オプトアウト（無効化）方法', href: 'https://tools.google.com/dlpage/gaoptout?hl=ja' },
    ],
  },
  {
    name: 'Microsoft Clarity（行動分析）',
    company: 'Microsoft Corporation',
    timing: '当サイトの各ページを閲覧したとき',
    data: [
      '閲覧したページのURL・閲覧日時',
      'ブラウザ・OS・端末の種類、画面サイズ',
      'IPアドレス',
      'Cookie等に保存される識別子',
      'クリック・スクロール・マウス操作等の情報（入力フォームの内容はマスクされ送信されません）',
    ],
    purposeSite: 'ヒートマップ・セッション記録によるサイトの使いやすさの改善のため',
    purposeThirdParty: '行動分析サービスの提供・改善のため',
    links: [
      { label: 'Microsoft プライバシーステートメント', href: 'https://privacy.microsoft.com/ja-jp/privacystatement' },
    ],
  },
  {
    name: 'Google AdSense（広告配信）',
    company: 'Google LLC',
    timing: '広告を配信するページを閲覧したとき（広告配信を行っている場合）',
    data: [
      '閲覧したページのURL',
      'ブラウザ・OS・端末の種類',
      'IPアドレス',
      'Cookieや広告識別子等の識別情報',
      '過去の広告の表示・クリック履歴',
    ],
    purposeSite: '広告収益によるサイト運営のため',
    purposeThirdParty: '利用者の興味・関心に応じた広告の配信、広告の表示回数・効果の測定のため',
    links: [
      { label: 'Google 広告のポリシーと規約', href: 'https://policies.google.com/technologies/ads?hl=ja' },
      { label: 'パーソナライズド広告の無効化', href: 'https://adssettings.google.com/' },
    ],
  },
  {
    name: 'Cloudflare Turnstile（スパム対策CAPTCHA）',
    company: 'Cloudflare, Inc.',
    timing: '口コミ投稿フォーム等、Turnstileを設置したページを表示・送信したとき',
    data: [
      'IPアドレス',
      'ブラウザ・OS・端末の環境情報',
      'フォーム操作に関する挙動情報',
    ],
    purposeSite: 'ボットによる不正な投稿・スパムの防止のため',
    purposeThirdParty: 'ボット判定サービスの提供・改善のため',
    links: [
      { label: 'Cloudflare プライバシーポリシー', href: 'https://www.cloudflare.com/ja-jp/privacypolicy/' },
    ],
  },
  {
    name: 'アフィリエイトプログラム（成果計測）',
    company: 'バリューコマース株式会社、株式会社ファンコミュニケーションズ（A8.net）、株式会社もしも ほか',
    timing: '当サイト内のアフィリエイトリンク（「PR」表記のあるリンク）をクリックしたとき',
    data: [
      'クリックしたリンクの情報・クリック日時',
      '参照元ページのURL',
      'ブラウザ・端末の種類',
      'Cookie等に保存される識別子',
    ],
    purposeSite: '紹介料（成果報酬）の計測によるサイト運営のため',
    purposeThirdParty: '成果の計測・不正防止のため',
    links: [
      { label: 'バリューコマース 個人情報保護方針', href: 'https://www.valuecommerce.co.jp/privacy/' },
      { label: 'A8.net プライバシーポリシー', href: 'https://www.fancs.com/privacypolicy' },
      { label: 'もしも プライバシーポリシー', href: 'https://www.moshimo.co.jp/privacy' },
    ],
  },
];

export default function ExternalTransmissionPage() {
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: '外部送信ポリシー', item: 'https://kyounoko.jp/external-transmission' },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <V2Frame header="sub" active="home">
      <div className="container-article">
        <nav className="breadcrumb" aria-label="パンくず"><Link href="/">HOME</Link><span className="sep">/</span><span>外部送信ポリシー</span></nav>
      </div>
      <div className="container-article">
        <header className="page-head">
          <span className="eyebrow">External Transmission Policy</span>
          <h1>外部送信ポリシー</h1>
          <p className="lead">きょうのこ（以下「当サイト」）では、サイトの利用状況の分析、広告配信、スパム対策等のために、外部事業者が提供するサービス（タグ・プログラム等）を利用しています。これらのサービスの利用に伴い、利用者の端末から外部事業者へ利用者に関する情報が送信されます。電気通信事業法第27条の12（いわゆる外部送信規律）に基づき、送信される情報の内容・送信先・利用目的を以下のとおり公表します。</p>
        </header>
        <article className="prose">
          <h2>外部送信の一覧</h2>
          {ENTRIES.map((entry) => (
            <section key={entry.name}>
              <h3>{entry.name}</h3>
              <ul>
                <li><strong>送信先事業者</strong>：{entry.company}</li>
                <li><strong>送信されるタイミング</strong>：{entry.timing}</li>
                <li>
                  <strong>送信される情報</strong>：
                  <ul>
                    {entry.data.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </li>
                <li><strong>当サイトでの利用目的</strong>：{entry.purposeSite}</li>
                <li><strong>送信先での利用目的</strong>：{entry.purposeThirdParty}</li>
                <li>
                  <strong>関連リンク</strong>：
                  {entry.links.map((l, i) => (
                    <span key={l.href}>
                      {i > 0 && '／'}
                      <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
                    </span>
                  ))}
                </li>
              </ul>
            </section>
          ))}

          <h2>サイト配信のための通信について</h2>
          <p>当サイトは、コンテンツ配信のために Vercel Inc. のホスティングサービスおよび Cloudflare, Inc. のCDN・セキュリティサービスを利用しています。サイトの表示に必要な通信として、IPアドレス・ブラウザ情報等がこれらの事業者のサーバーに送信されます。これらはサービスの提供に必要不可欠な通信であり、外部送信規律の適用除外に該当しますが、透明性の観点から記載しています。</p>

          <h2>送信を停止したい場合（オプトアウト）</h2>
          <ul>
            <li>各サービスのオプトアウト方法は、上記一覧内の関連リンクをご参照ください。</li>
            <li>ブラウザの設定でCookieを削除・拒否することで、識別子を用いた計測を制限できます。設定方法は各ブラウザのヘルプをご確認ください。</li>
            <li>Cookieを無効化した場合、当サイトの一部機能（お気に入り保存等）が正しく動作しないことがあります。</li>
          </ul>

          <h2>本ポリシーの変更</h2>
          <p>利用するサービスの追加・変更があった場合は、本ページを速やかに更新します。個人情報の取り扱い全般については<Link href="/privacy">プライバシーポリシー</Link>をご確認ください。</p>

          <h2>お問い合わせ窓口</h2>
          <ul>
            <li>メール：<a href="mailto:service@remegift.jp">service@remegift.jp</a></li>
            <li><Link href="/contact">お問い合わせ</Link></li>
          </ul>

          <p style={{ marginTop: 48, fontSize: 12, color: 'var(--ink-mute)' }}>
            <strong>制定日</strong>：2026年7月3日
          </p>
        </article>
      </div>
      </V2Frame>
    </>
  );
}
