"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Sparkles, Shield, UserCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginWithEmail, signupWithEmail, loginWithGoogle, loginAsDemoAdmin, loginAsDemoCustomer } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (tab === "login") {
      const ok = await loginWithEmail(email, password);
      if (ok) onClose();
    } else {
      const ok = await signupWithEmail(email, password, name);
      if (ok) onClose();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-2xl sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight">
            {tab === "login" ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {tab === "login"
              ? "Access your saved prints and track deliveries"
              : "Join Posterwala for gallery-grade prints"}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-muted p-1 mb-6">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              tab === "login"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              tab === "signup"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Quick Demo Switcher */}
        <div className="mb-6 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-3.5 text-xs">
          <span className="font-semibold text-brand-700 block mb-2">⚡ Quick Demo One-Click Access:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                loginAsDemoAdmin();
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-card border border-brand-500/30 text-brand-700 font-medium hover:bg-brand-500 hover:text-white transition-all shadow-sm"
            >
              <Shield className="h-3.5 w-3.5" />
              Admin Role
            </button>
            <button
              type="button"
              onClick={() => {
                loginAsDemoCustomer();
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-card border border-brand-500/30 text-brand-700 font-medium hover:bg-brand-500 hover:text-white transition-all shadow-sm"
            >
              <UserCheck className="h-3.5 w-3.5" />
              Customer Role
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "signup" && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium h-11 rounded-xl"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Please wait..."
              : tab === "login"
              ? "Sign In"
              : "Create Account"}
          </Button>
        </form>

        <div className="relative my-6 text-center text-xs text-muted-foreground">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative bg-card px-3">or continue with</span>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-11 rounded-xl flex items-center justify-center gap-2 border-border/80"
          onClick={() => {
            loginWithGoogle();
            onClose();
          }}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google
        </Button>
      </div>
    </div>
  );
}
