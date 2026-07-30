/* MuscleUp Service Worker
 * 目的: iOS の standalone PWA でも、デプロイした最新コードが確実に届くようにする。
 * 戦略:
 *  - ナビゲーション(HTML): network-first。常に最新の index.html を取得し、
 *    古いHTMLが古いJSチャンクを参照して真っ白になる事故を防ぐ。オフライン時のみキャッシュ。
 *  - ハッシュ付き静的資産(_next/static): cache-first（内容ハッシュ付きで不変）。
 *  - その他の同一オリジンGET: stale-while-revalidate。
 *  - 別オリジン(Firebase/Firestore/Maps等)は一切介入しない。
 *  - skipWaiting + clients.claim で新SWを即時有効化（クライアント側でリロード）。
 */
const CACHE = "muscleup-cache-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // 別オリジン（Firebase/Firestore/Google Maps 等）は素通し
  if (url.origin !== self.location.origin) return;

  // HTML ナビゲーション: network-first（常に最新）
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(req);
          return cached || (await caches.match(self.registration.scope)) || Response.error();
        }
      })(),
    );
    return;
  }

  // ハッシュ付き静的資産: cache-first（不変）
  if (url.pathname.includes("/_next/static/")) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      })(),
    );
    return;
  }

  // その他: stale-while-revalidate
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })(),
  );
});
