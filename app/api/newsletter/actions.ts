'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()

  await supabase.from('newsletter_subscriptions').insert({ email })

  revalidatePath('/')
}
