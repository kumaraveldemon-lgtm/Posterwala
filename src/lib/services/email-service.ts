export interface OrderEmailParams {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  newStatus: "Received" | "Printing" | "Shipped" | "Delivered" | "Cancelled";
  trackingCarrier?: string | null;
  trackingNumber?: string | null;
  totalAmount: number;
}

/**
 * Dispatch transactional email to customer upon order status changes
 */
export async function sendOrderStatusEmail(params: OrderEmailParams): Promise<boolean> {
  const { orderNumber, customerName, customerEmail, newStatus, trackingCarrier, trackingNumber, totalAmount } = params;

  console.log(`[Email Service] Status change for Order #${orderNumber} -> ${newStatus} to ${customerEmail}`);

  const statusMessages: Record<string, { title: string; body: string }> = {
    Received: {
      title: "Order Received & Payment Confirmed",
      body: "We have received your order and payment via Razorpay. Your prints have been sent to our prepress queue for 300 DPI inspection.",
    },
    Printing: {
      title: "Your Prints Are On The Press",
      body: "Our print lab has started printing your artwork on 300 GSM archival cardstock with anti-fade pigmented inks.",
    },
    Shipped: {
      title: "Your Order Has Shipped!",
      body: `Your prints have been sealed inside heavy kraft protective tubes and handed over to ${trackingCarrier || "Delhivery Express"}. Tracking Number: ${trackingNumber || "DEL198273645IN"}.`,
    },
    Delivered: {
      title: "Delivered! Welcome to the Posterwala Family",
      body: "Your package has been safely delivered. We hope these prints bring your walls to life. Tag us on Instagram @posterwala to be featured!",
    },
    Cancelled: {
      title: "Order Cancelled & Refund Initiated",
      body: "Your order has been cancelled and a full refund has been initiated back to your original payment method.",
    },
  };

  const statusInfo = statusMessages[newStatus] || statusMessages.Received;

  // Render HTML email template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f8f6; color: #1f2937; margin: 0; padding: 24px; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #f76926; padding: 32px 24px; text-align: center; color: #ffffff; }
          .content { padding: 32px 28px; line-height: 1.6; }
          .badge { display: inline-block; padding: 6px 14px; background: #fff3ed; color: #f76926; border-radius: 20px; font-weight: 700; font-size: 13px; margin-bottom: 12px; }
          .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 14px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
          .button { display: inline-block; background: #f76926; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 26px; letter-spacing: -0.5px;">POSTERWALA</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Custom Prints & Wall Art</p>
          </div>
          <div class="content">
            <span class="badge">Status: ${newStatus}</span>
            <h2 style="margin-top: 0; color: #111827;">${statusInfo.title}</h2>
            <p>Hi ${customerName},</p>
            <p>${statusInfo.body}</p>
            
            <div class="card">
              <p style="margin: 0 0 8px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
              <p style="margin: 0 0 8px 0;"><strong>Total Paid:</strong> ₹${totalAmount}</p>
              ${trackingNumber ? `<p style="margin: 0;"><strong>Carrier:</strong> ${trackingCarrier || "Delhivery"} (Tracking: <a href="https://www.delhivery.com/track/package/${trackingNumber}">${trackingNumber}</a>)</p>` : ""}
            </div>

            <p style="font-size: 13px; color: #6b7280;">Need assistance? Reply directly to this email or call us at +91 98765 43210.</p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Posterwala India. Crafted with passion for fine art.
          </div>
        </div>
      </body>
    </html>
  `;

  // If Resend or Sendgrid API key exists, send via API
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Posterwala Updates <orders@posterwala.com>",
          to: [customerEmail],
          subject: `Update on Order #${orderNumber}: ${newStatus}`,
          html: htmlContent,
        }),
      });
    } catch (e) {
      console.warn("Failed to dispatch live Resend email:", e);
    }
  }

  return true;
}
