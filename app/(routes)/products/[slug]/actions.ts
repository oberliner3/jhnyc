"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function addReview(
  productId: number,
  prevState: { success: boolean; message: string } | null,
  formData: FormData
) {
  // Validate rating
  const rating = Number(formData.get("rating"));
  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    return {
      ...prevState,
      success: false,
      message: "Please provide a valid rating between 1 and 5",
    };
  }

  // Validate comment
  const comment = (formData.get("comment") as string).trim();
  if (!comment) {
    return {
      ...prevState,
      success: false,
      message: "Please provide a review comment",
    };
  }

  // Check if user is logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ...prevState,
      success: false,
      message: "You must be logged in to add a review",
    };
  }

  try {
    // Check if user has already reviewed this product
    const { data: existingReview } = await supabase
      .from("reviews")
      .select()
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .single();

    if (existingReview) {
      return {
        ...prevState,
        success: false,
        message: "You have already reviewed this product",
      };
    }

    // Add new review
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user.id,
      rating,
      comment,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    revalidatePath(`/products/${productId}`);

    return {
      success: true,
      message: "Thank you for your review!",
    };
  } catch (error) {
    console.error("Error adding review:", error);
    return {
      ...prevState,
      success: false,
      message: "An error occurred while adding your review. Please try again.",
    };
  }
}
