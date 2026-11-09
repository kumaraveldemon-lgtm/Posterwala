import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sizeId = formData.get("sizeId") as string;
    const userId = (formData.get("userId") as string) || null;
    const calculatedDpi = Number(formData.get("calculatedDpi") || 300);

    if (!file) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 25 MB maximum limit" }, { status: 400 });
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Supported formats: JPG, PNG, WebP, PDF" },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    let width = 1200;
    let height = 1600;

    // Read dimensions using Sharp if image
    if (file.type !== "application/pdf") {
      try {
        const meta = await sharp(fileBuffer).metadata();
        width = meta.width || 1200;
        height = meta.height || 1600;
      } catch (e) {
        console.warn("Could not parse image metadata with sharp:", e);
      }
    }

    const originalFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueStorageKey = `customer-uploads/${Date.now()}-${originalFilename}`;

    const supabase = createAdminClient();
    const isMock = !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith("mock");

    const originalPath = uniqueStorageKey;
    void originalPath;

    if (!isMock) {
      // Store untouched ORIGINAL in private bucket 'secure-originals'
      const { error: storageError } = await supabase.storage
        .from("secure-originals")
        .upload(uniqueStorageKey, fileBuffer, {
          contentType: file.type,
          upsert: true,
        });

      if (storageError) {
        return NextResponse.json({ error: storageError.message }, { status: 500 });
      }

      // Record in uploads table
      const { data: uploadRecord, error: dbError } = await supabase
        .from("uploads")
        .insert({
          user_id: userId,
          original_storage_path: uniqueStorageKey,
          filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          width,
          height,
          calculated_dpi: calculatedDpi,
          dpi_check: calculatedDpi >= 150,
        })
        .select()
        .single();

      if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        upload: uploadRecord,
      });
    } else {
      // Local fallback storage in public/uploads/
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const localFilename = `cust-${Date.now()}-${originalFilename}`;
      await writeFile(path.join(uploadsDir, localFilename), fileBuffer);

      const localUpload = {
        id: "up-" + Date.now(),
        user_id: userId,
        original_storage_path: `/uploads/${localFilename}`,
        preview_storage_path: `/uploads/${localFilename}`,
        filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        width,
        height,
        calculated_dpi: calculatedDpi,
        dpi_check: calculatedDpi >= 150,
        created_at: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        upload: localUpload,
      });
    }
  } catch (error: any) {
    console.error("Custom upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process upload" },
      { status: 500 }
    );
  }
}
