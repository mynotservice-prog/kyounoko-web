'use client';

import React from 'react';
import { SPOT_CATEGORY_LABEL, type Spot, type AgeTag } from '@/lib/spots';
import { buildEnjoyByAgeBlocks } from '@/lib/spot-narratives';
import type { SpotOverride, SpotOverridesMap } from '@/lib/spot-overrides';

const AGE_LABEL: Record<AgeTag, string> = {
  '0-1': '0〜1歳',
  '2-3': '2〜3歳',
  '4-6': '4〜6歳',
};

type Entry = { slug: string; area: string; spot: Spot };

const BUDGET_OPTIONS = [
  { v: '', label: '（変更しない）' },
  { v: 'free', label: '無料' },
  { v: 'low', label: '〜1,000円' },
  { v: 'mid', label: '1,000〜3,000円' },
  { v: 'high', label: '3,000円〜' },
];
const RESERVATION_OPTIONS = [
  { v: '', label: '（変更しない）' },
  { v: 'none', label: '予約不要' },
  { v: 'recommended', label: '予約推奨' },
  { v: 'required', label: '要予約' },
];
const YESNO_OPTIONS = [
  { v: '', label: '（変更しない）' },
  { v: 'yes', label: 'あり' },
  { v: 'no', label: 'なし' },
];

const FACILITY_LABELS: Record<string, string> = {
  bathroom: '多目的トイレ',
  diaperChange: 'おむつ替え',
  nursingRoom: '授乳室',
  kidsSpace: 'キッズスペース',
  strollerRental: 'ベビーカー貸出',
};

export function SpotsEditClient({
  entries,
  overrides,
}: {
  entries: Entry[];
  overrides: SpotOverridesMap;
}) {
  const [q, setQ] = React.useState('');
  const [openSlug, setOpenSlug] = React.useState<string | null>(null);

  // サーバーから渡る overrides はビルド時のスナップショットで、保存直後（再デプロイ前）
  // はまだ反映されていない。マウント時に API（本番は GitHub を直読み）から最新を取得し、
  // 「保存したのに編集欄が空に戻る」誤解を防ぐ。
  const [liveOverrides, setLiveOverrides] = React.useState<SpotOverridesMap>(overrides);
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    let alive = true;
    fetch('/api/admin/spot-overrides')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { overrides?: SpotOverridesMap } | null) => {
        if (alive && d?.overrides) {
          setLiveOverrides(d.overrides);
          setLoaded(true);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const filtered = entries.filter((e) => {
    if (!q) return true;
    const nq = q.toLowerCase();
    const s = e.spot;
    return (
      e.slug.toLowerCase().includes(nq) ||
      s.name.toLowerCase().includes(nq) ||
      (s.city ?? '').toLowerCase().includes(nq) ||
      (s.ward ?? '').toLowerCase().includes(nq) ||
      e.area.toLowerCase().includes(nq) ||
      SPOT_CATEGORY_LABEL[s.category].includes(nq)
    );
  });

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <input
          type="search"
          placeholder="🔍 施設名 / slug / 市区町村 / エリア / カテゴリ で絞り込み"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            fontSize: 14,
            fontFamily: 'inherit',
            background: '#fff',
          }}
        />
        <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 6 }}>
          {filtered.length} / {entries.length} 件 · 編集済 {Object.keys(liveOverrides).length} 件
          {loaded ? ' · 最新の保存内容を反映済み' : ' · 最新の保存内容を読込中…'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.slice(0, 300).map((e) => (
          <SpotRow
            // loaded が変わったら remount して、最新 override でフォームを再初期化する
            key={`${e.slug}-${loaded ? 'live' : 'init'}`}
            entry={e}
            override={liveOverrides[e.slug] ?? {}}
            isOpen={openSlug === e.slug}
            onToggle={() => setOpenSlug(openSlug === e.slug ? null : e.slug)}
          />
        ))}
      </div>
      {filtered.length > 300 && (
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 12 }}>
          最初の300件を表示中。検索で絞り込んでください。
        </div>
      )}
    </>
  );
}

function SpotRow({
  entry,
  override,
  isOpen,
  onToggle,
}: {
  entry: Entry;
  override: SpotOverride;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { slug, area, spot } = entry;

  const [form, setForm] = React.useState(() => ({
    name: override.name ?? '',
    city: override.city ?? '',
    ward: override.ward ?? '',
    note: override.note ?? '',
    budget: override.budget ?? '',
    reservation: override.reservation ?? '',
    hiddenTip: override.hiddenTip ?? '',
    nearby: override.nearby ?? '',
    age_0_1: override.ageGuide?.['0-1'] ?? '',
    age_2_3: override.ageGuide?.['2-3'] ?? '',
    age_4_6: override.ageGuide?.['4-6'] ?? '',
    p_adult: override.pricing?.adult ?? '',
    p_elementary: override.pricing?.elementary ?? '',
    p_preschool: override.pricing?.preschool ?? '',
    p_infant: override.pricing?.infant ?? '',
    f_bathroom: override.facilities?.bathroom ?? '',
    f_diaperChange: override.facilities?.diaperChange ?? '',
    f_nursingRoom: override.facilities?.nursingRoom ?? '',
    f_kidsSpace: override.facilities?.kidsSpace ?? '',
    f_strollerRental: override.facilities?.strollerRental ?? '',
    f_note: override.facilities?.note ?? '',
  }));
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState('');

  const hasOverride = Object.keys(override).length > 0;
  const set = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    setMsg('');
    const patch: Record<string, unknown> = {
      name: form.name,
      city: form.city,
      ward: form.ward,
      note: form.note,
      budget: form.budget,
      reservation: form.reservation,
      hiddenTip: form.hiddenTip,
      nearby: form.nearby,
      ageGuide: {
        '0-1': form.age_0_1,
        '2-3': form.age_2_3,
        '4-6': form.age_4_6,
      },
      pricing: {
        adult: form.p_adult,
        elementary: form.p_elementary,
        preschool: form.p_preschool,
        infant: form.p_infant,
      },
      facilities: {
        bathroom: form.f_bathroom,
        diaperChange: form.f_diaperChange,
        nursingRoom: form.f_nursingRoom,
        kidsSpace: form.f_kidsSpace,
        strollerRental: form.f_strollerRental,
        note: form.f_note,
      },
    };
    try {
      const res = await fetch('/api/admin/spot-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, patch }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; mode?: string };
      if (!res.ok || !data.ok) {
        setMsg(`❌ ${data.error || 'failed'}`);
      } else {
        setMsg(
          data.mode === 'github'
            ? '✅ commit 完了。Vercel が自動デプロイ中（数分で本番反映）'
            : '✅ ローカル保存',
        );
      }
    } catch (e) {
      setMsg('❌ ' + (e instanceof Error ? e.message : 'error'));
    } finally {
      setSaving(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: 4,
  };
  const captionStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: 'var(--ink-sub)',
  };
  const inputStyle: React.CSSProperties = {
    padding: '6px 10px', border: '1px solid var(--line)', borderRadius: 6,
    fontSize: 12, fontFamily: 'inherit', background: '#fff',
  };

  const field = (key: keyof typeof form, label: string, original: unknown, full = false) => (
    <label style={{ ...labelStyle, gridColumn: full ? '1 / -1' : 'auto' }}>
      <span style={captionStyle}>{label}</span>
      <input
        type="text"
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={original != null && original !== '' ? `現在: ${String(original)}` : '（未設定）'}
        style={inputStyle}
      />
    </label>
  );

  // 年齢別の楽しみ方の「現在ページに表示中の文」を年齢ごとに取得（プレースホルダ用）。
  // 未入力ならカテゴリ共通の自動文がそのまま placeholder に出る。
  const ageDefaults: Partial<Record<AgeTag, string>> = Object.fromEntries(
    buildEnjoyByAgeBlocks(spot).map((b) => [b.age, b.text]),
  );

  const ageField = (key: keyof typeof form, age: AgeTag) => (
    <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>
      <span style={captionStyle}>{AGE_LABEL[age]}</span>
      <textarea
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={ageDefaults[age] ? `現在: ${ageDefaults[age]}` : '（カテゴリ共通の自動文を表示中）'}
        rows={2}
        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
      />
    </label>
  );

  const selectField = (
    key: keyof typeof form,
    label: string,
    options: { v: string; label: string }[],
  ) => (
    <label style={labelStyle}>
      <span style={captionStyle}>{label}</span>
      <select value={form[key]} onChange={(e) => set(key, e.target.value)} style={inputStyle}>
        {options.map((o) => (
          <option key={o.v} value={o.v}>{o.label}</option>
        ))}
      </select>
    </label>
  );

  return (
    <div
      style={{
        background: 'var(--paper-card)',
        border: '1px solid var(--line)',
        borderLeft: hasOverride ? '3px solid var(--clay-deep)' : '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%', background: 'transparent', border: 'none', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>
            {spot.name}
            {hasOverride && (
              <span style={{
                marginLeft: 8, fontSize: 10, padding: '2px 8px', borderRadius: 999,
                background: 'var(--clay-soft)', color: 'var(--clay-deep)', fontWeight: 700,
              }}>編集済</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'monospace' }}>
            {slug} · {area} · {SPOT_CATEGORY_LABEL[spot.category]}
            {spot.city ? ` · ${spot.city}` : ''}
          </div>
        </div>
        <div style={{ fontSize: 18, color: 'var(--ink-mute)', flex: 'none' }}>
          {isOpen ? '▲' : '▼'}
        </div>
      </button>

      {isOpen && (
        <div style={{ padding: '14px 16px 18px', borderTop: '1px solid var(--line)' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10,
          }}>
            {field('name', '施設名', spot.name)}
            {field('city', '市区町村', spot.city)}
            {field('ward', '区（東京23区等）', spot.ward)}
            {selectField('budget', '料金目安', BUDGET_OPTIONS)}
            {selectField('reservation', '予約', RESERVATION_OPTIONS)}
            {field('note', '一言メモ', spot.note, true)}
            {field('hiddenTip', '穴場ポイント', spot.hiddenTip, true)}
            {field('nearby', '近隣セット提案', spot.nearby, true)}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-sub)', margin: '16px 0 8px' }}>
            年齢別の楽しみ方
            <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--ink-mute)', marginLeft: 8 }}>
              空欄ならカテゴリ共通の自動文を表示。施設に合わせて上書きできます。
            </span>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {spot.ages.includes('0-1') && ageField('age_0_1', '0-1')}
            {spot.ages.includes('2-3') && ageField('age_2_3', '2-3')}
            {spot.ages.includes('4-6') && ageField('age_4_6', '4-6')}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-sub)', margin: '16px 0 8px' }}>
            料金詳細
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10,
          }}>
            {field('p_adult', '大人', spot.pricing?.adult)}
            {field('p_elementary', '小学生', spot.pricing?.elementary)}
            {field('p_preschool', '幼児', spot.pricing?.preschool)}
            {field('p_infant', '乳児', spot.pricing?.infant)}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-sub)', margin: '16px 0 8px' }}>
            子連れ設備
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10,
          }}>
            {selectField('f_bathroom', FACILITY_LABELS.bathroom, YESNO_OPTIONS)}
            {selectField('f_diaperChange', FACILITY_LABELS.diaperChange, YESNO_OPTIONS)}
            {selectField('f_nursingRoom', FACILITY_LABELS.nursingRoom, YESNO_OPTIONS)}
            {selectField('f_kidsSpace', FACILITY_LABELS.kidsSpace, YESNO_OPTIONS)}
            {selectField('f_strollerRental', FACILITY_LABELS.strollerRental, YESNO_OPTIONS)}
            {field('f_note', '設備メモ', spot.facilities?.note, true)}
          </div>

          <div style={{
            display: 'flex', gap: 10, alignItems: 'center', marginTop: 16, flexWrap: 'wrap',
          }}>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              style={{
                padding: '8px 18px', background: 'var(--ink)', color: '#fff', border: 'none',
                borderRadius: 6, fontSize: 13, fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? '保存中…' : '保存'}
            </button>
            <a
              href={`/spot/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: 'var(--clay-deep)' }}
            >
              本番ページを確認 ↗
            </a>
            {msg && <span style={{ fontSize: 11, color: 'var(--ink-sub)' }}>{msg}</span>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 8, lineHeight: 1.6 }}>
            空欄にして保存すると、その項目は元の値（lib/spots.ts の定義）に戻ります。
          </div>
        </div>
      )}
    </div>
  );
}
