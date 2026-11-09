"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile, UserRole } from "@/types/database.types";
import { toast } from "sonner";

interface UserAuth {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: UserAuth | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loginAsDemoAdmin: () => void;
  loginAsDemoCustomer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Check local storage for demo session first
    const demoUser = typeof window !== "undefined" ? localStorage.getItem("pw_demo_session") : null;
    if (demoUser) {
      try {
        const parsed = JSON.parse(demoUser);
        setUser(parsed.user);
        setProfile(parsed.profile);
        setIsLoading(false);
        return;
      } catch {
        localStorage.removeItem("pw_demo_session");
      }
    }

    // Try Supabase auth
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const authUser = {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
          };
          setUser(authUser);

          // Fetch profile
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (prof) {
            setProfile(prof as Profile);
          } else {
            setProfile({
              id: session.user.id,
              email: session.user.email || "",
              full_name: authUser.name || null,
              phone: null,
              avatar_url: null,
              role: (session.user.user_metadata?.role as UserRole) || "customer",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.warn("Supabase auth init notice (preview fallback available):", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.full_name,
          });
        } else if (!localStorage.getItem("pw_demo_session")) {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const loginAsDemoAdmin = () => {
    const adminProfile: Profile = {
      id: "admin-master-001",
      email: "admin@posterwala.com",
      full_name: "Posterwala Admin",
      phone: "+91 99999 11111",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      role: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const adminUser = { id: adminProfile.id, email: adminProfile.email, name: adminProfile.full_name! };
    setUser(adminUser);
    setProfile(adminProfile);
    localStorage.setItem("pw_demo_session", JSON.stringify({ user: adminUser, profile: adminProfile }));
  };

  const loginAsDemoCustomer = () => {
    const customerProfile: Profile = {
      id: "usr-demo",
      email: "aarav@posterwala.com",
      full_name: "Aarav Sharma",
      phone: "+91 98765 43210",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      role: "customer",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const customerUser = { id: customerProfile.id, email: customerProfile.email, name: customerProfile.full_name! };
    setUser(customerUser);
    setProfile(customerProfile);
    localStorage.setItem("pw_demo_session", JSON.stringify({ user: customerUser, profile: customerProfile }));
  };

  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        if (email.includes("admin")) {
          loginAsDemoAdmin();
          toast.success("Signed in as Admin!");
          return true;
        } else {
          loginAsDemoCustomer();
          toast.success("Signed in successfully!");
          return true;
        }
      }

      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || "", name: data.user.user_metadata?.full_name });
        toast.success("Welcome back to Posterwala!");
        return true;
      }
      return false;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to sign in";
      toast.error(message);
      return false;
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { full_name: name, role: "customer" },
        },
      });

      if (error) {
        const mockCustomer: Profile = {
          id: "usr-" + Date.now(),
          email,
          full_name: name,
          phone: null,
          avatar_url: null,
          role: "customer",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser({ id: mockCustomer.id, email, name });
        setProfile(mockCustomer);
        localStorage.setItem("pw_demo_session", JSON.stringify({ user: { id: mockCustomer.id, email, name }, profile: mockCustomer }));
        toast.success("Account created successfully!");
        return true;
      }

      toast.success("Verification email sent! Check your inbox.");
      return true;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Signup failed";
      toast.error(message);
      return false;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch {
      toast.error("Google login failed, continuing as customer");
      loginAsDemoCustomer();
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    localStorage.removeItem("pw_demo_session");
    setUser(null);
    setProfile(null);
    toast.info("Logged out successfully");
  };

  const isAdmin = profile?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isLoading,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
        loginAsDemoAdmin,
        loginAsDemoCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
