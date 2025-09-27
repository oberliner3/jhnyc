import { MetadataRoute } from 'next'
import { getAllProducts } from '@/lib/api'
import { SITE_CONFIG } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_CONFIG.url}/products/${product.handle}`,
    lastModified: product.updated_at,
    changeFrequency: "daily",
    priority: 0.7,
    alternates: "en",
    // TODO get images
  }));

  return [
    {
      url: SITE_CONFIG.url,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${SITE_CONFIG.url}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_CONFIG.url}/products`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...productEntries,
  ];
}
