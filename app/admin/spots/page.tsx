import { SPOTS, SPOT_CATEGORY_LABEL } from '@/lib/spots';
import { AREAS, getAreaName, type AreaSlug } from '@/lib/area';

export const revalidate = 3600;

export default function AdminSpots() {
  const total = Object.values(SPOTS).reduce((sum, arr) => sum + (arr?.length ?? 0), 0);
  const covered = Object.keys(SPOTS).length;
  const allPrefs = AREAS.filter((a) => a.slug !== 'all' && a.block).sort();
  const notCoveredPrefs = allPrefs.filter((a) => !SPOTS[a.slug]);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 22, margin: 0 }}>
          スポット一覧 ({total})
        </h1>
        <a
          href="/admin/spots/edit"
          style={{
            marginLeft: 'auto',
            fontSize: 13,
            fontWeight: 600,
            padding: '7px 16px',
            background: 'var(--ink)',
            color: '#fff',
            borderRadius: 6,
            textDecoration: 'none',
          }}
        >
          ✏️ 編集する
        </a>
        <div style={{ marginLeft: 16, fontSize: 12, color: 'var(--ink-mute)' }}>
          {covered}都道府県カバー / 47
        </div>
      </div>

      {notCoveredPrefs.length > 0 && (
        <div
          style={{
            background: '#fffbf5',
            border: '1px solid #e2b39a',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 24,
            fontSize: 12,
          }}
        >
          <strong style={{ color: '#c4704f' }}>未カバー ({notCoveredPrefs.length}県):</strong>{' '}
          <span style={{ color: 'var(--ink-sub)' }}>
            {notCoveredPrefs.map((a) => a.name).join('、')}
          </span>
        </div>
      )}

      {Object.entries(SPOTS).map(([areaKey, list]) => {
        if (!list) return null;
        return (
          <section key={areaKey} style={{ marginBottom: 28 }}>
            <h2
              style={{
                fontSize: 15,
                fontWeight: 600,
                margin: '0 0 10px',
                padding: '6px 12px',
                background: 'var(--peach-soft)',
                color: 'var(--ink)',
                borderRadius: 6,
                display: 'inline-block',
              }}
            >
              {getAreaName(areaKey as AreaSlug)} ({list.length})
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 10,
              }}
            >
              {list.map((s) => (
                <div
                  key={s.name}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    fontSize: 12,
                  }}
                >
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', fontSize: 10 }}>
                    <span
                      style={{
                        background: 'var(--sage-pale)',
                        color: 'var(--sage-deep)',
                        padding: '2px 6px',
                        borderRadius: 999,
                        fontWeight: 600,
                      }}
                    >
                      {SPOT_CATEGORY_LABEL[s.category]}
                    </span>
                    <span
                      style={{
                        background: '#f3efe8',
                        color: 'var(--ink-sub)',
                        padding: '2px 6px',
                        borderRadius: 999,
                      }}
                    >
                      {s.place === 'indoor' ? '屋内' : s.place === 'outdoor' ? '屋外' : '屋内外'}
                    </span>
                    {s.budget && (
                      <span
                        style={{
                          background: '#f3efe8',
                          color: 'var(--ink-sub)',
                          padding: '2px 6px',
                          borderRadius: 999,
                        }}
                      >
                        {s.budget}
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mincho)', fontWeight: 600, fontSize: 13 }}>
                    {s.name}
                  </div>
                  {s.city && (
                    <div style={{ color: 'var(--ink-mute)', fontSize: 10 }}>
                      {s.city}・{s.ages.join('/')}歳
                    </div>
                  )}
                  {s.note && (
                    <div style={{ color: 'var(--ink-sub)', fontSize: 11, lineHeight: 1.55 }}>
                      {s.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
