import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import {
  getTodayAnswer,
  getRelatedArticlesForQuery,
  type TodayQuery,
  type TodayAnswerResult,
  type FileArticleMeta,
} from '@/lib/articles';
import { buildDayPlan, type DayPlanSlot } from '@/lib/plans';
import { getKidFriendlyRestaurants, type Spot } from '@/lib/spots';
import type { AreaSlug } from '@/lib/area';
import { getAreaName } from '@/lib/area';
import { getItemsForTodayQuery } from '@/lib/items-catalog';
import { ShareBar } from '@/components/article/ShareBar';
import { AffiliateLink } from '@/components/affiliate/AffiliateLink';
import { AdSlot } from '@/components/ads/AdSlot';

export const revalidate = 3600;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const CATEGORY_LABEL: Record<string, string> = {
  'today-doko': '今日どこ行く',
  'today-nani': '今日何する',
  'today-taberu': '今日何食べる',
  'today-mawasu': '今日どう回す',
  'shippai-shinai': '失敗しない外出',
  tenki: '天気で決める',
  'heijitsu-yoru': '平日夜を回す',
  gyouji: '季節と行事',
  narai: '習い事と学び',
  yakudatsu: '役立つもの',
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
  const chips: { key: string; label: string; tone: string; emoji?: string }[] = [];
  if (answer.plan) {
    const p = answer.plan.plan;
    if (p.ageRanges[0]) chips.push({ key: 'age', label: `${p.ageRanges[0]}歳`, tone: 'clay', emoji: '👶' });
    if (p.place[0]) chips.push({ key: 'place', label: p.place[0] === 'home' ? '家' : p.place[0] === 'indoor' ? '屋内' : '外', tone: 'sage', emoji: p.place[0] === 'home' ? '🏠' : '🚶' });
    chips.push({ key: 'time', label: `${p.durationMin}分`, tone: 'ochre', emoji: '⏱' });
    const bm: Record<string, string> = { free: '無料', low: '〜2,000円', mid: '〜5,000円', high: '5,000円〜' };
    chips.push({ key: 'budget', label: bm[p.budget] ?? p.budget, tone: 'sky', emoji: '💴' });
    if (p.area && p.area !== 'all') chips.push({ key: 'area', label: getAreaName(p.area), tone: 'clay', emoji: '📍' });
  } else if (answer.article) {
    const qi = answer.article.article.quickInfo;
    if (qi?.ageRanges?.[0]) chips.push({ key: 'age', label: `${qi.ageRanges[0]}歳`, tone: 'clay', emoji: '👶' });
    if (qi?.place?.[0]) chips.push({ key: 'place', label: qi.place[0] === 'home' ? '家' : qi.place[0] === 'indoor' ? '屋内' : '外', tone: 'sage', emoji: qi.place[0] === 'home' ? '🏠' : '🚶' });
    if (qi?.durationMin) chips.push({ key: 'time', label: `${qi.durationMin}分`, tone: 'ochre', emoji: '⏱' });
    if (qi?.budget) {
      const bm: Record<string, string> = { free: '無料', low: '〜2,000円', mid: '〜5,000円', high: '5,000円〜' };
      chips.push({ key: 'budget', label: bm[qi.budget] ?? qi.budget, tone: 'sky', emoji: '💴' });
    }
    if (answer.article.article.area && answer.article.article.area !== 'all') {
      chips.push({ key: 'area', label: getAreaName(answer.article.article.area), tone: 'clay', emoji: '📍' });
    }
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {chips.map((c) => (
        <span key={c.key} className={`meta-chip ${c.tone}`}>
          {c.emoji && <span aria-hidden="true" style={{ marginRight: 4, fontSize: '1.05em' }}>{c.emoji}</span>}
          {c.label}
        </span>
      ))}
    </div>
  );
}

/**
 * 「いいところ」を1行で訴求する強調チップ群。
 * 結果カードの shortAnswer 直下に置いて、ユーザーが秒で「自分向き」と判断できるようにする。
 * メタチップ（年齢/時間/予算）と違って“感情面のメリット”を強調する役割。
 */
function HighlightChips({ answer }: { answer: TodayAnswerResult }) {
  if (!answer.plan) return null;
  const p = answer.plan.plan;
  const chips: { label: string; tone: string }[] = [];
  if (p.durationMin <= 15) chips.push({ label: '⏱ 5分で始められる', tone: 'sage' });
  if (p.budget === 'free') chips.push({ label: '💰 完全無料', tone: 'ochre' });
  if (p.place.includes('home') && !p.place.includes('outdoor')) chips.push({ label: '🏠 家にあるものでOK', tone: 'sky' });
  if (p.place.includes('outdoor') || p.place.includes('indoor')) chips.push({ label: '🚶 予約不要で行ける', tone: 'sky' });
  if (p.weather.includes('rain')) chips.push({ label: '☔ 雨でもいける', tone: 'clay' });
  if (p.weather.includes('heat')) chips.push({ label: '🥵 猛暑日OK', tone: 'clay' });
  if (p.weather.includes('cold')) chips.push({ label: '❄️ 寒い日OK', tone: 'clay' });
  if (chips.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, marginBottom: 4 }}>
      {chips.slice(0, 4).map((c) => (
        <span
          key={c.label}
          className={`meta-chip ${c.tone}`}
          style={{ fontSize: 11.5, fontWeight: 600 }}
        >
          {c.label}
        </span>
      ))}
    </div>
  );
}

/**
 * 「やる前の3秒準備」ブロック — 結果カードの直下に挿入。
 * Plan種別ごとに具体的な準備物・回避ポイントを出すことで、結果1個出した後の
 * "実行までの距離"を縮める。Finderの実用度UP施策。
 */
function PreparedBlock({ answer }: { answer: TodayAnswerResult }) {
  if (!answer.plan) return null;
  const p = answer.plan.plan;
  const isMeal = p.kind === 'meal';
  const isHome = p.place.includes('home');
  const isOutdoor = p.place.includes('outdoor');

  // プラン種別ごとに「失敗回避3ポイント」を動的生成
  const tips: string[] = [];
  if (isMeal) {
    tips.push('調理前に食材を全部出しておく — 途中で「あれがない」を防ぐ');
    tips.push('味付けは大人より薄め、慣れないものは小さじ1から');
    tips.push('子供が食べ始めたら30秒は様子観察（誤嚥・アレルギー兆候）');
  } else if (isHome) {
    tips.push('道具を全部出してから始める — 中断ストレス減');
    tips.push('開始前にトイレ・水分・おやつを済ませておく');
    tips.push('子の集中が切れたら「もう1回」より「別のに切替」が正解');
  } else if (isOutdoor) {
    tips.push('出発前にトイレ・着替え・水筒・保険証 を再確認');
    tips.push('混雑回避は朝イチか14時以降がベスト');
    tips.push('予定の8割が回れたら大成功、無理に詰め込まない');
  } else {
    tips.push('まず5分やってみる — 続くか判断は後');
    tips.push('「うまくいかない日」は別案に切替OK');
    tips.push('終了時に子と「楽しかった」を確認、習慣化のキー');
  }

  return (
    <aside
      style={{
        marginTop: 24,
        padding: '18px 20px',
        background: 'linear-gradient(135deg, rgba(20,147,209,0.06), rgba(201,96,62,0.04))',
        border: '1px solid rgba(20,147,209,0.18)',
        borderRadius: 14,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--clay-deep)', textTransform: 'uppercase', marginBottom: 8 }}>
        ⚠️ やる前に3秒で確認
      </div>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: 'var(--ink-sub)', lineHeight: 1.85 }}>
        {tips.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </aside>
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
          <HighlightChips answer={answer} />
          {answer.reasons.length > 0 && (
            <ul className="answer-reasons" aria-label="今日これにする理由">
              {answer.reasons.slice(0, 5).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
          <QuickMetaRow answer={answer} />
          <PreparedBlock answer={answer} />
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

function RelatedArticleCard({ article }: { article: FileArticleMeta }) {
  return (
    <Link href={`/article/${article.slug}`} className="today-related-card">
      <div
        className="today-related-thumb"
        style={{ backgroundImage: article.hero ? `url(${article.hero})` : undefined }}
        role="img"
        aria-label={article.title}
      />
      <div className="today-related-body">
        <span className="today-related-cat">
          {article.categoryName ?? CATEGORY_LABEL[article.category] ?? article.category}
        </span>
        <h4 className="today-related-title">{article.title}</h4>
      </div>
    </Link>
  );
}

/**
 * 結果ページから親カテゴリへの橋渡しチップ。
 * top answer の category または query.place / day から派生して、
 * 「もっと見る」誘導を作る。
 */
function buildRelatedCategoryChips(
  query: TodayQuery,
  top: TodayAnswerResult | null,
): { label: string; href: string }[] {
  const chips: { label: string; href: string }[] = [];
  const seen = new Set<string>();

  function push(label: string, href: string) {
    if (seen.has(href)) return;
    seen.add(href);
    chips.push({ label, href });
  }

  // top answer の category
  if (top?.article?.article.category) {
    const cat = top.article.article.category;
    push(`${CATEGORY_LABEL[cat] ?? cat}を全部見る`, `/category/${cat}`);
  }

  // query から派生
  if (query.place === 'home') {
    push('家で過ごす（今日何する）', '/category/today-nani');
  } else if (query.place === 'outside') {
    push('お出かけ（今日どこ行く）', '/category/today-doko');
  }

  if (query.day === 'weekday') {
    push('平日夜を回す', '/category/today-mawasu');
  } else if (query.day === 'holiday') {
    push('季節と行事', '/category/gyouji');
  }

  if (query.weather === 'rain') {
    push('雨でもいける屋内', '/article/amenohi-indoor-spots-tokyo-15');
  } else if (query.weather === 'heat') {
    push('猛暑日OKな涼しい屋内', '/article/moushobi-suzushii-spots');
  }

  // 補完：常に「失敗しない外出」を入れる
  push('失敗しない外出のコツ', '/category/shippai-shinai');

  return chips.slice(0, 5);
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
    mode: firstString(sp.mode) as TodayQuery['mode'],
    mealTime: firstString(sp.mealTime) as TodayQuery['mealTime'],
  };

  const { top, alternatives, hasQuery, fallbackUsed } = getTodayAnswer(query);

  // 「家で過ごす」モード（home）かつ年齢指定があるとき、1日通しプランを生成。
  // 朝食・午前活動・昼食・午後活動・おやつ・夕食 の6スロット。
  let dayPlan: DayPlanSlot[] | null = null;
  if (query.mode === 'home' && query.age && (query.duration === '240' || !query.duration)) {
    dayPlan = buildDayPlan({
      age: query.age,
      weather: query.weather,
      day: query.day,
      area: query.area,
    });
  }

  // eat × 外で食べる モード：子連れOKレストラン（ファミレス特集）を表示
  let restaurants: { area: AreaSlug; spot: Spot }[] = [];
  if (query.mode === 'eat' && query.place === 'outside') {
    restaurants = getKidFriendlyRestaurants(query.area, {
      age: query.age as '0-1' | '2-3' | '4-6' | undefined,
      budget: query.budget as 'free' | 'low' | 'mid' | 'high' | undefined,
      limit: 12,
    });
  }

  const activeChips: { key: string; label: string }[] = [];
  if (query.age) activeChips.push({ key: 'age', label: labelForValue('age', query.age) });
  if (query.area && query.area !== 'all') activeChips.push({ key: 'area', label: getAreaName(query.area) });
  if (query.weather && query.weather !== 'any') activeChips.push({ key: 'weather', label: labelForValue('weather', query.weather) });
  if (query.place && query.place !== 'any') activeChips.push({ key: 'place', label: labelForValue('place', query.place) });
  if (query.day && query.day !== 'any') activeChips.push({ key: 'day', label: labelForValue('day', query.day) });
  if (query.duration) activeChips.push({ key: 'duration', label: labelForValue('duration', query.duration) });
  if (query.budget && query.budget !== 'any') activeChips.push({ key: 'budget', label: labelForValue('budget', query.budget) });

  // 関連記事の算出（top答えと、プランのseoRelatedを除外）
  const excludeSlugs: string[] = [];
  if (top?.article) excludeSlugs.push(top.article.article.slug);
  if (top?.plan?.plan.seoRelated) excludeSlugs.push(top.plan.plan.seoRelated);
  const relatedArticles = top
    ? getRelatedArticlesForQuery(query, { excludeSlugs, limit: 4 })
    : [];

  // 関連グッズ
  const relatedItems = top ? getItemsForTodayQuery(query, 3) : [];

  // 関連カテゴリチップ
  const categoryChips = top ? buildRelatedCategoryChips(query, top) : [];

  // シェア用URL（条件付きで再現可能なURL）
  const shareParams = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v && v !== 'any' && v !== 'all') shareParams.set(k, String(v));
  });
  const shareUrl = `https://kyounoko.jp/today${shareParams.toString() ? `?${shareParams.toString()}` : ''}`;
  const shareTitle = top ? `今日はこれ：${top.title}` : '今日の答え - きょうのこ';

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

              {/* AdSense: 結果カード直下（in-article）。
                  /today は TodayFinder の全トラフィックが着地する最重要ページ。
                  本文相当のコンテンツが下に続くので in-article フォーマットが自然。 */}
              <AdSlot placement="article-mid" style={{ marginTop: 28 }} />

              {/* 食べる×外で食べる モード：子連れOKファミレス特集 */}
              {restaurants.length > 0 && (
                <section className="restaurant-spots">
                  <h3 className="today-section-title">
                    <span className="today-section-eyebrow">Family-friendly restaurants</span>
                    子連れ歓迎ファミレス・カフェ {restaurants.length}店
                  </h3>
                  <p className="today-section-lede">
                    ベビーカー入店OK・キッズメニュー・キッズチェアありの実在店舗。
                    {query.area && query.area !== 'all'
                      ? `${getAreaName(query.area)}エリアから厳選。`
                      : '全国の人気店を popular順で。'}
                  </p>
                  <ul className="restaurant-list">
                    {restaurants.map(({ spot }, i) => (
                      <li key={i} className="restaurant-card">
                        <div className="restaurant-name">
                          {spot.popular && <span className="trending-badge">人気</span>}
                          <span dangerouslySetInnerHTML={{ __html: spot.name }} />
                        </div>
                        {spot.note && <p className="restaurant-note">{spot.note}</p>}
                        {spot.hiddenTip && <p className="restaurant-tip">💡 {spot.hiddenTip}</p>}
                        <div className="restaurant-meta">
                          {spot.ages?.length > 0 && (
                            <span>対象: {spot.ages.join(' / ')}歳</span>
                          )}
                          {spot.budget && <span>予算: {spot.budget === 'free' ? '無料' : spot.budget === 'low' ? '〜2,000円' : spot.budget === 'mid' ? '〜5,000円' : '5,000円〜'}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* 駅から探すCTA: 東京エリア × 外モード時のみ表示
                  484駅×3,000ページの巨大ロングテール群への入り口。
                  「もっと細かく駅で絞りたい」ニーズに応える */}
              {query.area === 'tokyo' && (query.place !== 'home') && (
                <section style={{ margin: '32px 0' }}>
                  <Link href="/station" style={{
                    display: 'block',
                    background: 'linear-gradient(135deg, rgba(201,96,62,0.08), rgba(201,96,62,0.03))',
                    border: '1px solid rgba(201,96,62,0.20)',
                    borderRadius: 16,
                    padding: '20px 24px',
                    textDecoration: 'none',
                    color: 'var(--ink)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <div style={{ fontSize: 11, color: 'var(--clay-deep)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4 }}>
                          DEEPER · 駅から絞り込む
                        </div>
                        <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 2 }}>
                          東京エリアの駅から子連れOK店を探す
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
                          23区484駅・40路線対応 / ベビーカーOK・個室・雨の日OK等で絞り込み可
                        </div>
                      </div>
                      <span style={{ fontSize: 22, color: 'var(--clay-deep)', flexShrink: 0 }}>→</span>
                    </div>
                  </Link>
                </section>
              )}

              {/* 「家で過ごす」モードの1日通しプラン（朝食〜夕食） */}
              {dayPlan && (
                <section className="day-plan">
                  <h3 className="today-section-title">
                    <span className="today-section-eyebrow">Full day at home</span>
                    家で過ごす1日のタイムライン
                  </h3>
                  <p className="today-section-lede">
                    朝食から夕食まで、家で過ごす1日の流れを6スロットで提案。
                    各カードをタップすると詳細プランへ。
                  </p>
                  <ol className="day-plan-list">
                    {dayPlan.map((slot, i) => (
                      <li key={i} className={`day-plan-slot ${slot.plan ? '' : 'empty'}`}>
                        <div className="day-plan-time">
                          <span className="day-plan-icon" aria-hidden="true">{slot.icon}</span>
                          <span className="day-plan-clock">{slot.time}</span>
                          <span className="day-plan-label">{slot.label}</span>
                        </div>
                        {slot.plan ? (
                          <Link href={`/plan/${slot.plan.id}`} className="day-plan-card">
                            <div className="day-plan-title">{slot.plan.title}</div>
                            <div className="day-plan-short">{slot.plan.shortAnswer}</div>
                            <div className="day-plan-meta">
                              {slot.plan.durationMin}分 · {slot.plan.budget === 'free' ? '0円〜' : slot.plan.budget === 'low' ? '〜2,000円' : '〜5,000円'}
                            </div>
                          </Link>
                        ) : (
                          <div className="day-plan-card empty">この時間帯のプランは準備中</div>
                        )}
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* 別の候補を inline で常時表示（旧 details 折りたたみは廃止） */}
              {alternatives.length > 0 && (
                <section className="today-alts">
                  <h3 className="today-section-title">
                    <span className="today-section-eyebrow">Alternatives</span>
                    今日とは別の選択肢
                  </h3>
                  <p className="today-section-lede">
                    気分が違うとき、人数や時間が変わったときの代替案。
                  </p>
                  <div className="alt-list">
                    {alternatives.map((alt, i) => (
                      <AnswerCard key={i} answer={alt} />
                    ))}
                  </div>
                </section>
              )}

              {/* 関連記事 — 直帰防止のメイン導線 */}
              {relatedArticles.length > 0 && (
                <section className="today-related">
                  <h3 className="today-section-title">
                    <span className="today-section-eyebrow">More to read</span>
                    この条件で読まれている記事
                  </h3>
                  <p className="today-section-lede">
                    同じ条件で関心を集めているガイド・比較・準備リスト。
                  </p>
                  <div className="today-related-grid">
                    {relatedArticles.map((a) => (
                      <RelatedArticleCard key={a.slug} article={a} />
                    ))}
                  </div>
                </section>
              )}

              {/* あったら便利グッズ — プランの「準備リスト」補完 */}
              {relatedItems.length > 0 && (
                <section className="today-items">
                  <p className="today-items-pr" role="note">
                    <span className="pr-label">PR</span>
                    <span>※本エリアは広告を含みます。条件に合う家庭で利用率の高いアイテムです。</span>
                  </p>
                  <h3 className="today-section-title" style={{ marginTop: 4 }}>
                    <span className="today-section-eyebrow">Useful items</span>
                    今日の条件で、あったら便利なもの
                  </h3>
                  <div className="today-items-grid">
                    {relatedItems.map((item) => (
                      <AffiliateLink
                        key={item.id}
                        href={item.href}
                        title={item.name}
                        subtitle={item.subtitle}
                        price={item.price}
                        provider={item.provider}
                        pr={false}
                      />
                    ))}
                  </div>
                  <Link href="/items" className="today-items-more">
                    カタログ全体を見る →
                  </Link>
                </section>
              )}

              {/* AdSense Multiplex（回遊喚起 / ページ後半の自然な切れ目） */}
              <AdSlot placement="article-related" style={{ marginTop: 36 }} />

              {/* シェア（X / LINE / Facebook / Copy） */}
              <ShareBar url={shareUrl} title={shareTitle} label="この答えをシェアする" />

              {/* 関連カテゴリへの回遊チップ */}
              {categoryChips.length > 0 && (
                <section style={{ marginTop: 40 }}>
                  <span className="eyebrow">More · もっと探す</span>
                  <div className="outing-chips" style={{ marginTop: 12 }}>
                    {categoryChips.map((c) => (
                      <Link key={c.href} href={c.href} className="outing-chip">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* 最後の回遊CTA */}
              <section
                style={{
                  marginTop: 48,
                  padding: '20px 22px',
                  background: 'var(--paper-card)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <p
                  style={{
                    fontSize: 13.5,
                    color: 'var(--ink-sub)',
                    margin: '0 0 14px',
                    lineHeight: 1.85,
                  }}
                >
                  今日の答えはこれでOK？ 別の条件で試す or トップに戻って違うコンセプトから探す。
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  <Link href="/#finder" className="btn-primary-light">別の条件で探す</Link>
                  <Link href="/" className="btn-light-ghost">トップに戻る</Link>
                </div>
              </section>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
/* deploy trigger: 1778282160 */
