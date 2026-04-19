'use client';

import { useState, useEffect } from 'react';
import { AREAS, type AreaSlug } from '@/lib/area';
import { useUserSettings, type ChildAge, type ChildTemperament, type ChildInterest } from '@/hooks/useUserSettings';

const AGE_OPTIONS: { value: ChildAge; label: string }[] = [
  { value: '0-1', label: '0〜1歳' },
  { value: '2-3', label: '2〜3歳' },
  { value: '4-6', label: '4〜6歳' },
];

const TEMPERAMENT_OPTIONS: { value: ChildTemperament; label: string; desc: string }[] = [
  { value: 'active', label: '活発', desc: '体を動かすのが好き' },
  { value: 'calm', label: 'おとなしい', desc: 'ゆっくり集中できる' },
  { value: 'mixed', label: 'どちらとも', desc: '気分で変わる' },
];

const INTEREST_OPTIONS: { value: ChildInterest; label: string }[] = [
  { value: 'sports', label: '体を動かす' },
  { value: 'study', label: '学び' },
  { value: 'creative', label: '工作・お絵描き' },
  { value: 'nature', label: '自然・動物' },
  { value: 'music', label: '音楽・ダンス' },
  { value: 'food', label: '食・料理' },
];

export function SettingsClient() {
  const [settings, update] = useUserSettings();
  const [saved, setSaved] = useState(false);

  // 各フィールドのローカル状態
  const [area, setArea] = useState<AreaSlug>(settings.area);
  const [age, setAge] = useState<ChildAge | ''>(settings.age ?? '');
  const [temperament, setTemperament] = useState<ChildTemperament | ''>(settings.temperament ?? '');
  const [interests, setInterests] = useState<ChildInterest[]>(settings.interests ?? []);
  const [allergyNote, setAllergyNote] = useState<string>(settings.allergyNote ?? '');

  // 保存済みから reload
  useEffect(() => {
    setArea(settings.area);
    setAge(settings.age ?? '');
    setTemperament(settings.temperament ?? '');
    setInterests(settings.interests ?? []);
    setAllergyNote(settings.allergyNote ?? '');
  }, [settings]);

  function toggleInterest(v: ChildInterest) {
    setInterests((prev) => {
      if (prev.includes(v)) return prev.filter((x) => x !== v);
      if (prev.length >= 3) return prev; // 最大3個
      return [...prev, v];
    });
  }

  function save() {
    update({
      area,
      age: (age || undefined) as ChildAge | undefined,
      temperament: (temperament || undefined) as ChildTemperament | undefined,
      interests,
      allergyNote: allergyNote.trim() || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // エリア: 地方ブロックごとにoptgroup
  const areaGroups: Record<string, { slug: string; name: string }[]> = {
    'すべて': [{ slug: 'all', name: 'すべて（エリア非依存）' }],
    '北海道・東北': [],
    '関東': [],
    '中部': [],
    '関西': [],
    '中国・四国': [],
    '九州・沖縄': [],
  };
  const blockMap: Record<string, string> = {
    'hokkaido-tohoku': '北海道・東北',
    'kanto': '関東',
    'chubu': '中部',
    'kansai': '関西',
    'chugoku-shikoku': '中国・四国',
    'kyushu-okinawa': '九州・沖縄',
  };
  for (const a of AREAS) {
    if (a.slug === 'all' || !a.block) continue;
    const g = blockMap[a.block];
    if (g) areaGroups[g].push({ slug: a.slug, name: a.name });
  }

  return (
    <div className="settings-form" style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* エリア */}
      <div className="settings-field">
        <label className="settings-label">エリア</label>
        <p className="settings-help">お住まいの都道府県。おでかけ系のプランをここに合わせて絞ります。</p>
        <select
          value={area}
          onChange={(e) => setArea(e.target.value as AreaSlug)}
          className="settings-select"
        >
          <option value="all">すべて（エリア非依存）</option>
          {Object.entries(areaGroups).map(([group, items]) => {
            if (items.length === 0 || group === 'すべて') return null;
            return (
              <optgroup key={group} label={group}>
                {items.map((o) => (
                  <option key={o.slug} value={o.slug}>{o.name}</option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>

      {/* 年齢 */}
      <div className="settings-field">
        <label className="settings-label">お子さんの年齢</label>
        <p className="settings-help">当てはまる範囲を1つ選んでください。</p>
        <div className="settings-chip-group">
          <button type="button" className={`chip ${!age ? 'active' : ''}`} onClick={() => setAge('')}>未設定</button>
          {AGE_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`chip ${age === o.value ? 'active' : ''}`}
              onClick={() => setAge(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* 性格傾向 */}
      <div className="settings-field">
        <label className="settings-label">性格の傾向</label>
        <p className="settings-help">プランのテンポ・内容を微調整します。</p>
        <div className="settings-chip-group">
          <button type="button" className={`chip ${!temperament ? 'active' : ''}`} onClick={() => setTemperament('')}>未設定</button>
          {TEMPERAMENT_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`chip ${temperament === o.value ? 'active' : ''}`}
              onClick={() => setTemperament(o.value)}
              title={o.desc}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* 興味 */}
      <div className="settings-field">
        <label className="settings-label">興味がある分野（最大3つ）</label>
        <p className="settings-help">選ぶと、関連するプランが上位に表示されやすくなります。</p>
        <div className="settings-chip-group">
          {INTEREST_OPTIONS.map((o) => {
            const selected = interests.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                className={`chip ${selected ? 'active' : ''}`}
                onClick={() => toggleInterest(o.value)}
                disabled={!selected && interests.length >= 3}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* アレルギー */}
      <div className="settings-field">
        <label className="settings-label">アレルギー・食事制限メモ（任意）</label>
        <p className="settings-help">食事系のプラン選定で注意喚起します（本文には入りません）。</p>
        <textarea
          value={allergyNote}
          onChange={(e) => setAllergyNote(e.target.value)}
          placeholder="例: 卵アレルギー、乳製品不可 など"
          rows={2}
          className="settings-textarea"
          maxLength={200}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          type="button"
          onClick={save}
          className="btn-primary"
          style={{ padding: '12px 28px' }}
        >
          設定を保存
        </button>
        {saved && (
          <span style={{ fontSize: 13, color: 'var(--sage-deep)' }}>✓ 保存しました</span>
        )}
      </div>
    </div>
  );
}
