// Service Worker - Sabores de México
// Cambia este número cada vez que subas una actualización
const VERSION = 'v19-05-2026';
const CACHE = 'sabores-' + VERSION;

self.addEventListener('message', function(e){
  if(e.data && e.data.action === 'skipWaiting'){
    self.skipWaiting();
  }
});

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e){
  // Always fetch fresh from network for HTML files
  if(e.request.url.includes('index.html') || 
     e.request.mode === 'navigate'){
    e.respondWith(
      fetch(e.request).catch(function(){
        return caches.match(e.request);
      })
    );
    return;
  }
  // Cache first for other assets
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(response){
        return caches.open(CACHE).then(function(cache){
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});
