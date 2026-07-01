/**
 * ベビーカー診断（P1-9）の「具体的な型番」データ。
 *
 * 診断カテゴリ（Client.tsx の RECOMMENDATIONS.id）ごとに、実在の人気モデルを2〜3点。
 * 価格・画像は楽天商品検索API（keyword→実商品, lib/rakuten-products）で解決する
 * ため、ここには型番・スペック（重さ/対象月齢/ひとこと）と検索キーワードだけ持つ。
 * env未設定でも keyword で楽天検索リンクにフォールバックできる。
 *
 * server（page.tsx）が全keywordを解決して Client にpropsで渡す。
 */
export type BabycarModel = {
  /** 型番・製品名 */
  name: string;
  /** 楽天商品検索のキーワード */
  keyword: string;
  /** 重さ（比較表用） */
  weight: string;
  /** 対象月齢 */
  ageFrom: string;
  /** 一言（この診断カテゴリで合う理由） */
  note: string;
};

export const BABYCAR_MODELS: Record<string, BabycarModel[]> = {
  lightA: [
    { name: 'アップリカ ラクーナ クッション', keyword: 'アップリカ ラクーナ クッション ベビーカー', weight: '約5.4kg', ageFrom: '生後1ヶ月〜', note: '両対面・自立OK。段差ラクラク設計で電車移動に強い定番。' },
    { name: 'コンビ スゴカルα', keyword: 'コンビ スゴカル ベビーカー', weight: '約4.9kg', ageFrom: '生後1ヶ月〜', note: '超軽量クラス。持ち上げやすく改札・階段の負担が少ない。' },
    { name: 'ピジョン ランフィ', keyword: 'ピジョン ランフィ ベビーカー', weight: '約5.4kg', ageFrom: '生後1ヶ月〜', note: '大径タイヤで押し心地が滑らか。軽量なのに走行安定。' },
  ],
  smoothA: [
    { name: 'アップリカ オプティア クッション', keyword: 'アップリカ オプティア ベビーカー', weight: '約6.8kg', ageFrom: '生後1ヶ月〜', note: '医学的視点の高剛性フレーム。振動を抑えて長時間でも快適。' },
    { name: 'コンビ ホワイトレーベル アットラック', keyword: 'コンビ アットラック ベビーカー', weight: '約6.9kg', ageFrom: '生後1ヶ月〜', note: 'エッグショック＋大型タイヤ。乗り心地重視のフルサイズ。' },
  ],
  tricycle: [
    { name: 'エアバギー ココブレーキEX', keyword: 'エアバギー ココブレーキ EX', weight: '約9.5kg', ageFrom: '生後3〜4ヶ月〜', note: 'エアタイヤ＋手元ブレーキ。砂利・芝・坂に圧倒的な走破性。' },
    { name: 'アップリカ スムーヴ プレミアム', keyword: 'アップリカ スムーヴ ベビーカー', weight: '約9.8kg', ageFrom: '生後1ヶ月〜', note: '大径3輪で悪路に強く、新生児から使える三輪モデル。' },
  ],
  B: [
    { name: 'ピジョン ビングル', keyword: 'ピジョン ビングル ベビーカー', weight: '約3.9kg', ageFrom: '生後7ヶ月〜', note: '軽量B型の定番。片手でたためて自立、セカンド機に最適。' },
    { name: 'サイベックス リベル', keyword: 'サイベックス リベル ベビーカー', weight: '約6.2kg', ageFrom: '生後6ヶ月〜', note: '超コンパクト折りたたみ。機内持ち込みサイズで旅行に強い。' },
    { name: 'コンビ F2plus', keyword: 'コンビ F2 ベビーカー', weight: '約3.7kg', ageFrom: '生後7ヶ月〜', note: '最軽量級。階段の多い家・電車移動のセカンドに。' },
  ],
  travelsystem: [
    { name: 'サイベックス メリオ（トラベルシステム）', keyword: 'サイベックス メリオ トラベルシステム', weight: '約6.0kg', ageFrom: '生後1ヶ月〜', note: 'クラウドZ等と連結。車で寝たまま乗せ替え不要。' },
    { name: 'ジョイー トラベルシステム', keyword: 'joie ジョイー トラベルシステム ベビーカー', weight: '約6kg前後', ageFrom: '新生児〜', note: 'コスパ良好なトラベルシステム。0歳の車移動の負担を軽減。' },
  ],
  budget: [
    { name: 'コンビ メチャカルα', keyword: 'コンビ メチャカル ベビーカー', weight: '約4.6kg', ageFrom: '生後1ヶ月〜', note: '軽量で基本機能充実。価格を抑えつつA型として使える。' },
    { name: '西松屋 SmartAngel', keyword: '西松屋 SmartAngel ベビーカー', weight: '約4〜5kg', ageFrom: 'モデルによる', note: '実用十分の低価格帯。短期使用・予算重視の家庭に。' },
  ],
};

/** server で解決した商品情報（client に渡す最小形）。keyword をキーにする。 */
export type ResolvedBabycar = {
  image: string | null;
  /** 円。0＝不明 */
  price: number;
  /** もしも変換済みの購入リンク（env無ければ楽天検索URL） */
  href: string;
};

/** 全モデルの keyword を重複なく列挙（server の一括解決用）。 */
export function allBabycarKeywords(): string[] {
  const set = new Set<string>();
  for (const models of Object.values(BABYCAR_MODELS)) for (const m of models) set.add(m.keyword);
  return [...set];
}
