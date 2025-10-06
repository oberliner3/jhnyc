import { escapeXml } from "./xml-utils";
import type { MerchantFeedItemData } from "./merchant-feed-utils";

export type MerchantFeedType = "google" | "bing";

function getXmlNamespace(feedType: MerchantFeedType): string {
  switch (feedType) {
    case "google":
      return 'xmlns:g="http://base.google.com/ns/1.0"';
    case "bing":
      // Bing uses the same namespace as Google
      return 'xmlns:g="http://base.google.com/ns/1.0"';
  }
}

export function getNamespacePrefix(feedType: MerchantFeedType): string {
  switch (feedType) {
    case "google":
      return "g";
    case "bing":
      // Bing uses 'g' as well
      return "g";
  }
}

export function generateMerchantFeedXmlItem(
  data: MerchantFeedItemData,
  ns: string,
  shippingConfig?: {
    country: string;
    service: string;
    price: string;
  }
): string {
  const defaultShipping = shippingConfig || {
    country: "US",
    service: "Standard",
    price: "9.99 USD",
  };

  return `
    <item>
      <title><![CDATA[${data.title}]]></title>
      <link>${escapeXml(data.link)}</link>
      <description><![CDATA[${data.description}]]></description>
      <${ns}:id>${escapeXml(data.id)}</${ns}:id>
      <${ns}:title><![CDATA[${data.title}]]></${ns}:title>
      <${ns}:description><![CDATA[${data.description}]]></${ns}:description>
      <${ns}:link>${escapeXml(data.link)}</${ns}:link>
      <${ns}:image_link>${escapeXml(data.imageLink)}</${ns}:image_link>
      <${ns}:availability>${data.availability}</${ns}:availability>
      <${ns}:price>${escapeXml(data.price)}</${ns}:price>
      ${
        data.salePrice
          ? `<${ns}:sale_price>${escapeXml(data.salePrice)}</${ns}:sale_price>`
          : ""
      }
      <${ns}:brand>${escapeXml(data.brand)}</${ns}:brand>
      <${ns}:condition>${data.condition}</${ns}:condition>
      <${ns}:product_type>${escapeXml(data.productType)}</${ns}:product_type>
      <${ns}:google_product_category>${escapeXml(
        data.googleProductCategory
      )}</${ns}:google_product_category>
      <${ns}:mpn>${escapeXml(data.mpn)}</${ns}:mpn>
      ${data.gtin ? `<${ns}:gtin>${escapeXml(data.gtin)}</${ns}:gtin>` : ""}
      ${data.color ? `<${ns}:color>${escapeXml(data.color)}</${ns}:color>` : ""}
      ${data.size ? `<${ns}:size>${escapeXml(data.size)}</${ns}:size>` : ""}
      <${ns}:shipping_weight>${escapeXml(data.shippingWeight)}</${ns}:shipping_weight>
      <${ns}:shipping>
        <${ns}:country>${defaultShipping.country}</${ns}:country>
        <${ns}:service>${defaultShipping.service}</${ns}:service>
        <${ns}:price>${defaultShipping.price}</${ns}:price>
      </${ns}:shipping>
    </item>`;
}

export function generateMerchantFeedXml(
  items: string[],
  siteName: string,
  siteUrl: string,
  feedDescription: string,
  feedType: MerchantFeedType
): string {
  const namespace = getXmlNamespace(feedType);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" ${namespace}>
  <channel>
    <title>${escapeXml(siteName)} - Product Feed</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(feedDescription)}</description>
    ${items.join("")}
  </channel>
</rss>`;
}
