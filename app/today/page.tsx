import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import { getMatchedFileArticles, type TodayQuery } from '@/lib/articles';

export const revalidate = 3600;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstString(v: string | string[] | undefined): string | undefined {
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function labelForValue(key: string, value: string): string {
  const map: Record<string, Record<string, string>> = {
    age: { '0-1': '0〜1歳', '2-3': '2〜3歳', '4-6': '4〜6歳' },
    weather: { sunny: '晴れ', rain: '雨', heat: '猛暑', cold: '寒い' },
    place: { home: '家で', outside: '外で' },
    day: { weekday: '平日', holiday: '休日' },
    duration: { '15': '15分', '60': '1時間', '120': '半日', '240': '1日' },
    budget: { free: '無料', low: '〜2,000円', mid: '〜5,000円' },
  };
  return map[key]?.[value] ?? value;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const parts: string[] = [];
  if (sp.age) parts.push(labelForValue('age', firstString(sp.age)!));
  if (sp.weather) parts.push(labelForValue('weather', firstString(sp.weather)!));
  if (sp.place) parts.push(labelForValue('place', firstString(sp.place)!));
  if (sp.duration) parts.push(labelForValue('duration', firstString(sp.duration)!));

  const suffix = parts.length ? `（${parts.join('・')}）` : '';
  return {
    // 親 layout の template (%s｜きょうのこ) が適用されるので、ここでは本文タイトルだけ返す
    title: `今日のおすすめ${suffix}`,
    description: '年齢・天気・家or外・時間・予算から、今日の過ごし方の候補を絞り込んだ結果です。',
    robots: { index: false, follow: true }, // 条件組み合わせ無限のためnoindex
    alternates: { canonical: '/today' },
  };
}

export default async function TodayPage({ searchParams }: Props) {
  const sp = await searchParams;
  const query: TodayQuery = {
    age: firstString(sp.age),
    weather: firstString(sp.weather),
    place: firstString(sp.place),
    day: firstString(sp.day),
    duration: firstString(sp.duration),
    budget: firstString(sp.budget),
  };

  const hasQuery = Object.values(query).some((v) => v);
  const articles = hasQuery ? getMatchedFileArticles(query, 24) : [];

  const activeChips: { key: string; label: string }[] = [];
  if (query.age) activeChips.push({ key: 'age', label: labelForValue('age', query.age) });
  if (query.weather && query.weather !== 'any') activeChips.push({ key: 'weather', label: labelForValue('weather', query.weather) });
  if (query.place && query.place !== 'any') activeChips.push({ key: 'place', label: labelForValue('place', query.place) });
  if (query.day && query.day !== 'any') activeChips.push({ key: 'day', label: labelForValue('day', query.day) });
  if (query.duration) activeChips.push({ key: 'duration', label: labelForValue('duration', query.duration) });
  if (query.budget && query.budget !== 'any') activeChips.push({ key: 'budget', label: labelForValue('budget', query.budget) });

  return (
    <>
      <SiteHeader />

      <div className="container">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <span>今日のおすすめ</span>
        </nav>
      </div>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container">
          <header className="page-head" style={{ paddingTop: 16 }}>
            <span className="eyebrow">Today · 3min match</span>
            <h1>今日のおすすめ</h1>
            <p className="lead">
              {hasQuery
                ? `選択した条件に合う記事を${articles.length}件ピックアップしました。`
                : '条件を選ぶと、今日の過ごし方の候補が出ます。トップページの「3分で決める」からどうぞ。'}
            </p>
          </header>

          {/* Active filters */}
          {activeChips.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '24px 0 12px' }} aria-label="選択中の条件">
              {activeChips.map((c) => (
                <span key={c.key} className="meta-chip clay" style={{ fontSize: 12 }}>
                  {c.label}
                </span>
              ))}
              <Link
                href="/#finder"
                style={{
                  fontSize: 12,
                  color: 'var(--ink-sub)',
                  textDecoration: 'underline',
                  alignSelf: 'center',
                  marginLeft: 8,
                }}
              >
                条件を変更する
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {!hasQuery ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-sub)' }}>
              <p style={{ marginBottom: 20 }}>まだ条件が選ばれていません。</p>
              <Link href="/#finder" className="btn-primary-light">条件を選ぶ</Link>
            </div>
          ) : articles.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-sub)' }}>
              <p style={{ marginBottom: 20 }}>
                条件にぴったりの記事が見つかりませんでした。条件を少しゆるめてみてください。
              </p>
              <Link href="/#finder" className="btn-primary-light">条件を変える</Link>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: 20,
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              }}
            >
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/article/${article.slug}`}
                  style={{
                    background: 'var(--paper-card)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      aspectRatio: '16/10',
                      backgroundColor: 'var(--peach-soft)',
                      backgroundImage: article.hero ? `url(${article.hero})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div style={{ padding: '16px 20px 22px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--font-mincho)', fontSize: 16, fontWeight: 600, margin: 0, lineHeight: 1.55 }}>
                      {article.title}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
                      {article.quickInfo?.ageRanges?.slice(0, 1).map((age) => (
                        <span key={age} className="meta-chip clay">{age}歳</span>
                      ))}
                      {article.quickInfo?.place?.slice(0, 1).map((p) => (
                        <span key={p} className="meta-chip sage">{p === 'home' ? '家' : p === 'indoor' ? '屋内' : '外'}</span>
                      ))}
                      {article.quickInfo?.weather?.includes('rain' as never) && (
                        <span className="meta-chip sky">雨OK</span>
                      )}
                      {article.quickInfo?.durationMin && (
                        <span className="meta-chip" style={{ background: 'var(--paper-soft)' }}>{article.quickInfo.durationMin}分</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
