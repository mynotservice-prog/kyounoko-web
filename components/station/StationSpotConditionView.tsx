/**
 * 駅×スポット系条件ページ（asobiba / kouen / ame-asobiba）のビュー。
 *
 * SPOTS データを使うため、レストラン中心の本流ビューと別実装。
 * SpotList を再利用してカード描画する。
 */
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileStickyNav } from '@/components/layout/MobileStickyNav';
import { SPOT_CATEGORY_LABEL, type Spot } from '@/lib/spots';
import type { StationCondition } from '@/lib/station-conditions';
import type { AnyStation } from '@/lib/all-stations';
import { buildStationIntro, buildSpotInsight, insightToSentence } from '@/lib/station-insight';
import { buildSpotFaq, faqToJsonLd } from '@/lib/station-faq';

type Props = {
  station: AnyStation;
  cond: StationCondition;
  spotsAll: Spot[];
  spotsMatched: Spot[];
  isThin: boolean;
};

export function StationSpotConditionView({
  station,
  cond,
  spotsAll,
  spotsMatched,
  isThin,
}: Props) {
  const wardName = station.regionLabel;

  // 駅・エリア導入文＋該当スポットの設備内訳（駅×条件ごとに固有のデータ由来サマリー）。
  const stationIntro = buildStationIntro({
    stationName: station.name,
    wardName,
    lines: station.lines,
    scale: station.scale,
    familyFriendly: station.familyFriendly,
  });
  const insight = buildSpotInsight(spotsMatched);
  const insightText = insightToSentence(insight, cond.label, '件');

  // 該当スポットの実データのみから組むページ固有FAQ（捏造ゼロ）。
  // 旧: 全ページ共通の固定FAQ（重複コンテンツ）を、データ由来の固有FAQへ置換。
  const faqItems = buildSpotFaq(station.name, cond.label, spotsMatched);
  const faqLd = faqToJsonLd(faqItems);

  // JSON-LD ItemList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${station.name}駅 ${cond.titlePart}`,
    description: `${station.name}駅周辺で${cond.metaPart}のスポット`,
    numberOfItems: spotsMatched.length,
    itemListElement: spotsMatched.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Place',
        name: s.name,
        description: s.note,
      },
    })),
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HOME', item: 'https://kyounoko.jp/' },
      { '@type': 'ListItem', position: 2, name: '駅別ガイド', item: 'https://kyounoko.jp/station' },
      { '@type': 'ListItem', position: 3, name: `${station.name}駅`, item: `https://kyounoko.jp/station/${station.slug}` },
      { '@type': 'ListItem', position: 4, name: cond.label, item: `https://kyounoko.jp/station/${station.slug}/${cond.slug}` },
    ],
  };

  // category ごとにグルーピング
  const grouped = new Map<string, Spot[]>();
  for (const s of spotsMatched) {
    const k = SPOT_CATEGORY_LABEL[s.category];
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k)!.push(s);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <SiteHeader />
      <div className="container-article">
        <nav className="breadcrumb" aria-label="パンくず" style={{ marginBottom: 12 }}>
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <Link href="/station">駅別ガイド</Link>
          <span className="sep">/</span>
          <Link href={`/station/${station.slug}`}>{station.name}駅</Link>
          <span className="sep">/</span>
          <span>{cond.label}</span>
        </nav>

        <article>
          <header style={{ marginBottom: 32 }}>
            <h1
              style={{
                fontFamily: 'var(--font-mincho)',
                fontSize: 28,
                fontWeight: 600,
                lineHeight: 1.45,
                margin: '0 0 12px',
              }}
            >
              {station.name}駅 {cond.titlePart}｜{wardName}の子連れスポットガイド
            </h1>
            <p style={{ fontSize: 13, color: 'var(--ink-sub)', lineHeight: 1.85, margin: 0 }}>
              {cond.description}
            </p>

            {/* 駅・エリア導入文（駅の実データ由来） */}
            <p
              style={{
                fontSize: 14,
                color: 'var(--ink-sub)',
                lineHeight: 1.85,
                marginTop: 14,
                paddingLeft: 12,
                borderLeft: '3px solid rgba(201,96,62,0.30)',
              }}
            >
              {stationIntro}
            </p>

            {/* 集計インサイト（駅×条件ごとに固有のデータ由来サマリー） */}
            {insightText && (
              <div
                style={{
                  marginTop: 16,
                  padding: '14px 16px',
                  background: 'var(--paper-card)',
                  border: '1px solid rgba(201,96,62,0.16)',
                  borderRadius: 10,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clay-deep)', marginBottom: 6 }}>
                  この条件のデータ
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--ink-sub)', lineHeight: 1.8, margin: 0 }}>
                  {insightText}
                </p>
                {insight.stats.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                    {insight.stats.map((s) => (
                      <span
                        key={s.label}
                        style={{
                          fontSize: 11.5,
                          background: 'rgba(201,96,62,0.08)',
                          color: 'var(--clay-deep)',
                          padding: '3px 9px',
                          borderRadius: 999,
                        }}
                      >
                        {s.label} {s.count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 12 }}>
              {cond.tagline} | 該当 {spotsMatched.length} 件
            </p>
          </header>

          {isThin && (
            <aside
              style={{
                background: '#fff9ef',
                borderLeft: '3px solid #e2b39a',
                padding: '12px 14px',
                margin: '0 0 24px',
                fontSize: 13,
                color: 'var(--ink-sub)',
                lineHeight: 1.75,
              }}
            >
              現時点で {station.name}駅周辺の登録スポットは {spotsMatched.length} 件と少なめです。
              <Link href={`/station/${station.slug}`} style={{ color: 'var(--sage-deep)' }}>
                {' '}{station.name}駅 のメインページ
              </Link>
              {' '}や同区の他駅もあわせてご確認ください。
            </aside>
          )}

          {Array.from(grouped.entries()).map(([catLabel, spots]) => (
            <section key={catLabel} style={{ marginBottom: 36 }}>
              <h2
                style={{
                  fontFamily: 'var(--font-mincho)',
                  fontSize: 20,
                  fontWeight: 600,
                  margin: '0 0 16px',
                }}
              >
                {catLabel}（{spots.length}件）
              </h2>
              <div
                style={{
                  display: 'grid',
                  gap: 14,
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                }}
              >
                {spots.map((s) => (
                  <article
                    key={s.name}
                    style={{
                      background: 'var(--paper-card)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      fontSize: 13,
                      lineHeight: 1.7,
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: 'var(--font-mincho)',
                        fontSize: 15,
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      {s.name}
                    </h3>
                    {s.city && (
                      <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>
                        {s.city}・対象 {s.ages.join('/')}歳
                      </div>
                    )}
                    {s.note && (
                      <p style={{ margin: '8px 0 0', color: 'var(--ink-sub)' }}>{s.note}</p>
                    )}
                    {s.hiddenTip && (
                      <p style={{ margin: '6px 0 0', fontSize: 11.5, color: '#c4704f' }}>
                        💡 {s.hiddenTip}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}

          {/* ページ固有FAQ（該当スポットの実データ由来。旧・全ページ共通の固定FAQを置換） */}
          {faqItems.length > 0 && (
            <section style={{ marginTop: 40 }}>
              <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 22, fontWeight: 600, margin: '0 0 8px' }}>
                {station.name}駅 {cond.label}のよくある質問
              </h2>
              <p style={{ fontSize: 12.5, color: 'var(--ink-mute)', margin: '0 0 16px', lineHeight: 1.7 }}>
                このページに掲載中のスポットデータから回答しています。設備・料金は変更される場合があるため、来館前に各公式サイトもご確認ください。
              </p>
              <dl style={{ display: 'grid', gap: 14 }}>
                {faqItems.map((q, i) => (
                  <div key={i}>
                    <dt style={{ fontWeight: 600, fontSize: 14 }}>Q. {q.question}</dt>
                    <dd style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-sub)', lineHeight: 1.85 }}>
                      {q.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section style={{ marginTop: 40 }}>
            <Link
              href={`/station/${station.slug}`}
              className="btn-primary-light"
              style={{ display: 'inline-block' }}
            >
              ← {station.name}駅 子連れランチ・カフェガイドに戻る
            </Link>
          </section>
        </article>
      </div>
      <SiteFooter />
      <MobileStickyNav />
    </>
  );
}
