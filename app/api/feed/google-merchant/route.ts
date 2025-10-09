import { fetchAllProducts } from "@/lib/api/cosmos-client";
import { createFeedStream } from "@/lib/utils/xml-feeds/streaming-feed-generator";

export async function GET(){
  const products = await fetchAllProducts();
  const stream  = createFeedStream(products, {
    feedType: "google",
    siteName: "J Huang NYC",
    siteUrl: "https://jhuangnyc.com",
    description: "J Huang NYC - Shop for handmade goods",
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/xml;charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}