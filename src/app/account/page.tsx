"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthModal } from "@/components/auth/auth-modal";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  ExternalLink,
  User,
  Shield,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

export default function AccountPage() {
  const { user, profile, isAdmin, logout, loginAsDemoAdmin, loginAsDemoCustomer } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // If not logged in, prompt sign in
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 text-center shadow-xl space-y-6">
          <div className="h-16 w-16 rounded-3xl bg-brand-500/10 text-brand-600 flex items-center justify-center mx-auto">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display">Account Access</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Sign in with your email or Google to track print orders and manage deliveries.
            </p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl h-11"
            >
              Sign In / Create Account
            </Button>
            <Button
              variant="outline"
              onClick={loginAsDemoCustomer}
              className="w-full rounded-xl text-xs"
            >
              ⚡ Instant Demo Customer Login
            </Button>
          </div>
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
      </div>
    );
  }

  const userOrders = MOCK_ORDERS;

  return (
    <div className="min-h-screen py-10 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl space-y-8">
        {/* Profile Card */}
        <Card className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500" />
          <CardContent className="pt-0 px-6 sm:px-8 pb-6 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-12 sm:-mt-10 gap-4">
              <div className="flex items-end gap-4">
                <div className="h-20 w-20 rounded-2xl bg-white border-4 border-card shadow-lg flex items-center justify-center text-brand-600 font-display font-black text-2xl uppercase overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    profile?.full_name?.charAt(0) || user.email.charAt(0)
                  )}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                    {profile?.full_name || "Valued Customer"}
                  </h1>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={isAdmin ? "brand" : "secondary"} className="uppercase font-bold text-xs">
                  {profile?.role || "Customer"}
                </Badge>
                {isAdmin ? (
                  <Link href="/admin">
                    <Button size="sm" className="rounded-xl text-xs bg-slate-900 text-white">
                      Admin Portal
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={loginAsDemoAdmin}
                    className="rounded-xl text-xs border-amber-500/40 text-amber-700 bg-amber-500/5 hover:bg-amber-500/10"
                  >
                    Switch to Admin Demo
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={logout} className="rounded-xl text-xs text-muted-foreground hover:text-destructive">
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black font-display tracking-tight text-foreground">
                Your Order History
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time tracking from prepress to your doorstep.
              </p>
            </div>
            <Link href="/designs">
              <Button size="sm" variant="outline" className="rounded-xl text-xs flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5" />
                Browse Catalog
              </Button>
            </Link>
          </div>

          {userOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg">No orders yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                When you order custom posters, polaroids or fine art prints, they will appear here with live tracking.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {userOrders.map((order) => {
                // Tracking stages
                const stages = ["Received", "Printing", "Shipped", "Delivered"];
                const currentStageIdx = stages.indexOf(order.status);

                return (
                  <Card key={order.id} className="rounded-3xl border-border/80 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border/60 py-4 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-foreground font-mono text-sm">
                          {order.order_number}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-foreground text-sm">
                          {formatINR(order.total_amount)}
                        </span>
                        <Badge
                          variant={
                            order.status === "Delivered"
                              ? "success"
                              : order.status === "Shipped"
                              ? "default"
                              : "secondary"
                          }
                          className="rounded-full text-xs capitalize"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                      {/* 4-Stage Visual Status Progress Bar */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          {stages.map((st, idx) => {
                            const isDone = idx <= currentStageIdx;
                            const isCurrent = idx === currentStageIdx;
                            return (
                              <div
                                key={st}
                                className={`rounded-xl p-2.5 transition-all font-semibold ${
                                  isCurrent
                                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                                    : isDone
                                    ? "bg-brand-500/15 text-brand-700"
                                    : "bg-muted text-muted-foreground font-normal"
                                }`}
                              >
                                {isDone ? `✓ ${st}` : st}
                              </div>
                            );
                          })}
                        </div>

                        {/* Tracking Carrier Link if Shipped */}
                        {order.tracking_number && (
                          <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-900 dark:text-blue-200 mt-3">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-blue-600" />
                              <span>
                                Handed over to <strong>{order.tracking_carrier}</strong> (AWB: {order.tracking_number})
                              </span>
                            </div>
                            <a
                              href={`https://www.delhivery.com/track/package/${order.tracking_number}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline"
                            >
                              Track Live Package
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Items List */}
                      <div className="divide-y divide-border/60 border-t border-border/60 pt-4 space-y-3">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex items-center justify-between pt-3 text-xs">
                            <div className="flex items-center gap-3">
                              <div className="relative h-14 w-11 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
                                <Image
                                  src={item.design?.thumbnail_storage_path || "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=200&q=80"}
                                  alt={item.product_name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-foreground text-sm">{item.product_name}</p>
                                <p className="text-muted-foreground">{item.size_name} • {item.finish} finish</p>
                                <p className="text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-bold text-foreground">
                              {formatINR(item.total_price)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Address Details */}
                      <div className="rounded-2xl bg-muted/30 p-3.5 text-xs text-muted-foreground">
                        <strong className="text-foreground">Shipping To: </strong>
                        {order.shipping_name}, {order.shipping_address}, {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode} (Tel: {order.shipping_phone})
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
