"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CommandInput } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useCallback, useEffect } from "react";
import { useDebounce } from "@uidotdev/usehooks";

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: AddressDetails) => void;
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
  onAddressSelect,
  error,
  label = "Address",
  placeholder = "Start typing your address...",
}: AddressInputProps) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressDetails[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedFetchSuggestions = useCallback(
    useDebounce(async (input: string) => {
      if (input.length < 3) return;

      setLoading(true);
      try {
        // Here you would integrate with your preferred address verification service
        // For example, Google Places API, Loqate, etc.
        const response = await fetch(
          `/api/address/suggest?q=${encodeURIComponent(input)}`
        );
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error("Failed to fetch address suggestions:", error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (value) {
      debouncedFetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  }, [value, debouncedFetchSuggestions]);

  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor="address-input"
        className={cn(error && "text-destructive")}
      >
        {label}
      </Label>
      <Popover open={open && suggestions.length > 0} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              id="address-input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className={cn(error && "border-destructive")}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <div className="max-h-[300px] overflow-auto rounded-md border bg-popover p-1">
            {suggestions.map((address, index) => (
              <button
                key={index}
                className={cn(
                  "flex w-full items-center rounded-sm px-2 py-1.5 text-sm",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground focus:outline-none"
                )}
                onClick={() => {
                  onAddressSelect(address);
                  setOpen(false);
                }}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{address.street}</span>
                  <span className="text-xs text-muted-foreground">
                    {address.city}, {address.state} {address.postalCode}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
}
