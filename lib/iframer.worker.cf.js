export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Only intercept paths starting with /p/
    if (!url.pathname.startsWith("/p/")) {
      return fetch(request);
    }

    const originalPath = url.pathname.replace(/^\/p/, "");
    
    // Add secret token to authenticate this proxy
    const iframeUrl = new URL("https://jhuangnyc.com" + originalPath + url.search);
    iframeUrl.searchParams.set("proxy_token", "your-secret-token-here");
    const iframeSrc = iframeUrl.toString();

    const wrapperHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VohoVintage</title>
        <style>
          body, html { 
            margin: 0; 
            padding: 0; 
            height: 100%; 
            overflow: hidden; 
            font-family: sans-serif; 
          }
          .iframe-container { 
            width: 100%; 
            height: 100vh; 
          }
          iframe { 
            width: 100%; 
            height: 100%; 
            border: none; 
          }
          .checkout-overlay {
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: none; 
            z-index: 1000; 
            align-items: center; 
            justify-content: center;
          }
          .checkout-frame {
            width: 90%; 
            max-width: 900px; 
            height: 90%; 
            max-height: 800px;
            background: white; 
            border-radius: 8px; 
            overflow: hidden; 
            position: relative;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          }
          .checkout-frame iframe {
            width: 100%;
            height: 100%;
          }
          .close-checkout {
            position: absolute; 
            top: 15px; 
            right: 15px; 
            background: #fff; 
            border: 1px solid #ddd;
            border-radius: 50%; 
            width: 40px; 
            height: 40px; 
            cursor: pointer; 
            font-size: 20px;
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            z-index: 1;
          }
          .close-checkout:hover { 
            background: #f0f0f0; 
          }
        </style>
      </head>
      <body>
        <div class="iframe-container">
          <iframe 
            src="${iframeSrc}" 
            id="shop-iframe" 
            allow="payment; geolocation; microphone; camera; midi; encrypted-media; usb; web-share"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox allow-downloads"
          ></iframe>
        </div>

        <div class="checkout-overlay" id="checkout-overlay">
          <div class="checkout-frame">
            <button class="close-checkout" id="close-checkout" aria-label="Close checkout">&times;</button>
            <iframe 
              src="" 
              id="checkout-iframe" 
              allow="payment; geolocation; microphone; camera; midi; encrypted-media; usb; web-share"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox allow-downloads"
            ></iframe>
          </div>
        </div>

        <script>
          console.log('[VohoVintage Worker] Wrapper loaded');

          // Listen for messages from the embedded shop (jhuangnyc.com)
          window.addEventListener('message', function(event) {
            console.log('[VohoVintage Worker] Message received:', {
              origin: event.origin,
              type: event.data?.type,
              hasCheckoutUrl: !!event.data?.checkoutUrl
            });

            // Security: Only accept messages from jhuangnyc.com
            if (event.origin !== "https://jhuangnyc.com") {
              console.warn('[VohoVintage Worker] Ignored message from unauthorized origin:', event.origin);
              return;
            }

            // Handle checkout messages from Buy Now button
            if (event.data.type === 'checkout') {
              const checkoutUrl = event.data.checkoutUrl;
              
              if (!checkoutUrl) {
                console.error('[VohoVintage Worker] No checkout URL provided');
                return;
              }

              console.log('[VohoVintage Worker] Opening checkout overlay with URL:', checkoutUrl);

              // Set the checkout iframe source
              document.getElementById('checkout-iframe').src = checkoutUrl;
              
              // Show the overlay
              document.getElementById('checkout-overlay').style.display = 'flex';

              // Log additional data if present
              if (event.data.utm) {
                console.log('[VohoVintage Worker] UTM parameters:', event.data.utm);
              }
              if (event.data.product) {
                console.log('[VohoVintage Worker] Product data:', event.data.product);
              }
            }
          });

          // Close checkout overlay
          function closeCheckout() {
            console.log('[VohoVintage Worker] Closing checkout overlay');
            document.getElementById('checkout-overlay').style.display = 'none';
            document.getElementById('checkout-iframe').src = '';
          }

          // Close button handler
          document.getElementById('close-checkout').addEventListener('click', closeCheckout);

          // Click outside to close
          document.getElementById('checkout-overlay').addEventListener('click', function(e) {
            if (e.target === this) {
              closeCheckout();
            }
          });

          // Listen for successful checkout completion (optional)
          window.addEventListener('message', function(event) {
            if (event.origin !== "https://jhuangnyc.com" && 
                !event.origin.includes('myshopify.com')) {
              return;
            }

            // If checkout is completed, you can handle it here
            if (event.data.type === 'checkout_complete') {
              console.log('[VohoVintage Worker] Checkout completed');
              closeCheckout();
              
              // Optionally show a success message or redirect
              // window.location.href = '/thank-you';
            }
          });

          // Handle potential redirect attempts from within the shop iframe
          const shopIframe = document.getElementById('shop-iframe');
          
          // Monitor iframe URL changes (if accessible)
          try {
            shopIframe.addEventListener('load', function() {
              try {
                const iframeUrl = shopIframe.contentWindow.location.href;
                console.log('[VohoVintage Worker] Shop iframe loaded:', iframeUrl);
                
                // If the iframe navigates to a checkout URL, intercept it
                if (iframeUrl.includes('/checkouts/') || iframeUrl.includes('/invoices/')) {
                  console.log('[VohoVintage Worker] Detected checkout navigation, opening in overlay');
                  document.getElementById('checkout-iframe').src = iframeUrl;
                  document.getElementById('checkout-overlay').style.display = 'flex';
                  
                  // Reset the shop iframe to the original page
                  shopIframe.src = "${iframeSrc}";
                }
              } catch (e) {
                // Cross-origin restriction - this is expected
                // We'll rely on postMessage instead
              }
            });
          } catch (e) {
            console.log('[VohoVintage Worker] Cannot monitor iframe navigation due to CORS');
          }

          // Debugging helper
          console.log('[VohoVintage Worker] Iframe source:', "${iframeSrc}");
          console.log('[VohoVintage Worker] Listening for checkout messages from jhuangnyc.com');
        </script>
      </body>
      </html>
    `;

    return new Response(wrapperHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  }
};