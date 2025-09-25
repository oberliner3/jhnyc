'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { PrimaryCTA, SecondaryCTA, DangerButton } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-4">
        Welcome, {user.email}
      </h1>
      <p className="text-muted-foreground mb-8">Manage your account settings and view your orders.</p>
      <div className="flex gap-4">
        <SecondaryCTA asChild>
          <Link href="/account/addresses">Manage Addresses</Link>
        </SecondaryCTA>
        <DangerButton onClick={signOut}>Sign Out</DangerButton>
      </div>
    </div>
  )
}
