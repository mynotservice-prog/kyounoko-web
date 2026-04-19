'use client';

import { useFavorites, type FavKind } from '@/hooks/useFavorites';

/**
 * お気に入り (♡) ボタン。
 * ログイン不要、localStorage に保存。クリックでトグル。
 */
export function FavoriteButton({
  kind,
  id,
  size = 'md',
  label,
}: {
  kind: FavKind;
  id: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}) {
  const { isFav, toggleFav } = useFavorites();
  const fav = isFav(kind, id);
  const dims = size === 'sm' ? 14 : size === 'lg' ? 22 : 18;

  return (
    <button
      type="button"
      className={`fav-btn ${fav ? 'is-fav' : ''} fav-${size}`}
      aria-label={fav ? 'お気に入りから削除' : 'お気に入りに追加'}
      aria-pressed={fav}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFav(kind, id);
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width={dims}
        height={dims}
        fill={fav ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {label && <span style={{ marginLeft: 6 }}>{label}</span>}
    </button>
  );
}
