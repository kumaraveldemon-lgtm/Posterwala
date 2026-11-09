"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem } from "@/types/database.types";
import { toast } from "sonner";

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id" | "created_at">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pw_cart_items");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load cart from storage", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("pw_cart_items", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addItem = (itemData: Omit<CartItem, "id" | "created_at">) => {
    const newItem: CartItem = {
      ...itemData,
      id: "cart-" + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };

    setItems((prev) => {
      // If exact same design/upload + product + size + finish + config exists, increment
      const existingIdx = prev.findIndex(
        (i) =>
          i.design_id === newItem.design_id &&
          i.upload_id === newItem.upload_id &&
          i.product_id === newItem.product_id &&
          i.size_id === newItem.size_id &&
          i.finish === newItem.finish &&
          JSON.stringify(i.custom_config) === JSON.stringify(newItem.custom_config)
      );

      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += newItem.quantity;
        return copy;
      }
      return [...prev, newItem];
    });

    toast.success(`Added ${itemData.title || itemData.product?.name || "item"} to cart!`);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.info("Item removed from cart");
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("pw_cart_items");
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price_inr * item.quantity, 0);
  // Free shipping above ₹499, else ₹60
  const shippingFee = subtotal > 499 || subtotal === 0 ? 0 : 60;
  const totalAmount = subtotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        shippingFee,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
