import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
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
				{ status: 401 },
			);
		}

		// Validate file types
		const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
		const maxSize = 10 * 1024 * 1024; // 10MB

		for (const file of files) {
			if (!allowedTypes.includes(file.type)) {
				return NextResponse.json(
					{
						error: `File type ${file.type} not allowed. Only images are supported.`,
					},
					{ status: 400 },
				);
			}

			if (file.size > maxSize) {
				return NextResponse.json(
					{
						error: `File ${file.name} is too large. Maximum size is 10MB.`,
					},
					{ status: 400 },
				);
			}
		}

		// Process uploaded files
		const uploadedFiles = [];

		for (const file of files) {
			// In a real app, you would upload to a cloud storage service
			// For now, we'll just return file information
			const fileInfo = {
				name: file.name,
				size: file.size,
				type: file.type,
				lastModified: file.lastModified,
				uploaded_at: new Date().toISOString(),
			};

			uploadedFiles.push(fileInfo);
		}

		return NextResponse.json({
			success: true,
			message: `Successfully processed ${uploadedFiles.length} file(s)`,
			files: uploadedFiles,
		});
	} catch (error) {
		console.error("File upload error:", error);
		return NextResponse.json(
			{ error: "Failed to process uploaded files" },
			{ status: 500 },
		);
	}
}
