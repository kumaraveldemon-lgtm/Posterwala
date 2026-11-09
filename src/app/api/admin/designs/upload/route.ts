import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { processDesignUpload } from "@/lib/image-processor";
import { createAdminClient } from "@/lib/supabase/admin";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const designFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.string().optional(),
  startingPrice: z.coerce.number().min(1, "Price must be at least 1 INR"),
  isActive: z.coerce.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const slug = (formData.get("slug") as string) || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;
    const tagsRaw = formData.get("tags") as string;
    const startingPrice = Number(formData.get("startingPrice") || 299);
    const isActive = formData.get("isActive") === "true";
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "High-resolution image file is required" }, { status: 400 });
    }

    // Validate form fields
    const parsed = designFormSchema.safeParse({
      title,
      slug,
      description,
      categoryId,
      tags: tagsRaw,
      startingPrice,
      isActive,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Validate file size and mime
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/tiff"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a JPG, PNG, or WebP image." },
        { status: 400 }
      );
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds 25 MB limit" },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Process image with Sharp
    const processed = await processDesignUpload(fileBuffer);

    const tags = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [];

    const highResPath = `originals/${slug}-${Date.now()}.jpg`;
    let watermarkPath = `watermarks/${slug}-${Date.now()}.jpg`;
    let thumbnailPath = `thumbnails/${slug}-${Date.now()}.jpg`;

    const supabaseAdmin = createAdminClient();
    const isMock = !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith("mock");

    if (!isMock) {
      // 1. Upload high-res original to private bucket 'secure-originals'
      await supabaseAdmin.storage
        .from("secure-originals")
        .upload(highResPath, processed.originalBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      // 2. Upload watermark to public bucket 'public-assets'
      await supabaseAdmin.storage
        .from("public-assets")
        .upload(watermarkPath, processed.watermarkBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      // 3. Upload thumbnail to public bucket 'public-assets'
      await supabaseAdmin.storage
        .from("public-assets")
        .upload(thumbnailPath, processed.thumbnailBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      // Get public URLs
      const { data: wmUrlData } = supabaseAdmin.storage
        .from("public-assets")
        .getPublicUrl(watermarkPath);
      const { data: thumbUrlData } = supabaseAdmin.storage
        .from("public-assets")
        .getPublicUrl(thumbnailPath);

      watermarkPath = wmUrlData.publicUrl;
      thumbnailPath = thumbUrlData.publicUrl;

      // Insert into designs table
      const { data: inserted, error: dbError } = await supabaseAdmin
        .from("designs")
        .insert({
          title,
          slug,
          description: description || null,
          category_id: categoryId || null,
          tags,
          high_res_storage_path: highResPath,
          watermark_storage_path: watermarkPath,
          thumbnail_storage_path: thumbnailPath,
          starting_price: startingPrice,
          is_active: isActive,
        })
        .select()
        .single();

      if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, design: inserted });
    } else {
      // Local development / fallback storage in public/uploads/
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const thumbFilename = `thumb-${slug}-${Date.now()}.jpg`;
      const wmFilename = `wm-${slug}-${Date.now()}.jpg`;
      const origFilename = `orig-${slug}-${Date.now()}.jpg`;

      await writeFile(path.join(uploadsDir, thumbFilename), processed.thumbnailBuffer);
      await writeFile(path.join(uploadsDir, wmFilename), processed.watermarkBuffer);
      await writeFile(path.join(uploadsDir, origFilename), processed.originalBuffer);

      const localThumbUrl = `/uploads/${thumbFilename}`;
      const localWmUrl = `/uploads/${wmFilename}`;

      const newDesign = {
        id: "d-" + Date.now(),
        title,
        slug,
        description,
        category_id: categoryId,
        tags,
        high_res_storage_path: `/uploads/${origFilename}`,
        watermark_storage_path: localWmUrl,
        thumbnail_storage_path: localThumbUrl,
        starting_price: startingPrice,
        is_active: isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, design: newDesign });
    }
  } catch (error: any) {
    console.error("Admin design upload failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process and upload design" },
      { status: 500 }
    );
  }
}
