import Link from 'next/link';
import type { Metadata } from 'next';
import { V2Frame } from '@/components/v2/V2Frame';
import {
  V2SpotCardV,
  V2FeatureCardV,
  V2ArticleRow,
} from '@/components/v2/V2Cards';
import {
  V2Img,
  V2SectionHead,
  V2Tag,
} from '@/components/v2/V2Base';
import { V2Icon, V2_ACCENT } from '@/components/v2/V2Icon';
import { V2HeroForm } from '@/components/v2/V2HeroForm';
import { V2RecentSpots } from '@/components/v2/V2RecentSpots';
import { getFileArticlesByCategory } from '@/lib/articles';
import { eventHeroImage, formatEventPeriod, getThisWeekEvents } from '@/lib/events';
import { getAllFileArticles } from '@/lib/articles';
import { getAllSpotsWithSlug } from '@/lib/spots';
import { FEATURE_PAGES } from '@/lib/feature-pages';
import { POPULAR_ARTICLE_SLUGS } from '@/lib/popular-articles';
import { spotToV2, featureToV2, articleToV2 } from '@/lib/v2-adapters';
import { AdSlot } from '@/components/ads/AdSlot';

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const QUICK_SEARCH = [
  { t: '雨の日', icon: 'umbrella' as const, accent: 'rain' as const, q: 'weather=rain' },
  { t: '晴れの日', icon: 'sun' as const, accent: 'sun' as const, q: 'weather=sunny' },
  { t: '室内施設', icon: 'house' as const, accent: 'indoor' as const, q: 'place=indoor' },
  { t: '子連れランチ', icon: 'fork' as const, accent: 'lunch' as const, q: 'category=today-taberu' },
  { t: 'イベント', icon: 'party' as const, accent: 'event' as const, q: 'category=gyouji' },
  { t: '無料スポット', icon: 'free' as const, accent: 'free' as const, q: 'budget=free' },
];

const POPULAR_AREAS = [
  { t: '池袋・豊島', icon: 'building' as const, accent: 'rain' as const, href: '/station' },
  { t: '大塚・巣鴨', icon: 'train' as const, accent: 'lunch' as const, href: '/station' },
  { t: '駒込・田端', icon: 'tree' as const, accent: 'indoor' as const, href: '/station' },
  { t: '東京23区', icon: 'house' as const, accent: 'sun' as const, href: '/station' },
  { t: '関東のスポット', icon: 'flag' as const, accent: 'purple' as const, href: '/spots' },
];

/**
 * 既存サイトの全カテゴリ。SEO 主要導線として TOP に固定表示。
 * 順序は『きょうのこ』編集方針の重要度順。
 */
const CATEGORIES = [
  { slug: 'today-doko', name: '今日どこ行く', icon: 'pin' as const, accent: 'rain' as const },
  { slug: 'today-nani', name: '今日何する', icon: 'house' as const, accent: 'indoor' as const },
  { slug: 'today-taberu', name: '今日何食べる', icon: 'fork' as const, accent: 'lunch' as const },
  { slug: 'today-mawasu', name: '今日どう回す', icon: 'clock' as const, accent: 'purple' as const },
  { slug: 'gyouji', name: '季節と行事', icon: 'calendar' as const, accent: 'event' as const },
  { slug: 'narai', name: '習い事と学び', icon: 'book' as const, accent: 'rain' as const },
  { slug: 'yakudatsu', name: '役立つもの', icon: 'cart' as const, accent: 'free' as const },
  { slug: 'tenki', name: '天気で決める', icon: 'sun' as const, accent: 'sun' as const },
];

export default function HomePage() {
  const allArticles = getAllFileArticles();
  const popularArticles = POPULAR_ARTICLE_SLUGS.map((slug) =>
    allArticles.find((a) => a.slug === slug),
  ).filter((a): a is NonNullable<typeof a> => Boolean(a));
  const latestArticles = allArticles.slice(0, 6);

  // 人気スポット: getAllSpotsWithSlug() 経由で正規 slug を使う（/spot/[slug] の
  // generateStaticParams と必ず一致させる）。
  // popular=true があれば優先、なければ先頭から5件。
  const allSpotsWithSlug = getAllSpotsWithSlug();
  const popularSpotsWS = allSpotsWithSlug
    .filter((x) => x.spot.popular)
    .slice(0, 5);
  const seedSpotsWS = popularSpotsWS.length
    ? popularSpotsWS
    : allSpotsWithSlug.slice(0, 5);
  const spotCards = seedSpotsWS.map((x, i) => ({
    ...spotToV2(x.spot, i),
    _slug: x.slug, // 正規 slug（spotToSlug で生成された URL-safe な値）
  }));

  const featureCards = FEATURE_PAGES.slice(0, 4).map(featureToV2);
  const popularArticleCards = popularArticles.slice(0, 3).map(articleToV2);
  const latestArticleCards = latestArticles.slice(0, 6).map(articleToV2);

  // 今週のイベント（編集部キュレーション）。0件なら表示しない
  const weekEvents = getThisWeekEvents().slice(0, 6);
  // 季節と行事カテゴリの新着記事は別セクション
  const seasonalArticles = getFileArticlesByCategory('gyouji')
    .filter((a) => !a.noindex)
    .slice(0, 6)
    .map(articleToV2);

  return (
    <V2Frame header="home" active="home">
      {/* Hero — 2回目デザイン：写真フル背景に左上のコピー＋検索フォーム */}
      <div className="v2-hero-ov">
        {/*
          PC: /v2/hero/top-main.webp (1920×1080)
          SP: /v2/hero/top-mobile-portrait.webp (1080×1920)
          ※ファイル未配置時は picsum にフォールバック（V2Img の onError）
        */}
        <picture>
          <source
            media="(max-width: 600px)"
            srcSet="/v2/hero/top-mobile-portrait.webp"
          />
          <source
            media="(min-width: 601px)"
            srcSet="/v2/hero/top-main.webp"
          />
          <V2Img
            src="/v2/hero/top-main.webp"
            seed="hero-family"
            alt="親子でおでかけ"
            className="v2-hero-ov-bg"
          />
        </picture>
        <div className="v2-hero-ov-grad"></div>
        <div className="v2-hero-ov-inner">
          <span className="v2-hero2-badge">
            <V2Icon name="sparkle" size={13} color="var(--v2-orange-deep)" />
            0〜6歳の子育ておでかけメディア
          </span>
          <h1 className="v2-hero2-h1">今日、どこ行く？</h1>
          <p className="v2-hero2-sub">
            年齢・天気・エリアから、<br className="v2-br-pc" />
            親子にぴったりのおでかけ先が見つかる。
          </p>
          <div className="v2-hero-ov-form">
            <V2HeroForm />
          </div>
        </div>
      </div>

      {/* Quick search */}
      <div className="v2-sec-head" style={{ marginTop: 24 }}>
        <div className="v2-sec-title">クイック検索</div>
        <span className="v2-sec-more mute" style={{ fontSize: 12 }}>
          タップでかんたん検索！
        </span>
      </div>
      <div className="v2-quick-grid">
        {QUICK_SEARCH.map((q) => {
          const a = V2_ACCENT[q.accent];
          return (
            <Link key={q.t} href={`/search?${q.q}`} className="v2-quick-item">
              <span className="v2-quick-ico" style={{ background: a.bg }}>
                <V2Icon name={q.icon} size={26} color={a.c} />
              </span>
              <span className="v2-quick-label">{q.t}</span>
            </Link>
          );
        })}
      </div>

      {/* 人気スポット */}
      <V2SectionHead title="人気スポット" moreHref="/spots" />
      <div className="v2-hscroll">
        {spotCards.map((s, i) => (
          <V2SpotCardV
            key={s.id + i}
            spot={s}
            rank={i + 1}
            href={`/spot/${s._slug}`}
          />
        ))}
      </div>

      {/* 広告 */}
      <div className="v2-section" style={{ marginTop: 24 }}>
        <AdSlot placement="home-below-finder" />
      </div>

      {/* カテゴリから探す（SEO 主要導線） */}
      <V2SectionHead title="カテゴリから探す" more="" />
      <div className="v2-quick-grid" style={{ flexWrap: 'wrap', gap: '14px 7px' }}>
        {CATEGORIES.map((c) => {
          const a = V2_ACCENT[c.accent];
          return (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="v2-quick-item"
            >
              <span className="v2-quick-ico" style={{ background: a.bg }}>
                <V2Icon name={c.icon} size={26} color={a.c} />
              </span>
              <span className="v2-quick-label">{c.name}</span>
            </Link>
          );
        })}
      </div>

      {/* 今週のイベント（実データ） */}
      {weekEvents.length > 0 && (
        <>
          <V2SectionHead title="今週のイベント" moreHref="/events" />
          <div className="v2-hscroll">
            {weekEvents.map((e) => (
              <Link
                key={e.slug}
                href={`/event/${e.slug}`}
                className="v2-card-mini"
                style={{ width: 168 }}
              >
                <div className="v2-imgwrap r" style={{ aspectRatio: '16/9' }}>
                  <V2Img src={eventHeroImage(e)} seed={e.slug} alt={e.title} />
                </div>
                <div className="v2-card-mini-title">{e.title}</div>
                <div
                  style={{ fontSize: 11, color: 'var(--v2-orange-deep)', fontWeight: 700 }}
                >
                  📅 {formatEventPeriod(e)}
                </div>
                <div className="v2-card-v-loc" style={{ margin: 0 }}>
                  <V2Icon name="pin" size={12} color="var(--v2-orange)" />
                  {e.venue}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* 季節と行事カテゴリの新着記事 */}
      {seasonalArticles.length > 0 && (
        <>
          <V2SectionHead title="季節と行事の新着記事" moreHref="/category/gyouji" />
          <div className="v2-hscroll">
            {seasonalArticles.map((a) => (
              <Link
                key={a.id}
                href={`/article/${a.id}`}
                className="v2-card-mini"
                style={{ width: 168 }}
              >
                <div className="v2-imgwrap r" style={{ aspectRatio: '16/9' }}>
                  <V2Img src={a.img} seed={a.id} alt={a.title} />
                </div>
                <div className="v2-card-mini-title">{a.title}</div>
                {a.tags && (
                  <div className="v2-tag-row">
                    {a.tags.slice(0, 2).map((t, j) => (
                      <V2Tag key={j} label={t} tone={j === 0 ? 'feat' : ''} />
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </>
      )}

      {/* 特集 */}
      <V2SectionHead title="特集" moreHref="/feature" />
      <div className="v2-hscroll">
        {featureCards.map((f) => (
          <V2FeatureCardV key={f.id} f={f} href={`/feature/${f.id}`} />
        ))}
      </div>

      {/* 人気の記事 */}
      <V2SectionHead title="人気の記事" moreHref="/category/today-doko" />
      <div className="v2-section">
        {popularArticleCards.length ? (
          popularArticleCards.map((a) => (
            <V2ArticleRow key={a.id} a={a} href={`/article/${a.id}`} />
          ))
        ) : (
          <p style={{ fontSize: 13, color: 'var(--v2-ink-mute)' }}>
            人気記事を集計中です。
          </p>
        )}
      </div>

      {/* エリアから探す */}
      <V2SectionHead title="エリアから探す" moreHref="/station" />
      <div className="v2-area-chips">
        {POPULAR_AREAS.map((ar) => {
          const a = V2_ACCENT[ar.accent];
          return (
            <Link key={ar.t} href={ar.href} className="v2-area-chip">
              <span className="v2-area-chip-ico" style={{ background: a.bg }}>
                <V2Icon name={ar.icon} size={22} color={a.c} />
              </span>
              <span className="v2-area-chip-lab">{ar.t}</span>
            </Link>
          );
        })}
      </div>

      {/* 最近見たスポット（localStorage ベース） */}
      <V2RecentSpots />

      {/* 新着記事 */}
      <V2SectionHead title="新着記事" moreHref="/category/today-doko" />
      <div className="v2-hscroll">
        {latestArticleCards.map((a) => (
          <Link
            key={a.id}
            href={`/article/${a.id}`}
            className="v2-card-mini"
            style={{ width: 168 }}
          >
            <div className="v2-imgwrap r" style={{ aspectRatio: '16/9' }}>
              <V2Img src={a.img} seed={a.id} alt={a.title} />
            </div>
            <div className="v2-card-mini-title">{a.title}</div>
            {a.tags && (
              <div className="v2-tag-row">
                {a.tags.slice(0, 2).map((t, j) => (
                  <V2Tag key={j} label={t} tone={j === 0 ? 'age' : ''} />
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="v2-foot">
        <div className="v2-foot-links">
          <Link href="/about">運営者情報</Link>
          <Link href="/contact">お問い合わせ</Link>
          <Link href="/editorial-policy">編集方針</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
          <Link href="/terms">利用規約</Link>
        </div>
        <div className="v2-foot-copy">© 2026 きょうのこ</div>
      </div>
    </V2Frame>
  );
}
