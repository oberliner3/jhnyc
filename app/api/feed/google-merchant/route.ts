import { NextResponse } from 'next/server'
import { getAllProducts } from '@/lib/api'
import { SITE_CONFIG } from '@/lib/constants'

export async function GET() {
  try {
    const products = await getAllProducts({ limit: 1000 })
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${SITE_CONFIG.name} - Product Feed</title>
    <link>${SITE_CONFIG.url}</link>
    <description>Product feed for Google Merchant Center</description>
    ${products.map(product => `
    <item>
      <g:id>${product.id}</g:id>
      <g:title><![CDATA[${product.title}]]></g:title>
      <g:description><![CDATA[${product.body_html?.replace(/<[^>]*>/g, '') || product.title}]]></g:description>
      <g:link>${SITE_CONFIG.url}/products/${product.handle}</g:link>
      <g:image_link>${product.images?.[0]?.src || `${SITE_CONFIG.url}/placeholder.svg`}</g:image_link>
      <g:availability>${product.in_stock ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${product.price} USD</g:price>
      ${product.compare_at_price ? `<g:sale_price>${product.price} USD</g:sale_price>` : ''}
      <g:brand>${product.vendor || SITE_CONFIG.name}</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${product.category || 'General'}</g:product_type>
      <g:google_product_category>${getGoogleCategory(product.category)}</g:google_product_category>
      <g:mpn>${product.id}</g:mpn>
      <g:gtin></g:gtin>
      <g:shipping_weight>${product.variants?.[0]?.grams ? `${product.variants[0].grams}g` : '100g'}</g:shipping_weight>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard</g:service>
        <g:price>9.99 USD</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Express</g:service>
        <g:price>19.99 USD</g:price>
      </g:shipping>
      ${product.tags?.map(tag => `<g:product_detail><g:attribute_name>tag</g:attribute_name><g:attribute_value>${tag}</g:attribute_value></g:product_detail>`).join('') || ''}
      <g:custom_label_0>${product.rating || 0}</g:custom_label_0>
      <g:custom_label_1>${product.review_count || 0}</g:custom_label_1>
      <g:custom_label_2>${product.vendor || 'Unknown'}</g:custom_label_2>
      <g:custom_label_3>${product.in_stock ? 'Available' : 'Out of Stock'}</g:custom_label_3>
      <g:custom_label_4>${product.compare_at_price ? 'On Sale' : 'Regular Price'}</g:custom_label_4>
    </item>`).join('')}
  </channel>
</rss>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error generating Google Merchant feed:', error)
    return new NextResponse('Error generating feed', { status: 500 })
  }
}

function getGoogleCategory(category: string | undefined): string {
  if (!category) return '166'
  
  const categoryMap: Record<string, string> = {
    'electronics': '172',
    'clothing': '1604',
    'shoes': '187',
    'accessories': '166',
    'home': '632',
    'beauty': '172',
    'sports': '499',
    'books': '784',
    'toys': '220',
    'automotive': '888',
    'health': '499',
    'jewelry': '166',
    'bags': '166',
    'watches': '166',
    'furniture': '632',
    'kitchen': '632',
    'garden': '632',
    'office': '166',
    'baby': '2984',
    'pet': '1281',
    'travel': '166',
    'music': '166',
    'movies': '166',
    'games': '166',
    'software': '166',
    'tools': '632',
    'outdoor': '499',
    'fitness': '499',
    'art': '166',
    'crafts': '166',
    'party': '166',
    'seasonal': '166',
    'clearance': '166',
    'sale': '166',
    'new': '166',
    'featured': '166',
    'bestseller': '166',
    'trending': '166'
  }
  
  return categoryMap[category.toLowerCase()] || '166'
}
