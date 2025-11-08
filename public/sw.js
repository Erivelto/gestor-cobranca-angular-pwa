const CACHE_NAME = 'gestor-cobranca-v4';
const STATIC_CACHE = 'static-v4';
const DYNAMIC_CACHE = 'dynamic-v4';
const API_CACHE = 'api-v4';

// Arquivos estáticos que não possuem hash (ícones, manifest e index)
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Função para verificar se é uma requisição da API
const isApiRequest = (url) => {
  return url.includes('/api/');
};

// Função para verificar se é uma requisição de autenticação
const isAuthRequest = (url) => {
  return url.includes('/api/Autenticacao/');
};

// Install event - Cache estático
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...', event);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[Service Worker] Precaching minimal App Shell');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - Limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...', event);
  event.waitUntil(
    Promise.all([
      caches.keys()
        .then(keyList => {
          return Promise.all(keyList.map(key => {
            if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== API_CACHE) {
              console.log('[Service Worker] Removing old cache', key);
              return caches.delete(key);
            }
          }));
        }),
      self.clients.claim()
    ])
  );
});

// Fetch event - Estratégia de cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Não interceptar requisições de autenticação
  if (isAuthRequest(url.pathname)) {
    return;
  }

  // Requisições da API -> network-first, com fallback em cache
  if (isApiRequest(url.pathname)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(API_CACHE).then(cache => cache.put(event.request, clonedResponse));
            return response;
          }
          return caches.match(event.request);
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Navegações (SPA) -> network-first para garantir index atualizado
  if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // atualiza cache do shell
          const cloned = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put('/index.html', cloned));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Outros recursos (CSS/JS/Assets) -> cache-first com dynamic caching
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request)
          .then(res => {
            // não cache requests cross-origin (ex: fonts) unless CORS headers allow
            try {
              const resClone = res.clone();
              caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, resClone));
            } catch (e) {
              // ignore
            }
            return res;
          })
          .catch(() => null);
      })
  );
});

