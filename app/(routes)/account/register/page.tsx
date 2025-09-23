import { Metadata } from 'next'
import { generateSEO } from '@/lib/seo'

export const metadata: Metadata = generateSEO({
  title: 'Register',
  description: 'Create a new account to start shopping with us.',
  path: '/account/register',
})

export default function RegisterPage() {
  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-8">
        Register
      </h1>
      <p>Registration form will go here.</p>
    </div>
  )
}
