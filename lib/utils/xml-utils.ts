/**
 * XML Utility Functions
 * Shared utilities for XML generation and escaping
 */

/**
 * Escape special XML characters to prevent malformed XML
 * Handles: & < > " '
 */
export function escapeXml(str: string | undefined | null): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Strip HTML tags from a string
 * Useful for converting HTML descriptions to plain text
 */
export function stripHtml(html: string): string {
  return html.replace(/(<([^>]+)>)/gi, "");
}

/**
 * Create CDATA section for XML
 * Safely wraps content that may contain special characters
 */
export function createCDATA(content: string): string {
  // Remove any existing CDATA markers and escape ]]>
  const cleaned = content.replace(/<!\[CDATA\[|\]\]>/g, "");
  const escaped = cleaned.replace(/\]\]>/g, "]]]]><![CDATA[>");
  return `<![CDATA[${escaped}]]>`;
}

/**
 * Build XML element with optional attributes
 */
export function buildXmlElement(
  tag: string,
  content: string | number,
  attributes?: Record<string, string>
): string {
  const attrs = attributes
    ? Object.entries(attributes)
        .map(([key, value]) => `${key}="${escapeXml(value)}"`)
        .join(" ")
    : "";

  const attrString = attrs ? ` ${attrs}` : "";
  return `<${tag}${attrString}>${escapeXml(String(content))}</${tag}>`;
}

/**
 * Build self-closing XML element
 */
export function buildSelfClosingElement(
  tag: string,
  attributes?: Record<string, string>
): string {
  const attrs = attributes
    ? Object.entries(attributes)
        .map(([key, value]) => `${key}="${escapeXml(value)}"`)
        .join(" ")
    : "";

  const attrString = attrs ? ` ${attrs}` : "";
  return `<${tag}${attrString} />`;
}

