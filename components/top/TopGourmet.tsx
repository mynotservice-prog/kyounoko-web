import Link from 'next/link';
import { V2Img } from '@/components/v2/V2Base';
import { KkIcon } from '@/components/kk/KkIcon';

export type GourmetTile = { t: string; href: string; img: string; seed: string };

/**
 * 子連れで行きたい飲食店: 横長の大きな写真1枚（特集 → /category/today-taberu）＋
 * ハブ記事の大きな2枚組タイル（PCは4列）。
 * 2026-09 第2版: カード（枠・影・角丸）をやめ、写真の大きさと余白でセクションのリズムを作る。
 * タイルの画像は記事自身の hero（getAllFileArticlesWithOverrides → articleToV2）。
 */
export function TopGourmet({ tiles }: { tiles: GourmetTile[] }) {
  return (
    <>
      <Link href="/category/today-taberu" className="tv3-feature">
        <span className="tv3-feature-img">
          <V2Img src="/img/top/gourmet-guide.webp" seed="today-taberu" alt="子連れ外食 徹底ガイド" />
        </span>
        <span className="tv3-feature-body">
          <span className="tv3-feature-eyebrow">特集</span>
          <span className="tv3-feature-title">子連れ外食 徹底ガイド</span>
          <span className="tv3-feature-sub">キッズメニュー・座席・雰囲気をわかりやすく</span>
          <span className="tv3-feature-cta">
            記事一覧へ
            <KkIcon name="arrow-right" size={13} sw={2.2} />
          </span>
        </span>
      </Link>
      <div className="kk-tiles two tv3-gourmet-tiles">
        {tiles.map((x) => (
          <Link key={x.href} href={x.href} className="kk-tile">
            <span className="kk-tile-img">
              <V2Img src={x.img} seed={x.seed} alt={x.t} />
            </span>
            <span className="kk-tile-label">{x.t}</span>
          </Link>
        ))}
      </div>
      {/* 提供写真のクレジット（編集方針5-5: 提供を受けた写真には提供元名を明記） */}
      <p className="tv3-gourmet-credit">写真提供：株式会社一蘭（ラーメン）</p>
    </>
  );
}
