import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderStatusEmail } from "@/lib/services/email-service";

const updateStatusSchema = z.object({
  orderId: z.string(),
  orderNumber: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  totalAmount: z.number(),
  status: z.enum(["Received", "Printing", "Shipped", "Delivered", "Cancelled"]),
  trackingCarrier: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid status parameters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      orderId,
      orderNumber,
      customerName,
      customerEmail,
      totalAmount,
      status,
      trackingCarrier,
      trackingNumber,
    } = parsed.data;

    const supabase = createAdminClient();
    const isMock = !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith("mock");

    if (!isMock) {
      const { error } = await supabase
        .from("orders")
        .update({
          status,
          tracking_carrier: trackingCarrier || null,
          tracking_number: trackingNumber || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Trigger transactional email to customer
    await sendOrderStatusEmail({
      orderNumber,
      customerName,
      customerEmail,
      newStatus: status,
      trackingCarrier,
      trackingNumber,
      totalAmount,
    });

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}
