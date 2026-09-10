import Link from 'next/link';
import { KkSectionTitle } from '@/components/kk/KkSectionTitle';
import { KkRowList, type KkRowItem } from '@/components/kk/KkRowList';
import { V2Img } from '@/components/v2/V2Base';
import { spotToV2 } from '@/lib/v2-adapters';
import { getPurposeRankings } from '@/lib/purpose-rankings';

/**
 * 首都圏 × 目的別の実用ランキング（P1-2）。
 * 2026-09 リニューアル: 横スクロールのカード10枚 → 罫線だけの行リスト（上位5件を表示、6〜10位は折りたたみ）。
 * PC（920px〜）は kk.css の .kk-rows.grid2 で2段組にする。
 * リンク先（/spot/[slug]・moreHref）と画像は従来と同じ（内部リンクを減らさない）。
 */
export async function V2PurposeRanking() {
  const rankings = await getPurposeRankings(10);
  if (!rankings.length) return null;

  return (
    <>
      {rankings.map((r) => {
        const rows: KkRowItem[] = r.items.map((x, i) => {
          const v = spotToV2(x.spot, i);
          return {
            href: `/spot/${x.slug}`,
            title: v.name,
            sub: [v.cat, v.station].filter(Boolean).join('・'),
            img: v.img,
            seed: v.id,
          };
        });
        const head = rows.slice(0, 5);
        const rest = rows.slice(5);
        return (
          <section key={r.key} className="kk-sec tv3-purpose">
            {/* 見出しは文字と余白だけで成立させる（絵文字・装飾は置かない / §2-1・§3-0）。
                r.emoji は他ページ用に lib 側へ残し、ここでは描画しない。 */}
            <KkSectionTitle as="h2" title={r.title} moreHref={r.moreHref} />
            <KkRowList items={head} variant="rank" className="grid2" label={r.title} />
            {rest.length > 0 && (
              <details className="tv3-purpose-more">
                <summary>6位〜{rows.length}位も見る</summary>
                <RankRestRows items={rest} offset={head.length} />
              </details>
            )}
          </section>
        );
      })}
    </>
  );
}

/** 6位以降: 順位番号を続きから振るため KkRowList の rank 表示を自前で再現する（トップの人気スポットでも使う）。 */
export function RankRestRows({ items, offset }: { items: KkRowItem[]; offset: number }) {
  return (
    <div className="kk-rows grid2">
      {items.map((it, i) => (
        <Link key={it.href} href={it.href} className="kk-row">
          <span className="kk-row-num">{offset + i + 1}</span>
          <span className="kk-row-body">
            <span className="kk-row-title">{it.title}</span>
            {it.sub && <span className="kk-row-sub">{it.sub}</span>}
          </span>
          {it.img && (
            <span className="kk-row-thumb">
              <V2Img src={it.img} seed={it.seed ?? it.href} alt="" />
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
