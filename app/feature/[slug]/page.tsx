import '@/app/styles/feature-v3.css';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Img, V2FavBtn } from '@/components/v2/V2Base';
import { KkIcon } from '@/components/kk/KkIcon';
import { KkSectionTitle } from '@/components/kk/KkSectionTitle';
import { KkLineCard } from '@/components/kk/KkLineCard';
import { KkAddToHomeCard } from '@/components/kk/KkAddToHomeCard';
import { KkFooter } from '@/components/kk/KkFooter';
import { FEATURE_PAGES, getFeaturePageBySlug } from '@/lib/feature-pages';
import { getAllFileArticles } from '@/lib/articles';
import { getAllSpotsWithSlug } from '@/lib/spots';
import { spotToV2, articleToV2, featureToV2 } from '@/lib/v2-adapters';
import { AdSlot } from '@/components/ads/AdSlot';

export const revalidate = 86400;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return FEATURE_PAGES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const feature = getFeaturePageBySlug(slug);
  if (!feature) return { title: '特集が見つかりません' };
  return {
    title: feature.title,
    description: feature.lede,
    alternates: { canonical: `/feature/${slug}` },
    openGraph: {
      title: feature.title,
      description: feature.lede,
      url: `https://kyounoko.jp/feature/${slug}`,
      type: 'website',
      images: [{ url: '/img/ogp-default-v2.webp', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: feature.title,
      description: feature.lede,
      images: ['/img/ogp-default-v2.webp'],
    },
  };
}

/**
 * 長い一段落を「読める段落」に割る。**1文字も足さず・削らず**、句点の直後だけで切る。
 * （app/spot/[slug]/page.tsx と同じ実装。SEO照合のためテキストは不変。）
 */
function toParagraphs(text: string, per = 2): string[] {
  const sentences = text
    .split(/(?<=。)/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length <= 1) return [text];
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += per) out.push(sentences.slice(i, i + per).join(''));
  return out;
}

export default async function FeaturePage({ params }: Props) {
  const { slug } = await params;
  const feature = getFeaturePageBySlug(slug);
  if (!feature) notFound();

  // 関連記事
  const allArticles = getAllFileArticles();
  const bySlug = new Map(allArticles.map((a) => [a.slug, a]));
  const articles = feature.articleSlugs
    .map((s) => bySlug.get(s))
    .filter((a): a is NonNullable<ReturnType<typeof bySlug.get>> => Boolean(a) && !a!.noindex);

  // スポット
  const spots = feature.spotFilter
    ? getAllSpotsWithSlug()
        .filter((x) => feature.spotFilter!(x.spot))
        .slice(0, feature.maxSpots ?? 12)
    : [];

  // 関連特集（自分以外）
  const relatedFeatures = FEATURE_PAGES.filter((f) => f.slug !== slug).slice(0, 4);

  // JSON-LD
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: '特集', item: 'https://kyounoko.jp/feature' },
      { '@type': 'ListItem', position: 3, name: feature.title },
    ],
  };
  const itemListElement = [
    ...articles.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://kyounoko.jp/article/${a.slug}`,
      name: a.title,
    })),
    ...spots.map((x, i) => ({
      '@type': 'ListItem',
      position: articles.length + i + 1,
      url: `https://kyounoko.jp/spot/${x.slug}`,
      name: x.spot.name,
    })),
  ];
  const jsonLdCollection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: feature.title,
    description: feature.lede,
    url: `https://kyounoko.jp/feature/${slug}`,
    inLanguage: 'ja',
    isFamilyFriendly: true,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: itemListElement.length,
      itemListElement,
    },
  };
  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: feature.faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  const v2Feature = featureToV2(feature);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCollection) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />

      <V2Frame header="sub" backHref="/feature">
        <div className="feature-v3">

        {/* パンくず（写真の外に出す） */}
        <nav className="fv3-crumb" aria-label="パンくず">
          <Link href="/">ホーム</Link>
          <KkIcon name="chevron-right" size={11} />
          <Link href="/feature">特集</Link>
          <KkIcon name="chevron-right" size={11} />
          <span className="cur">{feature.title}</span>
        </nav>

        {/* 上部ブロック。PC（≥920px）では左に写真・右に見出し/リードの2段組にする。 */}
        <div className="fv3-top">
          <div className="fv3-head">
            <span className="fv3-eyebrow">特集</span>
            <h1 className="fv3-h1">{feature.title}</h1>
            <p className="fv3-lede">{feature.lede}</p>
          </div>

          {/* メイン写真（文字を重ねない・軽い角丸だけ。src は従来どおり） */}
          <div className="fv3-hero">
            <div className="fv3-hero-img">
              <V2Img src={v2Feature.img} seed={'fa' + feature.slug} alt={feature.title} priority />
            </div>
          </div>
        </div>

        {/* 導入文（既存の intro をそのまま。文ごとに段落を分けて読みやすくする） */}
        <div className="fv3-body fv3-measure">
          {toParagraphs(feature.intro).map((p, i) => (
            <p key={i} className="fv3-intro">{p}</p>
          ))}
        </div>

        {/* テーマ（文言は従来どおり） */}
        <div className="fv3-tags">
          <div className="kk-chips">
            {feature.themeTags.map((t) => (
              <span key={t} className="kk-chip">{t}</span>
            ))}
          </div>
        </div>

        {/* 関連記事 */}
        {articles.length > 0 && (
          <div className="kk-sec fv3-sec">
            <KkSectionTitle as="div" title="関連記事" />
            <div className="kk-rows">
              {articles.slice(0, 8).map((a) => {
                const v = articleToV2(a);
                return (
                  <Link key={a.slug} href={`/article/${a.slug}`} className="kk-row">
                    <span className="kk-row-thumb">
                      <V2Img src={v.img} seed={a.slug} alt={a.title} />
                    </span>
                    <span className="kk-row-body">
                      <span className="kk-row-title">{v.title}</span>
                      {v.sub && <span className="kk-row-sub">{v.sub}</span>}
                      {v.tags && v.tags.length > 0 && (
                        <span className="fv3-row-tags">
                          {v.tags.map((t, i) => (
                            <span key={i} className="fv3-row-tag">{t}</span>
                          ))}
                        </span>
                      )}
                    </span>
                    <span className="kk-row-arrow">
                      <KkIcon name="chevron-right" size={18} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* AdSense */}
        <div className="v2-section fv3-ad">
          <AdSlot placement="article-mid" />
        </div>

        {/* 関連スポット（順位ではなく編集部のキュレーションなので、順位バッジは出さない） */}
        {spots.length > 0 && (
          <div className="kk-sec fv3-sec">
            <KkSectionTitle as="div" title="この特集のおすすめスポット" />
            <div className="kk-rows fv3-spots">
              {spots.map((x, i) => {
                const v = spotToV2(x.spot, i);
                return (
                  <Link key={x.slug} href={`/spot/${x.slug}`} className="kk-row fv3-spot">
                    <span className="fv3-spot-img">
                      <V2Img src={v.img} seed={v.id} alt={v.name} />
                    </span>
                    <span className="kk-row-body">
                      <span className="fv3-spot-cat">{v.cat}</span>
                      <span className="kk-row-title">{v.name}</span>
                      {v.tags.length > 0 && (
                        <span className="fv3-row-tags">
                          {v.tags.map((t, j) => (
                            <span key={j} className="fv3-row-tag">{t.t}</span>
                          ))}
                        </span>
                      )}
                      <span className="fv3-spot-loc">
                        <KkIcon name="pin" size={13} sw={2} />
                        {v.station}
                      </span>
                    </span>
                    <span className="fv3-spot-fav">
                      <V2FavBtn id={x.slug} variant="static" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 関連特集 */}
        <div className="kk-sec fv3-sec">
          <KkSectionTitle as="div" title="関連特集" moreHref="/feature" more="もっと見る" />
          <div className="fv3-feats">
            {relatedFeatures.map((f) => (
              <Link key={f.slug} href={`/feature/${f.slug}`} className="fv3-feat">
                <span className="fv3-feat-img">
                  <V2Img src={featureToV2(f).img} seed={f.slug + 'rel'} alt={f.title} />
                </span>
                <span className="fv3-feat-title">
                  {f.title.length > 18 ? f.title.slice(0, 18) + '…' : f.title}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ */}
        {feature.faq && feature.faq.length > 0 && (
          <div className="kk-sec fv3-sec">
            <KkSectionTitle as="div" title="よくある質問" />
            <div className="fv3-faqs fv3-measure">
              {feature.faq.map((q, i) => (
                <details key={i} className="fv3-faq" open={i === 0}>
                  <summary className="fv3-faq-q">
                    <span className="fv3-faq-mark">Q</span>
                    {q.question}
                    <span className="fv3-faq-chev">
                      <KkIcon name="chevron-down" size={17} />
                    </span>
                  </summary>
                  <div className="fv3-faq-a">
                    <span className="fv3-faq-mark a">A</span>
                    <span>{q.answer}</span>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* 回遊・再訪モジュール（リニューアル2026-09） */}
        <KkLineCard placement="feature" />
        <KkAddToHomeCard placement="feature" />
        <KkFooter />
        </div>
      </V2Frame>
    </>
  );
}
