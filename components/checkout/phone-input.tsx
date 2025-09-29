"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { countries } from "@/lib/countries";
import {
  parsePhoneNumberWithError,
  AsYouType,
  CountryCode,
} from "libphonenumber-js";

interface PhoneInputProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  countryCode: CountryCode;
  error?: string;
  label?: string;
  required?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  countryCode,
  error,
  label = "Phone number",
  required = false,
}: PhoneInputProps) {
  const formatter = React.useMemo(
    () => new AsYouType(countryCode),
    [countryCode]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = formatter.input(inputValue);
    let isValid = false;

    try {
      const phoneNumber = parsePhoneNumberWithError(
        formattedValue,
        countryCode
      );
      isValid = phoneNumber.isValid();
    } catch (err) {
      isValid = false;
    }

    onChange(formattedValue, isValid);
  };

  // Get the country calling code (e.g., +1 for US)
  const country = countries.find((c) => c.code === countryCode);
  const callingCode = country?.callingCode || "";

  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor="phone-input"
        className={cn(
          error && "text-destructive",
          required && "after:content-['*'] after:ml-0.5 after:text-destructive"
        )}
      >
        {label}
      </Label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm">
          {callingCode}
        </div>
        <Input
          id="phone-input"
          type="tel"
          value={value}
          onChange={handleChange}
          className={cn("pl-12", error && "border-destructive")}
          placeholder="(555) 123-4567"
        />
      </div>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
}
