import type { Supervisor } from '@/lib/supervisors';
import { KkIcon } from '@/components/kk/KkIcon';

/**
 * 記事監修者ラベル（E-E-A-T）。
 * 2026-09 リニューアル第2版: 面（緑グラデーションの丸角カード）をやめ、
 * 上下の細い罫線で挟んだ注記ブロックにした。文言・順序は不変。
 */
export function SupervisorLabel({ supervisor }: { supervisor: Supervisor }) {
  return (
    <aside className="av3-sup" aria-label="記事監修者">
      <span aria-hidden className="av3-sup-mark">
        <KkIcon name="check" size={15} sw={2.2} />
      </span>
      <div className="av3-sup-body">
        <div className="av3-sup-eyebrow">Supervised by</div>
        <div className="av3-sup-name">
          {supervisor.name}
          <span className="av3-sup-qual">（{supervisor.qualification}）</span>
        </div>
        <div className="av3-sup-bio">
          {supervisor.bio}
          {supervisor.affiliation && (
            <>
              {' / '}
              {supervisor.affiliation}
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
