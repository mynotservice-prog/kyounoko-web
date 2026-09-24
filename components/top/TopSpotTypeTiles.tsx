import Link from 'next/link';
import { KkArt, type KkArtName } from '@/components/kk/KkArt';
import { BROWSE_CATEGORIES } from '@/lib/spot-browse';

/**
 * スポットの種類から探す（線画アイコンのタイル）。
 *
 * 2026-09 第3版（社長指示）:
 * - **アイコンとラベルの意味を一致させる**。従来は lib/spot-browse.ts の `icon`
 *   （動物園=葉・水族館=傘・遊園地=クラッカー…）をそのまま V2Icon に渡していて、
 *   ラベルと絵が食い違っていた。ここでカテゴリIDごとに絵を明示する。
 * - 絵は社長支給のアイコンイラスト（KkArt / public/img/icons/kk）を使う。
 * - 丸角カードにしない（罫線だけのグリッド。CSS は .tv3-types）。
 * - リンク先は既存の /spots/[cat]（BROWSE_CATEGORIES で静的生成される実在ルート）のみ。
 *   表示は全9カテゴリ（2026-09 農場・農園を追加）（従来は先頭6件。牧場・観光スポットへの導線を足すだけで、既存リンクは減らさない）。
 */
const TYPE_ICON: Record<string, KkArtName> = {
  park: 'park',           // 公園・自然 → 木とベンチ
  zoo: 'zoo',             // 動物園 → キリンとゾウ
  aquarium: 'aquarium',   // 水族館 → 水槽と魚
  museum: 'museum',       // 博物館・科学館 → 神殿風の建物
  indoor: 'kids-space',   // 室内遊び場 → 屋内キッズスペース
  amusement: 'themepark', // 遊園地 → 観覧車
  farm: 'farm',           // 牧場 → 牛と羊
  harvest: 'nature-trees', // 農場・農園 → 木々（収穫体験の専用イラストは未支給）
  seasonal: 'shrine',     // 観光スポット → 鳥居
};

export function TopSpotTypeTiles() {
  return (
    <div className="tv3-types">
      {BROWSE_CATEGORIES.map((c) => (
        <Link key={c.id} href={`/spots/${c.id}`} className="tv3-type">
          <span className="tv3-type-ico">
            <KkArt name={TYPE_ICON[c.id] ?? 'park'} size={44} />
          </span>
          <span className="tv3-type-label">{c.label}</span>
        </Link>
      ))}
    </div>
  );
}
