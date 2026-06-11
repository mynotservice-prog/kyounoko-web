'use client';

import { useCallback, useEffect, useState } from 'react';
import { isValidArea, type AreaSlug } from '@/lib/area';

/**
 * ユーザー設定を localStorage に永続化するフック。
 * 2回目以降の訪問で「子どもの年齢」「エリア」がプリセットされる。
 *
 * 保存キー: "kyounoko.settings.v1"
 * 形式: { area: AreaSlug; age?: '0-1'|'2-3'|'4-6'; onboarded?: boolean }
 */

const STORAGE_KEY = 'kyounoko.settings.v1';

export type ChildAge = '0-1' | '2-3' | '4-6';

/** 子どもの性格傾向。プラン選定の微調整用。 */
export type ChildTemperament = 'active' | 'calm' | 'mixed';

/** 子どもの興味分類（複数選択可）。 */
export type ChildInterest = 'sports' | 'study' | 'creative' | 'nature' | 'music' | 'food';

export type UserSettings = {
  area: AreaSlug;
  age?: ChildAge;
  onboarded?: boolean;
  /** 子どもの性格傾向（活発 / おとなしい / どちらとも） */
  temperament?: ChildTemperament;
  /** 子どもの興味（最大3個） */
  interests?: ChildInterest[];
  /** 簡易アレルギーメモ（食事プランでの注意用） */
  allergyNote?: string;
  /**
   * 子どもの生年月 'YYYY-MM'。
   * 設定すると年齢帯（age）と違い月齢が自動で進むため、
   * トップの「今日のうちの子」パーソナライズはこちらを優先する。
   */
  childBirthMonth?: string;
};

const DEFAULT_SETTINGS: UserSettings = {
  area: 'tokyo', // 初回は東京デフォルト。ユーザーがエリア選択したら上書き。
};

function readSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const area = isValidArea(parsed?.area) ? parsed.area : DEFAULT_SETTINGS.area;
    const age = ['0-1', '2-3', '4-6'].includes(parsed?.age) ? (parsed.age as ChildAge) : undefined;
    const onboarded = typeof parsed?.onboarded === 'boolean' ? parsed.onboarded : undefined;
    const temperament = ['active', 'calm', 'mixed'].includes(parsed?.temperament)
      ? (parsed.temperament as ChildTemperament)
      : undefined;
    const interests = Array.isArray(parsed?.interests)
      ? (parsed.interests as string[]).filter((x): x is ChildInterest =>
          ['sports', 'study', 'creative', 'nature', 'music', 'food'].includes(x),
        )
      : undefined;
    const allergyNote = typeof parsed?.allergyNote === 'string' ? parsed.allergyNote : undefined;
    const childBirthMonth =
      typeof parsed?.childBirthMonth === 'string' && /^\d{4}-\d{2}$/.test(parsed.childBirthMonth)
        ? parsed.childBirthMonth
        : undefined;
    return { area, age, onboarded, temperament, interests, allergyNote, childBirthMonth };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function writeSettings(s: UserSettings) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // quota 等は無視
  }
}

/**
 * useUserSettings
 *  - 初期値: サーバーサイドでは DEFAULT_SETTINGS。マウント直後に localStorage から復元。
 *  - 戻り値: [settings, update] のタプル。
 */
export function useUserSettings(): [UserSettings, (patch: Partial<UserSettings>) => void] {
  // hydration mismatch を避けるため、初期値はサーバー側と同じデフォルトで開始。
  // マウント後に localStorage から上書きする。
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(readSettings());
  }, []);

  const update = useCallback((patch: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      writeSettings(next);
      return next;
    });
  }, []);

  return [settings, update];
}
