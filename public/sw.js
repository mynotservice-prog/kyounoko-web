/**
 * きょうのこ Service Worker（最小実装）
 *
 * - 静的アセット（hero画像/icons/CSS/JS）は cache-first
 * - HTML / API は network-first（古い記事を見せ続けないため）
 * - オフライン時は前回キャッシュした最寄りページを返す
 *
 * 注: 過剰キャッシュで古い記事が出続けるのを避けたいので、HTMLは積極的に
 * リフレッシュする戦略にしている。
 */

// V2デザインリニューアル反映のためバージョンアップ → 旧キャッシュ全削除
// 2026-06-06: V2 全面適用後、過去PWA訪問者のブラウザで旧HTMLキャッシュが残り
// 「探す」「イベント」等のページが旧デザインに見える問題を解消。
// バージョンを上げると各クライアントで activate イベントが走り旧キャッシュが消える。
const CACHE_VERSION = 'v4-2026-06-06-v2-renewal';
const RUNTIME_CACHE = `kyounoko-runtime-${CACHE_VERSION}`;
const STATIC_CACHE = `kyounoko-static-${CACHE_VERSION}`;

// プリキャッシュは最低限（installで失敗しても致命的にしない）
const PRECACHE_URLS = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => {
        // プリキャッシュに失敗しても install は通す
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.endsWith(CACHE_VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // POST/その他は SW で扱わない（ブラウザに任せる）
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // 同一オリジンのみ扱う
  if (url.origin !== self.location.origin) return;

  // 静的アセット (画像・CSS・JS・フォント・icons)
  if (
    /\.(?:png|webp|jpg|jpeg|svg|ico|css|js|woff2?|ttf)$/.test(url.pathname) ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/hero/') ||
    url.pathname.startsWith('/hero-ai/')
  ) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(req).then(
          (cached) =>
            cached ||
            fetch(req).then((res) => {
              if (res.ok) cache.put(req, res.clone());
              return res;
            }),
        ),
      ),
    );
    return;
  }

  // HTML / API : network-first、失敗したらキャッシュ
  if (
    req.mode === 'navigate' ||
    req.headers.get('accept')?.includes('text/html')
  ) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then(
            (cached) =>
              cached ||
              caches.match('/').then((root) => root || Response.error()),
          ),
        ),
    );
  }
});
