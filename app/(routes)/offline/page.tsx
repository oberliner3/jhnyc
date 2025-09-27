'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Home, 
  ShoppingBag,
  Clock,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [lastOnline, setLastOnline] = useState<Date | null>(null)

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)
    setLastOnline(new Date())

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      setLastOnline(new Date())
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    if (isOnline) {
      window.location.reload()
    }
  }

  return (
    <div className="container px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gray-100">
          {isOnline ? (
            <Wifi className="h-10 w-10 text-green-600" />
          ) : (
            <WifiOff className="h-10 w-10 text-gray-400" />
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isOnline ? 'You&apos;re Back Online!' : 'You&apos;re Offline'}
        </h1>
        
        <p className="text-gray-600 mb-4">
          {isOnline 
            ? 'Your connection has been restored. You can now browse our store normally.'
            : 'It looks like you&apos;re not connected to the internet. Don&apos;t worry, you can still browse some content.'
          }
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          <Badge variant={isOnline ? "default" : "secondary"}>
            {isOnline ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
          {lastOnline && (
            <span className="text-sm text-gray-500">
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
              {isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Internet Connection</span>
                <Badge variant={isOnline ? "default" : "destructive"}>
                  {isOnline ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">App Status</span>
                <Badge variant="secondary">Limited Functionality</Badge>
              </div>

              {!isOnline && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    Some features may not be available while offline. Your data will sync when you&apos;re back online.
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
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Full Access Restored</p>
                      <p className="text-sm text-green-700">You can now browse, shop, and use all features.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={handleRetry} className="flex-1">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Page
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                      <Link href="/">
                        <Home className="h-4 w-4 mr-2" />
                        Go Home
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <ShoppingBag className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Browse Cached Content</p>
                        <p className="text-sm text-blue-700">View previously loaded pages and products.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <Clock className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Offline Mode</p>
                        <p className="text-sm text-gray-700">Some features are limited without internet.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={handleRetry} variant="outline" className="flex-1">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                    <Button asChild className="flex-1">
                      <Link href="/">
                        <Home className="h-4 w-4 mr-2" />
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
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Check Your Connection</p>
                    <p className="text-gray-600">Make sure your device is connected to Wi-Fi or mobile data.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Try Refreshing</p>
                    <p className="text-gray-600">Sometimes a simple refresh can restore your connection.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Check Other Apps</p>
                    <p className="text-gray-600">See if other apps can access the internet to diagnose the issue.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
