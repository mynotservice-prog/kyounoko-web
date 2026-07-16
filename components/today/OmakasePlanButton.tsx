'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

type Candidate = { slug: string; name: string };

/**
 * 「おまかせ」で今日の流れ（1日プラン）を作るボタン。
 *
 * 駅も条件も何も決めていないユーザー向けに、候補駅からランダムに1つ選び、
 * 午前/お昼/午後の変種もランダムに振って /today?station=... へ遷移する。
 * これにより「まず1案だけ欲しい」層がワンタップでプランに着地できる。
 * 押すたびに駅・組み合わせが変わるので「別のを見たい」にも応える。
 */
export function OmakasePlanButton({
  candidates,
  age,
  weather,
}: {
  candidates: Candidate[];
  age?: string;
  weather?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const go = () => {
    if (busy || candidates.length === 0) return;
    setBusy(true);
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    const rnd = () => String(Math.floor(Math.random() * 3));
    const qs = new URLSearchParams();
    qs.set('station', pick.slug);
    if (age) qs.set('age', age);
    if (weather && weather !== 'any') qs.set('weather', weather);
    // 午前/お昼/午後の候補をランダムに選ぶ（buildOutingPlan 側で候補数で剰余されるため任意値でOK）。
    qs.set('vm', rnd());
    qs.set('vl', rnd());
    qs.set('va', rnd());
    router.push(`/today?${qs.toString()}`);
  };

  if (candidates.length === 0) return null;

  return (
    <button
      type="button"
      onClick={go}
      disabled={busy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 20px',
        borderRadius: 999,
        border: 'none',
        background: 'var(--clay, #c9603e)',
        color: '#fff',
        fontSize: 14.5,
        fontWeight: 800,
        cursor: busy ? 'wait' : 'pointer',
        opacity: busy ? 0.7 : 1,
        boxShadow: '0 2px 10px rgba(201,96,62,0.28)',
        marginBottom: 14,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '1.1em' }}>🎲</span>
      {busy ? 'プランを作成中…' : 'おまかせで今日の流れを作る'}
    </button>
  );
}
