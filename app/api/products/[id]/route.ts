import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = params;

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`[API] Failed to fetch product with id ${id} from Supabase:`, error);
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
