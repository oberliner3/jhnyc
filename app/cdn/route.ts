// app/cdn/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/cdn/, ""); // remove /cdn prefix
    const targetUrl = `https://cdn.shopify.com${path}${url.search}`;

    // Fetch from Shopify CDN
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": req.headers.get("user-agent") || "",
      },
    });

    if (!res.ok) {
      return new NextResponse("Error fetching CDN resource", { status: res.status });
    }

    // Create a readable stream from the response
    const { readable, writable } = new TransformStream();
    res.body?.pipeTo(writable); // stream the body directly

    // Clone headers and add caching
    const headers = new Headers(res.headers);
    headers.set("Access-Control-Allow-Origin", "*"); // optional CORS
    headers.set("Cache-Control", "public, max-age=3600"); // cache 1 hour

    return new NextResponse(readable, {
      status: res.status,
      headers,
    });
  } catch (err) {
    console.error("CDN Proxy Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
