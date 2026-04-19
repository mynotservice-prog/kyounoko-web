import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import { getPlan, getAllPlanIds } from '@/lib/plans';
import { getFileArticle } from '@/lib/articles';
import { getAreaName } from '@/lib/area';

export const revalidate = 3600;

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

export default async function PlanPage({ params }: Props) {
  const { id } = await params;
  const plan = getPlan(id);
  if (!plan) notFound();

  const html = await renderBody(plan.body);
  const related = plan.seoRelated ? await getFileArticle(plan.seoRelated) : null;

  const budgetLabels: Record<string, string> = {
    free: '無料',
    low: '〜2,000円',
    mid: '〜5,000円',
    high: '5,000円〜',
  };

  return (
    <>
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

      <article className="container-article" style={{ paddingTop: 20 }}>
        <header className="page-head">
          <span className="eyebrow">Today&apos;s plan — 今日の行動プラン</span>
          <h1>{plan.title}</h1>
          <p className="lead">{plan.shortAnswer}</p>
        </header>

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
                  aspectRatio: '16 / 6',
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
