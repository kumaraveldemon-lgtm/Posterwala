"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
import { CartDrawer } from "@/components/cart/cart-drawer";
import {
  ShoppingBag,
  Sparkles,
  Menu,
  X,
  User,
  Shield,
  LogOut,
  Palette,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md transition-all">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-amber-500 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                <Palette className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-black tracking-tight text-foreground">
                  POSTER<span className="text-brand-500">WALA</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-muted-foreground -mt-1">
                  Custom Prints & Art
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/designs"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  pathname.startsWith("/designs")
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                Curated Catalog
              </Link>

              <Link
                href="/custom"
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  pathname === "/custom"
                    ? "bg-brand-500/10 text-brand-600 font-semibold"
                    : "text-foreground hover:bg-brand-500/10 hover:text-brand-600"
                }`}
              >
                <Sparkles className="h-4 w-4 text-brand-500 animate-pulse" />
                Custom Studio
                <span className="ml-1 rounded-full bg-brand-500 px-1.5 py-0.2 text-[9px] font-bold text-white uppercase tracking-wider">
                  New
                </span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    pathname.startsWith("/admin")
                      ? "bg-slate-900 text-white font-semibold"
                      : "text-amber-600 hover:bg-amber-500/10"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* User Account / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-border/80 bg-background/60 px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <div className="h-7 w-7 rounded-lg bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold text-xs uppercase">
                    {profile?.full_name?.charAt(0) || user.email.charAt(0)}
                  </div>
                  <span className="hidden sm:inline-block max-w-[120px] truncate">
                    {profile?.full_name || user.email.split("@")[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                {/* Dropdown */}
                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl z-50 animate-in fade-in zoom-in-95"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="text-sm font-semibold truncate">
                        {profile?.full_name || user.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-brand-500/10 text-brand-600 uppercase">
                        {profile?.role || "Customer"}
                      </span>
                    </div>

                    <Link
                      href="/account"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-muted text-foreground transition-colors"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      My Orders & Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-muted text-amber-600 font-medium transition-colors"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-destructive/10 text-destructive transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAuthModalOpen(true)}
                className="rounded-xl border-border/80 font-medium hidden sm:flex items-center gap-1.5"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Sign In
              </Button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-background/50 hover:bg-accent text-foreground transition-all hover:scale-105"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-white shadow-sm animate-in zoom-in">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 text-foreground"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-card px-4 py-4 space-y-2 animate-in slide-in-from-top-4">
            <Link
              href="/designs"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-medium text-foreground hover:bg-muted"
            >
              Curated Catalog
            </Link>
            <Link
              href="/custom"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-medium text-brand-600 bg-brand-500/10"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Custom Print Studio
              </span>
              <span className="text-xs bg-brand-500 text-white px-2 py-0.5 rounded-full font-bold">
                Design Now
              </span>
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-medium text-amber-600 hover:bg-amber-500/10"
              >
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
            {!user && (
              <Button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="w-full mt-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl"
              >
                Sign In / Sign Up
              </Button>
            )}
          </div>
        )}
      </header>

      {/* Auth Modal & Cart Drawer */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
