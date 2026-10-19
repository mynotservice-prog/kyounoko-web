import Link from 'next/link';
import { V2Img } from '@/components/v2/V2Base';
import type { PrPlacement } from '@/lib/pr-placements';

/**
 * 記事・駅ページに置く有償PR枠（lib/pr-placements.ts）。
 * 「PR」と提供元を必ず表示し、AdSense の広告と見た目を分ける（枠線のカード・広告ラベルは使わない）。
 */
export function PrCard({ pr }: { pr: PrPlacement }) {
  return (
    <aside
      aria-label={`PR（提供：${pr.sponsor}）`}
      style={{
        margin: '28px 0',
        border: '1px solid var(--kk-rule)',
        borderRadius: 'var(--kk-r-ui, 10px)',
        padding: 14,
        background: 'var(--kk-paper-soft, #fff)',
      }}
    >
      <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--kk-ink-mute)' }}>
        <span className="pr-label">PR</span>
        {pr.sponsor}から対価を受けて掲載している枠です
      </p>
      <Link
        href={pr.href}
        style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'inherit', textDecoration: 'none' }}
      >
        <span
          style={{
            flex: '0 0 96px',
            width: 96,
            height: 72,
            borderRadius: 'var(--kk-r-img, 8px)',
            overflow: 'hidden',
            display: 'block',
          }}
        >
          <V2Img src={pr.img} seed={pr.id} alt="" sizes="96px" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </span>
        <span style={{ display: 'block', minWidth: 0 }}>
          <strong style={{ display: 'block', fontSize: 15, lineHeight: 1.4, color: 'var(--kk-ink)' }}>
            {pr.title}
          </strong>
          <span style={{ display: 'block', fontSize: 13, lineHeight: 1.5, color: 'var(--kk-ink-soft)', marginTop: 2 }}>
            {pr.sub}
          </span>
        </span>
      </Link>
    </aside>
  );
}
