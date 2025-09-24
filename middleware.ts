import { NextResponse, type NextRequest } from 'next/server';

/**
 * Generates a client-side script to customize the checkout page.
 * This script modifies the DOM to replace generic invoice text and images
 * with product-specific details passed via URL parameters and stored in cookies.
 *
 * @param checkoutId - The ID of the checkout.
 * @param productTitle - The title of the product.
 * @param productImage - The URL of the product image.
 * @returns A string containing the JavaScript to be injected into the page.
 */
function getCheckoutCustomizationScript(
  checkoutId: string,
  productTitle: string | null,
  productImage: string | null,
): string {
  // This script will be executed in the browser.
  return `
document.addEventListener("DOMContentLoaded", () => {
    const checkoutId = ${JSON.stringify(checkoutId)};
    const productTitle = ${JSON.stringify(productTitle)};
    const productImage = ${JSON.stringify(productImage)};

    function setCookie(name, value, minutes) {
        let expires = "";
        if (minutes) {
            const date = new Date();
            date.setTime(date.getTime() + (minutes * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (encodeURIComponent(value) || "")  + expires + "; path=/";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i=0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length,c.length));
        }
        return null;
    }

    const titleKey = 
`;
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // We assume the original request is being proxied.
  // The actual fetch destination (e.g., Shopify) should be configured.
  const response = await fetch(request);
  let html = await response.text();

  const checkoutId = url.pathname.split('/')[2] || 'default';
  const productTitle = url.searchParams.get('product_title');
  const productImage = url.searchParams.get('product_image');

  const scriptContent = getCheckoutCustomizationScript(
    checkoutId,
    productTitle,
    productImage,
  );

  // Inject the script before the closing body tag
  html = html.replace("</body>", `<script>${scriptContent}</script></body>`);

  const headers = new Headers(response.headers);
  headers.set("Content-Type", "text/html; charset=utf-8");

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const config = {
  matcher: '/checkouts/:path*',
};
