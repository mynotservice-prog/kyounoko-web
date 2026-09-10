import { KkIcon, type KkIconName } from './KkIcon';
import { KkArt, type KkArtName } from './KkArt';

/** 支給アイコンイラストがある設備名。無いものは線画アイコンにフォールバックする。 */
const ART: ReadonlySet<string> = new Set<KkArtName>([
  'nursing', 'diaper', 'accessible-toilet', 'stroller', 'parking',
  'wifi', 'locker', 'utensils', 'microwave', 'rest-space',
  'kids-space', 'kids-menu', 'baby-food', 'lunch',
]);

export type KkFacilityItem = {
  icon: KkIconName;
  label: string;
  /** yes=あり / no=なし / text=任意の短いテキスト（例: 入店OK） */
  status: 'yes' | 'no' | 'text';
  text?: string;
};

/** 設備グリッド（4列）。項目の文言はデータ由来のものだけを渡す（捏造しない）。 */
export function KkFacilityGrid({ items, className }: { items: KkFacilityItem[]; className?: string }) {
  if (!items.length) return null;
  return (
    <div className={'kk-fac-grid' + (className ? ' ' + className : '')}>
      {items.map((it) => (
        <div key={it.label} className="kk-fac">
          <span className="kk-fac-ico">
            {ART.has(it.icon) ? (
              <KkArt name={it.icon as KkArtName} size={30} />
            ) : (
              <KkIcon name={it.icon} size={26} />
            )}
          </span>
          <span className="kk-fac-label">{it.label}</span>
          <span className={'kk-pill ' + it.status}>
            {it.status === 'yes' ? 'あり' : it.status === 'no' ? 'なし' : it.text}
          </span>
        </div>
      ))}
    </div>
  );
}
