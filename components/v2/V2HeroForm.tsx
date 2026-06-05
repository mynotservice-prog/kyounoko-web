'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { V2Icon, type V2IconName } from './V2Icon';
import { AREAS } from '@/lib/area';

/**
 * TOP ヒーロー検索フォーム（インラインドロップダウン版）。
 * - 4セレクト（年齢/天気/ロケーション/エリア）
 * - 枠タップ → その場所（直下）にオプションリストがドロップダウン表示
 * - 外側タップ / ESC で閉じる
 * - 「家で」を選ぶとエリアは disabled
 */

type FieldDef = {
  key: 'age' | 'weather' | 'place' | 'area';
  label: string;
  icon: V2IconName;
  iconBg: string;
  iconColor: string;
  options: { v: string; t: string }[];
};

export function V2HeroForm() {
  const router = useRouter();
  const [age, setAge] = React.useState('2-3');
  const [weather, setWeather] = React.useState('sunny');
  const [place, setPlace] = React.useState<'outside' | 'home'>('outside');
  const [area, setArea] = React.useState('all');
  const [open, setOpen] = React.useState<FieldDef['key'] | null>(null);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('kk_v2_area');
      if (saved) setArea(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const isHome = place === 'home';

  const onSubmit = () => {
    try {
      if (!isHome) localStorage.setItem('kk_v2_area', area);
    } catch {
      /* ignore */
    }
    const params = new URLSearchParams({ age, weather, place });
    if (!isHome && area && area !== 'all') params.set('area', area);
    router.push(`/today?${params.toString()}`);
  };

  const fields: FieldDef[] = [
    {
      key: 'age', label: '年齢', icon: 'baby',
      iconBg: 'var(--v2-c-event-bg)', iconColor: 'var(--v2-c-event)',
      options: [
        { v: '0-1', t: '0〜1歳' },
        { v: '2-3', t: '2〜3歳' },
        { v: '4-6', t: '4〜6歳' },
      ],
    },
    {
      key: 'weather', label: '天気', icon: 'sun',
      iconBg: 'var(--v2-c-sun-bg)', iconColor: 'var(--v2-c-sun)',
      options: [
        { v: 'sunny', t: '晴れ' },
        { v: 'rain', t: '雨' },
        { v: 'heat', t: '猛暑' },
        { v: 'cold', t: '寒い' },
      ],
    },
    {
      key: 'place', label: 'ロケーション', icon: isHome ? 'house' : 'tree',
      iconBg: 'var(--v2-c-indoor-bg)', iconColor: 'var(--v2-c-indoor)',
      options: [
        { v: 'outside', t: '外で' },
        { v: 'home', t: '家で' },
      ],
    },
    {
      key: 'area', label: 'エリア', icon: 'pin',
      iconBg: 'var(--v2-c-lunch-bg)', iconColor: 'var(--v2-c-lunch)',
      options: AREAS.map((p) => ({
        v: p.slug, t: p.slug === 'all' ? '全国' : p.name,
      })),
    },
  ];

  const valueFor = (k: FieldDef['key']) => {
    if (k === 'age') return age;
    if (k === 'weather') return weather;
    if (k === 'place') return place;
    return isHome ? 'all' : area;
  };
  const setValueFor = (k: FieldDef['key'], v: string) => {
    if (k === 'age') setAge(v);
    else if (k === 'weather') setWeather(v);
    else if (k === 'place') setPlace(v as 'outside' | 'home');
    else setArea(v);
  };
  const labelFor = (f: FieldDef) => {
    const cur = valueFor(f.key);
    return f.options.find((o) => o.v === cur)?.t ?? cur;
  };

  // 外側クリック / ESC で閉じる
  const formRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="v2-hero-form" ref={formRef}>
      <div className="v2-hf-fields">
        {fields.map((f) => {
          const disabled = f.key === 'area' && isHome;
          const isSet = !disabled;
          const isOpen = open === f.key;
          // area は項目数多いので multi-column / wide
          const wide = f.key === 'area';
          return (
            <div key={f.key} className="v2-hf-cell">
              <button
                type="button"
                className={
                  'v2-hf-field' +
                  (isSet ? ' set' : '') +
                  (isOpen ? ' open' : '')
                }
                onClick={() => {
                  if (disabled) return;
                  setOpen(isOpen ? null : f.key);
                }}
                style={{ opacity: disabled ? 0.45 : 1 }}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
              >
                <span className="v2-hf-ico" style={{ background: f.iconBg, color: f.iconColor }}>
                  <V2Icon name={f.icon} size={17} />
                </span>
                <span className="v2-hf-txt">
                  <span className="v2-hf-lab">{f.label}</span>
                  <span className="v2-hf-val">{labelFor(f)}</span>
                </span>
                <span
                  style={{
                    display: 'flex',
                    transition: 'transform .15s',
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                  }}
                >
                  <V2Icon name="chevron-down" size={15} color="#c4bbb0" />
                </span>
              </button>
              {isOpen && (
                <div
                  className={'v2-hf-popover' + (wide ? ' wide' : '')}
                  role="listbox"
                >
                  {f.options.map((o) => {
                    const on = o.v === valueFor(f.key);
                    return (
                      <button
                        key={o.v}
                        type="button"
                        role="option"
                        aria-selected={on}
                        className={'v2-hf-opt' + (on ? ' on' : '')}
                        onClick={() => {
                          setValueFor(f.key, o.v);
                          setOpen(null);
                        }}
                      >
                        {o.t}
                        {on && (
                          <V2Icon
                            name="arrow-right"
                            size={14}
                            color="var(--v2-orange)"
                            style={{ marginLeft: 'auto' }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="v2-btn-primary v2-hf-submit"
        onClick={onSubmit}
      >
        <V2Icon name="search" size={19} color="#fff" /> この条件で探す
      </button>
    </div>
  );
}
