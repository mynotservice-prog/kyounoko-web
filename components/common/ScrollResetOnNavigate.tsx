'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * ページ遷移時にスクロール位置を先頭へ戻す。
 *
 * ## なぜ必要か（2026-08-04）
 *
 * 2026-08-04 に V2Frame の入れ子スクロール（`.v2-phone{height:880px}` →
 * `.v2-scroll{overflow-y:auto}`）を廃止して document を直接スクロールさせた（PR #150）。
 * それ以前は「ページごとに `.v2-scroll` という別の div が作り直され、新しい div の
 * scrollTop が 0 だった」ことで、結果的に先頭から表示されていた。
 * document スクロールに変えた結果その副作用が消え、記事一覧の下の方から記事を開くと
 * **前ページのスクロール位置が残ったまま記事の途中が表示される**ようになった（実測: 一覧を
 * 6,000px スクロールして記事を開くと、h1 が画面外 -5,598px の位置に出る）。
 *
 * Next.js App Router には本来スクロールリセットが組み込まれているが、この構成では発火しない。
 * 遷移後に scroll イベントが1件も出ないことを実測で確認済み（アニメーションの中断ではなく、
 * リセット処理自体がスキップされている）。App Router はセグメントが描画した最初のDOMノードを
 * 基準に「新しいページの先頭が既に画面内か」を判定するため、body 直下に矩形が0の要素
 * （Next 自身のストリーミング用 `<script>` 等）が並ぶこの構成では「画面内」と誤判定される。
 * フレームワーク内部の挙動に依存せず確実に直すため、明示的にリセットする。
 *
 * ## 壊してはいけないもの
 *
 * - **戻る/進む（popstate）では位置を復元させる。** App Router が復元してくれるので邪魔しない。
 * - **ハッシュ付きリンク（`/article/x#faq`）では先頭に戻さない。** 目次からの遷移が壊れる。
 * - **`behavior: 'instant'` 必須。** globals.css に `html { scroll-behavior: smooth }` があるため、
 *   指定しないとリセットがアニメーションになり、途中で中断されて効かないことがある。
 */
export function ScrollResetOnNavigate() {
  const pathname = usePathname();
  const skipNext = useRef(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // popstate は React の再レンダリングより先に発火するので、フラグはこの後の effect に間に合う
    const onPopState = () => {
      skipNext.current = true;
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    // 初回表示はブラウザ／ブラウザのスクロール復元に任せる
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // 戻る／進む: App Router の位置復元を尊重する
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    // ハッシュ付き遷移: 目的の見出しへのスクロールを奪わない
    if (window.location.hash) return;
    if (window.scrollY === 0) return;

    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
