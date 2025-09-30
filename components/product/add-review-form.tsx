"use client";

import { useId } from "react";
import { useFormState } from "react-dom";
import { addReview } from "@/app/(store)/products/[handle]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddReviewFormProps {
	productId: number;
}

export function AddReviewForm({ productId }: AddReviewFormProps) {
	const [state, formAction] = useFormState(
		addReview.bind(null, productId),
		null,
	);

	const ratingId = useId();
	const commentId = useId();

	return (
		<form action={formAction} className="space-y-4">
			<div>
				<Label htmlFor={ratingId}>Rating</Label>
				<Input id={ratingId} name="rating" type="number" min="1" max="5" />
			</div>
			<div>
				<Label htmlFor={commentId}>Comment</Label>
				<Textarea id={commentId} name="comment" />
			</div>
			<Button type="submit">Submit Review</Button>
			{state?.message && (
				<p className="text-muted-foreground text-sm">{state.message}</p>
			)}
		</form>
	);
}
