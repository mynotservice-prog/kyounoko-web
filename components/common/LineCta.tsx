'use client';

import React from 'react';
import { trackEvent } from '@/lib/analytics';

/**
 * LINE友だち追加CTA。
 *
 * 訴求は「登録したら何がもらえるか」を先頭に置く。
 * 配布物は運営者が0〜2歳の子を連れて実際に回った東京の外食50店のGoogleマイマップ
 * （【全部行った】ベビーカーで入れる東京の子連れ外食50選）。
 * 配布は LINE 管理画面の「あいさつメッセージ」で自動送信している
 * （友だち追加直後の自動送信は通数課金の対象外）。運用メモは docs/line-launch-kit.md。
 *
 * ★マップのURLはここには置かない。サイト上で配ってしまうと友だち追加する理由が消える。
 *
 * NEXT_PUBLIC_LINE_ADD_FRIEND_URL（https://lin.ee/xxxx）が設定されているときだけ描画する。
 */

const LINE_URL = process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL;
const LINE_GREEN = '#06C755';

/** マップ実物の数字（KMLで実測 2026-07-28）。コピーを盛らないための定数。 */
const SHOP_COUNT = 50;
const STROLLER_SIDE_BY_SIDE = 29; // ベビーカーを席まで横付けできると確認できた店

/**
 * プレビューに出す3店。マップに実際に入っているピンから、
 * 「子連れで行けると思っていなかった店」が伝わる並びで選んだ。
 */
const PREVIEW_SHOPS: Array<{ name: string; area: string; stroller: string; star: string }> = [
  { name: 'bills 二子玉川', area: '二子玉川', stroller: '◎ 席まで横付け', star: '★4' },
  { name: 'ロウリーズ・ザ・プライムリブ 恵比寿', area: '恵比寿', stroller: '○ 店内OK', star: '★5' },
  { name: '100本のスプーン TOYOSU', area: '豊洲', stroller: '◎ 席まで横付け', star: '★5' },
];

export function LineCta({ variant }: { variant: 'banner' | 'article' }) {
  if (!LINE_URL) return null;

  const isArticle = variant === 'article';

  return (
    <section
      aria-label="LINE友だち限定の子連れ外食マップをもらう"
      style={{
        background: 'linear-gradient(180deg,#f4fcf6 0%,#eafaef 100%)',
        border: '1px solid #bfe8cc',
        borderRadius: 18,
        padding: isArticle ? '18px 16px' : '20px 18px',
        marginTop: isArticle ? 28 : 20,
        marginBottom: isArticle ? 0 : 8,
        // トップは V2Frame 直下に置かれ左右の余白が付かないので、他セクションと同じ18pxを自前で持つ。
        // 記事内は container 側に余白があるため0。
        marginLeft: isArticle ? 0 : 18,
        marginRight: isArticle ? 0 : 18,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          background: LINE_GREEN,
          color: '#fff',
          fontSize: 11.5,
          fontWeight: 700,
          letterSpacing: '.04em',
          padding: '4px 10px',
          borderRadius: 999,
        }}
      >
        LINE友だち限定プレゼント
      </span>

      {/* 記事の見出し構造・トップのアウトラインを汚さないよう、あえて h タグにしない */}
      <div
        style={{
          fontSize: isArticle ? 17 : 19,
          lineHeight: 1.45,
          fontWeight: 800,
          margin: '10px 0 6px',
          color: '#14351f',
        }}
      >
        【全部行った】ベビーカーで入れる<br />
        東京の子連れ外食{SHOP_COUNT}選マップ
      </div>

      <p style={{ fontSize: 13, lineHeight: 1.7, color: '#41604c', margin: 0 }}>
        編集長が<strong>0〜2歳の子を連れて実際に回った{SHOP_COUNT}店</strong>を、
        Googleマップにピン留めしてお渡しします。ネットの評判ではなく、
        <strong>行った本人の本音と「行く前の注意」つき</strong>。
        現在地から近い順に探せます。
      </p>

      {/* 中身のプレビュー。「本当に実データがある」ことを見せてから登録させる */}
      <div
        style={{
          marginTop: 12,
          background: '#fff',
          border: '1px solid #d8ecdf',
          borderRadius: 12,
          padding: '10px 12px',
        }}
      >
        <div style={{ fontSize: 11.5, color: '#6b8375', marginBottom: 8, fontWeight: 700 }}>
          収録店の一部
        </div>
        {PREVIEW_SHOPS.map((s) => (
          <div key={s.name} style={{ padding: '7px 0', borderTop: '1px solid #eef4f0' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#14351f', lineHeight: 1.4 }}>
              {s.name}
              <span style={{ fontSize: 11.5, fontWeight: 400, color: '#6b8375' }}>
                {'　'}
                {s.area}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <span
                style={{
                  fontSize: 11.5,
                  color: '#1c7a41',
                  background: '#eaf7ee',
                  borderRadius: 6,
                  padding: '2px 6px',
                  whiteSpace: 'nowrap',
                }}
              >
                ベビーカー{s.stroller}
              </span>
              <span style={{ fontSize: 11.5, color: '#c9603e', whiteSpace: 'nowrap' }}>
                また行く度 {s.star}
              </span>
            </div>
          </div>
        ))}
        <div
          style={{
            borderTop: '1px solid #eef4f0',
            paddingTop: 7,
            marginTop: 2,
            fontSize: 11.5,
            color: '#6b8375',
            lineHeight: 1.6,
          }}
        >
          焼肉・鮨・イタリアン・カフェなど20ジャンル。
          うち<strong>{STROLLER_SIDE_BY_SIDE}店はベビーカーを席まで横付けできた</strong>店です。
          残り{SHOP_COUNT - PREVIEW_SHOPS.length}店は友だち追加後にマップで全部見られます。
        </div>
      </div>

      <a
        href={LINE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('line_add_click', { placement: variant, offer: 'kodzure-gaishoku-map' })}
        style={{
          display: 'block',
          marginTop: 14,
          background: LINE_GREEN,
          color: '#fff',
          fontWeight: 800,
          fontSize: 15,
          padding: '14px 18px',
          borderRadius: 999,
          textDecoration: 'none',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(6,199,85,.28)',
        }}
      >
        LINEで地図を無料で受け取る（10秒）
      </a>

      <p
        style={{
          fontSize: 11.5,
          color: '#6b8375',
          margin: '10px 0 0',
          lineHeight: 1.6,
          textAlign: 'center',
        }}
      >
        友だち追加すると、その場でマップのリンクが届きます。
        <br />
        毎週金曜20時に「週末どこ行く？」も配信中。ブロックはいつでもOK。
      </p>
    </section>
  );
}
