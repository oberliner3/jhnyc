/**
 * Optimized Streaming Feed Generator
 * @file lib/utils/xml-feeds/streaming-feed-generator.ts
 * 
 * Handles large product feeds (380k+ products) efficiently using:
 * - Streaming XML generation (memory-efficient)
 * - Batch processing
 * - Progressive rendering
 * - Compression support
 */

import { ApiProduct } from "@/lib/types";

import { escapeXml } from "../xml-utils";
import { MerchantFeedType, getNamespacePrefix, getXmlNamespace } from "../feed-generator";
import { processProductVariants, MerchantFeedItemData, generateMerchantFeedXmlItem } from "../merchant-feed-utils";

/**
 * Streaming feed configuration
 */
export interface StreamingFeedConfig {
  feedType: MerchantFeedType;
  siteName: string;
  siteUrl: string;
  description: string;
  batchSize?: number;
}

/**
 * Generate XML feed header
 */
export function generateFeedHeader(config: StreamingFeedConfig): string {
  const namespace = getXmlNamespace(config.feedType);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" ${namespace}>
  <channel>
    <title>${escapeXml(config.siteName)} - Product Feed</title>
    <link>${escapeXml(config.siteUrl)}</link>
    <description>${escapeXml(config.description)}</description>
`;
}

/**
 * Generate XML feed footer
 */
export function generateFeedFooter(): string {
  return `  </channel>
</rss>`;
}

/**
 * Process a batch of products and generate XML items
 */
export function processBatch(
  products: ApiProduct[],
  config: StreamingFeedConfig
): { xml: string; errorCount: number } {
  const ns = getNamespacePrefix(config.feedType);
  let xml = "";
  let errorCount = 0;

  for (const product of products) {
    const { items, errors } = processProductVariants(
      product,
      config.siteUrl,
      config.siteName,
      undefined,
      (itemData: MerchantFeedItemData) =>
        generateMerchantFeedXmlItem(itemData, ns)
    );
    
    xml += items.join("");
    errorCount += errors.length;
  }

  return { xml, errorCount };
}

/**
 * Create a ReadableStream for streaming feed generation
 * This is the core optimization for handling large feeds
 */
export function createFeedStream(
  products: ApiProduct[],
  config: StreamingFeedConfig
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const batchSize = config.batchSize || 100;
  let index = 0;
  let totalErrors = 0;

  return new ReadableStream({
    async start(controller) {
      // Send header immediately
      controller.enqueue(encoder.encode(generateFeedHeader(config)));
    },

    async pull(controller) {
      if (index >= products.length) {
        // Send footer and close stream
        const footer = generateFeedFooter();
        controller.enqueue(encoder.encode(footer));
        
        // Add error count as XML comment
        if (totalErrors > 0) {
          const comment = `\n<!-- Feed generated with ${totalErrors} errors -->`;
          controller.enqueue(encoder.encode(comment));
        }
        
        controller.close();
        return;
      }

      // Process batch
      const batch = products.slice(index, index + batchSize);
      const { xml, errorCount } = processBatch(batch, config);
      
      totalErrors += errorCount;
      controller.enqueue(encoder.encode(xml));
      
      index += batchSize;
    },

    cancel() {
      // Cleanup if stream is cancelled
      index = products.length;
    },
  });
}

/**
 * Estimate feed size for headers (rough estimate)
 */
export function estimateFeedSize(productCount: number): number {
  // Average 2KB per product item (including variants)
  const avgItemSize = 2 * 1024;
  const headerFooterSize = 1024;
  return (productCount * avgItemSize) + headerFooterSize;
}

/**
 * Helper to convert stream to Response with compression
 */
export function streamToResponse(
  stream: ReadableStream<Uint8Array>,
  errorCount: number,
  enableCompression: boolean = true
): Response {
  const headers = new Headers({
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600, s-maxage=7200",
    "X-Feed-Errors": errorCount.toString(),
    "X-Content-Type-Options": "nosniff",
  });

  // Enable compression hint for Vercel/edge
  if (enableCompression) {
    headers.set("Content-Encoding", "gzip");
  }

  return new Response(stream, { headers });
}