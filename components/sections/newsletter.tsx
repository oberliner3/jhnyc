'use client'

import { useState } from 'react'
import { Mail, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
      setEmail('')
    }, 1000)
  }

  return (
    <section className="py-16 lg:py-24 bg-linear-to-r from-primary to-shopify-purple text-primary-foreground">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="h-8 w-8" />
          </div>
          
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl mb-4">
            Get 15% Off Your First Order
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join our newsletter and be the first to know about new products, exclusive deals, and special promotions.
          </p>

          {isSuccess ? (
            <div className="bg-primary-foreground/20 rounded-lg p-6">
              <div className="text-2xl mb-2">🎉</div>
              <h3 className="text-xl font-semibold mb-2">Welcome aboard!</h3>
              <p className="opacity-90">Check your email for your exclusive 15% off promo code.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-primary-foreground text-foreground"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                disabled={isLoading}
                className="px-8"
              >
                {isLoading ? 'Subscribing...' : 'Get My Code'}
              </Button>
            </form>
          )}

          <p className="text-sm mt-4 opacity-75">
            By subscribing, you agree to receive promotional emails. You can unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  )
}
