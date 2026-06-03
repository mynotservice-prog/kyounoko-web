import type { Metadata } from 'next';
import './v2.css';

export const metadata: Metadata = {
  title: 'きょうのこ（リニューアル）',
  description:
    '0〜6歳の子育て家庭向け。スポット・ランチ・イベントを「今日どこ行く？」から3分で探せるサイト。',
  robots: { index: false, follow: false }, // 並行開発中は noindex
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return children;
}
