'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import {
  PrimaryCTA,
  SecondaryCTA,
  DangerButton,
} from "@/components/ui/button";
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Package, 
  MapPin, 
  CreditCard, 
  Settings, 
  LogOut, 
  ShoppingBag,
  Heart,
  Shield,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'

export function AccountGate() {
  const { user, signOut, signIn, signUp, loading } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

    const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const action = isSignUp ? signUp : signIn;
    const { error } = await action(email, password);

    if (error) {
      setError(error.message);
    } else {
      setMessage(isSignUp ? 'Check your email to confirm your account!' : 'Welcome back!');
    }
  };

  if (loading) {
    return <div className="container px-4 py-8">Loading...</div>
  }

  if (!user) {
    return (
      <div className="container flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">{isSignUp ? 'Create an account' : 'Sign In'}</CardTitle>
            <CardDescription>Enter your details below to {isSignUp ? 'create your account' : 'sign in to your account'}.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuthAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {message && <p className="text-green-500 text-sm">{message}</p>}
              <PrimaryCTA type="submit" className="w-full">{isSignUp ? 'Sign Up' : 'Sign In'}</PrimaryCTA>
            </form>
            <div className="mt-4 text-center text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{" "}
              <button onClick={() => setIsSignUp(!isSignUp)} className="underline">
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-2">
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
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Orders</span>
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Addresses</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Help</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Quick Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,234.56</div>
                <p className="text-xs text-muted-foreground">
                  +$180.30 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  3 items on sale
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/account/orders" className="group">
                  <div className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">View Orders</p>
                      <p className="text-sm text-muted-foreground">Track your purchases</p>
                    </div>
                  </div>
                </Link>

                <Link href="/account/addresses" className="group">
                  <div className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Manage Addresses</p>
                      <p className="text-sm text-muted-foreground">Update shipping info</p>
                    </div>
                  </div>
                </Link>

                <Link href="/account/profile" className="group">
                  <div className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Edit Profile</p>
                      <p className="text-sm text-muted-foreground">Update personal info</p>
                    </div>
                  </div>
                </Link>

                <Link href="/cart" className="group">
                  <div className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">View Cart</p>
                      <p className="text-sm text-muted-foreground">Continue shopping</p>
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
              <CardDescription>
                Your latest account activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Order #12345 shipped</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Profile updated</p>
                    <p className="text-xs text-muted-foreground">1 week ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New address added</p>
                    <p className="text-xs text-muted-foreground">2 weeks ago</p>
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
              <CardDescription>
                View and track your orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">
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
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No addresses saved</h3>
                <p className="text-muted-foreground mb-4">
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
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter your full name" />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="Enter your phone number" />
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
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                </div>
                <SecondaryCTA>Change Password</SecondaryCTA>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
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
              <CardDescription>
                Get help with your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Link href="/contact" className="group">
                  <div className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Contact Support</p>
                      <p className="text-sm text-muted-foreground">Get help from our team</p>
                    </div>
                  </div>
                </Link>
                <Link href="/shipping-delivery" className="group">
                  <div className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Shipping Info</p>
                      <p className="text-sm text-muted-foreground">Delivery and returns</p>
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
          <LogOut className="h-4 w-4" />
          Sign Out
        </DangerButton>
      </div>
    </div>
  );
}
