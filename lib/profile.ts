'use client';

/**
 * lib/profile.ts
 * ----------------------------------------------------------------------------
 * 子のプロフィール（年齢 / エリア / 性格 / 興味 / アレルギー）を、
 * 既存の useUserSettings（localStorage 'kyounoko.settings.v1'）から
 * 「読み取り専用ビュー」として提供する薄いラッパ。
 *
 * - 既存の保存形式は単一の `age: '0-1'|'2-3'|'4-6'` だが、
 *   仕様レイヤーでは `ages: ChildAge[]` として複数年齢を許容できる形にする。
 *   （将来兄弟複数対応に拡張しやすくするため）
 * - SSR では undefined を返す → `useProfile()` は hydrate 後に値が入る。
 * - 別タブで settings を更新したら 'storage' イベントを拾って自動再読み込み。
 */

import { useEffect, useState } from 'react';
import type { ChildAge, ChildInterest, ChildTemperament, UserSettings } from '@/hooks/useUserSettings';
import type { AreaSlug } from '@/lib/area';

const STORAGE_KEY = 'kyounoko.settings.v1';

const AGE_VALUES: ChildAge[] = ['0-1', '2-3', '4-6'];
const TEMPERAMENT_VALUES: ChildTemperament[] = ['active', 'calm', 'mixed'];
const INTEREST_VALUES: ChildInterest[] = ['sports', 'study', 'creative', 'nature', 'music', 'food'];

/** プロフィール（settings から派生したクライアント向けビュー） */
export type StoredProfile = {
  /** 年齢グループ（配列。仕様では複数指定可。現在は単一 age を1要素配列にラップ） */
  ages: ChildAge[];
  /** 0-1=12, 2-3=36, 4-6=72 を「中央値ベース」で月齢化したヒント用の値 */
  ageMonths?: number;
  /** エリア slug（未設定でも 'tokyo' デフォルトが入る） */
  area?: AreaSlug;
  temperament?: ChildTemperament;
  interests: ChildInterest[];
  allergyNote?: string;
  /** オンボーディング完了済みか */
  onboarded: boolean;
  /** いずれかのパーソナル属性が「明示的に」入っているか（年齢/性格/興味/アレルギー） */
  hasAnyPersonalization: boolean;
};

function readRaw(): UserSettings | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parsed as UserSettings;
  } catch {
    return null;
  }
}

function normalize(settings: UserSettings | null): StoredProfile | null {
  if (!settings) return null;
  const ageRaw = settings.age;
  const ages: ChildAge[] = ageRaw && AGE_VALUES.includes(ageRaw) ? [ageRaw] : [];
  const temperament = settings.temperament && TEMPERAMENT_VALUES.includes(settings.temperament)
    ? settings.temperament
    : undefined;
  const interests = Array.isArray(settings.interests)
    ? settings.interests.filter((x): x is ChildInterest => INTEREST_VALUES.includes(x as ChildInterest))
    : [];
  const allergyNote = typeof settings.allergyNote === 'string' && settings.allergyNote.trim().length > 0
    ? settings.allergyNote
    : undefined;
  const onboarded = settings.onboarded === true;

  const ageMonths = ages.length > 0 ? ageGroupToMonths(ages[0]) : undefined;
  const hasAnyPersonalization =
    ages.length > 0 || !!temperament || interests.length > 0 || !!allergyNote;

  return {
    ages,
    ageMonths,
    area: settings.area,
    temperament,
    interests,
    allergyNote,
    onboarded,
    hasAnyPersonalization,
  };
}

/** 年齢グループの中央値月齢（ヒント用の代表値） */
export function ageGroupToMonths(age: ChildAge): number {
  switch (age) {
    case '0-1':
      return 12;
    case '2-3':
      return 36;
    case '4-6':
      return 60;
  }
}

/**
 * 同期的に localStorage を読みに行く。SSR では null。
 * クライアント側でのみ意味があり、useEffect / イベントハンドラ等で使う。
 */
export function getStoredProfile(): StoredProfile | null {
  return normalize(readRaw());
}

/**
 * React hook 版。
 * - 初期描画では null を返す（SSR ↔ 初回 render の hydration mismatch を避ける）。
 * - mount 後に localStorage から読み出し、storage イベントで自動同期する。
 */
export function useProfile(): StoredProfile | null {
  const [profile, setProfile] = useState<StoredProfile | null>(null);

  useEffect(() => {
    setProfile(normalize(readRaw()));

    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key !== STORAGE_KEY) return;
      setProfile(normalize(readRaw()));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return profile;
}

/** 年齢グループの和名ラベル */
export const AGE_LABEL: Record<ChildAge, string> = {
  '0-1': '0〜1歳',
  '2-3': '2〜3歳',
  '4-6': '4〜6歳',
};
