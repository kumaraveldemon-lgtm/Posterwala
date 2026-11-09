"use client";

import React, { useState } from "react";
import { MOCK_PRODUCTS, MOCK_PRODUCT_SIZES } from "@/lib/mock-data";
import { ProductSize } from "@/types/database.types";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Edit3, Settings } from "lucide-react";

export default function AdminProductsPage() {
  const [sizes, setSizes] = useState<ProductSize[]>(MOCK_PRODUCT_SIZES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  const startEdit = (size: ProductSize) => {
    setEditingId(size.id);
    setEditPrice(size.price_inr);
  };

  const saveEdit = (id: string) => {
    setSizes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, price_inr: editPrice } : s))
    );
    setEditingId(null);
    toast.success("Price updated successfully!");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black font-display tracking-tight text-foreground">
          Manage Products, Sizes & Pricing
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure dimensions, 300 DPI specifications, bleed, and base prices in INR.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {MOCK_PRODUCTS.map((product) => {
          const productSizes = sizes.filter((s) => s.product_id === product.id);

          return (
            <Card key={product.id} className="flex flex-col">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <Badge variant="brand">{product.name}</Badge>
                  <span className="text-xs text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <CardTitle className="text-lg mt-2">{product.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {product.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 flex-1 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Sizes & Print Specs (300 DPI)
                </span>

                {productSizes.map((size) => (
                  <div
                    key={size.id}
                    className="rounded-xl border border-border/80 bg-background/50 p-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-foreground text-sm">{size.name}</p>
                      <p className="text-muted-foreground mt-0.5">
                        {size.dimensions_cm} • {size.width_px_300dpi}x{size.height_px_300dpi}px
                      </p>
                      <p className="text-muted-foreground text-[10px]">
                        Bleed: {size.bleed_mm} mm
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      {editingId === size.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="h-8 w-20 px-2 text-xs font-bold"
                          />
                          <button
                            onClick={() => saveEdit(size.id)}
                            className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm">
                            {formatINR(size.price_inr)}
                          </span>
                          <button
                            onClick={() => startEdit(size)}
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
