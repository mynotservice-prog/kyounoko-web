'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { KkIcon } from './KkIcon';


type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

/**
 * 「きょうのこをホーム画面に追加」（常設・インフロー / スマホのみ表示）。
 *
 * **1タップでOSの追加画面を開けるときだけ表示する**（2026-09-09 社長指示）。
 * - Chrome 系（Android など）: `beforeinstallprompt` を捕捉できるので、タップでOSの
 *   インストール確認をそのまま出せる。→ このときだけカードを描画する。
 * - iOS Safari: Apple が追加画面を開くAPIを公開しておらず、Webから遷移させる方法が無い。
 *   手順を文章で案内するしかないため、**iOSでは何も出さない**。
 * - すでにスタンドアロン起動なら何も描画しない。
 *
 * 既存の PWAInstallPrompt（スクロール50%で出る浮遊バナー）とは独立。
 * PC 非表示は app/styles/kk.css の `.kk-home`（920px 以上で display:none）で行う。
 */
export function KkAddToHomeCard({ placement }: { placement: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    try {
      if (window.matchMedia?.('(display-mode: standalone)').matches) setStandalone(true);
      if ((navigator as unknown as { standalone?: boolean }).standalone) setStandalone(true);
    } catch {
      /* noop */
    }
    const onBefore = (e: Event) => {
      // 既定のミニバーを止めて、このカードのタップで即プロンプトを出せるように保持する
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBefore);
    const onInstalled = () => setStandalone(true);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const oneTap = Boolean(deferred);
  // 追加画面をその場で開けない環境（iOS Safari など）では出さない。
  if (standalone || !oneTap) return null;

  const onClick = async () => {
    if (deferred) {
      trackEvent('pwa_install_card_click', { placement, action: 'prompt' });
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      trackEvent('pwa_install_card_result', { placement, outcome });
      if (outcome === 'accepted') setStandalone(true);
      setDeferred(null);
      return;
    }
    // ここには来ない（deferred が無いときはカード自体を描画しない）。
    trackEvent('pwa_install_card_click', { placement, action: 'noop' });
  };

  return (
    <>
      <button type="button" className="kk-home" onClick={onClick}>
        <span className="kk-home-ico">
          <KkIcon name="phone" size={30} sw={1.5} />
        </span>
        <span className="kk-home-body">
          <span className="kk-home-title" style={{ display: 'block' }}>
            きょうのこをホーム画面に追加
          </span>
          <span className="kk-home-sub" style={{ display: 'block' }}>
            タップすると追加画面が開きます
          </span>
        </span>
        <span className="kk-home-arrow">
          <span className="kk-btn sm">追加する</span>
        </span>
      </button>
    </>
  );
}
