import type { Metadata } from "next";
import { SITE_CONFIG } from "./constants";
export type OgType = "website" | "article" | "product";

export function generateSEO({
  title,
  description,
  image,
  path = "",
}: {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  type?: OgType;
}): Metadata {
  const seoTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.name;
  const seoDescription = description || SITE_CONFIG.description;
  const seoImage = image || SITE_CONFIG.ogImage;
  const seoUrl = `${SITE_CONFIG.url}${path}`;

  return {
    metadataBase: new URL(SITE_CONFIG.url),
    title: seoTitle,
    description: seoDescription,
    keywords: SITE_CONFIG.keywords,
    authors: [{ name: SITE_CONFIG.author }],
    creator: SITE_CONFIG.author,
    publisher: SITE_CONFIG.name,
    generator: "X-OriGenZ v0",
    applicationName: SITE_CONFIG.domain.split(".")[0],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: seoUrl,
      title: seoTitle,
      countryName: "UK",
      description: seoDescription,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: seoImage,
          width: 1200,
          height: 630,
          alt: seoTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [seoImage],
      creator: "@OriGinz",
    },
    facebook: {
      appId: "",
    },
    verification: {
      google: "",
      me: "",
      yandex: "",
      yahoo: "",
    },
    pinterest: {
      richPin: "",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: SITE_CONFIG.name,
      startupImage: {
        url: "string;",
        media: "string | undefined;",
      },
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-icon.png",
    },

    manifest: "/manifest",
    alternates: {
      canonical: seoUrl,
    },
  };
}
