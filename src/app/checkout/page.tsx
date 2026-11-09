"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  CreditCard,
  Truck,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shippingFee, totalAmount, clearCart } = useCart();
  const { user, profile } = useAuth();

  // Shipping Address State
  const [shippingName, setShippingName] = useState(profile?.full_name || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [shippingPhone, setShippingPhone] = useState(profile?.phone || "");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPincode, setShippingPincode] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [showMockRazorpayModal, setShowMockRazorpayModal] = useState<any | null>(null);

  if (items.length === 0 && !showMockRazorpayModal) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="h-16 w-16 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold font-display">Your Cart is Empty</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Add prints from our catalog or upload custom photos to proceed.
        </p>
        <Link href="/designs" className="mt-6 inline-block">
          <Button className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl">
            Browse Catalog
          </Button>
        </Link>
      </div>
    );
  }

  // Load Razorpay JS SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!shippingName.trim() || !customerEmail.trim() || !shippingPhone.trim()) {
      toast.error("Please fill in contact and shipping details");
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(shippingPincode.trim())) {
      toast.error("Please enter a valid 6-digit Indian PIN code");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on server
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            designId: i.design_id || null,
            uploadId: i.upload_id || null,
            productId: i.product_id,
            sizeId: i.size_id,
            productName: i.product?.name || "Print",
            sizeName: i.size?.name || "Standard",
            finish: i.finish,
            quantity: i.quantity,
            unitPrice: i.price_inr,
            customConfig: i.custom_config,
          })),
          shippingName,
          shippingPhone,
          customerEmail,
          shippingAddress,
          shippingCity,
          shippingState,
          shippingPincode,
          userId: user?.id || null,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || "Failed to initialize order");
      }

      // Check if real Razorpay keys are configured
      const isRealRazorpay = orderData.keyId && !orderData.keyId.includes("mock");

      if (isRealRazorpay) {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amountPaise,
          currency: orderData.currency,
          name: "Posterwala India",
          description: `Order #${orderData.orderNumber} - Custom Prints`,
          order_id: orderData.razorpayOrderId,
          prefill: {
            name: shippingName,
            email: customerEmail,
            contact: shippingPhone,
          },
          theme: {
            color: "#f76926",
          },
          handler: function (response: any) {
            clearCart();
            router.push(
              `/checkout/success?orderNumber=${orderData.orderNumber}&orderId=${orderData.orderId}&paymentId=${response.razorpay_payment_id}`
            );
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              toast.info("Payment was cancelled");
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Show integrated simulator modal for instant frictionless testing
        setShowMockRazorpayModal(orderData);
      }
    } catch (err: any) {
      toast.error(err.message || "Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const completeSimulatedPayment = () => {
    if (!showMockRazorpayModal) return;
    const { orderNumber, orderId } = showMockRazorpayModal;
    clearCart();
    toast.success("Payment verified! Order marked as Received.");
    router.push(
      `/checkout/success?orderNumber=${orderNumber}&orderId=${orderId}&paymentId=pay_mock_${Date.now()}`
    );
  };

  return (
    <div className="min-h-screen py-10 pb-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/designs"
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-foreground mb-8">
            Secure Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Shipping Details Form */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleCheckoutSubmit} id="checkout-form" className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Truck className="h-5 w-5 text-brand-600" />
                      1. Contact & Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Full Name *
                        </label>
                        <Input
                          placeholder="e.g. Aarav Sharma"
                          value={shippingName}
                          onChange={(e) => setShippingName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          Mobile Number *
                        </label>
                        <Input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={shippingPhone}
                          onChange={(e) => setShippingPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Email Address (for Order Updates & Tracking) *
                      </label>
                      <Input
                        type="email"
                        placeholder="aarav@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Street Address / Flat / Building *
                      </label>
                      <Input
                        placeholder="Flat 402, Lotus Grandeur, Veera Desai Road"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          City *
                        </label>
                        <Input
                          placeholder="Mumbai"
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          State *
                        </label>
                        <Input
                          placeholder="Maharashtra"
                          value={shippingState}
                          onChange={(e) => setShippingState(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          PIN Code *
                        </label>
                        <Input
                          placeholder="400053"
                          value={shippingPincode}
                          onChange={(e) => setShippingPincode(e.target.value)}
                          maxLength={6}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method Notice */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-brand-600" />
                      2. Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-2xl border-2 border-brand-500 bg-brand-500/5 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded-full border-4 border-brand-500 bg-white" />
                        <div>
                          <p className="font-bold text-sm text-foreground">Razorpay Payment Gateway</p>
                          <p className="text-xs text-muted-foreground">
                            UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-xs text-brand-600 bg-brand-500/10 px-2 py-0.5 rounded-full">
                        Instant & Secure
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Order Summary ({items.length} items)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 text-xs">
                        <div className="relative h-16 w-14 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
                          <Image
                            src={item.preview_url || item.design?.thumbnail_storage_path || "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=200&q=80"}
                            alt={item.title || "Item"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground line-clamp-1">{item.title || item.product?.name}</p>
                          <p className="text-muted-foreground mt-0.5">{item.size?.name} • {item.finish}</p>
                          <p className="text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-foreground">
                          {formatINR(item.price_inr * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-3 space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatINR(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping Fee</span>
                      <span>
                        {shippingFee === 0 ? (
                          <span className="text-emerald-600 font-semibold">FREE</span>
                        ) : (
                          formatINR(shippingFee)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border">
                      <span>Total Amount (INR)</span>
                      <span className="text-base text-brand-600">{formatINR(totalAmount)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    form="checkout-form"
                    disabled={isProcessing}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold h-13 rounded-2xl text-base shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Sparkles className="h-4 w-4 animate-spin" />
                        Initiating Razorpay...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Pay {formatINR(totalAmount)} via Razorpay
                      </>
                    )}
                  </Button>

                  <div className="rounded-xl bg-muted/50 p-3 text-[11px] text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1.5 text-foreground font-semibold">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Posterwala Quality Guarantee
                    </p>
                    <p>
                      If your prints arrive damaged or with printing defects, we will reprint and ship a replacement immediately with zero questions asked.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Simulator Modal for Testing / Demo */}
      {showMockRazorpayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  RZP
                </div>
                <div>
                  <h3 className="font-bold text-sm">Razorpay Checkout Sandbox</h3>
                  <p className="text-[11px] text-muted-foreground">Posterwala India Payment Gateway</p>
                </div>
              </div>
              <span className="font-bold text-brand-600 text-base">
                {formatINR(showMockRazorpayModal.amount)}
              </span>
            </div>

            <div className="rounded-2xl bg-muted/60 p-4 text-xs space-y-2">
              <p className="font-semibold text-foreground">Razorpay Order ID: <span className="font-mono text-muted-foreground">{showMockRazorpayModal.razorpayOrderId}</span></p>
              <p className="font-semibold text-foreground">Internal Order #: <span className="font-mono text-brand-600">{showMockRazorpayModal.orderNumber}</span></p>
              <p className="text-muted-foreground">Select a test scenario below to simulate payment verification via webhook/gateway:</p>
            </div>

            <div className="space-y-2.5">
              <Button
                onClick={completeSimulatedPayment}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 rounded-xl flex items-center justify-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                Simulate Successful Payment (Captured)
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowMockRazorpayModal(null)}
                className="w-full rounded-xl text-xs"
              >
                Cancel Transaction
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
