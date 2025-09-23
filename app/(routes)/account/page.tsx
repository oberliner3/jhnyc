import { Metadata } from 'next'
import { generateSEO } from '@/lib/seo'

export const metadata: Metadata = generateSEO({
  title: 'Account',
  description: 'Manage your account settings and view your orders.',
  path: '/account',
})

export default function AccountPage() {
  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-8">
        Account Overview
      </h1>
      <p>Your account dashboard will be displayed here.</p>
    </div>
  )
}
