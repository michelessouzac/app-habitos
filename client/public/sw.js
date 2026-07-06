const CACHE_NAME = 'cantinho-hidratacao-v1';
const RUNTIME_CACHE = 'cantinho-runtime-v1';

// URLs para cache na instalação
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Fazendo cache dos arquivos principais');
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia de fetch: Network First, com fallback para cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar requisições para APIs tRPC (precisam de rede)
  if (url.pathname.startsWith('/api/trpc')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache bem-sucedido para uso offline
          if (response.ok) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Retornar resposta em cache se disponível
          return caches.match(request).then((cached) => {
            if (cached) {
              console.log('[Service Worker] Retornando resposta em cache para:', url.pathname);
              return cached;
            }
            // Retornar página offline se não houver cache
            return caches.match('/');
          });
        })
    );
    return;
  }

  // Para outros recursos: Network First com fallback para cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Não cachear respostas não-OK
        if (!response || response.status !== 200) {
          return response;
        }

        // Clonar a resposta
        const responseToCache = response.clone();

        // Cachear a resposta
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Tentar retornar do cache
        return caches.match(request).then((cached) => {
          if (cached) {
            console.log('[Service Worker] Retornando resposta em cache para:', url.pathname);
            return cached;
          }

          // Se for uma página, retornar a página raiz
          if (request.mode === 'navigate') {
            return caches.match('/');
          }

          // Retornar resposta padrão para outros tipos
          return new Response('Offline - recurso não disponível', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
      })
  );
});

// Sincronização em background (quando voltar online)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  if (event.tag === 'sync-hydration') {
    event.waitUntil(syncHydrationData());
  }
});

// Função para sincronizar dados de hidratação
async function syncHydrationData() {
  try {
    console.log('[Service Worker] Sincronizando dados de hidratação...');
    // Notificar clientes que a sincronização foi concluída
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'Dados sincronizados com sucesso!',
      });
    });
  } catch (error) {
    console.error('[Service Worker] Erro ao sincronizar:', error);
  }
}
