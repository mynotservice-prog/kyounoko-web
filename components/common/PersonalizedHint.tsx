'use client';

/**
 * PersonalizedHint
 * ----------------------------------------------------------------------------
 * /settings に保存された子の年齢を読み、ページのコンテキストに応じて
 * 「年齢別ワンポイントヒント」をクライアントサイドで表示する小さな枠。
 *
 * - SSR では何も出さず、hydrate 後に fade-in。
 * - レイアウトシフトを避けるため min-height を確保（プレースホルダ）。
 * - プロフィール未設定でも、「設定すると年齢別ヒントが見られる」と
 *   軽くだけ案内する CTA を出す（context='top'/'station'/'article' で
 *   ノイズになりやすい場面では variant='cta-only' で控えめに表示）。
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AGE_LABEL, useProfile } from '@/lib/profile';
import type { ChildAge } from '@/hooks/useUserSettings';

type Context = 'station' | 'article' | 'top';

type Props = {
  /** どのページから呼ばれているか。ヒント文言を切り替える */
  context: Context;
  /**
   * 未設定時の挙動。
   *  - 'cta'    : 控えめに「設定で年齢を登録すると…」CTA を表示（デフォルト）
   *  - 'hidden' : 何も出さない（top hero 下など、ノイズになる場合）
   */
  fallback?: 'cta' | 'hidden';
  /** 追加クラス */
  className?: string;
  /** 文脈情報（駅名や記事タイトルなど）— ヒント本文の主語に使う */
  contextLabel?: string;
};

/** 年齢グループごとのワンポイントヒント（コンテキスト × age） */
const HINTS_BY_CONTEXT: Record<Context, Record<ChildAge, { title: string; points: string[] }>> = {
  station: {
    '0-1': {
      title: '0〜1歳と行くなら、ここをチェック',
      points: ['ベビーカーで余裕入店できるか', 'ベビーチェアあり', '離乳食持込OK・授乳室の近さ'],
    },
    '2-3': {
      title: '2〜3歳と行くなら、ここをチェック',
      points: ['キッズチェア・取り分けOK', '騒いでも気にならない席', '近くに公園など遊ぶ場所'],
    },
    '4-6': {
      title: '4〜6歳と行くなら、ここをチェック',
      points: ['キッズメニューあり', '個室・仕切り席で集中', '食後に体を動かせるスペース'],
    },
  },
  article: {
    '0-1': {
      title: '0〜1歳の今日のヒント',
      points: ['昼寝のタイミングと外出時間を揃える', 'ベビーカー動線・授乳/おむつ替え場所を最優先'],
    },
    '2-3': {
      title: '2〜3歳の今日のヒント',
      points: ['「自分でやる」を1つ仕込む', '10〜15分単位で切り替えると集中が続きやすい'],
    },
    '4-6': {
      title: '4〜6歳の今日のヒント',
      points: ['ルール説明を一緒に決めると満足度が上がる', 'お友達誘って行くプランも検討'],
    },
  },
  top: {
    '0-1': {
      title: '0〜1歳のお子さん向け、今日のおすすめ',
      points: ['屋内・授乳室ありの近場スポット', 'ベビーカーOKのランチ', '短時間で帰れる動線'],
    },
    '2-3': {
      title: '2〜3歳のお子さん向け、今日のおすすめ',
      points: ['キッズメニューあり・取り分けOK', '走れる広い場所', '15分集中できる家遊び'],
    },
    '4-6': {
      title: '4〜6歳のお子さん向け、今日のおすすめ',
      points: ['体験型スポット・自然系', 'キッズメニュー＋ご褒美感のあるごはん', '簡単な工作・読書'],
    },
  },
};

export function PersonalizedHint({ context, fallback = 'cta', className, contextLabel }: Props) {
  const profile = useProfile();
  // hydrate 後のフェードイン用フラグ。SSR では false。
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR / hydration 前は出さない（mismatch 回避）。
  // ただしレイアウトシフト防止に min-height のプレースホルダだけ出す。
  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className={className}
        style={{ minHeight: 0, transition: 'opacity .25s ease' }}
      />
    );
  }

  const hasAge = profile && profile.ages.length > 0;

  // 年齢未設定 → fallback の処理
  if (!hasAge) {
    if (fallback === 'hidden') return null;
    return (
      <div
        className={className}
        style={{
          opacity: 1,
          animation: 'kn-fade-in .35s ease both',
          margin: '16px 0',
          padding: '10px 14px',
          border: '1px dashed rgba(201,96,62,0.30)',
          borderRadius: 10,
          background: 'rgba(201,96,62,0.04)',
          fontSize: 12,
          color: 'var(--ink-sub)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span>
          <strong style={{ color: 'var(--clay-deep)', marginRight: 6 }}>パーソナライズ</strong>
          設定画面でお子さんの年齢を登録すると、年齢別のヒントが表示されます。
        </span>
        <Link
          href="/settings"
          style={{
            fontSize: 12,
            color: 'var(--clay-deep)',
            fontWeight: 600,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            borderBottom: '1px dotted var(--clay-deep)',
          }}
        >
          設定する →
        </Link>
        <style jsx>{`
          @keyframes kn-fade-in {
            from { opacity: 0; transform: translateY(2px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  // age あり: ヒントを描画
  const age = profile.ages[0];
  const hint = HINTS_BY_CONTEXT[context][age];
  const ageLabel = AGE_LABEL[age];

  return (
    <div
      className={className}
      style={{
        opacity: 1,
        animation: 'kn-fade-in .35s ease both',
        margin: '16px 0',
        padding: '14px 18px',
        background: 'linear-gradient(135deg, rgba(201,96,62,0.07), rgba(20,147,209,0.04))',
        border: '1px solid rgba(201,96,62,0.18)',
        borderRadius: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
          marginBottom: 8,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: '0.14em',
            color: 'var(--clay-deep)',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          For you · {ageLabel}
        </span>
        <strong style={{ fontFamily: 'var(--font-mincho), serif', fontSize: 15 }}>
          {contextLabel ? `${contextLabel} — ${hint.title}` : hint.title}
        </strong>
      </div>
      <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.85, fontSize: 13.5 }}>
        {hint.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--ink-mute)' }}>
        ※ 年齢を変更したい場合は{' '}
        <Link
          href="/settings"
          style={{
            color: 'var(--clay-deep)',
            textDecoration: 'none',
            borderBottom: '1px dotted var(--clay-deep)',
          }}
        >
          設定画面
        </Link>{' '}
        から。
      </div>
      <style jsx>{`
        @keyframes kn-fade-in {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default PersonalizedHint;
