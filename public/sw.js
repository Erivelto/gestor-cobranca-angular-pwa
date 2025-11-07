const CACHE_NAME = 'gestor-cobranca-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';
const API_CACHE = 'api-v2';

const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/styles.css',
  '/polyfills.js',
  '/main.js'
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
        console.log('[Service Worker] Precaching App Shell');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting on install');
        return self.skipWaiting();
      })
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

  // Estratégia para requisições da API
  if (isApiRequest(url.pathname)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(API_CACHE)
              .then(cache => {
                cache.put(event.request, clonedResponse);
              });
            return response;
          }
          // Se a requisição falhar, tenta buscar do cache
          return caches.match(event.request);
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
  // Estratégia para arquivos estáticos
  else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then(res => {
              return caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  // Armazena no cache dinâmico
                  cache.put(event.request.url, res.clone());
                  return res;
                });
            })
            .catch(err => {
              // Aqui você pode retornar uma página offline personalizada
              console.log('[Service Worker] Fetch failed; returning offline page instead.', err);
            });
        })
    );
  }
});

