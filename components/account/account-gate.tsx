"use client";

import {
	CreditCard,
	Heart,
	HelpCircle,
	LogOut,
	MapPin,
	Package,
	Settings,
	Shield,
	ShoppingBag,
	User,
} from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DangerButton, PrimaryCTA, SecondaryCTA } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";

export function AccountGate() {
	const { user, signOut, signIn, signUp, loading } = useAuth();
	const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const emailId = useId();
	const passwordId = useId();
	const nameId = useId();
	const phoneId = useId();

	const handleAuthAction = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setMessage(null);

		const action = isSignUp ? signUp : signIn;
		const { error } = await action(email, password);

		if (error) {
			setError(error.message);
		} else {
			setMessage(
				isSignUp
					? "Check your email to confirm your account!"
					: "Welcome back!",
			);
		}
	};

	if (loading) {
		return <div className="px-4 py-8 container">Loading...</div>;
	}

	if (!user) {
		return (
			<div className="flex justify-center items-center min-h-[calc(100vh-200px)] container">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-2xl">
							{isSignUp ? "Create an account" : "Sign In"}
						</CardTitle>
						<CardDescription>
							Enter your details below to{" "}
							{isSignUp ? "create your account" : "sign in to your account"}.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleAuthAction} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor={emailId}>Email</Label>
								<Input
									id={emailId}
									type="email"
									placeholder="m@example.com"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor={passwordId}>Password</Label>
								<Input
									id={passwordId}
									type="password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>
							{error && <p className="text-red-500 text-sm">{error}</p>}
							{message && <p className="text-green-500 text-sm">{message}</p>}
							<PrimaryCTA type="submit" className="w-full">
								{isSignUp ? "Sign Up" : "Sign In"}
							</PrimaryCTA>
						</form>
						<div className="mt-4 text-sm text-center">
							{isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
							<button
								type="button"
								onClick={() => setIsSignUp(!isSignUp)}
								className="underline"
							>
								{isSignUp ? "Sign In" : "Sign Up"}
							</button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="px-4 py-8 max-w-7xl container">
			{/* Header */}
			<div className="mb-8">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="mb-2 font-bold text-3xl lg:text-4xl tracking-tight">
							Welcome back,{" "}
							<span className="text-primary">
								{user.user_metadata?.full_name || user.email?.split("@")[0]}
							</span>
						</h1>
						<p className="text-muted-foreground">
							Manage your account, orders, and preferences
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="outline" className="text-xs">
							Member since {new Date(user.created_at).getFullYear()}
						</Badge>
					</div>
				</div>
			</div>

			{/* Account Dashboard */}
			<Tabs defaultValue="overview" className="space-y-6">
				<TabsList className="grid grid-cols-2 lg:grid-cols-6 w-full">
					<TabsTrigger value="overview" className="flex items-center gap-2">
						<User className="w-4 h-4" />
						<span className="hidden sm:inline">Overview</span>
					</TabsTrigger>
					<TabsTrigger value="orders" className="flex items-center gap-2">
						<Package className="w-4 h-4" />
						<span className="hidden sm:inline">Orders</span>
					</TabsTrigger>
					<TabsTrigger value="addresses" className="flex items-center gap-2">
						<MapPin className="w-4 h-4" />
						<span className="hidden sm:inline">Addresses</span>
					</TabsTrigger>
					<TabsTrigger value="profile" className="flex items-center gap-2">
						<Settings className="w-4 h-4" />
						<span className="hidden sm:inline">Profile</span>
					</TabsTrigger>
					<TabsTrigger value="security" className="flex items-center gap-2">
						<Shield className="w-4 h-4" />
						<span className="hidden sm:inline">Security</span>
					</TabsTrigger>
					<TabsTrigger value="help" className="flex items-center gap-2">
						<HelpCircle className="w-4 h-4" />
						<span className="hidden sm:inline">Help</span>
					</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					<div className="gap-6 grid md:grid-cols-2 lg:grid-cols-3">
						{/* Quick Stats */}
						<Card>
							<CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
								<CardTitle className="font-medium text-sm">
									Total Orders
								</CardTitle>
								<ShoppingBag className="w-4 h-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl">12</div>
								<p className="text-muted-foreground text-xs">
									+2 from last month
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
								<CardTitle className="font-medium text-sm">
									Total Spent
								</CardTitle>
								<CreditCard className="w-4 h-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl">$1,234.56</div>
								<p className="text-muted-foreground text-xs">
									+$180.30 from last month
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
								<CardTitle className="font-medium text-sm">
									Wishlist Items
								</CardTitle>
								<Heart className="w-4 h-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="font-bold text-2xl">8</div>
								<p className="text-muted-foreground text-xs">3 items on sale</p>
							</CardContent>
						</Card>
					</div>

					{/* Quick Actions */}
					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
							<CardDescription>Common tasks and shortcuts</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="gap-4 grid md:grid-cols-2 lg:grid-cols-4">
								<Link href="/account/orders" className="group">
									<div className="flex items-center space-x-4 hover:bg-muted/50 p-4 border rounded-lg transition-colors">
										<Package className="w-5 h-5 text-primary" />
										<div>
											<p className="font-medium">View Orders</p>
											<p className="text-muted-foreground text-sm">
												Track your purchases
											</p>
										</div>
									</div>
								</Link>

								<Link href="/account/addresses" className="group">
									<div className="flex items-center space-x-4 hover:bg-muted/50 p-4 border rounded-lg transition-colors">
										<MapPin className="w-5 h-5 text-primary" />
										<div>
											<p className="font-medium">Manage Addresses</p>
											<p className="text-muted-foreground text-sm">
												Update shipping info
											</p>
										</div>
									</div>
								</Link>

								<Link href="/account/profile" className="group">
									<div className="flex items-center space-x-4 hover:bg-muted/50 p-4 border rounded-lg transition-colors">
										<User className="w-5 h-5 text-primary" />
										<div>
											<p className="font-medium">Edit Profile</p>
											<p className="text-muted-foreground text-sm">
												Update personal info
											</p>
										</div>
									</div>
								</Link>

								<Link href="/cart" className="group">
									<div className="flex items-center space-x-4 hover:bg-muted/50 p-4 border rounded-lg transition-colors">
										<ShoppingBag className="w-5 h-5 text-primary" />
										<div>
											<p className="font-medium">View Cart</p>
											<p className="text-muted-foreground text-sm">
												Continue shopping
											</p>
										</div>
									</div>
								</Link>
							</div>
						</CardContent>
					</Card>

					{/* Recent Activity */}
					<Card>
						<CardHeader>
							<CardTitle>Recent Activity</CardTitle>
							<CardDescription>Your latest account activity</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center space-x-4">
									<div className="bg-green-500 rounded-full w-2 h-2"></div>
									<div className="flex-1">
										<p className="font-medium text-sm">Order #12345 shipped</p>
										<p className="text-muted-foreground text-xs">2 days ago</p>
									</div>
								</div>
								<div className="flex items-center space-x-4">
									<div className="bg-blue-500 rounded-full w-2 h-2"></div>
									<div className="flex-1">
										<p className="font-medium text-sm">Profile updated</p>
										<p className="text-muted-foreground text-xs">1 week ago</p>
									</div>
								</div>
								<div className="flex items-center space-x-4">
									<div className="bg-orange-500 rounded-full w-2 h-2"></div>
									<div className="flex-1">
										<p className="font-medium text-sm">New address added</p>
										<p className="text-muted-foreground text-xs">2 weeks ago</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Orders Tab */}
				<TabsContent value="orders" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Order History</CardTitle>
							<CardDescription>View and track your orders</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="py-8 text-center">
								<Package className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
								<h3 className="mb-2 font-medium text-lg">No orders yet</h3>
								<p className="mb-4 text-muted-foreground">
									Start shopping to see your orders here
								</p>
								<PrimaryCTA asChild>
									<Link href="/products">Start Shopping</Link>
								</PrimaryCTA>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Addresses Tab */}
				<TabsContent value="addresses" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Saved Addresses</CardTitle>
							<CardDescription>
								Manage your shipping and billing addresses
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="py-8 text-center">
								<MapPin className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
								<h3 className="mb-2 font-medium text-lg">No addresses saved</h3>
								<p className="mb-4 text-muted-foreground">
									Add an address to make checkout faster
								</p>
								<PrimaryCTA asChild>
									<Link href="/account/addresses">Add Address</Link>
								</PrimaryCTA>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Profile Tab */}
				<TabsContent value="profile" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Account Information</CardTitle>
							<CardDescription>
								Update your personal information
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="gap-4 grid md:grid-cols-2">
								<div>
									<Label htmlFor={emailId}>Email</Label>
									<Input id={emailId} value={user.email} disabled />
								</div>
								<div>
									<Label htmlFor={nameId}>Full Name</Label>
									<Input id={nameId} placeholder="Enter your full name" />
								</div>
							</div>
							<div>
								<Label htmlFor={phoneId}>Phone Number</Label>
								<Input id={phoneId} placeholder="Enter your phone number" />
							</div>
							<div className="flex gap-2">
								<PrimaryCTA>Save Changes</PrimaryCTA>
								<SecondaryCTA>Cancel</SecondaryCTA>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Security Tab */}
				<TabsContent value="security" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Security Settings</CardTitle>
							<CardDescription>Manage your account security</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex justify-between items-center p-4 border rounded-lg">
								<div>
									<h4 className="font-medium">Password</h4>
									<p className="text-muted-foreground text-sm">
										Last changed 3 months ago
									</p>
								</div>
								<SecondaryCTA>Change Password</SecondaryCTA>
							</div>
							<div className="flex justify-between items-center p-4 border rounded-lg">
								<div>
									<h4 className="font-medium">Two-Factor Authentication</h4>
									<p className="text-muted-foreground text-sm">
										Add an extra layer of security
									</p>
								</div>
								<SecondaryCTA>Enable 2FA</SecondaryCTA>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Help Tab */}
				<TabsContent value="help" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Help & Support</CardTitle>
							<CardDescription>Get help with your account</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="gap-4 grid md:grid-cols-2">
								<Link href="/contact" className="group">
									<div className="flex items-center space-x-4 hover:bg-muted/50 p-4 border rounded-lg transition-colors">
										<HelpCircle className="w-5 h-5 text-primary" />
										<div>
											<p className="font-medium">Contact Support</p>
											<p className="text-muted-foreground text-sm">
												Get help from our team
											</p>
										</div>
									</div>
								</Link>
								<Link href="/shipping-delivery" className="group">
									<div className="flex items-center space-x-4 hover:bg-muted/50 p-4 border rounded-lg transition-colors">
										<Package className="w-5 h-5 text-primary" />
										<div>
											<p className="font-medium">Shipping Info</p>
											<p className="text-muted-foreground text-sm">
												Delivery and returns
											</p>
										</div>
									</div>
								</Link>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Sign Out */}
			<div className="flex justify-end pt-6">
				<DangerButton onClick={signOut} className="flex items-center gap-2">
					<LogOut className="w-4 h-4" />
					Sign Out
				</DangerButton>
			</div>
		</div>
	);
}
