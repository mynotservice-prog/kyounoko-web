import { V2SectionHead } from '@/components/v2/V2Base';
import { V2SpotCardV } from '@/components/v2/V2Cards';
import { spotToV2 } from '@/lib/v2-adapters';
import { getPurposeRankings } from '@/lib/purpose-rankings';

/**
 * 首都圏 × 目的別の実用ランキング（P1-2）。
 * 各目的の TOP10 を横スクロールのランク付きカードで見せる。
 */
export function V2PurposeRanking() {
  const rankings = getPurposeRankings(10);
  if (!rankings.length) return null;

  return (
    <>
      {rankings.map((r) => (
        <section key={r.key} style={{ marginTop: 8 }}>
          <V2SectionHead title={`${r.emoji} ${r.title}`} more="すべて見る" moreHref={r.moreHref} />
          <div
            className="v2-hscroll"
            style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, scrollSnapType: 'x proximity' }}
          >
            {r.items.map((x, i) => (
              <div key={x.slug} style={{ scrollSnapAlign: 'start', flex: '0 0 auto' }}>
                <V2SpotCardV spot={spotToV2(x.spot, i)} rank={i + 1} href={`/spot/${x.slug}`} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
