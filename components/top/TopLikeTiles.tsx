import Link from 'next/link';
import { V2Img } from '@/components/v2/V2Base';

/** 子どもの「好き」から見つける（2×2 写真タイル）。画像は public/v2 の既存ファイル。 */
const LIKE_TILES = [
  { t: '習い事と学び', href: '/category/narai', img: '/v2/conditions/narai.webp' },
  { t: '役立つもの', href: '/category/yakudatsu', img: '/v2/conditions/yakudatsu.webp' },
  { t: '今日何する', href: '/category/today-nani', img: '/v2/conditions/today-nani.webp' },
  { t: '人気スポットランキング', href: '/ranking', img: '/v2/spot-categories/aquarium-family.webp' },
] as const;

export function TopLikeTiles() {
  return (
    <div className="kk-tiles two">
      {LIKE_TILES.map((x) => (
        <Link key={x.href} href={x.href} className="kk-tile">
          <span className="kk-tile-img">
            <V2Img src={x.img} seed={x.href} alt={x.t} />
          </span>
          <span className="kk-tile-label">{x.t}</span>
        </Link>
      ))}
    </div>
  );
}
