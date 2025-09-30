// Service Worker for Originz PWA
const STATIC_CACHE = "originz-static-v1";
const DYNAMIC_CACHE = "originz-dynamic-v1";

// Assets to cache on install
const STATIC_ASSETS = [
	"/",
	"/products",
	"/cart",
	"/account",
	"/offline",
	"/manifest.webmanifest",
	"/web-app-manifest-192x192.png",
	"/web-app-manifest-512x512.png",
	"/og.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
	console.log("Service Worker installing...");
	event.waitUntil(
		caches
			.open(STATIC_CACHE)
			.then((cache) => {
				console.log("Caching static assets");
				return cache.addAll(STATIC_ASSETS);
			})
			.then(() => {
				console.log("Static assets cached successfully");
				return self.skipWaiting();
			})
			.catch((error) => {
				console.error("Failed to cache static assets:", error);
			}),
	);
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
	console.log("Service Worker activating...");
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames
						.filter(
							(cacheName) =>
								cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE,
						)
						.map((cacheName) => {
							console.log("Deleting old cache:", cacheName);
							return caches.delete(cacheName);
						}),
				);
			})
			.then(() => {
				console.log("Service Worker activated");
				return self.clients.claim();
			}),
	);
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Skip non-GET requests
	if (request.method !== "GET") {
		return;
	}

	// Skip chrome-extension and other non-http requests
	if (!url.protocol.startsWith("http")) {
		return;
	}

	// Handle different types of requests
	if (url.pathname.startsWith("/api/")) {
		// API requests - Network first, then cache
		event.respondWith(networkFirstStrategy(request));
	} else if (
		url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2)$/)
	) {
		// Static assets - Cache first, then network
		event.respondWith(cacheFirstStrategy(request));
	} else if (
		url.pathname.startsWith("/products/") ||
		url.pathname.startsWith("/account/")
	) {
		// Dynamic pages - Stale while revalidate
		event.respondWith(staleWhileRevalidateStrategy(request));
	} else {
		// Default - Network first
		event.respondWith(networkFirstStrategy(request));
	}
});

// Cache First Strategy - for static assets
async function cacheFirstStrategy(request) {
	try {
		const cachedResponse = await caches.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}

		const networkResponse = await fetch(request);
		if (networkResponse.ok) {
			const cache = await caches.open(STATIC_CACHE);
			cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch (error) {
		console.error("Cache first strategy failed:", error);
		return new Response("Asset not available offline", { status: 404 });
	}
}

// Network First Strategy - for API calls
async function networkFirstStrategy(request) {
	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok) {
			const cache = await caches.open(DYNAMIC_CACHE);
			cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch (error) {
		console.log("Network failed, trying cache:", error);
		const cachedResponse = await caches.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}

		// Return offline page for navigation requests
		if (request.mode === "navigate") {
			return caches.match("/offline");
		}

		return new Response("Content not available offline", { status: 404 });
	}
}

// Stale While Revalidate Strategy - for dynamic pages
async function staleWhileRevalidateStrategy(request) {
	const cache = await caches.open(DYNAMIC_CACHE);
	const cachedResponse = await cache.match(request);

	const fetchPromise = fetch(request)
		.then((networkResponse) => {
			if (networkResponse.ok) {
				cache.put(request, networkResponse.clone());
			}
			return networkResponse;
		})
		.catch(() => {
			// If network fails, return cached version
			return cachedResponse;
		});

	return cachedResponse || fetchPromise;
}

// Background Sync for offline actions
self.addEventListener("sync", (event) => {
	console.log("Background sync triggered:", event.tag);

	if (event.tag === "cart-sync") {
		event.waitUntil(syncCartData());
	} else if (event.tag === "order-sync") {
		event.waitUntil(syncOrderData());
	}
});

// Sync cart data when back online
async function syncCartData() {
	try {
		// Get pending cart items from IndexedDB
		const pendingItems = await getPendingCartItems();

		for (const item of pendingItems) {
			try {
				const response = await fetch("/api/cart/items", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(item),
				});

				if (response.ok) {
					// Remove from pending items
					await removePendingCartItem(item.id);
				}
			} catch (error) {
				console.error("Failed to sync cart item:", error);
			}
		}
	} catch (error) {
		console.error("Cart sync failed:", error);
	}
}

// Sync order data when back online
async function syncOrderData() {
	try {
		// Get pending orders from IndexedDB
		const pendingOrders = await getPendingOrders();

		for (const order of pendingOrders) {
			try {
				const response = await fetch("/api/orders", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(order),
				});

				if (response.ok) {
					// Remove from pending orders
					await removePendingOrder(order.id);
				}
			} catch (error) {
				console.error("Failed to sync order:", error);
			}
		}
	} catch (error) {
		console.error("Order sync failed:", error);
	}
}

// Push notification handling
self.addEventListener("push", (event) => {
	console.log("Push notification received:", event);

	const options = {
		body: event.data ? event.data.text() : "New notification from Originz",
		icon: "/icons/icon-192x192.png",
		badge: "/icons/badge-72x72.png",
		vibrate: [100, 50, 100],
		data: {
			dateOfArrival: Date.now(),
			primaryKey: 1,
		},
		actions: [
			{
				action: "explore",
				title: "View Details",
				icon: "/icons/checkmark.png",
			},
			{
				action: "close",
				title: "Close",
				icon: "/icons/xmark.png",
			},
		],
	};

	event.waitUntil(self.registration.showNotification("Originz", options));
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
	console.log("Notification clicked:", event);

	event.notification.close();

	if (event.action === "explore") {
		event.waitUntil(clients.openWindow("/"));
	} else if (event.action === "close") {
		// Just close the notification
		return;
	} else {
		// Default action - open the app
		event.waitUntil(clients.openWindow("/"));
	}
});

// Helper functions for IndexedDB operations
async function getPendingCartItems() {
	// In a real implementation, you would use IndexedDB
	// For now, return empty array
	return [];
}

async function removePendingCartItem(id) {
	// In a real implementation, you would remove from IndexedDB
	console.log("Removing pending cart item:", id);
}

async function getPendingOrders() {
	// In a real implementation, you would use IndexedDB
	// For now, return empty array
	return [];
}

async function removePendingOrder(id) {
	// In a real implementation, you would remove from IndexedDB
	console.log("Removing pending order:", id);
}
