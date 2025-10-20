// Service Worker para cache inteligente
// Versión del cache - incrementar cuando se actualice el contenido
const CACHE_VERSION = 'v1.0.1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// Recursos estáticos para cachear inmediatamente
const STATIC_ASSETS = [
  '/',
  '/vite.svg',
  '/logocesar.svg',
  '/mia (1).webp',
  '/robots.txt',
  '/sitemap.xml',
  // Agregar otros recursos críticos aquí
];

// Patrones de URLs para diferentes estrategias de cache
const CACHE_STRATEGIES = {
  // Cache First - para recursos estáticos
  STATIC: [
    /\.(js|css|woff2?|ttf|eot)$/,
    /\/assets\//,
  ],
  
  // Network First - para contenido dinámico
  DYNAMIC: [
    /\/api\//,
    /\/admin\//,
  ],
  
  // Cache First con fallback - para imágenes
  IMAGES: [
    /\.(png|jpg|jpeg|gif|webp|avif|svg)$/,
    /\/images\//,
  ],
};

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar caches antiguos
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar requests HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determinar estrategia de cache
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (isImage(request.url)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
  } else if (isDynamicContent(request.url)) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
  } else {
    // Estrategia por defecto: Network First
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
  }
});

// Estrategia Cache First
async function cacheFirstStrategy(request, cacheName) {
  // No cachear solicitudes que no sean GET
  if (request.method !== 'GET') {
    return fetch(request);
  }

  try {
    // Buscar en cache primero
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Si no está en cache, hacer request de red
    const networkResponse = await fetch(request);
    
    // Cachear la respuesta si es exitosa
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache First Strategy failed:', error);
    
    // Fallback para imágenes
    if (isImage(request.url)) {
      return new Response(
        '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Imagen no disponible</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

// Estrategia Network First
async function networkFirstStrategy(request, cacheName) {
  // No cachear solicitudes que no sean GET
  if (request.method !== 'GET') {
    return fetch(request);
  }

  try {
    // Intentar red primero
    const networkResponse = await fetch(request);
    
    // Cachear respuesta exitosa
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    
    // Fallback a cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si no hay cache, mostrar página offline
    if (request.destination === 'document') {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Sin conexión</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
            .offline { max-width: 400px; margin: 0 auto; }
            h1 { color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="offline">
            <h1>Sin conexión</h1>
            <p>No se pudo cargar la página. Verifica tu conexión a internet.</p>
            <button onclick="window.location.reload()">Reintentar</button>
          </div>
        </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    
    throw error;
  }
}

// Funciones de utilidad para determinar tipo de recurso
function isStaticAsset(url) {
  return CACHE_STRATEGIES.STATIC.some(pattern => pattern.test(url));
}

function isImage(url) {
  return CACHE_STRATEGIES.IMAGES.some(pattern => pattern.test(url));
}

function isDynamicContent(url) {
  return CACHE_STRATEGIES.DYNAMIC.some(pattern => pattern.test(url));
}

// Limpiar cache periódicamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});