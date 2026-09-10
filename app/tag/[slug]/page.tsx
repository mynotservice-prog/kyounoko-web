import '@/app/styles/list-v3.css';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Img } from '@/components/v2/V2Base';
import { getTag, getAllTags, getContentForTag, getTagsByKind } from '@/lib/tags';
import { KkIcon } from '@/components/kk/KkIcon';
import { KkAddToHomeCard } from '@/components/kk/KkAddToHomeCard';
import { KkLineCard } from '@/components/kk/KkLineCard';
import { KkFooter } from '@/components/kk/KkFooter';

export const revalidate = 86400;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllTags().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = getTag(slug);
  if (!tag) return { title: 'タグが見つかりません' };

  const { articles, plans } = getContentForTag(slug);
  const count = articles.length + plans.length;
  return {
    title: `${tag.name}の記事とプラン（${count}件）`,
    description: tag.description,
    alternates: { canonical: `/tag/${slug}` },
    // 剪定(2026-06): タグページは90日0クリック・自動生成の重複導線のため noindex。
    // 回遊用にリンクは残すが検索対象から外す（follow は維持）。
    robots: { index: false, follow: true },
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const tag = getTag(slug);
  if (!tag) notFound();

  const { articles, plans } = getContentForTag(slug);
  const relatedTags = getTagsByKind(tag.kind).filter((t) => t.slug !== slug).slice(0, 6);

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: 'タグ', item: 'https://kyounoko.jp/tag' },
      { '@type': 'ListItem', position: 3, name: tag.name },
    ],
  };

  // CollectionPage + ItemList JSON-LD（Tier 2 SEO強化）。
  // タグページは「特定軸で絞り込んだ記事リスト」なので CollectionPage が適切。
  // article + plan を順序付きで列挙して Google にリスト構造を伝える。
  const taggedItems: Array<{ url: string; name: string }> = [
    ...articles.slice(0, 15).map((a) => ({
      url: `https://kyounoko.jp/article/${a.slug}`,
      name: a.title,
    })),
    ...plans.slice(0, 10).map((p) => ({
      url: `https://kyounoko.jp/plan/${p.id}`,
      name: p.title,
    })),
  ];
  const jsonLdCollection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${tag.name}｜きょうのこ`,
    description: tag.description,
    url: `https://kyounoko.jp/tag/${slug}`,
    inLanguage: 'ja',
    isFamilyFriendly: true,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: taggedItems.length,
      itemListElement: taggedItems.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: it.url,
        name: it.name,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCollection) }} />

      <V2Frame header="sub" active="home">
        <div className="list-v3">
          <nav className="lv3-crumb" aria-label="パンくず">
            <Link href="/">HOME</Link>
            <span className="sep">/</span>
            <span>タグ</span>
            <span className="sep">/</span>
            <span className="cur">{tag.name}</span>
          </nav>

          <header className="lv3-head">
            <span className="lv3-eyebrow">Tag · {tag.kind}</span>
            <h1 className="lv3-h1">{tag.name}</h1>
            <p className="lv3-lead">{tag.description}</p>
            <p className="lv3-count">
              この条件にマッチする記事 {articles.length} 件、プラン {plans.length} 件
            </p>
          </header>

          {/* プラン一覧 */}
          {plans.length > 0 && (
            <section className="kk-sec">
              <div className="kk-sec-head">
                <div className="lv3-sec-titles">
                  <span className="lv3-eyebrow">Plans</span>
                  <h2 className="kk-sec-title">今日の行動プラン</h2>
                </div>
                <span className="lv3-hint">{plans.length} 件</span>
              </div>
              <div className="kk-rows grid2">
                {plans.slice(0, 24).map((p) => (
                  <Link key={p.id} href={`/plan/${p.id}`} className="kk-row lv3-row">
                    {p.hero && (
                      <span className="kk-row-thumb">
                        <V2Img src={p.hero} seed={p.id} alt={p.title} />
                      </span>
                    )}
                    <span className="kk-row-body">
                      <h3 className="kk-row-title">{p.title}</h3>
                      <span className="kk-row-sub">{p.shortAnswer}</span>
                      {/* 文字列は結合しない（旧マークアップと同じテキストノードの分かれ方を保つ） */}
                      <span className="lv3-tags">
                        {p.ageRanges[0] && <span className="v2-tag age">{p.ageRanges[0]}歳</span>}
                        <span className="v2-tag">{p.durationMin}分</span>
                        {p.budget && <span className="v2-tag">{p.budget}</span>}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 記事一覧 */}
          {articles.length > 0 && (
            <section className="kk-sec">
              <div className="kk-sec-head">
                <div className="lv3-sec-titles">
                  <span className="lv3-eyebrow">Articles</span>
                  <h2 className="kk-sec-title">関連する記事</h2>
                </div>
                <span className="lv3-hint">{articles.length} 件</span>
              </div>
              <div className="kk-rows grid2">
                {articles.map((a) => (
                  <Link key={a.slug} href={`/article/${a.slug}`} className="kk-row lv3-row">
                    {a.hero && (
                      <span className="kk-row-thumb">
                        <V2Img src={a.hero} seed={a.slug} alt={a.title} />
                      </span>
                    )}
                    <span className="kk-row-body">
                      <h3 className="kk-row-title">{a.title}</h3>
                    </span>
                    <span className="kk-row-arrow">
                      <KkIcon name="arrow-right" size={16} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 空状態 */}
          {articles.length === 0 && plans.length === 0 && (
            <div className="lv3-empty">
              <p>このタグに該当するコンテンツは準備中です。</p>
              <Link href="/" className="kk-btn outline">トップへ戻る</Link>
            </div>
          )}

          {/* 関連タグ */}
          {relatedTags.length > 0 && (
            <section className="kk-sec">
              <div className="kk-sec-head">
                <div className="lv3-sec-titles">
                  <span className="lv3-eyebrow">Related tags</span>
                  <h2 className="kk-sec-title">似たタグを見る</h2>
                </div>
              </div>
              <div className="lv3-tag-chips">
                {relatedTags.map((t) => (
                  <Link key={t.slug} href={`/tag/${t.slug}`} className="kk-chip">
                    {t.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <KkLineCard placement="list" />
          <KkAddToHomeCard placement="list" />
          <KkFooter />
        </div>
      </V2Frame>
      
    </>
  );
}
