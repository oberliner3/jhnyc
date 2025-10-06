/**
 * Phone Number Utilities
 *
 * Utilities for phone number formatting and validation using libphonenumber-js.
 * Provides functions for real-time formatting, validation, and storage formatting
 * of phone numbers across different countries.
 *
 * @module lib/utils/phone-utils
 * @see https://github.com/catamphetamine/libphonenumber-js
 */

import {
  parsePhoneNumberWithError,
  AsYouType,
  CountryCode,
} from "libphonenumber-js";
import { countries } from "@/lib/countries";

/**
 * Format phone number as user types
 *
 * Provides real-time formatting of phone numbers as the user types,
 * automatically adding spaces, dashes, and parentheses according to
 * the country's phone number format.
 *
 * @param value - The raw phone number input from the user
 * @param countryCode - The ISO 3166-1 alpha-2 country code (e.g., "US", "GB")
 * @returns Formatted phone number string
 *
 * @example
 * ```typescript
 * formatPhoneAsYouType("2025551234", "US");
 * // Returns: "(202) 555-1234"
 *
 * formatPhoneAsYouType("442071234567", "GB");
 * // Returns: "020 7123 4567"
 * ```
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
 *
 * Checks if a phone number is valid according to the rules of the
 * specified country. Returns false for empty strings or invalid numbers.
 *
 * @param value - The phone number to validate
 * @param countryCode - The ISO 3166-1 alpha-2 country code
 * @returns True if the phone number is valid, false otherwise
 *
 * @example
 * ```typescript
 * validatePhoneNumber("(202) 555-1234", "US");
 * // Returns: true
 *
 * validatePhoneNumber("123", "US");
 * // Returns: false
 * ```
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
 * Get country calling code
 *
 * Retrieves the international calling code for a country (e.g., "+1" for US).
 *
 * @param countryCode - The ISO 3166-1 alpha-2 country code
 * @returns The calling code with "+" prefix, or empty string if not found
 *
 * @example
 * ```typescript
 * getCountryCallingCode("US");
 * // Returns: "+1"
 *
 * getCountryCallingCode("GB");
 * // Returns: "+44"
 * ```
 */
export function getCountryCallingCode(countryCode: CountryCode): string {
  const country = countries.find((c) => c.code === countryCode);
  return country?.callingCode || "";
}

/**
 * Format phone number for display
 *
 * Formats a phone number in international format for display purposes.
 * Falls back to the original input if parsing fails.
 *
 * @param phoneNumber - The phone number to format
 * @param countryCode - The ISO 3166-1 alpha-2 country code
 * @returns Formatted phone number in international format
 *
 * @example
 * ```typescript
 * formatPhoneForDisplay("2025551234", "US");
 * // Returns: "+1 202 555 1234"
 *
 * formatPhoneForDisplay("invalid", "US");
 * // Returns: "invalid" (fallback to original)
 * ```
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
 * Format phone number for storage
 *
 * Formats a phone number in E.164 format for database storage.
 * E.164 is the international standard format (e.g., "+12025551234").
 * Returns null if the phone number is invalid.
 *
 * @param phoneNumber - The phone number to format
 * @param countryCode - The ISO 3166-1 alpha-2 country code
 * @returns Phone number in E.164 format, or null if invalid
 *
 * @example
 * ```typescript
 * formatPhoneForStorage("(202) 555-1234", "US");
 * // Returns: "+12025551234"
 *
 * formatPhoneForStorage("invalid", "US");
 * // Returns: null
 * ```
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

