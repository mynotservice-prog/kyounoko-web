import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { TOKYO_STATIONS, WARD_NAMES, type TokyoWard, type TokyoStation } from '@/lib/tokyo-stations';

export const dynamic = 'force-static';
export const revalidate = 86400;

export const metadata: Metadata = {
  title: '東京23区 駅別 子連れランチ・ベビーカーOK店ガイド｜きょうのこ',
  description: '東京23区全484駅の周辺で子連れOK・ベビーカー入店OKのファミレス・カフェ・チェーン店を駅別にチェック。キッズメニュー、キッズチェア、個室、離乳食持込までの可否を全部表示。',
  alternates: { canonical: '/station' },
};

export default function StationIndexPage() {
  // 区別グルーピング
  const byWard = new Map<TokyoWard, TokyoStation[]>();
  for (const s of TOKYO_STATIONS) {
    if (!byWard.has(s.ward)) byWard.set(s.ward, []);
    byWard.get(s.ward)!.push(s);
  }

  // 区を所定の順序で
  const wardOrder: TokyoWard[] = [
    'chiyoda', 'chuo', 'minato', 'shinjuku', 'bunkyo', 'taito',
    'sumida', 'koto', 'shinagawa', 'meguro', 'ota', 'setagaya',
    'shibuya', 'nakano', 'suginami', 'toshima', 'kita', 'arakawa',
    'itabashi', 'nerima', 'adachi', 'katsushika', 'edogawa',
  ];

  return (
    <>
      <SiteHeader />

      <div className="container">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link href="/">HOME</Link>
          <span className="sep">/</span>
          <span>駅別ランチ</span>
        </nav>
      </div>

      <section className="section">
        <div className="container-narrow">
          <header className="page-head" style={{ marginBottom: 32 }}>
            <span className="eyebrow">東京23区 全484駅対応</span>
            <h1>駅別 子連れランチ・ベビーカーOK店ガイド</h1>
            <p className="lead">
              東京23区の全駅で、子連れOK・ベビーカー入店可・キッズメニューありの飲食チェーンを駅単位で網羅。
              ターミナル駅から住宅地の小さな駅まで、行きたい駅をクリックすれば即わかる。
            </p>
          </header>

          {wardOrder.map((ward) => {
            const stations = byWard.get(ward);
            if (!stations || stations.length === 0) return null;
            const wardName = WARD_NAMES[ward];
            const sorted = [...stations].sort((a, b) => {
              if (a.scale !== b.scale) {
                const order = { terminal: 0, major: 1, minor: 2 };
                return order[a.scale] - order[b.scale];
              }
              return a.name.localeCompare(b.name, 'ja');
            });
            return (
              <section key={ward} style={{ marginBottom: 36 }}>
                <h2 style={{ fontFamily: 'var(--font-mincho)', fontSize: 20, marginBottom: 14 }}>
                  {wardName} <span style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 400 }}>{stations.length}駅</span>
                </h2>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {sorted.map((s) => (
                    <Link key={s.slug} href={`/station/${s.slug}`} className="chip" style={{
                      fontWeight: s.scale === 'terminal' ? 600 : s.scale === 'major' ? 500 : 400,
                      borderColor: s.scale === 'terminal' ? 'var(--clay)' : undefined,
                    }}>
                      {s.name}
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
