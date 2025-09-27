'use client'

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import type { Address } from '@/lib/types';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  billing_address: Address;
  shipping_address: Address;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data: Profile = await res.json();
        setFullName(data.full_name || '');
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ full_name: fullName }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const data: Profile = await res.json();
      setFullName(data.full_name || '');
      alert("Profile updated successfully!");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Your Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Update your information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email} disabled />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
