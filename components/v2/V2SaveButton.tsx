'use client';

import React from 'react';
import { V2Icon } from './V2Icon';
import { useV2Ctx } from './V2Base';

/**
 * スポット詳細ヒーロー右上に乗せる小さな保存アイコンボタン。
 * v2-sd-hero-fav スタイル前提。
 */
export function V2SdHeroFav({ id }: { id: string }) {
  const { saved, toggleSave } = useV2Ctx();
  const isSaved = !!saved[id];
  return (
    <button
      type="button"
      className={'v2-sd-hero-fav' + (isSaved ? ' on' : '')}
      onClick={() => toggleSave(id)}
      aria-label={isSaved ? '保存を解除' : 'このスポットを保存'}
    >
      <V2Icon
        name="heart"
        size={20}
        color={isSaved ? '#fff' : 'var(--v2-orange)'}
        fill={isSaved}
      />
    </button>
  );
}

/**
 * スポット詳細ページ用の大きな保存ボタン。
 * localStorage に保存状態を持ち、toggle 動作する。
 */
export function V2SaveButton({ id }: { id: string }) {
  const { saved, toggleSave } = useV2Ctx();
  const isSaved = !!saved[id];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '24px 18px 8px' }}>
      <button
        type="button"
        onClick={() => toggleSave(id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 13,
          padding: '16px 18px',
          borderRadius: 'var(--v2-r-lg)',
          border: '2px solid var(--v2-orange)',
          background: isSaved ? 'var(--v2-orange)' : 'var(--v2-orange-tint)',
          textAlign: 'left',
          cursor: 'pointer',
          width: '100%',
          transition: 'all .15s',
        }}
      >
        <V2Icon
          name="heart"
          size={22}
          color={isSaved ? '#fff' : 'var(--v2-orange)'}
          fill={isSaved}
        />
        <span>
          <span
            style={{
              display: 'block',
              fontSize: 15,
              fontWeight: 800,
              color: isSaved ? '#fff' : 'var(--v2-orange-deep)',
            }}
          >
            {isSaved ? '保存済み' : 'このスポットを保存する'}
          </span>
          <span
            style={{
              display: 'block',
              fontSize: 11.5,
              color: isSaved ? '#fff' : 'var(--v2-ink-mute)',
              marginTop: 2,
              opacity: isSaved ? 0.9 : 1,
            }}
          >
            あとで見返したいときに便利！
          </span>
        </span>
      </button>
    </div>
  );
}
