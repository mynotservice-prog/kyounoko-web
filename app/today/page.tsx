import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Frame } from '@/components/v2/V2Frame';
import {
  getTodayAnswer,
  getRelatedArticlesForQuery,
  type TodayQuery,
  type TodayAnswerResult,
  type FileArticleMeta,
} from '@/lib/articles';
import { buildDayPlan, type DayPlanSlot } from '@/lib/plans';
import { getKidFriendlyRestaurants, type Spot, type AgeTag } from '@/lib/spots';
import { buildOutingPlan, lunchCandidates, resolveOutingAnchor } from '@/lib/outing-plan';
import { OutingPlanView, LunchListView } from '@/components/today/OutingPlanView';
import {
  getTerminalStations,
  getFamilyFriendlyStations,
  type TokyoWard,
} from '@/lib/tokyo-stations';
import type { Weather } from '@/lib/types';
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

/**
 * 今日のプランに応じた「持っていくと便利」推奨アイテム。
 * /spot/[slug] の getRecommendedItems と同じマスタを共有し、
 * 結果カードからもアフィリエイト動線を確立する。
 */
function TodayRecommendedItems({ answer }: { answer: TodayAnswerResult }) {
  if (!answer.plan) return null;
  const p = answer.plan.plan;
  // 屋外/お出かけ系のときだけ表示（家での過ごし方には不要）
  if (!p.place.includes('outdoor') && !p.place.includes('indoor')) return null;

  // プランの場所に応じてダミーカテゴリを決める
  // outdoor → park、indoor → indoor として recommend を呼ぶ
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getRecommendedItems } = require('@/lib/recommended-items') as typeof import('@/lib/recommended-items');
  const category = p.place.includes('outdoor') ? 'park' : 'indoor';
  const place = p.place.includes('outdoor') ? 'outdoor' : 'indoor';
  const items = getRecommendedItems(category, place, ['0-1', '2-3', '4-6'], 4);
  if (items.length === 0) return null;

  return (
    <aside
      style={{
        marginTop: 24,
        padding: '18px 20px',
        background: 'rgba(247,122,33,0.04)',
        border: '1px solid rgba(247,122,33,0.2)',
        borderRadius: 14,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--clay-deep, #c9603e)', textTransform: 'uppercase', marginBottom: 4 }}>
        🎒 持っていくと便利
      </div>
      <p style={{ fontSize: 11, color: 'var(--ink-mute, #8E867A)', marginTop: 0, marginBottom: 10 }}>
        ※楽天市場のリンクです（広告 / PR）
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="sponsored nofollow noopener"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 13,
              color: 'var(--ink, #2A2118)',
            }}
          >
            <span style={{
              width: 20, height: 20, borderRadius: '50%',
              background: 'rgba(247,122,33,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flex: 'none', fontSize: 10, fontWeight: 800,
              color: '#c9603e',
            }}>{i + 1}</span>
            <span style={{ flex: 1, fontWeight: 700 }}>{item.label}</span>
            <span style={{ fontSize: 11, color: 'var(--clay-deep, #c9603e)', fontWeight: 700 }}>楽天 ›</span>
          </a>
        ))}
      </div>
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
          <h1 className="answer-title" style={{ fontSize: 'inherit', fontWeight: 'inherit', margin: 0 }}>
            <Link href={answer.href}>{answer.title}</Link>
          </h1>
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
          <TodayRecommendedItems answer={answer} />
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
      <div className="alt-card-thumb" style={{ overflow: 'hidden' }}>
        {answer.hero && (
          <img
            src={answer.hero}
            alt={answer.title}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
      </div>
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
  // このモードでは AnswerCard を出さず、レストラン一覧自体を主答えにする。
  // （meal プランは place=home に偏っているため、AnswerCard で関係ない記事フォールバックが
  //  出てしまっていた問題への対応：花見・クリスマスマーケット等の無関係な top に着地しないよう
  //  isEatOutside の時は top をスキップして restaurant 一覧をヒーローにする）
  const isEatOutside = query.mode === 'eat' && query.place === 'outside';
  let restaurants: { area: AreaSlug; spot: Spot }[] = [];
  if (isEatOutside) {
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

  // 「今日の流れ（おでかけ1日プラン）」: 東京23区の駅/区が指定されたら、
  // 午前あそぶ→お昼たべる→午後 の3スロットをヒーロー表示（通常Answerは出さない）。
  const stationParam = firstString(sp.station);
  const wardParam = firstString(sp.ward) as TokyoWard | undefined;
  const slotParam = firstString(sp.slot);
  const num = (v: string | string[] | undefined) => {
    const n = parseInt(firstString(v) ?? '0', 10);
    return Number.isFinite(n) ? n : 0;
  };

  // OutingPlanView/LunchListView へ渡す現在クエリ（スワップ/別案リンク生成用）
  const outingParams: Record<string, string> = {};
  if (stationParam) outingParams.station = stationParam;
  if (wardParam) outingParams.ward = wardParam;
  if (query.age) outingParams.age = query.age;
  if (query.weather && query.weather !== 'any') outingParams.weather = query.weather;
  for (const k of ['vm', 'vl', 'va'] as const) {
    const val = firstString(sp[k]);
    if (val) outingParams[k] = val;
  }

  const isTokyoAnchor = Boolean(stationParam || wardParam);
  const ageLabel = query.age ? labelForValue('age', query.age) : undefined;
  const weatherLabel =
    query.weather && query.weather !== 'any' ? labelForValue('weather', query.weather) : undefined;

  // ?slot=lunch: お昼スロット単体ビュー（子連れで入れる店一覧。最多需要）
  if (isTokyoAnchor && slotParam === 'lunch') {
    const anchor = resolveOutingAnchor({ stationSlug: stationParam, ward: wardParam });
    if (anchor) {
      const { ward: wardRest, chain } = lunchCandidates(
        anchor.areaKey,
        anchor.regionLabel,
        {
          age: query.age as AgeTag | undefined,
          budget: query.budget as 'free' | 'low' | 'mid' | 'high' | undefined,
        },
        anchor.stationSlug,
      );
      return (
        <V2Frame header="sub" active="today" backHref={`/today?${new URLSearchParams(outingParams).toString()}`}>
          <div className="container">
            <nav className="breadcrumb" aria-label="パンくず">
              <Link href="/">HOME</Link>
              <span className="sep">/</span>
              <Link href={`/today?${new URLSearchParams(outingParams).toString()}`}>今日の流れ</Link>
              <span className="sep">/</span>
              <span>子連れで入れるお店</span>
            </nav>
          </div>
          <LunchListView
            anchorLabel={anchor.stationName ? `${anchor.stationName}駅` : anchor.regionLabel}
            wardName={anchor.regionLabel}
            wardRest={wardRest}
            chain={chain}
            ageLabel={ageLabel}
          />
        </V2Frame>
      );
    }
  }

  const outingPlan = isTokyoAnchor
    ? buildOutingPlan({
        stationSlug: stationParam,
        ward: wardParam,
        age: query.age as AgeTag | undefined,
        weather: query.weather as Weather | undefined,
        budget: query.budget as 'free' | 'low' | 'mid' | 'high' | undefined,
        morningVariant: num(sp.vm),
        lunchVariant: num(sp.vl),
        afternoonVariant: num(sp.va),
      })
    : null;

  if (outingPlan) {
    return (
      <V2Frame header="sub" active="today" backHref="/today">
        <div className="container">
          <nav className="breadcrumb" aria-label="パンくず">
            <Link href="/">HOME</Link>
            <span className="sep">/</span>
            <span>今日の流れ</span>
          </nav>
        </div>
        <OutingPlanView
          plan={outingPlan}
          params={outingParams}
          ageLabel={ageLabel}
          weatherLabel={weatherLabel}
        />
      </V2Frame>
    );
  }

  // おでかけプラン未指定時：ナビ「今日の流れ」からの着地で、駅を選べる入口を出す。
  // 駅ピッカーは「東京＋データのある都市（横浜/大宮/千葉/船橋）」だけ。
  // 他県は駅を出さず、エリア（都道府県）ブラウズへ誘導する。
  const METRO_STATIONS: Record<string, { slug: string; name: string }[]> = {
    kanagawa: [
      { slug: 'yokohama', name: '横浜' },
      { slug: 'minato-mirai', name: 'みなとみらい' },
      { slug: 'sakuragicho', name: '桜木町' },
      { slug: 'kannai', name: '関内' },
      { slug: 'kawasaki', name: '川崎' },
      { slug: 'musashi-kosugi', name: '武蔵小杉' },
      { slug: 'katase-enoshima', name: '片瀬江ノ島' },
      { slug: 'hakkeijima', name: '八景島' },
    ],
    saitama: [
      { slug: 'omiya', name: '大宮' },
      { slug: 'urawa', name: '浦和' },
      { slug: 'kawagoe', name: '川越' },
    ],
    chiba: [
      { slug: 'chiba', name: '千葉' },
      { slug: 'funabashi', name: '船橋' },
      { slug: 'minami-funabashi', name: '南船橋' },
      { slug: 'tsudanuma', name: '津田沼' },
      { slug: 'kashiwa', name: '柏' },
    ],
    osaka: [
      { slug: 'osaka-umeda', name: '梅田' },
      { slug: 'osaka-namba', name: '難波' },
      { slug: 'osaka-tennoji', name: '天王寺' },
      { slug: 'osaka-shinsaibashi', name: '心斎橋' },
      { slug: 'osaka-ko', name: '大阪港（海遊館）' },
      { slug: 'banpaku-kinen-koen', name: '万博記念公園' },
    ],
  };
  const pickerArea = !query.area || query.area === 'all' ? 'tokyo' : query.area;
  const isTokyoPicker = pickerArea === 'tokyo';
  const metroChips = METRO_STATIONS[pickerArea] ?? null;
  const terminalChips = getTerminalStations().slice(0, 10);
  const familyChips = getFamilyFriendlyStations()
    .filter((s) => s.scale !== 'terminal')
    .slice(0, 12);
  const stationQs = (slug: string) => {
    const qs = new URLSearchParams();
    qs.set('station', slug);
    if (query.age) qs.set('age', query.age);
    if (query.weather && query.weather !== 'any') qs.set('weather', query.weather);
    return qs.toString();
  };

  return (
    <>
      <V2Frame header="sub" active="today">

      <div className="container">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <span>今日はこれ</span>
        </nav>
      </div>

      {/* 駅から「今日の流れ（おでかけ1日プラン）」を作る入口 */}
      <div className="container" style={{ marginTop: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>
          駅をえらんで「今日の流れ」を作る
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--ink-sub)', margin: '0 0 10px', lineHeight: 1.5 }}>
          選んだ駅まわりで、午前あそぶ → お昼たべる → 午後 の移動少なめ1日プランを作ります。
        </p>
        {isTokyoPicker ? (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-mute)', letterSpacing: '.05em', marginBottom: 6 }}>
              主要ターミナル
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {terminalChips.map((st) => (
                <Link key={st.slug} href={`/today?${stationQs(st.slug)}`} className="meta-chip clay" style={{ fontSize: 13, textDecoration: 'none' }}>
                  📍 {st.name}
                </Link>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-mute)', letterSpacing: '.05em', marginBottom: 6 }}>
              子育て世帯に人気の駅
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {familyChips.map((st) => (
                <Link key={st.slug} href={`/today?${stationQs(st.slug)}`} className="meta-chip sage" style={{ fontSize: 13, textDecoration: 'none' }}>
                  📍 {st.name}
                </Link>
              ))}
            </div>
          </>
        ) : metroChips ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {metroChips.map((st) => (
              <Link key={st.slug} href={`/today?${stationQs(st.slug)}`} className="meta-chip clay" style={{ fontSize: 13, textDecoration: 'none' }}>
                📍 {st.name}
              </Link>
            ))}
          </div>
        ) : (
          // 駅プラン非対応エリア：駅を出さず、エリア（おでかけ先）ブラウズへ誘導
          <p style={{ fontSize: 13, color: 'var(--ink-sub)', lineHeight: 1.7, margin: 0 }}>
            このエリアの「駅から1日プラン」は今後対応予定です。今は{' '}
            <Link href="/area" style={{ color: 'var(--clay-deep)', fontWeight: 700 }}>エリアからおでかけ先を探す</Link>
            {' '}でスポットを見られます。
          </p>
        )}
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
          ) : !top && !isEatOutside ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-sub)' }}>
              <p style={{ marginBottom: 16, fontSize: 15 }}>
                今日の条件に合う答えは、まだ準備中です。
              </p>
              <Link href="/#finder" className="btn-primary-light">条件を変える</Link>
            </div>
          ) : (
            <>
              {fallbackUsed && !isEatOutside && (
                <div className="fallback-note" role="status">
                  今日の条件にぴったりの答えはまだ準備中ですが、代わりに今日できることを1つ選びました。
                </div>
              )}

              {/* 「外で食べる」モードは AnswerCard を表示せず、
                  下のレストラン一覧自体を主答えとして見せる。
                  代わりにヒーロー帯で意図を明示する。 */}
              {isEatOutside ? (
                <div
                  style={{
                    padding: '24px 24px 22px',
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, rgba(201,96,62,0.10), rgba(201,96,62,0.03))',
                    border: '1px solid rgba(201,96,62,0.20)',
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      color: 'var(--clay-deep)',
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    EAT OUT · 外で食べる
                  </div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-mincho)',
                      fontSize: 22,
                      lineHeight: 1.45,
                      margin: '0 0 8px',
                    }}
                  >
                    {query.area && query.area !== 'all'
                      ? `${getAreaName(query.area)}で、子連れ歓迎の外食をする。`
                      : '今日は外で、子連れ歓迎のお店で食べる。'}
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--ink-sub)', margin: 0, lineHeight: 1.7 }}>
                    ベビーカー入店OK・キッズメニュー・キッズチェアが揃った
                    ファミレス／カフェ／個人店から、条件に合うお店を{restaurants.length}件ピックアップ。
                    {query.area === 'tokyo'
                      ? '駅単位でさらに細かく探したい場合は下の「駅から絞り込む」へ。'
                      : ''}
                  </p>
                </div>
              ) : (
                top && <AnswerCard answer={top} featured />
              )}

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

              {/* 別の候補を inline で常時表示（旧 details 折りたたみは廃止）
                  ※ 外で食べるモードでは alternative は家レシピ系プランになりがちなので非表示 */}
              {alternatives.length > 0 && !isEatOutside && (
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

      </V2Frame>
      
    </>
  );
}
/* deploy trigger: 1778282160 */
