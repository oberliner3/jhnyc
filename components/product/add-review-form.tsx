'use client'

import { useFormState } from 'react-dom'
import { addReview } from '@/app/(routes)/products/[slug]/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface AddReviewFormProps {
  productId: number
}

export function AddReviewForm({ productId }: AddReviewFormProps) {
  const [state, formAction] = useFormState(addReview.bind(null, productId), null)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="rating">Rating</Label>
        <Input id="rating" name="rating" type="number" min="1" max="5" />
      </div>
      <div>
        <Label htmlFor="comment">Comment</Label>
        <Textarea id="comment" name="comment" />
      </div>
      <Button type="submit">Submit Review</Button>
      {state?.message && <p className="text-sm text-muted-foreground">{state.message}</p>}
    </form>
  )
}
