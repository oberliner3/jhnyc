"use client";

import {
	CheckCircle,
	Clock,
	Home,
	RefreshCw,
	ShoppingBag,
	Wifi,
	WifiOff,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OfflinePage() {
	const [isOnline, setIsOnline] = useState(false);
	const [lastOnline, setLastOnline] = useState<Date | null>(null);

	useEffect(() => {
		// Check initial online status
		setIsOnline(navigator.onLine);
		setLastOnline(new Date());

		// Listen for online/offline events
		const handleOnline = () => {
			setIsOnline(true);
			setLastOnline(new Date());
		};

		const handleOffline = () => {
			setIsOnline(false);
		};

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	const handleRetry = () => {
		if (isOnline) {
			window.location.reload();
		}
	};

	return (
		<div className="px-4 py-8 max-w-2xl container">
			<div className="mb-8 text-center">
				<div className="flex justify-center items-center bg-gray-100 mx-auto mb-6 rounded-full w-20 h-20">
					{isOnline ? (
						<Wifi className="w-10 h-10 text-green-600" />
					) : (
						<WifiOff className="w-10 h-10 text-gray-400" />
					)}
				</div>

				<h1 className="mb-2 font-bold text-gray-900 text-3xl">
					{isOnline ? "You&apos;re Back Online!" : "You&apos;re Offline"}
				</h1>

				<p className="mb-4 text-gray-600">
					{isOnline
						? "Your connection has been restored. You can now browse our store normally."
						: "It looks like you&apos;re not connected to the internet. Don&apos;t worry, you can still browse some content."}
				</p>

				<div className="flex justify-center items-center gap-2 mb-6">
					<Badge variant={isOnline ? "default" : "secondary"}>
						{isOnline ? (
							<>
								<CheckCircle className="mr-1 w-3 h-3" />
								Online
							</>
						) : (
							<>
								<Clock className="mr-1 w-3 h-3" />
								Offline
							</>
						)}
					</Badge>
					{lastOnline && (
						<span className="text-gray-500 text-sm">
							Last online: {lastOnline.toLocaleTimeString()}
						</span>
					)}
				</div>
			</div>

			<div className="space-y-6">
				{/* Connection Status Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							{isOnline ? (
								<Wifi className="w-5 h-5" />
							) : (
								<WifiOff className="w-5 h-5" />
							)}
							Connection Status
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-gray-600 text-sm">
									Internet Connection
								</span>
								<Badge variant={isOnline ? "default" : "destructive"}>
									{isOnline ? "Connected" : "Disconnected"}
								</Badge>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-gray-600 text-sm">App Status</span>
								<Badge variant="secondary">Limited Functionality</Badge>
							</div>

							{!isOnline && (
								<div className="bg-yellow-50 p-3 border border-yellow-200 rounded-md">
									<p className="text-yellow-800 text-sm">
										Some features may not be available while offline. Your data
										will sync when you&apos;re back online.
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Available Actions */}
				<Card>
					<CardHeader>
						<CardTitle>What You Can Do</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{isOnline ? (
								<>
									<div className="flex items-center gap-3 bg-green-50 p-3 border border-green-200 rounded-md">
										<CheckCircle className="w-5 h-5 text-green-600" />
										<div>
											<p className="font-medium text-green-900">
												Full Access Restored
											</p>
											<p className="text-green-700 text-sm">
												You can now browse, shop, and use all features.
											</p>
										</div>
									</div>

									<div className="flex gap-3">
										<Button onClick={handleRetry} className="flex-1">
											<RefreshCw className="mr-2 w-4 h-4" />
											Refresh Page
										</Button>
										<Button variant="outline" asChild className="flex-1">
											<Link href="/">
												<Home className="mr-2 w-4 h-4" />
												Go Home
											</Link>
										</Button>
									</div>
								</>
							) : (
								<>
									<div className="space-y-3">
										<div className="flex items-center gap-3 bg-blue-50 p-3 border border-blue-200 rounded-md">
											<ShoppingBag className="w-5 h-5 text-blue-600" />
											<div>
												<p className="font-medium text-blue-900">
													Browse Cached Content
												</p>
												<p className="text-blue-700 text-sm">
													View previously loaded pages and products.
												</p>
											</div>
										</div>

										<div className="flex items-center gap-3 bg-gray-50 p-3 border border-gray-200 rounded-md">
											<Clock className="w-5 h-5 text-gray-600" />
											<div>
												<p className="font-medium text-gray-900">
													Offline Mode
												</p>
												<p className="text-gray-700 text-sm">
													Some features are limited without internet.
												</p>
											</div>
										</div>
									</div>

									<div className="flex gap-3">
										<Button
											onClick={handleRetry}
											variant="outline"
											className="flex-1"
										>
											<RefreshCw className="mr-2 w-4 h-4" />
											Try Again
										</Button>
										<Button asChild className="flex-1">
											<Link href="/">
												<Home className="mr-2 w-4 h-4" />
												Go Home
											</Link>
										</Button>
									</div>
								</>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Troubleshooting Tips */}
				{!isOnline && (
					<Card>
						<CardHeader>
							<CardTitle>Troubleshooting Tips</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3 text-sm">
								<div className="flex items-start gap-3">
									<div className="flex flex-shrink-0 justify-center items-center bg-gray-100 mt-0.5 rounded-full w-6 h-6">
										<span className="font-medium text-xs">1</span>
									</div>
									<div>
										<p className="font-medium">Check Your Connection</p>
										<p className="text-gray-600">
											Make sure your device is connected to Wi-Fi or mobile
											data.
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="flex flex-shrink-0 justify-center items-center bg-gray-100 mt-0.5 rounded-full w-6 h-6">
										<span className="font-medium text-xs">2</span>
									</div>
									<div>
										<p className="font-medium">Try Refreshing</p>
										<p className="text-gray-600">
											Sometimes a simple refresh can restore your connection.
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="flex flex-shrink-0 justify-center items-center bg-gray-100 mt-0.5 rounded-full w-6 h-6">
										<span className="font-medium text-xs">3</span>
									</div>
									<div>
										<p className="font-medium">Check Other Apps</p>
										<p className="text-gray-600">
											See if other apps can access the internet to diagnose the
											issue.
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
