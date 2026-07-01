'use client';

import { useEffect, useRef, useState } from 'react';
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
const SESSION_SHOWN = 'kyounoko_pwa_shown_session';
/** 表示したら、たとえ操作されなくても次回はこの期間出さない（=期間で1回限り）。 */
const SOFT_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3日

export function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  // onScroll（安定リスナ）から最新の deferred を参照するための ref
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  deferredRef.current = deferred;

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

    // このセッションで既に出したら二度と出さない（1回限り）
    try {
      if (sessionStorage.getItem(SESSION_SHOWN)) return;
    } catch {
      /* noop */
    }

    // 抑止期間中（あとで=ソフト3日 / 30日間表示しない=30日）は出さない
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

    // 2回目以降の訪問のみ（初回訪問では出さない）
    if (visits < 1) return;

    const ua = navigator.userAgent.toLowerCase();
    const isiOS = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);

    // beforeinstallprompt は「表示」ではなく捕捉だけ。表示はスクロール50%到達で行う。
    // ただし既に50%到達済みで後から発火した場合はその場で表示する。
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      if (scrolled50()) reveal();
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // スクロール50%到達を発火条件にする（初回離脱・即時被りを防ぐ）
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      // 表示した記録（セッション1回限り＋期間ソフト抑止）
      try {
        sessionStorage.setItem(SESSION_SHOWN, '1');
      } catch {
        /* noop */
      }
      try {
        const cur = parseInt(localStorage.getItem(STORAGE_DISMISS) || '0', 10) || 0;
        const soft = Date.now() + SOFT_COOLDOWN_MS;
        if (soft > cur) localStorage.setItem(STORAGE_DISMISS, String(soft));
      } catch {
        /* noop */
      }
      setShow(true);
      window.removeEventListener('scroll', onScroll);
    };
    const scrolled50 = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return true; // 短いページは即・可
      return window.scrollY / scrollable >= 0.5;
    };
    const onScroll = () => {
      // iOS も Chrome(deferred捕捉後) も、50%到達で初めて出す
      if (scrolled50() && (isiOS || deferredRef.current)) reveal();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('scroll', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
