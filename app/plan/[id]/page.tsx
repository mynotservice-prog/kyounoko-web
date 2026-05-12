import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import { getPlan, getAllPlanIds, getAllPlanMetas } from '@/lib/plans';
import { getFileArticle } from '@/lib/articles';
import { getAreaName } from '@/lib/area';
import { AdSlot } from '@/components/ads/AdSlot';
import { getTagsForPlan } from '@/lib/tags';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { TriedButton } from '@/components/ui/TriedButton';
import { SpotList } from '@/components/common/SpotList';
import { getRelatedArticlesForPlan } from '@/lib/cross-links';
import { CrossLinkCards } from '@/components/article/CrossLinkCards';

// hero 画像の自動マッチング更新を即時反映するため revalidate を短縮（5分）
export const revalidate = 300;

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return getAllPlanIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const plan = getPlan(id);
  if (!plan) return { title: 'プランが見つかりません' };
  return {
    title: plan.title,
    description: plan.shortAnswer,
    robots: { index: false, follow: true }, // Plan は条件組合せ無限のため noindex
    alternates: { canonical: `/plan/${id}` },
  };
}

async function renderBody(md: string): Promise<string> {
  const file = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(md);
  return String(file);
}

/** 本文から "- **時刻** 内容" 形式のタイムラインを抽出し、HowTo ステップ配列に変換。 */
function extractTimelineSteps(md: string): { name: string; text: string }[] {
  const steps: { name: string; text: string }[] = [];
  const lines = md.split('\n');
  // 行頭が `-` or `*` で、`**0:00-5:00**` のようなタイムスタンプを含む行を拾う
  const re = /^\s*[-*]\s+\*\*([^*]+)\*\*\s*(.*)$/;
  for (const line of lines) {
    const m = line.match(re);
    if (!m) continue;
    const name = m[1].trim();
    const text = m[2].trim();
    // name が時刻ぽい（数字含む）か、「出発」「帰り」などを含むならステップ扱い
    if (/\d/.test(name) || /出発|帰り|到着|準備|昼|朝|夕/.test(name)) {
      if (text) steps.push({ name, text });
    }
  }
  return steps;
}

export default async function PlanPage({ params }: Props) {
  const { id } = await params;
  const plan = getPlan(id);
  if (!plan) notFound();

  const html = await renderBody(plan.body);
  const related = plan.seoRelated ? await getFileArticle(plan.seoRelated) : null;

  // この行動に役立つ記事（プラン → 記事の双方向リンク）
  // - seoRelated はすでに別セクションで出すので除外
  // - 4 件まで提示（plan の kind / place / area で優先度を切り替え）
  const crossLinkedArticles = getRelatedArticlesForPlan(plan, {
    limit: 4,
    excludeSlugs: plan.seoRelated ? [plan.seoRelated] : [],
  });

  // 同じ条件で別のプラン（年齢×場所 が一致する別プラン、最大3件）
  const siblingPlans = getAllPlanMetas()
    .filter((p) =>
      p.id !== plan.id &&
      p.ageRanges.some((a) => plan.ageRanges.includes(a)) &&
      p.place.some((pl) => plan.place.includes(pl)) &&
      (plan.area === 'all' || p.area === plan.area || p.area === 'all')
    )
    .slice(0, 3);

  const tags = getTagsForPlan(plan);

  const budgetLabels: Record<string, string> = {
    free: '無料',
    low: '〜2,000円',
    mid: '〜5,000円',
    high: '5,000円〜',
  };

  // HowTo JSON-LD
  const steps = extractTimelineSteps(plan.body);
  const jsonLdHowTo =
    steps.length >= 3
      ? {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: plan.title,
          description: plan.shortAnswer,
          totalTime: `PT${plan.durationMin}M`,
          image: plan.hero,
          step: steps.map((s, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            name: s.name,
            text: s.text,
          })),
        }
      : null;

  return (
    <>
      {jsonLdHowTo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }}
        />
      )}

      <SiteHeader />

      <div className="container-article">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <Link href="/#finder">今日の答え</Link>
          <span className="sep">/</span>
          <span>{plan.title}</span>
        </nav>
      </div>

      {/* Hero image */}
      {plan.hero && (
        <div className="article-hero" style={{ maxWidth: 920, margin: '8px auto 32px', padding: '0 var(--pad)' }}>
          <div
            className="article-hero-img"
            role="img"
            aria-label={plan.title}
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: 'var(--radius-lg)',
              backgroundImage: `url(${plan.hero})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: 'var(--peach-soft)',
            }}
          />
        </div>
      )}

      <article className="container-article" style={{ paddingTop: 20 }}>
        <header className="page-head">
          <span className="eyebrow">Today&apos;s plan — 今日の行動プラン</span>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, justifyContent: 'space-between' }}>
            <h1 style={{ flex: 1 }}>{plan.title}</h1>
            <FavoriteButton kind="plan" id={plan.id} size="md" />
          </div>
          <p className="lead">{plan.shortAnswer}</p>
          <div style={{ marginTop: 16 }}>
            <TriedButton kind="plan" id={plan.id} />
          </div>
        </header>

        {/* AdSense: Plan hero 下 */}
        <AdSlot placement="plan-below-hero" />

        {/* Quick info */}
        <section
          style={{
            background: 'var(--paper-card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 22px',
            margin: '28px 0 32px',
          }}
          aria-label="このプランのクイック情報"
        >
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
            <QuickItem label="AGE" value={plan.ageRanges.join(' / ') + '歳'} />
            <QuickItem label="TIME" value={`${plan.durationMin}分`} />
            <QuickItem label="BUDGET" value={budgetLabels[plan.budget] ?? plan.budget} />
            {plan.area !== 'all' && <QuickItem label="AREA" value={getAreaName(plan.area)} />}
            {plan.weather.length > 0 && (
              <QuickItem label="WEATHER" value={plan.weather.join(' / ')} />
            )}
            {plan.place.length > 0 && (
              <QuickItem label="PLACE" value={plan.place.map((p) => p === 'home' ? '家' : p === 'indoor' ? '屋内' : '外').join(' / ')} />
            )}
          </div>
        </section>

        {/* Body */}
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        {/* エリア指定ありの外出プランならおすすめスポット提示 */}
        {plan.area !== 'all' && plan.place.some((p) => p === 'outdoor' || p === 'indoor') && (
          <SpotList
            area={plan.area}
            age={plan.ageRanges[0] as '0-1' | '2-3' | '4-6' | undefined}
            place={plan.place.includes('outdoor') ? 'outdoor' : 'indoor'}
            budget={plan.budget === 'free' ? 'free' : plan.budget === 'low' ? 'low' : plan.budget === 'mid' ? 'mid' : undefined}
            limit={5}
          />
        )}

        {/* タグ */}
        {tags.length > 0 && (
          <section style={{ marginTop: 40 }}>
            <span className="eyebrow">Tags · トピックで探す</span>
            <div className="outing-chips" style={{ marginTop: 12 }}>
              {tags.slice(0, 8).map((t) => (
                <Link key={t.slug} href={`/tag/${t.slug}`} className="outing-chip">
                  {t.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 関連するSEO記事（あれば）— "もっと詳しく" */}
        {related && (
          <section style={{ marginTop: 56 }}>
            <h2 style={{ fontFamily: 'var(--font-mincho)', fontWeight: 600, fontSize: 22, margin: '0 0 16px' }}>
              もっと詳しく知りたい方へ
            </h2>
            <Link
              href={`/article/${related.slug}`}
              style={{
                display: 'block',
                background: 'var(--paper-card)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'inherit',
              }}
              className="related-card"
            >
              <div
                style={{
                  aspectRatio: '16 / 9',
                  backgroundColor: 'var(--peach-soft)',
                  backgroundImage: related.hero ? `url(${related.hero})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div style={{ padding: '16px 20px 20px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontSize: 10,
                    letterSpacing: '.16em',
                    textTransform: 'uppercase',
                    color: 'var(--clay)',
                    fontWeight: 600,
                  }}
                >
                  Related article
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-mincho), "Shippori Mincho", serif',
                    fontSize: 16,
                    fontWeight: 600,
                    margin: '6px 0 0',
                    lineHeight: 1.55,
                  }}
                >
                  {related.title}
                </h3>
              </div>
            </Link>
          </section>
        )}

        {/* この行動に役立つ記事（プラン → 記事の双方向リンク） */}
        {crossLinkedArticles.length > 0 && (
          <CrossLinkCards
            eyebrow="Related articles · 実際の体験談・選び方"
            heading="このプランに役立つ記事"
            defaultEyebrow="Article"
            items={crossLinkedArticles.map((a) => ({
              href: `/article/${a.slug}`,
              title: a.title,
              description: a.lede || a.metaDescription,
              hero: a.hero,
              eyebrow: a.categoryName ?? 'Article',
            }))}
          />
        )}

        {/* 同じ条件で別のプラン（プラン横リンク） */}
        {siblingPlans.length > 0 && (
          <section style={{ marginTop: 56 }}>
            <h2 style={{ fontFamily: 'var(--font-mincho)', fontWeight: 600, fontSize: 22, margin: '0 0 16px' }}>
              似た条件で別のプラン
            </h2>
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {siblingPlans.map((p) => (
                <Link
                  key={p.id}
                  href={`/plan/${p.id}`}
                  style={{
                    background: 'var(--paper-card)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {p.hero && (
                    <div style={{
                      aspectRatio: '16/10',
                      backgroundColor: 'var(--peach-soft)',
                      backgroundImage: `url(${p.hero})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }} />
                  )}
                  <div style={{ padding: '12px 14px 16px' }}>
                    <h4 style={{ fontFamily: 'var(--font-mincho)', fontSize: 14, fontWeight: 600, margin: 0, lineHeight: 1.55 }}>
                      {p.title}
                    </h4>
                    <p style={{ fontSize: 11.5, color: 'var(--ink-sub)', margin: '6px 0 0', lineHeight: 1.7 }}>
                      {p.shortAnswer.slice(0, 50)}...
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* フィードバック誘導 */}
        <section style={{ marginTop: 56, padding: '20px 22px', background: 'var(--paper-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ fontSize: 13, color: 'var(--ink-sub)', margin: '0 0 12px', lineHeight: 1.9 }}>
            このプラン、役立ちましたか？ 別の条件で探すなら、トップの「条件で探す」からどうぞ。
          </p>
          <Link href="/#finder" className="btn-primary-light">別の条件で探す</Link>
        </section>
      </article>

      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}

function QuickItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontSize: 10,
          color: 'var(--ink-mute)',
          fontWeight: 600,
          letterSpacing: '.16em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mincho)' }}>{value}</span>
    </div>
  );
}
