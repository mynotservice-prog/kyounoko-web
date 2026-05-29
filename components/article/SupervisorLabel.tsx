import type { Supervisor } from '@/lib/supervisors';

export function SupervisorLabel({ supervisor }: { supervisor: Supervisor }) {
  return (
    <aside
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        background: 'linear-gradient(135deg, rgba(80, 130, 100, .08), rgba(80, 130, 100, .03))',
        border: '1px solid rgba(80, 130, 100, .25)',
        borderRadius: 12,
        margin: '16px 0',
      }}
      aria-label="記事監修者"
    >
      <span
        aria-hidden
        style={{
          flex: '0 0 auto',
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgb(80, 130, 100)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
        }}
      >
        ✓
      </span>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-inter), sans-serif',
            color: 'rgb(60, 100, 75)',
            fontWeight: 700,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
          }}
        >
          Supervised by
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>
          {supervisor.name}
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              marginLeft: 6,
              color: 'var(--ink-sub)',
            }}
          >
            （{supervisor.qualification}）
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-sub)', marginTop: 4, lineHeight: 1.65 }}>
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
