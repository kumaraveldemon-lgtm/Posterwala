"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { MOCK_PRODUCTS, MOCK_PRODUCT_SIZES } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  UploadCloud,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Sliders,
  Type,
  Maximize,
  ShieldCheck,
  Eye,
  Layers,
  ArrowRight,
} from "lucide-react";
import { CustomEditorConfig } from "@/types/database.types";

// Dynamic import KonvaEditor without SSR
const KonvaEditor = dynamic(() => import("@/components/custom/konva-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-[460px] w-full max-w-[420px] rounded-2xl bg-neutral-900 border border-border flex items-center justify-center text-muted-foreground text-xs animate-pulse">
      Loading Custom Konva Studio...
    </div>
  ),
});

type FilterType = "none" | "grayscale" | "vintage" | "sketch";
type FrameType = "wood" | "black" | "white" | "none";

export default function CustomStudioPage() {
  const { user } = useAuth();
  const { addItem } = useCart();

  // Selected Product & Size
  const [selectedProductId, setSelectedProductId] = useState<string>("p1"); // Poster
  const availableSizes = useMemo(() => {
    return MOCK_PRODUCT_SIZES.filter((s) => s.product_id === selectedProductId);
  }, [selectedProductId]);

  const [selectedSizeId, setSelectedSizeId] = useState<string>(availableSizes[0]?.id || "s1");
  const [selectedFinish, setSelectedFinish] = useState<"matte" | "glossy">("matte");
  const [selectedFrame, setSelectedFrame] = useState<FrameType>("black");

  // Sync size when product format changes
  useEffect(() => {
    if (availableSizes.length > 0) {
      setSelectedSizeId(availableSizes[0].id);
    }
  }, [selectedProductId, availableSizes]);

  // Uploaded original file state
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80"
  );
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 1200, height: 1600 });
  const [isUploading, setIsUploading] = useState(false);

  // Editor states
  const [activeFilter, setActiveFilter] = useState<FilterType>("none");
  const [customText, setCustomText] = useState("");
  const [textFont, setTextFont] = useState("sans-serif");
  const [textColor, setTextColor] = useState("#ffffff");
  const [editorConfig, setEditorConfig] = useState<CustomEditorConfig>({});

  // Handle local image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 25 * 1024 * 1024) {
      toast.error("File exceeds 25 MB limit");
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(selected.type)) {
      toast.error("Please upload a valid JPG, PNG, WebP or PDF");
      return;
    }

    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setImageUrl(objectUrl);

    // Read natural dimensions
    const img = new window.Image();
    img.src = objectUrl;
    img.onload = () => {
      setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    toast.success("Image uploaded to Studio! Check resolution below.");
  };

  const currentProduct = MOCK_PRODUCTS.find((p) => p.id === selectedProductId) || MOCK_PRODUCTS[0];
  const currentSize = availableSizes.find((s) => s.id === selectedSizeId) || availableSizes[0];
  const unitPrice = currentSize ? currentSize.price_inr : 299;

  // Calculate resolution DPI based on target size dimensions in inches
  const calculatedDpi = useMemo(() => {
    // Estimate physical width in inches from dimensions_cm or size names
    let targetWidthInches = 8.3; // A4 default
    if (currentSize?.name.includes("A3")) targetWidthInches = 11.7;
    if (currentSize?.name.includes("A2")) targetWidthInches = 16.5;
    if (currentSize?.name.includes("4 x 6")) targetWidthInches = 4.0;
    if (currentSize?.name.includes("5 x 7")) targetWidthInches = 5.0;
    if (currentSize?.name.includes("8 x 10")) targetWidthInches = 8.0;
    if (currentSize?.name.includes("3.5 x 4.2")) targetWidthInches = 3.5;

    const dpi = Math.round(naturalDimensions.width / targetWidthInches);
    return Math.max(72, dpi);
  }, [naturalDimensions, currentSize]);

  const isDpiWarning = calculatedDpi < 150;

  // Add to cart handler (uploads original file and stores config)
  const handleAddToCart = async () => {
    setIsUploading(true);

    try {
      let uploadId = null;

      // If user uploaded a new file, save the master ORIGINAL to server
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sizeId", currentSize.id);
        formData.append("calculatedDpi", calculatedDpi.toString());
        if (user?.id) formData.append("userId", user.id);

        const res = await fetch("/api/custom/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await res.json();
        if (!res.ok) {
          throw new Error(uploadData.error || "Failed to upload image");
        }
        uploadId = uploadData.upload?.id;
      }

      // Add to cart
      addItem({
        upload_id: uploadId,
        product_id: currentProduct.id,
        product: currentProduct,
        size_id: currentSize.id,
        size: currentSize,
        finish: selectedFinish,
        quantity: 1,
        price_inr: unitPrice,
        preview_url: imageUrl,
        title: customText.trim() ? `Custom: "${customText}"` : `Custom ${currentProduct.name}`,
        custom_config: {
          filter: activeFilter,
          text: customText.trim()
            ? { content: customText, fontFamily: textFont, fontSize: 16, color: textColor, position: { x: 20, y: 300 } }
            : undefined,
          ...editorConfig,
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to add to cart");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 lg:py-12 pb-24">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Studio Banner */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Interactive Custom Studio
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-foreground">
            Design Your Custom Print
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Upload personal photos or digital art. Crop, zoom, add text, apply vintage filters, and verify DPI resolution.
          </p>
        </div>

        {/* DPI Warning / Status Guard */}
        <div className="mb-8">
          {isDpiWarning ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3 text-amber-800 dark:text-amber-200 animate-in fade-in">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Resolution Warning: {calculatedDpi} DPI</h4>
                <p className="text-xs mt-0.5 leading-relaxed">
                  Your image is calculated at ~{calculatedDpi} DPI for <strong>{currentSize?.name}</strong>, which is below the 150 DPI minimum recommended for crisp gallery printing. Your print may appear soft or pixelated. We recommend selecting a smaller size (e.g. Polaroid Pack or 4x6&quot;) or uploading a higher-resolution file.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-3 text-emerald-800 dark:text-emerald-200 animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Resolution Verified: {calculatedDpi} DPI</h4>
                <p className="text-xs mt-0.5 leading-relaxed">
                  Crisp gallery resolution confirmed for <strong>{currentSize?.name}</strong>. Your original image has plenty of detail for sharp printing with anti-fade inks.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* ========================================================= */}
          {/* LEFT: KONVA INTERACTIVE CANVAS & FRAME PREVIEW */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-28">
            {/* Frame Simulator Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border/80 rounded-2xl p-2.5 px-4 text-xs shadow-sm">
              <span className="font-semibold text-muted-foreground">Preview Frame:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedFrame("black")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedFrame === "black" ? "bg-black text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Matte Black
                </button>
                <button
                  onClick={() => setSelectedFrame("wood")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedFrame === "wood" ? "bg-amber-950 text-amber-100" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Dark Walnut
                </button>
                <button
                  onClick={() => setSelectedFrame("white")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedFrame === "white" ? "bg-white text-neutral-900 border border-border" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  White
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
            </div>

            {/* Canvas Area with Frame */}
            <div className="relative rounded-3xl bg-[#ece7df] dark:bg-[#181a20] p-6 sm:p-10 border border-border flex items-center justify-center">
              <div
                className={`transition-all duration-300 ${
                  selectedFrame === "wood"
                    ? "frame-wood rounded-sm"
                    : selectedFrame === "black"
                    ? "frame-black rounded-sm"
                    : selectedFrame === "white"
                    ? "frame-white rounded-sm"
                    : "shadow-2xl rounded-lg"
                }`}
              >
                <div className={`${selectedFrame !== "none" ? "p-3 sm:p-4 bg-white" : ""}`}>
                  <KonvaEditor
                    imageSrc={imageUrl}
                    filter={activeFilter}
                    textConfig={{
                      content: customText,
                      fontFamily: textFont,
                      fontSize: 16,
                      color: textColor,
                    }}
                    onConfigChange={(cfg) => setEditorConfig(cfg)}
                  />
                </div>
              </div>
            </div>

            {/* Original File Safety Notice */}
            <div className="rounded-2xl border border-border/80 bg-card p-3.5 text-xs text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Original File Preservation:</strong> We always store your untouched master file at native resolution. Filters and text are rendered as vector print instructions.
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: UPLOAD, PRODUCT, SIZE, FILTERS & ADD TO CART */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. File Upload Dropzone */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <UploadCloud className="h-5 w-5 text-brand-600" />
                  1. Upload Your Photo or Art (Max 25 MB)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border hover:border-brand-500/60 p-6 text-center cursor-pointer transition-colors bg-background/50">
                  <UploadCloud className="h-8 w-8 text-brand-500 mb-2" />
                  <p className="text-sm font-semibold text-foreground">
                    {file ? file.name : "Click to select JPG, PNG, or PDF"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Original dimensions: {naturalDimensions.width} x {naturalDimensions.height} px
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
              </CardContent>
            </Card>

            {/* 2. Choose Product Format & Size */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-5 w-5 text-brand-600" />
                  2. Select Format & Size
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Format Pills */}
                <div className="grid grid-cols-3 gap-2">
                  {MOCK_PRODUCTS.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => setSelectedProductId(prod.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        selectedProductId === prod.id
                          ? "border-brand-500 bg-brand-500/10 text-brand-700 shadow-sm"
                          : "border-border bg-card hover:bg-muted text-foreground"
                      }`}
                    >
                      {prod.name}
                    </button>
                  ))}
                </div>

                {/* Size options */}
                <div className="space-y-2">
                  {availableSizes.map((size) => {
                    const active = selectedSizeId === size.id;
                    return (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSizeId(size.id)}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          active
                            ? "border-brand-500 bg-brand-500/5 text-brand-700 font-bold"
                            : "border-border bg-card hover:bg-muted text-foreground"
                        }`}
                      >
                        <div className="text-left">
                          <span className="block font-semibold">{size.name}</span>
                          <span className="text-[11px] text-muted-foreground font-normal">
                            {size.dimensions_cm}
                          </span>
                        </div>
                        <span className="font-bold text-sm text-foreground">
                          {formatINR(size.price_inr)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Paper Finish */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => setSelectedFinish("matte")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      selectedFinish === "matte"
                        ? "border-brand-500 bg-brand-500/10 text-brand-700"
                        : "border-border bg-card hover:bg-muted text-foreground"
                    }`}
                  >
                    Velvet Matte
                  </button>
                  <button
                    onClick={() => setSelectedFinish("glossy")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      selectedFinish === "glossy"
                        ? "border-brand-500 bg-brand-500/10 text-brand-700"
                        : "border-border bg-card hover:bg-muted text-foreground"
                    }`}
                  >
                    Lustre Glossy
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* 3. Browser-Applied Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-brand-600" />
                  3. Color Filters (Browser Applied)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "none", label: "Original" },
                    { id: "grayscale", label: "B & W" },
                    { id: "vintage", label: "Vintage" },
                    { id: "sketch", label: "Pencil Sketch" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilter(f.id as FilterType)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        activeFilter === f.id
                          ? "border-brand-500 bg-brand-500/10 text-brand-700 shadow-sm"
                          : "border-border bg-card hover:bg-muted text-foreground"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 4. Optional Text Overlay */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Type className="h-5 w-5 text-brand-600" />
                  4. Optional Text & Caption
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="e.g. Goa Memories &apos;24, Chapter One..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="rounded-xl text-xs"
                />
                <div className="flex gap-2">
                  <select
                    value={textFont}
                    onChange={(e) => setTextFont(e.target.value)}
                    className="flex-1 h-9 rounded-xl border border-input bg-card px-2.5 text-xs"
                  >
                    <option value="sans-serif">Modern Sans-Serif</option>
                    <option value="Georgia, serif">Editorial Serif</option>
                    <option value="Courier New, monospace">Retro Typewriter</option>
                  </select>

                  <select
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-9 rounded-xl border border-input bg-card px-2.5 text-xs"
                  >
                    <option value="#ffffff">White Text</option>
                    <option value="#18181b">Black Text</option>
                    <option value="#f76926">Brand Orange</option>
                    <option value="#fef08a">Vintage Cream</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Total and Add to Cart */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground font-medium block">Custom Print Total</span>
                  <span className="text-xs font-semibold text-emerald-600">300 DPI Archival Guarantee</span>
                </div>
                <span className="text-2xl font-black font-display text-brand-600">
                  {formatINR(unitPrice)}
                </span>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={isUploading}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold h-13 rounded-2xl text-base shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    Uploading Original Master...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" />
                    Add Custom Print to Cart • {formatINR(unitPrice)}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
