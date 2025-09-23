export function SchemaMarkup() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://storecraft.com/#website",
        "url": "https://storecraft.com/",
        "name": "StoreCraft",
        "description": "Premium e-commerce storefront",
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://storecraft.com/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        ]
      },
      {
        "@type": "Organization",
        "@id": "https://storecraft.com/#organization",
        "name": "StoreCraft",
        "url": "https://storecraft.com/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://storecraft.com/logo.png"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+1-555-0123",
          "contactType": "customer service"
        },
        "sameAs": [
          "https://facebook.com/storecraft",
          "https://twitter.com/storecraft",
          "https://instagram.com/storecraft"
        ]
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
