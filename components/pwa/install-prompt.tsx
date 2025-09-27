'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Download, 
  X, 
  Smartphone, 
  Zap,
  Shield,
  Wifi
} from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        setIsStandalone(true)
        return
      }
      
      // Check for iOS
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      setIsIOS(iOS)
      
      if (iOS) {
        // Check if already added to home screen
        const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as { standalone?: boolean }).standalone
        if (isInStandaloneMode) {
          setIsInstalled(true)
          setIsStandalone(true)
        }
      }
    }

    checkInstalled()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show install prompt after a delay
      setTimeout(() => {
        if (!isInstalled && !isStandalone) {
          setShowInstallPrompt(true)
        }
      }, 3000) // Show after 3 seconds
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled, isStandalone])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('Error showing install prompt:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('install-prompt-dismissed', 'true')
  }

  // Don't show if already installed or dismissed
  if (isInstalled || isStandalone || !showInstallPrompt) {
    return null
  }

  // Check if user dismissed in this session
  if (typeof window !== 'undefined' && sessionStorage.getItem('install-prompt-dismissed')) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Install App
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Install Originz for a better shopping experience with faster access and offline support.
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Faster loading and navigation</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wifi className="h-4 w-4 text-blue-500" />
              <span>Works offline with cached content</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Secure and private browsing</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Smartphone className="h-4 w-4 text-purple-500" />
              <span>Native app-like experience</span>
            </div>
          </div>

          {isIOS ? (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  How to install on iOS:
                </p>
                <ol className="text-xs text-blue-700 space-y-1">
                  <li>1. Tap the Share button in Safari</li>
                  <li>2. Scroll down and tap &quot;Add to Home Screen&quot;</li>
                  <li>3. Tap &quot;Add&quot; to confirm</li>
                </ol>
              </div>
              <Button asChild className="w-full">
                <Link href="/" onClick={() => setShowInstallPrompt(false)}>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Open in Safari
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleInstallClick} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Install Now
              </Button>
              <Button variant="outline" onClick={handleDismiss} className="px-3">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            Free to install • No app store required
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
