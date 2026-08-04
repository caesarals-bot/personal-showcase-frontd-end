// Service Worker para cache inteligente
// Versión del cache - incrementar cuando se actualice el contenido
const CACHE_VERSION = 'v1.0.3';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// Recursos estáticos para cachear inmediatamente (nombres con hash o inmutables).
// NO incluir el HTML de la app: la navegación siempre va a red para recibir la
// última versión desplegada.
const STATIC_ASSETS = [
  '/vite.svg',
  '/logocesar.svg',
  '/mia (1).webp',
  '/robots.txt',
  '/sitemap.xml',
];

// Patrones de URLs para diferentes estrategias de cache
const CACHE_STRATEGIES = {
  // Cache First - para recursos estáticos
  STATIC: [
    /\.(js|css|woff2?|ttf|eot)$/,
    /\/assets\//,
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

  // Dejar que el navegador maneje de forma directa y siempre fresca:
  //  1. Cualquier origen externo (Google reCAPTCHA / Fonts / UserContent,
  //     DiceBear, Firestore, etc.). No cachearlos evita errores de streaming
  //     y errores cross-origin.
  //  2. Navegaciones de documentos (HTML / SPA). Al no interceptarlas, el
  //     usuario SIEMPRE recibe la última versión desplegada, sin versiones
  //     viejas cacheadas, y no se generan errores "Failed to fetch" al
  //     navegar entre rutas.
  //  3. Requests que no sean GET.
  if (
    url.origin !== self.location.origin ||
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    request.method !== 'GET'
  ) {
    return;
  }

  // Determinar estrategia de cache solo para assets estáticos e imágenes
  // del propio sitio (nombres con hash, inmutables).
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (isImage(request.url)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
  } else {
    // Cualquier otra cosa del mismo origen (APIs, funciones Netlify, datos
    // dinámicos) se resuelve SIEMPRE por red, sin cachear ni interceptar.
    // Así la disponibilidad de la agenda y los datos siempre son frescos.
    return;
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

// Función de utilidad para determinar tipo de recurso
function isStaticAsset(url) {
  return CACHE_STRATEGIES.STATIC.some(pattern => pattern.test(url));
}

function isImage(url) {
  return CACHE_STRATEGIES.IMAGES.some(pattern => pattern.test(url));
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