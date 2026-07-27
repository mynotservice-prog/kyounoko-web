import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Img, V2SectionHead, V2Tag } from '@/components/v2/V2Base';
import { V2Icon } from '@/components/v2/V2Icon';
import { getAllFileArticles, type FileArticleMeta } from '@/lib/articles';
import { getAllPlanMetas, type PlanMeta } from '@/lib/plans';
import { getAllSpotsWithSlug } from '@/lib/spots';
import { getRuntimeSpotOverrides } from '@/lib/spot-overrides';
import { EVENTS } from '@/lib/events';
import { articleToV2, spotToV2 } from '@/lib/v2-adapters';

export const dynamic = 'force-dynamic';

const PER_PAGE = 50;

type Props = {
  searchParams: Promise<{ q?: string; p?: string }>;
};

/** ツール固定リスト（コードで定義、検索対象に含める） */
const TOOLS = [
  {
    id: 'babycar-shindan',
    title: 'ベビーカー診断',
    lede: 'A型/B型/三輪/コンパクト等、家族の生活に合う1台を3分で診断',
    keywords: 'ベビーカー A型 B型 三輪 軽量 コンパクト 診断',
    href: '/tools/babycar-shindan',
  },
  {
    id: 'naraigoto-match',
    title: '習い事マッチ',
    lede: '年齢・興味・予算から子どもに合う習い事を提案（スイミング/ピアノ/英会話等）',
    keywords: '習い事 ピアノ スイミング 英会話 リトミック 体操 そろばん プログラミング',
    href: '/tools/naraigoto-match',
  },
  {
    id: 'odekake-type',
    title: 'おでかけタイプ診断',
    lede: 'あなたの家族にぴったりのおでかけスタイル（屋内派/屋外派/まったり派等）を診断',
    keywords: 'おでかけ タイプ 診断 屋内 屋外 まったり アクティブ',
    href: '/tools/odekake-type',
  },
];

type SearchResult = {
  kind: 'article' | 'spot' | 'tool' | 'event';
  id: string;
  title: string;
  sub?: string;
  href: string;
  img?: string;
  tags?: string[];
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
  const page = Math.max(1, parseInt(sp.p ?? '1', 10) || 1);
  const nq = normalize(q);

  // 記事
  const allArticles = getAllFileArticles().filter((a) => !a.noindex);
  const filtered = q
    ? allArticles.filter((a) => matchesQuery(a, q))
    : [...allArticles].sort((a, b) => a.title.localeCompare(b.title, 'ja'));

  // プラン（30件まで）
  const filteredPlans: PlanMeta[] = q
    ? getAllPlanMetas().filter((p) => matchesPlan(p, q)).slice(0, 30)
    : [];

  // ツール（クエリ無し時も全件表示）
  const filteredTools = !q
    ? TOOLS
    : TOOLS.filter((t) => {
        const f = normalize(`${t.title} ${t.lede} ${t.keywords}`);
        return f.includes(nq);
      });

  // スポット（クエリありの時のみ、20件まで）。Admin(KV)上書きを適用して検索名に即時反映。
  const filteredSpots = q
    ? getAllSpotsWithSlug(await getRuntimeSpotOverrides())
        .filter((x) => {
          const f = normalize(
            `${x.spot.name} ${x.spot.ward ?? ''} ${x.spot.city ?? ''} ${x.spot.note ?? ''} ${x.spot.nearestStation ?? ''}`,
          );
          return f.includes(nq);
        })
        .slice(0, 20)
    : [];

  // イベント（クエリありの時のみ、20件まで）
  const filteredEvents = q
    ? EVENTS.filter((e) => {
        const f = normalize(`${e.title} ${e.lede} ${e.venue} ${e.city ?? ''} ${(e.tags ?? []).join(' ')}`);
        return f.includes(nq);
      }).slice(0, 20)
    : [];

  // 記事ページング
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedArticles = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  return (
    <V2Frame header="sub">
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

      {/* ツール（診断・マッチング） */}
      {filteredTools.length > 0 && (
        <>
          <V2SectionHead title={q ? `診断・ツール (${filteredTools.length})` : '診断・ツール'} more="" />
          <div className="v2-section" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredTools.map((t) => (
              <Link
                key={t.id}
                href={t.href}
                className="v2-recent-feat"
              >
                <div
                  className="v2-imgwrap r"
                  style={{
                    width: 60, minWidth: 60, aspectRatio: '1/1',
                    background: 'var(--v2-c-event-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <V2Icon name="sparkle" size={26} color="var(--v2-c-event)" />
                </div>
                <div className="v2-rank-info">
                  <div className="v2-rank-title">{t.title}</div>
                  <div className="v2-art-sub">{t.lede}</div>
                </div>
                <V2Icon name="chevron-right" size={18} color="#ccc" />
              </Link>
            ))}
          </div>
        </>
      )}

      {/* スポット */}
      {filteredSpots.length > 0 && (
        <>
          <V2SectionHead title={`スポット (${filteredSpots.length})`} more="" />
          <div className="v2-vlist">
            {filteredSpots.map((x) => {
              const v = spotToV2(x.spot);
              return (
                <Link
                  key={x.slug}
                  href={`/spot/${x.slug}`}
                  className="v2-art-row"
                >
                  <div
                    className="v2-imgwrap r"
                    style={{ width: 88, minWidth: 88, height: 72 }}
                  >
                    <V2Img src={v.img} seed={x.slug} alt={x.spot.name} />
                  </div>
                  <div className="v2-art-body">
                    <div
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: 'var(--v2-orange-deep)',
                      }}
                    >
                      {v.cat}
                    </div>
                    <div className="v2-art-title" style={{ marginTop: 2 }}>
                      {x.spot.name}
                    </div>
                    <div className="v2-art-sub">{v.station || v.area}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* イベント */}
      {filteredEvents.length > 0 && (
        <>
          <V2SectionHead title={`イベント (${filteredEvents.length})`} more="" />
          <div className="v2-vlist">
            {filteredEvents.map((e) => (
              <Link key={e.slug} href={`/event/${e.slug}`} className="v2-art-row">
                <div
                  className="v2-imgwrap r"
                  style={{ width: 88, minWidth: 88, height: 72, background: 'var(--v2-orange-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <V2Icon name="calendar" size={28} color="var(--v2-orange)" />
                </div>
                <div className="v2-art-body">
                  <div className="v2-art-title">{e.title}</div>
                  <div className="v2-art-sub">
                    {e.startDate.replace(/-/g, '/')}〜{e.endDate.replace(/-/g, '/')}・{e.venue}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

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
          {pagedArticles.map((a) => {
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

      {/* ページング */}
      {totalPages > 1 && (
        <div className="v2-section" style={{ marginTop: 24 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            {currentPage > 1 ? (
              <Link
                href={`/search?${new URLSearchParams({ ...(q ? { q } : {}), p: String(currentPage - 1) }).toString()}`}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--v2-r-pill)',
                  border: '1.5px solid var(--v2-orange)',
                  color: 'var(--v2-orange-deep)',
                  fontWeight: 800,
                  fontSize: 14,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <V2Icon name="chevron-left" size={15} color="var(--v2-orange-deep)" />
                前のページ
              </Link>
            ) : (
              <span style={{ flex: 1 }} />
            )}
            <span
              style={{
                fontSize: 13,
                color: 'var(--v2-ink-mute)',
                fontWeight: 700,
              }}
            >
              {currentPage} / {totalPages} ページ（全{filtered.length}件）
            </span>
            {currentPage < totalPages ? (
              <Link
                href={`/search?${new URLSearchParams({ ...(q ? { q } : {}), p: String(currentPage + 1) }).toString()}`}
                className="v2-btn-primary"
                style={{
                  width: 'auto',
                  padding: '10px 18px',
                  marginTop: 0,
                  fontSize: 14,
                }}
              >
                次のページ
                <V2Icon name="chevron-right" size={15} color="#fff" />
              </Link>
            ) : (
              <span style={{ flex: 1 }} />
            )}
          </div>
        </div>
      )}

      <div style={{ height: 24 }}></div>
    </V2Frame>
  );
}
