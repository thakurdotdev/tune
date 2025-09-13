// Service Worker for Tune Music App
const CACHE_NAME = 'tune-music-v1';
const STATIC_CACHE_URLS = ['/', '/manifest.json', '/logo.png', '/_next/static/css/app/globals.css'];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, return offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Background sync for music playback
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle background music synchronization
  return fetch('/api/sync-playback', {
    method: 'POST',
    body: JSON.stringify({
      action: 'sync',
      timestamp: Date.now(),
    }),
  });
}

// Message handling for music controls
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'PLAY_MUSIC':
      handlePlayMusic(data);
      break;
    case 'PAUSE_MUSIC':
      handlePauseMusic(data);
      break;
    case 'NEXT_TRACK':
      handleNextTrack(data);
      break;
    case 'PREVIOUS_TRACK':
      handlePreviousTrack(data);
      break;
  }
});

// Music control handlers
function handlePlayMusic(data) {
  // Send message to all clients
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'MUSIC_CONTROL',
        action: 'play',
        data: data,
      });
    });
  });
}

function handlePauseMusic(data) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'MUSIC_CONTROL',
        action: 'pause',
        data: data,
      });
    });
  });
}

function handleNextTrack(data) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'MUSIC_CONTROL',
        action: 'next',
        data: data,
      });
    });
  });
}

function handlePreviousTrack(data) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'MUSIC_CONTROL',
        action: 'previous',
        data: data,
      });
    });
  });
}

// Push notifications for music updates
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'music-notification',
      actions: [
        {
          action: 'play',
          title: 'Play',
          icon: '/logo.png',
        },
        {
          action: 'skip',
          title: 'Skip',
          icon: '/logo.png',
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'play') {
    // Handle play action
    self.clients.matchAll().then((clients) => {
      if (clients.length > 0) {
        clients[0].postMessage({
          type: 'MUSIC_CONTROL',
          action: 'play',
        });
        clients[0].focus();
      } else {
        self.clients.openWindow('/');
      }
    });
  } else if (event.action === 'skip') {
    // Handle skip action
    self.clients.matchAll().then((clients) => {
      if (clients.length > 0) {
        clients[0].postMessage({
          type: 'MUSIC_CONTROL',
          action: 'next',
        });
      }
    });
  } else {
    // Default action - open app
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        if (clients.length > 0) {
          clients[0].focus();
        } else {
          self.clients.openWindow('/');
        }
      })
    );
  }
});
