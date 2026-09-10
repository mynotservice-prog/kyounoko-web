import Link from 'next/link';
import { V2Img } from '@/components/v2/V2Base';

/** 写真タイル（主要ターミナル → /station/[slug]）。画像は社長支給（public/img/areas）。 */
const AREA_TILES = [
  { t: '渋谷', href: '/station/shibuya', img: '/img/areas/shibuya.webp' },
  { t: '池袋', href: '/station/ikebukuro', img: '/img/areas/ikebukuro.webp' },
  { t: '新宿', href: '/station/shinjuku', img: '/img/areas/shinjuku.webp' },
  { t: '上野', href: '/station/ueno', img: '/img/areas/ueno.webp' },
  { t: '東京', href: '/station/tokyo', img: '/img/areas/tokyo.webp' },
] as const;

export type AreaChip = {
  t: string;
  href: string;
};

/**
 * エリアから探す: 小さめの写真タイル4枚 ＋ 静かなチップ列。
 * 2026-09 第2版: チップの多色アイコン（V2_ACCENT のパステル地）は廃し、罫線だけのチップにした。
 * リンク先は従来どおり（減らさない）。
 */
export function TopAreaTiles({ chips }: { chips: AreaChip[] }) {
  return (
    <>
      <div className="kk-tiles tv3-area-tiles">
        {AREA_TILES.map((a) => (
          <Link key={a.href} href={a.href} className="kk-tile">
            <span className="kk-tile-img">
              <V2Img src={a.img} seed={a.href} alt={`${a.t}駅周辺`} />
            </span>
            <span className="kk-tile-label">{a.t}</span>
          </Link>
        ))}
      </div>
      {/* 旧「エリアから探す」チップ（リンク先を減らさないため維持） */}
      <div className="kk-chips tv3-area-chips">
        {chips.map((c) => (
          <Link key={c.t} href={c.href} className="kk-chip">
            {c.t}
          </Link>
        ))}
      </div>
    </>
  );
}
