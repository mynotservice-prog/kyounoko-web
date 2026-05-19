'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * 2回目以降の訪問者に PWA インストール（ホーム画面追加）を促す控えめなバナー。
 *
 * リピート率 1.27 sessions/user を引き上げるための施策。
 *
 * 仕様:
 *  - localStorage の `kyounoko_visit_count` を訪問ごとに加算
 *  - 2回目以降 かつ まだ banner を閉じていない人 にだけ表示
 *  - 'beforeinstallprompt' を受け取れた Chrome 系では「ホーム画面に追加」ボタンを出す
 *  - iOS Safari など 'beforeinstallprompt' が無い環境では文言だけ簡素に表示
 *  - 「閉じる」「インストール」「30日間表示しない」の3つのアクションをGA4送信
 */

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const STORAGE_VISIT = 'kyounoko_visit_count';
const STORAGE_DISMISS = 'kyounoko_pwa_dismiss_until';

export function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 訪問回数のカウント
    let visits = 0;
    try {
      visits = parseInt(localStorage.getItem(STORAGE_VISIT) || '0', 10) || 0;
      localStorage.setItem(STORAGE_VISIT, String(visits + 1));
    } catch {
      return; // localStorage 不可なら表示しない
    }

    // 30日抑止
    try {
      const until = parseInt(localStorage.getItem(STORAGE_DISMISS) || '0', 10) || 0;
      if (until && until > Date.now()) return;
    } catch {
      /* noop */
    }

    // PWA インストール済みなら不要
    if (window.matchMedia?.('(display-mode: standalone)').matches) return;
    // iOS 用 navigator.standalone
    if ((navigator as unknown as { standalone?: boolean }).standalone) return;

    // 2回目以降のみ
    if (visits < 1) return;

    // beforeinstallprompt
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // iOS（beforeinstallprompt 非対応）でも 3回目以降は文言で案内
    const ua = navigator.userAgent.toLowerCase();
    const isiOS = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    if (isiOS && visits >= 2) {
      setShow(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  if (!show) return null;

  const close = (reason: 'close' | 'install' | 'long_dismiss') => {
    if (reason === 'long_dismiss') {
      try {
        localStorage.setItem(STORAGE_DISMISS, String(Date.now() + 30 * 24 * 60 * 60 * 1000));
      } catch {
        /* noop */
      }
    }
    trackEvent('pwa_install_prompt_action', { action: reason });
    setShow(false);
  };

  const install = async () => {
    if (!deferred) {
      trackEvent('pwa_install_prompt_action', { action: 'ios_dismiss' });
      setShow(false);
      return;
    }
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      trackEvent('pwa_install_prompt_action', { action: choice.outcome });
    } catch {
      /* noop */
    }
    setShow(false);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        maxWidth: 480,
        margin: '0 auto',
        padding: 16,
        background: 'var(--paper, #fff)',
        border: '1px solid var(--line, #e8e2d4)',
        borderRadius: 14,
        boxShadow: '0 8px 24px rgba(40,30,15,0.12)',
        zIndex: 60,
        fontSize: 14,
        lineHeight: 1.6,
      }}
    >
      <p id="pwa-install-title" style={{ margin: 0, fontWeight: 600 }}>
        ホーム画面に追加すると、次回からアプリのように開けます
      </p>
      <p style={{ margin: '6px 0 12px', color: 'var(--ink-sub, #6f6960)', fontSize: 13 }}>
        「今日どうする？」をすぐ呼び出せて、起動も速くなります。
      </p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => close('long_dismiss')}
          style={{
            fontSize: 12,
            background: 'transparent',
            border: 'none',
            color: 'var(--ink-mute, #8a8377)',
            cursor: 'pointer',
            padding: 8,
          }}
        >
          30日間表示しない
        </button>
        <button
          type="button"
          onClick={() => close('close')}
          style={{
            fontSize: 13,
            background: 'transparent',
            border: '1px solid var(--line, #e8e2d4)',
            borderRadius: 8,
            padding: '8px 14px',
            cursor: 'pointer',
          }}
        >
          あとで
        </button>
        <button
          type="button"
          onClick={install}
          style={{
            fontSize: 13,
            fontWeight: 600,
            background: 'var(--ink, #221a10)',
            color: 'var(--paper, #fff)',
            border: 'none',
            borderRadius: 8,
            padding: '8px 14px',
            cursor: 'pointer',
          }}
        >
          {deferred ? 'ホーム画面に追加' : '追加方法を見る'}
        </button>
      </div>
    </div>
  );
}
