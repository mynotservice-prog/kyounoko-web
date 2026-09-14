import '@/app/styles/plan-v3.css';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { V2Frame } from '@/components/v2/V2Frame';
import { V2Img } from '@/components/v2/V2Base';
import { KkIcon, type KkIconName } from '@/components/kk/KkIcon';
import { KkSectionTitle } from '@/components/kk/KkSectionTitle';
import { KkInfoTable, type KkInfoRow } from '@/components/kk/KkInfoTable';
import { KkLineCard } from '@/components/kk/KkLineCard';
import { KkAddToHomeCard } from '@/components/kk/KkAddToHomeCard';
import { KkFooter } from '@/components/kk/KkFooter';
import { getPlan, getAllPlanIds, getAllPlanMetas } from '@/lib/plans';
import { getFileArticle } from '@/lib/articles';
import { getAreaName } from '@/lib/area';
import { AdSlot } from '@/components/ads/AdSlot';
import { getTagsForPlan } from '@/lib/tags';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { TriedButton } from '@/components/ui/TriedButton';
import { SpotList } from '@/components/common/SpotList';
import { getRelatedArticlesForPlan } from '@/lib/cross-links';
import { RelatedItemsCTA } from '@/components/article/RelatedItemsCTA';
import { getItemsForPlan } from '@/lib/items-catalog';
import { PlanTimeline } from '@/components/plan/PlanTimeline';
import { ShareBar } from '@/components/article/ShareBar';
import { articleCategoryLabel } from '@/lib/article-categories';

// hero 画像の自動マッチング更新を即時反映するため revalidate を短縮（5分）
export const revalidate = 86400;

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
  const ogImages = [{ url: `/api/og?title=${encodeURIComponent(plan.title)}`, width: 1200, height: 630 }];
  return {
    title: plan.title,
    description: plan.shortAnswer,
    robots: { index: false, follow: true }, // Plan は条件組合せ無限のため noindex
    alternates: { canonical: `/plan/${id}` },
    openGraph: {
      title: plan.title,
      description: plan.shortAnswer,
      url: `https://kyounoko.jp/plan/${id}`,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: plan.title,
      description: plan.shortAnswer,
      images: ogImages.map((i) => i.url),
    },
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

/** 天気ラベルに合う線画アイコン（絵文字は使わない / §3-0）。 */
const WEATHER_ICON: Record<string, KkIconName> = {
  sunny: 'sunny',
  rain: 'rain',
  cold: 'cold',
  heat: 'hot',
  snow: 'snow',
  wind: 'cloudy',
  cloudy: 'cloudy',
  humid: 'hot',
  any: 'info',
};
const PLACE_ICON: Record<string, KkIconName> = {
  home: 'home',
  indoor: 'indoor',
  outdoor: 'outdoor',
};

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

  // このプランの属性（place / kind / age）に合った「あると便利なもの」3点。
  // 530本のプランページは従来アフィ導線が無かったため、ここで控えめに補完する。
  const planItems = getItemsForPlan(
    { place: plan.place, kind: plan.kind, ageRanges: plan.ageRanges },
    3,
  );

  const budgetLabels: Record<string, string> = {
    free: '無料',
    low: '〜2,000円',
    mid: '〜5,000円',
    high: '5,000円〜',
  };

  // 全体の表記揺れを抑える：weather / place の日本語ラベル
  const weatherJaLabels: Record<string, string> = {
    sunny: '晴れ',
    rain: '雨',
    cold: '寒い日',
    heat: '暑い日',
    snow: '雪',
    wind: '強風',
    cloudy: '曇り',
    humid: '湿気',
    any: '天気不問',
  };
  const placeJaLabels: Record<string, string> = {
    home: '家',
    indoor: '屋内',
    outdoor: '外',
  };
  const weatherJa = (w: string) => weatherJaLabels[w] ?? w;

  // メタ情報（年齢 / 所要時間 / 予算 / エリア / 天気 / 場所）はデータテーブルで見せる（§3-0）。
  const metaRows: KkInfoRow[] = [
    { icon: 'age', label: '年齢', value: plan.ageRanges.join(' / ') + '歳' },
    { icon: 'clock', label: '所要時間', value: `${plan.durationMin}分` },
    { icon: 'yen', label: '予算', value: budgetLabels[plan.budget] ?? plan.budget },
    ...(plan.area !== 'all'
      ? [{ icon: 'pin' as const, label: 'エリア', value: getAreaName(plan.area) }]
      : []),
    ...(plan.weather.length > 0
      ? [
          {
            icon: WEATHER_ICON[plan.weather[0]] ?? 'info',
            label: '天気',
            value: plan.weather.map(weatherJa).join(' / '),
          },
        ]
      : []),
    ...(plan.place.length > 0
      ? [
          {
            icon: PLACE_ICON[plan.place[0]] ?? 'pin',
            label: '場所',
            value: plan.place.map((p) => placeJaLabels[p] ?? p).join(' / '),
          },
        ]
      : []),
  ];

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
      {/* LCP 改善: hero 画像を最優先で先読み（CSS background のため Next.js Image priority が効かない） */}
      {plan.hero && (
        <link rel="preload" as="image" href={plan.hero} fetchPriority="high" />
      )}
      {jsonLdHowTo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }}
        />
      )}

      <V2Frame header="sub" active="home">
        <div className="plan-v3">

        {/* パンくず（区切りの「/」は線画アイコンに置き換え） */}
        <nav className="pv3-crumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <KkIcon name="chevron-right" size={11} />
          <Link href="/#finder">今日の答え</Link>
          <KkIcon name="chevron-right" size={11} />
          <span className="cur">{plan.title}</span>
        </nav>

        {/* 上部ブロック。PC（≥920px）では左に写真・右に見出しの2段組にする。 */}
        <div className="pv3-top">
          <header className="pv3-head">
            <span className="pv3-eyebrow">Today&apos;s plan — 今日の行動プラン</span>
            <div className="pv3-title-row">
              <h1 className="pv3-h1">{plan.title}</h1>
              <FavoriteButton kind="plan" id={plan.id} size="md" />
            </div>
            <p className="pv3-lede">{plan.shortAnswer}</p>
            <div className="pv3-tried">
              <TriedButton kind="plan" id={plan.id} />
            </div>
          </header>

          {/* メイン写真（文字を重ねない・軽い角丸だけ。src は従来どおり） */}
          {plan.hero && (
            <div className="pv3-hero">
              <div className="pv3-hero-img">
                <V2Img src={plan.hero} seed={plan.id} alt={plan.title} priority />
              </div>
            </div>
          )}
        </div>

        {/* AdSense: Plan hero 下 */}
        <div className="pv3-ad">
          <AdSlot placement="plan-below-hero" />
        </div>

        {/* このプランのクイック情報（データテーブル） */}
        <section className="kk-sec pv3-sec" aria-label="このプランのクイック情報">
          <KkInfoTable rows={metaRows} className="pv3-meta" />
        </section>

        {/* Timeline 可視化。
            本文 markdown 内に「## ○○タイムライン」見出しがある場合は本文側の表示を優先して
            重複を回避する（ユーザー監査指摘）。markdown 側に時刻入り箇条書きが無いプランだけ
            視覚的タイムラインを補完表示する。 */}
        {steps.length >= 2 && !/^##\s.*タイムライン/m.test(plan.body) && (
          <div className="kk-sec pv3-sec">
            <PlanTimeline steps={steps} />
          </div>
        )}

        {/* Body */}
        <div className="pv3-body">
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        </div>

        {/* エリア指定ありの外出プランならおすすめスポット提示 */}
        {plan.area !== 'all' && plan.place.some((p) => p === 'outdoor' || p === 'indoor') && (
          <div className="kk-sec pv3-sec pv3-spotlist">
            <SpotList
              area={plan.area}
              age={plan.ageRanges[0] as '0-1' | '2-3' | '4-6' | undefined}
              place={plan.place.includes('outdoor') ? 'outdoor' : 'indoor'}
              budget={plan.budget === 'free' ? 'free' : plan.budget === 'low' ? 'low' : plan.budget === 'mid' ? 'mid' : undefined}
              limit={5}
            />
          </div>
        )}

        {/* このプランに、あると便利なもの（アフィCTA） */}
        {planItems.length > 0 && (
          <div className="kk-sec pv3-sec pv3-items">
            <RelatedItemsCTA
              label="このプランに、あると便利なもの"
              items={planItems.map((it) => ({
                href: it.href,
                title: it.name,
                subtitle: it.subtitle,
                price: it.price,
                provider: it.provider,
                pr: false,
              }))}
            />
          </div>
        )}

        {/* タグ */}
        {tags.length > 0 && (
          <section className="kk-sec pv3-sec">
            <span className="pv3-eyebrow">Tags · トピックで探す</span>
            <div className="kk-chips pv3-chips">
              {tags.slice(0, 8).map((t) => (
                <Link key={t.slug} href={`/tag/${t.slug}`} className="kk-chip">
                  {t.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 関連するSEO記事（あれば）— "もっと詳しく" */}
        {related && (
          <section className="kk-sec pv3-sec">
            <KkSectionTitle as="h2" title="もっと詳しく知りたい方へ" />
            <div className="kk-rows">
              <Link href={`/article/${related.slug}`} className="kk-row pv3-lead-row">
                <span className="pv3-lead-thumb">
                  {related.hero && <V2Img src={related.hero} seed={related.slug} alt={related.title} />}
                </span>
                <span className="kk-row-body">
                  <span className="pv3-kicker">Related article</span>
                  <h3 className="kk-row-title pv3-row-h3">{related.title}</h3>
                </span>
                <span className="kk-row-arrow">
                  <KkIcon name="chevron-right" size={18} />
                </span>
              </Link>
            </div>
          </section>
        )}

        {/* この行動に役立つ記事（プラン → 記事の双方向リンク） */}
        {crossLinkedArticles.length > 0 && (
          <section className="kk-sec pv3-sec" aria-label="このプランに役立つ記事">
            <span className="pv3-eyebrow">Related articles · 実際の体験談・選び方</span>
            <KkSectionTitle as="h2" title="このプランに役立つ記事" />
            <div className="kk-rows">
              {crossLinkedArticles.map((a) => {
                const eyebrow = articleCategoryLabel(a.category, a.categoryName) || 'Article';
                const description = a.lede || a.metaDescription;
                return (
                  <Link key={a.slug} href={`/article/${a.slug}`} className="kk-row">
                    <span className="kk-row-thumb">
                      {a.hero && <V2Img src={a.hero} seed={a.slug} alt={a.title} />}
                    </span>
                    <span className="kk-row-body">
                      <span className="pv3-kicker">{eyebrow}</span>
                      <span className="kk-row-title">{a.title}</span>
                      {description && <span className="kk-row-sub">{description}</span>}
                    </span>
                    <span className="kk-row-arrow">
                      <KkIcon name="chevron-right" size={18} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 同じ条件で別のプラン（プラン横リンク） */}
        {siblingPlans.length > 0 && (
          <section className="kk-sec pv3-sec cv-auto-section">
            <KkSectionTitle as="h2" title="似た条件で別のプラン" />
            <div className="kk-rows">
              {siblingPlans.map((p) => (
                <Link key={p.id} href={`/plan/${p.id}`} className="kk-row">
                  <span className="kk-row-thumb">
                    {p.hero && <V2Img src={p.hero} seed={p.id} alt={p.title} />}
                  </span>
                  <span className="kk-row-body">
                    <h4 className="kk-row-title pv3-row-h4">{p.title}</h4>
                    <span className="kk-row-sub">{p.shortAnswer.slice(0, 50)}...</span>
                  </span>
                  <span className="kk-row-arrow">
                    <KkIcon name="chevron-right" size={18} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* AdSense Multiplex（ページ後半の回遊喚起） */}
        <AdSlot placement="article-related" style={{ marginTop: 48 }} />

        <div className="pv3-share">
          <ShareBar url={`https://kyounoko.jp/plan/${id}`} title={plan.title} label="このプランをシェアする" />
        </div>

        {/* フィードバック誘導 */}
        <section className="kk-sec pv3-sec pv3-feedback">
          <p className="pv3-feedback-text">
            このプラン、役立ちましたか？ 別の条件で探すなら、トップの「条件で探す」からどうぞ。
          </p>
          <Link href="/#finder" className="kk-btn outline">別の条件で探す</Link>
        </section>

        {/* 回遊・再訪モジュール（リニューアル2026-09） */}
        <KkLineCard placement="plan" />
        <KkAddToHomeCard placement="plan" />
        <KkFooter />
        </div>
      </V2Frame>
    </>
  );
}
