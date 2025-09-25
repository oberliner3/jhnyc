import { Metadata } from 'next'
import { generateSEO } from '@/lib/seo'
import { AccountGate } from '@/components/account/account-gate'

export const metadata: Metadata = generateSEO({
  title: 'Account',
  description: 'Manage your account settings and view your orders.',
  path: '/account',
})

export default function AccountPage() {
  return <AccountGate />
}

