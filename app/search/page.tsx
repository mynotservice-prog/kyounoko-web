import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Img, V2SectionHead, V2Tag } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import { getAllFileArticles, type FileArticleMeta } from '@/lib/articles';
import { getAllPlanMetas, type PlanMeta } from '@/lib/plans';
import { articleToV2 } from '@/lib/v2-adapters';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export const metadata: Metadata = {
  title: 'サイト内検索',
  description:
    'きょうのこサイト内の記事をキーワードで検索できます。',
  alternates: { canonical: '/search' },
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
  const filteredPlans: PlanMeta[] = q
    ? getAllPlanMetas().filter((p) => matchesPlan(p, q)).slice(0, 20)
    : [];

  return (
    <V2Frame header="sub" active="search">
      <div className="v2-page-head" style={{ paddingTop: 6 }}>
        <h1
          className="v2-page-h1"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <V2Icon name="search" size={24} color="var(--v2-orange)" />
          {q ? `「${q}」の検索結果` : 'サイト内検索'}
        </h1>
        <p className="v2-page-lead">
          {q
            ? `キーワード「${q}」を含む記事 ${filtered.length} 件が見つかりました。`
            : 'キーワードを入力して、サイト内の記事を検索できます。'}
        </p>
      </div>

      {/* 検索フォーム */}
      <div className="v2-section" style={{ marginTop: 6 }}>
        <form
          method="get"
          action="/search"
          role="search"
          style={{ display: 'flex', gap: 8 }}
        >
          <label
            htmlFor="search-q"
            style={{
              position: 'absolute',
              width: 1, height: 1, padding: 0, margin: -1,
              overflow: 'hidden', clip: 'rect(0,0,0,0)',
              whiteSpace: 'nowrap', border: 0,
            }}
          >
            キーワード
          </label>
          <div
            className="v2-searchbar"
            style={{ flex: 1, paddingTop: 0, paddingBottom: 0 }}
          >
            <V2Icon name="search" size={19} color="var(--v2-ink-mute)" />
            <input
              id="search-q"
              type="search"
              name="q"
              defaultValue={q}
              placeholder="例: 離乳食、雨の日、ベビーカー"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: 15,
                fontFamily: 'inherit',
                background: 'transparent',
                padding: '10px 0',
              }}
            />
          </div>
          <button
            type="submit"
            className="v2-btn-primary"
            style={{
              width: 'auto',
              padding: '12px 22px',
              marginTop: 0,
              fontSize: 14,
            }}
          >
            検索
          </button>
        </form>
      </div>

      {/* プラン結果 */}
      {filteredPlans.length > 0 && (
        <>
          <V2SectionHead title={`「${q}」に合うプラン (${filteredPlans.length})`} more="" />
          <div className="v2-section" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredPlans.map((p) => (
              <Link
                key={p.id}
                href={`/plan/${p.id}`}
                className="v2-recent-feat"
              >
                <div
                  className="v2-imgwrap r"
                  style={{
                    width: 60, minWidth: 60, aspectRatio: '1/1',
                    background: 'var(--v2-orange-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <V2Icon name="sparkle" size={26} color="var(--v2-orange)" />
                </div>
                <div className="v2-rank-info">
                  <div className="v2-rank-title">{p.title}</div>
                  <div className="v2-art-sub">{p.shortAnswer}</div>
                </div>
                <V2Icon name="chevron-right" size={18} color="#ccc" />
              </Link>
            ))}
          </div>
        </>
      )}

      {/* 記事結果 */}
      <V2SectionHead
        title={q ? `記事 (${filtered.length})` : `全記事 (${filtered.length})`}
        more=""
      />
      {filtered.length === 0 ? (
        <div className="v2-empty-state">
          <div className="v2-empty-ill">
            <V2Icon name="search" size={40} color="#e9c9ac" />
          </div>
          <div className="v2-empty-title">
            条件に合う記事が
            <br />
            見つかりませんでした
          </div>
          <div className="v2-empty-sub">
            別のキーワードでお試しください。
          </div>
        </div>
      ) : (
        <div className="v2-vlist">
          {filtered.slice(0, 40).map((a) => {
            const v = articleToV2(a);
            return (
              <Link
                key={a.slug}
                href={`/article/${a.slug}`}
                className="v2-card-row"
              >
                <div
                  className="v2-imgwrap"
                  style={{
                    width: 100, minWidth: 100, aspectRatio: '1/1',
                    borderRadius: 14, position: 'relative',
                  }}
                >
                  <V2Img src={v.img} seed={a.slug} alt={a.title} />
                </div>
                <div className="v2-card-row-body">
                  <div className="v2-card-row-title">{a.title}</div>
                  {a.lede && (
                    <div className="v2-art-sub">{a.lede.slice(0, 70)}</div>
                  )}
                  {v.tags && v.tags.length > 0 && (
                    <div className="v2-tag-row">
                      {v.tags.map((t, i) => (
                        <V2Tag key={i} label={t} tone={i === 0 ? 'age' : ''} />
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {filtered.length > 40 && (
        <div className="v2-section" style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--v2-ink-mute)' }}>
            全{filtered.length}件中 40件を表示
          </p>
        </div>
      )}

      <div style={{ height: 24 }}></div>
    </V2Frame>
  );
}
