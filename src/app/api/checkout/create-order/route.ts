import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRazorpayClient } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { MOCK_PRODUCT_SIZES } from "@/lib/mock-data";

const orderItemSchema = z.object({
  designId: z.string().nullable().optional(),
  uploadId: z.string().nullable().optional(),
  productId: z.string(),
  sizeId: z.string(),
  productName: z.string(),
  sizeName: z.string(),
  finish: z.enum(["matte", "glossy"]),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(1),
  customConfig: z.any().optional(),
});

const checkoutSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Cart cannot be empty"),
  shippingName: z.string().min(2, "Full name is required"),
  shippingPhone: z.string().min(10, "Valid 10-digit phone number is required"),
  customerEmail: z.string().email("Valid email address is required"),
  shippingAddress: z.string().min(5, "Complete street address is required"),
  shippingCity: z.string().min(2, "City is required"),
  shippingState: z.string().min(2, "State is required"),
  shippingPincode: z.string().regex(/^[1-9][0-9]{5}$/, "Valid 6-digit Indian PIN code required"),
  userId: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      items,
      shippingName,
      shippingPhone,
      customerEmail,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPincode,
      userId,
    } = parsed.data;

    // Calculate authoritative server-side subtotal
    let subtotal = 0;
    items.forEach((item) => {
      // Find standard price from product_sizes if available
      const sizeDef = MOCK_PRODUCT_SIZES.find((s) => s.id === item.sizeId);
      const unitPrice = sizeDef ? sizeDef.price_inr : item.unitPrice;
      subtotal += unitPrice * item.quantity;
    });

    const shippingFee = subtotal > 499 ? 0 : 60;
    const totalAmount = subtotal + shippingFee;
    const orderNumber = "PW-" + Math.floor(100000 + Math.random() * 900000);

    const razorpay = getRazorpayClient();
    let razorpayOrderId = "order_mock_" + Date.now();

    if (razorpay) {
      // Create order in Razorpay (amount in paise)
      const rzOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: orderNumber,
        notes: {
          customerEmail,
          customerPhone: shippingPhone,
        },
      });
      razorpayOrderId = rzOrder.id;
    }

    // Persist in Supabase if live, else mock fallback
    const supabase = createAdminClient();
    const isMock = !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith("mock");

    let orderId = "ord-" + Date.now();

    if (!isMock) {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: userId || null,
          customer_email: customerEmail,
          total_amount: totalAmount,
          currency: "INR",
          status: "Received",
          shipping_name: shippingName,
          shipping_phone: shippingPhone,
          shipping_address: shippingAddress,
          shipping_city: shippingCity,
          shipping_state: shippingState,
          shipping_pincode: shippingPincode,
        })
        .select()
        .single();

      if (orderError) {
        console.error("Order creation failed in database:", orderError);
        return NextResponse.json({ error: orderError.message }, { status: 500 });
      }

      orderId = orderData.id;

      // Insert order items
      const orderItemsToInsert = items.map((item) => ({
        order_id: orderId,
        design_id: item.designId || null,
        upload_id: item.uploadId || null,
        product_id: item.productId,
        size_id: item.sizeId,
        product_name: item.productName,
        size_name: item.sizeName,
        finish: item.finish,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
        custom_config: item.customConfig || null,
      }));

      await supabase.from("order_items").insert(orderItemsToInsert);

      // Insert payment record
      await supabase.from("payments").insert({
        order_id: orderId,
        razorpay_order_id: razorpayOrderId,
        status: "created",
        amount: totalAmount,
        currency: "INR",
      });
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      razorpayOrderId,
      amount: totalAmount,
      amountPaise: Math.round(totalAmount * 100),
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock_posterwala",
      customer: {
        name: shippingName,
        email: customerEmail,
        phone: shippingPhone,
      },
    });
  } catch (error: any) {
    console.error("Checkout order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
