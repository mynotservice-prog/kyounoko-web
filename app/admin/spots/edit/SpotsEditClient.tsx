'use client';

import React from 'react';
import { SPOT_CATEGORY_LABEL, type Spot, type AgeTag } from '@/lib/spots';
import {
  buildEnjoyByAgeBlocks,
  buildSpotFaqs,
  buildCrowdAvoidanceText,
  buildAccessTipsText,
} from '@/lib/spot-narratives';
import { spotToV2 } from '@/lib/v2-adapters';
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

// カテゴリ（lib/spots.ts の SpotCategory と一致）。現在値をプリセットし、変えたら上書き保存。
const CATEGORY_OPTIONS = [
  { v: 'zoo', label: '動物園' },
  { v: 'aquarium', label: '水族館' },
  { v: 'park', label: '公園' },
  { v: 'museum', label: '博物館・科学館' },
  { v: 'amusement', label: '遊園地' },
  { v: 'indoor', label: '屋内施設' },
  { v: 'farm', label: '牧場' },
  { v: 'seasonal', label: '季節体験' },
  { v: 'restaurant', label: '子連れOKレストラン' },
];
const PLACE_OPTIONS = [
  { v: 'indoor', label: '屋内' },
  { v: 'outdoor', label: '屋外' },
  { v: 'mixed', label: '一部屋外' },
];
const AGE_TAGS: AgeTag[] = ['0-1', '2-3', '4-6'];

/** 近隣スポット選択用の軽量インデックス。 */
type SpotIndexItem = { slug: string; name: string; area: string };

/** ages 配列を比較用に正規化（順序非依存）。 */
function agesKey(a: readonly string[] | undefined): string {
  return [...(a ?? [])].sort().join(',');
}

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

  // 近隣スポット選択用の全スポット軽量インデックス（slug→名前/エリア）。
  const spotIndex = React.useMemo<SpotIndexItem[]>(
    () => entries.map((e) => ({ slug: e.slug, name: e.spot.name, area: e.spot.ward || e.spot.city || e.area })),
    [entries],
  );

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
          placeholder="施設名 / slug / 市区町村 / エリア / カテゴリ で絞り込み"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            width: '100%',
            height: 38,
            padding: '0 12px',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--r-md)',
            fontSize: 13,
            color: 'var(--ink-700)',
            background: 'var(--bg-surface)',
          }}
        />
        <div style={{ fontSize: 11, color: 'var(--ink-400)', marginTop: 6 }}>
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
            spotIndex={spotIndex}
            isOpen={openSlug === e.slug}
            onToggle={() => setOpenSlug(openSlug === e.slug ? null : e.slug)}
          />
        ))}
      </div>
      {filtered.length > 300 && (
        <div style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 12 }}>
          最初の300件を表示中。検索で絞り込んでください。
        </div>
      )}
    </>
  );
}

function SpotRow({
  entry,
  override,
  spotIndex,
  isOpen,
  onToggle,
}: {
  entry: Entry;
  override: SpotOverride;
  spotIndex: SpotIndexItem[];
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
    crowdTips: override.crowdTips ?? '',
    accessTips: override.accessTips ?? '',
    nearby: override.nearby ?? '',
    img0: override.images?.[0] ?? override.image ?? '',
    img1: override.images?.[1] ?? '',
    img2: override.images?.[2] ?? '',
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
    // カテゴリ/屋内外は「現在の実効値」をプリセット（select に現状が出る）。
    category: override.category ?? spot.category,
    place: override.place ?? spot.place,
  }));
  // 対象年齢（複数選択）/ FAQ / 近隣スポットは配列なので別state。現在値をプリセット。
  const [ages, setAges] = React.useState<AgeTag[]>(() => override.ages ?? spot.ages ?? []);
  const [faq, setFaq] = React.useState<Array<{ q: string; a: string }>>(
    () => (override.faq ?? spot.faq ?? []).map((f) => ({ q: f.q, a: f.a })),
  );
  const [nearbySlugs, setNearbySlugs] = React.useState<string[]>(
    () => override.nearbySlugs ?? spot.nearbySlugs ?? [],
  );
  const [nearbyQuery, setNearbyQuery] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const [uploading, setUploading] = React.useState(false);

  const hasOverride = Object.keys(override).length > 0;
  const set = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const toggleAge = (tag: AgeTag) =>
    setAges((cur) => (cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag]));
  const nameForSlug = (s: string) => spotIndex.find((x) => x.slug === s)?.name ?? s;
  const nearbyMatches = nearbyQuery.trim()
    ? spotIndex
        .filter(
          (x) =>
            x.slug !== slug &&
            !nearbySlugs.includes(x.slug) &&
            (x.name.toLowerCase().includes(nearbyQuery.toLowerCase()) ||
              x.area.toLowerCase().includes(nearbyQuery.toLowerCase()) ||
              x.slug.toLowerCase().includes(nearbyQuery.toLowerCase())),
        )
        .slice(0, 8)
    : [];

  // 画像アップロード: ファイルを /api/admin/spot-image へ送り、返ってきたパスを指定スロットにセット。
  // この後 [保存] を押すと override に書き込まれて本番反映される。
  const uploadImage = async (file: File, slot: 'img0' | 'img1' | 'img2') => {
    setUploading(true);
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('slug', slug);
      fd.append('file', file);
      const res = await fetch('/api/admin/spot-image', { method: 'POST', body: fd });
      const data = (await res.json()) as { ok?: boolean; path?: string; error?: string };
      if (!res.ok || !data.ok || !data.path) {
        setMsg(`❌ アップロード失敗: ${data.error || 'failed'}`);
      } else {
        set(slot, data.path);
        setMsg('✅ 画像アップロード完了。[保存] を押すと反映されます');
      }
    } catch (e) {
      setMsg('❌ ' + (e instanceof Error ? e.message : 'error'));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setMsg('');
    const faqClean = faq
      .filter((f) => f.q.trim() && f.a.trim())
      .map((f) => ({ q: f.q.trim(), a: f.a.trim() }));
    const patch: Record<string, unknown> = {
      name: form.name,
      city: form.city,
      ward: form.ward,
      note: form.note,
      budget: form.budget,
      reservation: form.reservation,
      hiddenTip: form.hiddenTip,
      crowdTips: form.crowdTips,
      accessTips: form.accessTips,
      nearby: form.nearby,
      image: '', // 旧フィールドは images に統合（クリア指示）
      // スロット位置を保持する（[0]=hero / [1]=中段 / [2]=下段）。
      // filter(Boolean) で詰めると「中段だけ入れた画像が hero に化ける」ため、
      // 中間の空欄は '' のまま残し、末尾の空欄だけ落とす。
      images: (() => {
        const arr = [form.img0, form.img1, form.img2];
        while (arr.length > 0 && !arr[arr.length - 1]) arr.pop();
        return arr;
      })(),
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
      // カテゴリ/屋内外/対象年齢は、元の値と同じなら '' / [] を送って上書きを作らない（最小化）。
      category: form.category === spot.category ? '' : form.category,
      place: form.place === spot.place ? '' : form.place,
      ages: agesKey(ages) === agesKey(spot.ages) ? [] : ages,
      // FAQ: 空行を除いて送る。空配列なら override 削除。
      faq: faqClean,
      // FAQに1件でも入っていれば「完成版」として扱い、本番では自動FAQを足さない
      // （= 編集欄で消したFAQが自動生成で復活しない）。空なら自動FAQに戻す。
      faqComplete: faqClean.length > 0,
      // 近隣スポット手動指定。空配列なら削除（自動算出に戻る）。
      nearbySlugs,
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
    display: 'flex', flexDirection: 'column', gap: 7,
  };
  const captionStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: 'var(--ink-500)',
  };
  const inputStyle: React.CSSProperties = {
    height: 38, padding: '0 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)',
    fontSize: 13, color: 'var(--ink-700)', background: 'var(--bg-surface)',
  };
  const textareaStyle: React.CSSProperties = {
    padding: '11px 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)',
    fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-700)', background: 'var(--bg-surface)', resize: 'vertical',
  };

  const field = (key: keyof typeof form, label: string, original: unknown, full = false) => {
    const hasOriginal = original != null && original !== '';
    const placeholder = hasOriginal ? `現在: ${String(original)}` : '（未設定）';
    // 現在の値を入力欄に読み込んで編集できるようにする（空欄＆現在値ありのときだけ表示）。
    const loadBtn = hasOriginal && !form[key] && (
      <button
        type="button"
        onClick={() => set(key, String(original))}
        style={{ background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-sm)', fontSize: 10, padding: '1px 7px', color: 'var(--accent)', cursor: 'pointer' }}
      >
        現在の文を読み込んで編集
      </button>
    );
    return (
      <label style={{ ...labelStyle, gridColumn: full ? '1 / -1' : 'auto' }}>
        <span style={{ ...captionStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
          {label}
          {loadBtn}
        </span>
        {full ? (
          <textarea
            value={form[key]}
            onChange={(e) => set(key, e.target.value)}
            placeholder={placeholder}
            rows={2}
            style={textareaStyle}
          />
        ) : (
          <input
            type="text"
            value={form[key]}
            onChange={(e) => set(key, e.target.value)}
            placeholder={placeholder}
            style={inputStyle}
          />
        )}
      </label>
    );
  };

  // 画像プレビュー: hero は img0、無ければ現在ページの自動画像。中段/下段は img1/img2。
  const autoImg = spotToV2(spot).img;
  const heroSrc = form.img0 || autoImg;
  const usingCustomImage = !!(form.img0 || form.img1 || form.img2);
  const imageSlots: Array<{ key: 'img0' | 'img1' | 'img2'; label: string }> = [
    { key: 'img0', label: 'メイン（hero）' },
    { key: 'img1', label: '中段' },
    { key: 'img2', label: '下段' },
  ];

  // 年齢別の楽しみ方の「現在ページに表示中の文」を年齢ごとに取得（プレースホルダ用）。
  // 未入力ならカテゴリ共通の自動文がそのまま placeholder に出る。
  const ageDefaults: Partial<Record<AgeTag, string>> = Object.fromEntries(
    buildEnjoyByAgeBlocks(spot).map((b) => [b.age, b.text]),
  );

  // 「混雑を避けるコツ」「アクセスのコツ」の現在表示中の自動文（構造化データから生成）。
  // placeholder と「現在の文を読み込んで編集」に使う。
  const crowdTipsDefault = buildCrowdAvoidanceText(spot) ?? '';
  const accessTipsDefault = buildAccessTipsText(spot) ?? '';

  // 本番ページに現在表示されているFAQ（手動faq + 自動生成、同じ質問は手動優先）。
  // 「現在のFAQを読み込んで編集」で、この内容を編集欄に展開できる。
  const currentFaqs = (() => {
    const manual = spot.faq ?? [];
    const manualQ = new Set(manual.map((f) => f.q));
    const auto = buildSpotFaqs(spot).filter((f) => !manualQ.has(f.q));
    return [...manual, ...auto].map((f) => ({ q: f.q, a: f.a }));
  })();

  const ageField = (key: keyof typeof form, age: AgeTag) => (
    <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>
      <span style={{ ...captionStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
        {AGE_LABEL[age]}
        {ageDefaults[age] && !form[key] && (
          <button
            type="button"
            onClick={() => set(key, ageDefaults[age] || '')}
            style={{ background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-sm)', fontSize: 10, padding: '1px 7px', color: 'var(--accent)', cursor: 'pointer' }}
          >
            現在の文を読み込んで編集
          </button>
        )}
      </span>
      <textarea
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={ageDefaults[age] ? `現在: ${ageDefaults[age]}` : '（カテゴリ共通の自動文を表示中）'}
        rows={3}
        style={textareaStyle}
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
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderLeft: hasOverride ? '3px solid var(--accent)' : '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
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
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 2 }}>
            {spot.name}
            {hasOverride && (
              <span style={{
                marginLeft: 8, fontSize: 10, padding: '2px 8px', borderRadius: 999,
                background: 'var(--accent-tint)', color: 'var(--accent)', fontWeight: 700,
              }}>編集済</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
            {slug} · {area} · {SPOT_CATEGORY_LABEL[spot.category]}
            {spot.city ? ` · ${spot.city}` : ''}
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-400)', flex: 'none' }}>
          {isOpen ? '▲' : '▼'}
        </div>
      </button>

      {isOpen && (
        <div style={{ padding: '14px 16px 18px', borderTop: '1px solid var(--border-divider)' }}>
          {/* ライブプレビュー — 本番ページの見た目で確認しながら編集できる */}
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', margin: '0 0 8px' }}>
            ライブプレビュー（本番ページの見え方）
          </div>
          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 18 }}>
            {/* hero */}
            <div style={{ position: 'relative', aspectRatio: '16 / 9', background: 'var(--bg-subtle)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroSrc} alt="hero" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0) 55%)' }} />
              <div style={{ position: 'absolute', left: 14, bottom: 12, right: 14, color: '#fff' }}>
                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.9 }}>{SPOT_CATEGORY_LABEL[spot.category]}</div>
                <div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.25, textShadow: '0 1px 4px rgba(0,0,0,.4)' }}>
                  {form.name || spot.name}
                </div>
              </div>
            </div>
            {/* リード文 */}
            <div style={{ padding: '12px 16px 4px' }}>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-700)', lineHeight: 1.7 }}>
                {form.note || spot.note || '（一言メモ未設定）'}
              </p>
            </div>
            {/* 分散表示される追加画像 */}
            {(form.img1 || form.img2) && (
              <div style={{ display: 'flex', gap: 8, padding: '10px 16px 14px' }}>
                {[form.img1, form.img2].filter(Boolean).map((src, i) => (
                  <div key={i} style={{ flex: 1, aspectRatio: '16 / 9', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`追加画像${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 画像（最大3枚）— アップロード or URL/パス指定。空欄で自動画像に戻る。 */}
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', margin: '0 0 8px' }}>
            画像（最大3枚 / hero・中段・下段に分散）
            <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--ink-400)', marginLeft: 8 }}>
              {usingCustomImage ? '差し替え画像を表示中' : '自動画像（カテゴリ別）を表示中'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 16 }}>
            {imageSlots.map(({ key, label }) => {
              const val = form[key];
              const slotPreview = val || (key === 'img0' ? autoImg : '');
              return (
                <div key={key} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 10, background: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', marginBottom: 6 }}>
                    {label}{key === 'img0' ? '' : '（任意）'}
                  </div>
                  <div style={{ aspectRatio: '16 / 9', borderRadius: 'var(--r-sm)', overflow: 'hidden', border: '1px dashed var(--border-strong)', background: 'var(--bg-subtle)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {slotPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={slotPreview} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 10, color: 'var(--ink-400)' }}>未設定</span>
                    )}
                  </div>
                  <label
                    style={{
                      display: 'block', textAlign: 'center', padding: '7px 8px', background: 'var(--bg-surface)',
                      border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', fontSize: 11, fontWeight: 600, color: 'var(--ink-600)',
                      cursor: uploading ? 'wait' : 'pointer', marginBottom: 6, opacity: uploading ? 0.6 : 1,
                    }}
                  >
                    アップロード
                    <input
                      type="file"
                      accept="image/webp,image/jpeg,image/png,image/gif"
                      disabled={uploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadImage(f, key);
                        e.target.value = '';
                      }}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder="/img/... または https://…"
                    style={{ ...inputStyle, fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  />
                  {val && (
                    <button
                      type="button"
                      onClick={() => set(key, '')}
                      style={{ marginTop: 6, background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: 10, cursor: 'pointer', padding: 0 }}
                    >
                      クリア
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 10, color: 'var(--ink-400)', lineHeight: 1.6, marginBottom: 16 }}>
            アップロード後に「保存」を押すと反映されます（本番は数分）。webp/jpg/png/gif・5MBまで。2枚目以降は本番ページの中段・下段に分散表示されます。
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', margin: '0 0 8px' }}>
            基本情報・カード
            <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--ink-400)', marginLeft: 8 }}>
              カテゴリ・対象年齢・屋内外は本番ページ上部のカードに反映されます。
            </span>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10,
          }}>
            {field('name', '施設名', spot.name)}
            {field('city', '市区町村', spot.city)}
            {field('ward', '区（東京23区等）', spot.ward)}
            {selectField('category', 'カテゴリ（牧場/遊園地…）', CATEGORY_OPTIONS)}
            {selectField('place', '屋内 / 屋外', PLACE_OPTIONS)}
            {selectField('budget', '料金目安', BUDGET_OPTIONS)}
            {selectField('reservation', '予約', RESERVATION_OPTIONS)}
            {/* 対象年齢（複数選択） */}
            <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>
              <span style={captionStyle}>対象年齢（複数選択可）</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                {AGE_TAGS.map((tag) => {
                  const on = ages.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleAge(tag)}
                      style={{
                        padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        border: on ? '1px solid var(--accent-border)' : '1px solid var(--border-strong)',
                        background: on ? 'var(--accent-tint)' : 'var(--bg-surface)',
                        color: on ? 'var(--accent)' : 'var(--ink-500)',
                      }}
                    >
                      {on ? '✓ ' : ''}{AGE_LABEL[tag]}
                    </button>
                  );
                })}
              </div>
            </label>
            {field('note', '一言メモ', spot.note, true)}
            {field('hiddenTip', '穴場ポイント', spot.hiddenTip, true)}
            {field('nearby', '近隣セット提案（テキスト）', spot.nearby, true)}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', margin: '16px 0 8px' }}>
            混雑を避けるコツ・アクセスのコツ
            <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--ink-400)', marginLeft: 8 }}>
              空欄なら混雑度・予約・最寄り駅などから自動生成した文を表示。「現在の文を読み込んで編集」で本文を入れて手直しできます。
            </span>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {field('crowdTips', '混雑を避けるコツ', crowdTipsDefault, true)}
            {field('accessTips', 'アクセスのコツ', accessTipsDefault, true)}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', margin: '16px 0 8px' }}>
            年齢別の楽しみ方
            <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--ink-400)', marginLeft: 8 }}>
              空欄ならカテゴリ共通の自動文を表示。「現在の文を読み込んで編集」で本文を入れて手直しできます。
            </span>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {ages.includes('0-1') && ageField('age_0_1', '0-1')}
            {ages.includes('2-3') && ageField('age_2_3', '2-3')}
            {ages.includes('4-6') && ageField('age_4_6', '4-6')}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', margin: '16px 0 8px' }}>
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

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', margin: '16px 0 8px' }}>
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

          {/* よくある質問（FAQ）編集 */}
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', margin: '16px 0 8px' }}>
            よくある質問（FAQ）
            <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--ink-400)', marginLeft: 8 }}>
              ここで追加したQ&Aは本番ページのFAQ先頭に表示されます（自動生成FAQより優先）。
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* 編集欄が空のとき、本番に出ている現在のFAQ（自動生成含む）を読み込んで編集できる */}
            {faq.length === 0 && currentFaqs.length > 0 && (
              <div style={{ border: '1px dashed var(--border-strong)', borderRadius: 'var(--r-md)', padding: 12, background: 'var(--bg-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--ink-500)', fontWeight: 600 }}>
                    現在このスポットに表示中のFAQ（{currentFaqs.length}件・自動生成含む）
                  </span>
                  <button
                    type="button"
                    onClick={() => setFaq(currentFaqs.map((f) => ({ q: f.q, a: f.a })))}
                    style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', fontSize: 11, fontWeight: 600, padding: '7px 12px', cursor: 'pointer' }}
                  >
                    現在のFAQを読み込んで編集
                  </button>
                </div>
                <ol style={{ margin: 0, paddingLeft: 18, fontSize: 11.5, color: 'var(--ink-400)', lineHeight: 1.7 }}>
                  {currentFaqs.map((f, i) => (
                    <li key={i}><strong style={{ color: 'var(--ink-600)' }}>{f.q}</strong></li>
                  ))}
                </ol>
              </div>
            )}
            {faq.map((item, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 10, background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>Q{i + 1}</span>
                  <input
                    type="text"
                    value={item.q}
                    onChange={(e) => setFaq((cur) => cur.map((f, j) => (j === i ? { ...f, q: e.target.value } : f)))}
                    placeholder="質問（例: ペットは連れて入れますか？）"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setFaq((cur) => cur.filter((_, j) => j !== i))}
                    style={{ border: '1px solid var(--border-strong)', background: 'var(--bg-surface)', color: 'var(--neg)', borderRadius: 'var(--r-sm)', padding: '5px 11px', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', flex: 'none' }}
                  >
                    削除
                  </button>
                </div>
                <textarea
                  value={item.a}
                  onChange={(e) => setFaq((cur) => cur.map((f, j) => (j === i ? { ...f, a: e.target.value } : f)))}
                  placeholder="回答"
                  rows={2}
                  style={textareaStyle}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFaq((cur) => [...cur, { q: '', a: '' }])}
              style={{ alignSelf: 'flex-start', background: 'var(--bg-surface)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 600, padding: '8px 14px', color: 'var(--ink-600)', cursor: 'pointer' }}
            >
              ＋ 質問を追加
            </button>
          </div>

          {/* 近くのスポット（手動選択） */}
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', margin: '16px 0 8px' }}>
            近くのスポット（手動選択）
            <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--ink-400)', marginLeft: 8 }}>
              指定すると本番ページ「近くのスポット」に、この順番で優先表示します。未指定なら自動（同駅/同区）。
            </span>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 10, background: 'var(--bg-surface)' }}>
            {nearbySlugs.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {nearbySlugs.map((ns, i) => (
                  <span key={ns} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-tint)', color: 'var(--accent)', borderRadius: 999, padding: '4px 6px 4px 10px', fontSize: 12, fontWeight: 600 }}>
                    <span style={{ opacity: 0.7, fontSize: 10 }}>{i + 1}.</span>
                    {nameForSlug(ns)}
                    <button
                      type="button"
                      onClick={() => setNearbySlugs((cur) => cur.filter((s) => s !== ns))}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: '0 2px' }}
                      aria-label="削除"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--ink-400)', marginBottom: 8 }}>
                未選択（自動で同駅・同区のスポットを表示中）
              </div>
            )}
            <input
              type="search"
              value={nearbyQuery}
              onChange={(e) => setNearbyQuery(e.target.value)}
              placeholder="追加するスポットを施設名/エリアで検索"
              style={{ ...inputStyle, width: '100%' }}
              disabled={nearbySlugs.length >= 12}
            />
            {nearbyMatches.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6, maxHeight: 200, overflowY: 'auto' }}>
                {nearbyMatches.map((m) => (
                  <button
                    key={m.slug}
                    type="button"
                    onClick={() => { setNearbySlugs((cur) => [...cur, m.slug]); setNearbyQuery(''); }}
                    style={{ textAlign: 'left', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '7px 10px', fontSize: 12, color: 'var(--ink-700)', cursor: 'pointer' }}
                  >
                    <span style={{ fontWeight: 600 }}>{m.name}</span>
                    <span style={{ color: 'var(--ink-400)', marginLeft: 6, fontSize: 11 }}>{m.area}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{
            display: 'flex', gap: 10, alignItems: 'center', marginTop: 16, flexWrap: 'wrap',
          }}>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              style={{
                border: 'none', background: 'var(--accent)', color: '#fff',
                borderRadius: 'var(--r-md)', padding: '9px 16px', fontSize: 13, fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? '保存中…' : '保存'}
            </button>
            <a
              href={`/spot/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              // CDN(Cloudflare)キャッシュをバイパスして編集直後の最新ページを確認できるよう、
              // クリック時にキャッシュバスター付きURLで開く。
              onClick={(e) => {
                e.preventDefault();
                window.open(`/spot/${slug}?cb=${Date.now()}`, '_blank', 'noopener,noreferrer');
              }}
              style={{ fontSize: 12, color: 'var(--accent)' }}
            >
              本番ページを確認 ↗
            </a>
            {msg && <span style={{ fontSize: 11, color: 'var(--ink-600)' }}>{msg}</span>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-400)', marginTop: 8, lineHeight: 1.6 }}>
            空欄にして保存すると、その項目は元の値（lib/spots.ts の定義）に戻ります。
          </div>
        </div>
      )}
    </div>
  );
}
