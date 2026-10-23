/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'multi-timer-cache-v4';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './favicon.svg',
  './logo192.png',
  './logo512.png',
];
const FONT_CSS_URLS = [
  'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap',
];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const PASSTHROUGH_HOSTS = ['time100.ru'];

function isFontRequest(url) {
  return FONT_HOSTS.includes(url.hostname);
}

function isPassthrough(url) {
  return PASSTHROUGH_HOSTS.some(
    (host) => url.hostname === host || url.hostname.endsWith('.' + host)
  );
}

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isHashedAsset(url) {
  return url.pathname.includes('/static/') || /\.[0-9a-f]{8}\./.test(url.pathname);
}

function manifestUrls(manifest) {
  const files = manifest && manifest.files ? manifest.files : manifest;
  if (!files || typeof files !== 'object') {
    return [];
  }
  return Object.values(files).filter((url) => (
    typeof url === 'string'
    && !url.endsWith('.map')
    && !url.includes('LICENSE')
  ));
}

function asCacheableResponse(response) {
  if (!response || (!response.ok && response.type !== 'opaque')) {
    return null;
  }
  if (!response.redirected) {
    return response.clone();
  }
  return new Response(response.clone().body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

async function putInCache(cache, request, response) {
  const cacheable = asCacheableResponse(response);
  if (!cacheable) {
    return;
  }
  try {
    await cache.put(request, cacheable);
  } catch (error) {
    // Ignore responses the Cache API rejects.
  }
}

async function cacheUrls(cache, urls) {
  await Promise.all([...urls].map(async (url) => {
    const response = await fetch(url, { cache: 'reload', credentials: 'same-origin' });
    if (!response.ok) {
      throw new Error('Failed to cache ' + url + ': ' + response.status);
    }
    await putInCache(cache, url, response);
  }));
}

async function precacheFonts(cache) {
  await Promise.all(FONT_CSS_URLS.map(async (cssUrl) => {
    try {
      const response = await fetch(cssUrl);
      await putInCache(cache, cssUrl, response);
      if (!response.ok) {
        return;
      }
      const css = await response.clone().text();
      const fontUrls = [...css.matchAll(/url\(([^)]+)\)/g)]
        .map((match) => match[1].replace(/['"]/g, '').trim())
        .filter((fontUrl) => fontUrl.startsWith('https://fonts.gstatic.com'));
      await Promise.all(fontUrls.map(async (fontUrl) => {
        const fontResponse = await fetch(fontUrl);
        await putInCache(cache, fontUrl, fontResponse);
      }));
    } catch (error) {
      // Fonts must not block the app shell from installing.
    }
  }));
}

async function precacheApp() {
  const cache = await caches.open(CACHE_NAME);
  const urls = new Set(APP_SHELL);

  const manifestResponse = await fetch('./asset-manifest.json', {
    cache: 'reload',
    credentials: 'same-origin',
  });
  if (!manifestResponse.ok) {
    throw new Error('Failed to fetch asset-manifest.json: ' + manifestResponse.status);
  }
  await putInCache(cache, './asset-manifest.json', manifestResponse);
  const manifest = await manifestResponse.json();
  manifestUrls(manifest).forEach((url) => urls.add(url));

  await cacheUrls(cache, urls);
  await precacheFonts(cache);
}

async function refreshIfUpdated() {
  const cache = await caches.open(CACHE_NAME);
  const response = await fetch('./asset-manifest.json', {
    cache: 'reload',
    credentials: 'same-origin',
  });
  if (!response.ok) {
    return;
  }
  const freshManifest = await response.clone().text();
  const cachedManifestResponse = await cache.match('./asset-manifest.json');
  const cachedManifest = cachedManifestResponse ? await cachedManifestResponse.text() : '';
  if (freshManifest === cachedManifest) {
    return;
  }
  await precacheApp();
}

async function matchCached(request) {
  const cache = await caches.open(CACHE_NAME);
  const direct = await cache.match(request, { ignoreSearch: true });
  if (direct) {
    return direct;
  }
  const isNavigation = request.mode === 'navigate'
    || (request.headers.get('accept') || '').includes('text/html');
  if (isNavigation) {
    return (await cache.match('./index.html')) || (await cache.match('./'));
  }
  return undefined;
}

async function staleWhileRevalidate(request, event) {
  const cached = await matchCached(request);
  const networkPromise = fetch(request)
    .then(async (response) => {
      const cache = await caches.open(CACHE_NAME);
      await putInCache(cache, request, response);
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    if (event) {
      event.waitUntil(networkPromise);
    }
    return cached;
  }

  const network = await networkPromise;
  if (network) {
    return network;
  }
  return Response.error();
}

async function cacheFirst(request) {
  const cached = await matchCached(request);
  if (cached) {
    return cached;
  }
  const response = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  await putInCache(cache, request, response);
  return response;
}

async function handleNavigate(event) {
  const cached = await matchCached(event.request);
  const refreshPromise = refreshIfUpdated().catch(() => {});
  if (cached) {
    event.waitUntil(refreshPromise);
    return cached;
  }
  await refreshPromise;
  return (await matchCached(event.request)) || fetch(event.request);
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheApp().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }
  if (isPassthrough(url)) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      handleNavigate(event).catch(() => matchCached(event.request))
    );
    return;
  }

  if (isFontRequest(url)) {
    event.respondWith(
      staleWhileRevalidate(event.request, event)
        .catch(() => matchCached(event.request))
    );
    return;
  }

  if (!isSameOrigin(url)) {
    return;
  }

  if (isHashedAsset(url)) {
    event.respondWith(
      cacheFirst(event.request).catch(() => matchCached(event.request))
    );
    return;
  }

  event.respondWith(
    staleWhileRevalidate(event.request, event)
      .catch(() => matchCached(event.request))
  );
});
