"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal, shippingFee, totalAmount, itemCount } = useCart();

  if (!isOpen) return null;

  const freeShippingThreshold = 499;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const diffToFree = freeShippingThreshold - subtotal;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex h-full w-full max-w-md flex-col bg-card shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-bold font-display">Your Cart</h2>
            <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-xs font-semibold text-brand-600">
              {itemCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free shipping bar */}
        <div className="bg-brand-500/5 px-6 py-3 border-b border-brand-500/10">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="flex items-center gap-1 text-brand-700">
              <Sparkles className="h-3.5 w-3.5" />
              {diffToFree <= 0
                ? "🎉 You unlocked FREE Shipping across India!"
                : `Add ${formatINR(diffToFree)} more for FREE Shipping!`}
            </span>
            <span className="text-muted-foreground">{progressToFreeShipping}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-3xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <p className="font-semibold text-lg font-display">Your cart is empty</p>
              <p className="text-sm text-muted-foreground max-w-xs mt-1">
                Explore our art collection or create custom photo prints to bring your walls to life.
              </p>
              <Link href="/designs" onClick={onClose} className="mt-6">
                <Button className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-2xl border border-border/80 bg-background/50 p-3.5 shadow-sm hover:shadow transition-all"
              >
                {/* Thumbnail */}
                <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted border border-border/50">
                  <Image
                    src={item.preview_url || item.design?.thumbnail_storage_path || "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=300&q=80"}
                    alt={item.title || "Item"}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                  {item.finish && (
                    <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 py-0.5 text-[10px] font-medium text-white uppercase tracking-wider">
                      {item.finish}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm line-clamp-1">
                        {item.title || item.product?.name || "Custom Print"}
                      </h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.size?.name || "Standard Size"}
                    </p>
                    {item.custom_config?.filter && item.custom_config.filter !== "none" && (
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground capitalize">
                        Filter: {item.custom_config.filter}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center rounded-lg border border-border bg-card">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-bold text-sm text-foreground">
                      {formatINR(item.price_inr * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border/80 p-6 space-y-4 bg-card">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? <span className="text-emerald-600 font-semibold">FREE</span> : formatINR(shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-foreground pt-2 border-t border-border">
                <span>Total Amount</span>
                <span>{formatINR(totalAmount)}</span>
              </div>
            </div>

            <Link href="/checkout" onClick={onClose} className="block w-full">
              <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium h-12 rounded-xl text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25">
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
