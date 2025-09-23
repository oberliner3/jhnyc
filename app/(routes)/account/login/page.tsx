import { Metadata } from 'next'
import { generateSEO } from '@/lib/seo'

export const metadata: Metadata = generateSEO({
  title: 'Login',
  description: 'Login to your account to manage your orders and profile.',
  path: '/account/login',
})

export default function LoginPage() {
  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-8">
        Login
      </h1>
      <p>Login form will go here.</p>
    </div>
  )
}
