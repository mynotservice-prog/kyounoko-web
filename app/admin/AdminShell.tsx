'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminIcon } from '@/components/admin/icons';

type NavItem = { id: string; label: string; icon: string; path: string };
type NavGroup = { title: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    title: '分析・計測',
    items: [
      { id: 'dashboard', label: 'ダッシュボード', icon: 'dashboard', path: '/admin' },
      { id: 'kpi', label: '経営KPI', icon: 'kpi', path: '/admin/kpi' },
      { id: 'insights', label: 'Insights', icon: 'insights', path: '/admin/insights' },
      { id: 'events', label: 'Events', icon: 'events', path: '/admin/events' },
      { id: 'ab', label: 'A/B テスト', icon: 'ab', path: '/admin/ab' },
      { id: 'seo', label: 'SEO', icon: 'seo', path: '/admin/seo' },
    ],
  },
  {
    title: 'コンテンツ',
    items: [
      { id: 'articles', label: '記事', icon: 'articles', path: '/admin/articles' },
      { id: 'plans', label: 'プラン', icon: 'plans', path: '/admin/plans' },
      { id: 'spots', label: 'スポット', icon: 'spots', path: '/admin/spots' },
      { id: 'reviews', label: '口コミ承認', icon: 'reviews', path: '/admin/reviews' },
    ],
  },
  {
    title: '運用・編集',
    items: [
      { id: 'spot-edit', label: 'スポット編集', icon: 'spot-edit', path: '/admin/spots/edit' },
      { id: 'event-edit', label: 'イベント編集', icon: 'event-edit', path: '/admin/events/edit' },
      { id: 'event-images', label: 'イベント画像', icon: 'image', path: '/admin/event-images' },
      { id: 'imagegen', label: 'Image Gen', icon: 'imagegen', path: '/admin/image-gen' },
    ],
  },
];

const ALL_ITEMS = NAV.flatMap((g) => g.items.map((it) => ({ ...it, group: g.title })));

/** 現在のパスに最も長く前方一致するナビ項目を返す（/admin/spots/edit が spots でなく spot-edit に当たるように） */
function matchActive(pathname: string) {
  let best: (typeof ALL_ITEMS)[number] | null = null;
  for (const it of ALL_ITEMS) {
    const exact = pathname === it.path;
    const prefix = pathname.startsWith(it.path + '/');
    if (exact || prefix) {
      if (!best || it.path.length > best.path.length) best = it;
    }
  }
  return best;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/admin';
  const [collapsed, setCollapsed] = useState(false);
  const active = matchActive(pathname);

  // 口コミの未承認件数をメニューにバッジ表示（確認しやすく）。失敗時はバッジ無し。
  const [pendingReviews, setPendingReviews] = useState(0);
  useEffect(() => {
    let alive = true;
    fetch('/api/admin/reviews', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (alive && j?.pending) setPendingReviews(j.pending.length); })
      .catch(() => {});
    return () => { alive = false; };
  }, [pathname]);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* ============ SIDEBAR ============ */}
      <aside
        style={{
          width: collapsed ? 64 : 244,
          flex: '0 0 auto',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          transition: 'width .16s ease',
          overflow: 'hidden',
        }}
      >
        <Link
          href="/admin"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            height: 52,
            padding: '0 14px',
            borderBottom: '1px solid var(--border-divider)',
            flex: '0 0 auto',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              flex: '0 0 auto',
              borderRadius: 'var(--r-sm)',
              background: 'var(--accent)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            き
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25, minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '.01em' }}>
                きょうのこ
              </span>
              <span style={{ fontSize: 11, color: 'var(--ink-400)', fontWeight: 500 }}>管理画面</span>
            </div>
          )}
        </Link>

        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '14px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {NAV.map((grp) => (
            <div key={grp.title}>
              {!collapsed && (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '.03em',
                    color: 'var(--ink-400)',
                    padding: '0 10px',
                    margin: '0 0 6px',
                  }}
                >
                  {grp.title}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {grp.items.map((item) => {
                  const isActive = active?.id === item.id;
                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      title={item.label}
                      className={`admin-nav-item${isActive ? ' is-active' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 11,
                        width: '100%',
                        padding: collapsed ? '9px 0' : '7px 11px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        borderRadius: 'var(--r-sm)',
                        cursor: 'pointer',
                        fontSize: 13.5,
                        textAlign: 'left',
                        position: 'relative',
                        textDecoration: 'none',
                        background: isActive ? 'var(--accent-tint)' : 'transparent',
                        color: isActive ? 'var(--accent)' : 'var(--ink-600)',
                        fontWeight: isActive ? 600 : 500,
                      }}
                    >
                      {isActive && (
                        <span
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 6,
                            bottom: 6,
                            width: 3,
                            borderRadius: '0 3px 3px 0',
                            background: 'var(--accent)',
                          }}
                        />
                      )}
                      <span style={{ display: 'flex', flex: '0 0 auto', color: 'inherit' }}>
                        <AdminIcon name={item.icon} />
                      </span>
                      {!collapsed && (
                        <span
                          style={{
                            flex: 1,
                            minWidth: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.label}
                        </span>
                      )}
                      {item.id === 'reviews' && pendingReviews > 0 && (
                        <span
                          title={`未承認 ${pendingReviews} 件`}
                          style={{
                            flex: '0 0 auto',
                            minWidth: 18,
                            height: 18,
                            padding: '0 5px',
                            borderRadius: 999,
                            background: '#e0574c',
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            ...(collapsed
                              ? { position: 'absolute', top: 3, right: 6 }
                              : { marginLeft: 'auto' }),
                          }}
                        >
                          {pendingReviews}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div style={{ flex: '0 0 auto', borderTop: '1px solid var(--border-divider)', padding: '8px 10px' }}>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="admin-hover-bg"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              width: '100%',
              padding: '8px 10px',
              border: 'none',
              borderRadius: 'var(--r-sm)',
              background: 'transparent',
              color: 'var(--ink-500)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <span style={{ display: 'flex', transform: collapsed ? 'rotate(180deg)' : 'none' }}>
              <AdminIcon name="chevron" />
            </span>
            {!collapsed && <span>折りたたむ</span>}
          </button>
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* topbar */}
        <header
          style={{
            height: 52,
            flex: '0 0 auto',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, minWidth: 0 }}>
            <span style={{ color: 'var(--ink-400)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {active?.group ?? '管理画面'}
            </span>
            <span style={{ color: '#cfc9c1' }}>/</span>
            <span
              style={{
                color: 'var(--ink-900)',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {active?.label ?? 'ダッシュボード'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '0 0 auto' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)',
                padding: '4px 9px',
                fontSize: 11.5,
                color: 'var(--ink-500)',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--neu-dot)' }} />
              内部管理用 · noindex
            </span>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="admin-hover-ink"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--ink-500)',
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              サイトを表示
              <AdminIcon name="external" size={14} strokeWidth={1.8} />
            </a>
          </div>
        </header>

        {/* content */}
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-app)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '26px 28px 64px' }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
