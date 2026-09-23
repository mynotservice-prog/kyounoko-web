'use client';

import { trackEvent } from '@/lib/analytics';
import { KkIcon } from './KkIcon';
import { KkPhoneMap } from './KkPhoneMap';
import { useViewOnce } from './useViewOnce';

const LINE_URL = process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL;
const OFFER = 'kodzure-gaishoku-map';

/**
 * LINE友だち追加ブロック（モック準拠 / スマホのみ表示）。
 *
 * 構成: LINEバッジ ＋「LINEで見つかる」＋見出し＋1文＋緑のボタン ＋ スマホのマップ画面モック。
 * 配布物は編集長が0〜2歳の子と実際に回った東京の外食50店のGoogleマイマップ。
 * env（NEXT_PUBLIC_LINE_ADD_FRIEND_URL）未設定なら描画しない。
 */
export function KkLineCard({ placement }: { placement: string }) {
  // 表示計測（2026-09-23）。記事のカードは末尾にあり、見えているかどうかを
  // line_cta_view / line_add_click の割り算で確かめるために入れた。
  const ref = useViewOnce<HTMLElement>(() =>
    trackEvent('line_cta_view', { placement, offer: OFFER }),
  );
  if (!LINE_URL) return null;
  return (
    <section ref={ref} className="kk-line" aria-label="LINE友だち限定の子連れOK飲食店マップ">
      <span className="kk-line-badge" aria-hidden="true">
        LINE
      </span>
      <div className="kk-line-body">
        <span className="kk-line-eyebrow">LINEで見つかる</span>
        {/* 記事・トップのアウトラインを汚さないよう、あえて h タグにしない */}
        <div className="kk-line-title">子連れOK飲食店MAP</div>
        <p className="kk-line-sub">
          編集長が0〜2歳の子と実際に行ってよかった東京の50店を、地図にまとめました。
        </p>
        <a
          href={LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="kk-line-btn"
          onClick={() => trackEvent('line_add_click', { placement, offer: OFFER })}
        >
          LINEで無料で見てみる
          <KkIcon name="arrow-right" size={15} sw={2.2} />
        </a>
      </div>
      <KkPhoneMap className="kk-line-phone" />
    </section>
  );
}
