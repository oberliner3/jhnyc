"use client";
import { useEffect } from "react";

export default function DebugTracker() {
	useEffect(() => {
		// Track all errors
		const originalError = console.error;
		console.error = function (...args) {
			console.log("🚨 Console Error Intercepted:", args);
			originalError.apply(console, args);
		};

		// Track unhandled promise rejections
		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			console.error("🚨 Unhandled Promise Rejection:", event.reason);
			console.error("🚨 Promise:", event.promise);
		};

		// Track general errors
		const handleError = (event: ErrorEvent) => {
			console.error("🚨 Global Error:", {
				message: event.message,
				filename: event.filename,
				lineno: event.lineno,
				colno: event.colno,
				error: event.error,
			});
		};

		window.addEventListener("unhandledrejection", handleUnhandledRejection);
		window.addEventListener("error", handleError);

		return () => {
			console.error = originalError;
			window.removeEventListener(
				"unhandledrejection",
				handleUnhandledRejection,
			);
			window.removeEventListener("error", handleError);
		};
	}, []);

	return null; // This component doesn't render anything
}
