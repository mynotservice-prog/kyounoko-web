import React from 'react';

/**
 * LINEブロックに添えるスマホのマップ画面モック（装飾・カラー）。
 * 配布物（子連れOK飲食店マップ）が「地図」であることを一目で伝えるための挿絵。
 * 画像ファイルは増やさず、インライン SVG で描く。
 */
export function KkPhoneMap({ width = 108, className }: { width?: number; className?: string }) {
  const h = Math.round((width * 176) / 108);
  return (
    <svg
      width={width}
      height={h}
      viewBox="0 0 108 176"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* 端末 */}
      <rect x="2" y="2" width="104" height="172" rx="16" fill="#2E2A26" />
      <rect x="7" y="7" width="94" height="162" rx="12" fill="#EAF1E9" />
      {/* ステータスバー */}
      <rect x="41" y="11" width="26" height="5" rx="2.5" fill="#2E2A26" />
      {/* 地図: 区画 */}
      <rect x="7" y="20" width="94" height="126" fill="#E7F0E4" />
      <rect x="11" y="26" width="26" height="20" rx="2" fill="#D6E7D1" />
      <rect x="47" y="26" width="22" height="14" rx="2" fill="#D6E7D1" />
      <rect x="76" y="30" width="21" height="24" rx="2" fill="#D6E7D1" />
      <rect x="13" y="60" width="20" height="26" rx="2" fill="#D6E7D1" />
      <rect x="44" y="56" width="24" height="18" rx="2" fill="#D6E7D1" />
      <rect x="78" y="66" width="19" height="20" rx="2" fill="#D6E7D1" />
      <rect x="12" y="100" width="24" height="22" rx="2" fill="#D6E7D1" />
      <rect x="48" y="96" width="26" height="26" rx="2" fill="#D6E7D1" />
      {/* 川 */}
      <path d="M7 128c14 0 18-10 32-10s20 12 34 12 16-6 28-6" stroke="#BBDCF2" strokeWidth="7" fill="none" />
      {/* 道路 */}
      <path d="M40 20v126M7 52h94M7 92h94" stroke="#FFFFFF" strokeWidth="5" />
      <path d="M72 20v126" stroke="#FFFFFF" strokeWidth="3.4" />
      {/* ピン */}
      <g>
        <path d="M31 44c0 5-7 11-7 11s-7-6-7-11a7 7 0 1 1 14 0Z" fill="#EE7A2E" />
        <circle cx="24" cy="44" r="2.6" fill="#FFFFFF" />
      </g>
      <g>
        <path d="M67 76c0 5-7 11-7 11s-7-6-7-11a7 7 0 1 1 14 0Z" fill="#EE7A2E" />
        <circle cx="60" cy="76" r="2.6" fill="#FFFFFF" />
      </g>
      <g>
        <path d="M95 112c0 5-7 11-7 11s-7-6-7-11a7 7 0 1 1 14 0Z" fill="#06C755" />
        <circle cx="88" cy="112" r="2.6" fill="#FFFFFF" />
      </g>
      {/* 下部の店舗カード */}
      <rect x="7" y="146" width="94" height="23" fill="#FFFFFF" />
      <rect x="13" y="151" width="14" height="13" rx="2" fill="#F3E3D2" />
      <rect x="31" y="152" width="44" height="4" rx="2" fill="#4A4038" />
      <rect x="31" y="159" width="30" height="3.4" rx="1.7" fill="#B8B0A6" />
      <rect x="80" y="155" width="14" height="7" rx="3.5" fill="#06C755" />
    </svg>
  );
}
