// app/cdn/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/cdn/, ""); // /cdn prefix removed
  const targetUrl = `https://cdn.shopify.com${path}${url.search}`;

  const res = await fetch(targetUrl, {
    headers: {
      "User-Agent": req.headers.get("user-agent") || "",
    },
  });

  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", "*"); // optional
  headers.set("Cache-Control", "public, max-age=3600"); // cache images

  return new NextResponse(res.body, {
    status: res.status,
    headers,
  });
}
