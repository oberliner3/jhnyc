"use client";

import { useEffect } from "react";
import { InstallPrompt } from "./install-prompt";

export function PWAProvider({ children }: { children: React.ReactNode }) {
	// useEffect(() => {
	// 	// Register service worker
	// 	if ("serviceWorker" in navigator) {
	// 		const registerSW = async () => {
	// 			try {
	// 				const registration = await navigator.serviceWorker.register("/sw.js");
	// 				console.log("Service Worker registered successfully:", registration);

	// 				// Check for updates
	// 				registration.addEventListener("updatefound", () => {
	// 					const newWorker = registration.installing;
	// 					if (newWorker) {
	// 						newWorker.addEventListener("statechange", () => {
	// 							if (
	// 								newWorker.state === "installed" &&
	// 								navigator.serviceWorker.controller
	// 							) {
	// 								// New content is available, show update notification
	// 								console.log("New content available, please refresh");
	// 							}
	// 						});
	// 					}
	// 				});
	// 			} catch (error) {
	// 				console.error("Service Worker registration failed:", error);
	// 			}
	// 		};

	// 		// Register after a short delay to not block initial page load
	// 		setTimeout(registerSW, 1000);
	// 	}

	// 	// Request notification permission
	// 	if ("Notification" in window && Notification.permission === "default") {
	// 		Notification.requestPermission().then((permission) => {
	// 			if (permission === "granted") {
	// 				console.log("Notification permission granted");
	// 			}
	// 		});
	// 	}

	// 	// Handle online/offline events
	// 	const handleOnline = () => {
	// 		console.log("App is back online");
	// 		// You could show a toast notification here
	// 	};

	// 	const handleOffline = () => {
	// 		console.log("App is offline");
	// 		// You could show a toast notification here
	// 	};

	// 	window.addEventListener("online", handleOnline);
	// 	window.addEventListener("offline", handleOffline);

	// 	return () => {
	// 		window.removeEventListener("online", handleOnline);
	// 		window.removeEventListener("offline", handleOffline);
	// 	};
	// }, []);

	return (
		<>
			{children}
			<InstallPrompt />
		</>
	);
}
