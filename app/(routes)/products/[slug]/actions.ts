'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addReview(productId: number, prevState: { success: boolean; message: string; } | null, formData: FormData) {
  const rating = Number(formData.get('rating'))
  const comment = formData.get('comment') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'You must be logged in to add a review' }
  }

  const { error } = await supabase.from('reviews').insert({
    product_id: productId,
    user_id: user.id,
    rating,
    comment,
  })

  if (error) {
    return { success: false, message: 'Could not add review' }
  }

  revalidatePath(`/products/${productId}`)

  return { success: true, message: 'Successfully added review' }
}
