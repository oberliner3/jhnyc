import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context, false);
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context, true);
}

// Shared handler
async function handleRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
  isHead = false
) {
  try {
    const { path } = await context.params; // now we await params

    if (!path || path.length === 0) {
      return new NextResponse("No CDN path provided", { status: 400 });
    }

    const targetUrl = `https://cdn.shopify.com/${path.join("/")}${new URL(
      request.url
    ).search}`;

    const res = await fetch(targetUrl, {
      method: isHead ? "HEAD" : "GET",
      headers: {
        "User-Agent": request.headers.get("user-agent") || "",
      },
    });

    if (!res.ok) {
      return new NextResponse("CDN resource not found", { status: res.status });
    }

    const headers = new Headers(res.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set(
      "Cache-Control",
      "public, max-age=3600, stale-while-revalidate=86400"
    );

    if (isHead) {
      return new NextResponse(null, { status: res.status, headers });
    }

    if (!res.body) {
      return new NextResponse("Empty response from CDN", { status: 500 });
    }

    return new NextResponse(res.body, { status: res.status, headers });
  } catch (err) {
    console.error("CDN Proxy Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
