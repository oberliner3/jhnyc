"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  // onAddressSelect is no longer used since suggestions are removed
  onAddressSelect?: (address: AddressDetails) => void;
  error?: string;
  label?: string;
  placeholder?: string;
}

interface AddressDetails {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export function AddressInput({
  value,
  onChange,
  error,
  label = "Address",
  placeholder = "Enter your address...",
}: AddressInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="address-input" className={cn(error && "text-destructive")}>
        {label}
      </Label>
      <Input
        id="address-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(error && "border-destructive")}
      />
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
}
