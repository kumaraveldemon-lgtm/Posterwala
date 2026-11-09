"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Layers,
  Upload,
  ShoppingBag,
  ArrowLeft,
  Settings,
  AlertTriangle,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isLoading, loginAsDemoAdmin } = useAuth();

  useEffect(() => {
    // If not loading and not admin, prompt or redirect
  }, [user, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse text-sm">Verifying admin access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold font-display">Admin Portal Protected</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            This area requires an Administrator role. If you are developing or testing, use the instant demo switcher below.
          </p>
          <div className="space-y-3">
            <Button
              onClick={loginAsDemoAdmin}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl"
            >
              Sign In as Admin (One-Click Demo)
            </Button>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full rounded-xl">
                Return to Storefront
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Orders Dashboard", href: "/admin/orders", icon: ShoppingBag },
    { label: "Curated Designs", href: "/admin/designs", icon: Layers },
    { label: "Upload New Design", href: "/admin/designs/new", icon: Upload },
    { label: "Products & Sizes", href: "/admin/products", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Admin Top Header */}
      <div className="border-b border-border bg-card px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Posterwala Staff
            </span>
            <h1 className="text-base font-bold text-foreground">Admin Control Center</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-xl bg-background"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Public Shop
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-8 py-8">
        {/* Navigation tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-border/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href) && item.href !== "/admin/designs");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  active
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-card text-muted-foreground hover:text-foreground hover:bg-card/80 border border-border/80"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {children}
      </div>
    </div>
  );
}
