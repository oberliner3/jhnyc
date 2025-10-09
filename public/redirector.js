(function() {
              // Only redirect if NOT already in an iframe and on jhuangnyc.com
              if (window.self === window.top && 
                  (window.location.hostname === 'www.jhuangnyc.com' || 
                   window.location.hostname === 'jhuangnyc.com')) {
                const newUrl = 'https://www.vohovintage.shop/p' + window.location.pathname + window.location.search + window.location.hash;
                window.location.replace(newUrl);
              }
            })();