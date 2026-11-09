"use client";

import React, { useState, useMemo } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MOCK_DESIGNS, MOCK_PRODUCTS, MOCK_PRODUCT_SIZES } from "@/lib/mock-data";
import { useCart } from "@/context/cart-context";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Layers,
  ArrowLeft,
  Maximize2,
  Info,
} from "lucide-react";

type FrameType = "wood" | "black" | "white" | "none";
type BackdropType = "wall" | "studio";

export default function DesignDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const design = useMemo(() => {
    return MOCK_DESIGNS.find((d) => d.slug === slug);
  }, [slug]);

  const { addItem } = useCart();

  // Customization states
  const [selectedProductId, setSelectedProductId] = useState<string>("p1"); // default Poster
  const [selectedFinish, setSelectedFinish] = useState<"matte" | "glossy">("matte");
  const [quantity, setQuantity] = useState(1);
  const [selectedFrame, setSelectedFrame] = useState<FrameType>("wood");
  const [backdrop, setBackdrop] = useState<BackdropType>("wall");

  // Filter sizes for chosen product
  const availableSizes = useMemo(() => {
    return MOCK_PRODUCT_SIZES.filter((s) => s.product_id === selectedProductId);
  }, [selectedProductId]);

  const [selectedSizeId, setSelectedSizeId] = useState<string>(
    availableSizes[0]?.id || "s1"
  );

  // Sync size when product changes
  React.useEffect(() => {
    if (availableSizes.length > 0) {
      setSelectedSizeId(availableSizes[0].id);
    }
  }, [selectedProductId, availableSizes]);

  if (!design) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold font-display">Design Not Found</h2>
        <p className="text-muted-foreground mt-2">The requested artwork does not exist or has been removed.</p>
        <Link href="/designs" className="mt-6 inline-block">
          <Button className="bg-brand-500 text-white rounded-xl">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const currentProduct = MOCK_PRODUCTS.find((p) => p.id === selectedProductId) || MOCK_PRODUCTS[0];
  const currentSize = availableSizes.find((s) => s.id === selectedSizeId) || availableSizes[0];
  const unitPrice = currentSize ? currentSize.price_inr : design.starting_price;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addItem({
      design_id: design.id,
      design: design,
      product_id: currentProduct.id,
      product: currentProduct,
      size_id: currentSize.id,
      size: currentSize,
      finish: selectedFinish,
      quantity,
      price_inr: unitPrice,
      preview_url: design.thumbnail_storage_path || design.watermark_storage_path,
      title: design.title,
    });
  };

  return (
    <div className="min-h-screen py-8 lg:py-14">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link href="/designs" className="hover:text-foreground flex items-center gap-1 font-medium">
            <ArrowLeft className="h-3.5 w-3.5" />
            Catalog
          </Link>
          <span>/</span>
          {design.category && (
            <>
              <Link href={`/designs?category=${design.category.slug}`} className="hover:text-foreground">
                {design.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground font-semibold truncate max-w-[200px]">
            {design.title}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* ========================================================= */}
          {/* LEFT: LARGE INTERACTIVE MOCKUP & WALL FRAME SIMULATOR */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-28">
            {/* View Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-card/60 backdrop-blur border border-border/80 rounded-2xl p-2.5 px-4 text-xs">
              {/* Frame selector */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-muted-foreground mr-1">Frame:</span>
                <button
                  onClick={() => setSelectedFrame("wood")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedFrame === "wood" ? "bg-amber-950 text-amber-100 shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Dark Walnut
                </button>
                <button
                  onClick={() => setSelectedFrame("black")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedFrame === "black" ? "bg-black text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Matte Black
                </button>
                <button
                  onClick={() => setSelectedFrame("white")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedFrame === "white" ? "bg-white text-neutral-900 border border-border shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Pure White
                </button>
                <button
                  onClick={() => setSelectedFrame("none")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedFrame === "none" ? "bg-muted text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Unframed
                </button>
              </div>

              {/* Backdrop toggle */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setBackdrop(backdrop === "wall" ? "studio" : "wall")}
                  className="px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-foreground font-medium transition-colors"
                >
                  {backdrop === "wall" ? "Switch to Clean Studio" : "Simulate Room Wall"}
                </button>
              </div>
            </div>

            {/* Simulated Stage / Wall Canvas */}
            <div
              className={`relative min-h-[460px] sm:min-h-[580px] w-full rounded-3xl overflow-hidden flex items-center justify-center p-8 sm:p-14 border border-border/80 transition-colors duration-500 ${
                backdrop === "wall"
                  ? "bg-[#e8e4dc] dark:bg-[#1a1c22] bg-[radial-gradient(#d3cdc3_1px,transparent_1px)] dark:bg-[radial-gradient(#2a2e38_1px,transparent_1px)] [background-size:20px_20px]"
                  : "bg-muted/40"
              }`}
            >
              {/* Soft Room Lamp Shadow from Top */}
              {backdrop === "wall" && (
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/10 dark:from-black/40 to-transparent pointer-events-none" />
              )}

              {/* Framed Artwork Container */}
              <div
                className={`relative transition-all duration-300 max-w-[340px] sm:max-w-[420px] w-full aspect-[3/4] bg-white ${
                  selectedFrame === "wood"
                    ? "frame-wood rounded-sm"
                    : selectedFrame === "black"
                    ? "frame-black rounded-sm"
                    : selectedFrame === "white"
                    ? "frame-white rounded-sm"
                    : "shadow-2xl rounded-lg"
                }`}
              >
                {/* Mount / Matting Border for Framed */}
                <div
                  className={`h-full w-full overflow-hidden ${
                    selectedFrame !== "none" ? "p-3 sm:p-5 bg-white" : ""
                  }`}
                >
                  <div className="relative h-full w-full overflow-hidden bg-neutral-900">
                    <Image
                      src={design.watermark_storage_path || design.thumbnail_storage_path}
                      alt={design.title}
                      fill
                      priority
                      className="object-cover"
                    />

                    {/* Paper Finish Sheen Simulation */}
                    {selectedFinish === "glossy" && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />
                    )}
                  </div>
                </div>

                {/* Polaroid lower caption frame if Polaroid Pack is selected */}
                {currentProduct.slug === "polaroid-pack" && (
                  <div className="absolute -bottom-8 right-4 bg-white px-3 py-1.5 rounded-lg polaroid-shadow text-[11px] font-display font-semibold text-neutral-800">
                    Includes 12 Retro Prints
                  </div>
                )}
              </div>
            </div>

            <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1">
              <Info className="h-3.5 w-3.5 text-brand-500" />
              Watermark is removed on the printed product. Prints are created at 300 DPI on archival cardstock.
            </p>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: CUSTOMIZATION OPTIONS, SIZES & ADD TO CART */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="brand">{design.category?.name || "Curated Art"}</Badge>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  In Stock • Dispatches in 24h
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-foreground">
                {design.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {design.description}
              </p>
            </div>

            {/* 1. Product Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                1. Select Product Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {MOCK_PRODUCTS.map((prod) => {
                  const active = selectedProductId === prod.id;
                  return (
                    <button
                      key={prod.id}
                      onClick={() => setSelectedProductId(prod.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        active
                          ? "border-brand-500 bg-brand-500/10 text-brand-700 font-bold shadow-sm"
                          : "border-border/80 bg-card hover:bg-muted text-foreground font-medium"
                      }`}
                    >
                      <p className="text-xs sm:text-sm font-semibold">{prod.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Size Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  2. Select Size (300 DPI)
                </label>
                <span className="text-[11px] text-brand-600 font-semibold">
                  3mm Full Bleed Included
                </span>
              </div>
              <div className="space-y-2">
                {availableSizes.map((size) => {
                  const active = selectedSizeId === size.id;
                  return (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSizeId(size.id)}
                      className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                        active
                          ? "border-brand-500 bg-brand-500/5 shadow-sm"
                          : "border-border/80 bg-card hover:bg-muted text-foreground"
                      }`}
                    >
                      <div className="text-left">
                        <span className={`text-sm font-semibold block ${active ? "text-brand-700" : "text-foreground"}`}>
                          {size.name}
                        </span>
                        <span className="text-xs text-muted-foreground mt-0.5 block">
                          {size.dimensions_cm} ({size.width_px_300dpi} x {size.height_px_300dpi} px)
                        </span>
                      </div>
                      <span className="font-bold text-sm text-foreground">
                        {formatINR(size.price_inr)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Paper Finish Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                3. Paper Finish
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedFinish("matte")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedFinish === "matte"
                      ? "border-brand-500 bg-brand-500/10 text-brand-700 shadow-sm"
                      : "border-border/80 bg-card hover:bg-muted text-foreground"
                  }`}
                >
                  <p className="font-bold text-xs sm:text-sm">Velvet Matte</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Zero glare, soft velvety feel, ideal for rooms with lamps.
                  </p>
                </button>

                <button
                  onClick={() => setSelectedFinish("glossy")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedFinish === "glossy"
                      ? "border-brand-500 bg-brand-500/10 text-brand-700 shadow-sm"
                      : "border-border/80 bg-card hover:bg-muted text-foreground"
                  }`}
                >
                  <p className="font-bold text-xs sm:text-sm">Lustre Glossy</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    High contrast, deep blacks, vivid photographic colors.
                  </p>
                </button>
              </div>
            </div>

            {/* 4. Quantity & Live Price */}
            <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Quantity</span>
                  <div className="flex items-center rounded-xl border border-border bg-background mt-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-muted-foreground hover:text-foreground font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 text-sm font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 text-muted-foreground hover:text-foreground font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted-foreground block font-medium">Total Price (INR)</span>
                  <span className="text-2xl font-black font-display text-brand-600">
                    {formatINR(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Add to Cart CTA */}
              <Button
                onClick={handleAddToCart}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold h-13 rounded-2xl text-base shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 group"
              >
                <ShoppingBag className="h-5 w-5" />
                Add to Cart • {formatINR(totalPrice)}
              </Button>
            </div>

            {/* Quality & Shipping Badges */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                300 GSM Archival Cardstock
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-600" />
                Heavy Kraft Tube Packaging
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
