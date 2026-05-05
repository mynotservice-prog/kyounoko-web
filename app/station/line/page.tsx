import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { TOKYO_LINES, getLinesWithCounts } from '@/lib/tokyo-lines';

export const dynamic = 'force-static';
export const revalidate = 86400;

export const metadata: Metadata = {
  title: '東京 路線別 子連れランチ・ベビーカーOK店ガイド｜きょうのこ',
  description: 'JR・東京メトロ・都営地下鉄・私鉄の主要路線で、各路線の全駅の子連れOK・ベビーカーOK飲食店を一覧で。山手線・丸ノ内線・東急東横線など23区を走る40路線対応。',
  alternates: { canonical: '/station/line' },
};

export default function LineIndexPage() {
  const lines = getLinesWithCounts();

  // 運営事業者でグルーピング
  const byOperator = {
    JR: lines.filter((l) => l.line.operator === 'JR'),
    'tokyo-metro': lines.filter((l) => l.line.operator === 'tokyo-metro'),
    toei: lines.filter((l) => l.line.operator === 'toei'),
    private: lines.filter((l) => l.line.operator === 'private'),
  };

  return (
    <>
      <SiteHeader />

      <div className="container">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <Link href="/station">駅別ランチ</Link>
          <span className="sep">/</span>
          <span>路線別</span>
        </nav>
      </div>

      <section className="section">
        <div className="container-narrow">
          <header className="page-head" style={{ marginBottom: 32 }}>
            <span className="eyebrow">23区を走る40路線対応</span>
            <h1>路線別 子連れランチ・ベビーカーOK店ガイド</h1>
            <p className="lead">
              JR・東京メトロ・都営地下鉄・主要私鉄から路線を選ぶと、その路線の全駅の子連れOK飲食店一覧へ。
              通勤通学・お出かけ・通り道のランチ場所探しに。
            </p>
          </header>

          {Object.entries({
            'JR': 'JR東日本（山手線・京浜東北線等）',
            'tokyo-metro': '東京メトロ（銀座線・丸ノ内線等）',
            'toei': '都営地下鉄（浅草線・三田線等）',
            'private': '主要私鉄（東急・小田急・京王・西武・東武等）',
          } as const).map(([key, label]) => {
            const items = byOperator[key as keyof typeof byOperator];
            if (!items || items.length === 0) return null;
            return (
              <section key={key} style={{ marginBottom: 36 }}>
                <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 20, marginBottom: 14 }}>
                  {label}
                </h2>
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                  {items.map(({ line, count }) => (
                    <Link key={line.slug} href={`/station/line/${line.slug}`} style={{
                      display: 'block',
                      background: 'var(--paper-card)',
                      border: '1px solid rgba(201,96,62,0.16)',
                      borderLeft: `5px solid ${line.color}`,
                      borderRadius: 10,
                      padding: '14px 18px',
                      textDecoration: 'none',
                      color: 'var(--ink)',
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                        {line.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
                        {count}駅対応
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
