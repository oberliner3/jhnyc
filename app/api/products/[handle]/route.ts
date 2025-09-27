import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: { handle: string } }
) {
  const supabase = await createClient();
  const { handle } = context.params;

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("handle", handle)
    .single();

  if (error) {
    console.error(`[API] Failed to fetch product with handle ${handle} from Supabase:`, error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
