import Link from 'next/link';
import { getAllPlanMetas, getPlan } from '@/lib/plans';
import { getAreaName } from '@/lib/area';

export const revalidate = 3600;

export default function AdminPlans() {
  const metas = getAllPlanMetas();
  const plans = metas
    .map((m) => {
      const p = getPlan(m.id);
      const body = p?.body ?? '';
      const plain = body
        .replace(/^#+\s.*$/gm, '')
        .replace(/[*_`>-]/g, '')
        .trim()
        .replace(/\s+/g, ' ');
      return {
        ...m,
        bodyPreview: plain.slice(0, 160),
        bodyLength: plain.length,
      };
    })
    .sort((a, b) => {
      // エリア特化 → エリア → 年齢 → ID でソート
      if (a.area === 'all' && b.area !== 'all') return 1;
      if (a.area !== 'all' && b.area === 'all') return -1;
      return a.area.localeCompare(b.area) || a.id.localeCompare(b.id);
    });

  const byArea = new Map<string, typeof plans>();
  for (const p of plans) {
    const k = p.area;
    if (!byArea.has(k)) byArea.set(k, []);
    byArea.get(k)!.push(p);
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-mincho)', fontSize: 22, margin: 0 }}>
          プラン一覧 ({plans.length})
        </h1>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-mute)' }}>
          エリア別にグループ化
        </div>
      </div>

      {[...byArea.entries()].map(([area, list]) => (
        <section key={area} style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 14,
              fontWeight: 600,
              margin: '0 0 12px',
              padding: '6px 12px',
              background: area === 'all' ? '#f3efe8' : 'var(--peach-soft)',
              borderRadius: 6,
              display: 'inline-block',
              color: 'var(--ink)',
            }}
          >
            {getAreaName(area)} ({list.length})
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 12,
            }}
          >
            {list.map((p) => (
              <PlanCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

type Row = ReturnType<typeof getAllPlanMetas>[number] & { bodyPreview: string; bodyLength: number };

function PlanCard({ p }: { p: Row }) {
  const warn = !p.hero || p.bodyLength < 400 || !p.shortAnswer;

  return (
    <article
      style={{
        background: '#fff',
        border: `1px solid ${warn ? '#e2b39a' : 'var(--line)'}`,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          aspectRatio: '16 / 9',
          background: 'var(--peach-soft)',
          backgroundImage: p.hero ? `url(${p.hero})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
        }}
      >
        {!p.hero && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c4704f',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            画像なし
          </div>
        )}
      </div>

      <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', fontSize: 10 }}>
          <Tag>{p.ageRanges.join('/')}歳</Tag>
          <Tag>{p.durationMin}分</Tag>
          <Tag>{p.budget}</Tag>
          {p.place.map((pl) => (
            <Tag key={pl} variant="area">
              {pl === 'home' ? '家' : pl === 'indoor' ? '屋内' : '外'}
            </Tag>
          ))}
          <Tag variant={p.bodyLength >= 400 ? 'ok' : 'warn'}>{p.bodyLength}字</Tag>
        </div>

        <h3
          style={{
            fontFamily: 'var(--font-mincho)',
            fontSize: 13,
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.45,
            color: 'var(--ink)',
          }}
        >
          {p.title}
        </h3>

        <p
          style={{
            fontSize: 11,
            color: 'var(--ink-mute)',
            margin: 0,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {p.shortAnswer || p.bodyPreview || '（概要なし）'}
        </p>

        <div style={{ marginTop: 'auto', paddingTop: 6, display: 'flex', fontSize: 10, color: 'var(--ink-mute)' }}>
          <span style={{ opacity: 0.7 }}>{p.id}</span>
          <Link href={`/plan/${p.id}`} target="_blank" style={{ marginLeft: 'auto', color: 'var(--sage-deep)' }}>
            公開↗
          </Link>
        </div>
      </div>
    </article>
  );
}

function Tag({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'area' | 'ok' | 'warn';
}) {
  const styles = {
    default: { background: '#f3efe8', color: 'var(--ink-sub)' },
    area: { background: 'var(--peach-soft)', color: 'var(--clay)' },
    ok: { background: 'var(--sage-pale)', color: 'var(--sage-deep)' },
    warn: { background: '#f5e0d4', color: '#c4704f' },
  }[variant];
  return (
    <span
      style={{
        ...styles,
        padding: '2px 6px',
        borderRadius: 999,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}
