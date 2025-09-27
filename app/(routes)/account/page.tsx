import { Metadata } from 'next'
import { generateSEO } from '@/lib/seo'
import { AccountGate } from '@/components/account/account-gate'
import { AccountDashboardSkeleton } from '@/components/skeletons/account-skeleton'
import { Suspense } from 'react'

export const metadata: Metadata = generateSEO({
  title: 'Account',
  description: 'Manage your account settings and view your orders.',
  path: '/account',
})

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountDashboardSkeleton />}>
      <AccountGate />
    </Suspense>
  )
}

