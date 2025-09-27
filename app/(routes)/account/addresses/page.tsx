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
import { Badge } from '@/components/ui/badge'
import { MapPin, Edit, Trash2 } from 'lucide-react'

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
          <h2 className="text-xl font-semibold mb-6">Your Addresses</h2>
          <div className="space-y-4">
            {addresses.length > 0 ? (
              addresses.map((addr) => (
                <Card key={addr.id} className="group hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <CardTitle className="text-lg capitalize">
                          {addr.type} Address
                        </CardTitle>
                      </div>
                      <Badge 
                        variant={addr.type === 'shipping' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {addr.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <p className="font-medium text-foreground">
                            {addr.full_name}
                          </p>
                          <p className="text-muted-foreground leading-relaxed">
                            {addr.address}
                          </p>
                          <p className="text-muted-foreground">
                            {addr.city}, {addr.postal_code}
                          </p>
                          <p className="text-muted-foreground font-medium">
                            {addr.country}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-xs text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No addresses saved
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Add your first address to make checkout faster and easier.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
