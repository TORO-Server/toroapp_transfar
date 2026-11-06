
// ServiceWorker処理：https://developers.google.com/web/fundamentals/primers/service-workers/?hl=ja

// キャッシュ名とキャッシュファイルの指定
// ファイルを変えたら番号を上げる (古いキャッシュは activate で消える)
var CACHE_NAME = 'toroapp-transfar-v1';
// 自サイトのキャッシュ名の接頭辞 (activate で消すのはこの接頭辞のものだけ)
var CACHE_PREFIX = 'toroapp-transfar-';
var urlsToCache = [
	'./',
	'./sheet.css',
	'./script.js',
	'./manifest.json',
	'./images/location.png',
	'./images/app-icon-192.png',
	'./images/app-icon-512x512.png'
];

// インストール処理
self.addEventListener('install', function(event) {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then(function(cache) {
				return cache.addAll(urlsToCache);
			})
			.then(function() {
				return self.skipWaiting();
			})
	);
});

// 古いキャッシュの削除
self.addEventListener('activate', function(event) {
	event.waitUntil(
		caches
			.keys()
			.then(function(names) {
				return Promise.all(names.filter(function(name) {
					return name.indexOf(CACHE_PREFIX) === 0 && name !== CACHE_NAME;
				}).map(function(name) {
					return caches.delete(name);
				}));
			})
			.then(function() {
				return self.clients.claim();
			})
	);
});

// リソースフェッチ時の処理：ネットワーク優先、つながらないときだけキャッシュ
// (修正したファイルがすぐ届くように。経路検索 API など別のオリジンには触らない)
self.addEventListener('fetch', function(event) {
	if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) {
		return;
	}
	event.respondWith(
		fetch(event.request)
			.then(function(response) {
				if (response.ok && response.type === 'basic') {
					var copy = response.clone();
					event.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
						return cache.put(event.request, copy);
					}));
				}
				return response;
			})
			.catch(function() {
				return caches.match(event.request);
			})
	);
});
