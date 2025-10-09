import { fetchAllProducts } from "@/lib/api/cosmos-client";
import { FEED_PAGINATION_CONFIG } from "@/lib/utils/xml-feeds/feed-pagination-utils";
import { createFeedStream } from "@/lib/utils/xml-feeds/streaming-feed-generator";

export async function GET(){
  const products = await fetchAllProducts(
    FEED_PAGINATION_CONFIG.PRODUCTS_PER_PAGE,
  );
  const stream  = createFeedStream(products, {
    feedType: "bing",
    siteName: "J Huang NYC",
    siteUrl: "https://jhuangnyc.com",
    description: "J Huang NYC - Shop for handmade goods",
     batchSize: FEED_PAGINATION_CONFIG.PRODUCTS_PER_PAGE,
  });


  return new Response(stream, {
    headers: {
      "Content-Type": "application/xml;charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
