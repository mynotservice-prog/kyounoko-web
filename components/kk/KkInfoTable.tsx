import type { ReactNode } from 'react';
import { KkIcon, type KkIconName } from './KkIcon';

export type KkInfoRow = { icon?: KkIconName; label: string; value: ReactNode };

/** アイコン付き基本情報テーブル。value が空の行は呼び出し側で除外すること。 */
export function KkInfoTable({ rows, className }: { rows: KkInfoRow[]; className?: string }) {
  if (!rows.length) return null;
  return (
    <table className={'kk-info' + (className ? ' ' + className : '')}>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <th scope="row">
              <span className="kk-info-lab">
                {r.icon && <KkIcon name={r.icon} size={16} />}
                {r.label}
              </span>
            </th>
            <td>{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
