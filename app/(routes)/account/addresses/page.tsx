'use client'

import { useFormState } from 'react-dom'
import { addAddress } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AddressesPage() {
  const [state, formAction] = useFormState(addAddress, null)

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-8">
        Manage Addresses
      </h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Address</h2>
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="type">Address Type</Label>
              <Select name="type">
                <SelectTrigger>
                  <SelectValue placeholder="Select address type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" />
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" name="postalCode" />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" />
              </div>
            </div>
            <Button type="submit">Add Address</Button>
            {state?.message && <p className="text-sm text-muted-foreground">{state.message}</p>}
          </form>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Addresses</h2>
          {/* TODO: List existing addresses */}
        </div>
      </div>
    </div>
  )
}
