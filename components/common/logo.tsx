import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/constants'

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <span className="text-lg font-bold text-primary-foreground ">OZ</span>
      </div> */}
      <span className="text-2xl font-bold ">[</span>
      <span className="text-xl font-bold ">{SITE_CONFIG.name}</span>
      <span className="text-2xl font-bold ">]</span>
    </Link>
  );
}
