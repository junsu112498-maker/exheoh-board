const CACHE_NAME = 'design-board-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap'
];

// 설치: 핵심 파일만 캐시
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/index.html', '/manifest.json']).catch(() => {});
    })
  );
  self.skipWaiting();
});

// 활성화: 오래된 캐시 삭제
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// fetch: 네트워크 우선, 실패 시 캐시
// Firebase 요청은 항상 네트워크로 (실시간 데이터)
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // Firebase / Google API 요청은 캐시 안 함
  if (
    url.includes('firebaseio.com') ||
    url.includes('googleapis.com') ||
    url.includes('gstatic.com') ||
    url.includes('firebaseapp.com')
  ) {
    return; // 브라우저 기본 처리
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // 성공하면 캐시에도 저장
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => {
        // 오프라인이면 캐시에서 응답
        return caches.match(e.request).then(r => r || caches.match('/index.html'));
      })
  );
});
