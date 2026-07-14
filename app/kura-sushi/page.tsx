import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { AdSlot } from '@/components/ads/AdSlot';
import { ProvidedBadge } from '@/components/affiliate/PRBadge';

export const dynamic = 'force-static';
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'くら寿司 子連れガイド｜全国47都道府県の店舗・回る楽しさ・鮮度くんカバー【きょうのこ】',
  description:
    'くら寿司は大手で唯一“皿が回る”回転レーンを続け、抗菌寿司カバー「鮮度くん」で衛生面も安心。ビッくらポンで子供も大喜び。全国47都道府県の店舗検索リンクと、子連れで使うコツ・設備まとめを0-6歳目線でまとめた専用ガイドです。',
  alternates: { canonical: '/kura-sushi' },
  openGraph: {
    title: 'くら寿司 子連れガイド｜全国47都道府県・回る楽しさ・鮮度くんカバー',
    description:
      '大手で唯一“皿が回る”くら寿司を子連れで使いこなす専用ガイド。全国の店舗検索リンク・設備まとめ・回る楽しさと衛生の理由。',
    type: 'article',
    url: 'https://kyounoko.jp/kura-sushi',
  },
};

// くら寿司公式店舗検索（shop.kurasushi.co.jp/[ローマ字]）へのエリア別リンク。
// 全47都道府県のスラッグはHTTP 200で実在を確認済み（2026-06-26）。
const PREF_REGIONS: { region: string; prefs: { name: string; slug: string }[] }[] = [
  {
    region: '北海道・東北',
    prefs: [
      { name: '北海道', slug: 'hokkaido' }, { name: '青森', slug: 'aomori' },
      { name: '岩手', slug: 'iwate' }, { name: '宮城', slug: 'miyagi' },
      { name: '秋田', slug: 'akita' }, { name: '山形', slug: 'yamagata' },
      { name: '福島', slug: 'fukushima' },
    ],
  },
  {
    region: '関東',
    prefs: [
      { name: '茨城', slug: 'ibaraki' }, { name: '栃木', slug: 'tochigi' },
      { name: '群馬', slug: 'gunma' }, { name: '埼玉', slug: 'saitama' },
      { name: '千葉', slug: 'chiba' }, { name: '東京', slug: 'tokyo' },
      { name: '神奈川', slug: 'kanagawa' },
    ],
  },
  {
    region: '中部・北陸・甲信越',
    prefs: [
      { name: '新潟', slug: 'niigata' }, { name: '富山', slug: 'toyama' },
      { name: '石川', slug: 'ishikawa' }, { name: '福井', slug: 'fukui' },
      { name: '山梨', slug: 'yamanashi' }, { name: '長野', slug: 'nagano' },
      { name: '岐阜', slug: 'gifu' }, { name: '静岡', slug: 'shizuoka' },
      { name: '愛知', slug: 'aichi' },
    ],
  },
  {
    region: '近畿',
    prefs: [
      { name: '三重', slug: 'mie' }, { name: '滋賀', slug: 'shiga' },
      { name: '京都', slug: 'kyoto' }, { name: '大阪', slug: 'osaka' },
      { name: '兵庫', slug: 'hyogo' }, { name: '奈良', slug: 'nara' },
      { name: '和歌山', slug: 'wakayama' },
    ],
  },
  {
    region: '中国・四国',
    prefs: [
      { name: '鳥取', slug: 'tottori' }, { name: '島根', slug: 'shimane' },
      { name: '岡山', slug: 'okayama' }, { name: '広島', slug: 'hiroshima' },
      { name: '山口', slug: 'yamaguchi' }, { name: '徳島', slug: 'tokushima' },
      { name: '香川', slug: 'kagawa' }, { name: '愛媛', slug: 'ehime' },
      { name: '高知', slug: 'kochi' },
    ],
  },
  {
    region: '九州・沖縄',
    prefs: [
      { name: '福岡', slug: 'fukuoka' }, { name: '佐賀', slug: 'saga' },
      { name: '長崎', slug: 'nagasaki' }, { name: '熊本', slug: 'kumamoto' },
      { name: '大分', slug: 'oita' }, { name: '宮崎', slug: 'miyazaki' },
      { name: '鹿児島', slug: 'kagoshima' }, { name: '沖縄', slug: 'okinawa' },
    ],
  },
];

const SHOP_BASE = 'https://shop.kurasushi.co.jp';

// くら寿司の三本柱（公式写真と組み合わせて訴求）
const PILLARS = [
  {
    img: '/img/kura/lane-cover.webp',
    alt: 'くら寿司の回転レーンと抗菌寿司カバー「鮮度くん」',
    title: '大手で唯一“皿が回る”',
    body: '迷惑行為対策などで大手の多くが「注文品だけレーンで届く」方式に切り替えるなか、くら寿司は皿にネタを載せて流す回転レーンを継続。流れてくるお皿を見て「次は何が来る？」と子供が盛り上がります（同社公式発表）。',
  },
  {
    img: '/img/kura/lane-cover.webp',
    alt: '抗菌寿司カバー「鮮度くん」でお皿を覆ったくら寿司のレーン',
    title: '鮮度くんカバーで衛生的',
    body: '回るお皿は1皿ずつ抗菌寿司カバー「鮮度くん」で覆われ、ホコリ・飛沫から守られています。非接触で出し入れできる独自構造で、医師の99%が「すすめたい」と回答（くら寿司公式調査）。小さい子連れでも安心です。',
  },
  {
    img: '/img/kura/bikkurapon.webp',
    alt: 'くら寿司のビッくらポン',
    title: 'ビッくらポンで大喜び',
    body: 'お皿を5枚入れると1回まわせる抽選ゲーム「ビッくらポン」。景品が当たるワクワクが食事のモチベーションになり、待ち時間のぐずり対策にも。4-6歳に特に強く刺さります。',
  },
];

// 子連れ設備チェックリスト（店舗差あり）
const FACILITIES: { label: string; ok: boolean | 'na' }[] = [
  { label: '入口の段差が少ない', ok: true },
  { label: 'ボックス席', ok: true },
  { label: 'ベビーチェア', ok: true },
  { label: 'キッズメニュー', ok: true },
  { label: 'おむつ替え台', ok: true },
  { label: '離乳食の持ち込み', ok: true },
  { label: '取り分けOK', ok: true },
  { label: 'ベビーカーで席まで', ok: true },
  { label: 'アレルゲン表示', ok: true },
  { label: '授乳室', ok: 'na' },
];

export default function KuraSushiPage() {
  const totalPref = PREF_REGIONS.reduce((n, r) => n + r.prefs.length, 0);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: '子連れ飲食店', item: 'https://kyounoko.jp/data/restaurants' },
      { '@type': 'ListItem', position: 3, name: 'くら寿司 子連れガイド', item: 'https://kyounoko.jp/kura-sushi' },
    ],
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'くら寿司は本当にお皿が回っていますか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'はい。くら寿司は公式に「大手チェーンで回転レーンでの提供を続けているのは当社のみ」と発表しており、皿にネタを載せて流す回転レーンが残っています。提供形態は店舗・時期により異なる場合があるため最新情報は公式でご確認ください。',
        },
      },
      {
        '@type': 'Question',
        name: '回っているお寿司は衛生的に心配ではないですか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '回るお皿は1皿ずつ抗菌寿司カバー「鮮度くん」で覆われ、ホコリや飛沫から守られています。非接触構造で抗菌加工も施され、医師100人への調査では99%が「すすめたい」と回答したと公式に発表されています。',
        },
      },
      {
        '@type': 'Question',
        name: 'くら寿司は全国どこにでもありますか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'くら寿司は47都道府県すべてに出店済みで、旅行先・帰省先でも使えます。市区町村単位では店舗がないエリアもあるため、最寄り店舗は公式店舗検索でご確認ください。',
        },
      },
    ],
  };

  return (
    <V2Frame header="sub" active="home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="container">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <Link href="/data/restaurants">子連れ飲食店</Link>
          <span className="sep">/</span>
          <span>くら寿司 子連れガイド</span>
        </nav>
      </div>

      <section className="section">
        <div className="container-narrow">
          {/* ヒーロー */}
          <header className="page-head" style={{ marginBottom: 20 }}>
            <span className="eyebrow">子連れ外食ガイド｜回転寿司</span>
            {/* 提供開示: 公式写真の無償提供を受けたページ（編集方針5-3〜5-5・ステマ規制対応） */}
            <div style={{ margin: '12px 0 4px' }}>
              <ProvidedBadge providers={['くら寿司株式会社']} />
            </div>
            <h1>
              くら寿司 子連れガイド
              <small style={{ display: 'block', fontSize: '0.46em', fontWeight: 400, color: 'var(--ink-sub)', marginTop: 8 }}>
                全国{totalPref}都道府県・回る楽しさ・鮮度くんカバー
              </small>
            </h1>
            <p className="lead">
              くら寿司は<strong>大手で唯一“皿が回る”回転レーン</strong>を続け、抗菌寿司カバー
              「鮮度くん」で<strong>衛生面も安心</strong>。ビッくらポンで子供も大喜びの、
              子連れに一番やさしい回転寿司です。全国どこでも使える店舗検索リンクと、
              使いこなしのコツをまとめました。
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16, fontSize: 13 }}>
              <span className="meta-chip clay">全国{totalPref}都道府県</span>
              <span className="meta-chip clay">大手で唯一“回る”</span>
              <span className="meta-chip clay">鮮度くんカバー</span>
              <span className="meta-chip clay">ビッくらポン</span>
              <span className="meta-chip clay">0〜6歳</span>
            </div>
          </header>

          {/* ヒーロー画像 */}
          <figure style={{ margin: '0 0 36px', borderRadius: 18, overflow: 'hidden', background: 'rgba(201,96,62,0.06)' }}>
            <img
              src="/img/kura/interior.webp"
              alt="くら寿司の店舗内観"
              loading="eager"
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
            />
            <figcaption style={{ fontSize: 12, color: 'var(--ink-mute)', padding: '8px 12px' }}>
              写真提供：くら寿司株式会社
            </figcaption>
          </figure>

          {/* 三本柱 */}
          <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 22, marginBottom: 4 }}>
            なぜ子連れに一番やさしいのか
          </h2>
          <p style={{ fontSize: 14, color: 'var(--ink-sub)', marginBottom: 20 }}>
            「回る楽しさ」「衛生の安心」「ビッくらポン」の三本柱がきれいに噛み合っています。
          </p>
          <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: 40 }}>
            {PILLARS.map((p) => (
              <div key={p.title} style={{ border: '1px solid rgba(201,96,62,0.14)', borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
                <img
                  src={p.img}
                  alt={p.alt}
                  loading="lazy"
                  style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block', background: 'rgba(201,96,62,0.06)' }}
                />
                <div style={{ padding: '16px 16px 18px' }}>
                  <h3 style={{ fontSize: 17, margin: '0 0 8px', fontFamily: 'var(--font-mincho)' }}>{p.title}</h3>
                  <p style={{ fontSize: 13.5, lineHeight: 1.8, color: 'var(--ink-sub)', margin: 0 }}>{p.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 子連れ設備 */}
          <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 22, marginBottom: 4 }}>子連れ設備チェック</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginBottom: 14 }}>
            ※ 設備は店舗により差があります。心配なときは来店前に店舗へご確認ください。
          </p>
          <ul style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', listStyle: 'none', padding: 0, margin: '0 0 40px' }}>
            {FACILITIES.map((f) => (
              <li key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, padding: '8px 12px', background: 'rgba(201,96,62,0.05)', borderRadius: 10 }}>
                <span aria-hidden style={{ fontWeight: 700, color: f.ok === true ? 'var(--clay-deep, #b8542f)' : 'var(--ink-mute)' }}>
                  {f.ok === true ? '◯' : '—'}
                </span>
                <span style={{ color: f.ok === true ? 'var(--ink)' : 'var(--ink-mute)' }}>{f.label}</span>
              </li>
            ))}
          </ul>

          {/* 全国47都道府県 */}
          <h2 id="area" style={{ fontFamily: 'var(--font-mincho)', fontSize: 22, marginBottom: 4 }}>
            全国{totalPref}都道府県から店舗を探す
          </h2>
          <p style={{ fontSize: 14, color: 'var(--ink-sub)', marginBottom: 18 }}>
            お住まい・お出かけ先のエリアをタップすると、くら寿司公式の都道府県別店舗一覧が開きます
            （住所・営業時間・地図は公式で最新を確認できます）。
          </p>
          <div style={{ display: 'grid', gap: 20, marginBottom: 16 }}>
            {PREF_REGIONS.map((r) => (
              <div key={r.region}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--clay-deep, #b8542f)', marginBottom: 8 }}>{r.region}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {r.prefs.map((p) => (
                    <a
                      key={p.slug}
                      href={`${SHOP_BASE}/${p.slug}`}
                      target="_blank"
                      rel="noopener nofollow"
                      style={{ fontSize: 14, padding: '7px 14px', borderRadius: 999, border: '1px solid rgba(201,96,62,0.22)', color: 'var(--ink)', textDecoration: 'none', background: '#fff' }}
                    >
                      {p.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginBottom: 40 }}>
            リンクが開かない・全店を一覧で見たいときは公式の{' '}
            <a href={`${SHOP_BASE}/all`} target="_blank" rel="noopener nofollow" style={{ color: 'var(--clay-deep, #b8542f)' }}>
              全国店舗一覧
            </a>
            {' '}からも探せます。
          </p>

          <AdSlot placement="article-mid" />

          {/* もっと詳しく */}
          <section style={{ marginTop: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 22, marginBottom: 12 }}>もっと詳しく</h2>
            <ul style={{ paddingLeft: 20, lineHeight: 2, fontSize: 14.5 }}>
              <li><Link href="/article/kura-sushi-mawaru-eisei-kodomo">大手で“まだ皿が回ってる”のはくら寿司だけ｜鮮度くんカバーの理由</Link></li>
              <li><Link href="/article/kura-sushi-zenkoku-47">くら寿司は全国47都道府県にある｜エリア別の探し方</Link></li>
              <li><Link href="/article/kura-sushi-kodzure-koryaku">くら寿司は子連れOK？ベビーカー・キッズメニュー完全ガイド</Link></li>
              <li><Link href="/article/kurasushi-kids-menu">くら寿司のキッズメニュー徹底解説</Link></li>
              <li><Link href="/article/kura-sushi-bikkurapon-real">くら寿司ビッくらポンの子連れリアル｜3-6歳の反応</Link></li>
              <li><Link href="/article/kaiten-sushi-4chain-comparison">回転寿司4チェーン子連れ比較｜8項目</Link></li>
            </ul>
          </section>

          {/* CTA */}
          <section style={{ marginTop: 36, padding: '24px', borderRadius: 16, background: 'rgba(201,96,62,0.06)', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 20, marginBottom: 8 }}>お店を探して予約しよう</h2>
            <p style={{ fontSize: 14, color: 'var(--ink-sub)', margin: '0 0 16px' }}>
              土日祝は終日混みやすいので、公式アプリ・サイトの席予約／順番受付がおすすめです。
            </p>
            <a
              href={`${SHOP_BASE}/`}
              target="_blank"
              rel="noopener nofollow"
              style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 999, background: 'var(--clay-deep, #b8542f)', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: 15 }}
            >
              くら寿司 公式店舗検索を開く
            </a>
          </section>

          <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 28, lineHeight: 1.8 }}>
            ※ 本ガイドはくら寿司および各社の公式発表・報道など公開情報に基づいて作成しています。
            提供形態・サービス・店舗ルール・価格・店舗情報は変更される可能性があるため、最新情報は各店舗・公式サイトでご確認ください。
            掲載写真はくら寿司株式会社の提供によるものです。
          </p>

          <AdSlot placement="article-related" style={{ marginTop: 32 }} />
        </div>
      </section>
    </V2Frame>
  );
}
