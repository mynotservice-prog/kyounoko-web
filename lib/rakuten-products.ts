/**
 * 楽天商品検索API（Ichiba Item Search）で、キーワード→実商品（画像・価格・URL）を解決する（P1-4）。
 *
 * env `RAKUTEN_APP_ID`（楽天ウェブサービスのアプリID・無料）が必要。未設定なら null を返し、
 * 呼び出し側は従来の検索リンク（画像なし）にフォールバックする（=壊れない）。
 *
 * 取得は Next の fetch キャッシュ（revalidate=1日）でキーワード単位に dedup されるため、
 * ビルド/実行時のAPI呼び出しは「ユニークkeyword数×1日1回」に収まる（ビルドCPUを抑える）。
 * リンクの収益化は既存の もしも変換（wrapMoshimoRakuten）を呼び出し側で適用する。
 */
export type RakutenProduct = {
  title: string;
  image: string;
  /** 円。0 は不明扱い。 */
  price: number;
  /** 楽天商品URL（もしも変換は呼び出し側で行う） */
  url: string;
};

const ENDPOINT = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601';

export async function getRakutenProduct(keyword: string): Promise<RakutenProduct | null> {
  const appId = process.env.RAKUTEN_APP_ID?.trim();
  if (!appId || !keyword) return null;

  const params = new URLSearchParams({
    applicationId: appId,
    keyword,
    hits: '1',
    sort: '-reviewCount', // レビュー数の多い＝定番を1件
    imageFlag: '1', // 画像ありのみ
    availability: '1', // 在庫ありのみ
    elements: 'itemName,itemPrice,itemUrl,affiliateUrl,mediumImageUrls',
  });
  const affId = process.env.RAKUTEN_AFFILIATE_ID?.trim();
  if (affId) params.set('affiliateId', affId);

  try {
    const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      Items?: { Item?: RakutenRawItem }[];
    };
    const item = json?.Items?.[0]?.Item;
    if (!item?.itemName) return null;
    const raw = item.mediumImageUrls?.[0]?.imageUrl ?? '';
    // 楽天の medium は末尾 ?_ex=128x128 で小さいので少し大きめに差し替え
    const image = raw.replace(/\?_ex=\d+x\d+$/, '?_ex=300x300');
    if (!image) return null;
    return {
      title: item.itemName,
      image,
      price: typeof item.itemPrice === 'number' ? item.itemPrice : 0,
      url: item.affiliateUrl || item.itemUrl || '',
    };
  } catch {
    return null;
  }
}

type RakutenRawItem = {
  itemName?: string;
  itemPrice?: number;
  itemUrl?: string;
  affiliateUrl?: string;
  mediumImageUrls?: { imageUrl: string }[];
};

/** 既存の RAKUTEN('keyword') 検索URL から keyword を復元する。 */
export function keywordFromRakutenSearchUrl(url: string): string {
  const m = url.match(/\/search\/mall\/([^/]+)\/?/);
  return m ? decodeURIComponent(m[1]) : '';
}

/** 価格帯ラベル（〜1,000円 等）。0/未取得は空文字。 */
export function priceBandLabel(price: number): string {
  if (!price || price <= 0) return '';
  if (price < 1000) return '〜1,000円';
  if (price < 3000) return '1,000〜3,000円';
  if (price < 5000) return '3,000〜5,000円';
  if (price < 10000) return '5,000〜10,000円';
  return '10,000円〜';
}
