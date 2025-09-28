"use client";

import { Download, Shield, Smartphone, Wifi, X, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
	readonly platforms: string[];
	readonly userChoice: Promise<{
		outcome: "accepted" | "dismissed";
		platform: string;
	}>;
	prompt(): Promise<void>;
}

export function InstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [showInstallPrompt, setShowInstallPrompt] = useState(false);
	const [isInstalled, setIsInstalled] = useState(false);
	const [isIOS, setIsIOS] = useState(false);
	const [isStandalone, setIsStandalone] = useState(false);

	useEffect(() => {
		// Check if app is already installed
		const checkInstalled = () => {
			if (window.matchMedia("(display-mode: standalone)").matches) {
				setIsInstalled(true);
				setIsStandalone(true);
				return;
			}

			// Check for iOS
			const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
			setIsIOS(iOS);

			if (iOS) {
				// Check if already added to home screen
				const isInStandaloneMode =
					"standalone" in window.navigator &&
					(window.navigator as { standalone?: boolean }).standalone;
				if (isInStandaloneMode) {
					setIsInstalled(true);
					setIsStandalone(true);
				}
			}
		};

		checkInstalled();

		// Listen for beforeinstallprompt event
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);

			// Show install prompt after a delay
			setTimeout(() => {
				if (!isInstalled && !isStandalone) {
					setShowInstallPrompt(true);
				}
			}, 3000); // Show after 3 seconds
		};

		// Listen for appinstalled event
		const handleAppInstalled = () => {
			setIsInstalled(true);
			setShowInstallPrompt(false);
			setDeferredPrompt(null);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		window.addEventListener("appinstalled", handleAppInstalled);

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt,
			);
			window.removeEventListener("appinstalled", handleAppInstalled);
		};
	}, [isInstalled, isStandalone]);

	const handleInstallClick = async () => {
		if (!deferredPrompt) return;

		try {
			await deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;

			if (outcome === "accepted") {
				console.log("User accepted the install prompt");
			} else {
				console.log("User dismissed the install prompt");
			}

			setDeferredPrompt(null);
			setShowInstallPrompt(false);
		} catch (error) {
			console.error("Error showing install prompt:", error);
		}
	};

	const handleDismiss = () => {
		setShowInstallPrompt(false);
		// Don't show again for this session
		sessionStorage.setItem("install-prompt-dismissed", "true");
	};

	// Don't show if already installed or dismissed
	if (isInstalled || isStandalone || !showInstallPrompt) {
		return null;
	}

	// Check if user dismissed in this session
	if (
		typeof window !== "undefined" &&
		sessionStorage.getItem("install-prompt-dismissed")
	) {
		return null;
	}

	return (
		<div className="right-4 md:right-4 bottom-4 left-4 md:left-auto z-50 fixed md:max-w-sm">
			<Card className="shadow-lg border-2 border-primary/20">
				<CardHeader className="pb-3">
					<div className="flex justify-between items-center">
						<CardTitle className="flex items-center gap-2 text-lg">
							<Download className="w-5 h-5 text-primary" />
							Install App
						</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleDismiss}
							className="p-0 w-8 h-8"
						>
							<X className="w-4 h-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-gray-600 text-sm">
						Install Originz for a better shopping experience with faster access
						and offline support.
					</p>

					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm">
							<Zap className="w-4 h-4 text-yellow-500" />
							<span>Faster loading and navigation</span>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<Wifi className="w-4 h-4 text-blue-500" />
							<span>Works offline with cached content</span>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<Shield className="w-4 h-4 text-green-500" />
							<span>Secure and private browsing</span>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<Smartphone className="w-4 h-4 text-purple-500" />
							<span>Native app-like experience</span>
						</div>
					</div>

					{isIOS ? (
						<div className="space-y-3">
							<div className="bg-blue-50 p-3 border border-blue-200 rounded-md">
								<p className="mb-2 font-medium text-blue-800 text-sm">
									How to install on iOS:
								</p>
								<ol className="space-y-1 text-blue-700 text-xs">
									<li>1. Tap the Share button in Safari</li>
									<li>2. Scroll down and tap &quot;Add to Home Screen&quot;</li>
									<li>3. Tap &quot;Add&quot; to confirm</li>
								</ol>
							</div>
							<Button asChild className="w-full">
								<Link href="/" onClick={() => setShowInstallPrompt(false)}>
									<Smartphone className="mr-2 w-4 h-4" />
									Open in Safari
								</Link>
							</Button>
						</div>
					) : (
						<div className="flex gap-2">
							<Button onClick={handleInstallClick} className="flex-1">
								<Download className="mr-2 w-4 h-4" />
								Install Now
							</Button>
							<Button
								variant="outline"
								onClick={handleDismiss}
								className="px-3"
							>
								<X className="w-4 h-4" />
							</Button>
						</div>
					)}

					<div className="text-gray-500 text-xs text-center">
						Free to install • No app store required
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
