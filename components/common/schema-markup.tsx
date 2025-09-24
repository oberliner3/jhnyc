import { APP_CONTACTS, SITE_CONFIG } from "@/lib/constants";

export function SchemaMarkup() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_CONFIG.url}/#website`,
        url: SITE_CONFIG.url,
        name: SITE_CONFIG.name,
        description: SITE_CONFIG.description,
        potentialAction: [
          {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        ],
      },
      {
        "@type": "Organization",
        "@id": `${SITE_CONFIG.url}/#organization`,
        name: "OriGinz",
        url: `${SITE_CONFIG.url}/`,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_CONFIG.ogImage}`,
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: `${APP_CONTACTS.phone.main}`,
          contactType: "customer service",
        },
        sameAs: [
          "https://facebook.com/OriGinz",
          "https://twitter.com/OriGinz",
          "https://instagram.com/OriGinz",
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
