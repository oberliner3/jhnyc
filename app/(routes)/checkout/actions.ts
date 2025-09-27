'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export interface CheckoutItem {
  productId: string
  variantId: string
  quantity: number
  price: number
}

export interface CheckoutCustomer {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
  country: string
  phone?: string
}

export interface CheckoutTotals {
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export interface CheckoutData {
  items: CheckoutItem[]
  customer: CheckoutCustomer
  totals: CheckoutTotals
}

export async function handleCheckout(data: CheckoutData) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'Pending',
        total: data.totals.total,
        shipping_address: {
          name: `${data.customer.firstName} ${data.customer.lastName}`,
          address: data.customer.address,
          city: data.customer.city,
          postal_code: data.customer.postalCode,
          country: data.customer.country,
          phone: data.customer.phone
        },
        billing_address: {
          name: `${data.customer.firstName} ${data.customer.lastName}`,
          address: data.customer.address,
          city: data.customer.city,
          postal_code: data.customer.postalCode,
          country: data.customer.country,
          phone: data.customer.phone
        }
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return { success: false, error: 'Failed to create order' }
    }

    // Create order items
    const orderItems = data.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
      price: item.price
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Order items creation error:', itemsError)
      return { success: false, error: 'Failed to create order items' }
    }

    // Clear user's cart
    const { error: cartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', (await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single()
      ).data?.id)

    if (cartError) {
      console.error('Cart clearing error:', cartError)
      // Don't fail the order for cart clearing issues
    }

    // If Shopify integration is enabled, create draft order
    if (process.env.SHOPIFY_SHOP && process.env.SHOPIFY_TOKEN) {
      try {
        // Import the worker function to process checkout data
        const { processCheckoutData } = await import('@/lib/worker')
        
        // Process the checkout data using the worker
        processCheckoutData(data)
        
        // Create Shopify draft order
        const draftOrder = await createShopifyDraftOrder(data)
        
        if (draftOrder?.invoice_url) {
          // Redirect to Shopify checkout
          redirect(draftOrder.invoice_url)
        }
      } catch (shopifyError) {
        console.error('Shopify integration error:', shopifyError)
        // Continue with regular checkout if Shopify fails
      }
    }

    return { 
      success: true, 
      orderId: order.id,
      message: 'Order created successfully'
    }

  } catch (error) {
    console.error('Checkout error:', error)
    return { 
      success: false, 
      error: 'An unexpected error occurred during checkout' 
    }
  }
}

export async function createShopifyDraftOrder(data: CheckoutData) {
  if (!process.env.SHOPIFY_SHOP || !process.env.SHOPIFY_TOKEN) {
    throw new Error('Shopify configuration missing')
  }

  const shop = process.env.SHOPIFY_SHOP
  const token = process.env.SHOPIFY_TOKEN

  // Create line items for Shopify
  const lineItems = data.items.map(item => ({
    title: `Product ${item.productId}`,
    price: item.price.toFixed(2),
    quantity: item.quantity,
    variant_id: item.variantId
  }))

  const draftOrderData = {
    draft_order: {
      line_items: lineItems,
      customer: {
        email: data.customer.email,
        first_name: data.customer.firstName,
        last_name: data.customer.lastName,
        addresses: [{
          first_name: data.customer.firstName,
          last_name: data.customer.lastName,
          address1: data.customer.address,
          city: data.customer.city,
          zip: data.customer.postalCode,
          country: data.customer.country,
          phone: data.customer.phone
        }]
      },
      shipping_address: {
        first_name: data.customer.firstName,
        last_name: data.customer.lastName,
        address1: data.customer.address,
        city: data.customer.city,
        zip: data.customer.postalCode,
        country: data.customer.country,
        phone: data.customer.phone
      },
      billing_address: {
        first_name: data.customer.firstName,
        last_name: data.customer.lastName,
        address1: data.customer.address,
        city: data.customer.city,
        zip: data.customer.postalCode,
        country: data.customer.country,
        phone: data.customer.phone
      },
      use_customer_default_address: false
    }
  }

  const response = await fetch(
    `https://${shop}/admin/api/2024-01/draft_orders.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(draftOrderData),
    }
  )

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('Shopify API Error:', errorBody)
    throw new Error(`Failed to create Shopify draft order: ${response.statusText}`)
  }

  const responseData = await response.json()
  return responseData.draft_order
}
