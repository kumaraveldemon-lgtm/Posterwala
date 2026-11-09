import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "mock_webhook_secret";

    // Verify webhook cryptographic signature
    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
    const isMock = !process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET.startsWith("mock");

    if (!isValid && !isMock) {
      console.error("Razorpay webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle payment.captured or order.paid
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id || payload.payload?.order?.entity?.id;
      const razorpayPaymentId = paymentEntity?.id;
      const amountPaise = paymentEntity?.amount || payload.payload?.order?.entity?.amount;

      if (razorpayOrderId) {
        const supabase = createAdminClient();
        const isSupabaseMock = !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith("mock");

        if (!isSupabaseMock) {
          // Find payment record
          const { data: paymentRecord } = await supabase
            .from("payments")
            .select("order_id")
            .eq("razorpay_order_id", razorpayOrderId)
            .single();

          if (paymentRecord) {
            // Update payment record to captured
            await supabase
              .from("payments")
              .update({
                status: "captured",
                razorpay_payment_id: razorpayPaymentId,
                raw_response: payload,
                updated_at: new Date().toISOString(),
              })
              .eq("razorpay_order_id", razorpayOrderId);

            // Mark order as Received (Paid and queued for print)
            await supabase
              .from("orders")
              .update({
                status: "Received",
                updated_at: new Date().toISOString(),
              })
              .eq("id", paymentRecord.order_id);

            console.log(`Order ${paymentRecord.order_id} marked paid via Razorpay webhook.`);
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Razorpay webhook handler error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
