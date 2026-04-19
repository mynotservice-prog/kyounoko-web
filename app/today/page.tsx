import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import { getTodayAnswer, type TodayQuery, type TodayAnswerResult } from '@/lib/articles';
import { getAreaName } from '@/lib/area';

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
    title: `今日はこれ${suffix}`,
    description: '条件から、今日の答えを1つだけ返します。',
    robots: { index: false, follow: true },
    alternates: { canonical: '/today' },
  };
}

function QuickMetaRow({ answer }: { answer: TodayAnswerResult }) {
  const chips: { key: string; label: string; tone: string }[] = [];
  if (answer.plan) {
    const p = answer.plan.plan;
    if (p.ageRanges[0]) chips.push({ key: 'age', label: `${p.ageRanges[0]}歳`, tone: 'clay' });
    if (p.place[0]) chips.push({ key: 'place', label: p.place[0] === 'home' ? '家' : p.place[0] === 'indoor' ? '屋内' : '外', tone: 'sage' });
    chips.push({ key: 'time', label: `${p.durationMin}分`, tone: 'ochre' });
    const bm: Record<string, string> = { free: '無料', low: '〜2,000円', mid: '〜5,000円', high: '5,000円〜' };
    chips.push({ key: 'budget', label: bm[p.budget] ?? p.budget, tone: 'sky' });
    if (p.area && p.area !== 'all') chips.push({ key: 'area', label: getAreaName(p.area), tone: 'clay' });
  } else if (answer.article) {
    const qi = answer.article.article.quickInfo;
    if (qi?.ageRanges?.[0]) chips.push({ key: 'age', label: `${qi.ageRanges[0]}歳`, tone: 'clay' });
    if (qi?.place?.[0]) chips.push({ key: 'place', label: qi.place[0] === 'home' ? '家' : qi.place[0] === 'indoor' ? '屋内' : '外', tone: 'sage' });
    if (qi?.durationMin) chips.push({ key: 'time', label: `${qi.durationMin}分`, tone: 'ochre' });
    if (qi?.budget) {
      const bm: Record<string, string> = { free: '無料', low: '〜2,000円', mid: '〜5,000円', high: '5,000円〜' };
      chips.push({ key: 'budget', label: bm[qi.budget] ?? qi.budget, tone: 'sky' });
    }
    if (answer.article.article.area && answer.article.article.area !== 'all') {
      chips.push({ key: 'area', label: getAreaName(answer.article.article.area), tone: 'clay' });
    }
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {chips.map((c) => (
        <span key={c.key} className={`meta-chip ${c.tone}`}>{c.label}</span>
      ))}
    </div>
  );
}

function AnswerCard({ answer, featured = false }: { answer: TodayAnswerResult; featured?: boolean }) {
  const isPlan = answer.kind === 'plan';
  if (featured) {
    return (
      <article className="answer-hero">
        {answer.hero && (
          <div
            className="answer-hero-img"
            role="img"
            aria-label={answer.title}
            style={{ backgroundImage: `url(${answer.hero})` }}
          />
        )}
        <div className="answer-hero-body">
          <span className="answer-eyebrow">
            {isPlan ? 'Today — 今日はこれ。' : 'Today — 今日の候補'}
          </span>
          <h2 className="answer-title">
            <Link href={answer.href}>{answer.title}</Link>
          </h2>
          {answer.shortAnswer && (
            <p className="answer-lede" style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>
              {answer.shortAnswer}
            </p>
          )}
          {answer.reasons.length > 0 && (
            <ul className="answer-reasons" aria-label="今日これにする理由">
              {answer.reasons.slice(0, 5).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
          <QuickMetaRow answer={answer} />
          <Link href={answer.href} className="answer-cta">
            {isPlan ? 'プランの詳細を見る' : '詳細を見る'}
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </article>
    );
  }

  return (
    <Link href={answer.href} className="alt-card">
      <div
        className="alt-card-thumb"
        style={{ backgroundImage: answer.hero ? `url(${answer.hero})` : undefined }}
        role="img"
        aria-label={answer.title}
      />
      <div className="alt-card-body">
        <h4 className="alt-card-title">{answer.title}</h4>
        <QuickMetaRow answer={answer} />
      </div>
    </Link>
  );
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
    area: firstString(sp.area),
  };

  const { top, alternatives, hasQuery, fallbackUsed } = getTodayAnswer(query);

  const activeChips: { key: string; label: string }[] = [];
  if (query.age) activeChips.push({ key: 'age', label: labelForValue('age', query.age) });
  if (query.area && query.area !== 'all') activeChips.push({ key: 'area', label: getAreaName(query.area) });
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
          <span>今日はこれ</span>
        </nav>
      </div>

      {activeChips.length > 0 && (
        <div className="container" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '.12em', marginRight: 4 }}>
              条件：
            </span>
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
                marginLeft: 8,
              }}
            >
              条件を変える
            </Link>
          </div>
        </div>
      )}

      <section className="section" style={{ paddingTop: 28 }}>
        <div className="container-narrow">
          {!hasQuery ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-sub)' }}>
              <p style={{ marginBottom: 16, fontSize: 15 }}>まだ条件が選ばれていません。</p>
              <Link href="/#finder" className="btn-primary-light">条件を選ぶ</Link>
            </div>
          ) : !top ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-sub)' }}>
              <p style={{ marginBottom: 16, fontSize: 15 }}>
                今日の条件に合う答えは、まだ準備中です。
              </p>
              <Link href="/#finder" className="btn-primary-light">条件を変える</Link>
            </div>
          ) : (
            <>
              {fallbackUsed && (
                <div className="fallback-note" role="status">
                  今日の条件にぴったりの答えはまだ準備中ですが、代わりに今日できることを1つ選びました。
                </div>
              )}

              <AnswerCard answer={top} featured />

              {alternatives.length > 0 && (
                <details className="alt-toggle">
                  <summary>別の候補を見る（{alternatives.length}件）</summary>
                  <div className="alt-list">
                    {alternatives.map((alt, i) => (
                      <AnswerCard key={i} answer={alt} />
                    ))}
                  </div>
                </details>
              )}
            </>
          )}
        </div>
      </section>

      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
