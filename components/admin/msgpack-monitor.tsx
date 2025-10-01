"use client";

import { useEffect, useState } from "react";
import { getLoadingMetrics, clearMetrics } from "@/lib/msgpack-loader";
import { Button } from "@/components/ui/button";

interface MetricsState {
	total: number;
	messagePackUsage: number;
	averageSize: { json: number; msgpack: number };
	averageTime: { json: number; msgpack: number };
	averageCompression: number;
	lastUpdate: Date;
}

export function MessagePackMonitor() {
	const [metrics, setMetrics] = useState<MetricsState | null>(null);
	const [isVisible, setIsVisible] = useState(false);

	const updateMetrics = () => {
		const currentMetrics = getLoadingMetrics();
		setMetrics({
			...currentMetrics,
			lastUpdate: new Date(),
		});
	};

	const handleClearMetrics = () => {
		clearMetrics();
		updateMetrics();
	};

	useEffect(() => {
		// Update metrics every 5 seconds
		const interval = setInterval(updateMetrics, 5000);
		
		// Initial update
		updateMetrics();

		return () => clearInterval(interval);
	}, []);

	// Only show in development or when explicitly enabled
	useEffect(() => {
		const isDev = process.env.NODE_ENV === "development";
		const isEnabled = localStorage.getItem("msgpack_monitor") === "true";
		setIsVisible(isDev || isEnabled);
	}, []);

	if (!isVisible || !metrics) {
		return null;
	}

	const formatBytes = (bytes: number): string => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
	};

	const formatTime = (ms: number): string => {
		return `${ms.toFixed(1)}ms`;
	};

	const formatPercentage = (value: number): string => {
		return `${(value * 100).toFixed(1)}%`;
	};

	const getSavings = (): string => {
		if (metrics.averageSize.json === 0 || metrics.averageSize.msgpack === 0) {
			return "N/A";
		}
		const savings = ((metrics.averageSize.json - metrics.averageSize.msgpack) / metrics.averageSize.json) * 100;
		return `${savings.toFixed(1)}%`;
	};

	return (
		<div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm">
			<div className="flex items-center justify-between mb-3">
				<h3 className="font-semibold text-sm">📦 MessagePack Monitor</h3>
				<div className="flex gap-2">
					<Button
						onClick={updateMetrics}
						variant="outline"
						size="sm"
						className="px-2 py-1 text-xs"
					>
						🔄
					</Button>
					<Button
						onClick={handleClearMetrics}
						variant="outline"
						size="sm"
						className="px-2 py-1 text-xs"
					>
						🗑️
					</Button>
					<Button
						onClick={() => setIsVisible(false)}
						variant="outline"
						size="sm"
						className="px-2 py-1 text-xs"
					>
						×
					</Button>
				</div>
			</div>

			<div className="space-y-2 text-xs">
				<div className="flex justify-between">
					<span className="text-gray-600 dark:text-gray-400">Total Requests:</span>
					<span className="font-mono">{metrics.total}</span>
				</div>
				
				<div className="flex justify-between">
					<span className="text-gray-600 dark:text-gray-400">MessagePack Usage:</span>
					<span className="font-mono">{formatPercentage(metrics.messagePackUsage)}</span>
				</div>

				<div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
					<div className="text-gray-700 dark:text-gray-300 font-medium mb-1">Size Comparison:</div>
					<div className="flex justify-between">
						<span className="text-gray-600 dark:text-gray-400">JSON Avg:</span>
						<span className="font-mono">{formatBytes(metrics.averageSize.json)}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-gray-600 dark:text-gray-400">MessagePack Avg:</span>
						<span className="font-mono">{formatBytes(metrics.averageSize.msgpack)}</span>
					</div>
					<div className="flex justify-between font-medium text-green-600 dark:text-green-400">
						<span>Savings:</span>
						<span className="font-mono">{getSavings()}</span>
					</div>
				</div>

				<div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
					<div className="text-gray-700 dark:text-gray-300 font-medium mb-1">Performance:</div>
					<div className="flex justify-between">
						<span className="text-gray-600 dark:text-gray-400">JSON Time:</span>
						<span className="font-mono">{formatTime(metrics.averageTime.json)}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-gray-600 dark:text-gray-400">MessagePack Time:</span>
						<span className="font-mono">{formatTime(metrics.averageTime.msgpack)}</span>
					</div>
					{metrics.averageCompression > 1 && (
						<div className="flex justify-between font-medium text-blue-600 dark:text-blue-400">
							<span>Compression:</span>
							<span className="font-mono">{metrics.averageCompression.toFixed(2)}x</span>
						</div>
					)}
				</div>

				<div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
					Last updated: {metrics.lastUpdate.toLocaleTimeString()}
				</div>
			</div>
		</div>
	);
}

// Hook to enable/disable the monitor
export function useMessagePackMonitor() {
	const enableMonitor = () => {
		localStorage.setItem("msgpack_monitor", "true");
		window.location.reload();
	};

	const disableMonitor = () => {
		localStorage.setItem("msgpack_monitor", "false");
		window.location.reload();
	};

	return {
		enableMonitor,
		disableMonitor,
		isEnabled: typeof window !== "undefined" && localStorage.getItem("msgpack_monitor") === "true",
	};
}