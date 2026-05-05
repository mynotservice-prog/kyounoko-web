import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import {
  TOKYO_LINES,
  getLineBySlug,
  getStationsOnLine,
} from '@/lib/tokyo-lines';
import { WARD_NAMES } from '@/lib/tokyo-stations';

export const dynamic = 'force-static';
export const revalidate = 86400;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return TOKYO_LINES.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const line = getLineBySlug(slug);
  if (!line) return { title: '路線が見つかりません', robots: { index: false } };
  const stations = getStationsOnLine(line);
  const title = `${line.name} 全${stations.length}駅 子連れランチ・ベビーカーOK店ガイド｜きょうのこ`;
  const description = `${line.name}沿線の${stations.length}駅で子連れOK・ベビーカー入店OKのファミレス・カフェを駅別にチェック。キッズメニュー・キッズチェア・個室・離乳食持込まで全項目。`;
  return {
    title,
    description,
    alternates: { canonical: `/station/line/${slug}` },
  };
}

export default async function LinePage({ params }: Props) {
  const { slug } = await params;
  const line = getLineBySlug(slug);
  if (!line) notFound();

  const stations = getStationsOnLine(line);

  // ターミナル駅・主要駅・一般駅でグループ
  const terminal = stations.filter((s) => s.scale === 'terminal');
  const major = stations.filter((s) => s.scale === 'major');
  const minor = stations.filter((s) => s.scale === 'minor');

  return (
    <>
      <SiteHeader />

      <div className="container">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <Link href="/station">駅別ランチ</Link>
          <span className="sep">/</span>
          <Link href="/station/line">路線別</Link>
          <span className="sep">/</span>
          <span>{line.name}</span>
        </nav>
      </div>

      <section className="section">
        <div className="container-narrow">
          <header className="page-head">
            <span className="eyebrow" style={{ color: line.color }}>
              {line.operator === 'JR' ? 'JR東日本' : line.operator === 'tokyo-metro' ? '東京メトロ' : line.operator === 'toei' ? '都営地下鉄' : '私鉄'}
            </span>
            <h1 style={{ borderBottom: `4px solid ${line.color}`, paddingBottom: 12, display: 'inline-block' }}>
              {line.name}
              <small style={{ display: 'block', fontSize: '0.5em', fontWeight: 400, color: 'var(--ink-sub)', marginTop: 8 }}>
                全{stations.length}駅 子連れランチ・ベビーカーOK店ガイド
              </small>
            </h1>
            <p className="lead">
              {line.name}沿線で子連れランチ・カフェに使えるチェーン店を、駅単位で全駅チェック。
              ベビーカー入店◎、キッズメニュー、キッズチェア、個室、離乳食持込までの可否を全部確認できます。
            </p>
          </header>

          {terminal.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 20, marginBottom: 14 }}>
                ターミナル駅 <span style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 400 }}>{terminal.length}駅</span>
              </h2>
              <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                {terminal.map((s) => (
                  <Link key={s.slug} href={`/station/${s.slug}`} className="station-card-mini" style={{
                    background: 'var(--paper-card)',
                    border: `2px solid ${line.color}`,
                    borderRadius: 8,
                    padding: '10px 14px',
                    textDecoration: 'none',
                    color: 'var(--ink)',
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>{WARD_NAMES[s.ward]}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {major.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 20, marginBottom: 14 }}>
                主要駅 <span style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 400 }}>{major.length}駅</span>
              </h2>
              <div style={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                {major.map((s) => (
                  <Link key={s.slug} href={`/station/${s.slug}`} className="station-card-mini" style={{
                    background: 'var(--paper-card)',
                    border: '1px solid rgba(201,96,62,0.16)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    textDecoration: 'none',
                    color: 'var(--ink)',
                  }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{WARD_NAMES[s.ward]}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {minor.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 20, marginBottom: 14 }}>
                その他の駅 <span style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 400 }}>{minor.length}駅</span>
              </h2>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {minor.map((s) => (
                  <Link key={s.slug} href={`/station/${s.slug}`} className="chip">
                    {s.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 他の路線 */}
          <section style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(201,96,62,0.14)' }}>
            <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 18, marginBottom: 12 }}>
              他の路線も見る
            </h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TOKYO_LINES.filter((l) => l.slug !== line.slug).slice(0, 12).map((l) => (
                <Link key={l.slug} href={`/station/line/${l.slug}`} className="chip" style={{
                  borderLeft: `3px solid ${l.color}`,
                  paddingLeft: 10,
                }}>
                  {l.name}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
