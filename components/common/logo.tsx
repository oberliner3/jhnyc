import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/constants'

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <span className="text-xl font-bold ">{SITE_CONFIG.name}</span>
    </Link>
  );
}
