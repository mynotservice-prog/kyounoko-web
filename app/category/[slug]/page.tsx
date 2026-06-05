import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2SectionHead, V2Img, V2Tag } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import { getCategory, getCategories, getArticlesByCategory } from '@/lib/microcms';
import { getFileArticlesByCategory, type FileArticleMeta } from '@/lib/articles';
import { AffiliateLink } from '@/components/affiliate/AffiliateLink';
import { getPopularItemsForArticleCategory } from '@/lib/items-catalog';
import { AdSlot } from '@/components/ads/AdSlot';
import { getCategoryFaqs } from '@/lib/category-faqs';
import { articleToV2 } from '@/lib/v2-adapters';

export const revalidate = 3600;

/** カテゴリslug → 支給B系のヒーロー画像 */
const CATEGORY_HERO_IMG: Record<string, string> = {
  'today-doko': '/v2/conditions/today-doko.webp',
  'today-nani': '/v2/conditions/today-nani.webp',
  'today-taberu': '/v2/conditions/today-taberu.webp',
  'today-mawasu': '/v2/conditions/today-mawasu.webp',
  'shippai-shinai': '/v2/conditions/shippai-shinai.webp',
  'tenki': '/v2/conditions/tenki.webp',
  'heijitsu-yoru': '/v2/conditions/heijitsu-yoru.webp',
  'gyouji': '/v2/conditions/gyouji.webp',
  'narai': '/v2/conditions/narai.webp',
  'yakudatsu': '/v2/conditions/yakudatsu.webp',
};
function categoryHero(slug: string): string {
  return CATEGORY_HERO_IMG[slug] || '/v2/conditions/today-doko.webp';
}

const FALLBACK_CATEGORIES: Record<string, { name: string; description: string; order: number }> = {
  'today-doko': { name: '今日どこ行く？', order: 1, description: '雨の日・猛暑日・ベビーカー前提・ワンオペでも。0〜6歳の子と安心して過ごせる場所を条件で絞り込みます。' },
  'today-nani': { name: '今日何する？', order: 2, description: '家で過ごす日の家遊び・工作・絵本。10分単位で、家にあるもので。' },
  'today-taberu': { name: '今日何食べる？', order: 3, description: '保育園帰りの15分ごはんから、冷凍で回すコツまで。毎日のごはんを軽く。' },
  'today-mawasu': { name: '今日どう回す？', order: 4, description: '夕方〜寝るまでの段取り。平日夜を乗り切る最小限のルーティン。' },
  'shippai-shinai': { name: '失敗しない外出', order: 5, description: '天気・年齢・持ち物。外出前の不安を3分で解消するチェックリスト。' },
  'tenki': { name: '天気で決める', order: 5, description: '雨・猛暑・強風。天気から今日の過ごし方を決める。' },
  'heijitsu-yoru': { name: '平日夜を回す', order: 6, description: '帰宅後〜就寝までの最短動線。共働きの味方になる工夫集。' },
  'gyouji': { name: '季節と行事', order: 5, description: '入園・運動会・七五三・ハロウィン。季節ごとの準備と過ごし方。' },
  'narai': { name: '習い事と学び', order: 6, description: '幼児の習い事と知育。何歳から・どう選ぶか。' },
  'yakudatsu': { name: '役立つもの', order: 7, description: '宅食・ミールキット・時短家電・ベビー用品。毎日を楽にする道具。' },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const result = await getCategories();
    if (result?.contents?.length) return result.contents.map((c) => ({ slug: c.slug }));
  } catch {
    // ignore
  }
  return Object.keys(FALLBACK_CATEGORIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let category: { name: string; description?: string } | null = null;
  try {
    category = await getCategory(slug);
  } catch {
    // ignore
  }
  if (!category && FALLBACK_CATEGORIES[slug]) category = FALLBACK_CATEGORIES[slug];
  if (!category) return { title: 'カテゴリが見つかりません' };

  const description = category.description ?? `${category.name}に関する記事一覧です。`;
  return {
    title: category.name,
    description,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: `${category.name}｜きょうのこ`,
      description,
      url: `https://kyounoko.jp/category/${slug}`,
      type: 'website',
      images: [{ url: '/img/ogp-default-v2.webp', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name}｜きょうのこ`,
      description,
      images: ['/img/ogp-default-v2.webp'],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  let category: Awaited<ReturnType<typeof getCategory>> | null = null;
  try {
    category = await getCategory(slug);
  } catch {
    // ignore
  }
  if (!category && FALLBACK_CATEGORIES[slug]) {
    const fb = FALLBACK_CATEGORIES[slug];
    category = { name: fb.name, slug: slug as never, description: fb.description, order: fb.order } as never;
  }
  if (!category) notFound();

  let articles: Awaited<ReturnType<typeof getArticlesByCategory>>['contents'] = [];
  try {
    const result = await getArticlesByCategory(slug, 24);
    articles = result.contents;
  } catch {
    // empty
  }

  const fileArticles: FileArticleMeta[] =
    articles.length === 0 ? getFileArticlesByCategory(slug) : [];

  const popularItems = getPopularItemsForArticleCategory(slug, 3);
  const faqs = getCategoryFaqs(slug);

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: category.name, item: `https://kyounoko.jp/category/${slug}` },
    ],
  };

  const listedSources: Array<{ slug: string; title: string }> =
    articles.length > 0
      ? articles.slice(0, 20).map((a) => ({ slug: a.slug, title: a.title }))
      : fileArticles.slice(0, 20).map((a) => ({ slug: a.slug, title: a.title }));

  const jsonLdCollection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name}｜きょうのこ`,
    description: category.description ?? `${category.name}に関する記事一覧。`,
    url: `https://kyounoko.jp/category/${slug}`,
    inLanguage: 'ja',
    isFamilyFriendly: true,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: listedSources.length,
      itemListElement: listedSources.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://kyounoko.jp/article/${a.slug}`,
        name: a.title,
      })),
    },
  };

  const jsonLdFaq =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }
      : null;

  // 表示用カード
  type Article = {
    slug: string;
    title: string;
    img: string;
    sub?: string;
    tags: string[];
  };
  const displayArticles: Article[] =
    articles.length > 0
      ? articles.map((a) => ({
          slug: a.slug,
          title: a.title,
          img: a.hero?.url || categoryHero(slug),
          sub: a.lede,
          tags: [],
        }))
      : fileArticles.map((a) => {
          const v = articleToV2(a);
          return { slug: a.slug, title: a.title, img: v.img, sub: a.lede, tags: v.tags || [] };
        });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCollection) }} />
      {jsonLdFaq && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />
      )}

      <V2Frame header="sub" active="home">
        {/* カテゴリ用ヒーロー — 支給B系 */}
        <div className="v2-article-hero" style={{ height: 180 }}>
          <V2Img src={categoryHero(slug)} seed={`cat-${slug}`} alt={category.name} />
          <div className="v2-article-hero-grad"></div>
          <span className="v2-article-hero-cat">カテゴリ</span>
          <div className="v2-fa-hero-title">{category.name}</div>
        </div>
        <div className="v2-page-head" style={{ paddingTop: 14 }}>
          {category.description && (
            <p className="v2-page-lead" style={{ marginTop: 0 }}>{category.description}</p>
          )}
        </div>

        {/* yakudatsu の特別バナー */}
        {slug === 'yakudatsu' && (
          <div className="v2-section">
            <Link
              href="/items"
              className="v2-banner"
              style={{ marginLeft: 0, marginRight: 0 }}
            >
              <span className="v2-banner-ico">
                <V2Icon name="cart" size={22} color="var(--v2-orange)" />
              </span>
              <span className="v2-banner-txt">
                <span className="v2-banner-title">商品カタログを見る</span>
                <span className="v2-banner-sub">
                  抱っこ紐・ベビーカー・宅食など、カテゴリ別に比較
                </span>
              </span>
              <V2Icon name="chevron-right" size={20} color="#c9b9a8" />
            </Link>
          </div>
        )}

        {/* 記事一覧 */}
        <V2SectionHead title={`${category.name}の記事 (${displayArticles.length})`} more="" />
        {displayArticles.length === 0 ? (
          <div className="v2-section">
            <p style={{ color: 'var(--v2-ink-mute)' }}>
              このカテゴリの記事は準備中です。
            </p>
          </div>
        ) : (
          <div className="v2-vlist">
            {displayArticles.map((a) => (
              <Link
                key={a.slug}
                href={`/article/${a.slug}`}
                className="v2-card-row"
              >
                <div
                  className="v2-imgwrap"
                  style={{
                    width: 118,
                    minWidth: 118,
                    aspectRatio: '1/1',
                    borderRadius: 14,
                    position: 'relative',
                  }}
                >
                  <V2Img src={a.img} seed={a.slug} alt={a.title} />
                </div>
                <div className="v2-card-row-body">
                  <div className="v2-card-row-title">{a.title}</div>
                  {a.sub && (
                    <div className="v2-art-sub">{a.sub.slice(0, 60)}</div>
                  )}
                  {a.tags.length > 0 && (
                    <div className="v2-tag-row">
                      {a.tags.slice(0, 3).map((t, i) => (
                        <V2Tag key={i} label={t} tone={i === 0 ? 'age' : ''} />
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* AdSense */}
        <div className="v2-section" style={{ marginTop: 24 }}>
          <AdSlot placement="article-mid" />
        </div>

        {/* 人気商品 */}
        {popularItems.length > 0 && (
          <>
            <V2SectionHead title="このカテゴリで人気の商品" moreHref="/items" />
            <div className="v2-section" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {popularItems.map((it) => (
                <AffiliateLink
                  key={it.id}
                  href={it.href}
                  title={it.name}
                  subtitle={it.subtitle}
                  price={it.price}
                  provider={it.provider}
                  itemId={it.id}
                />
              ))}
            </div>
          </>
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <>
            <div className="v2-sec-head">
              <div className="v2-sec-title">
                <span className="v2-bar-accent"></span>よくある質問
              </div>
            </div>
            <div
              className="v2-section"
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {faqs.map((f, i) => (
                <details key={i} className="v2-faq" open={i === 0}>
                  <summary
                    className="v2-faq-q"
                    style={{ listStyle: 'none', cursor: 'pointer' }}
                  >
                    <span className="v2-faq-mark">Q</span>
                    {f.question}
                    <V2Icon
                      name="chevron-down"
                      size={18}
                      color="#bbb"
                      style={{ marginLeft: 'auto', flex: 'none' }}
                    />
                  </summary>
                  <div className="v2-faq-a">
                    <span className="v2-faq-mark a">A</span>
                    <span>{f.answer}</span>
                  </div>
                </details>
              ))}
            </div>
          </>
        )}

        <div style={{ height: 24 }}></div>
      </V2Frame>
    </>
  );
}
