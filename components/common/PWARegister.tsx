'use client';

import { useEffect } from 'react';

/**
 * Service Worker を登録するクライアントコンポーネント。
 *
 * - 本番（HTTPS）でのみ登録、開発時はスキップ
 * - 'load' 後に登録するので初期表示には影響しない
 * - 失敗時は黙ってスキップ（PWA未対応ブラウザでも何もしない）
 */
export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') return;

    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch(() => {
          // 失敗しても致命ではない
        });
    };

    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  return null;
}
