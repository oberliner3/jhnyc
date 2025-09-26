import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new NextResponse(JSON.stringify(orders), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { total, items } = await request.json();

  const { data: newOrder, error } = await supabase
    .from("orders")
    .insert([{ user_id: user.id, total, items }])
    .select();

  if (error) {
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new NextResponse(JSON.stringify(newOrder), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
