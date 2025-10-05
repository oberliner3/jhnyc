/**
 * Phone Number Utilities
 * Utilities for phone number formatting and validation
 */

import {
  parsePhoneNumberWithError,
  AsYouType,
  CountryCode,
} from "libphonenumber-js";
import { countries } from "@/lib/countries";

/**
 * Format phone number as user types
 */
export function formatPhoneAsYouType(
  value: string,
  countryCode: CountryCode
): string {
  const formatter = new AsYouType(countryCode);
  return formatter.input(value);
}

/**
 * Validate phone number for a specific country
 */
export function validatePhoneNumber(
  value: string,
  countryCode: CountryCode
): boolean {
  if (!value || value.length === 0) {
    return false;
  }

  try {
    const phoneNumber = parsePhoneNumberWithError(value, countryCode);
    return phoneNumber.isValid();
  } catch {
    return false;
  }
}

/**
 * Get country calling code (e.g., "+1" for US)
 */
export function getCountryCallingCode(countryCode: CountryCode): string {
  const country = countries.find((c) => c.code === countryCode);
  return country?.callingCode || "";
}

/**
 * Format phone number for display
 */
export function formatPhoneForDisplay(
  phoneNumber: string,
  countryCode: CountryCode
): string {
  try {
    const parsed = parsePhoneNumberWithError(phoneNumber, countryCode);
    return parsed.formatInternational();
  } catch {
    return phoneNumber;
  }
}

/**
 * Format phone number for storage (E.164 format)
 */
export function formatPhoneForStorage(
  phoneNumber: string,
  countryCode: CountryCode
): string | null {
  try {
    const parsed = parsePhoneNumberWithError(phoneNumber, countryCode);
    if (parsed.isValid()) {
      return parsed.format("E.164");
    }
    return null;
  } catch {
    return null;
  }
}

