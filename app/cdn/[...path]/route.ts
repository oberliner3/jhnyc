import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params);
}

export async function HEAD(
  req: Request,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(req, params, true); // HEAD mode
}

// Shared request handler
async function handleRequest(
  req: Request,
  params: { path: string[] },
  isHead = false
) {
  try {
    if (!params.path || params.path.length === 0) {
      return new NextResponse("No CDN path provided", { status: 400 });
    }

    const path = params.path.join("/");
    const url = new URL(req.url);
    const targetUrl = `https://cdn.shopify.com/${path}${url.search}`;

    // Fetch resource from Shopify CDN
    const res = await fetch(targetUrl, {
      method: isHead ? "HEAD" : "GET",
      headers: {
        "User-Agent": req.headers.get("user-agent") || "",
      },
    });

    if (!res.ok) {
      return new NextResponse("CDN resource not found", { status: res.status });
    }

    // Clone headers + add caching + optional CORS
    const headers = new Headers(res.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");

    if (isHead) {
      // Return headers only for HEAD requests
      return new NextResponse(null, { status: res.status, headers });
    }

    // Stream body for GET requests
    if (!res.body) {
      return new NextResponse("Empty response from CDN", { status: 500 });
    }

    return new NextResponse(res.body, { status: res.status, headers });
  } catch (err) {
    console.error("CDN Proxy Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
