'use client'

import { useEffect, useState } from 'react'
import { useFormState } from 'react-dom'
import { Address } from '@/lib/types'
import { addAddress, getAddresses } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AddressesPage() {
  const [state, formAction] = useFormState(addAddress, null)
  const [addresses, setAddresses] = useState<Address[]>([])

  useEffect(() => {
    async function fetchAddresses() {
      const userAddresses = await getAddresses();
      setAddresses(userAddresses);
    }
    fetchAddresses();
  }, [state]); // Refetch when a new address is added

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
            {state?.message && (
              <p className="text-sm text-muted-foreground">{state.message}</p>
            )}
          </form>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Addresses</h2>
          <div className="space-y-4">
            {addresses.length > 0 ? (
              addresses.map((addr) => (
                <Card key={addr.id}>
                  <CardHeader>
                    <CardTitle className="capitalize">
                      {addr.type} Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      {addr.full_name} {addr.last_name}
                    </p>
                    <p>{addr.address}</p>
                    <p>
                      {addr.city}, {addr.postal_code}
                    </p>
                    <p>{addr.country}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>You have no saved addresses.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
