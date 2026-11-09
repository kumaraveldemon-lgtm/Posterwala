"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, Truck, ArrowRight, Home } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get("orderNumber") || "PW-782194";
  const paymentId = searchParams?.get("paymentId") || "pay_mock_verified";

  return (
    <div className="max-w-xl mx-auto rounded-3xl border border-border/80 bg-card p-8 sm:p-12 shadow-2xl text-center space-y-8">
      {/* Success Badge */}
      <div className="flex flex-col items-center">
        <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-5 animate-in zoom-in-75 duration-300">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full">
          Payment Confirmed via Razorpay
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-foreground mt-3">
          Thank you for your order!
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          We&apos;ve sent a detailed confirmation receipt and tracking updates to your email.
        </p>
      </div>

      {/* Order Reference Box */}
      <div className="rounded-2xl border border-border bg-muted/40 p-4 text-xs space-y-2 text-left">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Order Reference:</span>
          <span className="font-bold text-foreground font-mono">{orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Razorpay Payment ID:</span>
          <span className="font-mono text-muted-foreground">{paymentId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Estimated Dispatch:</span>
          <span className="font-semibold text-foreground">Within 24-48 Hours</span>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="space-y-3 text-left">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Live Order Status
        </h4>
        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
          <div className="rounded-xl bg-brand-500 text-white p-2 font-semibold shadow-sm">
            ✓ Received
          </div>
          <div className="rounded-xl bg-muted text-muted-foreground p-2 font-medium">
            Printing
          </div>
          <div className="rounded-xl bg-muted text-muted-foreground p-2 font-medium">
            Shipped
          </div>
          <div className="rounded-xl bg-muted text-muted-foreground p-2 font-medium">
            Delivered
          </div>
        </div>
      </div>

      {/* Next Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link href="/account" className="flex-1">
          <Button variant="outline" className="w-full rounded-xl flex items-center justify-center gap-2">
            <Package className="h-4 w-4" />
            Track in My Account
          </Button>
        </Link>
        <Link href="/designs" className="flex-1">
          <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl flex items-center justify-center gap-2">
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 flex items-center justify-center">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading receipt details...</p>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
