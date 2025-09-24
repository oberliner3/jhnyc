import { signup } from './actions'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="container px-4 py-8 flex justify-center items-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-8 text-center">
          Register
        </h1>
        <form action={signup} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" />
          </div>
          <Button type="submit" className="w-full">Register</Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account? {' '}
          <Link href="/account/login" className="underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}