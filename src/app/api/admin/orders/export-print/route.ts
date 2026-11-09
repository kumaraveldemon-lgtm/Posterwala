import { NextRequest, NextResponse } from "next/server";
import { generatePrintReadyBuffer } from "@/lib/image-processor";
import { createAdminClient } from "@/lib/supabase/admin";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("orderNumber") || "ORDER";
    const widthPx = Number(searchParams.get("width") || 2480); // e.g. A4 300 DPI
    const heightPx = Number(searchParams.get("height") || 3508);
    const bleedMm = Number(searchParams.get("bleed") || 3);
    const filePath = searchParams.get("filePath");

    // Total bleed in pixels (both sides): 3mm * 2 = 6mm
    // 6mm in inches = 6 / 25.4 = 0.236 in * 300 dpi = ~71 px
    const totalBleedPx = Math.round(((bleedMm * 2) / 25.4) * 300);
    const targetWidth = widthPx + totalBleedPx;
    const targetHeight = heightPx + totalBleedPx;

    let inputBuffer: Buffer;

    if (filePath && filePath.startsWith("/uploads/")) {
      // Local development file
      const absolutePath = path.join(process.cwd(), "public", filePath);
      inputBuffer = await readFile(absolutePath);
    } else if (filePath && filePath.startsWith("http")) {
      // Remote URL
      const res = await fetch(filePath);
      inputBuffer = Buffer.from(await res.arrayBuffer());
    } else if (filePath) {
      // Supabase Storage
      const supabase = createAdminClient();
      const { data, error } = await supabase.storage
        .from("secure-originals")
        .download(filePath);

      if (error || !data) {
        throw new Error("Could not download original file from secure-originals storage");
      }
      inputBuffer = Buffer.from(await data.arrayBuffer());
    } else {
      // Fallback high-res sample
      const res = await fetch("https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=2400&q=90");
      inputBuffer = Buffer.from(await res.arrayBuffer());
    }

    // Generate 300 DPI print-ready buffer with bleed
    const printBuffer = await generatePrintReadyBuffer(inputBuffer, targetWidth, targetHeight);

    return new NextResponse(new Uint8Array(printBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/tiff",
        "Content-Disposition": `attachment; filename="print-ready-300dpi-${orderNumber}-${targetWidth}x${targetHeight}.tiff"`,
        "X-DPI": "300",
        "X-Bleed-MM": bleedMm.toString(),
      },
    });
  } catch (error: any) {
    console.error("Print export error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate print-ready file" },
      { status: 500 }
    );
  }
}
