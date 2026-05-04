import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import { getAllFileArticles, type FileArticleMeta } from '@/lib/articles';
import { getAllPlanMetas, type PlanMeta } from '@/lib/plans';

/**
 * サイト内検索ページ。
 *
 * Google の WebSite SearchAction（potentialAction）が機能するために、
 * `/search?q=XXX` という URL で実際に検索結果を返す必要がある。
 *
 * ## 仕様
 * - q パラメータがあればタイトル / lede / metaDescription を部分一致でフィルタ
 * - q パラメータが無ければ全記事をアルファベット順（タイトル順）で一覧
 * - 結果はサーバーサイドで生成（クライアントJS不要）
 *
 * ## 注意
 * - next.config.ts の `/search → /` リダイレクトは削除済み
 * - 軽量実装（160記事程度なら線形検索で十分）
 */

// 検索クエリ毎に動的レンダリング（クエリのバリエーションが多いため static は不向き）
export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export const metadata: Metadata = {
  title: 'サイト内検索',
  description:
    'きょうのこサイト内の記事をキーワードで検索できます。子育て・育児の悩みから記事を見つけてください。',
  alternates: { canonical: '/search' },
  // 検索結果ページ自体は薄いページなので noindex
  robots: { index: false, follow: true },
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s　]+/g, '');
}

function matchesQuery(article: FileArticleMeta, q: string): boolean {
  const nq = normalize(q);
  if (!nq) return true;
  const fields = [article.title, article.lede, article.metaDescription]
    .filter(Boolean)
    .map((v) => normalize(String(v)));
  return fields.some((f) => f.includes(nq));
}

function matchesPlan(plan: PlanMeta, q: string): boolean {
  const nq = normalize(q);
  if (!nq) return true;
  const fields = [plan.title, plan.shortAnswer, plan.id]
    .filter(Boolean)
    .map((v) => normalize(String(v)));
  return fields.some((f) => f.includes(nq));
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const all = getAllFileArticles().filter((a) => !a.noindex);
  const filtered = q
    ? all.filter((a) => matchesQuery(a, q))
    : [...all].sort((a, b) => a.title.localeCompare(b.title, 'ja'));

  // プランも q に部分一致で検索（最大20件、上位スコア順）
  const filteredPlans: PlanMeta[] = q
    ? getAllPlanMetas().filter((p) => matchesPlan(p, q)).slice(0, 20)
    : [];

  return (
    <>
      <SiteHeader />
      <main className="container-article" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <header className="page-head" style={{ marginBottom: 32 }}>
          <span className="eyebrow">Search · サイト内検索</span>
          <h1>{q ? `「${q}」の検索結果` : 'サイト内検索'}</h1>
          <p className="lead">
            {q
              ? `キーワード「${q}」を含む記事 ${filtered.length} 件が見つかりました。`
              : 'キーワードを入力して、サイト内の記事を検索できます。'}
          </p>
        </header>

        <form
          method="get"
          action="/search"
          role="search"
          style={{
            display: 'flex',
            gap: 12,
            margin: '8px 0 36px',
            flexWrap: 'wrap',
          }}
        >
          <label
            htmlFor="search-q"
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: 'hidden',
              clip: 'rect(0,0,0,0)',
              whiteSpace: 'nowrap',
              border: 0,
            }}
          >
            キーワード
          </label>
          <input
            id="search-q"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="例: 離乳食、雨の日、ベビーカー"
            style={{
              flex: '1 1 320px',
              minWidth: 220,
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--line)',
              background: 'var(--paper-card)',
              fontSize: 15,
              fontFamily: 'inherit',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'var(--clay-deep, #c9603e)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            検索
          </button>
        </form>

        {filteredPlans.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 17, marginBottom: 12 }}>
              プラン（{filteredPlans.length}件）
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>
              {filteredPlans.map((p) => (
                <li
                  key={p.id}
                  style={{
                    background: 'var(--paper-card)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                  }}
                >
                  <Link href={`/plan/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '.1em',
                        color: '#fff',
                        background: 'var(--clay)',
                        padding: '2px 8px',
                        borderRadius: 999,
                      }}>{p.kind === 'meal' ? 'レシピ' : 'プラン'}</span>
                      <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, lineHeight: 1.45 }}>
                        {p.title}
                      </h3>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--ink-sub)', margin: 0, lineHeight: 1.6 }}>
                      {p.shortAnswer.slice(0, 110)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {filtered.length > 0 && q && (
          <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 17, marginBottom: 12 }}>
            記事（{filtered.length}件）
          </h2>
        )}

        {filtered.length === 0 && filteredPlans.length === 0 && q ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: 'var(--ink-sub)',
              background: 'var(--paper-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--line)',
            }}
          >
            <p>該当する記事が見つかりませんでした。</p>
            <p style={{ marginTop: 12, fontSize: 14 }}>
              別のキーワードでお試しいただくか、{' '}
              <Link href="/" style={{ color: 'var(--clay-deep, #c9603e)' }}>
                トップページ
              </Link>
              {' '}から記事を探してください。
            </p>
          </div>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gap: 16,
            }}
          >
            {filtered.map((a) => (
              <li
                key={a.slug}
                style={{
                  background: 'var(--paper-card)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                }}
              >
                <Link
                  href={`/article/${a.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <h2
                    style={{
                      fontFamily: 'var(--font-mincho)',
                      fontSize: 16,
                      fontWeight: 600,
                      margin: '0 0 6px',
                      lineHeight: 1.55,
                    }}
                  >
                    {a.title}
                  </h2>
                  {(a.lede || a.metaDescription) && (
                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--ink-sub)',
                        margin: 0,
                        lineHeight: 1.7,
                      }}
                    >
                      {(a.lede || a.metaDescription).slice(0, 140)}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
