/**
 * Utility functions for invoice generation
 */

/**
 * Generates an invoice number in the format 'Invoice' + random 7-digit number
 * This matches the PHP implementation and provides consistent invoice numbering
 * across the application
 * 
 * @returns A string in the format 'Invoice' + random 7-digit number (e.g. 'Invoice1234567')
 */
export function generateInvoiceNumber(): string {
  // Generate a random 7-digit number between 1000000 and 9999999
  const randomNumber = Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000;
  return `Invoice${randomNumber}`;
}