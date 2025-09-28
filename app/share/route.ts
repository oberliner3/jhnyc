import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const text = formData.get("text") as string;
    const url = formData.get("url") as string;
    const files = formData.getAll("files") as File[];

    // Get current user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Handle shared content
    const sharedContent = {
      title: title || "Shared Content",
      text: text || "",
      url: url || "",
      files: files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
      shared_by: user.id,
      created_at: new Date().toISOString(),
    };

    // In a real app, you might save this to a database
    console.log("Shared content:", sharedContent);

    // For now, redirect to a success page or back to the app
    return NextResponse.redirect(new URL("/?shared=true", request.url));
  } catch (error) {
    console.error("Share target error:", error);
    return NextResponse.json(
      { error: "Failed to process shared content" },
      { status: 500 }
    );
  }
}
